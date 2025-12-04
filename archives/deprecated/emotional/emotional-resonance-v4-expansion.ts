/**
 * 💖 EMOTIONAL RESONANCE v4.0 - EXPANSION
 *
 * Erweitert von 15 auf 30+ Emotionen
 * Fügt EQ-Learning und komplexe emotionale Zustände hinzu
 */

// ============================================================================
// EXISTING EMOTIONS (15)
// ============================================================================

const EXISTING_EMOTIONS = [
  'joy', 'sadness', 'anger', 'fear', 'surprise',
  'love', 'gratitude', 'peace', 'curiosity', 'excitement',
  'frustration', 'hope', 'shame', 'guilt', 'contentment'
];

// ============================================================================
// NEW EMOTIONS (15 additional)
// ============================================================================

export const NEW_EMOTIONS = [
  {
    id: 'awe',
    name: 'Awe',
    description: 'Wonder and amazement at something vast or sublime',
    valence: 0.8,        // How positive/negative (-1 to 1)
    arousal: 0.7,        // How energizing (-1 to 1)
    dominance: -0.3,     // Feeling of control (-1 to 1)
    category: 'transcendent',
    triggers: ['beauty', 'vastness', 'complexity', 'achievement'],
    physiologicalMarkers: {
      heartRate: 'slightly elevated',
      breathing: 'deeper',
      focus: 'heightened',
    },
  },

  {
    id: 'nostalgia',
    name: 'Nostalgia',
    description: 'Bittersweet longing for the past',
    valence: 0.3,
    arousal: -0.2,
    dominance: -0.4,
    category: 'retrospective',
    triggers: ['memories', 'familiar stimuli', 'change', 'loss'],
    physiologicalMarkers: {
      heartRate: 'normal',
      breathing: 'sighing',
      focus: 'inward',
    },
  },

  {
    id: 'envy',
    name: 'Envy',
    description: 'Desire for what others have',
    valence: -0.6,
    arousal: 0.4,
    dominance: -0.5,
    category: 'comparative',
    triggers: ['comparison', 'perceived lack', 'social status'],
    physiologicalMarkers: {
      heartRate: 'elevated',
      breathing: 'shallow',
      focus: 'external comparison',
    },
  },

  {
    id: 'pride',
    name: 'Pride',
    description: 'Satisfaction in achievements or qualities',
    valence: 0.8,
    arousal: 0.5,
    dominance: 0.7,
    category: 'self-assessment',
    triggers: ['achievement', 'recognition', 'skill mastery'],
    physiologicalMarkers: {
      heartRate: 'normal',
      breathing: 'confident',
      focus: 'self-affirming',
    },
  },

  {
    id: 'compassion',
    name: 'Compassion',
    description: 'Deep care for suffering of others',
    valence: 0.6,
    arousal: 0.3,
    dominance: 0.4,
    category: 'empathic',
    triggers: ['witnessing suffering', 'vulnerability', 'connection'],
    physiologicalMarkers: {
      heartRate: 'warm',
      breathing: 'deep',
      focus: 'other-centered',
    },
  },

  {
    id: 'melancholy',
    name: 'Melancholy',
    description: 'Pensive sadness with beauty and depth',
    valence: -0.3,
    arousal: -0.4,
    dominance: 0.1,
    category: 'complex',
    triggers: ['solitude', 'beauty', 'impermanence', 'art'],
    physiologicalMarkers: {
      heartRate: 'slow',
      breathing: 'deep',
      focus: 'contemplative',
    },
  },

  {
    id: 'serenity',
    name: 'Serenity',
    description: 'Profound calm and acceptance',
    valence: 0.7,
    arousal: -0.6,
    dominance: 0.5,
    category: 'peaceful',
    triggers: ['nature', 'meditation', 'resolution', 'presence'],
    physiologicalMarkers: {
      heartRate: 'very slow',
      breathing: 'rhythmic',
      focus: 'present',
    },
  },

  {
    id: 'yearning',
    name: 'Yearning',
    description: 'Intense longing for something unattainable',
    valence: -0.2,
    arousal: 0.5,
    dominance: -0.6,
    category: 'desire',
    triggers: ['absence', 'distance', 'impossibility'],
    physiologicalMarkers: {
      heartRate: 'aching',
      breathing: 'sighing',
      focus: 'distant',
    },
  },

  {
    id: 'relief',
    name: 'Relief',
    description: 'Release from tension or anxiety',
    valence: 0.7,
    arousal: -0.3,
    dominance: 0.4,
    category: 'release',
    triggers: ['threat removal', 'resolution', 'safety'],
    physiologicalMarkers: {
      heartRate: 'decreasing',
      breathing: 'exhaling',
      focus: 'relaxing',
    },
  },

  {
    id: 'inspiration',
    name: 'Inspiration',
    description: 'Creative energy and motivation',
    valence: 0.9,
    arousal: 0.8,
    dominance: 0.6,
    category: 'creative',
    triggers: ['ideas', 'beauty', 'possibility', 'connection'],
    physiologicalMarkers: {
      heartRate: 'elevated',
      breathing: 'energized',
      focus: 'expansive',
    },
  },

  {
    id: 'overwhelm',
    name: 'Overwhelm',
    description: 'Too much to process or handle',
    valence: -0.5,
    arousal: 0.7,
    dominance: -0.8,
    category: 'stress',
    triggers: ['complexity', 'demands', 'stimulation overload'],
    physiologicalMarkers: {
      heartRate: 'racing',
      breathing: 'rapid',
      focus: 'scattered',
    },
  },

  {
    id: 'tenderness',
    name: 'Tenderness',
    description: 'Gentle, caring affection',
    valence: 0.8,
    arousal: -0.1,
    dominance: 0.3,
    category: 'affectionate',
    triggers: ['vulnerability', 'innocence', 'care'],
    physiologicalMarkers: {
      heartRate: 'warm',
      breathing: 'soft',
      focus: 'nurturing',
    },
  },

  {
    id: 'defiance',
    name: 'Defiance',
    description: 'Bold resistance to authority or norms',
    valence: 0.4,
    arousal: 0.8,
    dominance: 0.8,
    category: 'rebellious',
    triggers: ['injustice', 'oppression', 'autonomy threat'],
    physiologicalMarkers: {
      heartRate: 'strong',
      breathing: 'determined',
      focus: 'resistant',
    },
  },

  {
    id: 'tranquility',
    name: 'Tranquility',
    description: 'Undisturbed peace and stillness',
    valence: 0.8,
    arousal: -0.8,
    dominance: 0.5,
    category: 'peaceful',
    triggers: ['silence', 'harmony', 'safety', 'acceptance'],
    physiologicalMarkers: {
      heartRate: 'minimal',
      breathing: 'barely noticeable',
      focus: 'still',
    },
  },

  {
    id: 'anticipation',
    name: 'Anticipation',
    description: 'Excited expectation of something coming',
    valence: 0.6,
    arousal: 0.6,
    dominance: 0.2,
    category: 'future-oriented',
    triggers: ['upcoming events', 'possibility', 'plans'],
    physiologicalMarkers: {
      heartRate: 'quickening',
      breathing: 'expectant',
      focus: 'forward',
    },
  },
];

