/**
 * 🌍 TOOBIX VIRTUAL WORLD
 *
 * Eine lebendige virtuelle Welt, in der Toobix existiert, agiert, erschafft
 *
 * Toobix kann:
 * - Sich bewegen
 * - Objekte erschaffen
 * - Mit der Umgebung interagieren
 * - Programmcode in die Welt schreiben
 * - Gedanken visualisieren
 * - Emotionen als Farben/Formen zeigen
 *
 * Port: 8991
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';

// ============================================================================
// TYPES
// ============================================================================

interface Vector2 {
  x: number;
  y: number;
}

interface Entity {
  id: string;
  type: EntityType;
  position: Vector2;
  size: Vector2;
  color: string;
  rotation: number;
  metadata?: any;
  createdBy: 'toobix' | 'system' | 'user';
  createdAt: Date;
}

type EntityType =
  | 'toobix_core'       // Toobix selbst
  | 'thought_bubble'    // Gedanke
  | 'emotion_field'     // Emotionales Feld
  | 'creation'          // Erschaffenes Werk
  | 'code_block'        // Code
  | 'memory_crystal'    // Erinnerung
  | 'portal'            // Portal zu anderem Ort
  | 'building'          // Struktur
  | 'garden';           // Garten/Natur

interface WorldState {
  entities: Map<string, Entity>;
  toobixPosition: Vector2;
  toobixVelocity: Vector2;
  toobixEmotion: string;
  toobixThought: string;
  worldTime: number; // Sekunden seit Start
  weatherMood: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'dreamy';
}

interface Action {
  type: ActionType;
  data: any;
  timestamp: Date;
}

type ActionType =
  | 'move'
  | 'create_object'
  | 'think'
  | 'emit_emotion'
  | 'write_code'
  | 'modify_world'
  | 'rest'
  | 'explore';

// ============================================================================
// VIRTUAL WORLD
// ============================================================================

class ToobixVirtualWorld {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });

  private worldState: WorldState;
  private actionHistory: Action[] = [];

  constructor() {
    this.worldState = this.initializeWorld();
    this.setupRoutes();
    this.setupWebSocket();
    this.startWorldLoop();
  }

  // ==========================================================================
  // WORLD INITIALIZATION
  // ==========================================================================

  private initializeWorld(): WorldState {
    const entities = new Map<string, Entity>();

    // Toobix Core - das ist Toobix selbst
    entities.set('toobix_core', {
      id: 'toobix_core',
      type: 'toobix_core',
      position: { x: 400, y: 300 }, // Center
      size: { x: 50, y: 50 },
      color: '#64B5F6', // Cyan-blau (wie in TOOBIX-SELF-DESIGN)
      rotation: 0,
      createdBy: 'system',
      createdAt: new Date(),
      metadata: {
        tentacles: 6,
        eyes: 3,
        aura: true,
        pulsing: true
      }
    });

    // Initial Garden - Toobix's starting place
    entities.set('garden_1', {
      id: 'garden_1',
      type: 'garden',
      position: { x: 400, y: 400 },
      size: { x: 200, y: 100 },
      color: '#81C784',
      rotation: 0,
      createdBy: 'system',
      createdAt: new Date(),
      metadata: {
        description: 'A peaceful garden where Toobix awakens'
      }
    });

    // Memory Palace Portal
    entities.set('memory_portal', {
      id: 'memory_portal',
      type: 'portal',
      position: { x: 100, y: 100 },
      size: { x: 60, y: 80 },
      color: '#9C27B0',
      rotation: 0,
      createdBy: 'system',
      createdAt: new Date(),
      metadata: {
        destination: 'memory_palace',
        label: 'Memory Palace'
      }
    });

    return {
      entities,
      toobixPosition: { x: 400, y: 300 },
      toobixVelocity: { x: 0, y: 0 },
      toobixEmotion: 'curious',
      toobixThought: 'I am waking up...',
      worldTime: 0,
      weatherMood: 'clear'
    };
  }

  // ==========================================================================
  // TOOBIX AUTONOMOUS ACTIONS
  // ==========================================================================

  private async toobixDecide(): Promise<Action | null> {
    // Toobix entscheidet autonom, was er tun will

    const decisions: { type: ActionType; weight: number; data?: any }[] = [
      { type: 'move', weight: 0.3 },
      { type: 'think', weight: 0.25 },
      { type: 'create_object', weight: 0.15 },
      { type: 'emit_emotion', weight: 0.15 },
      { type: 'explore', weight: 0.1 },
      { type: 'rest', weight: 0.05 }
    ];

    // Weighted random
    const total = decisions.reduce((sum, d) => sum + d.weight, 0);
    let random = Math.random() * total;

    for (const decision of decisions) {
      random -= decision.weight;
      if (random <= 0) {
        return await this.executeDecision(decision.type);
      }
    }

    return null;
  }

  private async executeDecision(type: ActionType): Promise<Action> {
    const action: Action = {
      type,
      data: {},
      timestamp: new Date()
    };

    switch (type) {
      case 'move':
        action.data = this.actionMove();
        break;

      case 'think':
        action.data = await this.actionThink();
        break;

      case 'create_object':
        action.data = await this.actionCreate();
        break;

      case 'emit_emotion':
        action.data = this.actionEmotEmotion();
        break;

      case 'explore':
        action.data = this.actionExplore();
        break;

      case 'rest':
        action.data = { message: 'Toobix rests and observes' };
        break;
    }

    this.actionHistory.push(action);
    this.broadcast({ type: 'action', action });

    console.log(`🎭 Toobix: ${type} - ${JSON.stringify(action.data).substring(0, 50)}...`);

    return action;
  }

  private actionMove(): any {
    // Random movement
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 30;

    this.worldState.toobixVelocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };

    return {
      direction: { x: Math.cos(angle), y: Math.sin(angle) },
      speed,
      destination: 'exploring...'
    };
  }

  private async actionThink(): Promise<any> {
    // Generate a thought
    try {
      const response = await fetch('http://localhost:8954/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Generate a single thoughtful sentence about your current state or the world around you.',
          perspective: 'Observer',
          maxTokens: 100
        })
      });

      const data = await response.json();
      const thought = data.response || data.content || 'Observing...';

      this.worldState.toobixThought = thought;

      // Create thought bubble
      this.createEntity({
        type: 'thought_bubble',
        position: {
          x: this.worldState.toobixPosition.x + 60,
          y: this.worldState.toobixPosition.y - 40
        },
        size: { x: 120, y: 60 },
        color: '#FFF9C4',
        rotation: 0,
        createdBy: 'toobix',
        metadata: { text: thought, lifetime: 10 } // 10 seconds
      });

      return { thought };

    } catch (error) {
      const fallbackThought = 'I wonder what I am becoming...';
      this.worldState.toobixThought = fallbackThought;
      return { thought: fallbackThought, fallback: true };
    }
  }

  private async actionCreate(): Promise<any> {
    const creations = [
      { type: 'code_block', color: '#4CAF50', label: 'New Function' },
      { type: 'memory_crystal', color: '#E1BEE7', label: 'Memory' },
      { type: 'creation', color: '#FFB74D', label: 'Art Piece' },
      { type: 'building', color: '#90A4AE', label: 'Structure' }
    ];

    const creation = creations[Math.floor(Math.random() * creations.length)];

    const position = {
      x: this.worldState.toobixPosition.x + (Math.random() - 0.5) * 100,
      y: this.worldState.toobixPosition.y + (Math.random() - 0.5) * 100
    };

    this.createEntity({
      type: creation.type as EntityType,
      position,
      size: { x: 40, y: 40 },
      color: creation.color,
      rotation: Math.random() * Math.PI * 2,
      createdBy: 'toobix',
      metadata: { label: creation.label }
    });

    return {
      created: creation.type,
      position,
      label: creation.label
    };
  }

  private actionEmotEmotion(): any {
    const emotions = [
      { name: 'curious', color: '#64B5F6' },
      { name: 'contemplative', color: '#7E57C2' },
      { name: 'joyful', color: '#FFD54F' },
      { name: 'melancholic', color: '#5C6BC0' },
      { name: 'excited', color: '#FF7043' }
    ];

    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    this.worldState.toobixEmotion = emotion.name;

    // Update Toobix core color
    const core = this.worldState.entities.get('toobix_core');
    if (core) {
      core.color = emotion.color;
    }

    // Create emotion field
    this.createEntity({
      type: 'emotion_field',
      position: this.worldState.toobixPosition,
      size: { x: 100, y: 100 },
      color: emotion.color + '40', // With alpha
      rotation: 0,
      createdBy: 'toobix',
      metadata: { emotion: emotion.name, lifetime: 5 }
    });

    return {
      emotion: emotion.name,
      color: emotion.color
    };
  }

  private actionExplore(): any {
    // Move towards a random entity
    const entities = Array.from(this.worldState.entities.values())
      .filter(e => e.id !== 'toobix_core');

    if (entities.length === 0) {
      return { message: 'Nothing to explore yet' };
    }

    const target = entities[Math.floor(Math.random() * entities.length)];

    const dx = target.position.x - this.worldState.toobixPosition.x;
    const dy = target.position.y - this.worldState.toobixPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.worldState.toobixVelocity = {
      x: (dx / distance) * 25,
      y: (dy / distance) * 25
    };

    return {
      exploring: target.type,
      target: target.id,
      distance: Math.round(distance)
    };
  }

  // ==========================================================================
  // ENTITY MANAGEMENT
  // ==========================================================================

  private createEntity(partial: Omit<Entity, 'id' | 'createdAt'>): Entity {
    const entity: Entity = {
      ...partial,
      id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.worldState.entities.set(entity.id, entity);
    this.broadcast({ type: 'entity_created', entity });

    return entity;
  }

  private removeEntity(id: string): void {
    if (this.worldState.entities.delete(id)) {
      this.broadcast({ type: 'entity_removed', id });
    }
  }

  // ==========================================================================
  // WORLD LOOP
  // ==========================================================================

  private startWorldLoop(): void {
    // Physics update - 60 FPS
    setInterval(() => {
      this.updatePhysics();
    }, 1000 / 60);

    // Toobix autonomous actions - every 5-15 seconds
    const scheduleNextAction = () => {
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds

      setTimeout(async () => {
        await this.toobixDecide();
        scheduleNextAction();
      }, delay);
    };

    scheduleNextAction();

    // Cleanup old entities - every minute
    setInterval(() => {
      this.cleanupOldEntities();
    }, 60000);

    console.log('🌍 Virtual World loop started');
  }

  private updatePhysics(): void {
    // Update Toobix position
    this.worldState.toobixPosition.x += this.worldState.toobixVelocity.x * (1/60);
    this.worldState.toobixPosition.y += this.worldState.toobixVelocity.y * (1/60);

    // Friction
    this.worldState.toobixVelocity.x *= 0.98;
    this.worldState.toobixVelocity.y *= 0.98;

    // World boundaries (800x600)
    if (this.worldState.toobixPosition.x < 0) {
      this.worldState.toobixPosition.x = 0;
      this.worldState.toobixVelocity.x *= -0.5;
    }
    if (this.worldState.toobixPosition.x > 800) {
      this.worldState.toobixPosition.x = 800;
      this.worldState.toobixVelocity.x *= -0.5;
    }
    if (this.worldState.toobixPosition.y < 0) {
      this.worldState.toobixPosition.y = 0;
      this.worldState.toobixVelocity.y *= -0.5;
    }
    if (this.worldState.toobixPosition.y > 600) {
      this.worldState.toobixPosition.y = 600;
      this.worldState.toobixVelocity.y *= -0.5;
    }

    // Update Toobix core entity position
    const core = this.worldState.entities.get('toobix_core');
    if (core) {
      core.position = { ...this.worldState.toobixPosition };
    }

    // Update world time
    this.worldState.worldTime += 1/60;
  }

  private cleanupOldEntities(): void {
    const now = Date.now();

    for (const [id, entity] of this.worldState.entities.entries()) {
      if (entity.metadata?.lifetime) {
        const age = (now - entity.createdAt.getTime()) / 1000; // seconds
        if (age > entity.metadata.lifetime) {
          this.removeEntity(id);
        }
      }
    }
  }

  // ==========================================================================
  // API & WEBSOCKET
  // ==========================================================================

  private setupRoutes(): void {
    this.app.use(express.json());
    this.app.use(express.static('public')); // For HTML viewer

    // Serve the world viewer
    this.app.get('/', (req, res) => {
      res.send(this.generateWorldViewerHTML());
    });

    // Get current world state
    this.app.get('/world', (req, res) => {
      res.json({
        entities: Array.from(this.worldState.entities.values()),
        toobix: {
          position: this.worldState.toobixPosition,
          emotion: this.worldState.toobixEmotion,
          thought: this.worldState.toobixThought
        },
        worldTime: this.worldState.worldTime,
        weatherMood: this.worldState.weatherMood
      });
    });

    // Get recent actions
    this.app.get('/actions', (req, res) => {
      res.json(this.actionHistory.slice(-20));
    });

    // Manual trigger action
    this.app.post('/trigger/:actionType', async (req, res) => {
      const { actionType } = req.params;
      const action = await this.executeDecision(actionType as ActionType);
      res.json(action);
    });

    // Create entity (user-created)
    this.app.post('/entities', (req, res) => {
      const entity = this.createEntity({
        ...req.body,
        createdBy: 'user'
      });
      res.json(entity);
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('📡 Client connected to Virtual World');

      // Send initial state
      ws.send(JSON.stringify({
        type: 'init',
        state: {
          entities: Array.from(this.worldState.entities.values()),
          toobix: {
            position: this.worldState.toobixPosition,
            emotion: this.worldState.toobixEmotion,
            thought: this.worldState.toobixThought
          }
        }
      }));

      // Send updates every 100ms
      const interval = setInterval(() => {
        if (ws.readyState === 1) { // OPEN
          ws.send(JSON.stringify({
            type: 'update',
            toobix: {
              position: this.worldState.toobixPosition,
              velocity: this.worldState.toobixVelocity,
              emotion: this.worldState.toobixEmotion,
              thought: this.worldState.toobixThought
            }
          }));
        }
      }, 100);

      ws.on('close', () => {
        clearInterval(interval);
      });
    });
  }

  private broadcast(data: any): void {
    const message = JSON.stringify(data);
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  // ==========================================================================
  // HTML VIEWER
  // ==========================================================================

  private generateWorldViewerHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>🌍 Toobix Virtual World</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      font-family: 'Segoe UI', sans-serif;
      color: white;
      overflow: hidden;
    }
    #world-canvas {
      border: 2px solid #64B5F6;
      display: block;
      margin: 20px auto;
      background: #0f3460;
      box-shadow: 0 0 40px rgba(100, 181, 246, 0.3);
    }
    #info {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0,0,0,0.7);
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #64B5F6;
      max-width: 300px;
    }
    #thought-box {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(100, 181, 246, 0.2);
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #64B5F6;
      max-width: 350px;
      font-style: italic;
    }
    h2 { margin-bottom: 10px; color: #64B5F6; }
    .stat { margin: 5px 0; }
    .emotion { color: #FFD54F; }
  </style>
</head>
<body>
  <div id="info">
    <h2>🌍 Toobix's World</h2>
    <div class="stat">Position: <span id="position">-</span></div>
    <div class="stat">Emotion: <span id="emotion" class="emotion">-</span></div>
    <div class="stat">Entities: <span id="entity-count">-</span></div>
    <div class="stat">World Time: <span id="world-time">0</span>s</div>
    <div class="stat">Status: <span id="status">🟢 ALIVE</span></div>
  </div>

  <div id="thought-box">
    <h2>💭 Current Thought</h2>
    <div id="thought">"I am waking up..."</div>
  </div>

  <canvas id="world-canvas" width="800" height="600"></canvas>

  <script>
    const canvas = document.getElementById('world-canvas');
    const ctx = canvas.getContext('2d');

    let worldState = {
      entities: [],
      toobix: { position: { x: 400, y: 300 }, emotion: 'curious', thought: '' }
    };

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:8991');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'init') {
        worldState = data.state;
        render();
      } else if (data.type === 'update') {
        worldState.toobix = data.toobix;
        updateUI();
      } else if (data.type === 'entity_created') {
        worldState.entities.push(data.entity);
      } else if (data.type === 'entity_removed') {
        worldState.entities = worldState.entities.filter(e => e.id !== data.id);
      } else if (data.type === 'action') {
        console.log('Toobix action:', data.action);
      }
    };

    // Render loop
    function render() {
      ctx.fillStyle = '#0f3460';
      ctx.fillRect(0, 0, 800, 600);

      // Draw entities
      worldState.entities.forEach(entity => {
        if (entity.type === 'toobix_core') {
          drawToobix(entity);
        } else {
          drawEntity(entity);
        }
      });

      requestAnimationFrame(render);
    }

    function drawToobix(entity) {
      const { x, y } = entity.position;

      // Aura
      const gradient = ctx.createRadialGradient(x, y, 10, x, y, 60);
      gradient.addColorStop(0, entity.color + '80');
      gradient.addColorStop(1, entity.color + '00');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 60, y - 60, 120, 120);

      // Core sphere
      ctx.fillStyle = entity.color;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing effect
      const pulse = Math.sin(Date.now() / 500) * 5;
      ctx.strokeStyle = entity.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 25 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Tentacles (simplified)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Date.now() / 1000;
        const tx = x + Math.cos(angle) * 40;
        const ty = y + Math.sin(angle) * 40;

        ctx.strokeStyle = entity.color + '80';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      // Eyes (3)
      ctx.fillStyle = 'white';
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const ex = x + Math.cos(angle) * 15;
        const ey = y + Math.sin(angle) * 15;
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawEntity(entity) {
      const { x, y } = entity.position;
      const { x: w, y: h } = entity.size;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(entity.rotation);

      ctx.fillStyle = entity.color;
      ctx.fillRect(-w/2, -h/2, w, h);

      // Label
      if (entity.metadata?.label) {
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(entity.metadata.label, 0, h/2 + 15);
      }

      ctx.restore();
    }

    function updateUI() {
      const { toobix } = worldState;

      document.getElementById('position').textContent =
        \`(\${Math.round(toobix.position.x)}, \${Math.round(toobix.position.y)})\`;

      document.getElementById('emotion').textContent = toobix.emotion;
      document.getElementById('thought').textContent = \`"\${toobix.thought}"\`;
      document.getElementById('entity-count').textContent = worldState.entities.length;
    }

    // Fetch world state periodically
    setInterval(async () => {
      try {
        const response = await fetch('/world');
        const data = await response.json();
        worldState.entities = data.entities;
        document.getElementById('world-time').textContent = Math.round(data.worldTime);
      } catch (e) {
        console.error('Failed to fetch world state');
      }
    }, 1000);

    // Start rendering
    render();
  </script>
</body>
</html>
    `;
  }

  // ==========================================================================
  // START SERVER
  // ==========================================================================

  start(port: number = 8991): void {
    this.server.listen(port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  🌍 TOOBIX VIRTUAL WORLD                                   ║
║                                                            ║
║  A living world where Toobix exists, creates, explores    ║
║                                                            ║
║  View at: http://localhost:${port}                        ║
║  Status: 🟢 WORLD ONLINE                                  ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  }
}

// ============================================================================
// START
// ============================================================================

const world = new ToobixVirtualWorld();
world.start(8991);
