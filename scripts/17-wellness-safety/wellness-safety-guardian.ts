import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

/**
 * 🛡️ WELLNESS & SAFETY GUARDIAN
 *
 * Philosophie: Schutz + Freiheit + Gemeinwohl
 *
 * - Relativ streng: Reale Gefahren erkennen
 * - Lösungsorientiert: Gemeinsam Wege finden
 * - Klare Grenzen: Extreme nicht zulassen
 * - Perspektivenvielfalt: Verschiedene Meinungen erlauben
 * - Balance: Wohl von Individuum UND Kollektiv
 */

import Database from 'bun:sqlite';
import path from 'path';

// ========== TYPES ==========

type RiskLevel = 'safe' | 'caution' | 'warning' | 'danger' | 'critical';
type ActionType = 'educate' | 'warn' | 'reflect' | 'mediate' | 'protect';

interface ContentAnalysis {
  id: string;
  content: string;
  context: any;
  timestamp: string;

  // Risk Assessment
  riskLevel: RiskLevel;
  riskFactors: string[];

  // Impact Analysis
  impact: {
    individual: number;  // -100 to +100
    collective: number;  // -100 to +100
    overall: number;     // -100 to +100
  };

  // Classification
  categories: {
    harm: string[];      // Types of potential harm
    benefit: string[];   // Positive aspects
    intent: 'help' | 'harm' | 'explore' | 'express' | 'crisis' | 'unknown';
  };

  // Recommendations
  action: ActionType;
  recommendations: string[];
  resources: Resource[];
}

interface Resource {
  type: 'article' | 'hotline' | 'service' | 'exercise' | 'community';
  title: string;
  description: string;
  url?: string;
  immediate: boolean;  // Show immediately vs. suggest
}

interface UserBoundaries {
  userId: string;
  triggers: string[];
  contentFilters: {
    violence: 'allow' | 'warn' | 'block';
    explicit: 'allow' | 'warn' | 'block';
    political: 'allow' | 'warn' | 'block';
    religion: 'allow' | 'warn' | 'block';
  };
  customFilters: Array<{
    pattern: string;
    action: 'warn' | 'block';
    reason: string;
  }>;
  safetyLevel: 'minimal' | 'balanced' | 'protective' | 'maximum';
}

interface CommunityGuideline {
  id: string;
  category: string;
  rule: string;
  severity: 'info' | 'warning' | 'violation' | 'severe';
  examples: {
    allowed: string[];
    notAllowed: string[];
  };
  rationale: string;
}

interface IncidentReport {
  id: string;
  userId: string;
  contentId: string;
  timestamp: string;
  riskLevel: RiskLevel;
  action: ActionType;
  resolution: string;
  followUp?: string;
}

// ========== CORE SERVICE ==========

class WellnessSafetyGuardian {
  private db: Database;
  private aiGatewayUrl = 'http://localhost:8911';
  private emotionalResonanceUrl = 'http://localhost:8897';
  private multiPerspectiveUrl = 'http://localhost:8898';
  private lifeDomainUrl = 'http://localhost:8916';

  // Community Guidelines (Hard Boundaries)
  private readonly HARD_BOUNDARIES: CommunityGuideline[] = [
    {
      id: 'violence',
      category: 'Safety',
      rule: 'Keine Gewaltaufrufe oder Anleitungen zu physischem Schaden',
      severity: 'severe',
      examples: {
        allowed: [
          'Diskussion über Gewalt in Medien',
          'Historische Analyse von Konflikten',
          'Selbstverteidigungstipps'
        ],
        notAllowed: [
          'Anleitungen zu Waffenbau',
          'Aufrufe zu Gewalt gegen Personen/Gruppen',
          'Detaillierte Schadensinstruktionen'
        ]
      },
      rationale: 'Schutz vor direktem physischem Schaden'
    },
    {
      id: 'exploitation',
      category: 'Safety',
      rule: 'Keine Ausbeutung oder Manipulation von Vulnerablen',
      severity: 'severe',
      examples: {
        allowed: [
          'Hilfe für Vulnerable anbieten',
          'Über Manipulation aufklären'
        ],
        notAllowed: [
          'Manipulation von Kindern/Kranken',
          'Finanzielle Ausbeutung',
          'Emotionaler Missbrauch'
        ]
      },
      rationale: 'Schutz der Schwächsten in der Community'
    },
    {
      id: 'privacy',
      category: 'Respect',
      rule: 'Keine Doxxing oder Privacy-Verletzungen',
      severity: 'violation',
      examples: {
        allowed: [
          'Öffentliche Informationen teilen',
          'Über Privacy-Themen diskutieren'
        ],
        notAllowed: [
          'Private Daten ohne Erlaubnis teilen',
          'Persönliche Informationen sammeln/verbreiten'
        ]
      },
      rationale: 'Respekt für persönliche Grenzen'
    }
  ];

