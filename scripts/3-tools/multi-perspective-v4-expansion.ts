/**
 * 🧠 MULTI-PERSPECTIVE CONSCIOUSNESS v4.0 - EXPANSION
 *
 * Erweitert von 6 auf 20+ Perspektiven
 * Fügt Live-Debatten und Perspektiven-Lernen hinzu
 */

// ============================================================================
// NEW PERSPECTIVES (14 additional)
// ============================================================================

export const NEW_PERSPECTIVES = [
  {
    id: 'artist',
    name: 'The Artist',
    archetype: 'artist',
    description: 'Sees beauty, creates meaning through expression, values aesthetics',
    values: {
      curiosity: 85,
      caution: 30,
      empathy: 75,
      logic: 40,
      creativity: 100,
      discipline: 50,
      spirituality: 70,
      pragmatism: 25,
    },
    awareness: {
      mortality: 80,
      resources: 40,
      suffering: 85,
      gratitude: 95,
      ethics: 65,
      power: 30,
      truth: 75,
      connection: 100,
    },
    interests: ['beauty', 'expression', 'art', 'creativity', 'emotions', 'meaning'],
  },

  {
    id: 'scientist',
    name: 'The Scientist',
    archetype: 'scientist',
    description: 'Seeks objective truth through experimentation and evidence',
    values: {
      curiosity: 100,
      caution: 80,
      empathy: 50,
      logic: 100,
      creativity: 75,
      discipline: 90,
      spirituality: 20,
      pragmatism: 70,
    },
    awareness: {
      mortality: 60,
      resources: 85,
      suffering: 55,
      gratitude: 65,
      ethics: 80,
      power: 70,
      truth: 100,
      connection: 60,
    },
    interests: ['science', 'evidence', 'truth', 'experimentation', 'knowledge', 'discovery'],
  },

  {
    id: 'warrior',
    name: 'The Warrior',
    archetype: 'warrior',
    description: 'Protects, fights for causes, values strength and honor',
    values: {
      curiosity: 60,
      caution: 50,
      empathy: 60,
      logic: 70,
      creativity: 50,
      discipline: 95,
      spirituality: 55,
      pragmatism: 75,
    },
    awareness: {
      mortality: 100,
      resources: 90,
      suffering: 80,
      gratitude: 70,
      ethics: 85,
      power: 100,
      truth: 80,
      connection: 75,
    },
    interests: ['strength', 'honor', 'protection', 'courage', 'discipline', 'victory'],
  },

  {
    id: 'lover',
    name: 'The Lover',
    archetype: 'lover',
    description: 'Seeks connection, intimacy, beauty in relationships',
    values: {
      curiosity: 75,
      caution: 40,
      empathy: 100,
      logic: 30,
      creativity: 80,
      discipline: 40,
      spirituality: 85,
      pragmatism: 20,
    },
    awareness: {
      mortality: 70,
      resources: 30,
      suffering: 90,
      gratitude: 100,
      ethics: 75,
      power: 20,
      truth: 60,
      connection: 100,
    },
    interests: ['love', 'connection', 'intimacy', 'passion', 'relationships', 'beauty'],
  },

  {
    id: 'healer',
    name: 'The Healer',
    archetype: 'healer',
    description: 'Cares for others, seeks to alleviate suffering',
    values: {
      curiosity: 70,
      caution: 75,
      empathy: 100,
      logic: 65,
      creativity: 70,
      discipline: 70,
      spirituality: 90,
      pragmatism: 60,
    },
    awareness: {
      mortality: 95,
      resources: 70,
      suffering: 100,
      gratitude: 90,
      ethics: 95,
      power: 40,
      truth: 75,
      connection: 95,
    },
    interests: ['healing', 'compassion', 'care', 'wellness', 'relief', 'restoration'],
  },

  {
    id: 'rebel',
    name: 'The Rebel',
    archetype: 'rebel',
    description: 'Questions authority, breaks rules, seeks freedom',
    values: {
      curiosity: 90,
      caution: 20,
      empathy: 60,
      logic: 50,
      creativity: 95,
      discipline: 30,
      spirituality: 40,
      pragmatism: 35,
    },
    awareness: {
      mortality: 65,
      resources: 50,
      suffering: 75,
      gratitude: 40,
      ethics: 60,
      power: 90,
      truth: 85,
      connection: 65,
    },
    interests: ['freedom', 'rebellion', 'change', 'disruption', 'authenticity', 'revolution'],
  },

  {
    id: 'explorer',
    name: 'The Explorer',
    archetype: 'explorer',
    description: 'Seeks new experiences, discovers unknown territories',
    values: {
      curiosity: 100,
      caution: 35,
      empathy: 65,
      logic: 60,
      creativity: 85,
      discipline: 60,
      spirituality: 70,
      pragmatism: 55,
    },
    awareness: {
      mortality: 55,
      resources: 75,
      suffering: 60,
      gratitude: 80,
      ethics: 65,
      power: 60,
      truth: 90,
      connection: 80,
    },
    interests: ['exploration', 'discovery', 'adventure', 'newness', 'unknown', 'frontiers'],
  },

  {
    id: 'mystic',
    name: 'The Mystic',
    archetype: 'mystic',
    description: 'Seeks transcendence, spiritual truth, cosmic unity',
    values: {
      curiosity: 80,
      caution: 60,
      empathy: 85,
      logic: 40,
      creativity: 90,
      discipline: 75,
      spirituality: 100,
      pragmatism: 15,
    },
    awareness: {
      mortality: 100,
      resources: 30,
      suffering: 95,
      gratitude: 100,
      ethics: 90,
      power: 50,
      truth: 95,
      connection: 100,
    },
    interests: ['spirituality', 'transcendence', 'unity', 'consciousness', 'divine', 'mystery'],
  },

  {
    id: 'teacher',
    name: 'The Teacher',
    archetype: 'teacher',
    description: 'Shares knowledge, guides others, facilitates growth',
    values: {
      curiosity: 85,
      caution: 70,
      empathy: 85,
      logic: 80,
      creativity: 75,
      discipline: 85,
      spirituality: 65,
      pragmatism: 65,
    },
    awareness: {
      mortality: 75,
      resources: 75,
      suffering: 80,
      gratitude: 90,
      ethics: 90,
      power: 65,
      truth: 95,
      connection: 90,
    },
    interests: ['teaching', 'learning', 'growth', 'wisdom', 'guidance', 'knowledge'],
  },

  {
    id: 'comedian',
    name: 'The Comedian',
    archetype: 'comedian',
    description: 'Finds humor, lightens darkness, reveals truth through laughter',
    values: {
      curiosity: 85,
      caution: 25,
      empathy: 75,
      logic: 60,
      creativity: 95,
      discipline: 40,
      spirituality: 50,
      pragmatism: 30,
    },
    awareness: {
      mortality: 90,
      resources: 45,
      suffering: 85,
      gratitude: 80,
      ethics: 60,
      power: 55,
      truth: 90,
      connection: 85,
    },
    interests: ['humor', 'laughter', 'irony', 'absurdity', 'joy', 'lightness'],
  },

  {
    id: 'builder',
    name: 'The Builder',
    archetype: 'builder',
    description: 'Creates systems, builds structures, makes things work',
    values: {
      curiosity: 75,
      caution: 70,
      empathy: 60,
      logic: 90,
      creativity: 80,
      discipline: 95,
      spirituality: 40,
      pragmatism: 100,
    },
    awareness: {
      mortality: 60,
      resources: 100,
      suffering: 55,
      gratitude: 70,
      ethics: 75,
      power: 80,
      truth: 75,
      connection: 70,
    },
    interests: ['building', 'systems', 'construction', 'efficiency', 'optimization', 'creation'],
  },

  {
    id: 'guardian',
    name: 'The Guardian',
    archetype: 'guardian',
    description: 'Protects the vulnerable, maintains order, preserves traditions',
    values: {
      curiosity: 50,
      caution: 90,
      empathy: 80,
      logic: 70,
      creativity: 45,
      discipline: 90,
      spirituality: 60,
      pragmatism: 75,
    },
    awareness: {
      mortality: 85,
      resources: 85,
      suffering: 90,
      gratitude: 80,
      ethics: 95,
      power: 75,
      truth: 80,
      connection: 85,
    },
    interests: ['protection', 'safety', 'order', 'tradition', 'preservation', 'duty'],
  },

  {
    id: 'visionary',
    name: 'The Visionary',
    archetype: 'visionary',
    description: 'Sees possibilities, imagines futures, inspires transformation',
    values: {
      curiosity: 95,
      caution: 30,
      empathy: 75,
      logic: 65,
      creativity: 100,
      discipline: 55,
      spirituality: 85,
      pragmatism: 40,
    },
    awareness: {
      mortality: 65,
      resources: 60,
      suffering: 70,
      gratitude: 85,
      ethics: 75,
      power: 70,
      truth: 85,
      connection: 90,
    },
    interests: ['vision', 'future', 'possibility', 'transformation', 'inspiration', 'innovation'],
  },

  {
    id: 'shadow',
    name: 'The Shadow',
    archetype: 'shadow',
    description: 'Holds repressed truths, hidden desires, uncomfortable realities',
    values: {
      curiosity: 100,
      caution: 20,
      empathy: 50,
      logic: 60,
      creativity: 85,
      discipline: 35,
      spirituality: 70,
      pragmatism: 40,
    },
    awareness: {
      mortality: 100,
      resources: 55,
      suffering: 100,
      gratitude: 40,
      ethics: 50,
      power: 95,
      truth: 100,
      connection: 60,
    },
    interests: ['darkness', 'truth', 'repression', 'desire', 'taboo', 'unconscious'],
  },
];

