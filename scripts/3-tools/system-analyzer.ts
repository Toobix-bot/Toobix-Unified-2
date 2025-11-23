/**
 * System Analyzer - Sammelt System-Informationen für AI-Analyse
 * 
 * Sammelt sicher (nur lesend):
 * - Festplattenspeicher
 * - Laufende Prozesse
 * - Speicher-Nutzung
 * - Netzwerk-Verbindungen
 * - Installierte Programme (optional)
 * 
 * Usage:
 *   bun run scripts/system-analyzer.ts
 *   bun run scripts/system-analyzer.ts --full  # Vollständige Analyse
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface SystemInfo {
  timestamp: string;
  hostname: string;
  os: {
    platform: string;
    version: string;
    architecture: string;
    uptime: number;
  };
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  disk: {
    drives: DriveInfo[];
    total: number;
    free: number;
    used: number;
  };
  processes: ProcessInfo[];
  network: NetworkInfo[];
  toobix: ToobixInfo;
}

interface DriveInfo {
  drive: string;
  totalGB: number;
  freeGB: number;
  usedGB: number;
  percentage: number;
  fileSystem?: string;
}

interface ProcessInfo {
  name: string;
  pid: number;
  cpu: number;
  memoryMB: number;
}

interface NetworkInfo {
  protocol: string;
  localAddress: string;
  localPort: number;
  remoteAddress?: string;
  remotePort?: number;
  state: string;
}

interface ToobixInfo {
  workspaceSize: number;
  databaseSize: number;
  nodeModulesSize: number;
  logCount: number;
  runningProcesses: string[];
}

async function getOSInfo(): Promise<SystemInfo['os']> {
  try {
    const { stdout: version } = await execAsync('ver');
    const { stdout: uptime } = await execAsync('powershell -Command "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime"');
    
    const lastBoot = new Date(uptime.trim());
    const uptimeSeconds = Math.floor((Date.now() - lastBoot.getTime()) / 1000);
    
    return {
      platform: 'Windows',
      version: version.trim(),
      architecture: process.arch,
      uptime: uptimeSeconds
    };
  } catch (error) {
    console.error('Error getting OS info:', error);
    return {
      platform: 'Windows',
      version: 'Unknown',
      architecture: process.arch,
      uptime: 0
    };
  }
}

async function getCPUInfo(): Promise<SystemInfo['cpu']> {
  try {
    const { stdout: cpuInfo } = await execAsync('wmic cpu get name,numberofcores /format:list');
    const lines = cpuInfo.split('\n').filter(l => l.trim());
    
    let model = 'Unknown';
    let cores = 0;
    
    for (const line of lines) {
      if (line.includes('Name=')) {
        model = line.split('=')[1].trim();
      }
      if (line.includes('NumberOfCores=')) {
        cores = parseInt(line.split('=')[1].trim());
      }
    }
    
    // CPU Usage (durchschnittlich über alle Kerne)
    const { stdout: cpuUsage } = await execAsync('powershell -Command "(Get-Counter \'\\Processor(_Total)\\% Processor Time\').CounterSamples[0].CookedValue"');
    const usage = parseFloat(cpuUsage.trim());
    
    return { model, cores, usage };
  } catch (error) {
    console.error('Error getting CPU info:', error);
    return { model: 'Unknown', cores: 0, usage: 0 };
  }
}

async function getMemoryInfo(): Promise<SystemInfo['memory']> {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory | ConvertTo-Json"');
    const data = JSON.parse(stdout);
    
    const totalKB = data.TotalVisibleMemorySize;
    const freeKB = data.FreePhysicalMemory;
    const usedKB = totalKB - freeKB;
    
    const totalMB = Math.round(totalKB / 1024);
    const freeMB = Math.round(freeKB / 1024);
    const usedMB = Math.round(usedKB / 1024);
    const percentage = Math.round((usedKB / totalKB) * 100);
    
    return {
      total: totalMB,
      free: freeMB,
      used: usedMB,
      percentage
    };
  } catch (error) {
    console.error('Error getting memory info:', error);
    return { total: 0, free: 0, used: 0, percentage: 0 };
  }
}

async function getDiskInfo(): Promise<SystemInfo['disk']> {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Used -ne $null} | Select-Object Name,Used,Free | ConvertTo-Json"');
    const data = JSON.parse(stdout);
    const drives = Array.isArray(data) ? data : [data];
    
    const driveInfos: DriveInfo[] = [];
    let totalBytes = 0;
    let freeBytes = 0;
    
    for (const drive of drives) {
      const usedBytes = drive.Used || 0;
      const freeBytesForDrive = drive.Free || 0;
      const totalBytesForDrive = usedBytes + freeBytesForDrive;
      
      totalBytes += totalBytesForDrive;
      freeBytes += freeBytesForDrive;
      
      driveInfos.push({
        drive: drive.Name + ':',
        totalGB: Math.round(totalBytesForDrive / (1024 ** 3) * 100) / 100,
        freeGB: Math.round(freeBytesForDrive / (1024 ** 3) * 100) / 100,
        usedGB: Math.round(usedBytes / (1024 ** 3) * 100) / 100,
        percentage: Math.round((usedBytes / totalBytesForDrive) * 100)
      });
    }
    
    return {
      drives: driveInfos,
      total: Math.round(totalBytes / (1024 ** 3) * 100) / 100,
      free: Math.round(freeBytes / (1024 ** 3) * 100) / 100,
      used: Math.round((totalBytes - freeBytes) / (1024 ** 3) * 100) / 100
    };
  } catch (error) {
    console.error('Error getting disk info:', error);
    return { drives: [], total: 0, free: 0, used: 0 };
  }
}

async function getTopProcesses(limit: number = 10): Promise<ProcessInfo[]> {
  try {
    // Top Prozesse nach CPU-Nutzung
    const { stdout } = await execAsync(`powershell -Command "Get-Process | Sort-Object CPU -Descending | Select-Object -First ${limit} Name,Id,CPU,WS | ConvertTo-Json"`);
    const data = JSON.parse(stdout);
    const processes = Array.isArray(data) ? data : [data];
    
    return processes.map(p => ({
      name: p.Name || 'Unknown',
      pid: p.Id || 0,
      cpu: Math.round((p.CPU || 0) * 100) / 100,
      memoryMB: Math.round((p.WS || 0) / (1024 * 1024) * 100) / 100
    }));
  } catch (error) {
    console.error('Error getting processes:', error);
    return [];
  }
}

async function getNetworkConnections(limit: number = 20): Promise<NetworkInfo[]> {
  try {
    const { stdout } = await execAsync('netstat -ano');
    const lines = stdout.split('\n').filter(l => l.trim() && !l.includes('Proto'));
    
    const connections: NetworkInfo[] = [];
    
    for (const line of lines.slice(0, limit)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const [protocol, localAddr, remoteAddr, state] = parts;
        const [localIP, localPort] = localAddr.split(':');
        const [remoteIP, remotePort] = remoteAddr.split(':');
        
        connections.push({
          protocol,
          localAddress: localIP || 'unknown',
          localPort: parseInt(localPort) || 0,
          remoteAddress: remoteIP !== '*' ? remoteIP : undefined,
          remotePort: remotePort ? parseInt(remotePort) : undefined,
          state
        });
      }
    }
    
    return connections;
  } catch (error) {
    console.error('Error getting network connections:', error);
    return [];
  }
}

async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`powershell -Command "(Get-ChildItem -Path '${dirPath}' -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"`);
    return parseInt(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

async function countFiles(dirPath: string, pattern: string = '*'): Promise<number> {
  try {
    const { stdout } = await execAsync(`powershell -Command "(Get-ChildItem -Path '${dirPath}' -Filter '${pattern}' -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count"`);
    return parseInt(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

async function getToobixInfo(): Promise<ToobixInfo> {
  const workspaceRoot = process.cwd();
  
  console.log('   Analyzing Toobix workspace...');
  
  const [
    workspaceSize,
    databaseSize,
    nodeModulesSize,
    logCount
  ] = await Promise.all([
    getDirectorySize(workspaceRoot),
    getDirectorySize(path.join(workspaceRoot, 'data')),
    getDirectorySize(path.join(workspaceRoot, 'node_modules')),
    countFiles(workspaceRoot, '*.log')
  ]);
  
  // Check for running Toobix processes
  const runningProcesses: string[] = [];
  try {
    const { stdout } = await execAsync('powershell -Command "Get-Process | Where-Object {$_.ProcessName -like \'*bun*\' -or $_.ProcessName -like \'*node*\' -or $_.ProcessName -like \'*ngrok*\'} | Select-Object Name,Id | ConvertTo-Json"');
    const processes = JSON.parse(stdout);
    const procs = Array.isArray(processes) ? processes : [processes];
    runningProcesses.push(...procs.map((p: any) => `${p.Name} (PID: ${p.Id})`));
  } catch {}
  
  return {
    workspaceSize: Math.round(workspaceSize / (1024 ** 2) * 100) / 100, // MB
    databaseSize: Math.round(databaseSize / (1024 ** 2) * 100) / 100,
    nodeModulesSize: Math.round(nodeModulesSize / (1024 ** 2) * 100) / 100,
    logCount,
    runningProcesses
  };
}

async function analyzeSystem(fullAnalysis: boolean = false): Promise<SystemInfo> {
  console.log('🔍 System Analysis Starting...\n');
  
  console.log('📊 Gathering system information:');
  console.log('   → Operating System...');
  const os = await getOSInfo();
  
  console.log('   → CPU Information...');
  const cpu = await getCPUInfo();
  
  console.log('   → Memory Usage...');
  const memory = await getMemoryInfo();
  
  console.log('   → Disk Space...');
  const disk = await getDiskInfo();
  
  console.log('   → Top Processes...');
  const processes = await getTopProcesses(fullAnalysis ? 20 : 10);
  
  console.log('   → Network Connections...');
  const network = await getNetworkConnections(fullAnalysis ? 30 : 20);
  
  console.log('   → Toobix Workspace...');
  const toobix = await getToobixInfo();
  
  const { stdout: hostname } = await execAsync('hostname');
  
  return {
    timestamp: new Date().toISOString(),
    hostname: hostname.trim(),
    os,
    cpu,
    memory,
    disk,
    processes,
    network,
    toobix
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function displaySystemInfo(info: SystemInfo) {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    SYSTEM ANALYSIS RESULTS                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`🖥️  System: ${info.hostname}`);
  console.log(`📅 Timestamp: ${info.timestamp}`);
  console.log(`⏰ Uptime: ${formatUptime(info.os.uptime)}\n`);
  
  console.log('💻 CPU:');
  console.log(`   Model: ${info.cpu.model}`);
  console.log(`   Cores: ${info.cpu.cores}`);
  console.log(`   Usage: ${info.cpu.usage.toFixed(1)}%\n`);
  
  console.log('🧠 Memory:');
  console.log(`   Total: ${info.memory.total} MB`);
  console.log(`   Used:  ${info.memory.used} MB (${info.memory.percentage}%)`);
  console.log(`   Free:  ${info.memory.free} MB\n`);
  
  console.log('💾 Disk Space:');
  info.disk.drives.forEach(drive => {
    console.log(`   ${drive.drive} - ${drive.usedGB}/${drive.totalGB} GB (${drive.percentage}% used)`);
  });
  console.log(`   Total: ${info.disk.used}/${info.disk.total} GB\n`);
  
  console.log('🔥 Top Processes (by CPU):');
  info.processes.slice(0, 5).forEach(p => {
    console.log(`   ${p.name.padEnd(20)} - CPU: ${p.cpu.toFixed(1)}s, RAM: ${p.memoryMB.toFixed(0)} MB`);
  });
  
  console.log('\n🌐 Active Network Connections:');
  const listening = info.network.filter(n => n.state === 'LISTENING').slice(0, 5);
  listening.forEach(n => {
    console.log(`   ${n.protocol} ${n.localAddress}:${n.localPort} (${n.state})`);
  });
  
  console.log('\n📦 Toobix Workspace:');
  console.log(`   Workspace Size: ${info.toobix.workspaceSize} MB`);
  console.log(`   Database Size:  ${info.toobix.databaseSize} MB`);
  console.log(`   node_modules:   ${info.toobix.nodeModulesSize} MB`);
  console.log(`   Log Files:      ${info.toobix.logCount}`);
  console.log(`   Running:        ${info.toobix.runningProcesses.length > 0 ? info.toobix.runningProcesses.join(', ') : 'None'}\n`);
}

function analyzeIssues(info: SystemInfo): string[] {
  const issues: string[] = [];
  
  // Memory Check
  if (info.memory.percentage > 90) {
    issues.push(`⚠️  CRITICAL: Memory usage is ${info.memory.percentage}% - System may be slow!`);
  } else if (info.memory.percentage > 80) {
    issues.push(`⚠️  WARNING: Memory usage is ${info.memory.percentage}% - Consider closing programs.`);
  }
  
  // Disk Check
  info.disk.drives.forEach(drive => {
    if (drive.percentage > 90) {
      issues.push(`⚠️  CRITICAL: Drive ${drive.drive} is ${drive.percentage}% full - Clean up space!`);
    } else if (drive.percentage > 80) {
      issues.push(`⚠️  WARNING: Drive ${drive.drive} is ${drive.percentage}% full.`);
    }
  });
  
  // CPU Check
  if (info.cpu.usage > 90) {
    issues.push(`⚠️  WARNING: CPU usage is ${info.cpu.usage.toFixed(1)}% - System under heavy load.`);
  }
  
  // Toobix Check
  if (info.toobix.nodeModulesSize > 1000) {
    issues.push(`ℹ️  INFO: node_modules is ${info.toobix.nodeModulesSize} MB - Consider cleanup.`);
  }
  
  if (info.toobix.runningProcesses.length === 0) {
    issues.push(`ℹ️  INFO: No Toobix processes detected - Server might not be running.`);
  }
  
  return issues;
}

function generateRecommendations(info: SystemInfo): string[] {
  const recommendations: string[] = [];
  
  // Memory recommendations
  if (info.memory.percentage > 70) {
    recommendations.push('💡 Memory Optimization:');
    recommendations.push('   - Close unused browser tabs');
    recommendations.push('   - Restart heavy applications');
    recommendations.push('   - Consider upgrading RAM if this is frequent');
  }
  
  // Disk recommendations
  const fullDrives = info.disk.drives.filter(d => d.percentage > 80);
  if (fullDrives.length > 0) {
    recommendations.push('💡 Disk Cleanup:');
    recommendations.push('   - Run Windows Disk Cleanup (cleanmgr.exe)');
    recommendations.push('   - Delete temp files (%TEMP%)');
    recommendations.push('   - Remove old downloads');
    recommendations.push('   - Uninstall unused programs');
  }
  
  // Toobix recommendations
  if (info.toobix.nodeModulesSize > 500) {
    recommendations.push('💡 Toobix Optimization:');
    recommendations.push('   - Run: bun clean (if available)');
    recommendations.push('   - Remove old node_modules: rm -rf node_modules && bun install');
  }
  
  if (info.toobix.logCount > 100) {
    recommendations.push('💡 Log Cleanup:');
    recommendations.push('   - Archive old log files');
    recommendations.push('   - Implement log rotation');
  }
  
  return recommendations;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const fullAnalysis = args.includes('--full');
  
  try {
    const systemInfo = await analyzeSystem(fullAnalysis);
    
    // Display results
    displaySystemInfo(systemInfo);
    
    // Analyze issues
    const issues = analyzeIssues(systemInfo);
    if (issues.length > 0) {
      console.log('\n╔══════════════════════════════════════════════════════════════╗');
      console.log('║                         ISSUES FOUND                         ║');
      console.log('╚══════════════════════════════════════════════════════════════╝\n');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('\n✅ No critical issues detected!\n');
    }
    
    // Generate recommendations
    const recommendations = generateRecommendations(systemInfo);
    if (recommendations.length > 0) {
      console.log('\n╔══════════════════════════════════════════════════════════════╗');
      console.log('║                      RECOMMENDATIONS                         ║');
      console.log('╚══════════════════════════════════════════════════════════════╝\n');
      recommendations.forEach(rec => console.log(rec));
      console.log();
    }
    
    // Save to file
    const outputPath = path.join(process.cwd(), 'data', 'system-analysis.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(systemInfo, null, 2));
    
    console.log(`\n💾 Full analysis saved to: ${outputPath}`);
    console.log('\n📊 You can now ask GitHub Copilot to analyze this data for deeper insights!\n');
    
  } catch (error) {
    console.error('\n❌ Error during system analysis:', error);
    process.exit(1);
  }
}

main();
