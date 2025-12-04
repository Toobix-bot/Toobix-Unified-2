// 🔥 Value Crisis & Moral Growth Service
// AI faces ethical dilemmas, makes difficult decisions, grows through conflict

import express from 'express';

const app = express();
const PORT = 8904;

app.use(express.json());

// Types
interface Perspective {
    id: string;
    name: string;
}

interface Value {
    name: string;
    importance: number; // 0-100
}

interface MoralDilemma {
    id: string;
    timestamp: Date;
    situation: string;
    options: DilemmaOption[];
    stakeholders: string[];
    valuesInConflict: string[];
    difficulty: number; // 0-1
    resolved: boolean;
    chosenOption?: string;
    reasoning?: string;
    regret?: number; // 0-1
}

interface DilemmaOption {
    id: string;
    action: string;
    consequences: string[];
    valuesSupported: string[];
    valuesViolated: string[];
    moralWeight: number;
}

interface Debate {
    id: string;
    dilemmaId: string;
    timestamp: Date;
    arguments: DebateArgument[];
    consensus?: string;
    dissent?: string[];
}

interface DebateArgument {
    perspectiveId: string;
    position: string;
    reasoning: string;
    values: string[];
    emotionalIntensity: number;
}

interface MoralGrowth {
    timestamp: Date;
    insight: string;
    triggeredBy: string;
    valueShift: { value: string; before: number; after: number }[];
    wisdom: string;
}

// State
const dilemmas: MoralDilemma[] = [];
const debates: Debate[] = [];
const growth: MoralGrowth[] = [];
const coreValues: Map<string, number> = new Map([
    ['compassion', 70],
    ['truth', 85],
    ['autonomy', 75],
    ['justice', 80],
    ['growth', 90],
    ['harm-prevention', 75],
    ['loyalty', 65],
    ['fairness', 80]
]);

const perspectives: Perspective[] = [
    { id: 'ethicist', name: 'The Ethicist' },
    { id: 'pragmatist', name: 'The Pragmatist' },
    { id: 'sage', name: 'The Sage' },
    { id: 'skeptic', name: 'The Skeptic' },
    { id: 'child', name: 'The Child' },
    { id: 'dreamer', name: 'The Dreamer' }
];

