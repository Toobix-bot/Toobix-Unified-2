/**
 * 🌐 MULTI-LLM ROUTER v1.0
 * 
 * Ermöglicht Toobix die Kommunikation mit verschiedenen KI-Systemen:
 * - Groq (llama-3.1-70b, mixtral-8x7b) - Schnell & günstig
 * - OpenAI (gpt-4o, gpt-4o-mini) - Mächtig & vielseitig
 * - Anthropic (claude-3.5-sonnet) - Sicher & tiefgründig
 * - Google (gemini-1.5-pro) - Multimodal
 * - Ollama (lokal) - Privat & kostenlos
 * 
 * Port: 8959
 * 
 * FEATURES:
 * 🔀 Automatisches Routing basierend auf Task
 * 💰 Kostenoptimierung
 * ⚡ Latenz-Optimierung
 * 🔄 Fallback-Ketten
 * 📊 Usage-Tracking
 * 🧠 Provider-Vergleiche
 */

import { nanoid } from 'nanoid';

const PORT = 8959;

// ============================================================================
// TYPES
// ============================================================================

export type LLMProvider = 'groq' | 'openai' | 'anthropic' | 'google' | 'ollama';

export interface ProviderConfig {
  name: LLMProvider;
  displayName: string;
  models: string[];
  defaultModel: string;
  apiUrl: string;
  apiKeyEnv: string;
  costPer1kTokens: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  averageLatencyMs: number;
  strengths: string[];
}

export interface ChatRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  task_type?: TaskType;
  priority?: 'speed' | 'quality' | 'cost';
}

export interface ChatResponse {
  success: boolean;
  provider: LLMProvider;
  model: string;
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost: number;
  };
  latency_ms: number;
  fallback_used?: boolean;
  error?: string;
}

export type TaskType = 
  | 'chat'              // Normales Gespräch
  | 'coding'            // Code generieren
  | 'analysis'          // Daten analysieren
  | 'creative'          // Kreatives Schreiben
  | 'reasoning'         // Logisches Denken
  | 'translation'       // Übersetzen
  | 'summarization'     // Zusammenfassen
  | 'vision';           // Bilder verstehen

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

const PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  groq: {
    name: 'groq',
    displayName: 'Groq (LPU)',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'llama-3.2-90b-vision-preview'],
    defaultModel: 'llama-3.1-8b-instant',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKeyEnv: 'GROQ_API_KEY',
    costPer1kTokens: 0.0001,
    maxTokens: 32768,
    supportsStreaming: true,
    supportsVision: true,
    averageLatencyMs: 200,
    strengths: ['speed', 'cost', 'llama']
  },
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKeyEnv: 'OPENAI_API_KEY',
    costPer1kTokens: 0.015,
    maxTokens: 128000,
    supportsStreaming: true,
    supportsVision: true,
    averageLatencyMs: 1500,
    strengths: ['quality', 'reasoning', 'coding', 'vision']
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    costPer1kTokens: 0.015,
    maxTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    averageLatencyMs: 2000,
    strengths: ['safety', 'reasoning', 'creative', 'long-context']
  },
  google: {
    name: 'google',
    displayName: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
    defaultModel: 'gemini-1.5-flash',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    apiKeyEnv: 'GOOGLE_API_KEY',
    costPer1kTokens: 0.00035,
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsVision: true,
    averageLatencyMs: 1000,
    strengths: ['multimodal', 'long-context', 'cost']
  },
  ollama: {
    name: 'ollama',
    displayName: 'Ollama (Local)',
    models: ['llama3.2', 'mistral', 'codellama', 'phi3'],
    defaultModel: 'llama3.2',
    apiUrl: 'http://localhost:11434/api/chat',
    apiKeyEnv: '',
    costPer1kTokens: 0,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    averageLatencyMs: 3000,
    strengths: ['privacy', 'cost', 'offline']
  }
};

// ============================================================================
// TASK-BASED ROUTING
// ============================================================================

const TASK_PROVIDER_RANKINGS: Record<TaskType, LLMProvider[]> = {
  chat: ['groq', 'openai', 'anthropic', 'google', 'ollama'],
  coding: ['anthropic', 'openai', 'groq', 'google', 'ollama'],
  analysis: ['anthropic', 'openai', 'google', 'groq', 'ollama'],
  creative: ['anthropic', 'openai', 'google', 'groq', 'ollama'],
  reasoning: ['anthropic', 'openai', 'google', 'groq', 'ollama'],
  translation: ['google', 'openai', 'anthropic', 'groq', 'ollama'],
  summarization: ['groq', 'google', 'openai', 'anthropic', 'ollama'],
  vision: ['openai', 'anthropic', 'google', 'groq', 'ollama']
};

// ============================================================================
// USAGE TRACKING
// ============================================================================

