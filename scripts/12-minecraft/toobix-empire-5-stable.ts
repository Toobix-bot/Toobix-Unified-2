/**
 * 🏰 TOOBIX EMPIRE - 5 BOT STABLE EDITION
 * 
 * Optimiert für stabilen lokalen Server:
 * - 5 Bots statt 7 (weniger Server-Last)
 * - Server wird auf Tag 1 gesetzt vor Start
 * - Alle Bots können kämpfen + überleben
 * - Fokus auf die ersten 10 Tage
 * 
 * DIE 5 ROLLEN (alle überlebensfähig):
 * 1. 🦁 Alpha (Anführer/Allrounder) - Koordiniert, kann alles
 * 2. 🪓 Woody (Holzfäller/Builder) - Holz + Bau + Werkzeuge
 * 3. ⛏️ Miner (Bergarbeiter) - Stein, Kohle, Erze
 * 4. ⚔️ Guardian (Krieger/Jäger) - Kampf + Fleisch
 * 5. 🌾 Ranger (Farmer/Kundschafter) - Nahrung + Erkunden
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { mineflayer as mineflayerViewer } from 'prismarine-viewer';

// ═══════════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const SERVER_HOST = 'localhost';
const SERVER_PORT = 25565;
const STATUS_PORT = 8766;
const CENTER = { x: 0, z: 0 };
const SPAWN_DELAY = 8000; // 8 Sekunden zwischen Bots

// ═══════════════════════════════════════════════════════════════════
// DIE 5 EMPIRE ROLLEN
// ═══════════════════════════════════════════════════════════════════

interface EmpireRole {
  name: string;
  emoji: string;
  title: string;
  description: string;
  primaryTask: 'wood' | 'mine' | 'fight' | 'farm' | 'lead';
  canFight: boolean;
  canMine: boolean;
  canChop: boolean;
  canFarm: boolean;
}

const EMPIRE_ROLES: EmpireRole[] = [
  {
    name: 'Alpha',
    emoji: '🦁',
    title: 'Anführer',
    description: 'Koordiniert das Team, kann alles ein bisschen',
    primaryTask: 'lead',
    canFight: true,
    canMine: true,
    canChop: true,
    canFarm: true
  },
  {
    name: 'Woody',
    emoji: '🪓',
    title: 'Holzfäller',
    description: 'Sammelt Holz, baut Strukturen, stellt Werkzeuge her',
    primaryTask: 'wood',
    canFight: true,
    canMine: true,
    canChop: true,
    canFarm: false
  },
  {
    name: 'Miner',
    emoji: '⛏️',
    title: 'Bergarbeiter',
    description: 'Gräbt Stein, Kohle und Erze',
    primaryTask: 'mine',
    canFight: true,
    canMine: true,
    canChop: true,
    canFarm: false
  },
  {
    name: 'Guardian',
    emoji: '⚔️',
    title: 'Wächter',
    description: 'Beschützt das Team, jagt Tiere',
    primaryTask: 'fight',
    canFight: true,
    canMine: true,
    canChop: true,
    canFarm: false
  },
  {
    name: 'Ranger',
    emoji: '🌾',
    title: 'Ranger',
    description: 'Sammelt Nahrung, erkundet, pflanzt',
    primaryTask: 'farm',
    canFight: true,
    canMine: false,
    canChop: true,
    canFarm: true
  }
];

// ═══════════════════════════════════════════════════════════════════
// EMPIRE STATE
// ═══════════════════════════════════════════════════════════════════

interface EmpireState {
  day: number;
  phase: 'MORNING' | 'DAY' | 'EVENING' | 'NIGHT';
  bots: Map<string, BotState>;
  resources: {
    wood: number;
    stone: number;
    coal: number;
    food: number;
    iron: number;
  };
  goals: {
    day1: { wood: number; stone: number; shelter: boolean };
    day3: { tools: boolean; farm: boolean };
    day10: { base: boolean; mine: boolean };
  };
}

interface BotState {
  name: string;
  role: EmpireRole;
  bot: mineflayer.Bot | null;
  connected: boolean;
  position: { x: number; y: number; z: number } | null;
  health: number;
  food: number;
  inventory: Record<string, number>;
  currentTask: string;
  kills: number;
  deaths: number;
}

const empire: EmpireState = {
  day: 1,
  phase: 'MORNING',
  bots: new Map(),
  resources: { wood: 0, stone: 0, coal: 0, food: 0, iron: 0 },
  goals: {
    day1: { wood: 64, stone: 32, shelter: false },
    day3: { tools: false, farm: false },
    day10: { base: false, mine: false }
  }
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function log(prefix: string, msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${prefix}: ${msg}`);
}

function empireLog(msg: string) {
  log('🏰 EMPIRE', msg);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updatePhase(bot: mineflayer.Bot): void {
  const time = bot.time.timeOfDay;
  if (time < 6000) empire.phase = 'MORNING';
  else if (time < 12000) empire.phase = 'DAY';
  else if (time < 13000) empire.phase = 'EVENING';
  else empire.phase = 'NIGHT';
  
  empire.day = Math.floor(bot.time.day) + 1;
}

function isDaytime(bot: mineflayer.Bot): boolean {
  const time = bot.time.timeOfDay;
  return time < 12500; // Tag bis kurz vor Sonnenuntergang
}

function countItem(bot: mineflayer.Bot, ...names: string[]): number {
  let count = 0;
  for (const item of bot.inventory.items()) {
    if (names.some(n => item.name.includes(n))) {
      count += item.count;
    }
  }
  return count;
}

function hasWeapon(bot: mineflayer.Bot): boolean {
  return countItem(bot, 'sword', 'axe') > 0;
}

function hasTool(bot: mineflayer.Bot, type: string): boolean {
  return countItem(bot, type) > 0;
}

// ═══════════════════════════════════════════════════════════════════
// BOT CREATION
// ═══════════════════════════════════════════════════════════════════

async function createBot(role: EmpireRole): Promise<mineflayer.Bot> {
  const botName = `Toobix_${role.name}`;
  
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: botName,
    version: '1.20.1',
    hideErrors: false
  });
  
  // Plugins laden
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);
  
  const state: BotState = {
    name: role.name,
    role,
    bot,
    connected: false,
    position: null,
    health: 20,
    food: 20,
    inventory: {},
    currentTask: 'Spawning...',
    kills: 0,
    deaths: 0
  };
  
  empire.bots.set(role.name, state);
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${role.emoji} ${role.name}: Spawn timeout`));
    }, 30000);
    
    bot.once('spawn', async () => {
      clearTimeout(timeout);
      state.connected = true;
      log(`${role.emoji} ${role.name}`, 'Spawned!');
      
      // Movements konfigurieren
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      movements.canDig = true;
      movements.allow1by1towers = true;
      movements.scafoldingBlocks = [];
      bot.pathfinder.setMovements(movements);
      
      // Teleport zu 0/0
      try {
        bot.chat(`/tp ${botName} 0 ~ 0`);
        await sleep(1000);
        log(`${role.emoji} ${role.name}`, 'Teleported to 0/0!');
      } catch (e) {
        // Fallback: Laufen
      }
      
      // Events
      setupBotEvents(bot, role, state);
      
      // Work loop starten
      startWorkLoop(bot, role, state);
      
      resolve(bot);
    });
    
    bot.on('error', (err) => {
      clearTimeout(timeout);
      log(`${role.emoji} ${role.name}`, `Error: ${err.message}`);
      state.connected = false;
    });
    
    bot.on('kicked', (reason) => {
      log(`${role.emoji} ${role.name}`, `Kicked: ${reason}`);
      state.connected = false;
    });
    
    bot.on('end', () => {
      log(`${role.emoji} ${role.name}`, 'Disconnected');
      state.connected = false;
      
      // Auto-Reconnect nach 10 Sekunden
      setTimeout(() => {
        if (!state.connected) {
          log(`${role.emoji} ${role.name}`, 'Attempting reconnect...');
          createBot(role).catch(console.error);
        }
      }, 10000);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// BOT EVENTS
// ═══════════════════════════════════════════════════════════════════

function setupBotEvents(bot: mineflayer.Bot, role: EmpireRole, state: BotState) {
  // Keep-Alive: Alle 500ms eine Aktion
  setInterval(() => {
    if (!bot.entity) return;
    
    // Arm schwingen
    bot.swingArm('right');
    
    // Kopf bewegen
    const yaw = bot.entity.yaw + (Math.random() - 0.5) * 0.1;
    bot.look(yaw, bot.entity.pitch, false);
    
    // State updaten
    state.position = bot.entity.position.clone();
    state.health = bot.health;
    state.food = bot.food;
    
    // Phase updaten
    updatePhase(bot);
    
  }, 500);
  
  // Health tracking
  bot.on('health', () => {
    state.health = bot.health;
    state.food = bot.food;
    
    if (bot.health < 10) {
      log(`${role.emoji} ${role.name}`, `⚠️ Low health: ${bot.health}`);
    }
  });
  
  // Death
  bot.on('death', () => {
    state.deaths++;
    log(`${role.emoji} ${role.name}`, `💀 Died! (${state.deaths} deaths)`);
  });
  
  // Respawn
  bot.on('respawn', () => {
    log(`${role.emoji} ${role.name}`, '🔄 Respawned!');
    state.currentTask = 'Respawned';
  });
  
  // Entity spawn (für Kampf)
  bot.on('entitySpawn', (entity) => {
    if (!role.canFight) return;
    
    const hostileMobs = ['zombie', 'skeleton', 'spider', 'creeper', 'enderman'];
    if (entity.name && hostileMobs.includes(entity.name)) {
      const dist = bot.entity.position.distanceTo(entity.position);
      if (dist < 5) {
        log(`${role.emoji} ${role.name}`, `⚔️ ${entity.name} nearby!`);
      }
    }
  });
  
  // Collect item
  bot.on('playerCollect', (collector, collected) => {
    if (collector.username === bot.username) {
      // Ressourcen zählen
      updateResourceCount();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// WORK LOOP - DAS HERZ DES BOTS
// ═══════════════════════════════════════════════════════════════════

async function startWorkLoop(bot: mineflayer.Bot, role: EmpireRole, state: BotState) {
  log(`${role.emoji} ${role.name}`, 'Starting work loop...');
  
  while (state.connected) {
    try {
      await sleep(1000);
      if (!bot.entity) continue;
      
      // 1. PRIORITÄT: Überleben
      if (await handleSurvival(bot, role, state)) continue;
      
      // 2. PRIORITÄT: Kampf wenn nötig
      if (await handleCombat(bot, role, state)) continue;
      
      // 3. PRIORITÄT: Nacht-Sicherheit
      if (!isDaytime(bot)) {
        await handleNight(bot, role, state);
        continue;
      }
      
      // 4. Rollenspezifische Arbeit
      await handleRoleWork(bot, role, state);
      
    } catch (err: any) {
      // Fehler loggen aber weitermachen
      if (!err.message?.includes('interrupt')) {
        log(`${role.emoji} ${role.name}`, `Work error: ${err.message}`);
      }
      await sleep(2000);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// ÜBERLEBEN
// ═══════════════════════════════════════════════════════════════════

async function handleSurvival(bot: mineflayer.Bot, role: EmpireRole, state: BotState): Promise<boolean> {
  // Hunger stillen
  if (bot.food < 14) {
    const food = bot.inventory.items().find(i => 
      i.name.includes('beef') || i.name.includes('pork') || 
      i.name.includes('chicken') || i.name.includes('bread') ||
      i.name.includes('apple') || i.name.includes('carrot')
    );
    
    if (food) {
      state.currentTask = 'Eating...';
      await bot.equip(food, 'hand');
      await bot.consume();
      log(`${role.emoji} ${role.name}`, `🍖 Ate ${food.name}`);
      return true;
    }
  }
  
  // Low health = defensiv
  if (bot.health < 8) {
    state.currentTask = 'Hiding (low health)';
    // Weg von Mobs
    const nearbyMob = bot.nearestEntity(e => 
      e.type === 'hostile' && bot.entity.position.distanceTo(e.position) < 10
    );
    
    if (nearbyMob) {
      const awayDir = bot.entity.position.minus(nearbyMob.position).normalize();
      const target = bot.entity.position.offset(awayDir.x * 10, 0, awayDir.z * 10);
      bot.pathfinder.setGoal(new goals.GoalXZ(target.x, target.z));
      return true;
    }
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// KAMPF
// ═══════════════════════════════════════════════════════════════════

async function handleCombat(bot: mineflayer.Bot, role: EmpireRole, state: BotState): Promise<boolean> {
  if (!role.canFight) return false;
  
  // Finde naheste feindliche Entity
  const hostile = bot.nearestEntity(e => {
    if (e.type !== 'hostile' && e.type !== 'mob') return false;
    const hostileMobs = ['zombie', 'skeleton', 'spider', 'creeper'];
    return hostileMobs.includes(e.name || '');
  });
  
  if (!hostile) return false;
  
  const dist = bot.entity.position.distanceTo(hostile.position);
  
  // Creeper = weglaufen!
  if (hostile.name === 'creeper' && dist < 6) {
    state.currentTask = 'Fleeing creeper!';
    const awayDir = bot.entity.position.minus(hostile.position).normalize();
    const target = bot.entity.position.offset(awayDir.x * 15, 0, awayDir.z * 15);
    bot.pathfinder.setGoal(new goals.GoalXZ(target.x, target.z));
    log(`${role.emoji} ${role.name}`, '💨 Running from creeper!');
    return true;
  }
  
  // Andere Mobs = angreifen wenn nah genug
  if (dist < 4) {
    state.currentTask = `Fighting ${hostile.name}`;
    
    // Beste Waffe equippen
    const weapon = bot.inventory.items().find(i => 
      i.name.includes('sword') || i.name.includes('axe')
    );
    if (weapon) {
      await bot.equip(weapon, 'hand');
    }
    
    // Angreifen
    try {
      await bot.attack(hostile);
      log(`${role.emoji} ${role.name}`, `⚔️ Hit ${hostile.name}!`);
      
      // Prüfen ob tot
      await sleep(500);
      if (!hostile.isValid) {
        state.kills++;
        log(`${role.emoji} ${role.name}`, `💀 Killed ${hostile.name}! (${state.kills} kills)`);
      }
    } catch (e) {
      // Entity schon weg
    }
    
    return true;
  }
  
  // Mob nah aber nicht in Reichweite = nähern (nur Guardian)
  if (dist < 8 && role.primaryTask === 'fight') {
    state.currentTask = `Chasing ${hostile.name}`;
    bot.pathfinder.setGoal(new goals.GoalFollow(hostile, 2));
    return true;
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// NACHT-HANDLING
// ═══════════════════════════════════════════════════════════════════

async function handleNight(bot: mineflayer.Bot, role: EmpireRole, state: BotState) {
  state.currentTask = 'Night watch';
  
  // Guardian patrolliert
  if (role.primaryTask === 'fight') {
    state.currentTask = 'Night patrol';
    // Bleib in der Nähe von 0/0
    const dist = Math.sqrt(bot.entity.position.x ** 2 + bot.entity.position.z ** 2);
    if (dist > 15) {
      bot.pathfinder.setGoal(new goals.GoalXZ(0, 0));
    }
    return;
  }
  
  // Andere Bots: In der Nähe von 0/0 bleiben, auf der Hut sein
  const dist = Math.sqrt(bot.entity.position.x ** 2 + bot.entity.position.z ** 2);
  if (dist > 10) {
    bot.pathfinder.setGoal(new goals.GoalXZ(0, 0));
  }
  
  // Springen um wach zu bleiben
  if (Math.random() < 0.1) {
    bot.setControlState('jump', true);
    await sleep(100);
    bot.setControlState('jump', false);
  }
}

// ═══════════════════════════════════════════════════════════════════
// ROLLENSPEZIFISCHE ARBEIT
// ═══════════════════════════════════════════════════════════════════

async function handleRoleWork(bot: mineflayer.Bot, role: EmpireRole, state: BotState) {
  const mcData = require('minecraft-data')(bot.version);
  
  switch (role.primaryTask) {
    case 'wood':
      await doWoodWork(bot, role, state, mcData);
      break;
    case 'mine':
      await doMineWork(bot, role, state, mcData);
      break;
    case 'fight':
      await doFightWork(bot, role, state, mcData);
      break;
    case 'farm':
      await doFarmWork(bot, role, state, mcData);
      break;
    case 'lead':
      await doLeadWork(bot, role, state, mcData);
      break;
  }
}

// 🪓 HOLZFÄLLER ARBEIT
async function doWoodWork(bot: mineflayer.Bot, role: EmpireRole, state: BotState, mcData: any) {
  const woodCount = countItem(bot, 'log', 'wood');
  
  // Genug Holz? Planken/Sticks machen
  if (woodCount > 16) {
    state.currentTask = 'Crafting planks';
    // TODO: Crafting
    return;
  }
  
  // Baum suchen und fällen
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
  const logBlock = bot.findBlock({
    matching: logTypes.map(name => mcData.blocksByName[name]?.id).filter(Boolean),
    maxDistance: 32
  });
  
  if (logBlock) {
    state.currentTask = `Chopping ${logBlock.name}`;
    log(`${role.emoji} ${role.name}`, `🪓 Found ${logBlock.name} at ${logBlock.position}`);
    
    try {
      // Hingehen
      await bot.pathfinder.goto(new goals.GoalBlock(logBlock.position.x, logBlock.position.y, logBlock.position.z));
      
      // Axt equippen wenn vorhanden
      const axe = bot.inventory.items().find(i => i.name.includes('axe'));
      if (axe) await bot.equip(axe, 'hand');
      
      // Baum fällen mit collectBlock
      await (bot as any).collectBlock.collect(logBlock);
      log(`${role.emoji} ${role.name}`, `✅ Collected log!`);
      
      empire.resources.wood++;
      
    } catch (err: any) {
      log(`${role.emoji} ${role.name}`, `Wood error: ${err.message}`);
    }
  } else {
    state.currentTask = 'Searching for trees';
    // Wandere umher
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 10;
    const target = {
      x: bot.entity.position.x + Math.cos(angle) * dist,
      z: bot.entity.position.z + Math.sin(angle) * dist
    };
    bot.pathfinder.setGoal(new goals.GoalXZ(target.x, target.z));
    await sleep(3000);
  }
}

// ⛏️ BERGARBEITER ARBEIT
async function doMineWork(bot: mineflayer.Bot, role: EmpireRole, state: BotState, mcData: any) {
  const stoneCount = countItem(bot, 'cobblestone', 'stone');
  
  // Erst Holzwerkzeug sicherstellen
  if (!hasTool(bot, 'pickaxe')) {
    state.currentTask = 'Need pickaxe!';
    // Warte auf Woody
    await sleep(5000);
    return;
  }
  
  // Stein abbauen
  const stoneBlock = bot.findBlock({
    matching: [mcData.blocksByName.stone?.id, mcData.blocksByName.cobblestone?.id].filter(Boolean),
    maxDistance: 16
  });
  
  if (stoneBlock) {
    state.currentTask = `Mining ${stoneBlock.name}`;
    
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(stoneBlock.position.x, stoneBlock.position.y, stoneBlock.position.z));
      
      const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      
      await (bot as any).collectBlock.collect(stoneBlock);
      log(`${role.emoji} ${role.name}`, `✅ Mined stone!`);
      
      empire.resources.stone++;
      
    } catch (err: any) {
      log(`${role.emoji} ${role.name}`, `Mine error: ${err.message}`);
    }
  } else {
    state.currentTask = 'Searching for stone';
    // Grabe runter
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (below && (below.name === 'stone' || below.name === 'dirt' || below.name === 'grass_block')) {
      try {
        await bot.dig(below);
      } catch (e) {}
    }
    await sleep(2000);
  }
}

// ⚔️ GUARDIAN ARBEIT
async function doFightWork(bot: mineflayer.Bot, role: EmpireRole, state: BotState, mcData: any) {
  // Suche nach Tieren zum Jagen
  const animal = bot.nearestEntity(e => {
    const animals = ['cow', 'pig', 'sheep', 'chicken'];
    return animals.includes(e.name || '');
  });
  
  if (animal) {
    const dist = bot.entity.position.distanceTo(animal.position);
    
    if (dist < 3) {
      state.currentTask = `Hunting ${animal.name}`;
      await bot.attack(animal);
      log(`${role.emoji} ${role.name}`, `🏹 Hunting ${animal.name}!`);
      
      await sleep(500);
      if (!animal.isValid) {
        log(`${role.emoji} ${role.name}`, `🍖 Got food from ${animal.name}!`);
        empire.resources.food++;
      }
    } else if (dist < 20) {
      state.currentTask = `Chasing ${animal.name}`;
      bot.pathfinder.setGoal(new goals.GoalFollow(animal, 2));
    }
    return;
  }
  
  // Keine Tiere = patrollieren
  state.currentTask = 'Patrolling';
  const angle = Math.random() * Math.PI * 2;
  const dist = 5 + Math.random() * 10;
  const target = {
    x: Math.cos(angle) * dist,
    z: Math.sin(angle) * dist
  };
  bot.pathfinder.setGoal(new goals.GoalXZ(target.x, target.z));
  await sleep(5000);
}

// 🌾 RANGER ARBEIT
async function doFarmWork(bot: mineflayer.Bot, role: EmpireRole, state: BotState, mcData: any) {
  // Suche nach Beeren, Äpfeln, etc.
  const collectibles = ['sweet_berry_bush', 'wheat', 'carrot', 'potato'];
  
  for (const item of collectibles) {
    const block = bot.findBlock({
      matching: mcData.blocksByName[item]?.id,
      maxDistance: 32
    });
    
    if (block) {
      state.currentTask = `Collecting ${item}`;
      try {
        await bot.pathfinder.goto(new goals.GoalBlock(block.position.x, block.position.y, block.position.z));
        await (bot as any).collectBlock.collect(block);
        log(`${role.emoji} ${role.name}`, `🌾 Collected ${item}!`);
        empire.resources.food++;
        return;
      } catch (e) {}
    }
  }
  
  // Nichts gefunden = erkunden
  state.currentTask = 'Exploring';
  const angle = Math.random() * Math.PI * 2;
  const dist = 15 + Math.random() * 20;
  const target = {
    x: Math.cos(angle) * dist,
    z: Math.sin(angle) * dist
  };
  bot.pathfinder.setGoal(new goals.GoalXZ(target.x, target.z));
  await sleep(5000);
}

// 🦁 ANFÜHRER ARBEIT
async function doLeadWork(bot: mineflayer.Bot, role: EmpireRole, state: BotState, mcData: any) {
  // Anführer macht das was gerade am meisten gebraucht wird
  
  // Tag 1: Holz ist Priorität
  if (empire.day === 1 && empire.resources.wood < 32) {
    await doWoodWork(bot, role, state, mcData);
    return;
  }
  
  // Tag 1: Dann Stein
  if (empire.day === 1 && empire.resources.stone < 16) {
    await doMineWork(bot, role, state, mcData);
    return;
  }
  
  // Sonst: Koordinieren (in der Mitte bleiben)
  state.currentTask = 'Coordinating team';
  const dist = Math.sqrt(bot.entity.position.x ** 2 + bot.entity.position.z ** 2);
  if (dist > 5) {
    bot.pathfinder.setGoal(new goals.GoalXZ(0, 0));
  }
  
  await sleep(3000);
}

// ═══════════════════════════════════════════════════════════════════
// RESSOURCEN ZÄHLEN
// ═══════════════════════════════════════════════════════════════════

function updateResourceCount() {
  let totalWood = 0;
  let totalStone = 0;
  let totalCoal = 0;
  let totalFood = 0;
  let totalIron = 0;
  
  for (const [_, state] of empire.bots) {
    if (!state.bot) continue;
    
    totalWood += countItem(state.bot, 'log', 'plank');
    totalStone += countItem(state.bot, 'cobblestone', 'stone');
    totalCoal += countItem(state.bot, 'coal');
    totalFood += countItem(state.bot, 'beef', 'pork', 'chicken', 'bread', 'apple');
    totalIron += countItem(state.bot, 'iron');
  }
  
  empire.resources = { wood: totalWood, stone: totalStone, coal: totalCoal, food: totalFood, iron: totalIron };
}

// ═══════════════════════════════════════════════════════════════════
// STATUS API
// ═══════════════════════════════════════════════════════════════════

function startStatusServer() {
  Bun.serve({
    port: STATUS_PORT,
    fetch(req) {
      updateResourceCount();
      
      const status = {
        empire: {
          day: empire.day,
          phase: empire.phase,
          resources: empire.resources,
          goals: empire.goals
        },
        bots: Array.from(empire.bots.values()).map(s => ({
          name: s.name,
          role: s.role.title,
          emoji: s.role.emoji,
          connected: s.connected,
          health: s.health,
          food: s.food,
          task: s.currentTask,
          kills: s.kills,
          deaths: s.deaths,
          position: s.position
        }))
      };
      
      return new Response(JSON.stringify(status, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
  
  empireLog(`📊 Status API: http://localhost:${STATUS_PORT}`);
}

// ═══════════════════════════════════════════════════════════════════
// STATUS DISPLAY
// ═══════════════════════════════════════════════════════════════════

function showStatus() {
  updateResourceCount();
  
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('🏰 TOOBIX EMPIRE - 5 BOT STABLE EDITION');
  console.log('══════════════════════════════════════════════════════════════════════\n');
  
  console.log(`Day ${empire.day} | ${empire.phase === 'NIGHT' ? '🌙' : '☀️'} ${empire.phase}`);
  
  const connectedCount = Array.from(empire.bots.values()).filter(s => s.connected).length;
  console.log(`Bots: ${connectedCount}/5\n`);
  
  console.log('RESOURCES:');
  console.log(`   Wood: ${empire.resources.wood}/${empire.goals.day1.wood}`);
  console.log(`   Stone: ${empire.resources.stone}/${empire.goals.day1.stone}`);
  console.log(`   Coal: ${empire.resources.coal}`);
  console.log(`   Food: ${empire.resources.food}`);
  console.log(`   Iron: ${empire.resources.iron}\n`);
  
  console.log('BOTS:');
  for (const [_, state] of empire.bots) {
    const status = state.connected ? '✅' : '❌';
    const health = state.connected ? `❤️${Math.round(state.health)}` : '';
    console.log(`   ${state.role.emoji} ${state.name.padEnd(8)} ${status} ${health} - ${state.currentTask}`);
  }
  
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

// ═══════════════════════════════════════════════════════════════════
// SERVER TAG 1 SETZEN
// ═══════════════════════════════════════════════════════════════════

async function resetToDay1() {
  empireLog('⏰ Resetting server to Day 1 (morning)...');
  
  // Temporärer Bot für Commands
  const tempBot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'Toobix_Setup',
    version: '1.20.1'
  });
  
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      tempBot.quit();
      reject(new Error('Setup bot timeout'));
    }, 15000);
    
    tempBot.once('spawn', async () => {
      await sleep(1000);
      
      // Zeit auf Tag setzen (1000 = früher Morgen)
      tempBot.chat('/time set 1000');
      await sleep(500);
      
      // Wetter klar
      tempBot.chat('/weather clear');
      await sleep(500);
      
      // Schwierigkeit auf Normal
      tempBot.chat('/difficulty normal');
      await sleep(500);
      
      // Spawn bei 0/0 setzen
      tempBot.chat('/setworldspawn 0 ~ 0');
      await sleep(500);
      
      clearTimeout(timeout);
      empireLog('✅ Server reset to Day 1, morning, clear weather!');
      
      tempBot.quit();
      resolve();
    });
    
    tempBot.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║       🏰 TOOBIX EMPIRE - 5 BOT STABLE EDITION 🏰                   ║
║                                                                    ║
║  5 optimierte Bots für stabilen lokalen Server:                   ║
║                                                                    ║
║  🦁 Alpha    - Anführer, kann alles                               ║
║  🪓 Woody    - Holzfäller & Builder                               ║
║  ⛏️ Miner    - Bergarbeiter                                       ║
║  ⚔️ Guardian - Wächter & Jäger                                    ║
║  🌾 Ranger   - Farmer & Kundschafter                              ║
║                                                                    ║
║  Tag 1 Ziele: 64 Wood, 32 Stone, Überleben!                       ║
╚════════════════════════════════════════════════════════════════════╝
`);
  
  try {
    // 1. Server auf Tag 1 setzen
    await resetToDay1();
    await sleep(2000);
    
    // 2. Status Server starten
    startStatusServer();
    
    // 3. Bots spawnen
    empireLog('Spawning 5 Empire bots...\n');
    
    for (const role of EMPIRE_ROLES) {
      console.log(`Spawning ${role.emoji} ${role.name} (${role.title})...`);
      
      try {
        await createBot(role);
        await sleep(SPAWN_DELAY);
      } catch (err: any) {
        console.log(`❌ Failed to spawn ${role.name}: ${err.message}`);
      }
    }
    
    const connected = Array.from(empire.bots.values()).filter(s => s.connected).length;
    console.log(`\n══════════════════════════════════════════════════════════════════════`);
    console.log(`✅ ${connected}/5 Bots ready for Day 1!`);
    console.log(`══════════════════════════════════════════════════════════════════════\n`);
    
    // 4. Status alle 30 Sekunden anzeigen
    setInterval(showStatus, 30000);
    showStatus();
    
  } catch (err: any) {
    console.error('Empire startup error:', err.message);
  }
}

// Start!
main().catch(console.error);
