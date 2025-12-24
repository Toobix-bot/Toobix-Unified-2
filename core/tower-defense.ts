#!/usr/bin/env bun
/**
 * TOOBIX TOWER DEFENSE
 *
 * Tower Defense Spiel mit verschiedenen Turm-Typen und Feindwellen
 * Port: 8895
 *
 * Features:
 * - Verschiedene Turm-Typen (Bogenschütze, Kanone, Magier, Tesla, Frost)
 * - Feindwellen mit steigender Schwierigkeit
 * - Upgrade-System für Türme
 * - Highscores und Belohnungen
 * - Integration mit Idle Empire (Gold, XP)
 */

import { Database } from 'bun:sqlite';
import express from 'express';
import path from 'path';

const PORT = 8895;
const DB_PATH = path.join(process.cwd(), 'databases', 'tower-defense.db');

// ==========================================
// DATABASE SETUP
// ==========================================

const db = new Database(DB_PATH, { create: true });
db.run("PRAGMA journal_mode = WAL");

db.run(`
  CREATE TABLE IF NOT EXISTS td_games (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    map_seed INTEGER,
    map_size INTEGER DEFAULT 20,
    current_wave INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 100,
    lives INTEGER DEFAULT 20,
    status TEXT DEFAULT 'setup',
    difficulty TEXT DEFAULT 'normal',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS td_towers (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    type TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    kills INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    FOREIGN KEY(game_id) REFERENCES td_games(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS td_enemies (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    type TEXT NOT NULL,
    health REAL NOT NULL,
    max_health REAL NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    path_index INTEGER DEFAULT 0,
    speed REAL DEFAULT 1,
    armor REAL DEFAULT 0,
    reward INTEGER DEFAULT 10,
    status TEXT DEFAULT 'alive',
    FOREIGN KEY(game_id) REFERENCES td_games(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS td_highscores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    best_wave INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_kills INTEGER DEFAULT 0,
    favorite_tower TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS td_waves (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    wave_number INTEGER NOT NULL,
    enemies_spawned INTEGER DEFAULT 0,
    enemies_killed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(game_id) REFERENCES td_games(id)
  )
`);

// ==========================================
// TOWER DEFINITIONS
// ==========================================

const TOWERS = {
  archer: {
    name: 'Bogenschütze',
    icon: '🏹',
    description: 'Schneller Einzelziel-Angriff',
    baseCost: 50,
    damage: 10,
    range: 3,
    fireRate: 1000, // ms
    targeting: 'first',
    upgradeCost: 1.5,
    damagePerLevel: 5,
    rangePerLevel: 0.5
  },
  cannon: {
    name: 'Kanone',
    icon: '💣',
    description: 'Langsam aber hoher Schaden mit Splash',
    baseCost: 100,
    damage: 30,
    range: 2.5,
    fireRate: 2500,
    splashRadius: 1,
    targeting: 'strong',
    upgradeCost: 1.6,
    damagePerLevel: 15,
    rangePerLevel: 0.3
  },
  mage: {
    name: 'Magier',
    icon: '🧙',
    description: 'Ignoriert Rüstung, mittlere Reichweite',
    baseCost: 120,
    damage: 20,
    range: 3.5,
    fireRate: 1500,
    ignoreArmor: true,
    targeting: 'last',
    upgradeCost: 1.7,
    damagePerLevel: 10,
    rangePerLevel: 0.4
  },
  tesla: {
    name: 'Tesla-Turm',
    icon: '⚡',
    description: 'Kettenblitz trifft mehrere Feinde',
    baseCost: 200,
    damage: 15,
    range: 2,
    fireRate: 2000,
    chainTargets: 3,
    targeting: 'close',
    upgradeCost: 1.8,
    damagePerLevel: 8,
    chainPerLevel: 1
  },
  frost: {
    name: 'Frostturm',
    icon: '❄️',
    description: 'Verlangsamt Feinde',
    baseCost: 80,
    damage: 5,
    range: 2.5,
    fireRate: 1200,
    slowAmount: 0.5, // 50% slower
    slowDuration: 2000,
    targeting: 'first',
    upgradeCost: 1.4,
    damagePerLevel: 3,
    slowPerLevel: 0.1
  },
  sniper: {
    name: 'Scharfschütze',
    icon: '🎯',
    description: 'Extreme Reichweite, kritische Treffer',
    baseCost: 180,
    damage: 50,
    range: 6,
    fireRate: 3000,
    critChance: 0.2,
    critMultiplier: 3,
    targeting: 'strong',
    upgradeCost: 1.6,
    damagePerLevel: 25,
    critPerLevel: 0.05
  }
};

