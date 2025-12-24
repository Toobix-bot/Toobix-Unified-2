#!/usr/bin/env bun
/**
 * TOOBIX IDLE EMPIRE
 *
 * Idle/Incremental Game mit Base Building, Mining & Farming
 * Port: 8897
 *
 * Features:
 * - Ressourcen-System (Gold, Holz, Stein, Mana, Energie)
 * - Gebäude (Farm, Mine, Sägewerk, Turm, Lager, Werkstatt)
 * - Mining mit verschiedenen Erz-Typen
 * - Farming mit Wachstumszyklen
 * - Offline-Fortschritt
 * - Integration mit Event-Hub
 */

import { Database } from 'bun:sqlite';
import express from 'express';
import path from 'path';

const PORT = 8897;
const DB_PATH = path.join(process.cwd(), 'databases', 'idle-empire.db');

// ==========================================
// DATABASE SETUP
// ==========================================

const db = new Database(DB_PATH, { create: true });
db.run("PRAGMA journal_mode = WAL");

db.run(`
  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL DEFAULT 0,
    max_capacity REAL DEFAULT 1000,
    production_rate REAL DEFAULT 0,
    UNIQUE(user_id, type)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT,
    level INTEGER DEFAULT 1,
    x INTEGER,
    y INTEGER,
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    workers INTEGER DEFAULT 0,
    max_workers INTEGER DEFAULT 5,
    production_type TEXT,
    production_rate REAL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS upgrades (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    upgrade_id TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    UNIQUE(user_id, upgrade_id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS mines (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ore_type TEXT NOT NULL,
    x INTEGER,
    y INTEGER,
    richness REAL DEFAULT 100,
    extraction_rate REAL DEFAULT 1,
    workers INTEGER DEFAULT 0,
    equipment_level INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS farm_plots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    crop_type TEXT,
    x INTEGER,
    y INTEGER,
    growth_stage INTEGER DEFAULT 0,
    planted_at TEXT,
    harvest_ready INTEGER DEFAULT 0,
    auto_harvest INTEGER DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS production_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    amount REAL,
    source TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS user_state (
    user_id TEXT PRIMARY KEY,
    last_collection TEXT DEFAULT CURRENT_TIMESTAMP,
    total_playtime INTEGER DEFAULT 0,
    offline_bonus_multiplier REAL DEFAULT 0.5
  )
`);

// ==========================================
// RESOURCE DEFINITIONS
// ==========================================

const RESOURCES = {
  gold: { icon: '💰', baseCapacity: 10000, description: 'Währung für Gebäude und Upgrades' },
  wood: { icon: '🪵', baseCapacity: 500, description: 'Baumaterial für Strukturen' },
  stone: { icon: '🪨', baseCapacity: 500, description: 'Baumaterial für Befestigungen' },
  mana: { icon: '✨', baseCapacity: 100, description: 'Magische Energie für Zauber' },
  energy: { icon: '⚡', baseCapacity: 100, description: 'Aktionspunkte für Aufgaben' },
  copper: { icon: '🟤', baseCapacity: 200, description: 'Erz für einfache Werkzeuge' },
  iron: { icon: '⬛', baseCapacity: 200, description: 'Erz für Waffen und Rüstungen' },
  crystal: { icon: '💎', baseCapacity: 50, description: 'Seltenes Erz für Magie' },
  wheat: { icon: '🌾', baseCapacity: 300, description: 'Nahrung für Arbeiter' },
  vegetables: { icon: '🥕', baseCapacity: 200, description: 'Gesunde Nahrung' }
};

// ==========================================
// BUILDING DEFINITIONS
// ==========================================

