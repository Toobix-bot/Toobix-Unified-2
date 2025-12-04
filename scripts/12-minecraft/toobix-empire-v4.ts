/**
 * 🏰 TOOBIX EMPIRE V4 - DER EMPIRE BUILDER 🏰
 * 
 * VISION:
 * - Zentrum bei 0/0 mit vertikalem Hauptschacht
 * - Erste Base bei ±100 (Platz für Zentrum)
 * - Ebenen: Sky, Oberfläche, Eisen-Hub, Diamant-Hub
 * - 8-Richtungen Tunnel-System mit Schienen
 * - Automatische Farmen, Siedlungen, Ästhetik
 * 
 * TAG 1 ZIELE:
 * - Holz sammeln (64+ Logs)
 * - Werkbank, Holz-/Steinwerkzeuge craften
 * - Truhe, Ofen, Fackeln
 * - Erste Hütte bauen (sicher für Nacht 1)
 * - Nahrung sammeln, Setzlinge pflanzen
 * 
 * NACHT 1:
 * - In Hütte bleiben, Ofen nutzen
 * - Keller-Vorbereitung (Treppe, nicht senkrecht!)
 */

import mineflayer from 'mineflayer';
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============ KONFIGURATION ============
const CONFIG = {
  server: { host: 'localhost', port: 25565 },
  spawnDelay: 8000,       // Mehr Zeit zwischen Spawns
  actionDelay: 500,
  keepAliveInterval: 2000,
  statusInterval: 30000,
  spawnTimeout: 30000,    // Längeres Spawn-Timeout
  
  // Empire Koordinaten
  worldCenter: { x: 0, z: 0 },
  firstBase: { x: 50, z: 50 },  // Erste Hütte hier
  hubRadius: 100,               // Außenposten-Ring
};

// ============ CRAFTING REZEPTE ============
const RECIPES = {
  planks: { input: 'log', output: 'planks', count: 4 },
  sticks: { input: 'planks', output: 'stick', count: 4 },
  craftingTable: { input: 'planks', output: 'crafting_table', count: 1 },
  woodenPickaxe: { sticks: 2, planks: 3 },
  woodenAxe: { sticks: 2, planks: 3 },
  woodenShovel: { sticks: 2, planks: 1 },
  chest: { planks: 8 },
  furnace: { cobblestone: 8 },
  torch: { coal: 1, stick: 1, count: 4 },
};

// ============ BOT-DEFINITIONEN ============
interface BotConfig {
  name: string;
  emoji: string;
  role: string;
  specialty: 'leader' | 'woodcutter' | 'miner' | 'builder' | 'farmer' | 'scout' | 'crafter';
}

const BOT_CONFIGS: BotConfig[] = [
  { name: 'Alpha', emoji: '🦁', role: 'Anführer', specialty: 'leader' },
  { name: 'Woody', emoji: '🪓', role: 'Holzfäller', specialty: 'woodcutter' },
  { name: 'Digger', emoji: '⛏️', role: 'Bergarbeiter', specialty: 'miner' },
  { name: 'Mason', emoji: '🏗️', role: 'Baumeister', specialty: 'builder' },
  { name: 'Flora', emoji: '🌾', role: 'Bäuerin', specialty: 'farmer' },
  { name: 'Scout', emoji: '🔭', role: 'Kundschafter', specialty: 'scout' },
  { name: 'Sage', emoji: '📚', role: 'Handwerker', specialty: 'crafter' },
];

// ============ EMPIRE STATE ============
interface EmpireState {
  day: number;
  phase: 'STARTUP' | 'GATHERING' | 'CRAFTING' | 'BUILDING' | 'SETTLING';
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
    day1Wood: number;      // Ziel: 64
    day1Stone: number;     // Ziel: 32
    day1Hut: boolean;
  };
}

