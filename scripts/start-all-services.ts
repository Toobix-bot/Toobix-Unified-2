/**
 * 🚀 TOOBIX UNIFIED SERVICE LAUNCHER
 * 
 * Startet alle Services in der richtigen Reihenfolge:
 * 1. Core Infrastructure (Event Bus, Memory, LLM)
 * 2. AI Services
 * 3. Life Companion Features
 * 4. Gamification
 * 5. Data & Integration
 * 
 * Features:
 * - Paralleles Starten nach Priorität
 * - Health-Check Verification
 * - Graceful Shutdown
 * - Status Dashboard
 */

import { spawn, ChildProcess } from 'child_process';
import { SERVICE_REGISTRY, getServicesByPriority, getRegistryStats, ServiceConfig } from './service-registry';

// ============================================================================
// TYPES
// ============================================================================

interface RunningService {
  config: ServiceConfig;
  process: ChildProcess;
  status: 'starting' | 'running' | 'failed' | 'stopped';
  startTime: Date;
  pid?: number;
}

// ============================================================================
// STATE
// ============================================================================

const runningServices: Map<string, RunningService> = new Map();
let isShuttingDown = false;

// ============================================================================
// HEALTH CHECK
// ============================================================================

async function checkHealth(service: ServiceConfig): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${service.port}${service.healthEndpoint}`, {
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(service: ServiceConfig, maxWaitMs: number = 15000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    if (await checkHealth(service)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return false;
}

// ============================================================================
// SERVICE MANAGEMENT
// ============================================================================

function startService(service: ServiceConfig): Promise<RunningService> {
  return new Promise((resolve, reject) => {
    const servicePath = `./scripts/2-services/${service.file}`;
    
    console.log(`  🔄 Starting ${service.name} on :${service.port}...`);
    
    const proc = spawn('bun', ['run', servicePath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    const runningService: RunningService = {
      config: service,
      process: proc,
      status: 'starting',
      startTime: new Date(),
      pid: proc.pid
    };

    runningServices.set(service.name, runningService);

    // Collect output for debugging
    let output = '';
    proc.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr?.on('data', (data) => {
      output += data.toString();
    });

    proc.on('error', (error) => {
      runningService.status = 'failed';
      console.error(`  ❌ ${service.name} failed to start: ${error.message}`);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && !isShuttingDown) {
        runningService.status = 'failed';
        console.error(`  ❌ ${service.name} exited with code ${code}`);
      } else {
        runningService.status = 'stopped';
      }
    });

    // Wait for health check
    waitForHealth(service, 10000).then(healthy => {
      if (healthy) {
        runningService.status = 'running';
        console.log(`  ✅ ${service.name} ready on :${service.port}`);
        resolve(runningService);
      } else {
        runningService.status = 'failed';
        console.error(`  ⚠️  ${service.name} started but health check failed`);
        resolve(runningService); // Still resolve, service might work
      }
    });
  });
}

async function startServicesByPriority(services: ServiceConfig[]): Promise<void> {
  // Group by priority
  const byPriority = new Map<number, ServiceConfig[]>();
  
  for (const service of services) {
    const group = byPriority.get(service.priority) || [];
    group.push(service);
    byPriority.set(service.priority, group);
  }

  // Start each priority group in parallel
  const priorities = [...byPriority.keys()].sort((a, b) => a - b);
  
  for (const priority of priorities) {
    const group = byPriority.get(priority)!;
    console.log(`\n📦 Starting Priority ${priority} Services (${group.length})...`);
    
    await Promise.all(group.map(service => startService(service)));
    
    // Small delay between priority groups
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// ============================================================================
// SHUTDOWN
// ============================================================================

async function shutdown(): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\n\n🛑 Shutting down all services...\n');
  
  for (const [name, service] of runningServices) {
    if (service.process && !service.process.killed) {
      console.log(`  Stopping ${name}...`);
      service.process.kill('SIGTERM');
    }
  }
  
  // Wait for processes to exit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Force kill any remaining
  for (const [name, service] of runningServices) {
    if (service.process && !service.process.killed) {
      console.log(`  Force killing ${name}...`);
      service.process.kill('SIGKILL');
    }
  }
  
  console.log('\n✅ All services stopped.\n');
  process.exit(0);
}

// ============================================================================
// STATUS DISPLAY
// ============================================================================

function displayStatus(): void {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              🌟 TOOBIX SERVICE STATUS 🌟                         ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  
  const categories = ['core', 'ai', 'life', 'game', 'data', 'integration', 'monitoring'];
  
  for (const category of categories) {
    const services = [...runningServices.values()].filter(s => s.config.category === category);
    if (services.length === 0) continue;
    
    const emoji = {
      core: '🔧',
      ai: '🤖',
      life: '💫',
      game: '🎮',
      data: '📊',
      integration: '🔗',
      monitoring: '📡'
    }[category] || '📦';
    
    console.log(`║  ${emoji} ${category.toUpperCase().padEnd(15)}                                        ║`);
    
    for (const service of services) {
      const statusIcon = {
        running: '✅',
        starting: '🔄',
        failed: '❌',
        stopped: '⏹️'
      }[service.status];
      
      const name = service.config.name.padEnd(22);
      const port = `:${service.config.port}`.padEnd(6);
      console.log(`║     ${statusIcon} ${name} ${port}                            ║`);
    }
  }
  
  const running = [...runningServices.values()].filter(s => s.status === 'running').length;
  const total = runningServices.size;
  
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  📊 ${running}/${total} Services Running                                        ║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.clear();
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     🚀 TOOBIX UNIFIED SERVICE LAUNCHER 🚀                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  const stats = getRegistryStats();
  console.log(`📊 Registry: ${stats.enabled} services enabled, ${stats.deprecated} deprecated`);
  console.log(`📍 Port Range: ${stats.portRange.min} - ${stats.portRange.max}`);
  console.log('');

  // Get enabled services sorted by priority
  const services = getServicesByPriority();
  
  console.log(`🎯 Starting ${services.length} services...`);

  // Handle shutdown
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await startServicesByPriority(services);
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  🎉 ALL SERVICES STARTED!');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    displayStatus();
    
    console.log('\n📋 Press Ctrl+C to stop all services\n');
    
    // Keep alive and periodically show status
    setInterval(() => {
      // Check health of all services
      for (const [name, service] of runningServices) {
        if (service.status === 'running') {
          checkHealth(service.config).then(healthy => {
            if (!healthy && service.status === 'running') {
              console.log(`⚠️  ${name} health check failed`);
            }
          });
        }
      }
    }, 30000);

  } catch (error) {
    console.error('Failed to start services:', error);
    await shutdown();
  }
}

main().catch(console.error);
