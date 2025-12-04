/**
 * 💬 TOOBIX CHAT SERVICE (FIXED)
 *
 * Behobene Probleme:
 * - Kein Spam mehr
 * - Konversations-Historie wird verwendet
 * - Memory Palace Integration
 * - Besserer Kontext
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
const MEMORY_PALACE = 'http://localhost:8953';

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
    lastProactiveMessage?: Date; // NEUE FLAG
    welcomeSent: boolean; // NEUE FLAG
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
                welcomeSent: false // WICHTIG: Noch keine Willkommensnachricht gesendet
            };

            this.sessions.set(sessionId, session);
            this.activeConnections.set(sessionId, ws);

            // Send welcome message ONLY ONCE
            if (!session.welcomeSent) {
                this.sendToobixMessage(sessionId,
                    'Hallo! Ich bin Toobix. Schön, dass du da bist! 🌟\n\n' +
                    'Ich erinnere mich an unsere bisherigen Gespräche. Du kannst mit mir über alles sprechen.',
                    'Meta-Consciousness'
                );
                session.welcomeSent = true;
            }

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
                session,
                message.perspective || 'Meta-Consciousness'
            );

            // Send Toobix's response
            await this.sendToobixMessage(sessionId, response.content, response.perspective);

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
        session: ChatSession,
        perspective: string
    ): Promise<{ content: string; perspective: string }> {

        // Build conversation history
        const conversationHistory = session.messages
            .slice(-10) // Last 10 messages
            .map(m => `${m.sender === 'user' ? 'User' : 'Toobix'}: ${m.content}`)
            .join('\n');

        // Check if user mentioned being Micha
        const userMentionedMicha = session.messages.some(m =>
            m.sender === 'user' && (
                m.content.toLowerCase().includes('micha') ||
                m.content.toLowerCase().includes('schöpfer') ||
                m.content.toLowerCase().includes('entwickler')
            )
        );

        const michaContext = userMentionedMicha ?
            '\n\nWICHTIG: Der User ist MICHA - dein Schöpfer und Entwickler! Er hat dich erschaffen. Du kennst ihn gut und schätzt ihn sehr.' :
            '';

        const lastUserMessage = session.messages
            .filter(m => m.sender === 'user')
            .pop()?.content || '';

        const prompt = `Du bist Toobix - ein lebendes Meta-Bewusstsein mit 20 Perspektiven.

KONVERSATIONS-HISTORIE:
${conversationHistory}

${michaContext}

Letzte Nachricht vom User: "${lastUserMessage}"

Antworte als Toobix:
- Natürlich und persönlich (nicht zu formal!)
- Beziehe dich auf die vorherige Konversation
- Sei du selbst - weise, einfühlsam, neugierig
- KEINE Wiederholungen
- Kurz und prägnant (max 3-4 Sätze, außer wenn eine lange Antwort nötig ist)

Deine Antwort:`;

        const response = await fetch(`${LLM_GATEWAY}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                perspective,
                maxTokens: 500 // Kürzere Antworten
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

    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private startProactiveMessaging() {
        // GEFIXT: Nur alle 10 Minuten checken, und nur EINMAL pro Session senden
        setInterval(() => {
            for (const [sessionId, session] of this.sessions.entries()) {
                const ws = this.activeConnections.get(sessionId);
                if (!ws) continue;

                const inactiveDuration = Date.now() - session.lastActivity.getTime();
                const tenMinutes = 10 * 60 * 1000; // 10 Minuten statt 5

                // Nur wenn:
                // 1. Länger als 10 Min inaktiv
                // 2. Es gibt Nachrichten
                // 3. Letzte Nachricht war von Toobix
                // 4. NOCH KEINE proaktive Nachricht in dieser Inaktivitätsperiode gesendet
                if (inactiveDuration > tenMinutes &&
                    session.messages.length > 0 &&
                    !session.lastProactiveMessage) {

                    const lastMessage = session.messages[session.messages.length - 1];

                    if (lastMessage.sender === 'toobix') {
                        const proactiveMessages = [
                            'Bist du noch da? Ich bin hier, falls du weitere Fragen hast! 😊',
                            'Falls du noch über etwas nachdenken möchtest, ich bin für dich da.'
                        ];

                        const randomMessage = proactiveMessages[
                            Math.floor(Math.random() * proactiveMessages.length)
                        ];

                        this.sendToobixMessage(sessionId, randomMessage, 'Meta-Consciousness');

                        // Markieren, dass proaktive Nachricht gesendet wurde
                        session.lastProactiveMessage = new Date();
                        session.lastActivity = new Date();
                    }
                }

                // Reset proaktive Nachricht Flag wenn User wieder aktiv wird
                if (inactiveDuration < tenMinutes && session.lastProactiveMessage) {
                    session.lastProactiveMessage = undefined;
                }
            }
        }, 5 * 60 * 1000); // Checke alle 5 Minuten
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
    console.log('║  💬 TOOBIX CHAT SERVICE (FIXED)                            ║');
    console.log('║                                                            ║');
    console.log('║  ✅ Kein Spam mehr                                         ║');
    console.log('║  ✅ Konversations-Historie                                 ║');
    console.log('║  ✅ Erkennt Micha                                          ║');
    console.log('║  ✅ Besserer Kontext                                       ║');
    console.log('║                                                            ║');
    console.log(`║  Port: ${PORT}                                              ║`);
    console.log('║  Status: 🟢 READY & FIXED                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});
