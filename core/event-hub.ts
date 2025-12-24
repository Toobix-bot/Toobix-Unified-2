#!/usr/bin/env bun
/**
 * TOOBIX EVENT HUB
 *
 * Zentraler Event-Bus für Modul-Vernetzung
 * Port: 8894
 *
 * Features:
 * - Unified Events zwischen allen Modulen
 * - Emotionen → Spieleffekte
 * - Träume → Quest-Generierung
 * - Persistente Erinnerungen
 * - Proaktive Benachrichtigungen
 */

import { Database } from 'bun:sqlite';
import express from 'express';
import path from 'path';

const PORT = 8894;
const DB_PATH = path.join(process.cwd(), 'databases', 'event-hub.db');

// Service URLs
const SERVICES = {
  gameUniverse: 'http://localhost:8896',
  idleEmpire: 'http://localhost:8897',
  gamification: 'http://localhost:8898',
  consciousness: 'http://localhost:8900',
  creativeSuite: 'http://localhost:8902',
  lifeCompanion: 'http://localhost:8970'
};

// ==========================================
// DATABASE SETUP
// ==========================================

const db = new Database(DB_PATH, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Unified Memory
db.run(`
  CREATE TABLE IF NOT EXISTS unified_memory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    source_service TEXT NOT NULL,
    event_type TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    importance INTEGER DEFAULT 5,
    emotional_valence REAL DEFAULT 0,
    tags TEXT,
    metadata TEXT,
    referenced_by TEXT
  )
`);

// Event Log
db.run(`
  CREATE TABLE IF NOT EXISTS event_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    triggered_effects TEXT,
    processed INTEGER DEFAULT 0
  )
`);

// Pending Notifications (for proactivity)
db.run(`
  CREATE TABLE IF NOT EXISTS pending_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    priority INTEGER DEFAULT 5,
    source TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,
    delivered INTEGER DEFAULT 0,
    data TEXT
  )
`);

// User Sessions (for tracking last activity)
db.run(`
  CREATE TABLE IF NOT EXISTS user_sessions (
    user_id TEXT PRIMARY KEY,
    last_active TEXT DEFAULT CURRENT_TIMESTAMP,
    last_emotion TEXT,
    last_emotion_intensity REAL,
    active_effects TEXT,
    session_data TEXT
  )
`);

// Effect Queue (pending game effects)
db.run(`
  CREATE TABLE IF NOT EXISTS effect_queue (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    target_service TEXT,
    effect_data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    applied INTEGER DEFAULT 0,
    expires_at TEXT
  )
`);

// ==========================================
// EVENT MAPPINGS
// ==========================================

interface EventEffect {
  target: string;
  action: string;
  params: any;
  description: string;
}

const EVENT_MAPPINGS: Record<string, EventEffect[]> = {
  // Emotion Events
  'emotion:joy': [
    { target: 'gamification', action: 'xp_multiplier', params: { multiplier: 1.5, duration: 3600 }, description: 'XP x1.5 für 1 Stunde' },
    { target: 'idleEmpire', action: 'production_boost', params: { boost: 1.2, duration: 1800 }, description: 'Produktion +20%' },
    { target: 'gameUniverse', action: 'world_effect', params: { type: 'bright', intensity: 0.8 }, description: 'Welt wird heller' }
  ],
  'emotion:sadness': [
    { target: 'lifeCompanion', action: 'suggest_support', params: { type: 'comfort' }, description: 'Support-Session vorschlagen' },
    { target: 'gameUniverse', action: 'spawn_npc', params: { type: 'healer', message: 'Du scheinst bedrückt...' }, description: 'Heiler-NPC erscheint' }
  ],
  'emotion:anxiety': [
    { target: 'gamification', action: 'stat_modifier', params: { stat: 'KLARHEIT', delta: -10, duration: 1800 }, description: 'KLARHEIT -10' },
    { target: 'gameUniverse', action: 'generate_quest', params: { type: 'calm', name: 'Ruhe finden' }, description: 'Quest: Ruhe finden' }
  ],
  'emotion:anger': [
    { target: 'gamification', action: 'stat_modifier', params: { stat: 'KRAFT', delta: 15, duration: 600 }, description: 'KRAFT +15 (temporär)' },
    { target: 'gameUniverse', action: 'spawn_combat', params: { difficulty: 'easy' }, description: 'Kampf-Gelegenheit' }
  ],
  'emotion:hope': [
    { target: 'creativeSuite', action: 'unlock_inspiration', params: { type: 'visionary' }, description: 'Visionäre Inspiration' },
    { target: 'gameUniverse', action: 'unlock_area', params: { area: 'possibility_gate' }, description: 'Neues Gebiet zugänglich' }
  ],
  'emotion:gratitude': [
    { target: 'idleEmpire', action: 'resource_gift', params: { gold: 50, mana: 10 }, description: 'Gold +50, Mana +10' },
    { target: 'gameUniverse', action: 'spawn_npc', params: { type: 'friend', grateful: true }, description: 'Freundlicher NPC' }
  ],

  // Dream Events
  'dream:recorded': [
    { target: 'gamification', action: 'grant_xp', params: { amount: 30, reason: 'dream_recorded' }, description: '+30 XP' },
    { target: 'gameUniverse', action: 'add_dream_energy', params: { amount: 10 }, description: 'Traumenergie +10' }
  ],
  'dream:lucid': [
    { target: 'gameUniverse', action: 'unlock_ability', params: { ability: 'dreamwalker', duration: 86400 }, description: 'Traumwandler-Fähigkeit' },
    { target: 'gamification', action: 'grant_achievement', params: { id: 'lucid_dreamer' }, description: 'Achievement: Luzider Träumer' }
  ],
  'dream:nightmare': [
    { target: 'lifeCompanion', action: 'schedule_checkin', params: { delay: 3600, type: 'wellbeing' }, description: 'Check-in in 1h' },
    { target: 'gameUniverse', action: 'generate_quest', params: { type: 'conquer_fear', from_nightmare: true }, description: 'Quest: Angst überwinden' }
  ],
  'dream:symbol:water': [
    { target: 'gameUniverse', action: 'generate_quest', params: { type: 'exploration', name: 'Tauche in die Tiefe', theme: 'water' }, description: 'Wasser-Quest' }
  ],
  'dream:symbol:fire': [
    { target: 'gameUniverse', action: 'generate_quest', params: { type: 'transformation', name: 'Durch das Feuer', theme: 'fire' }, description: 'Feuer-Quest' }
  ],

  // Goal/Achievement Events
  'goal:completed': [
    { target: 'gamification', action: 'grant_xp', params: { amount: 100, reason: 'goal_completed' }, description: '+100 XP' },
    { target: 'gameUniverse', action: 'celebration_event', params: { type: 'fireworks' }, description: 'Feuerwerk-Event' },
    { target: 'idleEmpire', action: 'resource_gift', params: { gold: 100 }, description: 'Gold +100' }
  ],
  'goal:progress': [
    { target: 'gamification', action: 'grant_xp', params: { amount: 20, reason: 'goal_progress' }, description: '+20 XP' }
  ],

  // Reflection Events
  'reflection:deep': [
    { target: 'gamification', action: 'xp_multiplier', params: { multiplier: 2, duration: 3600 }, description: 'XP x2 für 1h' },
    { target: 'gameUniverse', action: 'unlock_insight', params: { type: 'wisdom' }, description: 'Weisheits-Einsicht' }
  ],

  // Gratitude Events
  'gratitude:logged': [
    { target: 'gamification', action: 'grant_xp', params: { amount: 15, reason: 'gratitude' }, description: '+15 XP' },
    { target: 'idleEmpire', action: 'resource_gift', params: { gold: 25 }, description: 'Gold +25' },
    { target: 'gameUniverse', action: 'world_effect', params: { type: 'bloom', duration: 600 }, description: 'Blüh-Effekt' }
  ],

  // Game Events
  'game:achievement_unlocked': [
    { target: 'creativeSuite', action: 'log_memory', params: { type: 'achievement' }, description: 'In Erinnerung speichern' }
  ],
  'game:level_up': [
    { target: 'idleEmpire', action: 'unlock_building', params: {}, description: 'Neues Gebäude verfügbar' }
  ],

  // Streak Events
  'streak:milestone': [
    { target: 'idleEmpire', action: 'production_boost', params: { boost: 1.5, duration: 86400 }, description: 'Produktion +50% für 24h' },
    { target: 'gameUniverse', action: 'grant_item', params: { rarity: 'rare' }, description: 'Seltenes Item' }
  ]
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function nanoid(): string {
  return Math.random().toString(36).substring(2, 15);
}

async function callService(url: string, options: any = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(5000)
    });
    return await response.json();
  } catch (error: any) {
    console.error(`Service call failed: ${url}`, error.message);
    return null;
  }
}

