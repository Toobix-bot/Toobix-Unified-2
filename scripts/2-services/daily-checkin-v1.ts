/**
 * 📋 DAILY CHECK-IN SERVICE v1.0
 * 
 * Interaktiver täglicher Check-in für:
 * - Stimmung (1-10)
 * - Energie (1-10)
 * - Stress (1-10)
 * - Craving/Trigger (0-10, für Recovery)
 * - 7 Lebensbereiche Ampel
 * - Freitext-Notizen
 * 
 * Port: 8972
 */

import express from 'express';
import { createServer } from 'http';
import { Database } from 'bun:sqlite';
import { getEventBusClient } from '../../src/modules/event-bus-client';

// ============================================================================
// TYPES
// ============================================================================

type TrafficLight = 'green' | 'yellow' | 'red';

type LifeArea = 
  | 'health_recovery'
  | 'education_career'
  | 'finances_order'
  | 'relationships'
  | 'spirituality_growth'
  | 'projects_creativity'
  | 'productivity_daily';

interface DailyCheckIn {
  id: string;
  date: string;
  time: string;
  mood: number;
  energy: number;
  stress: number;
  craving: number;
  lifeAreas: Record<LifeArea, TrafficLight>;
  wins: string[];
  challenges: string[];
  gratitude: string[];
  intentions: string[];
  notes: string;
  createdAt: Date;
}

interface CheckInStats {
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  moodTrend: 'up' | 'stable' | 'down';
  energyTrend: 'up' | 'stable' | 'down';
}

// ============================================================================
// LIFE AREA METADATA
// ============================================================================

const LIFE_AREAS: Record<LifeArea, { name: string; emoji: string; description: string }> = {
  health_recovery: {
    name: 'Gesundheit & Recovery',
    emoji: '❤️',
    description: 'Körperliche/mentale Gesundheit, Sucht-Recovery, Selbstfürsorge'
  },
  education_career: {
    name: 'Ausbildung & Beruf',
    emoji: '📚',
    description: 'Lernen, Karriere, berufliche Entwicklung'
  },
  finances_order: {
    name: 'Finanzen & Ordnung',
    emoji: '💰',
    description: 'Geld, Budgets, Haushalt, Organisation'
  },
  relationships: {
    name: 'Beziehungen',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Familie, Freunde, Partner, soziale Kontakte'
  },
  spirituality_growth: {
    name: 'Spiritualität & Wachstum',
    emoji: '🙏',
    description: 'Sinn, Werte, persönliches Wachstum, Meditation'
  },
  projects_creativity: {
    name: 'Projekte & Kreativität',
    emoji: '🎨',
    description: 'Kreative Projekte, Hobbies, Side-Projects'
  },
  productivity_daily: {
    name: 'Produktivität & Alltag',
    emoji: '⚡',
    description: 'Tägliche Routinen, Habits, Produktivität'
  }
};

// ============================================================================
// DATABASE
// ============================================================================

const DB_PATH = './data/daily-checkins.db';
const db = new Database(DB_PATH, { create: true });

db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    mood INTEGER,
    energy INTEGER,
    stress INTEGER,
    craving INTEGER DEFAULT 0,
    life_areas TEXT,
    wins TEXT,
    challenges TEXT,
    gratitude TEXT,
    intentions TEXT,
    notes TEXT,
    created_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
`);

// ============================================================================
// CHECK-IN MANAGEMENT
// ============================================================================

function generateId(): string {
  return `checkin_${Date.now()}`;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime(): string {
  return new Date().toTimeString().split(' ')[0].slice(0, 5);
}

function createCheckIn(data: Partial<DailyCheckIn>): DailyCheckIn {
  const id = generateId();
  const date = data.date || getTodayDate();
  const time = data.time || getCurrentTime();
  
  const checkIn: DailyCheckIn = {
    id,
    date,
    time,
    mood: data.mood || 5,
    energy: data.energy || 5,
    stress: data.stress || 5,
    craving: data.craving || 0,
    lifeAreas: data.lifeAreas || {
      health_recovery: 'yellow',
      education_career: 'yellow',
      finances_order: 'yellow',
      relationships: 'yellow',
      spirituality_growth: 'yellow',
      projects_creativity: 'yellow',
      productivity_daily: 'yellow'
    },
    wins: data.wins || [],
    challenges: data.challenges || [],
    gratitude: data.gratitude || [],
    intentions: data.intentions || [],
    notes: data.notes || '',
    createdAt: new Date()
  };

  // Save to database
  db.run(`
    INSERT INTO checkins (id, date, time, mood, energy, stress, craving, life_areas, wins, challenges, gratitude, intentions, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    checkIn.id,
    checkIn.date,
    checkIn.time,
    checkIn.mood,
    checkIn.energy,
    checkIn.stress,
    checkIn.craving,
    JSON.stringify(checkIn.lifeAreas),
    JSON.stringify(checkIn.wins),
    JSON.stringify(checkIn.challenges),
    JSON.stringify(checkIn.gratitude),
    JSON.stringify(checkIn.intentions),
    checkIn.notes,
    checkIn.createdAt.getTime()
  ]);

  return checkIn;
}

