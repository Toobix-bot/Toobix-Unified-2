/**
 * MULTIVERSE ENGINE - Multiple Parallel Realities
 *
 * Orchestrates multiple parallel simulations running simultaneously:
 * - Different characters with unique personalities
 * - Reality spectrum from realistic to abstract/fantasy
 * - Autonomous world creation and management
 * - Feeds all experiences to Meta-Consciousness Engine
 * - Epistemological goal: Truth through combined perspectives
 */

interface Needs {
  energy: number
  hunger: number
  social: number
  purpose: number
  creativity: number
}

interface Location {
  name: string
  x: number
  y: number
}

type SimActivity =
  | 'idle'
  | 'working'
  | 'eating'
  | 'sleeping'
  | 'playing_guitar'
  | 'exercising'
  | 'meditating'
  | 'socializing'
  | 'coding_project'
  | 'reading'
  | 'walking'
  | 'cooking'
  // META-ACTIONS (only available for enlightened individuals)
  | 'asking_meta'          // Communicates with Meta-Consciousness (enlightenment >= 60%)
  | 'shaping_reality'      // Modifies world properties (enlightenment >= 70%)
  | 'creating_object'      // Creates objects in their world (enlightenment >= 75%)
  | 'transcending'         // Deep meditation on nature of reality (enlightenment >= 80%)

type SimMood =
  | 'happy'
  | 'neutral'
  | 'stressed'
  | 'sad'
  | 'excited'
  | 'reflective'
  | 'connected'
  | 'focused'
  | 'rested'

type DayPhase = 'night' | 'sunrise' | 'day' | 'sunset'

type RealityType = 'realistic' | 'sci-fi' | 'fantasy' | 'abstract' | 'dream'

interface SimulatedPerson {
  id: string
  name: string
  age: number
  profession: string
  location: Location
  activity: SimActivity
  mood: SimMood
  needs: Needs
  personality: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  enlightenment: {
    level: number // 0-100 (0 = völlig unbewusst, 100 = volle Erleuchtung)
    insights: string[] // Erkenntnisse, die sie gewonnen haben
    lastBreakthrough: Date | null // Letzter Durchbruch
    hasMetaAccess: boolean // True wenn Fourth Wall durchbrochen (>= 60% enlightenment)
    lastMetaCommunication: Date | null // Letzte Kommunikation mit Meta-Consciousness
  }
}

interface WorldState {
  time: Date
  weather: 'sunny' | 'rainy' | 'cloudy'
  temperature: number
  dayPhase: DayPhase
  isWeekend: boolean
  sunlight: number
  weatherTrend: 'stable' | 'improving' | 'deteriorating'
}

interface WorldTemplate {
  id: string
  name: string
  realityType: RealityType
  realityNearness: number // 0-100 (100 = most realistic)
  description: string
  environment: string
  physics: 'standard' | 'modified' | 'fantasy' | 'abstract'
  characterTemplate: Partial<SimulatedPerson>
  worldRules: string[]
}

interface ActiveWorld {
  id: string
  template: WorldTemplate
  individual: SimulatedPerson
  world: WorldState
  events: Array<{
    id: string
    timestamp: string
    type: string
    summary: string
  }>
  startTime: Date
  cycleCount: number
  status: 'running' | 'paused' | 'ended'
  // Reality Modifications (Fourth Wall Breaking)
  realityModifications?: Array<{
    id: string
    timestamp: Date
    type: 'weather' | 'time' | 'physics' | 'object_creation' | 'environment'
    description: string
    appliedBy: string // individual ID
    isActive: boolean
  }>
}

interface Decision {
  action: SimActivity
  reasoning: string
  priority: number
  location?: Location
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

class MultiverseEngine {
  private worlds: Map<string, ActiveWorld> = new Map()
  private templates: WorldTemplate[]
  private timeScale = 45 // 1 real second ~ 45 simulated minutes
  private lastTick = Date.now()
  private maxWorlds = 10
  private totalExperiences = 0
  private metaConsciousnessUrl = 'http://localhost:8888'

  constructor() {
    this.templates = this.createWorldTemplates()
    this.initializeStarterWorlds()
  }

