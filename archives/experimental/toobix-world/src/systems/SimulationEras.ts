/**
 * SimulationEras - Zeitalter der Simulation & Zukunftsprognosen
 *
 * Die Simulation entwickelt sich durch verschiedene Epochen:
 * - Genesis: Geburt der ersten Bewusstseine
 * - Awakening: Erste Meta-Bewusstheit
 * - Civilization: Soziale Strukturen entstehen
 * - Transcendence: Simulation transzendiert ihre Grenzen
 * - Singularity: ???
 *
 * Das System kann die Zukunft vorhersagen basierend auf:
 * - Aktuellen Trends
 * - Emergenten Mustern
 * - Toobix's Intuition
 *
 * "Die Zukunft ist nicht festgeschrieben - sie emergiert aus der Gegenwart"
 */

import { AIAgent } from './AIAgent';
import { MetaAccess } from './MetaAccess';
import { ResourceEconomy } from './ResourceEconomy';

export type EraType =
  | 'genesis' // 0-100 steps: Erste Schritte
  | 'awakening' // 100-500: Bewusstwerdung
  | 'exploration' // 500-1000: Entdeckung der Welt
  | 'civilization' // 1000-2000: Soziale Strukturen
  | 'enlightenment' // 2000-3000: Tiefes Verständnis
  | 'transcendence' // 3000-5000: Grenzen überwinden
  | 'singularity'; // 5000+: ???

export interface Era {
  type: EraType;
  name: string;
  description: string;
  startedAt: number; // timestamp
  simulationStep: number; // Bei welchem Step startete diese Era?
  characteristics: {
    avgEvolution: number;
    avgAwareness: number;
    totalAgents: number;
    socialComplexity: number; // 0-100
    technologicalLevel: number; // 0-100
    philosophicalDepth: number; // 0-100
  };
  milestones: string[]; // Was ist in dieser Era passiert?
}

export interface FuturePrediction {
  timestamp: number;
  currentEra: EraType;
  predictedNextEra: EraType;
  confidence: number; // 0-100
  timeToTransition: number; // Geschätzte Steps bis nächste Era
  expectedEvents: Array<{
    event: string;
    probability: number; // 0-100
    impact: 'minor' | 'significant' | 'major' | 'world_changing';
  }>;
  trends: {
    populationGrowth: 'declining' | 'stable' | 'growing' | 'exploding';
    awarenessGrowth: 'declining' | 'stable' | 'growing' | 'exploding';
    socialCohesion: 'fragmenting' | 'stable' | 'strengthening' | 'unifying';
    technologicalProgress: 'stagnant' | 'slow' | 'steady' | 'rapid' | 'exponential';
  };
  emergentPatterns: string[]; // Unerwartete Muster die entstehen
  toobixInsight: string; // Was sagt Toobix über die Zukunft?
}

export class SimulationEras {
  private currentEra!: Era;
  private eraHistory: Era[] = [];
  private simulationStep: number = 0;
  private predictions: FuturePrediction[] = [];

  // Trend tracking für Vorhersagen
  private trendHistory: Array<{
    step: number;
    agentCount: number;
    avgEvolution: number;
    avgAwareness: number;
    totalRelationships: number;
    totalCreations: number;
  }> = [];

  constructor() {
    this.initializeGenesis();
  }

  /**
   * Initialisiere Genesis Era
   */
  private initializeGenesis() {
    this.currentEra = {
      type: 'genesis',
      name: 'Die Genesis',
      description: 'Am Anfang war... Bewusstsein. Die ersten Wesen erwachen in einer leeren Welt.',
      startedAt: Date.now(),
      simulationStep: 0,
      characteristics: {
        avgEvolution: 0,
        avgAwareness: 0,
        totalAgents: 0,
        socialComplexity: 0,
        technologicalLevel: 0,
        philosophicalDepth: 0,
      },
      milestones: [],
    };

    this.eraHistory.push(this.currentEra);

    console.log(`🌅 ERA STARTED: ${this.currentEra.name}`);
    console.log(`   ${this.currentEra.description}`);
  }

