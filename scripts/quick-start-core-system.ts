/**
 * 🚀 TOOBIX CORE SYSTEM - Quick Start
 * 
 * Startet die wichtigsten 20 Services für sofortigen Impact
 */

import * as fs from 'fs';
import * as path from 'path';

const essentialServices = [
  // Core Infrastructure (4)
  { name: 'Unified Gateway', file: 'services/unified-service-gateway.ts', port: 9000 },
  { name: 'Mega Upgrade', file: 'services/toobix-mega-upgrade.ts', port: 9100 },
  { name: 'Health Monitor', file: 'services/health-monitor.ts', port: 9200 },
  { name: 'Hardware Awareness', file: 'services/hardware-awareness-v2.ts', port: 8940 },
  
  // Communication & Memory (4)
  { name: 'Event Bus', file: 'scripts/2-services/event-bus-v4.ts', port: 8955 },
  { name: 'Memory Palace', file: 'scripts/2-services/memory-palace-v4.ts', port: 8953 },
  { name: 'LLM Gateway', file: 'scripts/2-services/llm-gateway-v4.ts', port: 8954 },
  { name: 'Dream Journal', file: 'scripts/2-services/dream-journal-unified.ts', port: 8961 },
  
  // Emotions & Social (4)
  { name: 'Emotional Wellbeing', file: 'scripts/2-services/emotional-wellbeing.ts', port: 8903 },
  { name: 'Emotional Support', file: 'scripts/2-services/emotional-support-service.ts', port: 8985 },
  { name: 'Multi Perspective', file: 'scripts/2-services/multi-perspective-v3.ts', port: 8897 },
  { name: 'User Profile', file: 'scripts/2-services/user-profile-service.ts', port: 8904 },
  
  // Life Companion (4)
  { name: 'Life Companion Core', file: 'scripts/2-services/life-companion-core.ts', port: 8970 },
  { name: 'Life Companion Coordinator', file: 'scripts/2-services/life-companion-coordinator.ts', port: 8969 },
  { name: 'Proactive Communication', file: 'scripts/2-services/proactive-communication-v2.ts', port: 8971 },
  { name: 'Daily Checkin', file: 'scripts/2-services/daily-checkin-v1.ts', port: 8972 },
  
  // Data & Analysis (4)
  { name: 'Data Sources', file: 'scripts/2-services/data-sources-service.ts', port: 8930 },
  { name: 'Data Science', file: 'scripts/2-services/data-science-service.ts', port: 8935 },
  { name: 'Orchestration Hub', file: 'scripts/2-services/orchestration-hub.ts', port: 9001 },
  { name: 'Public API', file: 'scripts/2-services/public-api-v1.ts', port: 8960 },
];

async function checkHealth(port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch (e) {
    return false;
  }
}

async function startService(service: any): Promise<boolean> {
  const isRunning = await checkHealth(service.port);
  
  if (isRunning) {
    console.log(`  ♻️  ${service.name} (${service.port}) - Bereits aktiv`);
    return true;
  }
  
  console.log(`  🚀 Starte ${service.name} (${service.port})...`);
  
  try {
    Bun.spawn(['bun', 'run', service.file], {
      cwd: process.cwd(),
      stdout: 'ignore',
      stderr: 'ignore',
    });
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const running = await checkHealth(service.port);
    
    if (running) {
      console.log(`  ✅ ${service.name} - LÄUFT!`);
      return true;
    } else {
      console.log(`  ⚠️  ${service.name} - Health-Check failed`);
      return false;
    }
  } catch (e: any) {
    console.log(`  🔴 ${service.name} - Fehler: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  🚀 TOOBIX CORE SYSTEM - QUICK START                 ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  
  console.log(`Starte ${essentialServices.length} essentielle Services...\n`);
  
  let success = 0;
  let failed = 0;
  const running = [];
  
  for (let i = 0; i < essentialServices.length; i++) {
    console.log(`\n[${i + 1}/${essentialServices.length}]`);
    const result = await startService(essentialServices[i]);
    
    if (result) {
      success++;
      running.push(essentialServices[i]);
    } else {
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('QUICK START - ZUSAMMENFASSUNG');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`✅ Erfolgreich: ${success}`);
  console.log(`🔴 Fehlgeschlagen: ${failed}`);
  console.log(`📊 Total: ${essentialServices.length}\n`);
  
  // Save config
  const configPath = path.join(process.cwd(), 'data', 'core-services-running.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    services: running.map(s => ({
      name: s.name,
      port: s.port,
      endpoint: '/health',
    })),
  }, null, 2));
  
  console.log(`📝 Config: ${configPath}\n`);
  console.log('🎉 CORE SYSTEM BEREIT!\n');
  console.log('Nächste Schritte:');
  console.log('  1. bun run scripts/real-world-impact-analyzer.ts');
  console.log('  2. bun run scripts/cooperation-engine.ts');
  console.log('  3. bun run scripts/visibility-campaign.ts\n');
}

main().catch(console.error);
