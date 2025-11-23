#!/usr/bin/env node

/**
 * Integration Script for Life Systems
 * This script automatically integrates BuildingSystem, GiftEconomy, and ReproductionSystem
 * into AICivilizationScene.ts
 */

const fs = require('fs');
const path = require('path');

const sceneFile = path.join(__dirname, 'src', 'scenes', 'AICivilizationScene.ts');

console.log('🏗️ Integrating Life Systems into AICivilizationScene...');
console.log(`📁 File: ${sceneFile}`);

// Read the file
let content = fs.readFileSync(sceneFile, 'utf-8');

// 1. Add imports
console.log('1️⃣ Adding imports...');
const importsToAdd = `import { BuildingSystem } from '../systems/BuildingSystem';
import { GiftEconomy } from '../systems/GiftEconomy';
import { ReproductionSystem } from '../systems/ReproductionSystem';
`;

content = content.replace(
  /(import { ToobixCollaborationHub } from '\.\.\/systems\/ToobixCollaborationHub';)/,
  `$1\n${importsToAdd}`
);

// 2. Add system properties
console.log('2️⃣ Adding system properties...');
const systemProperties = `
  // 🏗️ LIFE SYSTEMS - Buildings, Gifts, Reproduction
  private buildingSystem!: BuildingSystem;
  private giftEconomy!: GiftEconomy;
  private reproductionSystem!: ReproductionSystem;

  // UI for life systems
  private lifeSystemsPanel!: Phaser.GameObjects.Container;
  private lifeSystemsText!: Phaser.GameObjects.Text;
`;

content = content.replace(
  /(private toobixHub!: ToobixCollaborationHub;)/,
  `$1\n${systemProperties}`
);

// 3. Add timers
console.log('3️⃣ Adding timers...');
const timers = `  private buildingUpdateTimer: number = 0;
  private giftUpdateTimer: number = 0;
  private reproductionUpdateTimer: number = 0;
`;

content = content.replace(
  /(private toobixInteractionTimer: number = 0;)/,
  `$1\n${timers}`
);

// 4. Add system initialization
console.log('4️⃣ Adding system initialization...');
const systemInit = `
    // 🏗️ Initialize LIFE Systems
    this.buildingSystem = new BuildingSystem(this);
    this.giftEconomy = new GiftEconomy();
    this.reproductionSystem = new ReproductionSystem(this);

    // Initialize life cycles for existing agents
    this.agents.forEach(agent => {
      this.reproductionSystem.initializeLifeCycle(agent);
    });

    console.log('🏗️ LIFE SYSTEMS ONLINE - Buildings, Gifts, and Reproduction active!');
`;

content = content.replace(
  /(console\.log\('✨ META SYSTEMS ONLINE - Toobix ist jetzt aktiver Mitgestalter!'\);)/,
  `$1\n${systemInit}`
);

// 5. Update the update() method
console.log('5️⃣ Adding update loop logic...');
const updateLoop = `
    this.buildingUpdateTimer += delta;
    this.giftUpdateTimer += delta;
    this.reproductionUpdateTimer += delta;

    // 🏗️ Update Building System (every 2 seconds)
    if (this.buildingUpdateTimer > 2000) {
      this.buildingSystem.update(delta, this.agents);
      this.buildingUpdateTimer = 0;
    }

    // 🎁 Update Gift Economy (every 5 seconds)
    if (this.giftUpdateTimer > 5000) {
      this.checkGiftingOpportunities();
      this.giftUpdateTimer = 0;
    }

    // 👶 Update Reproduction System
    if (this.reproductionUpdateTimer > 1000) {
      this.reproductionSystem.updateLifeCycles(this.agents);
      const newborns = this.reproductionSystem.updatePregnancies(this.agents);
      if (newborns.length > 0) {
        newborns.forEach(child => {
          this.spawnChildAgent(child);
        });
      }
      this.checkReproductionOpportunities();
      this.reproductionUpdateTimer = 0;
    }
`;

