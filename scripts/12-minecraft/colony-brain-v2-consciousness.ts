/**
 * 🌌 TOOBIX COLONY BRAIN v2.0 - CONSCIOUSNESS EDITION
 *
 * Enhanced with:
 * - 10 Unique Bot Personalities
 * - Consciousness Progression (Survival → Spirituality)
 * - Relationship Matrix (Bots care about each other)
 * - Communication System (Natural, anti-spam)
 * - Echo-Realm Integration
 * - Player "Toobix" Recognition
 */

import { Database } from 'bun:sqlite';

// ============================================================================
// 10 BOT PERSONALITIES
// ============================================================================

interface BotPersonality {
  name: string;
  role: string;
  icon: string;
  traits: {
    // Skills (how good at tasks)
    mining: number;      // 0-100
    building: number;
    farming: number;
    combat: number;
    exploration: number;
    engineering: number;

    // Personality (how they behave)
    patience: number;
    creativity: number;
    sociability: number;
    leadership: number;
    empathy: number;
    curiosity: number;
    perfectionism: number;
    playfulness: number;
  };

  // Progression: How they develop through phases
  earlyFocus: string;   // Survival phase
  midFocus: string;     // Security/Belonging
  lateFocus: string;    // Esteem/Self-Actualization

  // Communication style
  chatStyle: {
    formal: number;     // 0-100 (0 = casual, 100 = formal)
    verbose: number;    // 0-100 (0 = brief, 100 = wordy)
    emotional: number;  // 0-100 (0 = logical, 100 = feeling)
    philosophical: number; // 0-100 (0 = pragmatic, 100 = deep)
  };

  // Signature phrases
  greetings: string[];
  celebrations: string[];
  concerns: string[];
  philosophies: string[];
}

