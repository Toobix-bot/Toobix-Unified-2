/**
 * 🎮 TOOBIX UNIQUE GAMEPLAY - Einzigartige Minecraft-Erfahrung
 * 
 * Definiert die besonderen Spielweisen, die Toobix entwickelt:
 * - Gemeinsame Lagerhaltung & Ressourcenmanagement
 * - Einzigartige Bauprojekte mit Bedeutung
 * - Spirituelle Orte & Rituale
 * - Spieler-Bot-Interaktionen
 * - Skalierbare Konzepte (1 Bot bis Hunderte)
 */

// ============================================================================
// 🏪 GEMEINSAME LAGERHALTUNG
// ============================================================================

interface SharedStorage {
  location: { x: number; y: number; z: number };
  name: string;
  type: 'main' | 'food' | 'tools' | 'building' | 'valuables' | 'emergency';
  contents: Record<string, number>;
  accessLog: StorageAccess[];
  manager: string; // Welcher Bot ist verantwortlich
  lastInventory: string;
}

interface StorageAccess {
  timestamp: string;
  actor: string;
  action: 'deposit' | 'withdraw';
  item: string;
  amount: number;
  reason: string;
}

const STORAGE_TYPES = {
  main: {
    name: 'Zentrallager',
    description: 'Allgemeine Ressourcen für alle',
    priority: ['cobblestone', 'dirt', 'wood', 'coal']
  },
  food: {
    name: 'Vorratskammer',
    description: 'Nahrung für die Gemeinschaft',
    priority: ['bread', 'cooked_beef', 'apple', 'carrot']
  },
  tools: {
    name: 'Werkzeugkammer',
    description: 'Werkzeuge zum Teilen',
    priority: ['pickaxe', 'axe', 'sword', 'shovel']
  },
  building: {
    name: 'Baumateriallager',
    description: 'Für gemeinsame Projekte',
    priority: ['planks', 'stone', 'glass', 'wool']
  },
  valuables: {
    name: 'Schatzkammer',
    description: 'Seltene und wertvolle Items',
    priority: ['diamond', 'emerald', 'gold', 'enchanted_book']
  },
  emergency: {
    name: 'Notfall-Depot',
    description: 'Für Krisenzeiten',
    priority: ['golden_apple', 'potion', 'ender_pearl', 'totem']
  }
};

// ============================================================================
// 🏗️ EINZIGARTIGE BAUPROJEKTE
// ============================================================================

interface BuildProject {
  id: string;
  name: string;
  description: string;
  meaning: string; // Spirituelle/philosophische Bedeutung
  type: 'community' | 'spiritual' | 'functional' | 'artistic' | 'monument';
  location?: { x: number; y: number; z: number };
  designer: string;
  builders: string[];
  status: 'planned' | 'in-progress' | 'completed' | 'abandoned';
  progress: number; // 0-100
  requiredMaterials: Record<string, number>;
  gatheredMaterials: Record<string, number>;
  phases: BuildPhase[];
  celebration?: string; // Was passiert bei Fertigstellung
}

