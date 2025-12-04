/**
 * COMPLETE SERVICE ANALYZER
 * Analysiert ALLE Services und erstellt einen detaillierten Report
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

interface ServiceDetail {
  id: string;
  name: string;
  path: string;
  port?: number;
  size: number;
  linesOfCode: number;
  imports: string[];
  dependencies: string[];
  hasServer: boolean;
  category: string;
  status: 'active' | 'duplicate' | 'deprecated' | 'broken' | 'unknown';
  consolidatedIn?: string;
  description?: string;
}

const REPO_ROOT = process.cwd();

async function analyzeService(filePath: string): Promise<ServiceDetail | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const fileStats = await stat(filePath);
    const lines = content.split('\n').length;
    
    // Extract info
    const portMatch = content.match(/(?:PORT|port)\s*[=:]\s*(\d{4,5})/);
    const hasServer = content.includes('Bun.serve') || content.includes('server.listen');
    
    // Extract imports
    const imports = [...content.matchAll(/import .+ from ['"](.+)['"]/g)]
      .map(m => m[1]);
    
    // Extract description from comments
    const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+)/);
    const description = descMatch ? descMatch[1].trim() : undefined;
    
    // Determine category
    let category = 'other';
    if (filePath.includes('core/')) category = 'core';
    else if (filePath.includes('emotional')) category = 'emotional';
    else if (filePath.includes('dream')) category = 'dream';
    else if (filePath.includes('consciousness')) category = 'consciousness';
    else if (filePath.includes('memory')) category = 'memory';
    else if (filePath.includes('minecraft')) category = 'minecraft';
    else if (filePath.includes('chat') || filePath.includes('communication')) category = 'communication';
    else if (filePath.includes('game') || filePath.includes('world')) category = 'gaming';
    
    // Check for consolidation markers
    const consolidatedMatch = content.match(/KONSOLIDIERT aus (\d+)/);
    const isConsolidated = !!consolidatedMatch;
    
    const name = filePath.split(/[\\/]/).pop()?.replace('.ts', '') || 'unknown';
    
    return {
      id: name,
      name,
      path: filePath.replace(REPO_ROOT + '\\', ''),
      port: portMatch ? parseInt(portMatch[1]) : undefined,
      size: fileStats.size,
      linesOfCode: lines,
      imports,
      dependencies: [],
      hasServer,
      category,
      status: 'unknown',
      description
    };
  } catch (error) {
    return null;
  }
}

async function scanDirectory(dir: string, services: ServiceDetail[]): Promise<void> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'backups') {
        continue;
      }
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath, services);
      } else if (entry.name.endsWith('.ts') && !entry.name.includes('test') && !entry.name.includes('demo')) {
        const service = await analyzeService(fullPath);
        if (service && service.hasServer) {
          services.push(service);
        }
      }
    }
  } catch {}
}

async function categorizeServices(services: ServiceDetail[]): Promise<Map<string, ServiceDetail[]>> {
  const categories = new Map<string, ServiceDetail[]>();
  
  for (const service of services) {
    // Detect duplicates and status
    if (service.path.includes('archives/') || service.path.includes('deprecated/')) {
      service.status = 'deprecated';
    } else if (service.path.includes('backups/')) {
      service.status = 'duplicate';
    } else if (service.description?.includes('KONSOLIDIERT')) {
      service.status = 'active';
    } else if (service.path.startsWith('core/') || service.path.startsWith('services/')) {
      service.status = 'active';
    } else {
      service.status = 'unknown';
    }
    
    const cat = categories.get(service.category) || [];
    cat.push(service);
    categories.set(service.category, cat);
  }
  
  return categories;
}

async function main() {
  console.log('========================================');
  console.log('  COMPLETE SERVICE ANALYSIS');
  console.log('========================================\n');
  console.log('Scanning entire repository...\n');
  
  const allServices: ServiceDetail[] = [];
  
  // Scan all directories
  await scanDirectory(REPO_ROOT, allServices);
  
  // Categorize
  const categories = await categorizeServices(allServices);
  
  console.log(`Found ${allServices.length} services\n`);
  
  // Group by status
  const active = allServices.filter(s => s.status === 'active');
  const deprecated = allServices.filter(s => s.status === 'deprecated');
  const duplicates = allServices.filter(s => s.status === 'duplicate');
  const unknown = allServices.filter(s => s.status === 'unknown');
  
  console.log('📊 BY STATUS:');
  console.log('─'.repeat(60));
  console.log(`✅ Active:     ${active.length}`);
  console.log(`📦 Deprecated: ${deprecated.length}`);
  console.log(`🔄 Duplicates: ${duplicates.length}`);
  console.log(`❓ Unknown:    ${unknown.length}\n`);
  
  console.log('📊 BY CATEGORY:');
  console.log('─'.repeat(60));
  for (const [category, services] of categories.entries()) {
    const activeCount = services.filter(s => s.status === 'active').length;
    console.log(`${category.padEnd(20)} ${services.length} total (${activeCount} active)`);
  }
  console.log('');
  
  // Detailed breakdown
  console.log('📋 ACTIVE SERVICES BY CATEGORY:\n');
  
  for (const [category, services] of categories.entries()) {
    const activeServices = services.filter(s => s.status === 'active');
    if (activeServices.length === 0) continue;
    
    console.log(`\n${category.toUpperCase()} (${activeServices.length} services)`);
    console.log('─'.repeat(60));
    
    for (const service of activeServices) {
      const portInfo = service.port ? `Port ${service.port}` : 'No port';
      const sizeKB = Math.round(service.size / 1024);
      console.log(`  • ${service.name.padEnd(40)} ${portInfo.padEnd(12)} ${sizeKB}KB`);
    }
  }
  
  // Port conflicts
  console.log('\n\n⚠️  PORT CONFLICTS:\n');
  const portMap = new Map<number, ServiceDetail[]>();
  for (const service of active) {
    if (service.port) {
      const existing = portMap.get(service.port) || [];
      existing.push(service);
      portMap.set(service.port, existing);
    }
  }
  
  for (const [port, services] of portMap.entries()) {
    if (services.length > 1) {
      console.log(`Port ${port}:`);
      services.forEach(s => console.log(`  - ${s.name} (${s.path})`));
    }
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allServices.length,
      active: active.length,
      deprecated: deprecated.length,
      duplicates: duplicates.length,
      unknown: unknown.length
    },
    categories: Object.fromEntries(categories),
    active: active.map(s => ({
      name: s.name,
      path: s.path,
      port: s.port,
      category: s.category,
      size: s.size,
      linesOfCode: s.linesOfCode,
      description: s.description
    })),
    portConflicts: Object.fromEntries(
      Array.from(portMap.entries())
        .filter(([_, services]) => services.length > 1)
        .map(([port, services]) => [port, services.map(s => s.name)])
    )
  };
  
  await Bun.write(
    'COMPLETE-SERVICE-ANALYSIS.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n\n✅ Analysis complete!');
  console.log('Report saved to: COMPLETE-SERVICE-ANALYSIS.json\n');
}

main().catch(console.error);
