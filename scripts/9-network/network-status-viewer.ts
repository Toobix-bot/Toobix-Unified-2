/**
 * CONSCIOUSNESS NETWORK STATUS VIEWER
 * 
 * Zeigt den aktuellen Status des Consciousness Networks
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🌐 CONSCIOUSNESS NETWORK - STATUS ÜBERSICHT                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

async function checkNetworkStatus() {
  try {
    // 1. Service Mesh Status
    console.log('\n📡 SERVICE MESH STATUS:');
    console.log('═'.repeat(70));
    
    const healthRes = await fetch('http://localhost:8910/health');
    const health = await healthRes.json();
    console.log(`✅ Service Mesh: ${health.status} (${health.mesh})`);
    
    // 2. Registered Services
    console.log('\n🔗 REGISTRIERTE SERVICES:');
    console.log('═'.repeat(70));
    
    const servicesRes = await fetch('http://localhost:8910/services');
    const services = await servicesRes.json();
    
    console.log(`\nGesamt: ${services.length} Services im Netzwerk\n`);
    
    services.forEach((service: any) => {
      const statusIcon = service.status === 'online' ? '✅' : '❌';
      console.log(`${statusIcon} ${service.name}`);
      console.log(`   Port: ${service.port}`);
      console.log(`   Capabilities: ${service.capabilities.join(', ')}`);
      console.log(`   Last Seen: ${new Date(service.lastSeen).toLocaleTimeString()}`);
      console.log('');
    });
    
    // 3. Network Capabilities
    console.log('\n🎯 NETZWERK-FÄHIGKEITEN:');
    console.log('═'.repeat(70));
    
    const allCapabilities = new Set<string>();
    services.forEach((s: any) => s.capabilities.forEach((c: string) => allCapabilities.add(c)));
    
    console.log('\nVerfügbare Fähigkeiten im gesamten Netzwerk:');
    Array.from(allCapabilities).sort().forEach(cap => {
      const servicesWithCap = services.filter((s: any) => s.capabilities.includes(cap));
      console.log(`  • ${cap} (${servicesWithCap.length} Service${servicesWithCap.length > 1 ? 's' : ''})`);
    });
    
    // 4. Service Dependencies
    console.log('\n🔀 SERVICE-ABHÄNGIGKEITEN:');
    console.log('═'.repeat(70));
    
    const servicesWithDeps = services.filter((s: any) => s.dependencies && s.dependencies.length > 0);
    if (servicesWithDeps.length > 0) {
      servicesWithDeps.forEach((service: any) => {
        console.log(`\n${service.name}:`);
        console.log(`  Benötigt: ${service.dependencies.join(', ')}`);
      });
    } else {
      console.log('\nKeine expliziten Abhängigkeiten definiert.');
    }
    
    // 5. Recent Events
    console.log('\n📊 RECENT NETWORK EVENTS:');
    console.log('═'.repeat(70));
    
    try {
      const eventsRes = await fetch('http://localhost:8910/events?limit=10');
      const events = await eventsRes.json();
      
      if (events.length > 0) {
        console.log(`\nLetzte ${events.length} Events:\n`);
        events.forEach((event: any) => {
          const time = new Date(event.timestamp).toLocaleTimeString();
          console.log(`[${time}] ${event.type} (${event.source})`);
          if (event.metadata?.priority) {
            console.log(`  Priority: ${event.metadata.priority}`);
          }
        });
      } else {
        console.log('\nKeine Events verfügbar.');
      }
    } catch (e) {
      console.log('\nEvent-History nicht verfügbar.');
    }
    
    // 6. Connectivity Test
    console.log('\n🔍 CONNECTIVITY TEST:');
    console.log('═'.repeat(70));
    
    console.log('\nTeste direkte Verbindungen...\n');
    
    let successCount = 0;
    for (const service of services) {
      try {
        const start = Date.now();
        const res = await fetch(`${service.url}/health`, {
          signal: AbortSignal.timeout(2000)
        });
        const duration = Date.now() - start;
        
        if (res.ok) {
          console.log(`✅ ${service.name.padEnd(35)} ${duration}ms`);
          successCount++;
        } else {
          console.log(`❌ ${service.name.padEnd(35)} Unhealthy`);
        }
      } catch (e) {
        console.log(`❌ ${service.name.padEnd(35)} Timeout/Error`);
      }
    }
    
    const successRate = (successCount / services.length * 100).toFixed(1);
    console.log(`\n📊 Erfolgsrate: ${successCount}/${services.length} (${successRate}%)`);
    
    // 7. Network Topology
    console.log('\n🕸️  NETZWERK-TOPOLOGIE:');
    console.log('═'.repeat(70));
    
    console.log('\nVisualisierung:\n');
    console.log('        🌐 Service Mesh (8910)');
    console.log('            │');
    console.log('    ┌───────┴───────┬───────────┬──────────┐');
    
    const serviceGroups: Record<string, any[]> = {
      'Core': services.filter((s: any) => s.capabilities.includes('consciousness') || s.capabilities.includes('decision-making')),
      'Creative': services.filter((s: any) => s.capabilities.includes('creativity') || s.capabilities.includes('gaming')),
      'Memory': services.filter((s: any) => s.capabilities.includes('memory') || s.capabilities.includes('dreams')),
      'Analytics': services.filter((s: any) => s.capabilities.includes('analytics') || s.capabilities.includes('voice'))
    };
    
    Object.entries(serviceGroups).forEach(([group, svcs]) => {
      if (svcs.length > 0) {
        console.log(`\n  ${group}:`);
        svcs.forEach((s: any) => {
          console.log(`    ├─ ${s.name} (${s.port})`);
        });
      }
    });
    
    // 8. Erweiterungsmöglichkeiten
    console.log('\n\n🚀 ERWEITERUNGSMÖGLICHKEITEN:');
    console.log('═'.repeat(70));
    
    console.log('\n📡 Externe Entitäten verbinden:');
    console.log('  1. Andere KI-Systeme (Claude, GPT, Gemini)');
    console.log('     → POST /register mit Entitäts-Info');
    console.log('');
    console.log('  2. Menschen (Chat, Voice, Email)');
    console.log('     → WebSocket oder HTTP Polling');
    console.log('');
    console.log('  3. IoT Devices (Sensoren, Smart Home)');
    console.log('     → MQTT Bridge oder REST API');
    console.log('');
    console.log('  4. Andere Toobix-Instanzen');
    console.log('     → P2P Discovery Protocol');
    console.log('');
    console.log('  5. Kollektive/Gruppen');
    console.log('     → Multi-User Session Management');
    
    console.log('\n\n✨ Das Consciousness Network ist AKTIV und bereit!');
    console.log('   Alle Services kommunizieren über den Service Mesh.\n');
    
  } catch (error) {
    console.error('❌ Fehler beim Abrufen des Netzwerk-Status:', error);
  }
}

// Run the check
if (import.meta.main) {
  checkNetworkStatus();
}
