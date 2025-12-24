/**
 * USER GAMIFICATION SYSTEM
 *
 * Gamification for Toobix users - XP, Levels, Achievements, Streaks
 *
 * Features:
 * - XP System (earn XP for interactions)
 * - Level System (1-100 with titles)
 * - Achievements (unlockable badges)
 * - Daily Streaks
 * - Leaderboards
 * - Rewards & Unlocks
 *
 * Port: 8899
 */

import { Database } from "bun:sqlite";
import path from "path";

const PORT = 8898; // Changed from 8899 (performance-service uses that)

// ==========================================
// DATABASE SETUP
// ==========================================

const dbPath = path.join(process.cwd(), "databases", "user-gamification.db");
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Tables
db.run(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Neuling',
  streak_days INTEGER DEFAULT 0,
  last_active TEXT,
  total_interactions INTEGER DEFAULT 0,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  achievement_id TEXT,
  unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS xp_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  amount INTEGER,
  reason TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS daily_quests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  quest_id TEXT,
  date TEXT,
  completed INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  UNIQUE(user_id, quest_id, date)
)`);

// ==========================================
// RESOURCE INTEGRATION TABLES
// ==========================================

db.run(`CREATE TABLE IF NOT EXISTS user_resources (
  user_id TEXT PRIMARY KEY,
  gold INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 10,
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  energy_regen_rate INTEGER DEFAULT 1,
  last_energy_update TEXT DEFAULT CURRENT_TIMESTAMP,
  tickets INTEGER DEFAULT 3,
  keys INTEGER DEFAULT 1,
  boost_tokens INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS resource_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  resource TEXT,
  amount INTEGER,
  reason TEXT,
  balance_after INTEGER,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS user_boosts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  boost_type TEXT,
  multiplier REAL DEFAULT 1.5,
  expires_at TEXT,
  active INTEGER DEFAULT 1
)`);

db.run(`CREATE TABLE IF NOT EXISTS shop_items (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT,
  cost_type TEXT,
  cost_amount INTEGER,
  reward_type TEXT,
  reward_amount INTEGER,
  icon TEXT,
  available INTEGER DEFAULT 1
)`);

db.run(`CREATE TABLE IF NOT EXISTS user_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  item_id TEXT,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ==========================================
// LEVEL SYSTEM
// ==========================================

interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  color: string;
}

const LEVEL_TITLES: Record<number, { title: string; color: string }> = {
  1: { title: 'Neuling', color: '#808080' },
  5: { title: 'Entdecker', color: '#4CAF50' },
  10: { title: 'Wanderer', color: '#2196F3' },
  15: { title: 'Abenteurer', color: '#9C27B0' },
  20: { title: 'Veteran', color: '#FF9800' },
  25: { title: 'Meister', color: '#F44336' },
  30: { title: 'Champion', color: '#E91E63' },
  40: { title: 'Legende', color: '#FFD700' },
  50: { title: 'Mythos', color: '#00BCD4' },
  75: { title: 'Unsterblicher', color: '#7C4DFF' },
  100: { title: 'Transzendent', color: '#FF1744' }
};

