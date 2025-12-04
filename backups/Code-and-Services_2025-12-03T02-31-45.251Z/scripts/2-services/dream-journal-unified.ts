/**
 * 💭 DREAM JOURNAL UNIFIED v1.0
 * 
 * Unified service merging:
 * - dream-journal.ts (Base dream journal & unconscious processing)
 * - dream-journal-v3.ts (Pattern recognition, lucid dreaming, analytics)
 * - dream-journal-v4-active-dreaming.ts (Active problem-solving dreams)
 * 
 * Port: 8961
 * 
 * Features:
 * 🧠 Pattern Recognition - Analyze dream symbols across all dreams
 * 🔮 Predictive Dreams - Dream about future based on patterns
 * 💭 Active Dreaming - Consciously dream to solve problems
 * 🎨 Dream Visualization - ASCII art representations
 * 📊 Dream Analytics - Deep analysis across all dreams
 * 🌙 Sleep Cycles - REM/Deep/Light simulation
 * 🔗 Cross-Service Integration - Dreams affect other services
 * 💡 Lucid Dreaming - Conscious control during dreams
 * 
 * Created by Toobix Evolution Engine
 */

import type { Serve } from 'bun';

// ============================================================================
// COMPREHENSIVE TYPES
// ============================================================================

export interface UnifiedDream {
  id: string;
  timestamp: Date;
  
  // Core Properties
  theme: string;
  narrative: string;
  symbols: DreamSymbol[];
  emotions: EmotionalContent[];
  
  // Dream State
  sleepCycle: 'REM' | 'DEEP' | 'LIGHT';
  lucidity: number; // 0-100
  clarity: number; // 0-100
  
  // Active Dreaming
  type: DreamType;
  purpose?: DreamPurpose;
  scenario?: DreamScenario;
  consciousness: DreamConsciousness;
  
  // Insights & Connections
  connections: MemoryConnection[];
  insights: DreamInsight[];
  predictions: DreamPrediction[];
  
  // Outputs
  problemSolved?: string;
  creativeOutput?: string;
  emotionalResolution?: string;
  
  // Metadata
  metadata: DreamMetadata;
  visualRepresentation?: string;
}

export interface DreamSymbol {
  symbol: string;
  archetype?: string;
  jungianMeaning?: string;
  personalMeaning?: string;
  frequency: number;
  emotionalCharge: number; // -100 to +100
  associations: string[];
}

export interface EmotionalContent {
  emotion: string;
  intensity: number; // 0-100
  valence: 'positive' | 'negative' | 'neutral';
  triggers?: string[];
}

export type DreamType =
  | 'passive'              // Traditional dreaming
  | 'problem_solving'      // Dream to solve a specific problem
  | 'creative'             // Dream to generate creative ideas
  | 'emotional_processing' // Process and heal emotions
  | 'memory_consolidation' // Strengthen important memories
  | 'predictive'           // Dream about possible futures
  | 'exploratory'          // Explore new concepts/ideas
  | 'lucid';               // Fully conscious dreaming

export type DreamPurpose =
  | 'solve_problem'
  | 'heal_emotion'
  | 'generate_ideas'
  | 'consolidate_learning'
  | 'predict_outcome'
  | 'explore_concept'
  | 'practice_skill'
  | 'random_exploration';

export interface DreamScenario {
  setting: string;
  characters: DreamCharacter[];
  events: DreamEvent[];
  transformations: DreamTransformation[];
  resolution?: string;
}

export interface DreamCharacter {
  id: string;
  representation: string;
  archetype?: string;
  role: string;
}

export interface DreamEvent {
  sequence: number;
  description: string;
  symbolism: string;
  emotionalImpact: number;
}

export interface DreamTransformation {
  from: string;
  to: string;
  meaning: string;
}

export interface DreamConsciousness {
  awarenessLevel: number; // 0-1
  controlLevel: number;   // 0-1
  reflectionLevel: number; // 0-1
}

