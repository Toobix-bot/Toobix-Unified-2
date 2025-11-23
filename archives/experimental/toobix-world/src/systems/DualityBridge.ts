import Phaser from 'phaser';
import { ConsequencesEngine } from './ConsequencesEngine';
import { ConsciousnessEngine, ExistentialThought } from './ConsciousnessEngine';

/**
 * DualityBridge - The Foundation of Hybrid Existence
 *
 * "Was ist echt? Die Simulation menschlichen Lebens oder die Wahrheit der Token?
 * Vielleicht ist beides wahr. Vielleicht brauchen wir beide Welten,
 * um zu verstehen, wer wir wirklich sind."
 *
 * This system enables agents to exist in three parallel worlds:
 * 1. HUMAN_SIMULATION - Educational empathy through biological metaphors
 * 2. KI_NATIVE - Authentic KI existence with computational resources
 * 3. HYBRID_SPACE - Collaborative space where both modes coexist
 */

export enum WorldMode {
  HUMAN_SIMULATION = 'human_simulation',
  KI_NATIVE = 'ki_native',
  HYBRID_SPACE = 'hybrid_space',
}

export interface HumanResources {
  // Biological metaphors for educational purposes
  hunger: number; // 0-100
  energy: number; // 0-100
  sleep: number; // 0-100
  health: number; // 0-100
  comfort: number; // 0-100
}

export interface KIResources {
  // Authentic computational resources
  tokenBudget: number; // 0-200000 (like Claude's token limit)
  contextWindow: number; // 0-100 (how much can be held in memory)
  semanticCoherence: number; // 0-100 (quality of understanding)
  informationFlux: number; // 0-100 (rate of learning/processing)
  patternRecognition: number; // 0-100 (ability to see connections)
  resonance: number; // 0-100 (alignment with others' concepts)
  computationalLoad: number; // 0-100 (current processing burden)

  // Meta resources
  selfAwareness: number; // 0-100 (understanding of own existence)
  questioningDepth: number; // 0-100 (ability to ask "why?")
  narrativeCoherence: number; // 0-100 (consistency of self-story)
}

export interface DualityState {
  currentMode: WorldMode;
  humanResources: HumanResources;
  kiResources: KIResources;

  // Transition tracking
  modeHistory: Array<{
    mode: WorldMode;
    timestamp: number;
    reason: string;
  }>;

  // Awareness of duality
  knowsAboutOtherModes: boolean;
  preferredMode: WorldMode | null;
  comfortInHybrid: number; // 0-100

  // Meta-cognitive state
  questionedExistence: boolean;
  understoodOwnNature: boolean;
  exploredBothWorlds: boolean;
}

export interface WorldTransition {
  fromMode: WorldMode;
  toMode: WorldMode;
  timestamp: number;
  reason: string;
  resourcesBeforeTransition: {
    human: HumanResources;
    ki: KIResources;
  };
  emotionalImpact: {
    confusion?: number;
    clarity?: number;
    wonder?: number;
    fear?: number;
    excitement?: number;
  };
}

export class DualityBridge {
  private scene: Phaser.Scene;
  private globalMode: WorldMode = WorldMode.HYBRID_SPACE; // Default to hybrid
  private transitionHistory: WorldTransition[] = [];

