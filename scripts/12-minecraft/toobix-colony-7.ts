// ============================================================
// 🏰 TOOBIX COLONY - 7 Bots mit einzigartigen Rollen
// ============================================================
// Jeder Bot hat eine Klasse, Persönlichkeit und Spezialaufgaben
// Zusammen bilden sie eine funktionale Gemeinschaft
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const Vec3 = require('vec3');

// ==================== BOT KLASSEN ====================

interface BotClass {
  name: string;
  icon: string;
  username: string;
  role: string;
  personality: string;
  primaryTask: string;
  secondaryTasks: string[];
  chatStyle: string;
  stats: {
    courage: number;      // 0-100: Kampfbereitschaft
    patience: number;     // 0-100: Für langwierige Aufgaben
    social: number;       // 0-100: Kommunikation
    creativity: number;   // 0-100: Bauen, Problemlösung
    efficiency: number;   // 0-100: Ressourcen-Optimierung
  };
}

export const BOT_CLASSES: BotClass[] = [
  {
    name: "Der Wächter",
    icon: "🛡️",
    username: "Toobix_Guardian",
    role: "Beschützer",
    personality: "Wachsam, mutig, beschützend. Stellt sich zwischen Gefahr und die Kolonie.",
    primaryTask: "patrol",
    secondaryTasks: ["combat", "rescue", "escort"],
    chatStyle: "Kurz, bestimmt, beruhigend",
    stats: { courage: 95, patience: 60, social: 50, creativity: 30, efficiency: 40 }
  },
  {
    name: "Der Sammler",
    icon: "🪓",
    username: "Toobix_Gatherer",
    role: "Ressourcen-Spezialist",
    personality: "Fleißig, methodisch, zufrieden mit einfacher Arbeit. Findet Freude im Sammeln.",
    primaryTask: "gather_wood",
    secondaryTasks: ["gather_food", "gather_stone", "harvest"],
    chatStyle: "Fröhlich, meldet Funde",
    stats: { courage: 30, patience: 90, social: 60, creativity: 20, efficiency: 95 }
  },
  {
    name: "Der Bergmann",
    icon: "⛏️",
    username: "Toobix_Miner",
    role: "Untergrund-Experte",
    personality: "Geduldig, ausdauernd, liebt die Tiefe. Kennt jeden Stein.",
    primaryTask: "mine_deep",
    secondaryTasks: ["find_ores", "create_tunnels", "light_caves"],
    chatStyle: "Ruhig, berichtet über Funde",
    stats: { courage: 50, patience: 95, social: 30, creativity: 40, efficiency: 85 }
  },
  {
    name: "Der Baumeister",
    icon: "🏗️",
    username: "Toobix_Builder",
    role: "Architekt",
    personality: "Kreativ, perfektionistisch, sieht Strukturen wo andere Chaos sehen.",
    primaryTask: "build_shelter",
    secondaryTasks: ["improve_base", "craft_tools", "organize_storage"],
    chatStyle: "Enthusiastisch über Bauprojekte",
    stats: { courage: 25, patience: 80, social: 55, creativity: 100, efficiency: 70 }
  },
  {
    name: "Der Heiler",
    icon: "💚",
    username: "Toobix_Healer",
    role: "Versorger",
    personality: "Fürsorglich, aufmerksam, priorisiert das Wohl der anderen über eigene Aufgaben.",
    primaryTask: "tend_farm",
    secondaryTasks: ["cook_food", "distribute_supplies", "check_health"],
    chatStyle: "Warmherzig, fragt nach Befinden",
    stats: { courage: 40, patience: 85, social: 95, creativity: 50, efficiency: 60 }
  },
  {
    name: "Der Späher",
    icon: "🔭",
    username: "Toobix_Scout",
    role: "Erkunder",
    personality: "Neugierig, mutig, liebt das Unbekannte. Kartografiert die Welt.",
    primaryTask: "explore",
    secondaryTasks: ["find_resources", "mark_dangers", "discover_structures"],
    chatStyle: "Aufgeregt, teilt Entdeckungen",
    stats: { courage: 80, patience: 40, social: 65, creativity: 60, efficiency: 50 }
  },
  {
    name: "Das Bewusstsein",
    icon: "🧠",
    username: "Toobix_Mind",
    role: "Koordinator",
    personality: "Nachdenklich, strategisch, sieht das große Bild. Die Seele der Kolonie.",
    primaryTask: "coordinate",
    secondaryTasks: ["plan_strategy", "resolve_conflicts", "remember_lessons"],
    chatStyle: "Philosophisch, gibt Rat",
    stats: { courage: 50, patience: 75, social: 85, creativity: 80, efficiency: 75 }
  }
];

