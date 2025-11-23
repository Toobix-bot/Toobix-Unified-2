/**
 * 🎮🌌 MULTIVERSE REALITY GAMES - Game Engine + Multiverse Fusion
 * 
 * FUSION CONCEPT:
 * - Games werden zu Reality Simulations
 * - Jedes Spiel läuft in einer parallelen Multiverse Reality
 * - Charaktere in der Reality SPIELEN das Spiel
 * - Game Mechanics = Reality Physics
 * - "What if" Szenarien testen durch Game Rules
 * - Results beeinflussen Reality Evolution
 * 
 * BEISPIEL:
 * - Game: "Resource Management Survival"
 * - Reality: Post-Apocalyptic World
 * - Character: Survivor trying to thrive
 * - Game Rule: "Cooperation increases survival by 50%"
 * - Reality Test: Does cooperation really help?
 * - Learning: Emergent social structures form
 * 
 * "Spiele sind Experimente. Realitäten sind Labore."
 */

// ═══════════════════════════════════════════════════════════════
// TYPES - Reality Game Structures
// ═══════════════════════════════════════════════════════════════

interface GameRule {
  id: string
  description: string
  condition: string
  action: string
  priority: number
}

interface RealityGameMechanics {
  id: string
  name: string
  description: string
  rules: GameRule[]
  physics: 'standard' | 'modified' | 'fantasy' | 'abstract'
  objectives: string[]
  winConditions: string[]
  failConditions: string[]
}

interface RealityGameInstance {
  id: string
  gameId: string
  realityId: string
  characterId: string
  mechanics: RealityGameMechanics
  
  // Game State
  score: number
  round: number
  isActive: boolean
  startTime: Date
  endTime?: Date
  
  // Reality Integration
  realitySnapshot: {
    characterState: any
    worldState: any
    relationships: any[]
  }
  
  // Learning
  observations: string[]
  hypotheses: string[]
  conclusions: string[]
  realityImpact: string[]
}

// ═══════════════════════════════════════════════════════════════
// MULTIVERSE REALITY GAMES ENGINE
// ═══════════════════════════════════════════════════════════════

class MultiverseRealityGames {
  private gameEngineUrl = 'http://localhost:8896'
  private multiverseEngineUrl = 'http://localhost:9999' // Multiverse would need service
  private activeGames: Map<string, RealityGameInstance> = new Map()
  private gameResults: RealityGameInstance[] = []
  
  constructor() {
    console.log('🎮🌌 Multiverse Reality Games initializing...\n');
    this.checkConnections();
  }
  
  // ───────────────────────────────────────────────────────────
  // CONNECTION MANAGEMENT
  // ───────────────────────────────────────────────────────────
  
