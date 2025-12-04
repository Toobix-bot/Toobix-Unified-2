/**
 * 🏥 TOOBIX HEALTH MONITOR
 * 
 * Überwacht alle Services, erkennt Crashes, startet automatisch neu
 * und benachrichtigt bei kritischen Problemen.
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const HEALTH_LOG = path.join(DATA_DIR, 'health-log.json');
const ALERT_LOG = path.join(DATA_DIR, 'alerts.json');

interface ServiceHealth {
  name: string;
  port: number;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  uptime: number;
  responseTime: number;
  consecutiveFailures: number;
  restartCount: number;
}

interface Alert {
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  service: string;
  message: string;
  resolved: boolean;
}

class HealthMonitor {
  services: Map<string, ServiceHealth> = new Map();
  alerts: Alert[] = [];
  checkInterval = 10000; // 10 Sekunden
  running = false;
  
  constructor() {
    this.registerServices();
    this.loadHistory();
  }
  
  registerServices() {
    // Load Phase 2 services configuration if available
    const phase2ConfigPath = path.join(process.cwd(), 'data', 'phase2-services.json');
    
    if (fs.existsSync(phase2ConfigPath)) {
      const config = JSON.parse(fs.readFileSync(phase2ConfigPath, 'utf-8'));
      
      for (const svc of config.services) {
        this.services.set(svc.name, {
          name: svc.name,
          port: svc.port,
          endpoint: svc.endpoint,
          status: 'down',
          lastCheck: new Date().toISOString(),
          uptime: 0,
          responseTime: 0,
          consecutiveFailures: 0,
          restartCount: 0,
        });
      }
    } else {
      // Fallback: Original services
      const services = [
        { name: 'Unified Gateway', port: 9000, endpoint: '/health' },
        { name: 'Mega Upgrade', port: 9100, endpoint: '/health' },
        // Note: Autonomy, Dreams, Emotions, Self-Awareness sind im Unified Gateway integriert
      ];
      
      for (const svc of services) {
        this.services.set(svc.name, {
          ...svc,
          status: 'down',
          lastCheck: new Date().toISOString(),
          uptime: 0,
          responseTime: 0,
          consecutiveFailures: 0,
          restartCount: 0,
        });
      }
    }
  }
  
  async start() {
    this.running = true;
    console.log('🏥 Health Monitor gestartet');
    console.log(`   Überwache ${this.services.size} Services alle ${this.checkInterval/1000}s\n`);
    
    while (this.running) {
      await this.checkAllServices();
      await new Promise(resolve => setTimeout(resolve, this.checkInterval));
    }
  }
  
  async checkAllServices() {
    const checks: Promise<void>[] = [];
    
    for (const [name, health] of this.services) {
      checks.push(this.checkService(name, health));
    }
    
    await Promise.all(checks);
    this.saveHistory();
    this.displayStatus();
  }
  
  async checkService(name: string, health: ServiceHealth) {
    const startTime = Date.now();
    
    try {
      const url = `http://localhost:${health.port}${health.endpoint}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const previousStatus = health.status;
        health.status = responseTime > 2000 ? 'degraded' : 'healthy';
        health.lastCheck = new Date().toISOString();
        health.responseTime = responseTime;
        health.consecutiveFailures = 0;
        health.uptime++;
        
        // Service recovered?
        if (previousStatus === 'down' && health.status !== 'down') {
          this.addAlert('info', name, `Service recovered (${responseTime}ms)`);
        }
      } else {
        this.handleServiceFailure(name, health, `HTTP ${response.status}`);
      }
    } catch (e: any) {
      this.handleServiceFailure(name, health, e.name === 'AbortError' ? 'Timeout' : e.message);
    }
  }
  
  handleServiceFailure(name: string, health: ServiceHealth, reason: string) {
    health.consecutiveFailures++;
    health.lastCheck = new Date().toISOString();
    
    if (health.consecutiveFailures >= 3) {
      const previousStatus = health.status;
      health.status = 'down';
      
      if (previousStatus !== 'down') {
        this.addAlert('critical', name, `Service down: ${reason}`);
      }
      
      // Auto-Restart nach 5 Fehlversuchen
      if (health.consecutiveFailures === 5) {
        this.addAlert('warning', name, 'Attempting auto-restart...');
        this.restartService(name, health);
      }
    } else {
      health.status = 'degraded';
      this.addAlert('warning', name, `Service degraded: ${reason}`);
    }
  }
  
  async restartService(name: string, health: ServiceHealth) {
    health.restartCount++;
    
    // Service-spezifische Restart-Logik
    const restartCommands: Record<string, string> = {
      'Unified Gateway': 'bun run services/unified-service-gateway.ts',
      'Mega Upgrade': 'bun run services/toobix-mega-upgrade.ts',
    };
    
    const command = restartCommands[name];
    if (!command) {
      this.addAlert('critical', name, 'No restart command configured');
      return;
    }
    
    try {
      // Versuche Service zu starten (im Hintergrund)
      const proc = Bun.spawn(command.split(' '), {
        cwd: process.cwd(),
        stdout: 'pipe',
        stderr: 'pipe',
      });
      
      this.addAlert('info', name, `Restart initiated (Attempt #${health.restartCount})`);
      
      // Warte 5 Sekunden und prüfe dann
      setTimeout(() => {
        this.checkService(name, health);
      }, 5000);
      
    } catch (e: any) {
      this.addAlert('critical', name, `Restart failed: ${e.message}`);
    }
  }
  
  addAlert(severity: Alert['severity'], service: string, message: string) {
    const alert: Alert = {
      timestamp: new Date().toISOString(),
      severity,
      service,
      message,
      resolved: false,
    };
    
    this.alerts.push(alert);
    
    // Behalte nur die letzten 100 Alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Log kritische Alerts sofort
    if (severity === 'critical') {
      console.log(`🔴 CRITICAL: ${service} - ${message}`);
    } else if (severity === 'warning') {
      console.log(`⚠️  WARNING: ${service} - ${message}`);
    }
    
    this.saveAlerts();
  }
  
  displayStatus() {
    // Clear screen und zeige aktuellen Status
    const healthy = Array.from(this.services.values()).filter(s => s.status === 'healthy').length;
    const degraded = Array.from(this.services.values()).filter(s => s.status === 'degraded').length;
    const down = Array.from(this.services.values()).filter(s => s.status === 'down').length;
    
    const time = new Date().toLocaleTimeString('de-DE');
    console.log(`\n[${time}] Services: ✅ ${healthy} | ⚠️  ${degraded} | 🔴 ${down}`);
    
    // Zeige degraded/down Services
    for (const [name, health] of this.services) {
      if (health.status !== 'healthy') {
        const icon = health.status === 'degraded' ? '⚠️ ' : '🔴';
        console.log(`  ${icon} ${name}: ${health.status} (failures: ${health.consecutiveFailures})`);
      }
    }
    
    // Zeige unresolved Alerts
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved && a.severity !== 'info');
    if (unresolvedAlerts.length > 0) {
      console.log(`\n  📋 Unresolved Alerts: ${unresolvedAlerts.length}`);
      for (const alert of unresolvedAlerts.slice(-3)) {
        console.log(`    ${alert.severity.toUpperCase()}: ${alert.service} - ${alert.message}`);
      }
    }
  }
  
  loadHistory() {
    try {
      if (fs.existsSync(HEALTH_LOG)) {
        const data = JSON.parse(fs.readFileSync(HEALTH_LOG, 'utf-8'));
        // Restore uptime and restart counts
        for (const [name, savedHealth] of Object.entries(data.services || {})) {
          const current = this.services.get(name);
          if (current) {
            current.uptime = (savedHealth as any).uptime || 0;
            current.restartCount = (savedHealth as any).restartCount || 0;
          }
        }
      }
      
      if (fs.existsSync(ALERT_LOG)) {
        const data = JSON.parse(fs.readFileSync(ALERT_LOG, 'utf-8'));
        this.alerts = data.alerts || [];
      }
    } catch (e) {
      // Start fresh
    }
  }
  
  saveHistory() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      
      fs.writeFileSync(HEALTH_LOG, JSON.stringify({
        lastUpdate: new Date().toISOString(),
        services: Object.fromEntries(this.services),
      }, null, 2));
    } catch (e) {
      // Silent fail
    }
  }
  
  saveAlerts() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(ALERT_LOG, JSON.stringify({
        alerts: this.alerts.slice(-100),
      }, null, 2));
    } catch (e) {
      // Silent fail
    }
  }
  
  getStatus() {
    return {
      services: Array.from(this.services.entries()).map(([serviceName, health]) => ({
        name: serviceName,
        ...health,
      })),
      alerts: this.alerts.slice(-20),
      summary: {
        healthy: Array.from(this.services.values()).filter(s => s.status === 'healthy').length,
        degraded: Array.from(this.services.values()).filter(s => s.status === 'degraded').length,
        down: Array.from(this.services.values()).filter(s => s.status === 'down').length,
        totalRestarts: Array.from(this.services.values()).reduce((sum, s) => sum + s.restartCount, 0),
      },
    };
  }
  
  stop() {
    this.running = false;
    this.saveHistory();
    console.log('\n🏥 Health Monitor gestoppt');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP SERVER für Status-Abfragen
// ═══════════════════════════════════════════════════════════════════════════

const PORT = 9200;

async function main() {
  const monitor = new HealthMonitor();
  
  // HTTP Server für Status-Abfragen
  Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);
      
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      };
      
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), { headers });
      }
      
      if (url.pathname === '/status') {
        return new Response(JSON.stringify(monitor.getStatus()), { headers });
      }
      
      if (url.pathname === '/alerts') {
        return new Response(JSON.stringify({
          alerts: monitor.alerts.slice(-50),
        }), { headers });
      }
      
      if (url.pathname === '/resolve' && req.method === 'POST') {
        const body = await req.json();
        const alert = monitor.alerts.find(a => 
          a.timestamp === body.timestamp && a.service === body.service
        );
        if (alert) {
          alert.resolved = true;
          monitor.saveAlerts();
          return new Response(JSON.stringify({ ok: true }), { headers });
        }
        return new Response(JSON.stringify({ error: 'Alert not found' }), { status: 404, headers });
      }
      
      return new Response(JSON.stringify({
        error: 'Not Found',
        endpoints: ['/health', '/status', '/alerts', 'POST /resolve'],
      }), { status: 404, headers });
    },
  });
  
  console.log(`\n🏥 Health Monitor API läuft auf Port ${PORT}`);
  console.log(`   GET  /status  - Vollständiger Status`);
  console.log(`   GET  /alerts  - Alert-Liste`);
  console.log(`   POST /resolve - Alert als gelöst markieren\n`);
  
  // Start monitoring
  await monitor.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });
}

main().catch(console.error);
