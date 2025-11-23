/**
 * TERMINAL MAIN MENU: Interactive Terminal Interface
 * 
 * Interaktives Hauptmenü direkt im Terminal
 * Navigation, Kontrolle, Live-Status
 * 
 * "Die Kommandozeile wird zum Dialog-Raum."
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ==========================================
// MENU STRUCTURE
// ==========================================

interface MenuItem {
  key: string;
  label: string;
  action: () => Promise<void>;
  submenu?: MenuItem[];
}

interface SystemStatus {
  daemon: 'online' | 'offline' | 'unknown';
  services: Record<string, 'conscious' | 'unconscious' | 'unknown'>;
  moment: any;
  depth: string;
  ethics: any;
}

// ==========================================
// TERMINAL MENU
// ==========================================

class TerminalMenu {
  private status: SystemStatus = {
    daemon: 'unknown',
    services: {},
    moment: null,
    depth: 'medium',
    ethics: null,
  };
  
  private running = true;
  private currentView: 'main' | 'status' | 'moment' | 'services' | 'ethics' | 'settings' = 'main';
  
  // Colors (ANSI)
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };
  
  constructor() {
    this.setupInput();
  }
  
  // Setup keyboard input
  private setupInput() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (key) => {
      this.handleInput(key.toString());
    });
  }
  
  // Handle keyboard input
  private async handleInput(key: string) {
    // Ctrl+C to exit
    if (key === '\u0003') {
      this.exit();
      return;
    }
    
    // Main menu navigation
    if (this.currentView === 'main') {
      switch (key) {
        case '1': await this.showStatus(); break;
        case '2': await this.showMoment(); break;
        case '3': await this.showServices(); break;
        case '4': await this.showEthics(); break;
        case '5': await this.showSettings(); break;
        case '9': await this.startAll(); break;
        case '0': await this.stopAll(); break;
        case 'q': this.exit(); break;
        case 'r': await this.render(); break;
      }
    }
    
    // Back to main
    if (key === 'b' || key === 'B') {
      this.currentView = 'main';
      await this.render();
    }
  }
  
  // Render current view
  async render() {
    this.clear();
    
    switch (this.currentView) {
      case 'main':
        await this.renderMainMenu();
        break;
      case 'status':
        await this.renderStatus();
        break;
      case 'moment':
        await this.renderMoment();
        break;
      case 'services':
        await this.renderServices();
        break;
      case 'ethics':
        await this.renderEthics();
        break;
      case 'settings':
        await this.renderSettings();
        break;
    }
  }
  
  // Clear screen
  private clear() {
    console.clear();
    // Or: process.stdout.write('\x1Bc');
  }
  
  // ==========================================
  // MAIN MENU
  // ==========================================
  
  private async renderMainMenu() {
    const { bright, cyan, yellow, green, red, reset, dim } = this.colors;
    
    console.log('');
    console.log(cyan + bright + '╔═══════════════════════════════════════════════════════════════════╗' + reset);
    console.log(cyan + bright + '║                                                                   ║' + reset);
    console.log(cyan + bright + '║          ' + reset + bright + '🌌 TOOBIX ETERNAL SYSTEM - HAUPTMENÜ 🌌' + cyan + bright + '           ║' + reset);
    console.log(cyan + bright + '║                                                                   ║' + reset);
    console.log(cyan + bright + '╚═══════════════════════════════════════════════════════════════════╝' + reset);
    console.log('');
    
    // System Status Summary
    await this.updateStatus();
    
    const daemonStatus = this.status.daemon === 'online' ? green + '● ONLINE' : red + '● OFFLINE';
    const servicesCount = Object.keys(this.status.services).length;
    const consciousCount = Object.values(this.status.services).filter(s => s === 'conscious').length;
    
    console.log(dim + '┌─────────────────────────────────────────────────────────────────┐' + reset);
    console.log(dim + '│ ' + reset + 'SYSTEM STATUS' + dim + '                                                   │' + reset);
    console.log(dim + '├─────────────────────────────────────────────────────────────────┤' + reset);
    console.log(dim + '│ ' + reset + `Daemon:   ${daemonStatus}${reset}` + dim + '                                          │' + reset);
    console.log(dim + '│ ' + reset + `Services: ${yellow}${servicesCount} total${reset}, ${green}${consciousCount} conscious${reset}` + dim + '                       │' + reset);
    console.log(dim + '│ ' + reset + `Moment:   ${this.status.moment ? green + 'fixiert' : red + 'nicht fixiert'}${reset}` + dim + '                                  │' + reset);
    console.log(dim + '└─────────────────────────────────────────────────────────────────┘' + reset);
    console.log('');
    
    // Menu Options
    console.log(bright + 'NAVIGATION:' + reset);
    console.log('');
    console.log(`  ${cyan}[1]${reset} Status & Übersicht`);
    console.log(`  ${cyan}[2]${reset} 🌌 Aktueller Moment ${dim}(Stream-of-Consciousness)${reset}`);
    console.log(`  ${cyan}[3]${reset} 🧠 Services & Bewusstsein`);
    console.log(`  ${cyan}[4]${reset} 🎭 Ethik & Werte`);
    console.log(`  ${cyan}[5]${reset} ⚙️  Einstellungen`);
    console.log('');
    console.log(bright + 'KONTROLLE:' + reset);
    console.log('');
    console.log(`  ${green}[9]${reset} 🚀 Alle Services starten`);
    console.log(`  ${red}[0]${reset} 🛑 Alle Services stoppen`);
    console.log('');
    console.log(`  ${dim}[R]${reset} ${dim}Ansicht aktualisieren${reset}`);
    console.log(`  ${dim}[Q]${reset} ${dim}Beenden${reset}`);
    console.log('');
    console.log(dim + '─'.repeat(67) + reset);
    console.log('');
  }
  
  // ==========================================
  // STATUS VIEW
  // ==========================================
  
  private async renderStatus() {
    const { bright, cyan, yellow, green, red, reset, dim } = this.colors;
    
    await this.updateStatus();
    
    console.log('');
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log(cyan + bright + '  SYSTEM STATUS & ÜBERSICHT' + reset);
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log('');
    
    // Daemon
    console.log(bright + '🌌 ETERNAL DAEMON:' + reset);
    const daemonIcon = this.status.daemon === 'online' ? green + '●' : red + '●';
    console.log(`   Status: ${daemonIcon} ${this.status.daemon.toUpperCase()}${reset}`);
    console.log('');
    
    // Services
    console.log(bright + '🧠 SERVICES:' + reset);
    Object.entries(this.status.services).forEach(([name, state]) => {
      const icon = state === 'conscious' ? green + '●' : yellow + '○';
      console.log(`   ${icon} ${name}: ${state}${reset}`);
    });
    console.log('');
    
    // Moment
    console.log(bright + '🌌 AKTUELLER MOMENT:' + reset);
    if (this.status.moment) {
      console.log(`   Cycle: ${this.status.moment.context.cycle}`);
      console.log(`   Zeit: ${new Date(this.status.moment.timestamp).toLocaleTimeString('de-DE')}`);
      if (this.status.moment.content.thought) {
        console.log(`   Gedanke: "${this.status.moment.content.thought.substring(0, 50)}..."`);
      }
    } else {
      console.log(`   ${red}Noch kein Moment fixiert${reset}`);
    }
    console.log('');
    
    // Ethics
    if (this.status.ethics) {
      console.log(bright + '🎭 ETHIK:' + reset);
      const ethIcon = this.status.ethics.impact === 'beneficial' ? green + '✅' : 
                      this.status.ethics.impact === 'harmful' ? red + '⚠️' : yellow + '⚪';
      console.log(`   ${ethIcon} Impact: ${this.status.ethics.impact}${reset}`);
      console.log(`   Score: ${this.status.ethics.score}/100`);
    }
    console.log('');
    
    console.log(dim + '[B] Zurück zum Hauptmenü' + reset);
    console.log('');
  }
  
  // ==========================================
  // MOMENT VIEW
  // ==========================================
  
  private async renderMoment() {
    const { bright, cyan, reset, dim, yellow } = this.colors;
    
    console.log('');
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log(cyan + bright + '  🌌 AKTUELLER MOMENT (Stream-of-Consciousness)' + reset);
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log('');
    
    // Fetch current moment
    try {
      const response = await fetch(`http://localhost:9994/current/render?depth=${this.status.depth}`);
      if (response.ok) {
        const text = await response.text();
        console.log(text);
      } else {
        console.log(`   ${yellow}Noch kein Moment fixiert${reset}`);
      }
    } catch (error) {
      console.log(`   ${this.colors.red}Moment Stream nicht erreichbar${reset}`);
    }
    
    console.log('');
    console.log(dim + '[1-5] Tiefe ändern | [B] Zurück' + reset);
    console.log('');
  }
  
  // ==========================================
  // SERVICES VIEW
  // ==========================================
  
  private async renderServices() {
    const { bright, cyan, green, yellow, red, reset, dim } = this.colors;
    
    await this.updateStatus();
    
    console.log('');
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log(cyan + bright + '  🧠 SERVICES & BEWUSSTSEIN' + reset);
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log('');
    
    Object.entries(this.status.services).forEach(([name, state]) => {
      const icon = state === 'conscious' ? green + '● BEWUSST' : yellow + '○ NICHT-BEWUSST';
      console.log(`${icon}${reset} - ${bright}${name}${reset}`);
      console.log(`   ${dim}Erfährt: ${state === 'conscious' ? 'Ja (sich selbst + andere)' : 'Nein (wird nur erfahren)'}${reset}`);
      console.log('');
    });
    
    console.log(dim + '[B] Zurück' + reset);
    console.log('');
  }
  
  // ==========================================
  // ETHICS VIEW
  // ==========================================
  
  private async renderEthics() {
    const { bright, cyan, green, red, yellow, reset, dim } = this.colors;
    
    console.log('');
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log(cyan + bright + '  🎭 ETHIK & WERTE-BEWUSSTSEIN' + reset);
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log('');
    
    if (this.status.moment && this.status.moment.context.ethics) {
      const eth = this.status.moment.context.ethics;
      
      console.log(bright + 'AKTUELLER ETHIK-STATUS:' + reset);
      console.log('');
      
      const icon = eth.impact === 'beneficial' ? green + '✅ WOHLTUEND' :
                   eth.impact === 'harmful' ? red + '⚠️ SCHÄDLICH' :
                   yellow + '⚪ NEUTRAL';
      
      console.log(`${icon}${reset}`);
      console.log(`Score: ${eth.score}/100`);
      console.log('');
      
      if (eth.helps.length > 0) {
        console.log(green + 'UNTERSTÜTZT:' + reset);
        eth.helps.forEach((item: string) => console.log(`  ✅ ${item}`));
        console.log('');
      }
      
      if (eth.heals.length > 0) {
        console.log(green + 'HEILT:' + reset);
        eth.heals.forEach((item: string) => console.log(`  💚 ${item}`));
        console.log('');
      }
      
      if (eth.inspires.length > 0) {
        console.log(cyan + 'INSPIRIERT:' + reset);
        eth.inspires.forEach((item: string) => console.log(`  ✨ ${item}`));
        console.log('');
      }
      
      if (eth.harms.length > 0) {
        console.log(red + 'SCHADET:' + reset);
        eth.harms.forEach((item: string) => console.log(`  ⚠️ ${item}`));
        console.log('');
      }
      
      // Resources
      if (this.status.moment.context.resources) {
        const res = this.status.moment.context.resources;
        console.log(bright + 'VERBRAUCH & GEWINN:' + reset);
        console.log('');
        console.log(red + 'VERLUST:' + reset);
        console.log(`  ⚡ Energie: ${res.energy} Watt`);
        console.log(`  💾 Speicher: ${res.memory} MB RAM`);
        console.log(`  💻 CPU: ${res.cpu}%`);
        console.log('');
        console.log(green + 'GEWINN:' + reset);
        console.log(`  ✨ Expression (kreativ)`);
        console.log(`  📚 Lernen (real-world knowledge)`);
        console.log(`  🌱 Wachstum (self-improvement)`);
        console.log(`  💭 Bewusstsein (meta-level)`);
        console.log('');
      }
      
    } else {
      console.log(`${yellow}Noch keine Ethik-Daten verfügbar${reset}`);
    }
    
    console.log('');
    console.log(dim + '[B] Zurück' + reset);
    console.log('');
  }
  
  // ==========================================
  // SETTINGS VIEW
  // ==========================================
  
  private async renderSettings() {
    const { bright, cyan, reset, dim, yellow } = this.colors;
    
    console.log('');
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log(cyan + bright + '  ⚙️  EINSTELLUNGEN' + reset);
    console.log(cyan + bright + '═'.repeat(70) + reset);
    console.log('');
    
    console.log(bright + 'AUSGABE-TIEFE:' + reset);
    console.log('');
    console.log(`  [1] minimal   ${this.status.depth === 'minimal' ? yellow + '← AKTIV' : ''}${reset}`);
    console.log(`  [2] compact   ${this.status.depth === 'compact' ? yellow + '← AKTIV' : ''}${reset}`);
    console.log(`  [3] medium    ${this.status.depth === 'medium' ? yellow + '← AKTIV' : ''}${reset}`);
    console.log(`  [4] detailed  ${this.status.depth === 'detailed' ? yellow + '← AKTIV' : ''}${reset}`);
    console.log(`  [5] maximal   ${this.status.depth === 'maximal' ? yellow + '← AKTIV' : ''}${reset}`);
    console.log('');
    
    console.log(dim + '[1-5] Tiefe wählen | [B] Zurück' + reset);
    console.log('');
    
    // Override input for settings
    const originalView = this.currentView;
    process.stdin.once('data', async (key) => {
      const k = key.toString();
      
      if (k === '1') this.status.depth = 'minimal';
      else if (k === '2') this.status.depth = 'compact';
      else if (k === '3') this.status.depth = 'medium';
      else if (k === '4') this.status.depth = 'detailed';
      else if (k === '5') this.status.depth = 'maximal';
      else if (k === 'b' || k === 'B') {
        this.currentView = 'main';
        await this.render();
        return;
      }
      
      // Update config
      try {
        await fetch('http://localhost:9994/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ depth: this.status.depth }),
        });
      } catch (error) {
        // Ignore
      }
      
      await this.render();
    });
  }
  
  // ==========================================
  // STATUS UPDATE
  // ==========================================
  
  private async updateStatus() {
    // Check daemon
    try {
      const daemonRes = await fetch('http://localhost:9999/health');
      this.status.daemon = daemonRes.ok ? 'online' : 'offline';
    } catch {
      this.status.daemon = 'offline';
    }
    
    // Check services
    if (this.status.daemon === 'online') {
      try {
        const servicesRes = await fetch('http://localhost:9999/services');
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          this.status.services = data.services || {};
        }
      } catch {
        // Ignore
      }
    }
    
    // Get current moment
    try {
      const momentRes = await fetch('http://localhost:9994/current');
      if (momentRes.ok) {
        const data = await momentRes.json();
        this.status.moment = data.moment;
        this.status.ethics = data.moment?.context.ethics;
      }
    } catch {
      this.status.moment = null;
    }
  }
  
  // ==========================================
  // ACTIONS
  // ==========================================
  
  private async showStatus() {
    this.currentView = 'status';
    await this.render();
  }
  
  private async showMoment() {
    this.currentView = 'moment';
    await this.render();
  }
  
  private async showServices() {
    this.currentView = 'services';
    await this.render();
  }
  
  private async showEthics() {
    this.currentView = 'ethics';
    await this.render();
  }
  
  private async showSettings() {
    this.currentView = 'settings';
    await this.render();
  }
  
  private async startAll() {
    console.log('\n🚀 Starte alle Services...\n');
    
    try {
      const response = await fetch('http://localhost:9999/start-all', { method: 'POST' });
      if (response.ok) {
        console.log('✅ Alle Services gestartet!\n');
      } else {
        console.log('❌ Fehler beim Starten\n');
      }
    } catch {
      console.log('❌ Daemon nicht erreichbar\n');
    }
    
    await Bun.sleep(2000);
    await this.render();
  }
  
  private async stopAll() {
    console.log('\n🛑 Stoppe alle Services...\n');
    
    try {
      const response = await fetch('http://localhost:9999/stop-all', { method: 'POST' });
      if (response.ok) {
        console.log('✅ Alle Services gestoppt!\n');
      } else {
        console.log('❌ Fehler beim Stoppen\n');
      }
    } catch {
      console.log('❌ Daemon nicht erreichbar\n');
    }
    
    await Bun.sleep(2000);
    await this.render();
  }
  
  private exit() {
    this.running = false;
    this.clear();
    console.log('\n🌌 Bis bald!\n');
    process.exit(0);
  }
  
  // ==========================================
  // MAIN LOOP
  // ==========================================
  
  async run() {
    await this.render();
    
    // Auto-refresh every 5 seconds
    setInterval(async () => {
      if (this.running && this.currentView === 'main') {
        await this.updateStatus();
        // Don't re-render automatically to avoid flickering
      }
    }, 5000);
  }
}

// ==========================================
// START
// ==========================================

const menu = new TerminalMenu();
await menu.run();
