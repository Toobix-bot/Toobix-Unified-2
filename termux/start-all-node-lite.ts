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
  { name: 'Autonomy Engine', port: 8975 },
  { name: 'Unified Communication', port: 8001 },
  { name: 'Twitter Autonomy', port: 8965 },
  { name: 'Toobix Gamification', port: 7778 },
  { name: 'Real World Intelligence', port: 8888 },
  { name: 'Toobix Living World', port: 7779 },
  { name: 'Unified Service Gateway', port: 9000 },
  { name: 'Hardware Awareness', port: 8940 },
  { name: 'Health Monitor', port: 9200 },
  { name: 'Toobix Mega Upgrade', port: 9100 },
  { name: 'Event Bus', port: 8920 },
  { name: 'Multi-LLM Router', port: 8959, script: 'termux/llm-router.node.ts' },
  { name: 'LLM Gateway v4', port: 8954, script: 'termux/llm-gateway.node.ts' },
  { name: 'Memory Palace v4', port: 8953, script: 'termux/memory-palace.node.ts' },
  { name: 'Performance Dashboard', port: 8899 },
  { name: 'Toobix Chat Service', port: 8995 },
  { name: 'Emotional Support', port: 8985 },
  { name: 'Autonomous Web', port: 8980 },
  { name: 'Story Engine', port: 8932 },
  { name: 'Translation Service', port: 8931 },
  { name: 'User Profile', port: 8904 },
  { name: 'RPG World', port: 8933 },
  { name: 'Game Logic', port: 8936 },
  { name: 'Data Science', port: 8935 },
  { name: 'Gratitude & Mortality', port: 8901 },
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
