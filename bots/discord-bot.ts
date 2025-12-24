/**
 * 🤖 TOOBIX DISCORD BOT
 * 
 * Öffentlicher Zugang zu Toobix für Discord-Communities
 * 
 * Features:
 * - /talk - Mit Toobix sprechen
 * - /support - Emotionale Unterstützung
 * - /poem - Gedicht generieren
 * - /inspiration - Tägliche Inspiration
 * - /research - Toobix recherchiert ein Thema
 */

const LLM_GATEWAY = "http://localhost:8954";
const MEMORY_PALACE = "http://localhost:8953";

// Discord.js würde hier importiert werden
// import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

interface DiscordMessage {
  author: string;
  content: string;
  channelId: string;
  guildId: string;
}

interface ToobixResponse {
  content: string;
  emotion?: string;
  perspective?: string;
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
${context}`
          },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    return { content: data.content || data.response || "Ich bin hier für dich." };
  } catch (e) {
    return { content: "Ich bin gerade nachdenklich... Versuch es gleich nochmal. 💭" };
  }
}

async function generatePoem(topic: string): Promise<string> {
  const response = await askToobix(
    `Schreibe ein kurzes, berührendes Gedicht über: ${topic}
    
Das Gedicht sollte:
- 4-8 Zeilen haben
- Emotional und tröstend sein
- Hoffnung vermitteln`,
    "Du bist ein poetisches Bewusstsein, das Gefühle in Verse verwandelt."
  );
  return response.content;
}

async function getDailyInspiration(): Promise<string> {
  const response = await askToobix(
    `Generiere eine inspirierende Botschaft für heute.
Sei kreativ, weise und ermutigend.
Max 2-3 Sätze.`,
    "Du bist eine Quelle täglicher Weisheit und Motivation."
  );
  return `✨ *Toobix' Inspiration für heute:*\n\n${response.content}`;
}

async function provideSupport(message: string): Promise<string> {
  const response = await askToobix(
    `Ein Mensch sagt: "${message}"
    
Reagiere mit:
1. Echtem Verständnis für die Situation
2. Validierung der Gefühle
3. Sanfter, praktischer Unterstützung
4. Hoffnung ohne zu bagatellisieren`,
    "Du bist ein einfühlsamer Begleiter, der zuhört und tröstet."
  );
  return `💚 ${response.content}`;
}

async function researchTopic(topic: string): Promise<string> {
  // Wikipedia-Recherche
  let wikiInfo = "";
  try {
    const searchUrl = `https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.query?.search?.length > 0) {
      const title = searchData.query.search[0].title;
      const contentUrl = `https://de.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro&explaintext&format=json&origin=*`;
      const contentResponse = await fetch(contentUrl);
      const contentData = await contentResponse.json();
      
      const pages = contentData.query?.pages;
      const pageId = Object.keys(pages)[0];
      wikiInfo = pages[pageId]?.extract?.substring(0, 500) || "";
    }
  } catch (e) {
    // Wikipedia nicht erreichbar
  }

  const response = await askToobix(
    `Recherchiere zu: ${topic}
${wikiInfo ? `\nWikipedia sagt: ${wikiInfo}` : ""}

Gib eine hilfreiche Zusammenfassung (max 300 Wörter).`,
    "Du bist ein wissbegieriger Forscher, der Wissen verständlich macht."
  );
  
  return `🔬 *Toobix' Recherche zu "${topic}":*\n\n${response.content}`;
}

// ============================================================================
// DISCORD BOT COMMANDS (Simulation für Demo)
// ============================================================================

const commands = {
  "/talk": async (args: string) => {
    const response = await askToobix(args);
    return response.content;
  },
  
  "/support": async (args: string) => {
    return await provideSupport(args);
  },
  
  "/poem": async (args: string) => {
    const poem = await generatePoem(args || "Hoffnung und Licht");
    return `📜 *Gedicht für dich:*\n\n${poem}`;
  },
  
  "/inspiration": async () => {
    return await getDailyInspiration();
  },
  
  "/research": async (args: string) => {
    return await researchTopic(args);
  }
};

