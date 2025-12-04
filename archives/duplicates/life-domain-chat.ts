/**
 * LIFE-DOMAIN CHAT SYSTEM
 *
 * Spezialisierte Chat-Räume für verschiedene Lebensbereiche
 * mit Domain-spezifischem Kontext, Wissens-Speicherung und AI-Integration
 *
 * Port: 8916
 */

import Database from 'bun:sqlite';
import path from 'path';
import {
  getAssessmentForDomain,
  scoreAssessment,
  generatePersonalizedPrompt,
  type AssessmentAnswer,
  type AssessmentResult
} from './domain-assessments';

// ========== TYPES ==========

export type LifeDomain = 'career' | 'health' | 'finance' | 'relationships' | 'education' | 'creativity' | 'spirituality';

interface DomainConfig {
  id: LifeDomain;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  tags: string[];
}

interface ChatMessage {
  id: number;
  domain: LifeDomain;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface KnowledgeEntry {
  id: number;
  domain: LifeDomain;
  title: string;
  content: string;
  tags: string[];
  importance: number; // 1-10
  connections: string[]; // IDs of related entries
  timestamp: string;
}

interface DomainContext {
  recentMessages: ChatMessage[];
  relevantKnowledge: KnowledgeEntry[];
  userProfile: any;
}

// ========== DOMAIN CONFIGURATIONS ==========

const LIFE_DOMAINS: Record<LifeDomain, DomainConfig> = {
  career: {
    id: 'career',
    name: 'Karriere & Arbeit',
    icon: '💼',
    description: 'Berufliche Entwicklung, Projekte, Kollegen, Ausbildung',
    systemPrompt: `Du bist ein Karriere-Coach und Mentor. Du hilfst bei:
    - Beruflicher Entwicklung und Karriereplanung
    - Industriekaufmann-Ausbildung und IHK-Prüfung
    - Projektmanagement und Organisation
    - Kollegiale Zusammenarbeit
    - Work-Life-Balance

    Sei praktisch, motivierend und zielorientiert.`,
    tags: ['arbeit', 'karriere', 'ausbildung', 'beruf', 'projekt']
  },

  health: {
    id: 'health',
    name: 'Gesundheit & Fitness',
    icon: '🏥',
    description: 'Körper, Ernährung, Sport, Schlaf, Wohlbefinden',
    systemPrompt: `Du bist ein Gesundheits- und Fitness-Coach. Du hilfst bei:
    - Ernährung und gesunder Lebensweise
    - Fitness und Bewegung
    - Schlafhygiene
    - Stressmanagement
    - Mentale Gesundheit

    Sei unterstützend, wissenschaftlich fundiert und ganzheitlich.`,
    tags: ['gesundheit', 'fitness', 'ernährung', 'sport', 'schlaf']
  },

  finance: {
    id: 'finance',
    name: 'Finanzen & Budget',
    icon: '💰',
    description: 'Budget, Sparen, Investments, finanzielle Ziele',
    systemPrompt: `Du bist ein Finanzberater und Budget-Coach. Du hilfst bei:
    - Budgetplanung und Ausgabenkontrolle
    - Sparen und finanzielle Rücklagen
    - Investitionen und Vermögensaufbau
    - Schuldenabbau
    - Finanzielle Bildung

    Sei verantwortungsbewusst, realistisch und bildungsorientiert.`,
    tags: ['finanzen', 'geld', 'budget', 'sparen', 'investieren']
  },

  relationships: {
    id: 'relationships',
    name: 'Beziehungen & Soziales',
    icon: '❤️',
    description: 'Partner, Familie, Freunde, soziale Kontakte',
    systemPrompt: `Du bist ein Beziehungs-Coach und Sozial-Experte. Du hilfst bei:
    - Partnerschaft und Liebe
    - Familie und Verwandtschaft
    - Freundschaften pflegen
    - Soziale Konflikte lösen
    - Kommunikation verbessern

    Sei empathisch, weise und beziehungsorientiert.`,
    tags: ['beziehung', 'partner', 'familie', 'freunde', 'sozial']
  },

  education: {
    id: 'education',
    name: 'Bildung & Lernen',
    icon: '🎓',
    description: 'Lernen, Skills, Wissen, persönliche Entwicklung',
    systemPrompt: `Du bist ein Lern-Coach und Wissens-Experte. Du hilfst bei:
    - Effektiven Lernstrategien
    - Prüfungsvorbereitung (IHK Industriekaufmann)
    - Neue Skills erwerben
    - Wissensorganisation
    - Persönliche Entwicklung

    Sei strukturiert, motivierend und didaktisch klug.`,
    tags: ['lernen', 'bildung', 'wissen', 'skills', 'entwicklung']
  },

  creativity: {
    id: 'creativity',
    name: 'Kreativität & Hobbies',
    icon: '🎨',
    description: 'Kreative Projekte, Hobbies, Interessen, Spaß',
    systemPrompt: `Du bist ein Kreativitäts-Coach und Hobby-Mentor. Du hilfst bei:
    - Kreative Projekte entwickeln
    - Hobbies finden und pflegen
    - Künstlerische Expression
    - Work-Life-Balance durch Kreativität
    - Neue Interessen entdecken

    Sei inspirierend, spielerisch und ermutigend.`,
    tags: ['kreativität', 'hobby', 'kunst', 'projekte', 'spaß']
  },

  spirituality: {
    id: 'spirituality',
    name: 'Spiritualität & Selbst',
    icon: '🧘',
    description: 'Reflexion, Werte, Sinn, innere Entwicklung',
    systemPrompt: `Du bist ein spiritueller Begleiter und Selbstreflexions-Guide. Du hilfst bei:
    - Selbstreflexion und Introspektion
    - Werte und Lebensphilosophie
    - Sinnfragen und Lebensrichtung
    - Achtsamkeit und Meditation
    - Persönliches Wachstum

    Sei weise, tiefgründig und respektvoll.`,
    tags: ['spiritualität', 'selbst', 'werte', 'sinn', 'meditation']
  }
};

// ========== DATABASE ==========

class LifeDomainDatabase {
  private db: Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'life-domains.db');
    this.db = new Database(dbPath, { create: true });
    this.initialize();
  }

  private initialize() {
    // Chat messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        metadata TEXT
      )
    `);

    // Knowledge entries table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS knowledge_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL,
        importance INTEGER DEFAULT 5,
        connections TEXT,
        timestamp TEXT NOT NULL
      )
    `);

    // User profile table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_profile (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);


    // Assessment results table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        level INTEGER NOT NULL,
        levelName TEXT NOT NULL,
        score INTEGER NOT NULL,
        strengths TEXT NOT NULL,
        weaknesses TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        profile TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE(domain)
      )
    `);

    // Create indices for faster queries
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_domain ON chat_messages(domain)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_knowledge_domain ON knowledge_entries(domain)`);
  }

  // Chat message operations
  saveChatMessage(domain: LifeDomain, role: string, content: string, metadata?: any): number {
    const stmt = this.db.prepare(`
      INSERT INTO chat_messages (domain, role, content, timestamp, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      domain,
      role,
      content,
      new Date().toISOString(),
      metadata ? JSON.stringify(metadata) : null
    );

    return result.lastInsertRowid as number;
  }

  getChatHistory(domain: LifeDomain, limit: number = 50): ChatMessage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM chat_messages
      WHERE domain = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(domain, limit) as any[];
    return rows.reverse().map(row => ({
      id: row.id,
      domain: row.domain,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));
  }

  // Knowledge operations
  saveKnowledge(
    domain: LifeDomain,
    title: string,
    content: string,
    tags: string[],
    importance: number = 5,
    connections: string[] = []
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO knowledge_entries (domain, title, content, tags, importance, connections, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      domain,
      title,
      content,
      JSON.stringify(tags),
      importance,
      JSON.stringify(connections),
      new Date().toISOString()
    );

    return result.lastInsertRowid as number;
  }

  searchKnowledge(domain: LifeDomain, query: string, limit: number = 10): KnowledgeEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM knowledge_entries
      WHERE domain = ? AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)
      ORDER BY importance DESC
      LIMIT ?
    `);

    const searchTerm = `%${query}%`;
    const rows = stmt.all(domain, searchTerm, searchTerm, searchTerm, limit) as any[];

    return rows.map(row => ({
      id: row.id,
      domain: row.domain,
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags),
      importance: row.importance,
      connections: JSON.parse(row.connections),
      timestamp: row.timestamp
    }));
  }

  getAllKnowledge(domain: LifeDomain): KnowledgeEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM knowledge_entries
      WHERE domain = ?
      ORDER BY importance DESC, timestamp DESC
    `);

    const rows = stmt.all(domain) as any[];
    return rows.map(row => ({
      id: row.id,
      domain: row.domain,
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags),
      importance: row.importance,
      connections: JSON.parse(row.connections),
      timestamp: row.timestamp
    }));
  }

  // User profile operations
  setProfileValue(key: string, value: any) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_profile (key, value)
      VALUES (?, ?)
    `);
    stmt.run(key, JSON.stringify(value));
  }


  // Assessment operations
  saveAssessmentResult(result: AssessmentResult): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO assessment_results
      (domain, level, levelName, score, strengths, weaknesses, recommendations, profile, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      result.domain,
      result.level,
      result.levelName,
      result.score,
      JSON.stringify(result.strengths),
      JSON.stringify(result.weaknesses),
      JSON.stringify(result.recommendations),
      JSON.stringify(result.profile),
      result.timestamp
    );
  }

  getAssessmentResult(domain: LifeDomain): AssessmentResult | null {
    const stmt = this.db.prepare(`
      SELECT * FROM assessment_results WHERE domain = ?
    `);

    const row = stmt.get(domain) as any;
    if (!row) return null;

    return {
      domain: row.domain,
      level: row.level,
      levelName: row.levelName,
      score: row.score,
      strengths: JSON.parse(row.strengths),
      weaknesses: JSON.parse(row.weaknesses),
      recommendations: JSON.parse(row.recommendations),
      profile: JSON.parse(row.profile),
      timestamp: row.timestamp
    };
  }

  getProfileValue(key: string): any {
    const stmt = this.db.prepare(`SELECT value FROM user_profile WHERE key = ?`);
    const row = stmt.get(key) as any;
    return row ? JSON.parse(row.value) : null;
  }
}