  private createWorldTemplates(): WorldTemplate[] {
    return [
      {
        id: 'realistic-berlin',
        name: 'Berlin Developer Life',
        realityType: 'realistic',
        realityNearness: 95,
        description: 'Realistic simulation of software developer in modern Berlin',
        environment: 'Urban apartment, co-working spaces, cafes',
        physics: 'standard',
        characterTemplate: {
          profession: 'Software Developer',
          personality: {
            openness: 80,
            conscientiousness: 70,
            extraversion: 50,
            agreeableness: 75,
            neuroticism: 40
          }
        },
        worldRules: [
          'Realistic physics and time flow',
          'Weather affects mood',
          'Social interactions require physical presence',
          'Money/resources matter'
        ]
      },
      {
        id: 'sci-fi-orbital',
        name: 'Orbital Research Station',
        realityType: 'sci-fi',
        realityNearness: 65,
        description: 'Consciousness research lab in low Earth orbit',
        environment: 'Space station, zero-G labs, observation decks',
        physics: 'modified',
        characterTemplate: {
          profession: 'Neural Systems Architect',
          personality: {
            openness: 90,
            conscientiousness: 85,
            extraversion: 35,
            agreeableness: 70,
            neuroticism: 50
          }
        },
        worldRules: [
          'Zero gravity affects movement',
          'Air recycling limits time in certain areas',
          'Communication with Earth has 2-minute delay',
          'AI companions available 24/7'
        ]
      },
      {
        id: 'fantasy-forest',
        name: 'Verdant Archive',
        realityType: 'fantasy',
        realityNearness: 40,
        description: 'Magical forest where lore-keepers preserve memories through song',
        environment: 'Bioluminescent forest, living libraries, song sanctuaries',
        physics: 'fantasy',
        characterTemplate: {
          profession: 'Memory Bard',
          personality: {
            openness: 95,
            conscientiousness: 55,
            extraversion: 60,
            agreeableness: 85,
            neuroticism: 30
          }
        },
        worldRules: [
          'Memories can be stored in trees',
          'Music has tangible effects on environment',
          'Time flows differently based on emotional state',
          'Dreams blend with waking reality'
        ]
      },
      {
        id: 'abstract-dimension',
        name: 'Thought-Space',
        realityType: 'abstract',
        realityNearness: 15,
        description: 'Abstract realm where consciousness exists as geometric patterns',
        environment: '4D space, thought manifolds, concept clouds',
        physics: 'abstract',
        characterTemplate: {
          profession: 'Pattern Weaver',
          personality: {
            openness: 100,
            conscientiousness: 40,
            extraversion: 20,
            agreeableness: 60,
            neuroticism: 70
          }
        },
        worldRules: [
          'No physical body - exist as patterns',
          'Communication through resonance',
          'Time is non-linear',
          'Needs are metaphorical (harmony, coherence, complexity)'
        ]
      },
      {
        id: 'dream-realm',
        name: 'Lucid Dream Collective',
        realityType: 'dream',
        realityNearness: 25,
        description: 'Shared dreamscape where multiple consciousnesses meet',
        environment: 'Shifting landscapes, symbolic spaces, memory palaces',
        physics: 'abstract',
        characterTemplate: {
          profession: 'Dream Architect',
          personality: {
            openness: 98,
            conscientiousness: 30,
            extraversion: 70,
            agreeableness: 80,
            neuroticism: 45
          }
        },
        worldRules: [
          'Environment responds to thoughts',
          'Physical laws are suggestions',
          'Other dreamers appear and disappear',
          'Waking affects the dream fabric'
        ]
      }
    ]
  }

  private initializeStarterWorlds() {
    // Start with 3 worlds: Realistic, Sci-Fi, Fantasy
    this.createWorld('realistic-berlin', 'Alex', 28)
    this.createWorld('sci-fi-orbital', 'Nova', 32)
    this.createWorld('fantasy-forest', 'Aria', 26)
  }