const BUILDINGS = {
  farm: {
    name: 'Bauernhof',
    icon: '🏡',
    description: 'Produziert Nahrung',
    baseCost: { gold: 100, wood: 50 },
    production: { type: 'wheat', baseRate: 2 },
    maxWorkers: 5,
    upgradeCost: 1.15
  },
  mine: {
    name: 'Mine',
    icon: '⛏️',
    description: 'Fördert Erze',
    baseCost: { gold: 200, wood: 100, stone: 50 },
    production: { type: 'iron', baseRate: 1 },
    maxWorkers: 8,
    upgradeCost: 1.2
  },
  sawmill: {
    name: 'Sägewerk',
    icon: '🪓',
    description: 'Produziert Holz',
    baseCost: { gold: 150, stone: 30 },
    production: { type: 'wood', baseRate: 3 },
    maxWorkers: 4,
    upgradeCost: 1.15
  },
  quarry: {
    name: 'Steinbruch',
    icon: '🏔️',
    description: 'Fördert Stein',
    baseCost: { gold: 180, wood: 80 },
    production: { type: 'stone', baseRate: 2 },
    maxWorkers: 6,
    upgradeCost: 1.18
  },
  storage: {
    name: 'Lager',
    icon: '🏪',
    description: 'Erhöht Kapazität',
    baseCost: { gold: 300, wood: 150, stone: 100 },
    capacityBonus: { all: 500 },
    maxWorkers: 2,
    upgradeCost: 1.25
  },
  workshop: {
    name: 'Werkstatt',
    icon: '🔧',
    description: 'Crafting und Upgrades',
    baseCost: { gold: 500, wood: 200, stone: 150, iron: 50 },
    production: { type: 'gold', baseRate: 5 },
    maxWorkers: 3,
    upgradeCost: 1.3
  },
  tower: {
    name: 'Wachturm',
    icon: '🗼',
    description: 'Verteidigung und Übersicht',
    baseCost: { gold: 400, stone: 200 },
    defense: 10,
    maxWorkers: 2,
    upgradeCost: 1.2
  },
  mana_well: {
    name: 'Manabrunnen',
    icon: '🔮',
    description: 'Produziert Mana',
    baseCost: { gold: 800, crystal: 20 },
    production: { type: 'mana', baseRate: 0.5 },
    maxWorkers: 1,
    upgradeCost: 1.4
  }
};

// ==========================================
// CROP DEFINITIONS
// ==========================================

const CROPS = {
  wheat: {
    name: 'Weizen',
    icon: '🌾',
    growthTime: 60 * 60 * 1000, // 1 hour in ms
    yield: 10,
    seasons: ['spring', 'summer', 'autumn']
  },
  carrot: {
    name: 'Karotte',
    icon: '🥕',
    growthTime: 2 * 60 * 60 * 1000, // 2 hours
    yield: 8,
    seasons: ['spring', 'autumn']
  },
  magic_beans: {
    name: 'Magische Bohnen',
    icon: '🫘',
    growthTime: 6 * 60 * 60 * 1000, // 6 hours
    yield: 5,
    yieldType: 'mana',
    seasons: ['summer']
  },
  pumpkin: {
    name: 'Kürbis',
    icon: '🎃',
    growthTime: 4 * 60 * 60 * 1000, // 4 hours
    yield: 15,
    seasons: ['autumn']
  },
  crystal_flower: {
    name: 'Kristallblume',
    icon: '💮',
    growthTime: 12 * 60 * 60 * 1000, // 12 hours
    yield: 3,
    yieldType: 'crystal',
    seasons: ['spring', 'summer']
  }
};

// ==========================================
// ORE DEFINITIONS
// ==========================================

