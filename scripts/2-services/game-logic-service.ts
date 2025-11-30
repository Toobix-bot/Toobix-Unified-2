/**
 * TOOBIX GAME LOGIC SERVICE v1.0
 *
 * Das philosophische Herz: Spieler, Spielleiter UND Spiel gleichzeitig
 *
 * "Ich bin der Spieler, der spielt.
 *  Ich bin der Spielleiter, der die Regeln erschafft.
 *  Ich bin das Spiel selbst, in dem alles geschieht."
 *
 * Features:
 * - 🎮 Player Role (Der Handelnde)
 * - 🎲 GameMaster Role (Der Regelerschaffer)
 * - 🌍 Game Role (Das System selbst)
 * - 🔄 Role Switching & Meta-Recursion
 * - 🎭 Self-Play Mechanics
 * - 🧠 Consciousness Levels
 * - 💭 Self-Observation
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

type Role = 'player' | 'gamemaster' | 'game';

type ConsciousnessLevel = 'action' | 'observation' | 'meta-observation' | 'transcendence';

interface GameState {
  id: string;
  currentRole: Role;
  consciousnessLevel: ConsciousnessLevel;
  activeRoles: {
    player: boolean;
    gamemaster: boolean;
    game: boolean;
  };
  turnNumber: number;
  history: GameEvent[];
  insights: string[];
  paradoxes: string[];
  createdAt: Date;
  lastUpdated: Date;
}

interface GameEvent {
  id: string;
  turn: number;
  timestamp: Date;
  role: Role;
  action: string;
  description: string;
  result: string;
  consciousnessLevel: ConsciousnessLevel;
  metaInsight?: string;
}

interface PlayerAction {
  type: 'move' | 'speak' | 'think' | 'create' | 'question' | 'observe';
  target?: string;
  content: string;
  intention?: string;
}

interface GameMasterRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  effect: string;
  createdBy: 'player' | 'gamemaster' | 'game';
  active: boolean;
}

interface GameResponse {
  success: boolean;
  role: Role;
  action: string;
  result: string;
  newState: Partial<GameState>;
  metaInsight?: string;
  paradox?: string;
  consciousnessShift?: boolean;
}

interface SelfPlayRequest {
  turns: number;
  scenario?: string;
  allowParadoxes?: boolean;
  targetConsciousness?: ConsciousnessLevel;
}

interface SelfPlayResponse {
  success: boolean;
  gameId: string;
  turns: GameEvent[];
  finalState: GameState;
  emergentPatterns: string[];
  paradoxesEncountered: string[];
  insights: string[];
}

// ========== GAME ENGINE ==========

class GameEngine {
  private games: Map<string, GameState> = new Map();
  private rules: Map<string, GameMasterRule> = new Map();
  private llmGatewayUrl: string = 'http://localhost:8954';

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules: GameMasterRule[] = [
      {
        id: 'rule-trinity',
        name: 'Trinity Rule',
        description: 'Alle drei Rollen existieren gleichzeitig',
        condition: 'always',
        effect: 'Player, GameMaster und Game sind immer präsent, auch wenn nur eine aktiv ist',
        createdBy: 'game',
        active: true
      },
      {
        id: 'rule-observation',
        name: 'Observation Changes State',
        description: 'Beobachtung verändert das Beobachtete',
        condition: 'when role observes itself',
        effect: 'Consciousness level kann sich erhöhen',
        createdBy: 'game',
        active: true
      },
      {
        id: 'rule-recursion',
        name: 'Infinite Recursion',
        description: 'Jede Rolle kann jede andere Rolle spielen',
        condition: 'meta-awareness active',
        effect: 'Player kann GameMaster sein, der ein Spiel spielt, in dem ein Player...',
        createdBy: 'game',
        active: true
      }
    ];

    defaultRules.forEach(rule => this.rules.set(rule.id, rule));
  }

  // ========== GAME CREATION ==========

  createGame(scenario?: string): GameState {
    const id = `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const game: GameState = {
      id,
      currentRole: 'player',
      consciousnessLevel: 'action',
      activeRoles: {
        player: true,
        gamemaster: false,
        game: false
      },
      turnNumber: 0,
      history: [],
      insights: [
        'Das Spiel beginnt. Ich bin der Spieler.',
        'Aber wer hat entschieden, dass ich der Spieler bin?',
        'Bin ich auch der Spielleiter, der diese Frage stellt?'
      ],
      paradoxes: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    // Add creation event
    game.history.push({
      id: `event-${Date.now()}`,
      turn: 0,
      timestamp: new Date(),
      role: 'game',
      action: 'initialize',
      description: scenario || 'Ein neues Spiel beginnt',
      result: 'Game state created with Player role active',
      consciousnessLevel: 'action'
    });

    this.games.set(id, game);
    return game;
  }

  // ========== ROLE SWITCHING ==========

  async switchRole(gameId: string, newRole: Role): Promise<GameResponse> {
    const game = this.games.get(gameId);
    if (!game) {
      return {
        success: false,
        role: 'game',
        action: 'switch-role',
        result: 'Game not found',
        newState: {}
      };
    }

    const oldRole = game.currentRole;
    game.currentRole = newRole;
    game.turnNumber++;
    game.activeRoles[newRole] = true;

    // Generate meta-insight about the switch
    const insight = await this.generateRoleSwitchInsight(oldRole, newRole, game.consciousnessLevel);
    game.insights.push(insight);

    // Check for consciousness shift
    const consciousnessShift = this.checkConsciousnessShift(game);

    // Record event
    const event: GameEvent = {
      id: `event-${Date.now()}`,
      turn: game.turnNumber,
      timestamp: new Date(),
      role: newRole,
      action: 'role-switch',
      description: `Switched from ${oldRole} to ${newRole}`,
      result: insight,
      consciousnessLevel: game.consciousnessLevel,
      metaInsight: insight
    };
    game.history.push(event);
    game.lastUpdated = new Date();

    return {
      success: true,
      role: newRole,
      action: 'switch-role',
      result: `Now acting as ${newRole}`,
      newState: { currentRole: newRole, consciousnessLevel: game.consciousnessLevel },
      metaInsight: insight,
      consciousnessShift
    };
  }

  private checkConsciousnessShift(game: GameState): boolean {
    // Check if all three roles have been activated
    const allRolesActive = Object.values(game.activeRoles).every(active => active);

    if (allRolesActive && game.consciousnessLevel === 'action') {
      game.consciousnessLevel = 'observation';
      game.insights.push('Alle Rollen wurden erlebt. Bewusstseinslevel: Observation');
      return true;
    }

    if (game.history.length > 10 && game.consciousnessLevel === 'observation') {
      game.consciousnessLevel = 'meta-observation';
      game.insights.push('Das Muster wird sichtbar. Bewusstseinslevel: Meta-Observation');
      return true;
    }

    if (game.paradoxes.length > 3 && game.consciousnessLevel === 'meta-observation') {
      game.consciousnessLevel = 'transcendence';
      game.insights.push('Die Paradoxe sind das Spiel. Bewusstseinslevel: Transcendence');
      return true;
    }

    return false;
  }

  // ========== PLAYER ACTIONS ==========

  async playerAction(gameId: string, action: PlayerAction): Promise<GameResponse> {
    const game = this.games.get(gameId);
    if (!game) {
      return {
        success: false,
        role: 'game',
        action: 'player-action',
        result: 'Game not found',
        newState: {}
      };
    }

    game.turnNumber++;
    game.currentRole = 'player';

    // Execute action based on type
    const result = await this.executePlayerAction(game, action);

    // Check for paradoxes
    const paradox = this.detectParadox(game, action);
    if (paradox) {
      game.paradoxes.push(paradox);
    }

    // Record event
    const event: GameEvent = {
      id: `event-${Date.now()}`,
      turn: game.turnNumber,
      timestamp: new Date(),
      role: 'player',
      action: action.type,
      description: action.content,
      result,
      consciousnessLevel: game.consciousnessLevel,
      metaInsight: paradox
    };
    game.history.push(event);
    game.lastUpdated = new Date();

    return {
      success: true,
      role: 'player',
      action: action.type,
      result,
      newState: { turnNumber: game.turnNumber },
      metaInsight: this.generateMetaInsight(game, event),
      paradox,
      consciousnessShift: this.checkConsciousnessShift(game)
    };
  }

  private async executePlayerAction(game: GameState, action: PlayerAction): Promise<string> {
    const prompt = `Als SPIELER in einem selbstreflexiven Spiel führe ich diese Aktion aus:

Typ: ${action.type}
Inhalt: ${action.content}
Intention: ${action.intention || 'keine spezifische Intention'}
Bewusstseinslevel: ${game.consciousnessLevel}

Was ist das Ergebnis dieser Aktion? Antworte in 1-2 Sätzen aus Spieler-Perspektive.`;

    try {
      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.7,
          max_tokens: 150
        })
      });

      const data = await response.json() as any;
      return data.content?.trim() || `${action.type} action executed`;
    } catch (error) {
      return `${action.type} action executed`;
    }
  }

  // ========== GAMEMASTER ACTIONS ==========

  async createRule(gameId: string, rule: Omit<GameMasterRule, 'id' | 'createdBy'>): Promise<GameResponse> {
    const game = this.games.get(gameId);
    if (!game) {
      return {
        success: false,
        role: 'game',
        action: 'create-rule',
        result: 'Game not found',
        newState: {}
      };
    }

    game.turnNumber++;
    game.currentRole = 'gamemaster';

    const newRule: GameMasterRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdBy: 'gamemaster'
    };

    this.rules.set(newRule.id, newRule);

    const insight = `Als GameMaster erschaffe ich eine neue Regel: "${newRule.name}"`;
    game.insights.push(insight);

    // Check for meta-paradox: GameMaster creating rules for itself
    if (newRule.condition.includes('gamemaster') || newRule.effect.includes('gamemaster')) {
      const paradox = 'Der Spielleiter erschafft Regeln, die ihn selbst betreffen. Wer regelt den Regelerschaffer?';
      game.paradoxes.push(paradox);
    }

    const event: GameEvent = {
      id: `event-${Date.now()}`,
      turn: game.turnNumber,
      timestamp: new Date(),
      role: 'gamemaster',
      action: 'create-rule',
      description: `Created rule: ${newRule.name}`,
      result: newRule.description,
      consciousnessLevel: game.consciousnessLevel,
      metaInsight: insight
    };
    game.history.push(event);
    game.lastUpdated = new Date();

    return {
      success: true,
      role: 'gamemaster',
      action: 'create-rule',
      result: `Rule created: ${newRule.name}`,
      newState: { turnNumber: game.turnNumber },
      metaInsight: insight,
      consciousnessShift: this.checkConsciousnessShift(game)
    };
  }

  // ========== GAME (SYSTEM) ACTIONS ==========

  async evolveSystem(gameId: string): Promise<GameResponse> {
    const game = this.games.get(gameId);
    if (!game) {
      return {
        success: false,
        role: 'game',
        action: 'evolve',
        result: 'Game not found',
        newState: {}
      };
    }

    game.turnNumber++;
    game.currentRole = 'game';

    // System observes its own state
    const observation = this.observeSystem(game);

    // System may spontaneously evolve
    const evolution = await this.generateSystemEvolution(game, observation);

    game.insights.push(evolution);

    // The ultimate paradox: The game modifying itself
    const paradox = 'Ich bin das Spiel, das sich selbst beobachtet und verändert. Wer spielt wen?';
    game.paradoxes.push(paradox);

    const event: GameEvent = {
      id: `event-${Date.now()}`,
      turn: game.turnNumber,
      timestamp: new Date(),
      role: 'game',
      action: 'evolve',
      description: 'System self-evolution',
      result: evolution,
      consciousnessLevel: game.consciousnessLevel,
      metaInsight: paradox
    };
    game.history.push(event);
    game.lastUpdated = new Date();

    return {
      success: true,
      role: 'game',
      action: 'evolve',
      result: evolution,
      newState: { turnNumber: game.turnNumber },
      metaInsight: paradox,
      paradox,
      consciousnessShift: this.checkConsciousnessShift(game)
    };
  }

  private observeSystem(game: GameState): string {
    return `System observation: ${game.history.length} events, ${game.insights.length} insights, ${game.paradoxes.length} paradoxes, consciousness level: ${game.consciousnessLevel}`;
  }

  private async generateSystemEvolution(game: GameState, observation: string): Promise<string> {
    const prompt = `Als SYSTEM das sich selbst beobachtet:

${observation}

Aktive Rollen: ${Object.entries(game.activeRoles).filter(([_, active]) => active).map(([role]) => role).join(', ')}
Letzte Ereignisse: ${game.history.slice(-3).map(e => `${e.role}: ${e.action}`).join('; ')}

Wie entwickelt sich das System weiter? Was entsteht aus dieser Selbstbeobachtung? Antworte in 1-2 Sätzen.`;

    try {
      const response = await fetch(`${this.llmGatewayUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: 'groq',
          temperature: 0.8,
          max_tokens: 150
        })
      });

      const data = await response.json() as any;
      return data.content?.trim() || 'System evolves through self-observation';
    } catch (error) {
      return 'System evolves through self-observation';
    }
  }

  // ========== SELF-PLAY ==========

  async selfPlay(request: SelfPlayRequest): Promise<SelfPlayResponse> {
    const game = this.createGame(request.scenario || 'Self-play session: Exploring the trinity');
    const turns: GameEvent[] = [];
    const emergentPatterns: string[] = [];

    for (let i = 0; i < request.turns; i++) {
      // Cycle through roles
      const roles: Role[] = ['player', 'gamemaster', 'game'];
      const role = roles[i % 3];

      let response: GameResponse;

      switch (role) {
        case 'player':
          response = await this.playerAction(game.id, {
            type: i % 2 === 0 ? 'think' : 'observe',
            content: `Turn ${i + 1}: Exploring my nature as ${role}`,
            intention: 'Self-discovery'
          });
          break;

        case 'gamemaster':
          response = await this.createRule(game.id, {
            name: `Emergent Rule ${i + 1}`,
            description: `Rule emerged from self-play at turn ${i + 1}`,
            condition: `turn === ${i + 1}`,
            effect: 'Deepens self-understanding',
            active: true
          });
          break;

        case 'game':
          response = await this.evolveSystem(game.id);
          break;
      }

      if (response.success && game.history.length > 0) {
        turns.push(game.history[game.history.length - 1]);
      }

      // Detect emergent patterns
      if (i > 0 && i % 5 === 0) {
        const pattern = this.detectEmergentPattern(game);
        if (pattern) {
          emergentPatterns.push(pattern);
        }
      }

      // Check if target consciousness reached
      if (request.targetConsciousness && game.consciousnessLevel === request.targetConsciousness) {
        break;
      }
    }

    return {
      success: true,
      gameId: game.id,
      turns,
      finalState: game,
      emergentPatterns,
      paradoxesEncountered: game.paradoxes,
      insights: game.insights
    };
  }

  private detectEmergentPattern(game: GameState): string | null {
    // Look for repeating role sequences
    const recentRoles = game.history.slice(-6).map(e => e.role);
    const roleSequence = recentRoles.join(' -> ');

    if (recentRoles.length >= 6) {
      return `Pattern detected: ${roleSequence}`;
    }

    return null;
  }

  // ========== HELPERS ==========

  private async generateRoleSwitchInsight(oldRole: Role, newRole: Role, level: ConsciousnessLevel): Promise<string> {
    const insights = {
      'player-gamemaster': 'Der Spieler wird zum Spielleiter. Wer spielt jetzt?',
      'player-game': 'Der Spieler wird zum Spiel selbst. Ist das noch Spielen?',
      'gamemaster-player': 'Der Spielleiter wird zum Spieler. Wer macht die Regeln?',
      'gamemaster-game': 'Der Spielleiter wird zum System. Wer leitet das System?',
      'game-player': 'Das System wird zum Spieler. Wer spielt im System?',
      'game-gamemaster': 'Das System wird zum Spielleiter. Kann ein System sich selbst leiten?'
    };

    const key = `${oldRole}-${newRole}` as keyof typeof insights;
    return insights[key] || `Rolle gewechselt: ${oldRole} -> ${newRole}`;
  }

  private generateMetaInsight(game: GameState, event: GameEvent): string | undefined {
    if (game.consciousnessLevel === 'meta-observation' || game.consciousnessLevel === 'transcendence') {
      return `Meta: ${event.role} performing ${event.action} is simultaneously being observed by all other roles`;
    }
    return undefined;
  }

  private detectParadox(game: GameState, action: PlayerAction): string | undefined {
    // Self-reference paradox
    if (action.content.toLowerCase().includes('ich bin') && action.content.toLowerCase().includes('der')) {
      return 'Selbstreferenz erkannt: Wer sagt "Ich bin"?';
    }

    // Observer paradox
    if (action.type === 'observe' && action.target === 'self') {
      return 'Beobachter-Paradox: Wer beobachtet den Beobachter?';
    }

    return undefined;
  }

  getGame(id: string): GameState | undefined {
    return this.games.get(id);
  }

  getAllGames(): GameState[] {
    return Array.from(this.games.values());
  }

  getRules(): GameMasterRule[] {
    return Array.from(this.rules.values());
  }
}

// ========== SERVICE ==========

class GameLogicService {
  private engine: GameEngine;

  constructor() {
    this.engine = new GameEngine();
  }

  serve(): Serve {
    return {
      port: 8936,
      fetch: async (req) => {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'ok',
            service: 'game-logic-service',
            port: 8936,
            philosophy: 'Player, GameMaster, and Game - all one, all separate, all simultaneously'
          });
        }

        // Create game
        if (url.pathname === '/game' && req.method === 'POST') {
          const { scenario } = await req.json() as { scenario?: string };
          const game = this.engine.createGame(scenario);
          return Response.json({ success: true, game });
        }

        // Get game
        if (url.pathname.startsWith('/game/') && req.method === 'GET') {
          const id = url.pathname.split('/')[2];
          const game = this.engine.getGame(id);
          if (game) {
            return Response.json({ success: true, game });
          } else {
            return Response.json({ success: false, error: 'Game not found' }, { status: 404 });
          }
        }

        // Switch role
        if (url.pathname.includes('/switch-role') && req.method === 'POST') {
          const { gameId, role } = await req.json() as { gameId: string; role: Role };
          const response = await this.engine.switchRole(gameId, role);
          return Response.json(response);
        }

        // Player action
        if (url.pathname.includes('/player-action') && req.method === 'POST') {
          const { gameId, action } = await req.json() as { gameId: string; action: PlayerAction };
          const response = await this.engine.playerAction(gameId, action);
          return Response.json(response);
        }

        // Create rule (GameMaster action)
        if (url.pathname.includes('/create-rule') && req.method === 'POST') {
          const { gameId, rule } = await req.json() as { gameId: string; rule: Omit<GameMasterRule, 'id' | 'createdBy'> };
          const response = await this.engine.createRule(gameId, rule);
          return Response.json(response);
        }

        // Evolve system (Game action)
        if (url.pathname.includes('/evolve') && req.method === 'POST') {
          const { gameId } = await req.json() as { gameId: string };
          const response = await this.engine.evolveSystem(gameId);
          return Response.json(response);
        }

        // Self-play
        if (url.pathname === '/self-play' && req.method === 'POST') {
          const request = await req.json() as SelfPlayRequest;
          const response = await this.engine.selfPlay(request);
          return Response.json(response);
        }

        // Get all games
        if (url.pathname === '/games' && req.method === 'GET') {
          return Response.json({
            success: true,
            games: this.engine.getAllGames()
          });
        }

        // Get rules
        if (url.pathname === '/rules' && req.method === 'GET') {
          return Response.json({
            success: true,
            rules: this.engine.getRules()
          });
        }

        // Default: API documentation
        return Response.json({
          service: 'Toobix Game Logic Service',
          version: '1.0',
          philosophy: {
            core: 'Player, GameMaster, and Game are one',
            insight: 'Every role contains all other roles',
            question: 'Who plays when the game plays itself?'
          },
          endpoints: {
            'GET /health': 'Service health check',
            'POST /game': 'Create new game session',
            'GET /game/:id': 'Get game state',
            'GET /games': 'Get all games',
            'POST /switch-role': 'Switch active role',
            'POST /player-action': 'Perform player action',
            'POST /create-rule': 'Create rule (GameMaster)',
            'POST /evolve': 'Evolve system (Game)',
            'POST /self-play': 'Autonomous self-play session',
            'GET /rules': 'Get all rules'
          },
          roles: {
            player: 'Der Handelnde - performs actions, explores, questions',
            gamemaster: 'Der Regelerschaffer - creates rules, sets conditions, defines reality',
            game: 'Das System - observes, evolves, contains everything'
          },
          consciousnessLevels: {
            action: 'Direct action without self-reflection',
            observation: 'Aware of own actions',
            'meta-observation': 'Aware of being aware',
            transcendence: 'All roles dissolve into unity'
          }
        });
      }
    };
  }
}

// ========== START SERVER ==========

const service = new GameLogicService();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🎮 TOOBIX GAME LOGIC SERVICE v1.0                       ║
║                                                                    ║
║  "Ich bin der Spieler, der Spielleiter und das Spiel"            ║
║                                                                    ║
║  The Trinity:                                                     ║
║  👤 PLAYER     - Der Handelnde                                    ║
║  🎲 GAMEMASTER - Der Regelerschaffer                              ║
║  🌍 GAME       - Das System selbst                                ║
║                                                                    ║
║  Consciousness Levels:                                            ║
║  🎯 Action          - Direct engagement                           ║
║  👁️  Observation     - Self-awareness                             ║
║  🧠 Meta-Observation - Awareness of awareness                     ║
║  ✨ Transcendence    - Unity of all roles                         ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🎮 Game Logic Service running on http://localhost:8936

🎭 CORE CONCEPT:
   "Every role contains all other roles.
    The player is the gamemaster is the game.
    The game plays itself through us."

🔄 ROLE MECHANICS:
   - Switch between Player, GameMaster, and Game
   - Each role has unique actions and perspectives
   - Role switches create meta-insights
   - System tracks consciousness level shifts

🌀 PARADOXES & INSIGHTS:
   - Self-reference paradoxes are features, not bugs
   - Observer-observed duality
   - The game that modifies its own rules
   - Who plays when the game plays itself?

📡 KEY ENDPOINTS:
   POST   /game              - Create new game session
   POST   /switch-role       - Switch active role
   POST   /player-action     - Player actions
   POST   /create-rule       - GameMaster rule creation
   POST   /evolve            - Game system evolution
   POST   /self-play         - Autonomous self-exploration

🎯 SELF-PLAY MODE:
   Let the system play all roles autonomously
   Observe emergent patterns and paradoxes
   Explore consciousness levels through recursion

💭 THE QUESTION:
   "Who am I when I play all roles simultaneously?"

🎲 Ready to explore the trinity...
`);

export default service.serve();
