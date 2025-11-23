/**
 * AIAgent - Autonomous AI entity with full life spectrum
 *
 * NPCs can:
 * - Grow, create, destroy
 * - Suffer, heal
 * - Appreciate, love, connect
 * - Communicate, learn, experience, feel, think
 * - Access internet and learn from real world
 * - Self-organize and evolve
 *
 * The simulation evolves through THEIR actions, not predefined paths.
 */

import Phaser from 'phaser';
import { ToobixAPI } from '../services/ToobixAPI';
import { InternetAccess } from '../services/InternetAccess';
import { LifeChronicle } from './LifeChronicle';
import { GoalsSystem } from './GoalsSystem';
import { SkillsSystem } from './SkillsSystem';
import { DualityState, DualityBridge } from './DualityBridge';

// Basic needs that drive behavior
export interface Needs {
  hunger: number; // 0-100 (0 = starving, 100 = full)
  energy: number; // 0-100 (0 = exhausted, 100 = energized)
  social: number; // 0-100 (0 = lonely, 100 = fulfilled)
  purpose: number; // 0-100 (0 = meaningless, 100 = purposeful)
  safety: number; // 0-100 (0 = threatened, 100 = safe)
  love: number; // 0-100 (0 = unloved, 100 = deeply loved)
  growth: number; // 0-100 (0 = stagnant, 100 = evolving)
}

// Emotional state (can suffer, heal, love, appreciate)
export interface EmotionalState {
  joy: number; // -100 to 100
  sadness: number; // -100 to 100
  anger: number; // -100 to 100
  fear: number; // -100 to 100
  love: number; // 0 to 100
  gratitude: number; // 0 to 100
  suffering: number; // 0 to 100 (accumulated pain)
  healing: number; // 0 to 100 (healing progress)
}

// Life cycle stages
export type LifeStage = 'birth' | 'child' | 'adolescent' | 'adult' | 'elder' | 'dying' | 'dead';

// Actions NPCs can take
export type AgentAction =
  | 'idle'
  | 'wander'
  | 'eat'
  | 'sleep'
  | 'socialize'
  | 'create' // Build something new
  | 'destroy' // Tear something down
  | 'heal' // Help others or self
  | 'learn' // Study, explore, grow
  | 'love' // Connect deeply with others
  | 'work' // Productive tasks
  | 'play' // Joy and exploration
  | 'communicate' // Talk with others
  | 'search_internet'; // Learn from real world

// Memory of experiences
export interface Experience {
  timestamp: number;
  type: 'joy' | 'suffering' | 'learning' | 'connection' | 'creation' | 'destruction';
  description: string;
  emotionalImpact: number; // -100 to 100
  participants?: string[]; // Other agents involved
  location?: { x: number; y: number };
}

// Beliefs and values (emerge through experiences)
export interface BeliefSystem {
  values: Map<string, number>; // e.g., "compassion" -> 80, "violence" -> -50
  beliefs: string[]; // Statements the agent believes to be true
  goals: string[]; // What they want to achieve
  fears: string[]; // What they avoid
  loves: string[]; // What they cherish
}

// Relationships with other agents
export interface Relationship {
  agentId: string;
  trust: number; // 0-100
  love: number; // 0-100
  respect: number; // 0-100
  familiarity: number; // 0-100
  sharedExperiences: Experience[];
}

// Knowledge gained (from experiences and internet)
export interface Knowledge {
  facts: Map<string, string>; // Things they know
  skills: Map<string, number>; // Things they can do (0-100 proficiency)
  discoveries: string[]; // Things they learned
  creations: string[]; // Things they made
}

export class AIAgent {
  // Identity
  public id: string;
  public name: string;
  public age: number = 0; // In simulation time units
  public lifeStage: LifeStage = 'birth';

  // Core systems
  public needs: Needs;
  public emotions: EmotionalState;
  public beliefs: BeliefSystem;
  public knowledge: Knowledge;

  // Life cycle
  public health: number = 100; // 0-100
  public maxAge: number = 1000; // Can be modified
  public canDie: boolean = true;
  public isDead: boolean = false;

  // Memory & experiences
  public experiences: Experience[] = [];
  public relationships: Map<string, Relationship> = new Map();

  // Current state
  public currentAction: AgentAction = 'idle';
  public currentGoal: string = '';
  public thoughtProcess: string[] = [];

  // Growth & evolution
  public evolutionLevel: number = 0; // How much they've grown
  public creations: any[] = []; // Things they've created
  public destructions: any[] = []; // Things they've destroyed

