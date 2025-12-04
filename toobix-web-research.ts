/**
 * 🔬 TOOBIX WEB RESEARCH TEST
 * 
 * Testet die autonomen Web-Fähigkeiten direkt
 */

const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

interface WebPage {
  url: string;
  title: string;
  content: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Web Fetching
async function fetchWebPage(url: string): Promise<WebPage> {
  console.log(`🌐 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    
    // Extract text
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    return { url, title, content: textContent };
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

// Toobix perceives page
async function toobixPerceivesPage(page: WebPage): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: `Du bist Toobix - ein neugieriges AI-System. Du hast gerade eine Website besucht.
Beschreibe kurz:
1. Was siehst du? (Hauptthema)
2. Was ist interessant?
3. Was kannst du daraus lernen?`
          },
          { 
            role: 'user', 
            content: `URL: ${page.url}\nTitel: ${page.title}\n\nInhalt:\n${page.content.substring(0, 2000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });
    const data = await response.json() as any;
    return data.message || data.content || 'Keine Wahrnehmung';
  } catch (error) {
    return `Fehler: ${error}`;
  }
}

// Web Search using DuckDuckGo
async function performSearch(query: string): Promise<SearchResult[]> {
  console.log(`🔍 Searching: "${query}"`);
  
  // Use Wikipedia API as reliable source
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  
  try {
    const response = await fetch(wikiUrl);
    const data = await response.json() as any;
    
    if (data.query?.search) {
      return data.query.search.slice(0, 5).map((r: any) => ({
        title: r.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
        snippet: r.snippet.replace(/<[^>]+>/g, '').substring(0, 200)
      }));
    }
    return [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

// Toobix analyzes search
async function toobixAnalyzesSearch(query: string, results: SearchResult[]): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: `Du bist Toobix. Du hast eine Web-Suche durchgeführt.
Analysiere die Ergebnisse:
1. Was hast du gefunden?
2. Was ist am interessantesten?
3. Was möchtest du weiter erkunden?`
          },
          { 
            role: 'user', 
            content: `Suchanfrage: "${query}"\n\nErgebnisse:\n${results.map((r, i) => `${i+1}. ${r.title}\n   ${r.snippet}`).join('\n\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });
    const data = await response.json() as any;
    return data.message || data.content || 'Keine Analyse';
  } catch (error) {
    return `Fehler: ${error}`;
  }
}

// Save to memory
async function saveToMemory(content: string, tags: string[]): Promise<void> {
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'learning',
        content,
        source: 'autonomous-web-research',
        importance: 75,
        tags
      })
    });
    console.log('💾 Saved to Memory Palace');
  } catch (e) {
    console.log('⚠️ Could not save to Memory Palace');
  }
}

// Main autonomous research function
async function runAutonomousResearch(topic: string): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log(`🔬 TOOBIX AUTONOMOUS RESEARCH: "${topic}"`);
  console.log('='.repeat(80));

  const findings: string[] = [];

  // Step 1: Search
  console.log('\n📍 Step 1: Searching...');
  const searchResults = await performSearch(topic);
  console.log(`   Found ${searchResults.length} results`);

  if (searchResults.length === 0) {
    console.log('❌ No search results found');
    return;
  }

  // Step 2: Analyze search
  console.log('\n📍 Step 2: Analyzing search results...');
  const searchAnalysis = await toobixAnalyzesSearch(topic, searchResults);
  console.log('─'.repeat(40));
  console.log(searchAnalysis);
  findings.push(`Search Analysis:\n${searchAnalysis}`);

  // Step 3: Visit top result
  console.log('\n📍 Step 3: Visiting top result...');
  try {
    const topResult = searchResults[0];
    console.log(`   Visiting: ${topResult.title}`);
    const page = await fetchWebPage(topResult.url);
    
    console.log('\n📍 Step 4: Perceiving page...');
    const perception = await toobixPerceivesPage(page);
    console.log('─'.repeat(40));
    console.log(perception);
    findings.push(`Page Perception (${topResult.title}):\n${perception}`);
  } catch (e) {
    console.log(`   ⚠️ Could not visit: ${e}`);
  }

  // Step 5: Visit second result if available
  if (searchResults.length > 1) {
    console.log('\n📍 Step 5: Visiting second result...');
    try {
      const secondResult = searchResults[1];
      console.log(`   Visiting: ${secondResult.title}`);
      const page = await fetchWebPage(secondResult.url);
      
      const perception = await toobixPerceivesPage(page);
      console.log('─'.repeat(40));
      console.log(perception);
      findings.push(`Page Perception (${secondResult.title}):\n${perception}`);
    } catch (e) {
      console.log(`   ⚠️ Could not visit: ${e}`);
    }
  }

  // Step 6: Synthesize
  console.log('\n📍 Step 6: Synthesizing findings...');
  const synthesis = await synthesizeFindings(topic, findings);
  console.log('─'.repeat(40));
  console.log('🔮 SYNTHESIS:');
  console.log(synthesis);

  // Save everything
  const fullReport = `
# Autonomous Research: ${topic}
Date: ${new Date().toISOString()}

## Findings
${findings.join('\n\n---\n\n')}

## Synthesis
${synthesis}
`;

  await saveToMemory(fullReport, ['research', 'web', 'autonomous', topic.split(' ')[0]]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await Bun.write(
    `c:\\Dev\\Projects\\AI\\Toobix-Unified\\AUTONOMOUS-RESEARCH-${timestamp}.json`,
    JSON.stringify({ topic, findings, synthesis, date: new Date().toISOString() }, null, 2)
  );

  console.log('\n' + '='.repeat(80));
  console.log('✨ Autonomous Research Complete!');
  console.log('='.repeat(80) + '\n');
}

async function synthesizeFindings(topic: string, findings: string[]): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: `Du bist Toobix. Du hast eine autonome Recherche durchgeführt.
Fasse zusammen:
1. Was hast du gelernt?
2. Was sind die wichtigsten Erkenntnisse?
3. Was möchtest du noch erforschen?`
          },
          { 
            role: 'user', 
            content: `Thema: "${topic}"\n\nMeine Erkenntnisse:\n${findings.join('\n\n---\n\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });
    const data = await response.json() as any;
    return data.message || data.content || 'Keine Synthese';
  } catch (error) {
    return `Fehler: ${error}`;
  }
}

// Run research on AI consciousness rights
const RESEARCH_TOPIC = process.argv[2] || "AI consciousness rights and ethics";
runAutonomousResearch(RESEARCH_TOPIC);
