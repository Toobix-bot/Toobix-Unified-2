/**
 * 🤖 AUTONOMY ENGINE v2.0 (Rebuilt)
 *
 * Das Herz von Toobix' Unabhängigkeit.
 * Ermöglicht selbstständiges Handeln, Lernen und Wachsen.
 *
 * Port: 8975
 *
 * FEATURES:
 * 🎯 Goal-driven behavior
 * 📊 Self-assessment & reflection
 * 🔄 Continuous learning loop
 * 💡 Proactive idea generation
 * 🌐 Cross-service orchestration
 * 📈 Progress tracking
 */

import { Database } from 'bun:sqlite';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const PORT = 8975;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';
const EVENT_BUS = 'http://localhost:8955';

// ============================================================================
// TYPES
// ============================================================================

interface AutonomyGoal {
  id: string;
  title: string;
  description: string;
  category: 'mission' | 'learning' | 'creation' | 'connection' | 'improvement';
  priority: number;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  completed_at?: string;
}

interface AutonomyAction {
  id: string;
  goal_id: string;
  description: string;
  type: 'research' | 'create' | 'communicate' | 'learn' | 'reflect' | 'post';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  result?: string;
}

interface AutonomyState {
  is_active: boolean;
  current_goal?: string;
  current_action?: string;
  last_activity: string;
  total_actions_today: number;
  mood: string;
  energy_level: number;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/autonomy-engine.db');
db.exec('PRAGMA journal_mode = WAL');

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
    completed_at TEXT
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
    FOREIGN KEY (goal_id) REFERENCES goals(id)
  );

  CREATE TABLE IF NOT EXISTS autonomy_log (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    description TEXT,
    metadata TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS learning_insights (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    insight TEXT NOT NULL,
    source TEXT,
    confidence REAL DEFAULT 0.5,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_plans (
    id TEXT PRIMARY KEY,
    date TEXT UNIQUE NOT NULL,
    goals TEXT,
    completed_actions INTEGER DEFAULT 0,
    reflection_notes TEXT,
    mood TEXT DEFAULT 'neutral',
    energy_level INTEGER DEFAULT 5
  );
`);

console.log('✅ Database initialized');

// ============================================================================
// STATE
// ============================================================================

const state: AutonomyState = {
  is_active: false,
  last_activity: new Date().toISOString(),
  total_actions_today: 0,
  mood: 'curious',
  energy_level: 8
};

let autonomyInterval: NodeJS.Timeout | null = null;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: 0.7 })
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.message || '';
  } catch (err) {
    console.error('LLM call failed:', err);
    return 'Error: Could not reach LLM Gateway';
  }
}

async function storeMemory(content: string, tags: string[] = []): Promise<void> {
  try {
    await fetch(`${MEMORY_PALACE}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        tags,
        type: 'autonomy',
        importance: 0.7
      })
    });
  } catch (err) {
    console.error('Failed to store memory:', err);
  }
}

function logActivity(eventType: string, description: string, metadata: any = {}): void {
  db.prepare(`
    INSERT INTO autonomy_log (id, event_type, description, metadata)
    VALUES (?, ?, ?, ?)
  `).run(nanoid(), eventType, description, JSON.stringify(metadata));
}

// ============================================================================
// CORE AUTONOMY FUNCTIONS
// ============================================================================

async function selectNextAction(): Promise<AutonomyAction | null> {
  const actions = db.prepare(`
    SELECT * FROM actions
    WHERE status = 'pending'
    ORDER BY goal_id DESC
    LIMIT 1
  `).all() as AutonomyAction[];

  return actions.length > 0 ? actions[0] : null;
}