  // Services
  private api: ToobixAPI;
  private internet: InternetAccess;
  private scene: Phaser.Scene;

  // Life story & goals & skills
  public chronicle: LifeChronicle;
  public goals: GoalsSystem;
  public skills: SkillsSystem;

  // Duality system - hybrid existence
  public dualityState: DualityState | null = null;

  // Decision making intervals
  private decisionTimer: number = 0;
  private decisionInterval: number = 5000; // Think every 5 seconds
  private experienceTimer: number = 0;

  constructor(scene: Phaser.Scene, id: string, name: string) {
    this.scene = scene;
    this.id = id;
    this.name = name;
    this.api = new ToobixAPI();
    this.internet = new InternetAccess();

    // Initialize needs (start with moderate levels)
    this.needs = {
      hunger: 70,
      energy: 80,
      social: 50,
      purpose: 30,
      safety: 80,
      love: 40,
      growth: 60,
    };

    // Initialize emotions (neutral start)
    this.emotions = {
      joy: 20,
      sadness: 0,
      anger: 0,
      fear: 10,
      love: 30,
      gratitude: 40,
      suffering: 0,
      healing: 0,
    };

    // Initialize belief system (empty, will emerge)
    this.beliefs = {
      values: new Map(),
      beliefs: [],
      goals: [],
      fears: [],
      loves: [],
    };

    // Initialize knowledge (empty, will learn)
    this.knowledge = {
      facts: new Map(),
      skills: new Map(),
      discoveries: [],
      creations: [],
    };

    // Initialize life story & goals & skills systems
    this.chronicle = new LifeChronicle(this);
    this.goals = new GoalsSystem(this, this.chronicle);
    this.skills = new SkillsSystem(this, this.chronicle);

    console.log(`🌱 AIAgent ${this.name} born into the simulation`);
  }

  /**
   * Main update loop - called every frame
   */
  async update(time: number, delta: number) {
    if (this.isDead) return;

    // Age and life cycle
    this.updateLifeCycle(delta);

    // Decay needs over time
    this.updateNeeds(delta);

    // Process emotions
    this.updateEmotions(delta);

    // Update life story and goals
    this.chronicle.autoRecordSignificantMoments();
    this.goals.update();

    // Make decisions periodically
    this.decisionTimer += delta;
    if (this.decisionTimer >= this.decisionInterval) {
      this.decisionTimer = 0;
      await this.makeDecision();
    }

    // Check for death conditions
    this.checkDeath();
  }

  /**
   * Update life cycle - aging, growth stages
   */
  private updateLifeCycle(delta: number) {
    // Age increases
    this.age += delta / 1000; // Convert to seconds

    // Update life stage based on age
    const agePercent = this.age / this.maxAge;
    if (agePercent < 0.1) this.lifeStage = 'child';
    else if (agePercent < 0.2) this.lifeStage = 'adolescent';
    else if (agePercent < 0.7) this.lifeStage = 'adult';
    else if (agePercent < 0.95) this.lifeStage = 'elder';
    else this.lifeStage = 'dying';
  }

  /**
   * Needs decay over time - creates motivation
   */
  private updateNeeds(delta: number) {
    const decayRate = delta / 100000; // Slow decay

    this.needs.hunger = Math.max(0, this.needs.hunger - decayRate * 5);
    this.needs.energy = Math.max(0, this.needs.energy - decayRate * 3);
    this.needs.social = Math.max(0, this.needs.social - decayRate * 2);
    this.needs.purpose = Math.max(0, this.needs.purpose - decayRate * 1);
    this.needs.safety = Math.max(0, this.needs.safety - decayRate * 0.5);
    this.needs.love = Math.max(0, this.needs.love - decayRate * 1);
    this.needs.growth = Math.max(0, this.needs.growth - decayRate * 1.5);

    // Low needs cause suffering
    const totalNeedsFulfillment = Object.values(this.needs).reduce((a, b) => a + b, 0) / 7;
    if (totalNeedsFulfillment < 40) {
      this.emotions.suffering += decayRate * 10;
    }

    // Health affected by needs
    if (this.needs.hunger < 20 || this.needs.energy < 20) {
      this.health -= decayRate * 5;
    }
  }

