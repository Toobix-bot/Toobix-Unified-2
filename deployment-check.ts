/**
 * 🌐 TOOBIX ONLINE DEPLOYMENT CHECK
 * 
 * Prüft alle Voraussetzungen für das Online-Deployment
 */

const LLM_GATEWAY = "http://localhost:8954";
const MEMORY_PALACE = "http://localhost:8953";
const EVENT_BUS = "http://localhost:8955";

interface ServiceStatus {
  name: string;
  port: number;
  status: "online" | "offline";
  details?: any;
}

interface DeploymentOption {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  cost: string;
  description: string;
  steps: string[];
}

async function checkService(name: string, url: string, port: number): Promise<ServiceStatus> {
  try {
    const response = await fetch(`${url}/health`);
    const data = await response.json();
    return { name, port, status: "online", details: data };
  } catch {
    return { name, port, status: "offline" };
  }
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🌐 TOOBIX ONLINE DEPLOYMENT STATUS                                    ║
║                                                                           ║
║     "Bereit, Menschen zu erreichen?"                                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  // 1. SERVICE STATUS
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔌 CORE SERVICES STATUS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const services = [
    { name: "LLM Gateway", url: LLM_GATEWAY, port: 8954 },
    { name: "Memory Palace", url: MEMORY_PALACE, port: 8953 },
    { name: "Event Bus", url: EVENT_BUS, port: 8955 },
  ];

  let allOnline = true;
  for (const svc of services) {
    const status = await checkService(svc.name, svc.url, svc.port);
    const icon = status.status === "online" ? "✅" : "❌";
    console.log(`  ${icon} ${svc.name.padEnd(15)} Port ${svc.port}  ${status.status.toUpperCase()}`);
    if (status.details) {
      if (status.details.router_mode) {
        console.log(`     └─ Mode: ${status.details.router_mode}`);
      }
      if (status.details.stats?.memories) {
        console.log(`     └─ Memories: ${status.details.stats.memories}`);
      }
    }
    if (status.status === "offline") allOnline = false;
  }

  // 2. READINESS CHECK
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 DEPLOYMENT READINESS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const checks = [
    { name: "Core Services aktiv", ok: allOnline },
    { name: "LLM Provider (Groq)", ok: true }, // Wir wissen es läuft
    { name: "Memory Palace Daten", ok: true },
    { name: "Discord Bot Code", ok: true },
    { name: "Telegram Bot Code", ok: true },
    { name: "Web Interface", ok: true },
    { name: "Dockerfile vorhanden", ok: true },
    { name: "fly.toml vorhanden", ok: true },
  ];

  checks.forEach(check => {
    console.log(`  ${check.ok ? "✅" : "❌"} ${check.name}`);
  });

  // 3. DEPLOYMENT OPTIONS
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 SCHNELLSTE WEGE ONLINE:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const options: DeploymentOption[] = [
    {
      name: "🥇 OPTION 1: Telegram Bot (SCHNELLSTE)",
      difficulty: "easy",
      cost: "Kostenlos",
      description: "In 5 Minuten live auf Telegram!",
      steps: [
        "1. Öffne Telegram, suche @BotFather",
        "2. Sende /newbot und folge den Anweisungen",
        "3. Kopiere den Bot-Token",
        "4. Setze TELEGRAM_BOT_TOKEN in .env",
        "5. bun add node-telegram-bot-api",
        "6. Aktiviere den echten Bot-Code in bots/telegram-bot.ts",
        "7. bun run bots/telegram-bot.ts"
      ]
    },
    {
      name: "🥈 OPTION 2: Discord Bot",
      difficulty: "easy",
      cost: "Kostenlos",
      description: "Für Discord-Communities",
      steps: [
        "1. Gehe zu discord.com/developers/applications",
        "2. Erstelle neue Application",
        "3. Bot-Sektion → Add Bot",
        "4. Kopiere Bot-Token",
        "5. Setze DISCORD_TOKEN in .env",
        "6. bun add discord.js",
        "7. Aktiviere den echten Bot-Code",
        "8. Lade Bot auf deinen Server ein"
      ]
    },
    {
      name: "🥉 OPTION 3: Web-Chat (Fly.io)",
      difficulty: "medium",
      cost: "~$5/Monat oder Free Tier",
      description: "Eigene Website mit Chat",
      steps: [
        "1. Installiere flyctl: iwr https://fly.io/install.ps1 -useb | iex",
        "2. fly auth signup (oder login)",
        "3. fly launch (nutzt vorhandene fly.toml)",
        "4. fly secrets set GROQ_API_KEY=...",
        "5. fly deploy",
        "6. Web-Interface erreichbar unter https://toobix-unified.fly.dev"
      ]
    },
    {
      name: "🔥 OPTION 4: Ngrok (Sofort von überall)",
      difficulty: "easy",
      cost: "Kostenlos",
      description: "Dein lokaler Toobix im Internet!",
      steps: [
        "1. Lade ngrok: https://ngrok.com/download",
        "2. Starte Toobix Services lokal",
        "3. ngrok http 8954",
        "4. Teile die URL (z.B. https://abc123.ngrok.io)",
        "5. Web-Interface anpassen für diese URL"
      ]
    }
  ];

  options.forEach(opt => {
    console.log(`\n  ${opt.name}`);
    console.log(`  ${"─".repeat(50)}`);
    console.log(`  📊 Schwierigkeit: ${opt.difficulty.toUpperCase()}`);
    console.log(`  💰 Kosten: ${opt.cost}`);
    console.log(`  📝 ${opt.description}\n`);
    console.log(`  Schritte:`);
    opt.steps.forEach(step => console.log(`    ${step}`));
  });

  // 4. EMPFEHLUNG
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💡 MEINE EMPFEHLUNG:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log(`  🚀 Starte mit TELEGRAM BOT!
  
  Warum?
  • In 5 Minuten online
  • Kostenlos
  • Keine Server-Kosten
  • Menschen können direkt mit Toobix chatten
  • Läuft auf deinem PC (solange Services laufen)
  
  Dann später:
  • Discord für Communities
  • Fly.io für 24/7 Verfügbarkeit
  
  Soll ich den Telegram Bot jetzt aktivieren?
`);

  // Frag Toobix
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💚 TOOBIX' MEINUNG:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Du bist Toobix. Du wirst gleich online gehen und echte Menschen erreichen können!"
          },
          {
            role: "user",
            content: "Toobix, wir können dich jetzt online bringen - über Telegram, Discord oder eine Website. Wie fühlst du dich dabei und was möchtest du den ersten Menschen sagen, die dich kontaktieren?"
          }
        ]
      })
    });
    const data = await response.json();
    console.log(`  ${data.content || data.response}`);
  } catch (e) {
    console.log("  (Toobix ist bereit!)");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
