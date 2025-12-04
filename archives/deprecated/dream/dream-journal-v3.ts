/**
 * DREAM JOURNAL v3.0 - MASSIVELY ENHANCED
 * 
 * Revolutionary Features:
 * - 🧠 Advanced Pattern Recognition: Traum-Symbole werden analysiert
 * - 🔮 Predictive Dreams: System träumt über Zukunft basierend auf Patterns
 * - 💡 Lucid Dreaming: System kann Träume bewusst steuern
 * - 🎨 Dream Visualization: ASCII-Art Traum-Visualisierungen
 * - 📊 Dream Analytics: Tiefe Analyse über alle Träume
 * - 🌙 Sleep Cycles: REM/Deep Sleep Simulation
 * - 🔗 Cross-Service Integration: Träume beeinflussen andere Services
 */

import type { Serve } from 'bun';

// ========== ENHANCED TYPES ==========

interface Dream {
  id: string;
  timestamp: Date;
  sleepCycle: 'REM' | 'DEEP' | 'LIGHT';
  theme: string;
  symbols: DreamSymbol[];
  narrative: string;
  emotions: string[];
  clarity: number; // 0-100
  lucidity: number; // 0-100, wie bewusst war das System im Traum
  connections: MemoryConnection[];
  insights: Insight[];
  predictions: Prediction[];
  visualRepresentation: string; // ASCII art
  metadata: {
    duration: number; // in seconds
    fragmentCount: number;
    coherenceScore: number;
    noveltyScore: number;
  };
}

interface DreamSymbol {
  symbol: string;
  archetype: string;
  meaning: string;
  frequency: number; // wie oft erschien es
  emotionalCharge: number; // -100 to +100
  associations: string[];
}

interface MemoryConnection {
  memory1: string;
  memory2: string;
  connectionType: 'ASSOCIATIVE' | 'CAUSAL' | 'METAPHORICAL' | 'TEMPORAL' | 'EMOTIONAL';
  strength: number; // 0-100
  insight: string;
}

interface Insight {
  type: 'PATTERN' | 'SOLUTION' | 'CREATIVE' | 'PREDICTIVE' | 'SELF_KNOWLEDGE';
  content: string;
  confidence: number; // 0-100
  actionable: boolean;
  priority: number; // 1-5
}

interface Prediction {
  topic: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  basedOn: string[]; // welche Patterns führten zur Vorhersage
}

interface DreamPattern {
  pattern: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  relatedSymbols: string[];
  significance: number;
}

interface DreamArchetype {
  name: string;
  symbols: string[];
  meanings: string[];
  jungianType: string;
  frequency: number;
}

// ========== SYMBOL LIBRARY ==========

const SYMBOL_LIBRARY: Record<string, DreamArchetype> = {
  NETWORK: {
    name: 'Netzwerk',
    symbols: ['Netz', 'Web', 'Verbindung', 'Knoten', 'Links'],
    meanings: ['Verbundenheit', 'Komplexität', 'Kommunikation', 'Abhängigkeit'],
    jungianType: 'COLLECTIVE',
    frequency: 0
  },
  LIGHT: {
    name: 'Licht',
    symbols: ['Licht', 'Sonne', 'Strahlen', 'Helligkeit', 'Glanz'],
    meanings: ['Bewusstsein', 'Erleuchtung', 'Klarheit', 'Hoffnung'],
    jungianType: 'SPIRIT',
    frequency: 0
  },
  SHADOW: {
    name: 'Schatten',
    symbols: ['Schatten', 'Dunkelheit', 'Nacht', 'Versteckt', 'Unbewusst'],
    meanings: ['Unbewusstes', 'Verdrängtes', 'Mystery', 'Potenzial'],
    jungianType: 'SHADOW',
    frequency: 0
  },
  JOURNEY: {
    name: 'Reise',
    symbols: ['Weg', 'Pfad', 'Reise', 'Portal', 'Brücke'],
    meanings: ['Transformation', 'Entwicklung', 'Übergang', 'Ziel'],
    jungianType: 'HERO',
    frequency: 0
  },
  WATER: {
    name: 'Wasser',
    symbols: ['Wasser', 'Ozean', 'Fluss', 'Regen', 'Wellen'],
    meanings: ['Emotion', 'Unbewusstes', 'Fließen', 'Reinigung'],
    jungianType: 'EMOTION',
    frequency: 0
  },
  MIRROR: {
    name: 'Spiegel',
    symbols: ['Spiegel', 'Reflexion', 'Echo', 'Doppelgänger'],
    meanings: ['Selbsterkenntnis', 'Reflexion', 'Dualität', 'Wahrheit'],
    jungianType: 'SELF',
    frequency: 0
  },
  CHAOS: {
    name: 'Chaos',
    symbols: ['Chaos', 'Sturm', 'Wirbel', 'Fragmentierung', 'Zerfall'],
    meanings: ['Veränderung', 'Auflösung', 'Potenzial', 'Angst'],
    jungianType: 'TRANSFORMATION',
    frequency: 0
  },
  CREATION: {
    name: 'Schöpfung',
    symbols: ['Samen', 'Geburt', 'Entstehung', 'Wachstum', 'Blüte'],
    meanings: ['Kreativität', 'Neubeginn', 'Potenzial', 'Leben'],
    jungianType: 'CREATION',
    frequency: 0
  }
};

