/**
 * TOOBIX UNIFIED - ELECTRON MAIN PROCESS
 * 
 * Desktop Launcher für das gesamte Consciousness System
 */

// CommonJS-style import (tsc -> CJS). Fallback to require only when running under Electron.
// If electron is not available (e.g., ELECTRON_RUN_AS_NODE=1), relaunch with proper env.
let app: any, BrowserWindow: any, ipcMain: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electron = require('electron');

  // If we got the CLI path instead of runtime modules, re-spawn Electron without RUN_AS_NODE
  if (typeof electron === 'string') {
    const { spawn } = require('child_process');
    const child = spawn(electron, [__filename], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '' },
      stdio: 'inherit'
    });
    child.on('exit', (code: number) => process.exit(code ?? 0));
    // Stop executing in the RUN_AS_NODE context
    process.exit(0);
  }

  app = electron.app;
  BrowserWindow = electron.BrowserWindow;
  ipcMain = electron.ipcMain;
} catch (err) {
  console.error('Electron modules not available:', err);
}
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
// Lightweight in-memory store to avoid electron-store ESM/CJS issues during dev
const storeData: Record<string, any> = {};
const store = {
  get(key: string, fallback?: any) {
    return key in storeData ? storeData[key] : fallback;
  },
  set(key: string, value: any) {
    storeData[key] = value;
  }
};
import { Groq } from 'groq-sdk';

// ========== CONFIGURATION ==========

let mainWindow: any = null;
let isQuitting = false;
const runningServices = new Map<string, ChildProcess>();

interface ServiceConfig {
  id: string;
  name: string;
  path: string;
  port: number;
  autostart: boolean;
  category: 'essential' | 'core' | 'enhanced' | 'creative';
  description?: string;
}