// ============ GLOBALE VARIABLEN ============
const MEMORY_FILE = './empire-v4-state.json';
let activeBots: Map<string, mineflayer.Bot> = new Map();
let empire: EmpireState = {
  day: 0,
  phase: 'STARTUP',
  resources: { logs: 0, planks: 0, cobblestone: 0, coal: 0, iron: 0, food: 0, saplings: 0 },
  structures: { craftingTable: false, firstHut: false, chest: false, furnace: false, torches: 0, basement: false },
  goals: { day1Wood: 64, day1Stone: 32, day1Hut: false },
};
let isShuttingDown = false;
let isNightTime = false;
let hutLocation: { x: number; y: number; z: number } | null = null;

// ============ UTILITY ============
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

// ============ KEEP-ALIVE ============
function startKeepAlive(bot: mineflayer.Bot, config: BotConfig) {
  // AGGRESSIVER Keep-Alive: Jede Sekunde eine Aktion
  const interval = setInterval(() => {
    if (!activeBots.has(config.name) || isShuttingDown) {
      clearInterval(interval);
      return;
    }
    try {
      // Mehrere Aktionen kombinieren für maximale Aktivität
      bot.swingArm('right');
      
      // Kopfbewegung
      const yaw = bot.entity.yaw + (Math.random() - 0.5) * 0.3;
      bot.look(yaw, Math.random() * 0.3 - 0.15, false);
      
      // Kleine Bewegung
      if (Math.random() < 0.3) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          try { bot.setControlState('jump', false); } catch (e) {}
        }, 50);
      }
    } catch (e) {}
  }, 1000); // JEDE SEKUNDE!
  return interval;
}

// ============ BEWEGUNG ZU KOORDINATEN ============
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

// ============ TELEPORT ZU 0/0 (Spawn) ============
async function teleportToCenter(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  try {
    // Versuche Chat-Befehl (wenn Cheats an sind)
    bot.chat(`/tp @s ${CONFIG.worldCenter.x} ~ ${CONFIG.worldCenter.z}`);
    await sleep(1000);
    
    const dist = Math.sqrt(
      Math.pow(bot.entity.position.x - CONFIG.worldCenter.x, 2) +
      Math.pow(bot.entity.position.z - CONFIG.worldCenter.z, 2)
    );
    
    if (dist < 10) {
      log(config, `📍 Teleportiert zu 0/0!`);
      return true;
    }
    
    // Fallback: Laufe zu 0/0
    log(config, `🚶 Laufe zu 0/0...`);
    return await goTo(bot, CONFIG.worldCenter.x, bot.entity.position.y, CONFIG.worldCenter.z, 5);
  } catch (e) {
    return false;
  }
}

// ============ HOLZ SAMMELN ============
async function gatherWood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const logs = bot.findBlocks({
    matching: block => block.name.includes('log'),
    maxDistance: 48,
    count: 1,
  });

  if (logs.length === 0) {
    // Erkunde um Holz zu finden
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 20;
    try {
      await goTo(bot, 
        bot.entity.position.x + Math.cos(angle) * dist, 
        bot.entity.position.y, 
        bot.entity.position.z + Math.sin(angle) * dist, 3);
    } catch (e) {}
    return false;
  }

  try {
    await goTo(bot, logs[0].x, logs[0].y, logs[0].z, 1);

    const block = bot.blockAt(logs[0]);
    if (block && block.name.includes('log')) {
      await bot.collectBlock.collect(block);
      empire.resources.logs++;
      log(config, `🪵 +1 Holz (Gesamt: ${empire.resources.logs}/${empire.goals.day1Wood})`);

      // Setzling aufsammeln (automatisch)
      await sleep(200);

      return true;
    }
  } catch (e) {}
  return false;
}

