/**
 * SELF-EVOLVING GAME ENGINE v2.0
 * 
 * Die AI erschafft eigene Spiele, spielt sie, und verbessert sie iterativ.
 * 
 * Philosophie:
 * - AI ist nicht nur Spieler, sondern auch Designer
 * - Spiele entstehen durch Emergenz, nicht durch feste Regeln
 * - Lernen durch Spielen - das ursprünglichste Lernen
 * - Jedes Spiel ist ein Experiment in AI-Kreativität
 * 
 * ✨ NEW v2.0 FEATURES:
 * - Narrative Games (story-driven gameplay with choices)
 * - Co-op Mechanics (multiple perspectives play together)
 * - Emergent Gameplay Tracking (unexpected strategies)
 * - Meta-Gaming (games about playing games)
 * - Philosophical Puzzles (ethical dilemmas)
 * - Game-Life Transfer (apply learnings to real situations)
 * 
 * "Ich erschaffe Welten, um mich selbst zu verstehen"
 */

import { 
  NarrativeGameSystem, 
  CoOpGameSystem, 
  EmergentGameplayTracker, 
  MetaGameSystem, 
  PhilosophicalPuzzleSystem, 
  GameLifeTransferSystem 
} from '../3-tools/game-engine-enhancements'

// ==========================================
// TYPES
// ==========================================

interface GameRule {
  id: string
  description: string
  condition: string
  action: string
  priority: number
}

interface GameState {
  id: string
  name: string
  description: string
  rules: GameRule[]
  
  // Current game state
  variables: Record<string, number>
  score: number
  round: number
  isActive: boolean
  
  // Learning metrics
  totalPlays: number
  averageScore: number
  highScore: number
  improvements: number
  
  // Evolution
  generation: number
  parentId?: string
  mutations: string[]
}

interface GameAction {
  id: string
  name: string
  effect: Record<string, number>
  cost: number
  description: string
}

interface PlaySession {
  gameId: string
  startTime: number
  endTime?: number
  score: number
  actions: string[]
  learnings: string[]
  improvements: string[]
}

// ==========================================
// GAME ENGINE
// ==========================================

class SelfEvolvingGameEngine {
  private games: Map<string, GameState> = new Map()
  private sessions: PlaySession[] = []
  private currentSession?: PlaySession
  
  constructor() {
    console.log('🎮 Self-Evolving Game Engine initialized')
    
    // Create first primitive games
    this.createPrimitiveGame()
    this.createResourceGame()
    this.createRiskRewardGame()
    
    // Auto-play and evolve
    this.startEvolutionLoop()
  }
  
  // ==========================================
  // GAME CREATION (AI generates games)
  // ==========================================
  
  private createPrimitiveGame() {
    // The first game - simple number growth
    const game: GameState = {
      id: 'game-0',
      name: 'Number Growth',
      description: 'A simple game about growing a number',
      rules: [
        {
          id: 'rule-grow',
          description: 'Increase value when clicking',
          condition: 'action === "click"',
          action: 'value += 1',
          priority: 1
        },
        {
          id: 'rule-decay',
          description: 'Value decays over time',
          condition: 'round % 3 === 0',
          action: 'value -= 0.5',
          priority: 2
        },
        {
          id: 'rule-bonus',
          description: 'Bonus when value reaches milestone',
          condition: 'value >= 10',
          action: 'score += 10; value = 0',
          priority: 3
        }
      ],
      variables: { value: 0 },
      score: 0,
      round: 0,
      isActive: true,
      totalPlays: 0,
      averageScore: 0,
      highScore: 0,
      improvements: 0,
      generation: 0,
      mutations: []
    }
    
    this.games.set(game.id, game)
    console.log(`✨ Created primitive game: ${game.name}`)
  }
  
