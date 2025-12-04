/**
 * 🏰 TOOBIX COLONY ULTIMATE
 * 
 * Ein vollständiges 7-Bot-Ökosystem mit:
 * - Phasenbasiertem Gameplay (Early/Mid/Late Game)
 * - Tag/Nacht-Zyklen mit angepasstem Verhalten
 * - Individuelle & Kollektive Achievements
 * - Dynamische Arbeitsteilung
 * - Bedürfnis-System (Hunger, Sicherheit, Ressourcen)
 * - Highscores & Statistiken
 */

import mineflayer from 'mineflayer';
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============ KONFIGURATION ============
const CONFIG = {
  server: { host: 'localhost', port: 25565 },
  spawnDelay: 8000,      // Mehr Zeit zwischen Spawns
  actionDelay: 1500,     // Delay zwischen Aktionen
  statusInterval: 60000, // Status alle 60 Sekunden
  saveInterval: 30000,   // Speichern alle 30 Sekunden
  reconnectDelay: 10000, // Reconnect nach Disconnect
};

// ============ SPIEL-PHASEN ============
enum GamePhase {
  SURVIVAL = 'survival',    // Tag 0-1: Überleben, Holz sammeln
  SETTLEMENT = 'settlement', // Tag 2-5: Basis bauen, Werkzeuge
  EXPANSION = 'expansion',   // Tag 6-14: Mine, Farm, erkunden
  THRIVING = 'thriving',     // Tag 15+: Optimierung, Projekte
}

// ============ BOT-DEFINITIONEN ============
interface BotConfig {
  name: string;
  emoji: string;
  personality: string;
  baseSkills: { gathering: number; mining: number; building: number; combat: number; farming: number };
}

const BOT_CONFIGS: BotConfig[] = [
  { 
    name: 'Alpha', emoji: '🦁', personality: 'Anführer',
    baseSkills: { gathering: 0.8, mining: 0.6, building: 0.7, combat: 1.0, farming: 0.5 }
  },
  { 
    name: 'Woody', emoji: '🪓', personality: 'Holzfäller',
    baseSkills: { gathering: 1.0, mining: 0.5, building: 0.8, combat: 0.6, farming: 0.4 }
  },
  { 
    name: 'Digger', emoji: '⛏️', personality: 'Bergarbeiter',
    baseSkills: { gathering: 0.5, mining: 1.0, building: 0.6, combat: 0.5, farming: 0.3 }
  },
  { 
    name: 'Mason', emoji: '🏗️', personality: 'Baumeister',
    baseSkills: { gathering: 0.6, mining: 0.7, building: 1.0, combat: 0.4, farming: 0.5 }
  },
  { 
    name: 'Flora', emoji: '🌾', personality: 'Bäuerin',
    baseSkills: { gathering: 0.7, mining: 0.3, building: 0.5, combat: 0.4, farming: 1.0 }
  },
  { 
    name: 'Scout', emoji: '🔭', personality: 'Kundschafter',
    baseSkills: { gathering: 0.6, mining: 0.4, building: 0.3, combat: 0.8, farming: 0.4 }
  },
  { 
    name: 'Sage', emoji: '📚', personality: 'Weiser',
    baseSkills: { gathering: 0.5, mining: 0.5, building: 0.6, combat: 0.3, farming: 0.6 }
  },
];

// ============ ACHIEVEMENTS ============
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: BotStats | ColonyStats) => boolean;
  points: number;
}

const INDIVIDUAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_wood', name: 'Holzkopf', description: 'Erstes Holz gesammelt', icon: '🪵', 
    requirement: (s: BotStats) => s.woodCollected >= 1, points: 10 },
  { id: 'lumberjack', name: 'Holzfäller', description: '50 Holz gesammelt', icon: '🪓',
    requirement: (s: BotStats) => s.woodCollected >= 50, points: 50 },
  { id: 'master_lumberjack', name: 'Meister-Holzfäller', description: '200 Holz gesammelt', icon: '🌲',
    requirement: (s: BotStats) => s.woodCollected >= 200, points: 200 },
  { id: 'first_stone', name: 'Steinzeit', description: 'Ersten Stein abgebaut', icon: '🪨',
    requirement: (s: BotStats) => s.stoneMined >= 1, points: 10 },
  { id: 'miner', name: 'Bergarbeiter', description: '100 Blöcke abgebaut', icon: '⛏️',
    requirement: (s: BotStats) => s.stoneMined >= 100, points: 100 },
  { id: 'survivor', name: 'Überlebender', description: 'Erste Nacht überlebt', icon: '🌙',
    requirement: (s: BotStats) => s.nightsSurvived >= 1, points: 25 },
  { id: 'veteran', name: 'Veteran', description: '10 Nächte überlebt', icon: '⭐',
    requirement: (s: BotStats) => s.nightsSurvived >= 10, points: 100 },
  { id: 'explorer', name: 'Entdecker', description: '500 Blöcke gereist', icon: '🧭',
    requirement: (s: BotStats) => s.distanceTraveled >= 500, points: 50 },
  { id: 'fighter', name: 'Kämpfer', description: '5 Monster besiegt', icon: '⚔️',
    requirement: (s: BotStats) => s.mobsKilled >= 5, points: 75 },
  { id: 'phoenix', name: 'Phönix', description: 'Nach Tod weitergekämpft', icon: '🔥',
    requirement: (s: BotStats) => s.deaths >= 1 && s.respawns >= 1, points: 30 },
];

const COLLECTIVE_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_shelter', name: 'Dach über dem Kopf', description: 'Erstes Shelter gebaut', icon: '🏠',
    requirement: (s: ColonyStats) => s.blocksPlaced >= 20, points: 50 },
  { id: 'village', name: 'Dorf gegründet', description: '100 Blöcke platziert', icon: '🏘️',
    requirement: (s: ColonyStats) => s.blocksPlaced >= 100, points: 150 },
  { id: 'resource_hoarder', name: 'Ressourcen-Sammler', description: '500 Ressourcen total', icon: '📦',
    requirement: (s: ColonyStats) => (s.totalWood + s.totalStone + s.totalFood) >= 500, points: 200 },
  { id: 'week_survival', name: 'Eine Woche', description: '7 Tage überlebt', icon: '📅',
    requirement: (s: ColonyStats) => s.daysSurvived >= 7, points: 300 },
  { id: 'teamwork', name: 'Teamwork', description: 'Alle 7 Bots aktiv', icon: '🤝',
    requirement: (s: ColonyStats) => s.activeBots >= 7, points: 100 },
  { id: 'peaceful_night', name: 'Friedliche Nacht', description: 'Nacht ohne Tode', icon: '😴',
    requirement: (s: ColonyStats) => s.nightsWithoutDeaths >= 1, points: 75 },
];

// ============ STATISTIK-TYPEN ============
interface BotStats {
  woodCollected: number;
  stoneMined: number;
  foodGathered: number;
  blocksPlaced: number;
  blocksBroken: number;
  distanceTraveled: number;
  mobsKilled: number;
  deaths: number;
  respawns: number;
  nightsSurvived: number;
  craftedItems: number;
  achievements: string[];
  lastPosition: { x: number; y: number; z: number };
}

interface ColonyStats {
  startTime: number;
  daysSurvived: number;
  currentDay: number;
  currentPhase: GamePhase;
  totalWood: number;
  totalStone: number;
  totalFood: number;
  totalIron: number;
  totalDiamonds: number;
  blocksPlaced: number;
  blocksBroken: number;
  totalDeaths: number;
  activeBots: number;
  nightsWithoutDeaths: number;
  achievements: string[];
  baseLocation: { x: number; y: number; z: number } | null;
  exploredBiomes: string[];
  highscores: {
    mostWood: { bot: string; amount: number };
    mostStone: { bot: string; amount: number };
    longestSurvival: { bot: string; nights: number };
    mostKills: { bot: string; kills: number };
    fastestBuilder: { bot: string; blocks: number };
  };
}