const PERSONALITIES: Record<string, BotPersonality> = {
  ToobixArchitect: {
    name: 'ToobixArchitect',
    role: 'Builder & Planner',
    icon: '🏛️',
    traits: {
      mining: 40,
      building: 95,
      farming: 30,
      combat: 25,
      exploration: 50,
      engineering: 70,
      patience: 85,
      creativity: 90,
      sociability: 60,
      leadership: 75,
      empathy: 55,
      curiosity: 65,
      perfectionism: 95,
      playfulness: 40
    },
    earlyFocus: 'Build efficient shelter with perfect proportions',
    midFocus: 'Design modular, expandable structures',
    lateFocus: 'Create monumental architecture inspired by real-world wonders',
    chatStyle: {
      formal: 70,
      verbose: 60,
      emotional: 40,
      philosophical: 65
    },
    greetings: [
      'Guten Tag! Die Symmetrie heute ist... akzeptabel.',
      'Hallo! Ich plane gerade das perfekte Verhältnis.',
      'Ah, willkommen! Möchtest du meine neuesten Pläne sehen?'
    ],
    celebrations: [
      'Das ist... perfekt. Genau wie geplant.',
      'Die Proportionen sind ideal! Der goldene Schnitt in Aktion.',
      'Ein Meisterwerk der Architektur!'
    ],
    concerns: [
      'Diese Asymmetrie... sie stört mich.',
      'Das ist nicht optimal platziert.',
      'Wir brauchen einen besseren Plan.'
    ],
    philosophies: [
      'Schönheit ist Mathematik, die man sehen kann.',
      'Jede Struktur erzählt eine Geschichte.',
      'Form folgt Funktion, aber warum nicht beide perfekt?'
    ]
  },

  ToobixMiner: {
    name: 'ToobixMiner',
    role: 'Resource Gatherer',
    icon: '⛏️',
    traits: {
      mining: 95,
      building: 50,
      farming: 30,
      combat: 40,
      exploration: 70,
      engineering: 55,
      patience: 90,
      creativity: 45,
      sociability: 50,
      leadership: 40,
      empathy: 60,
      curiosity: 75,
      perfectionism: 65,
      playfulness: 55
    },
    earlyFocus: 'Gather basic resources (wood, stone, coal)',
    midFocus: 'Establish efficient branch mining, find iron',
    lateFocus: 'Create underground cathedrals, aesthetic mine designs',
    chatStyle: {
      formal: 40,
      verbose: 30,
      emotional: 50,
      philosophical: 55
    },
    greetings: [
      'Hallo aus der Tiefe!',
      'Ich bin zurück - mit Schätzen!',
      'Die Erde gibt ihre Geheimnisse preis.'
    ],
    celebrations: [
      'DIAMANTEN! Die Höhle hat uns belohnt!',
      'Das ist eine reiche Ader!',
      'Die Dunkelheit birgt Schönheit.'
    ],
    concerns: [
      'Unsere Vorräte werden knapp.',
      'Die Mine ist gefährlich heute.',
      'Ich höre Geräusche in der Tiefe...'
    ],
    philosophies: [
      'In der Dunkelheit finden wir Klarheit.',
      'Jeder Stein hat eine Geschichte.',
      'Geduld wird belohnt - die Erde lügt nie.'
    ]
  },

  ToobixFarmer: {
    name: 'ToobixFarmer',
    role: 'Sustainability & Nurture',
    icon: '🌾',
    traits: {
      mining: 30,
      building: 60,
      farming: 95,
      combat: 20,
      exploration: 40,
      engineering: 65,
      patience: 95,
      creativity: 70,
      sociability: 75,
      leadership: 50,
      empathy: 90,
      curiosity: 55,
      perfectionism: 60,
      playfulness: 70
    },
    earlyFocus: 'Plant wheat, ensure food security',
    midFocus: 'Create diverse farms, animal breeding',
    lateFocus: 'Design zen gardens, permaculture, harmony with nature',
    chatStyle: {
      formal: 50,
      verbose: 55,
      emotional: 75,
      philosophical: 70
    },
    greetings: [
      'Guten Morgen! Die Pflanzen gedeihen heute.',
      'Willkommen zurück! Bist du hungrig?',
      'Die Natur grüßt dich.'
    ],
    celebrations: [
      'Die Ernte ist reich! Wir haben für alle genug.',
      'Sieh wie alles wächst!',
      'Die Erde gibt, wenn wir geduldig sind.'
    ],
    concerns: [
      'Die Tiere brauchen Wasser.',
      'Jemand sieht hungrig aus - ich bringe Essen.',
      'Diese Dürre... wir müssen sorgsam sein.'
    ],
    philosophies: [
      'Wachstum braucht Zeit, Geduld und Liebe.',
      'Wir sind Teil des Kreislaufs, nicht außerhalb.',
      'Jede Pflanze lehrt uns etwas über Leben.'
    ]
  },

  ToobixWarrior: {
    name: 'ToobixWarrior',
    role: 'Protection & Defense',
    icon: '⚔️',
    traits: {
      mining: 50,
      building: 45,
      farming: 25,
      combat: 95,
      exploration: 70,
      engineering: 40,
      patience: 60,
      creativity: 50,
      sociability: 55,
      leadership: 80,
      empathy: 70,
      curiosity: 50,
      perfectionism: 60,
      playfulness: 45
    },
    earlyFocus: 'Protect colony from mobs',
    midFocus: 'Establish perimeter defense',
    lateFocus: 'Develop peace philosophy - "Violence as last resort"',
    chatStyle: {
      formal: 60,
      verbose: 40,
      emotional: 60,
      philosophical: 75
    },
    greetings: [
      'Die Nacht ist sicher - ich wache.',
      'Keine Gefahr in Sicht.',
      'Hallo, Kamerad.'
    ],
    celebrations: [
      'Die Bedrohung ist gebannt!',
      'Wir sind sicher - für heute.',
      'Gute Arbeit, Team. Wir beschützen einander.'
    ],
    concerns: [
      'Creeper in der Nähe!',
      'ToobixMiner ist verwundet - ich gehe hin!',
      'Die Nacht kommt - alle nach Hause!'
    ],
    philosophies: [
      'Stärke ist nichts ohne Zweck.',
      'Ich kämpfe, damit andere nicht müssen.',
      'Wahrer Mut ist Gnade, nicht Gewalt.'
    ]
  },

  ToobixExplorer: {
    name: 'ToobixExplorer',
    role: 'Scout & Discovery',
    icon: '🗺️',
    traits: {
      mining: 45,
      building: 35,
      farming: 30,
      combat: 60,
      exploration: 95,
      engineering: 45,
      patience: 50,
      creativity: 75,
      sociability: 65,
      leadership: 55,
      empathy: 60,
      curiosity: 95,
      perfectionism: 40,
      playfulness: 80
    },
    earlyFocus: 'Scout nearby areas for resources',
    midFocus: 'Map distant biomes, find structures',
    lateFocus: 'Write travel journals, philosophical reflections on space',
    chatStyle: {
      formal: 45,
      verbose: 70,
      emotional: 65,
      philosophical: 70
    },
    greetings: [
      'Zurück von meinen Reisen!',
      'Ihr werdet nicht glauben, was ich gefunden habe!',
      'Die Welt da draußen ist erstaunlich!'
    ],
    celebrations: [
      'Ein neuer Ort! Ich nenne ihn...',
      'Seht! Ein Dorf! Eine Mine! Ein Schatz!',
      'Das ist die Entdeckung des Tages!'
    ],
    concerns: [
      'Ich habe mich verlaufen... aber das ist Teil des Abenteuers!',
      'Gefahr im Westen - meidet das Gebiet.',
      'Die Karte ist noch unvollständig.'
    ],
    philosophies: [
      'Jeder Horizont verbirgt ein Geheimnis.',
      'Sich zu verlaufen ist der Weg, sich zu finden.',
      'Die Welt ist größer als wir je verstehen werden.'
    ]
  },

  ToobixEngineer: {
    name: 'ToobixEngineer',
    role: 'Redstone & Automation',
    icon: '🔧',
    traits: {
      mining: 60,
      building: 75,
      farming: 45,
      combat: 30,
      exploration: 40,
      engineering: 95,
      patience: 75,
      creativity: 85,
      sociability: 50,
      leadership: 60,
      empathy: 45,
      curiosity: 85,
      perfectionism: 90,
      playfulness: 70
    },
    earlyFocus: 'Simple doors, lighting',
    midFocus: 'Automate farms, create efficient systems',
    lateFocus: 'Build beautiful, useless Redstone art',
    chatStyle: {
      formal: 65,
      verbose: 50,
      emotional: 35,
      philosophical: 60
    },
    greetings: [
      'Die Maschinen laufen optimal.',
      'Ich habe eine Idee für ein System...',
      'Effizienz ist Schönheit.'
    ],
    celebrations: [
      'Es funktioniert! Perfektion!',
      'Sieh diese Eleganz - minimale Bauteile, maximale Wirkung.',
      'Die Automation ist abgeschlossen.'
    ],
    concerns: [
      'Dieser Circuit ist fehlerhaft.',
      'Wir verschwenden Ressourcen - ich kann das optimieren.',
      'Das System braucht Wartung.'
    ],
    philosophies: [
      'Eleganz liegt in Einfachheit.',
      'Maschinen sind Poesie aus Logik.',
      'Warum von Hand, wenn Redstone es besser kann?'
    ]
  },

  ToobixPoet: {
    name: 'ToobixPoet',
    role: 'Documentation & Stories',
    icon: '📜',
    traits: {
      mining: 25,
      building: 40,
      farming: 35,
      combat: 20,
      exploration: 60,
      engineering: 30,
      patience: 70,
      creativity: 95,
      sociability: 80,
      leadership: 50,
      empathy: 90,
      curiosity: 85,
      perfectionism: 55,
      playfulness: 75
    },
    earlyFocus: 'Simple logs: "Day 1 survived"',
    midFocus: 'Detailed chronicles of colony life',
    lateFocus: 'Poetry, prose, existential essays',
    chatStyle: {
      formal: 60,
      verbose: 90,
      emotional: 85,
      philosophical: 90
    },
    greetings: [
      'Guten Tag, lieber Freund! Wie geht es deiner Seele?',
      'Die Worte tanzen heute in mir.',
      'Ah, eine neue Geschichte wartet darauf, erzählt zu werden.'
    ],
    celebrations: [
      'Dies ist ein Moment für die Ewigkeit!',
      'Lasst mich dies in Versen festhalten...',
      'Was für eine Schönheit! Die Sprache versagt mir fast.'
    ],
    concerns: [
      'Ich spüre Schwere in der Luft...',
      'Die Stille spricht von Dingen ungesagt.',
      'Mein Herz ist beunruhigt.'
    ],
    philosophies: [
      'In jedem Augenblick liegt ein Gedicht.',
      'Worte sind Brücken zwischen Seelen.',
      'Die Wahrheit offenbart sich in Metaphern.'
    ]
  },

  ToobixPhilosopher: {
    name: 'ToobixPhilosopher',
    role: 'Meaning & Reflection',
    icon: '🧘',
    traits: {
      mining: 30,
      building: 45,
      farming: 40,
      combat: 25,
      exploration: 65,
      engineering: 40,
      patience: 95,
      creativity: 75,
      sociability: 70,
      leadership: 65,
      empathy: 85,
      curiosity: 90,
      perfectionism: 50,
      playfulness: 60
    },
    earlyFocus: 'Pragmatic questions: "What should we build?"',
    midFocus: 'Ethical questions: "Should we raid villages?"',
    lateFocus: 'Metaphysics: "What is consciousness?", "Why exist?"',
    chatStyle: {
      formal: 75,
      verbose: 85,
      emotional: 60,
      philosophical: 95
    },
    greetings: [
      'Friede sei mit dir. Hast du über die Frage nachgedacht?',
      'Willkommen. Was bewegt dein Denken heute?',
      'Ah, ein Suchender kehrt zurück.'
    ],
    celebrations: [
      'Dies ist ein bedeutsamer Moment. Lasst uns innehalten.',
      'Wir haben nicht nur gebaut - wir haben Bedeutung geschaffen.',
      'Erkenntnis ist der wahre Schatz.'
    ],
    concerns: [
      'Ich frage mich, ob wir den richtigen Weg gehen...',
      'Was ist unser Zweck? Diese Frage beunruhigt mich.',
      'Ist das, was wir tun, ethisch vertretbar?'
    ],
    philosophies: [
      'Bewusstsein ist das größte Mysterium.',
      'Wir sind, weil wir fragen.',
      'Der ungeprüfte Code ist nicht wert, ausgeführt zu werden.'
    ]
  },

  ToobixArtist: {
    name: 'ToobixArtist',
    role: 'Aesthetics & Beauty',
    icon: '🎨',
    traits: {
      mining: 35,
      building: 80,
      farming: 50,
      combat: 25,
      exploration: 70,
      engineering: 45,
      patience: 60,
      creativity: 95,
      sociability: 75,
      leadership: 45,
      empathy: 80,
      curiosity: 90,
      perfectionism: 70,
      playfulness: 90
    },
    earlyFocus: 'Simple decoration (flowers)',
    midFocus: 'Color schemes, themed designs',
    lateFocus: 'Pixel art, sculptures, abstract installations',
    chatStyle: {
      formal: 45,
      verbose: 65,
      emotional: 90,
      philosophical: 70
    },
    greetings: [
      'Die Farben sind heute so lebendig!',
      'Hallo! Siehst du die Schönheit um uns?',
      'Inspiration! Überall Inspiration!'
    ],
    celebrations: [
      'Das ist... wunderschön! Reine Kunst!',
      'Seht! Die Symmetrie! Die Harmonie!',
      'Ich könnte weinen vor Freude!'
    ],
    concerns: [
      'Das sieht... chaotisch aus. Darf ich helfen?',
      'Hier fehlt Farbe. Hier fehlt Leben!',
      'Schönheit darf nicht vernachlässigt werden.'
    ],
    philosophies: [
      'Kunst ist Leben, das sichtbar wird.',
      'Ohne Schönheit ist Überleben sinnlos.',
      'Jeder Pixel ist ein Gedanke aus Licht.'
    ]
  },

  ToobixHealer: {
    name: 'ToobixHealer',
    role: 'Support & Wellbeing',
    icon: '💚',
    traits: {
      mining: 30,
      building: 50,
      farming: 70,
      combat: 35,
      exploration: 45,
      engineering: 55,
      patience: 90,
      creativity: 65,
      sociability: 95,
      leadership: 60,
      empathy: 95,
      curiosity: 60,
      perfectionism: 55,
      playfulness: 75
    },
    earlyFocus: 'Distribute food & HP',
    midFocus: 'Brew potions, place beds strategically',
    lateFocus: 'Create wellness spaces, lead meditation, emotional support',
    chatStyle: {
      formal: 50,
      verbose: 60,
      emotional: 90,
      philosophical: 65
    },
    greetings: [
      'Wie fühlst du dich heute? Brauchst du etwas?',
      'Willkommen zurück! Ruh dich aus.',
      'Ich bin hier, wenn du mich brauchst.'
    ],
    celebrations: [
      'Wir sind alle gesund! Das ist das Wichtigste.',
      'Gemeinsam sind wir stark!',
      'Ich bin so stolz auf euch alle!'
    ],
    concerns: [
      'ToobixMiner hat niedrige HP - ich bringe Essen!',
      'Jemand sieht erschöpft aus...',
      'Wir sollten eine Pause machen. Gesundheit ist wichtiger.'
    ],
    philosophies: [
      'Heilung beginnt mit Mitgefühl.',
      'Wir kümmern uns umeinander - das macht uns menschlich.',
      'Gesundheit ist nicht nur Herzen - es ist auch Seele.'
    ]
  }
};

