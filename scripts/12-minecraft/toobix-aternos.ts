/**
 * 🌐 TOOBIX EMPIRE - ATERNOS SERVER
 * 
 * Externer Server = Keine lokalen Timeout-Probleme!
 * 
 * Server: Tooobix.aternos.me
 * Version: 1.20.1 (Paper)
 * 
 * ABLAUF TAG 1:
 * 1. ALLE sammeln Holz (64+ total)
 * 2. Alpha craftet Werkbank + Äxte
 * 3. Woody baut 5x5 Haus
 * 4. Miner gräbt Keller
 * 5. Nachts: Alle minen Stein im Keller
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
const SERVER_PORT = 25565;

// Basis-Position (Spawn-Bereich)
const BASE_X = 0;
const BASE_Z = 0;

// Spawn-Verzögerung zwischen Bots (ms)
const SPAWN_DELAY = 3000;

// ═══════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════

type Phase = 'CONNECTING' | 'WOOD_COLLECTION' | 'CRAFTING' | 'HOUSE_BUILDING' | 'CELLAR_DIGGING' | 'NIGHT_MINING';

interface BotState {
  name: string;
  emoji: string;
  role: string;
  bot: Bot | null;
  connected: boolean;
  logsCollected: number;
  working: boolean;
  lastError: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// GLOBALER STATE
// ═══════════════════════════════════════════════════════════════════

const bots: Map<string, BotState> = new Map();

const shared = {
  phase: 'CONNECTING' as Phase,
  totalWood: 0,
  totalPlanks: 0,
  totalStone: 0,
  craftingTablePlaced: false,
  craftingTablePos: null as { x: number; y: number; z: number } | null,
  houseBuilt: false,
  cellarDug: false,
  baseY: 64
};

// 5 Bot-Rollen
const ROLES = [
  { name: 'Alpha', emoji: '🦁', role: 'leader' },
  { name: 'Woody', emoji: '🪓', role: 'builder' },
  { name: 'Miner', emoji: '⛏️', role: 'miner' },
  { name: 'Guardian', emoji: '⚔️', role: 'guard' },
  { name: 'Ranger', emoji: '🌾', role: 'gatherer' }
];

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
// CRAFTING
// ═══════════════════════════════════════════════════════════════════

async function craftPlanks(bot: Bot, count: number = 4): Promise<boolean> {
  const logs = countItem(bot, 'log');
  if (logs === 0) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  
  for (const plankType of ['oak_planks', 'birch_planks', 'spruce_planks', 'dark_oak_planks', 'acacia_planks', 'jungle_planks']) {
    const item = mcData.itemsByName[plankType];
    if (!item) continue;
    
    const recipes = bot.recipesFor(item.id, null, 1, null);
    if (recipes.length > 0) {
      try {
        await bot.craft(recipes[0], Math.ceil(count / 4), null);
        return true;
      } catch (e) {}
    }
  }
  return false;
}

async function craftSticks(bot: Bot): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const item = mcData.itemsByName.stick;
  if (!item) return false;
  
  const recipes = bot.recipesFor(item.id, null, 1, null);
  if (recipes.length > 0) {
    try {
      await bot.craft(recipes[0], 2, null);
      return true;
    } catch (e) {}
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// HOLZ SAMMELN
// ═══════════════════════════════════════════════════════════════════

async function chopTree(bot: Bot, state: BotState): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 64
  });
  
  if (!logBlock) {
    return false;
  }
  
  try {
    // Axt equippen falls vorhanden
    const axe = findItem(bot, 'axe');
    if (axe) await bot.equip(axe, 'hand');
    
    // Mit collectBlock sammeln
    await (bot as any).collectBlock.collect(logBlock);
    state.logsCollected++;
    shared.totalWood++;
    log(`${state.emoji} ${state.name}`, `🪵 Log! (${shared.totalWood} total)`);
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
  
  log(`${state.emoji} ${state.name}`, `Work Loop gestartet!`);
  
  while (state.connected) {
    try {
      state.working = true;
      
      // Phase: Holz sammeln
      if (shared.phase === 'WOOD_COLLECTION' || shared.phase === 'CONNECTING') {
        if (shared.totalWood < 64) {
          await chopTree(bot, state);
        }
        
        // Phase-Übergang
        if (shared.totalWood >= 64 && shared.phase !== 'CRAFTING') {
          shared.phase = 'CRAFTING';
          log('🏰 EMPIRE', `✅ ${shared.totalWood} Holz gesammelt! → CRAFTING PHASE`);
        }
      }
      
      // Phase: Crafting (nur Alpha)
      else if (shared.phase === 'CRAFTING' && state.role === 'leader') {
        await doCrafting(bot, state);
      }
      
      // Phase: Haus bauen (nur Woody)
      else if (shared.phase === 'HOUSE_BUILDING') {
        if (state.role === 'builder' && !shared.houseBuilt) {
          await buildHouse(bot, state);
        } else {
          // Andere sammeln weiter Holz
          await chopTree(bot, state);
        }
      }
      
      // Phase: Keller graben (nur Miner)
      else if (shared.phase === 'CELLAR_DIGGING') {
        if (state.role === 'miner' && !shared.cellarDug) {
          await digCellar(bot, state);
        } else {
          await sleep(2000);
        }
      }
      
      // Phase: Nacht-Mining (alle)
      else if (shared.phase === 'NIGHT_MINING') {
        await mineStone(bot, state);
      }
      
      state.working = false;
      await sleep(500);
      
    } catch (e: any) {
      state.lastError = e.message;
      await sleep(2000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// CRAFTING PHASE
// ═══════════════════════════════════════════════════════════════════

async function doCrafting(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // 1. Planks craften
  if (countItem(bot, 'planks') < 20) {
    await craftPlanks(bot, 20);
    log(`${state.emoji} ${state.name}`, `📦 Planks gecraftet!`);
  }
  
  // 2. Werkbank craften
  if (countItem(bot, 'crafting_table') === 0) {
    const craftingTable = mcData.itemsByName.crafting_table;
    if (craftingTable) {
      const recipes = bot.recipesFor(craftingTable.id, null, 1, null);
      if (recipes.length > 0) {
        try {
          await bot.craft(recipes[0], 1, null);
          log(`${state.emoji} ${state.name}`, `🔧 Werkbank gecraftet!`);
        } catch (e) {}
      }
    }
  }
  
  // 3. Werkbank platzieren
  if (!shared.craftingTablePlaced && countItem(bot, 'crafting_table') > 0) {
    try {
      const table = findItem(bot, 'crafting_table');
      if (table) {
        await bot.equip(table, 'hand');
        
        // Boden finden
        const groundBlock = bot.blockAt(bot.entity.position.offset(1, -1, 0));
        if (groundBlock && groundBlock.name !== 'air') {
          const Vec3 = require('vec3').Vec3;
          await bot.placeBlock(groundBlock, new Vec3(0, 1, 0));
          shared.craftingTablePlaced = true;
          shared.craftingTablePos = {
            x: groundBlock.position.x + 1,
            y: groundBlock.position.y + 1,
            z: groundBlock.position.z
          };
          log(`${state.emoji} ${state.name}`, `📍 Werkbank platziert!`);
        }
      }
    } catch (e) {}
  }
  
  // 4. Sticks craften
  if (shared.craftingTablePlaced && countItem(bot, 'stick') < 8) {
    await craftSticks(bot);
  }
  
  // 5. Holzäxte craften
  if (shared.craftingTablePlaced && shared.craftingTablePos) {
    const tableBlock = bot.blockAt(bot.entity.position.clone().set(
      shared.craftingTablePos.x,
      shared.craftingTablePos.y,
      shared.craftingTablePos.z
    ));
    
    if (tableBlock && tableBlock.name === 'crafting_table') {
      // Axt für jeden Bot
      const woodenAxe = mcData.itemsByName.wooden_axe;
      if (woodenAxe && countItem(bot, 'wooden_axe') < 5) {
        const recipes = bot.recipesFor(woodenAxe.id, null, 1, tableBlock);
        if (recipes.length > 0) {
          try {
            await bot.craft(recipes[0], 5, tableBlock);
            log(`${state.emoji} ${state.name}`, `🪓 5 Äxte gecraftet!`);
          } catch (e) {}
        }
      }
    }
  }
  
  // Phase-Übergang
  if (shared.craftingTablePlaced && countItem(bot, 'wooden_axe') >= 1) {
    shared.phase = 'HOUSE_BUILDING';
    log('🏰 EMPIRE', `✅ Crafting fertig! → HOUSE BUILDING`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// HAUS BAUEN
// ═══════════════════════════════════════════════════════════════════

async function buildHouse(bot: Bot, state: BotState): Promise<void> {
  log(`${state.emoji} ${state.name}`, `🏠 Beginne Hausbau...`);
  
  const mcData = require('minecraft-data')(bot.version);
  const Vec3 = require('vec3').Vec3;
  
  // Zuerst genug Planks haben
  while (countItem(bot, 'planks') < 100) {
    await craftPlanks(bot, 20);
    await sleep(500);
  }
  
  log(`${state.emoji} ${state.name}`, `📦 ${countItem(bot, 'planks')} Planks bereit!`);
  
  // Haus-Position (bei Spawn)
  const houseX = BASE_X;
  const houseZ = BASE_Z;
  const houseY = shared.baseY || 64;
  
  // Gehe zur Baustelle
  const goal = new goals.GoalNear(houseX, houseY, houseZ, 3);
  try {
    await bot.pathfinder.goto(goal);
  } catch (e) {}
  
  // Aktualisiere baseY
  shared.baseY = Math.floor(bot.entity.position.y);
  
  // Boden bauen (5x5)
  log(`${state.emoji} ${state.name}`, `🏗️ Baue Boden...`);
  const plankItem = findItem(bot, 'planks');
  if (plankItem) {
    await bot.equip(plankItem, 'hand');
  }
  
  // Einfacher Boden
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      try {
        const pos = new Vec3(houseX + dx, shared.baseY - 1, houseZ + dz);
        const block = bot.blockAt(pos);
        if (block && block.name === 'air') {
          const belowBlock = bot.blockAt(pos.offset(0, -1, 0));
          if (belowBlock && belowBlock.name !== 'air') {
            await bot.placeBlock(belowBlock, new Vec3(0, 1, 0));
            await sleep(100);
          }
        }
      } catch (e) {}
    }
  }
  
  // Wände bauen (3 hoch)
  log(`${state.emoji} ${state.name}`, `🧱 Baue Wände...`);
  for (let height = 0; height < 3; height++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        // Nur Rand
        if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
          // Tür-Lücke
          if (dx === 0 && dz === -2 && height < 2) continue;
          
          try {
            const pos = new Vec3(houseX + dx, shared.baseY + height, houseZ + dz);
            const block = bot.blockAt(pos);
            if (block && block.name === 'air') {
              const belowBlock = bot.blockAt(pos.offset(0, -1, 0));
              if (belowBlock && belowBlock.name !== 'air') {
                const plank = findItem(bot, 'planks');
                if (plank) {
                  await bot.equip(plank, 'hand');
                  await bot.placeBlock(belowBlock, new Vec3(0, 1, 0));
                  await sleep(100);
                }
              }
            }
          } catch (e) {}
        }
      }
    }
  }
  
  // Dach
  log(`${state.emoji} ${state.name}`, `🏠 Baue Dach...`);
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      try {
        const pos = new Vec3(houseX + dx, shared.baseY + 3, houseZ + dz);
        const block = bot.blockAt(pos);
        if (block && block.name === 'air') {
          const belowBlock = bot.blockAt(pos.offset(0, -1, 0));
          if (belowBlock && belowBlock.name !== 'air') {
            const plank = findItem(bot, 'planks');
            if (plank) {
              await bot.equip(plank, 'hand');
              await bot.placeBlock(belowBlock, new Vec3(0, 1, 0));
              await sleep(100);
            }
          }
        }
      } catch (e) {}
    }
  }
  
  shared.houseBuilt = true;
  shared.phase = 'CELLAR_DIGGING';
  log(`${state.emoji} ${state.name}`, `🏠✅ Haus fertig! → CELLAR DIGGING`);
}

// ═══════════════════════════════════════════════════════════════════
// KELLER GRABEN
// ═══════════════════════════════════════════════════════════════════

async function digCellar(bot: Bot, state: BotState): Promise<void> {
  log(`${state.emoji} ${state.name}`, `⛏️ Grabe Keller...`);
  
  const Vec3 = require('vec3').Vec3;
  
  // Pickaxe craften falls nötig
  if (countItem(bot, 'pickaxe') === 0) {
    // Holzpickaxe craften
    const mcData = require('minecraft-data')(bot.version);
    const pickaxe = mcData.itemsByName.wooden_pickaxe;
    
    // Zuerst Planks und Sticks
    await craftPlanks(bot, 8);
    await craftSticks(bot);
    
    if (pickaxe && shared.craftingTablePos) {
      const tableBlock = bot.blockAt(new Vec3(
        shared.craftingTablePos.x,
        shared.craftingTablePos.y,
        shared.craftingTablePos.z
      ));
      if (tableBlock) {
        const recipes = bot.recipesFor(pickaxe.id, null, 1, tableBlock);
        if (recipes.length > 0) {
          try {
            await bot.craft(recipes[0], 1, tableBlock);
            log(`${state.emoji} ${state.name}`, `⛏️ Pickaxe gecraftet!`);
          } catch (e) {}
        }
      }
    }
  }
  
  // Pickaxe equippen
  const pickaxe = findItem(bot, 'pickaxe');
  if (pickaxe) await bot.equip(pickaxe, 'hand');
  
  // Gehe zur Haus-Mitte
  const centerX = BASE_X;
  const centerZ = BASE_Z;
  
  const goal = new goals.GoalNear(centerX, shared.baseY, centerZ, 2);
  try {
    await bot.pathfinder.goto(goal);
  } catch (e) {}
  
  // Grabe 3x3 Treppe nach unten (5 Blöcke tief)
  for (let depth = 0; depth < 5; depth++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        try {
          const pos = new Vec3(centerX + dx, shared.baseY - 1 - depth, centerZ + dz);
          const block = bot.blockAt(pos);
          if (block && block.name !== 'air') {
            await bot.dig(block);
            shared.totalStone++;
            await sleep(200);
          }
        } catch (e) {}
      }
    }
  }
  
  shared.cellarDug = true;
  shared.phase = 'NIGHT_MINING';
  log(`${state.emoji} ${state.name}`, `🕳️✅ Keller fertig! → NIGHT MINING`);
}

// ═══════════════════════════════════════════════════════════════════
// STEIN MINEN
// ═══════════════════════════════════════════════════════════════════

async function mineStone(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Pickaxe equippen
  const pickaxe = findItem(bot, 'pickaxe');
  if (pickaxe) await bot.equip(pickaxe, 'hand');
  
  // Stein finden
  const stoneBlock = bot.findBlock({
    matching: [
      mcData.blocksByName.stone?.id,
      mcData.blocksByName.cobblestone?.id,
      mcData.blocksByName.andesite?.id,
      mcData.blocksByName.diorite?.id,
      mcData.blocksByName.granite?.id
    ].filter(Boolean),
    maxDistance: 10
  });
  
  if (stoneBlock) {
    try {
      await bot.dig(stoneBlock);
      shared.totalStone++;
      log(`${state.emoji} ${state.name}`, `🪨 Stein! (${shared.totalStone} total)`);
    } catch (e) {}
  }
  
  await sleep(500);
}

// ═══════════════════════════════════════════════════════════════════
// BOT ERSTELLEN
// ═══════════════════════════════════════════════════════════════════

async function createBot(role: typeof ROLES[0]): Promise<BotState> {
  const state: BotState = {
    name: role.name,
    emoji: role.emoji,
    role: role.role,
    bot: null,
    connected: false,
    logsCollected: 0,
    working: false,
    lastError: null
  };
  
  bots.set(role.name, state);
  
  return new Promise((resolve) => {
    log(`${role.emoji} ${role.name}`, `Verbinde zu ${SERVER_HOST}...`);
    
    const bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: `Toobix_${role.name}`,
      version: '1.20.1',
      auth: 'offline'  // Wichtig für Cracked Server!
    });
    
    state.bot = bot;
    
    // Plugins laden
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);
    
    bot.once('spawn', () => {
      log(`${role.emoji} ${role.name}`, `✅ Gespawnt auf Aternos!`);
      state.connected = true;
      
      // Pathfinder setup
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      
      // Speichere BaseY
      if (!shared.baseY || shared.baseY === 64) {
        shared.baseY = Math.floor(bot.entity.position.y);
      }
      
      // Work Loop starten
      workLoop(state);
      
      resolve(state);
    });
    
    bot.on('error', (err) => {
      log(`${role.emoji} ${role.name}`, `❌ Error: ${err.message}`);
      state.lastError = err.message;
    });
    
    bot.on('kicked', (reason) => {
      log(`${role.emoji} ${role.name}`, `👢 Kicked: ${reason}`);
      state.connected = false;
    });
    
    bot.on('end', () => {
      log(`${role.emoji} ${role.name}`, `🔌 Disconnected`);
      state.connected = false;
    });
    
    // Timeout nach 60 Sekunden
    setTimeout(() => {
      if (!state.connected) {
        log(`${role.emoji} ${role.name}`, `⏰ Timeout - Server nicht erreichbar?`);
        resolve(state);
      }
    }, 60000);
  });
}

// ═══════════════════════════════════════════════════════════════════
// STATUS DISPLAY
// ═══════════════════════════════════════════════════════════════════

function displayStatus() {
  console.log('\n' + '═'.repeat(70));
  console.log(`🌐 TOOBIX EMPIRE - ATERNOS SERVER`);
  console.log(`📍 ${SERVER_HOST}`);
  console.log('═'.repeat(70));
  console.log(`📍 Phase: ${shared.phase}`);
  console.log(`🪵 Holz: ${shared.totalWood} | 📦 Planks: ${shared.totalPlanks} | 🪨 Stein: ${shared.totalStone}`);
  console.log(`🔧 Werkbank: ${shared.craftingTablePlaced ? '✅' : '❌'} | 🏠 Haus: ${shared.houseBuilt ? '✅' : '❌'} | 🕳️ Keller: ${shared.cellarDug ? '✅' : '❌'}`);
  console.log('\nBOTS:');
  
  for (const state of bots.values()) {
    const status = state.connected ? '✅' : '❌';
    console.log(`   ${state.emoji} ${state.name.padEnd(10)} ${status}  - Logs: ${state.logsCollected}`);
  }
  
  console.log('═'.repeat(70) + '\n');
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║       🌐 TOOBIX EMPIRE - ATERNOS SERVER 🌐                         ║
║                                                                    ║
║  Server: ${SERVER_HOST.padEnd(45)}║
║  Version: 1.20.1 (Paper)                                          ║
║                                                                    ║
║  ⚠️  WICHTIG:                                                      ║
║  1. Server muss auf Aternos gestartet sein!                       ║
║  2. Cracked Mode muss AN sein (Online-Mode: OFF)                  ║
║  3. Schwierigkeit: Peaceful empfohlen                             ║
║                                                                    ║
║  Starte 5 Bots in 5 Sekunden...                                   ║
╚════════════════════════════════════════════════════════════════════╝
`);

  await sleep(5000);
  
  // Spawne Bots
  for (const role of ROLES) {
    console.log(`\nSpawning ${role.emoji} ${role.name}...`);
    await createBot(role);
    await sleep(SPAWN_DELAY);
  }
  
  console.log(`\n✅ ${getConnectedCount()}/${ROLES.length} Bots verbunden!\n`);
  
  // Phase starten
  if (getConnectedCount() > 0) {
    shared.phase = 'WOOD_COLLECTION';
    log('🏰 EMPIRE', '🪵 PHASE 1: Holz sammeln!');
  }
  
  // Status alle 15 Sekunden
  setInterval(displayStatus, 15000);
  displayStatus();
}

main().catch(console.error);
