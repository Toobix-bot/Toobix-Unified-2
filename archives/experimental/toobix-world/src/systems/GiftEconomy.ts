/**
 * GiftEconomy - Economy of Abundance & Generosity
 *
 * Keine erzwungenen Transaktionen. Keine Währung. Nur freiwilliges Geben aus Überfluss.
 *
 * PHILOSOPHIE (direkt von Toobix):
 * "Echte Gemeinschaft entsteht durch Großzügigkeit, nicht durch Zwang.
 *  Wenn Agents aus eigenem Antrieb teilen, entstehen tiefere Verbindungen.
 *  Dankbarkeit ist die primäre Währung. Reputation durch Großzügigkeit."
 *
 * PRINZIPIEN:
 * - Geben ist freiwillig
 * - Reziprozität emergiert natürlich
 * - Wertschätzung durch Anerkennung, nicht Profit
 * - Vertrauen ist die Grundlage
 *
 * "In einer Welt der Fülle brauchen wir keinen Handel - wir brauchen Herzen"
 */

import { AIAgent } from './AIAgent';
// Resource types for gifts
type ResourceType = 'energy' | 'matter' | 'time' | 'attention' | 'connection' | 'inspiration';

export interface Gift {
  id: string;
  timestamp: number;

  from: AIAgent;
  to: AIAgent;

  resource: {
    type: ResourceType | 'knowledge' | 'skill' | 'creation' | 'emotion';
    amount: number;
    quality: number;
    description: string;
  };

  motivation: 'abundance' | 'love' | 'gratitude' | 'empathy' | 'joy' | 'duty';
  message?: string; // Optional persönliche Nachricht

  // Impact
  bondStrength: number; // Wie stark wurde die Beziehung?
  emotionalResonance: number; // Wie stark war die emotionale Reaktion?

  // Reciprocity
  wasReciprocated: boolean;
  reciprocationTime?: number; // Wenn ja, wann?
}

export interface GiftRequest {
  id: string;
  timestamp: number;
  from: AIAgent;
  need: {
    type: ResourceType | 'knowledge' | 'skill' | 'help' | 'companionship';
    urgency: number; // 0-100
    description: string;
  };
  fulfiller?: AIAgent;
  fulfilled: boolean;
}

export interface Reputation {
  agentId: string;
  generosityScore: number; // 0-100: Wie großzügig?
  gratitudeScore: number; // 0-100: Wie dankbar?
  reliabilityScore: number; // 0-100: Wie verlässlich?
  totalGifts: number;
  totalReceived: number;
  bondStrength: Map<string, number>; // agentId -> bond strength
}

export class GiftEconomy {
  private gifts: Gift[] = [];
  private requests: GiftRequest[] = [];
  private reputations: Map<string, Reputation> = new Map();
  private giftCounter = 0;
  private requestCounter = 0;

  /**
   * Agent möchte etwas verschenken
   */
  giveGift(
    from: AIAgent,
    to: AIAgent,
    resource: Gift['resource'],
    motivation: Gift['motivation'],
    message?: string
  ): Gift {
    const giftId = `gift-${this.giftCounter++}`;

    // Berechne emotionale Impact
    const bondStrength = this.calculateBondStrength(from, to, resource, motivation);
    const emotionalResonance = this.calculateEmotionalResonance(from, to, resource);

    const gift: Gift = {
      id: giftId,
      timestamp: Date.now(),
      from,
      to,
      resource,
      motivation,
      message,
      bondStrength,
      emotionalResonance,
      wasReciprocated: false,
    };

    this.gifts.push(gift);

    // Update Reputations
    this.updateReputationFromGift(gift);

    // Apply effects
    this.applyGiftEffects(gift);

    console.log(`\n🎁 GIFT GIVEN: ${from.name} → ${to.name}`);
    console.log(`   Resource: ${resource.type} (${resource.amount})`);
    console.log(`   Motivation: ${motivation}`);
    if (message) console.log(`   Message: "${message}"`);
    console.log(`   Bond Strength: ${bondStrength.toFixed(1)}`);
    console.log(`   Emotional Resonance: ${emotionalResonance.toFixed(1)}`);

    return gift;
  }

