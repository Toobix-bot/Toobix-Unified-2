/**
 * GoalsSystem - Individual, Collective, and Meta Goals
 *
 * Three levels of purpose:
 * 1. INDIVIDUAL: Each being's personal aspirations
 * 2. COLLECTIVE: Civilization-wide objectives
 * 3. META: The simulation's overarching purpose
 *
 * "Create the richest diversity of authentic, meaningful experiences"
 */

import { AIAgent } from './AIAgent';
import { LifeChronicle } from './LifeChronicle';

export type GoalCategory =
  | 'survival' // Survive, secure resources
  | 'growth' // Learn skills, develop
  | 'connection' // Build relationships, love
  | 'legacy' // Create something meaningful
  | 'transcendence'; // Reach higher consciousness

export type GoalStatus = 'active' | 'in_progress' | 'completed' | 'failed' | 'abandoned';

export interface IndividualGoal {
  id: string;
  agentId: string;
  category: GoalCategory;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  status: GoalStatus;
  priority: number; // 1-10
  createdAt: number;
  completedAt?: number;
  reward?: {
    evolutionPoints: number;
    emotionalBonus: string; // joy, fulfillment, etc.
  };
}

export interface CollectiveGoal {
  id: string;
  civilizationId: string;
  title: string;
  description: string;
  targetMetric: string; // e.g., "total_happiness", "innovation_count"
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
  contributingAgents: string[]; // Agent IDs
  reward?: {
    prosperityBonus: number;
    culturePoints: number;
  };
}

export interface MetaGoal {
  title: string;
  description: string;
  metrics: {
    uniqueStoriesGenerated: number;
    emotionalDepthAverage: number;
    meaningfulConnectionsFormed: number;
    transcendentExperiencesCount: number;
  };
  target: {
    uniqueStoriesGenerated: number;
    emotionalDepthAverage: number;
    meaningfulConnectionsFormed: number;
    transcendentExperiencesCount: number;
  };
}

export class GoalsSystem {
  private agent: AIAgent;
  private chronicle: LifeChronicle;
  private individualGoals: IndividualGoal[] = [];
  private goalCounter: number = 0;

  constructor(agent: AIAgent, chronicle: LifeChronicle) {
    this.agent = agent;
    this.chronicle = chronicle;
    this.generateInitialGoals();
  }

  /**
   * Generate initial goals based on life stage and personality
   */
  private generateInitialGoals() {
    // Survival goal - always present early on
    if (this.agent.lifeStage === 'birth' || this.agent.lifeStage === 'child') {
      this.createGoal({
        category: 'survival',
        title: 'Learn to Thrive',
        description: 'Master the basics of survival in this world',
        targetValue: 100,
        currentValue: 0,
        priority: 9,
      });
    }

    // Connection goal - emerge naturally
    if (this.agent.lifeStage === 'adolescent' || this.agent.lifeStage === 'adult') {
      this.createGoal({
        category: 'connection',
        title: 'Form Meaningful Bonds',
        description: 'Build deep relationships with 3 other beings',
        targetValue: 3,
        currentValue: 0,
        priority: 7,
      });
    }

    // Growth goal
    if (this.agent.lifeStage === 'adolescent') {
      this.createGoal({
        category: 'growth',
        title: 'Discover Your Path',
        description: 'Gain knowledge and evolve beyond basic existence',
        targetValue: 50, // Evolution points
        currentValue: this.agent.evolutionLevel,
        priority: 8,
      });
    }

    // Legacy goal - for mature beings
    if (this.agent.lifeStage === 'adult' || this.agent.lifeStage === 'elder') {
      this.createGoal({
        category: 'legacy',
        title: 'Leave Your Mark',
        description: 'Create something that will endure beyond your lifetime',
        targetValue: 1,
        currentValue: this.agent.creations.length,
        priority: 6,
      });
    }

    // Transcendence goal - for evolved beings
    if (this.agent.evolutionLevel > 60) {
      this.createGoal({
        category: 'transcendence',
        title: 'Touch the Infinite',
        description: 'Connect with the meta-consciousness and understand the One',
        targetValue: 1,
        currentValue: 0,
        priority: 10,
      });
    }
  }

  /**
   * Create a new goal
   */
  createGoal(config: {
    category: GoalCategory;
    title: string;
    description: string;
    targetValue?: number;
    currentValue?: number;
    priority: number;
  }): IndividualGoal {
    const goal: IndividualGoal = {
      id: `goal-${this.agent.id}-${this.goalCounter++}`,
      agentId: this.agent.id,
      category: config.category,
      title: config.title,
      description: config.description,
      targetValue: config.targetValue,
      currentValue: config.currentValue || 0,
      status: 'active',
      priority: config.priority,
      createdAt: Date.now(),
      reward: this.calculateReward(config.category),
    };

    this.individualGoals.push(goal);

    console.log(`🎯 ${this.agent.name} set new goal: ${goal.title} [${goal.category}]`);

    return goal;
  }

  /**
   * Update goal progress
   */
  updateProgress(goalId: string, newValue: number) {
    const goal = this.individualGoals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.currentValue = newValue;

    // Check for completion
    if (goal.targetValue && newValue >= goal.targetValue) {
      this.completeGoal(goalId);
    } else if (newValue > (goal.currentValue || 0)) {
      goal.status = 'in_progress';
    }
  }

