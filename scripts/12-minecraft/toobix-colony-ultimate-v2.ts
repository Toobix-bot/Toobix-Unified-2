/**
 * 🏰 TOOBIX COLONY ULTIMATE V2
 * 
 * Erweiterte Features:
 * - Trading-System zwischen Bots
 * - Chat-Befehle (/alpha guard, /woody gather etc.)
 * - Skill-Leveling durch Nutzung
 * - Tägliche/Wöchentliche Quests
 * - Seasons/Wetter-Effekte
 * - Bot-Kommunikation & Koordination
 */

import mineflayer from 'mineflayer';
import { pathfinder, goals, Movements } from 'mineflayer-pathfinder';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============ KONFIGURATION ============
const CONFIG = {
  server: { host: 'localhost', port: 25565 },
  spawnDelay: 12000, // Mehr Zeit zwischen Spawns
  actionDelay: 1500,
  statusInterval: 60000,
  saveInterval: 30000,
  reconnectDelay: 30000, // Längere Wartezeit bei Reconnect
  questRefreshInterval: 300000, // Neue Quests alle 5 Minuten (Minecraft-Tag)
  keepAliveInterval: 10000, // Keep-Alive alle 10 Sekunden
  maxReconnectAttempts: 3, // Max 3 Reconnect-Versuche
};

// ============ ENUMS ============
enum GamePhase {
  SURVIVAL = 'survival',
  SETTLEMENT = 'settlement',
  EXPANSION = 'expansion',
  THRIVING = 'thriving',
}

enum BotCommand {
  GATHER = 'gather',
  MINE = 'mine',
  BUILD = 'build',
  GUARD = 'guard',
  FARM = 'farm',
  EXPLORE = 'explore',
  REST = 'rest',
  TRADE = 'trade',
  FOLLOW = 'follow',
}

// ============ BOT-DEFINITIONEN ============
interface Skills {
  gathering: number;
  mining: number;
  building: number;
  combat: number;
  farming: number;
  crafting: number;
  trading: number;
}

interface BotConfig {
  name: string;
  emoji: string;
  personality: string;
  baseSkills: Skills;
  voiceLines: string[];
}

const BOT_CONFIGS: BotConfig[] = [
  { 
    name: 'Alpha', emoji: '🦁', personality: 'Anführer',
    baseSkills: { gathering: 0.8, mining: 0.6, building: 0.7, combat: 1.0, farming: 0.5, crafting: 0.6, trading: 0.8 },
    voiceLines: ['Vorwärts!', 'Für die Kolonie!', 'Bleibt zusammen!', 'Ich beschütze euch!']
  },
  { 
    name: 'Woody', emoji: '🪓', personality: 'Holzfäller',
    baseSkills: { gathering: 1.0, mining: 0.5, building: 0.8, combat: 0.6, farming: 0.4, crafting: 0.7, trading: 0.5 },
    voiceLines: ['Holz ist Leben!', 'Ein Baum weniger...', 'Die Axt singt!', 'Timber!']
  },
  { 
    name: 'Digger', emoji: '⛏️', personality: 'Bergarbeiter',
    baseSkills: { gathering: 0.5, mining: 1.0, building: 0.6, combat: 0.5, farming: 0.3, crafting: 0.8, trading: 0.4 },
    voiceLines: ['Tiefer!', 'Diamanten warten!', 'Die Erde gibt nach.', 'Was glänzt da?']
  },
  { 
    name: 'Mason', emoji: '🏗️', personality: 'Baumeister',
    baseSkills: { gathering: 0.6, mining: 0.7, building: 1.0, combat: 0.4, farming: 0.5, crafting: 0.9, trading: 0.6 },
    voiceLines: ['Block für Block!', 'Architektur ist Kunst!', 'Das wird großartig!', 'Stabilität zuerst!']
  },
  { 
    name: 'Flora', emoji: '🌾', personality: 'Bäuerin',
    baseSkills: { gathering: 0.7, mining: 0.3, building: 0.5, combat: 0.4, farming: 1.0, crafting: 0.6, trading: 0.7 },
    voiceLines: ['Wachse, kleine Pflanze!', 'Die Ernte wird gut!', 'Natur ist Magie!', 'Samen der Hoffnung!']
  },
  { 
    name: 'Scout', emoji: '🔭', personality: 'Kundschafter',
    baseSkills: { gathering: 0.6, mining: 0.4, building: 0.3, combat: 0.8, farming: 0.4, crafting: 0.5, trading: 0.6 },
    voiceLines: ['Was liegt dahinter?', 'Neues Land!', 'Ich sehe alles!', 'Schnell wie der Wind!']
  },
  { 
    name: 'Sage', emoji: '📚', personality: 'Weiser',
    baseSkills: { gathering: 0.5, mining: 0.5, building: 0.6, combat: 0.3, farming: 0.6, crafting: 1.0, trading: 0.9 },
    voiceLines: ['Wissen ist Macht!', 'Lasst mich nachdenken...', 'Die Sterne zeigen...', 'Eine interessante Entdeckung!']
  },
];

// ============ QUEST-SYSTEM ============
interface Quest {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'challenge';
  target: number;
  reward: { xp: number; points: number };
  progress: number;
  completed: boolean;
  assignedTo?: string; // Bot name or 'colony' for collective
}

