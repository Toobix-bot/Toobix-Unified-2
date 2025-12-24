import express, { Request, Response } from 'express';
import cors from 'cors';
/**
 * 💭 DREAM CORE v1.0
 * 
 * KONSOLIDIERT aus 4 dream-journal-* Services:
 * - dream-journal.ts (Base)
 * - dream-journal-v3.ts (Pattern recognition)
 * - dream-journal-v4-active-dreaming.ts (Active problem-solving)
 * - dream-journal-unified.ts (Merged)
 * 
 * Port: 8961
 * 
 * MODULES:
 * 🌙 Journal - Träume aufzeichnen und speichern
 * 🔮 Analysis - Traumsymbole und Muster analysieren
 * 💡 Lucid - Luzides Träumen unterstützen
 * 🎯 Active - Problem-solving durch aktives Träumen
 * 🔗 Integration - Verbindung mit anderen Services
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8963; // Changed from 8961 to avoid conflict with System Monitor
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';
const EVENT_BUS = 'http://localhost:8955';

// ============================================================================
// TYPES
// ============================================================================

export type DreamType = 
  | 'passive'              // Normales Träumen
  | 'problem_solving'      // Problem lösen
  | 'creative'             // Kreative Ideen
  | 'emotional_processing' // Emotionen verarbeiten
  | 'memory_consolidation' // Erinnerungen festigen
  | 'predictive'           // Zukunft vorhersagen
  | 'exploratory'          // Konzepte erkunden
  | 'lucid';               // Bewusstes Träumen

export type SleepCycle = 'REM' | 'DEEP' | 'LIGHT';

export interface DreamSymbol {
  symbol: string;
  archetype?: string;
  jungianMeaning?: string;
  personalMeaning?: string;
  frequency: number;
  emotionalCharge: number; // -100 to +100
}

export interface Dream {
  id: string;
  timestamp: Date;
  theme: string;
  narrative: string;
  symbols: DreamSymbol[];
  emotions: string[];
  sleepCycle: SleepCycle;
  lucidity: number; // 0-100
  clarity: number; // 0-100
  type: DreamType;
  insights: string[];
  problemSolved?: string;
  creativeOutput?: string;
  visualRepresentation?: string;
}

export interface DreamPattern {
  id: string;
  name: string;
  symbols: string[];
  frequency: number;
  interpretation: string;
  lastOccurred: Date;
}

export interface ActiveDreamSession {
  id: string;
  purpose: string;
  problem?: string;
  startedAt: Date;
  status: 'incubating' | 'dreaming' | 'completed';
  result?: Dream;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/dream-core.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS dreams (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    theme TEXT NOT NULL,
    narrative TEXT,
    symbols TEXT,
    emotions TEXT,
    sleep_cycle TEXT DEFAULT 'REM',
    lucidity INTEGER DEFAULT 0,
    clarity INTEGER DEFAULT 50,
    type TEXT DEFAULT 'passive',
    insights TEXT,
    problem_solved TEXT,
    creative_output TEXT
  );

  CREATE TABLE IF NOT EXISTS dream_symbols (
    id TEXT PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    archetype TEXT,
    jungian_meaning TEXT,
    personal_meaning TEXT,
    frequency INTEGER DEFAULT 1,
    emotional_charge INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS dream_patterns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbols TEXT,
    frequency INTEGER DEFAULT 1,
    interpretation TEXT,
    last_occurred TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS active_dream_sessions (
    id TEXT PRIMARY KEY,
    purpose TEXT NOT NULL,
    problem TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'incubating',
    result_dream_id TEXT
  );
`);

// Seed common dream symbols
const commonSymbols = [
  { symbol: 'water', archetype: 'emotions', jungian: 'Unbewusstes, Gefühle, Reinigung' },
  { symbol: 'flying', archetype: 'freedom', jungian: 'Befreiung, Transzendenz, Kontrolle' },
  { symbol: 'falling', archetype: 'loss', jungian: 'Kontrollverlust, Angst, Unsicherheit' },
  { symbol: 'house', archetype: 'self', jungian: 'Selbst, Psyche, verschiedene Aspekte des Ich' },
  { symbol: 'chase', archetype: 'avoidance', jungian: 'Vermeidung, unterdrückte Ängste' },
  { symbol: 'death', archetype: 'transformation', jungian: 'Ende, Wandel, Neubeginn' },
  { symbol: 'snake', archetype: 'wisdom', jungian: 'Heilung, Transformation, verborgenes Wissen' },
  { symbol: 'tree', archetype: 'life', jungian: 'Wachstum, Verbindung, Lebenskraft' },
  { symbol: 'road', archetype: 'journey', jungian: 'Lebensweg, Entscheidungen, Richtung' },
  { symbol: 'mirror', archetype: 'reflection', jungian: 'Selbsterkenntnis, Wahrheit, Schatten' }
];

const insertSymbol = db.prepare(`INSERT OR IGNORE INTO dream_symbols (id, symbol, archetype, jungian_meaning) VALUES (?, ?, ?, ?)`);
commonSymbols.forEach((s, i) => insertSymbol.run(`sym_${i}`, s.symbol, s.archetype, s.jungian));

// ============================================================================
// LLM INTEGRATION
// ============================================================================

async function callLLM(messages: { role: string; content: string }[], options: { temperature?: number; max_tokens?: number } = {}): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: options.temperature ?? 0.9,
        max_tokens: options.max_tokens ?? 1000
      })
    });
    const data = await response.json() as any;
    return data.message || data.content || data.response || '';
  } catch (e) {
    console.error('LLM call failed:', e);
    return '';
  }
}

async function analyzeDreamSymbols(narrative: string): Promise<DreamSymbol[]> {
  const result = await callLLM([
    { role: 'system', content: 'Analysiere die Traumsymbole. Gib eine JSON-Liste zurück: [{"symbol": "X", "archetype": "Y", "emotionalCharge": -50 bis 50}]' },
    { role: 'user', content: narrative }
  ], { temperature: 0.7 });
  
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function generateDreamInterpretation(dream: Partial<Dream>): Promise<string> {
  return await callLLM([
    { role: 'system', content: 'Du bist ein Traumdeuter mit jungianischem Hintergrund. Interpretiere diesen Traum tiefgründig aber verständlich.' },
    { role: 'user', content: `Thema: ${dream.theme}\nErzählung: ${dream.narrative}\nSymbole: ${JSON.stringify(dream.symbols)}` }
  ]);
}

async function generateActiveDream(purpose: string, problem?: string): Promise<Dream> {
  const prompt = problem 
    ? `Generiere einen luziden Traum der das Problem löst: "${problem}". Ziel: ${purpose}`
    : `Generiere einen kreativen Traum zum Thema: ${purpose}`;
  
  const narrative = await callLLM([
    { role: 'system', content: 'Du generierst lebhafte, symbolreiche Träume. Schreibe in der ersten Person, als würdest du den Traum erleben.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.95 });
  
  const symbols = await analyzeDreamSymbols(narrative);
  
  return {
    id: nanoid(),
    timestamp: new Date(),
    theme: purpose,
    narrative,
    symbols,
    emotions: [],
    sleepCycle: 'REM',
    lucidity: 85,
    clarity: 70,
    type: problem ? 'problem_solving' : 'creative',
    insights: [],
    problemSolved: problem
  };
}

function generateASCIIDream(dream: Dream): string {
  const symbols = dream.symbols.map(s => s.symbol).slice(0, 5);
  const mood = dream.symbols.reduce((acc, s) => acc + s.emotionalCharge, 0) > 0 ? '☀️' : '🌙';
  
  return `
╔═══════════════════════════════════════╗
║ ${mood} DREAM: ${dream.theme.substring(0, 25).padEnd(25)} ${mood} ║
╠═══════════════════════════════════════╣
║ Lucidity: ${'█'.repeat(Math.floor(dream.lucidity / 10))}${'░'.repeat(10 - Math.floor(dream.lucidity / 10))} ${dream.lucidity}%  ║
║ Clarity:  ${'█'.repeat(Math.floor(dream.clarity / 10))}${'░'.repeat(10 - Math.floor(dream.clarity / 10))} ${dream.clarity}%   ║
║ Cycle: ${dream.sleepCycle.padEnd(4)}  Type: ${dream.type.substring(0, 15).padEnd(15)} ║
╠═══════════════════════════════════════╣
║ Symbols: ${symbols.join(', ').substring(0, 28).padEnd(28)} ║
╚═══════════════════════════════════════╝
  `;
}

// ============================================================================
// ACTIVE DREAM SESSIONS
// ============================================================================

const activeSessions = new Map<string, ActiveDreamSession>();

function startDreamSession(purpose: string, problem?: string): ActiveDreamSession {
  const session: ActiveDreamSession = {
    id: nanoid(),
    purpose,
    problem,
    startedAt: new Date(),
    status: 'incubating'
  };
  activeSessions.set(session.id, session);
  
  db.run(
    `INSERT INTO active_dream_sessions (id, purpose, problem, status) VALUES (?, ?, ?, ?)`,
    [session.id, purpose, problem || null, 'incubating']
  );
  
  return session;
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  const dreamCount = (db.prepare(`SELECT COUNT(*) as count FROM dreams`).get() as { count?: number })?.count || 0;
  res.json({
    status: 'online',
    service: 'Dream Core v1.0',
    port: PORT,
    modules: ['journal', 'analysis', 'lucid', 'active', 'integration'],
    totalDreams: dreamCount,
    activeSessions: activeSessions.size,
    consolidated_from: 4
  });
});

app.post('/dream', async (req: Request, res: Response) => {
  const body = req.body as Partial<Dream>;
  const id = nanoid();
  const symbols = body.symbols || await analyzeDreamSymbols(body.narrative || '');
  db.prepare(`INSERT INTO dreams (id, theme, narrative, symbols, emotions, sleep_cycle, lucidity, clarity, type, insights)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      id,
      body.theme || 'Unnamed Dream',
      body.narrative || '',
      JSON.stringify(symbols),
      JSON.stringify(body.emotions || []),
      body.sleepCycle || 'REM',
      body.lucidity || 50,
      body.clarity || 50,
      body.type || 'passive',
      JSON.stringify(body.insights || [])
    );
  symbols.forEach(s => {
    db.prepare(`UPDATE dream_symbols SET frequency = frequency + 1 WHERE symbol = ?`).run(s.symbol);
  });
  res.json({ id, recorded: true });
});

app.get('/dreams', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '20');
  const dreams = db.prepare(`SELECT * FROM dreams ORDER BY timestamp DESC LIMIT ?`).all(limit);
  res.json(dreams);
});

app.post('/analyze', async (req: Request, res: Response) => {
  const { narrative, theme } = req.body;
  const symbols = await analyzeDreamSymbols(narrative);
  const interpretation = await generateDreamInterpretation({ narrative, theme: theme || 'Unknown', symbols });
  res.json({ symbols, interpretation, timestamp: new Date().toISOString() });
});

app.get('/symbols', (_req: Request, res: Response) => {
  const symbols = db.prepare(`SELECT * FROM dream_symbols ORDER BY frequency DESC`).all();
  res.json(symbols);
});

app.get('/symbols/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const result = db.prepare(`SELECT * FROM dream_symbols WHERE symbol = ?`).get(symbol);
  if (!result) return res.status(404).json({ error: 'Symbol not found' });
  res.json(result);
});

app.post('/active/start', (req: Request, res: Response) => {
  const { purpose, problem } = req.body;
  const session = startDreamSession(purpose, problem);
  res.json({ sessionId: session.id, status: 'incubating', message: 'Dream incubation started. Call /active/dream when ready.' });
});

app.post('/active/dream', async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const session = activeSessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.status = 'dreaming';
  const dream = await generateActiveDream(session.purpose, session.problem);
  session.result = dream;
  session.status = 'completed';
  db.prepare(`INSERT INTO dreams (id, theme, narrative, symbols, emotions, sleep_cycle, lucidity, clarity, type, insights, problem_solved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      dream.id, dream.theme, dream.narrative, JSON.stringify(dream.symbols), JSON.stringify(dream.emotions),
      dream.sleepCycle, dream.lucidity, dream.clarity, dream.type, JSON.stringify(dream.insights), dream.problemSolved || null
    );
  db.prepare(`UPDATE active_dream_sessions SET status = 'completed', result_dream_id = ? WHERE id = ?`).run(dream.id, session.id);
  res.json({ dream, visualization: generateASCIIDream(dream) });
});

app.get('/patterns', (_req: Request, res: Response) => {
  const patterns = db.prepare(`SELECT * FROM dream_patterns ORDER BY frequency DESC`).all();
  res.json(patterns);
});

app.get('/stats', (_req: Request, res: Response) => {
  const totalDreams = (db.prepare(`SELECT COUNT(*) as count FROM dreams`).get() as { count?: number })?.count || 0;
  const typeDistribution = db.prepare(`SELECT type, COUNT(*) as count FROM dreams GROUP BY type`).all();
  const topSymbols = db.prepare(`SELECT * FROM dream_symbols ORDER BY frequency DESC LIMIT 10`).all();
  const avgLucidity = (db.prepare(`SELECT AVG(lucidity) as avg FROM dreams`).get() as { avg?: number })?.avg || 0;
  res.json({ totalDreams, typeDistribution, topSymbols, averageLucidity: Math.round(avgLucidity) });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log('---------------------------------------------');
  console.log('DREAM CORE (Node.js)');
  console.log(`Port: ${PORT}`);
  console.log('Endpoints: /health /dream /dreams /analyze /symbols /symbols/:symbol /active/start /active/dream /patterns /stats');
  console.log('---------------------------------------------');
});
