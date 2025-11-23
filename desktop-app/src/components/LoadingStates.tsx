/**
 * Loading State Components - Skeleton Screens
 */

export function ServiceCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        </div>
      </div>
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '50%' }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card glass-card">
            <div className="skeleton" style={{ width: '60px', height: '60px', margin: '0 auto 1rem', borderRadius: '50%' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%', margin: '0 auto' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0.5rem auto 0' }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="skeleton skeleton-text" style={{ width: '200px', height: '24px', marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '48px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="skeleton skeleton-text" style={{ width: '200px', height: '24px', marginBottom: '1rem' }} />
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton-text" style={{ marginBottom: '0.75rem' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="chat-view">
      <div className="chat-header glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div className="skeleton skeleton-text" style={{ width: '300px', height: '24px', marginBottom: '0.5rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '200px' }} />
      </div>

      <div className="chat-messages glass-card" style={{ padding: '1.5rem', minHeight: '400px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '100%' }} />
              <div className="skeleton skeleton-text" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
  const className = size === 'large' ? 'loading-spinner loading-spinner-large' : 'loading-spinner';
  return <div className={className} />;
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      zIndex: 9999
    }}>
      <LoadingSpinner size="large" />
      {message && (
        <div style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 500 }}>
          {message}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="glass-card" style={{
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '2rem auto'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
          {description}
        </p>
      )}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="glass-card" style={{
      padding: '2rem',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '2rem auto',
      border: '1px solid var(--status-error)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--status-error)' }}>
        Something went wrong
      </h3>
      <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
        {error}
      </p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          🔄 Try Again
        </button>
      )}
    </div>
  );
}