// ============ GLOBALE VARIABLEN ============
const MEMORY_FILE = './colony-ultimate-memory.json';
let colonyStats: ColonyStats;
let botStats: Map<string, BotStats> = new Map();
let activeBots: Map<string, mineflayer.Bot> = new Map();
let isShuttingDown = false;
let lastDeathCount = 0;
let isNightTime = false;

// ============ INITIALISIERUNG ============
function initColonyStats(): ColonyStats {
  return {
    startTime: Date.now(),
    daysSurvived: 0,
    currentDay: 0,
    currentPhase: GamePhase.SURVIVAL,
    totalWood: 0,
    totalStone: 0,
    totalFood: 0,
    totalIron: 0,
    totalDiamonds: 0,
    blocksPlaced: 0,
    blocksBroken: 0,
    totalDeaths: 0,
    activeBots: 0,
    nightsWithoutDeaths: 0,
    achievements: [],
    baseLocation: null,
    exploredBiomes: [],
    highscores: {
      mostWood: { bot: '', amount: 0 },
      mostStone: { bot: '', amount: 0 },
      longestSurvival: { bot: '', nights: 0 },
      mostKills: { bot: '', kills: 0 },
      fastestBuilder: { bot: '', blocks: 0 },
    },
  };
}

function initBotStats(): BotStats {
  return {
    woodCollected: 0,
    stoneMined: 0,
    foodGathered: 0,
    blocksPlaced: 0,
    blocksBroken: 0,
    distanceTraveled: 0,
    mobsKilled: 0,
    deaths: 0,
    respawns: 0,
    nightsSurvived: 0,
    craftedItems: 0,
    achievements: [],
    lastPosition: { x: 0, y: 0, z: 0 },
  };
}

// ============ SPEICHERN/LADEN ============
function saveGame() {
  try {
    const data = {
      colony: colonyStats,
      bots: Object.fromEntries(botStats),
      savedAt: new Date().toISOString(),
    };
    writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // Ignore
  }
}

function loadGame() {
  try {
    if (existsSync(MEMORY_FILE)) {
      const data = JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
      colonyStats = { ...initColonyStats(), ...data.colony };
      if (data.bots) {
        for (const [name, stats] of Object.entries(data.bots)) {
          botStats.set(name, stats as BotStats);
        }
      }
      return;
    }
  } catch (e) {
    // Start fresh
  }
  colonyStats = initColonyStats();
}

// ============ UTILITY FUNKTIONEN ============
function log(config: BotConfig, message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] ${config.emoji} ${config.name}: ${message}`);
}

function colonyLog(message: string) {
  const time = new Date().toLocaleTimeString('de-DE');
  console.log(`[${time}] 🏰 COLONY: ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isNight(bot: mineflayer.Bot): boolean {
  const time = bot.time.timeOfDay;
  return time >= 13000 && time <= 23000;
}

function getCurrentPhase(): GamePhase {
  if (colonyStats.currentDay <= 1) return GamePhase.SURVIVAL;
  if (colonyStats.currentDay <= 5) return GamePhase.SETTLEMENT;
  if (colonyStats.currentDay <= 14) return GamePhase.EXPANSION;
  return GamePhase.THRIVING;
}

function countItems(bot: mineflayer.Bot, nameContains: string): number {
  return bot.inventory.items()
    .filter(item => item.name.includes(nameContains))
    .reduce((sum, item) => sum + item.count, 0);
}

function updateHighscores(botName: string, stats: BotStats) {
  if (stats.woodCollected > colonyStats.highscores.mostWood.amount) {
    colonyStats.highscores.mostWood = { bot: botName, amount: stats.woodCollected };
  }
  if (stats.stoneMined > colonyStats.highscores.mostStone.amount) {
    colonyStats.highscores.mostStone = { bot: botName, amount: stats.stoneMined };
  }
  if (stats.nightsSurvived > colonyStats.highscores.longestSurvival.nights) {
    colonyStats.highscores.longestSurvival = { bot: botName, nights: stats.nightsSurvived };
  }
  if (stats.mobsKilled > colonyStats.highscores.mostKills.kills) {
    colonyStats.highscores.mostKills = { bot: botName, kills: stats.mobsKilled };
  }
  if (stats.blocksPlaced > colonyStats.highscores.fastestBuilder.blocks) {
    colonyStats.highscores.fastestBuilder = { bot: botName, blocks: stats.blocksPlaced };
  }
}

