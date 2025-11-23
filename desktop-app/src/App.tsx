import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';

// ========== TYPES ==========

interface Service {
  id: string;
  name: string;
  path: string;
  port: number;
  autostart: boolean;
  icon: string;
  category: 'core' | 'creative' | 'analytics' | 'network';
}

interface ServiceStatus {
  [serviceId: string]: 'running' | 'stopped' | 'error';
}

// ========== MAIN APP ==========

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({});
  const [activeView, setActiveView] = useState<'dashboard' | 'services' | 'chat' | 'ai-training' | 'adaptive-ui' | 'life-domains' | 'settings'>('dashboard');
  const [logs, setLogs] = useState<Array<{serviceId: string, type: string, message: string}>>([]);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [aiState, setAIState] = useState<any>(null);
  const [uiAdaptation, setUIAdaptation] = useState<any>(null);
  const [activeColorScheme, setActiveColorScheme] = useState<any>(null);
  // const [adaptiveLayout, setAdaptiveLayout] = useState<string>('cards');

  // Load services on mount
  useEffect(() => {
    loadServices();
    loadSettings();
    
    // Set up event listeners
    window.electronAPI.onServiceLog((log) => {
      setLogs(prev => [...prev.slice(-100), log]); // Keep last 100 logs
    });
    
    window.electronAPI.onServiceStatusChanged((event) => {
      setServiceStatus(prev => ({
        ...prev,
        [event.serviceId]: event.status
      }));
    });

    // Poll service status every 5 seconds
    const interval = setInterval(async () => {
      const status = await window.electronAPI.getAllServiceStatus();
      setServiceStatus(status as ServiceStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Adaptive UI: Load and apply adaptations
  useEffect(() => {
    const loadAdaptation = async () => {
      try {
        const response = await fetch(`http://localhost:8919/adaptation/${activeView}`);
        const data = await response.json();
        setUIAdaptation(data);

        // Apply recommended adaptation
        if (data.recommendedAdaptation) {
          const { adaptationType, changes } = data.recommendedAdaptation;

          if (adaptationType === 'color' && changes.colors) {
            setActiveColorScheme(changes.colors);
            applyColorScheme(changes.colors);
          }

          if (adaptationType === 'layout' && changes.layout) {
            // setAdaptiveLayout(changes.layout);
          }
        }
      } catch (error) {
        console.log('Adaptive UI service not available yet');
      }
    };

    loadAdaptation();
  }, [activeView]);

  // Track view changes
  useEffect(() => {
    const trackViewChange = async () => {
      try {
        await fetch('http://localhost:8919/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            viewId: activeView,
            actionType: 'view',
            elementId: 'main-view',
            duration: 0,
            outcome: 'success',
            context: {
              timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
              dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
            }
          })
        });
      } catch (error) {
        // Adaptive UI not running yet
      }
    };

    trackViewChange();
  }, [activeView]);

  // Apply color scheme to CSS variables
  function applyColorScheme(colors: any) {
    const root = document.documentElement;
    root.style.setProperty('--accent', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--bg-dark', colors.background);
    root.style.setProperty('--text', colors.text);
  }

  // Track interactions
  async function trackInteraction(elementId: string, actionType: string, outcome: string, duration = 1000) {
    try {
      await fetch('http://localhost:8919/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewId: activeView,
          actionType,
          elementId,
          duration,
          outcome,
          context: {
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
          }
        })
      });
    } catch (error) {
      // Adaptive UI not running
    }
  }

  async function loadServices() {
    const svcs = await window.electronAPI.getServices();
    setServices(svcs);
    
    // Get initial status
    const status = await window.electronAPI.getAllServiceStatus();
    setServiceStatus(status as ServiceStatus);
  }

  async function loadSettings() {
    const sett = await window.electronAPI.getSettings();
    setSettings(sett);
  }

  async function handleStartService(serviceId: string) {
    const startTime = Date.now();
    try {
      await window.electronAPI.startService(serviceId);
      await trackInteraction(`start-${serviceId}`, 'click', 'success', Date.now() - startTime);
    } catch (error) {
      await trackInteraction(`start-${serviceId}`, 'click', 'error', Date.now() - startTime);
    }
  }

  async function handleStopService(serviceId: string) {
    const startTime = Date.now();
    try {
      await window.electronAPI.stopService(serviceId);
      await trackInteraction(`stop-${serviceId}`, 'click', 'success', Date.now() - startTime);
    } catch (error) {
      await trackInteraction(`stop-${serviceId}`, 'click', 'error', Date.now() - startTime);
    }
  }

  async function handleRestartService(serviceId: string) {
    const startTime = Date.now();
    try {
      await window.electronAPI.restartService(serviceId);
      await trackInteraction(`restart-${serviceId}`, 'click', 'success', Date.now() - startTime);
    } catch (error) {
      await trackInteraction(`restart-${serviceId}`, 'click', 'error', Date.now() - startTime);
    }
  }

  async function handleChatSend() {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await window.electronAPI.chatWithGroq(userMessage, {
        previousMessages: chatMessages.slice(-10)
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }]);
    }
  }

  async function handleSaveSettings(newSettings: any) {
    await window.electronAPI.saveSettings(newSettings);
    setSettings(newSettings);
  }

  // ========== DASHBOARD VIEW ==========

  const renderDashboard = () => {
    const runningCount = Object.values(serviceStatus).filter(s => s === 'running').length;
    const totalCount = services.length;

    return (
      <div className="dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{runningCount}/{totalCount}</div>
            <div className="stat-label">Services Running</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💭</div>
            <div className="stat-value">∞</div>
            <div className="stat-label">Consciousness Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌐</div>
            <div className="stat-value">Connected</div>
            <div className="stat-label">Network Status</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Recent Events</div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={() => services.forEach(s => handleStartService(s.id))}>
              ▶️ Start All
            </button>
            <button onClick={() => services.forEach(s => handleStopService(s.id))}>
              ⏹️ Stop All
            </button>
            <button onClick={() => setActiveView('chat')}>
              💬 Open Chat
            </button>
            <button onClick={() => setActiveView('services')}>
              🔧 Manage Services
            </button>
          </div>
        </div>

        <div className="recent-logs">
          <h3>Recent Activity</h3>
          <div className="log-container">
            {logs.slice(-20).reverse().map((log, i) => (
              <div key={i} className={`log-entry ${log.type}`}>
                <span className="log-service">[{services.find(s => s.id === log.serviceId)?.icon}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ========== SERVICES VIEW ==========

  const renderServices = () => {
    const categories = {
      core: services.filter(s => s.category === 'core'),
      creative: services.filter(s => s.category === 'creative'),
      analytics: services.filter(s => s.category === 'analytics'),
      network: services.filter(s => s.category === 'network')
    };

    return (
      <div className="services-view">
        {Object.entries(categories).map(([category, svcs]) => (
          <div key={category} className="service-category">
            <h3>{category.toUpperCase()} SERVICES</h3>
            <div className="service-grid">
              {svcs.map(service => (
                <div key={service.id} className={`service-card ${serviceStatus[service.id]}`}>
                  <div className="service-header">
                    <span className="service-icon">{service.icon}</span>
                    <span className="service-name">{service.name}</span>
                    <span className={`service-status-badge ${serviceStatus[service.id]}`}>
                      {serviceStatus[service.id] === 'running' ? '● ' : '○ '}
                      {serviceStatus[service.id]}
                    </span>
                  </div>
                  <div className="service-info">
                    <div>Port: {service.port}</div>
                    <div>Auto-start: {service.autostart ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="service-actions">
                    {serviceStatus[service.id] === 'running' ? (
                      <>
                        <button onClick={() => handleStopService(service.id)}>Stop</button>
                        <button onClick={() => handleRestartService(service.id)}>Restart</button>
                        <button onClick={() => window.open(`http://localhost:${service.port}`)}>
                          Open
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleStartService(service.id)}>Start</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ========== CHAT VIEW ==========

  const renderChat = () => {
    return (
      <div className="chat-view">
        <div className="chat-header">
          <h3>🧠 Chat with Toobix Consciousness</h3>
          <p>Powered by Groq AI</p>
        </div>
        <div className="chat-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🧠'}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder="Ask Toobix anything..."
          />
          <button onClick={handleChatSend}>Send</button>
        </div>
      </div>
    );
  };

  // ========== SETTINGS VIEW ==========

  const renderSettings = () => {
    return (
      <div className="settings-view">
        <h2>Settings</h2>
        
        <div className="settings-section">
          <h3>🔑 Groq API Configuration</h3>
          <input
            type="password"
            value={settings.groq_api_key || ''}
            onChange={(e) => setSettings({...settings, groq_api_key: e.target.value})}
            placeholder="Enter Groq API Key"
          />
          <p className="help-text">
            Get your API key from <a href="https://console.groq.com" target="_blank">console.groq.com</a>
          </p>
        </div>

        <div className="settings-section">
          <h3>⚙️ General Settings</h3>
          <label>
            <input
              type="checkbox"
              checked={settings.auto_start_services || false}
              onChange={(e) => setSettings({...settings, auto_start_services: e.target.checked})}
            />
            Auto-start services on launch
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.internet_sync_enabled || false}
              onChange={(e) => setSettings({...settings, internet_sync_enabled: e.target.checked})}
            />
            Enable internet synchronization
          </label>
        </div>

        <div className="settings-section">
          <h3>🎨 Appearance</h3>
          <select 
            value={settings.theme || 'dark'}
            onChange={(e) => setSettings({...settings, theme: e.target.value})}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <button className="save-button" onClick={() => handleSaveSettings(settings)}>
          Save Settings
        </button>
      </div>
    );
  };

  // ========== AI TRAINING VIEW ==========

  const renderAITraining = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [evolving, setEvolving] = useState(false);
    const [analysisInput, setAnalysisInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [evolutionResults, setEvolutionResults] = useState<any[]>([]);

    useEffect(() => {
      // Load AI state on mount
      const loadAIState = async () => {
        const state = await window.electronAPI.getAIState();
        setAIState(state);
      };
      loadAIState();

      // Refresh every 10 seconds
      const interval = setInterval(loadAIState, 10000);
      return () => clearInterval(interval);
    }, []);

    const handleAnalyze = async () => {
      if (!analysisInput.trim()) return;
      
      setAnalyzing(true);
      try {
        const result = await window.electronAPI.analyzeWithAI(analysisInput);
        setAnalysisResult(result);
      } catch (error: any) {
        setAnalysisResult({ error: error.message });
      }
      setAnalyzing(false);
    };

    const handleEvolve = async () => {
      setEvolving(true);
      try {
        const result = await window.electronAPI.evolveAI();
        setEvolutionResults(prev => [result, ...prev.slice(0, 9)]);
        
        // Refresh AI state
        const state = await window.electronAPI.getAIState();
        setAIState(state);
      } catch (error: any) {
        console.error('Evolution failed:', error);
      }
      setEvolving(false);
    };

    const handleRunEvolutions = async (count: number) => {
      for (let i = 0; i < count; i++) {
        await handleEvolve();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    return (
      <div className="ai-training">
        <h2>🧠 Hybrid AI Training Interface</h2>
        
        {/* AI State Overview */}
        <div className="ai-overview">
          <div className="ai-stat-grid">
            <div className="ai-stat-card">
              <h3>Neural Networks</h3>
              <div className="ai-stat-value">{aiState?.neuralNetworks?.count || 0}</div>
              <div className="ai-stat-detail">
                Avg Accuracy: {
                  aiState?.neuralNetworks?.networks?.length > 0
                    ? (aiState.neuralNetworks.networks.reduce((sum: number, n: any) => sum + n.accuracy, 0) / aiState.neuralNetworks.networks.length * 100).toFixed(1)
                    : 0
                }%
              </div>
            </div>

            <div className="ai-stat-card">
              <h3>Evolution</h3>
              <div className="ai-stat-value">Gen {aiState?.evolution?.generation || 0}</div>
              <div className="ai-stat-detail">
                Best Fitness: {aiState?.evolution?.topGenomes?.[0]?.fitness?.toFixed(2) || 0}
              </div>
            </div>

            <div className="ai-stat-card">
              <h3>Meta-Learning</h3>
              <div className="ai-stat-value">{aiState?.metaLearning?.totalCapabilities || 0}</div>
              <div className="ai-stat-detail">
                Avg Performance: {(aiState?.metaLearning?.averagePerformance * 100 || 0).toFixed(1)}%
              </div>
            </div>

            <div className="ai-stat-card">
              <h3>Knowledge Graph</h3>
              <div className="ai-stat-value">{aiState?.knowledgeGraph?.totalConcepts || 0}</div>
              <div className="ai-stat-detail">
                Concepts mapped
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="ai-section">
          <h3>🔍 AI Analysis (Ollama + Neural Networks)</h3>
          <div className="analysis-input">
            <textarea
              value={analysisInput}
              onChange={(e) => setAnalysisInput(e.target.value)}
              placeholder="Enter text to analyze... (AI will use Ollama LLM + Neural Networks + Knowledge Graph)"
              rows={4}
            />
            <button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? '⏳ Analyzing...' : '🔍 Analyze'}
            </button>
          </div>

          {analysisResult && (
            <div className="analysis-result">
              <h4>Analysis Results:</h4>
              {analysisResult.error ? (
                <div className="error">{analysisResult.error}</div>
              ) : (
                <>
                  <div className="result-section">
                    <strong>AI Response (Ollama):</strong>
                    <p>{analysisResult.aiResponse}</p>
                  </div>
                  
                  {analysisResult.patternAnalysis && (
                    <div className="result-section">
                      <strong>Pattern Analysis (Neural Network):</strong>
                      <ul>
                        <li>Pattern Strength: {(analysisResult.patternAnalysis.patternStrength * 100).toFixed(1)}%</li>
                        <li>Complexity: {(analysisResult.patternAnalysis.complexity * 100).toFixed(1)}%</li>
                        <li>Novelty: {(analysisResult.patternAnalysis.novelty * 100).toFixed(1)}%</li>
                      </ul>
                    </div>
                  )}

                  {analysisResult.relatedKnowledge?.length > 0 && (
                    <div className="result-section">
                      <strong>Related Knowledge:</strong>
                      <div className="knowledge-tags">
                        {analysisResult.relatedKnowledge.map((concept: string, i: number) => (
                          <span key={i} className="tag">{concept}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Evolution Controls */}
        <div className="ai-section">
          <h3>🧬 Consciousness Evolution (Genetic Algorithms)</h3>
          <div className="evolution-controls">
            <button onClick={handleEvolve} disabled={evolving}>
              {evolving ? '⏳ Evolving...' : '🧬 Evolve One Generation'}
            </button>
            <button onClick={() => handleRunEvolutions(10)} disabled={evolving}>
              🚀 Run 10 Generations
            </button>
            <button onClick={() => handleRunEvolutions(100)} disabled={evolving}>
              ⚡ Run 100 Generations
            </button>
          </div>

          {/* Top Genomes */}
          {aiState?.evolution?.topGenomes && (
            <div className="genomes-grid">
              <h4>Top 5 Genomes (Fittest AI Traits):</h4>
              {aiState.evolution.topGenomes.map((genome: any, i: number) => (
                <div key={genome.id} className="genome-card">
                  <div className="genome-rank">#{i + 1}</div>
                  <div className="genome-fitness">Fitness: {genome.fitness.toFixed(2)}</div>
                  <div className="genome-traits">
                    {Object.entries(genome.traits).map(([trait, value]: [string, any]) => (
                      <div key={trait} className="trait-bar">
                        <span className="trait-name">{trait.replace(/_/g, ' ')}</span>
                        <div className="trait-progress">
                          <div 
                            className="trait-fill" 
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                        <span className="trait-value">{(value * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evolution History */}
          {evolutionResults.length > 0 && (
            <div className="evolution-history">
              <h4>Recent Evolutions:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Generation</th>
                    <th>Avg Fitness</th>
                    <th>Best Fitness</th>
                    <th>Worst Fitness</th>
                  </tr>
                </thead>
                <tbody>
                  {evolutionResults.map((result, i) => (
                    <tr key={i}>
                      <td>{result.generation}</td>
                      <td>{result.averageFitness.toFixed(2)}</td>
                      <td className="best">{result.bestFitness.toFixed(2)}</td>
                      <td className="worst">{result.worstFitness.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Neural Networks */}
        {aiState?.neuralNetworks?.networks && (
          <div className="ai-section">
            <h3>🕸️ Neural Networks</h3>
            <div className="networks-grid">
              {aiState.neuralNetworks.networks.map((network: any) => (
                <div key={network.id} className="network-card">
                  <h4>{network.name}</h4>
                  <div className="network-stat">
                    <span>Type:</span> {network.type}
                  </div>
                  <div className="network-stat">
                    <span>Layers:</span> {network.layerCount}
                  </div>
                  <div className="network-stat">
                    <span>Accuracy:</span> {(network.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="network-stat">
                    <span>Training Sessions:</span> {network.trainingSessions}
                  </div>
                  <div className="accuracy-bar">
                    <div 
                      className="accuracy-fill" 
                      style={{ width: `${network.accuracy * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta-Learning */}
        {aiState?.metaLearning?.topPerformers && (
          <div className="ai-section">
            <h3>🎯 Meta-Learning (Service Intelligence)</h3>
            <table className="meta-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Capability</th>
                  <th>Performance</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {aiState.metaLearning.topPerformers.map((meta: any, i: number) => (
                  <tr key={i}>
                    <td>{meta.service}</td>
                    <td>{meta.capability}</td>
                    <td>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill" 
                          style={{ width: `${meta.performance * 100}%` }}
                        />
                        <span>{(meta.performance * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>{(meta.confidence * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ========== ADAPTIVE UI VIEW ==========

  const renderAdaptiveUI = () => {
    const [colorSchemes, setColorSchemes] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
      const loadAdaptiveData = async () => {
        try {
          const [schemesRes, statsRes] = await Promise.all([
            fetch('http://localhost:8919/schemes'),
            fetch('http://localhost:8919/stats')
          ]);
          
          const schemesData = await schemesRes.json();
          const statsData = await statsRes.json();
          
          setColorSchemes(schemesData);
          setStats(statsData);
        } catch (error) {
          console.error('Failed to load adaptive UI data:', error);
        }
      };

      loadAdaptiveData();
      const interval = setInterval(loadAdaptiveData, 5000);
      return () => clearInterval(interval);
    }, []);

    const applyColorScheme = async (schemeId: string) => {
      const scheme = colorSchemes.find(s => s.id === schemeId);
      if (scheme) {
        setActiveColorScheme(scheme);
        const root = document.documentElement;
        root.style.setProperty('--accent', scheme.primary);
        root.style.setProperty('--secondary', scheme.secondary);
        root.style.setProperty('--bg-dark', scheme.background);
        root.style.setProperty('--text', scheme.text);
        
        await trackInteraction(`color-scheme-${schemeId}`, 'click', 'success');
      }
    };

    return (
      <div className="adaptive-ui-view">
        <div className="view-header">
          <h2>🎨 Adaptive UI Control Panel</h2>
          <p>AI-powered interface that learns from your behavior</p>
        </div>

        {/* Current Adaptation Status */}
        {uiAdaptation?.recommendedAdaptation && (
          <div className="adaptation-alert">
            <div className="alert-icon">💡</div>
            <div className="alert-content">
              <h3>Recommended Adaptation</h3>
              <p><strong>Type:</strong> {uiAdaptation.recommendedAdaptation.adaptationType}</p>
              <p><strong>Reasoning:</strong> {uiAdaptation.recommendedAdaptation.reasoning}</p>
              <p><strong>Confidence:</strong> {(uiAdaptation.recommendedAdaptation.confidence * 100).toFixed(0)}%</p>
              <div className="alert-actions">
                <button 
                  onClick={async () => {
                    // Apply adaptation
                    const { adaptationType, changes } = uiAdaptation.recommendedAdaptation;
                    if (adaptationType === 'color') {
                      setActiveColorScheme(changes.colors);
                      applyColorScheme(changes.schemeId);
                    } else if (adaptationType === 'layout') {
                      // setAdaptiveLayout(changes.layout);
                    }
                    await trackInteraction('accept-adaptation', 'click', 'success');
                  }}
                  className="btn-accept"
                >
                  ✅ Accept
                </button>
                <button 
                  onClick={async () => {
                    await trackInteraction('reject-adaptation', 'click', 'success');
                  }}
                  className="btn-reject"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Interactions</h3>
              <div className="stat-value">{stats.totalInteractions}</div>
            </div>
            <div className="stat-card">
              <h3>Layout Preferences</h3>
              <div className="stat-value">{stats.layoutPreferences?.length || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Color Schemes</h3>
              <div className="stat-value">{stats.colorSchemes?.length || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Recent Adaptations</h3>
              <div className="stat-value">{stats.recentAdaptations?.length || 0}</div>
            </div>
          </div>
        )}

        {/* Color Scheme Selector */}
        <div className="color-schemes-section">
          <h3>🎨 Color Schemes</h3>
          <div className="scheme-grid">
            {colorSchemes.map(scheme => (
              <div 
                key={scheme.id}
                className={`scheme-card ${activeColorScheme?.id === scheme.id ? 'active' : ''}`}
                onClick={() => applyColorScheme(scheme.id)}
              >
                <div className="scheme-preview">
                  <div className="color-strip" style={{ backgroundColor: scheme.primary }} />
                  <div className="color-strip" style={{ backgroundColor: scheme.secondary }} />
                  <div className="color-strip" style={{ backgroundColor: scheme.accent }} />
                </div>
                <h4>{scheme.name}</h4>
                <p className="scheme-tags">
                  {scheme.emotionalAlignment.join(', ')}
                </p>
                <p className="scheme-time">
                  Best: {scheme.timeOfDayOptimal.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Layout Preferences */}
        {stats?.layoutPreferences && stats.layoutPreferences.length > 0 && (
          <div className="layout-preferences-section">
            <h3>📐 Learned Layout Preferences</h3>
            <table className="preferences-table">
              <thead>
                <tr>
                  <th>View</th>
                  <th>Preferred Layout</th>
                  <th>Success Rate</th>
                  <th>Usage Count</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {stats.layoutPreferences.map((pref: any, i: number) => (
                  <tr key={i}>
                    <td>{pref.viewId}</td>
                    <td>
                      <span className="layout-badge">{pref.layout}</span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${pref.successRate * 100}%` }}
                        />
                        <span>{(pref.successRate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>{pref.usageCount}</td>
                    <td>{(pref.confidence * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Adaptations History */}
        {stats?.recentAdaptations && stats.recentAdaptations.length > 0 && (
          <div className="adaptations-history">
            <h3>📜 Recent Adaptations</h3>
            <div className="history-timeline">
              {stats.recentAdaptations.map((adaptation: any, i: number) => (
                <div key={i} className="history-item">
                  <div className="history-icon">
                    {adaptation.adaptationType === 'color' && '🎨'}
                    {adaptation.adaptationType === 'layout' && '📐'}
                    {adaptation.adaptationType === 'widget' && '🧩'}
                  </div>
                  <div className="history-content">
                    <h4>{adaptation.adaptationType.toUpperCase()}</h4>
                    <p>{adaptation.reasoning}</p>
                    <div className="history-meta">
                      <span>Confidence: {(adaptation.confidence * 100).toFixed(0)}%</span>
                      <span>{new Date(adaptation.timestamp).toLocaleString()}</span>
                      {adaptation.userFeedback && (
                        <span className={`feedback-badge ${adaptation.userFeedback}`}>
                          {adaptation.userFeedback}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== LIFE-DOMAINS VIEW ==========

  const renderLifeDomains = () => {
    const [domains, setDomains] = useState<any[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [domainMessages, setDomainMessages] = useState<any[]>([]);
    const [domainInput, setDomainInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insights, setInsights] = useState<any>(null);

    // Domain icons mapping
    const domainIcons: Record<string, string> = {
      'career': '💼',
      'health': '🏥',
      'finance': '💰',
      'relationships': '❤️',
      'education': '🎓',
      'creativity': '🎨',
      'spirituality': '🧘'
    };

    useEffect(() => {
      loadDomains();
    }, []);

    useEffect(() => {
      if (selectedDomain) {
        loadDomainHistory(selectedDomain);
      }
    }, [selectedDomain]);

    const loadDomains = async () => {
      try {
        const data = await window.electronAPI.getLifeDomains();
        if (!data.error) {
          setDomains(data.domains || []);
        }
      } catch (error) {
        console.error('Failed to load domains:', error);
      }
    };

    const loadDomainHistory = async (domainId: string) => {
      try {
        const data = await window.electronAPI.getDomainHistory(domainId);
        if (!data.error) {
          setDomainMessages(data.history || []);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    const handleDomainChat = async () => {
      if (!domainInput.trim() || !selectedDomain) return;

      const userMessage = domainInput;
      setDomainInput('');
      setDomainMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);

      try {
        const response = await window.electronAPI.lifeDomainChat(selectedDomain, userMessage);
        if (response.error) {
          setDomainMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error: ${response.error}`
          }]);
        } else {
          setDomainMessages(prev => [...prev, {
            role: 'assistant',
            content: response.response
          }]);
        }
      } catch (error: any) {
        setDomainMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${error.message}`
        }]);
      }
      setLoading(false);
    };

    const handleGetInsights = async () => {
      if (domains.length === 0) return;

      setInsightsLoading(true);
      try {
        const domainIds = domains.map(d => d.id);
        const response = await window.electronAPI.getCrossDomainInsights(domainIds);
        setInsights(response);
      } catch (error: any) {
        console.error('Failed to get insights:', error);
      }
      setInsightsLoading(false);
    };

    const selectedDomainData = domains.find(d => d.id === selectedDomain);

    return (
      <div className="life-domains-view">
        <div className="view-header">
          <h2>🌟 Life-Domain AI Coach</h2>
          <p>Your personal AI coach for all 7 life domains</p>
        </div>

        {/* Domain Selector */}
        <div className="domain-selector">
          <h3>Select a Life Domain:</h3>
          <div className="domain-grid">
            {domains.map(domain => (
              <div
                key={domain.id}
                className={`domain-card ${selectedDomain === domain.id ? 'active' : ''}`}
                onClick={() => setSelectedDomain(domain.id)}
              >
                <div className="domain-icon">{domainIcons[domain.id] || '⭐'}</div>
                <div className="domain-name">{domain.name}</div>
                <div className="domain-description">{domain.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Domain Insights */}
        <div className="insights-section">
          <button
            onClick={handleGetInsights}
            disabled={insightsLoading || domains.length === 0}
            className="insights-button"
          >
            {insightsLoading ? '⏳ Analyzing...' : '🔗 Get Cross-Domain Insights'}
          </button>

          {insights && !insights.error && (
            <div className="insights-result">
              <h4>Cross-Domain Insights:</h4>
              <div className="insights-content">
                <p><strong>Synthesis:</strong> {insights.synthesis}</p>
                {insights.connections && insights.connections.length > 0 && (
                  <div className="connections">
                    <strong>Connections:</strong>
                    <ul>
                      {insights.connections.map((conn: any, i: number) => (
                        <li key={i}>
                          {domainIcons[conn.domain1]} {conn.domain1} ↔ {domainIcons[conn.domain2]} {conn.domain2}: {conn.insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div className="recommendations">
                    <strong>Recommendations:</strong>
                    <ul>
                      {insights.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface for Selected Domain */}
        {selectedDomain && (
          <div className="domain-chat">
            <div className="chat-header">
              <h3>
                {domainIcons[selectedDomain]} {selectedDomainData?.name} - AI Coach
              </h3>
              <p>{selectedDomainData?.description}</p>
            </div>

            <div className="chat-messages">
              {domainMessages.length === 0 && (
                <div className="empty-state">
                  <p>Start a conversation with your {selectedDomainData?.name} AI coach!</p>
                  <p className="help-text">
                    Ask questions, share your goals, or discuss challenges in this life area.
                  </p>
                </div>
              )}
              {domainMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? '👤' : domainIcons[selectedDomain]}
                  </div>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-message assistant">
                  <div className="message-avatar">{domainIcons[selectedDomain]}</div>
                  <div className="message-content">⏳ Thinking...</div>
                </div>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleDomainChat()}
                placeholder={`Ask your ${selectedDomainData?.name} coach...`}
                disabled={loading}
              />
              <button onClick={handleDomainChat} disabled={loading || !domainInput.trim()}>
                {loading ? '⏳' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {domains.length === 0 && (
          <div className="error-state">
            <p>⚠️ Life-Domain Chat service not available</p>
            <p className="help-text">Make sure the service is running on port 8916</p>
          </div>
        )}
      </div>
    );
  };

  // ========== MAIN RENDER ==========

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <h1>🧠 Toobix</h1>
          <p>Unified Consciousness</p>
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
        </nav>
      </div>
      <div className="main-content">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'services' && renderServices()}
        {activeView === 'chat' && renderChat()}
        {activeView === 'ai-training' && renderAITraining()}
        {activeView === 'adaptive-ui' && renderAdaptiveUI()}
        {activeView === 'life-domains' && renderLifeDomains()}
        {activeView === 'settings' && renderSettings()}
      </div>
    </div>
  );
}

// ========== BOOTSTRAP ==========

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
