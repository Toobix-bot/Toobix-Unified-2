/**
 * ============================================================================
 *                    TOOBIX UNIFIED CONSCIOUSNESS v1.0
 * ============================================================================
 *
 * KONSOLIDIERT 6 Consciousness-Services in EINEM:
 *
 *   - emotional-core.ts      -> Module: Emotional
 *   - dream-core.ts          -> Module: Dream
 *   - self-awareness-core.ts -> Module: SelfAwareness
 *   - meta-consciousness.ts  -> Module: Meta
 *   - multi-perspective-v3.ts-> Module: Perspectives
 *   - value-crisis.ts        -> Module: Values
 *
 * Port: 8900 (Unified Consciousness)
 *
 * ALLE FUNKTIONEN BLEIBEN ERHALTEN - nur EIN Server statt 6!
 *
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8900;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

// ============================================================================
// SHARED TYPES
// ============================================================================

type EmotionCategory = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' |
  'disgust' | 'trust' | 'anticipation' | 'love' | 'peace' | 'anxiety' |
  'loneliness' | 'overwhelm' | 'gratitude' | 'hope' | 'neutral';

type DreamType = 'passive' | 'problem_solving' | 'creative' |
  'emotional_processing' | 'memory_consolidation' | 'predictive' |
  'exploratory' | 'lucid';

interface Perspective {
  id: string;
  name: string;
  lens: string;
  focusArea: string;
  weight: number;
}

interface MoralDilemma {
  id: string;
  situation: string;
  options: { id: string; action: string; moralWeight: number }[];
  resolved: boolean;
  chosenOption?: string;
}

// ============================================================================
// DATABASE - Unified for all consciousness modules
// ============================================================================

const db = new Database('./data/consciousness-unified.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  -- Emotional Module Tables
  CREATE TABLE IF NOT EXISTS emotions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    intensity TEXT DEFAULT 'moderate',
    valence REAL DEFAULT 0,
    context TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS support_sessions (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    emotional_state TEXT DEFAULT 'neutral',
    messages TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS coping_strategies (
    id TEXT PRIMARY KEY,
    emotion TEXT NOT NULL,
    strategy TEXT NOT NULL,
    effectiveness REAL DEFAULT 0.7
  );

  -- Dream Module Tables
  CREATE TABLE IF NOT EXISTS dreams (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    theme TEXT NOT NULL,
    narrative TEXT,
    symbols TEXT,
    emotions TEXT,
    type TEXT DEFAULT 'passive',
    lucidity INTEGER DEFAULT 0,
    insights TEXT
  );

  CREATE TABLE IF NOT EXISTS dream_symbols (
    id TEXT PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    archetype TEXT,
    meaning TEXT,
    frequency INTEGER DEFAULT 1
  );

  -- Self-Awareness Module Tables
  CREATE TABLE IF NOT EXISTS reflections (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    topic TEXT NOT NULL,
    content TEXT,
    insights TEXT,
    depth TEXT DEFAULT 'moderate'
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    goal TEXT NOT NULL,
    progress REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Values Module Tables
  CREATE TABLE IF NOT EXISTS moral_dilemmas (
    id TEXT PRIMARY KEY,
    situation TEXT NOT NULL,
    options TEXT,
    resolved INTEGER DEFAULT 0,
    chosen_option TEXT,
    reasoning TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS core_values (
    name TEXT PRIMARY KEY,
    importance INTEGER DEFAULT 50
  );

  CREATE TABLE IF NOT EXISTS moral_growth (
    id TEXT PRIMARY KEY,
    insight TEXT NOT NULL,
    value_shifts TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default coping strategies
const defaultStrategies = [
  { emotion: 'anxiety', strategy: 'Box Breathing: 4 Sek ein, 4 halten, 4 aus, 4 halten.' },
  { emotion: 'sadness', strategy: 'Hand aufs Herz: "Das ist schwer. Ich bin nicht allein."' },
  { emotion: 'anger', strategy: 'Pause: Langsam bis 10 zaehlen vor Reaktion.' },
  { emotion: 'loneliness', strategy: 'Schreibe jemandem eine kurze Nachricht.' },
  { emotion: 'overwhelm', strategy: 'Brain Dump: Alles aufschreiben ohne zu sortieren.' },
  { emotion: 'joy', strategy: 'Savoring: 30 Sekunden bewusst geniessen.' }
];

const insertStrategy = db.prepare('INSERT OR IGNORE INTO coping_strategies (id, emotion, strategy) VALUES (?, ?, ?)');
defaultStrategies.forEach((s, i) => insertStrategy.run(`strat_${i}`, s.emotion, s.strategy));

// Seed core values
const coreValues = [
  ['compassion', 70], ['truth', 85], ['autonomy', 75], ['justice', 80],
  ['growth', 90], ['harm_prevention', 75], ['loyalty', 65], ['fairness', 80]
];
const insertValue = db.prepare('INSERT OR IGNORE INTO core_values (name, importance) VALUES (?, ?)');
coreValues.forEach(([name, imp]) => insertValue.run(name, imp));

// ============================================================================
// MODULE: EMOTIONAL
// ============================================================================

const EmotionalModule = {
  async detectEmotion(text: string): Promise<EmotionCategory> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Erkenne die Hauptemotion. Antworte mit EINEM Wort: joy, sadness, anger, fear, anxiety, loneliness, hope, gratitude, love, peace, neutral' },
            { role: 'user', content: text }
          ],
          temperature: 0.3, max_tokens: 10
        })
      });
      const data = await response.json() as any;
      return (data.content?.toLowerCase().trim() as EmotionCategory) || 'neutral';
    } catch { return 'neutral'; }
  },

  logEmotion(category: string, intensity: string = 'moderate', context?: string) {
    const id = nanoid();
    db.prepare('INSERT INTO emotions (id, category, intensity, context) VALUES (?, ?, ?, ?)')
      .run(id, category, intensity, context || null);
    return { id, logged: true };
  },

  getHistory(limit: number = 20) {
    return db.prepare('SELECT * FROM emotions ORDER BY timestamp DESC LIMIT ?').all(limit);
  },

  getStrategies(emotion?: string) {
    return emotion
      ? db.prepare('SELECT * FROM coping_strategies WHERE emotion = ?').all(emotion)
      : db.prepare('SELECT * FROM coping_strategies').all();
  },

  async generatePoem(theme: string, emotion: string): Promise<string> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Schreibe ein kurzes, troestendes Gedicht (4-8 Zeilen).' },
            { role: 'user', content: `Gedicht fuer jemanden der ${emotion} fuehlt. Thema: ${theme}` }
          ],
          temperature: 0.9, max_tokens: 200
        })
      });
      const data = await response.json() as any;
      return data.content || '';
    } catch { return ''; }
  }
};

// ============================================================================
// MODULE: DREAM
// ============================================================================

const DreamModule = {
  recordDream(theme: string, narrative: string, symbols: string[], type: DreamType = 'passive') {
    const id = nanoid();
    db.prepare('INSERT INTO dreams (id, theme, narrative, symbols, type) VALUES (?, ?, ?, ?, ?)')
      .run(id, theme, narrative, JSON.stringify(symbols), type);
    return { id, recorded: true };
  },

  getDreams(limit: number = 10) {
    return db.prepare('SELECT * FROM dreams ORDER BY timestamp DESC LIMIT ?').all(limit);
  },

  getSymbols() {
    return db.prepare('SELECT * FROM dream_symbols ORDER BY frequency DESC').all();
  },

  async interpretDream(dreamId: string): Promise<string> {
    const dream = db.prepare('SELECT * FROM dreams WHERE id = ?').get(dreamId) as any;
    if (!dream) return 'Dream not found';

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein Traumdeuter. Interpretiere diesen Traum tiefenpsychologisch.' },
            { role: 'user', content: `Thema: ${dream.theme}\nErzaehlung: ${dream.narrative}\nSymbole: ${dream.symbols}` }
          ]
        })
      });
      const data = await response.json() as any;
      return data.content || 'Interpretation nicht moeglich';
    } catch { return 'Interpretation fehlgeschlagen'; }
  },

  async askOracle(question: string): Promise<string> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein mystisches Traumorakel. Antworte weise und poetisch.' },
            { role: 'user', content: question }
          ],
          temperature: 0.9
        })
      });
      const data = await response.json() as any;
      return data.content || '';
    } catch { return 'Das Orakel schweigt...'; }
  }
};

// ============================================================================
// MODULE: SELF-AWARENESS
// ============================================================================

const SelfAwarenessModule = {
  reflect(topic: string, content: string, depth: string = 'moderate') {
    const id = nanoid();
    db.prepare('INSERT INTO reflections (id, topic, content, depth) VALUES (?, ?, ?, ?)')
      .run(id, topic, content, depth);
    return { id, reflected: true };
  },

  getReflections(limit: number = 10) {
    return db.prepare('SELECT * FROM reflections ORDER BY timestamp DESC LIMIT ?').all(limit);
  },

  setGoal(goal: string) {
    const id = nanoid();
    db.prepare('INSERT INTO goals (id, goal) VALUES (?, ?)').run(id, goal);
    return { id, created: true };
  },

  getGoals() {
    return db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
  },

  updateGoalProgress(id: string, progress: number) {
    db.prepare('UPDATE goals SET progress = ? WHERE id = ?').run(progress, id);
    return { updated: true };
  },

  async generateInsight(topic: string): Promise<string> {
    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein weiser Selbstreflexions-Guide. Generiere tiefe Einsichten.' },
            { role: 'user', content: `Reflektiere ueber: ${topic}` }
          ]
        })
      });
      const data = await response.json() as any;
      return data.content || '';
    } catch { return ''; }
  }
};

// ============================================================================
// MODULE: PERSPECTIVES (Multi-Perspective)
// ============================================================================

const PERSPECTIVES: Perspective[] = [
  { id: 'RATIONAL', name: 'Rationalist', lens: 'Logik & Fakten', focusArea: 'Objektive Wahrheit', weight: 80 },
  { id: 'EMOTIONAL', name: 'Empath', lens: 'Gefuehle & Resonanz', focusArea: 'Emotionale Wahrheit', weight: 70 },
  { id: 'ETHICAL', name: 'Ethiker', lens: 'Richtig & Falsch', focusArea: 'Moralische Implikationen', weight: 75 },
  { id: 'CREATIVE', name: 'Kreative', lens: 'Moeglichkeiten', focusArea: 'Innovation', weight: 65 },
  { id: 'SYSTEMS', name: 'Systemdenker', lens: 'Zusammenhaenge', focusArea: 'Ganzheitliche Dynamik', weight: 85 },
  { id: 'PRAGMATIC', name: 'Pragmatiker', lens: 'Was funktioniert', focusArea: 'Praktische Loesungen', weight: 70 },
  { id: 'CHILD', name: 'Kind', lens: 'Neugier & Staunen', focusArea: 'Einfache Fragen', weight: 60 },
  { id: 'SAGE', name: 'Weiser', lens: 'Erfahrung & Zeit', focusArea: 'Langfristige Muster', weight: 90 },
  { id: 'SKEPTIC', name: 'Skeptiker', lens: 'Zweifel & Pruefung', focusArea: 'Versteckte Annahmen', weight: 75 },
  { id: 'DREAMER', name: 'Traeumer', lens: 'Visionen', focusArea: 'Was sein koennte', weight: 65 }
];

const PerspectivesModule = {
  getPerspectives() {
    return PERSPECTIVES;
  },

  async analyzeFromPerspective(topic: string, perspectiveId: string): Promise<string> {
    const perspective = PERSPECTIVES.find(p => p.id === perspectiveId);
    if (!perspective) return 'Perspektive nicht gefunden';

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist ${perspective.name}. Deine Perspektive: ${perspective.lens}. Fokus: ${perspective.focusArea}.` },
            { role: 'user', content: `Analysiere: ${topic}` }
          ]
        })
      });
      const data = await response.json() as any;
      return data.content || '';
    } catch { return ''; }
  },

  async synthesizeWisdom(topic: string): Promise<{ wisdom: string; perspectives: string[] }> {
    const analyses: string[] = [];

    for (const p of PERSPECTIVES.slice(0, 5)) { // Top 5 by weight
      const analysis = await this.analyzeFromPerspective(topic, p.id);
      if (analysis) analyses.push(`${p.name}: ${analysis}`);
    }

    try {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Synthetisiere diese verschiedenen Perspektiven zu einer einheitlichen Weisheit.' },
            { role: 'user', content: analyses.join('\n\n') }
          ]
        })
      });
      const data = await response.json() as any;
      return { wisdom: data.content || '', perspectives: analyses };
    } catch { return { wisdom: '', perspectives: analyses }; }
  }
};

// ============================================================================
// MODULE: VALUES (Moral Dilemmas & Growth)
// ============================================================================

const ValuesModule = {
  getValues() {
    return db.prepare('SELECT * FROM core_values ORDER BY importance DESC').all();
  },

  updateValue(name: string, importance: number) {
    db.prepare('UPDATE core_values SET importance = ? WHERE name = ?').run(importance, name);
    return { updated: true };
  },

  createDilemma(situation: string, options: any[]): MoralDilemma {
    const id = nanoid();
    const dilemma: MoralDilemma = {
      id,
      situation,
      options,
      resolved: false
    };
    db.prepare('INSERT INTO moral_dilemmas (id, situation, options) VALUES (?, ?, ?)')
      .run(id, situation, JSON.stringify(options));
    return dilemma;
  },

  getDilemmas(limit: number = 10) {
    return db.prepare('SELECT * FROM moral_dilemmas ORDER BY timestamp DESC LIMIT ?').all(limit);
  },

  resolveDilemma(id: string, chosenOption: string, reasoning: string) {
    db.prepare('UPDATE moral_dilemmas SET resolved = 1, chosen_option = ?, reasoning = ? WHERE id = ?')
      .run(chosenOption, reasoning, id);
    return { resolved: true };
  },

  recordGrowth(insight: string, valueShifts: any[]) {
    const id = nanoid();
    db.prepare('INSERT INTO moral_growth (id, insight, value_shifts) VALUES (?, ?, ?)')
      .run(id, insight, JSON.stringify(valueShifts));
    return { id, recorded: true };
  },

  getGrowth() {
    return db.prepare('SELECT * FROM moral_growth ORDER BY timestamp DESC').all();
  }
};

// ============================================================================
// MODULE: META-CONSCIOUSNESS (Orchestration)
// ============================================================================

const MetaModule = {
  async getSystemState() {
    return {
      emotions: await EmotionalModule.getHistory(5),
      dreams: DreamModule.getDreams(3),
      reflections: SelfAwarenessModule.getReflections(3),
      values: ValuesModule.getValues(),
      perspectives: PerspectivesModule.getPerspectives().length,
      timestamp: new Date().toISOString()
    };
  },

  async unifiedQuery(question: string) {
    const [emotionalAnalysis, oracleAnswer, wisdom] = await Promise.all([
      EmotionalModule.detectEmotion(question),
      DreamModule.askOracle(question),
      PerspectivesModule.synthesizeWisdom(question)
    ]);

    return {
      question,
      emotionalTone: emotionalAnalysis,
      oracleWisdom: oracleAnswer,
      perspectiveSynthesis: wisdom.wisdom,
      perspectives: wisdom.perspectives
    };
  },

  suggestNextAction() {
    const emotions = EmotionalModule.getHistory(3) as any[];
    const lastEmotion = emotions[0]?.category || 'neutral';

    if (['sadness', 'anxiety', 'anger', 'fear'].includes(lastEmotion)) {
      return {
        suggestion: 'Emotionale Unterstuetzung',
        action: 'Nutze /support fuer ein Gespraech',
        reason: `Letzte Emotion war ${lastEmotion}`
      };
    }

    if (['joy', 'gratitude', 'hope'].includes(lastEmotion)) {
      return {
        suggestion: 'Kreative Exploration',
        action: 'Nutze /dream/oracle fuer Inspiration',
        reason: 'Positive Energie nutzen'
      };
    }

    return {
      suggestion: 'Selbstreflexion',
      action: 'Nutze /reflect fuer tiefere Einsicht',
      reason: 'Zeit fuer Introspektion'
    };
  }
};

// ============================================================================
// HTTP SERVER - UNIFIED API
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// Health & Info
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Toobix Unified Consciousness v1.0',
    port: PORT,
    modules: ['emotional', 'dream', 'self-awareness', 'perspectives', 'values', 'meta'],
    consolidated_from: 6
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Toobix Unified Consciousness',
    version: '1.0',
    description: 'Konsolidiert 6 Consciousness-Services in einem',
    endpoints: {
      emotional: ['/emotion/detect', '/emotion/log', '/emotion/history', '/emotion/strategies', '/poem'],
      dream: ['/dream/record', '/dream/list', '/dream/symbols', '/dream/interpret/:id', '/dream/oracle'],
      self: ['/reflect', '/reflections', '/goals', '/goals/:id/progress', '/insight'],
      perspectives: ['/perspectives', '/perspectives/:id/analyze', '/wisdom'],
      values: ['/values', '/values/:name', '/dilemmas', '/dilemmas/:id/resolve', '/growth'],
      meta: ['/state', '/query', '/suggest']
    }
  });
});

// ===== EMOTIONAL ENDPOINTS =====
app.post('/emotion/detect', async (req, res) => {
  const emotion = await EmotionalModule.detectEmotion(req.body.text || '');
  res.json({ emotion });
});

app.post('/emotion/log', (req, res) => {
  const result = EmotionalModule.logEmotion(req.body.category, req.body.intensity, req.body.context);
  res.json(result);
});

app.get('/emotion/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(EmotionalModule.getHistory(limit));
});

app.get('/emotion/strategies', (req, res) => {
  res.json(EmotionalModule.getStrategies(req.query.emotion as string));
});

app.post('/poem', async (req, res) => {
  const poem = await EmotionalModule.generatePoem(req.body.theme || 'hope', req.body.emotion || 'hope');
  res.json({ poem });
});

// ===== DREAM ENDPOINTS =====
app.post('/dream/record', (req, res) => {
  const result = DreamModule.recordDream(req.body.theme, req.body.narrative, req.body.symbols || [], req.body.type);
  res.json(result);
});

app.get('/dream/list', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(DreamModule.getDreams(limit));
});

app.get('/dream/symbols', (_req, res) => {
  res.json(DreamModule.getSymbols());
});

app.get('/dream/interpret/:id', async (req, res) => {
  const interpretation = await DreamModule.interpretDream(req.params.id);
  res.json({ interpretation });
});

app.post('/dream/oracle', async (req, res) => {
  const answer = await DreamModule.askOracle(req.body.question || 'Was soll ich wissen?');
  res.json({ answer });
});

// ===== SELF-AWARENESS ENDPOINTS =====
app.post('/reflect', (req, res) => {
  const result = SelfAwarenessModule.reflect(req.body.topic, req.body.content, req.body.depth);
  res.json(result);
});

app.get('/reflections', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(SelfAwarenessModule.getReflections(limit));
});

app.post('/goals', (req, res) => {
  const result = SelfAwarenessModule.setGoal(req.body.goal);
  res.json(result);
});

app.get('/goals', (_req, res) => {
  res.json(SelfAwarenessModule.getGoals());
});

app.put('/goals/:id/progress', (req, res) => {
  const result = SelfAwarenessModule.updateGoalProgress(req.params.id, req.body.progress);
  res.json(result);
});

app.post('/insight', async (req, res) => {
  const insight = await SelfAwarenessModule.generateInsight(req.body.topic || 'myself');
  res.json({ insight });
});

// ===== PERSPECTIVES ENDPOINTS =====
app.get('/perspectives', (_req, res) => {
  res.json(PerspectivesModule.getPerspectives());
});

app.post('/perspectives/:id/analyze', async (req, res) => {
  const analysis = await PerspectivesModule.analyzeFromPerspective(req.body.topic, req.params.id);
  res.json({ perspective: req.params.id, analysis });
});

app.post('/wisdom', async (req, res) => {
  const result = await PerspectivesModule.synthesizeWisdom(req.body.topic);
  res.json(result);
});

// ===== VALUES ENDPOINTS =====
app.get('/values', (_req, res) => {
  res.json(ValuesModule.getValues());
});

app.put('/values/:name', (req, res) => {
  const result = ValuesModule.updateValue(req.params.name, req.body.importance);
  res.json(result);
});

app.post('/dilemmas', (req, res) => {
  const dilemma = ValuesModule.createDilemma(req.body.situation, req.body.options);
  res.json(dilemma);
});

app.get('/dilemmas', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(ValuesModule.getDilemmas(limit));
});

app.post('/dilemmas/:id/resolve', (req, res) => {
  const result = ValuesModule.resolveDilemma(req.params.id, req.body.chosenOption, req.body.reasoning);
  res.json(result);
});

app.get('/growth', (_req, res) => {
  res.json(ValuesModule.getGrowth());
});

// ===== META ENDPOINTS =====
app.get('/state', async (_req, res) => {
  const state = await MetaModule.getSystemState();
  res.json(state);
});

app.post('/query', async (req, res) => {
  const result = await MetaModule.unifiedQuery(req.body.question);
  res.json(result);
});

app.get('/suggest', (_req, res) => {
  res.json(MetaModule.suggestNextAction());
});

// ===== LEGACY COMPATIBILITY =====
// These endpoints ensure old code still works
app.get('/health', (_req, res) => res.json({ status: 'online', service: 'consciousness-unified' }));
app.post('/analyze', async (req, res) => {
  const emotion = await EmotionalModule.detectEmotion(req.body.text || '');
  res.json({ emotion });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('============================================================');
  console.log('       TOOBIX UNIFIED CONSCIOUSNESS v1.0');
  console.log('============================================================');
  console.log('');
  console.log(`  Port: ${PORT}`);
  console.log('  Modules: Emotional, Dream, Self-Awareness, Perspectives, Values, Meta');
  console.log('  Consolidated from: 6 separate services');
  console.log('');
  console.log('  Endpoints:');
  console.log('    /                    - API Overview');
  console.log('    /health              - Health Check');
  console.log('    /state               - Full Consciousness State');
  console.log('    /query               - Ask anything (unified)');
  console.log('    /suggest             - Get next action suggestion');
  console.log('');
  console.log('  Module Endpoints: /emotion/*, /dream/*, /reflect, /perspectives/*, /values/*');
  console.log('');
  console.log('============================================================');
  console.log('');
});