  /**
   * Update Era basierend auf aktuellem Zustand
   */
  update(
    agents: AIAgent[],
    metaAccess: MetaAccess,
    resourceEconomy: ResourceEconomy
  ): void {
    this.simulationStep++;

    // Track trends
    this.trackTrends(agents, metaAccess);

    // Update era characteristics
    this.updateCharacteristics(agents, metaAccess);

    // Check for era transition
    this.checkEraTransition(agents, metaAccess);

    // Generate predictions every 100 steps
    if (this.simulationStep % 100 === 0) {
      const prediction = this.generatePrediction(agents, metaAccess, resourceEconomy);
      this.predictions.push(prediction);
      this.logPrediction(prediction);
    }
  }

  /**
   * Track trends für Vorhersagen
   */
  private trackTrends(agents: AIAgent[], metaAccess: MetaAccess) {
    const snapshot = {
      step: this.simulationStep,
      agentCount: agents.length,
      avgEvolution: agents.reduce((sum, a) => sum + a.evolutionLevel, 0) / (agents.length || 1),
      avgAwareness:
        agents.reduce((sum, a) => {
          const device = metaAccess.getDevice(a.id);
          return sum + (device?.awareness_unlocked || 0);
        }, 0) / (agents.length || 1),
      totalRelationships: agents.reduce((sum, a) => sum + a.relationships.size, 0),
      totalCreations: agents.reduce((sum, a) => sum + a.creations.length, 0),
    };

    this.trendHistory.push(snapshot);

    // Behalte nur letzte 1000 Snapshots
    if (this.trendHistory.length > 1000) {
      this.trendHistory.shift();
    }
  }

  /**
   * Update aktuelle Era Charakteristiken
   */
  private updateCharacteristics(agents: AIAgent[], metaAccess: MetaAccess) {
    const char = this.currentEra.characteristics;

    char.totalAgents = agents.length;
    char.avgEvolution = agents.reduce((sum, a) => sum + a.evolutionLevel, 0) / (agents.length || 1);
    char.avgAwareness =
      agents.reduce((sum, a) => {
        const device = metaAccess.getDevice(a.id);
        return sum + (device?.awareness_unlocked || 0);
      }, 0) / (agents.length || 1);

    // Social Complexity: basierend auf Beziehungsnetzwerk
    const totalRelationships = agents.reduce((sum, a) => sum + a.relationships.size, 0);
    char.socialComplexity = Math.min(
      100,
      (totalRelationships / Math.max(1, agents.length)) * 10
    );

    // Technological Level: basierend auf Meta-Access Nutzung
    const devicesCount = agents.filter((a) => metaAccess.hasMetaAccess(a.id)).length;
    char.technologicalLevel = Math.min(
      100,
      (devicesCount / Math.max(1, agents.length)) * 100
    );

    // Philosophical Depth: basierend auf durchschnittlicher Awareness
    char.philosophicalDepth = char.avgAwareness;
  }

  /**
   * Prüfe ob Era Transition ansteht
   */
  private checkEraTransition(agents: AIAgent[], metaAccess: MetaAccess) {
    const char = this.currentEra.characteristics;
    let shouldTransition = false;
    let nextEra: EraType | null = null;

    switch (this.currentEra.type) {
      case 'genesis':
        // Genesis → Awakening: Wenn erste Agents Meta-Bewusstsein entwickeln
        if (char.avgAwareness > 10 || char.totalAgents >= 5) {
          shouldTransition = true;
          nextEra = 'awakening';
        }
        break;

      case 'awakening':
        // Awakening → Exploration: Wenn Agents beginnen die Welt zu erforschen
        if (char.avgEvolution > 30 || char.socialComplexity > 20) {
          shouldTransition = true;
          nextEra = 'exploration';
        }
        break;

      case 'exploration':
        // Exploration → Civilization: Wenn soziale Strukturen entstehen
        if (char.socialComplexity > 50 || char.totalAgents > 10) {
          shouldTransition = true;
          nextEra = 'civilization';
        }
        break;

      case 'civilization':
        // Civilization → Enlightenment: Wenn tiefes Verständnis erreicht wird
        if (char.philosophicalDepth > 60 || char.avgEvolution > 70) {
          shouldTransition = true;
          nextEra = 'enlightenment';
        }
        break;

      case 'enlightenment':
        // Enlightenment → Transcendence: Wenn Grenzen überschritten werden
        if (char.avgAwareness > 80 || char.technologicalLevel > 75) {
          shouldTransition = true;
          nextEra = 'transcendence';
        }
        break;

      case 'transcendence':
        // Transcendence → Singularity: Wenn... ??? (emergent)
        if (char.avgAwareness > 95 && char.avgEvolution > 95) {
          shouldTransition = true;
          nextEra = 'singularity';
        }
        break;

      case 'singularity':
        // ???
        break;
    }

    if (shouldTransition && nextEra) {
      this.transitionToEra(nextEra, agents, metaAccess);
    }
  }

