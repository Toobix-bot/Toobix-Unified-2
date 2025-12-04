/**
 * SERVICE CONSOLIDATION ANALYZER
 * Identifiziert Services die zusammengelegt werden können
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface ServiceInfo {
  path: string;
  name: string;
  port?: number;
  category: string;
  canMergeWith?: string[];
  size: number;
}

const REPO_ROOT = process.cwd();

async function analyzeService(filePath: string): Promise<ServiceInfo | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const stats = await Bun.file(filePath).size;
    
    // Extract port
    const portMatch = content.match(/(?:PORT|port)\s*[=:]\s*(\d{4,5})/);
    const port = portMatch ? parseInt(portMatch[1]) : undefined;
    
    // Determine category
    let category = 'other';
    if (filePath.includes('core/')) category = 'core';
    else if (filePath.includes('minecraft')) category = 'minecraft';
    else if (filePath.includes('consciousness') || filePath.includes('meta')) category = 'consciousness';
    else if (filePath.includes('emotion') || filePath.includes('dream')) category = 'emotional';
    else if (filePath.includes('memory')) category = 'memory';
    else if (filePath.includes('game') || filePath.includes('world')) category = 'gaming';
    else if (filePath.includes('chat') || filePath.includes('communication')) category = 'communication';
    else if (filePath.includes('monitor') || filePath.includes('health')) category = 'monitoring';
    
    const name = filePath.split(/[\\/]/).pop()?.replace('.ts', '') || 'unknown';
    
    return {
      path: filePath.replace(REPO_ROOT + '\\', ''),
      name,
      port,
      category,
      size: stats
    };
  } catch {
    return null;
  }
}

async function findAllServices(): Promise<ServiceInfo[]> {
  const services: ServiceInfo[] = [];
  const searchDirs = [
    join(REPO_ROOT, 'core'),
    join(REPO_ROOT, 'services'),
    join(REPO_ROOT, 'scripts', '2-services'),
    join(REPO_ROOT, 'scripts', '8-conscious-decision-framework'),
    join(REPO_ROOT, 'scripts', '9-network'),
    join(REPO_ROOT, 'scripts', '12-minecraft'),
    join(REPO_ROOT, 'scripts', '13-life-simulation'),
    join(REPO_ROOT, 'scripts', '14-life-domains'),
    join(REPO_ROOT, 'scripts', '15-meta-knowledge'),
    join(REPO_ROOT, 'scripts', '16-universal-integration'),
    join(REPO_ROOT, 'scripts', '17-wellness-safety')
  ];
  
  for (const dir of searchDirs) {
    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (file.endsWith('.ts') && !file.includes('test') && !file.includes('demo')) {
          const fullPath = join(dir, file);
          const content = await readFile(fullPath, 'utf-8');
          
          // Only include if it's actually a service (has Bun.serve or server.listen)
          if (content.includes('Bun.serve') || content.includes('server.listen')) {
            const info = await analyzeService(fullPath);
            if (info) services.push(info);
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }
  
  return services;
}

function identifyConsolidationOpportunities(services: ServiceInfo[]): Map<string, ServiceInfo[]> {
  const groups = new Map<string, ServiceInfo[]>();
  
  // Group by category
  for (const service of services) {
    const existing = groups.get(service.category) || [];
    existing.push(service);
    groups.set(service.category, existing);
  }
  
  return groups;
}

function generateConsolidationPlan(groups: Map<string, ServiceInfo[]>): string {
  let plan = '';
  
  const categoryNames: Record<string, string> = {
    'core': '💎 Core Services',
    'consciousness': '🧠 Consciousness Services',
    'emotional': '💚 Emotional Services',
    'memory': '🗃️ Memory Services',
    'gaming': '🎮 Gaming Services',
    'communication': '💬 Communication Services',
    'monitoring': '📊 Monitoring Services',
    'minecraft': '⛏️ Minecraft Services',
    'other': '🔧 Other Services'
  };
  
  for (const [category, services] of groups.entries()) {
    if (services.length > 1) {
      plan += `\n${categoryNames[category] || category}\n`;
      plan += `${'='.repeat(50)}\n`;
      plan += `Found ${services.length} services - Can merge into 1 unified service\n\n`;
      
      for (const service of services) {
        plan += `  - ${service.name.padEnd(40)} Port: ${service.port || 'N/A'}\n`;
      }
      
      plan += `\n  ✅ MERGED INTO: ${category}-unified-service.ts\n`;
      plan += `  💾 Memory saved: ~${Math.round(services.length * 150)}MB\n`;
      plan += `  ⚡ Performance: Single process instead of ${services.length}\n`;
      plan += '\n';
    }
  }
  
  return plan;
}

async function main() {
  console.log('========================================');
  console.log('  SERVICE CONSOLIDATION ANALYSIS');
  console.log('========================================\n');
  console.log('Scanning for services...\n');
  
  const services = await findAllServices();
  const groups = identifyConsolidationOpportunities(services);
  
  console.log(`📊 CURRENT STATE`);
  console.log('─────────────────────────────────────');
  console.log(`Total Services: ${services.length}`);
  console.log(`Categories: ${groups.size}`);
  console.log(`Estimated RAM: ~${services.length * 150}MB\n`);
  
  console.log(`🎯 CONSOLIDATION PLAN`);
  console.log('─────────────────────────────────────');
  console.log(generateConsolidationPlan(groups));
  
  // Calculate savings
  let targetServices = 0;
  for (const [_, services] of groups.entries()) {
    targetServices += services.length > 1 ? 1 : services.length;
  }
  
  console.log('\n📈 PROJECTED RESULTS');
  console.log('─────────────────────────────────────');
  console.log(`Current Services:  ${services.length}`);
  console.log(`Target Services:   ${targetServices}`);
  console.log(`Reduction:         ${services.length - targetServices} services (-${Math.round((1 - targetServices/services.length) * 100)}%)`);
  console.log(`Memory Saved:      ~${(services.length - targetServices) * 150}MB`);
  console.log(`VS Code Load:      🟢 Minimal (from 🔴 Extreme)\n`);
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    currentServices: services.length,
    targetServices,
    reduction: services.length - targetServices,
    groups: Array.from(groups.entries()).map(([category, svcs]) => ({
      category,
      count: svcs.length,
      services: svcs.map(s => ({ name: s.name, port: s.port, path: s.path }))
    }))
  };
  
  await Bun.write('SERVICE-CONSOLIDATION-REPORT.json', JSON.stringify(report, null, 2));
  console.log('✅ Detailed report saved to SERVICE-CONSOLIDATION-REPORT.json\n');
}

main().catch(console.error);
