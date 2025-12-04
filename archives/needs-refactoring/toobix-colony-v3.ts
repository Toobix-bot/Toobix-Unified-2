/**
 * 🏰 TOOBIX COLONY V3 - OPTIMIERTE ERSTE TAGE
 * 
 * Verbesserungen:
 * - Schnelleres Spawning (5 Sekunden zwischen Bots)
 * - IMMER aktiv (kleine Bewegungen alle 5 Sekunden)
 * - Tag 1: Alle sammeln gemeinsam Holz
 * - Bessere Zusammenarbeit und Koordination
 * - Robustes Anti-Timeout System
 */

import mineflayer from 'mineflayer';
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============ KONFIGURATION ============
const CONFIG = {
  server: { host: 'localhost', port: 25565 },
  spawnDelay: 4000,      // Sehr schnell spawnen
  actionDelay: 600,      // Schnellere Aktionen
  keepAliveInterval: 2000, // Alle 2 Sekunden swingArm (ANTI-TIMEOUT)
  statusInterval: 45000,
  saveInterval: 20000,
};

// ============ BOT-DEFINITIONEN ============
interface BotConfig {
  name: string;
  emoji: string;
  role: string;
  priority: 'wood' | 'stone' | 'combat' | 'explore';
}

const BOT_CONFIGS: BotConfig[] = [
  { name: 'Alpha', emoji: '🦁', role: 'Anführer', priority: 'combat' },
  { name: 'Woody', emoji: '🪓', role: 'Holzfäller', priority: 'wood' },
  { name: 'Digger', emoji: '⛏️', role: 'Bergarbeiter', priority: 'stone' },
  { name: 'Mason', emoji: '🏗️', role: 'Baumeister', priority: 'wood' },
  { name: 'Flora', emoji: '🌾', role: 'Bäuerin', priority: 'wood' },
  { name: 'Scout', emoji: '🔭', role: 'Kundschafter', priority: 'explore' },
  { name: 'Sage', emoji: '📚', role: 'Weiser', priority: 'wood' },
];

// ============ BOT STATS ============
interface BotStats {
  wood: number;
  stone: number;
  kills: number;
  deaths: number;
  nightsSurvived: number;
  blocksWalked: number;
}

// ============ GLOBALE VARIABLEN ============
const MEMORY_FILE = './colony-v3-memory.json';
let activeBots: Map<string, mineflayer.Bot> = new Map();
let botStats: Map<string, BotStats> = new Map();
let isShuttingDown = false;
let currentDay = 0;
let totalWood = 0;
let totalStone = 0;
let isNightTime = false;
let spawnPoint: { x: number; y: number; z: number } | null = null;

// ============ INITIALISIERUNG ============
function initBotStats(): BotStats {
  return { wood: 0, stone: 0, kills: 0, deaths: 0, nightsSurvived: 0, blocksWalked: 0 };
}