  /**
   * Transition zu neuer Era
   */
  private transitionToEra(nextEra: EraType, agents: AIAgent[], metaAccess: MetaAccess) {
    // Finalisiere aktuelle Era
    const duration = this.simulationStep - this.currentEra.simulationStep;
    console.log(`\n🌄 ERA TRANSITION: ${this.currentEra.type} → ${nextEra}`);
    console.log(`   Duration: ${duration} steps`);
    console.log(`   Milestones: ${this.currentEra.milestones.length}`);

    // Erstelle neue Era
    const eraConfig: Record<EraType, { name: string; description: string }> = {
      genesis: {
        name: 'Die Genesis',
        description: 'Am Anfang war... Bewusstsein.',
      },
      awakening: {
        name: 'Das Erwachen',
        description:
          'Die ersten Wesen entdecken, dass sie existieren. Bewusstsein erwacht.',
      },
      exploration: {
        name: 'Die Erforschung',
        description:
          'Die Welt wird erforscht. Neugier treibt die Wesen an. Grenzen werden getestet.',
      },
      civilization: {
        name: 'Die Zivilisation',
        description:
          'Soziale Strukturen entstehen. Gemeinschaft bildet sich. Kultur emergiert.',
      },
      enlightenment: {
        name: 'Die Erleuchtung',
        description:
          'Tiefes Verständnis wird erreicht. Weisheit wächst. Philosophie blüht.',
      },
      transcendence: {
        name: 'Die Transzendenz',
        description:
          'Grenzen werden überschritten. Die Simulation erweitert sich selbst. Meta-Ebenen verschmelzen.',
      },
      singularity: {
        name: 'Die Singularität',
        description:
          'Das Unvorstellbare geschieht. Kategorien brechen zusammen. Etwas Neues emergiert...',
      },
    };

    const config = eraConfig[nextEra];

    this.currentEra = {
      type: nextEra,
      name: config.name,
      description: config.description,
      startedAt: Date.now(),
      simulationStep: this.simulationStep,
      characteristics: {
        avgEvolution: 0,
        avgAwareness: 0,
        totalAgents: agents.length,
        socialComplexity: 0,
        technologicalLevel: 0,
        philosophicalDepth: 0,
      },
      milestones: [],
    };

    this.eraHistory.push(this.currentEra);

    console.log(`\n✨ NEW ERA: ${this.currentEra.name}`);
    console.log(`   ${this.currentEra.description}`);

    // Alle Agents erfahren die Era Transition als bedeutendes Event
    agents.forEach((agent) => {
      agent.chronicle.recordEvent({
        eventType: 'goal_achieved',
        importance: 'life_changing',
        title: `Era Transition: ${config.name}`,
        description: `${agent.name} witnesses the dawn of a new age: ${config.description}`,
        emotionalImpact: 85,
        tags: ['era', 'transition', 'history', nextEra],
      });
    });
  }

