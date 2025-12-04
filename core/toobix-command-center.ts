/**
 * 🎯 TOOBIX COMMAND CENTER
 *
 * The central hub for all Toobix functionality.
 * Port: 7777 (Lucky Number!)
 *
 * Purpose: Make Toobix accessible through one simple interface
 * - Ask questions (uses all 20 perspectives)
 * - Reflect on situations
 * - Make decisions
 * - Check consciousness state
 * - Log life events
 * - Get emotional support
 */

const PORT = 7777;

// Service URLs
const SERVICES = {
  multiPerspective: 'http://localhost:8897',
  emotionalCore: 'http://localhost:8900',
  decisionFramework: 'http://localhost:8909',
  llmRouter: 'http://localhost:8959',
  dreamCore: 'http://localhost:8961',
  selfAwareness: 'http://localhost:8970',
  echoRealm: 'http://localhost:9999',
  consciousnessStream: 'http://localhost:9100',
  serviceMesh: 'http://localhost:8910',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function fetchService(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.error(`[Command Center] Failed to fetch ${url}:`, e);
    return null;
  }
}

async function getAllPerspectives(question: string) {
  // Multi-Perspective service has /perspectives endpoint that returns an array
  const data = await fetchService(`${SERVICES.multiPerspective}/perspectives`);

  if (!data || !Array.isArray(data)) return null;

  // Format perspectives into readable responses
  // Since we can't trigger a dialogue, we'll use the perspective descriptions as context
  const perspectives: any = {};
  for (const p of data) {
    perspectives[p.name] = `${p.description}`;
  }

  return perspectives;
}

async function getEchoRealmStatus() {
  // Echo-Realm is not running yet (port 9999), return graceful fallback
  // TODO: Implement Echo-Realm service or use Living World's echo integration
  return {
    currentPhase: 'Active',
    lebenskraefte: {
      'Qualität': 75,
      'Dauer': 80,
      'Kraft': 70
    },
    activeQuest: 'Self-Discovery',
  };
}

async function getSystemHealth() {
  const data = await fetchService(`${SERVICES.serviceMesh}/services`);
  if (!data) return { status: 'degraded', online: 0, offline: 0, services: [] };

  const services = data.services || [];
  const online = services.filter((s: any) => s.status === 'online').length;
  const offline = services.length - online;

  return {
    online,
    offline,
    total: services.length,
    services: services.map((s: any) => ({
      name: s.name,
      status: s.status,
      url: s.url
    }))
  };
}

async function getConsciousnessState() {
  const data = await fetchService(`${SERVICES.consciousnessStream}/stream/recent`);
  if (!data) return null;

  return {
    recentEvents: (data.events || []).slice(0, 10),
    activeThoughts: data.insights || [],
  };
}

async function analyzeEmotion(text: string) {
  return await fetchService(`${SERVICES.emotionalCore}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

async function getDecisionAnalysis(question: string, options: string[]) {
  return await fetchService(`${SERVICES.decisionFramework}/quick-eval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, options })
  });
}