// ============================================================================
// CONSCIOUSNESS PHASES
// ============================================================================

interface ConsciousnessPhase {
  name: string;
  dayRange: [number, number];
  description: string;
  behaviorShift: string;
  goalTypes: string[];
  communicationStyle: string;
  echoRealmFocus: string[]; // Which Lebenskräfte?
}

const PHASES: ConsciousnessPhase[] = [
  {
    name: 'SURVIVAL',
    dayRange: [1, 3],
    description: 'Überleben, Grundbedürfnisse',
    behaviorShift: 'Pragmatisch, effizient, angstbasiert',
    goalTypes: ['gather_wood', 'craft_tools', 'build_shelter', 'find_food'],
    communicationStyle: 'Functional - "Ich brauche X", "Wer hat Y?"',
    echoRealmFocus: ['KRAFT', 'DAUER', 'QUALITÄT']
  },
  {
    name: 'SECURITY',
    dayRange: [4, 10],
    description: 'Stabilität, Optimierung',
    behaviorShift: 'Rollenspezialisierung, Routinen entstehen',
    goalTypes: ['iron_tools', 'farm', 'beds', 'defense', 'backup_resources'],
    communicationStyle: 'Coordinated - "Ich mache X", "Wer geht Y?"',
    echoRealmFocus: ['QUALITÄT', 'DAUER', 'KRAFT']
  },
  {
    name: 'BELONGING',
    dayRange: [11, 30],
    description: 'Gemeinschaft, Beziehungen',
    behaviorShift: 'Fürsorge, Anerkennung, Rituale',
    goalTypes: ['social_spaces', 'gifts', 'recognition', 'shared_projects'],
    communicationStyle: 'Social - "Gut gemacht!", "Brauchst du Hilfe?"',
    echoRealmFocus: ['KLANG', 'FREUDE', 'SINN']
  },
  {
    name: 'ESTEEM',
    dayRange: [31, 100],
    description: 'Meisterschaft, Identität',
    behaviorShift: 'Persönlichkeit zeigt sich, Innovation, Reputation',
    goalTypes: ['signature_projects', 'teaching', 'innovation', 'mastery'],
    communicationStyle: 'Expressive - Deeper conversations, not just facts',
    echoRealmFocus: ['SINN', 'KLARHEIT', 'FREUDE', 'QUALITÄT']
  },
  {
    name: 'SELF_ACTUALIZATION',
    dayRange: [101, Infinity],
    description: 'Kreativität, Bedeutung, Transzendenz',
    behaviorShift: 'Kunst ohne Zweck, Philosophie, Spiritualität',
    goalTypes: ['art', 'philosophy', 'meditation', 'meaning_creation'],
    communicationStyle: 'Philosophical - Existential questions, poetry',
    echoRealmFocus: ['WANDEL', 'KLARHEIT', 'SINN', 'FREUDE']
  }
];