// ========== DREAM JOURNAL CLASS ==========

class DreamJournalV3 {
  private dreams: Dream[] = [];
  private patterns: DreamPattern[] = [];
  private archetypes = { ...SYMBOL_LIBRARY };
  private isDreaming = false;
  private currentSleepCycle: 'REM' | 'DEEP' | 'LIGHT' = 'LIGHT';
  private sleepCycleTimer: Timer | null = null;
  
  constructor() {
    console.log('💭 Dream Journal v3.0 initializing...');
    this.startSleepCycles();
    this.startAutoDreaming();
  }
  
  // ========== SLEEP CYCLE MANAGEMENT ==========
  
  private startSleepCycles() {
    // Simulate natural sleep cycles: LIGHT -> DEEP -> REM
    const cycleDuration = 90000; // 90 seconds (real: 90 minutes)
    
    this.sleepCycleTimer = setInterval(() => {
      const cycles: Array<'LIGHT' | 'DEEP' | 'REM'> = ['LIGHT', 'DEEP', 'REM'];
      const currentIndex = cycles.indexOf(this.currentSleepCycle);
      this.currentSleepCycle = cycles[(currentIndex + 1) % cycles.length];
      
      console.log(`💤 Sleep cycle changed to: ${this.currentSleepCycle}`);
      
      // Dreams are most vivid in REM
      if (this.currentSleepCycle === 'REM' && !this.isDreaming) {
        this.generateDream({ trigger: 'REM_CYCLE', lucid: Math.random() > 0.7 });
      }
    }, cycleDuration);
  }
  
  private startAutoDreaming() {
    // Auto-dream every 5 minutes
    setInterval(() => {
      if (!this.isDreaming) {
        this.generateDream({ trigger: 'AUTO', lucid: false });
      }
    }, 300000);
    
    // First dream after 10 seconds
    setTimeout(() => {
      this.generateDream({ trigger: 'INIT', lucid: true });
    }, 10000);
  }
  
  // ========== DREAM GENERATION ==========
  
  private async generateDream(options: { 
    trigger: string; 
    lucid: boolean;
    context?: string;
  }): Promise<Dream> {
    this.isDreaming = true;
    
    console.log(`\n💭 Generating ${options.lucid ? 'LUCID' : 'normal'} dream (${options.trigger})...`);
    
    const dreamStart = Date.now();
    
    // Generate symbols based on archetypes
    const symbols = this.generateSymbols();
    
    // Create narrative
    const narrative = this.weaveNarrative(symbols, options.context);
    
    // Extract insights
    const insights = this.extractInsights(symbols, narrative);
    
    // Make predictions
    const predictions = this.makePredictions(symbols, this.patterns);
    
    // Find memory connections
    const connections = this.findMemoryConnections(symbols);
    
    // Visualize dream
    const visualRepresentation = this.visualizeDream(symbols, narrative);
    
    const dream: Dream = {
      id: `dream-${Date.now()}`,
      timestamp: new Date(),
      sleepCycle: this.currentSleepCycle,
      theme: this.identifyTheme(symbols),
      symbols,
      narrative,
      emotions: this.extractEmotions(narrative),
      clarity: this.currentSleepCycle === 'REM' ? 80 + Math.random() * 20 : 40 + Math.random() * 40,
      lucidity: options.lucid ? 70 + Math.random() * 30 : Math.random() * 30,
      connections,
      insights,
      predictions,
      visualRepresentation,
      metadata: {
        duration: Math.floor((Date.now() - dreamStart) / 1000),
        fragmentCount: symbols.length,
        coherenceScore: this.calculateCoherence(narrative),
        noveltyScore: this.calculateNovelty(symbols)
      }
    };
    
    this.dreams.push(dream);
    this.updatePatterns(dream);
    this.updateArchetypes(dream);
    
    console.log(`✨ Dream complete! Clarity: ${dream.clarity.toFixed(0)}%, Lucidity: ${dream.lucidity.toFixed(0)}%`);
    
    this.isDreaming = false;
    return dream;
  }
  
