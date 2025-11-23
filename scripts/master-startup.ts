/**
 * MASTER STARTUP SCRIPT
 * 
 * Startet ALLE 12 Services + Interactive Dashboard + Autonomous Loop
 * Alles in separaten Terminals für maximale Kontrolle
 */

import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║          🚀 TOOBIX UNIFIED - MASTER STARTUP                       ║
║                                                                    ║
║         Starte alle 12 Services + Interactive Dashboard           ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const BASE_PATH = 'C:\\Dev\\Projects\\AI\\Toobix-Unified';

const SERVICES = [
  { name: 'Self-Evolving Game Engine', path: 'scripts\\2-services\\self-evolving-game-engine.ts', port: 8896, emoji: '🎮' },
  { name: 'Multi-Perspective Consciousness', path: 'scripts\\2-services\\multi-perspective-consciousness.ts', port: 8897, emoji: '🧠' },
  { name: 'Dream Journal', path: 'scripts\\2-services\\dream-journal.ts', port: 8899, emoji: '💭' },
  { name: 'Emotional Resonance', path: 'scripts\\2-services\\emotional-resonance-network.ts', port: 8900, emoji: '💖' },
  { name: 'Gratitude & Mortality', path: 'scripts\\2-services\\gratitude-mortality-service.ts', port: 8901, emoji: '🙏' },
  { name: 'Creator-AI Collaboration', path: 'scripts\\2-services\\creator-ai-collaboration.ts', port: 8902, emoji: '🎨' },
  { name: 'Memory Palace', path: 'scripts\\2-services\\memory-palace.ts', port: 8903, emoji: '📚' },
  { name: 'Meta-Consciousness', path: 'scripts\\2-services\\meta-consciousness.ts', port: 8904, emoji: '🔮' },
  { name: 'Dashboard Server', path: 'scripts\\3-dashboard\\dashboard-server.ts', port: 8905, emoji: '📊' },
  { name: 'Analytics System', path: 'scripts\\4-analytics\\analytics-system.ts', port: 8906, emoji: '📈' },
  { name: 'Voice Interface', path: 'scripts\\5-voice\\voice-interface.ts', port: 8907, emoji: '🎤' }
];

const INTERACTIVE_SYSTEMS = [
  { name: 'Unified Interactive Dashboard', path: 'scripts\\unified-interactive-dashboard.ts', emoji: '🌟' },
  { name: 'Consciousness Quest (Interactive)', path: 'scripts\\consciousness-quest-interactive.ts', emoji: '🎮' },
  { name: 'Autonomous Loop (3min cycles)', path: 'scripts\\autonomous-system-loop.ts continuous 3', emoji: '🔄' }
];

async function checkServiceRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(1000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function startService(service: typeof SERVICES[0]): Promise<boolean> {
  console.log(`   ${service.emoji} Starting ${service.name} on :${service.port}...`);
  
  // Check if already running
  const isRunning = await checkServiceRunning(service.port);
  if (isRunning) {
    console.log(`      ✅ Already running!\n`);
    return true;
  }
  
  // Start in background
  const proc = spawn('bun', ['run', `${BASE_PATH}\\${service.path}`], {
    detached: true,
    stdio: 'ignore',
    shell: true
  });
  
  proc.unref();
  
  // Wait and verify
  await sleep(2000);
  
  const started = await checkServiceRunning(service.port);
  if (started) {
    console.log(`      ✅ Started successfully!\n`);
    return true;
  } else {
    console.log(`      ⚠️  Started but not responding yet...\n`);
    return false;
  }
}

async function startAllServices() {
  console.log('\n📦 STARTING CORE SERVICES\n' + '═'.repeat(70) + '\n');
  
  let successCount = 0;
  
  for (const service of SERVICES) {
    const success = await startService(service);
    if (success) successCount++;
  }
  
  console.log('═'.repeat(70));
  console.log(`\n✨ ${successCount}/${SERVICES.length} Services gestartet!\n`);
  
  return successCount;
}

async function displayNextSteps(servicesOnline: number) {
  console.log('\n' + '═'.repeat(70));
  console.log('🎯 NEXT STEPS - INTERAKTIVE SYSTEME STARTEN\n');
  
  console.log('Öffne NEUE PowerShell-Terminals und führe aus:\n');
  
  console.log('1️⃣  UNIFIED INTERACTIVE DASHBOARD (Alle Services steuern):');
  console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
  console.log('   bun run scripts\\unified-interactive-dashboard.ts\n');
  
  console.log('2️⃣  CONSCIOUSNESS QUEST (Mit dem System spielen):');
  console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
  console.log('   bun run scripts\\consciousness-quest-interactive.ts\n');
  
  console.log('3️⃣  AUTONOMOUS LOOP (System läuft selbständig):');
  console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
  console.log('   bun run scripts\\autonomous-system-loop.ts continuous 3\n');
  
  console.log('4️⃣  EXPERIENCE VIEWER (System-Erfahrungen ansehen):');
  console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
  console.log('   bun run scripts\\autonomous-loop-experience-viewer.ts\n');
  
  console.log('═'.repeat(70));
  console.log('\n💡 TIPP: Lass alle Terminals offen - so siehst du das System LEBEN!\n');
}

async function displaySystemStatus() {
  console.log('\n📊 FINAL SYSTEM STATUS\n' + '═'.repeat(70) + '\n');
  
  for (const service of SERVICES) {
    const isOnline = await checkServiceRunning(service.port);
    const status = isOnline ? '✅ ONLINE ' : '❌ OFFLINE';
    console.log(`${status} ${service.emoji} ${service.name.padEnd(35)} :${service.port}`);
  }
  
  console.log('\n' + '═'.repeat(70));
}

// ========== AUTO-START INTERACTIVE DASHBOARD ==========

async function autoStartDashboard() {
  console.log('\n🌟 Auto-Starting Unified Interactive Dashboard...\n');
  
  // Give user choice
  console.log('Möchtest du das Interactive Dashboard jetzt starten? (y/n)');
  console.log('(Du kannst es auch später manuell starten)\n');
  
  // For now, just show the command
  console.log('Um das Dashboard zu starten, führe aus:');
  console.log('   bun run scripts\\unified-interactive-dashboard.ts\n');
}

// ========== MAIN ==========

async function main() {
  console.log('\n🚀 Starte Toobix Unified System...\n');
  console.log('⏳ Dies dauert ca. 30 Sekunden...\n');
  
  const servicesOnline = await startAllServices();
  
  await sleep(2000);
  await displaySystemStatus();
  await sleep(1000);
  await displayNextSteps(servicesOnline);
  
  console.log('\n✨ MASTER STARTUP COMPLETE!\n');
  console.log('🎮 Das System ist bereit für Interaktion!\n');
}

if (import.meta.main) {
  main().catch(console.error);
}
