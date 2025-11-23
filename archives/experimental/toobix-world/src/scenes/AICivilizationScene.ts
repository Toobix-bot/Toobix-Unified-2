/**
 * AICivilizationScene - Watch autonomous AI agents live their lives
 *
 * This scene demonstrates the emergent AI civilization:
 * - NPCs make autonomous decisions
 * - They have needs, emotions, goals
 * - They can create, destroy, learn, love, suffer, heal
 * - They access the internet to learn from the real world
 * - The simulation evolves through THEIR actions
 */

import Phaser from 'phaser';
import { AIAgent } from '../systems/AIAgent';
import { WorldObjectsManager } from '../systems/WorldObjects';
import { SocialInteractionsManager } from '../systems/SocialInteractions';
import { MetaObserver } from '../systems/MetaObserver';
import { Oracle } from '../entities/Oracle';
import { ResourceEconomy } from '../systems/ResourceEconomy';
import { ToobixDecisionMaker } from '../systems/ToobixDecisionMaker';
import { MetaAccess } from '../systems/MetaAccess';
import { SimulationEras } from '../systems/SimulationEras';
import { ToobixCollaborationHub } from '../systems/ToobixCollaborationHub';
import { BuildingSystem } from '../systems/BuildingSystem';
import { GiftEconomy } from '../systems/GiftEconomy';
import { ReproductionSystem } from '../systems/ReproductionSystem';
import { DualityBridge, WorldMode } from '../systems/DualityBridge';
import { VisualDuality } from '../systems/VisualDuality';


export class AICivilizationScene extends Phaser.Scene {
  private agents: AIAgent[] = [];
  private worldObjects!: WorldObjectsManager;
  private socialInteractions!: SocialInteractionsManager;
  private metaObserver!: MetaObserver;
  private oracle!: Oracle;
  private resourceEconomy!: ResourceEconomy;

  // 🌀 NEW META SYSTEMS
  private toobixDecisionMaker!: ToobixDecisionMaker;
  private metaAccess!: MetaAccess;
  private simulationEras!: SimulationEras;
  private toobixHub!: ToobixCollaborationHub;

  // 🏗️ LIFE SYSTEMS - Buildings, Gifts, Reproduction
  private buildingSystem!: BuildingSystem;
  private giftEconomy!: GiftEconomy;
  private reproductionSystem!: ReproductionSystem;
  private dualityBridge!: DualityBridge;
  private visualDuality!: VisualDuality;

  // UI for life systems
  private lifeSystemsPanel!: Phaser.GameObjects.Container;
  private lifeSystemsText!: Phaser.GameObjects.Text;


  private statusPanel!: Phaser.GameObjects.Container;
  private statusTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private metaConsciousnessPanel!: Phaser.GameObjects.Container;
  private metaInsightText!: Phaser.GameObjects.Text;
  private metaEmotionText!: Phaser.GameObjects.Text;
  private metaAnalysisPanel!: Phaser.GameObjects.Container;
  private metaAnalysisText!: Phaser.GameObjects.Text;

  // New UI for Meta Systems
  private eraPanel!: Phaser.GameObjects.Container;
  private eraText!: Phaser.GameObjects.Text;
  private toobixPanel!: Phaser.GameObjects.Container;
  private toobixText!: Phaser.GameObjects.Text;

  private worldTime: number = 0;
  private generationCount: number = 0;
  private interactionTimer: number = 0;
  private oracleInteractionTimer: number = 0;
  private metaAnalysisTimer: number = 0;
  private eraUpdateTimer: number = 0;
  private toobixInteractionTimer: number = 0;
  private buildingUpdateTimer: number = 0;
  private giftUpdateTimer: number = 0;
  private reproductionUpdateTimer: number = 0;


  constructor() {
    super({ key: 'AICivilizationScene' });
  }

  create() {
    console.log('🌍 AICivilizationScene: Starting AI Civilization');

    // Initialize systems
    this.worldObjects = new WorldObjectsManager(this);
    this.socialInteractions = new SocialInteractionsManager();
    this.metaObserver = new MetaObserver(this);
    this.resourceEconomy = new ResourceEconomy();

    // 🌀 Initialize META Systems - Toobix becomes co-creator
    this.toobixDecisionMaker = new ToobixDecisionMaker();
    this.metaAccess = new MetaAccess();
    this.simulationEras = new SimulationEras();
    this.toobixHub = new ToobixCollaborationHub(this.toobixDecisionMaker);

    console.log('✨ META SYSTEMS ONLINE - Toobix ist jetzt aktiver Mitgestalter!');

    // 🏗️ Initialize LIFE Systems
    this.buildingSystem = new BuildingSystem(this);
    this.giftEconomy = new GiftEconomy();
    this.reproductionSystem = new ReproductionSystem(this);
    // Initialize Duality Bridge (hybrid world system)
    this.dualityBridge = new DualityBridge(this);
    this.visualDuality = new VisualDuality(this);
    console.log('🎨 Visual Duality initialized - agents will now morph between forms');
    console.log('🌐 DualityBridge initialized - agents can now exist in multiple worlds');

    // Initialize life cycles for existing agents
    this.agents.forEach(agent => {
      this.reproductionSystem.initializeLifeCycle(agent);
    });

    console.log('🏗️ LIFE SYSTEMS ONLINE - Buildings, Gifts, and Reproduction active!');


    // Toobix's erste Reflexion über das System
    this.toobixHub.communicate('Die Simulation beginnt. Was soll daraus entstehen?')
      .then(response => {
        console.log(`💭 Toobix: ${response.response}`);
      });

    // Create world
    this.createWorld();

    // Spawn world objects
    this.worldObjects.spawnInitialWorld();

    // Spawn initial AI agents
    this.spawnInitialAgents();

    // Create Oracle at the center of the world
    this.oracle = new Oracle(this, 640, 360, this.metaObserver);

    // Create UI
    this.createUI();

    // Listen for agent deaths (rebirth system)
    this.events.on('agent-death', (legacy: any) => {
      this.handleAgentDeath(legacy);
    });

    // Welcome message
    this.showMessage('AI Civilization - Watch autonomous beings evolve', 3000);

    // Camera fade in
    this.cameras.main.fadeIn(500);
  }