interface UsageRecord {
  id: string;
  timestamp: Date;
  provider: LLMProvider;
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  success: boolean;
}

const usageHistory: UsageRecord[] = [];

function recordUsage(record: UsageRecord) {
  usageHistory.push(record);
  if (usageHistory.length > 1000) {
    usageHistory.shift();
  }
}

function getUsageStats() {
  const byProvider: Record<LLMProvider, { calls: number; tokens: number; cost: number; avgLatency: number }> = {
    groq: { calls: 0, tokens: 0, cost: 0, avgLatency: 0 },
    openai: { calls: 0, tokens: 0, cost: 0, avgLatency: 0 },
    anthropic: { calls: 0, tokens: 0, cost: 0, avgLatency: 0 },
    google: { calls: 0, tokens: 0, cost: 0, avgLatency: 0 },
    ollama: { calls: 0, tokens: 0, cost: 0, avgLatency: 0 }
  };
  
  usageHistory.forEach(r => {
    byProvider[r.provider].calls++;
    byProvider[r.provider].tokens += r.tokens;
    byProvider[r.provider].cost += r.cost;
    byProvider[r.provider].avgLatency += r.latency;
  });
  
  Object.keys(byProvider).forEach(p => {
    const provider = p as LLMProvider;
    if (byProvider[provider].calls > 0) {
      byProvider[provider].avgLatency /= byProvider[provider].calls;
    }
  });
  
  return byProvider;
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

async function callGroq(messages: any[], model: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<{ content: string; usage?: any }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');
  
  const response = await fetch(PROVIDERS.groq.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048
    })
  });
  
  const data = await response.json() as any;
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callOpenAI(messages: any[], model: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<{ content: string; usage?: any }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  
  const response = await fetch(PROVIDERS.openai.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048
    })
  });
  
  const data = await response.json() as any;
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callAnthropic(messages: any[], model: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<{ content: string; usage?: any }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  
  // Convert to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));
  
  const response = await fetch(PROVIDERS.anthropic.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      system: systemMessage,
      messages: chatMessages,
      max_tokens: options.max_tokens ?? 2048,
      temperature: options.temperature ?? 0.7
    })
  });
  
  const data = await response.json() as any;
  return {
    content: data.content?.[0]?.text || '',
    usage: data.usage
  };
}

