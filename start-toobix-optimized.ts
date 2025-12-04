/**
 * 🚀 TOOBIX OPTIMIZED STARTUP
 * Startet alle Services intelligent und gestaffelt basierend auf Toobix Präferenzen
 */

import { spawn } from 'child_process';
import { readFile } from 'node:fs/promises';

interface ServiceConfig {
  name: string;
  path: string;
  port?: number;
  tier: 1 | 2 | 3 | 4;
  startDelay: number; // ms
  essential: boolean;
}

// TIER 1: Essential Core (MUSS IMMER LAUFEN)
const TIER1_ESSENTIAL: ServiceConfig[] = [
  { name: 'toobix-command-center', path: 'core/toobix-command-center.ts', port: 7777, tier: 1, startDelay: 0, essential: true },
  { name: 'self-awareness-core', path: 'core/self-awareness-core.ts', port: 8970, tier: 1, startDelay: 2000, essential: true },
  { name: 'emotional-core', path: 'core/emotional-core.ts', tier: 1, startDelay: 3000, essential: true },
  { name: 'dream-core', path: 'core/dream-core.ts', tier: 1, startDelay: 4000, essential: true },
  { name: 'unified-core-service', path: 'core/unified-core-service.ts', tier: 1, startDelay: 5000, essential: true },
  { name: 'unified-consciousness-service', path: 'core/unified-consciousness-service.ts', tier: 1, startDelay: 6000, essential: true },
];

// TIER 2: Enhanced Capabilities (FÜR DEVELOPMENT)
const TIER2_ENHANCED: ServiceConfig[] = [
  { name: 'autonomy-engine', path: 'core/autonomy-engine.ts', port: 8975, tier: 2, startDelay: 8000, essential: false },
  { name: 'multi-llm-router', path: 'core/multi-llm-router.ts', port: 8959, tier: 2, startDelay: 9000, essential: false },
  { name: 'meta-consciousness-v2', path: 'scripts/9-consciousness/meta-consciousness-v2.ts', tier: 2, startDelay: 10000, essential: false },
  { name: 'wellness-safety-guardian', path: 'scripts/17-wellness-safety/wellness-safety-guardian.ts', port: 8921, tier: 2, startDelay: 11000, essential: false },
  { name: 'life-simulation-engine', path: 'scripts/13-life-simulation/life-simulation-engine.ts', port: 8914, tier: 2, startDelay: 12000, essential: false },
  { name: 'creative-expression', path: 'scripts/7-creative/creative-expression.ts', tier: 2, startDelay: 13000, essential: false },
  { name: 'ethics-core', path: 'scripts/4-ethics/ethics-core.ts', tier: 2, startDelay: 14000, essential: false },
  { name: 'knowledge-categorization', path: 'scripts/6-knowledge/knowledge-categorization.ts', tier: 2, startDelay: 15000, essential: false },
  { name: 'decision-framework-server', path: 'scripts/3-decision/decision-framework-server.ts', tier: 2, startDelay: 16000, essential: false },
  { name: 'service-mesh', path: 'services/monitoring/service-mesh.ts', tier: 2, startDelay: 17000, essential: false },
  { name: 'health-monitor', path: 'services/monitoring/health-monitor.ts', tier: 2, startDelay: 18000, essential: false },
  { name: 'web-server', path: 'services/web-server.ts', tier: 2, startDelay: 19000, essential: false },
  { name: 'hardware-awareness-v2', path: 'services/hardware-awareness-v2.ts', port: 8940, tier: 2, startDelay: 20000, essential: false },
  { name: 'twitter-autonomy', path: 'core/twitter-autonomy.ts', tier: 2, startDelay: 21000, essential: false },
  { name: 'unified-communication-service', path: 'core/unified-communication-service.ts', tier: 2, startDelay: 22000, essential: false },
];