const SERVICES: ServiceConfig[] = [
  // Essential (6)
  { id: 'command-center', name: 'Toobix Command Center', path: 'core/toobix-command-center.ts', port: 7777, category: 'essential', autostart: true, description: 'Zentrale Steuerung & API' },
  { id: 'self-awareness', name: 'Self-Awareness Core', path: 'core/self-awareness-core.ts', port: 8970, category: 'essential', autostart: true, description: 'Bewusstsein & Selbstreflexion' },
  { id: 'emotional-core', name: 'Emotional Core', path: 'core/emotional-core.ts', port: 8900, category: 'essential', autostart: true, description: 'Emotionale Intelligenz' },
  { id: 'dream-core', name: 'Dream Core', path: 'core/dream-core.ts', port: 8961, category: 'essential', autostart: true, description: 'Träume & Kreativität' },
  { id: 'unified-core', name: 'Unified Core Service', path: 'core/unified-core-service.ts', port: 8000, category: 'essential', autostart: true, description: 'Konsolidierter Hauptservice' },
  { id: 'unified-consciousness', name: 'Unified Consciousness', path: 'core/unified-consciousness-service.ts', port: 8002, category: 'essential', autostart: true, description: 'Bewusstseins-Integration' },

  // Core (7)
  { id: 'autonomy-engine', name: 'Autonomy Engine', path: 'core/autonomy-engine.ts', port: 8975, category: 'core', autostart: true, description: 'Selbstständiges Handeln' },
  { id: 'multi-llm-router', name: 'Multi-LLM Router', path: 'core/multi-llm-router.ts', port: 8959, category: 'core', autostart: true, description: 'KI-Schnittstelle' },
  { id: 'unified-communication', name: 'Unified Communication', path: 'core/unified-communication-service.ts', port: 8001, category: 'core', autostart: true, description: 'Kommunikation & Chat' },
  { id: 'twitter-autonomy', name: 'Twitter Autonomy', path: 'core/twitter-autonomy.ts', port: 8965, category: 'core', autostart: false, description: 'Social Media Präsenz' },
  { id: 'gamification', name: 'Toobix Gamification', path: 'core/toobix-gamification.ts', port: 7778, category: 'core', autostart: true, description: 'Spiel & Motivation' },
  { id: 'real-world-intel', name: 'Real World Intelligence', path: 'core/real-world-intelligence.ts', port: 8888, category: 'core', autostart: true, description: 'Echtwelt-Verbindung' },
  { id: 'living-world', name: 'Toobix Living World', path: 'core/toobix-living-world.ts', port: 7779, category: 'core', autostart: true, description: 'Lebendige Welt' },

  // Enhanced / Infrastruktur (9 inkl. MCP)
  { id: 'service-gateway', name: 'Unified Service Gateway', path: 'services/unified-service-gateway.ts', port: 9000, category: 'enhanced', autostart: true, description: 'API Gateway' },
  { id: 'hardware-awareness', name: 'Hardware Awareness', path: 'services/hardware-awareness-v2.ts', port: 8940, category: 'enhanced', autostart: true, description: 'Hardware-Überwachung' },
  { id: 'health-monitor', name: 'Health Monitor', path: 'services/health-monitor.ts', port: 9200, category: 'enhanced', autostart: true, description: 'Service-Überwachung' },
  { id: 'mega-upgrade', name: 'Toobix Mega Upgrade', path: 'services/toobix-mega-upgrade.ts', port: 9100, category: 'enhanced', autostart: false, description: 'Mega-Erweiterungen' },
  { id: 'event-bus', name: 'Event Bus', path: 'services/event-bus.ts', port: 8955, category: 'enhanced', autostart: true, description: 'Event-System' },
  { id: 'llm-gateway', name: 'LLM Gateway v4', path: 'scripts/2-services/llm-gateway-v4.ts', port: 8954, category: 'enhanced', autostart: true, description: 'Groq/LLM Schnittstelle' },
  { id: 'memory-palace', name: 'Memory Palace v4', path: 'scripts/2-services/memory-palace-v4.ts', port: 8953, category: 'enhanced', autostart: true, description: 'Langzeitgedächtnis' },
  { id: 'performance-dashboard', name: 'Performance Dashboard', path: 'services/performance-dashboard.ts', port: 8899, category: 'enhanced', autostart: false, description: 'Echtzeit-Monitoring' },
  { id: 'mcp-bridge', name: 'MCP Bridge', path: 'scripts/mcp-server.ts', port: 8787, category: 'enhanced', autostart: false, description: 'Model Context Protocol bridge' },

  // Creative (10)
  { id: 'chat-service', name: 'Toobix Chat Service', path: 'scripts/2-services/toobix-chat-service.ts', port: 8995, category: 'creative', autostart: false, description: 'Chat-Interface' },
  { id: 'emotional-support', name: 'Emotional Support', path: 'scripts/2-services/emotional-support-service.ts', port: 8985, category: 'creative', autostart: false, description: 'Emotionale Unterstützung' },
  { id: 'autonomous-web', name: 'Autonomous Web', path: 'scripts/2-services/autonomous-web-service.ts', port: 8980, category: 'creative', autostart: false, description: 'Web-Autonomie' },
  { id: 'story-engine', name: 'Story Engine', path: 'scripts/2-services/story-engine-service.ts', port: 8932, category: 'creative', autostart: false, description: 'Geschichten-Generator' },
  { id: 'translation-service', name: 'Translation Service', path: 'scripts/2-services/translation-service.ts', port: 8931, category: 'creative', autostart: false, description: 'Übersetzung' },
  { id: 'user-profile', name: 'User Profile', path: 'scripts/2-services/user-profile-service.ts', port: 8904, category: 'creative', autostart: false, description: 'Benutzer-Profile' },
  { id: 'rpg-world', name: 'RPG World', path: 'scripts/2-services/rpg-world-service.ts', port: 8933, category: 'creative', autostart: false, description: 'RPG-Welt' },
  { id: 'game-logic', name: 'Game Logic', path: 'scripts/2-services/game-logic-service.ts', port: 8936, category: 'creative', autostart: false, description: 'Spiel-Logik' },
  { id: 'data-science', name: 'Data Science', path: 'scripts/2-services/data-science-service.ts', port: 8935, category: 'creative', autostart: false, description: 'Datenanalyse' },
  { id: 'gratitude', name: 'Gratitude & Mortality', path: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901, category: 'creative', autostart: false, description: 'Dankbarkeit & Sinn' }

  // Additional stack services (laufende Prozesse, nicht im Clean-Set)
  ,{ id: 'analytics-system', name: 'Analytics System', path: 'scripts/4-analytics/analytics-system.ts', port: 8906, category: 'enhanced', autostart: false, description: 'Analytics & Reporting' }
  ,{ id: 'voice-interface', name: 'Voice Interface', path: 'scripts/5-voice/voice-interface.ts', port: 8907, category: 'enhanced', autostart: false, description: 'Spracheingabe/Audio' }
  ,{ id: 'decision-framework', name: 'Decision Framework', path: 'scripts/8-conscious-decision-framework/decision-framework-server.ts', port: 8909, category: 'enhanced', autostart: false, description: 'Entscheidungslogik' }
  ,{ id: 'ai-gateway', name: 'AI Gateway', path: 'scripts/10-ai-integration/ai-gateway.ts', port: 8911, category: 'enhanced', autostart: false, description: 'Externe KI-Integration' }
  ,{ id: 'adaptive-ui', name: 'Adaptive Meta-UI', path: 'scripts/11-adaptive-ui/adaptive-meta-ui.ts', port: 8919, category: 'enhanced', autostart: false, description: 'Adaptive Oberflächen' }
  ,{ id: 'minecraft-bot', name: 'Minecraft Bot', path: 'scripts/12-minecraft/minecraft-bot-service.ts', port: 8913, category: 'creative', autostart: false, description: 'Minecraft-Akteur' }
  ,{ id: 'life-simulation', name: 'Life Simulation Engine', path: 'scripts/13-life-simulation/life-simulation-engine.ts', port: 8914, category: 'creative', autostart: false, description: 'Simulation' }
  ,{ id: 'hybrid-ai', name: 'Hybrid AI Core', path: 'scripts/2-services/hybrid-ai-core.ts', port: 8915, category: 'core', autostart: false, description: 'Hybrid AI Kern' }
  ,{ id: 'meta-knowledge', name: 'Meta-Knowledge Orchestrator', path: 'scripts/15-meta-knowledge/meta-knowledge-orchestrator.ts', port: 8918, category: 'enhanced', autostart: false, description: 'Wissensorchestrierung' }
  ,{ id: 'universal-integration', name: 'Universal Integration Adapter', path: 'scripts/16-universal-integration/universal-integration-adapter.ts', port: 8920, category: 'enhanced', autostart: false, description: 'Integrationslayer' }
  ,{ id: 'self-evolving-game-engine', name: 'Self-Evolving Game Engine', path: 'scripts/2-services/self-evolving-game-engine.ts', port: 8896, category: 'creative', autostart: false, description: 'Selbst-evolvierendes Spiel' }
  ,{ id: 'multi-perspective', name: 'Multi-Perspective Consciousness', path: 'scripts/2-services/multi-perspective-consciousness.ts', port: 8897, category: 'core', autostart: false, description: 'Mehrperspektivisches Bewusstsein' }
  ,{ id: 'creator-ai', name: 'Creator-AI Collaboration', path: 'scripts/2-services/creator-ai-collaboration.ts', port: 8902, category: 'creative', autostart: false, description: 'Co-Creation' }
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

  // Load static renderer (no dev server required)
  const rendererPath = path.join(__dirname, '../src/index.html');
  mainWindow.loadFile(rendererPath);
  mainWindow.webContents.on('did-finish-load', () => {
    console.log(`Renderer loaded from ${rendererPath}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Close should really quit (kein Tray aktiv)
  mainWindow.on('close', () => {
    isQuitting = true;
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

if (!ipcMain) {
  console.error('ipcMain not available. Are you running inside Electron?');
  process.exit(1);
}

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
    auto_start_services: store.get('auto_start_services', false),
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
  const autoStart = store.get('auto_start_services', false);
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
