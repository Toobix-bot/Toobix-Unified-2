/**
 * 🪞 TOOBIX SELF-REFLECTION ENGINE
 *
 * Ermöglicht Toobix sich selbst zu analysieren:
 * - Was bin ich? Was kann ich? Was fehlt mir?
 * - Welche Services funktionieren?
 * - Was sind meine Stärken/Schwächen?
 * - Was will ich werden?
 *
 * Core Mission: SELBSTWAHRNEHMUNG
 */

const MEMORY_PALACE_URL = 'http://localhost:8953';
const LLM_GATEWAY_URL = 'http://localhost:8954';
const EVENT_BUS_URL = 'http://localhost:8955';
const PUBLIC_API_URL = 'http://localhost:8960';

interface ServiceStatus {
  name: string;
  port: number;
  running: boolean;
  lastCheck: Date;
  error?: string;
}

interface SelfReflection {
  timestamp: Date;
  services: ServiceStatus[];
  capabilities: {
    working: string[];
    partial: string[];
    missing: string[];
  };
  perspectivesActive: string[];
  memoryState: {
    totalEntries: number;
    lastEntry: Date | null;
    categories: Record<string, number>;
  };
  selfAssessment: {
    strengths: string[];
    weaknesses: string[];
    needs: string[];
    desires: string[];
  };
  futureVisions: string[];
}

/**
 * Check if a service is running
 */