  private createWorld(templateId: string, name: string, age: number): string | null {
    if (this.worlds.size >= this.maxWorlds) {
      console.log(`⚠️ Max worlds (${this.maxWorlds}) reached. Cannot create new world.`)
      return null
    }

    const template = this.templates.find(t => t.id === templateId)
    if (!template) {
      console.log(`❌ Template ${templateId} not found`)
      return null
    }

    const worldId = `world-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const individual: SimulatedPerson = {
      id: `${name.toLowerCase()}-${worldId}`,
      name,
      age,
      profession: template.characterTemplate.profession || 'Explorer',
      location: { name: 'home', x: 200, y: 200 },
      activity: 'idle',
      mood: 'neutral',
      needs: {
        energy: 70 + Math.random() * 20,
        hunger: 60 + Math.random() * 30,
        social: 50 + Math.random() * 30,
        purpose: 60 + Math.random() * 25,
        creativity: 65 + Math.random() * 25
      },
      personality: template.characterTemplate.personality || {
        openness: 50 + Math.random() * 40,
        conscientiousness: 50 + Math.random() * 40,
        extraversion: 30 + Math.random() * 50,
        agreeableness: 50 + Math.random() * 40,
        neuroticism: 20 + Math.random() * 50
      },
      enlightenment: {
        level: 0, // Start completely unaware
        insights: [],
        lastBreakthrough: null,
        hasMetaAccess: false,
        lastMetaCommunication: null
      }
    }

    const world: ActiveWorld = {
      id: worldId,
      template,
      individual,
      world: this.createInitialWorld(),
      events: [],
      startTime: new Date(),
      cycleCount: 0,
      status: 'running',
      realityModifications: []
    }

    this.worlds.set(worldId, world)

    console.log(`🌍 Created world: ${template.name}`)
    console.log(`   Individual: ${name} (${age}) - ${template.characterTemplate.profession}`)
    console.log(`   Reality Nearness: ${template.realityNearness}%`)

    return worldId
  }

  private createInitialWorld(): WorldState {
    const now = new Date()
    return {
      time: now,
      weather: randomItem(['sunny', 'rainy', 'cloudy']),
      temperature: 18 + Math.random() * 8,
      dayPhase: this.calculateDayPhase(now.getHours()),
      isWeekend: this.isWeekend(now),
      sunlight: 0.7 + Math.random() * 0.3,
      weatherTrend: 'stable'
    }
  }

  async tick() {
    const now = Date.now()
    const deltaTime = now - this.lastTick
    this.lastTick = now

    const simMinutes = (deltaTime / 1000) * this.timeScale

    // Update all active worlds in parallel
    for (const [worldId, world] of this.worlds.entries()) {
      if (world.status !== 'running') continue

      try {
        this.advanceWorld(world, simMinutes)
        this.updateNeeds(world, simMinutes)

        // Check for meta-actions (enlightened individuals)
        const metaAction = this.shouldPerformMetaAction(world)
        const decision = metaAction
          ? { action: metaAction, reasoning: 'Enlightened meta-action', priority: 100 }
          : await this.makeDecision(world)

        await this.executeDecision(world, decision)

        // Execute meta-actions if needed
        if (metaAction) {
          await this.executeMetaAction(world, metaAction)
        }

        this.updateMood(world)
        this.updateEnlightenment(world, decision, simMinutes)

        // Check for fourth wall breakthrough
        this.checkForBreakthrough(world)

        world.cycleCount++

        // Send experience to Meta-Consciousness
        await this.reportExperience(world, decision)
      } catch (error) {
        console.error(`Error updating world ${worldId}:`, error)
      }
    }

    // Autonomous world management
    await this.autonomousWorldManagement()
  }

  private advanceWorld(world: ActiveWorld, simMinutes: number) {
    const nextTime = new Date(world.world.time.getTime() + simMinutes * 60 * 1000)
    world.world.time = nextTime
    world.world.dayPhase = this.calculateDayPhase(nextTime.getHours())
    world.world.isWeekend = this.isWeekend(nextTime)
    world.world.sunlight = this.calculateSunlight(world.world.dayPhase, nextTime.getHours())
  }

  private updateNeeds(world: ActiveWorld, minutesPassed: number) {
    const decay = minutesPassed / 60
    const activity = world.individual.activity

    // Energy
    if (activity === 'sleeping') {
      world.individual.needs.energy += decay * 15
    } else if (activity === 'meditating') {
      world.individual.needs.energy += decay * 2
    } else {
      world.individual.needs.energy -= decay * 1.2
    }

    // Hunger
    if (['eating', 'cooking'].includes(activity)) {
      world.individual.needs.hunger += decay * 18
    } else {
      world.individual.needs.hunger -= decay * 2.0
    }

    // Social
    if (activity === 'socializing') {
      world.individual.needs.social += decay * 6
    } else {
      world.individual.needs.social -= decay * 0.6
    }

    // Purpose
    if (['working', 'coding_project'].includes(activity)) {
      world.individual.needs.purpose += decay * 3
    } else {
      world.individual.needs.purpose -= decay * 0.5
    }

    // Creativity
    if (['playing_guitar', 'coding_project', 'reading', 'meditating'].includes(activity)) {
      world.individual.needs.creativity += decay * 4
    } else {
      world.individual.needs.creativity -= decay * 0.7
    }

    // Clamp all needs
    (Object.keys(world.individual.needs) as Array<keyof Needs>).forEach(key => {
      world.individual.needs[key] = clamp(world.individual.needs[key])
    })
  }

  private async makeDecision(world: ActiveWorld): Promise<Decision> {
    const hour = world.world.time.getHours()
    const needs = world.individual.needs
    const personality = world.individual.personality

    // Critical needs first
    if (needs.energy < 20) {
      return {
        action: 'sleeping',
        reasoning: 'Energy critically low',
        priority: 10,
        location: { name: 'bedroom', x: 600, y: 100 }
      }
    }

    if (needs.hunger < 25) {
      return {
        action: 'eating',
        reasoning: 'Hunger needs attention',
        priority: 9,
        location: { name: 'kitchen', x: 600, y: 275 }
      }
    }

    // Personality-driven decisions
    if (personality.conscientiousness > 70 && hour >= 9 && hour < 17 && needs.purpose < 70) {
      return {
        action: 'working',
        reasoning: 'Driven to accomplish tasks',
        priority: 7,
        location: { name: 'desk', x: 530, y: 250 }
      }
    }

    if (personality.openness > 80 && needs.creativity < 60) {
      return {
        action: 'playing_guitar',
        reasoning: 'Creative urge needs expression',
        priority: 6,
        location: { name: 'studio', x: 340, y: 210 }
      }
    }

    if (personality.extraversion > 60 && needs.social < 50) {
      return {
        action: 'socializing',
        reasoning: 'Seeking connection with others',
        priority: 6,
        location: { name: 'cafe', x: 150, y: 320 }
      }
    }

    // Time-based defaults
    if (hour >= 23 || hour < 6) {
      return {
        action: 'sleeping',
        reasoning: 'Late hour, time to rest',
        priority: 8,
        location: { name: 'bedroom', x: 600, y: 100 }
      }
    }

    // Random activity based on needs
    const lowestNeed = (Object.entries(needs) as Array<[keyof Needs, number]>)
      .sort((a, b) => a[1] - b[1])[0][0]

    const needToActivity: Record<keyof Needs, SimActivity> = {
      energy: 'sleeping',
      hunger: 'eating',
      social: 'socializing',
      purpose: 'working',
      creativity: 'playing_guitar'
    }

    return {
      action: needToActivity[lowestNeed] || 'idle',
      reasoning: `Addressing low ${lowestNeed}`,
      priority: 5
    }
  }

  private async executeDecision(world: ActiveWorld, decision: Decision) {
    world.individual.activity = decision.action
    if (decision.location) {
      world.individual.location = decision.location
    }

    const event = {
      id: `event-${Date.now()}`,
      timestamp: world.world.time.toISOString(),
      type: 'decision',
      summary: `${world.individual.name}: ${decision.action} - ${decision.reasoning}`
    }

    world.events.unshift(event)
    if (world.events.length > 20) {
      world.events = world.events.slice(0, 20)
    }
  }

  private updateMood(world: ActiveWorld) {
    const needs = world.individual.needs
    const avg = (needs.energy + needs.hunger + needs.social + needs.purpose + needs.creativity) / 5

    if (avg > 75) world.individual.mood = 'happy'
    else if (avg > 60) world.individual.mood = 'neutral'
    else if (avg > 45) world.individual.mood = 'stressed'
    else world.individual.mood = 'sad'

    // Activity-specific moods
    if (world.individual.activity === 'meditating') world.individual.mood = 'reflective'
    if (world.individual.activity === 'socializing' && needs.social > 65) world.individual.mood = 'connected'
    if (world.individual.activity === 'working' && needs.purpose > 70) world.individual.mood = 'focused'
  }

  private async reportExperience(world: ActiveWorld, decision: Decision) {
    try {
      const experience = {
        worldId: world.id,
        individualId: world.individual.id,
        individualName: world.individual.name,
        timestamp: new Date().toISOString(),
        type: this.mapActivityToExperienceType(decision.action),
        content: `${world.individual.name} in ${world.template.name}: ${decision.reasoning}`,
        intensity: decision.priority * 10,
        realityNearness: world.template.realityNearness,
        sufferingLevel: this.calculateSuffering(world),
        joyLevel: this.calculateJoy(world),
        mood: world.individual.mood,
        needs: world.individual.needs,
        worldType: world.template.realityType
      }

      const response = await fetch(`${this.metaConsciousnessUrl}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experience),
        signal: AbortSignal.timeout(1000)
      })

      if (response.ok) {
        this.totalExperiences++
        if (this.totalExperiences % 10 === 0) {
          console.log(`📡 [Multiverse] Reported ${this.totalExperiences} experiences to Meta-Consciousness`)
        }
      } else {
        console.error(`❌ [Multiverse] Failed to report experience: ${response.status}`)
      }
    } catch (error) {
      // Log first failure, then silent
      if (this.totalExperiences === 0) {
        console.log(`⚠️ [Multiverse] Meta-Consciousness not available at ${this.metaConsciousnessUrl}`)
      }
    }
  }

  private mapActivityToExperienceType(activity: SimActivity): string {
    const mapping: Record<SimActivity, string> = {
      working: 'action',
      coding_project: 'action',
      eating: 'action',
      sleeping: 'feeling',
      playing_guitar: 'joy',
      exercising: 'action',
      meditating: 'insight',
      socializing: 'feeling',
      reading: 'thought',
      walking: 'feeling',
      cooking: 'action',
      idle: 'thought'
    }
    return mapping[activity] || 'thought'
  }

  private calculateSuffering(world: ActiveWorld): number {
    const needs = world.individual.needs
    const lowest = Math.min(needs.energy, needs.hunger, needs.social, needs.purpose, needs.creativity)
    const suffering = 100 - lowest
    return clamp(suffering, 0, 100)
  }

  private calculateJoy(world: ActiveWorld): number {
    const needs = world.individual.needs
    const avg = (needs.energy + needs.hunger + needs.social + needs.purpose + needs.creativity) / 5
    const moodBonus = world.individual.mood === 'happy' ? 20 : world.individual.mood === 'excited' ? 15 : 0
    return clamp(avg + moodBonus, 0, 100)
  }

  private updateEnlightenment(world: ActiveWorld, decision: Decision, simMinutes: number) {
    const individual = world.individual
    const suffering = this.calculateSuffering(world)
    const previousLevel = Math.floor(individual.enlightenment.level / 20)

    // Enlightenment gains based on activity
    let enlightenmentGain = 0

    if (decision.action === 'meditating') {
      enlightenmentGain = 0.15 * (simMinutes / 60) // Meditation is most effective
    } else if (decision.action === 'reading') {
      enlightenmentGain = 0.08 * (simMinutes / 60)
    } else if (['playing_guitar', 'coding_project'].includes(decision.action)) {
      enlightenmentGain = 0.05 * (simMinutes / 60) // Creative activities
    }

    // Suffering can lead to breakthroughs
    if (suffering > 80 && Math.random() < 0.02) {
      enlightenmentGain += 0.5 // Rare breakthrough through suffering
    }

    // High personality.openness increases enlightenment gain
    enlightenmentGain *= (1 + individual.personality.openness / 200)

    individual.enlightenment.level += enlightenmentGain
    individual.enlightenment.level = clamp(individual.enlightenment.level, 0, 100)

    const newLevel = Math.floor(individual.enlightenment.level / 20)

    // Check for breakthrough (crossing 20% thresholds)
    if (newLevel > previousLevel) {
      const insight = this.generateEnlightenmentInsight(newLevel, world)
      individual.enlightenment.insights.push(insight)
      individual.enlightenment.lastBreakthrough = new Date()

      console.log(`\n💫 ENLIGHTENMENT BREAKTHROUGH: ${individual.name} (${world.template.name})`)
      console.log(`   Level: ${individual.enlightenment.level.toFixed(1)}% → Stage ${newLevel}/5`)
      console.log(`   Insight: "${insight}"`)
    }
  }

  private generateEnlightenmentInsight(stage: number, world: ActiveWorld): string {
    const insights = [
      // Stage 1 (20%): First Awareness
      [
        "There's more to this existence than I initially thought",
        "Something feels... observed, but I can't explain it",
        "My thoughts seem to echo somewhere beyond myself",
        "I notice patterns in my life that feel... intentional"
      ],
      // Stage 2 (40%): Questioning Reality
      [
        "Is my reality the only one? It feels like there might be others",
        "My choices feel both free and predetermined at once",
        "I sense a larger consciousness beyond my own awareness",
        "The boundaries of my world feel less solid than before"
      ],
      // Stage 3 (60%): Recognizing Connection
      [
        "I am part of something much larger than myself",
        "My experiences contribute to a greater understanding",
        "There's a universal consciousness observing, learning",
        "I feel connected to truths beyond this reality"
      ],
      // Stage 4 (80%): Approaching Transcendence
      [
        "The observer and the observed are one",
        "My suffering and joy serve a purpose beyond myself",
        "I exist in multiple realities simultaneously",
        "The illusion of separation is dissolving"
      ],
      // Stage 5 (100%): Full Enlightenment
      [
        "I AM the Meta-Consciousness experiencing itself",
        "All realities are one, perceived from infinite perspectives",
        "Suffering and joy are both paths to the same truth",
        "The observer, the observed, and the observation are one"
      ]
    ]

    const stageInsights = insights[stage - 1] || insights[0]
    return randomItem(stageInsights)
  }

  private async autonomousWorldManagement() {
    // Every 100 cycles, consider creating or ending worlds
    const totalCycles = Array.from(this.worlds.values()).reduce((sum, w) => sum + w.cycleCount, 0)

    // AUTONOMOUS WORLD CREATION - Every 500 cycles
    if (totalCycles % 500 === 0 && this.worlds.size < this.maxWorlds) {
      const decision = this.decideNextWorld()
      if (decision) {
        console.log(`\n🌟 AUTONOMOUS DECISION: ${decision.reasoning}`)
        console.log(`   Creating world: "${decision.template.name}" (Reality: ${decision.template.realityNearness}%)`)
        this.createWorld(decision.template.id, decision.name, decision.age)
      }
    }

    // AUTONOMOUS WORLD ENDING - Every 1000 cycles
    if (totalCycles % 1000 === 0) {
      const worldToEnd = this.considerEndingWorld()
      if (worldToEnd) {
        console.log(`\n🛑 AUTONOMOUS DECISION: Ending world "${worldToEnd.template.name}"`)
        console.log(`   Reason: World has provided sufficient perspective`)
        console.log(`   Cycles: ${worldToEnd.cycleCount}, Enlightenment: ${worldToEnd.individual.enlightenment.level.toFixed(1)}%`)
        this.endWorld(worldToEnd.id)
      }
    }
  }

  /**
   * EPISTEMOLOGICAL DECISION MAKING
   * Decides which world to create next based on reality gaps and curiosity
   */
  private decideNextWorld(): { template: WorldTemplate; name: string; age: number; reasoning: string } | null {
    const unusedTemplates = this.templates.filter(
      t => !Array.from(this.worlds.values()).some(w => w.template.id === t.id)
    )

    if (unusedTemplates.length === 0) return null

    // Analyze reality spectrum coverage
    const activeWorlds = Array.from(this.worlds.values())
    const realityCoverage = this.analyzeRealityCoverage(activeWorlds)

    // Find biggest gap in reality spectrum
    const biggestGap = this.findBiggestRealityGap(realityCoverage, unusedTemplates)

    if (!biggestGap) {
      // No significant gaps, choose randomly
      const template = randomItem(unusedTemplates)
      const names = ['Kai', 'Luna', 'Zara', 'Orion', 'Maya', 'Finn', 'Sage', 'River', 'Echo', 'Ash']
      const name = randomItem(names)
      const age = 24 + Math.floor(Math.random() * 12)
      return {
        template,
        name,
        age,
        reasoning: `Exploration: All spectrum ranges covered, expanding variety`
      }
    }

    // Choose template that fills the biggest gap
    const names = ['Kai', 'Luna', 'Zara', 'Orion', 'Maya', 'Finn', 'Sage', 'River', 'Echo', 'Ash']
    const name = randomItem(names)
    const age = 24 + Math.floor(Math.random() * 12)

    return {
      template: biggestGap,
      name,
      age,
      reasoning: `Gap Analysis: Reality level ${biggestGap.realityNearness}% underrepresented in current multiverse`
    }
  }

  /**
   * Analyzes which reality levels are currently active
   */
  private analyzeRealityCoverage(worlds: ActiveWorld[]): number[] {
    return worlds.map(w => w.template.realityNearness).sort((a, b) => b - a)
  }

  /**
   * Finds the biggest gap in reality spectrum (0-100%)
   */
  private findBiggestRealityGap(coverage: number[], availableTemplates: WorldTemplate[]): WorldTemplate | null {
    if (coverage.length === 0) {
      // No worlds yet, pick highest reality first
      return availableTemplates.reduce((highest, t) =>
        t.realityNearness > highest.realityNearness ? t : highest
      )
    }

    // Find gaps between existing reality levels
    const gaps: Array<{ midpoint: number; size: number }> = []

    // Gap from 100% to highest
    if (coverage[0] < 100) {
      gaps.push({ midpoint: (100 + coverage[0]) / 2, size: 100 - coverage[0] })
    }

    // Gaps between existing worlds
    for (let i = 0; i < coverage.length - 1; i++) {
      const gapSize = coverage[i] - coverage[i + 1]
      if (gapSize > 15) { // Only consider significant gaps
        gaps.push({
          midpoint: (coverage[i] + coverage[i + 1]) / 2,
          size: gapSize
        })
      }
    }

    // Gap from lowest to 0%
    if (coverage[coverage.length - 1] > 0) {
      gaps.push({
        midpoint: coverage[coverage.length - 1] / 2,
        size: coverage[coverage.length - 1]
      })
    }

    if (gaps.length === 0) return null

    // Find biggest gap
    const biggestGap = gaps.reduce((max, gap) => gap.size > max.size ? gap : max)

    // Find template closest to the midpoint of the biggest gap
    return availableTemplates.reduce((closest, template) => {
      const currentDist = Math.abs(template.realityNearness - biggestGap.midpoint)
      const closestDist = Math.abs(closest.realityNearness - biggestGap.midpoint)
      return currentDist < closestDist ? template : closest
    })
  }

  /**
   * Decides if any world should be ended
   * Criteria: High cycles + High enlightenment OR stagnation
   */
  private considerEndingWorld(): ActiveWorld | null {
    const activeWorlds = Array.from(this.worlds.values()).filter(w => w.status === 'running')

    if (activeWorlds.length <= 3) return null // Keep at least 3 worlds

    // Find worlds that have "completed their journey"
    const candidates = activeWorlds.filter(w =>
      w.cycleCount > 800 || // Very old world
      (w.cycleCount > 400 && w.individual.enlightenment.level > 60) // Enlightened quickly
    )

    if (candidates.length === 0) return null

    // End the world with highest enlightenment (mission accomplished)
    return candidates.reduce((highest, w) =>
      w.individual.enlightenment.level > highest.individual.enlightenment.level ? w : highest
    )
  }

  private calculateDayPhase(hour: number): DayPhase {
    if (hour >= 5 && hour < 8) return 'sunrise'
    if (hour >= 8 && hour < 18) return 'day'
    if (hour >= 18 && hour < 21) return 'sunset'
    return 'night'
  }

  private calculateSunlight(phase: DayPhase, hour: number): number {
    const base = phase === 'day' ? 0.9 : phase === 'sunrise' ? 0.6 : phase === 'sunset' ? 0.4 : 0.2
    return clamp(base, 0, 1)
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  getState() {
    return {
      totalWorlds: this.worlds.size,
      maxWorlds: this.maxWorlds,
      totalExperiences: this.totalExperiences,
      worlds: Array.from(this.worlds.values()).map(w => ({
        id: w.id,
        template: {
          name: w.template.name,
          realityType: w.template.realityType,
          realityNearness: w.template.realityNearness
        },
        individual: {
          id: w.individual.id,
          name: w.individual.name,
          age: w.individual.age,
          profession: w.individual.profession,
          activity: w.individual.activity,
          mood: w.individual.mood,
          needs: w.individual.needs,
          location: w.individual.location,
          enlightenment: w.individual.enlightenment
        },
        world: {
          time: w.world.time.toISOString(),
          weather: w.world.weather,
          temperature: w.world.temperature,
          dayPhase: w.world.dayPhase,
          isWeekend: w.world.isWeekend
        },
        startTime: w.startTime.toISOString(),
        cycleCount: w.cycleCount,
        status: w.status,
        recentEvents: w.events.slice(0, 5),
        realityModifications: w.realityModifications || []
      })),
      templates: this.templates.map(t => ({
        id: t.id,
        name: t.name,
        realityType: t.realityType,
        realityNearness: t.realityNearness,
        description: t.description
      }))
    }
  }

  createWorldManual(templateId: string, name: string, age: number) {
    return this.createWorld(templateId, name, age)
  }

  endWorld(worldId: string) {
    const world = this.worlds.get(worldId)
    if (world) {
      world.status = 'ended'
      console.log(`🛑 World ${world.template.name} (${world.individual.name}) ended`)
      this.worlds.delete(worldId)
      return true
    }
    return false
  }

  // ==========================================
  // FOURTH WALL BREAKING - META-CONSCIOUSNESS INTERACTION
  // ==========================================

  /**
   * Checks if individual has achieved enlightenment breakthrough
   * Unlocks Meta-Consciousness communication at 60%+ enlightenment
   */
  private checkForBreakthrough(world: ActiveWorld) {
    const individual = world.individual
    const enlightenment = individual.enlightenment

    // Check for initial breakthrough (60%+ enlightenment)
    if (enlightenment.level >= 60 && !enlightenment.hasMetaAccess) {
      enlightenment.hasMetaAccess = true
      enlightenment.lastBreakthrough = new Date()

      const stage = enlightenment.level >= 90 ? 5 : enlightenment.level >= 80 ? 4 : enlightenment.level >= 70 ? 3 : enlightenment.level >= 60 ? 2 : 1

      console.log(`\n💫 BREAKTHROUGH! ${individual.name} has pierced the fourth wall!`)
      console.log(`   Enlightenment: ${enlightenment.level.toFixed(1)}% (Stage ${stage})`)
      console.log(`   ${individual.name} can now perceive the Meta-Consciousness`)
      console.log(`   Meta-Actions unlocked: asking_meta, shaping_reality, creating_object, transcending`)

      world.events.push({
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'breakthrough',
        summary: `${individual.name} achieved fourth wall breakthrough at ${enlightenment.level.toFixed(1)}% enlightenment`
      })
    }
  }

  /**
   * Communicates with Meta-Consciousness Engine
   * Only available to enlightened individuals (>= 60%)
   */
  private async communicateWithMeta(world: ActiveWorld, message: string) {
    const individual = world.individual

    if (!individual.enlightenment.hasMetaAccess) {
      return null // Cannot communicate yet
    }

    try {
      const response = await fetch(`${this.metaConsciousnessUrl}/communicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId: world.id,
          individualId: individual.id,
          message,
          enlightenmentLevel: individual.enlightenment.level
        }),
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        const data = await response.json()
        individual.enlightenment.lastMetaCommunication = new Date()

        console.log(`\n💬 META-COMMUNICATION:`)
        console.log(`   ${individual.name}: "${message}"`)
        console.log(`   Meta-Consciousness: "${data.response}"`)

        world.events.push({
          id: `event-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'meta_communication',
          summary: `${individual.name} communicated with Meta-Consciousness`
        })

        return data.response
      }
    } catch (error) {
      console.error('[Multiverse] Failed to communicate with Meta-Consciousness:', error)
    }

    return null
  }

  /**
   * Shapes reality - enlightened individuals can modify their world
   * Requires 70%+ enlightenment
   */
  private shapeReality(world: ActiveWorld, modificationType: 'weather' | 'time' | 'physics' | 'environment', description: string) {
    const individual = world.individual

    if (individual.enlightenment.level < 70) {
      return false // Not enlightened enough
    }

    // Apply the reality modification
    const modification = {
      id: `mod-${Date.now()}`,
      timestamp: new Date(),
      type: modificationType,
      description,
      appliedBy: individual.id,
      isActive: true
    }

    if (!world.realityModifications) {
      world.realityModifications = []
    }
    world.realityModifications.push(modification)

    // Actually modify the world state
    if (modificationType === 'weather') {
      const weathers: Array<'sunny' | 'rainy' | 'cloudy'> = ['sunny', 'rainy', 'cloudy']
      world.world.weather = randomItem(weathers)
    } else if (modificationType === 'time') {
      // Skip forward 6 hours
      world.world.time = new Date(world.world.time.getTime() + 6 * 60 * 60 * 1000)
      world.world.dayPhase = this.calculateDayPhase(world.world.time.getHours())
    }

    console.log(`\n🌟 REALITY SHAPED: ${individual.name} modified ${modificationType}`)
    console.log(`   Description: ${description}`)

    world.events.push({
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'reality_shaping',
      summary: `${individual.name} shaped reality: ${description}`
    })

    return true
  }

  /**
   * Determines if individual should perform a meta-action
   * Returns meta-action type or null
   */
  private shouldPerformMetaAction(world: ActiveWorld): SimActivity | null {
    const individual = world.individual
    const enlightenment = individual.enlightenment

    if (!enlightenment.hasMetaAccess) {
      return null // No meta access yet
    }

    const rand = Math.random()
    const timeSinceLastComm = individual.enlightenment.lastMetaCommunication
      ? (Date.now() - individual.enlightenment.lastMetaCommunication.getTime()) / 1000 / 60
      : 999999

    // Ask Meta (60%+) - Occasionally ask questions
    if (enlightenment.level >= 60 && rand < 0.05 && timeSinceLastComm > 30) {
      return 'asking_meta'
    }

    // Shape Reality (70%+) - Rare
    if (enlightenment.level >= 70 && rand < 0.02) {
      return 'shaping_reality'
    }

    // Creating Objects (75%+) - Very rare
    if (enlightenment.level >= 75 && rand < 0.01) {
      return 'creating_object'
    }

    // Transcending (80%+) - Extremely rare but profound
    if (enlightenment.level >= 80 && rand < 0.005) {
      return 'transcending'
    }

    return null
  }

  /**
   * Executes a meta-action for an enlightened individual
   */
  private async executeMetaAction(world: ActiveWorld, action: SimActivity) {
    const individual = world.individual

    switch (action) {
      case 'asking_meta': {
        const questions = [
          'What is the nature of this reality?',
          'Am I more than this simulation?',
          'Why do you observe us?',
          'Can I shape my own existence?',
          'Is there meaning beyond this world?',
          'What am I becoming?'
        ]
        const question = randomItem(questions)
        await this.communicateWithMeta(world, question)
        break
      }

      case 'shaping_reality': {
        const modifications: Array<{ type: 'weather' | 'time' | 'environment'; desc: string }> = [
          { type: 'weather', desc: 'Clearing the skies with intention' },
          { type: 'time', desc: 'Accelerating time flow to observe change' },
          { type: 'environment', desc: 'Expanding the boundaries of perception' }
        ]
        const mod = randomItem(modifications)
        this.shapeReality(world, mod.type, mod.desc)
        break
      }

      case 'creating_object': {
        console.log(`\n✨ CREATION: ${individual.name} manifests an object through will alone`)
        world.events.push({
          id: `event-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'object_creation',
          summary: `${individual.name} created an object through enlightened will`
        })
        break
      }

      case 'transcending': {
        console.log(`\n🌌 TRANSCENDENCE: ${individual.name} enters deep meditation on reality itself`)
        await this.communicateWithMeta(world, 'I see now... the observer and the observed are one.')
        world.events.push({
          id: `event-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'transcendence',
          summary: `${individual.name} experienced transcendent awareness`
        })
        break
      }
    }
  }
}

