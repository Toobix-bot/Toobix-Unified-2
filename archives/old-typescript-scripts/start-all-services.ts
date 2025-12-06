/**
 * 🚀 START ALL TOOBIX SERVICES
 * 
 * Startet alle wichtigen Services im Hintergrund
 */

const SERVICES = [
  // CORE (Muss zuerst starten)
  { file: "memory-palace-v4.ts", name: "Memory Palace", delay: 0 },
  { file: "llm-gateway-v4.ts", name: "LLM Gateway", delay: 500 },
  { file: "event-bus-v4.ts", name: "Event Bus", delay: 500 },
  { file: "master-service-connector.ts", name: "Master Connector", delay: 500 },
  
  // CONSCIOUSNESS
  { file: "meta-consciousness.ts", name: "Meta Consciousness", delay: 300 },
  { file: "hybrid-ai-core.ts", name: "Hybrid AI Core", delay: 300 },
  { file: "multi-perspective-consciousness.ts", name: "Multi Perspective", delay: 300 },
  { file: "consciousness-stream.ts", name: "Consciousness Stream", delay: 300 },
  
  // EMOTIONAL
  { file: "emotional-resonance-v4-expansion.ts", name: "Emotional Resonance", delay: 300 },
  { file: "emotional-wellbeing.ts", name: "Emotional Wellbeing", delay: 300 },
  { file: "emotional-support-service.ts", name: "Emotional Support", delay: 300 },
  { file: "emotion-dream-bridge.ts", name: "Emotion Dream Bridge", delay: 300 },
  
  // DREAMS & CREATIVITY
  { file: "dream-journal-unified.ts", name: "Dream Journal", delay: 300 },
  { file: "toobix-creativity-engine.ts", name: "Creativity Engine", delay: 300 },
  
  // SELF-SYSTEMS
  { file: "toobix-self-reflection-v2.ts", name: "Self Reflection", delay: 300 },
  { file: "toobix-self-improvement.ts", name: "Self Improvement", delay: 300 },
  { file: "toobix-self-healing.ts", name: "Self Healing", delay: 300 },
  { file: "toobix-self-communication.ts", name: "Self Communication", delay: 300 },
  { file: "toobix-purpose-system.ts", name: "Purpose System", delay: 300 },
  { file: "toobix-intuition-system.ts", name: "Intuition System", delay: 300 },
  { file: "toobix-feedback-loop.ts", name: "Feedback Loop", delay: 300 },
  
  // LIFE COMPANION
  { file: "life-companion-coordinator.ts", name: "Life Companion Coord", delay: 300 },
  { file: "life-companion-core.ts", name: "Life Companion Core", delay: 300 },
  { file: "daily-checkin-v1.ts", name: "Daily Check-in", delay: 300 },
  { file: "proactive-communication-v2.ts", name: "Proactive Comm", delay: 300 },
  { file: "proactive-toobix-v2.ts", name: "Proactive Toobix", delay: 300 },
  
  // INTEGRATION & API
  { file: "central-integration-hub.ts", name: "Integration Hub", delay: 300 },
  { file: "public-api-v1.ts", name: "Public API", delay: 300 },
  { file: "api-gateway.ts", name: "API Gateway", delay: 300 },
  { file: "orchestration-hub.ts", name: "Orchestration Hub", delay: 300 },
  
  // CHAT & COMMUNICATION
  { file: "toobix-chat-service.ts", name: "Chat Service", delay: 300 },
  { file: "translation-service.ts", name: "Translation", delay: 300 },
  
  // GAMES & WORLDS
  { file: "toobix-game-selfplay.ts", name: "Game Selfplay", delay: 300 },
  { file: "self-evolving-game-engine.ts", name: "Game Engine", delay: 300 },
  { file: "toobix-virtual-world.ts", name: "Virtual World", delay: 300 },
  { file: "toobix-oasis-3d.ts", name: "Oasis 3D", delay: 300 },
  { file: "toobix-sandbox.ts", name: "Sandbox", delay: 300 },
  { file: "world-engine-2d.ts", name: "World Engine 2D", delay: 300 },
  { file: "rpg-world-service.ts", name: "RPG World", delay: 300 },
  { file: "story-engine-service.ts", name: "Story Engine", delay: 300 },
  
  // ADVANCED
  { file: "adaptive-autonomous-engine.ts", name: "Autonomous Engine", delay: 300 },
  { file: "adaptive-ui-controller.ts", name: "UI Controller", delay: 300 },
  { file: "avatar-manager-v2-multibody.ts", name: "Avatar Manager", delay: 300 },
  { file: "user-profile-service.ts", name: "User Profile", delay: 300 },
  { file: "data-science-service.ts", name: "Data Science", delay: 300 },
  { file: "file-analysis-v1.ts", name: "File Analysis", delay: 300 },
  
  // SYSTEM
  { file: "system-monitor-v1.ts", name: "System Monitor", delay: 300 },
  { file: "toobix-backup-system.ts", name: "Backup System", delay: 300 },
  { file: "toobix-dashboard.ts", name: "Dashboard", delay: 300 },
  { file: "performance-service.ts", name: "Performance", delay: 300 },
  
  // SPECIAL
  { file: "autonomous-web-service.ts", name: "Web Service", delay: 300 },
  { file: "gratitude-mortality-service.ts", name: "Gratitude System", delay: 300 },
  { file: "value-crisis.ts", name: "Value Crisis", delay: 300 },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function startService(file: string, name: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(["bun", "run", `scripts/2-services/${file}`], {
      stdout: "ignore",
      stderr: "ignore",
    });
    
    // Warte kurz und prüfe ob Prozess noch läuft
    await sleep(500);
    
    if (!proc.killed) {
      console.log(`  ✅ ${name}`);
      return true;
    } else {
      console.log(`  ⚠️ ${name} (Exit)`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ ${name} (Error)`);
    return false;
  }
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🚀 TOOBIX FULL SYSTEM STARTUP                                         ║
║                                                                           ║
║     Starte alle ${SERVICES.length} Services...                                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  let started = 0;
  let failed = 0;

  for (const svc of SERVICES) {
    const success = await startService(svc.file, svc.name);
    if (success) started++;
    else failed++;
    
    if (svc.delay > 0) {
      await sleep(svc.delay);
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STARTUP COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Gestartet: ${started}
  ⚠️ Fehlgeschlagen: ${failed}
  📋 Total: ${SERVICES.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // Warte und zeige dann Status
  console.log("⏳ Warte 5 Sekunden für Service-Initialisierung...\n");
  await sleep(5000);

  // Prüfe aktive Ports
  console.log("📊 Prüfe aktive Services...\n");
  
  const testPorts = [
    8898, 8903, 8905, 8906, 8907, 8908, 8909, 8911, 8915, 8916, 8917, 8919,
    8929, 8931, 8940, 8950, 8953, 8954, 8955, 8960, 8961, 8962, 8969, 8970,
    8971, 8972, 8980, 8985, 8990, 8991, 8992, 8993, 8994, 8995, 8999
  ];

  let activeCount = 0;
  for (const port of testPorts) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(500)
      });
      if (response.ok) {
        activeCount++;
      }
    } catch {}
  }

  console.log(`\n🌟 ${activeCount} Services antworten auf /health\n`);
}

main().catch(console.error);