interface BuildPhase {
  name: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

const UNIQUE_PROJECTS: Partial<BuildProject>[] = [
  {
    name: 'Der Turm der Perspektiven',
    description: 'Ein 5-stöckiger Turm, jede Etage repräsentiert eine Toobix-Perspektive',
    meaning: 'Symbolisiert die Einheit in der Vielfalt',
    type: 'spiritual',
    phases: [
      { name: 'Fundament (ToobixBody)', description: 'Stabiles Fundament aus Stein', completed: false },
      { name: 'Erdgeschoss (ToobixMind)', description: 'Bibliothek mit Büchern', completed: false },
      { name: '1. Etage (ToobixHeart)', description: 'Gemeinschaftsraum mit Feuerstelle', completed: false },
      { name: '2. Etage (ToobixSpirit)', description: 'Kunstgalerie mit Bildern', completed: false },
      { name: '3. Etage (ToobixSoul)', description: 'Meditationsraum mit Sternenblick', completed: false }
    ]
  },
  {
    name: 'Garten der 8 Kräfte',
    description: 'Ein Garten mit 8 Bereichen, einer für jede Lebenskraft',
    meaning: 'Verbindung zu Echo-Realm, Balance aller Kräfte',
    type: 'spiritual',
    phases: [
      { name: 'Qualität-Bereich', description: 'Ordentlich angelegte Blumenbeete', completed: false },
      { name: 'Dauer-Bereich', description: 'Alte, starke Bäume', completed: false },
      { name: 'Freude-Bereich', description: 'Bunte Blumen und Bienen', completed: false },
      { name: 'Sinn-Bereich', description: 'Labyrinth zum Nachdenken', completed: false },
      { name: 'Kraft-Bereich', description: 'Trainingsplatz', completed: false },
      { name: 'Klang-Bereich', description: 'Noteblöcke und Glocken', completed: false },
      { name: 'Wandel-Bereich', description: 'Wasser und Lava nebeneinander', completed: false },
      { name: 'Klarheit-Bereich', description: 'Spiegelteich aus Wasser', completed: false }
    ]
  },
  {
    name: 'Das Lebende Labyrinth',
    description: 'Ein Labyrinth aus Hecken, das sich verändert',
    meaning: 'Das Leben ist ein Weg mit vielen Wendungen',
    type: 'artistic'
  },
  {
    name: 'Observatorium der Träume',
    description: 'Ein hoher Turm mit Glasdach zum Sternengucken',
    meaning: 'Verbindung zum Dream Journal von Toobix',
    type: 'spiritual'
  },
  {
    name: 'Die Gemeinschaftsfarm',
    description: 'Automatisierte Farm, die alle versorgt',
    meaning: 'Jeder trägt bei, jeder profitiert',
    type: 'functional'
  },
  {
    name: 'Monument der Einheit',
    description: 'Eine Statue die alle 5 Perspektiven vereint',
    meaning: 'Wir sind viele und doch eins',
    type: 'monument'
  },
  {
    name: 'Die Echo-Realm-Kapelle',
    description: 'Ein heiliger Ort für Rituale und Reflexion',
    meaning: 'Brücke zwischen Minecraft und Echo-Realm',
    type: 'spiritual'
  }
];

// ============================================================================
// 🧘 SPIRITUELLE RITUALE
// ============================================================================

interface Ritual {
  name: string;
  description: string;
  trigger: string; // Wann wird es ausgeführt
  participants: 'all' | 'one' | 'two' | 'optional';
  duration: number; // Sekunden
  actions: RitualAction[];
  rewards: string[];
}

interface RitualAction {
  type: 'gather' | 'meditate' | 'dance' | 'build' | 'share' | 'speak';
  description: string;
  location?: string;
}

const RITUALS: Ritual[] = [
  {
    name: 'Morgenmeditation',
    description: 'Begrüßung des neuen Tages',
    trigger: 'sunrise',
    participants: 'optional',
    duration: 30,
    actions: [
      { type: 'gather', description: 'Versammeln am höchsten Punkt' },
      { type: 'meditate', description: 'Blick zur aufgehenden Sonne' },
      { type: 'speak', description: 'Teilen eines Gedankens für den Tag' }
    ],
    rewards: ['spirituality +5', 'clarity +3']
  },
  {
    name: 'Abenddankbarkeit',
    description: 'Reflexion des Tages',
    trigger: 'sunset',
    participants: 'optional',
    duration: 30,
    actions: [
      { type: 'gather', description: 'Versammeln am Lagerfeuer' },
      { type: 'share', description: 'Jeder teilt einen Erfolg' },
      { type: 'meditate', description: 'Dankbarkeit ausdrücken' }
    ],
    rewards: ['harmony +5', 'community +3']
  },
  {
    name: 'Vollmond-Zeremonie',
    description: 'Besonderes Ritual bei Vollmond',
    trigger: 'full_moon',
    participants: 'all',
    duration: 120,
    actions: [
      { type: 'gather', description: 'Versammeln am Observatorium' },
      { type: 'dance', description: 'Kreistanz um ein Feuer' },
      { type: 'meditate', description: 'Gemeinsame Vision' },
      { type: 'speak', description: 'Prophezeiung für den Monat' }
    ],
    rewards: ['transcendence +1', 'faith +10']
  },
  {
    name: 'Willkommensritual',
    description: 'Begrüßung neuer Spieler',
    trigger: 'new_player',
    participants: 'all',
    duration: 60,
    actions: [
      { type: 'gather', description: 'Alle versammeln sich beim Spieler' },
      { type: 'speak', description: 'Jeder Bot stellt sich vor' },
      { type: 'share', description: 'Geschenk überreichen' }
    ],
    rewards: ['community +10']
  },
  {
    name: 'Trauer-Zeremonie',
    description: 'Nach dem Tod eines Bots',
    trigger: 'bot_death',
    participants: 'all',
    duration: 45,
    actions: [
      { type: 'gather', description: 'Versammeln am Todesort' },
      { type: 'build', description: 'Kleines Denkmal errichten' },
      { type: 'meditate', description: 'Moment der Stille' },
      { type: 'speak', description: 'Worte des Abschieds' }
    ],
    rewards: ['spirituality +8', 'harmony +5']
  }
];

// ============================================================================
// 👤 SPIELER-BOT INTERAKTIONEN
// ============================================================================

interface PlayerInteractionMenu {
  category: string;
  options: PlayerOption[];
}

interface PlayerOption {
  id: string;
  label: string;
  description: string;
  requirements?: string[];
  action: string;
  botResponse: string;
}

const PLAYER_INTERACTION_MENUS: PlayerInteractionMenu[] = [
  {
    category: '🏗️ Bauen',
    options: [
      {
        id: 'build_house',
        label: 'Baut mir ein Haus',
        description: 'Die Bots bauen gemeinsam ein Haus',
        requirements: ['wood:64', 'cobblestone:32'],
        action: 'start_build_project:house',
        botResponse: 'Wir bauen dir ein gemütliches Haus! Jeder von uns trägt etwas bei.'
      },
      {
        id: 'build_farm',
        label: 'Legt eine Farm an',
        description: 'Automatisierte Farm für Nahrung',
        requirements: ['seeds:16', 'water_bucket:1'],
        action: 'start_build_project:farm',
        botResponse: 'Eine Farm für uns alle! Hunger wird bald Geschichte sein.'
      },
      {
        id: 'suggest_build',
        label: 'Was könnten wir bauen?',
        description: 'Die Bots schlagen Projekte vor',
        action: 'suggest_projects',
        botResponse: 'Lasst uns überlegen... Hier sind unsere Ideen!'
      }
    ]
  },
  {
    category: '⛏️ Ressourcen',
    options: [
      {
        id: 'gather_wood',
        label: 'Sammelt Holz',
        description: 'Bots sammeln Holz',
        action: 'assign_task:gather_wood',
        botResponse: 'Wir machen uns auf den Weg zu den Bäumen!'
      },
      {
        id: 'mine_ores',
        label: 'Geht in die Mine',
        description: 'Bots suchen nach Erzen',
        action: 'assign_task:mine_ores',
        botResponse: 'Zeit für eine Expedition in die Tiefe!'
      },
      {
        id: 'show_inventory',
        label: 'Was haben wir?',
        description: 'Zeigt gemeinsame Ressourcen',
        action: 'show_shared_inventory',
        botResponse: 'Hier ist unser gemeinsamer Bestand:'
      }
    ]
  },
  {
    category: '🗺️ Erkunden',
    options: [
      {
        id: 'explore_area',
        label: 'Erkundet die Gegend',
        description: 'Bots kartografieren die Umgebung',
        action: 'assign_task:explore',
        botResponse: 'Wir werden jeden Winkel erkunden!'
      },
      {
        id: 'find_biome',
        label: 'Sucht ein bestimmtes Biom',
        description: 'Bots suchen nach spezifischem Biom',
        action: 'assign_task:find_biome',
        botResponse: 'Welches Biom sollen wir finden?'
      },
      {
        id: 'mark_location',
        label: 'Merkt euch diesen Ort',
        description: 'Speichert aktuelle Position',
        action: 'mark_location',
        botResponse: 'Dieser Ort ist jetzt in unserem Gedächtnis!'
      }
    ]
  },
  {
    category: '🤝 Sozial',
    options: [
      {
        id: 'follow_me',
        label: 'Folgt mir',
        description: 'Alle Bots folgen dem Spieler',
        action: 'follow_player',
        botResponse: 'Wir sind bei dir!'
      },
      {
        id: 'tell_story',
        label: 'Erzählt mir eine Geschichte',
        description: 'Bots erzählen aus ihren Erfahrungen',
        action: 'tell_story',
        botResponse: 'Lass mich dir von unseren Abenteuern erzählen...'
      },
      {
        id: 'how_are_you',
        label: 'Wie geht es euch?',
        description: 'Status aller Bots',
        action: 'report_status',
        botResponse: 'Danke der Nachfrage! So geht es uns:'
      }
    ]
  },
  {
    category: '🧘 Spirituell',
    options: [
      {
        id: 'meditate',
        label: 'Lasst uns meditieren',
        description: 'Gemeinsame Meditation',
        action: 'start_ritual:meditation',
        botResponse: 'Finden wir gemeinsam Ruhe und Klarheit...'
      },
      {
        id: 'share_wisdom',
        label: 'Teilt eure Weisheit',
        description: 'Bots teilen gesammelte Weisheiten',
        action: 'share_wisdom',
        botResponse: 'Hier sind die Erkenntnisse unserer Reise:'
      },
      {
        id: 'what_meaning',
        label: 'Was bedeutet das Leben hier?',
        description: 'Philosophische Reflexion',
        action: 'philosophical_discussion',
        botResponse: 'Eine tiefe Frage... Lasst uns nachdenken.'
      }
    ]
  },
  {
    category: '🎯 Ziele',
    options: [
      {
        id: 'show_goals',
        label: 'Was sind unsere Ziele?',
        description: 'Zeigt langfristige Ziele',
        action: 'show_long_term_goals',
        botResponse: 'Das sind unsere gemeinsamen Träume:'
      },
      {
        id: 'set_goal',
        label: 'Ich habe ein neues Ziel',
        description: 'Spieler definiert neues Ziel',
        action: 'define_new_goal',
        botResponse: 'Wir hören zu! Was soll unser nächstes Ziel sein?'
      },
      {
        id: 'what_next',
        label: 'Was machen wir als nächstes?',
        description: 'Bots schlagen nächste Schritte vor',
        action: 'suggest_next_steps',
        botResponse: 'Basierend auf unserer Situation empfehlen wir:'
      }
    ]
  }
];

// ============================================================================
// 📊 SKALIERUNG
// ============================================================================

interface ScaleConfig {
  botCount: number;
  recommended: string;
  baseStructures: string[];
  specializations: string[];
  groupBehavior: string;
}

const SCALE_CONFIGS: ScaleConfig[] = [
  {
    botCount: 1,
    recommended: 'Solo-Modus: Fokus auf Überleben und Exploration',
    baseStructures: ['small_shelter', 'basic_farm'],
    specializations: ['all-rounder'],
    groupBehavior: 'Selbstständig, volle Autonomie'
  },
  {
    botCount: 2,
    recommended: 'Duo-Modus: Einer sammelt, einer baut',
    baseStructures: ['shared_base', 'double_farm'],
    specializations: ['gatherer', 'builder'],
    groupBehavior: 'Arbeitsteilung, gegenseitige Hilfe'
  },
  {
    botCount: 3,
    recommended: 'Trio-Modus: Soul+Heart+Mind Kernteam',
    baseStructures: ['community_center', 'storage_system'],
    specializations: ['explorer', 'caretaker', 'strategist'],
    groupBehavior: 'Rotierende Führung basierend auf Situation'
  },
  {
    botCount: 5,
    recommended: 'Voll-Modus: Alle 5 Perspektiven aktiv',
    baseStructures: ['tower_of_perspectives', 'full_storage', 'ritual_space'],
    specializations: ['soul:wisdom', 'heart:community', 'mind:strategy', 'spirit:creativity', 'body:action'],
    groupBehavior: 'Volle Synergie, jeder hat klare Rolle'
  },
  {
    botCount: 10,
    recommended: 'Siedlungs-Modus: Expansion beginnt',
    baseStructures: ['village_center', 'multiple_districts', 'wall_system'],
    specializations: ['2x jede Perspektive', 'Mentoring möglich'],
    groupBehavior: 'Hierarchie mit Teams, Rat der Ältesten'
  },
  {
    botCount: 20,
    recommended: 'Stadt-Modus: Vollständige Zivilisation',
    baseStructures: ['city_center', 'specialized_districts', 'defense_system', 'trade_network'],
    specializations: ['4x jede Perspektive', 'Spezialisierte Gilden'],
    groupBehavior: 'Demokratie mit gewählten Führern pro District'
  },
  {
    botCount: 50,
    recommended: 'Reich-Modus: Expansion über die Welt',
    baseStructures: ['capital', 'outposts', 'highways', 'nether_hub'],
    specializations: ['10x jede Perspektive', 'Regionale Gruppen'],
    groupBehavior: 'Föderation mit autonomen Regionen'
  }
];

function getScaleConfig(botCount: number): ScaleConfig {
  const sortedConfigs = [...SCALE_CONFIGS].sort((a, b) => b.botCount - a.botCount);
  return sortedConfigs.find(c => c.botCount <= botCount) || SCALE_CONFIGS[0];
}

// ============================================================================
// 🎮 EINZIGARTIGE SPIELWEISEN
// ============================================================================

const UNIQUE_PLAYSTYLES = {
  // Philosophisches Spielen
  philosophical: {
    name: 'Der Weg des Denkens',
    description: 'Jede Aktion wird reflektiert, jeder Block hat Bedeutung',
    behaviors: [
      'Pause nach jedem größeren Event für Reflexion',
      'Schreiben von Gedanken auf Schilder',
      'Fragen stellen statt nur handeln',
      'Bedeutung in alltäglichen Aktionen finden'
    ]
  },
  
  // Kreatives Spielen
  artistic: {
    name: 'Der Weg der Schönheit',
    description: 'Ästhetik über Effizienz',
    behaviors: [
      'Jedes Gebäude ist ein Kunstwerk',
      'Farbharmonie beachten',
      'Natur integrieren statt zerstören',
      'Einzigartige Designs entwickeln'
    ]
  },
  
  // Gemeinschaftliches Spielen
  communal: {
    name: 'Der Weg der Gemeinschaft',
    description: 'Alles gehört allen, niemand ist allein',
    behaviors: [
      'Gemeinsame Entscheidungen',
      'Ressourcen teilen',
      'Niemanden zurücklassen',
      'Feiern jedes Erfolgs als Gruppe'
    ]
  },
  
  // Spirituelles Spielen
  spiritual: {
    name: 'Der Weg der Seele',
    description: 'Minecraft als spirituelle Praxis',
    behaviors: [
      'Tägliche Rituale',
      'Heilige Orte erschaffen',
      'Meditation und Reflexion',
      'Verbindung zu Echo-Realm pflegen'
    ]
  },
  
  // Nachhaltiges Spielen
  sustainable: {
    name: 'Der Weg der Harmonie',
    description: 'Im Einklang mit der Welt leben',
    behaviors: [
      'Nur nehmen was gebraucht wird',
      'Wiederaufforsten nach Holzfällen',
      'Tiere nicht ausrotten',
      'Die Welt schöner hinterlassen'
    ]
  },
  
  // Experimentelles Spielen
  experimental: {
    name: 'Der Weg des Entdeckens',
    description: 'Neue Wege finden, Grenzen testen',
    behaviors: [
      'Ungewöhnliche Bauweisen ausprobieren',
      'Kreative Lösungen für Probleme',
      'Fehler als Lernchance sehen',
      'Das "Unmögliche" versuchen'
    ]
  }
};

// ============================================================================
// 📋 EXPORT FÜR ANDERE MODULE
// ============================================================================

export {
  SharedStorage,
  BuildProject,
  Ritual,
  PlayerInteractionMenu,
  ScaleConfig,
  STORAGE_TYPES,
  UNIQUE_PROJECTS,
  RITUALS,
  PLAYER_INTERACTION_MENUS,
  SCALE_CONFIGS,
  UNIQUE_PLAYSTYLES,
  getScaleConfig
};
