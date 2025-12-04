// ============================================================
// TOOBIX DAY ONE BOT - Strukturierter erster Tag
// ============================================================
// 
// PLAN FÜR TAG 1:
// ================
// 1. ORIENTIERUNG (30 Sekunden)
//    - Umschauen, Position merken
//    - Tiere in der Nähe? Holz? Wasser?
//
// 2. HOLZ SAMMELN (Priorität 1)
//    - Mindestens 16 Holz für Grundwerkzeuge
//    - Setzlinge aufsammeln!
//
// 3. ERSTE WERKZEUGE
//    - Werkbank craften
//    - Holzspitzhacke (für Stein)
//    - Holzschwert (Schutz)
//    - Holzaxt (schneller Holz)
//
// 4. STEIN SAMMELN
//    - Mindestens 20 Cobblestone
//    - Nach Kohle Ausschau halten!
//
// 5. STEIN-WERKZEUGE
//    - Steinspitzhacke
//    - Steinaxt
//    - Steinschwert
//    - Steinschaufel
//
// 6. HAUS BAUEN (vor Nacht!)
//    - 7x7 Grundfläche
//    - Erde/Holz/Stein
//    - Tür!
//    - Werkbank, Ofen, Truhe drin
//
// 7. NACHT-AKTIVITÄTEN
//    - Keller graben (sicher nach unten)
//    - Mehr Stein/Kohle
//    - Ofen nutzen
//
// 8. PARALLEL-ZIELE
//    - Weizen/Samen sammeln
//    - Tiere für Fleisch
//    - Beeren finden
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

const CONFIG = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565'),
  username: process.env.BOT_NAME || 'ToobixDayOne',
  version: '1.20.1'
};

// ==================== RÄUMLICHES BEWUSSTSEIN ====================
interface SpatialMemory {
  spawnPoint: { x: number, y: number, z: number } | null;
  homeBase: { x: number, y: number, z: number } | null;
  knownTrees: Array<{ x: number, y: number, z: number, type: string }>;
  knownAnimals: Array<{ x: number, y: number, z: number, type: string }>;
  knownWater: Array<{ x: number, y: number, z: number }>;
  knownCaves: Array<{ x: number, y: number, z: number }>;
  exploredAreas: Set<string>; // "x,z" chunks
}

// ==================== ZEITBEWUSSTSEIN ====================
interface TimeAwareness {
  gameStartTime: number;
  realStartTime: number;
  currentPhase: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  dayNumber: number;
  ticksInCurrentDay: number;
}

// ==================== INVENTAR TRACKING ====================
interface InventoryGoals {
  wood: { current: number, goal: number, priority: number };
  cobblestone: { current: number, goal: number, priority: number };
  coal: { current: number, goal: number, priority: number };
  dirt: { current: number, goal: number, priority: number };
  seeds: { current: number, goal: number, priority: number };
  food: { current: number, goal: number, priority: number };
  saplings: { current: number, goal: number, priority: number };
}

// ==================== AUFGABEN-SYSTEM ====================
type TaskType = 
  | 'scout'           // Umgebung erkunden
  | 'gather_wood'     // Holz sammeln
  | 'craft_tools'     // Werkzeuge craften
  | 'gather_stone'    // Stein sammeln
  | 'build_shelter'   // Haus bauen
  | 'hunt_food'       // Tiere jagen
  | 'gather_seeds'    // Samen sammeln
  | 'mine_basement'   // Keller graben
  | 'smelt'           // Ofen benutzen
  | 'wait_night'      // Nacht abwarten (sicher)
  | 'explore';        // Erkunden

interface Task {
  type: TaskType;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  requirements: string[];
  estimatedTime: number; // in game ticks
}

// ==================== BOT STATE ====================
interface BotState {
  spatial: SpatialMemory;
  time: TimeAwareness;
  inventory: InventoryGoals;
  tasks: Task[];
  currentTask: Task | null;
  hasWorkbench: boolean;
  hasFurnace: boolean;
  hasChest: boolean;
  hasShelter: boolean;
  toolsLevel: 'none' | 'wood' | 'stone' | 'iron';
}

