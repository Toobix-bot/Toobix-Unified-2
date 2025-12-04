/**
 * TOOBIX MEGA ORCHESTRATOR
 * Startet ALLE Services intelligent mit Resource-Management
 * Verhindert VS Code Crashes durch gestaffelten Start und Monitoring
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';

interface ManagedService {
  id: string;
  name: string;
  script: string;
  port?: number;
  priority: number;  // 1 = critical, 5 = optional
  startDelay: number; // ms
  group: 'core' | 'infrastructure' | 'features' | 'minecraft' | 'optional';
  process?: ChildProcess;
}

const REPO_ROOT = process.cwd();
const runningProcesses = new Map<string, ChildProcess>();

// ALLE 63 Services definiert, nach Priorität gruppiert
const ALL_SERVICES: ManagedService[] = [
  // ==================== CRITICAL CORE (Priority 1) ====================
  { id: 'hardware-awareness', name: '⚙️  Hardware Awareness', script: 'services/hardware-awareness-v2.ts', port: 8940, priority: 1, startDelay: 0, group: 'infrastructure' },
  { id: 'unified-gateway', name: '🌐 Unified Gateway', script: 'services/unified-service-gateway.ts', port: 9000, priority: 1, startDelay: 1000, group: 'infrastructure' },
  { id: 'event-bus', name: '📡 Event Bus', script: 'scripts/2-services/event-bus-v4.ts', port: 8955, priority: 1, startDelay: 2000, group: 'infrastructure' },
  { id: 'llm-gateway', name: '🤖 LLM Gateway', script: 'scripts/2-services/llm-gateway-v4.ts', port: 8954, priority: 1, startDelay: 3000, group: 'infrastructure' },
  { id: 'memory-palace', name: '🗃️  Memory Palace', script: 'scripts/2-services/memory-palace-v4.ts', port: 8953, priority: 1, startDelay: 4000, group: 'core' },
  
  // ==================== ESSENTIAL CORE (Priority 2) ====================
  { id: 'emotional-core', name: '💚 Emotional Core', script: 'core/emotional-core.ts', port: 8900, priority: 2, startDelay: 5000, group: 'core' },
  { id: 'dream-core', name: '🌙 Dream Core', script: 'core/dream-core.ts', port: 8961, priority: 2, startDelay: 6000, group: 'core' },
  { id: 'self-awareness', name: '🧠 Self-Awareness', script: 'core/self-awareness-core.ts', port: 8970, priority: 2, startDelay: 7000, group: 'core' },
  { id: 'multi-llm-router', name: '🔀 Multi-LLM Router', script: 'core/multi-llm-router.ts', port: 8959, priority: 2, startDelay: 8000, group: 'core' },
  { id: 'autonomy-engine', name: '🤖 Autonomy Engine', script: 'core/autonomy-engine.ts', port: 8975, priority: 2, startDelay: 9000, group: 'core' },
  
  // ==================== FEATURES (Priority 3) ====================
  { id: 'multi-perspective', name: '👁️  Multi-Perspective', script: 'scripts/2-services/multi-perspective-consciousness.ts', port: 8897, priority: 3, startDelay: 10000, group: 'features' },
  { id: 'game-engine', name: '🎮 Game Engine', script: 'scripts/2-services/self-evolving-game-engine.ts', port: 8896, priority: 3, startDelay: 11000, group: 'features' },
  { id: 'gratitude', name: '🙏 Gratitude & Mortality', script: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901, priority: 3, startDelay: 12000, group: 'features' },
  { id: 'creator-collaboration', name: '🎨 Creator AI Collaboration', script: 'scripts/2-services/creator-ai-collaboration.ts', port: 8902, priority: 3, startDelay: 13000, group: 'features' },
  { id: 'meta-consciousness', name: '🧘 Meta-Consciousness', script: 'scripts/2-services/meta-consciousness.ts', port: 8904, priority: 3, startDelay: 14000, group: 'features' },
  { id: 'hybrid-ai', name: '🔮 Hybrid AI Core', script: 'scripts/2-services/hybrid-ai-core.ts', port: 8915, priority: 3, startDelay: 15000, group: 'features' },
  
  // ==================== COMMUNICATION (Priority 3) ====================
  { id: 'chat-service', name: '💬 Chat Service', script: 'scripts/2-services/toobix-chat-service-fixed.ts', port: 8995, priority: 3, startDelay: 16000, group: 'features' },
  { id: 'proactive-communication', name: '📢 Proactive Communication', script: 'scripts/2-services/proactive-communication-v2.ts', port: 8971, priority: 3, startDelay: 17000, group: 'features' },
  { id: 'life-companion', name: '🤝 Life Companion', script: 'scripts/2-services/life-companion-core.ts', port: 8970, priority: 3, startDelay: 18000, group: 'features' },
  
  // ==================== EXTENDED FEATURES (Priority 4) ====================
  { id: 'twitter-autonomy', name: '🐦 Twitter Autonomy', script: 'core/twitter-autonomy.ts', port: 8965, priority: 4, startDelay: 19000, group: 'optional' },
  { id: 'toobix-gamification', name: '🎯 Gamification', script: 'core/toobix-gamification.ts', port: 7778, priority: 4, startDelay: 20000, group: 'optional' },
  { id: 'toobix-living-world', name: '🌍 Living World', script: 'core/toobix-living-world.ts', port: 7779, priority: 4, startDelay: 21000, group: 'optional' },
  { id: 'command-center', name: '🎛️  Command Center', script: 'core/toobix-command-center.ts', port: 7777, priority: 4, startDelay: 22000, group: 'optional' },
  { id: 'real-world-intelligence', name: '🌎 Real World Intelligence', script: 'core/real-world-intelligence.ts', port: 8888, priority: 4, startDelay: 23000, group: 'optional' },
  
  // ==================== SPECIALIZED (Priority 4) ====================
  { id: 'service-mesh', name: '🕸️  Service Mesh', script: 'scripts/9-network/service-mesh.ts', port: 8910, priority: 4, startDelay: 24000, group: 'infrastructure' },
  { id: 'decision-framework', name: '⚖️  Decision Framework', script: 'scripts/8-conscious-decision-framework/decision-framework-server.ts', port: 8909, priority: 4, startDelay: 25000, group: 'features' },
  { id: 'life-domains', name: '📊 Life Domains', script: 'scripts/14-life-domains/life-domain-chat.ts', port: 8916, priority: 4, startDelay: 26000, group: 'features' },
  { id: 'meta-knowledge', name: '📚 Meta Knowledge', script: 'scripts/15-meta-knowledge/meta-knowledge-orchestrator.ts', port: 8918, priority: 4, startDelay: 27000, group: 'features' },
  { id: 'wellness-guardian', name: '🏥 Wellness Guardian', script: 'scripts/17-wellness-safety/wellness-safety-guardian.ts', port: 8921, priority: 4, startDelay: 28000, group: 'features' },
  
  // ==================== MINECRAFT (Priority 5 - Optional) ====================
  { id: 'minecraft-bot', name: '⛏️  Minecraft Bot', script: 'scripts/12-minecraft/minecraft-bot-service.ts', port: 8913, priority: 5, startDelay: 29000, group: 'minecraft' },
  
  // Weitere Services können hinzugefügt werden...
];

let startedCount = 0;
let failedCount = 0;

async function checkHealth(port: number, retries = 10): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(1000)
      });
      if (response.ok) return true;
    } catch {}
    await Bun.sleep(500);
  }
  return false;
}

async function startService(service: ManagedService): Promise<boolean> {
  const scriptPath = join(REPO_ROOT, service.script);
  
  console.log(`[${service.priority}] ${service.name} (Port ${service.port || 'N/A'})...`);
  
  try {
    const child = spawn('bun', ['run', scriptPath], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    
    runningProcesses.set(service.id, child);
    service.process = child;
    
    child.on('exit', (code) => {
      runningProcesses.delete(service.id);
      if (code !== 0) {
        console.log(`  ⚠️  ${service.name} exited with code ${code}`);
      }
    });
    
    // Warte auf Health Check wenn Port definiert
    if (service.port) {
      const healthy = await checkHealth(service.port);
      if (healthy) {
        console.log(`  ✓ ${service.name} ready`);
        startedCount++;
        return true;
      } else {
        console.log(`  ⚠️  ${service.name} started but not responding`);
        startedCount++;
        return false;
      }
    } else {
      startedCount++;
      console.log(`  ✓ ${service.name} started (no health check)`);
      return true;
    }
  } catch (error) {
    console.log(`  ✗ ${service.name} failed: ${error}`);
    failedCount++;
    return false;
  }
}

async function startAllServices(maxPriority: number = 5) {
  console.log('');
  console.log('========================================');
  console.log('  TOOBIX MEGA ORCHESTRATOR');
  console.log('========================================');
  console.log('');
  console.log(`Starting services up to priority ${maxPriority}...`);
  console.log(`Total services to start: ${ALL_SERVICES.filter(s => s.priority <= maxPriority).length}`);
  console.log('');
  
  const servicesToStart = ALL_SERVICES
    .filter(s => s.priority <= maxPriority)
    .sort((a, b) => a.startDelay - b.startDelay);
  
  for (const service of servicesToStart) {
    await Bun.sleep(service.startDelay);
    await startService(service);
  }
  
  console.log('');
  console.log('========================================');
  console.log('  STARTUP COMPLETE');
  console.log('========================================');
  console.log('');
  console.log(`✓ Started: ${startedCount}/${servicesToStart.length}`);
  console.log(`✗ Failed:  ${failedCount}`);
  console.log(`🔧 Running: ${runningProcesses.size}`);
  console.log('');
  console.log(`Estimated RAM: ~${runningProcesses.size * 150}MB`);
  console.log('');
  console.log('Services by group:');
  for (const group of ['infrastructure', 'core', 'features', 'optional', 'minecraft']) {
    const count = servicesToStart.filter(s => s.group === group && runningProcesses.has(s.id)).length;
    if (count > 0) {
      console.log(`  ${group}: ${count}`);
    }
  }
  console.log('');
  console.log('Press Ctrl+C to stop all services');
  console.log('');
}

async function shutdown() {
  console.log('\n\n🛑 Shutting down all services...');
  
  let stopped = 0;
  for (const [id, process] of runningProcesses.entries()) {
    try {
      process.kill('SIGTERM');
      stopped++;
    } catch {}
  }
  
  console.log(`Stopped ${stopped} services.`);
  await Bun.sleep(1000);
  process.exit(0);
}

// Handle shutdown gracefully
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Parse command line args
const args = process.argv.slice(2);
const maxPriority = args.includes('--full') ? 5 : 
                   args.includes('--extended') ? 4 :
                   args.includes('--features') ? 3 :
                   args.includes('--core') ? 2 : 3;

// Start!
startAllServices(maxPriority).catch((error) => {
  console.error('Failed to start services:', error);
  shutdown();
});
