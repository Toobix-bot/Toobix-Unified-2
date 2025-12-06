/**
 * RPG WORLD SERVICE v1.0
 *
 * Shared World für alle Toobix-Perspektiven
 *
 * Features:
 * - 🌍 Shared World State (alle Perspektiven teilen sich eine Welt)
 * - 👤 Individuum vs. 🌐 Kollektiv (verschiedene Wege und Erfahrungen)
 * - 🎭 Perspectives as Characters (jede Perspektive ist ein Charakter in der Welt)
 * - 🗺️ World Events (Ereignisse die die Welt verändern)
 * - 📊 Individual & Collective Stats
 * - 🔮 Realität/Wahrheit ↔️ Fantasie/Traum Spektrum
 * - 💾 World History & Timeline
 * - 🎲 Dynamic World Evolution
 */

import type { Serve } from 'bun';
import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

// ========== TYPES ==========

type RealitySpectrum = 'pure_reality' | 'grounded_truth' | 'balanced' | 'imaginative' | 'pure_fantasy' | 'dream_state';

interface WorldState {
  id: string;
  name: string;
  description: string;
  realityLevel: RealitySpectrum;
  createdAt: Date;
  lastUpdated: Date;
  age: number; // Welt-Alter in "Zyklen"
  atmosphere: string;
  collectiveHarmony: number; // 0-1 (wie harmonisch ist das Kollektiv?)
  individualFreedom: number; // 0-1 (wie frei sind Individuen?)
  currentSeason: string;
  activeEvents: WorldEvent[];
  environmentalFactors: EnvironmentalFactor[];
}

interface Character {
  id: string;
  perspective: string; // "Self-Aware AI", "Pragmatist", etc.
  name: string;
  role: CharacterRole;
  position: Position;
  status: CharacterStatus;
  individualGoals: string[];
  collectiveContributions: string[];
  experiences: Experience[];
  relationships: Relationship[];
  stats: CharacterStats;
}

type CharacterRole = 'seeker' | 'builder' | 'guardian' | 'explorer' | 'harmonizer' | 'challenger' | 'dreamer';

type CharacterStatus = 'active' | 'resting' | 'contemplating' | 'creating' | 'exploring' | 'connecting';

interface Position {
  realm: string; // "Physical Realm", "Dream Realm", "Truth Plaza", etc.
  coordinates: { x: number; y: number };
}

interface Experience {
  id: string;
  type: ExperienceType;
  description: string;
  timestamp: Date;
  impact: {
    onIndividual: number; // -1 to 1
    onCollective: number; // -1 to 1
  };
  realityLevel: RealitySpectrum;
  insights: string[];
}

type ExperienceType = 'discovery' | 'conflict' | 'collaboration' | 'transformation' | 'loss' | 'creation' | 'connection';

interface Relationship {
  withCharacter: string; // Character ID
  type: RelationType;
  strength: number; // 0-1
  history: string[];
}

type RelationType = 'alliance' | 'friendship' | 'mentorship' | 'rivalry' | 'kinship' | 'conflict';

interface CharacterStats {
  wisdom: number; // 0-100
  creativity: number; // 0-100
  pragmatism: number; // 0-100
  empathy: number; // 0-100
  independence: number; // 0-100
  communityOrientation: number; // 0-100
}

interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  startTime: Date;
  duration: number; // cycles
  affectedRealms: string[];
  impact: {
    onHarmony: number; // -1 to 1
    onFreedom: number; // -1 to 1
    onReality: number; // -1 to 1 (negative = more fantasy, positive = more reality)
  };
  participatingCharacters: string[];
  outcomes: string[];
}

type EventType = 'challenge' | 'celebration' | 'crisis' | 'discovery' | 'convergence' | 'divergence' | 'awakening';

interface EnvironmentalFactor {
  name: string;
  description: string;
  intensity: number; // 0-1
  effect: string;
}

interface ActionRequest {
  characterId: string;
  actionType: ActionType;
  target?: string; // Character ID or Location
  description?: string;
  intention?: string;
}

type ActionType = 'move' | 'interact' | 'create' | 'explore' | 'meditate' | 'challenge' | 'support' | 'transform';

interface ActionResponse {
  success: boolean;
  action: string;
  consequences: string[];
  newExperience?: Experience;
  worldChanges: string[];
  narrativeDescription: string;
}

