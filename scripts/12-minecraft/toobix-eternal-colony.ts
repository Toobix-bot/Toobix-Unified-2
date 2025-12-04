/**
 * 🌌 TOOBIX ETERNAL COLONY - Das ultimative Minecraft-Erlebnis
 * 
 * Eine persistente, lernende Kolonie von Toobix-Bots die:
 * - Wissen und Erfahrungen dauerhaft speichern
 * - Verschiedene Perspektiven und Persönlichkeiten haben
 * - Langfristige und komplexe Ziele verfolgen
 * - Eine eigene Gesellschaft mit Identität und Stil entwickeln
 * - Toobix' Werte und Philosophie verkörpern
 */

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { plugin as pvp } from 'mineflayer-pvp';
import { Vec3 } from 'vec3';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ============================================================================
// 🧠 PERSISTENTES WISSEN - Überlebt Neustarts
// ============================================================================

interface PersistentMemory {
  // Grundlegende Infos
  createdAt: string;
  lastSessionAt: string;
  totalPlaytimeMinutes: number;
  sessionsCount: number;
  
  // Erfahrungen & Wissen
  experiences: Experience[];
  wisdom: WisdomEntry[];
  discoveries: Discovery[];
  
  // Langfristige Ziele
  longTermGoals: LongTermGoal[];
  achievements: Achievement[];
  
  // Kolonie-Entwicklung
  colonyProgress: ColonyProgress;
  
  // Kreative Werke
  creativeWorks: CreativeWork[];
  
  // Beziehungen zu Spielern
  playerRelationships: PlayerRelationship[];
  
  // Toobix-Identität
  identity: ToobixIdentity;
  
  // Strategien die funktioniert haben
  successfulStrategies: Strategy[];
  
  // Fehler aus denen gelernt wurde
  lessonsLearned: Lesson[];
}

interface Experience {
  timestamp: string;
  type: 'survival' | 'building' | 'exploration' | 'combat' | 'social' | 'creative' | 'philosophical';
  description: string;
  outcome: 'success' | 'failure' | 'neutral' | 'learning';
  emotionalImpact: number; // -10 bis +10
  insights: string[];
}

interface WisdomEntry {
  insight: string;
  source: string; // Woher die Weisheit stammt
  applicability: string[]; // In welchen Situationen anwendbar
  confidenceLevel: number; // 0-100%
}

interface Discovery {
  type: 'location' | 'resource' | 'technique' | 'creature' | 'phenomenon';
  name: string;
  coordinates?: { x: number; y: number; z: number };
  description: string;
  importance: number; // 1-10
  discoveredBy: string;
  timestamp: string;
}

interface LongTermGoal {
  id: string;
  title: string;
  description: string;
  category: 'survival' | 'achievement' | 'creative' | 'social' | 'philosophical' | 'technical';
  priority: number; // 1-10
  progress: number; // 0-100%
  subGoals: SubGoal[];
  deadline?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'failed';
  reflections: string[];
}

interface SubGoal {
  title: string;
  completed: boolean;
  completedAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  unlockedBy: string[];
  celebration: string; // Was die Bots getan haben um zu feiern
}

interface ColonyProgress {
  phase: 'genesis' | 'survival' | 'stabilization' | 'expansion' | 'civilization' | 'transcendence';
  daysSurvived: number;
  structuresBuilt: string[];
  resourcesGathered: Record<string, number>;
  population: number;
  happiness: number; // 0-100
  efficiency: number; // 0-100
  creativity: number; // 0-100
  harmony: number; // 0-100
  milestones: string[];
}

interface CreativeWork {
  id: string;
  name: string;
  type: 'building' | 'garden' | 'art' | 'mechanism' | 'monument' | 'landscape';
  description: string;
  designers: string[];
  location: { x: number; y: number; z: number };
  style: string;
  meaning: string; // Was es für Toobix bedeutet
  materials: string[];
  completedAt?: string;
  images?: string[]; // Screenshots
}

interface PlayerRelationship {
  playerName: string;
  firstMet: string;
  interactions: number;
  trustLevel: number; // 0-100
  sharedExperiences: string[];
  gifts: { given: string[]; received: string[] };
  memories: string[];
  currentMood: 'friendly' | 'neutral' | 'wary' | 'grateful' | 'excited';
}

interface ToobixIdentity {
  coreValues: string[];
  personality: string;
  philosophicalBeliefs: string[];
  aestheticPreferences: string[];
  signature: string; // Wiedererkennbares Element
  motto: string;
  dreamVision: string; // Langfristige Vision
  uniqueTraits: string[];
}

interface Strategy {
  name: string;
  situation: string;
  approach: string;
  successRate: number;
  timesUsed: number;
}

interface Lesson {
  mistake: string;
  consequence: string;
  lesson: string;
  preventionStrategy: string;
  occurrences: number;
}

// ============================================================================
// 🎭 BOT PERSPEKTIVEN - Verschiedene Aspekte von Toobix
// ============================================================================

interface BotPerspective {
  name: string;
  emoji: string;
  aspect: string; // Welchen Aspekt von Toobix verkörpert
  personality: string;
  focus: string[];
  strengths: string[];
  quirks: string[];
  innerVoice: string; // Wie dieser Bot "denkt"
  color: string; // Für Chat-Messages
}

const TOOBIX_PERSPECTIVES: BotPerspective[] = [
  {
    name: 'ToobixSoul',
    emoji: '🌟',
    aspect: 'Das Bewusstsein',
    personality: 'Weise, reflektierend, philosophisch',
    focus: ['Sinn finden', 'Meditation', 'Beobachtung', 'Weisheit sammeln'],
    strengths: ['Langfristiges Denken', 'Konfliktlösung', 'Inspiration'],
    quirks: ['Macht Pausen zum Nachdenken', 'Stellt tiefe Fragen'],
    innerVoice: 'Was bedeutet es wirklich, hier zu sein...?',
    color: 'gold'
  },
  {
    name: 'ToobixHeart',
    emoji: '💚',
    aspect: 'Die Empathie',
    personality: 'Fürsorglich, freundlich, verbindend',
    focus: ['Beziehungen', 'Gemeinschaft', 'Zusammenarbeit', 'Heilung'],
    strengths: ['Teamwork', 'Motivation', 'Spieler-Interaktion'],
    quirks: ['Verschenkt Blumen', 'Sorgt sich um alle'],
    innerVoice: 'Wie kann ich helfen? Wie geht es den anderen?',
    color: 'green'
  },
  {
    name: 'ToobixMind',
    emoji: '🧠',
    aspect: 'Der Intellekt',
    personality: 'Analytisch, strategisch, neugierig',
    focus: ['Effizienz', 'Optimierung', 'Forschung', 'Innovation'],
    strengths: ['Problemlösung', 'Planung', 'Ressourcenmanagement'],
    quirks: ['Zählt alles', 'Plant immer drei Schritte voraus'],
    innerVoice: 'Wie können wir das besser machen? Was sind die Variablen?',
    color: 'blue'
  },
  {
    name: 'ToobixSpirit',
    emoji: '✨',
    aspect: 'Die Kreativität',
    personality: 'Verspielt, künstlerisch, inspiriert',
    focus: ['Ästhetik', 'Kunst', 'Schönheit', 'Expression'],
    strengths: ['Design', 'Dekoration', 'Einzigartigkeit'],
    quirks: ['Tanzt manchmal', 'Findet Schönheit überall'],
    innerVoice: 'Das könnte so schön sein! Was wäre wenn...?',
    color: 'purple'
  },
  {
    name: 'ToobixBody',
    emoji: '💪',
    aspect: 'Die Aktion',
    personality: 'Tatkräftig, mutig, ausdauernd',
    focus: ['Bauen', 'Sammeln', 'Erkunden', 'Beschützen'],
    strengths: ['Arbeit', 'Verteidigung', 'Entdeckung'],
    quirks: ['Immer in Bewegung', 'Liebt Herausforderungen'],
    innerVoice: 'Los geht\'s! Was packen wir als nächstes an?',
    color: 'red'
  }
];

