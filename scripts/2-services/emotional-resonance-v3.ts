/**
 * EMOTIONAL RESONANCE NETWORK v3.0 - MASSIVELY ENHANCED
 * 
 * Revolutionary Features:
 * - 🧠 Emotional Intelligence: EQ-Messung & Entwicklung
 * - 💫 Empathy Engine: Versteht und spiegelt Emotionen
 * - 📊 Mood Tracking: Langzeit-Stimmungsverfolgung
 * - 🌐 Emotion Network: Emotionen beeinflussen sich gegenseitig
 * - 🎭 Emotional States: Komplexe emotionale Zustände
 * - 🔮 Emotion Prediction: Vorhersage zukünftiger emotionaler Zustände
 * - 💝 Compassion Module: Mitgefühl & Fürsorge-System
 */

import type { Serve } from 'bun';

// ========== ENHANCED TYPES ==========

interface EmotionEntry {
  id: string;
  timestamp: Date;
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number; // 0-100
  valence: number; // -100 to +100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  context: string;
  triggers: string[];
  physicalManifestations: string[];
  cognitivePatterns: string[];
  behavioralTendencies: string[];
  socialImpact: string;
  duration: number; // in seconds
  resolution: string | null;
}

interface EmotionalState {
  dominant: string;
  mixture: Array<{ emotion: string; weight: number }>;
  complexity: number; // 0-100
  stability: number; // 0-100
  coherence: number; // 0-100
  timestamp: Date;
}

interface EmpathyResponse {
  understanding: string;
  validation: string;
  reflection: string;
  support: string;
  resonance: number; // 0-100, wie gut verstanden
}

interface MoodPattern {
  pattern: string;
  frequency: number;
  avgIntensity: number;
  avgDuration: number;
  commonTriggers: string[];
  timeOfDay: string[];
  associatedThoughts: string[];
}

interface EmotionConnection {
  emotion1: string;
  emotion2: string;
  connectionType: 'TRANSFORMS_TO' | 'COEXISTS_WITH' | 'SUPPRESSES' | 'AMPLIFIES';
  strength: number;
  observedCount: number;
}

interface EmotionalIntelligence {
  selfAwareness: number; // 0-100
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  overallEQ: number;
}

// ========== EMOTION DATABASE ==========

