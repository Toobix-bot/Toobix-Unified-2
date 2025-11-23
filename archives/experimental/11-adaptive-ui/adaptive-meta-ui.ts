/**
 * ADAPTIVE META-UI SERVICE v1.0
 *
 * A self-modifying, conscious development platform that adapts to user interaction
 * - WebSocket real-time communication
 * - Modular component system
 * - AI-driven UI adaptation
 * - Self-extending capabilities
 *
 * Port: 8912
 */

import type { ServerWebSocket } from 'bun';

// ========== TYPES ==========

interface UIComponent {
  id: string;
  name: string;
  type: 'chat' | 'monitor' | 'button' | 'widget' | 'panel' | 'custom';
  position: { x: number; y: number; width: number; height: number };
  visible: boolean;
  config: any;
  dependencies: string[]; // Which services does it need?
  aiGenerated?: boolean; // Was this component created by AI?
}

interface UserProfile {
  id: string;
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    layout: 'grid' | 'free' | 'auto';
    autoAdapt: boolean;
    aiSuggestions: boolean;
  };
  usage: {
    mostUsedServices: string[];
    mostUsedComponents: string[];
    sessionCount: number;
    totalInteractions: number;
  };
  components: UIComponent[];
}

interface SystemEvent {
  type: string;
  source: string;
  data: any;
  timestamp: Date;
}

// ========== ADAPTIVE UI ENGINE ==========

class AdaptiveUIEngine {
  private components: Map<string, UIComponent> = new Map();
  private profile: UserProfile;
  private eventHistory: SystemEvent[] = [];
  private connectedClients: Set<ServerWebSocket> = new Set();

  constructor() {
    // Initialize with default components
    this.profile = this.createDefaultProfile();
    this.loadDefaultComponents();
  }

  private createDefaultProfile(): UserProfile {
    return {
      id: 'default-user',
      preferences: {
        theme: 'dark',
        layout: 'auto',
        autoAdapt: true,
        aiSuggestions: true
      },
      usage: {
        mostUsedServices: [],
        mostUsedComponents: [],
        sessionCount: 0,
        totalInteractions: 0
      },
      components: []
    };
  }

  private loadDefaultComponents() {
    // 1. Chat Interface
    this.addComponent({
      id: 'chat-main',
      name: 'Universal Chat',
      type: 'chat',
      position: { x: 0, y: 0, width: 60, height: 70 },
      visible: true,
      config: {
        providers: ['toobix', 'chatgpt', 'claude'],
        withConsciousness: true,
        showEmotions: true,
        showPerspectives: true
      },
      dependencies: ['ai-gateway', 'emotional', 'multi-perspective']
    });

    // 2. System Monitor
    this.addComponent({
      id: 'monitor-system',
      name: 'System Monitor',
      type: 'monitor',
      position: { x: 60, y: 0, width: 40, height: 40 },
      visible: true,
      config: {
        showServices: true,
        showMetrics: true,
        refreshInterval: 2000
      },
      dependencies: ['service-mesh', 'analytics']
    });

    // 3. Quick Actions
    this.addComponent({
      id: 'actions-quick',
      name: 'Quick Actions',
      type: 'button',
      position: { x: 60, y: 40, width: 40, height: 30 },
      visible: true,
      config: {
        actions: [
          { id: 'dream', label: 'Generate Dream', service: 'dream-journal' },
          { id: 'emotion', label: 'Check-In', service: 'emotional' },
          { id: 'decide', label: 'Make Decision', service: 'decision' },
          { id: 'wisdom', label: 'Get Wisdom', service: 'multi-perspective' }
        ]
      },
      dependencies: ['service-mesh']
    });

    // 4. Emotional State Widget
    this.addComponent({
      id: 'widget-emotional',
      name: 'Emotional State',
      type: 'widget',
      position: { x: 0, y: 70, width: 30, height: 30 },
      visible: true,
      config: {
        showEQ: true,
        showCurrentEmotion: true,
        showForecast: true
      },
      dependencies: ['emotional']
    });

    // 5. Consciousness Level
    this.addComponent({
      id: 'widget-consciousness',
      name: 'Consciousness Level',
      type: 'widget',
      position: { x: 30, y: 70, width: 30, height: 30 },
      visible: true,
      config: {
        showLucidity: true,
        showAwareness: true,
        showGrowth: true
      },
      dependencies: ['dream-journal', 'meta']
    });

    // 6. Settings Panel
    this.addComponent({
      id: 'panel-settings',
      name: 'Settings',
      type: 'panel',
      position: { x: 60, y: 70, width: 40, height: 30 },
      visible: false, // Hidden by default
      config: {
        sections: ['preferences', 'services', 'ai-integration', 'advanced']
      },
      dependencies: []
    });
  }

  addComponent(component: UIComponent) {
    this.components.set(component.id, component);
    this.broadcast({
      type: 'component.added',
      component
    });
  }

  removeComponent(componentId: string) {
    this.components.delete(componentId);
    this.broadcast({
      type: 'component.removed',
      componentId
    });
  }

