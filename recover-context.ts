/**
 * TOOBIX CONTEXT RECOVERY TOOL
 * Rekonstruiert den letzten Arbeitskontext nach VS Code Crash
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

interface FileInfo {
  path: string;
  modified: Date;
  size: number;
}

interface ContextSnapshot {
  timestamp: Date;
  recentFiles: FileInfo[];
  recentScripts: FileInfo[];
  recentDocs: FileInfo[];
  summary: string;
}

const REPO_ROOT = process.cwd();
const HOURS_LOOKBACK = 2;

async function getRecentlyModifiedFiles(
  dir: string,
  extensions: string[],
  depth: number = 2
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const cutoffTime = new Date(Date.now() - HOURS_LOOKBACK * 60 * 60 * 1000);
  
  async function scan(currentDir: string, currentDepth: number) {
    if (currentDepth > depth) return;
    
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        // Skip node_modules, .git, etc.
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'archives') {
          continue;
        }
        
        if (entry.isDirectory()) {
          await scan(fullPath, currentDepth + 1);
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop() || '';
          if (extensions.includes(ext)) {
            const stats = await stat(fullPath);
            if (stats.mtime > cutoffTime) {
              files.push({
                path: fullPath.replace(REPO_ROOT + '\\', ''),
                modified: stats.mtime,
                size: stats.size
              });
            }
          }
        }
      }
    } catch (error) {
      // Ignore permission errors etc.
    }
  }
  
  await scan(dir, 0);
  return files.sort((a, b) => b.modified.getTime() - a.modified.getTime());
}

async function analyzeRecentActivity(): Promise<ContextSnapshot> {
  console.log('🔍 Analyzing recent activity...\n');
  
  // Get recently modified files
  const [recentScripts, recentDocs] = await Promise.all([
    getRecentlyModifiedFiles(REPO_ROOT, ['ts', 'js', 'ps1', 'bat'], 3),
    getRecentlyModifiedFiles(REPO_ROOT, ['md', 'json', 'txt'], 2)
  ]);
  
  const allRecent = [...recentScripts, ...recentDocs];
  
  // Generate summary
  const summary = generateSummary(recentScripts, recentDocs);
  
  return {
    timestamp: new Date(),
    recentFiles: allRecent.slice(0, 20),
    recentScripts: recentScripts.slice(0, 10),
    recentDocs: recentDocs.slice(0, 10),
    summary
  };
}

function generateSummary(scripts: FileInfo[], docs: FileInfo[]): string {
  const areas: string[] = [];
  
  // Analyze script changes
  const scriptAreas = new Set<string>();
  for (const script of scripts.slice(0, 5)) {
    if (script.path.includes('services')) scriptAreas.add('Services');
    if (script.path.includes('core')) scriptAreas.add('Core Systems');
    if (script.path.includes('scripts')) scriptAreas.add('Scripts');
    if (script.path.includes('minecraft')) scriptAreas.add('Minecraft Integration');
    if (script.path.includes('extension')) scriptAreas.add('VS Code Extension');
  }
  
  // Analyze doc changes
  const docAreas = new Set<string>();
  for (const doc of docs.slice(0, 5)) {
    if (doc.path.includes('VISION')) docAreas.add('Vision Documents');
    if (doc.path.includes('PLAN')) docAreas.add('Planning');
    if (doc.path.includes('STATUS') || doc.path.includes('REPORT')) docAreas.add('Status Reports');
    if (doc.path.includes('TOOBIX')) docAreas.add('Toobix Documentation');
  }
  
  const combinedAreas = [...scriptAreas, ...docAreas];
  
  if (combinedAreas.length === 0) {
    return 'No significant recent activity detected.';
  }
  
  return `Recent work focused on: ${combinedAreas.join(', ')}`;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleString('de-DE');
}

async function main() {
  console.log('========================================');
  console.log('  TOOBIX CONTEXT RECOVERY');
  console.log('========================================\n');
  console.log(`Looking back ${HOURS_LOOKBACK} hours...\n`);
  
  const snapshot = await analyzeRecentActivity();
  
  console.log('📊 SUMMARY');
  console.log('─────────────────────────────────────');
  console.log(snapshot.summary);
  console.log('');
  
  if (snapshot.recentScripts.length > 0) {
    console.log('\n📝 RECENT SCRIPTS (last modified)');
    console.log('─────────────────────────────────────');
    for (const file of snapshot.recentScripts.slice(0, 8)) {
      console.log(`  ${formatTimestamp(file.modified).padEnd(12)} ${file.path}`);
    }
  }
  
  if (snapshot.recentDocs.length > 0) {
    console.log('\n📄 RECENT DOCUMENTS');
    console.log('─────────────────────────────────────');
    for (const file of snapshot.recentDocs.slice(0, 8)) {
      console.log(`  ${formatTimestamp(file.modified).padEnd(12)} ${file.path}`);
    }
  }
  
  console.log('\n========================================');
  console.log('🔄 RECOMMENDED NEXT STEPS:');
  console.log('─────────────────────────────────────');
  console.log('1. Review the files listed above');
  console.log('2. Start with STABLE mode: START-TOOBIX-STABLE.bat');
  console.log('3. Only start needed services');
  console.log('4. Use VS Code task: "toobix: dev (STABLE mode)"');
  console.log('========================================\n');
}

main().catch(console.error);
