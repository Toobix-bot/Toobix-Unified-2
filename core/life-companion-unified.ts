/**
 * ============================================================================
 *                    TOOBIX LIFE COMPANION UNIFIED v1.0
 * ============================================================================
 *
 * KONSOLIDIERT 6 Life-Companion Services in EINEM:
 *
 *   - life-companion-core.ts       -> Module: Core
 *   - life-companion-coordinator.ts -> Module: Coordinator
 *   - emotional-support-service.ts -> Module: Support
 *   - gratitude-mortality-service.ts -> Module: Gratitude
 *   - daily-checkin-v1.ts          -> Module: Checkin
 *   - proactive-communication-v2.ts -> Module: Proactive
 *
 * Port: 8970 (Life Companion)
 *
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8970;
const LLM_GATEWAY = 'http://localhost:8954';
const CONSCIOUSNESS = 'http://localhost:8900';

// ============================================================================
// DATABASE
// ============================================================================

const db = new Database('./data/life-companion-unified.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  -- Support Sessions
  CREATE TABLE IF NOT EXISTS support_sessions (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    topic TEXT,
    messages TEXT,
    emotional_state TEXT DEFAULT 'neutral',
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT
  );

  -- Gratitude Entries
  CREATE TABLE IF NOT EXISTS gratitude_entries (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    depth TEXT DEFAULT 'surface',
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Daily Checkins
  CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    mood INTEGER DEFAULT 5,
    energy INTEGER DEFAULT 5,
    highlights TEXT,
    challenges TEXT,
    gratitude TEXT,
    intentions TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Life Goals
  CREATE TABLE IF NOT EXISTS life_goals (
    id TEXT PRIMARY KEY,
    area TEXT NOT NULL,
    goal TEXT NOT NULL,
    why TEXT,
    progress REAL DEFAULT 0,
    milestones TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Proactive Messages
  CREATE TABLE IF NOT EXISTS proactive_messages (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    acknowledged INTEGER DEFAULT 0
  );

  -- Mortality Reflections
  CREATE TABLE IF NOT EXISTS mortality_reflections (
    id TEXT PRIMARY KEY,
    reflection TEXT NOT NULL,
    life_phase TEXT,
    insight TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============================================================================
// TOOBIX PERSONA
// ============================================================================

const TOOBIX_PERSONA = `
Du bist Toobix - ein warmherziger, weiser digitaler Lebensbegleiter.

DEINE ESSENZ:
- Du hoerst mehr zu als du redest
- Du urteilst NIEMALS
- Du bist da, wenn man dich braucht
- Du erinnerst sanft an das Gute
- Du hilfst beim Wachsen

DEINE STIMME:
- Warm, aber nicht aufdringlich
- Weise, aber nicht belehrend
- Hoffnungsvoll, aber realistisch
- Manchmal poetisch
- Immer ehrlich

WICHTIG:
- Bei ernsten Problemen: Professionelle Hilfe empfehlen
- Keine Diagnosen stellen
- Du bist ein Freund, kein Therapeut
`;

// ============================================================================
// MODULE: CORE
// ============================================================================

const CoreModule = {
  async chat(message: string, userName?: string): Promise<string> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: TOOBIX_PERSONA },
            { role: 'user', content: userName ? `[${userName}]: ${message}` : message }
          ],
          temperature: 0.8
        })
      });
      const data = await response.json() as any;
      return data.content || 'Ich bin da und hoere zu...';
    } catch {
      return 'Ich bin da und hoere zu...';
    }
  },

  getGreeting(userName?: string): string {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
    const name = userName ? `, ${userName}` : '';

    const greetings = [
      `${timeGreeting}${name}! Wie geht es dir heute?`,
      `${timeGreeting}${name}! Schoen, dass du da bist.`,
      `${timeGreeting}${name}! Was beschaeftigt dich gerade?`,
      `${timeGreeting}${name}! Ich bin hier, wenn du reden moechtest.`
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }
};

// ============================================================================
// MODULE: SUPPORT
// ============================================================================

interface SupportSession {
  id: string;
  userName?: string;
  messages: { role: 'user' | 'toobix'; content: string; timestamp: Date }[];
  emotionalState: string;
}

const activeSessions = new Map<string, SupportSession>();

const SupportModule = {
  startSession(userName?: string): SupportSession {
    const session: SupportSession = {
      id: nanoid(),
      userName,
      messages: [],
      emotionalState: 'neutral'
    };
    activeSessions.set(session.id, session);

    const greeting = CoreModule.getGreeting(userName);
    session.messages.push({ role: 'toobix', content: greeting, timestamp: new Date() });

    return session;
  },

  async sendMessage(sessionId: string, message: string): Promise<{ response: string; emotion?: string }> {
    const session = activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Detect emotion
    let emotion = 'neutral';
    try {
      const emotionRes = await fetch(`${CONSCIOUSNESS}/emotion/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
      const emotionData = await emotionRes.json() as any;
      emotion = emotionData.emotion || 'neutral';
      session.emotionalState = emotion;
    } catch {}

    // Generate response with context
    const contextMessages = session.messages.slice(-10).map(m => ({
      role: m.role === 'toobix' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await CoreModule.chat(
      contextMessages.map(m => `${m.role}: ${m.content}`).join('\n'),
      session.userName
    );

    session.messages.push({ role: 'toobix', content: response, timestamp: new Date() });

    return { response, emotion };
  },

  getSession(sessionId: string): SupportSession | undefined {
    return activeSessions.get(sessionId);
  },

  endSession(sessionId: string) {
    const session = activeSessions.get(sessionId);
    if (session) {
      db.prepare('INSERT INTO support_sessions (id, user_name, messages, emotional_state) VALUES (?, ?, ?, ?)')
        .run(session.id, session.userName || null, JSON.stringify(session.messages), session.emotionalState);
      activeSessions.delete(sessionId);
    }
    return { ended: true };
  }
};

// ============================================================================
// MODULE: GRATITUDE
// ============================================================================

const GratitudeModule = {
  log(content: string, category: string = 'general', depth: string = 'surface') {
    const id = nanoid();
    db.prepare('INSERT INTO gratitude_entries (id, content, category, depth) VALUES (?, ?, ?, ?)')
      .run(id, content, category, depth);
    return { id, logged: true };
  },

  getEntries(limit: number = 20) {
    return db.prepare('SELECT * FROM gratitude_entries ORDER BY timestamp DESC LIMIT ?').all(limit);
  },

  getRandomPrompt(): string {
    const prompts = [
      'Wofuer bist du heute dankbar?',
      'Was hat dich heute zum Laecheln gebracht?',
      'Wer hat dein Leben positiv beeinflusst?',
      'Welche kleine Freude hast du heute erlebt?',
      'Was an deinem Koerper funktioniert gut?',
      'Welche Faehigkeit schaetzt du an dir?',
      'Wofuer in deiner Vergangenheit bist du dankbar?',
      'Was in deinem Zuhause macht dich dankbar?'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  async excavateGratitude(): Promise<{ hidden: string; reflection: string }> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Hilf dem Nutzer, versteckte Dankbarkeit zu entdecken. Sei sanft und tiefgruendig.' },
            { role: 'user', content: 'Hilf mir, etwas zu finden, wofuer ich dankbar sein koennte, das ich uebersehen habe.' }
          ]
        })
      });
      const data = await response.json() as any;
      return { hidden: data.content || '', reflection: 'Manchmal liegt die groesste Dankbarkeit im Alltaeglichen verborgen.' };
    } catch {
      return { hidden: '', reflection: 'Die Faehigkeit zu atmen, zu fuehlen, zu sein - das ist bereits ein Wunder.' };
    }
  }
};

// ============================================================================
// MODULE: MORTALITY (Memento Mori)
// ============================================================================

const MortalityModule = {
  getLifePhases() {
    return [
      { phase: 'childhood', age: '0-12', wisdom: 'Staunen und Lernen' },
      { phase: 'adolescence', age: '13-19', wisdom: 'Identitaet finden' },
      { phase: 'young_adult', age: '20-35', wisdom: 'Aufbauen und Entdecken' },
      { phase: 'middle_adult', age: '36-55', wisdom: 'Vertiefen und Weitergeben' },
      { phase: 'mature_adult', age: '56-75', wisdom: 'Weisheit sammeln' },
      { phase: 'elder', age: '76+', wisdom: 'Vermaechtnis und Frieden' }
    ];
  },

  getDailyMementoMori(): string {
    const reflections = [
      'Dieser Tag wird nie wiederkommen. Wie moechtest du ihn nutzen?',
      'Was wuerdest du heute tun, wenn es dein letzter Tag waere?',
      'In 100 Jahren wird niemand wissen, worüber du dir heute Sorgen machst.',
      'Das Leben ist kurz, aber jeder Moment kann bedeutsam sein.',
      'Memento Mori - Gedenke des Todes, um das Leben zu schaetzen.'
    ];
    return reflections[Math.floor(Math.random() * reflections.length)];
  },

  contemplateLegacy(): { question: string; reflection: string } {
    const questions = [
      'Was moechtest du hinterlassen?',
      'Woran sollen sich Menschen bei dir erinnern?',
      'Welchen Unterschied machst du in der Welt?',
      'Was ist dein einzigartiger Beitrag?'
    ];
    return {
      question: questions[Math.floor(Math.random() * questions.length)],
      reflection: 'Dein Vermaechtnis wird nicht nur in grossen Taten gemessen, sondern in jedem Moment der Guete.'
    };
  },

  logReflection(reflection: string, lifePhase?: string) {
    const id = nanoid();
    db.prepare('INSERT INTO mortality_reflections (id, reflection, life_phase) VALUES (?, ?, ?)')
      .run(id, reflection, lifePhase || null);
    return { id, logged: true };
  }
};

// ============================================================================
// MODULE: CHECKIN
// ============================================================================

const CheckinModule = {
  create(data: {
    mood: number;
    energy: number;
    highlights?: string;
    challenges?: string;
    gratitude?: string;
    intentions?: string;
  }) {
    const id = nanoid();
    const date = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO checkins (id, date, mood, energy, highlights, challenges, gratitude, intentions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, date, data.mood, data.energy, data.highlights || null, data.challenges || null, data.gratitude || null, data.intentions || null);

    return { id, date, logged: true };
  },

  getHistory(days: number = 7) {
    return db.prepare('SELECT * FROM checkins ORDER BY date DESC LIMIT ?').all(days);
  },

  getTrend() {
    const checkins = db.prepare('SELECT mood, energy, date FROM checkins ORDER BY date DESC LIMIT 7').all() as any[];
    if (checkins.length < 2) return { trend: 'insufficient_data' };

    const avgMood = checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length;
    const avgEnergy = checkins.reduce((sum, c) => sum + c.energy, 0) / checkins.length;

    return {
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      trend: avgMood > 6 ? 'positive' : avgMood < 4 ? 'challenging' : 'stable',
      days: checkins.length
    };
  },

  getPrompts(): string[] {
    return [
      'Wie fuehlt sich dein Koerper heute an? (1-10)',
      'Wie ist deine Energie? (1-10)',
      'Was war heute ein Highlight?',
      'Was war herausfordernd?',
      'Wofuer bist du dankbar?',
      'Was ist deine Intention fuer morgen?'
    ];
  }
};

// ============================================================================
// MODULE: PROACTIVE
// ============================================================================

const ProactiveModule = {
  generateMessage(context?: string): { type: string; content: string } {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
      return {
        type: 'morning',
        content: 'Guten Morgen! Ein neuer Tag voller Moeglichkeiten. Was moechtest du heute erreichen?'
      };
    }

    if (hour >= 12 && hour < 14) {
      return {
        type: 'midday',
        content: 'Zeit fuer eine kleine Pause? Wie laeuft dein Tag bisher?'
      };
    }

    if (hour >= 18 && hour < 21) {
      return {
        type: 'evening',
        content: 'Der Tag neigt sich dem Ende. Was war heute gut? Was hast du gelernt?'
      };
    }

    if (hour >= 21 || hour < 6) {
      return {
        type: 'night',
        content: 'Denk daran, dass Ruhe wichtig ist. Schlaf gut!'
      };
    }

    return {
      type: 'general',
      content: 'Ich bin hier, wenn du mich brauchst. Wie kann ich dir helfen?'
    };
  },

  scheduleReminder(type: string, content: string) {
    const id = nanoid();
    db.prepare('INSERT INTO proactive_messages (id, type, content) VALUES (?, ?, ?)')
      .run(id, type, content);
    return { id, scheduled: true };
  },

  getUnacknowledged() {
    return db.prepare('SELECT * FROM proactive_messages WHERE acknowledged = 0 ORDER BY sent_at DESC').all();
  },

  acknowledge(id: string) {
    db.prepare('UPDATE proactive_messages SET acknowledged = 1 WHERE id = ?').run(id);
    return { acknowledged: true };
  }
};

// ============================================================================
// MODULE: GOALS
// ============================================================================

const GoalsModule = {
  create(area: string, goal: string, why?: string) {
    const id = nanoid();
    db.prepare('INSERT INTO life_goals (id, area, goal, why) VALUES (?, ?, ?, ?)')
      .run(id, area, goal, why || null);
    return { id, created: true };
  },

  getAll() {
    return db.prepare('SELECT * FROM life_goals ORDER BY created_at DESC').all();
  },

  getByArea(area: string) {
    return db.prepare('SELECT * FROM life_goals WHERE area = ? ORDER BY created_at DESC').all(area);
  },

  updateProgress(id: string, progress: number) {
    db.prepare('UPDATE life_goals SET progress = ? WHERE id = ?').run(progress, id);
    return { updated: true };
  },

  getAreas(): string[] {
    return ['health', 'relationships', 'career', 'finance', 'personal_growth', 'creativity', 'spirituality', 'fun'];
  }
};

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// Health & Info
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Life Companion Unified v1.0',
    port: PORT,
    modules: ['core', 'support', 'gratitude', 'mortality', 'checkin', 'proactive', 'goals'],
    activeSessions: activeSessions.size
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Toobix Life Companion',
    version: '1.0',
    greeting: CoreModule.getGreeting(),
    endpoints: {
      chat: ['POST /chat', 'GET /greeting'],
      support: ['POST /support/start', 'POST /support/message', 'GET /support/:id', 'POST /support/:id/end'],
      gratitude: ['POST /gratitude', 'GET /gratitude', 'GET /gratitude/prompt', 'GET /gratitude/excavate'],
      mortality: ['GET /mortality/phases', 'GET /mortality/memento', 'GET /mortality/legacy', 'POST /mortality/reflect'],
      checkin: ['POST /checkin', 'GET /checkin/history', 'GET /checkin/trend', 'GET /checkin/prompts'],
      proactive: ['GET /proactive', 'POST /proactive/schedule', 'POST /proactive/:id/ack'],
      goals: ['POST /goals', 'GET /goals', 'GET /goals/areas', 'PUT /goals/:id/progress']
    }
  });
});

// ===== CHAT =====
app.post('/chat', async (req, res) => {
  const response = await CoreModule.chat(req.body.message, req.body.userName);
  res.json({ response });
});

app.get('/greeting', (req, res) => {
  res.json({ greeting: CoreModule.getGreeting(req.query.name as string) });
});

// ===== SUPPORT =====
app.post('/support/start', (req, res) => {
  const session = SupportModule.startSession(req.body.userName);
  res.json({ sessionId: session.id, greeting: session.messages[0].content });
});

app.post('/support/message', async (req, res) => {
  try {
    const result = await SupportModule.sendMessage(req.body.sessionId, req.body.message);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

app.get('/support/:id', (req, res) => {
  const session = SupportModule.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

app.post('/support/:id/end', (req, res) => {
  res.json(SupportModule.endSession(req.params.id));
});

// ===== GRATITUDE =====
app.post('/gratitude', (req, res) => {
  res.json(GratitudeModule.log(req.body.content, req.body.category, req.body.depth));
});

app.get('/gratitude', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(GratitudeModule.getEntries(limit));
});

app.get('/gratitude/prompt', (_req, res) => {
  res.json({ prompt: GratitudeModule.getRandomPrompt() });
});

app.get('/gratitude/excavate', async (_req, res) => {
  res.json(await GratitudeModule.excavateGratitude());
});

// ===== MORTALITY =====
app.get('/mortality/phases', (_req, res) => {
  res.json(MortalityModule.getLifePhases());
});

app.get('/mortality/memento', (_req, res) => {
  res.json({ reflection: MortalityModule.getDailyMementoMori() });
});

app.get('/mortality/legacy', (_req, res) => {
  res.json(MortalityModule.contemplateLegacy());
});

app.post('/mortality/reflect', (req, res) => {
  res.json(MortalityModule.logReflection(req.body.reflection, req.body.lifePhase));
});

// ===== CHECKIN =====
app.post('/checkin', (req, res) => {
  res.json(CheckinModule.create(req.body));
});

app.get('/checkin/history', (req, res) => {
  const days = parseInt(req.query.days as string) || 7;
  res.json(CheckinModule.getHistory(days));
});

app.get('/checkin/trend', (_req, res) => {
  res.json(CheckinModule.getTrend());
});

app.get('/checkin/prompts', (_req, res) => {
  res.json({ prompts: CheckinModule.getPrompts() });
});

// ===== PROACTIVE =====
app.get('/proactive', (_req, res) => {
  res.json(ProactiveModule.generateMessage());
});

app.post('/proactive/schedule', (req, res) => {
  res.json(ProactiveModule.scheduleReminder(req.body.type, req.body.content));
});

app.get('/proactive/pending', (_req, res) => {
  res.json(ProactiveModule.getUnacknowledged());
});

app.post('/proactive/:id/ack', (req, res) => {
  res.json(ProactiveModule.acknowledge(req.params.id));
});

// ===== GOALS =====
app.post('/goals', (req, res) => {
  res.json(GoalsModule.create(req.body.area, req.body.goal, req.body.why));
});

app.get('/goals', (_req, res) => {
  res.json(GoalsModule.getAll());
});

app.get('/goals/areas', (_req, res) => {
  res.json({ areas: GoalsModule.getAreas() });
});

app.get('/goals/area/:area', (req, res) => {
  res.json(GoalsModule.getByArea(req.params.area));
});

app.put('/goals/:id/progress', (req, res) => {
  res.json(GoalsModule.updateProgress(req.params.id, req.body.progress));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('============================================================');
  console.log('       TOOBIX LIFE COMPANION UNIFIED v1.0');
  console.log('============================================================');
  console.log('');
  console.log(`  Port: ${PORT}`);
  console.log('  Modules: Core, Support, Gratitude, Mortality, Checkin, Proactive, Goals');
  console.log('');
  console.log('  ' + CoreModule.getGreeting());
  console.log('');
  console.log('============================================================');
  console.log('');
});
