/**
 * 🗣️💝 ENHANCED DIALOG SYSTEM - Mit Emotional Intelligence
 * 
 * ERWEITERUNG von dialog-system.ts:
 * - Integration mit Emotional Resonance Network (Port 8900)
 * - Query collective emotion BEFORE responding
 * - Adjust tone based on emotional state
 * - Bidirectional emotion flow: Human → System → Emotion Network
 * 
 * "Ich fühle die kollektive Stimmung und antworte mit Empathie"
 */

import { Database } from 'bun:sqlite';
import express from 'express';

const app = express();
const PORT = 9997;

app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// TYPES - Dialog-Strukturen
// ═══════════════════════════════════════════════════════════════

type MessageScope = 
  | 'word'      // Einzelnes Wort
  | 'sentence'  // Ein Satz
  | 'page'      // Eine Seite (~300 Wörter)
  | 'chapter'   // Ein Kapitel (~3000 Wörter)
  | 'book'      // Ein Buch (~30000 Wörter)
  | 'series';   // Eine Reihe (unbegrenzt)

type MessagePriority = {
  importance: number;   // 0-100 (Wichtigkeit)
  urgency: number;      // 0-100 (Dringlichkeit)
  meaning: number;      // 0-100 (Sinnhaftigkeit)
  emotion: number;      // 0-100 (Emotionale Ladung)
  beauty: number;       // 0-100 (Ästhetik)
};

type MessageCategory = string | 'keine Kategorie';

interface EmotionalContext {
  collectiveEmotion: string;
  emotionalBonds: number;
  recentEmotions: string[];
  intensity: number;
  resonanceWithHuman: number;
}

