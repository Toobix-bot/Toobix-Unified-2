// 🧹 Toobix Auto-Cleanup Engine v1
// Automated system optimization with safety checks

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CleanupTask {
  id: string;
  name: string;
  description: string;
  potentialGainGB: number;
  risk: 'safe' | 'medium' | 'high';
  autoExecutable: boolean;
  execute: () => Promise<CleanupResult>;
}

interface CleanupResult {
  success: boolean;
  message: string;
  freedGB?: number;
  errors?: string[];
}

class AutoCleanup {
  private tasks: Map<string, CleanupTask> = new Map();

  constructor() {
    this.registerTasks();
  }

  private registerTasks() {
    // Task 1: Delete old LoL installation
    this.tasks.set('lol-duplicate', {
      id: 'lol-duplicate',
      name: 'League of Legends Duplikat löschen',
      description: 'Alte LoL Installation in C:\\_GAMING\\Riot_Games löschen (34 GB)',
      potentialGainGB: 34,
      risk: 'medium',
      autoExecutable: false, // Needs confirmation
      execute: async () => {
        try {
          const path = 'C:\\_GAMING\\Riot_Games';
          await execAsync(`powershell -Command "Remove-Item '${path}' -Recurse -Force"`);
          return {
            success: true,
            message: 'LoL Duplikat erfolgreich gelöscht!',
            freedGB: 34
          };
        } catch (error: any) {
          return {
            success: false,
            message: 'Fehler beim Löschen',
            errors: [error.message]
          };
        }
      }
    });

    // Task 2: Clean temp folders
    this.tasks.set('temp-cleanup', {
      id: 'temp-cleanup',
      name: 'Temp-Ordner bereinigen',
      description: 'Alte Temp-Dateien löschen (>7 Tage)',
      potentialGainGB: 0.7,
      risk: 'safe',
      autoExecutable: true,
      execute: async () => {
        try {
          let totalFreed = 0;
          const tempPaths = [
            process.env.TEMP || 'C:\\Users\\Default\\AppData\\Local\\Temp',
            'C:\\Windows\\Temp'
          ];

          for (const tempPath of tempPaths) {
            const { stdout } = await execAsync(`
              powershell -Command "
                $before = (Get-ChildItem '${tempPath}' -Recurse -Force -ErrorAction SilentlyContinue |
                          Measure-Object -Property Length -Sum).Sum;
                if ($null -eq $before) { $before = 0 }

                Get-ChildItem '${tempPath}' -Recurse -Force -ErrorAction SilentlyContinue |
                  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
                  Remove-Item -Force -Recurse -ErrorAction SilentlyContinue;

                $after = (Get-ChildItem '${tempPath}' -Recurse -Force -ErrorAction SilentlyContinue |
                         Measure-Object -Property Length -Sum).Sum;
                if ($null -eq $after) { $after = 0 }

                $freedMB = [math]::Round(($before - $after) / 1MB, 2);
                Write-Output $freedMB
              "
            `);
            totalFreed += parseFloat(stdout.trim());
          }

          return {
            success: true,
            message: `${totalFreed.toFixed(2)} MB Temp-Dateien gelöscht`,
            freedGB: totalFreed / 1024
          };
        } catch (error: any) {
          return {
            success: false,
            message: 'Fehler beim Bereinigen',
            errors: [error.message]
          };
        }
      }
    });

    // Task 3: Delete empty folders
    this.tasks.set('empty-folders', {
      id: 'empty-folders',
      name: 'Leere Ordner entfernen',
      description: 'Leere Custom-Ordner auf C:\\ löschen',
      potentialGainGB: 0,
      risk: 'safe',
      autoExecutable: true,
      execute: async () => {
        const emptyFolders = [
          'C:\\_DEV_GLOBAL',
          'C:\\_CLEANUP',
          'C:\\_CREATIVE',
          'C:\\_PERSONAL',
          'C:\\_PROJECTS',
          'C:\\_SYSTEM'
        ];

        let deleted = 0;
        const errors: string[] = [];

        for (const folder of emptyFolders) {
          try {
            const { stdout } = await execAsync(
              `powershell -Command "if ((Get-ChildItem '${folder}' -Force -ErrorAction SilentlyContinue).Count -eq 0) { Remove-Item '${folder}' -Force; Write-Output 'DELETED' } else { Write-Output 'NOT_EMPTY' }"`
            );
            if (stdout.trim() === 'DELETED') deleted++;
          } catch (error: any) {
            errors.push(`${folder}: ${error.message}`);
          }
        }

        return {
          success: true,
          message: `${deleted} leere Ordner gelöscht`,
          freedGB: 0,
          errors: errors.length > 0 ? errors : undefined
        };
      }
    });

    // Task 4: Python venv cleanup
    this.tasks.set('python-venvs', {
      id: 'python-venvs',
      name: 'Python Virtual Environments bereinigen',
      description: 'Alte .venv Ordner in archivierten Projekten löschen (2 GB)',
      potentialGainGB: 2,
      risk: 'medium',
      autoExecutable: false,
      execute: async () => {
        try {
          const venvPaths = [
            'C:\\Users\\micha\\_PROJEKTE_ARCHIV\\2025_Projekte\\NEU\\NEU_V2\\Michael\\.venv',
            'C:\\Users\\micha\\_PROJEKTE_ARCHIV\\2025_Projekte\\NEU\\NEU_V2\\PERSKI\\.venv'
          ];

          let totalFreed = 0;
          for (const venvPath of venvPaths) {
            try {
              const { stdout } = await execAsync(`
                powershell -Command "
                  $size = (Get-ChildItem '${venvPath}' -Recurse -Force -ErrorAction SilentlyContinue |
                          Measure-Object -Property Length -Sum).Sum;
                  if ($null -eq $size) { $size = 0 }
                  $sizeGB = [math]::Round($size / 1GB, 2);
                  Remove-Item '${venvPath}' -Recurse -Force -ErrorAction SilentlyContinue;
                  Write-Output $sizeGB
                "
              `);
              totalFreed += parseFloat(stdout.trim());
            } catch (e) {
              // Ignore individual errors
            }
          }

          return {
            success: true,
            message: `${totalFreed.toFixed(2)} GB Python venvs gelöscht`,
            freedGB: totalFreed
          };
        } catch (error: any) {
          return {
            success: false,
            message: 'Fehler beim Löschen',
            errors: [error.message]
          };
        }
      }
    });

    // Task 5: Disable hibernation
    this.tasks.set('disable-hibernation', {
      id: 'disable-hibernation',
      name: 'Ruhezustand deaktivieren',
      description: 'hiberfil.sys löschen (3.15 GB) - Nur wenn Ruhezustand nicht genutzt wird!',
      potentialGainGB: 3.15,
      risk: 'medium',
      autoExecutable: false,
      execute: async () => {
        try {
          await execAsync('powercfg /hibernate off');
          return {
            success: true,
            message: 'Ruhezustand deaktiviert, 3.15 GB freigegeben',
            freedGB: 3.15
          };
        } catch (error: any) {
          return {
            success: false,
            message: 'Fehler (benötigt Admin-Rechte)',
            errors: [error.message]
          };
        }
      }
    });
  }

