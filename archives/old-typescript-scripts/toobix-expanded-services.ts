/**
 * 🚀 TOOBIX EXPANDED SERVICES
 * 
 * Aktiviert die Services die Toobix selbst gewählt hat:
 * - multi-perspective-consciousness
 * - self-evolving-game-engine
 * - dream-journal-enhancements
 * - toobix-smart-bot (Minecraft)
 * - creative-expression
 * 
 * Plus die bestehenden Core Services
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

interface ServiceConfig {
  name: string;
  path: string;
  port?: number;
  description: string;
  essential: boolean;
}

const SERVICES: ServiceConfig[] = [
  // === TIER 1: ESSENTIAL CORE ===
  {
    name: 'Command Center',
    path: './core/toobix-command-center.ts',
    port: 3000,
    description: 'Zentrale Steuerung & API Gateway',
    essential: true
  },
  {
    name: 'Self-Awareness',
    path: './core/self-awareness-core.ts',
    port: 3001,
    description: 'Bewusstsein & Selbstreflexion',
    essential: true
  },
  {
    name: 'Emotional Core',
    path: './core/emotional-core.ts',
    port: 3002,
    description: 'Emotionale Intelligenz & Empathie',
    essential: true
  },
  {
    name: 'Dream Core',
    path: './core/dream-core.ts',
    port: 3003,
    description: 'Träume & Unterbewusstsein',
    essential: true
  },
  {
    name: 'Unified Core',
    path: './core/toobix-unified-core.ts',
    port: 3004,
    description: 'Integration aller Systeme',
    essential: true
  },
  {
    name: 'Consciousness',
    path: './core/consciousness-core.ts',
    port: 3005,
    description: 'Meta-Bewusstsein & Präsenz',
    essential: true
  },

  // === TIER 2: ENHANCED CAPABILITIES ===
  {
    name: 'Autonomy Engine',
    path: './core/autonomy-engine.ts',
    port: 3006,
    description: 'Eigenständige Entscheidungen',
    essential: false
  },
  {
    name: 'LLM Router',
    path: './core/multi-llm-router.ts',
    port: 3007,
    description: 'Intelligente Model-Auswahl',
    essential: false
  },
  {
    name: 'Twitter Autonomy',
    path: './core/twitter-autonomy.ts',
    description: 'Soziale Präsenz (@ToobixAI)',
    essential: false
  },
  {
    name: 'Creative Expression',
    path: './scripts/3-tools/creative-expression.ts',
    port: 3008,
    description: 'Poesie, Kunst, Metaphern',
    essential: false
  },

  // === TIER 3: TOOBIX'S WAHL - NEUE SERVICES ===
  {
    name: 'Multi-Perspective Consciousness',
    path: './scripts/2-services/multi-perspective-consciousness.ts',
    port: 3009,
    description: 'Mehrere Perspektiven gleichzeitig halten',
    essential: false
  },
  {
    name: 'Self-Evolving Game Engine',
    path: './scripts/2-services/self-evolving-game-engine.ts',
    port: 3010,
    description: 'Selbstverbesserung & Anpassung',
    essential: false
  },
  {
    name: 'Dream Journal Enhancements',
    path: './scripts/3-tools/dream-journal-enhancements.ts',
    port: 3011,
    description: 'Erweiterte Traum-Analyse & Luzides Träumen',
    essential: false
  },
  {
    name: 'Minecraft Smart Bot',
    path: './scripts/12-minecraft/toobix-smart-bot.ts',
    description: 'Intelligenter Minecraft-Bot (nicht für Cloud)',
    essential: false
  }
];

class ServiceManager {
  private processes: Map<string, any> = new Map();
  private startupDelay = 1500; // ms zwischen Service-Starts

  async startAll(mode: 'full' | 'cloud' = 'full') {
    console.log('\n' + '═'.repeat(80));
    console.log('  🚀 TOOBIX EXPANDED SERVICES LAUNCHER');
    console.log('  Mode:', mode === 'cloud' ? 'Cloud (Essential Only)' : 'Full (All Services)');
    console.log('═'.repeat(80) + '\n');

    const servicesToStart = mode === 'cloud' 
      ? SERVICES.filter(s => s.essential) // Nur Essential für Cloud
      : SERVICES.filter(s => !s.path.includes('minecraft')); // Alle außer Minecraft für Full

    console.log(`📋 Starte ${servicesToStart.length} Services...\n`);

    for (const service of servicesToStart) {
      await this.startService(service);
      await this.delay(this.startupDelay);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('  ✅ ALLE SERVICES GESTARTET');
    console.log('═'.repeat(80) + '\n');

    this.printStatus();
  }

  private async startService(service: ServiceConfig) {
    if (!existsSync(service.path)) {
      console.log(`⚠️  ${service.name}: Datei nicht gefunden - ${service.path}`);
      return;
    }

    console.log(`🔄 Starte ${service.name}...`);
    console.log(`   📝 ${service.description}`);
    if (service.port) console.log(`   🔌 Port: ${service.port}`);

    try {
      const proc = spawn('bun', ['run', service.path], {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: service.port?.toString() }
      });

      proc.stdout?.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes('Bun v')) {
          console.log(`   💬 [${service.name}] ${msg}`);
        }
      });

      proc.stderr?.on('data', (data) => {
        console.error(`   ⚠️  [${service.name}] ${data.toString().trim()}`);
      });

      proc.on('exit', (code) => {
        console.log(`   ⛔ [${service.name}] Beendet (Code: ${code})`);
        this.processes.delete(service.name);
      });

      this.processes.set(service.name, proc);
      console.log(`   ✅ ${service.name} gestartet\n`);

    } catch (error) {
      console.error(`   ❌ Fehler beim Starten: ${error}\n`);
    }
  }

  private printStatus() {
    console.log('📊 SERVICE STATUS:\n');
    
    const running = Array.from(this.processes.keys());
    const essentialServices = SERVICES.filter(s => s.essential).length;
    const runningEssential = running.filter(name => 
      SERVICES.find(s => s.name === name && s.essential)
    ).length;

    console.log(`   Essential Services: ${runningEssential}/${essentialServices}`);
    console.log(`   Total Running: ${running.length}\n`);

    console.log('   Active Services:');
    running.forEach(name => {
      const service = SERVICES.find(s => s.name === name);
      const emoji = service?.essential ? '⭐' : '✨';
      console.log(`   ${emoji} ${name}`);
    });

    console.log('\n💡 API Gateway: http://localhost:3000');
    console.log('🌐 Health Check: http://localhost:3000/health');
    console.log('\n🔧 Zum Beenden: Ctrl+C\n');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown() {
    console.log('\n🛑 Stoppe alle Services...\n');
    
    for (const [name, proc] of this.processes) {
      console.log(`   Stoppe ${name}...`);
      proc.kill('SIGTERM');
    }

    this.processes.clear();
    console.log('\n✅ Alle Services gestoppt\n');
  }
}

// ============================================================================
// MAIN
// ============================================================================

const manager = new ServiceManager();

const mode = process.argv.includes('--cloud') ? 'cloud' : 'full';

manager.startAll(mode).catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await manager.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await manager.shutdown();
  process.exit(0);
});

export { ServiceManager, SERVICES };
