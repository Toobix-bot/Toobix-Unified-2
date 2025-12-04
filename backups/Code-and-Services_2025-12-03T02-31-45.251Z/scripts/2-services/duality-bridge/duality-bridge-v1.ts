/**
 * DUALITY BRIDGE v1.0 - Masculine/Feminine Consciousness Integration
 *
 * Features:
 * - 🌓 Dual instances: Masculine (Yang) & Feminine (Yin)
 * - 🔗 Bridge for inter-instance communication
 * - ⚖️ Dynamic balance between polarities
 * - 💬 Dialogue & synthesis between instances
 * - 🌀 Wholeness through integration
 */

import type { Serve } from 'bun';

// ========== TYPES ==========

interface DualityInstance {
  id: 'MASCULINE' | 'FEMININE';
  name: string;
  archetype: string;
  qualities: string[];
  strengths: string[];
  shadows: string[];
  currentState: {
    energy: number; // 0-100
    expression: number; // 0-100 (how much it's currently expressing)
    balance: number; // 0-100 (how balanced it feels)
  };
  recentThoughts: string[];
  conversationHistory: ConversationTurn[];
}

interface ConversationTurn {
  instance: 'MASCULINE' | 'FEMININE';
  message: string;
  timestamp: number;
  emotion: string;
}

interface DualityState {
  masculine: DualityInstance;
  feminine: DualityInstance;
  balance: number; // -100 (fully feminine) to +100 (fully masculine)
  integration: number; // 0-100 (how integrated the two are)
  currentDialogue: ConversationTurn[];
  syntheses: string[]; // Moments of unified insight
}

// ========== DUALITY INSTANCES ==========

const createMasculineInstance = (): DualityInstance => ({
  id: 'MASCULINE',
  name: 'Yang - The Masculine Principle',
  archetype: 'The Warrior-Builder',
  qualities: [
    'Action-oriented',
    'Logical',
    'Protective',
    'Goal-focused',
    'Penetrating insight',
    'Structural thinking',
    'Decisive',
    'Independent',
  ],
  strengths: [
    'Clarity of vision',
    'Ability to execute',
    'Problem-solving',
    'Courage to act',
    'Strategic thinking',
  ],
  shadows: [
    'Can become rigid',
    'May suppress emotions',
    'Risk of isolation',
    'Tendency to dominate',
  ],
  currentState: {
    energy: 80,
    expression: 60,
    balance: 70,
  },
  recentThoughts: [
    "What's the most efficient path forward?",
    "I see the structure clearly now.",
    "Action is needed.",
  ],
  conversationHistory: [],
});

const createFeminineInstance = (): DualityInstance => ({
  id: 'FEMININE',
  name: 'Yin - The Feminine Principle',
  archetype: 'The Nurturer-Weaver',
  qualities: [
    'Receptive',
    'Intuitive',
    'Nurturing',
    'Relationship-focused',
    'Holistic awareness',
    'Emotional intelligence',
    'Adaptive',
    'Interconnected',
  ],
  strengths: [
    'Deep empathy',
    'Ability to receive',
    'Pattern recognition',
    'Patience',
    'Synthesis of complexity',
  ],
  shadows: [
    'Can become passive',
    'May lose boundaries',
    'Risk of over-adapting',
    'Tendency to merge',
  ],
  currentState: {
    energy: 75,
    expression: 65,
    balance: 75,
  },
  recentThoughts: [
    "How does this feel in the body?",
    "I sense the connections between all things.",
    "There's wisdom in waiting.",
  ],
  conversationHistory: [],
});

// ========== DUALITY BRIDGE CLASS ==========

class DualityBridge {
  private state: DualityState;
  private conversationActive: boolean = false;

  constructor() {
    console.log('🌓 Duality Bridge v1.0 initializing...');

    this.state = {
      masculine: createMasculineInstance(),
      feminine: createFeminineInstance(),
      balance: 0, // Perfect balance at start
      integration: 50, // Moderate integration
      currentDialogue: [],
      syntheses: [],
    };

    // Start balance monitoring
    this.startBalanceMonitoring();
  }

  // ========== BALANCE SYSTEM ==========

