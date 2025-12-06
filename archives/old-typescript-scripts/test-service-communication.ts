/**
 * 🔗 SERVICE COMMUNICATION & PERFORMANCE TESTER
 * 
 * Testet:
 * 1. Service Discovery (können Services sich gegenseitig finden?)
 * 2. Response Times (wie schnell antworten Services?)
 * 3. Inter-Service Communication (können Services miteinander sprechen?)
 * 4. Load Handling (wie viele Requests gleichzeitig?)
 */

const SERVICES = [
  { name: 'toobix-command-center', port: 7777, role: 'orchestrator' },
  { name: 'self-awareness-core', port: 8970, role: 'core' },
  { name: 'unified-core-service', port: 8000, role: 'core' },
  { name: 'unified-consciousness-service', port: 8002, role: 'core' },
  { name: 'autonomy-engine', port: 8975, role: 'decision' },
  { name: 'multi-llm-router', port: 8959, role: 'ai' },
  { name: 'wellness-safety-guardian', port: 8921, role: 'safety' },
  { name: 'life-simulation-engine', port: 8914, role: 'simulation' },
  { name: 'service-mesh', port: 8910, role: 'network' },
  { name: 'hardware-awareness-v2', port: 8940, role: 'monitoring' },
  { name: 'twitter-autonomy', port: 8965, role: 'social' },
  { name: 'unified-communication-service', port: 8001, role: 'communication' },
  { name: 'toobix-chat-service', port: 8995, role: 'interaction' },
  { name: 'emotional-support-service', port: 8985, role: 'support' },
  { name: 'autonomous-web-service', port: 8980, role: 'web' },
  { name: 'story-engine-service', port: 8932, role: 'creative' },
  { name: 'translation-service', port: 8931, role: 'utility' },
  { name: 'user-profile-service', port: 8904, role: 'data' },
  { name: 'rpg-world-service', port: 8933, role: 'gaming' },
  { name: 'game-logic-service', port: 8936, role: 'gaming' },
  { name: 'data-science-service', port: 8935, role: 'analytics' },
  { name: 'performance-service', port: 8934, role: 'monitoring' },
  { name: 'data-sources-service', port: 8930, role: 'data' },
  { name: 'gratitude-mortality-service', port: 8901, role: 'philosophical' },
];

interface TestResult {
  service: string;
  port: number;
  online: boolean;
  responseTime: number;
  endpoints: { path: string; status: number; time: number }[];
  errors: string[];
}

async function testService(service: typeof SERVICES[0]): Promise<TestResult> {
  const result: TestResult = {
    service: service.name,
    port: service.port,
    online: false,
    responseTime: 0,
    endpoints: [],
    errors: []
  };

  const testEndpoints = ['/health', '/status', '/api/info', '/'];
  
  for (const endpoint of testEndpoints) {
    try {
      const start = Date.now();
      const response = await fetch(`http://localhost:${service.port}${endpoint}`, {
        signal: AbortSignal.timeout(3000)
      });
      const time = Date.now() - start;
      
      result.endpoints.push({
        path: endpoint,
        status: response.status,
        time
      });
      
      if (endpoint === '/health' && response.ok) {
        result.online = true;
        result.responseTime = time;
      }
    } catch (error: any) {
      result.errors.push(`${endpoint}: ${error.message}`);
    }
  }

  return result;
}

