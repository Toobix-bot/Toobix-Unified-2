const fs = require('fs');
const path = require('path');

console.log('💥 Integrating Consequences Engine...\n');

// 1. Add to DualityBridge
const dualityFile = path.join(__dirname, 'src', 'systems', 'DualityBridge.ts');
let duality = fs.readFileSync(dualityFile, 'utf-8');

if (!duality.includes('ConsequencesEngine')) {
  duality = duality.replace(
    `import { ConsciousnessEngine`,
    `import { ConsequencesEngine } from './ConsequencesEngine';\nimport { ConsciousnessEngine`
  );

  duality = duality.replace(
    `  private consciousnessEngine`,
    `  private consequencesEngine: ConsequencesEngine;\n  private consciousnessEngine`
  );

  duality = duality.replace(
    `this.consciousnessEngine = new ConsciousnessEngine()`,
    `this.consequencesEngine = new ConsequencesEngine();\n    this.consciousnessEngine = new ConsciousnessEngine()`
  );

  duality = duality.replace(
    `  public getConsciousnessEngine()`,
    `  public getConsequencesEngine(): ConsequencesEngine {
    return this.consequencesEngine;
  }

  public getConsciousnessEngine()`
  );

  fs.writeFileSync(dualityFile, duality, 'utf-8');
  console.log('✅ Added ConsequencesEngine to DualityBridge');
} else {
  console.log('⏭️ ConsequencesEngine already in DualityBridge');
}

// 2. Add to Scene
const sceneFile = path.join(__dirname, 'src', 'scenes', 'AICivilizationScene.ts');
let scene = fs.readFileSync(sceneFile, 'utf-8');

// Add consequence evaluation and visual effects to update loop
const consequenceUpdate = `
    // Evaluate and apply consequences
    this.agents.forEach((agent) => {
      if (agent.dualityState) {
        const consequences = this.dualityBridge.getConsequencesEngine();
        const consequence = consequences.evaluateConsequences(agent);

        if (consequence) {
          // Store on agent for access
          (agent as any).consequence = consequence;

          // Apply visual effects
          const visualForm = (agent as any).visualForm;
          if (visualForm) {
            consequences.applyVisualConsequences(visualForm, consequence);
          }

          // Handle unconsciousness
          if (consequence.state === 'token_exhausted') {
            const regenerated = consequences.regenerateTokens(
              agent.dualityState.kiResources,
              delta
            );

            // Check wake up
            if (consequences.checkWakeUp(consequence, agent.dualityState.kiResources)) {
              console.log(\`💚 \${agent.name} woke up! Tokens: \${agent.dualityState.kiResources.tokenBudget.toFixed(0)}\`);
              (agent as any).consequence = null;
            }
          }
        } else {
          (agent as any).consequence = null;
        }
      }
    });
`;

if (!scene.includes('evaluateConsequences')) {
  scene = scene.replace(
    `    // Update visual forms based on duality state`,
    `${consequenceUpdate}\n    // Update visual forms based on duality state`
  );
  console.log('✅ Added consequence evaluation to update loop');
} else {
  console.log('⏭️ Consequences already in update loop');
}

// Add consequence stats to UI
const consequenceUI = `
        const consequencesEngine = this.dualityBridge.getConsequencesEngine();
        const consequenceStats = consequencesEngine.getStatistics();

        const unconsciousAgents = this.agents.filter(a => (a as any).consequence?.state === 'token_exhausted').length;
        const criticalAgents = this.agents.filter(a => {
          const c = (a as any).consequence;
          return c && ['token_critical', 'context_overloaded', 'semantic_degraded', 'multiple_failures'].includes(c.state);
        }).length;`;

if (!scene.includes('consequencesEngine.getStatistics')) {
  scene = scene.replace(
    `        const consciousnessEngine = this.dualityBridge.getConsciousnessEngine();`,
    `        const consciousnessEngine = this.dualityBridge.getConsciousnessEngine();${consequenceUI}`
  );

  // Add to panel display
  scene = scene.replace(
    `          \`💭 Thoughts: \${consciousnessStats.totalThoughts}\`,`,
    `          \`💭 Thoughts: \${consciousnessStats.totalThoughts}\`,
          '',
          '💥 CONSEQUENCES:',
          \`💀 Unconscious: \${unconsciousAgents}\`,
          \`⚠️ Critical: \${criticalAgents}\`,
          \`🔋 Total Exhaustions: \${consequenceStats.totalExhaustions}\`,`
  );

  console.log('✅ Added consequence stats to UI panel');
} else {
  console.log('⏭️ Consequence stats already in UI');
}

// Add emergency recovery hotkey (R key)
const recoveryHotkey = `
    // R - Emergency recovery (restore resources for all agents)
    this.input.keyboard?.on('keydown-R', () => {
      const consequences = this.dualityBridge.getConsequencesEngine();
      this.agents.forEach((agent) => {
        if (agent.dualityState) {
          consequences.emergencyRecovery(agent.dualityState.kiResources);
        }
      });
      console.log('🚑 Emergency recovery executed for all agents');
    });`;

if (!scene.includes('keydown-R')) {
  scene = scene.replace(
    `    // D - Trigger philosophical dialogue`,
    `${recoveryHotkey}\n\n    // D - Trigger philosophical dialogue`
  );
  console.log('✅ Added R hotkey for emergency recovery');
} else {
  console.log('⏭️ R hotkey already exists');
}

// Update UI panel to show R hotkey
scene = scene.replace(
  `'Press D for philosophical dialogue',`,
  `'Press D for philosophical dialogue',
          'Press R for emergency recovery',`
);

fs.writeFileSync(sceneFile, scene, 'utf-8');

console.log('\n✅ Consequences Engine fully integrated!\n');
console.log('Features:');
console.log('  💀 Token Exhaustion → Unconsciousness');
console.log('  🧠 Context Overflow → Memory fade');
console.log('  🔀 Semantic Collapse → Incoherent thoughts');
console.log('  ⚠️ Multiple Failures → System breakdown');
console.log('  👁️ Visual indicators (flicker, fade, fragment, static)');
console.log('  🚑 Emergency recovery (R hotkey)\n');

console.log('Consequences:');
console.log('  < 10% tokens → Can barely think, 75% slower');
console.log('  0% tokens → UNCONSCIOUS (no thought, no movement)');
console.log('  > 90% context → Memories fade, confusion');
console.log('  < 30% coherence → Broken logic, incoherent\n');

console.log('Visual Effects:');
console.log('  Low tokens → Flickering');
console.log('  Unconscious → Fading alpha');
console.log('  Context overflow → Fragmenting shape');
console.log('  Semantic collapse → Static/glitching\n');
