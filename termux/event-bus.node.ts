/**
 * Event Bus (Node/Termux Lite)
 * Port: 8920
 *
 * Endpoints:
 *   GET  /health
 *   POST /publish { topic, data }
 *   GET  /events?topic=foo (liefert letzte N Events)
 *
 * Speicher: In-Memory (verliert Daten nach Restart)
 * Start: npx tsx termux/event-bus.node.ts
 */

import http from 'http';
import { URL } from 'url';

const PORT = 8920;
const MAX_EVENTS = 200;
const events: { topic: string; data: any; ts: string }[] = [];

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

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { status: 'ok', service: 'Event Bus (Node Lite)', port: PORT });
  }

  if (req.method === 'POST' && url.pathname === '/publish') {
    const body = await parseBody(req);
    if (!body.topic) return send(res, 400, { error: 'topic required' });
    events.push({ topic: body.topic, data: body.data ?? null, ts: new Date().toISOString() });
    if (events.length > MAX_EVENTS) events.shift();
    return send(res, 200, { ok: true, size: events.length });
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    const topic = url.searchParams.get('topic');
    const filtered = topic ? events.filter(e => e.topic === topic) : events;
    return send(res, 200, { events: filtered.slice(-50) });
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Event Bus (Node Lite) running on ${PORT}`);
});
