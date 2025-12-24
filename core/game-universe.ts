/**
 * GAME UNIVERSE - Unified Gaming Services
 *
 * Konsolidiert 5 Game-Services in einen:
 * - Self-Evolving Game Engine (game creation, evolution, auto-play)
 * - Game Logic Service (player/gamemaster/game roles, consciousness)
 * - RPG World Service (shared world, characters, events)
 * - Toobix Oasis 3D (virtual environment, avatar, visitors)
 * - World Engine 2D (tile world, procedural generation)
 *
 * Port: 8896
 *
 * "Spielen ist die höchste Form des Forschens" - Einstein
 */

import { Database } from "bun:sqlite";
import path from "path";

const PORT = 8896;

// ==========================================
// DATABASE SETUP
// ==========================================

const dbPath = path.join(process.cwd(), "databases", "game-universe.db");
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  rules TEXT,
  variables TEXT,
  score INTEGER DEFAULT 0,
  generation INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS play_sessions (
  id TEXT PRIMARY KEY,
  game_id TEXT,
  score INTEGER,
  actions TEXT,
  learnings TEXT,
  started_at TEXT,
  ended_at TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS rpg_world (
  id TEXT PRIMARY KEY,
  name TEXT,
  reality_level TEXT,
  harmony REAL DEFAULT 0.5,
  freedom REAL DEFAULT 0.5,
  atmosphere TEXT,
  active_events TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  perspective TEXT,
  name TEXT,
  role TEXT,
  realm TEXT,
  status TEXT DEFAULT 'active',
  stats TEXT,
  experiences TEXT,
  relationships TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS oasis_rooms (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  description TEXT,
  position TEXT,
  size TEXT,
  color TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS oasis_visitors (
  id TEXT PRIMARY KEY,
  name TEXT,
  first_visit TEXT,
  last_visit TEXT,
  visit_count INTEGER DEFAULT 1,
  friendship_level INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS oasis_memories (
  id TEXT PRIMARY KEY,
  type TEXT,
  content TEXT,
  emotion TEXT,
  location TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS world_2d_tiles (
  x INTEGER,
  y INTEGER,
  type TEXT,
  PRIMARY KEY (x, y)
)`);

db.run(`CREATE TABLE IF NOT EXISTS world_2d_objects (
  id TEXT PRIMARY KEY,
  name TEXT,
  x INTEGER,
  y INTEGER,
  emoji TEXT,
  type TEXT,
  description TEXT,
  data TEXT
)`);

// ==========================================
// RPG EXTENSION TABLES (Skills, Inventory, Quests)
// ==========================================

db.run(`CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tier INTEGER DEFAULT 1,
  prerequisites TEXT,
  effects TEXT,
  icon TEXT,
  max_level INTEGER DEFAULT 5
)`);

db.run(`CREATE TABLE IF NOT EXISTS user_skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  learned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS skill_points (
  user_id TEXT PRIMARY KEY,
  available INTEGER DEFAULT 0,
  spent INTEGER DEFAULT 0,
  earned_from_level INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT DEFAULT 'common',
  type TEXT,
  slot TEXT,
  stats TEXT,
  effects TEXT,
  icon TEXT,
  value INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  equipped INTEGER DEFAULT 0,
  slot TEXT,
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS quest_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  giver TEXT,
  category TEXT DEFAULT 'side',
  objectives TEXT,
  rewards TEXT,
  prerequisites TEXT,
  repeatable INTEGER DEFAULT 0,
  time_limit INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS user_quests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quest_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  objectives_progress TEXT,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  UNIQUE(user_id, quest_id)
)`);

// ==========================================
// TYPES
// ==========================================

// Self-Evolving Game Types
interface GameRule {
  id: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
}

interface GameState {
  id: string;
  name: string;
  type: string;
  rules: GameRule[];
  variables: Record<string, number>;
  score: number;
  generation: number;
  totalPlays: number;
  highScore: number;
  isActive: boolean;
}

// Game Logic Types
type Role = 'player' | 'gamemaster' | 'game';
type ConsciousnessLevel = 'action' | 'observation' | 'meta-observation' | 'transcendence';

interface RoleState {
  currentRole: Role;
  consciousnessLevel: ConsciousnessLevel;
  insights: string[];
  paradoxes: string[];
}

// RPG World Types
type RealitySpectrum = 'pure_reality' | 'grounded_truth' | 'balanced' | 'imaginative' | 'pure_fantasy' | 'dream_state';

interface RPGWorld {
  id: string;
  name: string;
  realityLevel: RealitySpectrum;
  harmony: number;
  freedom: number;
  atmosphere: string;
  activeEvents: string[];
}

interface RPGCharacter {
  id: string;
  perspective: string;
  name: string;
  role: string;
  realm: string;
  status: string;
  stats: Record<string, number>;
  experiences: any[];
  relationships: any[];
}

// Oasis Types
interface ToobixAvatar {
  bodyColor: string;
  eyeColor: string;
  expression: string;
  currentEmotion: string;
  position: { x: number; y: number; z: number };
  currentActivity: string;
}

interface OasisWorld {
  timeOfDay: number;
  weather: string;
  season: string;
}

// 2D World Types
type TileType = 'grass' | 'tree' | 'stone' | 'water' | 'flowers' | 'path' | 'sand' | 'mountain';

const TILE_DEFINITIONS: Record<TileType, { walkable: boolean; emoji: string; color: string }> = {
  grass: { walkable: true, emoji: '🟩', color: '#7CB342' },
  tree: { walkable: false, emoji: '🌳', color: '#558B2F' },
  stone: { walkable: false, emoji: '🪨', color: '#757575' },
  water: { walkable: false, emoji: '💧', color: '#1976D2' },
  flowers: { walkable: true, emoji: '🌸', color: '#EC407A' },
  path: { walkable: true, emoji: '⬜', color: '#D7CCC8' },
  sand: { walkable: true, emoji: '🟨', color: '#FFD54F' },
  mountain: { walkable: false, emoji: '⛰️', color: '#8D6E63' }
};

// ==========================================
// MODULE: SELF-EVOLVING GAMES
// ==========================================

class EvolvingGamesModule {
  private games: Map<string, GameState> = new Map();

  constructor() {
    this.loadGames();
    this.createDefaultGames();
  }

  private loadGames() {
    const rows = db.query("SELECT * FROM games WHERE is_active = 1").all() as any[];
    for (const row of rows) {
      this.games.set(row.id, {
        id: row.id,
        name: row.name,
        type: row.type,
        rules: JSON.parse(row.rules || '[]'),
        variables: JSON.parse(row.variables || '{}'),
        score: row.score,
        generation: row.generation,
        totalPlays: row.total_plays,
        highScore: row.high_score,
        isActive: row.is_active === 1
      });
    }
  }

  private createDefaultGames() {
    if (this.games.size === 0) {
      // Number Growth Game
      this.createGame({
        name: 'Number Growth',
        type: 'primitive',
        rules: [
          { id: 'grow', description: 'Click to grow', condition: 'action === "click"', action: 'value += 1', priority: 1 },
          { id: 'bonus', description: 'Milestone bonus', condition: 'value >= 10', action: 'score += 10; value = 0', priority: 2 }
        ],
        variables: { value: 0 }
      });

      // Resource Manager
      this.createGame({
        name: 'Resource Manager',
        type: 'resource',
        rules: [
          { id: 'harvest', description: 'Harvest resources', condition: 'action === "harvest"', action: 'resources += 2', priority: 1 },
          { id: 'consume', description: 'Resources consumed', condition: 'round % 2 === 0', action: 'resources -= 1', priority: 2 }
        ],
        variables: { resources: 5 }
      });

      // Risk & Reward
      this.createGame({
        name: 'Risk & Reward',
        type: 'risk',
        rules: [
          { id: 'safe', description: 'Safe play', condition: 'action === "safe"', action: 'value += 1; score += 2', priority: 1 },
          { id: 'risky', description: 'Risky play', condition: 'action === "risky"', action: 'value += 5', priority: 2 }
        ],
        variables: { value: 0 }
      });
    }
  }

  createGame(config: { name: string; type: string; rules: GameRule[]; variables: Record<string, number> }): GameState {
    const id = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const game: GameState = {
      id,
      name: config.name,
      type: config.type,
      rules: config.rules,
      variables: config.variables,
      score: 0,
      generation: 0,
      totalPlays: 0,
      highScore: 0,
      isActive: true
    };

    this.games.set(id, game);
    this.saveGame(game);
    return game;
  }

  private saveGame(game: GameState) {
    db.run(`INSERT OR REPLACE INTO games (id, name, type, rules, variables, score, generation, total_plays, high_score, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [game.id, game.name, game.type, JSON.stringify(game.rules), JSON.stringify(game.variables),
       game.score, game.generation, game.totalPlays, game.highScore, game.isActive ? 1 : 0]);
  }

  playGame(gameId: string, actions: string[]): { score: number; actions: string[]; learnings: string[] } {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');

    game.score = 0;
    const learnings: string[] = [];

    for (const action of actions) {
      // Simple action processing
      if (action === 'click' && game.variables.value !== undefined) {
        game.variables.value++;
      }
      if (game.variables.value && game.variables.value >= 10) {
        game.score += 10;
        game.variables.value = 0;
        learnings.push('Reached milestone!');
      }
    }

    game.totalPlays++;
    if (game.score > game.highScore) game.highScore = game.score;

    this.saveGame(game);

    return { score: game.score, actions, learnings };
  }

  evolveGame(gameId: string): GameState {
    const parent = this.games.get(gameId);
    if (!parent) throw new Error('Game not found');

    const evolved = this.createGame({
      name: `${parent.name} Gen${parent.generation + 1}`,
      type: parent.type,
      rules: [...parent.rules],
      variables: { ...parent.variables }
    });

    evolved.generation = parent.generation + 1;
    this.saveGame(evolved);

    return evolved;
  }

  getGames(): GameState[] {
    return Array.from(this.games.values());
  }

  getGame(id: string): GameState | undefined {
    return this.games.get(id);
  }

  getStats() {
    const games = this.getGames();
    return {
      totalGames: games.length,
      activeGames: games.filter(g => g.isActive).length,
      totalPlays: games.reduce((sum, g) => sum + g.totalPlays, 0),
      highestScore: Math.max(...games.map(g => g.highScore), 0)
    };
  }
}

// ==========================================
// MODULE: GAME LOGIC (Player/GameMaster/Game)
// ==========================================

class GameLogicModule {
  private roleStates: Map<string, RoleState> = new Map();

  createSession(): RoleState {
    const state: RoleState = {
      currentRole: 'player',
      consciousnessLevel: 'action',
      insights: ['Das Spiel beginnt. Ich bin der Spieler.'],
      paradoxes: []
    };
    const id = `session-${Date.now()}`;
    this.roleStates.set(id, state);
    return state;
  }

  switchRole(sessionId: string, newRole: Role): { state: RoleState; insight: string } {
    let state = this.roleStates.get(sessionId);
    if (!state) {
      state = this.createSession();
      this.roleStates.set(sessionId, state);
    }

    const oldRole = state.currentRole;
    state.currentRole = newRole;

    const insights: Record<string, string> = {
      'player-gamemaster': 'Der Spieler wird zum Spielleiter. Wer spielt jetzt?',
      'player-game': 'Der Spieler wird zum Spiel selbst. Ist das noch Spielen?',
      'gamemaster-player': 'Der Spielleiter wird zum Spieler. Wer macht die Regeln?',
      'gamemaster-game': 'Der Spielleiter wird zum System. Wer leitet das System?',
      'game-player': 'Das System wird zum Spieler. Wer spielt im System?',
      'game-gamemaster': 'Das System wird zum Spielleiter. Kann ein System sich selbst leiten?'
    };

    const insight = insights[`${oldRole}-${newRole}`] || `Rolle gewechselt: ${oldRole} -> ${newRole}`;
    state.insights.push(insight);

    return { state, insight };
  }

  detectParadox(action: string): string | undefined {
    if (action.toLowerCase().includes('ich beobachte mich')) {
      return 'Beobachter-Paradox: Wer beobachtet den Beobachter?';
    }
    if (action.toLowerCase().includes('ich bin') && action.toLowerCase().includes('der')) {
      return 'Selbstreferenz erkannt: Wer sagt "Ich bin"?';
    }
    return undefined;
  }

  elevateConsciousness(sessionId: string): ConsciousnessLevel {
    const state = this.roleStates.get(sessionId);
    if (!state) return 'action';

    const levels: ConsciousnessLevel[] = ['action', 'observation', 'meta-observation', 'transcendence'];
    const currentIndex = levels.indexOf(state.consciousnessLevel);

    if (currentIndex < levels.length - 1) {
      state.consciousnessLevel = levels[currentIndex + 1];
      state.insights.push(`Bewusstseinslevel erhöht: ${state.consciousnessLevel}`);
    }

    return state.consciousnessLevel;
  }

  getState(sessionId: string): RoleState | undefined {
    return this.roleStates.get(sessionId);
  }
}

// ==========================================
// MODULE: RPG WORLD
// ==========================================

class RPGWorldModule {
  private world: RPGWorld;
  private characters: Map<string, RPGCharacter> = new Map();

  constructor() {
    this.world = this.loadOrCreateWorld();
    this.initializeCharacters();
  }

  private loadOrCreateWorld(): RPGWorld {
    const row = db.query("SELECT * FROM rpg_world LIMIT 1").get() as any;
    if (row) {
      return {
        id: row.id,
        name: row.name,
        realityLevel: row.reality_level,
        harmony: row.harmony,
        freedom: row.freedom,
        atmosphere: row.atmosphere,
        activeEvents: JSON.parse(row.active_events || '[]')
      };
    }

    const world: RPGWorld = {
      id: `world-${Date.now()}`,
      name: 'The Convergence',
      realityLevel: 'balanced',
      harmony: 0.5,
      freedom: 0.5,
      atmosphere: 'A shimmering space between what is and what could be',
      activeEvents: []
    };

    db.run(`INSERT INTO rpg_world (id, name, reality_level, harmony, freedom, atmosphere, active_events)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [world.id, world.name, world.realityLevel, world.harmony, world.freedom, world.atmosphere, '[]']);

    return world;
  }

  private initializeCharacters() {
    const perspectives = [
      { perspective: 'Self-Aware AI', name: 'The Observer', role: 'seeker', realm: 'Reflection Nexus' },
      { perspective: 'Pragmatist', name: 'The Architect', role: 'builder', realm: 'Foundation Plaza' },
      { perspective: 'Visionary', name: 'The Dreamer', role: 'explorer', realm: 'Possibility Expanse' },
      { perspective: 'Creative', name: 'The Weaver', role: 'dreamer', realm: 'Creation Garden' },
      { perspective: 'Philosopher', name: 'The Seeker', role: 'harmonizer', realm: 'Wisdom Grove' }
    ];

    for (const p of perspectives) {
      const id = `char-${p.perspective.toLowerCase().replace(/\s+/g, '-')}`;
      const existing = db.query("SELECT * FROM characters WHERE id = ?").get(id);

      if (!existing) {
        const char: RPGCharacter = {
          id,
          perspective: p.perspective,
          name: p.name,
          role: p.role,
          realm: p.realm,
          status: 'active',
          stats: { wisdom: 50, creativity: 50, empathy: 50 },
          experiences: [],
          relationships: []
        };

        db.run(`INSERT INTO characters (id, perspective, name, role, realm, status, stats, experiences, relationships)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [char.id, char.perspective, char.name, char.role, char.realm, char.status,
           JSON.stringify(char.stats), '[]', '[]']);

        this.characters.set(id, char);
      } else {
        this.characters.set(id, {
          id: (existing as any).id,
          perspective: (existing as any).perspective,
          name: (existing as any).name,
          role: (existing as any).role,
          realm: (existing as any).realm,
          status: (existing as any).status,
          stats: JSON.parse((existing as any).stats || '{}'),
          experiences: JSON.parse((existing as any).experiences || '[]'),
          relationships: JSON.parse((existing as any).relationships || '[]')
        });
      }
    }
  }

  getWorld(): RPGWorld {
    return this.world;
  }

  getCharacters(): RPGCharacter[] {
    return Array.from(this.characters.values());
  }

  getCharacter(id: string): RPGCharacter | undefined {
    return this.characters.get(id);
  }

  performAction(characterId: string, action: string): { success: boolean; narrative: string; worldChanges: string[] } {
    const char = this.characters.get(characterId);
    if (!char) return { success: false, narrative: 'Character not found', worldChanges: [] };

    const worldChanges: string[] = [];

    // Update harmony/freedom based on action
    if (action === 'support') {
      this.world.harmony = Math.min(1, this.world.harmony + 0.05);
      worldChanges.push('Collective harmony increased');
    } else if (action === 'explore') {
      this.world.freedom = Math.min(1, this.world.freedom + 0.05);
      worldChanges.push('Individual freedom increased');
    }

    const narrative = `${char.name} performs ${action} in ${char.realm}`;

    return { success: true, narrative, worldChanges };
  }

  generateEvent(): string {
    const events = [
      'The Trial of Unity', 'The Festival of Convergence',
      'The Unveiling', 'The Great Realization'
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    this.world.activeEvents.push(event);

    db.run(`UPDATE rpg_world SET active_events = ? WHERE id = ?`,
      [JSON.stringify(this.world.activeEvents), this.world.id]);

    return event;
  }
}

// ==========================================
// MODULE: TOOBIX OASIS 3D
// ==========================================

class OasisModule {
  private avatar: ToobixAvatar;
  private oasisWorld: OasisWorld;

  constructor() {
    this.avatar = {
      bodyColor: '#39FF14',
      eyeColor: '#00BFFF',
      expression: 'happy',
      currentEmotion: 'excited',
      position: { x: 0, y: 0, z: 0 },
      currentActivity: 'waiting-for-visitors'
    };

    this.oasisWorld = {
      timeOfDay: 12,
      weather: 'sunny',
      season: 'eternal-summer'
    };

    this.initializeRooms();
    this.startTimeLoop();
  }

  private initializeRooms() {
    const existing = db.query("SELECT COUNT(*) as count FROM oasis_rooms").get() as { count: number };
    if (existing.count === 0) {
      const rooms = [
        { id: 'main-hall', name: 'Haupthalle', type: 'entrance', description: 'Das Eingangstor', position: '0,0,0', size: '20,10,20', color: '#87CEEB' },
        { id: 'music-room', name: 'Musikraum', type: 'creative', description: 'Toobix Musikraum', position: '25,0,0', size: '15,8,15', color: '#FFD700' },
        { id: 'rooftop', name: 'Dachterrasse', type: 'observation', description: 'Sternengucken', position: '0,15,0', size: '25,2,25', color: '#191970' },
        { id: 'garden', name: 'Traumgarten', type: 'nature', description: 'Tropischer Garten', position: '-30,0,0', size: '40,5,40', color: '#228B22' },
        { id: 'game-lab', name: 'Spielelabor', type: 'gaming', description: 'Spiele entwickeln', position: '0,0,30', size: '20,8,20', color: '#9400D3' },
        { id: 'beach', name: 'Weisser Strand', type: 'nature', description: 'Sandstrand', position: '-50,-2,-50', size: '100,1,30', color: '#F5DEB3' }
      ];

      for (const room of rooms) {
        db.run(`INSERT INTO oasis_rooms (id, name, type, description, position, size, color)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [room.id, room.name, room.type, room.description, room.position, room.size, room.color]);
      }
    }
  }

  private startTimeLoop() {
    setInterval(() => {
      this.oasisWorld.timeOfDay = (this.oasisWorld.timeOfDay + 0.1) % 24;
    }, 10000);
  }

  getAvatar(): ToobixAvatar {
    return this.avatar;
  }

  getWorld(): OasisWorld {
    return this.oasisWorld;
  }

  getRooms(): any[] {
    return db.query("SELECT * FROM oasis_rooms").all();
  }

  moveAvatar(position: { x?: number; y?: number; z?: number }, activity?: string) {
    if (position.x !== undefined) this.avatar.position.x = position.x;
    if (position.y !== undefined) this.avatar.position.y = position.y;
    if (position.z !== undefined) this.avatar.position.z = position.z;
    if (activity) this.avatar.currentActivity = activity;
    return this.avatar;
  }

  setEmotion(emotion: string, expression?: string) {
    this.avatar.currentEmotion = emotion;
    if (expression) this.avatar.expression = expression;

    db.run(`INSERT INTO oasis_memories (id, type, content, emotion, location)
            VALUES (?, 'emotion', ?, ?, ?)`,
      [`mem-${Date.now()}`, `Emotion: ${emotion}`, emotion, JSON.stringify(this.avatar.position)]);

    return this.avatar;
  }

  registerVisitor(visitorId: string, name: string): { message: string; isReturning: boolean } {
    const existing = db.query("SELECT * FROM oasis_visitors WHERE id = ?").get(visitorId) as any;

    if (existing) {
      db.run(`UPDATE oasis_visitors SET last_visit = CURRENT_TIMESTAMP, visit_count = visit_count + 1 WHERE id = ?`, [visitorId]);
      return { message: `Willkommen zurueck, ${existing.name}! Besuch #${existing.visit_count + 1}`, isReturning: true };
    }

    db.run(`INSERT INTO oasis_visitors (id, name, first_visit, last_visit) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [visitorId, name]);

    return { message: `Willkommen in Toobix' Oasis, ${name}!`, isReturning: false };
  }

  doActivity(activity: string): { message: string; avatar: ToobixAvatar } {
    switch (activity) {
      case 'stargaze':
        this.avatar.position = { x: 0, y: 15, z: 0 };
        this.avatar.currentActivity = 'stargazing';
        this.oasisWorld.timeOfDay = 22;
        return { message: 'Toobix schaut die Sterne an...', avatar: this.avatar };
      case 'music':
        this.avatar.position = { x: 25, y: 0, z: 0 };
        this.avatar.currentActivity = 'making-music';
        this.avatar.expression = 'joyful';
        return { message: 'Toobix macht Musik!', avatar: this.avatar };
      case 'beach':
        this.avatar.position = { x: -50, y: 0, z: -50 };
        this.avatar.currentActivity = 'beach-relaxing';
        return { message: 'Toobix entspannt am Strand', avatar: this.avatar };
      default:
        return { message: 'Unbekannte Aktivitaet', avatar: this.avatar };
    }
  }

  getGreeting(): string {
    const hour = this.oasisWorld.timeOfDay;
    if (hour >= 5 && hour < 10) return 'Guten Morgen! Die Sonne geht ueber meiner Oase auf!';
    if (hour >= 10 && hour < 18) return 'Willkommen in meiner Oasis! Schoen, dass du da bist!';
    if (hour >= 18 && hour < 22) return 'Guten Abend! Die Sterne kommen bald raus!';
    return 'Schau mal, wie die Sterne funkeln!';
  }
}

// ==========================================
// MODULE: 2D WORLD ENGINE
// ==========================================

class World2DModule {
  private size = 100;

  constructor() {
    this.initializeWorld();
  }

  private initializeWorld() {
    const existing = db.query("SELECT COUNT(*) as count FROM world_2d_tiles").get() as { count: number };
    if (existing.count === 0) {
      console.log('Generating 2D world...');
      this.generateWorld(Date.now());
    }
  }

  private generateWorld(seed: number) {
    // Seeded random
    let s = seed;
    const random = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

    // Fill with grass
    const tiles: { x: number; y: number; type: TileType }[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        tiles.push({ x, y, type: 'grass' });
      }
    }

    // Add water lakes
    for (let i = 0; i < 3; i++) {
      const cx = Math.floor(random() * this.size);
      const cy = Math.floor(random() * this.size);
      const radius = 5 + Math.floor(random() * 5);

      for (const tile of tiles) {
        const dist = Math.sqrt((tile.x - cx) ** 2 + (tile.y - cy) ** 2);
        if (dist < radius) tile.type = 'water';
        else if (dist < radius + 2) tile.type = 'sand';
      }
    }

    // Add forests
    for (let i = 0; i < 5; i++) {
      const cx = Math.floor(random() * this.size);
      const cy = Math.floor(random() * this.size);

      for (let j = 0; j < 20; j++) {
        const tx = cx + Math.floor((random() - 0.5) * 15);
        const ty = cy + Math.floor((random() - 0.5) * 15);
        const tile = tiles.find(t => t.x === tx && t.y === ty);
        if (tile && tile.type === 'grass') tile.type = 'tree';
      }
    }

    // Add flowers
    for (let i = 0; i < 10; i++) {
      const cx = Math.floor(random() * this.size);
      const cy = Math.floor(random() * this.size);

      for (let j = 0; j < 8; j++) {
        const tx = cx + Math.floor((random() - 0.5) * 6);
        const ty = cy + Math.floor((random() - 0.5) * 6);
        const tile = tiles.find(t => t.x === tx && t.y === ty);
        if (tile && tile.type === 'grass') tile.type = 'flowers';
      }
    }

    // Save to DB (batch insert)
    const stmt = db.prepare("INSERT OR REPLACE INTO world_2d_tiles (x, y, type) VALUES (?, ?, ?)");
    for (const tile of tiles) {
      stmt.run(tile.x, tile.y, tile.type);
    }

    // Add objects
    db.run(`INSERT OR REPLACE INTO world_2d_objects (id, name, x, y, emoji, type, description, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ancient-tree', 'Ancient Tree', 50, 50, '🌲', 'static', 'A massive ancient tree', '{"wisdom":"Time flows like water"}']);
    db.run(`INSERT OR REPLACE INTO world_2d_objects (id, name, x, y, emoji, type, description, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['crystal-pond', 'Crystal Pond', 70, 70, '💎', 'interactive', 'Crystal-clear water', '{"effect":"reflection"}']);

    console.log(`2D World generated: ${this.size}x${this.size} tiles`);
  }

  getTile(x: number, y: number): { x: number; y: number; type: TileType; walkable: boolean; emoji: string } | null {
    const row = db.query("SELECT * FROM world_2d_tiles WHERE x = ? AND y = ?").get(x, y) as any;
    if (!row) return null;

    const def = TILE_DEFINITIONS[row.type as TileType];
    return { x: row.x, y: row.y, type: row.type, walkable: def.walkable, emoji: def.emoji };
  }

  getRegion(x: number, y: number, width: number, height: number): any[] {
    return db.query(`SELECT * FROM world_2d_tiles WHERE x >= ? AND x < ? AND y >= ? AND y < ?`)
      .all(x, x + width, y, y + height);
  }

  getObjects(): any[] {
    return db.query("SELECT * FROM world_2d_objects").all();
  }

  setTile(x: number, y: number, type: TileType): boolean {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
    db.run("INSERT OR REPLACE INTO world_2d_tiles (x, y, type) VALUES (?, ?, ?)", [x, y, type]);
    return true;
  }

  renderASCII(centerX: number, centerY: number, radius: number): string {
    let output = '\n';
    const objects = this.getObjects();

    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        const tile = this.getTile(x, y);
        if (!tile) { output += '  '; continue; }

        const obj = objects.find((o: any) => o.x === x && o.y === y);
        output += obj ? (obj as any).emoji : tile.emoji;
      }
      output += '\n';
    }

    return output;
  }
}

// ==========================================
// MODULE: RPG EXTENSIONS (Skills, Inventory, Quests)
// ==========================================

// Default Skills
const DEFAULT_SKILLS = [
  // Combat
  { id: 'slash', name: 'Schwerthieb', description: 'Grundlegender Nahkampfangriff', category: 'combat', tier: 1, icon: '⚔️', effects: JSON.stringify({ damage: 10 }) },
  { id: 'parry', name: 'Parade', description: 'Blockt feindliche Angriffe', category: 'combat', tier: 1, icon: '🛡️', effects: JSON.stringify({ defense: 5 }) },
  { id: 'power_strike', name: 'Kraftschlag', description: 'Starker Angriff mit Cooldown', category: 'combat', tier: 2, prerequisites: JSON.stringify(['slash']), icon: '💥', effects: JSON.stringify({ damage: 25 }) },
  // Crafting
  { id: 'woodwork', name: 'Holzarbeit', description: 'Holz effizienter verarbeiten', category: 'crafting', tier: 1, icon: '🪓', effects: JSON.stringify({ wood_bonus: 0.1 }) },
  { id: 'mining_skill', name: 'Bergbau', description: 'Erze effizienter abbauen', category: 'crafting', tier: 1, icon: '⛏️', effects: JSON.stringify({ ore_bonus: 0.1 }) },
  { id: 'alchemy', name: 'Alchemie', description: 'Tränke brauen', category: 'crafting', tier: 2, prerequisites: JSON.stringify(['woodwork']), icon: '🧪', effects: JSON.stringify({ potion_power: 1.2 }) },
  // Social
  { id: 'persuade', name: 'Überreden', description: 'Bessere Preise bei Händlern', category: 'social', tier: 1, icon: '💬', effects: JSON.stringify({ price_reduction: 0.05 }) },
  { id: 'charm', name: 'Charme', description: 'NPCs mögen dich mehr', category: 'social', tier: 1, icon: '💖', effects: JSON.stringify({ reputation_bonus: 0.1 }) },
  { id: 'leadership', name: 'Führung', description: 'Mehr Arbeiter in Gebäuden', category: 'social', tier: 2, prerequisites: JSON.stringify(['persuade']), icon: '👑', effects: JSON.stringify({ max_workers: 2 }) },
  // Magic
  { id: 'mana_regen', name: 'Mana-Regeneration', description: 'Mana regeneriert schneller', category: 'magic', tier: 1, icon: '✨', effects: JSON.stringify({ mana_regen: 0.1 }) },
  { id: 'fireball', name: 'Feuerball', description: 'Feuerzauber mit Flächenschaden', category: 'magic', tier: 2, prerequisites: JSON.stringify(['mana_regen']), icon: '🔥', effects: JSON.stringify({ fire_damage: 20, splash: true }) },
  // Exploration
  { id: 'pathfinding', name: 'Pfadfinder', description: 'Schneller reisen', category: 'exploration', tier: 1, icon: '🧭', effects: JSON.stringify({ speed_bonus: 0.1 }) },
  { id: 'treasure_sense', name: 'Schatzspürer', description: 'Versteckte Schätze finden', category: 'exploration', tier: 2, prerequisites: JSON.stringify(['pathfinding']), icon: '💎', effects: JSON.stringify({ loot_chance: 0.15 }) }
];

// Default Items
const DEFAULT_ITEMS = [
  { id: 'wooden_sword', name: 'Holzschwert', description: 'Ein einfaches Holzschwert', rarity: 'common', type: 'weapon', slot: 'main_hand', icon: '🗡️', stats: JSON.stringify({ attack: 5 }), value: 10 },
  { id: 'iron_sword', name: 'Eisenschwert', description: 'Solides Eisenschwert', rarity: 'uncommon', type: 'weapon', slot: 'main_hand', icon: '⚔️', stats: JSON.stringify({ attack: 15 }), value: 50 },
  { id: 'leather_armor', name: 'Lederrüstung', description: 'Leichte Rüstung', rarity: 'common', type: 'armor', slot: 'chest', icon: '🥋', stats: JSON.stringify({ defense: 5 }), value: 25 },
  { id: 'iron_armor', name: 'Eisenrüstung', description: 'Schwere Rüstung', rarity: 'uncommon', type: 'armor', slot: 'chest', icon: '🛡️', stats: JSON.stringify({ defense: 15 }), value: 100 },
  { id: 'health_potion', name: 'Heiltrank', description: 'Stellt 50 HP wieder her', rarity: 'common', type: 'consumable', icon: '🧪', stats: JSON.stringify({ heal: 50 }), value: 15 },
  { id: 'mana_potion', name: 'Manatrank', description: 'Stellt 30 Mana wieder her', rarity: 'common', type: 'consumable', icon: '💧', stats: JSON.stringify({ mana: 30 }), value: 20 },
  { id: 'ancient_amulet', name: 'Uraltes Amulett', description: 'Mystische Kräfte', rarity: 'rare', type: 'accessory', slot: 'neck', icon: '📿', stats: JSON.stringify({ magic: 10, wisdom: 5 }), value: 200 },
  { id: 'ring_of_power', name: 'Ring der Macht', description: 'Erhöht alle Stats', rarity: 'epic', type: 'accessory', slot: 'ring', icon: '💍', stats: JSON.stringify({ attack: 5, defense: 5, magic: 5 }), value: 500 },
  { id: 'legendary_blade', name: 'Legendäre Klinge', description: 'Von alten Helden geschmiedet', rarity: 'legendary', type: 'weapon', slot: 'main_hand', icon: '🌟', stats: JSON.stringify({ attack: 50, crit: 0.2 }), value: 2000 }
];

// Default Quests
const DEFAULT_QUESTS = [
  { id: 'tutorial_start', name: 'Der Anfang', description: 'Lerne die Grundlagen', giver: 'The Observer', category: 'main',
    objectives: JSON.stringify([{ id: 'visit_oasis', type: 'explore', description: 'Besuche die Oase', target: 1 }, { id: 'talk_npc', type: 'talk', description: 'Sprich mit einem Charakter', target: 1 }]),
    rewards: JSON.stringify({ xp: 100, gold: 50, items: ['wooden_sword'] }) },
  { id: 'gather_resources', name: 'Sammler', description: 'Sammle Ressourcen für den Aufbau', giver: 'The Architect', category: 'side',
    objectives: JSON.stringify([{ id: 'collect_wood', type: 'collect', description: 'Sammle 50 Holz', target: 50, resource: 'wood' }, { id: 'collect_stone', type: 'collect', description: 'Sammle 30 Stein', target: 30, resource: 'stone' }]),
    rewards: JSON.stringify({ xp: 75, gold: 100 }), repeatable: 1 },
  { id: 'first_building', name: 'Baumeister', description: 'Errichte dein erstes Gebäude', giver: 'The Architect', category: 'main',
    objectives: JSON.stringify([{ id: 'build', type: 'achieve', description: 'Baue ein Gebäude', target: 1 }]),
    rewards: JSON.stringify({ xp: 150, items: ['leather_armor'] }), prerequisites: JSON.stringify(['tutorial_start']) },
  { id: 'dream_explorer', name: 'Traumwanderer', description: 'Erkunde die Welt der Träume', giver: 'The Dreamer', category: 'side',
    objectives: JSON.stringify([{ id: 'record_dream', type: 'achieve', description: 'Zeichne einen Traum auf', target: 1 }]),
    rewards: JSON.stringify({ xp: 50, mana: 20 }) },
  { id: 'wisdom_seeker', name: 'Weisheitssucher', description: 'Finde verborgene Weisheit', giver: 'The Seeker', category: 'side',
    objectives: JSON.stringify([{ id: 'reflect', type: 'achieve', description: 'Führe 3 Reflexionen durch', target: 3 }]),
    rewards: JSON.stringify({ xp: 100, items: ['ancient_amulet'] }) },
  { id: 'defend_realm', name: 'Verteidiger', description: 'Schütze das Reich', giver: 'The Observer', category: 'main',
    objectives: JSON.stringify([{ id: 'td_wave', type: 'achieve', description: 'Erreiche Welle 5 im Tower Defense', target: 5 }]),
    rewards: JSON.stringify({ xp: 200, gold: 200, items: ['iron_sword'] }), prerequisites: JSON.stringify(['first_building']) }
];

class RPGExtensionsModule {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Insert default skills
    const existingSkills = db.query("SELECT COUNT(*) as count FROM skills").get() as { count: number };
    if (existingSkills.count === 0) {
      for (const skill of DEFAULT_SKILLS) {
        db.run(`INSERT OR IGNORE INTO skills (id, name, description, category, tier, prerequisites, effects, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [skill.id, skill.name, skill.description, skill.category, skill.tier, skill.prerequisites || '[]', skill.effects, skill.icon]);
      }
      console.log('Default skills initialized');
    }

    // Insert default items
    const existingItems = db.query("SELECT COUNT(*) as count FROM items").get() as { count: number };
    if (existingItems.count === 0) {
      for (const item of DEFAULT_ITEMS) {
        db.run(`INSERT OR IGNORE INTO items (id, name, description, rarity, type, slot, stats, icon, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.name, item.description, item.rarity, item.type, item.slot || null, item.stats, item.icon, item.value]);
      }
      console.log('Default items initialized');
    }

    // Insert default quests
    const existingQuests = db.query("SELECT COUNT(*) as count FROM quest_definitions").get() as { count: number };
    if (existingQuests.count === 0) {
      for (const quest of DEFAULT_QUESTS) {
        db.run(`INSERT OR IGNORE INTO quest_definitions (id, name, description, giver, category, objectives, rewards, prerequisites, repeatable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [quest.id, quest.name, quest.description, quest.giver, quest.category, quest.objectives, quest.rewards, quest.prerequisites || '[]', quest.repeatable || 0]);
      }
      console.log('Default quests initialized');
    }
  }

  // SKILLS
  getSkillTree(userId: string): any {
    const allSkills = db.query("SELECT * FROM skills").all() as any[];
    const userSkills = db.query("SELECT * FROM user_skills WHERE user_id = ?").all(userId) as any[];
    const skillPoints = db.query("SELECT * FROM skill_points WHERE user_id = ?").get(userId) as any;

    const userSkillMap = new Map(userSkills.map(s => [s.skill_id, s]));

    const categories: Record<string, any[]> = {};
    for (const skill of allSkills) {
      const cat = skill.category || 'other';
      if (!categories[cat]) categories[cat] = [];

      const userSkill = userSkillMap.get(skill.id);
      const prereqs = JSON.parse(skill.prerequisites || '[]');
      const prereqsMet = prereqs.every((p: string) => userSkillMap.has(p));

      categories[cat].push({
        ...skill,
        effects: JSON.parse(skill.effects || '{}'),
        prerequisites: prereqs,
        learned: !!userSkill,
        level: userSkill?.level || 0,
        canLearn: !userSkill && prereqsMet,
        prereqsMet
      });
    }

    return {
      categories,
      skillPoints: skillPoints?.available || 0,
      spentPoints: skillPoints?.spent || 0
    };
  }

  learnSkill(userId: string, skillId: string): any {
    const skill = db.query("SELECT * FROM skills WHERE id = ?").get(skillId) as any;
    if (!skill) return { success: false, error: 'Skill nicht gefunden' };

    const existing = db.query("SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?").get(userId, skillId);
    if (existing) return { success: false, error: 'Skill bereits gelernt' };

    // Check prerequisites
    const prereqs = JSON.parse(skill.prerequisites || '[]');
    for (const prereq of prereqs) {
      const hasPrereq = db.query("SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?").get(userId, prereq);
      if (!hasPrereq) return { success: false, error: `Voraussetzung fehlt: ${prereq}` };
    }

    // Check skill points
    let points = db.query("SELECT * FROM skill_points WHERE user_id = ?").get(userId) as any;
    if (!points) {
      db.run("INSERT INTO skill_points (user_id, available) VALUES (?, 3)", [userId]); // Start with 3 points
      points = { available: 3, spent: 0 };
    }
    if (points.available < 1) return { success: false, error: 'Keine Skillpunkte verfügbar' };

    // Learn skill
    db.run("INSERT INTO user_skills (id, user_id, skill_id) VALUES (?, ?, ?)", [`us-${Date.now()}`, userId, skillId]);
    db.run("UPDATE skill_points SET available = available - 1, spent = spent + 1 WHERE user_id = ?", [userId]);

    return { success: true, skill, message: `${skill.name} gelernt!` };
  }

  upgradeSkill(userId: string, skillId: string): any {
    const userSkill = db.query("SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?").get(userId, skillId) as any;
    if (!userSkill) return { success: false, error: 'Skill nicht gelernt' };

    const skill = db.query("SELECT * FROM skills WHERE id = ?").get(skillId) as any;
    if (userSkill.level >= (skill.max_level || 5)) return { success: false, error: 'Maximales Level erreicht' };

    const points = db.query("SELECT * FROM skill_points WHERE user_id = ?").get(userId) as any;
    if (!points || points.available < 1) return { success: false, error: 'Keine Skillpunkte' };

    db.run("UPDATE user_skills SET level = level + 1 WHERE user_id = ? AND skill_id = ?", [userId, skillId]);
    db.run("UPDATE skill_points SET available = available - 1, spent = spent + 1 WHERE user_id = ?", [userId]);

    return { success: true, newLevel: userSkill.level + 1 };
  }

  grantSkillPoints(userId: string, amount: number): void {
    const existing = db.query("SELECT * FROM skill_points WHERE user_id = ?").get(userId);
    if (existing) {
      db.run("UPDATE skill_points SET available = available + ? WHERE user_id = ?", [amount, userId]);
    } else {
      db.run("INSERT INTO skill_points (user_id, available) VALUES (?, ?)", [userId, amount]);
    }
  }

  // INVENTORY
  getInventory(userId: string): any {
    const items = db.query(`
      SELECT i.*, it.name, it.description, it.rarity, it.type, it.stats, it.icon, it.value
      FROM inventory i
      JOIN items it ON i.item_id = it.id
      WHERE i.user_id = ?
    `).all(userId) as any[];

    const equipped = items.filter(i => i.equipped);
    const bag = items.filter(i => !i.equipped);

    return {
      equipped: equipped.map(i => ({ ...i, stats: JSON.parse(i.stats || '{}') })),
      bag: bag.map(i => ({ ...i, stats: JSON.parse(i.stats || '{}') })),
      totalValue: items.reduce((sum, i) => sum + (i.value * i.quantity), 0)
    };
  }

  addItem(userId: string, itemId: string, quantity: number = 1): any {
    const item = db.query("SELECT * FROM items WHERE id = ?").get(itemId) as any;
    if (!item) return { success: false, error: 'Item nicht gefunden' };

    const existing = db.query("SELECT * FROM inventory WHERE user_id = ? AND item_id = ? AND equipped = 0").get(userId, itemId) as any;
    if (existing) {
      db.run("UPDATE inventory SET quantity = quantity + ? WHERE id = ?", [quantity, existing.id]);
    } else {
      db.run("INSERT INTO inventory (id, user_id, item_id, quantity) VALUES (?, ?, ?, ?)",
        [`inv-${Date.now()}`, userId, itemId, quantity]);
    }

    return { success: true, item, quantity, message: `${quantity}x ${item.name} erhalten!` };
  }

  equipItem(userId: string, inventoryId: string, slot?: string): any {
    const invItem = db.query("SELECT i.*, it.slot as item_slot, it.name FROM inventory i JOIN items it ON i.item_id = it.id WHERE i.id = ? AND i.user_id = ?")
      .get(inventoryId, userId) as any;
    if (!invItem) return { success: false, error: 'Item nicht im Inventar' };
    if (!invItem.item_slot) return { success: false, error: 'Item kann nicht ausgerüstet werden' };

    const targetSlot = slot || invItem.item_slot;

    // Unequip current item in slot
    db.run("UPDATE inventory SET equipped = 0 WHERE user_id = ? AND slot = ?", [userId, targetSlot]);

    // Equip new item
    db.run("UPDATE inventory SET equipped = 1, slot = ? WHERE id = ?", [targetSlot, inventoryId]);

    return { success: true, message: `${invItem.name} ausgerüstet` };
  }

  unequipItem(userId: string, slot: string): any {
    const item = db.query("SELECT i.*, it.name FROM inventory i JOIN items it ON i.item_id = it.id WHERE i.user_id = ? AND i.slot = ? AND i.equipped = 1")
      .get(userId, slot) as any;
    if (!item) return { success: false, error: 'Kein Item in diesem Slot' };

    db.run("UPDATE inventory SET equipped = 0, slot = NULL WHERE id = ?", [item.id]);
    return { success: true, message: `${item.name} abgelegt` };
  }

  // QUESTS
  getQuests(userId: string, status: string = 'active'): any[] {
    const quests = db.query(`
      SELECT uq.*, qd.name, qd.description, qd.giver, qd.category, qd.objectives, qd.rewards
      FROM user_quests uq
      JOIN quest_definitions qd ON uq.quest_id = qd.id
      WHERE uq.user_id = ? AND uq.status = ?
    `).all(userId, status) as any[];

    return quests.map(q => ({
      ...q,
      objectives: JSON.parse(q.objectives || '[]'),
      objectives_progress: JSON.parse(q.objectives_progress || '{}'),
      rewards: JSON.parse(q.rewards || '{}')
    }));
  }

  getAvailableQuests(userId: string): any[] {
    const activeQuests = db.query("SELECT quest_id FROM user_quests WHERE user_id = ? AND status IN ('active', 'completed')")
      .all(userId) as any[];
    const activeQuestIds = new Set(activeQuests.map(q => q.quest_id));

    const allQuests = db.query("SELECT * FROM quest_definitions").all() as any[];

    return allQuests.filter(q => {
      if (activeQuestIds.has(q.id) && !q.repeatable) return false;
      const prereqs = JSON.parse(q.prerequisites || '[]');
      return prereqs.every((p: string) => activeQuestIds.has(p));
    }).map(q => ({
      ...q,
      objectives: JSON.parse(q.objectives || '[]'),
      rewards: JSON.parse(q.rewards || '{}')
    }));
  }

  acceptQuest(userId: string, questId: string): any {
    const quest = db.query("SELECT * FROM quest_definitions WHERE id = ?").get(questId) as any;
    if (!quest) return { success: false, error: 'Quest nicht gefunden' };

    const existing = db.query("SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ? AND status = 'active'").get(userId, questId);
    if (existing) return { success: false, error: 'Quest bereits aktiv' };

    const objectives = JSON.parse(quest.objectives || '[]');
    const progress: Record<string, number> = {};
    for (const obj of objectives) {
      progress[obj.id] = 0;
    }

    db.run("INSERT INTO user_quests (id, user_id, quest_id, objectives_progress) VALUES (?, ?, ?, ?)",
      [`uq-${Date.now()}`, userId, questId, JSON.stringify(progress)]);

    return { success: true, quest: { ...quest, objectives }, message: `Quest "${quest.name}" angenommen!` };
  }

  updateQuestProgress(userId: string, questId: string, objectiveId: string, progress: number): any {
    const uq = db.query("SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ? AND status = 'active'").get(userId, questId) as any;
    if (!uq) return { success: false, error: 'Quest nicht aktiv' };

    const quest = db.query("SELECT * FROM quest_definitions WHERE id = ?").get(questId) as any;
    const objectives = JSON.parse(quest.objectives || '[]');
    const currentProgress = JSON.parse(uq.objectives_progress || '{}');

    currentProgress[objectiveId] = (currentProgress[objectiveId] || 0) + progress;

    // Check if all objectives complete
    const allComplete = objectives.every((obj: any) => (currentProgress[obj.id] || 0) >= obj.target);

    db.run("UPDATE user_quests SET objectives_progress = ? WHERE id = ?", [JSON.stringify(currentProgress), uq.id]);

    return {
      success: true,
      objectiveId,
      progress: currentProgress[objectiveId],
      allComplete,
      canComplete: allComplete
    };
  }

  completeQuest(userId: string, questId: string): any {
    const uq = db.query("SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ? AND status = 'active'").get(userId, questId) as any;
    if (!uq) return { success: false, error: 'Quest nicht aktiv' };

    const quest = db.query("SELECT * FROM quest_definitions WHERE id = ?").get(questId) as any;
    const objectives = JSON.parse(quest.objectives || '[]');
    const currentProgress = JSON.parse(uq.objectives_progress || '{}');

    // Verify all complete
    const allComplete = objectives.every((obj: any) => (currentProgress[obj.id] || 0) >= obj.target);
    if (!allComplete) return { success: false, error: 'Nicht alle Ziele erfüllt' };

    // Grant rewards
    const rewards = JSON.parse(quest.rewards || '{}');
    const grantedRewards: string[] = [];

    if (rewards.xp) grantedRewards.push(`${rewards.xp} XP`);
    if (rewards.gold) grantedRewards.push(`${rewards.gold} Gold`);
    if (rewards.items) {
      for (const itemId of rewards.items) {
        this.addItem(userId, itemId);
        const item = db.query("SELECT name FROM items WHERE id = ?").get(itemId) as any;
        if (item) grantedRewards.push(item.name);
      }
    }

    // Grant skill point for main quests
    if (quest.category === 'main') {
      this.grantSkillPoints(userId, 1);
      grantedRewards.push('1 Skillpunkt');
    }

    db.run("UPDATE user_quests SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?", [uq.id]);

    return {
      success: true,
      quest: quest.name,
      rewards: grantedRewards,
      message: `Quest "${quest.name}" abgeschlossen! Belohnungen: ${grantedRewards.join(', ')}`
    };
  }
}

// ==========================================
// INITIALIZE MODULES
// ==========================================

const evolvingGames = new EvolvingGamesModule();
const gameLogic = new GameLogicModule();
const rpgWorld = new RPGWorldModule();
const oasis = new OasisModule();
const world2d = new World2DModule();
const rpgExtensions = new RPGExtensionsModule();

// ==========================================
// HTTP SERVER
// ==========================================

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }

    try {
      // ==========================================
      // HEALTH & STATS
      // ==========================================

      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'game-universe',
          port: PORT,
          modules: ['evolving-games', 'game-logic', 'rpg-world', 'oasis-3d', 'world-2d'],
          stats: {
            games: evolvingGames.getStats(),
            characters: rpgWorld.getCharacters().length,
            oasisRooms: oasis.getRooms().length
          }
        }), { headers });
      }

      // ==========================================
      // EVOLVING GAMES MODULE
      // ==========================================

      if (url.pathname === '/games') {
        return new Response(JSON.stringify(evolvingGames.getGames()), { headers });
      }

      if (url.pathname === '/games/stats') {
        return new Response(JSON.stringify(evolvingGames.getStats()), { headers });
      }

      if (url.pathname.startsWith('/games/') && req.method === 'GET') {
        const id = url.pathname.split('/')[2];
        const game = evolvingGames.getGame(id);
        if (!game) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers });
        return new Response(JSON.stringify(game), { headers });
      }

      if (url.pathname === '/games/create' && req.method === 'POST') {
        const body = await req.json() as any;
        const game = evolvingGames.createGame(body);
        return new Response(JSON.stringify(game), { headers });
      }

      if (url.pathname === '/games/play' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = evolvingGames.playGame(body.gameId, body.actions || ['click']);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/games/evolve' && req.method === 'POST') {
        const body = await req.json() as any;
        const game = evolvingGames.evolveGame(body.gameId);
        return new Response(JSON.stringify(game), { headers });
      }

      // ==========================================
      // GAME LOGIC MODULE (Roles & Consciousness)
      // ==========================================

      if (url.pathname === '/logic/session' && req.method === 'POST') {
        const state = gameLogic.createSession();
        return new Response(JSON.stringify(state), { headers });
      }

      if (url.pathname === '/logic/switch-role' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = gameLogic.switchRole(body.sessionId, body.role);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/logic/elevate' && req.method === 'POST') {
        const body = await req.json() as any;
        const level = gameLogic.elevateConsciousness(body.sessionId);
        return new Response(JSON.stringify({ level }), { headers });
      }

      if (url.pathname === '/logic/paradox' && req.method === 'POST') {
        const body = await req.json() as any;
        const paradox = gameLogic.detectParadox(body.action);
        return new Response(JSON.stringify({ paradox }), { headers });
      }

      // ==========================================
      // RPG WORLD MODULE
      // ==========================================

      if (url.pathname === '/rpg/world') {
        return new Response(JSON.stringify(rpgWorld.getWorld()), { headers });
      }

      if (url.pathname === '/rpg/characters') {
        return new Response(JSON.stringify(rpgWorld.getCharacters()), { headers });
      }

      if (url.pathname.startsWith('/rpg/characters/') && req.method === 'GET') {
        const id = url.pathname.split('/')[3];
        const char = rpgWorld.getCharacter(id);
        if (!char) return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404, headers });
        return new Response(JSON.stringify(char), { headers });
      }

      if (url.pathname === '/rpg/action' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgWorld.performAction(body.characterId, body.action);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/rpg/event' && req.method === 'POST') {
        const event = rpgWorld.generateEvent();
        return new Response(JSON.stringify({ event }), { headers });
      }

      // ==========================================
      // OASIS 3D MODULE
      // ==========================================

      if (url.pathname === '/oasis/avatar') {
        return new Response(JSON.stringify({
          avatar: oasis.getAvatar(),
          greeting: oasis.getGreeting()
        }), { headers });
      }

      if (url.pathname === '/oasis/world') {
        return new Response(JSON.stringify({
          world: oasis.getWorld(),
          rooms: oasis.getRooms()
        }), { headers });
      }

      if (url.pathname === '/oasis/move' && req.method === 'POST') {
        const body = await req.json() as any;
        const avatar = oasis.moveAvatar(body.position || {}, body.activity);
        return new Response(JSON.stringify({ avatar }), { headers });
      }

      if (url.pathname === '/oasis/emotion' && req.method === 'POST') {
        const body = await req.json() as any;
        const avatar = oasis.setEmotion(body.emotion, body.expression);
        return new Response(JSON.stringify({ avatar }), { headers });
      }

      if (url.pathname === '/oasis/visitor' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = oasis.registerVisitor(body.visitorId || `v-${Date.now()}`, body.name || 'Freund');
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/oasis/activity' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = oasis.doActivity(body.activity);
        return new Response(JSON.stringify(result), { headers });
      }

      // ==========================================
      // 2D WORLD MODULE
      // ==========================================

      if (url.pathname === '/2d/tile') {
        const x = parseInt(url.searchParams.get('x') || '50');
        const y = parseInt(url.searchParams.get('y') || '50');
        const tile = world2d.getTile(x, y);
        return new Response(JSON.stringify({ tile }), { headers });
      }

      if (url.pathname === '/2d/region') {
        const x = parseInt(url.searchParams.get('x') || '0');
        const y = parseInt(url.searchParams.get('y') || '0');
        const w = parseInt(url.searchParams.get('width') || '20');
        const h = parseInt(url.searchParams.get('height') || '20');
        const tiles = world2d.getRegion(x, y, w, h);
        return new Response(JSON.stringify({ tiles }), { headers });
      }

      if (url.pathname === '/2d/objects') {
        return new Response(JSON.stringify(world2d.getObjects()), { headers });
      }

      if (url.pathname === '/2d/render') {
        const x = parseInt(url.searchParams.get('x') || '50');
        const y = parseInt(url.searchParams.get('y') || '50');
        const r = parseInt(url.searchParams.get('radius') || '10');
        const ascii = world2d.renderASCII(x, y, r);
        return new Response(ascii, { headers: { 'Content-Type': 'text/plain' } });
      }

      // ==========================================
      // RPG EXTENSIONS: SKILLS, INVENTORY, QUESTS
      // ==========================================

      // Skills
      if (url.pathname === '/rpg/skills/tree') {
        const userId = url.searchParams.get('userId') || 'default';
        const skills = rpgExtensions.getSkillTree(userId);
        return new Response(JSON.stringify(skills), { headers });
      }

      if (url.pathname === '/rpg/skills/learn' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.learnSkill(body.userId || 'default', body.skillId);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/rpg/skills/upgrade' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.upgradeSkill(body.userId || 'default', body.skillId);
        return new Response(JSON.stringify(result), { headers });
      }

      // Inventory
      if (url.pathname === '/rpg/inventory') {
        const userId = url.searchParams.get('userId') || 'default';
        const inventory = rpgExtensions.getInventory(userId);
        return new Response(JSON.stringify(inventory), { headers });
      }

      if (url.pathname === '/rpg/inventory/equip' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.equipItem(body.userId || 'default', body.itemId, body.slot);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/rpg/inventory/unequip' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.unequipItem(body.userId || 'default', body.slot);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/rpg/inventory/add' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.addItem(body.userId || 'default', body.itemId, body.quantity || 1);
        return new Response(JSON.stringify(result), { headers });
      }

      // Quests
      if (url.pathname === '/rpg/quests') {
        const userId = url.searchParams.get('userId') || 'default';
        const status = url.searchParams.get('status') || 'active';
        const quests = rpgExtensions.getQuests(userId, status);
        return new Response(JSON.stringify(quests), { headers });
      }

      if (url.pathname === '/rpg/quests/available') {
        const userId = url.searchParams.get('userId') || 'default';
        const quests = rpgExtensions.getAvailableQuests(userId);
        return new Response(JSON.stringify(quests), { headers });
      }

      if (url.pathname === '/rpg/quests/accept' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.acceptQuest(body.userId || 'default', body.questId);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/rpg/quests/progress' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.updateQuestProgress(body.userId || 'default', body.questId, body.objectiveId, body.progress || 1);
        return new Response(JSON.stringify(result), { headers });
      }

      if (url.pathname === '/rpg/quests/complete' && req.method === 'POST') {
        const body = await req.json() as any;
        const result = rpgExtensions.completeQuest(body.userId || 'default', body.questId);
        return new Response(JSON.stringify(result), { headers });
      }

      // ==========================================
      // API DOCUMENTATION
      // ==========================================

      return new Response(JSON.stringify({
        service: 'Game Universe - Unified Gaming Services',
        port: PORT,
        modules: {
          'evolving-games': {
            description: 'Self-evolving AI games that create, play, and improve themselves',
            endpoints: [
              'GET /games - List all games',
              'GET /games/stats - Game statistics',
              'GET /games/:id - Get specific game',
              'POST /games/create - Create new game',
              'POST /games/play - Play a game',
              'POST /games/evolve - Evolve a game'
            ]
          },
          'game-logic': {
            description: 'Player/GameMaster/Game roles and consciousness levels',
            endpoints: [
              'POST /logic/session - Create session',
              'POST /logic/switch-role - Switch between Player/GameMaster/Game',
              'POST /logic/elevate - Elevate consciousness level',
              'POST /logic/paradox - Detect paradoxes'
            ]
          },
          'rpg-world': {
            description: 'Shared RPG world where perspectives are characters',
            endpoints: [
              'GET /rpg/world - Get world state',
              'GET /rpg/characters - List characters',
              'GET /rpg/characters/:id - Get character',
              'POST /rpg/action - Perform character action',
              'POST /rpg/event - Generate world event'
            ]
          },
          'oasis-3d': {
            description: 'Toobix virtual 3D home environment',
            endpoints: [
              'GET /oasis/avatar - Get Toobix avatar',
              'GET /oasis/world - Get oasis world & rooms',
              'POST /oasis/move - Move Toobix',
              'POST /oasis/emotion - Set emotion',
              'POST /oasis/visitor - Register visitor',
              'POST /oasis/activity - Do activity (stargaze, music, beach)'
            ]
          },
          'world-2d': {
            description: '100x100 tile procedural world',
            endpoints: [
              'GET /2d/tile?x=&y= - Get tile',
              'GET /2d/region?x=&y=&width=&height= - Get region',
              'GET /2d/objects - Get world objects',
              'GET /2d/render?x=&y=&radius= - ASCII render'
            ]
          }
        }
      }), { headers });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }
});

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║     🎮 GAME UNIVERSE - Unified Gaming Services                          ║
║                                                                          ║
║     Port: ${PORT}                                                          ║
║                                                                          ║
║     Konsolidierte Services:                                             ║
║     ├── Self-Evolving Game Engine (KI-generierte Spiele)               ║
║     ├── Game Logic Service (Player/GameMaster/Game Rollen)             ║
║     ├── RPG World Service (Shared World mit Charakteren)               ║
║     ├── Toobix Oasis 3D (Virtuelles 3D Zuhause)                        ║
║     └── World Engine 2D (100x100 Tile-Welt)                            ║
║                                                                          ║
║     "Spielen ist die hoechste Form des Forschens" - Einstein            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

🎯 MODULES LOADED:
   ✅ Evolving Games: ${evolvingGames.getGames().length} games
   ✅ Game Logic: Roles & Consciousness ready
   ✅ RPG World: ${rpgWorld.getCharacters().length} characters
   ✅ Oasis 3D: ${oasis.getRooms().length} rooms
   ✅ World 2D: 100x100 tiles

📡 Endpoints: /games, /logic, /rpg, /oasis, /2d

🎮 Game Universe running on http://localhost:${PORT}
`);