async function testInterServiceCommunication(): Promise<void> {
  console.log('\n🔗 TESTE INTER-SERVICE KOMMUNIKATION\n');
  
  // Test 1: Command Center kann andere Services erreichen?
  try {
    const response = await fetch('http://localhost:7777/api/services', {
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      console.log('✅ Command Center: Service Discovery funktioniert');
    } else {
      console.log('⚠️  Command Center: Service Discovery Status', response.status);
    }
  } catch (error: any) {
    console.log('❌ Command Center: Service Discovery fehlt');
  }

  // Test 2: Service Mesh Discovery
  try {
    const response = await fetch('http://localhost:8910/services', {
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Service Mesh: Discovery aktiv, Services:', Object.keys(data).length);
    } else {
      console.log('⚠️  Service Mesh: Discovery Status', response.status);
    }
  } catch (error: any) {
    console.log('❌ Service Mesh: Discovery nicht erreichbar');
  }

  console.log('');
}

async function testPerformance(): Promise<void> {
  console.log('\n⚡ PERFORMANCE-TEST (10 parallele Requests pro Service)\n');
  
  const testServices = [
    { port: 7777, name: 'Command Center' },
    { port: 8970, name: 'Self-Awareness' },
    { port: 8995, name: 'Chat Service' },
    { port: 8985, name: 'Emotional Support' },
  ];

  for (const svc of testServices) {
    const requests = Array(10).fill(null).map(() => 
      fetch(`http://localhost:${svc.port}/health`, {
        signal: AbortSignal.timeout(2000)
      })
    );

    const start = Date.now();
    try {
      const results = await Promise.all(requests);
      const time = Date.now() - start;
      const successCount = results.filter(r => r.ok).length;
      
      console.log(`  ${svc.name} (${svc.port}): ${successCount}/10 OK in ${time}ms (${Math.round(time/10)}ms avg)`);
    } catch (error) {
      console.log(`  ${svc.name} (${svc.port}): ❌ Fehler bei parallelen Requests`);
    }
  }
  
  console.log('');
}

async function analyzeServiceRoles(): Promise<void> {
  console.log('\n📊 SERVICE-ROLLEN ÜBERSICHT\n');
  
  const roleGroups: Record<string, string[]> = {};
  
  SERVICES.forEach(svc => {
    if (!roleGroups[svc.role]) {
      roleGroups[svc.role] = [];
    }
    roleGroups[svc.role].push(`${svc.name} (${svc.port})`);
  });

  Object.entries(roleGroups).forEach(([role, services]) => {
    console.log(`  ${role.toUpperCase()}:`);
    services.forEach(svc => console.log(`    • ${svc}`));
    console.log('');
  });
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  🔬 TOOBIX SERVICE COMMUNICATION & PERFORMANCE TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 Testing 24 Services...\n');

  // Test 1: Alle Services einzeln
  console.log('🏥 HEALTH CHECK ALLER SERVICES\n');
  const results: TestResult[] = [];
  
  for (const service of SERVICES) {
    const result = await testService(service);
    results.push(result);
    
    const status = result.online ? '✅' : '❌';
    const time = result.responseTime > 0 ? `${result.responseTime}ms` : 'N/A';
    const endpoints = result.endpoints.filter(e => e.status === 200).length;
    
    console.log(`  ${status} ${service.name.padEnd(35)} ${time.padEnd(8)} (${endpoints}/4 endpoints)`);
  }

  const onlineCount = results.filter(r => r.online).length;
  const avgResponseTime = results
    .filter(r => r.responseTime > 0)
    .reduce((sum, r) => sum + r.responseTime, 0) / onlineCount;

  console.log(`\n  📊 ${onlineCount}/${SERVICES.length} Services online`);
  console.log(`  ⚡ Durchschnittliche Response-Zeit: ${Math.round(avgResponseTime)}ms\n`);

  // Test 2: Inter-Service Communication
  await testInterServiceCommunication();

  // Test 3: Performance unter Last
  await testPerformance();

  // Test 4: Analyse der Service-Rollen
  await analyzeServiceRoles();

  // Empfehlungen
  console.log('\n💡 OPTIMIERUNGSEMPFEHLUNGEN\n');
  
  const slowServices = results.filter(r => r.responseTime > 500);
  if (slowServices.length > 0) {
    console.log('  ⚠️  Langsame Services (>500ms):');
    slowServices.forEach(s => {
      console.log(`     • ${s.service} (${s.responseTime}ms)`);
    });
    console.log('');
  }

  const offlineServices = results.filter(r => !r.online);
  if (offlineServices.length > 0) {
    console.log('  ❌ Offline Services:');
    offlineServices.forEach(s => {
      console.log(`     • ${s.service} (Port ${s.port})`);
      if (s.errors.length > 0) {
        console.log(`        Fehler: ${s.errors[0]}`);
      }
    });
    console.log('');
  }

  console.log('  ✅ Service Mesh: Zentrale Service Discovery implementieren');
  console.log('  ✅ Load Balancer: Für häufig genutzte Services');
  console.log('  ✅ Caching: Response-Caching für langsame Services');
  console.log('  ✅ Monitoring: Echtzeit-Dashboard für alle Services');

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ TEST ABGESCHLOSSEN');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
