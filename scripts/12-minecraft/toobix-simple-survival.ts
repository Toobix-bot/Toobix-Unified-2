/**
 * 🌲 TOOBIX SIMPLE SURVIVAL
 * 
 * Server: Tooobix.aternos.me:52629
 * 
 * Vereinfacht - benutzt collectBlock Plugin
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import type { Bot } from 'mineflayer';

const SERVER_HOST = 'Tooobix.aternos.me';
const SERVER_PORT = 52629;

let connected = false;
let logs = 0;
let planks = 0;
let phase = 'wood';

function log(msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${msg}`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function countItem(bot: Bot, name: string): number {
  let count = 0;
  for (const item of bot.inventory.items()) {
    if (item.name.includes(name)) count += item.count;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════════
// HOLZ SAMMELN
// ═══════════════════════════════════════════════════════════════════

async function collectWood(bot: Bot): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 64
  });
  
  if (!logBlock) {
    log('🔍 Kein Baum gefunden - erkunde...');
    
    // Gehe in zufällige Richtung
    try {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15;
      const x = bot.entity.position.x + Math.cos(angle) * dist;
      const z = bot.entity.position.z + Math.sin(angle) * dist;
      bot.pathfinder.setGoal(new goals.GoalNear(x, bot.entity.position.y, z, 3));
      await sleep(3000);
      bot.pathfinder.setGoal(null);
    } catch (e) {}
    return false;
  }
  
  log(`🌲 Baum bei ${Math.floor(logBlock.position.x)}, ${Math.floor(logBlock.position.y)}, ${Math.floor(logBlock.position.z)}`);
  
  try {
    await (bot as any).collectBlock.collect(logBlock, { timeout: 15000 });
    logs++;
    log(`🪵 Log gesammelt! (${logs} total)`);
    await sleep(500);
    return true;
  } catch (e: any) {
    log(`⚠️ Collect-Fehler: ${e.message?.substring(0, 40)}`);
    await sleep(1000);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CRAFTING
// ═══════════════════════════════════════════════════════════════════

async function craftPlanks(bot: Bot): Promise<boolean> {
  const logsInv = countItem(bot, '_log');
  if (logsInv < 1) {
    log('❌ Keine Logs zum Craften');
    return false;
  }
  
  const mcData = require('minecraft-data')(bot.version);
  
  // Finde das passende Planks-Rezept basierend auf Log-Typ
  for (const item of bot.inventory.items()) {
    if (item.name.includes('_log')) {
      const plankType = item.name.replace('_log', '_planks');
      const plankItem = mcData.itemsByName[plankType];
      if (plankItem) {
        const recipes = bot.recipesAll(plankItem.id, null, null);
        if (recipes.length > 0) {
          try {
            await bot.craft(recipes[0], 1, null);
            planks += 4;
            log(`📦 4 Planks gecraftet! (${planks} total)`);
            return true;
          } catch (e: any) {
            log(`⚠️ Craft-Fehler: ${e.message?.substring(0, 30)}`);
          }
        }
      }
    }
  }
  return false;
}

async function craftSticks(bot: Bot): Promise<boolean> {
  const planksInv = countItem(bot, 'planks');
  if (planksInv < 2) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const recipes = bot.recipesAll(mcData.itemsByName.stick.id, null, null);
  
  if (recipes.length > 0) {
    try {
      await bot.craft(recipes[0], 1, null);
      log('🥢 4 Sticks gecraftet!');
      return true;
    } catch (e) {}
  }
  return false;
}

async function craftCraftingTable(bot: Bot): Promise<boolean> {
  const planksInv = countItem(bot, 'planks');
  if (planksInv < 4) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const recipes = bot.recipesAll(mcData.itemsByName.crafting_table.id, null, null);
  
  if (recipes.length > 0) {
    try {
      await bot.craft(recipes[0], 1, null);
      log('🛠️ Werkbank gecraftet!');
      return true;
    } catch (e) {}
  }
  return false;
}

async function craftWoodenPickaxe(bot: Bot): Promise<boolean> {
  // Braucht Werkbank
  const table = countItem(bot, 'crafting_table');
  if (table < 1) return false;
  
  const sticksInv = countItem(bot, 'stick');
  const planksInv = countItem(bot, 'planks');
  if (sticksInv < 2 || planksInv < 3) return false;
  
  // Platziere Werkbank
  const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
  if (!tableItem) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const Vec3 = require('vec3');
  
  // Finde Boden-Block
  const ground = bot.findBlock({
    matching: [
      mcData.blocksByName.grass_block?.id,
      mcData.blocksByName.dirt?.id,
      mcData.blocksByName.stone?.id
    ].filter(Boolean),
    maxDistance: 3
  });
  
  if (!ground) {
    log('⚠️ Kein Platz für Werkbank');
    return false;
  }
  
  try {
    await bot.equip(tableItem, 'hand');
    await bot.placeBlock(ground, new Vec3(0, 1, 0));
    log('🛠️ Werkbank platziert!');
    await sleep(500);
    
    // Finde platzierte Werkbank
    const placedTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 4
    });
    
    if (!placedTable) return false;
    
    // Crafte Holzspitzhacke
    const recipes = bot.recipesAll(mcData.itemsByName.wooden_pickaxe.id, null, placedTable);
    if (recipes.length > 0) {
      await bot.craft(recipes[0], 1, placedTable);
      log('🪓 HOLZSPITZHACKE GECRAFTET!');
      return true;
    }
  } catch (e: any) {
    log(`⚠️ Fehler: ${e.message?.substring(0, 30)}`);
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// STEIN ABBAUEN
// ═══════════════════════════════════════════════════════════════════

async function mineStone(bot: Bot): Promise<boolean> {
  // Equip Pickaxe
  const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (!pickaxe) {
    log('❌ Keine Spitzhacke!');
    return false;
  }
  
  await bot.equip(pickaxe, 'hand');
  
  const mcData = require('minecraft-data')(bot.version);
  const stoneBlock = bot.findBlock({
    matching: [
      mcData.blocksByName.stone?.id,
      mcData.blocksByName.cobblestone?.id
    ].filter(Boolean),
    maxDistance: 32
  });
  
  if (!stoneBlock) {
    log('🔍 Kein Stein gefunden...');
    return false;
  }
  
  try {
    await (bot as any).collectBlock.collect(stoneBlock, { timeout: 15000 });
    log('🪨 Cobblestone gesammelt!');
    return true;
  } catch (e: any) {
    log(`⚠️ Fehler: ${e.message?.substring(0, 30)}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════

async function survivalLoop(bot: Bot): Promise<void> {
  log('🎮 Starte Survival...');
  
  while (connected) {
    const logsInv = countItem(bot, '_log');
    const planksInv = countItem(bot, 'planks');
    const sticksInv = countItem(bot, 'stick');
    const hasTable = countItem(bot, 'crafting_table') > 0;
    const hasPickaxe = countItem(bot, 'pickaxe') > 0;
    const cobble = countItem(bot, 'cobblestone');
    
    console.log(`\n📊 Logs: ${logsInv} | Planks: ${planksInv} | Sticks: ${sticksInv} | Table: ${hasTable} | Pickaxe: ${hasPickaxe} | Cobble: ${cobble}`);
    
    try {
      // PHASE 1: Holz sammeln (brauche 4 Logs)
      if (logsInv < 4 && !hasPickaxe) {
        log('📌 Phase: Holz sammeln...');
        await collectWood(bot);
        await sleep(500);
        continue;
      }
      
      // PHASE 2: Planks craften
      if (logsInv >= 1 && planksInv < 8 && !hasPickaxe) {
        log('📌 Phase: Planks craften...');
        await craftPlanks(bot);
        await sleep(500);
        continue;
      }
      
      // PHASE 3: Sticks craften
      if (planksInv >= 2 && sticksInv < 4 && !hasPickaxe) {
        log('📌 Phase: Sticks craften...');
        await craftSticks(bot);
        await sleep(500);
        continue;
      }
      
      // PHASE 4: Werkbank craften
      if (planksInv >= 4 && !hasTable && !hasPickaxe) {
        log('📌 Phase: Werkbank craften...');
        await craftCraftingTable(bot);
        await sleep(500);
        continue;
      }
      
      // PHASE 5: Holzspitzhacke craften
      if (hasTable && planksInv >= 3 && sticksInv >= 2 && !hasPickaxe) {
        log('📌 Phase: Holzspitzhacke craften...');
        await craftWoodenPickaxe(bot);
        await sleep(500);
        continue;
      }
      
      // PHASE 6: Stein abbauen
      if (hasPickaxe) {
        log('📌 Phase: Stein abbauen...');
        await mineStone(bot);
        await sleep(500);
      }
      
    } catch (e: any) {
      log(`⚠️ Fehler: ${e.message?.substring(0, 40)}`);
    }
    
    await sleep(1000);
  }
}

// ═══════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║  🌲 TOOBIX SIMPLE SURVIVAL 🌲                    ║
║  Server: ${SERVER_HOST}:${SERVER_PORT}                    ║
╚══════════════════════════════════════════════════╝
`);

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'Toobix_Survivor',
    version: '1.20.1',
    auth: 'offline',
    checkTimeoutInterval: 120000
  });
  
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);
  
  bot.once('spawn', () => {
    connected = true;
    log('✅ Spawned!');
    
    const mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot);
    movements.canDig = true;
    bot.pathfinder.setMovements(movements);
    
    setTimeout(() => survivalLoop(bot), 2000);
  });
  
  bot.on('error', (err) => log(`❌ ${err.message?.substring(0, 40)}`));
  bot.on('kicked', (reason) => { log(`👢 Kicked`); connected = false; });
  bot.on('end', () => { log('🔌 Disconnected'); connected = false; });
}

process.on('uncaughtException', (e) => console.log(`⚠️ ${e.message?.substring(0, 50)}`));
main().catch(console.error);