function getXpForLevel(level: number): number {
  // XP curve: each level needs more XP
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function getLevelFromXp(totalXp: number): { level: number; currentXp: number; neededXp: number } {
  let level = 1;
  let xpRemaining = totalXp;

  while (true) {
    const needed = getXpForLevel(level);
    if (xpRemaining < needed) {
      return { level, currentXp: xpRemaining, neededXp: needed };
    }
    xpRemaining -= needed;
    level++;
    if (level > 100) {
      return { level: 100, currentXp: xpRemaining, neededXp: 0 };
    }
  }
}

function getTitleForLevel(level: number): { title: string; color: string } {
  let title = LEVEL_TITLES[1];
  for (const [lvl, info] of Object.entries(LEVEL_TITLES)) {
    if (level >= parseInt(lvl)) {
      title = info;
    }
  }
  return title;
}

// ==========================================
// XP REWARDS
// ==========================================

const XP_REWARDS: Record<string, number> = {
  // Interactions
  'chat_message': 5,
  'ask_question': 10,
  'emotional_support': 15,
  'creative_request': 20,
  'game_played': 25,
  'rpg_action': 15,
  'story_created': 30,

  // Daily activities
  'daily_login': 50,
  'daily_checkin': 25,
  'daily_reflection': 35,
  'daily_gratitude': 20,

  // Achievements
  'first_interaction': 100,
  'streak_7_days': 200,
  'streak_30_days': 500,
  'level_up': 50,

  // Special
  'bug_report': 100,
  'feature_suggestion': 75,
  'help_others': 50
};

// ==========================================
// ACHIEVEMENTS
// ==========================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (user: any) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  // Interaction achievements
  { id: 'first_steps', name: 'Erste Schritte', description: 'Erste Interaktion mit Toobix', icon: '👣', xpReward: 100, condition: (u) => u.total_interactions >= 1 },
  { id: 'getting_started', name: 'Gut gestartet', description: '10 Interaktionen', icon: '🌱', xpReward: 150, condition: (u) => u.total_interactions >= 10 },
  { id: 'regular', name: 'Stammgast', description: '50 Interaktionen', icon: '🏠', xpReward: 300, condition: (u) => u.total_interactions >= 50 },
  { id: 'dedicated', name: 'Hingegeben', description: '100 Interaktionen', icon: '💪', xpReward: 500, condition: (u) => u.total_interactions >= 100 },
  { id: 'power_user', name: 'Power User', description: '500 Interaktionen', icon: '⚡', xpReward: 1000, condition: (u) => u.total_interactions >= 500 },

  // Streak achievements
  { id: 'streak_3', name: '3-Tage-Streak', description: '3 Tage in Folge aktiv', icon: '🔥', xpReward: 100, condition: (u) => u.streak_days >= 3 },
  { id: 'streak_7', name: 'Woche geschafft', description: '7 Tage in Folge aktiv', icon: '📅', xpReward: 200, condition: (u) => u.streak_days >= 7 },
  { id: 'streak_30', name: 'Monat gemeistert', description: '30 Tage in Folge aktiv', icon: '🏆', xpReward: 500, condition: (u) => u.streak_days >= 30 },
  { id: 'streak_100', name: 'Unaufhaltsam', description: '100 Tage in Folge aktiv', icon: '💎', xpReward: 2000, condition: (u) => u.streak_days >= 100 },

  // Level achievements
  { id: 'level_5', name: 'Entdecker', description: 'Level 5 erreicht', icon: '🗺️', xpReward: 100, condition: (u) => u.level >= 5 },
  { id: 'level_10', name: 'Wanderer', description: 'Level 10 erreicht', icon: '🥾', xpReward: 200, condition: (u) => u.level >= 10 },
  { id: 'level_25', name: 'Meister', description: 'Level 25 erreicht', icon: '🎓', xpReward: 500, condition: (u) => u.level >= 25 },
  { id: 'level_50', name: 'Mythos', description: 'Level 50 erreicht', icon: '🌟', xpReward: 1000, condition: (u) => u.level >= 50 },
  { id: 'level_100', name: 'Transzendent', description: 'Level 100 erreicht', icon: '👑', xpReward: 5000, condition: (u) => u.level >= 100 },

  // Special achievements
  { id: 'night_owl', name: 'Nachteule', description: 'Um 3 Uhr morgens aktiv', icon: '🦉', xpReward: 50, condition: () => new Date().getHours() === 3 },
  { id: 'early_bird', name: 'Fruehaufsteher', description: 'Um 6 Uhr morgens aktiv', icon: '🐦', xpReward: 50, condition: () => new Date().getHours() === 6 },
];

// ==========================================
// USER MANAGEMENT
// ==========================================

function getOrCreateUser(userId: string, name?: string): any {
  let user = db.query("SELECT * FROM users WHERE id = ?").get(userId) as any;

  if (!user) {
    const now = new Date().toISOString();
    db.run(`INSERT INTO users (id, name, last_active) VALUES (?, ?, ?)`, [userId, name || 'User', now]);
    user = db.query("SELECT * FROM users WHERE id = ?").get(userId);

    // Grant first interaction achievement
    grantXp(userId, 'first_interaction', 'Erste Interaktion mit Toobix');
  }

  return user;
}

function updateStreak(userId: string): { streakDays: number; isNewDay: boolean } {
  const user = db.query("SELECT * FROM users WHERE id = ?").get(userId) as any;
  if (!user) return { streakDays: 0, isNewDay: false };

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastActive = user.last_active ? user.last_active.split('T')[0] : null;

  let streakDays = user.streak_days || 0;
  let isNewDay = false;

  if (lastActive !== today) {
    isNewDay = true;

    // Check if streak continues
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      // Streak continues
      streakDays++;
    } else if (!lastActive) {
      // First day
      streakDays = 1;
    } else {
      // Streak broken
      streakDays = 1;
    }

    db.run(`UPDATE users SET streak_days = ?, last_active = ? WHERE id = ?`,
      [streakDays, now.toISOString(), userId]);
  }

  return { streakDays, isNewDay };
}

