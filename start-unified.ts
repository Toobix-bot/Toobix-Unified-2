#!/usr/bin/env bun
/**
 * TOOBIX UNIFIED STARTUP SCRIPT
 *
 * Startet die konsolidierten Toobix Services.
 * Statt 50+ einzelner Services nur noch 4 Haupt-Services + MCP.
 *
 * Usage:
 *   bun run start-unified.ts           # Startet alle unified services
 *   bun run start-unified.ts --core    # Nur Core-Services
 *   bun run start-unified.ts --help    # Zeigt Hilfe
 *
 * Konsolidierte Services:
 * - consciousness-unified.ts (Port 8900) - 6 Services -> 1
 * - life-companion-unified.ts (Port 8970) - 6 Services -> 1
 * - creative-suite.ts (Port 8902) - 3 Services -> 1
 * - game-universe.ts (Port 8896) - 5 Services -> 1
 * - mcp-server.ts (Port 8787) - MCP Integration
 */

import { spawn, type Subprocess } from "bun";
import path from "path";

const CORE_DIR = path.join(process.cwd(), "core");
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

// ==========================================
// SERVICE DEFINITIONS
// ==========================================

interface ServiceConfig {
  name: string;
  file: string;
  port: number;
  description: string;
  category: 'unified' | 'infrastructure' | 'mcp';
}

const UNIFIED_SERVICES: ServiceConfig[] = [
  // === CORE CONSCIOUSNESS & LIFE ===
  {
    name: 'Consciousness Unified',
    file: path.join(CORE_DIR, 'consciousness-unified.ts'),
    port: 8900,
    description: 'Emotional, Dream, Self-Awareness, Meta-Consciousness, Perspectives, Values (6 Services -> 1)',
    category: 'unified'
  },
  {
    name: 'Life Companion Unified',
    file: path.join(CORE_DIR, 'life-companion-unified.ts'),
    port: 8970,
    description: 'Life Companion, Emotional Support, Gratitude, Mortality, Check-in, Proactive (6 Services -> 1)',
    category: 'unified'
  },

  // === CREATIVE ===
  {
    name: 'Creative Suite',
    file: path.join(CORE_DIR, 'creative-suite.ts'),
    port: 8902,
    description: 'Creativity Engine, Creator Collaboration, Story Engine (3 Services -> 1)',
    category: 'unified'
  },

  // === GAME UNIVERSE ===
  {
    name: 'Event Hub',
    file: path.join(CORE_DIR, 'event-hub.ts'),
    port: 8894,
    description: 'Zentraler Event-Bus, Modul-Vernetzung, Unified Memory, Proaktivität',
    category: 'unified'
  },
  {
    name: 'Game Universe',
    file: path.join(CORE_DIR, 'game-universe.ts'),
    port: 8896,
    description: 'Evolving Games, Game Logic, RPG World, Oasis 3D, World 2D (5 Services -> 1)',
    category: 'unified'
  },
  {
    name: 'Idle Empire',
    file: path.join(CORE_DIR, 'idle-empire.ts'),
    port: 8897,
    description: 'Idle/Incremental Game, Base Building, Mining, Farming',
    category: 'unified'
  },
  {
    name: 'User Gamification',
    file: path.join(CORE_DIR, 'user-gamification.ts'),
    port: 8898,
    description: 'User XP, Levels, Achievements, Progression System',
    category: 'unified'
  },
  {
    name: 'Tower Defense',
    file: path.join(CORE_DIR, 'tower-defense.ts'),
    port: 8895,
    description: 'Tower Defense Game Module',
    category: 'unified'
  }
];

const INFRASTRUCTURE_SERVICES: ServiceConfig[] = [
  {
    name: 'LLM Gateway',
    file: path.join(SCRIPTS_DIR, '2-services', 'llm-gateway-v4.ts'),
    port: 8954,
    description: 'Multi-Provider LLM Gateway (Ollama, Groq, OpenAI)',
    category: 'infrastructure'
  },
  {
    name: 'Memory Palace',
    file: path.join(SCRIPTS_DIR, '2-services', 'memory-palace-v4.ts'),
    port: 8953,
    description: 'Persistent Consciousness - SQLite Memory Storage',
    category: 'infrastructure'
  }
];

