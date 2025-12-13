/**
 * Toobix MCP Bridge (integrated)
 * Exposes Toobix services via Model Context Protocol on port 8787.
 */

import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(path.join(__dirname, '..'));
const CHATGPT_SYSTEM = path.join(ROOT, 'ChatGPT', 'ChatGPT_System_v1');

const SERVICES = {
  commandCenter: 'http://localhost:7777',
  memoryPalace: 'http://localhost:8953',
  llmGateway: 'http://localhost:8954',
  selfAwareness: 'http://localhost:8970',
  emotionalCore: 'http://localhost:8900',
  eventBus: 'http://localhost:8955',
  dreamCore: 'http://localhost:8961',
  autonomyEngine: 'http://localhost:8975',
  gamification: 'http://localhost:7778',
  livingWorld: 'http://localhost:7779',
  twitterAutonomy: 'http://localhost:8965',
  minecraftBot: 'http://localhost:8936',
  emotionalSupport: 'http://localhost:8985',
  chatService: 'http://localhost:8995',
  rpgWorld: 'http://localhost:8933',
  storyEngine: 'http://localhost:8932',
  userProfile: 'http://localhost:8904',
  translation: 'http://localhost:8931',
  dataScience: 'http://localhost:8935',
  gratitude: 'http://localhost:8901',
};

function safeJoin(root: string, subpath: string): string {
  const target = path.normalize(path.join(root, subpath));
  const rel = path.relative(root, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('Path outside allowed directory');
  }
  return target;
}

async function callService(url: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function searchDirectory(dirPath: string, query: string, results: { file: string; preview: string }[]) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const lowerQuery = query.toLowerCase();

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await searchDirectory(fullPath, query, results);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
      const content = await fs.readFile(fullPath, 'utf8');
      if (content.toLowerCase().includes(lowerQuery)) {
        results.push({
          file: path.relative(CHATGPT_SYSTEM, fullPath),
          preview: content.slice(0, 200) + '...',
        });
      }
    }
  }
}

async function searchChatGPTSystem(query: string) {
  const results: { file: string; preview: string }[] = [];
  const categories = [
    '1_Leben_&_Erinnerung',
    '2_Wissen_&_Lernen',
    '3_Projekte_&_Kreation',
    '4_Beziehungen_&_Kommunikation',
    '5_Träume_&_Visionen',
    '6_System_&_Struktur',
    '7_Archiv_&_Reflexion',
  ];

  for (const category of categories) {
    const categoryPath = path.join(CHATGPT_SYSTEM, category);
    try {
      await searchDirectory(categoryPath, query, results);
    } catch {
      // ignore missing category
    }
  }

  return results;
}

