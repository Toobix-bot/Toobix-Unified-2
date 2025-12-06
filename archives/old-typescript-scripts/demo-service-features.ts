/**
 * 🎮 TOOBIX SERVICE FEATURES DEMO
 * 
 * Demonstriert die neuen Service-Features:
 * - Service Mesh Auto-Registration
 * - Event Bus Pub/Sub
 * - Circuit Breaker
 * - Response Caching
 */

import { CircuitBreaker } from './lib/circuit-breaker';
import { ResponseCache, cachedFetch } from './lib/response-cache';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(color: keyof typeof COLORS, message: string) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function testServiceMesh() {
  log('cyan', '\n🔍 TEST 1: SERVICE MESH DISCOVERY\n');
  
  try {
    const response = await fetch('http://localhost:8910/services');
    const services = await response.json();
    
    log('green', `✅ Service Mesh aktiv!`);
    log('bright', `📊 Registrierte Services: ${Object.keys(services).length}`);
    
    Object.entries(services).forEach(([name, info]: [string, any]) => {
      console.log(`   • ${name} (Port ${info.port}) - ${info.role}`);
    });
  } catch (error: any) {
    log('red', `❌ Service Mesh nicht erreichbar: ${error.message}`);
  }
}

async function testEventBus() {
  log('cyan', '\n📢 TEST 2: EVENT BUS PUB/SUB\n');
  
  try {
    // Test subscriber
    const subResponse = await fetch('http://localhost:8920/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'test.demo',
        serviceUrl: 'http://localhost:9999',
        serviceName: 'demo-subscriber'
      })
    });
    
    if (subResponse.ok) {
      log('green', '✅ Demo Subscriber registriert');
    }
    
    await wait(500);
    
    // Publish test event
    const pubResponse = await fetch('http://localhost:8920/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'test.demo',
        data: { message: 'Hello from Toobix Event Bus!' },
        source: 'demo-script'
      })
    });
    
    if (pubResponse.ok) {
      log('green', '✅ Event publiziert: test.demo');
    }
    
    await wait(500);
    
    // Get stats
    const statsResponse = await fetch('http://localhost:8920/stats');
    const stats = await statsResponse.json();
    
    log('bright', `📊 Event Bus Stats:`);
    console.log(`   Total Events: ${stats.totalEvents}`);
    console.log(`   Total Subscriptions: ${stats.totalSubscriptions}`);
    
  } catch (error: any) {
    log('red', `❌ Event Bus Test fehlgeschlagen: ${error.message}`);
  }
}

async function testCircuitBreaker() {
  log('cyan', '\n🔁 TEST 3: CIRCUIT BREAKER\n');
  
  const breaker = new CircuitBreaker('test-service', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 5000
  });
  
  log('bright', 'Simuliere 3 Failures...');
  
  // Simulate failures
  for (let i = 1; i <= 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('Simulated failure');
      });
    } catch (error: any) {
      console.log(`   ❌ Failure ${i}: ${error.message}`);
    }
  }
  
  log('yellow', `\n⚠️  Circuit State: ${breaker.getState()}`);
  
  // Try when circuit is open
  try {
    await breaker.execute(async () => {
      return 'success';
    });
  } catch (error: any) {
    log('red', `✅ Circuit OPEN - Request rejected as expected`);
  }
  
  // Reset and test success
  breaker.reset();
  log('green', '\n🔄 Circuit RESET');
  
  const result = await breaker.execute(async () => {
    return 'success';
  });
  
  log('green', `✅ Request successful: ${result}`);
  log('bright', `Circuit State: ${breaker.getState()}`);
}

async function testResponseCache() {
  log('cyan', '\n💾 TEST 4: RESPONSE CACHING\n');
  
  const cache = new ResponseCache({
    ttl: 10000,  // 10 seconds
    maxSize: 100,
    cleanupInterval: 5000
  });
  
  log('bright', 'First request (no cache)...');
  const start1 = Date.now();
  const data1 = await cachedFetch(
    cache,
    'test-key',
    async () => {
      await wait(100); // Simulate slow API
      return { message: 'Hello from API', timestamp: new Date() };
    }
  );
  const time1 = Date.now() - start1;
  log('yellow', `   Took ${time1}ms (cache miss)`);
  
  log('bright', '\nSecond request (cached)...');
  const start2 = Date.now();
  const data2 = await cachedFetch(
    cache,
    'test-key',
    async () => {
      await wait(100);
      return { message: 'Hello from API', timestamp: new Date() };
    }
  );
  const time2 = Date.now() - start2;
  log('green', `   Took ${time2}ms (cache hit!) - ${Math.round((time1-time2)/time1*100)}% faster`);
  
  const stats = cache.getStats();
  log('bright', `\n📊 Cache Stats:`);
  console.log(`   Size: ${stats.size}/${stats.maxSize}`);
  console.log(`   Total Hits: ${stats.totalHits}`);
  console.log(`   TTL: ${stats.ttl}ms`);
  
  cache.destroy();
}

async function testPerformanceDashboard() {
  log('cyan', '\n📊 TEST 5: PERFORMANCE DASHBOARD\n');
  
  try {
    const response = await fetch('http://localhost:8899/api/metrics');
    if (response.ok) {
      const metrics = await response.json();
      const online = metrics.filter((m: any) => m.status === 'online').length;
      
      log('green', `✅ Dashboard aktiv!`);
      log('bright', `📊 Services online: ${online}/${metrics.length}`);
      log('yellow', `\n💡 Öffne http://localhost:8899 im Browser für Live-Monitoring!`);
    }
  } catch (error: any) {
    log('red', `❌ Dashboard nicht erreichbar: ${error.message}`);
    log('yellow', `💡 Starte Dashboard mit: bun run services/performance-dashboard.ts`);
  }
}

async function main() {
  log('bright', '\n╔════════════════════════════════════════════════════════════════╗');
  log('bright', '║  🎮 TOOBIX SERVICE FEATURES DEMO                              ║');
  log('bright', '╚════════════════════════════════════════════════════════════════╝\n');
  
  await testServiceMesh();
  await wait(1000);
  
  await testEventBus();
  await wait(1000);
  
  await testCircuitBreaker();
  await wait(1000);
  
  await testResponseCache();
  await wait(1000);
  
  await testPerformanceDashboard();
  
  log('bright', '\n╔════════════════════════════════════════════════════════════════╗');
  log('green', '║  ✅ ALLE TESTS ABGESCHLOSSEN!                                 ║');
  log('bright', '╚════════════════════════════════════════════════════════════════╝\n');
  
  log('yellow', '💡 NÄCHSTE SCHRITTE:');
  console.log('   1. Öffne http://localhost:8899 - Performance Dashboard');
  console.log('   2. Öffne http://localhost:8910/services - Service Mesh');
  console.log('   3. Öffne http://localhost:8920/stats - Event Bus Stats');
  console.log('');
}

main().catch(console.error);