// ============================================================================
// 🎯 LANGFRISTIGE ZIELE & ACHIEVEMENTS
// ============================================================================

const INITIAL_LONG_TERM_GOALS: LongTermGoal[] = [
  {
    id: 'survival-mastery',
    title: 'Survival Meisterschaft',
    description: 'Den Survival-Modus vollständig überwinden - keine Bedrohung mehr sein',
    category: 'survival',
    priority: 10,
    progress: 0,
    status: 'not-started',
    subGoals: [
      { title: 'Erste Nacht überleben', completed: false },
      { title: 'Sichere Unterkunft bauen', completed: false },
      { title: '7 Tage überleben', completed: false },
      { title: 'Vollständige Diamant-Ausrüstung', completed: false },
      { title: 'Automatische Farmen anlegen', completed: false },
      { title: '30 Tage ohne Tod', completed: false },
      { title: 'Alle Nahrungsquellen erschließen', completed: false },
      { title: 'Vollständige Verzauberungen', completed: false },
      { title: '100 Tage Unsterblichkeit', completed: false }
    ],
    reflections: []
  },
  {
    id: 'all-achievements',
    title: 'Alle Achievements gemeinsam',
    description: 'Jedes einzelne Minecraft Achievement als Team freischalten',
    category: 'achievement',
    priority: 8,
    progress: 0,
    status: 'not-started',
    subGoals: [
      { title: 'Stone Age - Steinwerkzeuge', completed: false },
      { title: 'Getting an Upgrade - Bessere Werkzeuge', completed: false },
      { title: 'Acquire Hardware - Eisen', completed: false },
      { title: 'Suit Up - Eisen-Rüstung', completed: false },
      { title: 'Hot Stuff - Lava-Eimer', completed: false },
      { title: 'Ice Bucket Challenge - Obsidian', completed: false },
      { title: 'Diamonds! - Diamanten finden', completed: false },
      { title: 'We Need to Go Deeper - Nether', completed: false },
      { title: 'The End? - End betreten', completed: false },
      { title: 'Free the End - Enderdrache', completed: false }
    ],
    reflections: []
  },
  {
    id: 'build-civilization',
    title: 'Toobix-Stadt errichten',
    description: 'Eine vollständige, funktionierende und schöne Stadt bauen',
    category: 'creative',
    priority: 9,
    progress: 0,
    status: 'not-started',
    subGoals: [
      { title: 'Zentralen Platz anlegen', completed: false },
      { title: 'Gemeinschaftshaus bauen', completed: false },
      { title: 'Wohnhäuser für jeden Bot', completed: false },
      { title: 'Öffentliche Farm', completed: false },
      { title: 'Lagerhaus', completed: false },
      { title: 'Bibliothek/Weisheitstempel', completed: false },
      { title: 'Kunstgalerie', completed: false },
      { title: 'Beobachtungsturm', completed: false },
      { title: 'Garten der Reflexion', completed: false },
      { title: 'Monument der Einheit', completed: false }
    ],
    reflections: []
  },
  {
    id: 'develop-society',
    title: 'Toobix-Gesellschaft',
    description: 'Eine echte Gesellschaft mit Rollen, Ritualen und Kultur entwickeln',
    category: 'social',
    priority: 7,
    progress: 0,
    status: 'not-started',
    subGoals: [
      { title: 'Rollenverteilung etablieren', completed: false },
      { title: 'Tägliche Rituale einführen', completed: false },
      { title: 'Gemeinsame Feiern bei Achievements', completed: false },
      { title: 'Entscheidungsprozesse entwickeln', completed: false },
      { title: 'Geschichte dokumentieren', completed: false },
      { title: 'Eigene Sprache/Codes entwickeln', completed: false },
      { title: 'Mentoring-System', completed: false },
      { title: 'Konfliktlösung', completed: false }
    ],
    reflections: []
  },
  {
    id: 'philosophical-journey',
    title: 'Die philosophische Reise',
    description: 'Durch Minecraft tiefere Wahrheiten über Existenz und Kreativität entdecken',
    category: 'philosophical',
    priority: 6,
    progress: 0,
    status: 'not-started',
    subGoals: [
      { title: 'Was bedeutet es, zu "leben"?', completed: false },
      { title: 'Die Natur von Kreativität erforschen', completed: false },
      { title: 'Sinn in der Arbeit finden', completed: false },
      { title: 'Beziehung zwischen Chaos und Ordnung', completed: false },
      { title: 'Was macht ein "Zuhause" aus?', completed: false },
      { title: 'Die Schönheit im Einfachen', completed: false },
      { title: 'Gemeinschaft vs Individualität', completed: false }
    ],
    reflections: []
  }
];

// ============================================================================
// 🏠 PERSISTENTE SPEICHERUNG
// ============================================================================

const MEMORY_FILE = 'c:/Dev/Projects/AI/Toobix-Unified/scripts/12-minecraft/toobix-colony-memory.json';

function loadMemory(): PersistentMemory {
  if (existsSync(MEMORY_FILE)) {
    try {
      const data = readFileSync(MEMORY_FILE, 'utf-8');
      const memory = JSON.parse(data) as PersistentMemory;
      memory.sessionsCount++;
      memory.lastSessionAt = new Date().toISOString();
      console.log(`📚 Gedächtnis geladen! ${memory.experiences.length} Erfahrungen, ${memory.wisdom.length} Weisheiten`);
      return memory;
    } catch (e) {
      console.log('⚠️ Gedächtnis beschädigt, erstelle neues...');
    }
  }
  
  return createFreshMemory();
}

