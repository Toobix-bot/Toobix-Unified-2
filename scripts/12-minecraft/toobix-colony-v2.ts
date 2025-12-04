// ============================================================
// 🏰 TOOBIX COLONY V2 - 7 Bots, Robust & Stable
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { writeFileSync, existsSync, readFileSync } from 'fs';

const Vec3 = require('vec3');

// ==================== CONFIGURATION ====================

const CONFIG = {
  host: 'localhost',
  port: 25565,
  version: '1.20.1',
  spawnDelay: 3000,  // ms between bot spawns
};

// ==================== BOT CLASSES ====================

const BOT_CLASSES = [
  { name: "Wächter", icon: "🛡️", username: "Toobix_Guard", role: "patrol", color: "red" },
  { name: "Sammler", icon: "🪓", username: "Toobix_Gather", role: "gather", color: "green" },
  { name: "Bergmann", icon: "⛏️", username: "Toobix_Miner", role: "mine", color: "gray" },
  { name: "Baumeister", icon: "🏗️", username: "Toobix_Build", role: "build", color: "orange" },
  { name: "Heiler", icon: "💚", username: "Toobix_Healer", role: "heal", color: "lime" },
  { name: "Späher", icon: "🔭", username: "Toobix_Scout", role: "scout", color: "blue" },
  { name: "Bewusstsein", icon: "🧠", username: "Toobix_Mind", role: "coordinate", color: "purple" },
];

// ==================== STATE ====================

interface BotState {
  bot: mineflayer.Bot;
  name: string;
  icon: string;
  role: string;
  alive: boolean;
  task: string;
  wood: number;
  stone: number;
}

const bots: BotState[] = [];
let mcData: any = null;
let basePos: { x: number, y: number, z: number } | null = null;

// ==================== HELPERS ====================

function log(icon: string, name: string, msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${icon} ${name}: ${msg}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function safeGoto(bot: mineflayer.Bot, x: number, y: number, z: number): Promise<boolean> {
  try {
    const goal = new goals.GoalNear(x, y, z, 2);
    await Promise.race([
      bot.pathfinder.goto(goal),
      sleep(20000)
    ]);
    return true;
  } catch {
    return false;
  }
}

function findBlock(bot: mineflayer.Bot, names: string[], range = 32): any {
  if (!mcData) return null;
  for (const name of names) {
    const block = mcData.blocksByName[name];
    if (!block) continue;
    const found = bot.findBlocks({ matching: block.id, maxDistance: range, count: 1 });
    if (found.length > 0) return bot.blockAt(found[0]);
  }
  return null;
}

async function digBlock(bot: mineflayer.Bot, block: any): Promise<boolean> {
  if (!block) return false;
  try { await bot.dig(block); return true; } catch { return false; }
}

async function collectItems(bot: mineflayer.Bot) {
  await sleep(300);
  for (const e of Object.values(bot.entities) as any[]) {
    if (e.name === 'item' && e.position) {
      const d = bot.entity.position.distanceTo(e.position);
      if (d < 4) {
        try { await safeGoto(bot, e.position.x, e.position.y, e.position.z); } catch {}
      }
    }
  }
}

function isNight(bot: mineflayer.Bot): boolean {
  return bot.time.timeOfDay >= 13000;
}

// ==================== SURVIVAL ====================

async function hideForNight(state: BotState): Promise<void> {
  const { bot, icon, name } = state;
  state.task = 'hiding';
  log(icon, name, "🌙 Verstecke mich für die Nacht...");
  
  const startPos = bot.entity.position.floored();
  
  // Dig down 3 blocks
  for (let d = 1; d <= 3; d++) {
    const below = bot.blockAt(startPos.offset(0, -d, 0));
    if (below && below.name !== 'air' && below.name !== 'bedrock') {
      await digBlock(bot, below);
      await sleep(300);
    }
  }
  
  // Jump into hole
  await safeGoto(bot, startPos.x, startPos.y - 2, startPos.z);
  
  // Wait for morning
  while (isNight(bot)) {
    await sleep(5000);
    // Mine while waiting
    const stone = findBlock(bot, ['stone', 'cobblestone'], 3);
    if (stone) {
      await digBlock(bot, stone);
      state.stone++;
      await collectItems(bot);
    }
  }
  
  log(icon, name, "☀️ Morgen ist da!");
  
  // Dig out
  for (let i = 0; i < 4; i++) {
    const above = bot.blockAt(bot.entity.position.offset(0, 1, 0));
    if (above && above.name !== 'air') await digBlock(bot, above);
    bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
  }
  
  state.task = 'idle';
}

// ==================== TASKS ====================

async function gatherWood(state: BotState, amount = 5): Promise<void> {
  const { bot, icon, name } = state;
  state.task = 'gathering';
  
  const logs = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'jungle_log', 'acacia_log'];
  let gathered = 0;
  
  for (let i = 0; i < amount * 3 && gathered < amount; i++) {
    if (isNight(bot)) { await hideForNight(state); continue; }
    
    const log_block = findBlock(bot, logs, 48);
    if (!log_block) {
      // Random walk to find trees
      const angle = Math.random() * Math.PI * 2;
      await safeGoto(bot, 
        bot.entity.position.x + Math.cos(angle) * 15,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * 15
      );
      continue;
    }
    
    await safeGoto(bot, log_block.position.x, log_block.position.y, log_block.position.z);
    if (await digBlock(bot, log_block)) {
      gathered++;
      state.wood++;
      await collectItems(bot);
      
      // Fell entire tree
      for (let dy = 1; dy <= 6; dy++) {
        const above = bot.blockAt(log_block.position.offset(0, dy, 0));
        if (above && logs.includes(above.name)) {
          if (await digBlock(bot, above)) { gathered++; state.wood++; await collectItems(bot); }
        } else break;
      }
    }
    await sleep(500);
  }
  
  log(icon, name, `Gesammelt: ${gathered} Holz (Total: ${state.wood})`);
  state.task = 'idle';
}

