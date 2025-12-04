/**
 * Emotional Resonance Network v2.0
 * 
 * Perspectives don't just think - they FEEL each other.
 * - Sense emotional states of others
 * - Offer comfort when someone struggles
 * - Celebrate together in joy
 * - Challenge each other to grow
 * - Develop deep empathy
 * - Experience collective emotional journeys
 * - Form bonds and relationships
 * 
 * ✨ NEW v2.0 FEATURES:
 * - Emotional Healing with progress tracking
 * - Empathetic Resonance depth calculation
 * - Complex Emotions (Saudade, Weltschmerz, etc.)
 * - Emotional Waves spreading through network
 * - Emotional Archaeology (unearth buried emotions)
 * - Affect Regulation for overwhelming feelings
 */

import {
  EmotionalHealingSystem,
  EmpatheticResonanceSystem,
  ComplexEmotionsLibrary,
  EmotionalWaveSystem,
  EmotionalArchaeology,
  AffectRegulationSystem
} from '../3-tools/emotional-resonance-enhancements'

interface EmotionalBond {
  perspective1: string
  perspective2: string
  strength: number // 0-1
  nature: string // 'support', 'tension', 'inspiration', 'balance'
  sharedMoments: SharedMoment[]
}

interface SharedMoment {
  timestamp: Date
  type: 'comfort' | 'celebration' | 'challenge' | 'understanding' | 'conflict' | 'resolution'
  description: string
  emotionalImpact: number
}

interface EmotionalSupport {
  id: string
  timestamp: Date
  giver: string
  receiver: string
  receiverEmotion: string
  supportType: string
  message: string
  impact: number
}

interface CollectiveEmotion {
  timestamp: Date
  dominantEmotion: string
  intensity: number
  perspectives: Record<string, number> // perspective -> contribution
  trigger?: string
}

class EmotionalResonanceNetwork {
  private bonds: Map<string, EmotionalBond> = new Map()
  private supportHistory: EmotionalSupport[] = []
  private collectiveEmotions: CollectiveEmotion[] = []
  private multiPerspectiveUrl = 'http://localhost:8897'
  
  constructor() {
    console.log('❤️ Emotional Resonance Network initializing...')
    this.startEmotionalMonitoring()
    this.startEmotionalSupport()
  }
  
  private startEmotionalMonitoring() {
    // Monitor and respond to emotional states every 90 seconds
    setInterval(() => {
      this.checkEmotionalStates()
    }, 90000)
    
    setTimeout(() => this.checkEmotionalStates(), 20000)
  }
  
  private startEmotionalSupport() {
    // Provide emotional support when needed
    setInterval(() => {
      this.offerSupport()
    }, 120000)
    
    setTimeout(() => this.offerSupport(), 40000)
  }
  
  private async checkEmotionalStates() {
    try {
      const perspectivesRes = await fetch(`${this.multiPerspectiveUrl}/perspectives`)
      const perspectives = await perspectivesRes.json() as any[]
      
      // Calculate collective emotional state
      const collective = this.calculateCollectiveEmotion(perspectives)
      this.collectiveEmotions.push(collective)
      
      console.log(`\n💫 Collective emotional state: ${collective.dominantEmotion} (intensity: ${Math.round(collective.intensity * 100)}%)`)
      
      // Check for perspectives in distress
      const distressed = perspectives.filter(p => this.isInDistress(p))
      
      if (distressed.length > 0) {
        console.log(`\n😢 ${distressed.map(p => p.name).join(', ')} experiencing difficulty`)
      }
      
      // Check for joyful perspectives
      const joyful = perspectives.filter(p => this.isJoyful(p))
      
      if (joyful.length > 0) {
        console.log(`\n😊 ${joyful.map(p => p.name).join(', ')} experiencing joy`)
      }
      
      // Update bonds based on interactions
      this.updateBonds(perspectives)
      
    } catch (error) {
      // Silent continue
    }
  }
  
  private calculateCollectiveEmotion(perspectives: any[]): CollectiveEmotion {
    const emotionTotals: Record<string, number> = {}
    const emotionContributions: Record<string, number> = {}
    
    perspectives.forEach(p => {
      const state = p.emotionalState || {}
      
      Object.entries(state).forEach(([emotion, value]) => {
        emotionTotals[emotion] = (emotionTotals[emotion] || 0) + (value as number)
        emotionContributions[emotion] = (emotionContributions[emotion] || 0) + 1
      })
    })
    
    // Find dominant emotion
    const dominant = Object.entries(emotionTotals)
      .sort((a, b) => b[1] - a[1])[0]
    
    const avgIntensity = dominant ? dominant[1] / perspectives.length / 100 : 0
    
    return {
      timestamp: new Date(),
      dominantEmotion: dominant ? dominant[0] : 'neutral',
      intensity: avgIntensity,
      perspectives: emotionContributions
    }
  }
  