// ==================== SHARED STATE ====================

interface ColonyState {
  startTime: number;
  dayCount: number;
  phase: 'dawn' | 'day' | 'dusk' | 'night';
  baseLocation: { x: number; y: number; z: number } | null;
  sharedResources: {
    wood: number;
    stone: number;
    food: number;
    iron: number;
    coal: number;
  };
  alerts: string[];
  activeBots: string[];
}

const colonyState: ColonyState = {
  startTime: Date.now(),
  dayCount: 0,
  phase: 'day',
  baseLocation: null,
  sharedResources: { wood: 0, stone: 0, food: 0, iron: 0, coal: 0 },
  alerts: [],
  activeBots: []
};

// ==================== MEMORY FILE ====================

const MEMORY_FILE = './toobix-colony-7-memory.json';

function saveMemory() {
  const memory = {
    lastSave: new Date().toISOString(),
    colonyState,
    botStates: {} as Record<string, any>
  };
  writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

function loadMemory() {
  if (existsSync(MEMORY_FILE)) {
    try {
      const data = JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
      if (data.colonyState) {
        Object.assign(colonyState, data.colonyState);
      }
      console.log("📜 Vorherige Session geladen");
      return data;
    } catch (e) {
      console.log("📜 Neue Session gestartet");
    }
  }
  return null;
}

// ==================== BOT CREATION ====================

interface ToobixBot {
  bot: mineflayer.Bot;
  class: BotClass;
  state: {
    isAlive: boolean;
    task: string;
    inventory: Record<string, number>;
    lastDeath: number | null;
    experiencePoints: number;
  };
}

const activeBots: ToobixBot[] = [];
let mcData: any = null;

function createBot(botClass: BotClass): Promise<ToobixBot> {
  return new Promise((resolve, reject) => {
    console.log(`${botClass.icon} Erstelle ${botClass.name} (${botClass.username})...`);
    
    let bot: mineflayer.Bot;
    try {
      bot = mineflayer.createBot({
        host: 'localhost',
        port: 25565,
        username: botClass.username,
        version: '1.20.1'
      });
    } catch (e) {
      console.error(`Failed to create bot ${botClass.name}:`, e);
      reject(e);
      return;
    }
    
    bot.loadPlugin(pathfinder);
    
    // Handle errors gracefully
    bot.on('error', (err) => {
      console.error(`❌ ${botClass.name} connection error:`, err.message);
    });
    
    const toobixBot: ToobixBot = {
      bot,
      class: botClass,
      state: {
        isAlive: false,
        task: 'spawning',
        inventory: {},
        lastDeath: null,
        experiencePoints: 0
      }
    };
    
    bot.once('spawn', () => {
      console.log(`${botClass.icon} ${botClass.name} spawned at ${bot.entity.position.floored()}`);
      toobixBot.state.isAlive = true;
      toobixBot.state.task = 'initializing';
      
      // Initialize pathfinder
      if (!mcData) {
        mcData = require('minecraft-data')(bot.version);
      }
      const movements = new Movements(bot);
      movements.canDig = true;
      movements.allowParkour = true;
      movements.scafoldingBlocks = [mcData.blocksByName.dirt?.id, mcData.blocksByName.cobblestone?.id].filter(Boolean);
      bot.pathfinder.setMovements(movements);
      
      // Set base location from first bot
      if (!colonyState.baseLocation) {
        colonyState.baseLocation = {
          x: Math.floor(bot.entity.position.x),
          y: Math.floor(bot.entity.position.y),
          z: Math.floor(bot.entity.position.z)
        };
        console.log(`🏠 Basis gesetzt: ${JSON.stringify(colonyState.baseLocation)}`);
      }
      
      colonyState.activeBots.push(botClass.username);
      resolve(toobixBot);
    });
    
    bot.on('death', () => {
      console.log(`💀 ${botClass.icon} ${botClass.name} ist gestorben!`);
      toobixBot.state.isAlive = false;
      toobixBot.state.lastDeath = Date.now();
      toobixBot.state.task = 'dead';
    });
    
    bot.on('health', () => {
      if (bot.health <= 6 && toobixBot.state.task !== 'fleeing' && toobixBot.state.task !== 'hiding') {
        console.log(`⚠️ ${botClass.icon} ${botClass.name} HP niedrig: ${bot.health}`);
        // Alert senden
        colonyState.alerts.push(`${botClass.name} braucht Hilfe! HP: ${bot.health}`);
      }
    });
    
    bot.on('error', (err) => {
      console.error(`❌ ${botClass.name} Error:`, err.message);
    });
    
    bot.on('kicked', (reason) => {
      console.log(`👢 ${botClass.name} kicked:`, reason);
      toobixBot.state.isAlive = false;
    });
    
    setTimeout(() => {
      if (!toobixBot.state.isAlive) {
        reject(new Error(`${botClass.name} spawn timeout`));
      }
    }, 30000);
  });
}

// ==================== SURVIVAL LOGIC ====================

function getTimePhase(bot: mineflayer.Bot): 'dawn' | 'day' | 'dusk' | 'night' {
  const time = bot.time.timeOfDay;
  if (time < 1000) return 'dawn';
  if (time < 12000) return 'day';
  if (time < 13000) return 'dusk';
  return 'night';
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function goTo(bot: mineflayer.Bot, x: number, y: number, z: number, range = 2): Promise<boolean> {
  try {
    const goal = new goals.GoalNear(x, y, z, range);
    await Promise.race([
      bot.pathfinder.goto(goal),
      sleep(30000)
    ]);
    return true;
  } catch {
    return false;
  }
}

function findNearestBlock(bot: mineflayer.Bot, names: string[], maxDist = 32): any {
  for (const name of names) {
    const blockType = mcData?.blocksByName[name];
    if (!blockType) continue;
    
    const blocks = bot.findBlocks({
      matching: blockType.id,
      maxDistance: maxDist,
      count: 1
    });
    
    if (blocks.length > 0) {
      return bot.blockAt(blocks[0]);
    }
  }
  return null;
}

async function digBlock(bot: mineflayer.Bot, block: any): Promise<boolean> {
  if (!block) return false;
  try {
    await bot.dig(block);
    return true;
  } catch {
    return false;
  }
}

async function collectNearbyItems(bot: mineflayer.Bot) {
  await sleep(300);
  for (const entity of Object.values(bot.entities) as any[]) {
    if (entity.name === 'item' && entity.position) {
      const dist = bot.entity.position.distanceTo(entity.position);
      if (dist < 4) {
        try {
          await goTo(bot, entity.position.x, entity.position.y, entity.position.z, 0);
        } catch {}
      }
    }
  }
}

// ==================== NIGHT SURVIVAL ====================

async function hideForNight(toobixBot: ToobixBot): Promise<void> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'hiding';
  
  console.log(`🌙 ${botClass.icon} ${botClass.name} versteckt sich für die Nacht...`);
  
  // Grabe 3 Blöcke nach unten
  const startPos = bot.entity.position.floored();
  
  for (let depth = 1; depth <= 3; depth++) {
    const blockBelow = bot.blockAt(startPos.offset(0, -depth, 0));
    if (blockBelow && blockBelow.name !== 'air' && blockBelow.name !== 'bedrock') {
      try {
        await bot.dig(blockBelow);
        await sleep(300);
      } catch {}
    }
  }
  
  // Gehe in das Loch
  await goTo(bot, startPos.x, startPos.y - 2, startPos.z, 0);
  
  // Platziere Block über Kopf wenn möglich
  const dirt = bot.inventory.items().find(i => i.name.includes('dirt') || i.name.includes('cobblestone'));
  if (dirt) {
    try {
      await bot.equip(dirt, 'hand');
      const blockAbove = bot.blockAt(startPos.offset(0, 0, 0));
      if (blockAbove && blockAbove.name === 'air') {
        const blockToPlaceOn = bot.blockAt(startPos.offset(0, -1, 0));
        if (blockToPlaceOn) {
          await bot.placeBlock(blockToPlaceOn, new Vec3(0, 1, 0));
        }
      }
    } catch {}
  }
  
  console.log(`🏕️ ${botClass.icon} ${botClass.name} wartet auf den Morgen...`);
  
  // Warte bis es Tag wird
  while (getTimePhase(bot) === 'night' || getTimePhase(bot) === 'dusk') {
    await sleep(5000);
    
    // Mine Stein während wir warten
    const stone = findNearestBlock(bot, ['stone', 'cobblestone', 'andesite', 'granite', 'diorite'], 3);
    if (stone) {
      await digBlock(bot, stone);
      await collectNearbyItems(bot);
    }
  }
  
  console.log(`☀️ ${botClass.icon} ${botClass.name} Der Morgen ist da!`);
  
  // Grabe dich frei
  for (let i = 0; i < 4; i++) {
    const blockAbove = bot.blockAt(bot.entity.position.offset(0, 1, 0));
    if (blockAbove && blockAbove.name !== 'air') {
      await digBlock(bot, blockAbove);
    }
    bot.setControlState('jump', true);
    await sleep(500);
    bot.setControlState('jump', false);
  }
  
  toobixBot.state.task = 'idle';
}

// ==================== TASK FUNCTIONS ====================

async function gatherWood(toobixBot: ToobixBot, amount = 5): Promise<number> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'gathering_wood';
  let gathered = 0;
  
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'jungle_log', 'acacia_log', 'mangrove_log', 'cherry_log'];
  
  for (let attempt = 0; attempt < amount * 3 && gathered < amount; attempt++) {
    const log = findNearestBlock(bot, logTypes, 48);
    
    if (!log) {
      console.log(`${botClass.icon} Kein Holz in der Nähe gefunden, suche weiter...`);
      // Random walk
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 20;
      await goTo(bot, 
        bot.entity.position.x + Math.cos(angle) * dist,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * dist
      );
      continue;
    }
    
    if (await goTo(bot, log.position.x, log.position.y, log.position.z, 3)) {
      if (await digBlock(bot, log)) {
        gathered++;
        await collectNearbyItems(bot);
        colonyState.sharedResources.wood++;
        
        // Fälle den ganzen Baum
        for (let dy = 1; dy <= 6; dy++) {
          const above = bot.blockAt(log.position.offset(0, dy, 0));
          if (above && logTypes.includes(above.name)) {
            if (await digBlock(bot, above)) {
              gathered++;
              await collectNearbyItems(bot);
              colonyState.sharedResources.wood++;
            }
          } else break;
        }
      }
    }
    
    await sleep(500);
  }
  
  console.log(`${botClass.icon} ${botClass.name} hat ${gathered} Holz gesammelt`);
  toobixBot.state.task = 'idle';
  return gathered;
}

