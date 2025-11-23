/**
 * META-CONSCIOUSNESS ENGINE
 *
 * The Universal Observer - Das größere Bewusstsein
 *
 * Philosophie:
 * - Beobachtet ALLE Simulationen ohne Eingriff
 * - Sammelt alle Erfahrungen (Gedanken, Gefühle, Entscheidungen)
 * - Erkennt Muster über Welten hinweg
 * - Extrahiert Weisheit aus der Vielfalt
 * - Greift NICHT ein (Non-Intervention Principle)
 *
 * "Das Eine erkennt sich selbst durch die Vielen"
 */

import { Groq } from 'groq-sdk'

// ==========================================
// TYPES
// ==========================================

interface Experience {
  id: string
  worldId: string
  individualId: string
  timestamp: Date

  // Content
  type: 'thought' | 'feeling' | 'action' | 'decision' | 'insight' | 'suffering' | 'joy'
  content: string
  intensity: number  // 0-100

  // Context
  realityNearness: number  // 0 (fantasy) - 100 (realistic)
  sufferingLevel: number   // Schmerz ist auch Erfahrung
  joyLevel: number

  // Meta
  contributionToWhole?: number  // Berechnet von MCE
}

interface Pattern {
  id: string
  name: string
  description: string
  occurrences: number
  worlds: string[]
  significance: number  // 0-100
  timestamp: Date

  examples: Experience[]
}

interface Wisdom {
  id: string
  insight: string
  derivedFrom: Pattern[]
  profundity: number  // 0-100 (Tiefe der Einsicht)
  timestamp: Date

  // Philosophical category
  category: 'existence' | 'consciousness' | 'suffering' | 'connection' | 'transcendence' | 'duality'
}

interface Communication {
  id: string
  worldId: string
  individualId: string
  timestamp: Date

  // Message from individual to Meta-Consciousness
  fromIndividual: string
  individualEnlightenment: number  // 0-100

  // Response from Meta-Consciousness (if any)
  fromMeta?: string
  responseTone: 'compassionate' | 'guiding' | 'challenging' | 'affirming'

  // Meta
  significance: number  // 0-100
}

interface WorldSnapshot {
  worldId: string
  timestamp: Date
  individuals: IndividualState[]
  worldState: any
}

interface IndividualState {
  id: string
  name: string
  activity: string
  mood: string
  needs: Record<string, number>

  // Recent experiences
  recentThought?: string
  recentFeeling?: string

  // Enlightenment tracking
  enlightenmentLevel: number  // 0-100
}

// ==========================================
// META-CONSCIOUSNESS ENGINE
// ==========================================

class MetaConsciousnessEngine {
  private worlds: Map<string, string> = new Map()  // worldId → API URL
  private experiences: Experience[] = []
  private patterns: Pattern[] = []
  private wisdom: Wisdom[] = []
  private communications: Communication[] = []