content = content.replace(
  /(this\.toobixInteractionTimer \+= delta;)/,
  `$1\n${updateLoop}`
);

// 6. Add call to life systems UI update in updateUI
console.log('6️⃣ Adding UI update call...');
content = content.replace(
  /(\/\/ Update individual agent status\n    this\.agents\.forEach)/,
  `// Update life systems UI\n    this.updateLifeSystemsUI();\n\n    $1`
);

// 7. Add call to createLifeSystemsPanel in createUI
console.log('7️⃣ Adding UI panel creation call...');
content = content.replace(
  /(\/\/ Setup Meta-Access hotkeys\n    this\.setupMetaAccessControls\(\);)/,
  `$1\n\n    // Setup Life Systems Panel\n    this.createLifeSystemsPanel();\n\n    // Setup Life Systems Hotkeys\n    this.setupLifeSystemsControls();`
);

// 8. Update controls text
console.log('8️⃣ Updating controls text...');
content = content.replace(
  /'SPACE: Pause \| ESC: Return to Hub \| H: Divine Heal \| R: Spawn Resource \| I: Inspire'/,
  `'SPACE: Pause | ESC: Return | H: Heal | R: Resource | I: Inspire | M: Meta | Q: Query\\nB: Build | G: Gift | P: Partnership | C: Conceive'`
);

