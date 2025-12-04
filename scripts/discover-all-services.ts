/**
 * 🔍 TOOBIX SERVICE DISCOVERY
 * 
 * Findet alle laufenden Services und ihre Ports
 */

import * as fs from 'fs';
import * as path from 'path';

interface DiscoveredService {
  name: string;
  file: string;
  port?: number;
  category: string;
  status: 'unknown' | 'running' | 'stopped';
}

async function discoverServices(): Promise<DiscoveredService[]> {
  const services: DiscoveredService[] = [];
  
  // Scan services/ directory
  const servicesDir = path.join(process.cwd(), 'services');
  if (fs.existsSync(servicesDir)) {
    const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const fullPath = path.join(servicesDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const port = extractPort(content);
      
      services.push({
        name: file.replace('.ts', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        file: `services/${file}`,
        port,
        category: 'Core Services',
        status: 'unknown',
      });
    }
  }
  
  // Scan scripts/2-services/ directory
  const scripts2ServicesDir = path.join(process.cwd(), 'scripts', '2-services');
  if (fs.existsSync(scripts2ServicesDir)) {
    const files = fs.readdirSync(scripts2ServicesDir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const fullPath = path.join(scripts2ServicesDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const port = extractPort(content);
      
      services.push({
        name: file.replace('.ts', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        file: `scripts/2-services/${file}`,
        port,
        category: 'Extended Services',
        status: 'unknown',
      });
    }
  }
  
  // Check welche davon laufen
  for (const service of services) {
    if (service.port) {
      service.status = await checkServiceHealth(service.port);
    }
  }
  
  return services;
}

function extractPort(content: string): number | undefined {
  // Suche nach port: 1234, listen(1234), PORT = 1234
  const patterns = [
    /port:\s*(\d+)/,
    /listen\((\d+)\)/,
    /PORT\s*=\s*(\d+)/,
    /const\s+PORT\s*=\s*(\d+)/,
    /\.listen\((\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return undefined;
}

async function checkServiceHealth(port: number): Promise<'running' | 'stopped'> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return response.ok ? 'running' : 'stopped';
  } catch (e) {
    return 'stopped';
  }
}

async function main() {
  console.log('\n🔍 TOOBIX SERVICE DISCOVERY\n');
  console.log('Scanne alle Service-Dateien...\n');
  
  const services = await discoverServices();
  
  // Gruppiere nach Kategorie
  const byCategory: Record<string, DiscoveredService[]> = {};
  for (const service of services) {
    if (!byCategory[service.category]) {
      byCategory[service.category] = [];
    }
    byCategory[service.category].push(service);
  }
  
  // Zeige Ergebnisse
  for (const [category, categoryServices] of Object.entries(byCategory)) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`${category} (${categoryServices.length} Services)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    const running = categoryServices.filter(s => s.status === 'running');
    const stopped = categoryServices.filter(s => s.status === 'stopped');
    const unknown = categoryServices.filter(s => s.status === 'unknown');
    
    console.log(`✅ Running: ${running.length}`);
    console.log(`🔴 Stopped: ${stopped.length}`);
    console.log(`❓ Unknown: ${unknown.length}\n`);
    
    // Zeige laufende Services
    if (running.length > 0) {
      console.log('RUNNING SERVICES:');
      for (const service of running) {
        console.log(`  ✅ ${service.name.padEnd(40)} Port ${service.port}`);
      }
      console.log('');
    }
    
    // Zeige gestoppte Services mit Port
    const stoppedWithPort = stopped.filter(s => s.port);
    if (stoppedWithPort.length > 0) {
      console.log('STOPPED SERVICES (with known port):');
      for (const service of stoppedWithPort) {
        console.log(`  🔴 ${service.name.padEnd(40)} Port ${service.port}`);
      }
      console.log('');
    }
  }
  
  // Zusammenfassung
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ZUSAMMENFASSUNG');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const totalServices = services.length;
  const servicesWithPort = services.filter(s => s.port).length;
  const runningServices = services.filter(s => s.status === 'running').length;
  
  console.log(`Total Services gefunden: ${totalServices}`);
  console.log(`Services mit Port: ${servicesWithPort}`);
  console.log(`Aktuell laufend: ${runningServices}`);
  console.log(`Gestoppt/Offline: ${servicesWithPort - runningServices}\n`);
  
  // Export für Health Monitor
  const healthMonitorConfig = services
    .filter(s => s.port && s.status === 'running')
    .map(s => ({
      name: s.name,
      port: s.port!,
      endpoint: '/health',
    }));
  
  const configPath = path.join(process.cwd(), 'data', 'discovered-services.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalServices,
    runningServices,
    services: healthMonitorConfig,
  }, null, 2));
  
  console.log(`📝 Konfiguration gespeichert: ${configPath}\n`);
}

main().catch(console.error);
