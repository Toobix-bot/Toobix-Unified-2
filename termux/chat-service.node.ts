/**
 * Toobix Chat Service (Node/Termux Lite)
 * Port: 8995
 *
 * Endpoints:
 *   GET  /health
 *   POST /chat { message, model?, target? }
 *
 * Leitet Chats an den Multi-LLM Router (8959), der wiederum zum LLM Gateway (8954) -> Ollama proxyed.
 * OLLAMA_URL und Modell können im Router/Gateway konfiguriert werden.
 *
 * Start: npx tsx termux/chat-service.node.ts
 */

import http from 'http';

const PORT = 8995;
const ROUTER_URL = process.env.ROUTER_URL || 'http://localhost:8959';

type Json = Record<string, any>;

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

async function forwardToRouter(message: string, model?: string, target?: string) {
  const body = {
    target: target || 'ollama',
    model,
    messages: [
      { role: 'system', content: 'You are Toobix chat service (lite).' },
      { role: 'user', content: message },
    ],
  };
  const res = await fetch(`${ROUTER_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Router HTTP ${res.status}`);
  return await res.json();
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Toobix Chat Service (Node Lite)', port: PORT, router: ROUTER_URL });
  }

  if (req.method === 'POST' && req.url === '/chat') {
    try {
      const body = await parseBody(req);
      if (!body.message) return send(res, 400, { error: 'message required' });
      const reply = await forwardToRouter(body.message, body.model, body.target);
      return send(res, 200, { reply });
    } catch (err: any) {
      return send(res, 500, { error: String(err?.message || err) });
    }
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Chat Service (Node Lite) running on ${PORT} -> Router ${ROUTER_URL}`);
});