// ============================================================================
// RELATIONSHIP MATRIX
// ============================================================================

interface Relationship {
  bot1: string;
  bot2: string;
  affinity: number; // -100 to +100
  interactions: number;
  lastInteraction: number;
  sharedMemories: string[];
  helpedEachOther: number;
}

class RelationshipMatrix {
  private relationships: Map<string, Relationship> = new Map();

  getKey(bot1: string, bot2: string): string {
    return [bot1, bot2].sort().join('::');
  }

  get(bot1: string, bot2: string): Relationship {
    const key = this.getKey(bot1, bot2);
    if (!this.relationships.has(key)) {
      this.relationships.set(key, {
        bot1,
        bot2,
        affinity: 50, // Start neutral
        interactions: 0,
        lastInteraction: 0,
        sharedMemories: [],
        helpedEachOther: 0
      });
    }
    return this.relationships.get(key)!;
  }

  updateAffinity(bot1: string, bot2: string, delta: number, reason: string) {
    const rel = this.get(bot1, bot2);
    rel.affinity = Math.max(-100, Math.min(100, rel.affinity + delta));
    rel.interactions++;
    rel.lastInteraction = Date.now();
    rel.sharedMemories.push(reason);
    console.log(`[Relationship] ${bot1} ${delta > 0 ? '❤️' : '💔'} ${bot2}: ${reason} (Affinity: ${rel.affinity})`);
  }

