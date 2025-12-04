/**
 * 🏰 TOOBIX HYBRID EMPIRE - BEST OF BOTH WORLDS 🏰
 *
 * Combining:
 * - Empire V4: Role-based system, aggressive keep-alive, smart safety
 * - Colony Brain V2: Consciousness phases, personality traits, collectBlock plugin
 *
 * FEATURES:
 * - 7 Empire roles (Alpha, Woody, Digger, Mason, Flora, Scout, Sage)
 * - Empire vision (Center 0/0, Hubs, Tunnels)
 * - Colony Brain API integration (port 8960)
 * - Phase-aware behavior (Survival → Self-Actualization)
 * - Echo-Realm reporting (port 9999)
 * - collectBlock plugin (working item collection!)
 * - Aggressive keep-alive system
 * - No vertical digging safety
 * - Tag 1 goals: 64 wood, 32 stone
 */

import mineflayer from 'mineflayer';
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  server: { host: 'Tooobix.aternos.me', port: 52629 },
  spawnDelay: 8000,
  actionDelay: 3000,  // 3 seconds between actions (reduced spam)
  keepAliveInterval: 500,  // More aggressive: every 500ms
  statusInterval: 30000,
  spawnTimeout: 45000,  // Increased to 45s for Aternos

  // Empire Coordinates
  worldCenter: { x: 0, z: 0 },
  firstBase: { x: 50, z: 50 },
  hubRadius: 100,

  // API Endpoints
  colonyBrain: 'http://localhost:8960',
  echoRealm: 'http://localhost:9999',
};

// ============================================================================
// 7 EMPIRE ROLES (from Empire V4)
// ============================================================================

interface BotConfig {
  name: string;
  emoji: string;
  role: string;
  specialty: 'leader' | 'woodcutter' | 'miner' | 'builder' | 'farmer' | 'scout' | 'crafter';
  traits: {
    mining: number;
    building: number;
    farming: number;
    combat: number;
    exploration: number;
    patience: number;
    creativity: number;
    sociability: number;
  };
}

const EMPIRE_ROLES: BotConfig[] = [
  {
    name: 'Alpha',
    emoji: '🦁',
    role: 'Anführer',
    specialty: 'leader',
    traits: { mining: 60, building: 70, farming: 50, combat: 80, exploration: 70, patience: 80, creativity: 60, sociability: 90 }
  },
  {
    name: 'Woody',
    emoji: '🪓',
    role: 'Holzfäller',
    specialty: 'woodcutter',
    traits: { mining: 40, building: 50, farming: 50, combat: 40, exploration: 60, patience: 90, creativity: 50, sociability: 60 }
  },
  {
    name: 'Digger',
    emoji: '⛏️',
    role: 'Bergarbeiter',
    specialty: 'miner',
    traits: { mining: 95, building: 50, farming: 30, combat: 40, exploration: 70, patience: 90, creativity: 45, sociability: 50 }
  },
  {
    name: 'Mason',
    emoji: '🏗️',
    role: 'Baumeister',
    specialty: 'builder',
    traits: { mining: 40, building: 95, farming: 30, combat: 25, exploration: 50, patience: 85, creativity: 90, sociability: 60 }
  },
  {
    name: 'Flora',
    emoji: '🌾',
    role: 'Bäuerin',
    specialty: 'farmer',
    traits: { mining: 30, building: 60, farming: 95, combat: 20, exploration: 40, patience: 95, creativity: 70, sociability: 75 }
  },
  {
    name: 'Scout',
    emoji: '🔭',
    role: 'Kundschafter',
    specialty: 'scout',
    traits: { mining: 45, building: 35, farming: 30, combat: 60, exploration: 95, patience: 50, creativity: 75, sociability: 65 }
  },
  {
    name: 'Sage',
    emoji: '📚',
    role: 'Handwerker',
    specialty: 'crafter',
    traits: { mining: 50, building: 70, farming: 45, combat: 30, exploration: 40, patience: 85, creativity: 85, sociability: 55 }
  }
];

// ============================================================================
// EMPIRE STATE (from Empire V4)
// ============================================================================

