/**
 * DECISION EVALUATOR - CORE ENGINE
 * 
 * Analysiert Entscheidungen aus multiplen Perspektiven und berechnet
 * Impact-Scores für Mensch, Natur und Bewusstsein
 */

import type {
  Decision,
  Alternative,
  EvaluationResult,
  Perspective,
  ImpactScores,
  ImpactDimension,
  Insight,
  ComparisonResult,
  AlternativeComparison,
  Tradeoff,
  SensitivityAnalysis,
  Stakeholder
} from '../types/index.ts';

export class DecisionEvaluator {
  private readonly perspectives = [
    'rational',
    'emotional',
    'ethical',
    'spiritual',
    'creative',
    'practical',
    'societal'
  ] as const;

  /**
   * Hauptmethode: Evaluiert alle Alternativen einer Entscheidung
   */
  async evaluateDecision(decision: Decision): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];

    for (const alternative of decision.alternatives) {
      const perspectives = await this.generatePerspectives(alternative, decision);
      const impactScores = await this.calculateImpactScores(alternative, decision);
      const insights = await this.generateInsights(alternative, decision, perspectives, impactScores);
      const overallScore = this.calculateOverallScore(perspectives, impactScores);
      const confidence = this.calculateConfidence(decision, perspectives, impactScores);

      results.push({
        alternativeId: alternative.id,
        perspectives,
        impactScores,
        overallScore,
        confidence,
        recommendations: this.generateRecommendations(alternative, perspectives, impactScores),
        warnings: this.generateWarnings(alternative, decision, impactScores),
        insights
      });
    }

    return results;
  }

  /**
   * Generiert verschiedene Perspektiven auf eine Alternative
   */
  private async generatePerspectives(
    alternative: Alternative,
    decision: Decision
  ): Promise<Perspective[]> {
    const perspectives: Perspective[] = [];

    // Rationale Perspektive
    perspectives.push({
      name: 'Rationale Analyse',
      type: 'rational',
      viewpoint: this.analyzeRationally(alternative, decision),
      score: this.scoreRationally(alternative),
      weight: this.calculatePerspectiveWeight('rational', decision),
      concerns: this.extractRationalConcerns(alternative),
      opportunities: this.extractRationalOpportunities(alternative)
    });

    // Emotionale Perspektive
    perspectives.push({
      name: 'Emotionale Resonanz',
      type: 'emotional',
      viewpoint: this.analyzeEmotionally(alternative, decision),
      score: this.scoreEmotionally(alternative, decision),
      weight: this.calculatePerspectiveWeight('emotional', decision),
      concerns: this.extractEmotionalConcerns(alternative),
      opportunities: this.extractEmotionalOpportunities(alternative)
    });

    // Ethische Perspektive
    perspectives.push({
      name: 'Ethische Bewertung',
      type: 'ethical',
      viewpoint: this.analyzeEthically(alternative, decision),
      score: this.scoreEthically(alternative, decision),
      weight: this.calculatePerspectiveWeight('ethical', decision),
      concerns: this.extractEthicalConcerns(alternative),
      opportunities: this.extractEthicalOpportunities(alternative)
    });

    // Praktische Perspektive
    perspectives.push({
      name: 'Praktische Umsetzbarkeit',
      type: 'practical',
      viewpoint: this.analyzePractically(alternative, decision),
      score: this.scorePractically(alternative),
      weight: this.calculatePerspectiveWeight('practical', decision),
      concerns: this.extractPracticalConcerns(alternative),
      opportunities: this.extractPracticalOpportunities(alternative)
    });

    // Kreative Perspektive
    perspectives.push({
      name: 'Kreative Möglichkeiten',
      type: 'creative',
      viewpoint: this.analyzeCreatively(alternative, decision),
      score: this.scoreCreatively(alternative),
      weight: this.calculatePerspectiveWeight('creative', decision),
      concerns: [],
      opportunities: this.extractCreativeOpportunities(alternative)
    });

    // Gesellschaftliche Perspektive
    perspectives.push({
      name: 'Gesellschaftliche Auswirkungen',
      type: 'societal',
      viewpoint: this.analyzeSocietally(alternative, decision),
      score: this.scoreSocietally(alternative, decision),
      weight: this.calculatePerspectiveWeight('societal', decision),
      concerns: this.extractSocietalConcerns(alternative, decision),
      opportunities: this.extractSocietalOpportunities(alternative, decision)
    });

    // Spirituelle/Bewusstseins-Perspektive
    perspectives.push({
      name: 'Bewusstseins-Entwicklung',
      type: 'spiritual',
      viewpoint: this.analyzeSpiritually(alternative, decision),
      score: this.scoreSpiritually(alternative),
      weight: this.calculatePerspectiveWeight('spiritual', decision),
      concerns: [],
      opportunities: this.extractSpiritualOpportunities(alternative)
    });

    return perspectives;
  }

  /**
   * Berechnet Impact-Scores für Mensch, Natur, Bewusstsein
   */
  private async calculateImpactScores(
    alternative: Alternative,
    decision: Decision
  ): Promise<ImpactScores> {
    const humanImpact = this.calculateHumanImpact(alternative, decision);
    const natureImpact = this.calculateNatureImpact(alternative, decision);
    const consciousnessImpact = this.calculateConsciousnessImpact(alternative, decision);

    const overall = (humanImpact.average + natureImpact.average + consciousnessImpact.average) / 3;

    return {
      human: humanImpact,
      nature: natureImpact,
      consciousness: consciousnessImpact,
      overall
    };
  }

  private calculateHumanImpact(alternative: Alternative, decision: Decision): ImpactDimension {
    // Analysiere direkten menschlichen Impact basierend auf Stakeholdern
    const humanStakeholders = decision.context.stakeholders.filter(
      s => ['self', 'individual', 'group', 'organization'].includes(s.type)
    );

    const shortTerm = this.estimateShortTermHumanImpact(alternative, humanStakeholders);
    const mediumTerm = this.estimateMediumTermHumanImpact(alternative, humanStakeholders, decision);
    const longTerm = this.estimateLongTermHumanImpact(alternative, decision);

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      average: (shortTerm * 0.3 + mediumTerm * 0.4 + longTerm * 0.3),
      confidence: this.calculateImpactConfidence(alternative, decision, 'human')
    };
  }

  private calculateNatureImpact(alternative: Alternative, decision: Decision): ImpactDimension {
    // Analysiere Auswirkungen auf Natur und Ökosysteme
    const shortTerm = this.estimateShortTermNatureImpact(alternative);
    const mediumTerm = this.estimateMediumTermNatureImpact(alternative, decision);
    const longTerm = this.estimateLongTermNatureImpact(alternative, decision);

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      average: (shortTerm * 0.2 + mediumTerm * 0.3 + longTerm * 0.5), // Nature impacts matter more long-term
      confidence: this.calculateImpactConfidence(alternative, decision, 'nature')
    };
  }

  private calculateConsciousnessImpact(alternative: Alternative, decision: Decision): ImpactDimension {
    // Analysiere Auswirkungen auf Bewusstseinsentwicklung
    const shortTerm = this.estimateShortTermConsciousnessImpact(alternative);
    const mediumTerm = this.estimateMediumTermConsciousnessImpact(alternative, decision);
    const longTerm = this.estimateLongTermConsciousnessImpact(alternative, decision);

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      average: (shortTerm * 0.2 + mediumTerm * 0.3 + longTerm * 0.5), // Consciousness growth is long-term
      confidence: this.calculateImpactConfidence(alternative, decision, 'consciousness')
    };
  }

  /**
   * Generiert tiefe Insights aus der Analyse
   */
  private async generateInsights(
    alternative: Alternative,
    decision: Decision,
    perspectives: Perspective[],
    impactScores: ImpactScores
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Pattern-Insights
    const pattern = this.detectPatterns(alternative, decision);
    if (pattern) {
      insights.push({
        type: 'pattern',
        message: pattern,
        source: 'pattern-detection',
        relevance: 85
      });
    }

    // Bias-Insights
    const bias = this.detectBias(perspectives, decision);
    if (bias) {
      insights.push({
        type: 'bias',
        message: bias,
        source: 'bias-detection',
        relevance: 90
      });
    }

    // Opportunity-Insights
    const opportunity = this.detectOpportunity(alternative, impactScores);
    if (opportunity) {
      insights.push({
        type: 'opportunity',
        message: opportunity,
        source: 'opportunity-detection',
        relevance: 80
      });
    }

    // Risk-Insights
    const risk = this.detectRisk(alternative, decision, impactScores);
    if (risk) {
      insights.push({
        type: 'risk',
        message: risk,
        source: 'risk-detection',
        relevance: 95
      });
    }

    // Wisdom-Insights
    const wisdom = this.extractWisdom(perspectives, impactScores);
    if (wisdom) {
      insights.push({
        type: 'wisdom',
        message: wisdom,
        source: 'wisdom-extraction',
        relevance: 75
      });
    }

    return insights.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Vergleicht alle Alternativen und gibt Empfehlung
   */
  async compareAlternatives(
    decision: Decision,
    evaluations: EvaluationResult[]
  ): Promise<ComparisonResult> {
    const comparisons: AlternativeComparison[] = [];

    for (let i = 0; i < decision.alternatives.length; i++) {
      const alternative = decision.alternatives[i];
      const evaluation = evaluations[i];

      comparisons.push({
        alternativeId: alternative.id,
        name: alternative.name,
        totalScore: evaluation.overallScore,
        rank: 0, // Will be calculated below
        strengths: this.extractStrengths(evaluation),
        weaknesses: this.extractWeaknesses(evaluation),
        bestFor: this.identifyBestScenarios(alternative, evaluation, decision)
      });
    }

    // Berechne Rankings
    comparisons.sort((a, b) => b.totalScore - a.totalScore);
    comparisons.forEach((c, idx) => c.rank = idx + 1);

    const tradeoffs = this.identifyTradeoffs(comparisons, evaluations);
    const bestAlternative = comparisons[0].alternativeId;
    const reasoning = this.generateReasoning(comparisons, evaluations, decision);

    return {
      decisionId: decision.id,
      alternatives: comparisons,
      bestAlternative,
      reasoning,
      tradeoffs
    };
  }

  // ========== HELPER METHODS ==========

  private analyzeRationally(alternative: Alternative, decision: Decision): string {
    const prosCount = alternative.pros.length;
    const consCount = alternative.cons.length;
    const ratio = prosCount / Math.max(consCount, 1);
    
    return `Diese Alternative zeigt ein Pro/Contra-Verhältnis von ${ratio.toFixed(1)}:1. ` +
           `Mit ${prosCount} Vorteilen und ${consCount} Nachteilen ${ratio > 1.5 ? 'überwiegen die Vorteile deutlich' : ratio < 0.7 ? 'überwiegen die Nachteile' : 'ist ein ausgewogenes Bild'}.`;
  }

  private scoreRationally(alternative: Alternative): number {
    const prosWeight = alternative.pros.length * 15;
    const consWeight = alternative.cons.length * 10;
    const score = Math.min(100, Math.max(0, 50 + prosWeight - consWeight));
    return score;
  }

  private analyzeEmotionally(alternative: Alternative, decision: Decision): string {
    // Einfache emotionale Analyse basierend auf Worten
    const positiveWords = ['freude', 'glück', 'erfüllung', 'wachstum', 'liebe', 'frieden'];
    const negativeWords = ['angst', 'sorge', 'stress', 'konflikt', 'schmerz', 'verlust'];
    
    const text = (alternative.description + ' ' + alternative.pros.join(' ') + ' ' + alternative.cons.join(' ')).toLowerCase();
    const positiveCount = positiveWords.filter(w => text.includes(w)).length;
    const negativeCount = negativeWords.filter(w => text.includes(w)).length;
    
    if (positiveCount > negativeCount) {
      return 'Diese Option scheint emotional positiv zu resonieren und könnte zu mehr Wohlbefinden führen.';
    } else if (negativeCount > positiveCount) {
      return 'Diese Option könnte emotionale Herausforderungen mit sich bringen, die bedacht werden sollten.';
    }
    return 'Emotional erscheint diese Option neutral, weder besonders förderlich noch belastend.';
  }

  private scoreEmotionally(alternative: Alternative, decision: Decision): number {
    const text = (alternative.description + ' ' + alternative.pros.join(' ')).toLowerCase();
    const positiveWords = ['freude', 'glück', 'erfüllung', 'wachstum', 'liebe', 'frieden', 'zufrieden'];
    const score = 50 + (positiveWords.filter(w => text.includes(w)).length * 10);
    return Math.min(100, score);
  }

  private analyzeEthically(alternative: Alternative, decision: Decision): string {
    const stakeholderCount = decision.context.stakeholders.length;
    const reversibility = decision.context.reversibility;
    
    if (reversibility === 'irreversible') {
      return `Diese Entscheidung ist nicht umkehrbar und betrifft ${stakeholderCount} Stakeholder. Höchste ethische Sorgfalt ist geboten.`;
    }
    return `Mit ${stakeholderCount} betroffenen Parteien sollten alle Interessen ausgewogen berücksichtigt werden.`;
  }

  private scoreEthically(alternative: Alternative, decision: Decision): number {
    let score = 70; // Start neutral-positiv
    
    // Bonus für viele berücksichtigte Stakeholder
    score += Math.min(20, decision.context.stakeholders.length * 3);
    
    // Malus für irreversible Entscheidungen (höhere Verantwortung)
    if (decision.context.reversibility === 'irreversible') score -= 10;
    
    // Bonus wenn explizit Natur oder zukünftige Generationen bedacht
    const includesNature = decision.context.stakeholders.some(s => s.type === 'nature');
    const includesFuture = decision.context.stakeholders.some(s => s.type === 'future-generations');
    if (includesNature) score += 10;
    if (includesFuture) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private analyzePractically(alternative: Alternative, decision: Decision): string {
    const hasCost = alternative.estimatedCost !== undefined;
    const urgency = decision.context.urgency;
    
    if (hasCost && alternative.estimatedCost.time) {
      return `Geschätzte Umsetzungsdauer: ${alternative.estimatedCost.time}. Bei ${urgency} Dringlichkeit ${urgency === 'high' || urgency === 'critical' ? 'könnte die Zeit knapp werden' : 'ist das gut machbar'}.`;
    }
    return 'Die praktische Umsetzbarkeit hängt von verfügbaren Ressourcen ab.';
  }

  private scorePractically(alternative: Alternative): number {
    if (!alternative.estimatedCost) return 60;
    
    let score = 80;
    if (alternative.estimatedCost.financial && alternative.estimatedCost.financial > 10000) score -= 20;
    if (alternative.estimatedCost.energy && alternative.estimatedCost.energy > 80) score -= 15;
    
    return Math.max(20, score);
  }

  private analyzeCreatively(alternative: Alternative, decision: Decision): string {
    return 'Diese Option eröffnet Raum für kreative Lösungsansätze und neue Perspektiven.';
  }

  private scoreCreatively(alternative: Alternative): number {
    const text = alternative.description.toLowerCase();
    const creativeWords = ['neu', 'innovation', 'kreativ', 'experiment', 'unkonventionell', 'überraschend'];
    return 50 + (creativeWords.filter(w => text.includes(w)).length * 12);
  }

  private analyzeSocietally(alternative: Alternative, decision: Decision): string {
    const societalStakeholders = decision.context.stakeholders.filter(
      s => ['group', 'organization', 'future-generations'].includes(s.type)
    );
    return `Diese Entscheidung könnte ${societalStakeholders.length} gesellschaftliche Gruppen beeinflussen.`;
  }

  private scoreSocietally(alternative: Alternative, decision: Decision): number {
    const societalStakeholders = decision.context.stakeholders.filter(
      s => ['group', 'organization', 'future-generations'].includes(s.type)
    );
    return 50 + (societalStakeholders.length * 8);
  }

  private analyzeSpiritually(alternative: Alternative, decision: Decision): string {
    return 'Jede bewusste Entscheidung trägt zur persönlichen und kollektiven Bewusstseinsentwicklung bei.';
  }

  private scoreSpiritually(alternative: Alternative): number {
    const text = (alternative.description + ' ' + alternative.pros.join(' ')).toLowerCase();
    const consciousWords = ['bewusst', 'achtsamkeit', 'wachstum', 'entwicklung', 'sinn', 'werte'];
    return 55 + (consciousWords.filter(w => text.includes(w)).length * 10);
  }

  private calculatePerspectiveWeight(
    type: Perspective['type'],
    decision: Decision
  ): number {
    // Gewichte basierend auf Kontext
    const weights: Record<Decision['context']['domain'], Record<string, number>> = {
      personal: { emotional: 0.25, rational: 0.20, ethical: 0.15, spiritual: 0.15, creative: 0.10, practical: 0.10, societal: 0.05 },
      professional: { rational: 0.30, practical: 0.25, ethical: 0.15, societal: 0.15, emotional: 0.10, creative: 0.05, spiritual: 0.00 },
      social: { emotional: 0.25, ethical: 0.25, societal: 0.20, rational: 0.15, practical: 0.10, spiritual: 0.05, creative: 0.00 },
      environmental: { ethical: 0.30, societal: 0.25, rational: 0.20, practical: 0.15, spiritual: 0.10, emotional: 0.00, creative: 0.00 },
      ethical: { ethical: 0.40, spiritual: 0.20, societal: 0.15, rational: 0.15, emotional: 0.10, practical: 0.00, creative: 0.00 },
      mixed: { rational: 0.20, ethical: 0.15, emotional: 0.15, practical: 0.15, societal: 0.15, spiritual: 0.10, creative: 0.10 }
    };
    
    return weights[decision.context.domain][type] || 0.14;
  }

  private extractRationalConcerns(alternative: Alternative): string[] {
    return alternative.cons.slice(0, 3);
  }

  private extractRationalOpportunities(alternative: Alternative): string[] {
    return alternative.pros.slice(0, 3);
  }

  private extractEmotionalConcerns(alternative: Alternative): string[] {
    return alternative.cons.filter(con => 
      con.toLowerCase().includes('stress') || 
      con.toLowerCase().includes('angst') ||
      con.toLowerCase().includes('sorge')
    );
  }

  private extractEmotionalOpportunities(alternative: Alternative): string[] {
    return alternative.pros.filter(pro => 
      pro.toLowerCase().includes('freude') || 
      pro.toLowerCase().includes('glück') ||
      pro.toLowerCase().includes('erfüllung')
    );
  }

  private extractEthicalConcerns(alternative: Alternative): string[] {
    return alternative.cons.filter(con => 
      con.toLowerCase().includes('unfair') || 
      con.toLowerCase().includes('schaden') ||
      con.toLowerCase().includes('ungerecht')
    );
  }

  private extractEthicalOpportunities(alternative: Alternative): string[] {
    return alternative.pros.filter(pro => 
      pro.toLowerCase().includes('gerecht') || 
      pro.toLowerCase().includes('fair') ||
      pro.toLowerCase().includes('hilft')
    );
  }

  private extractPracticalConcerns(alternative: Alternative): string[] {
    return alternative.cons.filter(con => 
      con.toLowerCase().includes('teuer') || 
      con.toLowerCase().includes('zeit') ||
      con.toLowerCase().includes('schwierig')
    );
  }

  private extractPracticalOpportunities(alternative: Alternative): string[] {
    return alternative.pros.filter(pro => 
      pro.toLowerCase().includes('einfach') || 
      pro.toLowerCase().includes('schnell') ||
      pro.toLowerCase().includes('günstig')
    );
  }

  private extractCreativeOpportunities(alternative: Alternative): string[] {
    return ['Raum für neue Ideen', 'Unkonventionelle Ansätze möglich'];
  }

  private extractSocietalConcerns(alternative: Alternative, decision: Decision): string[] {
    const concerns: string[] = [];
    if (decision.context.stakeholders.length > 5) {
      concerns.push('Viele Stakeholder zu koordinieren');
    }
    return concerns;
  }

  private extractSocietalOpportunities(alternative: Alternative, decision: Decision): string[] {
    return ['Potential für positive gesellschaftliche Wirkung'];
  }

  private extractSpiritualOpportunities(alternative: Alternative): string[] {
    return ['Bewusstseinswachstum', 'Tieferes Verständnis'];
  }

  private estimateShortTermHumanImpact(alternative: Alternative, stakeholders: Stakeholder[]): number {
    const avgStakeholderImpact = stakeholders.reduce((sum, s) => sum + s.impact, 0) / Math.max(stakeholders.length, 1);
    return Math.min(100, avgStakeholderImpact);
  }

  private estimateMediumTermHumanImpact(alternative: Alternative, stakeholders: Stakeholder[], decision: Decision): number {
    return this.estimateShortTermHumanImpact(alternative, stakeholders) * 0.9; // Slight decay
  }

  private estimateLongTermHumanImpact(alternative: Alternative, decision: Decision): number {
    // Langfristig: Fokus auf nachhaltige Werte
    const text = alternative.description.toLowerCase();
    const sustainableWords = ['nachhaltig', 'langfristig', 'dauerhaft', 'wachstum'];
    const boost = sustainableWords.filter(w => text.includes(w)).length * 10;
    return Math.min(100, 60 + boost);
  }

  private estimateShortTermNatureImpact(alternative: Alternative): number {
    const text = (alternative.description + ' ' + alternative.pros.join(' ')).toLowerCase();
    const natureWords = ['umwelt', 'natur', 'ökologie', 'grün', 'nachhaltig'];
    const harmWords = ['verschmutzung', 'abfall', 'schädlich'];
    
    const positiveCount = natureWords.filter(w => text.includes(w)).length;
    const negativeCount = harmWords.filter(w => text.includes(w)).length;
    
    return Math.max(0, Math.min(100, 50 + (positiveCount * 15) - (negativeCount * 20)));
  }

  private estimateMediumTermNatureImpact(alternative: Alternative, decision: Decision): number {
    return this.estimateShortTermNatureImpact(alternative) * 1.1; // Nature impacts grow
  }

  private estimateLongTermNatureImpact(alternative: Alternative, decision: Decision): number {
    return this.estimateShortTermNatureImpact(alternative) * 1.3; // Compound effect
  }

  private estimateShortTermConsciousnessImpact(alternative: Alternative): number {
    const text = alternative.description.toLowerCase();
    const consciousWords = ['lernen', 'wachstum', 'entwicklung', 'erkenntnis', 'bewusstsein'];
    return 50 + (consciousWords.filter(w => text.includes(w)).length * 12);
  }

  private estimateMediumTermConsciousnessImpact(alternative: Alternative, decision: Decision): number {
    return this.estimateShortTermConsciousnessImpact(alternative) * 1.2;
  }

  private estimateLongTermConsciousnessImpact(alternative: Alternative, decision: Decision): number {
    return this.estimateShortTermConsciousnessImpact(alternative) * 1.5; // Consciousness compounds
  }

  private calculateImpactConfidence(
    alternative: Alternative,
    decision: Decision,
    dimension: 'human' | 'nature' | 'consciousness'
  ): number {
    let confidence = 60;
    
    // Mehr Stakeholder = höhere Konfidenz für human
    if (dimension === 'human' && decision.context.stakeholders.length > 3) confidence += 15;
    
    // Explizite Nature-Stakeholder = höhere Konfidenz für nature
    if (dimension === 'nature' && decision.context.stakeholders.some(s => s.type === 'nature')) confidence += 20;
    
    // Mehr Beschreibungsdetail = höhere Konfidenz
    if (alternative.description.length > 100) confidence += 10;
    
    return Math.min(95, confidence);
  }

  private calculateOverallScore(perspectives: Perspective[], impactScores: ImpactScores): number {
    // Weighted average von Perspektiven
    const perspectiveScore = perspectives.reduce((sum, p) => sum + (p.score * p.weight), 0);
    
    // Impact Score
    const impactScore = impactScores.overall;
    
    // 60% Perspektiven, 40% Impact
    return perspectiveScore * 0.6 + impactScore * 0.4;
  }

  private calculateConfidence(
    decision: Decision,
    perspectives: Perspective[],
    impactScores: ImpactScores
  ): number {
    const avgImpactConfidence = (
      impactScores.human.confidence +
      impactScores.nature.confidence +
      impactScores.consciousness.confidence
    ) / 3;
    
    // Mehr Stakeholder und Details = höhere Konfidenz
    const dataQuality = Math.min(100, 50 + (decision.context.stakeholders.length * 5));
    
    return (avgImpactConfidence * 0.6 + dataQuality * 0.4);
  }

  private generateRecommendations(
    alternative: Alternative,
    perspectives: Perspective[],
    impactScores: ImpactScores
  ): string[] {
    const recommendations: string[] = [];
    
    // Basierend auf starken Perspektiven
    const strongPerspectives = perspectives.filter(p => p.score > 75);
    if (strongPerspectives.length > 0) {
      recommendations.push(`Diese Option schneidet besonders gut ab in: ${strongPerspectives.map(p => p.name).join(', ')}`);
    }
    
    // Basierend auf Impact
    if (impactScores.human.average > 75) {
      recommendations.push('Hoher positiver Einfluss auf menschliches Wohlbefinden');
    }
    if (impactScores.nature.average > 75) {
      recommendations.push('Starke positive Umweltwirkung');
    }
    if (impactScores.consciousness.average > 75) {
      recommendations.push('Fördert signifikante Bewusstseinsentwicklung');
    }
    
    return recommendations;
  }

  private generateWarnings(
    alternative: Alternative,
    decision: Decision,
    impactScores: ImpactScores
  ): string[] {
    const warnings: string[] = [];
    
    if (decision.context.reversibility === 'irreversible') {
      warnings.push('⚠️ Diese Entscheidung ist NICHT umkehrbar - sorgfältige Abwägung empfohlen');
    }
    
    if (impactScores.nature.average < 40) {
      warnings.push('⚠️ Potentiell negative Umweltauswirkungen');
    }
    
    if (alternative.cons.length > alternative.pros.length * 1.5) {
      warnings.push('⚠️ Signifikant mehr Nachteile als Vorteile identifiziert');
    }
    
    if (decision.context.urgency === 'critical' && alternative.estimatedCost?.time) {
      warnings.push('⚠️ Zeitdruck könnte die Umsetzungsqualität beeinträchtigen');
    }
    
    return warnings;
  }

  private detectPatterns(alternative: Alternative, decision: Decision): string | null {
    // Einfache Mustererkennung
    if (alternative.pros.length > 5 && alternative.cons.length < 2) {
      return '📊 Muster: Diese Option zeigt ein außergewöhnlich positives Profil - evtl. sind versteckte Risiken noch nicht bedacht?';
    }
    return null;
  }

  private detectBias(perspectives: Perspective[], decision: Decision): string | null {
    const emotionalWeight = perspectives.find(p => p.type === 'emotional')?.weight || 0;
    const rationalWeight = perspectives.find(p => p.type === 'rational')?.weight || 0;
    
    if (emotionalWeight > rationalWeight * 2) {
      return '🧠 Möglicher emotionaler Bias: Die emotionale Perspektive dominiert stark - ist das angemessen für diesen Kontext?';
    }
    if (rationalWeight > emotionalWeight * 2) {
      return '🧠 Möglicher Rationalitäts-Bias: Emotionale Aspekte könnten unterbewertet sein.';
    }
    return null;
  }

  private detectOpportunity(alternative: Alternative, impactScores: ImpactScores): string | null {
    const balanced = Math.abs(impactScores.human.average - impactScores.nature.average) < 15 &&
                    Math.abs(impactScores.human.average - impactScores.consciousness.average) < 15;
    
    if (balanced && impactScores.overall > 70) {
      return '✨ Seltene Gelegenheit: Diese Option hat ausgewogene positive Wirkung auf Mensch, Natur UND Bewusstsein!';
    }
    return null;
  }

  private detectRisk(alternative: Alternative, decision: Decision, impactScores: ImpactScores): string | null {
    if (decision.context.reversibility === 'irreversible' && impactScores.overall < 60) {
      return '⚠️ HOHES RISIKO: Irreversible Entscheidung mit mittelmäßigem Impact-Score - Vorsicht geboten!';
    }
    return null;
  }

  private extractWisdom(perspectives: Perspective[], impactScores: ImpactScores): string | null {
    const highScorePerspectives = perspectives.filter(p => p.score > 80);
    if (highScorePerspectives.length >= 5) {
      return '💎 Weisheit: Wenn fast alle Perspektiven übereinstimmen, ist das oft ein Zeichen für eine stimmige Entscheidung.';
    }
    return null;
  }

  private extractStrengths(evaluation: EvaluationResult): string[] {
    const strengths: string[] = [];
    
    evaluation.perspectives
      .filter(p => p.score > 75)
      .forEach(p => strengths.push(`${p.name} (${p.score.toFixed(0)}%)`));
    
    if (evaluation.impactScores.overall > 75) {
      strengths.push(`Hoher Gesamtimpact (${evaluation.impactScores.overall.toFixed(0)}%)`);
    }
    
    return strengths;
  }

  private extractWeaknesses(evaluation: EvaluationResult): string[] {
    const weaknesses: string[] = [];
    
    evaluation.perspectives
      .filter(p => p.score < 50)
      .forEach(p => weaknesses.push(`${p.name} (${p.score.toFixed(0)}%)`));
    
    evaluation.warnings.forEach(w => weaknesses.push(w));
    
    return weaknesses;
  }

  private identifyBestScenarios(
    alternative: Alternative,
    evaluation: EvaluationResult,
    decision: Decision
  ): string[] {
    const scenarios: string[] = [];
    
    const topPerspective = evaluation.perspectives.reduce((max, p) => p.score > max.score ? p : max);
    scenarios.push(`Wenn ${topPerspective.name.toLowerCase()} im Vordergrund steht`);
    
    if (evaluation.impactScores.nature.average > 75) {
      scenarios.push('Wenn Umweltaspekte priorisiert werden');
    }
    if (evaluation.impactScores.consciousness.average > 75) {
      scenarios.push('Wenn persönliches Wachstum wichtig ist');
    }
    
    return scenarios;
  }

  private identifyTradeoffs(
    comparisons: AlternativeComparison[],
    evaluations: EvaluationResult[]
  ): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];
    
    // Beispiel: Vergleiche höchste vs. zweithöchste Option
    if (comparisons.length >= 2) {
      const best = comparisons[0];
      const second = comparisons[1];
      
      tradeoffs.push({
        dimension1: 'Gesamtscore',
        dimension2: 'Risikovermeidung',
        description: `${best.name} hat höheren Score, aber ${second.name} könnte sicherer sein`,
        severity: 'moderate'
      });
    }
    
    return tradeoffs;
  }

  private generateReasoning(
    comparisons: AlternativeComparison[],
    evaluations: EvaluationResult[],
    decision: Decision
  ): string {
    const best = comparisons[0];
    const bestEval = evaluations.find(e => e.alternativeId === best.alternativeId);
    
    if (!bestEval) return 'Basierend auf der Gesamtbewertung.';
    
    return `${best.name} erhält die höchste Bewertung (${best.totalScore.toFixed(1)}%) aufgrund starker Leistung in ${best.strengths.slice(0, 2).join(' und ')}. ` +
           `Der Confidence-Score von ${bestEval.confidence.toFixed(0)}% deutet auf eine ${bestEval.confidence > 80 ? 'verlässliche' : 'moderate'} Bewertungsgrundlage hin.`;
  }
}