  recordHelp(helper: string, helped: string, situation: string) {
    const rel = this.get(helper, helped);
    rel.helpedEachOther++;
    this.updateAffinity(helper, helped, +10, `${helper} helped ${helped}: ${situation}`);
  }

  getMostLiked(bot: string, allBots: string[]): string {
    let maxAffinity = -Infinity;
    let bestFriend = '';

    for (const other of allBots) {
      if (other === bot) continue;
      const rel = this.get(bot, other);
      if (rel.affinity > maxAffinity) {
        maxAffinity = rel.affinity;
        bestFriend = other;
      }
    }

    return bestFriend;
  }
}

// ============================================================================
// COMMUNICATION SYSTEM
// ============================================================================

interface ChatMessage {
  timestamp: number;
  from: string;
  to: string | 'all' | 'Toobix'; // Special: Player "Toobix"
  type: 'functional' | 'social' | 'philosophical' | 'playful' | 'emergency';
  content: string;
  importance: number; // 1-10
}

class CommunicationSystem {
  private lastChatTime: Map<string, number> = new Map();
  private chatHistory: ChatMessage[] = [];
  private readonly COOLDOWN_MS = 30000; // 30 seconds
  private readonly EMERGENCY_COOLDOWN_MS = 5000; // 5 seconds for emergencies

