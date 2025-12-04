/**
 * 🌐 TOOBIX EMPIRE - 19 BOTS AUF ATERNOS!
 * 
 * Server: Tooobix.aternos.me:52629
 * Version: 1.20.1 (Paper)
 * Schwierigkeit: Easy
 * Cracked: AN
 * 
 * 19 Bots + 1 Platz für dich = 20 Spieler max
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

// Spawn-Verzögerung zwischen Bots (ms) - Länger für Aternos Rate-Limiting
const SPAWN_DELAY = 4000;

// ═══════════════════════════════════════════════════════════════════
// 19 BOT ROLLEN - Große Kolonie!
// ═══════════════════════════════════════════════════════════════════

const ROLES = [
  // LEADER (1)
  { name: 'Alpha', emoji: '🦁', role: 'leader', task: 'Koordiniert alles' },
  
  // BUILDER (3)
  { name: 'Woody', emoji: '🪓', role: 'builder', task: 'Baut Häuser' },
  { name: 'Mason', emoji: '🧱', role: 'builder', task: 'Baut Mauern' },
  { name: 'Archie', emoji: '🏗️', role: 'builder', task: 'Baut Strukturen' },
  
  // MINER (4)
  { name: 'Digger', emoji: '⛏️', role: 'miner', task: 'Gräbt Tunnel' },
  { name: 'Rocky', emoji: '🪨', role: 'miner', task: 'Sammelt Stein' },
  { name: 'Ironman', emoji: '🔩', role: 'miner', task: 'Sucht Erze' },
  { name: 'Deepy', emoji: '🕳️', role: 'miner', task: 'Tiefbau' },
  
  // GATHERER (4)
  { name: 'Ranger', emoji: '🌾', role: 'gatherer', task: 'Sammelt Holz' },
  { name: 'Forester', emoji: '🌲', role: 'gatherer', task: 'Fällt Bäume' },
  { name: 'Leafy', emoji: '🍃', role: 'gatherer', task: 'Sammelt Pflanzen' },
  { name: 'Timber', emoji: '🪵', role: 'gatherer', task: 'Holzfäller' },
  
  // GUARD (3)
  { name: 'Guardian', emoji: '⚔️', role: 'guard', task: 'Bewacht Basis' },
  { name: 'Knight', emoji: '🛡️', role: 'guard', task: 'Patrouilliert' },
  { name: 'Sentinel', emoji: '👁️', role: 'guard', task: 'Wächter' },
  
  // FARMER (2)
  { name: 'Farmer', emoji: '🌽', role: 'farmer', task: 'Baut Essen an' },
  { name: 'Harvest', emoji: '🥕', role: 'farmer', task: 'Erntet' },
  
  // CRAFTER (2)
  { name: 'Smith', emoji: '🔨', role: 'crafter', task: 'Craftet Tools' },
  { name: 'Artisan', emoji: '⚒️', role: 'crafter', task: 'Craftet Items' },
];

// ═══════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════

type Phase = 'CONNECTING' | 'WOOD_COLLECTION' | 'CRAFTING' | 'BUILDING' | 'MINING' | 'FARMING';

interface BotState {
  name: string;
  emoji: string;
  role: string;
  task: string;
  bot: Bot | null;
  connected: boolean;
  collected: number;
  working: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// GLOBALER STATE
// ═══════════════════════════════════════════════════════════════════

const bots: Map<string, BotState> = new Map();

const shared = {
  phase: 'CONNECTING' as Phase,
  totalWood: 0,
  totalStone: 0,
  totalFood: 0,
  baseX: 0,
  baseY: 64,
  baseZ: 0,
  craftingTablePlaced: false
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

function countItem(bot: Bot, ...names: string[]): number {
  let count = 0;
  for (const item of bot.inventory.items()) {
    if (names.some(n => item.name.includes(n))) {
      count += item.count;
    }
  }
  return count;
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
// SAMMELN: HOLZ
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
// SAMMELN: STEIN
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
// WORK LOOP - Je nach Rolle
// ═══════════════════════════════════════════════════════════════════

async function workLoop(state: BotState): Promise<void> {
  const bot = state.bot;
  if (!bot) return;
  
  log(`${state.emoji} ${state.name}`, `Arbeite als ${state.role}: ${state.task}`);
  
  while (state.connected) {
    try {
      state.working = true;
      
      // Phase 1: Alle sammeln Holz
      if (shared.phase === 'WOOD_COLLECTION' || shared.phase === 'CONNECTING') {
        await collectWood(bot, state);
        
        // Nach 100 Holz → nächste Phase
        if (shared.totalWood >= 100 && shared.phase !== 'CRAFTING') {
          shared.phase = 'CRAFTING';
          log('🏰 EMPIRE', `✅ ${shared.totalWood} Holz! → CRAFTING PHASE`);
        }
      }
      
      // Phase 2: Rollen-basierte Arbeit
      else {
        switch (state.role) {
          case 'leader':
            // Alpha koordiniert - schaut was fehlt
            await sleep(5000);
            break;
            
          case 'builder':
            // Builder sammeln Holz für Bauten
            await collectWood(bot, state);
            break;
            
          case 'miner':
            // Miner graben Stein
            if (!(await collectStone(bot, state))) {
              // Kein Stein? Holz sammeln
              await collectWood(bot, state);
            }
            break;
            
          case 'gatherer':
            // Gatherer sammeln Holz
            await collectWood(bot, state);
            break;
            
          case 'guard':
            // Guards patroullieren um Basis
            const goal = new goals.GoalNear(
              shared.baseX + (Math.random() * 20 - 10),
              shared.baseY,
              shared.baseZ + (Math.random() * 20 - 10),
              3
            );
            try {
              await bot.pathfinder.goto(goal);
            } catch (e) {}
            await sleep(3000);
            break;
            
          case 'farmer':
            // Farmer suchen Essen
            await collectWood(bot, state); // Erstmal Holz
            break;
            
          case 'crafter':
            // Crafter sammeln Ressourcen
            await collectWood(bot, state);
            break;
        }
      }
      
      state.working = false;
      await sleep(500);
      
    } catch (e: any) {
      await sleep(2000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// BOT ERSTELLEN
// ═══════════════════════════════════════════════════════════════════

async function createBot(role: typeof ROLES[0], index: number): Promise<BotState> {
  const state: BotState = {
    name: role.name,
    emoji: role.emoji,
    role: role.role,
    task: role.task,
    bot: null,
    connected: false,
    collected: 0,
    working: false
  };
  
  bots.set(role.name, state);
  
  return new Promise((resolve) => {
    log(`${role.emoji} ${role.name}`, `Verbinde zu Aternos...`);
    
    const bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: `Toobix_${role.name}`,
      version: '1.20.1',
      auth: 'offline'
    });
    
    state.bot = bot;
    
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);
    
    bot.once('spawn', () => {
      log(`${role.emoji} ${role.name}`, `✅ Online! (${getConnectedCount() + 1}/19)`);
      state.connected = true;
      
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      
      // Basis-Position vom ersten Bot
      if (index === 0) {
        shared.baseX = Math.floor(bot.entity.position.x);
        shared.baseY = Math.floor(bot.entity.position.y);
        shared.baseZ = Math.floor(bot.entity.position.z);
      }
      
      // Work Loop starten
      setTimeout(() => workLoop(state), 2000);
      
      resolve(state);
    });
    
    bot.on('error', (err) => {
      log(`${role.emoji} ${role.name}`, `❌ ${err.message}`);
    });
    
    bot.on('kicked', (reason) => {
      log(`${role.emoji} ${role.name}`, `👢 Kicked: ${reason}`);
      state.connected = false;
    });
    
    bot.on('end', () => {
      log(`${role.emoji} ${role.name}`, `🔌 Offline`);
      state.connected = false;
    });
    
    // Timeout
    setTimeout(() => {
      if (!state.connected) {
        log(`${role.emoji} ${role.name}`, `⏰ Timeout`);
        resolve(state);
      }
    }, 30000);
  });
}

// ═══════════════════════════════════════════════════════════════════
// STATUS DISPLAY
// ═══════════════════════════════════════════════════════════════════

function displayStatus() {
  const connected = getConnectedCount();
  
  console.log('\n' + '═'.repeat(70));
  console.log(`🌐 TOOBIX EMPIRE - ATERNOS`);
  console.log(`📍 ${SERVER_HOST}:${SERVER_PORT}`);
  console.log('═'.repeat(70));
  console.log(`👥 Bots: ${connected}/19 | Phase: ${shared.phase}`);
  console.log(`🪵 Holz: ${shared.totalWood} | 🪨 Stein: ${shared.totalStone}`);
  console.log('─'.repeat(70));
  
  // Gruppiert nach Rolle
  const roles = ['leader', 'builder', 'miner', 'gatherer', 'guard', 'farmer', 'crafter'];
  for (const role of roles) {
    const roleBots = Array.from(bots.values()).filter(b => b.role === role);
    if (roleBots.length > 0) {
      const line = roleBots.map(b => {
        const status = b.connected ? '✅' : '❌';
        return `${b.emoji}${b.name}${status}`;
      }).join(' ');
      console.log(`  ${role.toUpperCase().padEnd(10)}: ${line}`);
    }
  }
  
  console.log('═'.repeat(70) + '\n');
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🌐 TOOBIX EMPIRE - 19 BOTS AUF ATERNOS! 🌐                          ║
║                                                                        ║
║   Server: ${SERVER_HOST}:${SERVER_PORT}                               ║
║   Version: 1.20.1 (Paper)                                             ║
║   Schwierigkeit: Easy                                                  ║
║                                                                        ║
║   19 Bots werden gespawnt...                                          ║
║   (1 Platz bleibt für dich frei!)                                     ║
║                                                                        ║
║   ROLLEN:                                                              ║
║   🦁 1 Leader    🪓 3 Builder    ⛏️ 4 Miner                            ║
║   🌾 4 Gatherer  ⚔️ 3 Guard      🌽 2 Farmer    🔨 2 Crafter           ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  await sleep(3000);
  
  // Spawne alle 19 Bots
  for (let i = 0; i < ROLES.length; i++) {
    const role = ROLES[i];
    console.log(`\n[${i + 1}/19] Spawning ${role.emoji} ${role.name} (${role.role})...`);
    await createBot(role, i);
    await sleep(SPAWN_DELAY);
  }
  
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`✅ ${getConnectedCount()}/19 BOTS VERBUNDEN!`);
  console.log(`${'═'.repeat(70)}\n`);
  
  // Phase starten
  if (getConnectedCount() > 0) {
    shared.phase = 'WOOD_COLLECTION';
    log('🏰 EMPIRE', '🪵 Alle sammeln Holz!');
  }
  
  // Status alle 20 Sekunden
  setInterval(displayStatus, 20000);
  displayStatus();
}

main().catch(console.error);