  /**
   * Get all tasks
   */
  getTasks(): CleanupTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(id: string): CleanupTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * Execute a task
   */
  async executeTask(id: string): Promise<CleanupResult> {
    const task = this.tasks.get(id);
    if (!task) {
      return {
        success: false,
        message: `Task ${id} not found`
      };
    }

    console.log(`🧹 Executing: ${task.name}...`);
    const result = await task.execute();
    console.log(result.success ? '✅' : '❌', result.message);

    return result;
  }

  /**
   * Execute all safe auto-executable tasks
   */
  async executeAutoTasks(): Promise<Map<string, CleanupResult>> {
    const results = new Map<string, CleanupResult>();

    const autoTasks = Array.from(this.tasks.values()).filter(
      t => t.autoExecutable && t.risk === 'safe'
    );

    for (const task of autoTasks) {
      const result = await this.executeTask(task.id);
      results.set(task.id, result);
    }

    return results;
  }

  /**
   * Get total potential gain
   */
  getTotalPotentialGain(): number {
    return Array.from(this.tasks.values()).reduce(
      (sum, task) => sum + task.potentialGainGB,
      0
    );
  }
}

// ============================================================================
// REST API SERVER
// ============================================================================

const cleanup = new AutoCleanup();
const port = 8963;

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
          JSON.stringify({ status: 'ok', service: 'auto-cleanup' }),
          { headers }
        );
      }

      // GET /api/tasks
      if (url.pathname === '/api/tasks') {
        const tasks = cleanup.getTasks();
        return new Response(JSON.stringify({ tasks }), { headers });
      }

      // POST /api/execute/:id
      if (url.pathname.startsWith('/api/execute/') && req.method === 'POST') {
        const id = url.pathname.split('/').pop();
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing task ID' }), {
            status: 400,
            headers
          });
        }

        const result = await cleanup.executeTask(id);
        return new Response(JSON.stringify(result), { headers });
      }

      // POST /api/execute-auto
      if (url.pathname === '/api/execute-auto' && req.method === 'POST') {
        const results = await cleanup.executeAutoTasks();
        const obj = Object.fromEntries(results);
        return new Response(JSON.stringify(obj), { headers });
      }

      // GET /api/potential-gain
      if (url.pathname === '/api/potential-gain') {
        const gain = cleanup.getTotalPotentialGain();
        return new Response(JSON.stringify({ gainGB: gain }), { headers });
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

console.log('🧹 Toobix Auto-Cleanup Engine v1');
console.log(`🚀 Running on http://localhost:${port}`);
console.log('');
console.log('📊 Endpoints:');
console.log(`   GET  http://localhost:${port}/health`);
console.log(`   GET  http://localhost:${port}/api/tasks`);
console.log(`   POST http://localhost:${port}/api/execute/:id`);
console.log(`   POST http://localhost:${port}/api/execute-auto`);
console.log(`   GET  http://localhost:${port}/api/potential-gain`);
console.log('');
console.log(`✨ Ready to clean! Total potential gain: ${cleanup.getTotalPotentialGain()} GB`);
