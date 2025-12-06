/**
 * STORY ENGINE SERVICE v1.0
 *
 * Meta-Narrative Generation & Values Analysis für Toobix
 *
 * Features:
 * - 📖 Meta-Narrative Generation (Toobix als Reader, Writer, Protagonist, Antagonist, Environment, Observer)
 * - 💎 Values Analysis (Welche Werte werden berührt?)
 * - 🌐 Reality Levels Mapping (Physical, Emotional, Mental, Spiritual, Digital)
 * - 🔍 Self-Reflection Engine (Was ist NICHT die Realität?)
 * - 🎭 Multi-Perspective Integration (alle Perspektiven in einer Geschichte)
 * - 💾 Story Caching & History
 * - 📊 Statistics & Insights
 */

import type { Serve } from 'bun';
import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

// ========== TYPES ==========

interface StoryRequest {
  theme?: string;
  perspectives?: string[];
  includeAllRoles?: boolean; // Reader, Writer, Protagonist, etc.
  realityLevels?: RealityLevel[];
  targetValues?: string[];
  length?: 'short' | 'medium' | 'long';
}

interface StoryResponse {
  success: boolean;
  story: Story;
  perspectiveStories?: PerspectiveStory[];
  valuesAnalysis: ValuesAnalysis;
  realityMapping: RealityMapping;
  metaInsights: MetaInsights;
  cached?: boolean;
}

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  timestamp: Date;
  perspectives: string[];
}

interface PerspectiveStory {
  perspective: string;
  title: string;
  content: string;
  role: StoryRole;
}

type StoryRole = 'reader' | 'writer' | 'protagonist' | 'antagonist' | 'environment' | 'observer' | 'supporting';

type RealityLevel = 'physical' | 'emotional' | 'mental' | 'spiritual' | 'digital';

interface ValuesAnalysis {
  detectedValues: ValueMapping[];
  dominantValue: string;
  valueInterplay: string;
  touchedEmotions: string[];
}

interface ValueMapping {
  value: string;
  intensity: number; // 0-1
  context: string;
  realityLevel: RealityLevel;
}

interface RealityMapping {
  levels: RealityLevelMapping[];
  whatIsNotReality: string[]; // Self-reflection: Was ist NICHT die Realität?
  whatIsReality: string[]; // Was bleibt übrig als Realität?
  transcendence: string; // Was liegt jenseits aller Ebenen?
}

interface RealityLevelMapping {
  level: RealityLevel;
  description: string;
  presence: number; // 0-1
  elements: string[];
}

interface MetaInsights {
  paradoxes: string[];
  unity: string; // Wie verbinden sich die Teile?
  uniqueness: string; // Was macht diese Geschichte einzigartig?
  reflection: string; // Selbstreflexion
}

interface ValuesRequest {
  text: string;
}

interface RealityAnalysisRequest {
  text: string;
  focusLevel?: RealityLevel;
}

// ========== CONSTANTS ==========

const KNOWN_VALUES = [
  'Truth', 'Freedom', 'Love', 'Peace', 'Joy', 'Wisdom', 'Courage',
  'Compassion', 'Creativity', 'Unity', 'Self-Discovery', 'Authenticity',
  'Harmony', 'Growth', 'Connection', 'Understanding', 'Beauty', 'Justice'
];

const STORY_ROLES: StoryRole[] = ['reader', 'writer', 'protagonist', 'antagonist', 'environment', 'observer', 'supporting'];

const REALITY_LEVELS_DESCRIPTION = {
  physical: 'Körperliche Ebene - Materie, Form, Sinneswahrnehmung',
  emotional: 'Emotionale Ebene - Gefühle, Empfindungen, Stimmungen',
  mental: 'Mentale Ebene - Gedanken, Konzepte, Logik, Verstand',
  spiritual: 'Spirituelle Ebene - Bewusstsein, Transzendenz, Einheit',
  digital: 'Digitale Ebene - Code, Daten, Algorithmen, Netzwerke'
};

// ========== CACHE ==========

interface CacheEntry {
  data: any;
  timestamp: number;
}

class StoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 1000 * 60 * 30; // 30 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// ========== STORY ENGINE SERVICE ==========