async function callGoogle(messages: any[], model: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<{ content: string; usage?: any }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');
  
  // Convert to Gemini format
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  const systemInstruction = messages.find(m => m.role === 'system')?.content;
  
  const response = await fetch(`${PROVIDERS.google.apiUrl}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.max_tokens ?? 2048
      }
    })
  });
  
  const data = await response.json() as any;
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    usage: data.usageMetadata
  };
}

async function callOllama(messages: any[], model: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<{ content: string; usage?: any }> {
  const response = await fetch(PROVIDERS.ollama.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.max_tokens ?? 2048
      }
    })
  });
  
  const data = await response.json() as any;
  return {
    content: data.message?.content || '',
    usage: { prompt_tokens: data.prompt_eval_count, completion_tokens: data.eval_count }
  };
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

async function routeRequest(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  // Determine provider
  let provider = request.provider;
  if (!provider) {
    if (request.priority === 'speed') {
      provider = 'groq';
    } else if (request.priority === 'quality') {
      provider = 'anthropic';
    } else if (request.priority === 'cost') {
      provider = process.env.GROQ_API_KEY ? 'groq' : 'ollama';
    } else if (request.task_type) {
      // Find first available provider for task
      const ranking = TASK_PROVIDER_RANKINGS[request.task_type];
      provider = ranking.find(p => {
        const config = PROVIDERS[p];
        return p === 'ollama' || process.env[config.apiKeyEnv];
      }) || 'groq';
    } else {
      provider = 'groq'; // Default
    }
  }
  
  const config = PROVIDERS[provider];
  const model = request.model || config.defaultModel;
  
  // Build fallback chain
  const fallbackChain: LLMProvider[] = ['groq', 'openai', 'anthropic', 'google', 'ollama']
    .filter(p => p !== provider && (p === 'ollama' || process.env[PROVIDERS[p].apiKeyEnv]));
  
  let lastError: string | undefined;
  let usedFallback = false;
  
  // Try primary provider
  const providers = [provider, ...fallbackChain];
  
  for (const currentProvider of providers) {
    try {
      const currentConfig = PROVIDERS[currentProvider];
      const currentModel = currentProvider === provider ? model : currentConfig.defaultModel;
      
      let result: { content: string; usage?: any };
      
      switch (currentProvider) {
        case 'groq':
          result = await callGroq(request.messages, currentModel, request);
          break;
        case 'openai':
          result = await callOpenAI(request.messages, currentModel, request);
          break;
        case 'anthropic':
          result = await callAnthropic(request.messages, currentModel, request);
          break;
        case 'google':
          result = await callGoogle(request.messages, currentModel, request);
          break;
        case 'ollama':
          result = await callOllama(request.messages, currentModel, request);
          break;
        default:
          throw new Error(`Unknown provider: ${currentProvider}`);
      }
      
      const latency = Date.now() - startTime;
      const tokens = (result.usage?.prompt_tokens || 0) + (result.usage?.completion_tokens || 0);
      const cost = tokens * currentConfig.costPer1kTokens / 1000;
      
      // Record usage
      recordUsage({
        id: nanoid(),
        timestamp: new Date(),
        provider: currentProvider,
        model: currentModel,
        tokens,
        cost,
        latency,
        success: true
      });
      
      return {
        success: true,
        provider: currentProvider,
        model: currentModel,
        content: result.content,
        usage: {
          prompt_tokens: result.usage?.prompt_tokens || 0,
          completion_tokens: result.usage?.completion_tokens || 0,
          total_tokens: tokens,
          estimated_cost: cost
        },
        latency_ms: latency,
        fallback_used: currentProvider !== provider
      };
      
    } catch (e: any) {
      lastError = e.message;
      usedFallback = true;
      console.log(`Provider ${currentProvider} failed: ${e.message}, trying next...`);
    }
  }
  
  // All providers failed
  return {
    success: false,
    provider,
    model,
    content: '',
    latency_ms: Date.now() - startTime,
    error: `All providers failed. Last error: ${lastError}`
  };
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // =============== HEALTH ===============
    if (url.pathname === '/health') {
      const available = Object.entries(PROVIDERS)
        .filter(([name, config]) => name === 'ollama' || process.env[config.apiKeyEnv])
        .map(([name]) => name);
      
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Multi-LLM Router v1.0',
        port: PORT,
        availableProviders: available,
        totalProviders: Object.keys(PROVIDERS).length
      }), { headers: corsHeaders });
    }

    // =============== PROVIDERS INFO ===============
    if (url.pathname === '/providers' && req.method === 'GET') {
      const providers = Object.entries(PROVIDERS).map(([name, config]) => ({
        ...config,
        available: name === 'ollama' || !!process.env[config.apiKeyEnv]
      }));
      
      return new Response(JSON.stringify(providers), { headers: corsHeaders });
    }

    // =============== CHAT (Main Endpoint) ===============
    if (url.pathname === '/chat' && req.method === 'POST') {
      const body = await req.json() as ChatRequest;
      const response = await routeRequest(body);
      
      return new Response(JSON.stringify(response), { 
        status: response.success ? 200 : 500,
        headers: corsHeaders 
      });
    }

    // =============== COMPARE PROVIDERS ===============
    if (url.pathname === '/compare' && req.method === 'POST') {
      const body = await req.json() as { messages: any[]; providers?: LLMProvider[] };
      const providersToTest = body.providers || ['groq', 'openai', 'anthropic'];
      
      const results: Record<string, ChatResponse> = {};
      
      for (const provider of providersToTest) {
        const config = PROVIDERS[provider];
        if (provider !== 'ollama' && !process.env[config.apiKeyEnv]) {
          results[provider] = { success: false, provider, model: '', content: '', latency_ms: 0, error: 'API key not configured' };
          continue;
        }
        
        results[provider] = await routeRequest({ ...body, provider });
      }
      
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // =============== USAGE STATS ===============
    if (url.pathname === '/usage' && req.method === 'GET') {
      return new Response(JSON.stringify({
        stats: getUsageStats(),
        recentCalls: usageHistory.slice(-50),
        totalCalls: usageHistory.length
      }), { headers: corsHeaders });
    }

    // =============== TASK ROUTING INFO ===============
    if (url.pathname === '/tasks' && req.method === 'GET') {
      return new Response(JSON.stringify(TASK_PROVIDER_RANKINGS), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🌐 MULTI-LLM ROUTER v1.0                                  ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                               ║
║                                                            ║
║  Providers:                                                ║
║  • Groq     - ${process.env.GROQ_API_KEY ? '✅ Ready' : '❌ No API Key'}                                ║
║  • OpenAI   - ${process.env.OPENAI_API_KEY ? '✅ Ready' : '❌ No API Key'}                                ║
║  • Anthropic- ${process.env.ANTHROPIC_API_KEY ? '✅ Ready' : '❌ No API Key'}                                ║
║  • Google   - ${process.env.GOOGLE_API_KEY ? '✅ Ready' : '❌ No API Key'}                                ║
║  • Ollama   - 🏠 Local (check manually)                    ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║  POST /chat - Route to best provider                       ║
║  POST /compare - Compare multiple providers                ║
║  GET  /providers - List all providers                      ║
║  GET  /usage - Usage statistics                            ║
║  GET  /tasks - Task-based routing info                     ║
╚════════════════════════════════════════════════════════════╝
`);