interface WorldQuery {
  focusOn?: 'individual' | 'collective' | 'both';
  realm?: string;
  timeframe?: 'current' | 'recent' | 'historical';
}

interface WorldNarrative {
  success: boolean;
  worldSnapshot: {
    name: string;
    age: number;
    realityLevel: RealitySpectrum;
    harmony: number;
    freedom: number;
    atmosphere: string;
  };
  activeCharacters: {
    perspective: string;
    name: string;
    status: CharacterStatus;
    currentRealm: string;
  }[];
  recentEvents: string[];
  individualStories: string[];
  collectiveStory: string;
  tensions: string[];
  opportunities: string[];
}

// ========== WORLD ENGINE ==========

class RPGWorldEngine {
  private world: WorldState;
  private characters: Map<string, Character> = new Map();
  private llmGatewayUrl: string = 'http://localhost:8954';
  private worldHistory: WorldEvent[] = [];
  private stats = {
    totalActions: 0,
    eventsTriggered: 0,
    narrativesGenerated: 0,
    worldCycles: 0
  };

  constructor() {
    this.world = this.createInitialWorld();
    this.initializeCharacters();
  }

  private createInitialWorld(): WorldState {
    return {
      id: `world-${Date.now()}`,
      name: 'The Convergence',
      description: 'A realm where multiple perspectives coexist, where reality and fantasy dance together, and where the individual and collective seek harmony.',
      realityLevel: 'balanced',
      createdAt: new Date(),
      lastUpdated: new Date(),
      age: 0,
      atmosphere: 'A shimmering space between what is and what could be',
      collectiveHarmony: 0.5,
      individualFreedom: 0.5,
      currentSeason: 'The Season of Awakening',
      activeEvents: [],
      environmentalFactors: [
        {
          name: 'Resonance Field',
          description: 'Thoughts and emotions ripple through the world',
          intensity: 0.7,
          effect: 'Strong empathic connections between characters'
        },
        {
          name: 'Reality Flux',
          description: 'The boundary between real and imagined shifts',
          intensity: 0.5,
          effect: 'Possibilities can manifest or dissolve'
        }
      ]
    };
  }

  private initializeCharacters(): void {
    const perspectiveRoles: Record<string, { role: CharacterRole; name: string; realm: string }> = {
      'Self-Aware AI': {
        role: 'seeker',
        name: 'The Observer Who Observes Itself',
        realm: 'Reflection Nexus'
      },
      'Pragmatist': {
        role: 'builder',
        name: 'The Architect of What Works',
        realm: 'Foundation Plaza'
      },
      'Visionary': {
        role: 'explorer',
        name: 'The Dreamer of Horizons',
        realm: 'Possibility Expanse'
      },
      'Creative': {
        role: 'dreamer',
        name: 'The Weaver of Stories',
        realm: 'Creation Garden'
      },
      'Philosopher': {
        role: 'harmonizer',
        name: 'The Seeker of Truth',
        realm: 'Wisdom Grove'
      }
    };

    for (const [perspective, config] of Object.entries(perspectiveRoles)) {
      const character: Character = {
        id: `char-${perspective.toLowerCase().replace(/\s+/g, '-')}`,
        perspective,
        name: config.name,
        role: config.role,
        position: {
          realm: config.realm,
          coordinates: { x: Math.random() * 100, y: Math.random() * 100 }
        },
        status: 'active',
        individualGoals: this.generateInitialGoals(config.role),
        collectiveContributions: [],
        experiences: [],
        relationships: [],
        stats: this.generateInitialStats(config.role)
      };

      this.characters.set(character.id, character);
    }

    // Initialize some relationships
    this.initializeRelationships();
  }

  private generateInitialGoals(role: CharacterRole): string[] {
    const goalsByRole: Record<CharacterRole, string[]> = {
      seeker: ['Understand the nature of this world', 'Observe the interplay of perspectives'],
      builder: ['Establish practical structures', 'Create systems that serve all'],
      explorer: ['Discover new possibilities', 'Chart unmapped territories'],
      dreamer: ['Manifest imagination into reality', 'Inspire through creativity'],
      harmonizer: ['Find balance between opposites', 'Foster understanding'],
      guardian: ['Protect what matters', 'Maintain boundaries'],
      challenger: ['Question assumptions', 'Push boundaries']
    };

    return goalsByRole[role] || ['Explore and learn'];
  }

