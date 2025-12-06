/**
 * Dream Core (Node/Termux Lite)
 * Port: 8961
 *
 * Endpoints:
 *   GET  /health
 *   POST /analyze { dream }
 *   POST /active/dream   (generiert einen kurzen Traum)
 *
 * Start: npx tsx termux/dream-core.node.ts
 */

import http from 'http';

const PORT = 8961;

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

function analyzeDreamText(dream: string) {
  const motifs: string[] = [];
  if (/meer|wasser|ocean|sea/i.test(dream)) motifs.push('Flow/Emotion');
  if (/flug|flugzeug|fliegen|sky/i.test(dream)) motifs.push('Freiheit/Überblick');
  if (/haus|home|room/i.test(dream)) motifs.push('Sicherheit/Identität');
  if (/treppe|stair/i.test(dream)) motifs.push('Übergang/Entwicklung');
  return motifs.length ? motifs : ['Erkundung', 'Verarbeitung'];
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok', service: 'Dream Core (Node Lite)', port: PORT });
  }

  if (req.method === 'POST' && req.url === '/analyze') {
    const body = await parseBody(req);
    const dream: string = body.dream || '';
    const motifs = analyzeDreamText(dream);
    return send(res, 200, {
      dreamSummary: dream.slice(0, 200),
      motifs,
      guidance: 'Halte Stimmung und Kernbilder fest, notiere eine kleine Handlungsidee für morgen.'
    });
  }

  if (req.method === 'POST' && req.url === '/active/dream') {
    return send(res, 200, {
      dream: 'Du gehst über eine Brücke aus Licht, unter dir ein stilles Meer. Am anderen Ufer wartet Ruhe.',
      note: 'Generierter Kurztraum (Stub).'
    });
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Dream Core (Node Lite) running on ${PORT}`);
});