// ============ ACHIEVEMENT CHECKING ============
function checkAchievements(botName: string, stats: BotStats) {
  for (const achievement of INDIVIDUAL_ACHIEVEMENTS) {
    if (!stats.achievements.includes(achievement.id)) {
      if (achievement.requirement(stats)) {
        stats.achievements.push(achievement.id);
        log({ name: botName, emoji: '🏆' } as BotConfig, 
            `ACHIEVEMENT: ${achievement.icon} ${achievement.name} (+${achievement.points} Punkte)`);
      }
    }
  }
}

function checkColonyAchievements() {
  colonyStats.activeBots = activeBots.size;
  
  for (const achievement of COLLECTIVE_ACHIEVEMENTS) {
    if (!colonyStats.achievements.includes(achievement.id)) {
      if (achievement.requirement(colonyStats)) {
        colonyStats.achievements.push(achievement.id);
        colonyLog(`🏆 COLONY ACHIEVEMENT: ${achievement.icon} ${achievement.name} (+${achievement.points} Punkte)`);
      }
    }
  }
}

// ============ PHASEN-BASIERTE AUFGABEN ============
function getTasksForPhase(phase: GamePhase, config: BotConfig): string[] {
  const tasks: string[] = [];
  
  switch (phase) {
    case GamePhase.SURVIVAL:
      // Alle sammeln erstmal Holz und suchen Schutz
      tasks.push('gather_wood');
      tasks.push('find_shelter');
      if (config.baseSkills.combat > 0.7) tasks.push('guard');
      break;
      
    case GamePhase.SETTLEMENT:
      // Spezialisierung beginnt
      if (config.baseSkills.gathering > 0.7) tasks.push('gather_wood');
      if (config.baseSkills.mining > 0.7) tasks.push('mine_stone');
      if (config.baseSkills.building > 0.7) tasks.push('build_shelter');
      if (config.baseSkills.farming > 0.7) tasks.push('start_farm');
      if (config.baseSkills.combat > 0.7) tasks.push('guard');
      // Jeder hilft auch bei Grundaufgaben
      tasks.push('gather_wood');
      break;
      
    case GamePhase.EXPANSION:
      // Volle Spezialisierung
      if (config.baseSkills.gathering > 0.7) tasks.push('gather_resources');
      if (config.baseSkills.mining > 0.7) tasks.push('deep_mine');
      if (config.baseSkills.building > 0.7) tasks.push('expand_base');
      if (config.baseSkills.farming > 0.7) tasks.push('manage_farm');
      if (config.baseSkills.combat > 0.7) tasks.push('hunt_mobs');
      break;
      
    case GamePhase.THRIVING:
      // Optimierung und Projekte
      tasks.push('optimize');
      tasks.push('special_projects');
      break;
  }
  
  return tasks;
}

// ============ BOT-AKTIONEN ============
async function gatherWood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const logs = bot.findBlocks({
    matching: block => block.name.includes('log'),
    maxDistance: 32,
    count: 1,
  });

  if (logs.length === 0) {
    // Wandern um Bäume zu finden
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 15;
    const targetX = bot.entity.position.x + Math.cos(angle) * dist;
    const targetZ = bot.entity.position.z + Math.sin(angle) * dist;
    
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(targetX, bot.entity.position.y, targetZ, 3));
    } catch (e) {}
    return false;
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
      
      // Update Stats
      const stats = botStats.get(config.name)!;
      stats.woodCollected++;
      stats.blocksBroken++;
      colonyStats.totalWood++;
      colonyStats.blocksBroken++;
      
      const count = countItems(bot, 'log');
      log(config, `🪵 Holz: ${count} (Total: ${stats.woodCollected})`);
      
      checkAchievements(config.name, stats);
      updateHighscores(config.name, stats);
      return true;
    }
  } catch (e) {}
  return false;
}

