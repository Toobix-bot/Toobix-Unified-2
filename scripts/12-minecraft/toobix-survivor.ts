// ============================================================
// TOOBIX SURVIVOR BOT - Minimalistisch und robust
// Fokus: Überleben und Holz sammeln ohne Crashes
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

const CONFIG = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565'),
  username: process.env.BOT_NAME || 'ToobixSurvivor',
  version: '1.20.1'
};

// State
let woodCount = 0;
let isWorking = false;
let lastMessage = 0;
let mcData: any;

function createBot() {
  const bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);
  
  // Spawn handler
  bot.once('spawn', () => {
    console.log(`[${CONFIG.username}] Spawned at ${bot.entity.position}`);
    console.log(`[${CONFIG.username}] Health: ${bot.health}, Food: ${bot.food}`);
    
    mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot);
    movements.canDig = true;
    bot.pathfinder.setMovements(movements);
    
    // Start working after 3 seconds
    setTimeout(() => {
      isWorking = true;
      workLoop(bot);
    }, 3000);
  });
  
  // Death handler - just log it
  bot.on('death', () => {
    console.log(`[${CONFIG.username}] Died! Waiting for respawn...`);
    isWorking = false;
  });
  
  // Respawn handler
  bot.on('respawn', () => {
    console.log(`[${CONFIG.username}] Respawned!`);
    setTimeout(() => {
      isWorking = true;
    }, 5000);
  });
  
  // Health warning
  bot.on('health', () => {
    if (bot.health <= 5 && bot.health > 0) {
      console.log(`[${CONFIG.username}] Low health: ${bot.health}`);
    }
  });
  
  // Simple chat - no spam
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message.toLowerCase().includes('status')) {
      safeSay(bot, `Wood: ${woodCount}, Health: ${Math.round(bot.health)}`);
    }
  });
  
  // Error handlers
  bot.on('error', (err) => console.error('Error:', err.message));
  bot.on('kicked', (reason) => {
    console.log('Kicked:', reason);
    setTimeout(() => process.exit(1), 10000);
  });
  bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 5s...');
    setTimeout(() => process.exit(1), 5000);
  });
  
  return bot;
}

function safeSay(bot: mineflayer.Bot, msg: string) {
  const now = Date.now();
  if (now - lastMessage > 5000) {
    bot.chat(msg);
    lastMessage = now;
  }
}

async function workLoop(bot: mineflayer.Bot) {
  console.log(`[${CONFIG.username}] Starting work loop...`);
  
  while (true) {
    try {
      await sleep(3000);
      
      if (!isWorking) {
        console.log(`[${CONFIG.username}] Paused...`);
        continue;
      }
      
      // Check if night - just wait
      if (isNight(bot)) {
        console.log(`[${CONFIG.username}] Night time - waiting...`);
        await sleep(10000);
        continue;
      }
      
      // Try to gather wood
      await gatherWood(bot);
      
    } catch (err) {
      console.log(`[${CONFIG.username}] Work error:`, (err as Error).message);
      await sleep(5000);
    }
  }
}

function isNight(bot: mineflayer.Bot): boolean {
  return bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000;
}

async function gatherWood(bot: mineflayer.Bot) {
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
  
  for (const logType of logTypes) {
    const blockId = mcData.blocksByName[logType]?.id;
    if (!blockId) continue;
    
    const log = bot.findBlock({
      matching: blockId,
      maxDistance: 16
    });
    
    if (log) {
      console.log(`[${CONFIG.username}] Found ${logType}`);
      
      try {
        // Move to log with timeout
        const goal = new goals.GoalNear(log.position.x, log.position.y, log.position.z, 1);
        
        const movePromise = bot.pathfinder.goto(goal);
        const timeoutPromise = sleep(8000);
        
        await Promise.race([movePromise, timeoutPromise]);
        
        // Try to dig
        const block = bot.blockAt(log.position);
        if (block && block.name.includes('log')) {
          await bot.dig(block);
          woodCount++;
          console.log(`[${CONFIG.username}] Wood collected: ${woodCount}`);
          
          if (woodCount % 5 === 0) {
            safeSay(bot, `Ich habe ${woodCount} Holz gesammelt!`);
          }
        }
        
        return;
      } catch (e) {
        console.log(`[${CONFIG.username}] Could not get log`);
        bot.pathfinder.stop();
      }
    }
  }
  
  // No logs found - move randomly
  console.log(`[${CONFIG.username}] No logs nearby, exploring...`);
  await moveRandom(bot);
}

async function moveRandom(bot: mineflayer.Bot) {
  const dx = (Math.random() - 0.5) * 16;
  const dz = (Math.random() - 0.5) * 16;
  const pos = bot.entity.position;
  
  try {
    const goal = new goals.GoalXZ(pos.x + dx, pos.z + dz);
    await Promise.race([
      bot.pathfinder.goto(goal),
      sleep(5000)
    ]);
  } catch {}
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// Handle crashes gracefully
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled rejection:', reason);
});

// Start
console.log(`
====================================
  TOOBIX SURVIVOR BOT
====================================
  Server: ${CONFIG.host}:${CONFIG.port}
  Name: ${CONFIG.username}
  
  Simple and robust:
  - Gathers wood during day
  - Waits during night
  - Auto-reconnect on disconnect
====================================
`);

createBot();
