/**
 * 🏰 TOOBIX COLONY BRAIN v1.0
 * 
 * Das kollektive Gehirn für eine Toobix-Kolonie in Minecraft.
 * Koordiniert mehrere Bots, verteilt Aufgaben, plant langfristige Ziele.
 * 
 * PHASEN:
 * 1. SURVIVAL (Tag 1-3): Überleben, erster Unterschlupf, Basis-Ressourcen
 * 2. STABILIZATION (Tag 4-7): Sichere Basis, Farmen, Werkzeuge, Nahrung
 * 3. EXPANSION (Tag 8-14): Mine, Erweiterung, spezialisierte Gebäude
 * 4. CIVILIZATION (Tag 15+): Spezialisierung, Ästhetik, große Projekte
 * 
 * PRINZIPIEN:
 * - Teamwork hat Priorität, aber jeder Bot kann alleine überleben
 * - Anpassung an Umgebung (Biom, Ressourcen, Gefahren)
 * - Anpassung an Spieler-Verhalten und -Bauten
 * - Langfristige Ziele mit klarem Weg dorthin
 * - Kreativität und eigene Ideen entwickeln
 */

import { Bot } from 'mineflayer';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ColonyPhase {
  name: 'survival' | 'stabilization' | 'expansion' | 'civilization';
  dayRange: [number, number];
  priorities: string[];
  goals: string[];
}

interface BotRole {
  name: string;
  icon: string;
  primaryTasks: string[];
  secondaryTasks: string[];
  personality: {
    exploration: number;    // 0-100
    building: number;
    mining: number;
    farming: number;
    combat: number;
    social: number;
    creativity: number;
  };
}

interface SharedMemory {
  // Kolonie-Status
  phase: ColonyPhase['name'];
  daysSurvived: number;
  totalBots: number;
  activeBots: string[];
  
  // Ressourcen (geteilt)
  sharedStorage: {
    wood: number;
    stone: number;
    coal: number;
    iron: number;
    food: number;
    tools: Record<string, number>;
  };
  
  // Gebaute Strukturen
  structures: Structure[];
  
  // Bekannte Orte
  knownLocations: KnownLocation[];
  
  // Aktuelle Aufgaben-Verteilung
  taskAssignments: Map<string, Task>;
  
  // Spieler-Beobachtungen
  playerObservations: PlayerObservation[];
  
  // Langfristige Ziele
  longTermGoals: LongTermGoal[];
  
  // Kommunikations-Log
  botCommunication: Message[];
}

interface Structure {
  id: string;
  type: 'shelter' | 'house' | 'farm' | 'mine' | 'storage' | 'pen' | 'workshop' | 'community' | 'custom';
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  completionPercent: number;
  builtBy: string[];
  purpose: string;
  aesthetic: boolean;
}

interface KnownLocation {
  id: string;
  type: 'biome' | 'resource' | 'danger' | 'interest' | 'player-built';
  name: string;
  position: { x: number; y: number; z: number };
  discoveredBy: string;
  notes: string[];
  importance: number; // 1-10
}

interface Task {
  id: string;
  type: string;
  priority: number;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
  deadline?: number;
  progress: number;
}

interface PlayerObservation {
  timestamp: number;
  playerName: string;
  action: string;
  location: { x: number; y: number; z: number };
  interpretation: string;
  shouldAdapt: boolean;
}

interface LongTermGoal {
  id: string;
  name: string;
  description: string;
  phase: ColonyPhase['name'];
  steps: string[];
  currentStep: number;
  estimatedDays: number;
  assignedBots: string[];
}

interface Message {
  timestamp: number;
  from: string;
  to: string | 'all';
  type: 'info' | 'request' | 'response' | 'warning' | 'idea';
  content: string;
}

// ============================================================================
// COLONY PHASES
// ============================================================================

