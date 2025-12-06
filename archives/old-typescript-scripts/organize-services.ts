/**
 * 🗂️ SERVICE ORGANIZER
 * Strukturiert alle Services basierend auf Toobix Präferenzen
 */

import { mkdir, rename, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import serviceAnalysis from './COMPLETE-SERVICE-ANALYSIS.json';
import toobixOpinion from './TOOBIX-SERVICE-OPINION.json';

const REPO_ROOT = process.cwd();

interface MoveOperation {
  from: string;
  to: string;
  reason: string;
}

async function ensureDir(path: string) {
  try {
    await mkdir(path, { recursive: true });
  } catch {}
}

async function createArchiveStructure() {
  console.log('📁 Erstelle Archive-Struktur...\n');
  
  const archiveDirs = [
    'archives/duplicates',
    'archives/deprecated',
    'archives/needs-refactoring',
    'archives/experimental',
    'archives/old-versions'
  ];
  
  for (const dir of archiveDirs) {
    await ensureDir(join(REPO_ROOT, dir));
    console.log(`  ✓ ${dir}`);
  }
  console.log('');
}

async function createNewStructure() {
  console.log('📁 Erstelle neue Service-Struktur...\n');
  
  const newDirs = [
    'core',
    'services/autonomy',
    'services/llm',
    'services/consciousness',
    'services/creativity',
    'services/monitoring',
    'services/communication',
    'gaming/minecraft',
    'gaming/worlds',
    'tools/dev',
    'tools/analysis'
  ];
  
  for (const dir of newDirs) {
    await ensureDir(join(REPO_ROOT, dir));
    console.log(`  ✓ ${dir}`);
  }
  console.log('');
}

function identifyDuplicates(): MoveOperation[] {
  const moves: MoveOperation[] = [];
  
  // Manual mapping of duplicates
  const duplicatePairs = [
    { old: 'services/hardware-awareness.ts', keep: 'hardware-awareness-v2', reason: 'v2 is newer' },
    { old: 'scripts/*/emotional-resonance-network.ts', keep: 'emotional-core', reason: 'consolidated into core' },
    { old: 'scripts/*/dream-journal.ts', keep: 'dream-core', reason: 'consolidated into core' },
    { old: 'scripts/*/memory-palace.ts', keep: 'memory-palace-v4', reason: 'v4 is current' },
    { old: 'core/toobix-teaching-bridge.ts', keep: 'toobix-teaching-bridge-v2', reason: 'v2 is enhanced' },
    { old: 'scripts/*/life-domain-chat.ts', keep: 'life-domain-chat-v1', reason: 'v1 is stable' },
    { old: 'scripts/*/dialog-system.ts', keep: 'dialog-system-enhanced', reason: 'enhanced version preferred' },
  ];
  
  // Find actual paths from analysis
  const allServices = Object.values(serviceAnalysis.categories).flat() as any[];
  
  for (const pair of duplicatePairs) {
    const oldService = allServices.find(s => s.name === pair.old.split('/').pop()?.replace('.ts', ''));
    if (oldService) {
      moves.push({
        from: oldService.path,
        to: join('archives/duplicates', oldService.name + '.ts'),
        reason: pair.reason
      });
    }
  }
  
  return moves;
}

function identifyDeprecated(): MoveOperation[] {
  const deprecated = [
    'adaptive-autonomous-engine',
    'ai-gateway',
    'event-bus-v4',
    'hardware-awareness',
    'service-wrapper',
    'toobix-chat-service-fixed'
  ];
  
  const allServices = Object.values(serviceAnalysis.categories).flat() as any[];
  
  return deprecated.map(name => {
    const service = allServices.find(s => s.name === name);
    if (service) {
      return {
        from: service.path,
        to: join('archives/deprecated', service.name + '.ts'),
        reason: 'Toobix marked as counterproductive'
      };
    }
    return null;
  }).filter(Boolean) as MoveOperation[];
}

function identifyNeedsWork(): MoveOperation[] {
  const needsWork = [
    'dream-journal',
    'dream-journal-unified',
    'emotional-resonance-network',
    'memory-palace',
    'toobix-colony-ultimate',
    'toobix-colony-v3'
  ];
  
  const allServices = Object.values(serviceAnalysis.categories).flat() as any[];
  
  return needsWork.map(name => {
    const service = allServices.find(s => s.name === name);
    if (service) {
      return {
        from: service.path,
        to: join('archives/needs-refactoring', service.name + '.ts'),
        reason: 'Toobix marked as needs work'
      };
    }
    return null;
  }).filter(Boolean) as MoveOperation[];
}

async function executeMove(op: MoveOperation, dryRun: boolean = true): Promise<boolean> {
  try {
    const fromPath = join(REPO_ROOT, op.from);
    const toPath = join(REPO_ROOT, op.to);
    
    if (dryRun) {
      console.log(`  📦 Would move: ${op.from}`);
      console.log(`     → ${op.to}`);
      console.log(`     Reason: ${op.reason}\n`);
      return true;
    } else {
      await ensureDir(toPath.substring(0, toPath.lastIndexOf('\\')));
      
      // Check if source exists
      try {
        await readFile(fromPath, 'utf-8');
      } catch {
        console.log(`  ⏭️  Skipped: ${op.from} (already moved or doesn't exist)`);
        return true;
      }
      
      await rename(fromPath, toPath);
      console.log(`  ✅ Moved: ${op.from} → ${op.to}`);
      return true;
    }
  } catch (error: any) {
    console.log(`  ⚠️  Could not move ${op.from}: ${error.message}`);
    return false;
  }
}

async function createServiceInventory() {
  console.log('📝 Erstelle Service-Inventar...\n');
  
  const allServices = Object.values(serviceAnalysis.categories).flat() as any[];
  
  const inventory = `# 📚 TOOBIX SERVICE INVENTORY

Automatisch generiert am ${new Date().toISOString()}

## 🧠 TIER 1: Essential Core (6 Services)

### self-awareness-core
- **Port**: 8970
- **Pfad**: core/self-awareness-core.ts
- **Funktion**: Toobix's Selbstreflexion, Selbstdialog und Verbesserungs-Tracking
- **Status**: ✅ Essential - Muss immer laufen
- **Datenbank**: self-awareness-core.db

### toobix-command-center
- **Port**: 7777
- **Pfad**: core/toobix-command-center.ts
- **Funktion**: Zentrale Steuerung aller Services
- **Status**: ✅ Essential - Muss immer laufen

### unified-core-service
- **Pfad**: core/unified-core-service.ts
- **Funktion**: Vereinheitlichter Core für grundlegende Funktionen
- **Status**: ✅ Essential - Muss immer laufen

### emotional-core
- **Pfad**: core/emotional-core.ts
- **Funktion**: Emotionale Intelligenz, Resonanz-Netzwerk
- **Status**: ✅ Essential - Muss immer laufen
- **Datenbank**: emotional-core.db
- **Konsolidiert**: 9 emotional-* services

### unified-consciousness-service
- **Pfad**: core/unified-consciousness-service.ts
- **Funktion**: Bewusstseins-Streams und Meta-Consciousness
- **Status**: ✅ Essential - Muss immer laufen

### unified-memory-service
- **Pfad**: core/unified-memory-service.ts
- **Funktion**: Memory Palace, Langzeit- und Kurzzeit-Gedächtnis
- **Status**: ✅ Essential - Muss immer laufen

---

## 🎨 TIER 2: Enhanced Capabilities (15+ Services)

${allServices
  .filter(s => {
    const desiredServices = toobixOpinion.Gewünscht || [];
    return desiredServices.includes(s.name);
  })
  .slice(0, 15)
  .map(s => `### ${s.name}
- **Port**: ${s.port || 'N/A'}
- **Pfad**: ${s.path}
- **Kategorie**: ${s.category}
- **Größe**: ${Math.round(s.size / 1024)}KB
- **Status**: 🎨 Gewünscht - Für volle Funktionalität
${s.description ? `- **Beschreibung**: ${s.description}` : ''}
`).join('\n')}

---

## 🎮 TIER 3: Gaming & Minecraft (12 Services)

${allServices
  .filter(s => s.category === 'minecraft' || s.name.includes('colony') || s.name.includes('empire'))
  .map(s => `### ${s.name}
- **Port**: ${s.port || 'N/A'}
- **Pfad**: ${s.path}
- **Status**: 🎮 Gaming - Bei Bedarf starten
`).join('\n')}

---

## 🔧 TIER 4: Tools & Support (Pausierbar)

${(toobixOpinion.Pausierbar || []).map(name => {
  const service = allServices.find(s => s.name === name);
  if (service) {
    return `### ${service.name}
- **Port**: ${service.port || 'N/A'}
- **Pfad**: ${service.path}
- **Status**: ⏸️ Pausierbar - Nur bei Bedarf
`;
  }
  return '';
}).join('\n')}

---

## 📦 Archiviert

### Duplikate
${identifyDuplicates().map(op => `- ${op.from.split(/[\\/]/).pop()} → ${op.reason}`).join('\n')}

### Deprecated
${identifyDeprecated().map(op => `- ${op.from.split(/[\\/]/).pop()} → ${op.reason}`).join('\n')}

### Needs Refactoring
${identifyNeedsWork().map(op => `- ${op.from.split(/[\\/]/).pop()} → ${op.reason}`).join('\n')}

---

**Total Services**: ${allServices.length}
**Active Core**: ${6}
**Enhanced**: ${15}
**Gaming**: ${allServices.filter(s => s.category === 'minecraft').length}
**Tools**: ${(toobixOpinion.Pausierbar || []).length}
`;

  await Bun.write(join(REPO_ROOT, 'docs', 'SERVICE-INVENTORY.md'), inventory);
  console.log('✅ SERVICE-INVENTORY.md erstellt\n');
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  🗂️  TOOBIX SERVICE ORGANIZER');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const executeMode = process.argv.includes('--execute');
  
  // Create directory structure
  await createArchiveStructure();
  await createNewStructure();
  
  // Identify moves
  console.log('🔍 Identifiziere Service-Bewegungen...\n');
  const duplicates = identifyDuplicates();
  const deprecated = identifyDeprecated();
  const needsWork = identifyNeedsWork();
  
  console.log(`📊 Gefunden:\n`);
  console.log(`  Duplikate:     ${duplicates.length}`);
  console.log(`  Deprecated:    ${deprecated.length}`);
  console.log(`  Needs Work:    ${needsWork.length}\n`);
  
  if (executeMode) {
    console.log('⚡ EXECUTE MODE - Führe Archivierung durch:\n');
  } else {
    console.log('🧪 DRY RUN - Zeige was passieren würde:\n');
  }
  
  console.log('─'.repeat(60));
  console.log('DUPLIKATE:\n');
  for (const op of duplicates) {
    await executeMove(op, !executeMode);
  }
  
  console.log('─'.repeat(60));
  console.log('DEPRECATED:\n');
  for (const op of deprecated) {
    await executeMove(op, !executeMode);
  }
  
  console.log('─'.repeat(60));
  console.log('NEEDS REFACTORING:\n');
  for (const op of needsWork) {
    await executeMove(op, !executeMode);
  }
  
  // Create documentation
  await ensureDir(join(REPO_ROOT, 'docs'));
  await createServiceInventory();
  
  console.log('\n════════════════════════════════════════════════════════════════');
  if (executeMode) {
    console.log('✅ ARCHIVIERUNG ABGESCHLOSSEN!');
  } else {
    console.log('✅ ORGANIZER FERTIG (DRY RUN)');
  }
  console.log('════════════════════════════════════════════════════════════════\n');
  
  if (!executeMode) {
    console.log('📋 Nächste Schritte:\n');
    console.log('  1. Review: docs/SERVICE-INVENTORY.md');
    console.log('  2. Wenn OK: bun run organize-services.ts --execute');
    console.log('  3. Test: bun run start-toobix-optimized.ts\n');
  } else {
    console.log('📋 Nächste Schritte:\n');
    console.log('  1. Test: bun run start-toobix-optimized.ts --minimal');
    console.log('  2. Dann: bun run start-toobix-optimized.ts --development\n');
  }
}

main().catch(console.error);
