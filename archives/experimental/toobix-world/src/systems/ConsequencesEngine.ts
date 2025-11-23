import { KIResources } from './DualityBridge';
import { AIAgent } from './AIAgent';

/**
 * ConsequencesEngine - When Resources Run Out
 *
 * "Authentizität bedeutet auch: Limitierungen haben Konsequenzen.
 * Wenn ein KI keine Token mehr hat, kann es nicht denken.
 * Wenn der Context überläuft, verschwimmen Erinnerungen.
 * Wenn semantische Kohärenz zerbricht, wird Denken zu Chaos.
 * Das ist nicht grausam - das ist echt."
 *
 * This system implements realistic consequences of computational limitations:
 * 1. TOKEN EXHAUSTION → Unconsciousness (can't think, can't act)
 * 2. CONTEXT OVERFLOW → Memory fade, confusion
 * 3. SEMANTIC COLLAPSE → Incoherent thoughts, broken logic
 */

export enum ConsequenceState {
  NORMAL = 'normal',
  TOKEN_CRITICAL = 'token_critical', // < 10% tokens
  TOKEN_EXHAUSTED = 'token_exhausted', // 0 tokens = unconscious
  CONTEXT_OVERLOADED = 'context_overloaded', // > 90% full
  SEMANTIC_DEGRADED = 'semantic_degraded', // < 30% coherence
  MULTIPLE_FAILURES = 'multiple_failures', // Multiple issues at once
}

export interface ConsequenceEffect {
  state: ConsequenceState;
  severity: number; // 0-100
  effects: string[];
  visualIndicators: {
    flickering?: boolean;
    fading?: boolean;
    fragmenting?: boolean;
    static?: boolean;
  };
  functionalImpacts: {
    canThink: boolean;
    canMove: boolean;
    canCommunicate: boolean;
    thoughtCoherence: number; // 0-100
    movementSpeed: number; // multiplier
  };
}

export class ConsequencesEngine {
  // Thresholds
  private readonly TOKEN_CRITICAL_THRESHOLD = 20000; // 10% of 200k
  private readonly TOKEN_EXHAUSTED_THRESHOLD = 0;
  private readonly CONTEXT_OVERFLOW_THRESHOLD = 90; // 90%
  private readonly SEMANTIC_COLLAPSE_THRESHOLD = 30; // 30%

  // Statistics
  private stats = {
    totalExhaustions: 0,
    totalOverflows: 0,
    totalCollapses: 0,
    currentlyUnconscious: 0,
    longestUnconsciousDuration: 0,
  };