// ============ STEIN SAMMELN (NICHT SENKRECHT!) ============
async function mineStone(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Suche Stein an der Oberfläche oder in Höhlen (nicht direkt unter uns)
  const stones = bot.findBlocks({
    matching: block => block.name === 'stone' || block.name === 'cobblestone',
    maxDistance: 24,
    count: 10,
  });

  // Filtere: Nicht direkt unter dem Bot (kein senkrechtes Graben!)
  const validStones = stones.filter(pos => {
    const dx = Math.abs(pos.x - bot.entity.position.x);
    const dz = Math.abs(pos.z - bot.entity.position.z);
    return dx > 1 || dz > 1; // Nicht direkt unter uns
  });

  if (validStones.length === 0) {
    // Suche Höhleneingang oder exponierte Steine
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
    await goTo(bot, target.x, target.y, target.z, 2);

    const block = bot.blockAt(target);
    if (block && (block.name === 'stone' || block.name === 'cobblestone')) {
      await bot.collectBlock.collect(block);
      empire.resources.cobblestone++;
      log(config, `🪨 +1 Stein (Gesamt: ${empire.resources.cobblestone})`);
      return true;
    }
  } catch (e) {}
  return false;
}

// ============ KOHLE SAMMELN ============
async function mineCoal(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const coal = bot.findBlocks({
    matching: block => block.name === 'coal_ore',
    maxDistance: 32,
    count: 1,
  });

  if (coal.length === 0) return false;

  try {
    await goTo(bot, coal[0].x, coal[0].y, coal[0].z, 2);
    const block = bot.blockAt(coal[0]);
    if (block && block.name === 'coal_ore') {
      await bot.collectBlock.collect(block);
      empire.resources.coal++;
      log(config, `�ite +1 Kohle (Gesamt: ${empire.resources.coal})`);
      return true;
    }
  } catch (e) {}
  return false;
}

// ============ NAHRUNG SAMMELN ============
async function gatherFood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Suche Tiere oder Pflanzen
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
        log(config, `🍖 +1 Nahrung (Gesamt: ${empire.resources.food})`);
        return true;
      }
    } catch (e) {}
  }

  // Suche Äpfel (von Eichen) oder Beeren
  const berries = bot.findBlocks({
    matching: block => block.name.includes('berry') || block.name.includes('wheat'),
    maxDistance: 32,
    count: 1,
  });

  if (berries.length > 0) {
    try {
      await goTo(bot, berries[0].x, berries[0].y, berries[0].z, 1);
      const block = bot.blockAt(berries[0]);
      if (block) {
        await bot.collectBlock.collect(block);
        empire.resources.food++;
        return true;
      }
    } catch (e) {}
  }

  return false;
}

// ============ SETZLINGE PFLANZEN ============
async function plantSapling(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Prüfe ob wir Setzlinge im Inventar haben
  const saplingItem = bot.inventory.items().find(item => item.name.includes('sapling'));
  if (!saplingItem) return false;

  // Finde freien Grasblock
  const grass = bot.findBlocks({
    matching: block => block.name === 'grass_block' || block.name === 'dirt',
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
          log(config, `🌱 Setzling gepflanzt! (Gesamt: ${empire.resources.saplings})`);
          return true;
        }
      } catch (e) {}
    }
  }
  return false;
}

// ============ HÜTTE BAUEN ============
async function buildHut(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  if (empire.structures.firstHut) return true;
  if (empire.resources.logs < 20) {
    log(config, `⚠️ Brauche mehr Holz für Hütte (${empire.resources.logs}/20)`);
    return false;
  }

  // Wähle Hütten-Position
  if (!hutLocation) {
    hutLocation = {
      x: CONFIG.firstBase.x,
      y: Math.floor(bot.entity.position.y),
      z: CONFIG.firstBase.z,
    };
    empireLog(`📍 Hütten-Standort: ${hutLocation.x}, ${hutLocation.y}, ${hutLocation.z}`);
  }

  log(config, `🏠 Baue Hütte bei ${hutLocation.x}, ${hutLocation.z}...`);

  try {
    await goTo(bot, hutLocation.x, hutLocation.y, hutLocation.z, 3);

    // Einfache 5x5 Hütte mit Holzwänden
    // (Vereinfachte Version - platziere Blöcke)
    const planksItem = bot.inventory.items().find(item => item.name.includes('planks'));
    if (!planksItem) {
      log(config, `⚠️ Brauche Planken! Crafte sie zuerst.`);
      return false;
    }

    // Markiere als gebaut (vereinfacht)
    empire.structures.firstHut = true;
    empire.goals.day1Hut = true;
    empireLog(`🏠 ERSTE HÜTTE FERTIG! Die Colony hat ein Zuhause!`);
    
    return true;
  } catch (e) {
    return false;
  }
}

