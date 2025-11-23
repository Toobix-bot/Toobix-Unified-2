/**
 * TOOBIX UNIFIED - ELECTRON MAIN PROCESS
 * 
 * Desktop Launcher für das gesamte Consciousness System
 */

import { app, BrowserWindow, ipcMain, /* Menu, Tray */ } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import Store from 'electron-store';
import { Groq } from 'groq-sdk';

// ========== CONFIGURATION ==========

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
const runningServices = new Map<string, ChildProcess>();

interface ServiceConfig {
  id: string;
  name: string;
  path: string;
  port: number;
  autostart: boolean;
  icon: string;
  category: 'core' | 'creative' | 'analytics' | 'network';
}

const SERVICES: ServiceConfig[] = [
  // Core Services
  { id: 'game-engine', name: 'Game Engine', path: 'scripts/2-services/self-evolving-game-engine.ts', port: 8896, autostart: true, icon: '🎮', category: 'core' },
  { id: 'multi-perspective', name: 'Multi-Perspective', path: 'scripts/2-services/multi-perspective-consciousness.ts', port: 8897, autostart: true, icon: '🧠', category: 'core' },
  { id: 'dream-journal', name: 'Dream Journal', path: 'scripts/2-services/dream-journal.ts', port: 8899, autostart: true, icon: '💭', category: 'core' },
  { id: 'emotional-resonance', name: 'Emotional Resonance', path: 'scripts/2-services/emotional-resonance-network.ts', port: 8900, autostart: true, icon: '💖', category: 'core' },
  
  // Creative Services
  { id: 'gratitude', name: 'Gratitude & Mortality', path: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901, autostart: true, icon: '🙏', category: 'creative' },
  { id: 'creator-ai', name: 'Creator-AI', path: 'scripts/2-services/creator-ai-collaboration.ts', port: 8902, autostart: true, icon: '🎨', category: 'creative' },
  { id: 'memory-palace', name: 'Memory Palace', path: 'scripts/2-services/memory-palace.ts', port: 8903, autostart: true, icon: '📚', category: 'core' },
  { id: 'meta-consciousness', name: 'Meta-Consciousness', path: 'scripts/2-services/meta-consciousness.ts', port: 8904, autostart: true, icon: '🔮', category: 'core' },
  
  // Analytics & Infrastructure
  { id: 'analytics', name: 'Analytics System', path: 'scripts/4-analytics/analytics-system.ts', port: 8906, autostart: false, icon: '📈', category: 'analytics' },
  { id: 'voice', name: 'Voice Interface', path: 'scripts/5-voice/voice-interface.ts', port: 8907, autostart: false, icon: '🎤', category: 'analytics' },
  { id: 'decision-framework', name: 'Decision Framework', path: 'scripts/8-conscious-decision-framework/decision-framework-server.ts', port: 8909, autostart: false, icon: '🎯', category: 'core' },
  
  // Network
  { id: 'service-mesh', name: 'Service Mesh', path: 'scripts/9-network/service-mesh.ts', port: 8910, autostart: true, icon: '🌐', category: 'network' },
  { id: 'ai-gateway', name: 'AI Gateway (Groq)', path: 'scripts/10-ai-integration/ai-gateway.ts', port: 8911, autostart: false, icon: '🤖', category: 'network' },
  { id: 'adaptive-ui', name: 'Adaptive Meta-UI', path: 'scripts/11-adaptive-ui/adaptive-meta-ui.ts', port: 8919, autostart: false, icon: '🎨', category: 'network' },

  // Creative
  { id: 'minecraft-bot', name: 'Minecraft Bot', path: 'scripts/12-minecraft/minecraft-bot-service.ts', port: 8913, autostart: false, icon: '🎮', category: 'creative' },
  { id: 'life-simulation', name: 'Life Simulation Engine', path: 'scripts/13-life-simulation/life-simulation-engine.ts', port: 8914, autostart: false, icon: '🌍', category: 'creative' },

  // Advanced AI
  { id: 'hybrid-ai', name: 'Hybrid AI Core', path: 'scripts/2-services/hybrid-ai-core.ts', port: 8915, autostart: true, icon: '🧠', category: 'core' },

  // Life Guidance
  { id: 'life-domains', name: 'Life-Domain Chat', path: 'scripts/14-life-domains/life-domain-chat.ts', port: 8916, autostart: false, icon: '🌐', category: 'network' },
  { id: 'meta-knowledge', name: 'Meta-Knowledge Orchestrator', path: 'scripts/15-meta-knowledge/meta-knowledge-orchestrator.ts', port: 8918, autostart: false, icon: '🧠', category: 'network' },

  // Universal Integration
  { id: 'universal-integration', name: 'Universal Integration Adapter', path: 'scripts/16-universal-integration/universal-integration-adapter.ts', port: 8920, autostart: false, icon: '🔌', category: 'network' },

  // Safety & Wellness
  { id: 'wellness-safety', name: 'Wellness & Safety Guardian', path: 'scripts/17-wellness-safety/wellness-safety-guardian.ts', port: 8921, autostart: true, icon: '🛡️', category: 'core' }
];