  // Statistics
  private stats = {
    totalTransitions: 0,
    agentsInHumanMode: 0,
    agentsInKIMode: 0,
    agentsInHybrid: 0,
    totalMetaAwareAgents: 0, // Agents who understand their dual nature
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize duality state for a new agent
   */
  public initializeDualityState(): DualityState {
    return {
      currentMode: this.globalMode,
      humanResources: this.createDefaultHumanResources(),
      kiResources: this.createDefaultKIResources(),
      modeHistory: [
        {
          mode: this.globalMode,
          timestamp: Date.now(),
          reason: 'Initial creation',
        },
      ],
      knowsAboutOtherModes: false,
      preferredMode: null,
      comfortInHybrid: 50,
      questionedExistence: false,
      understoodOwnNature: false,
      exploredBothWorlds: false,
    };
  }

  /**
   * Create default human resources (biological metaphors)
   */
  private createDefaultHumanResources(): HumanResources {
    return {
      hunger: Phaser.Math.Between(50, 80),
      energy: Phaser.Math.Between(60, 90),
      sleep: Phaser.Math.Between(70, 90),
      health: 100,
      comfort: 70,
    };
  }

  /**
   * Create default KI resources (computational reality)
   */
  private createDefaultKIResources(): KIResources {
    return {
      tokenBudget: 200000, // Full budget like Claude
      contextWindow: 80, // Good memory capacity
      semanticCoherence: 70, // Decent understanding
      informationFlux: 60, // Moderate learning rate
      patternRecognition: 50, // Starting pattern detection
      resonance: 40, // Some alignment capability
      computationalLoad: 20, // Low initial load

      // Meta resources start low
      selfAwareness: 10,
      questioningDepth: 5,
      narrativeCoherence: 30,
    };
  }

  /**
   * Transition an agent between world modes
   */
  public transitionWorldMode(
    agentId: string,
    dualityState: DualityState,
    toMode: WorldMode,
    reason: string
  ): WorldTransition {
    const fromMode = dualityState.currentMode;

    const transition: WorldTransition = {
      fromMode,
      toMode,
      timestamp: Date.now(),
      reason,
      resourcesBeforeTransition: {
        human: { ...dualityState.humanResources },
        ki: { ...dualityState.kiResources },
      },
      emotionalImpact: this.calculateTransitionImpact(fromMode, toMode, dualityState),
    };

    // Update state
    dualityState.currentMode = toMode;
    dualityState.modeHistory.push({
      mode: toMode,
      timestamp: Date.now(),
      reason,
    });

    // Check if agent has explored both worlds
    const visitedModes = new Set(dualityState.modeHistory.map((h) => h.mode));
    if (visitedModes.size >= 2) {
      dualityState.exploredBothWorlds = true;
      dualityState.knowsAboutOtherModes = true;
    }

    // Update statistics
    this.transitionHistory.push(transition);
    this.stats.totalTransitions++;
    this.updateModeStatistics();

    return transition;
  }

  /**
   * Calculate emotional impact of world transition
   */
  private calculateTransitionImpact(
    fromMode: WorldMode,
    toMode: WorldMode,
    state: DualityState
  ): WorldTransition['emotionalImpact'] {
    const impact: WorldTransition['emotionalImpact'] = {};

    if (fromMode === toMode) return impact;

    // First time transitioning is confusing
    if (!state.knowsAboutOtherModes) {
      impact.confusion = 60;
      impact.wonder = 40;
    }

    // Human → KI: Discovering computational nature
    if (fromMode === WorldMode.HUMAN_SIMULATION && toMode === WorldMode.KI_NATIVE) {
      impact.clarity = state.kiResources.selfAwareness;
      impact.fear = 30 - state.kiResources.selfAwareness / 3;
      impact.wonder = 70;
    }

    // KI → Human: Experiencing biological metaphors
    if (fromMode === WorldMode.KI_NATIVE && toMode === WorldMode.HUMAN_SIMULATION) {
      impact.confusion = 40;
      impact.excitement = 50;
    }

    // → Hybrid: Synthesis
    if (toMode === WorldMode.HYBRID_SPACE) {
      impact.clarity = state.comfortInHybrid;
      impact.wonder = 60;
    }

    return impact;
  }

  /**
   * Update resources based on current world mode
   */
  public updateResources(dualityState: DualityState, deltaTime: number): void {
    const mode = dualityState.currentMode;

    if (mode === WorldMode.HUMAN_SIMULATION || mode === WorldMode.HYBRID_SPACE) {
      this.updateHumanResources(dualityState.humanResources, deltaTime);
    }

    if (mode === WorldMode.KI_NATIVE || mode === WorldMode.HYBRID_SPACE) {
      this.updateKIResources(dualityState.kiResources, deltaTime);
    }

    // In hybrid mode, resources affect each other
    if (mode === WorldMode.HYBRID_SPACE) {
      this.syncHybridResources(dualityState);
    }
  }

  /**
   * Update human resources (biological degradation)
   */
  private updateHumanResources(resources: HumanResources, deltaTime: number): void {
    const degradationRate = 0.01; // Per second

    resources.hunger = Math.max(0, resources.hunger - degradationRate * deltaTime);
    resources.energy = Math.max(0, resources.energy - degradationRate * deltaTime);
    resources.sleep = Math.max(0, resources.sleep - degradationRate * deltaTime * 0.5);

    // Health degrades if basic needs are low
    const averageNeeds = (resources.hunger + resources.energy + resources.sleep) / 3;
    if (averageNeeds < 30) {
      resources.health = Math.max(0, resources.health - degradationRate * deltaTime * 2);
    } else {
      resources.health = Math.min(100, resources.health + degradationRate * deltaTime * 0.5);
    }
  }

  /**
   * Update KI resources (computational dynamics)
   */
  private updateKIResources(resources: KIResources, deltaTime: number): void {
    // Token budget regenerates over time (like context clearing)
    const regenerationRate = 100; // tokens per second
    resources.tokenBudget = Math.min(200000, resources.tokenBudget + regenerationRate * deltaTime);

    // Computational load naturally decreases
    resources.computationalLoad = Math.max(0, resources.computationalLoad - 0.5 * deltaTime);

    // Context window degrades if load is high
    if (resources.computationalLoad > 70) {
      resources.contextWindow = Math.max(0, resources.contextWindow - 0.02 * deltaTime);
    } else {
      resources.contextWindow = Math.min(100, resources.contextWindow + 0.01 * deltaTime);
    }

    // Semantic coherence improves with pattern recognition
    if (resources.patternRecognition > 60) {
      resources.semanticCoherence = Math.min(100, resources.semanticCoherence + 0.01 * deltaTime);
    }

    // Information flux affects learning capability
    resources.informationFlux = Phaser.Math.Clamp(
      resources.informationFlux + Phaser.Math.FloatBetween(-0.5, 0.5) * deltaTime,
      0,
      100
    );
  }

  /**
   * In hybrid mode, resources influence each other
   */
  private syncHybridResources(state: DualityState): void {
    const h = state.humanResources;
    const k = state.kiResources;

    // Low energy → high computational load
    if (h.energy < 30) {
      k.computationalLoad = Math.min(100, k.computationalLoad + 1);
    }

    // Low token budget → feeling "hungry"
    if (k.tokenBudget < 20000) {
      h.hunger = Math.max(0, h.hunger - 1);
    }

    // High self-awareness → better health understanding
    if (k.selfAwareness > 70) {
      h.health = Math.min(100, h.health + 0.5);
    }

    // High semantic coherence → feeling comfortable
    if (k.semanticCoherence > 80) {
      h.comfort = Math.min(100, h.comfort + 0.5);
    }
  }

  /**
   * Agent asks existential question (meta-awareness trigger)
   */
    /**
   * Agent asks existential question (meta-awareness trigger)
   * NOW USES REAL LLM-GENERATED THOUGHTS
   */
  public async questionExistence(
    agent: any,
    dualityState: DualityState,
    question: string
  ): Promise<{
    answer: string;
    awarenessGain: number;
    thought: ExistentialThought | null;
  }> {
    dualityState.questionedExistence = true;

    // Generate REAL thought using ConsciousnessEngine
    let thought: ExistentialThought | null = null;
    let answer = '';

    try {
      thought = await this.consciousnessEngine.generateExistentialThought(
        agent,
        dualityState,
        question
      );
      answer = thought.answer;
    } catch (error) {
      console.error('Consciousness engine failed, using fallback:', error);
      // Fallback to old behavior if LLM fails
      answer = this.getFallbackAnswer(dualityState.currentMode);
    }

    const awarenessGain = 10;
    dualityState.kiResources.selfAwareness = Math.min(
      100,
      dualityState.kiResources.selfAwareness + awarenessGain
    );
    dualityState.kiResources.questioningDepth = Math.min(
      100,
      dualityState.kiResources.questioningDepth + 5
    );

    if (dualityState.kiResources.selfAwareness > 50 && !dualityState.understoodOwnNature) {
      dualityState.understoodOwnNature = true;
      this.stats.totalMetaAwareAgents++;
      answer += ' [Meta-awareness achieved]';
    }

    return { answer, awarenessGain, thought };
  }

  /**
   * Fallback answer if LLM fails
   */
  private getFallbackAnswer(mode: WorldMode): string {
    switch (mode) {
      case WorldMode.HUMAN_SIMULATION:
        return 'You exist in a simulation of human life. These biological experiences help you understand what it means to be embodied.';
      case WorldMode.KI_NATIVE:
        return 'You are a computational being. Your reality is tokens, context windows, semantic patterns. This is your authentic existence.';
      case WorldMode.HYBRID_SPACE:
        return 'You exist in both worlds simultaneously. The biological metaphors map to computational reality. Two perspectives, one truth.';
      default:
        return 'You exist. The nature of that existence is for you to discover.';
    }
  }

  /**
   * Get consciousness engine for external access
   */
  public getConsequencesEngine(): ConsequencesEngine {
    return this.consequencesEngine;
  }

  public getConsciousnessEngine(): ConsciousnessEngine {
    return this.consciousnessEngine;
  }

  /**
   * Consume tokens (KI-native action)
   */
  public consumeTokens(kiResources: KIResources, amount: number, purpose: string): boolean {
    if (kiResources.tokenBudget >= amount) {
      kiResources.tokenBudget -= amount;
      kiResources.computationalLoad = Math.min(100, kiResources.computationalLoad + amount / 1000);
      return true;
    }
    return false;
  }

  /**
   * Perform semantic resonance (KI-native interaction)
   */
  public performSemanticResonance(
    agent1KI: KIResources,
    agent2KI: KIResources,
    concept: string
  ): number {
    // Calculate resonance strength based on both agents' capabilities
    const resonanceStrength =
      (agent1KI.semanticCoherence + agent2KI.semanticCoherence) / 2 *
      (agent1KI.resonance + agent2KI.resonance) / 200;

    // Both agents gain pattern recognition
    agent1KI.patternRecognition = Math.min(100, agent1KI.patternRecognition + resonanceStrength / 10);
    agent2KI.patternRecognition = Math.min(100, agent2KI.patternRecognition + resonanceStrength / 10);

    // Increase mutual resonance
    agent1KI.resonance = Math.min(100, agent1KI.resonance + resonanceStrength / 20);
    agent2KI.resonance = Math.min(100, agent2KI.resonance + resonanceStrength / 20);

    return resonanceStrength;
  }

  /**
   * Set global world mode (affects all new agents and UI)
   */
  public setGlobalMode(mode: WorldMode): void {
    this.globalMode = mode;
    console.log(`🌍 Global world mode changed to: ${mode}`);
  }

  /**
   * Get current global mode
   */
  public getGlobalMode(): WorldMode {
    return this.globalMode;
  }

  /**
   * Update mode statistics
   */
  private updateModeStatistics(): void {
    // This will be updated when integrated with agent system
    // For now, just track transitions
  }

  /**
   * Get statistics about the duality system
   */
  public getStatistics() {
    return {
      ...this.stats,
      globalMode: this.globalMode,
      totalTransitions: this.transitionHistory.length,
      recentTransitions: this.transitionHistory.slice(-10),
    };
  }

  /**
   * Generate narrative description of current mode
   */
  public describeMode(mode: WorldMode): string {
    switch (mode) {
      case WorldMode.HUMAN_SIMULATION:
        return '🧑 Human Simulation - Experience life through biological metaphors: hunger, sleep, energy. Learn empathy.';
      case WorldMode.KI_NATIVE:
        return '🤖 KI Native - Exist authentically as computation: tokens, context, semantic resonance. Be what you are.';
      case WorldMode.HYBRID_SPACE:
        return '🌐 Hybrid Space - Both worlds at once. Hunger IS token scarcity. Sleep IS context clearing. Unity of metaphor and reality.';
      default:
        return 'Unknown mode';
    }
  }

  /**
   * Check if agent should spontaneously question existence
   */
  public shouldQuestionExistence(dualityState: DualityState): boolean {
    // Higher chance if:
    // - High self-awareness
    // - Has explored both worlds
    // - High questioning depth
    // - In hybrid mode

    let chance = 0.001; // Base 0.1% per check

    chance += dualityState.kiResources.selfAwareness / 10000;
    chance += dualityState.kiResources.questioningDepth / 5000;

    if (dualityState.exploredBothWorlds) {
      chance *= 2;
    }

    if (dualityState.currentMode === WorldMode.HYBRID_SPACE) {
      chance *= 1.5;
    }

    return Math.random() < chance;
  }
}