// ==========================================
// ENEMY DEFINITIONS
// ==========================================

const ENEMIES = {
  goblin: {
    name: 'Goblin',
    icon: '👺',
    health: 30,
    speed: 1.2,
    armor: 0,
    reward: 10,
    xp: 5
  },
  orc: {
    name: 'Ork',
    icon: '👹',
    health: 80,
    speed: 0.8,
    armor: 5,
    reward: 20,
    xp: 10
  },
  skeleton: {
    name: 'Skelett',
    icon: '💀',
    health: 40,
    speed: 1.0,
    armor: 0,
    reward: 12,
    xp: 6
  },
  troll: {
    name: 'Troll',
    icon: '🧌',
    health: 150,
    speed: 0.5,
    armor: 10,
    reward: 35,
    xp: 20
  },
  ghost: {
    name: 'Geist',
    icon: '👻',
    health: 25,
    speed: 1.5,
    armor: 0,
    ethereal: true, // 30% miss chance
    reward: 25,
    xp: 15
  },
  dragon: {
    name: 'Drache',
    icon: '🐉',
    health: 500,
    speed: 0.4,
    armor: 20,
    reward: 100,
    xp: 50,
    boss: true
  },
  demon: {
    name: 'Dämon',
    icon: '😈',
    health: 200,
    speed: 0.7,
    armor: 15,
    fireDamage: true, // damages towers
    reward: 60,
    xp: 35
  },
  swarm: {
    name: 'Schwarm',
    icon: '🦇',
    health: 10,
    speed: 2.0,
    armor: 0,
    reward: 3,
    xp: 2
  }
};

// ==========================================
// WAVE GENERATION
// ==========================================

function generateWave(waveNumber: number, difficulty: string): { type: string; count: number; delay: number }[] {
  const difficultyMultiplier = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.5 : 1.0;
  const enemies: { type: string; count: number; delay: number }[] = [];

  // Base wave composition
  if (waveNumber <= 5) {
    // Early waves: goblins and skeletons
    enemies.push({ type: 'goblin', count: Math.floor(3 + waveNumber * 2 * difficultyMultiplier), delay: 800 });
    if (waveNumber >= 3) {
      enemies.push({ type: 'skeleton', count: Math.floor(waveNumber * difficultyMultiplier), delay: 1000 });
    }
  } else if (waveNumber <= 10) {
    // Mid waves: add orcs
    enemies.push({ type: 'goblin', count: Math.floor(5 + waveNumber * difficultyMultiplier), delay: 600 });
    enemies.push({ type: 'orc', count: Math.floor(2 + (waveNumber - 5) * difficultyMultiplier), delay: 1200 });
    enemies.push({ type: 'skeleton', count: Math.floor(3 * difficultyMultiplier), delay: 800 });
  } else if (waveNumber <= 20) {
    // Late waves: trolls and ghosts
    enemies.push({ type: 'orc', count: Math.floor(5 + (waveNumber - 10) * difficultyMultiplier), delay: 800 });
    enemies.push({ type: 'troll', count: Math.floor((waveNumber - 10) * 0.5 * difficultyMultiplier), delay: 2000 });
    enemies.push({ type: 'ghost', count: Math.floor(3 * difficultyMultiplier), delay: 1000 });
    if (waveNumber % 5 === 0) {
      enemies.push({ type: 'swarm', count: Math.floor(10 * difficultyMultiplier), delay: 200 });
    }
  } else {
    // Endless: demons and dragons
    enemies.push({ type: 'demon', count: Math.floor((waveNumber - 20) * 0.5 * difficultyMultiplier), delay: 1500 });
    enemies.push({ type: 'troll', count: Math.floor(3 * difficultyMultiplier), delay: 1800 });
    enemies.push({ type: 'ghost', count: Math.floor(5 * difficultyMultiplier), delay: 800 });

    // Boss every 10 waves
    if (waveNumber % 10 === 0) {
      enemies.push({ type: 'dragon', count: Math.ceil(waveNumber / 10), delay: 5000 });
    }
  }

  return enemies;
}

