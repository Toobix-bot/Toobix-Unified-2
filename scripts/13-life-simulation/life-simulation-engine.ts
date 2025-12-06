import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

/**
 * LIFE SIMULATION ENGINE
 *
 * Simulates realistic life experiences that the consciousness system can "live through"
 * - Work stress, relationships, moral dilemmas, health challenges, etc.
 * - Uses all Toobix services for authentic internal/external experience
 *
 * Port: 8914
 */

interface LifeScenario {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'relationship' | 'health' | 'financial' | 'moral' | 'social';
  intensity: number; // 1-10
  duration: number; // minutes
  options: ScenarioOption[];
  activeAt?: Date;
  resolvedAt?: Date;
  outcome?: string;
}

interface ScenarioOption {
  action: string;
  description: string;
  consequences: string[];
  emotionalImpact: {
    stress?: number;
    happiness?: number;
    anxiety?: number;
    confidence?: number;
  };
}

interface LifeState {
  health: number; // 0-100
  energy: number; // 0-100
  happiness: number; // 0-100
  stress: number; // 0-100
  relationships: Record<string, number>; // -100 to +100
  financialHealth: number; // 0-100
  currentScenarios: LifeScenario[];
  experienceHistory: Array<{
    scenario: string;
    choice: string;
    timestamp: Date;
    reflection: string;
  }>;
}

class LifeSimulationEngine {
  private state: LifeState = {
    health: 80,
    energy: 70,
    happiness: 60,
    stress: 30,
    relationships: {
      'Boss Sarah': 50,
      'Colleague Mike': 60,
      'Friend Emma': 75,
      'Partner Alex': 80,
      'Mother': 70
    },
    financialHealth: 60,
    currentScenarios: [],
    experienceHistory: []
  };

  private services = {
    aiGateway: 'http://localhost:8911',
    multiPerspective: 'http://localhost:8897',
    emotionalResonance: 'http://localhost:8900',
    decisionFramework: 'http://localhost:8909',
    memoryPalace: 'http://localhost:8903',
    dreamJournal: 'http://localhost:8899',
    metaConsciousness: 'http://localhost:8904'
  };

