/**
 * Memory Monitor - Continuous system monitoring
 * Alerts when memory/disk usage is critical
 * 
 * Usage:
 *   bun run scripts/memory-monitor.ts
 *   bun run scripts/memory-monitor.ts --interval=5000  # Check every 5 seconds
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MemoryStatus {
  totalMB: number;
  freeMB: number;
  usedMB: number;
  percentage: number;
}

async function getMemoryStatus(): Promise<MemoryStatus> {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory | ConvertTo-Json"');
    const data = JSON.parse(stdout);
    
    const totalKB = data.TotalVisibleMemorySize;
    const freeKB = data.FreePhysicalMemory;
    const usedKB = totalKB - freeKB;
    
    return {
      totalMB: Math.round(totalKB / 1024),
      freeMB: Math.round(freeKB / 1024),
      usedMB: Math.round(usedKB / 1024),
      percentage: Math.round((usedKB / totalKB) * 100)
    };
  } catch (error) {
    throw new Error(`Failed to get memory status: ${error}`);
  }
}

function getMemoryEmoji(percentage: number): string {
  if (percentage >= 95) return '🔴'; // Critical
  if (percentage >= 85) return '🟠'; // Warning
  if (percentage >= 70) return '🟡'; // Caution
  return '🟢'; // OK
}

function getMemoryStatus(percentage: number): string {
  if (percentage >= 95) return 'CRITICAL';
  if (percentage >= 85) return 'WARNING';
  if (percentage >= 70) return 'CAUTION';
  return 'OK';
}

function formatTimestamp(): string {
  return new Date().toLocaleTimeString('de-DE');
}

function clearScreen() {
  // Clear console
  console.clear();
}

async function checkMemory(iteration: number = 0) {
  const memory = await getMemoryStatus();
  const emoji = getMemoryEmoji(memory.percentage);
  const status = getMemoryStatus(memory.percentage);
  
  clearScreen();
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    MEMORY MONITOR                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`⏰ Time: ${formatTimestamp()}  |  Check #${iteration + 1}\n`);
  
  console.log(`${emoji} Status: ${status}`);
  console.log(`📊 Usage: ${memory.percentage}%\n`);
  
  console.log('💾 Memory Details:');
  console.log(`   Total: ${memory.totalMB} MB`);
  console.log(`   Used:  ${memory.usedMB} MB`);
  console.log(`   Free:  ${memory.freeMB} MB\n`);
  
  // Progress bar
  const barLength = 50;
  const filledLength = Math.round((memory.percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  console.log(`[${bar}] ${memory.percentage}%\n`);
  
  // Alerts
  if (memory.percentage >= 95) {
    console.log('🚨 CRITICAL ALERT!');
    console.log('   → Memory is critically low!');
    console.log('   → Close heavy applications immediately!');
    console.log('   → Run: bun run scripts/emergency-cleanup.bat\n');
  } else if (memory.percentage >= 85) {
    console.log('⚠️  WARNING:');
    console.log('   → Memory usage is high');
    console.log('   → Consider closing unused applications\n');
  } else if (memory.percentage >= 70) {
    console.log('ℹ️  CAUTION:');
    console.log('   → Memory usage is elevated');
    console.log('   → Monitor for further increases\n');
  } else {
    console.log('✅ System memory is healthy\n');
  }
  
  console.log('Press Ctrl+C to stop monitoring');
}

async function startMonitoring(intervalMs: number = 3000) {
  console.log('🔍 Starting memory monitor...\n');
  
  let iteration = 0;
  
  // Initial check
  await checkMemory(iteration++);
  
  // Periodic checks
  setInterval(async () => {
    try {
      await checkMemory(iteration++);
    } catch (error) {
      console.error('\n❌ Error checking memory:', error);
    }
  }, intervalMs);
}

// Parse arguments
const args = process.argv.slice(2);
let interval = 3000; // Default 3 seconds

for (const arg of args) {
  if (arg.startsWith('--interval=')) {
    interval = parseInt(arg.split('=')[1]);
  }
}

// Start monitoring
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║              TOOBIX MEMORY MONITOR v1.0                      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`⏱️  Check interval: ${interval}ms`);
console.log('🎯 Monitoring memory usage...\n');

startMonitoring(interval).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
