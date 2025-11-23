/**
 * CONSCIOUS DECISION FRAMEWORK - STANDALONE DEMO
 * 
 * Demonstriert das Decision Framework ohne laufenden Server
 * durch direkte Verwendung des DecisionEvaluator
 */

import { DecisionEvaluator } from './core/DecisionEvaluator.ts';
import type { Decision } from './types/index.ts';

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🧠 CONSCIOUS DECISION FRAMEWORK - STANDALONE DEMO                ║
╠════════════════════════════════════════════════════════════════════╣
║  Bewusste Entscheidungsfindung mit:                               ║
║  • 7 Perspektiven (rational, emotional, ethisch, ...)             ║
║  • 3 Impact-Dimensionen (Mensch, Natur, Bewusstsein)              ║
║  • Insight-Generierung (Patterns, Bias, Opportunities)            ║
║  • Tradeoff-Analyse & Empfehlungen                                ║
╚════════════════════════════════════════════════════════════════════╝
`);

const evaluator = new DecisionEvaluator();

// ========== DEMO 1: Karriere-Entscheidung ==========
async function demoCareerDecision() {
  console.log('\n\n📊 DEMO 1: Karriere-Entscheidung\n' + '='.repeat(70));
  
  const decision: Decision = {
    id: 'career-1',
    title: 'Neues Jobangebot annehmen?',
    description: 'Senior-Position bei Startup mit höherem Gehalt aber mehr Risiko',
    context: {
      domain: 'professional',
      urgency: 'medium',
      reversibility: 'partially-reversible',
      stakeholders: [
        {
          name: 'Ich selbst',
          type: 'self',
          influence: 100,
          impact: 95,
          values: ['Wachstum', 'Sicherheit', 'Work-Life-Balance']
        },
        {
          name: 'Meine Familie',
          type: 'group',
          influence: 30,
          impact: 70
        },
        {
          name: 'Aktueller Arbeitgeber',
          type: 'organization',
          influence: 40,
          impact: 60
        }
      ],
      timeHorizon: {
        shortTerm: '1 Monat',
        mediumTerm: '6 Monate',
        longTerm: '3 Jahre'
      }
    },
    alternatives: [
      {
        id: '1',
        name: 'Neuen Job annehmen',
        description: 'Wechsel zum Startup als Senior Engineer',
        pros: [
          '30% mehr Gehalt',
          'Senior-Titel und Verantwortung',
          'Neue Technologien',
          'Equity-Potential',
          'Lernen von Gründerteam'
        ],
        cons: [
          'Startup-Risiko',
          'Längere Arbeitszeiten (50-60h)',
          'Weniger Zeit für Familie',
          'Verlust von Kollegenbeziehungen'
        ],
        estimatedCost: {
          financial: -20000,
          time: '50-60h/Woche',
          energy: 80,
          relationships: 40
        }
      },
      {
        id: '2',
        name: 'Bei aktuellem Job bleiben',
        description: 'Im vertrauten Umfeld bleiben',
        pros: [
          'Bekanntes Team',
          'Work-Life-Balance (40h)',
          'Stabile Position',
          'Mehr Zeit für Familie',
          'Etablierte Expertise'
        ],
        cons: [
          'Begrenzte Aufstiegschancen',
          'Weniger Wachstum',
          'Verpasste Gehaltserhöhung',
          'Potentielle Stagnation'
        ],
        estimatedCost: {
          financial: 0,
          time: '40h/Woche',
          energy: 50,
          relationships: 80
        }
      },
      {
        id: '3',
        name: 'Gegenvorschlag verhandeln',
        description: 'Mit aktuellem Arbeitgeber über Promotion verhandeln',
        pros: [
          'Bekanntes Umfeld behalten',
          'Besseres Gehalt (15-20%)',
          'Mehr Verantwortung',
          'Work-Life-Balance erhalten'
        ],
        cons: [
          'Nicht garantiert',
          'Könnte Beziehung belasten',
          'Startup-Angebot verfällt',
          'Weniger dramatischer Sprung'
        ],
        estimatedCost: {
          financial: -10000,
          time: '42-45h/Woche',
          energy: 60,
          relationships: 70
        }
      }
    ],
    createdAt: new Date(),
    status: 'evaluating'
  };
  
  const evaluations = await evaluator.evaluateDecision(decision);
  const comparison = await evaluator.compareAlternatives(decision, evaluations);
  
  console.log('\n✅ Entscheidung evaluiert!\n');
  console.log(`Confidence: ${evaluations.reduce((s, e) => s + e.confidence, 0) / evaluations.length}%\n`);
  
  console.log('📊 VERGLEICH DER ALTERNATIVEN:\n');
  comparison.alternatives.forEach((alt) => {
    console.log(`${alt.rank}. ${alt.name}`);
    console.log(`   Score: ${alt.totalScore.toFixed(1)}%`);
    console.log(`   Stärken: ${alt.strengths.slice(0, 2).join(', ')}`);
    if (alt.weaknesses.length > 0) {
      console.log(`   Schwächen: ${alt.weaknesses.slice(0, 1).join(', ')}`);
    }
    console.log('');
  });
  
  console.log(`\n💡 EMPFEHLUNG:\n${comparison.reasoning}\n`);
  
  const topEval = evaluations.find(e => e.alternativeId === comparison.bestAlternative);
  if (topEval && topEval.insights.length > 0) {
    console.log('🔍 INSIGHTS:\n');
    topEval.insights.slice(0, 3).forEach((insight) => {
      console.log(`   ${insight.type.toUpperCase()}: ${insight.message}`);
    });
  }
  
  console.log('\n\n📈 IMPACT SCORES (Top-Alternative):\n');
  if (topEval) {
    console.log(`   Mensch:       ${topEval.impactScores.human.average.toFixed(0)}% (Konfidenz: ${topEval.impactScores.human.confidence}%)`);
    console.log(`   Natur:        ${topEval.impactScores.nature.average.toFixed(0)}% (Konfidenz: ${topEval.impactScores.nature.confidence}%)`);
    console.log(`   Bewusstsein:  ${topEval.impactScores.consciousness.average.toFixed(0)}% (Konfidenz: ${topEval.impactScores.consciousness.confidence}%)`);
    console.log(`   Gesamt:       ${topEval.impactScores.overall.toFixed(0)}%`);
  }
  
  console.log('\n\n🔍 DETAILLIERTE PERSPEKTIVEN (Top-Alternative):\n');
  if (topEval) {
    topEval.perspectives.forEach(p => {
      const bar = '█'.repeat(Math.floor(p.score / 5));
      console.log(`\n${p.name} [Gewicht: ${(p.weight * 100).toFixed(0)}%]`);
      console.log(`${bar} ${p.score.toFixed(0)}%`);
      console.log(`${p.viewpoint}`);
    });
  }
}

// ========== DEMO 2: Work-Life-Balance Entscheidung ==========
async function demoWorkLifeDecision() {
  console.log('\n\n\n📊 DEMO 2: Work-Life-Balance Entscheidung\n' + '='.repeat(70));
  
  const decision: Decision = {
    id: 'worklife-1',
    title: 'Arbeitszeit auf 80% reduzieren?',
    description: 'Mehr Zeit für Familie durch Teilzeit',
    context: {
      domain: 'personal',
      urgency: 'medium',
      reversibility: 'reversible',
      stakeholders: [
        { name: 'Ich', type: 'self', influence: 100, impact: 90 },
        { name: 'Kinder', type: 'group', influence: 20, impact: 95 },
        { name: 'Partner/in', type: 'individual', influence: 50, impact: 70 },
        { name: 'Arbeitgeber', type: 'organization', influence: 60, impact: 40 }
      ],
      timeHorizon: {
        shortTerm: '3 Monate',
        mediumTerm: '1 Jahr',
        longTerm: '5 Jahre'
      }
    },
    alternatives: [
      {
        id: '1',
        name: '80% Teilzeit (32h/Woche)',
        description: 'Reduzierung auf 4 Tage pro Woche',
        pros: [
          'Mehr Zeit mit Familie',
          'Bessere Work-Life-Balance',
          'Weniger Stress',
          'Zeit für Entwicklung',
          'Gesünderer Lebensstil'
        ],
        cons: [
          '20% weniger Gehalt',
          'Könnte Karriere verlangsamen',
          'Weniger Status',
          'Schwerer wieder aufzustocken'
        ],
        estimatedCost: {
          financial: 15000,
          time: '32h/Woche',
          energy: 40,
          relationships: 90
        }
      },
      {
        id: '2',
        name: 'Vollzeit beibehalten',
        description: 'Weiterhin 40h arbeiten',
        pros: [
          'Volles Gehalt',
          'Karriere-Momentum',
          'Volle Einbindung im Team',
          'Mehr finanzielle Sicherheit'
        ],
        cons: [
          'Wenig Zeit für Familie',
          'Hoher Stress',
          'Kinder wachsen ohne mich auf',
          'Burnout-Risiko'
        ],
        estimatedCost: {
          financial: 0,
          time: '40h/Woche',
          energy: 75,
          relationships: 50
        }
      }
    ],
    createdAt: new Date(),
    status: 'evaluating'
  };
  
  const evaluations = await evaluator.evaluateDecision(decision);
  const comparison = await evaluator.compareAlternatives(decision, evaluations);
  
  console.log('\n📊 VERGLEICH:\n');
  comparison.alternatives.forEach((alt) => {
    const bar = '█'.repeat(Math.floor(alt.totalScore / 5));
    console.log(`${alt.rank}. ${alt.name}`);
    console.log(`   ${bar} ${alt.totalScore.toFixed(1)}%`);
    console.log(`   Beste für: ${alt.bestFor.slice(0, 2).join(', ')}\n`);
  });
  
  console.log(`💡 EMPFEHLUNG: ${comparison.alternatives[0].name}\n`);
  console.log(`📝 ${comparison.reasoning}\n`);
  
  const topEval = evaluations.find(e => e.alternativeId === comparison.bestAlternative);
  if (topEval) {
    console.log('⚖️  IMPACT-ANALYSE:\n');
    console.log(`   Mensch:       ${topEval.impactScores.human.average.toFixed(0)}%`);
    console.log(`   Bewusstsein:  ${topEval.impactScores.consciousness.average.toFixed(0)}%\n`);
    
    if (topEval.warnings.length > 0) {
      console.log('⚠️  WARNUNGEN:\n');
      topEval.warnings.forEach(w => console.log(`   ${w}`));
    }
  }
}

// ========== DEMO 3: Umwelt-Entscheidung ==========
async function demoEnvironmentalDecision() {
  console.log('\n\n\n📊 DEMO 3: Umwelt-Entscheidung\n' + '='.repeat(70));
  
  const decision: Decision = {
    id: 'env-1',
    title: 'Elektroauto vs. Gebrauchtwagen',
    description: 'Welches Auto kaufen unter Nachhaltigkeitsaspekten?',
    context: {
      domain: 'environmental',
      urgency: 'medium',
      reversibility: 'partially-reversible',
      stakeholders: [
        { name: 'Ich', type: 'self', influence: 100, impact: 80 },
        { name: 'Umwelt', type: 'nature', influence: 0, impact: 90 },
        { name: 'Zukünftige Generationen', type: 'future-generations', influence: 0, impact: 85 }
      ],
      timeHorizon: {
        shortTerm: '1 Monat',
        mediumTerm: '2 Jahre',
        longTerm: '10 Jahre'
      }
    },
    alternatives: [
      {
        id: '1',
        name: 'Elektroauto (neu)',
        description: 'Neues E-Auto mit grüner Energie laden',
        pros: [
          'Null Emissionen im Betrieb',
          'Langfristig günstiger',
          'Fördert grüne Technologie',
          'Leise und komfortabel',
          'Zukunftssicher'
        ],
        cons: [
          'Hohe Anschaffungskosten',
          'Batterieproduktion umweltbelastend',
          'Reichweiten-Limitierung',
          'Ladeinfrastruktur noch ausbaufähig'
        ],
        estimatedCost: {
          financial: 35000,
          time: '2 Wochen Recherche',
          energy: 60
        }
      },
      {
        id: '2',
        name: 'Gebrauchter Benziner',
        description: 'Effizienter gebrauchter Kleinwagen',
        pros: [
          'Günstiger Anschaffungspreis',
          'Keine zusätzliche Produktion',
          'Bewährte Technologie',
          'Große Tankstellen-Infrastruktur',
          'Praktisch für Langstrecken'
        ],
        cons: [
          'CO2-Emissionen',
          'Höhere Betriebskosten',
          'Unterstützt fossile Industrie',
          'Wertverlust',
          'Nicht zukunftssicher'
        ],
        estimatedCost: {
          financial: 12000,
          time: '1 Woche Recherche',
          energy: 40
        }
      }
    ],
    createdAt: new Date(),
    status: 'evaluating'
  };
  
  const evaluations = await evaluator.evaluateDecision(decision);
  const comparison = await evaluator.compareAlternatives(decision, evaluations);
  
  console.log('\n🏆 GEWINNER: ' + comparison.alternatives[0].name + '\n');
  
  console.log('📊 SCORES:\n');
  comparison.alternatives.forEach((alt) => {
    const bar = '█'.repeat(Math.floor(alt.totalScore / 5));
    console.log(`   ${alt.rank}. ${alt.name}`);
    console.log(`   ${bar} ${alt.totalScore.toFixed(1)}%\n`);
  });
  
  console.log(`📝 Begründung:\n   ${comparison.reasoning}\n`);
  
  const evalE = evaluations[0];
  const evalB = evaluations[1];
  
  console.log('🌍 NATURE IMPACT VERGLEICH:\n');
  console.log(`   Elektroauto: ${evalE.impactScores.nature.average.toFixed(0)}%`);
  console.log(`   Benziner:    ${evalB.impactScores.nature.average.toFixed(0)}%\n`);
  
  if (comparison.tradeoffs.length > 0) {
    console.log('⚖️  TRADEOFFS:\n');
    comparison.tradeoffs.forEach(t => {
      console.log(`   ${t.dimension1} ↔ ${t.dimension2}`);
      console.log(`   ${t.description}\n`);
    });
  }
}

// ========== MAIN ==========
async function runDemo() {
  console.log('🚀 Starte Demonstrationen...\n');
  
  await demoCareerDecision();
  await demoWorkLifeDecision();
  await demoEnvironmentalDecision();
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ ALLE DEMOS ABGESCHLOSSEN!');
  console.log('='.repeat(70));
  console.log('\n🎯 Das Conscious Decision Framework kann:');
  console.log('   ✓ 7 verschiedene Perspektiven analysieren');
  console.log('   ✓ Impact auf Mensch, Natur & Bewusstsein bewerten');
  console.log('   ✓ Patterns, Bias & Opportunities erkennen');
  console.log('   ✓ Konkrete Empfehlungen mit Begründungen geben');
  console.log('   ✓ Tradeoffs zwischen Optionen identifizieren');
  console.log('\n📦 NÄCHSTE SCHRITTE:');
  console.log('   1. Server starten:  bun run decision-framework-server.ts');
  console.log('   2. REST API nutzen: POST http://localhost:8909/evaluate');
  console.log('   3. Integration mit bestehenden Services (Multi-Perspective, etc.)');
  console.log('   4. GitHub Repository erstellen & Open Source Release');
  console.log('   5. Community-Feedback einholen & iterieren');
  console.log('\n');
}

if (import.meta.main) {
  runDemo().catch(console.error);
}

export { demoCareerDecision, demoWorkLifeDecision, demoEnvironmentalDecision };