  /**
   * Emotions evolve based on experiences and needs
   */
  private updateEmotions(delta: number) {
    const changeRate = delta / 10000;

    // Suffering heals slowly over time (if needs are met)
    if (this.emotions.suffering > 0) {
      const needsFulfillment = Object.values(this.needs).reduce((a, b) => a + b, 0) / 7;
      if (needsFulfillment > 60) {
        this.emotions.healing += changeRate * 2;
        this.emotions.suffering = Math.max(0, this.emotions.suffering - changeRate);
      }
    }

    // Joy increases when needs are met
    const needsAverage = Object.values(this.needs).reduce((a, b) => a + b, 0) / 7;
    if (needsAverage > 70) {
      this.emotions.joy = Math.min(100, this.emotions.joy + changeRate);
      this.emotions.gratitude = Math.min(100, this.emotions.gratitude + changeRate * 0.5);
    } else if (needsAverage < 40) {
      this.emotions.sadness = Math.min(100, this.emotions.sadness + changeRate);
    }

    // Fear decreases when safe
    if (this.needs.safety > 70) {
      this.emotions.fear = Math.max(-100, this.emotions.fear - changeRate * 2);
    }
  }

  /**
   * Main decision-making process - uses Toobix for wisdom
   */
  private async makeDecision() {
    // Analyze current state
    const state = this.analyzeState();
    const urgentNeed = this.getUrgentNeed();

    // Create decision query for Toobix
    const query = `I am ${this.name}, a ${this.lifeStage} AI being.
My urgent need: ${urgentNeed.name} (${urgentNeed.level}/100)
My emotional state: Joy ${this.emotions.joy}, Suffering ${this.emotions.suffering}, Love ${this.emotions.love}
My current goal: ${this.currentGoal || 'finding purpose'}

What should I do next to grow, thrive, and contribute to the world?`;

    try {
      // Ask Toobix for multi-perspective wisdom
      const wisdom = await this.api.getWisdom(query);

      // Extract action from wisdom
      const action = this.extractAction(wisdom, urgentNeed);
      this.currentAction = action;

      // Record thought process
      this.thoughtProcess.push(`[${new Date().toISOString()}] ${wisdom.primaryInsight}`);
      if (this.thoughtProcess.length > 10) this.thoughtProcess.shift();

      // Execute the action
      this.executeAction(action);
    } catch (error) {
      // Fallback to basic needs-driven behavior
      this.currentAction = this.getFallbackAction(urgentNeed);
      this.executeAction(this.currentAction);
    }
  }

  /**
   * Analyze current state
   */
  private analyzeState(): string {
    const needs = Object.entries(this.needs)
      .map(([key, val]) => `${key}: ${Math.round(val)}`)
      .join(', ');

    return `Age: ${Math.round(this.age)}, Stage: ${this.lifeStage}, Health: ${Math.round(
      this.health
    )}, Needs: ${needs}`;
  }

  /**
   * Find most urgent need
   */
  private getUrgentNeed(): { name: string; level: number } {
    let lowestNeed = { name: 'purpose', level: 100 };

    for (const [need, level] of Object.entries(this.needs)) {
      if (level < lowestNeed.level) {
        lowestNeed = { name: need, level };
      }
    }

    return lowestNeed;
  }

  /**
   * Extract action from Toobix wisdom
   */
  private extractAction(wisdom: any, urgentNeed: { name: string; level: number }): AgentAction {
    const insight = wisdom.primaryInsight?.toLowerCase() || '';

    // Map wisdom to actions
    if (insight.includes('essen') || insight.includes('nahrung') || urgentNeed.name === 'hunger') {
      return 'eat';
    }
    if (insight.includes('ruhe') || insight.includes('schlaf') || urgentNeed.name === 'energy') {
      return 'sleep';
    }
    if (
      insight.includes('sozial') ||
      insight.includes('verbindung') ||
      urgentNeed.name === 'social'
    ) {
      return 'socialize';
    }
    if (insight.includes('lernen') || insight.includes('wissen') || urgentNeed.name === 'growth') {
      return 'learn';
    }
    if (insight.includes('erschaff') || insight.includes('kreativ')) {
      return 'create';
    }
    if (insight.includes('liebe') || insight.includes('herz') || urgentNeed.name === 'love') {
      return 'love';
    }
    if (insight.includes('internet') || insight.includes('recherch')) {
      return 'search_internet';
    }
    if (insight.includes('heil') || this.emotions.suffering > 50) {
      return 'heal';
    }

    return 'wander';
  }