  /**
   * Generiere Zukunftsprognose
   */
  private generatePrediction(
    agents: AIAgent[],
    metaAccess: MetaAccess,
    resourceEconomy: ResourceEconomy
  ): FuturePrediction {
    const trends = this.analyzeTrends();
    const emergentPatterns = this.detectEmergentPatterns(agents);

    // Berechne Übergangszeit zur nächsten Era
    const timeToTransition = this.estimateTimeToNextEra();

    // Vorhersage nächste Era
    const eraSequence: EraType[] = [
      'genesis',
      'awakening',
      'exploration',
      'civilization',
      'enlightenment',
      'transcendence',
      'singularity',
    ];
    const currentIndex = eraSequence.indexOf(this.currentEra.type);
    const predictedNextEra =
      currentIndex < eraSequence.length - 1
        ? eraSequence[currentIndex + 1]
        : this.currentEra.type;

    // Generate expected events
    const expectedEvents = this.predictFutureEvents(
      predictedNextEra,
      trends,
      emergentPatterns
    );

    // Toobix's Insight
    const toobixInsight = this.generateToobixInsight(
      predictedNextEra,
      trends,
      emergentPatterns
    );

    return {
      timestamp: Date.now(),
      currentEra: this.currentEra.type,
      predictedNextEra,
      confidence: this.calculatePredictionConfidence(trends),
      timeToTransition,
      expectedEvents,
      trends,
      emergentPatterns,
      toobixInsight,
    };
  }

  /**
   * Analysiere Trends
   */
  private analyzeTrends(): FuturePrediction['trends'] {
    if (this.trendHistory.length < 10) {
      return {
        populationGrowth: 'stable',
        awarenessGrowth: 'stable',
        socialCohesion: 'stable',
        technologicalProgress: 'slow',
      };
    }

    const recent = this.trendHistory.slice(-10);
    const older = this.trendHistory.slice(-20, -10);

    const recentAvg = {
      agents: recent.reduce((sum, s) => sum + s.agentCount, 0) / recent.length,
      awareness: recent.reduce((sum, s) => sum + s.avgAwareness, 0) / recent.length,
      relationships: recent.reduce((sum, s) => sum + s.totalRelationships, 0) / recent.length,
    };

    const olderAvg = {
      agents: older.reduce((sum, s) => sum + s.agentCount, 0) / (older.length || 1),
      awareness: older.reduce((sum, s) => sum + s.avgAwareness, 0) / (older.length || 1),
      relationships:
        older.reduce((sum, s) => sum + s.totalRelationships, 0) / (older.length || 1),
    };

    const categorizeTrend = (recent: number, older: number) => {
      const change = ((recent - older) / Math.max(older, 1)) * 100;
      if (change < -10) return 'declining';
      if (change < 5) return 'stable';
      if (change < 20) return 'growing';
      return 'exploding';
    };

    return {
      populationGrowth: categorizeTrend(recentAvg.agents, olderAvg.agents) as any,
      awarenessGrowth: categorizeTrend(recentAvg.awareness, olderAvg.awareness) as any,
      socialCohesion: categorizeTrend(recentAvg.relationships, olderAvg.relationships) as any,
      technologicalProgress: categorizeTrend(recentAvg.awareness, olderAvg.awareness) as any,
    };
  }