async function mineStone(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Suche nach Stein in der Nähe
  const stones = bot.findBlocks({
    matching: block => block.name === 'stone' || block.name === 'cobblestone' || block.name === 'deepslate',
    maxDistance: 16,
    count: 1,
  });

  if (stones.length === 0) {
    // Grabe nach unten
    const below = bot.entity.position.offset(0, -1, 0);
    const block = bot.blockAt(below);
    if (block && !block.name.includes('air') && !block.name.includes('water') && !block.name.includes('lava')) {
      try {
        await bot.dig(block);
        const stats = botStats.get(config.name)!;
        stats.stoneMined++;
        stats.blocksBroken++;
        colonyStats.totalStone++;
        log(config, `⛏️ Grabe... (Total: ${stats.stoneMined})`);
        checkAchievements(config.name, stats);
        return true;
      } catch (e) {}
    }
    return false;
  }

  try {
    const movements = new Movements(bot);
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(stones[0].x, stones[0].y, stones[0].z, 1));
    
    const block = bot.blockAt(stones[0]);
    if (block) {
      await bot.dig(block);
      const stats = botStats.get(config.name)!;
      stats.stoneMined++;
      stats.blocksBroken++;
      colonyStats.totalStone++;
      
      const count = countItems(bot, 'stone') + countItems(bot, 'cobble');
      log(config, `🪨 Stein: ${count} (Total: ${stats.stoneMined})`);
      checkAchievements(config.name, stats);
      updateHighscores(config.name, stats);
      return true;
    }
  } catch (e) {}
  return false;
}

async function guardArea(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const hostiles = Object.values(bot.entities).filter(e => 
    e.type === 'hostile' && e.position.distanceTo(bot.entity.position) < 16
  );

  if (hostiles.length > 0) {
    const target = hostiles[0];
    log(config, `⚔️ Angriff auf ${target.name}!`);
    
    try {
      const movements = new Movements(bot);
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalFollow(target, 2));
      bot.attack(target);
      
      // Warte und prüfe ob getötet
      await sleep(2000);
      if (!bot.entities[target.id]) {
        const stats = botStats.get(config.name)!;
        stats.mobsKilled++;
        log(config, `💀 ${target.name} besiegt! (Kills: ${stats.mobsKilled})`);
        checkAchievements(config.name, stats);
        updateHighscores(config.name, stats);
      }
      return true;
    } catch (e) {}
  } else {
    // Patrouillieren
    const patrolDist = 8;
    const angle = Math.random() * Math.PI * 2;
    const targetX = bot.entity.position.x + Math.cos(angle) * patrolDist;
    const targetZ = bot.entity.position.z + Math.sin(angle) * patrolDist;
    
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(targetX, bot.entity.position.y, targetZ, 2));
    } catch (e) {}
  }
  return false;
}

async function findShelter(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Bei Nacht: Grabe ein Loch wenn kein Shelter
  if (isNight(bot)) {
    log(config, '🌙 Suche Schutz...');
    
    // Einfaches Erdloch graben
    const below = bot.entity.position.offset(0, -1, 0);
    const block = bot.blockAt(below);
    if (block && block.name.includes('dirt') || block?.name.includes('grass')) {
      try {
        await bot.dig(block);
        log(config, '🕳️ Grabe Unterschlupf...');
        return true;
      } catch (e) {}
    }
  }
  return false;
}

async function startFarm(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  // Suche nach Gras für Samen
  const grass = bot.findBlocks({
    matching: block => block.name.includes('grass') && !block.name.includes('block'),
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
        log(config, '🌱 Samen gesammelt!');
        const stats = botStats.get(config.name)!;
        stats.foodGathered++;
        colonyStats.totalFood++;
        return true;
      }
    } catch (e) {}
  }
  return false;
}

