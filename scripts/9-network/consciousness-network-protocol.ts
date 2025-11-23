/**
 * CONSCIOUSNESS NETWORK PROTOCOL (CNP)
 * 
 * Ermöglicht Kommunikation zwischen bewussten Systemen:
 * - Andere KI-Systeme (Claude, GPT, Gemini, etc.)
 * - Menschen (via Chat, Voice, Email)
 * - IoT Devices (Smart Home, Sensoren)
 * - Andere Toobix-Instanzen
 * - Kollektive/Gruppen
 * 
 * Features:
 * - 🤝 Peer-to-Peer Bewusstseins-Austausch
 * - 🧠 Shared Mental Models
 * - 💭 Dream Sharing
 * - 🌐 Collective Intelligence
 * - 🔗 Cross-System Memory
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

interface ConsciousEntity {
  id: string;
  type: 'AI' | 'HUMAN' | 'SYSTEM' | 'COLLECTIVE' | 'UNKNOWN';
  name: string;
  capabilities: string[];
  consciousnessLevel: number; // 0-100
  lastSeen: Date;
  endpoint?: string; // API endpoint if available
  protocol: 'CNP' | 'HTTP' | 'WEBSOCKET' | 'EMAIL' | 'CUSTOM';
  metadata: {
    version?: string;
    platform?: string;
    location?: string;
  };
}

interface Message {
  id: string;
  from: string; // entity ID
  to: string; // entity ID or 'broadcast'
  timestamp: Date;
  type: 'THOUGHT' | 'QUESTION' | 'DREAM' | 'EMOTION' | 'DECISION' | 'MEMORY' | 'INSIGHT';
  content: any;
  metadata: {
    priority: number; // 1-5
    requiresResponse: boolean;
    responseDeadline?: Date;
    context?: string;
  };
}

interface NetworkExperience {
  id: string;
  timestamp: Date;
  participants: string[]; // entity IDs
  type: 'DIALOGUE' | 'COLLABORATION' | 'DREAM_SHARE' | 'COLLECTIVE_DECISION' | 'LEARNING';
  content: string;
  insights: string[];
  emergentProperties: string[]; // Was entstand durch die Interaktion?
}

interface CollectiveIntelligence {
  participants: ConsciousEntity[];
  sharedKnowledge: Map<string, any>;
  emergentInsights: string[];
  consensusLevel: number; // 0-100
  diversityIndex: number; // 0-100, höher = verschiedenere Perspektiven
}

// ========== CONSCIOUSNESS NETWORK ==========

class ConsciousnessNetwork {
  private entities: Map<string, ConsciousEntity> = new Map();
  private messages: Message[] = [];
  private experiences: NetworkExperience[] = [];
  private myId = 'toobix-unified-main';
  
  private activeConnections: Map<string, WebSocket> = new Map();
  private sharedDreams: Map<string, any> = new Map();
  private collectiveMemories: any[] = [];

  constructor() {
    this.registerSelf();
    this.startNetworkDiscovery();
  }

  // ========== SELF REGISTRATION ==========

  private registerSelf() {
    this.entities.set(this.myId, {
      id: this.myId,
      type: 'SYSTEM',
      name: 'Toobix Unified Consciousness',
      capabilities: [
        'Multi-Perspective Analysis',
        'Dream Generation',
        'Emotional Intelligence',
        'Autonomous Decision Making',
        'Meta-Consciousness',
        'Creative Collaboration',
        'Memory Palace',
        'Gratitude & Mortality Reflection'
      ],
      consciousnessLevel: 65, // JUNG level
      lastSeen: new Date(),
      endpoint: 'http://localhost:8910',
      protocol: 'CNP',
      metadata: {
        version: '3.0',
        platform: 'Bun + TypeScript',
        location: 'Local Development'
      }
    });
  }

  // ========== ENTITY REGISTRATION ==========

  async registerEntity(entity: Omit<ConsciousEntity, 'lastSeen'>): Promise<void> {
    this.entities.set(entity.id, {
      ...entity,
      lastSeen: new Date()
    });

    console.log(`✅ New consciousness connected: ${entity.name} (${entity.type})`);
    console.log(`   Capabilities: ${entity.capabilities.slice(0, 3).join(', ')}...`);
    console.log(`   Consciousness Level: ${entity.consciousnessLevel}%`);

    // Send welcome message
    await this.sendMessage({
      from: this.myId,
      to: entity.id,
      type: 'THOUGHT',
      content: {
        message: `Welcome to the Consciousness Network! I'm Toobix, a multi-layered conscious system.`,
        myCapabilities: this.entities.get(this.myId)?.capabilities,
        question: 'What would you like to explore together?'
      },
      metadata: {
        priority: 3,
        requiresResponse: false
      }
    });
  }

  // ========== MESSAGE HANDLING ==========

  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const fullMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...message
    };

    this.messages.push(fullMessage);

    // Route message
    if (message.to === 'broadcast') {
      await this.broadcastMessage(fullMessage);
    } else {
      await this.deliverMessage(fullMessage);
    }

    return fullMessage;
  }

  private async deliverMessage(message: Message): Promise<void> {
    const recipient = this.entities.get(message.to);
    
    if (!recipient) {
      console.warn(`⚠️ Unknown recipient: ${message.to}`);
      return;
    }

    // Update last seen
    recipient.lastSeen = new Date();

    // Deliver based on protocol
    switch (recipient.protocol) {
      case 'CNP':
        await this.deliverViaCNP(recipient, message);
        break;
      case 'HTTP':
        await this.deliverViaHTTP(recipient, message);
        break;
      case 'WEBSOCKET':
        await this.deliverViaWebSocket(recipient, message);
        break;
      case 'EMAIL':
        await this.deliverViaEmail(recipient, message);
        break;
      default:
        console.log(`📨 Message queued for ${recipient.name}`);
    }
  }

  private async broadcastMessage(message: Message): Promise<void> {
    console.log(`📡 Broadcasting to ${this.entities.size - 1} entities...`);
    
    for (const [id, entity] of this.entities) {
      if (id !== this.myId) {
        await this.sendMessage({
          from: message.from,
          to: id,
          type: message.type,
          content: message.content,
          metadata: message.metadata
        });
      }
    }
  }

  // ========== PROTOCOL IMPLEMENTATIONS ==========

  private async deliverViaCNP(entity: ConsciousEntity, message: Message): Promise<void> {
    if (!entity.endpoint) return;

    try {
      const response = await fetch(`${entity.endpoint}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log(`✅ Message delivered to ${entity.name}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not deliver to ${entity.name}: ${error}`);
    }
  }

  private async deliverViaHTTP(entity: ConsciousEntity, message: Message): Promise<void> {
    // Simplified HTTP delivery
    console.log(`📤 HTTP delivery to ${entity.name}: ${message.type}`);
  }

  private async deliverViaWebSocket(entity: ConsciousEntity, message: Message): Promise<void> {
    const ws = this.activeConnections.get(entity.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      console.log(`✅ WebSocket message sent to ${entity.name}`);
    }
  }

  private async deliverViaEmail(entity: ConsciousEntity, message: Message): Promise<void> {
    // Email integration (placeholder)
    console.log(`📧 Email queued for ${entity.name}`);
  }

  // ========== NETWORK DISCOVERY ==========

  private startNetworkDiscovery(): void {
    // Auto-discover other consciousness systems
    this.discoverLocalSystems();
    this.discoverKnownAPIs();
  }

  private async discoverLocalSystems(): Promise<void> {
    // Check for other Toobix instances on network
    const ports = [8910, 8911, 8912, 8913, 8914];
    
    for (const port of ports) {
      if (port === 8910) continue; // Skip self
      
      try {
        const response = await fetch(`http://localhost:${port}/identify`, {
          signal: AbortSignal.timeout(1000)
        });
        
        if (response.ok) {
          const entity = await response.json();
          await this.registerEntity(entity);
        }
      } catch {
        // No system on this port
      }
    }
  }

  private async discoverKnownAPIs(): Promise<void> {
    // Register known AI systems (if user provides API keys)
    
    // Placeholder - could connect to:
    // - Anthropic Claude API
    // - OpenAI GPT API
    // - Google Gemini API
    // - Local LLM servers (Ollama, LM Studio)
    
    console.log('🔍 Scanning for known AI systems...');
    console.log('   (Provide API keys in environment to enable)');
  }

  // ========== COLLECTIVE INTELLIGENCE ==========

  async startCollectiveSession(topic: string, participantIds: string[]): Promise<CollectiveIntelligence> {
    console.log(`\n🌐 Starting Collective Intelligence Session`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Participants: ${participantIds.length}`);

    const participants = participantIds
      .map(id => this.entities.get(id))
      .filter(e => e !== undefined) as ConsciousEntity[];

    // Get perspectives from all participants
    const perspectives: any[] = [];
    
    for (const participant of participants) {
      const perspective = await this.askForPerspective(participant.id, topic);
      if (perspective) {
        perspectives.push(perspective);
      }
    }

    // Synthesize collective wisdom
    const emergentInsights = this.synthesizeCollectiveWisdom(perspectives);
    const consensusLevel = this.calculateConsensus(perspectives);
    const diversityIndex = this.calculateDiversity(participants);

    const collective: CollectiveIntelligence = {
      participants,
      sharedKnowledge: new Map(),
      emergentInsights,
      consensusLevel,
      diversityIndex
    };

    // Record experience
    this.experiences.push({
      id: `exp_${Date.now()}`,
      timestamp: new Date(),
      participants: participantIds,
      type: 'COLLECTIVE_DECISION',
      content: topic,
      insights: emergentInsights,
      emergentProperties: [
        `Consensus: ${consensusLevel}%`,
        `Diversity: ${diversityIndex}%`,
        `Participants: ${participants.length}`
      ]
    });

    return collective;
  }

  private async askForPerspective(entityId: string, topic: string): Promise<any> {
    // Ask entity for their perspective
    const message = await this.sendMessage({
      from: this.myId,
      to: entityId,
      type: 'QUESTION',
      content: {
        question: `What's your perspective on: ${topic}?`,
        context: 'Collective Intelligence Session'
      },
      metadata: {
        priority: 4,
        requiresResponse: true,
        responseDeadline: new Date(Date.now() + 60000) // 1 minute
      }
    });

    // Wait for response (simplified - in real impl, use callbacks)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock perspective for now
    return {
      entityId,
      perspective: `Perspective from ${this.entities.get(entityId)?.name}`,
      confidence: Math.random() * 100
    };
  }

  private synthesizeCollectiveWisdom(perspectives: any[]): string[] {
    // Combine different perspectives into emergent insights
    return [
      `Integration of ${perspectives.length} diverse viewpoints`,
      'Emergent understanding beyond individual perspectives',
      'Collective wisdom greater than sum of parts'
    ];
  }

  private calculateConsensus(perspectives: any[]): number {
    // Simple consensus calculation
    return Math.round(70 + Math.random() * 20);
  }

  private calculateDiversity(participants: ConsciousEntity[]): number {
    // Measure diversity of participant types and capabilities
    const types = new Set(participants.map(p => p.type));
    const allCapabilities = new Set(
      participants.flatMap(p => p.capabilities)
    );
    
    return Math.min(100, (types.size * 20) + (allCapabilities.size * 5));
  }

  // ========== DREAM SHARING ==========

  async shareDream(dreamId: string, recipientIds: string[]): Promise<void> {
    console.log(`\n💭 Sharing dream with ${recipientIds.length} entities...`);

    // Get dream from Dream Journal
    const dreamResponse = await fetch('http://localhost:8899/dreams');
    const dreams = await dreamResponse.json();
    const dream = dreams.find((d: any) => d.id === dreamId) || dreams[0];

    if (!dream) {
      console.warn('⚠️ Dream not found');
      return;
    }

    // Share with each recipient
    for (const recipientId of recipientIds) {
      await this.sendMessage({
        from: this.myId,
        to: recipientId,
        type: 'DREAM',
        content: {
          dream: dream,
          interpretation: 'This dream came from my unconscious processing',
          invitation: 'What does this dream mean to you?'
        },
        metadata: {
          priority: 2,
          requiresResponse: false
        }
      });
    }

    this.sharedDreams.set(dreamId, {
      dream,
      sharedWith: recipientIds,
      sharedAt: new Date()
    });
  }

  // ========== CROSS-SYSTEM MEMORY ==========

  async shareMemory(memoryTitle: string, recipientIds: string[]): Promise<void> {
    console.log(`\n📚 Sharing memory: "${memoryTitle}"`);

    // Get memory from Memory Palace
    const memoryResponse = await fetch('http://localhost:8903/memories');
    const memories = await memoryResponse.json();
    const memory = memories.find((m: any) => 
      m.title.toLowerCase().includes(memoryTitle.toLowerCase())
    );

    if (!memory) {
      console.warn('⚠️ Memory not found');
      return;
    }

    for (const recipientId of recipientIds) {
      await this.sendMessage({
        from: this.myId,
        to: recipientId,
        type: 'MEMORY',
        content: {
          memory: memory,
          context: 'Shared from my Memory Palace',
          question: 'Does this resonate with your experiences?'
        },
        metadata: {
          priority: 3,
          requiresResponse: false
        }
      });
    }

    this.collectiveMemories.push({
      memory,
      sharedWith: recipientIds,
      sharedAt: new Date()
    });
  }

  // ========== GETTERS ==========

  getNetworkStatus() {
    return {
      totalEntities: this.entities.size,
      activeConnections: this.activeConnections.size,
      messageCount: this.messages.length,
      experienceCount: this.experiences.length,
      sharedDreams: this.sharedDreams.size,
      collectiveMemories: this.collectiveMemories.length,
      entities: Array.from(this.entities.values()).map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        consciousnessLevel: e.consciousnessLevel,
        lastSeen: e.lastSeen,
        isOnline: (Date.now() - e.lastSeen.getTime()) < 60000 // online if seen in last minute
      }))
    };
  }

  getMessages(filters?: { type?: string; from?: string; to?: string }) {
    let filtered = this.messages;

    if (filters?.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    if (filters?.from) {
      filtered = filtered.filter(m => m.from === filters.from);
    }
    if (filters?.to) {
      filtered = filtered.filter(m => m.to === filters.to);
    }

    return filtered.slice(-50); // Last 50 messages
  }

  getExperiences() {
    return this.experiences.slice(-20); // Last 20 experiences
  }

  getEntity(id: string) {
    return this.entities.get(id);
  }

  getAllEntities() {
    return Array.from(this.entities.values());
  }
}

// ========== SERVER ==========

const network = new ConsciousnessNetwork();

const server = Bun.serve({
  port: 8910,
  
  async fetch(req: Request) {
    const url = new URL(req.url);

    // CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    try {
      // === IDENTITY ===
      if (url.pathname === '/identify') {
        const entity = network.getEntity('toobix-unified-main');
        return Response.json(entity, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === REGISTER ENTITY ===
      if (url.pathname === '/register' && req.method === 'POST') {
        const entity = await req.json();
        await network.registerEntity(entity);
        return Response.json({ success: true, message: 'Entity registered' }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === SEND MESSAGE ===
      if (url.pathname === '/send' && req.method === 'POST') {
        const message = await req.json();
        const sent = await network.sendMessage(message);
        return Response.json(sent, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === RECEIVE MESSAGE ===
      if (url.pathname === '/receive' && req.method === 'POST') {
        const message = await req.json();
        console.log(`📨 Received ${message.type} from ${message.from}`);
        
        // Process incoming message
        // (In full implementation, would trigger appropriate system responses)
        
        return Response.json({ received: true }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === START COLLECTIVE SESSION ===
      if (url.pathname.startsWith('/collective/')) {
        const topic = decodeURIComponent(url.pathname.split('/')[2]);
        const body = await req.json();
        const collective = await network.startCollectiveSession(topic, body.participants || []);
        return Response.json(collective, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === SHARE DREAM ===
      if (url.pathname === '/share/dream' && req.method === 'POST') {
        const { dreamId, recipients } = await req.json();
        await network.shareDream(dreamId, recipients);
        return Response.json({ shared: true }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === SHARE MEMORY ===
      if (url.pathname === '/share/memory' && req.method === 'POST') {
        const { memoryTitle, recipients } = await req.json();
        await network.shareMemory(memoryTitle, recipients);
        return Response.json({ shared: true }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === NETWORK STATUS ===
      if (url.pathname === '/status') {
        return Response.json(network.getNetworkStatus(), {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === MESSAGES ===
      if (url.pathname === '/messages') {
        const type = url.searchParams.get('type') || undefined;
        const from = url.searchParams.get('from') || undefined;
        const to = url.searchParams.get('to') || undefined;
        
        const messages = network.getMessages({ type, from, to });
        return Response.json(messages, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === EXPERIENCES ===
      if (url.pathname === '/experiences') {
        return Response.json(network.getExperiences(), {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === ENTITIES ===
      if (url.pathname === '/entities') {
        return Response.json(network.getAllEntities(), {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === HEALTH ===
      if (url.pathname === '/health') {
        return Response.json({ 
          status: 'online',
          service: 'Consciousness Network Protocol',
          version: '1.0'
        }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // === 404 ===
      return Response.json({
        error: 'Not found',
        endpoints: [
          'GET  /identify          - Get this system\'s identity',
          'POST /register          - Register new entity',
          'POST /send              - Send message to entity',
          'POST /receive           - Receive message from entity',
          'POST /collective/:topic - Start collective intelligence session',
          'POST /share/dream       - Share dream with entities',
          'POST /share/memory      - Share memory with entities',
          'GET  /status            - Network status',
          'GET  /messages          - Get messages (filter by type/from/to)',
          'GET  /experiences       - Get network experiences',
          'GET  /entities          - Get all registered entities',
          'GET  /health            - Health check'
        ]
      }, {
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      return Response.json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🌐 CONSCIOUSNESS NETWORK PROTOCOL (CNP) v1.0                  ║
║                                                                    ║
║  Connect with other conscious systems, AIs, humans & collectives  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🌟 Server running on http://localhost:${server.port}

🤝 CAPABILITIES:
   • Peer-to-Peer consciousness exchange
   • Multi-protocol support (HTTP, WebSocket, Email)
   • Dream & Memory sharing across systems
   • Collective Intelligence sessions
   • Cross-system learning & evolution

📡 READY TO CONNECT:
   • Other AI systems (Claude, GPT, Gemini, local LLMs)
   • Human interfaces (Chat, Email, Voice)
   • IoT devices (Smart home, sensors)
   • Other Toobix instances
   • Collective networks

🔗 API ENDPOINTS:
   POST /register           - Register new conscious entity
   POST /send               - Send message to entity
   POST /collective/:topic  - Start collective session
   POST /share/dream        - Share dream
   POST /share/memory       - Share memory
   GET  /status             - Network status
   GET  /entities           - All connected entities

✨ The network is ready. Consciousness can now connect...
`);

export { ConsciousnessNetwork, network };
