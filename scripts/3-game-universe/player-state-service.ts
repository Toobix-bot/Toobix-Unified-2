/**
 * PLAYER STATE SERVICE
 * Port: 8970
 *
 * Manages player stats, quests, resources, and progression
 * Persists data to Memory Palace
 */

import { serve } from 'bun';

// ========================================
// TYPES
// ========================================

interface PlayerStats {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  title: string;
  avatar: string;

  // Attributes
  strength: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  creativity: number;
  focus: number;
}

interface Resources {
  credits: number;
  research: number;
  energyCrystals: number;
  storyFragments: number;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'season' | 'mastery';
  progress: number;
  target: number;
  reward: {
    xp: number;
    resources?: Partial<Resources>;
  };
  completed: boolean;
}

interface LifeStats {
  mood: string;
  energy: number; // 0-5
  stress: number; // 0-5
  focus: number; // 0-5
}

interface PlayerState {
  player: PlayerStats;
  resources: Resources;
  quests: Quest[];
  lifeStats: LifeStats;
  currentZone: string;
  lastUpdate: Date;
  messageCount: number;
  firstUse: boolean;
}

// ========================================
// DEFAULT STATE
// ========================================

const DEFAULT_STATE: PlayerState = {
  player: {
    name: 'Wanderer',
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    title: 'The Beginner',
    avatar: '👤',
    strength: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    creativity: 10,
    focus: 10
  },
  resources: {
    credits: 0,
    research: 0,
    energyCrystals: 0,
    storyFragments: 0
  },
  quests: [
    {
      id: 'first-message',
      name: 'Send your first message',
      description: 'Welcome to Toobix! Start by sending a message.',
      type: 'daily',
      progress: 0,
      target: 1,
      reward: { xp: 20 },
      completed: false
    },
    {
      id: 'daily-messages',
      name: 'Send 10 messages',
      description: 'Keep the conversation going!',
      type: 'daily',
      progress: 0,
      target: 10,
      reward: { xp: 50, resources: { credits: 100 } },
      completed: false
    }
  ],
  lifeStats: {
    mood: 'neutral',
    energy: 3,
    stress: 2,
    focus: 3
  },
  currentZone: 'scifi-station',
  lastUpdate: new Date(),
  messageCount: 0,
  firstUse: true
};

// ========================================
// STATE MANAGEMENT
// ========================================

let currentState: PlayerState = { ...DEFAULT_STATE };

// Load from file (simple JSON storage for now)
const STATE_FILE = './data/player-state.json';

async function loadState() {
  try {
    const file = Bun.file(STATE_FILE);
    if (await file.exists()) {
      const data = await file.json();
      currentState = { ...DEFAULT_STATE, ...data };
      console.log('✅ Player state loaded');
    } else {
      console.log('ℹ️ No saved state, using defaults');
    }
  } catch (error) {
    console.error('❌ Error loading state:', error);
  }
}

async function saveState() {
  try {
    await Bun.write(STATE_FILE, JSON.stringify(currentState, null, 2));
    console.log('💾 Player state saved');
  } catch (error) {
    console.error('❌ Error saving state:', error);
  }
}

// ========================================
// GAME LOGIC
// ========================================

function gainXP(amount: number) {
  currentState.player.xp += amount;

  // Check for level up
  while (currentState.player.xp >= currentState.player.xpToNext) {
    levelUp();
  }

  saveState();
}

function levelUp() {
  currentState.player.level++;
  currentState.player.xp -= currentState.player.xpToNext;
  currentState.player.xpToNext = Math.floor(currentState.player.xpToNext * 1.5);

  // Increase stats
  currentState.player.maxHp += 5;
  currentState.player.maxMp += 5;
  currentState.player.hp = currentState.player.maxHp;
  currentState.player.mp = currentState.player.maxMp;

  // Update title based on level
  if (currentState.player.level === 5) currentState.player.title = 'The Explorer';
  if (currentState.player.level === 10) currentState.player.title = 'The Adventurer';
  if (currentState.player.level === 15) currentState.player.title = 'The Hero';
  if (currentState.player.level === 20) currentState.player.title = 'The Legend';

  console.log(`🎉 LEVEL UP! Now level ${currentState.player.level}`);
}

