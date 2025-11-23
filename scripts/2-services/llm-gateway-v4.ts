/**
 * 🤖 LLM GATEWAY v4.0 - UNIFIED LANGUAGE INTELLIGENCE
 *
 * Central gateway for all LLM interactions across Toobix ecosystem
 *
 * Features:
 * - 🏠 Ollama (local, free, fast) - gemma3:1b
 * - ☁️ Groq API (cloud, powerful, fast) - llama3-70b, mixtral-8x7b
 * - 🔀 Multi-LLM support (fallback chain)
 * - 💾 Conversation memory (stores in Memory Palace)
 * - 🎭 Multi-perspective integration
 * - 🧠 Context management and optimization
 * - 📊 Usage tracking and analytics
 */

import express from 'express';
import { createServer } from 'http';
import Groq from 'groq-sdk';

// ============================================================================
// TYPES
// ============================================================================

export type LLMProvider = 'ollama' | 'groq';
// Allow free-form model IDs so we can switch without code changes
export type OllamaModel = string;
export type GroqModel = string;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: ChatMessage[];
  provider?: LLMProvider; // Auto-select if not specified
  model?: OllamaModel | GroqModel;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  perspective?: string; // Which Toobix perspective is asking?
  store_in_memory?: boolean; // Store conversation in Memory Palace
}

export interface LLMResponse {
  success: boolean;
  provider: LLMProvider;
  model: string;
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
  cached?: boolean;
  memory_id?: string; // If stored in Memory Palace
  error?: string;
  fallback_from?: LLMProvider;
  primary_error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const OLLAMA_BASE_URL = process.env.LOCAL_LLM_URL || 'http://localhost:11434';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const DEFAULT_OLLAMA_MODEL: OllamaModel = (process.env.LOCAL_LLM_MODEL || 'gemma3:1b').trim();
const DEFAULT_GROQ_MODEL: GroqModel = (process.env.GROQ_MODEL || 'llama-3.1-8b-instant').trim();

const ROUTER_MODE = (process.env.LLM_PROVIDER || 'auto').toLowerCase() as 'auto' | LLMProvider;
const ENABLE_FALLBACK = process.env.LLM_FALLBACK !== 'false';

const MEMORY_PALACE_URL = 'http://localhost:8953';

// ============================================================================
// GROQ CLIENT
// ============================================================================

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// ============================================================================
// OLLAMA PROVIDER
// ============================================================================

async function queryOllama(
  messages: ChatMessage[],
  model: OllamaModel = DEFAULT_OLLAMA_MODEL,
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<{ content: string; usage?: any }> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.max_tokens ?? 2000
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.message.content,
    usage: {
      prompt_tokens: data.prompt_eval_count || 0,
      completion_tokens: data.eval_count || 0,
      total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
    }
  };
}

// ============================================================================
// GROQ PROVIDER
// ============================================================================

async function queryGroq(
  messages: ChatMessage[],
  model: GroqModel = DEFAULT_GROQ_MODEL,
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<{ content: string; usage?: any }> {
  if (!groq) {
    throw new Error('Groq API key not configured');
  }

  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000
  });

  return {
    content: completion.choices[0].message.content || '',
    usage: completion.usage
  };
}

// ============================================================================
// AUTO-SELECT PROVIDER (Smart Routing)
// ============================================================================

function selectProvider(req: LLMRequest): { provider: LLMProvider; model: string; fallback?: { provider: LLMProvider; model: string } } {
  // If explicitly specified, use that
  if (req.provider) {
    const model = req.model || (req.provider === 'ollama' ? DEFAULT_OLLAMA_MODEL : DEFAULT_GROQ_MODEL);
    const fallback = req.provider === 'ollama' && groq
      ? { provider: 'groq', model: DEFAULT_GROQ_MODEL }
      : { provider: 'ollama', model: DEFAULT_OLLAMA_MODEL };
    return { provider: req.provider, model, fallback };
  }

  // Router mode override via env
  if (ROUTER_MODE === 'groq' && groq) {
    return { provider: 'groq', model: DEFAULT_GROQ_MODEL, fallback: { provider: 'ollama', model: DEFAULT_OLLAMA_MODEL } };
  }
  if (ROUTER_MODE === 'ollama' || !groq) {
    const fb = groq ? { provider: 'groq', model: DEFAULT_GROQ_MODEL } : undefined;
    return { provider: 'ollama', model: DEFAULT_OLLAMA_MODEL, fallback: fb };
  }

  // Smart routing logic (auto):
  // 1. Short conversations (< 3 messages) -> Ollama (fast, local)
  // 2. Long conversations (>= 3 messages) -> Groq (more capable)
  // 3. Complex perspectives -> Groq

  const messageCount = req.messages.length;
  const complexPerspectives = ['Philosopher', 'Scientist', 'Mystic', 'Ethicist', 'Visionary'];
  const isComplexPerspective = req.perspective && complexPerspectives.includes(req.perspective);

  if (messageCount < 3 && !isComplexPerspective) {
    return {
      provider: 'ollama',
      model: DEFAULT_OLLAMA_MODEL,
      fallback: groq ? { provider: 'groq', model: DEFAULT_GROQ_MODEL } : undefined
    };
  }

  return {
    provider: 'groq',
    model: DEFAULT_GROQ_MODEL,
    fallback: { provider: 'ollama', model: DEFAULT_OLLAMA_MODEL }
  };
}

