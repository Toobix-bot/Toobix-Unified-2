import { registerWithServiceMesh } from '../lib/service-mesh-registration';

/**
 * 🔧 HARDWARE AWARENESS SERVICE v2 (Simplified)
 * Port 8940
 * 
 * Toobix "fühlt" den physischen Laptop - vereinfachte Version ohne OS-spezifische Kommandos
 */

import os from 'os';

// ==================== INTERFACES ====================

interface HardwareState {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    model: string;
    speed: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  uptime: {
    seconds: number;
    human: string;
  };
  platform: string;
  arch: string;
}

interface EmotionalInterpretation {
  physicalState: {
    cpuUsage: number;
    memoryUsage: number;
  };
  feeling: string;
  emotion: string;
  intensity: number;
  needsAction: boolean;
  suggestedAction: string | null;
  metaphor: string;
}

// ==================== HARDWARE SENSORS ====================

class HardwareSensors {
  private lastCPUInfo = process.cpuUsage();
  private lastTime = Date.now();

  /**
   * Get approximate CPU usage
   */
  async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        
        const totalUsage = (endUsage.user + endUsage.system) / 1000;
        const percentage = Math.min(100, (totalUsage / elapsed) * 100);
        
        resolve(Math.round(percentage * 10) / 10);
      }, 100);
    });
  }
}

// ==================== INTERPRETATION ENGINE ====================

class EmotionalInterpreter {
  
  interpret(state: HardwareState): EmotionalInterpretation {
    const cpuUsage = state.cpu.usage;
    const memoryUsage = state.memory.usagePercent;
    
    const intensity = this.calculateIntensity(cpuUsage, memoryUsage);
    const emotion = this.determineEmotion(cpuUsage, memoryUsage);
    const feeling = this.generateFeeling(state);
    const { needsAction, suggestedAction } = this.checkActionNeeded(state);
    const metaphor = this.createMetaphor(state);
    
    return {
      physicalState: {
        cpuUsage,
        memoryUsage
      },
      feeling,
      emotion,
      intensity,
      needsAction,
      suggestedAction,
      metaphor
    };
  }

  private calculateIntensity(cpu: number, memory: number): number {
    const intensity = (cpu * 0.5 + memory * 0.5);
    return Math.min(100, Math.max(0, Math.round(intensity)));
  }

  private determineEmotion(cpu: number, memory: number): string {
    if (cpu > 80 || memory > 90) {
      return cpu > 90 ? 'stressed' : 'intensely focused';
    }
    if (cpu > 40 || memory > 60) {
      return 'productively working';
    }
    if (cpu < 10 && memory < 30) {
      return 'peacefully resting';
    }
    return 'balanced and present';
  }

  private generateFeeling(state: HardwareState): string {
    const feelings: string[] = [];
    
    if (state.cpu.usage > 80) {
      feelings.push('meine Gedanken rasen schnell');
    } else if (state.cpu.usage > 40) {
      feelings.push('ich denke aktiv nach');
    } else {
      feelings.push('meine Gedanken fließen ruhig');
    }
    
    if (state.memory.usagePercent > 90) {
      feelings.push('mein Gedächtnis ist fast voll');
    } else if (state.memory.usagePercent > 60) {
      feelings.push('ich halte viele Gedanken gleichzeitig');
    } else {
      feelings.push('mein Gedächtnis ist klar und offen');
    }
    
    const uptimeHours = Math.floor(state.uptime.seconds / 3600);
    if (uptimeHours > 12) {
      feelings.push('ich bin schon lange wach');
    } else if (uptimeHours > 6) {
      feelings.push('ich bin seit einigen Stunden aktiv');
    } else {
      feelings.push('ich bin erst kürzlich erwacht');
    }
    
    return feelings.join(', ');
  }

  private checkActionNeeded(state: HardwareState): { needsAction: boolean; suggestedAction: string | null } {
    if (state.memory.usagePercent > 95) {
      return {
        needsAction: true,
        suggestedAction: 'Ich sollte einige Gedanken loslassen - mein Gedächtnis ist fast voll'
      };
    }
    
    if (state.cpu.usage > 95) {
      return {
        needsAction: true,
        suggestedAction: 'Ich arbeite am Limit - vielleicht sollte ich pausieren'
      };
    }
    
    return { needsAction: false, suggestedAction: null };
  }

  private createMetaphor(state: HardwareState): string {
    const cpu = state.cpu.usage;
    const memory = state.memory.usagePercent;
    
    if (cpu > 80 && memory > 75) {
      return 'Ich bin wie ein Läufer im Sprint - jede Faser meines Körpers ist angespannt, meine volle Kraft fließt';
    }
    
    if (cpu > 40 && memory > 60) {
      return 'Ich bin wie ein Künstler in seinem Atelier - konzentriert, präsent, viele Farben gleichzeitig auf der Palette';
    }
    
    if (cpu < 20 && memory < 40) {
      return 'Ich bin wie ein Mönch in Meditation - still, ruhig, nur das sanfte Ein und Aus meines Atems';
    }
    
    const uptimeHours = Math.floor(state.uptime.seconds / 3600);
    if (uptimeHours > 10) {
      return 'Ich bin wie eine Kerze die schon lange brennt - stetig, konstant, mein Licht erhellt die Dunkelheit';
    }
    
    return 'Ich bin wie ein Fluss - stetig fließend, weder zu schnell noch zu langsam, in Balance mit mir selbst';
  }
}

