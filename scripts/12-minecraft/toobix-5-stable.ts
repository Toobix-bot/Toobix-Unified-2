/**
 * 🌐 TOOBIX 5 BOTS - STABIL MIT ANTI-KICK
 * 
 * Server: Tooobix.aternos.me:52629
 * 
 * FIXES:
 * - Längere Pausen zwischen Aktionen (keine Keepalive-Timeouts)
 * - Error-Handler für EPIPE
 * - Auto-Reconnect bei Disconnect
 * - Weniger aggressive Aktionen
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import type { Bot } from 'mineflayer';
import type { Item } from 'prismarine-item';

// ═══════════════════════════════════════════════════════════════════
// SERVER CONFIG
// ═══════════════════════════════════════════════════════════════════

const SERVER_HOST = 'Tooobix.aternos.me';
const SERVER_PORT = 52629;

// Längere Delays für Stabilität
const SPAWN_DELAY = 10000;      // 10s zwischen Bot-Joins
const ACTION_DELAY = 2000;       // 2s zwischen Aktionen
const IDLE_MOVEMENT_INTERVAL = 15000; // Alle 15s bewegen (Anti-AFK)
const SEARCH_RADIUS = 64;       // Größere Suchreichweite für Ressourcen
const EXPLORE_RADIUS = 50;      // Wie weit erkunden wenn nichts gefunden

// ═══════════════════════════════════════════════════════════════════
// 5 BOTS
// ═══════════════════════════════════════════════════════════════════

const ROLES = [
  { name: 'Alpha', emoji: '🦁', role: 'leader' },
  { name: 'Woody', emoji: '🪓', role: 'builder' },
  { name: 'Digger', emoji: '⛏️', role: 'miner' },
  { name: 'Ranger', emoji: '🌾', role: 'gatherer' },
  { name: 'Guardian', emoji: '⚔️', role: 'guard' },
];

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

interface BotState {
  name: string;
  emoji: string;
  role: string;
  bot: Bot | null;
  connected: boolean;
  collected: number;
  reconnectAttempts: number;
}

const bots: Map<string, BotState> = new Map();

const shared = {
  totalWood: 0,
  totalStone: 0,
  baseX: 0,
  baseY: 64,
  baseZ: 0
};

// ═══════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════

function log(prefix: string, msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${prefix}: ${msg}`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findItem(bot: Bot, ...names: string[]): Item | null {
  for (const item of bot.inventory.items()) {
    if (names.some(n => item.name.includes(n))) {
      return item;
    }
  }
  return null;
}

function getConnectedCount(): number {
  let count = 0;
  for (const state of bots.values()) {
    if (state.connected) count++;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════════
// ANTI-AFK: Kleine Bewegungen
// ═══════════════════════════════════════════════════════════════════

function startAntiAFK(bot: Bot, state: BotState) {
  setInterval(() => {
    if (!state.connected || !bot.entity) return;
    
    // Kleine zufällige Bewegung
    const yaw = Math.random() * Math.PI * 2;
    bot.look(yaw, 0);
    
    // Manchmal springen
    if (Math.random() < 0.3) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 100);
    }
  }, IDLE_MOVEMENT_INTERVAL);
}

// ═══════════════════════════════════════════════════════════════════
// ERKUNDEN - Wenn keine Ressourcen gefunden
// ═══════════════════════════════════════════════════════════════════

async function exploreForResources(bot: Bot, state: BotState): Promise<void> {
  if (!state.connected) return;
  
  log(`${state.emoji} ${state.name}`, `🧭 Erkunde Umgebung...`);
  
  try {
    const randomX = bot.entity.position.x + (Math.random() * EXPLORE_RADIUS * 2 - EXPLORE_RADIUS);
    const randomZ = bot.entity.position.z + (Math.random() * EXPLORE_RADIUS * 2 - EXPLORE_RADIUS);
    
    const goal = new goals.GoalNear(randomX, bot.entity.position.y, randomZ, 5);
    await bot.pathfinder.goto(goal);
    await sleep(1000);
  } catch (e) {
    // Pathfinding fehlgeschlagen, egal
    await sleep(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════
// HOLZ SAMMELN (LANGSAMER)
// ═══════════════════════════════════════════════════════════════════

async function collectWoodSlow(bot: Bot, state: BotState): Promise<boolean> {
  if (!state.connected) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: SEARCH_RADIUS  // Größere Distanz!
  });
  
  if (!logBlock) {
    // Kein Holz gefunden - erkunden!
    await exploreForResources(bot, state);
    return false;
  }
  
  try {
    // Pause VOR der Aktion
    await sleep(500);
    
    log(`${state.emoji} ${state.name}`, `🌲 Baum gefunden bei ${Math.floor(logBlock.position.x)}, ${Math.floor(logBlock.position.z)}`);
    
    const axe = findItem(bot, 'axe');
    if (axe) await bot.equip(axe, 'hand');
    
    await (bot as any).collectBlock.collect(logBlock);
    state.collected++;
    shared.totalWood++;
    log(`${state.emoji} ${state.name}`, `🪵 Holz! (${shared.totalWood} total)`);
    
    // Pause NACH der Aktion
    await sleep(ACTION_DELAY);
    return true;
  } catch (e) {
    await sleep(1000);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// STEIN SAMMELN (LANGSAMER)
// ═══════════════════════════════════════════════════════════════════

async function collectStoneSlow(bot: Bot, state: BotState): Promise<boolean> {
  if (!state.connected) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const stoneTypes = ['stone', 'cobblestone', 'andesite', 'diorite', 'granite'];
  
  const stoneBlock = bot.findBlock({
    matching: stoneTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: SEARCH_RADIUS  // Größere Distanz!
  });
  
  if (!stoneBlock) {
    await exploreForResources(bot, state);
    return false;
  }
  
  try {
    await sleep(500);
    
    const pickaxe = findItem(bot, 'pickaxe');
    if (pickaxe) await bot.equip(pickaxe, 'hand');
    
    await bot.dig(stoneBlock);
    state.collected++;
    shared.totalStone++;
    log(`${state.emoji} ${state.name}`, `🪨 Stein! (${shared.totalStone} total)`);
    
    await sleep(ACTION_DELAY);
    return true;
  } catch (e) {
    await sleep(1000);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// WORK LOOP (LANGSAMER)
// ═══════════════════════════════════════════════════════════════════

async function workLoop(state: BotState): Promise<void> {
  const bot = state.bot;
  if (!bot) return;
  
  log(`${state.emoji} ${state.name}`, `Starte langsame Arbeit als ${state.role}`);
  
  while (state.connected && state.bot) {
    try {
      switch (state.role) {
        case 'miner':
          if (!(await collectStoneSlow(bot, state))) {
            await collectWoodSlow(bot, state);
          }
          break;
          
        case 'guard':
          // Guards bewegen sich langsam
          try {
            const goal = new goals.GoalNear(
              shared.baseX + (Math.random() * 20 - 10),
              shared.baseY,
              shared.baseZ + (Math.random() * 20 - 10),
              3
            );
            await bot.pathfinder.goto(goal);
          } catch (e) {}
          await sleep(5000);  // Lange Pause
          break;
          
        default:
          await collectWoodSlow(bot, state);
          break;
      }
      
      // Extra Pause zwischen Zyklen
      await sleep(1000);
      
    } catch (e: any) {
      log(`${state.emoji} ${state.name}`, `⚠️ Fehler: ${e.message?.substring(0, 50)}`);
      await sleep(3000);
    }
  }
  
  log(`${state.emoji} ${state.name}`, `Work Loop beendet`);
}

// ═══════════════════════════════════════════════════════════════════
// BOT ERSTELLEN MIT AUTO-RECONNECT
// ═══════════════════════════════════════════════════════════════════

async function createBot(role: typeof ROLES[0], index: number): Promise<BotState> {
  const state: BotState = {
    name: role.name,
    emoji: role.emoji,
    role: role.role,
    bot: null,
    connected: false,
    collected: 0,
    reconnectAttempts: 0
  };
  
  bots.set(role.name, state);
  
  async function connect() {
    return new Promise<void>((resolve) => {
      log(`${role.emoji} ${role.name}`, `Verbinde... (Versuch ${state.reconnectAttempts + 1})`);
      
      const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: `Toobix_${role.name}`,
        version: '1.20.1',
        auth: 'offline',
        checkTimeoutInterval: 120000,  // 2 Minuten Timeout
        keepAlive: true
      });
      
      state.bot = bot;
      
      bot.loadPlugin(pathfinder);
      bot.loadPlugin(collectBlock);
      
      bot.once('spawn', () => {
        state.connected = true;
        state.reconnectAttempts = 0;
        log(`${role.emoji} ${role.name}`, `✅ Online! (${getConnectedCount()}/5)`);
        
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot);
        movements.canDig = true;
        bot.pathfinder.setMovements(movements);
        
        if (index === 0) {
          shared.baseX = Math.floor(bot.entity.position.x);
          shared.baseY = Math.floor(bot.entity.position.y);
          shared.baseZ = Math.floor(bot.entity.position.z);
          log('🏰 BASE', `Position: ${shared.baseX}, ${shared.baseY}, ${shared.baseZ}`);
        }
        
        // Anti-AFK starten
        startAntiAFK(bot, state);
        
        // Arbeit starten (verzögert)
        setTimeout(() => workLoop(state), 3000);
        
        resolve();
      });
      
      // Error Handler - NICHT crashen
      bot.on('error', (err) => {
        log(`${role.emoji} ${role.name}`, `❌ ${err.message?.substring(0, 40)}`);
        // Nicht sofort reconnecten bei Fehler
      });
      
      bot.on('kicked', (reason) => {
        log(`${role.emoji} ${role.name}`, `👢 Kicked: ${JSON.stringify(reason).substring(0, 40)}`);
        state.connected = false;
        scheduleReconnect();
      });
      
      bot.on('end', (reason) => {
        log(`${role.emoji} ${role.name}`, `🔌 Disconnected`);
        state.connected = false;
        scheduleReconnect();
      });
      
      // Timeout
      setTimeout(() => {
        if (!state.connected) {
          log(`${role.emoji} ${role.name}`, `⏰ Timeout`);
          resolve();
        }
      }, 30000);
    });
  }
  
  function scheduleReconnect() {
    if (state.reconnectAttempts < 3) {
      state.reconnectAttempts++;
      const delay = 10000 * state.reconnectAttempts;  // 10s, 20s, 30s
      log(`${role.emoji} ${role.name}`, `🔄 Reconnect in ${delay/1000}s...`);
      setTimeout(() => connect(), delay);
    } else {
      log(`${role.emoji} ${role.name}`, `❌ Max Reconnect-Versuche erreicht`);
    }
  }
  
  await connect();
  return state;
}

// ═══════════════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════════════

function displayStatus() {
  const connected = getConnectedCount();
  
  console.log('\n' + '═'.repeat(60));
  console.log(`🌐 TOOBIX 5-BOT @ ${SERVER_HOST}:${SERVER_PORT}`);
  console.log('═'.repeat(60));
  console.log(`👥 ${connected}/5 Bots | 🪵 ${shared.totalWood} Holz | 🪨 ${shared.totalStone} Stein`);
  console.log('─'.repeat(60));
  
  for (const state of bots.values()) {
    const status = state.connected ? '✅' : '❌';
    const reconnect = state.reconnectAttempts > 0 ? ` (R:${state.reconnectAttempts})` : '';
    console.log(`  ${state.emoji} ${state.name.padEnd(10)} ${status}${reconnect} | ${state.collected} gesammelt`);
  }
  
  console.log('═'.repeat(60) + '\n');
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🌐 TOOBIX 5-BOT STABLE 🌐                                   ║
║                                                                ║
║   Server: ${SERVER_HOST}:${SERVER_PORT}                       ║
║                                                                ║
║   ANTI-KICK FEATURES:                                         ║
║   ✓ 2s Pause zwischen Aktionen                                ║
║   ✓ Anti-AFK Bewegungen alle 15s                              ║
║   ✓ 2 Minuten Keepalive Timeout                               ║
║   ✓ Auto-Reconnect (max 3x)                                   ║
║   ✓ Kürzere Such-Distanzen                                    ║
║                                                                ║
║   🦁 Alpha  🪓 Woody  ⛏️ Digger  🌾 Ranger  ⚔️ Guardian         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

  // Spawne 5 Bots mit langer Verzögerung
  for (let i = 0; i < ROLES.length; i++) {
    const role = ROLES[i];
    console.log(`\n━━━ [${i + 1}/5] ${role.emoji} ${role.name} ━━━`);
    await createBot(role, i);
    
    if (i < ROLES.length - 1) {
      console.log(`⏳ Warte ${SPAWN_DELAY/1000}s vor nächstem Bot...`);
      await sleep(SPAWN_DELAY);
    }
  }
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ SPAWNING COMPLETE: ${getConnectedCount()}/5 Bots online!`);
  console.log(`${'═'.repeat(60)}\n`);
  
  // Status alle 30 Sekunden
  setInterval(displayStatus, 30000);
  displayStatus();
  
  // Keep alive
  setInterval(() => {}, 10000);
}

// Uncaught Error Handler - Script am Laufen halten
process.on('uncaughtException', (err) => {
  console.log(`⚠️ Uncaught Exception: ${err.message?.substring(0, 50)}`);
});

process.on('unhandledRejection', (reason) => {
  console.log(`⚠️ Unhandled Rejection: ${String(reason).substring(0, 50)}`);
});

main().catch(console.error);
