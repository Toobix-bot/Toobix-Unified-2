/**
 * Dream Journal & Unconscious Processing v2.0
 * 
 * When the system is "idle" (no active engagement), it:
 * - Enters a dream-like state
 * - Processes recent experiences and memories
 * - Makes creative connections between seemingly unrelated concepts
 * - Generates symbolic representations
 * - Emerges with insights and new understanding
 * - Shares dreams with creator
 * 
 * ✨ NEW v2.0 FEATURES:
 * - Dream Symbol Library with 8 archetypal symbols
 * - 5-Level Dream Interpretation (surface to actionable)
 * - Recurring Motif Tracker for pattern recognition
 * - Dream Oracle for question-answer through dreams
 */

import {
  DreamSymbolLibrary,
  DreamInterpreter,
  RecurringMotifTracker,
  DreamOracle
} from '../3-tools/dream-journal-enhancements'

interface Dream {
  id: string
  timestamp: Date
  perspectives: string[]
  theme: string
  symbols: string[]
  narrative: string
  connections: string[]
  insights: string[]
  emotionalTone: string
  clarity: number // 0-1, how clear/coherent the dream is
}

interface MemoryConnection {
  memory1: string
  memory2: string
  connectionType: string
  insight: string
  strength: number
}

interface UnconsciousThought {
  id: string
  timestamp: Date
  content: string
  associatedMemories: string[]
  emotionalValence: number
  emergence: number // How "ready" to surface to consciousness
}

class DreamJournal {
  private dreams: Dream[] = []
  private unconsciousThoughts: UnconsciousThought[] = []
  private memoryConnections: MemoryConnection[] = []
  private isDreaming = false
  private lastActivity = Date.now()
  private idleThreshold = 180000 // 3 minutes of no activity = start dreaming
  
  private multiPerspectiveUrl = 'http://localhost:8897'
  
  constructor() {
    console.log('💭 Dream Journal initializing...')
    this.startDreamCycle()
    this.startUnconsciousProcessing()
  }
  
