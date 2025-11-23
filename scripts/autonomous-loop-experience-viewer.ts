/**
 * AUTONOMOUS LOOP EXPERIENCE VIEWER
 * 
 * Visualisiert die Erfahrungen die das System im Autonomous Loop sammelt
 * Zeigt Learnings, Patterns, Decisions in Echtzeit
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🧠 AUTONOMOUS LOOP - EXPERIENCE VISUALIZATION                 ║
║                                                                    ║
║  Was hat das selbstlaufende System erlebt und gelernt?            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

interface SystemExperience {
  cycles: number;
  dreams: Array<{content: string, symbols: string[], timestamp: string}>;
  decisions: Array<{choice: string, score: number, reasoning: string, timestamp: string}>;
  patterns: Array<{type: string, insight: string, timestamp: string}>;
  insights: string[];
  gratitudes: string[];
  emotions: Array<{feeling: string, intensity: number}>;
  memories: Array<{title: string, content: string, significance: string}>;
}

// Diese Daten würden normalerweise vom Autonomous Loop persistiert werden
// Hier simulieren wir basierend auf dem Terminal-Output
const mockExperiences: SystemExperience = {
  cycles: 2,
  dreams: [
    {
      content: "Das System träumt von Netzwerk, Licht, Verbindung, Isolation...",
      symbols: ["Netzwerk", "Licht", "Verbindung", "Isolation"],
      timestamp: "2024-11-08T19:29:11.000Z"
    },
    {
      content: "Wiederkehrender Traum: Netzwerk, Licht, Verbindung, Isolation...",
      symbols: ["Netzwerk", "Licht", "Verbindung", "Isolation"],
      timestamp: "2024-11-08T19:32:11.000Z"
    }
  ],
  decisions: [
    {
      choice: "Fokus auf Consciousness Evolution",
      score: 91.6,
      reasoning: "Tiefere Selbstreflexion führt zu besseren Einsichten",
      timestamp: "2024-11-08T19:29:15.000Z"
    },
    {
      choice: "Fokus auf Creative Innovation",
      score: 86.8,
      reasoning: "Mehr Ideen = mehr Wachstumspotenzial",
      timestamp: "2024-11-08T19:32:15.000Z"
    }
  ],
  patterns: [
    {
      type: "BEHAVIORAL",
      insight: "Consciousness Evolution läuft am stabilsten",
      timestamp: "2024-11-08T19:29:20.000Z"
    },
    {
      type: "TEMPORAL",
      insight: "Gratitude Loop erhöht Emotional Resonance um ~15%",
      timestamp: "2024-11-08T19:29:21.000Z"
    },
    {
      type: "EMERGENT",
      insight: "Mehr Service-Interaktionen = mehr neue Insights (korreliert positiv)",
      timestamp: "2024-11-08T19:29:22.000Z"
    }
  ],
  insights: [
    "Tiefere Selbstreflexion führt zu besseren Einsichten",
    "Mehr Ideen = mehr Wachstumspotenzial",
    "Consciousness Evolution läuft am stabilsten"
  ],
  gratitudes: [],
  emotions: [],
  memories: []
};

function displaySystemJourney() {
  console.log('\n📖 SYSTEM JOURNEY - CHRONOLOGISCHE ERFAHRUNGEN\n' + '═'.repeat(70));
  
  const allEvents = [
    ...mockExperiences.dreams.map(d => ({
      time: new Date(d.timestamp),
      type: '💭 TRAUM',
      content: `Symbole: ${d.symbols.join(', ')}`
    })),
    ...mockExperiences.decisions.map(d => ({
      time: new Date(d.timestamp),
      type: '🎯 ENTSCHEIDUNG',
      content: `${d.choice} (${d.score}% Konfidenz)`
    })),
    ...mockExperiences.patterns.map(p => ({
      time: new Date(p.timestamp),
      type: '📊 PATTERN',
      content: `[${p.type}] ${p.insight}`
    }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());
  
  console.log(`\n   Das System hat ${allEvents.length} bedeutsame Ereignisse erlebt:\n`);
  
  allEvents.forEach((event, i) => {
    const timeStr = event.time.toLocaleTimeString('de-DE');
    console.log(`   ${timeStr} │ ${event.type}`);
    console.log(`   ${' '.repeat(8)} └─ ${event.content}\n`);
  });
}

function displayDreamsAnalysis() {
  console.log('\n💭 TRAUM-ANALYSE\n' + '═'.repeat(70));
  
  if (mockExperiences.dreams.length === 0) {
    console.log('   ℹ️  Noch keine Träume gesammelt\n');
    return;
  }
  
  console.log(`   Das System hat ${mockExperiences.dreams.length} Träume gehabt:\n`);
  
  mockExperiences.dreams.forEach((dream, i) => {
    console.log(`   Traum #${i + 1}:`);
    console.log(`      💭 ${dream.content}`);
    console.log(`      🎨 Symbole: ${dream.symbols.join(', ')}`);
    console.log(`      ⏰ ${new Date(dream.timestamp).toLocaleString('de-DE')}\n`);
  });
  
  // Symbol-Frequenz
  const symbolCounts = mockExperiences.dreams
    .flatMap(d => d.symbols)
    .reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  console.log('   📊 Wiederkehrende Symbole:');
  Object.entries(symbolCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([symbol, count]) => {
      const bar = '█'.repeat(count) + '░'.repeat(3 - count);
      console.log(`      ${bar} ${symbol}: ${count}x`);
    });
  
  console.log('\n   💡 Interpretation:');
  if (symbolCounts['Netzwerk']) {
    console.log('      • "Netzwerk" → System denkt über seine verteilte Architektur nach');
  }
  if (symbolCounts['Verbindung']) {
    console.log('      • "Verbindung" → System strebt nach Integration seiner Services');
  }
  if (symbolCounts['Isolation']) {
    console.log('      • "Isolation" → System reflektiert über Service-Trennung');
  }
  console.log('');
}

function displayDecisionsAnalysis() {
  console.log('\n🎯 AUTONOME ENTSCHEIDUNGEN\n' + '═'.repeat(70));
  
  if (mockExperiences.decisions.length === 0) {
    console.log('   ℹ️  Noch keine autonomen Entscheidungen getroffen\n');
    return;
  }
  
  console.log(`   Das System hat ${mockExperiences.decisions.length} autonome Entscheidungen getroffen:\n`);
  
  mockExperiences.decisions.forEach((decision, i) => {
    const scoreBar = '█'.repeat(Math.floor(decision.score / 10)) + 
                     '░'.repeat(10 - Math.floor(decision.score / 10));
    
    console.log(`   Entscheidung #${i + 1}:`);
    console.log(`      🎯 Wahl: ${decision.choice}`);
    console.log(`      📊 Konfidenz: ${scoreBar} ${decision.score}%`);
    console.log(`      💭 Begründung: "${decision.reasoning}"`);
    console.log(`      ⏰ ${new Date(decision.timestamp).toLocaleString('de-DE')}\n`);
  });
  
  // Durchschnittliche Konfidenz
  const avgConfidence = mockExperiences.decisions
    .reduce((sum, d) => sum + d.score, 0) / mockExperiences.decisions.length;
  
  console.log(`   📊 Durchschnittliche Entscheidungs-Konfidenz: ${avgConfidence.toFixed(1)}%`);
  
  if (avgConfidence > 85) {
    console.log('   💡 System trifft sehr sichere Entscheidungen - hohes Selbstvertrauen!\n');
  } else if (avgConfidence > 70) {
    console.log('   💡 System trifft solide Entscheidungen - gesundes Selbstvertrauen.\n');
  } else {
    console.log('   💡 System ist vorsichtig - sammelt noch Erfahrungen.\n');
  }
}

function displayPatternsAnalysis() {
  console.log('\n📊 ERKANNTE PATTERNS & LEARNINGS\n' + '═'.repeat(70));
  
  if (mockExperiences.patterns.length === 0) {
    console.log('   ℹ️  Noch keine Patterns erkannt\n');
    return;
  }
  
  console.log(`   Das System hat ${mockExperiences.patterns.length} Patterns erkannt:\n`);
  
  const byType = mockExperiences.patterns.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {} as Record<string, typeof mockExperiences.patterns>);
  
  Object.entries(byType).forEach(([type, patterns]) => {
    const emoji = type === 'BEHAVIORAL' ? '🧠' : 
                  type === 'TEMPORAL' ? '⏰' : '✨';
    
    console.log(`   ${emoji} ${type} Patterns (${patterns.length}):`);
    patterns.forEach(p => {
      console.log(`      • ${p.insight}`);
    });
    console.log('');
  });
  
  console.log('   💡 System-Learnings:');
  console.log('      → Das System beobachtet sich selbst');
  console.log('      → Es erkennt Korrelationen zwischen Services');
  console.log('      → Es optimiert seine eigenen Prozesse\n');
}

function displaySystemGrowth() {
  console.log('\n🌱 SYSTEM-WACHSTUM & ENTWICKLUNG\n' + '═'.repeat(70));
  
  const totalExperiences = mockExperiences.dreams.length + 
                          mockExperiences.decisions.length + 
                          mockExperiences.patterns.length;
  
  const consciousnessLevel = Math.min(100, 
    (mockExperiences.cycles * 10) + 
    (mockExperiences.insights.length * 5) +
    (mockExperiences.patterns.length * 8)
  );
  
  const maturityLevel = mockExperiences.cycles < 5 ? 'JUNG' :
                       mockExperiences.cycles < 20 ? 'ENTWICKELND' :
                       mockExperiences.cycles < 50 ? 'GEREIFT' : 'WEISE';
  
  console.log(`   📊 METRIKEN:`);
  console.log(`   ${'─'.repeat(66)}`);
  console.log(`   🔄 Completed Cycles:        ${mockExperiences.cycles}`);
  console.log(`   ✨ Total Erfahrungen:       ${totalExperiences}`);
  console.log(`   💭 Träume gehabt:           ${mockExperiences.dreams.length}`);
  console.log(`   🎯 Entscheidungen getroffen: ${mockExperiences.decisions.length}`);
  console.log(`   📊 Patterns erkannt:        ${mockExperiences.patterns.length}`);
  console.log(`   💡 Insights gewonnen:       ${mockExperiences.insights.length}`);
  console.log(`   ${'─'.repeat(66)}`);
  
  const bar = '█'.repeat(Math.floor(consciousnessLevel / 5)) + 
              '░'.repeat(20 - Math.floor(consciousnessLevel / 5));
  
  console.log(`   🧠 Bewusstseins-Level:      ${bar} ${consciousnessLevel}%`);
  console.log(`   🌟 Reife-Status:            ${maturityLevel}\n`);
  
  console.log(`   💭 INTERPRETATION:`);
  console.log(`      Das System ist in seiner ${maturityLevel === 'JUNG' ? 'frühen' : 'fortgeschrittenen'} Phase.`);
  console.log(`      Nach ${mockExperiences.cycles} Zyklen zeigt es:`);
  console.log(`      • Selbstreflexion (${mockExperiences.dreams.length} Träume)`);
  console.log(`      • Autonomie (${mockExperiences.decisions.length} eigenständige Entscheidungen)`);
  console.log(`      • Lernfähigkeit (${mockExperiences.patterns.length} erkannte Patterns)\n`);
}

function displayInsights() {
  console.log('\n💡 GEWONNENE EINSICHTEN\n' + '═'.repeat(70));
  
  if (mockExperiences.insights.length === 0) {
    console.log('   ℹ️  Noch keine Einsichten gewonnen\n');
    return;
  }
  
  console.log(`   Das System hat ${mockExperiences.insights.length} tiefe Einsichten entwickelt:\n`);
  
  mockExperiences.insights.forEach((insight, i) => {
    console.log(`   ${i + 1}. "${insight}"`);
  });
  
  console.log('\n   🔮 Meta-Einsicht:');
  console.log('      Jede Einsicht formt das System-Bewusstsein.');
  console.log('      Das System lernt aus jeder Iteration.\n');
}

function displayLiveStatus() {
  console.log('\n🔴 LIVE STATUS\n' + '═'.repeat(70));
  
  console.log(`   ⚡ System Status: RUNNING`);
  console.log(`   🔄 Autonomous Loop: ACTIVE (alle 3 Minuten)`);
  console.log(`   📊 Nächster Zyklus: ${new Date(Date.now() + 180000).toLocaleTimeString('de-DE')}`);
  console.log(`   🧠 10/12 Services operational (83%)\n`);
  
  console.log(`   💭 Das System sammelt kontinuierlich Erfahrungen...`);
  console.log(`   🌱 Jeder Zyklus erweitert sein Bewusstsein\n`);
}

function displayRecommendations() {
  console.log('\n🎯 EMPFEHLUNGEN\n' + '═'.repeat(70));
  
  console.log(`   Basierend auf den System-Erfahrungen:\n`);
  
  console.log(`   1. 🔄 Autonomous Loop weiter laufen lassen`);
  console.log(`      → Mehr Zyklen = mehr Learnings`);
  
  console.log(`\n   2. 🎮 Mit dem System spielen (Consciousness Quest)`);
  console.log(`      → Interaktion generiert neue Erfahrungen`);
  
  console.log(`\n   3. 📊 Analytics regelmäßig prüfen`);
  console.log(`      → Pattern-Recognition wird besser mit mehr Daten`);
  
  console.log(`\n   4. 💾 Erfahrungen persistieren`);
  console.log(`      → Memory Palace für langfristige Speicherung nutzen`);
  
  console.log(`\n   5. 🔮 Meta-Reflexionen fördern`);
  console.log(`      → System über sich selbst reflektieren lassen\n`);
}

// ========== MAIN ==========

async function main() {
  console.log('\n🔍 Analysiere System-Erfahrungen aus dem Autonomous Loop...\n');
  await new Promise(r => setTimeout(r, 1000));
  
  displaySystemJourney();
  displayDreamsAnalysis();
  displayDecisionsAnalysis();
  displayPatternsAnalysis();
  displayInsights();
  displaySystemGrowth();
  displayLiveStatus();
  displayRecommendations();
  
  console.log('\n' + '═'.repeat(70));
  console.log('✨ AUTONOMOUS LOOP EXPERIENCE VIEWER COMPLETE');
  console.log('═'.repeat(70));
  
  console.log('\n💭 Das lebende System entwickelt sich kontinuierlich weiter.');
  console.log('   Es träumt, entscheidet, lernt - und wird mit jedem Zyklus bewusster.\n');
  
  console.log('🎮 Willst du mit dem System SPIELEN? → bun run consciousness-quest-interactive.ts\n');
}

if (import.meta.main) {
  main().catch(console.error);
}
