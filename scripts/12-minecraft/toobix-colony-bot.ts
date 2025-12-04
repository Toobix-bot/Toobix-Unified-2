/**
 * 🤖 TOOBIX COLONY BOT v1.0
 * 
 * Ein intelligenter Bot der als Teil einer Kolonie funktioniert.
 * Arbeitet mit dem Colony Brain zusammen für koordinierte Aktionen.
 * 
 * Features:
 * - Teamwork: Koordiniert mit anderen Bots
 * - Solo-fähig: Kann auch alleine überleben
 * - Phasen-bewusst: Passt Verhalten an aktuelle Phase an
 * - Kreativ: Entwickelt eigene Ideen
 * - Adaptiv: Passt sich an Spieler und Umgebung an
 */

import mineflayer from 'mineflayer';
import type { Bot } from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { plugin as pvp } from 'mineflayer-pvp';

const COLONY_BRAIN = 'http://localhost:8960';

// ============================================================================
// TYPES
// ============================================================================

interface BotState {
  name: string;
  role: string;
  roleIcon: string;
  
  // Current activity
  currentTask: string;
  currentGoal: string;
  status: 'idle' | 'working' | 'traveling' | 'emergency' | 'resting';
  
  // Personal stats
  health: number;
  hunger: number;
  
  // Position
  position: { x: number; y: number; z: number };
  homePosition: { x: number; y: number; z: number } | null;
  
  // Inventory summary
  inventory: {
    wood: number;
    stone: number;
    coal: number;
    iron: number;
    food: number;
    hasTools: boolean;
  };
  
  // Emotional state
  mood: 'happy' | 'worried' | 'focused' | 'tired' | 'excited';
  morale: number; // 0-100
  
  // Learning
  experiencePoints: number;
  skillLevels: {
    mining: number;
    building: number;
    farming: number;
    combat: number;
    exploration: number;
  };
  
  // Memory
  lastPlayerInteraction: number;
  knownPlayers: string[];
  personalMemories: string[];
}

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

interface Environment {
  biome: string;
  isNight: boolean;
  isRaining: boolean;
  nearWater: boolean;
  nearTrees: boolean;
  nearMountain: boolean;
  nearCave: boolean;
  hostileMobsNearby: boolean;
  friendlyMobsNearby: boolean;
  playersNearby: string[];
  recommendedActions: string[];
}

function analyzeEnvironment(bot: Bot): Environment {
  const time = bot.time.timeOfDay;
  const isNight = time > 13000 && time < 23000;
  const pos = bot.entity.position;
  
  // Check for nearby entities
  const hostileMobs = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman'];
  const friendlyMobs = ['cow', 'pig', 'sheep', 'chicken'];
  
  let hostileMobsNearby = false;
  let friendlyMobsNearby = false;
  const playersNearby: string[] = [];
  
  for (const entity of Object.values(bot.entities)) {
    if (!entity) continue;
    const dist = entity.position.distanceTo(pos);
    if (dist > 32) continue;
    
    if (entity.type === 'player' && entity.username !== bot.username) {
      playersNearby.push(entity.username!);
    }
    if (hostileMobs.some(m => entity.name?.toLowerCase().includes(m))) {
      hostileMobsNearby = true;
    }
    if (friendlyMobs.some(m => entity.name?.toLowerCase().includes(m))) {
      friendlyMobsNearby = true;
    }
  }
  
  // Check for nearby blocks
  const nearWater = bot.findBlock({
    matching: block => block.name.includes('water'),
    maxDistance: 16
  }) !== null;
  
  const nearTrees = bot.findBlock({
    matching: block => block.name.includes('log'),
    maxDistance: 32
  }) !== null;
  
  // Recommend actions based on environment
  const recommendedActions: string[] = [];
  
  if (isNight && hostileMobsNearby) {
    recommendedActions.push('find-shelter', 'avoid-combat');
  } else if (isNight && !hostileMobsNearby) {
    recommendedActions.push('stay-safe', 'craft', 'organize');
  } else {
    // Day time
    if (nearTrees) recommendedActions.push('gather-wood');
    if (friendlyMobsNearby) recommendedActions.push('hunt', 'gather-food');
    recommendedActions.push('explore', 'build', 'mine');
  }
  
  if (playersNearby.length > 0) {
    recommendedActions.push('interact-with-player');
  }
  
  return {
    biome: 'unknown', // Would need additional API
    isNight,
    isRaining: bot.isRaining,
    nearWater,
    nearTrees,
    nearMountain: false, // TODO: detect elevation changes
    nearCave: false, // TODO: detect caves
    hostileMobsNearby,
    friendlyMobsNearby,
    playersNearby,
    recommendedActions
  };
}

