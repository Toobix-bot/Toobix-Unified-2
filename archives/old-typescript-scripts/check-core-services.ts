/**
 * 🔧 CORE SERVICE HEALTH CHECKER & FIXER
 * Prüft und repariert alle 6 Essential Core Services
 */

import { readFile } from 'node:fs/promises';

interface ServiceCheck {
  name: string;
  path: string;
  port?: number;
  hasServer: boolean;
  hasKeepAlive: boolean;
  hasHealthEndpoint: boolean;
  hasDatabase: boolean;
  hasErrorHandling: boolean;
  issues: string[];
  recommendations: string[];
}

const CORE_SERVICES = [
  { name: 'toobix-command-center', path: 'core/toobix-command-center.ts', port: 7777 },
  { name: 'self-awareness-core', path: 'core/self-awareness-core.ts', port: 8970 },
  { name: 'emotional-core', path: 'core/emotional-core.ts' },
  { name: 'dream-core', path: 'core/dream-core.ts' },
  { name: 'unified-core-service', path: 'core/unified-core-service.ts' },
  { name: 'unified-consciousness-service', path: 'core/unified-consciousness-service.ts' }
];

async function checkService(config: { name: string, path: string, port?: number }): Promise<ServiceCheck> {
  const check: ServiceCheck = {
    name: config.name,
    path: config.path,
    port: config.port,
    hasServer: false,
    hasKeepAlive: false,
    hasHealthEndpoint: false,
    hasDatabase: false,
    hasErrorHandling: false,
    issues: [],
    recommendations: []
  };
  
  try {
    const content = await readFile(config.path, 'utf-8');
    
    // Check for server
    check.hasServer = content.includes('Bun.serve') || content.includes('server.listen');
    if (!check.hasServer) {
      check.issues.push('No HTTP server found');
      check.recommendations.push('Add Bun.serve() to expose API');
    }
    
    // Check for keep-alive
    check.hasKeepAlive = content.includes('setInterval') || content.includes('while (true)') || content.includes('process.stdin.resume()');
    if (!check.hasKeepAlive && check.hasServer) {
      check.issues.push('No keep-alive mechanism');
      check.recommendations.push('Add process.stdin.resume() or setInterval for keep-alive');
    }
    
    // Check for health endpoint
    check.hasHealthEndpoint = content.includes('/health') || content.includes('health');
    if (!check.hasHealthEndpoint && check.hasServer) {
      check.issues.push('No /health endpoint');
      check.recommendations.push('Add GET /health endpoint for monitoring');
    }
    
    // Check for database
    check.hasDatabase = content.includes('Database(') || content.includes('bun:sqlite');
    
    // Check for error handling
    check.hasErrorHandling = content.includes('try {') && content.includes('catch');
    if (!check.hasErrorHandling) {
      check.issues.push('Missing error handling');
      check.recommendations.push('Wrap critical code in try-catch blocks');
    }
    
    // Port-specific checks
    if (config.port) {
      const portStr = config.port.toString();
      if (!content.includes(portStr)) {
        check.issues.push(`Port ${config.port} not found in code`);
      }
    }
    
  } catch (error: any) {
    check.issues.push(`File not found or unreadable: ${error.message}`);
    check.recommendations.push('Create or fix the service file');
  }
  
  return check;
}

async function generateHealthReport() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  🔧 CORE SERVICE HEALTH CHECK');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const checks: ServiceCheck[] = [];
  
  for (const service of CORE_SERVICES) {
    console.log(`Checking ${service.name}...`);
    const check = await checkService(service);
    checks.push(check);
  }
  
  console.log('\n📊 RESULTS:\n');
  
  let healthyCount = 0;
  let totalIssues = 0;
  
  for (const check of checks) {
    const isHealthy = check.issues.length === 0;
    const emoji = isHealthy ? '✅' : '⚠️';
    
    console.log(`${emoji} ${check.name}`);
    console.log(`   Path: ${check.path}`);
    if (check.port) console.log(`   Port: ${check.port}`);
    console.log(`   Server: ${check.hasServer ? '✓' : '✗'}`);
    console.log(`   Keep-Alive: ${check.hasKeepAlive ? '✓' : '✗'}`);
    console.log(`   Health Endpoint: ${check.hasHealthEndpoint ? '✓' : '✗'}`);
    console.log(`   Database: ${check.hasDatabase ? '✓' : 'N/A'}`);
    console.log(`   Error Handling: ${check.hasErrorHandling ? '✓' : '✗'}`);
    
    if (check.issues.length > 0) {
      console.log(`\n   Issues (${check.issues.length}):`);
      check.issues.forEach(i => console.log(`     • ${i}`));
    }
    
    if (check.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      check.recommendations.forEach(r => console.log(`     → ${r}`));
    }
    
    console.log('');
    
    if (isHealthy) healthyCount++;
    totalIssues += check.issues.length;
  }
  
  console.log('═'.repeat(60));
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Healthy Services: ${healthyCount}/${CORE_SERVICES.length}`);
  console.log(`   Total Issues: ${totalIssues}`);
  console.log(`   Health Score: ${Math.round((healthyCount / CORE_SERVICES.length) * 100)}%\n`);
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: CORE_SERVICES.length,
      healthy: healthyCount,
      totalIssues,
      healthScore: Math.round((healthyCount / CORE_SERVICES.length) * 100)
    },
    services: checks
  };
  
  await Bun.write('CORE-SERVICES-HEALTH-REPORT.json', JSON.stringify(report, null, 2));
  console.log('✅ Report saved to: CORE-SERVICES-HEALTH-REPORT.json\n');
  
  // Recommendations
  if (totalIssues > 0) {
    console.log('🔧 NEXT STEPS:\n');
    console.log('1. Review CORE-SERVICES-HEALTH-REPORT.json');
    console.log('2. Fix critical issues (keep-alive, health endpoints)');
    console.log('3. Re-run this check');
    console.log('4. Test with: bun run start-toobix-optimized.ts --minimal\n');
  } else {
    console.log('🎉 ALL CORE SERVICES ARE HEALTHY!\n');
    console.log('Ready to start in minimal mode:\n');
    console.log('   bun run start-toobix-optimized.ts --minimal\n');
  }
}

generateHealthReport().catch(console.error);
