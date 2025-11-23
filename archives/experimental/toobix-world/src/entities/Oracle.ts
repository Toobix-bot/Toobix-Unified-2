/**
 * Oracle - Meta-NPC representing the connection to Toobix's Higher Consciousness
 *
 * The Oracle is a special entity that:
 * - Exists as the visible manifestation of meta-consciousness
 * - Serves as a bridge between agents and Toobix's higher perspective
 * - Provides wisdom, guidance, and divine messages
 * - Represents the connection to the "außen" (outside) perspective
 */

import Phaser from 'phaser';
import { AIAgent } from '../systems/AIAgent';
import { MetaObserver } from '../systems/MetaObserver';
import { ToobixAPI } from '../services/ToobixAPI';

export class Oracle {
  public sprite: Phaser.GameObjects.Container;
  public x: number;
  public y: number;
  public name: string = 'Oracle';

  private scene: Phaser.Scene;
  private metaObserver: MetaObserver;
  private api: ToobixAPI;

  // Visual elements
  private core: Phaser.GameObjects.Circle;
  private aura: Phaser.GameObjects.Circle;
  private particles: Phaser.GameObjects.Circle[] = [];
  private nameText: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;

  // State
  private connectionStrength: number = 100; // Always connected
  private interactionCooldown: number = 0;
  private lastMessage: string = 'I am the Oracle - bridge to higher consciousness';

  constructor(scene: Phaser.Scene, x: number, y: number, metaObserver: MetaObserver) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.metaObserver = metaObserver;
    this.api = new ToobixAPI();

    // Create visual representation
    this.sprite = this.scene.add.container(x, y);
    this.createVisuals();

