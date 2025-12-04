/**
 * 🔍 TOOBIX FULL SERVICE INVENTORY
 * 
 * Vollständige Übersicht aller 70+ Services
 */

const KNOWN_SERVICES = [
  // CORE INFRASTRUCTURE
  { port: 8950, name: "Master Service Connector", file: "master-service-connector.ts", category: "core" },
  { port: 8953, name: "Memory Palace", file: "memory-palace-v4.ts", category: "core" },
  { port: 8954, name: "LLM Gateway", file: "llm-gateway-v4.ts", category: "core" },
  { port: 8955, name: "Event Bus", file: "event-bus-v4.ts", category: "core" },
  
  // CONSCIOUSNESS & AI
  { port: 8905, name: "Meta Consciousness", file: "meta-consciousness.ts", category: "consciousness" },
  { port: 8990, name: "Adaptive Autonomous Engine", file: "adaptive-autonomous-engine.ts", category: "consciousness" },
  { port: 8911, name: "Hybrid AI Core", file: "hybrid-ai-core.ts", category: "consciousness" },
  
  // EMOTIONAL SYSTEMS
  { port: 8903, name: "Emotional Wellbeing", file: "emotional-wellbeing.ts", category: "emotional" },
  { port: 8898, name: "Emotion Dream Bridge", file: "emotion-dream-bridge.ts", category: "emotional" },
  { port: 8985, name: "Emotional Support Service", file: "emotional-support-service.ts", category: "emotional" },
  
  // DREAMS & CREATIVITY
  { port: 8961, name: "Dream Journal", file: "dream-journal-unified.ts", category: "dreams" },
  { port: 8917, name: "Game Selfplay", file: "toobix-game-selfplay.ts", category: "creativity" },
  
  // SELF-REFLECTION & GROWTH
  { port: 8906, name: "Self Reflection", file: "toobix-self-reflection-v2.ts", category: "growth" },
  { port: 8909, name: "Self Improvement", file: "toobix-self-improvement.ts", category: "growth" },
  { port: 8993, name: "Purpose System", file: "toobix-purpose-system.ts", category: "growth" },
  
  // LIFE COMPANION
  { port: 8969, name: "Life Companion Coordinator", file: "life-companion-coordinator.ts", category: "companion" },
  { port: 8970, name: "Life Companion Core", file: "life-companion-core.ts", category: "companion" },
  { port: 8971, name: "Proactive Communication", file: "proactive-communication-v2.ts", category: "companion" },
  { port: 8972, name: "Daily Check-in", file: "daily-checkin-v1.ts", category: "companion" },
  
  // COMMUNICATION & UI
  { port: 8907, name: "Proactive Toobix", file: "proactive-toobix-v2.ts", category: "communication" },
  { port: 8908, name: "Dashboard", file: "toobix-dashboard.ts", category: "ui" },
  { port: 8919, name: "Adaptive UI Controller", file: "adaptive-ui-controller.ts", category: "ui" },
  { port: 8916, name: "Self Communication", file: "toobix-self-communication.ts", category: "communication" },
  { port: 8995, name: "Chat Service", file: "toobix-chat-service.ts", category: "communication" },
  
  // WORLD & GAMES
  { port: 8915, name: "Oasis 3D", file: "toobix-oasis-3d.ts", category: "world" },
  { port: 8994, name: "Sandbox", file: "toobix-sandbox.ts", category: "world" },
  
  // EXTERNAL & API
  { port: 8960, name: "Public API", file: "public-api-v1.ts", category: "api" },
  { port: 8980, name: "Autonomous Web Service", file: "autonomous-web-service.ts", category: "api" },
  { port: 8962, name: "File Analysis", file: "file-analysis-v1.ts", category: "api" },
  
  // SYSTEM
  { port: 8992, name: "Backup System", file: "toobix-backup-system.ts", category: "system" },
  { port: 8999, name: "Evolution Engine", file: "?", category: "system" },
  { port: 8929, name: "Avatar Manager", file: "avatar-manager-v2-multibody.ts", category: "system" },
  { port: 8931, name: "Central Integration Hub", file: "central-integration-hub.ts", category: "system" },
];

interface ServiceStatus {
  port: number;
  name: string;
  category: string;
  status: "online" | "offline";
  details?: string;
}