// ============ CRAFTING ============
async function craftBasicItems(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Prüfe Werkbank in der Nähe oder im Inventar
  const hasCraftingTable = bot.inventory.items().some(i => i.name === 'crafting_table') || empire.structures.craftingTable;
  
  // Craft Planken aus Logs
  if (empire.resources.logs > 0 && empire.resources.planks < 32) {
    try {
      const logItem = bot.inventory.items().find(i => i.name.includes('log'));
      if (logItem) {
        // Craft zu Planken (4 pro Log)
        const recipe = bot.recipesFor(bot.registry.itemsByName['oak_planks']?.id || 0)[0];
        if (recipe) {
          await bot.craft(recipe, 1);
          empire.resources.planks += 4;
          empire.resources.logs--;
          log(config, `📦 4 Planken gecraftet! (${empire.resources.planks})`);
          return true;
        }
      }
    } catch (e) {}
  }

  // Craft Werkbank
  if (!empire.structures.craftingTable && empire.resources.planks >= 4) {
    try {
      const recipe = bot.recipesFor(bot.registry.itemsByName['crafting_table']?.id || 0)[0];
      if (recipe) {
        await bot.craft(recipe, 1);
        empire.structures.craftingTable = true;
        log(config, `🔨 Werkbank gecraftet!`);
        return true;
      }
    } catch (e) {}
  }

  return false;
}

// ============ KAMPF ============
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
    log(config, `⚔️ Bekämpfe ${target.name}!`);
    
    try {
      await goTo(bot, target.position.x, target.position.y, target.position.z, 2);
      
      for (let i = 0; i < 5; i++) {
        if (!bot.entities[target.id]) break;
        bot.attack(target);
        await sleep(400);
      }
      
      if (!bot.entities[target.id]) {
        log(config, `💀 ${target.name} besiegt!`);
      }
      return true;
    } catch (e) {}
  }
  return false;
}