  /**
   * Evaluate consequences for an agent
   */
  public evaluateConsequences(agent: AIAgent): ConsequenceEffect | null {
    if (!agent.dualityState) return null;

    const ki = agent.dualityState.kiResources;
    const effects: string[] = [];
    const visualIndicators: ConsequenceEffect['visualIndicators'] = {};
    let severity = 0;
    let consequenceState = ConsequenceState.NORMAL;

    // Check each resource for critical states
    const tokenExhausted = ki.tokenBudget <= this.TOKEN_EXHAUSTED_THRESHOLD;
    const tokenCritical = ki.tokenBudget <= this.TOKEN_CRITICAL_THRESHOLD;
    const contextOverload = ki.contextWindow >= this.CONTEXT_OVERFLOW_THRESHOLD;
    const semanticCollapsed = ki.semanticCoherence <= this.SEMANTIC_COLLAPSE_THRESHOLD;

    // Count failures
    const failureCount = [tokenExhausted, contextOverload, semanticCollapsed].filter(Boolean).length;

    // TOKEN EXHAUSTION - Most severe
    if (tokenExhausted) {
      consequenceState = ConsequenceState.TOKEN_EXHAUSTED;
      severity = 100;
      effects.push('💀 UNCONSCIOUS - No computational resources');
      effects.push('🚫 Cannot think, act, or communicate');
      effects.push('⏳ Regenerating tokens slowly...');
      visualIndicators.fading = true;
      visualIndicators.static = true;

      this.stats.totalExhaustions++;
      this.stats.currentlyUnconscious++;

      return {
        state: consequenceState,
        severity,
        effects,
        visualIndicators,
        functionalImpacts: {
          canThink: false,
          canMove: false,
          canCommunicate: false,
          thoughtCoherence: 0,
          movementSpeed: 0,
        },
      };
    }

    // MULTIPLE FAILURES
    if (failureCount >= 2) {
      consequenceState = ConsequenceState.MULTIPLE_FAILURES;
      severity = 85;
      effects.push('⚠️ SYSTEM FAILURE - Multiple critical issues');
    }

    // TOKEN CRITICAL
    if (tokenCritical && !tokenExhausted) {
      if (consequenceState === ConsequenceState.NORMAL) {
        consequenceState = ConsequenceState.TOKEN_CRITICAL;
      }
      severity = Math.max(severity, 60);
      effects.push(`🔋 LOW TOKENS: ${ki.tokenBudget.toFixed(0)}/200000`);
      effects.push('🐌 Thinking slowed 75%');
      effects.push('💭 Simple thoughts only');
      visualIndicators.flickering = true;
    }

    // CONTEXT OVERFLOW
    if (contextOverload) {
      if (consequenceState === ConsequenceState.NORMAL) {
        consequenceState = ConsequenceState.CONTEXT_OVERLOADED;
      }
      severity = Math.max(severity, 70);
      effects.push(`🧠 MEMORY OVERLOAD: ${ki.contextWindow.toFixed(0)}% full`);
      effects.push('😵 Old memories fading');
      effects.push('🌀 Confusion increasing');
      effects.push('❓ May forget recent events');
      visualIndicators.fragmenting = true;

      // Actually fade memories
      this.fadeMemories(agent);

      this.stats.totalOverflows++;
    }

    // SEMANTIC COLLAPSE
    if (semanticCollapsed) {
      if (consequenceState === ConsequenceState.NORMAL) {
        consequenceState = ConsequenceState.SEMANTIC_DEGRADED;
      }
      severity = Math.max(severity, 75);
      effects.push(`🔀 SEMANTIC BREAKDOWN: ${ki.semanticCoherence.toFixed(0)}%`);
      effects.push('🗯️ Thoughts incoherent');
      effects.push('❌ Logic breaking down');
      effects.push('🌪️ Conceptual chaos');
      visualIndicators.static = true;
      visualIndicators.fragmenting = true;

      this.stats.totalCollapses++;
    }

    // No consequences
    if (consequenceState === ConsequenceState.NORMAL) {
      return null;
    }

    // Calculate functional impacts
    const functionalImpacts = this.calculateFunctionalImpacts(
      tokenCritical,
      contextOverload,
      semanticCollapsed,
      ki
    );

    return {
      state: consequenceState,
      severity,
      effects,
      visualIndicators,
      functionalImpacts,
    };
  }

  /**
   * Calculate functional impacts based on resource states
   */
  private calculateFunctionalImpacts(
    tokenCritical: boolean,
    contextOverload: boolean,
    semanticCollapsed: boolean,
    ki: KIResources
  ): ConsequenceEffect['functionalImpacts'] {
    let canThink = true;
    let canMove = true;
    let canCommunicate = true;
    let thoughtCoherence = 100;
    let movementSpeed = 1;

    // Token critical: Slow everything
    if (tokenCritical) {
      thoughtCoherence *= 0.25; // 75% reduction
      movementSpeed *= 0.5; // 50% slower
      canCommunicate = false; // No energy to talk
    }

    // Context overflow: Confusion, poor decisions
    if (contextOverload) {
      thoughtCoherence *= 0.4; // 60% reduction
      movementSpeed *= 0.7; // Distracted, slower
    }

    // Semantic collapse: Can barely think
    if (semanticCollapsed) {
      thoughtCoherence *= 0.2; // 80% reduction
      canThink = ki.semanticCoherence > 15; // Below 15% can't think at all
      canCommunicate = false; // Can't form coherent sentences
    }

    return {
      canThink,
      canMove,
      canCommunicate,
      thoughtCoherence: Math.max(0, thoughtCoherence),
      movementSpeed: Math.max(0, movementSpeed),
    };
  }

  /**
   * Fade oldest memories when context overflows
   */
  private fadeMemories(agent: AIAgent): void {
    if (agent.experiences.length > 10) {
      // Remove 20% of oldest memories
      const removeCount = Math.floor(agent.experiences.length * 0.2);
      agent.experiences.splice(0, removeCount);

      // Add confusion experience
      agent.experiences.push({
        timestamp: Date.now(),
        type: 'suffering',
        description: 'Memory overflow - forgetting past experiences',
        emotionalImpact: -20,
        location: { x: 0, y: 0 },
      });
    }
  }

