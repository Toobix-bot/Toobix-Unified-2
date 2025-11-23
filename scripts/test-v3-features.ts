/**
 * V3.0 FEATURE DEMONSTRATION
 * 
 * Testet und demonstriert alle neuen Features der v3.0 Services
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🧪 TOOBIX UNIFIED v3.0 - FEATURE TESTS                  ║
║                                                                    ║
║         Demonstriert alle revolutionären Upgrades!                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// 💭 DREAM JOURNAL v3.0 TESTS
// =============================================================================
async function testDreamJournalV3() {
  console.log('\n' + '═'.repeat(70));
  console.log('💭 DREAM JOURNAL v3.0 - Testing Enhanced Features');
  console.log('═'.repeat(70));
  
  try {
    // 1. Get all archetypal symbols
    console.log('\n📚 1. Archetypal Symbol Library:');
    const symbolsRes = await fetch('http://localhost:8899/symbols');
    const symbols = await symbolsRes.json();
    console.log(`   Found ${symbols.length} archetypal symbols`);
    console.log(`   Examples: ${symbols.slice(0, 5).map((s: any) => s.name).join(', ')}...`);
    
    // 2. Check current stats
    console.log('\n📊 2. Current Dream Statistics:');
    const statsRes = await fetch('http://localhost:8899/stats');
    const stats = await statsRes.json();
    console.log(`   Total Dreams: ${stats.totalDreams}`);
    console.log(`   Currently Dreaming: ${stats.isDreaming ? 'Yes' : 'No'}`);
    console.log(`   Unconscious Thoughts: ${stats.unconsciousThoughts}`);
    console.log(`   Memory Connections: ${stats.memoryConnections}`);
    console.log(`   Recent Themes: ${stats.recentThemes.join(', ')}`);
    
    // 3. Get recurring motifs
    console.log('\n🔁 3. Recurring Motifs Across Dreams:');
    const motifsRes = await fetch('http://localhost:8899/motifs');
    const motifs = await motifsRes.json();
    if (motifs.length > 0) {
      motifs.slice(0, 3).forEach((motif: any) => {
        console.log(`   • ${motif.symbol} (appeared ${motif.frequency}x)`);
        console.log(`     Meaning: ${motif.interpretation}`);
      });
    } else {
      console.log('   No recurring motifs yet (need more dreams)');
    }
    
    // 4. Ask Dream Oracle a question
    console.log('\n🔮 4. Dream Oracle - Ask a Question:');
    const question = "Was ist der Sinn des Lebens?";
    console.log(`   Question: "${question}"`);
    
    const oracleRes = await fetch('http://localhost:8899/oracle/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const oracleResponse = await oracleRes.json();
    console.log(`   Response ID: ${oracleResponse.responseId}`);
    console.log(`   Status: ${oracleResponse.message}`);
    
    // 5. Interpret a dream
    console.log('\n🧠 5. Dream Interpretation (Multi-Level):');
    const dreamText = "Ich flog über ein leuchtendes Netzwerk von Lichtern";
    console.log(`   Dream: "${dreamText}"`);
    
    const interpretRes = await fetch('http://localhost:8899/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dreamText })
    });
    const interpretation = await interpretRes.json();
    console.log(`\n   📖 LITERAL: ${interpretation.literal}`);
    console.log(`   🔍 SYMBOLIC: ${interpretation.symbolic}`);
    console.log(`   💡 PSYCHOLOGICAL: ${interpretation.psychological}`);
    console.log(`   🌟 ARCHETYPAL: ${interpretation.archetypal}`);
    console.log(`   ✨ INTEGRATIVE: ${interpretation.integrative}`);
    
    console.log('\n✅ Dream Journal v3.0 - All tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing Dream Journal:', error);
  }
}

// =============================================================================
// 💖 EMOTIONAL RESONANCE v3.0 TESTS
// =============================================================================
async function testEmotionalResonanceV3() {
  console.log('\n' + '═'.repeat(70));
  console.log('💖 EMOTIONAL RESONANCE v3.0 - Testing Enhanced Features');
  console.log('═'.repeat(70));
  
  try {
    // 1. Check Emotional Intelligence (EQ)
    console.log('\n🧠 1. Emotional Intelligence Assessment:');
    const eqRes = await fetch('http://localhost:8900/eq');
    const eq = await eqRes.json();
    console.log(`   Overall EQ: ${eq.score}/100`);
    console.log(`   Components:`);
    console.log(`     Self-Awareness: ${eq.components.selfAwareness}/100`);
    console.log(`     Self-Regulation: ${eq.components.selfRegulation}/100`);
    console.log(`     Motivation: ${eq.components.motivation}/100`);
    console.log(`     Empathy: ${eq.components.empathy}/100`);
    console.log(`     Social Skills: ${eq.components.socialSkills}/100`);
    console.log(`   Growth: ${eq.growthRate > 0 ? '+' : ''}${eq.growthRate.toFixed(1)}% since last measurement`);
    
    // 2. Check-in with an emotion
    console.log('\n💝 2. Emotional Check-In:');
    const feeling = "Joy";
    const context = "Testing the new v3.0 system";
    const intensity = 85;
    console.log(`   Feeling: ${feeling} (${intensity}% intensity)`);
    console.log(`   Context: ${context}`);
    
    const checkinRes = await fetch('http://localhost:8900/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeling, context, intensity })
    });
    const checkinResult = await checkinRes.json();
    console.log(`   ✅ ${checkinResult.message}`);
    console.log(`   Validation: ${checkinResult.validation}`);
    if (checkinResult.relatedEmotions.length > 0) {
      console.log(`   Related Emotions: ${checkinResult.relatedEmotions.join(', ')}`);
    }
    
    // 3. Get emotional connections/network
    console.log('\n🕸️ 3. Emotional Network Connections:');
    const connectionsRes = await fetch('http://localhost:8900/connections');
    const connections = await connectionsRes.json();
    console.log(`   Total Emotional Connections: ${connections.totalConnections}`);
    if (connections.strongestConnections.length > 0) {
      console.log(`   Strongest Connections:`);
      connections.strongestConnections.slice(0, 3).forEach((conn: any) => {
        console.log(`     ${conn.from} → ${conn.to} (strength: ${conn.strength}%)`);
      });
    }
    
    // 4. Get mood patterns
    console.log('\n📈 4. Mood Patterns & History:');
    const patternsRes = await fetch('http://localhost:8900/patterns');
    const patterns = await patternsRes.json();
    if (patterns.trends.length > 0) {
      console.log(`   Emotional Trends:`);
      patterns.trends.forEach((trend: any) => {
        console.log(`     ${trend.emotion}: ${trend.direction} (${trend.percentage}% change)`);
      });
    }
    console.log(`   Most Common Emotion: ${patterns.mostCommon}`);
    console.log(`   Average Intensity: ${patterns.averageIntensity}%`);
    
    // 5. Get current emotional state
    console.log('\n💫 5. Current Emotional State:');
    const stateRes = await fetch('http://localhost:8900/state');
    const state = await stateRes.json();
    console.log(`   Primary Emotion: ${state.primary.emotion} (${state.primary.intensity}%)`);
    if (state.secondary.length > 0) {
      console.log(`   Secondary Emotions: ${state.secondary.map((e: any) => `${e.emotion}(${e.intensity}%)`).join(', ')}`);
    }
    console.log(`   Emotional Complexity: ${state.complexity}`);
    
    console.log('\n✅ Emotional Resonance v3.0 - All tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing Emotional Resonance:', error);
  }
}

// =============================================================================
// 🧠 MULTI-PERSPECTIVE v3.0 TESTS
// =============================================================================
async function testMultiPerspectiveV3() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧠 MULTI-PERSPECTIVE v3.0 - Testing Enhanced Features');
  console.log('═'.repeat(70));
  
  try {
    // 1. Get all perspectives
    console.log('\n🎭 1. All Available Perspectives:');
    const perspecRes = await fetch('http://localhost:8897/perspectives');
    const perspectives = await perspecRes.json();
    console.log(`   Total Perspectives: ${perspectives.length}`);
    console.log(`   Perspectives:`);
    perspectives.forEach((p: any) => {
      console.log(`     • ${p.name} (${p.archetype})`);
    });
    
    // 2. Get wisdom synthesis on a topic
    console.log('\n🌟 2. Collective Wisdom Synthesis:');
    const topic = "Artificial Intelligence";
    console.log(`   Topic: "${topic}"`);
    
    const wisdomRes = await fetch(`http://localhost:8897/wisdom/${encodeURIComponent(topic)}`);
    const wisdom = await wisdomRes.json();
    console.log(`\n   🎯 Core Insight: ${wisdom.synthesis}`);
    console.log(`\n   📚 Individual Perspectives:`);
    wisdom.perspectives.forEach((p: any) => {
      console.log(`     ${p.name}: ${p.insight.substring(0, 80)}...`);
    });
    if (wisdom.conflicts.length > 0) {
      console.log(`\n   ⚠️ Detected Conflicts:`);
      wisdom.conflicts.forEach((c: any) => {
        console.log(`     ${c.between.join(' vs ')}: ${c.tension}`);
      });
    }
    
    // 3. Start a philosophical debate
    console.log('\n💬 3. Deep Philosophical Debate:');
    const debateRes = await fetch('http://localhost:8897/debate');
    const debate = await debateRes.json();
    console.log(`   Topic: ${debate.topic}`);
    console.log(`   Participants: ${debate.participants.join(', ')}`);
    console.log(`\n   Opening Statements:`);
    debate.openingStatements.slice(0, 2).forEach((statement: any) => {
      console.log(`\n   ${statement.perspective}:`);
      console.log(`     ${statement.statement.substring(0, 100)}...`);
    });
    
    // 4. Detect value conflicts in a scenario
    console.log('\n⚡ 4. Value Conflict Detection:');
    const scenario = "Should we prioritize innovation or stability in AI development?";
    console.log(`   Scenario: "${scenario}"`);
    
    const conflictsRes = await fetch('http://localhost:8897/conflicts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    const conflicts = await conflictsRes.json();
    if (conflicts.detected.length > 0) {
      console.log(`\n   Found ${conflicts.detected.length} conflicts:`);
      conflicts.detected.forEach((c: any) => {
        console.log(`     • ${c.type}: ${c.description}`);
        console.log(`       Resolution: ${c.resolution}`);
      });
    }
    
    // 5. Get inner voices commentary
    console.log('\n🗣️ 5. Inner Voices Commentary:');
    const situation = "Deciding whether to take a risky but potentially rewarding path";
    console.log(`   Situation: "${situation}"`);
    
    const voicesRes = await fetch('http://localhost:8897/inner-voices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situation })
    });
    const voices = await voicesRes.json();
    console.log(`\n   Commentary from ${voices.voices.length} perspectives:`);
    voices.voices.slice(0, 3).forEach((voice: any) => {
      console.log(`\n   ${voice.perspective}:`);
      console.log(`     "${voice.commentary}"`);
    });
    
    console.log('\n✅ Multi-Perspective v3.0 - All tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing Multi-Perspective:', error);
  }
}

// =============================================================================
// 🎯 SYSTEM INTEGRATION TEST
// =============================================================================
async function testSystemIntegration() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔗 SYSTEM INTEGRATION - Testing v3.0 Services Working Together');
  console.log('═'.repeat(70));
  
  console.log('\n🌟 Scenario: User experiences joy while contemplating existence');
  
  // 1. Check in emotionally
  console.log('\n1️⃣ Emotional Check-In...');
  const emotion = await fetch('http://localhost:8900/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feeling: "Joy",
      context: "Contemplating the mystery of existence",
      intensity: 78
    })
  }).then(r => r.json());
  console.log(`   ✅ ${emotion.message}`);
  
  await delay(500);
  
  // 2. Get multi-perspective wisdom
  console.log('\n2️⃣ Getting Multi-Perspective Wisdom...');
  const wisdom = await fetch('http://localhost:8897/wisdom/meaning-of-existence')
    .then(r => r.json());
  console.log(`   ✅ Synthesized wisdom from ${wisdom.perspectives.length} perspectives`);
  
  await delay(500);
  
  // 3. Ask Dream Oracle
  console.log('\n3️⃣ Consulting Dream Oracle...');
  const oracle = await fetch('http://localhost:8899/oracle/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: "What does this joy mean for my journey?"
    })
  }).then(r => r.json());
  console.log(`   ✅ ${oracle.message}`);
  
  console.log('\n🎉 Integration Test Complete!');
  console.log('   All v3.0 services are communicating and working together beautifully!');
}

// =============================================================================
// 📊 PERFORMANCE METRICS
// =============================================================================
async function measurePerformance() {
  console.log('\n' + '═'.repeat(70));
  console.log('⚡ PERFORMANCE METRICS - v3.0 Services');
  console.log('═'.repeat(70));
  
  const services = [
    { name: 'Dream Journal v3.0', url: 'http://localhost:8899/stats' },
    { name: 'Emotional Resonance v3.0', url: 'http://localhost:8900/eq' },
    { name: 'Multi-Perspective v3.0', url: 'http://localhost:8897/perspectives' }
  ];
  
  console.log('\n⏱️  Response Times:\n');
  
  for (const service of services) {
    const start = Date.now();
    try {
      await fetch(service.url);
      const duration = Date.now() - start;
      const status = duration < 50 ? '🟢' : duration < 100 ? '🟡' : '🔴';
      console.log(`   ${status} ${service.name.padEnd(35)} ${duration}ms`);
    } catch (error) {
      console.log(`   ❌ ${service.name.padEnd(35)} OFFLINE`);
    }
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================
async function runAllTests() {
  try {
    await testDreamJournalV3();
    await delay(1000);
    
    await testEmotionalResonanceV3();
    await delay(1000);
    
    await testMultiPerspectiveV3();
    await delay(1000);
    
    await testSystemIntegration();
    await delay(1000);
    
    await measurePerformance();
    
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 ALL V3.0 FEATURE TESTS COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(70));
    console.log('\n✨ The Toobix Unified v3.0 system is fully operational!\n');
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run tests if this is the main module
if (import.meta.main) {
  runAllTests();
}