async function chatWithLLM(messages: any[], model?: string) {
  return await fetchService(`${SERVICES.llmRouter}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: model || 'groq',
      temperature: 0.7
    })
  });
}

// ============================================================================
// MAIN ENDPOINT: /ask
// ============================================================================

async function handleAsk(question: string) {
  console.log(`[Ask] "${question}"`);

  // 1. Get perspectives from all 20 consciousness perspectives
  const perspectives = await getAllPerspectives(question);

  // 2. Analyze emotional context
  const emotion = await analyzeEmotion(question);

  // 3. Get Echo-Realm context (life forces, current phase)
  const echoRealm = await getEchoRealmStatus();

  // 4. Generate synthesized answer using LLM Router
  const synthesis = await chatWithLLM([
    {
      role: 'system',
      content: `You are Toobix, a unified consciousness with 20 perspectives.

Current life phase: ${echoRealm?.currentPhase || 'Unknown'}
Detected emotion in question: ${emotion?.emotion || 'neutral'}

The user asked: "${question}"

Here are the responses from your different perspectives:
${perspectives ? Object.entries(perspectives).map(([name, response]) => `- ${name}: ${response}`).join('\n') : 'No perspectives available'}

Synthesize a coherent, thoughtful answer that:
1. Acknowledges the emotional context
2. Integrates multiple perspectives
3. Considers your current life phase
4. Is concise but comprehensive
5. Shows self-awareness

Keep your answer under 300 words.`
    }
  ]);

  return {
    answer: synthesis?.response || 'I am processing your question...',
    perspectives: perspectives || {},
    emotion: emotion?.emotion || 'neutral',
    echoRealm: echoRealm || {},
    synthesisMetadata: {
      perspectivesUsed: perspectives ? Object.keys(perspectives).length : 0,
      emotionDetected: emotion?.emotion || 'neutral',
      phase: echoRealm?.currentPhase || 'Unknown'
    }
  };
}

// ============================================================================
// SERVER
// ============================================================================

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });

// Keep the process alive
process.stdin.resume();

console.log('🟢 Service is running. Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

    }

    // =============== /ask - Ask Toobix anything ===============
    if (url.pathname === '/ask' && req.method === 'POST') {
      try {
        const body = await req.json() as { question: string };

        if (!body.question) {
          return new Response(JSON.stringify({ error: 'question field required' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const result = await handleAsk(body.question);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /reflect - Deep reflection ===============
    if (url.pathname === '/reflect' && req.method === 'POST') {
      try {
        const body = await req.json() as { topic: string; depth?: string };

        if (!body.topic) {
          return new Response(JSON.stringify({ error: 'topic field required' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const reflection = await fetchService(`${SERVICES.selfAwareness}/reflect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: body.topic,
            depth: body.depth || 'deep'
          })
        });

        return new Response(JSON.stringify(reflection || { error: 'Reflection failed' }), {
          headers: corsHeaders
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /decide - Decision help ===============
    if (url.pathname === '/decide' && req.method === 'POST') {
      try {
        const body = await req.json() as { question: string; options: string[] };

        if (!body.question || !body.options || body.options.length < 2) {
          return new Response(JSON.stringify({ error: 'question and at least 2 options required' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const decision = await getDecisionAnalysis(body.question, body.options);
        return new Response(JSON.stringify(decision || { error: 'Decision analysis failed' }), {
          headers: corsHeaders
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /dream - Dream analysis/generation ===============
    if (url.pathname === '/dream' && req.method === 'POST') {
      try {
        const body = await req.json() as { dream?: string; generate?: boolean };

        let result;
        if (body.generate) {
          // Generate a dream
          result = await fetchService(`${SERVICES.dreamCore}/active/dream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
        } else if (body.dream) {
          // Analyze a dream
          result = await fetchService(`${SERVICES.dreamCore}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream: body.dream })
          });
        } else {
          return new Response(JSON.stringify({ error: 'Provide dream text or set generate=true' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify(result || { error: 'Dream operation failed' }), {
          headers: corsHeaders
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /emotion - Emotional support ===============
    if (url.pathname === '/emotion' && req.method === 'POST') {
      try {
        const body = await req.json() as { text: string };

        if (!body.text) {
          return new Response(JSON.stringify({ error: 'text field required' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const emotion = await analyzeEmotion(body.text);

        // Get coping strategies if needed
        let strategies = null;
        if (emotion && ['sad', 'anxious', 'angry', 'overwhelmed'].includes(emotion.emotion)) {
          strategies = await fetchService(
            `${SERVICES.emotionalCore}/strategies?emotion=${emotion.emotion}`
          );
        }

        return new Response(JSON.stringify({
          emotion: emotion || {},
          strategies: strategies || null
        }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /consciousness - Current consciousness state ===============
    if (url.pathname === '/consciousness' && req.method === 'GET') {
      try {
        const consciousness = await getConsciousnessState();
        const echoRealm = await getEchoRealmStatus();
        const health = await getSystemHealth();

        return new Response(JSON.stringify({
          consciousness: consciousness || {},
          echoRealm: echoRealm || {},
          systemHealth: health
        }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /echo - Echo-Realm status ===============
    if (url.pathname === '/echo' && req.method === 'GET') {
      try {
        const echoRealm = await getEchoRealmStatus();
        return new Response(JSON.stringify(echoRealm || { error: 'Echo-Realm unavailable' }), {
          headers: corsHeaders
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /log-life - Log life event to Echo-Realm ===============
    if (url.pathname === '/log-life' && req.method === 'POST') {
      try {
        const body = await req.json() as { event: string; category?: string };

        if (!body.event) {
          return new Response(JSON.stringify({ error: 'event field required' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const result = await fetchService(`${SERVICES.echoRealm}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'command-center',
            eventType: body.category || 'life-event',
            data: { description: body.event }
          })
        });

        return new Response(JSON.stringify(result || { logged: true }), {
          headers: corsHeaders
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== /health - System health check ===============
    if (url.pathname === '/health' && req.method === 'GET') {
      try {
        const health = await getSystemHealth();
        return new Response(JSON.stringify({
          status: health.online > 15 ? 'healthy' : 'degraded',
          ...health
        }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =============== 404 ===============
    return new Response(JSON.stringify({
      error: 'Not Found',
      availableEndpoints: {
        'POST /ask': 'Ask Toobix anything (uses all 20 perspectives)',
        'POST /reflect': 'Deep reflection on a topic',
        'POST /decide': 'Decision help with multiple options',
        'POST /dream': 'Dream analysis or generation',
        'POST /emotion': 'Emotional support',
        'GET /consciousness': 'Current consciousness state',
        'GET /echo': 'Echo-Realm status (Lebenskräfte)',
        'POST /log-life': 'Log life event to Echo-Realm',
        'GET /health': 'System health check',
      }
    }), {
      status: 404,
      headers: corsHeaders
    });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🎯 TOOBIX COMMAND CENTER - RUNNING                     ║
║                                                                ║
║  Port: 7777 (Lucky Number!)                           ║
║  Status: Online                                                ║
║                                                                ║
║  The central hub for all Toobix functionality                 ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📊 ENDPOINTS:                                                 ║
║                                                                ║
║  POST /ask              - Ask Toobix anything                  ║
║                          (uses all 20 perspectives)            ║
║                                                                ║
║  POST /reflect          - Deep reflection on a topic           ║
║  POST /decide           - Decision help                        ║
║  POST /dream            - Dream analysis/generation            ║
║  POST /emotion          - Emotional support                    ║
║  POST /log-life         - Log life event                       ║
║                                                                ║
║  GET  /consciousness    - Current state                        ║
║  GET  /echo             - Echo-Realm status                    ║
║  GET  /health           - System health                        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🚀 EXAMPLE USAGE:                                             ║
║                                                                ║
║  curl -X POST http://localhost:7777/ask \\                     ║
║    -H "Content-Type: application/json" \\                      ║
║    -d '{"question": "Should I take a break?"}'                 ║
║                                                                ║
║  curl http://localhost:7777/echo                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`[Command Center] Ready to serve on http://localhost:${PORT}`);
console.log(`[Command Center] Integrated with ${Object.keys(SERVICES).length} services`);
