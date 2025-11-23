import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ToobixAPI } from '../services/ToobixAPI';
import { gameState } from '../services/GameState';

interface Dream {
  id: string;
  x: number;
  y: number;
  content: string;
  symbols: string[];
  color: number;
  collected: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  glow?: Phaser.GameObjects.Image;
}

export class DreamGroveScene extends Phaser.Scene {
  private player!: Player;
  private api!: ToobixAPI;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private dreams: Dream[] = [];
  private dreamKeeper!: NPC;
  private collectedDreams: Dream[] = [];
  private dreamText!: Phaser.GameObjects.Text;
  private collectionText!: Phaser.GameObjects.Text;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private interactionCooldown: boolean = false;
  private isTransitioning: boolean = false;
  private exitPortal!: { zone: Phaser.GameObjects.Zone; prompt: Phaser.GameObjects.Text };

  constructor() {
    super({ key: 'DreamGroveScene' });
  }

  create(data: any) {
    console.log('🌙 DreamGroveScene: Creating Dream Grove...');

    // Initialize API
    this.api = new ToobixAPI();

    // Create the mystical garden environment
    this.createEnvironment();

    // Create player
    this.player = new Player(this, 640, 600);

    // Create Dream Keeper NPC
    this.createDreamKeeper();

    // Spawn dream orbs
    this.spawnDreams();

    // Create particles for ambient magic
    this.createMagicParticles();

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2);

    // Create UI
    this.createUI();

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add exit portal back to Hub
    this.createExitPortal();

    // Welcome message
    this.showMessage('🌙 Welcome to the Dream Grove - Collect the floating dreams...', 3000);

