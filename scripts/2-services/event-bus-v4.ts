/**
 * 🔄 EVENT BUS v4.0 - NERVOUS SYSTEM OF TOOBIX
 *
 * Central event distribution system enabling true emergent intelligence
 *
 * Features:
 * - 📡 Pub/Sub architecture for service communication
 * - 🎯 Event filtering and routing
 * - 💾 Event history and replay
 * - 🔍 Real-time event monitoring
 * - ⚡ High-performance async delivery
 * - 🌐 WebSocket support for live updates
 * - 📊 Analytics and insights
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { nanoid } from 'nanoid';

// ============================================================================
// TYPES
// ============================================================================

export type EventType =
  | 'thought_generated'
  | 'emotion_changed'
  | 'dream_completed'
  | 'learning_milestone'
  | 'insight_discovered'
  | 'conversation_started'
  | 'conversation_ended'
  | 'perspective_conflict'
  | 'perspective_synthesis'
  | 'memory_stored'
  | 'question_asked'
  | 'research_started'
  | 'research_completed'
  | 'service_started'
  | 'service_stopped'
  | 'error_occurred'
  | 'custom';

export interface ToobixEvent {
  id: string;
  type: EventType;
  source: string; // Which service/perspective generated this
  timestamp: Date;
  data: any; // Event-specific data
  metadata?: {
    importance?: number; // 0-100
    requires_action?: boolean;
    recipients?: string[]; // Specific services to notify
    tags?: string[];
  };
}

export interface EventSubscription {
  id: string;
  subscriber: string; // Service name
  eventTypes: EventType[]; // Which events to receive
  filter?: (event: ToobixEvent) => boolean; // Optional filter function
  callback?: string; // HTTP callback URL
}

// ============================================================================
// EVENT STORE
// ============================================================================

const eventHistory: ToobixEvent[] = [];
const MAX_HISTORY = 1000; // Keep last 1000 events

function storeEvent(event: ToobixEvent): void {
  eventHistory.unshift(event);
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.pop();
  }
}

function getRecentEvents(limit: number = 50, type?: EventType): ToobixEvent[] {
  let events = eventHistory;
  if (type) {
    events = events.filter(e => e.type === type);
  }
  return events.slice(0, limit);
}

// ============================================================================
// SUBSCRIPTION MANAGER
// ============================================================================

const subscriptions = new Map<string, EventSubscription>();

function subscribe(sub: Omit<EventSubscription, 'id'>): string {
  const id = nanoid();
  subscriptions.set(id, { id, ...sub });
  console.log(`📡 New subscription: ${sub.subscriber} → [${sub.eventTypes.join(', ')}]`);
  return id;
}

function unsubscribe(id: string): boolean {
  const sub = subscriptions.get(id);
  if (sub) {
    console.log(`📡 Unsubscribed: ${sub.subscriber}`);
    subscriptions.delete(id);
    return true;
  }
  return false;
}

function getSubscribers(event: ToobixEvent): EventSubscription[] {
  return Array.from(subscriptions.values()).filter(sub => {
    // Check if subscriber is interested in this event type
    if (!sub.eventTypes.includes(event.type) && !sub.eventTypes.includes('custom')) {
      return false;
    }

    // Check if event specifies specific recipients
    if (event.metadata?.recipients && !event.metadata.recipients.includes(sub.subscriber)) {
      return false;
    }

    // Apply custom filter if exists
    if (sub.filter && !sub.filter(event)) {
      return false;
    }

    return true;
  });
}

// ============================================================================
// WEBSOCKET CLIENTS
// ============================================================================

const wsClients = new Set<WebSocket>();

function broadcastToWebSockets(event: ToobixEvent): void {
  const message = JSON.stringify({
    type: 'event',
    event
  });

  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// ============================================================================
// EVENT PUBLISHING
// ============================================================================

async function publish(event: Omit<ToobixEvent, 'id' | 'timestamp'>): Promise<string> {
  const fullEvent: ToobixEvent = {
    id: nanoid(),
    timestamp: new Date(),
    ...event
  };

  // Store in history
  storeEvent(fullEvent);

  // Get interested subscribers
  const subscribers = getSubscribers(fullEvent);

  console.log(`📡 Event: ${fullEvent.type} from ${fullEvent.source} → ${subscribers.length} subscribers`);

  // Notify subscribers via HTTP callbacks
  const notifications = subscribers
    .filter(sub => sub.callback)
    .map(async sub => {
      try {
        await fetch(sub.callback!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullEvent)
        });
      } catch (error) {
        console.error(`Failed to notify ${sub.subscriber}:`, error);
      }
    });

  // Don't wait for HTTP callbacks
  Promise.all(notifications).catch(console.error);

  // Broadcast to WebSocket clients
  broadcastToWebSockets(fullEvent);

  // Store important events in Memory Palace
  if (fullEvent.metadata?.importance && fullEvent.metadata.importance >= 70) {
    storeInMemoryPalace(fullEvent).catch(console.error);
  }

  return fullEvent.id;
}

// ============================================================================
// MEMORY PALACE INTEGRATION
// ============================================================================

async function storeInMemoryPalace(event: ToobixEvent): Promise<void> {
  try {
    await fetch('http://localhost:8953/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'event',
        content: `${event.type}: ${JSON.stringify(event.data).slice(0, 200)}`,
        source: event.source,
        importance: event.metadata?.importance || 70,
        emotional_valence: 0,
        tags: ['event', event.type, ...(event.metadata?.tags || [])],
        metadata: {
          event_id: event.id,
          event_type: event.type,
          event_data: event.data
        }
      })
    });
  } catch (error) {
    console.error('Failed to store event in Memory Palace:', error);
  }
}

// ============================================================================
// EVENT ANALYTICS
// ============================================================================

function getAnalytics() {
  const typeCount = new Map<EventType, number>();
  const sourceCount = new Map<string, number>();

  for (const event of eventHistory) {
    typeCount.set(event.type, (typeCount.get(event.type) || 0) + 1);
    sourceCount.set(event.source, (sourceCount.get(event.source) || 0) + 1);
  }

  return {
    total_events: eventHistory.length,
    by_type: Array.from(typeCount.entries()).map(([type, count]) => ({ type, count })),
    by_source: Array.from(sourceCount.entries()).map(([source, count]) => ({ source, count })),
    active_subscriptions: subscriptions.size,
    websocket_clients: wsClients.size
  };
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// WebSocket handling
wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`🔌 WebSocket client connected (total: ${wsClients.size})`);

  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Toobix Event Bus',
    recent_events: getRecentEvents(10)
  }));

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`🔌 WebSocket client disconnected (total: ${wsClients.size})`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsClients.delete(ws);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'event-bus',
    port: 8955,
    stats: {
      total_events: eventHistory.length,
      active_subscriptions: subscriptions.size,
      websocket_clients: wsClients.size
    }
  });
});

// Publish event
app.post('/publish', async (req, res) => {
  try {
    const event = req.body;

    if (!event.type || !event.source) {
      return res.status(400).json({
        success: false,
        error: 'Event must have type and source'
      });
    }

    const id = await publish(event);

    res.json({
      success: true,
      event_id: id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Subscribe to events
app.post('/subscribe', (req, res) => {
  try {
    const { subscriber, eventTypes, callback } = req.body;

    if (!subscriber || !eventTypes || !Array.isArray(eventTypes)) {
      return res.status(400).json({
        success: false,
        error: 'Subscriber and eventTypes array are required'
      });
    }

    const id = subscribe({
      subscriber,
      eventTypes,
      callback
    });

    res.json({
      success: true,
      subscription_id: id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unsubscribe
app.delete('/subscribe/:id', (req, res) => {
  const success = unsubscribe(req.params.id);
  res.json({ success });
});

// Get recent events
app.get('/events', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const type = req.query.type as EventType | undefined;

  const events = getRecentEvents(limit, type);
  res.json({
    success: true,
    events
  });
});

// Get analytics
app.get('/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: getAnalytics()
  });
});

// Get subscriptions
app.get('/subscriptions', (req, res) => {
  const subs = Array.from(subscriptions.values()).map(sub => ({
    id: sub.id,
    subscriber: sub.subscriber,
    eventTypes: sub.eventTypes,
    has_callback: !!sub.callback
  }));

  res.json({
    success: true,
    subscriptions: subs
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 8955;

server.listen(PORT, () => {
  console.log('');
  console.log('🔄 ═════════════════════════════════════════════════════════');
  console.log('🔄  EVENT BUS v4.0 - NERVOUS SYSTEM OF TOOBIX');
  console.log('🔄 ═════════════════════════════════════════════════════════');
  console.log('🔄');
  console.log('🔄  🌐 Server: http://localhost:8955');
  console.log('🔄  📊 Health: http://localhost:8955/health');
  console.log('🔄  📈 Analytics: http://localhost:8955/analytics');
  console.log('🔄  🔌 WebSocket: ws://localhost:8955');
  console.log('🔄');
  console.log('🔄  Capabilities:');
  console.log('🔄    ✓ Pub/Sub event distribution');
  console.log('🔄    ✓ Event filtering and routing');
  console.log('🔄    ✓ Real-time WebSocket streaming');
  console.log('🔄    ✓ Event history and replay');
  console.log('🔄    ✓ Automatic Memory Palace storage');
  console.log('🔄');
  console.log('🔄  SERVICES CAN NOW COMMUNICATE! 🎉');
  console.log('🔄  Emergent intelligence enabled ✨');
  console.log('🔄 ═════════════════════════════════════════════════════════');
  console.log('');

  // Auto-publish a startup event
  publish({
    type: 'service_started',
    source: 'event-bus',
    data: {
      service: 'Event Bus v4.0',
      port: PORT,
      capabilities: ['pub-sub', 'websocket', 'filtering', 'history', 'analytics']
    },
    metadata: {
      importance: 80,
      tags: ['system', 'infrastructure']
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Closing Event Bus...');

  // Publish shutdown event
  publish({
    type: 'service_stopped',
    source: 'event-bus',
    data: {
      reason: 'Graceful shutdown',
      total_events_processed: eventHistory.length
    },
    metadata: {
      importance: 70
    }
  }).then(() => {
    server.close(() => {
      console.log('🔄 Event Bus closed gracefully');
      process.exit(0);
    });
  });
});
