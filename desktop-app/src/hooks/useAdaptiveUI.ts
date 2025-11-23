/**
 * Custom Hook for Adaptive UI Integration
 *
 * Connects to the Adaptive Meta-UI service (port 8919) to:
 * - Track user interactions
 * - Send feedback on AI suggestions
 * - Enable self-improvement loop
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '../utils';

interface AdaptiveUIStats {
  components: number;
  connectedClients: number;
  sessions: number;
  interactions: number;
  events: number;
}

interface InteractionEvent {
  type: string;
  componentId?: string;
  action?: string;
  data?: any;
}

export function useAdaptiveUI(port: number = 8919) {
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<AdaptiveUIStats | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(`ws://localhost:${port}/ws`);

      socket.onopen = () => {
        console.log('📡 Connected to Adaptive UI');
        setConnected(true);
        ws.current = socket;

        // Clear reconnect timeout if connection succeeded
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'init') {
            console.log('🎨 Adaptive UI initialized', data);
          } else if (data.type === 'ai.suggestion') {
            toast.info('AI Suggestion', data.suggestion);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('📡 Disconnected from Adaptive UI');
        setConnected(false);
        ws.current = null;

        // Attempt reconnection after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect to Adaptive UI...');
          connect();
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect to Adaptive UI:', error);
    }
  }, [port]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  }, []);

  // Track component interaction
  const trackInteraction = useCallback((event: InteractionEvent) => {
    if (!connected || !ws.current) {
      // If not connected via WebSocket, try HTTP fallback
      return trackInteractionHTTP(event);
    }

    ws.current.send(JSON.stringify({
      type: 'component.interact',
      componentId: event.componentId || 'ai-suggestions',
      action: event.action,
      data: event.data,
      timestamp: Date.now()
    }));
  }, [connected]);

  // HTTP fallback for tracking when WebSocket is not available
  const trackInteractionHTTP = async (event: InteractionEvent) => {
    try {
      // For now, just log it - we could implement an HTTP endpoint for tracking
      console.log('📊 Tracked interaction (HTTP fallback):', event);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  // Fetch current stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:${port}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch Adaptive UI stats:', error);
    }
  }, [port]);

  // Trigger AI adaptation
  const triggerAdaptation = useCallback(async () => {
    if (connected && ws.current) {
      ws.current.send(JSON.stringify({
        type: 'ai.adapt'
      }));
      toast.info('AI Adaptation', 'Analyzing usage patterns...');
    }
  }, [connected]);

  // Track suggestion implementation
  const trackSuggestionImplemented = useCallback((suggestionId: string, suggestionTitle: string) => {
    trackInteraction({
      type: 'suggestion.implemented',
      componentId: 'ai-suggestions',
      action: 'implement',
      data: { suggestionId, suggestionTitle }
    });

    toast.success('Feedback Tracked', 'Your implementation helps improve AI suggestions');
  }, [trackInteraction]);

  // Track suggestion dismissal
  const trackSuggestionDismissed = useCallback((suggestionId: string, suggestionTitle: string) => {
    trackInteraction({
      type: 'suggestion.dismissed',
      componentId: 'ai-suggestions',
      action: 'dismiss',
      data: { suggestionId, suggestionTitle }
    });
  }, [trackInteraction]);

  // Track suggestion view
  const trackSuggestionViewed = useCallback((suggestionId: string) => {
    trackInteraction({
      type: 'suggestion.viewed',
      componentId: 'ai-suggestions',
      action: 'view',
      data: { suggestionId }
    });
  }, [trackInteraction]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    fetchStats();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchStats]);

  return {
    connected,
    stats,
    trackInteraction,
    trackSuggestionImplemented,
    trackSuggestionDismissed,
    trackSuggestionViewed,
    triggerAdaptation,
    fetchStats
  };
}