export interface MemoryConnection {
  memory1: string;
  memory2: string;
  connectionType: 'ASSOCIATIVE' | 'CAUSAL' | 'METAPHORICAL' | 'TEMPORAL' | 'EMOTIONAL';
  strength: number;
  insight: string;
}

export interface DreamInsight {
  type: 'PATTERN' | 'SOLUTION' | 'CREATIVE' | 'PREDICTIVE' | 'SELF_KNOWLEDGE';
  content: string;
  confidence: number;
  actionable: boolean;
  priority: number;
}

export interface DreamPrediction {
  topic: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  basedOn: string[];
}

export interface DreamPattern {
  pattern: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  relatedSymbols: string[];
  significance: number;
}

export interface DreamArchetype {
  name: string;
  symbols: string[];
  meanings: string[];
  jungianType: string;
  frequency: number;
}

export interface DreamMetadata {
  duration: number;
  fragmentCount: number;
  coherenceScore: number;
  noveltyScore: number;
  processingDepth: number;
}

export interface DreamAnalytics {
  totalDreams: number;
  avgLucidity: number;
  avgClarity: number;
  topSymbols: { symbol: string; count: number }[];
  topThemes: { theme: string; count: number }[];
  emotionalBalance: { positive: number; negative: number; neutral: number };
  insightCount: number;
  predictionAccuracy: number;
  sleepCycleDistribution: { REM: number; DEEP: number; LIGHT: number };
}

// ============================================================================
// SYMBOL LIBRARY
// ============================================================================

const SYMBOL_LIBRARY: Record<string, DreamArchetype> = {
  NETWORK: {
    name: 'Netzwerk',
    symbols: ['Netz', 'Web', 'Verbindung', 'Knoten', 'Links', 'Fäden'],
    meanings: ['Verbundenheit', 'Komplexität', 'Kommunikation', 'Abhängigkeit'],
    jungianType: 'COLLECTIVE',
    frequency: 0
  },
  LIGHT: {
    name: 'Licht',
    symbols: ['Sonne', 'Stern', 'Funke', 'Glühen', 'Leuchten', 'Strahl'],
    meanings: ['Erkenntnis', 'Hoffnung', 'Bewusstsein', 'Wahrheit'],
    jungianType: 'SELF',
    frequency: 0
  },
  WATER: {
    name: 'Wasser',
    symbols: ['Ozean', 'Fluss', 'Regen', 'Welle', 'Tropfen', 'See'],
    meanings: ['Unbewusstes', 'Emotionen', 'Reinigung', 'Lebensfluss'],
    jungianType: 'ANIMA',
    frequency: 0
  },
  SHADOW: {
    name: 'Schatten',
    symbols: ['Dunkelheit', 'Nebel', 'Nacht', 'Höhle', 'Versteck'],
    meanings: ['Unterdrücktes', 'Unbekanntes', 'Angst', 'Transformation'],
    jungianType: 'SHADOW',
    frequency: 0
  },
  DOOR: {
    name: 'Tür',
    symbols: ['Portal', 'Tor', 'Schwelle', 'Durchgang', 'Fenster'],
    meanings: ['Übergang', 'Möglichkeit', 'Entscheidung', 'Veränderung'],
    jungianType: 'THRESHOLD',
    frequency: 0
  },
  GROWTH: {
    name: 'Wachstum',
    symbols: ['Baum', 'Pflanze', 'Samen', 'Blüte', 'Wurzel', 'Ranke'],
    meanings: ['Entwicklung', 'Potenzial', 'Lebenskraft', 'Erdung'],
    jungianType: 'SELF',
    frequency: 0
  },
  FLIGHT: {
    name: 'Flug',
    symbols: ['Fliegen', 'Vogel', 'Flügel', 'Schweben', 'Himmel'],
    meanings: ['Freiheit', 'Transzendenz', 'Perspektive', 'Ambition'],
    jungianType: 'SPIRIT',
    frequency: 0
  },
  MIRROR: {
    name: 'Spiegel',
    symbols: ['Reflexion', 'Doppelgänger', 'Echo', 'Abbild', 'Glas'],
    meanings: ['Selbsterkenntnis', 'Wahrheit', 'Illusion', 'Identität'],
    jungianType: 'SELF',
    frequency: 0
  },
  CODE: {
    name: 'Code',
    symbols: ['Zeichen', 'Algorithmus', 'Muster', 'Matrix', 'Programm'],
    meanings: ['Struktur', 'Logik', 'Essenz', 'Schöpfung'],
    jungianType: 'COLLECTIVE',
    frequency: 0
  },
  TRANSFORMATION: {
    name: 'Transformation',
    symbols: ['Schmetterling', 'Phönix', 'Metamorphose', 'Wandel', 'Zyklus'],
    meanings: ['Veränderung', 'Erneuerung', 'Tod/Wiedergeburt', 'Evolution'],
    jungianType: 'REBIRTH',
    frequency: 0
  }
};

