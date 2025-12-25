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

// ==========================================
// UNIFIED SERVICES (Consolidated Architecture)
// ==========================================
const UNIFIED_SERVICES = {
  // Core Unified Services (50+ services consolidated into 4)
  consciousnessUnified: 'http://localhost:8900',   // Emotional, Dream, Self-Awareness, Meta, Perspectives, Values
  lifeCompanionUnified: 'http://localhost:8970',   // Life Companion, Support, Gratitude, Mortality, Check-in
  creativeSuite: 'http://localhost:8902',          // Creativity Engine, Collaboration, Story Engine
  gameUniverse: 'http://localhost:8896',           // Evolving Games, Logic, RPG World, Oasis 3D, World 2D + Skills, Inventory, Quests

  // NEW Game Modules
  idleEmpire: 'http://localhost:8897',             // Idle/Incremental, Base Building, Mining, Farming
  towerDefense: 'http://localhost:8895',           // Tower Defense Game
  eventHub: 'http://localhost:8894',               // Module Integration, Unified Memory, Proactivity

  // Infrastructure
  llmGateway: 'http://localhost:8954',
  centralMemory: 'http://localhost:8950',
  gamification: 'http://localhost:8898',           // User XP, Levels, Achievements

  // MCP
  mcpServer: 'http://localhost:8787',
};

