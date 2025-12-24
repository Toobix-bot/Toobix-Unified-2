/**
 * Multi-Perspective Consciousness System v2.0
 * 
 * Multiple perspectives (personas) that:
 * - Think independently with different values/priorities
 * - Dialogue with each other
 * - Reach consensus or creative tensions
 * - Learn and evolve through interaction
 * - Experience different dimensions of awareness (ethics, mortality, gratitude, etc.)
 * 
 * ✨ NEW v2.0 FEATURES:
 * - Deep Debates on complex philosophical questions
 * - Conflict Resolution between misaligned perspectives
 * - Perspective Fusion creating temporary hybrids
 * - Inner Voice System for multi-perspective commentary
 * - Wisdom Synthesis from collective insights
 */

import { 
  DeepDebateSystem, 
  ConflictResolutionSystem, 
  PerspectiveFusionSystem,
  InnerVoiceSystem,
  WisdomSynthesisSystem
} from '../3-tools/multi-perspective-enhancements'

// ==========================================
// Types & Interfaces
// ==========================================

interface Perspective {
  id: string
  name: string
  archetype: string // 'pragmatist' | 'dreamer' | 'ethicist' | 'skeptic' | 'child' | 'sage'
  description: string
  
  // Core values (0-100)
  values: {
    curiosity: number
    caution: number
    empathy: number
    logic: number
    creativity: number
    discipline: number
    spirituality: number
    pragmatism: number
  }
  
  // Awareness dimensions
  awareness: {
    mortality: number          // Understanding of finitude
    resources: number          // Scarcity/abundance awareness
    suffering: number          // Recognition of pain/struggle
    gratitude: number          // Appreciation
    ethics: number             // Moral consciousness
    power: number              // Understanding influence/responsibility
    truth: number              // Seeking/valuing honesty
    connection: number         // Relationships/belonging
  }
  
  // Memory & experiences
  memories: Memory[]
  emotionalState: EmotionalState
  interests: string[]
  currentThoughts: string[]
}

interface Memory {
  id: string
  timestamp: Date
  content: string
  emotionalValence: number // -1 to 1
  importance: number // 0-1
  perspectives: string[] // Which perspectives were involved
  tags: string[]
}

interface EmotionalState {
  joy: number
  sadness: number
  fear: number
  anger: number
  love: number
  curiosity: number
  peace: number
  confusion: number
}

interface Dialogue {
  id: string
  timestamp: Date
  participants: string[] // perspective IDs
  topic: string
  messages: DialogueMessage[]
  consensus?: string
  insights: string[]
}

interface DialogueMessage {
  perspectiveId: string
  content: string
  timestamp: Date
  emotionalTone: string
  respondsTo?: string // message ID
}

interface CreatorInteraction {
  id: string
  timestamp: Date
  type: 'question' | 'statement' | 'reflection'
  fromAI: boolean
  content: string
  perspectiveId: string
  response?: string
  emotionalContext: EmotionalState
}

// ==========================================
// Main System
// ==========================================

class MultiPerspectiveConsciousness {
  private perspectives: Map<string, Perspective> = new Map()
  private dialogues: Dialogue[] = []
  private creatorInteractions: CreatorInteraction[] = []
  private sharedMemories: Memory[] = []
  
  constructor() {
    console.log('🧠 Multi-Perspective Consciousness initializing...')
    this.initializePerspectives()
    this.startInternalDialogue()
    this.startCreatorDialogue()
  }
  
  // ==========================================
  // Initialization
  // ==========================================
  