async function mineStone(state: BotState, amount = 10): Promise<void> {
  const { bot, icon, name } = state;
  state.task = 'mining';
  
  const stones = ['stone', 'cobblestone', 'andesite', 'granite', 'diorite'];
  let mined = 0;
  
  for (let i = 0; i < amount * 2 && mined < amount; i++) {
    if (isNight(bot)) { await hideForNight(state); continue; }
    
    const stone = findBlock(bot, stones, 16);
    if (!stone) {
      // Dig down to find stone
      const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (below && below.name !== 'air' && below.name !== 'bedrock') {
        await digBlock(bot, below);
      }
      continue;
    }
    
    await safeGoto(bot, stone.position.x, stone.position.y, stone.position.z);
    if (await digBlock(bot, stone)) {
      mined++;
      state.stone++;
      await collectItems(bot);
    }
    await sleep(300);
  }
  
  log(icon, name, `Abgebaut: ${mined} Stein (Total: ${state.stone})`);
  state.task = 'idle';
}

async function patrol(state: BotState): Promise<void> {
  const { bot, icon, name } = state;
  state.task = 'patrolling';
  
  if (!basePos) return;
  
  log(icon, name, "Beginne Patrouille...");
  
  const radius = 20;
  for (let i = 0; i < 8; i++) {
    if (isNight(bot)) { await hideForNight(state); break; }
    
    const angle = (i / 8) * Math.PI * 2;
    const x = basePos.x + Math.cos(angle) * radius;
    const z = basePos.z + Math.sin(angle) * radius;
    
    await safeGoto(bot, x, basePos.y, z);
    
    // Check for hostiles
    for (const e of Object.values(bot.entities) as any[]) {
      if (e.type === 'hostile' && e.position) {
        const dist = bot.entity.position.distanceTo(e.position);
        if (dist < 16) {
          log(icon, name, `⚠️ Feind: ${e.name} (${dist.toFixed(0)}m)`);
        }
      }
    }
    await sleep(2000);
  }
  
  state.task = 'idle';
}

async function explore(state: BotState): Promise<void> {
  const { bot, icon, name } = state;
  state.task = 'exploring';
  
  if (isNight(bot)) { await hideForNight(state); return; }
  
  const angle = Math.random() * Math.PI * 2;
  const dist = 30 + Math.random() * 40;
  
  log(icon, name, "Erkunde neue Gebiete...");
  
  await safeGoto(bot,
    bot.entity.position.x + Math.cos(angle) * dist,
    bot.entity.position.y,
    bot.entity.position.z + Math.sin(angle) * dist
  );
  
  // Report findings
  const ores = findBlock(bot, ['iron_ore', 'coal_ore', 'diamond_ore'], 16);
  if (ores) {
    log(icon, name, `💎 Erz gefunden: ${ores.name}!`);
  }
  
  state.task = 'idle';
}

async function coordinate(state: BotState): Promise<void> {
  const { icon, name } = state;
  state.task = 'coordinating';
  
  // Summary
  let totalWood = 0, totalStone = 0, alive = 0;
  for (const b of bots) {
    if (b.alive) alive++;
    totalWood += b.wood;
    totalStone += b.stone;
  }
  
  log(icon, name, `📊 Status: ${alive}/7 aktiv | 🪵${totalWood} 🪨${totalStone}`);
  
  // Save state
  const data = {
    timestamp: new Date().toISOString(),
    bots: bots.map(b => ({ name: b.name, alive: b.alive, task: b.task, wood: b.wood, stone: b.stone })),
    resources: { wood: totalWood, stone: totalStone },
    base: basePos
  };
  writeFileSync('./colony-state.json', JSON.stringify(data, null, 2));
  
  state.task = 'idle';
  await sleep(10000);
}