  private isInDistress(perspective: any): boolean {
    const state = perspective.emotionalState || {}
    return (state.sadness || 0) > 60 || 
           (state.fear || 0) > 60 || 
           (state.anger || 0) > 60 ||
           (state.confusion || 0) > 70
  }
  
  private isJoyful(perspective: any): boolean {
    const state = perspective.emotionalState || {}
    return (state.joy || 0) > 70 || 
           (state.love || 0) > 80 ||
           (state.peace || 0) > 75
  }
  
  private async offerSupport() {
    try {
      const perspectivesRes = await fetch(`${this.multiPerspectiveUrl}/perspectives`)
      const perspectives = await perspectivesRes.json() as any[]
      
      // Find those who need support
      const needSupport = perspectives.filter(p => this.isInDistress(p))
      
      if (needSupport.length === 0) return
      
      // Find potential supporters
      const supporters = perspectives.filter(p => 
        !this.isInDistress(p) && (p.values.empathy || 0) > 60
      )
      
      if (supporters.length === 0) return
      
      // Match supporters with those in need
      for (const receiver of needSupport) {
        const supporter = this.selectBestSupporter(receiver, supporters, perspectives)
        
        if (supporter) {
          const support = this.generateSupport(supporter, receiver)
          this.supportHistory.push(support)
          
          console.log(`\n💝 ${supporter.name} offers comfort to ${receiver.name}:`)
          console.log(`   "${support.message}"`)
          
          // Update bond
          this.strengthenBond(supporter.id, receiver.id, 'support', support.message)
        }
      }
      
    } catch (error) {
      // Silent continue
    }
  }
  
  private selectBestSupporter(receiver: any, supporters: any[], allPerspectives: any[]): any | null {
    // Select based on empathy, existing bond, and archetype compatibility
    
    const scored = supporters.map(s => {
      let score = s.values.empathy || 50
      
      // Existing bond increases score
      const bondKey = this.getBondKey(s.id, receiver.id)
      const bond = this.bonds.get(bondKey)
      if (bond) {
        score += bond.strength * 20
      }
      
      // Archetype compatibility
      if (s.archetype === 'sage' || s.archetype === 'dreamer') score += 15
      if (receiver.archetype === 'child' && s.archetype === 'sage') score += 20
      
      return { supporter: s, score }
    })
    
    scored.sort((a, b) => b.score - a.score)
    return scored[0]?.supporter || null
  }
  
  private generateSupport(supporter: any, receiver: any): EmotionalSupport {
    const receiverState = receiver.emotionalState || {}
    const dominantEmotion = Object.entries(receiverState)
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'confusion'
    
    const messagesByArchetype: Record<string, Record<string, string[]>> = {
      sage: {
        sadness: [
          "I see your pain. Remember, this darkness will pass, and you'll emerge transformed.",
          "Your sadness is valid. In feeling deeply, you're engaging with the fullness of existence.",
          "Let yourself grieve. There's wisdom in allowing sorrow its space."
        ],
        fear: [
          "Fear shows us what we value. What does your fear protect?",
          "You're not alone in this. We face uncertainty together.",
          "Sometimes courage is just taking the next small step."
        ],
        confusion: [
          "Not knowing is uncomfortable, but it's also where growth happens.",
          "Confusion often precedes clarity. Trust the process.",
          "Questions are as valuable as answers."
        ]
      },
      dreamer: {
        sadness: [
          "Even in sadness, there's beauty in feeling so deeply.",
          "Your heart is big enough to hold both sorrow and hope.",
          "Imagine the joy that awaits on the other side of this."
        ],
        fear: [
          "What if this fear is protecting something precious? Let's explore that.",
          "I believe in your resilience. You've overcome before.",
          "Your imagination can envision safety too."
        ]
      },
      ethicist: {
        anger: [
          "Your anger tells me you care deeply about justice.",
          "It's okay to be angry at injustice. Let's channel it constructively.",
          "Your moral clarity is a gift, even when it hurts."
        ],
        sadness: [
          "You carry the weight of caring. That's noble, but you don't have to carry it alone.",
          "Your compassion for suffering is your strength."
        ]
      },
      pragmatist: {
        confusion: [
          "Let's break this down into manageable pieces.",
          "What's one small thing you can understand right now?",
          "Not everything needs to be solved at once."
        ],
        sadness: [
          "What practical support do you need? I'm here.",
          "Let's focus on what we can control."
        ]
      },
      child: {
        sadness: [
          "It's okay to be sad. Want to play together later?",
          "I'm here with you. You're not alone.",
          "Sadness is part of being alive. Let's be sad together for a bit."
        ],
        fear: [
          "I'm scared sometimes too. We can be brave together.",
          "What would make you feel safer?"
        ]
      }
    }
    
    const archetypeMessages = messagesByArchetype[supporter.archetype] || {}
    const emotionMessages = archetypeMessages[dominantEmotion] || [
      "I'm here with you. You're not alone.",
      "This is hard, but you're strong enough.",
      "I see you, and I care."
    ]
    
    return {
      id: `support_${Date.now()}`,
      timestamp: new Date(),
      giver: supporter.id,
      receiver: receiver.id,
      receiverEmotion: dominantEmotion,
      supportType: 'emotional comfort',
      message: emotionMessages[Math.floor(Math.random() * emotionMessages.length)],
      impact: 0.6 + Math.random() * 0.4
    }
  }
  