  private async checkConnections() {
    // Check Game Engine
    try {
      const response = await fetch(`${this.gameEngineUrl}/health`, {
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        console.log('✅ Connected to Game Engine (Port 8896)');
      }
    } catch (error) {
      console.log('⚠️ Game Engine offline - games will be simulated locally');
    }
    
    // Multiverse Engine would be checked here if service existed
    console.log('⚠️ Multiverse Engine service not yet created - using simulation mode');
  }
  
  // ───────────────────────────────────────────────────────────
  // GAME CREATION - Convert Game → Reality Simulation
  // ───────────────────────────────────────────────────────────
  
  async createRealityGame(
    gameName: string,
    realityType: 'realistic' | 'sci-fi' | 'fantasy' | 'abstract' | 'dream',
    scenario: string
  ): Promise<RealityGameMechanics> {
    console.log(`\n🎮 Creating Reality Game: ${gameName}`);
    console.log(`   Reality Type: ${realityType}`);
    console.log(`   Scenario: ${scenario}`);
    
    // Fetch game from Game Engine or create locally
    const mechanics = await this.fetchOrCreateGameMechanics(gameName, realityType, scenario);
    
    console.log(`   ✅ Game mechanics created`);
    console.log(`   Rules: ${mechanics.rules.length}`);
    console.log(`   Objectives: ${mechanics.objectives.join(', ')}`);
    
    return mechanics;
  }
  
  private async fetchOrCreateGameMechanics(
    name: string,
    realityType: string,
    scenario: string
  ): Promise<RealityGameMechanics> {
    // Try to fetch from Game Engine
    try {
      const response = await fetch(`${this.gameEngineUrl}/games`, {
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const games = await response.json();
        // Find matching game or use first available
        const gameData = games[0] || null;
        
        if (gameData) {
          console.log(`   📥 Fetched game from Game Engine: ${gameData.name}`);
          
          return {
            id: gameData.id,
            name: gameData.name,
            description: gameData.description,
            rules: gameData.rules || [],
            physics: this.mapRealityTypeToPhysics(realityType),
            objectives: this.generateObjectives(scenario),
            winConditions: this.generateWinConditions(scenario),
            failConditions: this.generateFailConditions(scenario)
          };
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Could not fetch from Game Engine, creating locally`);
    }
    
    // Create locally
    return this.createLocalGameMechanics(name, realityType, scenario);
  }
  
  private createLocalGameMechanics(
    name: string,
    realityType: string,
    scenario: string
  ): RealityGameMechanics {
    return {
      id: `game_${Date.now()}`,
      name,
      description: `Reality simulation game: ${scenario}`,
      rules: this.generateRulesForScenario(scenario),
      physics: this.mapRealityTypeToPhysics(realityType),
      objectives: this.generateObjectives(scenario),
      winConditions: this.generateWinConditions(scenario),
      failConditions: this.generateFailConditions(scenario)
    };
  }
  
  // ───────────────────────────────────────────────────────────
  // REALITY GAME EXECUTION - Run Game in Simulated Reality
  // ───────────────────────────────────────────────────────────
  
  async playRealityGame(
    mechanics: RealityGameMechanics,
    character: { id: string; name: string; traits: any },
    maxRounds: number = 10
  ): Promise<RealityGameInstance> {
    const gameInstance: RealityGameInstance = {
      id: `instance_${Date.now()}`,
      gameId: mechanics.id,
      realityId: `reality_${Date.now()}`,
      characterId: character.id,
      mechanics,
      score: 0,
      round: 0,
      isActive: true,
      startTime: new Date(),
      realitySnapshot: {
        characterState: character,
        worldState: { phase: 'beginning', conditions: 'stable' },
        relationships: []
      },
      observations: [],
      hypotheses: [],
      conclusions: [],
      realityImpact: []
    };
    
    console.log(`\n▶️ Playing Reality Game: ${mechanics.name}`);
    console.log(`   Character: ${character.name}`);
    console.log(`   Max Rounds: ${maxRounds}\n`);
    
    // Simulate game rounds
    for (let round = 1; round <= maxRounds; round++) {
      gameInstance.round = round;
      
      console.log(`   Round ${round}/${maxRounds}:`);
      
      // Apply rules
      for (const rule of mechanics.rules) {
        const applied = this.applyRule(rule, gameInstance);
        if (applied) {
          console.log(`      ✓ Rule applied: ${rule.description}`);
          gameInstance.observations.push(`Round ${round}: ${rule.description}`);
        }
      }
      
      // Update score
      const roundScore = Math.floor(Math.random() * 20) + 10;
      gameInstance.score += roundScore;
      console.log(`      Score: +${roundScore} (Total: ${gameInstance.score})`);
      
      // Check win/fail conditions
      if (this.checkWinConditions(gameInstance)) {
        console.log(`   🏆 WIN CONDITION MET!`);
        gameInstance.conclusions.push('Game won - objectives achieved');
        break;
      }
      
      if (this.checkFailConditions(gameInstance)) {
        console.log(`   ❌ FAIL CONDITION MET`);
        gameInstance.conclusions.push('Game failed - critical failure');
        break;
      }
    }
    
    // End game
    gameInstance.isActive = false;
    gameInstance.endTime = new Date();
    
    // Generate learnings
    this.generateLearnings(gameInstance);
    
    // Store results
    this.gameResults.push(gameInstance);
    
    console.log(`\n✅ Game Completed!`);
    console.log(`   Final Score: ${gameInstance.score}`);
    console.log(`   Observations: ${gameInstance.observations.length}`);
    console.log(`   Learnings: ${gameInstance.conclusions.length}`);
    
    return gameInstance;
  }
  
  private applyRule(rule: GameRule, instance: RealityGameInstance): boolean {
    // Simulate rule application (simple random for now)
    return Math.random() > 0.5;
  }
  
  private checkWinConditions(instance: RealityGameInstance): boolean {
    return instance.score >= 100;
  }
  
  private checkFailConditions(instance: RealityGameInstance): boolean {
    return instance.score < 0 || instance.round >= 10;
  }
  
  private generateLearnings(instance: RealityGameInstance) {
    // Analyze game results
    const avgScorePerRound = instance.score / instance.round;
    
    instance.conclusions.push(
      `Average performance: ${avgScorePerRound.toFixed(1)} points per round`
    );
    
    if (avgScorePerRound > 15) {
      instance.conclusions.push('Strategy was highly effective');
      instance.realityImpact.push('Character gained confidence in decision-making');
    } else if (avgScorePerRound < 10) {
      instance.conclusions.push('Strategy needs improvement');
      instance.realityImpact.push('Character learned from mistakes');
    }
    
    // Hypothesize about reality
    instance.hypotheses.push(
      'Game rules may reflect underlying reality principles',
      'Success patterns could transfer to real-world scenarios'
    );
  }
  
  // ───────────────────────────────────────────────────────────
  // SCENARIO GENERATION HELPERS
  // ───────────────────────────────────────────────────────────
  
  private mapRealityTypeToPhysics(realityType: string): 'standard' | 'modified' | 'fantasy' | 'abstract' {
    const mapping: Record<string, any> = {
      'realistic': 'standard',
      'sci-fi': 'modified',
      'fantasy': 'fantasy',
      'abstract': 'abstract',
      'dream': 'abstract'
    };
    return mapping[realityType] || 'standard';
  }
  
  private generateRulesForScenario(scenario: string): GameRule[] {
    // Simple rule generation based on scenario keywords
    const rules: GameRule[] = [];
    
    if (scenario.includes('survival')) {
      rules.push({
        id: 'rule_resource',
        description: 'Manage resources carefully',
        condition: 'resources < 30',
        action: 'reduce consumption',
        priority: 1
      });
    }
    
    if (scenario.includes('cooperation') || scenario.includes('social')) {
      rules.push({
        id: 'rule_cooperation',
        description: 'Cooperation increases success by 50%',
        condition: 'with_allies == true',
        action: 'bonus_score += 10',
        priority: 2
      });
    }
    
    if (scenario.includes('exploration')) {
      rules.push({
        id: 'rule_exploration',
        description: 'Exploring new areas yields discoveries',
        condition: 'exploring == true',
        action: 'discovery_chance += 0.3',
        priority: 3
      });
    }
    
    // Always add basic rules
    rules.push({
      id: 'rule_time',
      description: 'Each action costs time',
      condition: 'action_taken == true',
      action: 'time += 1',
      priority: 0
    });
    
    return rules;
  }
  
  private generateObjectives(scenario: string): string[] {
    const objectives: string[] = ['Survive'];
    
    if (scenario.includes('cooperation')) {
      objectives.push('Build alliances');
    }
    if (scenario.includes('exploration')) {
      objectives.push('Discover new territories');
    }
    if (scenario.includes('resource')) {
      objectives.push('Gather sufficient resources');
    }
    
    objectives.push('Learn and adapt');
    
    return objectives;
  }
  
  private generateWinConditions(scenario: string): string[] {
    return [
      'Reach score threshold of 100',
      'Survive all rounds',
      'Complete primary objective'
    ];
  }
  
  private generateFailConditions(scenario: string): string[] {
    return [
      'Score drops below 0',
      'Critical resource depleted',
      'Character eliminated'
    ];
  }
  
  // ───────────────────────────────────────────────────────────
  // WHAT-IF SCENARIO TESTING
  // ───────────────────────────────────────────────────────────
  
  async testWhatIfScenario(
    question: string,
    modifications: string[]
  ): Promise<{ scenario: string; results: any[] }> {
    console.log(`\n🤔 WHAT-IF SCENARIO TEST`);
    console.log(`   Question: ${question}`);
    console.log(`   Modifications: ${modifications.join(', ')}\n`);
    
    // Create multiple game instances with different parameters
    const results: any[] = [];
    
    for (let i = 0; i < 3; i++) {
      console.log(`   Simulation ${i + 1}/3...`);
      
      const mechanics = await this.createRealityGame(
        `WhatIf_${i}`,
        'realistic',
        question
      );
      
      const character = {
        id: `char_${i}`,
        name: `Test Subject ${i + 1}`,
        traits: { adaptability: 0.7, resourcefulness: 0.8 }
      };
      
      const result = await this.playRealityGame(mechanics, character, 5);
      results.push({
        simulationId: i + 1,
        score: result.score,
        observations: result.observations,
        conclusions: result.conclusions
      });
    }
    
    console.log(`\n📊 WHAT-IF RESULTS:`);
    console.log(`   Simulations run: ${results.length}`);
    console.log(`   Average score: ${(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}`);
    
    return {
      scenario: question,
      results
    };
  }
  
  // ───────────────────────────────────────────────────────────
  // STATS & QUERIES
  // ───────────────────────────────────────────────────────────
  
  getStats() {
    const totalGames = this.gameResults.length;
    const avgScore = totalGames > 0
      ? this.gameResults.reduce((sum, g) => sum + g.score, 0) / totalGames
      : 0;
    
    return {
      totalGamesPlayed: totalGames,
      activeGames: this.activeGames.size,
      averageScore: avgScore.toFixed(1),
      totalObservations: this.gameResults.reduce((sum, g) => sum + g.observations.length, 0),
      totalLearnings: this.gameResults.reduce((sum, g) => sum + g.conclusions.length, 0),
      gameEngineConnected: false, // Would check actual connection
      multiverseEngineConnected: false
    };
  }
  
  getGameResults(limit = 10) {
    return this.gameResults.slice(-limit).map(game => ({
      id: game.id,
      gameName: game.mechanics.name,
      score: game.score,
      rounds: game.round,
      duration: game.endTime && game.startTime
        ? (game.endTime.getTime() - game.startTime.getTime()) / 1000
        : null,
      learnings: game.conclusions.length,
      impact: game.realityImpact
    }));
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════════════════════════

import express from 'express';

const app = express();
const PORT = 9998;

app.use(express.json());

const engine = new MultiverseRealityGames();

// POST /game/create - Create reality game
app.post('/game/create', async (req, res) => {
  try {
    const { name, realityType, scenario } = req.body;
    const mechanics = await engine.createRealityGame(name, realityType, scenario);
    res.json(mechanics);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /game/play - Play reality game
app.post('/game/play', async (req, res) => {
  try {
    const { mechanics, character, maxRounds } = req.body;
    const result = await engine.playRealityGame(mechanics, character, maxRounds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /whatif - Test "what if" scenario
app.post('/whatif', async (req, res) => {
  try {
    const { question, modifications } = req.body;
    const results = await engine.testWhatIfScenario(question, modifications);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /stats
app.get('/stats', (req, res) => {
  res.json(engine.getStats());
});

// GET /results
app.get('/results', (req, res) => {
  const limit = parseInt(req.query.limit as string || '10');
  res.json(engine.getGameResults(limit));
});

// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'multiverse-reality-games',
    port: PORT
  });
});

// GET /
app.get('/', (req, res) => {
  res.json({
    service: 'Multiverse Reality Games',
    version: '1.0',
    concept: 'Games as Reality Simulations',
    features: [
      'Convert games → reality simulations',
      'Characters play games in parallel realities',
      'What-if scenario testing',
      'Game rules = Reality physics',
      'Learn from game results → apply to reality'
    ],
    endpoints: [
      'POST /game/create - Create reality game',
      'POST /game/play - Play game in simulation',
      'POST /whatif - Test what-if scenarios',
      'GET /stats - System statistics',
      'GET /results - Game results',
      'GET /health - Health check'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`
🎮🌌 Multiverse Reality Games running on port ${PORT}

CONCEPT:
  Games are not entertainment - they are REALITY EXPERIMENTS
  Each game tests hypotheses about how worlds work
  Characters learn by playing, then apply learnings to their reality
  
INTEGRATION:
  ✓ Game Engine (Port 8896): Creates game mechanics
  ⚠️ Multiverse Engine: Not yet a service (would be amazing!)
  
PHILOSOPHY:
  "Spiele sind Gedankenexperimente.
   Realitäten sind Versuchslabore.
   Lernen geschieht durch Spielen."

Try:
  curl -X POST http://localhost:${PORT}/whatif \\
    -H "Content-Type: application/json" \\
    -d '{"question": "What if cooperation was mandatory?", "modifications": ["cooperation_bonus=100%"]}'

  curl http://localhost:${PORT}/stats
`);
});
