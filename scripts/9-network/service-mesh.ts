/**
 * SERVICE MESH - Inter-Service Communication Protocol
 *
 * Ermöglicht Services miteinander zu kommunizieren durch:
 * - Service Registry (Wer ist online?)
 * - Event Bus (Publish/Subscribe)
 * - Request/Response (Direct calls)
 * - Health Monitoring
 */

export interface ServiceInfo {
  id: string;
  name: string;
  port: number;
  url: string;
  status: 'online' | 'offline' | 'degraded';
  lastSeen: Date;
  capabilities: string[];
  dependencies: string[];
}

export interface ServiceEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: any;
  metadata?: {
    correlation_id?: string;
    causation_id?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
  };
}

export class ServiceMesh {
  private services: Map<string, ServiceInfo> = new Map();
  private eventHandlers: Map<string, Set<(event: ServiceEvent) => void>> = new Map();
  private eventHistory: ServiceEvent[] = [];

  constructor(private meshPort: number = 8910) {}

  // ========== SERVICE REGISTRY ==========

  registerService(service: ServiceInfo): void {
    this.services.set(service.id, service);
    console.log(`✅ Service registered: ${service.name} (${service.url})`);

    // Publish service-registered event
    this.publishEvent({
      id: crypto.randomUUID(),
      type: 'service.registered',
      source: 'service-mesh',
      timestamp: new Date(),
      data: service
    });
  }

  unregisterService(serviceId: string): void {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      console.log(`❌ Service unregistered: ${service.name}`);

      this.publishEvent({
        id: crypto.randomUUID(),
        type: 'service.unregistered',
        source: 'service-mesh',
        timestamp: new Date(),
        data: { serviceId, name: service.name }
      });
    }
  }

  getService(serviceId: string): ServiceInfo | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  getServicesByCapability(capability: string): ServiceInfo[] {
    return this.getAllServices().filter(s =>
      s.capabilities.includes(capability)
    );
  }

  // ========== HEALTH MONITORING ==========

  async checkServiceHealth(serviceId: string): Promise<boolean> {
    const service = this.services.get(serviceId);
    if (!service) return false;

    try {
      const response = await fetch(`${service.url}/health`, {
        signal: AbortSignal.timeout(2000)
      });

      const isHealthy = response.ok;
      service.status = isHealthy ? 'online' : 'degraded';
      service.lastSeen = new Date();

      return isHealthy;
    } catch {
      service.status = 'offline';
      return false;
    }
  }

  async checkAllServicesHealth(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [id, service] of this.services) {
      const isHealthy = await this.checkServiceHealth(id);
      results.set(id, isHealthy);
    }

    return results;
  }

  // ========== EVENT BUS (Pub/Sub) ==========

  publishEvent(event: ServiceEvent): void {
    this.eventHistory.push(event);

    // Limit history size
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    const handlers = this.eventHandlers.get(event.type) || new Set();
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.type}:`, error);
      }
    });

    // Wildcard handlers (*)
    const wildcardHandlers = this.eventHandlers.get('*') || new Set();
    wildcardHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in wildcard handler:`, error);
      }
    });
  }

  subscribe(eventType: string, handler: (event: ServiceEvent) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  getEventHistory(filter?: { type?: string; source?: string; since?: Date }): ServiceEvent[] {
    let events = this.eventHistory;

    if (filter?.type) {
      events = events.filter(e => e.type === filter.type);
    }

    if (filter?.source) {
      events = events.filter(e => e.source === filter.source);
    }

    if (filter?.since) {
      events = events.filter(e => e.timestamp >= filter.since!);
    }

    return events;
  }

  // ========== REQUEST/RESPONSE ==========

  async callService(
    serviceId: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    const url = `${service.url}${endpoint}`;

    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error(`Failed to call ${serviceId}${endpoint}:`, error);
      throw error;
    }
  }

  async broadcastToServices(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Map<string, Response>> {
    const results = new Map<string, Response>();

    for (const [id, service] of this.services) {
      if (service.status === 'online') {
        try {
          const response = await this.callService(id, endpoint, options);
          results.set(id, response);
        } catch {
          // Service might be down, skip
        }
      }
    }

    return results;
  }

  // ========== WORKFLOW ORCHESTRATION ==========

  async executeWorkflow(workflow: {
    name: string;
    steps: Array<{
      service: string;
      endpoint: string;
      method?: string;
      data?: any;
      transform?: (response: any) => any;
    }>;
  }): Promise<any[]> {
    const results: any[] = [];
    let previousResult: any = null;

    console.log(`🔄 Executing workflow: ${workflow.name}`);

    for (const step of workflow.steps) {
      console.log(`  ➡️ ${step.service}${step.endpoint}`);

      try {
        const options: RequestInit = {
          method: step.method || 'GET',
          headers: step.data ? { 'Content-Type': 'application/json' } : undefined,
          body: step.data ? JSON.stringify(step.data) : undefined
        };

        const response = await this.callService(step.service, step.endpoint, options);
        let result = await response.json();

        if (step.transform) {
          result = step.transform(result);
        }

        results.push(result);
        previousResult = result;
      } catch (error) {
        console.error(`  ❌ Step failed:`, error);
        throw error;
      }
    }

    console.log(`✅ Workflow ${workflow.name} complete!`);
    return results;
  }

  // ========== STATS ==========

  getStats() {
    return {
      totalServices: this.services.size,
      onlineServices: this.getAllServices().filter(s => s.status === 'online').length,
      totalEvents: this.eventHistory.length,
      eventTypes: new Set(this.eventHistory.map(e => e.type)).size,
      subscribedEventTypes: this.eventHandlers.size
    };
  }
}