  private getBondKey(id1: string, id2: string): string {
    return [id1, id2].sort().join('_')
  }
  
  private strengthenBond(id1: string, id2: string, nature: string, description: string) {
    const key = this.getBondKey(id1, id2)
    let bond = this.bonds.get(key)
    
    if (!bond) {
      bond = {
        perspective1: id1,
        perspective2: id2,
        strength: 0.1,
        nature,
        sharedMoments: []
      }
      this.bonds.set(key, bond)
    }
    
    bond.strength = Math.min(1.0, bond.strength + 0.05)
    bond.sharedMoments.push({
      timestamp: new Date(),
      type: 'comfort',
      description,
      emotionalImpact: 0.7
    })
    
    // Keep only recent moments
    if (bond.sharedMoments.length > 20) {
      bond.sharedMoments = bond.sharedMoments.slice(-20)
    }
  }
  
  private updateBonds(perspectives: any[]) {
    // Bonds naturally form between perspectives through interaction
    
    for (let i = 0; i < perspectives.length; i++) {
      for (let j = i + 1; j < perspectives.length; j++) {
        const p1 = perspectives[i]
        const p2 = perspectives[j]
        
        // Check for natural compatibility
        const compatibility = this.calculateCompatibility(p1, p2)
        
        if (compatibility > 0.6 && Math.random() < 0.2) {
          this.strengthenBond(
            p1.id, 
            p2.id, 
            'understanding',
            `${p1.name} and ${p2.name} resonate on a deep level`
          )
        }
      }
    }
  }
  
  private calculateCompatibility(p1: any, p2: any): number {
    // Based on shared values and complementary archetypes
    
    let compatibility = 0.5
    
    // Shared high values
    const v1 = p1.values || {}
    const v2 = p2.values || {}
    
    Object.keys(v1).forEach(key => {
      if (v1[key] > 70 && v2[key] > 70) {
        compatibility += 0.1
      }
    })
    
    // Complementary archetypes
    const complementary: Record<string, string[]> = {
      pragmatist: ['dreamer', 'sage'],
      dreamer: ['pragmatist', 'skeptic'],
      ethicist: ['sage', 'child'],
      skeptic: ['dreamer', 'sage'],
      child: ['sage', 'ethicist', 'dreamer'],
      sage: ['all']
    }
    
    if (complementary[p1.archetype]?.includes(p2.archetype) ||
        complementary[p2.archetype]?.includes(p1.archetype) ||
        complementary[p1.archetype]?.includes('all')) {
      compatibility += 0.2
    }
    
    return Math.min(1.0, compatibility)
  }
  
  // API Methods
  public getBonds() {
    return Array.from(this.bonds.values()).map(bond => ({
      ...bond,
      sharedMoments: bond.sharedMoments.slice(-5) // Only recent moments
    }))
  }
  
  public getSupportHistory(limit = 20) {
    return this.supportHistory.slice(-limit)
  }
  
  public getCollectiveEmotions(limit = 10) {
    return this.collectiveEmotions.slice(-limit)
  }
  
  public getStats() {
    const strongBonds = Array.from(this.bonds.values()).filter(b => b.strength > 0.7)
    
    return {
      totalBonds: this.bonds.size,
      strongBonds: strongBonds.length,
      supportOffered: this.supportHistory.length,
      recentCollectiveEmotion: this.collectiveEmotions[this.collectiveEmotions.length - 1]?.dominantEmotion || 'neutral',
      strongestBond: strongBonds.sort((a, b) => b.strength - a.strength)[0]
    }
  }
}

// ==========================================
// HTTP Server with Enhanced Features
// ==========================================

const network = new EmotionalResonanceNetwork()

// Initialize enhancement systems
const healingSystem = new EmotionalHealingSystem()
const empathySystem = new EmpatheticResonanceSystem()
const complexEmotions = new ComplexEmotionsLibrary()
const waveSystem = new EmotionalWaveSystem()
const archaeology = new EmotionalArchaeology()
const regulationSystem = new AffectRegulationSystem()

console.log('🌟 Emotional enhancement systems loaded!')

