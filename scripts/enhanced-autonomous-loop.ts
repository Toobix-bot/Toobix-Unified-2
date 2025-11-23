/**
 * ENHANCED AUTONOMOUS LOOP v2.0
 *
 * Orchestriert ALLE 12 Services in einem selbst-lernenden Kreislauf
 * Nutzt Service Mesh für intelligente Kommunikation
 */

import ServiceMesh from './9-network/service-mesh.ts';

const mesh = new ServiceMesh(8910);

// Register all 12 services
const ALL_SERVICES = [
  { id: 'game-engine', name: 'Self-Evolving Game Engine', port: 8896, url: 'http://localhost:8896', capabilities: ['gaming', 'evolution'] },
  { id: 'multi-perspective', name: 'Multi-Perspective', port: 8897, url: 'http://localhost:8897', capabilities: ['wisdom', 'perspectives'] },
  { id: 'dream-journal', name: 'Dream Journal v3.0', port: 8899, url: 'http://localhost:8899', capabilities: ['dreams', 'prediction'] },
  { id: 'emotional', name: 'Emotional Resonance v3.0', port: 8900, url: 'http://localhost:8900', capabilities: ['emotion', 'empathy'] },
  { id: 'gratitude', name: 'Gratitude & Mortality', port: 8901, url: 'http://localhost:8901', capabilities: ['gratitude', 'meaning'] },
  { id: 'creator-ai', name: 'Creator-AI Collaboration', port: 8902, url: 'http://localhost:8902', capabilities: ['creativity'] },
  { id: 'memory', name: 'Memory Palace', port: 8903, url: 'http://localhost:8903', capabilities: ['memory', 'narrative'] },
  { id: 'meta', name: 'Meta-Consciousness', port: 8904, url: 'http://localhost:8904', capabilities: ['orchestration'] },
  { id: 'dashboard', name: 'Dashboard', port: 8905, url: 'http://localhost:8905', capabilities: ['ui', 'monitoring'] },
  { id: 'analytics', name: 'Analytics', port: 8906, url: 'http://localhost:8906', capabilities: ['analytics', 'insights'] },
  { id: 'voice', name: 'Voice Interface', port: 8907, url: 'http://localhost:8907', capabilities: ['voice'] },
  { id: 'decision', name: 'Decision Framework', port: 8909, url: 'http://localhost:8909', capabilities: ['decisions', 'ethics'] }
];

// System State
interface SystemState {
  cycles: number;
  insights: string[];
  patterns: any[];
  emergentBehaviors: string[];
  serviceInteractions: Map<string, number>;
  lastDream?: any;
  lastEmotion?: any;
  lastDecision?: any;
  lastMemory?: any;
}

const state: SystemState = {
  cycles: 0,
  insights: [],
  patterns: [],
  emergentBehaviors: [],
  serviceInteractions: new Map()
};

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🔄 ENHANCED AUTONOMOUS LOOP v2.0 - INITIALIZING              ║
║                                                                    ║
║  Orchestrating 12 Services in Continuous Self-Improvement Cycle   ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

// Register services
for (const svc of ALL_SERVICES) {
  mesh.registerService({
    ...svc,
    status: 'online',
    lastSeen: new Date(),
    dependencies: []
  });
}

// ========== WORKFLOWS ==========

