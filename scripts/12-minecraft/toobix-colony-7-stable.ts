/**
 * 🏰 TOOBIX 7-BOT COLONY - STABLE VERSION
 * 
 * 7 Bots mit einzigartigen Rollen:
 * 1. Guardian (🛡️) - Beschützt die Kolonie, bekämpft Monster
 * 2. Gatherer (🪓) - Sammelt Holz und Ressourcen
 * 3. Miner (⛏️) - Gräbt nach Stein und Erzen
 * 4. Builder (🏗️) - Baut Strukturen und Shelter
 * 5. Farmer (🌾) - Pflanzt und erntet Nahrung
 * 6. Scout (🔭) - Erkundet die Umgebung
 * 7. Alchemist (⚗️) - Craftet Items und verwaltet Vorräte
 */

import mineflayer from 'mineflayer';
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============ CONFIGURATION ============
const SERVER_HOST = 'localhost';
const SERVER_PORT = 25565;
const MEMORY_FILE = './colony-7-memory.json';

// ============ BOT DEFINITIONS ============
interface BotRole {
  name: string;
  emoji: string;
  color: string;
  primaryTask: string;
  spawnOffset: { x: number; z: number };
}

const ROLES: BotRole[] = [
  { name: 'Guardian', emoji: '🛡️', color: 'red', primaryTask: 'protect', spawnOffset: { x: 0, z: 0 } },
  { name: 'Gatherer', emoji: '🪓', color: 'green', primaryTask: 'wood', spawnOffset: { x: 5, z: 0 } },
  { name: 'Miner', emoji: '⛏️', color: 'gray', primaryTask: 'mine', spawnOffset: { x: -5, z: 0 } },
  { name: 'Builder', emoji: '🏗️', color: 'yellow', primaryTask: 'build', spawnOffset: { x: 0, z: 5 } },
  { name: 'Farmer', emoji: '🌾', color: 'lime', primaryTask: 'farm', spawnOffset: { x: 0, z: -5 } },
  { name: 'Scout', emoji: '🔭', color: 'blue', primaryTask: 'explore', spawnOffset: { x: 5, z: 5 } },
  { name: 'Alchemist', emoji: '⚗️', color: 'purple', primaryTask: 'craft', spawnOffset: { x: -5, z: -5 } },
];

// ============ COLONY STATE ============
interface ColonyMemory {
  startTime: number;
  daysSurvived: number;
  totalWood: number;
  totalStone: number;
  totalFood: number;
  deaths: number;
  shelterBuilt: boolean;
  baseLocation: { x: number; y: number; z: number } | null;
}

let memory: ColonyMemory = {
  startTime: Date.now(),
  daysSurvived: 0,
  totalWood: 0,
  totalStone: 0,
  totalFood: 0,
  deaths: 0,
  shelterBuilt: false,
  baseLocation: null,
};

// ============ ACTIVE BOTS ============
const activeBots: Map<string, mineflayer.Bot> = new Map();
let isShuttingDown = false;

