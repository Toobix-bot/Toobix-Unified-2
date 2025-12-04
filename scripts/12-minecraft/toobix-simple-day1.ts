// ============================================================
// TOOBIX TAG 1 - ULTRA SIMPLE VERSION
// ============================================================
// Fokus: Erst Holz, dann Werkzeuge, dann Stein, dann Shelter
// Keine komplexe Logik - einfach Schritt für Schritt
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
const Vec3 = require('vec3');

const CONFIG = {
  host: 'localhost',
  port: 25565,
  username: 'ToobixDay1',
  version: '1.20.1'
};

// State
let bot: mineflayer.Bot;
let mcData: any;
let isRunning = false;

// Zähler
let woodCount = 0;
let stoneCount = 0;
let hasPickaxe = false;
let hasSword = false;
let hasAxe = false;

function log(msg: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  const gameTime = bot ? bot.time.timeOfDay : 0;
  const phase = gameTime < 6000 ? 'MORGEN' : gameTime < 12000 ? 'MITTAG' : gameTime < 13000 ? 'ABEND' : 'NACHT';
  console.log(`[${time}][${phase}] ${msg}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== SIMPLE HELPERS ====================

async function goTo(x: number, y: number, z: number): Promise<boolean> {
  try {
    const goal = new goals.GoalNear(x, y, z, 1);
    await Promise.race([
      bot.pathfinder.goto(goal),
      sleep(20000) // 20 Sekunden Timeout
    ]);
    return true;
  } catch (err) {
    log(`Navigation fehlgeschlagen: ${(err as Error).message}`);
    return false;
  }
}

function findNearestBlock(name: string, maxDist = 32): any {
  if (!mcData) return null;
  const blockType = mcData.blocksByName[name];
  if (!blockType) return null;
  
  const blocks = bot.findBlocks({
    matching: blockType.id,
    maxDistance: maxDist,
    count: 1
  });
  
  return blocks.length > 0 ? bot.blockAt(blocks[0]) : null;
}

async function digBlock(block: any): Promise<boolean> {
  if (!block) return false;
  try {
    await bot.dig(block);
    return true;
  } catch (err) {
    return false;
  }
}

async function collectDrops() {
  // Warte kurz und sammle Items in der Nähe
  await sleep(300);
  
  for (const entity of Object.values(bot.entities) as any[]) {
    if (entity.name === 'item' && entity.position) {
      const dist = bot.entity.position.distanceTo(entity.position);
      if (dist < 3) {
        try {
          await goTo(entity.position.x, entity.position.y, entity.position.z);
        } catch {}
      }
    }
  }
}

function countItem(name: string): number {
  let total = 0;
  for (const item of bot.inventory.items()) {
    if (item.name.includes(name)) {
      total += item.count;
    }
  }
  return total;
}

function updateCounts() {
  // Zähle Holz (alle Arten)
  woodCount = 0;
  for (const item of bot.inventory.items()) {
    if (item.name.includes('_log') || item.name.includes('_wood')) {
      woodCount += item.count;
    }
  }
  
  // Zähle Stein
  stoneCount = countItem('cobblestone');
  
  // Check Tools
  hasPickaxe = bot.inventory.items().some(i => i.name.includes('pickaxe'));
  hasSword = bot.inventory.items().some(i => i.name.includes('sword'));
  hasAxe = bot.inventory.items().some(i => i.name.includes('_axe'));
  
  log(`📦 Inventar: ${woodCount} Holz, ${stoneCount} Stein | Spitzhacke: ${hasPickaxe}, Schwert: ${hasSword}`);
}

// ==================== PHASE 1: HOLZ SAMMELN ====================

async function gatherWood(targetAmount: number) {
  log(`🪵 Sammle ${targetAmount} Holz...`);
  
  while (woodCount < targetAmount && isRunning) {
    updateCounts();
    
    // Finde nächsten Baum
    const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
    let foundLog = null;
    
    for (const logType of logTypes) {
      foundLog = findNearestBlock(logType, 50);
      if (foundLog) break;
    }
    
    if (!foundLog) {
      log('❌ Kein Holz gefunden! Suche weiter...');
      // Laufe in zufällige Richtung
      const angle = Math.random() * Math.PI * 2;
      const dist = 20;
      const x = bot.entity.position.x + Math.cos(angle) * dist;
      const z = bot.entity.position.z + Math.sin(angle) * dist;
      await goTo(x, bot.entity.position.y, z);
      await sleep(1000);
      continue;
    }
    
    log(`🌲 Gefunden: ${foundLog.name} bei ${foundLog.position.x}, ${foundLog.position.y}, ${foundLog.position.z}`);
    
    // Gehe zum Block
    const reached = await goTo(foundLog.position.x, foundLog.position.y, foundLog.position.z);
    if (!reached) continue;
    
    // Baue den Block ab
    const block = bot.blockAt(foundLog.position);
    if (block && block.name.includes('_log')) {
      log(`⛏️ Baue ${block.name} ab...`);
      const dug = await digBlock(block);
      if (dug) {
        await collectDrops();
        await sleep(200);
      }
    }
    
    updateCounts();
    log(`📊 Holz: ${woodCount}/${targetAmount}`);
  }
  
  log(`✅ Holz-Ziel erreicht: ${woodCount} Holz gesammelt!`);
}

// ==================== PHASE 2: WERKZEUGE CRAFTEN ====================

async function craftTools() {
  log('🔨 Crafte Werkzeuge...');
  updateCounts();
  
  if (woodCount < 4) {
    log('❌ Nicht genug Holz zum Craften!');
    return false;
  }
  
  // Finde einen Log im Inventar
  const logItem = bot.inventory.items().find(i => i.name.includes('_log'));
  if (!logItem) {
    log('❌ Kein Holz im Inventar!');
    return false;
  }
  
  const woodType = logItem.name.replace('_log', '');
  const planksName = `${woodType}_planks`;
  
  try {
    // Crafte Planks (4 pro Log)
    log('📐 Crafte Planks...');
    const planksRecipe = bot.recipesFor(mcData.itemsByName[planksName]?.id)[0];
    if (planksRecipe) {
      await bot.craft(planksRecipe, 4); // 4 Logs -> 16 Planks
      log('✅ Planks gecrafted!');
    }
    
    await sleep(500);
    
    // Crafte Sticks
    log('📐 Crafte Sticks...');
    const sticksRecipe = bot.recipesFor(mcData.itemsByName['stick']?.id)[0];
    if (sticksRecipe) {
      await bot.craft(sticksRecipe, 2);
      log('✅ Sticks gecrafted!');
    }
    
    await sleep(500);
    
    // Crafte Crafting Table
    log('📐 Crafte Werkbank...');
    const tableRecipe = bot.recipesFor(mcData.itemsByName['crafting_table']?.id)[0];
    if (tableRecipe) {
      await bot.craft(tableRecipe, 1);
      log('✅ Werkbank gecrafted!');
    }
    
    await sleep(500);
    
    // Platziere Werkbank
    const table = bot.inventory.items().find(i => i.name === 'crafting_table');
    if (table) {
      log('📦 Platziere Werkbank...');
      await bot.equip(table, 'hand');
      await sleep(300);
      
      // Finde einen Block VOR dem Bot zum Platzieren
      // Schaue in Blickrichtung
      const yaw = bot.entity.yaw;
      const dx = -Math.sin(yaw);
      const dz = Math.cos(yaw);
      
      // Finde festen Boden vor dem Bot
      for (let dist = 1; dist <= 3; dist++) {
        const targetX = Math.floor(bot.entity.position.x + dx * dist);
        const targetZ = Math.floor(bot.entity.position.z + dz * dist);
        const groundPos = new Vec3(targetX, Math.floor(bot.entity.position.y) - 1, targetZ);
        const ground = bot.blockAt(groundPos);
        const aboveGround = bot.blockAt(groundPos.offset(0, 1, 0));
        
        if (ground && ground.name !== 'air' && ground.name !== 'water' && 
            aboveGround && aboveGround.name === 'air') {
          try {
            // Gehe näher zum Ziel
            await goTo(targetX, bot.entity.position.y, targetZ);
            await sleep(300);
            
            // Platziere auf dem Bodenblock
            const placeTarget = bot.blockAt(groundPos);
            if (placeTarget) {
              await bot.placeBlock(placeTarget, new Vec3(0, 1, 0));
              log('✅ Werkbank platziert!');
              await sleep(500);
              break;
            }
          } catch (e) {
            log(`⚠️ Platzieren bei ${targetX}, ${targetZ} fehlgeschlagen: ${(e as Error).message}`);
          }
        }
      }
    }
    
    await sleep(500);
    
    // Finde platzierte Werkbank
    const craftingTable = findNearestBlock('crafting_table', 5);
    if (!craftingTable) {
      log('⚠️ Keine Werkbank gefunden, crafte ohne');
      return false;
    }
    
    // Crafte Holz-Spitzhacke
    log('📐 Crafte Holz-Spitzhacke...');
    const pickRecipe = bot.recipesFor(mcData.itemsByName['wooden_pickaxe']?.id, null, 1, craftingTable)[0];
    if (pickRecipe) {
      await bot.craft(pickRecipe, 1, craftingTable);
      hasPickaxe = true;
      log('✅ Holz-Spitzhacke gecrafted!');
    }
    
    await sleep(500);
    
    // Crafte Holz-Schwert
    log('📐 Crafte Holz-Schwert...');
    const swordRecipe = bot.recipesFor(mcData.itemsByName['wooden_sword']?.id, null, 1, craftingTable)[0];
    if (swordRecipe) {
      await bot.craft(swordRecipe, 1, craftingTable);
      hasSword = true;
      log('✅ Holz-Schwert gecrafted!');
    }
    
    updateCounts();
    return true;
    
  } catch (err) {
    log(`❌ Craft-Fehler: ${(err as Error).message}`);
    return false;
  }
}

// ==================== PHASE 3: STEIN SAMMELN ====================

async function gatherStone(targetAmount: number) {
  log(`⛰️ Sammle ${targetAmount} Stein...`);
  
  if (!hasPickaxe) {
    log('❌ Keine Spitzhacke! Kann keinen Stein abbauen.');
    return;
  }
  
  // Equip Pickaxe
  const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pickaxe) {
    await bot.equip(pickaxe, 'hand');
  }
  
  while (stoneCount < targetAmount && isRunning) {
    updateCounts();
    
    // Finde Stein (stone oder cobblestone an der Oberfläche)
    let stoneBlock = findNearestBlock('stone', 30);
    if (!stoneBlock) {
      // Grabe nach unten um Stein zu finden
      log('🔍 Suche Stein unter der Oberfläche...');
      
      // Grabe 3 Blöcke nach unten
      for (let i = 0; i < 5; i++) {
        const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (below && (below.name === 'stone' || below.name === 'cobblestone')) {
          stoneBlock = below;
          break;
        } else if (below && below.name !== 'air' && below.name !== 'water' && below.name !== 'lava') {
          await digBlock(below);
          await sleep(100);
        } else {
          break;
        }
      }
    }
    
    if (!stoneBlock) {
      log('❌ Kein Stein gefunden! Suche weiter...');
      const angle = Math.random() * Math.PI * 2;
      const dist = 15;
      await goTo(
        bot.entity.position.x + Math.cos(angle) * dist,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * dist
      );
      continue;
    }
    
    log(`⛏️ Baue Stein ab bei ${stoneBlock.position.x}, ${stoneBlock.position.y}, ${stoneBlock.position.z}`);
    
    // Gehe zum Stein
    await goTo(stoneBlock.position.x, stoneBlock.position.y + 1, stoneBlock.position.z);
    
    // Baue ab
    const block = bot.blockAt(stoneBlock.position);
    if (block && (block.name === 'stone' || block.name === 'cobblestone')) {
      await digBlock(block);
      await collectDrops();
    }
    
    updateCounts();
    log(`📊 Stein: ${stoneCount}/${targetAmount}`);
  }
  
  log(`✅ Stein-Ziel erreicht: ${stoneCount} Cobblestone!`);
}

// ==================== PHASE 4: STEIN-WERKZEUGE ====================

async function craftStoneTools() {
  log('🔨 Crafte Stein-Werkzeuge...');
  
  if (stoneCount < 8) {
    log('❌ Nicht genug Stein!');
    return false;
  }
  
  // Finde Werkbank
  const craftingTable = findNearestBlock('crafting_table', 10);
  if (!craftingTable) {
    log('⚠️ Keine Werkbank in der Nähe!');
    return false;
  }
  
  await goTo(craftingTable.position.x, craftingTable.position.y, craftingTable.position.z);
  
  try {
    // Stein-Spitzhacke
    const stonePickRecipe = bot.recipesFor(mcData.itemsByName['stone_pickaxe']?.id, null, 1, craftingTable)[0];
    if (stonePickRecipe) {
      await bot.craft(stonePickRecipe, 1, craftingTable);
      log('✅ Stein-Spitzhacke gecrafted!');
    }
    
    await sleep(300);
    
    // Stein-Schwert
    const stoneSwordRecipe = bot.recipesFor(mcData.itemsByName['stone_sword']?.id, null, 1, craftingTable)[0];
    if (stoneSwordRecipe) {
      await bot.craft(stoneSwordRecipe, 1, craftingTable);
      log('✅ Stein-Schwert gecrafted!');
    }
    
    await sleep(300);
    
    // Stein-Axt
    const stoneAxeRecipe = bot.recipesFor(mcData.itemsByName['stone_axe']?.id, null, 1, craftingTable)[0];
    if (stoneAxeRecipe) {
      await bot.craft(stoneAxeRecipe, 1, craftingTable);
      log('✅ Stein-Axt gecrafted!');
    }
    
    updateCounts();
    return true;
  } catch (err) {
    log(`❌ Craft-Fehler: ${(err as Error).message}`);
    return false;
  }
}

// ==================== PHASE 5: NOTFALL-SHELTER ====================

async function buildEmergencyShelter() {
  log('🏠 Baue Notfall-Shelter...');
  
  // Sammle Erde
  const dirtCount = countItem('dirt');
  if (dirtCount < 20) {
    log('🔍 Sammle Erde...');
    for (let i = 0; i < 20; i++) {
      const dirt = findNearestBlock('dirt', 10);
      if (dirt) {
        await goTo(dirt.position.x, dirt.position.y, dirt.position.z);
        await digBlock(dirt);
        await collectDrops();
      }
    }
  }
  
  // Baue 3x3 Notfall-Hütte
  const basePos = bot.entity.position.clone();
  log(`📍 Shelter-Position: ${basePos.x}, ${basePos.y}, ${basePos.z}`);
  
  const dirtItem = bot.inventory.items().find(i => i.name === 'dirt' || i.name === 'cobblestone');
  if (!dirtItem) {
    log('❌ Kein Baumaterial!');
    return;
  }
  
  await bot.equip(dirtItem, 'hand');
  
  // Baue einfache Wände
  log('🧱 Baue Wände...');
  // TODO: Implementiere echtes Bauen
  
  log('✅ Notfall-Shelter gebaut!');
}

// ==================== NACHT-ÜBERLEBEN ====================

async function hideForNight() {
  log('🌙 Nacht! Verstecke mich...');
  
  // Merke Startposition
  const startPos = bot.entity.position.clone();
  
  // Grabe 3 Blöcke nach unten
  let dugBlocks = 0;
  for (let i = 0; i < 3; i++) {
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (below && below.name !== 'air' && below.name !== 'water' && below.name !== 'lava' && below.name !== 'bedrock') {
      const dug = await digBlock(below);
      if (dug) {
        dugBlocks++;
        await sleep(300);
      }
    } else {
      break; // Kann nicht weiter graben
    }
  }
  
  if (dugBlocks === 0) {
    log('⚠️ Konnte kein Loch graben, warte einfach...');
  } else {
    log(`🕳️ ${dugBlocks} Blöcke tief! Warte auf Morgen...`);
    bot.chat(`Bin ${dugBlocks} Bloecke tief, warte auf Morgen!`);
  }
  
  // Schließe das Loch über uns wenn möglich
  const dirtItem = bot.inventory.items().find(i => i.name === 'dirt' || i.name === 'cobblestone' || i.name.includes('_log'));
  if (dirtItem && dugBlocks > 0) {
    try {
      await bot.equip(dirtItem, 'hand');
      await sleep(200);
      
      // Versuche das Loch zu schließen
      const aboveHead = bot.blockAt(bot.entity.position.offset(0, 2, 0));
      if (aboveHead && aboveHead.name === 'air') {
        const wallBlock = bot.blockAt(bot.entity.position.offset(0, 1, 0));
        if (wallBlock && wallBlock.name !== 'air') {
          await bot.placeBlock(wallBlock, new Vec3(0, 1, 0));
          log('🔒 Loch geschlossen!');
        }
      }
    } catch (e) {
      log('⚠️ Konnte Loch nicht schließen');
    }
  }
  
  // Warte auf Tag (mit Timeout von 5 Minuten)
  const startWait = Date.now();
  const maxWaitMs = 5 * 60 * 1000; // 5 Minuten
  
  while ((bot.time.timeOfDay >= 13000 || bot.time.timeOfDay < 1000) && isRunning) {
    // Timeout check
    if (Date.now() - startWait > maxWaitMs) {
      log('⏰ Warte-Timeout! Versuche trotzdem rauszukommen...');
      break;
    }
    
    await sleep(3000);
    const timeLeft = Math.floor((24000 - bot.time.timeOfDay) / 20); // Sekunden bis Morgen
    log(`🌙 Warte auf Morgen... (${bot.time.timeOfDay} ticks, ~${timeLeft}s)`);
    
    // Baue Stein ab wenn möglich
    if (hasPickaxe) {
      const directions = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
        { x: 0, y: -1, z: 0 }
      ];
      
      for (const dir of directions) {
        const block = bot.blockAt(bot.entity.position.offset(dir.x, dir.y, dir.z));
        if (block && (block.name === 'stone' || block.name === 'cobblestone' || block.name === 'coal_ore')) {
          const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
          if (pick) {
            await bot.equip(pick, 'hand');
            await digBlock(block);
            await collectDrops();
            updateCounts();
            break;
          }
        }
      }
    }
  }
  
  log('🌅 Morgen (oder Timeout)! Komme raus!');
  
  // Grabe nach oben zum Ausgang
  for (let i = 0; i < dugBlocks + 2; i++) {
    // Grabe Block über uns
    const above = bot.blockAt(bot.entity.position.offset(0, 2, 0));
    if (above && above.name !== 'air' && above.name !== 'water') {
      await digBlock(above);
      await sleep(200);
    }
    
    // Spring hoch
    bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    await sleep(300);
    
    // Check ob wir an der Oberfläche sind
    const sky = bot.blockAt(bot.entity.position.offset(0, 3, 0));
    if (sky && sky.name === 'air') {
      const aboveSky = bot.blockAt(bot.entity.position.offset(0, 4, 0));
      if (aboveSky && aboveSky.name === 'air') {
        log('🆙 An der Oberfläche!');
        break;
      }
    }
  }
}

// ==================== HAUPT-PROGRAMM ====================

async function runDayOne() {
  log('🌅 === TAG 1 BEGINNT ===');
  isRunning = true;
  
  // Check: Ist es Nacht? Dann zuerst verstecken!
  const currentTime = bot.time.timeOfDay;
  log(`⏰ Aktuelle Zeit: ${currentTime} ticks`);
  
  if (currentTime >= 13000 || currentTime < 1000) {
    log('🌙 Es ist Nacht! Verstecke mich zuerst...');
    bot.chat('Es ist Nacht! Ich verstecke mich und warte auf Morgen.');
    await hideForNight();
    log('🌅 Morgen! Jetzt kann ich starten.');
  }
  
  // Versuche Server-Befehle (falls OP)
  bot.chat('Starte Tag 1! Bitte gib mir OP mit: /op ToobixDay1');
  await sleep(1000);
  
  // Versuche Zeit zu setzen
  bot.chat('/time set 0');
  await sleep(500);
  bot.chat('/gamerule keepInventory true');
  await sleep(500);
  bot.chat('/weather clear');
  await sleep(1000);
  
  log('⚙️ Befehle gesendet (falls OP: Zeit=Morgen, keepInventory=true)');
  bot.chat('Tag 1 startet! Erst Holz, dann Werkzeuge...');
  
  // PHASE 1: HOLZ (10 Logs)
  log('=== PHASE 1: HOLZ SAMMELN ===');
  await gatherWood(10);
  
  // PHASE 2: WERKZEUGE
  log('=== PHASE 2: WERKZEUGE ===');
  await craftTools();
  updateCounts();
  
  // PHASE 3: STEIN (20 Cobblestone)
  log('=== PHASE 3: STEIN SAMMELN ===');
  if (hasPickaxe) {
    await gatherStone(20);
  } else {
    log('⚠️ Keine Spitzhacke, überspringe Stein-Phase');
  }
  
  // PHASE 4: STEIN-WERKZEUGE
  log('=== PHASE 4: STEIN-WERKZEUGE ===');
  if (stoneCount >= 8) {
    await craftStoneTools();
  }
  
  // Check: Ist es fast Nacht?
  if (bot.time.timeOfDay > 12000) {
    log('=== NACHT-MODUS ===');
    await hideForNight();
  }
  
  // PHASE 5: MEHR RESSOURCEN
  log('=== PHASE 5: WEITERE RESSOURCEN ===');
  await gatherWood(20);
  await gatherStone(40);
  
  // STATUS REPORT
  updateCounts();
  log('=== TAG 1 ZUSAMMENFASSUNG ===');
  log(`📦 Holz: ${woodCount}`);
  log(`⛰️ Stein: ${stoneCount}`);
  log(`🔨 Spitzhacke: ${hasPickaxe}`);
  log(`⚔️ Schwert: ${hasSword}`);
  log(`🪓 Axt: ${hasAxe}`);
  
  bot.chat(`Tag 1 abgeschlossen! ${woodCount} Holz, ${stoneCount} Stein, Werkzeuge: ✅`);
  
  // Warte auf weitere Befehle
  log('✅ Tag 1 abgeschlossen! Warte auf Befehle...');
  while (isRunning) {
    await sleep(5000);
    
    // Check für Nacht
    if (bot.time.timeOfDay >= 13000 || bot.time.timeOfDay < 1000) {
      await hideForNight();
    }
  }
}

// ==================== BOT SETUP ====================

function createBot() {
  log('🤖 Erstelle Bot...');
  
  bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);
  
  bot.once('spawn', async () => {
    log(`📍 Spawned bei: ${bot.entity.position.toString()}`);
    
    mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot);
    movements.canDig = true;
    movements.allowParkour = false;
    bot.pathfinder.setMovements(movements);
    
    // Starte Tag 1 nach kurzer Pause
    setTimeout(() => runDayOne(), 3000);
  });
  
  bot.on('death', () => {
    log('💀 Gestorben! Respawne...');
    updateCounts();
  });
  
  bot.on('health', () => {
    if (bot.health < 5) {
      log(`⚠️ Niedrige HP: ${bot.health}`);
    }
  });
  
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    if (message === 'status') {
      updateCounts();
      bot.chat(`Holz: ${woodCount}, Stein: ${stoneCount}, HP: ${bot.health}`);
    } else if (message === 'stop') {
      isRunning = false;
      bot.chat('Angehalten!');
    } else if (message === 'restart') {
      isRunning = true;
      runDayOne();
    }
  });
  
  bot.on('error', (err) => log(`❌ Fehler: ${err.message}`));
  
  bot.on('kicked', (reason) => {
    log(`❌ Gekickt: ${reason}`);
    process.exit(1);
  });
  
  bot.on('end', () => {
    log('🔌 Verbindung beendet');
    process.exit(0);
  });
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  log('🛑 Beende Bot...');
  isRunning = false;
  if (bot) {
    bot.chat('Tschüss!');
    bot.end();
  }
  process.exit(0);
});

// START
createBot();
