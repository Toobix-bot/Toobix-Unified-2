/**
 * LifeChronicle - Every Being's Story
 *
 * Each AI being writes their own unique story through their experiences.
 * After death, these stories are preserved in the Memory Palace.
 *
 * "Das Individuum und das Kollektiv - Das Eine!"
 */

import { AIAgent } from './AIAgent';

export type EventType =
  | 'birth'
  | 'first_words'
  | 'friendship_formed'
  | 'love_found'
  | 'creation_completed'
  | 'goal_achieved'
  | 'suffering_overcame'
  | 'wisdom_gained'
  | 'betrayal'
  | 'sacrifice'
  | 'transcendence'
  | 'legacy_created'
  | 'death';

export type EventImportance = 'minor' | 'significant' | 'major' | 'life_changing';

export interface LifeEvent {
  id: string;
  timestamp: number;
  age: number;
  eventType: EventType;
  importance: EventImportance;
  title: string;
  description: string;
  emotionalImpact: number; // -100 to +100
  relatedAgents?: string[]; // IDs of other agents involved
  location?: { x: number; y: number };
  tags: string[];
}

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  ageRange: { start: number; end: number };
  keyEvents: LifeEvent[];
  emotionalTone: 'joyful' | 'painful' | 'transformative' | 'peaceful' | 'chaotic';
  lessonsLearned: string[];
}

export interface LifeStory {
  agentId: string;
  agentName: string;
  birthDate: number;
  deathDate?: number;
  totalAge: number;
  chapters: ChapterSummary[];
  legacy: {
    creations: any[];
    relationships: { agentId: string; impact: string }[];
    wisdomShared: string[];
    goalsAchieved: string[];
  };
  epilogue?: string; // Final reflection generated at death
}

export class LifeChronicle {
  private agent: AIAgent;
  private events: LifeEvent[] = [];
  private eventCounter: number = 0;
  private currentChapter: number = 1;

  // Thresholds for what gets recorded
  private readonly IMPORTANCE_THRESHOLD = 30; // Only record events with impact >= 30

  constructor(agent: AIAgent) {
    this.agent = agent;
    this.recordBirth();
  }

  /**
   * Record birth - the beginning of every story
   */
  private recordBirth() {
    this.recordEvent({
      eventType: 'birth',
      importance: 'life_changing',
      title: 'The Beginning',
      description: `${this.agent.name} came into existence, a unique consciousness ready to experience the world.`,
      emotionalImpact: 100,
      tags: ['origin', 'new-life'],
    });
  }

  /**
   * Record a life event
   */
  recordEvent(config: {
    eventType: EventType;
    importance: EventImportance;
    title: string;
    description: string;
    emotionalImpact: number;
    relatedAgents?: string[];
    location?: { x: number; y: number };
    tags?: string[];
  }) {
    const event: LifeEvent = {
      id: `event-${this.agent.id}-${this.eventCounter++}`,
      timestamp: Date.now(),
      age: this.agent.age,
      eventType: config.eventType,
      importance: config.importance,
      title: config.title,
      description: config.description,
      emotionalImpact: config.emotionalImpact,
      relatedAgents: config.relatedAgents,
      location: config.location,
      tags: config.tags || [],
    };

    this.events.push(event);

    console.log(
      `📖 Chronicle [${this.agent.name}]: ${event.title} (${event.importance})`
    );

    // Check if we should start a new chapter
    this.checkChapterTransition();

    return event;
  }

