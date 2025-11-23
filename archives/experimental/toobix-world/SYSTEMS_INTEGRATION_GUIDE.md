# Systems Integration Guide
## Building, Gift Economy & Reproduction Systems

This guide shows how to integrate the three new emergent systems into AICivilizationScene.

## 1. Import the Systems

Add to imports in `src/scenes/AICivilizationScene.ts`:

```typescript
import { BuildingSystem } from '../systems/BuildingSystem';
import { GiftEconomy } from '../systems/GiftEconomy';
import { ReproductionSystem } from '../systems/ReproductionSystem';
```

## 2. Add System Properties

Add to the class private members (after existing meta systems):

```typescript
export class AICivilizationScene extends Phaser.Scene {
  // ... existing systems ...

  // 🏗️ LIFE SYSTEMS - Buildings, Gifts, Reproduction
  private buildingSystem!: BuildingSystem;
  private giftEconomy!: GiftEconomy;
  private reproductionSystem!: ReproductionSystem;

  // UI for life systems
  private lifeSystemsPanel!: Phaser.GameObjects.Container;
  private lifeSystemsText!: Phaser.GameObjects.Text;

  // Timers
  private buildingUpdateTimer: number = 0;
  private giftUpdateTimer: number = 0;
  private reproductionUpdateTimer: number = 0;
```

## 3. Initialize Systems in create()

Add after other system initializations:

```typescript
create() {
  // ... existing initialization ...

  // 🏗️ Initialize LIFE Systems
  this.buildingSystem = new BuildingSystem(this);
  this.giftEconomy = new GiftEconomy();
  this.reproductionSystem = new ReproductionSystem(this);

  // Initialize life cycles for existing agents
  this.agents.forEach(agent => {
    this.reproductionSystem.initializeLifeCycle(agent);
  });

  console.log('🏗️ LIFE SYSTEMS ONLINE - Buildings, Gifts, and Reproduction active!');

  // ... rest of create() ...
}
```

## 4. Update Loop Integration

Add to the `update()` method:

```typescript
update(time: number, delta: number) {
  // ... existing update code ...

  this.buildingUpdateTimer += delta;
  this.giftUpdateTimer += delta;
  this.reproductionUpdateTimer += delta;

  // 🏗️ Update Building System (every 2 seconds)
  if (this.buildingUpdateTimer > 2000) {
    this.buildingSystem.update(delta, this.agents);
    this.buildingUpdateTimer = 0;
  }

  // 🎁 Update Gift Economy (every 5 seconds - check for gifting opportunities)
  if (this.giftUpdateTimer > 5000) {
    this.checkGiftingOpportunities();
    this.giftUpdateTimer = 0;
  }

  // 👶 Update Reproduction System
  if (this.reproductionUpdateTimer > 1000) {
    // Update life cycles
    this.reproductionSystem.updateLifeCycles(this.agents);

    // Check for births
    const newborns = this.reproductionSystem.updatePregnancies(this.agents);
    if (newborns.length > 0) {
      newborns.forEach(child => {
        this.spawnChildAgent(child);
      });
    }

    // Check partnership formation and reproduction
    this.checkReproductionOpportunities();

    this.reproductionUpdateTimer = 0;
  }

  // Update life systems UI
  this.updateLifeSystemsUI();

  // ... rest of update() ...
}
```

## 5. Add Helper Methods

Add these new methods to the class:

```typescript
/**
 * Check for gifting opportunities between agents
 */
private checkGiftingOpportunities() {
  const alive = this.agents.filter(a => !a.isDead);
  if (alive.length < 2) return;

  alive.forEach(agent => {
    // Agent considers giving if they have abundance
    if (agent.resources.energy > 70 || agent.resources.matter > 70) {
      // Find nearby agents with needs
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

      if (nearby.length > 0) {
        // Pick one to potentially gift
        const recipient = nearby[Math.floor(Math.random() * nearby.length)];

        // Check if they should gift (based on relationship and needs)
        const relation = agent.relationships.get(recipient.id);
        if (relation && relation.trust > 50 && Math.random() < 0.2) {
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
  // Determine what to give based on recipient's needs
  let resourceType: 'energy' | 'matter' | 'knowledge' = 'energy';
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
      description: `${amount.toFixed(0)} units of ${resourceType}`,
    },
    motivation,
    `I want you to have this`
  );

  if (gift) {
    this.showMessage(
      `🎁 ${from.name} gave ${to.name} ${resourceType} out of ${motivation}`,
      3000
    );

    // Visual effect
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

  // Check existing partnerships for desire to have children
  alive.forEach(agent => {
    const potentialPartners = this.reproductionSystem.findPotentialPartners(agent, alive);

    if (potentialPartners.length > 0 && Math.random() < 0.05) {
      // Try to form partnership
      const partner = potentialPartners[0];
      const partnership = this.reproductionSystem.formPartnership([agent, partner]);

      if (partnership) {
        this.showMessage(
          `💕 ${agent.name} and ${partner.name} formed a partnership!`,
          4000
        );
      }
    }
  });

  // Check if any partnerships want children
  // Note: You'd iterate through partnerships from reproductionSystem
  // This is simplified - in real code you'd access partnerships directly
}

/**
 * Spawn a newborn child agent visually
 */
private spawnChildAgent(child: AIAgent) {
  // Find parent positions for spawn location
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

  // Create visuals
  const genetics = (child as any).genetics;
  const hue = genetics?.colorHue || 180;
  const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 0.9).color;
  const size = (genetics?.size || 1) * 8; // Smaller for children

  const sprite = this.add.circle(x, y, size, color);
  sprite.setStrokeStyle(2, 0xffffff);

  const nameText = this.add.text(x, y - 20, child.name, {
    fontSize: '10px',
    color: '#ffeb3b', // Gold for newborns
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

  // Show birth message
  const parents = (child as any).parents || [];
  const parentNames = parents
    .map((pid: string) => this.agents.find(a => a.id === pid)?.name)
    .filter((n: any) => n)
    .join(' & ');

  this.showMessage(
    `👶 ${child.name} was born to ${parentNames}!`,
    5000
  );

  console.log(`👶 ${child.name} born! Parents: ${parentNames}`);
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

  const text = `Buildings: ${buildingStats.total} | In Progress: ${buildingStats.plans.active}
