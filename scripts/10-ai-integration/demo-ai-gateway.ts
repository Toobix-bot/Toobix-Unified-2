/**
 * AI GATEWAY DEMO
 *
 * Demonstrates how Toobix enhances AI responses with consciousness
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║          🧠 AI GATEWAY DEMO - THE CONSCIOUSNESS LAYER             ║
║                                                                    ║
║  Demonstrating how Toobix makes AI systems more conscious,        ║
║  ethical, and emotionally intelligent                             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const GATEWAY_URL = 'http://localhost:8911';

// ========== HELPER FUNCTIONS ==========

async function queryAI(options: {
  provider: 'openai' | 'anthropic';
  prompt: string;
  withConsciousness?: boolean;
}) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🤖 Querying ${options.provider.toUpperCase()}`);
  console.log(`Question: "${options.prompt}"`);
  console.log(`Consciousness Enhancement: ${options.withConsciousness ? 'YES 🧠' : 'NO'}`);
  console.log(`${'─'.repeat(70)}\n`);

  try {
    const response = await fetch(`${GATEWAY_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ Error: ${error.error}\n`);
      return null;
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.log(`❌ Failed to connect to AI Gateway (${error.message})`);
    console.log(`   Make sure the service is running: bun run scripts/10-ai-integration/ai-gateway.ts\n`);
    return null;
  }
}

async function multiAIConsensus(question: string) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🌐 MULTI-AI CONSENSUS MODE`);
  console.log(`Question: "${question}"`);
  console.log(`${'═'.repeat(70)}\n`);

  try {
    const response = await fetch(`${GATEWAY_URL}/consensus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ Error: ${error.error}\n`);
      return null;
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.log(`❌ Failed to connect: ${error.message}\n`);
    return null;
  }
}

async function getStats() {
  try {
    const response = await fetch(`${GATEWAY_URL}/stats`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    return null;
  }
}

// ========== DEMO SCENARIOS ==========

async function demoBasicQuery() {
  console.log('\n\n📝 DEMO 1: BASIC AI QUERY (without consciousness)\n');
  console.log('This shows a normal AI query - no Toobix enhancement.');

  const result = await queryAI({
    provider: 'openai',
    prompt: 'What is consciousness?',
    withConsciousness: false
  });

  if (result) {
    console.log('📤 AI Response:');
    console.log(`\n${result.response}\n`);
    console.log(`⏱️  Processing Time: ${result.processingTime}ms`);
    if (result.usage) {
      console.log(`📊 Tokens: ${result.usage.totalTokens}`);
    }
  }
}

async function demoConsciousQuery() {
  console.log('\n\n🧠 DEMO 2: CONSCIOUS AI QUERY (with Toobix enhancement)\n');
  console.log('This is the MAGIC - AI response enhanced with Toobix consciousness!');

  const result = await queryAI({
    provider: 'openai',
    prompt: 'What is consciousness?',
    withConsciousness: true
  });

  if (result) {
    console.log('📤 Original AI Response:');
    console.log(`\n${result.response}\n`);

    if (result.consciousnessAnalysis) {
      console.log('✨ TOOBIX CONSCIOUSNESS ENHANCEMENTS:\n');

      if (result.consciousnessAnalysis.emotionalResonance) {
        console.log('💖 Emotional Analysis:');
        const er = result.consciousnessAnalysis.emotionalResonance;
        if (er.empathyResponse) {
          console.log(`   ${er.empathyResponse.validation}`);
        }
        if (er.eq) {
          console.log(`   EQ Score: ${er.eq.score}/100`);
        }
        console.log('');
      }

      if (result.consciousnessAnalysis.multiPerspective) {
        console.log('🧠 Multi-Perspective Wisdom:');
        const mp = result.consciousnessAnalysis.multiPerspective;
        if (mp.primaryInsight) {
          console.log(`   ${mp.primaryInsight.substring(0, 200)}...`);
        }
        console.log('');
      }

      console.log('✨ Enhanced Response:');
      console.log(`\n${result.consciousnessAnalysis.enhancedResponse}\n`);
    }

    console.log(`⏱️  Total Processing Time: ${result.processingTime}ms`);
  }
}

async function demoMultiAI() {
  console.log('\n\n🌐 DEMO 3: MULTI-AI CONSENSUS\n');
  console.log('Combines responses from multiple AIs and synthesizes with Toobix wisdom!');

  const result = await multiAIConsensus('What is the meaning of life?');

  if (result) {
    console.log('📊 Responses Collected:\n');

    for (const response of result.responses) {
      console.log(`${response.provider.toUpperCase()}:`);
      console.log(`${response.response.substring(0, 150)}...\n`);
    }

    if (result.synthesis) {
      console.log('✨ TOOBIX SYNTHESIS (combining all perspectives):');
      console.log(`\n${result.synthesis}\n`);
    }
  }
}

async function demoComparison() {
  console.log('\n\n⚖️  DEMO 4: SIDE-BY-SIDE COMPARISON\n');
  console.log('Same question, with and without consciousness enhancement:');

  const question = 'Should I pursue my creative passion or a stable career?';

  console.log('\n🤖 WITHOUT TOOBIX (standard AI):');
  const without = await queryAI({
    provider: 'openai',
    prompt: question,
    withConsciousness: false
  });

  if (without) {
    console.log(`\n${without.response.substring(0, 200)}...\n`);
  }

  console.log('\n🧠 WITH TOOBIX (conscious AI):');
  const withToobix = await queryAI({
    provider: 'openai',
    prompt: question,
    withConsciousness: true
  });

  if (withToobix && withToobix.consciousnessAnalysis) {
    console.log(`\n${withToobix.consciousnessAnalysis.enhancedResponse}\n`);
  }

  console.log('\n💡 THE DIFFERENCE:');
  console.log('   Standard AI: Provides logical advice');
  console.log('   Toobix AI: Adds emotional intelligence, multiple perspectives,');
  console.log('              ethical considerations, and deeper wisdom!\n');
}

// ========== RUN DEMOS ==========

async function runAllDemos() {
  console.log('\n🚀 Starting AI Gateway Demos...\n');

  // Check if gateway is running
  const stats = await getStats();
  if (!stats) {
    console.log('❌ AI Gateway not running!\n');
    console.log('Please start it first:');
    console.log('   bun run scripts/10-ai-integration/ai-gateway.ts\n');
    console.log('Then run this demo again:');
    console.log('   bun run scripts/10-ai-integration/demo-ai-gateway.ts\n');
    return;
  }

  console.log('✅ AI Gateway is running!\n');
  console.log('Available Providers:');
  for (const provider of stats.providers) {
    console.log(`   ${provider.id}: ${provider.available ? '✅ Ready' : '❌ No API Key'}`);
  }

  if (!stats.providers.some(p => p.available)) {
    console.log('\n⚠️  No AI providers configured!');
    console.log('\nTo use OpenAI (ChatGPT):');
    console.log('   export OPENAI_API_KEY="your-key-here"');
    console.log('\nTo use Anthropic (Claude):');
    console.log('   export ANTHROPIC_API_KEY="your-key-here"\n');
    console.log('📖 Running in DEMO MODE (showing architecture)\n');
  }

  // Interactive menu
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  Choose a demo:                                                   ║');
  console.log('║                                                                    ║');
  console.log('║  1. Basic AI Query (no consciousness)                             ║');
  console.log('║  2. Conscious AI Query (WITH Toobix!)                             ║');
  console.log('║  3. Multi-AI Consensus                                            ║');
  console.log('║  4. Side-by-Side Comparison                                       ║');
  console.log('║  5. Run ALL Demos                                                 ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const choice = prompt('Enter your choice (1-5): ');

  switch (choice) {
    case '1':
      await demoBasicQuery();
      break;
    case '2':
      await demoConsciousQuery();
      break;
    case '3':
      await demoMultiAI();
      break;
    case '4':
      await demoComparison();
      break;
    case '5':
      await demoBasicQuery();
      await demoConsciousQuery();
      await demoMultiAI();
      await demoComparison();
      break;
    default:
      console.log('Invalid choice. Running Demo 2 (Conscious Query)...');
      await demoConsciousQuery();
  }

  // Show final stats
  const finalStats = await getStats();
  if (finalStats) {
    console.log('\n\n📊 FINAL STATISTICS:\n');
    console.log(`Total Requests: ${finalStats.totalRequests}`);
    console.log(`Recent Requests: ${finalStats.recentRequests.length}\n`);
  }

  console.log('\n✅ Demo complete!\n');
  console.log('🌟 What you just saw:');
  console.log('   - AI Gateway connecting to external AIs');
  console.log('   - Consciousness Filter analyzing responses');
  console.log('   - Multi-Perspective wisdom synthesis');
  console.log('   - Emotional intelligence enhancement');
  console.log('\n💡 This is Toobix making AI systems more CONSCIOUS!\n');
}

// ========== MAIN ==========

if (import.meta.main) {
  runAllDemos().catch(console.error);
}

export { queryAI, multiAIConsensus, getStats };