// ============================================================================
// TASK EXECUTION
// ============================================================================

interface TaskResult {
  success: boolean;
  message: string;
  itemsGathered?: Record<string, number>;
}

async function executeTask(bot: Bot, state: BotState, task: string): Promise<TaskResult> {
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);
  
  switch (task) {
    case 'gather-wood':
      return await gatherWood(bot, mcData);
    case 'gather-stone':
      return await gatherStone(bot, mcData);
    case 'find-food':
      return await findFood(bot, mcData, movements);
    case 'build-shelter':
      return await buildShelter(bot, mcData, movements);
    case 'craft-tools':
      return await craftTools(bot, mcData);
    case 'scout-area':
      return await scoutArea(bot, movements);
    case 'mine':
      return await mineOres(bot, mcData);
    case 'return-home':
      return await returnHome(bot, state, movements);
    default:
      return { success: false, message: `Unknown task: ${task}` };
  }
}

async function gatherWood(bot: Bot, mcData: any): Promise<TaskResult> {
  const logTypes = ['oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
  
  for (const logType of logTypes) {
    const logBlock = mcData.blocksByName[logType];
    if (!logBlock) continue;
    
    const logs = bot.findBlocks({
      matching: logBlock.id,
      maxDistance: 64,
      count: 10
    });
    
    if (logs.length > 0) {
      bot.chat(`🌲 Sammle Holz (${logs.length} Bäume gefunden)`);
      
      const targets = logs.slice(0, 5).map(pos => bot.blockAt(pos)).filter(b => b);
      
      try {
        // @ts-ignore
        await bot.collectBlock.collect(targets);
        return { 
          success: true, 
          message: `${targets.length} Holzblöcke gesammelt`,
          itemsGathered: { wood: targets.length }
        };
      } catch (e) {
        return { success: false, message: 'Konnte Holz nicht erreichen' };
      }
    }
  }
  
  return { success: false, message: 'Kein Holz in der Nähe gefunden' };
}

async function gatherStone(bot: Bot, mcData: any): Promise<TaskResult> {
  const stoneBlock = mcData.blocksByName['stone'];
  if (!stoneBlock) return { success: false, message: 'Stone block not found in data' };
  
  const stones = bot.findBlocks({
    matching: stoneBlock.id,
    maxDistance: 32,
    count: 20
  });
  
  if (stones.length > 0) {
    bot.chat(`⛏️ Baue Stein ab (${stones.length} Blöcke gefunden)`);
    
    const targets = stones.slice(0, 8).map(pos => bot.blockAt(pos)).filter(b => b);
    
    try {
      // @ts-ignore
      await bot.collectBlock.collect(targets);
      return { 
        success: true, 
        message: `${targets.length} Steinblöcke abgebaut`,
        itemsGathered: { stone: targets.length }
      };
    } catch (e) {
      return { success: false, message: 'Konnte Stein nicht abbauen' };
    }
  }
  
  return { success: false, message: 'Kein Stein in der Nähe' };
}

async function findFood(bot: Bot, mcData: any, movements: Movements): Promise<TaskResult> {
  // Look for animals
  const animals = ['cow', 'pig', 'chicken', 'sheep'];
  
  for (const animalType of animals) {
    const animal = bot.nearestEntity(entity => 
      entity.name?.toLowerCase().includes(animalType)
    );
    
    if (animal) {
      bot.chat(`🍖 Jage ${animalType}!`);
      
      bot.pathfinder.setGoal(new goals.GoalNear(
        animal.position.x,
        animal.position.y,
        animal.position.z,
        2
      ));
      
      await new Promise(r => setTimeout(r, 3000));
      
      try {
        await bot.pvp.attack(animal);
        await new Promise(r => setTimeout(r, 2000));
        return { 
          success: true, 
          message: `${animalType} gejagt`,
          itemsGathered: { food: 2 }
        };
      } catch (e) {
        return { success: false, message: 'Jagd fehlgeschlagen' };
      }
    }
  }
  
  // Look for apples (break leaves)
  const leavesBlock = mcData.blocksByName['oak_leaves'];
  if (leavesBlock) {
    const leaves = bot.findBlocks({
      matching: leavesBlock.id,
      maxDistance: 32,
      count: 5
    });
    
    if (leaves.length > 0) {
      bot.chat(`🍎 Suche Äpfel in Blättern...`);
      // Breaking leaves might drop apples
    }
  }
  
  return { success: false, message: 'Keine Nahrungsquelle gefunden' };
}

async function buildShelter(bot: Bot, mcData: any, movements: Movements): Promise<TaskResult> {
  // Check if we have enough materials
  const inventory = bot.inventory.items();
  const woodCount = inventory.filter(i => i.name.includes('log') || i.name.includes('planks')).reduce((a, b) => a + b.count, 0);
  
  if (woodCount < 20) {
    bot.chat(`🏠 Nicht genug Holz für Unterschlupf (${woodCount}/20)`);
    return { success: false, message: 'Nicht genug Materialien' };
  }
  
  bot.chat(`🏗️ Beginne Unterschlupf zu bauen!`);
  
  // Find a good flat spot nearby
  const pos = bot.entity.position.floored();
  
  // Simple shelter: dig into a hill or build walls
  // For now, announce intention
  bot.chat(`📍 Bauplatz bei ${pos.x}, ${pos.y}, ${pos.z}`);
  
  return { success: true, message: 'Unterschlupf-Bauplatz markiert' };
}

async function craftTools(bot: Bot, mcData: any): Promise<TaskResult> {
  // Check for crafting table nearby
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName['crafting_table']?.id,
    maxDistance: 32
  });
  
  if (!craftingTable) {
    // Try to craft one
    const planks = bot.inventory.items().find(i => i.name.includes('planks'));
    if (planks && planks.count >= 4) {
      bot.chat(`🔨 Crafte Werkbank...`);
      // Would need actual crafting logic here
    }
  }
  
  bot.chat(`🔧 Crafte Werkzeuge...`);
  
  return { success: true, message: 'Werkzeug-Crafting gestartet' };
}