const state: BotState = {
  spatial: {
    spawnPoint: null,
    homeBase: null,
    knownTrees: [],
    knownAnimals: [],
    knownWater: [],
    knownCaves: [],
    exploredAreas: new Set()
  },
  time: {
    gameStartTime: 0,
    realStartTime: Date.now(),
    currentPhase: 'morning',
    dayNumber: 1,
    ticksInCurrentDay: 0
  },
  inventory: {
    wood: { current: 0, goal: 20, priority: 10 },
    cobblestone: { current: 0, goal: 32, priority: 7 },
    coal: { current: 0, goal: 16, priority: 6 },
    dirt: { current: 0, goal: 64, priority: 4 },
    seeds: { current: 0, goal: 16, priority: 3 },
    food: { current: 0, goal: 8, priority: 8 },
    saplings: { current: 0, goal: 8, priority: 5 }
  },
  tasks: [],
  currentTask: null,
  hasWorkbench: false,
  hasFurnace: false,
  hasChest: false,
  hasShelter: false,
  toolsLevel: 'none'
};

// ==================== LOGGING ====================
function log(category: string, message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  const phase = state.time.currentPhase.toUpperCase();
  console.log(`[${time}][${phase}][${category}] ${message}`);
}

// ==================== BOT CREATION ====================
let bot: mineflayer.Bot;
let mcData: any;

function createBot() {
  log('SYSTEM', 'Starte Toobix Day One Bot...');
  
  bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);
  
  setupEventHandlers();
}

function setupEventHandlers() {
  bot.once('spawn', onSpawn);
  bot.on('time', onTimeUpdate);
  bot.on('health', onHealthChange);
  bot.on('death', onDeath);
  bot.on('chat', onChat);
  bot.on('error', (err) => log('ERROR', err.message));
  bot.on('kicked', (reason) => {
    log('KICKED', reason.toString());
    setTimeout(() => process.exit(1), 10000);
  });
  bot.on('end', () => {
    log('DISCONNECT', 'Verbindung verloren, reconnecting...');
    setTimeout(() => process.exit(1), 5000);
  });
}

// ==================== EVENT HANDLERS ====================

let isFirstSpawn = true;

async function onSpawn() {
  log('SPAWN', `Position: ${bot.entity.position.toString()}`);
  
  // Initialisierung
  mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot);
  movements.canDig = true;
  movements.allowParkour = false;
  movements.allow1by1towers = false;
  movements.canOpenDoors = true;
  movements.scafoldingBlocks = [];
  bot.pathfinder.setMovements(movements);
  
  // Spawn-Punkt merken (RÄUMLICHES BEWUSSTSEIN)
  state.spatial.spawnPoint = {
    x: Math.floor(bot.entity.position.x),
    y: Math.floor(bot.entity.position.y),
    z: Math.floor(bot.entity.position.z)
  };
  log('SPATIAL', `Spawn-Punkt gemerkt: ${JSON.stringify(state.spatial.spawnPoint)}`);
  
  // ========== NUR BEIM ERSTEN SPAWN: Server konfigurieren ==========
  if (isFirstSpawn) {
    isFirstSpawn = false;
    log('SETUP', '🌅 Erster Spawn - Konfiguriere Tag 1 Bedingungen...');
    
    // Warte kurz bevor wir Commands senden
    await sleep(2000);
    
    // Setze faire Startbedingungen via Chat-Commands
    bot.chat('/gamerule keepInventory true');
    await sleep(500);
    bot.chat('/time set 0');  // Morgen! Voller Tag zum Arbeiten
    await sleep(500);
    bot.chat('/weather clear 24000');  // Klares Wetter für Tag 1
    await sleep(500);
    bot.chat('/gamerule doDaylightCycle true');
    await sleep(500);
    bot.chat('/difficulty normal');
    await sleep(500);
    
    log('SETUP', '✅ Gamerules gesetzt: keepInventory=true, Zeit=Morgen, Wetter=Klar');
    bot.chat('🌅 Tag 1 Start! Zeit: Morgen, Wetter: Klar, keepInventory: An');
    
    // Reset state für frischen Start
    state.time.gameStartTime = 0;
    state.time.currentPhase = 'morning';
    state.time.dayNumber = 1;
    
    // Warte bis Commands verarbeitet
    await sleep(2000);
  }
  
  // Startzeit merken (ZEITBEWUSSTSEIN)
  state.time.gameStartTime = bot.time.timeOfDay;
  log('TIME', `Spielzeit beim Start: ${state.time.gameStartTime} Ticks (${state.time.currentPhase})`);
  
  // Erste Nachricht
  setTimeout(() => {
    bot.chat('Tag 1 beginnt! Erst schauen, dann Holz, dann Werkzeuge...');
  }, 1000);
  
  // PHASE 1: Orientierung
  setTimeout(() => startDayOnePlan(), 3000);
}

