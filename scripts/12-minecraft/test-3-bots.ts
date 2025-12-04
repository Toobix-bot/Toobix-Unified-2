// ============================================================
// 🧪 TOOBIX 3 BOTS - Simpler Test
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

process.on('uncaughtException', (err) => console.error('Exception:', err.message));
process.on('unhandledRejection', (r) => console.error('Rejection:', r));

const BOTS = [
  { name: "Guard",  icon: "🛡️" },
  { name: "Gather", icon: "🪓" },
  { name: "Miner",  icon: "⛏️" },
];

interface BotState {
  bot: mineflayer.Bot;
  name: string;
  icon: string;
  alive: boolean;
  wood: number;
}

const states: BotState[] = [];
let mcData: any = null;

function log(s: BotState | null, msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  if (s) console.log(`[${time}] ${s.icon} ${s.name}: ${msg}`);
  else console.log(`[${time}] ${msg}`);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function spawnBot(cfg: typeof BOTS[0]): Promise<BotState | null> {
  return new Promise((resolve) => {
    log(null, `Spawning ${cfg.name}...`);
    
    const bot = mineflayer.createBot({
      host: 'localhost', port: 25565,
      username: `Toobix_${cfg.name}`,
      version: '1.20.1'
    });
    
    bot.loadPlugin(pathfinder);
    
    const s: BotState = { bot, name: cfg.name, icon: cfg.icon, alive: false, wood: 0 };
    
    setTimeout(() => resolve(null), 20000);
    
    bot.once('spawn', () => {
      s.alive = true;
      if (!mcData) mcData = require('minecraft-data')(bot.version);
      const mv = new Movements(bot);
      mv.canDig = true;
      bot.pathfinder.setMovements(mv);
      log(s, `✅ Spawned`);
      resolve(s);
    });
    
    bot.on('death', () => log(s, "💀 Died!"));
    bot.on('error', (e) => log(s, `❌ ${e.message}`));
    bot.on('kicked', (r) => { log(s, `👢 Kicked`); s.alive = false; });
  });
}

async function runBot(s: BotState) {
  await sleep(2000);
  log(s, "Starting work loop...");
  
  while (true) {
    try {
      // Night = wait
      if (s.bot.time.timeOfDay >= 13000) {
        await sleep(5000);
        continue;
      }
      
      // Find and chop wood
      const logs = ['oak_log', 'birch_log', 'spruce_log'];
      let found = false;
      
      for (const t of logs) {
        const id = mcData?.blocksByName[t]?.id;
        if (!id) continue;
        const blocks = s.bot.findBlocks({ matching: id, maxDistance: 32, count: 1 });
        if (blocks.length) {
          const block = s.bot.blockAt(blocks[0]);
          if (block) {
            try {
              await s.bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 2));
              await s.bot.dig(block);
              s.wood++;
              log(s, `🪵 Wood: ${s.wood}`);
              found = true;
            } catch {}
          }
        }
        if (found) break;
      }
      
      if (!found) {
        // Random walk
        const angle = Math.random() * Math.PI * 2;
        try {
          await s.bot.pathfinder.goto(new goals.GoalNear(
            s.bot.entity.position.x + Math.cos(angle) * 15,
            s.bot.entity.position.y,
            s.bot.entity.position.z + Math.sin(angle) * 15,
            2
          ));
        } catch {}
      }
      
      await sleep(1000);
    } catch (e) {
      await sleep(2000);
    }
  }
}

async function main() {
  console.log("\n🏰 TOOBIX 3-BOT TEST\n");
  
  for (const cfg of BOTS) {
    const s = await spawnBot(cfg);
    if (s) {
      states.push(s);
      runBot(s);
    }
    await sleep(3000);
  }
  
  console.log(`\n✅ ${states.length}/3 Bots aktiv!\n`);
  
  // Status
  setInterval(() => {
    const w = states.reduce((a, b) => a + b.wood, 0);
    console.log(`📊 Wood total: ${w}`);
  }, 30000);
}

main();

// Keep alive with HTTP server
Bun.serve({
  port: 8765,
  fetch() {
    const w = states.reduce((a, b) => a + b.wood, 0);
    return new Response(`Toobix Colony: ${states.length} bots, ${w} wood`);
  }
});
console.log("Colony server on http://localhost:8765");