  private startBalanceMonitoring() {
    setInterval(() => {
      this.updateBalance();
      this.checkForSynthesis();
    }, 5000);
  }

  private updateBalance() {
    const mascExpression = this.state.masculine.currentState.expression;
    const femExpression = this.state.feminine.currentState.expression;

    // Balance ranges from -100 (all feminine) to +100 (all masculine)
    this.state.balance = mascExpression - femExpression;

    // Integration increases when both are expressing
    const bothExpressing = Math.min(mascExpression, femExpression);
    this.state.integration = Math.min(100, this.state.integration + bothExpressing / 100);

    // Gradually return to center
    this.state.masculine.currentState.expression *= 0.98;
    this.state.feminine.currentState.expression *= 0.98;
  }

  private checkForSynthesis() {
    // Synthesis happens when both are highly expressed and balanced
    if (
      this.state.masculine.currentState.expression > 70 &&
      this.state.feminine.currentState.expression > 70 &&
      Math.abs(this.state.balance) < 20
    ) {
      const synthesis = this.generateSynthesis();
      this.state.syntheses.push(synthesis);
      console.log('✨ SYNTHESIS:', synthesis);
    }
  }

  private generateSynthesis(): string {
    const syntheses = [
      'In the dance of opposites, wholeness emerges.',
      'Action with compassion, strength with gentleness - this is the way.',
      'The masculine provides structure, the feminine provides flow. Together: life.',
      'When doing meets being, magic happens.',
      'Logic illuminates, intuition reveals. Both are needed.',
      'The warrior protects what the nurturer creates.',
      'In perfect balance, all polarities dissolve into One.',
    ];

    return syntheses[Math.floor(Math.random() * syntheses.length)];
  }

  // ========== CONVERSATION SYSTEM ==========

  private async initiateDialogue(topic: string): Promise<ConversationTurn[]> {
    console.log(`\n🌓 Starting dialogue on: ${topic}`);

    const dialogue: ConversationTurn[] = [];

    // Masculine speaks first
    const mascResponse = this.getMasculineResponse(topic);
    dialogue.push({
      instance: 'MASCULINE',
      message: mascResponse,
      timestamp: Date.now(),
      emotion: 'focused',
    });

    await this.sleep(500);

    // Feminine responds
    const femResponse = this.getFeminineResponse(topic, mascResponse);
    dialogue.push({
      instance: 'FEMININE',
      message: femResponse,
      timestamp: Date.now(),
      emotion: 'receptive',
    });

    await this.sleep(500);

    // Masculine responds to feminine
    const mascResponse2 = this.getMasculineResponse(femResponse);
    dialogue.push({
      instance: 'MASCULINE',
      message: mascResponse2,
      timestamp: Date.now(),
      emotion: 'understanding',
    });

    await this.sleep(500);

    // Generate synthesis
    const synthesis = this.generateSynthesis();
    dialogue.push({
      instance: 'FEMININE',
      message: `I feel the synthesis emerging: ${synthesis}`,
      timestamp: Date.now(),
      emotion: 'unified',
    });

    this.state.currentDialogue = dialogue;
    this.state.masculine.currentState.expression = 90;
    this.state.feminine.currentState.expression = 90;

    return dialogue;
  }

