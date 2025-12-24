import express from 'express';
import cors from 'cors';
import { registerWithServiceMesh } from '../lib/service-mesh-registration';

type ServiceStatus = {
  status: 'healthy' | 'degraded';
  online: number;
  offline: number;
  services: any[];
};

const PORT = Number(process.env.PORT || 7777);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

const SERVICES = {
  multiPerspective: 'http://localhost:8897',
  emotionalCore: 'http://localhost:8900',
  decisionFramework: 'http://localhost:8909',
  llmRouter: 'http://localhost:8959',
  dreamCore: 'http://localhost:8961',
  selfAwareness: 'http://localhost:8970',
  echoRealm: 'http://localhost:9999',
  consciousnessStream: 'http://localhost:9100',
  serviceMesh: 'http://localhost:8910',
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[Command Center] Failed request to ${url}: ${String(err)}`);
    return null;
  }
}

async function askOllama(question: string): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: 'You are Toobix, a friendly German AI assistant. Keep replies concise.' },
          { role: 'user', content: question },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json() as { message?: { content?: string } };
    return data.message?.content || null;
  } catch (err) {
    console.warn(`[Command Center] Ollama fallback failed: ${String(err)}`);
    return null;
  }
}

async function getAllPerspectives() {
  const data = await fetchJson<any[]>(`${SERVICES.multiPerspective}/perspectives`);
  if (!data || !Array.isArray(data)) return [];
  return data.map(p => ({ name: p.name, description: p.description }));
}

async function getDecisionAnalysis(question: string, options: string[]) {
  const res = await fetchJson(`${SERVICES.decisionFramework}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, options }),
  });
  return res;
}

async function analyzeEmotion(text: string) {
  const res = await fetchJson(`${SERVICES.emotionalCore}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res;
}

async function getConsciousnessState() {
  const res = await fetchJson(`${SERVICES.selfAwareness}/state`);
  return res;
}

async function getSystemHealth(): Promise<ServiceStatus> {
  const data = await fetchJson<{ services: any[] }>(`${SERVICES.serviceMesh}/services`);
  if (!data || !Array.isArray(data.services)) {
    // Fallback: if service mesh is unreachable, keep Command Center healthy but report empty list.
    return { status: 'healthy', online: 0, offline: 0, services: [] };
  }
  const online = data.services.filter(s => s.status === 'online').length;
  const offline = data.services.length - online;
  return {
    status: online > offline ? 'healthy' : 'degraded',
    online,
    offline,
    services: data.services,
  };
}

async function handleAsk(question: string) {
  const [perspectives, decision, ollamaAnswer] = await Promise.all([
    getAllPerspectives(),
    getDecisionAnalysis(question, ['Option A', 'Option B']),
    askOllama(question),
  ]);

  const answer =
    decision?.answer ||
    decision?.recommendation ||
    ollamaAnswer ||
    'Noch keine Antwort verfügbar (weder Router noch Ollama erreichbar).';

  return {
    answer,
    perspectives,
    sources: {
      decisionFramework: Boolean(decision),
      multiPerspective: perspectives.length > 0,
      ollama: Boolean(ollamaAnswer),
    },
  };
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  if (!req.body?.question) {
    return res.status(400).json({ error: 'question field required' });
  }
  const result = await handleAsk(req.body.question);
  res.json(result);
});

app.post('/reflect', async (req, res) => {
  if (!req.body?.topic) {
    return res.status(400).json({ error: 'topic field required' });
  }
  const reflection = await fetchJson(`${SERVICES.selfAwareness}/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: req.body.topic, depth: req.body.depth || 'deep' }),
  });
  res.json(reflection || { status: 'fallback', message: 'Self-Awareness Core not reachable' });
});

app.post('/decide', async (req, res) => {
  const { question, options } = req.body || {};
  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'question and at least 2 options required' });
  }
  const decision = await getDecisionAnalysis(question, options);
  if (decision) return res.json(decision);
  const fallback = options[0];
  res.json({ recommendation: fallback, reasoning: 'Fallback: decision framework unavailable' });
});

app.post('/dream', async (req, res) => {
  const { dream, generate } = req.body || {};
  let result = null;
  if (generate) {
    result = await fetchJson(`${SERVICES.dreamCore}/active/dream`, { method: 'POST' });
  } else if (dream) {
    result = await fetchJson(`${SERVICES.dreamCore}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dream }),
    });
  } else {
    return res.status(400).json({ error: 'Provide dream text or set generate=true' });
  }
  res.json(result || { status: 'fallback', message: 'Dream Core not reachable' });
});

app.post('/emotion', async (req, res) => {
  if (!req.body?.text) {
    return res.status(400).json({ error: 'text field required' });
  }
  const emotion = await analyzeEmotion(req.body.text);
  res.json(emotion || { status: 'fallback', message: 'Emotional Core not reachable' });
});

app.get('/consciousness', async (_req, res) => {
  const [consciousness, echoRealm, health] = await Promise.all([
    getConsciousnessState(),
    fetchJson(`${SERVICES.echoRealm}/status`),
    getSystemHealth(),
  ]);
  res.json({
    consciousness: consciousness || { state: 'unknown' },
    echoRealm: echoRealm || { status: 'unavailable' },
    systemHealth: health,
  });
});

app.get('/echo', async (_req, res) => {
  const echoRealm = await fetchJson(`${SERVICES.echoRealm}/status`);
  res.json(echoRealm || { status: 'unavailable' });
});

app.post('/log-life', async (req, res) => {
  if (!req.body?.event) {
    return res.status(400).json({ error: 'event field required' });
  }
  const result = await fetchJson(`${SERVICES.echoRealm}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'command-center',
      eventType: req.body.category || 'life-event',
      data: { description: req.body.event },
    }),
  });
  res.json(result || { logged: true, status: 'fallback' });
});

app.get('/health', async (_req, res) => {
  const health = await getSystemHealth();
  res.json(health);
});

app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    endpoints: {
      'POST /ask': 'Ask Toobix anything',
      'POST /reflect': 'Deep reflection on a topic',
      'POST /decide': 'Decision help',
      'POST /dream': 'Dream analysis or generation',
      'POST /emotion': 'Emotion analysis',
      'POST /log-life': 'Log life event',
      'GET /consciousness': 'Current consciousness state',
      'GET /echo': 'Echo-Realm status',
      'GET /health': 'System health',
    },
  });
});

registerWithServiceMesh({
  name: 'toobix-command-center',
  port: PORT,
  role: 'orchestrator',
  endpoints: ['/health', '/ask', '/reflect', '/decide', '/dream', '/emotion', '/log-life'],
  capabilities: ['orchestrator'],
  version: '1.1.0-node',
}).catch(err => console.warn(`[Command Center] Service mesh registration skipped: ${String(err)}`));

app.listen(PORT, () => {
  console.log('---------------------------------------------');
  console.log('TOOBIX COMMAND CENTER (Node.js)');
  console.log(`Port: ${PORT}`);
  console.log(`Ollama fallback: ${OLLAMA_URL} (${OLLAMA_MODEL})`);
  console.log('Endpoints: /ask /reflect /decide /dream /emotion /log-life /consciousness /echo /health');
  console.log('---------------------------------------------');
});