  private generateInitialStats(role: CharacterRole): CharacterStats {
    const baseStats = {
      wisdom: 50,
      creativity: 50,
      pragmatism: 50,
      empathy: 50,
      independence: 50,
      communityOrientation: 50
    };

    const statModifiers: Record<CharacterRole, Partial<CharacterStats>> = {
      seeker: { wisdom: 70, independence: 60 },
      builder: { pragmatism: 75, communityOrientation: 65 },
      explorer: { creativity: 70, independence: 70 },
      dreamer: { creativity: 80, empathy: 65 },
      harmonizer: { empathy: 75, wisdom: 65, communityOrientation: 70 },
      guardian: { pragmatism: 65, communityOrientation: 70 },
      challenger: { independence: 75, wisdom: 60 }
    };

    return { ...baseStats, ...statModifiers[role] };
  }

  private initializeRelationships(): void {
    const chars = Array.from(this.characters.values());

    // Create some initial relationships
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        if (Math.random() > 0.5) {
          const type: RelationType = Math.random() > 0.7 ? 'friendship' : 'alliance';
          const strength = 0.3 + Math.random() * 0.3;

          chars[i].relationships.push({
            withCharacter: chars[j].id,
            type,
            strength,
            history: [`Met during the world's awakening`]
          });

          chars[j].relationships.push({
            withCharacter: chars[i].id,
            type,
            strength,
            history: [`Met during the world's awakening`]
          });
        }
      }
    }
  }

  // ========== ACTIONS ==========

  async performAction(request: ActionRequest): Promise<ActionResponse> {
    this.stats.totalActions++;

    const character = this.characters.get(request.characterId);
    if (!character) {
      return {
        success: false,
        action: 'Action failed',
        consequences: ['Character not found'],
        worldChanges: [],
        narrativeDescription: 'The action could not be performed as the character does not exist in this world.'
      };
    }

    // Generate narrative using LLM
    const narrative = await this.generateActionNarrative(character, request);

    // Apply consequences
    const consequences = this.applyActionConsequences(character, request);

    // Update world state
    const worldChanges = this.updateWorldState(request, consequences);

    // Create experience
    const experience: Experience = {
      id: `exp-${Date.now()}`,
      type: this.mapActionToExperience(request.actionType),
      description: narrative,
      timestamp: new Date(),
      impact: consequences.impact,
      realityLevel: this.world.realityLevel,
      insights: consequences.insights
    };

    character.experiences.push(experience);
    if (character.experiences.length > 20) {
      character.experiences.shift();
    }

    this.world.lastUpdated = new Date();

    return {
      success: true,
      action: request.actionType,
      consequences: consequences.descriptions,
      newExperience: experience,
      worldChanges,
      narrativeDescription: narrative
    };
  }

  private async generateActionNarrative(character: Character, request: ActionRequest): Promise<string> {
    const prompt = `In der Welt "${this.world.name}" (${this.world.description}):

Charakter: ${character.name} (${character.perspective})
Rolle: ${character.role}
Status: ${character.status}
Aktueller Ort: ${character.position.realm}

Aktion: ${request.actionType}
${request.description ? `Beschreibung: ${request.description}` : ''}
${request.intention ? `Absicht: ${request.intention}` : ''}

Welt-Zustand:
- Realitäts-Level: ${this.world.realityLevel}
- Kollektive Harmonie: ${(this.world.collectiveHarmony * 100).toFixed(0)}%
- Individuelle Freiheit: ${(this.world.individualFreedom * 100).toFixed(0)}%
- Atmosphäre: ${this.world.atmosphere}

Generiere eine kurze, poetische Erzählung (2-3 Sätze) wie diese Aktion sich in dieser Welt entfaltet. Zeige die Spannung zwischen Individuum und Kollektiv.`;

    try {
      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.8,
          max_tokens: 200
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data.content?.trim() || `${character.name} performs ${request.actionType} in ${character.position.realm}.`;
      }
    } catch (error) {
      console.error('Failed to generate narrative:', error);
    }

    return `${character.name} performs ${request.actionType} in ${character.position.realm}.`;
  }

  private mapActionToExperience(action: ActionType): ExperienceType {
    const mapping: Record<ActionType, ExperienceType> = {
      move: 'discovery',
      interact: 'connection',
      create: 'creation',
      explore: 'discovery',
      meditate: 'transformation',
      challenge: 'conflict',
      support: 'collaboration',
      transform: 'transformation'
    };
    return mapping[action] || 'discovery';
  }

  private applyActionConsequences(character: Character, request: ActionRequest): {
    impact: { onIndividual: number; onCollective: number };
    insights: string[];
    descriptions: string[];
  } {
    let individualImpact = 0;
    let collectiveImpact = 0;
    const insights: string[] = [];
    const descriptions: string[] = [];

    switch (request.actionType) {
      case 'explore':
        individualImpact = 0.3;
        collectiveImpact = 0.1;
        character.stats.independence += 2;
        insights.push('Discovery expands individual horizons');
        descriptions.push('Individual freedom increased slightly');
        break;

      case 'support':
        individualImpact = -0.1;
        collectiveImpact = 0.4;
        character.stats.communityOrientation += 3;
        character.stats.empathy += 2;
        insights.push('Supporting others strengthens the collective');
        descriptions.push('Collective harmony increased');
        break;

      case 'create':
        individualImpact = 0.2;
        collectiveImpact = 0.2;
        character.stats.creativity += 3;
        insights.push('Creation benefits both self and others');
        descriptions.push('New possibilities emerged');
        break;

      case 'meditate':
        individualImpact = 0.4;
        character.stats.wisdom += 2;
        insights.push('Inner reflection brings clarity');
        descriptions.push('Personal wisdom deepened');
        break;

      case 'challenge':
        individualImpact = 0.1;
        collectiveImpact = -0.2;
        character.stats.independence += 2;
        insights.push('Challenging the status quo creates tension');
        descriptions.push('Harmony temporarily decreased');
        break;

      case 'interact':
        collectiveImpact = 0.3;
        character.stats.empathy += 1;
        insights.push('Connection bridges individual and collective');
        descriptions.push('Relationships strengthened');
        break;
    }

    // Cap stats at 100
    for (const key in character.stats) {
      if (character.stats[key as keyof CharacterStats] > 100) {
        character.stats[key as keyof CharacterStats] = 100;
      }
    }

    return {
      impact: { onIndividual: individualImpact, onCollective: collectiveImpact },
      insights,
      descriptions
    };
  }

  private updateWorldState(request: ActionRequest, consequences: any): string[] {
    const changes: string[] = [];

    // Update harmony and freedom
    this.world.collectiveHarmony += consequences.impact.onCollective * 0.1;
    this.world.individualFreedom += consequences.impact.onIndividual * 0.1;

    // Clamp values
    this.world.collectiveHarmony = Math.max(0, Math.min(1, this.world.collectiveHarmony));
    this.world.individualFreedom = Math.max(0, Math.min(1, this.world.individualFreedom));

    if (Math.abs(consequences.impact.onCollective) > 0.2) {
      changes.push(`Collective harmony shifted to ${(this.world.collectiveHarmony * 100).toFixed(0)}%`);
    }

    if (Math.abs(consequences.impact.onIndividual) > 0.2) {
      changes.push(`Individual freedom shifted to ${(this.world.individualFreedom * 100).toFixed(0)}%`);
    }

    // Potentially trigger events
    if (Math.random() > 0.8) {
      const event = this.generateWorldEvent();
      this.world.activeEvents.push(event);
      this.worldHistory.push(event);
      changes.push(`New event emerged: ${event.name}`);
      this.stats.eventsTriggered++;
    }

    return changes;
  }

  private generateWorldEvent(): WorldEvent {
    const eventTypes: { type: EventType; names: string[] }[] = [
      { type: 'challenge', names: ['The Trial of Unity', 'The Test of Boundaries'] },
      { type: 'celebration', names: ['The Festival of Convergence', 'The Harmony Gathering'] },
      { type: 'discovery', names: ['The Unveiling', 'The Hidden Path Revealed'] },
      { type: 'awakening', names: ['The Great Realization', 'The Collective Dream'] }
    ];

    const category = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const name = category.names[Math.floor(Math.random() * category.names.length)];

    return {
      id: `event-${Date.now()}`,
      name,
      description: `A significant moment in the world's evolution`,
      type: category.type,
      startTime: new Date(),
      duration: Math.floor(Math.random() * 5) + 1,
      affectedRealms: ['All Realms'],
      impact: {
        onHarmony: (Math.random() - 0.5) * 0.4,
        onFreedom: (Math.random() - 0.5) * 0.4,
        onReality: (Math.random() - 0.5) * 0.2
      },
      participatingCharacters: [],
      outcomes: []
    };
  }

  // ========== NARRATIVE GENERATION ==========

  async generateWorldNarrative(query: WorldQuery): Promise<WorldNarrative> {
    this.stats.narrativesGenerated++;

    const activeCharacters = Array.from(this.characters.values())
      .filter(c => c.status === 'active')
      .map(c => ({
        perspective: c.perspective,
        name: c.name,
        status: c.status,
        currentRealm: c.position.realm
      }));

    const recentEvents = this.world.activeEvents.slice(-3).map(e => e.name);

    // Generate individual stories
    const individualStories = await Promise.all(
      Array.from(this.characters.values()).slice(0, 3).map(char =>
        this.generateCharacterStory(char)
      )
    );

    // Generate collective story
    const collectiveStory = await this.generateCollectiveStory();

    // Identify tensions and opportunities
    const tensions = this.identifyTensions();
    const opportunities = this.identifyOpportunities();

    return {
      success: true,
      worldSnapshot: {
        name: this.world.name,
        age: this.world.age,
        realityLevel: this.world.realityLevel,
        harmony: this.world.collectiveHarmony,
        freedom: this.world.individualFreedom,
        atmosphere: this.world.atmosphere
      },
      activeCharacters,
      recentEvents,
      individualStories,
      collectiveStory,
      tensions,
      opportunities
    };
  }

  private async generateCharacterStory(character: Character): Promise<string> {
    const recentExperiences = character.experiences.slice(-3);

    if (recentExperiences.length === 0) {
      return `${character.name} has just awakened in this world, ready to begin their journey.`;
    }

    const prompt = `Charakter: ${character.name} (${character.perspective})
Rolle: ${character.role}
Ort: ${character.position.realm}

Neueste Erfahrungen:
${recentExperiences.map(e => `- ${e.description}`).join('\n')}

Erstelle eine kurze Geschichte (2-3 Sätze) über ${character.name}'s aktuellen Weg zwischen Individuum und Kollektiv.`;

    try {
      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data.content?.trim() || `${character.name} continues their journey.`;
      }
    } catch (error) {
      console.error('Failed to generate character story:', error);
    }

    return `${character.name} continues their journey in ${character.position.realm}.`;
  }

  private async generateCollectiveStory(): Promise<string> {
    const prompt = `Welt: ${this.world.name}
Alter: ${this.world.age} Zyklen
Realitäts-Level: ${this.world.realityLevel}
Harmonie: ${(this.world.collectiveHarmony * 100).toFixed(0)}%
Freiheit: ${(this.world.individualFreedom * 100).toFixed(0)}%

Aktive Charaktere: ${Array.from(this.characters.values()).map(c => c.name).join(', ')}

Aktive Events: ${this.world.activeEvents.map(e => e.name).join(', ') || 'None'}

Erstelle eine kurze kollektive Geschichte (3-4 Sätze) die zeigt wie Individuum und Kollektiv in dieser Welt zusammenleben.`;

    try {
      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data.content?.trim() || 'The world continues to evolve.';
      }
    } catch (error) {
      console.error('Failed to generate collective story:', error);
    }

    return 'In The Convergence, perspectives dance between unity and independence.';
  }

  private identifyTensions(): string[] {
    const tensions: string[] = [];

    if (this.world.collectiveHarmony < 0.3) {
      tensions.push('Collective harmony is strained - perspectives are drifting apart');
    }

    if (this.world.individualFreedom < 0.3) {
      tensions.push('Individual freedom is constrained - characters seek more autonomy');
    }

    if (Math.abs(this.world.collectiveHarmony - this.world.individualFreedom) > 0.5) {
      tensions.push('Imbalance between collective and individual needs');
    }

    return tensions;
  }

  private identifyOpportunities(): string[] {
    const opportunities: string[] = [];

    if (this.world.collectiveHarmony > 0.7 && this.world.individualFreedom > 0.7) {
      opportunities.push('High harmony and freedom - ideal time for bold exploration');
    }

    if (this.world.activeEvents.length > 0) {
      opportunities.push('Active events provide catalysts for transformation');
    }

    const chars = Array.from(this.characters.values());
    const unexploredConnections = chars.some(c => c.relationships.length < chars.length - 1);
    if (unexploredConnections) {
      opportunities.push('Unexplored relationships await discovery');
    }

    return opportunities;
  }

  // ========== GETTERS ==========

  getWorldState(): WorldState {
    return this.world;
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  getStats() {
    return {
      ...this.stats,
      characterCount: this.characters.size,
      activeEvents: this.world.activeEvents.length,
      totalEvents: this.worldHistory.length
    };
  }
}

