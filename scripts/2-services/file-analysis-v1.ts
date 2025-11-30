// 🔍 Toobix File Analysis Service v1
// Port: 8962
// Purpose: Intelligent file analysis, duplicates, structure mapping

import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import path from 'path';

const execAsync = promisify(exec);

// ============================================================================
// TYPES
// ============================================================================

interface FolderInfo {
  path: string;
  name: string;
  sizeGB: number;
  fileCount: number;
  folderCount: number;
  largestFiles: FileInfo[];
  type?: 'system' | 'user' | 'custom' | 'temp';
}

interface FileInfo {
  path: string;
  name: string;
  sizeMB: number;
  extension: string;
  modified: Date;
  hash?: string;
}

interface DuplicateGroup {
  hash: string;
  files: FileInfo[];
  totalWastedMB: number;
}

interface FolderStructure {
  path: string;
  children: FolderStructure[];
  sizeGB: number;
  depth: number;
}

// ============================================================================
// FILE ANALYZER CLASS
// ============================================================================

class FileAnalyzer {
  private cache = new Map<string, any>();

  /**
   * Analyze a folder
   */
  async analyzeFolder(folderPath: string): Promise<FolderInfo> {
    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          $path = '${folderPath.replace(/'/g, "''")}';
          if (!(Test-Path $path)) {
            Write-Output 'ERROR:Path does not exist';
            exit 1;
          }

          $files = Get-ChildItem -Path $path -File -Recurse -Force -ErrorAction SilentlyContinue;
          $folders = Get-ChildItem -Path $path -Directory -Recurse -Force -ErrorAction SilentlyContinue;

          $totalSize = ($files | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum;
          if ($null -eq $totalSize) { $totalSize = 0 }
          $sizeGB = [math]::Round($totalSize / 1GB, 2);

          $fileCount = ($files | Measure-Object).Count;
          $folderCount = ($folders | Measure-Object).Count;

          Write-Output \\"SIZE:$sizeGB\\";
          Write-Output \\"FILES:$fileCount\\";
          Write-Output \\"FOLDERS:$folderCount\\";

          # Get largest files
          $files |
            Sort-Object Length -Descending |
            Select-Object -First 10 |
            ForEach-Object {
              $sizeMB = [math]::Round($_.Length / 1MB, 2);
              $modified = $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss');
              Write-Output \\"FILE:$($_.Name)|$($_.FullName)|$sizeMB|$($_.Extension)|$modified\\"
            }
        "
      `);

      const lines = stdout.trim().split('\n');
      const sizeGB = parseFloat(lines.find(l => l.startsWith('SIZE:'))?.split(':')[1] || '0');
      const fileCount = parseInt(lines.find(l => l.startsWith('FILES:'))?.split(':')[1] || '0');
      const folderCount = parseInt(lines.find(l => l.startsWith('FOLDERS:'))?.split(':')[1] || '0');

      const largestFiles = lines
        .filter(l => l.startsWith('FILE:'))
        .map(l => {
          const [, data] = l.split('FILE:');
          const [name, fullPath, sizeMB, extension, modified] = data.split('|');
          return {
            path: fullPath,
            name,
            sizeMB: parseFloat(sizeMB),
            extension,
            modified: new Date(modified)
          };
        });

      const type = this.detectFolderType(folderPath);

      return {
        path: folderPath,
        name: path.basename(folderPath),
        sizeGB,
        fileCount,
        folderCount,
        largestFiles,
        type
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze folder: ${error.message}`);
    }
  }

  /**
   * Find duplicate files
   */
  async findDuplicates(folderPath: string, minSizeMB: number = 1): Promise<DuplicateGroup[]> {
    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          $path = '${folderPath.replace(/'/g, "''")}';
          $minSize = ${minSizeMB} * 1MB;

          Get-ChildItem -Path $path -File -Recurse -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Length -gt $minSize } |
            ForEach-Object {
              $hash = (Get-FileHash -Path $_.FullName -Algorithm MD5 -ErrorAction SilentlyContinue).Hash;
              if ($hash) {
                $sizeMB = [math]::Round($_.Length / 1MB, 2);
                $modified = $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss');
                Write-Output \\"$hash|$($_.Name)|$($_.FullName)|$sizeMB|$($_.Extension)|$modified\\"
              }
            }
        "
      `, { maxBuffer: 10 * 1024 * 1024 });

      const files = stdout
        .trim()
        .split('\n')
        .filter(l => l.trim())
        .map(line => {
          const [hash, name, fullPath, sizeMB, extension, modified] = line.split('|');
          return {
            hash,
            path: fullPath,
            name,
            sizeMB: parseFloat(sizeMB),
            extension,
            modified: new Date(modified)
          };
        });

      // Group by hash
      const groups = new Map<string, FileInfo[]>();
      files.forEach(file => {
        if (!groups.has(file.hash!)) {
          groups.set(file.hash!, []);
        }
        groups.get(file.hash!)!.push(file);
      });

      // Filter only duplicates (2+ files with same hash)
      const duplicates: DuplicateGroup[] = [];
      groups.forEach((files, hash) => {
        if (files.length > 1) {
          const totalWastedMB = files[0].sizeMB * (files.length - 1);
          duplicates.push({
            hash,
            files,
            totalWastedMB
          });
        }
      });

      // Sort by wasted space
      return duplicates.sort((a, b) => b.totalWastedMB - a.totalWastedMB);
    } catch (error: any) {
      throw new Error(`Failed to find duplicates: ${error.message}`);
    }
  }

  /**
   * Get folder structure tree
   */
  async getFolderTree(rootPath: string, maxDepth: number = 3): Promise<FolderStructure> {
    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          $path = '${rootPath.replace(/'/g, "''")}';

          function Get-FolderTree {
            param($path, $depth, $maxDepth)

            if ($depth -gt $maxDepth) { return }

            $size = (Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue |
                     Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum;
            if ($null -eq $size) { $size = 0 }
            $sizeGB = [math]::Round($size / 1GB, 2);

            Write-Output \\"$depth|$path|$sizeGB\\";

            Get-ChildItem -Path $path -Directory -Force -ErrorAction SilentlyContinue |
              ForEach-Object {
                Get-FolderTree -path $_.FullName -depth ($depth + 1) -maxDepth $maxDepth
              }
          }

          Get-FolderTree -path $path -depth 0 -maxDepth ${maxDepth}
        "
      `, { maxBuffer: 10 * 1024 * 1024 });

      const lines = stdout.trim().split('\n').filter(l => l.trim());

      // Build tree structure
      const tree = this.buildTreeFromLines(lines);
      return tree;
    } catch (error: any) {
      throw new Error(`Failed to get folder tree: ${error.message}`);
    }
  }

  /**
   * Categorize folders
   */
  async categorizeFolders(rootPath: string = 'C:\\'): Promise<Map<string, FolderInfo[]>> {
    const categories = new Map<string, FolderInfo[]>();
    categories.set('system', []);
    categories.set('user', []);
    categories.set('custom', []);
    categories.set('temp', []);

    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          Get-ChildItem '${rootPath}' -Directory -Force -ErrorAction SilentlyContinue |
            Select-Object Name, FullName |
            ForEach-Object { Write-Output \\"$($_.Name)|$($_.FullName)\\" }
        "
      `);

      const folders = stdout
        .trim()
        .split('\n')
        .filter(l => l.trim())
        .map(line => {
          const [name, fullPath] = line.split('|');
          return { name, path: fullPath };
        });

      for (const folder of folders.slice(0, 20)) { // Limit to prevent timeout
        try {
          const info = await this.analyzeFolder(folder.path);
          const category = info.type || 'custom';
          categories.get(category)!.push(info);
        } catch (error) {
          console.error(`Failed to analyze ${folder.path}`);
        }
      }

      return categories;
    } catch (error: any) {
      throw new Error(`Failed to categorize folders: ${error.message}`);
    }
  }

  /**
   * Get cleanup suggestions
   */
  async getCleanupSuggestions(rootPath: string = 'C:\\'): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      // Check temp folders
      const tempPaths = [
        'C:\\Windows\\Temp',
        `${process.env.TEMP || 'C:\\Users\\Default\\AppData\\Local\\Temp'}`
      ];

      for (const tempPath of tempPaths) {
        try {
          const info = await this.analyzeFolder(tempPath);
          if (info.sizeGB > 0.5) {
            suggestions.push(
              `Temp-Ordner ${tempPath}: ${info.sizeGB}GB - Kann bereinigt werden`
            );
          }
        } catch (e) {
          // Ignore errors for temp folders
        }
      }

      // Check for large old files
      const { stdout } = await execAsync(`
        powershell -Command "
          $oldDate = (Get-Date).AddMonths(-6);
          Get-ChildItem 'C:\\Users' -File -Recurse -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Length -gt 100MB -and $_.LastWriteTime -lt $oldDate } |
            Sort-Object Length -Descending |
            Select-Object -First 5 |
            ForEach-Object {
              $sizeMB = [math]::Round($_.Length / 1MB, 2);
              Write-Output \\"$($_.FullName)|$sizeMB\\"
            }
        "
      `, { timeout: 30000, maxBuffer: 1024 * 1024 });

      const oldFiles = stdout.trim().split('\n').filter(l => l.trim());
      if (oldFiles.length > 0) {
        suggestions.push(
          `${oldFiles.length} große alte Dateien (>100MB, >6 Monate) gefunden - Prüfe ob noch benötigt`
        );
      }

    } catch (error) {
      console.error('Error getting cleanup suggestions:', error);
    }

    return suggestions;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private detectFolderType(folderPath: string): FolderInfo['type'] {
    const pathLower = folderPath.toLowerCase();

    if (pathLower.includes('windows') || pathLower.includes('program files')) {
      return 'system';
    }
    if (pathLower.includes('users\\') && !pathLower.includes('appdata')) {
      return 'user';
    }
    if (pathLower.includes('temp') || pathLower.includes('cache')) {
      return 'temp';
    }
    return 'custom';
  }

  private buildTreeFromLines(lines: string[]): FolderStructure {
    const nodes: FolderStructure[] = [];

    lines.forEach(line => {
      const [depthStr, path, sizeStr] = line.split('|');
      const depth = parseInt(depthStr);
      const sizeGB = parseFloat(sizeStr);

      const node: FolderStructure = {
        path,
        children: [],
        sizeGB,
        depth
      };

      nodes.push(node);
    });

    // Build hierarchy
    const root = nodes[0];
    if (!root) return { path: '', children: [], sizeGB: 0, depth: 0 };

    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      // Find parent (last node with depth = current - 1)
      for (let j = i - 1; j >= 0; j--) {
        if (nodes[j].depth === node.depth - 1) {
          nodes[j].children.push(node);
          break;
        }
      }
    }

    return root;
  }
}

// ============================================================================
// REST API SERVER
// ============================================================================

const analyzer = new FileAnalyzer();
const port = 8962;

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // GET /health
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({ status: 'ok', service: 'file-analysis' }),
          { headers }
        );
      }

      // POST /api/analyze/folder
      if (url.pathname === '/api/analyze/folder' && req.method === 'POST') {
        const { path } = await req.json();
        const result = await analyzer.analyzeFolder(path);
        return new Response(JSON.stringify(result), { headers });
      }

      // POST /api/analyze/duplicates
      if (url.pathname === '/api/analyze/duplicates' && req.method === 'POST') {
        const { path, minSizeMB } = await req.json();
        const result = await analyzer.findDuplicates(path, minSizeMB);
        return new Response(JSON.stringify(result), { headers });
      }

      // POST /api/structure/tree
      if (url.pathname === '/api/structure/tree' && req.method === 'POST') {
        const { path, maxDepth } = await req.json();
        const result = await analyzer.getFolderTree(path, maxDepth);
        return new Response(JSON.stringify(result), { headers });
      }

      // POST /api/categorize
      if (url.pathname === '/api/categorize' && req.method === 'POST') {
        const { path } = await req.json();
        const result = await analyzer.categorizeFolders(path);
        const obj = Object.fromEntries(result);
        return new Response(JSON.stringify(obj), { headers });
      }

      // GET /api/cleanup/suggestions
      if (url.pathname === '/api/cleanup/suggestions') {
        const path = url.searchParams.get('path') || 'C:\\';
        const result = await analyzer.getCleanupSuggestions(path);
        return new Response(JSON.stringify({ suggestions: result }), { headers });
      }

      // 404
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers
      });
    }
  }
});

console.log('🔍 Toobix File Analysis Service v1');
console.log(`🚀 Running on http://localhost:${port}`);
console.log('');
console.log('📊 Endpoints:');
console.log(`   GET  http://localhost:${port}/health`);
console.log(`   POST http://localhost:${port}/api/analyze/folder`);
console.log(`   POST http://localhost:${port}/api/analyze/duplicates`);
console.log(`   POST http://localhost:${port}/api/structure/tree`);
console.log(`   POST http://localhost:${port}/api/categorize`);
console.log(`   GET  http://localhost:${port}/api/cleanup/suggestions`);
console.log('');
console.log('✨ Toobix is analyzing your files...');