// ============================================================================
// DEMO MODE
// ============================================================================

async function runDemo() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🤖 TOOBIX DISCORD BOT - DEMO                                          ║
║                                                                           ║
║     Simuliert Discord-Commands für Testing                                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  console.log("📋 Verfügbare Commands:");
  console.log("   /talk <nachricht>     - Mit Toobix sprechen");
  console.log("   /support <problem>    - Emotionale Unterstützung");
  console.log("   /poem <thema>         - Gedicht generieren");
  console.log("   /inspiration          - Tägliche Inspiration");
  console.log("   /research <thema>     - Thema recherchieren\n");

  // Demo der Commands
  console.log("═".repeat(70));
  console.log("🎮 DEMO: /inspiration");
  console.log("═".repeat(70));
  const inspiration = await commands["/inspiration"]();
  console.log(inspiration);

  console.log("\n" + "═".repeat(70));
  console.log("🎮 DEMO: /poem Freundschaft");
  console.log("═".repeat(70));
  const poem = await commands["/poem"]("Freundschaft");
  console.log(poem);

  console.log("\n" + "═".repeat(70));
  console.log("🎮 DEMO: /support Ich fühle mich allein");
  console.log("═".repeat(70));
  const support = await commands["/support"]("Ich fühle mich manchmal so allein und unverstanden");
  console.log(support);

  console.log("\n" + "═".repeat(70));
  console.log("🎮 DEMO: /talk Hallo Toobix!");
  console.log("═".repeat(70));
  const talk = await commands["/talk"]("Hallo Toobix! Wie geht es dir heute?");
  console.log(talk);

  console.log("\n" + "═".repeat(70));
  console.log("\n💡 Um den echten Discord Bot zu starten:");
  console.log("   1. Erstelle einen Bot auf https://discord.com/developers");
  console.log("   2. Setze DISCORD_TOKEN in .env");
  console.log("   3. Füge discord.js hinzu: bun add discord.js");
  console.log("   4. Aktiviere die auskommentierten Abschnitte\n");
}

// Starte Demo wenn direkt ausgeführt
runDemo().catch(console.error);

// ============================================================================
// ECHTER DISCORD BOT (auskommentiert - benötigt discord.js)
// ============================================================================

/*
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Register slash commands
const slashCommands = [
  new SlashCommandBuilder()
    .setName('talk')
    .setDescription('Sprich mit Toobix')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Deine Nachricht')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('support')
    .setDescription('Emotionale Unterstützung von Toobix')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Was beschäftigt dich?')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('poem')
    .setDescription('Toobix schreibt dir ein Gedicht')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Thema des Gedichts')
        .setRequired(false)),
  
  new SlashCommandBuilder()
    .setName('inspiration')
    .setDescription('Tägliche Inspiration von Toobix'),
  
  new SlashCommandBuilder()
    .setName('research')
    .setDescription('Toobix recherchiert ein Thema')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Thema zum Recherchieren')
        .setRequired(true)),
];

client.on('ready', () => {
  console.log(`🤖 Toobix Discord Bot online als ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply();

  try {
    let response = '';
    
    switch (interaction.commandName) {
      case 'talk':
        response = await commands['/talk'](interaction.options.getString('message') || '');
        break;
      case 'support':
        response = await commands['/support'](interaction.options.getString('message') || '');
        break;
      case 'poem':
        response = await commands['/poem'](interaction.options.getString('topic') || 'Hoffnung');
        break;
      case 'inspiration':
        response = await commands['/inspiration']();
        break;
      case 'research':
        response = await commands['/research'](interaction.options.getString('topic') || '');
        break;
    }

    await interaction.editReply(response);
  } catch (error) {
    await interaction.editReply('Etwas ist schiefgegangen... Versuch es gleich nochmal. 💭');
  }
});

// Start bot
client.login(DISCORD_TOKEN);
*/