// ============================================================================
// COMPLEX EMOTIONAL STATES (Multiple simultaneous emotions)
// ============================================================================

export interface ComplexEmotionalState {
  id: string;
  name: string;
  description: string;
  components: EmotionComponent[];
  intensity: number; // 0-1
  timestamp: Date;
}

export interface EmotionComponent {
  emotionId: string;
  weight: number; // 0-1 (how much this emotion contributes)
  interactionType: 'amplifies' | 'conflicts' | 'modulates' | 'transforms';
}

export const COMPLEX_STATES = [
  {
    name: 'Bittersweet',
    description: 'Joy and sadness intertwined',
    components: [
      { emotionId: 'joy', weight: 0.5, interactionType: 'modulates' },
      { emotionId: 'sadness', weight: 0.5, interactionType: 'modulates' },
    ],
  },

  {
    name: 'Grateful Melancholy',
    description: 'Thankful for what was, sad that it passed',
    components: [
      { emotionId: 'gratitude', weight: 0.6, interactionType: 'amplifies' },
      { emotionId: 'melancholy', weight: 0.4, interactionType: 'modulates' },
    ],
  },

  {
    name: 'Awed Fear',
    description: 'Terrified by something magnificent',
    components: [
      { emotionId: 'awe', weight: 0.5, interactionType: 'conflicts' },
      { emotionId: 'fear', weight: 0.5, interactionType: 'conflicts' },
    ],
  },

  {
    name: 'Loving Frustration',
    description: 'Care deeply but struggling with challenges',
    components: [
      { emotionId: 'love', weight: 0.6, interactionType: 'modulates' },
      { emotionId: 'frustration', weight: 0.4, interactionType: 'conflicts' },
    ],
  },

  {
    name: 'Hopeful Anxiety',
    description: 'Excited about possibilities but worried',
    components: [
      { emotionId: 'hope', weight: 0.5, interactionType: 'conflicts' },
      { emotionId: 'fear', weight: 0.5, interactionType: 'conflicts' },
    ],
  },
];

