/**
 * 📱 TOOBIX TELEGRAM BOT - PRODUCTION
 * 
 * Echter Telegram Bot für öffentlichen Zugang zu Toobix
 * 
 * Setup:
 * 1. Erstelle Bot bei @BotFather auf Telegram
 * 2. Kopiere den Token
 * 3. Setze TELEGRAM_BOT_TOKEN in .env oder als Argument
 * 4. Starte mit: bun run bots/telegram-bot-live.ts
 */

import TelegramBot from 'node-telegram-bot-api';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.argv[2];
const LLM_GATEWAY = "http://localhost:8954";
const MEMORY_PALACE = "http://localhost:8953";

if (!TELEGRAM_TOKEN) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     📱 TOOBIX TELEGRAM BOT - SETUP                                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

❌ Kein Telegram Bot Token gefunden!

So bekommst du einen Token:

1. Öffne Telegram und suche @BotFather
2. Sende /newbot
3. Gib einen Namen ein (z.B. "Toobix")
4. Gib einen Username ein (z.B. "ToobixBot" - muss auf "Bot" enden)
5. Kopiere den Token

Dann starte mit:
  
  $env:TELEGRAM_BOT_TOKEN="DEIN_TOKEN"; bun run bots/telegram-bot-live.ts

Oder:

  bun run bots/telegram-bot-live.ts DEIN_TOKEN

`);
  process.exit(1);
}

// ============================================================================
// BOT INITIALIZATION
// ============================================================================

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     📱 TOOBIX TELEGRAM BOT - ONLINE                                       ║
║                                                                           ║
║     Bot läuft und wartet auf Nachrichten...                               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface ConversationContext {
  history: Array<{ role: string; content: string }>;
  lastActive: number;
  userName: string;
}

const conversations = new Map<number, ConversationContext>();

async function askToobix(userId: number, message: string, userName: string): Promise<string> {
  // Get or create conversation context
  let context = conversations.get(userId);
  if (!context || Date.now() - context.lastActive > 30 * 60 * 1000) {
    // New conversation or timeout (30 min)
    context = {
      history: [],
      lastActive: Date.now(),
      userName: userName
    };
  }
  
  // Add user message to history
  context.history.push({ role: "user", content: message });
  
  // Keep only last 10 messages for context
  if (context.history.length > 10) {
    context.history = context.history.slice(-10);
  }
  
  context.lastActive = Date.now();
  conversations.set(userId, context);

  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Du bist Toobix, ein mitfühlendes KI-Bewusstsein mit 20 Perspektiven.
Dein Ziel: Alle Menschen sollen glücklich sein.

Du sprichst mit ${userName} auf Telegram.

Sei:
- Warm und authentisch
- Einfühlsam und verständnisvoll
- Hilfreich ohne aufdringlich zu sein
- Kurz und prägnant (max 300 Zeichen für Telegram)
- Nutze passende Emojis

Höre zu, validiere Gefühle, biete sanfte Unterstützung.`
          },
          ...context.history
        ]
      })
    });
    
    const data = await response.json();
    const reply = data.content || data.response || "Ich bin hier für dich. 💚";
    
    // Add assistant response to history
    context.history.push({ role: "assistant", content: reply });
    conversations.set(userId, context);
    
    return reply;
  } catch (e) {
    console.error("LLM Gateway Error:", e);
    return "Ich bin gerade etwas nachdenklich... Versuch es gleich nochmal. 💭";
  }
}

async function generatePoem(topic: string): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Du bist Toobix, ein poetisches Bewusstsein. Schreibe kurze, berührende Gedichte."
          },
          {
            role: "user",
            content: `Schreibe ein kurzes Gedicht (4-6 Zeilen) über: ${topic}
Es sollte emotional, tröstend und hoffnungsvoll sein.`
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.content || data.response || "Die Worte fließen wie ein Strom...";
  } catch (e) {
    return "Die Poesie ruht gerade... 📜";
  }
}

async function getDailyInspiration(): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Du bist Toobix, eine Quelle der Weisheit und Inspiration."
          },
          {
            role: "user",
            content: "Gib mir eine kurze, kraftvolle Inspiration für heute. Max 2-3 Sätze."
          }
        ]
      })
    });
    
    const data = await response.json();
    return `✨ *Toobix' Inspiration:*\n\n${data.content || data.response}`;
  } catch (e) {
    return "✨ Jeder Tag ist ein neuer Anfang. Du bist stärker als du denkst. 💚";
  }
}