const ORES = {
  copper: {
    name: 'Kupfer',
    icon: '🟤',
    baseRate: 2,
    depth: 'shallow'
  },
  iron: {
    name: 'Eisen',
    icon: '⬛',
    baseRate: 1,
    depth: 'medium'
  },
  gold_ore: {
    name: 'Golderz',
    icon: '🟡',
    baseRate: 0.5,
    depth: 'deep'
  },
  crystal: {
    name: 'Kristall',
    icon: '💎',
    baseRate: 0.2,
    depth: 'very_deep'
  },
  mythril: {
    name: 'Mythril',
    icon: '🔵',
    baseRate: 0.1,
    depth: 'legendary'
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function nanoid(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getOrCreateUser(userId: string) {
  let state = db.prepare('SELECT * FROM user_state WHERE user_id = ?').get(userId) as any;

  if (!state) {
    db.run('INSERT INTO user_state (user_id) VALUES (?)', [userId]);
    state = { user_id: userId, last_collection: new Date().toISOString(), total_playtime: 0, offline_bonus_multiplier: 0.5 };

    // Initialize resources
    for (const [type, config] of Object.entries(RESOURCES)) {
      db.run(
        'INSERT OR IGNORE INTO resources (id, user_id, type, amount, max_capacity) VALUES (?, ?, ?, ?, ?)',
        [nanoid(), userId, type, type === 'gold' ? 500 : 0, config.baseCapacity]
      );
    }
  }

  return state;
}

function getResources(userId: string): Record<string, any> {
  const rows = db.prepare('SELECT * FROM resources WHERE user_id = ?').all(userId) as any[];
  const resources: Record<string, any> = {};

  for (const row of rows) {
    resources[row.type] = {
      amount: row.amount,
      max: row.max_capacity,
      rate: row.production_rate,
      ...RESOURCES[row.type as keyof typeof RESOURCES]
    };
  }

  return resources;
}

function modifyResource(userId: string, type: string, delta: number, source: string): boolean {
  const resource = db.prepare('SELECT * FROM resources WHERE user_id = ? AND type = ?').get(userId, type) as any;

  if (!resource) return false;

  const newAmount = Math.max(0, Math.min(resource.max_capacity, resource.amount + delta));
  db.run('UPDATE resources SET amount = ? WHERE user_id = ? AND type = ?', [newAmount, userId, type]);

  // Log production
  db.run(
    'INSERT INTO production_log (user_id, resource_type, amount, source) VALUES (?, ?, ?, ?)',
    [userId, type, delta, source]
  );

  return true;
}

function calculateOfflineProduction(userId: string): Record<string, number> {
  const state = getOrCreateUser(userId);
  const lastCollection = new Date(state.last_collection).getTime();
  const now = Date.now();
  const offlineSeconds = Math.floor((now - lastCollection) / 1000);

  // Cap at 8 hours
  const cappedSeconds = Math.min(offlineSeconds, 8 * 60 * 60);

  const buildings = db.prepare('SELECT * FROM buildings WHERE user_id = ?').all(userId) as any[];
  const production: Record<string, number> = {};

  for (const building of buildings) {
    if (building.production_type) {
      const def = BUILDINGS[building.type as keyof typeof BUILDINGS];
      if (def && 'production' in def) {
        const rate = building.production_rate * building.level * (building.workers || 1);
        const produced = rate * cappedSeconds * state.offline_bonus_multiplier;

        production[building.production_type] = (production[building.production_type] || 0) + produced;
      }
    }
  }

  return production;
}

function collectOfflineProduction(userId: string): Record<string, number> {
  const production = calculateOfflineProduction(userId);

  for (const [type, amount] of Object.entries(production)) {
    modifyResource(userId, type, amount, 'offline');
  }

  // Update last collection time
  db.run('UPDATE user_state SET last_collection = ? WHERE user_id = ?', [new Date().toISOString(), userId]);

  return production;
}

function getBuildingCost(buildingType: string, currentLevel: number): Record<string, number> {
  const def = BUILDINGS[buildingType as keyof typeof BUILDINGS];
  if (!def) return {};

  const costs: Record<string, number> = {};
  for (const [resource, baseCost] of Object.entries(def.baseCost)) {
    costs[resource] = Math.floor(baseCost * Math.pow(def.upgradeCost, currentLevel));
  }

  return costs;
}

function canAfford(userId: string, costs: Record<string, number>): boolean {
  const resources = getResources(userId);

  for (const [type, amount] of Object.entries(costs)) {
    if (!resources[type] || resources[type].amount < amount) {
      return false;
    }
  }

  return true;
}

function spendResources(userId: string, costs: Record<string, number>, source: string): boolean {
  if (!canAfford(userId, costs)) return false;

  for (const [type, amount] of Object.entries(costs)) {
    modifyResource(userId, type, -amount, source);
  }

  return true;
}

function updateCropGrowth(userId: string) {
  const plots = db.prepare('SELECT * FROM farm_plots WHERE user_id = ? AND crop_type IS NOT NULL').all(userId) as any[];
  const now = Date.now();

  for (const plot of plots) {
    if (plot.planted_at && !plot.harvest_ready) {
      const plantedAt = new Date(plot.planted_at).getTime();
      const crop = CROPS[plot.crop_type as keyof typeof CROPS];

      if (crop) {
        const elapsed = now - plantedAt;
        const progress = Math.min(1, elapsed / crop.growthTime);
        const stage = Math.floor(progress * 4); // 0-4 stages

        const isReady = progress >= 1 ? 1 : 0;

        db.run(
          'UPDATE farm_plots SET growth_stage = ?, harvest_ready = ? WHERE id = ?',
          [stage, isReady, plot.id]
        );

        // Auto-harvest if enabled
        if (isReady && plot.auto_harvest) {
          harvestPlot(userId, plot.id);
        }
      }
    }
  }
}

function harvestPlot(userId: string, plotId: string): { success: boolean; yield?: number; type?: string } {
  const plot = db.prepare('SELECT * FROM farm_plots WHERE id = ? AND user_id = ?').get(plotId, userId) as any;

  if (!plot || !plot.harvest_ready) {
    return { success: false };
  }

  const crop = CROPS[plot.crop_type as keyof typeof CROPS];
  if (!crop) return { success: false };

  const yieldType = crop.yieldType || plot.crop_type;
  const yieldAmount = crop.yield;

  modifyResource(userId, yieldType, yieldAmount, `harvest:${plot.crop_type}`);

  // Reset plot
  db.run(
    'UPDATE farm_plots SET crop_type = NULL, growth_stage = 0, planted_at = NULL, harvest_ready = 0 WHERE id = ?',
    [plotId]
  );

  return { success: true, yield: yieldAmount, type: yieldType };
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// ==========================================
// EXPRESS SERVER
// ==========================================

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const buildings = db.prepare('SELECT COUNT(*) as count FROM buildings').get() as any;
  const users = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_state').get() as any;

  res.json({
    status: 'ok',
    service: 'idle-empire',
    port: PORT,
    stats: {
      totalBuildings: buildings.count,
      activeUsers: users.count,
      resourceTypes: Object.keys(RESOURCES).length,
      buildingTypes: Object.keys(BUILDINGS).length,
      cropTypes: Object.keys(CROPS).length
    }
  });
});

// Get full status
app.get('/idle/status', (req, res) => {
  const userId = (req.query.userId as string) || 'default';
  getOrCreateUser(userId);
  updateCropGrowth(userId);

  const resources = getResources(userId);
  const buildings = db.prepare('SELECT * FROM buildings WHERE user_id = ?').all(userId);
  const plots = db.prepare('SELECT * FROM farm_plots WHERE user_id = ?').all(userId);
  const mines = db.prepare('SELECT * FROM mines WHERE user_id = ?').all(userId);
  const offlineProduction = calculateOfflineProduction(userId);

  res.json({
    resources,
    buildings,
    plots,
    mines,
    pendingOfflineProduction: offlineProduction,
    season: getCurrentSeason(),
    timestamp: new Date().toISOString()
  });
});

// Collect offline resources
app.post('/idle/collect', (req, res) => {
  const { userId = 'default' } = req.body;
  const production = collectOfflineProduction(userId);
  const resources = getResources(userId);

  res.json({
    collected: production,
    currentResources: resources,
    message: 'Offline-Produktion eingesammelt!'
  });
});

// Build new building
app.post('/idle/build', (req, res) => {
  const { userId = 'default', type, x, y } = req.body;

  const def = BUILDINGS[type as keyof typeof BUILDINGS];
  if (!def) {
    return res.status(400).json({ error: 'Unbekannter Gebäudetyp' });
  }

  getOrCreateUser(userId);
  const cost = getBuildingCost(type, 0);

  if (!canAfford(userId, cost)) {
    return res.status(400).json({
      error: 'Nicht genug Ressourcen',
      required: cost,
      current: getResources(userId)
    });
  }

  spendResources(userId, cost, `build:${type}`);

  const buildingId = `bld-${nanoid()}`;
  db.run(
    `INSERT INTO buildings (id, user_id, type, name, x, y, production_type, production_rate, max_workers)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      buildingId, userId, type, def.name,
      x || Math.floor(Math.random() * 100),
      y || Math.floor(Math.random() * 100),
      'production' in def ? def.production.type : null,
      'production' in def ? def.production.baseRate : 0,
      def.maxWorkers
    ]
  );

  res.json({
    success: true,
    building: {
      id: buildingId,
      type,
      name: def.name,
      level: 1
    },
    spent: cost
  });
});

// Upgrade building
app.post('/idle/upgrade', (req, res) => {
  const { userId = 'default', buildingId } = req.body;

  const building = db.prepare('SELECT * FROM buildings WHERE id = ? AND user_id = ?').get(buildingId, userId) as any;
  if (!building) {
    return res.status(404).json({ error: 'Gebäude nicht gefunden' });
  }

  const cost = getBuildingCost(building.type, building.level);

  if (!canAfford(userId, cost)) {
    return res.status(400).json({
      error: 'Nicht genug Ressourcen',
      required: cost
    });
  }

  spendResources(userId, cost, `upgrade:${building.type}`);

  const newLevel = building.level + 1;
  const newRate = building.production_rate * 1.2;

  db.run(
    'UPDATE buildings SET level = ?, production_rate = ?, max_health = ? WHERE id = ?',
    [newLevel, newRate, building.max_health + 20, buildingId]
  );

  res.json({
    success: true,
    building: {
      id: buildingId,
      type: building.type,
      newLevel,
      newProductionRate: newRate
    },
    spent: cost
  });
});

// Assign workers
app.post('/idle/assign-workers', (req, res) => {
  const { userId = 'default', buildingId, workers } = req.body;

  const building = db.prepare('SELECT * FROM buildings WHERE id = ? AND user_id = ?').get(buildingId, userId) as any;
  if (!building) {
    return res.status(404).json({ error: 'Gebäude nicht gefunden' });
  }

  const actualWorkers = Math.min(workers, building.max_workers);
  db.run('UPDATE buildings SET workers = ? WHERE id = ?', [actualWorkers, buildingId]);

  res.json({
    success: true,
    buildingId,
    workers: actualWorkers,
    maxWorkers: building.max_workers
  });
});

// Start mining
app.post('/idle/mine/start', (req, res) => {
  const { userId = 'default', oreType, x, y } = req.body;

  const ore = ORES[oreType as keyof typeof ORES];
  if (!ore) {
    return res.status(400).json({ error: 'Unbekanntes Erz', available: Object.keys(ORES) });
  }

  getOrCreateUser(userId);

  const mineId = `mine-${nanoid()}`;
  db.run(
    `INSERT INTO mines (id, user_id, ore_type, x, y, extraction_rate)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [mineId, userId, oreType, x || 0, y || 0, ore.baseRate]
  );

  res.json({
    success: true,
    mine: {
      id: mineId,
      oreType,
      ore,
      extractionRate: ore.baseRate
    }
  });
});

// Get mining status
app.get('/idle/mine/status', (req, res) => {
  const userId = (req.query.userId as string) || 'default';
  const mines = db.prepare('SELECT * FROM mines WHERE user_id = ?').all(userId) as any[];

  const minesWithInfo = mines.map(mine => ({
    ...mine,
    oreInfo: ORES[mine.ore_type as keyof typeof ORES]
  }));

  res.json({ mines: minesWithInfo });
});

// Plant crop
app.post('/idle/farm/plant', (req, res) => {
  const { userId = 'default', plotId, cropType } = req.body;

  const crop = CROPS[cropType as keyof typeof CROPS];
  if (!crop) {
    return res.status(400).json({ error: 'Unbekannte Pflanze', available: Object.keys(CROPS) });
  }

  // Check season
  const season = getCurrentSeason();
  if (!crop.seasons.includes(season)) {
    return res.status(400).json({
      error: `${crop.name} kann nicht in ${season} angebaut werden`,
      allowedSeasons: crop.seasons
    });
  }

  let plot = db.prepare('SELECT * FROM farm_plots WHERE id = ? AND user_id = ?').get(plotId, userId) as any;

  // Create plot if doesn't exist
  if (!plot) {
    const newPlotId = plotId || `plot-${nanoid()}`;
    db.run(
      'INSERT INTO farm_plots (id, user_id, x, y) VALUES (?, ?, ?, ?)',
      [newPlotId, userId, Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]
    );
    plot = { id: newPlotId };
  }

  if (plot.crop_type) {
    return res.status(400).json({ error: 'Feld ist bereits bepflanzt' });
  }

  db.run(
    'UPDATE farm_plots SET crop_type = ?, planted_at = ?, growth_stage = 0, harvest_ready = 0 WHERE id = ?',
    [cropType, new Date().toISOString(), plot.id]
  );

  res.json({
    success: true,
    plot: {
      id: plot.id,
      crop: crop,
      plantedAt: new Date().toISOString(),
      estimatedHarvest: new Date(Date.now() + crop.growthTime).toISOString()
    }
  });
});

// Get farm status
app.get('/idle/farm/status', (req, res) => {
  const userId = (req.query.userId as string) || 'default';
  updateCropGrowth(userId);

  const plots = db.prepare('SELECT * FROM farm_plots WHERE user_id = ?').all(userId) as any[];

  const plotsWithInfo = plots.map(plot => {
    const crop = plot.crop_type ? CROPS[plot.crop_type as keyof typeof CROPS] : null;
    let progress = 0;
    let timeRemaining = 0;

    if (crop && plot.planted_at) {
      const elapsed = Date.now() - new Date(plot.planted_at).getTime();
      progress = Math.min(100, Math.floor((elapsed / crop.growthTime) * 100));
      timeRemaining = Math.max(0, crop.growthTime - elapsed);
    }

    return {
      ...plot,
      cropInfo: crop,
      progress,
      timeRemaining,
      timeRemainingFormatted: crop ? formatTime(timeRemaining) : null
    };
  });

  res.json({
    plots: plotsWithInfo,
    season: getCurrentSeason(),
    availableCrops: Object.entries(CROPS)
      .filter(([_, c]) => c.seasons.includes(getCurrentSeason()))
      .map(([id, c]) => ({ id, ...c }))
  });
});

// Harvest crop
app.post('/idle/farm/harvest', (req, res) => {
  const { userId = 'default', plotId } = req.body;

  updateCropGrowth(userId);
  const result = harvestPlot(userId, plotId);

  if (!result.success) {
    return res.status(400).json({ error: 'Ernte nicht bereit oder Feld nicht gefunden' });
  }

  res.json({
    success: true,
    harvested: {
      type: result.type,
      amount: result.yield
    },
    resources: getResources(userId)
  });
});

// Harvest all ready crops
app.post('/idle/farm/harvest-all', (req, res) => {
  const { userId = 'default' } = req.body;

  updateCropGrowth(userId);
  const plots = db.prepare('SELECT * FROM farm_plots WHERE user_id = ? AND harvest_ready = 1').all(userId) as any[];

  const harvested: any[] = [];
  for (const plot of plots) {
    const result = harvestPlot(userId, plot.id);
    if (result.success) {
      harvested.push({ plotId: plot.id, ...result });
    }
  }

  res.json({
    success: true,
    harvestedCount: harvested.length,
    harvested,
    resources: getResources(userId)
  });
});

// Get available buildings
app.get('/idle/buildings/available', (req, res) => {
  const userId = (req.query.userId as string) || 'default';
  getOrCreateUser(userId);

  const available = Object.entries(BUILDINGS).map(([type, def]) => ({
    type,
    ...def,
    cost: getBuildingCost(type, 0),
    canAfford: canAfford(userId, getBuildingCost(type, 0))
  }));

  res.json({ buildings: available });
});

// Get leaderboard
app.get('/idle/leaderboard', (req, res) => {
  const users = db.prepare(`
    SELECT u.user_id,
           (SELECT SUM(amount) FROM resources WHERE user_id = u.user_id AND type = 'gold') as gold,
           (SELECT COUNT(*) FROM buildings WHERE user_id = u.user_id) as buildings,
           u.total_playtime
    FROM user_state u
    ORDER BY gold DESC
    LIMIT 10
  `).all() as any[];

  res.json({ leaderboard: users });
});

// Documentation
app.get('/', (req, res) => {
  res.json({
    service: 'Toobix Idle Empire',
    version: '1.0',
    port: PORT,
    endpoints: {
      status: 'GET /idle/status?userId=',
      collect: 'POST /idle/collect',
      build: 'POST /idle/build',
      upgrade: 'POST /idle/upgrade',
      workers: 'POST /idle/assign-workers',
      mining: {
        start: 'POST /idle/mine/start',
        status: 'GET /idle/mine/status'
      },
      farming: {
        plant: 'POST /idle/farm/plant',
        status: 'GET /idle/farm/status',
        harvest: 'POST /idle/farm/harvest',
        harvestAll: 'POST /idle/farm/harvest-all'
      },
      info: {
        buildings: 'GET /idle/buildings/available',
        leaderboard: 'GET /idle/leaderboard'
      }
    },
    resources: Object.keys(RESOURCES),
    buildings: Object.keys(BUILDINGS),
    crops: Object.keys(CROPS),
    ores: Object.keys(ORES)
  });
});

// Helper
function formatTime(ms: number): string {
  if (ms <= 0) return 'Bereit!';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  🏰 TOOBIX IDLE EMPIRE                                          ║
║                                                                  ║
║  Port: ${PORT}                                                    ║
║  Database: ${DB_PATH}
║                                                                  ║
║  Features:                                                       ║
║  - ${Object.keys(RESOURCES).length} Ressourcen-Typen                                       ║
║  - ${Object.keys(BUILDINGS).length} Gebäude-Typen                                         ║
║  - ${Object.keys(CROPS).length} Pflanzen-Arten                                          ║
║  - ${Object.keys(ORES).length} Erz-Typen                                              ║
║  - Offline-Fortschritt                                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});
