/**
 * 🌍 TOOBIX MASTER ORCHESTRATOR
 * 
 * Startet ALLE 65 Services und etabliert das Zahnrad-System
 */

import * as fs from 'fs';
import * as path from 'path';

interface Service {
  name: string;
  file: string;
  port?: number;
  category: string;
  running: boolean;
  process?: any;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

class MasterOrchestrator {
  services: Map<string, Service> = new Map();
  startedCount = 0;
  failedCount = 0;
  
  async discoverAllServices(): Promise<void> {
    console.log('\n🔍 Entdecke alle Toobix Services...\n');
    
    // Core Services
    await this.scanDirectory('services', 'Core');
    
    // Extended Services
    await this.scanDirectory('scripts/2-services', 'Extended');
    
    console.log(`\n✅ ${this.services.size} Services gefunden!\n`);
  }
  
  async scanDirectory(dir: string, category: string): Promise<void> {
    const fullPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) return;
    
    const files = fs.readdirSync(fullPath)
      .filter(f => f.endsWith('.ts'))
      .filter(f => !f.includes('test') && !f.includes('backup'));
    
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const port = this.extractPort(content);
      
      this.services.set(file, {
        name: this.formatName(file),
        file: `${dir}/${file}`,
        port,
        category,
        running: false,
      });
    }
  }
  
  extractPort(content: string): number | undefined {
    const patterns = [
      /port:\s*(\d+)/,
      /PORT\s*=\s*(\d+)/,
      /const\s+PORT\s*=\s*(\d+)/,
      /listen\((\d+)\)/,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return parseInt(match[1]);
    }
    
    return undefined;
  }
  
  formatName(filename: string): string {
    return filename
      .replace('.ts', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  async checkServiceHealth(port: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
  
  async startService(service: Service): Promise<boolean> {
    if (!service.port) {
      console.log(`  ⏭️  ${service.name} - Kein Port, übersprungen`);
      return false;
    }
    
    // Check if already running
    const isRunning = await this.checkServiceHealth(service.port);
    if (isRunning) {
      console.log(`  ♻️  ${service.name} (Port ${service.port}) - Bereits aktiv`);
      service.running = true;
      this.startedCount++;
      return true;
    }
    
    console.log(`  🚀 Starte ${service.name} (Port ${service.port})...`);
    
    try {
      const proc = Bun.spawn(['bun', 'run', service.file], {
        cwd: process.cwd(),
        stdout: 'ignore',
        stderr: 'ignore',
      });
      
      service.process = proc;
      
      // Warte 3 Sekunden
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const running = await this.checkServiceHealth(service.port);
      
      if (running) {
        console.log(`  ✅ ${service.name} - LÄUFT!`);
        service.running = true;
        this.startedCount++;
        return true;
      } else {
        console.log(`  ⚠️  ${service.name} - Gestartet, aber Health-Check failed`);
        this.failedCount++;
        return false;
      }
    } catch (e: any) {
      console.log(`  🔴 ${service.name} - Fehler: ${e.message}`);
      this.failedCount++;
      return false;
    }
  }
  
  async startAllServices(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║  🚀 MASTER ORCHESTRATOR - ALLE SERVICES STARTEN      ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    // Gruppiere nach Priorität
    const critical = Array.from(this.services.values()).filter(s => 
      s.name.includes('Event Bus') || 
      s.name.includes('Memory') || 
      s.name.includes('Gateway') ||
      s.name.includes('LLM')
    );
    
    const rest = Array.from(this.services.values()).filter(s => 
      !critical.includes(s)
    );
    
    // Start critical first
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 BATCH 1: KRITISCHE SERVICES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    for (const service of critical) {
      await this.startService(service);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Start rest in smaller batches
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚙️  BATCH 2: ALLE WEITEREN SERVICES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    for (let i = 0; i < rest.length; i++) {
      const service = rest[i];
      console.log(`\n[${i + 1}/${rest.length}]`);
      await this.startService(service);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('MASTER ORCHESTRATOR - ZUSAMMENFASSUNG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`✅ Erfolgreich gestartet: ${this.startedCount}`);
    console.log(`🔴 Fehlgeschlagen: ${this.failedCount}`);
    console.log(`📊 Total Services: ${this.services.size}`);
    console.log(`📈 Success Rate: ${((this.startedCount / this.services.size) * 100).toFixed(1)}%\n`);
    
    // Save running services
    this.saveRunningServices();
  }
  
  saveRunningServices(): void {
    const running = Array.from(this.services.values())
      .filter(s => s.running)
      .map(s => ({
        name: s.name,
        port: s.port,
        category: s.category,
        endpoint: '/health',
      }));
    
    const configPath = path.join(process.cwd(), 'data', 'all-services-running.json');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalServices: this.services.size,
      runningServices: this.startedCount,
      services: running,
    }, null, 2));
    
    console.log(`📝 Konfiguration gespeichert: ${configPath}\n`);
  }
}

async function main() {
  const orchestrator = new MasterOrchestrator();
  
  await orchestrator.discoverAllServices();
  await orchestrator.startAllServices();
  
  console.log('\n🎉 MASTER ORCHESTRATOR ABGESCHLOSSEN!\n');
  console.log('Nächste Schritte:');
  console.log('  1. Service-Perspektiven-System aktivieren');
  console.log('  2. Real World Impact Analyzer starten');
  console.log('  3. Kooperations-Engine initialisieren\n');
}

main().catch(console.error);
