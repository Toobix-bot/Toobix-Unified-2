/**
 * 🚌 TOOBIX EVENT BUS
 * 
 * Asynchrone Inter-Service Communication
 * Port: 8920
 */

interface EventSubscription {
  event: string;
  serviceUrl: string;
  serviceName: string;
  subscribedAt: Date;
}

interface Event {
  id: string;
  type: string;
  data: any;
  source: string;
  timestamp: Date;
}

const subscriptions = new Map<string, Set<EventSubscription>>();
const eventHistory: Event[] = [];
const MAX_HISTORY = 1000;

function subscribe(event: string, serviceUrl: string, serviceName: string): void {
  if (!subscriptions.has(event)) {
    subscriptions.set(event, new Set());
  }
  
  const subscription: EventSubscription = {
    event,
    serviceUrl,
    serviceName,
    subscribedAt: new Date()
  };
  
  subscriptions.get(event)!.add(subscription);
  console.log(`📥 ${serviceName} subscribed to '${event}'`);
}

function unsubscribe(event: string, serviceUrl: string): void {
  const subs = subscriptions.get(event);
  if (subs) {
    const toRemove = Array.from(subs).find(s => s.serviceUrl === serviceUrl);
    if (toRemove) {
      subs.delete(toRemove);
      console.log(`📤 ${toRemove.serviceName} unsubscribed from '${event}'`);
    }
  }
}

async function publish(eventType: string, data: any, source: string): Promise<void> {
  const event: Event = {
    id: crypto.randomUUID(),
    type: eventType,
    data,
    source,
    timestamp: new Date()
  };
  
  // Save to history
  eventHistory.unshift(event);
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.pop();
  }
  
  const subs = subscriptions.get(eventType);
  if (!subs || subs.size === 0) {
    console.log(`📭 No subscribers for event '${eventType}'`);
    return;
  }
  
  console.log(`📢 Publishing '${eventType}' to ${subs.size} subscriber(s)`);
  
  const promises = Array.from(subs).map(async (sub) => {
    try {
      const response = await fetch(`${sub.serviceUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        console.warn(`⚠️  ${sub.serviceName} failed to receive event (${response.status})`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to deliver to ${sub.serviceName}: ${error.message}`);
      // Don't remove subscription on temporary failures
    }
  });
  
  await Promise.allSettled(promises);
}

const server = Bun.serve({
  port: 8920,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ 
        status: 'ok',
        subscriptions: subscriptions.size,
        totalSubscribers: Array.from(subscriptions.values()).reduce((sum, s) => sum + s.size, 0),
        eventsInHistory: eventHistory.length
      });
    }
    
    // Subscribe to event
    if (url.pathname === '/subscribe' && req.method === 'POST') {
      try {
        const { event, serviceUrl, serviceName } = await req.json();
        subscribe(event, serviceUrl, serviceName);
        return Response.json({ success: true, message: `Subscribed to ${event}` });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
    
    // Unsubscribe
    if (url.pathname === '/unsubscribe' && req.method === 'POST') {
      try {
        const { event, serviceUrl } = await req.json();
        unsubscribe(event, serviceUrl);
        return Response.json({ success: true });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
    
    // Publish event
    if (url.pathname === '/publish' && req.method === 'POST') {
      try {
        const { event, data, source } = await req.json();
        await publish(event, data, source);
        return Response.json({ success: true, event });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
    
    // Get all subscriptions
    if (url.pathname === '/subscriptions') {
      const result: Record<string, any[]> = {};
      subscriptions.forEach((subs, event) => {
        result[event] = Array.from(subs).map(s => ({
          serviceName: s.serviceName,
          serviceUrl: s.serviceUrl,
          subscribedAt: s.subscribedAt
        }));
      });
      return Response.json(result);
    }
    
    // Get event history
    if (url.pathname === '/history') {
      const limit = parseInt(url.searchParams.get('limit') || '100');
      return Response.json(eventHistory.slice(0, limit));
    }
    
    // Stats
    if (url.pathname === '/stats') {
      const eventTypes = new Map<string, number>();
      eventHistory.forEach(e => {
        eventTypes.set(e.type, (eventTypes.get(e.type) || 0) + 1);
      });
      
      return Response.json({
        totalEvents: eventHistory.length,
        totalSubscriptions: subscriptions.size,
        eventTypes: Object.fromEntries(eventTypes),
        subscribers: Array.from(subscriptions.entries()).map(([event, subs]) => ({
          event,
          count: subs.size
        }))
      });
    }
    
    return new Response('Event Bus API\n\nEndpoints:\n' +
      'POST /subscribe - Subscribe to event\n' +
      'POST /unsubscribe - Unsubscribe from event\n' +
      'POST /publish - Publish event\n' +
      'GET /subscriptions - List all subscriptions\n' +
      'GET /history - Event history\n' +
      'GET /stats - Statistics\n' +
      'GET /health - Health check\n', 
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🚌 TOOBIX EVENT BUS                                          ║
║  Port: 8920                                                   ║
╠════════════════════════════════════════════════════════════════╣
║  Asynchrone Inter-Service Communication                       ║
╠════════════════════════════════════════════════════════════════╣
║  Endpoints:                                                    ║
║  POST /subscribe   - Subscribe to events                      ║
║  POST /publish     - Publish events                           ║
║  GET  /stats       - Event Bus statistics                     ║
╚════════════════════════════════════════════════════════════════╝

🚀 Event Bus is running!
📡 Ready for pub/sub messaging
`);