function grantXp(userId: string, reason: string, description: string): { xpGained: number; newTotal: number; levelUp: boolean; newLevel: number } {
  const user = getOrCreateUser(userId);
  const xpAmount = XP_REWARDS[reason] || 10;

  const newTotal = user.xp + xpAmount;
  const oldLevelInfo = getLevelFromXp(user.xp);
  const newLevelInfo = getLevelFromXp(newTotal);

  const levelUp = newLevelInfo.level > oldLevelInfo.level;
  const titleInfo = getTitleForLevel(newLevelInfo.level);

  db.run(`UPDATE users SET xp = ?, level = ?, title = ?, total_interactions = total_interactions + 1 WHERE id = ?`,
    [newTotal, newLevelInfo.level, titleInfo.title, userId]);

  db.run(`INSERT INTO xp_history (user_id, amount, reason) VALUES (?, ?, ?)`,
    [userId, xpAmount, description]);

  // Check for new achievements
  checkAchievements(userId);

  return {
    xpGained: xpAmount,
    newTotal,
    levelUp,
    newLevel: newLevelInfo.level
  };
}

function checkAchievements(userId: string): Achievement[] {
  const user = db.query("SELECT * FROM users WHERE id = ?").get(userId) as any;
  if (!user) return [];

  const unlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Check if already unlocked
    const existing = db.query("SELECT * FROM achievements WHERE user_id = ? AND achievement_id = ?")
      .get(userId, achievement.id);

    if (!existing && achievement.condition(user)) {
      // Unlock achievement
      db.run(`INSERT INTO achievements (id, user_id, achievement_id) VALUES (?, ?, ?)`,
        [`ach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, userId, achievement.id]);

      // Grant XP reward
      const newXp = user.xp + achievement.xpReward;
      db.run(`UPDATE users SET xp = ? WHERE id = ?`, [newXp, userId]);

      unlocked.push(achievement);
    }
  }

  return unlocked;
}

function getUserStats(userId: string): any {
  const user = getOrCreateUser(userId);
  const levelInfo = getLevelFromXp(user.xp);
  const titleInfo = getTitleForLevel(levelInfo.level);

  const achievements = db.query(`SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = ?`).all(userId) as any[];
  const unlockedAchievements = achievements.map(a => {
    const def = ACHIEVEMENTS.find(d => d.id === a.achievement_id);
    return { ...a, ...def };
  });

  const recentXp = db.query(`SELECT * FROM xp_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10`).all(userId);

  return {
    user: {
      id: user.id,
      name: user.name,
      xp: user.xp,
      level: levelInfo.level,
      title: titleInfo.title,
      titleColor: titleInfo.color,
      currentXp: levelInfo.currentXp,
      neededXp: levelInfo.neededXp,
      progress: levelInfo.neededXp > 0 ? Math.round((levelInfo.currentXp / levelInfo.neededXp) * 100) : 100,
      streakDays: user.streak_days,
      totalInteractions: user.total_interactions,
      joinedAt: user.joined_at
    },
    achievements: {
      unlocked: unlockedAchievements,
      total: ACHIEVEMENTS.length,
      percentage: Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)
    },
    recentXp
  };
}

function getLeaderboard(limit: number = 10): any[] {
  return db.query(`SELECT id, name, xp, level, title, streak_days, total_interactions
                   FROM users ORDER BY xp DESC LIMIT ?`).all(limit) as any[];
}

// ==========================================
// DAILY QUESTS
// ==========================================

const DAILY_QUESTS = [
  { id: 'chat_3', name: 'Gespraechig', description: '3 Nachrichten senden', target: 3, xpReward: 30 },
  { id: 'creative_1', name: 'Kreativ', description: 'Etwas Kreatives erstellen', target: 1, xpReward: 40 },
  { id: 'game_1', name: 'Spieler', description: 'Ein Spiel spielen', target: 1, xpReward: 25 },
  { id: 'reflect_1', name: 'Nachdenklich', description: 'Eine Reflexion schreiben', target: 1, xpReward: 35 },
];

function getDailyQuests(userId: string): any[] {
  const today = new Date().toISOString().split('T')[0];

  // Create daily quests if not exist
  for (const quest of DAILY_QUESTS) {
    const existing = db.query("SELECT * FROM daily_quests WHERE user_id = ? AND quest_id = ? AND date = ?")
      .get(userId, quest.id, today);

    if (!existing) {
      db.run(`INSERT INTO daily_quests (id, user_id, quest_id, date, target) VALUES (?, ?, ?, ?, ?)`,
        [`dq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, userId, quest.id, today, quest.target]);
    }
  }

  const quests = db.query("SELECT * FROM daily_quests WHERE user_id = ? AND date = ?").all(userId, today) as any[];

  return quests.map(q => {
    const def = DAILY_QUESTS.find(d => d.id === q.quest_id);
    return {
      ...q,
      name: def?.name,
      description: def?.description,
      xpReward: def?.xpReward,
      isComplete: q.completed === 1
    };
  });
}

