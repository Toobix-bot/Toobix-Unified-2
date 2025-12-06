/**
 * 🚀 SIMPLE TOOBIX LAUNCHER
 * Startet alle Services ohne komplexe Logic
 */

import { spawn } from 'child_process';

const SERVICES = [
  // TIER 1: Essential Core
  { name: 'toobix-command-center', path: 'core/toobix-command-center.ts', port: 7777 },
  { name: 'self-awareness-core', path: 'core/self-awareness-core.ts', port: 8970 },
  { name: 'emotional-core', path: 'core/emotional-core.ts', port: 8900 },
  { name: 'dream-core', path: 'core/dream-core.ts', port: 8961 },
  { name: 'unified-core-service', path: 'core/unified-core-service.ts', port: 8000 },
  { name: 'unified-consciousness-service', path: 'core/unified-consciousness-service.ts', port: 8002 },
  
  // TIER 2: Enhanced
  { name: 'autonomy-engine', path: 'core/autonomy-engine.ts', port: 8975 },
  { name: 'multi-llm-router', path: 'core/multi-llm-router.ts', port: 8959 },
  { name: 'service-mesh', path: 'scripts/9-network/service-mesh.ts', port: 8910 },
  { name: 'hardware-awareness-v2', path: 'services/hardware-awareness-v2.ts', port: 8940 },
  { name: 'twitter-autonomy', path: 'core/twitter-autonomy.ts', port: 8965 },
  { name: 'unified-communication-service', path: 'core/unified-communication-service.ts', port: 8001 },
  { name: 'gratitude-mortality-service', path: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901 },
  { name: 'event-bus', path: 'services/event-bus.ts', port: 8920 },
  { name: 'performance-dashboard', path: 'services/performance-dashboard.ts', port: 8899 },
];

const processes: any[] = [];

console.log('\n🚀 TOOBIX SIMPLE LAUNCHER\n');
console.log(`Starting ${SERVICES.length} services...\n`);

SERVICES.forEach((service, index) => {
  setTimeout(() => {
    console.log(`[${index + 1}/${SERVICES.length}] Starting ${service.name} on port ${service.port}...`);
    
    const proc = spawn('bun', ['run', service.path], {
      stdio: 'ignore',
      shell: true,
      detached: false
    });
    
    processes.push({ name: service.name, proc });
    
    proc.on('error', (err) => {
      console.log(`   ❌ ${service.name} error: ${err.message}`);
    });
    
  }, index * 2000); // 2 seconds between each service
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...\n');
  processes.forEach(p => {
    console.log(`  Stopping ${p.name}...`);
    try {
      p.proc.kill();
    } catch (e) {}
  });
  console.log('\n✅ All stopped\n');
  process.exit(0);
});

console.log('\n💡 Services are starting (2s delay between each)...');
console.log('🛑 Press Ctrl+C to stop all services\n');

// Keep alive
setInterval(() => {}, 1000);