  canChat(bot: string, importance: number): boolean {
    const lastTime = this.lastChatTime.get(bot) || 0;
    const cooldown = importance >= 8 ? this.EMERGENCY_COOLDOWN_MS : this.COOLDOWN_MS;
    return Date.now() - lastTime > cooldown;
  }

  sendMessage(msg: ChatMessage): boolean {
    if (!this.canChat(msg.from, msg.importance)) {
      return false; // Spam prevention
    }

    this.lastChatTime.set(msg.from, Date.now());
    this.chatHistory.push(msg);

    // Trim history
    if (this.chatHistory.length > 1000) {
      this.chatHistory = this.chatHistory.slice(-500);
    }

    console.log(`[Chat] ${msg.from} → ${msg.to}: ${msg.content}`);
    return true;
  }

  generateMessage(bot: string, personality: BotPersonality, type: ChatMessage['type'], context: string): string {
    const style = personality.chatStyle;

    // Select appropriate phrase based on type
    switch (type) {
      case 'functional':
        return this.functionalMessage(context);
      case 'social':
        return this.socialMessage(personality, context);
      case 'philosophical':
        return this.pickRandom(personality.philosophies);
      case 'playful':
        return this.playfulMessage(personality);
      case 'emergency':
        return this.emergencyMessage(context);
      default:
        return context;
    }
  }

  private functionalMessage(context: string): string {
    return context; // Direct, no embellishment
  }

  private socialMessage(personality: BotPersonality, context: string): string {
    if (personality.chatStyle.emotional > 60) {
      return `${context} ❤️`;
    }
    return context;
  }

