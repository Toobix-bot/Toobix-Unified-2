/**
 * 🧠 SERVICE INTEGRATION LAYER
 * 
 * Dieses Modul verbindet alle Toobix-Services miteinander
 * und ermöglicht emergente Intelligenz durch Service-Kommunikation.
 * 
 * "Die Synapsen zwischen den Neuronen"
 */

import { getEventBusClient, EventType, ToobixEvent } from './event-bus-client';

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

export interface ServiceInfo {
  name: string;
  port: number;
  healthUrl: string;
  status: 'online' | 'offline' | 'unknown';
  lastCheck: Date;
  capabilities: string[];
}

const SERVICES: ServiceInfo[] = [
  {
    name: 'memory-palace',
    port: 8953,
    healthUrl: 'http://localhost:8953/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['memories', 'knowledge-graph', 'dreams', 'conversations']
  },
  {
    name: 'llm-gateway',
    port: 8954,
    healthUrl: 'http://localhost:8954/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['chat', 'completion', 'ollama', 'groq']
  },
  {
    name: 'event-bus',
    port: 8955,
    healthUrl: 'http://localhost:8955/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['pub-sub', 'websocket', 'filtering', 'history']
  },
  {
    name: 'public-api',
    port: 8960,
    healthUrl: 'http://localhost:8960/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['rest-api', 'gateway', 'rate-limiting']
  },
  {
    name: 'system-monitor',
    port: 8961,
    healthUrl: 'http://localhost:8961/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['cpu', 'memory', 'disk', 'health-score']
  },
  {
    name: 'file-analysis',
    port: 8962,
    healthUrl: 'http://localhost:8962/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['duplicates', 'folder-analysis', 'recommendations']
  },
  {
    name: 'multi-perspective',
    port: 8897,
    healthUrl: 'http://localhost:8897/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['20-perspectives', 'democratic-decisions', 'synthesis']
  },
  {
    name: 'emotional-resonance',
    port: 8900,
    healthUrl: 'http://localhost:8900/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['sentiment', 'empathy', 'emotional-valence']
  },
  {
    name: 'dream-journal',
    port: 8899,
    healthUrl: 'http://localhost:8899/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['dreams', 'synthesis', 'pattern-recognition']
  },
  {
    name: 'life-companion',
    port: 8970,
    healthUrl: 'http://localhost:8970/health',
    status: 'unknown',
    lastCheck: new Date(),
    capabilities: ['life-state', 'mood-alchemy', 'quests', 'daily-checkin']
  }
];

// ============================================================================
// SERVICE HEALTH CHECKER
// ============================================================================

export async function checkServiceHealth(service: ServiceInfo): Promise<boolean> {
  try {
    const response = await fetch(service.healthUrl, { 
      signal: AbortSignal.timeout(3000) 
    });
    service.status = response.ok ? 'online' : 'offline';
    service.lastCheck = new Date();
    return response.ok;
  } catch {
    service.status = 'offline';
    service.lastCheck = new Date();
    return false;
  }
}

export async function checkAllServices(): Promise<ServiceInfo[]> {
  await Promise.all(SERVICES.map(checkServiceHealth));
  return SERVICES;
}

export function getServiceStatus(): ServiceInfo[] {
  return SERVICES;
}

export function getOnlineServices(): ServiceInfo[] {
  return SERVICES.filter(s => s.status === 'online');
}

// ============================================================================
// SERVICE INTEGRATION PATTERNS
// ============================================================================

export class ServiceIntegration {
  private eventBus = getEventBusClient('service-integration');
  private subscriptions: string[] = [];

  async initialize(): Promise<void> {
    console.log('🔗 Initializing Service Integration Layer...');
    
    // Check all services
    const services = await checkAllServices();
    const online = services.filter(s => s.status === 'online');
    
    console.log(`🔗 ${online.length}/${services.length} services online`);
    
    // Subscribe to all events
    await this.subscribeToEvents();
    
    // Emit integration ready
    await this.eventBus.publish('service_started', {
      service: 'service-integration',
      online_services: online.map(s => s.name)
    }, { importance: 80 });
  }

  private async subscribeToEvents(): Promise<void> {
    const eventTypes: EventType[] = [
      'thought_generated',
      'emotion_changed',
      'dream_completed',
      'insight_discovered',
      'memory_stored',
      'life_state_changed',
      'quest_completed',
      'mood_changed',
      'error_occurred'
    ];

    const subId = await this.eventBus.subscribe(eventTypes);
    if (subId) this.subscriptions.push(subId);
  }

  // ============================================================================
  // CROSS-SERVICE PATTERNS
  // ============================================================================