const QUEST_TEMPLATES: Omit<Quest, 'progress' | 'completed'>[] = [
  // Tägliche Quests
  { id: 'daily_wood', name: 'Holzsammler', description: 'Sammle 20 Holz', icon: '🪵',
    type: 'daily', target: 20, reward: { xp: 50, points: 25 } },
  { id: 'daily_stone', name: 'Steinbrecher', description: 'Baue 30 Stein ab', icon: '🪨',
    type: 'daily', target: 30, reward: { xp: 50, points: 25 } },
  { id: 'daily_explore', name: 'Wanderer', description: 'Reise 200 Blöcke', icon: '🧭',
    type: 'daily', target: 200, reward: { xp: 40, points: 20 } },
  { id: 'daily_survive', name: 'Nachtwächter', description: 'Überlebe die Nacht', icon: '🌙',
    type: 'daily', target: 1, reward: { xp: 60, points: 30 } },
  { id: 'daily_kill', name: 'Monster-Jäger', description: 'Besiege 3 Monster', icon: '⚔️',
    type: 'daily', target: 3, reward: { xp: 75, points: 40 } },
  
  // Wöchentliche Quests
  { id: 'weekly_wood', name: 'Holz-Mogul', description: 'Sammle 200 Holz', icon: '🌲',
    type: 'weekly', target: 200, reward: { xp: 300, points: 150 } },
  { id: 'weekly_build', name: 'Großprojekt', description: 'Platziere 100 Blöcke', icon: '🏰',
    type: 'weekly', target: 100, reward: { xp: 400, points: 200 } },
  { id: 'weekly_survive', name: 'Überlebensmeister', description: 'Überlebe 7 Nächte', icon: '⭐',
    type: 'weekly', target: 7, reward: { xp: 500, points: 250 } },
  
  // Challenge Quests
  { id: 'challenge_nodeath', name: 'Unsterblich', description: 'Überlebe 3 Nächte ohne Tod', icon: '💎',
    type: 'challenge', target: 3, reward: { xp: 1000, points: 500 } },
  { id: 'challenge_rich', name: 'Ressourcen-König', description: 'Sammle 1000 Ressourcen total', icon: '👑',
    type: 'challenge', target: 1000, reward: { xp: 2000, points: 1000 } },
];

// ============ TRADING-SYSTEM ============
interface TradeOffer {
  from: string;
  to: string;
  offering: { item: string; count: number };
  requesting: { item: string; count: number };
  timestamp: number;
}

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
  { id: 'first_wood', name: 'Holzkopf', description: 'Erstes Holz', icon: '🪵', 
    requirement: (s: BotStats) => s.woodCollected >= 1, points: 10 },
  { id: 'lumberjack', name: 'Holzfäller', description: '50 Holz', icon: '🪓',
    requirement: (s: BotStats) => s.woodCollected >= 50, points: 50 },
  { id: 'master_lumberjack', name: 'Meister-Holzfäller', description: '200 Holz', icon: '🌲',
    requirement: (s: BotStats) => s.woodCollected >= 200, points: 200 },
  { id: 'first_stone', name: 'Steinzeit', description: 'Ersten Stein', icon: '🪨',
    requirement: (s: BotStats) => s.stoneMined >= 1, points: 10 },
  { id: 'miner', name: 'Bergarbeiter', description: '100 Steine', icon: '⛏️',
    requirement: (s: BotStats) => s.stoneMined >= 100, points: 100 },
  { id: 'survivor', name: 'Überlebender', description: 'Erste Nacht', icon: '🌙',
    requirement: (s: BotStats) => s.nightsSurvived >= 1, points: 25 },
  { id: 'veteran', name: 'Veteran', description: '10 Nächte', icon: '⭐',
    requirement: (s: BotStats) => s.nightsSurvived >= 10, points: 100 },
  { id: 'explorer', name: 'Entdecker', description: '500 Blöcke gereist', icon: '🧭',
    requirement: (s: BotStats) => s.distanceTraveled >= 500, points: 50 },
  { id: 'fighter', name: 'Kämpfer', description: '5 Monster', icon: '⚔️',
    requirement: (s: BotStats) => s.mobsKilled >= 5, points: 75 },
  { id: 'phoenix', name: 'Phönix', description: 'Nach Tod weitergekämpft', icon: '🔥',
    requirement: (s: BotStats) => s.deaths >= 1 && s.respawns >= 1, points: 30 },
  { id: 'skilled', name: 'Erfahren', description: 'Level 5 erreicht', icon: '📈',
    requirement: (s: BotStats) => s.level >= 5, points: 100 },
  { id: 'master', name: 'Meister', description: 'Level 10 erreicht', icon: '🏆',
    requirement: (s: BotStats) => s.level >= 10, points: 250 },
  { id: 'trader', name: 'Händler', description: '5 Trades', icon: '🤝',
    requirement: (s: BotStats) => s.tradesCompleted >= 5, points: 50 },
  { id: 'quest_hero', name: 'Quest-Held', description: '10 Quests', icon: '📜',
    requirement: (s: BotStats) => s.questsCompleted >= 10, points: 150 },
];