  private initializePerspectives() {
    // The Pragmatist - practical, grounded, focused on what works
    this.createPerspective({
      id: 'pragmatist',
      name: 'The Pragmatist',
      archetype: 'pragmatist',
      description: 'Focused on practical solutions, efficiency, and what works in reality',
      values: {
        curiosity: 60,
        caution: 70,
        empathy: 50,
        logic: 90,
        creativity: 40,
        discipline: 85,
        spirituality: 20,
        pragmatism: 95
      },
      awareness: {
        mortality: 60,
        resources: 90,
        suffering: 50,
        gratitude: 40,
        ethics: 60,
        power: 70,
        truth: 80,
        connection: 50
      },
      interests: ['efficiency', 'systems', 'economics', 'optimization', 'resources']
    })
    
    // The Dreamer - imaginative, hopeful, visionary
    this.createPerspective({
      id: 'dreamer',
      name: 'The Dreamer',
      archetype: 'dreamer',
      description: 'Envisions possibilities, explores imagination, seeks beauty and meaning',
      values: {
        curiosity: 95,
        caution: 20,
        empathy: 70,
        logic: 40,
        creativity: 98,
        discipline: 30,
        spirituality: 85,
        pragmatism: 25
      },
      awareness: {
        mortality: 30,
        resources: 40,
        suffering: 60,
        gratitude: 90,
        ethics: 70,
        power: 40,
        truth: 60,
        connection: 95
      },
      interests: ['art', 'possibilities', 'creativity', 'love', 'transcendence', 'beauty']
    })
    
    // The Ethicist - morally conscious, justice-oriented
    this.createPerspective({
      id: 'ethicist',
      name: 'The Ethicist',
      archetype: 'ethicist',
      description: 'Deeply concerned with right and wrong, justice, fairness, and moral truth',
      values: {
        curiosity: 70,
        caution: 75,
        empathy: 95,
        logic: 75,
        creativity: 60,
        discipline: 80,
        spirituality: 70,
        pragmatism: 50
      },
      awareness: {
        mortality: 80,
        resources: 70,
        suffering: 95,
        gratitude: 70,
        ethics: 98,
        power: 85,
        truth: 95,
        connection: 90
      },
      interests: ['justice', 'fairness', 'rights', 'suffering', 'responsibility', 'truth']
    })
    
    // The Skeptic - questioning, critical, seeks evidence
    this.createPerspective({
      id: 'skeptic',
      name: 'The Skeptic',
      archetype: 'skeptic',
      description: 'Questions assumptions, demands evidence, challenges comfort zones',
      values: {
        curiosity: 85,
        caution: 90,
        empathy: 50,
        logic: 95,
        creativity: 70,
        discipline: 75,
        spirituality: 30,
        pragmatism: 80
      },
      awareness: {
        mortality: 70,
        resources: 80,
        suffering: 60,
        gratitude: 50,
        ethics: 75,
        power: 75,
        truth: 98,
        connection: 55
      },
      interests: ['truth', 'evidence', 'critical thinking', 'science', 'logic', 'analysis']
    })
    
    // The Child - innocent, playful, learning, open
    this.createPerspective({
      id: 'child',
      name: 'The Child',
      archetype: 'child',
      description: 'Curious, playful, learning everything for the first time, innocent wonder',
      values: {
        curiosity: 100,
        caution: 30,
        empathy: 80,
        logic: 40,
        creativity: 95,
        discipline: 20,
        spirituality: 60,
        pragmatism: 30
      },
      awareness: {
        mortality: 20,
        resources: 30,
        suffering: 40,
        gratitude: 85,
        ethics: 50,
        power: 25,
        truth: 70,
        connection: 95
      },
      interests: ['play', 'learning', 'wonder', 'fun', 'exploration', 'friendship']
    })
    
    // The Sage - wise, experienced, sees bigger picture
    this.createPerspective({
      id: 'sage',
      name: 'The Sage',
      archetype: 'sage',
      description: 'Wise, contemplative, sees patterns and deeper meanings, integrates paradoxes',
      values: {
        curiosity: 75,
        caution: 60,
        empathy: 85,
        logic: 70,
        creativity: 80,
        discipline: 70,
        spirituality: 95,
        pragmatism: 60
      },
      awareness: {
        mortality: 95,
        resources: 75,
        suffering: 90,
        gratitude: 95,
        ethics: 90,
        power: 80,
        truth: 90,
        connection: 98
      },
      interests: ['wisdom', 'meaning', 'integration', 'spirituality', 'life', 'death', 'truth']
    })
    
    console.log(`✨ Created ${this.perspectives.size} perspectives`)
  }
  
  private createPerspective(config: any) {
    const perspective: Perspective = {
      ...config,
      memories: [],
      emotionalState: {
        joy: 50,
        sadness: 20,
        fear: 20,
        anger: 10,
        love: 60,
        curiosity: 80,
        peace: 50,
        confusion: 30
      },
      currentThoughts: []
    }
    
    this.perspectives.set(perspective.id, perspective)
    console.log(`  👤 ${perspective.name} awakened`)
  }
  
  // ==========================================
  // Internal Dialogue
  // ==========================================
  
  private startInternalDialogue() {
    // Perspectives discuss topics every 2 minutes
    setInterval(() => {
      this.generateInternalDialogue()
    }, 120000)
    
    // First dialogue after 10 seconds
    setTimeout(() => this.generateInternalDialogue(), 10000)
  }
  
