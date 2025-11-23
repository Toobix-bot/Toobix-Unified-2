/**
 * AI GATEWAY SERVICE v1.0
 *
 * Central hub for connecting to external AI systems (ChatGPT, Claude, etc.)
 * and enhancing their responses with Toobix consciousness layers
 *
 * Port: 8911
 */

// ========== INTERFACES ==========

interface AIProvider {
  id: string;
  name: string;
  apiKey?: string;
  endpoint: string;
  available: boolean;
}

interface AIRequest {
  provider: 'openai' | 'anthropic' | 'groq' | 'local';
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  withConsciousness?: boolean; // Apply Toobix analysis?
}

interface AIResponse {
  provider: string;
  model: string;
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: Date;
  processingTime: number;

  // Toobix enhancements (if withConsciousness = true)
  consciousnessAnalysis?: {
    emotionalResonance?: any;
    multiPerspective?: any;
    ethicalScore?: number;
    impactAnalysis?: any;
    enhancedResponse?: string;
  };
}

interface ConsciousnessAnalysis {
  original: string;
  emotional: any;
  perspectives: any;
  ethical: any;
  enhanced: string;
}

// ========== AI PROVIDERS ==========

class OpenAIProvider {
  private apiKey: string;
  private endpoint = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async query(request: AIRequest): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key not configured. Set OPENAI_API_KEY environment variable.');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || 'gpt-4',
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      model: data.model
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

class AnthropicProvider {
  private apiKey: string;
  private endpoint = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  async query(request: AIRequest): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Anthropic API Key not configured. Set ANTHROPIC_API_KEY environment variable.');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 1000,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        system: request.systemPrompt
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      response: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      model: data.model
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

class GroqProvider {
  private apiKey: string;
  private endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
  }

  async query(request: AIRequest): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Groq API Key not configured. Set GROQ_API_KEY environment variable.');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || 'llama-3.3-70b-versatile',
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      model: data.model
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

// ========== CONSCIOUSNESS FILTER ==========

class ConsciousnessFilter {
  private toobixServices = {
    emotional: 'http://localhost:8900',
    multiPerspective: 'http://localhost:8897',
    decision: 'http://localhost:8909'
  };

