// 🎛️ Toobix System Monitor Service v1
// Port: 8961
// Purpose: Real-time system monitoring with AI consciousness

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SystemState {
  timestamp: Date;
  cpu: CPUInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  processes: ProcessInfo[];
  network: NetworkInfo;
  health: {
    score: number;  // 0-100
    status: 'optimal' | 'good' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  };
}

interface CPUInfo {
  usage: number;  // 0-100
  cores: number;
  temperature?: number;
  topProcesses: { name: string; cpu: number }[];
}

interface MemoryInfo {
  total: number;     // GB
  used: number;      // GB
  free: number;      // GB
  percentage: number; // 0-100
  topProcesses: { name: string; ram: number }[];
}

interface DiskInfo {
  drives: DriveInfo[];
  totalUsed: number;
  totalFree: number;
}

interface DriveInfo {
  letter: string;
  total: number;     // GB
  used: number;      // GB
  free: number;      // GB
  percentage: number; // 0-100
  type: string;
}

interface ProcessInfo {
  name: string;
  pid: number;
  cpu: number;       // percentage
  memory: number;    // MB
  status: string;
}

interface NetworkInfo {
  connected: boolean;
  type?: string;
  sent?: number;     // MB
  received?: number; // MB
}

// ============================================================================
// SYSTEM MONITOR CLASS
// ============================================================================

class SystemMonitor {
  private lastSnapshot: SystemState | null = null;
  private history: SystemState[] = [];
  private readonly maxHistory = 1000; // Keep last 1000 snapshots

  /**
   * Get current system state
   */
  async getCurrentState(): Promise<SystemState> {
    const [cpu, memory, disk, processes, network] = await Promise.all([
      this.getCPUInfo(),
      this.getMemoryInfo(),
      this.getDiskInfo(),
      this.getProcesses(),
      this.getNetworkInfo()
    ]);

    const state: SystemState = {
      timestamp: new Date(),
      cpu,
      memory,
      disk,
      processes,
      network,
      health: this.calculateHealth(cpu, memory, disk, processes)
    };

    // Store in history
    this.lastSnapshot = state;
    this.history.push(state);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    return state;
  }