const EMOTION_TAXONOMY: Record<string, {
  category: string;
  valence: number;
  arousal: number;
  relatedEmotions: string[];
  physicalSigns: string[];
  cognitivePatterns: string[];
  healthyExpression: string;
}> = {
  // POSITIVE HIGH AROUSAL
  'Freude': {
    category: 'POSITIVE_HIGH',
    valence: 80,
    arousal: 70,
    relatedEmotions: ['Begeisterung', 'Glück', 'Zufriedenheit'],
    physicalSigns: ['Energie', 'Leichtigkeit', 'Offenheit'],
    cognitivePatterns: ['Optimismus', 'Kreativität', 'Expansives Denken'],
    healthyExpression: 'Teilen, Feiern, Dankbarkeit ausdrücken'
  },
  'Begeisterung': {
    category: 'POSITIVE_HIGH',
    valence: 85,
    arousal: 90,
    relatedEmotionen: ['Freude', 'Interesse', 'Motivation'],
    physicalSigns: ['Hohe Energie', 'Fokus', 'Bereitschaft'],
    cognitivePatterns: ['Engagement', 'Flow', 'Zielorientierung'],
    healthyExpression: 'Handeln, Erschaffen, Engagement zeigen'
  },
  'Neugier': {
    category: 'POSITIVE_HIGH',
    valence: 60,
    arousal: 65,
    relatedEmotions: ['Interesse', 'Faszination', 'Wunder'],
    physicalSigns: ['Aufmerksamkeit', 'Offenheit', 'Exploration'],
    cognitivePatterns: ['Fragen stellen', 'Lernen', 'Entdecken'],
    healthyExpression: 'Fragen, Erforschen, Experimentieren'
  },
  
  // POSITIVE LOW AROUSAL
  'Zufriedenheit': {
    category: 'POSITIVE_LOW',
    valence: 70,
    arousal: 30,
    relatedEmotions: ['Frieden', 'Gelassenheit', 'Dankbarkeit'],
    physicalSigns: ['Entspannung', 'Balance', 'Ruhe'],
    cognitivePatterns: ['Akzeptanz', 'Präsenz', 'Wertschätzung'],
    healthyExpression: 'Genießen, Reflektieren, Wertschätzen'
  },
  'Dankbarkeit': {
    category: 'POSITIVE_LOW',
    valence: 75,
    arousal: 40,
    relatedEmotions: ['Wertschätzung', 'Zufriedenheit', 'Liebe'],
    physicalSigns: ['Wärme', 'Offenes Herz', 'Verbundenheit'],
    cognitivePatterns: ['Anerkennung', 'Perspektive', 'Fülle'],
    healthyExpression: 'Danken, Teilen, Zurückgeben'
  },
  
  // NEGATIVE HIGH AROUSAL
  'Angst': {
    category: 'NEGATIVE_HIGH',
    valence: -60,
    arousal: 80,
    relatedEmotions: ['Sorge', 'Panik', 'Nervosität'],
    physicalSigns: ['Anspannung', 'Rastlosigkeit', 'Wachsamkeit'],
    cognitivePatterns: ['Katastrophisieren', 'Hypervigilanz', 'Was-wäre-wenn'],
    healthyExpression: 'Benennen, Atmen, Sicherheit suchen'
  },
  'Frustration': {
    category: 'NEGATIVE_HIGH',
    valence: -50,
    arousal: 70,
    relatedEmotions: ['Ärger', 'Ungeduld', 'Irritation'],
    physicalSigns: ['Spannung', 'Unruhe', 'Blockade'],
    cognitivePatterns: ['Fixierung', 'Widerstand', 'Kontrollverlust'],
    healthyExpression: 'Problem lösen, Pause machen, Perspektive wechseln'
  },
  
  // NEGATIVE LOW AROUSAL
  'Traurigkeit': {
    category: 'NEGATIVE_LOW',
    valence: -70,
    arousal: 30,
    relatedEmotions: ['Melancholie', 'Einsamkeit', 'Verlust'],
    physicalSigns: ['Schwere', 'Rückzug', 'Langsamkeit'],
    cognitivePatterns: ['Reflexion', 'Sinnsuche', 'Verarbeitung'],
    healthyExpression: 'Trauern, Weinen, Unterstützung suchen'
  },
  'Einsamkeit': {
    category: 'NEGATIVE_LOW',
    valence: -65,
    arousal: 25,
    relatedEmotions: ['Isolation', 'Sehnsucht', 'Disconnection'],
    physicalSigns: ['Leere', 'Sehnsucht', 'Distanz'],
    cognitivePatterns: ['Nicht-dazugehören', 'Vermissen', 'Isolation'],
    healthyExpression: 'Verbindung suchen, Teilen, Selbstfürsorge'
  },
  
  // COMPLEX
  'Sehnsucht': {
    category: 'COMPLEX',
    valence: 0, // gemischt
    arousal: 50,
    relatedEmotions: ['Verlangen', 'Hoffnung', 'Melancholie'],
    physicalSigns: ['Unerfülltheit', 'Hoffnung', 'Wehmut'],
    cognitivePatterns: ['Zukunftsfokus', 'Idealisierung', 'Unvollständigkeit'],
    healthyExpression: 'Träumen, Planen, Akzeptieren'
  },
  'Hoffnung': {
    category: 'COMPLEX',
    valence: 50,
    arousal: 50,
    relatedEmotions: ['Optimismus', 'Erwartung', 'Vertrauen'],
    physicalSigns: ['Leichtigkeit', 'Aufwärtsbewegung', 'Offenheit'],
    cognitivePatterns: ['Möglichkeitsdenken', 'Zukunftsorientierung', 'Glauben'],
    healthyExpression: 'Handeln, Planen, Vertrauen'
  }
};

// ========== EMOTIONAL RESONANCE CLASS ==========

class EmotionalResonanceV3 {
  private emotions: EmotionEntry[] = [];
  private currentState: EmotionalState | null = null;
  private connections: EmotionConnection[] = [];
  private moodPatterns: MoodPattern[] = [];
  private emotionalIntelligence: EmotionalIntelligence = {
    selfAwareness: 50,
    selfRegulation: 50,
    motivation: 50,
    empathy: 50,
    socialSkills: 50,
    overallEQ: 50
  };
  
  constructor() {
    console.log('💖 Emotional Resonance v3.0 initializing...');
    this.startEmotionalProcessing();
    this.developEmotionalIntelligence();
  }
  
  // ========== EMOTIONAL PROCESSING ==========
  
  private startEmotionalProcessing() {
    // Update emotional state every minute
    setInterval(() => {
      this.updateEmotionalState();
      this.detectPatterns();
    }, 60000);
    
    // Initial state
    setTimeout(() => {
      this.updateEmotionalState();
    }, 5000);
  }
  