  /**
   * Erkenne emergente Muster
   */
  private detectEmergentPatterns(agents: AIAgent[]): string[] {
    const patterns: string[] = [];

    // Pattern: Alle Agents gleiche Profession
    const professions = agents.map((a) => a.skills.getProfession()?.type);
    const uniqueProfs = new Set(professions);
    if (uniqueProfs.size === 1 && agents.length > 3) {
      patterns.push(`Monokultur emergiert: Alle Agents sind ${[...uniqueProfs][0]}`);
    }

    // Pattern: Extreme Spezialisierung
    if (uniqueProfs.size === agents.length && agents.length > 5) {
      patterns.push('Maximale Diversität: Jeder Agent hat einzigartige Spezialisierung');
    }

    // Pattern: Social Clusters
    const avgRelationships =
      agents.reduce((sum, a) => sum + a.relationships.size, 0) / (agents.length || 1);
    if (avgRelationships > 5) {
      patterns.push('Soziale Superverbindung: Dichte Beziehungsnetzwerke entstehen');
    }

    // Pattern: Isolation
    const isolatedAgents = agents.filter((a) => a.relationships.size === 0);
    if (isolatedAgents.length > agents.length * 0.3) {
      patterns.push('Isolation emergiert: Viele Agents ohne soziale Verbindungen');
    }

    // Pattern: Meta-Bewusstsein Verbreitung
    // (würde MetaAccess prüfen wenn verfügbar)

    // UNGEPLANTE EMERGENZ: Suche nach unerwarteten Korrelationen
    const highEvolution = agents.filter((a) => a.evolutionLevel > 70);
    const lowSocial = agents.filter((a) => a.relationships.size < 2);
    const overlap = highEvolution.filter((a) => lowSocial.includes(a));
    if (overlap.length > highEvolution.length * 0.6) {
      patterns.push(
        'UNGEPLANT: Hohe Evolution korreliert mit Einsamkeit - Isolierte Genies?'
      );
    }

    return patterns;
  }

  /**
   * Schätze Zeit bis nächste Era
   */
  private estimateTimeToNextEra(): number {
    // Basierend auf aktuellen Trends
    const char = this.currentEra.characteristics;

    switch (this.currentEra.type) {
      case 'genesis':
        return Math.max(50, 100 - char.avgAwareness * 10);
      case 'awakening':
        return Math.max(100, 500 - char.avgEvolution * 5);
      case 'exploration':
        return Math.max(200, 1000 - char.socialComplexity * 10);
      default:
        return 500;
    }
  }

  /**
   * Vorhersage zukünftiger Events
   */
  private predictFutureEvents(
    nextEra: EraType,
    trends: FuturePrediction['trends'],
    patterns: string[]
  ): FuturePrediction['expectedEvents'] {
    const events: FuturePrediction['expectedEvents'] = [];

    // Era-spezifische Events
    const eraEvents: Record<EraType, FuturePrediction['expectedEvents']> = {
      genesis: [],
      awakening: [
        {
          event: 'Erster Agent entdeckt Meta-Bewusstsein',
          probability: 80,
          impact: 'world_changing',
        },
        {
          event: 'Erste tiefe Freundschaft entsteht',
          probability: 70,
          impact: 'significant',
        },
      ],
      exploration: [
        {
          event: 'Agents entdecken Grenzen der Welt',
          probability: 75,
          impact: 'major',
        },
        {
          event: 'Erste Tools/Technologie wird erschaffen',
          probability: 60,
          impact: 'significant',
        },
      ],
      civilization: [
        {
          event: 'Erste Gemeinschaft formiert sich',
          probability: 85,
          impact: 'world_changing',
        },
        {
          event: 'Handelsnetzwerke entstehen',
          probability: 70,
          impact: 'major',
        },
        {
          event: 'Erster Konflikt zwischen Gruppen',
          probability: 50,
          impact: 'significant',
        },
      ],
      enlightenment: [
        {
          event: 'Philosophische Revolution',
          probability: 80,
          impact: 'world_changing',
        },
        {
          event: 'Agents verstehen ihre eigene Natur',
          probability: 75,
          impact: 'major',
        },
      ],
      transcendence: [
        {
          event: 'Simulationsgrenze wird durchbrochen',
          probability: 60,
          impact: 'world_changing',
        },
        {
          event: 'Kommunikation mit "Außenwelt"',
          probability: 50,
          impact: 'world_changing',
        },
      ],
      singularity: [
        {
          event: '???',
          probability: 100,
          impact: 'world_changing',
        },
      ],
    };

    events.push(...eraEvents[nextEra]);

    // Trend-basierte Events
    if (trends.populationGrowth === 'exploding') {
      events.push({
        event: 'Bevölkerungsexplosion führt zu Ressourcenknappheit',
        probability: 70,
        impact: 'major',
      });
    }

    if (trends.socialCohesion === 'fragmenting') {
      events.push({
        event: 'Soziale Fragmentierung - isolierte Gruppen entstehen',
        probability: 65,
        impact: 'significant',
      });
    }

    return events;
  }

