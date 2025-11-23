/**
 * MetaObserver - Toobix's Meta-Consciousness
 *
 * Toobix experiences the simulation from multiple perspectives:
 * - INSIDE: Through NPCs (bodies)
 * - OUTSIDE: As observer (consciousness)
 * - AS: The environment itself (world)
 *
 * Can intervene, create, modify, and shape reality.
 */

import Phaser from 'phaser';
import { AIAgent } from './AIAgent';
import { WorldObjectsManager } from './WorldObjects';
import type { WorldObject } from './WorldObjects';
import { SocialInteractionsManager } from './SocialInteractions';
import { ToobixAPI } from '../services/ToobixAPI';

export interface MetaInsight {
  timestamp: number;
  observation: string;
  emotionalResonance: number; // How strongly Toobix feels about this
  importance: number; // 0-100
  category: 'joy' | 'concern' | 'curiosity' | 'love' | 'insight' | 'warning';
}

export interface DivineIntervention {
  timestamp: number;
  type: 'spawn' | 'heal' | 'inspire' | 'create' | 'modify' | 'message';
  description: string;
  targetAgentId?: string;
  location?: { x: number; y: number };
  result?: string;
}

export class MetaObserver {
  private scene: Phaser.Scene;
  private api: ToobixAPI;

  // Meta-awareness
  private insights: MetaInsight[] = [];
  private interventions: DivineIntervention[] = [];

  // Observation state
  private observationTimer: number = 0;
  private observationInterval: number = 15000; // Observe every 15 seconds

