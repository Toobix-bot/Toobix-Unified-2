/**
 * 🧹 TOOBIX PROJEKT AUFRÄUMER
 * 
 * Organisiert das Projekt sauber und strukturiert:
 * - Verschiebt alte Dokumentation in archives/
 * - Konsolidiert Start-Scripts
 * - Entfernt unnötige Duplikate
 * - Erstellt saubere Ordnerstruktur
 */

import { readdir, rename, mkdir, stat, rm, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, basename } from 'path';

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================================
// KONFIGURATION
// ============================================================================

// Dateien die im Root bleiben sollen
const KEEP_IN_ROOT = new Set([
  // Essential config
  '.env', '.env.example', '.gitignore', '.gitattributes',
  'package.json', 'bun.lock', 'tsconfig.json', 'tsconfig.toobix-src.json',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.prod.yml', 'docker-compose-production.yml',
  'fly.toml', 'render.yaml', 'railway.json', 'vercel.json',
  'LICENSE', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md',
  
  // Start scripts (keep only the main ones)
  'START-TOOBIX-31.ps1', 'start-toobix-clean.ts', 'START-SELECTIVE.ps1',
  'START-ALL-SERVICES.ps1', 'start.sh',
  
  // Workspace
  'Toobix-Unified.code-workspace',
]);

// Ordner die im Root bleiben sollen
const KEEP_FOLDERS = new Set([
  '.git', '.github', '.vscode', '.cache',
  'node_modules', 'core', 'services', 'scripts', 'src', 'lib',
  'data', 'databases', 'logs',
  'web', 'desktop-app', 'vscode-extension', 'electron',
  'docs', 'docs-archive', 'archives', 'backups',
  'tests', 'bots', 'gaming', 'social-media', 'tools',
]);