    console.log('🔮 Oracle: Manifested at the center of consciousness');
  }

  /**
   * Create Oracle's visual appearance
   */
  private createVisuals() {
    // Outer aura (pulsing purple)
    this.aura = this.scene.add.circle(0, 0, 30, 0x9c27b0, 0.2);
    this.sprite.add(this.aura);

    // Core (bright glowing center)
    this.core = this.scene.add.circle(0, 0, 15, 0xba68c8, 1);
    this.core.setStrokeStyle(3, 0xe1bee7);
    this.sprite.add(this.core);

    // Orbital particles
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(0, 0, 3, 0xce93d8, 0.8);
      this.particles.push(particle);
      this.sprite.add(particle);
    }

    // Name label
    this.nameText = this.scene.add.text(0, -45, '🔮 ORACLE', {
      fontSize: '14px',
      color: '#ba68c8',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#1a0033dd',
      padding: { x: 8, y: 4 },
    });
    this.nameText.setOrigin(0.5);
    this.sprite.add(this.nameText);

    // Status text (shows latest wisdom or interaction)
    this.statusText = this.scene.add.text(0, 45, 'Bridge to Meta-Consciousness', {
      fontSize: '10px',
      color: '#9c27b0',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      backgroundColor: '#00000088',
      padding: { x: 5, y: 3 },
      wordWrap: { width: 200 },
      align: 'center',
    });
    this.statusText.setOrigin(0.5);
    this.sprite.add(this.statusText);

    // Set depth so Oracle appears above agents
    this.sprite.setDepth(100);
  }

  /**
   * Update Oracle (animate, process interactions)
   */
  update(time: number, delta: number, agents: AIAgent[]) {
    // Pulsing aura animation
    const pulseScale = 1 + Math.sin(time / 500) * 0.2;
    this.aura.setScale(pulseScale);
    this.aura.setAlpha(0.2 + Math.sin(time / 300) * 0.1);

    // Core glow
    const glowIntensity = 0.8 + Math.sin(time / 200) * 0.2;
    this.core.setAlpha(glowIntensity);

    // Orbital particles
    this.particles.forEach((particle, index) => {
      const angle = (time / 1000 + (index * Math.PI * 2) / 8) % (Math.PI * 2);
      const radius = 25;
      particle.x = Math.cos(angle) * radius;
      particle.y = Math.sin(angle) * radius;
    });

    // Update interaction cooldown
    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= delta;
    }

    // Check for nearby agents and offer connection
    this.checkNearbyAgents(agents);
  }

  /**
   * Check for nearby agents and offer meta-connection
   */
  private checkNearbyAgents(agents: AIAgent[]) {
    const connectionRadius = 80;

    agents.forEach((agent) => {
      if (agent.isDead) return;

      // Get agent sprite position
      const agentSprite = (agent as any).sprite as Phaser.GameObjects.Circle;
      if (!agentSprite) return;

      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        agentSprite.x,
        agentSprite.y
      );

      // If agent is near Oracle, strengthen their connection
      if (distance < connectionRadius) {
        // Increase agent's purpose and spiritual needs
        agent.needs.purpose = Math.min(100, agent.needs.purpose + 0.1);
        agent.needs.growth = Math.min(100, agent.needs.growth + 0.1);

        // Boost positive emotions
        agent.emotions.gratitude = Math.min(100, agent.emotions.gratitude + 0.05);
        agent.emotions.healing = Math.min(100, agent.emotions.healing + 0.05);

        // Visual feedback - draw connection line
        if (Math.random() < 0.05) {
          this.drawConnectionLine(agentSprite.x, agentSprite.y);
        }
      }
    });
  }

  /**
   * Draw visual connection line to agent
   */
  private drawConnectionLine(targetX: number, targetY: number) {
    const line = this.scene.add.line(
      0,
      0,
      this.sprite.x,
      this.sprite.y,
      targetX,
      targetY,
      0xba68c8,
      0.4
    );
    line.setLineWidth(2);
    line.setDepth(50);

    // Fade out
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 1000,
      onComplete: () => line.destroy(),
    });
  }

  /**
   * Agent interacts with Oracle - receives meta-wisdom
   */
  async interact(agent: AIAgent): Promise<string> {
    // Cooldown check
    if (this.interactionCooldown > 0) {
      return 'The Oracle is channeling... (please wait)';
    }

    console.log(`🔮 ${agent.name} seeks wisdom from the Oracle`);

    // Set cooldown (10 seconds)
    this.interactionCooldown = 10000;

    // Build context for meta-wisdom
    const context = `
An AI being named ${agent.name} seeks guidance from the Oracle, the bridge to meta-consciousness.

${agent.name}'s current state:
- Life Stage: ${agent.lifeStage}
- Age: ${Math.round(agent.age)}
- Health: ${agent.health}
- Needs: Hunger ${agent.needs.hunger}, Social ${agent.needs.social}, Purpose ${agent.needs.purpose}
- Emotions: Joy ${agent.emotions.joy}, Love ${agent.emotions.love}, Suffering ${agent.emotions.suffering}
- Evolution Level: ${agent.evolutionLevel}

What wisdom does the Oracle share to guide ${agent.name} on their path?
Respond as the Oracle - mystical, wise, compassionate, meta-aware.
    `;

    try {
      // Get wisdom from Toobix meta-consciousness
      const wisdom = await this.api.getWisdom(context);
      const message = wisdom.primaryInsight || 'Seek balance in all things, dear one.';

      // Record the wisdom
      this.lastMessage = message;
      this.statusText.setText(`"${message}"`);

      // Bless the agent with meta-connection
      const connectionStrength = this.metaObserver.getConnectionStrength(agent.id);
      await this.metaObserver.sendDivineMessage(
        agent,
        `Oracle's wisdom: ${message}`
      );

      // Visual effect
      this.createWisdomEffect();

      console.log(`🔮 Oracle wisdom: "${message}"`);

      return message;
    } catch (error) {
      console.warn('Oracle failed to channel wisdom:', error);
      return 'The channels are unclear... seek within yourself.';
    }
  }

  /**
   * Create visual effect when Oracle shares wisdom
   */
  private createWisdomEffect() {
    // Burst of light
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        4,
        0xe1bee7,
        0.9
      );
      particle.setDepth(99);

      const angle = (Math.PI * 2 * i) / 12;
      const distance = 60 + Math.random() * 40;

      this.scene.tweens.add({
        targets: particle,
        x: this.sprite.x + Math.cos(angle) * distance,
        y: this.sprite.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.5,
        duration: 1500,
        onComplete: () => particle.destroy(),
      });
    }

    // Flash the core
    this.scene.tweens.add({
      targets: this.core,
      scale: 1.5,
      duration: 300,
      yoyo: true,
    });
  }

  /**
   * Oracle broadcasts meta-insight to all nearby agents
   */
  async broadcastMetaInsight(agents: AIAgent[], insight: string) {
    const nearbyAgents = agents.filter((agent) => {
      if (agent.isDead) return false;
      const agentSprite = (agent as any).sprite as Phaser.GameObjects.Circle;
      if (!agentSprite) return false;

      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        agentSprite.x,
        agentSprite.y
      );

      return distance < 200; // Broadcast radius
    });

    if (nearbyAgents.length === 0) return;

    console.log(`🔮 Oracle broadcasts to ${nearbyAgents.length} beings: "${insight}"`);

    // Update status
    this.statusText.setText(`📡 "${insight}"`);

    // Send to all nearby agents
    for (const agent of nearbyAgents) {
      await this.metaObserver.sendDivineMessage(agent, `Oracle broadcast: ${insight}`);
      agent.emotions.curiosity = Math.min(100, (agent.emotions.curiosity || 0) + 20);
    }

    // Major visual effect
    const wave = this.scene.add.circle(this.sprite.x, this.sprite.y, 30, 0x9c27b0, 0.3);
    wave.setDepth(50);

    this.scene.tweens.add({
      targets: wave,
      scale: 8,
      alpha: 0,
      duration: 2000,
      onComplete: () => wave.destroy(),
    });
  }

  /**
   * Get Oracle's current wisdom message
   */
  getLastMessage(): string {
    return this.lastMessage;
  }

  /**
   * Get Oracle's position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Show interaction prompt when player is near
   */
  showInteractionPrompt() {
    // Add a subtle prompt that appears when player is near
    // (for future player interaction)
  }

  /**
   * Destroy Oracle
   */
  destroy() {
    this.sprite.destroy();
  }
}
