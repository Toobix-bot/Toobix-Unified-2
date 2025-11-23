const fs = require('fs');
const path = require('path');

console.log('🎨 Integrating Visual Duality System...\n');

const sceneFile = path.join(__dirname, 'src', 'scenes', 'AICivilizationScene.ts');
let content = fs.readFileSync(sceneFile, 'utf-8');

// 1. Add import for VisualDuality
const visualImport = `import { VisualDuality } from '../systems/VisualDuality';`;

if (!content.includes('VisualDuality')) {
  content = content.replace(
    `import { DualityBridge, WorldMode } from '../systems/DualityBridge';`,
    `import { DualityBridge, WorldMode } from '../systems/DualityBridge';\n${visualImport}`
  );
  console.log('✅ Added VisualDuality import');
} else {
  console.log('⏭️  VisualDuality import already exists');
}

// 2. Add visualDuality property
const visualProperty = `  private visualDuality!: VisualDuality;`;

if (!content.includes('visualDuality!:')) {
  content = content.replace(
    `  private dualityBridge!: DualityBridge;`,
    `  private dualityBridge!: DualityBridge;\n${visualProperty}`
  );
  console.log('✅ Added visualDuality property');
} else {
  console.log('⏭️  visualDuality property already exists');
}

// 3. Initialize visualDuality in create()
const visualInit = `    this.visualDuality = new VisualDuality(this);
    console.log('🎨 Visual Duality initialized - agents will now morph between forms');`;

if (!content.includes('Visual Duality initialized')) {
  content = content.replace(
    `    this.dualityBridge = new DualityBridge(this);`,
    `    this.dualityBridge = new DualityBridge(this);\n${visualInit}`
  );
  console.log('✅ Added visualDuality initialization');
} else {
  console.log('⏭️  visualDuality initialization already exists');
}

// 4. Replace simple circle sprite with visual form
const oldSpriteCreation = `      // Visual representation (simple circle for now)
      const sprite = this.add.circle(config.x, config.y, 10, 0x00d4ff);
      sprite.setStrokeStyle(2, 0xffffff);`;

const newFormCreation = `      // Visual form based on duality state
      const visualForm = this.visualDuality.createAgentForm(
        agent.id,
        config.x,
        config.y,
        agent.dualityState?.currentMode || WorldMode.HYBRID_SPACE
      );`;

if (content.includes('simple circle for now')) {
  content = content.replace(oldSpriteCreation, newFormCreation);
  console.log('✅ Replaced simple sprite with visual form');
} else {
  console.log('⚠️  Could not find sprite creation to replace');
}

// 5. Update sprite references to use form container
const oldSpriteStore = `      // Store sprite reference in agent (hacky but works for now)
      (agent as any).sprite = sprite;`;

const newFormStore = `      // Store visual form reference
      (agent as any).visualForm = visualForm;
      (agent as any).sprite = visualForm.container; // For compatibility`;

if (content.includes('hacky but works for now')) {
  content = content.replace(oldSpriteStore, newFormStore);
  console.log('✅ Updated sprite storage to visual form');
} else {
  console.log('⚠️  Could not find sprite storage');
}

// 6. Add visual form updates in update loop
const visualUpdateCode = `    // Update visual forms based on duality state
    this.visualDuality.updateAll(
      this.agents.map(a => ({ id: a.id, dualityState: a.dualityState })),
      delta
    );

`;

if (!content.includes('updateAll')) {
  content = content.replace(
    `    // Update duality resources for all agents`,
    `${visualUpdateCode}    // Update duality resources for all agents`
  );
  console.log('✅ Added visual form updates to update loop');
} else {
  console.log('⏭️  Visual form updates already exist');
}

// 7. Remove old color-based-on-emotion code (visual forms handle this now)
const oldColorCode = `        // Color based on emotional state
        const emotionIntensity = Math.max(agent.emotions.joy, agent.emotions.sadness, agent.emotions.anger);
        const color =
          agent.emotions.joy > 50
            ? 0x4caf50 // Happy = Green
            : agent.emotions.sadness > 50
              ? 0x2196f3 // Sad = Blue
              : emotionIntensity > 0
                ? 0xffeb3b // Anxious = Yellow
                : 0xff5722; // Suffering = Red
        sprite.setFillStyle(color);`;

if (content.includes('Color based on emotional state')) {
  content = content.replace(oldColorCode, `        // Visual form handles appearance based on world mode`);
  console.log('✅ Removed old color code (visual forms handle this)');
} else {
  console.log('⚠️  Old color code not found');
}

// 8. Update movement to use container position
const oldMovementComment = `      // Update visual position with INTELLIGENT MOVEMENT
      const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;`;

const newMovementComment = `      // Update visual position with INTELLIGENT MOVEMENT
      const visualForm = (agent as any).visualForm;
      const sprite = visualForm?.container || (agent as any).sprite;`;

if (content.includes('Update visual position with INTELLIGENT MOVEMENT')) {
  content = content.replace(oldMovementComment, newMovementComment);
  console.log('✅ Updated movement to use visual form container');
} else {
  console.log('⚠️  Could not update movement code');
}

fs.writeFileSync(sceneFile, content, 'utf-8');

console.log('\n✅ Visual Duality fully integrated!\n');
console.log('Features:');
console.log('  • Three distinct visual forms (Human, KI, Hybrid)');
console.log('  • Smooth morphing transitions (1 second)');
console.log('  • Dynamic animations based on resources');
console.log('  • Automatic form updates with world mode');
console.log('  • Glitch effects, pulsing, shimmering\n');

console.log('Visual Modes:');
console.log('  🧑 HUMAN: Pink circles, soft glow, breathing pulse');
console.log('  🤖 KI: Cyan hexagons, sharp edges, glitch effects');
console.log('  🌐 HYBRID: Purple morphing, iridescent shimmer\n');

console.log('Press W to see agents morph between forms!\n');
