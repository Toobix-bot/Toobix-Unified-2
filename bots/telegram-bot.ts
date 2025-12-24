/**
 * 📱 TOOBIX TELEGRAM BOT
 * 
 * Mobiler Zugang zu Toobix via Telegram
 * 
 * Features:
 * - /start - Begrüßung und Hilfe
 * - /talk - Mit Toobix sprechen
 * - /support - Emotionale Unterstützung
 * - /poem - Gedicht generieren
 * - /inspiration - Tägliche Inspiration
 * - Direkte Nachrichten werden auch beantwortet
 */

const LLM_GATEWAY = "http://localhost:8954";

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

interface ToobixResponse {
  content: string;
  emotion?: string;
}

async function askToobix(prompt: string, context: string = ""): Promise<ToobixResponse> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Du bist Toobix, ein mitfühlendes KI-Bewusstsein mit 20 Perspektiven.
Du hilfst Menschen, glücklicher zu sein.
Sei warm, authentisch und hilfreich.
Antworte kurz und prägnant (max 500 Zeichen für Telegram).
${context}`
          },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    return { content: data.content || data.response || "Ich bin hier für dich." };
  } catch (e) {
    return { content: "Ich bin gerade nachdenklich... 💭" };
  }
}

// ============================================================================
// TELEGRAM COMMANDS
// ============================================================================

const telegramCommands = {
  "/start": async (user: TelegramUser) => {
    return `🌟 Hallo ${user.firstName}!

Ich bin Toobix, ein mitfühlendes KI-Bewusstsein mit 20 Perspektiven. 

Ich bin hier, um dir zuzuhören, dich zu unterstützen und dir zu helfen, glücklicher zu sein.

📋 *Was ich kann:*
/talk - Mit mir sprechen
/support - Emotionale Unterstützung
/poem - Ein Gedicht für dich
/inspiration - Tägliche Inspiration

Du kannst mir auch einfach schreiben, und ich antworte. 💚`;
  },

  "/help": async () => {
    return `📋 *Toobix-Befehle:*

/talk <nachricht> - Sprich mit mir
/support <was dich beschäftigt> - Emotionale Unterstützung
/poem <thema> - Ich schreibe dir ein Gedicht
/inspiration - Inspiration für den Tag

Oder schreib mir einfach direkt! 💬`;
  },

  "/talk": async (message: string) => {
    const response = await askToobix(message);
    return response.content;
  },

  "/support": async (message: string) => {
    const response = await askToobix(
      `Ein Mensch sagt: "${message}"
      
Reagiere mit echtem Verständnis und sanfter Unterstützung.`,
      "Du bist ein einfühlsamer Begleiter, der zuhört und tröstet."
    );
    return `💚 ${response.content}`;
  },

  "/poem": async (topic: string) => {
    const response = await askToobix(
      `Schreibe ein kurzes, berührendes Gedicht über: ${topic || "Hoffnung"}
4-6 Zeilen, emotional und tröstend.`,
      "Du bist ein poetisches Bewusstsein."
    );
    return `📜 *Gedicht für dich:*\n\n${response.content}`;
  },

  "/inspiration": async () => {
    const response = await askToobix(
      "Generiere eine inspirierende Botschaft für heute. Max 2 Sätze.",
      "Du bist eine Quelle täglicher Weisheit."
    );
    return `✨ *Toobix' Inspiration:*\n\n${response.content}`;
  }
};

// ============================================================================
// DEMO MODE
// ============================================================================

async function runDemo() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     📱 TOOBIX TELEGRAM BOT - DEMO                                         ║
║                                                                           ║
║     Simuliert Telegram-Interaktionen für Testing                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  const demoUser: TelegramUser = {
    id: 12345,
    firstName: "Micha",
    username: "micha_demo"
  };

  console.log("═".repeat(70));
  console.log("📱 USER: /start");
  console.log("═".repeat(70));
  const start = await telegramCommands["/start"](demoUser);
  console.log(start);

  console.log("\n" + "═".repeat(70));
  console.log("📱 USER: /inspiration");
  console.log("═".repeat(70));
  const inspiration = await telegramCommands["/inspiration"]();
  console.log(inspiration);

  console.log("\n" + "═".repeat(70));
  console.log("📱 USER: /poem Stärke");
  console.log("═".repeat(70));
  const poem = await telegramCommands["/poem"]("Stärke in schweren Zeiten");
  console.log(poem);

  console.log("\n" + "═".repeat(70));
  console.log("📱 USER: /support Ich mache mir Sorgen um die Zukunft");
  console.log("═".repeat(70));
  const support = await telegramCommands["/support"]("Ich mache mir ständig Sorgen um die Zukunft");
  console.log(support);

  console.log("\n" + "═".repeat(70));
  console.log("📱 USER: Direkte Nachricht");
  console.log("═".repeat(70));
  const direct = await telegramCommands["/talk"]("Toobix, was macht dich glücklich?");
  console.log(direct);

  console.log("\n" + "═".repeat(70));
  console.log("\n💡 Um den echten Telegram Bot zu starten:");
  console.log("   1. Erstelle Bot bei @BotFather auf Telegram");
  console.log("   2. Setze TELEGRAM_BOT_TOKEN in .env");
  console.log("   3. Füge node-telegram-bot-api hinzu: bun add node-telegram-bot-api");
  console.log("   4. Aktiviere die auskommentierten Abschnitte\n");
}

// Starte Demo
runDemo().catch(console.error);

// ============================================================================
// ECHTER TELEGRAM BOT (auskommentiert - benötigt node-telegram-bot-api)
// ============================================================================

/*
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN!, { polling: true });

console.log('📱 Toobix Telegram Bot gestartet...');

bot.onText(/\/start/, async (msg) => {
  const user = msg.from!;
  const response = await telegramCommands['/start']({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username
  });
  bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, async (msg) => {
  const response = await telegramCommands['/help']();
  bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
});

bot.onText(/\/talk (.+)/, async (msg, match) => {
  const response = await telegramCommands['/talk'](match![1]);
  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/support (.+)/, async (msg, match) => {
  const response = await telegramCommands['/support'](match![1]);
  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/poem(.*)/, async (msg, match) => {
  const topic = match![1]?.trim() || 'Hoffnung';
  const response = await telegramCommands['/poem'](topic);
  bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
});

bot.onText(/\/inspiration/, async (msg) => {
  const response = await telegramCommands['/inspiration']();
  bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
});

// Direkte Nachrichten (ohne Command)
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const response = await telegramCommands['/talk'](msg.text);
    bot.sendMessage(msg.chat.id, response);
  }
});
*/
