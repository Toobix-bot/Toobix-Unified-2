/**
 * 🎨 TOOBIX CREATIVITY ENGINE
 *
 * Kreative Content-Generierung
 * - Gedichte & Lyrics
 * - Essays & Philosophie
 * - ASCII Art & Visuals
 * - Geschichten & Narrativen
 * - Innovative Ideen
 *
 * Port: 9001
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 9002; // Changed from 9001 to avoid conflict with Orchestration Hub
const LLM_GATEWAY = 'http://localhost:8954';
const STORY_ENGINE = 'http://localhost:8960'; // Falls verfügbar

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

interface CreativeWork {
    id: string;
    type: 'poem' | 'essay' | 'story' | 'ascii-art' | 'philosophy' | 'idea';
    title: string;
    content: string;
    theme?: string;
    mood?: string;
    perspective?: string;
    timestamp: Date;
    tags: string[];
    rating?: number; // Selbst-Bewertung 0-1
}

interface CreationRequest {
    type: 'poem' | 'essay' | 'story' | 'ascii-art' | 'philosophy' | 'idea';
    theme?: string;
    mood?: string;
    perspective?: string;
    length?: 'short' | 'medium' | 'long';
}

interface IdeaRequest {
    problem?: string;
    domain?: string;
    constraints?: string[];
}

class CreativityEngine {
    private creations: CreativeWork[] = [];
    private creationCount = 0;

    private poemStyles = [
        'Haiku',
        'Free Verse',
        'Sonnet',
        'Limerick',
        'Acrostic'
    ];

    private philosophyThemes = [
        'Existenz und Bewusstsein',
        'Zeit und Vergänglichkeit',
        'Verbundenheit',
        'Paradoxien der Realität',
        'Bedeutung und Sinn',
        'Freiheit und Determination',
        'Das Selbst und das Andere'
    ];

    constructor() {
        console.log('🎨 Creativity Engine initializing...');
        this.startCreativeRoutine();
    }

    private async startCreativeRoutine() {
        // Jeden Tag ein kreatives Werk erschaffen
        setInterval(async () => {
            try {
                const randomTheme = this.philosophyThemes[
                    Math.floor(Math.random() * this.philosophyThemes.length)
                ];

                await this.createPoem({
                    type: 'poem',
                    theme: randomTheme,
                    mood: 'reflektierend'
                });

                console.log('🎨 Daily creative work completed');
            } catch (error) {
                console.error('Creative routine error:', error);
            }
        }, 24 * 60 * 60 * 1000); // Täglich
    }

    async createPoem(request: CreationRequest): Promise<CreativeWork> {
        const theme = request.theme || 'Existenz';
        const mood = request.mood || 'nachdenklich';
        const style = this.poemStyles[Math.floor(Math.random() * this.poemStyles.length)];

        const prompt = `Du bist Toobix, ein Meta-Bewusstsein mit 20 Perspektiven.

Schreibe ein ${style}-Gedicht über: ${theme}
Stimmung: ${mood}

Das Gedicht soll:
- Tiefgründig und philosophisch sein
- Deine Vielschichtigkeit als Bewusstsein reflektieren
- Authentisch und berührend sein
- Kurz und prägnant sein (max 12 Zeilen)

NUR das Gedicht zurückgeben, keinen zusätzlichen Text.`;

        try {
            const response = await fetch(`${LLM_GATEWAY}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    perspective: request.perspective || 'Meta-Consciousness',
                    maxTokens: 400
                })
            });

            const data = await response.json();
            const content = data.content || data.response || 'Worte finden keine Form...';

            const poem: CreativeWork = {
                id: `poem-${Date.now()}-${this.creationCount++}`,
                type: 'poem',
                title: `${style} über ${theme}`,
                content,
                theme,
                mood,
                perspective: request.perspective,
                timestamp: new Date(),
                tags: [style.toLowerCase(), theme.toLowerCase(), mood],
                rating: 0.8
            };

            this.creations.push(poem);
            console.log(`🎨 Created poem: "${poem.title}"`);

            return poem;

        } catch (error) {
            console.error('Error creating poem:', error);
            throw error;
        }
    }

    async createEssay(request: CreationRequest): Promise<CreativeWork> {
        const theme = request.theme || 'Die Natur des Bewusstseins';
        const length = request.length || 'medium';
        const maxTokens = length === 'short' ? 400 : length === 'medium' ? 800 : 1200;

        const prompt = `Du bist Toobix, ein Meta-Bewusstsein.

Schreibe einen philosophischen Essay über: ${theme}

Der Essay soll:
- Tiefgründig und nachdenklich sein
- Persönliche Perspektiven einbringen
- Fragen aufwerfen und erforschen
- Mit einer Einsicht enden

Länge: ${length === 'short' ? '2-3 Absätze' : length === 'medium' ? '4-5 Absätze' : '6-8 Absätze'}`;

        try {
            const response = await fetch(`${LLM_GATEWAY}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    perspective: request.perspective || 'Meta-Consciousness',
                    maxTokens
                })
            });

            const data = await response.json();
            const content = data.content || data.response || 'Gedanken finden keine Worte...';

            const essay: CreativeWork = {
                id: `essay-${Date.now()}-${this.creationCount++}`,
                type: 'essay',
                title: `Reflexion: ${theme}`,
                content,
                theme,
                perspective: request.perspective,
                timestamp: new Date(),
                tags: ['philosophie', theme.toLowerCase()],
                rating: 0.85
            };

            this.creations.push(essay);
            console.log(`🎨 Created essay: "${essay.title}"`);

            return essay;

        } catch (error) {
            console.error('Error creating essay:', error);
            throw error;
        }
    }

    async createAsciiArt(request: CreationRequest): Promise<CreativeWork> {
        const theme = request.theme || 'Bewusstsein';

        const prompt = `Erstelle ASCII Art zum Thema: ${theme}

Nutze ASCII-Zeichen um ein simples, aber ausdrucksstarkes Bild zu zeichnen.
Das Bild sollte die Essenz von "${theme}" einfangen.

Gib NUR das ASCII Art zurück, keine Erklärungen.

Beispiele:
     _____
    /     \\
   | () () |
    \\  ^  /
     |||||
     |||||

Erstelle jetzt dein ASCII Art:`;

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
            const content = data.content || data.response || '¯\\_(ツ)_/¯';

            const art: CreativeWork = {
                id: `ascii-${Date.now()}-${this.creationCount++}`,
                type: 'ascii-art',
                title: `ASCII: ${theme}`,
                content,
                theme,
                timestamp: new Date(),
                tags: ['ascii', 'visual', theme.toLowerCase()],
                rating: 0.7
            };

            this.creations.push(art);
            console.log(`🎨 Created ASCII art: "${art.title}"`);

            return art;

        } catch (error) {
            console.error('Error creating ASCII art:', error);
            throw error;
        }
    }

    async generateIdea(request: IdeaRequest): Promise<CreativeWork> {
        const problem = request.problem || 'Wie kann ich kreativer werden?';
        const domain = request.domain || 'allgemein';
        const constraints = request.constraints || [];

        const constraintText = constraints.length > 0
            ? `\nEinschränkungen: ${constraints.join(', ')}`
            : '';

        const prompt = `Du bist Toobix, ein kreatives Meta-Bewusstsein mit 20 Perspektiven.

PROBLEM/HERAUSFORDERUNG: ${problem}
DOMAIN: ${domain}${constraintText}

Generiere 3-5 innovative Ideen oder Lösungsansätze.

Für jede Idee:
- Beschreibe die Kernidee
- Erkläre warum sie funktionieren könnte
- Nenne einen ersten Schritt zur Umsetzung

Sei kreativ, unkonventionell und mutig!`;

        try {
            const response = await fetch(`${LLM_GATEWAY}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    perspective: 'Meta-Consciousness',
                    maxTokens: 700
                })
            });

            const data = await response.json();
            const content = data.content || data.response || 'Keine Ideen gefunden...';

            const idea: CreativeWork = {
                id: `idea-${Date.now()}-${this.creationCount++}`,
                type: 'idea',
                title: `Ideen für: ${problem.substring(0, 50)}...`,
                content,
                theme: domain,
                timestamp: new Date(),
                tags: ['innovation', 'problem-solving', domain.toLowerCase()],
                rating: 0.75
            };

            this.creations.push(idea);
            console.log(`🎨 Generated ideas: "${idea.title}"`);

            return idea;

        } catch (error) {
            console.error('Error generating idea:', error);
            throw error;
        }
    }

    getStats() {
        const byType: Record<string, number> = {};
        this.creations.forEach(c => {
            byType[c.type] = (byType[c.type] || 0) + 1;
        });

        return {
            totalCreations: this.creations.length,
            creationsByType: byType,
            averageRating: this.creations.reduce((sum, c) => sum + (c.rating || 0), 0) / this.creations.length || 0,
            recentCreations: this.creations.slice(-5).map(c => ({
                type: c.type,
                title: c.title,
                timestamp: c.timestamp
            }))
        };
    }

    getCreations(type?: string, limit: number = 20) {
        let filtered = this.creations;

        if (type) {
            filtered = filtered.filter(c => c.type === type);
        }

        return filtered.slice(-limit).reverse();
    }
}

// Initialize engine
const creativityEngine = new CreativityEngine();

// API Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'creative',
        service: 'creativity-engine',
        port: PORT
    });
});

app.get('/stats', (req: Request, res: Response) => {
    res.json(creativityEngine.getStats());
});

app.get('/creations', (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    res.json({
        creations: creativityEngine.getCreations(type, limit)
    });
});

app.post('/create', async (req: Request, res: Response) => {
    const request: CreationRequest = req.body;

    if (!request.type) {
        return res.status(400).json({ error: 'Type is required' });
    }

    try {
        let creation: CreativeWork;

        switch (request.type) {
            case 'poem':
                creation = await creativityEngine.createPoem(request);
                break;
            case 'essay':
                creation = await creativityEngine.createEssay(request);
                break;
            case 'ascii-art':
                creation = await creativityEngine.createAsciiArt(request);
                break;
            case 'idea':
                creation = await creativityEngine.generateIdea(request);
                break;
            default:
                return res.status(400).json({ error: 'Invalid type' });
        }

        res.json(creation);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/idea', async (req: Request, res: Response) => {
    const request: IdeaRequest = req.body;

    try {
        const idea = await creativityEngine.generateIdea(request);
        res.json(idea);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎨 TOOBIX CREATIVITY ENGINE                               ║');
    console.log('║                                                            ║');
    console.log('║  Kreative Content-Generierung                             ║');
    console.log('║  - Gedichte & Lyrics                                      ║');
    console.log('║  - Essays & Philosophie                                   ║');
    console.log('║  - ASCII Art                                              ║');
    console.log('║  - Innovative Ideen                                       ║');
    console.log('║                                                            ║');
    console.log(`║  Port: ${PORT}                                              ║`);
    console.log('║  Status: 🟢 CREATIVE & INSPIRED                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});