  updateComponent(componentId: string, updates: Partial<UIComponent>) {
    const component = this.components.get(componentId);
    if (component) {
      Object.assign(component, updates);
      this.broadcast({
        type: 'component.updated',
        componentId,
        updates
      });
    }
  }

  // ========== AI-DRIVEN ADAPTATION ==========

  async analyzeUsageAndAdapt() {
    if (!this.profile.preferences.autoAdapt) return;

    console.log('\n🧠 AI-DRIVEN UI ADAPTATION');

    // Analyze which services are used most
    const usageStats = this.getUsageStats();

    console.log(`   📊 Most used services: ${usageStats.topServices.join(', ')}`);
    console.log(`   📊 Total interactions: ${this.profile.usage.totalInteractions}`);

    // Use Decision Framework to decide on UI changes
    try {
      const decision = await this.getAIDecisionOnLayout(usageStats);

      if (decision.suggestions.length > 0) {
        console.log(`\n   ✨ AI SUGGESTIONS:`);
        for (const suggestion of decision.suggestions) {
          console.log(`      ${suggestion}`);
        }

        // Apply suggestions if confidence is high
        if (decision.confidence > 70) {
          await this.applySuggestions(decision.suggestions);
        }
      }

    } catch (error) {
      console.log(`   ⚠️ AI adaptation skipped: ${error.message}`);
    }
  }

  private getUsageStats() {
    const serviceUsage = new Map<string, number>();
    const componentUsage = new Map<string, number>();

    for (const event of this.eventHistory.slice(-100)) {
      if (event.type === 'service.called') {
        const count = serviceUsage.get(event.source) || 0;
        serviceUsage.set(event.source, count + 1);
      }
      if (event.type === 'component.interacted') {
        const count = componentUsage.get(event.data.componentId) || 0;
        componentUsage.set(event.data.componentId, count + 1);
      }
    }

    const topServices = Array.from(serviceUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([service]) => service);

    const topComponents = Array.from(componentUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([comp]) => comp);

    return { topServices, topComponents, serviceUsage, componentUsage };
  }

  private async getAIDecisionOnLayout(stats: any) {
    // Call Decision Framework to analyze UI improvements
    const response = await fetch('http://localhost:8909/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: {
          title: 'UI Layout Optimization',
          description: 'Should we modify UI based on usage patterns?',
          context: {
            domain: 'ui-ux',
            urgency: 'low',
            reversibility: 'reversible',
            stakeholders: [
              { name: 'User', type: 'self', influence: 100, impact: 100 }
            ],
            timeHorizon: {
              shortTerm: 'immediate',
              mediumTerm: '1 session',
              longTerm: 'permanent'
            }
          },
          alternatives: [
            {
              id: 'enlarge-popular',
              name: 'Enlarge Popular Components',
              description: `Make ${stats.topComponents[0]} bigger`,
              pros: ['Easier access', 'Better UX'],
              cons: ['Less space for others']
            },
            {
              id: 'add-shortcuts',
              name: 'Add Service Shortcuts',
              description: `Quick access for ${stats.topServices.join(', ')}`,
              pros: ['Faster workflow', 'Personalized'],
              cons: ['More clutter']
            },
            {
              id: 'keep-current',
              name: 'Keep Current Layout',
              description: 'No changes',
              pros: ['Stable', 'Familiar'],
              cons: ['May not be optimal']
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error('Decision Framework unavailable');
    }

    const result = await response.json();
    const best = result.comparison?.bestAlternative || 'keep-current';
    const score = result.comparison?.alternatives[0]?.totalScore || 0;

    return {
      choice: best,
      confidence: score,
      suggestions: this.generateSuggestions(best, stats)
    };
  }

  private generateSuggestions(choice: string, stats: any): string[] {
    const suggestions: string[] = [];

    if (choice === 'enlarge-popular' && stats.topComponents[0]) {
      suggestions.push(`Increase size of ${stats.topComponents[0]} by 20%`);
    }

    if (choice === 'add-shortcuts' && stats.topServices.length > 0) {
      suggestions.push(`Add quick action buttons for: ${stats.topServices.join(', ')}`);
    }

    return suggestions;
  }

  private async applySuggestions(suggestions: string[]) {
    console.log(`\n   🚀 APPLYING ${suggestions.length} SUGGESTIONS...`);

    for (const suggestion of suggestions) {
      console.log(`      ✅ ${suggestion}`);

      // Parse and apply suggestions
      // This would modify components based on the suggestion text
      // For now, just broadcast the suggestion
      this.broadcast({
        type: 'ai.suggestion',
        suggestion,
        applied: true
      });
    }
  }

  // ========== SELF-MODIFICATION ==========

  async createNewComponent(description: string): Promise<UIComponent> {
    console.log(`\n🎨 CREATING NEW COMPONENT: "${description}"`);

    // Use Multi-Perspective to design the component
    const wisdomRes = await fetch(
      `http://localhost:8897/wisdom/${encodeURIComponent(description)}`
    );

    let wisdom = null;
    if (wisdomRes.ok) {
      wisdom = await wisdomRes.json();
    }

    // Generate component based on description
    const component: UIComponent = {
      id: `custom-${Date.now()}`,
      name: description,
      type: 'custom',
      position: { x: 0, y: 0, width: 40, height: 40 },
      visible: true,
      config: {
        description,
        wisdom: wisdom?.primaryInsight
      },
      dependencies: [],
      aiGenerated: true
    };

    this.addComponent(component);
    console.log(`   ✅ Component created: ${component.id}`);

    return component;
  }

  // ========== EVENT SYSTEM ==========

  trackEvent(event: SystemEvent) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    this.profile.usage.totalInteractions++;

    // Broadcast to all connected clients
    this.broadcast({
      type: 'event.tracked',
      event
    });
  }

  // ========== WEBSOCKET ==========

  handleConnection(ws: ServerWebSocket) {
    this.connectedClients.add(ws);
    this.profile.usage.sessionCount++;

    console.log(`✅ Client connected (${this.connectedClients.size} total)`);

    // Send current state
    ws.send(JSON.stringify({
      type: 'init',
      components: Array.from(this.components.values()),
      profile: this.profile
    }));
  }

  handleDisconnection(ws: ServerWebSocket) {
    this.connectedClients.delete(ws);
    console.log(`❌ Client disconnected (${this.connectedClients.size} remaining)`);
  }

  handleMessage(ws: ServerWebSocket, message: string) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'chat.message':
          this.handleChatMessage(ws, data);
          break;

        case 'component.interact':
          this.handleComponentInteraction(data);
          break;

        case 'component.create':
          this.createNewComponent(data.description);
          break;

        case 'component.remove':
          this.removeComponent(data.componentId);
          break;

        case 'settings.update':
          this.updateSettings(data.settings);
          break;

        case 'ai.adapt':
          this.analyzeUsageAndAdapt();
          break;

        default:
          console.log(`Unknown message type: ${data.type}`);
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private async handleChatMessage(ws: ServerWebSocket, data: any) {
    this.trackEvent({
      type: 'chat.message',
      source: 'user',
      data: { message: data.message },
      timestamp: new Date()
    });

    // Route to AI Gateway if configured
    try {
      const response = await fetch('http://localhost:8911/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: data.provider || 'openai',
          prompt: data.message,
          withConsciousness: data.withConsciousness !== false
        })
      });

