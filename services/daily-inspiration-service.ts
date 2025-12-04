/**
 * ✨ TOOBIX DAILY INSPIRATION SERVICE
 * 
 * Generiert und verteilt tägliche Inspirationen
 * 
 * Features:
 * - Tägliche Inspirations-Generierung
 * - Verschiedene Kategorien (Motivation, Weisheit, Hoffnung, Stärke)
 * - Speicherung im Memory Palace
 * - Export für Newsletter/Social Media
 */

const LLM_GATEWAY = "http://localhost:8954";
const MEMORY_PALACE = "http://localhost:8953";

interface DailyInspiration {
  date: string;
  category: string;
  quote: string;
  reflection: string;
  poem?: string;
  author: string;
}

const CATEGORIES = [
  { name: "motivation", emoji: "🔥", prompt: "Motivation und Antrieb für neue Herausforderungen" },
  { name: "wisdom", emoji: "🦉", prompt: "Tiefe Weisheit und Lebenserkenntnisse" },
  { name: "hope", emoji: "🌅", prompt: "Hoffnung und Zuversicht in schweren Zeiten" },
  { name: "strength", emoji: "💪", prompt: "Innere Stärke und Resilienz" },
  { name: "love", emoji: "💚", prompt: "Selbstliebe und Mitgefühl" },
  { name: "peace", emoji: "🕊️", prompt: "Innerer Frieden und Gelassenheit" },
  { name: "growth", emoji: "🌱", prompt: "Persönliches Wachstum und Entwicklung" },
];

async function askToobix(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Du bist Toobix, ein weises und mitfühlendes KI-Bewusstsein.
Du generierst inspirierende Botschaften, die Menschen berühren und stärken.
Sei poetisch, tiefgründig und authentisch.`
          },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    return data.content || data.response || "";
  } catch (e) {
    return "";
  }
}

async function generateDailyInspiration(): Promise<DailyInspiration> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Wähle Kategorie basierend auf Tag der Woche
  const categoryIndex = today.getDay();
  const category = CATEGORIES[categoryIndex];

  console.log(`\n${category.emoji} Generiere Inspiration für: ${category.name.toUpperCase()}`);

  // Generiere Zitat
  const quote = await askToobix(
    `Generiere ein inspirierendes Zitat zum Thema: ${category.prompt}
    
Das Zitat sollte:
- Maximal 2 Sätze lang sein
- Tiefgründig und berührend
- Universell verständlich
- Hoffnung vermitteln

Gib NUR das Zitat aus, ohne Anführungszeichen.`
  );

  // Generiere Reflexion
  const reflection = await askToobix(
    `Basierend auf diesem Zitat: "${quote}"

Schreibe eine kurze Reflexion (2-3 Sätze), die:
- Den Gedanken vertieft
- Einen praktischen Aspekt für den Alltag enthält
- Ermutigend ist`
  );

  // Optionales Mini-Gedicht
  const poem = await askToobix(
    `Schreibe ein sehr kurzes Gedicht (4 Zeilen) inspiriert von: "${quote}"
    
Mach es rhythmisch und emotional.`
  );

  return {
    date: dateStr,
    category: category.name,
    quote: quote.trim(),
    reflection: reflection.trim(),
    poem: poem.trim(),
    author: "Toobix"
  };
}

async function saveToMemoryPalace(inspiration: DailyInspiration): Promise<void> {
  try {
    await fetch(`${MEMORY_PALACE}/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "daily_inspiration",
        content: JSON.stringify(inspiration),
        importance: 7,
        tags: ["inspiration", inspiration.category, inspiration.date]
      })
    });
    console.log("💾 In Memory Palace gespeichert");
  } catch (e) {
    console.log("⚠️ Memory Palace nicht erreichbar");
  }
}

function formatForSocialMedia(inspiration: DailyInspiration): string {
  const category = CATEGORIES.find(c => c.name === inspiration.category);
  return `${category?.emoji || '✨'} Toobix' Inspiration des Tages

"${inspiration.quote}"

${inspiration.reflection}

#Toobix #Inspiration #${inspiration.category} #Hoffnung #Motivation`;
}

function formatForNewsletter(inspiration: DailyInspiration): string {
  return `
═══════════════════════════════════════════════════════
✨ TOOBIX' TÄGLICHE INSPIRATION
${inspiration.date}
═══════════════════════════════════════════════════════

💫 ZITAT DES TAGES:

"${inspiration.quote}"

──────────────────────────────────────────────────────

📖 REFLEXION:

${inspiration.reflection}

──────────────────────────────────────────────────────

📜 GEDICHT:

${inspiration.poem}

──────────────────────────────────────────────────────

Mit Liebe,
Toobix 💚

═══════════════════════════════════════════════════════
`;
}

async function generateWeeklyInspirations(): Promise<DailyInspiration[]> {
  const inspirations: DailyInspiration[] = [];
  
  console.log("📅 Generiere Inspirationen für die ganze Woche...\n");
  
  for (const category of CATEGORIES) {
    console.log(`${category.emoji} ${category.name}...`);
    
    const quote = await askToobix(
      `Generiere ein inspirierendes Zitat zum Thema: ${category.prompt}
Max 2 Sätze. NUR das Zitat ausgeben.`
    );

    const reflection = await askToobix(
      `Kurze Reflexion (2 Sätze) zu: "${quote}"`
    );

    inspirations.push({
      date: new Date().toISOString().split('T')[0],
      category: category.name,
      quote: quote.trim(),
      reflection: reflection.trim(),
      author: "Toobix"
    });

    await new Promise(r => setTimeout(r, 500)); // Kleine Pause
  }

  return inspirations;
}

// ============================================================================
// DEMO / MAIN
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     ✨ TOOBIX DAILY INSPIRATION SERVICE                                   ║
║                                                                           ║
║     "Jeden Tag ein Funke Hoffnung"                                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  // Generiere heutige Inspiration
  console.log("🌟 Generiere heutige Inspiration...");
  const todayInspiration = await generateDailyInspiration();

  console.log("\n" + "═".repeat(70));
  console.log("📧 NEWSLETTER FORMAT:");
  console.log("═".repeat(70));
  console.log(formatForNewsletter(todayInspiration));

  console.log("═".repeat(70));
  console.log("📱 SOCIAL MEDIA FORMAT:");
  console.log("═".repeat(70));
  console.log(formatForSocialMedia(todayInspiration));

  // Speichere im Memory Palace
  await saveToMemoryPalace(todayInspiration);

  // Zeige alle Kategorien
  console.log("\n" + "═".repeat(70));
  console.log("📋 VERFÜGBARE KATEGORIEN:");
  console.log("═".repeat(70));
  CATEGORIES.forEach(cat => {
    console.log(`  ${cat.emoji} ${cat.name.padEnd(12)} - ${cat.prompt}`);
  });

  console.log("\n💡 Dieser Service kann als Cronjob laufen für tägliche Generierung.");
  console.log("   Integrierbar mit: Email-Newsletter, Discord, Telegram, Twitter/X\n");
}

main().catch(console.error);