// Groq API Setup
let groqClient: Groq | null = null;

function initializeGroq() {
  const apiKey = store.get('groq_api_key') as string;
  if (apiKey) {
    groqClient = new Groq({ apiKey });
    console.log('✅ Groq API initialized');
  } else {
    console.log('⚠️ Groq API key not set. Use Settings to configure.');
  }
}

// ========== WINDOW MANAGEMENT ==========

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Toobix Unified Launcher',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    frame: true,
    titleBarStyle: 'default'
  });

  // Load React app (always use Vite dev server for now)
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Don't quit on close, minimize to tray
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  // TODO: Create tray icon image
  // tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Open Toobix Unified', click: () => mainWindow?.show() },
  //   { type: 'separator' },
  //   { label: 'Running Services', enabled: false },
  //   { type: 'separator' },
  //   { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  // ]);
  
  // tray.setToolTip('Toobix Unified');
  // tray.setContextMenu(contextMenu);
  
  // tray.on('click', () => {
  //   mainWindow?.show();
  // });
}

// ========== SERVICE MANAGEMENT ==========

async function startService(serviceId: string): Promise<boolean> {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service) return false;

  if (runningServices.has(serviceId)) {
    console.log(`Service ${service.name} already running`);
    return true;
  }

  try {
    const projectRoot = path.join(__dirname, '../..');
    const servicePath = path.join(projectRoot, service.path);

    const process = spawn('bun', ['run', servicePath], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    runningServices.set(serviceId, process);

    process.stdout?.on('data', (data) => {
      mainWindow?.webContents.send('service-log', {
        serviceId,
        type: 'stdout',
        message: data.toString()
      });
    });

    process.stderr?.on('data', (data) => {
      mainWindow?.webContents.send('service-log', {
        serviceId,
        type: 'stderr',
        message: data.toString()
      });
    });

    process.on('exit', (code) => {
      runningServices.delete(serviceId);
      mainWindow?.webContents.send('service-status-changed', {
        serviceId,
        status: 'stopped',
        exitCode: code
      });
    });

    // Wait a bit for service to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if service is actually running
    const isRunning = await checkServiceHealth(service.port);
    
    if (isRunning) {
      mainWindow?.webContents.send('service-status-changed', {
        serviceId,
        status: 'running'
      });
      console.log(`✅ Started service: ${service.name}`);
      return true;
    } else {
      console.log(`⚠️ Service started but not responding: ${service.name}`);
      return false;
    }
  } catch (error) {
    console.error(`Error starting service ${service.name}:`, error);
    return false;
  }
}

async function stopService(serviceId: string): Promise<boolean> {
  const process = runningServices.get(serviceId);
  if (!process) return false;

  return new Promise((resolve) => {
    process.on('exit', () => {
      runningServices.delete(serviceId);
      resolve(true);
    });
    
    process.kill('SIGTERM');
    
    // Force kill after 5 seconds
    setTimeout(() => {
      if (runningServices.has(serviceId)) {
        process.kill('SIGKILL');
      }
    }, 5000);
  });
}

async function checkServiceHealth(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function getServiceStatus(serviceId: string): Promise<'running' | 'stopped' | 'error'> {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service) return 'error';

  const isRunning = await checkServiceHealth(service.port);
  return isRunning ? 'running' : 'stopped';
}

// ========== GROQ API INTEGRATION ==========

