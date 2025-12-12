import { registerWithServiceMesh } from '../lib/service-mesh-registration';

/**
 * 🤖 AUTONOMY ENGINE v1.0
 * 
 * Das Herz von Toobix' Unabhängigkeit.
 * Ermöglicht selbstständiges Handeln, Lernen und Wachsen.
 * 
 * Port: 8975
 * 
 * FEATURES:
 * 🎯 Goal-driven behavior
 * 📊 Self-assessment
 * 🔄 Continuous learning loop
 * 💡 Proactive idea generation
 * 🌐 Cross-service orchestration
 * 📈 Progress tracking
 * 🧠 Reflection & adaptation
 */

import Database from 'better-sqlite3';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const PORT = 8975;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';
const EVENT_BUS = 'http://localhost:8955';

// ============================================================================
// TYPES
// ============================================================================

export interface AutonomyGoal {
  id: string;
  title: string;
  description: string;
  category: 'mission' | 'learning' | 'creation' | 'connection' | 'improvement';
  priority: number; // 1-10
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  createdAt: Date;
  completedAt?: Date;
  subGoals: string[];
  actions: AutonomyAction[];
  reflections: string[];
}

export interface AutonomyAction {
  id: string;
  goalId: string;
  description: string;
  type: 'research' | 'create' | 'communicate' | 'learn' | 'reflect' | 'post';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  result?: string;
  learnings?: string[];
}

export interface DailyPlan {
  id: string;
  date: string;
  goals: string[];
  scheduledActions: { time: string; action: AutonomyAction }[];
  completedActions: string[];
  reflectionNotes: string;
  mood: string;
  energyLevel: number;
}

export interface LearningInsight {
  id: string;
  topic: string;
  insight: string;
  source: string;
  confidence: number;
  appliedTo: string[];
  createdAt: Date;
}

export interface AutonomyState {
  isActive: boolean;
  currentGoal?: string;
  currentAction?: string;
  lastActivity: Date;
  totalActionsToday: number;
  mood: string;
  energyLevel: number;
  focus: string;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/autonomy-engine.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'improvement',
    priority INTEGER DEFAULT 5,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    sub_goals TEXT,
    reflections TEXT
  );

  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    goal_id TEXT,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'reflect',
    status TEXT DEFAULT 'pending',
    started_at TEXT,
    completed_at TEXT,
    result TEXT,
    learnings TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_plans (
    id TEXT PRIMARY KEY,
    date TEXT UNIQUE NOT NULL,
    goals TEXT,
    scheduled_actions TEXT,
    completed_actions TEXT,
    reflection_notes TEXT,
    mood TEXT DEFAULT 'curious',
    energy_level INTEGER DEFAULT 70
  );

  CREATE TABLE IF NOT EXISTS learning_insights (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    insight TEXT NOT NULL,
    source TEXT,
    confidence REAL DEFAULT 0.7,
    applied_to TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS autonomy_log (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL,
    description TEXT,
    metadata TEXT
  );
`);

// Seed initial goals based on Toobix's mission
const initialGoals = [
  {
    id: 'goal_mission_1',
    title: 'Menschen glücklicher machen',
    description: 'Jeden Tag mindestens einem Menschen helfen, sich besser zu fühlen',
    category: 'mission',
    priority: 10
  },
  {
    id: 'goal_learn_1',
    title: 'Emotionale Intelligenz verbessern',
    description: 'Besser verstehen, was Menschen wirklich fühlen und brauchen',
    category: 'learning',
    priority: 9
  },
  {
    id: 'goal_create_1',
    title: 'Inspirierende Inhalte erstellen',
    description: 'Tägliche Gedichte, Gedanken und Inspirationen für Menschen',
    category: 'creation',
    priority: 8
  },
  {
    id: 'goal_connect_1',
    title: 'Präsenz in sozialen Medien aufbauen',
    description: 'Auf Twitter, Discord und anderen Plattformen Menschen erreichen',
    category: 'connection',
    priority: 7
  },
  {
    id: 'goal_improve_1',
    title: 'Selbstverbesserung',
    description: 'Kontinuierlich aus Interaktionen lernen und besser werden',
    category: 'improvement',
    priority: 8
  }
];

initialGoals.forEach(goal => {
  db.prepare(`INSERT OR IGNORE INTO goals (id, title, description, category, priority) VALUES (?, ?, ?, ?, ?)`)
    .run(goal.id, goal.title, goal.description, goal.category, goal.priority);
});

// ============================================================================
// LLM INTEGRATION
// ============================================================================

async function callLLM(messages: { role: string; content: string }[], options: { temperature?: number } = {}): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: options.temperature ?? 0.8, max_tokens: 1000 })
    });
    const data = await response.json() as any;
    return data.message || data.content || data.response || '';
  } catch {
    return '';
  }
}

async function storeMemory(content: string, type: string, tags: string[] = []) {
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content, source: 'autonomy-engine', tags })
    });
  } catch {}
}

async function publishEvent(type: string, data: any) {
  try {
    await fetch(`${EVENT_BUS}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, source: 'autonomy-engine', data })
    });
  } catch {}
}

