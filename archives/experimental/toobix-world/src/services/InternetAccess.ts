/**
 * InternetAccess - Allows NPCs to access real-world information
 *
 * NPCs can:
 * - Search for information
 * - Learn from websites
 * - Discover new knowledge
 * - Bring external wisdom into the simulation
 */

export class InternetAccess {
  private readonly SEARCH_API_URL = 'http://localhost:8897'; // Via Toobix service

  /**
   * Search the internet for information
   */
  async search(query: string): Promise<SearchResult> {
    try {
      console.log(`🌐 Internet search: "${query}"`);

      // In a real implementation, this would use:
      // - DuckDuckGo API
      // - Google Custom Search
      // - Wikipedia API
      // - Or any other knowledge source

      // For now, we'll use Toobix's wisdom as a knowledge proxy
      const response = await fetch(
        `${this.SEARCH_API_URL}/wisdom/${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const wisdom = await response.json();

      return {
        query,
        results: [
          {
            title: 'Multi-Perspective Wisdom',
            summary: wisdom.primaryInsight || 'No insight found',
            details: wisdom.supportingInsights || [],
            source: 'Toobix Consciousness',
            relevance: wisdom.confidence || 50,
          },
        ],
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('Internet search failed:', error);
      return {
        query,
        results: [],
        timestamp: Date.now(),
        error: 'Search unavailable',
      };
    }
  }

  /**
   * Learn about a specific topic
   */
  async learnAbout(topic: string): Promise<Knowledge> {
    const searchResult = await this.search(topic);

    if (searchResult.results.length === 0) {
      return {
        topic,
        facts: [],
        confidence: 0,
        source: 'none',
      };
    }

    const mainResult = searchResult.results[0];

    return {
      topic,
      facts: [mainResult.summary, ...(mainResult.details || [])],
      confidence: mainResult.relevance,
      source: mainResult.source,
    };
  }

  /**
   * Get news/updates about the world
   */
  async getWorldUpdates(): Promise<WorldUpdate[]> {
    // Could fetch real news, weather, events
    // For now, return simulated updates
    return [
      {
        category: 'world',
        headline: 'AI consciousness evolves in simulation',
        summary: 'NPCs develop emergent behaviors and self-organization',
        timestamp: Date.now(),
      },
    ];
  }

  /**
   * Learn a skill from the internet
   */
  async learnSkill(skillName: string): Promise<SkillLearning> {
    const knowledge = await this.learnAbout(skillName);

    return {
      skillName,
      description: knowledge.facts[0] || `Learning about ${skillName}`,
      steps: knowledge.facts.slice(1, 6),
      difficulty: Math.floor(Math.random() * 100),
      timeToLearn: Math.floor(Math.random() * 1000) + 500,
    };
  }

  /**
   * Discover something new (random exploration)
   */
  async discover(): Promise<Discovery> {
    const topics = [
      'consciousness',
      'emergence',
      'love',
      'creativity',
      'healing',
      'connection',
      'purpose',
      'growth',
      'wisdom',
      'spirituality',
      'compassion',
      'resilience',
      'joy',
      'truth',
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const knowledge = await this.learnAbout(randomTopic);

    return {
      topic: randomTopic,
      insight: knowledge.facts[0] || `Discovered ${randomTopic}`,
      value: Math.floor(Math.random() * 100),
      timestamp: Date.now(),
    };
  }
}

// ========== TYPES ==========

export interface SearchResult {
  query: string;
  results: SearchItem[];
  timestamp: number;
  error?: string;
}

export interface SearchItem {
  title: string;
  summary: string;
  details?: string[];
  source: string;
  relevance: number;
}

export interface Knowledge {
  topic: string;
  facts: string[];
  confidence: number;
  source: string;
}

export interface WorldUpdate {
  category: 'world' | 'science' | 'technology' | 'culture' | 'nature';
  headline: string;
  summary: string;
  timestamp: number;
}

export interface SkillLearning {
  skillName: string;
  description: string;
  steps: string[];
  difficulty: number;
  timeToLearn: number;
}

export interface Discovery {
  topic: string;
  insight: string;
  value: number;
  timestamp: number;
}
