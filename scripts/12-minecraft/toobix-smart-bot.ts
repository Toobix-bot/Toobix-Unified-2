// ============================================================
// TOOBIX SMART BOT - Optimiert, kein Spam, intelligent
// Ein einzelner Bot der wirklich spielt
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';

const CONFIG = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565'),
  username: process.env.BOT_NAME || 'ToobixBot',
  version: '1.20.1'
};

// Anti-Spam: Nachrichten-Cooldown
let lastChatTime = 0;
const CHAT_COOLDOWN = 10000; // 10 Sekunden zwischen Nachrichten

function safeChat(bot: mineflayer.Bot, message: string) {
  const now = Date.now();
  if (now - lastChatTime > CHAT_COOLDOWN) {
    bot.chat(message);
    lastChatTime = now;
  }
}

// Bot State
interface BotState {
  task: string;
  isWorking: boolean;
  woodCollected: number;
  stoneCollected: number;
  hasShelter: boolean;
  lastAction: number;
}

const state: BotState = {
  task: 'idle',
  isWorking: false,
  woodCollected: 0,
  stoneCollected: 0,
  hasShelter: false,
  lastAction: Date.now()
};

// Create Bot
const bot = mineflayer.createBot(CONFIG);
bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock);

let mcData: any;
let movements: Movements;

// ==================== EVENT HANDLERS ====================

bot.once('spawn', async () => {
  console.log(`[${CONFIG.username}] Spawned in world`);
  console.log(`[${CONFIG.username}] Position: ${bot.entity.position}`);
  console.log(`[${CONFIG.username}] Health: ${bot.health}, Food: ${bot.food}`);
  
  try {
    mcData = require('minecraft-data')(bot.version);
    movements = new Movements(bot);
    movements.canDig = true;
    movements.allowParkour = true;
    movements.scafoldingBlocks = [mcData.blocksByName.dirt?.id, mcData.blocksByName.cobblestone?.id].filter(Boolean);
    bot.pathfinder.setMovements(movements);
    console.log(`[${CONFIG.username}] Pathfinder initialized`);
  } catch (e) {
    console.error('Init error:', e);
  }
  
  // WICHTIG: Bei niedrigen HP nach Spawn sofort weglaufen
  if (bot.health < 10) {
    console.log(`[${CONFIG.username}] Low HP at spawn, fleeing...`);
    await fleeFromDanger();
    await sleep(3000);
  }
  
  // Einmalige Begruessung
  setTimeout(() => safeChat(bot, 'Hallo! Ich beginne zu arbeiten.'), 3000);
  
  // Starte Arbeitszyklus
  console.log(`[${CONFIG.username}] Starting work loop in 5s...`);
  setTimeout(() => {
    console.log(`[${CONFIG.username}] Work loop starting now`);
    workLoop().catch(err => console.error('WorkLoop error:', err));
  }, 5000);
});

bot.on('death', () => {
  console.log(`[${CONFIG.username}] Died - waiting to respawn...`);
  state.isWorking = false;
  state.task = 'respawning';
  // Warte 5 Sekunden nach Respawn bevor wieder gearbeitet wird
  setTimeout(() => {
    state.task = 'idle';
    state.isWorking = true;
    console.log(`[${CONFIG.username}] Recovered, resuming work`);
  }, 5000);
});

bot.on('health', () => {
  // Fliehe bei niedriger HP (aber nicht zu oft)
  if (bot.health <= 4 && state.task !== 'fleeing' && state.task !== 'respawning') {
    console.log(`[${CONFIG.username}] Low health (${bot.health})! Fleeing...`);
    state.task = 'fleeing';
    fleeFromDanger().then(() => {
      state.task = 'idle';
    });
  }
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  
  const lower = message.toLowerCase();
  
  // Nur auf direkte Ansprache reagieren
  if (lower.includes('toobix') || lower.includes(bot.username.toLowerCase())) {
    if (lower.includes('status')) {
      safeChat(bot, `Holz: ${state.woodCollected}, Stein: ${state.stoneCollected}, Task: ${state.task}`);
    } else if (lower.includes('folge') || lower.includes('follow')) {
      followPlayer(username);
    } else if (lower.includes('stopp') || lower.includes('stop')) {
      state.isWorking = false;
      state.task = 'idle';
      bot.pathfinder.stop();
      safeChat(bot, 'Okay, ich halte an.');
    } else if (lower.includes('arbeite') || lower.includes('work')) {
      state.isWorking = true;
      safeChat(bot, 'Ich arbeite weiter!');
    } else if (lower.includes('komm') || lower.includes('come')) {
      comeToPlayer(username);
    }
  }
});

bot.on('error', (err) => {
  console.error('Bot error:', err.message);
  // Nicht bei jedem Fehler abstürzen
});

