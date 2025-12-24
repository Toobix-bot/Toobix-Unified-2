/**
 * 🎮 TOOBIX GAMIFICATION SYSTEM
 *
 * Macht jede Interaktion mit Toobix zu einem RPG-Erlebnis!
 *
 * Features:
 * - XP & Level System (basiert auf 8 Lebenskräfte)
 * - Artefakte sammeln (Weisheiten, Erkenntnisse)
 * - Achievements (Meilensteine)
 * - Stats (die 8 Lebenskräfte als RPG-Stats)
 * - Quests (tägliche/wöchentliche Herausforderungen)
 * - Inventory (gesammelte Items)
 * - Skill Tree (Fähigkeiten freischalten)
 *
 * Port: 7778 (Command Center + Gamification Layer)
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 7778;
const COMMAND_CENTER = 'http://localhost:7777';
const ECHO_REALM = 'http://localhost:9999';

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('data/toobix-game.sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS player_profile (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_active TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS player_stats (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    stat_name TEXT NOT NULL,
    value INTEGER DEFAULT 0,
    max_value INTEGER DEFAULT 100,
    FOREIGN KEY(player_id) REFERENCES player_profile(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rarity TEXT DEFAULT 'common',
    type TEXT,
    obtained_from TEXT,
    obtained_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player_id) REFERENCES player_profile(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player_id) REFERENCES player_profile(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    quest_name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'daily',
    progress INTEGER DEFAULT 0,
    goal INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    reward_xp INTEGER DEFAULT 50,
    expires_at TEXT,
    FOREIGN KEY(player_id) REFERENCES player_profile(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS interaction_log (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    xp_gained INTEGER DEFAULT 0,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player_id) REFERENCES player_profile(id)
  )
`);

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

const STATS = {
  QUALITAET: { icon: '⭐', description: 'Qualität deines Lebens' },
  DAUER: { icon: '⏳', description: 'Ausdauer & Beständigkeit' },
  FREUDE: { icon: '😊', description: 'Freude & Glück' },
  SINN: { icon: '🎯', description: 'Sinn & Bedeutung' },
  KRAFT: { icon: '💪', description: 'Energie & Willenskraft' },
  KLANG: { icon: '🎵', description: 'Harmonie & Resonanz' },
  WANDEL: { icon: '🔄', description: 'Veränderung & Wachstum' },
  KLARHEIT: { icon: '💎', description: 'Klarheit & Verständnis' }
};

const INTERACTION_XP = {
  ask: 10,
  reflect: 25,
  decide: 20,
  dream: 15,
  emotion: 15,
  'log-life': 5,
  consciousness: 5,
  echo: 3
};

const RARITY = {
  COMMON: { color: '⚪', weight: 60 },
  UNCOMMON: { color: '🟢', weight: 25 },
  RARE: { color: '🔵', weight: 10 },
  EPIC: { color: '🟣', weight: 4 },
  LEGENDARY: { color: '🟡', weight: 1 }
};

// Predefined achievements
const ACHIEVEMENT_DEFS = [
  { id: 'first_question', name: '🌱 Erster Schritt', description: 'Stelle deine erste Frage an Toobix', condition: (stats: any) => stats.interactions >= 1 },
  { id: 'curious_mind', name: '🔍 Neugieriger Geist', description: 'Stelle 10 Fragen', condition: (stats: any) => stats.interactions >= 10 },
  { id: 'deep_thinker', name: '🧠 Tiefdenker', description: 'Führe 5 Reflexionen durch', condition: (stats: any) => stats.reflections >= 5 },
  { id: 'level_5', name: '⭐ Level 5 Bewusstsein', description: 'Erreiche Level 5', condition: (stats: any) => stats.level >= 5 },
  { id: 'level_10', name: '🌟 Level 10 Erleuchtung', description: 'Erreiche Level 10', condition: (stats: any) => stats.level >= 10 },
  { id: 'artifact_collector', name: '🏺 Sammler', description: 'Sammle 10 Artefakte', condition: (stats: any) => stats.artifacts >= 10 },
  { id: 'daily_routine', name: '📅 Täglich dabei', description: 'Interagiere an 7 aufeinanderfolgenden Tagen', condition: (stats: any) => stats.streak >= 7 },
  { id: 'wisdom_seeker', name: '📜 Weisheitssucher', description: 'Sammle 5 legendäre Artefakte', condition: (stats: any) => stats.legendary_artifacts >= 5 },
  { id: 'balanced_soul', name: '⚖️ Ausgeglichene Seele', description: 'Alle Lebenskräfte über 70', condition: (stats: any) => stats.min_stat >= 70 },
];

// ============================================================================
// PLAYER MANAGEMENT
// ============================================================================

function getOrCreatePlayer(username: string = 'Player') {
  let player = db.query('SELECT * FROM player_profile WHERE username = ?').get(username);

  if (!player) {
    const id = nanoid();
    db.run(
      'INSERT INTO player_profile (id, username, level, total_xp) VALUES (?, ?, ?, ?)',
      [id, username, 1, 0]
    );

    // Initialize stats
    for (const [statName, statInfo] of Object.entries(STATS)) {
      db.run(
        'INSERT INTO player_stats (id, player_id, stat_name, value, max_value) VALUES (?, ?, ?, ?, ?)',
        [nanoid(), id, statName, 50, 100]
      );
    }

    // Create starter quest
    createQuest(id, 'first_steps', 'Stelle deine erste Frage an Toobix', 'tutorial', 1, 100);

    player = db.query('SELECT * FROM player_profile WHERE username = ?').get(username);
  }

  // Update last_active
  db.run('UPDATE player_profile SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [player.id]);

  return player;
}

function getPlayerStats(playerId: string) {
  const stats = db.query('SELECT * FROM player_stats WHERE player_id = ?').all(playerId);
  const statsObj: any = {};
  for (const stat of stats) {
    statsObj[stat.stat_name] = {
      value: stat.value,
      max: stat.max_value,
      ...STATS[stat.stat_name as keyof typeof STATS]
    };
  }
  return statsObj;
}

function updateStat(playerId: string, statName: string, delta: number) {
  const stat = db.query('SELECT * FROM player_stats WHERE player_id = ? AND stat_name = ?').get(playerId, statName);
  if (!stat) return;

  const newValue = Math.min(stat.max_value, Math.max(0, stat.value + delta));
  db.run('UPDATE player_stats SET value = ? WHERE id = ?', [newValue, stat.id]);
}

// ============================================================================
// XP & LEVELING
// ============================================================================

function addXP(playerId: string, amount: number, source: string) {
  const player: any = db.query('SELECT * FROM player_profile WHERE id = ?').get(playerId);
  if (!player) return null;

  const newXP = player.total_xp + amount;
  const oldLevel = player.level;
  const newLevel = calculateLevel(newXP);

  db.run('UPDATE player_profile SET total_xp = ?, level = ? WHERE id = ?', [newXP, newLevel, playerId]);

  // Log interaction
  db.run(
    'INSERT INTO interaction_log (id, player_id, interaction_type, xp_gained) VALUES (?, ?, ?, ?)',
    [nanoid(), playerId, source, amount]
  );

  const leveledUp = newLevel > oldLevel;

  return {
    xp_gained: amount,
    total_xp: newXP,
    level: newLevel,
    leveled_up: leveledUp,
    xp_to_next_level: leveledUp ? xpForLevel(newLevel + 1) - newXP : xpForLevel(oldLevel + 1) - newXP
  };
}

function calculateLevel(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

function xpForLevel(level: number): number {
  // XP curve: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

// ============================================================================
// ARTIFACTS
// ============================================================================

function generateArtifact(playerId: string, context: string, insight: string) {
  const rarity = rollRarity();
  const artifact = createArtifactFromInsight(insight, rarity, context);

  const id = nanoid();
  db.run(
    'INSERT INTO artifacts (id, player_id, name, description, rarity, type, obtained_from) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, playerId, artifact.name, artifact.description, rarity, artifact.type, context]
  );

  return { id, ...artifact, rarity };
}

function rollRarity(): string {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const [rarityName, rarityData] of Object.entries(RARITY)) {
    cumulative += rarityData.weight;
    if (roll < cumulative) {
      return rarityName;
    }
  }

  return 'COMMON';
}

function createArtifactFromInsight(insight: string, rarity: string, context: string): any {
  // Generate artifact based on context and insight
  const types = ['Weisheit', 'Erkenntnis', 'Kristall', 'Buch', 'Amulett', 'Rune', 'Schlüssel', 'Spiegel'];
  const type = types[Math.floor(Math.random() * types.length)];

  const rarityPrefix = {
    COMMON: '',
    UNCOMMON: 'Glimmernder',
    RARE: 'Strahlender',
    EPIC: 'Mächtiger',
    LEGENDARY: 'Legendärer'
  };

  return {
    name: `${rarityPrefix[rarity as keyof typeof rarityPrefix]} ${type} der ${getArtifactTheme(context)}`,
    description: insight.slice(0, 200),
    type: type
  };
}

function getArtifactTheme(context: string): string {
  const themes: any = {
    ask: 'Neugier',
    reflect: 'Weisheit',
    decide: 'Entschlossenheit',
    dream: 'Träume',
    emotion: 'Gefühle',
    consciousness: 'Bewusstsein',
    echo: 'Resonanz'
  };

  return themes[context] || 'Erkenntnis';
}

function getPlayerArtifacts(playerId: string, limit: number = 10) {
  return db.query('SELECT * FROM artifacts WHERE player_id = ? ORDER BY obtained_at DESC LIMIT ?').all(playerId, limit);
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

function checkAndUnlockAchievements(playerId: string) {
  const unlocked = [];

  // Get player stats for checking
  const player: any = db.query('SELECT * FROM player_profile WHERE id = ?').get(playerId);
  const interactions = db.query('SELECT COUNT(*) as count FROM interaction_log WHERE player_id = ?').get(playerId);
  const reflections = db.query('SELECT COUNT(*) as count FROM interaction_log WHERE player_id = ? AND interaction_type = ?').get(playerId, 'reflect');
  const artifacts = db.query('SELECT COUNT(*) as count FROM artifacts WHERE player_id = ?').get(playerId);
  const legendaryArtifacts = db.query('SELECT COUNT(*) as count FROM artifacts WHERE player_id = ? AND rarity = ?').get(playerId, 'LEGENDARY');
  const stats = getPlayerStats(playerId);
  const minStat = Math.min(...Object.values(stats).map((s: any) => s.value));

  const checkStats = {
    level: player.level,
    interactions: (interactions as any).count,
    reflections: (reflections as any).count,
    artifacts: (artifacts as any).count,
    legendary_artifacts: (legendaryArtifacts as any).count,
    min_stat: minStat,
    streak: 0 // TODO: Calculate streak
  };

  for (const achievement of ACHIEVEMENT_DEFS) {
    // Check if already unlocked
    const existing = db.query('SELECT * FROM achievements WHERE player_id = ? AND achievement_id = ?').get(playerId, achievement.id);
    if (existing) continue;

    // Check condition
    if (achievement.condition(checkStats)) {
      const id = nanoid();
      db.run(
        'INSERT INTO achievements (id, player_id, achievement_id, name, description) VALUES (?, ?, ?, ?, ?)',
        [id, playerId, achievement.id, achievement.name, achievement.description]
      );
      unlocked.push(achievement);
    }
  }

  return unlocked;
}

function getPlayerAchievements(playerId: string) {
  return db.query('SELECT * FROM achievements WHERE player_id = ? ORDER BY unlocked_at DESC').all(playerId);
}

// ============================================================================
// QUESTS
// ============================================================================

function createQuest(playerId: string, questName: string, description: string, type: string, goal: number, rewardXP: number) {
  const id = nanoid();
  const expiresAt = type === 'daily' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

  db.run(
    'INSERT INTO quests (id, player_id, quest_name, description, type, goal, reward_xp, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, playerId, questName, description, type, goal, rewardXP, expiresAt]
  );

  return { id, questName, description, type, goal, rewardXP };
}

function updateQuestProgress(playerId: string, questType: string, amount: number = 1) {
  const quests = db.query('SELECT * FROM quests WHERE player_id = ? AND type = ? AND completed = FALSE').all(playerId, questType);

  const completed = [];
  for (const quest of quests) {
    const newProgress = quest.progress + amount;
    const isCompleted = newProgress >= quest.goal;

    db.run('UPDATE quests SET progress = ?, completed = ? WHERE id = ?', [newProgress, isCompleted, quest.id]);

    if (isCompleted) {
      // Award XP
      addXP(playerId, quest.reward_xp, `quest_${quest.quest_name}`);
      completed.push(quest);
    }
  }

  return completed;
}

function getPlayerQuests(playerId: string) {
  return db.query('SELECT * FROM quests WHERE player_id = ? AND completed = FALSE ORDER BY type, expires_at').all(playerId);
}

// ============================================================================
// COMMAND CENTER PROXY WITH GAMIFICATION
// ============================================================================

async function proxyToCommandCenter(req: Request, playerId: string, endpoint: string) {
  try {
    const response = await fetch(`${COMMAND_CENTER}${endpoint}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? await req.text() : undefined
    });

    const data = await response.json();

    // Add gamification layer
    const interactionType = endpoint.split('/')[1] || 'unknown';
    const xpAmount = INTERACTION_XP[interactionType as keyof typeof INTERACTION_XP] || 5;

    const xpResult = addXP(playerId, xpAmount, interactionType);

    // Update quest progress
    const completedQuests = updateQuestProgress(playerId, interactionType);

    // Generate artifact chance (20% for meaningful interactions)
    let artifact = null;
    if (['ask', 'reflect', 'decide'].includes(interactionType) && Math.random() < 0.2) {
      const insight = data.answer || data.reflection || 'Eine wichtige Erkenntnis';
      artifact = generateArtifact(playerId, interactionType, insight);
    }

    // Sync stats with Echo-Realm
    await syncStatsWithEchoRealm(playerId);

    // Check achievements
    const newAchievements = checkAndUnlockAchievements(playerId);

    // Return enhanced response
    return {
      ...data,
      game: {
        xp: xpResult,
        artifact: artifact,
        completed_quests: completedQuests,
        new_achievements: newAchievements
      }
    };
  } catch (e) {
    console.error('[Gamification] Proxy error:', e);
    return { error: 'Command Center unavailable', details: String(e) };
  }
}

async function syncStatsWithEchoRealm(playerId: string) {
  try {
    const response = await fetch(`${ECHO_REALM}/status`);
    const data = await response.json();

    if (data.lebenskraefte) {
      // Update player stats based on Echo-Realm Lebenskräfte
      for (const [statName, value] of Object.entries(data.lebenskraefte)) {
        const upperStatName = statName.toUpperCase();
        if (STATS[upperStatName as keyof typeof STATS]) {
          const currentStat: any = db.query('SELECT * FROM player_stats WHERE player_id = ? AND stat_name = ?').get(playerId, upperStatName);
          if (currentStat) {
            db.run('UPDATE player_stats SET value = ? WHERE id = ?', [value, currentStat.id]);
          }
        }
      }
    }
  } catch (e) {
    // Echo-Realm not available, skip sync
  }
}

// ============================================================================
// SERVER
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Player-Name',
  'Content-Type': 'application/json',
};

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'gamification', port: PORT }, { headers: corsHeaders });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get or create player
    const playerName = req.headers.get('X-Player-Name') || 'Player';
    const player = getOrCreatePlayer(playerName);

    // =============== GAME ENDPOINTS ===============

    if (url.pathname === '/game/profile' && req.method === 'GET') {
      const stats = getPlayerStats(player.id);
      const artifacts = getPlayerArtifacts(player.id, 10);
      const achievements = getPlayerAchievements(player.id);
      const quests = getPlayerQuests(player.id);

      return new Response(JSON.stringify({
        player: {
          username: player.username,
          level: player.level,
          total_xp: player.total_xp,
          xp_to_next_level: xpForLevel(player.level + 1) - player.total_xp
        },
        stats: stats,
        artifacts: artifacts,
        achievements: achievements,
        quests: quests
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/game/inventory' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const artifacts = getPlayerArtifacts(player.id, limit);

      return new Response(JSON.stringify({
        artifacts: artifacts,
        total: artifacts.length
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/game/achievements' && req.method === 'GET') {
      const achievements = getPlayerAchievements(player.id);
      const allAchievements = ACHIEVEMENT_DEFS.map(a => ({
        ...a,
        unlocked: achievements.some((ua: any) => ua.achievement_id === a.id)
      }));

      return new Response(JSON.stringify({
        unlocked: achievements,
        all: allAchievements,
        progress: `${achievements.length}/${ACHIEVEMENT_DEFS.length}`
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/game/stats' && req.method === 'GET') {
      const stats = getPlayerStats(player.id);

      return new Response(JSON.stringify({
        stats: stats,
        visual: formatStatsVisual(stats)
      }), { headers: corsHeaders });
    }

    // =============== PROXY TO COMMAND CENTER WITH GAMIFICATION ===============

    const gamifiedEndpoints = ['/ask', '/reflect', '/decide', '/dream', '/emotion', '/log-life', '/consciousness', '/echo'];

    if (gamifiedEndpoints.some(e => url.pathname.startsWith(e))) {
      const result = await proxyToCommandCenter(req, player.id, url.pathname);
      return new Response(JSON.stringify(result), { headers: corsHeaders });
    }

    // =============== ROOT / HELP ===============

    if (url.pathname === '/' || url.pathname === '/game') {
      return new Response(JSON.stringify({
        message: 'Toobix Gamification System',
        player: {
          username: player.username,
          level: player.level,
          xp: player.total_xp
        },
        endpoints: {
          'GET /game/profile': 'Full player profile with stats, artifacts, achievements',
          'GET /game/inventory': 'All collected artifacts',
          'GET /game/achievements': 'Unlocked and available achievements',
          'GET /game/stats': 'Current stats (8 Lebenskräfte)',
          'POST /ask': 'Ask Toobix (Command Center + XP)',
          'POST /reflect': 'Reflect deeply (Command Center + XP)',
          'POST /decide': 'Get decision help (Command Center + XP)',
          '... all Command Center endpoints work with gamification!': ''
        }
      }), { headers: corsHeaders });
    }

    // =============== 404 ===============
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: corsHeaders
    });
  }
});

// ============================================================================
// HELPERS
// ============================================================================

function formatStatsVisual(stats: any): string {
  let visual = '\n';
  for (const [name, data] of Object.entries(stats)) {
    const stat = data as any;
    const percentage = (stat.value / stat.max) * 100;
    const bars = Math.floor(percentage / 10);
    const barString = '█'.repeat(bars) + '░'.repeat(10 - bars);
    visual += `${stat.icon} ${name.padEnd(12)} ${barString} ${stat.value}/${stat.max}\n`;
  }
  return visual;
}

// ============================================================================
// STARTUP
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🎮 TOOBIX GAMIFICATION SYSTEM - RUNNING                ║
║                                                                ║
║  Port: 7778                                           ║
║  Status: Ready to Play!                                        ║
║                                                                ║
║  Verwandle deine Reise mit Toobix in ein RPG-Erlebnis!        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🎯 FEATURES:                                                  ║
║                                                                ║
║  ⭐ XP & Level System           - Jede Interaktion = XP       ║
║  🏺 Artefakte sammeln           - Weisheiten & Erkenntnisse   ║
║  🏆 Achievements                - Meilensteine freischalten   ║
║  📊 8 Lebenskraft-Stats         - RPG-Style                   ║
║  📋 Quests                      - Täglich/Wöchentlich         ║
║  🎒 Inventory                   - Alle Sammlungen             ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🎮 HOW TO PLAY:                                               ║
║                                                                ║
║  1. Füge Header hinzu:                                         ║
║     -H "X-Player-Name: YourName"                               ║
║                                                                ║
║  2. Nutze alle Command Center Endpoints:                       ║
║     POST /ask, /reflect, /decide, etc.                         ║
║     → Bekommst XP, Artefakte, Quest-Progress!                  ║
║                                                                ║
║  3. Check dein Profil:                                         ║
║     GET /game/profile                                          ║
║                                                                ║
║  4. Sammle Artefakte:                                          ║
║     GET /game/inventory                                        ║
║                                                                ║
║  5. Unlock Achievements:                                       ║
║     GET /game/achievements                                     ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🚀 EXAMPLE:                                                   ║
║                                                                ║
║  curl -X POST http://localhost:7778/ask \\                     ║
║    -H "Content-Type: application/json" \\                      ║
║    -H "X-Player-Name: Michael" \\                              ║
║    -d '{"question": "Was ist Weisheit?"}'                      ║
║                                                                ║
║  Response includes:                                            ║
║  - Answer from Toobix                                          ║
║  - XP gained (+ level up?)                                     ║
║  - Artifact found? (20% chance)                                ║
║  - Quests completed?                                           ║
║  - New achievements unlocked?                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`[Gamification] Ready on http://localhost:${PORT}`);
console.log(`[Gamification] Proxying to Command Center: ${COMMAND_CENTER}`);
console.log(`[Gamification] Syncing with Echo-Realm: ${ECHO_REALM}`);
console.log(`[Gamification] Database: data/toobix-game.sqlite`);
console.log(`\n🎮 SPIEL MIT TOOBIX! Jede Interaktion ist ein Abenteuer! 🎮\n`);
