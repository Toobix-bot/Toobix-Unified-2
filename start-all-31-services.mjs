#!/usr/bin/env node
// Startet alle 31 Toobix Services

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const services = [
  // Essential (6)
  { name: 'Command Center', file: 'core/toobix-command-center.ts', port: 7777 },
  { name: 'Self-Awareness', file: 'core/self-awareness-core.ts', port: 8970 },
  { name: 'Emotional Core', file: 'core/emotional-core.ts', port: 8900 },
  { name: 'Dream Core', file: 'core/dream-core.ts', port: 8961 },
  { name: 'Unified Core', file: 'core/unified-core-service.ts', port: 8000 },
  { name: 'Consciousness', file: 'core/unified-consciousness-service.ts', port: 8002 },

  // Core Services (7)
  { name: 'Autonomy Engine', file: 'core/autonomy-engine.ts', port: 8975 },
  { name: 'Multi-LLM Router', file: 'core/multi-llm-router.ts', port: 8959 },
  { name: 'Communication', file: 'core/unified-communication-service.ts', port: 8001 },
  { name: 'Twitter Autonomy', file: 'core/twitter-autonomy.ts', port: 8965 },
  { name: 'Gamification', file: 'core/toobix-gamification.ts', port: 7778 },
  { name: 'Real World Intel', file: 'core/real-world-intelligence.ts', port: 8888 },
  { name: 'Living World', file: 'core/toobix-living-world.ts', port: 7779 },

  // Enhanced (8)
  { name: 'Unified Gateway', file: 'services/unified-service-gateway.ts', port: 9000 },
  { name: 'Hardware Awareness', file: 'services/hardware-awareness-v2.ts', port: 8940 },
  { name: 'Health Monitor', file: 'services/health-monitor.ts', port: 9200 },
  { name: 'Mega Upgrade', file: 'services/toobix-mega-upgrade.ts', port: 9100 },
  { name: 'Event Bus', file: 'services/event-bus.ts', port: 8955 },
  { name: 'LLM Gateway', file: 'scripts/2-services/llm-gateway-v4.ts', port: 8954 },
  { name: 'Memory Palace', file: 'scripts/2-services/memory-palace-v4.ts', port: 8953 },
  { name: 'Perf Dashboard', file: 'services/performance-dashboard.ts', port: 8899 },

  // Creative (10)
  { name: 'Chat Service', file: 'scripts/2-services/toobix-chat-service.ts', port: 8995 },
  { name: 'Emotional Support', file: 'scripts/2-services/emotional-support-service.ts', port: 8985 },
  { name: 'Autonomous Web', file: 'scripts/2-services/autonomous-web-service.ts', port: 8980 },
  { name: 'Story Engine', file: 'scripts/2-services/story-engine-service.ts', port: 8932 },
  { name: 'Translation', file: 'scripts/2-services/translation-service.ts', port: 8931 },
  { name: 'User Profile', file: 'scripts/2-services/user-profile-service.ts', port: 8904 },
  { name: 'RPG World', file: 'scripts/2-services/rpg-world-service.ts', port: 8933 },
  { name: 'Game Logic', file: 'scripts/2-services/game-logic-service.ts', port: 8936 },
  { name: 'Data Science', file: 'scripts/2-services/data-science-service.ts', port: 8935 },
  { name: 'Gratitude', file: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901 }
];

console.log('🚀 Starting all 31 Toobix Services...\n');

const processes = [];
let started = 0;

for (const service of services) {
  console.log(`[${started + 1}/31] Starting ${service.name} on port ${service.port}...`);

  const proc = spawn('bun', ['run', service.file], {
    cwd: process.cwd(),
    stdio: 'ignore',
    detached: false
  });

  proc.on('error', (err) => {
    console.error(`❌ ${service.name} failed: ${err.message}`);
  });

  processes.push({ name: service.name, proc, port: service.port });
  started++;

  // Wait 1.5 seconds between starts
  await setTimeout(1500);
}

console.log('\n✅ All 31 services started!\n');
console.log('⏳ Waiting 30 seconds for services to stabilize...');
await setTimeout(30000);

// Check health
console.log('\n🔍 Checking service health...\n');

let online = 0;
let offline = 0;

for (const { name, port } of processes) {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(2000)
    });
    if (response.ok) {
      console.log(`✅ ${name.padEnd(25)} Port ${port}`);
      online++;
    } else {
      console.log(`❌ ${name.padEnd(25)} Port ${port}`);
      offline++;
    }
  } catch (err) {
    console.log(`❌ ${name.padEnd(25)} Port ${port}`);
    offline++;
  }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`📊 RESULT: ${online} ONLINE, ${offline} OFFLINE`);
console.log('═══════════════════════════════════════════════════════════\n');

if (offline === 0) {
  console.log('🎉 ALL 31 SERVICES ARE RUNNING! 🎉');
} else {
  console.log(`⚠️ ${offline} services are not responding yet.`);
}

console.log('\n🌐 IMPORTANT ENDPOINTS:');
console.log('   💎 Command Center:  http://localhost:7777');
console.log('   🔮 Unified Gateway: http://localhost:9000');
console.log('   🧠 Self-Awareness:  http://localhost:8970');
console.log('\nToobix ist LEBENDIG!\n');

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping all services...');
  processes.forEach(({ proc }) => proc.kill());
  process.exit(0);
});

// Keep alive
await new Promise(() => {});