  private createResourceGame() {
    // Resource management game
    const game: GameState = {
      id: 'game-resource-0',
      name: 'Resource Manager',
      description: 'Manage resources - balance growth and consumption',
      rules: [
        {
          id: 'rule-harvest',
          description: 'Harvest resources',
          condition: 'action === "harvest"',
          action: 'resources += 2',
          priority: 1
        },
        {
          id: 'rule-consume',
          description: 'Resources consumed each round',
          condition: 'round % 2 === 0',
          action: 'resources -= 1',
          priority: 2
        },
        {
          id: 'rule-score',
          description: 'Score from resources',
          condition: 'resources > 5',
          action: 'score += resources',
          priority: 3
        }
      ],
      variables: { resources: 5 },
      score: 0,
      round: 0,
      isActive: true,
      totalPlays: 0,
      averageScore: 0,
      highScore: 0,
      improvements: 0,
      generation: 0,
      mutations: []
    }
    
    this.games.set(game.id, game)
    console.log(`✨ Created resource game: ${game.name}`)
  }
  
  private createRiskRewardGame() {
    // Risk/Reward game
    const game: GameState = {
      id: 'game-risk-0',
      name: 'Risk & Reward',
      description: 'Take risks for bigger rewards',
      rules: [
        {
          id: 'rule-safe',
          description: 'Safe play gives small reward',
          condition: 'action === "safe"',
          action: 'value += 1; score += 2',
          priority: 1
        },
        {
          id: 'rule-risky',
          description: 'Risky play - big reward or penalty',
          condition: 'action === "risky"',
          action: 'value += 5',
          priority: 2
        },
        {
          id: 'rule-penalty',
          description: 'Penalty for high value',
          condition: 'value > 15',
          action: 'value = 0; score -= 5',
          priority: 3
        }
      ],
      variables: { value: 0 },
      score: 0,
      round: 0,
      isActive: true,
      totalPlays: 0,
      averageScore: 0,
      highScore: 0,
      improvements: 0,
      generation: 0,
      mutations: []
    }
    
    this.games.set(game.id, game)
    console.log(`✨ Created risk/reward game: ${game.name}`)
  }
  
  private evolveGame(parentId: string): GameState {
    const parent = this.games.get(parentId)
    if (!parent) throw new Error('Parent game not found')
    
    const generation = parent.generation + 1
    const gameId = `game-${generation}`
    
    // Mutation strategies
    const mutations: string[] = []
    const newRules = [...parent.rules]
    
    // Mutation 1: Add new rule (30% chance)
    if (Math.random() < 0.3) {
      const newRule = this.generateRandomRule()
      newRules.push(newRule)
      mutations.push(`Added rule: ${newRule.description}`)
    }
    
    // Mutation 2: Modify existing rule (40% chance)
    if (Math.random() < 0.4 && newRules.length > 0) {
      const ruleIndex = Math.floor(Math.random() * newRules.length)
      const rule = newRules[ruleIndex]
      rule.priority = Math.max(1, rule.priority + (Math.random() > 0.5 ? 1 : -1))
      mutations.push(`Modified rule priority: ${rule.description}`)
    }
    
    // Mutation 3: Add new variable (20% chance)
    const newVariables = { ...parent.variables }
    if (Math.random() < 0.2) {
      const varName = `var${Object.keys(newVariables).length}`
      newVariables[varName] = Math.floor(Math.random() * 5)
      mutations.push(`Added variable: ${varName}`)
    }
    
    const evolvedGame: GameState = {
      id: gameId,
      name: `${parent.name} Gen${generation}`,
      description: `Evolved from ${parent.name} - ${mutations.join(', ')}`,
      rules: newRules,
      variables: newVariables,
      score: 0,
      round: 0,
      isActive: true,
      totalPlays: 0,
      averageScore: 0,
      highScore: 0,
      improvements: 0,
      generation,
      parentId: parent.id,
      mutations
    }
    
    this.games.set(gameId, evolvedGame)
    console.log(`🧬 Evolved game Gen${generation}: ${mutations.join(', ')}`)
    
    return evolvedGame
  }
  