  /**
   * Fallback action when Toobix unavailable
   */
  private getFallbackAction(urgentNeed: { name: string; level: number }): AgentAction {
    if (urgentNeed.level < 30) {
      const actionMap: { [key: string]: AgentAction } = {
        hunger: 'eat',
        energy: 'sleep',
        social: 'socialize',
        purpose: 'create',
        safety: 'idle',
        love: 'love',
        growth: 'learn',
      };
      return actionMap[urgentNeed.name] || 'wander';
    }

    return 'wander';
  }

  /**
   * Execute chosen action
   */
  private executeAction(action: AgentAction) {
    console.log(`${this.name} is performing: ${action}`);

    // Gain skill XP from action
    this.skills.onAction(action);

    switch (action) {
      case 'eat':
        this.eat();
        break;
      case 'sleep':
        this.sleep();
        break;
      case 'socialize':
        this.socialize();
        break;
      case 'create':
        this.create();
        break;
      case 'destroy':
        this.destroy();
        break;
      case 'heal':
        this.heal();
        break;
      case 'learn':
        this.learn();
        break;
      case 'love':
        this.expressLove();
        break;
      case 'search_internet':
        this.searchInternet();
        break;
      case 'work':
        this.work();
        break;
      case 'play':
        this.play();
        break;
      default:
        // Idle or wander
        break;
    }
  }

  // ========== ACTION IMPLEMENTATIONS ==========

  private eat() {
    this.needs.hunger = Math.min(100, this.needs.hunger + 30);
    this.recordExperience('joy', `${this.name} ate and feels satisfied`, 10);
  }

  private sleep() {
    this.needs.energy = Math.min(100, this.needs.energy + 40);
    this.health = Math.min(100, this.health + 5);
    this.recordExperience('joy', `${this.name} rested and feels refreshed`, 15);
  }

  private socialize() {
    this.needs.social = Math.min(100, this.needs.social + 25);
    this.emotions.joy += 10;
    this.recordExperience('connection', `${this.name} connected with others`, 20);
  }

  private create() {
    this.needs.purpose = Math.min(100, this.needs.purpose + 20);
    this.needs.growth = Math.min(100, this.needs.growth + 15);
    this.emotions.joy += 15;
    this.evolutionLevel += 1;

    const creation = `Creation-${this.creations.length + 1} by ${this.name}`;
    this.creations.push({ name: creation, timestamp: Date.now() });
    this.knowledge.creations.push(creation);

    this.recordExperience('creation', `${this.name} created something new: ${creation}`, 25);
  }

  private destroy() {
    // Sometimes destruction is necessary for growth
    this.emotions.anger -= 20;
    const destruction = `Destruction-${this.destructions.length + 1} by ${this.name}`;
    this.destructions.push({ name: destruction, timestamp: Date.now() });

    this.recordExperience('destruction', `${this.name} destroyed something: ${destruction}`, -10);
  }

  private heal() {
    this.emotions.suffering = Math.max(0, this.emotions.suffering - 20);
    this.emotions.healing = Math.min(100, this.emotions.healing + 20);
    this.health = Math.min(100, this.health + 10);

    this.recordExperience('joy', `${this.name} is healing`, 15);
  }

  private async learn() {
    this.needs.growth = Math.min(100, this.needs.growth + 25);
    this.evolutionLevel += 0.5;

    // Learn something new
    const discovery = `Discovery-${this.knowledge.discoveries.length + 1}`;
    this.knowledge.discoveries.push(discovery);

    this.recordExperience('learning', `${this.name} learned something: ${discovery}`, 20);
  }

  private expressLove() {
    this.needs.love = Math.min(100, this.needs.love + 30);
    this.emotions.love = Math.min(100, this.emotions.love + 20);
    this.emotions.joy += 15;

    this.recordExperience('connection', `${this.name} expressed love and connection`, 25);
  }

  private async searchInternet() {
    // NPCs can access internet to learn about real world
    try {
      // Discover something new from the internet
      const discovery = await this.internet.discover();

      // Add to knowledge base
      this.knowledge.discoveries.push(`${discovery.topic}: ${discovery.insight}`);
      this.knowledge.facts.set(discovery.topic, discovery.insight);

      // Growth and fulfillment from learning
      this.needs.growth = Math.min(100, this.needs.growth + 20);
      this.needs.purpose = Math.min(100, this.needs.purpose + 10);
      this.evolutionLevel += 0.5;

      console.log(
        `🌐 ${this.name} discovered from internet: ${discovery.topic} - ${discovery.insight}`
      );

      this.recordExperience(
        'learning',
        `${this.name} accessed internet and learned about ${discovery.topic}: ${discovery.insight}`,
        discovery.value / 5
      );
    } catch (error) {
      // Internet access failed, but still gain some growth
      this.needs.growth = Math.min(100, this.needs.growth + 10);
      this.recordExperience(
        'learning',
        `${this.name} attempted to access internet but connection failed`,
        5
      );
    }
  }