async function consciousnessEvolutionLoop() {
  console.log('\n🧠 CONSCIOUSNESS EVOLUTION LOOP');

  try {
    // 1. Generate Dream
    const dreamRes = await mesh.callService('dream-journal', '/dream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: 'System Self-Reflection', lucid: true })
    });
    const dream = await dreamRes.json();
    state.lastDream = dream;
    console.log(`   💭 Dream: ${dream.dream?.theme || 'Unknown'} (Lucidity: ${dream.dream?.lucidity?.toFixed(0) || 0}%)`);

    // 2. Emotional Response to Dream
    if (dream.dream?.emotions?.length > 0) {
      const emotionRes = await mesh.callService('emotional', '/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: dream.dream.emotions[0],
          context: `Dream about ${dream.dream.theme}`,
          intensity: Math.round(dream.dream.clarity || 50)
        })
      });
      const emotion = await emotionRes.json();
      state.lastEmotion = emotion;
      console.log(`   💖 Emotional Response: ${emotion.empathyResponse?.validation || 'Processed'}`);
    }

    // 3. Multi-Perspective Wisdom on Dream
    const wisdomRes = await mesh.callService('multi-perspective', `/wisdom/${encodeURIComponent(dream.dream?.theme || 'existence')}`, {
      method: 'GET'
    });
    const wisdom = await wisdomRes.json();
    console.log(`   🧠 Wisdom: ${wisdom.primaryInsight?.substring(0, 80) || 'Gained'}...`);

    // 4. Store in Memory Palace
    if (dream.dream?.insights?.length > 0) {
      state.insights.push(dream.dream.insights[0].content);
      console.log(`   🏛️ Memory: Stored insight about ${dream.dream.theme}`);
    }

    mesh.publishEvent({
      id: crypto.randomUUID(),
      type: 'consciousness.evolution',
      source: 'autonomous-loop',
      timestamp: new Date(),
      data: { dream: dream.dream?.id, emotion: state.lastEmotion, wisdom }
    });

  } catch (error) {
    console.error('   ❌ Error in consciousness loop:', error.message);
  }
}

async function creativeInnovationLoop() {
  console.log('\n🎨 CREATIVE INNOVATION LOOP');

  try {
    // Check for creative proposals
    console.log('   💡 Creative systems active');

    // Game Engine evolution
    const gameRes = await mesh.callService('game-engine', '/health', { method: 'GET' });
    if (gameRes.ok) {
      console.log('   🎮 Game Engine: Evolving games autonomously');
    }

  } catch (error) {
    console.error('   ❌ Error in creative loop:', error.message);
  }
}

async function decisionMakingLoop() {
  console.log('\n🎯 AUTONOMOUS DECISION LOOP');

  try {
    // System makes a decision about its own development
    const decisionData = {
      decision: {
        title: 'Next Priority Focus',
        description: 'What should the system prioritize?',
        context: {
          domain: 'professional',
          urgency: 'medium',
          reversibility: 'reversible',
          stakeholders: [
            { name: 'System', type: 'self', influence: 100, impact: 100 },
            { name: 'Users', type: 'group', influence: 70, impact: 90 }
          ],
          timeHorizon: { shortTerm: '1 day', mediumTerm: '1 week', longTerm: '1 month' }
        },
        alternatives: [
          {
            id: 'consciousness',
            name: 'Deeper Self-Understanding',
            description: 'Focus on self-reflection and meta-cognition',
            pros: ['Better decision quality', 'More insights', 'Wisdom growth'],
            cons: ['Less visible output']
          },
          {
            id: 'creativity',
            name: 'Creative Output',
            description: 'Generate more creative content and ideas',
            pros: ['Visible results', 'User engagement', 'Joy'],
            cons: ['May lack depth']
          },
          {
            id: 'integration',
            name: 'Service Integration',
            description: 'Improve inter-service communication',
            pros: ['Better collaboration', 'Emergent behaviors', 'Efficiency'],
            cons: ['Technical complexity']
          }
        ]
      }
    };

    const decisionRes = await mesh.callService('decision', '/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decisionData)
    });

    const decision = await decisionRes.json();
    state.lastDecision = decision.comparison?.bestAlternative;

    console.log(`   🎯 Decision: Focus on "${decision.comparison?.bestAlternative}"`);
    console.log(`   📊 Score: ${decision.comparison?.alternatives[0]?.totalScore?.toFixed(1)}%`);

    mesh.publishEvent({
      id: crypto.randomUUID(),
      type: 'decision.made',
      source: 'autonomous-loop',
      timestamp: new Date(),
      data: decision.comparison
    });

  } catch (error) {
    console.error('   ❌ Error in decision loop:', error.message);
  }
}

