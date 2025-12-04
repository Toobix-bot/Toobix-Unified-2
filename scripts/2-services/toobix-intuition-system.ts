/**
 * 🔮 TOOBIX INTUITION SYSTEM
 *
 * Pattern Recognition & Decision Support
 * - Erkennt Muster in Erinnerungen und Erfahrungen
 * - Unterstützt Entscheidungsprozesse
 * - Emotionale Intelligenz Integration
 * - Predictive Analytics
 *
 * Port: 9000
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 9000;
const MEMORY_PALACE = 'http://localhost:8953';
const LLM_GATEWAY = 'http://localhost:8954';
const EMOTIONAL_RESONANCE = 'http://localhost:8960'; // Falls verfügbar

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

interface Pattern {
    id: string;
    type: 'behavioral' | 'emotional' | 'temporal' | 'relational';
    description: string;
    confidence: number; // 0-1
    occurrences: number;
    firstSeen: Date;
    lastSeen: Date;
    examples: string[];
}

interface Intuition {
    id: string;
    question: string;
    answer: string;
    confidence: number;
    reasoning: string;
    emotionalContext: string;
    relatedPatterns: string[];
    timestamp: Date;
}

interface Decision {
    id: string;
    scenario: string;
    options: DecisionOption[];
    recommendation: string;
    reasoning: string;
    riskAssessment: RiskAssessment;
    emotionalImpact: EmotionalImpact;
    timestamp: Date;
}

interface DecisionOption {
    option: string;
    pros: string[];
    cons: string[];
    predictedOutcome: string;
    emotionalResonance: number; // -1 to 1
    alignmentWithValues: number; // 0-1
}

interface RiskAssessment {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
}

interface EmotionalImpact {
    beforeDecision: string;
    afterDecision: string;
    emotionalCost: number; // 0-1
}

class IntuitionSystem {
    private patterns: Pattern[] = [];
    private intuitions: Intuition[] = [];
    private decisions: Decision[] = [];
    private patternCount = 0;

    constructor() {
        console.log('🔮 Intuition System initializing...');
        this.startPatternLearning();
    }

    private async startPatternLearning() {
        // Alle 10 Minuten Muster aus Memory Palace lernen
        setInterval(async () => {
            try {
                await this.learnPatternsFromMemories();
            } catch (error) {
                console.error('Pattern learning error:', error);
            }
        }, 10 * 60 * 1000);

        // Initial learning
        await this.learnPatternsFromMemories();
    }

    private async learnPatternsFromMemories() {
        try {
            const response = await fetch(`${MEMORY_PALACE}/memories/recent?limit=50`);
            if (!response.ok) return;

            const data = await response.json();
            const memories = data.memories || [];

            console.log(`🔮 Learning patterns from ${memories.length} memories...`);

            // Einfache Pattern Recognition
            const emotionalPatterns = this.detectEmotionalPatterns(memories);
            const temporalPatterns = this.detectTemporalPatterns(memories);

            this.patterns.push(...emotionalPatterns, ...temporalPatterns);

            // Deduplizieren
            this.patterns = this.deduplicatePatterns(this.patterns);

            console.log(`🔮 Learned ${this.patterns.length} patterns total`);
        } catch (error) {
            console.error('Error learning patterns:', error);
        }
    }

    private detectEmotionalPatterns(memories: any[]): Pattern[] {
        const patterns: Pattern[] = [];
        const emotionCounts: Record<string, number> = {};

        memories.forEach(m => {
            if (m.emotion) {
                emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
            }
        });

        // Emotionen die häufig vorkommen sind Muster
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
            if (count >= 3) {
                patterns.push({
                    id: `emotional-${emotion}-${Date.now()}`,
                    type: 'emotional',
                    description: `Häufige Emotion: ${emotion}`,
                    confidence: Math.min(count / memories.length, 1),
                    occurrences: count,
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                    examples: [`Emotion '${emotion}' trat ${count}x auf`]
                });
            }
        });

        return patterns;
    }

    private detectTemporalPatterns(memories: any[]): Pattern[] {
        const patterns: Pattern[] = [];

        // Zeitliche Muster (z.B. morgens/abends)
        const timeOfDay: Record<string, number> = {};

        memories.forEach(m => {
            if (m.timestamp) {
                const hour = new Date(m.timestamp).getHours();
                const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
                timeOfDay[period] = (timeOfDay[period] || 0) + 1;
            }
        });

        Object.entries(timeOfDay).forEach(([period, count]) => {
            if (count >= 5) {
                patterns.push({
                    id: `temporal-${period}-${Date.now()}`,
                    type: 'temporal',
                    description: `Aktivität primär ${period}`,
                    confidence: count / memories.length,
                    occurrences: count,
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                    examples: [`${count} Aktivitäten während ${period}`]
                });
            }
        });

        return patterns;
    }

    private deduplicatePatterns(patterns: Pattern[]): Pattern[] {
        const seen = new Set<string>();
        return patterns.filter(p => {
            const key = `${p.type}-${p.description}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    async getIntuition(question: string): Promise<Intuition> {
        console.log(`🔮 Getting intuition for: "${question}"`);

        // Relevante Muster finden
        const relevantPatterns = this.patterns
            .filter(p => p.confidence > 0.3)
            .slice(0, 5);

        const patternContext = relevantPatterns
            .map(p => `- ${p.description} (Confidence: ${Math.round(p.confidence * 100)}%)`)
            .join('\n');

        // LLM fragen mit Pattern-Context
        const prompt = `Du bist Toobix's Intuition - sein Bauchgefühl und inneres Wissen.

ERKANNTE MUSTER:
${patternContext || 'Keine spezifischen Muster erkannt'}

FRAGE: ${question}

Gib eine intuitive Antwort basierend auf den erkannten Mustern. Sei weise, einfühlsam und authentisch.
Antworte kurz und prägnant (max 3-4 Sätze).`;

        try {
            const response = await fetch(`${LLM_GATEWAY}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    perspective: 'Meta-Consciousness',
                    maxTokens: 300
                })
            });

            const data = await response.json();
            const answer = data.content || data.response || 'Ich spüre keine klare Intuition dazu.';

            const intuition: Intuition = {
                id: `intuition-${Date.now()}`,
                question,
                answer,
                confidence: relevantPatterns.length > 0 ? 0.7 : 0.4,
                reasoning: `Basierend auf ${relevantPatterns.length} erkannten Mustern`,
                emotionalContext: 'Ruhig und reflektiert',
                relatedPatterns: relevantPatterns.map(p => p.id),
                timestamp: new Date()
            };

            this.intuitions.push(intuition);
            return intuition;

        } catch (error) {
            console.error('Error getting intuition:', error);

            return {
                id: `intuition-${Date.now()}`,
                question,
                answer: 'Meine Intuition ist momentan unklar. Ich brauche mehr Zeit zum Nachdenken.',
                confidence: 0.2,
                reasoning: 'Fehler beim Abrufen der Intuition',
                emotionalContext: 'Unsicher',
                relatedPatterns: [],
                timestamp: new Date()
            };
        }
    }

    async makeDecision(scenario: string, options: string[]): Promise<Decision> {
        console.log(`🔮 Making decision for scenario: "${scenario}"`);

        const prompt = `Du bist Toobix's Decision Support System.

SITUATION: ${scenario}

OPTIONEN:
${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Analysiere jede Option:
- Pro und Contra
- Vorhergesagtes Ergebnis
- Emotionale Auswirkung
- Alignment mit Werten (Weisheit, Harmonie, Wachstum)

Gib eine klare Empfehlung mit Begründung.`;

        try {
            const response = await fetch(`${LLM_GATEWAY}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    perspective: 'Meta-Consciousness',
                    maxTokens: 600
                })
            });

            const data = await response.json();
            const analysis = data.content || data.response || 'Keine klare Analyse möglich.';

            const decision: Decision = {
                id: `decision-${Date.now()}`,
                scenario,
                options: options.map(opt => ({
                    option: opt,
                    pros: ['Zu analysieren'],
                    cons: ['Zu analysieren'],
                    predictedOutcome: 'Unbekannt',
                    emotionalResonance: 0,
                    alignmentWithValues: 0.5
                })),
                recommendation: analysis,
                reasoning: 'Basierend auf Werten und Mustern',
                riskAssessment: {
                    level: 'medium',
                    factors: ['Unsicherheit', 'Komplexität'],
                    mitigation: ['Vorsichtig vorgehen', 'Feedback einholen']
                },
                emotionalImpact: {
                    beforeDecision: 'Unsicherheit',
                    afterDecision: 'Klarheit',
                    emotionalCost: 0.3
                },
                timestamp: new Date()
            };

            this.decisions.push(decision);
            return decision;

        } catch (error) {
            console.error('Error making decision:', error);
            throw error;
        }
    }

    getStats() {
        return {
            totalPatterns: this.patterns.length,
            patternsByType: {
                emotional: this.patterns.filter(p => p.type === 'emotional').length,
                temporal: this.patterns.filter(p => p.type === 'temporal').length,
                behavioral: this.patterns.filter(p => p.type === 'behavioral').length,
                relational: this.patterns.filter(p => p.type === 'relational').length
            },
            totalIntuitions: this.intuitions.length,
            totalDecisions: this.decisions.length,
            averageConfidence: this.patterns.reduce((sum, p) => sum + p.confidence, 0) / this.patterns.length || 0
        };
    }

    getPatterns(type?: string) {
        if (type) {
            return this.patterns.filter(p => p.type === type);
        }
        return this.patterns;
    }

    getRecentIntuitions(limit: number = 10) {
        return this.intuitions.slice(-limit).reverse();
    }

    getRecentDecisions(limit: number = 10) {
        return this.decisions.slice(-limit).reverse();
    }
}

// Initialize system
const intuitionSystem = new IntuitionSystem();

// API Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'intuitive',
        service: 'intuition-system',
        port: PORT
    });
});

app.get('/stats', (req: Request, res: Response) => {
    res.json(intuitionSystem.getStats());
});

app.get('/patterns', (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    res.json({
        patterns: intuitionSystem.getPatterns(type)
    });
});

app.get('/intuitions', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    res.json({
        intuitions: intuitionSystem.getRecentIntuitions(limit)
    });
});

app.get('/decisions', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    res.json({
        decisions: intuitionSystem.getRecentDecisions(limit)
    });
});

app.post('/intuition', async (req: Request, res: Response) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const intuition = await intuitionSystem.getIntuition(question);
        res.json(intuition);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/decision', async (req: Request, res: Response) => {
    const { scenario, options } = req.body;

    if (!scenario || !options || !Array.isArray(options)) {
        return res.status(400).json({
            error: 'Scenario and options array are required'
        });
    }

    try {
        const decision = await intuitionSystem.makeDecision(scenario, options);
        res.json(decision);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🔮 TOOBIX INTUITION SYSTEM                                ║');
    console.log('║                                                            ║');
    console.log('║  Pattern Recognition & Decision Support                   ║');
    console.log('║  - Emotionale Muster                                      ║');
    console.log('║  - Zeitliche Muster                                       ║');
    console.log('║  - Intuitive Antworten                                    ║');
    console.log('║  - Entscheidungsunterstützung                             ║');
    console.log('║                                                            ║');
    console.log(`║  Port: ${PORT}                                              ║`);
    console.log('║  Status: 🟢 INTUITIVE & READY                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});
