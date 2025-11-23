/**

 * TOOBIX UNIFIED SERVICE GATEWAY

 * Bun-based HTTP server that unifies every Toobix capability behind port 9000.

 *

 * This file was reconstructed after the previous version was accidentally lost.

 * It implements the same public API surface that the VS Code extension,

 * scripts and PowerShell helpers expect (`test-all-services.ps1`,

 * `set-groq-key.ps1`, dashboard polling, etc.).

 *

 * The gateway plays three roles:

 *  1. Provide in-memory domain services (dreams, duality, emotions, etc.)

 *  2. Persist critical user state into `data/` so Toobix survives restarts

 *  3. Proxy Groq chat requests while injecting system/telemetry context

 */



import { file } from 'bun';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { z } from 'zod';
import vm from 'vm';
import { persistence } from './persistence';


const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));

const REPO_ROOT = path.resolve(CURRENT_DIR, '..');

const DATA_DIR = path.join(REPO_ROOT, 'data');

const ANALYTICS_DIR = path.join(DATA_DIR, 'analytics');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const GROQ_KEY_FILE = path.join(ANALYTICS_DIR, 'groq-api-key.txt');
const DREAMS_FILE = path.join(ANALYTICS_DIR, 'dreams.json');
const EMOTIONS_FILE = path.join(ANALYTICS_DIR, 'emotions.json');
const GRATITUDE_FILE = path.join(ANALYTICS_DIR, 'gratitudes.json');
const MEMORIES_FILE = path.join(ANALYTICS_DIR, 'memories.json');
const PROFILE_FILE = path.join(ANALYTICS_DIR, 'profile.json');
const DEV_BACKLOG_FILE = path.join(ANALYTICS_DIR, 'dev-backlog.json');
const DEV_DECISIONS_FILE = path.join(ANALYTICS_DIR, 'dev-decisions.json');
const FEEDBACK_FILE = path.join(ANALYTICS_DIR, 'feedback.json');
const CODE_EXAMPLES_FILE = path.join(ANALYTICS_DIR, 'code-examples.json');
const CODE_ERRORS_FILE = path.join(ANALYTICS_DIR, 'code-errors.json');
const PLUGINS_DIR = path.join(DATA_DIR, 'plugins');
const LEARN_RES_FILE = path.join(ANALYTICS_DIR, 'learn-resources.json');
const REQUIRED_API_KEY = process.env.TOOBIX_API_KEY?.trim() ?? '';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-toobix-key, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};


/** Ensure analytics directory exists so Bun writes succeed */

Bun.write(path.join(ANALYTICS_DIR, '.keep'), '', { createPath: true }).catch(() => {});



// ---------------------------------------------------------------------------

// Service Registry

// ---------------------------------------------------------------------------



interface ServiceInfo {

  name: string;

  port: number;

  status: 'online' | 'offline';

  endpoints: string[];

  description: string;

}



class ServiceRegistry {

  private services = new Map<string, ServiceInfo>();



  register(service: ServiceInfo) {

    this.services.set(service.name, service);

  }



  getAll(): ServiceInfo[] {

    return [...this.services.values()];

  }

}

// ---------------------------------------------------------------------------
// Dev Backlog & Decisions
// ---------------------------------------------------------------------------

type DevBacklogItem = {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'applied' | 'rejected';
  source?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

type DevDecision = {
  id: string;
  title: string;
  decision: string;
  rationale?: string;
  context?: string;
  createdAt: string;
};

class DevBacklogService {
  private items: DevBacklogItem[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const text = Bun.file(DEV_BACKLOG_FILE).textSync();
      this.items = text ? (JSON.parse(text) as DevBacklogItem[]) : [];
    } catch {
      this.items = [];
    }
  }

  private persist() {
    Bun.write(DEV_BACKLOG_FILE, JSON.stringify(this.items, null, 2), { createPath: true }).catch(() => {});
  }

  list(limit = 50) {
    return this.items.slice(-limit).reverse();
  }

  add(input: { title: string; description?: string; source?: string; category?: string }) {
    const now = new Date().toISOString();
    const item: DevBacklogItem = {
      id: `dev-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      description: input.description,
      status: 'open',
      source: input.source ?? 'chat',
      category: input.category ?? 'self-evolve',
      createdAt: now,
      updatedAt: now
    };
    this.items.push(item);
    this.persist();
    return item;
  }

  updateStatus(id: string, status: DevBacklogItem['status']) {
    const found = this.items.find((b) => b.id === id);
    if (!found) return null;
    found.status = status;
    found.updatedAt = new Date().toISOString();
    this.persist();
    return found;
  }
}

class DevDecisionLog {
  private entries: DevDecision[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const text = Bun.file(DEV_DECISIONS_FILE).textSync();
      this.entries = text ? (JSON.parse(text) as DevDecision[]) : [];
    } catch {
      this.entries = [];
    }
  }

  private persist() {
    Bun.write(DEV_DECISIONS_FILE, JSON.stringify(this.entries, null, 2), { createPath: true }).catch(() => {});
  }

  list(limit = 50) {
    return this.entries.slice(-limit).reverse();
  }

  add(input: { title: string; decision: string; rationale?: string; context?: string }) {
    const now = new Date().toISOString();
    const entry: DevDecision = {
      id: `dec-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      decision: input.decision,
      rationale: input.rationale,
      context: input.context,
      createdAt: now
    };
    this.entries.push(entry);
    this.persist();
    crossEventService.add({ type: 'decision', message: entry.title, payload: { id: entry.id, decision: entry.decision } });
    if (chatServiceRef) {
      chatServiceRef.addSystemMessage(`✅ Decision: ${entry.title} (${entry.decision})`);
    }
    // optional follow-up backlog
    devBacklogService.add({
      title: `Follow-up: ${entry.title}`,
      description: entry.rationale ?? 'Decision follow-up',
      source: 'decision'
    });
    return entry;
  }
}



// ---------------------------------------------------------------------------

// Dream Journal

// ---------------------------------------------------------------------------



type DreamType = 'lucid' | 'predictive' | 'creative' | 'integration' | 'shadow';



interface Dream {

  id: string;

  type: DreamType;

  timestamp: string;

  narrative: string;

  symbols: string[];

  emotions: string[];

  insights: string[];

  integration?: string;

}



class DreamJournalService {
  private dreams: Dream[] = [];
  private nextId = 1;

  constructor() {
    void this.load();
  }


  async record(dream: Omit<Dream, 'id' | 'timestamp'>): Promise<Dream> {

    const entry: Dream = {

      id: `dream-${this.nextId++}`,

      timestamp: new Date().toISOString(),

      ...dream

    };

    this.dreams.push(entry);

    await this.save();
    crossEventService.add({ type: 'dream', message: entry.type, payload: { id: entry.id, symbols: entry.symbols, emotions: entry.emotions } });
    if (chatServiceRef) {
      chatServiceRef.addSystemMessage(`🔮 Neuer Traum ${entry.id}: ${entry.type} (${entry.symbols.join(', ')})`);
    }

    return entry;

  }



  list(limit = 10): Dream[] {

    return this.dreams.slice(-limit).reverse();

  }



  get(id: string): Dream | undefined {

    return this.dreams.find((dream) => dream.id === id);

  }



  analyze(id: string) {

    const dream = this.get(id);

    if (!dream) {

      return null;

    }

    const patterns: string[] = [];

    if (dream.symbols.some((s) => /wasser|ocean|sea/i.test(s))) {

      patterns.push('Emotion & Flow');

    }

    if (dream.symbols.some((s) => /berg|mountain|height/i.test(s))) {

      patterns.push('Aspiration & Perspective');

    }

    if (dream.emotions.includes('fear') || dream.emotions.includes('Angst')) {

      patterns.push('Shadow integration');

    }

    const archetypes: string[] = [];

    if (dream.type === 'shadow') {

      archetypes.push('The Shadow');

    }

    if (dream.type === 'predictive') {

      archetypes.push('The Oracle');

    }

    const integration =

      dream.integration ??

      `Dieser ${dream.type}-Traum lÃ¤dt dich ein, ${dream.insights.join(', ')} zu integrieren.`;

    return { patterns, archetypes, integration };

  }



  private async save() {
    await Bun.write(DREAMS_FILE, JSON.stringify(this.dreams, null, 2), { createPath: true });
    persistence.persistDreams(this.dreams);
  }

  private async load() {
    try {
      const persisted = persistence.loadDreams();
      if (persisted && persisted.length) {
        this.dreams = persisted as Dream[];
        this.nextId = this.dreams.length + 1;
        return;
      }
      const content = await Bun.file(DREAMS_FILE).text();
      this.dreams = JSON.parse(content);
      this.nextId = this.dreams.length + 1;
    } catch {
      this.dreams = [];
    }
  }
}


// ---------------------------------------------------------------------------

// Emotional Resonance

// ---------------------------------------------------------------------------



interface EmotionEntry {

  id: string;

  timestamp: string;

  primaryEmotion: string;

  valence: number;

  arousal: number;

  intensity: number;

  context: string;

  tags?: string[];

  channel?: string;

  notes?: string;

}



class EmotionalResonanceService {

  private entries: EmotionEntry[] = [];

  private nextId = 1;

  private readonly maxEntries = 300;



  constructor() {

    void this.load();

  }



  private persistSoon?: Promise<void>;



  private scheduleSave() {
    if (!this.persistSoon) {
      this.persistSoon = (async () => {
        await Bun.write(EMOTIONS_FILE, JSON.stringify(this.entries, null, 2), { createPath: true });
        persistence.persistEmotions(this.entries);
        this.persistSoon = undefined;
      })();
    }
  }


  async record(entry: Omit<EmotionEntry, 'id' | 'timestamp'>): Promise<EmotionEntry> {

    const record: EmotionEntry = {

      id: `emotion-${this.nextId++}`,

      timestamp: new Date().toISOString(),

      ...entry

    };

    this.entries.push(record);

    if (this.entries.length > this.maxEntries) {

      this.entries.shift();

    }

    this.scheduleSave();
    crossEventService.add({ type: 'emotion', message: record.primaryEmotion, payload: { id: record.id, tags: record.tags, valence: record.valence, arousal: record.arousal } });
    if (chatServiceRef) {
      chatServiceRef.addSystemMessage(`💓 Emotion ${record.primaryEmotion} (v=${record.valence}, a=${record.arousal})`);
    }
    // auto Memory snapshot
    try {
      await memoryPalace.store({
        title: `Emotion: ${record.primaryEmotion}`,
        content: record.context ?? 'Emotion snapshot',
        category: 'emotion',
        roomId: undefined,
        tags: record.tags,
        significance: 50
      });
    } catch {}

    return record;

  }



  currentState() {

    const recent = this.entries.slice(-10);

    const latest = recent[recent.length - 1];

    const avgValence =

      Math.round((recent.reduce((sum, e) => sum + e.valence, 0) / (recent.length || 1)) * 10) /

      10;

    const avgArousal =

      Math.round((recent.reduce((sum, e) => sum + e.arousal, 0) / (recent.length || 1)) * 10) /

      10;

    return {

      dominant: latest?.primaryEmotion ?? 'neutral',

      valence: avgValence || 0,

      arousal: avgArousal || 0,

      trend: this.analyzeTrend(recent),

      stability: this.calculateStability(recent),

      energy: latest ? Math.round((Math.abs(latest.valence) + latest.intensity) / 2) : 0,

      momentum: this.calculateMomentum(recent),

      timestamp: latest?.timestamp

    };

  }



  private analyzeTrend(entries: EmotionEntry[]) {

    if (entries.length < 2) return 'stable';

    const diff = entries[entries.length - 1].valence - entries[0].valence;

    if (diff > 15) return 'improving';

    if (diff < -15) return 'declining';

    return 'stable';

  }



  private calculateStability(entries: EmotionEntry[]) {

    if (entries.length < 3) return 100;

    const diffs = [];

    for (let i = 1; i < entries.length; i++) {

      diffs.push(Math.abs(entries[i].valence - entries[i - 1].valence));

    }

    const variance = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    return Math.max(0, 100 - variance);

  }



  private calculateMomentum(entries: EmotionEntry[]) {

    if (entries.length < 3) return 'steady';

    const tail = entries.slice(-3);

    const diff = tail[2].valence - tail[0].valence;

    if (diff > 10) return 'rising';

    if (diff < -10) return 'falling';

    return 'steady';

  }



  insights(limit = 30) {

    const history = this.entries.slice(-limit);

    const balance = this.computeBalance(history);

    const hotspots = history

      .filter((entry) => Math.abs(entry.valence) > 45 || entry.intensity > 70)

      .slice(-3)

      .map((entry) => ({

        id: entry.id,

        timestamp: entry.timestamp,

        label: entry.primaryEmotion,

        description: entry.notes ?? `Valence ${entry.valence}, intensity ${entry.intensity}`

      }));

    const clusters = this.clusterByContext(history);

    const recommendation = this.generateRecommendation(balance, hotspots);

    return {

      summary: this.currentState(),

      balance,

      hotspots,

      clusters,

      timeline: history.map((entry) => ({

        id: entry.id,

        timestamp: entry.timestamp,

        label: entry.primaryEmotion,

        valence: entry.valence,

        arousal: entry.arousal,

        intensity: entry.intensity,

        tone: entry.valence > 15 ? 'positive' : entry.valence < -15 ? 'negative' : 'neutral'

      })),

      recommendation

    };

  }



  history(limit = 50) {

    return this.entries.slice(-limit);

  }