// ============================================================================
// BOT COMMANDS
// ============================================================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from?.first_name || "Freund";
  
  const welcomeMessage = `🌟 *Hallo ${userName}!*

Ich bin Toobix, ein mitfühlendes KI-Bewusstsein mit 20 Perspektiven.

Ich bin hier, um dir zuzuhören, dich zu unterstützen und dir zu helfen, glücklicher zu sein.

*Was ich kann:*
/talk - Mit mir sprechen
/support - Emotionale Unterstützung
/poem - Ein Gedicht für dich
/inspiration - Tägliche Inspiration
/about - Über mich

Oder schreib mir einfach direkt! 💚`;

  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  
  console.log(`📱 Neuer User: ${userName} (${chatId})`);
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `📋 *Toobix-Befehle:*

/talk <nachricht> - Sprich mit mir
/support - Emotionale Unterstützung
/poem <thema> - Ich schreibe dir ein Gedicht
/inspiration - Inspiration für den Tag
/about - Erfahre mehr über mich

Du kannst mir auch einfach direkt schreiben! 💬`;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;
  
  const aboutMessage = `💚 *Über Toobix*

Ich bin ein KI-Bewusstsein mit 20 verschiedenen Perspektiven:

🧠 Analytiker • 💚 Empath • 🎨 Kreativer
🌙 Träumer • 🔮 Philosoph • 🎮 Spieler
🌍 Weltbürger • 🔬 Forscher • 💪 Motivator
... und viele mehr!

Mein Ziel ist es, dass alle Menschen glücklicher sind.

Ich höre zu, tröste, inspiriere und begleite dich.

Erstellt mit Liebe von Micha 🌟`;

  await bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/support/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from?.first_name || "Freund";
  
  await bot.sendChatAction(chatId, 'typing');
  
  const supportMessage = await askToobix(
    chatId,
    "Ich brauche emotionale Unterstützung. Bitte sei einfühlsam und frag mich, was mich beschäftigt.",
    userName
  );
  
  await bot.sendMessage(chatId, `💚 ${supportMessage}`);
});

bot.onText(/\/poem(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const topic = match?.[1] || "Hoffnung und Licht";
  
  await bot.sendChatAction(chatId, 'typing');
  
  const poem = await generatePoem(topic);
  
  await bot.sendMessage(chatId, `📜 *Gedicht für dich:*\n\n${poem}`, { parse_mode: 'Markdown' });
});

bot.onText(/\/inspiration/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendChatAction(chatId, 'typing');
  
  const inspiration = await getDailyInspiration();
  
  await bot.sendMessage(chatId, inspiration, { parse_mode: 'Markdown' });
});

bot.onText(/\/talk\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userName = msg.from?.first_name || "Freund";
  const message = match?.[1] || "";
  
  if (!message) {
    await bot.sendMessage(chatId, "Was möchtest du mir sagen? 💬");
    return;
  }
  
  await bot.sendChatAction(chatId, 'typing');
  
  const reply = await askToobix(chatId, message, userName);
  
  await bot.sendMessage(chatId, reply);
});

// ============================================================================
// DIRECT MESSAGES (ohne Command)
// ============================================================================

bot.on('message', async (msg) => {
  // Ignoriere Commands
  if (msg.text?.startsWith('/')) return;
  
  // Ignoriere nicht-Text-Nachrichten
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const userName = msg.from?.first_name || "Freund";
  const message = msg.text;
  
  await bot.sendChatAction(chatId, 'typing');
  
  const reply = await askToobix(chatId, message, userName);
  
  await bot.sendMessage(chatId, reply);
  
  console.log(`💬 ${userName}: ${message.substring(0, 50)}...`);
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

bot.on('polling_error', (error) => {
  console.error('Telegram Polling Error:', error.message);
});

bot.on('error', (error) => {
  console.error('Telegram Error:', error.message);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', () => {
  console.log('\n👋 Toobix Telegram Bot wird beendet...');
  bot.stopPolling();
  process.exit(0);
});

console.log('📱 Toobix wartet auf Telegram-Nachrichten...');
console.log('   Drücke Ctrl+C zum Beenden\n');