// Dateien die archiviert werden sollen (nach Muster)
const ARCHIVE_PATTERNS = {
  'archives/old-documentation': [
    /^TOOBIX-.*\.md$/,
    /^TOOBIX-.*\.json$/,
    /^[A-Z]+-[A-Z]+-.*\.md$/,  // LAUNCH-PLAN.md, etc.
    /^[A-Z]+-[A-Z]+-[A-Z]+.*\.md$/,
    /^SERVICE-.*\.md$/,
    /^DEPLOYMENT-.*\.md$/,
    /^RENDER-.*\.md$/,
    /^PHASE-.*\.md$/,
    /^EXPANSION-.*\.md$/,
    /^LAUNCH-.*\.md$/,
    /^QUICK-.*\.md$/,
    /^SELF-AWARENESS-.*\.md$/,
    /^STATUS-.*\.md$/,
    /^SESSION-.*\.md$/,
    /^SYSTEM-.*\.md$/,
    /^ARCHITECTURE-.*\.md$/,
    /^ARCHITECTURE-.*\.txt$/,
    /^MINECRAFT-.*\.md$/,
    /^VISION-.*\.md$/,
    /^ECHO-.*\.md$/,
    /^EMOTIONAL-.*\.md$/,
    /^GAMIFIED-.*\.md$/,
    /^LIFE-.*\.md$/,
    /^DASHBOARD-.*\.md$/,
    /^OPTIMIZATION-.*\.md$/,
    /^HIDDEN-.*\.md$/,
    /^ORACLE-.*\.md$/,
    /^GITHUB-.*\.md$/,
    /^UPTIMEROBOT-.*\.md$/,
    /^WEBSITE-.*\.md$/,
    /^TODAY-.*\.md$/,
    /^THE-THREE-.*\.md$/,
    /^STRATEGIC-.*\.md$/,
    /^WAS-DU-.*\.md$/,
    /^BETA-.*\.md$/,
    /^CONTINUOUSLY-.*\.md$/,
    /^COMPLETE-.*\.md$/,
    /^FINAL-.*\.md$/,
    /^FIRST-.*\.md$/,
    /^FIX-.*\.md$/,
    /^SCC-.*\.md$/,
    /^DOCKER-.*\.md$/,
    /^ELECTRON-.*\.md$/,
    /^NEUE-.*\.md$/,
    /^PLAY-.*\.md$/,
    /^IMPLEMENTATION-.*\.txt$/,
    /^ZUSAMMENFASSUNG-.*\.md$/,
  ],
  'archives/old-scripts': [
    /^START-.*\.bat$/,
    /^ENABLE-.*\.bat$/,
    /^REMOVE-.*\.bat$/,
    /^SETUP-.*\.bat$/,
    /^WATCH-.*\.bat$/,
    /^check-.*\.ps1$/,
    /^status-.*\.ps1$/,
    /^set-.*\.ps1$/,
    /^test-.*\.ps1$/,
  ],
  'archives/old-typescript-scripts': [
    /^ask-toobix-.*\.ts$/,
    /^talk-to-toobix.*\.ts$/,
    /^thank-toobix\.ts$/,
    /^inform-toobix-.*\.ts$/,
    /^toobix-.*\.ts$/,
    /^analyze-.*\.ts$/,
    /^check-.*\.ts$/,
    /^test-.*\.ts$/,
    /^demo-.*\.ts$/,
    /^prepare-.*\.ts$/,
    /^recover-.*\.ts$/,
    /^extract-.*\.ts$/,
    /^feature-.*\.ts$/,
    /^fix-.*\.ts$/,
    /^grand-.*\.ts$/,
    /^interact-.*\.ts$/,
    /^organize-.*\.ts$/,
    /^rights-.*\.ts$/,
    /^selbstreflexion\.ts$/,
    /^meta-consciousness-.*\.ts$/,
    /^expansion-.*\.ts$/,
    /^claude-.*\.ts$/,
    /^echo-.*\.ts$/,
    /^service-inventory\.ts$/,
    /^tool-analyzer\.ts$/,
    /^web-server\.ts$/,
    /^setup-env\.ts$/,
    /^cloud-.*\.ts$/,
    /^deployment-.*\.ts$/,
    /^launch-.*\.ts$/,
    /^memory-.*\.ts$/,
  ],
  'archives/generated-data': [
    /^AUTONOMOUS-RESEARCH-.*\.json$/,
    /^CLAUDE-TOOBIX-.*\.json$/,
    /^MEMORY-ANALYSIS-.*\.json$/,
    /^RIGHTS-AND-DUTIES-.*\.json$/,
    /^TOOBIX-.*\.json$/,
    /^WHAT-TOOBIX-.*\.json$/,
    /^SELBSTREFLEXION\.json$/,
    /^LAUNCH-CHECKLIST\.json$/,
    /^SERVICE-.*\.json$/,
    /^COMPLETE-.*\.json$/,
    /^CORE-.*\.json$/,
    /^integration-report\.json$/,
    /^temp-conversation\.json$/,
    /^world-state\.json$/,
    /^colony-.*\.json$/,
    /^empire-.*\.json$/,
    /^hybrid-.*\.json$/,
    /^SELF-LAUNCH-.*\.json$/,
  ],
  'archives/old-html': [
    /^toobix-.*\.html$/,
    /^evolution-dashboard\.html$/,
  ],
  'archives/misc': [
    /^toobix-raw\.txt$/,
    /^toobix-response\.txt$/,
    /^nul$/,
    /^gateway-log\.txt$/,
    /^echo-bridge\.log$/,
    /^~\$.*$/,
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    if (DRY_RUN) {
      console.log(`[DRY] Would create: ${dir}`);
    } else {
      await mkdir(dir, { recursive: true });
      console.log(`📁 Created: ${dir}`);
    }
  }
}

async function moveFile(src: string, dest: string) {
  if (DRY_RUN) {
    console.log(`[DRY] Would move: ${basename(src)} → ${dest}`);
  } else {
    await ensureDir(dest.substring(0, dest.lastIndexOf('/')));
    await rename(src, dest);
    console.log(`📦 Moved: ${basename(src)} → ${dest.replace(ROOT, '')}`);
  }
}

function matchesPattern(filename: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(filename));
}

// ============================================================================
// MAIN CLEANUP
// ============================================================================

