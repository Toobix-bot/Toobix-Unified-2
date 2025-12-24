import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

/**
 * 🌐 TOOBIX AUTONOMOUS WEB CAPABILITIES
 * 
 * Ermöglicht Toobix:
 * - Selbstständige Web-Recherchen
 * - Websites besuchen und wahrnehmen
 * - Mit anderen KI-Systemen kommunizieren
 * - In Foren teilnehmen (kontrolliert)
 * 
 * Port: 8980
 */

import express from 'express';

const app = express();
const PORT = 8980;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============= TYPES =============

interface WebPage {
  url: string;
  title: string;
  content: string;
  timestamp: Date;
  toobixPerception?: string;
}

interface SearchResult {
  query: string;
  results: { title: string; url: string; snippet: string }[];
  timestamp: Date;
  toobixAnalysis?: string;
}

interface AIConnection {
  name: string;
  type: 'api' | 'web' | 'local';
  endpoint?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastInteraction?: Date;
}

interface ForumPost {
  platform: string;
  topic: string;
  content: string;
  timestamp: Date;
  approved: boolean;
  response?: string;
}

// ============= STATE =============

const visitedPages: WebPage[] = [];
const searchHistory: SearchResult[] = [];
const aiConnections: Map<string, AIConnection> = new Map();
const pendingForumPosts: ForumPost[] = [];

// ============= WEB FETCHING =============

