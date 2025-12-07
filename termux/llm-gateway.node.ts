/**
 * LLM Gateway (Node/Termux Lite)
 * Port: 8954
 *
 * Endpoints:
 *   POST /chat { messages: [{role, content}], model?, stream? }
 *   GET  /health
 *
 * Implementiert einfachen Proxy zu Ollama (lokal):
 *   - OLLAMA_URL env, default http://127.0.0.1:11434
 *   - Model default: llama3.2:3b
 *
 * Start: npx tsx termux/llm-gateway.node.ts
 */

import http from 'http';

const PORT = 8954;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

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

async function proxyToOllama(body: any) {
  const model = body.model || DEFAULT_MODEL;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const payload = { model, messages, stream: false };

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}`);
  }
  return await res.json();
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'LLM Gateway (Node Lite)', port: PORT, ollama: OLLAMA_URL });
  }

  if (req.method === 'POST' && req.url === '/chat') {
    try {
      const body = await parseBody(req);
      const data = await proxyToOllama(body);
      return send(res, 200, data);
    } catch (err: any) {
      return send(res, 500, { error: String(err?.message || err) });
    }
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`LLM Gateway (Node Lite) running on ${PORT} -> ${OLLAMA_URL}`);
});