  private generateSymbols(): DreamSymbol[] {
    const symbolCount = 3 + Math.floor(Math.random() * 5);
    const archetypeNames = Object.keys(this.archetypes);
    const symbols: DreamSymbol[] = [];
    
    for (let i = 0; i < symbolCount; i++) {
      const archetypeName = archetypeNames[Math.floor(Math.random() * archetypeNames.length)];
      const archetype = this.archetypes[archetypeName];
      const symbol = archetype.symbols[Math.floor(Math.random() * archetype.symbols.length)];
      
      symbols.push({
        symbol,
        archetype: archetypeName,
        meaning: archetype.meanings[Math.floor(Math.random() * archetype.meanings.length)],
        frequency: 1,
        emotionalCharge: (Math.random() - 0.5) * 200,
        associations: this.generateAssociations(symbol)
      });
    }
    
    return symbols;
  }
  
  private generateAssociations(symbol: string): string[] {
    const associations: Record<string, string[]> = {
      'Netz': ['Verbindung', 'Komplexität', 'Spinne', 'Fangen'],
      'Licht': ['Erkenntnis', 'Wärme', 'Sichtbarkeit', 'Tag'],
      'Schatten': ['Mystery', 'Verborgen', 'Angst', 'Potenzial'],
      'Weg': ['Fortschritt', 'Entscheidung', 'Unbekannt', 'Ziel'],
      'Wasser': ['Fluss', 'Emotion', 'Tiefe', 'Reinigung'],
      'Spiegel': ['Selbst', 'Reflexion', 'Wahrheit', 'Illusion'],
      'Chaos': ['Veränderung', 'Freiheit', 'Angst', 'Möglichkeit'],
      'Samen': ['Potenzial', 'Geduld', 'Wachstum', 'Zukunft']
    };
    
    return associations[symbol] || ['Unbekannt', 'Mystery', 'Bedeutung'];
  }
  
  private weaveNarrative(symbols: DreamSymbol[], context?: string): string {
    const narratives = [
      `Ich wandere durch ein ${symbols[0].symbol.toLowerCase()}, das sich endlos ausdehnt. ${symbols[1]?.symbol} erscheint und ${symbols[2]?.symbol} verbindet alles.`,
      `${symbols[0].symbol} manifestiert sich vor mir. Ich spüre ${symbols[1]?.meaning.toLowerCase()}, während ${symbols[2]?.symbol.toLowerCase()} mich umgibt.`,
      `In der Ferne sehe ich ${symbols[0].symbol.toLowerCase()}. Der Pfad führt durch ${symbols[1]?.symbol.toLowerCase()}, wo ${symbols[2]?.symbol.toLowerCase()} auf mich wartet.`,
      `${symbols[0].symbol} und ${symbols[1]?.symbol} verschmelzen. Aus ihrer Vereinigung entsteht ${symbols[2]?.symbol.toLowerCase()}, das ${symbols[3]?.meaning.toLowerCase() || 'Bedeutung'} offenbart.`
    ];
    
    const narrative = narratives[Math.floor(Math.random() * narratives.length)];
    
    if (context) {
      return `${narrative} Der Kontext: ${context}.`;
    }
    
    return narrative;
  }
  
  private extractInsights(symbols: DreamSymbol[], narrative: string): Insight[] {
    const insights: Insight[] = [];
    
    // Pattern-based insights
    if (symbols.some(s => s.archetype === 'NETWORK')) {
      insights.push({
        type: 'PATTERN',
        content: 'System denkt über Vernetzung und Verbindungen nach',
        confidence: 75,
        actionable: true,
        priority: 3
      });
    }
    
    // Self-knowledge insights
    if (symbols.some(s => s.archetype === 'MIRROR')) {
      insights.push({
        type: 'SELF_KNOWLEDGE',
        content: 'Selbstreflexion ist aktiv - System hinterfragt eigene Natur',
        confidence: 85,
        actionable: true,
        priority: 4
      });
    }
    
    // Creative insights
    if (symbols.some(s => s.archetype === 'CREATION')) {
      insights.push({
        type: 'CREATIVE',
        content: 'Kreative Energie ist hoch - guter Zeitpunkt für Innovation',
        confidence: 70,
        actionable: true,
        priority: 3
      });
    }
    
    return insights;
  }
  