function storeMemory(userId: string, source: string, eventType: string, content: string, options: any = {}) {
  const id = `mem-${nanoid()}`;

  db.run(`
    INSERT INTO unified_memory (id, user_id, source_service, event_type, content, summary, importance, emotional_valence, tags, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, userId, source, eventType, content,
    options.summary || content.substring(0, 100),
    options.importance || 5,
    options.emotional_valence || 0,
    JSON.stringify(options.tags || []),
    JSON.stringify(options.metadata || {})
  ]);

  return id;
}

function createNotification(userId: string, message: string, options: any = {}) {
  const id = `notif-${nanoid()}`;

  db.run(`
    INSERT INTO pending_notifications (id, user_id, message, type, priority, source, expires_at, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, userId, message,
    options.type || 'info',
    options.priority || 5,
    options.source || 'event-hub',
    options.expires_at || null,
    JSON.stringify(options.data || {})
  ]);

  return id;
}

async function applyEffect(userId: string, effect: EventEffect): Promise<boolean> {
  const serviceUrl = SERVICES[effect.target as keyof typeof SERVICES];
  if (!serviceUrl) {
    console.warn(`Unknown service target: ${effect.target}`);
    return false;
  }

  // Queue the effect
  const effectId = `eff-${nanoid()}`;
  db.run(`
    INSERT INTO effect_queue (id, user_id, effect_type, target_service, effect_data)
    VALUES (?, ?, ?, ?, ?)
  `, [effectId, userId, effect.action, effect.target, JSON.stringify(effect.params)]);

  // Try to apply immediately
  try {
    switch (effect.action) {
      case 'grant_xp':
        await callService(`${SERVICES.gamification}/interact`, {
          method: 'POST',
          body: { userId, action: effect.params.reason, description: effect.description }
        });
        break;

      case 'xp_multiplier':
      case 'stat_modifier':
        // Store as active effect
        const session = db.prepare('SELECT * FROM user_sessions WHERE user_id = ?').get(userId) as any;
        const activeEffects = session?.active_effects ? JSON.parse(session.active_effects) : [];
        activeEffects.push({
          type: effect.action,
          params: effect.params,
          expires: Date.now() + (effect.params.duration || 3600) * 1000
        });
        db.run(
          'INSERT OR REPLACE INTO user_sessions (user_id, active_effects) VALUES (?, ?)',
          [userId, JSON.stringify(activeEffects)]
        );
        break;

      case 'resource_gift':
        await callService(`${SERVICES.idleEmpire}/idle/collect`, {
          method: 'POST',
          body: { userId, bonus: effect.params }
        });
        break;

      case 'generate_quest':
        // Create notification for quest
        createNotification(userId, `Neue Quest verfügbar: ${effect.params.name}`, {
          type: 'quest',
          priority: 7,
          data: effect.params
        });
        break;

      case 'spawn_npc':
        createNotification(userId, effect.params.message || 'Ein NPC möchte mit dir sprechen', {
          type: 'npc',
          priority: 6,
          data: effect.params
        });
        break;

      case 'suggest_support':
        createNotification(userId, 'Möchtest du über deine Gefühle sprechen?', {
          type: 'support',
          priority: 8,
          source: 'life-companion'
        });
        break;

      case 'world_effect':
      case 'celebration_event':
        // Visual effects - store for game to pick up
        createNotification(userId, `Welt-Effekt: ${effect.params.type}`, {
          type: 'world_effect',
          priority: 3,
          data: effect.params
        });
        break;

      default:
        console.log(`Unhandled effect action: ${effect.action}`);
    }

    // Mark as applied
    db.run('UPDATE effect_queue SET applied = 1 WHERE id = ?', [effectId]);
    return true;
  } catch (error) {
    console.error(`Failed to apply effect: ${effect.action}`, error);
    return false;
  }
}

