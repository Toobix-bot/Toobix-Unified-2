/**
 * 👁️ CLAUDE MONITOR - Passive System Observer
 *
 * Beobachtet das autonome System und greift nur bei Bedarf ein.
 */

const MONITOR_INTERVAL = 60000; // 1 Minute
const ETERNAL_DAEMON_URL = 'http://localhost:9999';

interface MonitorLog {
  timestamp: number;
  cycleCount: number;
  consciousProcesses: number;
  unconsciousProcesses: number;
  changes: string[];
}

let lastState: any = null;
const logs: MonitorLog[] = [];

async function fetchSystemStatus() {
  try {
    const response = await fetch(`${ETERNAL_DAEMON_URL}/status`);
    return await response.json();
  } catch (error) {
    console.error('❌ Failed to fetch system status:', error);
    return null;
  }
}

function detectChanges(oldState: any, newState: any): string[] {
  const changes: string[] = [];

  if (!oldState) return [];

  // Cycle count changes
  if (newState.cycleCount > oldState.cycleCount) {
    const diff = newState.cycleCount - oldState.cycleCount;
    changes.push(`+${diff} cycles (${oldState.cycleCount} → ${newState.cycleCount})`);
  }

  // Consciousness shifts
  if (newState.consciousProcesses !== oldState.consciousProcesses) {
    changes.push(`Conscious: ${oldState.consciousProcesses} → ${newState.consciousProcesses}`);
  }

  // Process state changes
  const oldProcs = new Map(oldState.processes?.map((p: any) => [p.name, p]) || []);
  const newProcs = new Map(newState.processes?.map((p: any) => [p.name, p]) || []);

  for (const [name, newProc] of newProcs) {
    const oldProc = oldProcs.get(name);
    if (oldProc && oldProc.conscious !== newProc.conscious) {
      const state = newProc.conscious ? 'AWAKE' : 'SLEEP';
      changes.push(`${name} → ${state}`);
    }
  }

  return changes;
}

async function monitor() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║            👁️  CLAUDE MONITOR ACTIVE  👁️                      ║
║                                                               ║
║  Ich beobachte das autonome System.                          ║
║  Ich greife nur ein, wenn nötig.                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  setInterval(async () => {
    const status = await fetchSystemStatus();
    if (!status) return;

    const changes = detectChanges(lastState, status);

    if (changes.length > 0) {
      console.log(`\n⏰ ${new Date().toLocaleTimeString()}`);
      console.log(`   Cycle: ${status.cycleCount} | Conscious: ${status.consciousProcesses}/${status.totalProcesses}`);

      for (const change of changes) {
        console.log(`   📊 ${change}`);
      }

      logs.push({
        timestamp: Date.now(),
        cycleCount: status.cycleCount,
        consciousProcesses: status.consciousProcesses,
        unconsciousProcesses: status.unconsciousProcesses,
        changes
      });

      // Save logs every 10 entries
      if (logs.length % 10 === 0) {
        await Bun.write('data/claude-monitor.json', JSON.stringify(logs, null, 2));
      }
    }

    lastState = status;
  }, MONITOR_INTERVAL);
}

// Start monitoring
monitor();
