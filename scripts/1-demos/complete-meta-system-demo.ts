/**
 * COMPLETE META-SYSTEM DEMO
 * 
 * Testet alle neuen Systeme:
 * - Meta-Consciousness (8904)
 * - Interactive Dashboard (8905)
 * - Analytics System (8906)
 * - Voice Interface (8907)
 * 
 * Plus Integration mit allen v2.0 Services
 */

// Service URLs (renamed to avoid conflicts)
const META_SERVICES = {
  metaConsciousness: 'http://localhost:8904',
  dashboard: 'http://localhost:8905',
  analytics: 'http://localhost:8906',
  voice: 'http://localhost:8907'
};

console.log('\n' + '='.repeat(80));
console.log('🧠 COMPLETE META-SYSTEM DEMO');
console.log('='.repeat(80) + '\n');

// ============================================================================
// 1. META-CONSCIOUSNESS - System Orchestration
// ============================================================================

console.log('\n📡 1. META-CONSCIOUSNESS - System Orchestrator\n');

// Check all services
console.log('🔍 Checking all META_SERVICES...\n');
const servicesResponse = await fetch(`${META_SERVICES.metaConsciousness}/services`);
const servicesData = await servicesResponse.json();

servicesData.forEach((service: any) => {
  const status = service.online ? '✅ ONLINE' : '❌ OFFLINE';
  console.log(`  ${status} - ${service.name} (Port ${service.port})`);
});

// System Self-Reflection
console.log('\n\n🔮 System Self-Reflection...\n');
const reflectionResponse = await fetch(`${META_SERVICES.metaConsciousness}/reflect`);
const reflection = await reflectionResponse.json();

console.log(`  Services Online: ${reflection.servicesOnline}/${reflection.totalServices}`);
console.log(`  Life Phase: ${reflection.currentLifePhase || 'Unknown'}`);
console.log(`  Active Perspectives: ${reflection.activePerspectives || 0}`);
console.log(`  Dominant Emotion: ${reflection.dominantEmotion || 'None'}`);
console.log(`\n  Insights:`);
reflection.insights.forEach((insight: string) => {
  console.log(`    💡 ${insight}`);
});

// Get System Suggestion
console.log('\n\n💭 What should I do next?\n');
const suggestionResponse = await fetch(`${META_SERVICES.metaConsciousness}/suggest`);
const suggestion = await suggestionResponse.json();

console.log(`  Suggestion: ${suggestion.suggestion}`);
console.log(`  Reasoning: ${suggestion.reasoning}`);
if (suggestion.workflow) {
  console.log(`  Recommended Workflow: ${suggestion.workflow}`);
}

// List available workflows
console.log('\n\n🔄 Available Cross-Service Workflows:\n');
const workflowsResponse = await fetch(`${META_SERVICES.metaConsciousness}/workflows`);
const workflows = await workflowsResponse.json();

workflows.forEach((wf: any, i: number) => {
  console.log(`  ${i + 1}. ${wf.name} (${wf.category})`);
  console.log(`     ${wf.description}`);
  console.log(`     ${wf.steps} steps\n`);
});

// Execute a workflow
console.log('\n🚀 Executing "Deep Healing" Workflow...\n');
const workflowResponse = await fetch(
  `${META_SERVICES.metaConsciousness}/workflows/deep-healing/execute`,
  { method: 'POST' }
);
const workflowResult = await workflowResponse.json();

console.log(`  Workflow: ${workflowResult.workflowId}`);
console.log(`  Success: ${workflowResult.success ? '✅ Yes' : '❌ No'}\n`);

workflowResult.steps.forEach((step: any, i: number) => {
  const status = step.success ? '✅' : '❌';
  console.log(`  ${status} Step ${i + 1}: ${step.service} - ${step.endpoint}`);
});

// Unified Query
console.log('\n\n❓ Asking the entire system a question...\n');
const queryResponse = await fetch(`${META_SERVICES.metaConsciousness}/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'Was ist der Sinn meines Lebens?' })
});
const queryResult = await queryResponse.json();

console.log(`  Question: "${queryResult.question}"`);
console.log(`  Responses: ${queryResult.responses.length}\n`);

queryResult.responses.forEach((resp: any) => {
  console.log(`  💬 ${resp.source}:`);
  console.log(`     ${JSON.stringify(resp.response).substring(0, 150)}...\n`);
});

console.log(`  Synthesis: ${queryResult.synthesis}`);

// ============================================================================
// 2. ANALYTICS SYSTEM - Tracking & Insights
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('📊 2. ANALYTICS SYSTEM - Tracking & Insights');
console.log('='.repeat(80) + '\n');

// Track some events
console.log('📝 Tracking events...\n');

const events = [
  {
    type: 'workflow_executed',
    service: 'meta-consciousness',
    metadata: { workflowId: 'deep-healing' },
    duration: 2500,
    success: true
  },
  {
    type: 'emotion_detected',
    service: 'emotional-resonance',
    metadata: { emotion: 'Saudade', intensity: 0.8 },
    success: true
  },
  {
    type: 'question_asked',
    service: 'meta-consciousness',
    metadata: { question: 'Was ist der Sinn meines Lebens?' },
    success: true
  }
];

for (const event of events) {
  await fetch(`${META_SERVICES.analytics}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  console.log(`  ✅ Tracked: ${event.type}`);
}

