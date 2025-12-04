/**
 * 🚀 TOOBIX UNIFIED LAUNCHER v2.0
 * 
 * Startet alle Core Services mit aktivierter Service-Integration
 * 
 * Usage:
 *   bun run scripts/start-toobix-unified.ts
 *   bun run scripts/start-toobix-unified.ts --minimal   (nur Core)
 *   bun run scripts/start-toobix-unified.ts --full      (alle Services)
 */

import { spawn, ChildProcess } from 'child_process';
import { getServiceIntegration, checkAllServices } from '../src/modules/service-integration';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface ServiceConfig {
  name: string;
  script: string;
  port: number;
  priority: number;  // 1 = Core, 2 = Important, 3 = Optional
  startDelay: number;
}

const SERVICES: ServiceConfig[] = [
  // Priority 1: Core Infrastructure
  { name: 'Event Bus', script: 'scripts/2-services/event-bus-v4.ts', port: 8955, priority: 1, startDelay: 0 },
  { name: 'Memory Palace', script: 'scripts/2-services/memory-palace-v4.ts', port: 8953, priority: 1, startDelay: 500 },
  { name: 'LLM Gateway', script: 'scripts/2-services/llm-gateway-v4.ts', port: 8954, priority: 1, startDelay: 500 },
  
  // Priority 2: Important Services
  { name: 'Public API', script: 'scripts/2-services/public-api-v1.ts', port: 8960, priority: 2, startDelay: 1000 },
  { name: 'System Monitor', script: 'scripts/2-services/system-monitor-v1.ts', port: 8961, priority: 2, startDelay: 500 },
  { name: 'Life Companion', script: 'scripts/2-services/life-companion-core.ts', port: 8970, priority: 2, startDelay: 500 },
  
  // Priority 3: Optional Services
  { name: 'Multi-Perspective', script: 'scripts/2-services/multi-perspective-v3.ts', port: 8897, priority: 3, startDelay: 1000 },
  { name: 'Emotional Resonance', script: 'scripts/2-services/emotional-resonance-v3.ts', port: 8900, priority: 3, startDelay: 500 },
  { name: 'Dream Journal', script: 'scripts/2-services/dream-journal-v4-active-dreaming.ts', port: 8899, priority: 3, startDelay: 500 },
  { name: 'File Analysis', script: 'scripts/2-services/file-analysis-v1.ts', port: 8962, priority: 3, startDelay: 500 },
];

// ============================================================================
// SERVICE RUNNER
// ============================================================================

const runningProcesses: Map<string, ChildProcess> = new Map();

async function startService(config: ServiceConfig): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`🔄 Starting ${config.name} on port ${config.port}...`);
    
    const proc = spawn('bun', ['run', config.script], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      shell: true
    });

    runningProcesses.set(config.name, proc);

    proc.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[${config.name}] ${output}`);
      }
    });

    proc.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning')) {
        console.error(`[${config.name}] ⚠️ ${output}`);
      }
    });

    proc.on('error', (error) => {
      console.error(`[${config.name}] ❌ Failed to start: ${error.message}`);
      resolve(false);
    });

    // Give service time to start
    setTimeout(() => {
      resolve(true);
    }, config.startDelay + 1000);
  });
}

async function stopAllServices(): Promise<void> {
  console.log('\n🛑 Stopping all services...');
  
  for (const [name, proc] of runningProcesses) {
    console.log(`   Stopping ${name}...`);
    proc.kill('SIGTERM');
  }
  
  runningProcesses.clear();
  console.log('✅ All services stopped');
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const mode = args.includes('--minimal') ? 'minimal' 
             : args.includes('--full') ? 'full' 
             : 'standard';

  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════════');
  console.log('🚀  TOOBIX UNIFIED LAUNCHER v2.0');
  console.log('🚀 ═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`   Mode: ${mode.toUpperCase()}`);
  console.log('');

  // Filter services by mode
  let servicesToStart: ServiceConfig[];
  switch (mode) {
    case 'minimal':
      servicesToStart = SERVICES.filter(s => s.priority === 1);
      break;
    case 'full':
      servicesToStart = SERVICES;
      break;
    default:
      servicesToStart = SERVICES.filter(s => s.priority <= 2);
  }

  console.log(`   Starting ${servicesToStart.length} services...\n`);

  // Start services in priority order
  const priorityGroups = [1, 2, 3];
  
  for (const priority of priorityGroups) {
    const group = servicesToStart.filter(s => s.priority === priority);
    
    if (group.length === 0) continue;
    
    console.log(`\n📦 Priority ${priority} Services:`);
    
    for (const service of group) {
      await startService(service);
      await new Promise(r => setTimeout(r, service.startDelay));
    }
  }

  // Wait for services to stabilize
  console.log('\n⏳ Waiting for services to stabilize...');
  await new Promise(r => setTimeout(r, 2000));

  // Check service status
  console.log('\n📊 Checking service status...');
  const status = await checkAllServices();
  
  console.log('\n┌─────────────────────────────────────┐');
  console.log('│       SERVICE STATUS                │');
  console.log('├─────────────────────────────────────┤');
  
  for (const service of status) {
    const emoji = service.status === 'online' ? '🟢' : '🔴';
    const padding = ' '.repeat(Math.max(0, 20 - service.name.length));
    console.log(`│ ${emoji} ${service.name}${padding} :${service.port} │`);
  }
  
  console.log('└─────────────────────────────────────┘');

  const onlineCount = status.filter(s => s.status === 'online').length;
  console.log(`\n✅ ${onlineCount}/${status.length} services online`);

  // Initialize Service Integration
  if (onlineCount >= 3) {
    console.log('\n🔗 Initializing Service Integration Layer...');
    try {
      const integration = await getServiceIntegration();
      console.log('✅ Service Integration Layer active - Synapses connected!');
    } catch (e) {
      console.log('⚠️ Service Integration Layer not fully active');
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  TOOBIX IS NOW RUNNING');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  📍 Event Bus:      http://localhost:8955');
  console.log('  📍 Memory Palace:  http://localhost:8953');
  console.log('  📍 LLM Gateway:    http://localhost:8954');
  console.log('  📍 Public API:     http://localhost:8960');
  console.log('  📍 Life Companion: http://localhost:8970');
  console.log('');
  console.log('  Press Ctrl+C to stop all services');
  console.log('');

  // Handle shutdown
  process.on('SIGINT', async () => {
    await stopAllServices();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await stopAllServices();
    process.exit(0);
  });

  // Keep running
  await new Promise(() => {});
}

main().catch(console.error);