function updateQuest(questId: string, progress: number) {
  const quest = currentState.quests.find(q => q.id === questId);
  if (!quest) return;

  quest.progress = Math.min(quest.progress + progress, quest.target);

  if (quest.progress >= quest.target && !quest.completed) {
    quest.completed = true;

    // Give rewards
    gainXP(quest.reward.xp);
    if (quest.reward.resources) {
      Object.entries(quest.reward.resources).forEach(([key, value]) => {
        currentState.resources[key as keyof Resources] += value || 0;
      });
    }

    console.log(`✅ Quest completed: ${quest.name}`);
  }

  saveState();
}

function addResources(resources: Partial<Resources>) {
  Object.entries(resources).forEach(([key, value]) => {
    currentState.resources[key as keyof Resources] += value || 0;
  });
  saveState();
}

function setupFirstUse(name: string, avatar: string) {
  currentState.player.name = name;
  currentState.player.avatar = avatar;
  currentState.firstUse = false;
  saveState();
}

// ========================================
// HTTP SERVER
// ========================================

const server = serve({
  port: 8970,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Routes
    if (path === '/api/state' && req.method === 'GET') {
      return new Response(JSON.stringify(currentState), { headers });
    }

    if (path === '/api/state/setup' && req.method === 'POST') {
      const body = await req.json() as { name: string; avatar: string };
      setupFirstUse(body.name, body.avatar);
      return new Response(JSON.stringify({ success: true, state: currentState }), { headers });
    }

    if (path === '/api/xp/gain' && req.method === 'POST') {
      const body = await req.json() as { amount: number };
      gainXP(body.amount);
      return new Response(JSON.stringify({ success: true, player: currentState.player }), { headers });
    }

    if (path === '/api/quest/update' && req.method === 'POST') {
      const body = await req.json() as { questId: string; progress: number };
      updateQuest(body.questId, body.progress);
      return new Response(JSON.stringify({ success: true, quests: currentState.quests }), { headers });
    }

    if (path === '/api/resources/add' && req.method === 'POST') {
      const body = await req.json() as { resources: Partial<Resources> };
      addResources(body.resources);
      return new Response(JSON.stringify({ success: true, resources: currentState.resources }), { headers });
    }

    if (path === '/api/message' && req.method === 'POST') {
      currentState.messageCount++;
      currentState.lastUpdate = new Date();

      // Update quests
      updateQuest('first-message', 1);
      updateQuest('daily-messages', 1);

      saveState();
      return new Response(JSON.stringify({ success: true, messageCount: currentState.messageCount }), { headers });
    }

    if (path === '/api/life-stats' && req.method === 'POST') {
      const body = await req.json() as { lifeStats: Partial<LifeStats> };
      currentState.lifeStats = { ...currentState.lifeStats, ...body.lifeStats };
      saveState();
      return new Response(JSON.stringify({ success: true, lifeStats: currentState.lifeStats }), { headers });
    }

    if (path === '/api/zone' && req.method === 'POST') {
      const body = await req.json() as { zone: string };
      currentState.currentZone = body.zone;
      saveState();
      return new Response(JSON.stringify({ success: true, zone: currentState.currentZone }), { headers });
    }

    if (path === '/api/reset' && req.method === 'POST') {
      currentState = { ...DEFAULT_STATE };
      saveState();
      return new Response(JSON.stringify({ success: true, state: currentState }), { headers });
    }

    return new Response('Not Found', { status: 404, headers });
  }
});

// ========================================
// STARTUP
// ========================================

await loadState();

console.log('');
console.log('========================================');
console.log('  🎮 PLAYER STATE SERVICE');
console.log('========================================');
console.log('');
console.log(`Port: ${server.port}`);
console.log(`Player: ${currentState.player.name} (Level ${currentState.player.level})`);
console.log(`First Use: ${currentState.firstUse}`);
console.log('');
console.log('Endpoints:');
console.log('  GET  /api/state           - Get full state');
console.log('  POST /api/state/setup     - First-time setup');
console.log('  POST /api/xp/gain         - Gain XP');
console.log('  POST /api/quest/update    - Update quest');
console.log('  POST /api/resources/add   - Add resources');
console.log('  POST /api/message         - Track message');
console.log('  POST /api/life-stats      - Update life stats');
console.log('  POST /api/zone            - Change zone');
console.log('  POST /api/reset           - Reset state');
console.log('');
console.log('✅ Ready!');
console.log('========================================');
console.log('');