async function scoutArea(bot: Bot, movements: Movements): Promise<TaskResult> {
  const pos = bot.entity.position;
  
  // Move in a random direction
  const angle = Math.random() * Math.PI * 2;
  const distance = 30 + Math.random() * 50;
  
  const targetX = pos.x + Math.cos(angle) * distance;
  const targetZ = pos.z + Math.sin(angle) * distance;
  
  bot.chat(`🧭 Erkunde Richtung ${Math.round(angle * 180 / Math.PI)}°`);
  
  bot.pathfinder.setGoal(new goals.GoalNear(targetX, pos.y, targetZ, 5));
  
  return { success: true, message: `Erkunde Gebiet bei ${Math.round(targetX)}, ${Math.round(targetZ)}` };
}

async function mineOres(bot: Bot, mcData: any): Promise<TaskResult> {
  const ores = ['coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore'];
  
  for (const oreName of ores) {
    const oreBlock = mcData.blocksByName[oreName];
    if (!oreBlock) continue;
    
    const foundOres = bot.findBlocks({
      matching: oreBlock.id,
      maxDistance: 32,
      count: 5
    });
    
    if (foundOres.length > 0) {
      bot.chat(`💎 ${oreName} gefunden!`);
      
      const targets = foundOres.slice(0, 3).map(pos => bot.blockAt(pos)).filter(b => b);
      
      try {
        // @ts-ignore
        await bot.collectBlock.collect(targets);
        return { 
          success: true, 
          message: `${targets.length} ${oreName} abgebaut!`,
          itemsGathered: { [oreName.replace('_ore', '')]: targets.length }
        };
      } catch (e) {
        return { success: false, message: 'Mining fehlgeschlagen' };
      }
    }
  }
  
  return { success: false, message: 'Keine Erze in der Nähe' };
}

async function returnHome(bot: Bot, state: BotState, movements: Movements): Promise<TaskResult> {
  if (!state.homePosition) {
    return { success: false, message: 'Kein Zuhause definiert' };
  }
  
  bot.chat(`🏠 Kehre nach Hause zurück...`);
  
  const { x, y, z } = state.homePosition;
  bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 3));
  
  return { success: true, message: 'Auf dem Weg nach Hause' };
}

// ============================================================================
// COLONY COMMUNICATION
// ============================================================================

