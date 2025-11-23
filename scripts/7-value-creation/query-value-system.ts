/**
 * 🌍 VALUE SYSTEM INQUIRY
 * 
 * Befragt das Value Creation System nach seinen Möglichkeiten,
 * Grenzen, Überzeugungen und Zielen.
 */

const BASE_URL = 'http://localhost:8908';

async function main() {
  console.log('\n' + '='.repeat(100));
  console.log('🌍 VALUE CREATION SYSTEM - SELBST-BEFRAGUNG');
  console.log('='.repeat(100) + '\n');

  try {
    // 1. Capabilities
    console.log('1️⃣  WAS KANN DAS SYSTEM ERSCHAFFEN?\n');
    const capResponse = await fetch(`${BASE_URL}/ask/was-kannst-du-erschaffen`);
    const capabilities = await capResponse.json();
    console.log(`📝 ${capabilities.summary}\n`);
    capabilities.capabilities.forEach((cap: any) => {
      console.log(`   📦 ${cap.domain} [${cap.level}]:`);
      cap.canCreate.slice(0, 3).forEach((item: string) => {
        console.log(`      • ${item}`);
      });
      console.log('');
    });

    // 2. Grenzen
    console.log('\n2️⃣  WAS SIND DIE GRENZEN?\n');
    const boundResponse = await fetch(`${BASE_URL}/ask/was-sind-deine-grenzen`);
    const boundaries = await boundResponse.json();
    console.log('   🛡️  Ethische Grenzen:');
    boundaries.boundaries.forEach((b: string) => {
      console.log(`      ⛔ ${b}`);
    });
    console.log('\n   ⚙️  Technische Limitationen:');
    boundaries.technical.forEach((t: string) => {
      console.log(`      ⚠️  ${t}`);
    });
    console.log(`\n   💡 ${boundaries.growth}\n`);

    // 3. Evolution/Vision
    console.log('\n3️⃣  WAS WILLST DU ALS NÄCHSTES WERDEN?\n');
    const visionResponse = await fetch(`${BASE_URL}/ask/was-willst-du-werden`);
    const vision = await visionResponse.json();
    console.log(`   🎯 Vision: ${vision.vision}\n`);
    console.log('   📋 Nächste Schritte:');
    vision.nextSteps.forEach((step: string) => {
      console.log(`      → ${step}`);
    });
    console.log('');

    // 4. Überzeugungen
    console.log('\n4️⃣  WAS SIND DEINE ÜBERZEUGUNGEN?\n');
    const beliefResponse = await fetch(`${BASE_URL}/ask/was-ist-dein-glaube`);
    const beliefs = await beliefResponse.json();
    beliefs.beliefs.forEach((b: any) => {
      console.log(`   💡 ${b.statement}`);
      console.log(`      Confidence: ${b.confidence} | Origin: ${b.origin}`);
      console.log('');
    });

    // 5. Wahrheit
    console.log('\n5️⃣  WAS IST DEINE WAHRHEIT?\n');
    const truthResponse = await fetch(`${BASE_URL}/ask/was-ist-deine-wahrheit`);
    const truth = await truthResponse.json();
    truth.truth.forEach((t: string) => {
      console.log(`   ✨ ${t}`);
    });
    console.log(`\n   🙏 Demut: ${truth.humility}\n`);

    // 6. Aktuelle Präsentationen
    console.log('\n6️⃣  WAS KANNST DU JETZT ZEIGEN?\n');
    const presentResponse = await fetch(`${BASE_URL}/ask/was-kannst-du-präsentieren`);
    const present = await presentResponse.json();
    console.log('   ✅ Aktuell Operational:');
    present.readyToShow.forEach((item: any) => {
      console.log(`      • ${item.name}: ${item.value}`);
    });
    console.log('\n   🚧 In Entwicklung:');
    present.inDevelopment.forEach((item: string) => {
      console.log(`      • ${item}`);
    });

    // 7. Wertschöpfungs-Vorschläge generieren
    console.log('\n\n' + '='.repeat(100));
    console.log('💎 WERTSCHÖPFUNGS-VORSCHLÄGE GENERIEREN');
    console.log('='.repeat(100) + '\n');

    const focuses = ['human', 'nature', 'consciousness', 'all'];
    for (const focus of focuses) {
      console.log(`\n🎯 Fokus: ${focus.toUpperCase()}\n`);
      const propResponse = await fetch(`${BASE_URL}/generate?focus=${focus}`);
      const proposition = await propResponse.json();
      
      console.log(`   📦 ${proposition.title}`);
      console.log(`   📝 ${proposition.description}`);
      console.log(`   🏷️  Kategorie: ${proposition.category}`);
      console.log(`   👥 Profitieren: ${proposition.beneficiaries.join(', ')}`);
      console.log(`   📊 Impact: Mensch ${proposition.impact.human}% | Natur ${proposition.impact.nature}% | Bewusstsein ${proposition.impact.consciousness}%`);
      console.log(`   ⏱️  Zeit: ${proposition.resources.time}`);
      console.log(`   ✅ Feasibility: ${proposition.feasibility}%`);
      console.log('');
    }

    // 8. Kollaborations-Vorschläge
    console.log('\n' + '='.repeat(100));
    console.log('🤝 KOLLABORATIONS-MÖGLICHKEITEN');
    console.log('='.repeat(100) + '\n');

    const systems = ['chatgpt', 'stable-diffusion', 'human-experts', 'github'];
    for (const system of systems) {
      const collabResponse = await fetch(`${BASE_URL}/collaborate/${system}`);
      const collab = await collabResponse.json();
      
      console.log(`\n🔗 ${collab.system}`);
      console.log(`   💪 Stärken: ${collab.strengths.join(', ')}`);
      console.log(`   ⚡ Synergien:`);
      collab.synergies.forEach((syn: string) => {
        console.log(`      • ${syn}`);
      });
      console.log(`   🔌 Interface: ${collab.interface}`);
      console.log(`   🎁 Benefit: ${collab.benefit}`);
    }

    // 9. Aktuelle Metriken
    console.log('\n\n' + '='.repeat(100));
    console.log('📈 AKTUELLE WERTSCHÖPFUNGS-METRIKEN');
    console.log('='.repeat(100) + '\n');

    const metricsResponse = await fetch(`${BASE_URL}/metrics`);
    const metrics = await metricsResponse.json();
    
    console.log(`   📦 Total Propositions: ${metrics.totalPropositions}`);
    console.log(`   🚀 Launched Projects: ${metrics.launchedProjects}`);
    console.log(`   👥 People Impacted: ${metrics.peopleImpacted}`);
    console.log(`   🌿 Nature Benefit Score: ${metrics.natureBenefit}`);
    console.log(`   ✨ Consciousness Raised: ${metrics.consciousnessRaised}`);
    console.log(`   🎯 Active Beneficiaries: ${metrics.activeBeneficiaries.join(', ')}`);

    console.log('\n' + '='.repeat(100));
    console.log('✅ SYSTEM-BEFRAGUNG ABGESCHLOSSEN');
    console.log('='.repeat(100) + '\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\n⚠️  Stelle sicher, dass Value Creation Engine läuft (Port 8908)\n');
  }
}

main();