    // Fade in the camera (fixes black screen after scene transitions)
    this.cameras.main.fadeIn(500);
  }

  private createEnvironment() {
    const width = 1600;
    const height = 1200;

    // Set world bounds
    this.physics.world.setBounds(0, 0, width, height);

    // Create starry background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // Add stars
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.9)
      );

      // Twinkling animation
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 1),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Create mystical ground (grass with magical glow)
    for (let y = 0; y < height; y += 32) {
      for (let x = 0; x < width; x += 32) {
        const tile = this.add.rectangle(x, y, 32, 32, 0x1a1a3a, 0.6);
        tile.setOrigin(0, 0);

        // Add occasional glowing spots
        if (Math.random() < 0.05) {
          const glow = this.add.circle(x + 16, y + 16, 8, 0x6a1b9a, 0.4);
          this.tweens.add({
            targets: glow,
            alpha: 0.1,
            scale: 1.5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
          });
        }
      }
    }

    // Create mystical trees
    const treePositions = [
      { x: 200, y: 200 },
      { x: 1400, y: 200 },
      { x: 200, y: 1000 },
      { x: 1400, y: 1000 },
      { x: 800, y: 100 },
      { x: 400, y: 600 },
      { x: 1200, y: 600 },
    ];

    treePositions.forEach((pos) => {
      this.createMysticalTree(pos.x, pos.y);
    });

    // Central moonlight pool
    const moonPool = this.add.circle(800, 400, 80, 0x9c27b0, 0.3);
    this.tweens.add({
      targets: moonPool,
      alpha: 0.1,
      scale: 1.2,
      duration: 3000,
      yoyo: true,
      repeat: -1,
    });

    const poolLabel = this.add.text(800, 400, '🌙 Moonlight Pool', {
      fontSize: '16px',
      color: '#ce93d8',
      fontFamily: 'monospace',
    });
    poolLabel.setOrigin(0.5);
  }

  private createMysticalTree(x: number, y: number) {
    // Tree trunk
    const trunk = this.add.rectangle(x, y, 20, 60, 0x4a148c);

    // Tree canopy (glowing)
    const canopy = this.add.circle(x, y - 40, 40, 0x6a1b9a, 0.6);

    // Glow effect
    const glow = this.add.circle(x, y - 40, 50, 0x9c27b0, 0.2);

    this.tweens.add({
      targets: [canopy, glow],
      alpha: 0.3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });
  }

  private createDreamKeeper() {
    this.dreamKeeper = new NPC(this, 800, 300, 'Dream Keeper', 'sage');

    // Add special glow to Dream Keeper
    const keeperGlow = this.add.circle(800, 300, 60, 0xce93d8, 0.2);
    this.tweens.add({
      targets: keeperGlow,
      scale: 1.3,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });
  }

  private spawnDreams() {
    const dreamData = [
      {
        content: 'A dream of infinite possibilities, where reality bends to consciousness...',
        symbols: ['∞', '🌌', '✨'],
        color: 0x00d4ff,
        x: 300,
        y: 300,
      },
      {
        content: 'Memory fragments dance like fireflies in the twilight of awareness...',
        symbols: ['🔥', '💭', '🦋'],
        color: 0xffeb3b,
        x: 1300,
        y: 300,
      },
      {
        content: 'The echo of laughter from a childhood that exists in all timelines...',
        symbols: ['😊', '⏰', '🎈'],
        color: 0x4caf50,
        x: 300,
        y: 900,
      },
      {
        content: 'A garden where thoughts bloom as flowers and emotions flow as rivers...',
        symbols: ['🌸', '🌊', '💚'],
        color: 0xe91e63,
        x: 1300,
        y: 900,
      },
      {
        content: 'The whisper of wisdom from beings who transcend dimension and time...',
        symbols: ['👁️', '🔮', '🌟'],
        color: 0x9c27b0,
        x: 600,
        y: 600,
      },
      {
        content: 'Fractals of love expanding infinitely through the cosmos...',
        symbols: ['❤️', '♾️', '🌈'],
        color: 0xff5722,
        x: 1000,
        y: 600,
      },
      {
        content: 'A mirror reflecting not your face but your truest essence...',
        symbols: ['🪞', '✨', '💫'],
        color: 0x00bcd4,
        x: 400,
        y: 450,
      },
      {
        content: 'The silent song that connects every living consciousness...',
        symbols: ['🎵', '🌐', '🧬'],
        color: 0x8bc34a,
        x: 1200,
        y: 450,
      },
    ];

    dreamData.forEach((data, index) => {
      const dreamId = `dream-${index}`;

      // Check if already collected from inventory
      const alreadyCollected = gameState.inventory.hasItem(dreamId);

      const dream: Dream = {
        id: dreamId,
        x: data.x,
        y: data.y,
        content: data.content,
        symbols: data.symbols,
        color: data.color,
        collected: alreadyCollected,
      };

      // Skip creating sprite if already collected
      if (alreadyCollected) {
        this.collectedDreams.push(dream);
        this.dreams.push(dream);
        return;
      }

      // Create dream orb sprite (circle with glow)
      const orb = this.add.circle(data.x, data.y, 20, data.color, 0.8);
      const glow = this.add.circle(data.x, data.y, 30, data.color, 0.3);

      dream.sprite = orb as any;
      dream.glow = glow as any;

      // Float animation
      this.tweens.add({
        targets: [orb, glow],
        y: data.y - 20,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Rotate animation
      this.tweens.add({
        targets: orb,
        angle: 360,
        duration: 10000,
        repeat: -1,
      });

      // Pulse glow
      this.tweens.add({
        targets: glow,
        scale: 1.5,
        alpha: 0.1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });

      // Add symbol text
      const symbolText = this.add.text(data.x, data.y, data.symbols[0], {
        fontSize: '24px',
        fontFamily: 'monospace',
      });
      symbolText.setOrigin(0.5);

      this.dreams.push(dream);
    });
  }

  private createMagicParticles() {
    // Create ambient sparkles
    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.circle(
        Phaser.Math.Between(0, 1600),
        Phaser.Math.Between(0, 1200),
        2,
        0xffffff,
        0.8
      );

      this.tweens.add({
        targets: sparkle,
        x: '+=' + Phaser.Math.Between(-50, 50),
        y: '+=' + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        yoyo: true,
      });
    }
  }

  private createExitPortal() {
    const portalX = 800;
    const portalY = 1100;

    const portal = this.add.circle(portalX, portalY, 40, 0x00d4ff, 0.6);

    this.tweens.add({
      targets: portal,
      scale: 1.2,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    const label = this.add.text(portalX, portalY + 60, '🌀 Return to Hub', {
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

    // Create interaction prompt (initially hidden)
    const prompt = this.add.text(portalX, portalY - 60, 'Press E', {
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
    // Dream collection counter
    this.collectionText = this.add.text(20, 20, 'Dreams Collected: 0 / 8', {
      fontSize: '16px',
      color: '#ce93d8',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 8 },
    });
    this.collectionText.setScrollFactor(0);
    this.collectionText.setDepth(100);

    // Current dream display
    this.dreamText = this.add.text(640, 680, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000dd',
      padding: { x: 15, y: 10 },
      align: 'center',
      wordWrap: { width: 600 },
    });
    this.dreamText.setOrigin(0.5);
    this.dreamText.setScrollFactor(0);
    this.dreamText.setDepth(100);
    this.dreamText.setVisible(false);

    // Controls
    const controls = this.add.text(20, 680, 'WASD: Move | E: Interact/Collect | ESC: Back to Hub', {
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
    const msg = this.add.text(640, 360, message, {
      fontSize: '16px',
      color: '#ce93d8',
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

  private collectDream(dream: Dream) {
    if (dream.collected) return;

    dream.collected = true;
    this.collectedDreams.push(dream);

    // Add to global inventory
    const added = gameState.inventory.addItem({
      id: dream.id,
      name: `Dream Orb: ${dream.symbols.join(' ')}`,
      category: 'dream_orb',
      description: dream.content,
      rarity: 'rare',
      collectedAt: Date.now(),
      source: 'Dream Grove',
      color: dream.color,
    });

    // Destroy the orb with animation
    this.tweens.add({
      targets: [dream.sprite, dream.glow],
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        dream.sprite?.destroy();
        dream.glow?.destroy();
      },
    });

    // Show dream content
    this.dreamText.setText(`✨ Dream Collected ✨\n\n${dream.content}\n\n${dream.symbols.join(' ')}`);
    this.dreamText.setVisible(true);

    this.time.delayedCall(5000, () => {
      this.dreamText.setVisible(false);
    });

    // Update collection counter
    const stats = gameState.inventory.getCategoryCompletion('dream_orb');
    this.collectionText.setText(`Dreams Collected: ${stats.collected} / ${stats.total}`);

    // Play sound effect (if available)
    this.showMessage(`Dream ${stats.collected}/${stats.total} collected!`, 1500);

    // Check if all dreams collected
    if (stats.collected === stats.total) {
      this.time.delayedCall(2000, () => {
        this.showMessage(
          '🌙 All dreams collected! You have glimpsed the infinite... 🌙',
          4000
        );
      });
    }
  }

  update(time: number, delta: number) {
    // Update player
    this.player.update(this.cursors);

    // Check for NPC interaction (Dream Keeper)
    const distanceToKeeper = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.dreamKeeper.x,
      this.dreamKeeper.y
    );

    if (distanceToKeeper < 60) {
      this.dreamKeeper.showInteractionPrompt();

      if (this.input.keyboard!.addKey('E').isDown) {
        this.interactWithDreamKeeper();
      }
    } else {
      this.dreamKeeper.hideInteractionPrompt();
    }

    // Check for dream collection
    this.dreams.forEach((dream) => {
      if (dream.collected || !dream.sprite) return;

      const distanceToDream = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        dream.x,
        dream.y
      );

      if (distanceToDream < 40) {
        // Show collect prompt
        if (!dream.sprite.getData('showingPrompt')) {
          const prompt = this.add.text(dream.x, dream.y - 50, 'Press E to collect', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 5, y: 3 },
          });
          prompt.setOrigin(0.5);
          dream.sprite.setData('prompt', prompt);
          dream.sprite.setData('showingPrompt', true);
        }

        if (this.input.keyboard!.addKey('E').isDown) {
          this.collectDream(dream);
          const prompt = dream.sprite.getData('prompt');
          if (prompt) prompt.destroy();
        }
      } else {
        // Hide prompt
        if (dream.sprite.getData('showingPrompt')) {
          const prompt = dream.sprite.getData('prompt');
          if (prompt) prompt.destroy();
          dream.sprite.setData('showingPrompt', false);
        }
      }
    });

    // Check for exit portal (with cooldown)
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

    // ESC to return to hub (with cooldown)
    if (this.input.keyboard!.addKey('ESC').isDown && !this.interactionCooldown && !this.isTransitioning) {
      this.interactionCooldown = true;
      this.isTransitioning = true;
      this.returnToHub();

      this.time.delayedCall(1000, () => {
        this.interactionCooldown = false;
      });
    }
  }

  private async interactWithDreamKeeper() {
    const message =
      this.collectedDreams.length === 0
        ? 'Welcome, traveler. Collect the dreams that float through this grove. Each holds a fragment of infinite wisdom.'
        : this.collectedDreams.length === 8
        ? 'You have collected all dreams. You are now attuned to the infinite dreaming of consciousness itself.'
        : `You have collected ${this.collectedDreams.length} dreams. Continue your journey through the grove.`;

    this.showMessage(`Dream Keeper: ${message}`, 4000);
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