// ============ UTILITY FUNCTIONS ============
function log(role: BotRole, message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${role.emoji} ${role.name}: ${message}`);
}

function saveMemory() {
  try {
    writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (e) {
    // Ignore save errors
  }
}

function loadMemory() {
  try {
    if (existsSync(MEMORY_FILE)) {
      memory = JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
    }
  } catch (e) {
    // Use default memory
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ BOT CREATION ============
async function createBot(role: BotRole): Promise<mineflayer.Bot | null> {
  return new Promise((resolve) => {
    const botName = `Toobix${role.name}`;
    
    try {
      const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: botName,
        hideErrors: true,
      });

      const spawnTimeout = setTimeout(() => {
        log(role, '⏱️ Spawn timeout - skipping');
        resolve(null);
      }, 30000);

      bot.once('spawn', () => {
        clearTimeout(spawnTimeout);
        log(role, '✅ Spawned!');
        
        // Load pathfinder
        try {
          bot.loadPlugin(pathfinder);
        } catch (e) {
          // Plugin might already be loaded
        }
        
        activeBots.set(role.name, bot);
        resolve(bot);
      });

      bot.on('error', (err) => {
        if (!isShuttingDown) {
          log(role, `❌ ${err.message}`);
        }
      });

      bot.on('kicked', (reason) => {
        log(role, `🚫 Kicked: ${reason}`);
        activeBots.delete(role.name);
      });

      bot.on('end', () => {
        if (!isShuttingDown) {
          log(role, '🔌 Disconnected');
        }
        activeBots.delete(role.name);
      });

      bot.on('death', () => {
        log(role, '💀 Died! Respawning...');
        memory.deaths++;
        saveMemory();
      });

    } catch (err: any) {
      log(role, `❌ Creation failed: ${err.message}`);
      resolve(null);
    }
  });
}

// ============ BOT TASKS ============
function isNight(bot: mineflayer.Bot): boolean {
  const time = bot.time.timeOfDay;
  return time >= 13000 && time <= 23000;
}

function countItems(bot: mineflayer.Bot, nameContains: string): number {
  return bot.inventory.items()
    .filter(item => item.name.includes(nameContains))
    .reduce((sum, item) => sum + item.count, 0);
}

async function gatherWood(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  const logs = bot.findBlocks({
    matching: block => block.name.includes('log'),
    maxDistance: 32,
    count: 1,
  });

  if (logs.length === 0) {
    // Wander to find trees
    const randomX = bot.entity.position.x + (Math.random() - 0.5) * 20;
    const randomZ = bot.entity.position.z + (Math.random() - 0.5) * 20;
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(randomX, bot.entity.position.y, randomZ, 2));
    } catch (e) {
      // Movement failed, that's okay
    }
    return;
  }

  const logPos = logs[0];
  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(logPos.x, logPos.y, logPos.z, 1));
    
    const block = bot.blockAt(logPos);
    if (block && block.name.includes('log')) {
      await bot.dig(block);
      memory.totalWood++;
      const woodCount = countItems(bot, 'log');
      log(role, `🪵 Wood: ${woodCount}`);
      saveMemory();
    }
  } catch (e) {
    // Dig failed, that's okay
  }
}

async function mineStone(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  const stones = bot.findBlocks({
    matching: block => block.name === 'stone' || block.name === 'cobblestone',
    maxDistance: 16,
    count: 1,
  });

  if (stones.length === 0) {
    // Try to dig down safely
    const belowPos = bot.entity.position.offset(0, -1, 0);
    const block = bot.blockAt(belowPos);
    if (block && (block.name === 'stone' || block.name === 'dirt' || block.name === 'grass_block')) {
      try {
        await bot.dig(block);
        memory.totalStone++;
        log(role, `⛏️ Digging down...`);
      } catch (e) {
        // Dig failed
      }
    }
    return;
  }

  const stonePos = stones[0];
  try {
    const movements = new Movements(bot);
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(stonePos.x, stonePos.y, stonePos.z, 1));
    
    const block = bot.blockAt(stonePos);
    if (block) {
      await bot.dig(block);
      memory.totalStone++;
      const stoneCount = countItems(bot, 'stone') + countItems(bot, 'cobble');
      log(role, `🪨 Stone: ${stoneCount}`);
      saveMemory();
    }
  } catch (e) {
    // Mine failed
  }
}

async function guardArea(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  // Look for hostile mobs
  const hostiles = Object.values(bot.entities).filter(entity => 
    entity.type === 'hostile' && 
    entity.position.distanceTo(bot.entity.position) < 16
  );

  if (hostiles.length > 0) {
    const target = hostiles[0];
    log(role, `⚔️ Fighting ${target.name}!`);
    try {
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalFollow(target, 2));
      bot.attack(target);
    } catch (e) {
      // Attack failed
    }
  } else {
    // Patrol around spawn
    const patrolX = bot.entity.position.x + (Math.random() - 0.5) * 10;
    const patrolZ = bot.entity.position.z + (Math.random() - 0.5) * 10;
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(patrolX, bot.entity.position.y, patrolZ, 2));
    } catch (e) {
      // Patrol failed
    }
  }
}

async function explore(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  // Move in a random direction
  const angle = Math.random() * Math.PI * 2;
  const distance = 20 + Math.random() * 20;
  const targetX = bot.entity.position.x + Math.cos(angle) * distance;
  const targetZ = bot.entity.position.z + Math.sin(angle) * distance;

  log(role, `🧭 Exploring...`);
  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(targetX, bot.entity.position.y, targetZ, 3));
  } catch (e) {
    // Exploration failed
  }
}

async function farm(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  // Look for crops or seeds
  const crops = bot.findBlocks({
    matching: block => 
      block.name.includes('wheat') || 
      block.name.includes('carrot') || 
      block.name.includes('potato'),
    maxDistance: 32,
    count: 1,
  });

  if (crops.length > 0) {
    const cropPos = crops[0];
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(cropPos.x, cropPos.y, cropPos.z, 1));
      
      const block = bot.blockAt(cropPos);
      if (block) {
        await bot.dig(block);
        memory.totalFood++;
        log(role, `🌾 Harvested!`);
        saveMemory();
      }
    } catch (e) {
      // Harvest failed
    }
  } else {
    // Gather seeds from grass
    const grass = bot.findBlocks({
      matching: block => block.name === 'short_grass' || block.name === 'tall_grass',
      maxDistance: 16,
      count: 1,
    });

    if (grass.length > 0) {
      try {
        const movements = new Movements(bot);
        movements.canDig = false;
        bot.pathfinder.setMovements(movements);
        await bot.pathfinder.goto(new goals.GoalNear(grass[0].x, grass[0].y, grass[0].z, 1));
        
        const block = bot.blockAt(grass[0]);
        if (block) {
          await bot.dig(block);
          log(role, `🌱 Collecting seeds...`);
        }
      } catch (e) {
        // Seed collection failed
      }
    }
  }
}

async function craft(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  // Check if we have logs to craft
  const logs = countItems(bot, 'log');
  
  if (logs >= 1) {
    try {
      // Try to craft planks
      const plankRecipe = bot.recipesFor(bot.registry.itemsByName['oak_planks']?.id ?? 0)[0];
      if (plankRecipe) {
        await bot.craft(plankRecipe, 1);
        log(role, `🔨 Crafted planks!`);
      }
    } catch (e) {
      log(role, `⚗️ Gathering materials...`);
      // Gather wood if we can't craft
      await gatherWood(bot, role);
    }
  } else {
    // Help gather wood
    await gatherWood(bot, role);
  }
}

async function build(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  // Check if we have building materials
  const planks = countItems(bot, 'plank');
  const cobble = countItems(bot, 'cobblestone');

  if (planks >= 4 || cobble >= 4) {
    log(role, `🏗️ Building shelter...`);
    // Simple shelter: place blocks around
    const basePos = bot.entity.position.floored();
    const directions = [
      { x: 1, z: 0 },
      { x: -1, z: 0 },
      { x: 0, z: 1 },
      { x: 0, z: -1 },
    ];

    for (const dir of directions) {
      const placePos = basePos.offset(dir.x, 0, dir.z);
      const refBlock = bot.blockAt(placePos.offset(0, -1, 0));
      if (refBlock) {
        const item = bot.inventory.items().find(i => i.name.includes('plank') || i.name.includes('cobblestone'));
        if (item) {
          try {
            await bot.equip(item, 'hand');
            await bot.placeBlock(refBlock, { x: 0, y: 1, z: 0 } as any);
          } catch (e) {
            // Place failed
          }
        }
      }
    }
    memory.shelterBuilt = true;
    saveMemory();
  } else {
    // Gather materials
    log(role, `🏗️ Need more materials...`);
    await gatherWood(bot, role);
  }
}

// ============ MAIN BOT LOOP ============
async function runBotLoop(bot: mineflayer.Bot, role: BotRole): Promise<void> {
  log(role, 'Starting work loop...');
  
  while (!isShuttingDown && activeBots.has(role.name)) {
    try {
      // Check for night
      if (isNight(bot)) {
        log(role, '🌙 Night - taking shelter...');
        await sleep(5000);
        continue;
      }

      // Execute role-specific task
      switch (role.primaryTask) {
        case 'protect':
          await guardArea(bot, role);
          break;
        case 'wood':
          await gatherWood(bot, role);
          break;
        case 'mine':
          await mineStone(bot, role);
          break;
        case 'build':
          await build(bot, role);
          break;
        case 'farm':
          await farm(bot, role);
          break;
        case 'explore':
          await explore(bot, role);
          break;
        case 'craft':
          await craft(bot, role);
          break;
        default:
          await gatherWood(bot, role);
      }

      // Small delay between actions
      await sleep(2000);
      
    } catch (err: any) {
      if (!isShuttingDown) {
        log(role, `⚠️ Error: ${err.message}`);
      }
      await sleep(3000);
    }
  }
}

// ============ COLONY STATUS ============
function printStatus() {
  console.log('\n📊 COLONY STATUS:');
  console.log(`   🪵 Wood: ${memory.totalWood}`);
  console.log(`   🪨 Stone: ${memory.totalStone}`);
  console.log(`   🍞 Food: ${memory.totalFood}`);
  console.log(`   💀 Deaths: ${memory.deaths}`);
  console.log(`   🤖 Active Bots: ${activeBots.size}/7`);
  console.log('');
}

// ============ MAIN ============
async function main() {
  console.log('\n🏰 TOOBIX 7-BOT COLONY');
  console.log('='.repeat(40));
  
  loadMemory();

  // Global error handlers
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err.message);
  });
  
  process.on('unhandledRejection', (reason: any) => {
    console.error('Unhandled rejection:', reason?.message || reason);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down colony...');
    isShuttingDown = true;
    saveMemory();
    
    for (const [name, bot] of activeBots) {
      try {
        bot.quit();
      } catch (e) {
        // Ignore quit errors
      }
    }
    
    setTimeout(() => process.exit(0), 2000);
  });

  // Keep Bun process alive
  Bun.serve({
    port: 8765,
    fetch() {
      return new Response(JSON.stringify({
        status: 'running',
        bots: activeBots.size,
        memory: memory
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
  console.log('Colony server on http://localhost:8765\n');

  // Spawn bots sequentially with delay
  for (const role of ROLES) {
    console.log(`Spawning ${role.emoji} ${role.name}...`);
    const bot = await createBot(role);
    
    if (bot) {
      // Start the bot's work loop in background
      runBotLoop(bot, role).catch(err => {
        log(role, `Loop error: ${err.message}`);
      });
    }
    
    // Delay between spawns to avoid overwhelming server
    await sleep(5000);
  }

  console.log(`\n✅ ${activeBots.size}/${ROLES.length} Bots aktiv!\n`);

  // Status updates every 30 seconds
  setInterval(() => {
    if (!isShuttingDown) {
      printStatus();
      saveMemory();
    }
  }, 30000);
}

main().catch(console.error);
