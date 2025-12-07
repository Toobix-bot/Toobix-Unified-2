/**
 * Start ALL Toobix services in Node-Lite Mode (Termux)
 * - Spawns real Node-Lite scripts where vorhanden
 * - Startet Stub-HTTP für alle übrigen Ports
 * - Keine externen Dependencies (nur Node/tsx)
 *
 * Nutzung:
 *   pkill node   # ggf. vorher Ports freimachen
 *   npx tsx termux/start-all-node-lite.ts
 *
 * Ports/Scripts:
 *   command-center.node.ts            7777
 *   self-awareness-core.node.ts       8970
 *   emotional-core.node.ts            8900
 *   dream-core.node.ts                8961
 *   unified-core-service.node.ts      8000
 *   unified-consciousness-service...  8002
 *   Rest: Stub-Health auf den bekannten Ports
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';

type ServiceDef = {
  name: string;
  port: number;
  script?: string; // wenn gesetzt -> npx tsx <script>
  description?: string;
};

const SERVICES: ServiceDef[] = [
  { name: 'Command Center', port: 7777, script: 'termux/command-center.node.ts' },
  { name: 'Self-Awareness Core', port: 8970, script: 'termux/self-awareness-core.node.ts' },
  { name: 'Emotional Core', port: 8900, script: 'termux/emotional-core.node.ts' },
  { name: 'Dream Core', port: 8961, script: 'termux/dream-core.node.ts' },
  { name: 'Unified Core Service', port: 8000, script: 'termux/unified-core-service.node.ts' },
  { name: 'Unified Consciousness', port: 8002, script: 'termux/unified-consciousness-service.node.ts' },
  { name: 'Autonomy Engine', port: 8975, script: 'termux/service-generic.node.ts' },
  { name: 'Unified Communication', port: 8001, script: 'termux/service-generic.node.ts' },
  { name: 'Twitter Autonomy', port: 8965, script: 'termux/service-generic.node.ts' },
  { name: 'Toobix Gamification', port: 7778, script: 'termux/service-generic.node.ts' },
  { name: 'Real World Intelligence', port: 8888, script: 'termux/service-generic.node.ts' },
  { name: 'Toobix Living World', port: 7779, script: 'termux/service-generic.node.ts' },
  { name: 'Unified Service Gateway', port: 9000, script: 'termux/service-generic.node.ts' },
  { name: 'Hardware Awareness', port: 8940, script: 'termux/service-generic.node.ts' },
  { name: 'Health Monitor', port: 9200, script: 'termux/service-generic.node.ts' },
  { name: 'Toobix Mega Upgrade', port: 9100, script: 'termux/service-generic.node.ts' },
  { name: 'Event Bus', port: 8920, script: 'termux/service-generic.node.ts' },
  { name: 'Multi-LLM Router', port: 8959, script: 'termux/llm-router.node.ts' },
  { name: 'LLM Gateway v4', port: 8954, script: 'termux/llm-gateway.node.ts' },
  { name: 'Memory Palace v4', port: 8953, script: 'termux/memory-palace.node.ts' },
  { name: 'Performance Dashboard', port: 8899, script: 'termux/service-generic.node.ts' },
  { name: 'Toobix Chat Service', port: 8995, script: 'termux/service-generic.node.ts' },
  { name: 'Emotional Support', port: 8985, script: 'termux/service-generic.node.ts' },
  { name: 'Autonomous Web', port: 8980, script: 'termux/service-generic.node.ts' },
  { name: 'Story Engine', port: 8932, script: 'termux/service-generic.node.ts' },
  { name: 'Translation Service', port: 8931, script: 'termux/service-generic.node.ts' },
  { name: 'User Profile', port: 8904, script: 'termux/service-generic.node.ts' },
  { name: 'RPG World', port: 8933, script: 'termux/service-generic.node.ts' },
  { name: 'Game Logic', port: 8936, script: 'termux/service-generic.node.ts' },
  { name: 'Data Science', port: 8935, script: 'termux/service-generic.node.ts' },
  { name: 'Gratitude & Mortality', port: 8901, script: 'termux/service-generic.node.ts' },
];

const running: ChildProcess[] = [];

function startScriptService(def: ServiceDef) {
  const proc = spawn('npx', ['tsx', def.script!], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' },
  });
  running.push(proc);
  proc.on('exit', (code) => {
    console.log(`[${def.name}] exited with code ${code}`);
  });
}

function startStub(def: ServiceDef) {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', service: def.name, port: def.port, stub: true }));
      return;
    }
    if (req.url === '/status') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'running', service: def.name, stub: true }));
      return;
    }
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found', service: def.name }));
  });
  server.listen(def.port, () => {
    console.log(`   ✓ Stub ${def.name} @ ${def.port}`);
  });
  server.on('error', (err: any) => {
    console.log(`   ✗ Stub ${def.name} @ ${def.port} -> ${err?.message || err}`);
  });
}

console.log('---------------------------------------------');
console.log('TOOBIX START ALL (Node-Lite + Stubs)');
console.log(`Services: ${SERVICES.length}`);
console.log('---------------------------------------------');
console.log('Tipp: vorher "pkill node", dann diesen Start ausführen.');
console.log('---------------------------------------------');

for (const svc of SERVICES) {
  if (svc.script) {
    console.log(`-> Script ${svc.name} (${svc.port})`);
    startScriptService(svc);
  } else {
    console.log(`-> Stub   ${svc.name} (${svc.port})`);
    startStub(svc);
  }
}

console.log('---------------------------------------------');
console.log('Alle Starts ausgelöst. Beenden mit Ctrl+C.');
console.log('Health-Beispiel: curl http://localhost:7777/health');
console.log('---------------------------------------------');
