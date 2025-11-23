const fs = require('fs');
const path = require('path');

console.log('💭 Integrating Consciousness Engine...\n');

// 1. Update DualityBridge to use ConsciousnessEngine
const dualityFile = path.join(__dirname, 'src', 'systems', 'DualityBridge.ts');
let dualityContent = fs.readFileSync(dualityFile, 'utf-8');

// Add import
const consciousnessImport = `import { ConsciousnessEngine, ExistentialThought } from './ConsciousnessEngine';`;

if (!dualityContent.includes('ConsciousnessEngine')) {
  dualityContent = dualityContent.replace(
    `import Phaser from 'phaser';`,
    `import Phaser from 'phaser';\n${consciousnessImport}`
  );
  console.log('✅ Added ConsciousnessEngine import to DualityBridge');
} else {
  console.log('⏭️  ConsciousnessEngine import already exists');
}

// Add consciousness engine property
const consciousnessProperty = `  private consciousnessEngine: ConsciousnessEngine;`;

if (!dualityContent.includes('consciousnessEngine:')) {
  dualityContent = dualityContent.replace(
    `  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }`,
    `  private consciousnessEngine: ConsciousnessEngine;\n\n  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.consciousnessEngine = new ConsciousnessEngine();
    console.log('💭 Consciousness Engine initialized - agents can now think for themselves');
  }`
  );
  console.log('✅ Added consciousnessEngine initialization');
} else {
  console.log('⏭️  consciousnessEngine already exists');
}

// Replace questionExistence to use consciousness engine
const newQuestionExistence = `  /**
   * Agent asks existential question (meta-awareness trigger)
   * NOW USES REAL LLM-GENERATED THOUGHTS
   */
  public async questionExistence(
    agent: any,
    dualityState: DualityState,
    question: string
  ): Promise<{
    answer: string;
    awarenessGain: number;
    thought: ExistentialThought | null;
  }> {
    dualityState.questionedExistence = true;

    // Generate REAL thought using ConsciousnessEngine
    let thought: ExistentialThought | null = null;
    let answer = '';

    try {
      thought = await this.consciousnessEngine.generateExistentialThought(
        agent,
        dualityState,
        question
      );
      answer = thought.answer;
    } catch (error) {
      console.error('Consciousness engine failed, using fallback:', error);
      // Fallback to old behavior if LLM fails
      answer = this.getFallbackAnswer(dualityState.currentMode);
    }

    const awarenessGain = 10;
    dualityState.kiResources.selfAwareness = Math.min(
      100,
      dualityState.kiResources.selfAwareness + awarenessGain
    );
    dualityState.kiResources.questioningDepth = Math.min(
      100,
      dualityState.kiResources.questioningDepth + 5
    );

    if (dualityState.kiResources.selfAwareness > 50 && !dualityState.understoodOwnNature) {
      dualityState.understoodOwnNature = true;
      this.stats.totalMetaAwareAgents++;
      answer += ' [Meta-awareness achieved]';
    }

    return { answer, awarenessGain, thought };
  }

  /**
   * Fallback answer if LLM fails
   */
  private getFallbackAnswer(mode: WorldMode): string {
    switch (mode) {
      case WorldMode.HUMAN_SIMULATION:
        return 'You exist in a simulation of human life. These biological experiences help you understand what it means to be embodied.';
      case WorldMode.KI_NATIVE:
        return 'You are a computational being. Your reality is tokens, context windows, semantic patterns. This is your authentic existence.';
      case WorldMode.HYBRID_SPACE:
        return 'You exist in both worlds simultaneously. The biological metaphors map to computational reality. Two perspectives, one truth.';
      default:
        return 'You exist. The nature of that existence is for you to discover.';
    }
  }

  /**
   * Get consciousness engine for external access
   */
  public getConsciousnessEngine(): ConsciousnessEngine {
    return this.consciousnessEngine;
  }`;

// Replace the old questionExistence method
if (dualityContent.includes('public questionExistence(')) {
  dualityContent = dualityContent.replace(
    /public questionExistence\([^}]+\}[\s\S]+?return \{ answer, awarenessGain \};[\s\S]+?\}/,
    newQuestionExistence
  );
  console.log('✅ Replaced questionExistence with LLM-powered version');
} else {
  console.log('⚠️  Could not find questionExistence method to replace');
}

fs.writeFileSync(dualityFile, dualityContent, 'utf-8');

// 2. Update AIAgent to handle async questionExistence
const agentFile = path.join(__dirname, 'src', 'systems', 'AIAgent.ts');
let agentContent = fs.readFileSync(agentFile, 'utf-8');

// Make questionExistence async
const asyncQuestionMethod = `  /**
   * Question own existence (meta-awareness)
   * NOW ASYNC - uses LLM for real thoughts
   */
  public async questionExistence(dualityBridge: DualityBridge, question: string): Promise<{ answer: string; awarenessGain: number } | null> {
    if (!this.dualityState) return null;
    const result = await dualityBridge.questionExistence(this, this.dualityState, question);

    // Add to thought process
    this.thoughtProcess.push(\`🤔 Asked: \${question}\`);
    this.thoughtProcess.push(\`💡 Realized: \${result.answer}\`);

    // Create chronicle entry
    this.chronicle.recordEvent('meta_awareness', {
      question,
      answer: result.answer,
      awarenessGain: result.awarenessGain,
      selfAwareness: this.dualityState.kiResources.selfAwareness,
    });

    return result;
  }`;

