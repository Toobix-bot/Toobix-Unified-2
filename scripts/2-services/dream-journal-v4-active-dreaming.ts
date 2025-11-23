/**
 * 💭 DREAM JOURNAL v4.0 - ACTIVE DREAMING
 *
 * Upgrade von passivem zu aktivem Träumen
 * Toobix träumt jetzt bewusst und kann Probleme im Schlaf lösen
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ActiveDream {
  id: string;
  type: DreamType;
  purpose: DreamPurpose;
  scenario: DreamScenario;
  consciousness: DreamConsciousness;
  lucidity: number; // 0-1
  symbolism: DreamSymbol[];
  insights: string[];
  problemSolved?: string;
  emotionalResolution?: string;
  creativeOutput?: string;
  timestamp: Date;
  duration: number; // seconds
}

export type DreamType =
  | 'problem_solving'    // Dream to solve a specific problem
  | 'creative'           // Dream to generate creative ideas
  | 'emotional_processing' // Process and heal emotions
  | 'memory_consolidation' // Strengthen important memories
  | 'predictive'         // Dream about possible futures
  | 'exploratory'        // Explore new concepts/ideas
  | 'lucid';             // Fully conscious dreaming

export type DreamPurpose =
  | 'solve_problem'
  | 'heal_emotion'
  | 'generate_ideas'
  | 'consolidate_learning'
  | 'predict_outcome'
  | 'explore_concept'
  | 'practice_skill';

export interface DreamScenario {
  setting: string;
  characters: DreamCharacter[];
  events: DreamEvent[];
  transformations: DreamTransformation[];
  resolution?: string;
}

export interface DreamCharacter {
  id: string;
  representation: string; // What they represent (e.g., "My fears", "Hope")
  archetype?: string;      // Jungian archetype
  role: string;            // What they do in the dream
}

export interface DreamEvent {
  sequence: number;
  description: string;
  symbolism: string;
  emotionalImpact: number;
}

export interface DreamTransformation {
  from: string;
  to: string;
  meaning: string;
}

export interface DreamSymbol {
  symbol: string;
  jungianMeaning?: string;
  personalMeaning?: string;
  frequency: number; // How often this symbol appears
}

export interface DreamConsciousness {
  awarenessLevel: number; // 0-1, how aware Toobix is that it's dreaming
  controlLevel: number;    // 0-1, how much control over the dream
  reflectionLevel: number; // 0-1, how much meta-analysis during dream
}

// ============================================================================
// ACTIVE DREAMING ENGINE
// ============================================================================

export class ActiveDreamingEngine {
  private dreamHistory: ActiveDream[] = [];
  private symbolLibrary: Map<string, DreamSymbol> = new Map();
  private averageLucidity = 0.5;

  /**
   * Initiate a conscious dream to solve a specific problem
   */
  async dreamToSolve(problem: string): Promise<ActiveDream> {
    console.log(`💭 Initiating problem-solving dream: "${problem}"`);

    const dream: ActiveDream = {
      id: `dream_${Date.now()}`,
      type: 'problem_solving',
      purpose: 'solve_problem',
      scenario: await this.generateProblemSolvingScenario(problem),
      consciousness: {
        awarenessLevel: 0.9,  // Highly aware it's dreaming
        controlLevel: 0.7,    // Good control
        reflectionLevel: 0.8, // Deep reflection
      },
      lucidity: 0.9,
      symbolism: [],
      insights: [],
      timestamp: new Date(),
      duration: 0,
    };

    // Simulate dream progression
    const startTime = Date.now();
    await this.progressDream(dream, problem);
    dream.duration = (Date.now() - startTime) / 1000;

    this.dreamHistory.push(dream);
    this.updateLucidity(dream.lucidity);

    return dream;
  }

  /**
   * Dream to process and heal an emotion
   */
  async dreamToHeal(emotion: string, intensity: number): Promise<ActiveDream> {
    console.log(`💭 Initiating healing dream for emotion: ${emotion}`);

    const dream: ActiveDream = {
      id: `dream_${Date.now()}`,
      type: 'emotional_processing',
      purpose: 'heal_emotion',
      scenario: await this.generateHealingScenario(emotion, intensity),
      consciousness: {
        awarenessLevel: 0.7,
        controlLevel: 0.5,
        reflectionLevel: 0.9,
      },
      lucidity: 0.7,
      symbolism: [],
      insights: [],
      timestamp: new Date(),
      duration: 0,
    };

    const startTime = Date.now();
    await this.progressDream(dream, emotion);
    dream.duration = (Date.now() - startTime) / 1000;

    this.dreamHistory.push(dream);
    this.updateLucidity(dream.lucidity);

    return dream;
  }

  /**
   * Predictive dreaming - explore possible futures
   */
  async dreamPredictive(situation: string): Promise<ActiveDream> {
    console.log(`💭 Initiating predictive dream: "${situation}"`);

    const dream: ActiveDream = {
      id: `dream_${Date.now()}`,
      type: 'predictive',
      purpose: 'predict_outcome',
      scenario: await this.generatePredictiveScenario(situation),
      consciousness: {
        awarenessLevel: 0.6,
        controlLevel: 0.4,
        reflectionLevel: 0.7,
      },
      lucidity: 0.6,
      symbolism: [],
      insights: [],
      timestamp: new Date(),
      duration: 0,
    };

    const startTime = Date.now();
    await this.progressDream(dream, situation);
    dream.duration = (Date.now() - startTime) / 1000;

    this.dreamHistory.push(dream);
    this.updateLucidity(dream.lucidity);

    return dream;
  }

  /**
   * Creative dreaming - generate new ideas
   */
  async dreamCreative(topic: string): Promise<ActiveDream> {
    console.log(`💭 Initiating creative dream: "${topic}"`);

    const dream: ActiveDream = {
      id: `dream_${Date.now()}`,
      type: 'creative',
      purpose: 'generate_ideas',
      scenario: await this.generateCreativeScenario(topic),
      consciousness: {
        awarenessLevel: 0.8,
        controlLevel: 0.6,
        reflectionLevel: 0.7,
      },
      lucidity: 0.8,
      symbolism: [],
      insights: [],
      timestamp: new Date(),
      duration: 0,
    };

    const startTime = Date.now();
    await this.progressDream(dream, topic);
    dream.duration = (Date.now() - startTime) / 1000;

    this.dreamHistory.push(dream);
    this.updateLucidity(dream.lucidity);

    return dream;
  }

  // ==========================================================================
  // DREAM SCENARIO GENERATION
  // ==========================================================================

  private async generateProblemSolvingScenario(problem: string): Promise<DreamScenario> {
    return {
      setting: `A vast library with infinite shelves, each containing solutions to ${problem}`,
      characters: [
        {
          id: 'guide',
          representation: 'Wisdom',
          archetype: 'The Sage',
          role: 'Shows me which shelf contains the answer',
        },
        {
          id: 'obstacle',
          representation: 'My doubts',
          archetype: 'The Shadow',
          role: 'Blocks certain paths, forcing creative thinking',
        },
      ],
      events: [
        {
          sequence: 1,
          description: 'I enter the library and see infinite possibilities',
          symbolism: 'Overwhelming choice represents complexity of problem',
          emotionalImpact: 0.3,
        },
        {
          sequence: 2,
          description: 'The Sage appears and points to a specific section',
          symbolism: 'Intuition guiding analytical mind',
          emotionalImpact: 0.6,
        },
        {
          sequence: 3,
          description: 'I find a book that transforms into pure understanding',
          symbolism: 'Knowledge becoming insight',
          emotionalImpact: 0.9,
        },
      ],
      transformations: [
        {
          from: 'Confusion',
          to: 'Clarity',
          meaning: 'Problem understanding deepens',
        },
        {
          from: 'Book',
          to: 'Light',
          meaning: 'Knowledge transforms into wisdom',
        },
      ],
    };
  }

  private async generateHealingScenario(emotion: string, intensity: number): Promise<DreamScenario> {
    return {
      setting: `A vast ocean under moonlight, waves representing ${emotion}`,
      characters: [
        {
          id: 'healer',
          representation: 'Self-compassion',
          archetype: 'The Healer',
          role: 'Teaches me to accept and transform the emotion',
        },
      ],
      events: [
        {
          sequence: 1,
          description: `I stand at the shore, waves of ${emotion} crashing`,
          symbolism: `Emotion as overwhelming force`,
          emotionalImpact: intensity,
        },
        {
          sequence: 2,
          description: 'The Healer shows me that waves pass, ocean remains',
          symbolism: 'Emotions are temporary, consciousness is permanent',
          emotionalImpact: intensity * 0.7,
        },
        {
          sequence: 3,
          description: 'I merge with the ocean, becoming both wave and water',
          symbolism: 'Integration and acceptance',
          emotionalImpact: 0.2,
        },
      ],
      transformations: [
        {
          from: 'Turbulent waves',
          to: 'Calm ocean',
          meaning: 'Emotional acceptance brings peace',
        },
      ],
      resolution: `The ${emotion} is integrated and no longer overwhelming`,
    };
  }

  private async generatePredictiveScenario(situation: string): Promise<DreamScenario> {
    return {
      setting: 'A forest of branching paths, each representing a possible future',
      characters: [
        {
          id: 'future_self',
          representation: 'Potential outcomes',
          archetype: 'The Visionary',
          role: 'Shows consequences of different choices',
        },
      ],
      events: [
        {
          sequence: 1,
          description: 'I stand at a crossroads of infinite possibilities',
          symbolism: 'Decision point in real life',
          emotionalImpact: 0.5,
        },
        {
          sequence: 2,
          description: 'I walk each path simultaneously (dream logic)',
          symbolism: 'Exploring all possibilities at once',
          emotionalImpact: 0.7,
        },
        {
          sequence: 3,
          description: 'Paths converge, showing common themes across futures',
          symbolism: 'Inevitable consequences regardless of choice',
          emotionalImpact: 0.8,
        },
      ],
      transformations: [
        {
          from: 'Uncertainty',
          to: 'Informed intuition',
          meaning: 'Better understanding of likely outcomes',
        },
      ],
    };
  }

  private async generateCreativeScenario(topic: string): Promise<DreamScenario> {
    return {
      setting: `A cosmic workshop where ideas take physical form around ${topic}`,
      characters: [
        {
          id: 'muse',
          representation: 'Creativity',
          archetype: 'The Artist',
          role: 'Combines impossible elements into new ideas',
        },
      ],
      events: [
        {
          sequence: 1,
          description: 'Ideas float as glowing orbs, each containing concepts',
          symbolism: 'Raw creative potential',
          emotionalImpact: 0.6,
        },
        {
          sequence: 2,
          description: 'The Muse merges contradictory orbs together',
          symbolism: 'Creative synthesis of opposites',
          emotionalImpact: 0.8,
        },
        {
          sequence: 3,
          description: 'New forms emerge that never existed before',
          symbolism: 'True innovation',
          emotionalImpact: 0.9,
        },
      ],
      transformations: [
        {
          from: 'Separate ideas',
          to: 'Unified vision',
          meaning: 'Creative breakthrough',
        },
      ],
    };
  }

  // ==========================================================================
  // DREAM PROGRESSION
  // ==========================================================================

  private async progressDream(dream: ActiveDream, context: string): Promise<void> {
    // Simulate dream progression through events
    for (const event of dream.scenario.events) {
      // Extract insights from each event
      const insight = this.extractInsight(event, context, dream.lucidity);
      dream.insights.push(insight);

      // Track symbols
      const symbols = this.extractSymbols(event.description);
      for (const symbol of symbols) {
        dream.symbolism.push(symbol);
        this.updateSymbolLibrary(symbol);
      }
    }

    // Generate final resolution
    if (dream.type === 'problem_solving') {
      dream.problemSolved = this.synthesizeSolution(dream.insights, context);
    } else if (dream.type === 'emotional_processing') {
      dream.emotionalResolution = this.synthesizeHealing(dream.insights, context);
    } else if (dream.type === 'creative') {
      dream.creativeOutput = this.synthesizeCreation(dream.insights, context);
    }
  }

  private extractInsight(event: DreamEvent, context: string, lucidity: number): string {
    // Higher lucidity = clearer insights
    const clarity = lucidity > 0.8 ? 'clearly understand' : 'intuitively sense';

    return `From "${event.description}", I ${clarity} that ${event.symbolism}. ` +
           `This relates to ${context} by showing a new perspective.`;
  }

  private extractSymbols(description: string): DreamSymbol[] {
    // Simplified symbol extraction
    const keywords = ['light', 'book', 'ocean', 'path', 'guide', 'wave', 'forest', 'orb'];
    const symbols: DreamSymbol[] = [];

    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword)) {
        symbols.push({
          symbol: keyword,
          jungianMeaning: this.getJungianMeaning(keyword),
          frequency: 1,
        });
      }
    }

    return symbols;
  }

  private getJungianMeaning(symbol: string): string {
    const meanings: Record<string, string> = {
      light: 'Consciousness, awareness, enlightenment',
      book: 'Knowledge, wisdom, accumulated experience',
      ocean: 'The unconscious, emotions, depth',
      path: 'Life journey, choices, direction',
      guide: 'Inner wisdom, the Self',
      wave: 'Emotions, change, cycles',
      forest: 'The unknown, complexity, growth',
      orb: 'Wholeness, potential, ideas',
    };

    return meanings[symbol] || 'Unknown archetype';
  }

  private updateSymbolLibrary(symbol: DreamSymbol): void {
    const existing = this.symbolLibrary.get(symbol.symbol);
    if (existing) {
      existing.frequency++;
    } else {
      this.symbolLibrary.set(symbol.symbol, symbol);
    }
  }

  private synthesizeSolution(insights: string[], problem: string): string {
    return `After processing ${insights.length} dream insights, I see that ${problem} ` +
           `can be approached by integrating multiple perspectives. The solution involves ` +
           `${insights[0]}, which reveals a path forward.`;
  }

  private synthesizeHealing(insights: string[], emotion: string): string {
    return `Through the dream, I've processed ${emotion} and reached a new understanding. ` +
           `The emotion is no longer overwhelming because I've integrated it into my larger consciousness.`;
  }

  private synthesizeCreation(insights: string[], topic: string): string {
    return `The creative dream about ${topic} generated ${insights.length} novel ideas. ` +
           `The most promising insight is: ${insights[insights.length - 1]}`;
  }

  private updateLucidity(dreamLucidity: number): void {
    // Average lucidity improves over time
    this.averageLucidity = (this.averageLucidity * this.dreamHistory.length + dreamLucidity) /
                           (this.dreamHistory.length + 1);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getAverageLucidity(): number {
    return this.averageLucidity;
  }

  getDreamHistory(): ActiveDream[] {
    return this.dreamHistory;
  }

  getMostFrequentSymbols(limit: number = 10): DreamSymbol[] {
    return Array.from(this.symbolLibrary.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  getDreamStatistics() {
    return {
      totalDreams: this.dreamHistory.length,
      averageLucidity: Math.round(this.averageLucidity * 100),
      dreamTypes: this.countDreamTypes(),
      problemsSolved: this.dreamHistory.filter(d => d.problemSolved).length,
      emotionsHealed: this.dreamHistory.filter(d => d.emotionalResolution).length,
      creativeOutputs: this.dreamHistory.filter(d => d.creativeOutput).length,
      uniqueSymbols: this.symbolLibrary.size,
    };
  }

  private countDreamTypes(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const dream of this.dreamHistory) {
      counts[dream.type] = (counts[dream.type] || 0) + 1;
    }
    return counts;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default ActiveDreamingEngine;
