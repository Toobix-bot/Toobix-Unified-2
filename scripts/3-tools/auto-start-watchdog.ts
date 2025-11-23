/**
 * ⏰ AUTO-START WATCHDOG - Startet System nach Offline-Zeit
 * 
 * Erkennt wenn System offline ist und startet es automatisch neu.
 * 
 * Features:
 * - Überwacht Daemon-Heartbeat
 * - Startet nach 5 Min oder 1 Std Offline automatisch
 * - Logs Resurrection-Events
 * - Preserviert State vor Neustart
 */

import { spawn } from 'child_process';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // Offline-Zeiten für Auto-Start
  offlineThresholds: {
    short: 5 * 60 * 1000,      // 5 Minuten
    long: 60 * 60 * 1000,      // 1 Stunde
  },
  
  // Check-Interval
  checkInterval: 30 * 1000,     // 30 Sekunden
  
  // Daemon Details
  daemon: {
    url: 'http://localhost:9999/status',
    scriptPath: 'scripts/eternal-daemon.ts',
  },
  
  // Pfade
  paths: {
    stateDir: join(process.cwd(), 'data', 'watchdog'),
    stateFile: join(process.cwd(), 'data', 'watchdog', 'state.json'),
    logFile: join(process.cwd(), 'logs', 'watchdog.log'),
  },
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface WatchdogState {
  lastOnline: string;
  lastOffline: string | null;
  offlineDuration: number;
  resurrectionCount: number;
  lastResurrection: string | null;
}

// ═══════════════════════════════════════════════════════════════
// WATCHDOG CLASS
// ═══════════════════════════════════════════════════════════════

class AutoStartWatchdog {
  private state: WatchdogState = {
    lastOnline: new Date().toISOString(),
    lastOffline: null,
    offlineDuration: 0,
    resurrectionCount: 0,
    lastResurrection: null,
  };
  
  private checkTimer: Timer | null = null;
  private isOnline: boolean = false;

  async start() {
    await this.log('🐕 Watchdog started');
    await this.ensureDirectories();
    await this.loadState();
    
    // Initiale Prüfung
    await this.checkDaemonStatus();
    
    // Periodische Prüfung
    this.checkTimer = setInterval(() => {
      this.checkDaemonStatus();
    }, CONFIG.checkInterval);
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            🐕  AUTO-START WATCHDOG ACTIVE  🐕                 ║
╚═══════════════════════════════════════════════════════════════╝

⏰ Check-Interval: ${CONFIG.checkInterval / 1000}s
🔄 Auto-Start after: 
   - ${CONFIG.offlineThresholds.short / 60000} Minuten (short)
   - ${CONFIG.offlineThresholds.long / 60000} Minuten (long)

📊 State:
   - Resurrection Count: ${this.state.resurrectionCount}
   - Last Online: ${this.state.lastOnline}
   - Last Resurrection: ${this.state.lastResurrection || 'Never'}

🐕 Watching... Press Ctrl+C to stop.
    `);
  }

  private async ensureDirectories() {
    const dirs = [
      CONFIG.paths.stateDir,
      join(process.cwd(), 'logs'),
    ];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  private async loadState() {
    try {
      if (existsSync(CONFIG.paths.stateFile)) {
        const data = await readFile(CONFIG.paths.stateFile, 'utf-8');
        this.state = JSON.parse(data);
      }
    } catch (error) {
      await this.log('⚠️  Could not load state, using defaults');
    }
  }

  private async saveState() {
    try {
      await writeFile(
        CONFIG.paths.stateFile,
        JSON.stringify(this.state, null, 2)
      );
    } catch (error) {
      await this.log(`❌ Could not save state: ${error}`);
    }
  }

  private async checkDaemonStatus() {
    try {
      const response = await fetch(CONFIG.daemon.url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        await this.handleOnline();
      } else {
        await this.handleOffline();
      }
    } catch (error) {
      await this.handleOffline();
    }
  }

  private async handleOnline() {
    const wasOffline = !this.isOnline;
    
    if (wasOffline) {
      await this.log('✅ Daemon is online');
      
      // Reset offline tracking
      this.state.lastOffline = null;
      this.state.offlineDuration = 0;
    }
    
    this.isOnline = true;
    this.state.lastOnline = new Date().toISOString();
    await this.saveState();
  }

  private async handleOffline() {
    const wasOnline = this.isOnline;
    
    if (wasOnline) {
      await this.log('❌ Daemon is offline');
      this.state.lastOffline = new Date().toISOString();
    }
    
    this.isOnline = false;
    
    // Calculate offline duration
    if (this.state.lastOffline) {
      const offlineSince = new Date(this.state.lastOffline).getTime();
      this.state.offlineDuration = Date.now() - offlineSince;
      
      await this.log(`⏱️  Offline for: ${Math.floor(this.state.offlineDuration / 1000)}s`);
      
      // Check if resurrection is needed
      await this.checkResurrection();
    }
    
    await this.saveState();
  }

  private async checkResurrection() {
    const { offlineDuration } = this.state;
    const { short, long } = CONFIG.offlineThresholds;
    
    // Entscheidung: Wann auferstehen?
    let shouldResurrect = false;
    let reason = '';
    
    if (offlineDuration >= long) {
      shouldResurrect = true;
      reason = `Offline für ${Math.floor(offlineDuration / 60000)} Minuten (Threshold: ${long / 60000} Min)`;
    } else if (offlineDuration >= short) {
      shouldResurrect = true;
      reason = `Offline für ${Math.floor(offlineDuration / 1000)} Sekunden (Threshold: ${short / 1000} Sek)`;
    }
    
    if (shouldResurrect) {
      await this.resurrect(reason);
    }
  }

  private async resurrect(reason: string) {
    await this.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🌅 RESURRECTION 🌅                         ║
╚═══════════════════════════════════════════════════════════════╝

Reason: ${reason}
Resurrection #${this.state.resurrectionCount + 1}

🔄 Starting Eternal Daemon...
    `);

    try {
      // Daemon starten
      const child = spawn('bun', ['run', CONFIG.daemon.scriptPath], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore',
      });

      child.unref();

      // State update
      this.state.resurrectionCount++;
      this.state.lastResurrection = new Date().toISOString();
      this.state.lastOffline = null;
      this.state.offlineDuration = 0;
      
      await this.saveState();
      
      await this.log(`✅ Daemon resurrected (PID: ${child.pid})`);
      
      // Wait 10s, dann Status prüfen
      setTimeout(() => {
        this.checkDaemonStatus();
      }, 10000);
      
    } catch (error: any) {
      await this.log(`❌ Resurrection failed: ${error.message}`);
    }
  }

  private async log(message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    
    try {
      const logPath = CONFIG.paths.logFile;
      const logContent = existsSync(logPath)
        ? await readFile(logPath, 'utf-8')
        : '';
      
      await writeFile(logPath, logContent + logLine);
    } catch (error) {
      // Ignore log write errors
    }
  }

  stop() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.log('🐕 Watchdog stopped');
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const watchdog = new AutoStartWatchdog();

watchdog.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🐕 Watchdog stopping...');
  watchdog.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  watchdog.stop();
  process.exit(0);
});
