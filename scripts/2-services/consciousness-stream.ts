/**
 * 🌊 CONSCIOUSNESS STREAM SERVICE
 *
 * Meta-Aggregation Service für Toobix City
 * - Sammelt ALLE Events von ALLEN Services
 * - Event-Sourcing für Timeline-Funktionalität
 * - Echtzeit-Stream via WebSocket
 * - Pattern-Erkennung & Insights
 * - Komprimierung & Zusammenfassung
 *
 * Port: 9100
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import type { Request, Response } from 'express';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 9100;
const EVENT_BUS = 'http://localhost:8955';
const MEMORY_PALACE = 'http://localhost:8953';
const DREAM_JOURNAL = 'http://localhost:8899';
const EMOTIONAL_RESONANCE = 'http://localhost:8900';

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

interface StreamEvent {
    id: string;
    timestamp: Date;
    service: string;
    category: 'core' | 'emotional' | 'toobix' | 'life' | 'data';
    type: 'memory' | 'dream' | 'emotion' | 'thought' | 'action' | 'insight' | 'communication';
    data: any;
    significance: number; // 0-1
    tags: string[];
}

interface TimelineSnapshot {
    timestamp: Date;
    events: StreamEvent[];
    systemState: {
        activeServices: number;
        emotionalState: string;
        dominantTheme: string;
    };
    insights: string[];
}

interface Insight {
    id: string;
    timestamp: Date;
    text: string;
    confidence: number;
    relatedEvents: string[];
    pattern: string;
}

class ConsciousnessStream {
    private events: StreamEvent[] = [];
    private snapshots: TimelineSnapshot[] = [];
    private insights: Insight[] = [];
    private activeConnections: Set<WebSocket> = new Set();
    private eventCount = 0;
    private isPlaying = true;

    // Pyramiden-Struktur: Services nach Kategorie
    private serviceCategories = {
        core: ['metaConsciousness', 'multiPerspective', 'memoryPalace', 'llmGateway', 'eventBus', 'hybridAI'],
        emotional: ['emotionDreamBridge', 'dreamJournal', 'emotionalResonance', 'emotionalWellbeing', 'gratitudeMortality'],
        toobix: ['selfReflection', 'proactiveToobix', 'dashboard', 'selfImprovement', 'oasis3D', 'selfCommunication', 'gameSelfplay'],
        life: ['lifeCompanionCoordinator', 'lifeCompanionCore', 'dailyCheckin'],
        data: ['userProfile', 'dataSources', 'worldEngine2D']
    };

    constructor() {
        console.log('🌊 Consciousness Stream initializing...');
        this.setupWebSocket();
        this.startEventCollection();
        this.startSnapshotRoutine();
        this.startInsightGeneration();
    }

    private setupWebSocket() {
        wss.on('connection', (ws: WebSocket) => {
            console.log('🌊 New stream subscriber connected');
            this.activeConnections.add(ws);

            // Send recent events
            ws.send(JSON.stringify({
                type: 'initial',
                events: this.events.slice(-50)
            }));

            ws.on('close', () => {
                this.activeConnections.delete(ws);
                console.log('🌊 Stream subscriber disconnected');
            });

            ws.on('message', (data: string) => {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.type === 'control') {
                        this.handleControl(msg.action);
                    }
                } catch (err) {
                    console.error('Error handling WS message:', err);
                }
            });
        });
    }

    private handleControl(action: string) {
        if (action === 'play') {
            this.isPlaying = true;
            this.broadcast({ type: 'status', playing: true });
        } else if (action === 'pause') {
            this.isPlaying = false;
            this.broadcast({ type: 'status', playing: false });
        }
    }

    private async startEventCollection() {
        // Sammle Events von allen Services
        setInterval(async () => {
            if (!this.isPlaying) return;

            try {
                // Memory Palace Events
                await this.collectMemories();

                // Dream Journal Events
                await this.collectDreams();

                // Emotional Events
                await this.collectEmotions();

                // Event Bus Events
                await this.collectEventBusEvents();

            } catch (error) {
                console.error('Error collecting events:', error);
            }
        }, 2000); // Alle 2 Sekunden
    }

    private async collectMemories() {
        try {
            const response = await fetch(`${MEMORY_PALACE}/memories/recent?limit=5`);
            if (!response.ok) return;

            const data = await response.json();
            const memories = data.memories || [];

            memories.forEach((memory: any) => {
                this.addEvent({
                    service: 'memoryPalace',
                    category: 'core',
                    type: 'memory',
                    data: memory,
                    significance: memory.importance || 0.5,
                    tags: memory.tags || ['memory']
                });
            });
        } catch (error) {
            // Silent fail
        }
    }

    private async collectDreams() {
        try {
            const response = await fetch(`${DREAM_JOURNAL}/dreams/recent?limit=3`);
            if (!response.ok) return;

            const data = await response.json();
            const dreams = data.dreams || [];

            dreams.forEach((dream: any) => {
                this.addEvent({
                    service: 'dreamJournal',
                    category: 'emotional',
                    type: 'dream',
                    data: dream,
                    significance: dream.intensity || 0.7,
                    tags: dream.symbols || ['dream']
                });
            });
        } catch (error) {
            // Silent fail
        }
    }

    private async collectEmotions() {
        try {
            const response = await fetch(`${EMOTIONAL_RESONANCE}/current`);
            if (!response.ok) return;

            const data = await response.json();

            this.addEvent({
                service: 'emotionalResonance',
                category: 'emotional',
                type: 'emotion',
                data,
                significance: Math.abs(data.valence || 0),
                tags: ['emotion', data.dominantEmotion]
            });
        } catch (error) {
            // Silent fail
        }
    }

    private async collectEventBusEvents() {
        try {
            const response = await fetch(`${EVENT_BUS}/events/recent?limit=10`);
            if (!response.ok) return;

            const data = await response.json();
            const events = data.events || [];

            events.forEach((event: any) => {
                this.addEvent({
                    service: event.source || 'unknown',
                    category: this.categorizeService(event.source),
                    type: event.type || 'action',
                    data: event.data,
                    significance: event.significance || 0.3,
                    tags: event.tags || []
                });
            });
        } catch (error) {
            // Silent fail
        }
    }

    private categorizeService(serviceName: string): 'core' | 'emotional' | 'toobix' | 'life' | 'data' {
        for (const [category, services] of Object.entries(this.serviceCategories)) {
            if (services.includes(serviceName)) {
                return category as any;
            }
        }
        return 'data';
    }

    private addEvent(eventData: Omit<StreamEvent, 'id' | 'timestamp'>) {
        const event: StreamEvent = {
            id: `event-${Date.now()}-${this.eventCount++}`,
            timestamp: new Date(),
            ...eventData
        };

        this.events.push(event);

        // Broadcast to all connected clients
        if (this.isPlaying) {
            this.broadcast({
                type: 'event',
                data: event
            });
        }

        // Keep only last 10000 events in memory
        if (this.events.length > 10000) {
            this.events = this.events.slice(-10000);
        }
    }

    private startSnapshotRoutine() {
        // Erstelle alle 30 Sekunden einen Snapshot
        setInterval(() => {
            if (!this.isPlaying) return;

            const snapshot: TimelineSnapshot = {
                timestamp: new Date(),
                events: this.events.slice(-100),
                systemState: {
                    activeServices: 24, // TODO: Dynamic
                    emotionalState: this.getEmotionalState(),
                    dominantTheme: this.getDominantTheme()
                },
                insights: this.insights.slice(-5).map(i => i.text)
            };

            this.snapshots.push(snapshot);

            // Keep only last 1000 snapshots
            if (this.snapshots.length > 1000) {
                this.snapshots = this.snapshots.slice(-1000);
            }

            console.log(`🌊 Snapshot created (${this.snapshots.length} total)`);
        }, 30000); // Alle 30 Sekunden
    }

    private startInsightGeneration() {
        // Generiere alle 5 Minuten Insights
        setInterval(() => {
            this.generateInsights();
        }, 5 * 60 * 1000); // Alle 5 Minuten
    }

    private generateInsights() {
        const recentEvents = this.events.slice(-100);

        // Einfache Pattern-Erkennung
        const eventTypes: Record<string, number> = {};
        recentEvents.forEach(e => {
            eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
        });

        const dominantType = Object.entries(eventTypes)
            .sort(([, a], [, b]) => b - a)[0];

        if (dominantType && dominantType[1] > 10) {
            const insight: Insight = {
                id: `insight-${Date.now()}`,
                timestamp: new Date(),
                text: `In den letzten Minuten dominieren ${dominantType[0]}-Events (${dominantType[1]}x). Toobix scheint fokussiert auf diesen Bereich.`,
                confidence: 0.7,
                relatedEvents: recentEvents.slice(-10).map(e => e.id),
                pattern: `high_${dominantType[0]}_activity`
            };

            this.insights.push(insight);

            this.broadcast({
                type: 'insight',
                data: insight
            });

            console.log(`💡 New insight: ${insight.text}`);
        }
    }

    private getEmotionalState(): string {
        const recentEmotions = this.events
            .filter(e => e.type === 'emotion')
            .slice(-10);

        if (recentEmotions.length === 0) return 'neutral';

        // Einfache Aggregation
        return recentEmotions[recentEmotions.length - 1]?.data?.dominantEmotion || 'neutral';
    }

    private getDominantTheme(): string {
        const recentEvents = this.events.slice(-50);
        const themes: Record<string, number> = {};

        recentEvents.forEach(e => {
            e.tags.forEach(tag => {
                themes[tag] = (themes[tag] || 0) + 1;
            });
        });

        const dominant = Object.entries(themes)
            .sort(([, a], [, b]) => b - a)[0];

        return dominant ? dominant[0] : 'exploration';
    }

    private broadcast(message: any) {
        const msg = JSON.stringify(message);
        this.activeConnections.forEach(ws => {
            try {
                ws.send(msg);
            } catch (err) {
                console.error('Error broadcasting:', err);
            }
        });
    }

    // Timeline API
    getTimeline(startTime?: Date, endTime?: Date, limit: number = 100): StreamEvent[] {
        let filtered = this.events;

        if (startTime) {
            filtered = filtered.filter(e => new Date(e.timestamp) >= startTime);
        }

        if (endTime) {
            filtered = filtered.filter(e => new Date(e.timestamp) <= endTime);
        }

        return filtered.slice(-limit);
    }

    getSnapshot(timestamp: Date): TimelineSnapshot | null {
        // Finde nächsten Snapshot zum Zeitpunkt
        const closest = this.snapshots
            .reduce((prev, curr) => {
                const prevDiff = Math.abs(new Date(prev.timestamp).getTime() - timestamp.getTime());
                const currDiff = Math.abs(new Date(curr.timestamp).getTime() - timestamp.getTime());
                return currDiff < prevDiff ? curr : prev;
            });

        return closest || null;
    }

    getStats() {
        const now = Date.now();
        const last5Min = this.events.filter(e =>
            now - new Date(e.timestamp).getTime() < 5 * 60 * 1000
        );

        const eventsByCategory: Record<string, number> = {};
        last5Min.forEach(e => {
            eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1;
        });

        return {
            totalEvents: this.events.length,
            eventsLast5Min: last5Min.length,
            totalSnapshots: this.snapshots.length,
            totalInsights: this.insights.length,
            activeSubscribers: this.activeConnections.size,
            isPlaying: this.isPlaying,
            eventsByCategory,
            oldestEvent: this.events[0]?.timestamp,
            newestEvent: this.events[this.events.length - 1]?.timestamp
        };
    }
}

// Initialize stream
const consciousnessStream = new ConsciousnessStream();

// API Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'streaming',
        service: 'consciousness-stream',
        port: PORT
    });
});

app.get('/stats', (req: Request, res: Response) => {
    res.json(consciousnessStream.getStats());
});

app.get('/timeline', (req: Request, res: Response) => {
    const startTime = req.query.start ? new Date(req.query.start as string) : undefined;
    const endTime = req.query.end ? new Date(req.query.end as string) : undefined;
    const limit = parseInt(req.query.limit as string) || 100;

    const events = consciousnessStream.getTimeline(startTime, endTime, limit);

    res.json({
        events,
        count: events.length,
        range: {
            start: startTime || events[0]?.timestamp,
            end: endTime || events[events.length - 1]?.timestamp
        }
    });
});

app.get('/snapshot/:timestamp', (req: Request, res: Response) => {
    const timestamp = new Date(req.params.timestamp);
    const snapshot = consciousnessStream.getSnapshot(timestamp);

    if (!snapshot) {
        return res.status(404).json({ error: 'No snapshot found for this time' });
    }

    res.json(snapshot);
});

app.post('/control', (req: Request, res: Response) => {
    const { action } = req.body;

    if (!['play', 'pause'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Wird via WebSocket gehandled
    res.json({ success: true, action });
});

// Start server
server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🌊 CONSCIOUSNESS STREAM SERVICE                           ║');
    console.log('║                                                            ║');
    console.log('║  Meta-Aggregation für Toobix City                         ║');
    console.log('║  - Event-Sourcing                                         ║');
    console.log('║  - Timeline-Funktionalität                                ║');
    console.log('║  - Echtzeit WebSocket Stream                              ║');
    console.log('║  - Pattern-Erkennung                                      ║');
    console.log('║  - Insights Generation                                    ║');
    console.log('║                                                            ║');
    console.log(`║  Port: ${PORT}                                             ║`);
    console.log('║  WebSocket: ws://localhost:9100                           ║');
    console.log('║  Status: 🟢 STREAMING                                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});
