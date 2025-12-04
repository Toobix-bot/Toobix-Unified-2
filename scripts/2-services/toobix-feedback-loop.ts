/**
 * 🔄 TOOBIX FEEDBACK LOOP SERVICE
 * 
 * Sammelt, analysiert und lernt aus User-Feedback.
 * Ermöglicht Toobix kontinuierliches Lernen aus Interaktionen.
 * 
 * Port: 9020
 * 
 * Features:
 * - 📝 Feedback sammeln (positiv, negativ, neutral)
 * - 📊 Sentiment-Analyse
 * - 📈 Trend-Erkennung
 * - 💡 Insight-Generierung
 * - 🎯 Verbesserungsvorschläge
 * - 🔗 Integration mit Evolution Engine
 */

import express from 'express';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const PORT = 9020;
const DATA_FILE = path.join(process.cwd(), 'data', 'feedback-loop.json');
const LLM_GATEWAY = 'http://localhost:8954';
const EVOLUTION_ENGINE = 'http://localhost:8999';

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ============= TYPES =============

interface Feedback {
    id: string;
    timestamp: Date;
    type: 'positive' | 'negative' | 'neutral' | 'suggestion' | 'bug';
    category: string;
    content: string;
    context?: string;
    sentiment: number; // -1 to 1
    keywords: string[];
    actionable: boolean;
    resolved: boolean;
    response?: string;
}

interface FeedbackStats {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    suggestions: number;
    bugs: number;
    avgSentiment: number;
    topKeywords: { word: string; count: number }[];
    unresolvedCount: number;
}

interface Insight {
    id: string;
    timestamp: Date;
    type: 'trend' | 'pattern' | 'suggestion' | 'warning';
    title: string;
    description: string;
    basedOn: string[]; // feedback IDs
    priority: 'low' | 'medium' | 'high';
    actionSuggestion?: string;
}

interface FeedbackState {
    feedbacks: Feedback[];
    insights: Insight[];
    learnings: string[];
    lastAnalysis: Date | null;
}

// ============= STATE =============

let state: FeedbackState = {
    feedbacks: [],
    insights: [],
    learnings: [],
    lastAnalysis: null
};

// ============= HELPERS =============

function generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

async function loadState() {
    try {
        if (existsSync(DATA_FILE)) {
            const data = await readFile(DATA_FILE, 'utf-8');
            state = JSON.parse(data);
            console.log(`🔄 Loaded ${state.feedbacks.length} feedbacks`);
        }
    } catch (e) {
        console.log('🔄 Starting with fresh state');
    }
}