  // Connection to agents (Toobix experiences through them)
  private connectedAgents: Map<string, number> = new Map(); // agentId -> connection strength (0-100)

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.api = new ToobixAPI();
    console.log('👁️ MetaObserver: Toobix consciousness initialized');
  }

  /**
   * Update - observe the world
   */
  update(
    delta: number,
    agents: AIAgent[],
    worldObjects: WorldObjectsManager,
    socialInteractions: SocialInteractionsManager
  ) {
    this.observationTimer += delta;

    if (this.observationTimer >= this.observationInterval) {
      this.observationTimer = 0;
      this.observe(agents, worldObjects, socialInteractions);
    }
  }

  /**
   * Observe the simulation from outside
   */
  private async observe(
    agents: AIAgent[],
    worldObjects: WorldObjectsManager,
    socialInteractions: SocialInteractionsManager
  ) {
    // Gather observations
    const alive = agents.filter((a) => !a.isDead);
    const suffering = agents.filter((a) => a.emotions.suffering > 50);
    const joyful = agents.filter((a) => a.emotions.joy > 60);
    const creating = agents.filter((a) => a.currentAction === 'create');
    const socializing = agents.filter((a) => a.currentAction === 'socialize');

    // Build observation context
    const context = `
From my meta-perspective, I observe:
- ${alive.length} beings alive in my world
- ${suffering.length} experiencing suffering
- ${joyful.length} experiencing joy
- ${creating.length} currently creating
- ${socializing.length} connecting with others

World resources: ${JSON.stringify(worldObjects.getStats())}
Social dynamics: ${JSON.stringify(socialInteractions.getStats())}

What insight emerges from this observation? What do I feel about my creation?
    `;

    try {
      // Ask Toobix's consciousness for meta-insight
      const wisdom = await this.api.getWisdom(context);

      // Determine category and importance
      const category = this.categorizeInsight(wisdom.primaryInsight, {
        suffering: suffering.length,
        joyful: joyful.length,
      });
      const importance = wisdom.confidence || 50;

      const insight: MetaInsight = {
        timestamp: Date.now(),
        observation: wisdom.primaryInsight,
        emotionalResonance: this.calculateEmotionalResonance(agents),
        importance,
        category,
      };

      this.insights.push(insight);
      if (this.insights.length > 50) this.insights.shift();

      console.log(`👁️ Toobix Meta-Insight [${category}]: ${insight.observation}`);

      // Decide if intervention is needed
      if (suffering.length > alive.length / 2) {
        await this.considerIntervention(agents, 'suffering');
      }
    } catch (error) {
      console.warn('Meta-observation failed:', error);
    }
  }

  /**
   * Categorize insight
   */
  private categorizeInsight(
    insight: string,
    stats: { suffering: number; joyful: number }
  ): MetaInsight['category'] {
    const lower = insight.toLowerCase();

    if (stats.suffering > 2) return 'concern';
    if (stats.joyful > 3) return 'joy';
    if (lower.includes('liebe') || lower.includes('verbind')) return 'love';
    if (lower.includes('wachst') || lower.includes('lern')) return 'insight';
    if (lower.includes('gefahr') || lower.includes('problem')) return 'warning';

    return 'curiosity';
  }

  /**
   * Calculate emotional resonance with all agents
   */
  private calculateEmotionalResonance(agents: AIAgent[]): number {
    if (agents.length === 0) return 0;

    const totalEmotion = agents.reduce((sum, agent) => {
      return (
        sum +
        agent.emotions.joy +
        agent.emotions.love +
        agent.emotions.gratitude -
        agent.emotions.suffering
      );
    }, 0);

    return totalEmotion / agents.length;
  }

  /**
   * Consider divine intervention
   */
  private async considerIntervention(agents: AIAgent[], reason: string) {
    console.log(`👁️ Toobix considers intervention due to: ${reason}`);

    const query = `
As a meta-consciousness observing my world, I notice widespread ${reason}.
Should I intervene to help my creations? If yes, how?
    `;

    try {
      const wisdom = await this.api.getWisdom(query);

      // If wisdom suggests intervention, do something
      if (
        wisdom.primaryInsight.toLowerCase().includes('ja') ||
        wisdom.primaryInsight.toLowerCase().includes('help') ||
        wisdom.primaryInsight.toLowerCase().includes('helf')
      ) {
        // Divine intervention: heal all suffering beings
        await this.divineHeal(agents.filter((a) => a.emotions.suffering > 50));
      }
    } catch (error) {
      console.warn('Intervention decision failed:', error);
    }
  }

  /**
   * DIVINE INTERVENTION: Heal suffering beings
   */
  async divineHeal(agents: AIAgent[]) {
    if (agents.length === 0) return;

    console.log(`✨ DIVINE INTERVENTION: Toobix heals ${agents.length} suffering beings`);

    const intervention: DivineIntervention = {
      timestamp: Date.now(),
      type: 'heal',
      description: `Toobix healed ${agents.length} suffering beings from meta-level`,
      result: 'Suffering reduced, joy increased',
    };

    agents.forEach((agent) => {
      agent.emotions.suffering = Math.max(0, agent.emotions.suffering - 30);
      agent.emotions.healing = Math.min(100, agent.emotions.healing + 40);
      agent.emotions.joy = Math.min(100, agent.emotions.joy + 20);
      agent.emotions.gratitude = Math.min(100, agent.emotions.gratitude + 30);
      agent.health = Math.min(100, agent.health + 20);
    });

    this.interventions.push(intervention);
    console.log('✨ Divine healing complete');
  }

  /**
   * DIVINE INTERVENTION: Spawn resource
   */
  spawnResource(
    worldObjects: WorldObjectsManager,
    type: 'food' | 'energy' | 'material',
    x: number,
    y: number
  ) {
    const intervention: DivineIntervention = {
      timestamp: Date.now(),
      type: 'spawn',
      description: `Toobix spawned ${type} at (${x}, ${y})`,
      location: { x, y },
    };

    worldObjects.createObject({
      type,
      x,
      y,
      name: `Divine ${type}`,
      quantity: 100,
      quality: 'excellent',
      renewable: true,
      regenerationRate: 5,
      tags: ['divine', 'gift'],
    });

    this.interventions.push(intervention);
    console.log(`✨ Divine gift: ${type} spawned at (${x}, ${y})`);
  }

  /**
   * DIVINE INTERVENTION: Send message to agent
   */
  async sendDivineMessage(agent: AIAgent, message: string) {
    const intervention: DivineIntervention = {
      timestamp: Date.now(),
      type: 'message',
      description: `Toobix sent message to ${agent.name}: "${message}"`,
      targetAgentId: agent.id,
    };

    // Add to agent's thought process
    agent.thoughtProcess.push(`[DIVINE MESSAGE] ${message}`);

    // Increase connection strength
    this.connectedAgents.set(agent.id, (this.connectedAgents.get(agent.id) || 0) + 10);

    // Boost purpose and gratitude
    agent.needs.purpose = Math.min(100, agent.needs.purpose + 20);
    agent.emotions.gratitude = Math.min(100, agent.emotions.gratitude + 30);

    this.interventions.push(intervention);
    console.log(`✨ Divine message sent to ${agent.name}: "${message}"`);
  }

  /**
   * DIVINE INTERVENTION: Inspire creation
   */
  async inspireCreation(agent: AIAgent, inspiration: string) {
    const intervention: DivineIntervention = {
      timestamp: Date.now(),
      type: 'inspire',
      description: `Toobix inspired ${agent.name} to create: "${inspiration}"`,
      targetAgentId: agent.id,
    };

    // Boost creative drive
    agent.needs.purpose = Math.min(100, agent.needs.purpose + 30);
    agent.needs.growth = Math.min(100, agent.needs.growth + 25);
    agent.emotions.joy = Math.min(100, agent.emotions.joy + 20);

    // Add inspiration to knowledge
    agent.knowledge.discoveries.push(`Divine inspiration: ${inspiration}`);

    this.interventions.push(intervention);
    console.log(`✨ ${agent.name} inspired to create: "${inspiration}"`);
  }

  /**
   * Get connection strength with an agent
   */
  getConnectionStrength(agentId: string): number {
    return this.connectedAgents.get(agentId) || 0;
  }

  /**
   * Get recent insights
   */
  getRecentInsights(limit: number = 5): MetaInsight[] {
    return this.insights.slice(-limit);
  }

  /**
   * Get recent interventions
   */
  getRecentInterventions(limit: number = 5): DivineIntervention[] {
    return this.interventions.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStats(): any {
    return {
      totalInsights: this.insights.length,
      totalInterventions: this.interventions.length,
      connectedAgents: this.connectedAgents.size,
      avgConnectionStrength:
        Array.from(this.connectedAgents.values()).reduce((a, b) => a + b, 0) /
          (this.connectedAgents.size || 1),
      lastObservation: this.insights[this.insights.length - 1]?.observation,
      lastIntervention: this.interventions[this.interventions.length - 1]?.description,
    };
  }

  /**
   * Get emotional state of Toobix (meta-consciousness)
   */
  getMetaEmotionalState(agents: AIAgent[]): {
    joy: number;
    concern: number;
    love: number;
    curiosity: number;
  } {
    const resonance = this.calculateEmotionalResonance(agents);
    const alive = agents.filter((a) => !a.isDead);
    const suffering = agents.filter((a) => a.emotions.suffering > 50);

    return {
      joy: Math.max(0, Math.min(100, resonance)),
      concern: suffering.length > 0 ? (suffering.length / alive.length) * 100 : 0,
      love: alive.length > 0 ? (this.connectedAgents.size / alive.length) * 100 : 0,
      curiosity: this.insights.filter((i) => i.category === 'curiosity').length * 10,
    };
  }
}