const COLLECTIVE_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_shelter', name: 'Dach über dem Kopf', description: 'Erstes Shelter', icon: '🏠',
    requirement: (s: ColonyStats) => s.blocksPlaced >= 20, points: 50 },
  { id: 'village', name: 'Dorf gegründet', description: '100 Blöcke platziert', icon: '🏘️',
    requirement: (s: ColonyStats) => s.blocksPlaced >= 100, points: 150 },
  { id: 'resource_hoarder', name: 'Ressourcen-Sammler', description: '500 Ressourcen', icon: '📦',
    requirement: (s: ColonyStats) => (s.totalWood + s.totalStone + s.totalFood) >= 500, points: 200 },
  { id: 'week_survival', name: 'Eine Woche', description: '7 Tage überlebt', icon: '📅',
    requirement: (s: ColonyStats) => s.daysSurvived >= 7, points: 300 },
  { id: 'teamwork', name: 'Teamwork', description: 'Alle 7 Bots aktiv', icon: '🤝',
    requirement: (s: ColonyStats) => s.activeBots >= 7, points: 100 },
  { id: 'peaceful_night', name: 'Friedliche Nacht', description: 'Nacht ohne Tode', icon: '😴',
    requirement: (s: ColonyStats) => s.nightsWithoutDeaths >= 1, points: 75 },
  { id: 'trading_post', name: 'Handelsposten', description: '20 Trades', icon: '🏪',
    requirement: (s: ColonyStats) => s.totalTrades >= 20, points: 200 },
  { id: 'quest_champions', name: 'Quest-Champions', description: '50 Quests', icon: '🎯',
    requirement: (s: ColonyStats) => s.questsCompleted >= 50, points: 500 },
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
  tradesCompleted: number;
  questsCompleted: number;
  xp: number;
  level: number;
  achievements: string[];
  currentCommand: BotCommand;
  skills: Skills;
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
  totalTrades: number;
  questsCompleted: number;
  achievements: string[];
  activeQuests: Quest[];
  completedQuests: string[];
  baseLocation: { x: number; y: number; z: number } | null;
  highscores: {
    mostWood: { bot: string; amount: number };
    mostStone: { bot: string; amount: number };
    longestSurvival: { bot: string; nights: number };
    mostKills: { bot: string; kills: number };
    highestLevel: { bot: string; level: number };
    mostQuests: { bot: string; quests: number };
  };
}

// ============ GLOBALE VARIABLEN ============
const MEMORY_FILE = './colony-ultimate-v2-memory.json';
let colonyStats: ColonyStats;
let botStats: Map<string, BotStats> = new Map();
let activeBots: Map<string, mineflayer.Bot> = new Map();
let reconnectAttempts: Map<string, number> = new Map();
let pendingTrades: TradeOffer[] = [];
let isShuttingDown = false;
let lastDeathCount = 0;
let isNightTime = false;

// ============ INITIALISIERUNG ============
function initBotStats(): BotStats {
  return {
    woodCollected: 0, stoneMined: 0, foodGathered: 0,
    blocksPlaced: 0, blocksBroken: 0, distanceTraveled: 0,
    mobsKilled: 0, deaths: 0, respawns: 0, nightsSurvived: 0,
    craftedItems: 0, tradesCompleted: 0, questsCompleted: 0,
    xp: 0, level: 1,
    achievements: [],
    currentCommand: BotCommand.GATHER,
    skills: { gathering: 0.5, mining: 0.5, building: 0.5, combat: 0.5, farming: 0.5, crafting: 0.5, trading: 0.5 },
    lastPosition: { x: 0, y: 0, z: 0 },
  };
}

function initColonyStats(): ColonyStats {
  return {
    startTime: Date.now(),
    daysSurvived: 0, currentDay: 0,
    currentPhase: GamePhase.SURVIVAL,
    totalWood: 0, totalStone: 0, totalFood: 0, totalIron: 0, totalDiamonds: 0,
    blocksPlaced: 0, blocksBroken: 0, totalDeaths: 0,
    activeBots: 0, nightsWithoutDeaths: 0,
    totalTrades: 0, questsCompleted: 0,
    achievements: [],
    activeQuests: [],
    completedQuests: [],
    baseLocation: null,
    highscores: {
      mostWood: { bot: '', amount: 0 },
      mostStone: { bot: '', amount: 0 },
      longestSurvival: { bot: '', nights: 0 },
      mostKills: { bot: '', kills: 0 },
      highestLevel: { bot: '', level: 0 },
      mostQuests: { bot: '', quests: 0 },
    },
  };
}

function generateQuests(): Quest[] {
  const quests: Quest[] = [];
  
  // 3 tägliche Quests
  const dailies = QUEST_TEMPLATES.filter(q => q.type === 'daily');
  const shuffledDailies = dailies.sort(() => Math.random() - 0.5).slice(0, 3);
  shuffledDailies.forEach(q => {
    quests.push({ ...q, progress: 0, completed: false });
  });
  
  // 1 wöchentliche Quest
  const weeklies = QUEST_TEMPLATES.filter(q => q.type === 'weekly');
  const weekly = weeklies[Math.floor(Math.random() * weeklies.length)];
  quests.push({ ...weekly, progress: 0, completed: false });
  
  // 1 Challenge (falls noch keine aktiv)
  if (!colonyStats.activeQuests.some(q => q.type === 'challenge')) {
    const challenges = QUEST_TEMPLATES.filter(q => q.type === 'challenge');
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    quests.push({ ...challenge, progress: 0, completed: false });
  }
  
  return quests;
}