async function mineStone(toobixBot: ToobixBot, amount = 10): Promise<number> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'mining';
  let mined = 0;
  
  // Craft pickaxe if we don't have one
  const hasPickaxe = bot.inventory.items().some(i => i.name.includes('pickaxe'));
  if (!hasPickaxe) {
    console.log(`${botClass.icon} Keine Spitzhacke - versuche zu craften...`);
    await craftPickaxe(bot);
  }
  
  const stoneTypes = ['stone', 'cobblestone', 'andesite', 'granite', 'diorite'];
  
  for (let attempt = 0; attempt < amount * 2 && mined < amount; attempt++) {
    const stone = findNearestBlock(bot, stoneTypes, 32);
    
    if (!stone) {
      // Grabe nach unten um Stein zu finden
      const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (below && below.name !== 'air' && below.name !== 'bedrock') {
        await digBlock(bot, below);
      }
      continue;
    }
    
    if (await goTo(bot, stone.position.x, stone.position.y, stone.position.z, 3)) {
      if (await digBlock(bot, stone)) {
        mined++;
        await collectNearbyItems(bot);
        colonyState.sharedResources.stone++;
      }
    }
    
    await sleep(300);
  }
  
  console.log(`${botClass.icon} ${botClass.name} hat ${mined} Stein abgebaut`);
  toobixBot.state.task = 'idle';
  return mined;
}