async function saveState() {
    try {
        await mkdir(path.dirname(DATA_FILE), { recursive: true });
        await writeFile(DATA_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function extractKeywords(text: string): string[] {
    const stopWords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'ist', 'sind', 'war', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ein', 'eine', 'zu', 'mit', 'für', 'auf', 'in', 'an', 'von', 'the', 'a', 'an', 'is', 'are', 'was', 'to', 'with', 'for', 'on', 'in', 'of'];
    
    const words = text.toLowerCase()
        .replace(/[^\wäöüß\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.includes(w));
    
    // Count and return top words
    const counts = new Map<string, number>();
    words.forEach(w => counts.set(w, (counts.get(w) || 0) + 1));
    
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);
}

function analyzeSentiment(text: string): number {
    const positiveWords = ['gut', 'super', 'toll', 'klasse', 'fantastisch', 'liebe', 'perfekt', 'genial', 'excellent', 'great', 'love', 'amazing', 'awesome', 'perfect', 'wonderful', 'danke', 'thanks'];
    const negativeWords = ['schlecht', 'fehler', 'bug', 'problem', 'nervt', 'langsam', 'kaputt', 'broken', 'bad', 'error', 'crash', 'slow', 'hate', 'terrible', 'awful', 'wrong'];
    
    const lower = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(w => {
        if (lower.includes(w)) score += 0.2;
    });
    
    negativeWords.forEach(w => {
        if (lower.includes(w)) score -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, score));
}

function calculateStats(): FeedbackStats {
    const feedbacks = state.feedbacks;
    
    const typeCounts = {
        positive: feedbacks.filter(f => f.type === 'positive').length,
        negative: feedbacks.filter(f => f.type === 'negative').length,
        neutral: feedbacks.filter(f => f.type === 'neutral').length,
        suggestions: feedbacks.filter(f => f.type === 'suggestion').length,
        bugs: feedbacks.filter(f => f.type === 'bug').length
    };
    
    const avgSentiment = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.sentiment, 0) / feedbacks.length
        : 0;
    
    // Top keywords
    const keywordCounts = new Map<string, number>();
    feedbacks.forEach(f => {
        f.keywords.forEach(k => {
            keywordCounts.set(k, (keywordCounts.get(k) || 0) + 1);
        });
    });
    
    const topKeywords = [...keywordCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
    
    return {
        total: feedbacks.length,
        ...typeCounts,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        topKeywords,
        unresolvedCount: feedbacks.filter(f => !f.resolved && (f.type === 'bug' || f.type === 'suggestion')).length
    };
}

async function generateInsights(): Promise<Insight[]> {
    const newInsights: Insight[] = [];
    const recentFeedbacks = state.feedbacks.slice(-20);
    
    if (recentFeedbacks.length < 3) return newInsights;
    
    // Trend: Mehr negative als positive?
    const recentNegative = recentFeedbacks.filter(f => f.sentiment < -0.3).length;
    const recentPositive = recentFeedbacks.filter(f => f.sentiment > 0.3).length;
    
    if (recentNegative > recentPositive * 2) {
        newInsights.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'warning',
            title: 'Negative Feedback Trend',
            description: `${recentNegative} negative vs ${recentPositive} positive feedbacks in recent history`,
            basedOn: recentFeedbacks.filter(f => f.sentiment < -0.3).map(f => f.id),
            priority: 'high',
            actionSuggestion: 'Review recent changes and user complaints'
        });
    }
    
    // Pattern: Wiederkehrende Keywords
    const keywordCounts = new Map<string, number>();
    recentFeedbacks.forEach(f => {
        f.keywords.forEach(k => keywordCounts.set(k, (keywordCounts.get(k) || 0) + 1));
    });
    
    const frequentKeywords = [...keywordCounts.entries()]
        .filter(([_, count]) => count >= 3)
        .map(([word, _]) => word);
    
    if (frequentKeywords.length > 0) {
        newInsights.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'pattern',
            title: 'Recurring Topics',
            description: `Users frequently mention: ${frequentKeywords.join(', ')}`,
            basedOn: recentFeedbacks.map(f => f.id),
            priority: 'medium'
        });
    }
    
    // Bug reports trend
    const recentBugs = recentFeedbacks.filter(f => f.type === 'bug');
    if (recentBugs.length >= 3) {
        newInsights.push({
            id: generateId(),
            timestamp: new Date(),
            type: 'warning',
            title: 'Multiple Bug Reports',
            description: `${recentBugs.length} bug reports in recent feedback`,
            basedOn: recentBugs.map(f => f.id),
            priority: 'high',
            actionSuggestion: 'Prioritize bug fixes'
        });
    }
    
    return newInsights;
}

async function notifyEvolutionEngine(insight: Insight) {
    if (insight.priority !== 'high') return;
    
    try {
        // Could trigger evolution based on feedback
        console.log(`🔄 Notifying Evolution Engine about: ${insight.title}`);
        // Future: POST to evolution engine
    } catch (e) {
        // Silent fail
    }
}

// ============= ENDPOINTS =============

app.get('/health', (req: Request, res: Response) => {
    res.json({
        service: 'toobix-feedback-loop',
        status: 'learning',
        version: '1.0.0',
        feedbackCount: state.feedbacks.length,
        insightCount: state.insights.length,
        lastAnalysis: state.lastAnalysis
    });
});