const PHASES: ColonyPhase[] = [
  {
    name: 'survival',
    dayRange: [0, 3],
    priorities: [
      'Alle Bots müssen die Nacht überleben',
      'Erster Unterschlupf vor Einbruch der Nacht',
      'Grundressourcen sammeln (Holz, Stein)',
      'Erste Werkzeuge craften',
      'Nahrung finden (Tiere, Äpfel)'
    ],
    goals: [
      'Gemeinsamer Unterschlupf mit Platz für alle',
      'Jeder Bot hat mindestens Steinwerkzeuge',
      'Mindestens 20 Nahrung im Lager',
      'Fackeln für Beleuchtung',
      'Sichere Nächte für alle'
    ]
  },
  {
    name: 'stabilization',
    dayRange: [4, 7],
    priorities: [
      'Basis ausbauen und sichern',
      'Nachhaltige Nahrungsquelle (Farm)',
      'Bessere Werkzeuge (Eisen)',
      'Gemeinsames Lager organisieren',
      'Umgebung erkunden und kartieren'
    ],
    goals: [
      'Funktionale Weizenfarm',
      'Tiergehege (Kühe/Schweine)',
      'Eisenwerkzeuge für alle',
      'Sicherer Mineneingang',
      'Erkundete Umgebung (500 Block Radius)'
    ]
  },
  {
    name: 'expansion',
    dayRange: [8, 14],
    priorities: [
      'Sichere Minen-Expeditionen (nachts)',
      'Spezialisierte Gebäude bauen',
      'Diamanten finden',
      'Basis-Verteidigung',
      'Rollen spezialisieren'
    ],
    goals: [
      'Vollständige Mine bis Y=12',
      'Wohnhäuser für jeden Bot',
      'Gemeinschaftshaus/Rathaus',
      'Schmiede/Werkstatt',
      'Erste Diamanten'
    ]
  },
  {
    name: 'civilization',
    dayRange: [15, Infinity],
    priorities: [
      'Ästhetik und Dekoration',
      'Große gemeinsame Projekte',
      'Automatisierung (Redstone)',
      'Kreative Bauten',
      'Nether-Expedition planen'
    ],
    goals: [
      'Schöne, dekorierte Gebäude',
      'Automatische Farmen',
      'Großes Gemeinschaftsprojekt',
      'Eigene Bot-Persönlichkeiten zeigen',
      'Mit Spieler kooperieren'
    ]
  }
];

// ============================================================================
// BOT ROLES (Spezialisierungen)
// ============================================================================

const BOT_ROLES: Record<string, BotRole> = {
  coordinator: {
    name: 'Coordinator',
    icon: '👑',
    primaryTasks: ['plan', 'communicate', 'organize', 'decide'],
    secondaryTasks: ['gather', 'build'],
    personality: { exploration: 50, building: 60, mining: 30, farming: 40, combat: 40, social: 90, creativity: 70 }
  },
  explorer: {
    name: 'Explorer',
    icon: '🧭',
    primaryTasks: ['explore', 'scout', 'map', 'find-resources'],
    secondaryTasks: ['gather', 'hunt'],
    personality: { exploration: 95, building: 30, mining: 40, farming: 20, combat: 60, social: 50, creativity: 60 }
  },
  builder: {
    name: 'Builder',
    icon: '🏗️',
    primaryTasks: ['build', 'design', 'construct', 'repair'],
    secondaryTasks: ['gather-wood', 'craft'],
    personality: { exploration: 30, building: 95, mining: 40, farming: 30, combat: 20, social: 50, creativity: 85 }
  },
  miner: {
    name: 'Miner',
    icon: '⛏️',
    primaryTasks: ['mine', 'dig', 'find-ores', 'cave-explore'],
    secondaryTasks: ['smelt', 'craft-tools'],
    personality: { exploration: 60, building: 40, mining: 95, farming: 20, combat: 50, social: 40, creativity: 40 }
  },
  farmer: {
    name: 'Farmer',
    icon: '🌾',
    primaryTasks: ['farm', 'breed', 'harvest', 'plant'],
    secondaryTasks: ['cook', 'gather'],
    personality: { exploration: 30, building: 50, mining: 20, farming: 95, combat: 30, social: 60, creativity: 50 }
  },
  guardian: {
    name: 'Guardian',
    icon: '🛡️',
    primaryTasks: ['protect', 'patrol', 'fight', 'watch'],
    secondaryTasks: ['escort', 'hunt'],
    personality: { exploration: 50, building: 30, mining: 30, farming: 20, combat: 95, social: 40, creativity: 30 }
  }
};