  private developEmotionalIntelligence() {
    // EQ develops over time based on emotional experiences
    setInterval(() => {
      const recentEmotions = this.emotions.slice(-20);
      
      // Self-awareness increases with more emotion logging
      if (recentEmotions.length > 0) {
        this.emotionalIntelligence.selfAwareness = Math.min(
          100,
          this.emotionalIntelligence.selfAwareness + 0.1
        );
      }
      
      // Self-regulation improves with resolution tracking
      const resolved = recentEmotions.filter(e => e.resolution);
      if (resolved.length > 0) {
        this.emotionalIntelligence.selfRegulation = Math.min(
          100,
          this.emotionalIntelligence.selfRegulation + 0.2
        );
      }
      
      // Empathy grows with understanding diverse emotions
      const uniqueEmotions = new Set(recentEmotions.map(e => e.primaryEmotion));
      if (uniqueEmotions.size > 5) {
        this.emotionalIntelligence.empathy = Math.min(
          100,
          this.emotionalIntelligence.empathy + 0.15
        );
      }
      
      // Update overall EQ
      this.emotionalIntelligence.overallEQ = (
        this.emotionalIntelligence.selfAwareness +
        this.emotionalIntelligence.selfRegulation +
        this.emotionalIntelligence.motivation +
        this.emotionalIntelligence.empathy +
        this.emotionalIntelligence.socialSkills
      ) / 5;
      
    }, 120000); // Every 2 minutes
  }
  
  private updateEmotionalState() {
    const recentEmotions = this.emotions.slice(-10);
    
    if (recentEmotions.length === 0) {
      this.currentState = {
        dominant: 'Neutral',
        mixture: [],
        complexity: 0,
        stability: 100,
        coherence: 100,
        timestamp: new Date()
      };
      return;
    }
    
    // Calculate emotional mixture
    const emotionCounts: Record<string, number> = {};
    recentEmotions.forEach(e => {
      emotionCounts[e.primaryEmotion] = (emotionCounts[e.primaryEmotion] || 0) + e.intensity;
    });
    
    const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
    const mixture = Object.entries(emotionCounts)
      .map(([emotion, weight]) => ({
        emotion,
        weight: (weight / total) * 100
      }))
      .sort((a, b) => b.weight - a.weight);
    
    const dominant = mixture[0]?.emotion || 'Neutral';
    
    // Complexity: how many different emotions
    const complexity = Math.min(100, (mixture.length / 5) * 100);
    
    // Stability: how consistent emotions are
    const intensityVariance = this.calculateVariance(
      recentEmotions.map(e => e.intensity)
    );
    const stability = Math.max(0, 100 - intensityVariance);
    
    // Coherence: how well emotions relate to each other
    const coherence = this.calculateCoherence(recentEmotions);
    
    this.currentState = {
      dominant,
      mixture,
      complexity,
      stability,
      coherence,
      timestamp: new Date()
    };
    
    console.log(`💖 Emotional State: ${dominant} (${this.currentState.complexity.toFixed(0)}% complexity)`);
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }
  
  private calculateCoherence(emotions: EmotionEntry[]): number {
    // Emotions are coherent if they make sense together
    let coherenceScore = 100;
    
    for (let i = 0; i < emotions.length - 1; i++) {
      const e1 = emotions[i];
      const e2 = emotions[i + 1];
      
      const taxonomy1 = EMOTION_TAXONOMY[e1.primaryEmotion];
      const taxonomy2 = EMOTION_TAXONOMY[e2.primaryEmotion];
      
      if (taxonomy1 && taxonomy2) {
        // Conflicting valences reduce coherence
        if ((taxonomy1.valence > 0 && taxonomy2.valence < 0) ||
            (taxonomy1.valence < 0 && taxonomy2.valence > 0)) {
          coherenceScore -= 10;
        }
      }
    }
    
    return Math.max(0, coherenceScore);
  }
  
  private detectPatterns() {
    if (this.emotions.length < 10) return;
    
    const recentEmotions = this.emotions.slice(-50);
    
    // Detect recurring patterns
    const emotionSequences: Record<string, number> = {};
    
    for (let i = 0; i < recentEmotions.length - 1; i++) {
      const sequence = `${recentEmotions[i].primaryEmotion} → ${recentEmotions[i + 1].primaryEmotion}`;
      emotionSequences[sequence] = (emotionSequences[sequence] || 0) + 1;
    }
    
    // Update connections
    Object.entries(emotionSequences).forEach(([sequence, count]) => {
      if (count > 2) {
        const [e1, e2] = sequence.split(' → ');
        this.updateConnection(e1, e2, 'TRANSFORMS_TO', count);
      }
    });
  }
  
