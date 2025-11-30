/**
 * PROMPT VARIATIONS SERVICE
 * Port: 8974
 *
 * Generates alternative versions of user prompts
 * before they hit send - MEGA COOL FEATURE!
 *
 * User types: "How do I learn Rust?"
 * Gets 3-4 variations:
 * - "What's the best way to get started with Rust programming?"
 * - "Can you create a Rust learning roadmap for beginners?"
 * - "Show me practical Rust examples to learn from"
 * - "How long does it take to become proficient in Rust?"
 */

import { serve } from 'bun';

// ========================================
// TYPES
// ========================================

interface PromptVariation {
  original: string;
  variations: {
    text: string;
    style: string;
    description: string;
  }[];
  generationTime: number;
}

// ========================================
// CONFIG
// ========================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OLLAMA_URL = 'http://localhost:11434';

// ========================================
// AI INTEGRATION
// ========================================

async function checkGroq(): Promise<boolean> {
  if (!GROQ_API_KEY) return false;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkOllama(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

async function generateVariations(prompt: string): Promise<PromptVariation> {
  const startTime = Date.now();

  const systemPrompt = `You are a prompt variation generator. Given a user's original prompt, generate 4 alternative versions that:
1. Keep the core intent
2. Use different phrasing/style
3. May add clarification or specificity
4. Are each unique in approach

Respond ONLY with JSON in this exact format (no markdown, no extra text):
{
  "variations": [
    {"text": "variation 1", "style": "direct", "description": "short description"},
    {"text": "variation 2", "style": "detailed", "description": "short description"},
    {"text": "variation 3", "style": "casual", "description": "short description"},
    {"text": "variation 4", "style": "professional", "description": "short description"}
  ]
}

Styles: direct, detailed, casual, professional, creative, technical`;

  try {
    // Try Groq first (PRIMARY)
    const groqAvailable = await checkGroq();

    if (groqAvailable) {
      console.log(`🚀 Generating variations with Groq for: "${prompt.substring(0, 50)}..."`);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
          const parsed = JSON.parse(content);
          const generationTime = Date.now() - startTime;

          console.log(`✅ Generated ${parsed.variations.length} variations with Groq in ${generationTime}ms`);

          return {
            original: prompt,
            variations: parsed.variations,
            generationTime
          };
        } catch (parseError) {
          console.error('❌ JSON parse error from Groq:', parseError);
          // Try Ollama fallback
        }
      }
    }

    // Fallback to Ollama
    const ollamaAvailable = await checkOllama();

    if (ollamaAvailable) {
      console.log(`🤖 Generating variations with Ollama fallback for: "${prompt.substring(0, 50)}..."`);

      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: false,
          format: 'json'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.message.content;

        try {
          const parsed = JSON.parse(content);
          const generationTime = Date.now() - startTime;

          console.log(`✅ Generated ${parsed.variations.length} variations with Ollama in ${generationTime}ms`);

          return {
            original: prompt,
            variations: parsed.variations,
            generationTime
          };
        } catch (parseError) {
          console.error('❌ JSON parse error from Ollama:', parseError);
          return getFallbackVariations(prompt, startTime);
        }
      }
    }

    // Final fallback
    return getFallbackVariations(prompt, startTime);

  } catch (error) {
    console.error('❌ Variation generation error:', error);
    return getFallbackVariations(prompt, startTime);
  }
}

function getFallbackVariations(prompt: string, startTime: number): PromptVariation {
  const lower = prompt.toLowerCase();

  let variations: PromptVariation['variations'] = [];

  // Pattern-based fallbacks
  if (lower.includes('how') || lower.includes('wie')) {
    variations = [
      {
        text: `${prompt} (Step-by-step guide)`,
        style: 'detailed',
        description: 'Detailed step-by-step approach'
      },
      {
        text: `What's the best way to ${prompt.replace(/^how (do|to|can) i /i, '')}?`,
        style: 'direct',
        description: 'Direct question about best approach'
      },
      {
        text: `Can you help me understand ${prompt.replace(/^how /i, '')}?`,
        style: 'casual',
        description: 'Casual learning request'
      },
      {
        text: `Explain ${prompt.replace(/^how (do|to|can) i /i, '')} in detail`,
        style: 'professional',
        description: 'Professional explanation request'
      }
    ];
  } else if (lower.includes('what') || lower.includes('was')) {
    variations = [
      {
        text: `${prompt} (with examples)`,
        style: 'detailed',
        description: 'Request with examples'
      },
      {
        text: `Explain: ${prompt.replace(/^what (is|are) /i, '')}`,
        style: 'direct',
        description: 'Direct explanation'
      },
      {
        text: `Can you tell me about ${prompt.replace(/^what (is|are) /i, '')}?`,
        style: 'casual',
        description: 'Casual inquiry'
      },
      {
        text: `Provide an overview of ${prompt.replace(/^what (is|are) /i, '')}`,
        style: 'professional',
        description: 'Professional overview'
      }
    ];
  } else {
    // Generic variations
    variations = [
      {
        text: `${prompt} (detailed explanation)`,
        style: 'detailed',
        description: 'More detailed version'
      },
      {
        text: `Help me with: ${prompt}`,
        style: 'direct',
        description: 'Direct help request'
      },
      {
        text: `${prompt} - can you explain?`,
        style: 'casual',
        description: 'Casual question'
      },
      {
        text: `${prompt} (comprehensive answer)`,
        style: 'professional',
        description: 'Professional comprehensive request'
      }
    ];
  }

  return {
    original: prompt,
    variations,
    generationTime: Date.now() - startTime
  };
}

// ========================================
// HTTP SERVER
// ========================================

const server = serve({
  port: 8974,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // POST /api/variations - Generate variations
    if (path === '/api/variations' && req.method === 'POST') {
      const body = await req.json() as { prompt: string };
      const { prompt } = body;

      if (!prompt || prompt.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Prompt is required' }),
          { status: 400, headers }
        );
      }

      const result = await generateVariations(prompt);
      return new Response(JSON.stringify(result), { headers });
    }

    // GET /api/health - Health check
    if (path === '/api/health' && req.method === 'GET') {
      const ollamaAvailable = await checkOllama();
      return new Response(
        JSON.stringify({
          status: 'healthy',
          ollama: ollamaAvailable,
          timestamp: new Date()
        }),
        { headers }
      );
    }

    return new Response('Not Found', { status: 404, headers });
  }
});

// ========================================
// STARTUP
// ========================================

console.log('');
console.log('========================================');
console.log('  🎨 PROMPT VARIATIONS SERVICE');
console.log('========================================');
console.log('');
console.log(`Port: ${server.port}`);
console.log('');
console.log('Checking AI availability...');

const groqAvailable = await checkGroq();
const ollamaAvailable = await checkOllama();

console.log(`  🚀 Groq: ${groqAvailable ? '✅ Available (PRIMARY)' : '❌ Not available'}`);
console.log(`  🤖 Ollama: ${ollamaAvailable ? '✅ Available (FALLBACK)' : '❌ Not available'}`);

if (!groqAvailable && !ollamaAvailable) {
  console.log('  ⚠️  Using pattern-based fallbacks');
}

console.log('');
console.log('Endpoints:');
console.log('  POST /api/variations      - Generate variations');
console.log('  GET  /api/health          - Health check');
console.log('');
console.log('✅ Ready!');
console.log('========================================');
console.log('');