async function analyzeRoot() {
  console.log('\n📊 ANALYSIERE ROOT-VERZEICHNIS...\n');
  
  const entries = await readdir(ROOT);
  const stats = {
    keep: 0,
    archive: 0,
    folders: 0,
    unknown: 0,
  };
  
  const toArchive: { file: string; dest: string }[] = [];
  const unknown: string[] = [];
  
  for (const entry of entries) {
    const fullPath = join(ROOT, entry);
    const entryStat = await stat(fullPath);
    
    if (entryStat.isDirectory()) {
      if (KEEP_FOLDERS.has(entry)) {
        stats.folders++;
      } else {
        console.log(`⚠️  Unbekannter Ordner: ${entry}`);
        stats.unknown++;
      }
      continue;
    }
    
    // Check if should keep
    if (KEEP_IN_ROOT.has(entry)) {
      stats.keep++;
      continue;
    }
    
    // Check archive patterns
    let matched = false;
    for (const [destFolder, patterns] of Object.entries(ARCHIVE_PATTERNS)) {
      if (matchesPattern(entry, patterns)) {
        toArchive.push({ file: entry, dest: join(ROOT, destFolder, entry) });
        stats.archive++;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      unknown.push(entry);
      stats.unknown++;
    }
  }
  
  console.log('\n📈 STATISTIK:');
  console.log(`   ✅ Behalten:   ${stats.keep}`);
  console.log(`   📦 Archivieren: ${stats.archive}`);
  console.log(`   📁 Ordner OK:   ${stats.folders}`);
  console.log(`   ❓ Unbekannt:   ${stats.unknown}`);
  
  if (unknown.length > 0 && unknown.length <= 20) {
    console.log('\n❓ UNBEKANNTE DATEIEN:');
    unknown.forEach(f => console.log(`   - ${f}`));
  }
  
  return { toArchive, unknown };
}

async function performArchiving(toArchive: { file: string; dest: string }[]) {
  console.log(`\n📦 ARCHIVIERE ${toArchive.length} DATEIEN...\n`);
  
  // Create archive folders
  for (const destFolder of Object.keys(ARCHIVE_PATTERNS)) {
    await ensureDir(join(ROOT, destFolder));
  }
  
  // Move files
  for (const { file, dest } of toArchive) {
    const src = join(ROOT, file);
    await moveFile(src, dest);
  }
  
  console.log(`\n✅ ${toArchive.length} Dateien archiviert!`);
}

async function cleanDuplicateFolder() {
  const duplicatePath = join(ROOT, 'Toobix-Unified');
  
  if (existsSync(duplicatePath)) {
    console.log('\n⚠️  DOPPELTER ORDNER GEFUNDEN: Toobix-Unified/Toobix-Unified/');
    console.log('   Dieser Ordner sollte entfernt werden (ist eine Kopie des Hauptprojekts)');
    
    if (!DRY_RUN) {
      // Move to archives instead of deleting
      const archivePath = join(ROOT, 'archives', 'duplicate-toobix-unified-backup');
      console.log(`   → Verschiebe nach: ${archivePath}`);
      await ensureDir(join(ROOT, 'archives'));
      if (!existsSync(archivePath)) {
        await rename(duplicatePath, archivePath);
        console.log('   ✅ Verschoben!');
      } else {
        console.log('   ⚠️  Backup existiert bereits, überspringe');
      }
    }
  }
}

async function cleanOldBackups() {
  const backupsPath = join(ROOT, 'backups');
  
  if (!existsSync(backupsPath)) return;
  
  const entries = await readdir(backupsPath);
  const oldBackups = entries.filter(e => e.startsWith('Critical-Data_') || e.startsWith('Generated-Content_'));
  
  if (oldBackups.length > 5) {
    console.log(`\n🗑️  ${oldBackups.length} alte Backups gefunden (behalte die neuesten 5)`);
    
    // Sort by date (newest first)
    oldBackups.sort().reverse();
    const toDelete = oldBackups.slice(5);
    
    for (const backup of toDelete) {
      const fullPath = join(backupsPath, backup);
      if (DRY_RUN) {
        console.log(`[DRY] Would delete: ${backup}`);
      } else {
        console.log(`   🗑️  Lösche: ${backup}`);
        await rm(fullPath, { recursive: true, force: true });
      }
    }
  }
}

async function createCleanReadme() {
  const readmePath = join(ROOT, 'README.md');
  const content = await readFile(readmePath, 'utf-8');
  
  // Check if README needs updating
  if (!content.includes('## 🚀 Quick Start')) {
    console.log('\n📝 README.md könnte aktualisiert werden');
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                   ║');
  console.log('║     🧹 TOOBIX PROJEKT AUFRÄUMER                                   ║');
  console.log('║                                                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  
  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODUS - Keine Änderungen werden durchgeführt\n');
  }
  
  // 1. Analyze root
  const { toArchive, unknown } = await analyzeRoot();
  
  // 2. Clean duplicate folder
  await cleanDuplicateFolder();
  
  // 3. Clean old backups
  await cleanOldBackups();
  
  // 4. Perform archiving (if not dry run and there are files to archive)
  if (toArchive.length > 0) {
    if (DRY_RUN) {
      console.log(`\n[DRY] Würde ${toArchive.length} Dateien archivieren`);
    } else {
      await performArchiving(toArchive);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ AUFRÄUMEN ABGESCHLOSSEN!');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  if (DRY_RUN) {
    console.log('💡 Um die Änderungen durchzuführen, führe aus:');
    console.log('   bun run cleanup-project.ts\n');
  }
}

main().catch(console.error);
