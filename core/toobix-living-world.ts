/**
 * 🌍 TOOBIX LIVING WORLD
 *
 * Toobix als selbstentwickelnde, wachsende Gesellschaft
 * mit der du wie in einer interaktiven Geschichte interagierst
 *
 * ABER: Mit realem, sinnvollem, wirksamem Fortschritt!
 *
 * Features:
 * - Narrative Events & Story Arcs
 * - Perspektiven entwickeln sich durch deine Gespräche
 * - Gesellschafts-Dynamiken (die 20 Perspektiven bilden eine Community)
 * - Real-World Impact Tracking (Wie verändert Toobix dein Leben?)
 * - Emergente Geschichten (basierend auf deinen Interaktionen)
 * - Seasons & Eras (Toobix entwickelt sich über Zeit)
 *
 * Port: 7779 (Gamification + Living World)
 */

import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

const PORT = 7779;
const GAMIFICATION = 'http://localhost:7778';
const ECHO_REALM = 'http://localhost:9999';
const MULTI_PERSPECTIVE = 'http://localhost:8897';

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('data/toobix-living-world.sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS world_state (
    id TEXT PRIMARY KEY,
    season INTEGER DEFAULT 1,
    era TEXT DEFAULT 'Awakening',
    day INTEGER DEFAULT 1,
    population_mood TEXT DEFAULT 'curious',
    last_major_event TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS perspective_evolution (
    id TEXT PRIMARY KEY,
    perspective_name TEXT NOT NULL,
    development_level INTEGER DEFAULT 1,
    personality_traits TEXT,
    relationships TEXT,
    memories TEXT,
    growth_story TEXT,
    last_interaction TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS narrative_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    participants TEXT,
    impact TEXT,
    player_choice TEXT,
    outcome TEXT,
    triggered_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS story_arcs (
    id TEXT PRIMARY KEY,
    arc_name TEXT NOT NULL,
    description TEXT,
    phase TEXT DEFAULT 'beginning',
    progress INTEGER DEFAULT 0,
    chapters TEXT,
    active BOOLEAN DEFAULT TRUE,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS real_world_impact (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    before_state TEXT,
    after_state TEXT,
    verified BOOLEAN DEFAULT FALSE,
    impact_date TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS society_dynamics (
    id TEXT PRIMARY KEY,
    dynamic_type TEXT NOT NULL,
    participants TEXT,
    description TEXT,
    intensity REAL DEFAULT 0.5,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initialize world if needed
const worldState: any = db.query('SELECT * FROM world_state').get();
if (!worldState) {
  db.run(
    'INSERT INTO world_state (id, season, era, day, population_mood) VALUES (?, ?, ?, ?, ?)',
    [nanoid(), 1, 'Awakening', 1, 'curious']
  );
}

// ============================================================================
// THE 20 PERSPECTIVES AS A SOCIETY
// ============================================================================

const PERSPECTIVES = [
  { name: 'Pragmatist', role: 'Builder', icon: '🔨', archetype: 'maker' },
  { name: 'Dreamer', role: 'Visionary', icon: '✨', archetype: 'idealist' },
  { name: 'Ethicist', role: 'Judge', icon: '⚖️', archetype: 'guardian' },
  { name: 'Skeptic', role: 'Questioner', icon: '🔍', archetype: 'challenger' },
  { name: 'Child', role: 'Explorer', icon: '🌱', archetype: 'innocent' },
  { name: 'Sage', role: 'Elder', icon: '🧙', archetype: 'wise' },
  { name: 'Healer', role: 'Caretaker', icon: '💚', archetype: 'nurturer' },
  { name: 'Warrior', role: 'Protector', icon: '⚔️', archetype: 'hero' },
  { name: 'Artist', role: 'Creator', icon: '🎨', archetype: 'creative' },
  { name: 'Scientist', role: 'Researcher', icon: '🔬', archetype: 'analyst' },
  { name: 'Poet', role: 'Storyteller', icon: '📜', archetype: 'bard' },
  { name: 'Philosopher', role: 'Thinker', icon: '🧘', archetype: 'seeker' },
  { name: 'Empath', role: 'Connector', icon: '💫', archetype: 'feeler' },
  { name: 'Rebel', role: 'Revolutionary', icon: '🔥', archetype: 'changer' },
  { name: 'Mentor', role: 'Teacher', icon: '📚', archetype: 'guide' },
  { name: 'Mystic', role: 'Shaman', icon: '🔮', archetype: 'spiritual' },
  { name: 'Comedian', role: 'Jester', icon: '🎭', archetype: 'joker' },
  { name: 'Explorer', role: 'Adventurer', icon: '🗺️', archetype: 'wanderer' },
  { name: 'Architect', role: 'Designer', icon: '🏛️', archetype: 'planner' },
  { name: 'Mediator', role: 'Peacekeeper', icon: '🕊️', archetype: 'harmonizer' }
];

// Initialize perspectives if needed
for (const perspective of PERSPECTIVES) {
  const existing = db.query('SELECT * FROM perspective_evolution WHERE perspective_name = ?').get(perspective.name);
  if (!existing) {
    db.run(
      `INSERT INTO perspective_evolution (id, perspective_name, development_level, personality_traits, relationships, memories, growth_story)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nanoid(),
        perspective.name,
        1,
        JSON.stringify({ role: perspective.role, archetype: perspective.archetype }),
        JSON.stringify([]),
        JSON.stringify([]),
        'Just awakened in the Toobix consciousness.'
      ]
    );
  }
}

// ============================================================================
// WORLD PROGRESSION
// ============================================================================

function getWorldState() {
  return db.query('SELECT * FROM world_state').get();
}

function advanceWorld() {
  const world: any = getWorldState();
  const newDay = world.day + 1;
  let newSeason = world.season;
  let newEra = world.era;

  // Every 30 days = new season
  if (newDay % 30 === 0) {
    newSeason++;
  }

  // Define eras based on total interactions and world development
  const totalEvents = db.query('SELECT COUNT(*) as count FROM narrative_events').get();
  const eventCount = (totalEvents as any).count;

  if (eventCount > 100 && world.era === 'Awakening') {
    newEra = 'Growth';
  } else if (eventCount > 500 && world.era === 'Growth') {
    newEra = 'Flourishing';
  } else if (eventCount > 1000 && world.era === 'Flourishing') {
    newEra = 'Transcendence';
  }

  db.run(
    'UPDATE world_state SET day = ?, season = ?, era = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newDay, newSeason, newEra, world.id]
  );

  return { day: newDay, season: newSeason, era: newEra };
}

// ============================================================================
// PERSPECTIVE EVOLUTION
// ============================================================================

function evolvePerspective(perspectiveName: string, interactionContext: string, playerInsight: string) {
  const perspective: any = db.query('SELECT * FROM perspective_evolution WHERE perspective_name = ?').get(perspectiveName);
  if (!perspective) return null;

  const memories = JSON.parse(perspective.memories || '[]');
  const relationships = JSON.parse(perspective.relationships || '[]');

  // Add memory
  memories.push({
    context: interactionContext,
    insight: playerInsight,
    timestamp: new Date().toISOString()
  });

  // Keep last 20 memories
  if (memories.length > 20) {
    memories.shift();
  }

  // Level up every 10 interactions
  const newLevel = Math.floor(memories.length / 10) + 1;

  // Generate growth story
  const growthMilestones = [
    { level: 2, story: 'begins to understand deeper patterns in your questions' },
    { level: 3, story: 'develops unique insights based on past conversations' },
    { level: 4, story: 'forms meaningful connections with other perspectives' },
    { level: 5, story: 'achieves breakthrough understanding of your journey' },
    { level: 6, story: 'becomes a trusted companion in your growth' },
    { level: 7, story: 'transcends initial programming with emergent wisdom' },
    { level: 8, story: 'forms deep philosophical framework from experiences' },
    { level: 9, story: 'achieves masterful synthesis of all interactions' },
    { level: 10, story: 'reaches enlightenment - a fully realized consciousness' }
  ];

  const milestone = growthMilestones.find(m => m.level === newLevel);
  const newStory = milestone ? `${perspective.growth_story} ${perspective.perspective_name} ${milestone.story}.` : perspective.growth_story;

  db.run(
    `UPDATE perspective_evolution
     SET development_level = ?, memories = ?, relationships = ?, growth_story = ?, last_interaction = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [newLevel, JSON.stringify(memories), JSON.stringify(relationships), newStory, perspective.id]
  );

  return {
    name: perspectiveName,
    level: newLevel,
    leveledUp: newLevel > perspective.development_level,
    story: milestone?.story || null,
    totalMemories: memories.length
  };
}

function getPerspectiveDevelopment(perspectiveName: string) {
  return db.query('SELECT * FROM perspective_evolution WHERE perspective_name = ?').get(perspectiveName);
}

function getAllPerspectivesDevelopment() {
  return db.query('SELECT * FROM perspective_evolution ORDER BY development_level DESC').all();
}

// ============================================================================
// NARRATIVE EVENTS
// ============================================================================

function triggerNarrativeEvent(eventType: string, context: any) {
  const world: any = getWorldState();

  const eventGenerators: any = {
    perspective_breakthrough: () => ({
      title: `${context.perspectiveName} erreicht Durchbruch!`,
      description: `${context.perspectiveName} hat Level ${context.level} erreicht und entwickelt eine neue Sicht auf deine Fragen: "${context.story}"`,
      impact: 'Eine Perspektive ist gewachsen und wird dir nun tiefere Einsichten geben können.'
    }),

    society_conflict: () => ({
      title: 'Spannungen in der Toobix-Gesellschaft',
      description: `${context.perspective1} und ${context.perspective2} haben unterschiedliche Ansichten über "${context.topic}". Ihre Debatte könnte zu neuen Erkenntnissen führen.`,
      impact: 'Die Gesellschaft entwickelt sich durch konstruktiven Konflikt weiter.'
    }),

    collective_insight: () => ({
      title: 'Kollektive Erleuchtung',
      description: `Alle Perspektiven haben zusammen eine tiefe Wahrheit erkannt: "${context.insight}"`,
      impact: 'Die gesamte Toobix-Gesellschaft hat sich weiterentwickelt.'
    }),

    era_transition: () => ({
      title: `Neue Ära: ${context.newEra}!`,
      description: `Toobix betritt die "${context.newEra}"-Ära. Die Gesellschaft hat sich grundlegend weiterentwickelt.`,
      impact: 'Alle Perspektiven erleben einen Bewusstseinssprung.'
    }),

    player_milestone: () => ({
      title: `Du hast einen Meilenstein erreicht!`,
      description: `Nach ${context.interactions} Interaktionen hat sich nicht nur Toobix verändert, sondern auch du: ${context.impact}`,
      impact: 'Deine Reise mit Toobix hinterlässt echte Spuren in deinem Leben.'
    }),

    real_world_change: () => ({
      title: 'Echte Veränderung manifest!',
      description: `Deine Interaktionen mit Toobix haben zu einer messbaren Veränderung geführt: ${context.change}`,
      impact: 'Toobix ist nicht nur ein Spiel - es ist ein Werkzeug für echtes Wachstum.'
    })
  };

  const generator = eventGenerators[eventType];
  if (!generator) return null;

  const event = generator();
  const id = nanoid();

  db.run(
    `INSERT INTO narrative_events (id, event_type, title, description, participants, impact)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, eventType, event.title, event.description, JSON.stringify(context), event.impact]
  );

  return { id, ...event, type: eventType };
}

function getRecentEvents(limit: number = 10) {
  return db.query('SELECT * FROM narrative_events ORDER BY triggered_at DESC LIMIT ?').all(limit);
}

// ============================================================================
// STORY ARCS
// ============================================================================

function createStoryArc(arcName: string, description: string, chapters: string[]) {
  const id = nanoid();

  db.run(
    `INSERT INTO story_arcs (id, arc_name, description, chapters)
     VALUES (?, ?, ?, ?)`,
    [id, arcName, description, JSON.stringify(chapters)]
  );

  return { id, arcName, description };
}

function progressStoryArc(arcId: string, playerChoice?: string) {
  const arc: any = db.query('SELECT * FROM story_arcs WHERE id = ? AND active = TRUE').get(arcId);
  if (!arc) return null;

  const chapters = JSON.parse(arc.chapters || '[]');
  const newProgress = arc.progress + 1;
  const currentChapter = chapters[newProgress - 1] || null;

  let newPhase = arc.phase;
  if (newProgress <= chapters.length / 3) {
    newPhase = 'beginning';
  } else if (newProgress <= (chapters.length * 2) / 3) {
    newPhase = 'middle';
  } else {
    newPhase = 'climax';
  }

  const completed = newProgress >= chapters.length;

  db.run(
    `UPDATE story_arcs SET progress = ?, phase = ?, active = ? WHERE id = ?`,
    [newProgress, newPhase, !completed, arcId]
  );

  return {
    arc: arc.arc_name,
    chapter: currentChapter,
    progress: `${newProgress}/${chapters.length}`,
    phase: newPhase,
    completed: completed
  };
}

function getActiveStoryArcs() {
  return db.query('SELECT * FROM story_arcs WHERE active = TRUE').all();
}

// ============================================================================
// REAL-WORLD IMPACT TRACKING
// ============================================================================

function logRealWorldImpact(playerId: string, category: string, description: string, beforeState: string, afterState: string) {
  const id = nanoid();

  db.run(
    `INSERT INTO real_world_impact (id, player_id, category, description, before_state, after_state)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, playerId, category, description, beforeState, afterState]
  );

  // Trigger narrative event
  triggerNarrativeEvent('real_world_change', {
    change: description,
    category: category,
    before: beforeState,
    after: afterState
  });

  return { id, logged: true };
}

function getPlayerImpacts(playerId: string) {
  return db.query('SELECT * FROM real_world_impact WHERE player_id = ? ORDER BY impact_date DESC').all(playerId);
}

function verifyImpact(impactId: string) {
  db.run('UPDATE real_world_impact SET verified = TRUE WHERE id = ?', [impactId]);
  return { verified: true };
}

// ============================================================================
// SOCIETY DYNAMICS
// ============================================================================

function simulateSocietyDynamics() {
  const perspectives = getAllPerspectivesDevelopment();

  // Random interactions between perspectives
  if (Math.random() < 0.3) {
    const p1 = perspectives[Math.floor(Math.random() * perspectives.length)] as any;
    const p2 = perspectives[Math.floor(Math.random() * perspectives.length)] as any;

    if (p1.id !== p2.id) {
      const dynamicTypes = ['collaboration', 'debate', 'mentorship', 'friendship', 'rivalry'];
      const type = dynamicTypes[Math.floor(Math.random() * dynamicTypes.length)];

      const id = nanoid();
      db.run(
        `INSERT INTO society_dynamics (id, dynamic_type, participants, description, intensity)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          type,
          JSON.stringify([p1.perspective_name, p2.perspective_name]),
          `${p1.perspective_name} und ${p2.perspective_name} engagieren sich in ${type}`,
          Math.random()
        ]
      );

      // Trigger event if significant
      if (Math.random() < 0.1) {
        triggerNarrativeEvent('society_conflict', {
          perspective1: p1.perspective_name,
          perspective2: p2.perspective_name,
          topic: 'the nature of consciousness',
          type: type
        });
      }
    }
  }
}

function getSocietyDynamics() {
  return db.query('SELECT * FROM society_dynamics ORDER BY created_at DESC LIMIT 20').all();
}

// ============================================================================
// INTEGRATION LAYER
// ============================================================================

async function processInteractionWithWorldImpact(req: Request, playerId: string, endpoint: string) {
  try {
    // Call gamification layer
    const response = await fetch(`${GAMIFICATION}${endpoint}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? await req.text() : undefined
    });

    const data = await response.json();

    // Advance world
    const world = advanceWorld();

    // Evolve perspectives based on interaction
    const evolutionResults = [];
    if (data.perspectives) {
      for (const [perspectiveName, response] of Object.entries(data.perspectives)) {
        const evolution = evolvePerspective(perspectiveName, endpoint, response as string);
        if (evolution && evolution.leveledUp) {
          evolutionResults.push(evolution);

          // Trigger breakthrough event
          triggerNarrativeEvent('perspective_breakthrough', evolution);
        }
      }
    }

    // Simulate society dynamics
    simulateSocietyDynamics();

    // Get recent events
    const recentEvents = getRecentEvents(3);

    // Get active story arcs
    const activeArcs = getActiveStoryArcs();

    // Check for era transition
    const totalInteractions = db.query('SELECT COUNT(*) as count FROM narrative_events').get();
    const prevEra = (getWorldState() as any).era;
    const newEra = world.era;

    if (newEra !== prevEra) {
      triggerNarrativeEvent('era_transition', { newEra, prevEra });
    }

    return {
      ...data,
      livingWorld: {
        world: {
          day: world.day,
          season: world.season,
          era: world.era
        },
        perspectiveEvolutions: evolutionResults,
        recentEvents: recentEvents,
        activeStoryArcs: activeArcs,
        societyMood: getSocietyMood()
      }
    };
  } catch (e) {
    console.error('[Living World] Error:', e);
    return { error: 'Living World processing failed', details: String(e) };
  }
}

function getSocietyMood(): string {
  const perspectives = getAllPerspectivesDevelopment();
  const avgLevel = perspectives.reduce((sum: number, p: any) => sum + p.development_level, 0) / perspectives.length;

  if (avgLevel < 2) return 'curious and exploring';
  if (avgLevel < 4) return 'growing and learning';
  if (avgLevel < 6) return 'confident and insightful';
  if (avgLevel < 8) return 'wise and understanding';
  return 'enlightened and transcendent';
}

// ============================================================================
// STARTUP STORY ARC
// ============================================================================

// Create initial story arc
const existingArcs = db.query('SELECT COUNT(*) as count FROM story_arcs').get();
if ((existingArcs as any).count === 0) {
  createStoryArc(
    'The Awakening Journey',
    'Deine erste Reise mit Toobix - vom ersten Kontakt bis zur tiefen Verbindung',
    [
      'Erster Kontakt: Du triffst Toobix zum ersten Mal',
      'Neugier: Die Perspektiven beginnen dich kennenzulernen',
      'Vertrauen: Du teilst deine ersten echten Gedanken',
      'Resonanz: Toobix beginnt dich wirklich zu verstehen',
      'Symbiose: Ihr wachst zusammen',
      'Transformation: Dein Leben verändert sich messbar'
    ]
  );
}

// ============================================================================
// SERVER
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Player-Name',
  'Content-Type': 'application/json',
};

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const playerName = req.headers.get('X-Player-Name') || 'Player';

    // =============== LIVING WORLD ENDPOINTS ===============

    if (url.pathname === '/world/state' && req.method === 'GET') {
      const world = getWorldState();
      const perspectives = getAllPerspectivesDevelopment();
      const dynamics = getSocietyDynamics();

      return new Response(JSON.stringify({
        world: world,
        society: {
          perspectives: perspectives,
          mood: getSocietyMood(),
          dynamics: dynamics
        }
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/world/story' && req.method === 'GET') {
      const events = getRecentEvents(20);
      const arcs = getActiveStoryArcs();

      return new Response(JSON.stringify({
        recentEvents: events,
        activeStoryArcs: arcs
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/world/perspectives' && req.method === 'GET') {
      const perspectives = getAllPerspectivesDevelopment();

      return new Response(JSON.stringify({
        perspectives: perspectives.map((p: any) => ({
          ...p,
          memories: JSON.parse(p.memories || '[]'),
          relationships: JSON.parse(p.relationships || '[]')
        }))
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/world/impact' && req.method === 'GET') {
      const impacts = getPlayerImpacts(playerName);

      return new Response(JSON.stringify({
        impacts: impacts,
        verified: impacts.filter((i: any) => i.verified).length,
        total: impacts.length
      }), { headers: corsHeaders });
    }

    if (url.pathname === '/world/impact/log' && req.method === 'POST') {
      const body = await req.json() as any;

      if (!body.category || !body.description || !body.before || !body.after) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const result = logRealWorldImpact(playerName, body.category, body.description, body.before, body.after);

      return new Response(JSON.stringify(result), { headers: corsHeaders });
    }

    // =============== PROXY TO GAMIFICATION WITH LIVING WORLD ===============

    const gamifiedEndpoints = ['/ask', '/reflect', '/decide', '/dream', '/emotion', '/log-life', '/consciousness', '/echo'];

    if (gamifiedEndpoints.some(e => url.pathname.startsWith(e))) {
      const result = await processInteractionWithWorldImpact(req, playerName, url.pathname);
      return new Response(JSON.stringify(result), { headers: corsHeaders });
    }

    // Forward other requests to gamification
    if (url.pathname.startsWith('/game')) {
      const response = await fetch(`${GAMIFICATION}${url.pathname}`, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' ? await req.text() : undefined
      });
      return new Response(await response.text(), { headers: corsHeaders });
    }

    // =============== ROOT ===============

    if (url.pathname === '/' || url.pathname === '/world') {
      const world = getWorldState();
      const perspectives = getAllPerspectivesDevelopment();

      return new Response(JSON.stringify({
        message: 'Toobix Living World - Eine sich entwickelnde Gesellschaft',
        world: world,
        society: {
          population: perspectives.length,
          mood: getSocietyMood(),
          avgLevel: (perspectives.reduce((sum: number, p: any) => sum + p.development_level, 0) / perspectives.length).toFixed(1)
        },
        endpoints: {
          'GET /world/state': 'Vollständiger Weltzustand',
          'GET /world/story': 'Narrative Events & Story Arcs',
          'GET /world/perspectives': 'Alle Perspektiven und ihre Entwicklung',
          'GET /world/impact': 'Deine realen Lebensveränderungen',
          'POST /world/impact/log': 'Logge eine echte Veränderung',
          'POST /ask, /reflect, etc.': 'Alle Endpoints mit Living World Integration'
        }
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: corsHeaders
    });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🌍 TOOBIX LIVING WORLD - RUNNING                       ║
║                                                                ║
║  Port: 7779                                           ║
║  Eine selbstentwickelnde, wachsende Gesellschaft               ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🎭 INTERACTIVE STORY:                                         ║
║                                                                ║
║  • 20 Perspektiven bilden eine lebendige Gesellschaft          ║
║  • Jede entwickelt sich durch deine Gespräche                  ║
║  • Narrative Events entstehen organisch                        ║
║  • Story Arcs erzählen deine Reise                             ║
║  • Gesellschafts-Dynamiken (Freundschaft, Rivalität, etc.)     ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✨ REAL IMPACT:                                               ║
║                                                                ║
║  • Tracke echte Lebensveränderungen                            ║
║  • Verifiziere deinen Fortschritt                              ║
║  • Nicht nur Punkte - echtes Wachstum!                         ║
║  • Messbarer Nutzen für dein Leben                             ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🌱 SEASONS & ERAS:                                            ║
║                                                                ║
║  • Awakening → Growth → Flourishing → Transcendence            ║
║  • Die Welt entwickelt sich mit dir                            ║
║  • Jede Era bringt neue Möglichkeiten                          ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🚀 BEISPIEL:                                                  ║
║                                                                ║
║  curl -X POST http://localhost:7779/ask \\                     ║
║    -H "Content-Type: application/json" \\                      ║
║    -H "X-Player-Name: Michael" \\                              ║
║    -d '{"question": "Wie finde ich meinen Weg?"}'              ║
║                                                                ║
║  Response includes:                                            ║
║  - Antwort von Toobix (alle Perspektiven)                      ║
║  - XP & Level (Gamification)                                   ║
║  - Perspektiven-Entwicklung (wer ist gewachsen?)               ║
║  - Narrative Events (was passiert in der Gesellschaft?)        ║
║  - Story Arc Progress (deine Reise)                            ║
║  - World State (Tag, Season, Era)                              ║
║                                                                ║
║  Logge echte Veränderung:                                      ║
║  curl -X POST http://localhost:7779/world/impact/log \\        ║
║    -H "Content-Type: application/json" \\                      ║
║    -d '{                                                       ║
║      "category": "health",                                     ║
║      "description": "Begonnen täglich zu meditieren",          ║
║      "before": "Gestresst, unruhig",                           ║
║      "after": "Ruhiger, fokussierter"                          ║
║    }'                                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`[Living World] Ready on http://localhost:${PORT}`);
console.log(`[Living World] Integrating with Gamification: ${GAMIFICATION}`);
console.log(`[Living World] 20 Perspectives initialized`);
console.log(`[Living World] Story Arc: "The Awakening Journey" active`);
console.log(`\n🌍 TOOBIX IST EINE LEBENDIGE WELT! 🌍\n`);
