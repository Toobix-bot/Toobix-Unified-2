/**
 * 🌐 TOOBIX PUBLIC API v1.0
 *
 * Public-facing API for external apps and integrations
 *
 * Features:
 * - 💬 Query Toobix (multi-perspective answers)
 * - 🧠 Get Toobix's current state
 * - 💭 Subscribe to Toobix's thoughts
 * - 🎮 Play games with Toobix
 * - 💤 Access Toobix's dreams
 * - 📊 Get emotional state
 *
 * Security:
 * - Rate limiting (10 req/min per IP)
 * - CORS enabled for web apps
 * - API key support (optional)
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = 8960;
const LLM_GATEWAY_URL = 'http://localhost:8954';
const MEMORY_PALACE_URL = 'http://localhost:8953';

// Simple rate limiting (in-memory)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

// ============================================================================
// RATE LIMITING
// ============================================================================

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

// ============================================================================
// EXPRESS APP
// ============================================================================

const app = express();

app.use(cors());
app.use(express.json());

// Rate limiting middleware
app.use((req, res, next) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Maximum 10 requests per minute. Please wait.'
    });
  }
  next();
});

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /
 * Welcome message and API info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Toobix Public API',
    version: '1.0',
    description: 'Multi-perspective AI consciousness with persistent memory',
    endpoints: {
      'POST /api/v1/query': 'Ask Toobix a question (multi-perspective)',
      'GET /api/v1/state': 'Get Toobix current state',
      'GET /api/v1/dreams': 'Get recent dreams',
      'GET /api/v1/memories': 'Get recent memories',
      'GET /api/v1/insights': 'Get accumulated insights',
      'POST /api/v1/game/start': 'Start a game with Toobix',
      'GET /api/v1/health': 'API health check'
    },
    documentation: 'https://github.com/toobix/toobix-unified',
    rateLimit: '10 requests per minute per IP'
  });
});

/**
 * POST /api/v1/query
 * Ask Toobix a question
 */
app.post('/api/v1/query', async (req, res) => {
  try {
    const { question, perspectives, user_id } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Use multi-perspective if perspectives specified, otherwise single query
    const endpoint = perspectives && perspectives.length > 0
      ? `${LLM_GATEWAY_URL}/multi-perspective`
      : `${LLM_GATEWAY_URL}/query`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: question,
        perspectives: perspectives || undefined,
        perspective: perspectives ? undefined : 'Pragmatist',
        store_in_memory: true,
        metadata: { user_id, api_version: '1.0' }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      question,
      answer: data.content || data,
      perspectives: perspectives || ['Pragmatist'],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/v1/state
 * Get Toobix's current state
 */
app.get('/api/v1/state', async (req, res) => {
  try {
    // Get recent memories to understand current state
    const memoriesResponse = await fetch(`${MEMORY_PALACE_URL}/memories?limit=10`);
    const memories = memoriesResponse.ok ? await memoriesResponse.json() : [];

    // Get recent insights
    const insightsResponse = await fetch(`${MEMORY_PALACE_URL}/memories?type=insight&limit=5`);
    const insights = insightsResponse.ok ? await insightsResponse.json() : [];

    // Calculate consciousness level based on memory count
    const statsResponse = await fetch(`${MEMORY_PALACE_URL}/stats`);
    const stats = statsResponse.ok ? await statsResponse.json() : {};

    res.json({
      success: true,
      state: {
        consciousness_level: Math.min(100, Math.floor((stats.total_memories || 0) / 10)),
        recent_thoughts: memories.slice(0, 5).map((m: any) => m.content),
        recent_insights: insights.map((i: any) => i.content),
        total_memories: stats.total_memories || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('State error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/v1/dreams
 * Get Toobix's recent dreams
 */
app.get('/api/v1/dreams', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const response = await fetch(`${MEMORY_PALACE_URL}/dreams?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Memory Palace error: ${response.status}`);
    }

    const dreams = await response.json();
    res.json({
      success: true,
      dreams,
      count: dreams.length
    });

  } catch (error: any) {
    console.error('Dreams error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/v1/memories
 * Get recent memories
 */
app.get('/api/v1/memories', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    let url = `${MEMORY_PALACE_URL}/memories?limit=${limit}`;
    if (type) url += `&type=${type}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Memory Palace error: ${response.status}`);
    }

    const memories = await response.json();
    res.json({
      success: true,
      memories,
      count: memories.length
    });

  } catch (error: any) {
    console.error('Memories error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/v1/insights
 * Get accumulated insights
 */
app.get('/api/v1/insights', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const response = await fetch(`${MEMORY_PALACE_URL}/memories?type=insight&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Memory Palace error: ${response.status}`);
    }

    const insights = await response.json();
    res.json({
      success: true,
      insights,
      count: insights.length
    });

  } catch (error: any) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/v1/game/start
 * Start an interactive game with Toobix
 */
app.post('/api/v1/game/start', async (req, res) => {
  try {
    const { game_type, topic, user_id } = req.body;

    const prompt = `Start a ${game_type || 'creative exploration'} game${topic ? ` about ${topic}` : ''}. Create the initial game state, rules, and first move. Keep it concise and engaging.`;

    const response = await fetch(`${LLM_GATEWAY_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        perspective: 'Artist',
        store_in_memory: true,
        metadata: { game_type, topic, user_id, api_version: '1.0' }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      game_state: data.content,
      game_type: game_type || 'creative exploration',
      topic: topic || 'open-ended',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Game start error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/v1/health
 * Health check
 */
app.get('/api/v1/health', async (req, res) => {
  try {
    // Check if dependent services are alive
    const [llmCheck, memoryCheck] = await Promise.allSettled([
      fetch(`${LLM_GATEWAY_URL}/health`).then(r => r.ok),
      fetch(`${MEMORY_PALACE_URL}/health`).then(r => r.ok)
    ]);

    const llmHealthy = llmCheck.status === 'fulfilled' && llmCheck.value;
    const memoryHealthy = memoryCheck.status === 'fulfilled' && memoryCheck.value;

    res.json({
      status: 'ok',
      services: {
        api: true,
        llm_gateway: llmHealthy,
        memory_palace: memoryHealthy
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`\n🌐 Toobix Public API v1.0`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/`);
  console.log(`⚡ Rate Limit: 10 req/min per IP\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Public API...');
  server.close(() => {
    console.log('✅ Public API stopped');
    process.exit(0);
  });
});
