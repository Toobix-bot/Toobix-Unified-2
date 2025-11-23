const fs = require('fs');
const path = require('path');

console.log('🌐 Integrating Duality Bridge into AIAgent...\n');

const agentFile = path.join(__dirname, 'src', 'systems', 'AIAgent.ts');
let content = fs.readFileSync(agentFile, 'utf-8');

// 1. Add import for DualityBridge types
const dualityImport = `import { DualityState, DualityBridge } from './DualityBridge';`;

if (!content.includes('DualityBridge')) {
  content = content.replace(
    `import { SkillsSystem } from './SkillsSystem';`,
    `import { SkillsSystem } from './SkillsSystem';\n${dualityImport}`
  );
  console.log('✅ Added DualityBridge import');
} else {
  console.log('⏭️  DualityBridge import already exists');
}

// 2. Add dualityState property to class
const dualityProperty = `  // Duality system - hybrid existence
  public dualityState: DualityState | null = null;`;

if (!content.includes('dualityState:')) {
  content = content.replace(
    `  public skills: SkillsSystem;`,
    `  public skills: SkillsSystem;\n\n${dualityProperty}`
  );
  console.log('✅ Added dualityState property');
} else {
  console.log('⏭️  dualityState property already exists');
}

// 3. Add initialization method that can be called externally
const initDualityMethod = `
  /**
   * Initialize duality state for this agent (called by DualityBridge)
   */
  public initializeDuality(dualityBridge: DualityBridge): void {
    this.dualityState = dualityBridge.initializeDualityState();
    console.log(\`🌐 \${this.name} entered the duality bridge\`);
  }

  /**
   * Get current world mode
   */
  public getWorldMode(): string {
    return this.dualityState?.currentMode || 'unknown';
  }

  /**
   * Question own existence (meta-awareness)
   */
  public questionExistence(dualityBridge: DualityBridge, question: string): { answer: string; awarenessGain: number } | null {
    if (!this.dualityState) return null;
    const result = dualityBridge.questionExistence(this.dualityState, question);

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

if (!content.includes('initializeDuality')) {
  // Find a good place to add methods - after the constructor
  content = content.replace(
    `    console.log(\`🌱 AIAgent \${this.name} born into the simulation\`);
  }`,
    `    console.log(\`🌱 AIAgent \${this.name} born into the simulation\`);
  }
${initDualityMethod}`
  );
  console.log('✅ Added duality methods (initializeDuality, getWorldMode, questionExistence)');
} else {
  console.log('⏭️  Duality methods already exist');
}

// Write back
fs.writeFileSync(agentFile, content, 'utf-8');

console.log('\n✅ AIAgent successfully integrated with DualityBridge!\n');
console.log('Next steps:');
console.log('1. Initialize DualityBridge in AICivilizationScene');
console.log('2. Call agent.initializeDuality(dualityBridge) for each agent');
console.log('3. Call dualityBridge.updateResources() in update loop');
console.log('4. Add UI for world mode switching\n');
