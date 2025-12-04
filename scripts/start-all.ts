/**
 * TOOBIX SERVICE ORCHESTRATOR
 * Cross-platform replacement for START-ALL-SERVICES.ps1
 * Starts the requested service set and keeps them running until the user stops the process.
 */

import { spawn, ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type ServiceDefinition = {
  id: string;
  name: string;
  script: string;
  port?: number;
  healthEndpoint?: string;
  core?: boolean;
  group?: 'core' | 'creative' | 'analytics' | 'network';
};

type Mode = 'core' | 'bridge' | 'demo' | 'full';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(CURRENT_DIR, '..');

const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  // ========== TOOBIX CORE SERVICES (Konsolidiert) ==========
  { id: 'emotional-core', name: '💚 Emotional Core', script: 'core/emotional-core.ts', port: 8900, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'dream-core', name: '🌙 Dream Core', script: 'core/dream-core.ts', port: 8961, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'self-awareness', name: '🧠 Self-Awareness Core', script: 'core/self-awareness-core.ts', port: 8970, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'multi-llm-router', name: '🌐 Multi-LLM Router', script: 'core/multi-llm-router.ts', port: 8959, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'autonomy-engine', name: '🤖 Autonomy Engine', script: 'core/autonomy-engine.ts', port: 8975, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'twitter-autonomy', name: '🐦 Twitter Autonomy', script: 'core/twitter-autonomy.ts', port: 8965, core: true, group: 'core', healthEndpoint: '/health' },

  // ========== INFRASTRUCTURE SERVICES ==========
  { id: 'hardware-awareness', name: 'Hardware Awareness', script: 'services/hardware-awareness-v2.ts', port: 8940, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'unified-gateway', name: 'Unified Service Gateway', script: 'services/unified-service-gateway.ts', port: 9000, core: true, group: 'core', healthEndpoint: '/health' },
  { id: 'service-mesh', name: 'Service Mesh', script: 'scripts/9-network/service-mesh.ts', port: 8910, group: 'network' },

  // ========== LEGACY SERVICES (Bald zu archivieren) ==========
  { id: 'game-engine', name: 'Game Engine', script: 'scripts/2-services/self-evolving-game-engine.ts', port: 8896, group: 'core' },
  { id: 'multi-perspective', name: 'Multi-Perspective Consciousness', script: 'scripts/2-services/multi-perspective-consciousness.ts', port: 8897, group: 'core' },
  { id: 'gratitude', name: 'Gratitude & Mortality', script: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901, group: 'creative' },
  { id: 'creator-ai', name: 'Creator AI Collaboration', script: 'scripts/2-services/creator-ai-collaboration.ts', port: 8902, group: 'creative' },
  { id: 'memory-palace', name: 'Memory Palace', script: 'scripts/2-services/memory-palace.ts', port: 8903, group: 'core' },
  { id: 'meta-consciousness', name: 'Meta-Consciousness', script: 'scripts/2-services/meta-consciousness.ts', port: 8904, group: 'core' },
  { id: 'analytics', name: 'Analytics System', script: 'scripts/4-analytics/analytics-system.ts', port: 8906, group: 'analytics' },
  { id: 'voice', name: 'Voice Interface', script: 'scripts/5-voice/voice-interface.ts', port: 8907, group: 'analytics' },
  { id: 'decision-framework', name: 'Conscious Decision Framework', script: 'scripts/8-conscious-decision-framework/decision-framework-server.ts', port: 8909, group: 'core' },
  // { id: 'adaptive-ui', name: 'Adaptive Meta UI', script: 'scripts/11-adaptive-ui/adaptive-meta-ui.ts', port: 8919, group: 'network' }, // File doesn't exist
  { id: 'minecraft-bot', name: 'Minecraft Bot', script: 'scripts/12-minecraft/minecraft-bot-service.ts', port: 8913, group: 'creative' },
  { id: 'life-simulation', name: 'Life Simulation Engine', script: 'scripts/13-life-simulation/life-simulation-engine.ts', port: 8914, group: 'creative' },
  { id: 'hybrid-ai', name: 'Hybrid AI Core', script: 'scripts/2-services/hybrid-ai-core.ts', port: 8915, group: 'core' },
  { id: 'life-domains', name: 'Life-Domain Chat', script: 'scripts/14-life-domains/life-domain-chat.ts', port: 8916, group: 'network' },
  { id: 'meta-knowledge', name: 'Meta-Knowledge Orchestrator', script: 'scripts/15-meta-knowledge/meta-knowledge-orchestrator.ts', port: 8918, group: 'network' },
  { id: 'universal-integration', name: 'Universal Integration Adapter', script: 'scripts/16-universal-integration/universal-integration-adapter.ts', port: 8920, group: 'network' },
  { id: 'wellness-safety', name: 'Wellness & Safety Guardian', script: 'scripts/17-wellness-safety/wellness-safety-guardian.ts', port: 8921, group: 'core' }
];