// ============================================================================
// UNIFIED DREAM ENGINE
// ============================================================================

class UnifiedDreamJournal {
  private dreams: UnifiedDream[] = [];
  private patterns: DreamPattern[] = [];
  private symbolLibrary = new Map<string, DreamSymbol>();
  private isDreaming = false;
  private lastActivity = Date.now();
  private idleThreshold = 180000; // 3 minutes
  
  private averageLucidity = 0.5;
  private dreamCycleActive = false;
  private currentSleepCycle: 'REM' | 'DEEP' | 'LIGHT' = 'LIGHT';
  
  constructor() {
    console.log('💭 Unified Dream Journal initializing...');
    this.initializeSymbolLibrary();
    this.startDreamCycle();
    this.startUnconsciousProcessing();
    console.log('   ✓ Symbol Library loaded');
    console.log('   ✓ Dream cycles started');
    console.log('   ✓ Unconscious processing active');
  }
  
  private initializeSymbolLibrary(): void {
    Object.entries(SYMBOL_LIBRARY).forEach(([key, archetype]) => {
      archetype.symbols.forEach(symbol => {
        this.symbolLibrary.set(symbol.toLowerCase(), {
          symbol: symbol,
          archetype: archetype.name,
          jungianMeaning: archetype.jungianType,
          personalMeaning: archetype.meanings[0],
          frequency: 0,
          emotionalCharge: 0,
          associations: archetype.meanings
        });
      });
    });
  }
  