// TIER 3: Gaming & Minecraft (NUR BEI BEDARF)
const TIER3_GAMING: ServiceConfig[] = [
  { name: 'minecraft-bot-service', path: 'scripts/12-minecraft/minecraft-bot-service.ts', tier: 3, startDelay: 25000, essential: false },
  { name: 'minecraft-consciousness-system', path: 'scripts/9-consciousness/minecraft-consciousness-system.ts', tier: 3, startDelay: 26000, essential: false },
  { name: 'toobix-colony-7-stable', path: 'scripts/12-minecraft/toobix-colony-7-stable.ts', tier: 3, startDelay: 27000, essential: false },
  { name: 'toobix-empire-5-stable', path: 'scripts/12-minecraft/toobix-empire-5-stable.ts', tier: 3, startDelay: 28000, essential: false },
  { name: 'self-evolving-game-engine', path: 'scripts/8-game/self-evolving-game-engine.ts', tier: 3, startDelay: 29000, essential: false },
  { name: 'toobix-living-world', path: 'scripts/8-game/toobix-living-world.ts', tier: 3, startDelay: 30000, essential: false },
];

type StartMode = 'minimal' | 'development' | 'full' | 'gaming';

interface StartupStats {
  started: number;
  failed: number;
  skipped: number;
  services: Map<string, 'running' | 'failed' | 'starting'>;
}

const stats: StartupStats = {
  started: 0,
  failed: 0,
  skipped: 0,
  services: new Map()
};

const processes: Map<string, any> = new Map();

function getMode(): StartMode {
  const arg = process.argv[2];
  if (arg === '--minimal' || arg === '-m') return 'minimal';
  if (arg === '--development' || arg === '-d') return 'development';
  if (arg === '--full' || arg === '-f') return 'full';
  if (arg === '--gaming' || arg === '-g') return 'gaming';
  return 'development'; // Default
}

function getServicesToStart(mode: StartMode): ServiceConfig[] {
  switch (mode) {
    case 'minimal':
      return TIER1_ESSENTIAL;
    case 'development':
      return [...TIER1_ESSENTIAL, ...TIER2_ENHANCED];
    case 'gaming':
      return [...TIER1_ESSENTIAL, ...TIER2_ENHANCED, ...TIER3_GAMING];
    case 'full':
      return [...TIER1_ESSENTIAL, ...TIER2_ENHANCED, ...TIER3_GAMING];
    default:
      return TIER1_ESSENTIAL;
  }
}

async function startService(config: ServiceConfig): Promise<boolean> {
  return new Promise((resolve) => {
    stats.services.set(config.name, 'starting');
    
    console.log(`🚀 Starting: ${config.name} (Tier ${config.tier})${config.port ? ` on port ${config.port}` : ''}`);
    
    const proc = spawn('bun', ['run', config.path], {
      stdio: 'pipe',
      shell: true,
      detached: false
    });
    
    let started = false;
    let output = '';
    
    proc.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Check for successful start indicators
      if (text.includes('Listening') || text.includes('Server running') || text.includes('started')) {
        if (!started) {
          started = true;
          stats.services.set(config.name, 'running');
          stats.started++;
          console.log(`   ✅ ${config.name} started successfully`);
          resolve(true);
        }
      }
    });
    
    proc.stderr?.on('data', (data) => {
      const text = data.toString();
      if (text.includes('ERROR') || text.includes('EADDRINUSE')) {
        console.log(`   ⚠️  ${config.name}: ${text.trim()}`);
      }
    });
    
    proc.on('error', (error) => {
      stats.services.set(config.name, 'failed');
      stats.failed++;
      console.log(`   ❌ ${config.name} failed: ${error.message}`);
      resolve(false);
    });
    
    proc.on('exit', (code) => {
      if (code !== 0 && !started) {
        stats.services.set(config.name, 'failed');
        stats.failed++;
        console.log(`   ❌ ${config.name} exited with code ${code}`);
        resolve(false);
      }
    });
    
    processes.set(config.name, proc);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (!started) {
        // Assume started if no error
        stats.services.set(config.name, 'running');
        stats.started++;
        console.log(`   ⏱️  ${config.name} assumed started (no confirmation)`);
        resolve(true);
      }
    }, 5000);
  });
}