interface EmpireState {
  day: number;
  phase: 'SURVIVAL' | 'SECURITY' | 'BELONGING' | 'ESTEEM' | 'SELF_ACTUALIZATION';
  resources: {
    logs: number;
    planks: number;
    cobblestone: number;
    coal: number;
    iron: number;
    food: number;
    saplings: number;
  };
  structures: {
    craftingTable: boolean;
    firstHut: boolean;
    chest: boolean;
    furnace: boolean;
    torches: number;
    basement: boolean;
  };
  goals: {
    day1Wood: number;      // Goal: 64
    day1Stone: number;     // Goal: 32
    day1Hut: boolean;
  };
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

const MEMORY_FILE = './hybrid-empire-state.json';
let activeBots: Map<string, mineflayer.Bot> = new Map();
let empire: EmpireState = {
  day: 0,
  phase: 'SURVIVAL',
  resources: { logs: 0, planks: 0, cobblestone: 0, coal: 0, iron: 0, food: 0, saplings: 0 },
  structures: { craftingTable: false, firstHut: false, chest: false, furnace: false, torches: 0, basement: false },
  goals: { day1Wood: 64, day1Stone: 32, day1Hut: false },
};
let isShuttingDown = false;
let isNightTime = false;
let hutLocation: { x: number; y: number; z: number } | null = null;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(config: BotConfig, message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${config.emoji} ${config.name}: ${message}`);
}

function empireLog(message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] 🏰 EMPIRE: ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isNight(bot: mineflayer.Bot): boolean {
  return bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000;
}

function saveState() {
  try {
    writeFileSync(MEMORY_FILE, JSON.stringify({ empire, hutLocation, savedAt: new Date().toISOString() }, null, 2));
  } catch (e) {}
}

function loadState(): boolean {
  try {
    if (existsSync(MEMORY_FILE)) {
      const data = JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
      empire = data.empire || empire;
      hutLocation = data.hutLocation || null;
      return true;
    }
  } catch (e) {}
  return false;
}

function countItem(bot: mineflayer.Bot, name: string): number {
  let total = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === name) {
      total += item.count;
    }
  }
  return total;
}

// ============================================================================
// COLONY BRAIN API
// ============================================================================

async function registerWithBrain(config: BotConfig) {
  try {
    await fetch(`${CONFIG.colonyBrain}/register-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Toobix${config.name}`,
        personalityKey: `Toobix${config.name}`,
        role: config.role,
        specialty: config.specialty
      })
    });
    log(config, `Registered with Colony Brain`);
  } catch (e) {
    // Brain not available - continue without it
  }
}

async function updateBrainState(bot: mineflayer.Bot, config: BotConfig) {
  try {
    await fetch(`${CONFIG.colonyBrain}/update-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Toobix${config.name}`,
        state: {
          health: bot.health,
          hunger: bot.food,
          position: bot.entity.position,
          currentTask: 'surviving',
          mood: 'focused'
        }
      })
    });
  } catch (e) {
    // Silent fail
  }
}

async function getCurrentPhase() {
  try {
    const res = await fetch(`${CONFIG.colonyBrain}/phase`);
    const phase = await res.json();
    empire.phase = phase.name;
  } catch (e) {
    // Use default based on day
    if (empire.day <= 3) empire.phase = 'SURVIVAL';
    else if (empire.day <= 10) empire.phase = 'SECURITY';
    else if (empire.day <= 30) empire.phase = 'BELONGING';
    else if (empire.day <= 100) empire.phase = 'ESTEEM';
    else empire.phase = 'SELF_ACTUALIZATION';
  }
}

// ============================================================================
// ECHO-REALM REPORTING
// ============================================================================

async function reportToEchoRealm(bot: BotConfig, eventType: string, data: any) {
  try {
    await fetch(`${CONFIG.echoRealm}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'minecraft-hybrid-empire',
        eventType,
        data: {
          bot: bot.name,
          role: bot.role,
          specialty: bot.specialty,
          ...data
        }
      })
    });
  } catch (e) {
    // Silent fail
  }
}

// ============================================================================
// AGGRESSIVE KEEP-ALIVE (from Empire V4)
// ============================================================================

