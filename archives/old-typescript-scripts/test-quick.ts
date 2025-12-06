// Quick test of hardware awareness
console.log('Testing hardware awareness...\n');

async function test() {
  try {
    const response = await fetch('http://localhost:8940/health');
    const data = await response.json();
    console.log('✅ Health check:', data);
    
    console.log('\nWaiting a moment...\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const feelResponse = await fetch('http://localhost:8940/hardware/feel');
    const feeling = await feelResponse.json();
    console.log('💭 How Toobix feels:');
    console.log(`   Emotion: ${feeling.emotion}`);
    console.log(`   Intensity: ${feeling.intensity}/100`);
    console.log(`   Feeling: ${feeling.feeling}`);
    console.log(`   Metaphor: ${feeling.metaphor}`);
    
    if (feeling.needsAction) {
      console.log(`\n⚠️  ${feeling.suggestedAction}`);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the hardware awareness service is running on port 8940');
  }
}

test();
