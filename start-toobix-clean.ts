/**
 * 🚀 TOOBIX CLEAN STARTUP v2.0
 * 
 * Ein sauberes, strukturiertes Script das alle 31 Services zuverlässig startet.
 * Mit Liebe, Ordnung und Stolz! ❤️
 * 
 * Usage:
 *   bun run start-toobix-clean.ts           # Standard: Alle 31 Services
 *   bun run start-toobix-clean.ts --core    # Nur Core (13 Services)
 *   bun run start-toobix-clean.ts --minimal # Minimal (6 Services)
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
  delay: number; // Startup delay in ms
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
  { name: 'Event Bus', path: 'services/event-bus.ts', port: 8955, category: 'enhanced', description: 'Event-System', delay: 2500 },
  { name: 'LLM Gateway v4', path: 'scripts/2-services/llm-gateway-v4.ts', port: 8954, category: 'enhanced', description: 'Groq/LLM Schnittstelle', delay: 2500 },
  { name: 'Memory Palace v4', path: 'scripts/2-services/memory-palace-v4.ts', port: 8953, category: 'enhanced', description: 'Langzeitgedächtnis', delay: 2500 },
  { name: 'Performance Dashboard', path: 'services/performance-dashboard.ts', port: 8899, category: 'enhanced', description: 'Echtzeit-Monitoring', delay: 2500 },
  { name: 'MCP Bridge', path: 'scripts/mcp-server.ts', port: 8787, category: 'enhanced', description: 'Model Context Protocol bridge', delay: 2500 },
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

const processes: Map<string, ChildProcess> = new Map();
const serviceStatus: Map<string, 'starting' | 'running' | 'failed'> = new Map();
const REPO_ROOT = process.cwd();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMode(): 'full' | 'core' | 'minimal' {
  const arg = process.argv[2];
  if (arg === '--minimal' || arg === '-m') return 'minimal';
  if (arg === '--core' || arg === '-c') return 'core';
  return 'full';
}

function getServicesToStart(mode: 'full' | 'core' | 'minimal'): ServiceDef[] {
  switch (mode) {
    case 'minimal': return [...ESSENTIAL_SERVICES];
    case 'core': return [...ESSENTIAL_SERVICES, ...CORE_SERVICES];
    case 'full': return [...ESSENTIAL_SERVICES, ...CORE_SERVICES, ...ENHANCED_SERVICES, ...CREATIVE_SERVICES];
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPort(port: number, timeout = 2000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(`http://localhost:${port}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
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
    
    const proc = spawn('bun', ['run', service.path], {
      stdio: 'pipe',
      shell: true,
      cwd: REPO_ROOT,
      detached: false
    });

    let started = false;
    let output = '';

    proc.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Erkenne erfolgreichen Start
      if (!started && (
        text.includes('Listening') || 
        text.includes('Server running') || 
        text.includes('started') || 
        text.includes('running on') ||
        text.includes(`port ${service.port}`) ||
        text.includes(`PORT ${service.port}`) ||
        text.includes('Service is running')
      )) {
        started = true;
        serviceStatus.set(service.name, 'running');
        promiseResolve(true);
      }
    });

    proc.stderr?.on('data', (data) => {
      const text = data.toString();
      if (text.includes('EADDRINUSE')) {
        console.log(`   ⚠️  ${service.name}: Port ${service.port} already in use`);
      }
    });

    proc.on('error', () => {
      serviceStatus.set(service.name, 'failed');
      promiseResolve(false);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && !started) {
        serviceStatus.set(service.name, 'failed');
        promiseResolve(false);
      }
    });

    processes.set(service.name, proc);

    // Timeout: Nach 6 Sekunden als gestartet annehmen
    setTimeout(async () => {
      if (!started) {
        // Versuche Port-Check
        const portOpen = await checkPort(service.port, 1000);
        if (portOpen) {
          serviceStatus.set(service.name, 'running');
          promiseResolve(true);
        } else {
          // Prozess läuft noch? Dann annehmen, dass es funktioniert
          if (proc.exitCode === null) {
            serviceStatus.set(service.name, 'running');
            promiseResolve(true);
          } else {
            serviceStatus.set(service.name, 'failed');
            promiseResolve(false);
          }
        }
      }
    }, 6000);
  });
}

async function startCategory(services: ServiceDef[], categoryName: string, emoji: string): Promise<void> {
  console.log(`\n${emoji} ${categoryName.toUpperCase()} (${services.length} Services)`);
  console.log('─'.repeat(60));

  for (const service of services) {
    console.log(`🚀 Starting: ${service.name} (Port ${service.port})`);
    console.log(`   ${service.description}`);
    
    const success = await startService(service);
    
    if (success) {
      console.log(`   ✅ ${service.name} started`);
    } else {
      console.log(`   ❌ ${service.name} failed`);
    }
    
    // Warte zwischen Services
    await sleep(service.delay);
  }
}

async function performHealthCheck(): Promise<void> {
  console.log('\n🏥 HEALTH CHECK');
  console.log('─'.repeat(60));

  const allServices = [...ESSENTIAL_SERVICES, ...CORE_SERVICES, ...ENHANCED_SERVICES, ...CREATIVE_SERVICES];
  let healthy = 0;
  let unhealthy = 0;

  for (const service of allServices) {
    const status = serviceStatus.get(service.name);
    if (status !== 'running') continue;

    const isHealthy = await checkPort(service.port, 1500);
    if (isHealthy) {
      console.log(`✅ ${service.name.padEnd(30)} Port ${service.port} - OK`);
      healthy++;
    } else {
      console.log(`⚠️  ${service.name.padEnd(30)} Port ${service.port} - Not responding`);
      unhealthy++;
    }
  }

  console.log(`\n📊 ${healthy} healthy, ${unhealthy} not responding`);
}

function printFinalStatus(): void {
  let running = 0;
  let failed = 0;
  let starting = 0;

  for (const [_, status] of serviceStatus) {
    if (status === 'running') running++;
    else if (status === 'failed') failed++;
    else if (status === 'starting') starting++;
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 FINAL STATUS                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Running:  ${String(running).padStart(2)}                                             ║`);
  console.log(`║  ❌ Failed:   ${String(failed).padStart(2)}                                             ║`);
  console.log(`║  ⏳ Starting: ${String(starting).padStart(2)}                                             ║`);
  console.log(`║  📋 Total:    ${String(serviceStatus.size).padStart(2)}                                             ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

function printEndpoints(): void {
  console.log('\n🌐 WICHTIGE ENDPOINTS:');
  console.log('─'.repeat(60));
  console.log('💎 Command Center:    http://localhost:7777');
  console.log('🧠 Self-Awareness:    http://localhost:8970');
  console.log('💚 Emotional Core:    http://localhost:8900');
  console.log('🌙 Dream Core:        http://localhost:8961');
  console.log('🔮 Unified Gateway:   http://localhost:9000');
  console.log('🤖 LLM Gateway:       http://localhost:8954');
}

async function shutdown(): Promise<void> {
  console.log('\n\n🛑 Stopping all services...');
  
  for (const [name, proc] of processes) {
    try {
      proc.kill();
      console.log(`   ⏹️  Stopped ${name}`);
    } catch {
      // Ignore errors
    }
  }
  
  console.log('\n✅ All services stopped. Goodbye! 👋\n');
  process.exit(0);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.clear();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║     🤖 TOOBIX CLEAN STARTUP v2.0                            ║');
  console.log('║     Mit Liebe, Ordnung und Stolz! ❤️                         ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const mode = getMode();
  const services = getServicesToStart(mode);

  console.log(`\n📋 Mode: ${mode.toUpperCase()}`);
  console.log(`📦 Services to start: ${services.length}`);
  console.log(`📁 Working directory: ${REPO_ROOT}`);

  // Graceful shutdown handler
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start services by category
  const essential = services.filter(s => s.category === 'essential');
  const core = services.filter(s => s.category === 'core');
  const enhanced = services.filter(s => s.category === 'enhanced');
  const creative = services.filter(s => s.category === 'creative');

  if (essential.length > 0) await startCategory(essential, 'Essential Services', '💎');
  if (core.length > 0) await startCategory(core, 'Core Services', '🧠');
  if (enhanced.length > 0) await startCategory(enhanced, 'Enhanced Services', '⚡');
  if (creative.length > 0) await startCategory(creative, 'Creative Services', '🎨');

  // Health check
  await sleep(3000);
  await performHealthCheck();

  // Final status
  printFinalStatus();
  printEndpoints();

  console.log('\n🛑 Press Ctrl+C to stop all services\n');
  console.log('─'.repeat(60));
  console.log('🤖 Toobix is ALIVE and ready to serve! ✨');
  console.log('─'.repeat(60));

  // Keep alive
  await new Promise(() => {});
}

main().catch(console.error);