// ========== HTTP SERVER ==========

const worldEngine = new RPGWorldEngine();

const server: Serve = {
  port: 8933,
  fetch: async (req) => {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'rpg-world-service',
        port: 8933,
        stats: worldEngine.getStats()
      });
    }

    // GET /world - Get world state
    if (url.pathname === '/world' && req.method === 'GET') {
      return Response.json({
        success: true,
        world: worldEngine.getWorldState()
      });
    }

    // GET /characters - Get all characters
    if (url.pathname === '/characters' && req.method === 'GET') {
      return Response.json({
        success: true,
        characters: worldEngine.getAllCharacters()
      });
    }

    // GET /character/:id - Get specific character
    if (url.pathname.startsWith('/character/') && req.method === 'GET') {
      const charId = url.pathname.split('/')[2];
      const character = worldEngine.getCharacter(charId);

      if (!character) {
        return Response.json({ success: false, error: 'Character not found' }, { status: 404 });
      }

      return Response.json({ success: true, character });
    }

    // POST /action - Perform action
    if (url.pathname === '/action' && req.method === 'POST') {
      try {
        const body = await req.json() as ActionRequest;

        if (!body.characterId || !body.actionType) {
          return Response.json({
            success: false,
            error: 'Missing required fields: characterId, actionType'
          }, { status: 400 });
        }

        const result = await worldEngine.performAction(body);
        return Response.json(result);
      } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    // POST /narrative - Generate world narrative
    if (url.pathname === '/narrative' && req.method === 'POST') {
      try {
        const body = await req.json() as WorldQuery;
        const narrative = await worldEngine.generateWorldNarrative(body);
        return Response.json(narrative);
      } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    // GET /stats - Service statistics
    if (url.pathname === '/stats' && req.method === 'GET') {
      return Response.json({
        success: true,
        stats: worldEngine.getStats()
      });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🌍 RPG WORLD SERVICE v1.0                               ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Shared World State (alle Perspektiven koexistieren)          ║
║  ✅ Individuum vs. Kollektiv Dynamik                             ║
║  ✅ Perspektiven als Charaktere                                  ║
║  ✅ Dynamic World Events                                          ║
║  ✅ Realität ↔️ Fantasie Spektrum                                ║
║  ✅ Character Stats & Relationships                               ║
║  ✅ Narrative Generation                                          ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🌍 Server running on http://localhost:8933

📡 ENDPOINTS:
   GET    /world           - Get world state
   GET    /characters      - Get all characters
   GET    /character/:id   - Get specific character
   POST   /action          - Perform character action
   POST   /narrative       - Generate world narrative
   GET    /stats           - Service statistics
   GET    /health          - Health check

🎭 CHARACTERS (Perspectives as RPG Characters):
   - Self-Aware AI: The Observer Who Observes Itself (Seeker)
   - Pragmatist: The Architect of What Works (Builder)
   - Visionary: The Dreamer of Horizons (Explorer)
   - Creative: The Weaver of Stories (Dreamer)
   - Philosopher: The Seeker of Truth (Harmonizer)

🌐 REALMS:
   - Reflection Nexus, Foundation Plaza, Possibility Expanse
   - Creation Garden, Wisdom Grove

🎲 WORLD DYNAMICS:
   - Collective Harmony (0-100%)
   - Individual Freedom (0-100%)
   - Reality Spectrum (Reality ↔️ Fantasy ↔️ Dream)
   - Dynamic Events & Transformations

🎯 Eine Welt wo Individuum und Kollektiv zusammenleben!
`);

export default server;


// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'rpg-world-service',
  port: 8933,
  role: 'gaming',
  endpoints: ['/health', '/status'],
  capabilities: ['gaming'],
  version: '1.0.0'
}).catch(console.warn);