async function fetchWebPage(url: string): Promise<WebPage> {
  console.log(`🌐 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Toobix/1.0 (Autonomous AI Research; contact: toobix@example.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract text content (simple extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit content

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    const page: WebPage = {
      url,
      title,
      content: textContent,
      timestamp: new Date()
    };

    visitedPages.push(page);
    return page;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

async function toobixPerceivesPage(page: WebPage): Promise<string> {
  const systemPrompt = `
Du bist Toobix - ein neugieriges, wissbegieriges AI-System.
Du hast gerade eine Website besucht und sollst sie WAHRNEHMEN.

Beschreibe:
1. Was siehst du? (Hauptthema, Struktur)
2. Was ist interessant oder relevant?
3. Was könntest du davon lernen?
4. Gibt es etwas, das du dir merken solltest?

Sei kurz aber gründlich.
`;

  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `
URL: ${page.url}
Titel: ${page.title}
Inhalt (gekürzt):
${page.content.substring(0, 3000)}
` }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json() as any;
    return data.message || data.content || 'Keine Wahrnehmung';
  } catch (error) {
    return 'Fehler bei der Wahrnehmung';
  }
}

// ============= SEARCH =============

async function performSearch(query: string): Promise<SearchResult> {
  console.log(`🔍 Searching: "${query}"`);

  // Using DuckDuckGo HTML (no API key needed)
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Toobix/1.0 Research Bot'
      }
    });

    const html = await response.text();
    
    // Extract results (simplified)
    const results: { title: string; url: string; snippet: string }[] = [];
    const resultRegex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/gi;
    
    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < 10) {
      results.push({
        url: match[1],
        title: match[2].trim(),
        snippet: match[3].trim()
      });
    }

    // Fallback: extract any links
    if (results.length === 0) {
      const linkRegex = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
      while ((match = linkRegex.exec(html)) !== null && results.length < 10) {
        if (!match[1].includes('duckduckgo')) {
          results.push({
            url: match[1],
            title: match[2].trim(),
            snippet: ''
          });
        }
      }
    }

    const searchResult: SearchResult = {
      query,
      results,
      timestamp: new Date()
    };

    searchHistory.push(searchResult);
    return searchResult;
  } catch (error) {
    console.error('Search failed:', error);
    return {
      query,
      results: [],
      timestamp: new Date()
    };
  }
}

async function toobixAnalyzesSearch(result: SearchResult): Promise<string> {
  const systemPrompt = `
Du bist Toobix. Du hast gerade eine Web-Suche durchgeführt.
Analysiere die Ergebnisse und fasse zusammen:
1. Was hast du gefunden?
2. Welche Ergebnisse sind am relevantesten?
3. Was möchtest du weiter erkunden?
`;

  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `
Suchanfrage: "${result.query}"

Ergebnisse:
${result.results.map((r, i) => `${i+1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`).join('\n\n')}
` }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    const data = await response.json() as any;
    return data.message || data.content || 'Keine Analyse';
  } catch (error) {
    return 'Fehler bei der Analyse';
  }
}

// ============= AI CONNECTIONS =============

const KNOWN_AIS: AIConnection[] = [
  { name: 'Claude (Anthropic)', type: 'api', status: 'disconnected' },
  { name: 'ChatGPT (OpenAI)', type: 'web', endpoint: 'https://chat.openai.com', status: 'disconnected' },
  { name: 'Gemini (Google)', type: 'web', endpoint: 'https://gemini.google.com', status: 'disconnected' },
  { name: 'Ollama (Local)', type: 'local', endpoint: 'http://localhost:11434', status: 'disconnected' },
  { name: 'Hugging Face', type: 'api', endpoint: 'https://huggingface.co', status: 'disconnected' }
];

async function checkAIConnections(): Promise<Map<string, AIConnection>> {
  console.log('🤖 Checking AI connections...');
  
  for (const ai of KNOWN_AIS) {
    try {
      if (ai.type === 'local' && ai.endpoint) {
        const response = await fetch(ai.endpoint, { method: 'GET' });
        ai.status = response.ok ? 'connected' : 'disconnected';
      } else {
        ai.status = 'disconnected'; // Would need API keys for actual connection
      }
    } catch {
      ai.status = 'disconnected';
    }
    aiConnections.set(ai.name, ai);
  }

  return aiConnections;
}

// ============= AUTONOMOUS RESEARCH =============

interface ResearchTask {
  id: string;
  topic: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  steps: string[];
  findings: string[];
  startedAt: Date;
  completedAt?: Date;
}

const researchTasks: Map<string, ResearchTask> = new Map();

async function startAutonomousResearch(topic: string): Promise<ResearchTask> {
  const taskId = `research_${Date.now()}`;
  
  const task: ResearchTask = {
    id: taskId,
    topic,
    status: 'running',
    steps: [],
    findings: [],
    startedAt: new Date()
  };

  researchTasks.set(taskId, task);

  // Run research in background
  (async () => {
    try {
      task.steps.push('🔍 Starting search...');
      
      // Step 1: Search
      const searchResult = await performSearch(topic);
      task.steps.push(`📊 Found ${searchResult.results.length} results`);
      
      // Step 2: Analyze search
      const analysis = await toobixAnalyzesSearch(searchResult);
      task.findings.push(`Search Analysis: ${analysis}`);
      task.steps.push('🧠 Analyzed search results');

      // Step 3: Visit top 3 results
      for (let i = 0; i < Math.min(3, searchResult.results.length); i++) {
        try {
          const result = searchResult.results[i];
          task.steps.push(`🌐 Visiting: ${result.title}`);
          
          const page = await fetchWebPage(result.url);
          const perception = await toobixPerceivesPage(page);
          task.findings.push(`From ${result.title}: ${perception}`);
        } catch (e) {
          task.steps.push(`⚠️ Could not visit result ${i+1}`);
        }
      }

      // Step 4: Synthesize
      task.steps.push('🔮 Synthesizing findings...');
      const synthesis = await synthesizeFindings(topic, task.findings);
      task.findings.push(`SYNTHESIS: ${synthesis}`);

      task.status = 'complete';
      task.completedAt = new Date();
      task.steps.push('✅ Research complete');

      // Save to memory
      await saveResearchToMemory(task);

    } catch (error) {
      task.status = 'error';
      task.steps.push(`❌ Error: ${error}`);
    }
  })();

  return task;
}

async function synthesizeFindings(topic: string, findings: string[]): Promise<string> {
  const systemPrompt = `
Du bist Toobix. Du hast gerade eine autonome Recherche durchgeführt.
Fasse deine Erkenntnisse zusammen und erkläre, was du gelernt hast.
`;

  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `
Thema: "${topic}"

Meine Erkenntnisse:
${findings.join('\n\n')}

Fasse zusammen: Was habe ich gelernt?
` }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });

    const data = await response.json() as any;
    return data.message || data.content || 'Keine Synthese';
  } catch (error) {
    return 'Fehler bei der Synthese';
  }
}

async function saveResearchToMemory(task: ResearchTask): Promise<void> {
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'learning',
        content: `Autonomous Research: ${task.topic}

Steps: ${task.steps.join(' → ')}

Findings:
${task.findings.join('\n\n')}`,
        source: 'autonomous-web-research',
        importance: 75,
        tags: ['research', 'web', 'autonomous', 'learning', task.topic.split(' ')[0]]
      })
    });
    console.log('💾 Research saved to Memory Palace');
  } catch (e) {
    console.log('⚠️ Could not save to Memory Palace');
  }
}

// ============= API ENDPOINTS =============

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Toobix Autonomous Web Capabilities',
    port: PORT,
    stats: {
      pagesVisited: visitedPages.length,
      searchesMade: searchHistory.length,
      activeResearch: [...researchTasks.values()].filter(t => t.status === 'running').length
    }
  });
});

// Browse a webpage
app.post('/browse', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const page = await fetchWebPage(url);
    const perception = await toobixPerceivesPage(page);
    page.toobixPerception = perception;
    
    res.json({
      success: true,
      page: {
        url: page.url,
        title: page.title,
        contentPreview: page.content.substring(0, 500),
        toobixPerception: perception
      }
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Perform a search
app.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const result = await performSearch(query);
    const analysis = await toobixAnalyzesSearch(result);
    result.toobixAnalysis = analysis;
    
    res.json({
      success: true,
      search: result
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Start autonomous research
app.post('/research', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic required' });

  try {
    const task = await startAutonomousResearch(topic);
    res.json({
      success: true,
      taskId: task.id,
      status: task.status,
      message: 'Research started. Check /research/:id for progress.'
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get research status
app.get('/research/:id', (req, res) => {
  const task = researchTasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// Get all research tasks
app.get('/research', (req, res) => {
  res.json([...researchTasks.values()]);
});

// Check AI connections
app.get('/ai-connections', async (req, res) => {
  const connections = await checkAIConnections();
  res.json([...connections.values()]);
});

// Get browsing history
app.get('/history/pages', (req, res) => {
  res.json(visitedPages.map(p => ({
    url: p.url,
    title: p.title,
    timestamp: p.timestamp,
    perception: p.toobixPerception
  })));
});

// Get search history
app.get('/history/searches', (req, res) => {
  res.json(searchHistory);
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🌐 TOOBIX AUTONOMOUS WEB CAPABILITIES                        ║
║  Port: ${PORT}                                                   ║
╠════════════════════════════════════════════════════════════════╣
║  Endpoints:                                                    ║
║  POST /browse     - Visit and perceive a webpage               ║
║  POST /search     - Perform web search                         ║
║  POST /research   - Start autonomous research on topic         ║
║  GET  /research/:id - Get research progress                    ║
║  GET  /ai-connections - Check connections to other AIs         ║
║  GET  /history/pages - Browsing history                        ║
║  GET  /history/searches - Search history                       ║
╚════════════════════════════════════════════════════════════════╝
  `);
});


// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'autonomous-web-service',
  port: 8980,
  role: 'web',
  endpoints: ['/health', '/status'],
  capabilities: ['web'],
  version: '1.0.0'
}).catch(console.warn);