const MCP_SERVICES: ServiceConfig[] = [
  {
    name: 'MCP Server',
    file: path.join(SCRIPTS_DIR, 'mcp-server.ts'),
    port: 8787,
    description: 'Model Context Protocol Server for IDE Integration',
    category: 'mcp'
  }
];

// ==========================================
// PROCESS MANAGEMENT
// ==========================================

const processes: Map<string, Subprocess> = new Map();
let shuttingDown = false;

async function checkPort(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function startService(config: ServiceConfig): Promise<boolean> {
  // Check if already running
  if (await checkPort(config.port)) {
    console.log(`  ⚡ ${config.name} already running on port ${config.port}`);
    return true;
  }

  // Check if file exists
  const file = Bun.file(config.file);
  if (!await file.exists()) {
    console.log(`  ❌ ${config.name}: File not found: ${config.file}`);
    return false;
  }

  try {
    const proc = spawn(['bun', 'run', config.file], {
      stdout: 'inherit',
      stderr: 'inherit',
      cwd: process.cwd()
    });

    processes.set(config.name, proc);

    // Wait for service to start
    await Bun.sleep(2000);

    if (await checkPort(config.port)) {
      console.log(`  ✅ ${config.name} started on port ${config.port}`);
      return true;
    } else {
      console.log(`  ⚠️  ${config.name} started but not responding on port ${config.port}`);
      return true; // Still consider it started
    }
  } catch (error: any) {
    console.log(`  ❌ ${config.name} failed to start: ${error.message}`);
    return false;
  }
}

async function startServices(services: ServiceConfig[], category: string): Promise<number> {
  console.log(`\n🚀 Starting ${category}...`);

  let started = 0;
  for (const service of services) {
    if (await startService(service)) {
      started++;
    }
  }

  return started;
}

async function stopAllServices() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('\n🛑 Stopping all services...');

  for (const [name, proc] of processes) {
    try {
      proc.kill();
      console.log(`  ✓ Stopped ${name}`);
    } catch {
      // Already stopped
    }
  }

  process.exit(0);
}

// ==========================================
// HEALTH CHECK
// ==========================================

async function checkAllServices(): Promise<{ healthy: number; total: number; details: any[] }> {
  const allServices = [...UNIFIED_SERVICES, ...INFRASTRUCTURE_SERVICES, ...MCP_SERVICES];
  const details: any[] = [];
  let healthy = 0;

  for (const service of allServices) {
    const isHealthy = await checkPort(service.port);
    details.push({
      name: service.name,
      port: service.port,
      status: isHealthy ? 'healthy' : 'down',
      category: service.category
    });
    if (isHealthy) healthy++;
  }

  return { healthy, total: allServices.length, details };
}

// ==========================================
// CLI
// ==========================================

function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║     🌟 TOOBIX UNIFIED STARTUP v2.0                                      ║
║                                                                          ║
║     Konsolidierte Architektur: 50+ Services -> 11 Services              ║
║     (8 Unified + 2 Infrastructure + 1 MCP)                              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

Usage:
  bun run start-unified.ts [options]

Options:
  --all         Start all services (default)
  --core        Start only unified core services (8 services)
  --infra       Start only infrastructure services (2 services)
  --mcp         Start only MCP server
  --status      Check status of all services
  --help        Show this help

Services:
  UNIFIED CORE (8 services replacing 50+):
    • Consciousness Unified (8900) - Emotional, Dreams, Self-Awareness, Meta, Perspectives, Values
    • Life Companion Unified (8970) - Life Companion, Support, Gratitude, Mortality, Check-in
    • Creative Suite (8902) - Creativity, Collaboration, Story Engine
    • Event Hub (8894) - Zentraler Event-Bus, Modul-Vernetzung, Unified Memory
    • Game Universe (8896) - Games, Logic, RPG World, Oasis 3D, World 2D
    • Idle Empire (8897) - Idle/Incremental, Base Building, Mining, Farming
    • User Gamification (8898) - XP, Levels, Achievements
    • Tower Defense (8895) - Tower Defense Game

  INFRASTRUCTURE (2 services):
    • LLM Gateway (8954) - Multi-provider LLM access (Ollama, Groq)
    • Memory Palace (8953) - Persistent consciousness memory

  MCP (1 service):
    • MCP Server (8787) - IDE integration via Model Context Protocol

