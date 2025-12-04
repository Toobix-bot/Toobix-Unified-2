/**
 * 🏰 TOOBIX EMPIRE V5 - PHASED COLONY SYSTEM
 * 
 * PHASE 1: Erste Bäume (ALLE)
 * - Jeder fällt 1 Baum
 * - Alpha baut Werkbank + Truhe bei 0/0
 * - Alle legen Holz in Truhe
 * - Alle craften Holzaxt + Holzspitzhacke
 * - Jeder fällt 2 weitere Bäume → Truhe
 * 
 * PHASE 2: Spezialisierung
 * - Alpha: Koordiniert, craftet, hilft
 * - Woody: 7x7 Hütte mit Tür bauen
 * - Miner: Höhle/Keller graben, Stein/Kohle
 * - Guardian: Tiere jagen, Schwert, Fackeln, Schutz
 * - Ranger: Weizen/Samen, Beet am Wasser, Tierzucht
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import type { Bot } from 'mineflayer';
import type { Block } from 'prismarine-block';
import type { Item } from 'prismarine-item';
import type { Vec3 } from 'vec3';

// ═══════════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const SERVER_HOST = 'localhost';
const SERVER_PORT = 25565;
const STATUS_PORT = 8766;
const BASE_POS = { x: 0, y: 64, z: 0 }; // Basis-Position (Y wird angepasst)
const SPAWN_DELAY = 6000;

// ═══════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════

type Phase = 'PHASE_1_FIRST_TREES' | 'PHASE_1_CRAFT_STATION' | 'PHASE_1_TOOLS' | 'PHASE_1_MORE_TREES' | 'PHASE_2_SPECIALIZE';
type RoleType = 'leader' | 'woodcutter' | 'miner' | 'guardian' | 'ranger';

interface EmpireRole {
  name: string;
  emoji: string;
  title: string;
  type: RoleType;
}

interface BotState {
  name: string;
  role: EmpireRole;
  bot: Bot | null;
  connected: boolean;
  phase: Phase;
  subTask: string;
  treesChopped: number;
  logsCollected: number;
  hasAxe: boolean;
  hasPickaxe: boolean;
  hasSword: boolean;
  position: { x: number; y: number; z: number } | null;
  health: number;
  food: number;
}

interface SharedState {
  phase: Phase;
  craftingTablePos: { x: number; y: number; z: number } | null;
  chestPos: { x: number; y: number; z: number } | null;
  hutCorner: { x: number; y: number; z: number } | null;
  mineEntrance: { x: number; y: number; z: number } | null;
  waterPos: { x: number; y: number; z: number } | null;
  totalWood: number;
  totalStone: number;
  totalCoal: number;
  totalFood: number;
  botsReady: Set<string>;
  hutBuilt: boolean;
  furnaceBuilt: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// ROLLEN DEFINITION
// ═══════════════════════════════════════════════════════════════════

const EMPIRE_ROLES: EmpireRole[] = [
  { name: 'Alpha', emoji: '🦁', title: 'Anführer', type: 'leader' },
  { name: 'Woody', emoji: '🪓', title: 'Holzfäller', type: 'woodcutter' },
  { name: 'Miner', emoji: '⛏️', title: 'Bergarbeiter', type: 'miner' },
  { name: 'Guardian', emoji: '⚔️', title: 'Wächter', type: 'guardian' },
  { name: 'Ranger', emoji: '🌾', title: 'Ranger', type: 'ranger' }
];

// ═══════════════════════════════════════════════════════════════════
// GLOBALER STATE
// ═══════════════════════════════════════════════════════════════════

const bots: Map<string, BotState> = new Map();

const shared: SharedState = {
  phase: 'PHASE_1_FIRST_TREES',
  craftingTablePos: null,
  chestPos: null,
  hutCorner: null,
  mineEntrance: null,
  waterPos: null,
  totalWood: 0,
  totalStone: 0,
  totalCoal: 0,
  totalFood: 0,
  botsReady: new Set(),
  hutBuilt: false,
  furnaceBuilt: false
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNKTIONEN
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

function getGroundY(bot: Bot, x: number, z: number): number {
  for (let y = 100; y > 0; y--) {
    const block = bot.blockAt(bot.entity.position.clone().set(x, y, z));
    if (block && block.name !== 'air' && !block.name.includes('leaves')) {
      return y + 1;
    }
  }
  return 64;
}

// ═══════════════════════════════════════════════════════════════════
// CRAFTING REZEPTE
// ═══════════════════════════════════════════════════════════════════

async function craftPlanks(bot: Bot, count: number = 4): Promise<boolean> {
  const logs = findItem(bot, 'log');
  if (!logs) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  
  if (plankRecipe) {
    try {
      await bot.craft(plankRecipe, Math.ceil(count / 4), null);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

async function craftSticks(bot: Bot, count: number = 4): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  
  if (stickRecipe) {
    try {
      await bot.craft(stickRecipe, Math.ceil(count / 4), null);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

async function craftCraftingTable(bot: Bot): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const recipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
  
  if (recipe) {
    try {
      await bot.craft(recipe, 1, null);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

async function craftWithTable(bot: Bot, itemName: string, craftingTable: Block): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const item = mcData.itemsByName[itemName];
  if (!item) return false;
  
  const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0];
  if (recipe) {
    try {
      await bot.craft(recipe, 1, craftingTable);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// BLOCK AKTIONEN
// ═══════════════════════════════════════════════════════════════════

async function chopTree(bot: Bot, state: BotState): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 48
  });
  
  if (!logBlock) {
    state.subTask = 'Suche Baum...';
    return false;
  }
  
  state.subTask = `Fälle ${logBlock.name}`;
  
  try {
    // Hingehen
    await bot.pathfinder.goto(new goals.GoalBlock(logBlock.position.x, logBlock.position.y, logBlock.position.z));
    
    // Axt equippen wenn vorhanden
    const axe = findItem(bot, 'axe');
    if (axe) await bot.equip(axe, 'hand');
    
    // Sammeln mit collectBlock
    await (bot as any).collectBlock.collect(logBlock);
    
    state.logsCollected++;
    shared.totalWood++;
    
    log(`${state.role.emoji} ${state.name}`, `✅ Log gesammelt! (${state.logsCollected} total)`);
    return true;
    
  } catch (err: any) {
    log(`${state.role.emoji} ${state.name}`, `Holz-Fehler: ${err.message}`);
    return false;
  }
}

async function placeBlock(bot: Bot, blockName: string, pos: Vec3): Promise<boolean> {
  const item = findItem(bot, blockName);
  if (!item) return false;
  
  try {
    await bot.equip(item, 'hand');
    
    // Finde einen Block auf dem wir platzieren können
    const groundBlock = bot.blockAt(pos.offset(0, -1, 0));
    if (!groundBlock || groundBlock.name === 'air') return false;
    
    await bot.placeBlock(groundBlock, new (require('vec3'))(0, 1, 0));
    return true;
  } catch (e) {
    return false;
  }
}

async function mineBlock(bot: Bot, block: Block, state: BotState): Promise<boolean> {
  try {
    // Tool equippen
    if (block.name.includes('stone') || block.name.includes('ore')) {
      const pick = findItem(bot, 'pickaxe');
      if (pick) await bot.equip(pick, 'hand');
    }
    
    await (bot as any).collectBlock.collect(block);
    
    if (block.name.includes('stone') || block.name === 'cobblestone') {
      shared.totalStone++;
    } else if (block.name.includes('coal')) {
      shared.totalCoal++;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CHEST INTERAKTION
// ═══════════════════════════════════════════════════════════════════

async function depositToChest(bot: Bot, state: BotState): Promise<boolean> {
  if (!shared.chestPos) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const chestBlock = bot.findBlock({
    matching: mcData.blocksByName.chest.id,
    maxDistance: 10
  });
  
  if (!chestBlock) return false;
  
  try {
    // Zur Truhe gehen
    await bot.pathfinder.goto(new goals.GoalBlock(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z));
    
    // Truhe öffnen
    const chest = await bot.openContainer(chestBlock);
    
    // Alle Logs einlagern (aber Tools behalten)
    for (const item of bot.inventory.items()) {
      if (item.name.includes('log') || item.name.includes('plank')) {
        await chest.deposit(item.type, null, item.count);
      }
    }
    
    chest.close();
    log(`${state.role.emoji} ${state.name}`, '📦 Ressourcen in Truhe gelegt');
    return true;
  } catch (e) {
    return false;
  }
}

async function withdrawFromChest(bot: Bot, itemName: string, count: number): Promise<boolean> {
  if (!shared.chestPos) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  const chestBlock = bot.findBlock({
    matching: mcData.blocksByName.chest.id,
    maxDistance: 10
  });
  
  if (!chestBlock) return false;
  
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z));
    const chest = await bot.openContainer(chestBlock);
    
    for (const item of chest.containerItems()) {
      if (item.name.includes(itemName)) {
        await chest.withdraw(item.type, null, Math.min(item.count, count));
        break;
      }
    }
    
    chest.close();
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 1: ERSTE BÄUME
// ═══════════════════════════════════════════════════════════════════

async function phase1FirstTrees(bot: Bot, state: BotState): Promise<void> {
  // Jeder Bot fällt 1 Baum
  if (state.treesChopped < 1) {
    state.subTask = 'Erster Baum...';
    
    if (await chopTree(bot, state)) {
      state.treesChopped++;
      
      // Alle Logs vom Baum sammeln (meist 4-6)
      for (let i = 0; i < 5; i++) {
        await sleep(500);
        await chopTree(bot, state);
      }
      
      log(`${state.role.emoji} ${state.name}`, `🌲 Erster Baum gefällt! (${state.logsCollected} Logs)`);
      
      // Zur Basis zurück
      state.subTask = 'Zurück zur Basis...';
      await bot.pathfinder.goto(new goals.GoalXZ(BASE_POS.x, BASE_POS.z));
      
      // Als bereit markieren
      shared.botsReady.add(state.name);
      
      // Warte auf alle
      if (shared.botsReady.size >= 5) {
        log('🏰 EMPIRE', '✅ PHASE 1 COMPLETE - Alle haben ersten Baum!');
        shared.phase = 'PHASE_1_CRAFT_STATION';
        shared.botsReady.clear();
      }
    }
  } else {
    // Warte bei Basis auf andere
    state.subTask = `Warte auf Team (${shared.botsReady.size}/5)`;
    await sleep(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 1: CRAFT STATION (NUR ALPHA)
// ═══════════════════════════════════════════════════════════════════

async function phase1CraftStation(bot: Bot, state: BotState): Promise<void> {
  if (state.role.type === 'leader') {
    // Alpha baut Werkbank + Truhe
    state.subTask = 'Baue Werkbank + Truhe';
    
    // Planks craften
    if (countItem(bot, 'plank') < 12) {
      await craftPlanks(bot, 12);
    }
    
    // Werkbank craften
    if (countItem(bot, 'crafting_table') === 0) {
      await craftCraftingTable(bot);
      log(`${state.role.emoji} ${state.name}`, '🔧 Werkbank gecraftet!');
    }
    
    // Werkbank platzieren
    if (!shared.craftingTablePos) {
      const groundY = getGroundY(bot, BASE_POS.x, BASE_POS.z);
      const tablePos = { x: BASE_POS.x, y: groundY, z: BASE_POS.z };
      
      const tableItem = findItem(bot, 'crafting_table');
      if (tableItem) {
        await bot.equip(tableItem, 'hand');
        
        // Gehe zur Position
        await bot.pathfinder.goto(new goals.GoalXZ(tablePos.x + 1, tablePos.z));
        
        const ground = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (ground) {
          try {
            await bot.placeBlock(ground, new (require('vec3'))(0, 1, 0));
            shared.craftingTablePos = tablePos;
            log(`${state.role.emoji} ${state.name}`, '📍 Werkbank platziert!');
          } catch (e) {}
        }
      }
    }
    
    // Truhe craften (8 Planks)
    if (countItem(bot, 'chest') === 0 && countItem(bot, 'plank') >= 8) {
      const mcData = require('minecraft-data')(bot.version);
      
      // Finde Werkbank
      const craftTable = bot.findBlock({
        matching: mcData.blocksByName.crafting_table.id,
        maxDistance: 5
      });
      
      if (craftTable) {
        await craftWithTable(bot, 'chest', craftTable);
        log(`${state.role.emoji} ${state.name}`, '📦 Truhe gecraftet!');
      }
    }
    
    // Truhe platzieren
    if (!shared.chestPos && countItem(bot, 'chest') > 0) {
      const chestPos = { x: BASE_POS.x + 2, y: getGroundY(bot, BASE_POS.x + 2, BASE_POS.z), z: BASE_POS.z };
      
      const chestItem = findItem(bot, 'chest');
      if (chestItem) {
        await bot.equip(chestItem, 'hand');
        await bot.pathfinder.goto(new goals.GoalXZ(chestPos.x, chestPos.z + 1));
        
        const ground = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (ground) {
          try {
            await bot.placeBlock(ground, new (require('vec3'))(0, 1, 0));
            shared.chestPos = chestPos;
            log(`${state.role.emoji} ${state.name}`, '📍 Truhe platziert!');
          } catch (e) {}
        }
      }
    }
    
    // Check ob fertig
    if (shared.craftingTablePos && shared.chestPos) {
      log('🏰 EMPIRE', '✅ Werkbank + Truhe fertig! → PHASE 1 TOOLS');
      shared.phase = 'PHASE_1_TOOLS';
    }
    
  } else {
    // Andere warten
    state.subTask = 'Warte auf Alpha (Werkbank)...';
    await sleep(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 1: TOOLS CRAFTEN (ALLE)
// ═══════════════════════════════════════════════════════════════════

async function phase1Tools(bot: Bot, state: BotState): Promise<void> {
  state.subTask = 'Crafte Tools...';
  
  const mcData = require('minecraft-data')(bot.version);
  
  // Finde Werkbank
  const craftTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 10
  });
  
  if (!craftTable) {
    state.subTask = 'Suche Werkbank...';
    await bot.pathfinder.goto(new goals.GoalXZ(BASE_POS.x, BASE_POS.z));
    return;
  }
  
  // Zur Werkbank gehen
  await bot.pathfinder.goto(new goals.GoalBlock(craftTable.position.x, craftTable.position.y, craftTable.position.z));
  
  // Planks + Sticks sicherstellen
  if (countItem(bot, 'plank') < 8) {
    await craftPlanks(bot, 8);
  }
  if (countItem(bot, 'stick') < 8) {
    await craftSticks(bot, 8);
  }
  
  // Holzaxt craften
  if (!state.hasAxe && countItem(bot, 'axe') === 0) {
    if (await craftWithTable(bot, 'wooden_axe', craftTable)) {
      state.hasAxe = true;
      log(`${state.role.emoji} ${state.name}`, '🪓 Holzaxt gecraftet!');
    }
  }
  
  // Holzspitzhacke craften
  if (!state.hasPickaxe && countItem(bot, 'pickaxe') === 0) {
    if (await craftWithTable(bot, 'wooden_pickaxe', craftTable)) {
      state.hasPickaxe = true;
      log(`${state.role.emoji} ${state.name}`, '⛏️ Holzspitzhacke gecraftet!');
    }
  }
  
  // Holz in Truhe legen
  if (countItem(bot, 'log') > 0 || countItem(bot, 'plank') > 10) {
    await depositToChest(bot, state);
  }
  
  // Als bereit markieren wenn Tools da
  if (state.hasAxe && state.hasPickaxe) {
    shared.botsReady.add(state.name);
    
    if (shared.botsReady.size >= 5) {
      log('🏰 EMPIRE', '✅ Alle haben Tools! → PHASE 1 MORE TREES');
      shared.phase = 'PHASE_1_MORE_TREES';
      shared.botsReady.clear();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 1: MEHR BÄUME (ALLE)
// ═══════════════════════════════════════════════════════════════════

async function phase1MoreTrees(bot: Bot, state: BotState): Promise<void> {
  // Jeder fällt 2 weitere Bäume
  if (state.treesChopped < 3) {
    state.subTask = `Baum ${state.treesChopped + 1}/3...`;
    
    // Axt equippen
    const axe = findItem(bot, 'axe');
    if (axe) await bot.equip(axe, 'hand');
    
    if (await chopTree(bot, state)) {
      // Ganzen Baum fällen
      for (let i = 0; i < 5; i++) {
        await sleep(300);
        await chopTree(bot, state);
      }
      
      state.treesChopped++;
      log(`${state.role.emoji} ${state.name}`, `🌲 Baum ${state.treesChopped}/3 gefällt!`);
    }
  } else {
    // Holz in Truhe legen
    if (countItem(bot, 'log') > 0) {
      await depositToChest(bot, state);
    }
    
    shared.botsReady.add(state.name);
    
    if (shared.botsReady.size >= 5) {
      log('🏰 EMPIRE', '🎉 PHASE 1 COMPLETE! → PHASE 2 SPEZIALISIERUNG');
      shared.phase = 'PHASE_2_SPECIALIZE';
      shared.botsReady.clear();
    } else {
      state.subTask = `Warte auf Team (${shared.botsReady.size}/5)`;
      await sleep(2000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 2: SPEZIALISIERUNG
// ═══════════════════════════════════════════════════════════════════

async function phase2Specialize(bot: Bot, state: BotState): Promise<void> {
  switch (state.role.type) {
    case 'leader':
      await leaderWork(bot, state);
      break;
    case 'woodcutter':
      await woodcutterWork(bot, state);
      break;
    case 'miner':
      await minerWork(bot, state);
      break;
    case 'guardian':
      await guardianWork(bot, state);
      break;
    case 'ranger':
      await rangerWork(bot, state);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════
// LEADER WORK (Alpha)
// ═══════════════════════════════════════════════════════════════════

async function leaderWork(bot: Bot, state: BotState): Promise<void> {
  state.subTask = 'Koordiniere Team...';
  
  const mcData = require('minecraft-data')(bot.version);
  
  // Bei Basis bleiben
  const dist = Math.sqrt(bot.entity.position.x ** 2 + bot.entity.position.z ** 2);
  if (dist > 15) {
    await bot.pathfinder.goto(new goals.GoalXZ(BASE_POS.x, BASE_POS.z));
  }
  
  // Ofen bauen wenn Stein vorhanden
  if (!shared.furnaceBuilt && shared.totalStone >= 8) {
    const craftTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 10
    });
    
    if (craftTable && countItem(bot, 'cobblestone') >= 8) {
      if (await craftWithTable(bot, 'furnace', craftTable)) {
        log(`${state.role.emoji} ${state.name}`, '🔥 Ofen gecraftet!');
        shared.furnaceBuilt = true;
      }
    }
  }
  
  // Helfe wo nötig
  // Prüfe ob jemand Hilfe braucht (low health)
  for (const [_, s] of bots) {
    if (s.bot && s.health < 10 && s.name !== state.name) {
      state.subTask = `Helfe ${s.name}!`;
      await bot.pathfinder.goto(new goals.GoalFollow(s.bot.entity, 3));
      break;
    }
  }
  
  await sleep(3000);
}

// ═══════════════════════════════════════════════════════════════════
// WOODCUTTER WORK (Woody) - 7x7 Hütte bauen
// ═══════════════════════════════════════════════════════════════════

async function woodcutterWork(bot: Bot, state: BotState): Promise<void> {
  // Erst genug Holz sammeln für Hütte (7x7 braucht ca. 56 Planks = 14 Logs)
  if (countItem(bot, 'log') < 20 && !shared.hutBuilt) {
    state.subTask = 'Sammle Holz für Hütte...';
    await chopTree(bot, state);
    return;
  }
  
  // Hütte bauen
  if (!shared.hutBuilt) {
    state.subTask = 'Baue 7x7 Hütte...';
    
    // Holz zu Planks verarbeiten
    while (countItem(bot, 'log') > 0 && countItem(bot, 'plank') < 100) {
      await craftPlanks(bot, 16);
    }
    
    // Hütten-Ecke setzen
    if (!shared.hutCorner) {
      shared.hutCorner = { x: BASE_POS.x + 5, y: getGroundY(bot, BASE_POS.x + 5, BASE_POS.z + 5), z: BASE_POS.z + 5 };
    }
    
    // Fundament bauen (7x7)
    const mcData = require('minecraft-data')(bot.version);
    const plankItem = findItem(bot, 'plank');
    
    if (plankItem) {
      await bot.equip(plankItem, 'hand');
      
      for (let x = 0; x < 7; x++) {
        for (let z = 0; z < 7; z++) {
          // Nur Rand bauen
          if (x === 0 || x === 6 || z === 0 || z === 6) {
            const blockPos = {
              x: shared.hutCorner.x + x,
              y: shared.hutCorner.y,
              z: shared.hutCorner.z + z
            };
            
            await bot.pathfinder.goto(new goals.GoalNear(blockPos.x, blockPos.y, blockPos.z, 2));
            
            const ground = bot.blockAt(bot.entity.position.offset(0, -1, 0));
            if (ground && ground.name !== 'air') {
              try {
                await bot.placeBlock(ground, new (require('vec3'))(0, 1, 0));
                await sleep(200);
              } catch (e) {}
            }
          }
        }
      }
      
      log(`${state.role.emoji} ${state.name}`, '🏠 Hütten-Fundament gebaut!');
      shared.hutBuilt = true;
    }
  } else {
    // Weiter Holz sammeln
    state.subTask = 'Sammle mehr Holz...';
    await chopTree(bot, state);
  }
}

// ═══════════════════════════════════════════════════════════════════
// MINER WORK (Miner) - Höhle/Keller graben
// ═══════════════════════════════════════════════════════════════════

async function minerWork(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Mineneingang festlegen
  if (!shared.mineEntrance) {
    shared.mineEntrance = { x: BASE_POS.x - 5, y: getGroundY(bot, BASE_POS.x - 5, BASE_POS.z) - 1, z: BASE_POS.z };
  }
  
  // Spitzhacke equippen
  const pick = findItem(bot, 'pickaxe');
  if (pick) await bot.equip(pick, 'hand');
  
  state.subTask = 'Grabe Mine...';
  
  // Zum Mineneingang gehen
  await bot.pathfinder.goto(new goals.GoalXZ(shared.mineEntrance.x, shared.mineEntrance.z));
  
  // Stein/Erz suchen
  const stoneBlock = bot.findBlock({
    matching: [
      mcData.blocksByName.stone?.id,
      mcData.blocksByName.cobblestone?.id,
      mcData.blocksByName.coal_ore?.id,
      mcData.blocksByName.iron_ore?.id
    ].filter(Boolean),
    maxDistance: 10
  });
  
  if (stoneBlock) {
    state.subTask = `Mine ${stoneBlock.name}...`;
    await mineBlock(bot, stoneBlock, state);
    log(`${state.role.emoji} ${state.name}`, `⛏️ ${stoneBlock.name} abgebaut!`);
  } else {
    // Grabe nach unten
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (below && below.name !== 'air' && below.name !== 'bedrock') {
      try {
        await bot.dig(below);
        state.subTask = 'Grabe Treppe...';
      } catch (e) {}
    }
  }
  
  // Stein upgraden zu Stone Tools wenn genug
  if (shared.totalStone >= 6 && !state.hasPickaxe) {
    const craftTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 20
    });
    
    if (craftTable) {
      await bot.pathfinder.goto(new goals.GoalBlock(craftTable.position.x, craftTable.position.y, craftTable.position.z));
      if (await craftWithTable(bot, 'stone_pickaxe', craftTable)) {
        log(`${state.role.emoji} ${state.name}`, '⛏️ Stein-Spitzhacke gecraftet!');
      }
    }
  }
  
  await sleep(1000);
}

// ═══════════════════════════════════════════════════════════════════
// GUARDIAN WORK (Guardian) - Jagen, Schwert, Schutz
// ═══════════════════════════════════════════════════════════════════

async function guardianWork(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Schwert craften wenn nicht vorhanden
  if (!state.hasSword && countItem(bot, 'sword') === 0) {
    const craftTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 20
    });
    
    if (craftTable) {
      await bot.pathfinder.goto(new goals.GoalBlock(craftTable.position.x, craftTable.position.y, craftTable.position.z));
      
      // Erst Stone Sword versuchen, sonst Wood
      if (countItem(bot, 'cobblestone') >= 2) {
        if (await craftWithTable(bot, 'stone_sword', craftTable)) {
          state.hasSword = true;
          log(`${state.role.emoji} ${state.name}`, '⚔️ Stein-Schwert gecraftet!');
        }
      } else {
        if (await craftWithTable(bot, 'wooden_sword', craftTable)) {
          state.hasSword = true;
          log(`${state.role.emoji} ${state.name}`, '⚔️ Holz-Schwert gecraftet!');
        }
      }
    }
  }
  
  // Schwert equippen
  const sword = findItem(bot, 'sword');
  if (sword) await bot.equip(sword, 'hand');
  
  // Feinde suchen
  const hostile = bot.nearestEntity(e => {
    const hostiles = ['zombie', 'skeleton', 'spider', 'creeper'];
    return hostiles.includes(e.name || '');
  });
  
  if (hostile) {
    const dist = bot.entity.position.distanceTo(hostile.position);
    
    if (hostile.name === 'creeper' && dist < 6) {
      state.subTask = 'Fliehe vor Creeper!';
      const away = bot.entity.position.minus(hostile.position).normalize();
      const target = bot.entity.position.offset(away.x * 15, 0, away.z * 15);
      await bot.pathfinder.goto(new goals.GoalXZ(target.x, target.z));
      return;
    }
    
    if (dist < 4) {
      state.subTask = `Kämpfe ${hostile.name}!`;
      await bot.attack(hostile);
      return;
    }
  }
  
  // Tiere jagen
  const animal = bot.nearestEntity(e => {
    const animals = ['cow', 'pig', 'sheep', 'chicken'];
    return animals.includes(e.name || '');
  });
  
  if (animal) {
    const dist = bot.entity.position.distanceTo(animal.position);
    
    if (dist < 3) {
      state.subTask = `Jage ${animal.name}`;
      await bot.attack(animal);
      
      await sleep(500);
      if (!animal.isValid) {
        shared.totalFood++;
        log(`${state.role.emoji} ${state.name}`, `🍖 ${animal.name} erlegt!`);
      }
    } else if (dist < 20) {
      state.subTask = `Verfolge ${animal.name}`;
      await bot.pathfinder.goto(new goals.GoalFollow(animal, 2));
    }
    return;
  }
  
  // Patroullieren
  state.subTask = 'Patroulliere...';
  const angle = Math.random() * Math.PI * 2;
  const dist = 5 + Math.random() * 10;
  await bot.pathfinder.goto(new goals.GoalXZ(
    BASE_POS.x + Math.cos(angle) * dist,
    BASE_POS.z + Math.sin(angle) * dist
  ));
  
  await sleep(2000);
}

// ═══════════════════════════════════════════════════════════════════
// RANGER WORK (Ranger) - Farmen, Samen, Tiere
// ═══════════════════════════════════════════════════════════════════

async function rangerWork(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Wasser suchen für Farm
  if (!shared.waterPos) {
    const water = bot.findBlock({
      matching: mcData.blocksByName.water.id,
      maxDistance: 50
    });
    
    if (water) {
      shared.waterPos = { x: water.position.x, y: water.position.y, z: water.position.z };
      log(`${state.role.emoji} ${state.name}`, '💧 Wasser gefunden!');
    } else {
      state.subTask = 'Suche Wasser...';
      // Erkunde
      const angle = Math.random() * Math.PI * 2;
      await bot.pathfinder.goto(new goals.GoalXZ(
        bot.entity.position.x + Math.cos(angle) * 30,
        bot.entity.position.z + Math.sin(angle) * 30
      ));
      return;
    }
  }
  
  // Sammle Weizen/Samen/Beeren
  const collectibles = ['wheat', 'beetroot', 'carrot', 'potato', 'sweet_berry_bush'];
  
  for (const item of collectibles) {
    const block = bot.findBlock({
      matching: mcData.blocksByName[item]?.id,
      maxDistance: 30
    });
    
    if (block) {
      state.subTask = `Sammle ${item}...`;
      try {
        await bot.pathfinder.goto(new goals.GoalBlock(block.position.x, block.position.y, block.position.z));
        await (bot as any).collectBlock.collect(block);
        log(`${state.role.emoji} ${state.name}`, `🌾 ${item} gesammelt!`);
        return;
      } catch (e) {}
    }
  }
  
  // Blumen/Gras für Samen
  const grass = bot.findBlock({
    matching: [mcData.blocksByName.grass?.id, mcData.blocksByName.tall_grass?.id].filter(Boolean),
    maxDistance: 20
  });
  
  if (grass && countItem(bot, 'seed') < 10) {
    state.subTask = 'Sammle Samen...';
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(grass.position.x, grass.position.y, grass.position.z));
      await bot.dig(grass);
      log(`${state.role.emoji} ${state.name}`, '🌱 Gras abgebaut (Samen!)');
      return;
    } catch (e) {}
  }
  
  // Wenn nichts zu tun: Tiere jagen wie Guardian
  const animal = bot.nearestEntity(e => {
    const animals = ['cow', 'pig', 'sheep', 'chicken'];
    return animals.includes(e.name || '');
  });
  
  if (animal) {
    state.subTask = `Jage ${animal.name}`;
    const dist = bot.entity.position.distanceTo(animal.position);
    
    if (dist < 3) {
      await bot.attack(animal);
      await sleep(500);
      if (!animal.isValid) {
        shared.totalFood++;
      }
    } else if (dist < 15) {
      await bot.pathfinder.goto(new goals.GoalFollow(animal, 2));
    }
    return;
  }
  
  // Erkunden
  state.subTask = 'Erkunde...';
  await sleep(3000);
}

// ═══════════════════════════════════════════════════════════════════
// HAUPT WORK LOOP
// ═══════════════════════════════════════════════════════════════════

async function workLoop(bot: Bot, state: BotState): Promise<void> {
  log(`${state.role.emoji} ${state.name}`, 'Work Loop gestartet!');
  
  while (state.connected) {
    try {
      await sleep(500);
      if (!bot.entity) continue;
      
      // State updaten
      state.position = { x: bot.entity.position.x, y: bot.entity.position.y, z: bot.entity.position.z };
      state.health = bot.health;
      state.food = bot.food;
      state.phase = shared.phase;
      
      // Überleben prüfen
      if (bot.food < 14) {
        const food = findItem(bot, 'beef', 'pork', 'chicken', 'bread', 'apple');
        if (food) {
          await bot.equip(food, 'hand');
          await bot.consume();
          log(`${state.role.emoji} ${state.name}`, '🍖 Gegessen!');
        }
      }
      
      // Kampf wenn Feind nah
      const hostile = bot.nearestEntity(e => {
        const hostiles = ['zombie', 'skeleton', 'spider'];
        return hostiles.includes(e.name || '') && bot.entity.position.distanceTo(e.position) < 4;
      });
      
      if (hostile) {
        state.subTask = `Kämpfe ${hostile.name}!`;
        const weapon = findItem(bot, 'sword', 'axe');
        if (weapon) await bot.equip(weapon, 'hand');
        await bot.attack(hostile);
        continue;
      }
      
      // Phase-spezifische Arbeit
      switch (shared.phase) {
        case 'PHASE_1_FIRST_TREES':
          await phase1FirstTrees(bot, state);
          break;
        case 'PHASE_1_CRAFT_STATION':
          await phase1CraftStation(bot, state);
          break;
        case 'PHASE_1_TOOLS':
          await phase1Tools(bot, state);
          break;
        case 'PHASE_1_MORE_TREES':
          await phase1MoreTrees(bot, state);
          break;
        case 'PHASE_2_SPECIALIZE':
          await phase2Specialize(bot, state);
          break;
      }
      
    } catch (err: any) {
      if (!err.message?.includes('interrupt')) {
        log(`${state.role.emoji} ${state.name}`, `Fehler: ${err.message}`);
      }
      await sleep(2000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// BOT ERSTELLEN
// ═══════════════════════════════════════════════════════════════════

async function createBot(role: EmpireRole): Promise<Bot> {
  const botName = `Toobix_${role.name}`;
  
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: botName,
    version: '1.20.1'
  });
  
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);
  
  const state: BotState = {
    name: role.name,
    role,
    bot,
    connected: false,
    phase: 'PHASE_1_FIRST_TREES',
    subTask: 'Spawning...',
    treesChopped: 0,
    logsCollected: 0,
    hasAxe: false,
    hasPickaxe: false,
    hasSword: false,
    position: null,
    health: 20,
    food: 20
  };
  
  bots.set(role.name, state);
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Spawn timeout'));
    }, 30000);
    
    bot.once('spawn', async () => {
      clearTimeout(timeout);
      state.connected = true;
      log(`${role.emoji} ${role.name}`, 'Gespawnt!');
      
      // Pathfinder setup
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      movements.canDig = true;
      movements.allow1by1towers = true;
      bot.pathfinder.setMovements(movements);
      
      // Teleport zu Basis
      bot.chat(`/tp ${botName} ${BASE_POS.x} ~ ${BASE_POS.z}`);
      await sleep(1000);
      log(`${role.emoji} ${role.name}`, 'Zur Basis teleportiert!');
      
      // Keep-alive
      setInterval(() => {
        if (bot.entity) {
          bot.swingArm('right');
          state.health = bot.health;
          state.food = bot.food;
        }
      }, 500);
      
      // Work loop starten
      workLoop(bot, state);
      
      resolve(bot);
    });
    
    bot.on('error', (err) => {
      clearTimeout(timeout);
      log(`${role.emoji} ${role.name}`, `Error: ${err.message}`);
    });
    
    bot.on('end', () => {
      log(`${role.emoji} ${role.name}`, 'Disconnected');
      state.connected = false;
    });
    
    bot.on('death', () => {
      log(`${role.emoji} ${role.name}`, '💀 Gestorben!');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// STATUS ANZEIGE
// ═══════════════════════════════════════════════════════════════════

function showStatus() {
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('🏰 TOOBIX EMPIRE V5 - PHASED COLONY');
  console.log('══════════════════════════════════════════════════════════════════════\n');
  
  console.log(`📍 Phase: ${shared.phase}`);
  console.log(`🪵 Holz: ${shared.totalWood} | 🪨 Stein: ${shared.totalStone} | �ite Coal: ${shared.totalCoal} | 🍖 Food: ${shared.totalFood}`);
  console.log(`📍 Werkbank: ${shared.craftingTablePos ? '✅' : '❌'} | 📦 Truhe: ${shared.chestPos ? '✅' : '❌'} | 🏠 Hütte: ${shared.hutBuilt ? '✅' : '❌'}\n`);
  
  console.log('BOTS:');
  for (const [_, state] of bots) {
    const status = state.connected ? '✅' : '❌';
    const health = state.connected ? `❤️${Math.round(state.health)}` : '';
    console.log(`   ${state.role.emoji} ${state.name.padEnd(8)} ${status} ${health.padEnd(5)} - ${state.subTask}`);
  }
  
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

// ═══════════════════════════════════════════════════════════════════
// SERVER RESET
// ═══════════════════════════════════════════════════════════════════

async function resetServer() {
  log('🏰 EMPIRE', 'Setze Server auf Tag 1...');
  
  const setupBot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'Toobix_Setup',
    version: '1.20.1'
  });
  
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      setupBot.quit();
      reject(new Error('Setup timeout'));
    }, 15000);
    
    setupBot.once('spawn', async () => {
      await sleep(1000);
      setupBot.chat('/time set 1000');
      await sleep(300);
      setupBot.chat('/weather clear');
      await sleep(300);
      setupBot.chat('/difficulty normal');
      await sleep(300);
      setupBot.chat('/setworldspawn 0 ~ 0');
      await sleep(500);
      
      clearTimeout(timeout);
      log('🏰 EMPIRE', '✅ Server auf Tag 1 gesetzt!');
      setupBot.quit();
      resolve();
    });
    
    setupBot.on('error', () => {
      clearTimeout(timeout);
      reject(new Error('Setup bot error'));
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// STATUS API
// ═══════════════════════════════════════════════════════════════════

function startStatusServer() {
  Bun.serve({
    port: STATUS_PORT,
    fetch(req) {
      const status = {
        phase: shared.phase,
        resources: {
          wood: shared.totalWood,
          stone: shared.totalStone,
          coal: shared.totalCoal,
          food: shared.totalFood
        },
        structures: {
          craftingTable: !!shared.craftingTablePos,
          chest: !!shared.chestPos,
          hut: shared.hutBuilt,
          furnace: shared.furnaceBuilt
        },
        bots: Array.from(bots.values()).map(s => ({
          name: s.name,
          role: s.role.title,
          emoji: s.role.emoji,
          connected: s.connected,
          phase: s.phase,
          task: s.subTask,
          health: s.health,
          tools: { axe: s.hasAxe, pickaxe: s.hasPickaxe, sword: s.hasSword }
        }))
      };
      
      return new Response(JSON.stringify(status, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
  
  log('🏰 EMPIRE', `📊 Status API: http://localhost:${STATUS_PORT}`);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║       🏰 TOOBIX EMPIRE V5 - PHASED COLONY SYSTEM 🏰                ║
║                                                                    ║
║  PHASE 1: Erste Bäume → Werkbank → Tools → Mehr Bäume             ║
║  PHASE 2: Spezialisierung                                         ║
║                                                                    ║
║  🦁 Alpha    - Koordiniert, craftet                               ║
║  🪓 Woody    - Baut 7x7 Hütte                                     ║
║  ⛏️ Miner    - Gräbt Mine, sammelt Stein                          ║
║  ⚔️ Guardian - Jagt, beschützt                                    ║
║  🌾 Ranger   - Farmt, sammelt Samen                               ║
╚════════════════════════════════════════════════════════════════════╝
`);
  
  try {
    // Server Reset
    await resetServer();
    await sleep(2000);
    
    // Status Server
    startStatusServer();
    
    // Bots spawnen
    log('🏰 EMPIRE', 'Spawne 5 Empire Bots...\n');
    
    for (const role of EMPIRE_ROLES) {
      console.log(`Spawning ${role.emoji} ${role.name} (${role.title})...`);
      try {
        await createBot(role);
        await sleep(SPAWN_DELAY);
      } catch (err: any) {
        console.log(`❌ ${role.name} spawn failed: ${err.message}`);
      }
    }
    
    const connected = Array.from(bots.values()).filter(s => s.connected).length;
    console.log(`\n✅ ${connected}/5 Bots bereit für Phase 1!\n`);
    
    // Status alle 20 Sekunden
    setInterval(showStatus, 20000);
    showStatus();
    
  } catch (err: any) {
    console.error('Empire Fehler:', err.message);
  }
}

main().catch(console.error);