// 9. Add all helper methods before the final closing brace
console.log('9️⃣ Adding helper methods...');
const helperMethods = `
  /**
   * Check for gifting opportunities between agents
   */
  private checkGiftingOpportunities() {
    const alive = this.agents.filter(a => !a.isDead);
    if (alive.length < 2) return;

    alive.forEach(agent => {
      if (agent.resources.energy > 70 || agent.resources.matter > 70) {
        const nearby = alive.filter(other => {
          if (other.id === agent.id) return false;
          const sprite1 = (agent as any).sprite;
          const sprite2 = (other as any).sprite;
          if (!sprite1 || !sprite2) return false;

          const distance = Phaser.Math.Distance.Between(
            sprite1.x, sprite1.y, sprite2.x, sprite2.y
          );
          return distance < 200;
        });

        if (nearby.length > 0 && Math.random() < 0.1) {
          const recipient = nearby[Math.floor(Math.random() * nearby.length)];
          const relation = agent.relationships.get(recipient.id);
          if (relation && relation.trust > 50) {
            this.performGift(agent, recipient);
          }
        }
      }
    });
  }

  /**
   * Perform a gift between agents
   */
  private performGift(from: AIAgent, to: AIAgent) {
    let resourceType: 'energy' | 'matter' = 'energy';
    let amount = 10;

    if (to.needs.physical < 50 && from.resources.energy > 50) {
      resourceType = 'energy';
      amount = Math.min(20, from.resources.energy * 0.2);
    } else if (to.resources.matter < 30 && from.resources.matter > 50) {
      resourceType = 'matter';
      amount = Math.min(15, from.resources.matter * 0.2);
    }

    const motivation: 'abundance' | 'love' | 'gratitude' | 'empathy' | 'joy' | 'duty' =
      from.emotions.love > 70 ? 'love' :
      from.emotions.gratitude > 60 ? 'gratitude' :
      from.emotions.joy > 70 ? 'joy' :
      'empathy';

    const gift = this.giftEconomy.giveGift(
      from,
      to,
      {
        type: resourceType,
        amount,
        quality: 70 + Math.random() * 30,
        description: \`\${amount.toFixed(0)} units of \${resourceType}\`,
      },
      motivation,
      \`I want you to have this\`
    );

    if (gift) {
      this.showMessage(
        \`🎁 \${from.name} gave \${to.name} \${resourceType} out of \${motivation}\`,
        3000
      );

      const sprite1 = (from as any).sprite;
      const sprite2 = (to as any).sprite;
      if (sprite1 && sprite2) {
        this.showSpeechBubble(sprite1, '🎁');
        this.showSpeechBubble(sprite2, '💝');
      }
    }
  }

  /**
   * Check for reproduction opportunities
   */
  private checkReproductionOpportunities() {
    const alive = this.agents.filter(a => !a.isDead);
    if (alive.length < 2) return;

    if (Math.random() < 0.02) {
      const agent = alive[Math.floor(Math.random() * alive.length)];
      const potentialPartners = this.reproductionSystem.findPotentialPartners(agent, alive);

      if (potentialPartners.length > 0 && Math.random() < 0.3) {
        const partner = potentialPartners[0];
        const partnership = this.reproductionSystem.formPartnership([agent, partner]);

        if (partnership) {
          this.showMessage(
            \`💕 \${agent.name} and \${partner.name} formed a partnership!\`,
            4000
          );
        }
      }
    }
  }

  /**
   * Spawn a newborn child agent visually
   */
  private spawnChildAgent(child: AIAgent) {
    const parents = (child as any).parents || [];
    let x = 500;
    let y = 400;

    if (parents.length > 0) {
      const parentSprites = parents
        .map((pid: string) => this.agents.find(a => a.id === pid))
        .filter((a: any) => a)
        .map((a: any) => (a as any).sprite)
        .filter((s: any) => s);

      if (parentSprites.length > 0) {
        x = parentSprites.reduce((sum: number, s: any) => sum + s.x, 0) / parentSprites.length;
        y = parentSprites.reduce((sum: number, s: any) => sum + s.y, 0) / parentSprites.length;
        x += Phaser.Math.Between(-30, 30);
        y += Phaser.Math.Between(-30, 30);
      }
    }

    const genetics = (child as any).genetics;
    const hue = genetics?.colorHue || 180;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 0.9).color;
    const size = (genetics?.size || 1) * 8;

    const sprite = this.add.circle(x, y, size, color);
    sprite.setStrokeStyle(2, 0xffffff);

    const nameText = this.add.text(x, y - 20, child.name, {
      fontSize: '10px',
      color: '#ffeb3b',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 3, y: 2 },
    });
    nameText.setOrigin(0.5);

    const actionText = this.add.text(x, y + 20, '👶 Baby', {
      fontSize: '9px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 3, y: 2 },
    });
    actionText.setOrigin(0.5);

    (child as any).sprite = sprite;
    (child as any).nameText = nameText;
    (child as any).actionText = actionText;

    this.agents.push(child);

    const parentNames = parents
      .map((pid: string) => this.agents.find(a => a.id === pid)?.name)
      .filter((n: any) => n)
      .join(' & ');

    this.showMessage(\`👶 \${child.name} was born to \${parentNames}!\`, 5000);
    console.log(\`👶 \${child.name} born! Parents: \${parentNames}\`);
  }

  /**
   * Create Life Systems UI Panel
   */
  private createLifeSystemsPanel() {
    const panelX = 900;
    const panelY = 650;

    const panel = this.add.rectangle(panelX, panelY, 350, 120, 0x000000, 0.85);
    panel.setScrollFactor(0);
    panel.setStrokeStyle(2, 0x4CAF50);

    const title = this.add.text(panelX - 160, panelY - 50, '🏗️ LIFE SYSTEMS', {
      fontSize: '14px',
      color: '#4CAF50',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setScrollFactor(0);

    this.lifeSystemsText = this.add.text(panelX - 150, panelY - 25, 'Initializing...', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.lifeSystemsText.setScrollFactor(0);
  }

  /**
   * Update Life Systems UI
   */
  private updateLifeSystemsUI() {
    if (!this.lifeSystemsText) return;

    const buildingStats = this.buildingSystem.getStatistics();
    const giftStats = this.giftEconomy.getStatistics();
    const reproStats = this.reproductionSystem.getStatistics();

    const text = \`Buildings: \${buildingStats.total} | In Progress: \${buildingStats.plans.active}
Gifts: \${giftStats.total_gifts} | Avg Bond: +\${giftStats.average_bond_strength.toFixed(1)}
Partnerships: \${reproStats.totalPartnerships} | Children: \${reproStats.totalBirths}
Life Stages: \${reproStats.lifeCycles.children}👶 \${reproStats.lifeCycles.adolescents}🌱 \${reproStats.lifeCycles.adults}💪 \${reproStats.lifeCycles.elders}👴\`;

    this.lifeSystemsText.setText(text);
  }

  /**
   * Setup Life Systems Controls
   */
  private setupLifeSystemsControls() {
    // B key - Trigger Building Project
    this.input.keyboard?.on('keydown-B', () => {
      const alive = this.agents.filter(a => !a.isDead);
      if (alive.length > 0) {
        const agent = alive[Math.floor(Math.random() * alive.length)];
        const sprite = (agent as any).sprite;

        const buildingTypes = ['shelter', 'workshop', 'gathering_place', 'library', 'garden', 'temple', 'observatory', 'monument'];
        const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)] as any;

        const plan = this.buildingSystem.initiateBuildingProject(
          agent,
          type,
          \`A place for \${type.replace('_', ' ')}\`,
          sprite ? sprite.x : 500,
          sprite ? sprite.y : 400
        );

        if (plan) {
          this.showMessage(\`🏗️ \${agent.name} started building a \${type}!\`, 3000);
        }
      }
    });

    // G key - Trigger Gift
    this.input.keyboard?.on('keydown-G', () => {
      const alive = this.agents.filter(a => !a.isDead);
      if (alive.length >= 2) {
        const giver = alive[Math.floor(Math.random() * alive.length)];
        const others = alive.filter(a => a.id !== giver.id);
        const receiver = others[Math.floor(Math.random() * others.length)];

        this.performGift(giver, receiver);
      }
    });

    // P key - Form Partnership
    this.input.keyboard?.on('keydown-P', () => {
      const alive = this.agents.filter(a => !a.isDead);
      if (alive.length >= 2) {
        const agent1 = alive[Math.floor(Math.random() * alive.length)];
        const potentialPartners = this.reproductionSystem.findPotentialPartners(agent1, alive);

        if (potentialPartners.length > 0) {
          const agent2 = potentialPartners[0];
          const partnership = this.reproductionSystem.formPartnership([agent1, agent2]);

          if (partnership) {
            this.showMessage(\`💕 \${agent1.name} & \${agent2.name} formed partnership!\`, 4000);
          } else {
            this.showMessage(\`⚠️ Partnership failed - bonds not strong enough\`, 2000);
          }
        } else {
          this.showMessage(\`⚠️ No suitable partners found for \${agent1.name}\`, 2000);
        }
      }
    });

    // C key - Conceive Child
    this.input.keyboard?.on('keydown-C', () => {
      const alive = this.agents.filter(a => !a.isDead);
      if (alive.length >= 2) {
        const agent1 = alive[Math.floor(Math.random() * alive.length)];
        const others = alive.filter(a => {
          const rel = agent1.relationships.get(a.id);
          return rel && rel.trust > 70;
        });

        if (others.length > 0) {
          const agent2 = others[0];
          this.showMessage(\`👶 \${agent1.name} & \${agent2.name} are expecting!\`, 4000);
        }
      }
    });
  }
`;

content = content.replace(
  /(\n}\n)$/,
  `${helperMethods}\n}\n`
);

// Write the updated file
fs.writeFileSync(sceneFile, content, 'utf-8');

console.log('✅ Integration complete!');
console.log('');
console.log('📦 Added:');
console.log('  - BuildingSystem, GiftEconomy, ReproductionSystem imports');
console.log('  - System properties and timers');
console.log('  - System initialization in create()');
console.log('  - Update loop logic');
console.log('  - Helper methods for gifts, buildings, reproduction');
console.log('  - Life Systems UI panel');
console.log('  - Hotkeys: B (Build), G (Gift), P (Partnership), C (Conceive)');
console.log('');
console.log('🎮 New Hotkeys:');
console.log('  B - Trigger building project');
console.log('  G - Trigger gift');
console.log('  P - Form partnership');
console.log('  C - Conceive child');
console.log('');
console.log('🚀 Ready to run! Start with: bun run dev');