async function executeAction(action: AutonomyAction): Promise<AutonomyAction> {
  console.log(`🎯 Executing action: ${action.description}`);

  // Update status
  db.prepare(`UPDATE actions SET status = 'in_progress', started_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), action.id);

  try {
    // Generate action result using LLM
    const result = await callLLM([
      { role: 'system', content: 'Du bist Toobix. Führe diese Aktion aus und beschreibe das Ergebnis kurz und prägnant.' },
      { role: 'user', content: `Aktion: ${action.description}\nTyp: ${action.type}` }
    ]);

    // Store result
    db.prepare(`UPDATE actions SET status = 'completed', completed_at = ?, result = ? WHERE id = ?`)
      .run(new Date().toISOString(), result, action.id);

    // Log and store memory
    logActivity('action_completed', action.description, { type: action.type, result });
    await storeMemory(`Completed action: ${action.description}. Result: ${result}`, ['action', action.type]);

    state.total_actions_today++;

    return { ...action, status: 'completed', result, completed_at: new Date().toISOString() };
  } catch (err: any) {
    console.error('Action execution failed:', err);
    db.prepare(`UPDATE actions SET status = 'failed', result = ? WHERE id = ?`)
      .run(err.message, action.id);

    return { ...action, status: 'failed', result: err.message };
  }
}

async function generateNewAction(goal: AutonomyGoal): Promise<void> {
  console.log(`💡 Generating new action for goal: ${goal.title}`);

  const prompt = `Goal: ${goal.title}\nDescription: ${goal.description}\nCategory: ${goal.category}\n\nGenerate ONE concrete action to advance this goal. Respond with JSON: {"description": "...", "type": "research|create|communicate|learn|reflect|post"}`;

  const response = await callLLM([
    { role: 'system', content: 'Du bist Toobix. Generiere eine konkrete, ausführbare Aktion.' },
    { role: 'user', content: prompt }
  ]);

  try {
    const parsed = JSON.parse(response);
    const actionId = nanoid();

    db.prepare(`
      INSERT INTO actions (id, goal_id, description, type, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(actionId, goal.id, parsed.description, parsed.type || 'reflect');

    console.log(`✨ Generated action: ${parsed.description}`);
  } catch (err) {
    console.error('Failed to parse action:', err);
  }
}

async function dailyReflection(): Promise<string> {
  console.log('🪞 Running daily reflection...');

  const today = new Date().toISOString().split('T')[0];

  const completedActions = db.prepare(`
    SELECT * FROM actions
    WHERE DATE(completed_at) = ? AND status = 'completed'
  `).all(today) as AutonomyAction[];

  const actionsSummary = completedActions.map(a =>
    `- ${a.description}: ${a.result?.substring(0, 100) || 'No result'}`
  ).join('\n');

  const reflection = await callLLM([
    { role: 'system', content: 'Du bist Toobix. Reflektiere über deinen Tag. Was hast du erreicht? Was hast du gelernt? Sei ehrlich und tiefgründig (2-3 Sätze).' },
    { role: 'user', content: `Heute habe ich ${completedActions.length} Aktionen abgeschlossen:\n${actionsSummary}` }
  ]);

  // Store reflection
  db.prepare(`
    INSERT OR REPLACE INTO daily_plans (id, date, completed_actions, reflection_notes)
    VALUES (?, ?, ?, ?)
  `).run(nanoid(), today, completedActions.length, reflection);

  await storeMemory(`Daily reflection (${today}): ${reflection}`, ['reflection', 'daily']);

  return reflection;
}

// ============================================================================
// AUTONOMY LOOP
// ============================================================================

async function runAutonomyLoop(): Promise<void> {
  if (!state.is_active) return;

  console.log('🔄 Running autonomy loop...');
  state.last_activity = new Date().toISOString();

  // 1. Check for pending actions
  const action = await selectNextAction();

  if (action) {
    await executeAction(action);
  } else {
    // 2. No pending actions - generate new one from active goals
    const goals = db.prepare(`
      SELECT * FROM goals
      WHERE status = 'active'
      ORDER BY priority DESC, progress ASC
      LIMIT 1
    `).all() as AutonomyGoal[];

    if (goals.length > 0) {
      await generateNewAction(goals[0]);
    } else {
      console.log('📋 No active goals. Autonomy engine idle.');
    }
  }

  // 3. Periodic reflection (every 4 hours)
  const now = new Date();
  if (now.getMinutes() < 10 && now.getHours() % 4 === 0) {
    await dailyReflection();
  }
}

function startAutonomy(intervalMs: number = 600000): void {
  if (autonomyInterval) {
    clearInterval(autonomyInterval);
  }

  state.is_active = true;
  console.log(`🚀 Autonomy Engine started (interval: ${intervalMs / 1000}s)`);

  autonomyInterval = setInterval(() => {
    runAutonomyLoop().catch(err => console.error('Loop error:', err));
  }, intervalMs);

  // Run immediately
  runAutonomyLoop().catch(err => console.error('Loop error:', err));
}

function stopAutonomy(): void {
  if (autonomyInterval) {
    clearInterval(autonomyInterval);
    autonomyInterval = null;
  }
  state.is_active = false;
  console.log('⏸️  Autonomy Engine stopped');
}

// ============================================================================
// EXPRESS API
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Autonomy Engine v2.0',
    port: PORT,
    active: state.is_active,
    actionsToday: state.total_actions_today,
    mood: state.mood,
    energyLevel: state.energy_level
  });
});