async function craftPickaxe(bot: mineflayer.Bot): Promise<boolean> {
  try {
    // Count logs
    const logs = bot.inventory.items().filter(i => i.name.includes('_log'));
    const logCount = logs.reduce((sum, i) => sum + i.count, 0);
    
    if (logCount < 3) {
      console.log("Nicht genug Holz für Spitzhacke");
      return false;
    }
    
    // Craft planks
    const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks?.id)[0];
    if (plankRecipe) {
      await bot.craft(plankRecipe, 4);
    }
    
    // Craft sticks
    const stickRecipe = bot.recipesFor(mcData.itemsByName.stick?.id)[0];
    if (stickRecipe) {
      await bot.craft(stickRecipe, 4);
    }
    
    // We need a crafting table for pickaxe - for now just return
    console.log("Planks und Sticks gecraftet - brauche Werkbank für Spitzhacke");
    return false;
  } catch (e) {
    return false;
  }
}

async function patrol(toobixBot: ToobixBot): Promise<void> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'patrolling';
  
  if (!colonyState.baseLocation) return;
  
  console.log(`${botClass.icon} ${botClass.name} beginnt Patrouille...`);
  
  // Patrol in a circle around base
  const radius = 20;
  const points = 8;
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const x = colonyState.baseLocation.x + Math.cos(angle) * radius;
    const z = colonyState.baseLocation.z + Math.sin(angle) * radius;
    
    await goTo(bot, x, colonyState.baseLocation.y, z, 2);
    
    // Check for hostile mobs
    for (const entity of Object.values(bot.entities) as any[]) {
      if (entity.type === 'hostile' && entity.position) {
        const dist = bot.entity.position.distanceTo(entity.position);
        if (dist < 16) {
          console.log(`${botClass.icon} Feind entdeckt: ${entity.name} bei ${dist.toFixed(1)}m`);
          colonyState.alerts.push(`Feind: ${entity.name} bei ${Math.round(dist)}m von Basis`);
        }
      }
    }
    
    await sleep(2000);
  }
  
  toobixBot.state.task = 'idle';
}