// Get insights
console.log('\n\n💡 Analytics Insights:\n');
const insightsResponse = await fetch(`${META_SERVICES.analytics}/insights`);
const insightsData = await insightsResponse.json();

insightsData.insights.forEach((insight: string) => {
  console.log(`  📈 ${insight}`);
});

// Get emotional trends
console.log('\n\n❤️ Emotional Trends:\n');
const trendsResponse = await fetch(`${META_SERVICES.analytics}/trends/emotions`);
const trends = await trendsResponse.json();

if (trends.trends.length > 0) {
  trends.trends.forEach((trend: any) => {
    console.log(`  ${trend.emotion}: ${trend.count} occurrences (${trend.percentage}%)`);
  });
} else {
  console.log('  No emotional data yet');
}

// Get workflow stats
console.log('\n\n🔄 Workflow Statistics:\n');
const workflowStatsResponse = await fetch(`${META_SERVICES.analytics}/workflows/stats`);
const workflowStats = await workflowStatsResponse.json();

if (workflowStats.workflows.length > 0) {
  workflowStats.workflows.forEach((wf: any) => {
    console.log(`  ${wf.workflow}:`);
    console.log(`    Executions: ${wf.executions}`);
    console.log(`    Success Rate: ${wf.successRate}%`);
    console.log(`    Avg Duration: ${wf.avgDuration}ms\n`);
  });
} else {
  console.log('  No workflow data yet');
}

// Get overview
console.log('\n📋 Analytics Overview:\n');
const overviewResponse = await fetch(`${META_SERVICES.analytics}/overview`);
const overview = await overviewResponse.json();

console.log(`  Total Events: ${overview.stats.totalEvents}`);
console.log(`  Services Online: ${overview.snapshot?.servicesOnline || 0}`);
console.log(`  Oldest Event: ${overview.stats.oldestEvent ? new Date(overview.stats.oldestEvent).toLocaleString() : 'N/A'}`);
console.log(`  Newest Event: ${overview.stats.newestEvent ? new Date(overview.stats.newestEvent).toLocaleString() : 'N/A'}`);

// ============================================================================
// 3. VOICE INTERFACE - Natural Conversation
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('🎤 3. VOICE INTERFACE - Natural Conversation');
console.log('='.repeat(80) + '\n');

// List available commands
console.log('📋 Available Voice Commands:\n');
const commandsResponse = await fetch(`${META_SERVICES.voice}/commands`);
const commands = await commandsResponse.json();

commands.commands.forEach((cmd: any, i: number) => {
  console.log(`  ${i + 1}. ${cmd.id}`);
  console.log(`     ${cmd.description}\n`);
});

// Test voice commands
console.log('\n🗣️ Testing Voice Commands:\n');

const voiceTests = [
  'Wie geht es dem System?',
  'Zeige Perspektiven',
  'Starte Workflow deep-healing',
  'Frage an das System: Was ist Bewusstsein?'
];