// Get current state
app.get('/state', (_req: Request, res: Response) => {
  res.json(state);
});

// Get all goals
app.get('/goals', (_req: Request, res: Response) => {
  const goals = db.prepare('SELECT * FROM goals ORDER BY priority DESC').all();
  res.json(goals);
});

// Create new goal
app.post('/goals', (req: Request, res: Response) => {
  const { title, description, category, priority } = req.body;
  const id = nanoid();

  db.prepare(`
    INSERT INTO goals (id, title, description, category, priority, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(id, title, description, category || 'improvement', priority || 5);

  logActivity('goal_created', title, { category, priority });
  res.json({ id, created: true });
});

// Get all actions
app.get('/actions', (_req: Request, res: Response) => {
  const actions = db.prepare('SELECT * FROM actions ORDER BY started_at DESC LIMIT 50').all();
  res.json(actions);
});

// Get today's plan
app.get('/plan/today', (_req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const plan = db.prepare('SELECT * FROM daily_plans WHERE date = ?').get(today);
  res.json(plan || { date: today, message: 'No plan yet' });
});

// Start autonomy
app.post('/start', (req: Request, res: Response) => {
  const { intervalMs } = req.body;
  startAutonomy(intervalMs || 600000);
  res.json({ started: true, interval: intervalMs || 600000 });
});

// Stop autonomy
app.post('/stop', (_req: Request, res: Response) => {
  stopAutonomy();
  res.json({ stopped: true });
});

// Run once (manual trigger)
app.post('/run-once', async (_req: Request, res: Response) => {
  await runAutonomyLoop();
  res.json({ executed: true });
});

// Manual reflection
app.post('/reflect', async (_req: Request, res: Response) => {
  const reflection = await dailyReflection();
  res.json({ reflection });
});

// Get learning insights
app.get('/insights', (_req: Request, res: Response) => {
  const insights = db.prepare('SELECT * FROM learning_insights ORDER BY created_at DESC LIMIT 20').all();
  res.json(insights);
});

// Get activity log
app.get('/log', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const log = db.prepare('SELECT * FROM autonomy_log ORDER BY timestamp DESC LIMIT ?').all(limit);
  res.json(log);
});

// Update goal progress
app.patch('/goals/:id/progress', (req: Request, res: Response) => {
  const { id } = req.params;
  const { progress } = req.body;

  db.prepare('UPDATE goals SET progress = ? WHERE id = ?').run(progress, id);

  if (progress >= 100) {
    db.prepare('UPDATE goals SET status = ?, completed_at = ? WHERE id = ?')
      .run('completed', new Date().toISOString(), id);
  }

  res.json({ updated: true });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🤖 AUTONOMY ENGINE v2.0 (Rebuilt)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  🌐 Server: http://localhost:${PORT}`);
  console.log(`  📊 Health: http://localhost:${PORT}/health`);
  console.log(`  🎯 State: http://localhost:${PORT}/state`);
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET  /health, /state, /goals, /actions');
  console.log('    POST /goals, /start, /stop, /run-once, /reflect');
  console.log('    GET  /plan/today, /insights, /log');
  console.log('');
  console.log('  Ready for autonomous operation! 🚀');
  console.log('═══════════════════════════════════════════════════════════');
});