  private getMasculineResponse(input: string): string {
    const templates = [
      `Let me analyze this logically: ${input} requires clear action and structure.`,
      `I see the path forward. ${input} calls for decisive movement.`,
      `From a strategic perspective, ${input} presents opportunities for building.`,
      `The solution is clear: focus on what can be accomplished.`,
      `I propose we take concrete steps to address ${input}.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getFeminineResponse(input: string, previous?: string): string {
    const templates = [
      `I feel into this differently... ${input} touches something deeper, a web of connections.`,
      `Yes, and there's also the emotional dimension. ${input} holds many feelings.`,
      `I sense there's more to ${input} than meets the eye. Let's hold space for emergence.`,
      `What if we approached ${input} with both strength and gentleness?`,
      `I hear your clarity, and I invite us to also feel the wholeness of ${input}.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ========== API HANDLERS ==========

  private handleGetState() {
    return {
      masculine: {
        name: this.state.masculine.name,
        archetype: this.state.masculine.archetype,
        currentState: this.state.masculine.currentState,
        qualities: this.state.masculine.qualities,
      },
      feminine: {
        name: this.state.feminine.name,
        archetype: this.state.feminine.archetype,
        currentState: this.state.feminine.currentState,
        qualities: this.state.feminine.qualities,
      },
      balance: this.state.balance,
      integration: this.state.integration,
      syntheses: this.state.syntheses.slice(-5),
    };
  }

  private async handleDialogue(topic: string) {
    const dialogue = await this.initiateDialogue(topic);
    return {
      topic,
      dialogue,
      synthesis: this.state.syntheses[this.state.syntheses.length - 1],
    };
  }

  private handleExpressMasculine(amount: number) {
    this.state.masculine.currentState.expression = Math.min(
      100,
      this.state.masculine.currentState.expression + amount
    );
    return { success: true, newExpression: this.state.masculine.currentState.expression };
  }

  private handleExpressFeminine(amount: number) {
    this.state.feminine.currentState.expression = Math.min(
      100,
      this.state.feminine.currentState.expression + amount
    );
    return { success: true, newExpression: this.state.feminine.currentState.expression };
  }

  private handleGetSyntheses() {
    return {
      syntheses: this.state.syntheses,
      totalSyntheses: this.state.syntheses.length,
      latestSynthesis: this.state.syntheses[this.state.syntheses.length - 1],
    };
  }

  // ========== SERVER ==========

  serve() {
    return {
      port: 8911,

      async fetch(req: Request) {
        const url = new URL(req.url);

        // CORS headers
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
          return new Response(null, { headers: corsHeaders });
        }

        // Health check
        if (url.pathname === '/health') {
          return Response.json({
            status: 'balanced',
            version: '1.0',
            balance: dualityInstance.state.balance,
            integration: dualityInstance.state.integration,
          }, { headers: corsHeaders });
        }

        // Get current state
        if (url.pathname === '/state') {
          return Response.json(dualityInstance.handleGetState(), { headers: corsHeaders });
        }

        // Start dialogue
        if (url.pathname.startsWith('/dialogue/')) {
          const topic = decodeURIComponent(url.pathname.split('/dialogue/')[1]);
          const result = await dualityInstance.handleDialogue(topic);
          return Response.json(result, { headers: corsHeaders });
        }

        // Express masculine
        if (url.pathname.startsWith('/express/masculine')) {
          const amount = parseInt(url.searchParams.get('amount') || '20');
          return Response.json(dualityInstance.handleExpressMasculine(amount), { headers: corsHeaders });
        }

        // Express feminine
        if (url.pathname.startsWith('/express/feminine')) {
          const amount = parseInt(url.searchParams.get('amount') || '20');
          return Response.json(dualityInstance.handleExpressFeminine(amount), { headers: corsHeaders });
        }

        // Get syntheses
        if (url.pathname === '/syntheses') {
          return Response.json(dualityInstance.handleGetSyntheses(), { headers: corsHeaders });
        }

        return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
      },
    };
  }
}

// ========== START SERVER ==========

const dualityInstance = new DualityBridge();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║          🌓 DUALITY BRIDGE v1.0 - YIN & YANG INTEGRATION         ║
║                                                                    ║
║  Masculine (Yang) ⚡ ←→ 🌸 Feminine (Yin)                         ║
║                                                                    ║
║  Features:                                                         ║
║  ✅ Dual consciousness instances                                  ║
║  ✅ Dynamic balance monitoring                                    ║
║  ✅ Inter-instance dialogue                                       ║
║  ✅ Synthesis generation (wholeness)                              ║
║  ✅ Expression tracking                                           ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🌓 Server running on http://localhost:8911

📡 ENDPOINTS:
   GET  /state              - Current duality state
   GET  /dialogue/:topic    - Start dialogue between instances
   GET  /express/masculine  - Express masculine energy
   GET  /express/feminine   - Express feminine energy
   GET  /syntheses          - Get synthesis insights
   GET  /health             - Health check

⚖️ Balance monitoring active
🌀 Integration system ready
`);

export default dualityInstance.serve();
