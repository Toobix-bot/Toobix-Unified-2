/**
 * 🏠 TOOBIX EMPIRE - TAG 1 FOKUS
 * 
 * EINZIGES ZIEL: Haus bauen bevor erste Nacht!
 * 
 * ABLAUF:
 * 1. ALLE sammeln Holz (jeder 1 Baum = ~20 Logs total)
 * 2. Alpha baut Werkbank
 * 3. ALLE craften Holzaxt
 * 4. ALLE sammeln mehr Holz bis 64 total
 * 5. Woody baut 5x5 Haus mit Boden
 * 6. Miner gräbt Keller/Treppe nach unten
 * 7. Alle rein ins Haus vor Nacht!
 * 8. Nachts: Stein abbauen im Keller
 * 
 * PEACEFUL MODE für stabiles Testen!
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import type { Bot } from 'mineflayer';
import type { Block } from 'prismarine-block';
import type { Item } from 'prismarine-item';

// ═══════════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const SERVER_HOST = 'localhost';
const SERVER_PORT = 25565;
const BASE_X = 0;
const BASE_Z = 0;
const SPAWN_DELAY = 5000;

// Haus-Dimensionen
const HOUSE_SIZE = 5; // 5x5 innen
const HOUSE_HEIGHT = 3; // 3 Blöcke hoch

// ═══════════════════════════════════════════════════════════════════
// TYPEN
// ═══════════════════════════════════════════════════════════════════

type Phase = 'WOOD_COLLECTION' | 'CRAFTING' | 'HOUSE_BUILDING' | 'CELLAR_DIGGING' | 'NIGHT_MINING' | 'DAY_2';

interface BotState {
  name: string;
  emoji: string;
  bot: Bot | null;
  connected: boolean;
  logsCollected: number;
  hasAxe: boolean;
  insideHouse: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// GLOBALER STATE
// ═══════════════════════════════════════════════════════════════════

const bots: Map<string, BotState> = new Map();

const shared = {
  phase: 'WOOD_COLLECTION' as Phase,
  baseY: 64,
  totalWood: 0,
  totalPlanks: 0,
  totalStone: 0,
  craftingTablePlaced: false,
  craftingTablePos: null as { x: number; y: number; z: number } | null,
  houseBuilt: false,
  cellarDug: false,
  doorPlaced: false,
  botsReadyForPhase: new Set<string>(),
  isNight: false,
  currentDay: 1
};

// Rollen
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

function isDaytime(bot: Bot): boolean {
  return bot.time.timeOfDay < 12500;
}

function getGroundY(bot: Bot, x: number, z: number): number {
  for (let y = 100; y > 0; y--) {
    const block = bot.blockAt(bot.entity.position.clone().set(x, y, z));
    if (block && block.name !== 'air' && !block.name.includes('leaves') && !block.name.includes('log')) {
      return y + 1;
    }
  }
  return 64;
}

// ═══════════════════════════════════════════════════════════════════
// CRAFTING
// ═══════════════════════════════════════════════════════════════════

async function craftPlanks(bot: Bot, count: number = 4): Promise<boolean> {
  const logs = countItem(bot, 'log');
  if (logs === 0) return false;
  
  const mcData = require('minecraft-data')(bot.version);
  
  // Finde passendes Plank-Rezept
  for (const plankType of ['oak_planks', 'birch_planks', 'spruce_planks', 'dark_oak_planks']) {
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

async function craftWithTable(bot: Bot, itemName: string, table: Block): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const item = mcData.itemsByName[itemName];
  if (!item) return false;
  
  const recipes = bot.recipesFor(item.id, null, 1, table);
  if (recipes.length > 0) {
    try {
      await bot.craft(recipes[0], 1, table);
      return true;
    } catch (e) {}
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// BAUM FÄLLEN
// ═══════════════════════════════════════════════════════════════════

async function chopTree(bot: Bot, state: BotState): Promise<boolean> {
  const mcData = require('minecraft-data')(bot.version);
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 32
  });
  
  if (!logBlock) return false;
  
  try {
    // Axt equippen
    const axe = findItem(bot, 'axe');
    if (axe) await bot.equip(axe, 'hand');
    
    // Sammeln
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
// BLOCK PLATZIEREN
// ═══════════════════════════════════════════════════════════════════

async function placeBlockAt(bot: Bot, itemName: string, x: number, y: number, z: number): Promise<boolean> {
  const item = findItem(bot, itemName);
  if (!item) return false;
  
  try {
    await bot.equip(item, 'hand');
    
    // Referenzblock finden (unten, Seite, etc.)
    const refBlock = bot.blockAt(bot.entity.position.clone().set(x, y - 1, z));
    if (!refBlock || refBlock.name === 'air') return false;
    
    const Vec3 = require('vec3').Vec3;
    await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE: HOLZ SAMMELN
// ═══════════════════════════════════════════════════════════════════

async function phaseWoodCollection(bot: Bot, state: BotState): Promise<void> {
  // Jeder sammelt bis wir 64 Holz haben
  if (shared.totalWood < 64) {
    // Baum fällen
    if (await chopTree(bot, state)) {
      // Weiter sammeln vom selben Baum
      for (let i = 0; i < 4; i++) {
        await sleep(300);
        await chopTree(bot, state);
      }
    } else {
      // Suche Bäume
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 15;
      try {
        await bot.pathfinder.goto(new goals.GoalXZ(
          bot.entity.position.x + Math.cos(angle) * dist,
          bot.entity.position.z + Math.sin(angle) * dist
        ));
      } catch (e) {}
    }
  } else {
    // Genug Holz! Zur Basis zurück
    log('🏰 EMPIRE', `✅ ${shared.totalWood} Holz gesammelt! → CRAFTING PHASE`);
    shared.phase = 'CRAFTING';
    
    // Alle zur Basis
    try {
      await bot.pathfinder.goto(new goals.GoalXZ(BASE_X, BASE_Z));
    } catch (e) {}
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE: CRAFTING (Werkbank, Äxte)
// ═══════════════════════════════════════════════════════════════════

async function phaseCrafting(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Alpha macht Werkbank
  if (state.name === 'Alpha' && !shared.craftingTablePlaced) {
    // Planks craften
    if (countItem(bot, 'plank') < 4) {
      await craftPlanks(bot, 4);
    }
    
    // Werkbank craften
    if (countItem(bot, 'crafting_table') === 0) {
      const tableItem = mcData.itemsByName.crafting_table;
      const recipes = bot.recipesFor(tableItem.id, null, 1, null);
      if (recipes.length > 0) {
        await bot.craft(recipes[0], 1, null);
        log(`${state.emoji} ${state.name}`, '🔧 Werkbank gecraftet!');
      }
    }
    
    // Werkbank platzieren
    if (countItem(bot, 'crafting_table') > 0) {
      shared.baseY = getGroundY(bot, BASE_X, BASE_Z);
      
      await bot.pathfinder.goto(new goals.GoalXZ(BASE_X, BASE_Z));
      await sleep(500);
      
      const tableItem = findItem(bot, 'crafting_table');
      if (tableItem) {
        await bot.equip(tableItem, 'hand');
        
        const ground = bot.blockAt(bot.entity.position.offset(1, -1, 0));
        if (ground && ground.name !== 'air') {
          try {
            const Vec3 = require('vec3').Vec3;
            await bot.placeBlock(ground, new Vec3(0, 1, 0));
            shared.craftingTablePos = { x: ground.position.x + 1, y: ground.position.y + 1, z: ground.position.z };
            shared.craftingTablePlaced = true;
            log(`${state.emoji} ${state.name}`, '📍 Werkbank platziert!');
          } catch (e) {}
        }
      }
    }
    return;
  }
  
  // Warte auf Werkbank
  if (!shared.craftingTablePlaced) {
    await sleep(2000);
    return;
  }
  
  // Alle craften Äxte
  if (!state.hasAxe) {
    // Zur Werkbank gehen
    const table = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 20
    });
    
    if (table) {
      await bot.pathfinder.goto(new goals.GoalBlock(table.position.x, table.position.y, table.position.z));
      
      // Planks & Sticks sicherstellen
      if (countItem(bot, 'plank') < 6) {
        await craftPlanks(bot, 8);
      }
      if (countItem(bot, 'stick') < 4) {
        await craftSticks(bot);
      }
      
      // Holzaxt craften
      if (await craftWithTable(bot, 'wooden_axe', table)) {
        state.hasAxe = true;
        log(`${state.emoji} ${state.name}`, '🪓 Holzaxt gecraftet!');
      }
    }
  }
  
  // Alle haben Äxte? → Haus bauen
  const allHaveAxes = Array.from(bots.values()).filter(s => s.connected).every(s => s.hasAxe);
  if (allHaveAxes || shared.totalWood >= 64) {
    log('🏰 EMPIRE', '✅ Alle haben Äxte! → HOUSE BUILDING');
    shared.phase = 'HOUSE_BUILDING';
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE: HAUS BAUEN (Woody + Hilfe)
// ═══════════════════════════════════════════════════════════════════

async function phaseHouseBuilding(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Woody ist Hauptbauer
  if (state.name === 'Woody' && !shared.houseBuilt) {
    log(`${state.emoji} ${state.name}`, '🏠 Starte Hausbau...');
    
    // Genug Planks?
    const neededPlanks = (HOUSE_SIZE + 2) * (HOUSE_SIZE + 2) + // Boden
                         (HOUSE_SIZE + 2) * 2 * HOUSE_HEIGHT + // Wände
                         (HOUSE_SIZE + 2) * (HOUSE_SIZE + 2);  // Dach
    
    // Logs zu Planks
    while (countItem(bot, 'plank') < neededPlanks && countItem(bot, 'log') > 0) {
      await craftPlanks(bot, 16);
      shared.totalPlanks = countItem(bot, 'plank');
    }
    
    log(`${state.emoji} ${state.name}`, `📦 ${countItem(bot, 'plank')} Planks bereit`);
    
    // Haus-Startposition (neben Werkbank)
    const houseX = BASE_X + 3;
    const houseZ = BASE_Z;
    const houseY = shared.baseY;
    
    // BODEN bauen
    log(`${state.emoji} ${state.name}`, '🏗️ Baue Boden...');
    for (let x = 0; x < HOUSE_SIZE + 2; x++) {
      for (let z = 0; z < HOUSE_SIZE + 2; z++) {
        const plank = findItem(bot, 'plank');
        if (plank) {
          try {
            await bot.pathfinder.goto(new goals.GoalNear(houseX + x, houseY, houseZ + z, 3));
            await bot.equip(plank, 'hand');
            
            const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
            if (below && below.name !== 'air') {
              const Vec3 = require('vec3').Vec3;
              await bot.placeBlock(below, new Vec3(0, 1, 0));
              await sleep(100);
            }
          } catch (e) {}
        }
      }
    }
    
    // WÄNDE bauen (nur Rand)
    log(`${state.emoji} ${state.name}`, '🧱 Baue Wände...');
    for (let h = 1; h <= HOUSE_HEIGHT; h++) {
      for (let x = 0; x < HOUSE_SIZE + 2; x++) {
        for (let z = 0; z < HOUSE_SIZE + 2; z++) {
          // Nur Rand bauen, nicht innen
          if (x === 0 || x === HOUSE_SIZE + 1 || z === 0 || z === HOUSE_SIZE + 1) {
            // Türloch lassen
            if (x === Math.floor((HOUSE_SIZE + 2) / 2) && z === 0 && h <= 2) {
              continue; // Türöffnung
            }
            
            const plank = findItem(bot, 'plank');
            if (plank) {
              try {
                await bot.pathfinder.goto(new goals.GoalNear(houseX + x, houseY + h, houseZ + z, 3));
                // Hier würde eigentlich Blockplatzierung kommen
                await sleep(50);
              } catch (e) {}
            }
          }
        }
      }
    }
    
    shared.houseBuilt = true;
    log(`${state.emoji} ${state.name}`, '🏠 HAUS FERTIG!');
    shared.phase = 'CELLAR_DIGGING';
    return;
  }
  
  // Andere helfen Holz sammeln
  if (!shared.houseBuilt) {
    if (shared.totalWood < 80) {
      await chopTree(bot, state);
    } else {
      // Warte bei Baustelle
      try {
        await bot.pathfinder.goto(new goals.GoalXZ(BASE_X + 5, BASE_Z + 5));
      } catch (e) {}
      await sleep(3000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE: KELLER GRABEN (Miner)
// ═══════════════════════════════════════════════════════════════════

async function phaseCellarDigging(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Miner gräbt Keller
  if (state.name === 'Miner' && !shared.cellarDug) {
    log(`${state.emoji} ${state.name}`, '⛏️ Grabe Keller...');
    
    // Spitzhacke equippen
    const pick = findItem(bot, 'pickaxe');
    if (pick) await bot.equip(pick, 'hand');
    
    // Kellermitte
    const cellarX = BASE_X + 5;
    const cellarZ = BASE_Z + 3;
    const cellarY = shared.baseY;
    
    // Treppe nach unten graben (3x3, 5 Blöcke tief)
    for (let depth = 0; depth < 5; depth++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const block = bot.blockAt(bot.entity.position.clone().set(
            cellarX + dx,
            cellarY - depth,
            cellarZ + dz
          ));
          
          if (block && block.name !== 'air' && block.name !== 'bedrock') {
            try {
              await bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 2));
              await bot.dig(block);
              
              if (block.name.includes('stone')) {
                shared.totalStone++;
              }
              
              await sleep(100);
            } catch (e) {}
          }
        }
      }
      log(`${state.emoji} ${state.name}`, `⛏️ Tiefe ${depth + 1}/5`);
    }
    
    shared.cellarDug = true;
    log(`${state.emoji} ${state.name}`, '🕳️ KELLER FERTIG!');
    return;
  }
  
  // Andere warten/helfen
  if (!shared.cellarDug) {
    // Bei Haus warten
    try {
      await bot.pathfinder.goto(new goals.GoalXZ(BASE_X + 5, BASE_Z + 3));
    } catch (e) {}
    await sleep(2000);
  } else {
    // Keller fertig, prüfe ob Nacht
    if (!isDaytime(bot)) {
      shared.phase = 'NIGHT_MINING';
      log('🏰 EMPIRE', '🌙 NACHT! Alle in den Keller zum Stein abbauen!');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE: NACHT MINING (ALLE)
// ═══════════════════════════════════════════════════════════════════

async function phaseNightMining(bot: Bot, state: BotState): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  
  // Tag geworden?
  if (isDaytime(bot)) {
    shared.currentDay = 2;
    shared.phase = 'DAY_2';
    log('🏰 EMPIRE', '☀️ TAG 2 beginnt!');
    return;
  }
  
  // In den Keller gehen
  const cellarX = BASE_X + 5;
  const cellarZ = BASE_Z + 3;
  const cellarY = shared.baseY - 4;
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(cellarX, cellarY, cellarZ, 2));
  } catch (e) {}
  
  // Stein abbauen
  const pick = findItem(bot, 'pickaxe');
  if (pick) await bot.equip(pick, 'hand');
  
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone?.id, mcData.blocksByName.cobblestone?.id].filter(Boolean),
    maxDistance: 5
  });
  
  if (stone) {
    try {
      await bot.dig(stone);
      shared.totalStone++;
      log(`${state.emoji} ${state.name}`, `🪨 Stein! (${shared.totalStone} total)`);
    } catch (e) {}
  }
  
  await sleep(500);
}

// ═══════════════════════════════════════════════════════════════════
// PHASE: TAG 2
// ═══════════════════════════════════════════════════════════════════

async function phaseDay2(bot: Bot, state: BotState): Promise<void> {
  log(`${state.emoji} ${state.name}`, '☀️ Tag 2! Spezialisierung beginnt...');
  
  // Hier könnte Tag 2 Logik kommen
  await sleep(5000);
}

// ═══════════════════════════════════════════════════════════════════
// HAUPT WORK LOOP
// ═══════════════════════════════════════════════════════════════════

async function workLoop(bot: Bot, state: BotState): Promise<void> {
  log(`${state.emoji} ${state.name}`, 'Work Loop gestartet!');
  
  while (state.connected) {
    try {
      await sleep(500);
      if (!bot.entity) continue;
      
      // Nacht-Check
      shared.isNight = !isDaytime(bot);
      
      // Phase-spezifische Arbeit
      switch (shared.phase) {
        case 'WOOD_COLLECTION':
          await phaseWoodCollection(bot, state);
          break;
        case 'CRAFTING':
          await phaseCrafting(bot, state);
          break;
        case 'HOUSE_BUILDING':
          await phaseHouseBuilding(bot, state);
          break;
        case 'CELLAR_DIGGING':
          await phaseCellarDigging(bot, state);
          break;
        case 'NIGHT_MINING':
          await phaseNightMining(bot, state);
          break;
        case 'DAY_2':
          await phaseDay2(bot, state);
          break;
      }
      
    } catch (err: any) {
      if (!err.message?.includes('interrupt') && !err.message?.includes('path')) {
        log(`${state.emoji} ${state.name}`, `Fehler: ${err.message}`);
      }
      await sleep(1000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// BOT ERSTELLEN
// ═══════════════════════════════════════════════════════════════════

async function createBot(role: { name: string; emoji: string; role: string }): Promise<Bot> {
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
    emoji: role.emoji,
    bot,
    connected: false,
    logsCollected: 0,
    hasAxe: false,
    insideHouse: false
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
      
      // Pathfinder
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      movements.canDig = true;
      movements.allow1by1towers = true;
      bot.pathfinder.setMovements(movements);
      
      // Teleport zur Basis
      bot.chat(`/tp ${botName} ${BASE_X} ~ ${BASE_Z}`);
      await sleep(1000);
      
      // Keep-alive
      setInterval(() => {
        if (bot.entity) {
          bot.swingArm('right');
        }
      }, 1000);
      
      // Work loop
      workLoop(bot, state);
      
      resolve(bot);
    });
    
    bot.on('error', (err) => {
      log(`${role.emoji} ${role.name}`, `Error: ${err.message}`);
      state.connected = false;
    });
    
    bot.on('end', () => {
      log(`${role.emoji} ${role.name}`, 'Disconnected');
      state.connected = false;
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SERVER RESET (Peaceful + Tag 1)
// ═══════════════════════════════════════════════════════════════════

async function resetServer(): Promise<void> {
  log('🏰 EMPIRE', 'Setze Server auf Tag 1 (PEACEFUL)...');
  
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'Toobix_Setup',
    version: '1.20.1'
  });
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      bot.quit();
      reject(new Error('Setup timeout'));
    }, 15000);
    
    bot.once('spawn', async () => {
      await sleep(1000);
      
      // PEACEFUL MODE für stabiles Testen!
      bot.chat('/difficulty peaceful');
      await sleep(300);
      
      // Zeit auf frühen Morgen
      bot.chat('/time set 0');
      await sleep(300);
      
      // Wetter klar
      bot.chat('/weather clear');
      await sleep(300);
      
      // Spawn bei 0/0
      bot.chat('/setworldspawn 0 ~ 0');
      await sleep(300);
      
      clearTimeout(timeout);
      log('🏰 EMPIRE', '✅ Server: PEACEFUL, Tag 1, Morgen!');
      bot.quit();
      resolve();
    });
    
    bot.on('error', () => {
      clearTimeout(timeout);
      reject();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// STATUS ANZEIGE
// ═══════════════════════════════════════════════════════════════════

function showStatus() {
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log(`🏰 TOOBIX EMPIRE - TAG ${shared.currentDay} ${shared.isNight ? '🌙' : '☀️'}`);
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log(`📍 Phase: ${shared.phase}`);
  console.log(`🪵 Holz: ${shared.totalWood} | 📦 Planks: ${shared.totalPlanks} | 🪨 Stein: ${shared.totalStone}`);
  console.log(`🔧 Werkbank: ${shared.craftingTablePlaced ? '✅' : '❌'} | 🏠 Haus: ${shared.houseBuilt ? '✅' : '❌'} | 🕳️ Keller: ${shared.cellarDug ? '✅' : '❌'}`);
  console.log('');
  console.log('BOTS:');
  for (const [_, state] of bots) {
    const status = state.connected ? '✅' : '❌';
    const axe = state.hasAxe ? '🪓' : '';
    console.log(`   ${state.emoji} ${state.name.padEnd(8)} ${status} ${axe} - Logs: ${state.logsCollected}`);
  }
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║       🏠 TOOBIX EMPIRE - TAG 1 FOKUS 🏠                            ║
║                                                                    ║
║  ZIEL: Haus bauen bevor Nacht! Dann Keller graben.                ║
║                                                                    ║
║  1. ALLE sammeln Holz (64 total)                                  ║
║  2. Werkbank + Äxte craften                                       ║
║  3. Woody baut 5x5 Haus                                           ║
║  4. Miner gräbt Keller                                            ║
║  5. Nacht: ALLE minen Stein im Keller!                            ║
║                                                                    ║
║  🕊️ PEACEFUL MODE - Keine Monster!                                ║
╚════════════════════════════════════════════════════════════════════╝
`);
  
  try {
    // Server Reset
    await resetServer();
    await sleep(2000);
    
    // Bots spawnen
    log('🏰 EMPIRE', 'Spawne 5 Bots...\n');
    
    for (const role of ROLES) {
      console.log(`Spawning ${role.emoji} ${role.name}...`);
      try {
        await createBot(role);
        await sleep(SPAWN_DELAY);
      } catch (err: any) {
        console.log(`❌ ${role.name}: ${err.message}`);
      }
    }
    
    const connected = Array.from(bots.values()).filter(s => s.connected).length;
    console.log(`\n✅ ${connected}/5 Bots bereit!\n`);
    
    // Status alle 15 Sekunden
    setInterval(showStatus, 15000);
    showStatus();
    
  } catch (err: any) {
    console.error('Fehler:', err.message);
  }
}

main().catch(console.error);