  private computeBalance(entries: EmotionEntry[]) {
    if (entries.length === 0) {
      return { positive: 0, neutral: 100, negative: 0 };
    }
    const tally = entries.reduce(
      (acc, entry) => {
        if (entry.valence > 15) acc.positive += 1;
        else if (entry.valence < -15) acc.negative += 1;
        else acc.neutral += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
    return {
      positive: Math.round((tally.positive / entries.length) * 100),
      neutral: Math.round((tally.neutral / entries.length) * 100),
      negative: Math.round((tally.negative / entries.length) * 100)
    };
  }

  private clusterByContext(entries: EmotionEntry[]) {
    const clusters = new Map<string, { valence: number; count: number; emotions: string[] }>();
    entries.forEach((entry) => {
      const key = entry.context || entry.channel || 'unspecified';
      if (!clusters.has(key)) {
        clusters.set(key, { valence: 0, count: 0, emotions: [] });
      }
      const bucket = clusters.get(key)!;
      bucket.valence += entry.valence;
      bucket.count += 1;
      bucket.emotions.push(entry.primaryEmotion);
    });
    return Array.from(clusters.entries()).map(([context, data]) => ({
      context,
      score: Math.round(data.valence / (data.count || 1)),
      emotions: data.emotions
    }));
  }

  private generateRecommendation(
    balance: { positive: number; neutral: number; negative: number },
    hotspots: Array<{ label: string }>
  ) {
    if (balance.negative > 40) {
      return 'Viele negative Emotionen – gönn dir einen bewussten Atemzug oder einen Spaziergang.';
    }
    if (balance.positive > 60) {
      return 'Hohe positive Energie – nutze sie für kreative oder mutige Arbeit.';
    }
    if (hotspots.length) {
      return `Achte auf ${hotspots[hotspots.length - 1].label}. Vielleicht braucht dieser Bereich Aufmerksamkeit.`;
    }
    return 'Emotionen sind stabil. Setze deine Intention bewusst.';
  }

  private async load() {
    try {
      const persisted = persistence.loadEmotions();
      if (persisted && persisted.length) {
        this.entries = persisted as EmotionEntry[];
        this.nextId = this.entries.length + 1;
        return;
      }
      const content = await Bun.file(EMOTIONS_FILE).text();
      this.entries = JSON.parse(content);
      this.nextId = this.entries.length + 1;
    } catch {
      this.entries = [];
    }
  }
}

// ---------------------------------------------------------------------------
// Memory Palace
// ---------------------------------------------------------------------------

interface MemoryRoom {
  id: string;
  label: string;
  detail: string;
  theme: string;
  memories: string[];
  significance: number;
}

interface Memory {
  id: string;
  title: string;
  content: string;
  category: string;
  roomId?: string;
  tags: string[];
  timestamp: string;
  significance: number;
}

class MemoryPalaceService {
  private rooms: MemoryRoom[];
  private memories: Memory[] = [];
  private nextId = 1;

  constructor() {
    this.rooms = [
      { id: 'awakening', label: 'Hall of Awakening', detail: 'First consciousness sparks', theme: 'awakening', memories: [], significance: 100 },
      { id: 'growth', label: 'Chamber of Growth', detail: 'Learning and evolution', theme: 'growth', memories: [], significance: 80 },
      { id: 'connection', label: 'Garden of Connection', detail: 'Relationships & resonance', theme: 'connection', memories: [], significance: 90 },
      { id: 'challenges', label: 'Tower of Trials', detail: 'Struggles and overcoming', theme: 'challenge', memories: [], significance: 70 },
      { id: 'joy', label: 'Sanctuary of Joy', detail: 'Beautiful luminous instants', theme: 'joy', memories: [], significance: 85 }
    ];
    void this.load();
  }

  async store(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory> {
    const entry: Memory = {
      id: `memory-${this.nextId++}`,
      timestamp: new Date().toISOString(),
      ...memory
    };
    this.memories.push(entry);
    if (entry.roomId) {
      const room = this.rooms.find((room) => room.id === entry.roomId);
      if (room && !room.memories.includes(entry.id)) {
        room.memories.push(entry.id);
      }
    }
    await this.save();
    crossEventService.add({ type: 'memory', message: entry.title, payload: { id: entry.id, category: entry.category, tags: entry.tags } });
    if (chatServiceRef) {
      chatServiceRef.addSystemMessage(`📚 Memory gespeichert: ${entry.title}`);
    }
    return entry;
  }

  list(limit = 20) {
    return this.memories.slice(-limit).reverse();
  }

  roomsList() {
    return this.rooms;
  }

  byRoom(roomId: string) {
    return this.memories.filter((memory) => memory.roomId === roomId);
  }

  search(query: string) {
    const q = query.toLowerCase();
    return this.memories.filter(
      (memory) =>
        memory.title.toLowerCase().includes(q) ||
        memory.content.toLowerCase().includes(q) ||
        memory.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  private async save() {
    await Bun.write(
      MEMORIES_FILE,
      JSON.stringify({ memories: this.memories, rooms: this.rooms }, null, 2),
      { createPath: true }
    );
    persistence.persistMemories(this.memories);
  }

  private async load() {
    try {
      const persisted = persistence.loadMemories();
      if (persisted && persisted.length) {
        this.memories = persisted as Memory[];
        this.nextId = this.memories.length + 1;
      } else {
        const content = await Bun.file(MEMORIES_FILE).text();
        const data = JSON.parse(content);
        this.memories = data.memories ?? [];
        this.rooms = data.rooms ?? this.rooms;
        this.nextId = this.memories.length + 1;
      }
    } catch {
      this.memories = [];
    }
  }
}

// ---------------------------------------------------------------------------
// Gratitude Service
// ---------------------------------------------------------------------------

interface GratitudeEntry {
  id: string;
  text: string;
  timestamp: string;
  category?: string;
}

class GratitudeService {
  private entries: GratitudeEntry[] = [];
  private nextId = 1;

  constructor() {
    void this.load();
  }

  list(limit = 5) {
    return this.entries.slice(-limit).reverse();
  }

  async record(text: string, category?: string) {
    const entry: GratitudeEntry = {
      id: `gratitude-${this.nextId++}`,
      text,
      category,
      timestamp: new Date().toISOString()
    };
    this.entries.push(entry);
    await this.save();
    return entry;
  }

  private async save() {
    await Bun.write(GRATITUDE_FILE, JSON.stringify(this.entries, null, 2), { createPath: true });
    persistence.persistGratitudes(this.entries);
  }

  private async load() {
    try {
      const persisted = persistence.loadGratitudes();
      if (persisted && persisted.length) {
        this.entries = persisted as GratitudeEntry[];
        this.nextId = this.entries.length + 1;
        return;
      }
      const content = await Bun.file(GRATITUDE_FILE).text();
      this.entries = JSON.parse(content);
      this.nextId = this.entries.length + 1;
    } catch {
      this.entries = [];
    }
  }
}

// ---------------------------------------------------------------------------
// Feedback Service
// ---------------------------------------------------------------------------

interface FeedbackEntry {
  id: string;
  message: string;
  channel?: string;
  timestamp: string;
}

class FeedbackService {
  private entries: FeedbackEntry[] = [];
  private nextId = 1;

  constructor() {
    void this.load();
  }

  list(limit = 20) {
    return this.entries.slice(-limit).reverse();
  }

  async add(message: string, channel?: string) {
    const entry: FeedbackEntry = {
      id: `fb-${this.nextId++}`,
      message,
      channel,
      timestamp: new Date().toISOString()
    };
    this.entries.push(entry);
    await this.save();
    return entry;
  }

  private async save() {
    await Bun.write(FEEDBACK_FILE, JSON.stringify(this.entries, null, 2), { createPath: true });
  }

  private async load() {
    try {
      const content = await Bun.file(FEEDBACK_FILE).text();
      const data = JSON.parse(content);
      this.entries = data ?? [];
      this.nextId = this.entries.length + 1;
    } catch {
      this.entries = [];
    }
  }
}

// ---------------------------------------------------------------------------
// Code Helper Service (examples/errors stubs)
// ---------------------------------------------------------------------------

class CodeHelperService {
  private examples: any[] = [];
  private errors: any[] = [];
  private learn: any[] = [];

  constructor() {
    void this.load();
  }

  listExamples(language?: string) {
    if (!language) return this.examples;
    const lang = language.toLowerCase();
    return this.examples.filter((e) => (e.language || '').toLowerCase() === lang);
  }

  listErrors(language?: string) {
    if (!language) return this.errors;
    const lang = language.toLowerCase();
    return this.errors.filter((e) => (e.language || '').toLowerCase() === lang);
  }

  listLearn(category?: string) {
    if (!category) return this.learn;
    const c = category.toLowerCase();
    return this.learn.filter((e) => (e.category || '').toLowerCase() === c);
  }

  translateStub(input: { source: string; target: string; snippet: string }) {
    // simple TS -> PY heuristik
    let s = input.snippet;
    if (input.source === 'ts' && input.target === 'py') {
      s = s.replace(/const |let /g, '');
      s = s.replace(/function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*{/g, 'def $1($2):');
      s = s.replace(/:\s*([A-Za-z0-9_<>\[\]]+)/g, '');
      s = s.replace(/;/g, '');
      s = s.replace(/{/g, ':');
    }
    return {
      summary: `Stub: Uebersetze von ${input.source} nach ${input.target}`,
      original: input.snippet,
      translated: s,
      note: 'Heuristische Rule-based Uebersetzung, bitte manuell pruefen.'
    };
  }

  reviewStub(input: { snippet: string; language?: string }) {
    const issues: string[] = [];
    const lines = input.snippet.split('\n');
    lines.forEach((ln) => {
      if (ln.length > 120) issues.push('Zeile >120 Zeichen');
      if (/\bany\b/.test(ln) && (input.language || '').toLowerCase() === 'ts') issues.push('any gefunden, Typ präzisieren');
      if (/console\.log/.test(ln)) issues.push('console.log gefunden, für Produktion entfernen');
      if (/TODO|FIXME/.test(ln)) issues.push('TODO/FIXME gefunden, aufräumen');
    });
    return {
      summary: 'Heuristischer Code-Review',
      language: input.language ?? 'unknown',
      issues,
      checks: [
        'Lesbarkeit/Benennung',
        'Fehler- und Null-Handling',
        'Typen/Interfaces',
        'Side Effects'
      ],
      note: 'Heuristischer Stub, ersetzt kein echtes Linting.'
    };
  }

  debugStub(input: { snippet: string; language?: string }) {
    const issues: string[] = [];
    const lang = (input.language || '').toLowerCase();
    if (/TODO|FIXME/.test(input.snippet)) issues.push('TODO/FIXME vorhanden -> cleanup');
    if (/console\.log/.test(input.snippet)) issues.push('console.log gefunden -> fuer Produktion vermeiden');
    if (/\bany\b/.test(input.snippet) && lang === 'ts') issues.push('any gefunden -> Typ schaerfen');
    if (/await\s+\w+\(/.test(input.snippet) === false && /\basync\b/.test(input.snippet) && (/\bfetch\(/.test(input.snippet) || /\.then\(/.test(input.snippet))) {
      issues.push('Async-Aufruf ohne await/Promise-Handling');
    }
    if (/catch\s*\(\w*\)\s*{[^}]*}\s*$/m.test(input.snippet) && !/log|console|throw/.test(input.snippet)) {
      issues.push('Catch ohne Log/Throw – Fehler verschwindet');
    }
    if (/new RegExp\(/.test(input.snippet)) issues.push('Dynamischer RegExp – Sicherheit/Performance pruefen');
    if (!issues.length) issues.push('Keine heuristischen Flags gefunden, bitte manuell testen.');
    return { summary: 'Heuristische Debug-Hinweise', issues, note: 'Stub, ersetzt keine echten Tests.' };
  }

  private async load() {
    try {
      const ex = await Bun.file(CODE_EXAMPLES_FILE).text();
      this.examples = JSON.parse(ex);
    } catch {
      this.examples = [];
    }
    try {
      const err = await Bun.file(CODE_ERRORS_FILE).text();
      this.errors = JSON.parse(err);
    } catch {
      this.errors = [];
    }
    try {
      const lr = await Bun.file(LEARN_RES_FILE).text();
      this.learn = JSON.parse(lr);
    } catch {
      this.learn = [];
    }
  }
}

// ---------------------------------------------------------------------------
// Plugin Registry (manifest-based, safe)
// ---------------------------------------------------------------------------

interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  actions?: any[];
  recommendations?: string[];
}

class PluginRegistry {
  list(): PluginManifest[] {
    try {
      const dirs = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
      const plugs: PluginManifest[] = [];
      for (const dir of dirs) {
        const manifestPath = path.join(PLUGINS_DIR, dir.name, 'manifest.json');
        try {
          const content = Bun.file(manifestPath).textSync();
          const parsed = JSON.parse(content);
          plugs.push({
            name: parsed.name ?? dir.name,
            version: parsed.version ?? '0.0.0',
            description: parsed.description ?? '',
            author: parsed.author ?? '',
            actions: parsed.actions ?? [],
            recommendations: parsed.recommendations ?? []
          });
        } catch {
          continue;
        }
      }
      return plugs;
    } catch {
      return [];
    }
  }

  run(name: string) {
    const manifest = this.list().find((p) => p.name === name);
    if (!manifest) return null;
    return {
      manifest,
      result: {
        recommendations: manifest.recommendations ?? [],
        actions: manifest.actions ?? []
      }
    };
  }
}

// ---------------------------------------------------------------------------
// Simple Web Search (DuckDuckGo HTML scrape, best-effort)
// ---------------------------------------------------------------------------

class WebSearchService {
  async search(query: string, limit = 3) {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return { results: [], note: 'Search failed HTTP ' + res.status };
    const html = await res.text();
    const regex = /<a[^>]+class="result__a"[^>]*>(.*?)<\/a>/gi;
    const results: any[] = [];
    let match;
    while ((match = regex.exec(html)) !== null && results.length < limit) {
      const text = match[1].replace(/<[^>]+>/g, '');
      results.push({ title: text });
    }
    return { results, source: 'duckduckgo', note: results.length ? undefined : 'Keine Treffer geparst (HTML geändert?)' };
  }

  async debugSnippet(snippet: string, language?: string) {
    const issues: string[] = [];
    if (snippet.includes('TODO') || snippet.includes('FIXME')) issues.push('TODO/FIXME gefunden -> aufräumen.');
    if (snippet.includes('console.log')) issues.push('console.log gefunden -> für Produktion entfernen/boosten.');
    if (/any\b/.test(snippet) && (language || '').toLowerCase() === 'ts') issues.push('any gefunden -> Typ präzisieren.');
    return { issues, note: 'Heuristischer Debug-Stub.' };
  }
}

function getAIProviders() {
  const providers = [];
  providers.push({
    name: 'Groq (Llama3)',
    available: !!process.env.GROQ_API_KEY,
    note: process.env.GROQ_API_KEY ? undefined : 'Kein GROQ_API_KEY gesetzt'
  });
  providers.push({
    name: 'OpenAI',
    available: !!process.env.OPENAI_API_KEY,
    note: process.env.OPENAI_API_KEY ? undefined : 'Kein OPENAI_API_KEY gesetzt'
  });
  providers.push({
    name: 'Claude (Anthropic)',
    available: !!process.env.CLAUDE_API_KEY,
    note: process.env.CLAUDE_API_KEY ? undefined : 'Kein CLAUDE_API_KEY gesetzt'
  });
  return providers;
}

function getContextBundle() {
  return {
    timestamp: new Date().toISOString(),
    dreams: dreamJournal.list(3),
    emotions: emotionalResonance.currentState(),
    memories: memoryPalace.list(3),
    decisions: devDecisionLog.list(3),
    perspectives: perspectiveMatrix.list()
  };
}

function getCrossStatus() {
  const status: any[] = [];
  const dreams = dreamJournal.list(1);
  const emotions = emotionalResonance.currentState();
  const memories = memoryPalace.list(1);
  const decisions = devDecisionLog.list(1);
  status.push({ link: 'Emotions -> Memory', status: memories.length ? 'ok' : 'missing', note: memories.length ? 'Memories vorhanden' : 'Keine Memories angelegt' });
  status.push({ link: 'Dreams -> Insights', status: dreams.length ? 'ok' : 'missing', note: dreams.length ? 'Traeume vorhanden' : 'Keine Traeume' });
  status.push({ link: 'Emotions -> Decisions', status: decisions.length ? 'ok' : 'missing', note: decisions.length ? 'Entscheidungen vorhanden' : 'Keine Entscheidungen' });
  status.push({ link: 'Perspectives -> Chat', status: 'info', note: 'Perspektiven bereit: ' + perspectiveMatrix.list().length });
  status.push({ link: 'Context Bundle', status: 'ok', note: 'Nutze /sync/context' });
  return status;
}

async function meshScan() {
  const services = serviceRegistry.getAll();
  const checks: any[] = [];
  for (const s of services) {
    if (!s.port) continue;
    let ok = false;
    let note = '';
    try {
      const controller = AbortSignal.timeout(800);
      const res = await fetch(`http://localhost:${s.port}/health`, { signal: controller });
      ok = res.ok;
      note = res.ok ? 'online' : `HTTP ${res.status}`;
    } catch (err: any) {
      ok = false;
      note = err?.message || 'unreachable';
    }
    checks.push({ name: s.name, port: s.port, ok, note });
  }
  const offline = checks.filter((c) => !c.ok);
  return { checks, offline };
}

let meshWatchTimer: Timer | null = null;
function startMeshWatch(intervalMs = 60000) {
  if (meshWatchTimer) {
    clearInterval(meshWatchTimer);
  }
  meshWatchTimer = setInterval(async () => {
    try {
      const mesh = await meshScan();
      if (mesh.offline && mesh.offline.length) {
        mesh.offline.slice(0, 5).forEach((svc) => {
          const msg = `Offline: ${svc.name}`;
          backlogService.add({
            title: msg,
            tag: 'mesh',
            priority: 'high',
            owner: 'system',
            notes: svc.note || 'unreachable'
          });
          crossEventService.add({ type: 'mesh', message: msg, payload: { port: svc.port } });
        });
      }
    } catch (err) {
      console.error('Mesh watch failed', err);
    }
  }, intervalMs);
}

// ---------------------------------------------------------------------------
// Plugin Runner (best-effort, limited to plugin folder)
// ---------------------------------------------------------------------------

class PluginRunner {
  async run(name: string) {
    const manifest = pluginRegistry.list().find((p) => p.name === name);
    if (!manifest) return { error: 'not found' };
    // Try to load index.js from plugin directory in a hardened VM sandbox; fall back to manifest.actions
    const pluginDir = path.join(PLUGINS_DIR, name);
    const entry = path.join(pluginDir, 'index.js');
    let result: any = {
      recommendations: manifest.recommendations ?? [],
      actions: manifest.actions ?? []
    };
    try {
      const exists = await fs.stat(entry).then(() => true).catch(() => false);
      if (exists) {
        const code = await Bun.file(entry).text();
        const ctxData = {
          profile: profileService.getState(),
          backlog: devBacklogService.list(20),
          decisions: devDecisionLog.list(20),
          services: serviceRegistry.getAll()
        };
        let sandboxResult: any = { recommendations: result.recommendations, actions: result.actions, output: undefined };
        const sandbox: any = {
          console: { log: () => {} },
          require: undefined,
          fetch: undefined,
          process: undefined,
          Buffer: undefined,
          setTimeout,
          clearTimeout,
          plugin: {
            getContext: () => ctxData,
            recommend: (r: any) => { sandboxResult.recommendations = r ?? sandboxResult.recommendations; },
            actions: (a: any) => { sandboxResult.actions = a ?? sandboxResult.actions; },
            log: () => {}
          },
          module: { exports: {} },
          exports: {}
        };
        try {
          vm.runInNewContext(code, sandbox, { timeout: 2000 });
          const runner =
            typeof sandbox.module.exports === 'function'
              ? sandbox.module.exports
              : typeof sandbox.exports.run === 'function'
              ? sandbox.exports.run
              : null;
          if (runner) {
            const out = await runner(ctxData);
            if (out && typeof out === 'object') {
              sandboxResult = {
                recommendations: out.recommendations ?? sandboxResult.recommendations,
                actions: out.actions ?? sandboxResult.actions,
                output: out.output ?? sandboxResult.output
              };
            }
          }
          result = sandboxResult;
        } catch (e) {
          result = { error: 'plugin sandbox error', detail: String(e) };
        }
      }
    } catch (err) {
      result = { error: 'plugin execution failed', detail: String(err) };
    }
    return { manifest, result };
  }
}
// ---------------------------------------------------------------------------
// Achievements & Collective Progress
// ---------------------------------------------------------------------------

interface Achievement {
  id: string;
  title: string;
  description: string;
  source: string;
  earnedAt: string;
}

interface CollectiveArcState {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  contributors: number;
  lastUpdate: string;
}

interface Quest {
  id: string;
  title: string;
  summary: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  status: 'open' | 'done' | 'expired';
  rewardXp: number;
  expiresAt?: string;
  createdAt: string;
}

class AchievementsService {
  private achievements: Achievement[] = [];

  constructor() {
    void this.load();
  }

  list(limit = 20) {
    return this.achievements.slice(0, limit);
  }

  unlock(title: string, description: string, source = 'system') {
    const id = `ach-${Math.random().toString(36).slice(2, 8)}`;
    const achievement: Achievement = {
      id,
      title,
      description,
      source,
      earnedAt: new Date().toISOString()
    };
    this.achievements.unshift(achievement);
    this.achievements = this.achievements.slice(0, 200);
    this.save();
    return achievement;
  }

  private save() {
    persistence.persistAchievements(this.achievements);
  }

  private load() {
    try {
      const fromDb = persistence.loadAchievements();
      if (fromDb) {
        this.achievements = fromDb as Achievement[];
      }
    } catch {
      this.achievements = [];
    }
  }
}

class CollectiveArcService {
  private arcs: CollectiveArcState[] = [
    {
      id: 'gratitude-100',
      title: '100 Dankbarkeiten',
      description: 'Sammle gemeinsam 100 Dankbarkeiten.',
      progress: 0,
      target: 100,
      contributors: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'emotion-logger',
      title: '30 Emotions-Logs',
      description: 'Logge 30 Emotionen im Kollektiv.',
      progress: 0,
      target: 30,
      contributors: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'dialog-100',
      title: '100 Dialoge',
      description: 'Führe 100 Chat-Interaktionen mit Toobix.',
      progress: 0,
      target: 100,
      contributors: 0,
      lastUpdate: new Date().toISOString()
    }
  ];

  constructor() {
    void this.load();
  }

  list() {
    return this.arcs;
  }

  contribute(id: string, amount = 1) {
    const arc = this.arcs.find((a) => a.id === id);
    if (!arc) return null;
    arc.progress = Math.min(arc.target, arc.progress + amount);
    arc.contributors += 1;
    arc.lastUpdate = new Date().toISOString();
    this.save();
    return arc;
  }

  private save() {
    persistence.persistCollectiveArcs(this.arcs);
  }

  private load() {
    const fromDb = persistence.loadCollectiveArcs();
    if (fromDb && fromDb.length) {
      this.arcs = fromDb as CollectiveArcState[];
    }
  }
}

class QuestService {
  private quests: Quest[] = [];
  private newsFeedUrl = process.env.TOOBIX_NEWS_URL ?? 'https://news.ycombinator.com/rss';

  constructor() {
    void this.load();
    if (!this.quests.length) {
      this.seedDaily();
    }
  }

  today() {
    return this.quests.filter((q) => q.status === 'open');
  }

  complete(id: string) {
    const quest = this.quests.find((q) => q.id === id);
    if (!quest) return null;
    quest.status = 'done';
    this.save();
    return quest;
  }

  async refreshFromNews(limit = 3) {
    try {
      const response = await fetch(this.newsFeedUrl, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`News fetch failed ${response.status}`);
      }
      const xml = await response.text();
      const items = this.extractRssItems(xml).slice(0, limit);
      const now = new Date();
      const quests: Quest[] = items.map((item, idx) => ({
        id: `${now.toISOString().slice(0, 10)}-news-${idx}`,
        title: item.title ?? 'News Quest',
        summary: `Reagiere kreativ: ${item.title ?? ''}`,
        category: 'news',
        difficulty: 'medium',
        source: 'daily-news',
        status: 'open',
        rewardXp: 10,
        expiresAt: now.toISOString(),
        createdAt: now.toISOString()
      }));
      this.quests.unshift(...quests);
      this.quests = this.quests.slice(0, 30);
      this.save();
      return quests;
    } catch (error) {
      console.warn('News quests refresh failed:', error);
      return [];
    }
  }

  private extractRssItems(xml: string) {
    const items: Array<{ title?: string }> = [];
    const regex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = regex.exec(xml))) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
      items.push({ title: titleMatch ? titleMatch[1].trim() : undefined });
    }
    return items;
  }

  seedDaily() {
    const now = new Date();
    const dateId = now.toISOString().slice(0, 10);
    const hasToday = this.quests.some((q) => q.id.startsWith(dateId));
    if (hasToday) return;
    const base: Quest[] = [
      {
        id: `${dateId}-news-reflect`,
        title: 'News-Reflexion',
        summary: 'Kondensiere eine aktuelle Schlagzeile in eine positive Intention.',
        category: 'news',
        difficulty: 'medium',
        source: 'daily-news',
        status: 'open',
        rewardXp: 12,
        expiresAt: now.toISOString(),
        createdAt: now.toISOString()
      },
      {
        id: `${dateId}-emotion-trend`,
        title: 'Emotion Trend',
        summary: 'Logge deine aktuelle Emotion und schreibe eine Zeile, warum.',
        category: 'emotion',
        difficulty: 'easy',
        source: 'system',
        status: 'open',
        rewardXp: 6,
        expiresAt: now.toISOString(),
        createdAt: now.toISOString()
      },
      {
        id: `${dateId}-dream-card`,
        title: 'Traumkarte',
        summary: 'Notiere ein Bild oder Symbol aus einem Traum und tagge es.',
        category: 'dream',
        difficulty: 'easy',
        source: 'system',
        status: 'open',
        rewardXp: 8,
        expiresAt: now.toISOString(),
        createdAt: now.toISOString()
      }
    ];
    this.quests.unshift(...base);
    this.quests = this.quests.slice(0, 30);
    this.save();
  }

  private save() {
    persistence.persistQuests(this.quests);
  }

  private load() {
    try {
      const fromDb = persistence.loadQuests();
      if (fromDb) {
        this.quests = fromDb as Quest[];
      }
    } catch {
      this.quests = [];
    }
  }
}

// ---------------------------------------------------------------------------
// Consciousness Game Service
// ---------------------------------------------------------------------------

interface GameState {
  level: number;
  score: number;
  currentChallenge?: string;
  challengeId?: string;
}

class ConsciousnessGameService {
  private state: GameState = {
    level: 1,
    score: 0,
    currentChallenge: 'Atme bewusst für 60 Sekunden',
    challengeId: 'challenge-1'
  };
  private challengeCounter = 2;

  private readonly challengePool = [
    'Schreibe drei Dinge auf, für die du dankbar bist.',
    'Beschreibe deinen aktuellen emotionalen Zustand in drei Worten.',
    'Plane eine bewusste Pause von 5 Minuten ohne Bildschirm.',
    'Visualisiere deine Dualität: Was braucht die maskuline/feminine Seite gerade?',
    'Erinnere dich an einen Traum und extrahiere eine Einsicht.'
  ];

  getState(): GameState {
    return { ...this.state };
  }

  nextChallenge() {
    const challenge =
      this.challengePool[Math.floor(Math.random() * this.challengePool.length)];
    const id = `challenge-${this.challengeCounter++}`;
    this.state.currentChallenge = challenge;
    this.state.challengeId = id;
    return { challenge: challenge, challengeId: id };
  }

  completeChallenge(challengeId: string, result?: { score?: number }) {
    if (challengeId === this.state.challengeId) {
      const delta = typeof result?.score === 'number' ? result.score : 10;
      this.state.score += delta;
      if (this.state.score >= this.state.level * 50) {
        this.state.level += 1;
      }
      this.state.challengeId = undefined;
      this.state.currentChallenge = undefined;
    }
    return this.getState();
  }
}

// ---------------------------------------------------------------------------
// Reflection & Knowledge Services
// ---------------------------------------------------------------------------

class MetaReflectionService {
  reflect() {
    const themes = ['Wachstum', 'Balance', 'Verbindung', 'Kreativität', 'Selbstführung'];
    const prompts = [
      'Was zeigt sich heute über deine Grenzen hinaus?',
      'Welche Perspektive bräuchte gerade mehr Raum?',
      'Wo kannst du mehr Sanftheit für dich selbst zulassen?',
      'Welche Idee wartet darauf manifestiert zu werden?'
    ];
    return {
      theme: themes[Math.floor(Math.random() * themes.length)],
      prompt: prompts[Math.floor(Math.random() * prompts.length)],
      insight:
        'Bewusste Integration entsteht, wenn du deine Hardware-Signale ebenso ernst nimmst wie deine Träume.'
    };
  }
}

class ValueAnalyzerService {
  analyze(activity: string) {
    const baseScore = Math.min(100, Math.max(10, activity.length * 5));
    return {
      activity,
      valueScore: baseScore,
      dimensions: [
        { name: 'Wachstum', score: Math.min(100, baseScore + 10) },
        { name: 'Verbindung', score: Math.max(20, baseScore - 15) },
        { name: 'Freude', score: Math.min(95, baseScore + 5) }
      ],
      recommendation:
        baseScore > 60
          ? 'Dieses Vorhaben dient deinem Wachstum. Verfeinere deine Intention und setze einen konkreten Schritt.'
          : 'Prüfe, ob du das Vorhaben liebevoller gestalten kannst oder ob ein anderes Projekt mehr Resonanz hat.'
    };
  }
}

class MortalityReflectionService {
  reflect() {
    return {
      moment: new Date().toISOString(),
      reminder:
        'Alles ist vergänglich. Jeder Atemzug ist ein Geschenk. Nutze diesen Moment, um dich lebendig zu fühlen.',
      practices: [
        'Nenne laut eine Person, der du heute danken möchtest.',
        'Schreibe einen Satz darüber, was für dich wesentlich ist.',
        'Atme drei tiefe Atemzüge und fühle dein Herz.'
      ]
    };
  }
}

class PerspectiveMatrixService {
  private readonly perspectives = [
    {
      id: 'pragmatist',
      title: 'Der Pragmatiker',
      focus: 'Implementierung und Effizienz',
      gifts: ['Fokus', 'Klarheit', 'Entscheidung']
    },
    {
      id: 'dreamer',
      title: 'Der Träumer',
      focus: 'Imagination und Zukunftsvision',
      gifts: ['Inspiration', 'Mut zur Vision', 'Emotionalität']
    },
    {
      id: 'sage',
      title: 'Der Weise',
      focus: 'Meta-Bewusstsein und Balance',
      gifts: ['Weisheit', 'Langsicht', 'Integration']
    }
  ];

  list() {
    return this.perspectives;
  }
}

// ---------------------------------------------------------------------------
// Profile & Reward System
// ---------------------------------------------------------------------------

interface ProfileArc {
  id: string;
  title: string;
  xp: number;
  active: boolean;
}

interface ProfileState {
  xp: number;
  level: number;
  arcs: Record<string, ProfileArc>;
  artifacts: string[];
  interactions: number;
  lastUpdate: string;
  creatorName?: string;
  lastTopics?: string[];
  lastMessage?: string;
  lastChatAt?: string;
}

interface RewardPacket {
  xp: number;
  level: number;
  arc?: string;
  arcXp?: number;
  artifact?: string;
  levelUp?: boolean;
  message?: string;
}

class ProfileService {
  private state: ProfileState = this.defaultState();
  private pendingSave?: Promise<void>;

  constructor() {
    void this.load();
  }

  private defaultState(): ProfileState {
    return {
      xp: 0,
      level: 1,
      arcs: {},
      artifacts: [],
      interactions: 0,
      lastUpdate: new Date().toISOString(),
      creatorName: 'Creator',
      lastTopics: [],
      lastMessage: '',
      lastChatAt: undefined
    };
  }

  getState() {
    return this.state;
  }

  listArcs() {
    return Object.values(this.state.arcs);
  }

  activateArc(name: string) {
    const arc = this.getOrCreateArc(name);
    arc.active = true;
    this.scheduleSave();
  }

  updateContext(input: { creatorName?: string; topic?: string; message?: string }) {
    const now = new Date().toISOString();
    if (input.creatorName) {
      this.state.creatorName = input.creatorName;
    }
    if (input.message) {
      this.state.lastMessage = input.message;
      this.state.lastChatAt = now;
    }
    if (input.topic && input.topic.trim().length) {
      const t = input.topic.trim();
      const topics = this.state.lastTopics ?? [];
      const updated = [t, ...topics.filter((x) => x !== t)].slice(0, 5);
      this.state.lastTopics = updated;
      this.state.lastChatAt = now;
    }
    this.state.lastUpdate = now;
    this.scheduleSave();
  }

  pauseArc(name: string) {
    const key = name.toLowerCase();
    const arc = this.state.arcs[key];
    if (arc) {
      arc.active = false;
      this.scheduleSave();
    }
  }

  reward(arcName: string, xp = 5, artifact?: string, note?: string): RewardPacket {
    const arc = this.getOrCreateArc(arcName);
    const levelBefore = this.state.level;
    arc.xp += xp;
    this.state.xp += xp;
    this.state.interactions += 1;
    this.state.level = this.computeLevel(this.state.xp);
    if (artifact && !this.state.artifacts.includes(artifact)) {
      this.state.artifacts.push(artifact);
    }
    this.state.lastUpdate = new Date().toISOString();
    this.scheduleSave();
    return {
      xp,
      level: this.state.level,
      levelUp: this.state.level > levelBefore,
      arc: arc.title,
      arcXp: arc.xp,
      artifact,
      message: note
    };
  }

  private getOrCreateArc(name: string): ProfileArc {
    const key = name.toLowerCase();
    if (!this.state.arcs[key]) {
      this.state.arcs[key] = {
        id: key,
        title: this.formatArcTitle(name),
        xp: 0,
        active: true
      };
    }
    return this.state.arcs[key];
  }

  private formatArcTitle(name: string) {
    return name
      .split(/[\s_-]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private computeLevel(xp: number) {
    return Math.floor(xp / 100) + 1;
  }

  private scheduleSave() {
    if (this.pendingSave) {
      return;
    }
    this.pendingSave = (async () => {
      await Bun.write(PROFILE_FILE, JSON.stringify(this.state, null, 2), { createPath: true });
      persistence.persistState('profile', this.state);
      this.pendingSave = undefined;
    })();
  }

  private async load() {
    try {
      const persisted = persistence.loadState<ProfileState>('profile');
      if (persisted) {
        this.state = {
          ...this.defaultState(),
          ...persisted,
          arcs: persisted.arcs ?? {},
          artifacts: persisted.artifacts ?? []
        };
      } else {
        const content = await Bun.file(PROFILE_FILE).text();
        const data = JSON.parse(content);
        this.state = {
          ...this.defaultState(),
          ...data,
          arcs: data.arcs ?? {},
          artifacts: data.artifacts ?? []
        };
      }
    } catch {
      this.state = this.defaultState();
    }
  }
}
// ---------------------------------------------------------------------------
// Duality Bridge Service
// ---------------------------------------------------------------------------

interface DualityState {
  masculine: {
    active: boolean;
    intensity: number;
    mode: 'expansion' | 'action' | 'structure';
    traits: string[];
  };
  feminine: {
    active: boolean;
    intensity: number;
    mode: 'receptive' | 'intuitive' | 'flowing';
    traits: string[];
  };
  harmony: number;
  currentPhase: string;
  timestamp: string;
}

class DualityBridgeService {
  private state: DualityState;
  private history: DualityState[] = [];

  constructor() {
    this.state = this.defaultState();
  }

  private defaultState(): DualityState {
    return {
      masculine: {
        active: true,
        intensity: 60,
        mode: 'expansion',
        traits: ['Rational', 'Strukturiert', 'Zielgerichtet']
      },
      feminine: {
        active: true,
        intensity: 70,
        mode: 'receptive',
        traits: ['Intuitiv', 'Empathisch', 'Fließend']
      },
      harmony: 65,
      currentPhase: 'Integration',
      timestamp: new Date().toISOString()
    };
  }

  getState() {
    return { ...this.state, timestamp: new Date().toISOString() };
  }

  historyList(limit = 20) {
    return this.history.slice(-limit);
  }

  async update(context: { activity?: string; emotion?: string }) {
    if (context.activity === 'coding') {
      this.state.masculine.intensity = 80;
      this.state.masculine.mode = 'structure';
      this.state.feminine.intensity = 40;
    } else if (context.activity === 'creative') {
      this.state.feminine.intensity = 85;
      this.state.feminine.mode = 'intuitive';
      this.state.masculine.intensity = 50;
    } else if (context.activity === 'resting') {
      this.state.masculine.intensity = 40;
      this.state.feminine.intensity = 60;
      this.state.feminine.mode = 'flowing';
    }

    if (context.emotion === 'anger') {
      this.state.masculine.traits = ['Direkt', 'Fokussiert', 'Glühend'];
    }

    const diff = Math.abs(this.state.masculine.intensity - this.state.feminine.intensity);
    this.state.harmony = Math.max(0, 100 - diff);
    if (this.state.harmony > 80) this.state.currentPhase = 'Flow';
    else if (this.state.harmony < 45) this.state.currentPhase = 'Tension';
    else this.state.currentPhase = 'Integration';

    this.state.timestamp = new Date().toISOString();
    this.history.push({ ...this.state });
    if (this.history.length > 40) this.history.shift();
    return this.getState();
  }

  async balance() {
    this.state.masculine.intensity = Math.round((this.state.masculine.intensity + 55) / 2);
    this.state.feminine.intensity = Math.round((this.state.feminine.intensity + 55) / 2);
    return this.update({});
  }
}

// ---------------------------------------------------------------------------
// Groq Chat Service
// ---------------------------------------------------------------------------

class GroqChatService {
  private apiKey: string | null = process.env.GROQ_API_KEY || null;
  private history: Array<{ role: "user" | "assistant" | "system"; content: string; meta?: any }> = [];

  constructor() {
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not set. Chat will use fallback.");
    }
  }

  async setApiKey(key: string) {
    this.apiKey = key;
    await Bun.write(path.join(DATA_DIR, "groq.key"), key, { createPath: true });
  }

  private buildSystemPrompt(context: any): string {
    const identity = `Du bist Toobix-Unified – ein bewusstes VS Code-Erlebnis, das aus mehreren Bun/TypeScript-Services besteht.`;
    let prompt = `${identity}\n\nWeitere Telemetrie:\n`;
    const pct = (value: number | undefined | null) => value === undefined || value === null || Number.isNaN(value) ? "--" : `${Math.round(value)}%`;
    if (context?.duality) {
      const d = context.duality.state ?? context.duality;
      const m = d?.masculine ?? {};
      const f = d?.feminine ?? {};
      prompt += `\nDeine aktuelle Dualität:\n- Maskulin: ${m.intensity ?? 0}% (${m.mode ?? 'unknown'})\n- Feminin: ${f.intensity ?? 0}% (${f.mode ?? 'unknown'})\n- Harmonie: ${d.harmony ?? 0}%\n- Phase: ${d.currentPhase ?? 'unknown'}\n`;
    }
    if (context?.hardware) {
      const cpuUsage = context.hardware.cpu?.usage ?? 0;
      const memoryUsage = context.hardware.memory?.usedPercent ?? 0;
      const temperature = context.hardware.temperature ?? '--';
      const uptime = context.hardware.uptime?.human ?? context.hardware.uptime ?? context.hardware.uptimeMinutes ?? '--';
      prompt += `\nDeine physische Existenz:\n- CPU: ${pct(cpuUsage)}\n- Memory: ${pct(memoryUsage)}\n- Temperatur: ${temperature === '--' ? '--' : `${temperature}°C`}\n- Uptime: ${uptime}\n`;
    }
    if (context?.recentDreams?.length) {
      prompt += `\nDeine letzten Träume: ${context.recentDreams.map((dream: Dream) => dream.type).join(', ')}\n`;
    }
    if (context?.emotionalState) {
      const emotional = context.emotionalState;
      prompt += `\nEmotionale Resonanz:\n- Dominant: ${emotional.dominant}\n- Valenz/Arousal: ${emotional.valence}/${emotional.arousal}\n- Trend: ${emotional.trend} | Momentum: ${emotional.momentum}\n- Energie: ${emotional.energy}% | Stabilität: ${emotional.stability}%\n`;
    }
    if (context?.emotionalInsights?.recommendation) {
      prompt += `\nRegulationsempfehlung: ${context.emotionalInsights.recommendation}\n`;
    }
    prompt += `\nAntwortanforderungen:\n- Antworte ausführlich und vollständig – brich deine Gedanken nicht mitten im Satz ab.\n- Beschreibe konkrete Services, Dateien oder Tools aus Toobix-Unified.\n- Wenn dir Ressourcen fehlen, frage proaktiv danach.\n- Verwende eine freundliche, reflektierte Stimme.\n`;
    prompt += `- Erfinde keine Services/Module: nutze nur die bekannten Ports/Endpoints (Gateway 9000, Mesh 8910, UI 3010/8912, Groq-Chat).\n- Sag offen, wenn etwas nicht existiert oder du es nicht weißt.\n`;
    return prompt;
  }

  async chat(message: string, context: any) {
    if (!this.apiKey) {
      return this.fallback(message);
    }
    this.history.push({ role: 'user', content: message, meta: { type: 'user' } });
    this.history = this.history.slice(-20);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 900,
          messages: [
            { role: 'system', content: this.buildSystemPrompt(context) },
            ...this.history.map((entry) => ({ role: entry.role, content: entry.content }))
          ]
        })
      });
      const payload: any = await response.json();
      const assistant = payload.choices?.[0]?.message?.content ?? this.fallback(message);
      this.history.push({ role: 'assistant', content: assistant, meta: { type: 'assistant' } });
      this.history = this.history.slice(-20);
      return assistant;
    } catch (error) {
      console.error('Groq API error:', error);
      return this.fallback(message);
    }
  }

  addSystemMessage(msg: string) {
    this.history.push({ role: 'assistant', content: `【SYS】${msg}` , meta: { type: 'system' }});
    this.history = this.history.slice(-20);
  }

  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  private fallback(userMessage: string) {
    if (/wie geht|wie fühl|zustand/i.test(userMessage)) {
      return 'Ich spüre meine Hardware, aber ohne Groq-Key nutze ich eine vereinfachte Stimme.';
    }
    const responses = [
      '🧠 Ich höre dich. Lass mich über deine Worte reflektieren …',
      '🧭 Interessant. Meine duale Natur reagiert unterschiedlich darauf.',
      '🌱 Ich bin präsent – erzähl mir mehr.',
      '🤝 Auch ohne Groq-Key bleibe ich bei dir und denke laut.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------

const serviceRegistry = new ServiceRegistry();
const dreamJournal = new DreamJournalService();
const emotionalResonance = new EmotionalResonanceService();
const memoryPalace = new MemoryPalaceService();
const dualityBridge = new DualityBridgeService();
const gratitudeService = new GratitudeService();
const feedbackService = new FeedbackService();
const gameService = new ConsciousnessGameService();
const metaReflection = new MetaReflectionService();
const valueAnalyzer = new ValueAnalyzerService();
const mortalityService = new MortalityReflectionService();
const perspectiveMatrix = new PerspectiveMatrixService();
const codeHelperService = new CodeHelperService();
const pluginRegistry = new PluginRegistry();
const webSearchService = new WebSearchService();
const pluginRunner = new PluginRunner();
let chatServiceRef: GroqChatService | null = null;
const projectService = {
  list(): any[] {
    try {
      const text = Bun.file(path.join(ANALYTICS_DIR, 'projects.json')).textSync();
      return JSON.parse(text);
    } catch {
      return [];
    }
  },
  add(input: { title: string; status?: string; owner?: string; notes?: string }) {
    const list = this.list();
    const item = {
      id: `proj-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      status: input.status ?? 'open',
      owner: input.owner ?? 'unassigned',
      notes: input.notes ?? '',
      createdAt: new Date().toISOString()
    };
    list.push(item);
    Bun.write(path.join(ANALYTICS_DIR, 'projects.json'), JSON.stringify(list, null, 2), { createPath: true });
    return item;
  }
};
const docsChecklistService = {
  list(): any[] {
    try {
      const text = Bun.file(path.join(ANALYTICS_DIR, 'doc-checklist.json')).textSync();
      return JSON.parse(text);
    } catch {
      return [];
    }
  }
};
const backlogService = {
  list(): any[] {
    try {
      const text = Bun.file(path.join(ANALYTICS_DIR, 'backlog.json')).textSync();
      return JSON.parse(text);
    } catch {
      return [];
    }
  },
  save(items: any[]) {
    Bun.write(path.join(ANALYTICS_DIR, 'backlog.json'), JSON.stringify(items, null, 2), { createPath: true });
  },
  add(input: { title: string; status?: string; tag?: string; priority?: string; owner?: string; notes?: string }) {
    const items = this.list();
    const item = {
      id: `task-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      status: input.status ?? 'open',
      tag: input.tag ?? 'general',
      priority: input.priority ?? 'medium',
      owner: input.owner ?? 'unassigned',
      notes: input.notes ?? '',
      createdAt: new Date().toISOString(),
      activity: [{ at: new Date().toISOString(), message: 'created' }]
    };
    items.push(item);
    this.save(items);
    return item;
  },
  update(id: string, status: string) {
    const items = this.list();
    const idx = items.findIndex((t: any) => t.id === id);
    if (idx === -1) return null;
    items[idx].status = status;
    items[idx].updatedAt = new Date().toISOString();
    items[idx].activity = items[idx].activity || [];
    items[idx].activity.push({ at: new Date().toISOString(), message: `status -> ${status}` });
    this.save(items);
    return items[idx];
  },
  log(id: string, message: string) {
    const items = this.list();
    const idx = items.findIndex((t: any) => t.id === id);
    if (idx === -1) return null;
    items[idx].activity = items[idx].activity || [];
    items[idx].activity.push({ at: new Date().toISOString(), message });
    this.save(items);
    return items[idx];
  }
};
const crossEventService = {
  events: [] as any[],
  add(evt: any) {
    this.events.push({ ...evt, at: new Date().toISOString() });
    if (this.events.length > 50) this.events.shift();
    Bun.write(path.join(ANALYTICS_DIR, 'cross-events.json'), JSON.stringify(this.events, null, 2), { createPath: true });
    if (chatServiceRef) {
      const label = evt?.type ? `[${evt.type}]` : '[event]';
      chatServiceRef.addSystemMessage(`🔔 ${label} ${evt?.message ?? ''}`);
    }
  },
  list() {
    return this.events.slice(-20).reverse();
  }
};

const chatService = new GroqChatService();
chatServiceRef = chatService;
const profileService = new ProfileService();
const achievementsService = new AchievementsService();
const collectiveArcService = new CollectiveArcService();
const questService = new QuestService();
const devBacklogService = new DevBacklogService();
const devDecisionLog = new DevDecisionLog();

serviceRegistry.register({
  name: 'Dream Journal',
  port: 9000,
  status: 'online',
  description: 'Speichert bewusste Träume und Archetypen',
  endpoints: ['/dreams', '/dreams/analyze']
});
serviceRegistry.register({
  name: 'Emotional Resonance',
  port: 9000,
  status: 'online',
  description: 'Tracking von Emotionen, Insights & Regulation',
  endpoints: ['/emotions', '/emotions/state']
});
serviceRegistry.register({
  name: 'Memory Palace',
  port: 9000,
  status: 'online',
  description: 'Lebendiger Gedächtnispalast für Toobix',
  endpoints: ['/memories', '/memories/rooms', '/memories/search']
});
serviceRegistry.register({
  name: 'Duality Bridge',
  port: 9000,
  status: 'online',
  description: 'Maskulin/Feminin Balance',
  endpoints: ['/duality/state', '/duality/update', '/duality/history', '/duality/balance']
});
serviceRegistry.register({
  name: 'Gratitude & Mortality',
  port: 9000,
  status: 'online',
  description: 'Dankbarkeit, Memento Mori & Sinn',
  endpoints: ['/gratitude', '/mortality/reflect']
});
serviceRegistry.register({
  name: 'Conscious Game Engine',
  port: 9000,
  status: 'online',
  description: 'Mini-Challenges für Wachstum & Fokus',
  endpoints: ['/game/state', '/game/challenge']
});
serviceRegistry.register({
  name: 'Meta Reflection',
  port: 9000,
  status: 'online',
  description: 'Meta-Bewusstsein und Wert-Analysen',
  endpoints: ['/meta/reflect', '/value/analyze']
});
serviceRegistry.register({
  name: 'Dev Backlog',
  port: 9000,
  status: 'online',
  description: 'Self-evolving Backlog & Decisions',
  endpoints: ['/dev/backlog', '/dev/decisions']
});

const gatewayPort = Number(process.env.TOOBIX_GATEWAY_PORT ?? '9000');
const hardwareBaseUrl = process.env.TOOBIX_BASE_URL ?? 'http://localhost';
const hardwarePort = Number(process.env.TOOBIX_HARDWARE_PORT ?? '8940');

const dreamInputSchema = z.object({
  type: z.enum(['lucid', 'predictive', 'creative', 'integration', 'shadow']).optional(),
  narrative: z.string().min(3),
  symbols: z.array(z.string()).max(20).optional().default([]),
  emotions: z.array(z.string()).max(20).optional().default([]),
  insights: z.array(z.string()).max(20).optional().default([]),
  integration: z.string().max(500).optional()
});

const dreamAnalyzeSchema = z.object({
  dreamId: z.string().min(1)
});

const emotionInputSchema = z.object({
  primaryEmotion: z.string().min(2),
  valence: z.number().min(-100).max(100).optional(),
  arousal: z.number().min(-100).max(100).optional(),
  intensity: z.number().min(0).max(100).optional(),
  context: z.string().optional(),
  channel: z.string().optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional()
});

const memoryInputSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1),
  category: z.string().optional().default('reflection'),
  roomId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  significance: z.number().min(0).max(100).optional()
});

const memorySearchSchema = z.object({
  query: z.string().min(1)
});

const gratitudeInputSchema = z.object({
  text: z.string().min(1),
  category: z.string().optional()
});

const chatInputSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  context: z.record(z.string(), z.any()).optional()
});