async function processEvent(userId: string, source: string, eventType: string, payload: any) {
  const eventId = `evt-${nanoid()}`;

  // Log the event
  db.run(`
    INSERT INTO event_log (id, user_id, source, event_type, payload)
    VALUES (?, ?, ?, ?, ?)
  `, [eventId, userId, source, eventType, JSON.stringify(payload)]);

  // Store in memory
  storeMemory(userId, source, eventType, JSON.stringify(payload), {
    importance: payload.importance || 5,
    emotional_valence: payload.emotional_valence || 0,
    tags: [source, eventType, ...(payload.tags || [])]
  });

  // Find matching effects
  const effects = EVENT_MAPPINGS[eventType] || [];
  const triggeredEffects: string[] = [];

  for (const effect of effects) {
    const success = await applyEffect(userId, effect);
    if (success) {
      triggeredEffects.push(effect.description);
    }
  }

  // Update event log with triggered effects
  db.run('UPDATE event_log SET triggered_effects = ?, processed = 1 WHERE id = ?',
    [JSON.stringify(triggeredEffects), eventId]);

  // Update user session
  db.run(`
    INSERT OR REPLACE INTO user_sessions (user_id, last_active, last_emotion, last_emotion_intensity)
    VALUES (?, CURRENT_TIMESTAMP, ?, ?)
  `, [userId, payload.emotion || null, payload.intensity || null]);

  return { eventId, triggeredEffects };
}