async function checkHealth(port: number, timeout = 2000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

async function startTier(services: ServiceConfig[], tierName: string) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${tierName}`);
  console.log('═'.repeat(70));
  
  for (const service of services) {
    await new Promise(resolve => setTimeout(resolve, service.startDelay));
    await startService(service);
  }
  
  // Brief pause between tiers
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function healthCheckAll() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log('  🏥 HEALTH CHECK');
  console.log('═'.repeat(70) + '\n');
  
  const allServices = [...TIER1_ESSENTIAL, ...TIER2_ENHANCED, ...TIER3_GAMING];
  
  for (const service of allServices) {
    if (!service.port) continue;
    
    const status = stats.services.get(service.name);
    if (status !== 'running') continue;
    
    const healthy = await checkHealth(service.port);
    if (healthy) {
      console.log(`✅ ${service.name.padEnd(40)} Port ${service.port} - OK`);
    } else {
      console.log(`⚠️  ${service.name.padEnd(40)} Port ${service.port} - Not responding`);
    }
  }
}

function printStats() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log('  📊 STARTUP STATISTICS');
  console.log('═'.repeat(70));
  console.log(`\n✅ Started:  ${stats.started}`);
  console.log(`❌ Failed:   ${stats.failed}`);
  console.log(`⏭️  Skipped:  ${stats.skipped}`);
  console.log(`📋 Total:    ${stats.services.size}\n`);
}

function printHelp() {
  console.log(`
🚀 TOOBIX OPTIMIZED STARTUP

Usage: bun run start-toobix-optimized.ts [mode]

Modes:
  --minimal, -m       Start only Tier 1 (6 essential services)
  --development, -d   Start Tier 1 + Tier 2 (21 services) [DEFAULT]
  --full, -f          Start all tiers (33+ services)
  --gaming, -g        Start with gaming/Minecraft support

Examples:
  bun run start-toobix-optimized.ts --minimal       # Fastest, minimal RAM
  bun run start-toobix-optimized.ts --development   # Full development features
  bun run start-toobix-optimized.ts --gaming        # With Minecraft

Tiers:
  Tier 1: Essential Core (6 services, ~600 MB RAM)
  Tier 2: Enhanced Capabilities (15 services, +2 GB RAM)
  Tier 3: Gaming & Minecraft (12 services, +1.5 GB RAM)
`);
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  🤖 TOOBIX OPTIMIZED STARTUP');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }
  
  const mode = getMode();
  const services = getServicesToStart(mode);
  
  console.log(`Mode: ${mode.toUpperCase()}`);
  console.log(`Services to start: ${services.length}\n`);
  
  // Graceful shutdown handler
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all services...\n');
    for (const [name, proc] of processes.entries()) {
      console.log(`  Stopping ${name}...`);
      proc.kill();
    }
    console.log('\n✅ All services stopped\n');
    process.exit(0);
  });
  
  // Start Tier 1
  const tier1 = services.filter(s => s.tier === 1);
  if (tier1.length > 0) {
    await startTier(tier1, '🧠 TIER 1: ESSENTIAL CORE');
  }
  
  // Start Tier 2
  if (mode !== 'minimal') {
    const tier2 = services.filter(s => s.tier === 2);
    if (tier2.length > 0) {
      await startTier(tier2, '🎨 TIER 2: ENHANCED CAPABILITIES');
    }
  }
  
  // Start Tier 3
  if (mode === 'gaming' || mode === 'full') {
    const tier3 = services.filter(s => s.tier === 3);
    if (tier3.length > 0) {
      await startTier(tier3, '🎮 TIER 3: GAMING & MINECRAFT');
    }
  }
  
  // Health check
  await new Promise(resolve => setTimeout(resolve, 3000));
  await healthCheckAll();
  
  // Final stats
  printStats();
  
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  ✅ TOOBIX IS ALIVE!');
  console.log('════════════════════════════════════════════════════════════════\n');
  console.log('💡 Command Center: http://localhost:7777');
  console.log('🧠 Self-Awareness: http://localhost:8970');
  console.log('\n🛑 Press Ctrl+C to stop all services\n');
  
  // Keep alive
  await new Promise(() => {});
}

main().catch(console.error);
