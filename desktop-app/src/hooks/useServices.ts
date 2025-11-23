/**
 * Custom Hook for Service Management
 */

import { useState, useEffect, useCallback } from 'react';
import { toast, withRetry, ServiceError } from '../utils';

export interface Service {
  id: string;
  name: string;
  path: string;
  port: number;
  autostart: boolean;
  icon: string;
  category: 'core' | 'creative' | 'analytics' | 'network';
}

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'starting' | 'stopping';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceStatus, setServiceStatus] = useState<Record<string, ServiceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    loadServices();

    // Set up event listeners
    window.electronAPI.onServiceStatusChanged((event) => {
      setServiceStatus(prev => ({
        ...prev,
        [event.serviceId]: event.status
      }));
    });

    // Poll service status every 10 seconds (backup for missed events)
    const interval = setInterval(refreshAllStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const svcs = await withRetry(
        () => window.electronAPI.getServices(),
        {
          retries: 3,
          delay: 1000,
          onRetry: (attempt) => {
            console.log(`Retrying service load, attempt ${attempt}`);
          }
        }
      );

      setServices(svcs);

      // Get initial status
      await refreshAllStatus();

      toast.success('Services loaded', `Found ${svcs.length} services`);
    } catch (err: any) {
      const errorMsg = 'Failed to load services';
      setError(errorMsg);
      toast.error(errorMsg, err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllStatus = async () => {
    try {
      const status = await window.electronAPI.getAllServiceStatus();
      setServiceStatus(status as Record<string, ServiceStatus>);
    } catch (err) {
      console.error('Failed to refresh service status:', err);
    }
  };

  const startService = useCallback(async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      // Optimistic update
      setServiceStatus(prev => ({ ...prev, [serviceId]: 'starting' }));

      const success = await withRetry(
        () => window.electronAPI.startService(serviceId),
        {
          retries: 2,
          delay: 2000,
          onRetry: (attempt) => {
            toast.info('Retrying...', `Starting ${service.name}, attempt ${attempt + 1}`);
          }
        }
      );

      if (success) {
        setServiceStatus(prev => ({ ...prev, [serviceId]: 'running' }));
        toast.success('Service started', `${service.icon} ${service.name} is now running`);
      } else {
        throw new ServiceError('Failed to start service', serviceId);
      }
    } catch (err: any) {
      setServiceStatus(prev => ({ ...prev, [serviceId]: 'error' }));
      toast.error('Failed to start service', `${service.icon} ${service.name}: ${err.message}`);
    }
  }, [services]);

  const stopService = useCallback(async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      // Optimistic update
      setServiceStatus(prev => ({ ...prev, [serviceId]: 'stopping' }));

      const success = await window.electronAPI.stopService(serviceId);

      if (success) {
        setServiceStatus(prev => ({ ...prev, [serviceId]: 'stopped' }));
        toast.info('Service stopped', `${service.icon} ${service.name} has been stopped`);
      } else {
        throw new ServiceError('Failed to stop service', serviceId);
      }
    } catch (err: any) {
      toast.error('Failed to stop service', `${service.icon} ${service.name}: ${err.message}`);
      // Refresh status to get accurate state
      await refreshAllStatus();
    }
  }, [services]);

  const restartService = useCallback(async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      setServiceStatus(prev => ({ ...prev, [serviceId]: 'stopping' }));

      const success = await withRetry(
        () => window.electronAPI.restartService(serviceId),
        { retries: 2, delay: 2000 }
      );

      if (success) {
        setServiceStatus(prev => ({ ...prev, [serviceId]: 'running' }));
        toast.success('Service restarted', `${service.icon} ${service.name} has been restarted`);
      } else {
        throw new ServiceError('Failed to restart service', serviceId);
      }
    } catch (err: any) {
      toast.error('Failed to restart service', `${service.icon} ${service.name}: ${err.message}`);
      await refreshAllStatus();
    }
  }, [services]);

  const startAll = useCallback(async () => {
    toast.info('Starting all services...', 'This may take a moment');

    for (const service of services) {
      if (serviceStatus[service.id] !== 'running') {
        await startService(service.id);
        // Stagger starts to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast.success('All services started', 'System is ready');
  }, [services, serviceStatus, startService]);

  const stopAll = useCallback(async () => {
    toast.info('Stopping all services...', 'Please wait');

    for (const service of services) {
      if (serviceStatus[service.id] === 'running') {
        await stopService(service.id);
      }
    }

    toast.success('All services stopped', 'System is offline');
  }, [services, serviceStatus, stopService]);

  return {
    services,
    serviceStatus,
    loading,
    error,
    startService,
    stopService,
    restartService,
    startAll,
    stopAll,
    refreshAllStatus,
    reload: loadServices
  };
}