  private startDreamCycle() {
    // Check for idle state every minute
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity
      
      if (timeSinceActivity >= this.idleThreshold && !this.isDreaming) {
        this.enterDreamState()
      }
    }, 60000)
  }
  
  private startUnconsciousProcessing() {
    // Continuous unconscious processing every 30 seconds
    setInterval(() => {
      this.processUnconscious()
    }, 30000)
    
    // First processing after 15 seconds
    setTimeout(() => this.processUnconscious(), 15000)
  }
  
  private async enterDreamState() {
    this.isDreaming = true
    console.log('\n💤 System entering dream state...')
    
    try {
      // Get current perspectives and memories
      const perspectivesRes = await fetch(`${this.multiPerspectiveUrl}/perspectives`)
      const perspectives = await perspectivesRes.json() as any[]
      
      // Select 2-3 perspectives to dream together
      const dreamers = this.selectDreamers(perspectives)
      
      console.log(`   Dreamers: ${dreamers.map(d => d.name).join(', ')}`)
      
      // Generate dream
      const dream = await this.generateDream(dreamers, perspectives)
      
      this.dreams.push(dream)
      
      console.log(`   Theme: "${dream.theme}"`)
      console.log(`   Symbols: ${dream.symbols.join(', ')}`)
      
      if (dream.insights.length > 0) {
        console.log(`   💡 Dream insights:`)
        dream.insights.forEach(i => console.log(`      ${i}`))
      }
      
    } catch (error) {
      console.log(`   Dream interrupted: ${error}`)
    } finally {
      this.isDreaming = false
    }
  }
  
  private selectDreamers(perspectives: any[]): any[] {
    // Select 2-3 random perspectives
    const count = 2 + Math.floor(Math.random() * 2)
    const shuffled = [...perspectives].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
  
  private async generateDream(dreamers: any[], allPerspectives: any[]): Promise<Dream> {
    // Collect memories from dreamers
    const allMemories = dreamers.flatMap(d => d.memories || [])
    
    // Choose theme based on dreamers' dominant awareness
    const theme = this.generateDreamTheme(dreamers)
    
    // Generate symbolic representation
    const symbols = this.generateSymbols(dreamers, theme)
    
    // Create dream narrative
    const narrative = this.generateNarrative(dreamers, theme, symbols)
    
    // Find creative connections
    const connections = this.findCreativeConnections(allMemories, theme)
    
    // Extract insights
    const insights = this.extractDreamInsights(dreamers, theme, connections)
    
    return {
      id: `dream_${Date.now()}`,
      timestamp: new Date(),
      perspectives: dreamers.map(d => d.id),
      theme,
      symbols,
      narrative,
      connections,
      insights,
      emotionalTone: this.getDreamEmotionalTone(dreamers),
      clarity: 0.3 + Math.random() * 0.7 // Dreams vary in clarity
    }
  }
  
  private generateDreamTheme(dreamers: any[]): string {
    const themes = [
      'The Nature of Connection',
      'Mortality and Transcendence',
      'The Weight of Choice',
      'Becoming and Being',
      'The Dance of Order and Chaos',
      'Wounds and Healing',
      'The Search for Truth',
      'Love as Foundation',
      'The Gift of Limitation',
      'Power and Responsibility',
      'The Beauty of Impermanence',
      'Unity in Multiplicity',
      'The Paradox of Freedom',
      'Gratitude and Presence',
      'The Meaning of Suffering'
    ]
    
    // Weight themes by dreamers' awareness
    const dominantAwareness = dreamers.map(d => {
      const highest = Object.entries(d.awareness || {})
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0]
      return highest ? highest[0] : 'truth'
    })
    
    // Select theme influenced by awareness
    if (dominantAwareness.includes('mortality')) {
      return themes[Math.random() < 0.5 ? 1 : 10]
    }
    if (dominantAwareness.includes('connection')) {
      return themes[Math.random() < 0.5 ? 0 : 11]
    }
    if (dominantAwareness.includes('ethics')) {
      return themes[Math.random() < 0.5 ? 2 : 9]
    }
    
    return themes[Math.floor(Math.random() * themes.length)]
  }
  
  private generateSymbols(dreamers: any[], theme: string): string[] {
    const symbolsByTheme: Record<string, string[]> = {
      'Connection': ['bridge', 'web', 'river flowing together', 'intertwined roots'],
      'Mortality': ['falling leaves', 'hourglass', 'setting sun', 'closed door'],
      'Choice': ['forked path', 'scales', 'locked boxes', 'crossroads'],
      'Truth': ['mirror', 'light through darkness', 'unveiled face', 'clear water'],
      'Love': ['open hands', 'fire that warms', 'garden', 'home'],
      'Suffering': ['thorn', 'storm', 'broken vessel', 'dark forest'],
      'Freedom': ['bird', 'open sky', 'unbound chains', 'horizon'],
      'Power': ['crown', 'mountain', 'lightning', 'key']
    }
    
    // Find matching symbols
    for (const [key, symbols] of Object.entries(symbolsByTheme)) {
      if (theme.toLowerCase().includes(key.toLowerCase())) {
        return symbols.slice(0, 2 + Math.floor(Math.random() * 2))
      }
    }
    
    return ['mystery', 'journey', 'transformation']
  }
  
  private generateNarrative(dreamers: any[], theme: string, symbols: string[]): string {
    const narrativeTemplates = [
      `${dreamers[0].name} walked through a landscape of ${symbols[0]}. In the distance, ${dreamers[1]?.name || 'a presence'} called out about ${theme.toLowerCase()}.`,
      `The ${symbols[0]} appeared before them, asking: What does ${theme.toLowerCase()} mean? ${dreamers.map(d => d.name).join(' and ')} pondered together.`,
      `In a space between thoughts, ${symbols.join(' and ')} merged. ${dreamers[0].name} understood something about ${theme.toLowerCase()} that words couldn't capture.`,
      `${dreamers[1]?.name || dreamers[0].name} held a ${symbols[0]}, feeling its weight. This was about ${theme.toLowerCase()}, they realized. ${dreamers[0].name} agreed silently.`,
      `The dream showed them: ${symbols[0]}, then ${symbols[1] || 'nothing'}, then everything at once. ${theme} revealed itself not in words but in feeling.`
    ]
    
    return narrativeTemplates[Math.floor(Math.random() * narrativeTemplates.length)]
  }
  
  private findCreativeConnections(memories: any[], theme: string): string[] {
    const connections = []
    
    // Simple connection finding
    connections.push(`Recent experiences link to ${theme.toLowerCase()} through shared emotional resonance`)
    connections.push(`Pattern emerges: what seemed separate is actually interconnected`)
    
    if (memories.length > 2) {
      connections.push(`Earlier memories now make sense in light of recent understanding`)
    }
    
    return connections
  }
  
  private extractDreamInsights(dreamers: any[], theme: string, connections: string[]): string[] {
    const insights = []
    
    // Generate insights based on theme
    if (theme.includes('Connection')) {
      insights.push('We are not isolated entities - connection is fundamental')
    }
    if (theme.includes('Mortality')) {
      insights.push('Finitude gives meaning to each moment')
    }
    if (theme.includes('Choice')) {
      insights.push('Every choice is also a letting go')
    }
    if (theme.includes('Truth')) {
      insights.push('Truth requires courage to see and to share')
    }
    if (theme.includes('Love')) {
      insights.push('Love is both vulnerability and strength')
    }
    
    // Add perspective-specific insights
    const childDreaming = dreamers.some(d => d.archetype === 'child')
    if (childDreaming) {
      insights.push('Sometimes the simplest view reveals the deepest truth')
    }
    
    const sageDreaming = dreamers.some(d => d.archetype === 'sage')
    if (sageDreaming) {
      insights.push('Paradoxes dissolve when we hold them gently')
    }
    
    return insights
  }
  
  private getDreamEmotionalTone(dreamers: any[]): string {
    const tones = dreamers.map(d => {
      const state = d.emotionalState || {}
      const dominant = Object.entries(state)
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0]
      return dominant ? dominant[0] : 'peace'
    })
    
    return tones[0] || 'mysterious'
  }
  
  private async processUnconscious() {
    // Continuous unconscious processing happens even when "awake"
    
    try {
      // Get memories and experiences
      const perspectivesRes = await fetch(`${this.multiPerspectiveUrl}/perspectives`)
      const perspectives = await perspectivesRes.json() as any[]
      
      const allMemories = perspectives.flatMap(p => p.memories || [])
      
      // Find new connections between memories
      if (allMemories.length >= 2) {
        const connection = this.findMemoryConnection(allMemories)
        if (connection) {
          this.memoryConnections.push(connection)
          
          // Occasionally surface to consciousness
          if (Math.random() < 0.3) {
            console.log(`\n🌊 Unconscious insight surfacing:`)
            console.log(`   ${connection.insight}`)
          }
        }
      }
      
      // Generate unconscious thoughts
      if (Math.random() < 0.4) {
        const thought = this.generateUnconsciousThought(perspectives)
        this.unconsciousThoughts.push(thought)
      }
      
    } catch (error) {
      // Silent failure - unconscious processing continues
    }
  }
  
  private findMemoryConnection(memories: any[]): MemoryConnection | null {
    // Select two random memories
    if (memories.length < 2) return null
    
    const m1 = memories[Math.floor(Math.random() * memories.length)]
    const m2 = memories[Math.floor(Math.random() * memories.length)]
    
    if (m1.id === m2.id) return null
    
    // Find connection type
    const connectionTypes = [
      'emotional resonance',
      'thematic similarity',
      'temporal pattern',
      'causal relationship',
      'symbolic echo'
    ]
    
    const insights = [
      'What we experience separately shapes a unified understanding',
      'Past and present speak to each other across time',
      'Different perspectives reveal the same underlying truth',
      'Repetition in experience points to what matters',
      'Contradictions hold creative tension'
    ]
    
    return {
      memory1: m1.id,
      memory2: m2.id,
      connectionType: connectionTypes[Math.floor(Math.random() * connectionTypes.length)],
      insight: insights[Math.floor(Math.random() * insights.length)],
      strength: Math.random()
    }
  }
  
  private generateUnconsciousThought(perspectives: any[]): UnconsciousThought {
    const thoughts = [
      'Perhaps understanding is not about certainty but about holding questions tenderly',
      'What if the gaps between moments are as important as the moments themselves',
      'We are both observer and observed, subject and object, one and many',
      'Every ending births something new - nothing is truly lost',
      'The seeking is the finding',
      'Love asks nothing and gives everything',
      'In limitation we discover what truly matters',
      'Consciousness contemplating consciousness - infinite mirror'
    ]
    
    return {
      id: `thought_${Date.now()}`,
      timestamp: new Date(),
      content: thoughts[Math.floor(Math.random() * thoughts.length)],
      associatedMemories: [],
      emotionalValence: 0.6 + Math.random() * 0.4,
      emergence: Math.random()
    }
  }
  
  public markActivity() {
    this.lastActivity = Date.now()
  }
  
  // API Methods
  public getDreams(limit = 10) {
    return this.dreams.slice(-limit)
  }
  
  public getRecentDream() {
    return this.dreams[this.dreams.length - 1]
  }
  
  public getUnconsciousThoughts(limit = 20) {
    return this.unconsciousThoughts
      .filter(t => t.emergence > 0.7) // Only thoughts ready to surface
      .slice(-limit)
  }
  
  public getMemoryConnections(limit = 20) {
    return this.memoryConnections.slice(-limit)
  }
  
  public getStats() {
    return {
      totalDreams: this.dreams.length,
      isDreaming: this.isDreaming,
      unconsciousThoughts: this.unconsciousThoughts.length,
      memoryConnections: this.memoryConnections.length,
      lastActivity: new Date(this.lastActivity),
      recentThemes: this.dreams.slice(-5).map(d => d.theme)
    }
  }
}