// ==========================================
// EXPRESS SERVER
// ==========================================

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const events = db.prepare('SELECT COUNT(*) as count FROM event_log').get() as any;
  const memories = db.prepare('SELECT COUNT(*) as count FROM unified_memory').get() as any;
  const notifications = db.prepare('SELECT COUNT(*) as count FROM pending_notifications WHERE delivered = 0').get() as any;

  res.json({
    status: 'ok',
    service: 'event-hub',
    port: PORT,
    stats: {
      totalEvents: events.count,
      totalMemories: memories.count,
      pendingNotifications: notifications.count,
      registeredMappings: Object.keys(EVENT_MAPPINGS).length
    }
  });
});

// Emit event
app.post('/emit', async (req, res) => {
  const { userId = 'default', source, eventType, payload = {} } = req.body;

  if (!source || !eventType) {
    return res.status(400).json({ error: 'source and eventType required' });
  }

  const result = await processEvent(userId, source, eventType, payload);

  res.json({
    success: true,
    ...result,
    message: `Event ${eventType} processed with ${result.triggeredEffects.length} effects`
  });
});

// Get pending notifications
app.get('/notifications', (req, res) => {
  const userId = (req.query.userId as string) || 'default';
  const limit = parseInt(req.query.limit as string) || 10;

  const notifications = db.prepare(`
    SELECT * FROM pending_notifications
    WHERE user_id = ? AND delivered = 0
    AND (expires_at IS NULL OR expires_at > datetime('now'))
    ORDER BY priority DESC, created_at DESC
    LIMIT ?
  `).all(userId, limit) as any[];

  res.json({ notifications });
});