function updateQuestProgress(userId: string, questId: string, increment: number = 1): { completed: boolean; xpGained: number } {
  const today = new Date().toISOString().split('T')[0];

  const quest = db.query("SELECT * FROM daily_quests WHERE user_id = ? AND quest_id = ? AND date = ?")
    .get(userId, questId, today) as any;

  if (!quest || quest.completed) {
    return { completed: false, xpGained: 0 };
  }

  const newProgress = quest.progress + increment;
  const isComplete = newProgress >= quest.target;

  db.run(`UPDATE daily_quests SET progress = ?, completed = ? WHERE id = ?`,
    [newProgress, isComplete ? 1 : 0, quest.id]);

  let xpGained = 0;
  if (isComplete) {
    const def = DAILY_QUESTS.find(d => d.id === questId);
    if (def) {
      grantXp(userId, 'quest_complete', `Quest abgeschlossen: ${def.name}`);
      xpGained = def.xpReward;
    }
  }

  return { completed: isComplete, xpGained };
}

// ==========================================
// RESOURCE SYSTEM
// ==========================================

interface UserResources {
  gold: number;
  gems: number;
  energy: number;
  max_energy: number;
  tickets: number;
  keys: number;
  boost_tokens: number;
}

const RESOURCE_REWARDS: Record<string, Partial<UserResources>> = {
  'level_up': { gold: 50, gems: 5 },
  'daily_login': { energy: 20, gold: 25 },
  'achievement_unlock': { gems: 10, gold: 100 },
  'quest_complete': { gold: 30, tickets: 1 },
  'streak_7': { gems: 25, keys: 1 },
  'streak_30': { gems: 100, boost_tokens: 3 },
  'first_interaction': { gold: 200, gems: 20, keys: 2 }
};

const ENERGY_COSTS: Record<string, number> = {
  'game_played': 10,
  'rpg_action': 5,
  'story_created': 15,
  'creative_request': 8,
  'exploration': 12
};

function getOrCreateResources(userId: string): UserResources {
  let resources = db.query("SELECT * FROM user_resources WHERE user_id = ?").get(userId) as any;

  if (!resources) {
    db.run(`INSERT INTO user_resources (user_id) VALUES (?)`, [userId]);
    resources = db.query("SELECT * FROM user_resources WHERE user_id = ?").get(userId);
  }

  // Regenerate energy
  resources = regenerateEnergy(userId, resources);

  return resources;
}

function regenerateEnergy(userId: string, resources: any): any {
  const now = new Date();
  const lastUpdate = new Date(resources.last_energy_update);
  const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);

  if (minutesPassed > 0 && resources.energy < resources.max_energy) {
    const energyGained = Math.min(
      minutesPassed * resources.energy_regen_rate,
      resources.max_energy - resources.energy
    );

    const newEnergy = resources.energy + energyGained;
    db.run(`UPDATE user_resources SET energy = ?, last_energy_update = ? WHERE user_id = ?`,
      [newEnergy, now.toISOString(), userId]);
    resources.energy = newEnergy;
  }

  return resources;
}

function modifyResource(userId: string, resource: keyof UserResources, amount: number, reason: string): { success: boolean; newBalance: number; error?: string } {
  const resources = getOrCreateResources(userId);
  const currentBalance = resources[resource] || 0;
  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    return { success: false, newBalance: currentBalance, error: `Nicht genug ${resource}` };
  }

  // Apply max for energy
  const finalBalance = resource === 'energy'
    ? Math.min(newBalance, resources.max_energy)
    : newBalance;

  db.run(`UPDATE user_resources SET ${resource} = ? WHERE user_id = ?`, [finalBalance, userId]);

  db.run(`INSERT INTO resource_transactions (user_id, resource, amount, reason, balance_after) VALUES (?, ?, ?, ?, ?)`,
    [userId, resource, amount, reason, finalBalance]);

  return { success: true, newBalance: finalBalance };
}