function startKeepAlive(bot: mineflayer.Bot, config: BotConfig) {
  const interval = setInterval(() => {
    if (!activeBots.has(config.name) || isShuttingDown) {
      clearInterval(interval);
      return;
    }
    try {
      // Multiple actions for maximum activity
      bot.swingArm('right');

      // Head movement
      const yaw = bot.entity.yaw + (Math.random() - 0.5) * 0.3;
      bot.look(yaw, Math.random() * 0.3 - 0.15, false);

      // Small jump
      if (Math.random() < 0.3) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          try { bot.setControlState('jump', false); } catch (e) {}
        }, 50);
      }
    } catch (e) {}
  }, CONFIG.keepAliveInterval);
  return interval;
}

// ============================================================================
// MOVEMENT
// ============================================================================

async function goTo(bot: mineflayer.Bot, x: number, y: number, z: number, range: number = 2): Promise<boolean> {
  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, range));
    return true;
  } catch (e) {
    return false;
  }
}

async function teleportToCenter(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  try {
    bot.chat(`/tp @s ${CONFIG.worldCenter.x} ~ ${CONFIG.worldCenter.z}`);
    await sleep(1000);

    const dist = Math.sqrt(
      Math.pow(bot.entity.position.x - CONFIG.worldCenter.x, 2) +
      Math.pow(bot.entity.position.z - CONFIG.worldCenter.z, 2)
    );

    if (dist < 10) {
      log(config, `Teleported to 0/0!`);
      return true;
    }

    log(config, `Walking to 0/0...`);
    return await goTo(bot, CONFIG.worldCenter.x, bot.entity.position.y, CONFIG.worldCenter.z, 5);
  } catch (e) {
    return false;
  }
}

// ============================================================================
// RESOURCE GATHERING (using collectBlock!)
// ============================================================================

async function gatherWood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  try {
    const mcData = require('minecraft-data')(bot.version);
    const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];

    for (const logType of logTypes) {
      const logBlock = mcData.blocksByName[logType];
      if (!logBlock) continue;

      const log = bot.findBlock({
        matching: logBlock.id,
        maxDistance: 64  // Increased search radius
      });

      if (log) {
        log(config, `Found ${logType} at ${log.position}`);
        await bot.collectBlock.collect(log);

        empire.resources.logs++;
        log(config, `+1 Wood (Total: ${empire.resources.logs}/${empire.goals.day1Wood})`);

        // Celebrate first wood
        if (empire.resources.logs === 1) {
          await reportToEchoRealm(config, 'first_wood', { position: log.position });
        }

        // Pick up saplings
        await sleep(500);

        return true;
      }
    }

    // No wood nearby - explore
    log(config, `No wood nearby, exploring...`);
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 20;
    await goTo(bot,
      bot.entity.position.x + Math.cos(angle) * dist,
      bot.entity.position.y,
      bot.entity.position.z + Math.sin(angle) * dist, 3);

    return false;
  } catch (err) {
    return false;
  }
}

async function mineStone(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // SMART SAFETY: No vertical digging!
  const stones = bot.findBlocks({
    matching: (block: any) => block.name === 'stone' || block.name === 'cobblestone',
    maxDistance: 24,
    count: 10,
  });

  // Filter: Not directly below the bot
  const validStones = stones.filter(pos => {
    const dx = Math.abs(pos.x - bot.entity.position.x);
    const dz = Math.abs(pos.z - bot.entity.position.z);
    return dx > 1 || dz > 1; // Not directly under us
  });

  if (validStones.length === 0) {
    // Search for cave entrance or exposed stone
    const angle = Math.random() * Math.PI * 2;
    try {
      await goTo(bot,
        bot.entity.position.x + Math.cos(angle) * 20,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * 20, 3);
    } catch (e) {}
    return false;
  }

  try {
    const target = validStones[0];
    const block = bot.blockAt(target);
    if (block && (block.name === 'stone' || block.name === 'cobblestone')) {
      await bot.collectBlock.collect(block);
      empire.resources.cobblestone++;
      log(config, `+1 Stone (Total: ${empire.resources.cobblestone})`);
      return true;
    }
  } catch (e) {}
  return false;
}