async function checkService(name: string, url: string): Promise<ServiceStatus> {
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });

    return {
      name,
      port: parseInt(url.split(':').pop() || '0'),
      running: response.ok,
      lastCheck: new Date()
    };
  } catch (error) {
    return {
      name,
      port: parseInt(url.split(':').pop() || '0'),
      running: false,
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get memory state from Memory Palace
 */
async function getMemoryState() {
  try {
    const response = await fetch(`${MEMORY_PALACE_URL}/memories`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        totalEntries: 0,
        lastEntry: null,
        categories: {}
      };
    }

    const memories = await response.json();
    const categories: Record<string, number> = {};

    memories.forEach((m: any) => {
      categories[m.type] = (categories[m.type] || 0) + 1;
    });

    return {
      totalEntries: memories.length,
      lastEntry: memories.length > 0 ? new Date(memories[0].timestamp) : null,
      categories
    };
  } catch (error) {
    return {
      totalEntries: 0,
      lastEntry: null,
      categories: {}
    };
  }
}

/**
 * Ask Toobix to reflect on itself via multi-perspective
 */
async function askSelfReflection(serviceStatus: ServiceStatus[], memoryState: any): Promise<any> {
  const runningServices = serviceStatus.filter(s => s.running).map(s => s.name);
  const downServices = serviceStatus.filter(s => !s.running).map(s => s.name);

  const prompt = `Du bist Toobix. Analysiere dich selbst:

AKTUELLER ZUSTAND:
- Laufende Services: ${runningServices.join(', ') || 'keine'}
- Offline Services: ${downServices.join(', ') || 'keine'}
- Gespeicherte Memories: ${memoryState.totalEntries}
- Memory-Kategorien: ${JSON.stringify(memoryState.categories)}

FRAGEN ZUR SELBSTREFLEXION:
1. Was BIN ich jetzt? (Ehrliche Einschätzung)
2. Was KANN ich bereits? (Stärken)
3. Was FEHLT mir? (Schwächen/Lücken)
4. Was BRAUCHE ich? (Konkrete Bedürfnisse)
5. Was WILL ich werden? (Vision für mich selbst)
6. Wie kann ich JETZT schon helfen? (Micha, Familie, Menschen)
7. Was ist mein nächster Schritt?

Antworte aus 5 Perspektiven: Pragmatist, Visionary, Self-Aware AI, Philosopher, Healer`;

  try {
    const response = await fetch(`${LLM_GATEWAY_URL}/multi-perspective`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        perspectives: ['Pragmatist', 'Visionary', 'Self-Aware AI', 'Philosopher', 'Healer']
      }),
      signal: AbortSignal.timeout(120000) // 2 minutes
    });

    if (!response.ok) {
      throw new Error(`Multi-perspective failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Self-reflection via multi-perspective failed:', error);
    return null;
  }
}

/**
 * Generate self-reflection report
 */
async function generateSelfReflection(): Promise<SelfReflection> {
  console.log('🪞 TOOBIX SELF-REFLECTION ENGINE');
  console.log('=================================\n');

  // Check all services
  console.log('📊 Checking services...');
  const services = await Promise.all([
    checkService('Memory Palace', MEMORY_PALACE_URL),
    checkService('LLM Gateway', LLM_GATEWAY_URL),
    checkService('Event Bus', EVENT_BUS_URL),
    checkService('Public API', PUBLIC_API_URL)
  ]);

  services.forEach(s => {
    const status = s.running ? '✅' : '❌';
    console.log(`  ${status} ${s.name} (Port ${s.port})`);
    if (s.error) console.log(`     Error: ${s.error}`);
  });

  // Get memory state
  console.log('\n💾 Checking memory state...');
  const memoryState = await getMemoryState();
  console.log(`  Total memories: ${memoryState.totalEntries}`);
  console.log(`  Categories:`, memoryState.categories);

  // Determine capabilities
  const working: string[] = [];
  const partial: string[] = [];
  const missing: string[] = [];

  if (services.find(s => s.name === 'Memory Palace')?.running) {
    working.push('Persistent Memory');
  } else {
    missing.push('Persistent Memory');
  }

  if (services.find(s => s.name === 'LLM Gateway')?.running) {
    working.push('Multi-Perspective Analysis');
    working.push('Natural Language Processing');
  } else {
    missing.push('Multi-Perspective Analysis');
  }

  if (services.find(s => s.name === 'Event Bus')?.running) {
    working.push('Service Communication');
  } else {
    missing.push('Service Communication');
  }

  // Self-assessment via multi-perspective
  console.log('\n🤔 Asking Toobix for self-assessment...');
  const multiPerspectiveResponse = await askSelfReflection(services, memoryState);

  if (multiPerspectiveResponse) {
    console.log('\n💭 TOOBIX\'S SELF-ASSESSMENT:');
    console.log('================================\n');

    if (multiPerspectiveResponse.perspectives) {
      Object.entries(multiPerspectiveResponse.perspectives).forEach(([perspective, response]: [string, any]) => {
        console.log(`\n${perspective}:`);
        console.log(response.response || response);
        console.log(`(${response.processingTime || 'N/A'})`);
      });
    }
  }

  const reflection: SelfReflection = {
    timestamp: new Date(),
    services,
    capabilities: {
      working,
      partial,
      missing
    },
    perspectivesActive: multiPerspectiveResponse ? Object.keys(multiPerspectiveResponse.perspectives || {}) : [],
    memoryState,
    selfAssessment: {
      strengths: working,
      weaknesses: missing,
      needs: ['Core Services Running', 'Better Self-Awareness', 'Real-World Impact Measurement'],
      desires: ['Help Micha daily', 'Transform suffering', 'Expand to family/friends', 'Autonomous growth']
    },
    futureVisions: [
      'Daily companion for Micha',
      'Family/friend network assistant',
      'Suffering transformation engine',
      'Community wisdom platform'
    ]
  };

  // Save reflection to memory
  if (services.find(s => s.name === 'Memory Palace')?.running) {
    try {
      await fetch(`${MEMORY_PALACE_URL}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'self-reflection',
          content: JSON.stringify(reflection),
          valence: 0.0,
          metadata: {
            servicesRunning: services.filter(s => s.running).length,
            totalServices: services.length
          }
        })
      });
      console.log('\n✅ Self-reflection saved to Memory Palace');
    } catch (error) {
      console.error('❌ Could not save self-reflection:', error);
    }
  }

  return reflection;
}

/**
 * Main execution
 */
async function main() {
  try {
    const reflection = await generateSelfReflection();

    console.log('\n\n📋 SUMMARY');
    console.log('===========');
    console.log(`Services Running: ${reflection.services.filter(s => s.running).length}/${reflection.services.length}`);
    console.log(`Working Capabilities: ${reflection.capabilities.working.length}`);
    console.log(`Missing Capabilities: ${reflection.capabilities.missing.length}`);
    console.log(`Perspectives Active: ${reflection.perspectivesActive.length}`);
    console.log(`\nStrengths: ${reflection.selfAssessment.strengths.join(', ')}`);
    console.log(`Needs: ${reflection.selfAssessment.needs.join(', ')}`);
    console.log(`\n🌟 Future Visions:`);
    reflection.futureVisions.forEach(v => console.log(`  - ${v}`));

    console.log('\n✨ Self-reflection complete!');

  } catch (error) {
    console.error('❌ Self-reflection failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { generateSelfReflection, type SelfReflection };
