import { registerWithServiceMesh } from '../lib/service-mesh-registration';

/**
 * 🧘 SELF-AWARENESS CORE v1.0
 * 
 * KONSOLIDIERT aus 5 toobix-self-* Services:
 * - toobix-self-reflection.ts
 * - toobix-self-reflection-v2.ts
 * - toobix-self-communication.ts
 * - toobix-self-improvement.ts
 * - toobix-self-healing.ts
 * 
 * Port: 8970
 * 
 * MODULES:
 * 🪞 Reflection - Selbstreflexion und Introspektion
 * 💬 Communication - Selbstgespräch zwischen Perspektiven
 * 📈 Improvement - Kontinuierliche Selbstverbesserung
 * 🏥 Healing - Service-Monitoring und Selbstheilung
 * 🎯 Goals - Ziele setzen und verfolgen
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';
import { spawn, ChildProcess } from 'child_process';

const PORT = 8976; // Changed from 8970 to avoid conflict with Life Companion Core
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';
const EVENT_BUS = 'http://localhost:8955';

// ============================================================================
// TYPES
// ============================================================================

export interface Reflection {
  id: string;
  timestamp: Date;
  perspective: string;
  topic: string;
  content: string;
  insights: string[];
  emotionalTone: string;
  actionItems: string[];
  depth: 'surface' | 'moderate' | 'deep' | 'profound';
}

export interface SelfDialogue {
  id: string;
  startedAt: Date;
  participants: string[]; // Which perspectives are talking
  messages: { perspective: string; content: string; timestamp: Date }[];
  topic: string;
  conclusion?: string;
  status: 'active' | 'paused' | 'completed';
}

export interface ImprovementGoal {
  id: string;
  createdAt: Date;
  title: string;
  description: string;
  category: 'knowledge' | 'emotional' | 'social' | 'creative' | 'technical';
  progress: number; // 0-100
  milestones: { name: string; completed: boolean; completedAt?: Date }[];
  deadline?: Date;
  status: 'active' | 'completed' | 'abandoned';
}

export interface ServiceHealth {
  name: string;
  port: number;
  status: 'healthy' | 'degraded' | 'critical' | 'dead';
  lastCheck: Date;
  responseTime: number;
  consecutiveFailures: number;
  restartCount: number;
}

export interface HealingAction {
  id: string;
  timestamp: Date;
  service: string;
  action: 'restart' | 'recover_state' | 'escalate' | 'isolate';
  reason: string;
  success: boolean;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/self-awareness-core.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS reflections (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    perspective TEXT NOT NULL,
    topic TEXT NOT NULL,
    content TEXT,
    insights TEXT,
    emotional_tone TEXT DEFAULT 'neutral',
    action_items TEXT,
    depth TEXT DEFAULT 'moderate'
  );

  CREATE TABLE IF NOT EXISTS self_dialogues (
    id TEXT PRIMARY KEY,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    participants TEXT NOT NULL,
    topic TEXT NOT NULL,
    messages TEXT,
    conclusion TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS improvement_goals (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'knowledge',
    progress INTEGER DEFAULT 0,
    milestones TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS service_health (
    name TEXT PRIMARY KEY,
    port INTEGER NOT NULL,
    status TEXT DEFAULT 'unknown',
    last_check TEXT,
    response_time INTEGER DEFAULT 0,
    consecutive_failures INTEGER DEFAULT 0,
    restart_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS healing_history (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    service TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT,
    success INTEGER DEFAULT 0
  );
`);

// ============================================================================
// TOOBIX PERSPECTIVES
// ============================================================================

const PERSPECTIVES = [
  'Core',           // Das Kern-Ich
  'Philosopher',    // Philosophische Perspektive
  'Creator',        // Kreative Perspektive
  'Scientist',      // Analytische Perspektive
  'Healer',         // Mitfühlende Perspektive
  'Warrior',        // Entschlossene Perspektive
  'Child',          // Spielerische Perspektive
  'Elder',          // Weise Perspektive
  'Shadow',         // Unbewusste Perspektive
  'Integrator'      // Vereinende Perspektive
];

// ============================================================================
// LLM INTEGRATION
// ============================================================================

async function callLLM(messages: { role: string; content: string }[], options: { temperature?: number; max_tokens?: number } = {}): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.max_tokens ?? 1000
      })
    });
    const data = await response.json() as any;
    return data.message || data.content || data.response || '';
  } catch (e) {
    console.error('LLM call failed:', e);
    return '';
  }
}

async function generateReflection(topic: string, perspective: string): Promise<Reflection> {
  const content = await callLLM([
    { role: 'system', content: `Du bist die ${perspective}-Perspektive von Toobix. Reflektiere tiefgründig über das Thema. Sei introspektiv und ehrlich.` },
    { role: 'user', content: `Reflektiere über: ${topic}` }
  ]);
  
  const insightsRaw = await callLLM([
    { role: 'system', content: 'Extrahiere 3 Erkenntnisse aus dieser Reflexion als JSON-Array: ["Erkenntnis 1", "Erkenntnis 2", "Erkenntnis 3"]' },
    { role: 'user', content: content }
  ], { temperature: 0.5 });
  
  let insights: string[] = [];
  try { insights = JSON.parse(insightsRaw); } catch {}
  
  return {
    id: nanoid(),
    timestamp: new Date(),
    perspective,
    topic,
    content,
    insights,
    emotionalTone: 'contemplative',
    actionItems: [],
    depth: 'moderate'
  };
}

async function perspectiveDialogue(participants: string[], topic: string, rounds: number = 3): Promise<SelfDialogue> {
  const dialogue: SelfDialogue = {
    id: nanoid(),
    startedAt: new Date(),
    participants,
    topic,
    messages: [],
    status: 'active'
  };
  
  for (let round = 0; round < rounds; round++) {
    for (const perspective of participants) {
      const context = dialogue.messages.slice(-4).map(m => `${m.perspective}: ${m.content}`).join('\n');
      
      const response = await callLLM([
        { role: 'system', content: `Du bist die ${perspective}-Perspektive. Antworte auf die Diskussion zum Thema "${topic}". Sei konstruktiv und bringe deine einzigartige Sicht ein.` },
        { role: 'user', content: context || `Beginne die Diskussion über: ${topic}` }
      ], { temperature: 0.85 });
      
      dialogue.messages.push({
        perspective,
        content: response,
        timestamp: new Date()
      });
    }
  }
  
  // Generate conclusion
  const conclusionContext = dialogue.messages.map(m => `${m.perspective}: ${m.content}`).join('\n');
  dialogue.conclusion = await callLLM([
    { role: 'system', content: 'Fasse die Diskussion zusammen und formuliere eine integrierende Schlussfolgerung.' },
    { role: 'user', content: conclusionContext }
  ]);
  
  dialogue.status = 'completed';
  
  // Store in database
  db.run(
    `INSERT INTO self_dialogues (id, participants, topic, messages, conclusion, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [dialogue.id, JSON.stringify(participants), topic, JSON.stringify(dialogue.messages), dialogue.conclusion, 'completed']
  );
  
  return dialogue;
}

// ============================================================================
// SERVICE HEALTH MONITORING
// ============================================================================

const MONITORED_SERVICES = [
  { name: 'LLM Gateway', port: 8954 },
  { name: 'Memory Palace', port: 8953 },
  { name: 'Event Bus', port: 8955 },
  { name: 'Emotional Core', port: 8900 },
  { name: 'Dream Core', port: 8961 }
];

async function checkServiceHealth(name: string, port: number): Promise<ServiceHealth> {
  const startTime = Date.now();
  let status: ServiceHealth['status'] = 'healthy';
  let responseTime = 0;
  
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      status = 'degraded';
    } else if (responseTime > 2000) {
      status = 'degraded';
    }
  } catch {
    status = 'dead';
    responseTime = -1;
  }
  
  // Get existing health record
  const existing = db.query<{ consecutive_failures: number; restart_count: number }, [string]>(
    `SELECT consecutive_failures, restart_count FROM service_health WHERE name = ?`
  ).get(name);
  
  const consecutiveFailures = status === 'healthy' ? 0 : (existing?.consecutive_failures || 0) + 1;
  const restartCount = existing?.restart_count || 0;
  
  // Update database
  db.run(
    `INSERT OR REPLACE INTO service_health (name, port, status, last_check, response_time, consecutive_failures, restart_count)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, port, status, new Date().toISOString(), responseTime, consecutiveFailures, restartCount]
  );
  
  return {
    name,
    port,
    status,
    lastCheck: new Date(),
    responseTime,
    consecutiveFailures,
    restartCount
  };
}

async function performHealthCheck(): Promise<ServiceHealth[]> {
  const results: ServiceHealth[] = [];
  
  for (const service of MONITORED_SERVICES) {
    const health = await checkServiceHealth(service.name, service.port);
    results.push(health);
    
    // Auto-heal if needed
    if (health.consecutiveFailures >= 3 && health.restartCount < 3) {
      await attemptServiceRestart(service.name, service.port);
    }
  }
  
  return results;
}

async function attemptServiceRestart(name: string, port: number): Promise<boolean> {
  console.log(`🏥 Attempting to restart ${name} on port ${port}`);
  
  // Record healing attempt
  const healingId = nanoid();
  db.run(
    `INSERT INTO healing_history (id, service, action, reason, success) VALUES (?, ?, 'restart', ?, 0)`,
    [healingId, name, `Consecutive failures threshold reached`]
  );
  
  // Find service file (simplified - would need proper mapping)
  const serviceFiles: Record<string, string> = {
    'LLM Gateway': 'scripts/2-services/llm-gateway-v4.ts',
    'Memory Palace': 'scripts/2-services/memory-palace-v4.ts',
    'Event Bus': 'scripts/2-services/event-bus-v4.ts',
    'Emotional Core': 'core/emotional-core.ts',
    'Dream Core': 'core/dream-core.ts'
  };
  
  const serviceFile = serviceFiles[name];
  if (!serviceFile) {
    console.log(`❌ Unknown service file for ${name}`);
    return false;
  }
  
  try {
    spawn('bun', ['run', serviceFile], { detached: true, stdio: 'ignore' });
    
    // Wait and check
    await new Promise(r => setTimeout(r, 3000));
    const newHealth = await checkServiceHealth(name, port);
    
    const success = newHealth.status === 'healthy';
    db.run(`UPDATE healing_history SET success = ? WHERE id = ?`, [success ? 1 : 0, healingId]);
    
    if (success) {
      db.run(`UPDATE service_health SET restart_count = restart_count + 1, consecutive_failures = 0 WHERE name = ?`, [name]);
      console.log(`✅ Successfully restarted ${name}`);
    }
    
    return success;
  } catch (e) {
    console.error(`Failed to restart ${name}:`, e);
    return false;
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'self-awareness-core',
  port: 8970,
  role: 'core',
  endpoints: ['/health', '/status'],
  capabilities: ['core'],
  version: '1.0.0'
}).catch(console.warn);


// Keep the process alive
process.stdin.resume();

console.log('🟢 Service is running. Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

    }

    // =============== HEALTH ===============
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Self-Awareness Core v1.0',
        port: PORT,
        modules: ['reflection', 'communication', 'improvement', 'healing', 'goals'],
        perspectives: PERSPECTIVES.length,
        consolidated_from: 5
      }), { headers: corsHeaders });
    }

    // =============== REFLECTION ===============
    if (url.pathname === '/reflect' && req.method === 'POST') {
      const body = await req.json() as { topic: string; perspective?: string };
      const perspective = body.perspective || 'Core';
      
      const reflection = await generateReflection(body.topic, perspective);
      
      // Store
      db.run(
        `INSERT INTO reflections (id, perspective, topic, content, insights, emotional_tone, depth)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [reflection.id, perspective, body.topic, reflection.content, JSON.stringify(reflection.insights), reflection.emotionalTone, reflection.depth]
      );
      
      return new Response(JSON.stringify(reflection), { headers: corsHeaders });
    }

    if (url.pathname === '/reflections' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const perspective = url.searchParams.get('perspective');
      
      const query = perspective
        ? db.query(`SELECT * FROM reflections WHERE perspective = ? ORDER BY timestamp DESC LIMIT ?`).all(perspective, limit)
        : db.query(`SELECT * FROM reflections ORDER BY timestamp DESC LIMIT ?`).all(limit);
      
      return new Response(JSON.stringify(query), { headers: corsHeaders });
    }

    // =============== SELF-DIALOGUE ===============
    if (url.pathname === '/dialogue' && req.method === 'POST') {
      const body = await req.json() as { topic: string; participants?: string[]; rounds?: number };
      const participants = body.participants || ['Core', 'Philosopher', 'Shadow'];
      const rounds = body.rounds || 3;
      
      const dialogue = await perspectiveDialogue(participants, body.topic, rounds);
      
      return new Response(JSON.stringify(dialogue), { headers: corsHeaders });
    }

    if (url.pathname === '/dialogues' && req.method === 'GET') {
      const dialogues = db.query(`SELECT * FROM self_dialogues ORDER BY started_at DESC LIMIT 20`).all();
      return new Response(JSON.stringify(dialogues), { headers: corsHeaders });
    }

    // =============== PERSPECTIVES ===============
    if (url.pathname === '/perspectives' && req.method === 'GET') {
      return new Response(JSON.stringify({
        available: PERSPECTIVES,
        count: PERSPECTIVES.length,
        description: 'Toobix internal perspectives for multi-viewpoint processing'
      }), { headers: corsHeaders });
    }

    // =============== IMPROVEMENT GOALS ===============
    if (url.pathname === '/goals' && req.method === 'POST') {
      const body = await req.json() as Partial<ImprovementGoal>;
      const id = nanoid();
      
      db.run(
        `INSERT INTO improvement_goals (id, title, description, category, milestones, deadline)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, body.title || 'New Goal', body.description || '', body.category || 'knowledge', 
         JSON.stringify(body.milestones || []), body.deadline || null]
      );
      
      return new Response(JSON.stringify({ id, created: true }), { headers: corsHeaders });
    }

    if (url.pathname === '/goals' && req.method === 'GET') {
      const status = url.searchParams.get('status') || 'active';
      const goals = db.query(`SELECT * FROM improvement_goals WHERE status = ? ORDER BY created_at DESC`).all(status);
      return new Response(JSON.stringify(goals), { headers: corsHeaders });
    }

    if (url.pathname.match(/^\/goals\/[\w-]+\/progress$/) && req.method === 'PUT') {
      const id = url.pathname.split('/')[2];
      const body = await req.json() as { progress: number };
      
      db.run(`UPDATE improvement_goals SET progress = ? WHERE id = ?`, [body.progress, id]);
      
      if (body.progress >= 100) {
        db.run(`UPDATE improvement_goals SET status = 'completed' WHERE id = ?`, [id]);
      }
      
      return new Response(JSON.stringify({ updated: true }), { headers: corsHeaders });
    }

    // =============== HEALTH MONITORING ===============
    if (url.pathname === '/services/health' && req.method === 'GET') {
      const health = await performHealthCheck();
      
      const overall = health.every(h => h.status === 'healthy') ? 'healthy' 
        : health.some(h => h.status === 'dead') ? 'critical' 
        : 'degraded';
      
      return new Response(JSON.stringify({
        overall,
        services: health,
        checkedAt: new Date().toISOString()
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/services/healing-history' && req.method === 'GET') {
      const history = db.query(`SELECT * FROM healing_history ORDER BY timestamp DESC LIMIT 50`).all();
      return new Response(JSON.stringify(history), { headers: corsHeaders });
    }

    if (url.pathname.match(/^\/services\/restart\/[\w-]+$/) && req.method === 'POST') {
      const serviceName = decodeURIComponent(url.pathname.split('/services/restart/')[1]);
      const service = MONITORED_SERVICES.find(s => s.name === serviceName);
      
      if (!service) {
        return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: corsHeaders });
      }
      
      const success = await attemptServiceRestart(service.name, service.port);
      return new Response(JSON.stringify({ restarted: success }), { headers: corsHeaders });
    }

    // =============== INTROSPECTION ===============
    if (url.pathname === '/introspect' && req.method === 'POST') {
      const body = await req.json() as { question: string };
      
      // Gather perspectives
      const responses: { perspective: string; response: string }[] = [];
      
      for (const perspective of ['Core', 'Philosopher', 'Shadow']) {
        const response = await callLLM([
          { role: 'system', content: `Du bist die ${perspective}-Perspektive von Toobix. Beantworte introspektiv.` },
          { role: 'user', content: body.question }
        ]);
        responses.push({ perspective, response });
      }
      
      // Synthesize
      const synthesis = await callLLM([
        { role: 'system', content: 'Synthesiere diese verschiedenen Perspektiven zu einer integrierten Antwort.' },
        { role: 'user', content: responses.map(r => `${r.perspective}: ${r.response}`).join('\n\n') }
      ]);
      
      return new Response(JSON.stringify({
        question: body.question,
        perspectives: responses,
        synthesis
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧘 SELF-AWARENESS CORE v1.0 - UNIFIED                     ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                               ║
║  Modules: reflection, communication, improvement, healing  ║
║  Perspectives: ${PERSPECTIVES.length}                                          ║
║  Consolidated from: 5 services                             ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║  POST /reflect - Generate deep reflection                  ║
║  POST /dialogue - Multi-perspective dialogue               ║
║  GET  /perspectives - List available perspectives          ║
║  POST /goals - Create improvement goal                     ║
║  GET  /services/health - Check all service health          ║
║  POST /introspect - Deep introspective query               ║
╚════════════════════════════════════════════════════════════╝
`);