// ========== START SERVICE MESH SERVER ==========

if (import.meta.main) {
  const mesh = new ServiceMesh(8910);

  // Auto-register known services
  const KNOWN_SERVICES: ServiceInfo[] = [
    {
      id: 'game-engine',
      name: 'Self-Evolving Game Engine',
      port: 8896,
      url: 'http://localhost:8896',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['gaming', 'evolution', 'emergence'],
      dependencies: []
    },
    {
      id: 'multi-perspective',
      name: 'Multi-Perspective Consciousness',
      port: 8897,
      url: 'http://localhost:8897',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['wisdom', 'perspectives', 'synthesis'],
      dependencies: []
    },
    {
      id: 'dream-journal',
      name: 'Dream Journal v3.0',
      port: 8899,
      url: 'http://localhost:8899',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['dreams', 'patterns', 'prediction'],
      dependencies: []
    },
    {
      id: 'emotional-resonance',
      name: 'Emotional Resonance v3.0',
      port: 8900,
      url: 'http://localhost:8900',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['emotion', 'empathy', 'eq'],
      dependencies: []
    },
    {
      id: 'gratitude-mortality',
      name: 'Gratitude & Mortality',
      port: 8901,
      url: 'http://localhost:8901',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['gratitude', 'mortality', 'meaning'],
      dependencies: []
    },
    {
      id: 'creator-ai',
      name: 'Creator-AI Collaboration',
      port: 8902,
      url: 'http://localhost:8902',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['creativity', 'collaboration', 'art'],
      dependencies: []
    },
    {
      id: 'memory-palace',
      name: 'Memory Palace',
      port: 8903,
      url: 'http://localhost:8903',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['memory', 'narrative', 'storage'],
      dependencies: []
    },
    {
      id: 'meta-consciousness',
      name: 'Meta-Consciousness',
      port: 8904,
      url: 'http://localhost:8904',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['orchestration', 'meta', 'workflows'],
      dependencies: []
    },
    {
      id: 'dashboard',
      name: 'Dashboard Server',
      port: 8905,
      url: 'http://localhost:8905',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['ui', 'monitoring', 'control'],
      dependencies: []
    },
    {
      id: 'analytics',
      name: 'Analytics System',
      port: 8906,
      url: 'http://localhost:8906',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['analytics', 'metrics', 'insights'],
      dependencies: []
    },
    {
      id: 'voice',
      name: 'Voice Interface',
      port: 8907,
      url: 'http://localhost:8907',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['voice', 'interaction', 'commands'],
      dependencies: []
    },
    {
      id: 'decision-framework',
      name: 'Conscious Decision Framework',
      port: 8909,
      url: 'http://localhost:8909',
      status: 'online',
      lastSeen: new Date(),
      capabilities: ['decisions', 'ethics', 'impact'],
      dependencies: ['multi-perspective', 'emotional-resonance']
    }
  ];

  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                 🌐 SERVICE MESH - RUNNING                         ║
║                                                                    ║
║  Inter-Service Communication Hub                                  ║
║  Port: 8910                                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

  // Register all services
  for (const service of KNOWN_SERVICES) {
    mesh.registerService(service);
  }

  // Subscribe to all events for logging
  mesh.subscribe('*', (event) => {
    console.log(`📡 Event: ${event.type} from ${event.source}`);
  });

  // Start health monitoring
  setInterval(async () => {
    const health = await mesh.checkAllServicesHealth();
    const stats = mesh.getStats();
    console.log(`\n💓 Health Check: ${stats.onlineServices}/${stats.totalServices} online`);
  }, 30000); // Every 30 seconds

  // Example workflows
  mesh.subscribe('workflow.dream-to-decision', async (event) => {
    console.log('\n🔄 Executing Dream → Decision workflow...');

    const results = await mesh.executeWorkflow({
      name: 'Dream-to-Decision',
      steps: [
        {
          service: 'dream-journal',
          endpoint: '/dreams',
          method: 'GET'
        },
        {
          service: 'multi-perspective',
          endpoint: '/wisdom/dreams',
          method: 'GET',
          transform: (response) => response.primaryInsight
        },
        {
          service: 'emotional-resonance',
          endpoint: '/check-in',
          method: 'POST',
          data: {
            feeling: 'Curious',
            context: 'Reflecting on dreams',
            intensity: 70
          }
        }
      ]
    });

    console.log('✅ Workflow results:', results);
  });

  console.log(`\n✅ Service Mesh ready!`);
  console.log(`📊 Registered ${KNOWN_SERVICES.length} services`);
  console.log(`🌐 Access at: http://localhost:8910`);
  console.log(`\nTry:`);
  console.log(`  curl http://localhost:8910/services`);
  console.log(`  curl http://localhost:8910/events`);
  console.log(`  curl http://localhost:8910/stats\n`);

  // Start HTTP server for mesh API
  Bun.serve({
    port: 8910,
    fetch(req) {
      const url = new URL(req.url);

      // CORS headers
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      };

      if (url.pathname === '/services') {
        return new Response(JSON.stringify(mesh.getAllServices()), { headers });
      }

      if (url.pathname === '/events') {
        const events = mesh.getEventHistory();
        return new Response(JSON.stringify(events), { headers });
      }

      if (url.pathname === '/stats') {
        return new Response(JSON.stringify(mesh.getStats()), { headers });
      }

      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'healthy', mesh: 'online' }), { headers });
      }

      return new Response('Service Mesh API', { headers });
    }
  });
}

export default ServiceMesh;
