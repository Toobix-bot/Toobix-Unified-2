/**
 * 🌟 LIFE COMPANION CORE v1.0
 * 
 * Das Herzstück des Toobix Life Companion Systems
 * Portiert und erweitert von unified_ai_system.py
 * 
 * Features:
 * - 7 Lebensbereiche mit Tracking
 * - Mood System mit Alchemy
 * - Energy & Curiosity Management
 * - Habit Dice für Quick Actions
 * - Seeds & Seasons für Fokus
 * - Quest System mit XP
 * - Daily Check-in
 * 
 * Port: 8970
 */

import express from 'express';
import { createServer } from 'http';
import { Database } from 'bun:sqlite';
import { getEventBusClient } from '../../src/modules/event-bus-client';

// ============================================================================
// TYPES
// ============================================================================

type Mood = 'calm' | 'curious' | 'creative' | 'engaged' | 'rested' | 
            'attentive' | 'inventive' | 'poised' | 'ready' | 'neutral';

type Goal = 'observe' | 'explore' | 'learn' | 'create' | 'connect' | 'rest';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

type LifeArea = 
  | 'health_recovery'      // Leben & Gesundheit / Recovery
  | 'education_career'     // Ausbildung & Beruf
  | 'finances_order'       // Finanzen & Ordnung
  | 'relationships'        // Familie, Freunde & Beziehungen
  | 'spirituality_growth'  // Spiritualität, Sinn & Wachstum
  | 'projects_creativity'  // Projekte & Kreativität
  | 'productivity_daily';  // Produktivität & Alltag

type TrafficLight = 'green' | 'yellow' | 'red';

interface LifeState {
  age: number;           // Step counter
  energy: number;        // 0-100
  mood: Mood;
  curiosity: number;     // 0-100
  goal: Goal;
  xp: number;
  level: number;
  currentSeed: string | null;
  season: Season;
  seasonStep: number;
  unlockedCategories: string[];
  lastCheckIn: Date | null;
}

interface LifeAreaState {
  area: LifeArea;
  status: TrafficLight;
  score: number;         // 0-100
  lastUpdate: Date;
  notes: string;
  activeQuests: string[];
}