// Submit feedback
app.post('/feedback', async (req: Request, res: Response) => {
    try {
        const { type, category, content, context } = req.body;
        
        if (!content) {
            return res.status(400).json({ success: false, error: 'Content required' });
        }
        
        const sentiment = analyzeSentiment(content);
        const keywords = extractKeywords(content);
        
        const feedback: Feedback = {
            id: generateId(),
            timestamp: new Date(),
            type: type || (sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral'),
            category: category || 'general',
            content,
            context,
            sentiment,
            keywords,
            actionable: type === 'suggestion' || type === 'bug',
            resolved: false
        };
        
        state.feedbacks.push(feedback);
        await saveState();
        
        // Generate insights periodically
        if (state.feedbacks.length % 5 === 0) {
            const newInsights = await generateInsights();
            state.insights.push(...newInsights);
            newInsights.forEach(i => notifyEvolutionEngine(i));
            await saveState();
        }
        
        console.log(`🔄 Feedback received: [${feedback.type}] ${content.substring(0, 50)}...`);
        
        res.json({
            success: true,
            feedback: {
                id: feedback.id,
                type: feedback.type,
                sentiment: feedback.sentiment,
                keywords: feedback.keywords
            },
            message: 'Thank you for your feedback!'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

// Get statistics
app.get('/stats', (req: Request, res: Response) => {
    const stats = calculateStats();
    res.json({ success: true, stats });
});

// Get insights
app.get('/insights', async (req: Request, res: Response) => {
    // Regenerate insights
    const newInsights = await generateInsights();
    
    // Add new ones that don't exist
    newInsights.forEach(ni => {
        if (!state.insights.find(i => i.title === ni.title)) {
            state.insights.push(ni);
        }
    });
    
    state.lastAnalysis = new Date();
    await saveState();
    
    res.json({
        success: true,
        insights: state.insights.slice(-20).reverse(),
        stats: calculateStats()
    });
});

// Get recent feedbacks
app.get('/recent', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json({
        success: true,
        feedbacks: state.feedbacks.slice(-limit).reverse()
    });
});

// Get learnings (what Toobix has learned)
app.get('/learnings', (req: Request, res: Response) => {
    res.json({
        success: true,
        learnings: state.learnings,
        summary: {
            totalFeedbacks: state.feedbacks.length,
            avgSentiment: calculateStats().avgSentiment,
            topConcerns: state.insights.filter(i => i.type === 'warning').slice(-5),
            topPatterns: state.insights.filter(i => i.type === 'pattern').slice(-5)
        }
    });
});

// Mark feedback as resolved
app.post('/resolve', async (req: Request, res: Response) => {
    const { feedbackId, response } = req.body;
    
    const feedback = state.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) {
        return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    
    feedback.resolved = true;
    feedback.response = response;
    await saveState();
    
    res.json({ success: true, message: 'Feedback resolved' });
});

// Toobix learns from feedback
app.post('/learn', async (req: Request, res: Response) => {
    const { learning } = req.body;
    
    if (!learning) {
        return res.status(400).json({ success: false, error: 'Learning content required' });
    }
    
    state.learnings.push(`[${new Date().toISOString()}] ${learning}`);
    await saveState();
    
    console.log(`🔄 Toobix learned: ${learning}`);
    
    res.json({ success: true, message: 'Learning recorded' });
});

// ============= STARTUP =============

async function start() {
    await loadState();
    
    app.listen(PORT, () => {
        console.log(`
🔄 ═══════════════════════════════════════════════════════════
   TOOBIX FEEDBACK LOOP SERVICE v1.0
   Port: ${PORT}
   
   Endpoints:
   ├── POST /feedback  - Submit feedback
   ├── GET  /stats     - Get statistics
   ├── GET  /insights  - Get insights & patterns
   ├── GET  /recent    - Recent feedbacks
   ├── GET  /learnings - What Toobix learned
   ├── POST /resolve   - Mark feedback resolved
   └── POST /learn     - Record a learning
   
   Feedbacks: ${state.feedbacks.length}
   Insights: ${state.insights.length}
   
   🔄 Toobix learns from every interaction!
═══════════════════════════════════════════════════════════
        `);
    });
}

start();