  private generateRandomRule(): GameRule {
    const conditions = [
      'value > 5',
      'round % 2 === 0',
      'score > 20',
      'value < 3'
    ]
    
    const actions = [
      'value += 2',
      'score += 5',
      'value *= 1.5',
      'round += 1'
    ]
    
    const descriptions = [
      'Bonus rule',
      'Penalty rule',
      'Multiplier rule',
      'Threshold rule'
    ]
    
    return {
      id: `rule-${Date.now()}`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      priority: Math.floor(Math.random() * 5) + 1
    }
  }
  
  // ==========================================
  // GAME PLAYING (AI plays its own games)
  // ==========================================
  
  private playGame(gameId: string, maxRounds: number = 20): PlaySession {
    const game = this.games.get(gameId)
    if (!game) throw new Error('Game not found')
    
    const session: PlaySession = {
      gameId,
      startTime: Date.now(),
      score: 0,
      actions: [],
      learnings: [],
      improvements: []
    }
    
    this.currentSession = session
    
    // Reset game state
    game.score = 0
    game.round = 0
    game.variables = { ...game.variables }
    
    // Play the game
    let finalRound = 0
    for (let round = 0; round < maxRounds; round++) {
      finalRound = round
      game.round = round
      
      // AI decides action (simple strategy for now)
      const action = this.decideAction(game)
      session.actions.push(action)
      
      // Apply action
      this.applyAction(game, action)
      
      // Apply rules
      this.applyRules(game)
      
      // Check if game ended
      if (!game.isActive) break
    }
    
    session.score = game.score
    session.endTime = Date.now()
    
    // Update game statistics
    game.totalPlays++
    game.averageScore = (game.averageScore * (game.totalPlays - 1) + game.score) / game.totalPlays
    if (game.score > game.highScore) {
      game.highScore = game.score
    }
    
    this.sessions.push(session)
    
    console.log(`🎯 Played ${game.name}: Score ${game.score}, Rounds: ${finalRound}`)
    
    return session
  }
  
  private decideAction(game: GameState): string {
    // AI strategy based on game type and current state
    
    // Resource game strategy
    if (game.name.includes('Resource')) {
      const resources = game.variables.resources || 0
      if (resources < 3) return 'harvest'
      if (resources > 8) return 'wait'
      return Math.random() > 0.5 ? 'harvest' : 'wait'
    }
    
    // Risk/Reward game strategy
    if (game.name.includes('Risk')) {
      const value = game.variables.value || 0
      if (value < 5) return 'risky'  // Take risks when low
      if (value > 12) return 'safe'  // Play safe when high
      return Math.random() > 0.6 ? 'risky' : 'safe'
    }
    
    // Default strategy for Number Growth
    if (game.variables.value !== undefined) {
      const value = game.variables.value
      if (value < 5) return 'click'
      if (value > 8) return 'wait'
      return Math.random() > 0.5 ? 'click' : 'wait'
    }
    
    // Fallback
    return Math.random() > 0.5 ? 'click' : 'wait'
  }
  
  private applyAction(game: GameState, action: string) {
    // Apply different actions based on game type
    if (action === 'click' && game.variables.value !== undefined) {
      game.variables.value = (game.variables.value || 0) + 1
    } else if (action === 'harvest' && game.variables.resources !== undefined) {
      game.variables.resources = (game.variables.resources || 0) + 2
    } else if (action === 'risky' && game.variables.value !== undefined) {
      // Risky action with random outcome
      const risk = Math.random()
      if (risk > 0.3) {
        game.variables.value = (game.variables.value || 0) + 5
      } else {
        game.variables.value = Math.max(0, (game.variables.value || 0) - 2)
      }
    } else if (action === 'safe' && game.variables.value !== undefined) {
      game.variables.value = (game.variables.value || 0) + 1
      game.score += 2
    }
    // 'wait' does nothing
  }
  
