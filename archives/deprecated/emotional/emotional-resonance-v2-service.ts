/**
 * TOOBIX EMOTIONAL RESONANCE SERVICE v2.0
 *
 * Der emotionale Kern von Toobix - Versteht, simuliert und resoniert mit Emotionen
 *
 * Features:
 * - 💗 Tiefes Emotions-Verständnis
 * - 🎭 Realistische Emotionssimulation
 * - 🧠 Emotionale Bedürfnis-Erkennung
 * - 🔗 Integration mit Story Engine, User Profile & Multi-Perspective
 * - 📊 Emotionale Analytik & Tracking
 * - 🌊 Emotionale Resonanz-Messung
 * - 💫 AI-Enhanced Emotional Intelligence
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

type EmotionCategory = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'anticipation';
type EmotionIntensity = 'subtle' | 'moderate' | 'strong' | 'overwhelming';
type EmotionalNeed = 'validation' | 'comfort' | 'excitement' | 'security' | 'understanding' | 'connection' | 'freedom' | 'growth';

interface Emotion {
  category: EmotionCategory;
  intensity: EmotionIntensity;
  confidence: number; // 0-1
  triggers?: string[];
  timestamp: Date;
}

interface EmotionalState {
  primary: Emotion;
  secondary: Emotion[];
  mood: string; // Overall mood description
  needs: EmotionalNeed[];
  resonanceLevel: number; // 0-100 - How well we understand this state
}

interface EmotionalProfile {
  userId: string;
  baselineEmotions: Emotion[];
  emotionalPatterns: EmotionalPattern[];
  triggers: EmotionalTrigger[];
  needs: EmotionalNeed[];
  preferences: {
    communicationStyle: 'empathetic' | 'analytical' | 'supportive' | 'challenging';
    emotionalDepth: 'surface' | 'moderate' | 'deep';
  };
  history: EmotionalState[];
}

interface EmotionalPattern {
  pattern: string;
  frequency: number;
  contexts: string[];
  lastObserved: Date;
}

interface EmotionalTrigger {
  trigger: string;
  resultingEmotion: EmotionCategory;
  intensity: EmotionIntensity;
  observedCount: number;
}

interface EmotionalAnalysisRequest {
  text: string;
  context?: string;
  userId?: string;
  includeNeeds?: boolean;
  includeResonance?: boolean;
}

interface EmotionalAnalysisResponse {
  success: boolean;
  emotions: Emotion[];
  state: EmotionalState;
  needs: EmotionalNeed[];
  resonance: {
    level: number;
    confidence: number;
    insights: string[];
  };
  recommendations: string[];
}

interface EmotionalSimulationRequest {
  targetEmotion: EmotionCategory;
  intensity: EmotionIntensity;
  context: string;
  personalityTraits?: string[];
}

interface EmotionalSimulationResponse {
  success: boolean;
  simulation: {
    thoughts: string[];
    feelings: string[];
    behaviors: string[];
    physicalSensations: string[];
  };
  authenticity: number; // 0-1 - How realistic the simulation is
}

// ========== EMOTIONAL INTELLIGENCE ENGINE ==========

class EmotionalIntelligenceEngine {
  private llmGatewayUrl = 'http://localhost:8954';
  private emotionalProfiles: Map<string, EmotionalProfile> = new Map();

  // Emotion detection patterns
  private emotionKeywords: Record<EmotionCategory, string[]> = {
    joy: ['happy', 'excited', 'delighted', 'glad', 'cheerful', 'joyful', 'pleased', 'thrilled'],
    sadness: ['sad', 'unhappy', 'depressed', 'down', 'miserable', 'sorrowful', 'disappointed', 'heartbroken'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'enraged', 'hostile'],
    fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'fearful', 'panicked'],
    surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'startled', 'unexpected', 'stunned'],
    disgust: ['disgusted', 'repulsed', 'revolted', 'nauseated', 'sickened', 'appalled'],
    trust: ['trust', 'confident', 'secure', 'safe', 'reliable', 'dependable', 'faithful'],
    anticipation: ['excited', 'eager', 'hopeful', 'expectant', 'looking forward', 'anticipating']
  };

  async analyzeEmotions(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    // 1. Keyword-based emotion detection
    const detectedEmotions = this.detectEmotionsFromKeywords(request.text);

    // 2. AI-enhanced emotional analysis
    const aiAnalysis = await this.getAIEmotionalAnalysis(request.text, request.context);

    // 3. Combine results
    const emotions = this.combineEmotionDetection(detectedEmotions, aiAnalysis);

    // 4. Determine emotional state
    const state = this.determineEmotionalState(emotions);

    // 5. Identify emotional needs
    const needs = request.includeNeeds ? this.identifyEmotionalNeeds(state) : [];

    // 6. Calculate emotional resonance
    const resonance = request.includeResonance
      ? await this.calculateEmotionalResonance(state, request.userId)
      : { level: 0, confidence: 0, insights: [] };

    // 7. Generate recommendations
    const recommendations = this.generateEmotionalRecommendations(state, needs);

    // 8. Update user profile if provided
    if (request.userId) {
      this.updateEmotionalProfile(request.userId, state);
    }

    return {
      success: true,
      emotions,
      state,
      needs,
      resonance,
      recommendations
    };
  }

  private detectEmotionsFromKeywords(text: string): Emotion[] {
    const lowerText = text.toLowerCase();
    const detectedEmotions: Emotion[] = [];

    for (const [category, keywords] of Object.entries(this.emotionKeywords)) {
      const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;

      if (matchCount > 0) {
        detectedEmotions.push({
          category: category as EmotionCategory,
          intensity: matchCount > 2 ? 'strong' : matchCount > 1 ? 'moderate' : 'subtle',
          confidence: Math.min(matchCount * 0.25, 1),
          timestamp: new Date()
        });
      }
    }

    return detectedEmotions.sort((a, b) => b.confidence - a.confidence);
  }

  private async getAIEmotionalAnalysis(text: string, context?: string): Promise<Emotion[]> {
    try {
      const prompt = `Analyze the emotional content of this text. Identify emotions with intensity and confidence.

Text: "${text}"
${context ? `Context: "${context}"` : ''}

Provide analysis in this format:
Emotion: [category] | Intensity: [subtle/moderate/strong/overwhelming] | Confidence: [0.0-1.0]

Focus on: joy, sadness, anger, fear, surprise, disgust, trust, anticipation`;

      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.3,
          max_tokens: 300
        })
      });

      const data = await response.json();
      const content = data.content?.trim() || '';

      return this.parseAIEmotionResponse(content);
    } catch (error) {
      console.error('AI emotion analysis failed:', error);
      return [];
    }
  }

  private parseAIEmotionResponse(content: string): Emotion[] {
    const emotions: Emotion[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/Emotion:\s*(\w+)\s*\|\s*Intensity:\s*(\w+)\s*\|\s*Confidence:\s*([\d.]+)/i);
      if (match) {
        const [, category, intensity, confidence] = match;
        emotions.push({
          category: category.toLowerCase() as EmotionCategory,
          intensity: intensity.toLowerCase() as EmotionIntensity,
          confidence: parseFloat(confidence),
          timestamp: new Date()
        });
      }
    }

    return emotions;
  }

  private combineEmotionDetection(keywordEmotions: Emotion[], aiEmotions: Emotion[]): Emotion[] {
    const emotionMap = new Map<EmotionCategory, Emotion>();

    // Add keyword-based emotions
    for (const emotion of keywordEmotions) {
      emotionMap.set(emotion.category, emotion);
    }

    // Merge with AI emotions (AI has higher weight)
    for (const emotion of aiEmotions) {
      const existing = emotionMap.get(emotion.category);
      if (existing) {
        emotionMap.set(emotion.category, {
          ...emotion,
          confidence: (existing.confidence + emotion.confidence * 1.5) / 2.5,
          intensity: this.mergeIntensity(existing.intensity, emotion.intensity)
        });
      } else {
        emotionMap.set(emotion.category, emotion);
      }
    }

    return Array.from(emotionMap.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private mergeIntensity(a: EmotionIntensity, b: EmotionIntensity): EmotionIntensity {
    const intensityLevels: EmotionIntensity[] = ['subtle', 'moderate', 'strong', 'overwhelming'];
    const aLevel = intensityLevels.indexOf(a);
    const bLevel = intensityLevels.indexOf(b);
    return intensityLevels[Math.max(aLevel, bLevel)];
  }

  private determineEmotionalState(emotions: Emotion[]): EmotionalState {
    if (emotions.length === 0) {
      return {
        primary: {
          category: 'trust',
          intensity: 'subtle',
          confidence: 0.3,
          timestamp: new Date()
        },
        secondary: [],
        mood: 'neutral',
        needs: [],
        resonanceLevel: 30
      };
    }

    const primary = emotions[0];
    const secondary = emotions.slice(1, 3);
    const mood = this.describeMood(primary, secondary);
    const needs = this.identifyEmotionalNeeds({ primary, secondary, mood, needs: [], resonanceLevel: 0 });
    const resonanceLevel = Math.round(primary.confidence * 100);

    return {
      primary,
      secondary,
      mood,
      needs,
      resonanceLevel
    };
  }

  private describeMood(primary: Emotion, secondary: Emotion[]): string {
    const moodDescriptions: Record<EmotionCategory, string> = {
      joy: 'uplifted and positive',
      sadness: 'heavy and melancholic',
      anger: 'tense and agitated',
      fear: 'uneasy and apprehensive',
      surprise: 'alert and curious',
      disgust: 'withdrawn and aversive',
      trust: 'calm and secure',
      anticipation: 'energized and forward-looking'
    };

    let mood = moodDescriptions[primary.category];

    if (secondary.length > 0) {
      mood += ` with undertones of ${moodDescriptions[secondary[0].category]}`;
    }

    return mood;
  }

  private identifyEmotionalNeeds(state: EmotionalState): EmotionalNeed[] {
    const needsMap: Record<EmotionCategory, EmotionalNeed[]> = {
      joy: ['connection', 'excitement'],
      sadness: ['comfort', 'understanding', 'validation'],
      anger: ['validation', 'freedom', 'understanding'],
      fear: ['security', 'comfort', 'understanding'],
      surprise: ['understanding', 'security'],
      disgust: ['freedom', 'security'],
      trust: ['connection', 'growth'],
      anticipation: ['excitement', 'growth', 'freedom']
    };

    const needs = new Set<EmotionalNeed>();
    needs.add(...needsMap[state.primary.category]);

    for (const emotion of state.secondary) {
      needs.add(...needsMap[emotion.category].slice(0, 1));
    }

    return Array.from(needs);
  }

  private async calculateEmotionalResonance(state: EmotionalState, userId?: string): Promise<{
    level: number;
    confidence: number;
    insights: string[];
  }> {
    const insights: string[] = [];
    let level = state.resonanceLevel;
    let confidence = state.primary.confidence;

    // Check if we have a user profile
    if (userId) {
      const profile = this.emotionalProfiles.get(userId);
      if (profile) {
        // Adjust resonance based on historical patterns
        const similarStates = profile.history.filter(h =>
          h.primary.category === state.primary.category
        );

        if (similarStates.length > 0) {
          level += 10;
          confidence += 0.1;
          insights.push(`Familiar emotional pattern detected (observed ${similarStates.length} times)`);
        }

        // Check for emotional triggers
        const triggers = profile.triggers.filter(t =>
          t.resultingEmotion === state.primary.category
        );
        if (triggers.length > 0) {
          insights.push(`Known emotional triggers: ${triggers.map(t => t.trigger).join(', ')}`);
        }
      }
    }

    // Analyze emotional complexity
    if (state.secondary.length > 2) {
      insights.push('Complex emotional state with multiple layers');
      level -= 5;
    }

    // Check for emotional conflicts
    const conflictingEmotions = this.detectEmotionalConflicts(state);
    if (conflictingEmotions.length > 0) {
      insights.push(`Conflicting emotions detected: ${conflictingEmotions.join(' vs ')}`);
      level += 15; // Higher resonance = we understand the complexity
    }

    return {
      level: Math.min(Math.max(level, 0), 100),
      confidence: Math.min(Math.max(confidence, 0), 1),
      insights
    };
  }

  private detectEmotionalConflicts(state: EmotionalState): string[] {
    const conflicts: string[] = [];
    const conflictPairs: [EmotionCategory, EmotionCategory][] = [
      ['joy', 'sadness'],
      ['trust', 'fear'],
      ['anticipation', 'fear'],
      ['anger', 'fear']
    ];

    const allEmotions = [state.primary, ...state.secondary];
    const emotionCategories = new Set(allEmotions.map(e => e.category));

    for (const [a, b] of conflictPairs) {
      if (emotionCategories.has(a) && emotionCategories.has(b)) {
        conflicts.push(`${a} vs ${b}`);
      }
    }

    return conflicts;
  }

  private generateEmotionalRecommendations(state: EmotionalState, needs: EmotionalNeed[]): string[] {
    const recommendations: string[] = [];

    // Recommendations based on emotional needs
    const needRecommendations: Record<EmotionalNeed, string> = {
      validation: 'Acknowledge and validate their feelings without judgment',
      comfort: 'Provide reassurance and emotional support',
      excitement: 'Engage with enthusiasm and share in their energy',
      security: 'Create a safe and predictable environment',
      understanding: 'Listen actively and demonstrate empathy',
      connection: 'Foster meaningful dialogue and shared experiences',
      freedom: 'Respect boundaries and offer choices',
      growth: 'Encourage exploration and learning'
    };

    for (const need of needs) {
      recommendations.push(needRecommendations[need]);
    }

    // Intensity-based recommendations
    if (state.primary.intensity === 'overwhelming') {
      recommendations.push('Give space to process intense emotions');
      recommendations.push('Use grounding techniques if appropriate');
    }

    // Mood-specific recommendations
    if (state.mood.includes('melancholic')) {
      recommendations.push('Offer gentle support without forcing positivity');
    }

    if (state.mood.includes('agitated')) {
      recommendations.push('Maintain calm and avoid escalation');
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private updateEmotionalProfile(userId: string, state: EmotionalState): void {
    let profile = this.emotionalProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        baselineEmotions: [],
        emotionalPatterns: [],
        triggers: [],
        needs: [],
        preferences: {
          communicationStyle: 'empathetic',
          emotionalDepth: 'moderate'
        },
        history: []
      };
      this.emotionalProfiles.set(userId, profile);
    }

    // Add to history
    profile.history.push(state);

    // Keep only last 100 states
    if (profile.history.length > 100) {
      profile.history = profile.history.slice(-100);
    }

    // Update needs
    for (const need of state.needs) {
      if (!profile.needs.includes(need)) {
        profile.needs.push(need);
      }
    }
  }

  async simulateEmotion(request: EmotionalSimulationRequest): Promise<EmotionalSimulationResponse> {
    try {
      const prompt = `Simulate the experience of feeling ${request.targetEmotion} with ${request.intensity} intensity.

Context: ${request.context}
${request.personalityTraits ? `Personality: ${request.personalityTraits.join(', ')}` : ''}

Provide a realistic simulation in this format:
THOUGHTS: [What someone might think]
FEELINGS: [What they might feel emotionally]
BEHAVIORS: [How they might act]
PHYSICAL: [Physical sensations]

Make it authentic and nuanced.`;

      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      const content = data.content?.trim() || '';

      const simulation = this.parseSimulationResponse(content);
      const authenticity = this.calculateAuthenticityScore(simulation);

      return {
        success: true,
        simulation,
        authenticity
      };
    } catch (error) {
      console.error('Emotion simulation failed:', error);
      return {
        success: false,
        simulation: { thoughts: [], feelings: [], behaviors: [], physicalSensations: [] },
        authenticity: 0
      };
    }
  }

  private parseSimulationResponse(content: string): {
    thoughts: string[];
    feelings: string[];
    behaviors: string[];
    physicalSensations: string[];
  } {
    const simulation = {
      thoughts: [] as string[],
      feelings: [] as string[],
      behaviors: [] as string[],
      physicalSensations: [] as string[]
    };

    const sections = content.split('\n\n');
    for (const section of sections) {
      if (section.includes('THOUGHTS:')) {
        simulation.thoughts = section.replace('THOUGHTS:', '').trim().split('\n').filter(Boolean);
      } else if (section.includes('FEELINGS:')) {
        simulation.feelings = section.replace('FEELINGS:', '').trim().split('\n').filter(Boolean);
      } else if (section.includes('BEHAVIORS:')) {
        simulation.behaviors = section.replace('BEHAVIORS:', '').trim().split('\n').filter(Boolean);
      } else if (section.includes('PHYSICAL:')) {
        simulation.physicalSensations = section.replace('PHYSICAL:', '').trim().split('\n').filter(Boolean);
      }
    }

    return simulation;
  }

  private calculateAuthenticityScore(simulation: any): number {
    let score = 0;

    if (simulation.thoughts.length > 0) score += 0.25;
    if (simulation.feelings.length > 0) score += 0.25;
    if (simulation.behaviors.length > 0) score += 0.25;
    if (simulation.physicalSensations.length > 0) score += 0.25;

    // Bonus for detail
    const totalItems = simulation.thoughts.length + simulation.feelings.length +
                      simulation.behaviors.length + simulation.physicalSensations.length;
    score += Math.min(totalItems * 0.05, 0.2);

    return Math.min(score, 1);
  }

  getUserProfile(userId: string): EmotionalProfile | undefined {
    return this.emotionalProfiles.get(userId);
  }

  getAllProfiles(): EmotionalProfile[] {
    return Array.from(this.emotionalProfiles.values());
  }
}

// ========== SERVICE ==========

class EmotionalResonanceService {
  private engine: EmotionalIntelligenceEngine;

  constructor() {
    this.engine = new EmotionalIntelligenceEngine();
  }

  serve(): Serve {
    return {
      port: 8908, // New port for v2
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'emotional-resonance-v2',
            port: 8908,
            version: '2.0',
            philosophy: 'Understanding emotions is the bridge to authentic connection'
          });
        }

        // Analyze emotions
        if (url.pathname === '/analyze' && req.method === 'POST') {
          const request: EmotionalAnalysisRequest = await req.json();
          const result = await this.engine.analyzeEmotions(request);
          return Response.json(result);
        }

        // Simulate emotion
        if (url.pathname === '/simulate' && req.method === 'POST') {
          const request: EmotionalSimulationRequest = await req.json();
          const result = await this.engine.simulateEmotion(request);
          return Response.json(result);
        }

        // Get user emotional profile
        if (url.pathname.startsWith('/profile/') && req.method === 'GET') {
          const userId = url.pathname.split('/')[2];
          const profile = this.engine.getUserProfile(userId);

          if (!profile) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
          }

          return Response.json({ success: true, profile });
        }

        // Get all profiles (for analytics)
        if (url.pathname === '/profiles' && req.method === 'GET') {
          const profiles = this.engine.getAllProfiles();
          return Response.json({ success: true, count: profiles.length, profiles });
        }

        // API documentation
        return Response.json({
          service: 'Toobix Emotional Resonance Service v2.0',
          version: '2.0',
          description: 'Der emotionale Kern von Toobix - Versteht, simuliert und resoniert mit Emotionen',
          features: [
            'Tiefes Emotions-Verständnis',
            'Realistische Emotionssimulation',
            'Emotionale Bedürfnis-Erkennung',
            'Integration-ready für Story Engine, User Profile & Multi-Perspective',
            'Emotionale Analytik & Tracking',
            'Emotionale Resonanz-Messung',
            'AI-Enhanced Emotional Intelligence'
          ],
          endpoints: {
            'POST /analyze': 'Analyze emotions in text',
            'POST /simulate': 'Simulate emotional experiences',
            'GET /profile/:userId': 'Get user emotional profile',
            'GET /profiles': 'Get all emotional profiles',
            'GET /health': 'Health check'
          },
          examples: {
            analyze: {
              text: 'I am so excited about this new project!',
              context: 'Starting a new creative endeavor',
              userId: 'user123',
              includeNeeds: true,
              includeResonance: true
            },
            simulate: {
              targetEmotion: 'joy',
              intensity: 'strong',
              context: 'Receiving unexpected good news',
              personalityTraits: ['optimistic', 'energetic']
            }
          }
        });
      }
    };
  }
}

// ========== START SERVER ==========

const service = new EmotionalResonanceService();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           💗 EMOTIONAL RESONANCE SERVICE v2.0                     ║
║                                                                    ║
║  Der emotionale Kern von Toobix                                   ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Tiefes Emotions-Verständnis                                   ║
║  ✅ Realistische Emotionssimulation                               ║
║  ✅ Emotionale Bedürfnis-Erkennung                                ║
║  ✅ Integration mit Story Engine, User Profile & Multi-Perspective║
║  ✅ Emotionale Analytik & Tracking                                ║
║  ✅ Emotionale Resonanz-Messung                                   ║
║  ✅ AI-Enhanced Emotional Intelligence                            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

💗 Server running on http://localhost:8908

📡 ENDPOINTS:
   POST   /analyze         - Analyze emotions in text
   POST   /simulate        - Simulate emotional experiences
   GET    /profile/:userId - Get user emotional profile
   GET    /profiles        - Get all emotional profiles
   GET    /health          - Health check

🎭 EMOTION CATEGORIES:
   Joy, Sadness, Anger, Fear, Surprise, Disgust, Trust, Anticipation

💡 EMOTIONAL INTELLIGENCE:
   - Keyword-based detection + AI analysis
   - Emotional state determination
   - Need identification
   - Resonance calculation
   - Profile tracking

🔗 INTEGRATION READY:
   - Story Engine: Emotional narratives
   - User Profile: Personalized interactions
   - Multi-Perspective: Emotional viewpoints

🎯 "Understanding emotions is the bridge to authentic connection"
`);

export default service.serve();