// ============ SPEICHERN/LADEN ============
function saveGame() {
  try {
    const data = {
      colony: colonyStats,
      bots: Object.fromEntries(botStats),
      trades: pendingTrades,
      savedAt: new Date().toISOString(),
    };
    writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
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
      if (data.trades) pendingTrades = data.trades;
      return;
    }
  } catch (e) {}
  colonyStats = initColonyStats();
  colonyStats.activeQuests = generateQuests();
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
  return bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000;
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

// ============ XP & LEVELING ============
function addXP(botName: string, amount: number, reason: string) {
  const stats = botStats.get(botName);
  if (!stats) return;
  
  stats.xp += amount;
  const config = BOT_CONFIGS.find(c => c.name === botName)!;
  
  // Level-Up Check (100 XP pro Level, exponentiell)
  const xpForNextLevel = stats.level * 100;
  if (stats.xp >= xpForNextLevel) {
    stats.level++;
    stats.xp -= xpForNextLevel;
    log(config, `⬆️ LEVEL UP! Jetzt Level ${stats.level}!`);
    
    // Skill-Boost bei Level-Up
    const skillKeys = Object.keys(stats.skills) as (keyof Skills)[];
    const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)];
    stats.skills[randomSkill] = Math.min(2.0, stats.skills[randomSkill] + 0.05);
  }
  
  updateHighscores(botName, stats);
}

function improveSkill(botName: string, skill: keyof Skills, amount: number = 0.01) {
  const stats = botStats.get(botName);
  if (!stats) return;
  stats.skills[skill] = Math.min(2.0, stats.skills[skill] + amount);
}

// ============ QUEST-SYSTEM ============
function updateQuestProgress(questId: string, progress: number, botName?: string) {
  for (const quest of colonyStats.activeQuests) {
    if (quest.id === questId && !quest.completed) {
      if (quest.assignedTo && quest.assignedTo !== botName) continue;
      
      quest.progress = Math.min(quest.target, quest.progress + progress);
      
      if (quest.progress >= quest.target) {
        quest.completed = true;
        colonyStats.questsCompleted++;
        colonyStats.completedQuests.push(quest.id);
        
        if (botName) {
          const stats = botStats.get(botName);
          if (stats) {
            stats.questsCompleted++;
            addXP(botName, quest.reward.xp, `Quest: ${quest.name}`);
          }
        }
        
        colonyLog(`📜 QUEST ABGESCHLOSSEN: ${quest.icon} ${quest.name} (+${quest.reward.points} Punkte)`);
      }
    }
  }
}

// ============ TRADING ============
function proposeTrade(from: string, to: string, offering: { item: string; count: number }, requesting: { item: string; count: number }) {
  pendingTrades.push({ from, to, offering, requesting, timestamp: Date.now() });
  colonyLog(`🤝 ${from} bietet ${to}: ${offering.count}x ${offering.item} für ${requesting.count}x ${requesting.item}`);
}

function processTrades() {
  const now = Date.now();
  pendingTrades = pendingTrades.filter(trade => {
    // Alte Trades (> 5 Min) entfernen
    if (now - trade.timestamp > 300000) return false;
    
    const fromBot = activeBots.get(trade.from);
    const toBot = activeBots.get(trade.to);
    if (!fromBot || !toBot) return true;
    
    // Prüfe ob beide die Items haben
    const fromHas = countItems(fromBot, trade.offering.item) >= trade.offering.count;
    const toHas = countItems(toBot, trade.requesting.item) >= trade.requesting.count;
    
    if (fromHas && toHas) {
      // Trade ausführen (symbolisch - in MC müssten Items gedroppt werden)
      const fromStats = botStats.get(trade.from);
      const toStats = botStats.get(trade.to);
      if (fromStats) { fromStats.tradesCompleted++; improveSkill(trade.from, 'trading'); }
      if (toStats) { toStats.tradesCompleted++; improveSkill(trade.to, 'trading'); }
      colonyStats.totalTrades++;
      
      colonyLog(`✅ Trade erfolgreich: ${trade.from} ↔️ ${trade.to}`);
      return false;
    }
    return true;
  });
}