  /**
   * Get CPU information
   */
  private async getCPUInfo(): Promise<CPUInfo> {
    try {
      // Get CPU usage using PowerShell
      const { stdout: cpuUsage } = await execAsync(
        `powershell -Command "Get-Counter '\\Processor(_Total)\\% Processor Time' | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue"`
      );

      // Get number of cores
      const { stdout: coresOut } = await execAsync(
        `powershell -Command "$env:NUMBER_OF_PROCESSORS"`
      );

      // Get top CPU processes
      const { stdout: topProcs } = await execAsync(
        `powershell -Command "Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | ForEach-Object { Write-Output (\\"$($_.Name),$($_.CPU)\\") }"`
      );

      const topProcesses = topProcs
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, cpu] = line.split(',');
          return { name: name.trim(), cpu: parseFloat(cpu) || 0 };
        });

      return {
        usage: Math.round(parseFloat(cpuUsage.trim())),
        cores: parseInt(coresOut.trim()),
        topProcesses
      };
    } catch (error) {
      console.error('Error getting CPU info:', error);
      return {
        usage: 0,
        cores: 1,
        topProcesses: []
      };
    }
  }

  /**
   * Get Memory information
   */
  private async getMemoryInfo(): Promise<MemoryInfo> {
    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          $os = Get-CimInstance Win32_OperatingSystem;
          $totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2);
          $freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2);
          $usedGB = $totalGB - $freeGB;
          $percentage = [math]::Round(($usedGB / $totalGB) * 100, 2);
          Write-Output \\"$totalGB,$usedGB,$freeGB,$percentage\\";

          Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 | ForEach-Object {
            $ramMB = [math]::Round($_.WorkingSet / 1MB, 2);
            Write-Output \\"PROC:$($_.Name),$ramMB\\"
          }
        "
      `);

      const lines = stdout.trim().split('\n');
      const [total, used, free, percentage] = lines[0].split(',').map(parseFloat);

      const topProcesses = lines
        .slice(1)
        .filter(line => line.startsWith('PROC:'))
        .map(line => {
          const [, data] = line.split('PROC:');
          const [name, ram] = data.split(',');
          return { name: name.trim(), ram: parseFloat(ram) };
        });

      return {
        total,
        used,
        free,
        percentage,
        topProcesses
      };
    } catch (error) {
      console.error('Error getting memory info:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0,
        topProcesses: []
      };
    }
  }

  /**
   * Get Disk information
   */
  private async getDiskInfo(): Promise<DiskInfo> {
    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | ForEach-Object {
            $totalGB = [math]::Round(($_.Used + $_.Free) / 1GB, 2);
            $usedGB = [math]::Round($_.Used / 1GB, 2);
            $freeGB = [math]::Round($_.Free / 1GB, 2);
            $percentage = [math]::Round(($usedGB / $totalGB) * 100, 2);
            Write-Output \\"$($_.Name),$totalGB,$usedGB,$freeGB,$percentage,Fixed\\"
          }
        "
      `);

      const drives = stdout
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [letter, total, used, free, percentage, type] = line.split(',');
          return {
            letter,
            total: parseFloat(total),
            used: parseFloat(used),
            free: parseFloat(free),
            percentage: parseFloat(percentage),
            type
          };
        });

      const totalUsed = drives.reduce((sum, d) => sum + d.used, 0);
      const totalFree = drives.reduce((sum, d) => sum + d.free, 0);

      return { drives, totalUsed, totalFree };
    } catch (error) {
      console.error('Error getting disk info:', error);
      return { drives: [], totalUsed: 0, totalFree: 0 };
    }
  }

  /**
   * Get running processes
   */
  private async getProcesses(): Promise<ProcessInfo[]> {
    try {
      const { stdout } = await execAsync(`
        powershell -Command "
          Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 20 | ForEach-Object {
            $ramMB = [math]::Round($_.WorkingSet / 1MB, 2);
            $cpu = [math]::Round($_.CPU, 2);
            Write-Output \\"$($_.Name),$($_.Id),$cpu,$ramMB,$($_.Responding)\\"
          }
        "
      `);

      return stdout
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, pid, cpu, memory, responding] = line.split(',');
          return {
            name,
            pid: parseInt(pid),
            cpu: parseFloat(cpu) || 0,
            memory: parseFloat(memory),
            status: responding === 'True' ? 'running' : 'not responding'
          };
        });
    } catch (error) {
      console.error('Error getting processes:', error);
      return [];
    }
  }

  /**
   * Get Network information
   */
  private async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const { stdout } = await execAsync(
        `powershell -Command "Test-Connection -ComputerName google.com -Count 1 -Quiet"`
      );

      return {
        connected: stdout.trim() === 'True',
        type: 'Unknown'
      };
    } catch (error) {
      return {
        connected: false
      };
    }
  }

  /**
   * Calculate system health score
   */
  private calculateHealth(
    cpu: CPUInfo,
    memory: MemoryInfo,
    disk: DiskInfo,
    processes: ProcessInfo[]
  ): SystemState['health'] {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check RAM
    if (memory.percentage > 90) {
      score -= 30;
      issues.push(`RAM kritisch voll: ${memory.percentage}%`);
      suggestions.push('Schließe ungenutzte Programme oder erweitere RAM');
    } else if (memory.percentage > 80) {
      score -= 15;
      issues.push(`RAM hoch: ${memory.percentage}%`);
      suggestions.push('Prüfe RAM-intensive Prozesse');
    }

    // Check Disk
    const cDrive = disk.drives.find(d => d.letter === 'C');
    if (cDrive) {
      if (cDrive.percentage > 90) {
        score -= 30;
        issues.push(`C:\\ kritisch voll: ${cDrive.percentage}%`);
        suggestions.push('SOFORT: Speicher bereinigen! (<10% frei)');
      } else if (cDrive.percentage > 80) {
        score -= 15;
        issues.push(`C:\\ wird knapp: ${cDrive.percentage}%`);
        suggestions.push('Bereinigung empfohlen');
      }
    }

    // Check CPU
    if (cpu.usage > 90) {
      score -= 10;
      issues.push(`CPU-Last sehr hoch: ${cpu.usage}%`);
      suggestions.push('Prüfe CPU-intensive Prozesse');
    }

    // Check for not responding processes
    const notResponding = processes.filter(p => p.status !== 'running');
    if (notResponding.length > 0) {
      score -= 5 * notResponding.length;
      issues.push(`${notResponding.length} Prozesse reagieren nicht`);
      suggestions.push('Beende hängende Prozesse');
    }

    // Determine status
    let status: SystemState['health']['status'];
    if (score >= 80) status = 'optimal';
    else if (score >= 60) status = 'good';
    else if (score >= 40) status = 'warning';
    else status = 'critical';

    return {
      score: Math.max(0, score),
      status,
      issues,
      suggestions
    };
  }

  /**
   * Get history
   */
  getHistory(limit: number = 100): SystemState[] {
    return this.history.slice(-limit);
  }

  /**
   * Get last snapshot
   */
  getLastSnapshot(): SystemState | null {
    return this.lastSnapshot;
  }

  /**
   * Kill a process
   */
  async killProcess(pid: number): Promise<{ success: boolean; message: string }> {
    try {
      await execAsync(`taskkill /F /PID ${pid}`);
      return { success: true, message: `Process ${pid} terminated` };
    } catch (error) {
      return { success: false, message: `Failed to kill process ${pid}` };
    }
  }

  /**
   * Get system insights (AI-ready data)
   */
  async getInsights(): Promise<string[]> {
    const state = await this.getCurrentState();
    const insights: string[] = [];

    // Memory insights
    if (state.memory.percentage > 80) {
      const top3 = state.memory.topProcesses.slice(0, 3);
      insights.push(
        `RAM-Analyse: Top 3 Verbraucher sind ${top3.map(p => `${p.name} (${p.ram}MB)`).join(', ')}`
      );
    }

    // Disk insights
    const cDrive = state.disk.drives.find(d => d.letter === 'C');
    if (cDrive && cDrive.percentage > 80) {
      insights.push(
        `Speicherplatz C:\\ bei ${cDrive.percentage}% - Nur noch ${cDrive.free}GB frei`
      );
    }

    // Process insights
    const multipleInstances = this.findDuplicateProcesses(state.processes);
    if (multipleInstances.length > 0) {
      insights.push(
        `Mehrfach-Instanzen gefunden: ${multipleInstances.map(p => `${p.name} (${p.count}x)`).join(', ')}`
      );
    }

    return insights;
  }

  /**
   * Find duplicate processes
   */
  private findDuplicateProcesses(processes: ProcessInfo[]): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    processes.forEach(p => {
      counts.set(p.name, (counts.get(p.name) || 0) + 1);
    });

    return Array.from(counts.entries())
      .filter(([, count]) => count > 2)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// ============================================================================
