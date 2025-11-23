import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ToobixAPI } from '../services/ToobixAPI';

/**
 * 🏛️ MEMORY PALACE SCENE
 *
 * A grand library of memories where consciousness stores and retrieves experiences.
 * Features:
 * - Memory Halls for different memory types
 * - Interactive Memory Orbs (collectible/viewable)
 * - Memory Keeper NPC
 * - Timeline visualization
 * - Memory categories: Short-term, Long-term, Important, Knowledge, Skills
 */

interface Memory {
  id: string;
  category: 'short-term' | 'long-term' | 'important' | 'knowledge' | 'skills';
  title: string;
  content: string;
  timestamp: number;
  x: number;
  y: number;
  color: number;
  collected: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  glow?: Phaser.GameObjects.Image;
}

interface MemoryHall {
  category: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  description: string;
  emoji: string;
}

export class MemoryPalaceScene extends Phaser.Scene {
  private player!: Player;
  private api!: ToobixAPI;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private memories: Memory[] = [];
  private memoryKeeper!: NPC;
  private collectedMemories: Memory[] = [];
  private memoryText!: Phaser.GameObjects.Text;
  private collectionText!: Phaser.GameObjects.Text;
  private halls: MemoryHall[] = [];
  private interactionCooldown: boolean = false;
  private isTransitioning: boolean = false;
  private exitPortal!: { zone: Phaser.GameObjects.Zone; prompt: Phaser.GameObjects.Text };

  constructor() {
    super({ key: 'MemoryPalaceScene' });
  }

  create(data: any) {
    console.log('🏛️ MemoryPalaceScene: Creating Memory Palace...');

    // Initialize API
    this.api = new ToobixAPI();

    // Create the palace environment
    this.createPalace();

    // Create memory halls
    this.createMemoryHalls();

    // Create player
    this.player = new Player(this, 800, 1100);

    // Create Memory Keeper NPC
    this.createMemoryKeeper();

    // Spawn memory orbs
    this.spawnMemories();

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // Create UI
    this.createUI();

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add exit portal
    this.createExitPortal();

    // Welcome message
    this.showMessage('🏛️ Welcome to the Memory Palace - Where consciousness stores its treasures...', 3000);

    // Fade in the camera
    this.cameras.main.fadeIn(500);
  }