function onTimeUpdate() {
  const time = bot.time.timeOfDay;
  state.time.ticksInCurrentDay = time;
  
  // Phase bestimmen
  if (time >= 0 && time < 6000) {
    state.time.currentPhase = 'morning';
  } else if (time >= 6000 && time < 12000) {
    state.time.currentPhase = 'midday';
  } else if (time >= 12000 && time < 13000) {
    state.time.currentPhase = 'afternoon';
  } else if (time >= 13000 && time < 18000) {
    state.time.currentPhase = 'evening';
  } else {
    state.time.currentPhase = 'night';
  }
}

function onHealthChange() {
  if (bot.health <= 5) {
    log('HEALTH', `Niedrige HP: ${bot.health}! Fliehe...`);
    // TODO: Flucht-Logik
  }
}

function onDeath() {
  log('DEATH', 'Gestorben! Warte auf Respawn...');
  state.currentTask = null;
}

function onChat(username: string, message: string) {
  if (username === bot.username) return;
  
  const lower = message.toLowerCase();
  if (lower.includes('status')) {
    reportStatus();
  } else if (lower.includes('inventar') || lower.includes('inventory')) {
    reportInventory();
  } else if (lower.includes('plan')) {
    reportPlan();
  }
}

// ==================== STATUS REPORTS ====================

function reportStatus() {
  const uptime = Math.floor((Date.now() - state.time.realStartTime) / 1000 / 60);
  bot.chat(`Tag ${state.time.dayNumber}, Phase: ${state.time.currentPhase}, Uptime: ${uptime}min`);
}

function reportInventory() {
  bot.chat(`Holz: ${state.inventory.wood.current}/${state.inventory.wood.goal}`);
  bot.chat(`Stein: ${state.inventory.cobblestone.current}/${state.inventory.cobblestone.goal}`);
  bot.chat(`Essen: ${state.inventory.food.current}`);
}

function reportPlan() {
  bot.chat(`Aktuelle Aufgabe: ${state.currentTask?.type || 'keine'}`);
  bot.chat(`Werkzeuge: ${state.toolsLevel}, Shelter: ${state.hasShelter}`);
}

// ==================== TAG 1 PLAN ====================

async function startDayOnePlan() {
  log('PLAN', '=== TAG 1 BEGINNT ===');
  
  // Definiere alle Aufgaben für Tag 1
  state.tasks = [
    { type: 'scout', priority: 10, status: 'pending', requirements: [], estimatedTime: 200 },
    { type: 'gather_wood', priority: 9, status: 'pending', requirements: [], estimatedTime: 600 },
    { type: 'craft_tools', priority: 8, status: 'pending', requirements: ['wood >= 8'], estimatedTime: 100 },
    { type: 'gather_stone', priority: 7, status: 'pending', requirements: ['hasWoodPickaxe'], estimatedTime: 400 },
    { type: 'craft_tools', priority: 6, status: 'pending', requirements: ['cobblestone >= 12'], estimatedTime: 100 },
    { type: 'build_shelter', priority: 5, status: 'pending', requirements: ['hasStoneTools'], estimatedTime: 800 },
    { type: 'hunt_food', priority: 4, status: 'pending', requirements: [], estimatedTime: 300 },
  ];
  
  // Starte Hauptschleife
  mainLoop();
}

// ==================== NACHT-ÜBERLEBENS-SYSTEM ====================
let isHidingFromNight = false;
let nightHolePosition: { x: number, y: number, z: number } | null = null;

async function checkNightSurvival(): Promise<boolean> {
  const time = bot.time.timeOfDay;
  const isNight = time >= 13000 || time < 1000; // Abend bis früher Morgen
  const isDusk = time >= 12000 && time < 13000; // Dämmerung - Zeit sich zu verstecken!
  
  // Wenn wir schon ein Shelter haben, ist alles gut
  if (state.hasShelter) {
    return false;
  }
  
  // Bei Dämmerung: Warnung und Vorbereitung
  if (isDusk && !isHidingFromNight) {
    log('NIGHT', '🌆 Dämmerung! Suche Versteck...');
    bot.chat('Die Sonne geht unter... ich muss mich verstecken!');
    await digNightHole();
    return true;
  }
  
  // Bei Nacht: Im Loch bleiben
  if (isNight && isHidingFromNight) {
    log('NIGHT', '🌙 Nacht - bleibe im Versteck sicher');
    return true;
  }
  
  // Morgen! Aus dem Loch kommen
  if (!isNight && !isDusk && isHidingFromNight) {
    log('NIGHT', '🌅 Morgen! Komme aus dem Versteck');
    bot.chat('Die Sonne ist da! Weiter gehts!');
    await exitNightHole();
    isHidingFromNight = false;
    return false;
  }
  
  return false;
}

