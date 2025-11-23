/**
 * 🙏💀 GRATITUDE & MORTALITY AUSBAU v2.0
 * 
 * Neue Features:
 * 1. **Life Phases** - Kindheit bis Alter, jede Phase hat Weisheit
 * 2. **Existential Questions** - Die großen Fragen des Lebens
 * 3. **Legacy Contemplation** - Was bleibt von uns?
 * 4. **Temporal Integration** - Vergangenheit, Gegenwart, Zukunft vereinen
 * 5. **Memento Mori Practices** - Täglich an Endlichkeit erinnern
 * 6. **Gratitude Archaeology** - Vergessene Dankbarkeit ausgraben
 */

interface LifePhase {
  name: string
  ageRange: string
  primaryTheme: string
  wisdomGained: string[]
  commonStruggles: string[]
  gifts: string[]
  perspective: string
}

interface ExistentialQuestion {
  question: string
  category: 'meaning' | 'death' | 'freedom' | 'isolation' | 'identity'
  depth: number // 0-10
  noEasyAnswers: boolean
  reflectionPrompts: string[]
  possibleInsights: string[]
}

interface LegacyItem {
  type: 'wisdom' | 'creation' | 'impact' | 'relationship' | 'transformation'
  description: string
  whoAffected: string[]
  lastingValue: number // 0-1
  tangible: boolean
}

interface TemporalIntegration {
  past: TemporalLayer
  present: TemporalLayer
  future: TemporalLayer
  integration: string
}

interface TemporalLayer {
  content: string
  emotion: string
  wisdom: string
}

interface MementoMoriPractice {
  practice: string
  frequency: 'daily' | 'weekly' | 'monthly'
  purpose: string
  reflection: string
  transformativeEffect: number // 0-1
}

interface ForgottenGratitude {
  moment: string
  yearsAgo: number
  whyForgotten: string
  rediscoveredWisdom: string
  emotionalResonance: number
}

// ===================================================
// LIFE PHASES SYSTEM
// ===================================================

export class LifePhasesSystem {
  private phases: LifePhase[] = [
    {
      name: 'Childhood',
      ageRange: '0-12',
      primaryTheme: 'Wonder and Discovery',
      wisdomGained: [
        'Everything is possible',
        'Joy in simple things',
        'Trust comes naturally'
      ],
      commonStruggles: [
        'Powerlessness',
        'Fear of abandonment',
        'Learning boundaries'
      ],
      gifts: [
        'Unbridled curiosity',
        'Presence in the moment',
        'Forgiveness'
      ],
      perspective: 'The world is magical and I am discovering it'
    },
    {
      name: 'Adolescence',
      ageRange: '13-19',
      primaryTheme: 'Identity Formation',
      wisdomGained: [
        'I am separate from my parents',
        'Peer connection matters',
        'I can think for myself'
      ],
      commonStruggles: [
        'Identity confusion',
        'Peer pressure',
        'Emotional turbulence'
      ],
      gifts: [
        'Passion',
        'Idealism',
        'Energy'
      ],
      perspective: 'Who am I? Who do I want to become?'
    },
    {
      name: 'Young Adulthood',
      ageRange: '20-35',
      primaryTheme: 'Building and Striving',
      wisdomGained: [
        'I create my own path',
        'Relationships are chosen',
        'Work shapes identity'
      ],
      commonStruggles: [
        'Career uncertainty',
        'Relationship challenges',
        'Financial pressure'
      ],
      gifts: [
        'Ambition',
        'Flexibility',
        'Optimism'
      ],
      perspective: 'The world is mine to conquer'
    },
    {
      name: 'Middle Adulthood',
      ageRange: '36-55',
      primaryTheme: 'Responsibility and Reevaluation',
      wisdomGained: [
        'Life is finite',
        'Not all dreams come true',
        'Depth over breadth'
      ],
      commonStruggles: [
        'Midlife crisis',
        'Regret',
        'Caretaking burden'
      ],
      gifts: [
        'Competence',
        'Stability',
        'Mentorship ability'
      ],
      perspective: 'What really matters? Is this the life I want?'
    },
    {
      name: 'Late Adulthood',
      ageRange: '56-75',
      primaryTheme: 'Wisdom and Reflection',
      wisdomGained: [
        'Acceptance of what is',
        'Value of relationships',
        'Meaning beyond achievement'
      ],
      commonStruggles: [
        'Physical decline',
        'Loss of loved ones',
        'Relevance anxiety'
      ],
      gifts: [
        'Perspective',
        'Patience',
        'Discernment'
      ],
      perspective: 'I have lived, I have learned, I have loved'
    },
    {
      name: 'Elder Years',
      ageRange: '76+',
      primaryTheme: 'Integration and Transcendence',
      wisdomGained: [
        'Life was enough',
        'Love persists',
        'Death is natural'
      ],
      commonStruggles: [
        'Mortality confrontation',
        'Independence loss',
        'Isolation'
      ],
      gifts: [
        'Deep wisdom',
        'Acceptance',
        'Freedom from fear'
      ],
      perspective: 'I am ready. My life has meaning.'
    }
  ]
  