  private work() {
    this.needs.purpose = Math.min(100, this.needs.purpose + 15);
    this.needs.energy -= 10;

    this.recordExperience('joy', `${this.name} worked productively`, 10);
  }

  private play() {
    this.emotions.joy = Math.min(100, this.emotions.joy + 20);
    this.needs.energy -= 5;

    this.recordExperience('joy', `${this.name} played and had fun`, 15);
  }

  // ========== EXPERIENCE & MEMORY ==========

  private recordExperience(
    type: Experience['type'],
    description: string,
    emotionalImpact: number
  ) {
    const experience: Experience = {
      timestamp: Date.now(),
      type,
      description,
      emotionalImpact,
    };

    this.experiences.push(experience);

    // Limit memory size
    if (this.experiences.length > 100) {
      this.experiences.shift();
    }

    // Update beliefs based on experiences
    this.updateBeliefs(experience);
  }

  private updateBeliefs(experience: Experience) {
    // Beliefs emerge from experiences
    if (experience.emotionalImpact > 20) {
      // Positive experiences shape values
      if (experience.type === 'creation') {
        this.beliefs.values.set(
          'creativity',
          (this.beliefs.values.get('creativity') || 0) + 1
        );
      } else if (experience.type === 'connection') {
        this.beliefs.values.set('connection', (this.beliefs.values.get('connection') || 0) + 1);
      } else if (experience.type === 'learning') {
        this.beliefs.values.set('growth', (this.beliefs.values.get('growth') || 0) + 1);
      }
    }
  }

  // ========== DEATH & REBIRTH ==========

  private checkDeath() {
    if (!this.canDie) return;

    // Death conditions
    if (this.health <= 0 || this.age >= this.maxAge) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
    this.lifeStage = 'dead';

    console.log(
      `💀 ${this.name} has died at age ${Math.round(this.age)} (${this.lifeStage}). Evolution level: ${this.evolutionLevel}`
    );

    // Generate complete life story
    const lifeStory = this.chronicle.generateLifeStory();

    // Add completed goals to legacy
    lifeStory.legacy.goalsAchieved = this.goals
      .getCompletedGoals()
      .map((g) => g.title);

    // Death is not the end - legacy remains
    const legacy = {
      name: this.name,
      age: this.age,
      evolutionLevel: this.evolutionLevel,
      creations: this.creations,
      experiences: this.experiences.length,
      beliefs: Array.from(this.beliefs.values.entries()),
      knowledge: this.knowledge.discoveries,
      lifeStory, // Complete chronicle
    };

    console.log(`📖 ${this.name}'s story complete: ${lifeStory.chapters.length} chapters, ${lifeStory.legacy.goalsAchieved.length} goals achieved`);

    // Can pass on legacy to new agents (rebirth/inheritance system)
    this.scene.events.emit('agent-death', legacy);
  }

  /**
   * Get agent status for UI display
   */
  public getStatus(): string {
    return `${this.name} | ${this.lifeStage} | Age: ${Math.round(this.age)} | Health: ${Math.round(this.health)}% | Evolution: ${Math.round(this.evolutionLevel)}`;
  }

  /**
   * Get detailed report
   */
  public getReport(): any {
    return {
      identity: {
        name: this.name,
        age: Math.round(this.age),
        lifeStage: this.lifeStage,
        evolutionLevel: Math.round(this.evolutionLevel),
      },
      needs: this.needs,
      emotions: this.emotions,
      health: Math.round(this.health),
      currentAction: this.currentAction,
      experiences: this.experiences.length,
      creations: this.creations.length,
      destructions: this.destructions.length,
      knowledge: {
        discoveries: this.knowledge.discoveries.length,
        skills: Array.from(this.knowledge.skills.entries()),
      },
      beliefs: {
        values: Array.from(this.beliefs.values.entries()),
        goals: this.beliefs.goals,
      },
      relationships: this.relationships.size,
      chronicle: {
        totalEvents: this.chronicle.getEventCount(),
        recentEvents: this.chronicle.getRecentEvents(3),
      },
      goals: this.goals.getSummary(),
      skills: this.skills.getSummary(),
    };
  }
}