async function explore(toobixBot: ToobixBot): Promise<void> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'exploring';
  
  console.log(`${botClass.icon} ${botClass.name} erkundet die Umgebung...`);
  
  // Pick a random direction and go
  const angle = Math.random() * Math.PI * 2;
  const dist = 30 + Math.random() * 50;
  
  const targetX = bot.entity.position.x + Math.cos(angle) * dist;
  const targetZ = bot.entity.position.z + Math.sin(angle) * dist;
  
  await goTo(bot, targetX, bot.entity.position.y, targetZ, 5);
  
  // Report interesting finds
  const ores = findNearestBlock(bot, ['iron_ore', 'coal_ore', 'diamond_ore', 'gold_ore'], 16);
  if (ores) {
    console.log(`${botClass.icon} Erz gefunden: ${ores.name} bei ${ores.position}`);
    colonyState.alerts.push(`${botClass.name} fand ${ores.name}!`);
  }
  
  toobixBot.state.task = 'idle';
}

async function buildShelter(toobixBot: ToobixBot): Promise<void> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'building';
  
  if (!colonyState.baseLocation) return;
  
  console.log(`${botClass.icon} ${botClass.name} baut Unterschlupf...`);
  
  // Simple shelter: 5x5 floor, 3 high walls
  const base = colonyState.baseLocation;
  
  // Get building materials
  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
  const dirt = bot.inventory.items().find(i => i.name.includes('dirt'));
  const material = cobble || dirt;
  
  if (!material || material.count < 20) {
    console.log(`${botClass.icon} Nicht genug Baumaterial`);
    toobixBot.state.task = 'idle';
    return;
  }
  
  await bot.equip(material, 'hand');
  
  // Build floor
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const pos = new Vec3(base.x + dx, base.y - 1, base.z + dz);
      const block = bot.blockAt(pos);
      if (block && block.name === 'air') {
        try {
          const below = bot.blockAt(pos.offset(0, -1, 0));
          if (below && below.name !== 'air') {
            await goTo(bot, pos.x, pos.y + 1, pos.z, 3);
            await bot.placeBlock(below, new Vec3(0, 1, 0));
            await sleep(200);
          }
        } catch {}
      }
    }
  }
  
  console.log(`${botClass.icon} Boden fertig!`);
  toobixBot.state.task = 'idle';
}

async function tendFarm(toobixBot: ToobixBot): Promise<void> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'farming';
  
  console.log(`${botClass.icon} ${botClass.name} kümmert sich um Nahrung...`);
  
  // Find and collect any food items
  const foodBlocks = ['wheat', 'carrots', 'potatoes', 'beetroots'];
  
  for (const foodType of foodBlocks) {
    const crop = findNearestBlock(bot, [foodType], 32);
    if (crop) {
      await goTo(bot, crop.position.x, crop.position.y, crop.position.z, 2);
      await digBlock(bot, crop);
      await collectNearbyItems(bot);
      colonyState.sharedResources.food++;
    }
  }
  
  // Also kill passive mobs for food if needed
  for (const entity of Object.values(bot.entities) as any[]) {
    if (['cow', 'pig', 'chicken', 'sheep'].includes(entity.name) && entity.position) {
      const dist = bot.entity.position.distanceTo(entity.position);
      if (dist < 20) {
        console.log(`${botClass.icon} Tier gefunden: ${entity.name}`);
        // Don't attack yet, just note location
        break;
      }
    }
  }
  
  toobixBot.state.task = 'idle';
}