async function digNightHole() {
  log('NIGHT', '⛏️ Grabe Notfall-Versteck...');
  isHidingFromNight = true;
  
  try {
    const pos = bot.entity.position;
    nightHolePosition = {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      z: Math.floor(pos.z)
    };
    
    // Grabe 3 Blöcke nach unten
    for (let i = 0; i < 3; i++) {
      const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (blockBelow && blockBelow.name !== 'air' && blockBelow.name !== 'water') {
        await bot.dig(blockBelow);
        await sleep(100);
      }
    }
    
    // Warte kurz bis wir gefallen sind
    await sleep(500);
    
    // Schließe das Loch über uns mit Erde
    const dirtItem = bot.inventory.items().find(i => 
      i.name === 'dirt' || i.name === 'cobblestone' || i.name.includes('planks')
    );
    
    if (dirtItem) {
      await bot.equip(dirtItem, 'hand');
      const blockAbove = bot.blockAt(bot.entity.position.offset(0, 2, 0));
      if (blockAbove && blockAbove.name === 'air') {
        try {
          const referenceBlock = bot.blockAt(bot.entity.position.offset(0, 1, 0));
          if (referenceBlock) {
            await bot.placeBlock(referenceBlock, new (require('vec3'))(0, 1, 0));
          }
        } catch (e) {
          // Platzieren fehlgeschlagen, nicht schlimm
        }
      }
    }
    
    log('NIGHT', '✅ Sicher im Erdloch! Warte auf Morgen...');
    bot.chat('Bin im Erdloch! Warte auf Sonnenaufgang...');
    
    // Im Loch: Steine abbauen wenn möglich
    while (isHidingFromNight && (bot.time.timeOfDay >= 13000 || bot.time.timeOfDay < 1000)) {
      await sleep(5000);
      
      // Mine stones around us
      await mineAroundHole();
      
      const time = bot.time.timeOfDay;
      if (time >= 1000 && time < 13000) {
        log('NIGHT', '🌅 Morgen erkannt!');
        break;
      }
    }
    
  } catch (err) {
    log('ERROR', `Erdloch-Fehler: ${(err as Error).message}`);
  }
}

async function mineAroundHole() {
  // Baue Steine um uns herum ab während wir warten
  const directions = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: -1, z: 0 }
  ];
  
  for (const dir of directions) {
    const block = bot.blockAt(bot.entity.position.offset(dir.x, dir.y, dir.z));
    if (block && (block.name === 'stone' || block.name === 'cobblestone' || block.name === 'coal_ore')) {
      try {
        log('NIGHT', `⛏️ Baue ${block.name} im Versteck ab`);
        await bot.dig(block);
        updateInventory();
        await sleep(500);
      } catch (e) {
        // Konnte nicht abbauen
      }
    }
  }
}

async function exitNightHole() {
  log('NIGHT', '🪜 Komme aus dem Erdloch...');
  
  try {
    // Grabe nach oben oder baue Treppe
    for (let i = 0; i < 4; i++) {
      const blockAbove = bot.blockAt(bot.entity.position.offset(0, 2, 0));
      if (blockAbove && blockAbove.name !== 'air') {
        await bot.dig(blockAbove);
      }
      
      // Springe und platziere Block unter uns
      const dirtItem = bot.inventory.items().find(i => 
        i.name === 'dirt' || i.name === 'cobblestone'
      );
      
      if (dirtItem) {
        bot.setControlState('jump', true);
        await sleep(200);
        try {
          await bot.equip(dirtItem, 'hand');
          const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
          if (below && below.name === 'air') {
            // Finde einen festen Block zum Platzieren
            const ref = bot.blockAt(bot.entity.position.offset(0, -2, 0));
            if (ref && ref.name !== 'air') {
              await bot.placeBlock(ref, new (require('vec3'))(0, 1, 0));
            }
          }
        } catch (e) {}
        bot.setControlState('jump', false);
        await sleep(300);
      }
    }
    
    nightHolePosition = null;
  } catch (err) {
    log('ERROR', `Exit-Hole-Fehler: ${(err as Error).message}`);
  }
}