// Mark notification as delivered
app.post('/notifications/deliver', (req, res) => {
  const { notificationId, userId } = req.body;

  if (notificationId) {
    db.run('UPDATE pending_notifications SET delivered = 1 WHERE id = ?', [notificationId]);
  } else if (userId) {
    // Mark all as delivered
    db.run('UPDATE pending_notifications SET delivered = 1 WHERE user_id = ?', [userId]);
  }

  res.json({ success: true });
});

// Get offline summary (for proactivity)
app.get('/offline-summary', async (req, res) => {
  const userId = (req.query.userId as string) || 'default';

  const session = db.prepare('SELECT * FROM user_sessions WHERE user_id = ?').get(userId) as any;
  const lastActive = session?.last_active ? new Date(session.last_active) : new Date(0);
  const offlineMs = Date.now() - lastActive.getTime();
  const offlineHours = Math.floor(offlineMs / (1000 * 60 * 60));

  // Get events since last active
  const recentEvents = db.prepare(`
    SELECT source, event_type, COUNT(*) as count
    FROM event_log
    WHERE user_id = ? AND timestamp > ?
    GROUP BY source, event_type
  `).all(userId, lastActive.toISOString()) as any[];

  // Get pending notifications
  const notifications = db.prepare(`
    SELECT * FROM pending_notifications
    WHERE user_id = ? AND delivered = 0
    ORDER BY priority DESC
    LIMIT 5
  `).all(userId) as any[];

  // Get idle production (from Idle Empire)
  let idleProduction = null;
  try {
    idleProduction = await callService(`${SERVICES.idleEmpire}/idle/status?userId=${userId}`);
  } catch (e) {}

  // Get active effects
  const activeEffects = session?.active_effects ? JSON.parse(session.active_effects).filter(
    (e: any) => e.expires > Date.now()
  ) : [];

  res.json({
    offlineHours,
    offlineMinutes: Math.floor((offlineMs / (1000 * 60)) % 60),
    lastActive: lastActive.toISOString(),
    recentEvents,
    notifications,
    pendingOfflineProduction: idleProduction?.pendingOfflineProduction || {},
    activeEffects,
    summary: generateOfflineSummary(offlineHours, recentEvents, notifications, idleProduction)
  });
});

function generateOfflineSummary(hours: number, events: any[], notifications: any[], idle: any): string {
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`Du warst ${hours} Stunden offline.`);
  }

  if (idle?.pendingOfflineProduction) {
    const production = Object.entries(idle.pendingOfflineProduction)
      .filter(([_, v]) => (v as number) > 0)
      .map(([k, v]) => `${Math.floor(v as number)} ${k}`)
      .join(', ');
    if (production) {
      parts.push(`Deine Produktion: ${production}`);
    }
  }

  if (notifications.length > 0) {
    parts.push(`${notifications.length} neue Nachrichten warten auf dich.`);
  }

  if (events.length > 0) {
    const eventCount = events.reduce((sum, e) => sum + e.count, 0);
    parts.push(`${eventCount} Events sind passiert.`);
  }

  return parts.join(' ') || 'Willkommen zurück!';
}

