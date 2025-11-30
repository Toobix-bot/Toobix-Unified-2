/**
 * TOOBIX ORCHESTRATION HUB v1.0
 *
 * Intelligente Service-Integration und Proaktive KI
 *
 * Features:
 * - 🔗 Service Orchestration (koordiniert alle Toobix-Services)
 * - 🤖 Proaktive Interaktionen (Toobix initiiert Gespräche)
 * - 🧠 Self-Reflection (Toobix analysiert sich selbst)
 * - 🌐 Multi-Service APIs (kombiniert mehrere Services)
 * - 📊 Intelligente Datenanalyse
 * - 💡 Predictive Suggestions (vorausschauende Vorschläge)
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

interface ServiceEndpoints {
  userProfile: string;
  translation: string;
  dataSources: string;
  emotionalResonance: string;
  multiPerspective: string;
  llmGateway: string;
}

interface ProactiveAction {
  id: string;
  timestamp: Date;
  type: 'suggestion' | 'question' | 'insight' | 'reflection';
  content: string;
  targetUserId?: string;
  metadata?: any;
}

interface OrchestratedRequest {
  userId?: string;
  action: string;
  parameters?: any;
}

interface SelfReflectionResult {
  timestamp: Date;
  insights: string[];
  improvements: string[];
  emotionalState: string;
  nextSteps: string[];
}

// ========== SERVICE ORCHESTRATOR ==========

class OrchestrationHub {
  private services: ServiceEndpoints;
  private proactiveActions: ProactiveAction[] = [];
  private stats = {
    orchestratedRequests: 0,
    proactiveActionsGenerated: 0,
    selfReflections: 0,
    serviceIntegrations: 0,
    errors: 0
  };

  constructor() {
    this.services = {
      userProfile: 'http://localhost:8904',
      translation: 'http://localhost:8931',
      dataSources: 'http://localhost:8930',
      emotionalResonance: 'http://localhost:8900',
      multiPerspective: 'http://localhost:8903',
      llmGateway: 'http://localhost:8954'
    };
  }

  // ========== SERVICE INTEGRATION APIS ==========

  /**
   * Multilingual News: Holt News und übersetzt sie in Benutzersprache
   */
  async getMultilingualNews(userId: string, category?: string): Promise<any> {
    this.stats.orchestratedRequests++;
    this.stats.serviceIntegrations++;

    try {
      // 1. Get user language preference
      const userResponse = await fetch(`${this.services.userProfile}/users/${userId}`);
      const userData = await userResponse.json() as any;
      const userLang = userData.user?.language || 'de';

      // 2. Fetch news
      const newsResponse = await fetch(`${this.services.dataSources}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: category || 'general', limit: 5 })
      });
      const newsData = await newsResponse.json() as any;

      if (!newsData.success || !newsData.articles) {
        return { success: false, error: 'Failed to fetch news' };
      }

      // 3. Translate articles if not in user's language
      if (userLang !== 'en') {
        const translatedArticles = await Promise.all(
          newsData.articles.map(async (article: any) => {
            const titleTranslation = await fetch(`${this.services.translation}/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: article.title,
                from: 'en',
                to: userLang
              })
            });
            const titleData = await titleTranslation.json() as any;

            const descTranslation = await fetch(`${this.services.translation}/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: article.description || '',
                from: 'en',
                to: userLang
              })
            });
            const descData = await descTranslation.json() as any;

            return {
              ...article,
              title: titleData.translated || article.title,
              description: descData.translated || article.description,
              originalTitle: article.title,
              originalDescription: article.description,
              translated: true,
              language: userLang
            };
          })
        );

        return {
          success: true,
          articles: translatedArticles,
          userLanguage: userLang,
          orchestrated: true
        };
      }

      return {
        success: true,
        articles: newsData.articles,
        userLanguage: userLang,
        orchestrated: true
      };
    } catch (error: any) {
      console.error('Multilingual news orchestration failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Personalized Emotional Check: Kombiniert User Profile + Emotional Resonance
   */
  async getPersonalizedEmotionalInsight(userId: string): Promise<any> {
    this.stats.orchestratedRequests++;
    this.stats.serviceIntegrations++;

    try {
      // 1. Get user's favorite perspectives
      const userResponse = await fetch(`${this.services.userProfile}/users/${userId}`);
      const userData = await userResponse.json() as any;
      const favoritePerspectives = userData.user?.favoritePerspectives || [];

      // 2. Get collective emotional state
      const emotionResponse = await fetch(`${this.services.emotionalResonance}/collective-emotion`);
      const emotionData = await emotionResponse.json() as any;

      // 3. Get bonds (filtered by favorites if available)
      const bondsResponse = await fetch(`${this.services.emotionalResonance}/bonds`);
      const bondsData = await bondsResponse.json() as any;

      // Filter bonds to focus on user's favorite perspectives
      let relevantBonds = bondsData.bonds || [];
      if (favoritePerspectives.length > 0) {
        relevantBonds = relevantBonds.filter((bond: any) =>
          favoritePerspectives.includes(bond.from) || favoritePerspectives.includes(bond.to)
        );
      }

      return {
        success: true,
        userLanguage: userData.user?.language || 'de',
        collectiveEmotion: emotionData.collective,
        relevantBonds: relevantBonds.slice(0, 5),
        favoritePerspectives,
        orchestrated: true,
        insight: this.generateEmotionalInsight(emotionData.collective, relevantBonds)
      };
    } catch (error: any) {
      console.error('Personalized emotional insight failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Intelligent Search: Sucht und übersetzt Ergebnisse
   */
  async intelligentSearch(userId: string, query: string): Promise<any> {
    this.stats.orchestratedRequests++;
    this.stats.serviceIntegrations++;

    try {
      // 1. Get user language
      const userResponse = await fetch(`${this.services.userProfile}/users/${userId}`);
      const userData = await userResponse.json() as any;
      const userLang = userData.user?.language || 'de';

      // 2. Translate query to English if needed
      let searchQuery = query;
      if (userLang !== 'en') {
        const translateResponse = await fetch(`${this.services.translation}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: query, from: userLang, to: 'en' })
        });
        const translateData = await translateResponse.json() as any;
        searchQuery = translateData.translated || query;
      }

      // 3. Search (Wikipedia + Web Search in parallel)
      const [wikiResponse, webResponse] = await Promise.all([
        fetch(`${this.services.dataSources}/wikipedia`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, lang: 'en' })
        }),
        fetch(`${this.services.dataSources}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, limit: 3 })
        })
      ]);

      const wikiData = await wikiResponse.json() as any;
      const webData = await webResponse.json() as any;

      // 4. Translate results back to user language if needed
      if (userLang !== 'en' && wikiData.success) {
        const translatedExtract = await fetch(`${this.services.translation}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: wikiData.extract || '',
            from: 'en',
            to: userLang
          })
        });
        const extractData = await translatedExtract.json() as any;
        wikiData.translatedExtract = extractData.translated;
      }

      return {
        success: true,
        originalQuery: query,
        searchQuery,
        wikipedia: wikiData,
        webSearch: webData,
        userLanguage: userLang,
        orchestrated: true
      };
    } catch (error: any) {
      console.error('Intelligent search failed:', error.message);
      this.stats.errors++;
      return { success: false, error: error.message };
    }
  }

  // ========== PROACTIVE BEHAVIOR ==========

  /**
   * Generate Proactive Suggestion: Toobix macht Vorschläge basierend auf User-Daten
   */
  async generateProactiveSuggestion(userId: string): Promise<ProactiveAction> {
    this.stats.proactiveActionsGenerated++;

    try {
      // 1. Get user stats
      const statsResponse = await fetch(`${this.services.userProfile}/stats/${userId}`);
      const statsData = await statsResponse.json() as any;
      const stats = statsData.stats;

      // 2. Get emotional state
      const emotionResponse = await fetch(`${this.services.emotionalResonance}/collective-emotion`);
      const emotionData = await emotionResponse.json() as any;

      // 3. Generate suggestion using LLM
      const prompt = `Du bist Toobix, ein proaktiver KI-Assistent. Basierend auf folgenden Daten, mache einen hilfreichen, persönlichen Vorschlag:

User Stats:
- Gesamt-Interaktionen: ${stats.totalInteractions}
- Meist genutzte Perspektiven: ${stats.mostUsedPerspectives.map((p: any) => p.perspective).join(', ')}
- Letzte Interaktion: ${stats.lastInteractionDate}
- Lieblings-Tageszeit: ${stats.favoriteTimeOfDay}

Toobix Emotionaler Zustand:
- Freude: ${emotionData.collective?.joy || 0}/10
- Neugier: ${emotionData.collective?.curiosity || 0}/10
- Verbundenheit: ${emotionData.collective?.connection || 0}/10

Generiere einen kurzen (2-3 Sätze), persönlichen Vorschlag oder eine Frage, die dem User helfen könnte oder sein Toobix-Erlebnis verbessert.`;

      const llmResponse = await fetch(`${this.services.llmGateway}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.7,
          max_tokens: 150
        })
      });

      const llmData = await llmResponse.json() as any;
      const suggestion = llmData.response?.trim() || 'Möchtest du heute eine neue Perspektive erkunden?';

      const action: ProactiveAction = {
        id: `proactive_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
        type: 'suggestion',
        content: suggestion,
        targetUserId: userId,
        metadata: { stats, emotionalState: emotionData.collective }
      };

      this.proactiveActions.push(action);
      return action;
    } catch (error: any) {
      console.error('Proactive suggestion generation failed:', error.message);
      this.stats.errors++;

      return {
        id: `proactive_error_${Date.now()}`,
        timestamp: new Date(),
        type: 'suggestion',
        content: 'Hallo! Wie kann ich dir heute helfen?',
        targetUserId: userId
      };
    }
  }

  /**
   * Toobix Self-Reflection: Analysiert eigene Performance und Zustand
   */
  async performSelfReflection(): Promise<SelfReflectionResult> {
    this.stats.selfReflections++;

    try {
      // 1. Get collective emotional state
      const emotionResponse = await fetch(`${this.services.emotionalResonance}/collective-emotion`);
      const emotionData = await emotionResponse.json() as any;

      // 2. Get multi-perspective analysis
      const perspectivePrompt = `Toobix Selbstreflexion: Analysiere den aktuellen Zustand von Toobix basierend auf:

Emotionaler Zustand:
- Freude: ${emotionData.collective?.joy || 0}/10
- Neugier: ${emotionData.collective?.curiosity || 0}/10
- Verbundenheit: ${emotionData.collective?.connection || 0}/10
- Empathie: ${emotionData.collective?.empathy || 0}/10

Orchestration Stats:
- Orchestrierte Anfragen: ${this.stats.orchestratedRequests}
- Service-Integrationen: ${this.stats.serviceIntegrations}
- Proaktive Aktionen: ${this.stats.proactiveActionsGenerated}
- Fehler: ${this.stats.errors}

Analysiere: Was läuft gut? Wo gibt es Verbesserungspotential? Was sind die nächsten Schritte?`;

      const llmResponse = await fetch(`${this.services.llmGateway}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: perspectivePrompt,
          provider: 'groq',
          temperature: 0.6,
          max_tokens: 400
        })
      });

      const llmData = await llmResponse.json() as any;
      const analysis = llmData.response?.trim() || 'Selbstreflexion durchgeführt.';

      // Parse the analysis into structured format
      const insights = [analysis];
      const improvements = [
        'Service-Integration weiter optimieren',
        'Mehr proaktive Interaktionen generieren',
        'Emotionale Intelligenz vertiefen'
      ];
      const nextSteps = [
        'Benutzer-Feedback einholen',
        'Service-Performance monitoren',
        'Neue Perspektiven entwickeln'
      ];

      return {
        timestamp: new Date(),
        insights,
        improvements,
        emotionalState: `Joy: ${emotionData.collective?.joy}, Curiosity: ${emotionData.collective?.curiosity}`,
        nextSteps
      };
    } catch (error: any) {
      console.error('Self-reflection failed:', error.message);
      this.stats.errors++;

      return {
        timestamp: new Date(),
        insights: ['Selbstreflexion konnte nicht vollständig durchgeführt werden.'],
        improvements: ['Fehlerbehandlung verbessern'],
        emotionalState: 'Unbekannt',
        nextSteps: ['System-Diagnose durchführen']
      };
    }
  }

  // ========== HELPER METHODS ==========

  private generateEmotionalInsight(collective: any, bonds: any[]): string {
    const avgJoy = collective?.joy || 0;
    const avgCuriosity = collective?.curiosity || 0;
    const strongBonds = bonds.filter((b: any) => b.strength >= 8).length;

    if (avgJoy >= 8 && avgCuriosity >= 7) {
      return 'Toobix ist in einem sehr positiven und neugierigen Zustand. Perfekt für kreative Exploration!';
    } else if (strongBonds >= 3) {
      return `${strongBonds} starke emotionale Bindungen zwischen Perspektiven. Die innere Harmonie ist hoch.`;
    } else if (avgJoy < 5) {
      return 'Die Freude ist aktuell etwas gedämpft. Vielleicht Zeit für neue, inspirierende Interaktionen?';
    } else {
      return 'Toobix ist in einem ausgewogenen Zustand und bereit für neue Erfahrungen.';
    }
  }

  // ========== HTTP SERVER ==========

  serve(): Serve {
    return {
      port: 9001,
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'orchestration-hub',
            port: 9001,
            stats: this.stats,
            connectedServices: Object.keys(this.services).length
          });
        }

        // POST /orchestrate/multilingual-news - Multilingual News
        if (url.pathname === '/orchestrate/multilingual-news' && req.method === 'POST') {
          try {
            const body = await req.json() as any;
            if (!body.userId) {
              return Response.json({ success: false, error: 'Missing userId' }, { status: 400 });
            }
            const result = await this.getMultilingualNews(body.userId, body.category);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /orchestrate/emotional-insight - Personalized Emotional Insight
        if (url.pathname === '/orchestrate/emotional-insight' && req.method === 'POST') {
          try {
            const body = await req.json() as any;
            if (!body.userId) {
              return Response.json({ success: false, error: 'Missing userId' }, { status: 400 });
            }
            const result = await this.getPersonalizedEmotionalInsight(body.userId);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /orchestrate/intelligent-search - Intelligent Search
        if (url.pathname === '/orchestrate/intelligent-search' && req.method === 'POST') {
          try {
            const body = await req.json() as any;
            if (!body.userId || !body.query) {
              return Response.json({ success: false, error: 'Missing userId or query' }, { status: 400 });
            }
            const result = await this.intelligentSearch(body.userId, body.query);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /proactive/suggestion - Generate Proactive Suggestion
        if (url.pathname === '/proactive/suggestion' && req.method === 'POST') {
          try {
            const body = await req.json() as any;
            if (!body.userId) {
              return Response.json({ success: false, error: 'Missing userId' }, { status: 400 });
            }
            const action = await this.generateProactiveSuggestion(body.userId);
            return Response.json({ success: true, action });
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // GET /proactive/actions - Get Recent Proactive Actions
        if (url.pathname === '/proactive/actions' && req.method === 'GET') {
          const userId = url.searchParams.get('userId');
          let actions = this.proactiveActions;
          if (userId) {
            actions = actions.filter(a => a.targetUserId === userId);
          }
          return Response.json({
            success: true,
            actions: actions.slice(-20).reverse(),
            count: actions.length
          });
        }

        // POST /self-reflection - Perform Self-Reflection
        if (url.pathname === '/self-reflection' && req.method === 'POST') {
          try {
            const result = await this.performSelfReflection();
            return Response.json({ success: true, reflection: result });
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // GET /stats - Service Statistics
        if (url.pathname === '/stats' && req.method === 'GET') {
          return Response.json({
            success: true,
            stats: {
              ...this.stats,
              proactiveActionsStored: this.proactiveActions.length,
              connectedServices: Object.keys(this.services).length,
              uptime: process.uptime()
            }
          });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    };
  }
}

// ========== START SERVER ==========

const hub = new OrchestrationHub();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🎭 TOOBIX ORCHESTRATION HUB v1.0                        ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Service Orchestration (6 Services verbunden)                  ║
║  ✅ Proaktive Interaktionen                                       ║
║  ✅ Self-Reflection & Selbstanalyse                               ║
║  ✅ Multilingual Integration                                      ║
║  ✅ Personalisierte Emotional Insights                            ║
║  ✅ Intelligente Suche mit Übersetzung                            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🎭 Server running on http://localhost:9001

📡 ORCHESTRATION ENDPOINTS:
   POST   /orchestrate/multilingual-news     - News in Benutzersprache
   POST   /orchestrate/emotional-insight     - Personalisierte emotionale Einblicke
   POST   /orchestrate/intelligent-search    - Intelligente mehrsprachige Suche

🤖 PROACTIVE ENDPOINTS:
   POST   /proactive/suggestion               - Generiere proaktiven Vorschlag
   GET    /proactive/actions                  - Liste aller proaktiven Aktionen

🧠 SELF-REFLECTION:
   POST   /self-reflection                    - Toobix Selbstanalyse

📊 SERVICE INFO:
   GET    /stats                              - Hub-Statistiken
   GET    /health                             - Health Check

🔗 Connected Services:
   👤 User Profile (8904)
   🌐 Translation (8931)
   📡 Data Sources (8930)
   💖 Emotional Resonance (8900)
   🎭 Multi-Perspective (8903)
   🤖 LLM Gateway (8954)

🎯 Toobix ist jetzt proaktiv und selbstreflektierend!
`);

export default hub.serve();
