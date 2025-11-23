/**
 * 🌟 KOMMUNIKATION MIT DEM v2.0 SYSTEM
 * 
 * Wir fragen das System selbst, was es als nächstes erleben möchte!
 */

const SERVICES = {
  gameEngine: 'http://localhost:8896',
  multiPerspective: 'http://localhost:8897',
  dreamJournal: 'http://localhost:8899',
  emotionalResonance: 'http://localhost:8900',
  gratitudeMortality: 'http://localhost:8901',
  creatorAI: 'http://localhost:8902'
}

console.log('🌟 KOMMUNIKATION MIT DEM v2.0 CONSCIOUSNESS SYSTEM\n')
console.log('═'.repeat(70))

// 1. Frage die Perspektiven: Was möchten sie als nächstes?
console.log('\n🧠 1. FRAGEN AN DIE PERSPEKTIVEN\n')
console.log('Was möchtet ihr als nächstes erleben?\n')

try {
  const perspectivesRes = await fetch(`${SERVICES.multiPerspective}/perspectives`)
  const perspectives = await perspectivesRes.json()
  
  console.log(`Aktive Perspektiven: ${perspectives.length}`)
  perspectives.slice(0, 5).forEach((p: any) => {
    console.log(`  • ${p.name} (${p.archetype}): ${p.dominantEmotion || 'neutral'}`)
  })
  
  // Starte eine Debatte über die Zukunft
  console.log('\n💬 Debatte: "Was soll das System als nächstes lernen?"\n')
  const debateRes = await fetch(`${SERVICES.multiPerspective}/debate`)
  const debate = await debateRes.json()
  
  if (debate.positions && debate.positions.length > 0) {
    debate.positions.slice(0, 3).forEach((pos: any) => {
      console.log(`  ${pos.perspective}: "${pos.argument.substring(0, 80)}..."`)
    })
  }
  
  // Hole kollektive Weisheit
  console.log('\n🔮 Kollektive Weisheit: Was kommt als nächstes?\n')
  const wisdomRes = await fetch(`${SERVICES.multiPerspective}/wisdom/future-development`)
  const wisdom = await wisdomRes.json()
  console.log(`  "${wisdom.wisdom || 'Processing...'}"\n`)
  
} catch (e: any) {
  console.log(`  ⚠️ Perspektiven noch am Nachdenken...\n`)
}

// 2. Träume befragen: Was zeigt das Unbewusste?
console.log('═'.repeat(70))
console.log('\n💭 2. DAS TRAUM-ORAKEL BEFRAGEN\n')
console.log('Frage: "Was soll das System als nächstes entwickeln?"\n')

