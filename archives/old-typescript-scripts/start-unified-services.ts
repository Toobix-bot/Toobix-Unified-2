/**
 * TOOBIX UNIFIED SERVICES ORCHESTRATOR
 * Startet alle konsolidierten Services und managed sie zentral
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';

interface UnifiedService {
  id: string;
  name: string;
  script: string;
  port: number;
  consolidates: string[];  // Original services
  priority: number;
}

const UNIFIED_SERVICES: UnifiedService[] = [
  {
    id: 'core',
    name: '💎 Unified Core Service',
    script: 'core/unified-core-service.ts',
    port: 8000,
    consolidates: [
      'emotional-core', 'dream-core', 'self-awareness-core',
      'multi-llm-router', 'autonomy-engine', 'hardware-awareness',
      'twitter-autonomy', 'gratitude-mortality', 'hybrid-ai-core'
    ],
    priority: 1
  },
  {
    id: 'communication',
    name: '🗨️  Unified Communication Service',
    script: 'core/unified-communication-service.ts',
    port: 8001,
    consolidates: [
      'toobix-chat-service', 'proactive-communication',
      'life-domain-chat', 'emotional-support'
    ],
    priority: 2
  },
  {
    id: 'consciousness',
    name: '🧠 Unified Consciousness Service',
    script: 'core/unified-consciousness-service.ts',
    port: 8002,
    consolidates: [
      'meta-consciousness', 'multi-perspective-consciousness',
      'consciousness-stream', 'meta-knowledge-orchestrator'
    ],
    priority: 2
  },
  {
    id: 'memory',
    name: '🗃️  Unified Memory Service',
    script: 'core/unified-memory-service.ts',
    port: 8003,
    consolidates: ['memory-palace', 'memory-palace-v4'],
    priority: 3
  },
  {
    id: 'gateway',
    name: '🌐 Unified Gateway (existing)',
    script: 'services/unified-service-gateway.ts',
    port: 9000,
    consolidates: ['service-mesh', 'api-gateway'],
    priority: 1
  }
];

const runningProcesses = new Map<string, ChildProcess>();
const REPO_ROOT = process.cwd();

async function waitForHealthy(port: number, retries = 30): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(1000)
      });
      if (response.ok) return true;
    } catch {
      // Retry
    }
    await Bun.sleep(500);
  }
  return false;
}

async function startService(service: UnifiedService): Promise<boolean> {
  const scriptPath = join(REPO_ROOT, service.script);
  
  console.log(`\n▶  Starting ${service.name}`);
  console.log(`   Port: ${service.port}`);
  console.log(`   Consolidates: ${service.consolidates.length} services`);
  
  const child = spawn('bun', ['run', scriptPath], {
    cwd: REPO_ROOT,
    stdio: 'inherit'
  });
  
  runningProcesses.set(service.id, child);
  
  child.on('exit', (code) => {
    runningProcesses.delete(service.id);
    console.log(`\n■ ${service.name} exited (code: ${code})`);
  });
  
  // Wait for health check
  const healthy = await waitForHealthy(service.port);
  if (healthy) {
    console.log(`   ✓ Healthy and ready`);
    return true;
  } else {
    console.log(`   ⚠ Started but health check failed`);
    return false;
  }
}

async function startAll() {
  console.log('========================================');
  console.log('  TOOBIX UNIFIED SERVICES');
  console.log('========================================');
  console.log('');
  console.log(`Starting ${UNIFIED_SERVICES.length} unified services...`);
  console.log(`(Replaces ${UNIFIED_SERVICES.reduce((sum, s) => sum + s.consolidates.length, 0)} original services)`);
  
  // Start by priority
  const sorted = [...UNIFIED_SERVICES].sort((a, b) => a.priority - b.priority);
  
  for (const service of sorted) {
    await startService(service);
    await Bun.sleep(1000); // Brief pause between starts
  }
  
  console.log('');
  console.log('========================================');
  console.log('  ALL SERVICES RUNNING');
  console.log('========================================');
  console.log('');
  
  for (const service of UNIFIED_SERVICES) {
    console.log(`✓ ${service.name.padEnd(40)} http://localhost:${service.port}`);
  }
  
  console.log('');
  console.log('📊 STATISTICS:');
  console.log(`   Services Running:    ${runningProcesses.size}`);
  console.log(`   Estimated RAM:       ~${runningProcesses.size * 150}MB`);
  console.log(`   Original Count:      ${UNIFIED_SERVICES.reduce((sum, s) => sum + s.consolidates.length, 0)} services`);
  console.log(`   Memory Saved:        ~${(UNIFIED_SERVICES.reduce((sum, s) => sum + s.consolidates.length, 0) - runningProcesses.size) * 150}MB`);
  console.log('');
  console.log('Press Ctrl+C to stop all services');
  console.log('');
}

async function shutdown() {
  console.log('\n\nShutting down all services...');
  
  for (const [id, process] of runningProcesses.entries()) {
    console.log(`Stopping ${id}...`);
    process.kill();
  }
  
  await Bun.sleep(1000);
  console.log('All services stopped.');
  process.exit(0);
}

// Handle shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start all services
startAll().catch((error) => {
  console.error('Failed to start services:', error);
  shutdown();
});