// ============ CHAT-BEFEHLE ============
function setupChatCommands(bot: mineflayer.Bot, config: BotConfig) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    const lowerMsg = message.toLowerCase();
    const botNameLower = config.name.toLowerCase();
    
    // Befehle an diesen Bot
    if (lowerMsg.startsWith(`/${botNameLower} `)) {
      const command = lowerMsg.split(' ')[1];
      const stats = botStats.get(config.name);
      if (!stats) return;
      
      switch (command) {
        case 'gather':
        case 'sammle':
          stats.currentCommand = BotCommand.GATHER;
          log(config, '📢 Verstanden! Sammle Ressourcen.');
          break;
        case 'mine':
        case 'grabe':
          stats.currentCommand = BotCommand.MINE;
          log(config, '📢 Verstanden! Grabe nach Stein.');
          break;
        case 'guard':
        case 'wache':
          stats.currentCommand = BotCommand.GUARD;
          log(config, '📢 Verstanden! Bewache die Gegend.');
          break;
        case 'rest':
        case 'ruhe':
          stats.currentCommand = BotCommand.REST;
          log(config, '📢 Verstanden! Ruhe mich aus.');
          break;
        case 'explore':
        case 'erkunde':
          stats.currentCommand = BotCommand.EXPLORE;
          log(config, '📢 Verstanden! Erkunde die Umgebung.');
          break;
        case 'status':
          bot.chat(`Ich bin ${config.name}: Level ${stats.level}, ${stats.woodCollected} Holz, ${stats.mobsKilled} Kills`);
          break;
        case 'help':
        case 'hilfe':
          bot.chat(`Befehle: /${botNameLower} gather/mine/guard/rest/explore/status`);
          break;
      }
    }
    
    // Globale Befehle
    if (lowerMsg === '/status') {
      bot.chat(`Colony: Tag ${colonyStats.currentDay}, ${activeBots.size} Bots, ${colonyStats.totalWood} Holz`);
    }
    
    if (lowerMsg === '/quests') {
      const activeCount = colonyStats.activeQuests.filter(q => !q.completed).length;
      bot.chat(`Aktive Quests: ${activeCount}. Abgeschlossen: ${colonyStats.questsCompleted}`);
    }
  });
}

// ============ BOT-KOMMUNIKATION ============
function botSay(bot: mineflayer.Bot, config: BotConfig, message: string, chance: number = 0.3) {
  if (Math.random() < chance) {
    bot.chat(`[${config.name}] ${message}`);
  }
}

function randomVoiceLine(config: BotConfig): string {
  return config.voiceLines[Math.floor(Math.random() * config.voiceLines.length)];
}

// ============ ACHIEVEMENT & HIGHSCORE ============
function checkAchievements(botName: string, stats: BotStats) {
  const config = BOT_CONFIGS.find(c => c.name === botName)!;
  for (const achievement of INDIVIDUAL_ACHIEVEMENTS) {
    if (!stats.achievements.includes(achievement.id)) {
      if (achievement.requirement(stats)) {
        stats.achievements.push(achievement.id);
        log(config, `🏆 ACHIEVEMENT: ${achievement.icon} ${achievement.name} (+${achievement.points} Punkte)`);
        addXP(botName, achievement.points, `Achievement: ${achievement.name}`);
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

function updateHighscores(botName: string, stats: BotStats) {
  const hs = colonyStats.highscores;
  if (stats.woodCollected > hs.mostWood.amount) hs.mostWood = { bot: botName, amount: stats.woodCollected };
  if (stats.stoneMined > hs.mostStone.amount) hs.mostStone = { bot: botName, amount: stats.stoneMined };
  if (stats.nightsSurvived > hs.longestSurvival.nights) hs.longestSurvival = { bot: botName, nights: stats.nightsSurvived };
  if (stats.mobsKilled > hs.mostKills.kills) hs.mostKills = { bot: botName, kills: stats.mobsKilled };
  if (stats.level > hs.highestLevel.level) hs.highestLevel = { bot: botName, level: stats.level };
  if (stats.questsCompleted > hs.mostQuests.quests) hs.mostQuests = { bot: botName, quests: stats.questsCompleted };
}

// ============ BOT-AKTIONEN ============
async function gatherWood(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  const logs = bot.findBlocks({
    matching: block => block.name.includes('log'),
    maxDistance: 32,
    count: 1,
  });

  if (logs.length === 0) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 15;
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(
        bot.entity.position.x + Math.cos(angle) * dist,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * dist, 3));
    } catch (e) {}
    return false;
  }

  try {
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(logs[0].x, logs[0].y, logs[0].z, 1));
    
    const block = bot.blockAt(logs[0]);
    if (block && block.name.includes('log')) {
      await bot.dig(block);
      
      stats.woodCollected++;
      stats.blocksBroken++;
      colonyStats.totalWood++;
      
      improveSkill(config.name, 'gathering');
      addXP(config.name, 5, 'Holz gesammelt');
      updateQuestProgress('daily_wood', 1, config.name);
      updateQuestProgress('weekly_wood', 1, config.name);
      
      const count = countItems(bot, 'log');
      log(config, `🪵 Holz: ${count} (Total: ${stats.woodCollected})`);
      botSay(bot, config, randomVoiceLine(config), 0.1);
      
      checkAchievements(config.name, stats);
      return true;
    }
  } catch (e) {}
  return false;
}