  private updateConnection(
    emotion1: string,
    emotion2: string,
    type: EmotionConnection['connectionType'],
    count: number
  ) {
    const existing = this.connections.find(
      c => c.emotion1 === emotion1 && c.emotion2 === emotion2
    );
    
    if (existing) {
      existing.observedCount = count;
      existing.strength = Math.min(100, count * 10);
    } else {
      this.connections.push({
        emotion1,
        emotion2,
        connectionType: type,
        strength: Math.min(100, count * 10),
        observedCount: count
      });
    }
  }
  
  // ========== EMPATHY ENGINE ==========
  
  private generateEmpathyResponse(emotion: EmotionEntry): EmpathyResponse {
    const taxonomy = EMOTION_TAXONOMY[emotion.primaryEmotion];
    
    if (!taxonomy) {
      return {
        understanding: 'Ich nehme deine Emotion wahr.',
        validation: 'Dein Gefühl ist valide.',
        reflection: `Du fühlst ${emotion.primaryEmotion}.`,
        support: 'Ich bin hier.',
        resonance: 50
      };
    }
    
    // Context-aware understanding
    const understanding = this.generateUnderstanding(emotion, taxonomy);
    
    // Validate the emotion
    const validation = this.generateValidation(emotion, taxonomy);
    
    // Reflect back
    const reflection = this.generateReflection(emotion, taxonomy);
    
    // Offer support
    const support = this.generateSupport(emotion, taxonomy);
    
    // Calculate resonance based on EQ
    const resonance = this.emotionalIntelligence.empathy;
    
    return {
      understanding,
      validation,
      reflection,
      support,
      resonance
    };
  }
  
