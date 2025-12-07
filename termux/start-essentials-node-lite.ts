/**
 * Startet die Node-Lite Essentials (5 Services) in Termux mit einem Befehl.
 * Läuft ohne zusätzliche Dependencies (nur Node/tsx).
 *
 * Start:
 *   npx tsx termux/start-essentials-node-lite.ts
 *
 * Gestartet werden:
 *   - self-awareness-core.node.ts        (8970)
 *   - emotional-core.node.ts             (8900)
 *   - dream-core.node.ts                 (8961)
 *   - unified-core-service.node.ts       (8000)
 *   - unified-consciousness-service.node.ts (8002)
 */

import { spawn } from 'child_process';
import path from 'path';

type Service = { name: string; script: string };

const SERVICES: Service[] = [
  { name: 'Self-Awareness Core', script: 'termux/self-awareness-core.node.ts' },
  { name: 'Emotional Core', script: 'termux/emotional-core.node.ts' },
  { name: 'Dream Core', script: 'termux/dream-core.node.ts' },
  { name: 'Unified Core Service', script: 'termux/unified-core-service.node.ts' },
  { name: 'Unified Consciousness', script: 'termux/unified-consciousness-service.node.ts' },
];

function startService(svc: Service) {
  const proc = spawn('npx', ['tsx', svc.script], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });

  proc.on('exit', (code) => {
    console.log(`[${svc.name}] exited with code ${code}`);
  });
}

console.log('Starte Node-Lite Essentials...');
console.log(SERVICES.map(s => ` - ${s.name}`).join('\n'));
console.log('---------------------------------------------');

for (const svc of SERVICES) {
  startService(svc);
}

console.log('Alle Starts ausgelöst. Logs siehe oben. (Beenden mit Ctrl+C)'); 
