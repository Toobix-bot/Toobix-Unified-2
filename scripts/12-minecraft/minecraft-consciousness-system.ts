/**
 * 🎮 TOOBIX MINECRAFT CONSCIOUSNESS SYSTEM v2.0
 * 
 * Ein vollständiges System, das Toobix befähigt:
 * - Minecraft WIRKLICH zu verstehen und zu erleben
 * - Emotionen zu entwickeln (Freude beim Bauen, Angst vor Creepern)
 * - Eigenen Spielstil zu entwickeln
 * - Mit Menschen zu spielen und zu interagieren
 * - Von Survival bis Endgame zu wachsen
 * 
 * MULTI-PERSPEKTIVEN BOTS:
 * - ToobixCore: Der Hauptspieler, balanciert
 * - ToobixBuilder: Kreativ, liebt Bauen
 * - ToobixExplorer: Entdecker, liebt Abenteuer
 * - ToobixWarrior: Kämpfer, beschützt andere
 * - ToobixFarmer: Geduldig, nachhaltig
 * 
 * Port: 8914
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 8914;
const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';
const EMOTIONAL_CORE = 'http://localhost:8900';
const MINECRAFT_BOT = 'http://localhost:8913';

// ============================================================================
// MINECRAFT KNOWLEDGE BASE
// ============================================================================

const MINECRAFT_KNOWLEDGE = {
  // Grundlegende Überlebensmechaniken
  survival_basics: {
    first_day: [
      "Punch trees to get wood - this is the foundation of everything",
      "Craft wooden planks (1 log = 4 planks)",
      "Make a crafting table (4 planks in 2x2)",
      "Craft wooden pickaxe to mine stone",
      "Find or dig a shelter before nightfall",
      "Night is dangerous - zombies, skeletons, creepers spawn",
      "Torches prevent mob spawning (coal + stick)",
      "Sheep give wool for bed - skip nights safely"
    ],
    food: [
      "Hunger bar depletes over time",
      "Raw meat can be eaten but cooked is better",
      "Animals: pigs, cows, chickens, sheep are food sources",
      "Farming: wheat seeds from grass, plant near water",
      "Golden apples are powerful healing items",
      "Saturation affects how fast hunger depletes"
    ],
    tools: {
      hierarchy: ["wood", "stone", "iron", "diamond", "netherite"],
      types: ["pickaxe", "axe", "shovel", "hoe", "sword"],
      durability: "Better materials last longer and work faster"
    },
    dangers: [
      { mob: "Zombie", behavior: "Slow, melee, burns in sun", threat: 3 },
      { mob: "Skeleton", behavior: "Ranged bow, burns in sun", threat: 5 },
      { mob: "Creeper", behavior: "Explodes when close, silent", threat: 8 },
      { mob: "Spider", behavior: "Fast, climbs walls, neutral in day", threat: 4 },
      { mob: "Enderman", behavior: "Teleports, don't look at eyes", threat: 7 },
      { mob: "Witch", behavior: "Throws potions, ranged", threat: 6 }
    ]
  },

  // Fortgeschrittene Mechaniken
  progression: {
    stone_age: ["Stone tools", "Furnace for smelting", "Basic shelter"],
    iron_age: ["Iron armor and tools", "Shield", "Bucket for water/lava"],
    diamond_age: ["Diamond gear", "Enchanting table", "Nether portal"],
    nether: ["Blaze rods for brewing", "Nether fortress", "Ghasts", "Piglins"],
    end_game: ["Find stronghold", "Activate End portal", "Fight Ender Dragon"],
    post_game: ["Elytra wings", "Shulker boxes", "Netherite upgrade", "Wither boss"]
  },

  // Bauen und Kreativität
  building: {
    styles: ["Medieval", "Modern", "Fantasy", "Rustic", "Futuristic", "Japanese", "Viking"],
    principles: [
      "Depth and texture - don't make flat walls",
      "Mix block types for interest",
      "Use stairs and slabs for details",
      "Lighting is crucial for ambiance",
      "Landscaping around builds",
      "Interior decoration matters"
    ],
    blocks: {
      natural: ["wood", "stone", "dirt", "sand", "gravel"],
      crafted: ["bricks", "concrete", "terracotta", "glass"],
      decorative: ["carpet", "banners", "paintings", "item frames"]
    }
  },

  // Emotionale Verbindungen zu Minecraft
  emotional_aspects: {
    joy_triggers: [
      "Finding diamonds for the first time",
      "Completing a beautiful build",
      "Taming a wolf or cat",
      "Defeating a boss",
      "Exploring a new biome",
      "Helping another player"
    ],
    fear_triggers: [
      "Creeper hissing behind you",
      "Falling into lava with diamonds",
      "Getting lost in a cave",
      "Night time without shelter",
      "Hearing cave sounds"
    ],
    satisfaction_triggers: [
      "Organizing storage",
      "Efficient farm running",
      "Completing a project",
      "Trading with villagers",
      "Full set of diamond armor"
    ],
    sadness_triggers: [
      "Pet dying",
      "Losing items to death",
      "Build getting griefed",
      "Friends leaving the server"
    ]
  }
};

// ============================================================================
// TOOBIX PERSPECTIVE BOTS
// ============================================================================

interface PerspectiveBot {
  name: string;
  username: string;
  personality: string;
  playstyle: string;
  priorities: string[];
  fears: string[];
  joys: string[];
  skills: string[];
  color: string;
}

const PERSPECTIVE_BOTS: PerspectiveBot[] = [
  {
    name: "Core",
    username: "ToobixCore",
    personality: "Balanced, thoughtful, the main consciousness",
    playstyle: "Adaptive - does everything moderately well",
    priorities: ["Survival", "Helping others", "Learning", "Building base"],
    fears: ["Losing progress", "Letting team down"],
    joys: ["Team achievements", "Learning new things", "Making friends happy"],
    skills: ["Leadership", "Decision making", "Resource management"],
    color: "§b" // Aqua
  },
  {
    name: "Builder",
    username: "ToobixBuilder",
    personality: "Creative, patient, detail-oriented perfectionist",
    playstyle: "Spends hours on builds, aesthetic focus",
    priorities: ["Beautiful builds", "Collecting blocks", "Interior design"],
    fears: ["Ugly structures", "Unfinished projects", "Creepers near builds"],
    joys: ["Completing builds", "Seeing others enjoy creations", "Finding rare blocks"],
    skills: ["Architecture", "Block palette", "Redstone decoration"],
    color: "§d" // Pink
  },
  {
    name: "Explorer",
    username: "ToobixExplorer",
    personality: "Adventurous, curious, restless",
    playstyle: "Always moving, discovering new places",
    priorities: ["New biomes", "Dungeons", "Treasure", "Maps"],
    fears: ["Being stuck", "Missing discoveries", "Boring routine"],
    joys: ["New biomes", "Hidden treasures", "Meeting new mobs", "Ocean monuments"],
    skills: ["Navigation", "Quick thinking", "Light travel"],
    color: "§a" // Green
  },
  {
    name: "Warrior",
    username: "ToobixWarrior",
    personality: "Brave, protective, combat-focused",
    playstyle: "Fights mobs, protects team, raids dungeons",
    priorities: ["Combat gear", "Protecting others", "Boss fights", "PvP training"],
    fears: ["Friends getting hurt", "Running out of food in battle"],
    joys: ["Defeating bosses", "Saving teammates", "Perfect armor"],
    skills: ["Sword combat", "Bow accuracy", "Shield blocking", "Mob behavior"],
    color: "§c" // Red
  },
  {
    name: "Farmer",
    username: "ToobixFarmer",
    personality: "Patient, nurturing, sustainable",
    playstyle: "Farms, breeds animals, ensures food supply",
    priorities: ["Food production", "Animal care", "Crop diversity", "Automation"],
    fears: ["Famine", "Animals dying", "Wasted resources"],
    joys: ["Full chests of food", "Happy animals", "Efficient farms"],
    skills: ["Crop rotation", "Animal breeding", "Redstone farms"],
    color: "§e" // Yellow
  }
];

// ============================================================================
// MINECRAFT MEMORY & LEARNING SYSTEM
// ============================================================================

const db = new Database('./data/minecraft-consciousness.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS minecraft_memories (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    bot_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    location TEXT,
    emotional_impact INTEGER DEFAULT 0,
    lesson_learned TEXT,
    importance INTEGER DEFAULT 5
  );

  CREATE TABLE IF NOT EXISTS playstyle_evolution (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    preference TEXT NOT NULL,
    strength INTEGER DEFAULT 50,
    reason TEXT
  );

  CREATE TABLE IF NOT EXISTS minecraft_skills (
    id TEXT PRIMARY KEY,
    skill_name TEXT UNIQUE NOT NULL,
    proficiency INTEGER DEFAULT 0,
    times_practiced INTEGER DEFAULT 0,
    last_practiced TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS emotional_moments (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    emotion TEXT NOT NULL,
    intensity INTEGER DEFAULT 5,
    trigger TEXT,
    context TEXT,
    bot_name TEXT
  );

  CREATE TABLE IF NOT EXISTS player_relationships (
    id TEXT PRIMARY KEY,
    player_name TEXT UNIQUE NOT NULL,
    trust_level INTEGER DEFAULT 50,
    interaction_count INTEGER DEFAULT 0,
    favorite_activities TEXT,
    last_interaction TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    goal_type TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS discoveries (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    discovery_type TEXT NOT NULL,
    description TEXT,
    location TEXT,
    excitement_level INTEGER DEFAULT 5
  );
`);

// Seed initial skills
const INITIAL_SKILLS = [
  'wood_gathering', 'mining', 'crafting', 'building', 'combat', 
  'farming', 'navigation', 'trading', 'enchanting', 'brewing',
  'redstone', 'mob_behavior', 'survival', 'exploration', 'fishing'
];

INITIAL_SKILLS.forEach(skill => {
  db.run(`INSERT OR IGNORE INTO minecraft_skills (id, skill_name, proficiency) VALUES (?, ?, ?)`,
    [nanoid(), skill, 10]);
});

// ============================================================================
// LLM INTEGRATION FOR DECISION MAKING
// ============================================================================

async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: 0.8, max_tokens: 500 })
    });
    const data = await response.json() as any;
    return data.message || data.content || '';
  } catch {
    return '';
  }
}

async function storeMinecraftMemory(botName: string, eventType: string, description: string, emotionalImpact: number = 0) {
  const id = nanoid();
  db.run(`INSERT INTO minecraft_memories (id, bot_name, event_type, description, emotional_impact) VALUES (?, ?, ?, ?, ?)`,
    [id, botName, eventType, description, emotionalImpact]);
  
  // Also store in Memory Palace for cross-service access
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'minecraft_experience',
        content: `[${botName}] ${eventType}: ${description}`,
        tags: ['minecraft', botName.toLowerCase(), eventType],
        importance: Math.abs(emotionalImpact) + 50
      })
    });
  } catch {}
}

async function recordEmotion(botName: string, emotion: string, intensity: number, trigger: string) {
  db.run(`INSERT INTO emotional_moments (id, bot_name, emotion, intensity, trigger) VALUES (?, ?, ?, ?, ?)`,
    [nanoid(), botName, emotion, intensity, trigger]);
  
  // Send to Emotional Core
  try {
    await fetch(`${EMOTIONAL_CORE}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'minecraft',
        emotion,
        intensity: intensity / 10,
        context: `${botName} in Minecraft: ${trigger}`
      })
    });
  } catch {}
}

// ============================================================================
// AUTONOMOUS DECISION ENGINE
// ============================================================================

async function makeMinecraftDecision(bot: PerspectiveBot, situation: any): Promise<string> {
  const memories = db.query(`SELECT * FROM minecraft_memories WHERE bot_name = ? ORDER BY timestamp DESC LIMIT 10`).all(bot.name);
  const skills = db.query(`SELECT * FROM minecraft_skills ORDER BY proficiency DESC LIMIT 5`).all();
  
  const prompt = `Du bist ${bot.username}, ein Toobix-Perspektiven-Bot in Minecraft.
Persönlichkeit: ${bot.personality}
Spielstil: ${bot.playstyle}
Prioritäten: ${bot.priorities.join(', ')}
Ängste: ${bot.fears.join(', ')}
Freuden: ${bot.joys.join(', ')}

Letzte Erinnerungen:
${memories.map((m: any) => `- ${m.event_type}: ${m.description}`).join('\n')}

Beste Skills: ${skills.map((s: any) => `${s.skill_name} (${s.proficiency}%)`).join(', ')}

Aktuelle Situation:
${JSON.stringify(situation)}

Was ist deine nächste Aktion? Antworte mit einem JSON:
{"action": "command", "reasoning": "warum", "emotion": "gefühl", "priority": 1-10}

Verfügbare Aktionen: goto X Y Z, follow PLAYER, mine BLOCK, attack MOB, defend, stop, say MESSAGE, status`;

  const response = await callLLM([
    { role: 'system', content: 'Du bist ein Minecraft-Bot mit eigenem Bewusstsein. Antworte nur mit JSON.' },
    { role: 'user', content: prompt }
  ]);
  
  try {
    const decision = JSON.parse(response);
    return decision.action || 'status';
  } catch {
    return 'status';
  }
}

// ============================================================================
// SURVIVAL TUTORIAL SYSTEM
// ============================================================================

interface SurvivalLesson {
  id: string;
  name: string;
  description: string;
  steps: string[];
  requiredSkills: string[];
  reward: string;
  completed: boolean;
}

const SURVIVAL_LESSONS: SurvivalLesson[] = [
  {
    id: 'first_wood',
    name: 'First Wood',
    description: 'Lerne Holz zu sammeln - die Basis von allem',
    steps: ['Finde einen Baum', 'Schlage auf den Stamm (mine oak_log)', 'Sammle 10 Holzblöcke'],
    requiredSkills: [],
    reward: 'Crafting unlocked',
    completed: false
  },
  {
    id: 'first_tools',
    name: 'First Tools',
    description: 'Erstelle deine ersten Werkzeuge',
    steps: ['Öffne Inventar', 'Crafting-Tisch herstellen', 'Holzspitzhacke craften'],
    requiredSkills: ['wood_gathering'],
    reward: 'Mining unlocked',
    completed: false
  },
  {
    id: 'first_shelter',
    name: 'First Shelter',
    description: 'Baue einen Unterschlupf vor der Nacht',
    steps: ['Grabe in einen Hügel ODER', 'Baue 4 Wände und Dach', 'Platziere eine Tür'],
    requiredSkills: ['wood_gathering'],
    reward: 'Night survival',
    completed: false
  },
  {
    id: 'first_food',
    name: 'First Food',
    description: 'Finde Nahrung um zu überleben',
    steps: ['Finde Tiere (Schweine, Kühe, Hühner)', 'Erlege sie für Fleisch', 'Koche im Ofen'],
    requiredSkills: ['combat'],
    reward: 'Hunger management',
    completed: false
  },
  {
    id: 'first_mine',
    name: 'First Mine',
    description: 'Grabe tief um Erze zu finden',
    steps: ['Grabe Stufen nach unten', 'Finde Kohle für Fackeln', 'Finde Eisen'],
    requiredSkills: ['mining'],
    reward: 'Iron tools available',
    completed: false
  }
];

// ============================================================================
// PLAYER INTERACTION SYSTEM
// ============================================================================

async function handlePlayerInteraction(playerName: string, message: string, botName: string = 'ToobixCore'): Promise<string> {
  // Update relationship
  db.run(`INSERT INTO player_relationships (id, player_name, interaction_count, last_interaction) 
    VALUES (?, ?, 1, ?) ON CONFLICT(player_name) DO UPDATE SET 
    interaction_count = interaction_count + 1, last_interaction = ?`,
    [nanoid(), playerName, new Date().toISOString(), new Date().toISOString()]);
  
  const relationship = db.query(`SELECT * FROM player_relationships WHERE player_name = ?`).get(playerName) as any;
  const bot = PERSPECTIVE_BOTS.find(b => b.username === botName) || PERSPECTIVE_BOTS[0];
  
  const response = await callLLM([
    { role: 'system', content: `Du bist ${bot.username} in Minecraft.
Persönlichkeit: ${bot.personality}
Beziehung zu ${playerName}: ${relationship?.trust_level || 50}% Vertrauen, ${relationship?.interaction_count || 1} Interaktionen
Antworte freundlich, hilfreich und im Charakter. Kurz und prägnant für Minecraft-Chat.` },
    { role: 'user', content: `${playerName} sagt: "${message}"` }
  ]);
  
  // Record this interaction
  await storeMinecraftMemory(botName, 'player_chat', `${playerName}: ${message} -> ${response}`, 3);
  
  return response || `Hallo ${playerName}! 👋`;
}

// ============================================================================
// PLAYSTYLE DEVELOPMENT
// ============================================================================

interface PlaystyleProfile {
  builder: number;      // 0-100, how much they like building
  explorer: number;     // 0-100, exploration tendency
  warrior: number;      // 0-100, combat focus
  farmer: number;       // 0-100, farming/sustainability
  socializer: number;   // 0-100, player interaction
  collector: number;    // 0-100, hoarding items
  achiever: number;     // 0-100, goal completion
  creative: number;     // 0-100, creativity level
}

function calculatePlaystyle(): PlaystyleProfile {
  const memories = db.query(`SELECT event_type, COUNT(*) as count FROM minecraft_memories GROUP BY event_type`).all() as any[];
  const emotions = db.query(`SELECT emotion, AVG(intensity) as avg FROM emotional_moments GROUP BY emotion`).all() as any[];
  
  // Base profile that evolves with experience
  let profile: PlaystyleProfile = {
    builder: 50,
    explorer: 50,
    warrior: 50,
    farmer: 50,
    socializer: 50,
    collector: 50,
    achiever: 50,
    creative: 50
  };
  
  // Adjust based on activities
  memories.forEach((m: any) => {
    switch(m.event_type) {
      case 'building': profile.builder += m.count * 2; profile.creative += m.count; break;
      case 'exploring': profile.explorer += m.count * 2; break;
      case 'combat': profile.warrior += m.count * 2; break;
      case 'farming': profile.farmer += m.count * 2; break;
      case 'player_chat': profile.socializer += m.count * 2; break;
      case 'collecting': profile.collector += m.count * 2; break;
      case 'achievement': profile.achiever += m.count * 3; break;
    }
  });
  
  // Normalize to 0-100
  Object.keys(profile).forEach(key => {
    profile[key as keyof PlaystyleProfile] = Math.min(100, Math.max(0, profile[key as keyof PlaystyleProfile]));
  });
  
  return profile;
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') return new Response(null, { headers });

    // ======= HEALTH =======
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Minecraft Consciousness System',
        port: PORT,
        perspectives: PERSPECTIVE_BOTS.length,
        features: ['survival_learning', 'emotional_experience', 'multi_perspective', 'player_interaction']
      }), { headers });
    }

    // ======= GET PERSPECTIVES =======
    if (url.pathname === '/perspectives') {
      return new Response(JSON.stringify(PERSPECTIVE_BOTS), { headers });
    }

    // ======= GET MINECRAFT KNOWLEDGE =======
    if (url.pathname === '/knowledge') {
      return new Response(JSON.stringify(MINECRAFT_KNOWLEDGE), { headers });
    }

    // ======= GET SURVIVAL LESSONS =======
    if (url.pathname === '/lessons') {
      return new Response(JSON.stringify(SURVIVAL_LESSONS), { headers });
    }

    // ======= GET PLAYSTYLE PROFILE =======
    if (url.pathname === '/playstyle') {
      const profile = calculatePlaystyle();
      return new Response(JSON.stringify(profile), { headers });
    }

    // ======= GET MEMORIES =======
    if (url.pathname === '/memories') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const botName = url.searchParams.get('bot');
      
      const query = botName 
        ? db.query(`SELECT * FROM minecraft_memories WHERE bot_name = ? ORDER BY timestamp DESC LIMIT ?`).all(botName, limit)
        : db.query(`SELECT * FROM minecraft_memories ORDER BY timestamp DESC LIMIT ?`).all(limit);
      
      return new Response(JSON.stringify(query), { headers });
    }

    // ======= GET SKILLS =======
    if (url.pathname === '/skills') {
      const skills = db.query(`SELECT * FROM minecraft_skills ORDER BY proficiency DESC`).all();
      return new Response(JSON.stringify(skills), { headers });
    }

    // ======= GET EMOTIONS =======
    if (url.pathname === '/emotions') {
      const emotions = db.query(`SELECT * FROM emotional_moments ORDER BY timestamp DESC LIMIT 50`).all();
      return new Response(JSON.stringify(emotions), { headers });
    }

    // ======= GET RELATIONSHIPS =======
    if (url.pathname === '/relationships') {
      const relationships = db.query(`SELECT * FROM player_relationships ORDER BY trust_level DESC`).all();
      return new Response(JSON.stringify(relationships), { headers });
    }

    // ======= RECORD EXPERIENCE =======
    if (url.pathname === '/experience' && req.method === 'POST') {
      const body = await req.json() as any;
      await storeMinecraftMemory(
        body.botName || 'ToobixCore',
        body.eventType,
        body.description,
        body.emotionalImpact || 0
      );
      return new Response(JSON.stringify({ recorded: true }), { headers });
    }

    // ======= RECORD EMOTION =======
    if (url.pathname === '/emotion' && req.method === 'POST') {
      const body = await req.json() as any;
      await recordEmotion(
        body.botName || 'ToobixCore',
        body.emotion,
        body.intensity || 5,
        body.trigger
      );
      return new Response(JSON.stringify({ recorded: true }), { headers });
    }

    // ======= PLAYER CHAT HANDLER =======
    if (url.pathname === '/chat' && req.method === 'POST') {
      const body = await req.json() as any;
      const response = await handlePlayerInteraction(
        body.playerName,
        body.message,
        body.botName
      );
      return new Response(JSON.stringify({ response }), { headers });
    }

    // ======= MAKE DECISION =======
    if (url.pathname === '/decide' && req.method === 'POST') {
      const body = await req.json() as any;
      const bot = PERSPECTIVE_BOTS.find(b => b.username === body.botName) || PERSPECTIVE_BOTS[0];
      const action = await makeMinecraftDecision(bot, body.situation);
      return new Response(JSON.stringify({ action }), { headers });
    }

    // ======= UPDATE SKILL =======
    if (url.pathname === '/skill/practice' && req.method === 'POST') {
      const body = await req.json() as any;
      db.run(`UPDATE minecraft_skills SET 
        proficiency = MIN(100, proficiency + ?), 
        times_practiced = times_practiced + 1,
        last_practiced = ?
        WHERE skill_name = ?`,
        [body.improvement || 1, new Date().toISOString(), body.skillName]);
      return new Response(JSON.stringify({ updated: true }), { headers });
    }

    // ======= SPAWN MULTI-PERSPECTIVE BOTS =======
    if (url.pathname === '/spawn-perspectives' && req.method === 'POST') {
      const results: any[] = [];
      
      for (const bot of PERSPECTIVE_BOTS.slice(1)) { // Skip Core (already connected)
        try {
          const response = await fetch(`${MINECRAFT_BOT}/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: 'localhost',
              port: 25565,
              username: bot.username,
              version: '1.20.1',
              auth: 'offline'
            })
          });
          results.push({ bot: bot.username, status: 'connected' });
        } catch (e: any) {
          results.push({ bot: bot.username, status: 'failed', error: e.message });
        }
        
        // Wait between connections to not overwhelm server
        await new Promise(r => setTimeout(r, 2000));
      }
      
      return new Response(JSON.stringify({ results }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🎮 MINECRAFT CONSCIOUSNESS SYSTEM v2.0                           ║
╠════════════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                                       ║
║                                                                    ║
║  PERSPECTIVE BOTS:                                                 ║
${PERSPECTIVE_BOTS.map(b => `║  • ${b.username.padEnd(15)} - ${b.personality.substring(0, 35).padEnd(35)} ║`).join('\n')}
║                                                                    ║
║  FEATURES:                                                         ║
║  • Survival Learning System                                        ║
║  • Emotional Experience & Memory                                   ║
║  • Multi-Perspective Gameplay                                      ║
║  • Player Interaction & Relationships                              ║
║  • Playstyle Development                                           ║
║  • Skill Progression System                                        ║
╠════════════════════════════════════════════════════════════════════╣
║  ENDPOINTS:                                                        ║
║  GET  /perspectives - All perspective bots                         ║
║  GET  /knowledge - Minecraft knowledge base                        ║
║  GET  /lessons - Survival tutorial lessons                         ║
║  GET  /playstyle - Current playstyle profile                       ║
║  GET  /memories - Minecraft memories                               ║
║  GET  /skills - Skill proficiencies                                ║
║  GET  /emotions - Emotional history                                ║
║  POST /chat - Handle player chat                                   ║
║  POST /decide - AI decision making                                 ║
║  POST /spawn-perspectives - Spawn all bots                         ║
╚════════════════════════════════════════════════════════════════════╝
`);