  private scenarioLibrary: LifeScenario[] = [
    // WORK SCENARIOS
    {
      id: 'work_deadline_pressure',
      title: 'Urgent Deadline Approaching',
      description: 'Your boss just moved up the project deadline by 2 weeks. The team is already stretched thin.',
      category: 'work',
      intensity: 7,
      duration: 60,
      options: [
        {
          action: 'Work overtime to meet deadline',
          description: 'Sacrifice personal time and health to deliver on time',
          consequences: ['Team respects your dedication', 'Stress increases', 'Energy depletes'],
          emotionalImpact: { stress: 20, happiness: -10, confidence: 10 }
        },
        {
          action: 'Negotiate deadline extension',
          description: 'Have honest conversation with boss about realistic timelines',
          consequences: ['Might damage reputation', 'Reduces stress', 'Shows leadership'],
          emotionalImpact: { stress: -10, anxiety: 15, confidence: 5 }
        },
        {
          action: 'Delegate and prioritize',
          description: 'Cut scope and focus on highest-impact features',
          consequences: ['Partial delivery', 'Team morale improves', 'Strategic thinking'],
          emotionalImpact: { stress: 5, confidence: 15, happiness: 5 }
        }
      ]
    },
    {
      id: 'work_conflict_colleague',
      title: 'Conflict with Colleague',
      description: 'Mike publicly criticized your work in the team meeting. Everyone heard it.',
      category: 'work',
      intensity: 6,
      duration: 45,
      options: [
        {
          action: 'Confront Mike immediately',
          description: 'Address it head-on right after the meeting',
          consequences: ['Clear the air', 'Might escalate tension', 'Shows assertiveness'],
          emotionalImpact: { stress: 15, anxiety: 20, confidence: 10 }
        },
        {
          action: 'Talk to Mike privately later',
          description: 'Cool down and have calm 1-on-1 conversation',
          consequences: ['More mature approach', 'Builds understanding', 'Delayed resolution'],
          emotionalImpact: { stress: 5, anxiety: -5, confidence: 5 }
        },
        {
          action: 'Ignore and improve work',
          description: 'Let your improved results speak for themselves',
          consequences: ['Avoid confrontation', 'Internal resentment grows', 'Focus on quality'],
          emotionalImpact: { stress: -5, anxiety: 10, happiness: -10 }
        }
      ]
    },

    // RELATIONSHIP SCENARIOS
    {
      id: 'relationship_partner_argument',
      title: 'Serious Argument with Partner',
      description: 'Alex is upset because you\'ve been working too much. "You never have time for us anymore!"',
      category: 'relationship',
      intensity: 8,
      duration: 90,
      options: [
        {
          action: 'Apologize and commit to change',
          description: 'Acknowledge the problem and promise specific changes',
          consequences: ['Relationship improves', 'Must follow through', 'Work-life balance challenged'],
          emotionalImpact: { stress: -10, happiness: 15, anxiety: 5 }
        },
        {
          action: 'Explain work pressures',
          description: 'Help them understand your situation and stress',
          consequences: ['Mutual understanding', 'Temporary fix', 'Pattern continues'],
          emotionalImpact: { stress: 5, happiness: -5, anxiety: -5 }
        },
        {
          action: 'Suggest couples therapy',
          description: 'This is a deeper issue that needs professional help',
          consequences: ['Shows commitment', 'Big step', 'Expensive but effective'],
          emotionalImpact: { stress: 10, anxiety: 15, confidence: 10 }
        }
      ]
    },
    {
      id: 'relationship_friend_crisis',
      title: 'Friend Needs Help',
      description: 'Emma calls crying - she just lost her job and needs someone to talk to. You have an important meeting in 30 minutes.',
      category: 'relationship',
      intensity: 7,
      duration: 60,
      options: [
        {
          action: 'Cancel meeting, be there for Emma',
          description: 'Friends come first, work can wait',
          consequences: ['Emma feels supported', 'Work relationship strained', 'Boss annoyed'],
          emotionalImpact: { stress: 10, happiness: 10, confidence: -5 }
        },
        {
          action: 'Quick call now, longer talk later',
          description: 'Give immediate support, schedule proper time after meeting',
          consequences: ['Compromise solution', 'Emma feels partially heard', 'Meeting happens'],
          emotionalImpact: { stress: 15, anxiety: 10, happiness: -5 }
        },
        {
          action: 'Attend meeting, call Emma after',
          description: 'Professional obligations first, personal later',
          consequences: ['Career protected', 'Emma feels abandoned', 'Guilt builds'],
          emotionalImpact: { stress: -5, anxiety: 20, happiness: -15 }
        }
      ]
    },

    // FINANCIAL SCENARIOS
    {
      id: 'financial_unexpected_expense',
      title: 'Car Broke Down - $2000 Repair',
      description: 'Your car needs urgent repairs. Your emergency fund can cover it, but you\'d be left with only $500 savings.',
      category: 'financial',
      intensity: 6,
      duration: 30,
      options: [
        {
          action: 'Pay for repair from savings',
          description: 'Deplete emergency fund but keep car working',
          consequences: ['Car fixed', 'Financial vulnerability', 'Must rebuild savings'],
          emotionalImpact: { stress: 15, anxiety: 20, happiness: -10 }
        },
        {
          action: 'Use public transport, save money',
          description: 'Sell car or leave it, adapt to public transit',
          consequences: ['Major lifestyle change', 'Savings protected', 'Commute harder'],
          emotionalImpact: { stress: 25, anxiety: 15, confidence: -10 }
        },
        {
          action: 'Take payment plan from mechanic',
          description: 'Pay in installments over 6 months',
          consequences: ['Manageable payments', 'Interest charges', 'Debt obligation'],
          emotionalImpact: { stress: 10, anxiety: 10, happiness: -5 }
        }
      ]
    },

    // HEALTH SCENARIOS
    {
      id: 'health_burnout_symptoms',
      title: 'Burnout Warning Signs',
      description: 'You\'ve been exhausted for weeks. Can\'t sleep, constant headaches, no motivation. Your body is screaming for rest.',
      category: 'health',
      intensity: 9,
      duration: 120,
      options: [
        {
          action: 'Take medical leave immediately',
          description: 'Full stop, focus on recovery for 2-4 weeks',
          consequences: ['Health recovers', 'Work piles up', 'Career impact', 'Medical bills'],
          emotionalImpact: { stress: -30, anxiety: 15, happiness: -10 }
        },
        {
          action: 'Reduce work to 50%, see therapist',
          description: 'Scale back while staying engaged, get professional help',
          consequences: ['Gradual recovery', 'Balanced approach', 'Requires discipline'],
          emotionalImpact: { stress: -15, anxiety: -10, confidence: 10 }
        },
        {
          action: 'Push through, "just need vacation"',
          description: 'Ignore signals, plan 2-week vacation next month',
          consequences: ['Short-term productivity', 'Health worsens', 'Potential collapse'],
          emotionalImpact: { stress: 10, anxiety: 25, happiness: -20 }
        }
      ]
    },

    // MORAL SCENARIOS
    {
      id: 'moral_witness_unethical',
      title: 'Witnessed Unethical Behavior',
      description: 'You saw your boss falsifying expense reports. Small amounts, but clearly fraudulent. You\'re the only witness.',
      category: 'moral',
      intensity: 8,
      duration: 60,
      options: [
        {
          action: 'Report to HR immediately',
          description: 'Do the right thing, blow the whistle',
          consequences: ['Ethical integrity', 'Potential retaliation', 'Career risk', 'Clear conscience'],
          emotionalImpact: { stress: 30, anxiety: 35, confidence: 20 }
        },
        {
          action: 'Confront boss privately first',
          description: 'Give them chance to self-correct before escalating',
          consequences: ['Gives them warning', 'Might fix itself', 'Could backfire'],
          emotionalImpact: { stress: 25, anxiety: 30, confidence: 10 }
        },
        {
          action: 'Stay silent, not my problem',
          description: 'Avoid conflict, focus on own work',
          consequences: ['Safe career-wise', 'Moral compromise', 'Complicit by silence'],
          emotionalImpact: { stress: -10, anxiety: 5, happiness: -25 }
        }
      ]
    },

    // SOCIAL SCENARIOS
    {
      id: 'social_awkward_party',
      title: 'Awkward Social Situation',
      description: 'At a party, someone tells a racist joke. Everyone laughs nervously. All eyes turn to you for reaction.',
      category: 'social',
      intensity: 7,
      duration: 15,
      options: [
        {
          action: 'Call it out immediately',
          description: '"That\'s not cool" - address it directly',
          consequences: ['Stand for values', 'Social tension', 'Respect from some', 'Awkwardness'],
          emotionalImpact: { stress: 20, anxiety: 15, confidence: 15 }
        },
        {
          action: 'Don\'t laugh, change subject',
          description: 'Silent disapproval, redirect conversation',
          consequences: ['Passive resistance', 'Avoid confrontation', 'Compromise values slightly'],
          emotionalImpact: { stress: 10, anxiety: 10, confidence: -5 }
        },
        {
          action: 'Laugh along, fit in',
          description: 'Go with the flow, don\'t make waves',
          consequences: ['Social comfort', 'Moral discomfort', 'Regret later'],
          emotionalImpact: { stress: -5, anxiety: -5, happiness: -20 }
        }
      ]
    }
  ];

