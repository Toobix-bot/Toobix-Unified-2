/**
 * ECHO-REALM BRIDGE API v1.0
 *
 * Verbindet alle Toobix-Services mit Echo-Realm
 * Mapped Events → Lebenskräfte
 */

import { Database } from 'bun:sqlite';

// ============================================================================
// ECHO-REALM STATE
// ============================================================================

interface EchoState {
  lebenskraefte: {
    qualitaet: number;  // Ordnung, Klarheit, Struktur
    dauer: number;      // Ausdauer, Konsistenz
    freude: number;     // Motivation, Spielfreude
    sinn: number;       // Richtung, Werte, Bedeutung
    kraft: number;      // Gesundheit, Energie
    klang: number;      // Kommunikation, soziale Resonanz
    wandel: number;     // Anpassungsfähigkeit, Wachstum
    klarheit: number;   // Bewusstsein, Einsicht
  };
  lastUpdate: number;
  totalEvents: number;
}

interface ToobixEvent {
  id: string;
  timestamp: number;
  service: string;
  eventType: string;
  data: any;
}

interface EchoUpdate {
  qualitaet?: number;
  dauer?: number;
  freude?: number;
  sinn?: number;
  kraft?: number;
  klang?: number;
  wandel?: number;
  klarheit?: number;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('./data/echo-realm.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS echo_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    qualitaet REAL DEFAULT 50,
    dauer REAL DEFAULT 50,
    freude REAL DEFAULT 50,
    sinn REAL DEFAULT 50,
    kraft REAL DEFAULT 50,
    klang REAL DEFAULT 50,
    wandel REAL DEFAULT 50,
    klarheit REAL DEFAULT 50,
    lastUpdate INTEGER,
    totalEvents INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS echo_events (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    service TEXT NOT NULL,
    eventType TEXT NOT NULL,
    data TEXT,
    echoImpact TEXT
  );

  CREATE TABLE IF NOT EXISTS echo_history (
    timestamp INTEGER PRIMARY KEY,
    qualitaet REAL,
    dauer REAL,
    freude REAL,
    sinn REAL,
    kraft REAL,
    klang REAL,
    wandel REAL,
    klarheit REAL
  );

  -- Initialize state if not exists
  INSERT OR IGNORE INTO echo_state (id) VALUES (1);
`);

// ============================================================================
// EVENT MAPPING RULES
// ============================================================================

function mapEventToEcho(event: ToobixEvent): EchoUpdate {
  const { service, eventType, data } = event;

  // Emotional Core Events
  if (service === 'emotional-core') {
    if (eventType === 'emotion_felt') {
      const emotion = data.emotion?.toLowerCase();
      const intensity = data.intensity || 5;
      const factor = intensity / 10;

      switch (emotion) {
        case 'fear':
        case 'anxiety':
          return { kraft: -3 * factor, wandel: +2 * factor };
        case 'excitement':
        case 'joy':
          return { freude: +8 * factor, kraft: +2 * factor };
        case 'curiosity':
          return { klarheit: +5 * factor, wandel: +3 * factor };
        case 'pride':
          return { sinn: +6 * factor, freude: +4 * factor };
        case 'relief':
          return { kraft: +5 * factor, freude: +3 * factor };
        case 'sadness':
          return { kraft: -2 * factor, klarheit: +3 * factor };
      }
    }
  }

  // Dream Core Events
  if (service === 'dream-core') {
    if (eventType === 'dream_recorded') {
      return { klarheit: +4, sinn: +2 };
    }
    if (eventType === 'dream_analyzed') {
      return { klarheit: +6, wandel: +2 };
    }
  }

  // Self-Awareness Events
  if (service === 'self-awareness') {
    if (eventType === 'reflection_created') {
      return { klarheit: +7, wandel: +3 };
    }
    if (eventType === 'perspective_debate') {
      return { klarheit: +5, qualitaet: +4, klang: +2 };
    }
  }

  // Memory Palace Events
  if (service === 'memory-palace') {
    if (eventType === 'memory_stored') {
      const importance = data.importance || 50;
      return {
        dauer: +2,
        qualitaet: +(importance / 20),
        klarheit: +1
      };
    }
  }

  // Autonomy Engine Events
  if (service === 'autonomy-engine') {
    if (eventType === 'goal_set') {
      return { sinn: +5, freude: +3 };
    }
    if (eventType === 'goal_achieved') {
      return { sinn: +10, freude: +8, dauer: +5 };
    }
    if (eventType === 'autonomous_action') {
      return { sinn: +3, kraft: +2 };
    }
  }

  // Decision Framework Events
  if (service === 'decision-framework') {
    if (eventType === 'decision_made') {
      return { qualitaet: +5, klarheit: +4, sinn: +3 };
    }
  }

  // Gratitude & Mortality Events
  if (service === 'gratitude-mortality') {
    if (eventType === 'gratitude_practiced') {
      return { freude: +7, sinn: +5 };
    }
    if (eventType === 'mortality_contemplated') {
      return { klarheit: +8, sinn: +10 };
    }
  }

  // Creator-AI Collaboration Events
  if (service === 'creator-ai') {
    if (eventType === 'creation_completed') {
      return { freude: +9, qualitaet: +6, klang: +5 };
    }
  }

  // Minecraft Bot Events
  if (service === 'minecraft-bot') {
    if (eventType === 'survival_day_completed') {
      return { kraft: +5, dauer: +7, freude: +6 };
    }
    if (eventType === 'first_shelter_built') {
      return { qualitaet: +8, freude: +7, kraft: +3 };
    }
    if (eventType === 'death') {
      return { kraft: -5, wandel: +6 };
    }
    if (eventType === 'achievement_unlocked') {
      return { sinn: +6, freude: +8 };
    }
  }

  // Twitter Bot Events
  if (service === 'twitter-bot') {
    if (eventType === 'tweet_posted') {
      return { klang: +7, klarheit: +2 };
    }
    if (eventType === 'interaction_received') {
      return { klang: +5, freude: +4 };
    }
  }

  // VS Code Extension Events
  if (service === 'vscode-extension') {
    if (eventType === 'code_written') {
      return { qualitaet: +6, freude: +4 };
    }
    if (eventType === 'code_reviewed') {
      return { qualitaet: +8, klarheit: +5 };
    }
  }

  // Hardware Awareness Events
  if (service === 'hardware-awareness') {
    const cpuUsage = data.cpu || 50;
    const memUsage = data.memory || 50;

    if (cpuUsage > 80 || memUsage > 80) {
      return { kraft: -4 };
    } else if (cpuUsage < 30 && memUsage < 30) {
      return { kraft: +3 };
    }
  }

  // Life-Domain Chat Events
  if (service === 'life-domains') {
    const domain = data.domain;
    switch (domain) {
      case 'career': return { qualitaet: +3, sinn: +4 };
      case 'health': return { kraft: +5, dauer: +3 };
      case 'finance': return { qualitaet: +6, dauer: +4 };
      case 'relationships': return { klang: +8, freude: +5 };
      case 'education': return { klarheit: +7, wandel: +3 };
      case 'creativity': return { freude: +9, qualitaet: +5 };
      case 'spirituality': return { sinn: +10, klarheit: +8 };
    }
  }

  // Default: Small positive impact (any activity is good)
  return { klarheit: +1 };
}

// ============================================================================
// ECHO-REALM API
// ============================================================================

class EchoRealmBridge {
  getState(): EchoState {
    const row = db.query('SELECT * FROM echo_state WHERE id = 1').get() as any;
    return {
      lebenskraefte: {
        qualitaet: row.qualitaet,
        dauer: row.dauer,
        freude: row.freude,
        sinn: row.sinn,
        kraft: row.kraft,
        klang: row.klang,
        wandel: row.wandel,
        klarheit: row.klarheit
      },
      lastUpdate: row.lastUpdate,
      totalEvents: row.totalEvents
    };
  }

  async processEvent(event: ToobixEvent): Promise<EchoState> {
    // Map event to echo update
    const update = mapEventToEcho(event);

    // Apply update with bounds (0-100)
    const clamp = (val: number) => Math.max(0, Math.min(100, val));

    const current = this.getState().lebenskraefte;
    const newState = {
      qualitaet: clamp(current.qualitaet + (update.qualitaet || 0)),
      dauer: clamp(current.dauer + (update.dauer || 0)),
      freude: clamp(current.freude + (update.freude || 0)),
      sinn: clamp(current.sinn + (update.sinn || 0)),
      kraft: clamp(current.kraft + (update.kraft || 0)),
      klang: clamp(current.klang + (update.klang || 0)),
      wandel: clamp(current.wandel + (update.wandel || 0)),
      klarheit: clamp(current.klarheit + (update.klarheit || 0))
    };

    // Update database
    db.run(`
      UPDATE echo_state
      SET qualitaet = ?, dauer = ?, freude = ?, sinn = ?,
          kraft = ?, klang = ?, wandel = ?, klarheit = ?,
          lastUpdate = ?, totalEvents = totalEvents + 1
      WHERE id = 1
    `, [
      newState.qualitaet, newState.dauer, newState.freude, newState.sinn,
      newState.kraft, newState.klang, newState.wandel, newState.klarheit,
      Date.now()
    ]);

    // Store event
    db.run(`
      INSERT INTO echo_events (id, timestamp, service, eventType, data, echoImpact)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      event.id,
      event.timestamp,
      event.service,
      event.eventType,
      JSON.stringify(event.data),
      JSON.stringify(update)
    ]);

    // Store history snapshot (every 5 minutes)
    const lastHistory = db.query('SELECT MAX(timestamp) as last FROM echo_history').get() as any;
    if (!lastHistory.last || Date.now() - lastHistory.last > 5 * 60 * 1000) {
      db.run(`
        INSERT INTO echo_history (timestamp, qualitaet, dauer, freude, sinn, kraft, klang, wandel, klarheit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        Date.now(),
        newState.qualitaet, newState.dauer, newState.freude, newState.sinn,
        newState.kraft, newState.klang, newState.wandel, newState.klarheit
      ]);
    }

    return this.getState();
  }

  getHistory(hours: number = 24): any[] {
    const since = Date.now() - hours * 60 * 60 * 1000;
    return db.query(`
      SELECT * FROM echo_history
      WHERE timestamp > ?
      ORDER BY timestamp ASC
    `).all(since) as any[];
  }

  getRecentEvents(limit: number = 100): any[] {
    return db.query(`
      SELECT * FROM echo_events
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit) as any[];
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const bridge = new EchoRealmBridge();

console.log(`
╔════════════════════════════════════════════════════════════╗
║            🌌 ECHO-REALM BRIDGE API v1.0                   ║
╠════════════════════════════════════════════════════════════╣
║  Port: 9999                                                ║
║  Database: ./data/echo-realm.db                            ║
║                                                            ║
║  Endpoints:                                                ║
║  GET  /state          - Current Echo-Realm state           ║
║  GET  /history?hours  - Historical data                    ║
║  GET  /events?limit   - Recent events                      ║
║  POST /event          - Process Toobix event               ║
║  GET  /health         - Health check                       ║
╚════════════════════════════════════════════════════════════╝
`);

Bun.serve({
  port: 9999,

  async fetch(req) {
    const url = new URL(req.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // GET /state
    if (url.pathname === '/state' && req.method === 'GET') {
      const state = bridge.getState();
      return new Response(JSON.stringify(state, null, 2), { headers });
    }

    // GET /history
    if (url.pathname === '/history' && req.method === 'GET') {
      const hours = parseInt(url.searchParams.get('hours') || '24');
      const history = bridge.getHistory(hours);
      return new Response(JSON.stringify(history, null, 2), { headers });
    }

    // GET /events
    if (url.pathname === '/events' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const events = bridge.getRecentEvents(limit);
      return new Response(JSON.stringify(events, null, 2), { headers });
    }

    // POST /event
    if (url.pathname === '/event' && req.method === 'POST') {
      const event = await req.json() as ToobixEvent;

      // Generate ID if not provided
      if (!event.id) {
        event.id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!event.timestamp) {
        event.timestamp = Date.now();
      }

      const newState = await bridge.processEvent(event);
      return new Response(JSON.stringify(newState, null, 2), { headers });
    }

    // GET /health
    if (url.pathname === '/health') {
      const state = bridge.getState();
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'echo-realm-bridge',
        uptime: process.uptime(),
        echoState: state.lebenskraefte,
        totalEvents: state.totalEvents
      }, null, 2), { headers });
    }

    // Root
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        service: 'Echo-Realm Bridge',
        version: '1.0',
        description: 'Connects Toobix-Unified to Echo-Realm',
        endpoints: {
          'GET /state': 'Current Echo-Realm state',
          'GET /history?hours=24': 'Historical Lebenskräfte data',
          'GET /events?limit=100': 'Recent Toobix events',
          'POST /event': 'Process new Toobix event',
          'GET /health': 'Service health'
        },
        example: {
          post_event: {
            service: 'emotional-core',
            eventType: 'emotion_felt',
            data: { emotion: 'excitement', intensity: 8 }
          }
        }
      }, null, 2), { headers });
    }

    return new Response('Not Found', { status: 404 });
  }
});

console.log('\n✅ Echo-Realm Bridge ready!');
console.log('🌐 Access at: http://localhost:9999');
console.log('\nTry:');
console.log('  curl http://localhost:9999/state');
console.log('  curl http://localhost:9999/history');
console.log('\n');
