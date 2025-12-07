/**
 * Multi-LLM Router (Node/Termux Lite)
 * Port: 8959
 *
 * Endpoints:
 *   POST /chat { messages, model?, target? }
 *   GET  /health
 *
 * Routed Targets (einfache Auswahl):
 *   - ollama (default): http://localhost:8954 (LLM Gateway)
 *   - (weitere Targets könnten ergänzt werden)
 *
 * Start: npx tsx termux/llm-router.node.ts
 */

import http from 'http';

const PORT = 8959;
const TARGETS: Record<string, string> = {
  ollama: 'http://localhost:8954',
};
const DEFAULT_TARGET = 'ollama';

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

async function forward(target: string, body: any) {
  const url = TARGETS[target];
  if (!url) throw new Error(`Unknown target ${target}`);
  const res = await fetch(`${url}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Upstream ${target} HTTP ${res.status}`);
  return await res.json();
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, {
      status: 'ok',
      service: 'Multi-LLM Router (Node Lite)',
      port: PORT,
      targets: Object.keys(TARGETS),
    });
  }

  if (req.method === 'POST' && req.url === '/chat') {
    try {
      const body = await parseBody(req);
      const target = body.target || DEFAULT_TARGET;
      const data = await forward(target, body);
      return send(res, 200, data);
    } catch (err: any) {
      return send(res, 500, { error: String(err?.message || err) });
    }
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Multi-LLM Router (Node Lite) running on ${PORT} -> targets: ${Object.keys(TARGETS).join(', ')}`);
});