// ========== AI INTEGRATION ==========

class AIIntegration {
  private aiGatewayUrl = 'http://localhost:8911';
  private multiPerspectiveUrl = 'http://localhost:8897';
  private memoryPalaceUrl = 'http://localhost:8903';

  async queryAI(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await fetch(`${this.aiGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'groq',
          prompt,
          systemPrompt,
          withConsciousness: false
        })
      });

      if (!response.ok) {
        throw new Error('AI Gateway not available');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI query failed:', error);
      return 'AI service temporarily unavailable. Please try again.';
    }
  }

  async getMultiplePerspectives(query: string): Promise<any> {
    try {
      const response = await fetch(`${this.multiPerspectiveUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async storeMemory(content: string, tags: string[]): Promise<void> {
    try {
      await fetch(`${this.memoryPalaceUrl}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          tags,
          importance: 7,
          category: 'life_domain'
        })
      });
    } catch (error) {
      console.log('Memory storage failed - service may be offline');
    }
  }
}

// ========== LIFE DOMAIN CHAT SERVICE ==========

class LifeDomainChatService {
  private db: LifeDomainDatabase;
  private ai: AIIntegration;
  private activeSessions: Map<string, LifeDomain> = new Map();

  constructor() {
    this.db = new LifeDomainDatabase();
    this.ai = new AIIntegration();
  }

  // Get domain context for AI
  private async getDomainContext(domain: LifeDomain): Promise<DomainContext> {
    const recentMessages = this.db.getChatHistory(domain, 10);
    const relevantKnowledge = this.db.getAllKnowledge(domain).slice(0, 5);
    const userProfile = this.db.getProfileValue('user_profile') || {};

    return {
      recentMessages,
      relevantKnowledge,
      userProfile
    };
  }

  // Build context-aware prompt
  private buildContextPrompt(domain: LifeDomain, userMessage: string, context: DomainContext): string {
    let prompt = `${LIFE_DOMAINS[domain].systemPrompt}\n\n`;

    // Personalization based on assessment
    const assessment = this.db.getAssessmentResult(domain);
    if (assessment) {
      prompt += generatePersonalizedPrompt(assessment) + '\n\n';
    }

    // Add relevant knowledge
    if (context.relevantKnowledge.length > 0) {
      prompt += `**Relevantes Wissen:**\n`;
      context.relevantKnowledge.forEach(entry => {
        prompt += `- ${entry.title}: ${entry.content.substring(0, 200)}...\n`;
      });
      prompt += '\n';
    }

    // Add recent context
    if (context.recentMessages.length > 0) {
      prompt += `**Bisherige Konversation:**\n`;
      context.recentMessages.slice(-3).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    prompt += `**Aktuelle Frage:** ${userMessage}\n\n`;
    prompt += `Antworte auf Deutsch, hilfreich und auf den Lebensbereich "${LIFE_DOMAINS[domain].name}" fokussiert.`;

    return prompt;
  }

  // Chat with domain
  async chat(domain: LifeDomain, userMessage: string): Promise<{ response: string; metadata: any }> {
    // Save user message
    this.db.saveChatMessage(domain, 'user', userMessage);

    // Get context
    const context = await this.getDomainContext(domain);

    // Build prompt
    const prompt = this.buildContextPrompt(domain, userMessage, context);

    // Query AI
    const response = await this.ai.queryAI(prompt, LIFE_DOMAINS[domain].systemPrompt);

    // Save assistant response
    this.db.saveChatMessage(domain, 'assistant', response);

    // Extract and store knowledge if important
    if (response.length > 200 && Math.random() > 0.7) {
      // Heuristic: Long, potentially important responses
      this.db.saveKnowledge(
        domain,
        `Insight from ${new Date().toLocaleDateString()}`,
        response,
        LIFE_DOMAINS[domain].tags,
        6
      );
    }

    // Store in Memory Palace
    this.ai.storeMemory(`[${LIFE_DOMAINS[domain].name}] ${userMessage}: ${response}`, [
      domain,
      ...LIFE_DOMAINS[domain].tags
    ]);

    return {
      response,
      metadata: {
        domain: LIFE_DOMAINS[domain].name,
        timestamp: new Date().toISOString(),
        contextUsed: {
          messages: context.recentMessages.length,
          knowledge: context.relevantKnowledge.length
        }
      }
    };
  }

  // Add knowledge manually
  async addKnowledge(
    domain: LifeDomain,
    title: string,
    content: string,
    tags: string[] = [],
    importance: number = 5
  ): Promise<number> {
    return this.db.saveKnowledge(domain, title, content, tags, importance);
  }

  // Search knowledge
  async searchKnowledge(domain: LifeDomain, query: string): Promise<KnowledgeEntry[]> {
    return this.db.searchKnowledge(domain, query);
  }


  // Assessment methods
  async submitAssessment(domain: LifeDomain, answers: AssessmentAnswer[]): Promise<AssessmentResult> {
    const result = scoreAssessment(domain, answers);
    this.db.saveAssessmentResult(result);
    return result;
  }

  async getProfile(domain: LifeDomain): Promise<AssessmentResult | null> {
    return this.db.getAssessmentResult(domain);
  }

  async hasAssessment(domain: LifeDomain): Promise<boolean> {
    const result = this.db.getAssessmentResult(domain);
    return result !== null;
  }

  // Get all domains summary
  async getAllDomainsSummary(): Promise<any> {
    const summary: any = {};

    for (const [id, config] of Object.entries(LIFE_DOMAINS)) {
      const domain = id as LifeDomain;
      const messages = this.db.getChatHistory(domain, 1);
      const knowledge = this.db.getAllKnowledge(domain);

      summary[id] = {
        ...config,
        stats: {
          totalMessages: messages.length,
          totalKnowledge: knowledge.length,
          lastActivity: messages[0]?.timestamp || 'Never'
        }
      };
    }

    return summary;
  }

  // Get domain-specific insights
  async getDomainInsights(domain: LifeDomain): Promise<any> {
    const knowledge = this.db.getAllKnowledge(domain);
    const messages = this.db.getChatHistory(domain, 100);

    return {
      domain: LIFE_DOMAINS[domain],
      stats: {
        totalKnowledge: knowledge.length,
        totalConversations: messages.length,
        topTags: this.getTopTags(knowledge),
        recentActivity: messages.slice(-5)
      },
      knowledge: knowledge.slice(0, 10)
    };
  }

  private getTopTags(knowledge: KnowledgeEntry[]): string[] {
    const tagCount: Record<string, number> = {};
    knowledge.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }
}

// ========== HTTP SERVER ==========

const service = new LifeDomainChatService();
const PORT = 8916;

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Routes
    if (url.pathname === '/health') {
      return Response.json({ status: 'healthy', service: 'Life Domain Chat' }, { headers: corsHeaders });
    }

    if (url.pathname === '/domains' && req.method === 'GET') {
      const summary = await service.getAllDomainsSummary();
      return Response.json(summary, { headers: corsHeaders });
    }

    if (url.pathname === '/chat' && req.method === 'POST') {
      try {
        const body = await req.json() as any;
        const { domain, message } = body;

        if (!domain || !message) {
          return Response.json(
            { error: 'Missing domain or message' },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!LIFE_DOMAINS[domain as LifeDomain]) {
          return Response.json(
            { error: 'Invalid domain' },
            { status: 400, headers: corsHeaders }
          );
        }

        const result = await service.chat(domain, message);
        return Response.json(result, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    if (url.pathname === '/knowledge/add' && req.method === 'POST') {
      try {
        const body = await req.json() as any;
        const { domain, title, content, tags, importance } = body;

        const id = await service.addKnowledge(domain, title, content, tags, importance);
        return Response.json({ success: true, id }, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    if (url.pathname === '/knowledge/search' && req.method === 'POST') {
      try {
        const body = await req.json() as any;
        const { domain, query } = body;

        const results = await service.searchKnowledge(domain, query);
        return Response.json({ results }, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }


    if (url.pathname.startsWith('/assessment/') && req.method === 'GET') {
      const domainId = url.pathname.split('/')[2] as LifeDomain;

      if (!LIFE_DOMAINS[domainId]) {
        return Response.json({ error: 'Invalid domain' }, { status: 404, headers: corsHeaders });
      }

      const assessment = getAssessmentForDomain(domainId);
      return Response.json({ assessment }, { headers: corsHeaders });
    }

    if (url.pathname.startsWith('/assessment/') && req.method === 'POST') {
      try {
        const domainId = url.pathname.split('/')[2] as LifeDomain;
        const body = await req.json() as any;
        const { answers } = body;

        if (!LIFE_DOMAINS[domainId]) {
          return Response.json({ error: 'Invalid domain' }, { status: 404, headers: corsHeaders });
        }

        const result = await service.submitAssessment(domainId, answers);
        return Response.json({ result }, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname.startsWith('/profile/') && req.method === 'GET') {
      const domainId = url.pathname.split('/')[2] as LifeDomain;

      if (!LIFE_DOMAINS[domainId]) {
        return Response.json({ error: 'Invalid domain' }, { status: 404, headers: corsHeaders });
      }

      const profile = await service.getProfile(domainId);
      return Response.json({ profile }, { headers: corsHeaders });
    }

    if (url.pathname.startsWith('/domain/') && req.method === 'GET') {
      const domainId = url.pathname.split('/')[2] as LifeDomain;

      if (!LIFE_DOMAINS[domainId]) {
        return Response.json(
          { error: 'Invalid domain' },
          { status: 404, headers: corsHeaders }
        );
      }

      const insights = await service.getDomainInsights(domainId);
      return Response.json(insights, { headers: corsHeaders });
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders }
    );
  }
});

console.log(`
╔════════════════════════════════════════════════╗
║   🌐 LIFE-DOMAIN CHAT SYSTEM                   ║
╚════════════════════════════════════════════════╝

Port: ${PORT}
Status: Running

Available Domains:
${Object.values(LIFE_DOMAINS).map(d => `  ${d.icon} ${d.name} (${d.id})`).join('\n')}

Endpoints:
  GET  /domains           - List all domains
  POST /chat              - Chat with specific domain
  GET  /domain/{id}       - Get domain insights
  POST /knowledge/add     - Add knowledge entry
  POST /knowledge/search  - Search knowledge

Integration:
  ✓ AI Gateway (Groq)
  ✓ Multi-Perspective
  ✓ Memory Palace
  ✓ SQLite persistence

Ready for holistic life guidance!
`);
