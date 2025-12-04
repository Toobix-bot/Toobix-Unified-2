/**
 * 🎯 PHASE 2: EMOTIONS-ENGINE & SOCIAL INTELLIGENCE
 * 
 * Startet nur die essentiellen Services für Phase 2
 */

import * as fs from 'fs';
import * as path from 'path';

interface ServiceToStart {
  name: string;
  file: string;
  port: number;
  priority: 'critical' | 'high' | 'medium';
  category: string;
}

// Services für Phase 2.1: Emotions-Engine
const emotionsServices: ServiceToStart[] = [
  {
    name: 'Emotional Wellbeing',
    file: 'scripts/2-services/emotional-wellbeing.ts',
    port: 8903,
    priority: 'critical',
    category: 'Emotions',
  },
  {
    name: 'Emotional Support Service',
    file: 'scripts/2-services/emotional-support-service.ts',
    port: 8985,
    priority: 'high',
    category: 'Emotions',
  },
  {
    name: 'Emotion Dream Bridge',
    file: 'scripts/2-services/emotion-dream-bridge.ts',
    port: 8898,
    priority: 'high',
    category: 'Emotions',
  },
];

// Services für Phase 2.2: Social Intelligence
const socialServices: ServiceToStart[] = [
  {
    name: 'Multi Perspective V3',
    file: 'scripts/2-services/multi-perspective-v3.ts',
    port: 8897,
    priority: 'critical',
    category: 'Social',
  },
  {
    name: 'User Profile Service',
    file: 'scripts/2-services/user-profile-service.ts',
    port: 8904,
    priority: 'high',
    category: 'Social',
  },
];

// Basis-Services (immer benötigt)
const baseServices: ServiceToStart[] = [
  {
    name: 'Event Bus V4',
    file: 'scripts/2-services/event-bus-v4.ts',
    port: 8955,
    priority: 'critical',
    category: 'Core',
  },
  {
    name: 'Memory Palace V4',
    file: 'scripts/2-services/memory-palace-v4.ts',
    port: 8953,
    priority: 'critical',
    category: 'Core',
  },
  {
    name: 'LLM Gateway V4',
    file: 'scripts/2-services/llm-gateway-v4.ts',
    port: 8954,
    priority: 'critical',
    category: 'Core',
  },
];

async function checkServiceHealth(port: number): Promise<boolean> {
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

async function startService(service: ServiceToStart): Promise<boolean> {
  console.log(`\n  🚀 Starte ${service.name} (Port ${service.port})...`);
  
  try {
    const proc = Bun.spawn(['bun', 'run', service.file], {
      cwd: process.cwd(),
      stdout: 'ignore',
      stderr: 'ignore',
    });
    
    // Warte 5 Sekunden
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const isRunning = await checkServiceHealth(service.port);
    
    if (isRunning) {
      console.log(`  ✅ ${service.name} läuft!`);
      return true;
    } else {
      console.log(`  ⚠️  ${service.name} gestartet, aber Health-Check failed`);
      return false;
    }
  } catch (e: any) {
    console.log(`  🔴 Fehler: ${e.message}`);
    return false;
  }
}

async function startBatch(services: ServiceToStart[], batchName: string) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${batchName}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  const results = [];
  
  for (const service of services) {
    // Prüfe ob schon läuft
    const isRunning = await checkServiceHealth(service.port);
    
    if (isRunning) {
      console.log(`  ✅ ${service.name} (Port ${service.port}) - BEREITS AKTIV`);
      results.push({ service, success: true, alreadyRunning: true });
    } else {
      const success = await startService(service);
      results.push({ service, success, alreadyRunning: false });
      
      // Pause zwischen Services
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  🧠 PHASE 2: EMOTIONS & SOCIAL INTELLIGENCE          ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  
  console.log('Startet essentielle Services für:');
  console.log('  • Phase 2.1: Emotions-Engine (3 Services)');
  console.log('  • Phase 2.2: Social Intelligence (2 Services)');
  console.log('  • Basis-Services (3 Services)');
  console.log('\nTotal: 8 Services\n');
  
  let totalSuccess = 0;
  let totalAlreadyRunning = 0;
  let totalFailed = 0;
  
  // 1. Basis-Services
  const baseResults = await startBatch(baseServices, '🔧 BATCH 1: BASIS-SERVICES (Core Infrastructure)');
  baseResults.forEach(r => {
    if (r.alreadyRunning) totalAlreadyRunning++;
    else if (r.success) totalSuccess++;
    else totalFailed++;
  });
  
  // 2. Emotions-Services
  const emotionsResults = await startBatch(emotionsServices, '❤️  BATCH 2: EMOTIONS-SERVICES (Phase 2.1)');
  emotionsResults.forEach(r => {
    if (r.alreadyRunning) totalAlreadyRunning++;
    else if (r.success) totalSuccess++;
    else totalFailed++;
  });
  
  // 3. Social-Services
  const socialResults = await startBatch(socialServices, '👥 BATCH 3: SOCIAL INTELLIGENCE (Phase 2.2)');
  socialResults.forEach(r => {
    if (r.alreadyRunning) totalAlreadyRunning++;
    else if (r.success) totalSuccess++;
    else totalFailed++;
  });
  
  // Zusammenfassung
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 2 SERVICE STARTUP - ZUSAMMENFASSUNG');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`✅ Neu gestartet: ${totalSuccess}`);
  console.log(`♻️  Bereits aktiv: ${totalAlreadyRunning}`);
  console.log(`🔴 Fehlgeschlagen: ${totalFailed}`);
  console.log(`📊 Total: ${totalSuccess + totalAlreadyRunning + totalFailed}\n`);
  
  const totalActive = totalSuccess + totalAlreadyRunning;
  
  if (totalActive >= 6) {
    console.log('🎉 PHASE 2 SERVICES READY!\n');
    console.log('Nächste Schritte:');
    console.log('  1. Test Emotions-Engine: curl http://localhost:8903/health');
    console.log('  2. Test Social Intelligence: curl http://localhost:8897/health');
    console.log('  3. Weiter mit Phase 2.1 Implementation\n');
  } else {
    console.log('⚠️  Nicht alle kritischen Services laufen.');
    console.log('Prüfe Fehler und starte erneut.\n');
  }
  
  // Update Health Monitor mit neuen Services
  console.log('🔄 Aktualisiere Health Monitor Konfiguration...\n');
  
  const allServices = [...baseServices, ...emotionsServices, ...socialServices];
  const healthMonitorConfig = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 2: Emotions & Social Intelligence',
    services: allServices.map(s => ({
      name: s.name,
      port: s.port,
      endpoint: '/health',
      category: s.category,
      priority: s.priority,
    })),
  };
  
  const configPath = path.join(process.cwd(), 'data', 'phase2-services.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(healthMonitorConfig, null, 2));
  
  console.log(`📝 Konfiguration gespeichert: ${configPath}\n`);
}

main().catch(console.error);
