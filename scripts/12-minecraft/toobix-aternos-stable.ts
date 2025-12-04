/**
 * 🌐 TOOBIX EMPIRE - ATERNOS OPTIMIERT
 * 
 * Mit längeren Timeouts für Aternos-Server!
 * 
 * Server: Tooobix.aternos.me:52629
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import type { Bot } from 'mineflayer';
import type { Item } from 'prismarine-item';

const SERVER_HOST = 'Tooobix.aternos.me';
const SERVER_PORT = 52629;

// Längere Verzögerung für Aternos
const SPAWN_DELAY = 5000;

// 19 Bot-Rollen
const ROLES = [
  { name: 'Alpha', emoji: '🦁', role: 'leader' },
  { name: 'Woody', emoji: '🪓', role: 'builder' },
  { name: 'Mason', emoji: '🧱', role: 'builder' },
  { name: 'Archie', emoji: '🏗️', role: 'builder' },
  { name: 'Digger', emoji: '⛏️', role: 'miner' },
  { name: 'Rocky', emoji: '🪨', role: 'miner' },
  { name: 'Ironman', emoji: '🔩', role: 'miner' },
  { name: 'Deepy', emoji: '🕳️', role: 'miner' },
  { name: 'Ranger', emoji: '🌾', role: 'gatherer' },
  { name: 'Forester', emoji: '🌲', role: 'gatherer' },
  { name: 'Leafy', emoji: '🍃', role: 'gatherer' },
  { name: 'Timber', emoji: '🪵', role: 'gatherer' },
  { name: 'Guardian', emoji: '⚔️', role: 'guard' },
  { name: 'Knight', emoji: '🛡️', role: 'guard' },
  { name: 'Sentinel', emoji: '👁️', role: 'guard' },
  { name: 'Farmer', emoji: '🌽', role: 'farmer' },
  { name: 'Harvest', emoji: '🥕', role: 'farmer' },
  { name: 'Smith', emoji: '🔨', role: 'crafter' },
  { name: 'Artisan', emoji: '⚒️', role: 'crafter' },
];

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

// Holz sammeln
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

// Work Loop
async function workLoop(state: BotState): Promise<void> {
  const bot = state.bot;
  if (!bot) return;
  
  log(`${state.emoji} ${state.name}`, `Starte Arbeit!`);
  
  while (state.connected && state.bot) {
    try {
      // Alle sammeln erstmal Holz
      await collectWood(bot, state);
      await sleep(500);
    } catch (e: any) {
      await sleep(2000);
    }
  }
}

// Bot erstellen mit längeren Timeouts
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
    const bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: `Tx_${role.name}`,  // Kürzere Namen
      version: '1.20.1',
      auth: 'offline',
      // Längere Timeouts für Aternos
      checkTimeoutInterval: 60000,  // 60 Sekunden statt 30
    });
    
    state.bot = bot;
    
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);
    
    // Keep-Alive Handling
    let lastKeepAlive = Date.now();
    
    bot.on('keep_alive' as any, () => {
      lastKeepAlive = Date.now();
    });
    
    bot.once('spawn', () => {
      state.connected = true;
      log(`${role.emoji} ${role.name}`, `✅ Online! (${getConnectedCount()}/19)`);
      
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      
      if (index === 0) {
        shared.baseX = Math.floor(bot.entity.position.x);
        shared.baseY = Math.floor(bot.entity.position.y);
        shared.baseZ = Math.floor(bot.entity.position.z);
        log('🏰 BASE', `Position: ${shared.baseX}, ${shared.baseY}, ${shared.baseZ}`);
      }
      
      // Verzögerter Start
      setTimeout(() => workLoop(state), 2000 + index * 1000);
      
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
    
    // Längerer Timeout
    setTimeout(() => {
      if (!state.connected) {
        log(`${role.emoji} ${role.name}`, `⏰ Timeout`);
        resolve(state);
      }
    }, 45000);
  });
}

// Status anzeigen
function displayStatus() {
  const connected = getConnectedCount();
  
  console.log('\n' + '═'.repeat(60));
  console.log(`🌐 TOOBIX @ Aternos | 👥 ${connected}/19 | 🪵 ${shared.totalWood}`);
  console.log('═'.repeat(60));
  
  const online = Array.from(bots.values()).filter(b => b.connected);
  const offline = Array.from(bots.values()).filter(b => !b.connected);
  
  if (online.length > 0) {
    console.log(`✅ Online: ${online.map(b => b.emoji).join(' ')}`);
  }
  if (offline.length > 0) {
    console.log(`❌ Offline: ${offline.map(b => b.emoji).join(' ')}`);
  }
  
  console.log('═'.repeat(60) + '\n');
}

// Main
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🌐 TOOBIX EMPIRE - ATERNOS                                 ║
║                                                              ║
║   Server: ${SERVER_HOST}:${SERVER_PORT}                     ║
║   Bots: 19 (1 Platz für dich!)                              ║
║                                                              ║
║   ⚙️ Optimiert für Aternos (längere Timeouts)               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Spawne Bots
  for (let i = 0; i < ROLES.length; i++) {
    const role = ROLES[i];
    console.log(`[${i + 1}/19] ${role.emoji} ${role.name}...`);
    await createBot(role, i);
    await sleep(SPAWN_DELAY);
  }
  
  console.log(`\n✅ ${getConnectedCount()}/19 BOTS VERBUNDEN!\n`);
  
  // Status alle 30 Sekunden
  setInterval(displayStatus, 30000);
  setTimeout(displayStatus, 5000);
  
  // Keep alive
  setInterval(() => {}, 10000);
}

main().catch(console.error);
