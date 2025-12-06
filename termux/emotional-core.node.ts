/**
 * Emotional Core (Node/Termux Lite)
 * Port: 8900
 *
 * Endpoints:
 *   GET  /health
 *   POST /analyze  { text }
 *   GET  /strategies?emotion=sad|anxious|angry|overwhelmed
 *
 * Start: npx tsx termux/emotional-core.node.ts
 */

import http from 'http';
import { URL } from 'url';

const PORT = 8900;

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

const STRATEGIES: Record<string, string[]> = {
  sad: [
    'Kurzer Spaziergang und tief atmen',
    'Jemandem eine Nachricht schreiben',
    'Etwas Kleines aufräumen/ordnen'
  ],
  anxious: [
    '5-4-3-2-1 Bodyscan',
    '3 langsame Atemzüge, doppelt so lange ausatmen',
    'Eine Sache aufschreiben, die du jetzt erledigst'
  ],
  angry: [
    '2 Minuten Pause, kaltes Wasser',
    'Gedanken notieren, dann langsames Gehen',
    'Klare Ich-Botschaft vorbereiten'
  ],
  overwhelmed: [
    'Alles sammeln, dann 1 Kleinigkeit erledigen',
    'Timer 10 Minuten Fokus',
    'Lärm/Notifications für 30 Minuten aus'
  ]
};

function quickAnalyze(text: string) {
  const lower = text.toLowerCase();
  const signal = (keyword: string) => lower.includes(keyword);
  if (signal('angry') || signal('wüt')) return 'angry';
  if (signal('traurig') || signal('sad')) return 'sad';
  if (signal('stress') || signal('überfordert') || signal('overwhelm')) return 'overwhelmed';
  if (signal('angst') || signal('nerv')) return 'anxious';
  return 'neutral';
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 404, { error: 'No URL' });
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { status: 'ok', service: 'Emotional Core (Node Lite)', port: PORT });
  }

  if (req.method === 'POST' && url.pathname === '/analyze') {
    const body = await parseBody(req);
    const text = body.text || '';
    const emotion = quickAnalyze(text);
    return send(res, 200, {
      emotion,
      confidence: emotion === 'neutral' ? 0.4 : 0.7,
      suggestion: STRATEGIES[emotion]?.[0] || 'Weiter beobachten, freundlich zu dir sein.'
    });
  }

  if (req.method === 'GET' && url.pathname === '/strategies') {
    const e = url.searchParams.get('emotion') || 'neutral';
    return send(res, 200, { emotion: e, strategies: STRATEGIES[e] || [] });
  }

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Emotional Core (Node Lite) running on ${PORT}`);
});
