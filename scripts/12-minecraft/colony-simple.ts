// ============================================================
// 🏰 TOOBIX COLONY SIMPLE - Maximum Stability
// ============================================================
// Startet 7 Bots die primär Ressourcen sammeln
// Nacht: einfach stehen bleiben statt graben
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

// ==================== CONFIG ====================

const BOTS = [
  { name: "Guard",   icon: "🛡️" },
  { name: "Gather",  icon: "🪓" },
  { name: "Miner",   icon: "⛏️" },
  { name: "Builder", icon: "🏗️" },
  { name: "Healer",  icon: "💚" },
  { name: "Scout",   icon: "🔭" },
  { name: "Mind",    icon: "🧠" },
];

interface BotState {
  bot: mineflayer.Bot;
  name: string;
  icon: string;
  alive: boolean;
  wood: number;
  stone: number;
}

const states: BotState[] = [];
let mcData: any = null;

// ==================== HELPERS ====================

function log(s: BotState, msg: string) {
  console.log(`[${new Date().toLocaleTimeString('de-DE')}] ${s.icon} ${s.name}: ${msg}`);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function safeGoto(bot: mineflayer.Bot, x: number, y: number, z: number): Promise<boolean> {
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(x, y, z, 2)),
      sleep(15000)
    ]);
    return true;
  } catch { return false; }
}

function findLog(bot: mineflayer.Bot): any {
  const types = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
  for (const t of types) {
    const id = mcData?.blocksByName[t]?.id;
    if (!id) continue;
    const found = bot.findBlocks({ matching: id, maxDistance: 48, count: 1 });
    if (found.length) return bot.blockAt(found[0]);
  }
  return null;
}

async function collectItems(bot: mineflayer.Bot) {
  await sleep(300);
  for (const e of Object.values(bot.entities) as any[]) {
    if (e.name === 'item' && e.position) {
      if (bot.entity.position.distanceTo(e.position) < 5) {
        try { await safeGoto(bot, e.position.x, e.position.y, e.position.z); } catch {}
      }
    }
  }
}

// ==================== MAIN TASK: GATHER WOOD ====================

async function gatherWood(s: BotState): Promise<void> {
  const { bot } = s;
  
  // Find a log
  const logBlock = findLog(bot);
  if (!logBlock) {
    // Random walk
    const angle = Math.random() * Math.PI * 2;
    await safeGoto(bot,
      bot.entity.position.x + Math.cos(angle) * 20,
      bot.entity.position.y,
      bot.entity.position.z + Math.sin(angle) * 20
    );
    return;
  }
  
  // Go to log
  await safeGoto(bot, logBlock.position.x, logBlock.position.y, logBlock.position.z);
  
  // Dig it
  try {
    await bot.dig(logBlock);
    s.wood++;
    await collectItems(bot);
    log(s, `🪵 Holz: ${s.wood}`);
    
    // Dig logs above
    for (let dy = 1; dy <= 5; dy++) {
      const above = bot.blockAt(logBlock.position.offset(0, dy, 0));
      if (above && above.name.includes('_log')) {
        try {
          await bot.dig(above);
          s.wood++;
          await collectItems(bot);
        } catch {}
      } else break;
    }
  } catch {}
}

// ==================== BOT LOOP ====================

async function runBot(s: BotState): Promise<void> {
  await sleep(3000);
  log(s, "Starte...");
  
  while (s.alive) {
    try {
      // Check night - just wait
      if (s.bot.time.timeOfDay >= 13000) {
        log(s, "🌙 Nacht - warte...");
        while (s.bot.time.timeOfDay >= 13000 && s.bot.time.timeOfDay < 24000) {
          await sleep(5000);
        }
        log(s, "☀️ Tag!");
        continue;
      }
      
      // Main task: gather wood
      await gatherWood(s);
      await sleep(1000);
      
    } catch (err) {
      log(s, `Error: ${(err as Error).message}`);
      await sleep(3000);
    }
  }
}

// ==================== SPAWN ====================

async function spawnBot(cfg: typeof BOTS[0], index: number): Promise<BotState | null> {
  return new Promise((resolve) => {
    const username = `Toobix_${cfg.name}`;
    console.log(`${cfg.icon} Spawning ${username}...`);
    
    const bot = mineflayer.createBot({
      host: 'localhost',
      port: 25565,
      username,
      version: '1.20.1'
    });
    
    bot.loadPlugin(pathfinder);
    
    const s: BotState = { bot, name: cfg.name, icon: cfg.icon, alive: false, wood: 0, stone: 0 };
    
    const timeout = setTimeout(() => {
      console.log(`${cfg.icon} ${cfg.name}: Timeout`);
      resolve(null);
    }, 30000);
    
    bot.once('spawn', () => {
      clearTimeout(timeout);
      s.alive = true;
      
      if (!mcData) mcData = require('minecraft-data')(bot.version);
      const mv = new Movements(bot);
      mv.canDig = true;
      bot.pathfinder.setMovements(mv);
      
      log(s, `✅ Spawned @ ${bot.entity.position.floored()}`);
      resolve(s);
    });
    
    bot.on('death', () => {
      log(s, "💀 Died!");
      setTimeout(() => { s.alive = true; log(s, "🔄 Respawned"); }, 3000);
    });
    
    bot.on('error', (e) => log(s, `❌ ${e.message}`));
    bot.on('kicked', (r) => { log(s, `👢 Kicked: ${r}`); s.alive = false; });
  });
}

// ==================== ERROR HANDLING ====================

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Don't exit!
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  // Don't exit!
});

// ==================== MAIN ====================

async function main() {
  console.log("\n═══════════════════════════════════════════");
  console.log("🏰 TOOBIX COLONY SIMPLE - 7 Bots");
  console.log("═══════════════════════════════════════════\n");
  
  // Spawn all bots
  for (let i = 0; i < BOTS.length; i++) {
    try {
      const s = await spawnBot(BOTS[i], i);
      if (s) {
        states.push(s);
        runBot(s).catch(e => console.error(`${s.icon} Fatal:`, e));
      }
    } catch (e) {
      console.error(`Failed to spawn ${BOTS[i].name}:`, e);
    }
    await sleep(3000); // More time between spawns
  }
  
  console.log(`\n✅ ${states.length}/7 Bots aktiv!\n`);
  
  // Status every 60s
  setInterval(() => {
    const wood = states.reduce((a, b) => a + b.wood, 0);
    const alive = states.filter(s => s.alive).length;
    console.log(`\n📊 Status: ${alive}/${states.length} aktiv | 🪵 Total Wood: ${wood}`);
    states.forEach(s => console.log(`   ${s.icon} ${s.name}: ${s.alive ? '✅' : '💀'} Wood: ${s.wood}`));
  }, 60000);
  
  // Keep process alive with heartbeat
  console.log("Colony is running. Press Ctrl+C to stop.");
  setInterval(() => {
    // Heartbeat - keeps process alive
  }, 1000);
}

main().catch(e => {
  console.error("Main error:", e);
  process.exit(1);
});