interface Quest {
  id: string;
  name: string;
  description: string;
  area: LifeArea;
  type: 'micro' | 'daily' | 'weekly' | 'season' | 'mastery';
  xpReward: number;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

interface DailyCheckIn {
  date: Date;
  mood: number;        // 1-10
  energy: number;      // 1-10
  stress: number;      // 1-10
  craving: number;     // 0-10 (für Recovery)
  notes: string;
  lifeAreas: Partial<Record<LifeArea, TrafficLight>>;
}

// ============================================================================
// MOOD ALCHEMY
// ============================================================================

const MOOD_COMBOS: Record<string, Mood> = {
  'calm+curious': 'attentive',
  'curious+creative': 'inventive',
  'calm+creative': 'poised',
  'engaged+rested': 'ready',
  'curious+calm': 'attentive',
  'creative+curious': 'inventive',
  'creative+calm': 'poised',
  'rested+engaged': 'ready'
};

function alchemizeMoods(mood1: Mood, mood2: Mood): Mood | null {
  const key1 = `${mood1}+${mood2}`;
  const key2 = `${mood2}+${mood1}`;
  return MOOD_COMBOS[key1] || MOOD_COMBOS[key2] || null;
}

// ============================================================================
// SHADOW ACTIONS
// ============================================================================

const SHADOWS: Record<Goal, Goal> = {
  rest: 'explore',
  explore: 'rest',
  learn: 'create',
  create: 'learn',
  connect: 'observe',
  observe: 'connect'
};

function getShadowAction(goal: Goal): Goal {
  return SHADOWS[goal];
}

// ============================================================================
// HABIT DICE
// ============================================================================

const HABIT_IDEAS: Record<Goal, string[]> = {
  observe: [
    '2 Minuten still schauen',
    '1 Foto machen',
    '3 Dinge notieren',
    'Atem beobachten',
    'Umgebung bewusst wahrnehmen'
  ],
  explore: [
    'Neuen Ordner öffnen',
    '5 Minuten spazieren',
    'Neues Lied anspielen',
    'Neue Website besuchen',
    'Etwas Neues probieren'
  ],
  learn: [
    '1 Absatz lesen',
    '1 kleines Tutorial',
    'Eine Frage notieren',
    'Podcast-Snippet hören',
    'Neues Wort nachschlagen'
  ],
  create: [
    'Skizze starten',
    'Eine Zeile Code',
    'Ein Satz schreiben',
    'Idee aufzeichnen',
    'Etwas improvisieren'
  ],
  connect: [
    'Kurze Nachricht senden',
    'Dank notieren',
    'Namen anrufen',
    'Jemanden anlächeln',
    'Hilfe anbieten'
  ],
  rest: [
    'Augen schließen 1 Min',
    'Tiefe Atemzüge',
    'Tee/Wasser trinken',
    'Dehnen',
    'Fenster öffnen'
  ]
};

function rollHabitDice(goal: Goal, mood: Mood): string {
  const ideas = HABIT_IDEAS[goal] || HABIT_IDEAS.observe;
  const index = Math.floor(Math.random() * ideas.length);
  return ideas[index];
}

// ============================================================================
// SEASONS
// ============================================================================

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_LENGTH = 10; // Schritte pro Season

function getSeasonModifiers(season: Season): { energy: number; curiosity: number } {
  switch (season) {
    case 'spring': return { energy: 2, curiosity: 2 };
    case 'summer': return { energy: 1, curiosity: 3 };
    case 'autumn': return { energy: -1, curiosity: 1 };
    case 'winter': return { energy: -2, curiosity: 0 };
  }
}

// ============================================================================
// CURIOSITY CATEGORIES
// ============================================================================

const CURIOSITY_CATEGORIES = [
  'nature', 'music', 'code', 'art', 'story', 'movement', 'focus', 'play'
];

function getUnlockableCategory(curiosity: number, unlocked: string[]): string | null {
  if (curiosity >= 80) {
    const available = CURIOSITY_CATEGORIES.filter(c => !unlocked.includes(c));
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
  }
  return null;
}

// ============================================================================
// XP & LEVEL SYSTEM
// ============================================================================

function calculateLevel(xp: number): number {
  // Formel: Level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

// ============================================================================
// DATABASE
// ============================================================================

const DB_PATH = './data/life-companion.db';
const db = new Database(DB_PATH, { create: true });

db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS life_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    age INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 70,
    mood TEXT DEFAULT 'calm',
    curiosity INTEGER DEFAULT 50,
    goal TEXT DEFAULT 'observe',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_seed TEXT,
    season TEXT DEFAULT 'spring',
    season_step INTEGER DEFAULT 0,
    unlocked_categories TEXT DEFAULT '[]',
    last_checkin INTEGER
  );