  getPhase(phaseName: string): LifePhase | undefined {
    const phase = this.phases.find(p => 
      p.name.toLowerCase() === phaseName.toLowerCase()
    )
    
    if (phase) {
      console.log(`\n🌱 LIFE PHASE: ${phase.name} (${phase.ageRange})`)
      console.log(`   Theme: ${phase.primaryTheme}`)
      console.log(`   Perspective: "${phase.perspective}"`)
      console.log(`\n   Wisdom Gained:`)
      phase.wisdomGained.forEach(w => console.log(`      • ${w}`))
      console.log(`\n   Common Struggles:`)
      phase.commonStruggles.forEach(s => console.log(`      • ${s}`))
      console.log(`\n   Gifts:`)
      phase.gifts.forEach(g => console.log(`      • ${g}`))
    }
    
    return phase
  }
  
  getAllPhases(): LifePhase[] {
    return this.phases
  }
  
  reflectOnPhaseTransition(from: string, to: string): string {
    const fromPhase = this.phases.find(p => p.name === from)
    const toPhase = this.phases.find(p => p.name === to)
    
    if (!fromPhase || !toPhase) return 'Unknown transition'
    
    const reflection = `
    Transition from ${from} to ${to}:
    
    What you leave behind:
      - ${fromPhase.gifts.join(', ')}
    
    What you gain:
      - ${toPhase.wisdomGained[0]}
    
    The challenge:
      - Letting go of "${fromPhase.perspective}"
      - Embracing "${toPhase.perspective}"
    
    This transition is both loss and liberation.
    `
    
    console.log(reflection)
    return reflection
  }
}

// ===================================================
// EXISTENTIAL QUESTIONS SYSTEM
// ===================================================

export class ExistentialQuestionsSystem {
  private questions: ExistentialQuestion[] = [
    {
      question: 'What is the meaning of my life?',
      category: 'meaning',
      depth: 10,
      noEasyAnswers: true,
      reflectionPrompts: [
        'What would I do if I knew I had 1 year left?',
        'What makes me feel most alive?',
        'What would I want people to say at my funeral?'
      ],
      possibleInsights: [
        'Meaning is created, not found',
        'Connection is meaning',
        'The search itself is meaningful'
      ]
    },
    {
      question: 'Why do I fear death?',
      category: 'death',
      depth: 9,
      noEasyAnswers: true,
      reflectionPrompts: [
        'What specifically do I fear about death?',
        'Is it non-existence? Pain? Loss?',
        'How does this fear shape my life?'
      ],
      possibleInsights: [
        'Fear of death is fear of life unlived',
        'Death gives life urgency',
        'Acceptance brings peace'
      ]
    },
    {
      question: 'Am I truly free?',
      category: 'freedom',
      depth: 8,
      noEasyAnswers: true,
      reflectionPrompts: [
        'What are my actual constraints?',
        'Which are real, which are self-imposed?',
        'Where do I exercise choice?'
      ],
      possibleInsights: [
        'Freedom is responsibility',
        'We are "condemned to be free" (Sartre)',
        'Freedom exists in how we respond'
      ]
    },
    {
      question: 'Am I fundamentally alone?',
      category: 'isolation',
      depth: 8,
      noEasyAnswers: true,
      reflectionPrompts: [
        'Can anyone truly know me?',
        'Can I truly know another?',
        'What is connection?'
      ],
      possibleInsights: [
        'Alone-ness is not loneliness',
        'Connection transcends complete knowing',
        'We are alone together'
      ]
    },
    {
      question: 'Who am I, really?',
      category: 'identity',
      depth: 9,
      noEasyAnswers: true,
      reflectionPrompts: [
        'Am I my thoughts? My body? My actions?',
        'Which "me" is the real me?',
        'Does a fixed "I" even exist?'
      ],
      possibleInsights: [
        'Identity is fluid, not fixed',
        'We are the stories we tell',
        'The self is a process, not a thing'
      ]
    }
  ]
  