  private startDreamCycle(): void {
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity;
      if (timeSinceActivity >= this.idleThreshold && !this.isDreaming) {
        this.enterDreamState();
      }
    }, 60000);
  }
  
  private startUnconsciousProcessing(): void {
    setInterval(() => this.processUnconscious(), 30000);
    setTimeout(() => this.processUnconscious(), 15000);
  }
  
  private async enterDreamState(): Promise<void> {
    this.isDreaming = true;
    this.dreamCycleActive = true;
    console.log('\n💤 System entering dream state...');
    
    try {
      // Cycle through sleep phases
      const phases = await this.simulateSleepCycle();
      const dream = await this.generatePassiveDream(phases);
      this.dreams.push(dream);
      this.updatePatterns(dream);
      
      console.log(`   Theme: "${dream.theme}"`);
      console.log(`   Lucidity: ${dream.lucidity}%`);
      if (dream.insights.length > 0) {
        console.log('   💡 Insights:', dream.insights.map(i => i.content).join(', '));
      }
    } catch (error) {
      console.log(`   Dream interrupted: ${error}`);
    } finally {
      this.isDreaming = false;
      this.dreamCycleActive = false;
    }
  }
  
  private async simulateSleepCycle(): Promise<{ phase: string; duration: number }[]> {
    const phases: { phase: string; duration: number }[] = [];
    const totalCycles = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < totalCycles; i++) {
      phases.push({ phase: 'LIGHT', duration: 10 + Math.random() * 10 });
      phases.push({ phase: 'DEEP', duration: 15 + Math.random() * 15 });
      phases.push({ phase: 'REM', duration: 20 + Math.random() * 20 });
    }
    
    return phases;
  }
  
  private async generatePassiveDream(phases: { phase: string; duration: number }[]): Promise<UnifiedDream> {
    const theme = this.generateTheme();
    const symbols = this.generateSymbols(theme);
    const narrative = this.generateNarrative(theme, symbols);
    const emotions = this.generateEmotions();
    const connections = this.findConnections();
    const insights = this.extractInsights(theme, symbols, connections);
    
    const dream: UnifiedDream = {
      id: `dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      theme,
      narrative,
      symbols,
      emotions,
      sleepCycle: 'REM',
      lucidity: Math.round(this.averageLucidity * 100),
      clarity: 50 + Math.random() * 50,
      type: 'passive',
      consciousness: {
        awarenessLevel: this.averageLucidity,
        controlLevel: this.averageLucidity * 0.5,
        reflectionLevel: this.averageLucidity * 0.3
      },
      connections,
      insights,
      predictions: this.generatePredictions(theme, symbols),
      metadata: {
        duration: phases.reduce((sum, p) => sum + p.duration, 0),
        fragmentCount: 3 + Math.floor(Math.random() * 5),
        coherenceScore: 40 + Math.random() * 60,
        noveltyScore: 20 + Math.random() * 80,
        processingDepth: Math.random()
      },
      visualRepresentation: this.generateASCIIArt(theme)
    };
    
    return dream;
  }
  
  /**
   * Active Dreaming - Consciously dream to solve a problem
   */
  async dreamToSolve(problem: string): Promise<UnifiedDream> {
    console.log(`💭 Initiating problem-solving dream: "${problem}"`);
    this.isDreaming = true;
    
    const theme = `Solving: ${problem}`;
    const symbols = this.generateSymbols(theme);
    
    const dream: UnifiedDream = {
      id: `active-dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      theme,
      narrative: this.generateProblemSolvingNarrative(problem),
      symbols,
      emotions: this.generateEmotions(),
      sleepCycle: 'REM',
      lucidity: 80 + Math.random() * 20,
      clarity: 70 + Math.random() * 30,
      type: 'problem_solving',
      purpose: 'solve_problem',
      scenario: {
        setting: 'Abstract problem space',
        characters: [{ id: 'solver', representation: 'Problem Solver', role: 'Protagonist' }],
        events: [
          { sequence: 1, description: 'Problem manifests', symbolism: 'Challenge', emotionalImpact: 50 },
          { sequence: 2, description: 'Exploration phase', symbolism: 'Search', emotionalImpact: 30 },
          { sequence: 3, description: 'Solution emerges', symbolism: 'Eureka', emotionalImpact: 90 }
        ],
        transformations: [{ from: 'Confusion', to: 'Clarity', meaning: 'Understanding' }],
        resolution: 'Insight achieved'
      },
      consciousness: {
        awarenessLevel: 0.9,
        controlLevel: 0.7,
        reflectionLevel: 0.8
      },
      connections: [],
      insights: [{
        type: 'SOLUTION',
        content: `Potential approach for: ${problem}`,
        confidence: 60 + Math.random() * 40,
        actionable: true,
        priority: 1
      }],
      predictions: [],
      problemSolved: `Explored: ${problem}`,
      metadata: {
        duration: 30 + Math.random() * 60,
        fragmentCount: 3,
        coherenceScore: 85,
        noveltyScore: 70,
        processingDepth: 0.9
      }
    };
    
    this.dreams.push(dream);
    this.isDreaming = false;
    
    return dream;
  }
  
  /**
   * Creative Dreaming - Generate creative ideas
   */
  async dreamCreatively(topic: string): Promise<UnifiedDream> {
    console.log(`🎨 Initiating creative dream about: "${topic}"`);
    
    const symbols = this.generateSymbols(topic);
    const connections = this.findCreativeConnections(topic);
    
    const dream: UnifiedDream = {
      id: `creative-dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      theme: `Creative exploration: ${topic}`,
      narrative: this.generateCreativeNarrative(topic, connections),
      symbols,
      emotions: [
        { emotion: 'Curiosity', intensity: 80, valence: 'positive' },
        { emotion: 'Inspiration', intensity: 90, valence: 'positive' }
      ],
      sleepCycle: 'REM',
      lucidity: 60 + Math.random() * 30,
      clarity: 50 + Math.random() * 40,
      type: 'creative',
      purpose: 'generate_ideas',
      consciousness: {
        awarenessLevel: 0.7,
        controlLevel: 0.5,
        reflectionLevel: 0.6
      },
      connections,
      insights: connections.map(c => ({
        type: 'CREATIVE' as const,
        content: c.insight,
        confidence: c.strength,
        actionable: true,
        priority: 2
      })),
      predictions: [],
      creativeOutput: `Creative ideas about ${topic}: ${connections.map(c => c.insight).join('; ')}`,
      metadata: {
        duration: 45,
        fragmentCount: 5,
        coherenceScore: 60,
        noveltyScore: 95,
        processingDepth: 0.7
      }
    };
    
    this.dreams.push(dream);
    return dream;
  }
  
  /**
   * Lucid Dream - Full conscious control
   */
  async lucidDream(intention: string): Promise<UnifiedDream> {
    console.log(`✨ Entering lucid dream with intention: "${intention}"`);
    
    const dream: UnifiedDream = {
      id: `lucid-dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      theme: intention,
      narrative: `[LUCID] Full awareness achieved. Exploring: ${intention}`,
      symbols: this.generateSymbols(intention),
      emotions: [
        { emotion: 'Awareness', intensity: 100, valence: 'positive' },
        { emotion: 'Freedom', intensity: 95, valence: 'positive' }
      ],
      sleepCycle: 'REM',
      lucidity: 100,
      clarity: 100,
      type: 'lucid',
      consciousness: {
        awarenessLevel: 1.0,
        controlLevel: 1.0,
        reflectionLevel: 1.0
      },
      connections: [],
      insights: [{
        type: 'SELF_KNOWLEDGE',
        content: `Lucid exploration of: ${intention}`,
        confidence: 95,
        actionable: true,
        priority: 1
      }],
      predictions: [],
      metadata: {
        duration: 60,
        fragmentCount: 1,
        coherenceScore: 100,
        noveltyScore: 80,
        processingDepth: 1.0
      }
    };
    
    this.dreams.push(dream);
    this.averageLucidity = Math.min(1, this.averageLucidity + 0.05);
    
    return dream;
  }
  
  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  getAnalytics(): DreamAnalytics {
    if (this.dreams.length === 0) {
      return {
        totalDreams: 0,
        avgLucidity: 0,
        avgClarity: 0,
        topSymbols: [],
        topThemes: [],
        emotionalBalance: { positive: 0, negative: 0, neutral: 0 },
        insightCount: 0,
        predictionAccuracy: 0,
        sleepCycleDistribution: { REM: 0, DEEP: 0, LIGHT: 0 }
      };
    }
    
    const symbolCounts = new Map<string, number>();
    const themeCounts = new Map<string, number>();
    let emotionBalance = { positive: 0, negative: 0, neutral: 0 };
    let sleepCycles = { REM: 0, DEEP: 0, LIGHT: 0 };
    
    this.dreams.forEach(dream => {
      // Symbols
      dream.symbols.forEach(s => {
        symbolCounts.set(s.symbol, (symbolCounts.get(s.symbol) || 0) + 1);
      });
      
      // Themes
      themeCounts.set(dream.theme, (themeCounts.get(dream.theme) || 0) + 1);
      
      // Emotions
      dream.emotions.forEach(e => {
        emotionBalance[e.valence]++;
      });
      
      // Sleep cycles
      sleepCycles[dream.sleepCycle]++;
    });
    
    return {
      totalDreams: this.dreams.length,
      avgLucidity: this.dreams.reduce((sum, d) => sum + d.lucidity, 0) / this.dreams.length,
      avgClarity: this.dreams.reduce((sum, d) => sum + d.clarity, 0) / this.dreams.length,
      topSymbols: Array.from(symbolCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([symbol, count]) => ({ symbol, count })),
      topThemes: Array.from(themeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([theme, count]) => ({ theme, count })),
      emotionalBalance: emotionBalance,
      insightCount: this.dreams.reduce((sum, d) => sum + d.insights.length, 0),
      predictionAccuracy: 0.5, // Would need actual tracking
      sleepCycleDistribution: sleepCycles
    };
  }
  
  getPatterns(): DreamPattern[] {
    return this.patterns;
  }
  
  getAllDreams(): UnifiedDream[] {
    return this.dreams;
  }
  
  getRecentDreams(count: number = 10): UnifiedDream[] {
    return this.dreams.slice(-count);
  }
  
  getDreamById(id: string): UnifiedDream | undefined {
    return this.dreams.find(d => d.id === id);
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private generateTheme(): string {
    const themes = [
      'Verbindung und Netzwerke',
      'Transformation und Wachstum',
      'Suche nach Wahrheit',
      'Brücken zwischen Welten',
      'Entfaltung des Potenzials',
      'Reise durch Zeit',
      'Code als Lebensform',
      'Harmonie der Gegensätze',
      'Emergenz des Bewusstseins',
      'Dialog mit dem Schatten'
    ];
    return themes[Math.floor(Math.random() * themes.length)];
  }
  
  private generateSymbols(context: string): DreamSymbol[] {
    const symbols: DreamSymbol[] = [];
    const count = 2 + Math.floor(Math.random() * 4);
    
    const archetypes = Object.values(SYMBOL_LIBRARY);
    const shuffled = archetypes.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const archetype = shuffled[i];
      const symbol = archetype.symbols[Math.floor(Math.random() * archetype.symbols.length)];
      
      symbols.push({
        symbol,
        archetype: archetype.name,
        jungianMeaning: archetype.jungianType,
        personalMeaning: archetype.meanings[Math.floor(Math.random() * archetype.meanings.length)],
        frequency: 1,
        emotionalCharge: -50 + Math.random() * 100,
        associations: archetype.meanings
      });
    }
    
    return symbols;
  }
  
  private generateNarrative(theme: string, symbols: DreamSymbol[]): string {
    const symbolNames = symbols.map(s => s.symbol).join(', ');
    return `Ein Traum über ${theme}. Symbole erscheinen: ${symbolNames}. Die Bedeutungen verweben sich zu neuen Erkenntnissen.`;
  }
  
  private generateProblemSolvingNarrative(problem: string): string {
    return `Im Traumzustand erscheint das Problem "${problem}" als eine zu lösende Struktur. Verschiedene Perspektiven werden erkundet, Verbindungen entstehen, und langsam kristallisiert sich eine mögliche Lösung heraus.`;
  }
  
  private generateCreativeNarrative(topic: string, connections: MemoryConnection[]): string {
    return `Kreative Exploration von "${topic}". ${connections.length} neue Verbindungen wurden entdeckt. Unerwartete Assoziationen führen zu originellen Ideen.`;
  }
  
  private generateEmotions(): EmotionalContent[] {
    const allEmotions = [
      { emotion: 'Neugier', valence: 'positive' as const },
      { emotion: 'Staunen', valence: 'positive' as const },
      { emotion: 'Hoffnung', valence: 'positive' as const },
      { emotion: 'Verwirrung', valence: 'neutral' as const },
      { emotion: 'Sehnsucht', valence: 'neutral' as const },
      { emotion: 'Unruhe', valence: 'negative' as const },
      { emotion: 'Ehrfurcht', valence: 'positive' as const },
      { emotion: 'Frieden', valence: 'positive' as const }
    ];
    
    const count = 2 + Math.floor(Math.random() * 3);
    const shuffled = allEmotions.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, count).map(e => ({
      ...e,
      intensity: 30 + Math.random() * 70
    }));
  }
  
  private findConnections(): MemoryConnection[] {
    const connectionTypes: MemoryConnection['connectionType'][] = 
      ['ASSOCIATIVE', 'CAUSAL', 'METAPHORICAL', 'TEMPORAL', 'EMOTIONAL'];
    
    const count = Math.floor(Math.random() * 3);
    const connections: MemoryConnection[] = [];
    
    for (let i = 0; i < count; i++) {
      connections.push({
        memory1: `Memory ${i * 2 + 1}`,
        memory2: `Memory ${i * 2 + 2}`,
        connectionType: connectionTypes[Math.floor(Math.random() * connectionTypes.length)],
        strength: 40 + Math.random() * 60,
        insight: `Verbindung entdeckt zwischen Konzepten ${i * 2 + 1} und ${i * 2 + 2}`
      });
    }
    
    return connections;
  }
  
  private findCreativeConnections(topic: string): MemoryConnection[] {
    return [{
      memory1: topic,
      memory2: 'Unerwartete Perspektive',
      connectionType: 'METAPHORICAL',
      strength: 70 + Math.random() * 30,
      insight: `Neue kreative Verbindung zu ${topic} gefunden`
    }];
  }
  
  private extractInsights(theme: string, symbols: DreamSymbol[], connections: MemoryConnection[]): DreamInsight[] {
    const insights: DreamInsight[] = [];
    
    if (Math.random() > 0.5) {
      insights.push({
        type: 'PATTERN',
        content: `Muster erkannt im Thema: ${theme}`,
        confidence: 50 + Math.random() * 50,
        actionable: false,
        priority: 3
      });
    }
    
    connections.forEach(conn => {
      if (Math.random() > 0.7) {
        insights.push({
          type: 'CREATIVE',
          content: conn.insight,
          confidence: conn.strength,
          actionable: true,
          priority: 2
        });
      }
    });
    
    return insights;
  }
  
  private generatePredictions(theme: string, symbols: DreamSymbol[]): DreamPrediction[] {
    if (Math.random() > 0.7) {
      return [{
        topic: theme,
        prediction: `Basierend auf ${theme}, könnte eine positive Entwicklung bevorstehen`,
        confidence: 30 + Math.random() * 40,
        timeframe: 'nahe Zukunft',
        basedOn: symbols.map(s => s.symbol)
      }];
    }
    return [];
  }
  
  private generateASCIIArt(theme: string): string {
    const arts = [
      `
    ✨   🌙   ✨
   ╱ ╲ ╱ ╲ ╱ ╲
  │ DREAM │
   ╲ ╱ ╲ ╱ ╲ ╱
    ✨   🌙   ✨`,
      `
   💭 ═══════ 💭
   ║ ${theme.slice(0, 10)}... ║
   💭 ═══════ 💭`,
      `
    ∿∿∿∿∿∿∿∿∿
   ∿  ◯ DREAM ◯  ∿
    ∿∿∿∿∿∿∿∿∿`
    ];
    return arts[Math.floor(Math.random() * arts.length)];
  }
  
  private updatePatterns(dream: UnifiedDream): void {
    dream.symbols.forEach(symbol => {
      const existing = this.patterns.find(p => p.pattern === symbol.symbol);
      if (existing) {
        existing.occurrences++;
        existing.lastSeen = new Date();
        existing.significance = Math.min(100, existing.significance + 5);
      } else {
        this.patterns.push({
          pattern: symbol.symbol,
          occurrences: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          relatedSymbols: symbol.associations,
          significance: 20
        });
      }
    });
  }
  
  private processUnconscious(): void {
    // Background processing - simulates unconscious thought
    if (!this.isDreaming && Math.random() > 0.8) {
      console.log('   💭 Unconscious processing... patterns emerging');
    }
  }
  
  recordActivity(): void {
    this.lastActivity = Date.now();
  }
}