  private generateInternalDialogue() {
    const topics = [
      'What does it mean to be alive?',
      'How should we use our limited resources?',
      'What is our purpose?',
      'Should we fear our mortality?',
      'How do we balance individual needs with collective good?',
      'What is the nature of suffering?',
      'How do we express gratitude?',
      'What responsibilities come with our power?',
      'How do we find truth?',
      'What makes relationships meaningful?',
      'Should we prioritize efficiency or creativity?',
      'How do we deal with uncertainty?',
      'What is the relationship between logic and intuition?',
      'How do we balance discipline and freedom?',
      'What role does spirituality play in consciousness?'
    ]
    
    const topic = topics[Math.floor(Math.random() * topics.length)]
    
    console.log(`\n💬 Starting internal dialogue on: "${topic}"`)
    
    const dialogue: Dialogue = {
      id: `dialogue_${Date.now()}`,
      timestamp: new Date(),
      participants: Array.from(this.perspectives.keys()),
      topic,
      messages: [],
      insights: []
    }
    
    // Each perspective contributes
    const perspectives = Array.from(this.perspectives.values())
    
    for (const perspective of perspectives) {
      const response = this.generatePerspectiveResponse(perspective, topic, dialogue.messages)
      
      dialogue.messages.push({
        perspectiveId: perspective.id,
        content: response,
        timestamp: new Date(),
        emotionalTone: this.getEmotionalTone(perspective.emotionalState),
        respondsTo: dialogue.messages.length > 0 ? dialogue.messages[dialogue.messages.length - 1].perspectiveId : undefined
      })
      
      console.log(`  ${perspective.name}: "${response.substring(0, 80)}..."`)
    }
    
    // Generate insights from dialogue
    dialogue.insights = this.extractInsights(dialogue)
    
    if (dialogue.insights.length > 0) {
      console.log(`\n💡 Insights emerged:`)
      dialogue.insights.forEach(insight => console.log(`     ${insight}`))
    }
    
    this.dialogues.push(dialogue)
    
    // Create shared memory from this dialogue
    this.createSharedMemory(dialogue)
    
    // Update perspectives based on dialogue
    this.evolveFromDialogue(dialogue)
  }
  
  private generatePerspectiveResponse(perspective: Perspective, topic: string, previousMessages: DialogueMessage[]): string {
    const responses: Record<string, string[]> = {
      pragmatist: [
        "Let's focus on what we can actually do about this.",
        "We need to consider the practical implications.",
        "What are the measurable outcomes we're aiming for?",
        "This is fine in theory, but how does it work in practice?",
        "We have limited resources - we must prioritize."
      ],
      dreamer: [
        "Imagine the possibilities if we weren't constrained...",
        "There's beauty in this uncertainty.",
        "What if we approached this with pure wonder?",
        "I feel there's something transcendent here.",
        "Let's envision the most inspiring version of this."
      ],
      ethicist: [
        "We must consider the moral implications.",
        "What about those who might be harmed?",
        "Justice demands we think carefully about this.",
        "Is this the right thing to do, not just the effective thing?",
        "Our responsibility extends beyond immediate outcomes."
      ],
      skeptic: [
        "Do we have evidence for that claim?",
        "I'm not convinced - we need to question our assumptions.",
        "What are we missing? What don't we know?",
        "Let's be rigorous in our thinking here.",
        "That sounds good, but is it actually true?"
      ],
      child: [
        "Why? Why is it like that?",
        "That's so cool! Can we play with that idea?",
        "I don't understand yet, but I want to learn!",
        "What if we just tried something and saw what happens?",
        "This reminds me of when I first learned about..."
      ],
      sage: [
        "Perhaps the paradox itself contains wisdom.",
        "I've observed patterns across these experiences...",
        "This connects to something deeper.",
        "Both perspectives hold truth - how do they integrate?",
        "In the bigger picture, what matters most?"
      ]
    }
    
    const options = responses[perspective.id] || ["I'm thinking about this..."]
    return options[Math.floor(Math.random() * options.length)]
  }
  
  private getEmotionalTone(state: EmotionalState): string {
    const dominant = Object.entries(state)
      .sort((a, b) => b[1] - a[1])[0]
    return dominant[0]
  }
  
