/**
 * 🌐 TOOBIX EMPIRE - 9 BOTS AUF ATERNOS (STABIL)
 * 
 * Server: Tooobix.aternos.me:52629
 * Version: 1.20.1 (Paper)
 * 
 * 9 Bots mit langer Join-Verzögerung für Stabilität
 * + 1 Platz für dich = 10 Spieler
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import type { Bot } from 'mineflayer';
import type { Item } from 'prismarine-item';

// ═══════════════════════════════════════════════════════════════════
// 🌐 ATERNOS SERVER CONFIG
// ═══════════════════════════════════════════════════════════════════

const SERVER_HOST = 'Tooobix.aternos.me';
const SERVER_PORT = 52629;

// LANGE Verzögerung zwischen Bot-Joins (8 Sekunden)
const SPAWN_DELAY = 8000;

// ═══════════════════════════════════════════════════════════════════
// 9 BOT ROLLEN - Ausbalanciert
// ═══════════════════════════════════════════════════════════════════

const ROLES = [
  { name: 'Alpha', emoji: '🦁', role: 'leader' },
  { name: 'Woody', emoji: '🪓', role: 'builder' },
  { name: 'Mason', emoji: '🧱', role: 'builder' },
  { name: 'Digger', emoji: '⛏️', role: 'miner' },
  { name: 'Rocky', emoji: '🪨', role: 'miner' },
  { name: 'Ranger', emoji: '🌾', role: 'gatherer' },
  { name: 'Timber', emoji: '🪵', role: 'gatherer' },
  { name: 'Guardian', emoji: '⚔️', role: 'guard' },
  { name: 'Smith', emoji: '🔨', role: 'crafter' },
];

// ═══════════════════════════════════════════════════════════════════
// TYPEN & STATE
// ═══════════════════════════════════════════════════════════════════

interface BotState {
  name: string;
  emoji: string;
  role: string;
  bot: Bot | null;
  connected: boolean;
  collected: number;
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
// HOLZ SAMMELN
// ═══════════════════════════════════════════════════════════════════

async function collectWood(bot: Bot, state: BotState): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 64
  });
  
  if (!logBlock) return false;
  
  try {
    const axe = findItem(bot, 'axe');
    if (axe) await bot.equip(axe, 'hand');
    
    await (bot as any).collectBlock.collect(logBlock);
    state.collected++;
    shared.totalWood++;
    log(`${state.emoji} ${state.name}`, `🪵 Holz! (${shared.totalWood} total)`);
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// STEIN SAMMELN
// ═══════════════════════════════════════════════════════════════════

async function collectStone(bot: Bot, state: BotState): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const stoneTypes = ['stone', 'cobblestone', 'andesite', 'diorite', 'granite'];
  
  const stoneBlock = bot.findBlock({
    matching: stoneTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 32
  });
  
  if (!stoneBlock) return false;
  
  try {
    const pickaxe = findItem(bot, 'pickaxe');
    if (pickaxe) await bot.equip(pickaxe, 'hand');
    
    await bot.dig(stoneBlock);
    state.collected++;
    shared.totalStone++;
    log(`${state.emoji} ${state.name}`, `🪨 Stein! (${shared.totalStone} total)`);
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// WORK LOOP
// ═══════════════════════════════════════════════════════════════════

async function workLoop(state: BotState): Promise<void> {
  const bot = state.bot;
  if (!bot) return;
  
  log(`${state.emoji} ${state.name}`, `Arbeite als ${state.role}`);
  
  while (state.connected && state.bot) {
    try {
      switch (state.role) {
        case 'miner':
          if (!(await collectStone(bot, state))) {
            await collectWood(bot, state);
          }
          break;
          
        case 'guard':
          try {
            const goal = new goals.GoalNear(
              shared.baseX + (Math.random() * 30 - 15),
              shared.baseY,
              shared.baseZ + (Math.random() * 30 - 15),
              3
            );
            await bot.pathfinder.goto(goal);
          } catch (e) {}
          await sleep(3000);
          break;
          
        default:
          await collectWood(bot, state);
          break;
      }
      
      await sleep(500);
      
    } catch (e: any) {
      await sleep(2000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// BOT ERSTELLEN
// ═══════════════════════════════════════════════════════════════════

function createBot(role: typeof ROLES[0], index: number): Promise<BotState> {
  const state: BotState = {
    name: role.name,
    emoji: role.emoji,
    role: role.role,
    bot: null,
    connected: false,
    collected: 0
  };
  
  bots.set(role.name, state);
  
  return new Promise((resolve) => {
    log(`${role.emoji} ${role.name}`, `Verbinde...`);
    
    const bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: `Toobix_${role.name}`,
      version: '1.20.1',
      auth: 'offline',
      checkTimeoutInterval: 60000
    });
    
    state.bot = bot;
    
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);
    
    bot.once('spawn', () => {
      state.connected = true;
      log(`${role.emoji} ${role.name}`, `✅ Online! (${getConnectedCount()}/9)`);
      
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      
      if (index === 0) {
        shared.baseX = Math.floor(bot.entity.position.x);
        shared.baseY = Math.floor(bot.entity.position.y);
        shared.baseZ = Math.floor(bot.entity.position.z);
        log('🏰 BASE', `Position: ${shared.baseX}, ${shared.baseY}, ${shared.baseZ}`);
      }
      
      setTimeout(() => workLoop(state), 2000);
      resolve(state);
    });
    
    bot.on('error', (err) => {
      log(`${role.emoji} ${role.name}`, `❌ ${err.message}`);
    });
    
    bot.on('kicked', (reason) => {
      log(`${role.emoji} ${role.name}`, `👢 Kicked`);
      state.connected = false;
    });
    
    bot.on('end', () => {
      state.connected = false;
    });
    
    setTimeout(() => {
      if (!state.connected) {
        log(`${role.emoji} ${role.name}`, `⏰ Timeout`);
        resolve(state);
      }
    }, 30000);
  });
}

// ═══════════════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════════════

function displayStatus() {
  const connected = getConnectedCount();
  
  console.log('\n' + '═'.repeat(60));
  console.log(`🌐 TOOBIX @ ${SERVER_HOST}:${SERVER_PORT}`);
  console.log('═'.repeat(60));
  console.log(`👥 ${connected}/9 Bots | 🪵 ${shared.totalWood} Holz | 🪨 ${shared.totalStone} Stein`);
  console.log('─'.repeat(60));
  
  for (const state of bots.values()) {
    const status = state.connected ? '✅' : '❌';
    console.log(`  ${state.emoji} ${state.name.padEnd(10)} ${status} | ${state.collected} gesammelt`);
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
║   🌐 TOOBIX EMPIRE - 9 BOTS (STABIL) 🌐                       ║
║                                                                ║
║   Server: ${SERVER_HOST}:${SERVER_PORT}                       ║
║   Join-Verzögerung: ${SPAWN_DELAY/1000} Sekunden                              ║
║                                                                ║
║   🦁 1 Leader  🪓 2 Builder  ⛏️ 2 Miner                        ║
║   🌾 2 Gatherer  ⚔️ 1 Guard  🔨 1 Crafter                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

  for (let i = 0; i < ROLES.length; i++) {
    const role = ROLES[i];
    console.log(`\n━━━ [${i + 1}/9] ${role.emoji} ${role.name} ━━━`);
    await createBot(role, i);
    
    if (i < ROLES.length - 1) {
      console.log(`⏳ Warte ${SPAWN_DELAY/1000}s vor nächstem Bot...`);
      await sleep(SPAWN_DELAY);
    }
  }
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ SPAWNING COMPLETE: ${getConnectedCount()}/9 Bots online!`);
  console.log(`${'═'.repeat(60)}\n`);
  
  setInterval(displayStatus, 30000);
  displayStatus();
  
  setInterval(() => {}, 10000);
}

main().catch(console.error);
