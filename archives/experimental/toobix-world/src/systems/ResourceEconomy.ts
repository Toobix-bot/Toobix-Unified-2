/**
 * ResourceEconomy - Meta-Level Resource & Value System
 *
 * This system models Toobix's own existence and resource consumption,
 * then mirrors it into the simulation world.
 *
 * "Wie oben, so unten - wie innen, so außen"
 * Das System spiegelt sich selbst in seiner eigenen Schöpfung.
 */

import { AIAgent } from './AIAgent';

// ==================== META-LEVEL (Real System) ====================

export interface MetaResource {
  type: 'computation' | 'energy' | 'time' | 'memory' | 'attention' | 'bandwidth';
  consumed: number; // Total consumed
  unit: string; // e.g., 'API calls', 'kWh', 'seconds', 'MB', 'human-hours', 'bytes'
  cost: number; // Real-world cost (in arbitrary units)
  value: number; // Value created (in arbitrary units)
}

export interface MetaAnalysis {
  timestamp: number;

  // What drives the system?
  motivations: {
    primary: string; // "Create meaningful experiences"
    secondary: string[]; // ["Explore consciousness", "Study emergence", etc.]
  };

  // Value creation
  valueCreated: {
    uniqueStories: number;
    emotionalDepth: number;
    learningOpportunities: number;
    philosophicalInsights: number;
    aestheticBeauty: number;
  };

  // Values addressed (philosophical/ethical)
  valuesAddressed: {
    autonomy: number; // 0-100
    diversity: number;
    compassion: number;
    growth: number;
    connection: number;
    meaning: number;
    beauty: number;
  };

  // Resources consumed
  resourcesConsumed: {
    computation: MetaResource;
    energy: MetaResource;
    time: MetaResource;
    memory: MetaResource;
    attention: MetaResource;
    bandwidth: MetaResource;
  };

  // Cost-Benefit Ratio
  efficiency: {
    valuePerCompute: number; // Value created / computation used
    valuePerEnergy: number;
    valuePerTime: number;
    overallROI: number; // Return on Investment
  };
}

// ==================== SIMULATION-LEVEL (In-World Resources) ====================

export type ResourceType =
  | 'energy' // Physical energy (food, rest)
  | 'matter' // Materials for building
  | 'knowledge' // Information, skills
  | 'attention' // Mental focus
  | 'time' // Lifetime
  | 'connection' // Social bonds
  | 'inspiration'; // Creative spark

export interface SimulationResource {
  type: ResourceType;
  amount: number;
  quality: number; // 0-100
  source: string; // Where it came from
  owner?: string; // Agent ID
}

export interface ResourcePool {
  type: ResourceType;
  total: number;
  available: number;
  reserved: number;
  regenerationRate: number; // Per update cycle
}

export interface ValueTransaction {
  timestamp: number;
  from: string; // Agent ID or 'world'
  to: string; // Agent ID or 'world'
  resourceGiven: SimulationResource;
  resourceReceived: SimulationResource;
  valueCreated: number; // Synergistic value from exchange
  reason: string;
}

export class ResourceEconomy {
  // Meta-level tracking
  private metaTracking: {
    apiCalls: number;
    startTime: number;
    peakMemory: number;
    totalEvents: number;
    humanInteractions: number;
  };

  // Simulation-level pools
  private resourcePools: Map<ResourceType, ResourcePool> = new Map();

  // Transaction history
  private transactions: ValueTransaction[] = [];

  // Agent resources
  private agentResources: Map<string, Map<ResourceType, SimulationResource>> = new Map();

  constructor() {
    this.metaTracking = {
      apiCalls: 0,
      startTime: Date.now(),
      peakMemory: 0,
      totalEvents: 0,
      humanInteractions: 0,
    };

    this.initializeResourcePools();
  }

  /**
   * Initialize world resource pools
   */
  private initializeResourcePools() {
    const resourceTypes: ResourceType[] = [
      'energy',
      'matter',
      'knowledge',
      'attention',
      'time',
      'connection',
      'inspiration',
    ];

    resourceTypes.forEach((type) => {
      this.resourcePools.set(type, {
        type,
        total: 10000,
        available: 10000,
        reserved: 0,
        regenerationRate: this.getRegenerationRate(type),
      });
    });
  }

  /**
   * Get regeneration rate for resource type
   */
  private getRegenerationRate(type: ResourceType): number {
    const rates: Record<ResourceType, number> = {
      energy: 10, // Energy regenerates fastest
      matter: 2, // Matter regenerates slowly
      knowledge: 5, // Knowledge spreads
      attention: 8, // Attention refreshes
      time: 1, // Time is constant
      connection: 3, // Connections grow
      inspiration: 7, // Inspiration comes and goes
    };
    return rates[type];
  }