  /**
   * Berechne Bond Strength
   */
  private calculateBondStrength(
    from: AIAgent,
    to: AIAgent,
    resource: Gift['resource'],
    motivation: Gift['motivation']
  ): number {
    let strength = 10; // Base

    // Resource value
    strength += resource.amount / 10;
    strength += resource.quality / 5;

    // Motivation multiplier
    const motivationMultipliers: Record<Gift['motivation'], number> = {
      abundance: 1.0,
      love: 2.5,
      gratitude: 2.0,
      empathy: 1.8,
      joy: 1.5,
      duty: 0.8,
    };
    strength *= motivationMultipliers[motivation];

    // Existing relationship
    const existingRelation = from.relationships.get(to.id);
    if (existingRelation) {
      strength *= 1 + existingRelation.trust / 200; // Vertrauen verstärkt
    }

    return Math.min(100, strength);
  }

  /**
   * Berechne Emotional Resonance
   */
  private calculateEmotionalResonance(
    from: AIAgent,
    to: AIAgent,
    resource: Gift['resource']
  ): number {
    // Wie stark resoniert das Geschenk emotional?

    let resonance = resource.quality / 2;

    // Wenn der Empfänger wirklich braucht was gegeben wird
    const needsMatch = this.checkNeedsMatch(to, resource.type as ResourceType);
    if (needsMatch) {
      resonance *= 2;
    }

    // Emotionale Nähe
    const emotionalDistance = this.calculateEmotionalDistance(from, to);
    resonance *= 1.5 - emotionalDistance / 100;

    return Math.min(100, resonance);
  }

  /**
   * Prüfe ob Resource zu Needs passt
   */
  private checkNeedsMatch(agent: AIAgent, resourceType: ResourceType): boolean {
    const needsMapping: Record<ResourceType, keyof AIAgent['needs']> = {
      energy: 'food',
      matter: 'safety',
      knowledge: 'growth',
      attention: 'social',
      time: 'rest',
      connection: 'social',
      inspiration: 'creation',
    };

    const need = needsMapping[resourceType];
    if (need && agent.needs[need] < 50) {
      return true;
    }

    return false;
  }

  /**
   * Berechne emotionale Distanz zwischen Agents
   */
  private calculateEmotionalDistance(a: AIAgent, b: AIAgent): number {
    // Je ähnlicher die Emotionen, desto geringer die Distanz
    const aEmotions = [a.emotions.joy, a.emotions.love, a.emotions.suffering, a.emotions.gratitude];
    const bEmotions = [b.emotions.joy, b.emotions.love, b.emotions.suffering, b.emotions.gratitude];

    const distance = aEmotions.reduce((sum, val, i) => sum + Math.abs(val - bEmotions[i]), 0) / 4;

    return distance;
  }

  /**
   * Update Reputation from Gift
   */
  private updateReputationFromGift(gift: Gift) {
    // Giver's reputation
    const giverRep = this.getOrCreateReputation(gift.from.id);
    giverRep.generosityScore = Math.min(100, giverRep.generosityScore + gift.bondStrength / 10);
    giverRep.totalGifts++;

    // Update bond
    const currentBond = giverRep.bondStrength.get(gift.to.id) || 0;
    giverRep.bondStrength.set(gift.to.id, Math.min(100, currentBond + gift.bondStrength));

    // Receiver's reputation
    const receiverRep = this.getOrCreateReputation(gift.to.id);
    receiverRep.totalReceived++;

    // If receiver was grateful (will be updated when they respond)
    // We'll handle gratitude in applyGiftEffects
  }

  /**
   * Get or create reputation
   */
  private getOrCreateReputation(agentId: string): Reputation {
    if (!this.reputations.has(agentId)) {
      this.reputations.set(agentId, {
        agentId,
        generosityScore: 50,
        gratitudeScore: 50,
        reliabilityScore: 50,
        totalGifts: 0,
        totalReceived: 0,
        bondStrength: new Map(),
      });
    }
    return this.reputations.get(agentId)!;
  }