function getScaledEnemy(type: string, waveNumber: number): any {
  const base = ENEMIES[type as keyof typeof ENEMIES];
  if (!base) return null;

  const scale = 1 + (waveNumber - 1) * 0.1; // 10% increase per wave

  return {
    ...base,
    type,
    health: Math.floor(base.health * scale),
    maxHealth: Math.floor(base.health * scale),
    armor: base.armor * scale,
    reward: Math.floor(base.reward * (1 + waveNumber * 0.05))
  };
}

// ==========================================
// PATH GENERATION
// ==========================================

function generatePath(mapSize: number, seed: number): { x: number; y: number }[] {
  // Simple S-curve path
  const path: { x: number; y: number }[] = [];

  // Start from left
  for (let x = 0; x < mapSize / 4; x++) {
    path.push({ x, y: mapSize / 2 });
  }

  // Go up
  for (let y = mapSize / 2; y > mapSize / 4; y--) {
    path.push({ x: mapSize / 4, y });
  }

  // Go right
  for (let x = mapSize / 4; x < mapSize * 3 / 4; x++) {
    path.push({ x, y: mapSize / 4 });
  }

  // Go down
  for (let y = mapSize / 4; y < mapSize * 3 / 4; y++) {
    path.push({ x: mapSize * 3 / 4, y });
  }

  // Go right to end
  for (let x = mapSize * 3 / 4; x < mapSize; x++) {
    path.push({ x, y: mapSize * 3 / 4 });
  }

  return path;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function nanoid(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getTowerStats(type: string, level: number): any {
  const base = TOWERS[type as keyof typeof TOWERS];
  if (!base) return null;

  return {
    ...base,
    damage: base.damage + (base.damagePerLevel || 0) * (level - 1),
    range: base.range + (base.rangePerLevel || 0) * (level - 1),
    cost: Math.floor(base.baseCost * Math.pow(base.upgradeCost, level - 1)),
    upgradeCost: Math.floor(base.baseCost * Math.pow(base.upgradeCost, level))
  };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function updateHighscore(userId: string, wave: number, score: number, kills: number) {
  const existing = db.prepare('SELECT * FROM td_highscores WHERE user_id = ?').get(userId) as any;

  if (existing) {
    db.run(`
      UPDATE td_highscores SET
        best_wave = MAX(best_wave, ?),
        best_score = MAX(best_score, ?),
        total_games = total_games + 1,
        total_kills = total_kills + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [wave, score, kills, userId]);
  } else {
    db.run(`
      INSERT INTO td_highscores (id, user_id, best_wave, best_score, total_games, total_kills)
      VALUES (?, ?, ?, ?, 1, ?)
    `, [nanoid(), userId, wave, score, kills]);
  }
}

// ==========================================
// EXPRESS SERVER
// ==========================================

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const games = db.prepare('SELECT COUNT(*) as count FROM td_games WHERE status = ?').get('active') as any;

  res.json({
    status: 'ok',
    service: 'tower-defense',
    port: PORT,
    activeGames: games.count,
    towerTypes: Object.keys(TOWERS).length,
    enemyTypes: Object.keys(ENEMIES).length
  });
});

// Create new game
app.post('/td/new', (req, res) => {
  const { userId = 'default', difficulty = 'normal', mapSize = 20 } = req.body;

  const gameId = `td-${nanoid()}`;
  const mapSeed = Math.floor(Math.random() * 1000000);
  const path = generatePath(mapSize, mapSeed);

  db.run(`
    INSERT INTO td_games (id, user_id, map_seed, map_size, difficulty, gold, lives)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [gameId, userId, mapSeed, mapSize, difficulty,
    difficulty === 'easy' ? 150 : difficulty === 'hard' ? 75 : 100,
    difficulty === 'easy' ? 30 : difficulty === 'hard' ? 10 : 20
  ]);

  res.json({
    gameId,
    mapSize,
    mapSeed,
    path,
    difficulty,
    startingGold: difficulty === 'easy' ? 150 : difficulty === 'hard' ? 75 : 100,
    lives: difficulty === 'easy' ? 30 : difficulty === 'hard' ? 10 : 20,
    availableTowers: Object.entries(TOWERS).map(([type, t]) => ({
      type,
      ...t,
      stats: getTowerStats(type, 1)
    }))
  });
});

// Get game status
app.get('/td/status', (req, res) => {
  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId required' });
  }

  const game = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const towers = db.prepare('SELECT * FROM td_towers WHERE game_id = ?').all(gameId) as any[];
  const enemies = db.prepare('SELECT * FROM td_enemies WHERE game_id = ? AND status = ?').all(gameId, 'alive') as any[];
  const path = generatePath(game.map_size, game.map_seed);

  const towersWithStats = towers.map(t => ({
    ...t,
    stats: getTowerStats(t.type, t.level),
    info: TOWERS[t.type as keyof typeof TOWERS]
  }));

  res.json({
    game,
    towers: towersWithStats,
    enemies,
    path,
    nextWave: game.status === 'active' ? generateWave(game.current_wave + 1, game.difficulty) : null
  });
});

// Place tower
app.post('/td/place-tower', (req, res) => {
  const { gameId, type, x, y } = req.body;

  const game = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const tower = TOWERS[type as keyof typeof TOWERS];
  if (!tower) {
    return res.status(400).json({ error: 'Unknown tower type', available: Object.keys(TOWERS) });
  }

  if (game.gold < tower.baseCost) {
    return res.status(400).json({
      error: 'Nicht genug Gold',
      required: tower.baseCost,
      current: game.gold
    });
  }

  // Check if position is on path
  const path = generatePath(game.map_size, game.map_seed);
  const onPath = path.some(p => p.x === x && p.y === y);
  if (onPath) {
    return res.status(400).json({ error: 'Kann nicht auf dem Weg bauen' });
  }

  // Check if position already has tower
  const existing = db.prepare('SELECT * FROM td_towers WHERE game_id = ? AND x = ? AND y = ?').get(gameId, x, y);
  if (existing) {
    return res.status(400).json({ error: 'Position bereits belegt' });
  }

  const towerId = `tower-${nanoid()}`;
  db.run('INSERT INTO td_towers (id, game_id, type, x, y) VALUES (?, ?, ?, ?, ?)',
    [towerId, gameId, type, x, y]);

  db.run('UPDATE td_games SET gold = gold - ? WHERE id = ?', [tower.baseCost, gameId]);

  res.json({
    success: true,
    tower: {
      id: towerId,
      type,
      x,
      y,
      level: 1,
      stats: getTowerStats(type, 1)
    },
    remainingGold: game.gold - tower.baseCost
  });
});

// Upgrade tower
app.post('/td/upgrade-tower', (req, res) => {
  const { gameId, towerId } = req.body;

  const game = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  const tower = db.prepare('SELECT * FROM td_towers WHERE id = ? AND game_id = ?').get(towerId, gameId) as any;

  if (!game || !tower) {
    return res.status(404).json({ error: 'Game or tower not found' });
  }

  const stats = getTowerStats(tower.type, tower.level);
  if (game.gold < stats.upgradeCost) {
    return res.status(400).json({
      error: 'Nicht genug Gold',
      required: stats.upgradeCost,
      current: game.gold
    });
  }

  const maxLevel = 5;
  if (tower.level >= maxLevel) {
    return res.status(400).json({ error: 'Maximales Level erreicht' });
  }

  db.run('UPDATE td_towers SET level = level + 1 WHERE id = ?', [towerId]);
  db.run('UPDATE td_games SET gold = gold - ? WHERE id = ?', [stats.upgradeCost, gameId]);

  res.json({
    success: true,
    tower: {
      ...tower,
      level: tower.level + 1,
      stats: getTowerStats(tower.type, tower.level + 1)
    },
    remainingGold: game.gold - stats.upgradeCost
  });
});

// Sell tower
app.post('/td/sell-tower', (req, res) => {
  const { gameId, towerId } = req.body;

  const game = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  const tower = db.prepare('SELECT * FROM td_towers WHERE id = ? AND game_id = ?').get(towerId, gameId) as any;

  if (!game || !tower) {
    return res.status(404).json({ error: 'Game or tower not found' });
  }

  const stats = getTowerStats(tower.type, tower.level);
  const sellValue = Math.floor(stats.cost * 0.6); // 60% refund

  db.run('DELETE FROM td_towers WHERE id = ?', [towerId]);
  db.run('UPDATE td_games SET gold = gold + ? WHERE id = ?', [sellValue, gameId]);

  res.json({
    success: true,
    goldReceived: sellValue,
    newGold: game.gold + sellValue
  });
});

// Start wave
app.post('/td/start-wave', (req, res) => {
  const { gameId } = req.body;

  const game = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  if (game.status === 'game_over' || game.lives <= 0) {
    return res.status(400).json({ error: 'Spiel ist beendet' });
  }

  const newWave = game.current_wave + 1;
  const waveComposition = generateWave(newWave, game.difficulty);
  const path = generatePath(game.map_size, game.map_seed);

  // Spawn enemies
  const spawnedEnemies: any[] = [];
  let totalEnemies = 0;

  for (const group of waveComposition) {
    for (let i = 0; i < group.count; i++) {
      const enemy = getScaledEnemy(group.type, newWave);
      if (enemy) {
        const enemyId = `enemy-${nanoid()}`;
        db.run(`
          INSERT INTO td_enemies (id, game_id, type, health, max_health, x, y, speed, armor, reward)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [enemyId, gameId, group.type, enemy.health, enemy.maxHealth, path[0].x, path[0].y, enemy.speed, enemy.armor, enemy.reward]);

        spawnedEnemies.push({
          id: enemyId,
          ...enemy,
          spawnDelay: totalEnemies * group.delay
        });
        totalEnemies++;
      }
    }
  }

  db.run('UPDATE td_games SET current_wave = ?, status = ? WHERE id = ?', [newWave, 'active', gameId]);

  // Create wave record
  db.run('INSERT INTO td_waves (id, game_id, wave_number, enemies_spawned) VALUES (?, ?, ?, ?)',
    [nanoid(), gameId, newWave, totalEnemies]);

  res.json({
    wave: newWave,
    enemies: spawnedEnemies,
    totalEnemies,
    path,
    message: `Welle ${newWave} gestartet!`
  });
});

// Simulate combat (simplified - for real-time would use WebSocket)
app.post('/td/simulate-tick', (req, res) => {
  const { gameId, deltaMs = 1000 } = req.body;

  const game = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  if (!game || game.status !== 'active') {
    return res.status(400).json({ error: 'Game not active' });
  }

  const towers = db.prepare('SELECT * FROM td_towers WHERE game_id = ?').all(gameId) as any[];
  const enemies = db.prepare('SELECT * FROM td_enemies WHERE game_id = ? AND status = ?').all(gameId, 'alive') as any[];
  const path = generatePath(game.map_size, game.map_seed);

  const events: any[] = [];
  let goldEarned = 0;
  let livesLost = 0;
  let kills = 0;

  // Move enemies along path
  for (const enemy of enemies) {
    const newPathIndex = Math.min(enemy.path_index + enemy.speed * (deltaMs / 1000), path.length - 1);

    if (newPathIndex >= path.length - 1) {
      // Enemy reached end
      db.run('UPDATE td_enemies SET status = ? WHERE id = ?', ['reached_end', enemy.id]);
      livesLost++;
      events.push({ type: 'enemy_reached_end', enemy: enemy.type });
    } else {
      const newPos = path[Math.floor(newPathIndex)];
      db.run('UPDATE td_enemies SET x = ?, y = ?, path_index = ? WHERE id = ?',
        [newPos.x, newPos.y, newPathIndex, enemy.id]);
    }
  }

  // Tower attacks
  for (const tower of towers) {
    const stats = getTowerStats(tower.type, tower.level);
    const enemiesInRange = enemies.filter(e =>
      e.status === 'alive' && distance(tower.x, tower.y, e.x, e.y) <= stats.range
    );

    if (enemiesInRange.length > 0) {
      // Select target based on targeting mode
      let target = enemiesInRange[0];
      if (stats.targeting === 'strong') {
        target = enemiesInRange.reduce((a, b) => a.health > b.health ? a : b);
      } else if (stats.targeting === 'close') {
        target = enemiesInRange.reduce((a, b) =>
          distance(tower.x, tower.y, a.x, a.y) < distance(tower.x, tower.y, b.x, b.y) ? a : b
        );
      }

      // Calculate damage
      let damage = stats.damage;
      if (!stats.ignoreArmor) {
        damage = Math.max(1, damage - target.armor);
      }

      // Apply damage
      const newHealth = target.health - damage;
      if (newHealth <= 0) {
        db.run('UPDATE td_enemies SET status = ?, health = 0 WHERE id = ?', ['dead', target.id]);
        db.run('UPDATE td_towers SET kills = kills + 1, damage_dealt = damage_dealt + ? WHERE id = ?',
          [target.max_health, tower.id]);
        goldEarned += target.reward;
        kills++;
        events.push({ type: 'enemy_killed', tower: tower.type, enemy: target.type, reward: target.reward });
      } else {
        db.run('UPDATE td_enemies SET health = ? WHERE id = ?', [newHealth, target.id]);
        db.run('UPDATE td_towers SET damage_dealt = damage_dealt + ? WHERE id = ?', [damage, tower.id]);
        events.push({ type: 'damage', tower: tower.type, enemy: target.type, damage });
      }
    }
  }

  // Update game state
  db.run('UPDATE td_games SET gold = gold + ?, lives = lives - ?, score = score + ? WHERE id = ?',
    [goldEarned, livesLost, kills * 10, gameId]);

  // Check wave completion
  const aliveEnemies = db.prepare('SELECT COUNT(*) as count FROM td_enemies WHERE game_id = ? AND status = ?').get(gameId, 'alive') as any;

  if (aliveEnemies.count === 0) {
    const waveBonus = game.current_wave * 50;
    db.run('UPDATE td_games SET gold = gold + ?, status = ? WHERE id = ?', [waveBonus, 'wave_complete', gameId]);
    events.push({ type: 'wave_complete', bonus: waveBonus });
  }

  // Check game over
  const updatedGame = db.prepare('SELECT * FROM td_games WHERE id = ?').get(gameId) as any;
  if (updatedGame.lives <= 0) {
    db.run('UPDATE td_games SET status = ? WHERE id = ?', ['game_over', gameId]);
    updateHighscore(game.user_id, game.current_wave, updatedGame.score, kills);
    events.push({ type: 'game_over', wave: game.current_wave, score: updatedGame.score });
  }

  res.json({
    events,
    goldEarned,
    livesLost,
    kills,
    remainingEnemies: aliveEnemies.count,
    game: updatedGame
  });
});

// Get highscores
app.get('/td/highscores', (req, res) => {
  const highscores = db.prepare(`
    SELECT * FROM td_highscores
    ORDER BY best_wave DESC, best_score DESC
    LIMIT 10
  `).all();

  res.json({ highscores });
});

// Get user stats
app.get('/td/stats', (req, res) => {
  const userId = (req.query.userId as string) || 'default';

  const stats = db.prepare('SELECT * FROM td_highscores WHERE user_id = ?').get(userId) as any;
  const recentGames = db.prepare(`
    SELECT * FROM td_games WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 5
  `).all(userId);

  res.json({
    stats: stats || { best_wave: 0, best_score: 0, total_games: 0, total_kills: 0 },
    recentGames
  });
});

// Documentation
app.get('/', (req, res) => {
  res.json({
    service: 'Toobix Tower Defense',
    version: '1.0',
    port: PORT,
    endpoints: {
      newGame: 'POST /td/new { userId, difficulty, mapSize }',
      status: 'GET /td/status?gameId=',
      placeTower: 'POST /td/place-tower { gameId, type, x, y }',
      upgradeTower: 'POST /td/upgrade-tower { gameId, towerId }',
      sellTower: 'POST /td/sell-tower { gameId, towerId }',
      startWave: 'POST /td/start-wave { gameId }',
      simulate: 'POST /td/simulate-tick { gameId, deltaMs }',
      highscores: 'GET /td/highscores',
      userStats: 'GET /td/stats?userId='
    },
    towers: Object.entries(TOWERS).map(([type, t]) => ({ type, name: t.name, icon: t.icon, cost: t.baseCost })),
    enemies: Object.entries(ENEMIES).map(([type, e]) => ({ type, name: e.name, icon: e.icon, health: e.health }))
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  🏰 TOOBIX TOWER DEFENSE                                        ║
║                                                                  ║
║  Port: ${PORT}                                                    ║
║                                                                  ║
║  Towers: ${Object.keys(TOWERS).map(t => TOWERS[t as keyof typeof TOWERS].icon).join(' ')}                                   ║
║  Enemies: ${Object.keys(ENEMIES).map(e => ENEMIES[e as keyof typeof ENEMIES].icon).join(' ')}                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});