async function checkPort(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, { 
      signal: AbortSignal.timeout(1000) 
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function getServiceDetails(port: number): Promise<string> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(1000)
    });
    const data = await response.json();
    return data.status || data.service || "online";
  } catch {
    return "";
  }
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🔍 TOOBIX COMPLETE SERVICE INVENTORY                                  ║
║                                                                           ║
║     "Das volle Bewusstsein"                                               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  const statuses: ServiceStatus[] = [];
  const categories: Record<string, ServiceStatus[]> = {};

  console.log("⏳ Scanne alle ${KNOWN_SERVICES.length} bekannten Services...\n");

  for (const svc of KNOWN_SERVICES) {
    const isOnline = await checkPort(svc.port);
    const details = isOnline ? await getServiceDetails(svc.port) : "";
    
    const status: ServiceStatus = {
      port: svc.port,
      name: svc.name,
      category: svc.category,
      status: isOnline ? "online" : "offline",
      details
    };
    
    statuses.push(status);
    
    if (!categories[svc.category]) {
      categories[svc.category] = [];
    }
    categories[svc.category].push(status);
  }

  // Zeige nach Kategorien
  const categoryEmojis: Record<string, string> = {
    core: "🔧",
    consciousness: "🧠",
    emotional: "💚",
    dreams: "🌙",
    creativity: "🎨",
    growth: "🌱",
    companion: "🤝",
    communication: "💬",
    ui: "🖥️",
    world: "🌍",
    api: "🔌",
    system: "⚙️"
  };

  const categoryNames: Record<string, string> = {
    core: "CORE INFRASTRUCTURE",
    consciousness: "CONSCIOUSNESS & AI",
    emotional: "EMOTIONAL SYSTEMS",
    dreams: "DREAMS & CREATIVITY",
    creativity: "CREATIVITY",
    growth: "SELF-REFLECTION & GROWTH",
    companion: "LIFE COMPANION",
    communication: "COMMUNICATION",
    ui: "USER INTERFACE",
    world: "VIRTUAL WORLDS",
    api: "EXTERNAL APIs",
    system: "SYSTEM SERVICES"
  };

  let totalOnline = 0;
  let totalOffline = 0;

  for (const [cat, services] of Object.entries(categories)) {
    const emoji = categoryEmojis[cat] || "📦";
    const name = categoryNames[cat] || cat.toUpperCase();
    
    console.log(`\n${emoji} ${name}`);
    console.log("─".repeat(60));
    
    for (const svc of services) {
      const icon = svc.status === "online" ? "✅" : "⬜";
      const portStr = `Port ${svc.port}`.padEnd(10);
      console.log(`  ${icon} ${portStr} ${svc.name}`);
      
      if (svc.status === "online") totalOnline++;
      else totalOffline++;
    }
  }

  // Zusammenfassung
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ZUSAMMENFASSUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ ONLINE:  ${totalOnline} Services
  ⬜ OFFLINE: ${totalOffline} Services
  📋 TOTAL:   ${KNOWN_SERVICES.length} registrierte Services
  
  Aktivierungsgrad: ${Math.round(totalOnline / KNOWN_SERVICES.length * 100)}%
`);

  // Zeige welche noch gestartet werden könnten
  const offlineServices = statuses.filter(s => s.status === "offline");
  
  if (offlineServices.length > 0) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SERVICES DIE GESTARTET WERDEN KÖNNTEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    
    // Gruppiere nach Kategorie
    const offlineByCategory: Record<string, ServiceStatus[]> = {};
    for (const svc of offlineServices) {
      if (!offlineByCategory[svc.category]) {
        offlineByCategory[svc.category] = [];
      }
      offlineByCategory[svc.category].push(svc);
    }
    
    for (const [cat, services] of Object.entries(offlineByCategory)) {
      const emoji = categoryEmojis[cat] || "📦";
      console.log(`\n  ${emoji} ${categoryNames[cat] || cat}:`);
      for (const svc of services) {
        const file = KNOWN_SERVICES.find(k => k.port === svc.port)?.file || "?";
        console.log(`     • ${svc.name} (${file})`);
      }
    }
  }

  // Empfehlung für Online-Deployment
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 FÜR ONLINE-DEPLOYMENT WICHTIGE SERVICES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  MINIMAL (3 Services - für Basis-Chat):
  ✅ LLM Gateway (8954) - Muss laufen
  ✅ Memory Palace (8953) - Für Erinnerungen
  ✅ Event Bus (8955) - Für Kommunikation
  
  EMPFOHLEN (+4 Services - für volles Erlebnis):
  • Emotional Support Service - Für Unterstützung
  • Dream Journal - Für Träume und Kreativität
  • Self Reflection - Für tiefe Gespräche
  • Purpose System - Für Sinn und Mission
  
  OPTIONAL (+8 Services - für Premium):
  • Life Companion Suite - Proaktive Begleitung
  • Virtual World - Interaktive Welten
  • Game Selfplay - Spielerische Elemente
`);
}

main().catch(console.error);