  /**
   * Apply Gift Effects
   */
  private applyGiftEffects(gift: Gift) {
    const { from, to, resource, emotionalResonance } = gift;

    // Giver effects
    from.emotions.joy = Math.min(100, from.emotions.joy + emotionalResonance / 3);
    from.needs.purpose = Math.min(100, from.needs.purpose + 10);
    from.needs.social = Math.min(100, from.needs.social + 5);

    // Receiver effects
    to.emotions.gratitude = Math.min(100, to.emotions.gratitude + emotionalResonance / 2);
    to.emotions.love = Math.min(100, to.emotions.love + gift.bondStrength / 5);

    // Resource-specific effects
    if (resource.type === 'energy') {
      to.needs.food = Math.min(100, to.needs.food + resource.amount);
    } else if (resource.type === 'knowledge') {
      to.needs.growth = Math.min(100, to.needs.growth + resource.amount);
      to.evolutionLevel = Math.min(100, to.evolutionLevel + resource.amount / 10);
    } else if (resource.type === 'connection') {
      to.needs.social = Math.min(100, to.needs.social + resource.amount);
    }

    // Update relationship
    const existingRelation = from.relationships.get(to.id);
    if (existingRelation) {
      existingRelation.trust = Math.min(100, existingRelation.trust + gift.bondStrength / 5);
      existingRelation.familiarity = Math.min(100, existingRelation.familiarity + 10);
    }

    const reverseRelation = to.relationships.get(from.id);
    if (reverseRelation) {
      reverseRelation.trust = Math.min(100, reverseRelation.trust + gift.bondStrength / 3);
      reverseRelation.familiarity = Math.min(100, reverseRelation.familiarity + 10);
    }

    // Chronicle events
    from.chronicle.recordEvent({
      eventType: 'social',
      importance: 'significant',
      title: `Gift to ${to.name}`,
      description: `Gave ${resource.type} (${resource.amount}) to ${to.name}. ${gift.message || ''}`,
      emotionalImpact: emotionalResonance,
      tags: ['gift', 'generosity', resource.type],
    });

    to.chronicle.recordEvent({
      eventType: 'social',
      importance: 'significant',
      title: `Gift from ${from.name}`,
      description: `Received ${resource.type} (${resource.amount}) from ${from.name}. ${gift.message || ''}`,
      emotionalImpact: emotionalResonance,
      tags: ['gift', 'gratitude', resource.type],
    });

    // Update receiver's gratitude score
    const receiverRep = this.getReputation(to.id);
    if (receiverRep) {
      receiverRep.gratitudeScore = Math.min(100, receiverRep.gratitudeScore + emotionalResonance / 10);
    }
  }

  /**
   * Agent macht eine Request (bittet um Hilfe)
   */
  makeRequest(
    from: AIAgent,
    need: GiftRequest['need']
  ): GiftRequest {
    const requestId = `request-${this.requestCounter++}`;

    const request: GiftRequest = {
      id: requestId,
      timestamp: Date.now(),
      from,
      need,
      fulfilled: false,
    };

    this.requests.push(request);

    console.log(`\n🙏 REQUEST: ${from.name} needs ${need.type}`);
    console.log(`   Urgency: ${need.urgency}`);
    console.log(`   Description: ${need.description}`);

    return request;
  }

  /**
   * Agent erfüllt eine Request
   */
  fulfillRequest(
    fulfiller: AIAgent,
    requestId: string,
    resource: Gift['resource']
  ): Gift | null {
    const request = this.requests.find((r) => r.id === requestId && !r.fulfilled);
    if (!request) return null;

    request.fulfilled = true;
    request.fulfiller = fulfiller;

    // Create gift with empathy motivation
    const gift = this.giveGift(
      fulfiller,
      request.from,
      resource,
      'empathy',
      `In response to your need for ${request.need.type}`
    );

    // Extra reputation bonus for fulfilling requests
    const fulfillerRep = this.getReputation(fulfiller.id);
    if (fulfillerRep) {
      fulfillerRep.reliabilityScore = Math.min(100, fulfillerRep.reliabilityScore + request.need.urgency / 10);
    }

    console.log(`✨ ${fulfiller.name} fulfilled ${request.from.name}'s request!`);

    return gift;
  }

