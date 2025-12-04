#!/usr/bin/env bun
/**
 * 🚀 TOOBIX QUICK SERVICE STARTER
 * 
 * Startet alle verfügbaren Services parallel
 * Für Services ohne eigenen HTTP-Server wird ein Wrapper erstellt
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface ServiceDef {
  name: string;
  port: number;
  file: string;
  priority: number;
}

// Services die bereits als Express-Server laufen können
const READY_SERVICES: ServiceDef[] = [
  // Priority 1 - Core
  { name: 'event-bus', port: 8955, file: 'event-bus-v4.ts', priority: 1 },
  { name: 'memory-palace', port: 8953, file: 'memory-palace-v4.ts', priority: 1 },
  { name: 'llm-gateway', port: 8954, file: 'llm-gateway-v4.ts', priority: 1 },
  
  // Priority 2 - AI
  { name: 'multi-perspective', port: 8897, file: 'multi-perspective-consciousness.ts', priority: 2 },
  
  // Priority 3 - Life
  { name: 'life-companion', port: 8970, file: 'life-companion-core.ts', priority: 3 },
  { name: 'daily-checkin', port: 8972, file: 'daily-checkin-v1.ts', priority: 3 },
  { name: 'proactive-communication', port: 8971, file: 'proactive-communication-v2.ts', priority: 3 },
  
  // Priority 4 - Game
  { name: 'world-engine-2d', port: 8920, file: 'world-engine-2d.ts', priority: 4 },
  { name: 'avatar-manager', port: 8929, file: 'avatar-manager-v2-multibody.ts', priority: 4 },
  { name: 'central-hub', port: 8931, file: 'central-integration-hub.ts', priority: 4 },
  { name: 'value-crisis', port: 8904, file: 'value-crisis.ts', priority: 4 },
  
  // Priority 5 - Integration
  { name: 'public-api', port: 8960, file: 'public-api-v1.ts', priority: 5 },
  { name: 'system-monitor', port: 8961, file: 'system-monitor-v1.ts', priority: 5 },
  { name: 'file-analysis', port: 8962, file: 'file-analysis-v1.ts', priority: 5 },
];

const processes: Map<string, ChildProcess> = new Map();
let shuttingDown = false;

async function checkHealth(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(name: string, port: number, maxWait: number = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    if (await checkHealth(port)) {
      return true;
    }
    await Bun.sleep(500);
  }
  return false;
}

async function startService(service: ServiceDef): Promise<boolean> {
  const servicePath = join(process.cwd(), 'scripts', '2-services', service.file);
  
  if (!existsSync(servicePath)) {
    console.log(`  ⚠️  ${service.name}: File not found`);
    return false;
  }

  console.log(`  🔄 Starting ${service.name} on :${service.port}...`);

  const proc = spawn('bun', ['run', servicePath], {
    cwd: process.cwd(),
    stdio: 'pipe',
    detached: false
  });

  processes.set(service.name, proc);

  proc.on('error', (err) => {
    console.log(`  ❌ ${service.name} error: ${err.message}`);
  });

  proc.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      console.log(`  ❌ ${service.name} exited with code ${code}`);
    }
  });

  // Wait for health
  const healthy = await waitForHealth(service.name, service.port);
  
  if (healthy) {
    console.log(`  ✅ ${service.name} ready on :${service.port}`);
  } else {
    console.log(`  ⚠️  ${service.name} started but no health response`);
  }

  return healthy;
}

async function startByPriority(): Promise<void> {
  // Group by priority
  const byPriority = new Map<number, ServiceDef[]>();
  for (const service of READY_SERVICES) {
    const group = byPriority.get(service.priority) || [];
    group.push(service);
    byPriority.set(service.priority, group);
  }

  const priorities = [...byPriority.keys()].sort((a, b) => a - b);

  for (const priority of priorities) {
    const group = byPriority.get(priority)!;
    console.log(`\n📦 Priority ${priority}: Starting ${group.length} services...`);
    
    // Start all in parallel
    await Promise.all(group.map(s => startService(s)));
    
    // Brief pause between priority groups
    await Bun.sleep(1500);
  }
}

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('\n\n🛑 Shutting down all services...\n');

  for (const [name, proc] of processes) {
    console.log(`  Stopping ${name}...`);
    proc.kill('SIGTERM');
  }

  await Bun.sleep(2000);

  // Force kill remaining
  for (const [name, proc] of processes) {
    if (!proc.killed) {
      proc.kill('SIGKILL');
    }
  }

  console.log('\n✅ All services stopped.\n');
  process.exit(0);
}

async function showStatus(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              🌟 TOOBIX SERVICE STATUS 🌟                      ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');

  let online = 0;
  let offline = 0;

  for (const service of READY_SERVICES) {
    const healthy = await checkHealth(service.port);
    const status = healthy ? '✅' : '❌';
    if (healthy) online++; else offline++;
    console.log(`║  ${status} ${service.name.padEnd(25)} :${service.port}             ║`);
  }

  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  📊 ${online}/${READY_SERVICES.length} Services Online                               ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

async function main(): Promise<void> {
  console.clear();
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║      🚀 TOOBIX QUICK SERVICE STARTER 🚀                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Starting ${READY_SERVICES.length} services...`);

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await startByPriority();

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🎉 SERVICE STARTUP COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════════');

  await showStatus();

  console.log('\n📋 Press Ctrl+C to stop all services');
  console.log('📋 Status refresh every 60 seconds\n');

  // Periodic status check
  setInterval(async () => {
    console.log('\n--- Status Check ---');
    await showStatus();
  }, 60000);
}

main().catch(console.error);