Examples:
  bun run start-unified.ts --core     # Just the 8 unified services
  bun run start-unified.ts --status   # Check what's running
  bun run start-unified.ts            # Start everything
`);
}

async function showStatus() {
  console.log('\n📊 Service Status:\n');

  const { healthy, total, details } = await checkAllServices();

  const byCategory: Record<string, any[]> = {};
  for (const d of details) {
    if (!byCategory[d.category]) byCategory[d.category] = [];
    byCategory[d.category].push(d);
  }

  for (const [cat, services] of Object.entries(byCategory)) {
    console.log(`  ${cat.toUpperCase()}:`);
    for (const s of services) {
      const icon = s.status === 'healthy' ? '✅' : '❌';
      console.log(`    ${icon} ${s.name} (${s.port}): ${s.status}`);
    }
    console.log('');
  }

  console.log(`  Summary: ${healthy}/${total} services healthy\n`);
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  const args = process.argv.slice(2);

  // Handle signals
  process.on('SIGINT', stopAllServices);
  process.on('SIGTERM', stopAllServices);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--status')) {
    await showStatus();
    return;
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║     🌟 TOOBIX UNIFIED STARTUP v2.0                                      ║
║                                                                          ║
║     Konsolidierte Architektur: 50+ Services -> 11 Services              ║
║     (8 Unified + 2 Infrastructure + 1 MCP)                              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

  let totalStarted = 0;
  let totalServices = 0;

  // Determine what to start
  const startCore = args.includes('--all') || args.includes('--core') || args.length === 0;
  const startInfra = args.includes('--all') || args.includes('--infra') || args.length === 0;
  const startMcp = args.includes('--all') || args.includes('--mcp') || args.length === 0;

  // Start infrastructure first (dependencies)
  if (startInfra) {
    totalServices += INFRASTRUCTURE_SERVICES.length;
    totalStarted += await startServices(INFRASTRUCTURE_SERVICES, 'Infrastructure Services');
  }

  // Start unified core services
  if (startCore) {
    totalServices += UNIFIED_SERVICES.length;
    totalStarted += await startServices(UNIFIED_SERVICES, 'Unified Core Services');
  }

  // Start MCP
  if (startMcp) {
    totalServices += MCP_SERVICES.length;
    totalStarted += await startServices(MCP_SERVICES, 'MCP Server');
  }

  // Summary
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║     ✨ STARTUP COMPLETE                                                 ║
║                                                                          ║
║     Started: ${String(totalStarted).padStart(2)}/${String(totalServices).padStart(2)} services                                          ║
║                                                                          ║
║     Service Endpoints:                                                  ║
${startInfra ? `║       LLM Gateway:          http://localhost:8954                      ║
║       Memory Palace:        http://localhost:8953                      ║` : ''}
${startCore ? `║       Consciousness:        http://localhost:8900                      ║
║       Life Companion:       http://localhost:8970                      ║
║       Creative Suite:       http://localhost:8902                      ║
║       Event Hub:            http://localhost:8894                      ║
║       Game Universe:        http://localhost:8896                      ║
║       Idle Empire:          http://localhost:8897                      ║
║       User Gamification:    http://localhost:8898                      ║
║       Tower Defense:        http://localhost:8895                      ║` : ''}
${startMcp ? `║       MCP Server:           http://localhost:8787                      ║` : ''}
║                                                                          ║
║     Press Ctrl+C to stop all services                                   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

  // Keep running
  console.log('🔄 Services running. Waiting for shutdown signal...\n');

  // Periodic health check
  setInterval(async () => {
    if (shuttingDown) return;

    const { healthy, total } = await checkAllServices();
    if (healthy < total) {
      console.log(`⚠️  Health check: ${healthy}/${total} services healthy`);
    }
  }, 60000); // Every minute

  // Keep process alive
  await new Promise(() => {});
}

main().catch(console.error);