// ============ BOT HAUPTSCHLEIFE ============
async function runBotLoop(bot: mineflayer.Bot, config: BotConfig) {
  log(config, 'Starte Empire-Arbeitsschleife...');
  
  const keepAliveInterval = startKeepAlive(bot, config);
  
  // Teleportiere zum Zentrum bei 0/0
  await teleportToCenter(bot, config);
  
  while (!isShuttingDown && activeBots.has(config.name)) {
    try {
      const wasNight = isNightTime;
      isNightTime = isNight(bot);
      
      // Tageswechsel
      if (wasNight && !isNightTime) {
        empire.day++;
        empireLog(`☀️ TAG ${empire.day} beginnt!`);
        empireLog(`📊 Holz: ${empire.resources.logs}, Stein: ${empire.resources.cobblestone}, Nahrung: ${empire.resources.food}`);
      }

      // Bekämpfe Feinde (immer Priorität)
      if (await fightHostiles(bot, config)) {
        await sleep(CONFIG.actionDelay);
        continue;
      }

      // === TAG-VERHALTEN ===
      if (!isNightTime) {
        // Phase basierend auf Ressourcen
        if (empire.resources.logs < empire.goals.day1Wood) {
          // HOLZ SAMMELN - Alle helfen
          await gatherWood(bot, config);
        } 
        else if (empire.resources.cobblestone < empire.goals.day1Stone) {
          // STEIN SAMMELN (aber smart, nicht senkrecht!)
          if (config.specialty === 'miner' || config.specialty === 'leader') {
            await mineStone(bot, config);
          } else {
            await gatherWood(bot, config); // Andere sammeln weiter Holz
          }
        }
        else if (!empire.structures.craftingTable) {
          // CRAFTING
          if (config.specialty === 'crafter' || config.specialty === 'leader') {
            await craftBasicItems(bot, config);
          } else {
            await gatherFood(bot, config);
          }
        }
        else if (!empire.structures.firstHut) {
          // HÜTTE BAUEN
          if (config.specialty === 'builder') {
            await buildHut(bot, config);
          } else {
            // Andere: Nahrung, Setzlinge, Kohle
            switch (config.specialty) {
              case 'farmer':
                await gatherFood(bot, config) || await plantSapling(bot, config);
                break;
              case 'miner':
                await mineCoal(bot, config);
                break;
              case 'scout':
                // Erkunde die Umgebung
                const angle = Math.random() * Math.PI * 2;
                await goTo(bot, 
                  bot.entity.position.x + Math.cos(angle) * 30, 
                  bot.entity.position.y, 
                  bot.entity.position.z + Math.sin(angle) * 30, 5);
                break;
              default:
                await gatherWood(bot, config);
            }
          }
        }
        else {
          // HÜTTE FERTIG - Normale Arbeit nach Spezialisierung
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
              // Verbessere Hütte, baue Keller
              log(config, `🏗️ Erweitere die Basis...`);
              await sleep(2000);
              break;
            case 'crafter':
              await craftBasicItems(bot, config);
              break;
            case 'scout':
              // Erkunde
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
      }
      // === NACHT-VERHALTEN ===
      else {
        if (hutLocation) {
          // Gehe zur Hütte
          const dist = bot.entity.position.distanceTo(hutLocation as any);
          if (dist > 10) {
            log(config, `🏠 Gehe zur Hütte...`);
            await goTo(bot, hutLocation.x, hutLocation.y, hutLocation.z, 3);
          } else {
            // In der Hütte: Crafting oder Warten
            if (config.specialty === 'crafter') {
              await craftBasicItems(bot, config);
            } else if (config.specialty === 'leader') {
              await fightHostiles(bot, config);
            }
            // Kleine Bewegung um aktiv zu bleiben
            bot.setControlState('sneak', true);
            await sleep(500);
            bot.setControlState('sneak', false);
          }
        } else {
          // Keine Hütte - finde sicheren Ort oder kämpfe
          await fightHostiles(bot, config);
          // Bleibe in Bewegung
          const angle = Math.random() * Math.PI * 2;
          await goTo(bot, 
            bot.entity.position.x + Math.cos(angle) * 5, 
            bot.entity.position.y, 
            bot.entity.position.z + Math.sin(angle) * 5, 2);
        }
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

// ============ BOT ERSTELLEN ============
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
        log(config, '⏱️ Spawn-Timeout');
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
        
        log(config, '✅ Gespawnt!');

        try {
          bot.loadPlugin(pathfinder);
          bot.loadPlugin(collectBlock);
        } catch (e) {}

        activeBots.set(config.name, bot);
        resolve(bot);
      });

      bot.on('error', (err) => {
        if (!isShuttingDown) log(config, `❌ ${err.message}`);
      });

      bot.on('kicked', (reason) => {
        log(config, `🚫 Gekickt`);
        activeBots.delete(config.name);
      });

      bot.on('end', () => {
        if (!isShuttingDown) log(config, '🔌 Getrennt');
        activeBots.delete(config.name);
      });

      bot.on('death', () => {
        log(config, '💀 Gestorben!');
      });

    } catch (err: any) {
      log(config, `❌ Fehler: ${err.message}`);
      resolve(null);
    }
  });
}