bot.on('kicked', (reason) => {
  console.log('Kicked:', reason);
  console.log('Waiting 30s before reconnect...');
  setTimeout(() => process.exit(1), 30000);
});

bot.on('end', () => {
  console.log('Bot disconnected - reconnecting in 15s...');
  setTimeout(() => process.exit(1), 15000);
});

// Unhandled Errors abfangen
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  // Weitermachen, nicht abstürzen
});

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled rejection:', reason);
  // Weitermachen
});

// ==================== WORK LOOP ====================

async function workLoop() {
  while (true) {
    try {
      // Warte zwischen Aktionen (reduziert Server-Last)
      await sleep(3000);
      
      if (!state.isWorking && state.task === 'idle') {
        state.isWorking = true;
      }
      
      if (!state.isWorking) continue;
      
      // Survival-Checks: Essen wenn vorhanden und nötig
      if (bot.health <= 6) {
        const hasFood = await tryEatFood();
        if (!hasFood) {
          // Kein Essen, weiter arbeiten - Regeneration kommt mit vollem Hunger
          console.log(`[${CONFIG.username}] Low health but no food, continuing...`);
        }
      }
      
      // Nacht-Check: Verstecken wenn dunkel
      const isNight = bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000;
      if (isNight && !state.hasShelter) {
        state.task = 'hiding';
        await hideForNight();
        continue;
      }
      
      // PRIORITÄT: Erst Holz sammeln (Basis für alles)
      if (state.woodCollected < 10) {
        await gatherWood();
        continue;
      }
      
      // Dann Essen suchen wenn nötig (aber nur mit etwas Holz)
      if (bot.food <= 6) {
        await findFood();
        continue;
      }
      
      // Mehr Holz sammeln
      if (state.woodCollected < 20) {
        await gatherWood();
        continue;
      }
      
      // Dann Stein
      if (state.stoneCollected < 30) {
        await gatherStone();
        continue;
      }
      
      // Shelter bauen
      if (!state.hasShelter) {
        await buildSimpleShelter();
        continue;
      }
      
      // Erkunden oder weiter sammeln
      await exploreAround();
      
    } catch (error) {
      console.log(`[${CONFIG.username}] Work error:`, (error as Error).message);
      await sleep(5000);
    }
  }
}

// ==================== ACTIONS ====================

async function gatherWood() {
  state.task = 'gathering_wood';
  
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'jungle_log', 'acacia_log'];
  
  for (const logType of logTypes) {
    if (!mcData.blocksByName[logType]) continue;
    
    const log = bot.findBlock({
      matching: mcData.blocksByName[logType].id,
      maxDistance: 20
    });
    
    if (log) {
      console.log(`[${CONFIG.username}] Found ${logType} at ${log.position}`);
      
      try {
        // Timeout für Pathfinding
        const goal = new goals.GoalNear(log.position.x, log.position.y, log.position.z, 1);
        await Promise.race([
          bot.pathfinder.goto(goal),
          sleep(10000) // Max 10 Sekunden
        ]);
        
        // Prüfe ob Block noch da ist
        const currentBlock = bot.blockAt(log.position);
        if (currentBlock && currentBlock.name.includes('log')) {
          await bot.collectBlock.collect(currentBlock);
          state.woodCollected++;
          console.log(`[${CONFIG.username}] Collected wood: ${state.woodCollected}`);
        }
        return;
      } catch (e) {
        console.log(`[${CONFIG.username}] Could not reach log:`, (e as Error).message);
        bot.pathfinder.stop();
      }
    }
  }
  
  // Kein Holz gefunden - bewege dich
  console.log(`[${CONFIG.username}] No logs nearby, moving...`);
  await moveRandomly();
}

async function gatherStone() {
  state.task = 'gathering_stone';
  
  // Brauchen wir eine Holz-Spitzhacke?
  const hasPickaxe = bot.inventory.items().some(i => i.name.includes('pickaxe'));
  
  if (!hasPickaxe) {
    await craftWoodenPickaxe();
    return;
  }
  
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone?.id,
    maxDistance: 16
  });
  
  if (stone) {
    try {
      // Equip pickaxe
      const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pickaxe) await bot.equip(pickaxe, 'hand');

      await bot.pathfinder.goto(new goals.GoalNear(stone.position.x, stone.position.y, stone.position.z, 1));
      await bot.collectBlock.collect(stone);
      state.stoneCollected++;
      console.log(`[${CONFIG.username}] Collected stone: ${state.stoneCollected}`);
    } catch (e) {
      console.log(`[${CONFIG.username}] Could not mine stone`);
    }
  } else {
    // Grabe runter um Stein zu finden
    await digDown();
  }
}