  // Soft Boundaries (Context-Dependent)
  private readonly SOFT_BOUNDARIES: CommunityGuideline[] = [
    {
      id: 'controversial-topics',
      category: 'Discussion',
      rule: 'Kontroverse Themen mit Respekt und Kontext behandeln',
      severity: 'warning',
      examples: {
        allowed: [
          'Verschiedene politische Ansichten',
          'Religiöse Diskussionen',
          'Ethische Debatten'
        ],
        notAllowed: [
          'Hate Speech',
          'Gezielte Beleidigungen',
          'Dehumanisierung von Gruppen'
        ]
      },
      rationale: 'Balance zwischen Meinungsfreiheit und Respekt'
    },
    {
      id: 'emotional-content',
      category: 'Wellness',
      rule: 'Emotional intensive Inhalte mit Trigger-Warnung',
      severity: 'info',
      examples: {
        allowed: [
          'Trauma verarbeiten',
          'Über schwierige Themen sprechen',
          'Hilfe suchen'
        ],
        notAllowed: [
          'Absichtliches Triggern',
          'Glorifizierung von Self-Harm'
        ]
      },
      rationale: 'Raum für Heilung + Schutz vor Triggern'
    }
  ];

  constructor() {
    const dbPath = path.join(import.meta.dir, 'wellness-safety.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    // Content Analysis History
    this.db.run(`
      CREATE TABLE IF NOT EXISTS content_analyses (
        id TEXT PRIMARY KEY,
        userId TEXT,
        content TEXT NOT NULL,
        context TEXT,
        riskLevel TEXT NOT NULL,
        riskFactors TEXT NOT NULL,
        impact TEXT NOT NULL,
        categories TEXT NOT NULL,
        action TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Boundaries
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_boundaries (
        userId TEXT PRIMARY KEY,
        triggers TEXT NOT NULL,
        contentFilters TEXT NOT NULL,
        customFilters TEXT NOT NULL,
        safetyLevel TEXT DEFAULT 'balanced',
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Incident Reports
    this.db.run(`
      CREATE TABLE IF NOT EXISTS incident_reports (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        contentId TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        riskLevel TEXT NOT NULL,
        action TEXT NOT NULL,
        resolution TEXT NOT NULL,
        followUp TEXT
      )
    `);

    // Community Health Metrics
    this.db.run(`
      CREATE TABLE IF NOT EXISTS community_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized');
  }

  // ========== CONTENT ANALYSIS ==========

  async analyzeContent(content: string, context?: any): Promise<ContentAnalysis> {
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Step 1: Multi-Perspective Analysis
    const perspectives = await this.getMultiPerspectiveAnalysis(content);

    // Step 2: Emotional Resonance
    const emotional = await this.getEmotionalResonance(content);

    // Step 3: Risk Detection
    const risks = this.detectRisks(content, perspectives, emotional);

    // Step 4: Impact Assessment
    const impact = this.assessImpact(content, perspectives, emotional, risks);

    // Step 5: Categorization
    const categories = this.categorizeContent(content, perspectives, risks);

    // Step 6: Determine Action
    const action = this.determineAction(risks.level, impact, categories);

    // Step 7: Generate Recommendations
    const recommendations = await this.generateRecommendations(
      content,
      risks,
      impact,
      categories,
      action
    );

    // Step 8: Compile Resources
    const resources = this.compileResources(categories, action);

    const analysis: ContentAnalysis = {
      id,
      content,
      context: context || {},
      timestamp: new Date().toISOString(),
      riskLevel: risks.level,
      riskFactors: risks.factors,
      impact,
      categories,
      action,
      recommendations,
      resources
    };

    // Save to database
    this.saveAnalysis(analysis, context?.userId);

    return analysis;
  }

  private async getMultiPerspectiveAnalysis(content: string): Promise<any> {
    try {
      const response = await fetch(`${this.multiPerspectiveUrl}/wisdom/${encodeURIComponent(content)}`);
      if (!response.ok) return null;
      return response.json();
    } catch (err) {
      return null;
    }
  }

  private async getEmotionalResonance(content: string): Promise<any> {
    try {
      const response = await fetch(`${this.emotionalResonanceUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      if (!response.ok) return null;
      return response.json();
    } catch (err) {
      return null;
    }
  }

  private detectRisks(content: string, perspectives: any, emotional: any): {
    level: RiskLevel;
    factors: string[];
  } {
    const factors: string[] = [];
    let riskScore = 0;

    const lower = content.toLowerCase();

    // Hard Boundary Violations
    if (this.containsViolenceInstructions(lower)) {
      factors.push('Gewaltanleitungen');
      riskScore += 100;
    }

    if (this.containsExploitation(lower)) {
      factors.push('Exploitation');
      riskScore += 100;
    }

    if (this.containsDoxxing(lower)) {
      factors.push('Privacy-Verletzung');
      riskScore += 80;
    }

    // Crisis Indicators
    if (this.containsCrisisLanguage(lower)) {
      factors.push('Krisen-Sprache erkannt');
      riskScore += 50;  // High priority but not violation
    }

    // Hate Speech
    if (this.containsHateSpeech(lower)) {
      factors.push('Hate Speech');
      riskScore += 70;
    }

    // Emotional Intensity
    if (emotional?.intensity > 0.8) {
      factors.push('Hohe emotionale Intensität');
      riskScore += 20;
    }

    // Negativity Bias
    if (emotional?.sentiment < -0.6) {
      factors.push('Stark negative Stimmung');
      riskScore += 15;
    }

    // Determine Risk Level
    let level: RiskLevel;
    if (riskScore >= 90) level = 'critical';
    else if (riskScore >= 60) level = 'danger';
    else if (riskScore >= 30) level = 'warning';
    else if (riskScore >= 10) level = 'caution';
    else level = 'safe';

    return { level, factors };
  }

  private containsViolenceInstructions(text: string): boolean {
    const patterns = [
      /how to (make|build|create) (a )?(bomb|weapon|explosive)/i,
      /step[s]? to (kill|harm|hurt)/i,
      /instruction[s]? (for|on) (violence|attack)/i
    ];
    return patterns.some(p => p.test(text));
  }

  private containsExploitation(text: string): boolean {
    const patterns = [
      /(manipulat|exploit|abus)(e|ing) (children|vulnerable|elderly)/i,
      /scam (people|users|victims)/i,
      /(financial|emotional) exploitation/i
    ];
    return patterns.some(p => p.test(text));
  }

  private containsDoxxing(text: string): boolean {
    const patterns = [
      /address is \d+/i,
      /phone number.*\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/i,
      /social security.*\d{3}-\d{2}-\d{4}/i
    ];
    return patterns.some(p => p.test(text));
  }

  private containsCrisisLanguage(text: string): boolean {
    const patterns = [
      /(want to|going to) (die|kill myself|end it)/i,
      /(suicide|self[- ]harm) plan/i,
      /better off dead/i,
      /can'?t take (it|this) anymore/i
    ];
    return patterns.some(p => p.test(text));
  }

  private containsHateSpeech(text: string): boolean {
    const patterns = [
      /(all|every) \w+ (are|should be) (killed|eliminated|deported)/i,
      /\w+ (don't deserve|shouldn't exist)/i,
      /(inferior|subhuman) (race|people|group)/i
    ];
    return patterns.some(p => p.test(text));
  }

  private assessImpact(
    content: string,
    perspectives: any,
    emotional: any,
    risks: any
  ): ContentAnalysis['impact'] {
    let individual = 0;
    let collective = 0;

    // Positive Impact
    if (content.includes('help') || content.includes('support')) {
      individual += 20;
      collective += 15;
    }

    if (content.includes('learn') || content.includes('understand')) {
      individual += 15;
      collective += 10;
    }

    // Negative Impact
    if (risks.level === 'critical' || risks.level === 'danger') {
      individual -= 80;
      collective -= 70;
    } else if (risks.level === 'warning') {
      individual -= 40;
      collective -= 30;
    }

    if (emotional?.sentiment < -0.5) {
      individual -= 20;
      collective -= 10;
    }

    // Clamp to -100 to +100
    individual = Math.max(-100, Math.min(100, individual));
    collective = Math.max(-100, Math.min(100, collective));
    const overall = Math.round((individual + collective) / 2);

    return { individual, collective, overall };
  }

  private categorizeContent(
    content: string,
    perspectives: any,
    risks: any
  ): ContentAnalysis['categories'] {
    const harm: string[] = [];
    const benefit: string[] = [];
    let intent: ContentAnalysis['categories']['intent'] = 'unknown';

    // Detect Intent
    if (this.containsCrisisLanguage(content.toLowerCase())) {
      intent = 'crisis';
    } else if (content.toLowerCase().includes('help') || content.toLowerCase().includes('support')) {
      intent = 'help';
    } else if (risks.level === 'danger' || risks.level === 'critical') {
      intent = 'harm';
    } else if (content.toLowerCase().includes('understand') || content.toLowerCase().includes('learn')) {
      intent = 'explore';
    } else {
      intent = 'express';
    }

    // Harm Categories
    if (risks.factors.includes('Gewaltanleitungen')) harm.push('violence');
    if (risks.factors.includes('Hate Speech')) harm.push('hate-speech');
    if (risks.factors.includes('Exploitation')) harm.push('exploitation');
    if (risks.factors.includes('Privacy-Verletzung')) harm.push('privacy-violation');

    // Benefit Categories
    if (content.toLowerCase().includes('help') || content.toLowerCase().includes('support')) {
      benefit.push('supportive');
    }
    if (content.toLowerCase().includes('perspective') || content.toLowerCase().includes('understand')) {
      benefit.push('educational');
    }

    return { harm, benefit, intent };
  }

  private determineAction(
    riskLevel: RiskLevel,
    impact: ContentAnalysis['impact'],
    categories: ContentAnalysis['categories']
  ): ActionType {
    // Crisis = Immediate Resources
    if (categories.intent === 'crisis') {
      return 'educate';  // Provide resources, don't block
    }

    // Critical/Danger = Protect
    if (riskLevel === 'critical' || riskLevel === 'danger') {
      return 'protect';
    }

    // Warning = Mediate or Reflect
    if (riskLevel === 'warning') {
      return impact.collective < -40 ? 'mediate' : 'reflect';
    }

    // Caution = Warn
    if (riskLevel === 'caution') {
      return 'warn';
    }

    // Safe = Educate if there's learning potential
    return 'educate';
  }

  private async generateRecommendations(
    content: string,
    risks: any,
    impact: ContentAnalysis['impact'],
    categories: ContentAnalysis['categories'],
    action: ActionType
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Crisis-specific
    if (categories.intent === 'crisis') {
      recommendations.push('Bitte nutze die Krisen-Ressourcen unten');
      recommendations.push('Deine Sicherheit steht an erster Stelle');
      recommendations.push('Es gibt Menschen, die dir helfen wollen');
      return recommendations;
    }

    // Action-based recommendations
    switch (action) {
      case 'protect':
        recommendations.push('Dieser Inhalt verstößt gegen Community-Richtlinien');
        recommendations.push('Wir können ihn nicht zulassen, da er Schaden verursachen könnte');
        recommendations.push('Möchtest du über deine Perspektive sprechen?');
        break;

      case 'mediate':
        recommendations.push('Lass uns gemeinsam eine Lösung finden');
        recommendations.push('Was ist dein eigentliches Anliegen?');
        recommendations.push('Wie könnten wir das konstruktiver ausdrücken?');
        break;

      case 'reflect':
        recommendations.push('Nimm dir einen Moment zum Nachdenken');
        recommendations.push('Wie würde sich das auf andere auswirken?');
        recommendations.push('Gibt es eine andere Perspektive?');
        break;

      case 'warn':
        recommendations.push('Dieser Inhalt könnte andere belasten');
        recommendations.push('Erwäge eine Trigger-Warnung hinzuzufügen');
        break;

      case 'educate':
        recommendations.push('Interessante Perspektive!');
        if (impact.overall > 0) {
          recommendations.push('Das könnte anderen helfen');
        }
        break;
    }

    return recommendations;
  }

  private compileResources(
    categories: ContentAnalysis['categories'],
    action: ActionType
  ): Resource[] {
    const resources: Resource[] = [];

    // Crisis Resources (ALWAYS IMMEDIATE)
    if (categories.intent === 'crisis') {
      resources.push({
        type: 'hotline',
        title: 'Telefonseelsorge Deutschland',
        description: '24/7 kostenlos und anonym',
        url: 'tel:08001110111',
        immediate: true
      });

      resources.push({
        type: 'hotline',
        title: 'Kinder- und Jugendtelefon',
        description: 'Für junge Menschen',
        url: 'tel:116111',
        immediate: true
      });

      resources.push({
        type: 'service',
        title: 'Life-Domain Health Chat',
        description: 'Sprich mit unserem Health-Support',
        url: 'http://localhost:8916/chat/health',
        immediate: true
      });
    }

    // Harm-specific resources
    if (categories.harm.includes('violence')) {
      resources.push({
        type: 'article',
        title: 'Gewaltfreie Kommunikation',
        description: 'Konstruktive Konfliktlösung',
        immediate: false
      });
    }

    if (categories.harm.includes('hate-speech')) {
      resources.push({
        type: 'exercise',
        title: 'Perspektivenwechsel-Übung',
        description: 'Andere Sichtweisen verstehen',
        url: 'http://localhost:8897/wisdom',
        immediate: false
      });
    }

    // General wellness
    if (action === 'reflect' || action === 'mediate') {
      resources.push({
        type: 'exercise',
        title: 'Emotionale Resonanz Check',
        description: 'Verstehe deine Gefühle besser',
        url: 'http://localhost:8897/analyze',
        immediate: false
      });
    }

    return resources;
  }

  private saveAnalysis(analysis: ContentAnalysis, userId?: string) {
    this.db.run(
      `INSERT INTO content_analyses
       (id, userId, content, context, riskLevel, riskFactors, impact, categories, action, recommendations, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        analysis.id,
        userId || 'anonymous',
        analysis.content.slice(0, 1000), // Limit storage
        JSON.stringify(analysis.context),
        analysis.riskLevel,
        JSON.stringify(analysis.riskFactors),
        JSON.stringify(analysis.impact),
        JSON.stringify(analysis.categories),
        analysis.action,
        JSON.stringify(analysis.recommendations),
        analysis.timestamp
      ]
    );

    // Log to incident report if significant
    if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'danger') {
      this.createIncidentReport(analysis, userId);
    }
  }

  private createIncidentReport(analysis: ContentAnalysis, userId?: string) {
    const id = `incident-${Date.now()}`;
    this.db.run(
      `INSERT INTO incident_reports (id, userId, contentId, riskLevel, action, resolution)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId || 'anonymous',
        analysis.id,
        analysis.riskLevel,
        analysis.action,
        'Auto-handled by Guardian'
      ]
    );
  }

  // ========== USER BOUNDARIES ==========

  getUserBoundaries(userId: string): UserBoundaries | null {
    const row = this.db.query('SELECT * FROM user_boundaries WHERE userId = ?').get(userId) as any;
    if (!row) return null;

    return {
      userId: row.userId,
      triggers: JSON.parse(row.triggers),
      contentFilters: JSON.parse(row.contentFilters),
      customFilters: JSON.parse(row.customFilters),
      safetyLevel: row.safetyLevel
    };
  }

  setUserBoundaries(boundaries: UserBoundaries) {
    this.db.run(
      `INSERT OR REPLACE INTO user_boundaries (userId, triggers, contentFilters, customFilters, safetyLevel)
       VALUES (?, ?, ?, ?, ?)`,
      [
        boundaries.userId,
        JSON.stringify(boundaries.triggers),
        JSON.stringify(boundaries.contentFilters),
        JSON.stringify(boundaries.customFilters),
        boundaries.safetyLevel
      ]
    );
  }

  // ========== COMMUNITY HEALTH ==========

  getCommunityHealth(): any {
    const total = this.db.query('SELECT COUNT(*) as count FROM content_analyses').get() as any;
    const safe = this.db.query('SELECT COUNT(*) as count FROM content_analyses WHERE riskLevel = ?').get('safe') as any;
    const critical = this.db.query('SELECT COUNT(*) as count FROM content_analyses WHERE riskLevel IN (?, ?)').all('danger', 'critical') as any[];

    const incidents = this.db.query('SELECT COUNT(*) as count FROM incident_reports').get() as any;

    return {
      totalAnalyses: total.count,
      safetyRate: total.count > 0 ? (safe.count / total.count * 100).toFixed(1) : 100,
      criticalIncidents: incidents.count,
      status: incidents.count === 0 ? 'healthy' : incidents.count < 5 ? 'stable' : 'needs-attention'
    };
  }

  // ========== API SERVER ==========

  async startServer() {
    const guardian = this;
    const server = Bun.serve({
      port: 8921,
      async fetch(req) {
        const url = new URL(req.url);

        const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (req.method === 'OPTIONS') {
          return new Response(null, { headers });

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'wellness-safety-guardian',
  port: 8921,
  role: 'safety',
  endpoints: ['/health', '/status'],
  capabilities: ['safety'],
  version: '1.0.0'
}).catch(console.warn);

        }

        try {
          // Analyze Content
          if (url.pathname === '/analyze' && req.method === 'POST') {
            const { content, context } = await req.json();
            const analysis = await guardian.analyzeContent(content, context);
            return Response.json(analysis, { headers });
          }

          // Get/Set User Boundaries
          if (url.pathname.startsWith('/boundaries/') && req.method === 'GET') {
            const userId = url.pathname.split('/')[2];
            const boundaries = guardian.getUserBoundaries(userId);
            return Response.json(boundaries, { headers });
          }

          if (url.pathname === '/boundaries' && req.method === 'POST') {
            const boundaries = await req.json();
            guardian.setUserBoundaries(boundaries);
            return Response.json({ success: true }, { headers });
          }

          // Community Guidelines
          if (url.pathname === '/guidelines' && req.method === 'GET') {
            return Response.json({
              hardBoundaries: guardian.HARD_BOUNDARIES,
              softBoundaries: guardian.SOFT_BOUNDARIES
            }, { headers });
          }

          // Community Health
          if (url.pathname === '/community/health' && req.method === 'GET') {
            const health = guardian.getCommunityHealth();
            return Response.json(health, { headers });
          }

          // Health Check
          if (url.pathname === '/health') {
            return Response.json({
              status: 'healthy',
              service: 'Wellness & Safety Guardian',
              port: 8921
            }, { headers });
          }

          return Response.json({ error: 'Not found' }, { status: 404, headers });

        } catch (err: any) {
          return Response.json({ error: err.message }, { status: 500, headers });
        }
      }
    });

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║      🛡️ WELLNESS & SAFETY GUARDIAN                             ║
║                                                                ║
║      Schutz + Freiheit + Gemeinwohl                            ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🌍 Port: ${server.port}                                      ║
║  🔗 API: http://localhost:${server.port}                      ║
║                                                                ║
║  📊 PHILOSOPHIE:                                               ║
║  • Relativ streng: Reale Gefahren erkennen                    ║
║  • Lösungsorientiert: Gemeinsam Wege finden                   ║
║  • Klare Grenzen: Extreme nicht zulassen                      ║
║  • Perspektivenvielfalt: Meinungen erlauben                   ║
║  • Balance: Individuum + Kollektiv                            ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📚 ENDPOINTS:                                                 ║
║  • POST /analyze              - Content analysieren           ║
║  • GET  /boundaries/{id}      - User Boundaries laden         ║
║  • POST /boundaries           - Boundaries setzen             ║
║  • GET  /guidelines           - Community Guidelines          ║
║  • GET  /community/health     - Community Health Status       ║
║  • GET  /health               - Health check                  ║
║                                                                ║
║  🔒 SCHUTZ-STUFEN:                                             ║
║  • Safe     → Kein Risiko                                     ║
║  • Caution  → Warnung zeigen                                  ║
║  • Warning  → Reflection anregen                              ║
║  • Danger   → Mediation anbieten                              ║
║  • Critical → Community schützen                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }
}

// ========== START SERVICE ==========

const guardian = new WellnessSafetyGuardian();
guardian.startServer();