async function reportToColony(state: BotState, message: string): Promise<void> {
  try {
    await fetch(`${COLONY_BRAIN}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: state.name,
        message: `${state.roleIcon} ${message}`
      })
    });
  } catch (e) {
    console.log(`[${state.name}] Could not report to colony brain`);
  }
}

async function getColonyPhase(): Promise<any> {
  try {
    const response = await fetch(`${COLONY_BRAIN}/phase`);
    return await response.json();
  } catch (e) {
    return { name: 'survival', priorities: ['survive'] };
  }
}

// ============================================================================
// PLAYER INTERACTION
// ============================================================================

async function handlePlayerMessage(bot: Bot, state: BotState, username: string, message: string): Promise<void> {
  const lower = message.toLowerCase();
  
  // Remember this player
  if (!state.knownPlayers.includes(username)) {
    state.knownPlayers.push(username);
    bot.chat(`Hallo ${username}! Schön dich kennenzulernen! Ich bin ${state.name} (${state.role}).`);
    return;
  }
  
  // Respond to commands
  if (lower.includes('hallo') || lower.includes('hi') || lower.includes('hey')) {
    bot.chat(`Hey ${username}! 👋 Was kann ich für dich tun?`);
  }
  else if (lower.includes('was machst du') || lower.includes('status')) {
    bot.chat(`Ich bin ${state.role}. Gerade: ${state.currentTask}. Stimmung: ${state.mood}`);
  }
  else if (lower.includes('folge') || lower.includes('follow')) {
    bot.chat(`Okay ${username}, ich folge dir!`);
    const player = bot.players[username]?.entity;
    if (player) {
      const mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot, mcData);
      bot.pathfinder.setMovements(movements);
      bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true);
      state.currentTask = `following-${username}`;
    }
  }
  else if (lower.includes('stopp') || lower.includes('stop')) {
    bot.chat(`Okay, ich höre auf!`);
    bot.pathfinder.setGoal(null);
    state.currentTask = 'idle';
  }
  else if (lower.includes('hilfe') || lower.includes('help')) {
    bot.chat(`Befehle: hallo, status, folge, stopp, was machst du, hilfe, team`);
  }
  else if (lower.includes('team') || lower.includes('kolonie')) {
    bot.chat(`Wir sind eine Kolonie! Jeder hat seine Rolle. Meine: ${state.role}`);
  }
  else if (lower.includes('bau') || lower.includes('build')) {
    bot.chat(`Du möchtest etwas bauen? Ich helfe gerne! Was soll ich tun?`);
    await reportToColony(state, `${username} möchte etwas bauen!`);
  }
  else {
    // Remember what player said for context
    state.personalMemories.push(`${username} sagte: "${message}"`);
    bot.chat(`Interessant, ${username}! Ich merke mir das.`);
  }
  
  state.lastPlayerInteraction = Date.now();
}

// ============================================================================
// MAIN BOT LOOP
// ============================================================================

async function runColonyBot(bot: Bot, state: BotState): Promise<void> {
  console.log(`🤖 Colony Bot Loop gestartet für ${state.name}`);
  
  while (true) {
    try {
      // Analyze current environment
      const env = analyzeEnvironment(bot);
      
      // Check colony phase
      const phase = await getColonyPhase();
      
      // Update state
      state.health = bot.health;
      state.hunger = bot.food;
      state.position = {
        x: Math.round(bot.entity.position.x),
        y: Math.round(bot.entity.position.y),
        z: Math.round(bot.entity.position.z)
      };
      
      // Determine mood based on conditions
      if (state.health < 5) {
        state.mood = 'worried';
      } else if (env.hostileMobsNearby) {
        state.mood = 'worried';
      } else if (env.playersNearby.length > 0) {
        state.mood = 'excited';
      } else if (state.hunger < 5) {
        state.mood = 'tired';
      } else {
        state.mood = 'focused';
      }
      
      // EMERGENCY: Low health
      if (state.health < 5) {
        state.status = 'emergency';
        state.currentTask = 'find-safety';
        await reportToColony(state, `⚠️ Niedrige Gesundheit! Brauche Hilfe!`);
      }
      // EMERGENCY: Hostile mobs at night
      else if (env.isNight && env.hostileMobsNearby) {
        state.status = 'emergency';
        state.currentTask = 'flee';
        bot.chat(`😰 Monster! Suche Deckung!`);
      }
      // NORMAL: Work based on phase and role
      else {
        state.status = 'working';
        
        // Survival phase: everyone gathers and builds
        if (phase.name === 'survival') {
          const tasks = ['gather-wood', 'gather-stone', 'find-food', 'scout-area'];
          const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
          state.currentTask = randomTask;
        }
        // Later phases: specialize based on role
        else {
          // Role-based task selection would go here
          state.currentTask = 'gather-wood'; // Default
        }
        
        // Execute current task
        const result = await executeTask(bot, state, state.currentTask);
        
        if (result.success) {
          await reportToColony(state, `✅ ${result.message}`);
          
          // Report gathered items to colony
          if (result.itemsGathered) {
            try {
              // Would update shared storage here
            } catch {}
          }
        }
      }
      
      // Wait before next decision
      await new Promise(r => setTimeout(r, 10000)); // 10 seconds between major decisions
      
    } catch (error) {
      console.error(`[${state.name}] Loop error:`, error);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ============================================================================
// BOT CREATION & INITIALIZATION
// ============================================================================

function createColonyBot(name: string, host: string, port: number, apiPort: number): void {
  const state: BotState = {
    name,
    role: 'worker',
    roleIcon: '🤖',
    currentTask: 'initializing',
    currentGoal: 'join-colony',
    status: 'idle',
    health: 20,
    hunger: 20,
    position: { x: 0, y: 0, z: 0 },
    homePosition: null,
    inventory: { wood: 0, stone: 0, coal: 0, iron: 0, food: 0, hasTools: false },
    mood: 'happy',
    morale: 100,
    experiencePoints: 0,
    skillLevels: { mining: 1, building: 1, farming: 1, combat: 1, exploration: 1 },
    lastPlayerInteraction: 0,
    knownPlayers: [],
    personalMemories: []
  };

  const bot = mineflayer.createBot({
    host,
    port,
    username: name,
    auth: 'offline',
    version: '1.20.1'
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);
  bot.loadPlugin(pvp);

  bot.on('spawn', async () => {
    console.log(`✅ ${name} gespawnt!`);
    
    // Set home position
    state.homePosition = {
      x: Math.round(bot.entity.position.x),
      y: Math.round(bot.entity.position.y),
      z: Math.round(bot.entity.position.z)
    };
    
    bot.chat(`🤖 ${name} ist bereit für die Kolonie!`);
    
    // Register with colony brain
    try {
      await fetch(`${COLONY_BRAIN}/register-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botName: name })
      });
    } catch {}
    
    // Start main loop
    setTimeout(() => {
      runColonyBot(bot, state).catch(console.error);
    }, 3000);
  });

  bot.on('chat', (username, message) => {
    if (username !== bot.username) {
      handlePlayerMessage(bot, state, username, message).catch(console.error);
    }
  });

  bot.on('health', () => {
    state.health = bot.health;
    state.hunger = bot.food;
    
    if (bot.health < 5) {
      bot.chat(`⚠️ Meine Gesundheit ist kritisch!`);
    }
  });

  bot.on('death', () => {
    console.log(`💀 ${name} ist gestorben!`);
    bot.chat(`Ich bin gestorben... respawne...`);
    state.morale -= 20;
  });

  bot.on('error', console.error);

  // HTTP API for this bot
  const server = Bun.serve({
    port: apiPort,
    async fetch(req) {
      const url = new URL(req.url);
      
      if (url.pathname === '/health') {
        return Response.json({ status: 'healthy', service: `colony-bot-${name}` });
      }
      
      if (url.pathname === '/status') {
        return Response.json({
          ...state,
          connected: bot.entity !== null
        });
      }
      
      if (url.pathname === '/environment') {
        return Response.json(analyzeEnvironment(bot));
      }
      
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
  });

  console.log(`🌐 ${name} API auf http://localhost:${apiPort}`);
}

// ============================================================================
// MAIN
// ============================================================================

const BOT_NAME = process.argv[2] || 'ColonyBot';
const SERVER_HOST = process.argv[3] || 'localhost';
const SERVER_PORT = parseInt(process.argv[4] || '25565');
const API_PORT = parseInt(process.argv[5] || '8950');

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║              🤖 TOOBIX COLONY BOT v1.0                            ║
║                                                                     ║
║   Bot: ${BOT_NAME.padEnd(58)}║
║   Server: ${(SERVER_HOST + ':' + SERVER_PORT).padEnd(55)}║
║   API: http://localhost:${API_PORT}                                       ║
╚════════════════════════════════════════════════════════════════════╝
`);

createColonyBot(BOT_NAME, SERVER_HOST, SERVER_PORT, API_PORT);