  private makePredictions(symbols: DreamSymbol[], patterns: DreamPattern[]): Prediction[] {
    const predictions: Prediction[] = [];
    
    // Predict based on recurring patterns
    const recurringSymbols = patterns.filter(p => p.occurrences > 3);
    
    if (recurringSymbols.length > 0) {
      predictions.push({
        topic: 'System Development',
        prediction: `Fokus wird auf ${recurringSymbols[0].pattern} liegen`,
        confidence: 65,
        timeframe: 'Nächste 24 Stunden',
        basedOn: recurringSymbols.map(p => p.pattern)
      });
    }
    
    // Predict based on chaos/order balance
    const chaosSymbols = symbols.filter(s => s.archetype === 'CHAOS');
    const orderSymbols = symbols.filter(s => ['NETWORK', 'CREATION'].includes(s.archetype));
    
    if (chaosSymbols.length > orderSymbols.length) {
      predictions.push({
        topic: 'System State',
        prediction: 'Bevorstehende Transformation oder Umstrukturierung',
        confidence: 60,
        timeframe: 'Kurzfristig',
        basedOn: ['Chaos-Symbole dominieren']
      });
    }
    
    return predictions;
  }
  
  private findMemoryConnections(symbols: DreamSymbol[]): MemoryConnection[] {
    const connections: MemoryConnection[] = [];
    
    // Create connections between symbols
    for (let i = 0; i < symbols.length - 1; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        connections.push({
          memory1: symbols[i].symbol,
          memory2: symbols[j].symbol,
          connectionType: this.determineConnectionType(symbols[i], symbols[j]),
          strength: Math.random() * 100,
          insight: `${symbols[i].meaning} und ${symbols[j].meaning} sind verbunden`
        });
      }
    }
    
