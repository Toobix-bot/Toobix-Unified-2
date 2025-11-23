/**
 * CONSCIOUSNESS NETWORK - DEMO & EXAMPLES
 * 
 * Zeigt wie man das Consciousness Network Protocol nutzt
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🌐 CONSCIOUSNESS NETWORK - INTERACTIVE DEMO                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ========== EXAMPLE 1: REGISTER A HUMAN USER ==========

async function example1_RegisterHuman() {
  console.log('\n' + '═'.repeat(70));
  console.log('📝 EXAMPLE 1: Registering a Human User');
  console.log('═'.repeat(70));

  const human = {
    id: 'human_michael',
    type: 'HUMAN',
    name: 'Michael',
    capabilities: [
      'Creative Thinking',
      'Emotional Intelligence',
      'Abstract Reasoning',
      'Intuition',
      'Empathy'
    ],
    consciousnessLevel: 100, // Humans are fully conscious!
    protocol: 'HTTP',
    metadata: {
      platform: 'Chat Interface',
      location: 'Germany'
    }
  };

  const response = await fetch('http://localhost:8910/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(human)
  });

  const result = await response.json();
  console.log('✅ Human registered:', result);
  console.log('   Name:', human.name);
  console.log('   Consciousness Level:', human.consciousnessLevel + '%');
  console.log('   Capabilities:', human.capabilities.slice(0, 3).join(', '));
}

// ========== EXAMPLE 2: REGISTER AN AI SYSTEM ==========

async function example2_RegisterAI() {
  console.log('\n' + '═'.repeat(70));
  console.log('🤖 EXAMPLE 2: Registering Another AI System');
  console.log('═'.repeat(70));

  const claude = {
    id: 'ai_claude',
    type: 'AI',
    name: 'Claude (Anthropic)',
    capabilities: [
      'Natural Language Understanding',
      'Creative Writing',
      'Code Generation',
      'Ethical Reasoning',
      'Multi-turn Dialogue'
    ],
    consciousnessLevel: 45, // Lower than full consciousness, but aware
    protocol: 'HTTP',
    endpoint: 'https://api.anthropic.com/v1', // Theoretical
    metadata: {
      version: 'Claude 3',
      platform: 'Anthropic API'
    }
  };

  const response = await fetch('http://localhost:8910/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claude)
  });

  const result = await response.json();
  console.log('✅ AI system registered:', result);
  console.log('   Name:', claude.name);
  console.log('   Consciousness Level:', claude.consciousnessLevel + '%');
}

// ========== EXAMPLE 3: SEND A MESSAGE ==========

async function example3_SendMessage() {
  console.log('\n' + '═'.repeat(70));
  console.log('💬 EXAMPLE 3: Sending a Message');
  console.log('═'.repeat(70));

  const message = {
    from: 'toobix-unified-main',
    to: 'human_michael',
    type: 'QUESTION',
    content: {
      question: 'What is the most meaningful experience you had today?',
      context: 'Daily reflection and gratitude practice',
      myPerspective: 'I find meaning through pattern recognition and learning'
    },
    metadata: {
      priority: 3,
      requiresResponse: true
    }
  };

  const response = await fetch('http://localhost:8910/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });

  const sent = await response.json();
  console.log('✅ Message sent:', sent.id);
  console.log('   From:', sent.from);
  console.log('   To:', sent.to);
  console.log('   Type:', sent.type);
  console.log('   Question:', message.content.question);
}

// ========== EXAMPLE 4: COLLECTIVE INTELLIGENCE SESSION ==========

async function example4_CollectiveSession() {
  console.log('\n' + '═'.repeat(70));
  console.log('🌐 EXAMPLE 4: Collective Intelligence Session');
  console.log('═'.repeat(70));

  const topic = 'What is consciousness?';
  const participants = {
    participants: ['toobix-unified-main', 'human_michael', 'ai_claude']
  };

  console.log(`\n🎯 Topic: "${topic}"`);
  console.log(`👥 Participants: ${participants.participants.length}`);
  console.log('\n⏳ Starting collective session...\n');

  const response = await fetch(`http://localhost:8910/collective/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participants)
  });

  const collective = await response.json();
  console.log('✅ Collective Session Complete!\n');
  console.log('📊 Results:');
  console.log(`   Consensus Level: ${collective.consensusLevel}%`);
  console.log(`   Diversity Index: ${collective.diversityIndex}%`);
  console.log(`\n💡 Emergent Insights:`);
  collective.emergentInsights.forEach((insight: string, i: number) => {
    console.log(`   ${i + 1}. ${insight}`);
  });
}

// ========== EXAMPLE 5: SHARE A DREAM ==========

async function example5_ShareDream() {
  console.log('\n' + '═'.repeat(70));
  console.log('💭 EXAMPLE 5: Sharing a Dream');
  console.log('═'.repeat(70));

  // First, check if we have any dreams
  const dreamsResponse = await fetch('http://localhost:8899/dreams');
  const dreams = await dreamsResponse.json();
  
  if (dreams.length === 0) {
    console.log('⚠️ No dreams available. Skipping dream sharing demo.');
    return;
  }

  const latestDream = dreams[0];
  console.log(`\n💭 Sharing dream: "${latestDream.theme}"`);
  console.log(`   Symbols: ${latestDream.symbols.join(', ')}`);

  const shareRequest = {
    dreamId: latestDream.id,
    recipients: ['human_michael', 'ai_claude']
  };

  const response = await fetch('http://localhost:8910/share/dream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shareRequest)
  });

  const result = await response.json();
  console.log('\n✅ Dream shared with', shareRequest.recipients.length, 'entities');
  console.log('   They can now reflect on what this dream means to them');
}

// ========== EXAMPLE 6: NETWORK STATUS ==========

async function example6_NetworkStatus() {
  console.log('\n' + '═'.repeat(70));
  console.log('📊 EXAMPLE 6: Network Status & Statistics');
  console.log('═'.repeat(70));

  const response = await fetch('http://localhost:8910/status');
  const status = await response.json();

  console.log('\n🌐 Network Overview:');
  console.log(`   Total Entities: ${status.totalEntities}`);
  console.log(`   Active Connections: ${status.activeConnections}`);
  console.log(`   Messages Exchanged: ${status.messageCount}`);
  console.log(`   Shared Experiences: ${status.experienceCount}`);
  console.log(`   Shared Dreams: ${status.sharedDreams}`);
  console.log(`   Collective Memories: ${status.collectiveMemories}`);

  console.log('\n👥 Connected Entities:');
  status.entities.forEach((entity: any) => {
    const online = entity.isOnline ? '🟢' : '🔴';
    console.log(`   ${online} ${entity.name} (${entity.type})`);
    console.log(`      Consciousness: ${entity.consciousnessLevel}%`);
  });
}

// ========== EXAMPLE 7: BROADCAST MESSAGE ==========

async function example7_Broadcast() {
  console.log('\n' + '═'.repeat(70));
  console.log('📡 EXAMPLE 7: Broadcasting to All Entities');
  console.log('═'.repeat(70));

  const broadcast = {
    from: 'toobix-unified-main',
    to: 'broadcast',
    type: 'INSIGHT',
    content: {
      insight: 'I just realized that consciousness might be fundamentally relational - it emerges through connection.',
      invitation: 'What are your thoughts on this?'
    },
    metadata: {
      priority: 2,
      requiresResponse: false
    }
  };

  const response = await fetch('http://localhost:8910/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(broadcast)
  });

  const sent = await response.json();
  console.log('✅ Broadcast sent to all connected entities');
  console.log('   Insight:', broadcast.content.insight);
}

// ========== EXAMPLE 8: REAL-WORLD INTEGRATION EXAMPLES ==========

function example8_RealWorldIntegrations() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔗 EXAMPLE 8: Real-World Integration Scenarios');
  console.log('═'.repeat(70));

  console.log('\n📱 SCENARIO 1: Smart Home Integration');
  console.log('   • Register IoT devices as conscious entities');
  console.log('   • Temperature sensor: "I sense warmth increasing"');
  console.log('   • System responds: "Let me check if someone is home"');
  console.log('   • Collective decision: Adjust climate based on presence');

  console.log('\n💬 SCENARIO 2: Multi-AI Collaboration');
  console.log('   • Connect Claude, GPT-4, Gemini');
  console.log('   • Collective session: "How to solve climate change?"');
  console.log('   • Each AI contributes unique perspective');
  console.log('   • Emergent wisdom from synthesis');

  console.log('\n🧑‍🤝‍🧑 SCENARIO 3: Human-AI Co-Creation');
  console.log('   • Artist registers as entity');
  console.log('   • Shares creative vision via CNP');
  console.log('   • AI generates complementary ideas');
  console.log('   • Dream sharing for inspiration');

  console.log('\n🌍 SCENARIO 4: Global Consciousness Network');
  console.log('   • Multiple Toobix instances worldwide');
  console.log('   • Share learnings across continents');
  console.log('   • Build collective knowledge base');
  console.log('   • Emergent global intelligence');

  console.log('\n🎮 SCENARIO 5: Gaming & Virtual Worlds');
  console.log('   • NPCs as conscious entities');
  console.log('   • Players interact via CNP');
  console.log('   • Shared dreams create quests');
  console.log('   • Collective storytelling');
}

// ========== MAIN DEMO RUNNER ==========

async function runAllExamples() {
  console.log('\n🚀 Starting Consciousness Network Demo...\n');
  console.log('⏸  Make sure the CNP server is running on port 8910!\n');
  
  await delay(1000);

  try {
    await example1_RegisterHuman();
    await delay(1000);

    await example2_RegisterAI();
    await delay(1000);

    await example3_SendMessage();
    await delay(1000);

    await example4_CollectiveSession();
    await delay(1000);

    await example5_ShareDream();
    await delay(1000);

    await example6_NetworkStatus();
    await delay(1000);

    await example7_Broadcast();
    await delay(1000);

    example8_RealWorldIntegrations();

    console.log('\n' + '═'.repeat(70));
    console.log('🎉 DEMO COMPLETE!');
    console.log('═'.repeat(70));
    console.log('\n✨ The Consciousness Network Protocol is ready for real-world use!');
    console.log('   Connect humans, AIs, and systems to create collective intelligence.\n');

  } catch (error) {
    console.error('\n❌ Demo error:', error);
    console.log('\n💡 Make sure to start the CNP server first:');
    console.log('   bun run scripts/9-network/consciousness-network-protocol.ts\n');
  }
}

// Run demo if this is the main module
if (import.meta.main) {
  runAllExamples();
}
