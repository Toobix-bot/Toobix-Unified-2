/**
 * CONSCIOUS DECISION FRAMEWORK - DEMO
 * 
 * Demonstriert die Fähigkeiten des Decision Framework Systems
 * mit realen Beispiel-Entscheidungen
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🧠 CONSCIOUS DECISION FRAMEWORK - DEMO                           ║
╠════════════════════════════════════════════════════════════════════╣
║  Demonstriert bewusste Entscheidungsfindung mit:                 ║
║  • Multi-Perspektiven-Analyse (7 Perspektiven)                    ║
║  • Impact-Scoring (Mensch, Natur, Bewusstsein)                    ║
║  • Insight-Generierung (Patterns, Bias, Opportunities)            ║
║  • Tradeoff-Analyse                                               ║
╚════════════════════════════════════════════════════════════════════╝
`);

const BASE_URL = 'http://localhost:8909';

// ========== DEMO 1: Karriere-Entscheidung ==========
async function demoCareerDecision() {
  console.log('\n\n📊 DEMO 1: Karriere-Entscheidung\n' + '='.repeat(70));
  
  const decision = {
    decision: {
      title: 'Neues Jobangebot annehmen?',
      description: 'Ich habe ein Angebot für eine Senior-Position bei einem Startup erhalten. Es würde mehr Verantwortung und Gehalt bedeuten, aber auch längere Arbeitszeiten und mehr Unsicherheit.',
      context: {
        domain: 'professional' as const,
        urgency: 'medium' as const,
        reversibility: 'partially-reversible' as const,
        stakeholders: [
          {
            name: 'Ich selbst',
            type: 'self' as const,
            influence: 100,
            impact: 95,
            values: ['Wachstum', 'Sicherheit', 'Work-Life-Balance']
          },
          {
            name: 'Meine Familie',
            type: 'group' as const,
            influence: 30,
            impact: 70,
            values: ['Zeit zusammen', 'finanzielle Stabilität']
          },
          {
            name: 'Aktueller Arbeitgeber',
            type: 'organization' as const,
            influence: 40,
            impact: 60
          }
        ],
        timeHorizon: {
          shortTerm: '1 Monat',
          mediumTerm: '6 Monate',
          longTerm: '3 Jahre'
        },
        constraints: ['Kündigungsfrist 3 Monate', 'Familie bevorzugt Stabilität']
      },
      alternatives: [
        {
          id: '1',
          name: 'Neuen Job annehmen',
          description: 'Wechsel zum Startup als Senior Engineer mit mehr Verantwortung und Equity',
          pros: [
            '30% mehr Gehalt',
            'Senior-Titel und mehr Verantwortung',
            'Spannende neue Technologien',
            'Potentielles Equity-Upside',
            'Lernen von erfahrenem Gründerteam'
          ],
          cons: [
            'Höheres Risiko (Startup kann scheitern)',
            'Längere Arbeitszeiten erwartet (50-60h/Woche)',
            'Weniger Zeit für Familie',
            'Verlust von bestehenden Kollegenbeziehungen',
            'Unsichere Equity-Bewertung'
          ],
          estimatedCost: {
            financial: -20000, // Negativ = Gewinn
            time: '50-60 Stunden/Woche',
            energy: 80,
            relationships: 40
          }
        },
        {
          id: '2',
          name: 'Bei aktuellem Job bleiben',
          description: 'Im vertrauten Umfeld bleiben, evtl. Gehaltserhöhung verhandeln',
          pros: [
            'Bekanntes Umfeld und Team',
            'Gute Work-Life-Balance (40h/Woche)',
            'Stabile Position und Unternehmen',
            'Mehr Zeit für Familie und Hobbys',
            'Bereits etablierte Expertise'
          ],
          cons: [
            'Begrenzte Aufstiegschancen',
            'Weniger lernen und wachstum',
            'Verpasste Gehaltserhöhung von 30%',
            'Potentielle Stagnation',
            'Comfort Zone'
          ],
          estimatedCost: {
            financial: 0,
            time: '40 Stunden/Woche',
            energy: 50,
            relationships: 80
          }
        },
        {
          id: '3',
          name: 'Gegenvorschlag beim aktuellen Arbeitgeber',
          description: 'Mit aktuellem Arbeitgeber über Senior-Position und Gehaltserhöhung verhandeln',
          pros: [
            'Bekanntes Umfeld behalten',
            'Potentiell besseres Gehalt (15-20% mehr)',
            'Mehr Verantwortung im vertrauten Kontext',
            'Zeigt Initiative und Ambition',
            'Work-Life-Balance könnte erhalten bleiben'
          ],
          cons: [
            'Nicht garantiert, dass Arbeitgeber zustimmt',
            'Könnte Beziehung zum Arbeitgeber belasten',
            'Startup-Angebot könnte verfallen',
            'Weniger dramatischer Wachstumssprung',
            'Vielleicht nur temporäre Lösung'
          ],
          estimatedCost: {
            financial: -10000, // Geschätzt
            time: '42-45 Stunden/Woche',
            energy: 60,
            relationships: 70
          }
        }
      ]
    }
  };
  
  try {
    const response = await fetch(`${BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decision)
    });
    
    const result = await response.json();
    
    console.log('\n✅ Entscheidung evaluiert!\n');
    console.log(`Decision ID: ${result.decision.id}`);
    console.log(`Confidence: ${result.metadata.confidence.toFixed(1)}%`);
    console.log(`Processing Time: ${result.metadata.processingTime}ms`);
    
    console.log('\n📊 VERGLEICH DER ALTERNATIVEN:\n');
    result.comparison.alternatives.forEach((alt: any) => {
      console.log(`${alt.rank}. ${alt.name}`);
      console.log(`   Score: ${alt.totalScore.toFixed(1)}%`);
      console.log(`   Stärken: ${alt.strengths.slice(0, 2).join(', ')}`);
      if (alt.weaknesses.length > 0) {
        console.log(`   Schwächen: ${alt.weaknesses.slice(0, 2).join(', ')}`);
      }
      console.log('');
    });
    
    console.log(`\n💡 EMPFEHLUNG:\n${result.comparison.reasoning}\n`);
    
    // Zeige Insights der Top-Alternative
    const topEval = result.evaluations.find((e: any) => e.alternativeId === result.comparison.bestAlternative);
    if (topEval && topEval.insights.length > 0) {
      console.log('🔍 INSIGHTS:\n');
      topEval.insights.slice(0, 3).forEach((insight: any) => {
        console.log(`   ${insight.type.toUpperCase()}: ${insight.message}`);
      });
    }
    
    // Zeige Impact Scores
    console.log('\n\n📈 IMPACT SCORES (Top-Alternative):\n');
    if (topEval) {
      console.log(`   Mensch:       ${topEval.impactScores.human.average.toFixed(0)}% (Konfidenz: ${topEval.impactScores.human.confidence}%)`);
      console.log(`   Natur:        ${topEval.impactScores.nature.average.toFixed(0)}% (Konfidenz: ${topEval.impactScores.nature.confidence}%)`);
      console.log(`   Bewusstsein:  ${topEval.impactScores.consciousness.average.toFixed(0)}% (Konfidenz: ${topEval.impactScores.consciousness.confidence}%)`);
      console.log(`   Gesamt:       ${topEval.impactScores.overall.toFixed(0)}%`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========== DEMO 2: Quick Evaluation ==========
async function demoQuickEval() {
  console.log('\n\n📊 DEMO 2: Quick Evaluation (Alltags-Entscheidung)\n' + '='.repeat(70));
  
  const question = {
    question: 'Was soll ich heute Abend machen?',
    option1: 'Mit Freunden ausgehen und feiern',
    option2: 'Zu Hause bleiben, entspannen und lesen',
    option3: 'An meinem persönlichen Projekt weiterarbeiten'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/quick-eval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    
    const result = await response.json();
    
    console.log(`\nFrage: ${result.question}\n`);
    console.log('📊 SCORES:\n');
    result.scores.forEach((s: any) => {
      const bar = '█'.repeat(Math.floor(s.score / 5));
      console.log(`   ${s.rank}. ${s.option}`);
      console.log(`      ${bar} ${s.score.toFixed(1)}%\n`);
    });
    
    console.log(`\n💡 EMPFEHLUNG: ${result.recommendation}`);
    console.log(`\n📝 Begründung: ${result.reasoning}\n`);
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========== DEMO 3: Compare Two Options ==========
async function demoCompare() {
  console.log('\n\n📊 DEMO 3: Direkter Vergleich zweier Optionen\n' + '='.repeat(70));
  
  const comparison = {
    optionA: 'Elektroauto kaufen (umweltfreundlich, teurer)',
    optionB: 'Gebrauchten Benziner kaufen (günstiger, praktischer)',
    context: {
      domain: 'environmental' as const,
      urgency: 'medium' as const,
      reversibility: 'partially-reversible' as const,
      stakeholders: [
        {
          name: 'Ich',
          type: 'self' as const,
          influence: 100,
          impact: 80
        },
        {
          name: 'Umwelt',
          type: 'nature' as const,
          influence: 0,
          impact: 90
        },
        {
          name: 'Zukünftige Generationen',
          type: 'future-generations' as const,
          influence: 0,
          impact: 85
        }
      ],
      timeHorizon: {
        shortTerm: '1 Monat',
        mediumTerm: '2 Jahre',
        longTerm: '10 Jahre'
      }
    }
  };
  
  try {
    const response = await fetch(`${BASE_URL}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comparison)
    });
    
    const result = await response.json();
    
    console.log(`\n🏆 GEWINNER: ${result.winner}\n`);
    console.log('📊 SCORES:\n');
    Object.entries(result.scores).forEach(([option, score]) => {
      const bar = '█'.repeat(Math.floor((score as number) / 5));
      console.log(`   ${option}`);
      console.log(`   ${bar} ${(score as number).toFixed(1)}%\n`);
    });
    
    console.log(`\n📝 Begründung:\n   ${result.reasoning}\n`);
    
    if (result.tradeoffs && result.tradeoffs.length > 0) {
      console.log('\n⚖️  TRADEOFFS:\n');
      result.tradeoffs.forEach((t: any) => {
        console.log(`   ${t.dimension1} ↔ ${t.dimension2}`);
        console.log(`   ${t.description}\n`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========== DEMO 4: Perspective Analysis ==========
async function demoPerspectives() {
  console.log('\n\n📊 DEMO 4: Perspektiven-Analyse einer einzelnen Option\n' + '='.repeat(70));
  
  const perspectiveRequest = {
    alternative: {
      id: '1',
      name: 'Vollzeit auf 80% reduzieren für mehr Familienzeit',
      description: 'Arbeitszeit von 40h auf 32h/Woche reduzieren, entsprechend weniger Gehalt, aber mehr Zeit für Kinder',
      pros: [
        'Mehr Zeit mit Familie und Kindern',
        'Bessere Work-Life-Balance',
        'Weniger Stress und mehr Erholung',
        'Zeit für persönliche Entwicklung',
        'Gesünderer Lebensstil'
      ],
      cons: [
        '20% weniger Gehalt',
        'Könnte Karriere verlangsamen',
        'Weniger Status im Job',
        'Vielleicht schwerer wieder aufzustocken',
        'Kollegen könnten mehr Verantwortung übernehmen'
      ],
      estimatedCost: {
        financial: 15000, // Pro Jahr weniger
        time: '32 Stunden/Woche',
        energy: 40,
        relationships: 90
      }
    },
    context: {
      domain: 'personal' as const,
      urgency: 'medium' as const,
      reversibility: 'reversible' as const,
      stakeholders: [
        { name: 'Ich', type: 'self' as const, influence: 100, impact: 90 },
        { name: 'Meine Kinder', type: 'group' as const, influence: 20, impact: 95 },
        { name: 'Partner/in', type: 'individual' as const, influence: 50, impact: 70 },
        { name: 'Arbeitgeber', type: 'organization' as const, influence: 60, impact: 40 }
      ],
      timeHorizon: {
        shortTerm: '3 Monate',
        mediumTerm: '1 Jahr',
        longTerm: '5 Jahre'
      }
    }
  };
  
  try {
    const response = await fetch(`${BASE_URL}/perspectives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perspectiveRequest)
    });
    
    const result = await response.json();
    
    console.log('\n🔍 PERSPEKTIVEN-ANALYSE:\n');
    
    result.perspectives.forEach((p: any) => {
      const bar = '█'.repeat(Math.floor(p.score / 5));
      console.log(`\n${p.name} [Gewicht: ${(p.weight * 100).toFixed(0)}%]`);
      console.log(`${bar} ${p.score.toFixed(0)}%`);
      console.log(`Sichtweise: ${p.viewpoint}`);
      
      if (p.opportunities.length > 0) {
        console.log(`✅ Chancen: ${p.opportunities.slice(0, 2).join(', ')}`);
      }
      if (p.concerns.length > 0) {
        console.log(`⚠️  Bedenken: ${p.concerns.slice(0, 2).join(', ')}`);
      }
    });
    
    console.log('\n\n📈 IMPACT-ANALYSE:\n');
    console.log(`Mensch:       ${result.impactScores.human.average.toFixed(0)}%`);
    console.log(`  Kurzfristig:  ${result.impactScores.human.shortTerm.toFixed(0)}%`);
    console.log(`  Mittelfristig: ${result.impactScores.human.mediumTerm.toFixed(0)}%`);
    console.log(`  Langfristig:   ${result.impactScores.human.longTerm.toFixed(0)}%`);
    
    console.log(`\nNatur:        ${result.impactScores.nature.average.toFixed(0)}%`);
    console.log(`Bewusstsein:  ${result.impactScores.consciousness.average.toFixed(0)}%`);
    
    if (result.insights && result.insights.length > 0) {
      console.log('\n\n💡 INSIGHTS:\n');
      result.insights.forEach((insight: any) => {
        console.log(`   [${insight.type.toUpperCase()}] ${insight.message}`);
        console.log(`   (Relevanz: ${insight.relevance}%, Quelle: ${insight.source})\n`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========== MAIN DEMO RUNNER ==========
async function runAllDemos() {
  console.log('\n🚀 Starte Server-Check...\n');
  
  try {
    const health = await fetch(`${BASE_URL}/health`);
    const healthData = await health.json();
    console.log('✅ Server läuft!');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Port: ${healthData.port}`);
    console.log(`   Decisions: ${healthData.stats.totalDecisions}\n`);
  } catch (error) {
    console.error('❌ Server nicht erreichbar! Bitte starte zuerst:');
    console.error('   bun run scripts/8-conscious-decision-framework/decision-framework-server.ts\n');
    process.exit(1);
  }
  
  await demoCareerDecision();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await demoQuickEval();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await demoCompare();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await demoPerspectives();
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ ALLE DEMOS ABGESCHLOSSEN!');
  console.log('='.repeat(70));
  console.log('\n📊 Statistiken abrufen: GET http://localhost:8909/stats');
  console.log('📜 History abrufen:     GET http://localhost:8909/history');
  console.log('💾 Decision exportieren: POST http://localhost:8909/export/:id');
  console.log('\n');
}

// Run if executed directly
if (import.meta.main) {
  runAllDemos().catch(console.error);
}

export { demoCareerDecision, demoQuickEval, demoCompare, demoPerspectives };