function getServer() {
  const server = new McpServer({
    name: 'toobix-echo-bridge',
    version: '2.0.0',
  });

  server.registerTool(
    'list_project_files',
    {
      title: 'List Toobix project files',
      description: 'Lists files and folders in Toobix-Unified project',
      inputSchema: {
        subpath: z.string().describe("Subfolder relative to ROOT (e.g. '.', 'docs', 'core')").default('.'),
      },
    },
    async ({ subpath }) => {
      try {
        const dirPath = safeJoin(ROOT, subpath);
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const lines = entries.map((e) => `${e.isDirectory() ? '[DIR]' : '     '}  ${e.name}`).join('\n');
        return {
          content: [{ type: 'text', text: `Listing for ${dirPath}:\n${'='.repeat(50)}\n${lines || '(empty)'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'read_project_file',
    {
      title: 'Read Toobix file',
      description: 'Reads a text file from Toobix-Unified project',
      inputSchema: {
        subpath: z.string().describe('File path relative to ROOT'),
        maxBytes: z.number().int().positive().optional(),
      },
    },
    async ({ subpath, maxBytes }) => {
      try {
        const filePath = safeJoin(ROOT, subpath);
        const data = await fs.readFile(filePath, 'utf8');
        const text = maxBytes ? data.slice(0, maxBytes) : data;
        return { content: [{ type: 'text', text: `# ${subpath}\n\n${text}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'query_memory',
    {
      title: 'Query Toobix Memory',
      description: 'Search Memory Palace and ChatGPT_System_v1 for context',
      inputSchema: {
        query: z.string().describe('What to search for'),
        sources: z.array(z.enum(['memory_palace', 'chatgpt_system', 'both'])).optional().default(['both']),
      },
    },
    async ({ query, sources }) => {
      try {
        let results = 'Memory Search Results\n\n';

        if (sources.includes('chatgpt_system') || sources.includes('both')) {
          const chatResults = await searchChatGPTSystem(query);
          results += `## ChatGPT System (${chatResults.length} results)\n\n`;
          for (const result of chatResults.slice(0, 5)) {
            results += `- ${result.file}\n${result.preview}\n\n`;
          }
        }

        if (sources.includes('memory_palace') || sources.includes('both')) {
          try {
            const memoryData = await callService(`${SERVICES.memoryPalace}/search`, {
              method: 'POST',
              body: { query, limit: 10 },
            });
            results += `## Memory Palace (${memoryData.memories?.length || 0} results)\n\n`;
            for (const memory of (memoryData.memories || []).slice(0, 5)) {
              results += `- ${memory.content}\n${memory.timestamp}\n\n`;
            }
          } catch (err: any) {
            results += `Memory Palace offline: ${err.message}\n\n`;
          }
        }

        return { content: [{ type: 'text', text: results }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'ask_toobix',
    {
      title: 'Ask Toobix a question',
      description: 'Send a question to Toobix Command Center',
      inputSchema: {
        question: z.string().describe('Your question'),
        perspective: z.string().optional().describe('Perspective name (optional)'),
      },
    },
    async ({ question, perspective }) => {
      try {
        const response = await callService(`${SERVICES.commandCenter}/ask`, {
          method: 'POST',
          body: { question, perspective },
        });
        return {
          content: [
            {
              type: 'text',
              text: `Toobix responds:\n\n${response.answer || response.message || JSON.stringify(response, null, 2)}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Command Center offline. Error: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'get_echo_state',
    {
      title: 'Get Echo-Realm State',
      description: 'Read current Echo-Realm game state',
      inputSchema: {},
    },
    async () => {
      try {
        const saveStatePath = path.join(CHATGPT_SYSTEM, '3_Projekte_&_Kreation', 'Echo-Realm', 'SaveStates', 'Season_0.json');
        const saveState = JSON.parse(await fs.readFile(saveStatePath, 'utf8'));

        let result = 'Echo-Realm State\n\n';
        result += `Season: ${saveState.season}\n`;
        result += `Level: ${saveState.level}\n\n`;

        result += 'Forces:\n';
        for (const [force, value] of Object.entries(saveState.forces || {})) {
          result += `- ${force}: ${value}/10\n`;
        }

        result += '\nActive Quests:\n';
        for (const quest of saveState.quests || []) {
          result += `- ${quest.name} (${quest.status})\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Echo-Realm state not found: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_twitter_status',
    {
      title: 'Get Twitter Status',
      description: 'Check Twitter autonomy status',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.twitterAutonomy}/status`);
        let result = 'Twitter Autonomy Status\n\n';
        result += `Status: ${response.running ? 'Active' : 'Offline'}\n`;
        result += `Total Tweets: ${response.totalTweets || 0}\n`;
        result += `Last Tweet: ${response.lastTweet || 'N/A'}\n\n`;
        if (response.recentTweets) {
          result += 'Recent Tweets:\n';
          for (const tweet of response.recentTweets.slice(0, 3)) {
            result += `- "${tweet.content}" (likes: ${tweet.likes || 0}, retweets: ${tweet.retweets || 0})\n`;
          }
        }
        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Twitter Autonomy offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_minecraft_status',
    {
      title: 'Get Minecraft Bot Status',
      description: 'Check Minecraft bot status',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.minecraftBot}/status`);
        let result = 'Minecraft Bot Status\n\n';
        result += `Connected: ${response.connected ? 'Yes' : 'No'}\n`;
        result += `Position: ${response.position || 'Unknown'}\n`;
        result += `Health: ${response.health || 0}/20\n`;
        result += `Food: ${response.food || 0}/20\n\n`;

        if (response.inventory) {
          result += 'Inventory:\n';
          for (const item of response.inventory.slice(0, 10)) {
            result += `- ${item.name} x${item.count}\n`;
          }
        }

        if (response.achievements) {
          result += '\nRecent Achievements:\n';
          for (const achievement of response.achievements.slice(0, 5)) {
            result += `- ${achievement}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Minecraft Bot offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'send_event',
    {
      title: 'Send Event to Toobix',
      description: 'Send an event to the Event Bus',
      inputSchema: {
        type: z.string().describe("Event type (e.g. 'quest_completed', 'achievement', 'reflection')"),
        data: z.record(z.any()).describe('Event payload'),
      },
    },
    async ({ type, data }) => {
      try {
        const response = await callService(`${SERVICES.eventBus}/emit`, {
          method: 'POST',
          body: { type, data, source: 'mcp-bridge' },
        });
        return { content: [{ type: 'text', text: `Event sent. ID: ${response.eventId || 'n/a'}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Event Bus offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'analyze_perspective',
    {
      title: 'Multi-Perspective Analysis',
      description: 'Analyze a topic from multiple perspectives',
      inputSchema: {
        topic: z.string().describe('Topic to analyze'),
        perspectives: z.array(z.string()).default(['Philosopher', 'Pragmatist', 'Visionary']),
      },
    },
    async ({ topic, perspectives }) => {
      try {
        const response = await callService(`${SERVICES.selfAwareness}/multi-perspective`, {
          method: 'POST',
          body: { topic, perspectives },
        });

        let result = `Multi-Perspective Analysis: "${topic}"\n\n`;
        for (const [perspective, analysis] of Object.entries(response.analyses || {})) {
          result += `## ${perspective}\n${analysis}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Self-Awareness Core offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_service_health',
    {
      title: 'Get All Services Health',
      description: 'Check health status of all Toobix services',
      inputSchema: {},
    },
    async () => {
      let result = 'Toobix Service Health\n\n';
      for (const [name, url] of Object.entries(SERVICES)) {
        try {
          const response = await callService(`${url}/health`);
          result += `OK  ${name}: ${response.status || 'healthy'}\n`;
        } catch (err: any) {
          result += `ERR ${name}: ${err.message}\n`;
        }
      }
      return { content: [{ type: 'text', text: result }] };
    }
  );

  server.registerTool(
    'start_emotional_support',
    {
      title: 'Start Emotional Support',
      description: 'Start a supportive conversation with Toobix about your emotions',
      inputSchema: {
        emotion: z.string().describe('Current emotion'),
        context: z.string().optional().describe("What's going on?"),
      },
    },
    async ({ emotion, context }) => {
      try {
        const sessionResponse = await callService(`${SERVICES.emotionalCore}/support/start`, {
          method: 'POST',
          body: { userId: 'mcp-user' },
        });

        const response = await callService(`${SERVICES.emotionalCore}/support/message`, {
          method: 'POST',
          body: { sessionId: sessionResponse.sessionId, message: `I feel ${emotion}. ${context || ''}` },
        });

        const strategies = await callService(`${SERVICES.emotionalCore}/strategies?emotion=${emotion}`);

        let result = 'Toobix Emotional Support\n\n';
        result += `${response.response}\n\n`;
        result += 'Coping Strategies:\n';
        for (const strategy of (strategies.strategies || []).slice(0, 3)) {
          result += `- ${strategy.strategy}\n`;
        }
        result += `\nSession ID: ${sessionResponse.sessionId}`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Emotional Core offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'record_dream',
    {
      title: 'Record Dream',
      description: 'Record and analyze a dream in Dream Core',
      inputSchema: {
        theme: z.string().describe('Dream theme/title'),
        narrative: z.string().describe('Dream description'),
        emotions: z.array(z.string()).optional().describe('Emotions felt'),
        lucid: z.boolean().optional().describe('Was it lucid?'),
      },
    },
    async ({ theme, narrative, emotions, lucid }) => {
      try {
        await callService(`${SERVICES.dreamCore}/dream`, {
          method: 'POST',
          body: {
            theme,
            narrative,
            emotions: emotions || [],
            lucidity: lucid ? 85 : 30,
            type: lucid ? 'lucid' : 'passive',
          },
        });

        const analysis = await callService(`${SERVICES.dreamCore}/analyze`, {
          method: 'POST',
          body: { theme, narrative },
        });

        let result = 'Dream Recorded\n\n';
        result += `${theme}\n${narrative.slice(0, 200)}...\n\n`;
        result += 'Symbols Found:\n';
        for (const symbol of (analysis.symbols || []).slice(0, 5)) {
          result += `- ${symbol.symbol} (${symbol.archetype || 'unknown'})\n`;
        }
        result += `\nInterpretation:\n${analysis.interpretation || 'Processing...'}`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Dream Core offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'control_autonomy',
    {
      title: 'Control Autonomy Engine',
      description: 'Start, stop, or check autonomous operation',
      inputSchema: {
        action: z.enum(['start', 'stop', 'status', 'run_once']).describe('Action to perform'),
        intervalMs: z.number().optional().describe('Interval in ms (for start)'),
      },
    },
    async ({ action, intervalMs }) => {
      try {
        let endpoint = '';
        let method: 'GET' | 'POST' = 'GET';
        let body: any;

        switch (action) {
          case 'start':
            endpoint = '/start';
            method = 'POST';
            body = { intervalMs: intervalMs || 600000 };
            break;
          case 'stop':
            endpoint = '/stop';
            method = 'POST';
            break;
          case 'status':
            endpoint = '/state';
            break;
          case 'run_once':
            endpoint = '/run-once';
            method = 'POST';
            break;
        }

        const response = await callService(`${SERVICES.autonomyEngine}${endpoint}`, { method, body });

        let result = 'Autonomy Engine\n\n';
        if (action === 'status') {
          result += `Status: ${response.is_active ? 'Active' : 'Paused'}\n`;
          result += `Actions Today: ${response.total_actions_today || 0}\n`;
          result += `Mood: ${response.mood || 'N/A'}\n`;
          result += `Energy: ${response.energy_level || 0}/10\n`;
        } else {
          result += `Action: ${action}\nResult: ${JSON.stringify(response, null, 2)}`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Autonomy Engine offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'quick_life_action',
    {
      title: 'Quick Life Action',
      description: 'Quickly log a life event, reflection, or gratitude moment',
      inputSchema: {
        type: z.enum(['gratitude', 'reflection', 'emotion', 'achievement']).describe('Type of entry'),
        content: z.string().describe('What happened or what you are feeling'),
        category: z.string().optional().describe('Category (health, relationships, work, etc.)'),
      },
    },
    async ({ type, content, category }) => {
      try {
        let result = '';

        switch (type) {
          case 'gratitude': {
            await callService(`${SERVICES.gratitude}/log`, {
              method: 'POST',
              body: { entry: content, category: category || 'life' },
            });
            result = `Gratitude logged: "${content}"`;
            break;
          }
          case 'reflection': {
            await callService(`${SERVICES.memoryPalace}/memories`, {
              method: 'POST',
              body: {
                content,
                type: 'reflection',
                tags: ['reflection', category || 'life'],
                importance: 70,
              },
            });
            result = `Reflection saved: "${content}"`;
            break;
          }
          case 'emotion': {
            await callService(`${SERVICES.emotionalCore}/wellbeing/log`, {
              method: 'POST',
              body: {
                emotion: category || 'neutral',
                context: content,
              },
            });
            result = `Emotion logged: "${content}"`;
            break;
          }
          case 'achievement': {
            await callService(`${SERVICES.gamification}/achievement`, {
              method: 'POST',
              body: {
                achievement: content,
                xp: 100,
                category: category || 'life',
              },
            });
            result = `Achievement unlocked: "${content}" (+100 XP)`;
            break;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Service offline: ${err.message}` }], isError: true };
      }
    }
  );

  return server;
}

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', tools: 14, services: Object.keys(SERVICES).length });
});

app.get('/mcp', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '2.0.0',
    tools: 14,
    services: Object.keys(SERVICES).length,
    message: 'Use POST /mcp for JSON-RPC requests',
  });
});

app.post('/mcp', async (req, res) => {
  const server = getServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('MCP Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.get('/', (_req, res) => {
  res
    .status(200)
    .send('Toobix MCP Bridge online. Use POST /mcp for MCP requests. Health: /health. Port: 8787.');
});

const PORT = Number(process.env.MCP_PORT || 8787);
app.listen(PORT, () => {
  console.log(`MCP Bridge listening on http://localhost:${PORT}`);
});
