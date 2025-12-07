/**
 * Generic Node-Lite Service
 * Reads SERVICE_NAME and SERVICE_PORT from env, serves /health and /status.
 *
 * Usage:
 *   SERVICE_NAME="Example" SERVICE_PORT=9999 npx tsx termux/service-generic.node.ts
 */

import http from 'http';

const NAME = process.env.SERVICE_NAME || 'Generic Service';
const PORT = Number(process.env.SERVICE_PORT || 0);

if (!PORT) {
  console.error('SERVICE_PORT not set');
  process.exit(1);
}

function send(res: http.ServerResponse, status: number, data: Record<string, any>) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: NAME, port: PORT });
  }
  if (req.method === 'GET' && req.url === '/status') {
    return send(res, 200, { status: 'running', service: NAME, port: PORT, stub: true });
  }

  send(res, 404, { error: 'Not Found', service: NAME });
});

server.listen(PORT, () => {
  console.log(`${NAME} (Node Lite) running on ${PORT}`);
});
