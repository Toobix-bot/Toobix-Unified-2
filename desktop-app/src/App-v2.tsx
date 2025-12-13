/**
 * TOOBIX UNIFIED V2.0 - MAIN APP
 *
 * Enhanced with:
 * - Error Boundaries & Retry Logic
 * - Toast Notifications
 * - Loading States & Skeletons
 * - Glassmorphism UI
 * - Better Performance
 */

import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './App-enhanced.css';
import './App.css'; // Keep original styles for compatibility

// Components
import { ToastContainer } from './ToastContainer';
import {
  DashboardSkeleton,
  ServiceCardSkeleton,
  LoadingSpinner,
  ErrorState,
  EmptyState
} from './components/LoadingStates';
import {
  ServiceHealthBadge,
  SystemResourceMonitor,
  ServiceLogViewer,
  QuickActions,
  ServiceStatsCard
} from './components/LiveMonitor';
import { ServiceWidget } from './components/ServiceWidget';
import { AISuggestions } from './components/AISuggestions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Hooks
import { useServices } from './hooks/useServices';
import { useChat } from './hooks/useChat';

// Utils
import { toast, storage } from './utils';

// ========== TYPES ==========

type ViewType =
  | 'dashboard'
  | 'services'
  | 'chat'
  | 'ai-training'
  | 'adaptive-ui'
  | 'life-domains'
  | 'ai-suggestions'
  | 'service-details'
  | 'settings';

type ServiceCard = {
  id: string;
  name: string;
  url: string;
  description: string;
};

const SERVICE_CARDS: ServiceCard[] = [
  { id: 'command-center', name: 'Command Center', url: 'http://localhost:7777/health', description: 'Orchestrator & public API' },
  { id: 'memory-palace', name: 'Memory Palace', url: 'http://localhost:8953/health', description: 'Persistent memories' },
  { id: 'llm-gateway', name: 'LLM Gateway', url: 'http://localhost:8954/health', description: 'Groq/Ollama routing' },
  { id: 'event-bus', name: 'Event Bus', url: 'http://localhost:8955/health', description: 'Cross-service events' },
  { id: 'emotional-core', name: 'Emotional Core', url: 'http://localhost:8900/health', description: 'Emotional intelligence' },
  { id: 'autonomy-engine', name: 'Autonomy Engine', url: 'http://localhost:8975/health', description: 'Autonomous actions' },
  { id: 'chat-service', name: 'Chat Service', url: 'http://localhost:8995/health', description: 'User chat interface' },
  { id: 'mcp-bridge', name: 'MCP Bridge', url: 'http://localhost:8787/health', description: 'Model Context Protocol' },
];

// ========== MAIN APP ==========