const MODE_SERVICE_MAP: Record<Mode, string[]> = {
  core: [
    'hardware-awareness',
    'unified-gateway',
    'emotional-core',
    'dream-core',
    'self-awareness',
    'multi-llm-router'
  ],
  bridge: [
    'hardware-awareness',
    'unified-gateway',
    'service-mesh',
    'emotional-core',
    'dream-core',
    'self-awareness',
    'multi-llm-router',
    'multi-perspective',
    'memory-palace',
    'meta-consciousness'
  ],
  demo: [
    'hardware-awareness',
    'unified-gateway',
    'emotional-core',
    'dream-core',
    'self-awareness',
    'multi-llm-router',
    'autonomy-engine',
    'game-engine',
    'gratitude',
    'memory-palace',
    'hybrid-ai',
    'adaptive-ui'
  ],
  full: SERVICE_DEFINITIONS.map((service) => service.id)
};

const runningServices = new Map<string, ChildProcess>();

function parseMode(): Mode {
  const modeIndex = process.argv.findIndex((arg) => arg === '--mode');
  if (modeIndex !== -1) {
    const candidate = process.argv[modeIndex + 1] as Mode | undefined;
    if (candidate && candidate in MODE_SERVICE_MAP) {
      return candidate;
    }
    console.warn(`Unbekannter Modus "${candidate}", es wird der Kernmodus gestartet.`);
  }
  return 'core';
}

function flagEnabled(flag: string) {
  return process.argv.includes(flag);
}

function getServiceDefinition(id: string): ServiceDefinition {
  const service = SERVICE_DEFINITIONS.find((entry) => entry.id === id);
  if (!service) {
    throw new Error(`Unbekannter Service: ${id}`);
  }
  return service;
}

async function waitForHealth(port: number, endpoint: string = '/health', retries = 40) {
  const url = `http://localhost:${port}${endpoint}`;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) {
        return;
      }
    } catch {
      // ignore - retry
    }
    await Bun.sleep(500);
  }
  throw new Error(`Service antwortet nicht auf ${url}`);
}

async function isServiceResponsive(service: ServiceDefinition) {
  if (!service.port || typeof service.healthEndpoint !== 'string') {
    return false;
  }

  const url = `http://localhost:${service.port}${service.healthEndpoint}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function startService(service: ServiceDefinition) {
  if (runningServices.has(service.id)) {
    console.log(`[${service.id}] läuft bereits`);
    return;
  }

  if (await isServiceResponsive(service)) {
    console.log(`[${service.id}] ist bereits aktiv auf Port ${service.port}`);
    return;
  }

  const scriptPath = path.join(REPO_ROOT, service.script);
  console.log(`\n▶ Starte ${service.name} (${service.id})`);

  const child = spawn('bun', [scriptPath], {
    cwd: REPO_ROOT,
    stdio: 'inherit'
  });

  runningServices.set(service.id, child);

  child.on('exit', (code) => {
    runningServices.delete(service.id);
    console.log(`\n■ ${service.name} wurde beendet (Code: ${code ?? 'unbekannt'})`);
  });

  if (service.port && typeof service.healthEndpoint === 'string') {
    try {
      await waitForHealth(service.port, service.healthEndpoint);
      console.log(`✓ ${service.name} antwortet auf Port ${service.port}`);
    } catch (error: any) {
      console.warn(`⚠ ${service.name} antwortet nicht: ${error?.message ?? error}`);
    }
  }
}

async function startSelectedServices(mode: Mode) {
  const selection = MODE_SERVICE_MAP[mode];
  for (const id of selection) {
    const definition = getServiceDefinition(id);
    await startService(definition);
  }
}

async function shutdown() {
  if (!runningServices.size) {
    process.exit(0);
  }

  console.log('\n⏹ Stoppe Services...');
  for (const [id, child] of runningServices) {
    console.log(`- ${id} wird beendet`);
    child.kill('SIGTERM');
  }

  // Give processes time to exit gracefully.
  await Bun.sleep(1000);
  process.exit(0);
}

async function main() {
  const mode = parseMode();
  const awaken = flagEnabled('--awaken');
  const autonomy = flagEnabled('--autonomy');

  console.log('========================================');
  console.log('  TOOBIX SERVICE ORCHESTRATOR');
  console.log('========================================');
  console.log(`Modus: ${mode}`);
  if (awaken) {
    console.log('⚡ Awakening aktiviert');
  }
  if (autonomy) {
    console.log('🤖 Autonomy aktiviert');
  }

  await startSelectedServices(mode);

  console.log('\nAlle ausgewählten Services laufen. Drücke Strg+C zum Beenden.');

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  // Keep the process alive
  await new Promise(() => {});
}

void main().catch((error) => {
  console.error('Fehler beim Starten der Services:', error);
  void shutdown();
});
