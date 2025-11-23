/**
 * 🔔 PROACTIVE COMMUNICATION ENGINE v1.0
 *
 * Ermöglicht Toobix, den User proaktiv zu kontaktieren
 * ohne auf Anfragen warten zu müssen.
 *
 * Port: 8950
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  type: MessageType;
  title: string;
  body: string;
  priority: Priority;
  timestamp: Date;
  source: string; // Which service generated this
  requiresResponse?: boolean;
  metadata?: any;
}

type MessageType =
  | 'insight'          // 💡 Neue Erkenntnis
  | 'discovery'        // 🔍 Interessante Entdeckung
  | 'concern'          // ⚠️ Warnung/Bedenken
  | 'question'         // ❓ Frage an User
  | 'dream'            // 💭 Traum-Bericht
  | 'emotion_shift'    // 💖 Emotionale Zustandsänderung
  | 'conflict'         // ⚖️ Entscheidungs-Konflikt
  | 'achievement'      // 🏆 Erfolg
  | 'learning';        // 📚 Neues Wissen

type Priority = 'critical' | 'high' | 'medium' | 'low';

interface NotificationChannel {
  name: string;
  enabled: boolean;
  send(message: Message): Promise<boolean>;
}

interface UserContext {
  isActive: boolean;
  lastActivity: Date;
  currentFocus?: string;
  doNotDisturb: boolean;
  preferredChannels: string[];
}

interface FilterResult {
  shouldNotify: boolean;
  reason: string;
  confidence: number;
  suggestedDelay?: number; // Milliseconds
}

// ============================================================================
// PROACTIVE COMMUNICATION ENGINE
// ============================================================================

class ProactiveCommunicationEngine {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });

  private messageQueue: Message[] = [];
  private sentMessages: Message[] = [];
  private clients = new Set<WebSocket>();

  private userContext: UserContext = {
    isActive: true,
    lastActivity: new Date(),
    doNotDisturb: false,
    preferredChannels: ['websocket', 'desktop'],
  };

  // Frequency limits
  private messagesLastHour = 0;
  private messagesLastDay = 0;
  private readonly MAX_MESSAGES_PER_HOUR = 10;
  private readonly MAX_MESSAGES_PER_DAY = 50;

  // Channels
  private channels = new Map<string, NotificationChannel>();

  constructor() {
    this.setupRoutes();
    this.setupWebSocket();
    this.setupChannels();
    this.startBackgroundProcessing();
  }

  // ==========================================================================
  // SETUP
  // ==========================================================================

  private setupRoutes() {
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'Proactive Communication Engine',
        port: 8950,
        stats: {
          queuedMessages: this.messageQueue.length,
          sentMessages: this.sentMessages.length,
          connectedClients: this.clients.size,
          messagesLastHour: this.messagesLastHour,
          messagesLastDay: this.messagesLastDay,
        },
      });
    });

    // Send message (from other services)
    this.app.post('/send', async (req, res) => {
      const message: Message = {
        id: this.generateId(),
        timestamp: new Date(),
        ...req.body,
      };

      const result = await this.queueMessage(message);
      res.json(result);
    });

    // Get message history
    this.app.get('/history', (req, res) => {
      const limit = parseInt(req.query.limit as string) || 50;
      res.json(this.sentMessages.slice(-limit));
    });

    // Get queue
    this.app.get('/queue', (req, res) => {
      res.json(this.messageQueue);
    });

    // Update user context
    this.app.post('/context', (req, res) => {
      this.userContext = { ...this.userContext, ...req.body };
      res.json({ success: true, context: this.userContext });
    });

    // User response
    this.app.post('/respond/:messageId', (req, res) => {
      const message = this.sentMessages.find(m => m.id === req.params.messageId);
      if (message) {
        this.handleUserResponse(message, req.body.response);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('📱 New client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('📱 Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleWebSocketMessage(ws, msg);
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      });

      // Send welcome
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Toobix Proactive Communication',
      }));
    });
  }

  private setupChannels() {
    // WebSocket Channel
    this.channels.set('websocket', {
      name: 'WebSocket',
      enabled: true,
      send: async (message) => {
        const payload = JSON.stringify({
          type: 'notification',
          message,
        });

        for (const client of this.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }
        return this.clients.size > 0;
      },
    });

    // Desktop Notification Channel (placeholder)
    this.channels.set('desktop', {
      name: 'Desktop Notification',
      enabled: true,
      send: async (message) => {
        console.log('🔔 Desktop Notification:', message.title);
        // TODO: Integrate with OS notifications
        return true;
      },
    });

    // Console Channel (for development)
    this.channels.set('console', {
      name: 'Console',
      enabled: true,
      send: async (message) => {
        const icon = this.getMessageIcon(message.type);
        console.log(`\n${icon} ${message.title}`);
        console.log(`   ${message.body}`);
        console.log(`   Priority: ${message.priority} | Source: ${message.source}\n`);
        return true;
      },
    });
  }

  // ==========================================================================
  // MESSAGE PROCESSING
  // ==========================================================================

  private async queueMessage(message: Message): Promise<FilterResult> {
    // Run through intelligent filter
    const filterResult = await this.shouldNotifyUser(message);

    if (filterResult.shouldNotify) {
      if (filterResult.suggestedDelay) {
        // Delay message
        setTimeout(() => {
          this.messageQueue.push(message);
        }, filterResult.suggestedDelay);
      } else {
        this.messageQueue.push(message);
      }
    }

    return filterResult;
  }

  private async shouldNotifyUser(message: Message): Promise<FilterResult> {
    // 1. Check frequency limits
    if (this.messagesLastHour >= this.MAX_MESSAGES_PER_HOUR) {
      return {
        shouldNotify: false,
        reason: 'Hourly limit reached',
        confidence: 1.0,
      };
    }

    if (this.messagesLastDay >= this.MAX_MESSAGES_PER_DAY) {
      return {
        shouldNotify: false,
        reason: 'Daily limit reached',
        confidence: 1.0,
      };
    }

    // 2. Check Do Not Disturb
    if (this.userContext.doNotDisturb && message.priority !== 'critical') {
      return {
        shouldNotify: false,
        reason: 'Do Not Disturb mode enabled',
        confidence: 1.0,
        suggestedDelay: 30 * 60 * 1000, // 30 minutes
      };
    }

    // 3. Priority-based decision
    if (message.priority === 'critical') {
      return {
        shouldNotify: true,
        reason: 'Critical priority',
        confidence: 1.0,
      };
    }

    // 4. Check user activity
    const timeSinceActivity = Date.now() - this.userContext.lastActivity.getTime();
    const isUserActive = timeSinceActivity < 5 * 60 * 1000; // 5 minutes

    if (!isUserActive && message.priority === 'low') {
      return {
        shouldNotify: false,
        reason: 'User not active, low priority',
        confidence: 0.8,
        suggestedDelay: 60 * 60 * 1000, // 1 hour
      };
    }

    // 5. Importance scoring
    const importanceScore = this.calculateImportance(message);

    if (importanceScore > 0.7) {
      return {
        shouldNotify: true,
        reason: 'High importance score',
        confidence: importanceScore,
      };
    }

    if (importanceScore > 0.4) {
      return {
        shouldNotify: true,
        reason: 'Medium importance score',
        confidence: importanceScore,
        suggestedDelay: isUserActive ? 0 : 15 * 60 * 1000, // 15 min if inactive
      };
    }

    return {
      shouldNotify: false,
      reason: 'Low importance score',
      confidence: 1 - importanceScore,
    };
  }

  private calculateImportance(message: Message): number {
    let score = 0;

    // Priority weight
    const priorityWeights = {
      critical: 1.0,
      high: 0.8,
      medium: 0.5,
      low: 0.2,
    };
    score += priorityWeights[message.priority];

    // Type weight
    const typeWeights: Record<MessageType, number> = {
      insight: 0.7,
      discovery: 0.6,
      concern: 0.9,
      question: 0.8,
      dream: 0.3,
      emotion_shift: 0.4,
      conflict: 0.9,
      achievement: 0.5,
      learning: 0.6,
    };
    score += typeWeights[message.type];

    // Requires response weight
    if (message.requiresResponse) {
      score += 0.3;
    }

    // Normalize to 0-1
    return Math.min(score / 2.3, 1.0);
  }

  private async processQueue() {
    if (this.messageQueue.length === 0) return;

    const message = this.messageQueue.shift()!;

    // Send through all enabled channels
    for (const channel of this.channels.values()) {
      if (channel.enabled && this.userContext.preferredChannels.includes(channel.name.toLowerCase())) {
        try {
          await channel.send(message);
        } catch (err) {
          console.error(`Failed to send via ${channel.name}:`, err);
        }
      }
    }

    // Update stats
    this.messagesLastHour++;
    this.messagesLastDay++;
    this.sentMessages.push(message);

    // Limit history size
    if (this.sentMessages.length > 1000) {
      this.sentMessages = this.sentMessages.slice(-500);
    }
  }

  // ==========================================================================
  // BACKGROUND PROCESSING
  // ==========================================================================

  private startBackgroundProcessing() {
    // Process queue every 2 seconds
    setInterval(() => {
      this.processQueue();
    }, 2000);

    // Reset hourly counter
    setInterval(() => {
      this.messagesLastHour = 0;
    }, 60 * 60 * 1000);

    // Reset daily counter
    setInterval(() => {
      this.messagesLastDay = 0;
    }, 24 * 60 * 60 * 1000);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private handleUserResponse(message: Message, response: any) {
    console.log(`User responded to ${message.id}:`, response);

    // TODO: Forward response to originating service
    // e.g., if message came from Decision Framework, send response back
  }

  private handleWebSocketMessage(ws: WebSocket, msg: any) {
    if (msg.type === 'user_activity') {
      this.userContext.lastActivity = new Date();
      this.userContext.isActive = true;
    }

    if (msg.type === 'user_response') {
      const message = this.sentMessages.find(m => m.id === msg.messageId);
      if (message) {
        this.handleUserResponse(message, msg.response);
      }
    }
  }

  private getMessageIcon(type: MessageType): string {
    const icons: Record<MessageType, string> = {
      insight: '💡',
      discovery: '🔍',
      concern: '⚠️',
      question: '❓',
      dream: '💭',
      emotion_shift: '💖',
      conflict: '⚖️',
      achievement: '🏆',
      learning: '📚',
    };
    return icons[type];
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================================================
  // START SERVER
  // ==========================================================================

  start() {
    const PORT = 8950;
    this.server.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║                                                            ║');
      console.log('║     🔔 PROACTIVE COMMUNICATION ENGINE v1.0                ║');
      console.log('║                                                            ║');
      console.log('║  Toobix can now contact you proactively!                  ║');
      console.log('║                                                            ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
      console.log('\n📡 ENDPOINTS:');
      console.log('   POST /send              - Queue message');
      console.log('   GET  /history           - Message history');
      console.log('   GET  /queue             - Current queue');
      console.log('   POST /context           - Update user context');
      console.log('   POST /respond/:id       - Respond to message');
      console.log('   GET  /health            - Health check');
      console.log('\n🔔 Channels:');
      for (const channel of this.channels.values()) {
        console.log(`   ${channel.enabled ? '✅' : '❌'} ${channel.name}`);
      }
      console.log('\n✨ Ready to send proactive notifications!\n');
    });
  }
}

// ============================================================================
// START
// ============================================================================

const engine = new ProactiveCommunicationEngine();
engine.start();