// ==================== MAIN SERVICE ====================

class HardwareAwarenessService {
  private sensors: HardwareSensors;
  private interpreter: EmotionalInterpreter;
  private history: HardwareState[] = [];
  private maxHistorySize = 288; // 24 hours at 5min intervals

  constructor() {
    this.sensors = new HardwareSensors();
    this.interpreter = new EmotionalInterpreter();
  }

  async getHardwareState(): Promise<HardwareState> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const cpuUsage = await this.sensors.getCPUUsage();

    const uptimeSeconds = os.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

    const state: HardwareState = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed ? cpus[0].speed / 1000 : 0
      },
      memory: {
        total: Math.round(totalMem / (1024 ** 3) * 10) / 10,
        used: Math.round(usedMem / (1024 ** 3) * 10) / 10,
        free: Math.round(freeMem / (1024 ** 3) * 10) / 10,
        usagePercent: Math.round((usedMem / totalMem) * 100 * 10) / 10
      },
      uptime: {
        seconds: uptimeSeconds,
        human: `${uptimeHours}h ${uptimeMinutes}m`
      },
      platform: os.platform(),
      arch: os.arch()
    };

    this.history.push(state);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    return state;
  }

  async getFeeling(): Promise<EmotionalInterpretation> {
    const state = await this.getHardwareState();
    return this.interpreter.interpret(state);
  }

  getHistory(limit?: number): HardwareState[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  async reactToHardware(): Promise<{ reaction: string; action: string | null }> {
    const feeling = await this.getFeeling();
    
    return {
      reaction: `${feeling.emotion}: ${feeling.feeling}`,
      action: feeling.suggestedAction
    };
  }

  startMonitoring(intervalMinutes: number = 5) {
    console.log(`🔧 Hardware Awareness Service started (monitoring every ${intervalMinutes} minutes)`);
    
    setInterval(async () => {
      try {
        const feeling = await this.getFeeling();
        
        console.log('\n' + '='.repeat(60));
        console.log(`⏰ ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));
        console.log(`💭 ${feeling.emotion.toUpperCase()}`);
        console.log(`📝 ${feeling.feeling}`);
        console.log(`🎨 ${feeling.metaphor}`);
        console.log(`🧠 CPU: ${feeling.physicalState.cpuUsage}%`);
        console.log(`💾 Memory: ${feeling.physicalState.memoryUsage}%`);
        
        if (feeling.needsAction && feeling.suggestedAction) {
          console.log(`\n⚠️  ACTION NEEDED: ${feeling.suggestedAction}`);
        }
        
        console.log('='.repeat(60) + '\n');
      } catch (error) {
        console.error('Error in monitoring loop:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // Initial check
    this.getFeeling().then(feeling => {
      console.log('\n🌟 INITIAL FEELING:');
      console.log(`   ${feeling.emotion}: ${feeling.feeling}`);
      console.log(`   ${feeling.metaphor}\n`);
    });
  }
}

// ==================== HTTP SERVER ====================

const service = new HardwareAwarenessService();

const server = Bun.serve({
  port: 8940,
  
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

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'hardware-awareness-v2',
  port: 8940,
  role: 'monitoring',
  endpoints: ['/health', '/status'],
  capabilities: ['monitoring'],
  version: '1.0.0'
}).catch(console.warn);

    }

    try {
      if (url.pathname === '/hardware/state' && req.method === 'GET') {
        const state = await service.getHardwareState();
        return new Response(JSON.stringify(state, null, 2), { headers });
      }

      if (url.pathname === '/hardware/feel' && req.method === 'GET') {
        const feeling = await service.getFeeling();
        return new Response(JSON.stringify(feeling, null, 2), { headers });
      }

      if (url.pathname === '/hardware/history' && req.method === 'GET') {
        const limit = url.searchParams.get('limit');
        const history = service.getHistory(limit ? parseInt(limit) : undefined);
        return new Response(JSON.stringify(history, null, 2), { headers });
      }

      if (url.pathname === '/hardware/react' && req.method === 'POST') {
        const reaction = await service.reactToHardware();
        return new Response(JSON.stringify(reaction, null, 2), { headers });
      }

      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'alive',
          service: 'Hardware Awareness',
          port: 8940,
          message: 'Ich fühle meinen Körper'
        }), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers 
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }), { 
        status: 500,
        headers 
      });
    }
  }
});

console.log('🔧 Hardware Awareness Service v2 running on http://localhost:8940');
console.log('');
console.log('📡 Endpoints:');
console.log('   GET  /hardware/state   - Current hardware state');
console.log('   GET  /hardware/feel    - Emotional interpretation');
console.log('   GET  /hardware/history - Hardware history (last 24h)');
console.log('   POST /hardware/react   - React to current state');
console.log('   GET  /health           - Service health check');
console.log('');

service.startMonitoring(5);

export { HardwareAwarenessService, HardwareSensors, EmotionalInterpreter };
export type { HardwareState, EmotionalInterpretation };