  CREATE TABLE IF NOT EXISTS life_areas (
    area TEXT PRIMARY KEY,
    status TEXT DEFAULT 'yellow',
    score INTEGER DEFAULT 50,
    last_update INTEGER,
    notes TEXT DEFAULT '',
    active_quests TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    area TEXT,
    type TEXT DEFAULT 'micro',
    xp_reward INTEGER DEFAULT 10,
    completed INTEGER DEFAULT 0,
    created_at INTEGER,
    completed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS daily_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date INTEGER NOT NULL,
    mood INTEGER,
    energy INTEGER,
    stress INTEGER,
    craving INTEGER DEFAULT 0,
    notes TEXT,
    life_areas TEXT
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    content TEXT,
    timestamp INTEGER,
    mood TEXT,
    energy INTEGER
  );
`);

// Initialize life state if not exists
const existingState = db.query('SELECT id FROM life_state WHERE id = 1').get();
if (!existingState) {
  db.run(`INSERT INTO life_state (id) VALUES (1)`);
}

// Initialize life areas if not exist
const LIFE_AREAS: LifeArea[] = [
  'health_recovery', 'education_career', 'finances_order',
  'relationships', 'spirituality_growth', 'projects_creativity', 'productivity_daily'
];

for (const area of LIFE_AREAS) {
  const existing = db.query('SELECT area FROM life_areas WHERE area = ?').get(area);
  if (!existing) {
    db.run(`INSERT INTO life_areas (area, last_update) VALUES (?, ?)`, [area, Date.now()]);
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function getLifeState(): LifeState {
  const row = db.query('SELECT * FROM life_state WHERE id = 1').get() as any;
  return {
    age: row.age,
    energy: row.energy,
    mood: row.mood as Mood,
    curiosity: row.curiosity,
    goal: row.goal as Goal,
    xp: row.xp,
    level: row.level,
    currentSeed: row.current_seed,
    season: row.season as Season,
    seasonStep: row.season_step,
    unlockedCategories: JSON.parse(row.unlocked_categories || '[]'),
    lastCheckIn: row.last_checkin ? new Date(row.last_checkin) : null
  };
}

function updateLifeState(updates: Partial<LifeState>): LifeState {
  const current = getLifeState();
  const newState = { ...current, ...updates };
  
  // Clamp values
  newState.energy = Math.max(0, Math.min(100, newState.energy));
  newState.curiosity = Math.max(0, Math.min(100, newState.curiosity));
  
  // Recalculate level
  newState.level = calculateLevel(newState.xp);
  
  db.run(`
    UPDATE life_state SET
      age = ?,
      energy = ?,
      mood = ?,
      curiosity = ?,
      goal = ?,
      xp = ?,
      level = ?,
      current_seed = ?,
      season = ?,
      season_step = ?,
      unlocked_categories = ?,
      last_checkin = ?
    WHERE id = 1
  `, [
    newState.age,
    newState.energy,
    newState.mood,
    newState.curiosity,
    newState.goal,
    newState.xp,
    newState.level,
    newState.currentSeed,
    newState.season,
    newState.seasonStep,
    JSON.stringify(newState.unlockedCategories),
    newState.lastCheckIn?.getTime() || null
  ]);
  
  return newState;
}

function getLifeAreas(): LifeAreaState[] {
  const rows = db.query('SELECT * FROM life_areas').all() as any[];
  return rows.map(row => ({
    area: row.area as LifeArea,
    status: row.status as TrafficLight,
    score: row.score,
    lastUpdate: new Date(row.last_update),
    notes: row.notes,
    activeQuests: JSON.parse(row.active_quests || '[]')
  }));
}

function updateLifeArea(area: LifeArea, updates: Partial<LifeAreaState>): void {
  const current = getLifeAreas().find(a => a.area === area);
  if (!current) return;
  
  const newState = { ...current, ...updates, lastUpdate: new Date() };
  
  db.run(`
    UPDATE life_areas SET
      status = ?,
      score = ?,
      last_update = ?,
      notes = ?,
      active_quests = ?
    WHERE area = ?
  `, [
    newState.status,
    newState.score,
    newState.lastUpdate.getTime(),
    newState.notes,
    JSON.stringify(newState.activeQuests),
    area
  ]);
}

// ============================================================================
// ACTIONS
// ============================================================================

const eventBus = getEventBusClient('life-companion');

interface ActionResult {
  success: boolean;
  message: string;
  state: LifeState;
  suggestion?: string;
  unlocked?: string;
}

async function performAction(action: Goal): Promise<ActionResult> {
  let state = getLifeState();
  const seasonMod = getSeasonModifiers(state.season);
  
  // Apply action effects
  let energyChange = 0;
  let curiosityChange = 0;
  let xpGain = 5;
  let message = '';
  
  switch (action) {
    case 'explore':
      energyChange = -5;
      curiosityChange = 10;
      xpGain = 10;
      message = '🌍 Du hast etwas Neues entdeckt!';
      break;
    case 'rest':
      energyChange = 15;
      curiosityChange = -5;
      xpGain = 5;
      message = '😴 Du hast dich erholt.';
      break;
    case 'learn':
      energyChange = -8;
      curiosityChange = 15;
      xpGain = 15;
      message = '📚 Du hast etwas gelernt!';
      break;
    case 'create':
      energyChange = -10;
      curiosityChange = 5;
      xpGain = 20;
      message = '🎨 Du hast etwas erschaffen!';
      break;
    case 'connect':
      energyChange = -3;
      curiosityChange = 8;
      xpGain = 12;
      message = '🤝 Du hast dich verbunden.';
      break;
    case 'observe':
      energyChange = 0;
      curiosityChange = 5;
      xpGain = 5;
      message = '👁️ Du hast beobachtet.';
      break;
  }
  
  // Apply season modifiers
  energyChange += seasonMod.energy;
  curiosityChange += seasonMod.curiosity;
  
  // Apply seed bonus
  if (state.currentSeed) {
    energyChange += 2;
    curiosityChange += 2;
  }
  
  // Update state
  const newEnergy = state.energy + energyChange;
  const newCuriosity = state.curiosity + curiosityChange;
  const newXp = state.xp + xpGain;
  
  // Check for season change
  let newSeasonStep = state.seasonStep + 1;
  let newSeason = state.season;
  if (newSeasonStep >= SEASON_LENGTH) {
    newSeasonStep = 0;
    const currentIndex = SEASONS.indexOf(state.season);
    newSeason = SEASONS[(currentIndex + 1) % SEASONS.length];
    message += ` 🌸 Neue Jahreszeit: ${newSeason}!`;
  }
  
  // Check for category unlock
  let unlocked: string | undefined;
  if (newCuriosity >= 80) {
    const newCategory = getUnlockableCategory(newCuriosity, state.unlockedCategories);
    if (newCategory) {
      unlocked = newCategory;
      message += ` ✨ Kategorie freigeschaltet: ${newCategory}!`;
    }
  }
  
  // Update state
  state = updateLifeState({
    age: state.age + 1,
    energy: newEnergy,
    curiosity: newCuriosity,
    goal: action,
    xp: newXp,
    season: newSeason,
    seasonStep: newSeasonStep,
    unlockedCategories: unlocked 
      ? [...state.unlockedCategories, unlocked]
      : state.unlockedCategories
  });
  
  // Emit events
  await eventBus.emitEnergyChange(state.energy - energyChange, state.energy, action);
  
  if (unlocked) {
    await eventBus.emitInsight(`Neue Kategorie freigeschaltet: ${unlocked}`, { action });
  }
  
  // Get suggestion
  const suggestion = rollHabitDice(action, state.mood);
  
  return {
    success: true,
    message,
    state,
    suggestion,
    unlocked
  };
}

async function changeMood(newMood: Mood): Promise<ActionResult> {
  const state = getLifeState();
  const oldMood = state.mood;
  
  // Try alchemy
  const alchemizedMood = alchemizeMoods(oldMood, newMood);
  const finalMood = alchemizedMood || newMood;
  
  const updatedState = updateLifeState({ mood: finalMood });
  
  await eventBus.emitMoodChange(oldMood, finalMood, alchemizedMood ? 'Mood Alchemy!' : undefined);
  
  return {
    success: true,
    message: alchemizedMood 
      ? `✨ Mood Alchemy! ${oldMood} + ${newMood} = ${finalMood}`
      : `Stimmung geändert zu: ${finalMood}`,
    state: updatedState
  };
}

async function setSeed(seed: string): Promise<ActionResult> {
  const state = updateLifeState({ currentSeed: seed });
  
  return {
    success: true,
    message: `🌱 Neuer Fokus-Samen: "${seed}" - Du erhältst +2 Energy und +2 Curiosity Bonus!`,
    state
  };
}

async function completeQuest(questId: string): Promise<ActionResult> {
  const quest = db.query('SELECT * FROM quests WHERE id = ?').get(questId) as any;
  
  if (!quest) {
    return {
      success: false,
      message: 'Quest nicht gefunden',
      state: getLifeState()
    };
  }
  
  if (quest.completed) {
    return {
      success: false,
      message: 'Quest bereits abgeschlossen',
      state: getLifeState()
    };
  }
  
  db.run('UPDATE quests SET completed = 1, completed_at = ? WHERE id = ?', [Date.now(), questId]);
  
  const state = getLifeState();
  const newXp = state.xp + quest.xp_reward;
  const updatedState = updateLifeState({ xp: newXp });
  
  await eventBus.emitQuestComplete(quest.name, quest.xp_reward);
  
  return {
    success: true,
    message: `🎉 Quest abgeschlossen: "${quest.name}" - +${quest.xp_reward} XP!`,
    state: updatedState
  };
}

async function dailyCheckIn(checkIn: Omit<DailyCheckIn, 'date'>): Promise<ActionResult> {
  const now = new Date();
  
  db.run(`
    INSERT INTO daily_checkins (date, mood, energy, stress, craving, notes, life_areas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    now.getTime(),
    checkIn.mood,
    checkIn.energy,
    checkIn.stress,
    checkIn.craving,
    checkIn.notes,
    JSON.stringify(checkIn.lifeAreas)
  ]);
  
  // Update life areas based on check-in
  if (checkIn.lifeAreas) {
    for (const [area, status] of Object.entries(checkIn.lifeAreas)) {
      updateLifeArea(area as LifeArea, { status: status as TrafficLight });
    }
  }
  
  // Award XP for check-in
  const state = getLifeState();
  const updatedState = updateLifeState({ 
    xp: state.xp + 25,
    lastCheckIn: now 
  });
  
  await eventBus.publish('life_state_changed', {
    type: 'daily_checkin',
    mood: checkIn.mood,
    energy: checkIn.energy,
    stress: checkIn.stress
  }, { importance: 60, tags: ['checkin', 'life-companion'] });
  
  return {
    success: true,
    message: `📋 Täglicher Check-in gespeichert! +25 XP`,
    state: updatedState
  };
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
const server = createServer(app);