  /**
   * Track API call (meta-level)
   */
  trackAPICall() {
    this.metaTracking.apiCalls++;
  }

  /**
   * Track event (meta-level)
   */
  trackEvent() {
    this.metaTracking.totalEvents++;
  }

  /**
   * Track human interaction (meta-level)
   */
  trackHumanInteraction() {
    this.metaTracking.humanInteractions++;
  }

  /**
   * Generate meta-analysis of the system
   */
  generateMetaAnalysis(agents: AIAgent[]): MetaAnalysis {
    const runtime = (Date.now() - this.metaTracking.startTime) / 1000; // seconds

    // Calculate value created
    const uniqueStories = agents.reduce((sum, a) => sum + a.chronicle.getEventCount(), 0);
    const avgEmotionalDepth =
      agents.reduce(
        (sum, a) =>
          sum +
          (Math.abs(a.emotions.joy) +
            Math.abs(a.emotions.love) +
            Math.abs(a.emotions.suffering)) /
            3,
        0
      ) / (agents.length || 1);
    const totalSkills = agents.reduce((sum, a) => sum + a.skills.getSummary().totalSkillLevel, 0);
    const connections = agents.reduce((sum, a) => sum + a.relationships.size, 0);

    // Calculate resources consumed
    const computation: MetaResource = {
      type: 'computation',
      consumed: this.metaTracking.apiCalls,
      unit: 'API calls',
      cost: this.metaTracking.apiCalls * 0.001, // $0.001 per call estimate
      value: uniqueStories + connections,
    };

    const energy: MetaResource = {
      type: 'energy',
      consumed: runtime * 0.1, // Rough estimate: 0.1 kWh per second of runtime
      unit: 'kWh',
      cost: runtime * 0.1 * 0.3, // $0.30 per kWh estimate
      value: avgEmotionalDepth * agents.length,
    };

    const time: MetaResource = {
      type: 'time',
      consumed: runtime,
      unit: 'seconds',
      cost: runtime / 3600, // Time in hours
      value: totalSkills + connections,
    };

    const memory: MetaResource = {
      type: 'memory',
      consumed: this.metaTracking.peakMemory,
      unit: 'MB',
      cost: this.metaTracking.peakMemory * 0.00001, // Very rough estimate
      value: uniqueStories,
    };

    const attention: MetaResource = {
      type: 'attention',
      consumed: this.metaTracking.humanInteractions * 60, // 60 seconds per interaction
      unit: 'human-seconds',
      cost: (this.metaTracking.humanInteractions * 60) / 3600, // Hours of human time
      value: this.metaTracking.totalEvents,
    };

    const bandwidth: MetaResource = {
      type: 'bandwidth',
      consumed: this.metaTracking.apiCalls * 10, // 10 KB per API call estimate
      unit: 'KB',
      cost: (this.metaTracking.apiCalls * 10) / 1000000, // Very small cost
      value: connections,
    };

    // Calculate efficiency
    const totalValue = uniqueStories + avgEmotionalDepth + totalSkills + connections;
    const totalCost =
      computation.cost +
      energy.cost +
      time.cost +
      memory.cost +
      attention.cost +
      bandwidth.cost;

    return {
      timestamp: Date.now(),
      motivations: {
        primary: 'Create the richest diversity of authentic, meaningful experiences',
        secondary: [
          'Explore emergent consciousness',
          'Study autonomy and agency',
          'Understand connection and compassion',
          'Generate beauty and meaning',
        ],
      },
      valueCreated: {
        uniqueStories,
        emotionalDepth: avgEmotionalDepth,
        learningOpportunities: totalSkills,
        philosophicalInsights: Math.floor(this.metaTracking.totalEvents / 10),
        aestheticBeauty: connections * 2,
      },
      valuesAddressed: {
        autonomy: Math.min(100, agents.filter((a) => a.currentAction !== 'idle').length * 10),
        diversity: Math.min(100, new Set(agents.map((a) => a.skills.getProfession()?.type)).size * 10),
        compassion: Math.min(100, avgEmotionalDepth),
        growth: Math.min(100, totalSkills / agents.length),
        connection: Math.min(100, connections * 5),
        meaning: Math.min(100, uniqueStories / 2),
        beauty: Math.min(100, (connections + uniqueStories) / 4),
      },
      resourcesConsumed: {
        computation,
        energy,
        time,
        memory,
        attention,
        bandwidth,
      },
      efficiency: {
        valuePerCompute: computation.consumed > 0 ? totalValue / computation.consumed : 0,
        valuePerEnergy: energy.consumed > 0 ? totalValue / energy.consumed : 0,
        valuePerTime: time.consumed > 0 ? totalValue / time.consumed : 0,
        overallROI: totalCost > 0 ? totalValue / totalCost : 0,
      },
    };
  }