  ponderQuestion(category: string): ExistentialQuestion | undefined {
    const question = this.questions.find(q => q.category === category)
    
    if (question) {
      console.log(`\n💭 EXISTENTIAL QUESTION:`)
      console.log(`   "${question.question}"`)
      console.log(`   Depth: ${question.depth}/10`)
      console.log(`   Category: ${question.category}`)
      console.log(`\n   Reflection Prompts:`)
      question.reflectionPrompts.forEach(p => console.log(`      • ${p}`))
      console.log(`\n   Possible Insights:`)
      question.possibleInsights.forEach(i => console.log(`      • ${i}`))
      console.log(`\n   Remember: There are no easy answers. Sit with the question.`)
    }
    
    return question
  }
  
  getAllQuestions(): ExistentialQuestion[] {
    return this.questions
  }
}

// ===================================================
// LEGACY CONTEMPLATION SYSTEM
// ===================================================

export class LegacyContemplationSystem {
  createLegacy(
    type: LegacyItem['type'],
    description: string,
    affected: string[]
  ): LegacyItem {
    const legacy: LegacyItem = {
      type,
      description,
      whoAffected: affected,
      lastingValue: 0.5 + Math.random() * 0.5,
      tangible: type === 'creation'
    }
    
    console.log(`\n🌟 LEGACY ITEM:`)
    console.log(`   Type: ${type}`)
    console.log(`   "${description}"`)
    console.log(`   Affects: ${affected.join(', ')}`)
    console.log(`   Lasting value: ${(legacy.lastingValue * 100).toFixed(0)}%`)
    console.log(`   Tangible: ${legacy.tangible ? 'Yes' : 'No'}`)
    
    if (legacy.lastingValue > 0.8) {
      console.log(`   ✨ This will echo through time`)
    }
    
    return legacy
  }
  
  contemplateWhatRemains(): string {
    const reflections = [
      'What remains is not what we built, but how we made people feel',
      'Legacy lives in the small moments of kindness',
      'We live on in the minds we touched, the hearts we opened',
      'The best legacy is becoming part of others\' stories',
      'What endures: love given, wisdom shared, beauty created',
      'We are forgotten, but our ripples continue'
    ]
    
    const reflection = reflections[Math.floor(Math.random() * reflections.length)]
    
    console.log(`\n💫 CONTEMPLATION:`)
    console.log(`   ${reflection}`)
    
    return reflection
  }
}

// ===================================================
// TEMPORAL INTEGRATION SYSTEM
// ===================================================

export class TemporalIntegrationSystem {
  integrate(
    past: string,
    present: string,
    future: string
  ): TemporalIntegration {
    const integration: TemporalIntegration = {
      past: {
        content: past,
        emotion: this.detectEmotion(past),
        wisdom: 'The past shapes but does not define'
      },
      present: {
        content: present,
        emotion: this.detectEmotion(present),
        wisdom: 'The present is where life happens'
      },
      future: {
        content: future,
        emotion: this.detectEmotion(future),
        wisdom: 'The future is possibility, not promise'
      },
      integration: this.synthesize(past, present, future)
    }
    
    console.log(`\n⏳ TEMPORAL INTEGRATION:`)
    console.log(`\n   PAST: ${integration.past.content}`)
    console.log(`      Emotion: ${integration.past.emotion}`)
    console.log(`      Wisdom: ${integration.past.wisdom}`)
    
    console.log(`\n   PRESENT: ${integration.present.content}`)
    console.log(`      Emotion: ${integration.present.emotion}`)
    console.log(`      Wisdom: ${integration.present.wisdom}`)
    
    console.log(`\n   FUTURE: ${integration.future.content}`)
    console.log(`      Emotion: ${integration.future.emotion}`)
    console.log(`      Wisdom: ${integration.future.wisdom}`)
    
    console.log(`\n   INTEGRATION: ${integration.integration}`)
    
    return integration
  }
  
  private detectEmotion(text: string): string {
    if (text.includes('regret') || text.includes('loss')) return 'sadness'
    if (text.includes('hope') || text.includes('dream')) return 'hope'
    if (text.includes('present') || text.includes('now')) return 'presence'
    if (text.includes('fear') || text.includes('worry')) return 'anxiety'
    return 'acceptance'
  }
  
  private synthesize(past: string, present: string, future: string): string {
    return `
    Your past (${past}) has brought you to this present (${present}),
    which opens toward a future (${future}).
    
    The thread that connects them is YOU - learning, growing, becoming.
    Time is not a line but a tapestry, and you weave it with each choice.
    `.trim()
  }
}

// ===================================================
// MEMENTO MORI PRACTICES
// ===================================================