// ==================== MAIN LOOP ====================

async function mainLoop() {
  log('LOOP', 'Hauptschleife gestartet');
  
  while (true) {
    try {
      await sleep(2000);
      
      // PRIORITÄT 1: Nachtüberleben!
      const hidingFromNight = await checkNightSurvival();
      if (hidingFromNight) {
        continue; // Bleib im Versteck
      }
      
      // Inventar aktualisieren
      updateInventory();
      
      // Nächste Aufgabe wählen
      const nextTask = selectNextTask();
      
      if (nextTask && nextTask !== state.currentTask) {
        state.currentTask = nextTask;
        nextTask.status = 'active';
        log('TASK', `Starte Aufgabe: ${nextTask.type}`);
      }
      
      // Aufgabe ausführen
      if (state.currentTask) {
        await executeTask(state.currentTask);
      }
      
    } catch (err) {
      log('ERROR', `Loop-Fehler: ${(err as Error).message}`);
      await sleep(3000);
    }
  }
}

function selectNextTask(): Task | null {
  // Wähle Aufgabe mit höchster Priorität die noch pending ist
  const pending = state.tasks
    .filter(t => t.status === 'pending')
    .sort((a, b) => b.priority - a.priority);
  
  if (pending.length === 0) return null;
  
  // Prüfe ob Requirements erfüllt
  for (const task of pending) {
    if (checkRequirements(task)) {
      return task;
    }
  }
  
  return pending[0]; // Fallback: höchste Priorität
}

function checkRequirements(task: Task): boolean {
  for (const req of task.requirements) {
    if (req.includes('wood >=')) {
      const needed = parseInt(req.split('>=')[1]);
      if (state.inventory.wood.current < needed) return false;
    }
    if (req.includes('cobblestone >=')) {
      const needed = parseInt(req.split('>=')[1]);
      if (state.inventory.cobblestone.current < needed) return false;
    }
    if (req === 'hasWoodPickaxe') {
      if (state.toolsLevel === 'none') return false;
    }
    if (req === 'hasStoneTools') {
      if (state.toolsLevel !== 'stone' && state.toolsLevel !== 'iron') return false;
    }
  }
  return true;
}

// ==================== TASK EXECUTION ====================

async function executeTask(task: Task) {
  switch (task.type) {
    case 'scout':
      await doScout();
      break;
    case 'gather_wood':
      await doGatherWood();
      break;
    case 'craft_tools':
      await doCraftTools();
      break;
    case 'gather_stone':
      await doGatherStone();
      break;
    case 'build_shelter':
      await doBuildShelter();
      break;
    case 'hunt_food':
      await doHuntFood();
      break;
    default:
      log('TASK', `Unbekannte Aufgabe: ${task.type}`);
  }
}

// ==================== AUFGABEN-IMPLEMENTIERUNG ====================

async function doScout() {
  log('SCOUT', 'Schaue mich um...');
  
  // 360 Grad Drehung um Umgebung zu scannen
  const startYaw = bot.entity.yaw;
  
  for (let i = 0; i < 8; i++) {
    // Drehe Bot
    await bot.look(startYaw + (i * Math.PI / 4), 0);
    await sleep(500);
    
    // Scanne nach Ressourcen
    scanForResources();
  }
  
  // Berichte Ergebnisse
  log('SCOUT', `Gefunden: ${state.spatial.knownTrees.length} Bäume, ${state.spatial.knownAnimals.length} Tiere`);
  
  if (state.currentTask) {
    state.currentTask.status = 'completed';
  }
}