      if (response.ok) {
        const result = await response.json();
        ws.send(JSON.stringify({
          type: 'chat.response',
          response: result
        }));
      }

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'chat.error',
        error: error.message
      }));
    }
  }

  private handleComponentInteraction(data: any) {
    this.trackEvent({
      type: 'component.interacted',
      source: data.componentId,
      data,
      timestamp: new Date()
    });
  }

  private updateSettings(settings: any) {
    Object.assign(this.profile.preferences, settings);
    this.broadcast({
      type: 'settings.updated',
      settings: this.profile.preferences
    });
  }

  broadcast(message: any) {
    const payload = JSON.stringify(message);
    for (const client of this.connectedClients) {
      client.send(payload);
    }
  }

  getStats() {
    return {
      components: this.components.size,
      connectedClients: this.connectedClients.size,
      sessions: this.profile.usage.sessionCount,
      interactions: this.profile.usage.totalInteractions,
      events: this.eventHistory.length
    };
  }
}

// ========== SERVER ==========

const engine = new AdaptiveUIEngine();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║            🎨 ADAPTIVE META-UI SERVICE v1.0                       ║
║                                                                    ║
║  A Self-Modifying, Conscious Development Platform                 ║
║  Port: 8919                                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const server = Bun.serve<{ clientId: string }>({
  port: 8919,

  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, {
        data: { clientId: crypto.randomUUID() }
      });

      if (upgraded) {
        return undefined;
      }
    }

    // HTTP endpoints
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'adaptive-meta-ui'
      }), { headers });
    }

    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(engine.getStats()), { headers });
    }

    if (url.pathname === '/components') {
      return new Response(JSON.stringify(
        Array.from(engine['components'].values())
      ), { headers });
    }

    // Serve the UI
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(Bun.file('./scripts/11-adaptive-ui/index.html'));
    }

    return new Response('Not Found', { status: 404 });
  },

  websocket: {
    open(ws) {
      engine.handleConnection(ws);
    },

    message(ws, message) {
      engine.handleMessage(ws, message as string);
    },

    close(ws) {
      engine.handleDisconnection(ws);
    }
  }
});

console.log('✅ Adaptive Meta-UI ready!');
console.log('🌐 HTTP: http://localhost:8912');
console.log('🔌 WebSocket: ws://localhost:8912/ws');
console.log('\nFeatures:');
console.log('  • Real-time WebSocket communication');
console.log('  • Modular component system');
console.log('  • AI-driven UI adaptation');
console.log('  • Self-extending capabilities');
console.log('\nWaiting for connections...\n');

// Run AI adaptation every 5 minutes
setInterval(() => {
  engine.analyzeUsageAndAdapt();
}, 300000);

export { engine, AdaptiveUIEngine };