async function craftWoodenPickaxe() {
  state.task = 'crafting';
  console.log(`[${CONFIG.username}] Crafting wooden pickaxe...`);
  
  // Logs zu Planks
  const logs = bot.inventory.items().find(i => i.name.includes('log'));
  if (!logs) {
    console.log(`[${CONFIG.username}] No logs for crafting`);
    return;
  }
  
  try {
    // Craft planks (4 from 1 log)
    const planksRecipe = bot.recipesFor(mcData.itemsByName.oak_planks?.id)[0];
    if (planksRecipe) {
      await bot.craft(planksRecipe, 4);
    }
    
    // Craft sticks (4 from 2 planks)
    const sticksRecipe = bot.recipesFor(mcData.itemsByName.stick?.id)[0];
    if (sticksRecipe) {
      await bot.craft(sticksRecipe, 1);
    }
    
    // Craft crafting table
    const tableRecipe = bot.recipesFor(mcData.itemsByName.crafting_table?.id)[0];
    if (tableRecipe) {
      await bot.craft(tableRecipe, 1);
    }
    
    // Place crafting table
    const table = bot.inventory.items().find(i => i.name === 'crafting_table');
    if (table) {
      await bot.equip(table, 'hand');
      const ground = bot.blockAt(bot.entity.position.offset(1, -1, 0));
      if (ground) {
        await bot.placeBlock(ground, { x: 0, y: 1, z: 0 } as any);
      }
    }
    
    // Find crafting table and craft pickaxe
    const craftingTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table?.id,
      maxDistance: 4
    });
    
    if (craftingTable) {
      const pickaxeRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe?.id, null, craftingTable)[0];
      if (pickaxeRecipe) {
        await bot.craft(pickaxeRecipe, 1, craftingTable);
        console.log(`[${CONFIG.username}] Crafted wooden pickaxe!`);
        safeChat(bot, 'Ich habe eine Holzspitzhacke!');
      }
    }
  } catch (e) {
    console.log(`[${CONFIG.username}] Crafting failed:`, (e as Error).message);
  }
}

async function buildSimpleShelter() {
  state.task = 'building_shelter';
  console.log(`[${CONFIG.username}] Building shelter...`);
  
  // Einfachster Shelter: 3 Bloecke tief graben
  const pos = bot.entity.position.floored();
  
  try {
    // Grabe 3 Bloecke runter
    for (let y = 0; y > -3; y--) {
      const block = bot.blockAt(pos.offset(0, y, 0));
      if (block && block.diggable && block.name !== 'air') {
        await bot.dig(block);
      }
    }
    
    // Decke mit Dirt
    const dirt = bot.inventory.items().find(i => i.name === 'dirt' || i.name === 'cobblestone');
    if (dirt) {
      await bot.equip(dirt, 'hand');
      const aboveBlock = bot.blockAt(pos.offset(0, 0, 0));
      if (aboveBlock) {
        try {
          await bot.placeBlock(aboveBlock, { x: 0, y: 1, z: 0 } as any);
        } catch {}
      }
    }
    
    state.hasShelter = true;
    console.log(`[${CONFIG.username}] Shelter complete!`);
    safeChat(bot, 'Ich habe einen Unterschlupf gebaut!');
  } catch (e) {
    console.log(`[${CONFIG.username}] Shelter building failed`);
  }
}

async function hideForNight() {
  console.log(`[${CONFIG.username}] Hiding for night...`);
  
  // Finde oder baue Unterschlupf
  if (!state.hasShelter) {
    await buildSimpleShelter();
  }
  
  // Warte bis Tag
  while (bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000) {
    await sleep(5000);
  }
  
  state.task = 'idle';
}

async function eatFood() {
  state.task = 'eating';
  
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken', 'carrot', 'potato', 'raw_beef', 'raw_porkchop', 'raw_chicken'];
  
  for (const foodName of foods) {
    const food = bot.inventory.items().find(i => i.name.includes(foodName));
    if (food) {
      try {
        await bot.equip(food, 'hand');
        await bot.consume();
        console.log(`[${CONFIG.username}] Ate ${food.name}`);
        return;
      } catch {}
    }
  }
  
  // Kein Essen - suche
  await findFood();
}

// Versucht Essen zu essen, gibt true zurück wenn erfolgreich
async function tryEatFood(): Promise<boolean> {
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken', 'carrot', 'potato', 'raw_beef', 'raw_porkchop', 'raw_chicken'];
  
  for (const foodName of foods) {
    const food = bot.inventory.items().find(i => i.name.includes(foodName));
    if (food) {
      try {
        await bot.equip(food, 'hand');
        await bot.consume();
        console.log(`[${CONFIG.username}] Ate ${food.name}`);
        return true;
      } catch {}
    }
  }
  return false;
}

