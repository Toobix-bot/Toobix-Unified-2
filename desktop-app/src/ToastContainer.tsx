import { useState, useEffect } from 'react';
import { toast, Toast } from './utils';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => toast.dismiss(t.id)}
        >
          <div className="toast-icon">
            {t.type === 'success' && '✅'}
            {t.type === 'error' && '❌'}
            {t.type === 'warning' && '⚠️'}
            {t.type === 'info' && 'ℹ️'}
          </div>
          <div className="toast-content">
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-message">{t.message}</div>}
          </div>
          {t.action && (
            <button
              className="toast-action"
              onClick={(e) => {
                e.stopPropagation();
                t.action!.onClick();
                toast.dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button
            className="toast-close"
            onClick={() => toast.dismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
