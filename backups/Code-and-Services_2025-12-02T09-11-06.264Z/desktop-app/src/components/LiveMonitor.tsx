/**
 * LIVE MONITORING COMPONENTS
 * Real-time service monitoring and system statistics
 */

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingStates';

export interface ServiceMetrics {
  uptime: number;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

export function ServiceHealthBadge({ status }: { status: string }) {
  const colors = {
    running: '#10b981',
    stopped: '#6b7280',
    error: '#ef4444',
    starting: '#f59e0b',
    stopping: '#f59e0b'
  };

  const color = colors[status as keyof typeof colors] || '#6b7280';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      background: `${color}22`,
      border: `1px solid ${color}`,
      fontSize: '0.8rem',
      fontWeight: '500'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        animation: status === 'running' ? 'pulse 2s infinite' : 'none'
      }} />
      <span style={{ color }}>{status.toUpperCase()}</span>
    </div>
  );
}

export function SystemResourceMonitor() {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    // Simulate system resource monitoring
    // In production, you'd get real data from Electron/Node
    const interval = setInterval(() => {
      setCpuUsage(Math.random() * 40 + 10);
      setMemoryUsage(Math.random() * 30 + 20);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    }}>
      <ResourceBar
        label="CPU"
        value={cpuUsage}
        max={100}
        color="#3b82f6"
        icon="⚡"
      />
      <ResourceBar
        label="Memory"
        value={memoryUsage}
        max={100}
        color="#8b5cf6"
        icon="💾"
      />
    </div>
  );
}

function ResourceBar({
  label,
  value,
  max,
  color,
  icon
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        fontSize: '0.85rem'
      }}>
        <span>
          {icon} {label}
        </span>
        <span style={{ fontWeight: 'bold' }}>{Math.round(value)}%</span>
      </div>
      <div style={{
        height: '8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: color,
          transition: 'width 0.3s ease',
          borderRadius: '4px'
        }} />
      </div>
    </div>
  );
}

export function ServiceLogViewer({
  logs
}: {
  logs: Array<{ serviceId: string; type: string; message: string; timestamp?: number }>;
}) {
  return (
    <div className="glass-card" style={{
      padding: '1rem',
      maxHeight: '300px',
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.8rem'
    }}>
      <h3 style={{ marginBottom: '1rem' }}>📜 Service Logs</h3>
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
          No logs yet
        </div>
      ) : (
        logs.slice(-50).reverse().map((log, i) => (
          <div
            key={i}
            style={{
              padding: '0.5rem',
              marginBottom: '0.25rem',
              background: log.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
              borderLeft: `3px solid ${log.type === 'error' ? '#ef4444' : '#10b981'}`
            }}
          >
            <span style={{ color: 'var(--text-dim)' }}>
              [{log.serviceId}]
            </span>{' '}
            {log.message}
          </div>
        ))
      )}
    </div>
  );
}

export function QuickActions({
  onStartAll,
  onStopAll,
  onRefresh,
  loading
}: {
  onStartAll: () => void;
  onStopAll: () => void;
  onRefresh: () => void;
  loading?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    }}>
      <button
        className="btn btn-primary"
        onClick={onStartAll}
        disabled={loading}
        title="Start all services (Alt+A)"
      >
        {loading ? <LoadingSpinner size="small" /> : '▶️'} Start All
      </button>
      <button
        className="btn btn-danger"
        onClick={onStopAll}
        disabled={loading}
        title="Stop all services (Alt+S)"
      >
        ⏹️ Stop All
      </button>
      <button
        className="btn btn-secondary"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh status (Alt+R)"
      >
        {loading ? <LoadingSpinner size="small" /> : '🔄'} Refresh
      </button>
    </div>
  );
}

export function ServiceStatsCard({
  icon,
  label,
  value,
  color,
  trend
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendIcon = {
    up: '↗️',
    down: '↘️',
    neutral: '→'
  };

  return (
    <div className="glass-card" style={{
      padding: '1.5rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '0.5rem'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color,
        marginBottom: '0.25rem'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem'
      }}>
        {trend && <span>{trendIcon[trend]}</span>}
        {label}
      </div>
    </div>
  );
}

export function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const height = 40;

  return (
    <svg width="100%" height={height} style={{ marginTop: '0.5rem' }}>
      <polyline
        points={data.map((value, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = height - (value / max) * height;
          return `${x}%,${y}`;
        }).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        style={{ transition: 'all 0.3s ease' }}
      />
    </svg>
  );
}