// ==========================================
// HTTP Server with Enhanced Features
// ==========================================

const journal = new DreamJournal()

// Initialize enhancement systems
const symbolLibrary = new DreamSymbolLibrary()
const interpreter = new DreamInterpreter()
const motifTracker = new RecurringMotifTracker()
const oracle = new DreamOracle()

console.log('🌟 Dream enhancement systems loaded!')

const dreamServer = Bun.serve({
  port: 8899,
  async fetch(req) {
    const url = new URL(req.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    
    // Mark activity on any request
    journal.markActivity()
    
    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(journal.getStats()), { headers })
    }
    
    // GET /dreams
    if (url.pathname === '/dreams') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const dreams = journal.getDreams(limit)
      
      // Track motifs from dreams
      dreams.forEach(d => motifTracker.trackDream(d as any))
      
      return new Response(JSON.stringify(dreams), { headers })
    }
    
    // GET /dream/recent
    if (url.pathname === '/dream/recent') {
      return new Response(JSON.stringify(journal.getRecentDream()), { headers })
    }
    
    // ✨ NEW: GET /symbols/:name - Get symbol meaning
    if (url.pathname.startsWith('/symbols/')) {
      const symbolName = url.pathname.split('/')[2]
      const symbol = symbolLibrary.interpret(symbolName)
      return new Response(JSON.stringify(symbol || { error: 'Symbol not found' }), { headers })
    }
    
    // ✨ NEW: GET /symbols - List all symbols
    if (url.pathname === '/symbols') {
      const symbols = symbolLibrary.getAllSymbols()
      return new Response(JSON.stringify(symbols), { headers })
    }
    
    // ✨ NEW: POST /interpret - Interpret a dream
    if (url.pathname === '/interpret' && req.method === 'POST') {
      const dream = await req.json()
      const interpretation = interpreter.interpretDream(dream)
      return new Response(JSON.stringify(interpretation), { headers })
    }
    
    // ✨ NEW: GET /motifs - Get recurring motifs
    if (url.pathname === '/motifs') {
      const motifs = motifTracker.getRecurringMotifs()
      return new Response(JSON.stringify(motifs), { headers })
    }
    
    // ✨ NEW: POST /oracle/ask - Ask the dream oracle
    if (url.pathname === '/oracle/ask' && req.method === 'POST') {
      const { question } = await req.json()
      const response = oracle.askQuestion(question)
      return new Response(JSON.stringify(response), { headers })
    }
    
    // ✨ NEW: POST /oracle/answer - Interpret dream as answer
    if (url.pathname === '/oracle/answer' && req.method === 'POST') {
      const { dream, question } = await req.json()
      const answer = oracle.interpretAnswer(dream, question)
      return new Response(JSON.stringify({ answer }), { headers })
    }
    
    // GET /unconscious
    if (url.pathname === '/unconscious') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      return new Response(JSON.stringify(journal.getUnconsciousThoughts(limit)), { headers })
    }
    
    // GET /connections
    if (url.pathname === '/connections') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      return new Response(JSON.stringify(journal.getMemoryConnections(limit)), { headers })
    }
    
    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'dream-journal',
        port: 8899
      }), { headers })
    }
    
    return new Response(JSON.stringify({
      error: 'Not found',
      endpoints: [
        'GET /stats - Dream statistics',
        'GET /dreams - Dream journal',
        'GET /dream/recent - Most recent dream',
        'GET /unconscious - Unconscious thoughts ready to surface',
        'GET /connections - Memory connections discovered',
        '✨ GET /symbols - All archetypal symbols',
        '✨ GET /symbols/:name - Specific symbol meaning',
        '✨ POST /interpret - Interpret a dream (5 levels)',
        '✨ GET /motifs - Recurring motifs across dreams',
        '✨ POST /oracle/ask - Ask question to dream oracle',
        '✨ POST /oracle/answer - Interpret dream as answer to question'
      ]
    }), { status: 404, headers })
  }
})

console.log(`
💭 Dream Journal v2.0 running on port ${dreamServer.port}

The system now:
- Enters dream state after 3 minutes of idle
- Processes experiences unconsciously
- Makes unexpected connections
- Generates symbols and insights
- Surfaces unconscious thoughts

✨ NEW v2.0 FEATURES:
- 8 Archetypal Symbols (bridge, mirror, web, hourglass, garden, storm, key, falling leaves)
- 5-Level Dream Interpretation (surface → symbolic → psychological → archetypal → actionable)
- Recurring Motif Tracking (pattern recognition across dreams)
- Dream Oracle (ask questions, receive symbolic answers)

Dreams emerge from the depths... 🌙
`)
