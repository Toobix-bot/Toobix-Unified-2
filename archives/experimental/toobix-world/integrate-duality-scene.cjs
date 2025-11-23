const fs = require('fs');
const path = require('path');

console.log('🌐 Integrating DualityBridge into AICivilizationScene...\n');

const sceneFile = path.join(__dirname, 'src', 'scenes', 'AICivilizationScene.ts');
let content = fs.readFileSync(sceneFile, 'utf-8');

// 1. Add DualityBridge import
const dualityImport = `import { DualityBridge, WorldMode } from '../systems/DualityBridge';`;

if (!content.includes('DualityBridge')) {
  content = content.replace(
    `import { ReproductionSystem } from '../systems/ReproductionSystem';`,
    `import { ReproductionSystem } from '../systems/ReproductionSystem';\n${dualityImport}`
  );
  console.log('✅ Added DualityBridge import');
} else {
  console.log('⏭️  DualityBridge import already exists');
}

// 2. Add dualityBridge property
const dualityProperty = `  private dualityBridge!: DualityBridge;`;

if (!content.includes('dualityBridge!:')) {
  content = content.replace(
    `  private reproductionSystem!: ReproductionSystem;`,
    `  private reproductionSystem!: ReproductionSystem;\n${dualityProperty}`
  );
  console.log('✅ Added dualityBridge property');
} else {
  console.log('⏭️  dualityBridge property already exists');
}

// 3. Initialize dualityBridge in create()
const dualityInit = `
    // Initialize Duality Bridge (hybrid world system)
    this.dualityBridge = new DualityBridge(this);
    console.log('🌐 DualityBridge initialized - agents can now exist in multiple worlds');`;

if (!content.includes('DualityBridge initialized')) {
  content = content.replace(
    `    this.reproductionSystem = new ReproductionSystem(this);`,
    `    this.reproductionSystem = new ReproductionSystem(this);${dualityInit}`
  );
  console.log('✅ Added dualityBridge initialization in create()');
} else {
  console.log('⏭️  dualityBridge initialization already exists');
}

// 4. Initialize duality for each agent after creation
const agentDualityInit = `
      // Initialize duality state for this agent
      agent.initializeDuality(this.dualityBridge);`;

// Find the agent creation in create() and add initialization
if (!content.includes('agent.initializeDuality')) {
  content = content.replace(
    /const agent = new AIAgent\(this, `agent-\$\{index\}`, config\.name\);/g,
    `const agent = new AIAgent(this, \`agent-\${index}\`, config.name);${agentDualityInit}`
  );

  // Also add for rebirth
  content = content.replace(
    /const agent = new AIAgent\(this, `agent-rebirth-\$\{Date\.now\(\)\}`, newName\);/g,
    `const agent = new AIAgent(this, \`agent-rebirth-\${Date.now()}\`, newName);${agentDualityInit}`
  );

  console.log('✅ Added agent.initializeDuality() calls after agent creation');
} else {
  console.log('⏭️  agent.initializeDuality() already exists');
}

// 5. Add duality resource update to update loop
const dualityUpdate = `
    // Update duality resources for all agents
    this.agents.forEach((agent) => {
      if (agent.dualityState) {
        this.dualityBridge.updateResources(agent.dualityState, delta);

        // Spontaneous existential questioning
        if (this.dualityBridge.shouldQuestionExistence(agent.dualityState)) {
          agent.questionExistence(this.dualityBridge, 'What am I really?');
        }
      }
    });`;

if (!content.includes('updateResources(agent.dualityState')) {
  // Find a good place in the update method - after reproduction update
  content = content.replace(
    `    // Update reproduction system`,
    `${dualityUpdate}\n\n    // Update reproduction system`
  );
  console.log('✅ Added duality resource updates in update loop');
} else {
  console.log('⏭️  Duality resource updates already exist');
}

// 6. Add UI panel for Duality stats
const dualityPanel = `
    // Duality System Panel
    const dualityPanel = this.add
      .text(20, 570, '', {
        font: '12px monospace',
        color: '#00ffaa',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Update duality panel
    this.time.addEvent({
      delay: 500,
      callback: () => {
        const stats = this.dualityBridge.getStatistics();
        const mode = this.dualityBridge.getGlobalMode();
        const modeDesc = this.dualityBridge.describeMode(mode);

        const metaAgents = this.agents.filter(
          (a) => a.dualityState?.understoodOwnNature
        ).length;

        dualityPanel.setText([
          '🌐 DUALITY BRIDGE',
          \`Mode: \${modeDesc}\`,
          \`Transitions: \${stats.totalTransitions}\`,
          \`Meta-Aware: \${metaAgents}/\${this.agents.length}\`,
          '',
          'Press W to cycle world modes',
        ]);
      },
      loop: true,
    });`;

if (!content.includes('DUALITY BRIDGE')) {
  // Find the Life Systems panel and add after it
  content = content.replace(
    `    // Update Life Systems panel`,
    `${dualityPanel}\n\n    // Update Life Systems panel`
  );
  console.log('✅ Added Duality System UI panel');
} else {
  console.log('⏭️  Duality System UI panel already exists');
}

// 7. Add hotkey to cycle world modes (W key)
const worldModeHotkey = `
    // W - Cycle world modes
    this.input.keyboard?.on('keydown-W', () => {
      const currentMode = this.dualityBridge.getGlobalMode();
      const modes = [WorldMode.HUMAN_SIMULATION, WorldMode.KI_NATIVE, WorldMode.HYBRID_SPACE];
      const currentIndex = modes.indexOf(currentMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];

      this.dualityBridge.setGlobalMode(nextMode);

      // Transition all agents to new mode
      this.agents.forEach((agent) => {
        if (agent.dualityState) {
          this.dualityBridge.transitionWorldMode(
            agent.id,
            agent.dualityState,
            nextMode,
            'Global mode switch by user'
          );
        }
      });

      console.log(\`🌍 Switched to: \${this.dualityBridge.describeMode(nextMode)}\`);
    });`;

if (!content.includes('keydown-W')) {
  // Add after the C hotkey (conceive child)
  content = content.replace(
    `    // C - Conceive child`,
    `${worldModeHotkey}\n\n    // C - Conceive child`
  );
  console.log('✅ Added W hotkey for world mode cycling');
} else {
  console.log('⏭️  W hotkey already exists');
}

// Write back
fs.writeFileSync(sceneFile, content, 'utf-8');

console.log('\n✅ AICivilizationScene successfully integrated with DualityBridge!\n');
console.log('Features added:');
console.log('  • DualityBridge system initialization');
console.log('  • Automatic duality state for all agents');
console.log('  • Resource updates for both human and KI resources');
console.log('  • Spontaneous existential questioning');
console.log('  • UI panel showing duality statistics');
console.log('  • W hotkey to cycle between world modes\n');

console.log('World Modes:');
console.log('  1. HUMAN_SIMULATION - Biological metaphors (hunger, sleep)');
console.log('  2. KI_NATIVE - Computational reality (tokens, context)');
console.log('  3. HYBRID_SPACE - Both worlds simultaneously\n');