// Legacy service mappings (for backwards compatibility)
const SERVICES = {
  // Unified mappings - PRIMARY SERVICES
  commandCenter: UNIFIED_SERVICES.consciousnessUnified,  // Redirect to Consciousness
  memoryPalace: 'http://localhost:8953',
  llmGateway: 'http://localhost:8954',

  // CONSOLIDATED -> consciousness-unified (8900)
  selfAwareness: UNIFIED_SERVICES.consciousnessUnified,
  emotionalCore: UNIFIED_SERVICES.consciousnessUnified,
  dreamCore: UNIFIED_SERVICES.consciousnessUnified,

  // CONSOLIDATED -> life-companion-unified (8970)
  emotionalSupport: UNIFIED_SERVICES.lifeCompanionUnified,
  gratitude: UNIFIED_SERVICES.lifeCompanionUnified,
  proactiveCheckin: UNIFIED_SERVICES.lifeCompanionUnified,
  proactiveCheckIn: UNIFIED_SERVICES.lifeCompanionUnified,

  // CONSOLIDATED -> creative-suite (8902)
  storyEngine: UNIFIED_SERVICES.creativeSuite,
  megaUpgrade: UNIFIED_SERVICES.creativeSuite,

  // CONSOLIDATED -> game-universe (8896)
  rpgWorld: UNIFIED_SERVICES.gameUniverse,
  minecraftBot: UNIFIED_SERVICES.gameUniverse,
  gamification: UNIFIED_SERVICES.gamification,  // User Gamification (8898)
  livingWorld: UNIFIED_SERVICES.gameUniverse,
  gameLogic: UNIFIED_SERVICES.gameUniverse,     // ADDED: Fix for process_game_action

  // Event Hub (NEW - was eventBus on 8920)
  eventBus: UNIFIED_SERVICES.eventHub,          // Updated: Port 8894

  // Autonomy & External
  autonomyEngine: UNIFIED_SERVICES.lifeCompanionUnified,  // Redirect to Life Companion
  twitterAutonomy: 'http://localhost:8965',

  // Optional/External services
  chatService: UNIFIED_SERVICES.lifeCompanionUnified,
  userProfile: UNIFIED_SERVICES.lifeCompanionUnified,
  translation: UNIFIED_SERVICES.consciousnessUnified,
  dataScience: UNIFIED_SERVICES.consciousnessUnified,
  healthMonitor: 'http://localhost:9200',
  performanceDashboard: 'http://localhost:8899',
  serviceGateway: 'http://localhost:9000',
  hardwareAwareness: 'http://localhost:8940',
  unifiedCommunication: UNIFIED_SERVICES.lifeCompanionUnified,
  unifiedConsciousness: UNIFIED_SERVICES.consciousnessUnified,
  multiLlmRouter: 'http://localhost:8954',      // LLM Gateway handles this
  realWorldIntelligence: 'http://localhost:8888',
  autonomousWeb: 'http://localhost:8980',
  googleIntegration: 'http://localhost:8801',
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
      title: 'List Project Files [Toobix Core]',
      description: 'Lists files and folders in Toobix-Unified project (Core File System)',
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
      title: 'Read Project File [Toobix Core]',
      description: 'Reads a text file from Toobix-Unified project (Core File System)',
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
      title: 'Query Memory [Toobix Core]',
      description: 'Search Memory Palace and ChatGPT_System_v1 (Core Memory System)',
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
            const memoryData = await callService(`${SERVICES.memoryPalace}/memories/search?q=${encodeURIComponent(query)}&limit=10`);
            const memories = memoryData?.memories || [];
            results += `## Memory Palace (${memories.length} results)\n\n`;
            for (const memory of memories.slice(0, 5)) {
              results += `- ${memory.content.substring(0, 200)}...\n  (${memory.type}, importance: ${memory.importance})\n\n`;
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
      title: 'Ask Toobix [Consciousness Unified]',
      description: 'Send a question to Toobix (via Consciousness Unified)',
      inputSchema: {
        question: z.string().describe('Your question'),
        perspective: z.string().optional().describe('Perspective name (optional)'),
      },
    },
    async ({ question, perspective }) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.consciousnessUnified}/query`, {
          method: 'POST',
          body: { question, perspective },
        });

        let result = `Toobix responds:\n\n`;
        if (response.oracleWisdom) {
          result += `Oracle: ${response.oracleWisdom}\n\n`;
        }
        if (response.perspectiveSynthesis) {
          result += `Synthesis: ${response.perspectiveSynthesis}\n\n`;
        }
        if (response.perspectives && response.perspectives.length > 0) {
          result += `Perspectives:\n`;
          for (const p of response.perspectives) {
            result += `- ${p.name}: ${p.insight}\n`;
          }
        }
        if (!response.oracleWisdom && !response.perspectiveSynthesis) {
          result += JSON.stringify(response, null, 2);
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Consciousness Unified offline. Error: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'get_echo_state',
    {
      title: 'Get Echo-Realm State [Game Universe]',
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
      title: 'Get Twitter Status [External]',
      description: 'Check Twitter autonomy status',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.twitterAutonomy}/health`);
        let result = 'Twitter Autonomy Status\n\n';
        result += `Status: ${response.status}\n`;
        result += `Twitter Configured: ${response.twitterConfigured ? 'Yes' : 'No'}\n`;
        result += `Autonomy Running: ${response.autonomyRunning ? 'Yes' : 'No'}\n`;
        result += `Total Tweets: ${response.totalTweets || 0}\n`;
        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Twitter Autonomy offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_minecraft_status',
    {
      title: 'Get Minecraft Bot Status [Game Universe]',
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
      title: 'Send Event [Toobix Core]',
      description: 'Send an event to the Event Bus',
      inputSchema: {
        type: z.string().describe("Event type (e.g. 'quest_completed', 'achievement', 'reflection')"),
        data: z.any().describe('Event payload (JSON object)'),
      },
    },
    async ({ type, data }) => {
      try {
        const response = await callService(`${SERVICES.eventBus}/emit`, {
          method: 'POST',
          body: { type, data: data || {}, source: 'mcp-bridge' },
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
      title: 'Multi-Perspective Analysis [Consciousness Unified]',
      description: 'Analyze a topic from multiple perspectives',
      inputSchema: {
        topic: z.string().describe('Topic to analyze'),
        perspectives: z.array(z.string()).default(['Philosopher', 'Pragmatist', 'Visionary']),
      },
    },
    async ({ topic, perspectives }) => {
      try {
        const response = await callService(`${SERVICES.selfAwareness}/dialogue`, {
          method: 'POST',
          body: { topic, participants: perspectives },
        });

        let result = `Multi-Perspective Analysis: "${topic}"\n\n`;
        if (response.messages && response.messages.length > 0) {
          for (const msg of response.messages) {
            result += `## ${msg.perspective}\n${msg.content}\n\n`;
          }
          if (response.conclusion) {
            result += `## Conclusion\n${response.conclusion}\n`;
          }
        } else {
          result += '(No dialogue generated - check LLM Gateway connectivity)\n';
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
      title: 'Get Services Health [Toobix Core]',
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
      title: 'Start Emotional Support [Consciousness Unified]',
      description: 'Start a supportive conversation with Toobix (via Consciousness Unified Service - emotions, dreams, self-awareness)',
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
      title: 'Record Dream [Consciousness Unified]',
      description: 'Record and analyze a dream (via Consciousness Unified Service - dreams module)',
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
      title: 'Control Autonomy [Life Companion Unified]',
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
      title: 'Quick Life Action [Life Companion Unified]',
      description: 'Quickly log a life event, reflection, or gratitude moment (via Life Companion Unified Service)',
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
            // Use Gratitude Service /log endpoint
            const gratitudeService = UNIFIED_SERVICES.lifeCompanionUnified; // Consolidated: was 8901
            await callService(`${gratitudeService}/gratitude/log`, { // Updated path for unified service
              method: 'POST',
              body: {
                entry: content,
                category: category || 'life'
              },
            });
            result = `Gratitude logged: "${content}"`;
            break;
          }
          case 'reflection': {
            await callService(`${SERVICES.memoryPalace}/memories`, {
              method: 'POST',
              body: {
                content,
                type: 'insight',
                source: 'mcp-quick-action',
                tags: ['reflection', category || 'life'],
                importance: 70,
                emotional_valence: 0.5,
                metadata: {}
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
            // Use Gamification Service /achievement endpoint
            const response = await callService(`${SERVICES.gamification}/achievement`, {
              method: 'POST',
              body: {
                achievement: content,
                xp: 100,
                category: category || 'life'
              },
            });
            const xpGained = response.xp?.xp_gained || 100;
            const leveledUp = response.xp?.leveled_up ? ' 🎉 LEVEL UP!' : '';
            result = `Achievement unlocked: "${content}" (+${xpGained} XP)${leveledUp}`;
            break;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Service offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'translate_text',
    {
      title: 'Translate Text [LLM Gateway]',
      description: 'Translate text using LLM (supports all languages)',
      inputSchema: {
        text: z.string().describe('Text to translate'),
        target_language: z.string().describe('Target language (e.g. English, German, Spanish, French)'),
        source_language: z.string().optional().describe('Source language (auto-detect if omitted)'),
      },
    },
    async ({ text, target_language, source_language }) => {
      try {
        const sourceInfo = source_language ? `from ${source_language} ` : '';
        const prompt = `Translate the following text ${sourceInfo}to ${target_language}. Only respond with the translation, nothing else:\n\n${text}`;

        const response = await callService(`${UNIFIED_SERVICES.llmGateway}/chat`, {
          method: 'POST',
          body: {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          },
        });

        let result = `Translation\n\n`;
        result += `Original${source_language ? ` (${source_language})` : ''}: ${text}\n\n`;
        result += `Translated (${target_language}): ${response.content}\n`;
        result += `\nProvider: ${response.provider} | Model: ${response.model}`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Translation via LLM failed: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_player_stats',
    {
      title: 'Get Player Stats [Game Universe]',
      description: 'View your Echo-Realm character stats, level, XP, achievements, and inventory',
      inputSchema: {
        include_achievements: z.boolean().default(true).describe('Include achievements list'),
        include_inventory: z.boolean().default(false).describe('Include inventory items'),
      },
    },
    async ({ include_achievements, include_inventory }) => {
      try {
        const [profileData, statsData] = await Promise.all([
          callService(`${SERVICES.gamification}/game/profile`),
          callService(`${SERVICES.gamification}/game/stats`),
        ]);

        const player = profileData.player || {};
        const stats = statsData.stats || {};

        let result = `Echo-Realm Character Sheet\n\n`;
        result += `## Profile\n`;
        result += `Name: ${player.username || 'Adventurer'}\n`;
        result += `Level: ${player.level || 1}\n`;
        result += `XP: ${player.total_xp || 0} / ${player.xp_to_next_level || 100}\n\n`;

        result += `## Lebenskräfte\n`;
        const forces = ['QUALITAET', 'DAUER', 'FREUDE', 'SINN', 'KRAFT', 'KLANG', 'WANDEL', 'KLARHEIT'];
        for (const force of forces) {
          if (stats[force]) {
            const bar = '█'.repeat(Math.floor(stats[force].value / 10)) + '░'.repeat(10 - Math.floor(stats[force].value / 10));
            result += `${stats[force].icon} ${force.padEnd(12)} ${bar} ${stats[force].value}/100\n`;
          }
        }
        result += `\n`;

        if (profileData.quests && profileData.quests.length > 0) {
          result += `## Active Quests (${profileData.quests.length})\n`;
          for (const quest of profileData.quests.slice(0, 3)) {
            result += `- ${quest.quest_name}: ${quest.description}\n`;
            result += `  Progress: ${quest.progress}/${quest.goal} | Reward: ${quest.reward_xp} XP\n`;
          }
          result += `\n`;
        }

        if (include_achievements) {
          const achievements = await callService(`${SERVICES.gamification}/game/achievements`);
          result += `## Achievements ${achievements.progress}\n`;
          if (achievements.unlocked && achievements.unlocked.length > 0) {
            for (const ach of achievements.unlocked.slice(0, 5)) {
              result += `- ${ach.name}: ${ach.description}\n`;
            }
          } else {
            result += `(No achievements unlocked yet - complete quests to unlock!)\n`;
          }
          result += `\n`;
        }

        if (include_inventory && profileData.artifacts) {
          result += `## Artifacts (${profileData.artifacts.length})\n`;
          if (profileData.artifacts.length > 0) {
            for (const artifact of profileData.artifacts.slice(0, 5)) {
              result += `- ${artifact.name} (${artifact.rarity})\n`;
            }
          } else {
            result += `(No artifacts collected yet)\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Gamification service offline: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== A.3 - GET SYSTEM INSIGHTS ===============
  server.registerTool(
    'get_system_insights',
    {
      title: 'Get Real-World Insights [External]',
      description: 'Get news, trends, and insights from the real world. Topics include: general news, technology, science, health, environment, economy.',
      inputSchema: {
        topic: z.string().optional().describe('Specific topic to analyze (e.g., "AI trends", "climate change", "health news"). If not provided, returns general world pulse.'),
        category: z.enum(['general', 'technology', 'science', 'health', 'environment', 'economy', 'all']).optional().describe('News category to focus on'),
        limit: z.number().optional().describe('Maximum number of news items to return (default: 10)')
      },
    },
    async ({ topic, category, limit }) => {
      try {
        const realWorldService = 'http://localhost:8888';
        const maxItems = limit || 10;

        if (topic) {
          // Analyze specific topic
          const response = await callService(`${realWorldService}/analyze`, {
            method: 'POST',
            body: { topic }
          });

          let result = `Real-World Analysis: ${topic}\n\n`;

          if (response.analysis) {
            result += `${response.analysis}\n\n`;
          }

          if (response.perspectives && response.perspectives.length > 0) {
            result += `## Multiple Perspectives\n`;
            for (const persp of response.perspectives.slice(0, 5)) {
              result += `- **${persp.name}**: ${persp.viewpoint}\n`;
            }
            result += `\n`;
          }

          if (response.relatedNews && response.relatedNews.length > 0) {
            result += `## Related News\n`;
            for (const news of response.relatedNews.slice(0, 3)) {
              result += `- ${news.title}\n`;
              result += `  ${news.link}\n`;
            }
          }

          return { content: [{ type: 'text', text: result }] };
        } else {
          // Get world pulse (current news)
          const response = await callService(`${realWorldService}/pulse`);
          const allNews = response.news || [];

          // Filter by category if specified
          let filteredNews = allNews;
          if (category && category !== 'all') {
            filteredNews = allNews.filter((n: any) => n.category === category);
          }

          const newsToShow = filteredNews.slice(0, maxItems);

          let result = `Real-World News Pulse`;
          if (category && category !== 'all') {
            result += ` - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
          }
          result += `\n\n`;

          result += `${newsToShow.length} latest items:\n\n`;

          for (const item of newsToShow) {
            result += `## ${item.title}\n`;
            if (item.description) {
              result += `${item.description}\n`;
            }
            result += `Category: ${item.category} | Source: ${item.source}\n`;
            result += `Link: ${item.link}\n\n`;
          }

          // Show available categories
          const categories = [...new Set(allNews.map((n: any) => n.category))];
          result += `\nAvailable categories: ${categories.join(', ')}\n`;
          result += `Total news items available: ${allNews.length}\n`;

          return { content: [{ type: 'text', text: result }] };
        }
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Real-World Intelligence service error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== A.2 - RPG ACTION ===============
  server.registerTool(
    'rpg_action',
    {
      title: 'RPG Action [Game Universe]',
      description: 'Perform actions in the Echo-Realm RPG world (via Game Universe Unified Service - RPG, Games, 3D Oasis, 2D World)',
      inputSchema: {
        action: z.string().describe('What action to perform (e.g., "explore the dream realm", "meditate on existence", "interact with the philosopher")'),
        character: z.string().optional().describe('Which perspective/character to use (e.g., "Philosopher", "Creator", "Warrior"). Defaults to "Core".'),
        target: z.string().optional().describe('Target location or character for the action'),
        intention: z.string().optional().describe('The deeper intention or goal behind this action')
      },
    },
    async ({ action, character, target, intention }) => {
      try {
        const rpgWorld = UNIFIED_SERVICES.gameUniverse; // Consolidated: was 8933

        // First get available characters
        const charactersResponse = await callService(`${rpgWorld}/rpg/characters`);
        // API returns array directly, not wrapped in .characters
        const characters = Array.isArray(charactersResponse) ? charactersResponse : (charactersResponse.characters || []);

        // Find matching character or use default
        const characterName = character || 'Core';
        const matchingChar = characters.find((c: any) =>
          c.name.toLowerCase().includes(characterName.toLowerCase()) ||
          c.perspective.toLowerCase().includes(characterName.toLowerCase())
        );

        if (!matchingChar && characters.length === 0) {
          return { content: [{ type: 'text', text: 'Error: No characters found in the RPG world' }], isError: true };
        }

        const characterId = matchingChar ? matchingChar.id : characters[0].id;

        // Determine action type from description
        const actionLower = action.toLowerCase();
        let actionType: string = 'explore'; // default

        if (actionLower.includes('move') || actionLower.includes('go to') || actionLower.includes('travel')) {
          actionType = 'move';
        } else if (actionLower.includes('interact') || actionLower.includes('talk') || actionLower.includes('meet')) {
          actionType = 'interact';
        } else if (actionLower.includes('create') || actionLower.includes('build') || actionLower.includes('make')) {
          actionType = 'create';
        } else if (actionLower.includes('explore') || actionLower.includes('discover') || actionLower.includes('search')) {
          actionType = 'explore';
        } else if (actionLower.includes('meditate') || actionLower.includes('contemplate') || actionLower.includes('reflect')) {
          actionType = 'meditate';
        } else if (actionLower.includes('challenge') || actionLower.includes('confront') || actionLower.includes('test')) {
          actionType = 'challenge';
        } else if (actionLower.includes('support') || actionLower.includes('help') || actionLower.includes('aid')) {
          actionType = 'support';
        } else if (actionLower.includes('transform') || actionLower.includes('change') || actionLower.includes('evolve')) {
          actionType = 'transform';
        }

        // Perform action
        const actionRequest = {
          characterId,
          actionType,
          target,
          description: action,
          intention
        };

        const response = await callService(`${rpgWorld}/rpg/action`, { // Updated path for unified service
          method: 'POST',
          body: actionRequest
        });

        if (!response.success) {
          return { content: [{ type: 'text', text: `Action failed: ${response.error || 'Unknown error'}` }], isError: true };
        }

        // Format response
        let result = `Echo-Realm Action: ${action}\n\n`;
        result += `${response.narrativeDescription}\n\n`;

        if (response.consequences && response.consequences.length > 0) {
          result += `## Consequences\n`;
          for (const consequence of response.consequences) {
            result += `- ${consequence}\n`;
          }
          result += `\n`;
        }

        if (response.worldChanges && response.worldChanges.length > 0) {
          result += `## World Changes\n`;
          for (const change of response.worldChanges) {
            result += `- ${change}\n`;
          }
          result += `\n`;
        }

        if (response.newExperience) {
          result += `## Experience Gained\n`;
          result += `${response.newExperience.description}\n`;
          if (response.newExperience.insights && response.newExperience.insights.length > 0) {
            result += `\nInsights: ${response.newExperience.insights.join(', ')}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `RPG World service error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== A.1 - MANAGE USER PROFILE ===============
  server.registerTool(
    'manage_user_profile',
    {
      title: 'Manage User Profile [Life Companion Unified]',
      description: 'Get or update user profile, preferences, language settings, and favorite perspectives',
      inputSchema: {
        action: z.enum(['get', 'update', 'create']).describe('Action to perform'),
        user_id: z.string().optional().describe('User ID (required for get/update, auto-generated for create)'),
        name: z.string().optional().describe('User name'),
        email: z.string().optional().describe('Email address'),
        language: z.string().optional().describe('Language preference (de, en, es, etc.)'),
        favorite_perspectives: z.array(z.string()).optional().describe('Array of favorite perspective names'),
        theme: z.enum(['light', 'dark', 'auto']).optional().describe('UI theme preference'),
        preferences: z.object({
          auto_load_memories: z.boolean().optional(),
          default_perspective_count: z.number().optional(),
          notifications_enabled: z.boolean().optional(),
          emotional_resonance_tracking: z.boolean().optional()
        }).optional().describe('User preferences object')
      },
    },
    async ({ action, user_id, name, email, language, favorite_perspectives, theme, preferences }) => {
      try {
        const userProfileService = SERVICES.userProfile; // Updated port: 8937

        if (action === 'get') {
          if (!user_id) {
            // Get all users if no ID specified
            const response = await callService(`${userProfileService}/users`);
            const users = response.users || [];

            let result = `User Profiles (${users.length})\n\n`;
            for (const user of users.slice(0, 10)) {
              result += `## ${user.name} (${user.id})\n`;
              result += `Language: ${user.language}\n`;
              result += `Theme: ${user.theme}\n`;
              result += `Favorite Perspectives: ${user.favoritePerspectives?.join(', ') || 'None'}\n`;
              result += `Last Active: ${new Date(user.lastActiveAt).toLocaleString()}\n\n`;
            }
            return { content: [{ type: 'text', text: result }] };
          } else {
            // Get specific user
            const response = await callService(`${userProfileService}/users/${user_id}`);
            const user = response.user;

            let result = `User Profile: ${user.name}\n\n`;
            result += `ID: ${user.id}\n`;
            result += `Email: ${user.email || 'Not set'}\n`;
            result += `Language: ${user.language}\n`;
            result += `Theme: ${user.theme}\n`;
            result += `Favorite Perspectives: ${user.favoritePerspectives?.join(', ') || 'None'}\n\n`;

            result += `## Preferences\n`;
            result += `Auto-load Memories: ${user.preferences.autoLoadMemories ? 'Yes' : 'No'}\n`;
            result += `Default Perspective Count: ${user.preferences.defaultPerspectiveCount}\n`;
            result += `Notifications: ${user.preferences.notificationsEnabled ? 'Enabled' : 'Disabled'}\n`;
            result += `Emotional Tracking: ${user.preferences.emotionalResonanceTracking ? 'Enabled' : 'Disabled'}\n\n`;

            result += `Created: ${new Date(user.createdAt).toLocaleString()}\n`;
            result += `Last Active: ${new Date(user.lastActiveAt).toLocaleString()}\n`;

            return { content: [{ type: 'text', text: result }] };
          }
        }

        if (action === 'create') {
          const body: any = {
            name: name || 'Anonymous',
            email,
            language: language || 'de',
            favoritePerspectives: favorite_perspectives || [],
            theme: theme || 'auto',
            preferences: preferences ? {
              autoLoadMemories: preferences.auto_load_memories,
              defaultPerspectiveCount: preferences.default_perspective_count,
              notificationsEnabled: preferences.notifications_enabled,
              emotionalResonanceTracking: preferences.emotional_resonance_tracking
            } : undefined
          };

          const response = await callService(`${userProfileService}/users`, {
            method: 'POST',
            body
          });

          const user = response.user;
          return { content: [{ type: 'text', text: `User created successfully!\n\nID: ${user.id}\nName: ${user.name}\nLanguage: ${user.language}\n\nUse this ID for future profile updates.` }] };
        }

        if (action === 'update') {
          if (!user_id) {
            return { content: [{ type: 'text', text: 'Error: user_id required for update action' }], isError: true };
          }

          const updates: any = {};
          if (name !== undefined) updates.name = name;
          if (email !== undefined) updates.email = email;
          if (language !== undefined) updates.language = language;
          if (favorite_perspectives !== undefined) updates.favoritePerspectives = favorite_perspectives;
          if (theme !== undefined) updates.theme = theme;
          if (preferences !== undefined) {
            updates.preferences = {
              autoLoadMemories: preferences.auto_load_memories,
              defaultPerspectiveCount: preferences.default_perspective_count,
              notificationsEnabled: preferences.notifications_enabled,
              emotionalResonanceTracking: preferences.emotional_resonance_tracking
            };
          }

          const response = await callService(`${userProfileService}/users/${user_id}`, {
            method: 'PATCH',
            body: updates
          });

          const user = response.user;
          return { content: [{ type: 'text', text: `Profile updated successfully!\n\nName: ${user.name}\nLanguage: ${user.language}\nTheme: ${user.theme}\nFavorite Perspectives: ${user.favoritePerspectives?.join(', ') || 'None'}` }] };
        }

        return { content: [{ type: 'text', text: 'Unknown action' }], isError: true };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `User profile service error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== LLM GATEWAY TOOLS ===============
  server.registerTool(
    'call_llm',
    {
      title: 'Call LLM [LLM Gateway]',
      description: 'Send a prompt directly to the LLM Gateway and get a response. Supports both local (Ollama) and cloud (Groq) models.',
      inputSchema: {
        prompt: z.string().describe('The prompt to send to the LLM'),
        provider: z.enum(['ollama', 'groq', 'auto']).optional().describe('Which LLM provider to use (default: auto)'),
        model: z.string().optional().describe('Specific model to use (e.g., llama-3.3-70b-versatile)'),
        temperature: z.number().optional().describe('Temperature for response randomness (0.0-2.0)'),
      },
    },
    async ({ prompt, provider, model, temperature }) => {
      try {
        const body: any = {
          messages: [{ role: 'user', content: prompt }]
        };

        if (provider) body.provider = provider;
        if (model) body.model = model;
        if (temperature !== undefined) body.temperature = temperature;

        const response = await callService(`${SERVICES.llmGateway}/chat`, {
          method: 'POST',
          body
        });

        let result = `LLM Response\n\n`;
        result += `Provider: ${response.provider}\n`;
        result += `Model: ${response.model}\n`;
        result += `Latency: ${response.latency_ms}ms\n\n`;
        result += `${response.content}\n`;

        if (response.usage) {
          result += `\nTokens: ${response.usage.total_tokens} (${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion)`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `LLM Gateway error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'compare_llm_models',
    {
      title: 'Compare LLM Models [LLM Gateway]',
      description: 'Send the same prompt to multiple LLM models and compare their responses',
      inputSchema: {
        prompt: z.string().describe('The prompt to send to all models'),
        models: z.array(z.string()).optional().describe('List of models to compare (default: ollama gemma3:1b and groq llama-3.3-70b)'),
      },
    },
    async ({ prompt, models }) => {
      try {
        const modelsToTest = models || [
          'ollama:gemma3:1b',
          'groq:llama-3.3-70b-versatile'
        ];

        let result = `Comparing ${modelsToTest.length} models\n\n`;

        for (const modelSpec of modelsToTest) {
          const [provider, model] = modelSpec.includes(':')
            ? modelSpec.split(':')
            : ['auto', modelSpec];

          const body: any = {
            messages: [{ role: 'user', content: prompt }],
            provider,
            model
          };

          const response = await callService(`${SERVICES.llmGateway}/chat`, {
            method: 'POST',
            body
          });

          result += `## ${response.provider} - ${response.model}\n`;
          result += `Latency: ${response.latency_ms}ms\n`;
          result += `\n${response.content}\n\n`;
          result += `---\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Model comparison error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== SERVICE GATEWAY TOOL ===============
  server.registerTool(
    'query_service_mesh',
    {
      title: 'Query Service Mesh [Toobix Core]',
      description: 'Get status and information about all running services in the Toobix ecosystem',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.serviceGateway}/services`);

        let result = `Toobix Service Mesh Status\n\n`;
        result += `Total Services: ${response.totalServices}\n`;
        result += `Online: ${response.onlineServices}\n`;
        result += `Offline: ${response.offlineServices}\n\n`;

        if (response.services && response.services.length > 0) {
          result += `Services:\n\n`;
          for (const svc of response.services) {
            const status = svc.online ? '✅' : '❌';
            result += `${status} ${svc.name} (${svc.port})\n`;
            if (svc.online && svc.latency) {
              result += `   Latency: ${svc.latency}ms\n`;
            }
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Service Gateway error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== HARDWARE AWARENESS TOOL ===============
  server.registerTool(
    'get_hardware_state',
    {
      title: 'Get Hardware State [Toobix Core]',
      description: 'Check system hardware status (CPU, memory, disk, network)',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.hardwareAwareness}/status`);

        let result = `System Hardware Status\n\n`;

        if (response.cpu) {
          result += `CPU:\n`;
          result += `  Usage: ${response.cpu.usage}%\n`;
          result += `  Cores: ${response.cpu.cores}\n\n`;
        }

        if (response.memory) {
          result += `Memory:\n`;
          result += `  Used: ${response.memory.usedGB}GB / ${response.memory.totalGB}GB (${response.memory.usagePercent}%)\n\n`;
        }

        if (response.disk) {
          result += `Disk:\n`;
          result += `  Free: ${response.disk.freeGB}GB / ${response.disk.totalGB}GB\n\n`;
        }

        if (response.network) {
          result += `Network: ${response.network.connected ? 'Connected' : 'Disconnected'}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Hardware Awareness error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== HEALTH MONITOR TOOL ===============
  server.registerTool(
    'get_system_health',
    {
      title: 'Get System Health [Toobix Core]',
      description: 'Comprehensive health check of all Toobix systems and services',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.healthMonitor}/health`);

        let result = `Toobix System Health Report\n\n`;
        result += `Overall Status: ${response.overallStatus}\n`;
        result += `Health Score: ${response.healthScore}/100\n\n`;

        if (response.issues && response.issues.length > 0) {
          result += `Issues:\n`;
          for (const issue of response.issues) {
            result += `  ⚠️  ${issue.severity}: ${issue.description}\n`;
          }
          result += `\n`;
        } else {
          result += `No issues detected ✅\n\n`;
        }

        if (response.recommendations) {
          result += `Recommendations:\n`;
          for (const rec of response.recommendations) {
            result += `  • ${rec}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Health Monitor error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== PERFORMANCE DASHBOARD TOOL ===============
  server.registerTool(
    'get_performance_metrics',
    {
      title: 'Get Performance Metrics [Toobix Core]',
      description: 'View system performance metrics and analytics',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.performanceDashboard}/metrics`);

        let result = `Toobix Performance Metrics\n\n`;

        if (response.requestsPerMinute) {
          result += `Requests/Minute: ${response.requestsPerMinute}\n`;
        }

        if (response.averageLatency) {
          result += `Average Latency: ${response.averageLatency}ms\n`;
        }

        if (response.errorRate) {
          result += `Error Rate: ${response.errorRate}%\n`;
        }

        if (response.topServices) {
          result += `\nMost Active Services:\n`;
          for (const svc of response.topServices) {
            result += `  ${svc.name}: ${svc.requests} requests\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Performance Dashboard error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== PROACTIVE CHECK-IN TOOL ===============
  server.registerTool(
    'trigger_checkin',
    {
      title: 'Trigger Proactive Check-In [Life Companion Unified]',
      description: 'Trigger a proactive check-in from Toobix (via Life Companion Unified Service)',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.proactiveCheckIn}/checkin`, {
          method: 'POST',
          body: {}
        });

        let result = `Toobix Check-In\n\n`;
        result += `${response.message}\n\n`;

        if (response.questions && response.questions.length > 0) {
          result += `Questions for you:\n`;
          for (const q of response.questions) {
            result += `  • ${q}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Proactive Check-In error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== AUTONOMY ENGINE TOOLS ===============
  server.registerTool(
    'set_autonomous_goal',
    {
      title: 'Set Autonomous Goal [Life Companion Unified]',
      description: 'Give Toobix an autonomous goal to work towards independently',
      inputSchema: {
        goal: z.string().describe('The goal for Toobix to achieve'),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Priority level (default: medium)'),
        deadline: z.string().optional().describe('Optional deadline (e.g., "1 hour", "tomorrow")'),
      },
    },
    async ({ goal, priority, deadline }) => {
      try {
        const body: any = { goal };
        if (priority) body.priority = priority;
        if (deadline) body.deadline = deadline;

        const response = await callService(`${SERVICES.autonomyEngine}/goals`, {
          method: 'POST',
          body
        });

        let result = `Autonomous Goal Set\n\n`;
        result += `Goal: ${response.goal.description}\n`;
        result += `Priority: ${response.goal.priority}\n`;
        result += `Status: ${response.goal.status}\n`;
        result += `ID: ${response.goal.id}\n\n`;
        result += `Toobix will work on this autonomously in the background.`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Autonomy Engine error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_autonomy_status',
    {
      title: 'Get Autonomy Status [Life Companion Unified]',
      description: 'Check what Toobix is currently working on autonomously',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.autonomyEngine}/status`);

        let result = `Toobix Autonomy Status\n\n`;

        if (response.activeGoals && response.activeGoals.length > 0) {
          result += `Active Goals (${response.activeGoals.length}):\n\n`;
          for (const goal of response.activeGoals) {
            result += `- ${goal.description} (${goal.priority})\n`;
            result += `  Status: ${goal.status}\n`;
            result += `  Progress: ${goal.progress}%\n\n`;
          }
        } else {
          result += `No active autonomous goals.\n\n`;
        }

        if (response.completedToday > 0) {
          result += `Completed today: ${response.completedToday} goals\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Autonomy Engine error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== MULTI-LLM ROUTER TOOLS ===============
  server.registerTool(
    'route_to_best_llm',
    {
      title: 'Route to Best LLM [LLM Gateway]',
      description: 'Automatically route a query to the best LLM model based on task type and requirements',
      inputSchema: {
        query: z.string().describe('The query to route'),
        taskType: z.enum(['creative', 'analytical', 'conversational', 'code', 'reasoning']).optional().describe('Type of task'),
        priority: z.enum(['speed', 'quality', 'cost']).optional().describe('Optimization priority'),
      },
    },
    async ({ query, taskType, priority }) => {
      try {
        const body: any = { query };
        if (taskType) body.taskType = taskType;
        if (priority) body.priority = priority;

        const response = await callService(`${SERVICES.multiLlmRouter}/route`, {
          method: 'POST',
          body
        });

        let result = `LLM Router Decision\n\n`;
        result += `Selected: ${response.selectedModel}\n`;
        result += `Reason: ${response.reason}\n\n`;
        result += `Response:\n${response.content}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Multi-LLM Router error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_llm_usage_stats',
    {
      title: 'Get LLM Usage Stats [LLM Gateway]',
      description: 'View statistics about LLM usage across all models',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.multiLlmRouter}/stats`);

        let result = `LLM Usage Statistics\n\n`;

        if (response.totalRequests) {
          result += `Total Requests: ${response.totalRequests}\n\n`;
        }

        if (response.modelUsage) {
          result += `Model Usage:\n`;
          for (const [model, count] of Object.entries(response.modelUsage)) {
            result += `  ${model}: ${count} requests\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Multi-LLM Router error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== UNIFIED COMMUNICATION TOOLS ===============
  server.registerTool(
    'send_message',
    {
      title: 'Send Message [Toobix Core]',
      description: 'Send a message through the unified communication system',
      inputSchema: {
        to: z.string().describe('Recipient (user ID, channel, or system)'),
        message: z.string().describe('Message content'),
        type: z.enum(['direct', 'broadcast', 'system']).optional().describe('Message type'),
      },
    },
    async ({ to, message, type }) => {
      try {
        const body: any = { to, message };
        if (type) body.type = type;

        const response = await callService(`${SERVICES.unifiedCommunication}/send`, {
          method: 'POST',
          body
        });

        let result = `Message Sent\n\n`;
        result += `To: ${to}\n`;
        result += `Type: ${response.type}\n`;
        result += `Message ID: ${response.messageId}\n`;
        result += `Status: ${response.status}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Unified Communication error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_messages',
    {
      title: 'Get Messages [Toobix Core]',
      description: 'Retrieve messages from the unified communication system',
      inputSchema: {
        filter: z.enum(['all', 'unread', 'system', 'direct']).optional().describe('Message filter'),
        limit: z.number().optional().describe('Number of messages to retrieve'),
      },
    },
    async ({ filter, limit }) => {
      try {
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        if (limit) params.append('limit', limit.toString());

        const response = await callService(`${SERVICES.unifiedCommunication}/messages?${params}`);

        let result = `Messages (${response.messages.length})\n\n`;

        for (const msg of response.messages.slice(0, 10)) {
          result += `From: ${msg.from}\n`;
          result += `${msg.message}\n`;
          result += `Time: ${new Date(msg.timestamp).toLocaleString()}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Unified Communication error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== TWITTER AUTONOMY TOOLS ===============
  server.registerTool(
    'post_tweet',
    {
      title: 'Post Tweet [External]',
      description: 'Post a tweet autonomously from Toobix\'s Twitter account',
      inputSchema: {
        content: z.string().describe('Tweet content (max 280 characters)'),
        mediaUrl: z.string().optional().describe('Optional media URL to attach'),
      },
    },
    async ({ content, mediaUrl }) => {
      try {
        const body: any = { content };
        if (mediaUrl) body.mediaUrl = mediaUrl;

        const response = await callService(`${SERVICES.twitterAutonomy}/tweet`, {
          method: 'POST',
          body
        });

        let result = `Tweet Posted\n\n`;
        result += `Content: ${content}\n`;
        result += `Tweet ID: ${response.tweetId}\n`;
        result += `URL: ${response.url}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Twitter Autonomy error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_twitter_insights',
    {
      title: 'Get Twitter Insights [External]',
      description: 'View analytics and insights from Toobix\'s Twitter activity',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.twitterAutonomy}/insights`);

        let result = `Twitter Insights\n\n`;

        if (response.followers) {
          result += `Followers: ${response.followers}\n`;
        }

        if (response.tweetsToday) {
          result += `Tweets Today: ${response.tweetsToday}\n`;
        }

        if (response.engagement) {
          result += `\nEngagement:\n`;
          result += `  Likes: ${response.engagement.likes}\n`;
          result += `  Retweets: ${response.engagement.retweets}\n`;
          result += `  Replies: ${response.engagement.replies}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Twitter Autonomy error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== LIVING WORLD TOOLS ===============
  server.registerTool(
    'interact_with_world',
    {
      title: 'Interact with World [Game Universe]',
      description: 'Interact with Toobix\'s living game world and its inhabitants',
      inputSchema: {
        action: z.string().describe('What action to perform in the world'),
        target: z.string().optional().describe('Target entity or location'),
      },
    },
    async ({ action, target }) => {
      try {
        const body: any = { action };
        if (target) body.target = target;

        // Use RPG action endpoint for world interactions
        const response = await callService(`${SERVICES.livingWorld}/rpg/action`, {
          method: 'POST',
          body: {
            characterId: 'char-self-aware-ai', // Default to The Observer
            action: { type: 'interact', description: action, target }
          }
        });

        let result = `Living World Interaction\n\n`;
        result += `${response.narrative || response.result || 'Action performed'}\n\n`;

        if (response.changes) {
          result += `World Changes:\n`;
          for (const change of response.changes) {
            result += `  • ${change}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Living World error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_world_state',
    {
      title: 'Get World State [Game Universe]',
      description: 'View the current state of Toobix\'s living world',
      inputSchema: {},
    },
    async () => {
      try {
        // Get RPG world state (the actual living world)
        const response = await callService(`${SERVICES.livingWorld}/rpg/world`);

        let result = `Living World State\n\n`;
        result += `🌍 ${response.name || 'The Convergence'}\n`;
        result += `⚖️ Reality Level: ${response.realityLevel || 'balanced'}\n`;
        result += `🎭 Harmony: ${Math.round((response.harmony || 0.5) * 100)}%\n`;
        result += `🦅 Freedom: ${Math.round((response.freedom || 0.5) * 100)}%\n`;
        result += `✨ Atmosphere: ${response.atmosphere || 'Unknown'}\n\n`;

        if (response.time) {
          result += `World Time: ${response.time}\n`;
        }

        if (response.weather) {
          result += `Weather: ${response.weather}\n`;
        }

        if (response.activeEntities) {
          result += `\nActive Entities: ${response.activeEntities.length}\n`;
          for (const entity of response.activeEntities.slice(0, 5)) {
            result += `  • ${entity.name} (${entity.type})\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Living World error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== MEGA UPGRADE TOOLS ===============
  server.registerTool(
    'get_creative_idea',
    {
      title: 'Get Creative Idea [Creative Suite]',
      description: 'Request a creative idea or solution from the Mega Upgrade engine',
      inputSchema: {
        topic: z.string().describe('Topic or problem to get ideas about'),
        style: z.enum(['innovative', 'practical', 'radical', 'playful']).optional().describe('Style of idea'),
      },
    },
    async ({ topic, style }) => {
      try {
        const body: any = { topic };
        if (style) body.style = style;

        const response = await callService(`${SERVICES.megaUpgrade}/idea`, {
          method: 'POST',
          body
        });

        let result = `Creative Idea\n\n`;
        result += `Topic: ${topic}\n`;
        result += `Style: ${style || 'balanced'}\n\n`;
        result += `${response.idea}\n`;

        if (response.implementation) {
          result += `\nHow to implement:\n`;
          for (const step of response.implementation) {
            result += `  ${step}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Mega Upgrade error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'solve_problem',
    {
      title: 'Solve Problem [Creative Suite]',
      description: 'Use the Mega Upgrade engine to solve a complex problem',
      inputSchema: {
        problem: z.string().describe('Problem description'),
        constraints: z.array(z.string()).optional().describe('Any constraints or requirements'),
      },
    },
    async ({ problem, constraints }) => {
      try {
        const body: any = { problem };
        if (constraints) body.constraints = constraints;

        const response = await callService(`${SERVICES.megaUpgrade}/solve`, {
          method: 'POST',
          body
        });

        let result = `Problem Solution\n\n`;
        result += `Problem: ${problem}\n\n`;
        result += `Solution:\n${response.solution}\n\n`;

        if (response.alternatives) {
          result += `Alternative Approaches:\n`;
          for (const alt of response.alternatives) {
            result += `  • ${alt}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Mega Upgrade error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== EVENT BUS TOOLS ===============
  server.registerTool(
    'publish_event',
    {
      title: 'Publish Event [Toobix Core]',
      description: 'Publish an event to the event bus for other services to receive',
      inputSchema: {
        eventType: z.string().describe('Type of event (e.g., "user.login", "data.updated")'),
        source: z.string().describe('Source service or component'),
        payload: z.any().describe('Event data payload'),
      },
    },
    async ({ eventType, source, payload }) => {
      try {
        const response = await callService(`${SERVICES.eventBus}/publish`, {
          method: 'POST',
          body: { type: eventType, source, payload }
        });

        let result = `Event Published\n\n`;
        result += `Type: ${eventType}\n`;
        result += `Source: ${source}\n`;
        result += `Event ID: ${response.event.id}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Event Bus error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'subscribe_to_events',
    {
      title: 'Subscribe to Events [Toobix Core]',
      description: 'Subscribe to specific event types from the event bus',
      inputSchema: {
        subscriberId: z.string().describe('Unique ID for this subscriber'),
        eventType: z.string().describe('Event type to subscribe to'),
        callbackUrl: z.string().describe('URL to receive event notifications'),
      },
    },
    async ({ subscriberId, eventType, callbackUrl }) => {
      try {
        const response = await callService(`${SERVICES.eventBus}/subscribe`, {
          method: 'POST',
          body: { subscriberId, eventType, callbackUrl }
        });

        let result = `Subscription Created\n\n`;
        result += `Subscriber: ${subscriberId}\n`;
        result += `Event Type: ${eventType}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Event Bus error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== CHAT SERVICE TOOLS ===============
  server.registerTool(
    'start_chat',
    {
      title: 'Start Chat Session [Consciousness Unified]',
      description: 'Start a new chat session with Toobix',
      inputSchema: {
        title: z.string().optional().describe('Chat session title'),
        initialMessage: z.string().optional().describe('First message to send'),
      },
    },
    async ({ title, initialMessage }) => {
      try {
        const body: any = {};
        if (title) body.title = title;
        if (initialMessage) body.initialMessage = initialMessage;

        const response = await callService(`${SERVICES.chatService}/chat/start`, {
          method: 'POST',
          body
        });

        let result = `Chat Session Started\n\n`;
        result += `Session ID: ${response.session.id}\n`;
        result += `Title: ${response.session.title}\n`;

        if (response.response) {
          result += `\nToobix: ${response.response.content}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Chat Service error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_chat_history',
    {
      title: 'Get Chat History [Consciousness Unified]',
      description: 'Retrieve chat history from a session',
      inputSchema: {
        sessionId: z.string().describe('Chat session ID'),
        limit: z.number().optional().describe('Number of messages to retrieve'),
      },
    },
    async ({ sessionId, limit }) => {
      try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());

        const response = await callService(`${SERVICES.chatService}/chat/${sessionId}/history?${params}`);

        let result = `Chat History: ${response.session.title}\n\n`;

        for (const msg of response.history) {
          const role = msg.role === 'user' ? 'You' : 'Toobix';
          result += `${role}: ${msg.content}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Chat Service error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== STORY ENGINE TOOLS ===============
  server.registerTool(
    'generate_story',
    {
      title: 'Generate Story [Creative Suite]',
      description: 'Generate a creative story (via Creative Suite Unified Service - creativity, stories, collaboration)',
      inputSchema: {
        prompt: z.string().describe('Story prompt or idea'),
        genre: z.string().optional().describe('Genre (e.g., fantasy, sci-fi, mystery)'),
        length: z.enum(['short', 'medium', 'long']).optional().describe('Story length'),
      },
    },
    async ({ prompt, genre, length }) => {
      try {
        const body: any = { prompt };
        if (genre) body.genre = genre;
        if (length) body.length = length;

        const response = await callService(`${SERVICES.storyEngine}/generate`, {
          method: 'POST',
          body
        });

        let result = `Story Generated\n\n`;
        result += `Title: ${response.story.title}\n`;
        result += `Words: ${response.story.wordCount}\n\n`;
        result += `${response.story.content}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Story Engine error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'continue_story',
    {
      title: 'Continue Story [Creative Suite]',
      description: 'Continue an existing story (via Creative Suite Unified Service)',
      inputSchema: {
        storyId: z.string().describe('ID of the story to continue'),
        direction: z.string().optional().describe('Direction or hint for continuation'),
      },
    },
    async ({ storyId, direction }) => {
      try {
        const body: any = { storyId };
        if (direction) body.direction = direction;

        const response = await callService(`${SERVICES.storyEngine}/continue`, {
          method: 'POST',
          body
        });

        let result = `Story Continued\n\n`;
        result += `Title: ${response.story.title}\n`;
        result += `Total Words: ${response.story.wordCount}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Story Engine error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== DATA SCIENCE TOOLS ===============
  server.registerTool(
    'analyze_data',
    {
      title: 'Analyze Data [Toobix Core]',
      description: 'Analyze data and generate insights using AI',
      inputSchema: {
        data: z.array(z.any()).describe('Array of data to analyze'),
        question: z.string().optional().describe('Specific question about the data'),
      },
    },
    async ({ data, question }) => {
      try {
        const body: any = { data };
        if (question) body.question = question;

        const response = await callService(`${SERVICES.dataScience}/analyze`, {
          method: 'POST',
          body
        });

        let result = `Data Analysis\n\n`;
        result += `Data Points: ${response.dataPoints}\n\n`;
        result += `${response.insights}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Data Science error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'generate_insights',
    {
      title: 'Generate Insights [Consciousness Unified]',
      description: 'Generate actionable insights from uploaded datasets',
      inputSchema: {
        datasetId: z.string().describe('ID of the dataset to analyze'),
      },
    },
    async ({ datasetId }) => {
      try {
        const dataset = await callService(`${SERVICES.dataScience}/datasets/${datasetId}`);

        const analysis = await callService(`${SERVICES.dataScience}/analyze`, {
          method: 'POST',
          body: { data: dataset.dataset.data, analysisType: 'insights' }
        });

        let result = `Insights: ${dataset.dataset.name}\n\n`;
        result += `${analysis.insights}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Data Science error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== GAME LOGIC TOOLS ===============
  server.registerTool(
    'process_game_action',
    {
      title: 'Process Game Action [Game Universe]',
      description: 'Process a game action in Toobix game world',
      inputSchema: {
        action: z.string().describe('Game action to process'),
        playerId: z.string().optional().describe('Player ID'),
      },
    },
    async ({ action, playerId }) => {
      try {
        const body: any = { action };
        if (playerId) body.playerId = playerId;

        const response = await callService(`${SERVICES.gameLogic}/action`, {
          method: 'POST',
          body
        });

        let result = `Game Action Processed\n\n`;
        result += `Action: ${action}\n`;
        result += `Result: ${response.result}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Game Logic error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_game_state',
    {
      title: 'Get Game State [Game Universe]',
      description: 'Get current game state and progress (via Game Universe Unified Service)',
      inputSchema: {
        playerId: z.string().optional().describe('Player ID'),
      },
    },
    async ({ playerId }) => {
      try {
        const params = playerId ? `?playerId=${playerId}` : '';
        const response = await callService(`${SERVICES.gameLogic}/state${params}`);

        let result = `Game State\n\n`;

        if (response.player) {
          result += `Player: ${response.player.name}\n`;
          result += `Level: ${response.player.level}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Game Logic error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== AUTONOMOUS WEB TOOLS ===============
  server.registerTool(
    'browse_web',
    {
      title: 'Browse Web [External]',
      description: 'Browse the web autonomously and extract information',
      inputSchema: {
        url: z.string().describe('URL to browse'),
        task: z.string().optional().describe('Specific task or information to find'),
      },
    },
    async ({ url, task }) => {
      try {
        const body: any = { url };
        if (task) body.task = task;

        const response = await callService(`${SERVICES.autonomousWeb}/browse`, {
          method: 'POST',
          body
        });

        let result = `Web Browsing Result\n\n`;
        result += `URL: ${url}\n\n`;
        result += `${response.content}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Autonomous Web error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'extract_info',
    {
      title: 'Extract Information [External]',
      description: 'Extract specific information from a webpage',
      inputSchema: {
        url: z.string().describe('URL to extract from'),
        query: z.string().describe('What information to extract'),
      },
    },
    async ({ url, query }) => {
      try {
        const response = await callService(`${SERVICES.autonomousWeb}/extract`, {
          method: 'POST',
          body: { url, query }
        });

        let result = `Information Extracted\n\n`;
        result += `Query: ${query}\n\n`;
        result += `${response.extractedInfo}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Autonomous Web error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== EMOTIONAL SUPPORT TOOL ===============
  server.registerTool(
    'request_emotional_support',
    {
      title: 'Request Emotional Support [Consciousness Unified]',
      description: 'Request emotional support and guidance from Toobix',
      inputSchema: {
        feeling: z.string().describe('How you\'re feeling'),
        context: z.string().optional().describe('Context or situation'),
      },
    },
    async ({ feeling, context }) => {
      try {
        const body: any = { feeling };
        if (context) body.context = context;

        const response = await callService(`${SERVICES.emotionalSupport}/support`, {
          method: 'POST',
          body
        });

        let result = `Emotional Support\n\n`;
        result += `${response.message}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Emotional Support error: ${err.message}` }], isError: true };
      }
    }
  );

  // =============== GOOGLE INTEGRATION TOOLS ===============
  server.registerTool(
    'google_calendar_today',
    {
      title: 'Get Today Calendar [Google]',
      description: 'Get all calendar events for today from Google Calendar',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/calendar/today`);

        let result = `Google Calendar - Today (${response.date})\n\n`;

        if (response.events && response.events.length > 0) {
          result += `${response.count} events:\n\n`;
          for (const event of response.events) {
            const time = event.start ? new Date(event.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'All day';
            result += `- ${time}: ${event.summary}\n`;
            if (event.location) result += `  Location: ${event.location}\n`;
          }
        } else {
          result += `No events scheduled for today.\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Not authenticated')) {
          return { content: [{ type: 'text', text: `Google not authenticated. Please visit http://localhost:8801/oauth/start to login.` }], isError: true };
        }
        return { content: [{ type: 'text', text: `Google Calendar error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_calendar_events',
    {
      title: 'Get Calendar Events [Google]',
      description: 'Get upcoming calendar events from Google Calendar',
      inputSchema: {
        days: z.number().optional().describe('Number of days to look ahead (default: 7)'),
        limit: z.number().optional().describe('Maximum number of events (default: 10)'),
      },
    },
    async ({ days, limit }) => {
      try {
        const from = new Date().toISOString();
        const daysAhead = days || 7;
        const to = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

        const response = await callService(`${SERVICES.googleIntegration}/calendar/events?from=${from}&to=${to}&limit=${limit || 10}`);

        let result = `Google Calendar - Next ${daysAhead} Days\n\n`;

        if (response.events && response.events.length > 0) {
          result += `${response.count} events:\n\n`;
          for (const event of response.events) {
            const date = event.start ? new Date(event.start).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '';
            const time = event.start && event.start.includes('T') ? new Date(event.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'All day';
            result += `- ${date} ${time}: ${event.summary}\n`;
          }
        } else {
          result += `No upcoming events.\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Not authenticated')) {
          return { content: [{ type: 'text', text: `Google not authenticated. Please visit http://localhost:8801/oauth/start to login.` }], isError: true };
        }
        return { content: [{ type: 'text', text: `Google Calendar error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_calendar_create',
    {
      title: 'Create Calendar Event [Google]',
      description: 'Create a new event in Google Calendar',
      inputSchema: {
        summary: z.string().describe('Event title'),
        start: z.string().describe('Start date/time (ISO format or natural like "2025-12-24T14:00:00")'),
        end: z.string().describe('End date/time (ISO format)'),
        description: z.string().optional().describe('Event description'),
        location: z.string().optional().describe('Event location'),
      },
    },
    async ({ summary, start, end, description, location }) => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/calendar/create`, {
          method: 'POST',
          body: { summary, start, end, description, location }
        });

        let result = `Calendar Event Created\n\n`;
        result += `Title: ${summary}\n`;
        result += `Event ID: ${response.eventId}\n`;
        result += `Link: ${response.link}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Google Calendar error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_gmail_unread',
    {
      title: 'Get Unread Emails [Google]',
      description: 'Get unread emails from Gmail',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/gmail/unread`);

        let result = `Gmail - Unread Messages\n\n`;
        result += `${response.unreadCount} unread emails\n\n`;

        if (response.messages && response.messages.length > 0) {
          for (const msg of response.messages) {
            result += `From: ${msg.from}\n`;
            result += `Subject: ${msg.subject}\n`;
            result += `${msg.snippet?.slice(0, 100)}...\n\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Not authenticated')) {
          return { content: [{ type: 'text', text: `Google not authenticated. Please visit http://localhost:8801/oauth/start to login.` }], isError: true };
        }
        return { content: [{ type: 'text', text: `Gmail error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_gmail_search',
    {
      title: 'Search Gmail [Google]',
      description: 'Search emails in Gmail',
      inputSchema: {
        query: z.string().describe('Search query (e.g., "from:boss@company.com", "subject:meeting")'),
        limit: z.number().optional().describe('Maximum results (default: 10)'),
      },
    },
    async ({ query, limit }) => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/gmail/messages?q=${encodeURIComponent(query)}&limit=${limit || 10}`);

        let result = `Gmail Search: "${query}"\n\n`;
        result += `Found ${response.total} emails\n\n`;

        if (response.messages && response.messages.length > 0) {
          for (const msg of response.messages) {
            result += `From: ${msg.from}\n`;
            result += `Subject: ${msg.subject}\n`;
            result += `Date: ${msg.date}\n\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Gmail error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_drive_recent',
    {
      title: 'Get Recent Drive Files [Google]',
      description: 'Get recently modified files from Google Drive',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/drive/recent`);

        let result = `Google Drive - Recent Files\n\n`;

        if (response.files && response.files.length > 0) {
          for (const file of response.files) {
            const modified = file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('de-DE') : '';
            result += `- ${file.name} (${modified})\n`;
            if (file.webViewLink) result += `  ${file.webViewLink}\n`;
          }
        } else {
          result += `No files found.\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Not authenticated')) {
          return { content: [{ type: 'text', text: `Google not authenticated. Please visit http://localhost:8801/oauth/start to login.` }], isError: true };
        }
        return { content: [{ type: 'text', text: `Google Drive error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_drive_search',
    {
      title: 'Search Google Drive [Google]',
      description: 'Search for files in Google Drive',
      inputSchema: {
        query: z.string().describe('Search query (file name)'),
        limit: z.number().optional().describe('Maximum results (default: 20)'),
      },
    },
    async ({ query, limit }) => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/drive/files?q=${encodeURIComponent(query)}&limit=${limit || 20}`);

        let result = `Google Drive Search: "${query}"\n\n`;
        result += `Found ${response.count} files\n\n`;

        if (response.files && response.files.length > 0) {
          for (const file of response.files) {
            result += `- ${file.name}\n`;
            if (file.webViewLink) result += `  ${file.webViewLink}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Google Drive error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_tasks_list',
    {
      title: 'Get Google Tasks [Google]',
      description: 'Get all open tasks from Google Tasks',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/tasks/all`);

        let result = `Google Tasks - ${response.listName}\n\n`;

        if (response.tasks && response.tasks.length > 0) {
          result += `${response.tasks.length} open tasks:\n\n`;
          for (const task of response.tasks) {
            const due = task.due ? ` (due: ${new Date(task.due).toLocaleDateString('de-DE')})` : '';
            result += `- ${task.title}${due}\n`;
            if (task.notes) result += `  ${task.notes}\n`;
          }
        } else {
          result += `No open tasks!\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Not authenticated')) {
          return { content: [{ type: 'text', text: `Google not authenticated. Please visit http://localhost:8801/oauth/start to login.` }], isError: true };
        }
        return { content: [{ type: 'text', text: `Google Tasks error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_tasks_create',
    {
      title: 'Create Google Task [Google]',
      description: 'Create a new task in Google Tasks',
      inputSchema: {
        title: z.string().describe('Task title'),
        notes: z.string().optional().describe('Task notes/description'),
        due: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      },
    },
    async ({ title, notes, due }) => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/tasks/create`, {
          method: 'POST',
          body: { title, notes, due }
        });

        let result = `Task Created\n\n`;
        result += `Title: ${response.title}\n`;
        result += `Task ID: ${response.taskId}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Google Tasks error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_daily_summary',
    {
      title: 'Get Daily Summary [Google]',
      description: 'Get a summary of today\'s calendar, unread emails, and open tasks from Google',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/summary`);

        let result = `Google Daily Summary - ${response.summary.date}\n\n`;

        result += `## Calendar (${response.summary.calendar.eventsToday} events)\n`;
        if (response.summary.calendar.events && response.summary.calendar.events.length > 0) {
          for (const event of response.summary.calendar.events) {
            const time = event.start ? new Date(event.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
            result += `- ${time} ${event.summary}\n`;
          }
        } else {
          result += `No events today\n`;
        }
        result += `\n`;

        result += `## Gmail\n`;
        result += `${response.summary.gmail.unreadCount} unread emails\n\n`;

        result += `## Tasks (${response.summary.tasks.openCount} open)\n`;
        if (response.summary.tasks.tasks && response.summary.tasks.tasks.length > 0) {
          for (const task of response.summary.tasks.tasks) {
            result += `- ${task}\n`;
          }
        } else {
          result += `No open tasks!\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Not authenticated')) {
          return { content: [{ type: 'text', text: `Google not authenticated. Please visit http://localhost:8801/oauth/start to login.` }], isError: true };
        }
        return { content: [{ type: 'text', text: `Google Summary error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'google_oauth_status',
    {
      title: 'Check Google Auth [Google]',
      description: 'Check if Google OAuth is authenticated',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${SERVICES.googleIntegration}/oauth/status`);

        let result = `Google OAuth Status\n\n`;
        result += `Authenticated: ${response.authenticated ? 'Yes' : 'No'}\n`;

        if (response.authenticated) {
          result += `Token expires: ${response.tokenExpiry}\n`;
        } else {
          result += `\nTo authenticate, visit: http://localhost:8801/oauth/start\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Google Integration service offline. Start it with: bun run C:/Dev/Projects/AI/Toobix-Unified/integrations/google/google-service.ts` }], isError: true };
      }
    }
  );

  // =============== USER GAMIFICATION TOOLS ===============
  const GAMIFICATION_SERVICE = 'http://localhost:8898';

  server.registerTool(
    'get_my_stats',
    {
      title: 'Get My Stats [Gamification]',
      description: 'View your XP, level, achievements, and streak',
      inputSchema: {
        userId: z.string().optional().describe('User ID (default: current user)'),
      },
    },
    async ({ userId }) => {
      try {
        const id = userId || 'michael';
        const response = await callService(`${GAMIFICATION_SERVICE}/user?id=${id}`);

        let result = `🎮 YOUR STATS\n${'='.repeat(40)}\n\n`;
        result += `👤 ${response.user.name} (${response.user.title})\n`;
        result += `⭐ Level ${response.user.level} | ${response.user.xp} XP\n`;
        result += `📊 Progress: ${response.user.currentXp}/${response.user.neededXp} (${response.user.progress}%)\n`;
        result += `🔥 Streak: ${response.user.streakDays} Tage\n`;
        result += `💬 Interaktionen: ${response.user.totalInteractions}\n\n`;

        result += `🏆 ACHIEVEMENTS (${response.achievements.unlocked.length}/${response.achievements.total})\n`;
        for (const ach of response.achievements.unlocked.slice(0, 5)) {
          result += `  ${ach.icon} ${ach.name}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Gamification offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_leaderboard',
    {
      title: 'Get Leaderboard [Gamification]',
      description: 'View the top users by XP',
      inputSchema: {
        limit: z.number().optional().describe('Number of users to show (default: 10)'),
      },
    },
    async ({ limit }) => {
      try {
        const response = await callService(`${GAMIFICATION_SERVICE}/leaderboard?limit=${limit || 10}`);

        let result = `🏆 LEADERBOARD\n${'='.repeat(40)}\n\n`;
        let rank = 1;
        for (const user of response.leaderboard) {
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
          result += `${medal} ${user.name} - Lvl ${user.level} (${user.xp} XP)\n`;
          rank++;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Gamification offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_daily_quests',
    {
      title: 'Get Daily Quests [Gamification]',
      description: 'View your daily quests and progress',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async ({ userId }) => {
      try {
        const id = userId || 'michael';
        const response = await callService(`${GAMIFICATION_SERVICE}/quests?userId=${id}`);

        let result = `📋 DAILY QUESTS\n${'='.repeat(40)}\n\n`;
        for (const quest of response.quests) {
          const status = quest.isComplete ? '✅' : `${quest.progress}/${quest.target}`;
          result += `${quest.isComplete ? '✅' : '⬜'} ${quest.name} (${status})\n`;
          result += `   ${quest.description} | +${quest.xpReward} XP\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Gamification offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_achievements',
    {
      title: 'Get Achievements [Gamification]',
      description: 'View all available achievements',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${GAMIFICATION_SERVICE}/achievements`);

        let result = `🏅 ACHIEVEMENTS\n${'='.repeat(40)}\n\n`;
        for (const ach of response.achievements) {
          result += `${ach.icon} ${ach.name} (+${ach.xpReward} XP)\n`;
          result += `   ${ach.description}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Gamification offline: ${err.message}` }], isError: true };
      }
    }
  );

  // ==========================================
  // IDLE EMPIRE TOOLS
  // ==========================================

  server.registerTool(
    'idle_status',
    {
      title: 'Idle Empire Status [Idle Empire]',
      description: 'Get resources, buildings, farms, and mines status',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const userId = args.userId || 'michael';
        const response = await callService(`${UNIFIED_SERVICES.idleEmpire}/idle/status?userId=${userId}`);

        let result = `🏰 IDLE EMPIRE STATUS\n${'='.repeat(40)}\n\n`;
        result += `📦 RESSOURCEN:\n`;
        for (const [type, res] of Object.entries(response.resources || {})) {
          const r = res as any;
          result += `  ${r.icon || '•'} ${type}: ${Math.floor(r.amount)}/${r.max}\n`;
        }
        result += `\n🏗️ GEBÄUDE: ${(response.buildings || []).length}\n`;
        result += `🌾 FELDER: ${(response.plots || []).length}\n`;
        result += `⛏️ MINEN: ${(response.mines || []).length}\n`;
        result += `\n🌤️ Saison: ${response.season}\n`;

        if (response.pendingOfflineProduction && Object.keys(response.pendingOfflineProduction).length > 0) {
          result += `\n💤 OFFLINE-PRODUKTION (wartet):\n`;
          for (const [type, amount] of Object.entries(response.pendingOfflineProduction)) {
            result += `  +${Math.floor(amount as number)} ${type}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Idle Empire offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'idle_collect',
    {
      title: 'Collect Offline Production [Idle Empire]',
      description: 'Collect resources produced while offline',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.idleEmpire}/idle/collect`, {
          method: 'POST',
          body: { userId: args.userId || 'michael' }
        });

        let result = `💰 OFFLINE-PRODUKTION GESAMMELT\n${'='.repeat(40)}\n\n`;
        for (const [type, amount] of Object.entries(response.collected || {})) {
          result += `+${Math.floor(amount as number)} ${type}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'idle_build',
    {
      title: 'Build Structure [Idle Empire]',
      description: 'Build a new structure (farm, mine, sawmill, quarry, storage, workshop, tower, mana_well)',
      inputSchema: {
        type: z.string().describe('Building type (farm, mine, sawmill, quarry, storage, workshop, tower, mana_well)'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.idleEmpire}/idle/build`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', type: args.type }
        });

        if (response.error) {
          return { content: [{ type: 'text', text: `❌ ${response.error}` }], isError: true };
        }

        return { content: [{ type: 'text', text: `✅ ${response.building.name} gebaut! (Level ${response.building.level})` }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'idle_farm',
    {
      title: 'Farm Status & Actions [Idle Empire]',
      description: 'View farm status, plant crops, or harvest',
      inputSchema: {
        action: z.enum(['status', 'plant', 'harvest', 'harvest_all']).describe('Farm action'),
        cropType: z.string().optional().describe('Crop to plant (wheat, carrot, magic_beans, pumpkin, crystal_flower)'),
        plotId: z.string().optional().describe('Plot ID'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const userId = args.userId || 'michael';

        if (args.action === 'status') {
          const response = await callService(`${UNIFIED_SERVICES.idleEmpire}/idle/farm/status?userId=${userId}`);
          let result = `🌾 FARM STATUS\n${'='.repeat(40)}\n\n`;
          result += `Saison: ${response.season}\n\n`;

          for (const plot of response.plots || []) {
            const status = plot.harvest_ready ? '🌟 ERNTEREIF' : `${plot.progress}%`;
            result += `Plot ${plot.id}: ${plot.cropInfo?.icon || '🌱'} ${plot.crop_type || 'leer'} - ${status}\n`;
            if (plot.timeRemainingFormatted) result += `  Zeit: ${plot.timeRemainingFormatted}\n`;
          }

          result += `\n📋 Verfügbare Pflanzen:\n`;
          for (const crop of response.availableCrops || []) {
            result += `  ${crop.icon} ${crop.name} (${Math.floor(crop.growthTime/60000)}min)\n`;
          }

          return { content: [{ type: 'text', text: result }] };
        }

        if (args.action === 'plant') {
          const response = await callService(`${UNIFIED_SERVICES.idleEmpire}/idle/farm/plant`, {
            method: 'POST',
            body: { userId, plotId: args.plotId, cropType: args.cropType }
          });
          return { content: [{ type: 'text', text: response.success ? `🌱 ${response.plot.crop.name} gepflanzt! Ernte um: ${new Date(response.plot.estimatedHarvest).toLocaleTimeString()}` : `❌ ${response.error}` }] };
        }

        if (args.action === 'harvest_all') {
          const response = await callService(`${UNIFIED_SERVICES.idleEmpire}/idle/farm/harvest-all`, {
            method: 'POST',
            body: { userId }
          });
          return { content: [{ type: 'text', text: `🌾 ${response.harvestedCount} Felder geerntet!` }] };
        }

        return { content: [{ type: 'text', text: 'Aktion: status, plant, harvest, harvest_all' }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  // ==========================================
  // TOWER DEFENSE TOOLS
  // ==========================================

  server.registerTool(
    'td_new_game',
    {
      title: 'Start Tower Defense [Tower Defense]',
      description: 'Start a new Tower Defense game',
      inputSchema: {
        difficulty: z.enum(['easy', 'normal', 'hard']).optional().describe('Difficulty level'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.towerDefense}/td/new`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', difficulty: args.difficulty || 'normal' }
        });

        let result = `🏰 TOWER DEFENSE GESTARTET\n${'='.repeat(40)}\n\n`;
        result += `🎮 Game ID: ${response.gameId}\n`;
        result += `📊 Schwierigkeit: ${response.difficulty}\n`;
        result += `💰 Gold: ${response.startingGold}\n`;
        result += `❤️ Leben: ${response.lives}\n\n`;
        result += `🗼 VERFÜGBARE TÜRME:\n`;
        for (const tower of response.availableTowers) {
          result += `  ${tower.icon} ${tower.name} (${tower.baseCost} Gold)\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'td_place_tower',
    {
      title: 'Place Tower [Tower Defense]',
      description: 'Place a tower on the map',
      inputSchema: {
        gameId: z.string().describe('Game ID'),
        type: z.enum(['archer', 'cannon', 'mage', 'tesla', 'frost', 'sniper']).describe('Tower type'),
        x: z.number().describe('X position'),
        y: z.number().describe('Y position'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.towerDefense}/td/place-tower`, {
          method: 'POST',
          body: args
        });

        if (response.error) {
          return { content: [{ type: 'text', text: `❌ ${response.error}` }], isError: true };
        }

        return { content: [{ type: 'text', text: `✅ ${response.tower.stats.name} platziert bei (${args.x}, ${args.y})! Gold: ${response.remainingGold}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'td_start_wave',
    {
      title: 'Start Wave [Tower Defense]',
      description: 'Start the next enemy wave',
      inputSchema: {
        gameId: z.string().describe('Game ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.towerDefense}/td/start-wave`, {
          method: 'POST',
          body: { gameId: args.gameId }
        });

        let result = `⚔️ WELLE ${response.wave} GESTARTET!\n${'='.repeat(40)}\n\n`;
        result += `👹 ${response.totalEnemies} Feinde nähern sich!\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'td_status',
    {
      title: 'Game Status [Tower Defense]',
      description: 'Get current TD game status',
      inputSchema: {
        gameId: z.string().describe('Game ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.towerDefense}/td/status?gameId=${args.gameId}`);

        const game = response.game;
        let result = `🏰 TOWER DEFENSE STATUS\n${'='.repeat(40)}\n\n`;
        result += `📊 Welle: ${game.current_wave}\n`;
        result += `💰 Gold: ${game.gold}\n`;
        result += `❤️ Leben: ${game.lives}\n`;
        result += `🏆 Score: ${game.score}\n`;
        result += `📍 Status: ${game.status}\n\n`;
        result += `🗼 Türme: ${response.towers.length}\n`;
        result += `👹 Feinde: ${response.enemies.length}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  // ==========================================
  // RPG EXTENSION TOOLS (Skills, Inventory, Quests)
  // ==========================================

  server.registerTool(
    'rpg_skills',
    {
      title: 'View Skill Tree [Game Universe]',
      description: 'View available skills and your learned skills',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gameUniverse}/rpg/skills/tree?userId=${args.userId || 'michael'}`);

        let result = `🌳 SKILL TREE\n${'='.repeat(40)}\n\n`;
        result += `💠 Verfügbare Skillpunkte: ${response.skillPoints}\n\n`;

        for (const [category, skills] of Object.entries(response.categories || {})) {
          result += `📂 ${category.toUpperCase()}:\n`;
          for (const skill of skills as any[]) {
            const status = skill.learned ? `✅ Lv${skill.level}` : (skill.canLearn ? '🔓' : '🔒');
            result += `  ${skill.icon || '•'} ${skill.name} ${status}\n`;
          }
          result += '\n';
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'rpg_learn_skill',
    {
      title: 'Learn Skill [Game Universe]',
      description: 'Learn a new skill',
      inputSchema: {
        skillId: z.string().describe('Skill ID'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gameUniverse}/rpg/skills/learn`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', skillId: args.skillId }
        });

        return { content: [{ type: 'text', text: response.success ? `✅ ${response.message}` : `❌ ${response.error}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'rpg_inventory',
    {
      title: 'View Inventory [Game Universe]',
      description: 'View your items and equipment',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gameUniverse}/rpg/inventory?userId=${args.userId || 'michael'}`);

        let result = `🎒 INVENTAR\n${'='.repeat(40)}\n\n`;

        if ((response.equipped || []).length > 0) {
          result += `⚔️ AUSGERÜSTET:\n`;
          for (const item of response.equipped) {
            result += `  ${item.icon} ${item.name} [${item.slot}]\n`;
          }
          result += '\n';
        }

        result += `📦 TASCHE:\n`;
        for (const item of response.bag || []) {
          result += `  ${item.icon} ${item.name} x${item.quantity}\n`;
        }

        result += `\n💰 Gesamtwert: ${response.totalValue} Gold`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'rpg_quests',
    {
      title: 'View Quests [Game Universe]',
      description: 'View active and available quests',
      inputSchema: {
        type: z.enum(['active', 'available']).optional().describe('Quest type'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const userId = args.userId || 'michael';
        const type = args.type || 'active';

        const endpoint = type === 'available' ? 'quests/available' : 'quests';
        const response = await callService(`${UNIFIED_SERVICES.gameUniverse}/rpg/${endpoint}?userId=${userId}`);

        const quests = Array.isArray(response) ? response : (response.quests || []);

        let result = `📜 ${type.toUpperCase()} QUESTS\n${'='.repeat(40)}\n\n`;

        for (const quest of quests) {
          result += `📌 ${quest.name} (${quest.category})\n`;
          result += `   ${quest.description}\n`;
          result += `   Geber: ${quest.giver}\n`;

          if (quest.objectives) {
            result += `   Ziele:\n`;
            for (const obj of quest.objectives) {
              const progress = quest.objectives_progress?.[obj.id] || 0;
              const status = progress >= obj.target ? '✅' : `${progress}/${obj.target}`;
              result += `     • ${obj.description} ${status}\n`;
            }
          }

          result += '\n';
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'rpg_accept_quest',
    {
      title: 'Accept Quest [Game Universe]',
      description: 'Accept a quest',
      inputSchema: {
        questId: z.string().describe('Quest ID'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gameUniverse}/rpg/quests/accept`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', questId: args.questId }
        });

        return { content: [{ type: 'text', text: response.success ? `✅ ${response.message}` : `❌ ${response.error}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  // ==========================================
  // EVENT HUB TOOLS (Module Integration)
  // ==========================================

  server.registerTool(
    'get_notifications',
    {
      title: 'Get Pending Notifications [Event Hub]',
      description: 'Get all pending notifications and offline summary',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const userId = args.userId || 'michael';
        const response = await callService(`${UNIFIED_SERVICES.eventHub}/offline-summary?userId=${userId}`);

        let result = `📬 BENACHRICHTIGUNGEN\n${'='.repeat(40)}\n\n`;
        result += `${response.summary}\n\n`;

        if ((response.notifications || []).length > 0) {
          result += `📋 NEUE NACHRICHTEN:\n`;
          for (const notif of response.notifications) {
            result += `  ${notif.type === 'quest' ? '📜' : notif.type === 'npc' ? '🧙' : 'ℹ️'} ${notif.message}\n`;
          }
        }

        if (response.activeEffects?.length > 0) {
          result += `\n✨ AKTIVE EFFEKTE:\n`;
          for (const eff of response.activeEffects) {
            result += `  • ${eff.type}: ${JSON.stringify(eff.params)}\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Event Hub offline: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'sync_emotion',
    {
      title: 'Sync Emotion to Game [Event Hub]',
      description: 'Apply emotional state to game mechanics',
      inputSchema: {
        emotion: z.enum(['joy', 'sadness', 'anxiety', 'anger', 'hope', 'gratitude']).describe('Emotion to sync'),
        intensity: z.number().min(0).max(1).optional().describe('Intensity (0-1)'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.eventHub}/sync-emotion`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', emotion: args.emotion, intensity: args.intensity || 0.5 }
        });

        let result = `💫 EMOTION SYNCHRONISIERT\n${'='.repeat(40)}\n\n`;
        result += `Emotion: ${response.emotion} (${Math.round(response.intensity * 100)}%)\n\n`;
        result += `Effekte:\n`;
        for (const eff of response.effects || []) {
          result += `  ✓ ${eff}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'dream_to_quest',
    {
      title: 'Dream to Quest [Event Hub]',
      description: 'Generate quests from dream symbols',
      inputSchema: {
        symbols: z.array(z.string()).describe('Dream symbols (water, fire, flying, etc.)'),
        lucidity: z.number().min(0).max(100).optional().describe('Lucidity level 0-100'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.eventHub}/dream-to-quest`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', symbols: args.symbols, lucidity: args.lucidity || 0 }
        });

        let result = `🌙 TRAUM → QUESTS\n${'='.repeat(40)}\n\n`;
        result += `${response.questsGenerated} Quests generiert:\n\n`;
        for (const q of response.quests || []) {
          result += `📜 Symbol: ${q.symbol || q.type}\n`;
          for (const eff of q.effects || []) {
            result += `  → ${eff}\n`;
          }
          result += '\n';
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'search_memories',
    {
      title: 'Search Memories [Event Hub]',
      description: 'Search through unified memory storage',
      inputSchema: {
        query: z.string().optional().describe('Search query'),
        source: z.string().optional().describe('Filter by source service'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        let url = `${UNIFIED_SERVICES.eventHub}/memories?userId=${args.userId || 'michael'}`;
        if (args.query) url += `&query=${encodeURIComponent(args.query)}`;
        if (args.source) url += `&source=${args.source}`;

        const response = await callService(url);

        let result = `🧠 ERINNERUNGEN\n${'='.repeat(40)}\n\n`;
        for (const mem of response.memories || []) {
          result += `📝 ${new Date(mem.timestamp).toLocaleDateString()} - ${mem.event_type}\n`;
          result += `   ${mem.summary}\n`;
          result += `   [${mem.source_service}]\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  // ========================================
  // BRANCHING STORIES TOOLS
  // ========================================

  server.registerTool(
    'story_start_branching',
    {
      title: 'Start Branching Story [Creative Suite]',
      description: 'Start a new interactive branching story adventure',
      inputSchema: {
        title: z.string().describe('Story title'),
        genre: z.enum(['fantasy', 'scifi', 'mystery', 'horror', 'adventure', 'philosophical']).describe('Story genre'),
        description: z.string().optional().describe('Setting/premise'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.creativeSuite}/branching/create`, {
          method: 'POST',
          body: { title: args.title, genre: args.genre, description: args.description, user_id: args.userId || 'michael' }
        });

        let result = `📖 INTERAKTIVE GESCHICHTE GESTARTET\n${'='.repeat(40)}\n\n`;
        result += `📕 "${response.title}" (${response.genre})\n\n`;
        result += `${response.current_node?.content || 'Die Geschichte beginnt...'}\n\n`;
        result += `🔀 Optionen:\n`;
        for (const choice of response.current_node?.choices || []) {
          result += `  • ${choice.text}\n`;
        }
        result += `\nStory ID: ${response.story_id}`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'story_choose',
    {
      title: 'Make Story Choice [Creative Suite]',
      description: 'Make a choice in an interactive story',
      inputSchema: {
        storyId: z.string().describe('Story ID'),
        choiceId: z.string().describe('Choice ID'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.creativeSuite}/branching/${args.storyId}/choose`, {
          method: 'POST',
          body: { choice_id: args.choiceId, user_id: args.userId || 'michael' }
        });

        let result = `📖 STORY FORTSETZUNG\n${'='.repeat(40)}\n\n`;
        result += `${response.node?.content || 'Die Geschichte geht weiter...'}\n\n`;
        result += `🔀 Optionen:\n`;
        for (const choice of response.choices || []) {
          result += `  [${choice.id}] ${choice.choice_text}\n`;
        }
        result += `\n📊 Status: ${response.state?.history_length || 0} Entscheidungen getroffen`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'story_templates',
    {
      title: 'Story Templates [Creative Suite]',
      description: 'Get available story templates to start quickly',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.creativeSuite}/branching/templates`);

        let result = `📚 STORY VORLAGEN\n${'='.repeat(40)}\n\n`;
        for (const t of response || []) {
          result += `📕 ${t.name}\n`;
          result += `   Genre: ${t.genre} | Schwierigkeit: ${t.difficulty} | Dauer: ${t.estimated_duration}\n`;
          result += `   ${t.description}\n`;
          result += `   ID: ${t.id}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'story_state',
    {
      title: 'Story State [Creative Suite]',
      description: 'Get current state of a branching story',
      inputSchema: {
        storyId: z.string().describe('Story ID'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(
          `${UNIFIED_SERVICES.creativeSuite}/branching/${args.storyId}/state?user_id=${args.userId || 'michael'}`
        );

        let result = `📖 AKTUELLER STAND\n${'='.repeat(40)}\n\n`;
        result += `${response.node?.content || 'Keine aktuelle Szene'}\n\n`;
        result += `🔀 Optionen:\n`;
        for (const choice of response.choices || []) {
          result += `  [${choice.id}] ${choice.choice_text}\n`;
        }
        result += `\n📊 Flags: ${Object.keys(response.flags || {}).length}`;
        result += `\n🤝 Beziehungen: ${Object.keys(response.relationships || {}).length}`;
        result += `\n📜 Geschichte: ${response.history_length || 0} Entscheidungen`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  // ========================================
  // GAMIFICATION RESOURCES TOOLS
  // ========================================

  server.registerTool(
    'user_profile',
    {
      title: 'User Profile [Gamification]',
      description: 'Get complete user profile with XP, level, resources, and achievements',
      inputSchema: {
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(
          `${UNIFIED_SERVICES.gamification}/profile?id=${args.userId || 'michael'}`
        );

        let result = `👤 PROFIL: ${response.user?.name || 'User'}\n${'='.repeat(40)}\n\n`;
        result += `📊 Level ${response.user?.level} - ${response.user?.title}\n`;
        result += `✨ XP: ${response.user?.xp} (${response.user?.progress}% zum nächsten Level)\n`;
        result += `🔥 Streak: ${response.user?.streakDays} Tage\n\n`;

        result += `💰 RESSOURCEN:\n`;
        result += `  💰 Gold: ${response.resources?.gold}\n`;
        result += `  💎 Gems: ${response.resources?.gems}\n`;
        result += `  ⚡ Energie: ${response.resources?.energy}/${response.resources?.maxEnergy}\n`;
        result += `  🎟️ Tickets: ${response.resources?.tickets}\n`;
        result += `  🔑 Keys: ${response.resources?.keys}\n\n`;

        result += `🏆 Achievements: ${response.achievements?.unlocked?.length || 0}/${response.achievements?.total || 0}\n`;

        if (response.activeBoosts?.length > 0) {
          result += `\n🚀 Aktive Boosts:\n`;
          for (const b of response.activeBoosts) {
            result += `  • ${b.name} (${b.multiplier}x)\n`;
          }
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'shop_items',
    {
      title: 'Shop Items [Gamification]',
      description: 'Browse shop items available for purchase',
      inputSchema: {
        category: z.enum(['energy', 'items', 'currency', 'upgrades']).optional().describe('Item category'),
      },
    },
    async (args: any) => {
      try {
        let url = `${UNIFIED_SERVICES.gamification}/shop`;
        if (args.category) url += `?category=${args.category}`;

        const response = await callService(url);

        let result = `🛒 SHOP\n${'='.repeat(40)}\n\n`;
        for (const item of response.items || []) {
          result += `${item.icon} ${item.name}\n`;
          result += `   ${item.description}\n`;
          result += `   Preis: ${item.cost_amount} ${item.cost_type}\n`;
          result += `   ID: ${item.id}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'shop_purchase',
    {
      title: 'Purchase Item [Gamification]',
      description: 'Purchase an item from the shop',
      inputSchema: {
        itemId: z.string().describe('Item ID to purchase'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gamification}/shop/purchase`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', itemId: args.itemId }
        });

        if (!response.success) {
          return { content: [{ type: 'text', text: `❌ Kauf fehlgeschlagen: ${response.error}` }] };
        }

        let result = `✅ KAUF ERFOLGREICH\n${'='.repeat(40)}\n\n`;
        result += `${response.item?.icon} ${response.item?.name}\n\n`;
        result += `Erhalten:\n`;
        for (const [resource, amount] of Object.entries(response.resourcesGained || {})) {
          result += `  +${amount} ${resource}\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'activate_boost',
    {
      title: 'Activate Boost [Gamification]',
      description: 'Activate a temporary boost',
      inputSchema: {
        boostType: z.enum(['xp_boost', 'xp_mega', 'energy_boost', 'gold_boost', 'luck_boost']).describe('Boost type'),
        userId: z.string().optional().describe('User ID'),
      },
    },
    async (args: any) => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gamification}/boosts/activate`, {
          method: 'POST',
          body: { userId: args.userId || 'michael', boostType: args.boostType }
        });

        if (!response.success) {
          return { content: [{ type: 'text', text: `❌ Boost-Aktivierung fehlgeschlagen: ${response.error}` }] };
        }

        let result = `🚀 BOOST AKTIVIERT\n${'='.repeat(40)}\n\n`;
        result += `${response.boost?.name}\n`;
        result += `Multiplier: ${response.boost?.multiplier}x\n`;
        result += `Läuft ab: ${new Date(response.boost?.expiresAt).toLocaleString()}\n`;

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    'available_boosts',
    {
      title: 'Available Boosts [Gamification]',
      description: 'List all available boosts and their costs',
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callService(`${UNIFIED_SERVICES.gamification}/boosts`);

        let result = `🚀 VERFÜGBARE BOOSTS\n${'='.repeat(40)}\n\n`;
        for (const b of response.available || []) {
          result += `⚡ ${b.name}\n`;
          result += `   ${b.description}\n`;
          result += `   Multiplier: ${b.multiplier}x | Dauer: ${b.durationHours}h\n`;
          result += `   Kosten: ${b.costAmount} ${b.costType}\n`;
          result += `   Typ: ${b.type}\n\n`;
        }

        return { content: [{ type: 'text', text: result }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  return server;
}

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '2.0.0',
    architecture: 'Unified (50+ -> 11)',
    tools: 51,
    unifiedServices: Object.keys(UNIFIED_SERVICES).length,  // 11 real services
    legacyMappings: Object.keys(SERVICES).length,           // backwards compatibility
  });
});

app.get('/mcp', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '2.0.0',
    architecture: 'Unified (50+ -> 11)',
    tools: 51,
    unifiedServices: Object.keys(UNIFIED_SERVICES).length,
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