app.use(express.json());

// CORS für Dashboard
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health
app.get('/health', (req, res) => {
  const state = getLifeState();
  res.json({
    status: 'ok',
    service: 'life-companion',
    port: 8970,
    state: {
      energy: state.energy,
      mood: state.mood,
      level: state.level,
      season: state.season
    }
  });
});

// Get current state
app.get('/state', (req, res) => {
  res.json({
    success: true,
    state: getLifeState(),
    lifeAreas: getLifeAreas(),
    xpToNextLevel: xpForNextLevel(getLifeState().level)
  });
});

// Perform action
app.post('/action/:action', async (req, res) => {
  const action = req.params.action as Goal;
  const validActions: Goal[] = ['observe', 'explore', 'learn', 'create', 'connect', 'rest'];
  
  if (!validActions.includes(action)) {
    return res.status(400).json({ success: false, error: 'Invalid action' });
  }
  
  const result = await performAction(action);
  res.json(result);
});

// Shadow action
app.get('/shadow', (req, res) => {
  const state = getLifeState();
  const shadow = getShadowAction(state.goal);
  res.json({ 
    currentGoal: state.goal,
    shadowAction: shadow,
    suggestion: `Probier mal das Gegenteil: ${shadow}`
  });
});

// Change mood
app.post('/mood', async (req, res) => {
  const { mood } = req.body;
  const validMoods: Mood[] = ['calm', 'curious', 'creative', 'engaged', 'rested'];
  
  if (!validMoods.includes(mood)) {
    return res.status(400).json({ success: false, error: 'Invalid mood' });
  }
  
  const result = await changeMood(mood);
  res.json(result);
});