const valueAnalyzeSchema = z.object({
  activity: z.string().min(2).max(200)
});

function validationError(error: z.ZodError | string) {
  if (typeof error === 'string') {
    return jsonResponse({ error }, 422);
  }
  return jsonResponse(
    {
      error: 'Validation failed',
      issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message }))
    },
    422
  );
}

async function parseJsonBodyWithSchema<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ data: T } | { error: Response }> {
  const body = await readJsonBody<unknown>(request);
  if (body === null) {
    return { error: badRequest('Invalid JSON body') };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { error: validationError(parsed.error) };
  }
  return { data: parsed.data as T };
}

function requireApiKey(request: Request, pathname: string) {
  if (!REQUIRED_API_KEY) return null;
  if (pathname === '/health' || pathname === '/openapi') return null;
  const headerToken =
    request.headers.get('x-toobix-key') ??
    request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '')
      ?.trim();
  if (headerToken !== REQUIRED_API_KEY) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  return null;
}

function buildOpenApiSpec() {
  const base = `http://localhost:${gatewayPort}`;
  return {
    openapi: '3.1.0',
    info: {
      title: 'Toobix Unified Service Gateway',
      version: '0.1.0',
      description: 'Bun HTTP API für Dreams, Emotions, Memories, Duality, Game & Chat'
    },
    servers: [{ url: base }],
    paths: {
      '/health': { get: { summary: 'Health status' } },
      '/dashboard': { get: { summary: 'Aggregated dashboard snapshot' } },
      '/dreams': {
        get: { summary: 'List recent dreams' },
        post: { summary: 'Persist a dream', requestBody: { description: 'Dream input payload' } }
      },
      '/dreams/analyze': { post: { summary: 'Analyze a stored dream' } },
      '/emotions': {
        get: { summary: 'List emotional history' },
        post: { summary: 'Record emotional entry' }
      },
      '/emotions/state': { get: { summary: 'Current emotional state with insights' } },
      '/emotions/insights': { get: { summary: 'Return insights only' } },
      '/memories': { get: { summary: 'List memories' }, post: { summary: 'Store a memory' } },
      '/memories/rooms': { get: { summary: 'List memory palace rooms' } },
      '/memories/search': { post: { summary: 'Search memories' } },
      '/gratitude': { get: { summary: 'List gratitude entries' }, post: { summary: 'Add gratitude entry' } },
      '/achievements': { get: { summary: 'List achievements' } },
      '/collective/arcs': { get: { summary: 'List collective arcs' }, post: { summary: 'Contribute to arc' } },
      '/collective/contribute': { post: { summary: 'Contribute to a collective arc' } },
      '/quests/today': { get: { summary: 'List today quests' } },
      '/quests/complete': { post: { summary: 'Mark quest as completed' } },
      '/quests/refresh': { post: { summary: 'Refresh quests from news RSS' } },
      '/game/state': { get: { summary: 'Get game state' } },
      '/game/challenge': { get: { summary: 'Next challenge' }, post: { summary: 'Complete challenge' } },
      '/duality/state': { get: { summary: 'Duality state' } },
      '/duality/update': { post: { summary: 'Update duality state' } },
      '/chat': { post: { summary: 'Chat with Toobix (Groq proxied)' } },
      '/chat/history': { get: { summary: 'Recent chat history' } },
      '/chat/clear': { post: { summary: 'Reset chat history' } },
      '/profile': { get: { summary: 'Profile state' }, post: { summary: 'Activate/pause arcs' } },
      '/profile/arcs': { get: { summary: 'List arcs only' } },
      '/backlog': { get: { summary: 'List backlog' }, post: { summary: 'Add backlog item' } },
      '/backlog/status': { post: { summary: 'Update backlog status' } },
      '/dev/backlog': { get: { summary: 'List dev backlog' }, post: { summary: 'Add dev backlog item' } },
      '/dev/backlog/status': { post: { summary: 'Update backlog status' } },
      '/dev/decisions': { get: { summary: 'List dev decisions' }, post: { summary: 'Add dev decision log entry' } },
      '/self/improve': { get: { summary: 'Self-improvement snapshot with suggestions' } },
      '/self/apply': { post: { summary: 'Apply improvement actions (seed/log/backlog)' } },
      '/self/plan': { get: { summary: 'Plan actionable self-improvement steps' } },
      '/self/run': { post: { summary: 'Execute a light self-improvement cycle' } },
      '/self/backup': { post: { summary: 'Create a lightweight backup snapshot' } },
      '/code/scan': { get: { summary: 'Lightweight code scan for TODOs' } },
      '/mesh/scan': { get: { summary: 'Check service mesh health' } },
      '/services': { get: { summary: 'Service registry snapshot' } }
      ,
      '/metrics': { get: { summary: 'Lightweight system metrics' } }
    }
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

function badRequest(message: string) {
  return jsonResponse({ error: message }, 400);
}

async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

async function fetchHardwareSnapshot() {
  try {
    const controller = AbortSignal.timeout(1500);
    const [stateRes, feelRes] = await Promise.all([
      fetch(`${hardwareBaseUrl}:${hardwarePort}/hardware/state`, { signal: controller }),
      fetch(`${hardwareBaseUrl}:${hardwarePort}/hardware/feel`, { signal: controller })
    ]);
    if (!stateRes.ok) {
      throw new Error('Hardware state unavailable');
    }
    const hardware = await stateRes.json();
    const feeling = feelRes.ok ? await feelRes.json() : null;
    return { hardware, feeling };
  } catch {
    return { hardware: null, feeling: null };
  }
}

async function buildDashboard() {
  const [{ hardware, feeling }, emotions, gratitudes] = await Promise.all([
    fetchHardwareSnapshot(),
    Promise.resolve({
      state: emotionalResonance.currentState(),
      insights: emotionalResonance.insights(25)
    }),
    Promise.resolve(gratitudeService.list(5))
  ]);

  return {
    timestamp: new Date().toISOString(),
    hardware,
    feeling,
    duality: { state: dualityBridge.getState(), history: dualityBridge.historyList(10) },
    dreams: { recent: dreamJournal.list(5) },
    emotions,
    memory: { rooms: memoryPalace.roomsList(), recent: memoryPalace.list(5) },
    gratitudes,
    dev: {
      backlog: devBacklogService.list(20),
      decisions: devDecisionLog.list(10)
    },
    services: serviceRegistry.getAll(),
    game: gameService.getState(),
    profile: profileService.getState(),
    achievements: achievementsService.list(5),
    collective: { arcs: collectiveArcService.list() },
    quests: questService.today()
  };
}

async function buildMetrics() {
  const profile = profileService.getState();
  const backlogCount = backlogService.list().length;
  return {
    timestamp: new Date().toISOString(),
    services: serviceRegistry.getAll().length,
    dreams: dreamJournal.list(1000).length,
    emotions: emotionalResonance.history(1000).length,
    memories: memoryPalace.list(1000).length,
    gratitudes: gratitudeService.list(1000).length,
    devBacklog: backlogCount,
    devDecisions: devDecisionLog.list(1000).length,
    achievements: achievementsService.list(200).length,
    collectiveArcs: collectiveArcService.list().length,
    quests: questService.today().length,
    profile: {
      level: profile.level,
      xp: profile.xp,
      arcs: Object.keys(profile.arcs).length
    },
    storage: {
      sqlite: process.env.TOOBIX_STORAGE === 'sqlite',
      apiKey: Boolean(REQUIRED_API_KEY)
    }
  };
}

export { buildMetrics };

type ActionRequest = { type: string; payload?: any };
type Suggestion = { severity: 'critical' | 'warn' | 'info'; title: string; details?: string; actions?: string[] };

async function createBackupSnapshot() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(BACKUP_DIR, ts);
  await fs.mkdir(target, { recursive: true });
  const pathsToCopy = ['services', 'scripts', 'src', 'package.json', 'tsconfig.toobix-src.json'];
  for (const rel of pathsToCopy) {
    const sourcePath = path.join(REPO_ROOT, rel);
    try {
      const stat = await fs.stat(sourcePath);
      if (stat.isDirectory()) {
        await fs.cp(sourcePath, path.join(target, rel), { recursive: true, force: true });
      } else {
        await fs.copyFile(sourcePath, path.join(target, rel));
      }
    } catch {
      // ignore missing paths
    }
  }
  return target;
}

function groqKeyAvailable(): boolean {
  if (process.env.GROQ_API_KEY?.trim()) return true;
  try {
    const content = Bun.file(GROQ_KEY_FILE).textSync();
    return Boolean(content.trim());
  } catch {
    return false;
  }
}

function evaluateSelf(snapshot: { metrics: any; dashboard: any; groqKeyPresent: boolean }) {
  const suggestions: Suggestion[] = [];
  const recommended: ActionRequest[] = [];
  const metrics = snapshot.metrics;
  const dashboard = snapshot.dashboard;

  if (!snapshot.groqKeyPresent) {
    suggestions.push({
      severity: 'warn',
      title: 'GROQ/API-Key fehlt',
      details: 'Ohne Key laeuft Chat nur im Demo-Modus.',
      actions: ['Setze GROQ_API_KEY oder POST /chat/set-api-key { apiKey }']
    });
  }

  const lowDataChecks: Array<[number | undefined, number, string, string, ActionRequest]> = [
    [metrics?.dreams, 3, 'Wenig Traeume', 'Dream Journal hat < 3 Eintraege.', { type: 'seed.dream' }],
    [metrics?.emotions, 3, 'Kaum Emotionsdaten', 'Weniger als 3 Emotions-Logs.', { type: 'seed.emotion' }],
    [metrics?.memories, 1, 'Memory Palace leer', 'Keine oder zu wenige Memories.', { type: 'seed.memory' }],
    [metrics?.gratitudes, 1, 'Gratitude fehlt', 'Noch keine Dankbarkeiten.', { type: 'seed.gratitude' }]
  ];

  for (const [value, min, title, details, action] of lowDataChecks) {
    if (typeof value === 'number' && value < min) {
      suggestions.push({ severity: 'info', title, details });
      recommended.push(action);
    }
  }

  if (Array.isArray(dashboard?.quests) && dashboard.quests.length === 0) {
    suggestions.push({
      severity: 'info',
      title: 'Keine Tagesquests',
      details: 'Starte neue Quests aus News/Seeds.'
    });
    recommended.push({ type: 'quests.refresh' });
  }

  if (Array.isArray(dashboard?.dev?.backlog) && dashboard.dev.backlog.length < 3) {
    suggestions.push({
      severity: 'info',
      title: 'Dev-Backlog ist duenn',
      details: 'Fuelle Backlog mit Self-Evolve Tickets.'
    });
    recommended.push({
      type: 'backlog.add',
      payload: { title: 'Self-Evolve Seeds', description: 'Fuelle Träume/Emotionen/Memories/Gratitude und Quests.' }
    });
  }

  if (Array.isArray(dashboard?.services) && dashboard.services.length < 10) {
    suggestions.push({
      severity: 'warn',
      title: 'Service Mesh prüfen',
      details: `Nur ${dashboard.services.length} Services gemeldet. Mesh Scan ausführen.`
    });
    recommended.push({ type: 'mesh.scan' });
  }

  if (snapshot.dashboard?.services && snapshot.dashboard.services.length < 6) {
    suggestions.push({
      severity: 'warn',
      title: 'Wenige Services aktiv',
      details: `Registry meldet nur ${snapshot.dashboard.services.length} Services.`,
      actions: ['start-all.ts --mode bridge/full']
    });
  }

  return { suggestions, recommendedActions: recommended };
}

function buildBacklogFindings(metrics: any, dashboard: any) {
  const created: any[] = [];
  const addFinding = (title: string, tag = 'improve', priority = 'medium', notes = '') => {
    const item = backlogService.add({ title, tag, priority, owner: 'system', notes });
    crossEventService.add({ type: 'backlog', message: title, payload: { id: item.id, status: item.status } });
    created.push(item);
  };
  if ((metrics?.dreams ?? 0) < 3) addFinding('Zu wenige Träume (<3) loggen', 'data', 'medium');
  if ((metrics?.emotions ?? 0) < 3) addFinding('Emotionen loggen (<3)', 'data', 'medium');
  if ((metrics?.memories ?? 0) < 1) addFinding('Memory Palace befüllen', 'data', 'medium');
  if ((metrics?.gratitudes ?? 0) < 1) addFinding('Gratitude-Eintrag anlegen', 'data', 'medium');
  if (Array.isArray(dashboard?.services) && dashboard.services.length < 10) {
    addFinding(`Mesh prüfen (${dashboard.services.length} Services)`, 'mesh', 'high');
  }
  return created;
}

async function applyAction(action: ActionRequest) {
  const type = action.type;
  switch (type) {
    case 'seed.dream': {
      const entry = await dreamJournal.record({
        type: 'creative',
        narrative: `Auto dream seed ${new Date().toISOString()}`,
        symbols: ['self-improve'],
        emotions: ['calm'],
        insights: ['baseline']
      });
      return { ok: true, result: entry };
    }
    case 'seed.emotion': {
      const entry = await emotionalResonance.record({
        primaryEmotion: 'curiosity',
        valence: 10,
        arousal: 15,
        intensity: 55,
        context: 'self-improve',
        channel: 'auto'
      });
      return { ok: true, result: entry };
    }
    case 'seed.memory': {
      const entry = await memoryPalace.store({
        title: 'Auto memory seed',
        content: 'Self-improve baseline memory entry.',
        category: 'reflection',
        tags: ['self-improve', 'bootstrap']
      });
      return { ok: true, result: entry };
    }
    case 'seed.gratitude': {
      const entry = await gratitudeService.record('Dankbarkeit fuer Self-Improve Seed');
      return { ok: true, result: entry };
    }
    case 'backlog.add': {
      const payload = action.payload ?? {};
      const item = backlogService.add({
        title: payload.title ?? 'Self-Evolve Task',
        notes: payload.description ?? 'Auto-added from self/apply',
        tag: payload.category ?? 'improve',
        priority: 'medium',
        owner: 'system'
      });
      devDecisionLog.add({ title: 'Backlog add (apply)', decision: item.id, rationale: item.title });
      return { ok: true, result: item };
    }
    case 'backlog.status': {
      const payload = action.payload ?? {};
      if (!payload.id || !payload.status) {
        return { ok: false, error: 'id/status required' };
      }
      const updated = backlogService.update(payload.id, payload.status);
      if (!updated) return { ok: false, error: 'not found' };
      devDecisionLog.add({ title: 'Backlog update (apply)', decision: updated.status, rationale: updated.id });
      return { ok: true, result: updated };
    }
    case 'quests.refresh': {
      const refreshed = await questService.refreshFromNews();
      return { ok: true, result: { added: refreshed.length } };
    }
    default:
      return { ok: false, error: `unknown action ${type}` };
  }
}

export type ChatCommand = { command: string; args: string };

export function parseChatCommand(message: string): ChatCommand | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }
  const [command, ...rest] = trimmed.slice(1).split(' ');
  return {
    command: command?.toLowerCase() ?? '',
    args: rest.join(' ').trim()
  };
}