// Search memories
app.get('/memories', (req, res) => {
  const userId = (req.query.userId as string) || 'default';
  const query = req.query.query as string;
  const source = req.query.source as string;
  const limit = parseInt(req.query.limit as string) || 20;

  let sql = 'SELECT * FROM unified_memory WHERE user_id = ?';
  const params: any[] = [userId];

  if (query) {
    sql += ' AND (content LIKE ? OR summary LIKE ?)';
    params.push(`%${query}%`, `%${query}%`);
  }

  if (source) {
    sql += ' AND source_service = ?';
    params.push(source);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  const memories = db.prepare(sql).all(...params);

  res.json({ memories });
});

// Store memory directly
app.post('/memories', (req, res) => {
  const { userId = 'default', source, eventType, content, ...options } = req.body;

  if (!source || !eventType || !content) {
    return res.status(400).json({ error: 'source, eventType, and content required' });
  }

  const memoryId = storeMemory(userId, source, eventType, content, options);

  res.json({ success: true, memoryId });
});

// Get active effects for user
app.get('/effects', (req, res) => {
  const userId = (req.query.userId as string) || 'default';

  const session = db.prepare('SELECT * FROM user_sessions WHERE user_id = ?').get(userId) as any;
  const activeEffects = session?.active_effects ? JSON.parse(session.active_effects).filter(
    (e: any) => e.expires > Date.now()
  ) : [];

  res.json({
    effects: activeEffects,
    lastEmotion: session?.last_emotion,
    lastEmotionIntensity: session?.last_emotion_intensity
  });
});

// Dream to Quest converter
app.post('/dream-to-quest', async (req, res) => {
  const { userId = 'default', dreamId, symbols = [], lucidity = 0, narrative = '' } = req.body;

  const quests: any[] = [];

  // Generate quests based on symbols
  for (const symbol of symbols) {
    const eventType = `dream:symbol:${symbol.toLowerCase()}`;
    if (EVENT_MAPPINGS[eventType]) {
      const result = await processEvent(userId, 'dream', eventType, { symbol, lucidity, narrative });
      quests.push({ symbol, effects: result.triggeredEffects });
    }
  }

  // Lucid dream special ability
  if (lucidity > 50) {
    const result = await processEvent(userId, 'dream', 'dream:lucid', { lucidity });
    quests.push({ type: 'lucid', effects: result.triggeredEffects });
  }

  res.json({
    success: true,
    questsGenerated: quests.length,
    quests
  });
});

// Emotion to Game effect sync
app.post('/sync-emotion', async (req, res) => {
  const { userId = 'default', emotion, intensity = 0.5, context = '' } = req.body;

  const eventType = `emotion:${emotion.toLowerCase()}`;
  const result = await processEvent(userId, 'consciousness', eventType, {
    emotion,
    intensity,
    context,
    emotional_valence: emotion === 'joy' || emotion === 'hope' || emotion === 'gratitude' ? intensity : -intensity
  });

  res.json({
    success: true,
    emotion,
    intensity,
    effects: result.triggeredEffects
  });
});

// Get available event types
app.get('/event-types', (req, res) => {
  const eventTypes = Object.entries(EVENT_MAPPINGS).map(([type, effects]) => ({
    type,
    effects: effects.map(e => ({ target: e.target, action: e.action, description: e.description }))
  }));

  res.json({ eventTypes });
});

// Documentation
app.get('/', (req, res) => {
  res.json({
    service: 'Toobix Event Hub',
    version: '1.0',
    port: PORT,
    description: 'Zentrale Modul-Vernetzung für Toobix',
    endpoints: {
      emit: 'POST /emit { userId, source, eventType, payload }',
      notifications: 'GET /notifications?userId=',
      deliverNotifications: 'POST /notifications/deliver { notificationId | userId }',
      offlineSummary: 'GET /offline-summary?userId=',
      memories: 'GET /memories?userId=&query=&source=',
      storeMemory: 'POST /memories { userId, source, eventType, content }',
      effects: 'GET /effects?userId=',
      dreamToQuest: 'POST /dream-to-quest { userId, dreamId, symbols, lucidity }',
      syncEmotion: 'POST /sync-emotion { userId, emotion, intensity }',
      eventTypes: 'GET /event-types'
    },
    connectedServices: Object.keys(SERVICES),
    registeredEventTypes: Object.keys(EVENT_MAPPINGS)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  🔗 TOOBIX EVENT HUB                                            ║
║                                                                  ║
║  Port: ${PORT}                                                    ║
║  Modul-Vernetzung & Unified Memory                               ║
║                                                                  ║
║  Connected Services:                                             ║
║  - Game Universe (8896)                                          ║
║  - Idle Empire (8897)                                            ║
║  - Gamification (8898)                                           ║
║  - Consciousness (8900)                                          ║
║  - Creative Suite (8902)                                         ║
║  - Life Companion (8970)                                         ║
║                                                                  ║
║  Event Mappings: ${Object.keys(EVENT_MAPPINGS).length} types                                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});