  /**
   * Wenn eine Emotion sich ändert → Memory Palace speichern + Multi-Perspective analysieren
   */
  async handleEmotionChange(event: ToobixEvent): Promise<void> {
    const { emotion, intensity, trigger } = event.data;
    
    // 1. Store in Memory Palace
    try {
      await fetch('http://localhost:8953/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'emotion',
          content: `Emotion: ${emotion} (Intensity: ${intensity})`,
          source: event.source,
          importance: Math.min(intensity, 100),
          emotional_valence: this.emotionToValence(emotion),
          tags: ['emotion', emotion],
          metadata: { trigger }
        })
      });
    } catch (e) {
      console.error('Failed to store emotion in Memory Palace:', e);
    }

    // 2. High-intensity emotions → Multi-Perspective Analysis
    if (intensity >= 70) {
      try {
        await fetch('http://localhost:8897/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `Intensive Emotion: ${emotion}`,
            context: { intensity, trigger },
            perspectives: ['healer', 'empath', 'sage']
          })
        });
      } catch (e) {
        console.error('Failed to analyze emotion:', e);
      }
    }
  }

  /**
   * Wenn ein Insight entdeckt wird → Memory Palace + Dream Journal
   */
  async handleInsight(event: ToobixEvent): Promise<void> {
    const { insight, context } = event.data;

    // Store as knowledge
    try {
      await fetch('http://localhost:8953/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: insight.slice(0, 100),
          type: 'insight',
          confidence: 0.8,
          sources: [event.source]
        })
      });
    } catch (e) {
      console.error('Failed to store insight:', e);
    }
  }

  /**
   * Wenn ein Quest abgeschlossen wird → Emotion erzeugen + Memory speichern
   */
  async handleQuestComplete(event: ToobixEvent): Promise<void> {
    const { questName, xpGained, rewards } = event.data;

    // 1. Emit positive emotion
    await this.eventBus.emitEmotion('pride', 60, `Quest completed: ${questName}`);

    // 2. Store in Memory Palace
    try {
      await fetch('http://localhost:8953/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          content: `Quest abgeschlossen: ${questName} - ${xpGained} XP gewonnen!`,
          source: 'life-companion',
          importance: 70,
          emotional_valence: 0.8,
          tags: ['quest', 'achievement', 'gamification'],
          metadata: { xpGained, rewards }
        })
      });
    } catch (e) {
      console.error('Failed to store quest completion:', e);
    }
  }

  /**
   * Wenn die Stimmung sich ändert → Life Companion aktualisieren
   */
  async handleMoodChange(event: ToobixEvent): Promise<void> {
    const { oldMood, newMood, reason } = event.data;

    // Update emotional resonance
    try {
      await fetch('http://localhost:8900/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: newMood, transition: `${oldMood} → ${newMood}` })
      });
    } catch (e) {
      console.error('Failed to update emotional resonance:', e);
    }
  }

  /**
   * Bei Fehlern → Logging + Memory + ggf. Multi-Perspective für Analyse
   */
  async handleError(event: ToobixEvent): Promise<void> {
    const { error, context, service } = event.data;

    // Store error for learning
    try {
      await fetch('http://localhost:8953/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          content: `Error in ${service}: ${error}`,
          source: event.source,
          importance: 80,
          emotional_valence: -0.5,
          tags: ['error', 'system', service],
          metadata: context
        })
      });
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private emotionToValence(emotion: string): number {
    const positiveEmotions = ['joy', 'pride', 'love', 'hope', 'calm', 'excited', 'grateful'];
    const negativeEmotions = ['fear', 'anger', 'sadness', 'anxiety', 'frustration', 'despair'];
    
    if (positiveEmotions.includes(emotion.toLowerCase())) return 0.7;
    if (negativeEmotions.includes(emotion.toLowerCase())) return -0.7;
    return 0;
  }

  // ============================================================================
  // EVENT DISPATCHER
  // ============================================================================

  async dispatchEvent(event: ToobixEvent): Promise<void> {
    switch (event.type) {
      case 'emotion_changed':
        await this.handleEmotionChange(event);
        break;
      case 'insight_discovered':
        await this.handleInsight(event);
        break;
      case 'quest_completed':
        await this.handleQuestComplete(event);
        break;
      case 'mood_changed':
        await this.handleMoodChange(event);
        break;
      case 'error_occurred':
        await this.handleError(event);
        break;
    }
  }

  async shutdown(): Promise<void> {
    for (const subId of this.subscriptions) {
      await this.eventBus.unsubscribe();
    }
    await this.eventBus.emitServiceStopped('Integration layer shutdown');
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let integrationInstance: ServiceIntegration | null = null;

export async function getServiceIntegration(): Promise<ServiceIntegration> {
  if (!integrationInstance) {
    integrationInstance = new ServiceIntegration();
    await integrationInstance.initialize();
  }
  return integrationInstance;
}

export default ServiceIntegration;