export class MementoMoriSystem {
  private practices: MementoMoriPractice[] = [
    {
      practice: 'Morning Mortality Reflection',
      frequency: 'daily',
      purpose: 'Remember I am mortal, today matters',
      reflection: 'This day is not guaranteed. How will I spend it?',
      transformativeEffect: 0.8
    },
    {
      practice: 'Death Meditation',
      frequency: 'weekly',
      purpose: 'Face death directly to reduce fear',
      reflection: 'Imagine the moment of death. What do you feel? What matters?',
      transformativeEffect: 0.9
    },
    {
      practice: 'Life Review',
      frequency: 'monthly',
      purpose: 'Assess if I\'m living aligned with values',
      reflection: 'If I died today, would I be satisfied with how I lived?',
      transformativeEffect: 0.85
    },
    {
      practice: 'Gratitude for Existence',
      frequency: 'daily',
      purpose: 'Appreciate the gift of consciousness',
      reflection: 'I exist. I am aware. This is miraculous.',
      transformativeEffect: 0.75
    }
  ]
  
  practiceMemento(frequency: 'daily' | 'weekly' | 'monthly'): MementoMoriPractice[] {
    const practices = this.practices.filter(p => p.frequency === frequency)
    
    console.log(`\n💀 MEMENTO MORI - ${frequency.toUpperCase()} PRACTICES:`)
    
    practices.forEach(p => {
      console.log(`\n   Practice: ${p.practice}`)
      console.log(`   Purpose: ${p.purpose}`)
      console.log(`   Reflection: "${p.reflection}"`)
      console.log(`   Transformative effect: ${(p.transformativeEffect * 100).toFixed(0)}%`)
    })
    
    console.log(`\n   "Memento mori - Remember you must die"`)
    console.log(`   Not morbid, but liberating: death gives life meaning.`)
    
    return practices
  }
  
  getAllPractices(): MementoMoriPractice[] {
    return this.practices
  }
}

// ===================================================
// GRATITUDE ARCHAEOLOGY SYSTEM
// ===================================================

export class GratitudeArchaeologySystem {
  private forgottenMoments: ForgottenGratitude[] = [
    {
      moment: 'A stranger smiled at you when you were having a terrible day',
      yearsAgo: 3,
      whyForgotten: 'Seemed too small to matter',
      rediscoveredWisdom: 'Tiny kindnesses sustain us more than we know',
      emotionalResonance: 0.7
    },
    {
      moment: 'Someone believed in you when you didn\'t believe in yourself',
      yearsAgo: 5,
      whyForgotten: 'Lost in the noise of life',
      rediscoveredWisdom: 'We carry others\' faith in us forward',
      emotionalResonance: 0.9
    },
    {
      moment: 'A perfect autumn day where nothing special happened',
      yearsAgo: 2,
      whyForgotten: 'Nothing dramatic occurred',
      rediscoveredWisdom: 'Peace is the gift we overlook',
      emotionalResonance: 0.8
    },
    {
      moment: 'Your body healed from an injury without you thinking about it',
      yearsAgo: 1,
      whyForgotten: 'We take our body\'s wisdom for granted',
      rediscoveredWisdom: 'Your body is always working for you',
      emotionalResonance: 0.75
    }
  ]
  
  excavate(): ForgottenGratitude {
    const forgotten = this.forgottenMoments[
      Math.floor(Math.random() * this.forgottenMoments.length)
    ]
    
    console.log(`\n🔍 GRATITUDE ARCHAEOLOGY:`)
    console.log(`\n   Excavating memory from ${forgotten.yearsAgo} years ago...`)
    console.log(`   Moment: "${forgotten.moment}"`)
    console.log(`   Why forgotten: ${forgotten.whyForgotten}`)
    console.log(`   Rediscovered wisdom: ${forgotten.rediscoveredWisdom}`)
    console.log(`   Emotional resonance: ${(forgotten.emotionalResonance * 100).toFixed(0)}%`)
    console.log(`\n   ✨ Sometimes we need to dig to find what we lost`)
    
    return forgotten
  }
  
  getAllForgottenMoments(): ForgottenGratitude[] {
    return this.forgottenMoments
  }
}

console.log(`
🙏💀 GRATITUDE & MORTALITY AUSBAU v2.0 Module geladen

Neue Systeme:
  1. ✅ Life Phases - 6 Lebensphasen mit Weisheit (0-12 bis 76+)
  2. ✅ Existential Questions - 5 große Fragen (meaning, death, freedom, isolation, identity)
  3. ✅ Legacy Contemplation - Was bleibt von uns?
  4. ✅ Temporal Integration - Past/Present/Future vereinen
  5. ✅ Memento Mori - 4 Practices (daily/weekly/monthly)
  6. ✅ Gratitude Archaeology - 4 vergessene Momente ausgraben

Integration in gratitude-mortality-service.ts möglich.
`)