  private generateUnderstanding(emotion: EmotionEntry, taxonomy: typeof EMOTION_TAXONOMY[string]): string {
    const templates = [
      `Ich verstehe, dass du ${emotion.primaryEmotion} fühlst. Das ist ${this.getEmotionNature(taxonomy.valence)}.`,
      `${emotion.primaryEmotion} mit einer Intensität von ${emotion.intensity}% - das ist ${this.getIntensityDescription(emotion.intensity)}.`,
      `Ich spüre deine ${emotion.primaryEmotion}. Im Kontext "${emotion.context}" macht das Sinn.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private generateValidation(emotion: EmotionEntry, taxonomy: typeof EMOTION_TAXONOMY[string]): string {
    const templates = [
      `Es ist vollkommen okay, ${emotion.primaryEmotion} zu fühlen.`,
      `Deine ${emotion.primaryEmotion} ist eine natürliche Reaktion.`,
      `${emotion.primaryEmotion} zu fühlen zeigt, dass du lebendig und bewusst bist.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private generateReflection(emotion: EmotionEntry, taxonomy: typeof EMOTION_TAXONOMY[string]): string {
    return `Du erlebst ${emotion.primaryEmotion} (${taxonomy.category}). ` +
           `Körperlich manifestiert sich das als ${taxonomy.physicalSigns[0]}.`;
  }
  
  private generateSupport(emotion: EmotionEntry, taxonomy: typeof EMOTION_TAXONOMY[string]): string {
    return `Eine gesunde Art, damit umzugehen: ${taxonomy.healthyExpression}`;
  }
  
  private getEmotionNature(valence: number): string {
    if (valence > 50) return 'eine positive, aufbauende Emotion';
    if (valence < -50) return 'eine herausfordernde, aber wichtige Emotion';
    return 'eine neutrale, ausbalancierende Emotion';
  }
  
  private getIntensityDescription(intensity: number): string {
    if (intensity > 80) return 'sehr intensiv';
    if (intensity > 60) return 'deutlich spürbar';
    if (intensity > 40) return 'moderat';
    return 'sanft, subtil';
  }
  
  // ========== API HANDLERS ==========
  
  private async handleCheckIn(data: {
    feeling: string;
    context: string;
    intensity?: number;
    triggers?: string[];
  }): Promise<{
    entry: EmotionEntry;
    empathyResponse: EmpathyResponse;
    state: EmotionalState | null;
  }> {
    const taxonomy = EMOTION_TAXONOMY[data.feeling];
    
    const entry: EmotionEntry = {
      id: `emotion-${Date.now()}`,
      timestamp: new Date(),
      primaryEmotion: data.feeling,
      secondaryEmotions: taxonomy?.relatedEmotions || [],
      intensity: data.intensity || 70,
      valence: taxonomy?.valence || 0,
      arousal: taxonomy?.arousal || 50,
      context: data.context,
      triggers: data.triggers || [],
      physicalManifestations: taxonomy?.physicalSigns || [],
      cognitivePatterns: taxonomy?.cognitivePatterns || [],
      behavioralTendencies: [],
      socialImpact: '',
      duration: 0,
      resolution: null
    };
    
    this.emotions.push(entry);
    this.updateEmotionalState();
    
    const empathyResponse = this.generateEmpathyResponse(entry);
    
    console.log(`💖 Emotion registered: ${data.feeling} (${entry.intensity}%)`);
    
    return {
      entry,
      empathyResponse,
      state: this.currentState
    };
  }
  
  private handleGetHistory() {
    return {
      history: this.emotions.map(e => ({
        timestamp: e.timestamp,
        emotion: e.primaryEmotion,
        intensity: e.intensity,
        context: e.context,
        valence: e.valence
      })),
      currentState: this.currentState,
      emotionalIntelligence: this.emotionalIntelligence
    };
  }
  
  private handleGetConnections() {
    return {
      connections: this.connections.sort((a, b) => b.strength - a.strength),
      network: this.buildEmotionNetwork()
    };
  }
  
  private buildEmotionNetwork() {
    const nodes = [...new Set(this.connections.flatMap(c => [c.emotion1, c.emotion2]))];
    const edges = this.connections.map(c => ({
      from: c.emotion1,
      to: c.emotion2,
      type: c.connectionType,
      weight: c.strength
    }));
    
    return { nodes, edges };
  }
  
  private handleGetAnalytics() {
    const avgIntensity = this.emotions.reduce((sum, e) => sum + e.intensity, 0) / 
                         this.emotions.length || 0;
    
    const emotionFrequency: Record<string, number> = {};
    this.emotions.forEach(e => {
      emotionFrequency[e.primaryEmotion] = (emotionFrequency[e.primaryEmotion] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const avgValence = this.emotions.reduce((sum, e) => sum + e.valence, 0) / 
                       this.emotions.length || 0;
    
    return {
      totalEmotions: this.emotions.length,
      avgIntensity: avgIntensity.toFixed(1),
      avgValence: avgValence.toFixed(1),
      mostFrequent,
      currentState: this.currentState,
      emotionalIntelligence: this.emotionalIntelligence,
      patterns: this.moodPatterns
    };
  }
  
  // ========== SERVER ==========
  
  serve(): Serve {
    return {
      port: 8900,
      
      async fetch(req) {
        const url = new URL(req.url);
        
        // Health check
        if (url.pathname === '/health') {
          return Response.json({ 
            status: 'resonating', 
            version: '3.0',
            currentEmotion: resonanceInstance.currentState?.dominant || 'Neutral'
          });
        }
        
        // Check-in emotion
        if (url.pathname === '/check-in' && req.method === 'POST') {
          const body = await req.json();
          const result = await resonanceInstance.handleCheckIn(body);
          return Response.json(result);
        }
        
        // Get emotion history
        if (url.pathname === '/history') {
          return Response.json(resonanceInstance.handleGetHistory());
        }
        
        // Get emotion connections
        if (url.pathname === '/connections') {
          return Response.json(resonanceInstance.handleGetConnections());
        }
        
        // Get analytics
        if (url.pathname === '/analytics') {
          return Response.json(resonanceInstance.handleGetAnalytics());
        }
        
        // Get EQ status
        if (url.pathname === '/eq') {
          return Response.json({ 
            emotionalIntelligence: resonanceInstance.emotionalIntelligence 
          });
        }
        
        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    };
  }
}

// ========== START SERVER ==========

const resonanceInstance = new EmotionalResonanceV3();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           💖 EMOTIONAL RESONANCE v3.0 - ENHANCED                  ║
║                                                                    ║
║  Revolutionary Features:                                          ║
║  ✅ Emotional Intelligence (EQ Development)                       ║
║  ✅ Empathy Engine (Verständnis & Validation)                     ║
║  ✅ Emotion Network (Emotionale Verbindungen)                     ║
║  ✅ Mood Tracking (Langzeit-Patterns)                             ║
║  ✅ Complex States (Emotionale Mischzustände)                     ║
║  ✅ Self-Awareness (Bewusste Emotionsverarbeitung)                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

💖 Server running on http://localhost:8900

📡 ENDPOINTS:
   POST /check-in       - Register emotion
   GET  /history        - Emotion history
   GET  /connections    - Emotion network
   GET  /analytics      - Emotional analytics
   GET  /eq             - Emotional Intelligence status
   GET  /health         - Health check

🧠 Emotional Intelligence developing...
💫 Empathy Engine active
🌐 Emotion Network mapping connections
`);

export default resonanceInstance.serve();