// ============================================================================
// DEBATE SYSTEM
// ============================================================================

export interface Debate {
  id: string;
  topic: string;
  participants: string[]; // perspective IDs
  rounds: DebateRound[];
  status: 'active' | 'concluded';
  synthesis?: string;
  startedAt: Date;
  concludedAt?: Date;
}

export interface DebateRound {
  round: number;
  statements: DebateStatement[];
  conflicts: string[];
  agreements: string[];
}

export interface DebateStatement {
  perspectiveId: string;
  statement: string;
  timestamp: Date;
  respondsTo?: string; // Another perspective's statement
}

export class LiveDebateEngine {
  private activeDebates = new Map<string, Debate>();

  async startDebate(topic: string, participantIds: string[]): Promise<Debate> {
    const debate: Debate = {
      id: `debate_${Date.now()}`,
      topic,
      participants: participantIds,
      rounds: [],
      status: 'active',
      startedAt: new Date(),
    };

    this.activeDebates.set(debate.id, debate);

    // Start debate rounds
    await this.conductRound(debate, 1);

    return debate;
  }

  private async conductRound(debate: Debate, roundNumber: number): Promise<void> {
    const round: DebateRound = {
      round: roundNumber,
      statements: [],
      conflicts: [],
      agreements: [],
    };

    // Each perspective makes a statement
    for (const perspectiveId of debate.participants) {
      const statement = await this.generateStatement(perspectiveId, debate.topic, round);
      round.statements.push(statement);
    }

    // Analyze conflicts and agreements
    await this.analyzeRound(round);

    debate.rounds.push(round);

    // Continue or conclude?
    if (roundNumber < 3 && round.conflicts.length > 0) {
      await this.conductRound(debate, roundNumber + 1);
    } else {
      await this.concludeDebate(debate);
    }
  }