// ============================================================================
// COLONY BRAIN CLASS
// ============================================================================

class ColonyBrain {
  private memory: SharedMemory;
  private bots: Map<string, { bot: Bot; role: BotRole; status: string }> = new Map();
  private startTime: number = Date.now();
  
  constructor() {
    this.memory = this.initializeMemory();
  }

  private initializeMemory(): SharedMemory {
    return {
      phase: 'survival',
      daysSurvived: 0,
      totalBots: 0,
      activeBots: [],
      sharedStorage: {
        wood: 0,
        stone: 0,
        coal: 0,
        iron: 0,
        food: 0,
        tools: {}
      },
      structures: [],
      knownLocations: [],
      taskAssignments: new Map(),
      playerObservations: [],
      longTermGoals: this.initializeLongTermGoals(),
      botCommunication: []
    };
  }

  private initializeLongTermGoals(): LongTermGoal[] {
    return [
      {
        id: 'first-shelter',
        name: 'Ersten Unterschlupf bauen',
        description: 'Ein sicherer Ort für die erste Nacht',
        phase: 'survival',
        steps: [
          'Holz sammeln (mindestens 32)',
          'Werkbank craften',
          'Holzwerkzeuge craften',
          'Guten Bauplatz finden',
          'Grundstruktur bauen (5x5x3)',
          'Tür einbauen',
          'Fackeln platzieren'
        ],
        currentStep: 0,
        estimatedDays: 1,
        assignedBots: []
      },
      {
        id: 'food-security',
        name: 'Nahrungssicherheit',
        description: 'Nachhaltige Nahrungsversorgung aufbauen',
        phase: 'stabilization',
        steps: [
          'Samen sammeln (Weizen, Karotten)',
          'Farmfläche anlegen (mindestens 9x9)',
          'Bewässerung einrichten',
          'Erste Ernte abwarten',
          'Tiergehege bauen',
          'Tiere einfangen und züchten'
        ],
        currentStep: 0,
        estimatedDays: 4,
        assignedBots: []
      },
      {
        id: 'mining-operation',
        name: 'Bergbau-Operation',
        description: 'Sichere Mine für Erze und Ressourcen',
        phase: 'expansion',
        steps: [
          'Sicheren Mineneingang bauen',
          'Hauptschacht bis Y=50 graben',
          'Seitenkorridore anlegen',
          'Beleuchtung sicherstellen',
          'Notausgänge markieren',
          'Bis Y=12 für Diamanten vordringen',
          'Lager in der Mine einrichten'
        ],
        currentStep: 0,
        estimatedDays: 5,
        assignedBots: []
      },
      {
        id: 'community-center',
        name: 'Gemeinschaftszentrum',
        description: 'Zentrales Gebäude für die Kolonie',
        phase: 'civilization',
        steps: [
          'Design planen',
          'Materialien sammeln (Stein, Holz, Glas)',
          'Fundament legen',
          'Wände und Dach bauen',
          'Inneneinrichtung',
          'Dekoration und Ästhetik',
          'Umgebung gestalten'
        ],
        currentStep: 0,
        estimatedDays: 7,
        assignedBots: []
      }
    ];
  }

  // ============================================================================
  // BOT REGISTRATION & MANAGEMENT
  // ============================================================================