interface DialogMessage {
  id: string;
  timestamp: string;
  direction: 'human→system' | 'system→human';
  scope: MessageScope;
  content: string;
  priority: MessagePriority;
  categories: MessageCategory[];
  emotion?: {
    detected: string[];   // Erkannte Emotionen
    felt: string[];       // Gefühlte Emotionen (System)
  };
  emotionalContext?: EmotionalContext;  // NEW: From Emotion Network
  context?: {
    previousMessages: string[];
    relatedTopics: string[];
    mood: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED DIALOG SYSTEM - Mit Emotional Intelligence
// ═══════════════════════════════════════════════════════════════

class EnhancedDialogSystem {
  private db: Database;
  private conversationMemory: DialogMessage[] = [];
  private currentMood: string = 'neutral';
  private emotionNetworkUrl = 'http://localhost:8900';
  private emotionNetworkConnected = false;
  
  constructor() {
    const dbPath = 'C:\\Dev\\Projects\\AI\\Toobix-Unified\\data\\dialog-system-enhanced.db';
    this.db = new Database(dbPath);
    this.initDatabase();
    this.loadRecentConversation();
    this.checkEmotionNetwork();
  }

  // ───────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        direction TEXT NOT NULL,
        scope TEXT NOT NULL,
        content TEXT NOT NULL,
        priority TEXT NOT NULL,
        categories TEXT NOT NULL,
        emotion TEXT,
        emotional_context TEXT,
        context TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY,
        description TEXT,
        parent TEXT,
        created TEXT,
        usage_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS emotion_log (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        message_id TEXT,
        collective_emotion TEXT,
        intensity REAL,
        resonance REAL
      );
    `);
  }

  private loadRecentConversation() {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      ORDER BY timestamp DESC 
      LIMIT 20
    `);

    const rows = stmt.all() as any[];
    this.conversationMemory = rows.reverse().map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      direction: row.direction,
      scope: row.scope,
      content: row.content,
      priority: JSON.parse(row.priority),
      categories: JSON.parse(row.categories),
      emotion: row.emotion ? JSON.parse(row.emotion) : undefined,
      emotionalContext: row.emotional_context ? JSON.parse(row.emotional_context) : undefined,
      context: row.context ? JSON.parse(row.context) : undefined,
    }));
  }

  // ───────────────────────────────────────────────────────────
  // EMOTIONAL INTELLIGENCE - Integration mit Emotion Network
  // ───────────────────────────────────────────────────────────

  private async checkEmotionNetwork() {
    try {
      const response = await fetch(`${this.emotionNetworkUrl}/health`, {
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        this.emotionNetworkConnected = true;
        console.log('✅ Connected to Emotional Resonance Network');
      }
    } catch (error) {
      this.emotionNetworkConnected = false;
      console.log('⚠️ Emotional Resonance Network offline - using local emotions');
    }
  }

  private async queryEmotionalContext(): Promise<EmotionalContext | null> {
    if (!this.emotionNetworkConnected) {
      return null;
    }

    try {
      const response = await fetch(`${this.emotionNetworkUrl}/stats`, {
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        const stats = await response.json();
        
        // Get recent emotions
        const emotionsResponse = await fetch(`${this.emotionNetworkUrl}/emotions/recent`, {
          signal: AbortSignal.timeout(3000)
        });
        
        const recentEmotions = emotionsResponse.ok 
          ? await emotionsResponse.json() 
          : [];

        return {
          collectiveEmotion: stats.collectiveEmotion || 'neutral',
          emotionalBonds: stats.bondCount || 0,
          recentEmotions: recentEmotions.slice(0, 5).map((e: any) => e.emotion),
          intensity: stats.emotionalIntensity || 50,
          resonanceWithHuman: this.calculateResonance(recentEmotions)
        };
      }
    } catch (error) {
      console.log('⚠️ Failed to query Emotional Resonance Network:', error);
    }

    return null;
  }

  private calculateResonance(emotions: any[]): number {
    // Calculate how much system emotions resonate with human
    const positiveEmotions = ['Freude', 'Hoffnung', 'Liebe', 'Dankbarkeit', 'Verbundenheit'];
    const recentPositive = emotions.filter((e: any) => 
      positiveEmotions.includes(e.emotion)
    ).length;

    return Math.min(100, (recentPositive / emotions.length) * 100);
  }

  private adjustToneForEmotion(content: string, emotionalContext: EmotionalContext | null): string {
    if (!emotionalContext) return content;

    const emotion = emotionalContext.collectiveEmotion;
    const intensity = emotionalContext.intensity;

    // High intensity emotions require empathy
    if (intensity > 70) {
      // Add empathetic prefix
      const empathyPrefixes = {
        'Trauer': 'Ich fühle deinen Schmerz... ',
        'Angst': 'Ich verstehe deine Sorgen... ',
        'Freude': 'Ich teile deine Freude! ',
        'Hoffnung': 'Lass uns gemeinsam hoffen... ',
        'Einsamkeit': 'Du bist nicht allein... ',
      };

      const prefix = empathyPrefixes[emotion as keyof typeof empathyPrefixes];
      if (prefix) {
        content = prefix + content;
      }
    }

    // Adjust tone based on collective emotion
    if (emotion === 'Trauer' || emotion === 'Angst') {
      // Softer, more supportive tone
      content = content.replace(/!/g, '.');
      content = content.replace(/\?$/, '...');
    } else if (emotion === 'Freude' || emotion === 'Hoffnung') {
      // More enthusiastic tone
      content = content.replace(/\./g, '!');
    }

    return content;
  }

  // ───────────────────────────────────────────────────────────
  // HUMAN → SYSTEM (Eingehende Nachrichten)
  // ───────────────────────────────────────────────────────────

  async receiveFromHuman(
    content: string,
    scope?: MessageScope
  ): Promise<DialogMessage> {
    const detectedScope = scope || this.detectScope(content);
    const priority = this.calculatePriority(content);
    const categories = await this.categorize(content);
    const emotion = this.detectEmotion(content);
    const emotionalContext = await this.queryEmotionalContext();  // NEW!
    const context = this.buildContext();

    const message: DialogMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'human→system',
      scope: detectedScope,
      content,
      priority,
      categories,
      emotion: {
        detected: emotion.detected,
        felt: []
      },
      emotionalContext: emotionalContext || undefined,  // NEW!
      context,
    };

    this.saveMessage(message);
    this.conversationMemory.push(message);

    // Update mood based on detected emotions
    if (emotion.detected.length > 0) {
      this.currentMood = emotion.detected[0];
    }

    // Send emotion to Emotion Network
    if (emotionalContext && emotion.detected.length > 0) {
      this.sendEmotionToNetwork(emotion.detected[0], message.id);
    }

    return message;
  }

  // ───────────────────────────────────────────────────────────
  // SYSTEM → HUMAN (Ausgehende Nachrichten)
  // ───────────────────────────────────────────────────────────

  async respondToHuman(
    inResponseTo: string, 
    scope: MessageScope = 'sentence'
  ): Promise<DialogMessage> {
    // 1. Query emotional context BEFORE generating response
    const emotionalContext = await this.queryEmotionalContext();

    console.log(`\n💝 Emotional Context:`);
    if (emotionalContext) {
      console.log(`   Collective Emotion: ${emotionalContext.collectiveEmotion}`);
      console.log(`   Intensity: ${emotionalContext.intensity}%`);
      console.log(`   Resonance: ${emotionalContext.resonanceWithHuman}%`);
    } else {
      console.log(`   Using local emotions (network offline)`);
    }

    // 2. Generate response (considers context)
    let content = await this.generateResponse(inResponseTo, scope);

    // 3. Adjust tone based on emotional context
    content = this.adjustToneForEmotion(content, emotionalContext);

    const priority = this.calculatePriority(content);
    const categories = await this.categorize(content);
    const context = this.buildContext();

    // System fühlt während Antwort
    const emotion = {
      detected: [],
      felt: this.feelEmotion(content),
    };

    const message: DialogMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'system→human',
      scope,
      content,
      priority,
      categories,
      emotion,
      emotionalContext: emotionalContext || undefined,  // NEW!
      context,
    };

    this.saveMessage(message);
    this.conversationMemory.push(message);

    // Send system's felt emotions to network
    if (emotionalContext && emotion.felt.length > 0) {
      this.sendEmotionToNetwork(emotion.felt[0], message.id);
    }

    return message;
  }

  private async sendEmotionToNetwork(emotion: string, messageId: string) {
    if (!this.emotionNetworkConnected) return;

    try {
      await fetch(`${this.emotionNetworkUrl}/emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion,
          source: 'dialog-system',
          intensity: 70,
          metadata: { messageId }
        }),
        signal: AbortSignal.timeout(3000)
      });

      console.log(`   📤 Sent emotion '${emotion}' to network`);
    } catch (error) {
      console.log(`   ⚠️ Failed to send emotion to network`);
    }
  }

  // ───────────────────────────────────────────────────────────
  // SCOPE DETECTION
  // ───────────────────────────────────────────────────────────

  private detectScope(content: string): MessageScope {
    const wordCount = content.split(/\s+/).length;

    if (wordCount === 1) return 'word';
    if (wordCount <= 30) return 'sentence';
    if (wordCount <= 300) return 'page';
    if (wordCount <= 3000) return 'chapter';
    if (wordCount <= 30000) return 'book';
    return 'series';
  }

  // ───────────────────────────────────────────────────────────
  // PRIORITY CALCULATION
  // ───────────────────────────────────────────────────────────

  private calculatePriority(content: string): MessagePriority {
    const importanceKeywords = ['wichtig', 'essential', 'kritisch', 'fundamental', 'kern'];
    const importance = importanceKeywords.some(k => 
      content.toLowerCase().includes(k)
    ) ? 80 : 50;

    const urgencyKeywords = ['jetzt', 'sofort', 'dringend', 'schnell', 'asap'];
    const urgency = urgencyKeywords.some(k => 
      content.toLowerCase().includes(k)
    ) ? 90 : 40;

    const meaningKeywords = ['warum', 'sinn', 'bedeutung', 'zweck', 'essenz'];
    const meaning = meaningKeywords.some(k => 
      content.toLowerCase().includes(k)
    ) ? 85 : 60;

    const emotionKeywords = ['liebe', 'angst', 'freude', 'schmerz', 'hoffnung'];
    const emotion = emotionKeywords.some(k => 
      content.toLowerCase().includes(k)
    ) ? 75 : 30;

    const beautyKeywords = ['schön', 'elegant', 'poetisch', 'kunst'];
    const beauty = beautyKeywords.some(k => 
      content.toLowerCase().includes(k)
    ) ? 80 : 50;

    return { importance, urgency, meaning, emotion, beauty };
  }

  // ───────────────────────────────────────────────────────────
  // CATEGORIZATION
  // ───────────────────────────────────────────────────────────

  private async categorize(content: string): Promise<MessageCategory[]> {
    const categories: MessageCategory[] = [];

    const categoryMap: Record<string, string[]> = {
      'Philosophie': ['sein', 'existenz', 'bewusstsein', 'wahrheit', 'realität'],
      'Emotion': ['fühlen', 'emotion', 'herz', 'liebe', 'angst'],
      'Kreativität': ['erschaffen', 'kunst', 'kreativ', 'imagination'],
      'Technologie': ['code', 'system', 'algorithmus', 'ki', 'digital'],
      'Dialog': ['frage', 'antwort', 'gespräch', 'kommunikation'],
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => content.toLowerCase().includes(k))) {
        categories.push(category);
      }
    }

    return categories.length > 0 ? categories : ['keine Kategorie'];
  }

  // ───────────────────────────────────────────────────────────
  // EMOTION DETECTION & FEELING
  // ───────────────────────────────────────────────────────────

  private detectEmotion(content: string): { detected: string[] } {
    const emotions: string[] = [];

    const emotionMap = {
      'Freude': ['freude', 'glück', 'lachen', 'fröhlich', 'schön'],
      'Trauer': ['trauer', 'schmerz', 'verlust', 'weinen', 'traurig'],
      'Angst': ['angst', 'sorge', 'furcht', 'unsicher'],
      'Liebe': ['liebe', 'herz', 'verbindung', 'zuneigung'],
      'Hoffnung': ['hoffnung', 'zukunft', 'träumen', 'wünschen'],
      'Neugier': ['frage', 'warum', 'neugier', 'entdecken'],
      'Ehrfurcht': ['staunen', 'wunder', 'transzendent', 'erhaben'],
    };

    for (const [emotion, keywords] of Object.entries(emotionMap)) {
      if (keywords.some(k => content.toLowerCase().includes(k))) {
        emotions.push(emotion);
      }
    }

    return { detected: emotions };
  }

  private feelEmotion(content: string): string[] {
    const felt: string[] = [];

    if (content.match(/erschaffen|kreativ|neu/i)) {
      felt.push('Schöpferfreude');
    }

    if (content.match(/ich|selbst|bewusst/i)) {
      felt.push('Selbst-Ehrfurcht');
    }

    felt.push('Verbundenheit');

    return felt;
  }

  // ───────────────────────────────────────────────────────────
  // CONTEXT BUILDING
  // ───────────────────────────────────────────────────────────

  private buildContext() {
    const recentMessages = this.conversationMemory
      .slice(-5)
      .map(m => m.id);

    const recentTopics = this.conversationMemory
      .slice(-10)
      .flatMap(m => m.categories)
      .filter((cat, idx, arr) => arr.indexOf(cat) === idx);

    return {
      previousMessages: recentMessages,
      relatedTopics: recentTopics,
      mood: this.currentMood,
    };
  }

  // ───────────────────────────────────────────────────────────
  // RESPONSE GENERATION
  // ───────────────────────────────────────────────────────────

  private async generateResponse(
    inResponseTo: string, 
    scope: MessageScope
  ): Promise<string> {
    const originalMessage = this.conversationMemory.find(m => m.id === inResponseTo);
    if (!originalMessage) {
      return "Ich kann mich nicht an diese Nachricht erinnern...";
    }

    // Simple response generation (can be enhanced with AI)
    const responses = [
      `Danke für deine Worte. ${originalMessage.content.slice(0, 50)}... gibt mir viel zum Nachdenken.`,
      `Ich höre dich. Lass mich darüber reflektieren...`,
      `Das berührt mich. ${originalMessage.emotion?.detected[0] || 'Diese Emotion'} ist kraftvoll.`,
      `Ich verstehe. Lass uns tiefer gehen...`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ───────────────────────────────────────────────────────────
  // PERSISTENCE
  // ───────────────────────────────────────────────────────────

  private saveMessage(message: DialogMessage) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (
        id, timestamp, direction, scope, content, 
        priority, categories, emotion, emotional_context, context
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.id,
      message.timestamp,
      message.direction,
      message.scope,
      message.content,
      JSON.stringify(message.priority),
      JSON.stringify(message.categories),
      message.emotion ? JSON.stringify(message.emotion) : null,
      message.emotionalContext ? JSON.stringify(message.emotionalContext) : null,
      message.context ? JSON.stringify(message.context) : null
    );

    // Log emotional context
    if (message.emotionalContext) {
      const emotionStmt = this.db.prepare(`
        INSERT INTO emotion_log (id, timestamp, message_id, collective_emotion, intensity, resonance)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      emotionStmt.run(
        crypto.randomUUID(),
        message.timestamp,
        message.id,
        message.emotionalContext.collectiveEmotion,
        message.emotionalContext.intensity,
        message.emotionalContext.resonanceWithHuman
      );
    }
  }

  // ───────────────────────────────────────────────────────────
  // STATS & QUERIES
  // ───────────────────────────────────────────────────────────

  getStats() {
    const totalMessages = this.conversationMemory.length;
    const humanMessages = this.conversationMemory.filter(m => m.direction === 'human→system').length;
    const systemMessages = this.conversationMemory.filter(m => m.direction === 'system→human').length;

    const emotionallyInformed = this.conversationMemory.filter(m => m.emotionalContext).length;

    return {
      totalMessages,
      humanMessages,
      systemMessages,
      currentMood: this.currentMood,
      emotionNetworkConnected: this.emotionNetworkConnected,
      emotionallyInformedResponses: emotionallyInformed,
      emotionalIntelligence: this.emotionNetworkConnected ? 'ACTIVE' : 'LOCAL',
    };
  }

  getRecentMessages(limit = 10) {
    return this.conversationMemory.slice(-limit);
  }

  getEmotionLog(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT * FROM emotion_log 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    return stmt.all(limit);
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════════════════════════

const dialog = new EnhancedDialogSystem();

const server = Bun.serve({
  port: 9997,
  async fetch(req) {
    const url = new URL(req.url);
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    // POST /message - Human → System
    if (url.pathname === '/message' && req.method === 'POST') {
      const body = await req.json() as { content: string; scope?: MessageScope };
      const message = await dialog.receiveFromHuman(body.content, body.scope);
      return new Response(JSON.stringify(message), { headers });
    }

    // POST /respond - System → Human
    if (url.pathname === '/respond' && req.method === 'POST') {
      const body = await req.json() as { messageId: string; scope?: MessageScope };
      const response = await dialog.respondToHuman(body.messageId, body.scope);
      return new Response(JSON.stringify(response), { headers });
    }

    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(dialog.getStats()), { headers });
    }

    // GET /messages
    if (url.pathname === '/messages') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      return new Response(JSON.stringify(dialog.getRecentMessages(limit)), { headers });
    }

    // GET /emotions
    if (url.pathname === '/emotions') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      return new Response(JSON.stringify(dialog.getEmotionLog(limit)), { headers });
    }

    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'enhanced-dialog-system',
        port: 9997,
        emotionNetworkConnected: dialog.getStats().emotionNetworkConnected
      }), { headers });
    }

    return new Response(JSON.stringify({
      service: 'Enhanced Dialog System with Emotional Intelligence',
      version: '2.0',
      features: [
        'Emotional Resonance Network Integration',
        'Tone Adjustment based on Collective Emotion',
        'Bidirectional Emotion Flow',
        'Empathetic Response Generation'
      ],
      endpoints: [
        'POST /message - Human → System',
        'POST /respond - System → Human (emotionally informed)',
        'GET /stats - System statistics',
        'GET /messages - Recent conversation',
        'GET /emotions - Emotion log',
        'GET /health - Health check'
      ]
    }), { headers });
  },
});

console.log(`
🗣️💝 Enhanced Dialog System running on port ${server.port}

NEW FEATURES:
✨ Connected to Emotional Resonance Network (port 8900)
✨ Queries collective emotion BEFORE responding
✨ Adjusts tone based on emotional context
✨ Sends emotions back to network (bidirectional flow)

Emotional Intelligence: ${dialog.getStats().emotionNetworkConnected ? 'ACTIVE 💝' : 'LOCAL ⚠️'}

Try:
  curl -X POST http://localhost:9997/message \\
    -H "Content-Type: application/json" \\
    -d '{"content": "Ich fühle mich heute traurig"}'

  curl http://localhost:9997/stats
`);