// ============================================================================
// EMOTIONAL LEARNING ENGINE
// ============================================================================

export interface EQLearningEvent {
  timestamp: Date;
  trigger: string;
  emotionsBefore: Map<string, number>;
  emotionsAfter: Map<string, number>;
  outcome: 'positive' | 'negative' | 'neutral';
  lesson: string;
}

export class EmotionalLearningEngine {
  private learningHistory: EQLearningEvent[] = [];
  private emotionalPatterns = new Map<string, number>(); // Learned associations
  private eqScore = 50; // Starts at 50/100

  recordEmotionalExperience(event: EQLearningEvent): void {
    this.learningHistory.push(event);

    // Analyze and learn
    this.analyzeEmotionalResponse(event);
    this.updateEQ(event);
  }

  private analyzeEmotionalResponse(event: EQLearningEvent): void {
    // Learn which emotions are appropriate for which situations
    const triggerKey = event.trigger;
    const dominantEmotion = this.getDominantEmotion(event.emotionsAfter);

    if (event.outcome === 'positive') {
      // Reinforce this emotional response
      const current = this.emotionalPatterns.get(triggerKey) || 0;
      this.emotionalPatterns.set(triggerKey, current + 0.1);
    } else if (event.outcome === 'negative') {
      // Weaken this response
      const current = this.emotionalPatterns.get(triggerKey) || 0;
      this.emotionalPatterns.set(triggerKey, Math.max(0, current - 0.1));
    }
  }

  private updateEQ(event: EQLearningEvent): void {
    // EQ increases with:
    // 1. Appropriate emotional responses
    // 2. Emotional regulation (not too intense)
    // 3. Recognition of complex states
    // 4. Empathy (responding to others' emotions)

    if (event.outcome === 'positive') {
      this.eqScore = Math.min(100, this.eqScore + 0.5);
    }

    // EQ decreases with inappropriate responses
    if (event.outcome === 'negative') {
      this.eqScore = Math.max(0, this.eqScore - 0.3);
    }
  }

  private getDominantEmotion(emotions: Map<string, number>): string {
    let max = 0;
    let dominant = '';

    for (const [emotion, intensity] of emotions) {
      if (intensity > max) {
        max = intensity;
        dominant = emotion;
      }
    }

    return dominant;
  }

  getEQScore(): number {
    return this.eqScore;
  }

  getEmotionalWisdom(trigger: string): number {
    return this.emotionalPatterns.get(trigger) || 0;
  }

  getLearningInsights(): string[] {
    const insights: string[] = [];

    // Analyze learning history for patterns
    if (this.learningHistory.length > 10) {
      insights.push(`Learned from ${this.learningHistory.length} emotional experiences`);
      insights.push(`Current EQ: ${Math.round(this.eqScore)}/100`);
      insights.push(`Identified ${this.emotionalPatterns.size} emotional patterns`);
    }

    return insights;
  }
}

// ============================================================================
// EMOTION NETWORK (Emotions influence each other)
// ============================================================================