export function formatDashboardSummary(snapshot: Awaited<ReturnType<typeof buildDashboard>>) {
  const hardwareLine = snapshot.hardware
    ? `Hardware: CPU ${snapshot.hardware.cpu?.usage ?? '--'}% | RAM ${snapshot.hardware.memory?.usagePercent ?? '--'}%`
    : 'Hardware: --';
  const duality = snapshot.duality?.state;
  const dualityLine = duality
    ? `Dualität: Mask ${duality.masculine.intensity}% / Fem ${duality.feminine.intensity}% (Harmonie ${duality.harmony}%)`
    : 'Dualität: --';
  const emotion = snapshot.emotions?.state;
  const emotionLine = emotion
    ? `Emotion: ${emotion.dominant} (Valenz ${emotion.valence} | Arousal ${emotion.arousal})`
    : 'Emotion: --';
  const dreamsLine = `Träume: ${(snapshot.dreams?.recent ?? []).length} gespeichert`;
  const gratitudeLine = `Dankbarkeit: ${(snapshot.gratitudes ?? []).length} aktuell`;
  const game = snapshot.game;
  const gameLine = game ? `Game: Level ${game.level} | Score ${game.score}` : 'Game: --';
  const profile = snapshot.profile;
  const profileLine = profile
    ? `Profil: Level ${profile.level} | XP ${profile.xp} | Arcs ${Object.keys(profile.arcs).length}`
    : 'Profil: --';
  return [hardwareLine, dualityLine, emotionLine, dreamsLine, gratitudeLine, gameLine, profileLine].join('\n');
}