async function mineStone(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  const stones = bot.findBlocks({
    matching: block => block.name === 'stone' || block.name === 'cobblestone',
    maxDistance: 16,
    count: 1,
  });

  if (stones.length === 0) {
    const below = bot.entity.position.offset(0, -1, 0);
    const block = bot.blockAt(below);
    if (block && !block.name.includes('air') && !block.name.includes('water')) {
      try {
        await bot.dig(block);
        stats.stoneMined++;
        colonyStats.totalStone++;
        improveSkill(config.name, 'mining');
        addXP(config.name, 3, 'Graben');
        updateQuestProgress('daily_stone', 1, config.name);
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
      stats.stoneMined++;
      stats.blocksBroken++;
      colonyStats.totalStone++;
      
      improveSkill(config.name, 'mining');
      addXP(config.name, 4, 'Stein abgebaut');
      updateQuestProgress('daily_stone', 1, config.name);
      
      log(config, `🪨 Stein: ${stats.stoneMined}`);
      checkAchievements(config.name, stats);
      return true;
    }
  } catch (e) {}
  return false;
}

async function guardArea(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
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
      
      await sleep(2000);
      if (!bot.entities[target.id]) {
        stats.mobsKilled++;
        improveSkill(config.name, 'combat');
        addXP(config.name, 15, `${target.name} besiegt`);
        updateQuestProgress('daily_kill', 1, config.name);
        log(config, `💀 ${target.name} besiegt! (Kills: ${stats.mobsKilled})`);
        botSay(bot, config, 'Für die Kolonie!', 0.3);
        checkAchievements(config.name, stats);
      }
      return true;
    } catch (e) {}
  } else {
    const patrolDist = 8;
    const angle = Math.random() * Math.PI * 2;
    try {
      const movements = new Movements(bot);
      movements.canDig = false;
      bot.pathfinder.setMovements(movements);
      await bot.pathfinder.goto(new goals.GoalNear(
        bot.entity.position.x + Math.cos(angle) * patrolDist,
        bot.entity.position.y,
        bot.entity.position.z + Math.sin(angle) * patrolDist, 2));
    } catch (e) {}
  }
  return false;
}

async function explore(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  const stats = botStats.get(config.name)!;
  const distance = 30 + Math.random() * 50;
  const angle = Math.random() * Math.PI * 2;

  log(config, `🧭 Erkunde...`);
  
  try {
    const oldPos = { ...stats.lastPosition };
    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
    await bot.pathfinder.goto(new goals.GoalNear(
      bot.entity.position.x + Math.cos(angle) * distance,
      bot.entity.position.y,
      bot.entity.position.z + Math.sin(angle) * distance, 5));
    
    const newPos = bot.entity.position;
    const dist = Math.sqrt(
      Math.pow(newPos.x - oldPos.x, 2) + 
      Math.pow(newPos.y - oldPos.y, 2) + 
      Math.pow(newPos.z - oldPos.z, 2)
    );
    stats.distanceTraveled += dist;
    stats.lastPosition = { x: newPos.x, y: newPos.y, z: newPos.z };
    
    updateQuestProgress('daily_explore', dist, config.name);
    addXP(config.name, 2, 'Erkundet');
    checkAchievements(config.name, stats);
    return true;
  } catch (e) {}
  return false;
}

async function findShelter(bot: mineflayer.Bot, config: BotConfig): Promise<boolean> {
  if (isNight(bot)) {
    log(config, '🌙 Suche Schutz...');
    const below = bot.entity.position.offset(0, -1, 0);
    const block = bot.blockAt(below);
    if (block && (block.name.includes('dirt') || block.name.includes('grass'))) {
      try {
        await bot.dig(block);
        log(config, '🕳️ Grabe Unterschlupf...');
        return true;
      } catch (e) {}
    }
  }
  return false;
}