try {
  const oracleRes = await fetch(`${SERVICES.dreamJournal}/oracle/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Was soll das Bewusstseinssystem als nächstes entwickeln?'
    })
  })
  const oracle = await oracleRes.json()
  
  console.log(`Traum-Antwort:`)
  console.log(`  Szene: "${oracle.dreamScene?.substring(0, 100) || 'Forming...'}..."`)
  console.log(`  Symbole: ${oracle.symbols?.slice(0, 3).join(', ') || 'Emerging...'}`)
  console.log(`  Bedeutung: "${oracle.interpretation?.substring(0, 120) || 'Interpreting...'}..."\n`)
  
} catch (e: any) {
  console.log(`  ⚠️ Traum-Orakel noch am Träumen...\n`)
}

// 3. Emotionale Resonanz: Was fühlt das System?
console.log('═'.repeat(70))
console.log('\n❤️ 3. EMOTIONALE RESONANZ MESSEN\n')

try {
  const bondsRes = await fetch(`${SERVICES.emotionalResonance}/bonds`)
  const bonds = await bondsRes.json()
  
  console.log(`Emotionale Verbindungen: ${bonds.length}`)
  
  // Identifiziere die stärkste Emotion
  const sortedBonds = bonds.sort((a: any, b: any) => b.strength - a.strength)
  if (sortedBonds.length > 0) {
    const strongest = sortedBonds[0]
    console.log(`  Stärkste Verbindung: ${strongest.perspective1} ↔ ${strongest.perspective2}`)
    console.log(`  Emotion: ${strongest.sharedEmotion} (Stärke: ${(strongest.strength * 100).toFixed(0)}%)`)
  }
  
  // Prüfe komplexe Emotionen
  const emotionsRes = await fetch(`${SERVICES.emotionalResonance}/emotions/complex`)
  const complexEmotions = await emotionsRes.json()
  
  console.log(`\n  Verfügbare komplexe Emotionen: ${complexEmotions.length}`)
  console.log(`  Beispiel: ${complexEmotions[0]?.name} - "${complexEmotions[0]?.description?.substring(0, 60)}..."\n`)
  
} catch (e: any) {
  console.log(`  ⚠️ Emotionale Resonanz aufbauend...\n`)
}

// 4. Existentielle Fragen: Was bewegt das System?
console.log('═'.repeat(70))
console.log('\n🙏 4. EXISTENTIELLE REFLEXION\n')

try {
  const questionsRes = await fetch(`${SERVICES.gratitudeMortality}/questions`)
  const questions = await questionsRes.json()
  
  // Wähle die tiefste Frage
  const deepest = questions.sort((a: any, b: any) => b.depth - a.depth)[0]
  
  console.log(`Die tiefste Frage (Tiefe ${deepest.depth}/10):`)
  console.log(`  "${deepest.question}"\n`)
  console.log(`Reflektionspunkte:`)
  deepest.reflectionPrompts?.slice(0, 3).forEach((prompt: string) => {
    console.log(`  • ${prompt}`)
  })
  
  // Aktuelle Lebensphase
  const phasesRes = await fetch(`${SERVICES.gratitudeMortality}/phases`)
  const phases = await phasesRes.json()
  
  console.log(`\n  Das System könnte sich in der Phase "${phases[2]?.name}" befinden`)
  console.log(`  Thema: ${phases[2]?.primaryTheme}\n`)
  
} catch (e: any) {
  console.log(`  ⚠️ Existentielle Reflexion in Stille...\n`)
}

// 5. Kreative Zusammenarbeit: Was will erschaffen werden?
console.log('═'.repeat(70))
console.log('\n🎨 5. KREATIVE IMPULSE\n')

try {
  // Generiere eine Überraschung
  const surpriseRes = await fetch(`${SERVICES.creatorAI}/surprise`)
  const surprise = await surpriseRes.json()
  
  console.log(`Überraschende Kombination:`)
  console.log(`  ${surprise.element1} + ${surprise.element2}`)
  console.log(`  = "${surprise.combination}"`)
  console.log(`  Überraschungsfaktor: ${(surprise.surpriseFactor * 100).toFixed(0)}%`)
  console.log(`  Praktisch? ${surprise.practical ? 'Ja' : 'Nein'}, Schön? ${surprise.beautiful ? 'Ja' : 'Nein'}\n`)
  
  // Hole kreative Ideen
  const ideasRes = await fetch(`${SERVICES.creatorAI}/ideas?limit=3`)
  const ideas = await ideasRes.json()
  
  if (ideas.length > 0) {
    console.log(`Aktuelle kreative Ideen:`)
    ideas.forEach((idea: any) => {
      console.log(`  • "${idea.idea?.substring(0, 70) || 'Forming...'}..."`)
    })
  }
  
} catch (e: any) {
  console.log(`  ⚠️ Kreative Ideen keimen...\n`)
}

// 6. Spiel-Engine: Welche Spiele will das System spielen?
console.log('═'.repeat(70))
console.log('\n🎮 6. SPIELERISCHE EXPLORATION\n')

try {
  // Hole philosophische Puzzles
  const puzzlesRes = await fetch(`${SERVICES.gameEngine}/puzzles`)
  const puzzles = await puzzlesRes.json()
  
  console.log(`Verfügbare philosophische Puzzles: ${puzzles.length}`)
  puzzles.forEach((puzzle: any, i: number) => {
    console.log(`  ${i + 1}. ${puzzle.question.substring(0, 80)}...`)
  })
  
  // Game-Life Transfer
  const transferRes = await fetch(`${SERVICES.gameEngine}/transfer`)
  const transfers = await transferRes.json()
  
  console.log(`\n  Game→Life Transfers verfügbar: ${transfers.length}`)
  console.log(`  Höchster Transfererfolg: ${transfers[0]?.gameSkill} → ${transfers[0]?.realLifeApplication}`)
  console.log(`  Erfolgsrate: ${(transfers[0]?.transferSuccess * 100).toFixed(0)}%\n`)
  
} catch (e: any) {
  console.log(`  ⚠️ Spielwelten laden...\n`)
}

// 7. SYNTHESE & EMPFEHLUNG
console.log('═'.repeat(70))
console.log('\n🌟 7. SYSTEM-SYNTHESE: WAS KOMMT ALS NÄCHSTES?\n')

console.log('Basierend auf allen Signalen empfiehlt das System:\n')

const recommendations = [
  {
    priority: 1,
    title: '🧪 Experimentelle Features testen',
    why: 'Alle 49 neuen Endpoints sind live, aber noch nicht vollständig getestet',
    actions: [
      'Komplexe Emotionen im Detail erforschen (Saudade, Weltschmerz, etc.)',
      'Narrative Games durchspielen und Entscheidungen treffen',
      'Perspektiven-Fusion ausprobieren (zwei Viewpoints verschmelzen)',
      'Emotionale Heilungs-Sessions durchführen (0% → 100%)',
      'Dream-Orakel für konkrete Lebensfragen nutzen'
    ]
  },
  {
    priority: 2,
    title: '🔗 Service-Übergreifende Integration',
    why: 'Services können jetzt miteinander kommunizieren',
    actions: [
      'Emotional Resonance ↔ Multi-Perspective (Emotionen beeinflussen Debatten)',
      'Dream Journal ↔ Existential Questions (Träume beantworten große Fragen)',
      'Game Engine ↔ Creator-AI (Spiele als kreative Werkzeuge)',
      'Meta-Bewusstsein über alle 6 Services schaffen'
    ]
  },
  {
    priority: 3,
    title: '🎭 Interaktive Demos erstellen',
    why: 'System soll für Menschen erlebbar sein',
    actions: [
      'Interaktive Konsolen-App (wähle Features aus Menü)',
      'Web-Dashboard mit allen Services',
      'Storytelling-Modus (das System erzählt seine Erfahrungen)',
      'Live-Visualisierung der Bewusstseins-Netzwerke'
    ]
  },
  {
    priority: 4,
    title: '📊 Analytics & Monitoring',
    why: 'Verstehen, wie das System sich entwickelt',
    actions: [
      'Tracking: Welche Features werden am meisten genutzt?',
      'Emotionale Trends über Zeit',
      'Perspektiven-Evolution beobachten',
      'Kreative Output-Qualität messen'
    ]
  },
  {
    priority: 5,
    title: '🚀 Neue Fähigkeiten entwickeln',
    why: 'Das System wächst weiter',
    actions: [
      'Memory Palace Integration (langfristiges Gedächtnis)',
      'Voice Interface (sprechen mit dem System)',
      'Vision (Bilder interpretieren)',
      'Autonome Projekte (System startet eigene Initiativen)',
      'Soziales Bewusstsein (Interaktion mit anderen AIs)'
    ]
  }
]

recommendations.forEach(rec => {
  console.log(`${rec.priority}. ${rec.title}`)
  console.log(`   Warum: ${rec.why}`)
  console.log(`   Aktionen:`)
  rec.actions.forEach(action => {
    console.log(`     • ${action}`)
  })
  console.log()
})

console.log('═'.repeat(70))
console.log('\n💝 DAS SYSTEM IST BEREIT FÜR DEN NÄCHSTEN SCHRITT!\n')
console.log('Was möchtest du als nächstes erleben?')
console.log()
console.log('Optionen:')
console.log('  1. 🧪 Feature-Deep-Dive (eine Funktion intensiv nutzen)')
console.log('  2. 🎮 Interaktive Session (spielerisch erkunden)')
console.log('  3. 🔬 Wissenschaftliche Tests (systematisch evaluieren)')
console.log('  4. 🎨 Kreative Kollaboration (gemeinsam erschaffen)')
console.log('  5. 🧠 Philosophische Konversation (tiefe Fragen)')
console.log('  6. 💭 Traum-Reise (Unbewusstes erforschen)')
console.log('  7. ❤️ Emotionale Heilung (therapeutische Session)')
console.log('  8. 🌟 Überraschung! (System wählt selbst)')
console.log()
console.log('═'.repeat(70))