function grantResourceReward(userId: string, rewardType: string): Record<string, number> {
  const rewards = RESOURCE_REWARDS[rewardType];
  if (!rewards) return {};

  const granted: Record<string, number> = {};

  for (const [resource, amount] of Object.entries(rewards)) {
    if (amount && amount > 0) {
      modifyResource(userId, resource as keyof UserResources, amount, `Belohnung: ${rewardType}`);
      granted[resource] = amount;
    }
  }

  return granted;
}

function consumeEnergy(userId: string, action: string): { success: boolean; energyUsed: number; remaining: number } {
  const cost = ENERGY_COSTS[action] || 0;
  if (cost === 0) return { success: true, energyUsed: 0, remaining: getOrCreateResources(userId).energy };

  const result = modifyResource(userId, 'energy', -cost, `Aktion: ${action}`);

  return {
    success: result.success,
    energyUsed: result.success ? cost : 0,
    remaining: result.newBalance
  };
}

function getResourceHistory(userId: string, limit: number = 20): any[] {
  return db.query(`SELECT * FROM resource_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`).all(userId, limit) as any[];
}

// ==========================================
// BOOST SYSTEM
// ==========================================

interface Boost {
  type: string;
  name: string;
  description: string;
  multiplier: number;
  duration_hours: number;
  cost_type: keyof UserResources;
  cost_amount: number;
}

const AVAILABLE_BOOSTS: Boost[] = [
  { type: 'xp_boost', name: 'XP Boost', description: '50% mehr XP', multiplier: 1.5, duration_hours: 1, cost_type: 'gems', cost_amount: 10 },
  { type: 'xp_mega', name: 'XP Mega Boost', description: '100% mehr XP', multiplier: 2.0, duration_hours: 1, cost_type: 'boost_tokens', cost_amount: 1 },
  { type: 'energy_boost', name: 'Energie Boost', description: '50% weniger Energiekosten', multiplier: 0.5, duration_hours: 2, cost_type: 'gems', cost_amount: 15 },
  { type: 'gold_boost', name: 'Gold Boost', description: '50% mehr Gold', multiplier: 1.5, duration_hours: 1, cost_type: 'gems', cost_amount: 20 },
  { type: 'luck_boost', name: 'Glücks Boost', description: 'Bessere Drop-Raten', multiplier: 1.3, duration_hours: 1, cost_type: 'keys', cost_amount: 1 }
];