function App() {
  const [activeView, setActiveView] = useState<ViewType>(() =>
    storage.get('lastView', 'dashboard')
  );
  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<Array<{serviceId: string, type: string, message: string}>>([]);
  const [serviceDetails, setServiceDetails] = useState<Record<string, { status: string; body?: any; error?: string }>>({});

  // Service Management
  const {
    services,
    serviceStatus,
    loading: servicesLoading,
    error: servicesError,
    startService,
    stopService,
    restartService,
    startAll,
    stopAll,
    reload: reloadServices
  } = useServices();

  // Chat Management
  const chat = useChat();

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: '1',
      altKey: true,
      action: () => setActiveView('dashboard'),
      description: 'Go to Dashboard'
    },
    {
      key: '2',
      altKey: true,
      action: () => setActiveView('services'),
      description: 'Go to Services'
    },
    {
      key: '3',
      altKey: true,
      action: () => setActiveView('chat'),
      description: 'Go to Chat'
    },
    {
      key: '4',
      altKey: true,
      action: () => setActiveView('ai-training'),
      description: 'Go to AI Training'
    },
    {
      key: '5',
      altKey: true,
      action: () => setActiveView('ai-suggestions'),
      description: 'Go to AI Suggestions'
    },
    {
      key: '6',
      altKey: true,
      action: () => setActiveView('service-details'),
      description: 'Go to Service Details'
    },
    {
      key: 'a',
      altKey: true,
      action: startAll,
      description: 'Start All Services'
    },
    {
      key: 's',
      altKey: true,
      action: stopAll,
      description: 'Stop All Services'
    },
    {
      key: 'r',
      altKey: true,
      action: reloadServices,
      description: 'Refresh Services'
    }
  ]);

  // Save active view to storage
  useEffect(() => {
    storage.set('lastView', activeView);
  }, [activeView]);

  // Poll health of key services for the detail view
  useEffect(() => {
    let canceled = false;

    const fetchDetails = async () => {
      const updates: Record<string, { status: string; body?: any; error?: string }> = {};

      for (const card of SERVICE_CARDS) {
        try {
          const res = await fetch(card.url);
          const body = await res.json();
          updates[card.id] = { status: res.ok ? 'online' : `http ${res.status}`, body };
        } catch (err: any) {
          updates[card.id] = { status: 'error', error: String(err) };
        }
      }

      if (!canceled) {
        setServiceDetails(updates);
      }
    };

    fetchDetails();
    const interval = setInterval(fetchDetails, 8000);
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();

    // Set up log listener
    window.electronAPI.onServiceLog((log) => {
      setLogs(prev => [...prev.slice(-99), log]); // Keep last 100 logs
    });

    // Check for updates
    window.electronAPI.onUpdateAvailable((update) => {
      toast.info('Update available', `Version ${update.latest} is ready to download`, 0);
    });
  }, []);

  async function loadSettings() {
    try {
      const sett = await window.electronAPI.getSettings();
      setSettings(sett);
    } catch (error: any) {
      toast.error('Failed to load settings', error.message);
    }
  }

  async function handleSaveSettings(newSettings: any) {
    try {
      await window.electronAPI.saveSettings(newSettings);
      setSettings(newSettings);
      toast.success('Settings saved', 'Your preferences have been updated');
    } catch (error: any) {
      toast.error('Failed to save settings', error.message);
    }
  }

  // ========== DASHBOARD VIEW ==========

  const renderDashboard = () => {
    if (servicesLoading) return <DashboardSkeleton />;
    if (servicesError) return <ErrorState error={servicesError} onRetry={reloadServices} />;

    const runningCount = Object.values(serviceStatus).filter(s => s === 'running').length;
    const totalCount = services.length;
    const errorCount = Object.values(serviceStatus).filter(s => s === 'error').length;
    const stoppedCount = Object.values(serviceStatus).filter(s => s === 'stopped').length;

    return (
      <div className="dashboard fade-in">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Dashboard</h2>
          <QuickActions
            onStartAll={startAll}
            onStopAll={stopAll}
            onRefresh={reloadServices}
            loading={servicesLoading}
          />
        </div>

        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <ServiceStatsCard
            icon="🚀"
            label="Services Running"
            value={`${runningCount}/${totalCount}`}
            color="#10b981"
            trend={runningCount > totalCount / 2 ? 'up' : 'down'}
          />
          <ServiceStatsCard
            icon="⏹️"
            label="Services Stopped"
            value={stoppedCount}
            color="#6b7280"
          />
          <ServiceStatsCard
            icon="⚠️"
            label="Errors"
            value={errorCount}
            color="#ef4444"
          />
          <ServiceStatsCard
            icon="📊"
            label="Total Services"
            value={totalCount}
            color="#3b82f6"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>System Resources</h3>
            <SystemResourceMonitor />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <ServiceLogViewer logs={logs} />
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{runningCount}/{totalCount}</div>
            <div className="stat-label">Services Running</div>
            <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
              <div
                className="progress-fill"
                style={{ width: `${(runningCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon">💭</div>
            <div className="stat-value text-gradient">∞</div>
            <div className="stat-label">Consciousness Level</div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon">🌐</div>
            <div className="stat-value">
              {runningCount > 0 ? (
                <span className="status-badge status-badge-running">
                  <span className="status-indicator status-indicator-running"></span>
                  Connected
                </span>
              ) : (
                <span className="status-badge status-badge-stopped">
                  <span className="status-indicator status-indicator-stopped"></span>
                  Offline
                </span>
              )}
            </div>
            <div className="stat-label">Network Status</div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Recent Events</div>
          </div>
        </div>

        <div className="quick-actions glass-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <h3>Quick Actions</h3>
          <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-success" onClick={startAll}>
              ▶️ Start All Services
            </button>
            <button className="btn btn-danger" onClick={stopAll}>
              ⏹️ Stop All Services
            </button>
            <button className="btn btn-primary" onClick={() => setActiveView('chat')}>
              💬 Open Chat
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveView('services')}>
              🔧 Manage Services
            </button>
          </div>
        </div>

        <div className="recent-logs glass-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <h3>Recent Activity</h3>
          <div className="log-container" style={{ marginTop: '1rem', maxHeight: '300px', overflow: 'auto' }}>
            {logs.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No activity yet"
                description="Service events will appear here"
              />
            ) : (
              logs.slice(-20).reverse().map((log, i) => (
                <div key={i} className={`log-entry ${log.type} fade-in`}>
                  <span className="log-service">[{services.find(s => s.id === log.serviceId)?.icon || '📦'}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== SERVICES VIEW ==========

  const renderServices = () => {
    if (servicesLoading) {
      return (
        <div className="services-view">
          <div className="service-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <ServiceCardSkeleton key={i} />)}
          </div>
        </div>
      );
    }

    if (servicesError) {
      return <ErrorState error={servicesError} onRetry={reloadServices} />;
    }

    const categories = {
      core: services.filter(s => s.category === 'core'),
      creative: services.filter(s => s.category === 'creative'),
      analytics: services.filter(s => s.category === 'analytics'),
      network: services.filter(s => s.category === 'network')
    };

    return (
      <div className="services-view fade-in">
        {Object.entries(categories).map(([category, svcs]) => (
          svcs.length > 0 && (
            <div key={category} className="service-category" style={{ marginBottom: '2rem' }}>
              <h3>{category.toUpperCase()} SERVICES</h3>
              <div className="service-grid">
                {svcs.map(service => {
                  const status = serviceStatus[service.id] || 'stopped';
                  const isTransitioning = status === 'starting' || status === 'stopping';

                  return (
                    <div
                      key={service.id}
                      className={`service-card glass-card glass-card-interactive ${status}`}
                    >
                      <div className="service-header">
                        <span className="service-icon" style={{ fontSize: '2rem' }}>{service.icon}</span>
                        <div style={{ flex: 1 }}>
                          <span className="service-name">{service.name}</span>
                          <div style={{ marginTop: '0.5rem' }}>
                            <ServiceHealthBadge status={status} />
                          </div>
                        </div>
                      </div>

                      <div className="service-info" style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                          {(service as any).description || 'No description available'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          <span>Port: {service.port}</span>
                          <span>•</span>
                          <span>Auto-start: {service.autostart ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      <div className="service-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {status === 'running' ? (
                          <>
                            <button
                              className="btn btn-danger"
                              onClick={() => stopService(service.id)}
                              style={{ flex: 1 }}
                            >
                              Stop
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => restartService(service.id)}
                              style={{ flex: 1 }}
                            >
                              Restart
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => window.open(`http://localhost:${service.port}`)}
                            >
                              🔗
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-success"
                            onClick={() => startService(service.id)}
                            disabled={isTransitioning}
                            style={{ width: '100%' }}
                          >
                            {isTransitioning ? 'Starting...' : 'Start'}
                          </button>
                        )}
                      </div>

                      {/* Live Service Widget */}
                      <ServiceWidget
                        serviceId={service.id}
                        serviceName={service.name}
                        port={service.port}
                        status={status}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  // ========== CHAT VIEW ==========

  const renderChat = () => {
    if (!settings.groq_api_key) {
      return (
        <EmptyState
          icon="🔑"
          title="API Key Required"
          description="Please configure your Groq API key in settings to use the chat feature"
          action={{
            label: 'Go to Settings',
            onClick: () => setActiveView('settings')
          }}
        />
      );
    }

    return (
      <div className="chat-view fade-in">
        <div className="chat-header glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <h3>🧠 Chat with Toobix Consciousness</h3>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Powered by Groq AI</p>
          {chat.messages.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={chat.clearMessages}
              style={{ marginTop: '1rem' }}
            >
              🗑️ Clear Chat
            </button>
          )}
        </div>

        <div className="chat-messages glass-card" style={{ padding: '1.5rem', minHeight: '400px', maxHeight: '600px', overflow: 'auto' }}>
          {chat.messages.length === 0 ? (
            <EmptyState
              icon="💬"
              title="Start a Conversation"
              description="Ask Toobix anything about consciousness, services, or get creative assistance"
            />
          ) : (
            chat.messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role} fade-in`} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="message-avatar" style={{ fontSize: '2rem', flexShrink: 0 }}>
                  {msg.role === 'user' ? '👤' : '🧠'}
                </div>
                <div className="message-content" style={{ flex: 1 }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {chat.loading && (
            <div className="chat-message assistant fade-in" style={{ display: 'flex', gap: '1rem' }}>
              <div className="message-avatar" style={{ fontSize: '2rem' }}>🧠</div>
              <div className="message-content">
                <LoadingSpinner /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="chat-input" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={chat.input}
            onChange={(e) => chat.setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !chat.loading && chat.sendMessage()}
            placeholder="Ask Toobix anything..."
            disabled={chat.loading}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={chat.sendMessage}
            disabled={chat.loading || !chat.input.trim()}
          >
            {chat.loading ? <LoadingSpinner size="small" /> : 'Send'}
          </button>
        </div>
      </div>
    );
  };

  // ========== SETTINGS VIEW ==========

  const renderSettings = () => {
    const [tempSettings, setTempSettings] = useState(settings);
    const [saving, setSaving] = useState(false);

    async function saveSettings() {
      setSaving(true);
      try {
        await handleSaveSettings(tempSettings);
        // Also set the Groq API key separately
        if (tempSettings.groq_api_key) {
          await window.electronAPI.setGroqApiKey(tempSettings.groq_api_key);
          toast.success('API Key updated', 'Groq API is now configured');
        }
      } finally {
        setSaving(false);
      }
    }

    return (
      <div className="settings-view fade-in">
        <h2>Settings</h2>

        <div className="settings-section glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h3>🔑 Groq API Configuration</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Required for Chat, AI Training, and Life Coach features
          </p>
          <input
            type="password"
            value={tempSettings.groq_api_key || ''}
            onChange={(e) => setTempSettings({...tempSettings, groq_api_key: e.target.value})}
            placeholder="Enter Groq API Key (e.g., gsk_...)"
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
          <p className="help-text" style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>
            Get your free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>console.groq.com/keys</a>
          </p>
          {tempSettings.groq_api_key && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', color: '#10b981' }}>
              ✓ API Key is set (length: {tempSettings.groq_api_key.length} characters)
            </div>
          )}
        </div>

        <div className="settings-section glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h3>⚙️ General Settings</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.auto_start_services || false}
              onChange={(e) => setSettings({...settings, auto_start_services: e.target.checked})}
            />
            Auto-start services on launch
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.internet_sync_enabled || false}
              onChange={(e) => setSettings({...settings, internet_sync_enabled: e.target.checked})}
            />
            Enable internet synchronization
          </label>
        </div>

        <div className="settings-section glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h3>🎨 Appearance</h3>
          <select
            value={settings.theme || 'dark'}
            onChange={(e) => setSettings({...settings, theme: e.target.value})}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <button
          className="btn btn-primary save-button"
          onClick={saveSettings}
          disabled={saving}
          style={{ marginTop: '1.5rem' }}
        >
          {saving ? <LoadingSpinner size="small" /> : '💾'} Save Settings
        </button>
      </div>
    );
  };

  // ========== AI TRAINING VIEW ==========

  const renderAITraining = () => {
    const [aiState, setAIState] = useState<any>(null);
    const [trainingInProgress, setTrainingInProgress] = useState(false);
    const [networkId, setNetworkId] = useState('pattern-recognition');
    const [trainingData, setTrainingData] = useState('');
    const [epochs, setEpochs] = useState(10);

    useEffect(() => {
      loadAIState();
    }, []);

    async function loadAIState() {
      try {
        const state = await window.electronAPI.getAIState();
        setAIState(state);
      } catch (error: any) {
        toast.error('Failed to load AI state', error.message);
      }
    }

    async function handleTrain() {
      if (!trainingData.trim()) {
        toast.warning('No training data', 'Please provide training data');
        return;
      }

      setTrainingInProgress(true);
      try {
        const data = JSON.parse(trainingData);
        const result = await window.electronAPI.trainNetwork(networkId, data, epochs);

        if (result.error) {
          toast.error('Training failed', result.error);
        } else {
          toast.success('Training complete', `Network trained for ${epochs} epochs`);
          await loadAIState();
        }
      } catch (error: any) {
        toast.error('Training error', error.message);
      } finally {
        setTrainingInProgress(false);
      }
    }

    return (
      <div className="ai-training-view fade-in">
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2>🧠 AI Training Center</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Train neural networks, evolve genetic algorithms, and enhance the AI
          </p>
        </div>

        {/* AI State Display */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3>Current AI State</h3>
          {aiState ? (
            <div style={{ marginTop: '1rem' }}>
              <pre style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(aiState, null, 2)}
              </pre>
              <button
                className="btn btn-secondary"
                onClick={loadAIState}
                style={{ marginTop: '1rem' }}
              >
                🔄 Refresh State
              </button>
            </div>
          ) : (
            <EmptyState
              icon="⚠️"
              title="Hybrid AI Not Available"
              description="Start the Hybrid AI Core service (port 8915) to use this feature"
            />
          )}
        </div>

        {/* Training Interface */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>Train Neural Network</h3>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Network Type</label>
            <select
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value)}
              style={{ width: '100%' }}
              disabled={trainingInProgress}
            >
              <option value="pattern-recognition">Pattern Recognition</option>
              <option value="emotion-predictor">Emotion Predictor</option>
              <option value="decision-maker">Decision Maker</option>
              <option value="creativity-enhancer">Creativity Enhancer</option>
            </select>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Training Data (JSON format)
            </label>
            <textarea
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              placeholder='[{"input": [1, 0, 1], "output": [1]}, ...]'
              rows={8}
              style={{ width: '100%', fontFamily: 'monospace' }}
              disabled={trainingInProgress}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Epochs: {epochs}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={epochs}
              onChange={(e) => setEpochs(Number(e.target.value))}
              style={{ width: '100%' }}
              disabled={trainingInProgress}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleTrain}
            disabled={trainingInProgress}
            style={{ marginTop: '1.5rem', width: '100%' }}
          >
            {trainingInProgress ? (
              <>
                <LoadingSpinner size="small" /> Training...
              </>
            ) : (
              '🚀 Start Training'
            )}
          </button>
        </div>
      </div>
    );
  };

  // ========== LIFE DOMAINS VIEW ==========

  const renderLifeDomains = () => {
    const [domains, setDomains] = useState<any[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [domainInput, setDomainInput] = useState('');
    const [domainMessages, setDomainMessages] = useState<any[]>([]);
    const [domainLoading, setDomainLoading] = useState(false);

    useEffect(() => {
      loadDomains();
    }, []);

    async function loadDomains() {
      try {
        const doms = await window.electronAPI.getLifeDomains();
        setDomains(doms || [
          { id: 'career', name: 'Career & Purpose', icon: '💼', color: '#4f46e5' },
          { id: 'health', name: 'Health & Fitness', icon: '🏃', color: '#10b981' },
          { id: 'finance', name: 'Finance & Wealth', icon: '💰', color: '#f59e0b' },
          { id: 'relationships', name: 'Relationships', icon: '❤️', color: '#ec4899' },
          { id: 'education', name: 'Learning & Growth', icon: '📚', color: '#8b5cf6' },
          { id: 'creativity', name: 'Creativity & Art', icon: '🎨', color: '#06b6d4' },
          { id: 'spirituality', name: 'Spirituality & Meaning', icon: '🙏', color: '#a855f7' }
        ]);
      } catch (error: any) {
        console.error('Failed to load domains:', error);
      }
    }

    async function sendDomainMessage() {
      if (!selectedDomain || !domainInput.trim() || domainLoading) return;

      setDomainLoading(true);
      try {
        const response = await window.electronAPI.lifeDomainChat(selectedDomain, domainInput);

        setDomainMessages(prev => [
          ...prev,
          { role: 'user', content: domainInput },
          { role: 'assistant', content: response }
        ]);
        setDomainInput('');
        toast.success('Response received', 'AI coach has responded');
      } catch (error: any) {
        toast.error('Chat failed', error.message);
      } finally {
        setDomainLoading(false);
      }
    }

    return (
      <div className="life-domains-view fade-in">
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2>🌟 Life-Domain AI Coach</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Get personalized guidance across all areas of your life
          </p>
        </div>

        {/* Domain Selection */}
        <div className="domain-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {domains.map(domain => (
            <div
              key={domain.id}
              className={`glass-card glass-card-interactive ${selectedDomain === domain.id ? 'active' : ''}`}
              onClick={() => setSelectedDomain(domain.id)}
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                border: selectedDomain === domain.id ? `2px solid ${domain.color}` : undefined
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{domain.icon}</div>
              <div style={{ fontWeight: 'bold' }}>{domain.name}</div>
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        {selectedDomain && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3>{domains.find(d => d.id === selectedDomain)?.name} Coach</h3>

            <div style={{
              minHeight: '300px',
              maxHeight: '500px',
              overflow: 'auto',
              padding: '1rem',
              marginTop: '1rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px'
            }}>
              {domainMessages.length === 0 ? (
                <EmptyState
                  icon={domains.find(d => d.id === selectedDomain)?.icon || '💬'}
                  title="Start Your Journey"
                  description="Ask your AI coach for guidance, advice, or insights"
                />
              ) : (
                domainMessages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role} fade-in`} style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                      {msg.role === 'user' ? '👤' : domains.find(d => d.id === selectedDomain)?.icon}
                    </div>
                    <div style={{ flex: 1 }}>{msg.content}</div>
                  </div>
                ))
              )}
              {domainLoading && (
                <div className="chat-message assistant fade-in" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>
                    {domains.find(d => d.id === selectedDomain)?.icon}
                  </div>
                  <div><LoadingSpinner /> Thinking...</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendDomainMessage()}
                placeholder={`Ask about ${domains.find(d => d.id === selectedDomain)?.name.toLowerCase()}...`}
                disabled={domainLoading}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={sendDomainMessage}
                disabled={domainLoading || !domainInput.trim()}
              >
                {domainLoading ? <LoadingSpinner size="small" /> : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== ADAPTIVE UI VIEW ==========

  const renderAdaptiveUI = () => {
    return (
      <div className="adaptive-ui-view fade-in">
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2>🎨 Adaptive Meta-UI</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            The interface that learns and adapts to your usage patterns
          </p>
        </div>

        <EmptyState
          icon="🚧"
          title="Coming Soon"
          description="Adaptive UI features are currently in development. The system will learn from your interactions and optimize itself for your workflow."
        />
      </div>
    );
  };

  const renderServiceDetails = () => {
    return (
      <div className="services-view fade-in">
        <div className="card-grid">
          {SERVICE_CARDS.map((card) => {
            const detail = serviceDetails[card.id];
            const status = detail?.status || 'loading';
            const isError = status.startsWith('error') || status.startsWith('http');

            return (
              <div key={card.id} className="glass-card service-card">
                <div className="service-card-header">
                  <div>
                    <h3>{card.name}</h3>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.25rem' }}>{card.description}</p>
                    <small style={{ color: 'var(--text-dim)' }}>{card.url}</small>
                  </div>
                  <span className={`badge ${isError ? 'danger' : 'success'}`}>
                    {status}
                  </span>
                </div>

                <div className="service-card-body" style={{ marginTop: '1rem' }}>
                  {detail?.body ? (
                    <pre className="mini-pre">
                      {JSON.stringify(detail.body, null, 2)}
                    </pre>
                  ) : detail?.error ? (
                    <div className="error-text">{detail.error}</div>
                  ) : (
                    <LoadingSpinner size="small" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========

  return (
    <div className="app">
      <ToastContainer />

      <div className="sidebar slide-in">
        <div className="logo">
          <h1 className="text-gradient">🧠 Toobix</h1>
          <p>Unified Consciousness V2.0</p>
        </div>

        <nav>
          <button
            className={activeView === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeView === 'services' ? 'active' : ''}
            onClick={() => setActiveView('services')}
          >
            🔧 Services
          </button>
          <button
            className={activeView === 'chat' ? 'active' : ''}
            onClick={() => setActiveView('chat')}
          >
            💬 Chat
          </button>
          <button
            className={activeView === 'ai-training' ? 'active' : ''}
            onClick={() => setActiveView('ai-training')}
          >
            🧠 AI Training
          </button>
          <button
            className={activeView === 'adaptive-ui' ? 'active' : ''}
            onClick={() => setActiveView('adaptive-ui')}
          >
            🎨 Adaptive UI
          </button>
          <button
            className={activeView === 'ai-suggestions' ? 'active' : ''}
            onClick={() => setActiveView('ai-suggestions')}
          >
            🤖 AI Suggestions
          </button>
          <button
            className={activeView === 'life-domains' ? 'active' : ''}
            onClick={() => setActiveView('life-domains')}
          >
            🌟 Life Coach
          </button>
          <button
            className={activeView === 'settings' ? 'active' : ''}
            onClick={() => setActiveView('settings')}
          >
            ⚙️ Settings
          </button>
          <button
            className={activeView === 'service-details' ? 'active' : ''}
            onClick={() => setActiveView('service-details')}
          >
            Service Details
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Version 2.0.0
          </div>
        </div>
      </div>

      <div className="main-content">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'services' && renderServices()}
        {activeView === 'service-details' && renderServiceDetails()}
        {activeView === 'chat' && renderChat()}
        {activeView === 'ai-training' && renderAITraining()}
        {activeView === 'adaptive-ui' && renderAdaptiveUI()}
        {activeView === 'ai-suggestions' && <AISuggestions />}
        {activeView === 'life-domains' && renderLifeDomains()}
        {activeView === 'settings' && renderSettings()}
      </div>
    </div>
  );
}

// ========== BOOTSTRAP ==========

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