function getCheckIn(id: string): DailyCheckIn | null {
  const row = db.query('SELECT * FROM checkins WHERE id = ?').get(id) as any;
  if (!row) return null;
  
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    mood: row.mood,
    energy: row.energy,
    stress: row.stress,
    craving: row.craving,
    lifeAreas: JSON.parse(row.life_areas),
    wins: JSON.parse(row.wins || '[]'),
    challenges: JSON.parse(row.challenges || '[]'),
    gratitude: JSON.parse(row.gratitude || '[]'),
    intentions: JSON.parse(row.intentions || '[]'),
    notes: row.notes,
    createdAt: new Date(row.created_at)
  };
}

function getTodayCheckIn(): DailyCheckIn | null {
  const today = getTodayDate();
  const row = db.query('SELECT * FROM checkins WHERE date = ? ORDER BY created_at DESC LIMIT 1').get(today) as any;
  if (!row) return null;
  return getCheckIn(row.id);
}

function getCheckInHistory(days: number = 30): DailyCheckIn[] {
  const rows = db.query(`
    SELECT * FROM checkins 
    ORDER BY date DESC, time DESC 
    LIMIT ?
  `).all(days) as any[];
  
  return rows.map(row => ({
    id: row.id,
    date: row.date,
    time: row.time,
    mood: row.mood,
    energy: row.energy,
    stress: row.stress,
    craving: row.craving,
    lifeAreas: JSON.parse(row.life_areas),
    wins: JSON.parse(row.wins || '[]'),
    challenges: JSON.parse(row.challenges || '[]'),
    gratitude: JSON.parse(row.gratitude || '[]'),
    intentions: JSON.parse(row.intentions || '[]'),
    notes: row.notes,
    createdAt: new Date(row.created_at)
  }));
}

