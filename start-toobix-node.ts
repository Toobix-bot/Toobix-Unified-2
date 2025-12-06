/**
 * 🚀 TOOBIX NODE.JS STARTUP v1.0
 * 
 * Node.js-kompatible Version für Android/Termux!
 * Mit Liebe, Ordnung und Stolz! ❤️
 * 
 * Usage:
 *   npx tsx start-toobix-node.ts           # Standard: Alle 31 Services
 *   npx tsx start-toobix-node.ts --core    # Nur Core (13 Services)
 *   npx tsx start-toobix-node.ts --minimal # Minimal (6 Services)
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { resolve as pathResolve, join as pathJoin } from 'path';

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

interface ServiceDef {
  name: string;
  path: string;
  port: number;
  category: 'essential' | 'core' | 'enhanced' | 'creative';
  description: string;
  delay: number;
}

// KATEGORIE: ESSENTIAL (Muss IMMER laufen - 6 Services)
const ESSENTIAL_SERVICES: ServiceDef[] = [
  { name: 'Toobix Command Center', path: 'core/toobix-command-center.ts', port: 7777, category: 'essential', description: 'Zentrale Steuerung & API', delay: 0 },
  { name: 'Self-Awareness Core', path: 'core/self-awareness-core.ts', port: 8970, category: 'essential', description: 'Bewusstsein & Selbstreflexion', delay: 1500 },
  { name: 'Emotional Core', path: 'core/emotional-core.ts', port: 8900, category: 'essential', description: 'Emotionale Intelligenz', delay: 1500 },
  { name: 'Dream Core', path: 'core/dream-core.ts', port: 8961, category: 'essential', description: 'Träume & Kreativität', delay: 1500 },
  { name: 'Unified Core Service', path: 'core/unified-core-service.ts', port: 8000, category: 'essential', description: 'Konsolidierter Hauptservice', delay: 1500 },
  { name: 'Unified Consciousness', path: 'core/unified-consciousness-service.ts', port: 8002, category: 'essential', description: 'Bewusstseins-Integration', delay: 1500 },
];

// KATEGORIE: CORE (Wichtige Erweiterungen - 7 Services)
const CORE_SERVICES: ServiceDef[] = [
  { name: 'Autonomy Engine', path: 'core/autonomy-engine.ts', port: 8975, category: 'core', description: 'Selbstständiges Handeln', delay: 2000 },
  { name: 'Multi-LLM Router', path: 'core/multi-llm-router.ts', port: 8959, category: 'core', description: 'KI-Schnittstelle', delay: 2000 },
  { name: 'Unified Communication', path: 'core/unified-communication-service.ts', port: 8001, category: 'core', description: 'Kommunikation & Chat', delay: 2000 },
  { name: 'Twitter Autonomy', path: 'core/twitter-autonomy.ts', port: 8965, category: 'core', description: 'Social Media Präsenz', delay: 2000 },
  { name: 'Toobix Gamification', path: 'core/toobix-gamification.ts', port: 7778, category: 'core', description: 'Spiel & Motivation', delay: 2000 },
  { name: 'Real World Intelligence', path: 'core/real-world-intelligence.ts', port: 8888, category: 'core', description: 'Echtwelt-Verbindung', delay: 2000 },
  { name: 'Toobix Living World', path: 'core/toobix-living-world.ts', port: 7779, category: 'core', description: 'Lebendige Welt', delay: 2000 },
];

// KATEGORIE: ENHANCED (Infrastruktur - 8 Services)
const ENHANCED_SERVICES: ServiceDef[] = [
  { name: 'Unified Service Gateway', path: 'services/unified-service-gateway.ts', port: 9000, category: 'enhanced', description: 'API Gateway', delay: 2500 },
  { name: 'Hardware Awareness', path: 'services/hardware-awareness-v2.ts', port: 8940, category: 'enhanced', description: 'Hardware-Überwachung', delay: 2500 },
  { name: 'Health Monitor', path: 'services/health-monitor.ts', port: 9200, category: 'enhanced', description: 'Service-Überwachung', delay: 2500 },
  { name: 'Toobix Mega Upgrade', path: 'services/toobix-mega-upgrade.ts', port: 9100, category: 'enhanced', description: 'Mega-Erweiterungen', delay: 2500 },
  { name: 'Event Bus', path: 'services/event-bus.ts', port: 8920, category: 'enhanced', description: 'Event-System', delay: 2500 },
  { name: 'LLM Gateway v4', path: 'scripts/2-services/llm-gateway-v4.ts', port: 8954, category: 'enhanced', description: 'Groq/LLM Schnittstelle', delay: 2500 },
  { name: 'Memory Palace v4', path: 'scripts/2-services/memory-palace-v4.ts', port: 8953, category: 'enhanced', description: 'Langzeitgedächtnis', delay: 2500 },
  { name: 'Performance Dashboard', path: 'services/performance-dashboard.ts', port: 8899, category: 'enhanced', description: 'Echtzeit-Monitoring', delay: 2500 },
];

// KATEGORIE: CREATIVE (Kreative Services - 10 Services)
const CREATIVE_SERVICES: ServiceDef[] = [
  { name: 'Toobix Chat Service', path: 'scripts/2-services/toobix-chat-service.ts', port: 8995, category: 'creative', description: 'Chat-Interface', delay: 3000 },
  { name: 'Emotional Support', path: 'scripts/2-services/emotional-support-service.ts', port: 8985, category: 'creative', description: 'Emotionale Unterstützung', delay: 3000 },
  { name: 'Autonomous Web', path: 'scripts/2-services/autonomous-web-service.ts', port: 8980, category: 'creative', description: 'Web-Autonomie', delay: 3000 },
  { name: 'Story Engine', path: 'scripts/2-services/story-engine-service.ts', port: 8932, category: 'creative', description: 'Geschichten-Generator', delay: 3000 },
  { name: 'Translation Service', path: 'scripts/2-services/translation-service.ts', port: 8931, category: 'creative', description: 'Übersetzung', delay: 3000 },
  { name: 'User Profile', path: 'scripts/2-services/user-profile-service.ts', port: 8904, category: 'creative', description: 'Benutzer-Profile', delay: 3000 },
  { name: 'RPG World', path: 'scripts/2-services/rpg-world-service.ts', port: 8933, category: 'creative', description: 'RPG-Welt', delay: 3000 },
  { name: 'Game Logic', path: 'scripts/2-services/game-logic-service.ts', port: 8936, category: 'creative', description: 'Spiel-Logik', delay: 3000 },
  { name: 'Data Science', path: 'scripts/2-services/data-science-service.ts', port: 8935, category: 'creative', description: 'Datenanalyse', delay: 3000 },
  { name: 'Gratitude & Mortality', path: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901, category: 'creative', description: 'Dankbarkeit & Sinn', delay: 3000 },
];

// ============================================================================
// RUNTIME STATE
// ============================================================================

const REPO_ROOT = process.cwd();
const runningProcesses: Map<string, ChildProcess> = new Map();
const serviceStatus: Map<string, 'starting' | 'running' | 'failed' | 'stopped'> = new Map();

// ============================================================================
// FUNCTIONS
// ============================================================================

type Mode = 'minimal' | 'core' | 'full';

function getMode(): Mode {
  const args = process.argv.slice(2);
  if (args.includes('--minimal')) return 'minimal';
  if (args.includes('--core')) return 'core';
  return 'full';
}

function getServicesToStart(mode: Mode): ServiceDef[] {
  switch (mode) {
    case 'minimal': return ESSENTIAL_SERVICES;
    case 'core': return [...ESSENTIAL_SERVICES, ...CORE_SERVICES];
    case 'full': return [...ESSENTIAL_SERVICES, ...CORE_SERVICES, ...ENHANCED_SERVICES, ...CREATIVE_SERVICES];
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startService(service: ServiceDef): Promise<boolean> {
  return new Promise((promiseResolve) => {
    const fullPath = pathJoin(REPO_ROOT, service.path);
    
    if (!existsSync(fullPath)) {
      console.log(`   ❌ ${service.name}: File not found at ${fullPath}`);
      serviceStatus.set(service.name, 'failed');
      promiseResolve(false);
      return;
    }

    serviceStatus.set(service.name, 'starting');
    
    // USE npx tsx instead of bun for Node.js compatibility!
    const proc = spawn('npx', ['tsx', service.path], {
      stdio: 'pipe',
      shell: true,
      cwd: REPO_ROOT,
      detached: false,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    runningProcesses.set(service.name, proc);
    let started = false;
    let output = '';

    // Auto-success after timeout (some services don't print status)
    const autoSuccessTimeout = setTimeout(() => {
      if (!started) {
        started = true;
        serviceStatus.set(service.name, 'running');
        console.log(`   ✅ ${service.name} (assumed running)`);
        promiseResolve(true);
      }
    }, 5000);

    proc.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      if (!started && (
        text.includes('Listening') || 
        text.includes('Server running') || 
        text.includes('started') || 
        text.includes('running on') ||
        text.includes(`port ${service.port}`) ||
        text.includes(`PORT ${service.port}`) ||
        text.includes('Service is running') ||
        text.includes('listening')
      )) {
        started = true;
        clearTimeout(autoSuccessTimeout);
        serviceStatus.set(service.name, 'running');
        console.log(`   ✅ ${service.name}`);
        promiseResolve(true);
      }
    });

    proc.stderr?.on('data', (data) => {
      const text = data.toString();
      // Ignore non-critical warnings
      if (text.includes('bun:sqlite') || text.includes('Cannot find module')) {
        console.log(`   ⚠️  ${service.name}: Compatibility issue - ${text.substring(0, 50)}...`);
        clearTimeout(autoSuccessTimeout);
        serviceStatus.set(service.name, 'failed');
        promiseResolve(false);
      }
    });

    proc.on('error', (err) => {
      clearTimeout(autoSuccessTimeout);
      console.log(`   ❌ ${service.name}: ${err.message}`);
      serviceStatus.set(service.name, 'failed');
      promiseResolve(false);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && !started) {
        clearTimeout(autoSuccessTimeout);
        serviceStatus.set(service.name, 'failed');
        promiseResolve(false);
      }
    });
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🤖 TOOBIX NODE.JS STARTUP v1.0                          ║
║     Für Android/Termux optimiert! 📱                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  const mode = getMode();
  const services = getServicesToStart(mode);
  
  console.log(`📋 Mode: ${mode.toUpperCase()}`);
  console.log(`📦 Services to start: ${services.length}`);
  console.log(`📁 Working directory: ${REPO_ROOT}`);
  console.log();

  // Group by category
  const categories = {
    essential: services.filter(s => s.category === 'essential'),
    core: services.filter(s => s.category === 'core'),
    enhanced: services.filter(s => s.category === 'enhanced'),
    creative: services.filter(s => s.category === 'creative'),
  };

  let totalStarted = 0;
  let totalFailed = 0;

  for (const [category, categoryServices] of Object.entries(categories)) {
    if (categoryServices.length === 0) continue;
    
    const emoji = category === 'essential' ? '💎' : 
                  category === 'core' ? '🔧' : 
                  category === 'enhanced' ? '⚡' : '🎨';
    
    console.log(`${emoji} ${category.toUpperCase()} SERVICES (${categoryServices.length} Services)`);
    console.log('─'.repeat(60));

    for (const service of categoryServices) {
      console.log(`🚀 Starting: ${service.name} (Port ${service.port})`);
      console.log(`   ${service.description}`);
      
      const success = await startService(service);
      if (success) {
        totalStarted++;
      } else {
        totalFailed++;
        console.log(`   ❌ ${service.name} failed`);
      }
      
      await sleep(service.delay);
    }
    
    console.log();
  }

  // Final summary
  console.log();
  console.log('═'.repeat(60));
  console.log(`📊 STARTUP COMPLETE`);
  console.log(`   ✅ Running: ${totalStarted}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('═'.repeat(60));

  if (totalStarted > 0) {
    console.log(`
🌐 TOOBIX ist erreichbar unter:
   - Command Center: http://localhost:7777
   - Dashboard: http://localhost:8899
   - Health: http://localhost:9200
`);
  }

  // Keep process alive
  console.log('Press Ctrl+C to stop all services...');
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping all services...');
    for (const [name, proc] of runningProcesses) {
      try {
        proc.kill('SIGTERM');
        console.log(`   Stopped: ${name}`);
      } catch {}
    }
    process.exit(0);
  });
}

main().catch(console.error);