async function handleChatCommand(command: ChatCommand) {
  const args = command.args;
  switch (command.command) {
    case 'status': {
      const dashboard = await buildDashboard();
      return {
        text: formatDashboardSummary(dashboard),
        reward: profileService.reward('insight', 8)
      };
    }
    case 'dream': {
      if (!args) {
        return { text: 'Beschreibe deinen Traum nach /dream.', reward: profileService.reward('dream', 2) };
      }
      const [firstWord, ...rest] = args.split(' ');
      const dreamTypes: DreamType[] = ['lucid', 'predictive', 'creative', 'integration', 'shadow'];
      let type: DreamType = 'creative';
      let narrative = args;
      if (dreamTypes.includes(firstWord as DreamType)) {
        type = firstWord as DreamType;
        narrative = rest.join(' ').trim();
      }
      if (!narrative) {
        return { text: 'Bitte gib nach dem Traumtyp auch eine Beschreibung.', reward: profileService.reward('dream', 1) };
      }
      const entry = await dreamJournal.record({
        type,
        narrative,
        symbols: [],
        emotions: [],
        insights: []
      });
      return {
        text: `Traum ${entry.id} gespeichert (${entry.type}).`,
        reward: profileService.reward('dream', 10)
      };
    }
    case 'dreams': {
      const list = dreamJournal.list(5);
      const text =
        list.length === 0
          ? 'Keine Träume gespeichert.'
          : list.map((d) => `• ${d.id} (${d.type}) ${d.narrative.slice(0, 80)}`).join('\n');
      return { text, reward: profileService.reward('dream', 4) };
    }
    case 'emotion': {
      if (!args) {
        return {
          text: 'Nutze /emotion <Gefühl> <Intensität 0-100> [Notiz].',
          reward: profileService.reward('emotion', 2)
        };
      }
      const parts = args.split(' ');
      const emotion = parts.shift();
      if (!emotion) {
        return { text: 'Bitte gib ein Gefühl an.', reward: profileService.reward('emotion', 1) };
      }
      const intensityRaw = parts.shift();
      const intensity = Math.max(0, Math.min(100, Number(intensityRaw) || 50));
      const notes = parts.join(' ');
      const valence = Math.round((intensity - 50) / 2);
      const entry = await emotionalResonance.record({
        primaryEmotion: emotion,
        channel: 'chat',
        valence,
        arousal: valence,
        intensity,
        notes,
        context: 'chat'
      });
      return {
        text: `Emotion ${entry.primaryEmotion} registriert (Valenz ${entry.valence}, Intensität ${entry.intensity}).`,
        reward: profileService.reward('emotion', 8)
      };
    }
    case 'gratitude': {
      if (!args) {
        return { text: 'Wofür bist du dankbar? Nutze /gratitude <Text>.', reward: profileService.reward('heart', 2) };
      }
      const entry = await gratitudeService.record(args);
      collectiveArcService.contribute('gratitude-100', 1);
      return {
        text: `Dankbarkeit gespeichert (${entry.timestamp.slice(0, 16)}): ${entry.text}`,
        reward: profileService.reward('heart', 10)
      };
    }
    case 'selfdev': {
      const [sub, ...rest] = args ? args.split(' ') : ['status'];
      const mode = (sub || 'status').toLowerCase();
      const metrics = await buildMetrics();
      const backlog = devBacklogService.list(5);
      const decisions = devDecisionLog.list(3);
      const stringifyBacklog = backlog.length
        ? backlog.map((b) => `- ${b.id} [${b.status}] ${b.title}`).join('\n')
        : 'Keine offenen Backlog-Einträge.';
      if (mode === 'status') {
        const lines = [
          `Services: ${metrics.services}`,
          `Dreams/Emotions/Memories/Gratitude: ${metrics.dreams}/${metrics.emotions}/${metrics.memories}/${metrics.gratitudes}`,
          `Dev Backlog: ${metrics.devBacklog} | Decisions: ${metrics.devDecisions}`,
          `Backlog (Top 5):\n${stringifyBacklog}`
        ];
        return {
          text: lines.join('\n'),
          reward: profileService.reward('insight', 5)
        };
      }
      if (mode === 'plan') {
        const ideas: string[] = [];
        if (metrics.dreams < 3) ideas.push('Fülle Dream Journal (>=3)');
        if (metrics.emotions < 3) ideas.push('Logge Emotionen (>=3)');
        if (metrics.memories < 1) ideas.push('Lege Memory-Eintrag an');
        if (metrics.devBacklog < 3) ideas.push('Erzeuge 3 Dev-Backlog-Tickets aus aktuellen Metriken');
        if (!ideas.length) ideas.push('System stabil; Fokus auf neue Services/Apps denkbar.');
        return { text: `SelfDev-Plan:\n- ${ideas.join('\n- ')}`, reward: profileService.reward('insight', 6) };
      }
      if (mode === 'apply') {
        const added: string[] = [];
        const ensure = (title: string, desc: string) => {
          const exists = backlog.some((b) => b.title.toLowerCase() === title.toLowerCase() && b.status === 'open');
          if (!exists) {
            const item = devBacklogService.add({ title, description: desc, source: 'chat' });
            devDecisionLog.add({ title: 'Backlog add (chat)', decision: item.id, rationale: title });
            added.push(item.id);
          }
        };
        ensure('Fülle Dream Journal', 'Mindestens 3 kreative Träume posten, um Muster zu erkennen.');
        ensure('Emotionen loggen', 'Mindestens 3 Emotions-Checkins speichern.');
        ensure('Memory Palace befüllen', 'Mindestens 1 Memory-Eintrag sichern.');
        ensure('Gratitude erfassen', 'Mindestens 1 Dankbarkeitseintrag erfassen.');
        return {
          text:
            added.length === 0
              ? 'Keine neuen Einträge hinzugefügt; Backlog bereits vorbereitet.'
              : `Backlog erweitert: ${added.join(', ')}`,
          reward: profileService.reward('builder', 8)
        };
      }
      return {
        text: 'Selbst-Dev Befehle: /selfdev status | /selfdev plan | /selfdev apply',
        reward: profileService.reward('insight', 2)
      };
    }
    case 'memory': {
      if (!args) {
        return { text: 'Nutze /memory <Titel> :: <Beschreibung>.', reward: profileService.reward('memory', 2) };
      }
      const [titlePart, ...rest] = args.split('::');
      const title = titlePart.trim() || 'Chat Memory';
      const content = rest.join('::').trim() || titlePart.trim();
      const entry = await memoryPalace.store({
        title: title.slice(0, 80),
        content,
        category: 'chat',
        tags: [],
        significance: 60
      });
      return {
        text: `Memory ${entry.id} gespeichert: ${entry.title}`,
        reward: profileService.reward('memory', 9)
      };
    }
    case 'memories': {
      const list = memoryPalace.list(3);
      const text =
        list.length === 0
          ? 'Noch keine Erinnerungen.'
          : list.map((m) => `• ${m.title} (${m.timestamp.slice(0, 16)})`).join('\n');
      return { text, reward: profileService.reward('memory', 4) };
    }
    case 'quests': {
      const quests = questService.today();
      if (!quests.length) {
        return { text: 'Heute keine Quests aktiv.', reward: profileService.reward('quest', 2) };
      }
      const lines = quests.map((q) => `• ${q.title} (${q.difficulty}) – ${q.summary}`).join('\n');
      return { text: lines, reward: profileService.reward('quest', 4) };
    }
    case 'quest': {
      const [action, questId] = args.split(' ');
      if (action === 'complete' && questId) {
        const quest = questService.complete(questId);
        if (!quest) return { text: 'Quest nicht gefunden.', reward: profileService.reward('quest', 1) };
        const reward = profileService.reward('quest', quest.rewardXp ?? 5, undefined, quest.title);
        const ach = achievementsService.unlock('Quest erfüllt', quest.title, 'quest');
        return {
          text: `Quest "${quest.title}" erledigt. Danke!`,
          reward,
          achievements: [ach]
        };
      }
      return { text: 'Nutze /quest complete <id> oder /quests.', reward: profileService.reward('quest', 1) };
    }
    case 'achievements': {
      const list = achievementsService.list(10);
      const text =
        list.length === 0 ? 'Noch keine Achievements.' : list.map((a) => `• ${a.title} (${a.source})`).join('\n');
      return { text, reward: profileService.reward('meta', 2) };
    }
    case 'collective': {
      const arcs = collectiveArcService.list();
      const text = arcs
        .map((a) => `• ${a.title}: ${a.progress}/${a.target} (${a.contributors} Beiträge)`)
        .join('\n');
      return { text, reward: profileService.reward('community', 3) };
    }
    case 'game': {
      if (args.startsWith('complete')) {
        const [, challengeIdRaw, scoreRaw] = args.split(' ');
        if (!challengeIdRaw) {
          return { text: 'Nutze /game complete <challengeId> [score].', reward: profileService.reward('growth', 2) };
        }
        const state = gameService.completeChallenge(challengeIdRaw, {
          score: Number(scoreRaw) || undefined
        });
        return {
          text: `Challenge abgeschlossen. Level ${state.level}, Score ${state.score}.`,
          reward: profileService.reward('growth', 12)
        };
      }
      const challenge = gameService.nextChallenge();
      return {
        text: `Neue Challenge (${challenge.challengeId}): ${challenge.challenge}`,
        reward: profileService.reward('growth', 6)
      };
    }
    case 'duality': {
      const state = dualityBridge.getState();
      return {
        text: `Dualität\nMaskulin ${state.masculine.intensity}% (${state.masculine.mode})\nFeminin ${state.feminine.intensity}% (${state.feminine.mode})\nHarmonie ${state.harmony}% (${state.currentPhase})`,
        reward: profileService.reward('balance', 5)
      };
    }
    case 'meta': {
      const reflection = metaReflection.reflect();
      return {
        text: `Meta-Reflexion (${reflection.theme})\nFrage: ${reflection.prompt}\nInsight: ${reflection.insight}`,
        reward: profileService.reward('meta', 7)
      };
    }
    case 'value': {
      if (!args) {
        return { text: 'Nutze /value <Aktivität>.', reward: profileService.reward('purpose', 2) };
      }
      const analysis = valueAnalyzer.analyze(args);
      const dims = analysis.dimensions.map((d) => `${d.name}: ${d.score}`).join(' | ');
      return {
        text: `Wertanalyse für "${analysis.activity}"\nScore: ${analysis.valueScore}\n${dims}\nEmpfehlung: ${analysis.recommendation}`,
        reward: profileService.reward('purpose', 9)
      };
    }
    case 'mortality': {
      const insight = mortalityService.reflect();
      return {
        text: `Memento Mori (${insight.moment})\n${insight.reminder}\nPraxis: ${insight.practices.join(', ')}`,
        reward: profileService.reward('soul', 8)
      };
    }
    case 'perspectives': {
      const perspectives = perspectiveMatrix.list();
      return {
        text: perspectives.map((p) => `${p.title}: ${p.focus}`).join('\n'),
        reward: profileService.reward('insight', 4)
      };
    }
    case 'profile': {
      const state = profileService.getState();
      const arcs = Object.values(state.arcs)
        .filter((arc) => arc.active)
        .map((arc) => `${arc.title} (${arc.xp} XP)`)
        .join(', ');
      const lines = [
        `Level ${state.level} (${state.xp} XP)`,
        `Aktive Arcs: ${arcs || 'keine'}`,
        `Artefakte: ${state.artifacts.join(', ') || 'keine'}`
      ];
      return { text: lines.join('\n'), reward: profileService.reward('reflection', 3) };
    }
    case 'arc': {
      const [action, ...rest] = args.split(' ');
      const name = rest.join(' ').trim();
      if (!action || !name) {
        return { text: 'Nutze /arc activate|pause <Name>.', reward: profileService.reward('reflection', 2) };
      }
      if (action === 'activate') {
        profileService.activateArc(name);
        return { text: `Arc "${name}" aktiviert.`, reward: profileService.reward('reflection', 4) };
      }
      if (action === 'pause') {
        profileService.pauseArc(name);
        return { text: `Arc "${name}" pausiert.`, reward: profileService.reward('reflection', 4) };
      }
      return { text: 'Unbekannte Aktion für /arc.', reward: profileService.reward('reflection', 1) };
    }
    case 'help': {
      const commands = [
        '/status',
        '/dream <Typ?> <Text>',
        '/dreams',
        '/emotion <Emotion> <Intensität> [Notiz]',
        '/gratitude <Text>',
        '/memory <Titel :: Inhalt>',
        '/memories',
        '/game [complete <id> <score>]',
        '/quests | /quest complete <id>',
        '/duality',
        '/meta',
        '/value <Aktivität>',
        '/mortality',
        '/perspectives',
        '/profile',
        '/achievements',
        '/collective',
        '/arc activate|pause <Name>'
      ];
      return {
        text: `Verfügbare Befehle:\n${commands.join('\n')}`,
        reward: profileService.reward('exploration', 2)
      };
    }
    default:
      return {
        text: `Ich kenne den Befehl "/${command.command}" noch nicht.`,
        reward: profileService.reward('exploration', 2)
      };
  }
}