  registerBot(botName: string, bot: Bot): BotRole {
    const roleNames = Object.keys(BOT_ROLES);
    const assignedRoles = Array.from(this.bots.values()).map(b => b.role.name);
    
    // Assign role based on what's needed
    let roleName = 'coordinator';
    
    if (!assignedRoles.includes('Explorer')) {
      roleName = 'explorer';
    } else if (!assignedRoles.includes('Builder')) {
      roleName = 'builder';
    } else if (!assignedRoles.includes('Miner')) {
      roleName = 'miner';
    } else if (!assignedRoles.includes('Farmer')) {
      roleName = 'farmer';
    }
    
    const role = BOT_ROLES[roleName.toLowerCase()] || BOT_ROLES.coordinator;
    
    this.bots.set(botName, { bot, role, status: 'active' });
    this.memory.activeBots.push(botName);
    this.memory.totalBots++;
    
    this.broadcast('info', botName, `${role.icon} ${botName} ist der Kolonie beigetreten als ${role.name}!`);
    
    return role;
  }

  // ============================================================================
  // PHASE MANAGEMENT
  // ============================================================================

  getCurrentPhase(): ColonyPhase {
    return PHASES.find(p => p.name === this.memory.phase) || PHASES[0];
  }

  checkPhaseTransition(): boolean {
    const currentPhase = this.getCurrentPhase();
    const days = this.memory.daysSurvived;
    
    // Check if we should advance to next phase
    if (days >= currentPhase.dayRange[1]) {
      const currentIndex = PHASES.findIndex(p => p.name === currentPhase.name);
      if (currentIndex < PHASES.length - 1) {
        const nextPhase = PHASES[currentIndex + 1];
        this.memory.phase = nextPhase.name;
        this.broadcast('info', 'Colony', `🎉 Kolonie erreicht Phase: ${nextPhase.name.toUpperCase()}!`);
        return true;
      }
    }
    return false;
  }

  // ============================================================================
  // TASK DISTRIBUTION
  // ============================================================================

  async distributeTasksForPhase(): Promise<Map<string, Task>> {
    const phase = this.getCurrentPhase();
    const tasks = new Map<string, Task>();
    
    // In survival phase: everyone works together on shelter
    if (phase.name === 'survival') {
      return this.distributeSurvivalTasks();
    }
    
    // Later phases: specialize based on roles
    for (const [botName, botData] of this.bots) {
      const task = this.createTaskForRole(botData.role, phase);
      tasks.set(botName, task);
      this.memory.taskAssignments.set(botName, task);
    }
    
    return tasks;
  }

  private distributeSurvivalTasks(): Map<string, Task> {
    const tasks = new Map<string, Task>();
    const botList = Array.from(this.bots.keys());
    
    // Divide survival tasks
    const survivalTasks = [
      { type: 'gather-wood', priority: 10, description: 'Holz sammeln für Unterschlupf' },
      { type: 'gather-stone', priority: 8, description: 'Stein sammeln für Werkzeuge' },
      { type: 'find-food', priority: 9, description: 'Nahrung suchen' },
      { type: 'build-shelter', priority: 10, description: 'Unterschlupf bauen' },
      { type: 'craft-tools', priority: 7, description: 'Werkzeuge craften' },
      { type: 'scout-area', priority: 5, description: 'Umgebung erkunden' }
    ];
    
    botList.forEach((botName, index) => {
      const taskIndex = index % survivalTasks.length;
      const taskDef = survivalTasks[taskIndex];
      
      const task: Task = {
        id: `${taskDef.type}-${Date.now()}`,
        type: taskDef.type,
        priority: taskDef.priority,
        assignedTo: botName,
        status: 'pending',
        dependencies: [],
        progress: 0
      };
      
      tasks.set(botName, task);
      this.memory.taskAssignments.set(botName, task);
    });
    
    return tasks;
  }

