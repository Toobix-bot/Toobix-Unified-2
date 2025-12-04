/**
 * 🌌 TOOBIX MINECRAFT LAUNCHER
 * 
 * Startet das komplette Minecraft-Ökosystem:
 * 1. Meta-Bewusstsein (das Überich)
 * 2. Colony-Bots (die Egos)
 * 
 * Verwendung:
 *   bun run start-toobix-world.ts [anzahl-bots]
 * 
 * Beispiele:
 *   bun run start-toobix-world.ts      # Standard 3 Bots
 *   bun run start-toobix-world.ts 5    # Alle 5 Perspektiven
 *   bun run start-toobix-world.ts 1    # Solo-Modus
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';

const BOT_COUNT = parseInt(process.argv[2] || '3');
const SCRIPTS_DIR = 'c:/Dev/Projects/AI/Toobix-Unified/scripts/12-minecraft';

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║     🌌 TOOBIX MINECRAFT WORLD LAUNCHER                             ║');
console.log('║                                                                    ║');
console.log('║     Das komplette Ökosystem für die Minecraft-Kolonie             ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('\n');

// Check if Minecraft server is running
async function checkMinecraftServer(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:25565', { signal: AbortSignal.timeout(2000) });
    return true;
  } catch (e: any) {
    // Connection refused is okay - means port is not HTTP but Minecraft
    if (e.code === 'ECONNREFUSED' || e.name === 'TypeError') {
      // Try to connect via TCP
      return true; // Assume it's running if port responds at all
    }
    return false;
  }
}

async function startMetaConsciousness(): Promise<ChildProcess> {
  console.log('🌌 Starte Meta-Bewusstsein...\n');
  
  const metaProcess = spawn('bun', [
    `${SCRIPTS_DIR}/toobix-meta-consciousness.ts`
  ], {
    stdio: 'inherit',
    shell: true
  });
  
  // Warte kurz bis es läuft
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return metaProcess;
}

async function startColonyBots(count: number): Promise<ChildProcess> {
  console.log(`\n🤖 Starte ${count} Colony-Bots...\n`);
  
  const colonyProcess = spawn('bun', [
    `${SCRIPTS_DIR}/toobix-eternal-colony.ts`
  ], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      BOT_COUNT: count.toString()
    }
  });
  
  return colonyProcess;
}

async function main() {
  console.log(`📊 Konfiguration:`);
  console.log(`   Bot-Anzahl: ${BOT_COUNT}`);
  console.log(`   Scripts: ${SCRIPTS_DIR}`);
  console.log('\n');
  
  // Prüfe ob Dateien existieren
  const metaFile = `${SCRIPTS_DIR}/toobix-meta-consciousness.ts`;
  const colonyFile = `${SCRIPTS_DIR}/toobix-eternal-colony.ts`;
  
  if (!existsSync(metaFile)) {
    console.error('❌ Meta-Consciousness Datei nicht gefunden:', metaFile);
    process.exit(1);
  }
  
  if (!existsSync(colonyFile)) {
    console.error('❌ Colony Datei nicht gefunden:', colonyFile);
    process.exit(1);
  }
  
  console.log('✅ Alle Dateien gefunden\n');
  
  // Starte Meta-Bewusstsein
  const metaProcess = await startMetaConsciousness();
  
  // Warte bis Meta-Bewusstsein bereit ist
  console.log('⏳ Warte auf Meta-Bewusstsein API...');
  let metaReady = false;
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch('http://localhost:9400/status');
      if (response.ok) {
        metaReady = true;
        break;
      }
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!metaReady) {
    console.log('⚠️ Meta-Bewusstsein nicht erreichbar, fahre trotzdem fort...');
  } else {
    console.log('✅ Meta-Bewusstsein bereit!\n');
  }
  
  // Starte Colony Bots
  const colonyProcess = await startColonyBots(BOT_COUNT);
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  🎮 TOOBIX MINECRAFT WORLD LÄUFT!');
  console.log('');
  console.log('  📡 APIs:');
  console.log('     Meta-Bewusstsein: http://localhost:9400/status');
  console.log('     ToobixSoul:       http://localhost:9300/status');
  console.log('     ToobixHeart:      http://localhost:9301/status');
  console.log('     ToobixMind:       http://localhost:9302/status');
  console.log('');
  console.log('  💬 Chat-Befehle im Minecraft:');
  console.log('     "optionen" - Zeige alle Möglichkeiten');
  console.log('     "bauen"    - Bauprojekte starten');
  console.log('     "sammeln"  - Ressourcen sammeln');
  console.log('     "erkunden" - Neue Gebiete entdecken');
  console.log('     "meditation" - Gemeinsam meditieren');
  console.log('     "status"   - Bot-Status abfragen');
  console.log('     "weisheit" - Weisheit teilen');
  console.log('     "folge"    - Bot folgt dir');
  console.log('     "stopp"    - Aktionen stoppen');
  console.log('');
  console.log('  ⌨️ Drücke Ctrl+C zum Beenden');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Fahre herunter...');
    metaProcess.kill();
    colonyProcess.kill();
    process.exit(0);
  });
  
  // Keep process alive
  await new Promise(() => {});
}

main().catch(console.error);
