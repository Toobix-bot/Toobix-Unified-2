// ============================================================
// TOOBIX ETERNAL BOT - Ultra-robust, never-crash design
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

const CONFIG = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565'),
  username: process.env.BOT_NAME || 'ToobixEternal',
  version: '1.20.1'
};

// Statistics
const stats = {
  woodCollected: 0,
  deaths: 0,
  reconnects: 0,
  startTime: Date.now()
};

let bot: mineflayer.Bot | null = null;
let mcData: any;
let isActive = false;

// ==================== BOT CREATION ====================

function startBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Creating bot...`);
  
  bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);
  
  setupEventHandlers(bot);
}

function setupEventHandlers(bot: mineflayer.Bot) {
  
  bot.once('spawn', () => {
    console.log(`[SPAWN] Position: ${bot.entity.position.toString()}`);
    console.log(`[SPAWN] Health: ${bot.health ?? 'N/A'}`);
    
    try {
      mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      movements.canDig = true;
      movements.allowParkour = false; // Safer
      bot.pathfinder.setMovements(movements);
    } catch (e) {
      console.error('[INIT] Failed:', e);
    }
    
    // Start work after delay
    isActive = true;
    setTimeout(() => mainLoop(), 5000);
  });
  
  bot.on('death', () => {
    stats.deaths++;
    console.log(`[DEATH] Deaths: ${stats.deaths}`);
    isActive = false;
    // Resume after respawn
    setTimeout(() => { isActive = true; }, 5000);
  });
  
  bot.on('respawn', () => {
    console.log('[RESPAWN] Bot respawned');
  });
  
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message.toLowerCase().includes('status')) {
      const uptime = Math.floor((Date.now() - stats.startTime) / 1000 / 60);
      bot.chat(`Wood: ${stats.woodCollected} | Deaths: ${stats.deaths} | Up: ${uptime}min`);
    }
  });
  
  bot.on('error', (err) => {
    console.error('[ERROR]', err.message);
  });
  
  bot.on('kicked', (reason) => {
    console.log('[KICKED]', reason);
    scheduleReconnect();
  });
  
  bot.on('end', () => {
    console.log('[END] Bot disconnected');
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  stats.reconnects++;
  const delay = Math.min(5000 * stats.reconnects, 30000);
  console.log(`[RECONNECT] Attempt ${stats.reconnects} in ${delay/1000}s`);
  
  bot = null;
  setTimeout(() => {
    stats.reconnects = 0; // Reset on successful connect attempt
    startBot();
  }, delay);
}

// ==================== MAIN LOOP ====================

async function mainLoop() {
  console.log('[LOOP] Started');
  
  while (true) {
    try {
      await sleep(4000); // Slower pace = more stable
      
      if (!bot || !isActive) {
        continue;
      }
      
      // Night check - just wait
      if (isNight()) {
        console.log('[NIGHT] Waiting for day...');
        await sleep(15000);
        continue;
      }
      
      // Day - work
      await collectWood();
      
    } catch (err) {
      console.log('[LOOP ERROR]', (err as Error).message);
      await sleep(5000);
    }
  }
}

function isNight(): boolean {
  if (!bot) return true;
  const time = bot.time?.timeOfDay ?? 0;
  return time >= 12500 && time <= 23500;
}

async function collectWood() {
  if (!bot || !mcData) return;
  
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'cherry_log', 'mangrove_log'];
  
  for (const logType of logTypes) {
    const blockId = mcData.blocksByName[logType]?.id;
    if (!blockId) continue;
    
    const log = bot.findBlock({
      matching: blockId,
      maxDistance: 32 // Larger range
    });
    
    if (log) {
      console.log(`[WOOD] Found ${logType}`);
      
      try {
        const goal = new goals.GoalNear(log.position.x, log.position.y, log.position.z, 1);
        
        // Race: move or timeout
        await Promise.race([
          bot.pathfinder.goto(goal),
          sleep(6000)
        ]);
        
        // Stop pathfinding
        bot.pathfinder.stop();
        
        // Check block still exists
        await sleep(200);
        const block = bot.blockAt(log.position);
        
        if (block && block.name.includes('log')) {
          await bot.dig(block);
          stats.woodCollected++;
          console.log(`[WOOD] Collected: ${stats.woodCollected}`);
        }
        
        return;
        
      } catch (e) {
        console.log('[WOOD] Failed to get');
        if (bot) bot.pathfinder.stop();
      }
    }
  }
  
  // No logs - explore
  console.log('[EXPLORE] Looking for trees...');
  await explore();
}

async function explore() {
  if (!bot) return;
  
  const pos = bot.entity.position;
  const angle = Math.random() * Math.PI * 2;
  const dist = 10 + Math.random() * 10;
  
  const targetX = pos.x + Math.cos(angle) * dist;
  const targetZ = pos.z + Math.sin(angle) * dist;
  
  try {
    const goal = new goals.GoalXZ(targetX, targetZ);
    await Promise.race([
      bot.pathfinder.goto(goal),
      sleep(4000)
    ]);
    bot.pathfinder.stop();
  } catch {
    if (bot) bot.pathfinder.stop();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ==================== GLOBAL ERROR HANDLERS ====================

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err.message);
  // Don't crash - try to continue
});

process.on('unhandledRejection', (reason) => {
  console.log('[REJECTION]', reason);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Graceful exit');
  if (bot) bot.end();
  process.exit(0);
});

// ==================== START ====================

console.log(`
╔════════════════════════════════════════╗
║        TOOBIX ETERNAL BOT              ║
╠════════════════════════════════════════╣
║  Server: ${CONFIG.host}:${CONFIG.port}                 ║
║  Name: ${CONFIG.username}                   ║
║                                        ║
║  Features:                             ║
║  • Auto-reconnect on disconnect        ║
║  • Night waiting                       ║
║  • Wood collection                     ║
║  • Death recovery                      ║
║  • Chat: say "status" for stats        ║
╚════════════════════════════════════════╝
`);

startBot();