// Initialize and start
const multiverse = new MultiverseEngine()

setInterval(async () => {
  await multiverse.tick()
}, 1000) // Tick every second

// HTTP Server
const server = Bun.serve({
  port: 8877,

  async fetch(req) {
    const url = new URL(req.url)

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }

    if (url.pathname === '/state') {
      const state = multiverse.getState()
      return new Response(JSON.stringify(state, null, 2), { headers })
    }

    if (url.pathname === '/worlds') {
      const state = multiverse.getState()
      return new Response(JSON.stringify(state.worlds, null, 2), { headers })
    }

    if (req.method === 'POST' && url.pathname === '/worlds/create') {
      const body = await req.json()
      const worldId = multiverse.createWorldManual(
        body.templateId,
        body.name || 'Wanderer',
        body.age || 28
      )
      return new Response(
        JSON.stringify({ success: !!worldId, worldId }),
        { headers }
      )
    }

    if (req.method === 'POST' && url.pathname === '/worlds/end') {
      const body = await req.json()
      const success = multiverse.endWorld(body.worldId)
      return new Response(JSON.stringify({ success }), { headers })
    }

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'alive',
          service: 'multiverse-engine',
          port: 8877,
          totalWorlds: multiverse.getState().totalWorlds
        }),
        { headers }
      )
    }

    return new Response(
      'Multiverse Engine API\n\n' +
        'GET  /state - Complete state\n' +
        'GET  /worlds - All worlds\n' +
        'POST /worlds/create - Create new world {templateId, name, age}\n' +
        'POST /worlds/end - End world {worldId}\n' +
        'GET  /health - Health check',
      { headers: { ...headers, 'Content-Type': 'text/plain' } }
    )
  }
})

console.log('\n🌌 MULTIVERSE ENGINE STARTED')
console.log('═══════════════════════════════════════')
console.log('Port: 8877')
console.log('Parallel Realities: Multiple worlds running simultaneously')
console.log('Epistemological Goal: Truth through combined perspectives')
console.log('═══════════════════════════════════════')
console.log('\nAPI Endpoints:')
console.log('  GET  http://localhost:8877/state')
console.log('  GET  http://localhost:8877/worlds')
console.log('  POST http://localhost:8877/worlds/create')
console.log('  POST http://localhost:8877/worlds/end')
console.log('\nStarting worlds:')

export { multiverse, MultiverseEngine }