async function findFood() {
  state.task = 'finding_food';
  
  // Zuerst: Suche Beeren (sicherer als Tiere)
  try {
    const berries = bot.findBlock({
      matching: mcData.blocksByName.sweet_berry_bush?.id,
      maxDistance: 16
    });
    
    if (berries) {
      console.log(`[${CONFIG.username}] Found berries!`);
      await bot.pathfinder.goto(new goals.GoalNear(berries.position.x, berries.position.y, berries.position.z, 1));
      await bot.collectBlock.collect(berries);
      return;
    }
  } catch (e) {
    console.log(`[${CONFIG.username}] Berry search failed`);
  }
  
  // Suche nahegelegene Tiere (nur wenn sehr nah)
  const animals = ['cow', 'pig', 'chicken', 'sheep'];
  
  for (const animalType of animals) {
    const animal = bot.nearestEntity(e => e.name === animalType);
    if (animal && animal.position.distanceTo(bot.entity.position) < 10) {
      console.log(`[${CONFIG.username}] Hunting nearby ${animalType}...`);
      
      try {
        // Nur nähern, nicht pathfinden
        const goal = new goals.GoalNear(animal.position.x, animal.position.y, animal.position.z, 2);
        await Promise.race([
          bot.pathfinder.goto(goal),
          sleep(5000) // Max 5 Sekunden für Jagd
        ]);
        
        if (animal.isValid) {
          bot.attack(animal);
          await sleep(300);
          if (animal.isValid) bot.attack(animal);
        }
        return;
      } catch (e) {
        console.log(`[${CONFIG.username}] Hunt failed, continuing...`);
      }
    }
  }
  
  // Nichts gefunden - weiter arbeiten
  console.log(`[${CONFIG.username}] No food nearby, continuing work`);
}

async function fleeFromDanger() {
  // Finde naechsten Feind
  const enemy = bot.nearestEntity(e => 
    e.type === 'hostile' || 
    ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name || '')
  );
  
  if (enemy) {
    const pos = bot.entity.position;
    const enemyPos = enemy.position;
    
    // Laufe in entgegengesetzte Richtung
    const dx = pos.x - enemyPos.x;
    const dz = pos.z - enemyPos.z;
    const dist = 15;
    
    const fleeX = pos.x + (dx > 0 ? dist : -dist);
    const fleeZ = pos.z + (dz > 0 ? dist : -dist);
    
    try {
      await bot.pathfinder.goto(new goals.GoalXZ(fleeX, fleeZ));
    } catch {}
  }
  
  state.task = 'idle';
}

async function exploreAround() {
  state.task = 'exploring';
  await moveRandomly();
}

async function moveRandomly() {
  const pos = bot.entity.position;
  const dx = (Math.random() - 0.5) * 20;
  const dz = (Math.random() - 0.5) * 20;
  
  try {
    await bot.pathfinder.goto(new goals.GoalXZ(pos.x + dx, pos.z + dz));
  } catch {}
}

async function digDown() {
  const pos = bot.entity.position.floored();
  
  for (let y = -1; y > -5; y--) {
    const block = bot.blockAt(pos.offset(0, y, 0));
    if (block && block.diggable && block.name !== 'air' && block.name !== 'bedrock') {
      try {
        await bot.dig(block);
      } catch {}
    }
  }
}

async function followPlayer(username: string) {
  const player = bot.players[username];
  if (!player?.entity) {
    safeChat(bot, `Ich kann ${username} nicht sehen.`);
    return;
  }
  
  state.task = 'following';
  state.isWorking = false;
  safeChat(bot, `Ich folge dir, ${username}!`);
  
  // Folge fuer 60 Sekunden
  const endTime = Date.now() + 60000;
  
  while (Date.now() < endTime && state.task === 'following') {
    if (player.entity) {
      try {
        await bot.pathfinder.goto(new goals.GoalFollow(player.entity, 2));
      } catch {}
    }
    await sleep(1000);
  }
  
  state.task = 'idle';
  state.isWorking = true;
}

async function comeToPlayer(username: string) {
  const player = bot.players[username];
  if (!player?.entity) return;
  
  safeChat(bot, 'Ich komme!');
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(
      player.entity.position.x,
      player.entity.position.y,
      player.entity.position.z,
      2
    ));
  } catch {}
}

// ==================== UTILITIES ====================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== START ====================

console.log(`
========================================
  TOOBIX SMART BOT
========================================
  Connecting to ${CONFIG.host}:${CONFIG.port}
  Username: ${CONFIG.username}
  
  Features:
  - Anti-Spam (10s cooldown)
  - Intelligent survival
  - Wood & Stone gathering
  - Auto shelter building
  - Night hiding
  - Food finding
  
  Commands (in chat):
  - "toobix status" - Show status
  - "toobix folge" - Follow player
  - "toobix stopp" - Stop working
  - "toobix arbeite" - Resume work
  - "toobix komm" - Come to player
========================================
`);