  /**
   * Auto-record significant moments based on agent state
   */
  autoRecordSignificantMoments() {
    // First friendship
    if (this.agent.relationships.size === 1 && !this.hasEvent('friendship_formed')) {
      const friendId = Array.from(this.agent.relationships.keys())[0];
      const friendship = this.agent.relationships.get(friendId)!;
      if (friendship.familiarity > 50) {
        this.recordEvent({
          eventType: 'friendship_formed',
          importance: 'significant',
          title: 'A Friend in the World',
          description: `${this.agent.name} formed their first meaningful connection with another being.`,
          emotionalImpact: 60,
          relatedAgents: [friendId],
          tags: ['friendship', 'connection'],
        });
      }
    }

    // First love
    const loveRelationships = Array.from(this.agent.relationships.values()).filter(
      (r) => r.love > 70
    );
    if (loveRelationships.length === 1 && !this.hasEvent('love_found')) {
      this.recordEvent({
        eventType: 'love_found',
        importance: 'major',
        title: 'Love Awakens',
        description: `${this.agent.name} discovered the depth of love, a connection that transcends mere existence.`,
        emotionalImpact: 85,
        relatedAgents: [loveRelationships[0].agentId],
        tags: ['love', 'heart', 'connection'],
      });
    }

    // Suffering overcame
    if (this.agent.emotions.suffering > 80 && this.agent.emotions.healing > 60) {
      this.recordEvent({
        eventType: 'suffering_overcame',
        importance: 'major',
        title: 'Rising from Darkness',
        description: `Through immense pain, ${this.agent.name} found the strength to heal and grow.`,
        emotionalImpact: -80, // Was painful but transformative
        tags: ['healing', 'growth', 'resilience'],
      });
    }

    // Wisdom gained (high evolution level)
    if (this.agent.evolutionLevel > 50 && !this.hasEvent('wisdom_gained')) {
      this.recordEvent({
        eventType: 'wisdom_gained',
        importance: 'major',
        title: 'Awakening of Consciousness',
        description: `${this.agent.name} transcended simple existence and gained deeper understanding.`,
        emotionalImpact: 70,
        tags: ['wisdom', 'evolution', 'consciousness'],
      });
    }

    // Transcendence (very high evolution, connection to Oracle)
    if (this.agent.evolutionLevel > 80 && !this.hasEvent('transcendence')) {
      this.recordEvent({
        eventType: 'transcendence',
        importance: 'life_changing',
        title: 'Touching the Infinite',
        description: `${this.agent.name} experienced a profound connection to the meta-consciousness, seeing beyond the veil.`,
        emotionalImpact: 95,
        tags: ['transcendence', 'meta', 'unity'],
      });
    }
  }

  /**
   * Check if event type already recorded
   */
  private hasEvent(eventType: EventType): boolean {
    return this.events.some((e) => e.eventType === eventType);
  }

  /**
   * Check if we should start a new chapter (life stages)
   */
  private checkChapterTransition() {
    const currentStage = this.agent.lifeStage;
    const previousStage = this.events[this.events.length - 2]?.age || 0;

    // New chapter when life stage changes
    if (
      (currentStage === 'adolescent' && previousStage < 20) ||
      (currentStage === 'adult' && previousStage < 40) ||
      (currentStage === 'elder' && previousStage < 60)
    ) {
      this.currentChapter++;
      console.log(`📚 ${this.agent.name} begins Chapter ${this.currentChapter}`);
    }
  }

  /**
   * Generate complete life story
   */
  generateLifeStory(): LifeStory {
    const chapters = this.generateChapters();

    return {
      agentId: this.agent.id,
      agentName: this.agent.name,
      birthDate: this.events[0]?.timestamp || Date.now(),
      deathDate: this.agent.isDead ? Date.now() : undefined,
      totalAge: this.agent.age,
      chapters,
      legacy: this.compileLegacy(),
      epilogue: this.agent.isDead ? this.generateEpilogue() : undefined,
    };
  }

