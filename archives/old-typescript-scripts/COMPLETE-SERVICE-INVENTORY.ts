/**
 * 📋 COMPLETE SERVICE INVENTORY
 * Analysiert ALLE Services im Projekt und kategorisiert sie
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface ServiceInfo {
  name: string;
  path: string;
  type: 'HTTP' | 'BACKGROUND' | 'UNKNOWN';
  port?: number;
  isActive: boolean; // Bereits in start-toobix-optimized.ts
  hasServer: boolean;
  category: string;
}

const services: ServiceInfo[] = [];

// Directories to scan
const directories = [
  'scripts/2-services',
  'scripts/12-minecraft',
  'scripts/creator-interface',
  'scripts/7-value-creation',
  'scripts/autonomous-research',
  'scripts/proactive-communication',
  'scripts/3-game-universe',
  'scripts/0-core',
  'scripts/3-dashboard',
  'scripts/4-consciousness',
  'scripts/13-life-simulation',
  'scripts/8-conscious-decision-framework',
  'scripts/9-network',
  'scripts/14-life-domains',
  'scripts/15-meta-knowledge',
  'scripts/16-universal-integration',
  'scripts/17-wellness-safety',
  'scripts/3-tools',
  'scripts/4-analytics',
  'scripts/5-voice',
  'scripts/system-cleanup',
  'core',
  'services',
];

// Services already in start-toobix-optimized.ts
const activeServices = new Set([
  'toobix-command-center',
  'self-awareness-core',
  'emotional-core',
  'dream-core',
  'unified-core-service',
  'unified-consciousness-service',
  'autonomy-engine',
  'multi-llm-router',
  'wellness-safety-guardian',
  'life-simulation-engine',
  'decision-framework-server',
  'service-mesh',
  'hardware-awareness-v2',
  'twitter-autonomy',
  'unified-communication-service',
  'minecraft-bot-service',
  'minecraft-consciousness-system',
  'toobix-colony-7-stable',
  'toobix-empire-5-stable',
  'self-evolving-game-engine',
  'toobix-living-world',
]);

async function findTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.includes('backups') && !entry.name.includes('Toobix-Unified')) {
          files.push(...await findTsFiles(fullPath));
        }
      } else if (entry.name.endsWith('.ts') && !entry.name.includes('test-')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  return files;
}

async function analyzeFile(filePath: string): Promise<ServiceInfo | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check if it's a service file
    const hasServer = content.includes('Bun.serve') || content.includes('.listen(');
    const isService = hasServer || 
                     filePath.includes('-service.ts') || 
                     filePath.includes('-engine.ts') ||
                     content.includes('async start(') ||
                     content.includes('startServer');
    
    if (!isService) return null;
    
    // Extract port
    let port: number | undefined;
    
    // Match patterns: PORT = 8000, port: 8000, listen(8000), {port: 8000}
    const portPatterns = [
      /PORT\s*[=:]\s*(\d{4,5})/,
      /port\s*[=:]\s*(\d{4,5})/,
      /\.listen\(\s*(\d{4,5})/,
      /Bun\.serve\(\s*\{\s*port\s*:\s*(\d{4,5})/,
    ];
    
    for (const pattern of portPatterns) {
      const match = content.match(pattern);
      if (match) {
        port = parseInt(match[1]);
        break;
      }
    }
    
    // Determine category from path
    let category = 'Other';
    if (filePath.includes('scripts/2-services')) category = 'Core Services';
    if (filePath.includes('scripts/12-minecraft')) category = 'Minecraft';
    if (filePath.includes('scripts/creator-interface')) category = 'Creator Interface';
    if (filePath.includes('scripts/7-value-creation')) category = 'Value Creation';
    if (filePath.includes('scripts/autonomous-research')) category = 'Research';
    if (filePath.includes('scripts/proactive-communication')) category = 'Communication';
    if (filePath.includes('scripts/0-core') || filePath.includes('core/')) category = 'Essential Core';
    if (filePath.includes('scripts/3-dashboard')) category = 'Dashboard';
    if (filePath.includes('scripts/4-consciousness')) category = 'Consciousness';
    if (filePath.includes('scripts/13-life-simulation')) category = 'Life Simulation';
    if (filePath.includes('scripts/8-conscious-decision')) category = 'Decision Framework';
    if (filePath.includes('scripts/9-network')) category = 'Network';
    if (filePath.includes('scripts/3-tools')) category = 'Tools';
    if (filePath.includes('wellness-safety')) category = 'Wellness & Safety';
    
    const name = filePath.split(/[/\\]/).pop()?.replace('.ts', '') || 'unknown';
    const isActive = activeServices.has(name);
    
    return {
      name,
      path: filePath.replace(/\\/g, '/'),
      type: hasServer ? 'HTTP' : 'BACKGROUND',
      port,
      isActive,
      hasServer,
      category
    };
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🔍 Scanning all service files...\n');
  
  for (const dir of directories) {
    const files = await findTsFiles(dir);
    for (const file of files) {
      const info = await analyzeFile(file);
      if (info) {
        services.push(info);
      }
    }
  }
  
  console.log(`📊 Found ${services.length} services\n`);
  
  // Group by category
  const byCategory = new Map<string, ServiceInfo[]>();
  for (const service of services) {
    const list = byCategory.get(service.category) || [];
    list.push(service);
    byCategory.set(service.category, list);
  }
  
  // Sort categories
  const sortedCategories = Array.from(byCategory.entries()).sort((a, b) => {
    const order = ['Essential Core', 'Core Services', 'Consciousness', 'Communication', 'Research', 
                   'Value Creation', 'Creator Interface', 'Dashboard', 'Tools', 'Minecraft', 
                   'Life Simulation', 'Decision Framework', 'Network', 'Wellness & Safety', 'Other'];
    return order.indexOf(a[0]) - order.indexOf(b[0]);
  });
  
  // Print HTTP Services
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📡 HTTP-SERVICES (mit Server/Port)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const httpServices = services.filter(s => s.type === 'HTTP').sort((a, b) => (a.port || 9999) - (b.port || 9999));
  
  for (const [category, categoryServices] of sortedCategories) {
    const httpInCategory = categoryServices.filter(s => s.type === 'HTTP');
    if (httpInCategory.length === 0) continue;
    
    console.log(`\n┌─ ${category.toUpperCase()} ─────────────────────────────────────`);
    for (const service of httpInCategory) {
      const status = service.isActive ? '✅ AKTIV' : '🆕 NEU';
      const portStr = service.port ? `Port ${service.port}` : 'Port ?????';
      console.log(`│ ${status} - ${service.name.padEnd(40)} (${portStr})`);
      console.log(`│        ${service.path}`);
    }
  }
  
  // Print Background Services
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('⚙️  BACKGROUND-SERVICES (ohne HTTP-Server)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const [category, categoryServices] of sortedCategories) {
    const bgInCategory = categoryServices.filter(s => s.type === 'BACKGROUND');
    if (bgInCategory.length === 0) continue;
    
    console.log(`\n┌─ ${category.toUpperCase()} ─────────────────────────────────────`);
    for (const service of bgInCategory) {
      const status = service.isActive ? '✅ AKTIV' : '🆕 NEU';
      console.log(`│ ${status} - ${service.name}`);
      console.log(`│        ${service.path}`);
    }
  }
  
  // Statistics
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('📊 STATISTIK');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const httpCount = services.filter(s => s.type === 'HTTP').length;
  const bgCount = services.filter(s => s.type === 'BACKGROUND').length;
  const activeCount = services.filter(s => s.isActive).length;
  const newCount = services.filter(s => !s.isActive).length;
  const withPort = services.filter(s => s.port !== undefined).length;
  const withoutPort = httpServices.filter(s => s.port === undefined).length;
  
  console.log(`Total Services:           ${services.length}`);
  console.log(`├─ HTTP Services:          ${httpCount}`);
  console.log(`│  ├─ Mit Port:            ${withPort}`);
  console.log(`│  └─ Ohne Port:           ${withoutPort} ⚠️`);
  console.log(`└─ Background Services:    ${bgCount}`);
  console.log();
  console.log(`Bereits aktiv:            ${activeCount} ✅`);
  console.log(`Neue Services:            ${newCount} 🆕`);
  
  // Port recommendations for services without port
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('💡 PORT-EMPFEHLUNGEN (für Services ohne Port)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const usedPorts = new Set(services.filter(s => s.port).map(s => s.port!));
  const servicesNeedingPort = httpServices.filter(s => !s.port);
  
  let nextPort = 8100;
  const findNextPort = () => {
    while (usedPorts.has(nextPort)) nextPort++;
    usedPorts.add(nextPort);
    return nextPort++;
  };
  
  if (servicesNeedingPort.length > 0) {
    console.log('Diese Services sollten Ports zugewiesen bekommen:\n');
    for (const service of servicesNeedingPort) {
      const recommendedPort = findNextPort();
      console.log(`${service.name}`);
      console.log(`  → Empfohlener Port: ${recommendedPort}`);
      console.log(`  → Pfad: ${service.path}`);
      console.log();
    }
  } else {
    console.log('✅ Alle HTTP-Services haben bereits Ports!\n');
  }
  
  // Export to JSON for further processing
  const exportData = {
    timestamp: new Date().toISOString(),
    totalServices: services.length,
    httpServices: httpCount,
    backgroundServices: bgCount,
    activeServices: activeCount,
    newServices: newCount,
    categories: Array.from(byCategory.entries()).map(([name, services]) => ({
      name,
      count: services.length,
      services: services.map(s => ({
        name: s.name,
        path: s.path,
        type: s.type,
        port: s.port,
        isActive: s.isActive
      }))
    })),
    allServices: services
  };
  
  await Bun.write('SERVICE-INVENTORY.json', JSON.stringify(exportData, null, 2));
  console.log('💾 Vollständige Daten gespeichert: SERVICE-INVENTORY.json\n');
}

main().catch(console.error);