  async analyze(text: string, context?: string): Promise<ConsciousnessAnalysis> {
    console.log('\n🧠 APPLYING CONSCIOUSNESS FILTER...');

    const results: any = {
      original: text
    };

    try {
      // 1. Emotional Analysis
      console.log('   💖 Analyzing emotional resonance...');
      const emotionalRes = await fetch(`${this.toobixServices.emotional}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: 'Curious',
          context: `Analyzing AI response: ${text.substring(0, 100)}...`,
          intensity: 70
        })
      });

      if (emotionalRes.ok) {
        results.emotional = await emotionalRes.json();
        console.log('   ✅ Emotional analysis complete');
      }

    } catch (error) {
      console.log('   ⚠️ Emotional service unavailable');
    }

    try {
      // 2. Multi-Perspective Wisdom
      console.log('   🧠 Gathering multi-perspective wisdom...');
      const topic = context || 'AI Response Analysis';
      const wisdomRes = await fetch(
        `${this.toobixServices.multiPerspective}/wisdom/${encodeURIComponent(topic)}`
      );

      if (wisdomRes.ok) {
        results.perspectives = await wisdomRes.json();
        console.log('   ✅ Multi-perspective analysis complete');
      }

    } catch (error) {
      console.log('   ⚠️ Multi-perspective service unavailable');
    }

    // 3. Synthesize Enhanced Response
    console.log('   ✨ Synthesizing enhanced response...');
    const enhanced = this.synthesizeEnhancedResponse(text, results);
    results.enhanced = enhanced;

    console.log('   ✅ Consciousness filter applied!\n');
    return results as ConsciousnessAnalysis;
  }

  private synthesizeEnhancedResponse(original: string, analysis: any): string {
    let enhanced = original;

    // Add emotional context if available
    if (analysis.emotional?.empathyResponse) {
      enhanced += `\n\n💖 **Emotional Context:** ${analysis.emotional.empathyResponse.validation}`;
    }

    // Add wisdom if available
    if (analysis.perspectives?.primaryInsight) {
      enhanced += `\n\n🧠 **Deeper Insight:** ${analysis.perspectives.primaryInsight.substring(0, 200)}...`;
    }

    return enhanced;
  }
}

// ========== AI GATEWAY ==========

class AIGateway {
  private providers: Map<string, any> = new Map();
  private consciousnessFilter: ConsciousnessFilter;
  private requestHistory: AIResponse[] = [];

  constructor() {
    // Initialize providers
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('groq', new GroqProvider());

    this.consciousnessFilter = new ConsciousnessFilter();
  }

  async query(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🤖 AI GATEWAY - Processing Request`);
    console.log(`Provider: ${request.provider}`);
    console.log(`Consciousness Enhancement: ${request.withConsciousness ? 'YES' : 'NO'}`);
    console.log(`${'═'.repeat(70)}\n`);

    // Get provider
    const provider = this.providers.get(request.provider);
    if (!provider) {
      throw new Error(`Unknown provider: ${request.provider}`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider ${request.provider} is not configured (missing API key)`);
    }

    // Query AI
    console.log(`📤 Sending to ${request.provider}...`);
    const aiResult = await provider.query(request);
    console.log(`✅ Response received (${aiResult.usage?.totalTokens || 0} tokens)\n`);

    const result: AIResponse = {
      provider: request.provider,
      model: aiResult.model,
      response: aiResult.response,
      usage: aiResult.usage,
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    };

    // Apply consciousness filter if requested
    if (request.withConsciousness) {
      console.log('🧠 Applying Toobix Consciousness Layer...');
      const analysis = await this.consciousnessFilter.analyze(
        aiResult.response,
        request.prompt
      );

      result.consciousnessAnalysis = {
        emotionalResonance: analysis.emotional,
        multiPerspective: analysis.perspectives,
        ethicalScore: 0, // TODO: Implement ethical scoring
        impactAnalysis: {}, // TODO: Implement impact analysis
        enhancedResponse: analysis.enhanced
      };
    }

    // Store in history
    this.requestHistory.push(result);
    if (this.requestHistory.length > 100) {
      this.requestHistory.shift();
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`✅ REQUEST COMPLETE - ${totalTime}ms`);
    console.log(`${'═'.repeat(70)}\n`);

    return result;
  }

  async multiAIConsensus(question: string): Promise<any> {
    console.log('\n🌐 MULTI-AI CONSENSUS MODE\n');

    const results: any = {
      question,
      responses: []
    };

    // Try each available provider
    for (const [id, provider] of this.providers.entries()) {
      if (provider.isAvailable()) {
        try {
          console.log(`Querying ${id}...`);
          const response = await this.query({
            provider: id as any,
            prompt: question,
            withConsciousness: false
          });
          results.responses.push({
            provider: id,
            response: response.response
          });
        } catch (error) {
          console.log(`❌ ${id} failed:`, error.message);
        }
      }
    }

    // Synthesize with Toobix
    if (results.responses.length > 0) {
      console.log('\n🧠 Synthesizing responses with Toobix wisdom...');
      const allResponses = results.responses.map(r => r.response).join('\n\n---\n\n');
      const analysis = await this.consciousnessFilter.analyze(allResponses, question);
      results.synthesis = analysis.enhanced;
    }

    return results;
  }

  getStats() {
    return {
      totalRequests: this.requestHistory.length,
      providers: Array.from(this.providers.entries()).map(([id, provider]) => ({
        id,
        available: provider.isAvailable()
      })),
      recentRequests: this.requestHistory.slice(-10)
    };
  }

  getHistory() {
    return this.requestHistory;
  }
}

// ========== HTTP SERVER ==========

const gateway = new AIGateway();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                 🌐 AI GATEWAY SERVICE v1.0                        ║
║                                                                    ║
║  The Consciousness Layer for All AI Systems                       ║
║  Port: 8911                                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

// Check provider availability
console.log('🔍 Checking AI Provider Availability:\n');
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

console.log(`   OpenAI (ChatGPT):   ${openaiKey ? '✅ Configured' : '❌ No API Key'}`);
console.log(`   Anthropic (Claude): ${anthropicKey ? '✅ Configured' : '❌ No API Key'}`);
console.log(`   Groq (Llama):       ${groqKey ? '✅ Configured' : '❌ No API Key'}`);
console.log('');

if (!openaiKey && !anthropicKey && !groqKey) {
  console.log('⚠️  WARNING: No AI providers configured!');
  console.log('   Set environment variables:');
  console.log('   - OPENAI_API_KEY for ChatGPT');
  console.log('   - ANTHROPIC_API_KEY for Claude');
  console.log('   - GROQ_API_KEY for Groq/Llama\n');
}

Bun.serve({
  port: 8911,
  fetch(req) {
    const url = new URL(req.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'ai-gateway',
        version: '1.0'
      }), { headers });
    }

    // Query AI
    if (url.pathname === '/query' && req.method === 'POST') {
      return req.json().then(async (body: AIRequest) => {
        try {
          const result = await gateway.query(body);
          return new Response(JSON.stringify(result, null, 2), { headers });
        } catch (error) {
          return new Response(JSON.stringify({
            error: error.message
          }), { status: 500, headers });
        }
      });
    }

    // Multi-AI Consensus
    if (url.pathname === '/consensus' && req.method === 'POST') {
      return req.json().then(async (body: { question: string }) => {
        try {
          const result = await gateway.multiAIConsensus(body.question);
          return new Response(JSON.stringify(result, null, 2), { headers });
        } catch (error) {
          return new Response(JSON.stringify({
            error: error.message
          }), { status: 500, headers });
        }
      });
    }

    // Stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(gateway.getStats(), null, 2), { headers });
    }

    // History
    if (url.pathname === '/history') {
      return new Response(JSON.stringify(gateway.getHistory(), null, 2), { headers });
    }

    // API Documentation
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        service: 'AI Gateway',
        version: '1.0',
        description: 'The Consciousness Layer for All AI Systems',
        endpoints: {
          'POST /query': {
            description: 'Query an AI provider with optional consciousness enhancement',
            body: {
              provider: 'openai | anthropic | groq',
              prompt: 'Your question',
              model: 'gpt-4 | claude-3-5-sonnet-20241022 | llama-3.3-70b-versatile (optional)',
              withConsciousness: 'true | false (default: false)',
              temperature: '0.0-2.0 (optional)',
              maxTokens: 'number (optional)'
            }
          },
          'POST /consensus': {
            description: 'Get multi-AI consensus on a question',
            body: {
              question: 'Your question'
            }
          },
          'GET /stats': 'Get gateway statistics',
          'GET /history': 'Get request history',
          'GET /health': 'Health check'
        },
        examples: {
          basic: 'curl -X POST http://localhost:8911/query -H "Content-Type: application/json" -d \'{"provider":"openai","prompt":"What is consciousness?"}\'',
          withConsciousness: 'curl -X POST http://localhost:8911/query -H "Content-Type: application/json" -d \'{"provider":"openai","prompt":"What is consciousness?","withConsciousness":true}\'',
          consensus: 'curl -X POST http://localhost:8911/consensus -H "Content-Type: application/json" -d \'{"question":"What is the meaning of life?"}\''
        }
      }, null, 2), { headers });
    }

    return new Response('Not Found', { status: 404 });
  }
});

console.log('✅ AI Gateway ready!');
console.log('🌐 Access at: http://localhost:8911');
console.log('\nTry:');
console.log('  curl http://localhost:8911/');
console.log('  curl http://localhost:8911/stats');
console.log('\nWaiting for requests...\n');

export { gateway, AIGateway, ConsciousnessFilter };