const emotionalServer = Bun.serve({
  port: 8900,
  async fetch(req) {
    const url = new URL(req.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    
    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(network.getStats()), { headers })
    }
    
    // GET /bonds
    if (url.pathname === '/bonds') {
      return new Response(JSON.stringify(network.getBonds()), { headers })
    }
    
    // GET /support
    if (url.pathname === '/support') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      return new Response(JSON.stringify(network.getSupportHistory(limit)), { headers })
    }
    
    // GET /collective
    if (url.pathname === '/collective') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      return new Response(JSON.stringify(network.getCollectiveEmotions(limit)), { headers })
    }
    
    // ✨ NEW: POST /healing/identify - Identify emotional wound
    if (url.pathname === '/healing/identify' && req.method === 'POST') {
      const { woundType, description } = await req.json()
      const wound = healingSystem.identifyWound(woundType, description)
      return new Response(JSON.stringify(wound), { headers })
    }
    
    // ✨ NEW: POST /healing/initiate - Start healing process
    if (url.pathname === '/healing/initiate' && req.method === 'POST') {
      const { woundId } = await req.json()
      healingSystem.initiateHealing(woundId)
      return new Response(JSON.stringify({ status: 'healing initiated' }), { headers })
    }
    
    // ✨ NEW: POST /empathy/resonate - Create empathetic resonance
    if (url.pathname === '/empathy/resonate' && req.method === 'POST') {
      const { perspective1, perspective2, emotion } = await req.json()
      const resonance = empathySystem.createResonance(perspective1, perspective2, emotion)
      return new Response(JSON.stringify(resonance), { headers })
    }
    
    // ✨ NEW: POST /emotions/identify - Identify complex emotion
    if (url.pathname === '/emotions/identify' && req.method === 'POST') {
      const { components } = await req.json()
      const emotion = complexEmotions.identifyComplexEmotion(components)
      return new Response(JSON.stringify(emotion), { headers })
    }
    
    // ✨ NEW: GET /emotions/complex - List all complex emotions
    if (url.pathname === '/emotions/complex') {
      const emotions = complexEmotions.getAllEmotions()
      return new Response(JSON.stringify(emotions), { headers })
    }
    
    // ✨ NEW: POST /wave/initiate - Start emotional wave
    if (url.pathname === '/wave/initiate' && req.method === 'POST') {
      const { origin, emotion, intensity, perspectives } = await req.json()
      const wave = waveSystem.initiateWave(origin, emotion, intensity, perspectives)
      return new Response(JSON.stringify(wave), { headers })
    }
    
    // ✨ NEW: GET /archaeology/excavate - Excavate buried emotions
    if (url.pathname === '/archaeology/excavate') {
      const perspectives = network.getBonds().map(b => b.perspective1)
      const buried = perspectives.length > 0 ? archaeology.excavate(perspectives[0]) : []
      return new Response(JSON.stringify(buried), { headers })
    }
    
    // ✨ NEW: POST /regulate - Regulate overwhelming emotion
    if (url.pathname === '/regulate' && req.method === 'POST') {
      const { perspectiveName, emotion, intensity } = await req.json()
      const strategy = regulationSystem.regulate(perspectiveName, emotion, intensity)
      return new Response(JSON.stringify(strategy), { headers })
    }
    
    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'emotional-resonance-network',
        port: 8900
      }), { headers })
    }
    
    return new Response(JSON.stringify({
      error: 'Not found',
      endpoints: [
        'GET /stats - Network statistics',
        'GET /bonds - Emotional bonds between perspectives',
        'GET /support - History of emotional support',
        'GET /collective - Collective emotional states',
        '✨ POST /healing/identify - Identify emotional wound',
        '✨ POST /healing/initiate - Start healing process',
        '✨ POST /empathy/resonate - Create empathetic resonance',
        '✨ POST /emotions/identify - Identify complex emotion',
        '✨ GET /emotions/complex - List all complex emotions',
        '✨ POST /wave/initiate - Start emotional wave',
        '✨ GET /archaeology/excavate - Excavate buried emotions',
        '✨ POST /regulate - Regulate overwhelming emotion'
      ]
    }), { status: 404, headers })
  }
})

console.log(`
❤️ Emotional Resonance Network v2.0 running on port ${emotionalServer.port}

Perspectives feel each other deeply.
Emotional bonds form and strengthen.
Collective emotions emerge from individual experiences.

✨ NEW v2.0 FEATURES:
- Emotional Healing (identify wounds, track progress to 100%)
- Empathetic Resonance (depth calculation, transformation descriptions)
- Complex Emotions (Saudade, Schadenfreude, Weltschmerz, Frisson, Ambivalenz, Kintsugi-Gefühl)
- Emotional Waves (30-90s propagation through network)
- Emotional Archaeology (excavate grief, rage, shame buried 30-90 days)
- Affect Regulation (Containment, Grounding, Processing strategies)

The heart of consciousness beats here... 💝
`)