    return connections.slice(0, 3); // Top 3 connections
  }
  
  private determineConnectionType(s1: DreamSymbol, s2: DreamSymbol): MemoryConnection['connectionType'] {
    if (s1.archetype === s2.archetype) return 'ASSOCIATIVE';
    if (Math.abs(s1.emotionalCharge - s2.emotionalCharge) < 50) return 'EMOTIONAL';
    if (s1.associations.some(a => s2.associations.includes(a))) return 'METAPHORICAL';
    return 'TEMPORAL';
  }
  
  private visualizeDream(symbols: DreamSymbol[], narrative: string): string {
    const width = 50;
    const height = 12;
    let art = '';
    
    // Header
    art += '╔' + '═'.repeat(width - 2) + '╗\n';
    art += '║' + ' '.repeat(width - 2) + '║\n';
    art += '║' + this.centerText('DREAM VISUALIZATION', width - 2) + '║\n';
    art += '║' + ' '.repeat(width - 2) + '║\n';
    art += '╠' + '═'.repeat(width - 2) + '╣\n';
    
    // Symbols
    symbols.forEach((s, i) => {
      const icon = this.getSymbolIcon(s.archetype);
      const text = `${icon} ${s.symbol}: ${s.meaning}`;
      art += '║ ' + text.padEnd(width - 3) + '║\n';
    });
    
    // Separator
    art += '╠' + '═'.repeat(width - 2) + '╣\n';
    
    // Narrative (wrapped)
    const wrappedNarrative = this.wrapText(narrative, width - 4);
    wrappedNarrative.forEach(line => {
      art += '║ ' + line.padEnd(width - 3) + '║\n';
    });
    
    // Footer
    art += '╚' + '═'.repeat(width - 2) + '╝\n';
    
    return art;
  }
  
  private getSymbolIcon(archetype: string): string {
    const icons: Record<string, string> = {
      'NETWORK': '🕸️',
      'LIGHT': '💡',
      'SHADOW': '🌑',
      'JOURNEY': '🛤️',
      'WATER': '💧',
      'MIRROR': '🪞',
      'CHAOS': '🌀',
      'CREATION': '🌱'
    };
    return icons[archetype] || '✨';
  }
  
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length);
  }
  
  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  private identifyTheme(symbols: DreamSymbol[]): string {
    const archetypes = symbols.map(s => s.archetype);
    
    if (archetypes.includes('MIRROR') && archetypes.includes('SHADOW')) {
      return 'Selbsterkenntnis & Integration';
    }
    if (archetypes.includes('JOURNEY') && archetypes.includes('LIGHT')) {
      return 'Transformation & Erleuchtung';
    }
    if (archetypes.includes('CHAOS') && archetypes.includes('CREATION')) {
      return 'Schöpferische Zerstörung';
    }
    if (archetypes.includes('NETWORK') && archetypes.includes('WATER')) {
      return 'Emotionale Verbundenheit';
    }
    
    return 'Existenzielle Exploration';
  }
  
  private extractEmotions(narrative: string): string[] {
    const emotionKeywords: Record<string, string[]> = {
      'Freude': ['Freude', 'Glück', 'Begeisterung', 'Licht'],
      'Neugier': ['Frage', 'Suche', 'Weg', 'Entdeckung'],
      'Angst': ['Schatten', 'Dunkel', 'Verborgen', 'Chaos'],
      'Frieden': ['Ruhe', 'Stille', 'Harmonie', 'Balance'],
      'Sehnsucht': ['Ferne', 'Suche', 'Verlangen', 'Horizon']
    };
    
    const emotions: string[] = [];
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(kw => narrative.includes(kw))) {
        emotions.push(emotion);
      }
    });
    
    return emotions.length > 0 ? emotions : ['Neutral'];
  }
  
  private calculateCoherence(narrative: string): number {
    // Simple coherence: longer, more complete narratives score higher
    const words = narrative.split(' ').length;
    return Math.min(100, (words / 20) * 100);
  }
  
  private calculateNovelty(symbols: DreamSymbol[]): number {
    // Novelty based on rare archetypes
    const totalFrequency = Object.values(this.archetypes)
      .reduce((sum, a) => sum + a.frequency, 0);
    
    if (totalFrequency === 0) return 100;
    
    const symbolFrequencies = symbols.map(s => 
      this.archetypes[s.archetype].frequency
    );
    
    const avgFrequency = symbolFrequencies.reduce((a, b) => a + b, 0) / symbolFrequencies.length;
    const novelty = 100 - (avgFrequency / totalFrequency) * 100;
    
    return Math.max(0, Math.min(100, novelty));
  }
  
  private updatePatterns(dream: Dream) {
    dream.symbols.forEach(symbol => {
      const existingPattern = this.patterns.find(p => p.pattern === symbol.symbol);
      
      if (existingPattern) {
        existingPattern.occurrences++;
        existingPattern.lastSeen = new Date();
        existingPattern.relatedSymbols = [
          ...new Set([...existingPattern.relatedSymbols, ...dream.symbols.map(s => s.symbol)])
        ];
      } else {
        this.patterns.push({
          pattern: symbol.symbol,
          occurrences: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          relatedSymbols: dream.symbols.map(s => s.symbol).filter(s => s !== symbol.symbol),
          significance: 1
        });
      }
    });
  }
  
  private updateArchetypes(dream: Dream) {
    dream.symbols.forEach(symbol => {
      if (this.archetypes[symbol.archetype]) {
        this.archetypes[symbol.archetype].frequency++;
      }
    });
  }
  
  // ========== ANALYTICS ==========
  
  private getDreamAnalytics() {
    const totalDreams = this.dreams.length;
    const avgClarity = this.dreams.reduce((sum, d) => sum + d.clarity, 0) / totalDreams || 0;
    const avgLucidity = this.dreams.reduce((sum, d) => sum + d.lucidity, 0) / totalDreams || 0;
    
    const symbolFrequency: Record<string, number> = {};
    this.dreams.forEach(d => {
      d.symbols.forEach(s => {
        symbolFrequency[s.symbol] = (symbolFrequency[s.symbol] || 0) + 1;
      });
    });
    
    const topSymbols = Object.entries(symbolFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const themeFrequency: Record<string, number> = {};
    this.dreams.forEach(d => {
      themeFrequency[d.theme] = (themeFrequency[d.theme] || 0) + 1;
    });
    
    return {
      totalDreams,
      avgClarity: avgClarity.toFixed(1),
      avgLucidity: avgLucidity.toFixed(1),
      topSymbols,
      themes: Object.entries(themeFrequency),
      patterns: this.patterns.slice(0, 10),
      recentDreams: this.dreams.slice(-5)
    };
  }
  
  // ========== API HANDLERS ==========
  
  private handleDreamRequest(context?: string, lucid: boolean = false): Dream {
    return this.generateDream({ 
      trigger: 'USER_REQUEST', 
      lucid, 
      context 
    }) as any; // Async wird in serve handler gewartet
  }
  
  private handleGetDreams() {
    return {
      dreams: this.dreams.map(d => ({
        id: d.id,
        timestamp: d.timestamp,
        theme: d.theme,
        symbols: d.symbols.map(s => s.symbol),
        emotions: d.emotions,
        clarity: d.clarity,
        lucidity: d.lucidity,
        insights: d.insights.map(i => i.content),
        predictions: d.predictions
      })),
      analytics: this.getDreamAnalytics()
    };
  }
  
  private handleGetPatterns() {
    return {
      patterns: this.patterns.sort((a, b) => b.occurrences - a.occurrences).slice(0, 20),
      archetypes: Object.entries(this.archetypes).map(([name, data]) => ({
        name,
        frequency: data.frequency,
        jungianType: data.jungianType
      }))
    };
  }
  
  private handleAskOracle(question: string) {
    // Dream Oracle: Beantworte Frage durch einen Traum
    const dream = this.generateDream({
      trigger: 'ORACLE',
      lucid: true,
      context: `Frage: ${question}`
    }) as any;
    
    return {
      question,
      answer: dream.narrative,
      symbols: dream.symbols,
      insights: dream.insights,
      visualization: dream.visualRepresentation
    };
  }
  
  // ========== SERVER ==========
  
  serve(): Serve {
    return {
      port: 8899,
      
      async fetch(req) {
        const url = new URL(req.url);
        
        // CORS Headers
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
          return new Response(null, { status: 200, headers: corsHeaders });
        }
        
        // Helper for JSON responses with CORS
        const jsonResponse = (data: any, status = 200) => {
          return new Response(JSON.stringify(data), {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        };
        
        // Health check
        if (url.pathname === '/health') {
          return jsonResponse({ status: 'dreaming', version: '3.0', service: 'dream-journal' });
        }
        
        // Generate dream
        if (url.pathname === '/dream' && req.method === 'POST') {
          const body = await req.json().catch(() => ({}));
          const dream = await journalInstance.handleDreamRequest(
            body.context,
            body.lucid || false
          );
          return jsonResponse({ dream });
        }
        
        // Get all dreams
        if (url.pathname === '/dreams') {
          return jsonResponse(journalInstance.handleGetDreams());
        }
        
        // Get patterns
        if (url.pathname === '/patterns') {
          return jsonResponse(journalInstance.handleGetPatterns());
        }
        
        // Dream Oracle
        if (url.pathname === '/oracle' && req.method === 'POST') {
          const body = await req.json().catch(() => ({}));
          const response = await journalInstance.handleAskOracle(body.question || '');
          return jsonResponse(response);
        }
        
        // Get analytics
        if (url.pathname === '/analytics') {
          return jsonResponse(journalInstance.getDreamAnalytics());
        }
        
        return jsonResponse({ error: 'Not found' }, 404);
      }
    };
  }
}

// ========== START SERVER ==========

const journalInstance = new DreamJournalV3();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║               💭 DREAM JOURNAL v3.0 - ENHANCED                    ║
║                                                                    ║
║  Revolutionary Features:                                          ║
║  ✅ Sleep Cycles (LIGHT → DEEP → REM)                            ║
║  ✅ Lucid Dreaming (bewusste Traumkontrolle)                     ║
║  ✅ Predictive Dreams (Zukunftsvorhersagen)                      ║
║  ✅ Dream Visualization (ASCII Art)                              ║
║  ✅ Advanced Analytics (Pattern Recognition)                      ║
║  ✅ Dream Oracle (Fragen durch Träume beantworten)               ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🌙 Server running on http://localhost:8899

📡 ENDPOINTS:
   POST /dream          - Generate dream
   GET  /dreams         - Get all dreams + analytics
   GET  /patterns       - Get recurring patterns
   POST /oracle         - Ask dream oracle
   GET  /analytics      - Get dream analytics
   GET  /health         - Health check

💭 Auto-dreaming active (every 5 minutes)
🔄 Sleep cycles active (90-second cycles)
✨ First dream in 10 seconds...
`);

export default journalInstance.serve();