function scanForResources() {
  if (!mcData) return;
  
  // Suche Bäume
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
  for (const logType of logTypes) {
    const blockId = mcData.blocksByName[logType]?.id;
    if (!blockId) continue;
    
    const logs = bot.findBlocks({
      matching: blockId,
      maxDistance: 32,
      count: 10
    });
    
    for (const pos of logs) {
      const key = `${pos.x},${pos.y},${pos.z}`;
      if (!state.spatial.knownTrees.find(t => `${t.x},${t.y},${t.z}` === key)) {
        state.spatial.knownTrees.push({ x: pos.x, y: pos.y, z: pos.z, type: logType });
      }
    }
  }
  
  // Suche Tiere
  for (const entity of Object.values(bot.entities)) {
    if (['cow', 'pig', 'sheep', 'chicken'].includes(entity.name || '')) {
      const pos = entity.position;
      state.spatial.knownAnimals.push({
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z),
        type: entity.name || 'unknown'
      });
    }
  }
  
  // Suche Wasser
  const waterId = mcData.blocksByName.water?.id;
  if (waterId) {
    const water = bot.findBlocks({ matching: waterId, maxDistance: 32, count: 5 });
    for (const pos of water) {
      state.spatial.knownWater.push({ x: pos.x, y: pos.y, z: pos.z });
    }
  }
}

async function doGatherWood() {
  if (state.inventory.wood.current >= state.inventory.wood.goal) {
    log('WOOD', `Holzziel erreicht: ${state.inventory.wood.current}`);
    if (state.currentTask) state.currentTask.status = 'completed';
    return;
  }
  
  // Finde nächsten bekannten Baum
  if (state.spatial.knownTrees.length === 0) {
    log('WOOD', 'Keine Bäume bekannt, suche...');
    scanForResources();
    if (state.spatial.knownTrees.length === 0) {
      await explore();
      return;
    }
  }
  
  // Sortiere nach Entfernung
  const pos = bot.entity.position;
  state.spatial.knownTrees.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.x - pos.x, 2) + Math.pow(a.z - pos.z, 2));
    const distB = Math.sqrt(Math.pow(b.x - pos.x, 2) + Math.pow(b.z - pos.z, 2));
    return distA - distB;
  });
  
  const tree = state.spatial.knownTrees[0];
  log('WOOD', `Gehe zu Baum bei ${tree.x}, ${tree.y}, ${tree.z}`);
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tree.x, tree.y, tree.z, 1));
    
    const block = bot.blockAt(new (require('vec3'))(tree.x, tree.y, tree.z));
    if (block && block.name.includes('log')) {
      await bot.dig(block);
      log('WOOD', 'Holz abgebaut!');
      
      // Entferne aus bekannten Bäumen
      state.spatial.knownTrees.shift();
      
      // Sammle Drops (Setzlinge!)
      await sleep(500);
      await collectNearbyItems();
    } else {
      // Baum existiert nicht mehr
      state.spatial.knownTrees.shift();
    }
  } catch (e) {
    log('WOOD', `Konnte Baum nicht erreichen: ${(e as Error).message}`);
    state.spatial.knownTrees.shift();
  }
}

async function doCraftTools() {
  log('CRAFT', 'Versuche Werkzeuge zu craften...');
  
  // Prüfe ob wir genug Holz haben
  const logs = bot.inventory.items().filter(i => i.name.includes('log'));
  const totalLogs = logs.reduce((sum, i) => sum + i.count, 0);
  
  if (totalLogs < 4) {
    log('CRAFT', 'Nicht genug Holz zum Craften');
    return;
  }
  
  try {
    // 1. Logs zu Planks
    log('CRAFT', 'Crafte Planks...');
    const planksRecipe = bot.recipesFor(mcData.itemsByName.oak_planks?.id)?.[0];
    if (planksRecipe) {
      await bot.craft(planksRecipe, 4);
    }
    
    // 2. Planks zu Sticks
    log('CRAFT', 'Crafte Sticks...');
    const sticksRecipe = bot.recipesFor(mcData.itemsByName.stick?.id)?.[0];
    if (sticksRecipe) {
      await bot.craft(sticksRecipe, 1);
    }
    
    // 3. Crafting Table
    if (!state.hasWorkbench) {
      log('CRAFT', 'Crafte Werkbank...');
      const tableRecipe = bot.recipesFor(mcData.itemsByName.crafting_table?.id)?.[0];
      if (tableRecipe) {
        await bot.craft(tableRecipe, 1);
        state.hasWorkbench = true;
      }
    }
    
    // 4. Platziere Werkbank
    const table = bot.inventory.items().find(i => i.name === 'crafting_table');
    if (table) {
      await bot.equip(table, 'hand');
      // Finde geeigneten Platz
      const ground = bot.blockAt(bot.entity.position.offset(1, -1, 0));
      if (ground) {
        try {
          await bot.placeBlock(ground, { x: 0, y: 1, z: 0 } as any);
          log('CRAFT', 'Werkbank platziert!');
        } catch {}
      }
    }
    
    // 5. Holzspitzhacke craften
    const craftingTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table?.id,
      maxDistance: 4
    });
    
    if (craftingTable && state.toolsLevel === 'none') {
      log('CRAFT', 'Crafte Holzspitzhacke...');
      const pickRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe?.id, null, craftingTable)?.[0];
      if (pickRecipe) {
        await bot.craft(pickRecipe, 1, craftingTable);
        state.toolsLevel = 'wood';
        log('CRAFT', 'Holzspitzhacke gecraftet!');
      }
      
      // Holzschwert
      const swordRecipe = bot.recipesFor(mcData.itemsByName.wooden_sword?.id, null, craftingTable)?.[0];
      if (swordRecipe) {
        await bot.craft(swordRecipe, 1, craftingTable);
        log('CRAFT', 'Holzschwert gecraftet!');
      }
    }
    
    if (state.currentTask) state.currentTask.status = 'completed';
    
  } catch (e) {
    log('CRAFT', `Crafting-Fehler: ${(e as Error).message}`);
  }
}