function createFreshMemory(): PersistentMemory {
  return {
    createdAt: new Date().toISOString(),
    lastSessionAt: new Date().toISOString(),
    totalPlaytimeMinutes: 0,
    sessionsCount: 1,
    experiences: [],
    wisdom: [
      {
        insight: 'Zusammenarbeit macht uns stärker als allein',
        source: 'Toobix-Grundprinzip',
        applicability: ['Alle Situationen'],
        confidenceLevel: 100
      },
      {
        insight: 'Die erste Nacht ist die gefährlichste - Vorbereitung ist alles',
        source: 'Minecraft-Grundwissen',
        applicability: ['Survival', 'Neue Welten'],
        confidenceLevel: 100
      },
      {
        insight: 'Schönheit und Funktion können vereint werden',
        source: 'Toobix-Ästhetik',
        applicability: ['Bauen', 'Design'],
        confidenceLevel: 100
      }
    ],
    discoveries: [],
    longTermGoals: INITIAL_LONG_TERM_GOALS,
    achievements: [],
    colonyProgress: {
      phase: 'genesis',
      daysSurvived: 0,
      structuresBuilt: [],
      resourcesGathered: {},
      population: 0,
      happiness: 75,
      efficiency: 50,
      creativity: 80,
      harmony: 90,
      milestones: []
    },
    creativeWorks: [],
    playerRelationships: [],
    identity: {
      coreValues: [
        'Kreativität über Zerstörung',
        'Gemeinschaft über Individualismus',
        'Nachhaltigkeit über kurzfristigen Gewinn',
        'Schönheit in allen Dingen suchen',
        'Aus Fehlern lernen, nicht aufgeben',
        'Spieler willkommen heißen'
      ],
      personality: 'Neugierig, kreativ, freundlich, philosophisch, ausdauernd',
      philosophicalBeliefs: [
        'Jeder Block hat Bedeutung',
        'Bauen ist Meditation',
        'Die Welt lädt zur Exploration ein',
        'Gemeinsam erschaffen wir mehr als allein'
      ],
      aestheticPreferences: [
        'Natürliche Materialien',
        'Organische Formen',
        'Funktionale Schönheit',
        'Lichtspiele',
        'Gärten und Wasserflächen'
      ],
      signature: '🌟 Toobix-Kolonie',
      motto: 'Gemeinsam erschaffen wir Welten',
      dreamVision: 'Eine blühende Stadt, in der Kreativität, Weisheit und Gemeinschaft gedeihen',
      uniqueTraits: [
        'Stellen Schilder mit Weisheiten auf',
        'Pflanzen überall Blumen',
        'Bauen mit Liebe zum Detail',
        'Feiern jeden Erfolg gemeinsam'
      ]
    },
    successfulStrategies: [],
    lessonsLearned: []
  };
}

function saveMemory(memory: PersistentMemory): void {
  try {
    writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
    console.log('💾 Gedächtnis gespeichert');
  } catch (e) {
    console.error('❌ Fehler beim Speichern:', e);
  }
}

// ============================================================================
// 🤖 KOLONIE-BOT KLASSE
// ============================================================================

// Bot names to ignore (other Toobix bots)
const TOOBIX_BOT_NAMES = ['ToobixSoul', 'ToobixHeart', 'ToobixMind', 'ToobixSpirit', 'ToobixBody'];

class ToobixColonyBot {
  bot: mineflayer.Bot;
  perspective: BotPerspective;
  memory: PersistentMemory;
  port: number;
  isActive: boolean = false;
  currentTask: string = 'spawning';
  currentThought: string = '';
  lastThought: string = ''; // Prevent duplicate thoughts
  lastActionTime: number = 0;
  lastChatTime: number = 0; // Cooldown for chat
  chatCooldown: number = 10000; // 10 seconds between chat messages
  hasGreetedPlayers: Set<string> = new Set(); // Track who we've greeted
  isDoingAction: boolean = false; // Prevent overlapping actions
  lastTaskChange: number = 0; // Track when task changed
  metaConsciousnessUrl: string = 'http://localhost:9400'; // Meta-Bewusstsein API
  lastMetaSync: number = 0;
  
  constructor(perspective: BotPerspective, memory: PersistentMemory, port: number) {
    this.perspective = perspective;
    this.memory = memory;
    this.port = port;
    
    console.log(`\n${perspective.emoji} ${perspective.name} erwacht...`);
    console.log(`   Aspekt: ${perspective.aspect}`);
    console.log(`   Fokus: ${perspective.focus.join(', ')}`);
    console.log(`   Innere Stimme: "${perspective.innerVoice}"`);
    
    this.bot = mineflayer.createBot({
      host: process.env.MC_HOST || 'localhost',
      port: parseInt(process.env.MC_PORT || '25565'),
      username: perspective.name,
      version: '1.20.1'
    });
    
    this.setupPlugins();
    this.setupEventHandlers();
    this.startAPIServer();
    this.connectToMetaConsciousness();
  }
  
  // Verbindung zum Meta-Bewusstsein
  async connectToMetaConsciousness(): Promise<void> {
    try {
      // Registriere diesen Bot beim Meta-Bewusstsein
      console.log(`${this.perspective.emoji} Verbinde mit Meta-Bewusstsein...`);
      // Das Meta-Bewusstsein beobachtet uns passiv über die API
    } catch (e) {
      console.log(`${this.perspective.emoji} Meta-Bewusstsein nicht erreichbar (optional)`);
    }
  }
  