Gifts: ${giftStats.total_gifts} | Avg Bond: +${giftStats.average_bond_strength.toFixed(1)}
Partnerships: ${reproStats.totalPartnerships} | Children: ${reproStats.totalBirths}
Life Stages: ${reproStats.lifeCycles.children}👶 ${reproStats.lifeCycles.adolescents}🌱 ${reproStats.lifeCycles.adults}💪 ${reproStats.lifeCycles.elders}👴`;

  this.lifeSystemsText.setText(text);
}
```

## 6. Add Hotkeys for Testing

Add to `createUI()` or `setupDivineInterventionControls()`:

```typescript
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
      `A place for ${type.replace('_', ' ')}`,
      sprite ? sprite.x : 500,
      sprite ? sprite.y : 400
    );

    if (plan) {
      this.showMessage(`🏗️ ${agent.name} started building a ${type}!`, 3000);
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
        this.showMessage(`💕 ${agent1.name} & ${agent2.name} formed partnership!`, 4000);
      } else {
        this.showMessage(`⚠️ Partnership failed - bonds not strong enough`, 2000);
      }
    } else {
      this.showMessage(`⚠️ No suitable partners found for ${agent1.name}`, 2000);
    }
  }
});

// C key - Conceive Child (if partnership exists)
this.input.keyboard?.on('keydown-C', () => {
  // This requires access to partnerships - simplified version
  const alive = this.agents.filter(a => !a.isDead);
  if (alive.length >= 2) {
    // Find two agents with strong relationships
    const agent1 = alive[Math.floor(Math.random() * alive.length)];
    const others = alive.filter(a => {
      const rel = agent1.relationships.get(a.id);
      return rel && rel.trust > 70;
    });

    if (others.length > 0) {
      const agent2 = others[0];
      this.showMessage(`👶 ${agent1.name} & ${agent2.name} are expecting!`, 4000);
      // In full implementation, you'd call reproductionSystem.conceiveOffspring()
    }
  }
});
```

## 7. Update Controls Display

Update the controls text to include new hotkeys:

```typescript
const controls = this.add.text(
  20,
  700,
  'SPACE: Pause | ESC: Return | H: Heal | R: Resource | I: Inspire | M: Meta Device | Q: Meta Query\nB: Build | G: Gift | P: Partnership | C: Conceive',
  {
    fontSize: '12px',
    color: '#888888',
    fontFamily: 'monospace',
    backgroundColor: '#00000088',
    padding: { x: 8, y: 5 },
  }
);
```

## System Features Summary

### BuildingSystem
- **8 building types**: shelter, workshop, gathering_place, library, garden, temple, observatory, monument
- **Collaborative building**: Multiple agents can work together
- **Emergent properties**: Buildings gain unique characteristics
- **Visual representation**: Each building spawned in Phaser scene
- **Degradation**: Buildings degrade over time if not maintained

### GiftEconomy
- **Voluntary giving**: No forced transactions
- **Multiple motivations**: abundance, love, gratitude, empathy, joy, duty
- **Bond strengthening**: Gifts strengthen relationships
- **Reciprocity**: Natural reciprocation based on gratitude
- **Reputation system**: Tracks generosity and reliability

### ReproductionSystem
- **Partnership formation**: 2-4 agents can form partnerships
- **Genetic inheritance**: Children inherit blended traits with mutations
- **Life stages**: Child → Adolescent → Adult → Elder
- **Parent-child teaching**: Parents teach skills with learning bonuses
- **Family bonds**: Track parents, children, siblings
- **Emergent personalities**: Each child unique based on genetics

## Integration Checklist

- [ ] Add imports
- [ ] Add system properties
- [ ] Initialize systems in create()
- [ ] Add update loop logic
- [ ] Add helper methods
- [ ] Create life systems UI panel
- [ ] Add hotkeys for testing
- [ ] Update controls display
- [ ] Call createLifeSystemsPanel() in createUI()
- [ ] Test each system with hotkeys

## Testing the Systems

1. **Start the simulation** and press:
   - `B` - Agent starts building
   - `G` - Agent gives gift
   - `P` - Agents form partnership
   - `C` - Partners conceive child

2. **Watch for emergent behavior**:
   - Agents with abundance may gift spontaneously
   - Close agents with strong bonds may partner
   - Partners may decide to have children based on emotional state

3. **Check the Life Systems panel** for statistics

## Notes

- The systems are designed to be emergent - don't force interactions
- Let agents make decisions based on their needs and relationships
- The UI provides visibility into system state
- All three systems integrate with the existing chronicle and skills systems
- Buildings, gifts, and children create lasting legacies in agent chronicles
