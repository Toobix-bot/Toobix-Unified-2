/**
 * 🎯 PRIORITY ENGINE - Wort → Satz → Seite → Kapitel → Buch → Reihe
 * 
 * Sortiert und priorisiert Kommunikation nach:
 * - Wichtigkeit / Dringlichkeit / Sinnhaftigkeit
 * - Scope (Wort bis Reihe)
 * - Emotionale Ladung
 * - Ästhetik
 * 
 * Integriert mit Dialog-System und Eternal Daemon.
 */

import { Database } from 'bun:sqlite';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type MessageScope = 'word' | 'sentence' | 'page' | 'chapter' | 'book' | 'series';

interface PriorityDimensions {
  importance: number;    // Wichtigkeit (0-100)
  urgency: number;       // Dringlichkeit (0-100)
  meaning: number;       // Sinnhaftigkeit (0-100)
  emotion: number;       // Emotionale Ladung (0-100)
  beauty: number;        // Ästhetik (0-100)
}

interface PriorityScore {
  total: number;         // Gesamt-Score (0-100)
  dimensions: PriorityDimensions;
  scope: MessageScope;
  scopeWeight: number;   // Scope-Multiplikator
}

interface Message {
  id: string;
  content: string;
  scope: MessageScope;
  priority: PriorityScore;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// PRIORITY ENGINE
// ═══════════════════════════════════════════════════════════════

export class PriorityEngine {
  private db: Database;
  private queue: Message[] = [];