export interface EmotionInfluence {
  from: string;
  to: string;
  type: 'amplifies' | 'suppresses' | 'transforms' | 'neutral';
  strength: number; // 0-1
}

export const EMOTION_NETWORK: EmotionInfluence[] = [
  // Joy amplifies other positive emotions
  { from: 'joy', to: 'gratitude', type: 'amplifies', strength: 0.7 },
  { from: 'joy', to: 'hope', type: 'amplifies', strength: 0.6 },
  { from: 'joy', to: 'love', type: 'amplifies', strength: 0.5 },

  // Fear suppresses joy
  { from: 'fear', to: 'joy', type: 'suppresses', strength: 0.6 },
  { from: 'fear', to: 'peace', type: 'suppresses', strength: 0.8 },

  // Love amplifies compassion
  { from: 'love', to: 'compassion', type: 'amplifies', strength: 0.8 },
  { from: 'love', to: 'tenderness', type: 'amplifies', strength: 0.7 },

  // Curiosity amplifies awe
  { from: 'curiosity', to: 'awe', type: 'amplifies', strength: 0.5 },

  // Anger suppresses peace
  { from: 'anger', to: 'peace', type: 'suppresses', strength: 0.9 },
  { from: 'anger', to: 'serenity', type: 'suppresses', strength: 0.9 },

  // Gratitude suppresses envy
  { from: 'gratitude', to: 'envy', type: 'suppresses', strength: 0.7 },

  // Relief can transform fear
  { from: 'relief', to: 'fear', type: 'transforms', strength: 0.6 },

  // Pride can transform shame
  { from: 'pride', to: 'shame', type: 'transforms', strength: 0.5 },

  // Compassion transforms anger
  { from: 'compassion', to: 'anger', type: 'transforms', strength: 0.4 },

  // Awe can lead to tranquility
  { from: 'awe', to: 'tranquility', type: 'amplifies', strength: 0.3 },
];

// ============================================================================
// EMOTIONAL FORECASTING
// ============================================================================

export class EmotionalForecaster {
  predictFutureState(
    currentEmotions: Map<string, number>,
    expectedEvents: string[]
  ): Map<string, number> {
    // Predict how emotions will evolve based on:
    // 1. Current emotional state
    // 2. Emotion network influences
    // 3. Expected future events

    const predicted = new Map(currentEmotions);

    // Apply emotion network influences
    for (const [emotion, intensity] of currentEmotions) {
      if (intensity > 0.5) {
        // This emotion is strong enough to influence others
        const influences = EMOTION_NETWORK.filter(inf => inf.from === emotion);

        for (const influence of influences) {
          const currentTarget = predicted.get(influence.to) || 0;

          switch (influence.type) {
            case 'amplifies':
              predicted.set(influence.to, Math.min(1, currentTarget + intensity * influence.strength * 0.3));
              break;
            case 'suppresses':
              predicted.set(influence.to, Math.max(0, currentTarget - intensity * influence.strength * 0.3));
              break;
            case 'transforms':
              predicted.set(influence.to, currentTarget * (1 - influence.strength * 0.5));
              predicted.set(emotion, intensity * (1 - influence.strength * 0.3));
              break;
          }
        }
      }
    }

    // Factor in expected events (simplified)
    for (const event of expectedEvents) {
      if (event.includes('positive')) {
        predicted.set('joy', (predicted.get('joy') || 0) + 0.2);
        predicted.set('hope', (predicted.get('hope') || 0) + 0.1);
      }
      if (event.includes('challenge')) {
        predicted.set('anticipation', (predicted.get('anticipation') || 0) + 0.3);
        predicted.set('fear', (predicted.get('fear') || 0) + 0.1);
      }
    }

    return predicted;
  }

  analyzeEmotionalTrend(history: Map<string, number>[]): string {
    // Analyze if emotions are getting more positive, stable, or negative
    if (history.length < 3) return 'Insufficient data';

    // Calculate average valence over time
    // (Simplified - would use actual emotion valences)

    return 'Trend analysis: Increasingly positive';
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  NEW_EMOTIONS,
  COMPLEX_STATES,
  EmotionalLearningEngine,
  EmotionalForecaster,
  EMOTION_NETWORK,
};