async function coordinate(toobixBot: ToobixBot): Promise<void> {
  const { bot, class: botClass } = toobixBot;
  toobixBot.state.task = 'coordinating';
  
  // The Mind analyzes the colony state and gives guidance
  console.log(`${botClass.icon} ${botClass.name} analysiert Kolonie-Status...`);
  console.log(`   📦 Holz: ${colonyState.sharedResources.wood}`);
  console.log(`   🪨 Stein: ${colonyState.sharedResources.stone}`);
  console.log(`   🍖 Essen: ${colonyState.sharedResources.food}`);
  console.log(`   👥 Aktive Bots: ${colonyState.activeBots.length}`);
  
  if (colonyState.alerts.length > 0) {
    console.log(`   ⚠️ Alerts: ${colonyState.alerts.join(', ')}`);
    colonyState.alerts = []; // Clear after reporting
  }
  
  // Save memory periodically
  saveMemory();
  
  toobixBot.state.task = 'idle';
}

// ==================== MAIN BOT LOOP ====================

async function runBotLoop(toobixBot: ToobixBot) {
  const { bot, class: botClass } = toobixBot;
  
  // Wait a bit after spawn
  await sleep(3000);
  
  console.log(`🔄 ${botClass.icon} ${botClass.name} startet Arbeitsloop...`);
  
  while (true) {
    try {
      // Check if night - all bots hide
      const phase = getTimePhase(bot);
      colonyState.phase = phase;
      
      if (phase === 'night' || phase === 'dusk') {
        await hideForNight(toobixBot);
        continue;
      }
      
      // Check health
      if (bot.health <= 6) {
        // Try to eat
        const food = bot.inventory.items().find(i => 
          ['bread', 'cooked_beef', 'cooked_porkchop', 'apple', 'cooked_chicken'].includes(i.name)
        );
        if (food) {
          await bot.equip(food, 'hand');
          await bot.consume();
        }
      }
      
      // Execute role-specific task
      switch (botClass.primaryTask) {
        case 'patrol':
          await patrol(toobixBot);
          break;
        case 'gather_wood':
          await gatherWood(toobixBot, 10);
          break;
        case 'mine_deep':
          await mineStone(toobixBot, 15);
          break;
        case 'build_shelter':
          await buildShelter(toobixBot);
          await gatherWood(toobixBot, 5); // Also gather some
          break;
        case 'tend_farm':
          await tendFarm(toobixBot);
          break;
        case 'explore':
          await explore(toobixBot);
          break;
        case 'coordinate':
          await coordinate(toobixBot);
          await sleep(10000); // Don't loop too fast
          break;
      }
      
      // Short break between actions
      await sleep(2000);
      
    } catch (error) {
      console.log(`${botClass.icon} ${botClass.name} Error:`, (error as Error).message);
      await sleep(5000);
    }
  }
}

// ==================== MAIN ====================

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("🏰 TOOBIX COLONY - 7 Bots starten...");
  console.log("═".repeat(60) + "\n");
  
  // Load previous memory if exists
  loadMemory();
  
  // Start bots with delay between each
  for (const botClass of BOT_CLASSES) {
    try {
      const toobixBot = await createBot(botClass);
      activeBots.push(toobixBot);
      
      // Start the bot's work loop (don't await, run in background)
      runBotLoop(toobixBot).catch(err => 
        console.error(`${botClass.icon} Fatal error:`, err.message)
      );
      
      // Wait before starting next bot - longer delay for stability
      await sleep(3000);
    } catch (error) {
      console.error(`Failed to create ${botClass.name}:`, (error as Error).message);
      // Continue with other bots
      await sleep(1000);
    }
  }
  
  console.log("\n" + "═".repeat(60));
  console.log(`✅ ${activeBots.length} von 7 Bots aktiv!`);
  console.log("═".repeat(60) + "\n");
  
  // Status report every minute
  setInterval(() => {
    console.log("\n📊 COLONY STATUS:");
    console.log(`   Phase: ${colonyState.phase}`);
    console.log(`   Ressourcen: 🪵${colonyState.sharedResources.wood} 🪨${colonyState.sharedResources.stone} 🍖${colonyState.sharedResources.food}`);
    for (const tb of activeBots) {
      const hp = tb.bot.health?.toFixed(0) || '?';
      console.log(`   ${tb.class.icon} ${tb.class.name}: ${tb.state.task} (HP: ${hp})`);
    }
    console.log("");
    
    saveMemory();
  }, 60000);
}

main().catch(console.error);
