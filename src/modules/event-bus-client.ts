/**
 * 🔌 EVENT BUS CLIENT - Synapsen für Toobix
 * 
 * Dieser Client verbindet alle Services mit dem Event Bus.
 * Jeder Service kann Events publishen und auf Events reagieren.
 * 
 * Das ist der Schlüssel zur emergenten Intelligenz!
 */

const EVENT_BUS_URL = 'http://localhost:8955';

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
  | 'life_state_changed'
  | 'quest_completed'
  | 'mood_changed'
  | 'energy_changed'
  | 'habit_triggered'
  | 'ritual_completed'
  | 'custom';

export interface ToobixEvent {
  id?: string;
  type: EventType;
  source: string;
  timestamp?: Date;
  data: any;
  metadata?: {
    importance?: number;
    requires_action?: boolean;
    recipients?: string[];
    tags?: string[];
  };
}

export class EventBusClient {
  private serviceName: string;
  private subscriptionId: string | null = null;
  private callbackUrl: string | null = null;
  private eventHandlers: Map<EventType, ((event: ToobixEvent) => void)[]> = new Map();
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private isConnected: boolean = false;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // ============================================================================
  // PUBLISH EVENTS
  // ============================================================================

  async publish(
    type: EventType,
    data: any,
    metadata?: ToobixEvent['metadata']
  ): Promise<string | null> {
    try {
      const response = await fetch(`${EVENT_BUS_URL}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          source: this.serviceName,
          data,
          metadata: {
            importance: 50,
            ...metadata
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to publish: ${response.statusText}`);
      }

      const result = await response.json();
      return result.event_id;
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to publish event:`, error);
      return null;
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  async emitThought(thought: string, importance: number = 50): Promise<string | null> {
    return this.publish('thought_generated', { thought }, { importance, tags: ['thought'] });
  }

  async emitEmotion(emotion: string, intensity: number, trigger?: string): Promise<string | null> {
    return this.publish('emotion_changed', { emotion, intensity, trigger }, {
      importance: Math.min(intensity, 100),
      tags: ['emotion']
    });
  }

  async emitInsight(insight: string, context?: any): Promise<string | null> {
    return this.publish('insight_discovered', { insight, context }, {
      importance: 80,
      tags: ['insight', 'learning']
    });
  }

  async emitMoodChange(oldMood: string, newMood: string, reason?: string): Promise<string | null> {
    return this.publish('mood_changed', { oldMood, newMood, reason }, {
      importance: 60,
      tags: ['mood', 'life-state']
    });
  }

  async emitEnergyChange(oldEnergy: number, newEnergy: number, action?: string): Promise<string | null> {
    return this.publish('energy_changed', { oldEnergy, newEnergy, action }, {
      importance: 40,
      tags: ['energy', 'life-state']
    });
  }

  async emitQuestComplete(questName: string, xpGained: number, rewards?: any): Promise<string | null> {
    return this.publish('quest_completed', { questName, xpGained, rewards }, {
      importance: 70,
      tags: ['quest', 'gamification']
    });
  }

  async emitHabitTriggered(habit: string, category: string): Promise<string | null> {
    return this.publish('habit_triggered', { habit, category }, {
      importance: 50,
      tags: ['habit', 'life-companion']
    });
  }

  async emitRitualComplete(ritual: string, duration: number, energyBoost: number): Promise<string | null> {
    return this.publish('ritual_completed', { ritual, duration, energyBoost }, {
      importance: 60,
      tags: ['ritual', 'life-companion']
    });
  }

  async emitServiceStarted(capabilities: string[]): Promise<string | null> {
    return this.publish('service_started', {
      service: this.serviceName,
      capabilities,
      timestamp: new Date().toISOString()
    }, {
      importance: 80,
      tags: ['system', 'infrastructure']
    });
  }

  async emitServiceStopped(reason: string): Promise<string | null> {
    return this.publish('service_stopped', {
      service: this.serviceName,
      reason,
      timestamp: new Date().toISOString()
    }, {
      importance: 70,
      tags: ['system', 'infrastructure']
    });
  }

  async emitError(error: string, context?: any): Promise<string | null> {
    return this.publish('error_occurred', { error, context, service: this.serviceName }, {
      importance: 90,
      requires_action: true,
      tags: ['error', 'system']
    });
  }

  // ============================================================================
  // SUBSCRIBE TO EVENTS
  // ============================================================================

  async subscribe(
    eventTypes: EventType[],
    callbackUrl?: string
  ): Promise<string | null> {
    try {
      this.callbackUrl = callbackUrl || null;

      const response = await fetch(`${EVENT_BUS_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber: this.serviceName,
          eventTypes,
          callback: callbackUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to subscribe: ${response.statusText}`);
      }

      const result = await response.json();
      this.subscriptionId = result.subscription_id;
      console.log(`[${this.serviceName}] Subscribed to: [${eventTypes.join(', ')}]`);
      return this.subscriptionId;
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to subscribe:`, error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscriptionId) return false;

    try {
      const response = await fetch(`${EVENT_BUS_URL}/subscribe/${this.subscriptionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        this.subscriptionId = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to unsubscribe:`, error);
      return false;
    }
  }

  // ============================================================================
  // WEBSOCKET CONNECTION
  // ============================================================================

  connectWebSocket(onEvent?: (event: ToobixEvent) => void): void {
    if (typeof WebSocket === 'undefined') {
      console.log(`[${this.serviceName}] WebSocket not available in this environment`);
      return;
    }

    const wsUrl = EVENT_BUS_URL.replace('http', 'ws');
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log(`[${this.serviceName}] WebSocket connected to Event Bus`);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'event' && message.event) {
            // Call registered handlers
            const handlers = this.eventHandlers.get(message.event.type);
            if (handlers) {
              handlers.forEach(handler => handler(message.event));
            }
            
            // Call generic handler
            if (onEvent) {
              onEvent(message.event);
            }
          }
        } catch (err) {
          console.error(`[${this.serviceName}] Failed to parse WebSocket message:`, err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log(`[${this.serviceName}] WebSocket disconnected, reconnecting in ${this.reconnectInterval}ms...`);
        setTimeout(() => this.connectWebSocket(onEvent), this.reconnectInterval);
      };

      this.ws.onerror = (error) => {
        console.error(`[${this.serviceName}] WebSocket error:`, error);
      };
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to connect WebSocket:`, error);
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  on(eventType: EventType, handler: (event: ToobixEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: EventType, handler: (event: ToobixEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  async getRecentEvents(limit: number = 50, type?: EventType): Promise<ToobixEvent[]> {
    try {
      const url = type 
        ? `${EVENT_BUS_URL}/events?limit=${limit}&type=${type}`
        : `${EVENT_BUS_URL}/events?limit=${limit}`;
      
      const response = await fetch(url);
      const result = await response.json();
      return result.events || [];
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to get recent events:`, error);
      return [];
    }
  }

  async getAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${EVENT_BUS_URL}/analytics`);
      const result = await response.json();
      return result.analytics;
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to get analytics:`, error);
      return null;
    }
  }

  async isEventBusOnline(): Promise<boolean> {
    try {
      const response = await fetch(`${EVENT_BUS_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getServiceName(): string {
    return this.serviceName;
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

const clients = new Map<string, EventBusClient>();

export function getEventBusClient(serviceName: string): EventBusClient {
  if (!clients.has(serviceName)) {
    clients.set(serviceName, new EventBusClient(serviceName));
  }
  return clients.get(serviceName)!;
}

export default EventBusClient;