// REST API SERVER
// ============================================================================

const monitor = new SystemMonitor();
const port = 8961;

// Create HTTP server
const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Routes
    try {
      // GET /health - Health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok', service: 'system-monitor' }), { headers });
      }

      // GET /api/system/current - Current system state
      if (url.pathname === '/api/system/current') {
        const state = await monitor.getCurrentState();
        return new Response(JSON.stringify(state), { headers });
      }

      // GET /api/system/history - Historical data
      if (url.pathname === '/api/system/history') {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const history = monitor.getHistory(limit);
        return new Response(JSON.stringify(history), { headers });
      }

      // GET /api/system/insights - AI-ready insights
      if (url.pathname === '/api/system/insights') {
        const insights = await monitor.getInsights();
        return new Response(JSON.stringify({ insights }), { headers });
      }

      // DELETE /api/process/:pid - Kill process
      if (url.pathname.startsWith('/api/process/') && req.method === 'DELETE') {
        const pid = parseInt(url.pathname.split('/').pop() || '0');
        const result = await monitor.killProcess(pid);
        return new Response(JSON.stringify(result), { headers });
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
  },

  // WebSocket support for live updates
  websocket: {
    open(ws) {
      console.log('🔌 WebSocket client connected');

      // Send initial state
      monitor.getCurrentState().then(state => {
        ws.send(JSON.stringify({ type: 'initial', data: state }));
      });

      // Send updates every 2 seconds
      const interval = setInterval(async () => {
        try {
          const state = await monitor.getCurrentState();
          ws.send(JSON.stringify({ type: 'update', data: state }));
        } catch (error) {
          console.error('Error sending update:', error);
        }
      }, 2000);

      // @ts-ignore
      ws.interval = interval;
    },

    message(ws, message) {
      console.log('📨 Received message:', message);
    },

    close(ws) {
      console.log('❌ WebSocket client disconnected');
      // @ts-ignore
      if (ws.interval) clearInterval(ws.interval);
    }
  }
});

console.log('🎛️ Toobix System Monitor v1');
console.log(`🚀 Running on http://localhost:${port}`);
console.log('');
console.log('📊 Endpoints:');
console.log(`   GET  http://localhost:${port}/health`);
console.log(`   GET  http://localhost:${port}/api/system/current`);
console.log(`   GET  http://localhost:${port}/api/system/history?limit=100`);
console.log(`   GET  http://localhost:${port}/api/system/insights`);
console.log(`   DEL  http://localhost:${port}/api/process/:pid`);
console.log('');
console.log('🔌 WebSocket: ws://localhost:' + port);
console.log('');
console.log('✨ Toobix is watching your system...');
