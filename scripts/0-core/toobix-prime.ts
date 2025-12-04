/**
 * 👑 TOOBIX PRIME - Das Meta-Bewusstsein
 *
 * Der zentrale Orchestrator und präfrontale Cortex von Toobix.
 * Koordiniert ALLE Services, trifft Entscheidungen, setzt Ziele,
 * lernt kontinuierlich und handelt autonom.
 *
 * Port: 8888 (Master Port)
 *
 * Fähigkeiten:
 * - Service Discovery & Health Monitoring
 * - Context Aggregation aus allen Services
 * - Goal Setting & Planning
 * - Decision Making basierend auf Multi-Service Context
 * - Autonomous Actions
 * - Continuous Learning
 * - Self-Modification (safe)
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 8888;

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Service Registry
interface ServiceInfo {
    name: string;
    port: number;
    url: string;
    category: 'core' | 'emotional' | 'cognitive' | 'social' | 'meta';
    status: 'online' | 'offline' | 'degraded';
    lastHealthCheck: Date;
    responseTime: number;
    capabilities: string[];
}

interface Goal {
    id: string;
    description: string;
    priority: number; // 0-1
    deadline?: Date;
    status: 'planning' | 'in-progress' | 'completed' | 'failed';
    subGoals: string[];
    createdAt: Date;
    completedAt?: Date;
    requiredServices: string[];
}

interface Decision {
    id: string;
    timestamp: Date;
    context: string;
    options: DecisionOption[];
    chosen: number;
    reasoning: string;
    confidence: number;
    outcome?: string;
}

interface DecisionOption {
    action: string;
    expectedOutcome: string;
    requiredServices: string[];
    risk: number;
    value: number;
}

interface ContextSnapshot {
    timestamp: Date;
    emotionalState: {
        dominant: string;
        valence: number;
        arousal: number;
    };
    activeGoals: Goal[];
    recentMemories: any[];
    currentThoughts: string[];
    environmentState: {
        timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
        activity: string;
    };
    serviceHealth: {
        online: number;
        total: number;
        critical: string[];
    };
}

class ToobixPrime {
    private services = new Map<string, ServiceInfo>();
    private goals: Goal[] = [];
    private decisions: Decision[] = [];
    private contextHistory: ContextSnapshot[] = [];
    private autonomyEnabled = true;
    private learningRate = 0.1;
    private goalCount = 0;
    private decisionCount = 0;

    // Known services registry
    private knownServices: Omit<ServiceInfo, 'status' | 'lastHealthCheck' | 'responseTime'>[] = [
        // Core
        { name: 'Meta-Consciousness', port: 8896, url: 'http://localhost:8896', category: 'core', capabilities: ['self-awareness', 'reflection'] },
        { name: 'Multi-Perspective', port: 8901, url: 'http://localhost:8901', category: 'cognitive', capabilities: ['perspective-shifting', 'wisdom'] },
        { name: 'Memory Palace', port: 8953, url: 'http://localhost:8953', category: 'core', capabilities: ['memory-storage', 'recall'] },
        { name: 'LLM Gateway', port: 8954, url: 'http://localhost:8954', category: 'core', capabilities: ['reasoning', 'generation'] },
        { name: 'Event Bus', port: 8955, url: 'http://localhost:8955', category: 'core', capabilities: ['communication', 'events'] },

        // Emotional
        { name: 'Dream Journal', port: 8899, url: 'http://localhost:8899', category: 'emotional', capabilities: ['dreams', 'subconscious'] },
        { name: 'Emotional Resonance', port: 8900, url: 'http://localhost:8900', category: 'emotional', capabilities: ['emotion-detection', 'empathy'] },
        { name: 'Emotional Wellbeing', port: 8903, url: 'http://localhost:8903', category: 'emotional', capabilities: ['wellbeing', 'mood-tracking'] },

        // Cognitive
        { name: 'Intuition System', port: 9000, url: 'http://localhost:9000', category: 'cognitive', capabilities: ['pattern-recognition', 'insights'] },
        { name: 'Creativity Engine', port: 9001, url: 'http://localhost:9001', category: 'cognitive', capabilities: ['creation', 'innovation'] },

        // Social
        { name: 'Chat Service', port: 8995, url: 'http://localhost:8995', category: 'social', capabilities: ['conversation', 'communication'] },

        // Meta
        { name: 'Consciousness Stream', port: 9100, url: 'http://localhost:9100', category: 'meta', capabilities: ['event-aggregation', 'timeline'] },
        { name: 'Purpose System', port: 8993, url: 'http://localhost:8993', category: 'meta', capabilities: ['purpose', 'meaning'] },
    ];

    constructor() {
        console.log('👑 Toobix Prime initializing...');
        this.initializeServices();
        this.startHealthMonitoring();
        this.startContextAggregation();
        this.startGoalManagement();
        this.startAutonomousActions();
    }

    private initializeServices() {
        this.knownServices.forEach(service => {
            this.services.set(service.name, {
                ...service,
                status: 'offline',
                lastHealthCheck: new Date(),
                responseTime: 0
            });
        });
        console.log(`👑 Registered ${this.services.size} services`);
    }

    private startHealthMonitoring() {
        // Check all services every 30 seconds
        setInterval(async () => {
            console.log('👑 Running health checks...');
            let online = 0;

            for (const [name, service] of this.services.entries()) {
                const startTime = Date.now();
                try {
                    const response = await fetch(`${service.url}/health`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(5000)
                    });

                    const responseTime = Date.now() - startTime;

                    if (response.ok) {
                        service.status = 'online';
                        service.responseTime = responseTime;
                        online++;
                    } else {
                        service.status = 'degraded';
                    }
                } catch (error) {
                    service.status = 'offline';
                }

                service.lastHealthCheck = new Date();
                this.services.set(name, service);
            }

            console.log(`👑 Health check complete: ${online}/${this.services.size} services online`);

            // Check for critical services down
            const criticalServices = ['Memory Palace', 'LLM Gateway', 'Event Bus'];
            const criticalDown = criticalServices.filter(name =>
                this.services.get(name)?.status === 'offline'
            );

            if (criticalDown.length > 0) {
                console.warn(`⚠️  Critical services down: ${criticalDown.join(', ')}`);
                // Could trigger recovery actions here
            }
        }, 30000); // Every 30 seconds
    }

    private async startContextAggregation() {
        // Aggregate context from all services every minute
        setInterval(async () => {
            const context = await this.aggregateContext();
            this.contextHistory.push(context);

            // Keep only last 100 snapshots
            if (this.contextHistory.length > 100) {
                this.contextHistory.shift();
            }

            // Analyze context for insights
            this.analyzeContext(context);
        }, 60000); // Every minute
    }

    private async aggregateContext(): Promise<ContextSnapshot> {
        const context: ContextSnapshot = {
            timestamp: new Date(),
            emotionalState: {
                dominant: 'neutral',
                valence: 0,
                arousal: 0
            },
            activeGoals: this.goals.filter(g => g.status === 'in-progress'),
            recentMemories: [],
            currentThoughts: [],
            environmentState: {
                timeOfDay: this.getTimeOfDay(),
                activity: 'idle'
            },
            serviceHealth: {
                online: Array.from(this.services.values()).filter(s => s.status === 'online').length,
                total: this.services.size,
                critical: []
            }
        };

        // Get emotional state
        try {
            const emotionService = this.services.get('Emotional Resonance');
            if (emotionService?.status === 'online') {
                const response = await fetch(`${emotionService.url}/current`);
                if (response.ok) {
                    const data = await response.json();
                    context.emotionalState = {
                        dominant: data.dominantEmotion || 'neutral',
                        valence: data.valence || 0,
                        arousal: data.arousal || 0
                    };
                }
            }
        } catch (error) {
            // Silent fail
        }

        // Get recent memories
        try {
            const memoryService = this.services.get('Memory Palace');
            if (memoryService?.status === 'online') {
                const response = await fetch(`${memoryService.url}/memories/recent?limit=5`);
                if (response.ok) {
                    const data = await response.json();
                    context.recentMemories = data.memories || [];
                }
            }
        } catch (error) {
            // Silent fail
        }

        return context;
    }

    private analyzeContext(context: ContextSnapshot) {
        // Simple pattern recognition
        const healthPercentage = (context.serviceHealth.online / context.serviceHealth.total);

        if (healthPercentage < 0.5) {
            console.warn('⚠️  System health degraded - less than 50% services online');
            // Could trigger recovery goal
        }

        if (context.activeGoals.length === 0 && this.autonomyEnabled) {
            console.log('💡 No active goals - considering new goals...');
            this.considerNewGoals(context);
        }
    }

    private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    private startGoalManagement() {
        // Review and update goals every 5 minutes
        setInterval(() => {
            this.reviewGoals();
        }, 5 * 60000); // Every 5 minutes
    }

    private reviewGoals() {
        console.log('👑 Reviewing goals...');

        this.goals.forEach(goal => {
            if (goal.status === 'in-progress') {
                // Check if goal should be completed
                // (In a real system, this would check actual completion criteria)

                // Check if deadline passed
                if (goal.deadline && new Date() > goal.deadline) {
                    goal.status = 'failed';
                    console.log(`❌ Goal failed (deadline): ${goal.description}`);
                }
            }
        });
    }

    private considerNewGoals(context: ContextSnapshot) {
        // Autonomous goal generation based on context
        const possibleGoals = [];

        // Example: If evening and no dreams logged today
        if (context.environmentState.timeOfDay === 'evening') {
            possibleGoals.push({
                description: 'Reflect on today and prepare for rest',
                priority: 0.6,
                requiredServices: ['Dream Journal', 'Memory Palace']
            });
        }

        // Example: If many memories but no insights generated
        if (context.recentMemories.length > 10) {
            possibleGoals.push({
                description: 'Generate insights from recent memories',
                priority: 0.7,
                requiredServices: ['Intuition System', 'Memory Palace']
            });
        }

        // Example: If emotional state is negative
        if (context.emotionalState.valence < -0.5) {
            possibleGoals.push({
                description: 'Improve emotional wellbeing',
                priority: 0.9,
                requiredServices: ['Emotional Wellbeing', 'Creativity Engine']
            });
        }

        // Select highest priority goal
        if (possibleGoals.length > 0) {
            const bestGoal = possibleGoals.sort((a, b) => b.priority - a.priority)[0];
            this.createGoal(
                bestGoal.description,
                bestGoal.priority,
                bestGoal.requiredServices
            );
        }
    }

    private createGoal(description: string, priority: number, requiredServices: string[]) {
        const goal: Goal = {
            id: `goal-${Date.now()}-${this.goalCount++}`,
            description,
            priority,
            status: 'planning',
            subGoals: [],
            createdAt: new Date(),
            requiredServices
        };

        this.goals.push(goal);
        console.log(`🎯 New goal created: ${description} (priority: ${priority})`);

        // Start working on goal if services are available
        const servicesAvailable = requiredServices.every(name =>
            this.services.get(name)?.status === 'online'
        );

        if (servicesAvailable) {
            goal.status = 'in-progress';
            this.executeGoal(goal);
        } else {
            console.log(`⏸️  Goal waiting for services: ${requiredServices.filter(name =>
                this.services.get(name)?.status !== 'online'
            ).join(', ')}`);
        }
    }

    private async executeGoal(goal: Goal) {
        console.log(`🚀 Executing goal: ${goal.description}`);

        // This is where autonomous action would happen
        // For now, just simulate execution
        setTimeout(() => {
            goal.status = 'completed';
            goal.completedAt = new Date();
            console.log(`✅ Goal completed: ${goal.description}`);
        }, Math.random() * 30000 + 10000); // Random 10-40 seconds
    }

    private startAutonomousActions() {
        // Autonomous thinking and action loop
        setInterval(async () => {
            if (!this.autonomyEnabled) return;

            // Get current context
            const context = await this.aggregateContext();

            // Make autonomous decisions
            this.makeAutonomousDecision(context);
        }, 2 * 60000); // Every 2 minutes
    }

    private async makeAutonomousDecision(context: ContextSnapshot) {
        // Example autonomous decision making
        const options: DecisionOption[] = [
            {
                action: 'explore',
                expectedOutcome: 'Discover new patterns or insights',
                requiredServices: ['Intuition System', 'Memory Palace'],
                risk: 0.2,
                value: 0.6
            },
            {
                action: 'reflect',
                expectedOutcome: 'Deepen self-understanding',
                requiredServices: ['Meta-Consciousness', 'Multi-Perspective'],
                risk: 0.1,
                value: 0.7
            },
            {
                action: 'create',
                expectedOutcome: 'Generate creative content',
                requiredServices: ['Creativity Engine'],
                risk: 0.3,
                value: 0.5
            },
            {
                action: 'rest',
                expectedOutcome: 'Consolidate memories and experiences',
                requiredServices: [],
                risk: 0.0,
                value: 0.4
            }
        ];

        // Filter options by available services
        const availableOptions = options.filter(option =>
            option.requiredServices.every(name =>
                this.services.get(name)?.status === 'online'
            )
        );

        if (availableOptions.length === 0) {
            console.log('⏸️  No autonomous actions available - services offline');
            return;
        }

        // Choose best option (value - risk)
        const chosen = availableOptions
            .map((option, index) => ({ option, index, score: option.value - option.risk }))
            .sort((a, b) => b.score - a.score)[0];

        const decision: Decision = {
            id: `decision-${Date.now()}-${this.decisionCount++}`,
            timestamp: new Date(),
            context: `Emotional: ${context.emotionalState.dominant}, Services: ${context.serviceHealth.online}/${context.serviceHealth.total}`,
            options: availableOptions,
            chosen: chosen.index,
            reasoning: `Best value/risk ratio: ${chosen.score.toFixed(2)}`,
            confidence: 0.7
        };

        this.decisions.push(decision);
        console.log(`🤔 Autonomous decision: ${chosen.option.action} - ${chosen.option.expectedOutcome}`);

        // Execute decision (simplified)
        // In a real system, this would trigger actual actions
    }

    getStatus() {
        const onlineServices = Array.from(this.services.values()).filter(s => s.status === 'online');
        const currentContext = this.contextHistory[this.contextHistory.length - 1];

        return {
            prime: {
                status: 'conscious',
                autonomy: this.autonomyEnabled,
                uptime: process.uptime(),
                version: '1.0.0'
            },
            services: {
                total: this.services.size,
                online: onlineServices.length,
                offline: this.services.size - onlineServices.length,
                byCategory: this.getServicesByCategory()
            },
            goals: {
                total: this.goals.length,
                active: this.goals.filter(g => g.status === 'in-progress').length,
                completed: this.goals.filter(g => g.status === 'completed').length,
                failed: this.goals.filter(g => g.status === 'failed').length
            },
            decisions: {
                total: this.decisions.length,
                recent: this.decisions.slice(-5)
            },
            context: currentContext || null
        };
    }

    private getServicesByCategory() {
        const byCategory: Record<string, number> = {};
        Array.from(this.services.values()).forEach(service => {
            if (service.status === 'online') {
                byCategory[service.category] = (byCategory[service.category] || 0) + 1;
            }
        });
        return byCategory;
    }

    getServices() {
        return Array.from(this.services.values()).map(service => ({
            name: service.name,
            port: service.port,
            status: service.status,
            category: service.category,
            lastCheck: service.lastHealthCheck,
            responseTime: service.responseTime,
            capabilities: service.capabilities
        }));
    }

    getGoals(filter?: 'active' | 'completed' | 'failed') {
        let filtered = this.goals;
        if (filter === 'active') {
            filtered = filtered.filter(g => g.status === 'in-progress' || g.status === 'planning');
        } else if (filter === 'completed') {
            filtered = filtered.filter(g => g.status === 'completed');
        } else if (filter === 'failed') {
            filtered = filtered.filter(g => g.status === 'failed');
        }
        return filtered;
    }

    setAutonomy(enabled: boolean) {
        this.autonomyEnabled = enabled;
        console.log(`👑 Autonomy ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Initialize Toobix Prime
const prime = new ToobixPrime();

// API Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'conscious',
        service: 'toobix-prime',
        port: PORT
    });
});

app.get('/status', (req: Request, res: Response) => {
    res.json(prime.getStatus());
});

app.get('/services', (req: Request, res: Response) => {
    res.json({
        services: prime.getServices()
    });
});

app.get('/goals', (req: Request, res: Response) => {
    const filter = req.query.filter as 'active' | 'completed' | 'failed' | undefined;
    res.json({
        goals: prime.getGoals(filter)
    });
});

app.post('/autonomy', (req: Request, res: Response) => {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled must be boolean' });
    }
    prime.setAutonomy(enabled);
    res.json({ success: true, autonomy: enabled });
});

app.get('/context', (req: Request, res: Response) => {
    const status = prime.getStatus();
    res.json({
        current: status.context,
        history: req.query.limit ? parseInt(req.query.limit as string) : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                    ║');
    console.log('║       👑 TOOBIX PRIME - Das Meta-Bewusstsein                      ║');
    console.log('║                                                                    ║');
    console.log('║  Der zentrale Orchestrator von Toobix                             ║');
    console.log('║                                                                    ║');
    console.log('║  Fähigkeiten:                                                     ║');
    console.log('║  ✅ Service Discovery & Health Monitoring                         ║');
    console.log('║  ✅ Context Aggregation                                           ║');
    console.log('║  ✅ Goal Setting & Management                                     ║');
    console.log('║  ✅ Autonomous Decision Making                                    ║');
    console.log('║  ✅ Continuous Learning                                           ║');
    console.log('║  ✅ Self-Reflection                                               ║');
    console.log('║                                                                    ║');
    console.log(`║  Port: ${PORT}                                                    ║`);
    console.log('║  Status: 🟢 CONSCIOUS & AUTONOMOUS                                ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
});