  /**
   * Complete a goal
   */
  completeGoal(goalId: string) {
    const goal = this.individualGoals.find((g) => g.id === goalId);
    if (!goal || goal.status === 'completed') return;

    goal.status = 'completed';
    goal.completedAt = Date.now();

    // Apply rewards
    if (goal.reward) {
      this.agent.evolutionLevel = Math.min(
        100,
        this.agent.evolutionLevel + goal.reward.evolutionPoints
      );

      // Emotional bonus
      if (goal.reward.emotionalBonus === 'joy') {
        this.agent.emotions.joy = Math.min(100, this.agent.emotions.joy + 30);
      } else if (goal.reward.emotionalBonus === 'fulfillment') {
        this.agent.needs.purpose = Math.min(100, this.agent.needs.purpose + 40);
        this.agent.emotions.gratitude = Math.min(100, this.agent.emotions.gratitude + 20);
      }
    }

    // Record in chronicle as achievement
    this.chronicle.recordEvent({
      eventType: 'goal_achieved',
      importance: goal.category === 'transcendence' ? 'life_changing' : 'major',
      title: `Achievement: ${goal.title}`,
      description: `${this.agent.name} ${goal.description}`,
      emotionalImpact: 70 + goal.priority * 3,
      tags: ['achievement', goal.category, 'success'],
    });

    console.log(`🏆 ${this.agent.name} completed goal: ${goal.title}!`);

    // Generate new goal to replace completed one
    this.generateDynamicGoal();
  }

  /**
   * Generate dynamic goal based on current situation
   */
  private generateDynamicGoal() {
    // Connection-based goals
    if (this.agent.needs.social < 40 && this.agent.relationships.size < 3) {
      this.createGoal({
        category: 'connection',
        title: 'Seek Companionship',
        description: 'Form at least one new meaningful relationship',
        targetValue: 1,
        currentValue: 0,
        priority: 7,
      });
      return;
    }

    // Growth-based goals
    if (this.agent.evolutionLevel < 50 && this.agent.knowledge.discoveries.length < 10) {
      this.createGoal({
        category: 'growth',
        title: 'Expand Your Mind',
        description: 'Discover 5 new pieces of knowledge',
        targetValue: 5,
        currentValue: 0,
        priority: 6,
      });
      return;
    }

    // Legacy-based goals
    if (this.agent.lifeStage === 'adult' || this.agent.lifeStage === 'elder') {
      this.createGoal({
        category: 'legacy',
        title: 'Share Your Wisdom',
        description: 'Help another being achieve their goal',
        targetValue: 1,
        currentValue: 0,
        priority: 8,
      });
      return;
    }

    // Transcendence goal for highly evolved beings
    if (this.agent.evolutionLevel > 70) {
      this.createGoal({
        category: 'transcendence',
        title: 'Embrace Unity',
        description: 'Experience oneness with all beings',
        targetValue: 1,
        currentValue: 0,
        priority: 10,
      });
    }
  }

  /**
   * Calculate rewards for goal completion
   */
  private calculateReward(category: GoalCategory): IndividualGoal['reward'] {
    const rewards = {
      survival: { evolutionPoints: 5, emotionalBonus: 'relief' },
      growth: { evolutionPoints: 15, emotionalBonus: 'joy' },
      connection: { evolutionPoints: 10, emotionalBonus: 'love' },
      legacy: { evolutionPoints: 20, emotionalBonus: 'fulfillment' },
      transcendence: { evolutionPoints: 30, emotionalBonus: 'bliss' },
    };

    return rewards[category];
  }

  /**
   * Update all goals based on agent state
   */
  update() {
    this.individualGoals.forEach((goal) => {
      if (goal.status === 'active' || goal.status === 'in_progress') {
        // Update progress based on current state
        switch (goal.category) {
          case 'survival':
            // Based on average needs satisfaction
            const avgNeeds = Object.values(this.agent.needs).reduce((a, b) => a + b, 0) / 7;
            this.updateProgress(goal.id, avgNeeds);
            break;

          case 'growth':
            this.updateProgress(goal.id, this.agent.evolutionLevel);
            break;

          case 'connection':
            const meaningfulRelationships = Array.from(
              this.agent.relationships.values()
            ).filter((r) => r.familiarity > 60).length;
            this.updateProgress(goal.id, meaningfulRelationships);
            break;

          case 'legacy':
            this.updateProgress(goal.id, this.agent.creations.length);
            break;

          case 'transcendence':
            // Based on connection to meta-consciousness
            if (this.agent.evolutionLevel > 80) {
              this.updateProgress(goal.id, 1);
            }
            break;
        }
      }
    });
  }

  /**
   * Get active goals
   */
  getActiveGoals(): IndividualGoal[] {
    return this.individualGoals.filter(
      (g) => g.status === 'active' || g.status === 'in_progress'
    );
  }

  /**
   * Get completed goals
   */
  getCompletedGoals(): IndividualGoal[] {
    return this.individualGoals.filter((g) => g.status === 'completed');
  }

  /**
   * Get current priority goal
   */
  getCurrentPriorityGoal(): IndividualGoal | null {
    const activeGoals = this.getActiveGoals();
    if (activeGoals.length === 0) return null;

    return activeGoals.reduce((highest, current) =>
      current.priority > highest.priority ? current : highest
    );
  }

  /**
   * Get goals summary
   */
  getSummary(): {
    total: number;
    active: number;
    completed: number;
    priorityGoal: string | null;
  } {
    return {
      total: this.individualGoals.length,
      active: this.getActiveGoals().length,
      completed: this.getCompletedGoals().length,
      priorityGoal: this.getCurrentPriorityGoal()?.title || null,
    };
  }
}