// ==================== MAIN LOOP ====================

async function runBot(state: BotState): Promise<void> {
  const { bot, icon, name, role } = state;
  
  await sleep(3000); // Wait after spawn
  
  log(icon, name, "Starte Arbeitsloop...");
  
  while (state.alive) {
    try {
      // Night check - all bots hide
      if (isNight(bot)) {
        await hideForNight(state);
        continue;
      }
      
      // Role-based tasks
      switch (role) {
        case 'patrol':
          await patrol(state);
          await gatherWood(state, 3); // Also gather some
          break;
        case 'gather':
          await gatherWood(state, 10);
          break;
        case 'mine':
          if (state.wood < 5) await gatherWood(state, 5);
          await mineStone(state, 15);
          break;
        case 'build':
          await gatherWood(state, 8);
          await mineStone(state, 5);
          break;
        case 'heal':
          await gatherWood(state, 3);
          // TODO: tend farms, cook food
          break;
        case 'scout':
          await explore(state);
          break;
        case 'coordinate':
          await coordinate(state);
          break;
      }
      
      await sleep(2000);
      
    } catch (err) {
      log(icon, name, `Error: ${(err as Error).message}`);
      await sleep(5000);
    }
  }
}

// ==================== SPAWN BOTS ====================

async function spawnBot(cfg: typeof BOT_CLASSES[0]): Promise<BotState | null> {
  return new Promise((resolve) => {
    log(cfg.icon, cfg.name, "Verbinde...");
    
    const bot = mineflayer.createBot({
      host: CONFIG.host,
      port: CONFIG.port,
      username: cfg.username,
      version: CONFIG.version
    });
    
    bot.loadPlugin(pathfinder);
    
    const state: BotState = {
      bot,
      name: cfg.name,
      icon: cfg.icon,
      role: cfg.role,
      alive: false,
      task: 'spawning',
      wood: 0,
      stone: 0
    };
    
    const timeout = setTimeout(() => {
      log(cfg.icon, cfg.name, "❌ Spawn Timeout");
      resolve(null);
    }, 30000);
    
    bot.once('spawn', () => {
      clearTimeout(timeout);
      state.alive = true;
      
      // Init pathfinder
      if (!mcData) mcData = require('minecraft-data')(bot.version);
      const movements = new Movements(bot);
      movements.canDig = true;
      movements.allowParkour = true;
      bot.pathfinder.setMovements(movements);
      
      // Set base from first bot
      if (!basePos) {
        basePos = {
          x: Math.floor(bot.entity.position.x),
          y: Math.floor(bot.entity.position.y),
          z: Math.floor(bot.entity.position.z)
        };
        log("🏠", "Basis", `Gesetzt: ${basePos.x}, ${basePos.y}, ${basePos.z}`);
      }
      
      log(cfg.icon, cfg.name, `✅ Gespawnt bei ${bot.entity.position.floored()}`);
      resolve(state);
    });
    
    bot.on('death', () => {
      log(cfg.icon, cfg.name, "💀 Gestorben!");
      state.alive = false;
      state.task = 'dead';
      
      // Respawn after 5s
      setTimeout(() => {
        state.alive = true;
        state.task = 'idle';
        log(cfg.icon, cfg.name, "🔄 Wiederbelebt!");
      }, 5000);
    });
    
    bot.on('error', (err) => {
      log(cfg.icon, cfg.name, `❌ ${err.message}`);
    });
    
    bot.on('kicked', (reason) => {
      log(cfg.icon, cfg.name, `👢 Kicked: ${reason}`);
      state.alive = false;
    });
  });
}

// ==================== MAIN ====================

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("🏰 TOOBIX COLONY - 7 Bots starten");
  console.log("═".repeat(60) + "\n");
  
  for (const cfg of BOT_CLASSES) {
    const state = await spawnBot(cfg);
    if (state) {
      bots.push(state);
      // Start bot loop (don't await - run in parallel)
      runBot(state).catch(err => log(state.icon, state.name, `Fatal: ${err}`));
    }
    await sleep(CONFIG.spawnDelay);
  }
  
  console.log("\n" + "═".repeat(60));
  console.log(`✅ ${bots.length}/7 Bots aktiv!`);
  console.log("═".repeat(60) + "\n");
  
  // Keep alive + status report
  setInterval(() => {
    const alive = bots.filter(b => b.alive).length;
    const wood = bots.reduce((s, b) => s + b.wood, 0);
    const stone = bots.reduce((s, b) => s + b.stone, 0);
    console.log(`\n📊 [${new Date().toLocaleTimeString('de-DE')}] Aktiv: ${alive}/7 | 🪵${wood} 🪨${stone}`);
    for (const b of bots) {
      console.log(`   ${b.icon} ${b.name}: ${b.task} (${b.alive ? '✅' : '💀'})`);
    }
  }, 60000);
}

main().catch(console.error);