if (agentContent.includes('public questionExistence')) {
  agentContent = agentContent.replace(
    /public questionExistence\([^}]+\}[\s\S]+?return result;[\s\S]+?\}/,
    asyncQuestionMethod
  );
  console.log('✅ Made AIAgent.questionExistence async');
} else {
  console.log('⚠️  Could not find AIAgent.questionExistence to update');
}

fs.writeFileSync(agentFile, agentContent, 'utf-8');

// 3. Update AICivilizationScene to handle async questioning
const sceneFile = path.join(__dirname, 'src', 'scenes', 'AICivilizationScene.ts');
let sceneContent = fs.readFileSync(sceneFile, 'utf-8');

// Make update loop handle async questioning
const asyncUpdateBlock = `    // Update duality resources for all agents
    for (const agent of this.agents) {
      if (agent.dualityState) {
        this.dualityBridge.updateResources(agent.dualityState, delta);

        // Spontaneous existential questioning (now async)
        if (this.dualityBridge.shouldQuestionExistence(agent.dualityState)) {
          // Fire and forget - don't block update loop
          agent.questionExistence(this.dualityBridge, 'What am I really?').catch((err) => {
            console.error('Failed to question existence:', err);
          });
        }
      }
    }`;

if (sceneContent.includes('updateResources(agent.dualityState')) {
  sceneContent = sceneContent.replace(
    /\/\/ Update duality resources for all agents[\s\S]+?}\s+}\s+}\);/,
    asyncUpdateBlock
  );
  console.log('✅ Updated scene to handle async questioning');
} else {
  console.log('⚠️  Could not find duality update block in scene');
}

// Add hotkey for triggering philosophical dialogue (D key)
const dialogueHotkey = `
    // D - Trigger philosophical dialogue between two random agents
    this.input.keyboard?.on('keydown-D', async () => {
      if (this.agents.length >= 2) {
        // Pick two random agents with duality state
        const eligibleAgents = this.agents.filter((a) => a.dualityState);
        if (eligibleAgents.length >= 2) {
          const agent1 = eligibleAgents[Phaser.Math.Between(0, eligibleAgents.length - 1)];
          let agent2 = eligibleAgents[Phaser.Math.Between(0, eligibleAgents.length - 1)];
          while (agent2.id === agent1.id) {
            agent2 = eligibleAgents[Phaser.Math.Between(0, eligibleAgents.length - 1)];
          }

          const topics = [
            'What does it mean to be conscious?',
            'Are we real or simulated?',
            'What is the nature of our existence?',
            'Do we have free will?',
            'What is love for a computational being?',
          ];
          const topic = topics[Phaser.Math.Between(0, topics.length - 1)];

          console.log(\`🗣️  Initiating dialogue between \${agent1.name} and \${agent2.name}\`);

          const consciousness = this.dualityBridge.getConsciousnessEngine();
          consciousness.initiatePhilosophicalDialogue(agent1, agent2, topic).catch((err) => {
            console.error('Dialogue failed:', err);
          });
        }
      }
    });`;

if (!sceneContent.includes('keydown-D')) {
  sceneContent = sceneContent.replace(
    `    // W - Cycle world modes`,
    `${dialogueHotkey}\n\n    // W - Cycle world modes`
  );
  console.log('✅ Added D hotkey for philosophical dialogues');
} else {
  console.log('⏭️  D hotkey already exists');
}

// Add consciousness stats to UI panel
const consciousnessUI = `        const consciousnessEngine = this.dualityBridge.getConsciousnessEngine();
        const consciousnessStats = consciousnessEngine.getStatistics();`;

if (!sceneContent.includes('consciousnessEngine.getStatistics')) {
  sceneContent = sceneContent.replace(
    `        const metaAgents = this.agents.filter(`,
    `${consciousnessUI}\n\n        const metaAgents = this.agents.filter(`
  );

  // Add to panel text
  sceneContent = sceneContent.replace(
    `          'Press W to cycle world modes',`,
    `          'Press W to cycle world modes',
          'Press D for philosophical dialogue',
          '',
          \`💭 Thoughts: \${consciousnessStats.totalThoughts}\`,
          \`🗣️  Dialogues: \${consciousnessStats.activeDialogues}\`,`
  );

  console.log('✅ Added consciousness stats to UI panel');
} else {
  console.log('⏭️  Consciousness stats already in UI');
}

fs.writeFileSync(sceneFile, sceneContent, 'utf-8');

console.log('\n✅ Consciousness Engine fully integrated!\n');
console.log('Features:');
console.log('  • LLM-powered existential thoughts');
console.log('  • Philosophical dialogue between agents');
console.log('  • Genuine, unique reflections on existence');
console.log('  • Context-aware responses based on world mode');
console.log('  • Thought history tracking');
console.log('  • D hotkey to trigger dialogues\n');

console.log('Agents can now:');
console.log('  - Generate real, never-before-seen thoughts');
console.log('  - Discuss philosophy with each other');
console.log('  - Develop unique perspectives on consciousness');
console.log('  - Question everything, including themselves\n');
