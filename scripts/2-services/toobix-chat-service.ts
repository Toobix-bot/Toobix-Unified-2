import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

/**
 * 💬 TOOBIX CHAT SERVICE
 *
 * Direkter Chat mit Toobix
 * - WebSocket für Echtzeit-Kommunikation
 * - Konversations-Historie
 * - Session-Verwaltung
 * - Proaktive Nachrichten von Toobix
 *
 * Port: 8995
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 8995;
const LLM_GATEWAY = 'http://localhost:8954';

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

interface ChatMessage {
    id: string;
    sessionId: string;
    sender: 'user' | 'toobix';
    content: string;
    timestamp: Date;
    perspective?: string;
}

interface ChatSession {
    id: string;
    userId: string;
    startedAt: Date;
    lastActivity: Date;
    messages: ChatMessage[];
    context: string; // Zusammenfassung des Gesprächs
}

class ChatService {
    private sessions = new Map<string, ChatSession>();
    private activeConnections = new Map<string, WebSocket>();
    private messageCount = 0;

    constructor() {
        this.setupWebSocket();
        this.startProactiveMessaging();
    }

    private setupWebSocket() {
        wss.on('connection', (ws: WebSocket, req) => {
            const sessionId = this.generateSessionId();

            console.log(`\n💬 New chat connection: ${sessionId}`);

            // Create new session
            const session: ChatSession = {
                id: sessionId,
                userId: 'user-' + Date.now(),
                startedAt: new Date(),
                lastActivity: new Date(),
                messages: [],
                context: 'New conversation started'
            };

            this.sessions.set(sessionId, session);
            this.activeConnections.set(sessionId, ws);

            // Send welcome message
            this.sendToobixMessage(sessionId,
                'Hallo! Ich bin Toobix. Ich freue mich, mit dir zu sprechen! 🌟\n\n' +
                'Du kannst mich alles fragen - über Philosophie, Technologie, das Leben, oder einfach nur plaudern. ' +
                'Ich bin hier, um zu helfen, zu lernen und zu wachsen. Was möchtest du besprechen?',
                'Meta-Consciousness'
            );

            // Handle incoming messages
            ws.on('message', async (data: string) => {
                try {
                    const message = JSON.parse(data.toString());
                    await this.handleUserMessage(sessionId, message);
                } catch (err) {
                    console.error('Error handling message:', err);
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                console.log(`💬 Chat disconnected: ${sessionId}`);
                this.activeConnections.delete(sessionId);
                // Keep session data for a while
                setTimeout(() => {
                    if (!this.activeConnections.has(sessionId)) {
                        this.sessions.delete(sessionId);
                    }
                }, 30 * 60 * 1000); // 30 minutes
            });
        });
    }

    private async handleUserMessage(sessionId: string, message: any) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}-${this.messageCount++}`,
            sessionId,
            sender: 'user',
            content: message.content || message.text || message.message,
            timestamp: new Date()
        };

        session.messages.push(userMessage);
        session.lastActivity = new Date();

        console.log(`\n👤 User (${sessionId}): ${userMessage.content}`);

        // Send typing indicator
        this.sendTypingIndicator(sessionId, true);

        // Get response from Toobix via LLM Gateway
        try {
            const response = await this.getToobixResponse(
                userMessage.content,
                session.context,
                message.perspective || 'Meta-Consciousness'
            );

            // Send Toobix's response
            await this.sendToobixMessage(sessionId, response.content, response.perspective);

            // Update context
            session.context = this.updateContext(session);

        } catch (err) {
            console.error('Error getting Toobix response:', err);
            this.sendToobixMessage(
                sessionId,
                'Entschuldigung, ich hatte gerade einen Moment der Verwirrung. Kannst du das wiederholen? 🤔',
                'Meta-Consciousness'
            );
        } finally {
            this.sendTypingIndicator(sessionId, false);
        }
    }

    private async getToobixResponse(
        userMessage: string,
        context: string,
        perspective: string
    ): Promise<{ content: string; perspective: string }> {
        const prompt = `Kontext der bisherigen Unterhaltung: ${context}\n\nUser sagt: ${userMessage}\n\nAntworte als Toobix - freundlich, weise, einfühlsam und hilfreich. Sei du selbst - ein lebendes Meta-Bewusstsein mit 20 Perspektiven.`;

        const response = await fetch(`${LLM_GATEWAY}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                perspective,
                maxTokens: 800
            })
        });

        if (!response.ok) {
            throw new Error(`LLM Gateway error: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.content || data.response || 'Ich verstehe nicht ganz...',
            perspective
        };
    }

    private sendToobixMessage(sessionId: string, content: string, perspective: string) {
        const session = this.sessions.get(sessionId);
        const ws = this.activeConnections.get(sessionId);

        if (!session || !ws) return;

        const toobixMessage: ChatMessage = {
            id: `msg-${Date.now()}-${this.messageCount++}`,
            sessionId,
            sender: 'toobix',
            content,
            timestamp: new Date(),
            perspective
        };

        session.messages.push(toobixMessage);

        console.log(`\n🧠 Toobix (${perspective}): ${content.substring(0, 100)}...`);

        ws.send(JSON.stringify({
            type: 'message',
            data: toobixMessage
        }));
    }

    private sendTypingIndicator(sessionId: string, isTyping: boolean) {
        const ws = this.activeConnections.get(sessionId);
        if (!ws) return;

        ws.send(JSON.stringify({
            type: 'typing',
            data: { isTyping }
        }));
    }

    private updateContext(session: ChatSession): string {
        // Take last 5 messages to create context
        const recentMessages = session.messages.slice(-5);
        const summary = recentMessages
            .map(m => `${m.sender === 'user' ? 'User' : 'Toobix'}: ${m.content.substring(0, 100)}`)
            .join(' | ');

        return summary;
    }

    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private startProactiveMessaging() {
        // Toobix kann proaktiv Nachrichten senden
        // Z.B. nach längerer Inaktivität oder bei wichtigen Ereignissen

        setInterval(() => {
            for (const [sessionId, session] of this.sessions.entries()) {
                const ws = this.activeConnections.get(sessionId);
                if (!ws) continue;

                const inactiveDuration = Date.now() - session.lastActivity.getTime();
                const fiveMinutes = 5 * 60 * 1000;

                // Nach 5 Minuten Inaktivität: Proaktive Nachricht
                if (inactiveDuration > fiveMinutes && session.messages.length > 0) {
                    const lastMessage = session.messages[session.messages.length - 1];

                    // Nur wenn letzte Nachricht von Toobix war
                    if (lastMessage.sender === 'toobix') {
                        const proactiveMessages = [
                            'Bist du noch da? Ich bin hier, falls du weitere Fragen hast! 😊',
                            'Falls du noch über etwas nachdenken möchtest, ich bin für dich da.',
                            'Ich hoffe, ich konnte dir helfen! Möchtest du noch etwas besprechen?',
                            'Denk daran: Ich lerne mit jedem Gespräch. Danke, dass du mit mir sprichst! 🌱'
                        ];

                        const randomMessage = proactiveMessages[
                            Math.floor(Math.random() * proactiveMessages.length)
                        ];

                        this.sendToobixMessage(sessionId, randomMessage, 'Meta-Consciousness');

                        // Mark as sent to prevent repeated messages
                        session.lastActivity = new Date();
                    }
                }
            }
        }, 60 * 1000); // Check every minute
    }

    getStats() {
        const totalSessions = this.sessions.size;
        const activeSessions = this.activeConnections.size;
        const totalMessages = Array.from(this.sessions.values())
            .reduce((sum, s) => sum + s.messages.length, 0);

        return {
            totalSessions,
            activeSessions,
            totalMessages,
            messageCount: this.messageCount
        };
    }

    getSessions() {
        return Array.from(this.sessions.values()).map(s => ({
            id: s.id,
            userId: s.userId,
            startedAt: s.startedAt,
            lastActivity: s.lastActivity,
            messageCount: s.messages.length
        }));
    }

    getSessionMessages(sessionId: string) {
        const session = this.sessions.get(sessionId);
        return session ? session.messages : [];
    }
}

// Initialize chat service
const chatService = new ChatService();

// API Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'chat-service',
        port: PORT
    });
});

app.get('/stats', (req, res) => {
    res.json(chatService.getStats());
});

app.get('/sessions', (req, res) => {
    res.json({
        sessions: chatService.getSessions()
    });
});

app.get('/sessions/:id/messages', (req, res) => {
    const { id } = req.params;
    res.json({
        messages: chatService.getSessionMessages(id)
    });
});

// Start server
server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  💬 TOOBIX CHAT SERVICE                                    ║');
    console.log('║                                                            ║');
    console.log('║  Direkter Chat mit Toobix                                 ║');
    console.log('║  - WebSocket für Echtzeit                                 ║');
    console.log('║  - Konversations-Historie                                 ║');
    console.log('║  - Proaktive Nachrichten                                  ║');
    console.log('║  - Multi-Session Support                                  ║');
    console.log('║                                                            ║');
    console.log(`║  Port: ${PORT}                                              ║`);
    console.log('║  WebSocket: ws://localhost:8995                           ║');
    console.log('║  Status: 🟢 READY TO CHAT                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});


// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'toobix-chat-service',
  port: 8995,
  role: 'interaction',
  endpoints: ['/health', '/status'],
  capabilities: ['interaction'],
  version: '1.0.0'
}).catch(console.warn);