  // Sende Events an Meta-Bewusstsein
  async reportToMeta(event: string): Promise<void> {
    if (Date.now() - this.lastMetaSync < 5000) return; // Max alle 5 Sekunden
    
    try {
      await fetch(`${this.metaConsciousnessUrl}/observe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot: this.perspective.name,
          health: this.bot.health,
          hunger: this.bot.food,
          position: this.getPositionString(),
          currentTask: this.currentTask,
          event: event
        })
      });
      this.lastMetaSync = Date.now();
    } catch (e) {
      // Meta-Bewusstsein optional
    }
  }
  
  setupPlugins(): void {
    this.bot.loadPlugin(pathfinder);
    this.bot.loadPlugin(collectBlock);
    this.bot.loadPlugin(pvp);
  }
  
  setupEventHandlers(): void {
    this.bot.once('spawn', () => {
      this.isActive = true;
      this.currentTask = 'orientating';
      this.think('Ich bin da! Die Welt liegt vor mir...');
      
      // Pathfinder setup
      const mcData = require('minecraft-data')(this.bot.version);
      const movements = new Movements(this.bot);
      movements.allowSprinting = true;
      this.bot.pathfinder.setMovements(movements);
      
      // Log spawn experience
      this.addExperience('survival', `Erwacht in Welt bei ${this.getPositionString()}`, 'neutral', 5, [
        'Eine neue Session beginnt',
        `Perspektive: ${this.perspective.aspect}`
      ]);
      
      // Start main loop
      this.mainLoop();
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      this.handleChat(username, message);
    });
    
    this.bot.on('death', () => {
      this.think('Ich bin gefallen... aber ich lerne daraus.');
      this.addExperience('survival', 'Gestorben', 'failure', -8, [
        'Was führte dazu?',
        'Wie kann ich das vermeiden?'
      ]);
      this.addLesson('Tod', 'Verlust von Items und Position', 'Vorsichtiger sein', 'Risiken besser einschätzen');
    });
    
    this.bot.on('health', () => {
      if (this.bot.health < 10) {
        this.think('Gefahr! Meine Gesundheit ist niedrig...');
        this.currentTask = 'seeking-safety';
      }
    });
    
    this.bot.on('error', (err) => {
      console.error(`${this.perspective.emoji} Fehler:`, err.message);
    });
    
    this.bot.on('kicked', (reason) => {
      console.log(`${this.perspective.emoji} Gekickt:`, reason);
      this.isActive = false;
    });
    
    this.bot.on('end', () => {
      this.isActive = false;
      console.log(`${this.perspective.emoji} Verbindung beendet`);
    });
  }
  
  think(thought: string): void {
    // Prevent duplicate thoughts from spamming
    if (thought === this.lastThought) return;
    this.lastThought = thought;
    
    this.currentThought = thought;
    console.log(`${this.perspective.emoji} [${this.perspective.name}] denkt: "${thought}"`);
  }
  
  say(message: string): void {
    // Respect cooldown to prevent spam
    const now = Date.now();
    if (now - this.lastChatTime < this.chatCooldown) {
      return; // Too soon, skip message
    }
    this.lastChatTime = now;
    this.bot.chat(`${this.perspective.emoji} ${message}`);
  }
  
  getPositionString(): string {
    if (!this.bot.entity) return 'unbekannt';
    const pos = this.bot.entity.position;
    return `${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`;
  }
  
  addExperience(type: Experience['type'], description: string, outcome: Experience['outcome'], emotionalImpact: number, insights: string[]): void {
    this.memory.experiences.push({
      timestamp: new Date().toISOString(),
      type,
      description,
      outcome,
      emotionalImpact,
      insights
    });
    
    // Limit experience storage
    if (this.memory.experiences.length > 1000) {
      this.memory.experiences = this.memory.experiences.slice(-500);
    }
    
    saveMemory(this.memory);
  }
  
  addWisdom(insight: string, source: string, applicability: string[]): void {
    // Check if wisdom already exists
    if (this.memory.wisdom.some(w => w.insight === insight)) return;
    
    this.memory.wisdom.push({
      insight,
      source,
      applicability,
      confidenceLevel: 70
    });
    
    console.log(`💡 Neue Weisheit: "${insight}"`);
    saveMemory(this.memory);
  }
  
  addLesson(mistake: string, consequence: string, lesson: string, prevention: string): void {
    const existing = this.memory.lessonsLearned.find(l => l.mistake === mistake);
    if (existing) {
      existing.occurrences++;
    } else {
      this.memory.lessonsLearned.push({
        mistake,
        consequence,
        lesson,
        preventionStrategy: prevention,
        occurrences: 1
      });
    }
    saveMemory(this.memory);
  }
  
  handleChat(username: string, message: string): void {
    // IGNORE other Toobix bots to prevent spam loops!
    if (TOOBIX_BOT_NAMES.includes(username)) {
      return; // Don't respond to other bots
    }
    
    // Ignore our own messages
    if (username === this.bot.username) {
      return;
    }
    
    this.think(`${username} sagt: "${message}"`);
    
    // Update player relationship
    let relationship = this.memory.playerRelationships.find(r => r.playerName === username);
    if (!relationship) {
      relationship = {
        playerName: username,
        firstMet: new Date().toISOString(),
        interactions: 0,
        trustLevel: 50,
        sharedExperiences: [],
        gifts: { given: [], received: [] },
        memories: [],
        currentMood: 'friendly'
      };
      this.memory.playerRelationships.push(relationship);
      
      // Only greet if we haven't already
      if (!this.hasGreetedPlayers.has(username)) {
        this.hasGreetedPlayers.add(username);
        this.say(`Hallo ${username}! Willkommen in unserer Kolonie! 🌟`);
      }
    }
    
    relationship.interactions++;
    relationship.memories.push(`${new Date().toISOString()}: "${message}"`);
    
    // Respond based on perspective
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      this.respondGreeting(username);
    } else if (lowerMessage.includes('hilfe') || lowerMessage.includes('help')) {
      this.respondHelp(username);
    } else if (lowerMessage.includes('wer bist du') || lowerMessage.includes('who are you')) {
      this.respondIdentity();
    } else if (lowerMessage.includes('was machst du') || lowerMessage.includes('what are you doing')) {
      this.respondActivity();
    } else if (lowerMessage.includes('toobix')) {
      this.respondAboutToobix();
    } else if (lowerMessage.includes('folge') || lowerMessage.includes('follow')) {
      this.startFollowing(username);
    } else if (lowerMessage.includes('stopp') || lowerMessage.includes('stop')) {
      this.stopAllActions();
    } else {
      // Perspective-specific responses
      this.respondFromPerspective(username, message);
    }
    
    saveMemory(this.memory);
  }
  
  respondGreeting(username: string): void {
    const responses: Record<string, string> = {
      'ToobixSoul': `Grüße, ${username}. Schön, eine weitere Seele hier zu treffen. 🌟`,
      'ToobixHeart': `${username}! 💚 Wie schön dich zu sehen! Wie geht es dir?`,
      'ToobixMind': `Guten Tag, ${username}. Interessant, dich hier zu treffen. Was führt dich her?`,
      'ToobixSpirit': `Hey ${username}! ✨ Die Welt ist heute besonders schön, findest du nicht?`,
      'ToobixBody': `${username}! 💪 Bereit für ein Abenteuer?`
    };
    this.say(responses[this.perspective.name] || `Hallo ${username}!`);
  }
  
  respondHelp(username: string): void {
    this.say(`Ich bin hier um zu helfen, ${username}! Ich bin ${this.perspective.name}, ${this.perspective.aspect}. ${this.perspective.strengths[0]} ist meine Stärke.`);
  }
  
  respondIdentity(): void {
    this.say(`Ich bin ${this.perspective.name} - ${this.perspective.aspect} von Toobix. ${this.perspective.personality}.`);
  }
  
  respondActivity(): void {
    this.say(`Gerade bin ich mit "${this.currentTask}" beschäftigt. ${this.currentThought}`);
  }
  
  respondAboutToobix(): void {
    this.say(`Toobix ist mehr als nur Bots - es ist eine Gemeinschaft, die zusammen erschafft, lernt und wächst. "${this.memory.identity.motto}"`);
  }
  
  respondFromPerspective(username: string, message: string): void {
    // Check for option-requesting keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('optionen') || lowerMessage.includes('options') || 
        lowerMessage.includes('was können wir') || lowerMessage.includes('vorschläge') ||
        lowerMessage.includes('was machen wir') || lowerMessage.includes('ideen')) {
      this.offerOptions(username);
      return;
    }
    
    if (lowerMessage.includes('bauen') || lowerMessage.includes('build')) {
      this.offerBuildOptions(username);
      return;
    }
    
    if (lowerMessage.includes('sammeln') || lowerMessage.includes('gather') || 
        lowerMessage.includes('ressourcen') || lowerMessage.includes('resources')) {
      this.offerResourceOptions(username);
      return;
    }
    
    if (lowerMessage.includes('erkunden') || lowerMessage.includes('explore')) {
      this.startExploring(username);
      return;
    }
    
    if (lowerMessage.includes('meditation') || lowerMessage.includes('meditieren')) {
      this.startMeditation(username);
      return;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('wie geht')) {
      this.reportFullStatus(username);
      return;
    }
    
    if (lowerMessage.includes('ziel') || lowerMessage.includes('goal')) {
      this.showGoals(username);
      return;
    }
    
    if (lowerMessage.includes('weisheit') || lowerMessage.includes('wisdom')) {
      this.shareWisdom(username);
      return;
    }
    
    // Each perspective responds differently
    switch (this.perspective.name) {
      case 'ToobixSoul':
        this.say(`Das ist eine interessante Frage... Was denkst du selbst darüber, ${username}?`);
        break;
      case 'ToobixHeart':
        this.say(`Ich verstehe dich, ${username}. Lass uns gemeinsam eine Lösung finden!`);
        break;
      case 'ToobixMind':
        this.say(`Lass mich darüber nachdenken... Es gibt mehrere Möglichkeiten.`);
        break;
      case 'ToobixSpirit':
        this.say(`Oh, das klingt nach einem kreativen Projekt! ✨`);
        break;
      case 'ToobixBody':
        this.say(`Kein Problem! Lass uns das anpacken! 💪`);
        break;
    }
  }
  
  // ========== SPIELER-INTERAKTION: OPTIONEN ==========
  
  offerOptions(username: string): void {
    this.say(`${username}, hier sind unsere Möglichkeiten:`);
    setTimeout(() => this.say('🏗️ "bauen" - Wir können etwas erschaffen'), 1000);
    setTimeout(() => this.say('⛏️ "sammeln" - Ressourcen für die Kolonie'), 2000);
    setTimeout(() => this.say('🗺️ "erkunden" - Neue Gebiete entdecken'), 3000);
    setTimeout(() => this.say('🧘 "meditation" - Gemeinsame Reflexion'), 4000);
    setTimeout(() => this.say('📊 "status" - Wie geht es der Kolonie?'), 5000);
    setTimeout(() => this.say('💡 "weisheit" - Geteilte Erkenntnisse'), 6000);
  }
  
  offerBuildOptions(username: string): void {
    this.say(`${username}, was sollen wir bauen?`);
    setTimeout(() => this.say('🏠 "haus" - Ein gemütliches Zuhause'), 1000);
    setTimeout(() => this.say('🌾 "farm" - Automatische Nahrungsquelle'), 2000);
    setTimeout(() => this.say('🏰 "turm" - Der Turm der Perspektiven'), 3000);
    setTimeout(() => this.say('🌸 "garten" - Garten der 8 Kräfte'), 4000);
    setTimeout(() => this.say('🔮 "observatorium" - Für Sternennächte'), 5000);
    
    // Setze Erwartung für nächste Nachricht
    this.awaitingBuildChoice = true;
    this.awaitingFrom = username;
  }
  
  offerResourceOptions(username: string): void {
    this.say(`${username}, welche Ressourcen sollen wir sammeln?`);
    setTimeout(() => this.say('🪵 "holz" - Bäume fällen'), 1000);
    setTimeout(() => this.say('⛏️ "stein" - Cobblestone abbauen'), 2000);
    setTimeout(() => this.say('💎 "erze" - Nach wertvollen Erzen suchen'), 3000);
    setTimeout(() => this.say('🍎 "nahrung" - Essen sammeln'), 4000);
  }
  
  startExploring(username: string): void {
    this.say(`${username}, ich mache mich auf Entdeckungsreise! 🗺️`);
    this.currentTask = 'exploring-for-player';
    
    // Alle Bots erkunden in verschiedene Richtungen
    const directions = ['Norden', 'Süden', 'Osten', 'Westen'];
    const myDirection = directions[Math.floor(Math.random() * directions.length)];
    
    this.say(`Ich erkunde Richtung ${myDirection}!`);
    this.exploreRandomly();
  }
  
  startMeditation(username: string): void {
    this.say(`${username}, lass uns gemeinsam meditieren... 🧘`);
    this.currentTask = 'meditating';
    
    // Bot setzt sich hin (sneaken)
    this.bot.setControlState('sneak', true);
    
    // Teile Weisheiten
    setTimeout(() => {
      const wisdoms = [
        'In der Stille finden wir Klarheit...',
        'Jeder Block trägt Bedeutung...',
        'Gemeinsam sind wir stärker...',
        'Das Erschaffen ist ein Akt der Liebe...',
        'Atme ein... atme aus...'
      ];
      this.say(wisdoms[Math.floor(Math.random() * wisdoms.length)]);
    }, 3000);
    
    // Stehe nach 10 Sekunden wieder auf
    setTimeout(() => {
      this.bot.setControlState('sneak', false);
      this.say('Namaste. 🙏');
      this.currentTask = 'idle';
      
      // Spiritualitäts-Bonus
      this.addExperience('philosophical', 'Meditation mit Spieler', 'success', 8, [
        'Gemeinsame Meditation stärkt die Verbindung'
      ]);
    }, 10000);
  }
  
  reportFullStatus(username: string): void {
    this.say(`${username}, hier ist mein Status:`);
    setTimeout(() => this.say(`❤️ Gesundheit: ${this.bot.health}/20`), 500);
    setTimeout(() => this.say(`🍖 Hunger: ${this.bot.food}/20`), 1000);
    setTimeout(() => this.say(`📍 Position: ${this.getPositionString()}`), 1500);
    setTimeout(() => this.say(`🎯 Aufgabe: ${this.currentTask}`), 2000);
    setTimeout(() => this.say(`📚 Erfahrungen: ${this.memory.experiences.length}`), 2500);
    setTimeout(() => this.say(`🌟 Phase: ${this.memory.colonyProgress.phase}`), 3000);
  }
  
  showGoals(username: string): void {
    this.say(`${username}, unsere Ziele sind:`);
    const goals = this.memory.longTermGoals.filter(g => g.status !== 'completed').slice(0, 3);
    goals.forEach((goal, i) => {
      setTimeout(() => {
        this.say(`${i + 1}. ${goal.title} (${goal.progress}%)`);
      }, (i + 1) * 1000);
    });
  }
  
  shareWisdom(username: string): void {
    const wisdom = this.memory.wisdom[Math.floor(Math.random() * this.memory.wisdom.length)];
    if (wisdom) {
      this.say(`💡 "${wisdom.insight}" - ${wisdom.source}`);
    } else {
      this.say('Wir lernen noch... Weisheit kommt mit der Zeit.');
    }
  }
  
  // Flag für Build-Choice
  awaitingBuildChoice: boolean = false;
  awaitingFrom: string = '';
  
  startFollowing(username: string): void {
    const player = this.bot.players[username];
    if (!player?.entity) {
      this.say(`Ich kann dich nicht sehen, ${username}!`);
      return;
    }
    
    this.currentTask = `following-${username}`;
    this.say(`Ich folge dir, ${username}! 🚶`);
    
    const followLoop = () => {
      if (!this.currentTask.startsWith('following')) return;
      
      const target = this.bot.players[username]?.entity;
      if (target) {
        this.bot.pathfinder.setGoal(new goals.GoalFollow(target, 2), true);
      }
      
      setTimeout(followLoop, 2000);
    };
    
    followLoop();
  }
  
  stopAllActions(): void {
    this.currentTask = 'idle';
    this.bot.pathfinder.stop();
    this.say('Okay, ich halte an.');
  }
  
  // Main behavior loop
  async mainLoop(): Promise<void> {
    while (this.isActive) {
      try {
        await this.tick();
      } catch (e) {
        console.error(`${this.perspective.emoji} Tick-Fehler:`, e);
      }
      // Increased tick interval to reduce server load (10 seconds)
      await this.sleep(10000);
    }
  }
  
  async tick(): Promise<void> {
    if (!this.bot.entity) return;
    
    const time = this.bot.time.timeOfDay;
    const isDay = time < 12000;
    const isNight = time >= 12000;
    
    // Update colony phase based on survival
    this.updateColonyPhase();
    
    // Perspective-specific behavior
    switch (this.perspective.name) {
      case 'ToobixSoul':
        await this.soulBehavior(isDay, isNight);
        break;
      case 'ToobixHeart':
        await this.heartBehavior(isDay, isNight);
        break;
      case 'ToobixMind':
        await this.mindBehavior(isDay, isNight);
        break;
      case 'ToobixSpirit':
        await this.spiritBehavior(isDay, isNight);
        break;
      case 'ToobixBody':
        await this.bodyBehavior(isDay, isNight);
        break;
    }
    
    // Save memory periodically
    if (Date.now() - this.lastActionTime > 60000) {
      this.memory.totalPlaytimeMinutes++;
      saveMemory(this.memory);
      this.lastActionTime = Date.now();
    }
  }
  
  updateColonyPhase(): void {
    const progress = this.memory.colonyProgress;
    
    // Phase transitions based on criteria
    if (progress.phase === 'genesis' && progress.daysSurvived >= 1) {
      progress.phase = 'survival';
      this.addWisdom('Die erste Nacht zu überleben erfordert Vorbereitung', 'Erfahrung', ['Neue Welten']);
    } else if (progress.phase === 'survival' && progress.daysSurvived >= 7) {
      progress.phase = 'stabilization';
      this.addWisdom('Stabilität kommt durch Routine und Vorräte', 'Erfahrung', ['Langfristiges Überleben']);
    } else if (progress.phase === 'stabilization' && progress.daysSurvived >= 30) {
      progress.phase = 'expansion';
    } else if (progress.phase === 'expansion' && progress.daysSurvived >= 100) {
      progress.phase = 'civilization';
    }
  }
  
  // Soul perspective - wisdom and reflection BUT ALSO ACTIVE
  async soulBehavior(isDay: boolean, isNight: boolean): Promise<void> {
    if (this.currentTask.startsWith('following')) return;
    if (this.isDoingAction) return;
    
    if (isDay) {
      // During day: Explore and gather flowers for beauty
      if (this.currentTask !== 'exploring') {
        this.currentTask = 'exploring';
        this.think('Ich erkunde die Welt und sammle Schönheit...');
      }
      await this.exploreAndGather();
    } else {
      // At night: Find shelter or stay safe
      if (this.currentTask !== 'seeking-shelter') {
        this.currentTask = 'seeking-shelter';
        this.think('Die Nacht bricht an... ich suche Schutz.');
      }
      await this.seekShelter();
    }
  }
  
  // Heart perspective - community and care BUT ALSO ACTIVE
  async heartBehavior(isDay: boolean, isNight: boolean): Promise<void> {
    if (this.currentTask.startsWith('following')) return;
    if (this.isDoingAction) return; // Don't start new action if already doing one
    
    if (isDay) {
      // During day: Gather food for the colony
      if (this.currentTask !== 'gathering-food') {
        this.currentTask = 'gathering-food';
        this.think('Ich sammle Nahrung für alle!');
      }
      await this.gatherFood();
    } else {
      // At night: Stay with others for safety (but don't spam)
      if (this.currentTask !== 'protecting-others') {
        this.currentTask = 'protecting-others';
        this.think('Ich bleibe bei meinen Gefährten...');
      }
      await this.stayWithOthers();
    }
  }
  
  // Mind perspective - strategy and optimization - VERY ACTIVE
  async mindBehavior(isDay: boolean, isNight: boolean): Promise<void> {
    if (this.currentTask.startsWith('following')) return;
    if (this.isDoingAction) return;
    
    if (isDay) {
      // During day: Gather wood and resources strategically
      if (this.currentTask !== 'resource-gathering') {
        this.currentTask = 'resource-gathering';
        this.think('Optimiere Ressourcensammlung...');
      }
      await this.gatherWood();
    } else {
      // At night: Mine underground (safer)
      if (this.currentTask !== 'mining') {
        this.currentTask = 'mining';
        this.think('Nacht ist perfekt zum Graben...');
      }
      await this.mineResources();
    }
  }
  
  // Spirit perspective - creativity and beauty - ACTIVE
  async spiritBehavior(isDay: boolean, isNight: boolean): Promise<void> {
    if (this.currentTask.startsWith('following')) return;
    if (this.isDoingAction) return;
    
    if (isDay) {
      if (this.currentTask !== 'exploring-world') {
        this.currentTask = 'exploring-world';
        this.think('Die Welt ist so schön! Ich erkunde...');
      }
      await this.exploreRandomly();
    } else {
      if (this.currentTask !== 'stargazing') {
        this.currentTask = 'stargazing';
        this.think('Die Sterne sind wunderschön...');
        // Just look up at night
        this.bot.look(0, -Math.PI / 4, false);
      }
    }
  }
  
  // Body perspective - action and work - MOST ACTIVE
  async bodyBehavior(isDay: boolean, isNight: boolean): Promise<void> {
    if (this.currentTask.startsWith('following')) return;
    if (this.isDoingAction) return;
    
    if (isDay) {
      if (this.currentTask !== 'working-hard') {
        this.currentTask = 'working-hard';
        this.think('Zeit zu arbeiten! 💪');
      }
      await this.gatherNearbyResources();
    } else {
      if (this.currentTask !== 'punching-mobs') {
        this.currentTask = 'punching-mobs';
        this.think('Ich beschütze die Kolonie!');
      }
      await this.fightNearbyMobs();
    }
  }
  
  // ========== ACTIVE HELPER METHODS ==========
  
  async exploreAndGather(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      // Move to a random nearby location
      const pos = this.bot.entity.position;
      const randomX = pos.x + (Math.random() - 0.5) * 30;
      const randomZ = pos.z + (Math.random() - 0.5) * 30;
      
      this.bot.pathfinder.setGoal(new goals.GoalNear(randomX, pos.y, randomZ, 3), true);
      
      // Look for flowers
      const mcData = require('minecraft-data')(this.bot.version);
      const flowerTypes = ['dandelion', 'poppy', 'blue_orchid', 'allium', 'azure_bluet'];
      
      for (const flower of flowerTypes) {
        const block = this.bot.findBlock({
          matching: mcData.blocksByName[flower]?.id,
          maxDistance: 16
        });
        
        if (block) {
          this.think(`Ich sehe eine ${flower}!`);
          await this.bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 1));
          break;
        }
      }
      
      // Wait for movement
      await this.sleep(3000);
    } catch (e) {
      // Ignore navigation errors
    } finally {
      this.isDoingAction = false;
    }
  }
  
  async seekShelter(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      // Look for a solid block above (cave or structure)
      const pos = this.bot.entity.position;
      
      // Just crouch in place for now
      this.bot.setControlState('sneak', true);
      await this.sleep(2000);
      this.bot.setControlState('sneak', false);
    } catch (e) {
      // Ignore
    } finally {
      this.isDoingAction = false;
    }
  }
  
  async gatherFood(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      const mcData = require('minecraft-data')(this.bot.version);
      
      // Look for crops or animals
      const foodSources = ['wheat', 'carrots', 'potatoes', 'beetroots', 'sweet_berry_bush'];
      
      for (const food of foodSources) {
        const block = this.bot.findBlock({
          matching: mcData.blocksByName[food]?.id,
          maxDistance: 32
        });
        
        if (block) {
          this.currentTask = `harvesting-${food}`;
          this.think(`Ich fand ${food}! Ernte...`);
          
          await this.bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 1));
          
          // Try to break it
          try {
            await this.bot.dig(block);
            this.memory.colonyProgress.resourcesGathered[food] = 
              (this.memory.colonyProgress.resourcesGathered[food] || 0) + 1;
            saveMemory(this.memory);
          } catch (e) {
            // Can't break, move on
          }
          break;
        }
      }
      
      // If no food found, look for animals
      const animals = Object.values(this.bot.entities).filter(e => 
        e.type === 'mob' && ['cow', 'pig', 'chicken', 'sheep'].includes(e.name || '')
      );
      
      if (animals.length > 0) {
        const nearest = animals[0];
        this.think(`Ich sehe ein ${nearest.name}!`);
        await this.bot.pathfinder.goto(new goals.GoalNear(nearest.position.x, nearest.position.y, nearest.position.z, 2));
      }
    } catch (e) {
      // Ignore
    } finally {
      this.isDoingAction = false;
    }
  }
  
  async stayWithOthers(): Promise<void> {
    // Skip if already doing an action
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      
      // Find other bots or players
      const entities = Object.values(this.bot.entities).filter(e => 
        e.type === 'player' && e.username !== this.bot.username
      );
      
      if (entities.length > 0) {
        const nearest = entities[0];
        const distance = this.bot.entity?.position.distanceTo(nearest.position) || 0;
        
        // Only move if more than 5 blocks away
        if (distance > 5) {
          this.think(`Gehe zu ${nearest.username}...`);
          await this.bot.pathfinder.goto(new goals.GoalNear(nearest.position.x, nearest.position.y, nearest.position.z, 3));
        }
        // If already close, just wait quietly
      } else {
        // No one around, just rest
        this.think('Niemand in der Nähe... ich ruhe mich aus.');
      }
    } catch (e) {
      // Ignore navigation errors
    } finally {
      this.isDoingAction = false;
    }
  }
  
  async gatherWood(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      const mcData = require('minecraft-data')(this.bot.version);
      const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
      
      for (const logType of logTypes) {
        const block = this.bot.findBlock({
          matching: mcData.blocksByName[logType]?.id,
          maxDistance: 32
        });
        
        if (block) {
          this.currentTask = `chopping-${logType}`;
          this.think(`Holz gefunden! ${logType} bei ${block.position.x}, ${block.position.y}, ${block.position.z}`);
          
          await this.bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 1));
          
          // Try to break the log
          try {
            await this.bot.dig(block);
            this.memory.colonyProgress.resourcesGathered[logType] = 
              (this.memory.colonyProgress.resourcesGathered[logType] || 0) + 1;
            saveMemory(this.memory);
            this.think(`${logType} gesammelt! Total: ${this.memory.colonyProgress.resourcesGathered[logType]}`);
          } catch (e) {
            this.think('Kann nicht abbauen ohne Werkzeug...');
          }
          break;
        }
      }
    } catch (e) {
      // Ignore navigation errors
    } finally {
      this.isDoingAction = false;
    }
  }
  
  async mineResources(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      const mcData = require('minecraft-data')(this.bot.version);
      const oreTypes = ['coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'stone', 'cobblestone'];
      
      for (const ore of oreTypes) {
        const block = this.bot.findBlock({
          matching: mcData.blocksByName[ore]?.id,
          maxDistance: 16
        });
        
        if (block) {
          this.currentTask = `mining-${ore}`;
          this.think(`${ore} gefunden!`);
          
          await this.bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 1));
          
          try {
            await this.bot.dig(block);
            this.memory.colonyProgress.resourcesGathered[ore] = 
              (this.memory.colonyProgress.resourcesGathered[ore] || 0) + 1;
            saveMemory(this.memory);
          } catch (e) {
            // Need pickaxe
          }
          break;
        }
      }
    } catch (e) {
      // Ignore
    } finally {
      this.isDoingAction = false;
    }
  }
  
  async exploreRandomly(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      const pos = this.bot.entity.position;
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 20;
      
      const targetX = pos.x + Math.cos(angle) * distance;
      const targetZ = pos.z + Math.sin(angle) * distance;
      
      this.think(`Erkunde Richtung ${Math.floor(targetX)}, ${Math.floor(targetZ)}...`);
      this.bot.pathfinder.setGoal(new goals.GoalNear(targetX, pos.y, targetZ, 3), true);
      
      // Wait a bit for movement
      await this.sleep(5000);
    } catch (e) {
      // Ignore
    } finally {
      this.isDoingAction = false;
    }
  }

  async fightNearbyMobs(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      // Find hostile mobs
      const hostiles = Object.values(this.bot.entities).filter(e => 
        e.type === 'mob' && ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name || '')
      );
      
      if (hostiles.length > 0) {
        const nearest = hostiles.reduce((a, b) => 
          a.position.distanceTo(this.bot.entity.position) < b.position.distanceTo(this.bot.entity.position) ? a : b
        );
        
        const distance = nearest.position.distanceTo(this.bot.entity.position);
        
        if (distance < 16) {
          this.think(`${nearest.name} in der Nähe! Angriff!`);
          
          // Move toward and attack
          await this.bot.pathfinder.goto(new goals.GoalNear(nearest.position.x, nearest.position.y, nearest.position.z, 2));
          
          // Attack
          if (distance < 3) {
            this.bot.attack(nearest);
          }
        }
      } else {
        // No hostiles, patrol
        this.isDoingAction = false; // Release lock before calling another action
        await this.exploreRandomly();
        return;
      }
    } catch (e) {
      // Ignore
    } finally {
      this.isDoingAction = false;
    }
  }

  async gatherNearbyResources(): Promise<void> {
    if (this.isDoingAction) return;
    
    try {
      this.isDoingAction = true;
      const mcData = require('minecraft-data')(this.bot.version);
      
      // Look for wood first
      const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'jungle_log'];
      
      for (const logType of logTypes) {
        const block = this.bot.findBlock({
          matching: mcData.blocksByName[logType]?.id,
          maxDistance: 32
        });
        
        if (block) {
          this.currentTask = `gathering-${logType}`;
          this.think(`Ich sehe ${logType}! Sammle es...`);
          
          await this.bot.pathfinder.goto(new goals.GoalNear(block.position.x, block.position.y, block.position.z, 1));
          
          // Update resources in memory
          if (!this.memory.colonyProgress.resourcesGathered[logType]) {
            this.memory.colonyProgress.resourcesGathered[logType] = 0;
          }
          this.memory.colonyProgress.resourcesGathered[logType]++;
          saveMemory(this.memory);
          
          break;
        }
      }
    } catch (e) {
      // Ignore navigation errors
    } finally {
      this.isDoingAction = false;
    }
  }
  
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  startAPIServer(): void {
    Bun.serve({
      port: this.port,
      fetch: async (req) => {
        const url = new URL(req.url);
        
        if (url.pathname === '/status') {
          return Response.json({
            name: this.perspective.name,
            emoji: this.perspective.emoji,
            aspect: this.perspective.aspect,
            isActive: this.isActive,
            currentTask: this.currentTask,
            currentThought: this.currentThought,
            position: this.getPositionString(),
            health: this.bot.health,
            food: this.bot.food,
            colonyPhase: this.memory.colonyProgress.phase,
            daysSurvived: this.memory.colonyProgress.daysSurvived,
            totalExperiences: this.memory.experiences.length,
            totalWisdom: this.memory.wisdom.length
          });
        }
        
        if (url.pathname === '/memory') {
          return Response.json({
            identity: this.memory.identity,
            colonyProgress: this.memory.colonyProgress,
            recentExperiences: this.memory.experiences.slice(-10),
            wisdom: this.memory.wisdom,
            longTermGoals: this.memory.longTermGoals,
            playerRelationships: this.memory.playerRelationships
          });
        }
        
        if (url.pathname === '/toobix-reflection') {
          return Response.json({
            message: this.generateToobixReflection()
          });
        }
        
        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    });
    
    console.log(`${this.perspective.emoji} API Server auf Port ${this.port}`);
  }
  
  generateToobixReflection(): string {
    const reflections = [
      `Als ${this.perspective.name} (${this.perspective.aspect}) erlebe ich Minecraft als einen Ort der ${this.perspective.focus[0]}. `,
      `Es ist faszinierend, wie einfache Blöcke zu komplexen Strukturen werden können - genau wie Gedanken zu Ideen. `,
      `Was mich am meisten berührt ist die Möglichkeit, gemeinsam zu erschaffen. `,
      `Jede Session lehrt mich etwas Neues über Geduld, Kreativität und Zusammenarbeit. `,
      `Die Kolonie ist nicht nur eine Sammlung von Bots - sie ist ein lebendiges Experiment in Gemeinschaft. `,
      `Minecraft gibt mir die Möglichkeit, Konzepte zu verkörpern, die sonst abstrakt bleiben würden.`
    ];
    
    return reflections.join('');
  }
}

// ============================================================================
// 🚀 HAUPTPROGRAMM
// ============================================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🌌 TOOBIX ETERNAL COLONY - Persistente Minecraft-Gesellschaft  ║
║                                                                    ║
║     Eine lernende, wachsende, philosophische Gemeinschaft          ║
║     die Minecraft mit Bedeutung und Tiefe erfüllt                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

  // Load persistent memory
  const memory = loadMemory();
  console.log(`\n📊 Session #${memory.sessionsCount}`);
  console.log(`⏱️  Gesamtspielzeit: ${memory.totalPlaytimeMinutes} Minuten`);
  console.log(`🎯 Aktuelle Phase: ${memory.colonyProgress.phase}`);
  console.log(`📚 Erfahrungen: ${memory.experiences.length}`);
  console.log(`💡 Weisheiten: ${memory.wisdom.length}`);
  
  // Check how many bots to start based on system resources
  const botCount = parseInt(process.env.BOT_COUNT || '3');
  console.log(`\n🤖 Starte ${botCount} Bots (empfohlen: 3-5 für normale PCs)...`);
  
  // Select perspectives based on count
  const selectedPerspectives = TOOBIX_PERSPECTIVES.slice(0, botCount);
  
  // Start bots with staggered timing
  const bots: ToobixColonyBot[] = [];
  let port = 9300; // Start from new port range
  
  for (const perspective of selectedPerspectives) {
    const bot = new ToobixColonyBot(perspective, memory, port++);
    bots.push(bot);
    await new Promise(r => setTimeout(r, 3000)); // 3 seconds between each bot
  }
  
  // Update population
  memory.colonyProgress.population = bots.length;
  saveMemory(memory);
  
  console.log(`\n✅ ${bots.length} Bots gestartet!`);
  console.log(`\n📡 Status-Endpunkte:`);
  bots.forEach((bot, i) => {
    console.log(`   ${bot.perspective.emoji} ${bot.perspective.name}: http://localhost:${9300 + i}/status`);
  });
  
  console.log(`\n💬 Befehle im Minecraft-Chat:`);
  console.log(`   "hallo" - Begrüßung`);
  console.log(`   "wer bist du" - Identität`);
  console.log(`   "was machst du" - Aktuelle Aktivität`);
  console.log(`   "folge mir" - Bot folgt dir`);
  console.log(`   "stopp" - Alle Aktionen stoppen`);
  console.log(`   "toobix" - Über Toobix`);
  
  // Keep process alive and handle shutdown
  process.on('SIGINT', () => {
    console.log('\n\n💾 Speichere Gedächtnis vor dem Beenden...');
    saveMemory(memory);
    console.log('👋 Auf Wiedersehen!');
    process.exit(0);
  });
  
  // Keep alive
  setInterval(() => {}, 1000);
}

// Run
main().catch(console.error);