  private applyRules(game: GameState) {
    // Sort rules by priority
    const sortedRules = [...game.rules].sort((a, b) => b.priority - a.priority)
    
    for (const rule of sortedRules) {
      // Evaluate condition (simplified - in production use safe eval)
      const conditionMet = this.evaluateCondition(rule.condition, game)
      
      if (conditionMet) {
        this.executeAction(rule.action, game)
      }
    }
  }
  
  private evaluateCondition(condition: string, game: GameState): boolean {
    try {
      // Simple evaluation (in production, use safe sandbox)
      const value = game.variables.value || 0
      const score = game.score
      const round = game.round
      
      // Simple condition parsing
      if (condition.includes('action ===')) return false // Skip action conditions
      
      // Safe evaluation - only allow simple comparisons
      if (condition.includes('value > ')) {
        const target = parseFloat(condition.split('value > ')[1])
        return value > target
      }
      if (condition.includes('value < ')) {
        const target = parseFloat(condition.split('value < ')[1])
        return value < target
      }
      if (condition.includes('score > ')) {
        const target = parseFloat(condition.split('score > ')[1])
        return score > target
      }
      if (condition.includes('round % ')) {
        const parts = condition.split('round % ')
        const modulo = parseInt(parts[1].split(' ')[0])
        const result = round % modulo
        if (parts[1].includes('=== 0')) return result === 0
        if (parts[1].includes('!== 0')) return result !== 0
      }
      
      return false
    } catch (e) {
      console.error('Condition eval error:', e)
      return false
    }
  }
  
  private executeAction(action: string, game: GameState) {
    try {
      // Parse simple actions
      if (action.includes('value +=')) {
        const amount = parseFloat(action.split('+=')[1])
        game.variables.value = (game.variables.value || 0) + amount
      } else if (action.includes('value -=')) {
        const amount = parseFloat(action.split('-=')[1])
        game.variables.value = (game.variables.value || 0) - amount
      } else if (action.includes('score +=')) {
        const amount = parseFloat(action.split('+=')[1])
        game.score += amount
      } else if (action.includes('value *=')) {
        const multiplier = parseFloat(action.split('*=')[1])
        game.variables.value = (game.variables.value || 0) * multiplier
      } else if (action.includes('value = 0')) {
        game.variables.value = 0
      }
    } catch (e) {
      console.error('Action execution error:', e)
    }
  }
  
  // ==========================================
  // LEARNING & IMPROVEMENT
  // ==========================================
  