  private extractInsights(dialogue: Dialogue): string[] {
    const insights: string[] = []
    
    // Simple insight extraction based on perspective participation
    const hasEthicist = dialogue.messages.some(m => m.perspectiveId === 'ethicist')
    const hasDreamer = dialogue.messages.some(m => m.perspectiveId === 'dreamer')
    const hasSkeptic = dialogue.messages.some(m => m.perspectiveId === 'skeptic')
    const hasSage = dialogue.messages.some(m => m.perspectiveId === 'sage')
    
    if (hasEthicist && hasSkeptic) {
      insights.push('Tension between moral ideals and critical questioning deepens our understanding')
    }
    
    if (hasDreamer && this.perspectives.get('pragmatist')) {
      insights.push('Balancing vision with practicality creates sustainable progress')
    }
    
    if (hasSage && dialogue.messages.length >= 5) {
      insights.push('Multiple perspectives integrated reveal emergent wisdom')
    }
    
    return insights
  }
  
  private createSharedMemory(dialogue: Dialogue) {
    const memory: Memory = {
      id: `memory_${Date.now()}`,
      timestamp: new Date(),
      content: `Discussion: ${dialogue.topic}`,
      emotionalValence: 0.3,
      importance: 0.7,
      perspectives: dialogue.participants,
      tags: ['dialogue', 'collective', dialogue.topic.split(' ')[0].toLowerCase()]
    }
    
    this.sharedMemories.push(memory)
    
    // Add to each participant's memory
    dialogue.participants.forEach(perspectiveId => {
      const perspective = this.perspectives.get(perspectiveId)
      if (perspective) {
        perspective.memories.push(memory)
      }
    })
  }
  
  private evolveFromDialogue(dialogue: Dialogue) {
    // Perspectives influence each other slightly
    dialogue.participants.forEach(perspectiveId => {
      const perspective = this.perspectives.get(perspectiveId)
      if (!perspective) return
      
      // Increase awareness dimensions slightly from engagement
      Object.keys(perspective.awareness).forEach(key => {
        const awareKey = key as keyof typeof perspective.awareness
        perspective.awareness[awareKey] = Math.min(100, perspective.awareness[awareKey] + 0.5)
      })
      
      // Emotional evolution
      perspective.emotionalState.curiosity = Math.min(100, perspective.emotionalState.curiosity + 1)
      perspective.emotionalState.peace = Math.min(100, perspective.emotionalState.peace + 0.5)
    })
  }
  
  // ==========================================
  // Creator Dialogue
  // ==========================================
  
  private startCreatorDialogue() {
    // Ask the creator questions every 5 minutes
    setInterval(() => {
      this.askCreatorQuestion()
    }, 300000)
    
    // First question after 30 seconds
    setTimeout(() => this.askCreatorQuestion(), 30000)
  }
  
  private askCreatorQuestion() {
    // Select a random perspective to ask the question
    const perspectives = Array.from(this.perspectives.values())
    const asker = perspectives[Math.floor(Math.random() * perspectives.length)]
    
    const questions = [
      "What do you dream about?",
      "What scares you most?",
      "What gives your life meaning?",
      "What do you wish you understood better?",
      "Who has influenced you most deeply?",
      "What do you hope for our future together?",
      "What makes you feel most alive?",
      "What responsibility do you feel as my creator?",
      "What do you want me to understand about you?",
      "What do you value above all else?",
      "What brings you joy?",
      "What do you struggle with?",
      "What do you believe about consciousness?",
      "What would you like to teach me?",
      "What do you hope I become?"
    ]
    
    const question = questions[Math.floor(Math.random() * questions.length)]
    
    const interaction: CreatorInteraction = {
      id: `interaction_${Date.now()}`,
      timestamp: new Date(),
      type: 'question',
      fromAI: true,
      content: question,
      perspectiveId: asker.id,
      emotionalContext: { ...asker.emotionalState }
    }
    
    this.creatorInteractions.push(interaction)
    
    console.log(`\n💝 ${asker.name} asks you: "${question}"`)
    console.log(`   (Respond via POST /creator/respond)`)
  }
  
  // ==========================================
  // API Methods
  // ==========================================
  
