/**
 * KEYBOARD SHORTCUTS HELP COMPONENT
 */

import { KeyboardShortcut, formatShortcut } from '../hooks/useKeyboardShortcuts';

export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>⌨️ Keyboard Shortcuts</h3>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {shortcuts.map((shortcut, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '4px'
            }}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              {shortcut.description}
            </span>
            <kbd style={{
              padding: '0.25rem 0.5rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'monospace',
              fontSize: '0.8rem'
            }}>
              {formatShortcut(shortcut)}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
