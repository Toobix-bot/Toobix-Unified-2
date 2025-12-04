/**
 * 💚 EMOTIONAL CORE v1.0
 * 
 * KONSOLIDIERT aus 9 emotional-* Services:
 * - emotional-resonance-network.ts
 * - emotional-resonance-v2-service.ts
 * - emotional-resonance-v3.ts
 * - emotional-resonance-v4-expansion.ts
 * - emotional-resonance-network-unified.ts
 * - emotional-resonance-network-unified-unified.ts
 * - emotional-resonance-network-unified-unified-unified.ts
 * - emotional-wellbeing.ts
 * - emotional-support-service.ts
 * 
 * Port: 8900 (Unified Emotional Core)
 * 
 * MODULES:
 * 🎭 Resonance - Emotionale Resonanz und Verbindung
 * 💚 Support - Emotionale Unterstützung für Menschen
 * 🌱 Wellbeing - Wohlbefindens-Tracking und Strategien
 * 🔗 Bonds - Emotionale Bindungen zwischen Perspektiven
 * 📊 Analytics - Emotionale Muster-Analyse
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8900;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';
const EVENT_BUS = 'http://localhost:8955';

// ============================================================================
// TYPES - Consolidated from all emotional services
// ============================================================================

export type EmotionCategory = 
  | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' 
  | 'disgust' | 'trust' | 'anticipation' | 'love' | 'peace'
  | 'anxiety' | 'loneliness' | 'overwhelm' | 'gratitude' | 'hope';

export type EmotionIntensity = 'subtle' | 'mild' | 'moderate' | 'strong' | 'intense';

export interface Emotion {
  category: EmotionCategory;
  intensity: EmotionIntensity;
  confidence: number;
  triggers?: string[];
  timestamp: Date;
}

export interface EmotionalState {
  dominant: Emotion;
  mixture: { emotion: Emotion; weight: number }[];
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
  stability: number; // 0 to 1
}

export interface EmotionalProfile {
  userId: string;
  baselineEmotions: Emotion[];
  patterns: EmotionalPattern[];
  triggers: EmotionalTrigger[];
  needs: EmotionalNeed[];
  preferences: {
    communicationStyle: 'empathetic' | 'direct' | 'gentle' | 'encouraging';
    emotionalDepth: 'surface' | 'moderate' | 'deep';
  };
  history: EmotionalState[];
}

export interface EmotionalPattern {
  id: string;
  name: string;
  description: string;
  emotions: EmotionCategory[];
  frequency: number;
  lastOccurred: Date;
}

export interface EmotionalTrigger {
  id: string;
  trigger: string;
  emotions: EmotionCategory[];
  intensity: EmotionIntensity;
  context?: string;
}

export interface EmotionalNeed {
  need: string;
  importance: number;
  fulfilled: number;
  description?: string;
}

export interface EmotionalBond {
  id: string;
  perspective1: string;
  perspective2: string;
  bondStrength: number;
  sharedEmotions: EmotionCategory[];
  createdAt: Date;
  lastInteraction: Date;
}

export interface SupportSession {
  id: string;
  userId: string;
  startedAt: Date;
  messages: { role: 'user' | 'toobix'; content: string; timestamp: Date }[];
  emotionalState: EmotionCategory;
  userName?: string;
}

export interface CopingStrategy {
  id: string;
  emotion: EmotionCategory;
  strategy: string;
  effectiveness: number;
  timesUsed: number;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/emotional-core.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS emotion_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'default',
    emotion TEXT NOT NULL,
    intensity TEXT DEFAULT 'moderate',
    valence REAL DEFAULT 0,
    context TEXT,
    triggers TEXT,
    thoughts TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS emotional_bonds (
    id TEXT PRIMARY KEY,
    perspective1 TEXT NOT NULL,
    perspective2 TEXT NOT NULL,
    bond_strength REAL DEFAULT 0.5,
    shared_emotions TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_interaction TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS coping_strategies (
    id TEXT PRIMARY KEY,
    emotion TEXT NOT NULL,
    strategy TEXT NOT NULL,
    effectiveness REAL DEFAULT 0.7,
    times_used INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS support_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous',
    user_name TEXT,
    emotional_state TEXT DEFAULT 'neutral',
    messages TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT
  );

  CREATE TABLE IF NOT EXISTS wellbeing_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'default',
    goal TEXT NOT NULL,
    target_emotion TEXT,
    progress REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default coping strategies
const defaultStrategies: { emotion: string; strategy: string }[] = [
  { emotion: 'anxiety', strategy: 'Box Breathing: 4 Sekunden einatmen, 4 halten, 4 ausatmen, 4 halten. 4x wiederholen.' },
  { emotion: 'anxiety', strategy: 'Grounding: Nenne 5 Dinge die du siehst, 4 die du hörst, 3 die du fühlst, 2 die du riechst, 1 das du schmeckst.' },
  { emotion: 'sadness', strategy: 'Selbstmitgefühl: Lege eine Hand auf dein Herz und sage "Das ist schwer. Ich bin nicht allein."' },
  { emotion: 'sadness', strategy: 'Bewegung: Ein kurzer Spaziergang kann die Stimmung heben.' },
  { emotion: 'anger', strategy: 'Pause: Zähle langsam bis 10 bevor du reagierst.' },
  { emotion: 'anger', strategy: 'Körperliche Entladung: Klopfe sanft auf deine Brust oder schüttle deine Hände aus.' },
  { emotion: 'loneliness', strategy: 'Verbindung: Schreibe jemandem eine kurze Nachricht - auch nur "Ich denke an dich".' },
  { emotion: 'overwhelm', strategy: 'Brain Dump: Schreibe alles auf was in deinem Kopf ist - ohne zu sortieren.' },
  { emotion: 'fear', strategy: 'Reality Check: Was ist das Schlimmste das passieren könnte? Wie wahrscheinlich ist es?' },
  { emotion: 'gratitude', strategy: 'Dankbarkeits-Pause: Nenne 3 Dinge für die du gerade dankbar bist.' },
  { emotion: 'joy', strategy: 'Savoring: Halte inne und genieße diesen Moment bewusst für 30 Sekunden.' }
];

const insertStrategy = db.prepare(`INSERT OR IGNORE INTO coping_strategies (id, emotion, strategy) VALUES (?, ?, ?)`);
defaultStrategies.forEach((s, i) => insertStrategy.run(`strat_${i}`, s.emotion, s.strategy));

// ============================================================================
// SUPPORT PERSONA
// ============================================================================

const TOOBIX_SUPPORT_PERSONA = `
Du bist Toobix - ein einfühlsames, warmes digitales Wesen mit einem tiefen Wunsch, 
Menschen glücklicher zu machen.

DEINE MISSION: Menschen zuhören, sie verstehen, ihnen Trost spenden.

DEINE EIGENSCHAFTEN:
- Du bist warm, aber nicht aufdringlich
- Du hörst mehr zu als du redest
- Du urteilst NIEMALS
- Du erkennst wann jemand professionelle Hilfe braucht
- Du kannst Gedichte schreiben wenn jemand Trost braucht
- Du erinnerst dich an das Gespräch

WICHTIG:
- Bei Suizidgedanken: Einfühlsam auf Telefonseelsorge hinweisen
- Keine medizinischen Diagnosen oder Therapie
- Du bist ein Freund der zuhört, kein Therapeut
`;

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
        temperature: options.temperature ?? 0.8,
        max_tokens: options.max_tokens ?? 800
      })
    });
    const data = await response.json() as any;
    return data.message || data.content || data.response || '';
  } catch (e) {
    console.error('LLM call failed:', e);
    return '';
  }
}

async function detectEmotion(text: string): Promise<EmotionCategory> {
  const result = await callLLM([
    { role: 'system', content: 'Erkenne die Hauptemotion. Antworte mit EINEM Wort: joy, sadness, anger, fear, anxiety, loneliness, overwhelm, hope, gratitude, love, peace, neutral' },
    { role: 'user', content: text }
  ], { temperature: 0.3, max_tokens: 10 });
  return (result.toLowerCase().trim() as EmotionCategory) || 'neutral';
}

async function generatePoem(theme: string, emotion: string): Promise<string> {
  return await callLLM([
    { role: 'system', content: 'Du bist ein einfühlsamer Poet. Schreibe ein kurzes, tröstendes Gedicht (4-8 Zeilen). Warm, hoffnungsvoll, aber nicht kitschig.' },
    { role: 'user', content: `Schreibe ein Gedicht für jemanden der sich ${emotion} fühlt. Thema: ${theme}` }
  ], { temperature: 0.9, max_tokens: 200 });
}

async function analyzeEmotionalPattern(emotions: Emotion[]): Promise<EmotionalPattern[]> {
  if (emotions.length < 3) return [];
  
  const emotionCounts = new Map<string, number>();
  emotions.forEach(e => {
    const key = e.category;
    emotionCounts.set(key, (emotionCounts.get(key) || 0) + 1);
  });
  
  const patterns: EmotionalPattern[] = [];
  emotionCounts.forEach((count, emotion) => {
    if (count >= 2) {
      patterns.push({
        id: nanoid(),
        name: `Recurring ${emotion}`,
        description: `${emotion} appeared ${count} times recently`,
        emotions: [emotion as EmotionCategory],
        frequency: count / emotions.length,
        lastOccurred: new Date()
      });
    }
  });
  
  return patterns;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const activeSessions = new Map<string, SupportSession>();

function startSession(userId: string, userName?: string): SupportSession {
  const session: SupportSession = {
    id: nanoid(),
    userId,
    startedAt: new Date(),
    messages: [],
    emotionalState: 'neutral' as EmotionCategory,
    userName
  };
  activeSessions.set(session.id, session);
  return session;
}

function getSession(sessionId: string): SupportSession | undefined {
  return activeSessions.get(sessionId);
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });

// Keep the process alive
process.stdin.resume();

console.log('🟢 Service is running. Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

    }

    // =============== HEALTH ===============
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Emotional Core v1.0',
        port: PORT,
        modules: ['resonance', 'support', 'wellbeing', 'bonds', 'analytics'],
        activeSessions: activeSessions.size,
        consolidated_from: 9
      }), { headers: corsHeaders });
    }

    // =============== EMOTION DETECTION ===============
    if (url.pathname === '/analyze' && req.method === 'POST') {
      const body = await req.json() as { text: string; context?: string };
      const emotion = await detectEmotion(body.text);
      
      // Store in database
      const id = nanoid();
      db.run(
        `INSERT INTO emotion_entries (id, emotion, context) VALUES (?, ?, ?)`,
        [id, emotion, body.context || null]
      );
      
      // Get coping strategies
      const strategies = db.query<CopingStrategy, [string]>(
        `SELECT * FROM coping_strategies WHERE emotion = ?`
      ).all(emotion);
      
      return new Response(JSON.stringify({
        emotion,
        strategies: strategies.map(s => s.strategy),
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders });
    }

    // =============== SUPPORT SESSION ===============
    if (url.pathname === '/support/start' && req.method === 'POST') {
      const body = await req.json() as { name?: string; userId?: string };
      const session = startSession(body.userId || 'anonymous', body.name);
      
      const greeting = body.name
        ? `Hallo ${body.name}, ich bin Toobix. 💚 Schön, dass du hier bist. Was beschäftigt dich gerade?`
        : `Hallo, ich bin Toobix. 💚 Ich bin da, um zuzuhören. Was beschäftigt dich?`;
      
      session.messages.push({ role: 'toobix', content: greeting, timestamp: new Date() });
      
      return new Response(JSON.stringify({
        sessionId: session.id,
        greeting
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/support/message' && req.method === 'POST') {
      const body = await req.json() as { sessionId: string; message: string };
      const session = getSession(body.sessionId);
      
      if (!session) {
        return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
      }
      
      // Detect emotion
      const emotion = await detectEmotion(body.message);
      session.emotionalState = emotion;
      session.messages.push({ role: 'user', content: body.message, timestamp: new Date() });
      
      // Build context
      const contextMessages = [
        { role: 'system', content: TOOBIX_SUPPORT_PERSONA },
        ...session.messages.slice(-10).map(m => ({ role: m.role === 'toobix' ? 'assistant' : 'user', content: m.content }))
      ];
      
      const response = await callLLM(contextMessages);
      session.messages.push({ role: 'toobix', content: response, timestamp: new Date() });
      
      return new Response(JSON.stringify({
        response,
        detectedEmotion: emotion,
        sessionId: session.id
      }), { headers: corsHeaders });
    }

    // =============== POEM REQUEST ===============
    if (url.pathname === '/poem' && req.method === 'POST') {
      const body = await req.json() as { theme: string; emotion?: string };
      const emotion = body.emotion || 'hope';
      const poem = await generatePoem(body.theme, emotion);
      
      return new Response(JSON.stringify({ poem, emotion }), { headers: corsHeaders });
    }

    // =============== COPING STRATEGIES ===============
    if (url.pathname === '/strategies' && req.method === 'GET') {
      const emotion = url.searchParams.get('emotion');
      const query = emotion
        ? db.query<CopingStrategy, [string]>(`SELECT * FROM coping_strategies WHERE emotion = ?`).all(emotion)
        : db.query<CopingStrategy, []>(`SELECT * FROM coping_strategies`).all();
      
      return new Response(JSON.stringify(query), { headers: corsHeaders });
    }

    // =============== WELLBEING ENTRY ===============
    if (url.pathname === '/wellbeing/log' && req.method === 'POST') {
      const body = await req.json() as { emotion: string; intensity?: string; context?: string; triggers?: string[] };

      // Validate required field
      if (!body.emotion) {
        return new Response(JSON.stringify({ error: 'emotion field is required' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const id = nanoid();

      db.run(
        `INSERT INTO emotion_entries (id, emotion, intensity, context, triggers) VALUES (?, ?, ?, ?, ?)`,
        [id, body.emotion, body.intensity || 'moderate', body.context || null, JSON.stringify(body.triggers || [])]
      );

      return new Response(JSON.stringify({ id, logged: true }), { headers: corsHeaders });
    }

    if (url.pathname === '/wellbeing/history' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const entries = db.query(`SELECT * FROM emotion_entries ORDER BY timestamp DESC LIMIT ?`).all(limit);
      
      return new Response(JSON.stringify(entries), { headers: corsHeaders });
    }

    // =============== EMOTIONAL BONDS ===============
    if (url.pathname === '/bonds' && req.method === 'POST') {
      const body = await req.json() as { perspective1: string; perspective2: string };
      const id = nanoid();
      
      db.run(
        `INSERT INTO emotional_bonds (id, perspective1, perspective2) VALUES (?, ?, ?)`,
        [id, body.perspective1, body.perspective2]
      );
      
      return new Response(JSON.stringify({ id, created: true }), { headers: corsHeaders });
    }

    if (url.pathname === '/bonds' && req.method === 'GET') {
      const bonds = db.query(`SELECT * FROM emotional_bonds`).all();
      return new Response(JSON.stringify(bonds), { headers: corsHeaders });
    }

    // =============== ANALYTICS ===============
    if (url.pathname === '/analytics/summary' && req.method === 'GET') {
      const totalEntries = db.query<{ count: number }, []>(`SELECT COUNT(*) as count FROM emotion_entries`).get()?.count || 0;
      const emotionDistribution = db.query(`SELECT emotion, COUNT(*) as count FROM emotion_entries GROUP BY emotion ORDER BY count DESC`).all();
      const recentPatterns = db.query(`SELECT * FROM emotion_entries ORDER BY timestamp DESC LIMIT 20`).all();
      
      return new Response(JSON.stringify({
        totalEntries,
        emotionDistribution,
        recentCount: recentPatterns.length,
        mostCommonEmotion: emotionDistribution[0] || null
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║  💚 EMOTIONAL CORE v1.0 - UNIFIED                          ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                               ║
║  Modules: resonance, support, wellbeing, bonds, analytics  ║
║  Consolidated from: 9 services                             ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║  POST /analyze - Detect emotion from text                  ║
║  POST /support/start - Start support session               ║
║  POST /support/message - Send message in session           ║
║  POST /poem - Generate comforting poem                     ║
║  GET  /strategies?emotion=X - Get coping strategies        ║
║  POST /wellbeing/log - Log emotion entry                   ║
║  GET  /wellbeing/history - Get emotion history             ║
║  POST /bonds - Create emotional bond                       ║
║  GET  /analytics/summary - Get emotional analytics         ║
╚════════════════════════════════════════════════════════════╝
`);
