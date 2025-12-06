/**
 * Unified Consciousness Service (Node/Termux Lite)
 * Port: 8002
 *
 * Endpoints:
 *   GET /health
 *   GET /state
 *
 * Start: npx tsx termux/unified-consciousness-service.node.ts
 */

import http from 'http';

const PORT = 8002;

function send(res: http.ServerResponse, status: number, data: Record<string, any>) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Unified Consciousness (Node Lite)', port: PORT });
  }
  if (req.method === 'GET' && req.url === '/state') {
    return send(res, 200, {
      coherence: 'stable',
      streams: ['awareness', 'emotion', 'memory'].map(name => ({ name, status: 'linked' })),
      note: 'Stub-Status ohne echte Synchronisation'
    });
  }
  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Unified Consciousness (Node Lite) running on ${PORT}`);
});
