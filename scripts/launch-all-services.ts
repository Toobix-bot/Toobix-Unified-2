/**
 * 🚀 TOOBIX MASS SERVICE LAUNCHER
 * 
 * Startet alle 49 gestoppten Services systematisch
 */

import * as fs from 'fs';
import * as path from 'path';

interface ServiceConfig {
  name: string;
  port: number;
  endpoint: string;
}

interface DiscoveredServices {
  timestamp: string;
  totalServices: number;
  runningServices: number;
  services: ServiceConfig[];
}

async function loadDiscoveredServices(): Promise<DiscoveredServices | null> {
  const configPath = path.join(process.cwd(), 'data', 'discovered-services.json');
  
  if (!fs.existsSync(configPath)) {
    console.log('⚠️  Keine discovered-services.json gefunden. Führe zuerst: bun run scripts/discover-all-services.ts');
    return null;
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

async function findServiceFile(serviceName: string): Promise<string | null> {
  // Konvertiere "Health Monitor" → "health-monitor.ts"
  const fileName = serviceName.toLowerCase().replace(/\s+/g, '-') + '.ts';
  
  // Suche in services/
  const servicesPath = path.join(process.cwd(), 'services', fileName);
  if (fs.existsSync(servicesPath)) {
    return `services/${fileName}`;
  }
  
  // Suche in scripts/2-services/
  const scripts2Path = path.join(process.cwd(), 'scripts', '2-services', fileName);
  if (fs.existsSync(scripts2Path)) {
    return `scripts/2-services/${fileName}`;
  }
  
  return null;
}

async function getAllStoppedServices(): Promise<Array<{name: string, port: number, file: string}>> {
  const stoppedServices = [];
  
  // Scan scripts/2-services/ für alle Services mit Port
  const scriptsDir = path.join(process.cwd(), 'scripts', '2-services');
  const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.ts'));
  
  for (const file of files) {
    const fullPath = path.join(scriptsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const port = extractPort(content);
    
    if (port) {
      const isRunning = await checkServiceHealth(port);
      if (!isRunning) {
        stoppedServices.push({
          name: file.replace('.ts', '').replace(/-/g, ' ').toUpperCase(),
          port,
          file: `scripts/2-services/${file}`,
        });
      }
    }
  }
  
  return stoppedServices;
}

function extractPort(content: string): number | undefined {
  const patterns = [
    /port:\s*(\d+)/,
    /listen\((\d+)\)/,
    /PORT\s*=\s*(\d+)/,
    /const\s+PORT\s*=\s*(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return undefined;
}

async function checkServiceHealth(port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch (e) {
    return false;
  }
}

async function startService(file: string, port: number): Promise<boolean> {
  try {
    console.log(`  🚀 Starte ${file} auf Port ${port}...`);
    
    const proc = Bun.spawn(['bun', 'run', file], {
      cwd: process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe',
    });
    
    // Warte 3 Sekunden
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Prüfe ob Service hochgekommen ist
    const isRunning = await checkServiceHealth(port);
    
    if (isRunning) {
      console.log(`  ✅ ${file} läuft auf Port ${port}`);
      return true;
    } else {
      console.log(`  ⚠️  ${file} gestartet, aber Health-Check fehlgeschlagen`);
      return false;
    }
  } catch (e: any) {
    console.log(`  🔴 Fehler beim Starten: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 TOOBIX MASS SERVICE LAUNCHER\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Suche gestoppte Services...\n');
  
  const stoppedServices = await getAllStoppedServices();
  
  console.log(`Gefunden: ${stoppedServices.length} gestoppte Services\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (stoppedServices.length === 0) {
    console.log('✅ Alle Services laufen bereits!\n');
    return;
  }
  
  // Priorisiere kritische Services
  const priorityServices = [
    'event-bus-v4',          // Event System (Port 8955)
    'memory-palace-v4',      // Memory (Port 8953)
    'llm-gateway-v4',        // LLM Gateway (Port 8954)
    'life-companion-core',   // Life Companion (Port 8970)
    'life-companion-coordinator', // Coordinator (Port 8969)
    'emotional-wellbeing',   // Emotions (Port 8903)
    'proactive-communication-v2', // Proactive (Port 8971)
  ];
  
  // Sortiere: Priority zuerst, dann Rest
  const sorted = stoppedServices.sort((a, b) => {
    const aFile = a.file.split('/').pop() || '';
    const bFile = b.file.split('/').pop() || '';
    const aPrio = priorityServices.indexOf(aFile.replace('.ts', ''));
    const bPrio = priorityServices.indexOf(bFile.replace('.ts', ''));
    
    if (aPrio !== -1 && bPrio !== -1) return aPrio - bPrio;
    if (aPrio !== -1) return -1;
    if (bPrio !== -1) return 1;
    return 0;
  });
  
  console.log('STARTE SERVICES (Priorität zuerst):\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < sorted.length; i++) {
    const service = sorted[i];
    console.log(`\n[${i + 1}/${sorted.length}] ${service.name} (Port ${service.port})`);
    
    const success = await startService(service.file, service.port);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Pause zwischen Services
    if (i < sorted.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ZUSAMMENFASSUNG');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`✅ Erfolgreich gestartet: ${successCount}`);
  console.log(`🔴 Fehlgeschlagen: ${failureCount}`);
  console.log(`📊 Total versucht: ${sorted.length}\n`);
  
  console.log('🔄 Führe erneut Discovery aus...\n');
  
  // Re-run discovery
  const { spawn } = await import('child_process');
  spawn('bun', ['run', 'scripts/discover-all-services.ts'], {
    stdio: 'inherit',
  });
}

main().catch(console.error);