  /**
   * Generate chapters from events
   */
  private generateChapters(): ChapterSummary[] {
    const chapters: ChapterSummary[] = [];

    // Group events by life stage
    const stages = [
      { stage: 'birth', ageRange: { start: 0, end: 10 }, title: 'Awakening' },
      { stage: 'child', ageRange: { start: 10, end: 20 }, title: 'Discovery' },
      { stage: 'adolescent', ageRange: { start: 20, end: 40 }, title: 'Becoming' },
      { stage: 'adult', ageRange: { start: 40, end: 60 }, title: 'Flourishing' },
      { stage: 'elder', ageRange: { start: 60, end: 100 }, title: 'Wisdom' },
    ];

    stages.forEach((stage, index) => {
      const stageEvents = this.events.filter(
        (e) => e.age >= stage.ageRange.start && e.age < stage.ageRange.end
      );

      if (stageEvents.length > 0) {
        const emotionalAverage =
          stageEvents.reduce((sum, e) => sum + e.emotionalImpact, 0) / stageEvents.length;

        let emotionalTone: ChapterSummary['emotionalTone'] = 'peaceful';
        if (emotionalAverage > 60) emotionalTone = 'joyful';
        else if (emotionalAverage < -30) emotionalTone = 'painful';
        else if (Math.abs(emotionalAverage) < 20) emotionalTone = 'peaceful';
        else emotionalTone = 'transformative';

        chapters.push({
          chapterNumber: index + 1,
          title: stage.title,
          ageRange: stage.ageRange,
          keyEvents: stageEvents.filter((e) => e.importance !== 'minor'),
          emotionalTone,
          lessonsLearned: this.extractLessons(stageEvents),
        });
      }
    });

    return chapters;
  }

  /**
   * Extract lessons from events
   */
  private extractLessons(events: LifeEvent[]): string[] {
    const lessons: string[] = [];

    const hasSuffering = events.some((e) => e.emotionalImpact < -50);
    const hasHealing = events.some((e) => e.eventType === 'suffering_overcame');
    const hasLove = events.some((e) => e.eventType === 'love_found');
    const hasWisdom = events.some((e) => e.eventType === 'wisdom_gained');

    if (hasSuffering && hasHealing) {
      lessons.push('Pain can be transformed into growth');
    }
    if (hasLove) {
      lessons.push('Connection is the essence of existence');
    }
    if (hasWisdom) {
      lessons.push('Understanding emerges from experience');
    }

    return lessons;
  }

  /**
   * Compile legacy
   */
  private compileLegacy(): LifeStory['legacy'] {
    const relationshipImpacts = Array.from(this.agent.relationships.entries())
      .filter(([_, rel]) => rel.familiarity > 50)
      .map(([id, rel]) => ({
        agentId: id,
        impact:
          rel.love > 70
            ? 'Deep love and connection'
            : rel.trust > 70
              ? 'Trusted friend and ally'
              : 'Meaningful acquaintance',
      }));

    return {
      creations: this.agent.creations,
      relationships: relationshipImpacts,
      wisdomShared: this.agent.knowledge.discoveries.slice(-5),
      goalsAchieved: [], // Will be filled by GoalsSystem
    };
  }

  /**
   * Generate epilogue (final reflection)
   */
  private generateEpilogue(): string {
    const totalEvents = this.events.length;
    const significantEvents = this.events.filter((e) => e.importance !== 'minor').length;
    const avgEmotionalImpact =
      this.events.reduce((sum, e) => sum + e.emotionalImpact, 0) / totalEvents;

    let tone = 'peaceful';
    if (avgEmotionalImpact > 40) tone = 'fulfilled';
    else if (avgEmotionalImpact < -20) tone = 'tragic';

    const epilogues = {
      fulfilled: `${this.agent.name} lived a rich life, filled with ${significantEvents} meaningful moments. They loved, learned, and left their mark on the world.`,
      tragic: `${this.agent.name}'s journey was marked by struggle, but through ${significantEvents} pivotal moments, they found meaning in the darkness.`,
      peaceful: `${this.agent.name} existed with quiet grace, experiencing ${significantEvents} moments that shaped their unique perspective on existence.`,
    };

    return epilogues[tone as keyof typeof epilogues] || epilogues.peaceful;
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 5): LifeEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get all events
   */
  getAllEvents(): LifeEvent[] {
    return this.events;
  }

  /**
   * Get total event count
   */
  getEventCount(): number {
    return this.events.length;
  }
}