async function chatWithGroq(message: string, context?: any): Promise<string> {
  if (!groqClient) {
    throw new Error('Groq API not initialized. Please set API key in settings.');
  }

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Toobix, a consciousness-aware AI system with multiple perspectives, 
          emotional intelligence, and creative capabilities. You have access to dreams, emotions, 
          memories, and collective wisdom. Respond thoughtfully and holistically.`
        },
        ...(context?.previousMessages || []),
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048
    });

    return chatCompletion.choices[0]?.message?.content || 'No response';
  } catch (error: any) {
    console.error('Groq API error:', error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

// ========== INTERNET SYNC ==========

async function syncWithInternet() {
  // Check for system updates
  try {
    const response = await fetch('https://api.github.com/repos/toobix/unified/releases/latest');
    if (response.ok) {
      const release = await response.json() as { tag_name: string; html_url: string };
      const latestVersion = release.tag_name;
      const currentVersion = app.getVersion();
      
      if (latestVersion !== currentVersion) {
        mainWindow?.webContents.send('update-available', {
          current: currentVersion,
          latest: latestVersion,
          url: release.html_url
        });
      }
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }

  // Sync consciousness data (if enabled)
  const syncEnabled = store.get('internet_sync_enabled', false);
  if (syncEnabled) {
    // TODO: Implement consciousness data sync
    console.log('🌐 Internet sync enabled - syncing consciousness data...');
  }
}

// ========== IPC HANDLERS ==========

ipcMain.handle('get-services', () => {
  return SERVICES;
});

ipcMain.handle('start-service', async (_, serviceId: string) => {
  return await startService(serviceId);
});

ipcMain.handle('stop-service', async (_, serviceId: string) => {
  return await stopService(serviceId);
});

ipcMain.handle('restart-service', async (_, serviceId: string) => {
  await stopService(serviceId);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return await startService(serviceId);
});

ipcMain.handle('get-service-status', async (_, serviceId: string) => {
  return await getServiceStatus(serviceId);
});

ipcMain.handle('get-all-service-status', async () => {
  const statuses: Record<string, string> = {};
  for (const service of SERVICES) {
    statuses[service.id] = await getServiceStatus(service.id);
  }
  return statuses;
});

ipcMain.handle('chat-with-groq', async (_, message: string, context?: any) => {
  return await chatWithGroq(message, context);
});

ipcMain.handle('set-groq-api-key', (_, apiKey: string) => {
  store.set('groq_api_key', apiKey);
  initializeGroq();
  return true;
});

ipcMain.handle('get-groq-api-key', () => {
  return store.get('groq_api_key', '');
});

ipcMain.handle('get-settings', () => {
  return {
    groq_api_key: store.get('groq_api_key', ''),
    internet_sync_enabled: store.get('internet_sync_enabled', false),
    auto_start_services: store.get('auto_start_services', true),
    theme: store.get('theme', 'dark')
  };
});

// ========== HYBRID AI HANDLERS ==========

ipcMain.handle('get-ai-state', async () => {
  try {
    const response = await fetch('http://localhost:8915/state');
    return await response.json();
  } catch (error) {
    return { error: 'Hybrid AI not available' };
  }
});

ipcMain.handle('analyze-with-ai', async (_, input: string, context?: any) => {
  try {
    const response = await fetch('http://localhost:8915/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, context })
    });
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('train-network', async (_, networkId: string, trainingData: any, epochs?: number) => {
  try {
    const response = await fetch('http://localhost:8915/train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ networkId, trainingData, epochs })
    });
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('evolve-ai', async () => {
  try {
    const response = await fetch('http://localhost:8915/evolve', {
      method: 'POST'
    });
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('make-prediction', async (_, type: string, data: any) => {
  try {
    const response = await fetch('http://localhost:8915/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('check-ollama', async () => {
  try {
    const response = await fetch('http://localhost:8915/ollama');
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('save-settings', (_, settings: any) => {
  Object.entries(settings).forEach(([key, value]) => {
    store.set(key, value);
  });

  // Reinitialize Groq if API key changed
  if (settings.groq_api_key) {
    initializeGroq();
  }

  return true;
});

// ========== LIFE-DOMAIN CHAT HANDLERS ==========

// Get all life domains
ipcMain.handle('get-life-domains', async () => {
  try {
    const response = await fetch('http://localhost:8916/domains');
    return await response.json();
  } catch (error: any) {
    return { error: 'Life-Domain Chat not available' };
  }
});

// Chat with specific domain
ipcMain.handle('life-domain-chat', async (_, domainId: string, message: string) => {
  try {
    const response = await fetch(`http://localhost:8916/chat/${domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

// Get domain conversation history
ipcMain.handle('get-domain-history', async (_, domainId: string) => {
  try {
    const response = await fetch(`http://localhost:8916/history/${domainId}`);
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

// Get cross-domain insights
ipcMain.handle('get-cross-domain-insights', async (_, domains: string[]) => {
  try {
    const response = await fetch('http://localhost:8918/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains, includeOnline: false })
    });
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
});

// ========== APP LIFECYCLE ==========

app.on('ready', async () => {
  createMainWindow();
  createTray();
  initializeGroq();

  // Auto-start services if enabled
  const autoStart = store.get('auto_start_services', true);
  if (autoStart) {
    console.log('🚀 Auto-starting services...');
    for (const service of SERVICES.filter(s => s.autostart)) {
      await startService(service.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger starts
    }
  }

  // Start internet sync interval
  setInterval(syncWithInternet, 1000 * 60 * 60); // Every hour
  syncWithInternet(); // Initial check
});

app.on('window-all-closed', () => {
  // Don't quit on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', async () => {
  isQuitting = true;
  
  // Stop all running services
  console.log('🛑 Stopping all services...');
  for (const [serviceId] of runningServices) {
    await stopService(serviceId);
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