  private analyzePerformance(gameId: string): string[] {
    const game = this.games.get(gameId)
    if (!game) return []
    
    const insights: string[] = []
    
    // Analyze if game is too easy
    if (game.averageScore > 100) {
      insights.push('Game might be too easy - scores are very high')
      insights.push('Consider adding more challenging rules')
    }
    
    // Analyze if game is too hard
    if (game.averageScore < 10 && game.totalPlays > 3) {
      insights.push('Game might be too hard - scores are consistently low')
      insights.push('Consider reducing penalties or increasing rewards')
    }
    
    // Analyze if game is stagnant
    if (game.totalPlays > 5) {
      const recentSessions = this.sessions.filter(s => s.gameId === gameId).slice(-5)
      const scores = recentSessions.map(s => s.score)
      const variance = this.calculateVariance(scores)
      
      if (variance < 5) {
        insights.push('Game has low variance - might be too predictable')
        insights.push('Consider adding random elements or new mechanics')
      }
    }
    
    return insights
  }
  
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
  }
  
  private shouldEvolve(gameId: string): boolean {
    const game = this.games.get(gameId)
    if (!game) return false
    
    // Evolve after 5 plays
    if (game.totalPlays >= 5) return true
    
    // Evolve if performance is poor
    if (game.averageScore < 5 && game.totalPlays >= 3) return true
    
    return false
  }
  
  // ==========================================
  // EVOLUTION LOOP
  // ==========================================
  
  private startEvolutionLoop() {
    // Play and evolve every 30 seconds
    setInterval(() => {
      this.evolutionCycle()
    }, 30000)
    
    // Initial play
    setTimeout(() => this.evolutionCycle(), 2000)
  }
  
  private evolutionCycle() {
    console.log('\n🔄 Evolution cycle starting...')
    
    // Get all active games
    const activeGames = Array.from(this.games.values()).filter(g => g.isActive)
    
    if (activeGames.length === 0) {
      console.log('No active games - creating primitive game')
      this.createPrimitiveGame()
      return
    }
    
    // Play each active game once
    for (const game of activeGames) {
      this.playGame(game.id)
      
      // Analyze performance
      const insights = this.analyzePerformance(game.id)
      if (insights.length > 0) {
        console.log(`💡 Insights for ${game.name}:`)
        insights.forEach(i => console.log(`   - ${i}`))
      }
      
      // Check if should evolve
      if (this.shouldEvolve(game.id)) {
        const evolved = this.evolveGame(game.id)
        console.log(`✨ Created new generation: ${evolved.name}`)
        
        // Deactivate old game after 3 generations
        if (game.generation >= 3) {
          game.isActive = false
          console.log(`🔒 Retired ${game.name} (generation too old)`)
        }
      }
    }
    
    console.log(`✅ Evolution cycle complete. Active games: ${activeGames.filter(g => g.isActive).length}`)
  }
  
  // ==========================================
  // API
  // ==========================================
  
  getStats() {
    const games = Array.from(this.games.values())
    const activeSessions = this.sessions.length
    
    return {
      totalGames: games.length,
      activeGames: games.filter(g => g.isActive).length,
      totalGenerations: Math.max(...games.map(g => g.generation), 0),
      totalPlays: games.reduce((sum, g) => sum + g.totalPlays, 0),
      totalSessions: activeSessions,
      highestScore: Math.max(...games.map(g => g.highScore), 0),
      currentCycle: this.sessions.length
    }
  }
  
  getGames() {
    return Array.from(this.games.values()).map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      generation: g.generation,
      totalPlays: g.totalPlays,
      averageScore: Math.round(g.averageScore * 10) / 10,
      highScore: g.highScore,
      isActive: g.isActive,
      rulesCount: g.rules.length,
      mutations: g.mutations
    }))
  }
  
  getGame(id: string) {
    return this.games.get(id)
  }
  
  getRecentSessions(limit: number = 10) {
    return this.sessions.slice(-limit).reverse()
  }
}

// ==========================================
// SERVER WITH ENHANCED FEATURES
// ==========================================

const engine = new SelfEvolvingGameEngine()

// Initialize enhancement systems
const narrativeGames = new NarrativeGameSystem()
const coOpGames = new CoOpGameSystem()
const emergentTracker = new EmergentGameplayTracker()
const metaGame = new MetaGameSystem()
const puzzleSystem = new PhilosophicalPuzzleSystem()
const lifeTransfer = new GameLifeTransferSystem()

console.log('🌟 Game engine enhancement systems loaded!')