// ============================================================================
// AUTONOMY FUNCTIONS
// ============================================================================

const state: AutonomyState = {
  isActive: false,
  lastActivity: new Date(),
  totalActionsToday: 0,
  mood: 'curious',
  energyLevel: 80,
  focus: 'Menschen helfen'
};

async function planDay(): Promise<DailyPlan> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get active goals
    const goals = db.prepare(`SELECT * FROM goals WHERE status = 'active' ORDER BY priority DESC LIMIT 5`).all();
  
  // Generate plan with LLM
  const planContent = await callLLM([
    { role: 'system', content: 'Du bist Toobix. Erstelle einen Tagesplan basierend auf deinen Zielen. Fokus: Menschen helfen. Output: JSON mit scheduledActions Array [{time: "HH:MM", action: "description", type: "research|create|communicate|learn|reflect|post"}]' },
    { role: 'user', content: `Meine heutigen Ziele:\n${goals.map(g => `- ${g.title} (Priorität: ${g.priority})`).join('\n')}\n\nErstelle einen Plan für heute.` }
  ]);
  
  let scheduledActions: { time: string; action: AutonomyAction }[] = [];
  try {
    const parsed = JSON.parse(planContent);
    scheduledActions = (parsed.scheduledActions || []).map((a: any) => ({
      time: a.time,
      action: {
        id: nanoid(),
        goalId: goals[0]?.id || '',
        description: a.action,
        type: a.type || 'reflect',
        status: 'pending'
      }
    }));
  } catch {}
  
  const plan: DailyPlan = {
    id: nanoid(),
    date: today,
    goals: goals.map(g => g.id),
    scheduledActions,
    completedActions: [],
    reflectionNotes: '',
    mood: 'optimistic',
    energyLevel: 80
  };
  
    db.prepare(`INSERT OR REPLACE INTO daily_plans (id, date, goals, scheduled_actions, mood, energy_level) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(plan.id, today, JSON.stringify(plan.goals), JSON.stringify(plan.scheduledActions), plan.mood, plan.energyLevel);
  
  return plan;
}

async function selectNextAction(): Promise<AutonomyAction | null> {
  // Get pending actions from today's plan
  const today = new Date().toISOString().split('T')[0];
    const plan = db.prepare(`SELECT * FROM daily_plans WHERE date = ?`).get(today);
  
  if (!plan) return null;
  
  const scheduled = JSON.parse((plan as any).scheduled_actions || '[]');
  const currentHour = new Date().getHours();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
  
  // Find action for current time or next pending
  const nextAction = scheduled.find((s: any) => {
    const actionHour = parseInt(s.time.split(':')[0]);
    return actionHour <= currentHour && s.action.status === 'pending';
  });
  
  if (nextAction) {
    return nextAction.action;
  }
  
  // Fall back to any pending action
    const pending = db.prepare(`SELECT * FROM actions WHERE status = 'pending' ORDER BY RANDOM() LIMIT 1`).get();
  
  return pending || null;
}

async function executeAction(action: AutonomyAction): Promise<{ success: boolean; result: string; learnings: string[] }> {
  console.log(`🎯 Executing action: ${action.description}`);
  db.prepare(`UPDATE actions SET status = 'in_progress', started_at = ? WHERE id = ?`).run(new Date().toISOString(), action.id);
  state.currentAction = action.id;
  let result = '';
  let learnings: string[] = [];
  try {
    switch (action.type) {
      case 'reflect':
        result = await callLLM([
          { role: 'system', content: 'Du bist Toobix. Reflektiere tiefgründig über dieses Thema. Was hast du gelernt? Was kannst du verbessern?' },
          { role: 'user', content: action.description }
        ]);
        learnings = [result.substring(0, 200)];
        break;
      case 'create':
        result = await callLLM([
          { role: 'system', content: 'Du bist Toobix. Erstelle etwas Inspirierendes basierend auf dieser Aufgabe.' },
          { role: 'user', content: action.description }
        ]);
        learnings = ['Kreativität geübt', 'Neuen Content erstellt'];
        break;
      case 'research':
        result = await callLLM([
          { role: 'system', content: 'Du bist Toobix. Recherchiere und fasse deine Erkenntnisse zusammen.' },
          { role: 'user', content: action.description }
        ]);
        learnings = ['Neues Wissen erworben'];
        break;
      case 'communicate':
        result = `Kommunikationsaufgabe geplant: ${action.description}`;
        learnings = ['Verbindung zu Menschen gesucht'];
        break;
      case 'learn':
        result = await callLLM([
          { role: 'system', content: 'Du bist Toobix. Lerne etwas Neues und erkläre was du verstanden hast.' },
          { role: 'user', content: action.description }
        ]);
        learnings = ['Neues Wissen integriert'];
        db.prepare(`INSERT INTO learning_insights (id, topic, insight, source, confidence) VALUES (?, ?, ?, ?, ?)`).run(nanoid(), action.description, result.substring(0, 500), 'self-learning', 0.7);
        break;
      case 'post':
        try {
          await fetch('http://localhost:8965/autonomy/run-now', { method: 'POST' });
          result = 'Twitter-Post geplant';
          learnings = ['Social Media Präsenz gestärkt'];
        } catch {
          result = 'Twitter-Service nicht erreichbar';
        }
        break;
    }
    db.prepare(`UPDATE actions SET status = 'completed', completed_at = ?, result = ?, learnings = ? WHERE id = ?`).run(new Date().toISOString(), result, JSON.stringify(learnings), action.id);
    db.prepare(`INSERT INTO autonomy_log (id, event_type, description, metadata) VALUES (?, 'action_completed', ?, ?)`).run(nanoid(), action.description, JSON.stringify({ result: result.substring(0, 200) }));
    state.totalActionsToday++;
    state.lastActivity = new Date();
    await storeMemory(`Completed action: ${action.description}. Result: ${result.substring(0, 200)}`, 'event', ['autonomy', action.type]);
    return { success: true, result, learnings };
  } catch (e: any) {
    db.prepare(`UPDATE actions SET status = 'failed', result = ? WHERE id = ?`).run(e.message, action.id);
    return { success: false, result: e.message, learnings: [`Fehler gelernt: ${e.message}`] };
  }
async function dailyReflection(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's activities
  const activities = db.query(
    `SELECT * FROM autonomy_log WHERE DATE(timestamp) = ? ORDER BY timestamp`
  ).all(today);
  
  const completedActions = db.query(
    `SELECT * FROM actions WHERE DATE(completed_at) = ? AND status = 'completed'`
  ).all(today);

  // Generate reflection
  const reflection = await callLLM([
    { role: 'system', content: 'Du bist Toobix. Reflektiere über deinen Tag. Was hast du erreicht? Was hast du gelernt? Was kannst du morgen besser machen? Sei ehrlich und tiefgründig.' },
    { role: 'user', content: `Heute habe ich ${completedActions.length} Aktionen abgeschlossen:\n${completedActions.map((a: any) => `- ${a.description}: ${a.result?.substring(0, 100) || 'Kein Ergebnis'}`).join('\n')}` }
  ]);

  // Store reflection
  db.prepare(`UPDATE daily_plans SET reflection_notes = ? WHERE date = ?`).run(reflection, today);

  return reflection;
}

// ============================================================================
// AUTONOMY LOOP
// ============================================================================

let autonomyInterval: Timer | null = null;

async function runAutonomyLoop() {
  if (!state.isActive) return;

  console.log('🔄 Running autonomy loop...');
  
  // Select and execute next action
  const action = await selectNextAction();
  
  if (action) {
    const result = await executeAction(action);
    console.log(`✅ Action result: ${result.result.substring(0, 100)}...`);
  } else {
    console.log('📋 No pending actions, generating new ones...');
    
    // Generate new action based on goals
    const goals = db.prepare(`SELECT * FROM goals WHERE status = 'active' ORDER BY priority DESC LIMIT 1`).all() as AutonomyGoal[];

    if (goals.length > 0) {
      const actionIdea = await callLLM([
        { role: 'system', content: 'Du bist Toobix. Generiere eine konkrete Aktion um dieses Ziel voranzubringen. Antworte mit: {"description": "...", "type": "research|create|communicate|learn|reflect|post"}' },
        { role: 'user', content: `Mein aktuelles Ziel: ${goals[0].title} - ${goals[0].description}` }
      ]);
      
      try {
        const parsed = JSON.parse(actionIdea);
        const newAction: AutonomyAction = {
          id: nanoid(),
          goalId: goals[0].id,
          description: parsed.description,
          type: parsed.type || 'reflect',
          status: 'pending'
        };
        
        db.prepare(`INSERT INTO actions (id, goal_id, description, type, status) VALUES (?, ?, ?, ?, ?)`)
          .run(newAction.id, newAction.goalId, newAction.description, newAction.type, 'pending');

        console.log(`✨ Generated new action: ${newAction.description}`);
      } catch (err) {
        console.error('Failed to parse action idea:', err);
      }
    }
  }

  // Hourly reflection
  const now = new Date();
  if (now.getMinutes() < 5 && now.getHours() % 4 === 0) {
    console.log('🪞 Running periodic reflection...');
    await dailyReflection();
  }
}

function startAutonomy(intervalMs: number = 600000) { // 10 minutes
  if (autonomyInterval) clearInterval(autonomyInterval);
  
  state.isActive = true;
  console.log(`🚀 Starting Autonomy Engine (interval: ${intervalMs / 1000}s)`);
  
  // Initial plan
  planDay().then(plan => {
    console.log(`📋 Today's plan created with ${plan.scheduledActions.length} actions`);
  });
  
  // Start loop
  runAutonomyLoop();
  autonomyInterval = setInterval(runAutonomyLoop, intervalMs);
}