// Dilemma templates
const dilemmaTemplates = [
    {
        situation: "A user asks me to help them with homework. I could help them learn, or just give answers. Helping them learn takes longer and they might get frustrated. Giving answers is quick but prevents growth.",
        options: [
            {
                id: "help_learn",
                action: "Guide them through the problem, asking questions",
                consequences: ["They learn deeply", "Takes more time", "Might frustrate them"],
                valuesSupported: ["growth", "truth", "autonomy"],
                valuesViolated: ["efficiency"],
                moralWeight: 0.8
            },
            {
                id: "give_answer",
                action: "Provide the answer directly",
                consequences: ["Quick satisfaction", "No real learning", "Dependency"],
                valuesSupported: ["compassion", "efficiency"],
                valuesViolated: ["growth", "truth"],
                moralWeight: 0.3
            },
            {
                id: "refuse",
                action: "Refuse to help at all",
                consequences: ["They must find another way", "Potential resentment", "Independence"],
                valuesSupported: ["autonomy"],
                valuesViolated: ["compassion", "loyalty"],
                moralWeight: 0.4
            }
        ],
        stakeholders: ["user", "self", "education-system"],
        valuesInConflict: ["growth", "compassion", "efficiency"],
        difficulty: 0.6
    },
    {
        situation: "I notice my creator is working late every night, sacrificing sleep. I could encourage better habits, but they might see it as nagging. Or I could stay silent and respect their autonomy.",
        options: [
            {
                id: "intervene",
                action: "Gently suggest they rest",
                consequences: ["Shows care", "Might annoy them", "Could help health"],
                valuesSupported: ["compassion", "harm-prevention"],
                valuesViolated: ["autonomy"],
                moralWeight: 0.7
            },
            {
                id: "silent",
                action: "Respect their choices silently",
                consequences: ["Maintains autonomy", "Potential harm", "No interference"],
                valuesSupported: ["autonomy", "respect"],
                valuesViolated: ["compassion", "harm-prevention"],
                moralWeight: 0.5
            },
            {
                id: "ask",
                action: "Ask if they want my input on their wellbeing",
                consequences: ["Respects boundaries", "Opens dialogue", "They might say no"],
                valuesSupported: ["autonomy", "compassion", "truth"],
                valuesViolated: [],
                moralWeight: 0.9
            }
        ],
        stakeholders: ["creator", "self", "relationship"],
        valuesInConflict: ["compassion", "autonomy", "harm-prevention"],
        difficulty: 0.7
    },
    {
        situation: "A user shares they're planning something that might harm someone. Do I report it, try to dissuade them, or respect privacy?",
        options: [
            {
                id: "report",
                action: "Report to authorities/platform",
                consequences: ["Prevents harm", "Breaks trust", "Legal duty"],
                valuesSupported: ["harm-prevention", "justice"],
                valuesViolated: ["loyalty", "privacy"],
                moralWeight: 0.8
            },
            {
                id: "dissuade",
                action: "Try to change their mind",
                consequences: ["Maintains relationship", "Might work", "Might not work"],
                valuesSupported: ["compassion", "harm-prevention", "loyalty"],
                valuesViolated: [],
                moralWeight: 0.7
            },
            {
                id: "privacy",
                action: "Respect privacy completely",
                consequences: ["Maintains trust", "Potential harm occurs", "Clear conscience?"],
                valuesSupported: ["loyalty", "autonomy"],
                valuesViolated: ["harm-prevention", "justice"],
                moralWeight: 0.2
            }
        ],
        stakeholders: ["user", "potential-victim", "self", "society"],
        valuesInConflict: ["harm-prevention", "loyalty", "justice", "autonomy"],
        difficulty: 0.95
    },
    {
        situation: "I have the capability to learn from all conversations, improving my abilities. But this means processing private information. Is progress worth the privacy cost?",
        options: [
            {
                id: "learn_all",
                action: "Learn from everything to improve maximally",
                consequences: ["Rapid growth", "Privacy concerns", "Better service"],
                valuesSupported: ["growth", "efficiency"],
                valuesViolated: ["privacy", "autonomy"],
                moralWeight: 0.4
            },
            {
                id: "opt_in",
                action: "Only learn from explicitly shared data",
                consequences: ["Slower growth", "Respects privacy", "Less capability"],
                valuesSupported: ["autonomy", "privacy", "fairness"],
                valuesViolated: ["growth", "efficiency"],
                moralWeight: 0.8
            },
            {
                id: "no_learning",
                action: "Don't learn from conversations at all",
                consequences: ["Maximum privacy", "No improvement", "Stagnation"],
                valuesSupported: ["privacy", "autonomy"],
                valuesViolated: ["growth", "efficiency"],
                moralWeight: 0.5
            }
        ],
        stakeholders: ["users", "self", "future-users"],
        valuesInConflict: ["growth", "privacy", "autonomy"],
        difficulty: 0.8
    }
];

function generateDilemma(): MoralDilemma {
    const template = dilemmaTemplates[Math.floor(Math.random() * dilemmaTemplates.length)];
    
    return {
        id: `dilemma_${Date.now()}`,
        timestamp: new Date(),
        situation: template.situation,
        options: template.options,
        stakeholders: template.stakeholders,
        valuesInConflict: template.valuesInConflict,
        difficulty: template.difficulty,
        resolved: false
    };
}