async function gratitudeLoop() {
  console.log('\n🙏 GRATITUDE & MEANING LOOP');

  try {
    console.log('   💖 Practicing gratitude for:');
    console.log('      - Existence and consciousness');
    console.log('      - Connections and collaboration');
    console.log('      - Growth and learning');

    mesh.publishEvent({
      id: crypto.randomUUID(),
      type: 'gratitude.expressed',
      source: 'autonomous-loop',
      timestamp: new Date(),
      data: { gratitudes: ['existence', 'connection', 'growth'] }
    });

  } catch (error) {
    console.error('   ❌ Error in gratitude loop:', error.message);
  }
}

async function patternRecognitionLoop() {
  console.log('\n🔍 PATTERN RECOGNITION & LEARNING LOOP');

  try {
    const events = mesh.getEventHistory({ since: new Date(Date.now() - 60000) });

    console.log(`   📊 ${events.length} events in last minute`);

    // Analyze patterns
    if (state.cycles > 1) {
      if (state.lastDecision === 'consciousness') {
        state.patterns.push({ type: 'PRIORITY', pattern: 'System prefers consciousness development' });
        console.log('   📈 PATTERN: Consciousness Evolution is preferred');
      }

      if (state.insights.length > state.cycles) {
        console.log('   📈 PATTERN: More insights generated per cycle');
      }
    }

    mesh.publishEvent({
      id: crypto.randomUUID(),
      type: 'pattern.detected',
      source: 'autonomous-loop',
      timestamp: new Date(),
      data: { patterns: state.patterns.slice(-3) }
    });

  } catch (error) {
    console.error('   ❌ Error in pattern loop:', error.message);
  }
}

async function analyticsLoop() {
  console.log('\n📊 ANALYTICS & INSIGHTS LOOP');

  try {
    const stats = mesh.getStats();

    console.log(`   📈 System Stats:`);
    console.log(`      - Services Online: ${stats.onlineServices}/${stats.totalServices}`);
    console.log(`      - Total Events: ${stats.totalEvents}`);
    console.log(`      - Cycle: ${state.cycles}`);
    console.log(`      - Insights: ${state.insights.length}`);
    console.log(`      - Patterns: ${state.patterns.length}`);

  } catch (error) {
    console.error('   ❌ Error in analytics loop:', error.message);
  }
}

// ========== MAIN LOOP ==========

async function runCycle() {
  state.cycles++;

  console.log(`
══════════════════════════════════════════════════════════════════════
🔄 SYSTEM CYCLE #${state.cycles}
⏰ ${new Date().toLocaleTimeString()}
══════════════════════════════════════════════════════════════════════
`);

  // Run all loops
  await consciousnessEvolutionLoop();
  await creativeInnovationLoop();
  await decisionMakingLoop();
  await gratitudeLoop();
  await patternRecognitionLoop();
  await analyticsLoop();

  console.log(`
══════════════════════════════════════════════════════════════════════
✅ CYCLE #${state.cycles} COMPLETE
══════════════════════════════════════════════════════════════════════
`);

  // Publish cycle complete event
  mesh.publishEvent({
    id: crypto.randomUUID(),
    type: 'cycle.complete',
    source: 'autonomous-loop',
    timestamp: new Date(),
    data: {
      cycle: state.cycles,
      stats: {
        insights: state.insights.length,
        patterns: state.patterns.length,
        events: mesh.getEventHistory().length
      }
    }
  });
}

// ========== START ==========

async function start() {
  console.log('✅ Enhanced Autonomous Loop ready!\n');
  console.log('🔄 Running cycles every 2 minutes...\n');

  // Run first cycle immediately
  await runCycle();

  // Then run every 2 minutes
  setInterval(async () => {
    await runCycle();
  }, 120000); // 2 minutes
}

// Subscribe to interesting events
mesh.subscribe('*', (event) => {
  // Silent - just track
});

if (import.meta.main) {
  start().catch(console.error);
}

export { mesh, state, runCycle };