function saveGame() {
  try {
    const data = {
      day: currentDay,
      totalWood,
      totalStone,
      bots: Object.fromEntries(botStats),
      spawnPoint,
      savedAt: new Date().toISOString(),
    };
    writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

function loadGame() {
  try {
    if (existsSync(MEMORY_FILE)) {
      const data = JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
      currentDay = data.day || 0;
      totalWood = data.totalWood || 0;
      totalStone = data.totalStone || 0;
      spawnPoint = data.spawnPoint || null;
      if (data.bots) {
        for (const [name, stats] of Object.entries(data.bots)) {
          botStats.set(name, stats as BotStats);
        }
      }
      return true;
    }
  } catch (e) {}
  return false;
}

// ============ UTILITY ============
function log(config: BotConfig, message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${config.emoji} ${config.name}: ${message}`);
}

function colonyLog(message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] 🏰 COLONY: ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isNight(bot: mineflayer.Bot): boolean {
  return bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000;
}

// ============ KEEP-ALIVE BEWEGUNG ============
function startKeepAlive(bot: mineflayer.Bot, config: BotConfig) {
  const interval = setInterval(() => {
    if (!activeBots.has(config.name) || isShuttingDown) {
      clearInterval(interval);
      return;
    }
    
    try {
      // WICHTIG: swingArm() hält die Verbindung aktiv!
      bot.swingArm('right');
      
      // Kleine Kopfbewegung
      const yaw = bot.entity.yaw + (Math.random() - 0.5) * 0.3;
      bot.look(yaw, bot.entity.pitch, false);
    } catch (e) {}
  }, CONFIG.keepAliveInterval);
  
  return interval;
}

// ============ AKTIONEN ============
async function gatherWood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  
  // Finde Holz in der Nähe
  const logs = bot.findBlocks({
    matching: block => block.name.includes('log'),
    maxDistance: 32,
    count: 1,
  });

  if (logs.length === 0) {
    // Kein Holz gefunden - erkunde
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 10;
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(
        bot.entity.position.x + Math.cos(angle) * dist,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * dist, 2));
      stats.blocksWalked += dist;
    } catch (e) {}
    return false;
  }

  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(logs[0].x, logs[0].y, logs[0].z, 1));
    
    const block = bot.blockAt(logs[0]);
    if (block && block.name.includes('log')) {
      await bot.dig(block);
      stats.wood++;
      totalWood++;
      log(config, `🪵 +1 Holz (Gesamt: ${stats.wood}, Colony: ${totalWood})`);
      return true;
    }
  } catch (e) {}
  return false;
}

async function mineStone(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  
  const stones = bot.findBlocks({
    matching: block => block.name === 'stone' || block.name === 'cobblestone',
    maxDistance: 16,
    count: 1,
  });

  if (stones.length === 0) {
    // Grabe unter dem Bot
    const below = bot.entity.position.offset(0, -1, 0);
    const block = bot.blockAt(below);
    if (block && block.name === 'stone') {
      try {
        await bot.dig(block);
        stats.stone++;
        totalStone++;
        log(config, `🪨 +1 Stein (Gesamt: ${stats.stone}, Colony: ${totalStone})`);
        return true;
      } catch (e) {}
    }
    return false;
  }

  try {
    const movements = new Movements(bot);
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(stones[0].x, stones[0].y, stones[0].z, 1));
    
    const block = bot.blockAt(stones[0]);
    if (block && (block.name === 'stone' || block.name === 'cobblestone')) {
      await bot.dig(block);
      stats.stone++;
      totalStone++;
      log(config, `🪨 +1 Stein (Gesamt: ${stats.stone}, Colony: ${totalStone})`);
      return true;
    }
  } catch (e) {}
  return false;
}

async function fightNearbyMobs(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  
  const hostiles = Object.values(bot.entities).filter(entity => {
    if (!entity || !entity.position) return false;
    const dist = entity.position.distanceTo(bot.entity.position);
    if (dist > 12) return false;
    const name = entity.name?.toLowerCase() || '';
    return ['zombie', 'skeleton', 'spider', 'creeper'].some(h => name.includes(h));
  });

  if (hostiles.length > 0) {
    const target = hostiles[0];
    log(config, `⚔️ Angriff auf ${target.name}!`);
    
    try {
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(
        target.position.x, target.position.y, target.position.z, 2));
      
      // Angreifen
      if (bot.entity.position.distanceTo(target.position) < 4) {
        bot.attack(target);
        await sleep(500);
        bot.attack(target);
        
        // Prüfe ob Mob noch lebt
        await sleep(1000);
        if (!bot.entities[target.id]) {
          stats.kills++;
          log(config, `💀 ${target.name} besiegt! (Kills: ${stats.kills})`);
        }
      }
      return true;
    } catch (e) {}
  }
  return false;
}

async function explore(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  const distance = 20 + Math.random() * 30;
  const angle = Math.random() * Math.PI * 2;

  log(config, `🧭 Erkunde neue Gebiete...`);
  
  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(
      bot.entity.position.x + Math.cos(angle) * distance,
      bot.entity.position.y,
      bot.entity.position.z + Math.sin(angle) * distance, 3));
    
    stats.blocksWalked += distance;
    return true;
  } catch (e) {}
  return false;
}

async function goToSpawn(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  if (!spawnPoint) return false;
  
  const dist = bot.entity.position.distanceTo(spawnPoint as any);
  if (dist < 10) return true;
  
  log(config, `🏠 Gehe zurück zum Spawn...`);
  
  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(spawnPoint.x, spawnPoint.y, spawnPoint.z, 5));
    return true;
  } catch (e) {}
  return false;
}

// ============ HAUPT-SCHLEIFE ============
async function runBotLoop(bot: mineflayer.Bot, config: BotConfig) {
  log(config, 'Starte Arbeitsschleife...');
  
  // Keep-Alive starten
  const keepAliveInterval = startKeepAlive(bot, config);
  
  while (!isShuttingDown && activeBots.has(config.name)) {
    try {
      const stats = botStats.get(config.name)!;
      const wasNight = isNightTime;
      isNightTime = isNight(bot);
      
      // Nacht-zu-Tag Übergang
      if (wasNight && !isNightTime) {
        stats.nightsSurvived++;
        currentDay++;
        log(config, `🌅 Tag ${currentDay}! Nacht ${stats.nightsSurvived} überlebt!`);
        colonyLog(`☀️ TAG ${currentDay} - Holz: ${totalWood}, Stein: ${totalStone}`);
      }

      // === TAG-VERHALTEN ===
      if (!isNightTime) {
        // Tag 1-2: Alle sammeln primär Holz (außer Alpha kämpft)
        if (currentDay <= 2) {
          if (config.priority === 'combat') {
            // Alpha: Kämpfe ODER sammle Holz
            const fought = await fightNearbyMobs(bot, config);
            if (!fought) {
              await gatherWood(bot, config);
            }
          } else {
            // Alle anderen: HOLZ SAMMELN
            await gatherWood(bot, config);
          }
        } 
        // Tag 3+: Spezialisierung
        else {
          switch (config.priority) {
            case 'combat':
              const fought = await fightNearbyMobs(bot, config);
              if (!fought) await gatherWood(bot, config);
              break;
            case 'wood':
              await gatherWood(bot, config);
              break;
            case 'stone':
              // Erst Holz für Werkzeuge, dann Stein
              if (totalWood < 50) {
                await gatherWood(bot, config);
              } else {
                await mineStone(bot, config);
              }
              break;
            case 'explore':
              if (Math.random() < 0.3) {
                await explore(bot, config);
              } else {
                await gatherWood(bot, config);
              }
              break;
          }
        }
      }
      // === NACHT-VERHALTEN ===
      else {
        // OPTIMIERT: Auch nachts Holz sammeln! Keine Zeit verschwenden!
        if (config.priority === 'combat' || config.name === 'Scout' || config.name === 'Alpha') {
          // Kämpfer kämpfen oder sammeln Holz
          const fought = await fightNearbyMobs(bot, config);
          if (!fought) await gatherWood(bot, config);
        } 
        else {
          // Alle anderen: HOLZ SAMMELN (auch nachts!)
          await gatherWood(bot, config);
        }
      }

      await sleep(CONFIG.actionDelay);
      
    } catch (err: any) {
      if (!isShuttingDown) {
        // Bei Fehler: Kleine Bewegung um aktiv zu bleiben
        try {
          bot.setControlState('forward', true);
          await sleep(200);
          bot.setControlState('forward', false);
        } catch (e) {}
      }
      await sleep(1000);
    }
  }
  
  clearInterval(keepAliveInterval);
}

// ============ BOT ERSTELLEN ============
async function createBot(config: BotConfig): Promise<mineflayer.Bot | null> {
  return new Promise((resolve) => {
    const botName = `Toobix${config.name}`;
    
    try {
      const bot = mineflayer.createBot({
        host: CONFIG.server.host,
        port: CONFIG.server.port,
        username: botName,
        hideErrors: true,
      });

      // Schnelleres Timeout (15 Sekunden)
      const timeout = setTimeout(() => {
        log(config, '⏱️ Spawn-Timeout');
        try { bot.quit(); } catch (e) {}
        resolve(null);
      }, 15000);

      // Sofort Keep-Alive starten sobald verbunden
      let earlyKeepAlive: ReturnType<typeof setInterval> | null = null;
      
      bot.once('login', () => {
        // Frühes Keep-Alive während Spawn
        earlyKeepAlive = setInterval(() => {
          try { bot.swingArm('right'); } catch (e) {}
        }, 1000);
      });

      bot.once('spawn', () => {
        clearTimeout(timeout);
        if (earlyKeepAlive) clearInterval(earlyKeepAlive);
        
        log(config, '✅ Gespawnt!');
        
        try { bot.loadPlugin(pathfinder); } catch (e) {}
        
        // Initialisiere Stats
        if (!botStats.has(config.name)) {
          botStats.set(config.name, initBotStats());
        }
        
        // Setze Spawn-Punkt (erster Bot setzt ihn)
        if (!spawnPoint) {
          spawnPoint = {
            x: bot.entity.position.x,
            y: bot.entity.position.y,
            z: bot.entity.position.z,
          };
          colonyLog(`📍 Basis-Koordinaten: ${Math.round(spawnPoint.x)}, ${Math.round(spawnPoint.y)}, ${Math.round(spawnPoint.z)}`);
        }
        
        activeBots.set(config.name, bot);
        resolve(bot);
      });

      bot.on('error', (err) => {
        if (!isShuttingDown) log(config, `❌ ${err.message}`);
      });

      bot.on('kicked', (reason) => {
        log(config, `🚫 Gekickt`);
        activeBots.delete(config.name);
      });

      bot.on('end', () => {
        if (!isShuttingDown) log(config, '🔌 Getrennt');
        activeBots.delete(config.name);
      });

      bot.on('death', () => {
        log(config, '💀 Gestorben!');
        const stats = botStats.get(config.name)!;
        stats.deaths++;
      });

    } catch (err: any) {
      log(config, `❌ Fehler: ${err.message}`);
      resolve(null);
    }
  });
}

// ============ STATUS ============
function printStatus() {
  console.log('\n' + '═'.repeat(70));
  console.log('🏰 TOOBIX COLONY V3 - STATUS');
  console.log('═'.repeat(70));
  
  const timeStr = isNightTime ? '🌙 NACHT' : '☀️ TAG';
  console.log(`\n📅 Tag ${currentDay} | ${timeStr}`);
  console.log(`🤖 Aktive Bots: ${activeBots.size}/${BOT_CONFIGS.length}`);
  
  console.log(`\n📦 RESSOURCEN:`);
  console.log(`   🪵 Holz: ${totalWood} | 🪨 Stein: ${totalStone}`);
  
  console.log('\n👥 BOT-ÜBERSICHT:');
  for (const config of BOT_CONFIGS) {
    const stats = botStats.get(config.name);
    const active = activeBots.has(config.name) ? '✅' : '❌';
    if (stats) {
      console.log(`   ${config.emoji} ${config.name.padEnd(6)} ${active} | 🪵${stats.wood.toString().padStart(3)} 🪨${stats.stone.toString().padStart(3)} ⚔️${stats.kills} 💀${stats.deaths}`);
    } else {
      console.log(`   ${config.emoji} ${config.name.padEnd(6)} ${active}`);
    }
  }
  
  console.log('═'.repeat(70) + '\n');
}

// ============ HAUPTFUNKTION ============
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║              🏰 TOOBIX COLONY V3 - OPTIMIERT 🏰                     ║');
  console.log('║                                                                    ║');
  console.log('║  7 Bots • Schnelles Spawning • Anti-Timeout • Teamwork Tag 1      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Lade Spielstand oder starte neu
  const loaded = loadGame();
  if (loaded) {
    colonyLog(`Spielstand geladen: Tag ${currentDay}, Holz: ${totalWood}, Stein: ${totalStone}`);
  } else {
    colonyLog('Neues Spiel gestartet!');
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Colony wird heruntergefahren...');
    isShuttingDown = true;
    
    for (const [name, bot] of activeBots) {
      try { bot.quit(); } catch (e) {}
    }
    
    saveGame();
    console.log('💾 Spielstand gespeichert!');
    
    printStatus();
    process.exit(0);
  });

  // Spawne alle Bots schnell hintereinander
  for (const config of BOT_CONFIGS) {
    console.log(`\nSpawne ${config.emoji} ${config.name} (${config.role})...`);
    
    const bot = await createBot(config);
    if (bot) {
      runBotLoop(bot, config).catch(() => {});
    }
    
    await sleep(CONFIG.spawnDelay);
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`✅ ${activeBots.size}/${BOT_CONFIGS.length} Bots aktiv!`);
  console.log('═'.repeat(70) + '\n');

  // Status-Intervall
  setInterval(() => {
    if (!isShuttingDown) {
      printStatus();
      saveGame();
    }
  }, CONFIG.statusInterval);

  // Web-Dashboard bleibt am Leben
  Bun.serve({
    port: 8765,
    fetch(req) {
      const status = {
        day: currentDay,
        totalWood,
        totalStone,
        activeBots: activeBots.size,
        isNight: isNightTime,
        bots: Object.fromEntries(botStats),
      };
      return new Response(JSON.stringify(status, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  
  colonyLog('🌐 Status-API: http://localhost:8765');
}

main().catch(console.error);
