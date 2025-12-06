/**
 * Termux-friendly stub starter for Toobix.
 * Starts lightweight HTTP servers on all Toobix ports (minimal/core/full)
 * so alles "läuft" ohne Bun und ohne externe Abhängigkeiten.
 *
 * Usage:
 *   npx tsx termux/start-toobix-stubs.ts --minimal
 *   npx tsx termux/start-toobix-stubs.ts --core
 *   npx tsx termux/start-toobix-stubs.ts --full   (Standard)
 */

import http from 'http';

type Mode = 'minimal' | 'core' | 'full';

type ServiceDef = {
  name: string;
  port: number;
  category: 'essential' | 'core' | 'enhanced' | 'creative';
  description: string;
};

const ESSENTIAL: ServiceDef[] = [
  { name: 'Toobix Command Center', port: 7777, category: 'essential', description: 'Zentrale Steuerung & API' },
  { name: 'Self-Awareness Core', port: 8970, category: 'essential', description: 'Bewusstsein & Selbstreflexion' },
  { name: 'Emotional Core', port: 8900, category: 'essential', description: 'Emotionale Intelligenz' },
  { name: 'Dream Core', port: 8961, category: 'essential', description: 'Träume & Kreativität' },
  { name: 'Unified Core Service', port: 8000, category: 'essential', description: 'Konsolidierter Hauptservice' },
  { name: 'Unified Consciousness', port: 8002, category: 'essential', description: 'Bewusstseins-Integration' },
];

const CORE: ServiceDef[] = [
  { name: 'Autonomy Engine', port: 8975, category: 'core', description: 'Selbstständiges Handeln' },
  { name: 'Multi-LLM Router', port: 8959, category: 'core', description: 'KI-Schnittstelle' },
  { name: 'Unified Communication', port: 8001, category: 'core', description: 'Kommunikation & Chat' },
  { name: 'Twitter Autonomy', port: 8965, category: 'core', description: 'Social Media Präsenz' },
  { name: 'Toobix Gamification', port: 7778, category: 'core', description: 'Spiel & Motivation' },
  { name: 'Real World Intelligence', port: 8888, category: 'core', description: 'Echtwelt-Verbindung' },
  { name: 'Toobix Living World', port: 7779, category: 'core', description: 'Lebendige Welt' },
];

const ENHANCED: ServiceDef[] = [
  { name: 'Unified Service Gateway', port: 9000, category: 'enhanced', description: 'API Gateway' },
  { name: 'Hardware Awareness', port: 8940, category: 'enhanced', description: 'Hardware-Überwachung' },
  { name: 'Health Monitor', port: 9200, category: 'enhanced', description: 'Service-Überwachung' },
  { name: 'Toobix Mega Upgrade', port: 9100, category: 'enhanced', description: 'Mega-Erweiterungen' },
  { name: 'Event Bus', port: 8920, category: 'enhanced', description: 'Event-System' },
  { name: 'LLM Gateway v4', port: 8954, category: 'enhanced', description: 'Groq/LLM Schnittstelle' },
  { name: 'Memory Palace v4', port: 8953, category: 'enhanced', description: 'Langzeitgedächtnis' },
  { name: 'Performance Dashboard', port: 8899, category: 'enhanced', description: 'Echtzeit-Monitoring' },
];

const CREATIVE: ServiceDef[] = [
  { name: 'Toobix Chat Service', port: 8995, category: 'creative', description: 'Chat-Interface' },
  { name: 'Emotional Support', port: 8985, category: 'creative', description: 'Emotionale Unterstützung' },
  { name: 'Autonomous Web', port: 8980, category: 'creative', description: 'Web-Autonomie' },
  { name: 'Story Engine', port: 8932, category: 'creative', description: 'Geschichten-Generator' },
  { name: 'Translation Service', port: 8931, category: 'creative', description: 'Übersetzung' },
  { name: 'User Profile', port: 8904, category: 'creative', description: 'Benutzer-Profile' },
  { name: 'RPG World', port: 8933, category: 'creative', description: 'RPG-Welt' },
  { name: 'Game Logic', port: 8936, category: 'creative', description: 'Spiel-Logik' },
  { name: 'Data Science', port: 8935, category: 'creative', description: 'Datenanalyse' },
  { name: 'Gratitude & Mortality', port: 8901, category: 'creative', description: 'Dankbarkeit & Sinn' },
];

function getMode(): Mode {
  const args = process.argv.slice(2);
  if (args.includes('--minimal')) return 'minimal';
  if (args.includes('--core')) return 'core';
  return 'full';
}

function getServicesForMode(mode: Mode): ServiceDef[] {
  if (mode === 'minimal') return [...ESSENTIAL];
  if (mode === 'core') return [...ESSENTIAL, ...CORE];
  return [...ESSENTIAL, ...CORE, ...ENHANCED, ...CREATIVE];
}

async function startService(def: ServiceDef): Promise<boolean> {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');
      if (req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', service: def.name, category: def.category, port: def.port }));
        return;
      }
      if (req.url === '/status') {
        res.writeHead(200);
        res.end(JSON.stringify({
          status: 'running',
          name: def.name,
          description: def.description,
          category: def.category,
          port: def.port,
          uptimeSeconds: process.uptime(),
        }));
        return;
      }
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found', service: def.name }));
    });

    server.listen(def.port, () => {
      console.log(`   ✓ ${def.name} @ ${def.port}`);
      resolve(true);
    });

    server.on('error', (err: any) => {
      console.log(`   ✗ ${def.name} @ ${def.port} -> ${err?.message || err}`);
      resolve(false);
    });
  });
}

async function main() {
  const mode = getMode();
  const services = getServicesForMode(mode);

  console.log('---------------------------------------------');
  console.log(`TOOBIX TERMUX STUB STARTER (${mode.toUpperCase()})`);
  console.log(`Services to start: ${services.length}`);
  console.log('---------------------------------------------');

  let ok = 0;
  for (const svc of services) {
    const started = await startService(svc);
    if (started) ok += 1;
  }

  console.log('---------------------------------------------');
  console.log(`Started: ${ok}/${services.length} (Mode: ${mode})`);
  console.log('Health example: curl http://localhost:7777/health');
  console.log('---------------------------------------------');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