function calculateStats(): CheckInStats {
  const history = getCheckInHistory(30);
  
  if (history.length === 0) {
    return {
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      moodTrend: 'stable',
      energyTrend: 'stable'
    };
  }

  // Calculate averages
  const avgMood = history.reduce((sum, c) => sum + c.mood, 0) / history.length;
  const avgEnergy = history.reduce((sum, c) => sum + c.energy, 0) / history.length;
  const avgStress = history.reduce((sum, c) => sum + c.stress, 0) / history.length;

  // Calculate streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const dates = [...new Set(history.map(c => c.date))].sort().reverse();
  const today = getTodayDate();
  
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    
    if (dates.includes(expectedStr)) {
      tempStreak++;
      if (i === dates.length - 1 || !dates.includes(expectedStr)) {
        currentStreak = tempStreak;
      }
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  // Calculate trends (last 7 vs previous 7)
  const recent = history.slice(0, 7);
  const previous = history.slice(7, 14);
  
  let moodTrend: 'up' | 'stable' | 'down' = 'stable';
  let energyTrend: 'up' | 'stable' | 'down' = 'stable';
  
  if (recent.length > 0 && previous.length > 0) {
    const recentMood = recent.reduce((s, c) => s + c.mood, 0) / recent.length;
    const prevMood = previous.reduce((s, c) => s + c.mood, 0) / previous.length;
    moodTrend = recentMood > prevMood + 0.5 ? 'up' : recentMood < prevMood - 0.5 ? 'down' : 'stable';
    
    const recentEnergy = recent.reduce((s, c) => s + c.energy, 0) / recent.length;
    const prevEnergy = previous.reduce((s, c) => s + c.energy, 0) / previous.length;
    energyTrend = recentEnergy > prevEnergy + 0.5 ? 'up' : recentEnergy < prevEnergy - 0.5 ? 'down' : 'stable';
  }

  return {
    totalCheckIns: history.length,
    currentStreak,
    longestStreak,
    averageMood: Math.round(avgMood * 10) / 10,
    averageEnergy: Math.round(avgEnergy * 10) / 10,
    averageStress: Math.round(avgStress * 10) / 10,
    moodTrend,
    energyTrend
  };
}

// ============================================================================
// EVENT BUS
// ============================================================================

const eventBus = getEventBusClient('daily-checkin');

async function emitCheckInComplete(checkIn: DailyCheckIn) {
  await eventBus.publish('life_state_changed', {
    type: 'daily_checkin',
    mood: checkIn.mood,
    energy: checkIn.energy,
    stress: checkIn.stress,
    craving: checkIn.craving,
    lifeAreas: checkIn.lifeAreas,
    date: checkIn.date
  }, {
    importance: 70,
    tags: ['checkin', 'life-companion', 'daily']
  });

  // Update Life Companion with new values
  try {
    const energyPercent = checkIn.energy * 10;
    await fetch('http://localhost:8970/state', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ energy: energyPercent })
    });
  } catch (e) {
    console.log('Could not sync with Life Companion');
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
const server = createServer(app);

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health
app.get('/health', (req, res) => {
  const stats = calculateStats();
  res.json({
    status: 'ok',
    service: 'daily-checkin',
    port: 8972,
    stats: {
      totalCheckIns: stats.totalCheckIns,
      currentStreak: stats.currentStreak
    }
  });
});

// Get life areas metadata
app.get('/life-areas', (req, res) => {
  res.json({ success: true, areas: LIFE_AREAS });
});

// Get today's check-in
app.get('/today', (req, res) => {
  const checkIn = getTodayCheckIn();
  res.json({ 
    success: true, 
    hasCheckedIn: !!checkIn,
    checkIn 
  });
});

// Create new check-in
app.post('/checkin', async (req, res) => {
  try {
    const checkIn = createCheckIn(req.body);
    await emitCheckInComplete(checkIn);
    
    const stats = calculateStats();
    
    res.json({ 
      success: true, 
      checkIn,
      message: `Check-in gespeichert! 🎉 Streak: ${stats.currentStreak} Tage`,
      stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get check-in history
app.get('/history', (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const history = getCheckInHistory(days);
  res.json({ success: true, history });
});

// Get statistics
app.get('/stats', (req, res) => {
  const stats = calculateStats();
  res.json({ success: true, stats });
});

// Get check-in by ID
app.get('/checkin/:id', (req, res) => {
  const checkIn = getCheckIn(req.params.id);
  if (!checkIn) {
    return res.status(404).json({ success: false, error: 'Check-in not found' });
  }
  res.json({ success: true, checkIn });
});

// Quick mood update
app.post('/quick', async (req, res) => {
  const { mood, energy, stress } = req.body;
  
  const existing = getTodayCheckIn();
  if (existing) {
    // Update existing
    db.run(`
      UPDATE checkins SET mood = ?, energy = ?, stress = ? WHERE id = ?
    `, [mood || existing.mood, energy || existing.energy, stress || existing.stress, existing.id]);
    
    res.json({ success: true, message: 'Quick update gespeichert', updated: true });
  } else {
    // Create minimal check-in
    const checkIn = createCheckIn({ mood, energy, stress });
    await emitCheckInComplete(checkIn);
    res.json({ success: true, message: 'Quick check-in erstellt', checkIn });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 8972;

server.listen(PORT, async () => {
  console.log('');
  console.log('📋 ═════════════════════════════════════════════════════════');
  console.log('📋  DAILY CHECK-IN SERVICE v1.0');
  console.log('📋 ═════════════════════════════════════════════════════════');
  console.log('📋');
  console.log(`📋  🌐 Server: http://localhost:${PORT}`);
  console.log('📋');
  console.log('📋  7 Lebensbereiche:');
  Object.entries(LIFE_AREAS).forEach(([key, area]) => {
    console.log(`📋    ${area.emoji} ${area.name}`);
  });
  console.log('📋');
  console.log('📋  Features:');
  console.log('📋    ✓ Mood/Energy/Stress Tracking');
  console.log('📋    ✓ Craving Level (Recovery)');
  console.log('📋    ✓ Ampelsystem (🟢🟡🔴)');
  console.log('📋    ✓ Wins & Challenges');
  console.log('📋    ✓ Gratitude Journal');
  console.log('📋    ✓ Streak Tracking');
  console.log('📋');
  console.log('📋 ═════════════════════════════════════════════════════════');
  console.log('');

  await eventBus.emitServiceStarted([
    'daily-checkin', 'life-areas', 'streak-tracking', 
    'mood-tracking', 'gratitude-journal'
  ]);
  
  const stats = calculateStats();
  console.log(`📋 Current streak: ${stats.currentStreak} days | Total check-ins: ${stats.totalCheckIns}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📋 Closing Daily Check-in Service...');
  await eventBus.emitServiceStopped('Graceful shutdown');
  db.close();
  server.close(() => {
    console.log('📋 Daily Check-in Service closed gracefully');
    process.exit(0);
  });
});