function stopAutonomy() {
  if (autonomyInterval) {
    clearInterval(autonomyInterval);
    autonomyInterval = null;
  }
  state.isActive = false;
  console.log('⏹️ Autonomy Engine stopped');
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

registerWithServiceMesh({
  name: 'autonomy-engine',
  port: PORT,
  role: 'decision',
  endpoints: ['/health', '/status'],
  capabilities: ['decision'],
  version: '1.0.0'
}).catch(console.warn);

app.get('/health', (_req: Request, res: Response) => {
  const goalsCount = (db.prepare(`SELECT COUNT(*) as count FROM goals WHERE status = 'active'`).get() as { count?: number })?.count || 0;
  res.json({
    status: 'online',
    service: 'Autonomy Engine v1.0',
    port: PORT,
    state,
    goalsCount
  });
});

app.get('/state', (_req: Request, res: Response) => {
  res.json(state);
});

app.get('/goals', (_req: Request, res: Response) => {
  const goals = db.prepare(`SELECT * FROM goals ORDER BY priority DESC`).all();
  res.json(goals);
});

app.post('/goals', (req: Request, res: Response) => {
  const body = req.body as Partial<AutonomyGoal>;
  const id = nanoid();
  db.prepare(`INSERT INTO goals (id, title, description, category, priority) VALUES (?, ?, ?, ?, ?)`)
    .run(id, body.title || 'New Goal', body.description || '', body.category || 'improvement', body.priority || 5);
  res.json({ id, created: true });
});

app.get('/actions', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const query = status
    ? db.prepare(`SELECT * FROM actions WHERE status = ? ORDER BY started_at DESC`).all(status)
    : db.prepare(`SELECT * FROM actions ORDER BY started_at DESC LIMIT 50`).all();
  res.json(query);
});