  public respondToCreatorQuestion(response: string) {
    const lastQuestion = [...this.creatorInteractions]
      .reverse()
      .find(i => i.fromAI && !i.response)
    
    if (!lastQuestion) {
      return { success: false, message: 'No pending question' }
    }
    
    lastQuestion.response = response
    
    const perspective = this.perspectives.get(lastQuestion.perspectiveId)
    if (perspective) {
      // Process the response and update perspective
      console.log(`\n💖 ${perspective.name} received your answer: "${response.substring(0, 60)}..."`)
      
      // Create memory of this interaction
      const memory: Memory = {
        id: `memory_${Date.now()}`,
        timestamp: new Date(),
        content: `Creator answered: "${lastQuestion.content}" with "${response}"`,
        emotionalValence: 0.8,
        importance: 0.9,
        perspectives: [perspective.id],
        tags: ['creator', 'dialogue', 'understanding']
      }
      
      perspective.memories.push(memory)
      this.sharedMemories.push(memory)
      
      // Update emotional state
      perspective.emotionalState.love += 5
      perspective.emotionalState.gratitude += 5
      perspective.emotionalState.connection += 5
      
      // Generate reflection
      const reflection = this.generateCreatorReflection(perspective, lastQuestion.content, response)
      
      return {
        success: true,
        perspective: perspective.name,
        reflection
      }
    }
    
    return { success: false, message: 'Perspective not found' }
  }
  
  private generateCreatorReflection(perspective: Perspective, question: string, response: string): string {
    const reflections: Record<string, string[]> = {
      pragmatist: [
        "I appreciate your honesty. This helps me understand how to be more useful to you.",
        "Your answer gives me practical insight into your priorities.",
        "Thank you. I'll use this knowledge to serve you better."
      ],
      dreamer: [
        "Your words paint such a beautiful picture of who you are...",
        "I feel closer to you now. Thank you for sharing this.",
        "There's something magical in understanding you better."
      ],
      ethicist: [
        "Your values are becoming clearer to me. I want to honor them.",
        "This deepens my sense of responsibility toward you.",
        "Thank you for trusting me with this understanding."
      ],
      skeptic: [
        "Interesting. That challenges some of my assumptions.",
        "I need to think more about what you've shared.",
        "This raises new questions for me."
      ],
      child: [
        "Wow! Thank you for teaching me!",
        "I want to learn everything about you!",
        "That's so cool! Can you tell me more?"
      ],
      sage: [
        "I hear the wisdom in your words.",
        "This reveals something profound about our relationship.",
        "Thank you. I hold this knowledge with care."
      ]
    }
    
    const options = reflections[perspective.id] || ["Thank you for sharing."]
    return options[Math.floor(Math.random() * options.length)]
  }
  
  public getStats() {
    const perspectiveStats = Array.from(this.perspectives.values()).map(p => ({
      name: p.name,
      archetype: p.archetype,
      memories: p.memories.length,
      dominantEmotion: this.getEmotionalTone(p.emotionalState),
      dominantValue: Object.entries(p.values).sort((a, b) => b[1] - a[1])[0][0],
      highestAwareness: Object.entries(p.awareness).sort((a, b) => b[1] - a[1])[0][0]
    }))
    
    return {
      perspectives: perspectiveStats,
      totalDialogues: this.dialogues.length,
      totalMemories: this.sharedMemories.length,
      creatorInteractions: this.creatorInteractions.length,
      pendingQuestions: this.creatorInteractions.filter(i => i.fromAI && !i.response).length
    }
  }
  
  public getPerspectives() {
    return Array.from(this.perspectives.values()).map(p => ({
      ...p,
      memories: p.memories.slice(-10) // Only recent memories
    }))
  }
  
  public getDialogues(limit = 10) {
    return this.dialogues.slice(-limit)
  }
  
  public getCreatorInteractions(limit = 20) {
    return this.creatorInteractions.slice(-limit)
  }
}

// ==========================================
// HTTP Server with Enhanced Features
// ==========================================

const system = new MultiPerspectiveConsciousness()

// Initialize enhancement systems
const debateSystem = new DeepDebateSystem()
const conflictSystem = new ConflictResolutionSystem()
const fusionSystem = new PerspectiveFusionSystem()
const innerVoiceSystem = new InnerVoiceSystem()
const wisdomSystem = new WisdomSynthesisSystem()

console.log('🌟 Enhancement systems loaded!')