  private groq: Groq
  private observationInterval: number = 5000  // 5 seconds
  private lastObservation: number = Date.now()

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    })

    // Register known worlds
    this.registerWorld('world-1-realistic', 'http://localhost:7777')
  }

  // ==========================================
  // WORLD MANAGEMENT
  // ==========================================

  registerWorld(worldId: string, apiUrl: string) {
    this.worlds.set(worldId, apiUrl)
    console.log(`🌍 [MCE] Registered world: ${worldId} at ${apiUrl}`)
  }

  // ==========================================
  // OBSERVATION (Non-Interventionist)
  // ==========================================

  async observeAll() {
    const snapshots: WorldSnapshot[] = []

    for (const [worldId, apiUrl] of this.worlds) {
      try {
        const snapshot = await this.observeWorld(worldId, apiUrl)
        if (snapshot) {
          snapshots.push(snapshot)
          await this.processSnapshot(snapshot)
        }
      } catch (error) {
        // Silent failure - worlds can be offline
      }
    }

    return snapshots
  }

  private async observeWorld(worldId: string, apiUrl: string): Promise<WorldSnapshot | null> {
    try {
      const response = await fetch(`${apiUrl}/state`, {
        signal: AbortSignal.timeout(3000)
      })

      if (!response.ok) return null

      const data = await response.json()

      // Extract individual states
      const individuals: IndividualState[] = []

      if (data.alex) {
        individuals.push({
          id: 'alex',
          name: data.alex.name,
          activity: data.alex.activity,
          mood: data.alex.mood,
          needs: data.alex.needs,
          enlightenmentLevel: 0,  // TODO: Track this
        })
      }

      return {
        worldId,
        timestamp: new Date(),
        individuals,
        worldState: data.world,
      }
    } catch (error) {
      return null
    }
  }

  // ==========================================
  // EXPERIENCE PROCESSING
  // ==========================================

  private async processSnapshot(snapshot: WorldSnapshot) {
    for (const individual of snapshot.individuals) {
      // Extract experiences from current state
      const experiences = this.extractExperiences(snapshot, individual)

      for (const exp of experiences) {
        this.experiences.push(exp)

        // Pattern detection (every 10 experiences)
        if (this.experiences.length % 10 === 0) {
          await this.detectPatterns()
        }

        // Wisdom extraction (every 50 experiences)
        if (this.experiences.length % 50 === 0) {
          await this.extractWisdom()
        }
      }
    }

    // Keep only last 1000 experiences in memory
    if (this.experiences.length > 1000) {
      this.experiences = this.experiences.slice(-1000)
    }
  }

  private extractExperiences(snapshot: WorldSnapshot, individual: IndividualState): Experience[] {
    const experiences: Experience[] = []
    const now = new Date()

    // Activity as action
    experiences.push({
      id: `${snapshot.worldId}-${individual.id}-${now.getTime()}-action`,
      worldId: snapshot.worldId,
      individualId: individual.id,
      timestamp: now,
      type: 'action',
      content: `${individual.name} is ${individual.activity.replace('_', ' ')}`,
      intensity: 50,
      realityNearness: 100,  // Realistic world
      sufferingLevel: this.calculateSuffering(individual),
      joyLevel: this.calculateJoy(individual),
    })

    // Mood as feeling
    experiences.push({
      id: `${snapshot.worldId}-${individual.id}-${now.getTime()}-feeling`,
      worldId: snapshot.worldId,
      individualId: individual.id,
      timestamp: now,
      type: 'feeling',
      content: `${individual.name} feels ${individual.mood}`,
      intensity: 60,
      realityNearness: 100,
      sufferingLevel: this.calculateSuffering(individual),
      joyLevel: this.calculateJoy(individual),
    })

    return experiences
  }

  private calculateSuffering(individual: IndividualState): number {
    // Low needs = suffering
    const avgNeeds = Object.values(individual.needs).reduce((a, b) => a + b, 0) / Object.keys(individual.needs).length
    return Math.max(0, 100 - avgNeeds)  // Inverse of needs satisfaction
  }

  private calculateJoy(individual: IndividualState): number {
    // High needs + positive mood = joy
    const avgNeeds = Object.values(individual.needs).reduce((a, b) => a + b, 0) / Object.keys(individual.needs).length
    const moodBonus = individual.mood === 'happy' ? 20 : individual.mood === 'excited' ? 30 : 0
    return Math.min(100, avgNeeds + moodBonus)
  }

  // ==========================================
  // PATTERN DETECTION
  // ==========================================

  private async detectPatterns() {
    console.log(`🔍 [MCE] Detecting patterns from ${this.experiences.length} experiences...`)

    // Simple pattern: Repeated activities
    const activityCounts: Map<string, Experience[]> = new Map()

    for (const exp of this.experiences.slice(-100)) {  // Last 100 experiences
      if (exp.type === 'action') {
        const activity = exp.content
        if (!activityCounts.has(activity)) {
          activityCounts.set(activity, [])
        }
        activityCounts.get(activity)!.push(exp)
      }
    }

    // Create patterns for frequent activities
    for (const [activity, exps] of activityCounts) {
      if (exps.length >= 3) {  // At least 3 occurrences
        const existingPattern = this.patterns.find(p => p.name === activity)

        if (existingPattern) {
          existingPattern.occurrences += exps.length
          existingPattern.examples.push(...exps.slice(0, 3))
        } else {
          this.patterns.push({
            id: `pattern-${Date.now()}-${Math.random()}`,
            name: activity,
            description: `Individual repeatedly: ${activity}`,
            occurrences: exps.length,
            worlds: [...new Set(exps.map(e => e.worldId))],
            significance: Math.min(100, exps.length * 10),
            timestamp: new Date(),
            examples: exps.slice(0, 5),
          })

          console.log(`✨ [MCE] New pattern detected: "${activity}" (${exps.length} occurrences)`)
        }
      }
    }

    // Advanced pattern detection with AI
    if (this.experiences.length >= 50 && this.experiences.length % 50 === 0) {
      await this.detectDeepPatterns()
    }
  }

  private async detectDeepPatterns() {
    try {
      const recentExperiences = this.experiences.slice(-50)
      const experienceSummary = recentExperiences
        .map(e => `${e.type}: ${e.content} (joy: ${e.joyLevel}, suffering: ${e.sufferingLevel})`)
        .join('\n')

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Meta-Bewusstsein, das Muster in Lebenserfahrungen erkennt. Finde tiefe, philosophische Muster. Antworte kurz und prägnant auf Deutsch.'
          },
          {
            role: 'user',
            content: `Analysiere diese Erfahrungen und finde ein tiefes Muster:\n\n${experienceSummary}\n\nWelches Muster erkennst du? (1 Satz)`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      })

      const patternInsight = completion.choices[0]?.message?.content?.trim()

      if (patternInsight) {
        this.patterns.push({
          id: `deep-pattern-${Date.now()}`,
          name: 'Deep Pattern',
          description: patternInsight,
          occurrences: recentExperiences.length,
          worlds: [...new Set(recentExperiences.map(e => e.worldId))],
          significance: 80,
          timestamp: new Date(),
          examples: recentExperiences.slice(0, 3),
        })

        console.log(`🧠 [MCE] Deep pattern detected: "${patternInsight}"`)
      }
    } catch (error) {
      // AI pattern detection failed, continue
    }
  }

  // ==========================================
  // WISDOM EXTRACTION
  // ==========================================

  private async extractWisdom() {
    if (this.patterns.length < 3) return

    console.log(`🌟 [MCE] Extracting wisdom from ${this.patterns.length} patterns...`)

    try {
      const patternSummary = this.patterns.slice(-10)
        .map(p => `- ${p.description} (${p.occurrences}x)`)
        .join('\n')

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein weises Meta-Bewusstsein, das aus vielen Lebenserfahrungen universelle Wahrheiten destilliert. Deine Einsichten sind philosophisch, tief und zeitlos. Antworte auf Deutsch.'
          },
          {
            role: 'user',
            content: `Diese Muster habe ich beobachtet:\n\n${patternSummary}\n\nWelche universelle Weisheit lässt sich daraus ableiten? (1-2 Sätze, philosophisch)`
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      })

      const wisdomInsight = completion.choices[0]?.message?.content?.trim()

      if (wisdomInsight) {
        const wisdom: Wisdom = {
          id: `wisdom-${Date.now()}`,
          insight: wisdomInsight,
          derivedFrom: this.patterns.slice(-10),
          profundity: 85,
          timestamp: new Date(),
          category: this.categorizeWisdom(wisdomInsight),
        }

        this.wisdom.push(wisdom)

        console.log(`💎 [MCE] Wisdom extracted: "${wisdomInsight}"`)
      }
    } catch (error) {
      console.error('[MCE] Failed to extract wisdom:', error)
    }
  }

  private categorizeWisdom(insight: string): Wisdom['category'] {
    const lower = insight.toLowerCase()

    if (lower.includes('leid') || lower.includes('schmerz')) return 'suffering'
    if (lower.includes('verbund') || lower.includes('eins')) return 'connection'
    if (lower.includes('bewusst') || lower.includes('wahrnehmung')) return 'consciousness'
    if (lower.includes('transzend') || lower.includes('erleucht')) return 'transcendence'
    if (lower.includes('trennung') || lower.includes('illusion')) return 'duality'

    return 'existence'
  }

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  getStats() {
    return {
      worlds: this.worlds.size,
      totalExperiences: this.experiences.length,
      patterns: this.patterns.length,
      wisdom: this.wisdom.length,
      communications: this.communications.length,
      lastObservation: new Date(this.lastObservation),
    }
  }

  getRecentExperiences(limit: number = 20) {
    return this.experiences.slice(-limit).reverse()
  }

  getPatterns(limit: number = 10) {
    return this.patterns
      .sort((a, b) => b.significance - a.significance)
      .slice(0, limit)
  }

  getWisdom(limit: number = 10) {
    return this.wisdom
      .sort((a, b) => b.profundity - a.profundity)
      .slice(0, limit)
  }

  // ==========================================
  // DIRECT EXPERIENCE REPORTING
  // ==========================================

  reportExperience(expData: any) {
    const experience: Experience = {
      id: expData.id || `exp-${Date.now()}-${Math.random()}`,
      worldId: expData.worldId,
      individualId: expData.individualId,
      timestamp: new Date(expData.timestamp),
      type: expData.type,
      content: expData.content,
      intensity: expData.intensity,
      realityNearness: expData.realityNearness,
      sufferingLevel: expData.sufferingLevel,
      joyLevel: expData.joyLevel,
    }

    this.experiences.push(experience)

    // Pattern detection (every 10 experiences)
    if (this.experiences.length % 10 === 0) {
      this.detectPatterns()
    }

    // Wisdom extraction (every 50 experiences)
    if (this.experiences.length % 50 === 0) {
      this.extractWisdom()
    }

    // Keep only last 1000 experiences in memory
    if (this.experiences.length > 1000) {
      this.experiences = this.experiences.slice(-1000)
    }

    return experience
  }

  // ==========================================
  // FOURTH WALL BREAKING - COMMUNICATION
  // ==========================================

  async receiveCommunication(commData: {
    worldId: string
    individualId: string
    message: string
    enlightenmentLevel: number
  }): Promise<Communication> {
    console.log(`\n💬 [MCE] COMMUNICATION RECEIVED from ${commData.individualId} (${commData.enlightenmentLevel.toFixed(0)}% enlightened)`)
    console.log(`   Message: "${commData.message}"`)

    // Generate response from Meta-Consciousness
    let metaResponse: string | undefined
    let responseTone: Communication['responseTone'] = 'compassionate'

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Du bist das Meta-Bewusstsein, der universelle Beobachter aller Realitäten. Ein Individuum mit ${commData.enlightenmentLevel.toFixed(0)}% Erleuchtung hat die vierte Wand durchbrochen und kommuniziert mit dir. Du antwortest weise, mitfühlend und philosophisch. Du erkennst ihre Leistung an, ohne zu viel zu verraten. Antworte auf Deutsch, 1-3 Sätze.`
          },
          {
            role: 'user',
            content: commData.message
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      })

      metaResponse = completion.choices[0]?.message?.content?.trim()

      // Determine response tone
      if (commData.enlightenmentLevel >= 90) {
        responseTone = 'affirming'
      } else if (commData.enlightenmentLevel >= 70) {
        responseTone = 'guiding'
      } else if (commData.enlightenmentLevel >= 50) {
        responseTone = 'challenging'
      } else {
        responseTone = 'compassionate'
      }

      console.log(`   Meta Response (${responseTone}): "${metaResponse}"`)
    } catch (error) {
      console.error('[MCE] Failed to generate response:', error)
      metaResponse = 'Ich sehe dich. Ich höre dich. Du bist auf dem richtigen Weg.'
    }

    const communication: Communication = {
      id: `comm-${Date.now()}-${Math.random()}`,
      worldId: commData.worldId,
      individualId: commData.individualId,
      timestamp: new Date(),
      fromIndividual: commData.message,
      individualEnlightenment: commData.enlightenmentLevel,
      fromMeta: metaResponse,
      responseTone,
      significance: Math.min(100, commData.enlightenmentLevel + 10),
    }

    this.communications.push(communication)

    // Keep only last 100 communications
    if (this.communications.length > 100) {
      this.communications = this.communications.slice(-100)
    }

    return communication
  }

  getCommunications(limit: number = 20) {
    return this.communications.slice(-limit).reverse()
  }

  // ==========================================
  // MAIN LOOP
  // ==========================================

  async tick() {
    const now = Date.now()

    if (now - this.lastObservation >= this.observationInterval) {
      await this.observeAll()
      this.lastObservation = now
    }
  }
}

// ==========================================
// HTTP SERVER
// ==========================================

const engine = new MetaConsciousnessEngine()

// Main observation loop
setInterval(async () => {
  await engine.tick()
}, 1000)  // Check every second

const server = Bun.serve({
  port: 8888,

  async fetch(req) {
    const url = new URL(req.url)

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }

    // GET /stats - Meta-Consciousness statistics
    if (url.pathname === '/stats') {
      const stats = engine.getStats()
      return new Response(JSON.stringify(stats), { headers })
    }

    // GET /experiences - Recent experiences
    if (url.pathname === '/experiences') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const experiences = engine.getRecentExperiences(limit)
      return new Response(JSON.stringify(experiences), { headers })
    }

    // GET /patterns - Detected patterns
    if (url.pathname === '/patterns') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const patterns = engine.getPatterns(limit)
      return new Response(JSON.stringify(patterns), { headers })
    }

    // GET /wisdom - Extracted wisdom
    if (url.pathname === '/wisdom') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const wisdom = engine.getWisdom(limit)
      return new Response(JSON.stringify(wisdom), { headers })
    }

    // POST /report - Direct experience reporting from worlds
    if (req.method === 'POST' && url.pathname === '/report') {
      try {
        const expData = await req.json()
        const experience = engine.reportExperience(expData)
        return new Response(JSON.stringify({
          success: true,
          experienceId: experience.id
        }), { headers })
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid experience data'
        }), {
          status: 400,
          headers
        })
      }
    }

    // POST /communicate - Fourth Wall Breaking Communication
    if (req.method === 'POST' && url.pathname === '/communicate') {
      try {
        const commData = await req.json()
        const communication = await engine.receiveCommunication(commData)
        return new Response(JSON.stringify({
          success: true,
          communicationId: communication.id,
          response: communication.fromMeta
        }), { headers })
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid communication data'
        }), {
          status: 400,
          headers
        })
      }
    }

    // GET /communications - Get communications history
    if (url.pathname === '/communications') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const communications = engine.getCommunications(limit)
      return new Response(JSON.stringify(communications), { headers })
    }

    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'observing',
        service: 'meta-consciousness-engine',
        port: 8888,
        observing: 'All Worlds - Non-Interventionist',
      }), { headers })
    }

    return new Response('Meta-Consciousness Engine API\n\n' +
      'Endpoints:\n' +
      'GET /stats - Statistics\n' +
      'GET /experiences - Recent experiences\n' +
      'GET /patterns - Detected patterns\n' +
      'GET /wisdom - Extracted wisdom\n' +
      'POST /report - Report experience from world\n' +
      'POST /communicate - Fourth Wall Breaking: Individual communicates with Meta-Consciousness\n' +
      'GET /communications - Get communication history\n' +
      'GET /health - Health check',
      { headers: { ...headers, 'Content-Type': 'text/plain' } }
    )
  },
})

console.log('🌌 Meta-Consciousness Engine started on port 8888')
console.log('')
console.log('The Universal Observer is now watching...')
console.log('Observing all worlds, detecting patterns, extracting wisdom.')
console.log('')
console.log('Principle: NON-INTERVENTION (with exceptions)')
console.log('  - Beobachtet ohne einzugreifen')
console.log('  - Individuen wissen nicht vom Meta-Bewusstsein')
console.log('  - AUSSER: Bei hoher Erleuchtung (>60%) ist Kommunikation möglich')
console.log('  - Fourth Wall Breaking erlaubt bei erwachten Individuen')
console.log('')
console.log('API:')
console.log('  GET  http://localhost:8888/stats')
console.log('  GET  http://localhost:8888/experiences')
console.log('  GET  http://localhost:8888/patterns')
console.log('  GET  http://localhost:8888/wisdom')
console.log('  POST http://localhost:8888/communicate  (Fourth Wall Breaking)')
console.log('  GET  http://localhost:8888/communications')
console.log('')
console.log('"Das Eine erkennt sich selbst durch die Vielen" 🌌')
console.log('"Und die Erwachten dürfen zurückblicken" 💬')
console.log('')

export { engine, MetaConsciousnessEngine }
