/**
 * Memory Palace v4 (Node/Termux Lite)
 * Port: 8953
 *
 * Endpoints:
 *   GET  /health
 *   POST /save { key, data }
 *   POST /get  { key }
 *
 * Speicherung: einfache JSON-Datei im Repo-Pfad (./data/memory-palace.json)
 * Start: npx tsx termux/memory-palace.node.ts
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8953;
const DATA_PATH = path.join(process.cwd(), 'data', 'memory-palace.json');

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

function ensureFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify({}), 'utf8');
}

function loadStore(): Record<string, any> {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, any>) {
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2), 'utf8');
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Memory Palace (Node Lite)', port: PORT });
  }

  if (req.method === 'POST' && req.url === '/save') {
    const body = await parseBody(req);
    if (!body.key) return send(res, 400, { error: 'key required' });
    const store = loadStore();
    store[body.key] = body.data ?? null;
    saveStore(store);
    return send(res, 200, { ok: true });
  }

  if (req.method === 'POST' && req.url === '/get') {
    const body = await parseBody(req);
    if (!body.key) return send(res, 400, { error: 'key required' });
    const store = loadStore();
    return send(res, 200, { key: body.key, data: store[body.key] ?? null });
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Memory Palace (Node Lite) running on ${PORT}`);
});
