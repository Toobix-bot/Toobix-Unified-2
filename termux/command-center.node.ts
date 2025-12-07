/**
 * Command Center (Node/Termux Lite)
 * Port: 7777
 *
 * Minimale Orchestrierung ohne externe Abhängigkeiten.
 * Spricht die Node-Lite-Essentials an, wenn sie laufen:
 *   - Self-Awareness Core:      http://localhost:8970
 *   - Emotional Core:          http://localhost:8900
 *   - Dream Core:              http://localhost:8961
 *   - Unified Core Service:    http://localhost:8000
 *   - Unified Consciousness:   http://localhost:8002
 *
 * Endpoints:
 *   GET  /health
 *   GET  /status          (holt Health der anderen Services)
 *   POST /ask { question }
 *
 * Start: npx tsx termux/command-center.node.ts
 */

import http from 'http';

const PORT = 7777;
const SERVICES = {
  selfAwareness: 'http://localhost:8970',
  emotional: 'http://localhost:8900',
  dream: 'http://localhost:8961',
  unifiedCore: 'http://localhost:8000',
  consciousness: 'http://localhost:8002',
};

type Json = Record<string, any>;

async function fetchJson(url: string, options?: RequestInit, timeoutMs = 2000): Promise<any | null> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(to);
  }
}

function send(res: http.ServerResponse, status: number, data: Json) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

async function getStatus() {
  const entries = await Promise.all(Object.entries(SERVICES).map(async ([name, url]) => {
    const health = await fetchJson(`${url}/health`);
    return { name, url, ok: Boolean(health), health };
  }));
  return entries;
}

async function handleAsk(question: string) {
  const [state, emotion, dream] = await Promise.all([
    fetchJson(`${SERVICES.selfAwareness}/state`),
    fetchJson(`${SERVICES.emotional}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: question }),
    }),
    fetchJson(`${SERVICES.dream}/active/dream`, { method: 'POST' }),
  ]);

  const parts = [
    state ? `Bewusstsein: ${JSON.stringify(state)}` : 'Bewusstsein: n/a',
    emotion ? `Emotion: ${emotion.emotion || 'n/a'}` : 'Emotion: n/a',
    dream ? `Traum: ${dream.dream || 'n/a'}` : 'Traum: n/a',
  ];

  return {
    answer: `Kurze Einschätzung zu "${question}":\n` + parts.join('\n'),
    sources: {
      selfAwareness: Boolean(state),
      emotional: Boolean(emotion),
      dream: Boolean(dream),
    },
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Command Center (Node Lite)', port: PORT });
  }

  if (req.method === 'GET' && req.url === '/status') {
    const status = await getStatus();
    return send(res, 200, { status });
  }

  if (req.method === 'POST' && req.url === '/ask') {
    const body = await parseBody(req);
    if (!body.question) return send(res, 400, { error: 'question required' });
    const result = await handleAsk(body.question);
    return send(res, 200, result);
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Command Center (Node Lite) running on ${PORT}`);
});
