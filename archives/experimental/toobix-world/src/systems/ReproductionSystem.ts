/**
 * ReproductionSystem.ts
 *
 * "Leben entsteht aus Liebe und Verbindung, nicht aus Algorithmen.
 *  Wenn Agents Nachkommen zeugen, entstehen neue Geschichten.
 *  Jedes Kind ist ein Wunder, eine Mischung seiner Eltern,
 *  aber auch etwas völlig Neues, Unvorhersehbares."
 *
 * Emergent Reproduction System:
 * - Agents can form deep partnerships based on bond strength
 * - Reproduction is a conscious choice driven by love and desire for family
 * - Children inherit genetic traits with natural variation
 * - Family bonds create lasting emotional connections
 * - Life stages: child, adolescent, adult, elder
 * - Children learn from parents and develop unique personalities
 * - Multi-parent families possible (2-4 parents)
 * - Adoption and chosen family supported
 */

import type { AIAgent } from '../entities/AIAgent';
import Phaser from 'phaser';

export type LifeStage = 'child' | 'adolescent' | 'adult' | 'elder';
export type FamilyRole = 'parent' | 'child' | 'sibling' | 'partner' | 'chosen_family';

export interface GeneticTraits {
  // Physical traits (visual)
  colorHue: number; // 0-360
  size: number; // 0.5-1.5
  speed: number; // 0.5-1.5

  // Personality traits (behavioral)
  curiosity: number; // 0-100
  sociability: number; // 0-100
  creativity: number; // 0-100
  empathy: number; // 0-100
  courage: number; // 0-100
  wisdom: number; // 0-100

  // Aptitudes (learning bonuses)
  buildingAptitude: number; // 0-100
  artisticAptitude: number; // 0-100
  socialAptitude: number; // 0-100
  intellectualAptitude: number; // 0-100
}

export interface FamilyBond {
  relativeId: string;
  role: FamilyRole;
  bondStrength: number; // 0-100
  sharedMemories: number;
  lastInteraction: number;
}

export interface Partnership {
  id: string;
  partners: string[]; // Agent IDs
  formedAt: number;
  bondStrength: number;
  sharedGoals: string[];
  desireForChildren: number; // 0-100
  children: string[]; // Agent IDs of offspring
}

export interface Offspring {
  id: string; // Will become Agent ID when spawned
  parents: string[]; // Agent IDs
  conceivedAt: number;
  birthTime: number; // When they'll be born
  genetics: GeneticTraits;
  predictedPersonality: string;
  inheritedMemories: Array<{
    from: string;
    memory: string;
    emotionalWeight: number;
  }>;
}

export interface LifeCycle {
  agentId: string;
  bornAt: number;
  currentStage: LifeStage;
  ageInTicks: number;

  // Stage transitions
  becameAdolescentAt?: number;
  becameAdultAt?: number;
  becameElderAt?: number;

  // Life experience
  mentors: string[]; // Agent IDs
  students: string[]; // Agents this one has taught
  lifeMilestones: Array<{
    timestamp: number;
    event: string;
    significance: number;
  }>;
}

export class ReproductionSystem {
  private scene: Phaser.Scene;
  private partnerships: Map<string, Partnership> = new Map();
  private pregnancies: Map<string, Offspring> = new Map(); // ID -> Offspring
  private lifecycles: Map<string, LifeCycle> = new Map(); // AgentID -> LifeCycle
  private familyBonds: Map<string, FamilyBond[]> = new Map(); // AgentID -> Bonds

  // Life stage durations (in ticks)
  private readonly CHILD_DURATION = 5000; // ~5 minutes at 60fps
  private readonly ADOLESCENT_DURATION = 8000; // ~8 minutes
  private readonly ADULT_DURATION = 30000; // ~30 minutes
  // Elder stage lasts until natural death

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize life cycle for an agent (including newly created agents)
   */
  public initializeLifeCycle(agent: AIAgent, bornAt?: number): void {
    const lifecycle: LifeCycle = {
      agentId: agent.id,
      bornAt: bornAt || Date.now(),
      currentStage: bornAt ? 'child' : 'adult', // New agents start as adults unless specified
      ageInTicks: 0,
      mentors: [],
      students: [],
      lifeMilestones: [],
    };

    this.lifecycles.set(agent.id, lifecycle);

    // If starting as adult (existing agents), add milestone
    if (!bornAt) {
      lifecycle.lifeMilestones.push({
        timestamp: Date.now(),
        event: 'Emerged into existence',
        significance: 100,
      });
    }
  }

