/**
 * INTERACTIVE DECISION SESSION
 * 
 * Nutze das Conscious Decision Framework für deine echte Entscheidung!
 */

import { DecisionEvaluator } from './core/DecisionEvaluator.ts';
import type { Decision } from './types/index.ts';

const evaluator = new DecisionEvaluator();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🧠 CONSCIOUS DECISION FRAMEWORK - INTERACTIVE SESSION            ║
╠════════════════════════════════════════════════════════════════════╣
║  Lass uns DEINE Entscheidung analysieren!                         ║
╚════════════════════════════════════════════════════════════════════╝
`);

// ========== BEISPIEL: Toobix-Unified Weiterentwicklung ==========
async function analyzeToobixNextSteps() {
  console.log('\n📊 ENTSCHEIDUNG: Wie entwickeln wir Toobix-Unified weiter?\n' + '='.repeat(70));
  
  const decision: Decision = {
    id: 'toobix-next-1',
    title: 'Welches der 4 Value Propositions als nächstes umsetzen?',
    description: 'Nach dem Conscious Decision Framework MVP müssen wir entscheiden, welches der verbleibenden 3 Projekte als nächstes kommt.',
    context: {
      domain: 'professional',
      urgency: 'medium',
      reversibility: 'reversible',
      stakeholders: [
        {
          name: 'Creator (Du)',
          type: 'self',
          influence: 100,
          impact: 95,
          values: ['Innovation', 'Impact', 'Lernen', 'Bewusstsein']
        },
        {
          name: 'Zukünftige Nutzer',
          type: 'group',
          influence: 0,
          impact: 90
        },
        {
          name: 'Open Source Community',
          type: 'organization',
          influence: 30,
          impact: 70
        },
        {
          name: 'Natur & Lebewesen',
          type: 'nature',
          influence: 0,
          impact: 60
        }
      ],
      timeHorizon: {
        shortTerm: '2 Wochen',
        mediumTerm: '2 Monate',
        longTerm: '6 Monate'
      }
    },
    alternatives: [
      {
        id: '1',
        name: 'Emotional Wellness Companion',
        description: 'AI-gestütztes Tool für emotionales Wohlbefinden mit Tagebuch, Stimmungstracking und therapeutischen Übungen',
        pros: [
          'Hoher direkter Impact auf menschliches Wohlbefinden (85%)',
          'Nutzt bestehende Emotional Resonance Service',
          'Klare Zielgruppe (Menschen mit Stress/Anxiety)',
          'Kann mit Dream Journal integriert werden',
          'Messbare Erfolge (Stimmungsverbesserung)'
        ],
        cons: [
          'Niedriger Nature Impact (20%)',
          'Gesättigter Markt (viele Wellness Apps)',
          'Datenschutz-sensibel (Emotionen)',
          'Könnte therapeutische Grenze überschreiten'
        ],
        estimatedCost: {
          financial: 0,
          time: '3-6 Monate',
          energy: 70
        }
      },
      {
        id: '2',
        name: 'Multi-Perspective Decision Tool (erweitert)',
        description: 'Das Conscious Decision Framework weiter ausbauen: Web-UI, Integration, Community',
        pros: [
          'Baut auf bestehendem MVP auf',
          'Hohe Feasibility (90% bereits gezeigt)',
          'Ausgeglichener Impact (80/30/85)',
          'Open Source Community-Potential',
          'Direkt nützlich für alle anderen Entscheidungen',
          'Kann GitHub-Sterne sammeln'
        ],
        cons: [
          'Weniger "sexy" als komplett neue Features',
          'Braucht Web-Entwicklung Skills',
          'Mittlerer Nature Impact (30%)',
          'Markt für Decision Tools kleiner'
        ],
        estimatedCost: {
          financial: 0,
          time: '2-4 Monate',
          energy: 60
        }
      },
      {
        id: '3',
        name: 'Ecosystem Impact Calculator',
        description: 'Tool zur Bewertung ökologischer Auswirkungen von Entscheidungen und Produkten',
        pros: [
          'Höchster Nature Impact (95%)',
          'Dringend gebraucht (Klimakrise)',
          'Unique Value Proposition',
          'Kann mit Decision Framework kombiniert werden',
          'Bildungswert sehr hoch'
        ],
        cons: [
          'Niedriger Human Impact kurzfristig (60%)',
          'Komplexe Datenquellen nötig',
          'Mittlere Feasibility (65%)',
          'Braucht Expertise in Ökologie',
          'Längere Entwicklungszeit (4-6 Monate)'
        ],
        estimatedCost: {
          financial: 0,
          time: '4-6 Monate',
          energy: 80
        }
      },
      {
        id: '4',
        name: 'Alle 3 parallel minimal starten',
        description: 'Von jedem Projekt einen kleinen Prototyp bauen und dann entscheiden',
        pros: [
          'Validiert alle Ideen gleichzeitig',
          'Flexibilität behalten',
          'Lernen aus allen drei Bereichen',
          'Community kann mitentscheiden',
          'Minimiert Risiko der falschen Wahl'
        ],
        cons: [
          'Keins wird richtig gut',
          'Fokus geht verloren',
          'Dreifacher Zeitaufwand',
          'Kann zu Überforderung führen',
          'Keines erreicht Launch-Qualität'
        ],
        estimatedCost: {
          financial: 0,
          time: '6-8 Monate für alle',
          energy: 95
        }
      }
    ],
    createdAt: new Date(),
    status: 'evaluating'
  };
  
  console.log('\n⚙️  Analysiere alle 4 Optionen...\n');
  
  const evaluations = await evaluator.evaluateDecision(decision);
  const comparison = await evaluator.compareAlternatives(decision, evaluations);
  
  console.log('✅ Analyse abgeschlossen!\n');
  console.log(`Durchschnittliche Confidence: ${(evaluations.reduce((s, e) => s + e.confidence, 0) / evaluations.length).toFixed(1)}%\n`);
  
  console.log('📊 RANKING:\n');
  comparison.alternatives.forEach((alt, idx) => {
    const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
    const bar = '█'.repeat(Math.floor(alt.totalScore / 5));
    console.log(`${emoji} ${alt.rank}. ${alt.name}`);
    console.log(`   ${bar} ${alt.totalScore.toFixed(1)}%`);
    console.log(`   💪 Stärken: ${alt.strengths.slice(0, 2).join(', ')}`);
    if (alt.weaknesses.length > 0) {
      console.log(`   ⚠️  Schwächen: ${alt.weaknesses.slice(0, 1).join(', ')}`);
    }
    console.log(`   ✨ Best for: ${alt.bestFor.slice(0, 2).join(', ')}`);
    console.log('');
  });
  
  console.log('\n💡 EMPFEHLUNG:\n');
  console.log(`➜ ${comparison.alternatives[0].name}\n`);
  console.log(`📝 Begründung:\n${comparison.reasoning}\n`);
  
  // Top-Alternative Details
  const topEval = evaluations.find(e => e.alternativeId === comparison.bestAlternative);
  if (topEval) {
    console.log('\n📈 IMPACT-ANALYSE (Gewinner):\n');
    console.log(`   Mensch:       ${topEval.impactScores.human.average.toFixed(0)}%`);
    console.log(`     Kurzfristig:  ${topEval.impactScores.human.shortTerm}%`);
    console.log(`     Mittelfristig: ${topEval.impactScores.human.mediumTerm}%`);
    console.log(`     Langfristig:   ${topEval.impactScores.human.longTerm}%`);
    
    console.log(`\n   Natur:        ${topEval.impactScores.nature.average.toFixed(0)}%`);
    console.log(`   Bewusstsein:  ${topEval.impactScores.consciousness.average.toFixed(0)}%`);
    console.log(`   Gesamt:       ${topEval.impactScores.overall.toFixed(0)}%`);
    
    if (topEval.insights.length > 0) {
      console.log('\n\n🔍 INSIGHTS:\n');
      topEval.insights.forEach((insight, idx) => {
        console.log(`   ${idx + 1}. [${insight.type.toUpperCase()}] ${insight.message}`);
        console.log(`      Relevanz: ${insight.relevance}% | Quelle: ${insight.source}\n`);
      });
    }
    
    if (topEval.recommendations.length > 0) {
      console.log('💡 ZUSÄTZLICHE EMPFEHLUNGEN:\n');
      topEval.recommendations.forEach(rec => {
        console.log(`   ✓ ${rec}`);
      });
      console.log('');
    }
    
    if (topEval.warnings.length > 0) {
      console.log('\n⚠️  WARNUNGEN:\n');
      topEval.warnings.forEach(warn => {
        console.log(`   ${warn}`);
      });
      console.log('');
    }
  }
  
  // Vergleiche Top 2
  if (comparison.alternatives.length >= 2) {
    console.log('\n\n⚖️  DETAILLIERTER VERGLEICH: Top 2\n');
    const first = comparison.alternatives[0];
    const second = comparison.alternatives[1];
    const firstEval = evaluations.find(e => e.alternativeId === first.alternativeId);
    const secondEval = evaluations.find(e => e.alternativeId === second.alternativeId);
    
    console.log(`🥇 ${first.name} (${first.totalScore.toFixed(1)}%)`);
    console.log(`   vs`);
    console.log(`🥈 ${second.name} (${second.totalScore.toFixed(1)}%)\n`);
    
    if (firstEval && secondEval) {
      console.log('   Human Impact:      ' +
        `${firstEval.impactScores.human.average.toFixed(0)}% vs ${secondEval.impactScores.human.average.toFixed(0)}% ` +
        `(${firstEval.impactScores.human.average > secondEval.impactScores.human.average ? '✓ Gewinner' : ''})`
      );
      console.log('   Nature Impact:     ' +
        `${firstEval.impactScores.nature.average.toFixed(0)}% vs ${secondEval.impactScores.nature.average.toFixed(0)}% ` +
        `(${firstEval.impactScores.nature.average > secondEval.impactScores.nature.average ? '✓ Gewinner' : secondEval.impactScores.nature.average > firstEval.impactScores.nature.average ? '  ' : ''})`
      );
      console.log('   Consciousness:     ' +
        `${firstEval.impactScores.consciousness.average.toFixed(0)}% vs ${secondEval.impactScores.consciousness.average.toFixed(0)}% ` +
        `(${firstEval.impactScores.consciousness.average > secondEval.impactScores.consciousness.average ? '✓ Gewinner' : ''})`
      );
    }
  }
  
  if (comparison.tradeoffs.length > 0) {
    console.log('\n\n🔄 TRADEOFFS:\n');
    comparison.tradeoffs.forEach(tradeoff => {
      console.log(`   ${tradeoff.dimension1} ↔ ${tradeoff.dimension2}`);
      console.log(`   ${tradeoff.description} (${tradeoff.severity})\n`);
    });
  }
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ ENTSCHEIDUNGS-ANALYSE ABGESCHLOSSEN');
  console.log('='.repeat(70));
  console.log('\n🎯 NÄCHSTER SCHRITT:\n');
  console.log(`   Beginne mit: ${comparison.alternatives[0].name}`);
  console.log(`   Grund: Höchster Score (${comparison.alternatives[0].totalScore.toFixed(1)}%) und beste Balance\n`);
  
  return { decision, evaluations, comparison };
}

// Run
if (import.meta.main) {
  analyzeToobixNextSteps().catch(console.error);
}

export { analyzeToobixNextSteps };