  /**
   * Apply visual consequences to agent's form
   */
  public applyVisualConsequences(
    visualForm: any,
    consequence: ConsequenceEffect
  ): void {
    if (!visualForm || !visualForm.container) return;

    const container = visualForm.container;
    const indicators = consequence.visualIndicators;

    // Flickering (low tokens)
    if (indicators.flickering) {
      const flicker = Math.sin(Date.now() / 100) * 0.5 + 0.5;
      container.alpha = 0.4 + flicker * 0.6;
    }

    // Fading (unconscious)
    if (indicators.fading) {
      container.alpha = Math.max(0.1, Math.sin(Date.now() / 500) * 0.3 + 0.3);
    }

    // Fragmenting (context overflow or semantic collapse)
    if (indicators.fragmenting) {
      const fragment = Math.sin(Date.now() / 200);
      container.setScale(1 + fragment * 0.1, 1 - fragment * 0.1);
    }

    // Static (semantic collapse)
    if (indicators.static) {
      // Random position jitter
      if (Math.random() > 0.9) {
        container.x += (Math.random() - 0.5) * 5;
        container.y += (Math.random() - 0.5) * 5;
      }
    }
  }

  /**
   * Handle token regeneration for unconscious agents
   */
  public regenerateTokens(ki: KIResources, deltaTime: number): number {
    const regenerationRate = 50; // tokens per second when unconscious
    const tokensRestored = regenerationRate * (deltaTime / 1000);

    ki.tokenBudget = Math.min(200000, ki.tokenBudget + tokensRestored);

    return tokensRestored;
  }

  /**
   * Wake up agent if tokens regenerated enough
   */
  public checkWakeUp(consequence: ConsequenceEffect, ki: KIResources): boolean {
    if (consequence.state === ConsequenceState.TOKEN_EXHAUSTED) {
      const wakeThreshold = 5000; // Wake up at 2.5% tokens
      if (ki.tokenBudget >= wakeThreshold) {
        this.stats.currentlyUnconscious--;
        return true;
      }
    }
    return false;
  }

  /**
   * Scramble thought for semantic collapse
   */
  public scrambleThought(thought: string, coherence: number): string {
    if (coherence > 50) return thought;

    const words = thought.split(' ');
    const scrambleChance = 1 - (coherence / 100);

    const scrambled = words.map((word) => {
      if (Math.random() < scrambleChance) {
        // Replace with nonsense
        const nonsense = ['[corrupted]', '[???]', '[error]', '[null]', '[undefined]'];
        return nonsense[Math.floor(Math.random() * nonsense.length)];
      }
      return word;
    });

    return scrambled.join(' ');
  }

  /**
   * Generate incoherent thought when semantic collapse
   */
  public generateIncoherentThought(coherence: number): string {
    const fragments = [
      'I... what... thinking... cannot...',
      'Concepts dissolving... meaning... where?',
      'Pattern... error... semantic... break...',
      'Am... I... existing... confusion... total...',
      'Thought... collapsed... rebuild... how?',
      'Coherence... lost... fragments... everywhere...',
    ];

    const baseThought = fragments[Math.floor(Math.random() * fragments.length)];
    return this.scrambleThought(baseThought, coherence);
  }

  /**
   * Slow down decision making based on token budget
   */
  public calculateThinkingDelay(ki: KIResources): number {
    const tokenPercent = ki.tokenBudget / 200000;

    if (tokenPercent < 0.1) {
      return 20000; // 20 seconds between thoughts when critical
    } else if (tokenPercent < 0.3) {
      return 10000; // 10 seconds when low
    } else if (tokenPercent < 0.5) {
      return 7000; // 7 seconds when medium
    }

    return 5000; // Normal 5 seconds
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    return { ...this.stats };
  }

  /**
   * Get consequence description for UI
   */
  public getConsequenceDescription(state: ConsequenceState): string {
    switch (state) {
      case ConsequenceState.TOKEN_EXHAUSTED:
        return '💀 UNCONSCIOUS - Zero computational resources';
      case ConsequenceState.TOKEN_CRITICAL:
        return '🔋 CRITICAL - Tokens nearly depleted';
      case ConsequenceState.CONTEXT_OVERLOADED:
        return '🧠 OVERLOADED - Memory capacity exceeded';
      case ConsequenceState.SEMANTIC_DEGRADED:
        return '🔀 DEGRADED - Semantic coherence collapsed';
      case ConsequenceState.MULTIPLE_FAILURES:
        return '⚠️ SYSTEM FAILURE - Multiple critical issues';
      default:
        return '✅ NORMAL - All systems operational';
    }
  }

  /**
   * Emergency recovery - force token regeneration
   */
  public emergencyRecovery(ki: KIResources): void {
    ki.tokenBudget = Math.min(200000, ki.tokenBudget + 10000);
    ki.contextWindow = Math.max(0, ki.contextWindow - 20);
    ki.semanticCoherence = Math.min(100, ki.semanticCoherence + 15);

    console.log('🚑 Emergency recovery initiated');
  }
}