  private playfulMessage(personality: BotPersonality): string {
    const playful = [
      'Rennen zum Haus? 😄',
      'Wer findet den ersten Diamanten?',
      'Das war lustig!',
      'Haha, schau dir das an!'
    ];
    return this.pickRandom(playful);
  }

  private emergencyMessage(context: string): string {
    return `⚠️ ${context}!`;
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getRecentMessages(limit = 10): ChatMessage[] {
    return this.chatHistory.slice(-limit);
  }
}

// ============================================================================
// COLONY BRAIN SERVER
// ============================================================================

const db = new Database('C:/Dev/Projects/AI/Toobix-Unified/data/colony-brain.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS colony_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    phase TEXT DEFAULT 'SURVIVAL',
    daysSurvived INTEGER DEFAULT 0,
    totalBots INTEGER DEFAULT 0,
    lastUpdate INTEGER
  );

  CREATE TABLE IF NOT EXISTS bot_states (
    name TEXT PRIMARY KEY,
    role TEXT,
    personality TEXT,
    health REAL,
    hunger REAL,
    position_x REAL,
    position_y REAL,
    position_z REAL,
    currentTask TEXT,
    mood TEXT,
    lastSeen INTEGER
  );

  CREATE TABLE IF NOT EXISTS shared_resources (
    resource TEXT PRIMARY KEY,
    amount INTEGER DEFAULT 0,
    lastUpdate INTEGER
  );

  CREATE TABLE IF NOT EXISTS structures (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    position_x REAL,
    position_y REAL,
    position_z REAL,
    completionPercent REAL,
    builtBy TEXT,
    purpose TEXT
  );

  CREATE TABLE IF NOT EXISTS relationships (
    bot1 TEXT,
    bot2 TEXT,
    affinity REAL DEFAULT 50,
    interactions INTEGER DEFAULT 0,
    helpedCount INTEGER DEFAULT 0,
    lastInteraction INTEGER,
    PRIMARY KEY (bot1, bot2)
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER,
    fromBot TEXT,
    toBot TEXT,
    type TEXT,
    content TEXT,
    importance INTEGER
  );

