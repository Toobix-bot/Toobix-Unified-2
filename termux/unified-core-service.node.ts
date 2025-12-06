/**
 * Unified Core Service (Node/Termux Lite)
 * Port: 8000
 *
 * Endpoints:
 *   GET /health
 *   GET /status
 *
 * Start: npx tsx termux/unified-core-service.node.ts
 */

import http from 'http';

const PORT = 8000;

function send(res: http.ServerResponse, status: number, data: Record<string, any>) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Unified Core Service (Node Lite)', port: PORT });
  }
  if (req.method === 'GET' && req.url === '/status') {
    return send(res, 200, {
      status: 'running',
      components: ['state', 'memory', 'router'].map(name => ({ name, ok: true })),
      note: 'Lite-Version ohne interne Logik'
    });
  }
  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Unified Core Service (Node Lite) running on ${PORT}`);
});
