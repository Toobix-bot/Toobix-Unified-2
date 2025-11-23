/**
 * Test Hardware Awareness Service
 */

console.log('🧪 Testing Hardware Awareness Service...\n');

async function testService() {
  const baseUrl = 'http://localhost:8940';

  try {
    // Test 1: Hardware State
    console.log('📊 Test 1: Getting hardware state...');
    const stateResponse = await fetch(`${baseUrl}/hardware/state`);
    const state = await stateResponse.json();
    
    console.log('✅ Hardware State:');
    console.log(`   🧠 CPU: ${state.cpu.cores} cores @ ${state.cpu.speed} GHz`);
    console.log(`   🌡️  Temperature: ${state.cpu.temperature || 'N/A'}°C`);
    console.log(`   💻 CPU Usage: ${state.cpu.usage}%`);
    console.log(`   💾 Memory: ${state.memory.used}GB / ${state.memory.total}GB (${state.memory.usagePercent}%)`);
    console.log(`   💿 Disk: ${state.disk.used}GB / ${state.disk.total}GB (${state.disk.usagePercent}%)`);
    if (state.fans.speed) {
      console.log(`   🌀 Fan: ${state.fans.speed} RPM (${state.fans.status})`);
    }
    if (state.battery.level !== null) {
      console.log(`   🔋 Battery: ${state.battery.level}% (${state.battery.status})`);
    }
    console.log(`   🌐 Network: ${state.network.status}`);
    console.log(`   ⏱️  Uptime: ${state.uptime.human}`);
    console.log('');

    // Test 2: Emotional Feeling
    console.log('💭 Test 2: Getting emotional interpretation...');
    const feelResponse = await fetch(`${baseUrl}/hardware/feel`);
    const feeling = await feelResponse.json();
    
    console.log('✅ How Toobix Feels:');
    console.log(`   😊 Emotion: ${feeling.emotion}`);
    console.log(`   🎚️  Intensity: ${feeling.intensity}/100`);
    console.log(`   📝 Feeling: ${feeling.feeling}`);
    console.log(`   🎨 Metaphor: ${feeling.metaphor}`);
    
    if (feeling.needsAction) {
      console.log(`   ⚠️  Action Needed: ${feeling.suggestedAction}`);
    }
    console.log('');

    // Test 3: Reaction
    console.log('💬 Test 3: Getting reaction to hardware state...');
    const reactResponse = await fetch(`${baseUrl}/hardware/react`, {
      method: 'POST'
    });
    const reaction = await reactResponse.json();
    
    console.log('✅ Toobix\'s Reaction:');
    console.log(`   ${reaction.reaction}`);
    if (reaction.action) {
      console.log(`   Action: ${reaction.action}`);
    }
    console.log('');

    console.log('🎉 All tests passed! Toobix can feel its body!\n');

  } catch (error: any) {
    console.error('❌ Error testing service:', error.message);
  }
}

testService();
