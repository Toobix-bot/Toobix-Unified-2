/**
 * 🧪 SERVICE INDIVIDUAL TESTER
 * Testet jeden Service einzeln und prüft Funktionalität + Harmonisierung
 */

import { spawn } from 'child_process';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  port?: number;
  startTime: number;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];

// TIER 1: Essential Core
const TIER1_SERVICES = [
  { name: 'toobix-command-center', path: 'core/toobix-command-center.ts', port: 7777, testEndpoint: '/ask', testMethod: 'POST', testBody: { question: 'Test' } },
  { name: 'self-awareness-core', path: 'core/self-awareness-core.ts', port: 8970, testEndpoint: '/status', testMethod: 'GET' },
  { name: 'emotional-core', path: 'core/emotional-core.ts', port: 8900, testEndpoint: '/emotion', testMethod: 'POST', testBody: { situation: 'Test' } },
  { name: 'dream-core', path: 'core/dream-core.ts', port: 8961, testEndpoint: '/dream', testMethod: 'GET' },
  { name: 'unified-core-service', path: 'core/unified-core-service.ts', port: 8000, testEndpoint: '/health', testMethod: 'GET' },
  { name: 'unified-consciousness-service', path: 'core/unified-consciousness-service.ts', port: 8002, testEndpoint: '/api/consciousness/reflect', testMethod: 'GET' },
];

// TIER 2: Enhanced (bereinigt - nur Server-Services)
const TIER2_SERVICES = [
  { name: 'autonomy-engine', path: 'core/autonomy-engine.ts', port: 8975, testEndpoint: '/status', testMethod: 'GET' },
  { name: 'multi-llm-router', path: 'core/multi-llm-router.ts', port: 8959, testEndpoint: '/route', testMethod: 'GET' },
  { name: 'wellness-safety-guardian', path: 'scripts/17-wellness-safety/wellness-safety-guardian.ts', port: 8921, testEndpoint: '/check', testMethod: 'GET' },
  { name: 'life-simulation-engine', path: 'scripts/13-life-simulation/life-simulation-engine.ts', port: 8914, testEndpoint: '/status', testMethod: 'GET' },
  { name: 'service-mesh', path: 'scripts/9-network/service-mesh.ts', port: 8910, testEndpoint: '/services', testMethod: 'GET' },
  { name: 'hardware-awareness-v2', path: 'services/hardware-awareness-v2.ts', port: 8940, testEndpoint: '/status', testMethod: 'GET' },
  { name: 'twitter-autonomy', path: 'core/twitter-autonomy.ts', port: 8965, testEndpoint: '/health', testMethod: 'GET' },
  { name: 'unified-communication-service', path: 'core/unified-communication-service.ts', port: 8001, testEndpoint: '/health', testMethod: 'GET' },
];

// TIER 3: Gaming (ohne Minecraft)
const TIER3_GAMING = [
  { name: 'self-evolving-game-engine', path: 'scripts/2-services/self-evolving-game-engine.ts', port: 8896, testEndpoint: '/status', testMethod: 'GET' },
  { name: 'toobix-living-world', path: 'core/toobix-living-world.ts', port: 7779, testEndpoint: '/world/state', testMethod: 'GET' },
];

async function testService(config: any): Promise<TestResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${config.name}`);
    console.log(`   Path: ${config.path}`);
    console.log(`   Port: ${config.port || 'N/A'}`);
    
    // Skip services without port (background services)
    if (config.port === null) {
      console.log(`   ⏭️  SKIPPED - Background service`);
      resolve({
        name: config.name,
        status: 'skip',
        startTime: 0,
      });
      return;
    }
    
    // Start service
    const proc = spawn('bun', ['run', config.path], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });
    
    let output = '';
    let errorOutput = '';
    
    proc.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Wait for service to start
    setTimeout(async () => {
      if (config.port) {
        // Test HTTP endpoint
        try {
          const url = `http://localhost:${config.port}${config.testEndpoint || '/'}`;
          const options: RequestInit = {
            method: config.testMethod || 'GET',
            headers: { 'Content-Type': 'application/json' },
          };
          
          if (config.testBody) {
            options.body = JSON.stringify(config.testBody);
          }
          
          const response = await fetch(url, options);
          const data = await response.json().catch(() => response.text());
          
          console.log(`   ✅ PASS - Response: ${response.status}`);
          
          proc.kill();
          resolve({
            name: config.name,
            status: 'pass',
            port: config.port,
            startTime: Date.now() - startTime,
            response: data,
          });
        } catch (e: any) {
          console.log(`   ❌ FAIL - ${e.message}`);
          
          proc.kill();
          resolve({
            name: config.name,
            status: 'fail',
            port: config.port,
            startTime: Date.now() - startTime,
            error: e.message,
          });
        }
      } else {
        // No port, just check if process started
        if (output.includes('running') || output.includes('started') || errorOutput.length === 0) {
          console.log(`   ✅ PASS - Process started`);
          
          proc.kill();
          resolve({
            name: config.name,
            status: 'pass',
            startTime: Date.now() - startTime,
          });
        } else {
          console.log(`   ❌ FAIL - Process failed to start`);
          console.log(`   Output: ${output}`);
          console.log(`   Error: ${errorOutput}`);
          
          proc.kill();
          resolve({
            name: config.name,
            status: 'fail',
            startTime: Date.now() - startTime,
            error: errorOutput || 'Failed to start',
          });
        }
      }
    }, 5000); // 5s warmup time
    
    // Timeout
    setTimeout(() => {
      console.log(`   ⏱️  TIMEOUT`);
      proc.kill();
      resolve({
        name: config.name,
        status: 'fail',
        startTime: Date.now() - startTime,
        error: 'Timeout',
      });
    }, 10000); // 10s max
  });
}

async function main() {
console.log('════════════════════════════════════════════════════════════════');
console.log('  🧪 TOOBIX SERVICE INDIVIDUAL TEST SUITE');
console.log('════════════════════════════════════════════════════════════════\n');
console.log('Mode: Development + Gaming (No Minecraft, No Tools)');
console.log(`Total Services: ${TIER1_SERVICES.length + TIER2_SERVICES.length + TIER3_GAMING.length}\n`);  // TIER 1
  console.log('\n🧠 TIER 1: ESSENTIAL CORE');
  console.log('─'.repeat(64));
  for (const service of TIER1_SERVICES) {
    const result = await testService(service);
    results.push(result);
  }
  
  // TIER 2
  console.log('\n\n🎨 TIER 2: ENHANCED CAPABILITIES');
  console.log('─'.repeat(64));
  for (const service of TIER2_SERVICES) {
    const result = await testService(service);
    results.push(result);
  }
  
  // TIER 3
  console.log('\n\n🎮 TIER 3: GAMING (No Minecraft)');
  console.log('─'.repeat(64));
  for (const service of TIER3_GAMING) {
    const result = await testService(service);
    results.push(result);
  }
  
  // Summary
  console.log('\n\n════════════════════════════════════════════════════════════════');
  console.log('  📊 TEST RESULTS SUMMARY');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('Failed Services:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n════════════════════════════════════════════════════════════════\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