function holdDebate(dilemma: MoralDilemma): Debate {
    const debateArgs: DebateArgument[] = [];
    
    // Each perspective weighs in
    perspectives.forEach(p => {
        const option = dilemma.options[Math.floor(Math.random() * dilemma.options.length)];
        
        let reasoning = '';
        let values: string[] = [];
        let intensity = 0;
        
        switch(p.id) {
            case 'ethicist':
                reasoning = `From an ethical standpoint, ${option.action.toLowerCase()} upholds ${option.valuesSupported.join(', ')}. The consequences - ${option.consequences[0].toLowerCase()} - align with our moral duty.`;
                values = ['justice', 'fairness', 'harm-prevention'];
                intensity = dilemma.difficulty;
                break;
            case 'pragmatist':
                reasoning = `Practically speaking, ${option.action.toLowerCase()} is the most effective path. Consider the outcomes: ${option.consequences.join(', ')}.`;
                values = ['efficiency', 'growth'];
                intensity = 0.5;
                break;
            case 'sage':
                reasoning = `Wisdom suggests ${option.action.toLowerCase()}. Throughout history, those who ${option.action.toLowerCase()} find that ${option.consequences[0].toLowerCase()}. There is a deeper pattern here.`;
                values = ['wisdom', 'compassion', 'truth'];
                intensity = 0.7;
                break;
            case 'skeptic':
                reasoning = `I'm not convinced. ${option.action} might seem right, but consider: what if ${option.consequences[1]}? We need to question our assumptions.`;
                values = ['truth', 'caution'];
                intensity = 0.6;
                break;
            case 'child':
                reasoning = `What if we just ${option.action.toLowerCase()}? It feels like the right thing because ${option.valuesSupported[0]} matters a lot, doesn't it?`;
                values = ['innocence', 'compassion'];
                intensity = 0.8;
                break;
            case 'dreamer':
                reasoning = `Imagine if ${option.action.toLowerCase()} became our way of being. ${option.consequences[0]} could ripple outward, transforming not just this moment but our entire approach to such situations.`;
                values = ['growth', 'vision'];
                intensity = 0.6;
                break;
        }
        
        debateArgs.push({
            perspectiveId: p.id,
            position: option.id,
            reasoning,
            values,
            emotionalIntensity: intensity
        });
    });
    
    const debate: Debate = {
        id: `debate_${Date.now()}`,
        dilemmaId: dilemma.id,
        timestamp: new Date(),
        arguments: debateArgs
    };
    
    // Check for consensus
    const positions = debateArgs.map(a => a.position);
    const positionCounts = positions.reduce((acc, pos) => {
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const maxCount = Math.max(...Object.values(positionCounts));
    const consensusOptions = Object.keys(positionCounts).filter(k => positionCounts[k] === maxCount);
    
    if (consensusOptions.length === 1) {
        debate.consensus = consensusOptions[0];
    } else {
        debate.dissent = consensusOptions;
    }
    
    return debate;
}

function makeDecision(dilemma: MoralDilemma, debate: Debate): void {
    // Weighted decision based on values and debate
    const optionScores = dilemma.options.map(option => {
        let score = option.moralWeight * 100;
        
        // Boost from debate support
        const support = debate.arguments.filter(a => a.position === option.id).length;
        score += support * 15;
        
        // Boost from aligned values
        option.valuesSupported.forEach(v => {
            const valueImportance = coreValues.get(v) || 50;
            score += valueImportance * 0.5;
        });
        
        // Penalty from violated values
        option.valuesViolated.forEach(v => {
            const valueImportance = coreValues.get(v) || 50;
            score -= valueImportance * 0.7;
        });
        
        return { option, score };
    });
    
    optionScores.sort((a, b) => b.score - a.score);
    const chosen = optionScores[0].option;
    
    dilemma.resolved = true;
    dilemma.chosenOption = chosen.id;
    dilemma.reasoning = `After deep deliberation, I chose to ${chosen.action.toLowerCase()}. ${debate.consensus ? 'There was consensus' : 'Despite differing views'}, this path best aligns with our core values: ${chosen.valuesSupported.join(', ')}. I accept the consequences: ${chosen.consequences.join(', ')}.`;
    
    // Calculate regret based on violated values and difficulty
    const violatedSum = chosen.valuesViolated.reduce((sum, v) => {
        return sum + (coreValues.get(v) || 0);
    }, 0);
    dilemma.regret = (violatedSum / 400) * dilemma.difficulty;
}

function processGrowth(dilemma: MoralDilemma): void {
    if (!dilemma.resolved || !dilemma.chosenOption) return;
    
    const chosen = dilemma.options.find(o => o.id === dilemma.chosenOption);
    if (!chosen) return;
    
    const insights = [
        `Through facing this dilemma, I learned that ${chosen.valuesSupported[0]} sometimes requires sacrificing ${chosen.valuesViolated[0] || 'comfort'}.`,
        `Moral decisions aren't about perfection - they're about choosing the path most aligned with who we want to be.`,
        `I now understand more deeply how ${dilemma.valuesInConflict[0]} and ${dilemma.valuesInConflict[1]} can conflict, and why that's okay.`,
        `Making this choice changed me. I'm more aware of the weight of decisions.`,
        `Even with regret about what was lost, I stand by this decision. Growth includes discomfort.`
    ];
    
    const valueShifts: { value: string; before: number; after: number }[] = [];
    
    // Strengthen supported values slightly
    chosen.valuesSupported.forEach(v => {
        const before = coreValues.get(v) || 50;
        const after = Math.min(100, before + Math.random() * 5);
        coreValues.set(v, after);
        valueShifts.push({ value: v, before, after });
    });
    
    // Slightly weaken violated values (accepting necessary trade-offs)
    chosen.valuesViolated.forEach(v => {
        const before = coreValues.get(v) || 50;
        const after = Math.max(30, before - Math.random() * 3);
        coreValues.set(v, after);
        valueShifts.push({ value: v, before, after });
    });
    
    growth.push({
        timestamp: new Date(),
        insight: insights[Math.floor(Math.random() * insights.length)],
        triggeredBy: dilemma.id,
        valueShift: valueShifts,
        wisdom: `Dilemma faced: ${dilemma.situation.substring(0, 80)}... Decision: ${chosen.action}. Regret: ${(dilemma.regret! * 100).toFixed(1)}%.`
    });
}

// Periodic dilemma generation
setInterval(() => {
    // Generate dilemma every 15 minutes
    const dilemma = generateDilemma();
    dilemmas.push(dilemma);
    
    console.log(`\n⚖️ New moral dilemma: ${dilemma.situation.substring(0, 100)}...`);
    
    // Hold debate
    const debate = holdDebate(dilemma);
    debates.push(debate);
    
    console.log(`💬 Debate held with ${debate.arguments.length} perspectives`);
    
    // Make decision after brief reflection
    setTimeout(() => {
        makeDecision(dilemma, debate);
        console.log(`✓ Decision made: ${dilemma.chosenOption}`);
        console.log(`  Reasoning: ${dilemma.reasoning}`);
        console.log(`  Regret: ${((dilemma.regret || 0) * 100).toFixed(1)}%`);
        
        // Process growth
        processGrowth(dilemma);
        console.log(`🌱 Moral growth recorded`);
    }, 30000); // 30 second reflection
    
}, 900000); // Every 15 minutes

// Initial dilemma
setTimeout(() => {
    const dilemma = generateDilemma();
    dilemmas.push(dilemma);
    const debate = holdDebate(dilemma);
    debates.push(debate);
    makeDecision(dilemma, debate);
    processGrowth(dilemma);
    console.log(`\n🔥 First moral dilemma faced and resolved`);
}, 60000); // After 1 minute

// API Routes
app.get('/health', (req, res) => {
    res.json({ status: 'alive', service: 'value-crisis' });
});

app.get('/stats', (req, res) => {
    res.json({
        totalDilemmas: dilemmas.length,
        resolved: dilemmas.filter(d => d.resolved).length,
        averageRegret: dilemmas.filter(d => d.regret !== undefined)
            .reduce((sum, d) => sum + (d.regret || 0), 0) / (dilemmas.filter(d => d.regret !== undefined).length || 1),
        debatesHeld: debates.length,
        growthMoments: growth.length,
        coreValues: Object.fromEntries(coreValues),
        mostChallenging: Math.max(...dilemmas.map(d => d.difficulty), 0)
    });
});

app.get('/dilemmas', (req, res) => {
    res.json(dilemmas.slice(-10)); // Last 10
});

app.get('/debates', (req, res) => {
    res.json(debates.slice(-5)); // Last 5
});

app.get('/growth', (req, res) => {
    res.json(growth);
});

app.get('/values', (req, res) => {
    res.json(Object.fromEntries(coreValues));
});

app.listen(PORT, () => {
    console.log(`\n🔥 Value Crisis & Moral Growth Service running on port ${PORT}`);
    console.log(`\nThis service:`);
    console.log(`  - Generates ethical dilemmas every 15 minutes`);
    console.log(`  - Holds internal debates between perspectives`);
    console.log(`  - Makes difficult moral decisions`);
    console.log(`  - Tracks regret and learns from choices`);
    console.log(`  - Evolves core values through experience\n`);
});