// Set seed
app.post('/seed', async (req, res) => {
  const { seed } = req.body;
  
  if (!seed || typeof seed !== 'string') {
    return res.status(400).json({ success: false, error: 'Seed required' });
  }
  
  const result = await setSeed(seed);
  res.json(result);
});

// Habit dice
app.get('/habit-dice', (req, res) => {
  const state = getLifeState();
  const habit = rollHabitDice(state.goal, state.mood);
  res.json({
    goal: state.goal,
    mood: state.mood,
    suggestion: habit
  });
});

// Get/Create quests
app.get('/quests', (req, res) => {
  const quests = db.query('SELECT * FROM quests ORDER BY created_at DESC').all();
  res.json({ success: true, quests });
});

app.post('/quests', (req, res) => {
  const { name, description, area, type, xpReward } = req.body;
  const id = `quest_${Date.now()}`;
  
  db.run(`
    INSERT INTO quests (id, name, description, area, type, xp_reward, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, name, description, area, type || 'micro', xpReward || 10, Date.now()]);
  
  res.json({ success: true, questId: id });
});

// Complete quest
app.post('/quests/:id/complete', async (req, res) => {
  const result = await completeQuest(req.params.id);
  res.json(result);
});

// Daily check-in
app.post('/checkin', async (req, res) => {
  const result = await dailyCheckIn(req.body);
  res.json(result);
});

app.get('/checkins', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const checkins = db.query('SELECT * FROM daily_checkins ORDER BY date DESC LIMIT ?').all(limit);
  res.json({ success: true, checkins });
});

// Life areas
app.get('/life-areas', (req, res) => {
  res.json({ success: true, areas: getLifeAreas() });
});

app.patch('/life-areas/:area', (req, res) => {
  const area = req.params.area as LifeArea;
  const updates = req.body;
  
  updateLifeArea(area, updates);
  
  res.json({ success: true, area: getLifeAreas().find(a => a.area === area) });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 8970;

server.listen(PORT, async () => {
  console.log('');
  console.log('🌟 ═════════════════════════════════════════════════════════');
  console.log('🌟  LIFE COMPANION CORE v1.0');
  console.log('🌟 ═════════════════════════════════════════════════════════');
  console.log('🌟');
  console.log(`🌟  🌐 Server: http://localhost:${PORT}`);
  console.log(`🌟  📊 Health: http://localhost:${PORT}/health`);
  console.log(`🌟  🎮 State: http://localhost:${PORT}/state`);
  console.log('🌟');
  console.log('🌟  7 Lebensbereiche:');
  console.log('🌟    ❤️ Health & Recovery');
  console.log('🌟    📚 Education & Career');
  console.log('🌟    💰 Finances & Order');
  console.log('🌟    👨‍👩‍👧‍👦 Relationships');
  console.log('🌟    🙏 Spirituality & Growth');
  console.log('🌟    🎨 Projects & Creativity');
  console.log('🌟    ⚡ Productivity & Daily');
  console.log('🌟');
  console.log('🌟  Features:');
  console.log('🌟    ✓ Mood Alchemy');
  console.log('🌟    ✓ Shadow Actions');
  console.log('🌟    ✓ Habit Dice');
  console.log('🌟    ✓ Seeds & Seasons');
  console.log('🌟    ✓ Quest System');
  console.log('🌟    ✓ Daily Check-in');
  console.log('🌟');
  console.log('🌟 ═════════════════════════════════════════════════════════');
  console.log('');

  // Notify Event Bus
  await eventBus.emitServiceStarted([
    'life-state', 'mood-alchemy', 'habit-dice', 'quests', 
    'daily-checkin', 'life-areas', 'seasons', 'seeds'
  ]);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🌟 Closing Life Companion...');
  await eventBus.emitServiceStopped('Graceful shutdown');
  db.close();
  server.close(() => {
    console.log('🌟 Life Companion closed gracefully');
    process.exit(0);
  });
});