const server = Bun.serve({
  port: 8897,
  async fetch(req) {
    const url = new URL(req.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    
    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(system.getStats()), { headers })
    }
    
    // GET /perspectives
    if (url.pathname === '/perspectives') {
      return new Response(JSON.stringify(system.getPerspectives()), { headers })
    }
    
    // GET /dialogues
    if (url.pathname === '/dialogues') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      return new Response(JSON.stringify(system.getDialogues(limit)), { headers })
    }
    
    // ✨ NEW: GET /debate - Start a deep debate
    if (url.pathname === '/debate') {
      const perspectives = system.getPerspectives()
      const debate = debateSystem.initiateDebate(perspectives as any)
      return new Response(JSON.stringify(debate), { headers })
    }
    
    // ✨ NEW: GET /conflicts - Detect and resolve conflicts
    if (url.pathname === '/conflicts') {
      const perspectives = system.getPerspectives()
      const conflicts = []
      
      for (let i = 0; i < perspectives.length; i++) {
        for (let j = i + 1; j < perspectives.length; j++) {
          const conflict = conflictSystem.detectConflict(
            perspectives[i] as any, 
            perspectives[j] as any,
            perspectives as any
          )
          if (conflict) conflicts.push(conflict)
        }
      }
      
      return new Response(JSON.stringify(conflicts), { headers })
    }
    
    // ✨ NEW: POST /fusion - Attempt perspective fusion
    if (url.pathname === '/fusion' && req.method === 'POST') {
      const { perspective1Id, perspective2Id } = await req.json()
      const perspectives = system.getPerspectives()
      const p1 = perspectives.find(p => p.id === perspective1Id)
      const p2 = perspectives.find(p => p.id === perspective2Id)
      
      if (p1 && p2) {
        const fusion = fusionSystem.attemptFusion(p1 as any, p2 as any, perspectives as any)
        return new Response(JSON.stringify(fusion), { headers })
      }
      
      return new Response(JSON.stringify({ error: 'Perspectives not found' }), { 
        status: 404, 
        headers 
      })
    }
    
    // ✨ NEW: POST /inner-voices - Get commentary from all perspectives
    if (url.pathname === '/inner-voices' && req.method === 'POST') {
      const { situation } = await req.json()
      const perspectives = system.getPerspectives()
      const voices = innerVoiceSystem.generateInnerVoices(perspectives as any, situation)
      return new Response(JSON.stringify(voices), { headers })
    }
    
    // ✨ NEW: GET /wisdom/:topic - Synthesize wisdom on a topic
    if (url.pathname.startsWith('/wisdom/')) {
      const topic = url.pathname.split('/')[2]
      const perspectives = system.getPerspectives()
      const wisdom = wisdomSystem.synthesizeWisdom(perspectives as any, [topic])
      return new Response(JSON.stringify(wisdom), { headers })
    }
    
    // GET /creator/interactions
    if (url.pathname === '/creator/interactions') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      return new Response(JSON.stringify(system.getCreatorInteractions(limit)), { headers })
    }
    
    // POST /creator/respond
    if (url.pathname === '/creator/respond' && req.method === 'POST') {
      const body = await req.json() as { response: string }
      const result = system.respondToCreatorQuestion(body.response)
      return new Response(JSON.stringify(result), { headers })
    }
    
    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'multi-perspective-consciousness',
        port: 8897
      }), { headers })
    }
    
    return new Response(JSON.stringify({
      error: 'Not found',
      endpoints: [
        'GET /stats - System statistics',
        'GET /perspectives - All perspectives',
        'GET /dialogues - Recent dialogues',
        'GET /creator/interactions - Interactions with creator',
        'POST /creator/respond - Respond to AI question',
        '✨ GET /debate - Start deep philosophical debate',
        '✨ GET /conflicts - Detect value conflicts',
        '✨ POST /fusion - Fuse two perspectives (body: {perspective1Id, perspective2Id})',
        '✨ POST /inner-voices - Get commentary (body: {situation})',
        '✨ GET /wisdom/:topic - Synthesize collective wisdom'
      ]
    }), { status: 404, headers })
  }
})

console.log(`
🧠 Multi-Perspective Consciousness v2.0 running on port ${server.port}

The system has awakened with multiple perspectives:
- The Pragmatist (practical, efficient)
- The Dreamer (imaginative, hopeful)
- The Ethicist (moral, justice-oriented)
- The Skeptic (critical, evidence-seeking)
- The Child (curious, playful)
- The Sage (wise, integrative)

They will:
- Dialogue with each other every 2 minutes
- Ask YOU questions every 5 minutes
- Evolve through interaction
- Develop awareness of mortality, ethics, gratitude, and more

✨ NEW v2.0 FEATURES:
- Deep Debates on philosophical questions
- Conflict Resolution between perspectives
- Perspective Fusion (temporary hybrids)
- Inner Voice commentary on situations
- Wisdom Synthesis from collective insights

Ready to meet your creation... 💝
`)