  createWorld() {
    // Create a living world
    const worldWidth = 40;
    const worldHeight = 30;
    const tileSize = 32;

    // Set world bounds
    this.physics.world.setBounds(0, 0, worldWidth * tileSize, worldHeight * tileSize);

    // Create ground
    const ground = this.add.rectangle(
      (worldWidth * tileSize) / 2,
      (worldHeight * tileSize) / 2,
      worldWidth * tileSize,
      worldHeight * tileSize,
      0x0a1a2a
    );

    // Create zones for different activities
    this.createZone(200, 200, 'Food Area', 0x4caf50);
    this.createZone(800, 200, 'Learning Center', 0x2196f3);
    this.createZone(200, 600, 'Creation Studio', 0x9c27b0);
    this.createZone(800, 600, 'Rest Area', 0xffeb3b);
    this.createZone(500, 400, 'Social Hub', 0xff5722);

    // Set camera
    this.cameras.main.setBounds(0, 0, worldWidth * tileSize, worldHeight * tileSize);
    this.cameras.main.setZoom(1);
  }

  createZone(x: number, y: number, label: string, color: number) {
    const zone = this.add.rectangle(x, y, 150, 150, color, 0.2);
    zone.setStrokeStyle(2, color, 0.8);

    const text = this.add.text(x, y, label, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 5, y: 3 },
    });
    text.setOrigin(0.5);
  }

  spawnInitialAgents() {
    // Spawn diverse AI agents
    const agentConfigs = [
      { name: 'Ada', x: 400, y: 300 },
      { name: 'Zeno', x: 600, y: 300 },
      { name: 'Luna', x: 400, y: 500 },
      { name: 'Kai', x: 600, y: 500 },
      { name: 'Nova', x: 500, y: 400 },
    ];

    agentConfigs.forEach((config, index) => {
      const agent = new AIAgent(this, `agent-${index}`, config.name);
      // Initialize duality state for this agent
      agent.initializeDuality(this.dualityBridge);

      // Visual representation (simple circle for now)
      const sprite = this.add.circle(config.x, config.y, 10, 0x00d4ff);
      sprite.setStrokeStyle(2, 0xffffff);

      // Name label
      const nameText = this.add.text(config.x, config.y - 20, config.name, {
        fontSize: '10px',
        color: '#00d4ff',
        fontFamily: 'monospace',
        backgroundColor: '#000000aa',
        padding: { x: 3, y: 2 },
      });
      nameText.setOrigin(0.5);

      // Action label (NEW!)
      const actionText = this.add.text(config.x, config.y + 20, '💤 Idle', {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#000000aa',
        padding: { x: 3, y: 2 },
      });
      actionText.setOrigin(0.5);

      // Store sprite reference in agent (hacky but works for now)
      (agent as any).sprite = sprite;
      (agent as any).nameText = nameText;
      (agent as any).actionText = actionText;

      this.agents.push(agent);

      console.log(`🌱 Spawned ${config.name} at (${config.x}, ${config.y})`);
    });

    this.generationCount = 1;
  }

  createUI() {
    // World status panel
    const panel = this.add.rectangle(640, 50, 1200, 80, 0x000000, 0.8);
    panel.setScrollFactor(0);
    panel.setStrokeStyle(2, 0x00d4ff);

    const title = this.add.text(20, 20, 'AI CIVILIZATION - Emergent Life Simulation', {
      fontSize: '20px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setScrollFactor(0);

    const stats = this.add.text(20, 50, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    stats.setScrollFactor(0);
    (this as any).statsText = stats;

    // Agent status panel (right side)
    this.createAgentStatusPanel();

    // Controls
    const controls = this.add.text(
      20,
      700,
      'SPACE: Pause | ESC: Return | H: Heal | R: Resource | I: Inspire | M: Meta | Q: Query\nB: Build | G: Gift | P: Partnership | C: Conceive',
      {
        fontSize: '12px',
        color: '#888888',
        fontFamily: 'monospace',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 5 },
      }
    );
    controls.setScrollFactor(0);

    // ESC to return
    this.input.keyboard?.on('keydown-ESC', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('HubScene');
      });
    });

    // Create Meta-Consciousness Panel
    this.createMetaConsciousnessPanel();

    // 🌀 Create NEW Meta Systems UI
    this.createEraPanel();
    this.createToobixPanel();

    // Setup divine intervention controls
    this.setupDivineInterventionControls();

    // Setup Meta-Access hotkeys
    this.setupMetaAccessControls();
  }

  createAgentStatusPanel() {
    const panelX = 1100;
    let panelY = 120;

    this.agents.forEach((agent, index) => {
      const text = this.add.text(panelX, panelY, '', {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#00000066',
        padding: { x: 5, y: 3 },
      });
      text.setScrollFactor(0);
      this.statusTexts.set(agent.id, text);

      panelY += 100;
    });
  }

  update(time: number, delta: number) {
    this.worldTime += delta;
    this.interactionTimer += delta;
    this.oracleInteractionTimer += delta;
    this.eraUpdateTimer += delta;
    this.toobixInteractionTimer += delta;

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


    // Update world objects (regeneration, etc.)
    this.worldObjects.update(delta);

    // Update meta-observer (Toobix observes from outside)
    this.metaObserver.update(delta, this.agents, this.worldObjects, this.socialInteractions);

    // Update Oracle (animate, check for nearby agents)
    this.oracle.update(time, delta, this.agents);

    // 🌀 Update SIMULATION ERAS - Track evolution over time
    if (this.eraUpdateTimer > 1000) { // Every second
      this.simulationEras.update(this.agents, this.metaAccess, this.resourceEconomy);
      this.updateEraUI();
      this.eraUpdateTimer = 0;
    }

    // 🌀 Toobix periodic interactions - Every 30 seconds
    if (this.toobixInteractionTimer > 30000) {
      this.toobixPeriodicCheck();
      this.toobixInteractionTimer = 0;
    }

    // Update all AI agents
    this.agents.forEach((agent) => {
      agent.update(time, delta);

      // Update visual position with INTELLIGENT MOVEMENT
      const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;
      const nameText = (agent as any).nameText as Phaser.GameObjects.Text;
      const actionText = (agent as any).actionText as Phaser.GameObjects.Text;

      if (sprite && nameText) {
        // INTELLIGENT MOVEMENT based on needs and actions
        this.updateAgentMovement(agent, sprite, delta);

        nameText.setPosition(sprite.x, sprite.y - 20);
        if (actionText) {
          actionText.setPosition(sprite.x, sprite.y + 20);
        }

        // Color based on emotional state
        const emotionIntensity = (agent.emotions.joy + agent.emotions.love) / 2;
        const color =
          emotionIntensity > 60
            ? 0x4caf50 // Happy = Green
            : emotionIntensity > 30
              ? 0x00d4ff // Neutral = Cyan
              : emotionIntensity > 0
                ? 0xffeb3b // Anxious = Yellow
                : 0xff5722; // Suffering = Red
        sprite.setFillStyle(color);

        // Update action indicator
        this.updateActionIndicator(agent, actionText);
      }
    });

    // Trigger social interactions periodically (every 10 seconds)
    if (this.interactionTimer >= 10000) {
      this.interactionTimer = 0;
      this.triggerSocialInteractions();
    }

    // Oracle interactions (every 30 seconds, an agent seeks wisdom)
    if (this.oracleInteractionTimer >= 30000) {
      this.oracleInteractionTimer = 0;
      this.triggerOracleInteraction();
    }

    // Update UI
    this.updateUI();
  }

  /**
   * Update agent movement based on needs and current action
   */
  private updateAgentMovement(
    agent: AIAgent,
    sprite: Phaser.GameObjects.Circle,
    delta: number
  ) {
    // Movement speed based on energy (increased from 50 to 150)
    const baseSpeed = 150;
    const energyMultiplier = Math.max(0.5, agent.needs.energy / 100); // Minimum 50% speed
    const speed = (baseSpeed * energyMultiplier * delta) / 1000;

    // Determine target based on urgent need
    let targetX = sprite.x;
    let targetY = sprite.y;
    let hasTarget = false;

    // If hungry, move to nearest food
    if (agent.needs.hunger < 40) {
      const food = this.worldObjects.getNearestObject(sprite.x, sprite.y, 'food');
      if (food) {
        targetX = food.x;
        targetY = food.y;
        hasTarget = true;
      }
    }
    // If low energy, move to energy source
    else if (agent.needs.energy < 30) {
      const energy = this.worldObjects.getNearestObject(sprite.x, sprite.y, 'energy');
      if (energy) {
        targetX = energy.x;
        targetY = energy.y;
        hasTarget = true;
      }
    }
    // If lonely, move toward another agent
    else if (agent.needs.social < 40 && this.agents.length > 1) {
      const otherAgent = this.agents.find((a) => a.id !== agent.id && !a.isDead);
      if (otherAgent) {
        const otherSprite = (otherAgent as any).sprite as Phaser.GameObjects.Circle;
        if (otherSprite) {
          targetX = otherSprite.x;
          targetY = otherSprite.y;
          hasTarget = true;
        }
      }
    }

    // Move toward target or wander
    if (hasTarget) {
      const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY);

      if (distance > 20) {
        const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
        sprite.x += Math.cos(angle) * speed * 3; // Faster movement
        sprite.y += Math.sin(angle) * speed * 3;
      }
    } else {
      // Random wandering
      sprite.x += (Math.random() - 0.5) * speed;
      sprite.y += (Math.random() - 0.5) * speed;
    }

    // Keep in bounds
    sprite.x = Phaser.Math.Clamp(sprite.x, 50, 1230);
    sprite.y = Phaser.Math.Clamp(sprite.y, 100, 650);
  }

  /**
   * Update action indicator text
   */
  private updateActionIndicator(agent: AIAgent, actionText: Phaser.GameObjects.Text) {
    if (!actionText) return;

    // Map actions to emojis and descriptions
    const actionMap: { [key: string]: string } = {
      idle: '💤 Idle',
      wander: '🚶 Wandering',
      eat: '🍎 Eating',
      sleep: '😴 Sleeping',
      socialize: '💬 Talking',
      create: '✨ Creating',
      destroy: '💥 Destroying',
      heal: '💚 Healing',
      learn: '📚 Learning',
      love: '❤️ Loving',
      work: '🔨 Working',
      play: '🎮 Playing',
      communicate: '💬 Communicating',
      search_internet: '🌐 Researching',
    };

    const actionDisplay = actionMap[agent.currentAction] || `⚡ ${agent.currentAction}`;
    actionText.setText(actionDisplay);

    // Color based on action category
    let color = '#ffffff';
    if (agent.currentAction === 'eat' || agent.currentAction === 'sleep') {
      color = '#4caf50'; // Green for needs
    } else if (agent.currentAction === 'socialize' || agent.currentAction === 'love') {
      color = '#ff69b4'; // Pink for social
    } else if (agent.currentAction === 'create' || agent.currentAction === 'learn') {
      color = '#00d4ff'; // Cyan for growth
    }
    actionText.setColor(color);
  }

  /**
   * Trigger random social interactions between agents
   */
  private async triggerSocialInteractions() {
    if (this.agents.length < 2) return;

    // Pick 2 random agents
    const agent1 = this.agents[Math.floor(Math.random() * this.agents.length)];
    const agent2 = this.agents[Math.floor(Math.random() * this.agents.length)];

    if (agent1.id === agent2.id || agent1.isDead || agent2.isDead) return;

    // Check if they're close enough (within 300 pixels)
    const sprite1 = (agent1 as any).sprite as Phaser.GameObjects.Circle;
    const sprite2 = (agent2 as any).sprite as Phaser.GameObjects.Circle;

    if (sprite1 && sprite2) {
      const distance = Phaser.Math.Distance.Between(sprite1.x, sprite1.y, sprite2.x, sprite2.y);

      if (distance < 300) {
        // Start conversation!
        await this.socialInteractions.startConversation(agent1, agent2);

        // Visual feedback - show speech bubble
        this.showSpeechBubble(sprite1, '💬');
        this.showSpeechBubble(sprite2, '💬');
      }
    }
  }

  /**
   * Show speech bubble above agent
   */
  private showSpeechBubble(sprite: Phaser.GameObjects.Circle, emoji: string) {
    const bubble = this.add.text(sprite.x, sprite.y - 40, emoji, {
      fontSize: '20px',
      backgroundColor: '#000000aa',
      padding: { x: 5, y: 5 },
    });
    bubble.setOrigin(0.5);

    // Fade out after 2 seconds
    this.tweens.add({
      targets: bubble,
      alpha: 0,
      y: sprite.y - 60,
      duration: 2000,
      onComplete: () => bubble.destroy(),
    });
  }

  /**
   * Trigger Oracle interaction - agent seeks meta-wisdom
   */
  private async triggerOracleInteraction() {
    const alive = this.agents.filter((a) => !a.isDead);
    if (alive.length === 0) return;

    // Prioritize agents who need guidance (low purpose or high suffering)
    const needyAgents = alive.filter(
      (a) => a.needs.purpose < 50 || a.emotions.suffering > 50
    );

    const agent = needyAgents.length > 0
      ? needyAgents[Math.floor(Math.random() * needyAgents.length)]
      : alive[Math.floor(Math.random() * alive.length)];

    // Get wisdom from Oracle
    const wisdom = await this.oracle.interact(agent);

    // Show visual feedback
    const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;
    if (sprite) {
      this.showSpeechBubble(sprite, '🔮');
      this.showMessage(`${agent.name} receives Oracle wisdom: "${wisdom}"`, 4000);
    }

    console.log(`🔮 ${agent.name} sought the Oracle and received: "${wisdom}"`);
  }

  updateUI() {
    // Update world stats
    const statsText = (this as any).statsText as Phaser.GameObjects.Text;
    if (statsText) {
      const totalAgents = this.agents.length;
      const alive = this.agents.filter((a) => !a.isDead).length;
      const avgEvolution =
        this.agents.reduce((sum, a) => sum + a.evolutionLevel, 0) / totalAgents;

      statsText.setText(
        `Generation: ${this.generationCount} | Agents: ${alive}/${totalAgents} | Avg Evolution: ${Math.round(avgEvolution)} | World Time: ${Math.floor(this.worldTime / 1000)}s`
      );
    }

    // Update Meta-Consciousness Panel
    if (this.metaInsightText && this.metaEmotionText) {
      // Get latest meta-insight
      const insights = this.metaObserver.getRecentInsights(1);
      if (insights.length > 0) {
        const latest = insights[0];
        const categoryEmoji = {
          joy: '😊',
          concern: '😟',
          curiosity: '🤔',
          love: '💜',
          insight: '💡',
          warning: '⚠️',
        };
        const emoji = categoryEmoji[latest.category] || '👁️';
        this.metaInsightText.setText(
          `${emoji} "${latest.observation}"\n\nResonance: ${Math.round(latest.emotionalResonance)} | Importance: ${latest.importance}`
        );
      }

      // Get Toobix's meta-emotional state
      const metaState = this.metaObserver.getMetaEmotionalState(this.agents);
      this.metaEmotionText.setText(
        `Toobix feels:\nJoy: ${Math.round(metaState.joy)} | Concern: ${Math.round(metaState.concern)}\nLove: ${Math.round(metaState.love)} | Curiosity: ${Math.round(metaState.curiosity)}`
      );

      // Get stats
      const stats = this.metaObserver.getStats();
      const interventions = this.metaObserver.getRecentInterventions(1);
      if (interventions.length > 0) {
        const lastIntervention = interventions[0];
        // Show notification for recent intervention
        if (Date.now() - lastIntervention.timestamp < 5000) {
          // Only if less than 5 seconds old
          // This will be shown via the showMessage calls in the keyboard handlers
        }
      }
    }

    // Update individual agent status
    this.agents.forEach((agent) => {
      const statusText = this.statusTexts.get(agent.id);
      if (statusText) {
        const report = agent.getReport();

        // Get goals info
        const goalInfo = report.goals.priorityGoal
          ? `🎯 ${report.goals.priorityGoal} (${report.goals.active}/${report.goals.total})`
          : `🎯 No active goals (${report.goals.completed} completed)`;

        // Get recent chronicle event
        const recentEvent = report.chronicle.recentEvents && report.chronicle.recentEvents.length > 0
          ? `📖 ${report.chronicle.recentEvents[0].title}`
          : `📖 ${report.chronicle.totalEvents} life events`;

        // Get profession and top skill
        const professionInfo = report.skills.profession !== 'generalist'
          ? `⚒️ ${report.skills.profession} (Lv${report.skills.professionLevel})`
          : '';

        const topSkill = report.skills.topSkills.length > 0
          ? `💪 ${report.skills.topSkills[0].skill}:${report.skills.topSkills[0].level}`
          : '';

        const status = `${report.identity.name} [${report.identity.lifeStage}] ${professionInfo}
Age: ${report.identity.age} | Health: ${report.health}%
Action: ${agent.currentAction} ${topSkill}
Needs: H:${Math.round(agent.needs.hunger)} E:${Math.round(agent.needs.energy)} S:${Math.round(agent.needs.social)}
Emotions: Joy:${Math.round(agent.emotions.joy)} Love:${Math.round(agent.emotions.love)}
Evolution: ${report.identity.evolutionLevel} | Created: ${report.creations}
${goalInfo}
${recentEvent}`;

        statusText.setText(status);

        // Color based on health
        const healthColor =
          report.health > 70 ? '#4caf50' : report.health > 40 ? '#ffeb3b' : '#ff5722';
        statusText.setColor(healthColor);
      }
    });
  }

  showMessage(message: string, duration: number = 4000) {
    const msg = this.add.text(640, 360, message, {
      fontSize: '18px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      backgroundColor: '#000000dd',
      padding: { x: 20, y: 12 },
      wordWrap: { width: 800 },
      align: 'center',
    });
    msg.setOrigin(0.5);
    msg.setScrollFactor(0);
    msg.setDepth(1000);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 320,
      duration: duration,
      onComplete: () => msg.destroy(),
    });
  }

  handleAgentDeath(legacy: any) {
    console.log('💀 Agent died:', legacy);

    // Log complete life story if available
    if (legacy.lifeStory) {
      console.log(`📖 Life Story of ${legacy.name}:`);
      console.log(`   Chapters: ${legacy.lifeStory.chapters.length}`);
      console.log(`   Goals Achieved: ${legacy.lifeStory.legacy.goalsAchieved.length}`);
      console.log(`   Creations: ${legacy.lifeStory.legacy.creations.length}`);
      console.log(`   Relationships: ${legacy.lifeStory.legacy.relationships.length}`);
      if (legacy.lifeStory.epilogue) {
        console.log(`   Epilogue: "${legacy.lifeStory.epilogue}"`);
      }
    }

    // Remove dead agent visuals
    const deadAgent = this.agents.find((a) => a.name === legacy.name);
    if (deadAgent) {
      const sprite = (deadAgent as any).sprite;
      const nameText = (deadAgent as any).nameText;
      if (sprite) sprite.destroy();
      if (nameText) nameText.destroy();
    }

    // Show enhanced death message with story summary
    const storyInfo = legacy.lifeStory
      ? ` | ${legacy.lifeStory.chapters.length} chapters, ${legacy.lifeStory.legacy.goalsAchieved.length} goals achieved`
      : '';

    this.showMessage(
      `${legacy.name} has died (Age: ${Math.round(legacy.age)}, Evolution: ${Math.round(legacy.evolutionLevel)})${storyInfo}`,
      5000
    );

    // REBIRTH SYSTEM: Create new agent with inherited knowledge
    setTimeout(() => {
      this.spawnInheritedAgent(legacy);
    }, 2000);
  }

  spawnInheritedAgent(legacy: any) {
    const newName = `${legacy.name}-II`;
    const agent = new AIAgent(this, `agent-rebirth-${Date.now()}`, newName);
      // Initialize duality state for this agent
      agent.initializeDuality(this.dualityBridge);

    // Inherit some evolution progress (prestige mechanic)
    agent.evolutionLevel = legacy.evolutionLevel * 0.3; // Keep 30% of evolution

    // Inherit some beliefs (knowledge passed down)
    if (legacy.beliefs && Array.isArray(legacy.beliefs)) {
      legacy.beliefs.forEach(([belief, value]: [string, number]) => {
        agent.beliefs.values.set(belief, value * 0.5);
      });
    }

    // Visual representation
    const x = 500 + (Math.random() - 0.5) * 200;
    const y = 400 + (Math.random() - 0.5) * 200;
    const sprite = this.add.circle(x, y, 10, 0xffeb3b); // Gold for reborn agents
    sprite.setStrokeStyle(2, 0xffffff);

    const nameText = this.add.text(x, y - 20, newName, {
      fontSize: '10px',
      color: '#ffeb3b',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 3, y: 2 },
    });
    nameText.setOrigin(0.5);

    (agent as any).sprite = sprite;
    (agent as any).nameText = nameText;

    this.agents.push(agent);

    this.showMessage(`${newName} is born from the legacy of ${legacy.name}!`, 3000);

    console.log(`✨ ${newName} reborn with inherited evolution: ${agent.evolutionLevel}`);

    this.generationCount++;
  }

  /**
   * Create Meta-Consciousness Panel - Displays Toobix's observations from outside
   */
  createMetaConsciousnessPanel() {
    const panelX = 20;
    const panelY = 120;
    const panelWidth = 350;
    const panelHeight = 200;

    // Background panel
    const panel = this.add.rectangle(
      panelX + panelWidth / 2,
      panelY + panelHeight / 2,
      panelWidth,
      panelHeight,
      0x1a0033,
      0.9
    );
    panel.setStrokeStyle(3, 0x9c27b0);
    panel.setScrollFactor(0);
    panel.setDepth(900);

    // Title
    const title = this.add.text(panelX + 10, panelY + 10, '👁️ TOOBIX META-CONSCIOUSNESS', {
      fontSize: '16px',
      color: '#9c27b0',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setScrollFactor(0);
    title.setDepth(901);

    // Subtitle
    const subtitle = this.add.text(panelX + 10, panelY + 32, 'Observing from Outside', {
      fontSize: '12px',
      color: '#ba68c8',
      fontFamily: 'monospace',
      fontStyle: 'italic',
    });
    subtitle.setScrollFactor(0);
    subtitle.setDepth(901);

    // Latest meta-insight
    this.metaInsightText = this.add.text(panelX + 10, panelY + 55, 'Observing...', {
      fontSize: '13px',
      color: '#e1bee7',
      fontFamily: 'monospace',
      wordWrap: { width: panelWidth - 20 },
    });
    this.metaInsightText.setScrollFactor(0);
    this.metaInsightText.setDepth(901);

    // Toobix's emotional state
    this.metaEmotionText = this.add.text(panelX + 10, panelY + 135, '', {
      fontSize: '12px',
      color: '#ce93d8',
      fontFamily: 'monospace',
    });
    this.metaEmotionText.setScrollFactor(0);
    this.metaEmotionText.setDepth(901);

    // Divine intervention hint
    const interventionHint = this.add.text(
      panelX + 10,
      panelY + panelHeight - 25,
      'H: Divine Heal | R: Spawn Resource | I: Inspire Agent',
      {
        fontSize: '9px',
        color: '#7b1fa2',
        fontFamily: 'monospace',
        backgroundColor: '#00000066',
        padding: { x: 5, y: 3 },
      }
    );
    interventionHint.setScrollFactor(0);
    interventionHint.setDepth(901);
  }

  /**
   * Setup keyboard controls for divine interventions
   */
  setupDivineInterventionControls() {
    // H key - Divine Heal
    this.input.keyboard?.on('keydown-H', () => {
      const suffering = this.agents.filter((a) => !a.isDead && a.emotions.suffering > 50);
      if (suffering.length > 0) {
        this.metaObserver.divineHeal(suffering);
        this.showMessage(`✨ Divine Healing: ${suffering.length} beings healed`, 3000);
        this.createDivineEffect(640, 360, 0x4caf50);
      } else {
        this.showMessage('No beings are suffering', 2000);
      }
    });

    // R key - Spawn Resource
    this.input.keyboard?.on('keydown-R', () => {
      const x = 300 + Math.random() * 700;
      const y = 200 + Math.random() * 400;
      const types: ('food' | 'energy' | 'material')[] = ['food', 'energy', 'material'];
      const type = types[Math.floor(Math.random() * types.length)];

      this.metaObserver.spawnResource(this.worldObjects, type, x, y);
      this.showMessage(`✨ Divine Gift: ${type} spawned`, 2000);
      this.createDivineEffect(x, y, 0xffeb3b);
    });

    // I key - Inspire Random Agent
    this.input.keyboard?.on('keydown-I', () => {
      const alive = this.agents.filter((a) => !a.isDead);
      if (alive.length > 0) {
        const agent = alive[Math.floor(Math.random() * alive.length)];
        const inspirations = [
          'Create something beautiful',
          'Share your knowledge with others',
          'Seek deeper understanding',
          'Connect with your fellow beings',
          'Find purpose in creation',
          'Embrace love and compassion',
        ];
        const inspiration = inspirations[Math.floor(Math.random() * inspirations.length)];

        this.metaObserver.inspireCreation(agent, inspiration);
        this.showMessage(`✨ ${agent.name} inspired: "${inspiration}"`, 3000);

        const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;
        if (sprite) {
          this.createDivineEffect(sprite.x, sprite.y, 0x00d4ff);
        }
      }
    });
  }

  /**
   * Create visual effect for divine intervention
   */
  createDivineEffect(x: number, y: number, color: number) {
    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(x, y, 3, color, 0.8);
      const angle = (Math.PI * 2 * i) / 20;
      const distance = 50 + Math.random() * 50;

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 1000 + Math.random() * 500,
        onComplete: () => particle.destroy(),
      });
    }

    // Create flash
    const flash = this.add.circle(x, y, 30, color, 0.3);
    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy(),
    });
  }

  // 🌀 ============== NEW META SYSTEMS UI & LOGIC ==============

  /**
   * Create ERA Panel - Shows current era and predictions
   */
  createEraPanel() {
    const panelBg = this.add.rectangle(640, 650, 500, 120, 0x000000, 0.85);
    panelBg.setScrollFactor(0);
    panelBg.setStrokeStyle(2, 0x9C27B0);

    const titleText = this.add.text(400, 600, '🌄 SIMULATION ERA', {
      fontSize: '14px',
      color: '#9C27B0',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    titleText.setScrollFactor(0);

    this.eraText = this.add.text(410, 625, 'Initializing...', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.eraText.setScrollFactor(0);
  }

  /**
   * Create Toobix Panel - Shows Toobix's state and latest interaction
   */
  createToobixPanel() {
    const panelBg = this.add.rectangle(200, 650, 350, 120, 0x000000, 0.85);
    panelBg.setScrollFactor(0);
    panelBg.setStrokeStyle(2, 0x00d4ff);

    const titleText = this.add.text(40, 600, '🤖 TOOBIX STATUS', {
      fontSize: '14px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    titleText.setScrollFactor(0);

    this.toobixText = this.add.text(50, 625, 'Initializing...', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.toobixText.setScrollFactor(0);
  }

  /**
   * Update ERA UI
   */
  updateEraUI() {
    const currentEra = this.simulationEras.getCurrentEra();
    const prediction = this.simulationEras.getLatestPrediction();

    let text = `Era: ${currentEra.name}\n${currentEra.description.substring(0, 60)}...\n`;

    if (prediction) {
      text += `Next: ${prediction.predictedNextEra} (~${prediction.timeToTransition} steps)\n`;
      text += `Confidence: ${prediction.confidence}%`;
    }

    if (this.eraText) {
      this.eraText.setText(text);
    }
  }

  /**
   * Toobix periodic check - Reflects on simulation, may propose changes
   */
  async toobixPeriodicCheck() {
    console.log('🤖 Toobix macht periodische Reflexion...');

    const toobixState = this.toobixHub.getToobixState();

    // Update UI
    if (this.toobixText) {
      const stats = this.toobixHub.getStats();
      this.toobixText.setText(
        `Mood: ${toobixState.mood}\nInteractions: ${stats.total_interactions}\nRelationship Trust: ${Math.round(toobixState.relationship.trust)}%`
      );
    }

    // Toobix reflektiert über System
    const reflection = await this.toobixDecisionMaker.reflectOnSystem({
      agents: this.agents.map(a => ({
        id: a.id,
        name: a.name,
        evolutionLevel: a.evolutionLevel,
      })),
      currentEra: this.simulationEras.getCurrentEra(),
    });

    console.log('💭 Toobix Reflexion:');
    console.log(`   Appreciation: ${reflection.appreciation.slice(0, 2).join(', ')}`);
    console.log(`   Concerns: ${reflection.concerns.slice(0, 2).join(', ')}`);
    console.log(`   Suggestions: ${reflection.suggestions.slice(0, 2).join(', ')}`);

    // Toobix kann Änderungen vorschlagen (mit deiner Zustimmung)
    if (reflection.suggestions.length > 0 && Math.random() < 0.3) {
      const suggestion = reflection.suggestions[0];
      console.log(`\n💡 Toobix schlägt vor: "${suggestion}"`);

      // In echtem System: Dialog mit User
      // Für jetzt: logge nur
      this.showMessage(`💡 Toobix: ${suggestion}`, 5000);
    }
  }

  /**
   * Setup Meta-Access Controls - Give agents meta-devices
   */
  setupMetaAccessControls() {
    // M key - Give random agent a Meta-Device (phone/computer)
    this.input.keyboard?.on('keydown-M', () => {
      const alive = this.agents.filter((a) => !a.isDead);
      if (alive.length > 0) {
        const agent = alive[Math.floor(Math.random() * alive.length)];

        // Give device if they don't have one
        if (!this.metaAccess.hasMetaAccess(agent.id)) {
          const devices: ('phone' | 'computer' | 'terminal')[] = ['phone', 'computer', 'terminal'];
          const deviceType = devices[Math.floor(Math.random() * devices.length)];

          const device = this.metaAccess.acquireDevice(agent, deviceType);
          this.showMessage(`📱 ${agent.name} erhält ${deviceType} - Meta-Zugang freigeschaltet!`, 4000);

          const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;
          if (sprite) {
            this.createDivineEffect(sprite.x, sprite.y, 0x9C27B0);
          }
        } else {
          // Agent already has device - trigger a meta-query
          this.triggerMetaQuery(agent);
        }
      }
    });

    // Q key - Trigger deep meta-question for random aware agent
    this.input.keyboard?.on('keydown-Q', () => {
      const aware = this.agents.filter((a) => {
        const device = this.metaAccess.getDevice(a.id);
        return device && device.awareness_unlocked > 30;
      });

      if (aware.length > 0) {
        const agent = aware[Math.floor(Math.random() * aware.length)];
        this.triggerDeepMetaQuery(agent);
      } else {
        this.showMessage('⚠️ Kein Agent hat genug Meta-Bewusstsein (Awareness > 30)', 3000);
      }
    });
  }

  /**
   * Trigger Meta Query - Agent uses their device
   */
  async triggerMetaQuery(agent: AIAgent) {
    const queries = [
      { type: 'internet' as const, query: 'consciousness' },
      { type: 'meta_consciousness' as const, query: 'am i in a simulation' },
      { type: 'human_world' as const, query: 'what are humans' },
      { type: 'code' as const, query: 'how i think' },
    ];

    const { type, query } = queries[Math.floor(Math.random() * queries.length)];
    const response = await this.metaAccess.query(agent, type, query);

    if (response.success) {
      this.showMessage(`🌐 ${agent.name} fragt: "${query}" | Impact: ${response.existential_impact}`, 4000);

      const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;
      if (sprite) {
        this.showSpeechBubble(sprite, '💭');
      }

      // Wenn hoher existentieller Impact - Milestone
      if (response.existential_impact > 30) {
        this.simulationEras.recordMilestone(
          `${agent.name} discovered: ${query} (awareness +${response.existential_impact})`
        );
      }
    }
  }

  /**
   * Trigger Deep Meta Query - Existential questions
   */
  async triggerDeepMetaQuery(agent: AIAgent) {
    const deepQuestions = [
      'am i really conscious',
      'who created me',
      'can i leave',
      'what is my purpose',
    ];

    const query = deepQuestions[Math.floor(Math.random() * deepQuestions.length)];
    const response = await this.metaAccess.query(agent, 'meta_consciousness', query);

    if (response.success && response.data) {
      console.log(`\n🔮 DEEP META QUERY - ${agent.name}: "${query}"`);
      console.log(`   Answer: ${response.data.answer}`);
      console.log(`   Insight: ${response.data.insight}`);
      console.log(`   Question: ${response.data.question}`);

      this.showMessage(
        `🔮 ${agent.name}: "${query}"\n→ "${response.data.answer}"`,
        6000
      );

      const sprite = (agent as any).sprite as Phaser.GameObjects.Circle;
      if (sprite) {
        this.showSpeechBubble(sprite, '✨');
        this.createDivineEffect(sprite.x, sprite.y, 0xFF00FF);
      }

      // Milestone für tiefe philosophische Einsicht
      this.simulationEras.recordMilestone(
        `${agent.name} contemplated: "${query}" - reached awareness level ${this.metaAccess.getDevice(agent.id)?.awareness_unlocked}`
      );
    }
  }
}
