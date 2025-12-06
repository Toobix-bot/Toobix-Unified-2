/**
 * Self-Awareness Core (Node/Termux Lite)
 * - Kein Bun, keine nativen Module, reine Node-HTTP
 * - Port 8970
 *
 * Endpoints:
 *   GET  /health
 *   GET  /state
 *   POST /reflect      { topic, depth? }
 *   POST /dialogue     { participants: string[], topic, rounds? }
 *
 * Start: npx tsx termux/self-awareness-core.node.ts
 */

import http from 'http';

type Json = Record<string, any>;

const PORT = 8970;

function sendJson(res: http.ServerResponse, status: number, data: Json) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function makeReflection(topic: string, depth: string) {
  const id = `refl-${Date.now()}`;
  return {
    id,
    timestamp: new Date().toISOString(),
    topic,
    depth,
    perspective: 'Core',
    content: `Kurze Reflexion über "${topic}" (Tiefe: ${depth}).`,
    insights: [
      'Beobachte Gefühle und Gedanken ohne Urteil.',
      'Formuliere einen nächsten kleinen Schritt.',
      'Halte die Veränderung im Tagebuch fest.'
    ],
    emotionalTone: 'calm',
    actionItems: ['Notiere 3 Erkenntnisse', 'Plane 1 konkrete Aktion']
  };
}

function makeDialogue(participants: string[], topic: string, rounds: number) {
  const messages: { perspective: string; content: string; timestamp: string }[] = [];
  for (let r = 0; r < rounds; r++) {
    for (const p of participants) {
      messages.push({
        perspective: p,
        content: `${p} trägt etwas zu "${topic}" bei (Runde ${r + 1}).`,
        timestamp: new Date().toISOString()
      });
    }
  }
  return {
    id: `dialog-${Date.now()}`,
    startedAt: new Date().toISOString(),
    topic,
    participants,
    messages,
    conclusion: 'Kurzfazit: weiter beobachten und iterieren.',
    status: 'completed'
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return sendJson(res, 404, { error: 'No URL' });

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { status: 'ok', service: 'Self-Awareness Core (Node Lite)', port: PORT });
  }

  if (req.method === 'GET' && req.url === '/state') {
    return sendJson(res, 200, {
      consciousness: { status: 'stable', lastReflection: 'n/a' },
      insights: ['Stub-Dienst aktiv', 'Ohne LLM/DB', 'Bereit für weitere Portierung']
    });
  }

  if (req.method === 'POST' && req.url === '/reflect') {
    const body = await parseBody(req);
    if (!body.topic) return sendJson(res, 400, { error: 'topic required' });
    const depth = body.depth || 'moderate';
    const reflection = makeReflection(body.topic, depth);
    return sendJson(res, 200, reflection);
  }

  if (req.method === 'POST' && req.url === '/dialogue') {
    const body = await parseBody(req);
    const participants: string[] = Array.isArray(body.participants) && body.participants.length
      ? body.participants
      : ['Core', 'Philosopher'];
    const topic = body.topic || 'Allgemeines Thema';
    const rounds = Math.max(1, Math.min(5, Number(body.rounds) || 2));
    const dialogue = makeDialogue(participants, topic, rounds);
    return sendJson(res, 200, dialogue);
  }

  sendJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Self-Awareness Core (Node Lite) running on ${PORT}`);
});