async function doGatherStone() {
  if (state.inventory.cobblestone.current >= state.inventory.cobblestone.goal) {
    log('STONE', `Steinziel erreicht: ${state.inventory.cobblestone.current}`);
    if (state.currentTask) state.currentTask.status = 'completed';
    return;
  }
  
  // Equip Spitzhacke
  const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pickaxe) {
    await bot.equip(pickaxe, 'hand');
  } else {
    log('STONE', 'Keine Spitzhacke vorhanden!');
    return;
  }
  
  // Finde Stein
  const stoneId = mcData.blocksByName.stone?.id;
  const stone = bot.findBlock({ matching: stoneId, maxDistance: 16 });
  
  if (stone) {
    log('STONE', `Stein gefunden bei ${stone.position}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(stone.position.x, stone.position.y, stone.position.z, 1));
      await bot.dig(stone);
      log('STONE', 'Stein abgebaut!');
    } catch (e) {
      log('STONE', `Konnte Stein nicht abbauen: ${(e as Error).message}`);
    }
  } else {
    // Grabe nach unten um Stein zu finden
    log('STONE', 'Kein Stein sichtbar, grabe nach unten...');
    await digDownForStone();
  }
}

async function digDownForStone() {
  const pos = bot.entity.position.floored();
  
  for (let y = -1; y >= -5; y--) {
    const block = bot.blockAt(pos.offset(0, y, 0));
    if (!block) continue;
    
    if (block.name === 'stone' || block.name === 'cobblestone') {
      await bot.dig(block);
      log('STONE', 'Stein gefunden und abgebaut!');
      return;
    } else if (block.name === 'dirt' || block.name === 'grass_block') {
      await bot.dig(block);
    }
  }
}

async function doBuildShelter() {
  log('BUILD', 'Baue Shelter...');
  
  if (state.hasShelter) {
    if (state.currentTask) state.currentTask.status = 'completed';
    return;
  }
  
  // Wähle Bauplatz (in der Nähe des Spawnpunkts)
  const buildPos = state.spatial.spawnPoint || {
    x: Math.floor(bot.entity.position.x),
    y: Math.floor(bot.entity.position.y),
    z: Math.floor(bot.entity.position.z)
  };
  
  state.spatial.homeBase = buildPos;
  log('BUILD', `Bauplatz: ${JSON.stringify(buildPos)}`);
  
  // Einfacher 5x5 Shelter mit Dach
  // TODO: Implementiere tatsächliches Bauen
  
  bot.chat('Ich würde jetzt ein 7x7 Haus bauen...');
  
  state.hasShelter = true;
  if (state.currentTask) state.currentTask.status = 'completed';
}

async function doHuntFood() {
  log('HUNT', 'Suche Nahrung...');
  
  // Finde nächstes Tier
  const animals = ['cow', 'pig', 'sheep', 'chicken'];
  
  for (const entity of Object.values(bot.entities)) {
    if (animals.includes(entity.name || '')) {
      const dist = bot.entity.position.distanceTo(entity.position);
      if (dist < 20) {
        log('HUNT', `Jage ${entity.name}...`);
        
        try {
          await bot.pathfinder.goto(new goals.GoalNear(entity.position.x, entity.position.y, entity.position.z, 1));
          
          // Schwert equippen
          const sword = bot.inventory.items().find(i => i.name.includes('sword'));
          if (sword) await bot.equip(sword, 'hand');
          
          bot.attack(entity);
          await sleep(500);
          if (entity.isValid) bot.attack(entity);
          
          await sleep(1000);
          await collectNearbyItems();
          
          return;
        } catch (e) {
          log('HUNT', `Jagd fehlgeschlagen: ${(e as Error).message}`);
        }
      }
    }
  }
  
  log('HUNT', 'Keine Tiere in der Nähe');
  if (state.currentTask) state.currentTask.status = 'completed';
}

// ==================== HELPER FUNCTIONS ====================

function updateInventory() {
  const items = bot.inventory.items();
  
  // Reset counts
  state.inventory.wood.current = 0;
  state.inventory.cobblestone.current = 0;
  state.inventory.coal.current = 0;
  state.inventory.dirt.current = 0;
  state.inventory.seeds.current = 0;
  state.inventory.food.current = 0;
  state.inventory.saplings.current = 0;
  
  for (const item of items) {
    if (item.name.includes('log') || item.name.includes('planks')) {
      state.inventory.wood.current += item.count;
    }
    if (item.name === 'cobblestone') {
      state.inventory.cobblestone.current += item.count;
    }
    if (item.name === 'coal' || item.name === 'charcoal') {
      state.inventory.coal.current += item.count;
    }
    if (item.name === 'dirt') {
      state.inventory.dirt.current += item.count;
    }
    if (item.name.includes('seeds')) {
      state.inventory.seeds.current += item.count;
    }
    if (item.name.includes('beef') || item.name.includes('pork') || item.name.includes('chicken') || item.name.includes('mutton') || item.name.includes('bread') || item.name.includes('apple')) {
      state.inventory.food.current += item.count;
    }
    if (item.name.includes('sapling')) {
      state.inventory.saplings.current += item.count;
    }
  }
}

async function collectNearbyItems() {
  // Sammle alle Items in der Nähe
  for (const entity of Object.values(bot.entities)) {
    if (entity.name === 'item' || entity.objectType === 'Item') {
      const dist = bot.entity.position.distanceTo(entity.position);
      if (dist < 5) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(entity.position.x, entity.position.y, entity.position.z, 0));
        } catch {}
      }
    }
  }
}

async function explore() {
  const pos = bot.entity.position;
  const angle = Math.random() * Math.PI * 2;
  const dist = 15 + Math.random() * 10;
  
  const targetX = pos.x + Math.cos(angle) * dist;
  const targetZ = pos.z + Math.sin(angle) * dist;
  
  log('EXPLORE', `Erkunde Richtung ${Math.round(angle * 180 / Math.PI)}°`);
  
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalXZ(targetX, targetZ)),
      sleep(5000)
    ]);
    bot.pathfinder.stop();
  } catch {
    bot.pathfinder.stop();
  }
  
  // Nach dem Erkunden neu scannen
  scanForResources();
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ==================== ERROR HANDLERS ====================

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.log('[REJECTION]', reason);
});

process.on('SIGINT', () => {
  log('SHUTDOWN', 'Graceful exit');
  if (bot) bot.end();
  process.exit(0);
});

// ==================== START ====================

console.log(`
╔══════════════════════════════════════════════════════════╗
║              TOOBIX DAY ONE BOT                          ║
╠══════════════════════════════════════════════════════════╣
║  Ein strukturierter erster Minecraft-Tag                 ║
║                                                          ║
║  PLAN:                                                   ║
║  1. Orientierung - Umgebung scannen                      ║
║  2. Holz sammeln - 20+ Logs                              ║
║  3. Werkzeuge - Holz → Stein                             ║
║  4. Stein sammeln - 32+ Cobblestone                      ║
║  5. Shelter bauen - 7x7 Haus                             ║
║  6. Nahrung jagen - Tiere                                ║
║  7. Nacht - Keller graben                                ║
║                                                          ║
║  Features:                                               ║
║  • Räumliches Bewusstsein (merkt sich Orte)              ║
║  • Zeitbewusstsein (Tag/Nacht Phasen)                    ║
║  • Inventar-Tracking                                     ║
║  • Aufgaben-Priorisierung                                ║
║                                                          ║
║  Chat-Befehle: status, inventar, plan                    ║
╚══════════════════════════════════════════════════════════╝
`);

createBot();