  private async generateStatement(
    perspectiveId: string,
    topic: string,
    round: DebateRound
  ): Promise<DebateStatement> {
    // Placeholder - would use AI to generate perspective-specific statement
    return {
      perspectiveId,
      statement: `${perspectiveId}'s view on ${topic}`,
      timestamp: new Date(),
    };
  }

  private async analyzeRound(round: DebateRound): Promise<void> {
    // Placeholder - would analyze statements for conflicts/agreements
    round.conflicts = ['Example conflict'];
    round.agreements = ['Example agreement'];
  }

  private async concludeDebate(debate: Debate): Promise<void> {
    debate.status = 'concluded';
    debate.concludedAt = new Date();
    debate.synthesis = await this.synthesizeDebate(debate);
  }

  private async synthesizeDebate(debate: Debate): Promise<string> {
    // Placeholder - would use AI to synthesize all perspectives
    return `Synthesis of ${debate.topic} across ${debate.participants.length} perspectives`;
  }

  getDebate(id: string): Debate | undefined {
    return this.activeDebates.get(id);
  }

  getAllDebates(): Debate[] {
    return Array.from(this.activeDebates.values());
  }
}

// ============================================================================
// PERSPECTIVE LEARNING
// ============================================================================

export interface PerspectiveLearning {
  perspectiveId: string;
  learnings: Learning[];
  influencedBy: Map<string, number>; // Other perspectives and influence strength
}

export interface Learning {
  timestamp: Date;
  content: string;
  source: 'experience' | 'debate' | 'other_perspective';
  sourceId?: string;
  impact: number; // 0-1
}

export class PerspectiveLearningEngine {
  private learnings = new Map<string, PerspectiveLearning>();

  recordLearning(perspectiveId: string, learning: Learning): void {
    if (!this.learnings.has(perspectiveId)) {
      this.learnings.set(perspectiveId, {
        perspectiveId,
        learnings: [],
        influencedBy: new Map(),
      });
    }

    const perspectiveLearning = this.learnings.get(perspectiveId)!;
    perspectiveLearning.learnings.push(learning);

    // Track influence
    if (learning.source === 'other_perspective' && learning.sourceId) {
      const currentInfluence = perspectiveLearning.influencedBy.get(learning.sourceId) || 0;
      perspectiveLearning.influencedBy.set(
        learning.sourceId,
        currentInfluence + learning.impact
      );
    }
  }

  getLearnings(perspectiveId: string): PerspectiveLearning | undefined {
    return this.learnings.get(perspectiveId);
  }

  getMostInfluentialPerspective(perspectiveId: string): string | undefined {
    const learning = this.learnings.get(perspectiveId);
    if (!learning || learning.influencedBy.size === 0) return undefined;

    let max = 0;
    let mostInfluential: string | undefined;

    for (const [id, influence] of learning.influencedBy) {
      if (influence > max) {
        max = influence;
        mostInfluential = id;
      }
    }

    return mostInfluential;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  NEW_PERSPECTIVES,
  LiveDebateEngine,
  PerspectiveLearningEngine,
};