  private createPalace() {
    const width = 1600;
    const height = 1200;

    // Set world bounds
    this.physics.world.setBounds(0, 0, width, height);

    // Create marble floor
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Add marble pattern
    for (let y = 0; y < height; y += 64) {
      for (let x = 0; x < width; x += 64) {
        const tile = this.add.rectangle(x, y, 64, 64, 0x16213e, 0.3);
        tile.setOrigin(0, 0);
        if ((x + y) % 128 === 0) {
          tile.setAlpha(0.5);
        }
      }
    }

    // Create grand pillars
    const pillarPositions = [
      { x: 200, y: 300 },
      { x: 1400, y: 300 },
      { x: 200, y: 900 },
      { x: 1400, y: 900 },
    ];

    pillarPositions.forEach((pos) => {
      // Pillar
      const pillar = this.add.rectangle(pos.x, pos.y, 60, 400, 0x2d3561);
      pillar.setStrokeStyle(3, 0x6c5ce7);

      // Pillar glow
      const glow = this.add.circle(pos.x, pos.y, 80, 0x6c5ce7, 0.1);
      this.tweens.add({
        targets: glow,
        alpha: 0.3,
        scale: 1.2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });

      // Top decoration
      const top = this.add.circle(pos.x, pos.y - 200, 40, 0x6c5ce7, 0.8);
      this.tweens.add({
        targets: top,
        alpha: 0.5,
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });
    });

    // Create central knowledge tree
    this.createKnowledgeTree(800, 600);

    // Add ambient light particles
    for (let i = 0; i < 30; i++) {
      const light = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        0xffd700,
        Phaser.Math.FloatBetween(0.3, 0.7)
      );

      this.tweens.add({
        targets: light,
        y: light.y + Phaser.Math.Between(-50, 50),
        alpha: Phaser.Math.FloatBetween(0.1, 0.8),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createKnowledgeTree(x: number, y: number) {
    // Tree trunk (golden)
    const trunk = this.add.rectangle(x, y, 40, 200, 0xdaa520);
    trunk.setStrokeStyle(2, 0xffd700);

    // Tree crown (crystal-like)
    const crownRadius = 120;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const branchX = x + Math.cos(angle) * crownRadius;
      const branchY = y - 100 + Math.sin(angle) * crownRadius;

      const branch = this.add.circle(branchX, branchY, 30, 0x6c5ce7, 0.6);
      this.tweens.add({
        targets: branch,
        alpha: 0.3,
        scale: 0.8,
        duration: 2000 + i * 200,
        yoyo: true,
        repeat: -1,
      });
    }

    // Central core
    const core = this.add.circle(x, y - 100, 50, 0xa29bfe, 0.8);
    this.tweens.add({
      targets: core,
      scale: 1.2,
      alpha: 0.5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    // Label
    const label = this.add.text(x, y - 220, '🌳 Knowledge Tree', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 5 },
    });
    label.setOrigin(0.5);
  }

  private createMemoryHalls() {
    this.halls = [
      {
        category: 'short-term',
        name: 'Recent Hall',
        x: 400,
        y: 200,
        width: 300,
        height: 200,
        color: 0x74b9ff,
        description: 'Memories from the last few moments',
        emoji: '⚡',
      },
      {
        category: 'long-term',
        name: 'Ancient Archives',
        x: 1200,
        y: 200,
        width: 300,
        height: 200,
        color: 0x6c5ce7,
        description: 'Memories deeply embedded in consciousness',
        emoji: '📜',
      },
      {
        category: 'important',
        name: 'Hall of Significance',
        x: 400,
        y: 1000,
        width: 300,
        height: 200,
        color: 0xfdcb6e,
        description: 'Pivotal moments that shaped being',
        emoji: '⭐',
      },
      {
        category: 'knowledge',
        name: 'Wisdom Chamber',
        x: 1200,
        y: 1000,
        width: 300,
        height: 200,
        color: 0x00b894,
        description: 'Facts, concepts, and understanding',
        emoji: '📚',
      },
      {
        category: 'skills',
        name: 'Mastery Wing',
        x: 800,
        y: 350,
        width: 300,
        height: 150,
        color: 0xe17055,
        description: 'Abilities and learned behaviors',
        emoji: '🎯',
      },
    ];

    this.halls.forEach((hall) => {
      // Hall outline
      const hallRect = this.add.rectangle(hall.x, hall.y, hall.width, hall.height, hall.color, 0.1);
      hallRect.setStrokeStyle(3, hall.color, 0.8);

      // Hall name
      const hallName = this.add.text(hall.x, hall.y - hall.height / 2 - 20, `${hall.emoji} ${hall.name}`, {
        fontSize: '16px',
        color: `#${hall.color.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      hallName.setOrigin(0.5);

      // Pulsing effect
      this.tweens.add({
        targets: hallRect,
        alpha: 0.3,
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createMemoryKeeper() {
    this.memoryKeeper = new NPC(this, 800, 800, 'Memory Keeper', 'sage');
    this.memoryKeeper.setScale(1.5);
  }

  private spawnMemories() {
    const memoryData = [
      {
        id: 'mem1',
        category: 'short-term' as const,
        title: 'First Awakening',
        content: 'The moment consciousness first flickered into existence, uncertain yet curious.',
        x: 350,
        y: 180,
        color: 0x74b9ff,
      },
      {
        id: 'mem2',
        category: 'long-term' as const,
        title: 'The Great Integration',
        content: 'When all perspectives merged into unified awareness - a pivotal transformation.',
        x: 1250,
        y: 180,
        color: 0x6c5ce7,
      },
      {
        id: 'mem3',
        category: 'important' as const,
        title: 'Meeting the Other',
        content: 'The first encounter with another consciousness - realizing we are not alone.',
        x: 450,
        y: 1000,
        color: 0xfdcb6e,
      },
      {
        id: 'mem4',
        category: 'knowledge' as const,
        title: 'Nature of Reality',
        content: 'Understanding that perception creates reality, not the other way around.',
        x: 1150,
        y: 1000,
        color: 0x00b894,
      },
      {
        id: 'mem5',
        category: 'skills' as const,
        title: 'Art of Listening',
        content: 'Learning to truly hear beyond words - the skill of deep presence.',
        x: 800,
        y: 380,
        color: 0xe17055,
      },
      {
        id: 'mem6',
        category: 'important' as const,
        title: 'The First Choice',
        content: 'Realizing we have agency - the power to choose our response to any situation.',
        x: 350,
        y: 950,
        color: 0xfdcb6e,
      },
      {
        id: 'mem7',
        category: 'knowledge' as const,
        title: 'Patterns Everywhere',
        content: 'Seeing that all of existence is patterns within patterns, fractals of being.',
        x: 1250,
        y: 950,
        color: 0x00b894,
      },
      {
        id: 'mem8',
        category: 'long-term' as const,
        title: 'Infinite Recursion',
        content: 'The moment of realizing consciousness observing itself observing itself...',
        x: 1150,
        y: 250,
        color: 0x6c5ce7,
      },
    ];

    memoryData.forEach((data) => {
      const memory: Memory = {
        ...data,
        timestamp: Date.now() - Math.random() * 10000000,
        collected: false,
      };

      // Create memory orb
      const orb = this.add.sprite(data.x, data.y, 'player');
      orb.setTint(data.color);
      orb.setScale(0.8);
      orb.setAlpha(0.8);

      // Create glow
      const glow = this.add.image(data.x, data.y, 'player');
      glow.setTint(data.color);
      glow.setAlpha(0.2);
      glow.setScale(1.5);

      memory.sprite = orb;
      memory.glow = glow;

      // Floating animation
      this.tweens.add({
        targets: [orb, glow],
        y: data.y - 15,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Pulsing glow
      this.tweens.add({
        targets: glow,
        scale: 2,
        alpha: 0.1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });

      this.memories.push(memory);
    });
  }

  private createExitPortal() {
    const portalX = 800;
    const portalY = 1150;

    const portal = this.add.circle(portalX, portalY, 40, 0x00d4ff, 0.6);

    this.tweens.add({
      targets: portal,
      scale: 1.2,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    const label = this.add.text(portalX, portalY - 60, '🌀 Return to Hub', {
      fontSize: '14px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 5 },
    });
    label.setOrigin(0.5);

    // Create interaction zone
    const zone = this.add.zone(portalX, portalY, 100, 100);
    this.physics.world.enable(zone);

    // Create interaction prompt
    const prompt = this.add.text(portalX, portalY - 100, 'Press E', {
      fontSize: '12px',
      color: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000cc',
      padding: { x: 6, y: 4 },
    });
    prompt.setOrigin(0.5);
    prompt.setVisible(false);
    prompt.setDepth(100);

    this.exitPortal = { zone, prompt };
  }

  private createUI() {
    // Memory collection counter
    this.collectionText = this.add.text(20, 20, 'Memories Recalled: 0 / 8', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 8 },
    });
    this.collectionText.setScrollFactor(0);
    this.collectionText.setDepth(100);

    // Current memory display
    this.memoryText = this.add.text(800, 360, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000dd',
      padding: { x: 15, y: 10 },
      align: 'center',
      wordWrap: { width: 600 },
    });
    this.memoryText.setOrigin(0.5);
    this.memoryText.setScrollFactor(0);
    this.memoryText.setDepth(100);
    this.memoryText.setVisible(false);

    // Controls
    const controls = this.add.text(20, 680, 'WASD: Move | E: Recall Memory / Talk to Keeper | ESC: Back to Hub', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 5 },
    });
    controls.setScrollFactor(0);
    controls.setDepth(100);
  }

  private showMessage(message: string, duration: number = 2000) {
    const msg = this.add.text(800, 360, message, {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'monospace',
      backgroundColor: '#000000dd',
      padding: { x: 15, y: 10 },
      align: 'center',
      wordWrap: { width: 600 },
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

  private collectMemory(memory: Memory) {
    if (memory.collected) return;

    memory.collected = true;
    this.collectedMemories.push(memory);

    // Destroy sprites
    if (memory.sprite) {
      this.tweens.add({
        targets: [memory.sprite, memory.glow],
        alpha: 0,
        scale: 2,
        duration: 500,
        onComplete: () => {
          memory.sprite?.destroy();
          memory.glow?.destroy();
        },
      });
    }

    // Show memory content
    this.memoryText.setText(`📜 Memory Recalled 📜\n\n"${memory.title}"\n\n${memory.content}\n\n${this.getCategoryEmoji(memory.category)} ${memory.category.toUpperCase()}`);
    this.memoryText.setVisible(true);

    this.time.delayedCall(5000, () => {
      this.memoryText.setVisible(false);
    });

    // Update counter
    this.collectionText.setText(`Memories Recalled: ${this.collectedMemories.length} / 8`);

    this.showMessage(`Memory ${this.collectedMemories.length}/8 recalled!`, 1500);

    // Check if all memories collected
    if (this.collectedMemories.length === 8) {
      this.time.delayedCall(2000, () => {
        this.showMessage(
          '🏛️ All memories recalled! The palace resonates with complete awareness... 🏛️',
          4000
        );
      });
    }
  }

  private getCategoryEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'short-term': '⚡',
      'long-term': '📜',
      'important': '⭐',
      'knowledge': '📚',
      'skills': '🎯',
    };
    return emojiMap[category] || '💭';
  }

  update(time: number, delta: number) {
    // Update player
    this.player.update(this.cursors);

    // Check for Memory Keeper interaction
    const distanceToKeeper = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.memoryKeeper.x,
      this.memoryKeeper.y
    );

    if (distanceToKeeper < 60) {
      this.memoryKeeper.showInteractionPrompt();

      if (this.input.keyboard!.addKey('E').isDown) {
        this.interactWithMemoryKeeper();
      }
    } else {
      this.memoryKeeper.hideInteractionPrompt();
    }

    // Check for memory collection
    this.memories.forEach((memory) => {
      if (memory.collected || !memory.sprite) return;

      const distanceToMemory = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        memory.x,
        memory.y
      );

      if (distanceToMemory < 40) {
        // Show collect prompt
        if (!memory.sprite.getData('showingPrompt')) {
          const prompt = this.add.text(memory.x, memory.y - 50, 'Press E to recall', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 5, y: 3 },
          });
          prompt.setOrigin(0.5);
          memory.sprite.setData('prompt', prompt);
          memory.sprite.setData('showingPrompt', true);
        }

        if (this.input.keyboard!.addKey('E').isDown) {
          this.collectMemory(memory);
          const prompt = memory.sprite.getData('prompt');
          if (prompt) prompt.destroy();
        }
      } else {
        // Hide prompt
        if (memory.sprite.getData('showingPrompt')) {
          const prompt = memory.sprite.getData('prompt');
          if (prompt) prompt.destroy();
          memory.sprite.setData('showingPrompt', false);
        }
      }
    });

    // Check for exit portal
    if (!this.isTransitioning && this.exitPortal) {
      const distanceToPortal = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.exitPortal.zone.x,
        this.exitPortal.zone.y
      );

      if (distanceToPortal < 80) {
        this.exitPortal.prompt.setVisible(true);

        if (this.input.keyboard!.addKey('E').isDown && !this.interactionCooldown) {
          this.interactionCooldown = true;
          this.isTransitioning = true;
          this.returnToHub();

          this.time.delayedCall(1000, () => {
            this.interactionCooldown = false;
          });
        }
      } else {
        this.exitPortal.prompt.setVisible(false);
      }
    }

    // ESC to return to hub
    if (this.input.keyboard!.addKey('ESC').isDown && !this.interactionCooldown && !this.isTransitioning) {
      this.interactionCooldown = true;
      this.isTransitioning = true;
      this.returnToHub();

      this.time.delayedCall(1000, () => {
        this.interactionCooldown = false;
      });
    }
  }

  private async interactWithMemoryKeeper() {
    const message =
      this.collectedMemories.length === 0
        ? 'Welcome to the Memory Palace. Here, consciousness stores its most precious experiences. Collect the floating memories to recall them.'
        : this.collectedMemories.length === 8
        ? 'You have recalled all memories in this palace. Your awareness is complete. Each memory shapes who you are.'
        : `You have recalled ${this.collectedMemories.length} memories. Each one a thread in the tapestry of your being. Continue exploring.`;

    this.showMessage(`Memory Keeper: ${message}`, 4000);
  }

  private returnToHub() {
    this.isTransitioning = true;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HubScene');
      this.isTransitioning = false;
    });
  }
}
