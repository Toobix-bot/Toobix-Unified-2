/**
 * CHAT-GAME BRIDGE SERVICE
 * Port: 8971
 *
 * Connects chat messages to game mechanics
 * - AI-powered responses (Ollama/Groq)
 * - XP calculation based on message content
 * - Quest progression
 * - Story triggers
 */

import { serve } from 'bun';

// ========================================
// TYPES
// ========================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface GameEffect {
  xp: number;
  questUpdates?: { questId: string; progress: number }[];
  storyTrigger?: string;
  resourceGain?: Record<string, number>;
}

interface ChatResponse {
  message: string;
  gameEffects: GameEffect;
  metadata: {
    messageType: string;
    aiModel: string;
    responseTime: number;
  };
}

// ========================================
// CONFIG
// ========================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OLLAMA_URL = 'http://localhost:11434';
const PLAYER_STATE_URL = 'http://localhost:8970';

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

async function generateAIResponse(message: string, history: ChatMessage[]): Promise<string> {
  const startTime = Date.now();

  const systemPrompt = `You are Toobix, a gamified AI companion. You help users with:
- Life management & productivity
- Coding & learning
- Mental health & recovery
- Gamification of daily tasks

Keep responses concise (2-3 sentences) and encouraging. Use emojis sparingly.
Always be positive and supportive. Reference game mechanics when relevant (XP, quests, levels).`;

  try {
    // Try Groq first (PRIMARY)
    const groqAvailable = await checkGroq();

    if (groqAvailable) {
      console.log('🚀 Using Groq for response...');

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
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        console.log(`✅ Groq response in ${responseTime}ms`);
        return data.choices[0].message.content;
      }
    }

    // Fallback to Ollama
    const ollamaAvailable = await checkOllama();

    if (ollamaAvailable) {
      console.log('🤖 Using Ollama fallback...');

      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
          ],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        console.log(`✅ Ollama fallback response in ${responseTime}ms`);
        return data.message.content;
      }
    }

    // Final fallback to simple responses
    console.log('ℹ️ Using simple fallback responses');
    return getFallbackResponse(message);

  } catch (error) {
    console.error('❌ AI Error:', error);
    return getFallbackResponse(message);
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('hallo') || lower.includes('hi')) {
    return 'Hey! Schön dich zu sehen! 👋 Wie kann ich dir heute helfen?';
  }

  if (lower.includes('wie geht') || lower.includes('how are')) {
    return 'Mir geht\'s super! Ich bin bereit dir zu helfen. Was hast du vor? 🎮';
  }

  if (lower.includes('?')) {
    return 'Das ist eine gute Frage! 🤔 Lass mich darüber nachdenken...';
  }

  if (lower.includes('danke') || lower.includes('thanks')) {
    return 'Gerne! Dafür bin ich da! ✨';
  }

  if (lower.includes('code') || lower.includes('programming')) {
    return 'Ah, Coding! 💻 Das ist immer spannend. Woran arbeitest du gerade?';
  }

  if (lower.includes('game') || lower.includes('spiel')) {
    return 'Gaming ist großartig! 🎮 Vergiss nicht, auch deine Real-Life-Quests zu checken!';
  }

  const responses = [
    'Interessant! Erzähl mir mehr darüber. 🎯',
    'Das klingt spannend! Wie geht\'s weiter? 🚀',
    'Ich verstehe! Lass uns das weiter erkunden. 🧠',
    'Super! Du machst großartige Fortschritte! ⭐',
    'Das habe ich in deiner Memory Palace gespeichert! 💾'
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// ========================================
// MESSAGE ANALYSIS
// ========================================

function analyzeMessage(message: string): { type: string; xp: number } {
  const lower = message.toLowerCase();
  let xp = 5; // Base XP
  let type = 'message';

  // Question
  if (lower.includes('?')) {
    xp += 5;
    type = 'question';
  }

  // Long message
  if (message.length > 100) {
    xp += 10;
    type = 'detailed';
  }

  // Learning/Coding
  if (lower.includes('learn') || lower.includes('code') || lower.includes('study')) {
    xp += 15;
    type = 'learning';
  }

  // Reflection
  if (lower.includes('ich habe') || lower.includes('i learned') || lower.includes('heute')) {
    xp += 20;
    type = 'reflection';
  }

  // Achievement
  if (lower.includes('fertig') || lower.includes('geschafft') || lower.includes('done') || lower.includes('finished')) {
    xp += 30;
    type = 'achievement';
  }

  return { type, xp };
}

// ========================================
// GAME EFFECTS
// ========================================

async function applyGameEffects(effects: GameEffect) {
  // Gain XP
  if (effects.xp > 0) {
    await fetch(`${PLAYER_STATE_URL}/api/xp/gain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: effects.xp })
    });
  }

  // Update quests
  if (effects.questUpdates) {
    for (const update of effects.questUpdates) {
      await fetch(`${PLAYER_STATE_URL}/api/quest/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
    }
  }

  // Add resources
  if (effects.resourceGain) {
    await fetch(`${PLAYER_STATE_URL}/api/resources/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resources: effects.resourceGain })
    });
  }

  // Track message
  await fetch(`${PLAYER_STATE_URL}/api/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
}

// ========================================
// CONVERSATION HISTORY
// ========================================

const conversationHistory: ChatMessage[] = [];
const MAX_HISTORY = 20;

function addToHistory(role: 'user' | 'assistant', content: string) {
  conversationHistory.push({
    role,
    content,
    timestamp: new Date()
  });

  // Keep only last N messages
  if (conversationHistory.length > MAX_HISTORY) {
    conversationHistory.shift();
  }
}

// ========================================
// HTTP SERVER
// ========================================

const server = serve({
  port: 8971,
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

    // POST /api/chat - Send message
    if (path === '/api/chat' && req.method === 'POST') {
      const startTime = Date.now();
      const body = await req.json() as { message: string };
      const { message } = body;

      console.log(`💬 User: ${message.substring(0, 50)}...`);

      // Analyze message
      const analysis = analyzeMessage(message);

      // Generate AI response
      const aiResponse = await generateAIResponse(message, conversationHistory);

      // Add to history
      addToHistory('user', message);
      addToHistory('assistant', aiResponse);

      // Calculate game effects
      const gameEffects: GameEffect = {
        xp: analysis.xp,
        questUpdates: [
          { questId: 'first-message', progress: 1 },
          { questId: 'daily-messages', progress: 1 }
        ]
      };

      // Apply effects
      await applyGameEffects(gameEffects);

      const response: ChatResponse = {
        message: aiResponse,
        gameEffects,
        metadata: {
          messageType: analysis.type,
          aiModel: 'ollama/llama3.2:3b',
          responseTime: Date.now() - startTime
        }
      };

      console.log(`✅ Response (${response.metadata.responseTime}ms): ${aiResponse.substring(0, 50)}...`);
      console.log(`🎮 Game: +${gameEffects.xp} XP (${analysis.type})`);

      return new Response(JSON.stringify(response), { headers });
    }

    // GET /api/history - Get conversation history
    if (path === '/api/history' && req.method === 'GET') {
      return new Response(JSON.stringify(conversationHistory), { headers });
    }

    // POST /api/history/clear - Clear history
    if (path === '/api/history/clear' && req.method === 'POST') {
      conversationHistory.length = 0;
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response('Not Found', { status: 404, headers });
  }
});

// ========================================
// STARTUP
// ========================================

console.log('');
console.log('========================================');
console.log('  💬 CHAT-GAME BRIDGE SERVICE');
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
  console.log('  ⚠️  Using simple fallback responses');
}

console.log('');
console.log('Endpoints:');
console.log('  POST /api/chat            - Send message');
console.log('  GET  /api/history         - Get history');
console.log('  POST /api/history/clear   - Clear history');
console.log('');
console.log('✅ Ready!');
console.log('========================================');
console.log('');