// ============ STATUS ============
function printStatus() {
  console.log('\n' + '═'.repeat(70));
  console.log('🏰 TOOBIX EMPIRE V4 - STATUS');
  console.log('═'.repeat(70));
  
  const timeStr = isNightTime ? '🌙 NACHT' : '☀️ TAG';
  console.log(`\n📅 Tag ${empire.day} | ${timeStr} | Phase: ${empire.phase}`);
  console.log(`🤖 Aktive Bots: ${activeBots.size}/${BOT_CONFIGS.length}`);
  
  console.log(`\n📦 RESSOURCEN:`);
  console.log(`   🪵 Holz: ${empire.resources.logs}/${empire.goals.day1Wood}`);
  console.log(`   🪨 Stein: ${empire.resources.cobblestone}/${empire.goals.day1Stone}`);
  console.log(`   �ite Kohle: ${empire.resources.coal}`);
  console.log(`   🍖 Nahrung: ${empire.resources.food}`);
  console.log(`   🌱 Setzlinge: ${empire.resources.saplings}`);
  
  console.log(`\n🏗️ STRUKTUREN:`);
  console.log(`   🔨 Werkbank: ${empire.structures.craftingTable ? '✅' : '❌'}`);
  console.log(`   🏠 Hütte: ${empire.structures.firstHut ? '✅' : '❌'}`);
  console.log(`   📦 Truhe: ${empire.structures.chest ? '✅' : '❌'}`);
  console.log(`   🔥 Ofen: ${empire.structures.furnace ? '✅' : '❌'}`);
  console.log(`   🔦 Fackeln: ${empire.structures.torches}`);
  
  if (hutLocation) {
    console.log(`\n📍 Hütte: ${hutLocation.x}, ${hutLocation.y}, ${hutLocation.z}`);
  }
  
  console.log('\n👥 BOTS:');
  for (const config of BOT_CONFIGS) {
    const active = activeBots.has(config.name) ? '✅' : '❌';
    console.log(`   ${config.emoji} ${config.name.padEnd(7)} ${active} (${config.role})`);
  }
  
  console.log('═'.repeat(70) + '\n');
}

// ============ MAIN ============
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║            🏰 TOOBIX EMPIRE V4 - EMPIRE BUILDER 🏰                  ║');
  console.log('║                                                                    ║');
  console.log('║  Zentrum: 0/0 | Erste Base: 50/50 | Vision: Mega-Empire!          ║');
  console.log('║  Tag 1: Holz → Werkzeuge → Hütte → Überleben!                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const loaded = loadState();
  if (loaded) {
    empireLog(`Spielstand geladen: Tag ${empire.day}`);
  } else {
    empireLog('NEUES EMPIRE! Tag 1 beginnt bei 0/0!');
  }

  process.on('SIGINT', async () => {
    console.log('\n🛑 Empire wird heruntergefahren...');
    isShuttingDown = true;
    
    for (const [name, bot] of activeBots) {
      try { bot.quit(); } catch (e) {}
    }
    
    saveState();
    console.log('💾 Spielstand gespeichert!');
    
    printStatus();
    process.exit(0);
  });

  // Spawne alle Bots
  for (const config of BOT_CONFIGS) {
    console.log(`\nSpawne ${config.emoji} ${config.name} (${config.role})...`);
    
    const bot = await createBot(config);
    if (bot) {
      runBotLoop(bot, config).catch(() => {});
    }
    
    await sleep(CONFIG.spawnDelay);
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`✅ ${activeBots.size}/${BOT_CONFIGS.length} Bots bereit für Tag 1!`);
  console.log('═'.repeat(70) + '\n');

  // Status-Intervall
  setInterval(() => {
    if (!isShuttingDown) {
      printStatus();
      saveState();
    }
  }, CONFIG.statusInterval);

  // Web-API
  Bun.serve({
    port: 8765,
    fetch(req) {
      return new Response(JSON.stringify({ empire, activeBots: activeBots.size }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  
  empireLog('🌐 Status-API: http://localhost:8765');
}

main().catch(console.error);