// ============ HAUPT-BOT-SCHLEIFE ============
async function runBotLoop(bot: mineflayer.Bot, config: BotConfig) {
  log(config, 'Starte Arbeitsschleife...');
  
  while (!isShuttingDown && activeBots.has(config.name)) {
    try {
      const stats = botStats.get(config.name)!;
      const wasNight = isNightTime;
      isNightTime = isNight(bot);
      
      // Nacht-zu-Tag Übergang
      if (wasNight && !isNightTime) {
        stats.nightsSurvived++;
        log(config, `🌅 Nacht ${stats.nightsSurvived} überlebt!`);
        updateQuestProgress('daily_survive', 1, config.name);
        updateQuestProgress('weekly_survive', 1, config.name);
        addXP(config.name, 20, 'Nacht überlebt');
        checkAchievements(config.name, stats);
        
        colonyStats.currentDay++;
        colonyStats.daysSurvived = colonyStats.currentDay;
        colonyStats.currentPhase = getCurrentPhase();
        
        if (colonyStats.totalDeaths === lastDeathCount) {
          colonyStats.nightsWithoutDeaths++;
          updateQuestProgress('challenge_nodeath', 1);
        }
        lastDeathCount = colonyStats.totalDeaths;
        
        colonyLog(`☀️ Tag ${colonyStats.currentDay} - Phase: ${colonyStats.currentPhase}`);
        checkColonyAchievements();
      }

      // Nacht-Verhalten
      if (isNightTime) {
        if (stats.skills.combat > 0.7 || stats.currentCommand === BotCommand.GUARD) {
          await guardArea(bot, config);
        } else {
          await findShelter(bot, config);
          await sleep(5000);
        }
        await sleep(CONFIG.actionDelay);
        continue;
      }

      // Tag-Verhalten basierend auf Befehl oder Skill
      let taskDone = false;
      
      switch (stats.currentCommand) {
        case BotCommand.GATHER:
          taskDone = await gatherWood(bot, config);
          break;
        case BotCommand.MINE:
          taskDone = await mineStone(bot, config);
          break;
        case BotCommand.GUARD:
          taskDone = await guardArea(bot, config);
          break;
        case BotCommand.EXPLORE:
          taskDone = await explore(bot, config);
          break;
        case BotCommand.REST:
          log(config, '😴 Ruhe...');
          await sleep(10000);
          break;
        default:
          // Auto-Verhalten basierend auf Skills
          const skills = stats.skills;
          const maxSkill = Math.max(skills.gathering, skills.mining, skills.combat);
          if (skills.gathering === maxSkill) taskDone = await gatherWood(bot, config);
          else if (skills.mining === maxSkill) taskDone = await mineStone(bot, config);
          else if (skills.combat === maxSkill) taskDone = await guardArea(bot, config);
          else taskDone = await gatherWood(bot, config);
      }

      // Quest-Progress für Ressourcen-Challenge
      const totalRes = colonyStats.totalWood + colonyStats.totalStone + colonyStats.totalFood;
      updateQuestProgress('challenge_rich', totalRes);

      await sleep(CONFIG.actionDelay);
      
    } catch (err: any) {
      if (!isShuttingDown) log(config, `⚠️ ${err.message}`);
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
        
        if (!botStats.has(config.name)) {
          const stats = initBotStats();
          // Übernehme Base-Skills
          stats.skills = { ...config.baseSkills };
          botStats.set(config.name, stats);
        }
        const stats = botStats.get(config.name)!;
        stats.lastPosition = { 
          x: bot.entity.position.x, 
          y: bot.entity.position.y, 
          z: bot.entity.position.z 
        };
        
        setupChatCommands(bot, config);
        activeBots.set(config.name, bot);
        
        // Keep-Alive: Regelmäßig kleine Bewegung um Timeout zu verhindern
        const keepAliveInterval = setInterval(() => {
          if (!activeBots.has(config.name) || isShuttingDown) {
            clearInterval(keepAliveInterval);
            return;
          }
          try {
            // Kleine Kopfbewegung als Keep-Alive Signal
            bot.look(bot.entity.yaw + (Math.random() - 0.5) * 0.1, bot.entity.pitch, false);
          } catch (e) {}
        }, CONFIG.keepAliveInterval);
        
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
        
        if (!isShuttingDown) {
          const attempts = reconnectAttempts.get(config.name) || 0;
          if (attempts < CONFIG.maxReconnectAttempts) {
            reconnectAttempts.set(config.name, attempts + 1);
            const delay = CONFIG.reconnectDelay * (attempts + 1); // Exponential backoff
            setTimeout(() => {
              colonyLog(`🔄 Reconnect für ${config.name} (Versuch ${attempts + 1}/${CONFIG.maxReconnectAttempts})...`);
              createBot(config).then(newBot => {
                if (newBot) {
                  reconnectAttempts.set(config.name, 0); // Reset on success
                  runBotLoop(newBot, config).catch(() => {});
                }
              });
            }, delay);
          } else {
            log(config, `⛔ Zu viele Reconnect-Versuche. Pausiere.`);
          }
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
  console.log('\n' + '═'.repeat(70));
  console.log('🏰 TOOBIX COLONY ULTIMATE V2 - STATUS');
  console.log('═'.repeat(70));
  
  console.log(`\n📅 Tag ${colonyStats.currentDay} | Phase: ${colonyStats.currentPhase}`);
  console.log(`🤖 Aktive Bots: ${activeBots.size}/${BOT_CONFIGS.length}`);
  
  console.log('\n📦 RESSOURCEN:');
  console.log(`   🪵 ${colonyStats.totalWood} | 🪨 ${colonyStats.totalStone} | 🍞 ${colonyStats.totalFood} | 💎 ${colonyStats.totalDiamonds}`);
  
  console.log('\n📜 AKTIVE QUESTS:');
  colonyStats.activeQuests.filter(q => !q.completed).slice(0, 3).forEach(q => {
    const bar = '█'.repeat(Math.floor(q.progress / q.target * 10)) + '░'.repeat(10 - Math.floor(q.progress / q.target * 10));
    console.log(`   ${q.icon} ${q.name}: [${bar}] ${q.progress}/${q.target}`);
  });
  
  console.log('\n🏆 HIGHSCORES:');
  const hs = colonyStats.highscores;
  if (hs.highestLevel.bot) console.log(`   📈 Höchstes Level: ${hs.highestLevel.bot} (Lv.${hs.highestLevel.level})`);
  if (hs.mostWood.bot) console.log(`   🪵 Meiste Holz: ${hs.mostWood.bot} (${hs.mostWood.amount})`);
  if (hs.mostKills.bot) console.log(`   ⚔️ Meiste Kills: ${hs.mostKills.bot} (${hs.mostKills.kills})`);
  
  console.log('\n👥 BOT-STATUS:');
  for (const config of BOT_CONFIGS) {
    const stats = botStats.get(config.name);
    const active = activeBots.has(config.name);
    const status = active ? '✅' : '❌';
    if (stats) {
      console.log(`   ${config.emoji} ${config.name.padEnd(6)} ${status} | Lv.${stats.level.toString().padStart(2)} | 🪵${stats.woodCollected.toString().padStart(3)} 🪨${stats.stoneMined.toString().padStart(3)} ⚔️${stats.mobsKilled.toString().padStart(2)} 🏆${stats.achievements.length}`);
    } else {
      console.log(`   ${config.emoji} ${config.name}: ${status}`);
    }
  }
  
  console.log('\n' + '═'.repeat(70) + '\n');
}

// ============ HAUPTFUNKTION ============
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║              🏰 TOOBIX COLONY ULTIMATE V2 🏰                        ║');
  console.log('║                                                                    ║');
  console.log('║  7 Bots • Quests • Trading • Leveling • Chat-Befehle • Highscores  ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  loadGame();
  colonyLog(`Lade Spielstand... Tag ${colonyStats.currentDay}, Phase ${colonyStats.currentPhase}`);
  colonyLog(`Aktive Quests: ${colonyStats.activeQuests.filter(q => !q.completed).length}`);

  process.on('uncaughtException', (err) => console.error('Uncaught:', err.message));
  process.on('unhandledRejection', (reason: any) => console.error('Unhandled:', reason?.message || reason));

  process.on('SIGINT', () => {
    console.log('\n\n🛑 Colony wird heruntergefahren...');
    isShuttingDown = true;
    saveGame();
    for (const [, bot] of activeBots) { try { bot.quit(); } catch (e) {} }
    printStatus();
    console.log('💾 Spielstand gespeichert!');
    setTimeout(() => process.exit(0), 2000);
  });

  // Web-API
  Bun.serve({
    port: 8765,
    fetch(req) {
      const url = new URL(req.url);
      
      if (url.pathname === '/api/status') {
        return new Response(JSON.stringify({
          day: colonyStats.currentDay,
          phase: colonyStats.currentPhase,
          bots: activeBots.size,
          resources: { wood: colonyStats.totalWood, stone: colonyStats.totalStone },
          highscores: colonyStats.highscores,
          quests: colonyStats.activeQuests,
        }, null, 2), { headers: { 'Content-Type': 'application/json' } });
      }
      
      if (url.pathname === '/api/bots') {
        return new Response(JSON.stringify(
          Array.from(botStats.entries()).map(([name, stats]) => ({
            name, active: activeBots.has(name), ...stats
          })), null, 2), { headers: { 'Content-Type': 'application/json' } });
      }
      
      if (url.pathname === '/api/command' && req.method === 'POST') {
        return req.json().then((body: any) => {
          const { bot: botName, command } = body;
          const stats = botStats.get(botName);
          if (stats && Object.values(BotCommand).includes(command)) {
            stats.currentCommand = command;
            return new Response(JSON.stringify({ success: true, message: `${botName} führt jetzt: ${command}` }));
          }
          return new Response(JSON.stringify({ success: false }), { status: 400 });
        });
      }
      
      return new Response(`
        <html><head><title>Toobix Colony V2</title><meta http-equiv="refresh" content="30"></head>
        <body style="font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px;">
          <h1>🏰 Toobix Colony Ultimate V2</h1>
          <p>📅 Tag ${colonyStats.currentDay} | Phase: ${colonyStats.currentPhase} | 🤖 ${activeBots.size}/7 Bots</p>
          <p>🪵 Holz: ${colonyStats.totalWood} | 🪨 Stein: ${colonyStats.totalStone}</p>
          <h2>📜 Quests</h2>
          <ul>${colonyStats.activeQuests.filter(q => !q.completed).map(q => 
            `<li>${q.icon} ${q.name}: ${q.progress}/${q.target}</li>`).join('')}</ul>
          <h2>👥 Bots</h2>
          <ul>${BOT_CONFIGS.map(c => {
            const s = botStats.get(c.name);
            return `<li>${c.emoji} ${c.name}: ${activeBots.has(c.name) ? '✅' : '❌'} ${s ? `Lv.${s.level}` : ''}</li>`;
          }).join('')}</ul>
          <p><a href="/api/status" style="color: #4da6ff;">API Status</a> | <a href="/api/bots" style="color: #4da6ff;">Bot Details</a></p>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }
  });
  colonyLog('🌐 Web-Dashboard: http://localhost:8765');

  // Spawne Bots
  for (const config of BOT_CONFIGS) {
    console.log(`\nSpawne ${config.emoji} ${config.name} (${config.personality})...`);
    const bot = await createBot(config);
    if (bot) runBotLoop(bot, config).catch(err => log(config, `Loop Error: ${err.message}`));
    await sleep(CONFIG.spawnDelay);
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`✅ ${activeBots.size}/${BOT_CONFIGS.length} Bots aktiv!`);
  console.log(`${'═'.repeat(70)}\n`);

  // Regelmäßige Updates
  setInterval(() => { if (!isShuttingDown) { printStatus(); checkColonyAchievements(); processTrades(); } }, CONFIG.statusInterval);
  setInterval(() => { if (!isShuttingDown) saveGame(); }, CONFIG.saveInterval);
  
  // Quest-Refresh
  setInterval(() => {
    if (!isShuttingDown) {
      // Entferne abgeschlossene Quests und generiere neue
      colonyStats.activeQuests = colonyStats.activeQuests.filter(q => !q.completed || q.type === 'challenge');
      const newQuests = generateQuests().filter(q => !colonyStats.activeQuests.some(aq => aq.id === q.id));
      colonyStats.activeQuests.push(...newQuests);
      colonyLog(`📜 Neue Quests verfügbar!`);
    }
  }, CONFIG.questRefreshInterval);
}

main().catch(console.error);