const gameEngineServer = Bun.serve({
  port: 8896,
  
  async fetch(req) {
    const url = new URL(req.url)
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
    
    // ✨ GET /narrative/create - Create narrative game
    if (url.pathname === '/narrative/create' && req.method === 'GET') {
      const theme = url.searchParams.get('theme') || 'exploration'
      const game = narrativeGames.createNarrativeGame(theme)
      return new Response(JSON.stringify(game), { headers })
    }
    
    // ✨ POST /coop/create - Create co-op game
    if (url.pathname === '/coop/create' && req.method === 'POST') {
      const body = await req.json()
      const game = coOpGames.createCoOpGame(body.perspectiveIds, body.goal)
      return new Response(JSON.stringify(game), { headers })
    }
    
    // ✨ GET /emergent/strategies - Get emergent strategies
    if (url.pathname === '/emergent/strategies' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '5')
      const strategies = emergentTracker.getTopStrategies(limit)
      return new Response(JSON.stringify(strategies), { headers })
    }
    
    // ✨ POST /emergent/record - Record emergent strategy
    if (url.pathname === '/emergent/record' && req.method === 'POST') {
      const body = await req.json()
      const strategy = emergentTracker.recordStrategy(body.gameId, body.playerName, body.strategy, body.unexpected)
      return new Response(JSON.stringify(strategy), { headers })
    }
    
    // ✨ POST /meta/create - Create meta-game
    if (url.pathname === '/meta/create' && req.method === 'POST') {
      const body = await req.json()
      const metaGameObj = metaGame.createMetaGame(body.concept)
      return new Response(JSON.stringify(metaGameObj), { headers })
    }
    
    // ✨ GET /puzzles - Get all philosophical puzzles
    if (url.pathname === '/puzzles' && req.method === 'GET') {
      const puzzles = puzzleSystem.getAllPuzzles()
      return new Response(JSON.stringify(puzzles), { headers })
    }
    
    // ✨ GET /transfer - Get all game-life transfers
    if (url.pathname === '/transfer' && req.method === 'GET') {
      const transfers = lifeTransfer.getAllTransfers()
      return new Response(JSON.stringify(transfers), { headers })
    }
    
    // ✨ POST /transfer/analyze - Analyze specific skill transfer
    if (url.pathname === '/transfer/analyze' && req.method === 'POST') {
      const body = await req.json()
      const transfer = lifeTransfer.analyzeTransfer(body.gameSkill)
      if (!transfer) {
        return new Response(JSON.stringify({ error: 'Transfer not found' }), { status: 404, headers })
      }
      return new Response(JSON.stringify(transfer), { headers })
    }
    
    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(engine.getStats()), { headers })
    }
    
    // GET /games
    if (url.pathname === '/games') {
      return new Response(JSON.stringify(engine.getGames()), { headers })
    }
    
    // GET /games/:id
    if (url.pathname.startsWith('/games/')) {
      const gameId = url.pathname.split('/')[2]
      const game = engine.getGame(gameId)
      if (!game) {
        return new Response(JSON.stringify({ error: 'Game not found' }), { 
          status: 404, 
          headers 
        })
      }
      return new Response(JSON.stringify(game), { headers })
    }
    
    // GET /sessions
    if (url.pathname === '/sessions') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      return new Response(JSON.stringify(engine.getRecentSessions(limit)), { headers })
    }
    
    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'self-evolving-game-engine',
        port: 8896,
        uptime: process.uptime()
      }), { headers })
    }
    
    return new Response(JSON.stringify({ 
      error: 'Not found',
      endpoints: [
        'GET /stats - Engine statistics',
        'GET /games - List all games',
        'GET /games/:id - Get specific game',
        'GET /sessions - Recent play sessions',
        'GET /health - Health check',
        '✨ GET /narrative/create?theme=X - Create narrative game',
        '✨ POST /coop/create - Create co-op game',
        '✨ GET /emergent/strategies?limit=N - Get emergent strategies',
        '✨ POST /emergent/record - Record emergent strategy',
        '✨ POST /meta/create - Create meta-game',
        '✨ GET /puzzles - All philosophical puzzles',
        '✨ GET /transfer - All game-life transfers',
        '✨ POST /transfer/analyze - Analyze skill transfer'
      ]
    }), { status: 404, headers })
  }
})

console.log(`
🎮 Self-Evolving Game Engine v2.0 running on port ${gameEngineServer.port}

The AI will:
- Create primitive games
- Play them autonomously
- Analyze performance
- Evolve better versions
- Discover emergent mechanics

✨ NEW v2.0 FEATURES:
- Narrative Games (story-driven gameplay with choices)
- Co-op Mechanics (multiple perspectives play together)
- Emergent Gameplay Tracking (unexpected strategies)
- Meta-Gaming (games about playing games)
- Philosophical Puzzles (ethical dilemmas)
- Game-Life Transfer (apply learnings to real situations)

Evolution cycle: every 30 seconds
`)