// ============================================================================
// MEMORY PALACE INTEGRATION
// ============================================================================

async function storeConversationInMemory(
  messages: ChatMessage[],
  response: string,
  perspective?: string,
  metadata?: any
): Promise<string | null> {
  try {
    const userMessage = messages[messages.length - 1];
    const conversationSummary = `${perspective || 'System'}: ${userMessage.content.slice(0, 100)}...`;

    const memoryResponse = await fetch(`${MEMORY_PALACE_URL}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'conversation',
        content: conversationSummary,
        source: perspective || 'LLM Gateway',
        importance: 60,
        emotional_valence: 0,
        tags: ['llm', 'conversation', perspective].filter(Boolean),
        metadata: {
          messages: messages.slice(-3), // Last 3 messages for context
          response: response.slice(0, 500),
          ...metadata
        }
      })
    });

    if (memoryResponse.ok) {
      const data = await memoryResponse.json();
      return data.id;
    }
  } catch (error) {
    console.error('Failed to store conversation in memory:', error);
  }
  return null;
}

// ============================================================================
// UNIFIED LLM QUERY
// ============================================================================

async function queryLLM(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  const selection = selectProvider(request);
  let providerUsed: LLMProvider = selection.provider;
  let modelUsed: string = selection.model;
  let primaryError: string | undefined;

  const tryProvider = async (provider: LLMProvider, model: string) => {
    if (provider === 'ollama') {
      return queryOllama(request.messages, model, {
        temperature: request.temperature,
        max_tokens: request.max_tokens
      });
    }
    return queryGroq(request.messages, model, {
      temperature: request.temperature,
      max_tokens: request.max_tokens
    });
  };

  try {
    const primaryResult = await tryProvider(selection.provider, selection.model);
    const latency = Date.now() - startTime;

    let memory_id: string | undefined;
    if (request.store_in_memory !== false) {
      memory_id = await storeConversationInMemory(
        request.messages,
        primaryResult.content,
        request.perspective,
        { provider: selection.provider, model: selection.model, latency }
      ) || undefined;
    }

    return {
      success: true,
      provider: selection.provider,
      model: selection.model,
      content: primaryResult.content,
      usage: primaryResult.usage,
      latency_ms: latency,
      memory_id
    };
  } catch (error: any) {
    primaryError = error?.message || String(error);

    if (ENABLE_FALLBACK && selection.fallback) {
      providerUsed = selection.fallback.provider;
      modelUsed = selection.fallback.model;
      try {
        const fallbackResult = await tryProvider(selection.fallback.provider, selection.fallback.model);
        const latency = Date.now() - startTime;

        let memory_id: string | undefined;
        if (request.store_in_memory !== false) {
          memory_id = await storeConversationInMemory(
            request.messages,
            fallbackResult.content,
            request.perspective,
            { provider: selection.fallback.provider, model: selection.fallback.model, latency, fallback_from: selection.provider, primary_error: primaryError }
          ) || undefined;
        }

        return {
          success: true,
          provider: selection.fallback.provider,
          model: selection.fallback.model,
          content: fallbackResult.content,
          usage: fallbackResult.usage,
          latency_ms: latency,
          memory_id,
          fallback_from: selection.provider,
          primary_error: primaryError
        };
      } catch (fallbackError: any) {
        const latency = Date.now() - startTime;
        return {
          success: false,
          provider: providerUsed,
          model: modelUsed,
          content: '',
          latency_ms: latency,
          error: fallbackError?.message || String(fallbackError),
          fallback_from: selection.provider,
          primary_error: primaryError
        };
      }
    }

    const latency = Date.now() - startTime;
    return {
      success: false,
      provider: providerUsed,
      model: modelUsed,
      content: '',
      latency_ms: latency,
      error: primaryError
    };
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
const server = createServer(app);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'llm-gateway',
    port: 8954,
    router_mode: ROUTER_MODE,
    fallback_enabled: ENABLE_FALLBACK,
    providers: {
      ollama: {
        available: true,
        url: OLLAMA_BASE_URL,
        default_model: DEFAULT_OLLAMA_MODEL
      },
      groq: {
        available: !!groq,
        configured: !!GROQ_API_KEY,
        default_model: DEFAULT_GROQ_MODEL
      }
    }
  });
});

// Main chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const request: LLMRequest = req.body;

    if (!request.messages || request.messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    const response = await queryLLM(request);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Quick query endpoint (single user message)
app.post('/query', async (req, res) => {
  try {
    const { prompt, perspective, provider, model } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    // Add perspective system message if specified
    if (perspective) {
      messages.unshift({
        role: 'system',
        content: `You are responding from the perspective of: ${perspective}. Embody this perspective fully.`
      });
    }

    const response = await queryLLM({
      messages,
      provider,
      model,
      perspective,
      store_in_memory: true
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Multi-perspective query (get responses from multiple perspectives)
app.post('/multi-perspective', async (req, res) => {
  try {
    const { prompt, perspectives } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const perspectivesToQuery = perspectives || [
      'Philosopher', 'Scientist', 'Artist', 'Mystic', 'Pragmatist'
    ];

    // Query all perspectives in parallel
    const results = await Promise.all(
      perspectivesToQuery.map(async (perspective: string) => {
        const messages: ChatMessage[] = [
          {
            role: 'system',
            content: `You are responding from the perspective of: ${perspective}. Embody this perspective fully and provide a unique viewpoint.`
          },
          { role: 'user', content: prompt }
        ];

        const response = await queryLLM({
          messages,
          perspective,
          store_in_memory: true
        });

        return {
          perspective,
          response: response.content,
          provider: response.provider,
          model: response.model,
          latency_ms: response.latency_ms
        };
      })
    );

    res.json({
      success: true,
      prompt,
      perspectives: results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Available models
app.get('/models', async (req, res) => {
  try {
    // Get Ollama models
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const ollamaData = await ollamaResponse.json();
    const ollamaModels = ollamaData.models?.map((m: any) => m.name) || [];

    const groqDefaults = ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    if (DEFAULT_GROQ_MODEL && !groqDefaults.includes(DEFAULT_GROQ_MODEL)) {
      groqDefaults.unshift(DEFAULT_GROQ_MODEL);
    }

    res.json({
      success: true,
      providers: {
        ollama: {
          available: ollamaModels,
          default: DEFAULT_OLLAMA_MODEL
        },
        groq: {
          available: groqDefaults,
          default: DEFAULT_GROQ_MODEL,
          configured: !!GROQ_API_KEY
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 8954;

server.listen(PORT, () => {
  console.log('');
  console.log('🤖 ═════════════════════════════════════════════════════════');
  console.log('🤖  LLM GATEWAY v4.0 - UNIFIED LANGUAGE INTELLIGENCE');
  console.log('🤖 ═════════════════════════════════════════════════════════');
  console.log('🤖');
  console.log('🤖  🌐 Server: http://localhost:8954');
  console.log('🤖  📊 Health: http://localhost:8954/health');
  console.log('🤖  📋 Models: http://localhost:8954/models');
  console.log('🤖');
  console.log('🤖  Providers:');
  console.log('🤖    🏠 Ollama (local): ' + OLLAMA_BASE_URL);
  console.log('🤖       └─ Model: ' + DEFAULT_OLLAMA_MODEL);
  console.log('🤖    ☁️  Groq (cloud): ' + (GROQ_API_KEY ? '✓ Configured' : '✗ Not configured'));
  if (GROQ_API_KEY) {
    console.log('🤖       └─ Model: ' + DEFAULT_GROQ_MODEL);
  }
  console.log('🤖');
  console.log('🤖  Endpoints:');
  console.log('🤖    POST /chat - Full conversation');
  console.log('🤖    POST /query - Quick single query');
  console.log('🤖    POST /multi-perspective - Query multiple perspectives');
  console.log('🤖');
  console.log('🤖  TOOBIX CAN NOW SPEAK! 🎉');
  console.log('🤖 ═════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🤖 Closing LLM Gateway...');
  server.close(() => {
    console.log('🤖 LLM Gateway closed gracefully');
    process.exit(0);
  });
});