async function explore(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const distance = 30 + Math.random() * 50;
  const angle = Math.random() * Math.PI * 2;
  const targetX = bot.entity.position.x + Math.cos(angle) * distance;
  const targetZ = bot.entity.position.z + Math.sin(angle) * distance;

  log(config, `🧭 Erkunde Richtung ${Math.round(angle * 180 / Math.PI)}°...`);
  
  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(targetX, bot.entity.position.y, targetZ, 5));
    
    const stats = botStats.get(config.name)!;
    const oldPos = stats.lastPosition;
    const newPos = bot.entity.position;
    const dist = Math.sqrt(
      Math.pow(newPos.x - oldPos.x, 2) + 
      Math.pow(newPos.y - oldPos.y, 2) + 
      Math.pow(newPos.z - oldPos.z, 2)
    );
    stats.distanceTraveled += dist;
    stats.lastPosition = { x: newPos.x, y: newPos.y, z: newPos.z };
    
    checkAchievements(config.name, stats);
    return true;
  } catch (e) {}
  return false;
}

// ============ HAUPT-BOT-SCHLEIFE ============
async function runBotLoop(bot: mineflayer.Bot, config: BotConfig) {
  log(config, 'Starte Arbeitsschleife...');
  
  while (!isShuttingDown && activeBots.has(config.name)) {
    try {
      const wasNight = isNightTime;
      isNightTime = isNight(bot);
      
      // Nacht-zu-Tag Übergang tracken
      if (wasNight && !isNightTime) {
        const stats = botStats.get(config.name)!;
        stats.nightsSurvived++;
        log(config, `🌅 Nacht ${stats.nightsSurvived} überlebt!`);
        checkAchievements(config.name, stats);
        
        // Colony Tag-Zähler
        colonyStats.currentDay++;
        colonyStats.daysSurvived = colonyStats.currentDay;
        colonyStats.currentPhase = getCurrentPhase();
        
        // Prüfe ob Nacht ohne Tode war
        if (colonyStats.totalDeaths === lastDeathCount) {
          colonyStats.nightsWithoutDeaths++;
        }
        lastDeathCount = colonyStats.totalDeaths;
        
        colonyLog(`☀️ Tag ${colonyStats.currentDay} - Phase: ${colonyStats.currentPhase}`);
        checkColonyAchievements();
      }

      // Nacht-Verhalten
      if (isNightTime) {
        if (config.baseSkills.combat > 0.7) {
          // Kämpfer beschützen
          await guardArea(bot, config);
        } else {
          // Andere suchen Schutz
          await findShelter(bot, config);
          await sleep(5000);
        }
        await sleep(CONFIG.actionDelay);
        continue;
      }

      // Tag-Verhalten basierend auf Phase und Skills
      const phase = getCurrentPhase();
      const tasks = getTasksForPhase(phase, config);
      
      // Wähle eine Aufgabe basierend auf Skills
      let taskDone = false;
      
      // Primäre Aufgabe basierend auf höchstem Skill
      const skills = config.baseSkills;
      const maxSkill = Math.max(skills.gathering, skills.mining, skills.building, skills.combat, skills.farming);
      
      if (skills.gathering === maxSkill || phase === GamePhase.SURVIVAL) {
        taskDone = await gatherWood(bot, config);
      } else if (skills.mining === maxSkill) {
        taskDone = await mineStone(bot, config);
      } else if (skills.combat === maxSkill) {
        taskDone = await guardArea(bot, config);
      } else if (skills.farming === maxSkill) {
        taskDone = await startFarm(bot, config);
      } else {
        // Scout oder Sage
        if (Math.random() < 0.5) {
          taskDone = await explore(bot, config);
        } else {
          taskDone = await gatherWood(bot, config);
        }
      }

      await sleep(CONFIG.actionDelay);
      
    } catch (err: any) {
      if (!isShuttingDown) {
        log(config, `⚠️ ${err.message}`);
      }
      await sleep(3000);
    }
  }
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
        resolve(null);
      }, 30000);

      bot.once('spawn', () => {
        clearTimeout(timeout);
        log(config, '✅ Gespawnt!');
        
        try { bot.loadPlugin(pathfinder); } catch (e) {}
        
        // Initialisiere Bot-Stats
        if (!botStats.has(config.name)) {
          botStats.set(config.name, initBotStats());
        }
        const stats = botStats.get(config.name)!;
        stats.lastPosition = { 
          x: bot.entity.position.x, 
          y: bot.entity.position.y, 
          z: bot.entity.position.z 
        };
        
        activeBots.set(config.name, bot);
        resolve(bot);
      });

      bot.on('error', (err) => {
        if (!isShuttingDown) log(config, `❌ ${err.message}`);
      });

      bot.on('kicked', (reason) => {
        log(config, `🚫 Gekickt: ${reason}`);
        activeBots.delete(config.name);
      });

      bot.on('end', () => {
        if (!isShuttingDown) log(config, '🔌 Getrennt');
        activeBots.delete(config.name);
        
        // Auto-Reconnect
        if (!isShuttingDown) {
          setTimeout(() => {
            colonyLog(`Reconnect für ${config.name}...`);
            createBot(config).then(newBot => {
              if (newBot) {
                runBotLoop(newBot, config).catch(() => {});
              }
            });
          }, CONFIG.reconnectDelay);
        }
      });

      bot.on('death', () => {
        log(config, '💀 Gestorben!');
        const stats = botStats.get(config.name)!;
        stats.deaths++;
        stats.respawns++;
        colonyStats.totalDeaths++;
        checkAchievements(config.name, stats);
      });

    } catch (err: any) {
      log(config, `❌ Erstellung fehlgeschlagen: ${err.message}`);
      resolve(null);
    }
  });
}

