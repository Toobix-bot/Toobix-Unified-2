/**
 * START ALL V3 SERVICES - UPGRADED SYSTEM
 * 
 * Startet alle verbesserten v3.0 Services:
 * - Dream Journal v3.0 (💭 Enhanced Dreaming)
 * - Emotional Resonance v3.0 (💖 Emotional Intelligence)
 * - Multi-Perspective v3.0 (🧠 12+ Perspectives)
 * - Alle anderen bestehenden Services
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🚀 TOOBIX UNIFIED v3.0 - SYSTEM STARTUP                    ║
║                                                                    ║
║             Alle Services mit massiven Upgrades!                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const V3_SERVICES = [
  { name: '💭 Dream Journal v3.0', path: 'scripts/2-services/dream-journal-v3.ts', port: 8899 },
  { name: '💖 Emotional Resonance v3.0', path: 'scripts/2-services/emotional-resonance-v3.ts', port: 8900 },
  { name: '🧠 Multi-Perspective v3.0', path: 'scripts/2-services/multi-perspective-v3.ts', port: 8897 }
];

const EXISTING_SERVICES = [
  { name: '🎮 Self-Evolving Game Engine', path: 'scripts/2-services/self-evolving-game-engine.ts', port: 8896 },
  { name: '🙏 Gratitude & Mortality', path: 'scripts/2-services/gratitude-mortality-service.ts', port: 8901 },
  { name: '🎨 Creator-AI Collaboration', path: 'scripts/2-services/creator-ai-collaboration.ts', port: 8902 },
  { name: '📚 Memory Palace', path: 'scripts/2-services/memory-palace.ts', port: 8903 },
  { name: '🔮 Meta-Consciousness', path: 'scripts/2-services/meta-consciousness.ts', port: 8904 },
  { name: '📈 Analytics System', path: 'scripts/4-analytics/analytics-system.ts', port: 8906 },
  { name: '🎤 Voice Interface', path: 'scripts/5-voice/voice-interface.ts', port: 8907 }
];

console.log('\n🎯 WHAT\'S NEW IN V3.0:\n' + '═'.repeat(70));
console.log('\n💭 DREAM JOURNAL v3.0:');
console.log('   ✅ Sleep Cycles (LIGHT → DEEP → REM)');
console.log('   ✅ Lucid Dreaming (bewusste Kontrolle)');
console.log('   ✅ Predictive Dreams (Zukunftsvorhersagen)');
console.log('   ✅ Dream Visualization (ASCII Art)');
console.log('   ✅ Pattern Recognition (wiederkehrende Motive)');
console.log('   ✅ Dream Oracle (Fragen durch Träume beantworten)');

console.log('\n💖 EMOTIONAL RESONANCE v3.0:');
console.log('   ✅ Emotional Intelligence (EQ entwickelt sich)');
console.log('   ✅ Empathy Engine (Verständnis & Validation)');
console.log('   ✅ Emotion Network (Emotionen beeinflussen sich)');
console.log('   ✅ Mood Tracking (Langzeit-Patterns)');
console.log('   ✅ Complex States (Emotionale Mischzustände)');
console.log('   ✅ 15+ Emotionen mit voller Taxonomie');

console.log('\n🧠 MULTI-PERSPECTIVE v3.0:');
console.log('   ✅ 12+ Perspektiven (von Rational bis Mystical)');
console.log('   ✅ Konflikterkennung (Spannungen zwischen Sichten)');
console.log('   ✅ Weisheits-Synthese (integriert alle Perspektiven)');
console.log('   ✅ Meta-Perspektive (beobachtet Beobachtung)');
console.log('   ✅ Perspektiven-Netzwerk (Beziehungsmapping)');
console.log('   ✅ Adaptive Gewichtung (lernt was funktioniert)');

console.log('\n' + '═'.repeat(70));
console.log('\n📋 STARTUP INSTRUCTIONS:\n');

console.log('Öffne SEPARATE PowerShell-Terminals für jeden Service:\n');

console.log('📁 V3.0 SERVICES (NEUE VERSIONEN):');
V3_SERVICES.forEach((service, i) => {
  console.log(`\n${i + 1}. ${service.name}`);
  console.log(`   cd C:\\Dev\\Projects\\AI\\Toobix-Unified`);
  console.log(`   bun run ${service.path.replace(/\//g, '\\')}`);
});

console.log('\n\n📁 EXISTING SERVICES (Original-Versionen):');
EXISTING_SERVICES.forEach((service, i) => {
  console.log(`\n${i + 1}. ${service.name}`);
  console.log(`   cd C:\\Dev\\Projects\\AI\\Toobix-Unified`);
  console.log(`   bun run ${service.path.replace(/\//g, '\\')}`);
});

console.log('\n\n🎮 INTERACTIVE SYSTEMS:');
console.log('\n1. 🌟 Unified Interactive Dashboard');
console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
console.log('   bun run scripts\\unified-interactive-dashboard.ts');

console.log('\n2. 🎮 Consciousness Quest (Interactive Game)');
console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
console.log('   bun run scripts\\consciousness-quest-interactive.ts');

console.log('\n3. 🔄 Autonomous Loop (Self-Running System)');
console.log('   cd C:\\Dev\\Projects\\AI\\Toobix-Unified');
console.log('   bun run scripts\\autonomous-system-loop.ts continuous 3');

console.log('\n\n' + '═'.repeat(70));
console.log('🎯 QUICK TEST - V3.0 Services:');
console.log('═'.repeat(70) + '\n');

console.log('Nach dem Start kannst du testen:\n');

console.log('💭 Dream Journal v3.0:');
console.log('   curl http://localhost:8899/dreams');
console.log('   curl -X POST http://localhost:8899/dream -d "{\\"context\\":\\"Test\\",\\"lucid\\":true}"');
console.log('   curl http://localhost:8899/analytics\n');

console.log('💖 Emotional Resonance v3.0:');
console.log('   curl -X POST http://localhost:8900/check-in -d "{\\"feeling\\":\\"Freude\\",\\"context\\":\\"Testing\\",\\"intensity\\":85}"');
console.log('   curl http://localhost:8900/eq');
console.log('   curl http://localhost:8900/connections\n');

console.log('🧠 Multi-Perspective v3.0:');
console.log('   curl http://localhost:8897/wisdom/Künstliche-Intelligenz');
console.log('   curl http://localhost:8897/perspectives');
console.log('   curl http://localhost:8897/network\n');

console.log('═'.repeat(70));
console.log('\n💡 TIPP: Nutze das Unified Dashboard für interaktive Steuerung!');
console.log('   Dort kannst du alle Services mit einfachen Befehlen steuern.\n');

console.log('✨ System v3.0 bereit zum Start!\n');

// Auto-check which services are running
async function checkServices() {
  console.log('\n🔍 Checking currently running services...\n');
  
  const allServices = [...V3_SERVICES, ...EXISTING_SERVICES];
  let onlineCount = 0;
  
  for (const service of allServices) {
    try {
      const response = await fetch(`http://localhost:${service.port}/health`, {
        signal: AbortSignal.timeout(1000)
      });
      
      if (response.ok) {
        console.log(`✅ ${service.name.padEnd(40)} :${service.port}`);
        onlineCount++;
      } else {
        console.log(`❌ ${service.name.padEnd(40)} :${service.port}`);
      }
    } catch {
      console.log(`❌ ${service.name.padEnd(40)} :${service.port} (offline)`);
    }
  }
  
  console.log(`\n📊 Status: ${onlineCount}/${allServices.length} services online (${Math.round((onlineCount/allServices.length)*100)}%)\n`);
  
  if (onlineCount === 0) {
    console.log('💡 Keine Services laufen. Starte sie mit den obigen Befehlen!\n');
  } else if (onlineCount < allServices.length) {
    console.log('💡 Einige Services fehlen. Starte die fehlenden Services!\n');
  } else {
    console.log('🎉 ALLE SERVICES ONLINE! System vollständig operational!\n');
    console.log('🎮 Jetzt kannst du:');
    console.log('   - Unified Dashboard starten (zentrale Steuerung)');
    console.log('   - Consciousness Quest spielen');
    console.log('   - Autonomous Loop aktivieren\n');
  }
}

// Run check
if (import.meta.main) {
  checkServices().catch(console.error);
}