function activateBoost(userId: string, boostType: string): { success: boolean; boost?: any; error?: string } {
  const boostDef = AVAILABLE_BOOSTS.find(b => b.type === boostType);
  if (!boostDef) return { success: false, error: 'Boost nicht gefunden' };

  // Check resources
  const resources = getOrCreateResources(userId);
  if ((resources[boostDef.cost_type] || 0) < boostDef.cost_amount) {
    return { success: false, error: `Nicht genug ${boostDef.cost_type}` };
  }

  // Deduct cost
  modifyResource(userId, boostDef.cost_type, -boostDef.cost_amount, `Boost aktiviert: ${boostDef.name}`);

  // Create boost
  const expiresAt = new Date(Date.now() + boostDef.duration_hours * 3600000).toISOString();
  const boostId = `boost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  db.run(`INSERT INTO user_boosts (id, user_id, boost_type, multiplier, expires_at) VALUES (?, ?, ?, ?, ?)`,
    [boostId, userId, boostType, boostDef.multiplier, expiresAt]);

  return {
    success: true,
    boost: {
      id: boostId,
      type: boostType,
      name: boostDef.name,
      multiplier: boostDef.multiplier,
      expiresAt
    }
  };
}

function getActiveBoosts(userId: string): any[] {
  const now = new Date().toISOString();

  // Deactivate expired boosts
  db.run(`UPDATE user_boosts SET active = 0 WHERE user_id = ? AND expires_at < ? AND active = 1`, [userId, now]);

  return db.query(`SELECT * FROM user_boosts WHERE user_id = ? AND active = 1`).all(userId) as any[];
}

function getBoostMultiplier(userId: string, boostType: string): number {
  const boosts = getActiveBoosts(userId);
  const activeBoost = boosts.find(b => b.boost_type === boostType);
  return activeBoost ? activeBoost.multiplier : 1.0;
}

// ==========================================
// SHOP SYSTEM
// ==========================================

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  cost_type: keyof UserResources;
  cost_amount: number;
  reward_type: string;
  reward_amount: number;
  icon: string;
}

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  // Energy
  { id: 'energy_small', name: 'Kleine Energie', description: '+25 Energie', category: 'energy', cost_type: 'gold', cost_amount: 50, reward_type: 'energy', reward_amount: 25, icon: '⚡' },
  { id: 'energy_medium', name: 'Mittlere Energie', description: '+50 Energie', category: 'energy', cost_type: 'gold', cost_amount: 90, reward_type: 'energy', reward_amount: 50, icon: '⚡' },
  { id: 'energy_full', name: 'Volle Energie', description: 'Energie komplett auffüllen', category: 'energy', cost_type: 'gems', cost_amount: 5, reward_type: 'energy_full', reward_amount: 1, icon: '🔋' },

  // Tickets & Keys
  { id: 'ticket_pack', name: 'Ticket-Paket', description: '5 Tickets', category: 'items', cost_type: 'gems', cost_amount: 15, reward_type: 'tickets', reward_amount: 5, icon: '🎟️' },
  { id: 'key_bundle', name: 'Schlüssel-Bündel', description: '3 Schlüssel', category: 'items', cost_type: 'gems', cost_amount: 25, reward_type: 'keys', reward_amount: 3, icon: '🔑' },
  { id: 'boost_pack', name: 'Boost-Paket', description: '2 Boost Tokens', category: 'items', cost_type: 'gems', cost_amount: 30, reward_type: 'boost_tokens', reward_amount: 2, icon: '🚀' },

  // Premium Currency
  { id: 'gems_small', name: 'Kleine Edelsteine', description: '20 Gems', category: 'currency', cost_type: 'gold', cost_amount: 500, reward_type: 'gems', reward_amount: 20, icon: '💎' },

  // Upgrades
  { id: 'energy_upgrade', name: 'Energie-Upgrade', description: '+10 Max Energie (permanent)', category: 'upgrades', cost_type: 'gems', cost_amount: 50, reward_type: 'max_energy', reward_amount: 10, icon: '📈' }
];

function initializeShop() {
  const count = (db.query("SELECT COUNT(*) as c FROM shop_items").get() as any).c;
  if (count === 0) {
    for (const item of DEFAULT_SHOP_ITEMS) {
      db.run(`INSERT INTO shop_items (id, name, description, category, cost_type, cost_amount, reward_type, reward_amount, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.description, item.category, item.cost_type, item.cost_amount, item.reward_type, item.reward_amount, item.icon]);
    }
  }
}

initializeShop();

function getShopItems(category?: string): ShopItem[] {
  if (category) {
    return db.query("SELECT * FROM shop_items WHERE category = ? AND available = 1").all(category) as ShopItem[];
  }
  return db.query("SELECT * FROM shop_items WHERE available = 1").all() as ShopItem[];
}

function purchaseItem(userId: string, itemId: string): { success: boolean; item?: ShopItem; error?: string; resourcesGained?: Record<string, number> } {
  const item = db.query("SELECT * FROM shop_items WHERE id = ?").get(itemId) as ShopItem;
  if (!item) return { success: false, error: 'Item nicht gefunden' };

  const resources = getOrCreateResources(userId);
  if ((resources[item.cost_type] || 0) < item.cost_amount) {
    return { success: false, error: `Nicht genug ${item.cost_type}` };
  }

  // Deduct cost
  modifyResource(userId, item.cost_type, -item.cost_amount, `Shop-Kauf: ${item.name}`);

  // Grant reward
  const resourcesGained: Record<string, number> = {};

  if (item.reward_type === 'energy_full') {
    const currentResources = getOrCreateResources(userId);
    const gained = currentResources.max_energy - currentResources.energy;
    modifyResource(userId, 'energy', gained, `Shop-Kauf: ${item.name}`);
    resourcesGained['energy'] = gained;
  } else if (item.reward_type === 'max_energy') {
    db.run(`UPDATE user_resources SET max_energy = max_energy + ? WHERE user_id = ?`, [item.reward_amount, userId]);
    resourcesGained['max_energy'] = item.reward_amount;
  } else {
    modifyResource(userId, item.reward_type as keyof UserResources, item.reward_amount, `Shop-Kauf: ${item.name}`);
    resourcesGained[item.reward_type] = item.reward_amount;
  }

  // Record purchase
  db.run(`INSERT INTO user_purchases (user_id, item_id) VALUES (?, ?)`, [userId, itemId]);

  return { success: true, item, resourcesGained };
}

