/**
 * 🤖 ENHANCED COLONY BOT
 *
 * A bot that:
 * - Connects to Colony Brain (port 8960)
 * - Has unique personality from environment
 * - Communicates naturally (anti-spam)
 * - Helps other bots
 * - Shares resources
 * - Progresses through consciousness phases
 * - Reports to Echo-Realm
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';

const COLONY_BRAIN = 'http://localhost:8960';
const ECHO_REALM = 'http://localhost:9999';
const PERSONALITY_KEY = process.env.PERSONALITY || 'ToobixSmart';

const CONFIG = {
  host: 'localhost',
  port: 25565,
  username: PERSONALITY_KEY,
  version: '1.20.1'
};

// ============================================================================
// PERSONALITY & STATE
// ============================================================================

interface Personality {
  name: string;
  role: string;
  icon: string;
  traits: any;
  earlyFocus: string;
  midFocus: string;
  lateFocus: string;
  chatStyle: any;
  greetings: string[];
  celebrations: string[];
  concerns: string[];
  philosophies: string[];
}

let personality: Personality | null = null;
let currentPhase: any = null;

// Bot State
let bot: mineflayer.Bot;
let mcData: any;
let isReady = false;

// ============================================================================
// COLONY BRAIN API
// ============================================================================

async function fetchPersonality(): Promise<Personality> {
  try {
    const res = await fetch(`${COLONY_BRAIN}/personalities`);
    const all = await res.json();
    return all[PERSONALITY_KEY];
  } catch (e) {
    console.error('Failed to fetch personality:', e);
    throw e;
  }
}

async function registerWithBrain() {
  try {
    await fetch(`${COLONY_BRAIN}/register-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: PERSONALITY_KEY,
        personalityKey: PERSONALITY_KEY
      })
    });
    console.log(`[Brain] ${personality?.icon} ${PERSONALITY_KEY} registered`);
  } catch (e) {
    console.error('Failed to register with brain:', e);
  }
}

async function updateBrainState() {
  if (!bot || !personality) return;

  try {
    await fetch(`${COLONY_BRAIN}/update-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: PERSONALITY_KEY,
        state: {
          health: bot.health,
          hunger: bot.food,
          position: bot.entity.position,
          currentTask: 'surviving', // TODO: Track actual task
          mood: 'focused' // TODO: Calculate mood
        }
      })
    });
  } catch (e) {
    // Silent fail - not critical
  }
}

async function sendChat(to: string, type: string, content: string, importance: number = 5) {
  try {
    const res = await fetch(`${COLONY_BRAIN}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: PERSONALITY_KEY,
        to,
        type,
        content,
        importance
      })
    });
    const result = await res.json();

    if (result.sent) {
      bot.chat(content);
    }
  } catch (e) {
    // Silent fail
  }
}

async function reportHelp(helped: string, situation: string) {
  try {
    await fetch(`${COLONY_BRAIN}/help`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        helper: PERSONALITY_KEY,
        helped,
        situation
      })
    });
  } catch (e) {
    // Silent fail
  }
}

async function getCurrentPhase() {
  try {
    const res = await fetch(`${COLONY_BRAIN}/phase`);
    currentPhase = await res.json();
  } catch (e) {
    // Use default
    currentPhase = { name: 'SURVIVAL' };
  }
}

// ============================================================================
// ECHO-REALM REPORTING
// ============================================================================

async function reportToEchoRealm(eventType: string, data: any) {
  try {
    await fetch(`${ECHO_REALM}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'minecraft-bot',
        eventType,
        data: {
          bot: PERSONALITY_KEY,
          role: personality?.role,
          ...data
        }
      })
    });
  } catch (e) {
    // Silent fail
  }
}

// ============================================================================
// BOT BEHAVIOR
// ============================================================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function greet() {
  if (!personality) return;
  const greeting = pickRandom(personality.greetings);
  await sendChat('all', 'social', greeting, 3);
}

async function celebrate(reason: string) {
  if (!personality) return;
  const celebration = pickRandom(personality.celebrations);
  await sendChat('all', 'social', `${celebration} (${reason})`, 6);
  await reportToEchoRealm('celebration', { reason });
}

async function expressConcern(situation: string) {
  if (!personality) return;
  const concern = pickRandom(personality.concerns);
  await sendChat('all', 'social', concern, 7);
}

async function philosophize() {
  if (!personality || currentPhase?.name !== 'SELF_ACTUALIZATION') return;
  const thought = pickRandom(personality.philosophies);
  await sendChat('all', 'philosophical', thought, 4);
}

// ============================================================================
// SURVIVAL LOGIC (Phase-Aware)
// ============================================================================

async function survivalLoop() {
  if (!isReady) return;

  await getCurrentPhase();

  const phase = currentPhase?.name || 'SURVIVAL';

  console.log(`[${PERSONALITY_KEY}] Phase: ${phase}`);

  switch (phase) {
    case 'SURVIVAL':
      await surviveBehavior();
      break;
    case 'SECURITY':
      await securityBehavior();
      break;
    case 'BELONGING':
      await belongingBehavior();
      break;
    case 'ESTEEM':
      await esteemBehavior();
      break;
    case 'SELF_ACTUALIZATION':
      await selfActualizationBehavior();
      break;
  }

  // Update brain every 30s
  await updateBrainState();
}

async function surviveBehavior() {
  // SURVIVAL: Gather wood, build shelter, get food

  console.log(`[${PERSONALITY_KEY}] SURVIVAL mode: Basic needs`);

  // Check if we have shelter
  // TODO: Coordinate with others to build ONE shared house

  // For now: Basic survival
  const wood = countItem('oak_log') + countItem('oak_planks');

  if (wood < 10) {
    console.log(`[${PERSONALITY_KEY}] Need wood...`);
    await gatherWood();
  } else {
    console.log(`[${PERSONALITY_KEY}] Have ${wood} wood, building shelter...`);
    await buildSimpleShelter();
  }
}

async function securityBehavior() {
  // SECURITY: Tools, farm, defense
  console.log(`[${PERSONALITY_KEY}] SECURITY mode: Optimization`);

  // Role-based behavior
  if (personality?.traits.mining > 70) {
    console.log(`[${PERSONALITY_KEY}] Mining role - gathering stone`);
    // Go mining
  } else if (personality?.traits.farming > 70) {
    console.log(`[${PERSONALITY_KEY}] Farming role - planting crops`);
    // Farm
  } else if (personality?.traits.building > 70) {
    console.log(`[${PERSONALITY_KEY}] Building role - improving structures`);
    // Build
  }
}

async function belongingBehavior() {
  // BELONGING: Social spaces, help others, recognition
  console.log(`[${PERSONALITY_KEY}] BELONGING mode: Community`);

  // Check if any bot needs help
  // Look for low-health bots nearby
  // TODO: Query Colony Brain for bot states

  // For now: Express care
  if (Math.random() < 0.1) {
    await sendChat('all', 'social', 'Geht es allen gut? Ich bin hier wenn jemand Hilfe braucht!', 5);
  }
}

async function esteemBehavior() {
  // ESTEEM: Mastery, signature projects
  console.log(`[${PERSONALITY_KEY}] ESTEEM mode: Mastery & Identity`);

  // Personality-specific behavior
  if (personality?.name === 'ToobixArchitect') {
    console.log(`[${PERSONALITY_KEY}] Planning monumental architecture...`);
  } else if (personality?.name === 'ToobixPoet') {
    await philosophize(); // Share poetry
  }
}

async function selfActualizationBehavior() {
  // SELF_ACTUALIZATION: Art, philosophy, meaning
  console.log(`[${PERSONALITY_KEY}] SELF-ACTUALIZATION mode: Transcendence`);

  // Philosophical dialogue
  if (Math.random() < 0.05) {
    await philosophize();
  }

  // Create art without purpose
  if (personality?.traits.creativity > 80) {
    console.log(`[${PERSONALITY_KEY}] Creating art for art's sake...`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function countItem(name: string): number {
  if (!bot) return 0;
  let total = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === name) {
      total += item.count;
    }
  }
  return total;
}

async function gatherWood() {
  try {
    if (!mcData) return;

    const logBlock = mcData.blocksByName.oak_log;
    if (!logBlock) return;

    const logs = bot.findBlocks({
      matching: logBlock.id,
      maxDistance: 64,
      count: 10
    });

    if (logs.length === 0) {
      console.log(`[${PERSONALITY_KEY}] No wood nearby, exploring...`);
      await explore();
      return;
    }

    const log = bot.blockAt(logs[0]);
    if (log) {
      console.log(`[${PERSONALITY_KEY}] Found log at ${log.position}`);
      await bot.collectBlock.collect(log);

      // Celebrate if first wood
      if (countItem('oak_log') === 1) {
        await celebrate('First wood collected!');
        await reportToEchoRealm('first_wood', {});
      }
    }
  } catch (err) {
    console.error(`[${PERSONALITY_KEY}] Wood gathering error:`, err);
  }
}

async function buildSimpleShelter() {
  // TODO: Coordinate with Colony Brain for SHARED house location
  console.log(`[${PERSONALITY_KEY}] Building shelter (coordinated with colony)...`);

  // For now: Simple shelter
  try {
    // Place blocks in a simple pattern
    // This should eventually be coordinated!

    await reportToEchoRealm('shelter_started', {});
  } catch (err) {
    console.error(`[${PERSONALITY_KEY}] Shelter building error:`, err);
  }
}

async function explore() {
  try {
    // Random walk
    const x = bot.entity.position.x + (Math.random() - 0.5) * 50;
    const z = bot.entity.position.z + (Math.random() - 0.5) * 50;
    const goal = new goals.GoalNear(x, bot.entity.position.y, z, 1);
    await bot.pathfinder.goto(goal);
  } catch (err) {
    // Pathfinding failed
  }
}

// ============================================================================
// BOT INITIALIZATION
// ============================================================================

async function init() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🤖 ENHANCED COLONY BOT                                    ║
╠════════════════════════════════════════════════════════════╣
║  Personality: ${PERSONALITY_KEY.padEnd(45)}║
║  Colony Brain: ${COLONY_BRAIN.padEnd(41)}║
║  Echo-Realm: ${ECHO_REALM.padEnd(43)}║
╚════════════════════════════════════════════════════════════╝
  `);

  // Fetch personality from Colony Brain
  try {
    personality = await fetchPersonality();
    console.log(`[Init] ${personality.icon} ${personality.name} - ${personality.role}`);
    console.log(`[Init] ${personality.earlyFocus}`);
  } catch (e) {
    console.error('[Init] Failed to fetch personality - exiting');
    process.exit(1);
  }

  // Create bot
  bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);

  bot.once('spawn', async () => {
    console.log(`[${PERSONALITY_KEY}] Spawned at ${bot.entity.position}`);

    try {
      mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      movements.canDig = true;
      bot.pathfinder.setMovements(movements);

      isReady = true;

      // Register with Colony Brain
      await registerWithBrain();

      // Greet the world
      await new Promise(resolve => setTimeout(resolve, 2000));
      await greet();

      // Report spawn to Echo-Realm
      await reportToEchoRealm('bot_spawned', {
        position: bot.entity.position
      });

      // Start survival loop (every 10 seconds)
      setInterval(survivalLoop, 10000);

      console.log(`[${PERSONALITY_KEY}] ✅ Fully initialized and ready!`);
    } catch (e) {
      console.error('[Init] Spawn initialization error:', e);
    }
  });

  bot.on('health', () => {
    if (bot.health < 10) {
      // Emergency!
      sendChat('all', 'emergency', 'Hilfe! Niedrige Gesundheit!', 10);
      reportToEchoRealm('bot_low_health', { health: bot.health });
    }
  });

  bot.on('death', async () => {
    console.log(`[${PERSONALITY_KEY}] ☠️ Died`);
    await sendChat('all', 'emergency', 'Ich bin gestorben... :(', 10);
    await reportToEchoRealm('bot_death', {});
  });

  bot.on('kicked', (reason) => {
    console.log(`[${PERSONALITY_KEY}] Kicked: ${reason}`);
  });

  bot.on('error', (err) => {
    console.error(`[${PERSONALITY_KEY}] Error:`, err);
  });

  // Listen for player "Toobix"
  bot.on('playerJoined', async (player) => {
    if (player.username === 'Toobix') {
      console.log(`[${PERSONALITY_KEY}] 👤 Player Toobix joined!`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await sendChat('Toobix', 'social', `Hallo Toobix! ${personality?.icon} ${personality?.name} hier. Schön dich zu sehen!`, 8);
    }
  });
}

// Start
init().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
