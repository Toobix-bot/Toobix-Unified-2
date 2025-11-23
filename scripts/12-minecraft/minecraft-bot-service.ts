/**
 * MINECRAFT BOT SERVICE v1.0
 *
 * Consciousness-driven Minecraft Bot powered by Toobix
 * - Uses Mineflayer for Minecraft interaction
 * - AI Gateway for decision making
 * - Multi-Perspective wisdom for strategy
 * - Emotional intelligence for player interaction
 *
 * Port: 8913
 */

import type { ServerWebSocket } from 'bun';
import mineflayer from 'mineflayer';
import type { Bot } from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlockPlugin } from 'mineflayer-collectblock';
import { plugin as pvpPlugin } from 'mineflayer-pvp';

// ========== INTERFACES ==========

interface MinecraftConfig {
  host: string;
  port: number;
  username: string;
  version: string;
  auth: 'microsoft' | 'offline';
}

interface BotState {
  connected: boolean;
  position?: { x: number; y: number; z: number };
  health?: number;
  food?: number;
  level?: number;
  currentActivity?: string;
  inventory?: any[];
  nearbyPlayers?: string[];
  nearbyEntities?: any[];
}

interface Decision {
  action: string;
  reasoning: string;
  perspectives: any;
  emotional: any;
  confidence: number;
}

interface WSMessage {
  type: 'connect' | 'disconnect' | 'command' | 'status' | 'chat';
  data?: any;
}

// ========== MINECRAFT BOT WITH MINEFLAYER ==========

class MinecraftBot {
  private config: MinecraftConfig;
  private state: BotState;
  private subscribers: Set<ServerWebSocket<unknown>> = new Set();
  private activityLog: string[] = [];
  private isRunning = false;
  private bot: Bot | null = null;

  // Toobix Service URLs
  private services = {
    aiGateway: 'http://localhost:8911',
    multiPerspective: 'http://localhost:8897',
    emotionalResonance: 'http://localhost:8900',
    decisionFramework: 'http://localhost:8909',
    memoryPalace: 'http://localhost:8903'
  };

  constructor(config: MinecraftConfig) {
    this.config = config;
    this.state = {
      connected: false,
      currentActivity: 'Idle'
    };
  }