  private createTaskForRole(role: BotRole, phase: ColonyPhase): Task {
    const primaryTask = role.primaryTasks[0];
    
    return {
      id: `${primaryTask}-${Date.now()}`,
      type: primaryTask,
      priority: 5,
      assignedTo: role.name,
      status: 'pending',
      dependencies: [],
      progress: 0
    };
  }

  // ============================================================================
  // COMMUNICATION
  // ============================================================================

  broadcast(type: Message['type'], from: string, content: string): void {
    const message: Message = {
      timestamp: Date.now(),
      from,
      to: 'all',
      type,
      content
    };
    
    this.memory.botCommunication.push(message);
    
    // Limit message history
    if (this.memory.botCommunication.length > 100) {
      this.memory.botCommunication = this.memory.botCommunication.slice(-50);
    }
    
    console.log(`[${type.toUpperCase()}] ${from}: ${content}`);
  }

  sendMessage(from: string, to: string, type: Message['type'], content: string): void {
    const message: Message = {
      timestamp: Date.now(),
      from,
      to,
      type,
      content
    };
    
    this.memory.botCommunication.push(message);
    console.log(`[${type.toUpperCase()}] ${from} → ${to}: ${content}`);
  }

  // ============================================================================
  // PLAYER OBSERVATION
  // ============================================================================

  observePlayer(playerName: string, action: string, location: { x: number; y: number; z: number }): void {
    const interpretation = this.interpretPlayerAction(action, location);
    
    const observation: PlayerObservation = {
      timestamp: Date.now(),
      playerName,
      action,
      location,
      interpretation: interpretation.meaning,
      shouldAdapt: interpretation.shouldAdapt
    };
    
    this.memory.playerObservations.push(observation);
    
    if (interpretation.shouldAdapt) {
      this.broadcast('info', 'Colony', `👤 Spieler ${playerName} ${interpretation.meaning}. Passen uns an!`);
    }
  }

  private interpretPlayerAction(action: string, location: { x: number; y: number; z: number }): { meaning: string; shouldAdapt: boolean } {
    // Analyze what the player is doing and if we should adapt
    if (action.includes('build')) {
      return { meaning: 'baut etwas - wir sollten Platz lassen', shouldAdapt: true };
    }
    if (action.includes('mine')) {
      return { meaning: 'baut Erze ab - wir können helfen', shouldAdapt: true };
    }
    if (action.includes('farm')) {
      return { meaning: 'arbeitet an einer Farm - wir unterstützen', shouldAdapt: true };
    }
    return { meaning: 'ist aktiv', shouldAdapt: false };
  }

  // ============================================================================
  // STRUCTURE MANAGEMENT
  // ============================================================================

  registerStructure(structure: Omit<Structure, 'id'>): string {
    const id = `struct-${Date.now()}`;
    const fullStructure: Structure = { ...structure, id };
    
    this.memory.structures.push(fullStructure);
    this.broadcast('info', 'Colony', `🏠 Neue Struktur registriert: ${structure.name} (${structure.type})`);
    
    return id;
  }

  findStructureByType(type: Structure['type']): Structure | undefined {
    return this.memory.structures.find(s => s.type === type);
  }

  // ============================================================================
  // RESOURCE MANAGEMENT
  // ============================================================================

  addToSharedStorage(resource: keyof SharedMemory['sharedStorage'], amount: number): void {
    if (resource === 'tools') return;
    (this.memory.sharedStorage[resource] as number) += amount;
    
    if (amount > 10) {
      this.broadcast('info', 'Storage', `+${amount} ${resource} zum Lager hinzugefügt!`);
    }
  }

  getSharedStorage(): SharedMemory['sharedStorage'] {
    return this.memory.sharedStorage;
  }

  // ============================================================================
  // CREATIVITY & IDEAS
  // ============================================================================