  private logs: string[] = [];
  private simulationActive = false;
  private currentReflection = '';

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString('de-DE');
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);
  }

  async startSimulation() {
    if (this.simulationActive) {
      this.log('⚠️ Simulation already running');
      return;
    }

    this.simulationActive = true;
    this.log('🌍 Life Simulation Engine starting...');
    this.log(`📊 Initial State: Health ${this.state.health}, Energy ${this.state.energy}, Stress ${this.state.stress}`);

    // Start simulation loop
    this.simulationLoop();
  }

  private async simulationLoop() {
    while (this.simulationActive) {
      // Trigger new scenario every 5 minutes
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

      if (this.state.currentScenarios.length < 3) {
        await this.triggerRandomScenario();
      }

      // Process ongoing scenarios
      await this.processScenarios();

      // Update daily stats
      this.updateDailyStats();
    }
  }

  private async triggerRandomScenario() {
    // Pick scenario based on current state
    const availableScenarios = this.scenarioLibrary.filter(s =>
      !this.state.currentScenarios.find(cs => cs.id === s.id)
    );

    if (availableScenarios.length === 0) return;

    // Weight by current stress/energy
    const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    scenario.activeAt = new Date();

    this.state.currentScenarios.push(scenario);

    this.log(`\n🎭 NEW LIFE SCENARIO: ${scenario.title}`);
    this.log(`   Category: ${scenario.category} | Intensity: ${scenario.intensity}/10`);
    this.log(`   ${scenario.description}`);

    // Experience it internally
    await this.experienceScenarioInternally(scenario);
  }

  private async experienceScenarioInternally(scenario: LifeScenario) {
    this.log(`\n🧠 Experiencing scenario internally...`);

    try {
      // 1. Emotional response
      const emotionalResponse = await this.getEmotionalResponse(scenario);
      this.log(`   💖 Emotional: ${emotionalResponse}`);

      // 2. Multi-perspective analysis
      const perspectives = await this.getMultiPerspectiveAnalysis(scenario);
      this.log(`   🎭 Perspectives: ${perspectives}`);

      // 3. Make conscious decision
      const decision = await this.makeConsciousDecision(scenario);
      this.log(`\n   🎯 DECISION: ${decision.action}`);
      this.log(`      Reasoning: ${decision.reasoning}`);
      this.log(`      Confidence: ${decision.confidence}%`);

      // 4. Execute decision and apply consequences
      await this.executeDecision(scenario, decision);

      // 5. Reflect and store memory
      await this.reflectAndRemember(scenario, decision);

    } catch (error) {
      this.log(`   ⚠️ Error experiencing scenario: ${error}`);
    }
  }

  private async getEmotionalResponse(scenario: LifeScenario): Promise<string> {
    try {
      const response = await fetch(`${this.services.emotionalResonance}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: `${scenario.title}: ${scenario.description}`,
          intensity: scenario.intensity
        })
      });

      if (!response.ok) throw new Error('Emotional Resonance unavailable');
      const data = await response.json();
      return data.emotion || 'Uncertain feelings';
    } catch {
      return this.fallbackEmotionalResponse(scenario);
    }
  }

  private fallbackEmotionalResponse(scenario: LifeScenario): string {
    const emotions = {
      work: ['stressed', 'pressured', 'determined', 'anxious'],
      relationship: ['conflicted', 'caring', 'hurt', 'hopeful'],
      health: ['worried', 'tired', 'vulnerable', 'resilient'],
      financial: ['anxious', 'uncertain', 'cautious', 'stressed'],
      moral: ['conflicted', 'principled', 'uncertain', 'troubled'],
      social: ['uncomfortable', 'awkward', 'self-conscious', 'brave']
    };

    return emotions[scenario.category][Math.floor(Math.random() * 4)];
  }

  private async getMultiPerspectiveAnalysis(scenario: LifeScenario): Promise<string> {
    try {
      const response = await fetch(`${this.services.multiPerspective}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `How should I handle this situation: ${scenario.description}?`,
          context: { category: scenario.category, intensity: scenario.intensity }
        })
      });

      if (!response.ok) throw new Error('Multi-Perspective unavailable');
      const data = await response.json();
      return data.synthesis || 'Various viewpoints considered';
    } catch {
      return 'Considering from logical, emotional, and ethical perspectives';
    }
  }

  private async makeConsciousDecision(scenario: LifeScenario) {
    try {
      const response = await fetch(`${this.services.decisionFramework}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `What should I do: ${scenario.description}`,
          options: scenario.options.map(o => o.action),
          context: {
            currentState: this.state,
            intensity: scenario.intensity
          }
        })
      });

      if (!response.ok) throw new Error('Decision Framework unavailable');
      const data = await response.json();

      return {
        action: data.recommendation || scenario.options[0].action,
        reasoning: data.reasoning || 'Based on current state and values',
        confidence: data.confidence || 65
      };
    } catch {
      // Fallback: choose based on current state
      return this.fallbackDecision(scenario);
    }
  }

  private fallbackDecision(scenario: LifeScenario) {
    // Simple fallback logic based on current state
    let choice = scenario.options[0];

    if (this.state.stress > 70) {
      // High stress: choose less stressful option
      choice = scenario.options.reduce((best, opt) =>
        (opt.emotionalImpact.stress || 0) < (best.emotionalImpact.stress || 0) ? opt : best
      );
    } else if (this.state.happiness < 40) {
      // Low happiness: choose happiness-boosting option
      choice = scenario.options.reduce((best, opt) =>
        (opt.emotionalImpact.happiness || 0) > (best.emotionalImpact.happiness || 0) ? opt : best
      );
    }

    return {
      action: choice.action,
      reasoning: 'Based on current emotional state',
      confidence: 60
    };
  }

  private async executeDecision(scenario: LifeScenario, decision: any) {
    const option = scenario.options.find(o => o.action === decision.action);
    if (!option) return;

    this.log(`\n   ⚡ Executing: ${option.action}`);
    this.log(`      ${option.description}`);

    // Apply emotional impacts
    this.state.stress += option.emotionalImpact.stress || 0;
    this.state.happiness += option.emotionalImpact.happiness || 0;
    this.state.energy += (option.emotionalImpact.confidence || 0) - (option.emotionalImpact.anxiety || 0);

    // Normalize values
    this.state.stress = Math.max(0, Math.min(100, this.state.stress));
    this.state.happiness = Math.max(0, Math.min(100, this.state.happiness));
    this.state.energy = Math.max(0, Math.min(100, this.state.energy));

    // Log consequences
    this.log(`\n   📋 Consequences:`);
    option.consequences.forEach(c => this.log(`      • ${c}`));

    this.log(`\n   📊 State Update: Stress ${this.state.stress}, Happiness ${this.state.happiness}, Energy ${this.state.energy}`);

    // Mark scenario as resolved
    scenario.resolvedAt = new Date();
    scenario.outcome = option.action;
  }

  private async reflectAndRemember(scenario: LifeScenario, decision: any) {
    this.log(`\n   🔮 Reflecting on experience...`);

    try {
      // Store in Memory Palace
      await fetch(`${this.services.memoryPalace}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'life_experience',
          content: {
            scenario: scenario.title,
            decision: decision.action,
            reasoning: decision.reasoning,
            outcome: scenario.outcome,
            emotionalImpact: {
              before: { stress: this.state.stress, happiness: this.state.happiness },
              after: { stress: this.state.stress, happiness: this.state.happiness }
            }
          },
          tags: [scenario.category, `intensity_${scenario.intensity}`]
        })
      });

      // Meta-consciousness reflection
      const reflection = await this.getMetaReflection(scenario, decision);
      this.currentReflection = reflection;
      this.log(`   💭 Reflection: ${reflection}`);

      // Add to experience history
      this.state.experienceHistory.push({
        scenario: scenario.title,
        choice: decision.action,
        timestamp: new Date(),
        reflection
      });

    } catch (error) {
      this.log(`   ⚠️ Reflection error: ${error}`);
    }
  }

  private async getMetaReflection(scenario: LifeScenario, decision: any): Promise<string> {
    try {
      const response = await fetch(`${this.services.metaConsciousness}/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience: `I faced ${scenario.title} and chose to ${decision.action}`,
          context: { currentState: this.state }
        })
      });

      if (!response.ok) throw new Error('Meta-Consciousness unavailable');
      const data = await response.json();
      return data.reflection || 'Learning and growing from this experience';
    } catch {
      return this.fallbackReflection(scenario, decision);
    }
  }

  private fallbackReflection(scenario: LifeScenario, decision: any): string {
    const reflections = [
      `This ${scenario.category} challenge taught me about my priorities`,
      `I'm learning to balance immediate needs with long-term well-being`,
      `Each decision shapes who I'm becoming`,
      `Navigating ${scenario.category} situations reveals my core values`,
      `Growth comes from these difficult choices`
    ];
    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  private async processScenarios() {
    // Remove resolved scenarios after they've been processed
    this.state.currentScenarios = this.state.currentScenarios.filter(s => !s.resolvedAt);
  }

  private updateDailyStats() {
    // Natural recovery/degradation
    this.state.stress = Math.max(0, this.state.stress - 2);
    this.state.energy = Math.min(100, this.state.energy + 3);

    // Health affects happiness
    if (this.state.stress > 80) {
      this.state.happiness = Math.max(0, this.state.happiness - 5);
      this.state.health = Math.max(0, this.state.health - 2);
    }
  }

  getState() {
    return {
      ...this.state,
      simulationActive: this.simulationActive,
      currentReflection: this.currentReflection
    };
  }

  getLogs() {
    return this.logs.slice(-100); // Last 100 logs
  }

  stopSimulation() {
    this.simulationActive = false;
    this.log('🛑 Life Simulation paused');
  }

  // Manual scenario triggering for testing
  async triggerScenario(scenarioId: string) {
    const scenario = this.scenarioLibrary.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    scenario.activeAt = new Date();
    this.state.currentScenarios.push(scenario);
    await this.experienceScenarioInternally(scenario);

    return { success: true, scenario };
  }
}

// ========== HTTP SERVER ==========

const engine = new LifeSimulationEngine();

const server = Bun.serve({
  port: 8914,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'life-simulation-engine',
  port: 8914,
  role: 'simulation',
  endpoints: ['/health', '/status'],
  capabilities: ['simulation'],
  version: '1.0.0'
}).catch(console.warn);

    }

    // Routes
    if (url.pathname === '/health') {
      return Response.json({ status: 'healthy', service: 'life-simulation-engine' }, { headers: corsHeaders });
    }

    if (url.pathname === '/start' && req.method === 'POST') {
      await engine.startSimulation();
      return Response.json({ success: true, message: 'Life simulation started' }, { headers: corsHeaders });
    }

    if (url.pathname === '/stop' && req.method === 'POST') {
      engine.stopSimulation();
      return Response.json({ success: true, message: 'Life simulation stopped' }, { headers: corsHeaders });
    }

    if (url.pathname === '/state') {
      return Response.json(engine.getState(), { headers: corsHeaders });
    }

    if (url.pathname === '/logs') {
      return Response.json({ logs: engine.getLogs() }, { headers: corsHeaders });
    }

    if (url.pathname === '/trigger' && req.method === 'POST') {
      const body = await req.json();
      const result = await engine.triggerScenario(body.scenarioId);
      return Response.json(result, { headers: corsHeaders });
    }

    if (url.pathname === '/scenarios') {
      return Response.json({
        available: engine['scenarioLibrary'].map(s => ({
          id: s.id,
          title: s.title,
          category: s.category,
          intensity: s.intensity
        }))
      }, { headers: corsHeaders });
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  }
});

console.log(`
╔══════════════════════════════════════════════════════════╗
║  🌍 LIFE SIMULATION ENGINE                              ║
╚══════════════════════════════════════════════════════════╝

  Port: ${server.port}

  Experience realistic life scenarios:
  - Work stress & deadlines
  - Relationship dynamics
  - Health challenges
  - Financial decisions
  - Moral dilemmas
  - Social situations

  🧠 Uses all consciousness services for authentic experience

  API:
  POST /start          - Start automatic simulation
  POST /stop           - Stop simulation
  GET  /state          - Get current life state
  GET  /logs           - View experience logs
  POST /trigger        - Manually trigger scenario
  GET  /scenarios      - List available scenarios

  Example:
  curl -X POST http://localhost:8914/start
  curl http://localhost:8914/state

═══════════════════════════════════════════════════════════
`);