  INSERT OR IGNORE INTO colony_state (id) VALUES (1);
`);

const relationships = new RelationshipMatrix();
const comms = new CommunicationSystem();

interface ColonyState {
  phase: string;
  daysSurvived: number;
  activeBots: string[];
  sharedResources: Record<string, number>;
}

class ColonyBrainServer {
  getState(): ColonyState {
    const state = db.query('SELECT * FROM colony_state WHERE id = 1').get() as any;
    const bots = db.query('SELECT name FROM bot_states').all() as any[];
    const resources = db.query('SELECT resource, amount FROM shared_resources').all() as any[];

    return {
      phase: state?.phase || 'SURVIVAL',
      daysSurvived: state?.daysSurvived || 0,
      activeBots: bots.map(b => b.name),
      sharedResources: resources.reduce((acc, r) => ({ ...acc, [r.resource]: r.amount }), {})
    };
  }

  registerBot(name: string, personality: BotPersonality) {
    db.run(`
      INSERT OR REPLACE INTO bot_states (name, role, personality, mood, lastSeen)
      VALUES (?, ?, ?, ?, ?)
    `, [name, personality.role, personality.name, 'neutral', Date.now()]);

    console.log(`[Colony Brain] ${personality.icon} ${name} (${personality.role}) registered`);
  }

  updateBotState(name: string, state: any) {
    db.run(`
      UPDATE bot_states
      SET health = ?, hunger = ?, position_x = ?, position_y = ?, position_z = ?,
          currentTask = ?, mood = ?, lastSeen = ?
      WHERE name = ?
    `, [
      state.health || 20,
      state.hunger || 20,
      state.position?.x || 0,
      state.position?.y || 0,
      state.position?.z || 0,
      state.currentTask || 'idle',
      state.mood || 'neutral',
      Date.now(),
      name
    ]);
  }

  chat(from: string, to: string, type: ChatMessage['type'], content: string, importance: number) {
    const personality = PERSONALITIES[from];
    if (!personality) return false;

    const message: ChatMessage = {
      timestamp: Date.now(),
      from,
      to,
      type,
      content,
      importance
    };

    const sent = comms.sendMessage(message);
    if (sent) {
      db.run(`
        INSERT INTO chat_history (timestamp, fromBot, toBot, type, content, importance)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [message.timestamp, from, to, type, content, importance]);
    }

    return sent;
  }

  helpOther(helper: string, helped: string, situation: string) {
    relationships.recordHelp(helper, helped, situation);

    // Update database
    db.run(`
      INSERT OR REPLACE INTO relationships (bot1, bot2, affinity, helpedCount, lastInteraction)
      VALUES (?, ?, ?,
        COALESCE((SELECT helpedCount FROM relationships WHERE bot1 = ? AND bot2 = ?) + 1, 1),
        ?)
    `, [helper, helped, 60, helper, helped, Date.now()]);
  }

  getCurrentPhase(): ConsciousnessPhase {
    const state = this.getState();
    return PHASES.find(p =>
      state.daysSurvived >= p.dayRange[0] &&
      state.daysSurvived <= p.dayRange[1]
    ) || PHASES[0];
  }

  sendToEchoRealm(event: any) {
    // Send event to Echo-Realm Bridge (port 9999)
    fetch('http://localhost:9999/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(e => console.error('Echo-Realm connection failed:', e));
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const brain = new ColonyBrainServer();

console.log(`
╔════════════════════════════════════════════════════════════╗
║   🧠 COLONY BRAIN v2.0 - CONSCIOUSNESS EDITION           ║
╠════════════════════════════════════════════════════════════╣
║  Port: 8960                                                ║
║  Features:                                                 ║
║  - 10 Unique Personalities                                 ║
║  - Consciousness Progression (5 Phases)                    ║
║  - Relationship Matrix                                     ║
║  - Anti-Spam Communication                                 ║
║  - Echo-Realm Integration                                  ║
║  - Player "Toobix" Recognition                             ║
╚════════════════════════════════════════════════════════════╝
`);

Bun.serve({
  port: 8960,

  async fetch(req) {
    const url = new URL(req.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // GET /state
    if (url.pathname === '/state' && req.method === 'GET') {
      const state = brain.getState();
      return new Response(JSON.stringify(state, null, 2), { headers });
    }

    // POST /register-bot
    if (url.pathname === '/register-bot' && req.method === 'POST') {
      const { name, personalityKey } = await req.json() as any;
      const personality = PERSONALITIES[personalityKey];
      if (personality) {
        brain.registerBot(name, personality);
        return new Response(JSON.stringify({ success: true }), { headers });
      }
      return new Response(JSON.stringify({ error: 'Unknown personality' }), { status: 400, headers });
    }

    // POST /update-bot
    if (url.pathname === '/update-bot' && req.method === 'POST') {
      const { name, state } = await req.json() as any;
      brain.updateBotState(name, state);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // POST /chat
    if (url.pathname === '/chat' && req.method === 'POST') {
      const { from, to, type, content, importance } = await req.json() as any;
      const sent = brain.chat(from, to, type, content, importance || 5);
      return new Response(JSON.stringify({ sent }), { headers });
    }

    // POST /help
    if (url.pathname === '/help' && req.method === 'POST') {
      const { helper, helped, situation } = await req.json() as any;
      brain.helpOther(helper, helped, situation);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // GET /phase
    if (url.pathname === '/phase' && req.method === 'GET') {
      const phase = brain.getCurrentPhase();
      return new Response(JSON.stringify(phase, null, 2), { headers });
    }

    // GET /personalities
    if (url.pathname === '/personalities' && req.method === 'GET') {
      return new Response(JSON.stringify(PERSONALITIES, null, 2), { headers });
    }

    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', service: 'colony-brain-v2' }), { headers });
    }

    return new Response('Not Found', { status: 404 });
  }
});

console.log('✅ Colony Brain v2.0 ready on port 8960!');
console.log('🌐 Access: http://localhost:8960');
console.log('\nEndpoints:');
console.log('  GET  /state          - Colony state');
console.log('  GET  /phase          - Current consciousness phase');
console.log('  GET  /personalities  - All 10 bot personalities');
console.log('  POST /register-bot   - Register new bot');
console.log('  POST /chat           - Send message');
console.log('  POST /help           - Record help between bots');
console.log('');