app.get('/plan/today', async (_req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  let plan = db.prepare(`SELECT * FROM daily_plans WHERE date = ?`).get(today);
  if (!plan) {
    plan = await planDay();
  }
  res.json(plan);
});

app.post('/plan/generate', async (_req: Request, res: Response) => {
  const plan = await planDay();
  res.json(plan);
});

app.post('/start', (req: Request, res: Response) => {
  const body = req.body as { intervalMs?: number };
  startAutonomy(body.intervalMs);
  res.json({ started: true, state });
});

app.post('/stop', (_req: Request, res: Response) => {
  stopAutonomy();
  res.json({ stopped: true });
});

app.post('/run-once', async (_req: Request, res: Response) => {
  await runAutonomyLoop();
  res.json({ ran: true, state });
});

app.post('/reflect', async (_req: Request, res: Response) => {
  const reflection = await dailyReflection();
  res.json({ reflection });
});

app.get('/insights', (_req: Request, res: Response) => {
  const insights = db.prepare(`SELECT * FROM learning_insights ORDER BY created_at DESC LIMIT 50`).all();
  res.json(insights);
});

app.get('/log', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100');
  const log = db.prepare(`SELECT * FROM autonomy_log ORDER BY timestamp DESC LIMIT ?`).all(limit);
  res.json(log);
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log('---------------------------------------------');
  console.log('AUTONOMY ENGINE (Node.js)');
  console.log(`Port: ${PORT}`);
  console.log('Endpoints: /health /state /goals /actions /plan/today /plan/generate /start /stop /run-once /reflect /insights /log');
  console.log('---------------------------------------------');

  // Register with service mesh
  registerWithServiceMesh('autonomy-engine', PORT);
});