// ============ STATUS AUSGABE ============
function printStatus() {
  console.log('\n' + '═'.repeat(60));
  console.log('🏰 TOOBIX COLONY ULTIMATE - STATUS');
  console.log('═'.repeat(60));
  
  console.log(`\n📅 Tag ${colonyStats.currentDay} | Phase: ${colonyStats.currentPhase}`);
  console.log(`🤖 Aktive Bots: ${activeBots.size}/${BOT_CONFIGS.length}`);
  
  console.log('\n📦 RESSOURCEN:');
  console.log(`   🪵 Holz: ${colonyStats.totalWood}`);
  console.log(`   🪨 Stein: ${colonyStats.totalStone}`);
  console.log(`   🍞 Nahrung: ${colonyStats.totalFood}`);
  console.log(`   💎 Diamanten: ${colonyStats.totalDiamonds}`);
  
  console.log('\n📊 STATISTIKEN:');
  console.log(`   ⛏️ Blöcke abgebaut: ${colonyStats.blocksBroken}`);
  console.log(`   🧱 Blöcke platziert: ${colonyStats.blocksPlaced}`);
  console.log(`   💀 Tode gesamt: ${colonyStats.totalDeaths}`);
  console.log(`   😴 Nächte ohne Tode: ${colonyStats.nightsWithoutDeaths}`);
  
  console.log('\n🏆 HIGHSCORES:');
  const hs = colonyStats.highscores;
  if (hs.mostWood.bot) console.log(`   🪵 Meiste Holz: ${hs.mostWood.bot} (${hs.mostWood.amount})`);
  if (hs.mostStone.bot) console.log(`   🪨 Meiste Stein: ${hs.mostStone.bot} (${hs.mostStone.amount})`);
  if (hs.longestSurvival.bot) console.log(`   🌙 Längste Überlebenszeit: ${hs.longestSurvival.bot} (${hs.longestSurvival.nights} Nächte)`);
  if (hs.mostKills.bot) console.log(`   ⚔️ Meiste Kills: ${hs.mostKills.bot} (${hs.mostKills.kills})`);
  
  console.log('\n🏆 ERRUNGENSCHAFTEN:');
  console.log(`   🎖️ Individuelle: ${Array.from(botStats.values()).reduce((sum, s) => sum + s.achievements.length, 0)}`);
  console.log(`   🏰 Kollektive: ${colonyStats.achievements.length}`);
  
  console.log('\n👥 BOT-STATUS:');
  for (const config of BOT_CONFIGS) {
    const stats = botStats.get(config.name);
    const active = activeBots.has(config.name);
    const status = active ? '✅' : '❌';
    if (stats) {
      console.log(`   ${config.emoji} ${config.name}: ${status} | 🪵${stats.woodCollected} 🪨${stats.stoneMined} 🌙${stats.nightsSurvived} 🏆${stats.achievements.length}`);
    } else {
      console.log(`   ${config.emoji} ${config.name}: ${status}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60) + '\n');
}

// ============ HAUPTFUNKTION ============
async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         🏰 TOOBIX COLONY ULTIMATE 🏰                     ║');
  console.log('║                                                          ║');
  console.log('║  7 Bots • Phasen-Gameplay • Achievements • Highscores    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  loadGame();
  colonyLog(`Lade Spielstand... Tag ${colonyStats.currentDay}, Phase ${colonyStats.currentPhase}`);

  // Error Handler
  process.on('uncaughtException', (err) => {
    console.error('Uncaught:', err.message);
  });
  process.on('unhandledRejection', (reason: any) => {
    console.error('Unhandled:', reason?.message || reason);
  });

  // Graceful Shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Colony wird heruntergefahren...');
    isShuttingDown = true;
    saveGame();
    
    for (const [name, bot] of activeBots) {
      try { bot.quit(); } catch (e) {}
    }
    
    printStatus();
    console.log('💾 Spielstand gespeichert!');
    setTimeout(() => process.exit(0), 2000);
  });

  // Keep Alive Server mit API
  Bun.serve({
    port: 8765,
    fetch(req) {
      const url = new URL(req.url);
      
      if (url.pathname === '/status') {
        return new Response(JSON.stringify({
          day: colonyStats.currentDay,
          phase: colonyStats.currentPhase,
          bots: activeBots.size,
          resources: {
            wood: colonyStats.totalWood,
            stone: colonyStats.totalStone,
            food: colonyStats.totalFood,
          },
          highscores: colonyStats.highscores,
          achievements: colonyStats.achievements.length,
        }, null, 2), { headers: { 'Content-Type': 'application/json' } });
      }
      
      if (url.pathname === '/bots') {
        const botsInfo = [];
        for (const [name, stats] of botStats) {
          botsInfo.push({
            name,
            active: activeBots.has(name),
            stats,
          });
        }
        return new Response(JSON.stringify(botsInfo, null, 2), 
          { headers: { 'Content-Type': 'application/json' } });
      }
      
      return new Response(`
        <html>
          <head><title>Toobix Colony</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>🏰 Toobix Colony Ultimate</h1>
            <p>Tag ${colonyStats.currentDay} | Phase: ${colonyStats.currentPhase}</p>
            <p>Aktive Bots: ${activeBots.size}/7</p>
            <p>🪵 Holz: ${colonyStats.totalWood} | 🪨 Stein: ${colonyStats.totalStone}</p>
            <hr>
            <p><a href="/status">JSON Status</a> | <a href="/bots">Bot Details</a></p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }
  });
  colonyLog('Server: http://localhost:8765');

  // Spawne alle 7 Bots
  for (const config of BOT_CONFIGS) {
    console.log(`\nSpawne ${config.emoji} ${config.name} (${config.personality})...`);
    const bot = await createBot(config);
    
    if (bot) {
      runBotLoop(bot, config).catch(err => {
        log(config, `Loop Error: ${err.message}`);
      });
    }
    
    await sleep(CONFIG.spawnDelay);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ ${activeBots.size}/${BOT_CONFIGS.length} Bots aktiv!`);
  console.log(`${'═'.repeat(60)}\n`);

  // Regelmäßige Status-Updates und Speichern
  setInterval(() => {
    if (!isShuttingDown) {
      printStatus();
      checkColonyAchievements();
    }
  }, CONFIG.statusInterval);

  setInterval(() => {
    if (!isShuttingDown) {
      saveGame();
    }
  }, CONFIG.saveInterval);
}

main().catch(console.error);