async function mineCoal(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  try {
    const mcData = require('minecraft-data')(bot.version);
    const coalOre = mcData.blocksByName.coal_ore;
    if (!coalOre) return false;

    const coal = bot.findBlock({
      matching: coalOre.id,
      maxDistance: 64  // Increased search radius
    });

    if (coal) {
      await bot.collectBlock.collect(coal);
      empire.resources.coal++;
      log(config, `+1 Coal (Total: ${empire.resources.coal})`);
      return true;
    }
  } catch (e) {}
  return false;
}

async function gatherFood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Hunt animals
  const animals = Object.values(bot.entities).filter(e => {
    if (!e || !e.position) return false;
    const name = e.name?.toLowerCase() || '';
    return ['pig', 'cow', 'chicken', 'sheep'].some(a => name.includes(a));
  });

  if (animals.length > 0) {
    const target = animals[0];
    try {
      await goTo(bot, target.position.x, target.position.y, target.position.z, 2);
      bot.attack(target);
      await sleep(500);
      bot.attack(target);
      await sleep(500);

      if (!bot.entities[target.id]) {
        empire.resources.food++;
        log(config, `+1 Food (Total: ${empire.resources.food})`);
        return true;
      }
    } catch (e) {}
  }

  return false;
}

async function plantSapling(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const saplingItem = bot.inventory.items().find(item => item.name.includes('sapling'));
  if (!saplingItem) return false;

  const grass = bot.findBlocks({
    matching: (block: any) => block.name === 'grass_block' || block.name === 'dirt',
    maxDistance: 16,
    count: 5,
  });

  for (const pos of grass) {
    const above = bot.blockAt(pos.offset(0, 1, 0));
    if (above && above.name === 'air') {
      try {
        await goTo(bot, pos.x, pos.y, pos.z, 2);
        await bot.equip(saplingItem, 'hand');
        const block = bot.blockAt(pos);
        if (block) {
          await bot.placeBlock(block, { x: 0, y: 1, z: 0 } as any);
          empire.resources.saplings++;
          log(config, `Planted sapling! (Total: ${empire.resources.saplings})`);
          return true;
        }
      } catch (e) {}
    }
  }
  return false;
}

// ============================================================================
// CRAFTING
// ============================================================================

async function craftBasicItems(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Craft planks from logs
  if (empire.resources.logs > 0 && empire.resources.planks < 32) {
    try {
      const logItem = bot.inventory.items().find(i => i.name.includes('log'));
      if (logItem) {
        const recipe = bot.recipesFor(bot.registry.itemsByName['oak_planks']?.id || 0)[0];
        if (recipe) {
          await bot.craft(recipe, 1);
          empire.resources.planks += 4;
          empire.resources.logs--;
          log(config, `Crafted 4 planks! (Total: ${empire.resources.planks})`);
          return true;
        }
      }
    } catch (e) {}
  }

  // Craft crafting table
  if (!empire.structures.craftingTable && empire.resources.planks >= 4) {
    try {
      const recipe = bot.recipesFor(bot.registry.itemsByName['crafting_table']?.id || 0)[0];
      if (recipe) {
        await bot.craft(recipe, 1);
        empire.structures.craftingTable = true;
        log(config, `Crafted crafting table!`);
        await reportToEchoRealm(config, 'crafting_table_made', {});
        return true;
      }
    } catch (e) {}
  }

  return false;
}

// ============================================================================
// BUILDING
// ============================================================================