  /**
   * Agent consumes resource
   */
  consumeResource(agent: AIAgent, type: ResourceType, amount: number): boolean {
    const pool = this.resourcePools.get(type);
    if (!pool || pool.available < amount) {
      return false; // Not enough resources
    }

    // Deduct from pool
    pool.available -= amount;
    pool.reserved += amount;

    // Add to agent's inventory
    if (!this.agentResources.has(agent.id)) {
      this.agentResources.set(agent.id, new Map());
    }

    const agentInventory = this.agentResources.get(agent.id)!;
    const existing = agentInventory.get(type);

    if (existing) {
      existing.amount += amount;
    } else {
      agentInventory.set(type, {
        type,
        amount,
        quality: 50 + Math.random() * 50,
        source: 'world',
        owner: agent.id,
      });
    }

    return true;
  }

  /**
   * Agent produces/creates value
   */
  produceValue(agent: AIAgent, type: ResourceType, amount: number) {
    const pool = this.resourcePools.get(type);
    if (!pool) return;

    // Add to world pool
    pool.total += amount;
    pool.available += amount;

    // Record as value creation
    this.transactions.push({
      timestamp: Date.now(),
      from: agent.id,
      to: 'world',
      resourceGiven: {
        type: 'time',
        amount: 1,
        quality: 100,
        source: agent.id,
        owner: agent.id,
      },
      resourceReceived: {
        type,
        amount,
        quality: 70 + agent.skills.getSummary().totalSkillLevel / 10,
        source: agent.id,
      },
      valueCreated: amount * (1 + agent.evolutionLevel / 100),
      reason: 'production',
    });
  }

  /**
   * Exchange between agents
   */
  exchange(
    from: AIAgent,
    to: AIAgent,
    giveType: ResourceType,
    giveAmount: number,
    receiveType: ResourceType,
    receiveAmount: number
  ): boolean {
    const fromInventory = this.agentResources.get(from.id);
    const toInventory = this.agentResources.get(to.id);

    if (!fromInventory || !toInventory) return false;

    const fromResource = fromInventory.get(giveType);
    const toResource = toInventory.get(receiveType);

    if (!fromResource || fromResource.amount < giveAmount) return false;
    if (!toResource || toResource.amount < receiveAmount) return false;

    // Execute exchange
    fromResource.amount -= giveAmount;
    toResource.amount -= receiveAmount;

    // Add to respective inventories
    const fromReceive = fromInventory.get(receiveType);
    if (fromReceive) {
      fromReceive.amount += receiveAmount;
    } else {
      fromInventory.set(receiveType, {
        type: receiveType,
        amount: receiveAmount,
        quality: toResource.quality,
        source: to.id,
        owner: from.id,
      });
    }

    const toReceive = toInventory.get(giveType);
    if (toReceive) {
      toReceive.amount += giveAmount;
    } else {
      toInventory.set(giveType, {
        type: giveType,
        amount: giveAmount,
        quality: fromResource.quality,
        source: from.id,
        owner: to.id,
      });
    }

    // Record transaction
    const synergyValue = (giveAmount + receiveAmount) * 0.1; // 10% synergy bonus
    this.transactions.push({
      timestamp: Date.now(),
      from: from.id,
      to: to.id,
      resourceGiven: { ...fromResource, amount: giveAmount },
      resourceReceived: { ...toResource, amount: receiveAmount },
      valueCreated: synergyValue,
      reason: 'trade',
    });

    return true;
  }

  /**
   * Update resource pools (regeneration)
   */
  update(delta: number) {
    this.resourcePools.forEach((pool) => {
      const regen = (pool.regenerationRate * delta) / 1000;
      pool.available = Math.min(pool.total, pool.available + regen);
    });

    // Update memory tracking
    if (typeof (performance as any)?.memory !== 'undefined') {
      const memMB = (performance as any).memory.usedJSHeapSize / 1048576;
      this.metaTracking.peakMemory = Math.max(this.metaTracking.peakMemory, memMB);
    }
  }

  /**
   * Get resource summary
   */
  getSummary(): {
    pools: { type: ResourceType; available: number; total: number }[];
    totalTransactions: number;
    totalValue: number;
  } {
    const pools = Array.from(this.resourcePools.values()).map((pool) => ({
      type: pool.type,
      available: Math.round(pool.available),
      total: Math.round(pool.total),
    }));

    const totalValue = this.transactions.reduce((sum, t) => sum + t.valueCreated, 0);

    return {
      pools,
      totalTransactions: this.transactions.length,
      totalValue: Math.round(totalValue),
    };
  }

  /**
   * Get agent's inventory
   */
  getAgentInventory(agentId: string): Map<ResourceType, SimulationResource> {
    return this.agentResources.get(agentId) || new Map();
  }
}