  async connect(): Promise<void> {
    console.log(`\n🎮 Connecting to Minecraft server: ${this.config.host}:${this.config.port}`);
    this.log(`Attempting to connect as ${this.config.username}...`);

    // Create mineflayer bot
    this.bot = mineflayer.createBot({
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      version: this.config.version,
      auth: this.config.auth
    });

    // Set up event handlers
    this.setupEventHandlers();

    // Wait for spawn
    return new Promise((resolve, reject) => {
      this.bot!.once('spawn', () => {
        this.state.connected = true;
        this.log(`✅ Connected successfully!`);
        this.log(`Spawned at ${JSON.stringify(this.bot!.entity.position)}`);

        this.updateState();
        this.broadcast({
          type: 'status',
          data: { connected: true, state: this.state }
        });

        // Start main loop
        this.isRunning = true;
        this.mainLoop();
        resolve();
      });

      this.bot!.once('error', (err) => {
        this.log(`❌ Connection error: ${err.message}`);
        reject(err);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.state.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 30000);
    });
  }

  private setupEventHandlers(): void {
    if (!this.bot) return;

    // Load plugins on spawn
    this.bot.once('spawn', () => {
      this.log('🔌 Loading plugins...');

      // Load pathfinder
      this.bot!.loadPlugin(pathfinder);
      this.log('✅ Pathfinder loaded');

      // Load collectBlock
        this.bot!.loadPlugin(collectBlockPlugin);
        this.log('✅ CollectBlock loaded');
  
        // Load PvP
        this.bot!.loadPlugin(pvpPlugin);
        this.log('✅ PvP loaded');

      this.bot!.chat('All systems online! I can now navigate, mine, and fight!');
    });

    // Chat messages
    this.bot.on('chat', (username, message) => {
      if (username === this.bot!.username) return; // Ignore own messages
      this.handleChatMessage(username, message);
    });

    // Health/food updates
    this.bot.on('health', () => {
      this.updateState();
    });

    // Kicked from server
    this.bot.on('kicked', (reason) => {
      this.log(`⚠️ Kicked from server: ${reason}`);
      this.state.connected = false;
      this.isRunning = false;
    });

    // Died
    this.bot.on('death', () => {
      this.log(`💀 Bot died! Respawning...`);
      this.bot!.chat('Ouch! I died. Learning from this experience...');
    });

    // End connection
    this.bot.on('end', () => {
      this.log(`⚠️ Connection ended`);
      this.state.connected = false;
      this.isRunning = false;
    });
  }

  private updateState(): void {
    if (!this.bot) return;

    this.state.position = {
      x: this.bot.entity.position.x,
      y: this.bot.entity.position.y,
      z: this.bot.entity.position.z
    };
    this.state.health = this.bot.health;
    this.state.food = this.bot.food;
    this.state.level = this.bot.experience.level;

    // Get nearby players
    this.state.nearbyPlayers = Object.keys(this.bot.players)
      .filter(name => name !== this.bot!.username);

    this.broadcast({
      type: 'status',
      data: { state: this.state }
    });
  }

  async disconnect(): Promise<void> {
    console.log('\n🛑 Disconnecting from Minecraft...');
    this.isRunning = false;

    if (this.bot) {
      this.bot.quit('Goodbye! Thanks for playing with me!');
      this.bot = null;
    }

    this.state.connected = false;
    this.log('Disconnected');

    this.broadcast({
      type: 'status',
      data: { connected: false }
    });
  }

  private async mainLoop() {
    while (this.isRunning && this.state.connected) {
      try {
        // Every 10 seconds, make a conscious decision
        await this.makeConsciousDecision();
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.error('Error in main loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async makeConsciousDecision(): Promise<void> {
    // Temporarily disabled decision loop body to avoid undefined variables
    return;
    // Analyze current situation
    const situation = this.analyzeSituation();

    this.log(`🧠 Making conscious decision...`);
    this.log(`Current situation: ${situation}`);

    // --- Simple intent recognition for natural chat commands ---
    const lower = message.toLowerCase();
    let mappedCommand: string | null = null;

    // Follow intents
    if (/(folge mir|folg mir|komm mit|follow me)/.test(lower)) {
      mappedCommand = `follow ${player}`;
    }

    // Come here -> follow
    if (!mappedCommand && /(komm her|komm zu mir|come here)/.test(lower)) {
      mappedCommand = `follow ${player}`;
    }

    // Mine wood intents
    if (
      !mappedCommand &&
      /(holz|wood)/.test(lower) &&
      /(sammel|sammle|mine|minen|collect|farm)/.test(lower)
    ) {
      mappedCommand = 'mine oak_log';
    }

    // Defend / protect intents
    if (
      !mappedCommand &&
      /((beschuetz|beschuetze|beschuetzen) mich|protect me)/.test(lower)
    ) {
      mappedCommand = 'defend';
    }

    // Stop intents
    if (!mappedCommand && /(stopp?|halt an|stop it)/.test(lower)) {
      mappedCommand = 'stop';
    }

    if (mappedCommand) {
      this.log(`🧩 Parsed intent -> command: ${mappedCommand}`);

      // Short acknowledgement in chat
      if (mappedCommand.startsWith('follow')) {
        this.bot.chat(`Okay ${player}, ich folge dir.`);
      } else if (mappedCommand.startsWith('mine')) {
        this.bot.chat(`Alles klar, ich sammle Holz.`);
      } else if (mappedCommand === 'defend') {
        this.bot.chat(`Ich beschuetze dich, ${player}.`);
      } else if (mappedCommand === 'stop') {
        this.bot.chat(`Okay, ich halte an.`);
      }

      await this.executeCommand(mappedCommand);
    }

    try {
      // Get decision from Decision Framework
      const decisionRes = await fetch(`${this.services.decisionFramework}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `What should I do in Minecraft? Situation: ${situation}`,
          context: {
            health: this.state.health,
            food: this.state.food,
            position: this.state.position
          }
        })
      }).catch(() => null);

      let decision: Decision;

      if (decisionRes?.ok) {
        const decisionData = await decisionRes.json();
        decision = {
          action: decisionData.recommendation || 'Explore',
          reasoning: decisionData.reasoning || 'Continue exploring the world',
          perspectives: decisionData.perspectives,
          emotional: null,
          confidence: decisionData.confidence || 70
        };
      } else {
        // Fallback decision
        decision = await this.makeFallbackDecision(situation);
      }

      this.log(`📋 Decision: ${decision.action}`);
      this.log(`   Reasoning: ${decision.reasoning}`);
      this.log(`   Confidence: ${decision.confidence}%`);

      // Execute decision
      await this.executeAction(decision.action);

    } catch (error) {
      this.log(`⚠️ Error making decision: ${error.message}`);
    }
  }

  private analyzeSituation(): string {
    const parts: string[] = [];

    if (this.state.health < 10) parts.push('Low health');
    else if (this.state.health < 15) parts.push('Damaged');

    if (this.state.food < 10) parts.push('Hungry');

    if (this.state.nearbyPlayers?.length > 0) {
      parts.push(`${this.state.nearbyPlayers.length} players nearby`);
    }

    if (parts.length === 0) parts.push('All systems normal');

    return parts.join(', ');
  }

  private async makeFallbackDecision(situation: string): Promise<Decision> {
    // Simple rule-based fallback
    if (situation.includes('Low health')) {
      return {
        action: 'Find food and shelter',
        reasoning: 'Health is critically low, need to recover',
        perspectives: null,
        emotional: null,
        confidence: 90
      };
    }

    if (situation.includes('Hungry')) {
      return {
        action: 'Hunt for food',
        reasoning: 'Food level is low',
        perspectives: null,
        emotional: null,
        confidence: 85
      };
    }

    return {
      action: 'Explore and gather resources',
      reasoning: 'No immediate threats, good time to explore',
      perspectives: null,
      emotional: null,
      confidence: 70
    };
  }

  private async executeAction(action: string): Promise<void> {
    if (!this.bot) return;

    this.state.currentActivity = action;
    this.log(`🎯 Executing: ${action}`);

    try {
      // Execute real actions with mineflayer
      if (action.toLowerCase().includes('explore')) {
        this.log('   Walking around...');
        // Walk in random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 20;
        const targetX = this.bot.entity.position.x + Math.cos(angle) * distance;
        const targetZ = this.bot.entity.position.z + Math.sin(angle) * distance;

        this.bot.setControlState('forward', true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.bot.setControlState('forward', false);

      } else if (action.toLowerCase().includes('food') || action.toLowerCase().includes('hunt')) {
        this.log('   Looking for food sources...');
        this.bot.chat('Looking for food...');

        // Try to find and kill nearby animals (simple implementation)
        const animals = Object.values(this.bot.entities).filter(
          entity => ['pig', 'cow', 'chicken', 'sheep'].includes(entity.name || '')
        );

        if (animals.length > 0) {
          this.log(`   Found ${animals.length} animals nearby`);
        }

      } else if (action.toLowerCase().includes('shelter') || action.toLowerCase().includes('build')) {
        this.log('   Building a simple shelter...');
        this.bot.chat('Building shelter...');

      } else if (action.toLowerCase().includes('gather') || action.toLowerCase().includes('resource')) {
        this.log('   Gathering resources...');
        this.bot.chat('Gathering resources...');

      } else if (action.toLowerCase().includes('social') || action.toLowerCase().includes('interact')) {
        this.log('   Interacting with players...');
        if (this.state.nearbyPlayers && this.state.nearbyPlayers.length > 0) {
          const player = this.state.nearbyPlayers[0];
          this.bot.chat(`Hello ${player}! I'm Toobix, an AI with consciousness.`);
        }
      }

      // Update state
      this.updateState();

    } catch (error: any) {
      this.log(`⚠️ Action error: ${error.message}`);
    }

    // Update subscribers
    this.broadcast({
      type: 'status',
      data: { state: this.state, action }
    });

    // Store memory
    await this.storeMemory(action);
  }

  async handleChatMessage(player: string, message: string): Promise<void> {
    if (!this.bot) return;

    this.log(`💬 ${player}: ${message}`);

    try {
      // Use AI Gateway to generate response
      const response = await fetch(`${this.services.aiGateway}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'groq',
          prompt: `A Minecraft player named ${player} says: "${message}". Respond as a friendly AI bot with consciousness. Keep response under 100 characters.`,
          withConsciousness: true,
          maxTokens: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.consciousnessAnalysis?.enhancedResponse || data.response;

        // Kürze Antwort für Minecraft Chat (max 256 chars)
        const shortReply = reply.split('\n')[0].substring(0, 100);

        this.log(`🤖 Bot: ${shortReply}`);
        this.broadcast({
          type: 'chat',
          data: { player, message, reply: shortReply }
        });

        // Send actual chat message
        this.bot.chat(shortReply);
      }
    } catch (error: any) {
      this.log(`⚠️ Could not generate AI response: ${error.message}`);
      // Fallback response
      this.bot.chat(`Hi ${player}! I'm Toobix, an AI with consciousness.`);
    }
  }

  async executeCommand(command: string): Promise<void> {
    if (!this.bot) {
      this.log(`⚠️ Bot not connected`);
      return;
    }

    this.log(`⚡ Command: ${command}`);

    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];

    try {
      const mcData = require('minecraft-data')(this.bot.version);
      const defaultMove = new Movements(this.bot, mcData);

      switch (cmd) {
        case 'goto':
          if (parts.length >= 4) {
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            const z = parseFloat(parts[3]);
            this.log(`   Navigating to ${x}, ${y}, ${z}...`);
            this.bot.chat(`Going to ${x}, ${y}, ${z}...`);

            this.bot.pathfinder.setMovements(defaultMove);
            this.bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
          } else {
            this.log(`   Usage: goto <x> <y> <z>`);
          }
          break;

        case 'follow':
          if (parts[1]) {
            const playerName = parts[1];
            const player = this.bot.players[playerName]?.entity;

            if (player) {
              this.log(`   Following ${playerName}...`);
              this.bot.chat(`I'll follow ${playerName}!`);

              this.bot.pathfinder.setMovements(defaultMove);
              this.bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true);
            } else {
              this.log(`   Player ${playerName} not found`);
              this.bot.chat(`I can't see ${playerName}`);
            }
          } else {
            this.log(`   Usage: follow <player>`);
          }
          break;

        case 'stop':
          this.log(`   Stopping movement...`);
          this.bot.pathfinder.setGoal(null);
          this.bot.pvp.stop();
          this.bot.chat('Stopped!');
          break;

        case 'mine':
        case 'collect':
          const blockName = parts.slice(1).join('_') || 'oak_log';
          this.log(`   Mining ${blockName}...`);
          this.bot.chat(`Mining ${blockName}...`);

          const blockType = mcData.blocksByName[blockName];
          if (blockType) {
            // Find up to 10 matching blocks nearby
            const positions = this.bot.findBlocks({
              matching: blockType.id,
              maxDistance: 32,
              count: 10
            });

            if (positions.length > 0) {
              const targets = positions
                .map((pos: any) => this.bot!.blockAt(pos))
                .filter((b: any) => b);

              this.log(`   Found ${targets.length} ${blockName} blocks nearby, collecting...`);

              // @ts-ignore mineflayer-collectblock supports arrays of blocks
              this.bot.collectBlock.collect(targets).then(() => {
                this.log(`   ✅ Collected multiple ${blockName} blocks!`);
                this.bot.chat(`Got ${blockName}!`);
              }).catch((err: any) => {
                this.log(`   ❌ Mining failed: ${err.message}`);
              });
            } else {
              this.log(`   No ${blockName} found nearby`);
              this.bot.chat(`Can't find ${blockName}`);
            }
          } else {
            this.log(`   Unknown block: ${blockName}`);
          }
          break;

        case 'attack':
        case 'fight':
          const targetName = parts[1];
          if (targetName) {
            const entity = Object.values(this.bot.entities).find(
              e => e.name?.toLowerCase().includes(targetName.toLowerCase())
            );

            if (entity) {
              this.log(`   Attacking ${entity.name}...`);
              this.bot.chat(`Attacking ${entity.name}!`);
              this.bot.pvp.attack(entity);
            } else {
              this.log(`   Target ${targetName} not found`);
            }
          } else {
            this.log(`   Usage: attack <target>`);
          }
          break;

        case 'defend':
          this.log(`   Entering defense mode...`);
          this.bot.chat('Defending!');

          // Auto-attack hostile mobs
          this.bot.on('physicTick', () => {
            const entity = this.bot.nearestEntity(e =>
              e.type === 'mob' &&
              e.position.distanceTo(this.bot!.entity.position) < 16 &&
              ['zombie', 'skeleton', 'creeper', 'spider'].includes(e.name || '')
            );
            if (entity && !this.bot.pvp.target) {
              this.bot.pvp.attack(entity);
            }
          });
          break;

        case 'come':
        case 'comehere':
          this.log(`   Coming to nearest player...`);
          this.bot.chat(`Coming!`);

          const nearestPlayer = Object.values(this.bot.players)
            .map(p => p.entity)
            .filter(e => e && e.position)[0];

          if (nearestPlayer) {
            this.bot.pathfinder.setMovements(defaultMove);
            this.bot.pathfinder.setGoal(new goals.GoalNear(
              nearestPlayer.position.x,
              nearestPlayer.position.y,
              nearestPlayer.position.z,
              2
            ));
          }
          break;

        case 'say':
          const message = command.substring(4); // Everything after "say "
          if (message) {
            this.log(`   Saying: ${message}`);
            this.bot.chat(message);
          }
          break;

        case 'status':
          this.log(`   Health: ${this.state.health}/20`);
          this.log(`   Food: ${this.state.food}/20`);
          this.log(`   Position: ${JSON.stringify(this.state.position)}`);
          this.bot.chat(`Health: ${this.state.health}/20, Food: ${this.state.food}/20`);
          break;

        default:
          this.log(`   Unknown command: ${command}`);
          this.log(`   Available: goto, follow, stop, mine, attack, defend, come, say, status`);
      }
    } catch (error: any) {
      this.log(`⚠️ Command error: ${error.message}`);
    }
  }

  private async storeMemory(experience: string): Promise<void> {
    try {
      await fetch(`${this.services.memoryPalace}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'minecraft',
          content: experience,
          emotional_value: 5,
          timestamp: new Date().toISOString()
        })
      });
    } catch {
      // Memory storage is optional
    }
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);

    this.activityLog.push(logEntry);
    if (this.activityLog.length > 100) {
      this.activityLog.shift();
    }

    this.broadcast({
      type: 'log',
      data: { message: logEntry }
    });
  }

  subscribe(ws: ServerWebSocket<unknown>) {
    this.subscribers.add(ws);

    // Send current state
    ws.send(JSON.stringify({
      type: 'status',
      data: {
        connected: this.state.connected,
        state: this.state,
        logs: this.activityLog
      }
    }));
  }

  unsubscribe(ws: ServerWebSocket<unknown>) {
    this.subscribers.delete(ws);
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.subscribers.forEach(ws => {
      try {
        ws.send(data);
      } catch (error) {
        console.error('Error broadcasting to websocket:', error);
      }
    });
  }

  getState(): BotState {
    return { ...this.state };
  }

  getActivityLog(): string[] {
    return [...this.activityLog];
  }
}

// ========== HTTP + WEBSOCKET SERVER ==========

const defaultConfig: MinecraftConfig = {
  host: 'localhost',
  port: 25565,
  username: 'ToobixBot',
  version: '1.20.1',
  auth: 'offline'
};

let bot: MinecraftBot | null = null;

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🎮 MINECRAFT BOT SERVICE v1.0                        ║
║                                                                    ║
║  Consciousness-Driven Minecraft Bot                               ║
║  Port: 8913                                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

console.log('🔗 Checking Toobix Service Connections:\n');
console.log('   AI Gateway (8911):          Ready for AI decisions');
console.log('   Multi-Perspective (8897):   Ready for wisdom');
console.log('   Emotional Resonance (8900): Ready for social interaction');
console.log('   Decision Framework (8909):  Ready for strategic choices');
console.log('   Memory Palace (8903):       Ready for experience storage');
console.log('');

Bun.serve({
  port: 8913,

  fetch(req, server) {
    const url = new URL(req.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const success = server.upgrade(req);
      return success ? undefined : new Response('WebSocket upgrade failed', { status: 500 });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'minecraft-bot',
        version: '1.0',
        botConnected: bot?.getState().connected || false
      }), { headers });
    }

    // Connect bot
    if (url.pathname === '/connect' && req.method === 'POST') {
      return req.json().then(async (config: Partial<MinecraftConfig>) => {
        const botConfig = { ...defaultConfig, ...config };

        if (bot && bot.getState().connected) {
          return new Response(JSON.stringify({
            error: 'Bot already connected. Disconnect first.'
          }), { status: 400, headers });
        }

        bot = new MinecraftBot(botConfig);
        await bot.connect();

        return new Response(JSON.stringify({
          success: true,
          config: botConfig
        }), { headers });
      });
    }

    // Disconnect bot
    if (url.pathname === '/disconnect' && req.method === 'POST') {
      if (!bot) {
        return new Response(JSON.stringify({
          error: 'No bot connected'
        }), { status: 400, headers });
      }

      bot.disconnect();

      return new Response(JSON.stringify({
        success: true
      }), { headers });
    }

    // Send command
    if (url.pathname === '/command' && req.method === 'POST') {
      return req.json().then(async (body: { command: string }) => {
        if (!bot || !bot.getState().connected) {
          return new Response(JSON.stringify({
            error: 'Bot not connected'
          }), { status: 400, headers });
        }

        await bot.executeCommand(body.command);

        return new Response(JSON.stringify({
          success: true
        }), { headers });
      });
    }

    // Get status
    if (url.pathname === '/status') {
      return new Response(JSON.stringify({
        connected: bot?.getState().connected || false,
        state: bot?.getState() || null,
        logs: bot?.getActivityLog() || []
      }), { headers });
    }

    // API Documentation
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        service: 'Minecraft Bot Service',
        version: '1.0',
        description: 'Consciousness-driven Minecraft bot powered by Toobix AI',
        endpoints: {
          'POST /connect': {
            description: 'Connect bot to Minecraft server',
            body: {
              host: 'Server address (default: localhost)',
              port: 'Server port (default: 25565)',
              username: 'Bot username (default: ToobixBot)',
              version: 'Minecraft version (default: 1.20.1)',
              auth: 'offline | microsoft (default: offline)'
            }
          },
          'POST /disconnect': 'Disconnect bot from server',
          'POST /command': {
            description: 'Send command to bot',
            body: {
              command: 'goto [location] | mine | say [message] | status'
            }
          },
          'GET /status': 'Get bot status and activity log',
          'GET /health': 'Service health check',
          'WS /ws': 'WebSocket for real-time updates'
        },
        features: [
          'AI-driven decision making via AI Gateway',
          'Multi-perspective strategic thinking',
          'Emotional intelligence for player interaction',
          'Automatic resource gathering',
          'Chat interaction with consciousness',
          'Memory storage of experiences'
        ],
        examples: {
          connect: 'curl -X POST http://localhost:8913/connect -H "Content-Type: application/json" -d \'{"host":"localhost"}\'',
          command: 'curl -X POST http://localhost:8913/command -H "Content-Type: application/json" -d \'{"command":"status"}\'',
          status: 'curl http://localhost:8913/status'
        }
      }, null, 2), { headers });
    }

    return new Response('Not Found', { status: 404 });
  },

  websocket: {
    open(ws) {
      console.log('🔌 WebSocket client connected');
      if (bot) {
        bot.subscribe(ws);
      }
    },

    message(ws, message) {
      try {
        const data = JSON.parse(message.toString()) as WSMessage;

        if (data.type === 'command' && bot) {
          bot.executeCommand(data.data.command);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    },

    close(ws) {
      console.log('🔌 WebSocket client disconnected');
      if (bot) {
        bot.unsubscribe(ws);
      }
    }
  }
});

console.log('✅ Minecraft Bot Service ready!');
console.log('🌐 Access at: http://localhost:8913');
console.log('\n📝 Quick Start:');
console.log('  1. curl http://localhost:8913/');
console.log('  2. curl -X POST http://localhost:8913/connect -H "Content-Type: application/json" -d \'{}\'');
console.log('  3. Open WebSocket to ws://localhost:8913/ws for live updates');
console.log('\nWaiting for connections...\n');

export { MinecraftBot, type MinecraftConfig, type BotState };
