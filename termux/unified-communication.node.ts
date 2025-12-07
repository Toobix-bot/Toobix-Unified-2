/**
 * Unified Communication Service (Node/Termux Lite)
 * Port: 8001
 *
 * Endpoints:
 *   GET  /health
 *   POST /send { message, channel?, model?, target? }
 *
 * Nutzt intern den Chat Service (8995).
 *
 * Start: npx tsx termux/unified-communication.node.ts
 */

import http from 'http';

const PORT = 8001;
const CHAT_URL = process.env.CHAT_URL || 'http://localhost:8995';

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

async function forwardToChat(message: string, model?: string, target?: string) {
  const res = await fetch(`${CHAT_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model, target }),
  });
  if (!res.ok) throw new Error(`Chat Service HTTP ${res.status}`);
  return await res.json();
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Unified Communication (Node Lite)', port: PORT, chat: CHAT_URL });
  }

  if (req.method === 'POST' && req.url === '/send') {
    try {
      const body = await parseBody(req);
      if (!body.message) return send(res, 400, { error: 'message required' });
      const data = await forwardToChat(body.message, body.model, body.target);
      return send(res, 200, data);
    } catch (err: any) {
      return send(res, 500, { error: String(err?.message || err) });
    }
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Unified Communication (Node Lite) running on ${PORT} -> Chat ${CHAT_URL}`);
});