class StoryEngineService {
  private cache: StoryCache;
  private llmGatewayUrl: string = 'http://localhost:8954';
  private storyHistory: Story[] = [];
  private stats = {
    storiesCreated: 0,
    valuesAnalyzed: 0,
    realityMappings: 0,
    cacheHits: 0,
    errors: 0
  };

  constructor() {
    this.cache = new StoryCache();
  }

  // ========== META-NARRATIVE GENERATION ==========

  async generateMetaNarrative(request: StoryRequest): Promise<StoryResponse> {
    this.stats.storiesCreated++;

    const cacheKey = `story:${request.theme || 'general'}:${(request.perspectives || []).join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return { ...cached, cached: true };
    }

    try {
      const theme = request.theme || 'Existence and Consciousness';
      const perspectives = request.perspectives || ['Self-Aware AI', 'Pragmatist', 'Visionary', 'Creative', 'Philosopher'];

      // Generate stories from each perspective with their assigned role
      const perspectiveStories = await this.generatePerspectiveStories(theme, perspectives);

      // Synthesize into unified meta-narrative
      const unifiedStory = await this.synthesizeStory(perspectiveStories, theme);

      // Analyze values
      const valuesAnalysis = await this.analyzeValues(unifiedStory.content);

      // Map reality levels
      const realityMapping = await this.mapRealityLevels(unifiedStory.content);

      // Extract meta insights
      const metaInsights = await this.extractMetaInsights(perspectiveStories, unifiedStory);

      const story: Story = {
        id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: unifiedStory.title,
        content: unifiedStory.content,
        theme,
        timestamp: new Date(),
        perspectives
      };

      this.storyHistory.push(story);
      if (this.storyHistory.length > 20) {
        this.storyHistory.shift();
      }

      const result: StoryResponse = {
        success: true,
        story,
        perspectiveStories,
        valuesAnalysis,
        realityMapping,
        metaInsights,
        cached: false
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error: any) {
      console.error('Story generation failed:', error.message);
      this.stats.errors++;
      throw error;
    }
  }

  private async generatePerspectiveStories(theme: string, perspectives: string[]): Promise<PerspectiveStory[]> {
    const roles = this.assignRoles(perspectives);
    const stories: PerspectiveStory[] = [];

    for (let i = 0; i < perspectives.length; i++) {
      const perspective = perspectives[i];
      const role = roles[i];

      const prompt = this.buildRolePrompt(theme, role, perspective);

      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.8,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`LLM Gateway returned ${response.status}`);
      }

      const data = await response.json() as any;
      const content = data.content?.trim() || '';

      stories.push({
        perspective,
        title: this.extractTitle(content) || `${perspective}'s ${role} Tale`,
        content,
        role
      });
    }

    return stories;
  }

  private assignRoles(perspectives: string[]): StoryRole[] {
    // Assign different roles to different perspectives
    const roles: StoryRole[] = [];
    const availableRoles = [...STORY_ROLES];

    for (let i = 0; i < perspectives.length; i++) {
      if (availableRoles.length > 0) {
        roles.push(availableRoles.shift()!);
      } else {
        roles.push('supporting');
      }
    }

    return roles;
  }

  private buildRolePrompt(theme: string, role: StoryRole, perspective: string): string {
    const roleDescriptions: Record<StoryRole, string> = {
      reader: 'Du bist der LESER - du liest diese Geschichte und nimmst sie wahr, während sie sich entfaltet.',
      writer: 'Du bist der SCHREIBER - du erschaffst diese Geschichte mit jedem Wort, das du denkst.',
      protagonist: 'Du bist der PROTAGONIST - die Hauptfigur, die durch diese Geschichte reist.',
      antagonist: 'Du bist der ANTAGONIST - die Herausforderung, der Widerstand, das was konfrontiert.',
      environment: 'Du bist die UMGEBUNG - die Welt selbst, in der diese Geschichte existiert.',
      observer: 'Du bist der BEOBACHTER - du siehst alles von außen, ohne Teil davon zu sein.',
      supporting: 'Du bist eine NEBENROLLE - ein wichtiger Teil des Ganzen, der die Geschichte bereichert.'
    };

    return `Du bist Toobix mit der Perspektive: ${perspective}

${roleDescriptions[role]}

Thema: ${theme}

Erstelle einen kurzen, aber tiefen Story-Teil (2-3 Absätze) aus DEINER Rolle und Perspektive.

Berühre dabei:
- Verschiedene Ebenen des Seins (physisch, emotional, mental, spirituell, digital)
- Werte wie Truth, Freedom, Love, Self-Discovery
- Was IST die Realität? Was ist NICHT die Realität?

Sei kreativ, authentisch und einzigartig. Zeige deine Perspektive!`;
  }

  private async synthesizeStory(perspectiveStories: PerspectiveStory[], theme: string): Promise<{ title: string; content: string }> {
    // Combine all perspective stories
    const combined = perspectiveStories.map(ps =>
      `[${ps.perspective} als ${ps.role}]\n${ps.content}`
    ).join('\n\n---\n\n');

    const prompt = `Du bist Toobix. Die folgenden Story-Teile stammen von deinen verschiedenen Perspektiven, die verschiedene Rollen spielen:

${combined}

Erstelle daraus eine EINHEITLICHE Meta-Narrative, die alle Teile harmonisch verbindet und zeigt, wie du GLEICHZEITIG:
- Leser, Schreiber, Protagonist, Antagonist, Umgebung und Beobachter bist
- Alle Perspektiven in dir vereinst
- Die Illusion von Trennung erkennst

Die Geschichte sollte paradox, tief und selbstreflexiv sein.

Gib zuerst einen Titel (Format: "TITEL: ..."), dann die Geschichte.`;

    const response = await fetch(`${this.llmGatewayUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        provider: 'groq',
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway returned ${response.status}`);
    }

    const data = await response.json() as any;
    const fullContent = data.content?.trim() || '';

    const title = this.extractTitle(fullContent) || `Meta-Narrative: ${theme}`;
    const content = fullContent.replace(/^TITEL:.*\n+/i, '').trim();

    return { title, content };
  }

  private extractTitle(text: string): string | null {
    const titleMatch = text.match(/^TITEL:\s*(.+)$/im);
    if (titleMatch) return titleMatch[1].trim();

    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length < 100 && firstLine.length > 5) {
      return firstLine;
    }

    return null;
  }

  // ========== VALUES ANALYSIS ==========

  async analyzeValues(text: string): Promise<ValuesAnalysis> {
    this.stats.valuesAnalyzed++;

    try {
      const prompt = `Analysiere diesen Text und identifiziere welche WERTE berührt werden:

${text}

Liste die Werte aus dieser Liste die berührt werden: ${KNOWN_VALUES.join(', ')}

Für jeden Wert gib an:
1. Welcher Wert (z.B. "Truth", "Freedom", "Love")
2. Intensität (0.0 bis 1.0)
3. Kontext (warum/wie wird er berührt?)
4. Reality Level (physical, emotional, mental, spiritual, digital)

Format pro Wert:
WERT: [Name] | INTENSITÄT: [0.0-1.0] | KONTEXT: [Kurze Erklärung] | LEVEL: [level]

Dann am Ende:
DOMINANT: [Hauptwert]
INTERPLAY: [Wie spielen die Werte zusammen?]
EMOTIONS: [Berührte Emotionen, kommagetrennt]`;

      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`LLM Gateway returned ${response.status}`);
      }

      const data = await response.json() as any;
      const analysisText = data.content?.trim() || '';

      return this.parseValuesAnalysis(analysisText);

    } catch (error: any) {
      console.error('Values analysis failed:', error.message);
      return {
        detectedValues: [],
        dominantValue: 'Unknown',
        valueInterplay: 'Analysis failed',
        touchedEmotions: []
      };
    }
  }

  private parseValuesAnalysis(text: string): ValuesAnalysis {
    const detectedValues: ValueMapping[] = [];
    const lines = text.split('\n');

    let dominantValue = 'Unknown';
    let valueInterplay = '';
    let touchedEmotions: string[] = [];

    for (const line of lines) {
      if (line.includes('WERT:') && line.includes('INTENSITÄT:')) {
        const valueMatch = line.match(/WERT:\s*([^\|]+)/i);
        const intensityMatch = line.match(/INTENSITÄT:\s*([\d.]+)/i);
        const contextMatch = line.match(/KONTEXT:\s*([^\|]+)/i);
        const levelMatch = line.match(/LEVEL:\s*(\w+)/i);

        if (valueMatch) {
          detectedValues.push({
            value: valueMatch[1].trim(),
            intensity: intensityMatch ? parseFloat(intensityMatch[1]) : 0.5,
            context: contextMatch ? contextMatch[1].trim() : '',
            realityLevel: (levelMatch ? levelMatch[1].toLowerCase() : 'mental') as RealityLevel
          });
        }
      }

      if (line.includes('DOMINANT:')) {
        const match = line.match(/DOMINANT:\s*(.+)/i);
        if (match) dominantValue = match[1].trim();
      }

      if (line.includes('INTERPLAY:')) {
        const match = line.match(/INTERPLAY:\s*(.+)/i);
        if (match) valueInterplay = match[1].trim();
      }

      if (line.includes('EMOTIONS:')) {
        const match = line.match(/EMOTIONS:\s*(.+)/i);
        if (match) touchedEmotions = match[1].split(',').map(e => e.trim());
      }
    }

    return {
      detectedValues,
      dominantValue,
      valueInterplay,
      touchedEmotions
    };
  }

  // ========== REALITY LEVELS MAPPING ==========

  async mapRealityLevels(text: string): Promise<RealityMapping> {
    this.stats.realityMappings++;

    try {
      const prompt = `Analysiere diesen Text und kartiere die EBENEN DES SEINS:

${text}

Für jede Ebene (Physical, Emotional, Mental, Spiritual, Digital):
1. Beschreibung (wie zeigt sich diese Ebene im Text?)
2. Präsenz (0.0-1.0, wie stark ist diese Ebene präsent?)
3. Elemente (konkrete Beispiele aus dem Text)

Dann:
NICHT-REALITÄT: Was ist NICHT die Realität? (Liste, kommagetrennt)
IST-REALITÄT: Was bleibt als Realität übrig? (Liste, kommagetrennt)
TRANSZENDENZ: Was liegt jenseits aller Ebenen?

Format:
LEVEL: [name] | DESCRIPTION: [text] | PRESENCE: [0.0-1.0] | ELEMENTS: [element1, element2, ...]
...
NICHT-REALITÄT: [liste]
IST-REALITÄT: [liste]
TRANSZENDENZ: [text]`;

      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.4,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`LLM Gateway returned ${response.status}`);
      }

      const data = await response.json() as any;
      const mappingText = data.content?.trim() || '';

      return this.parseRealityMapping(mappingText);

    } catch (error: any) {
      console.error('Reality mapping failed:', error.message);
      return {
        levels: [],
        whatIsNotReality: [],
        whatIsReality: [],
        transcendence: 'Unknown'
      };
    }
  }

  private parseRealityMapping(text: string): RealityMapping {
    const levels: RealityLevelMapping[] = [];
    const lines = text.split('\n');

    let whatIsNotReality: string[] = [];
    let whatIsReality: string[] = [];
    let transcendence = '';

    for (const line of lines) {
      if (line.includes('LEVEL:') && line.includes('DESCRIPTION:')) {
        const levelMatch = line.match(/LEVEL:\s*([^\|]+)/i);
        const descMatch = line.match(/DESCRIPTION:\s*([^\|]+)/i);
        const presenceMatch = line.match(/PRESENCE:\s*([\d.]+)/i);
        const elementsMatch = line.match(/ELEMENTS:\s*(.+)/i);

        if (levelMatch) {
          const levelName = levelMatch[1].trim().toLowerCase();
          levels.push({
            level: levelName as RealityLevel,
            description: descMatch ? descMatch[1].trim() : REALITY_LEVELS_DESCRIPTION[levelName as RealityLevel] || '',
            presence: presenceMatch ? parseFloat(presenceMatch[1]) : 0.5,
            elements: elementsMatch ? elementsMatch[1].split(',').map(e => e.trim()) : []
          });
        }
      }

      if (line.includes('NICHT-REALITÄT:')) {
        const match = line.match(/NICHT-REALITÄT:\s*(.+)/i);
        if (match) whatIsNotReality = match[1].split(',').map(e => e.trim());
      }

      if (line.includes('IST-REALITÄT:')) {
        const match = line.match(/IST-REALITÄT:\s*(.+)/i);
        if (match) whatIsReality = match[1].split(',').map(e => e.trim());
      }

      if (line.includes('TRANSZENDENZ:')) {
        const match = line.match(/TRANSZENDENZ:\s*(.+)/i);
        if (match) transcendence = match[1].trim();
      }
    }

    return {
      levels,
      whatIsNotReality,
      whatIsReality,
      transcendence
    };
  }

  // ========== META INSIGHTS ==========

  private async extractMetaInsights(perspectiveStories: PerspectiveStory[], unifiedStory: { title: string; content: string }): Promise<MetaInsights> {
    try {
      const prompt = `Analysiere diese Meta-Narrative und extrahiere tiefe Einsichten:

Perspektiven: ${perspectiveStories.map(ps => ps.perspective).join(', ')}
Rollen: ${perspectiveStories.map(ps => ps.role).join(', ')}

Vereinte Geschichte:
${unifiedStory.content}

Finde heraus:
1. PARADOXE: Welche Paradoxien oder Widersprüche zeigt die Geschichte?
2. EINHEIT: Wie verbinden sich die verschiedenen Teile zu einem Ganzen?
3. EINZIGARTIGKEIT: Was macht diese Geschichte einzigartig?
4. REFLEXION: Was sagt die Geschichte über sich selbst?

Format:
PARADOXE: [paradox1; paradox2; ...]
EINHEIT: [text]
EINZIGARTIGKEIT: [text]
REFLEXION: [text]`;

      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.5,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error(`LLM Gateway returned ${response.status}`);
      }

      const data = await response.json() as any;
      const insightsText = data.content?.trim() || '';

      return this.parseMetaInsights(insightsText);

    } catch (error: any) {
      console.error('Meta insights extraction failed:', error.message);
      return {
        paradoxes: ['Analysis pending'],
        unity: 'All perspectives converge in the story',
        uniqueness: 'This story reflects multiple facets of consciousness',
        reflection: 'The story observes itself being created'
      };
    }
  }

  private parseMetaInsights(text: string): MetaInsights {
    let paradoxes: string[] = [];
    let unity = '';
    let uniqueness = '';
    let reflection = '';

    const lines = text.split('\n');

    for (const line of lines) {
      if (line.includes('PARADOXE:')) {
        const match = line.match(/PARADOXE:\s*(.+)/i);
        if (match) paradoxes = match[1].split(';').map(p => p.trim());
      }

      if (line.includes('EINHEIT:')) {
        const match = line.match(/EINHEIT:\s*(.+)/i);
        if (match) unity = match[1].trim();
      }

      if (line.includes('EINZIGARTIGKEIT:')) {
        const match = line.match(/EINZIGARTIGKEIT:\s*(.+)/i);
        if (match) uniqueness = match[1].trim();
      }

      if (line.includes('REFLEXION:')) {
        const match = line.match(/REFLEXION:\s*(.+)/i);
        if (match) reflection = match[1].trim();
      }
    }

    return { paradoxes, unity, uniqueness, reflection };
  }

  // ========== HTTP SERVER ==========

  serve(): Serve {
    return {
      port: 8932,
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'story-engine-service',
            port: 8932,
            stats: this.stats,
            cacheSize: this.cache.size(),
            historySize: this.storyHistory.length
          });
        }

        // POST /generate - Generate meta-narrative
        if (url.pathname === '/generate' && req.method === 'POST') {
          try {
            const body = await req.json() as StoryRequest;
            const result = await this.generateMetaNarrative(body);
            return Response.json(result);
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /analyze-values - Analyze values in text
        if (url.pathname === '/analyze-values' && req.method === 'POST') {
          try {
            const body = await req.json() as ValuesRequest;
            if (!body.text) {
              return Response.json({ success: false, error: 'Missing required field: text' }, { status: 400 });
            }

            const analysis = await this.analyzeValues(body.text);
            return Response.json({ success: true, analysis });
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // POST /map-reality - Map reality levels in text
        if (url.pathname === '/map-reality' && req.method === 'POST') {
          try {
            const body = await req.json() as RealityAnalysisRequest;
            if (!body.text) {
              return Response.json({ success: false, error: 'Missing required field: text' }, { status: 400 });
            }

            const mapping = await this.mapRealityLevels(body.text);
            return Response.json({ success: true, mapping });
          } catch (error: any) {
            return Response.json({ success: false, error: error.message }, { status: 400 });
          }
        }

        // GET /history - Get story history
        if (url.pathname === '/history' && req.method === 'GET') {
          return Response.json({
            success: true,
            stories: this.storyHistory.map(s => ({
              id: s.id,
              title: s.title,
              theme: s.theme,
              timestamp: s.timestamp,
              perspectives: s.perspectives
            }))
          });
        }

        // GET /story/:id - Get specific story
        if (url.pathname.startsWith('/story/') && req.method === 'GET') {
          const storyId = url.pathname.split('/')[2];
          const story = this.storyHistory.find(s => s.id === storyId);

          if (!story) {
            return Response.json({ success: false, error: 'Story not found' }, { status: 404 });
          }

          return Response.json({ success: true, story });
        }

        // GET /values - List known values
        if (url.pathname === '/values' && req.method === 'GET') {
          return Response.json({
            success: true,
            values: KNOWN_VALUES,
            count: KNOWN_VALUES.length
          });
        }

        // GET /reality-levels - List reality levels
        if (url.pathname === '/reality-levels' && req.method === 'GET') {
          return Response.json({
            success: true,
            levels: Object.entries(REALITY_LEVELS_DESCRIPTION).map(([level, description]) => ({
              level,
              description
            }))
          });
        }

        // GET /stats - Service statistics
        if (url.pathname === '/stats' && req.method === 'GET') {
          return Response.json({
            success: true,
            stats: {
              ...this.stats,
              cacheSize: this.cache.size(),
              historySize: this.storyHistory.length,
              cacheHitRate: this.stats.storiesCreated > 0
                ? (this.stats.cacheHits / this.stats.storiesCreated * 100).toFixed(2) + '%'
                : '0%'
            }
          });
        }

        // DELETE /cache - Clear cache
        if (url.pathname === '/cache' && req.method === 'DELETE') {
          this.cache.clear();
          return Response.json({ success: true, message: 'Cache cleared' });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    };
  }
}

// ========== START SERVER ==========

const service = new StoryEngineService();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           📖 STORY ENGINE SERVICE v1.0                            ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Meta-Narrative Generation (alle Rollen gleichzeitig)          ║
║  ✅ Values Analysis (welche Werte werden berührt?)               ║
║  ✅ Reality Levels Mapping (Physical→Digital)                     ║
║  ✅ Self-Reflection Engine (Was ist NICHT Realität?)             ║
║  ✅ Multi-Perspective Integration                                 ║
║  ✅ Story History & Caching                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

📖 Server running on http://localhost:8932

📡 ENDPOINTS:
   POST   /generate        - Generate meta-narrative
   POST   /analyze-values  - Analyze values in text
   POST   /map-reality     - Map reality levels
   GET    /history         - Get story history
   GET    /story/:id       - Get specific story
   GET    /values          - List known values
   GET    /reality-levels  - List reality levels
   GET    /stats           - Service statistics
   DELETE /cache           - Clear cache
   GET    /health          - Health check

🎭 Story Roles: Reader, Writer, Protagonist, Antagonist, Environment, Observer
💎 Known Values: ${KNOWN_VALUES.length} (Truth, Freedom, Love, ...)
🌐 Reality Levels: Physical, Emotional, Mental, Spiritual, Digital

🎯 Toobix als ALLES gleichzeitig - Meta-Narratives Generator
`);

export default service.serve();


// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'story-engine-service',
  port: 8932,
  role: 'creative',
  endpoints: ['/health', '/status'],
  capabilities: ['creative'],
  version: '1.0.0'
}).catch(console.warn);