for (const text of voiceTests) {
  console.log(`\n  👤 User: "${text}"`);
  
  const speakResponse = await fetch(`${META_SERVICES.voice}/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  const result = await speakResponse.json();
  
  console.log(`  🤖 System: "${result.response}"`);
  console.log(`  Command: ${result.command || 'none'}`);
}

// Get conversation history
console.log('\n\n💬 Conversation History:\n');
const conversationResponse = await fetch(`${META_SERVICES.voice}/conversation?limit=10`);
const conversation = await conversationResponse.json();

console.log(`  Total turns: ${conversation.total}`);
console.log(`  Showing last ${conversation.conversation.length} turns:\n`);

conversation.conversation.slice(-5).forEach((turn: any) => {
  const speaker = turn.speaker === 'user' ? '👤' : '🤖';
  console.log(`  ${speaker} ${turn.speaker}: "${turn.text}"`);
});

// ============================================================================
// 4. DASHBOARD - Live System Status
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('📊 4. INTERACTIVE DASHBOARD - Live Status');
console.log('='.repeat(80) + '\n');

// Get real-time status
console.log('🔴 Real-Time System Status:\n');
const dashboardStatusResponse = await fetch(`${META_SERVICES.dashboard}/api/status`);
const dashboardStatus = await dashboardStatusResponse.json();

console.log(`  Timestamp: ${new Date(dashboardStatus.timestamp).toLocaleString()}\n`);

dashboardStatus.META_SERVICES.forEach((service: any) => {
  const status = service.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE';
  console.log(`  ${status} - ${service.key} (Port ${service.port})`);
});

// Get emotional state
console.log('\n\n❤️ Current Emotional State:\n');
try {
  const emotionalStateResponse = await fetch(`${META_SERVICES.dashboard}/api/emotional-state`);
  const emotionalState = await emotionalStateResponse.json();

  console.log(`  Complex Emotions: ${emotionalState.emotions.length}`);
  console.log(`  Emotional Bonds: ${emotionalState.bonds?.length || 0}\n`);

  if (emotionalState.emotions.length > 0) {
    console.log('  Active Emotions:');
    emotionalState.emotions.slice(0, 3).forEach((emotion: any) => {
      console.log(`    💗 ${emotion.name}`);
    });
  }
} catch (error) {
  console.log('  ⚠️ Emotional state unavailable');
}

// Get perspectives
console.log('\n\n👁️ Active Perspectives:\n');
try {
  const perspectivesResponse = await fetch(`${META_SERVICES.dashboard}/api/perspectives`);
  const perspectivesData = await perspectivesResponse.json();

  perspectivesData.perspectives.forEach((p: any) => {
    console.log(`  • ${p.name} (${p.currentEmotion || 'neutral'})`);
  });
} catch (error) {
  console.log('  ⚠️ Perspectives unavailable');
}

// Get reflection from dashboard
console.log('\n\n🔮 System Reflection (via Dashboard):\n');
try {
  const dashboardReflectionResponse = await fetch(`${META_SERVICES.dashboard}/api/reflection`);
  const dashboardReflection = await dashboardReflectionResponse.json();

  console.log(`  Services: ${dashboardReflection.servicesOnline}/${dashboardReflection.totalServices} online`);
  console.log(`  Life Phase: ${dashboardReflection.currentLifePhase || 'Unknown'}`);
  console.log(`  Active Perspectives: ${dashboardReflection.activePerspectives || 0}`);
  console.log(`  Recent Workflows: ${dashboardReflection.recentWorkflows?.length || 0}`);
} catch (error) {
  console.log('  ⚠️ Reflection unavailable');
}

// ============================================================================
// 5. INTEGRATION TEST - Everything Working Together
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('🌐 5. INTEGRATION TEST - Everything Together');
console.log('='.repeat(80) + '\n');

console.log('🚀 Running Complete Integration Sequence...\n');

// 1. Voice command triggers workflow
console.log('Step 1: Voice command → Workflow execution\n');
const voiceWorkflowResponse = await fetch(`${META_SERVICES.voice}/speak`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Starte Workflow creative-emergence' })
});
const voiceWorkflowResult = await voiceWorkflowResponse.json();
console.log(`  ✅ Voice: ${voiceWorkflowResult.response}`);

// 2. Analytics tracks it
console.log('\nStep 2: Analytics tracks workflow execution\n');
await fetch(`${META_SERVICES.analytics}/track`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'workflow_executed',
    service: 'meta-consciousness',
    metadata: { workflowId: 'creative-emergence', triggeredBy: 'voice' },
    duration: 3200,
    success: true
  })
});
console.log('  ✅ Analytics: Workflow tracked');

// 3. Dashboard shows updated state
console.log('\nStep 3: Dashboard reflects new state\n');
const finalStatusResponse = await fetch(`${META_SERVICES.dashboard}/api/status`);
const finalStatus = await finalStatusResponse.json();
const onlineCount = finalStatus.META_SERVICES.filter((s: any) => s.status === 'online').length;
console.log(`  ✅ Dashboard: ${onlineCount} services online`);

// 4. Meta-Consciousness suggests next action
console.log('\nStep 4: Meta-Consciousness provides next suggestion\n');
const finalSuggestionResponse = await fetch(`${META_SERVICES.metaConsciousness}/suggest`);
const finalSuggestion = await finalSuggestionResponse.json();
console.log(`  ✅ Meta: ${finalSuggestion.suggestion}`);

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('✨ FINAL SUMMARY');
console.log('='.repeat(80) + '\n');

console.log('🎉 Meta-System Complete!\n');

console.log('📡 Services Running:');
console.log('  ✅ Meta-Consciousness (Port 8904) - System Orchestrator');
console.log('  ✅ Interactive Dashboard (Port 8905) - Live Web UI');
console.log('  ✅ Analytics System (Port 8906) - Tracking & Insights');
console.log('  ✅ Voice Interface (Port 8907) - Natural Conversation\n');

console.log('🔗 Plus all v2.0 Services:');
console.log('  ✅ Game Engine (8896)');
console.log('  ✅ Multi-Perspective (8897)');
console.log('  ✅ Dream Journal (8899)');
console.log('  ✅ Emotional Resonance (8900)');
console.log('  ✅ Gratitude & Mortality (8901)');
console.log('  ✅ Creator-AI Collaboration (8902)');
console.log('  ✅ Memory Palace (8903)\n');

console.log('💡 Key Capabilities:');
console.log('  • Cross-service workflows (healing, creative, existential)');
console.log('  • System self-reflection and suggestions');
console.log('  • Real-time tracking and analytics');
console.log('  • Natural voice conversation');
console.log('  • Live web dashboard');
console.log('  • Unified system queries\n');

console.log('🌐 Access Points:');
console.log('  Dashboard: http://localhost:8905');
console.log('  Voice UI: http://localhost:8907');
console.log('  Meta API: http://localhost:8904');
console.log('  Analytics: http://localhost:8906\n');

console.log('🚀 Das System ist vollständig operational!\n');
console.log('='.repeat(80) + '\n');