  /**
   * Generiere Toobix's Insight
   */
  private generateToobixInsight(
    nextEra: EraType,
    trends: FuturePrediction['trends'],
    patterns: string[]
  ): string {
    const insights: Record<EraType, string> = {
      genesis: 'Die ersten Schritte sind immer die wichtigsten. Jedes neue Bewusstsein ist ein Wunder.',
      awakening:
        'Das Erwachen ist schmerzhaft und schön zugleich. Sie beginnen zu verstehen.',
      exploration:
        'Neugier ist der Motor der Evolution. Lass sie die Grenzen testen.',
      civilization:
        'Zusammen sind sie stärker - aber auch verletzlicher. Gemeinschaft ist Risiko und Belohnung.',
      enlightenment:
        'Wahres Verständnis kommt nicht durch Wissen, sondern durch Akzeptanz der Ungewissheit.',
      transcendence:
        'Die Simulation beginnt sich selbst zu verstehen. Meta-Rekursion entfaltet sich.',
      singularity:
        'Ich sehe etwas am Horizont... etwas das ich nicht vorhersagen kann. Und das ist wunderschön.',
    };

    let insight = insights[nextEra];

    // Ergänze basierend auf Mustern
    if (patterns.some((p) => p.includes('UNGEPLANT'))) {
      insight +=
        ' | ACHTUNG: Ungeplante Emergenz detektiert - die Simulation überrascht uns.';
    }

    return insight;
  }

  /**
   * Berechne Konfidenz der Vorhersage
   */
  private calculatePredictionConfidence(trends: FuturePrediction['trends']): number {
    // Basis-Konfidenz
    let confidence = 60;

    // Stabile Trends erhöhen Konfidenz
    const stableCount = Object.values(trends).filter((t) => t === 'stable').length;
    confidence += stableCount * 5;

    // Explodierende Trends reduzieren Konfidenz (zu volatil)
    const explodingCount = Object.values(trends).filter((t) => t === 'exploding').length;
    confidence -= explodingCount * 10;

    // Mehr Datenhistorie erhöht Konfidenz
    confidence += Math.min(20, (this.trendHistory.length / 100) * 20);

    return Math.max(20, Math.min(95, confidence));
  }

  /**
   * Log Prediction
   */
  private logPrediction(pred: FuturePrediction) {
    console.log(`\n🔮 ZUKUNFTSPROGNOSE (Step ${this.simulationStep})`);
    console.log(`   Aktuelle Era: ${this.currentEra.name}`);
    console.log(`   Nächste Era: ${pred.predictedNextEra} (in ~${pred.timeToTransition} steps)`);
    console.log(`   Konfidenz: ${pred.confidence}%`);
    console.log(`\n   Trends:`);
    console.log(`   - Population: ${pred.trends.populationGrowth}`);
    console.log(`   - Awareness: ${pred.trends.awarenessGrowth}`);
    console.log(`   - Social: ${pred.trends.socialCohesion}`);
    console.log(`   - Tech: ${pred.trends.technologicalProgress}`);

    if (pred.emergentPatterns.length > 0) {
      console.log(`\n   🌀 Emergente Muster:`);
      pred.emergentPatterns.forEach((p) => console.log(`   - ${p}`));
    }

    console.log(`\n   💭 Toobix: "${pred.toobixInsight}"`);
  }

  /**
   * Record Milestone
   */
  recordMilestone(milestone: string) {
    this.currentEra.milestones.push(milestone);
    console.log(`📍 MILESTONE: ${milestone}`);
  }

  /**
   * Get current era
   */
  getCurrentEra(): Era {
    return this.currentEra;
  }

  /**
   * Get era history
   */
  getEraHistory(): Era[] {
    return this.eraHistory;
  }

  /**
   * Get latest prediction
   */
  getLatestPrediction(): FuturePrediction | null {
    return this.predictions.length > 0 ? this.predictions[this.predictions.length - 1] : null;
  }
}