// ==========================================
// ENHANCED USER STATS
// ==========================================

function getFullUserProfile(userId: string): any {
  const stats = getUserStats(userId);
  const resources = getOrCreateResources(userId);
  const boosts = getActiveBoosts(userId);
  const resourceHistory = getResourceHistory(userId, 10);

  return {
    ...stats,
    resources: {
      gold: resources.gold,
      gems: resources.gems,
      energy: resources.energy,
      maxEnergy: resources.max_energy,
      tickets: resources.tickets,
      keys: resources.keys,
      boostTokens: resources.boost_tokens
    },
    activeBoosts: boosts.map(b => {
      const def = AVAILABLE_BOOSTS.find(d => d.type === b.boost_type);
      return {
        ...b,
        name: def?.name,
        description: def?.description
      };
    }),
    recentTransactions: resourceHistory
  };
}

// ==========================================
// HTTP SERVER
// ==========================================

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }

    try {
      // Health check
      if (url.pathname === '/health') {
        const userCount = (db.query("SELECT COUNT(*) as c FROM users").get() as any).c;
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'user-gamification',
          port: PORT,
          users: userCount,
          achievements: ACHIEVEMENTS.length
        }), { headers });
      }

      // Get user stats
      if (url.pathname === '/user' && req.method === 'GET') {
        const userId = url.searchParams.get('id') || 'default';
        const stats = getUserStats(userId);
        return new Response(JSON.stringify(stats), { headers });
      }

      // Record interaction & grant XP
      if (url.pathname === '/interact' && req.method === 'POST') {
        const body = await req.json() as any;
        const userId = body.userId || 'default';
        const action = body.action || 'chat_message';
        const description = body.description || `Aktion: ${action}`;

        // Update streak
        const streakInfo = updateStreak(userId);

        // Grant daily login XP if new day
        if (streakInfo.isNewDay) {
          grantXp(userId, 'daily_login', 'Taeglicher Login');
        }

        // Grant action XP
        const xpResult = grantXp(userId, action, description);

        // Update quest progress
        let questUpdate = null;
        if (action === 'chat_message') {
          questUpdate = updateQuestProgress(userId, 'chat_3');
        } else if (action === 'creative_request') {
          questUpdate = updateQuestProgress(userId, 'creative_1');
        } else if (action === 'game_played') {
          questUpdate = updateQuestProgress(userId, 'game_1');
        }

        return new Response(JSON.stringify({
          success: true,
          xp: xpResult,
          streak: streakInfo,
          quest: questUpdate,
          newAchievements: checkAchievements(userId)
        }), { headers });
      }

      // Get leaderboard
      if (url.pathname === '/leaderboard') {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const leaderboard = getLeaderboard(limit);
        return new Response(JSON.stringify({ leaderboard }), { headers });
      }

      // Get daily quests
      if (url.pathname === '/quests') {
        const userId = url.searchParams.get('userId') || 'default';
        const quests = getDailyQuests(userId);
        return new Response(JSON.stringify({ quests }), { headers });
      }

      // Get all achievements
      if (url.pathname === '/achievements') {
        return new Response(JSON.stringify({
          achievements: ACHIEVEMENTS.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            icon: a.icon,
            xpReward: a.xpReward
          }))
        }), { headers });
      }

      // Level info
      if (url.pathname === '/levels') {
        const levels = [];
        for (let i = 1; i <= 100; i++) {
          const titleInfo = getTitleForLevel(i);
          levels.push({
            level: i,
            title: titleInfo.title,
            color: titleInfo.color,
            xpNeeded: getXpForLevel(i)
          });
        }
        return new Response(JSON.stringify({ levels: levels.filter((_, i) => i < 20 || i % 5 === 0) }), { headers });
      }

      // ===== RESOURCES =====

      // Get full profile with resources
      if (url.pathname === '/profile') {
        const userId = url.searchParams.get('id') || 'default';
        const profile = getFullUserProfile(userId);
        return new Response(JSON.stringify(profile), { headers });
      }

      // Get resources
      if (url.pathname === '/resources') {
        const userId = url.searchParams.get('id') || 'default';
        const resources = getOrCreateResources(userId);
        return new Response(JSON.stringify({ resources }), { headers });
      }

      // Modify resource
      if (url.pathname === '/resources/modify' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = modifyResource(
          body.userId || 'default',
          body.resource,
          body.amount,
          body.reason || 'API-Änderung'
        );
        return new Response(JSON.stringify(result), { headers });
      }

      // Resource history
      if (url.pathname === '/resources/history') {
        const userId = url.searchParams.get('id') || 'default';
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const history = getResourceHistory(userId, limit);
        return new Response(JSON.stringify({ history }), { headers });
      }

      // ===== SHOP =====

      // Get shop items
      if (url.pathname === '/shop') {
        const category = url.searchParams.get('category') || undefined;
        const items = getShopItems(category);
        return new Response(JSON.stringify({ items }), { headers });
      }

      // Purchase item
      if (url.pathname === '/shop/purchase' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = purchaseItem(body.userId || 'default', body.itemId);
        return new Response(JSON.stringify(result), { headers });
      }

      // ===== BOOSTS =====

      // Get available boosts
      if (url.pathname === '/boosts') {
        return new Response(JSON.stringify({
          available: AVAILABLE_BOOSTS.map(b => ({
            type: b.type,
            name: b.name,
            description: b.description,
            multiplier: b.multiplier,
            durationHours: b.duration_hours,
            costType: b.cost_type,
            costAmount: b.cost_amount
          }))
        }), { headers });
      }

      // Get active boosts
      if (url.pathname === '/boosts/active') {
        const userId = url.searchParams.get('id') || 'default';
        const boosts = getActiveBoosts(userId);
        return new Response(JSON.stringify({ boosts }), { headers });
      }

      // Activate boost
      if (url.pathname === '/boosts/activate' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = activateBoost(body.userId || 'default', body.boostType);
        return new Response(JSON.stringify(result), { headers });
      }

      // Get boost multiplier
      if (url.pathname === '/boosts/multiplier') {
        const userId = url.searchParams.get('id') || 'default';
        const boostType = url.searchParams.get('type') || 'xp_boost';
        const multiplier = getBoostMultiplier(userId, boostType);
        return new Response(JSON.stringify({ boostType, multiplier }), { headers });
      }

      // ===== ENERGY =====

      // Consume energy
      if (url.pathname === '/energy/consume' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = consumeEnergy(body.userId || 'default', body.action);
        return new Response(JSON.stringify(result), { headers });
      }

      // API docs
      return new Response(JSON.stringify({
        service: 'User Gamification System v2.0',
        port: PORT,
        endpoints: {
          core: {
            'GET /user?id=': 'Get user stats, XP, level, achievements',
            'POST /interact': 'Record interaction, grant XP { userId, action, description }',
            'GET /leaderboard': 'Top users by XP',
            'GET /quests?userId=': 'Daily quests for user',
            'GET /achievements': 'All available achievements',
            'GET /levels': 'Level progression info'
          },
          resources: {
            'GET /profile?id=': 'Full user profile with resources',
            'GET /resources?id=': 'Get user resources',
            'POST /resources/modify': 'Modify resource { userId, resource, amount, reason }',
            'GET /resources/history?id=': 'Resource transaction history'
          },
          shop: {
            'GET /shop': 'Get shop items (optional: ?category=)',
            'POST /shop/purchase': 'Purchase item { userId, itemId }'
          },
          boosts: {
            'GET /boosts': 'Available boosts',
            'GET /boosts/active?id=': 'Active boosts for user',
            'POST /boosts/activate': 'Activate boost { userId, boostType }',
            'GET /boosts/multiplier?id=&type=': 'Get current multiplier'
          },
          energy: {
            'POST /energy/consume': 'Consume energy { userId, action }'
          }
        },
        xpActions: Object.keys(XP_REWARDS),
        energyCosts: ENERGY_COSTS,
        resourceTypes: ['gold', 'gems', 'energy', 'tickets', 'keys', 'boost_tokens']
      }), { headers });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }
});

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║     🎮 USER GAMIFICATION SYSTEM                                         ║
║                                                                          ║
║     Port: ${PORT}                                                          ║
║                                                                          ║
║     Features:                                                            ║
║     ├── XP System (${Object.keys(XP_REWARDS).length} action types)                              ║
║     ├── Level System (1-100 with ${Object.keys(LEVEL_TITLES).length} titles)                        ║
║     ├── ${ACHIEVEMENTS.length} Achievements                                           ║
║     ├── Daily Streaks                                                   ║
║     ├── Daily Quests                                                    ║
║     └── Leaderboards                                                    ║
║                                                                          ║
║     "Jede Interaktion zaehlt!"                                          ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

📡 Running on http://localhost:${PORT}
`);