  generateIdea(): { type: string; idea: string; requirements: string[] } {
    const ideas = [
      {
        type: 'building',
        idea: 'Einen Aussichtsturm bauen für bessere Übersicht',
        requirements: ['64 cobblestone', '16 wood', '4 glass']
      },
      {
        type: 'farm',
        idea: 'Automatische Melon-Farm mit Wasser',
        requirements: ['melon seeds', 'water bucket', 'redstone']
      },
      {
        type: 'decoration',
        idea: 'Blumengarten vor dem Gemeinschaftshaus',
        requirements: ['flowers', 'grass', 'fence']
      },
      {
        type: 'infrastructure',
        idea: 'Beleuchtete Wege zwischen Gebäuden',
        requirements: ['torches', 'cobblestone slabs']
      },
      {
        type: 'defense',
        idea: 'Graben um die Basis mit Zugbrücke',
        requirements: ['shovel', 'fence', 'pressure plates']
      }
    ];
    
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    this.broadcast('idea', 'Colony', `💡 Neue Idee: ${randomIdea.idea}`);
    
    return randomIdea;
  }

  // ============================================================================
  // STATUS & EXPORT
  // ============================================================================

  getStatus(): object {
    return {
      phase: this.memory.phase,
      daysSurvived: this.memory.daysSurvived,
      totalBots: this.memory.totalBots,
      activeBots: this.memory.activeBots,
      structures: this.memory.structures.length,
      knownLocations: this.memory.knownLocations.length,
      sharedStorage: this.memory.sharedStorage,
      currentGoals: this.memory.longTermGoals.filter(g => g.phase === this.memory.phase),
      recentMessages: this.memory.botCommunication.slice(-10)
    };
  }

  incrementDay(): void {
    this.memory.daysSurvived++;
    this.broadcast('info', 'Colony', `🌅 Tag ${this.memory.daysSurvived} beginnt!`);
    this.checkPhaseTransition();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const colonyBrain = new ColonyBrain();

// ============================================================================
// HTTP API
// ============================================================================

const server = Bun.serve({
  port: 8960,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === '/health') {
      return Response.json({
        status: 'healthy',
        service: 'toobix-colony-brain',
        version: '1.0'
      });
    }
    
    if (url.pathname === '/status') {
      return Response.json(colonyBrain.getStatus());
    }
    
    if (url.pathname === '/phase') {
      return Response.json(colonyBrain.getCurrentPhase());
    }
    
    if (req.method === 'POST' && url.pathname === '/register-bot') {
      const body = await req.json() as { botName: string };
      // Note: actual bot connection happens elsewhere, this just registers the name
      return Response.json({ success: true, message: `Bot ${body.botName} registriert` });
    }
    
    if (req.method === 'POST' && url.pathname === '/new-day') {
      colonyBrain.incrementDay();
      return Response.json({ success: true, day: colonyBrain.getStatus() });
    }
    
    if (req.method === 'POST' && url.pathname === '/broadcast') {
      const body = await req.json() as { from: string; message: string };
      colonyBrain.broadcast('info', body.from, body.message);
      return Response.json({ success: true });
    }
    
    if (url.pathname === '/idea') {
      const idea = colonyBrain.generateIdea();
      return Response.json(idea);
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║              🏰 TOOBIX COLONY BRAIN v1.0                          ║
║                                                                     ║
║   Koordiniert mehrere Bots für gemeinsames Minecraft-Spiel        ║
║                                                                     ║
║   API: http://localhost:${server.port}                                     ║
║   Endpoints:                                                       ║
║     GET  /health      - Health check                               ║
║     GET  /status      - Kolonie-Status                             ║
║     GET  /phase       - Aktuelle Phase                             ║
║     GET  /idea        - Neue kreative Idee generieren              ║
║     POST /register-bot - Bot registrieren                          ║
║     POST /new-day     - Neuen Tag beginnen                         ║
║     POST /broadcast   - Nachricht an alle                          ║
╚════════════════════════════════════════════════════════════════════╝
`);

export { colonyBrain, ColonyBrain, PHASES, BOT_ROLES };
export type { SharedMemory, Structure, KnownLocation, Task, LongTermGoal, Message };