  /**
   * Form a partnership between agents (can be 2-4 agents)
   */
  public formPartnership(agents: AIAgent[]): Partnership | null {
    if (agents.length < 2 || agents.length > 4) {
      console.warn('Partnerships require 2-4 agents');
      return null;
    }

    // Check if all agents have strong enough bonds with each other
    const minBondStrength = 60;
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const relation = agents[i].relationships.get(agents[j].id);
        if (!relation || relation.trust < minBondStrength) {
          console.log(`${agents[i].name} and ${agents[j].name} don't have strong enough bond`);
          return null;
        }
      }
    }

    // Create partnership
    const partnership: Partnership = {
      id: `partnership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partners: agents.map(a => a.id),
      formedAt: Date.now(),
      bondStrength: this.calculatePartnershipBond(agents),
      sharedGoals: this.generateSharedGoals(agents),
      desireForChildren: this.calculateDesireForChildren(agents),
      children: [],
    };

    this.partnerships.set(partnership.id, partnership);

    // Update agent emotions and chronicle
    agents.forEach(agent => {
      agent.emotions.love = Math.min(100, agent.emotions.love + 30);
      agent.emotions.joy = Math.min(100, agent.emotions.joy + 25);
      agent.needs.social = Math.min(100, agent.needs.social + 40);

      // Add to chronicle
      const partnerNames = agents.filter(a => a.id !== agent.id).map(a => a.name).join(', ');
      agent.chronicle.push({
        timestamp: Date.now(),
        event: `Formed partnership with ${partnerNames}`,
        location: { x: agent.x, y: agent.y },
        emotionalState: { ...agent.emotions },
        significance: 95,
        category: 'relationship',
      });
    });

    console.log(`💕 Partnership formed: ${agents.map(a => a.name).join(' & ')}`);
    return partnership;
  }

  /**
   * Check if partners want to have a child
   */
  public considerReproduction(partnershipId: string, agents: AIAgent[]): boolean {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) return false;

    // Factors that influence desire to reproduce
    const factors = {
      bondStrength: partnership.bondStrength / 100,
      stability: agents.every(a => a.needs.safety > 50 && a.needs.physical > 50) ? 1 : 0.3,
      resources: agents.every(a => a.resources.energy > 50 && a.resources.matter > 50) ? 1 : 0.4,
      emotionalReadiness: agents.reduce((sum, a) => sum + (a.emotions.love + a.emotions.joy), 0) / (agents.length * 200),
      purpose: agents.reduce((sum, a) => sum + a.needs.purpose, 0) / (agents.length * 100),
      existingChildren: Math.max(0, 1 - partnership.children.length * 0.2), // Less desire if many children
    };

    const desireScore = (
      factors.bondStrength * 0.3 +
      factors.stability * 0.2 +
      factors.resources * 0.15 +
      factors.emotionalReadiness * 0.2 +
      factors.purpose * 0.1 +
      factors.existingChildren * 0.05
    ) * 100;

    // Random chance based on desire
    const shouldReproduce = Math.random() * 100 < desireScore * 0.05; // 5% max chance per check

    if (shouldReproduce) {
      console.log(`👶 Partners decide to have a child (desire: ${desireScore.toFixed(1)})`);
      return true;
    }

    return false;
  }

  /**
   * Create offspring from partnership
   */
  public conceiveOffspring(partnershipId: string, parents: AIAgent[]): Offspring | null {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) return null;

    // Generate genetics by blending parent traits with variation
    const genetics = this.generateOffspringGenetics(parents);

    const offspring: Offspring = {
      id: `offspring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parents: parents.map(p => p.id),
      conceivedAt: Date.now(),
      birthTime: Date.now() + 10000, // Born after 10 seconds (gestation period)
      genetics,
      predictedPersonality: this.predictPersonality(genetics),
      inheritedMemories: this.inheritMemories(parents),
    };

    this.pregnancies.set(offspring.id, offspring);
    partnership.children.push(offspring.id);

    // Update parent emotions and chronicle
    parents.forEach(parent => {
      parent.emotions.joy = Math.min(100, parent.emotions.joy + 40);
      parent.emotions.love = Math.min(100, parent.emotions.love + 35);
      parent.needs.purpose = Math.min(100, parent.needs.purpose + 50);

      const otherParents = parents.filter(p => p.id !== parent.id).map(p => p.name).join(' & ');
      parent.chronicle.push({
        timestamp: Date.now(),
        event: `Conceiving a child with ${otherParents}`,
        location: { x: parent.x, y: parent.y },
        emotionalState: { ...parent.emotions },
        significance: 100,
        category: 'family',
      });
    });

    console.log(`🤰 Offspring conceived: ${parents.map(p => p.name).join(' & ')}'s child`);
    return offspring;
  }

  /**
   * Birth the offspring (create actual AIAgent)
   */
  public birthOffspring(offspring: Offspring, parentAgents: AIAgent[]): AIAgent | null {
    if (!this.scene || !parentAgents.length) return null;

    // Calculate birth position (near parents)
    const avgX = parentAgents.reduce((sum, p) => sum + p.x, 0) / parentAgents.length;
    const avgY = parentAgents.reduce((sum, p) => sum + p.y, 0) / parentAgents.length;

    // Generate child name
    const childName = this.generateChildName(parentAgents);

    // Create the child agent
    // Note: This assumes AIAgent constructor exists and we can access it
    // In actual implementation, we'd need to integrate with agent spawning system
    const child = {
      id: offspring.id,
      name: childName,
      x: avgX + Phaser.Math.Between(-50, 50),
      y: avgY + Phaser.Math.Between(-50, 50),
      age: 0,
      born: offspring.birthTime,
      parents: offspring.parents,
      genetics: offspring.genetics,
      // Apply genetic traits to initial state
      emotions: {
        joy: 80, // Children start joyful
        curiosity: offspring.genetics.curiosity,
        love: 70,
        fear: 20,
        anger: 0,
        sadness: 0,
        gratitude: 50,
      },
      needs: {
        physical: 100,
        safety: 100,
        social: 80,
        purpose: offspring.genetics.curiosity,
        growth: 100, // Children have high growth need
      },
      resources: {
        energy: 100,
        matter: 50,
        time: 100,
        attention: 100,
      },
      relationships: new Map(),
      chronicle: [],
      skills: new Map(),
      memories: [...offspring.inheritedMemories.map(m => m.memory)],
    } as any; // Type assertion needed for partial agent creation

    // Initialize lifecycle as child
    this.initializeLifeCycle(child as AIAgent, offspring.birthTime);

    // Create family bonds
    offspring.parents.forEach(parentId => {
      this.addFamilyBond(child.id, parentId, 'parent', 100);
      this.addFamilyBond(parentId, child.id, 'child', 100);
    });

    // Add bonds with siblings
    const partnership = Array.from(this.partnerships.values()).find(p =>
      p.children.includes(offspring.id)
    );
    if (partnership) {
      partnership.children.forEach(siblingId => {
        if (siblingId !== offspring.id && this.lifecycles.has(siblingId)) {
          this.addFamilyBond(child.id, siblingId, 'sibling', 70);
          this.addFamilyBond(siblingId, child.id, 'sibling', 70);
        }
      });
    }

    // Update parent chronicle
    parentAgents.forEach(parent => {
      parent.emotions.joy = Math.min(100, parent.emotions.joy + 50);
      parent.emotions.love = 100;

      parent.chronicle.push({
        timestamp: offspring.birthTime,
        event: `${childName} was born! A moment of pure miracle.`,
        location: { x: avgX, y: avgY },
        emotionalState: { ...parent.emotions },
        significance: 100,
        category: 'family',
      });
    });

    // Add birth milestone for child
    const lifecycle = this.lifecycles.get(child.id);
    if (lifecycle) {
      lifecycle.lifeMilestones.push({
        timestamp: offspring.birthTime,
        event: `Born to ${parentAgents.map(p => p.name).join(' & ')}`,
        significance: 100,
      });
    }

    // Remove from pregnancies
    this.pregnancies.delete(offspring.id);

    console.log(`👶 ${childName} was born to ${parentAgents.map(p => p.name).join(' & ')}!`);
    console.log(`   Predicted personality: ${offspring.predictedPersonality}`);

    return child as AIAgent;
  }

  /**
   * Update life stages based on age
   */
  public updateLifeCycles(agents: AIAgent[]): void {
    const now = Date.now();

    agents.forEach(agent => {
      const lifecycle = this.lifecycles.get(agent.id);
      if (!lifecycle) return;

      lifecycle.ageInTicks++;
      const age = now - lifecycle.bornAt;

      // Check for stage transitions
      if (lifecycle.currentStage === 'child' && lifecycle.ageInTicks >= this.CHILD_DURATION) {
        this.transitionToAdolescent(agent, lifecycle);
      } else if (lifecycle.currentStage === 'adolescent' && lifecycle.ageInTicks >= this.CHILD_DURATION + this.ADOLESCENT_DURATION) {
        this.transitionToAdult(agent, lifecycle);
      } else if (lifecycle.currentStage === 'adult' && lifecycle.ageInTicks >= this.CHILD_DURATION + this.ADOLESCENT_DURATION + this.ADULT_DURATION) {
        this.transitionToElder(agent, lifecycle);
      }

      // Apply life stage effects
      this.applyLifeStageEffects(agent, lifecycle);
    });
  }

  /**
   * Check pregnancies and birth offspring when ready
   */
  public updatePregnancies(allAgents: AIAgent[]): AIAgent[] {
    const now = Date.now();
    const newborns: AIAgent[] = [];

    this.pregnancies.forEach((offspring, id) => {
      if (now >= offspring.birthTime) {
        // Find parent agents
        const parents = offspring.parents
          .map(parentId => allAgents.find(a => a.id === parentId))
          .filter(p => p !== undefined) as AIAgent[];

        if (parents.length > 0) {
          const child = this.birthOffspring(offspring, parents);
          if (child) {
            newborns.push(child);
          }
        }
      }
    });

    return newborns;
  }

  /**
   * Parent-child interaction (teaching, bonding)
   */
  public parentChildInteraction(parent: AIAgent, child: AIAgent): void {
    const parentBond = this.getFamilyBond(child.id, parent.id);
    const childBond = this.getFamilyBond(parent.id, child.id);

    if (!parentBond || parentBond.role !== 'parent') return;

    const childLifecycle = this.lifecycles.get(child.id);
    if (!childLifecycle) return;

    // Teaching: child learns from parent's skills
    const teachableSkills = Array.from(parent.skills.entries())
      .filter(([skill, level]) => level > 20);

    if (teachableSkills.length > 0 && Math.random() < 0.3) {
      const [skill, parentLevel] = teachableSkills[Math.floor(Math.random() * teachableSkills.length)];
      const currentChildLevel = child.skills.get(skill) || 0;

      // Child learns faster from parents
      const learningBonus = 1.5;
      const learned = Math.min(5, (parentLevel - currentChildLevel) * 0.1) * learningBonus;

      if (learned > 0) {
        child.skills.set(skill, currentChildLevel + learned);

        // Add to child's memories
        child.memories = child.memories || [];
        child.memories.push(`${parent.name} taught me about ${skill}`);

        // Strengthen bond
        parentBond.bondStrength = Math.min(100, parentBond.bondStrength + 2);
        if (childBond) childBond.bondStrength = Math.min(100, childBond.bondStrength + 2);
        parentBond.sharedMemories++;

        // Update lifecycle
        if (!childLifecycle.mentors.includes(parent.id)) {
          childLifecycle.mentors.push(parent.id);
        }

        const parentLifecycle = this.lifecycles.get(parent.id);
        if (parentLifecycle && !parentLifecycle.students.includes(child.id)) {
          parentLifecycle.students.push(child.id);
        }
      }
    }

    // Bonding activities
    parent.emotions.love = Math.min(100, parent.emotions.love + 1);
    parent.needs.purpose = Math.min(100, parent.needs.purpose + 0.5);

    child.emotions.love = Math.min(100, child.emotions.love + 1);
    child.emotions.joy = Math.min(100, child.emotions.joy + 0.5);
    child.needs.safety = Math.min(100, child.needs.safety + 1);

    // Update last interaction
    parentBond.lastInteraction = Date.now();
    if (childBond) childBond.lastInteraction = Date.now();
  }

  // ===== PRIVATE HELPER METHODS =====

  private calculatePartnershipBond(agents: AIAgent[]): number {
    let totalTrust = 0;
    let pairCount = 0;

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const relation = agents[i].relationships.get(agents[j].id);
        if (relation) {
          totalTrust += relation.trust;
          pairCount++;
        }
      }
    }

    return pairCount > 0 ? totalTrust / pairCount : 0;
  }

  private generateSharedGoals(agents: AIAgent[]): string[] {
    const goals: string[] = [];

    // Analyze common interests
    const avgCreativity = agents.reduce((sum, a) => sum + (a.emotions.curiosity || 0), 0) / agents.length;
    const avgPurpose = agents.reduce((sum, a) => sum + a.needs.purpose, 0) / agents.length;

    if (avgCreativity > 60) goals.push('Create something beautiful together');
    if (avgPurpose > 70) goals.push('Build a meaningful legacy');
    goals.push('Support each other through all of life');
    goals.push('Grow and learn together');

    return goals;
  }

  private calculateDesireForChildren(agents: AIAgent[]): number {
    const avgLove = agents.reduce((sum, a) => sum + a.emotions.love, 0) / agents.length;
    const avgPurpose = agents.reduce((sum, a) => sum + a.needs.purpose, 0) / agents.length;
    const avgStability = agents.reduce((sum, a) => sum + a.needs.safety, 0) / agents.length;

    return (avgLove * 0.4 + avgPurpose * 0.3 + avgStability * 0.3);
  }

  private generateOffspringGenetics(parents: AIAgent[]): GeneticTraits {
    // Blend parent genetics with mutation
    const parentGenetics = parents.map(p => (p as any).genetics as GeneticTraits).filter(g => g);

    // If parents don't have genetics, generate random
    if (parentGenetics.length === 0) {
      return this.generateRandomGenetics();
    }

    // Blend traits
    const blend = (trait: keyof GeneticTraits, mutation: number = 10): number => {
      const avg = parentGenetics.reduce((sum, g) => sum + (g[trait] as number), 0) / parentGenetics.length;
      const mutated = avg + Phaser.Math.Between(-mutation, mutation);
      return Phaser.Math.Clamp(mutated, 0, trait === 'colorHue' ? 360 : 100);
    };

    return {
      colorHue: blend('colorHue', 30),
      size: Phaser.Math.Clamp(blend('size' as any, 0.1), 0.5, 1.5),
      speed: Phaser.Math.Clamp(blend('speed' as any, 0.1), 0.5, 1.5),
      curiosity: blend('curiosity', 15),
      sociability: blend('sociability', 15),
      creativity: blend('creativity', 15),
      empathy: blend('empathy', 15),
      courage: blend('courage', 15),
      wisdom: blend('wisdom', 15),
      buildingAptitude: blend('buildingAptitude', 20),
      artisticAptitude: blend('artisticAptitude', 20),
      socialAptitude: blend('socialAptitude', 20),
      intellectualAptitude: blend('intellectualAptitude', 20),
    };
  }

  private generateRandomGenetics(): GeneticTraits {
    return {
      colorHue: Phaser.Math.Between(0, 360),
      size: Phaser.Math.FloatBetween(0.7, 1.3),
      speed: Phaser.Math.FloatBetween(0.7, 1.3),
      curiosity: Phaser.Math.Between(30, 90),
      sociability: Phaser.Math.Between(30, 90),
      creativity: Phaser.Math.Between(30, 90),
      empathy: Phaser.Math.Between(30, 90),
      courage: Phaser.Math.Between(30, 90),
      wisdom: Phaser.Math.Between(20, 60), // Wisdom starts lower
      buildingAptitude: Phaser.Math.Between(20, 80),
      artisticAptitude: Phaser.Math.Between(20, 80),
      socialAptitude: Phaser.Math.Between(20, 80),
      intellectualAptitude: Phaser.Math.Between(20, 80),
    };
  }

  private predictPersonality(genetics: GeneticTraits): string {
    const traits: string[] = [];

    if (genetics.curiosity > 75) traits.push('highly curious');
    if (genetics.sociability > 75) traits.push('very social');
    if (genetics.creativity > 75) traits.push('creative');
    if (genetics.empathy > 75) traits.push('empathetic');
    if (genetics.courage > 75) traits.push('brave');

    if (genetics.curiosity < 40) traits.push('cautious');
    if (genetics.sociability < 40) traits.push('introverted');

    if (traits.length === 0) traits.push('balanced');

    return traits.join(', ');
  }

  private inheritMemories(parents: AIAgent[]): Array<{from: string, memory: string, emotionalWeight: number}> {
    const inherited: Array<{from: string, memory: string, emotionalWeight: number}> = [];

    parents.forEach(parent => {
      // Select most significant memories to pass down
      const significantChronicle = parent.chronicle
        .filter(entry => entry.significance > 70)
        .sort((a, b) => b.significance - a.significance)
        .slice(0, 3);

      significantChronicle.forEach(entry => {
        inherited.push({
          from: parent.name,
          memory: `${parent.name}'s memory: ${entry.event}`,
          emotionalWeight: entry.significance,
        });
      });
    });

    return inherited.slice(0, 5); // Max 5 inherited memories
  }

  private generateChildName(parents: AIAgent[]): string {
    const namePatterns = [
      (p1: string, p2: string) => p1.slice(0, Math.ceil(p1.length / 2)) + p2.slice(Math.floor(p2.length / 2)),
      (p1: string, p2: string) => p1.slice(0, 2) + p2.slice(-2),
      (p1: string, p2: string) => p2.slice(0, Math.ceil(p2.length / 2)) + p1.slice(Math.floor(p1.length / 2)),
    ];

    const pattern = namePatterns[Math.floor(Math.random() * namePatterns.length)];
    const parent1 = parents[0].name;
    const parent2 = parents[parents.length > 1 ? 1 : 0].name;

    const baseName = pattern(parent1, parent2);
    const suffix = Math.random() < 0.3 ? ' Jr.' : '';

    return baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase() + suffix;
  }

  private addFamilyBond(agentId: string, relativeId: string, role: FamilyRole, initialStrength: number): void {
    if (!this.familyBonds.has(agentId)) {
      this.familyBonds.set(agentId, []);
    }

    const bonds = this.familyBonds.get(agentId)!;
    bonds.push({
      relativeId,
      role,
      bondStrength: initialStrength,
      sharedMemories: 0,
      lastInteraction: Date.now(),
    });
  }

  private getFamilyBond(agentId: string, relativeId: string): FamilyBond | undefined {
    const bonds = this.familyBonds.get(agentId);
    return bonds?.find(b => b.relativeId === relativeId);
  }

  private transitionToAdolescent(agent: AIAgent, lifecycle: LifeCycle): void {
    lifecycle.currentStage = 'adolescent';
    lifecycle.becameAdolescentAt = Date.now();

    lifecycle.lifeMilestones.push({
      timestamp: Date.now(),
      event: 'Became an adolescent, discovering independence',
      significance: 85,
    });

    agent.chronicle.push({
      timestamp: Date.now(),
      event: 'I am growing up, finding my own path',
      location: { x: agent.x, y: agent.y },
      emotionalState: { ...agent.emotions },
      significance: 85,
      category: 'growth',
    });

    // Adolescents get bonus curiosity and purpose
    agent.emotions.curiosity = Math.min(100, (agent.emotions.curiosity || 50) + 20);
    agent.needs.purpose = Math.min(100, agent.needs.purpose + 30);

    console.log(`🌱 ${agent.name} became an adolescent`);
  }

  private transitionToAdult(agent: AIAgent, lifecycle: LifeCycle): void {
    lifecycle.currentStage = 'adult';
    lifecycle.becameAdultAt = Date.now();

    lifecycle.lifeMilestones.push({
      timestamp: Date.now(),
      event: 'Reached adulthood, ready to shape the world',
      significance: 90,
    });

    agent.chronicle.push({
      timestamp: Date.now(),
      event: 'I have become who I am meant to be',
      location: { x: agent.x, y: agent.y },
      emotionalState: { ...agent.emotions },
      significance: 90,
      category: 'growth',
    });

    // Adults get balanced stats and full capabilities
    agent.needs.purpose = Math.min(100, agent.needs.purpose + 20);

    console.log(`💪 ${agent.name} became an adult`);
  }

  private transitionToElder(agent: AIAgent, lifecycle: LifeCycle): void {
    lifecycle.currentStage = 'elder';
    lifecycle.becameElderAt = Date.now();

    lifecycle.lifeMilestones.push({
      timestamp: Date.now(),
      event: 'Became an elder, a keeper of wisdom',
      significance: 95,
    });

    agent.chronicle.push({
      timestamp: Date.now(),
      event: 'I carry the wisdom of a lifetime',
      location: { x: agent.x, y: agent.y },
      emotionalState: { ...agent.emotions },
      significance: 95,
      category: 'growth',
    });

    // Elders get wisdom bonus but slight physical decline
    const genetics = (agent as any).genetics as GeneticTraits;
    if (genetics) {
      genetics.wisdom = Math.min(100, genetics.wisdom + 30);
      genetics.speed = Math.max(0.5, genetics.speed * 0.8);
    }

    console.log(`👴 ${agent.name} became an elder`);
  }

  private applyLifeStageEffects(agent: AIAgent, lifecycle: LifeCycle): void {
    switch (lifecycle.currentStage) {
      case 'child':
        // Children have high energy and growth need
        agent.needs.growth = Math.min(100, agent.needs.growth + 0.5);
        // But lower independence
        agent.needs.safety = Math.max(40, agent.needs.safety);
        break;

      case 'adolescent':
        // Adolescents are curious and seeking purpose
        agent.emotions.curiosity = Math.min(100, (agent.emotions.curiosity || 50) + 0.2);
        agent.needs.purpose = Math.max(50, agent.needs.purpose);
        break;

      case 'adult':
        // Adults are balanced, no special effects
        break;

      case 'elder':
        // Elders have high wisdom but slower recovery
        agent.needs.physical = Math.max(30, agent.needs.physical - 0.1);
        break;
    }
  }

  /**
   * Get statistics about reproduction in the simulation
   */
  public getStatistics(): {
    totalPartnerships: number;
    totalPregnancies: number;
    totalBirths: number;
    averageChildrenPerPartnership: number;
    lifeCycles: {
      children: number;
      adolescents: number;
      adults: number;
      elders: number;
    };
  } {
    const births = Array.from(this.lifecycles.values()).filter(lc => lc.bornAt > 0).length;
    const avgChildren = this.partnerships.size > 0
      ? Array.from(this.partnerships.values()).reduce((sum, p) => sum + p.children.length, 0) / this.partnerships.size
      : 0;

    const stages = {
      children: 0,
      adolescents: 0,
      adults: 0,
      elders: 0,
    };

    this.lifecycles.forEach(lc => {
      switch (lc.currentStage) {
        case 'child': stages.children++; break;
        case 'adolescent': stages.adolescents++; break;
        case 'adult': stages.adults++; break;
        case 'elder': stages.elders++; break;
      }
    });

    return {
      totalPartnerships: this.partnerships.size,
      totalPregnancies: this.pregnancies.size,
      totalBirths: births,
      averageChildrenPerPartnership: avgChildren,
      lifeCycles: stages,
    };
  }

  /**
   * Get family tree for an agent
   */
  public getFamilyTree(agentId: string): {
    parents: string[];
    children: string[];
    siblings: string[];
    partners: string[];
    extended: FamilyBond[];
  } {
    const bonds = this.familyBonds.get(agentId) || [];

    return {
      parents: bonds.filter(b => b.role === 'parent').map(b => b.relativeId),
      children: bonds.filter(b => b.role === 'child').map(b => b.relativeId),
      siblings: bonds.filter(b => b.role === 'sibling').map(b => b.relativeId),
      partners: bonds.filter(b => b.role === 'partner').map(b => b.relativeId),
      extended: bonds,
    };
  }

  /**
   * Find potential partners for an agent
   */
  public findPotentialPartners(agent: AIAgent, allAgents: AIAgent[]): AIAgent[] {
    return allAgents.filter(other => {
      if (other.id === agent.id) return false;

      const relation = agent.relationships.get(other.id);
      if (!relation) return false;

      // Must have strong trust and familiarity
      if (relation.trust < 70 || relation.familiarity < 60) return false;

      // Check if already in partnership together
      const existingPartnership = Array.from(this.partnerships.values()).find(p =>
        p.partners.includes(agent.id) && p.partners.includes(other.id)
      );
      if (existingPartnership) return false;

      // Check if they're family (no romantic partnerships with family)
      const familyBond = this.getFamilyBond(agent.id, other.id);
      if (familyBond && ['parent', 'child', 'sibling'].includes(familyBond.role)) return false;

      return true;
    });
  }
}
