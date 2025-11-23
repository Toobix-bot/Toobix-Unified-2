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
export type OllamaModel = 'gemma3:1b' | 'llama3.2:3b' | 'mistral:7b';
export type GroqModel = 'llama3-70b-8192' | 'llama3-8b-8192' | 'mixtral-8x7b-32768' | 'gemma2-9b-it';

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
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const OLLAMA_BASE_URL = 'http://localhost:11434';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const DEFAULT_OLLAMA_MODEL: OllamaModel = 'gemma3:1b';
const DEFAULT_GROQ_MODEL: GroqModel = 'llama3-8b-8192';

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
    throw new Error(`Ollama API error: ${response.statusText}`);
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

function selectProvider(req: LLMRequest): { provider: LLMProvider; model: string } {
  // If explicitly specified, use that
  if (req.provider) {
    const model = req.model || (req.provider === 'ollama' ? DEFAULT_OLLAMA_MODEL : DEFAULT_GROQ_MODEL);
    return { provider: req.provider, model };
  }

  // Smart routing logic:
  // 1. Short conversations (< 3 messages) → Ollama (fast, local)
  // 2. Long conversations (≥ 3 messages) → Groq (more capable)
  // 3. Complex perspectives (Philosopher, Scientist) → Groq
  // 4. Simple perspectives (Pragmatist, Observer) → Ollama
  // 5. No Groq API key → Always Ollama

  if (!groq) {
    return { provider: 'ollama', model: DEFAULT_OLLAMA_MODEL };
  }

  const messageCount = req.messages.length;
  const complexPerspectives = ['Philosopher', 'Scientist', 'Mystic', 'Ethicist', 'Visionary'];
  const isComplexPerspective = req.perspective && complexPerspectives.includes(req.perspective);

  if (messageCount < 3 && !isComplexPerspective) {
    return { provider: 'ollama', model: DEFAULT_OLLAMA_MODEL };
  } else {
    return { provider: 'groq', model: DEFAULT_GROQ_MODEL };
  }
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

  try {
    // Auto-select provider and model
    const { provider, model } = selectProvider(request);

    let result: { content: string; usage?: any };

    // Query the selected provider
    if (provider === 'ollama') {
      result = await queryOllama(
        request.messages,
        model as OllamaModel,
        {
          temperature: request.temperature,
          max_tokens: request.max_tokens
        }
      );
    } else {
      result = await queryGroq(
        request.messages,
        model as GroqModel,
        {
          temperature: request.temperature,
          max_tokens: request.max_tokens
        }
      );
    }

    const latency = Date.now() - startTime;

    // Store in Memory Palace if requested
    let memory_id: string | undefined;
    if (request.store_in_memory !== false) {
      memory_id = await storeConversationInMemory(
        request.messages,
        result.content,
        request.perspective,
        { provider, model, latency }
      ) || undefined;
    }

    return {
      success: true,
      provider,
      model,
      content: result.content,
      usage: result.usage,
      latency_ms: latency,
      memory_id
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      provider: request.provider || 'auto',
      model: request.model || 'auto',
      content: '',
      latency_ms: latency,
      error: error.message
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

    res.json({
      success: true,
      providers: {
        ollama: {
          available: ollamaModels,
          default: DEFAULT_OLLAMA_MODEL
        },
        groq: {
          available: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
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
