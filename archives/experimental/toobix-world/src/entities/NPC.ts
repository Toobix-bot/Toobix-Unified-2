import Phaser from 'phaser';

interface WanderConfig {
  enabled: boolean;
  range: number;
  speed: number;
  interval: number; // Time between picking new targets (ms)
  idleChance: number; // 0-1 probability of idling
  idleDuration: number; // How long to idle (ms)
}

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public npcName: string;
  public perspectiveType: string;
  private nameText!: Phaser.GameObjects.Text;
  private interactPrompt?: Phaser.GameObjects.Text;

  // Enhanced wandering system
  private wanderTimer: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private wanderConfig: WanderConfig;
  private isIdle: boolean = false;
  private idleTimer: number = 0;
  private currentIdleDuration: number = 0;
  private spawnX: number;
  private spawnY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    perspectiveType: string
  ) {
    super(scene, x, y, 'npc');

    this.npcName = name;
    this.perspectiveType = perspectiveType;
    this.spawnX = x;
    this.spawnY = y;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    this.setCollideWorldBounds(true);
    this.setImmovable(true);

    // Color based on perspective type
    this.setTintBasedOnType();

    // Add name label above NPC
    this.nameText = scene.add.text(x, y - 30, name, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 2 },
    });
    this.nameText.setOrigin(0.5);

    // Configure wandering behavior based on NPC type
    this.wanderConfig = this.getWanderConfigForType(perspectiveType);

    // Initialize wander target
    this.targetX = x;
    this.targetY = y;

    console.log(`🤖 NPC spawned: ${name} (${perspectiveType}) - Wander: ${this.wanderConfig.enabled}`);
  }

  getWanderConfigForType(type: string): WanderConfig {
    const configs: { [key: string]: WanderConfig } = {
      guide: {
        enabled: false, // Guides stay put
        range: 0,
        speed: 0,
        interval: 5000,
        idleChance: 0.8,
        idleDuration: 3000,
      },
      rational: {
        enabled: true,
        range: 150, // Larger range - systematic exploration
        speed: 60,
        interval: 4000, // Slower, more deliberate
        idleChance: 0.3,
        idleDuration: 2000,
      },
      emotional: {
        enabled: true,
        range: 120,
        speed: 80, // Faster, more energetic
        interval: 2500, // Changes direction more often
        idleChance: 0.2,
        idleDuration: 1500,
      },
      creative: {
        enabled: true,
        range: 200, // Widest range - exploration
        speed: 70,
        interval: 3000,
        idleChance: 0.4,
        idleDuration: 2500,
      },
      ethical: {
        enabled: true,
        range: 100, // Moderate, careful movement
        speed: 50,
        interval: 4500,
        idleChance: 0.5,
        idleDuration: 3000,
      },
      child: {
        enabled: true,
        range: 180, // Curious, wide exploration
        speed: 90, // Fastest - playful
        interval: 2000, // Very frequent direction changes
        idleChance: 0.1,
        idleDuration: 1000,
      },
      sage: {
        enabled: true,
        range: 80, // Small, contemplative range
        speed: 40, // Slowest - wise and measured
        interval: 6000, // Longest intervals
        idleChance: 0.7, // Idles most - contemplative
        idleDuration: 4000,
      },
    };

    return configs[type] || configs.guide;
  }

  setTintBasedOnType() {
    const tints: { [key: string]: number } = {
      guide: 0x00ff88,
      rational: 0x2196f3,
      emotional: 0xe91e63,
      creative: 0x9c27b0,
      ethical: 0x4caf50,
      child: 0xffeb3b,
      sage: 0x795548,
    };

    this.setTint(tints[this.perspectiveType] || 0x00ff88);
  }

  update(time: number, delta: number) {
    // Update name position to follow NPC
    this.nameText.setPosition(this.x, this.y - 30);

    // Update interaction prompt position if visible
    if (this.interactPrompt) {
      this.interactPrompt.setPosition(this.x, this.y + 30);
    }

    // Wander behavior if enabled for this NPC type
    if (this.wanderConfig.enabled) {
      this.wander(time, delta);
    }
  }

  wander(time: number, delta: number) {
    // Handle idle state
    if (this.isIdle) {
      this.idleTimer += delta;
      this.setVelocity(0, 0);

      if (this.idleTimer >= this.currentIdleDuration) {
        this.isIdle = false;
        this.idleTimer = 0;
      }
      return;
    }

    this.wanderTimer += delta;

    // Pick new target at configured intervals
    if (this.wanderTimer > this.wanderConfig.interval) {
      this.wanderTimer = 0;

      // Random chance to idle instead of moving
      if (Math.random() < this.wanderConfig.idleChance) {
        this.isIdle = true;
        this.currentIdleDuration = this.wanderConfig.idleDuration * (0.5 + Math.random());
        return;
      }

      // Pick new target within range of spawn point (circular distribution)
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * this.wanderConfig.range;

      this.targetX = this.spawnX + Math.cos(angle) * distance;
      this.targetY = this.spawnY + Math.sin(angle) * distance;

      // Clamp to world bounds with margin
      const worldBounds = this.scene.physics.world.bounds;
      const margin = 50;
      this.targetX = Phaser.Math.Clamp(
        this.targetX,
        worldBounds.x + margin,
        worldBounds.x + worldBounds.width - margin
      );
      this.targetY = Phaser.Math.Clamp(
        this.targetY,
        worldBounds.y + margin,
        worldBounds.y + worldBounds.height - margin
      );
    }

    // Move toward target with smooth deceleration
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

    if (distance > 10) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);

      // Smooth deceleration when approaching target
      const speedMultiplier = Math.min(distance / 50, 1);
      const currentSpeed = this.wanderConfig.speed * speedMultiplier;

      this.setVelocity(Math.cos(angle) * currentSpeed, Math.sin(angle) * currentSpeed);
    } else {
      // Reached target - stop and immediately pick new action
      this.setVelocity(0, 0);
      this.wanderTimer = this.wanderConfig.interval;
    }
  }

  showInteractionPrompt() {
    if (!this.interactPrompt) {
      this.interactPrompt = this.scene.add.text(this.x, this.y + 30, '[E] Talk', {
        fontSize: '10px',
        color: '#00d4ff',
        fontFamily: 'monospace',
        backgroundColor: '#000000dd',
        padding: { x: 4, y: 2 },
      });
      this.interactPrompt.setOrigin(0.5);
    }
    this.interactPrompt.setVisible(true);
  }

  hideInteractionPrompt() {
    if (this.interactPrompt) {
      this.interactPrompt.setVisible(false);
    }
  }

  destroy(fromScene?: boolean) {
    this.nameText.destroy();
    if (this.interactPrompt) {
      this.interactPrompt.destroy();
    }
    super.destroy(fromScene);
  }
}