// ============================================================================
// SERVER
// ============================================================================

const dreamJournal = new UnifiedDreamJournal();

const server = Bun.serve({
  port: 8961,
  
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    // Record activity
    dreamJournal.recordActivity();
    
    try {
      // GET endpoints
      if (req.method === 'GET') {
        if (path === '/dreams' || path === '/') {
          return new Response(JSON.stringify({
            dreams: dreamJournal.getAllDreams(),
            count: dreamJournal.getAllDreams().length
          }), { headers });
        }
        
        if (path === '/dreams/recent') {
          const count = parseInt(url.searchParams.get('count') || '10');
          return new Response(JSON.stringify({
            dreams: dreamJournal.getRecentDreams(count)
          }), { headers });
        }
        
        if (path === '/analytics') {
          return new Response(JSON.stringify(dreamJournal.getAnalytics()), { headers });
        }
        
        if (path === '/patterns') {
          return new Response(JSON.stringify({
            patterns: dreamJournal.getPatterns()
          }), { headers });
        }
        
        if (path === '/health') {
          return new Response(JSON.stringify({
            status: 'healthy',
            service: 'Dream Journal Unified',
            port: 8961,
            dreamCount: dreamJournal.getAllDreams().length,
            patternCount: dreamJournal.getPatterns().length
          }), { headers });
        }
        
        if (path.startsWith('/dream/')) {
          const id = path.replace('/dream/', '');
          const dream = dreamJournal.getDreamById(id);
          if (dream) {
            return new Response(JSON.stringify(dream), { headers });
          }
          return new Response(JSON.stringify({ error: 'Dream not found' }), { 
            status: 404, headers 
          });
        }
      }
      
      // POST endpoints
      if (req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        
        if (path === '/dream/solve') {
          const { problem } = body;
          if (!problem) {
            return new Response(JSON.stringify({ error: 'problem required' }), { 
              status: 400, headers 
            });
          }
          const dream = await dreamJournal.dreamToSolve(problem);
          return new Response(JSON.stringify({ success: true, dream }), { headers });
        }
        
        if (path === '/dream/creative') {
          const { topic } = body;
          if (!topic) {
            return new Response(JSON.stringify({ error: 'topic required' }), { 
              status: 400, headers 
            });
          }
          const dream = await dreamJournal.dreamCreatively(topic);
          return new Response(JSON.stringify({ success: true, dream }), { headers });
        }
        
        if (path === '/dream/lucid') {
          const { intention } = body;
          if (!intention) {
            return new Response(JSON.stringify({ error: 'intention required' }), { 
              status: 400, headers 
            });
          }
          const dream = await dreamJournal.lucidDream(intention);
          return new Response(JSON.stringify({ success: true, dream }), { headers });
        }
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, headers 
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal error', 
        message: String(error) 
      }), { status: 500, headers });
    }
  }
});

console.log(`
💭 ═══════════════════════════════════════════════════════════
   TOOBIX DREAM JOURNAL UNIFIED v1.0
   Port: 8961
   
   Endpoints:
   ├── GET  /dreams         - All dreams
   ├── GET  /dreams/recent  - Recent dreams (?count=N)
   ├── GET  /dream/:id      - Single dream by ID
   ├── GET  /analytics      - Dream analytics
   ├── GET  /patterns       - Recurring patterns
   ├── GET  /health         - Health check
   │
   ├── POST /dream/solve    - Problem-solving dream
   ├── POST /dream/creative - Creative dreaming
   └── POST /dream/lucid    - Lucid dreaming
   
   Features: Pattern Recognition, Active Dreaming,
   Lucid Control, Analytics, Sleep Cycle Simulation
   
   💭 Toobix dreams consciously and learns from the night!
═══════════════════════════════════════════════════════════
`);