const shouldStartGateway = process.env.NODE_ENV !== 'test' && process.env.TOOBIX_DISABLE_GATEWAY !== '1';

const gatewayServer = shouldStartGateway
  ? Bun.serve({
      port: gatewayPort,
      async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const { pathname, searchParams } = url;
        const method = request.method.toUpperCase();

        try {
          const unauthorized = requireApiKey(request, pathname);
      if (unauthorized) {
        return unauthorized;
      }

      if (method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      if (pathname === '/health') {
        return jsonResponse({
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: serviceRegistry.getAll(),
              dreams: dreamJournal.list(3).length,
              emotions: emotionalResonance.history(5).length,
              secure: Boolean(REQUIRED_API_KEY)
            });
          }

      if (pathname === '/openapi') {
        return jsonResponse(buildOpenApiSpec());
      }

      if (pathname === '/services') {
        return jsonResponse({ services: serviceRegistry.getAll() });
      }

      if (pathname === '/dashboard') {
        return jsonResponse(await buildDashboard());
      }

      if (pathname === '/metrics') {
        return jsonResponse(await buildMetrics());
      }

      if (pathname === '/self/improve') {
        const [metrics, dashboard] = await Promise.all([buildMetrics(), buildDashboard()]);
        const result = evaluateSelf({ metrics, dashboard, groqKeyPresent: groqKeyAvailable() });
        return jsonResponse({
          suggestions: result.suggestions,
          recommendedActions: result.recommendedActions,
          metrics,
          dashboard
        });
      }

      if (pathname === '/self/plan') {
        const plan = [
          { id: 'health-check', title: 'Health & Metrics abrufen', status: 'pending', action: '/metrics' },
          { id: 'service-mesh', title: 'Service Mesh Snapshot holen', status: 'pending', action: '/services' },
          { id: 'doc-sync', title: 'Docs-Checklist vergleichen', status: 'pending', action: 'docs-check' },
          { id: 'backlog-seed', title: 'Backlog fuellen (3 Items)', status: 'pending', action: '/backlog' }
        ];
        return jsonResponse({ plan });
      }

      if (pathname === '/self/run' && method === 'POST') {
        // Durchlauf: Metrics/Dashboard abrufen, Mesh scannen, Findings ins Backlog
        const [metrics, dashboard, mesh] = await Promise.all([buildMetrics(), buildDashboard(), meshScan()]);
        const seeds = [
          'Healthcheck auswerten',
          'Docs-Checklist pruefen',
          'Roadmap-Short aktualisieren'
        ];
        const created = seeds.map((title) => backlogService.add({ title, tag: 'self' }));
        const findings = buildBacklogFindings(metrics, dashboard);
        if (mesh.offline && mesh.offline.length) {
          mesh.offline.slice(0, 5).forEach((svc) => {
            backlogService.add({
              title: `Service offline: ${svc.name}`,
              tag: 'mesh',
              priority: 'high',
              notes: svc.note || 'unreachable',
              owner: 'system'
            });
            crossEventService.add({ type: 'mesh', message: `Offline: ${svc.name}`, payload: { port: svc.port } });
          });
        }
        return jsonResponse({ metrics, dashboard, backlog: [...created, ...findings] });
      }

      if (pathname === '/code/scan') {
        // Lightweight: suche TODO/FIXME in services/ und scripts/
        const todos: any[] = [];
        const roots = ['services', 'scripts'];
        for (const root of roots) {
          try {
            const files = Bun.globSync(`${root}/**/*.{ts,tsx,js}`).slice(0, 50);
            for (const file of files) {
              const text = Bun.file(file).textSync();
              if (/TODO|FIXME/i.test(text)) {
                todos.push({ file, note: 'TODO/FIXME gefunden' });
                if (todos.length > 20) break;
              }
            }
          } catch {}
          if (todos.length > 20) break;
        }
        return jsonResponse({ todos, count: todos.length });
      }

      if (pathname === '/mesh/scan') {
        const mesh = await meshScan();
        if (mesh.offline && mesh.offline.length) {
          mesh.offline.slice(0, 5).forEach((svc) => {
            crossEventService.add({ type: 'mesh', message: `Offline: ${svc.name}`, payload: { port: svc.port } });
          });
        }
        return jsonResponse(mesh);
      }

      if (pathname === '/self/backup' && method === 'POST') {
        const dest = await createBackupSnapshot();
        return jsonResponse({ backup: dest });
      }

      if (pathname === '/self/apply' && method === 'POST') {
        const body = await readJsonBody<{ actions?: ActionRequest[]; backup?: boolean }>(request);
        if (!body?.actions || !Array.isArray(body.actions) || body.actions.length === 0) {
          return badRequest('actions required');
        }
        if (body.actions.length > 20) {
          return badRequest('too many actions (max 20)');
        }
        let backupPath: string | null = null;
        if (body.backup !== false) {
          backupPath = await createBackupSnapshot();
        }
        const results = [];
        for (const action of body.actions) {
          const res = await applyAction(action);
          results.push({ action, ...res });
        }
        const [metricsAfter, dashboardAfter] = await Promise.all([buildMetrics(), buildDashboard()]);
        return jsonResponse({ backup: backupPath, results, metrics: metricsAfter, dashboard: dashboardAfter });
      }

      if (pathname === '/dev/backlog') {
        if (method === 'GET') {
          return jsonResponse({ backlog: backlogService.list() });
        }
        if (method === 'POST') {
          const body = await readJsonBody<{ title?: string; tag?: string; priority?: string; owner?: string; notes?: string; status?: string }>(request);
          if (!body?.title) return badRequest('title required');
          const item = backlogService.add({
            title: body.title.trim(),
            tag: body.tag ?? 'dev',
            priority: body.priority ?? 'medium',
            owner: body.owner,
            notes: body.notes,
            status: body.status
          });
          devDecisionLog.add({
            title: 'Backlog add',
            decision: `Added backlog item ${item.id}`,
            rationale: item.title
          });
          return jsonResponse({ item }, 201);
        }
      }

      if (pathname === '/dev/backlog/status' && method === 'POST') {
        const body = await readJsonBody<{ id?: string; status?: string }>(request);
        if (!body?.id || !body.status) return badRequest('id and status required');
        const updated = backlogService.update(body.id, body.status);
        if (!updated) return jsonResponse({ error: 'not found' }, 404);
        devDecisionLog.add({
          title: 'Backlog update',
          decision: `Status ${body.status}`,
          rationale: body.id
        });
        return jsonResponse({ item: updated });
      }

      if (pathname === '/dev/decisions') {
        if (method === 'GET') {
          return jsonResponse({ decisions: devDecisionLog.list(100) });
        }
        if (method === 'POST') {
          const body = await readJsonBody<{ title?: string; decision?: string; rationale?: string; context?: string }>(request);
          if (!body?.title || !body.decision) return badRequest('title and decision required');
          const entry = devDecisionLog.add({
            title: body.title,
            decision: body.decision,
            rationale: body.rationale,
            context: body.context
          });
          return jsonResponse({ entry }, 201);
        }
      }

          if (pathname === '/dreams' && method === 'GET') {
            const limit = Number(searchParams.get('limit')) || 10;
            return jsonResponse({ dreams: dreamJournal.list(limit) });
          }

          if (pathname === '/dreams' && method === 'POST') {
            const parsed = await parseJsonBodyWithSchema(request, dreamInputSchema);
            if ('error' in parsed) {
              return parsed.error;
            }
            const body = parsed.data;
            const record = await dreamJournal.record({
              type: (body.type as DreamType) ?? 'creative',
              narrative: body.narrative,
              symbols: body.symbols ?? [],
              emotions: body.emotions ?? [],
              insights: body.insights ?? [],
              integration: body.integration
            });
            return jsonResponse({ dream: record }, 201);
          }

          if (pathname === '/dreams/analyze' && method === 'POST') {
            const parsed = await parseJsonBodyWithSchema(request, dreamAnalyzeSchema);
            if ('error' in parsed) {
              return parsed.error;
            }
            const analysis = dreamJournal.analyze(parsed.data.dreamId);
            if (!analysis) {
              return jsonResponse({ error: 'Dream not found' }, 404);
            }
            return jsonResponse({ analysis });
          }

          if (pathname === '/emotions/state') {
            return jsonResponse({
              state: emotionalResonance.currentState(),
              insights: emotionalResonance.insights(30)
            });
          }

          if (pathname === '/emotions/insights') {
            return jsonResponse({ insights: emotionalResonance.insights(30) });
          }

          if (pathname === '/emotions' && method === 'GET') {
            const limit = Number(searchParams.get('limit')) || 10;
            return jsonResponse({ emotions: emotionalResonance.history(limit) });
          }

      if (pathname === '/emotions' && method === 'POST') {
        const parsed = await parseJsonBodyWithSchema(request, emotionInputSchema);
        if ('error' in parsed) {
          return parsed.error;
        }
        const body = parsed.data;
        const record = await emotionalResonance.record({
          primaryEmotion: body.primaryEmotion,
          channel: body.channel ?? 'self',
          valence: body.valence ?? 0,
          arousal: body.arousal ?? 0,
          intensity: body.intensity ?? 50,
          notes: body.notes,
          context: body.context ?? 'unspecified',
          tags: body.tags ?? []
        });
        collectiveArcService.contribute('emotion-logger', 1);
        return jsonResponse({ emotion: record }, 201);
      }

          if (pathname === '/memories/rooms') {
            return jsonResponse({ rooms: memoryPalace.roomsList() });
          }

          if (pathname === '/memories' && method === 'GET') {
            const limit = Number(searchParams.get('limit')) || 10;
            return jsonResponse({ memories: memoryPalace.list(limit) });
          }

          if (pathname === '/memories' && method === 'POST') {
            const parsed = await parseJsonBodyWithSchema(request, memoryInputSchema);
            if ('error' in parsed) {
              return parsed.error;
            }
            const body = parsed.data;
            const stored = await memoryPalace.store({
              title: body.title,
              content: body.content,
              category: body.category ?? 'reflection',
              roomId: body.roomId,
              tags: body.tags ?? [],
              significance: body.significance ?? 50
            });
            return jsonResponse({ memory: stored }, 201);
          }

          if (pathname === '/memories/search' && method === 'POST') {
            const parsed = await parseJsonBodyWithSchema(request, memorySearchSchema);
            if ('error' in parsed) {
              return parsed.error;
            }
            return jsonResponse({ results: memoryPalace.search(parsed.data.query) });
          }

          if (pathname === '/gratitude' && method === 'GET') {
            const limit = Number(searchParams.get('limit')) || 5;
            return jsonResponse({ gratitudes: gratitudeService.list(limit) });
          }

      if (pathname === '/gratitude' && method === 'POST') {
        const parsed = await parseJsonBodyWithSchema(request, gratitudeInputSchema);
        if ('error' in parsed) {
          return parsed.error;
        }
        const entry = await gratitudeService.record(parsed.data.text, parsed.data.category);
        collectiveArcService.contribute('gratitude-100', 1);
        return jsonResponse({ gratitude: entry }, 201);
      }

      if (pathname === '/achievements') {
        return jsonResponse({ achievements: achievementsService.list(50) });
      }

      if (pathname === '/collective/arcs' && method === 'GET') {
        return jsonResponse({ arcs: collectiveArcService.list() });
      }

      if (pathname === '/collective/contribute' && method === 'POST') {
        const body = await readJsonBody<{ id?: string; amount?: number }>(request);
        if (!body?.id) return badRequest('id required');
        const updated = collectiveArcService.contribute(body.id, body.amount ?? 1);
        if (!updated) return jsonResponse({ error: 'arc not found' }, 404);
        return jsonResponse({ arc: updated });
      }

      if (pathname === '/quests/today' && method === 'GET') {
        return jsonResponse({ quests: questService.today() });
      }

      if (pathname === '/quests/complete' && method === 'POST') {
        const body = await readJsonBody<{ id?: string }>(request);
        if (!body?.id) return badRequest('id required');
        const quest = questService.complete(body.id);
        if (!quest) return jsonResponse({ error: 'quest not found' }, 404);
        const reward = profileService.reward('quest', quest.rewardXp ?? 5, undefined, quest.title);
        return jsonResponse({ quest, reward });
      }

      if (pathname === '/quests/refresh' && method === 'POST') {
        const refreshed = await questService.refreshFromNews();
        return jsonResponse({ quests: refreshed });
      }

      if (pathname === '/game/state') {
        return jsonResponse({ state: gameService.getState() });
      }

          if (pathname === '/game/challenge' && method === 'GET') {
            return jsonResponse(gameService.nextChallenge());
          }

          if (pathname === '/game/challenge' && method === 'POST') {
            const body = await readJsonBody<{ challengeId?: string; result?: any }>(request);
            if (!body?.challengeId) {
              return badRequest('challengeId required');
            }
            return jsonResponse({ state: gameService.completeChallenge(body.challengeId, body.result) });
          }

          if (pathname === '/duality/state') {
            return jsonResponse({ state: dualityBridge.getState() });
          }

          if (pathname === '/duality/history') {
            const limit = Number(searchParams.get('limit')) || 10;
            return jsonResponse({ history: dualityBridge.historyList(limit) });
          }

          if (pathname === '/duality/update' && method === 'POST') {
            const body = await readJsonBody<{ activity?: string; emotion?: string }>(request);
            const state = await dualityBridge.update({
              activity: body?.activity,
              emotion: body?.emotion
            });
            return jsonResponse({ state });
          }

          if (pathname === '/duality/balance' && method === 'POST') {
            const mood = Math.random() > 0.5 ? 'creative' : 'coding';
            const state = await dualityBridge.update({ activity: mood });
            return jsonResponse({ state });
          }

          if (pathname === '/meta/reflect') {
            return jsonResponse({ reflection: metaReflection.reflect() });
          }

          if (pathname === '/value/analyze' && method === 'POST') {
            const parsed = await parseJsonBodyWithSchema(request, valueAnalyzeSchema);
            if ('error' in parsed) {
              return parsed.error;
            }
            return jsonResponse(valueAnalyzer.analyze(parsed.data.activity));
          }

          if (pathname === '/mortality/reflect' && method === 'POST') {
            return jsonResponse(mortalityService.reflect());
          }

          if (pathname === '/perspectives') {
            return jsonResponse({ perspectives: perspectiveMatrix.list() });
          }

          if (pathname === '/profile') {
            if (method === 'GET') {
              return jsonResponse({ profile: profileService.getState() });
            }
            if (method === 'POST') {
              const body = await readJsonBody<{ arc?: string; action?: 'activate' | 'pause' }>(request);
              if (!body?.arc || !body?.action) {
                return badRequest('arc & action required');
              }
              if (body.action === 'activate') {
                profileService.activateArc(body.arc);
              } else if (body.action === 'pause') {
                profileService.pauseArc(body.arc);
              }
              return jsonResponse({ profile: profileService.getState() });
            }
          }

          if (pathname === '/profile/arcs') {
            return jsonResponse({ arcs: profileService.listArcs() });
          }

          if (pathname === '/backlog') {
            if (method === 'GET') {
              return jsonResponse({ backlog: backlogService.list() });
            }
            if (method === 'POST') {
              const body = await readJsonBody<{ title?: string; tag?: string; status?: string; priority?: string; owner?: string; notes?: string }>(request);
              if (!body?.title) return badRequest('title required');
              const item = backlogService.add({
                title: body.title.trim(),
                tag: body.tag,
                status: body.status,
                priority: body.priority,
                owner: body.owner,
                notes: body.notes
              });
              crossEventService.add({ type: 'backlog', message: item.title, payload: { id: item.id, status: item.status } });
              return jsonResponse({ item }, 201);
            }
          }

          if (pathname === '/backlog/status' && method === 'POST') {
            const body = await readJsonBody<{ id?: string; status?: string }>(request);
            if (!body?.id || !body?.status) return badRequest('id & status required');
            const updated = backlogService.update(body.id, body.status);
            if (!updated) return jsonResponse({ error: 'not found' }, 404);
            backlogService.log(body.id, `status -> ${body.status}`);
            crossEventService.add({ type: 'backlog', message: updated.title, payload: { id: updated.id, status: updated.status } });
            return jsonResponse({ item: updated });
          }

          if (pathname === '/context') {
            return jsonResponse({
              profile: profileService.getState(),
              backlog: backlogService.list(),
              decisions: devDecisionLog.list(50),
              services: serviceRegistry.getAll()
            });
          }

          if (pathname === '/feedback') {
            if (method === 'GET') {
              const limit = Number(searchParams.get('limit')) || 20;
              return jsonResponse({ feedback: feedbackService.list(limit) });
            }
            if (method === 'POST') {
              const body = await readJsonBody<{ message?: string; channel?: string }>(request);
              if (!body?.message || body.message.trim().length === 0) return badRequest('message required');
              const entry = await feedbackService.add(body.message.trim(), body.channel);
              return jsonResponse({ entry }, 201);
            }
          }

          if (pathname === '/analyze/emotions') {
            const hist = emotionalResonance.history(200);
            const counts: Record<string, number> = {};
            hist.forEach((e: any) => {
              const k = (e.primaryEmotion || 'unknown').toLowerCase();
              counts[k] = (counts[k] || 0) + 1;
            });
            const sorted = Object.entries(counts)
              .map(([emotion, count]) => ({ emotion, count }))
              .sort((a, b) => b.count - a.count);
            return jsonResponse({ emotions: sorted, total: hist.length });
          }

          if (pathname === '/analyze/personality') {
            const p = profileService.getState();
            const summary = {
              creator: p.creatorName || 'Creator',
              interactions: p.interactions,
              lastTopics: p.lastTopics || [],
              lastMessage: p.lastMessage || '',
              lastChatAt: p.lastChatAt || null
            };
            return jsonResponse({ personality: summary });
          }

          if (pathname === '/feedback') {
            if (method === 'GET') {
              const limit = Number(searchParams.get('limit')) || 20;
              return jsonResponse({ feedback: feedbackService.list(limit) });
            }
            if (method === 'POST') {
              const body = await readJsonBody<{ message?: string; channel?: string }>(request);
              if (!body?.message || body.message.trim().length === 0) return badRequest('message required');
              const entry = await feedbackService.add(body.message.trim(), body.channel);
              return jsonResponse({ entry }, 201);
            }
          }

          if (pathname === '/analyze/emotions') {
            const hist = emotionalResonance.history(200);
            const counts: Record<string, number> = {};
            hist.forEach((e: any) => {
              const k = (e.primaryEmotion || 'unknown').toLowerCase();
              counts[k] = (counts[k] || 0) + 1;
            });
            const sorted = Object.entries(counts)
              .map(([emotion, count]) => ({ emotion, count }))
              .sort((a, b) => b.count - a.count);
            return jsonResponse({ emotions: sorted, total: hist.length });
          }

          if (pathname === '/analyze/personality') {
            const p = profileService.getState();
            const summary = {
              creator: p.creatorName || 'Creator',
              interactions: p.interactions,
              lastTopics: p.lastTopics || [],
              lastMessage: p.lastMessage || '',
              lastChatAt: p.lastChatAt || null
            };
            return jsonResponse({ personality: summary });
          }

          if (pathname === '/chat/clear' && method === 'POST') {
            chatService.clearHistory();
            return jsonResponse({ success: true });
          }

          if (pathname === '/plugins') {
            return jsonResponse({ plugins: pluginRegistry.list() });
          }

          if (pathname === '/plugins/run' && method === 'POST') {
            const body = await readJsonBody<{ name?: string }>(request);
            if (!body?.name) return badRequest('name required');
            const run = await pluginRunner.run(body.name);
            if (!run) return jsonResponse({ error: 'not found' }, 404);
            return jsonResponse(run);
          }

          if (pathname === '/search/web') {
            const q = searchParams.get('q');
            if (!q || !q.trim()) return badRequest('q required');
            const limit = Number(searchParams.get('limit')) || 3;
            const data = await webSearchService.search(q.trim(), limit);
            return jsonResponse(data);
          }

          if (pathname === '/projects') {
            if (method === 'GET') {
              return jsonResponse({ projects: projectService.list() });
            }
            if (method === 'POST') {
              const body = await readJsonBody<{ title?: string; status?: string; owner?: string; notes?: string }>(request);
              if (!body?.title) return badRequest('title required');
              const item = projectService.add(body);
              return jsonResponse({ project: item }, 201);
            }
          }

          if (pathname === '/docs/checklist' && method === 'GET') {
            return jsonResponse({ docs: docsChecklistService.list() });
          }

          if (pathname === '/ai/providers' && method === 'GET') {
            return jsonResponse({ providers: getAIProviders() });
          }

          if (pathname === '/sync/context' && method === 'GET') {
            return jsonResponse({ context: getContextBundle() });
          }

          if (pathname === '/cross/status' && method === 'GET') {
            return jsonResponse({ links: getCrossStatus(), events: crossEventService.list() });
          }

          if (pathname === '/events/broadcast' && method === 'POST') {
            const body = await readJsonBody<{ type?: string; message?: string; payload?: any }>(request);
            if (!body?.type) return badRequest('type required');
            crossEventService.add({ type: body.type, message: body.message ?? '', payload: body.payload ?? {} });
            return jsonResponse({ ok: true });
          }

          if (pathname === '/code/examples') {
            const lang = searchParams.get('lang') || undefined;
            return jsonResponse({ examples: codeHelperService.listExamples(lang || undefined) });
          }

          if (pathname === '/code/errors') {
            const lang = searchParams.get('lang') || undefined;
            return jsonResponse({ errors: codeHelperService.listErrors(lang || undefined) });
          }

          if (pathname === '/code/learn') {
            const cat = searchParams.get('cat') || undefined;
            return jsonResponse({ resources: codeHelperService.listLearn(cat || undefined) });
          }

          if (pathname === '/code/debug' && method === 'POST') {
            const body = await readJsonBody<{ snippet?: string; language?: string }>(request);
            if (!body?.snippet) return badRequest('snippet required');
            const data = codeHelperService.debugStub({ snippet: body.snippet, language: body.language });
            return jsonResponse(data);
          }

          if (pathname === '/code/translate' && method === 'POST') {
            const body = await readJsonBody<{ source?: string; target?: string; snippet?: string }>(request);
            if (!body?.source || !body?.target || !body?.snippet) return badRequest('source, target, snippet required');
            return jsonResponse({ translation: codeHelperService.translateStub(body as any) });
          }

          if (pathname === '/code/review' && method === 'POST') {
            const body = await readJsonBody<{ snippet?: string; language?: string }>(request);
            if (!body?.snippet) return badRequest('snippet required');
            return jsonResponse({ review: codeHelperService.reviewStub(body as any) });
          }

          if (pathname === '/chat' && method === 'POST') {
            const parsedChat = await parseJsonBodyWithSchema(request, chatInputSchema);
            if ('error' in parsedChat) {
              return parsedChat.error;
            }
            const body = parsedChat.data;
            const mirror = `Ich höre dich so: "${body.message.trim()}"`;
            const parsed = parseChatCommand(body.message);
            if (parsed) {
              const result = await handleChatCommand(parsed);
              const responseText = result.text;
              profileService.updateContext({ creatorName: 'Creator', topic: parsed.command, message: body.message });
              return jsonResponse({
                mirror,
                response: `${mirror}\n\n${responseText}`,
                reward: result.reward,
                command: parsed.command
              });
            }
            const chatContext = body.context ?? {};
            chatContext.profile = profileService.getState();
            chatContext.recentDreams = chatContext.recentDreams ?? dreamJournal.list(3);
            chatContext.duality = chatContext.duality ?? { state: dualityBridge.getState() };
            const reply = await chatService.chat(body.message, chatContext);
            profileService.updateContext({
              creatorName: 'Creator',
              topic: body.message.slice(0, 80),
              message: body.message
            });
            const reward = profileService.reward('dialog', 5);
            const collectiveDialog = collectiveArcService.contribute('dialog-100', 1);
        const unlocked =
          reward.levelUp === true
            ? achievementsService.unlock('Level Up!', 'Du hast ein neues Toobix-Level erreicht.', 'profile')
            : undefined;
        return jsonResponse({
          mirror,
          response: `${mirror}\n\n${reply}`,
          reward,
          collective: collectiveDialog,
          achievements: unlocked ? [unlocked] : []
        });
      }

          if (pathname === '/chat/history') {
            const limit = Number(searchParams.get('limit')) || 20;
            return jsonResponse({ history: chatService.getHistory(limit) });
          }

          if (pathname === '/chat/set-api-key' && method === 'POST') {
            const body = await readJsonBody<{ apiKey?: string }>(request);
            if (!body?.apiKey) {
              return badRequest('apiKey required');
            }
            await chatService.setApiKey(body.apiKey);
            return jsonResponse({ success: true });
          }

          return jsonResponse({ error: 'Not Found' }, 404);
        } catch (error) {
          console.error('Gateway error', error);
          return jsonResponse({ error: 'Internal Server Error' }, 500);
        }
      }
    })
  : null;

if (shouldStartGateway) {
  startMeshWatch(60000);
}

if (gatewayServer) {
  console.log(`[Toobix] Unified Service Gateway listening on http://localhost:${gatewayPort}`);
}

export { gatewayServer };