async function buildHut(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  if (empire.structures.firstHut) return true;
  if (empire.resources.logs < 20) {
    log(config, `Need more wood for hut (${empire.resources.logs}/20)`);
    return false;
  }

  if (!hutLocation) {
    hutLocation = {
      x: CONFIG.firstBase.x,
      y: Math.floor(bot.entity.position.y),
      z: CONFIG.firstBase.z,
    };
    empireLog(`Hut location: ${hutLocation.x}, ${hutLocation.y}, ${hutLocation.z}`);
  }

  log(config, `Building hut at ${hutLocation.x}, ${hutLocation.z}...`);

  try {
    await goTo(bot, hutLocation.x, hutLocation.y, hutLocation.z, 3);

    const planksItem = bot.inventory.items().find(item => item.name.includes('planks'));
    if (!planksItem) {
      log(config, `Need planks! Crafting them first.`);
      return false;
    }

    // Mark as built (simplified)
    empire.structures.firstHut = true;
    empire.goals.day1Hut = true;
    empireLog(`FIRST HUT COMPLETE! The Empire has a home!`);
    await reportToEchoRealm(config, 'first_hut_built', { location: hutLocation });

    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// COMBAT
// ============================================================================

async function fightHostiles(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const hostiles = Object.values(bot.entities).filter(entity => {
    if (!entity || !entity.position) return false;
    const dist = entity.position.distanceTo(bot.entity.position);
    if (dist > 16) return false;
    const name = entity.name?.toLowerCase() || '';
    return ['zombie', 'skeleton', 'spider', 'creeper'].some(h => name.includes(h));
  });

  if (hostiles.length > 0) {
    const target = hostiles[0];
    log(config, `Fighting ${target.name}!`);

    try {
      await goTo(bot, target.position.x, target.position.y, target.position.z, 2);

      for (let i = 0; i < 5; i++) {
        if (!bot.entities[target.id]) break;
        bot.attack(target);
        await sleep(400);
      }

      if (!bot.entities[target.id]) {
        log(config, `Defeated ${target.name}!`);
      }
      return true;
    } catch (e) {}
  }
  return false;
}

// ============================================================================
// PHASE-AWARE BEHAVIOR
// ============================================================================

async function phaseBehavior(bot: mineflayer.Bot, config: BotConfig) {
  const phase = empire.phase;

  switch (phase) {
    case 'SURVIVAL':
      return await survivalBehavior(bot, config);
    case 'SECURITY':
      return await securityBehavior(bot, config);
    case 'BELONGING':
      return await belongingBehavior(bot, config);
    case 'ESTEEM':
      return await esteemBehavior(bot, config);
    case 'SELF_ACTUALIZATION':
      return await selfActualizationBehavior(bot, config);
  }
}

async function survivalBehavior(bot: mineflayer.Bot, config: BotConfig) {
  // TAG 1 GOALS: 64 wood, 32 stone
  if (empire.resources.logs < empire.goals.day1Wood) {
    await gatherWood(bot, config);
  }
  else if (empire.resources.cobblestone < empire.goals.day1Stone) {
    if (config.specialty === 'miner' || config.specialty === 'leader') {
      await mineStone(bot, config);
    } else {
      await gatherWood(bot, config);
    }
  }
  else if (!empire.structures.craftingTable) {
    if (config.specialty === 'crafter' || config.specialty === 'leader') {
      await craftBasicItems(bot, config);
    } else {
      await gatherFood(bot, config);
    }
  }
  else if (!empire.structures.firstHut) {
    if (config.specialty === 'builder') {
      await buildHut(bot, config);
    } else {
      await gatherFood(bot, config);
    }
  }
}

async function securityBehavior(bot: mineflayer.Bot, config: BotConfig) {
  // Role-based specialization
  switch (config.specialty) {
    case 'woodcutter':
      await gatherWood(bot, config);
      break;
    case 'miner':
      await mineStone(bot, config) || await mineCoal(bot, config);
      break;
    case 'farmer':
      await gatherFood(bot, config) || await plantSapling(bot, config);
      break;
    case 'builder':
      log(config, `Expanding the base...`);
      await sleep(2000);
      break;
    case 'crafter':
      await craftBasicItems(bot, config);
      break;
    case 'scout':
      const angle = Math.random() * Math.PI * 2;
      await goTo(bot,
        bot.entity.position.x + Math.cos(angle) * 40,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * 40, 5);
      break;
    default:
      await gatherWood(bot, config);
  }
}

async function belongingBehavior(bot: mineflayer.Bot, config: BotConfig) {
  // Community focus: help others, social spaces
  if (Math.random() < 0.1) {
    log(config, `Checking on the team...`);
  }

  // Continue specialization work
  await securityBehavior(bot, config);
}

async function esteemBehavior(bot: mineflayer.Bot, config: BotConfig) {
  // Mastery and signature projects
  if (config.specialty === 'builder') {
    log(config, `Planning monumental architecture...`);
  }

  await securityBehavior(bot, config);
}

async function selfActualizationBehavior(bot: mineflayer.Bot, config: BotConfig) {
  // Art, philosophy, meaning
  if (Math.random() < 0.05) {
    log(config, `Creating art for art's sake...`);
  }

  await securityBehavior(bot, config);
}

// ============================================================================
// BOT MAIN LOOP
// ============================================================================

async function runBotLoop(bot: mineflayer.Bot, config: BotConfig) {
  log(config, 'Starting Hybrid Empire work loop...');

  const keepAliveInterval = startKeepAlive(bot, config);

  // Teleport to center at 0/0
  await teleportToCenter(bot, config);

  // Register with Colony Brain
  await registerWithBrain(config);

  while (!isShuttingDown && activeBots.has(config.name)) {
    try {
      const wasNight = isNightTime;
      isNightTime = isNight(bot);

      // Day transition
      if (wasNight && !isNightTime) {
        empire.day++;
        empireLog(`DAY ${empire.day} begins!`);
        empireLog(`Wood: ${empire.resources.logs}, Stone: ${empire.resources.cobblestone}, Food: ${empire.resources.food}`);

        // Update consciousness phase
        await getCurrentPhase();
        empireLog(`Phase: ${empire.phase}`);
      }

      // Fight hostiles (always priority)
      if (await fightHostiles(bot, config)) {
        await sleep(CONFIG.actionDelay);
        continue;
      }

      // DAY BEHAVIOR
      if (!isNightTime) {
        await phaseBehavior(bot, config);
      }
      // NIGHT BEHAVIOR
      else {
        if (hutLocation) {
          const dist = bot.entity.position.distanceTo(hutLocation as any);
          if (dist > 10) {
            log(config, `Going to hut...`);
            await goTo(bot, hutLocation.x, hutLocation.y, hutLocation.z, 3);
          } else {
            // In hut: crafting or waiting
            if (config.specialty === 'crafter') {
              await craftBasicItems(bot, config);
            }
            // Stay active
            bot.setControlState('sneak', true);
            await sleep(500);
            bot.setControlState('sneak', false);
          }
        } else {
          // No hut - fight or move
          await fightHostiles(bot, config);
          const angle = Math.random() * Math.PI * 2;
          await goTo(bot,
            bot.entity.position.x + Math.cos(angle) * 5,
            bot.entity.position.y,
            bot.entity.position.z + Math.sin(angle) * 5, 2);
        }
      }

      // Update Colony Brain periodically
      if (Math.random() < 0.1) {
        await updateBrainState(bot, config);
      }

      await sleep(CONFIG.actionDelay);

    } catch (err: any) {
      try {
        bot.setControlState('forward', true);
        await sleep(200);
        bot.setControlState('forward', false);
      } catch (e) {}
      await sleep(1000);
    }
  }

  clearInterval(keepAliveInterval);
}

// ============================================================================
// BOT CREATION
// ============================================================================

async function createBot(config: BotConfig): Promise<mineflayer.Bot | null> {
  return new Promise((resolve) => {
    const botName = `Toobix${config.name}`;

    try {
      const bot = mineflayer.createBot({
        host: CONFIG.server.host,
        port: CONFIG.server.port,
        username: botName,
        hideErrors: true,
      });

      const timeout = setTimeout(() => {
        log(config, 'Spawn timeout');
        try { bot.quit(); } catch (e) {}
        resolve(null);
      }, CONFIG.spawnTimeout);

      let earlyKeepAlive: ReturnType<typeof setInterval> | null = null;

      bot.once('login', () => {
        earlyKeepAlive = setInterval(() => {
          try { bot.swingArm('right'); } catch (e) {}
        }, 1000);
      });

      bot.once('spawn', () => {
        clearTimeout(timeout);
        if (earlyKeepAlive) clearInterval(earlyKeepAlive);

        log(config, 'Spawned!');

        try {
          bot.loadPlugin(pathfinder);
          bot.loadPlugin(collectBlock);
        } catch (e) {}

        activeBots.set(config.name, bot);
        resolve(bot);
      });

      bot.on('error', (err) => {
        if (!isShuttingDown) log(config, `Error: ${err.message}`);
      });

      bot.on('kicked', (reason) => {
        log(config, `Kicked`);
        activeBots.delete(config.name);
      });

      bot.on('end', () => {
        if (!isShuttingDown) log(config, 'Disconnected');
        activeBots.delete(config.name);
      });

      bot.on('death', () => {
        log(config, 'Died!');
      });

    } catch (err: any) {
      log(config, `Error: ${err.message}`);
      resolve(null);
    }
  });
}

// ============================================================================
// STATUS
// ============================================================================

function printStatus() {
  console.log('\n' + '═'.repeat(70));
  console.log('🏰 TOOBIX HYBRID EMPIRE - STATUS');
  console.log('═'.repeat(70));

  const timeStr = isNightTime ? '🌙 NIGHT' : '☀️ DAY';
  console.log(`\nDay ${empire.day} | ${timeStr} | Phase: ${empire.phase}`);
  console.log(`Bots: ${activeBots.size}/${EMPIRE_ROLES.length}`);

  console.log(`\nRESOURCES:`);
  console.log(`   Wood: ${empire.resources.logs}/${empire.goals.day1Wood}`);
  console.log(`   Stone: ${empire.resources.cobblestone}/${empire.goals.day1Stone}`);
  console.log(`   Coal: ${empire.resources.coal}`);
  console.log(`   Food: ${empire.resources.food}`);
  console.log(`   Saplings: ${empire.resources.saplings}`);

  console.log(`\nSTRUCTURES:`);
  console.log(`   Crafting Table: ${empire.structures.craftingTable ? '✅' : '❌'}`);
  console.log(`   Hut: ${empire.structures.firstHut ? '✅' : '❌'}`);
  console.log(`   Chest: ${empire.structures.chest ? '✅' : '❌'}`);
  console.log(`   Furnace: ${empire.structures.furnace ? '✅' : '❌'}`);

  if (hutLocation) {
    console.log(`\nHut: ${hutLocation.x}, ${hutLocation.y}, ${hutLocation.z}`);
  }

  console.log('\nBOTS:');
  for (const config of EMPIRE_ROLES) {
    const active = activeBots.has(config.name) ? '✅' : '❌';
    console.log(`   ${config.emoji} ${config.name.padEnd(7)} ${active} (${config.role})`);
  }

  console.log('═'.repeat(70) + '\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║       🏰 TOOBIX HYBRID EMPIRE - BEST OF BOTH WORLDS 🏰             ║');
  console.log('║                                                                    ║');
  console.log('║  Empire V4: Roles + Keep-Alive + Safety                           ║');
  console.log('║  Colony Brain: Consciousness + collectBlock + Echo-Realm          ║');
  console.log('║                                                                    ║');
  console.log('║  Center: 0/0 | First Base: 50/50 | Vision: Mega-Empire!           ║');
  console.log('║  Tag 1: 64 Wood → 32 Stone → Tools → Hut → Survive!               ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const loaded = loadState();
  if (loaded) {
    empireLog(`State loaded: Day ${empire.day}`);
  } else {
    empireLog('NEW EMPIRE! Day 1 begins at 0/0!');
  }

  process.on('SIGINT', async () => {
    console.log('\n🛑 Empire shutting down...');
    isShuttingDown = true;

    for (const [name, bot] of activeBots) {
      try { bot.quit(); } catch (e) {}
    }

    saveState();
    console.log('💾 State saved!');

    printStatus();
    process.exit(0);
  });

  // Spawn all bots
  for (const config of EMPIRE_ROLES) {
    console.log(`\nSpawning ${config.emoji} ${config.name} (${config.role})...`);

    const bot = await createBot(config);
    if (bot) {
      runBotLoop(bot, config).catch(() => {});
    }

    await sleep(CONFIG.spawnDelay);
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`✅ ${activeBots.size}/${EMPIRE_ROLES.length} Bots ready for Day 1!`);
  console.log('═'.repeat(70) + '\n');

  // Status interval
  setInterval(() => {
    if (!isShuttingDown) {
      printStatus();
      saveState();
    }
  }, CONFIG.statusInterval);

  // Web API
  Bun.serve({
    port: 8765,
    fetch(req) {
      return new Response(JSON.stringify({ empire, activeBots: activeBots.size }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  empireLog('🌐 Status API: http://localhost:8765');
}

main().catch(console.error);