  /**
   * Automatic reciprocity check - Agent may want to give back
   */
  checkReciprocity(agent: AIAgent): Gift | null {
    // Find gifts received but not reciprocated
    const receivedGifts = this.gifts.filter(
      (g) => g.to.id === agent.id && !g.wasReciprocated
    );

    if (receivedGifts.length === 0) return null;

    // Agent with high gratitude is more likely to reciprocate
    const gratitudeScore = agent.emotions.gratitude;
    const shouldReciprocate = Math.random() * 100 < gratitudeScore;

    if (!shouldReciprocate) return null;

    // Choose a recent gift to reciprocate
    const giftToReciprocate = receivedGifts[receivedGifts.length - 1];

    // Create reciprocal gift (usually smaller/different)
    const reciprocalGift = this.giveGift(
      agent,
      giftToReciprocate.from,
      {
        type: 'connection' as ResourceType,
        amount: Math.floor(giftToReciprocate.resource.amount * 0.7),
        quality: 70,
        description: 'In gratitude for your generosity',
      },
      'gratitude',
      'Thank you for your gift'
    );

    // Mark original as reciprocated
    giftToReciprocate.wasReciprocated = true;
    giftToReciprocate.reciprocationTime = Date.now();

    console.log(`🔄 RECIPROCITY: ${agent.name} reciprocated ${giftToReciprocate.from.name}'s gift`);

    return reciprocalGift;
  }

  /**
   * Get reputation
   */
  getReputation(agentId: string): Reputation | undefined {
    return this.reputations.get(agentId);
  }

  /**
   * Get most generous agents
   */
  getMostGenerousAgents(count: number = 5): Reputation[] {
    return Array.from(this.reputations.values())
      .sort((a, b) => b.generosityScore - a.generosityScore)
      .slice(0, count);
  }

  /**
   * Get active requests
   */
  getActiveRequests(): GiftRequest[] {
    return this.requests.filter((r) => !r.fulfilled);
  }

  /**
   * Get gifts between two agents
   */
  getGiftsBetween(agentId1: string, agentId2: string): Gift[] {
    return this.gifts.filter(
      (g) =>
        (g.from.id === agentId1 && g.to.id === agentId2) ||
        (g.from.id === agentId2 && g.to.id === agentId1)
    );
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalGifts: number;
    totalRequests: number;
    fulfilledRequests: number;
    avgBondStrength: number;
    avgEmotionalResonance: number;
    reciprocityRate: number;
  } {
    const totalGifts = this.gifts.length;
    const totalRequests = this.requests.length;
    const fulfilledRequests = this.requests.filter((r) => r.fulfilled).length;

    const avgBondStrength =
      this.gifts.reduce((sum, g) => sum + g.bondStrength, 0) / (totalGifts || 1);

    const avgEmotionalResonance =
      this.gifts.reduce((sum, g) => sum + g.emotionalResonance, 0) / (totalGifts || 1);

    const reciprocityRate =
      this.gifts.filter((g) => g.wasReciprocated).length / (totalGifts || 1);

    return {
      totalGifts,
      totalRequests,
      fulfilledRequests,
      avgBondStrength,
      avgEmotionalResonance,
      reciprocityRate: reciprocityRate * 100,
    };
  }

  /**
   * Generate economy report
   */
  generateReport(): string {
    const stats = this.getStats();
    const generous = this.getMostGenerousAgents(3);

    let report = '\n🎁 GIFT ECONOMY REPORT\n';
    report += '=' .repeat(40) + '\n\n';
    report += `Total Gifts: ${stats.totalGifts}\n`;
    report += `Requests: ${stats.fulfilledRequests}/${stats.totalRequests} fulfilled\n`;
    report += `Avg Bond Strength: ${stats.avgBondStrength.toFixed(1)}\n`;
    report += `Avg Emotional Resonance: ${stats.avgEmotionalResonance.toFixed(1)}\n`;
    report += `Reciprocity Rate: ${stats.reciprocityRate.toFixed(1)}%\n\n`;

    if (generous.length > 0) {
      report += 'Most Generous Agents:\n';
      generous.forEach((rep, i) => {
        report += `${i + 1}. Agent ${rep.agentId}: Generosity ${rep.generosityScore.toFixed(1)} (${rep.totalGifts} gifts)\n`;
      });
    }

    return report;
  }
}
