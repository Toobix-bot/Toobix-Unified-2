/**
 * 🌲 TOOBIX SURVIVAL - KORREKTE SURVIVAL-LOGIK
 * 
 * Server: Tooobix.aternos.me:52629
 * 
 * RICHTIGE REIHENFOLGE:
 * 1. 🌲 Holz sammeln (mit Hand möglich) - ZUERST!
 * 2. 🪓 Planks + Sticks craften
 * 3. 🛠️ Werkbank craften
 * 4. 🪓 Holzspitzhacke craften
 * 5. ⛏️ DANN Stein abbauen (braucht Spitzhacke!)
 * 6. 🏠 Haus bauen vor der Nacht
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import type { Bot } from 'mineflayer';

// ═══════════════════════════════════════════════════════════════════
// SERVER CONFIG
// ═══════════════════════════════════════════════════════════════════

const SERVER_HOST = 'Tooobix.aternos.me';
const SERVER_PORT = 52629;

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

interface BotState {
  logs: number;
  planks: number;
  sticks: number;
  cobblestone: number;
  hasCraftingTable: boolean;
  hasWoodenPickaxe: boolean;
  hasStonePickaxe: boolean;
  phase: 'wood' | 'craft_tools' | 'stone' | 'build';
  connected: boolean;
}

const state: BotState = {
  logs: 0,
  planks: 0,
  sticks: 0,
  cobblestone: 0,
  hasCraftingTable: false,
  hasWoodenPickaxe: false,
  hasStonePickaxe: false,
  phase: 'wood',
  connected: false
};

// ═══════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════

function log(msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${msg}`);
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

function updateInventory(bot: Bot) {
  state.logs = countItem(bot, '_log');
  state.planks = countItem(bot, '_planks', 'planks');
  state.sticks = countItem(bot, 'stick');
  state.cobblestone = countItem(bot, 'cobblestone');
  state.hasCraftingTable = countItem(bot, 'crafting_table') > 0;
  state.hasWoodenPickaxe = countItem(bot, 'wooden_pickaxe') > 0;
  state.hasStonePickaxe = countItem(bot, 'stone_pickaxe') > 0;
}

function displayStatus() {
  console.log('\n' + '═'.repeat(50));
  console.log(`🎮 TOOBIX SURVIVAL | Phase: ${state.phase.toUpperCase()}`);
  console.log('─'.repeat(50));
  console.log(`🪵 Logs: ${state.logs} | 📦 Planks: ${state.planks} | 🥢 Sticks: ${state.sticks}`);
  console.log(`🪨 Cobblestone: ${state.cobblestone}`);
  console.log(`🛠️ Werkbank: ${state.hasCraftingTable ? '✅' : '❌'} | 🪓 Holz-Picke: ${state.hasWoodenPickaxe ? '✅' : '❌'} | ⛏️ Stein-Picke: ${state.hasStonePickaxe ? '✅' : '❌'}`);
  console.log('═'.repeat(50) + '\n');
}

// ═══════════════════════════════════════════════════════════════════
// HOLZ SAMMELN (WEITER SUCHEN!)
// ═══════════════════════════════════════════════════════════════════

async function findAndCollectWood(bot: Bot): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  // Suche weiter! 64 Blöcke
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 64
  });
  
  if (!logBlock) {
    log('🔍 Kein Baum in der Nähe - gehe erkunden...');
    
    // Zufällige Richtung laufen
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    const targetX = bot.entity.position.x + Math.cos(angle) * distance;
    const targetZ = bot.entity.position.z + Math.sin(angle) * distance;
    
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetX, bot.entity.position.y, targetZ, 5));
    } catch (e) {
      // Ignoriere Pathfinding-Fehler
    }
    
    await sleep(1000);
    return false;
  }
  
  log(`🌲 Baum gefunden bei ${Math.floor(logBlock.position.x)}, ${Math.floor(logBlock.position.y)}, ${Math.floor(logBlock.position.z)}`);
  
  try {
    // Gehe zum Baum
    await bot.pathfinder.goto(new goals.GoalNear(
      logBlock.position.x, 
      logBlock.position.y, 
      logBlock.position.z, 
      2
    ));
    
    await sleep(500);
    
    // Baue ab (mit Hand geht!)
    await bot.dig(logBlock);
    
    state.logs++;
    log(`🪵 Log abgebaut! (${state.logs} total)`);
    
    await sleep(500);
    return true;
  } catch (e: any) {
    log(`⚠️ Fehler: ${e.message?.substring(0, 40)}`);
    await sleep(1000);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CRAFTING
// ═══════════════════════════════════════════════════════════════════

async function craftPlanks(bot: Bot): Promise<boolean> {
  updateInventory(bot);
  if (state.logs < 1) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  
  // Finde ein Planks-Rezept (oak_planks, birch_planks, etc.)
  const recipes = bot.recipesAll(mcData.itemsByName.oak_planks.id, null, null);
  
  if (recipes.length === 0) {
    // Versuche mit dem Log-Typ den wir haben
    for (const item of bot.inventory.items()) {
      if (item.name.includes('_log')) {
        const plankType = item.name.replace('_log', '_planks');
        const plankItem = mcData.itemsByName[plankType];
        if (plankItem) {
          const r = bot.recipesAll(plankItem.id, null, null);
          if (r.length > 0) {
            try {
              await bot.craft(r[0], 1, null);
              log('📦 Planks gecraftet!');
              updateInventory(bot);
              return true;
            } catch (e) {}
          }
        }
      }
    }
    return false;
  }
  
  try {
    await bot.craft(recipes[0], 1, null);
    log('📦 Planks gecraftet!');
    updateInventory(bot);
    return true;
  } catch (e: any) {
    log(`⚠️ Craft-Fehler: ${e.message?.substring(0, 40)}`);
    return false;
  }
}

async function craftSticks(bot: Bot): Promise<boolean> {
  updateInventory(bot);
  if (state.planks < 2) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const recipes = bot.recipesAll(mcData.itemsByName.stick.id, null, null);
  
  if (recipes.length === 0) return false;
  
  try {
    await bot.craft(recipes[0], 1, null);
    log('🥢 Sticks gecraftet!');
    updateInventory(bot);
    return true;
  } catch (e: any) {
    log(`⚠️ Craft-Fehler: ${e.message?.substring(0, 40)}`);
    return false;
  }
}

async function craftCraftingTable(bot: Bot): Promise<boolean> {
  updateInventory(bot);
  if (state.planks < 4) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const recipes = bot.recipesAll(mcData.itemsByName.crafting_table.id, null, null);
  
  if (recipes.length === 0) return false;
  
  try {
    await bot.craft(recipes[0], 1, null);
    log('🛠️ Werkbank gecraftet!');
    state.hasCraftingTable = true;
    updateInventory(bot);
    return true;
  } catch (e: any) {
    log(`⚠️ Craft-Fehler: ${e.message?.substring(0, 40)}`);
    return false;
  }
}

async function placeCraftingTable(bot: Bot): Promise<any> {
  // Finde Werkbank im Inventar
  const craftingTable = bot.inventory.items().find(i => i.name === 'crafting_table');
  if (!craftingTable) return null;
  
  // Finde einen Block zum Platzieren
  const mcData = require('minecraft-data')(bot.version);
  const groundBlock = bot.findBlock({
    matching: [
      mcData.blocksByName.grass_block?.id,
      mcData.blocksByName.dirt?.id,
      mcData.blocksByName.stone?.id,
      mcData.blocksByName.cobblestone?.id
    ].filter(Boolean),
    maxDistance: 4
  });
  
  if (!groundBlock) {
    log('⚠️ Kein Platz für Werkbank');
    return null;
  }
  
  try {
    await bot.equip(craftingTable, 'hand');
    await bot.placeBlock(groundBlock, new (require('vec3'))(0, 1, 0));
    log('🛠️ Werkbank platziert!');
    await sleep(500);
    
    // Finde die platzierte Werkbank
    const placedTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 5
    });
    
    return placedTable;
  } catch (e: any) {
    log(`⚠️ Platzier-Fehler: ${e.message?.substring(0, 40)}`);
    return null;
  }
}

async function craftWoodenPickaxe(bot: Bot): Promise<boolean> {
  updateInventory(bot);
  if (state.planks < 3 || state.sticks < 2) return false;
  if (!state.hasCraftingTable) return false;
  
  // Platziere Werkbank
  const table = await placeCraftingTable(bot);
  if (!table) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const recipes = bot.recipesAll(mcData.itemsByName.wooden_pickaxe.id, null, table);
  
  if (recipes.length === 0) {
    log('⚠️ Kein Rezept für Holzspitzhacke gefunden');
    return false;
  }
  
  try {
    await bot.craft(recipes[0], 1, table);
    log('🪓 HOLZSPITZHACKE GECRAFTET!');
    state.hasWoodenPickaxe = true;
    updateInventory(bot);
    return true;
  } catch (e: any) {
    log(`⚠️ Craft-Fehler: ${e.message?.substring(0, 40)}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// STEIN ABBAUEN (NUR MIT SPITZHACKE!)
// ═══════════════════════════════════════════════════════════════════

async function mineStone(bot: Bot): Promise<boolean> {
  if (!state.hasWoodenPickaxe && !state.hasStonePickaxe) {
    log('❌ Keine Spitzhacke! Kann keinen Stein abbauen!');
    return false;
  }
  
  const mcData = require('minecraft-data')(bot.version);
  
  // Equip pickaxe
  const pickaxe = bot.inventory.items().find(i => 
    i.name === 'wooden_pickaxe' || i.name === 'stone_pickaxe'
  );
  if (pickaxe) {
    await bot.equip(pickaxe, 'hand');
  }
  
  const stoneBlock = bot.findBlock({
    matching: [
      mcData.blocksByName.stone?.id,
      mcData.blocksByName.cobblestone?.id,
      mcData.blocksByName.andesite?.id,
      mcData.blocksByName.diorite?.id,
      mcData.blocksByName.granite?.id
    ].filter(Boolean),
    maxDistance: 32
  });
  
  if (!stoneBlock) {
    log('🔍 Kein Stein in der Nähe...');
    
    // Grabe nach unten um Stein zu finden
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (below && (below.name === 'dirt' || below.name === 'grass_block')) {
      await bot.dig(below);
      log('🕳️ Grabe nach unten...');
    }
    
    await sleep(1000);
    return false;
  }
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(
      stoneBlock.position.x,
      stoneBlock.position.y,
      stoneBlock.position.z,
      2
    ));
    
    await sleep(300);
    await bot.dig(stoneBlock);
    
    state.cobblestone++;
    log(`🪨 Cobblestone! (${state.cobblestone} total)`);
    
    await sleep(500);
    return true;
  } catch (e: any) {
    log(`⚠️ Fehler: ${e.message?.substring(0, 40)}`);
    await sleep(1000);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SURVIVAL LOOP
// ═══════════════════════════════════════════════════════════════════

async function survivalLoop(bot: Bot): Promise<void> {
  log('🎮 Starte Survival-Loop...');
  
  while (state.connected) {
    updateInventory(bot);
    displayStatus();
    
    try {
      // PHASE 1: HOLZ SAMMELN
      if (state.phase === 'wood') {
        log('📌 Phase: HOLZ SAMMELN');
        
        // Brauche mindestens 4 Logs für Tools
        if (state.logs < 4) {
          await findAndCollectWood(bot);
        } else {
          log('✅ Genug Holz! Wechsle zu Crafting...');
          state.phase = 'craft_tools';
        }
      }
      
      // PHASE 2: WERKZEUGE CRAFTEN
      else if (state.phase === 'craft_tools') {
        log('📌 Phase: WERKZEUGE CRAFTEN');
        
        // Schritt 1: Planks
        if (state.planks < 8) {
          await craftPlanks(bot);
          await sleep(500);
        }
        
        // Schritt 2: Sticks
        if (state.planks >= 2 && state.sticks < 4) {
          await craftSticks(bot);
          await sleep(500);
        }
        
        // Schritt 3: Werkbank
        if (!state.hasCraftingTable && state.planks >= 4) {
          await craftCraftingTable(bot);
          await sleep(500);
        }
        
        // Schritt 4: Holzspitzhacke
        if (state.hasCraftingTable && !state.hasWoodenPickaxe && state.planks >= 3 && state.sticks >= 2) {
          await craftWoodenPickaxe(bot);
          await sleep(500);
        }
        
        // Check ob fertig
        if (state.hasWoodenPickaxe) {
          log('✅ Holzspitzhacke fertig! Wechsle zu Stein...');
          state.phase = 'stone';
        } else if (state.logs < 2 && state.planks < 3) {
          log('⚠️ Nicht genug Material, zurück zu Holz...');
          state.phase = 'wood';
        }
      }
      
      // PHASE 3: STEIN ABBAUEN
      else if (state.phase === 'stone') {
        log('📌 Phase: STEIN ABBAUEN');
        
        if (state.cobblestone < 20) {
          await mineStone(bot);
        } else {
          log('✅ Genug Stein! Wechsle zu Bauen...');
          state.phase = 'build';
        }
      }
      
      // PHASE 4: BAUEN
      else if (state.phase === 'build') {
        log('📌 Phase: BAUEN (TODO)');
        await sleep(5000);
      }
      
    } catch (e: any) {
      log(`⚠️ Loop-Fehler: ${e.message?.substring(0, 50)}`);
    }
    
    await sleep(1000);
  }
  
  log('🛑 Survival-Loop beendet');
}

// ═══════════════════════════════════════════════════════════════════
// BOT STARTEN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🌲 TOOBIX SURVIVAL - KORREKTE LOGIK 🌲                      ║
║                                                                ║
║   Server: ${SERVER_HOST}:${SERVER_PORT}                       ║
║                                                                ║
║   PHASEN:                                                      ║
║   1. 🌲 Holz sammeln (mit Hand)                               ║
║   2. 🛠️ Werkzeuge craften (Planks → Sticks → Werkbank → Picke)║
║   3. ⛏️ Stein abbauen (mit Holzspitzhacke!)                   ║
║   4. 🏠 Haus bauen                                            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

  log('🔌 Verbinde mit Server...');
  
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'Toobix_Survivor',
    version: '1.20.1',
    auth: 'offline',
    checkTimeoutInterval: 120000
  });
  
  bot.loadPlugin(pathfinder);
  
  bot.once('spawn', () => {
    state.connected = true;
    log('✅ Spawned!');
    
    const mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot);
    movements.canDig = true;
    bot.pathfinder.setMovements(movements);
    
    // Starte Survival
    setTimeout(() => survivalLoop(bot), 2000);
  });
  
  bot.on('error', (err) => {
    log(`❌ Error: ${err.message?.substring(0, 40)}`);
  });
  
  bot.on('kicked', (reason) => {
    log(`👢 Kicked: ${JSON.stringify(reason).substring(0, 40)}`);
    state.connected = false;
  });
  
  bot.on('end', () => {
    log('🔌 Disconnected');
    state.connected = false;
  });
}

// Error Handler
process.on('uncaughtException', (err) => {
  console.log(`⚠️ Uncaught: ${err.message?.substring(0, 50)}`);
});

main().catch(console.error);