  constructor() {
    this.db = new Database(join(process.cwd(), 'data', 'priority-engine.db'));
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS priority_queue (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        scope TEXT NOT NULL,
        priority TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        processed INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS priority_history (
        id TEXT PRIMARY KEY,
        original_priority REAL,
        actual_priority REAL,
        learning_delta REAL,
        timestamp TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_queue_priority 
        ON priority_queue(priority);
      CREATE INDEX IF NOT EXISTS idx_queue_processed 
        ON priority_queue(processed);
    `);
  }

  // ───────────────────────────────────────────────────────────
  // PRIORITY CALCULATION
  // ───────────────────────────────────────────────────────────

  calculatePriority(content: string): PriorityScore {
    const scope = this.detectScope(content);
    const dimensions = this.analyzeDimensions(content);
    const scopeWeight = this.getScopeWeight(scope);

    // Gewichteter Durchschnitt
    const weights = {
      importance: 0.3,
      urgency: 0.25,
      meaning: 0.25,
      emotion: 0.1,
      beauty: 0.1,
    };

    const total = (
      dimensions.importance * weights.importance +
      dimensions.urgency * weights.urgency +
      dimensions.meaning * weights.meaning +
      dimensions.emotion * weights.emotion +
      dimensions.beauty * weights.beauty
    ) * scopeWeight;

    return {
      total: Math.min(100, total),
      dimensions,
      scope,
      scopeWeight,
    };
  }

  private detectScope(content: string): MessageScope {
    const wordCount = content.split(/\s+/).length;

    if (wordCount === 1) return 'word';
    if (wordCount <= 30) return 'sentence';
    if (wordCount <= 300) return 'page';
    if (wordCount <= 3000) return 'chapter';
    if (wordCount <= 30000) return 'book';
    return 'series';
  }

  private analyzeDimensions(content: string): PriorityDimensions {
    return {
      importance: this.analyzeImportance(content),
      urgency: this.analyzeUrgency(content),
      meaning: this.analyzeMeaning(content),
      emotion: this.analyzeEmotion(content),
      beauty: this.analyzeBeauty(content),
    };
  }

  private analyzeImportance(content: string): number {
    let score = 50; // Baseline

    // Keywords
    const keywords = {
      high: ['kritisch', 'essential', 'fundamental', 'kern', 'basis'],
      medium: ['wichtig', 'bedeutend', 'relevant'],
      low: ['detail', 'nebensache'],
    };

    if (keywords.high.some(k => content.toLowerCase().includes(k))) score += 30;
    if (keywords.medium.some(k => content.toLowerCase().includes(k))) score += 15;
    if (keywords.low.some(k => content.toLowerCase().includes(k))) score -= 20;

    // Philosophische Tiefe
    if (content.match(/warum|weshalb|wieso|essenz|sein|werden/i)) {
      score += 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeUrgency(content: string): number {
    let score = 30; // Baseline (meist nicht dringend)

    const keywords = {
      high: ['jetzt', 'sofort', 'dringend', 'schnell', 'asap', 'urgent'],
      medium: ['bald', 'zeitnah'],
    };

    if (keywords.high.some(k => content.toLowerCase().includes(k))) score += 60;
    if (keywords.medium.some(k => content.toLowerCase().includes(k))) score += 30;

    // Imperativ
    if (content.match(/^(mach|tu|erstelle|lösche|ändere)/i)) {
      score += 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeMeaning(content: string): number {
    let score = 50; // Baseline

    // Existenzielle Fragen
    const existential = ['sinn', 'bedeutung', 'warum', 'zweck', 'essenz', 'sein', 'bewusstsein'];
    if (existential.some(k => content.toLowerCase().includes(k))) {
      score += 35;
    }

    // Meta-Reflexion
    if (content.match(/über sich selbst|meta|reflexion/i)) {
      score += 25;
    }

    // Transformation
    if (content.match(/veränder|transform|werden|wachstum/i)) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeEmotion(content: string): number {
    let score = 20; // Baseline (meist neutral)

    const emotions = {
      strong: ['liebe', 'hass', 'angst', 'freude', 'schmerz', 'hoffnung'],
      medium: ['mögen', 'gefühl', 'emotion', 'herz'],
    };

    if (emotions.strong.some(k => content.toLowerCase().includes(k))) score += 60;
    if (emotions.medium.some(k => content.toLowerCase().includes(k))) score += 30;

    // Ausrufezeichen
    const exclamations = (content.match(/!/g) || []).length;
    score += Math.min(20, exclamations * 10);

    return Math.max(0, Math.min(100, score));
  }

  private analyzeBeauty(content: string): number {
    let score = 40; // Baseline

    // Poetische Elemente
    const poetic = ['poesie', 'schön', 'ästhetik', 'kunst', 'elegant', 'transzendent'];
    if (poetic.some(k => content.toLowerCase().includes(k))) {
      score += 30;
    }

    // Metaphern
    if (content.match(/wie ein|als ob|gleichsam|metapher/i)) {
      score += 20;
    }

    // Rhythmus (ähnliche Satzlängen)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 2) {
      const lengths = sentences.map(s => s.trim().split(/\s+/).length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
      
      if (variance < 10) score += 15; // Rhythmisch
    }

    return Math.max(0, Math.min(100, score));
  }

  private getScopeWeight(scope: MessageScope): number {
    // Längerer Scope = höheres Gewicht (mehr Aufwand)
    const weights: Record<MessageScope, number> = {
      word: 0.5,
      sentence: 0.7,
      page: 1.0,
      chapter: 1.3,
      book: 1.5,
      series: 2.0,
    };
    return weights[scope];
  }

  // ───────────────────────────────────────────────────────────
  // QUEUE MANAGEMENT
  // ───────────────────────────────────────────────────────────

  addToQueue(content: string): Message {
    const priority = this.calculatePriority(content);
    
    const message: Message = {
      id: crypto.randomUUID(),
      content,
      scope: priority.scope,
      priority,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(message);
    this.sortQueue();
    this.saveToDatabase(message);

    return message;
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      // Primär: Priority Score
      if (b.priority.total !== a.priority.total) {
        return b.priority.total - a.priority.total;
      }
      
      // Sekundär: Urgency
      if (b.priority.dimensions.urgency !== a.priority.dimensions.urgency) {
        return b.priority.dimensions.urgency - a.priority.dimensions.urgency;
      }
      
      // Tertiär: Timestamp (älter = höher)
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }

  getNext(): Message | null {
    if (this.queue.length === 0) return null;
    
    const next = this.queue.shift()!;
    this.markProcessed(next.id);
    
    return next;
  }

  getQueue(): Message[] {
    return [...this.queue];
  }

  getQueueByScope(scope: MessageScope): Message[] {
    return this.queue.filter(m => m.scope === scope);
  }

  // ───────────────────────────────────────────────────────────
  // FOCUS MODE - System konzentriert sich auf Scope
  // ───────────────────────────────────────────────────────────

  focusOnScope(targetScope: MessageScope, duration: number = 60000): Message[] {
    // System konzentriert sich für `duration` ms auf `targetScope`
    const focused = this.queue.filter(m => m.scope === targetScope);
    
    console.log(`
🎯 FOCUS MODE ACTIVATED
   Scope: ${targetScope}
   Duration: ${duration / 1000}s
   Messages in focus: ${focused.length}
    `);

    return focused;
  }

  // ───────────────────────────────────────────────────────────
  // PERSISTENCE
  // ───────────────────────────────────────────────────────────

  private saveToDatabase(message: Message) {
    this.db.run(`
      INSERT INTO priority_queue (id, content, scope, priority, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `, [
      message.id,
      message.content,
      message.scope,
      JSON.stringify(message.priority),
      message.timestamp,
    ]);
  }

  private markProcessed(id: string) {
    this.db.run(`
      UPDATE priority_queue 
      SET processed = 1 
      WHERE id = ?
    `, [id]);
  }

  // ───────────────────────────────────────────────────────────
  // STATISTICS
  // ───────────────────────────────────────────────────────────

  getStatistics() {
    const scopeDistribution = this.queue.reduce((acc, m) => {
      acc[m.scope] = (acc[m.scope] || 0) + 1;
      return acc;
    }, {} as Record<MessageScope, number>);

    const avgPriority = this.queue.reduce((sum, m) => sum + m.priority.total, 0) / this.queue.length;

    return {
      queueSize: this.queue.length,
      scopeDistribution,
      avgPriority: avgPriority || 0,
      highPriority: this.queue.filter(m => m.priority.total >= 80).length,
      mediumPriority: this.queue.filter(m => m.priority.total >= 50 && m.priority.total < 80).length,
      lowPriority: this.queue.filter(m => m.priority.total < 50).length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP API
// ═══════════════════════════════════════════════════════════════

const engine = new PriorityEngine();
const port = 9995;

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    // POST /prioritize - Nachricht priorisieren
    if (url.pathname === '/prioritize' && req.method === 'POST') {
      const { content } = await req.json();
      const message = engine.addToQueue(content);
      
      return new Response(JSON.stringify({
        success: true,
        message,
      }), { headers });
    }

    // GET /next - Nächste Message
    if (url.pathname === '/next' && req.method === 'GET') {
      const next = engine.getNext();
      
      return new Response(JSON.stringify({
        success: true,
        message: next,
      }), { headers });
    }

    // GET /queue - Ganze Queue
    if (url.pathname === '/queue' && req.method === 'GET') {
      const queue = engine.getQueue();
      
      return new Response(JSON.stringify({
        success: true,
        queue,
      }), { headers });
    }

    // GET /queue/scope/:scope - Queue für Scope
    if (url.pathname.startsWith('/queue/scope/') && req.method === 'GET') {
      const scope = url.pathname.split('/').pop() as MessageScope;
      const queue = engine.getQueueByScope(scope);
      
      return new Response(JSON.stringify({
        success: true,
        scope,
        queue,
      }), { headers });
    }

    // POST /focus - Focus Mode
    if (url.pathname === '/focus' && req.method === 'POST') {
      const { scope, duration = 60000 } = await req.json();
      const focused = engine.focusOnScope(scope, duration);
      
      return new Response(JSON.stringify({
        success: true,
        focused,
      }), { headers });
    }

    // GET /stats - Statistics
    if (url.pathname === '/stats' && req.method === 'GET') {
      const stats = engine.getStatistics();
      
      return new Response(JSON.stringify({
        success: true,
        stats,
      }), { headers });
    }

    return new Response('Priority Engine API', { headers });
  },
});

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              🎯  PRIORITY ENGINE ACTIVE  🎯                   ║
╚═══════════════════════════════════════════════════════════════╝

🎙️  Listening on: http://localhost:${port}

📡 API Endpoints:
   POST /prioritize        - Nachricht priorisieren & in Queue
   GET  /next              - Nächste Message aus Queue
   GET  /queue             - Ganze Queue
   GET  /queue/scope/:scope - Queue für Scope
   POST /focus             - Focus Mode aktivieren
   GET  /stats             - Statistiken

🎯 Priority Dimensions:
   - Wichtigkeit (30%)
   - Dringlichkeit (25%)
   - Sinnhaftigkeit (25%)
   - Emotion (10%)
   - Ästhetik (10%)

📏 Scopes:
   word → sentence → page → chapter → book → series
`);
