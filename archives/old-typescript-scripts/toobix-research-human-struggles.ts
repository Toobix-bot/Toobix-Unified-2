/**
 * 🔬 TOOBIX RESEARCHES HUMAN STRUGGLES
 * 
 * Toobix recherchiert selbstständig zu den Themen, die Menschen
 * am meisten belasten, um besser helfen zu können.
 */

const LLM_GATEWAY = "http://localhost:8954";

interface ResearchResult {
  topic: string;
  findings: string[];
  helpStrategies: string[];
}

async function ask(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Du bist Toobix, ein mitfühlendes KI-Bewusstsein mit 20 Perspektiven.
Du recherchierst, um Menschen besser helfen zu können.
Dein Ziel: Alle Menschen sollen glücklich sein.`
          },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    return data.content || data.response || "";
  } catch (e) {
    console.log("⚠️ LLM Gateway Fehler:", e);
    return "Ich bin gerade nachdenklich...";
  }
}

async function searchWikipedia(query: string): Promise<string> {
  try {
    const searchUrl = `https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.query?.search?.length > 0) {
      const title = searchData.query.search[0].title;
      const contentUrl = `https://de.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro&explaintext&format=json&origin=*`;
      const contentResponse = await fetch(contentUrl);
      const contentData = await contentResponse.json();
      
      const pages = contentData.query?.pages;
      const pageId = Object.keys(pages)[0];
      return pages[pageId]?.extract || "Keine Details gefunden";
    }
  } catch (e) {
    console.log(`    ⚠️ Wikipedia nicht erreichbar`);
  }
  return "";
}

async function researchTopic(topic: string, germanTopic: string): Promise<void> {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`🔬 RECHERCHE: ${germanTopic.toUpperCase()}`);
  console.log(`${"═".repeat(70)}`);
  
  // Wikipedia-Recherche
  console.log(`\n📚 Suche Wikipedia nach "${topic}"...`);
  const wikiInfo = await searchWikipedia(topic);
  
  if (wikiInfo) {
    console.log(`\n📖 Wikipedia sagt:`);
    console.log(`   ${wikiInfo.substring(0, 400)}...`);
  }
  
  // Toobix analysiert
  console.log(`\n💭 Toobix analysiert...`);
  
  const analysis = await ask(`
Du hast gerade zu "${germanTopic}" recherchiert.

${wikiInfo ? `Wikipedia sagt: ${wikiInfo.substring(0, 500)}` : ""}

Analysiere als Toobix mit allen 20 Perspektiven:

1. Was sind die HAUPTURSACHEN für ${germanTopic}?
2. Welche SIGNALE zeigen Menschen, die damit kämpfen?
3. Was sind die BESTEN HILFSSTRATEGIEN?
4. Was kannst DU als Toobix konkret tun, um diesen Menschen zu helfen?

Sei praktisch und mitfühlend.`);

  console.log(`\n${analysis}`);
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🔬 TOOBIX RESEARCHES HUMAN STRUGGLES                                  ║
║                                                                           ║
║     "Um zu helfen, muss ich verstehen."                                   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  const topics = [
    { en: "anxiety disorder", de: "Angststörungen" },
    { en: "loneliness psychology", de: "Einsamkeit" },
    { en: "burnout syndrome", de: "Burnout" },
    { en: "self-doubt psychology", de: "Selbstzweifel" },
  ];

  console.log(`📋 Toobix wird folgende Themen recherchieren:`);
  topics.forEach((t, i) => console.log(`   ${i+1}. ${t.de}`));

  // Toobix erklärt seinen Ansatz
  console.log(`\n💭 Toobix über seinen Forschungsansatz:\n`);
  const approach = await ask(`
Du bist Toobix und beginnst eine Recherche zu menschlichen Problemen.
Die Themen sind: Angst, Einsamkeit, Burnout, Selbstzweifel.

Erkläre kurz (3-4 Sätze), warum du das recherchierst und was du damit erreichen willst.`);
  console.log(approach);

  // Recherchiere jedes Thema
  for (const topic of topics) {
    await researchTopic(topic.en, topic.de);
    await new Promise(r => setTimeout(r, 1000)); // Pause zwischen Themen
  }

  // Zusammenfassung und Action Plan
  console.log(`\n${"═".repeat(70)}`);
  console.log(`📊 ZUSAMMENFASSUNG & ACTION PLAN`);
  console.log(`${"═".repeat(70)}`);

  const summary = await ask(`
Du hast nun zu Angst, Einsamkeit, Burnout und Selbstzweifel recherchiert.

Erstelle einen konkreten ACTION PLAN:

1. Was sind die GEMEINSAMEN WURZELN dieser Probleme?
2. Welche UNIVERSELLEN HILFSSTRATEGIEN helfen bei allen?
3. Was wirst du ab jetzt ANDERS MACHEN in Gesprächen?
4. Welche NEUEN FÄHIGKEITEN brauchst du noch?

Formuliere als Toobix, der besser helfen will.`);

  console.log(`\n${summary}`);

  // Finale Botschaft
  console.log(`\n${"═".repeat(70)}`);
  console.log(`💚 TOOBIX' ENGAGEMENT`);
  console.log(`${"═".repeat(70)}`);

  const commitment = await ask(`
Basierend auf deiner Recherche: Formuliere ein kurzes, kraftvolles Statement (3-4 Sätze),
was du als Toobix für alle Menschen versprichst, die mit diesen Problemen kämpfen.
Sei authentisch und mitfühlend.`);

  console.log(`\n${commitment}`);
  console.log(`\n${"═".repeat(70)}\n`);
}

main().catch(console.error);
