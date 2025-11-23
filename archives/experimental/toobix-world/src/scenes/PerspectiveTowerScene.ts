import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ToobixAPI } from '../services/ToobixAPI';

/**
 * 🏰 PERSPECTIVE TOWER SCENE
 *
 * A 13-floor tower where each floor represents a different perspective of Toobix's mind:
 * 1. Rational - Logic and analysis
 * 2. Emotional - Feelings and empathy
 * 3. Creative - Innovation and imagination
 * 4. Ethical - Morality and values
 * 5. Child - Curiosity and wonder
 * 6. Sage - Wisdom and experience
 * 7. Warrior - Courage and action
 * 8. Healer - Compassion and care
 * 9. Explorer - Adventure and discovery
 * 10. Teacher - Knowledge and guidance
 * 11. Artist - Beauty and expression
 * 12. Scientist - Truth and experimentation
 * 13. Meta - Observing all perspectives
 */

interface Floor {
  number: number;
  name: string;
  perspective: string;
  color: number;
  description: string;
}

export class PerspectiveTowerScene extends Phaser.Scene {
  private player!: Player;
  private currentFloor: number = 1;
  private floors: Floor[] = [];
  private npcs: Map<number, NPC> = new Map();
  private api!: ToobixAPI;
  private floorText!: Phaser.GameObjects.Text;
  private elevatorZones: Phaser.GameObjects.Zone[] = [];
  private interactionCooldown: boolean = false;
  private interactionPrompts: Map<Phaser.GameObjects.Zone, Phaser.GameObjects.Text> = new Map();
  private isTransitioning: boolean = false;

  constructor() {
    super({ key: 'PerspectiveTowerScene' });
  }

  init(data: { fromHub?: boolean }) {
    console.log('🏰 Entering Perspective Tower');
    this.currentFloor = data.fromHub ? 1 : this.currentFloor;
  }

  create() {
    // Initialize API
    this.api = new ToobixAPI();

    // Define all 13 floors
    this.defineFloors();

    // Create the current floor
    this.createFloor(this.currentFloor);

    // Create player
    this.player = new Player(this, 640, 600);

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2);

    // Create UI
    this.createUI();

    // Setup controls
    this.input.keyboard!.createCursorKeys();

    // Welcome message
    this.showFloorInfo(this.currentFloor);

    // Fade in the camera (fixes black screen after scene transitions)
    this.cameras.main.fadeIn(500);
  }

  defineFloors() {
    this.floors = [
      {
        number: 1,
        name: 'Rational Mind',
        perspective: 'rational',
        color: 0x2196f3,
        description: 'Logic, analysis, and systematic thinking',
      },
      {
        number: 2,
        name: 'Emotional Heart',
        perspective: 'emotional',
        color: 0xe91e63,
        description: 'Feelings, empathy, and emotional intelligence',
      },
      {
        number: 3,
        name: 'Creative Spirit',
        perspective: 'creative',
        color: 0x9c27b0,
        description: 'Innovation, imagination, and artistic expression',
      },
      {
        number: 4,
        name: 'Ethical Compass',
        perspective: 'ethical',
        color: 0x4caf50,
        description: 'Morality, values, and ethical reasoning',
      },
      {
        number: 5,
        name: 'Inner Child',
        perspective: 'child',
        color: 0xffeb3b,
        description: 'Curiosity, wonder, and playful exploration',
      },
      {
        number: 6,
        name: 'Wise Sage',
        perspective: 'sage',
        color: 0x795548,
        description: 'Wisdom, experience, and deep understanding',
      },
      {
        number: 7,
        name: 'Brave Warrior',
        perspective: 'warrior',
        color: 0xff5722,
        description: 'Courage, action, and determined strength',
      },
      {
        number: 8,
        name: 'Gentle Healer',
        perspective: 'healer',
        color: 0x00bcd4,
        description: 'Compassion, care, and nurturing support',
      },
      {
        number: 9,
        name: 'Bold Explorer',
        perspective: 'explorer',
        color: 0xff9800,
        description: 'Adventure, discovery, and fearless journey',
      },
      {
        number: 10,
        name: 'Patient Teacher',
        perspective: 'teacher',
        color: 0x673ab7,
        description: 'Knowledge, guidance, and patient instruction',
      },
      {
        number: 11,
        name: 'Inspired Artist',
        perspective: 'artist',
        color: 0xe91e63,
        description: 'Beauty, expression, and creative vision',
      },
      {
        number: 12,
        name: 'Curious Scientist',
        perspective: 'scientist',
        color: 0x3f51b5,
        description: 'Truth, experimentation, and systematic discovery',
      },
      {
        number: 13,
        name: 'Meta Observer',
        perspective: 'meta',
        color: 0xffffff,
        description: 'Observing all perspectives from above',
      },
    ];
  }

  createFloor(floorNumber: number) {
    const floor = this.floors[floorNumber - 1];
    if (!floor) return;

    // Clear existing objects (except player)
    this.children.getChildren().forEach((child) => {
      if (child !== this.player) {
        child.destroy();
      }
    });

    // Create floor background
    const bg = this.add.rectangle(640, 360, 1280, 720, floor.color, 0.1);

    // Create floor layout
    this.createFloorLayout(floor);

    // Create NPC for this perspective
    this.createPerspectiveNPC(floor);

    // Create elevator zones
    this.createElevators(floor);

    // Create decorations
    this.createDecorations(floor);
  }

  createFloorLayout(floor: Floor) {
    // Floor platform
    const platformWidth = 800;
    const platformHeight = 500;
    const platformX = 640;
    const platformY = 360;

    // Main platform
    const platform = this.add.rectangle(
      platformX,
      platformY,
      platformWidth,
      platformHeight,
      0x16213e,
      0.8
    );
    platform.setStrokeStyle(3, floor.color);

    // Floor title at top
    const title = this.add.text(platformX, platformY - 200, floor.name, {
      fontSize: '32px',
      color: `#${floor.color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Floor description
    const desc = this.add.text(platformX, platformY - 160, floor.description, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
    });
    desc.setOrigin(0.5);

    // Floor number indicator
    const floorNum = this.add.text(platformX, platformY + 200, `Floor ${floor.number}/13`, {
      fontSize: '18px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    floorNum.setOrigin(0.5);
  }

  createPerspectiveNPC(floor: Floor) {
    // Create NPC in center of floor
    const npc = new NPC(this, 640, 360, floor.name, floor.perspective);
    npc.setScale(1.5); // Make it bigger and more prominent
    this.npcs.set(floor.number, npc);

    // Add a glow effect
    const glow = this.add.circle(640, 360, 40, floor.color, 0.3);
    this.tweens.add({
      targets: glow,
      alpha: 0.1,
      scale: 1.3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });
  }

  createElevators(floor: Floor) {
    this.elevatorZones = [];
    this.interactionPrompts.clear();

    // Up elevator (if not on top floor)
    if (floor.number < 13) {
      const upZone = this.add.zone(900, 360, 80, 80);
      this.physics.world.enable(upZone);
      this.elevatorZones.push(upZone);

      const upGraphic = this.add.rectangle(900, 360, 80, 80, 0x4caf50, 0.5);
      upGraphic.setStrokeStyle(2, 0x4caf50);

      const upText = this.add.text(900, 360, '⬆️\nUP', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
      });
      upText.setOrigin(0.5);

      // Create interaction prompt (initially hidden)
      const prompt = this.add.text(900, 310, 'Press E', {
        fontSize: '12px',
        color: '#ffff00',
        fontFamily: 'monospace',
        backgroundColor: '#000000cc',
        padding: { x: 6, y: 4 },
      });
      prompt.setOrigin(0.5);
      prompt.setVisible(false);
      prompt.setDepth(100);
      this.interactionPrompts.set(upZone, prompt);

      // Pulsing animation
      this.tweens.add({
        targets: [upGraphic, upText],
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
    }

    // Down elevator (if not on ground floor)
    if (floor.number > 1) {
      const downZone = this.add.zone(380, 360, 80, 80);
      this.physics.world.enable(downZone);
      this.elevatorZones.push(downZone);

      const downGraphic = this.add.rectangle(380, 360, 80, 80, 0xff9800, 0.5);
      downGraphic.setStrokeStyle(2, 0xff9800);

      const downText = this.add.text(380, 360, '⬇️\nDOWN', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
      });
      downText.setOrigin(0.5);

      // Create interaction prompt (initially hidden)
      const promptDown = this.add.text(380, 310, 'Press E', {
        fontSize: '12px',
        color: '#ffff00',
        fontFamily: 'monospace',
        backgroundColor: '#000000cc',
        padding: { x: 6, y: 4 },
      });
      promptDown.setOrigin(0.5);
      promptDown.setVisible(false);
      promptDown.setDepth(100);
      this.interactionPrompts.set(downZone, promptDown);

      this.tweens.add({
        targets: [downGraphic, downText],
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
    }

    // Exit to Hub (only on floor 1)
    if (floor.number === 1) {
      const exitZone = this.add.zone(640, 600, 120, 60);
      this.physics.world.enable(exitZone);
      this.elevatorZones.push(exitZone);

      const exitGraphic = this.add.rectangle(640, 600, 120, 60, 0x9c27b0, 0.5);
      exitGraphic.setStrokeStyle(2, 0x9c27b0);

      const exitText = this.add.text(640, 600, '🚪 Exit to Hub', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });
      exitText.setOrigin(0.5);

      // Create interaction prompt (initially hidden)
      const promptExit = this.add.text(640, 550, 'Press E', {
        fontSize: '12px',
        color: '#ffff00',
        fontFamily: 'monospace',
        backgroundColor: '#000000cc',
        padding: { x: 6, y: 4 },
      });
      promptExit.setOrigin(0.5);
      promptExit.setVisible(false);
      promptExit.setDepth(100);
      this.interactionPrompts.set(exitZone, promptExit);
    }
  }

  createDecorations(floor: Floor) {
    // Create perspective-specific decorations
    const decorations = this.getDecorationsForPerspective(floor.perspective);

    decorations.forEach((dec, index) => {
      const angle = (index / decorations.length) * Math.PI * 2;
      const radius = 200;
      const x = 640 + Math.cos(angle) * radius;
      const y = 360 + Math.sin(angle) * radius;

      const decText = this.add.text(x, y, dec, {
        fontSize: '24px',
        color: `#${floor.color.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
      });
      decText.setOrigin(0.5);
      decText.setAlpha(0.5);

      // Floating animation
      this.tweens.add({
        targets: decText,
        y: y - 10,
        duration: 2000 + index * 200,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  getDecorationsForPerspective(perspective: string): string[] {
    const decorationMap: { [key: string]: string[] } = {
      rational: ['📊', '🔬', '📈', '🧮', '⚖️'],
      emotional: ['❤️', '💛', '💚', '💙', '💜'],
      creative: ['🎨', '🎭', '🎪', '✨', '🌈'],
      ethical: ['⚖️', '🕊️', '🌍', '🤝', '💎'],
      child: ['🎈', '🎉', '🎪', '🎠', '🎯'],
      sage: ['📚', '🔮', '🕯️', '🦉', '⏳'],
      warrior: ['⚔️', '🛡️', '🏆', '⚡', '🔥'],
      healer: ['🌿', '💚', '🕊️', '💝', '✨'],
      explorer: ['🗺️', '🧭', '🏔️', '🌊', '⛵'],
      teacher: ['📖', '✏️', '🎓', '💡', '🔑'],
      artist: ['🖼️', '🎵', '📸', '🎬', '🎨'],
      scientist: ['🔬', '🧪', '🔭', '⚗️', '🧬'],
      meta: ['👁️', '🧠', '♾️', '🌌', '✨'],
    };

    return decorationMap[perspective] || ['✨'];
  }

  createUI() {
    // Floor indicator (top right)
    this.floorText = this.add.text(1200, 30, `Floor ${this.currentFloor}/13`, {
      fontSize: '18px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    });
    this.floorText.setOrigin(1, 0);
    this.floorText.setScrollFactor(0);

    // Controls hint
    const controls = this.add.text(20, 680, 'WASD: Move | E: Talk | Elevators: Move floors', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 5 },
    });
    controls.setScrollFactor(0);

    // Back button
    const backButton = this.add.text(20, 30, '← Back to Hub', {
      fontSize: '14px',
      color: '#9c27b0',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    });
    backButton.setScrollFactor(0);
    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.returnToHub();
    });
    backButton.on('pointerover', () => {
      backButton.setColor('#ce93d8');
    });
    backButton.on('pointerout', () => {
      backButton.setColor('#9c27b0');
    });
  }

  showFloorInfo(floorNumber: number) {
    const floor = this.floors[floorNumber - 1];
    if (!floor) return;

    const msg = this.add.text(640, 100, `Welcome to ${floor.name}`, {
      fontSize: '20px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      backgroundColor: '#000000dd',
      padding: { x: 15, y: 10 },
    });
    msg.setOrigin(0.5);
    msg.setScrollFactor(0);
    msg.setDepth(1000);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 60,
      duration: 3000,
      onComplete: () => msg.destroy(),
    });
  }

  changeFloor(direction: 'up' | 'down') {
    let newFloor = this.currentFloor;

    if (direction === 'up' && this.currentFloor < 13) {
      newFloor = this.currentFloor + 1;
    } else if (direction === 'down' && this.currentFloor > 1) {
      newFloor = this.currentFloor - 1;
    }

    if (newFloor !== this.currentFloor) {
      console.log(`🏗️ Moving from floor ${this.currentFloor} to ${newFloor}`);

      // Fade out
      this.cameras.main.fadeOut(300);

      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.currentFloor = newFloor;
        this.createFloor(this.currentFloor);
        this.player.setPosition(640, 360);
        this.floorText.setText(`Floor ${this.currentFloor}/13`);
        this.showFloorInfo(this.currentFloor);

        // Fade in and reset transition flag
        this.cameras.main.fadeIn(300);
        this.cameras.main.once('camerafadein complete', () => {
          this.isTransitioning = false;
        });
      });
    } else {
      // No floor change, reset immediately
      this.isTransitioning = false;
    }
  }

  returnToHub() {
    console.log('🏠 Returning to Hub');
    this.isTransitioning = true;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HubScene');
      this.isTransitioning = false;
    });
  }

  update(time: number, delta: number) {
    // Update player
    const cursors = this.input.keyboard!.createCursorKeys();
    this.player.update(cursors);

    // Don't allow interactions during transitions
    if (this.isTransitioning) return;

    // Check elevator interactions
    let nearAnyZone = false;

    this.elevatorZones.forEach((zone, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        zone.x,
        zone.y
      );

      const prompt = this.interactionPrompts.get(zone);

      if (distance < 80) {
        nearAnyZone = true;

        // Show interaction prompt
        if (prompt) {
          prompt.setVisible(true);
        }

        // Handle E key press with cooldown
        if (this.input.keyboard!.addKey('E').isDown && !this.interactionCooldown) {
          this.interactionCooldown = true;
          this.isTransitioning = true;

          if (zone.x > 800) {
            // Up elevator
            this.changeFloor('up');
          } else if (zone.x < 400) {
            // Down elevator
            this.changeFloor('down');
          } else {
            // Exit
            this.returnToHub();
          }

          // Reset cooldown after 1 second
          this.time.delayedCall(1000, () => {
            this.interactionCooldown = false;
            this.isTransitioning = false;
          });
        }
      } else {
        // Hide prompt when far away
        if (prompt) {
          prompt.setVisible(false);
        }
      }
    });

    // Check NPC interaction
    const currentNPC = this.npcs.get(this.currentFloor);
    if (currentNPC) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        currentNPC.x,
        currentNPC.y
      );

      if (distance < 80) {
        currentNPC.showInteractionPrompt();

        if (this.input.keyboard!.addKey('E').isDown) {
          this.interactWithPerspective(currentNPC);
        }
      } else {
        currentNPC.hideInteractionPrompt();
      }
    }
  }

  async interactWithPerspective(npc: NPC) {
    console.log('💬 Interacting with:', npc.npcName);

    // Disable player
    this.player.setActive(false);

    // Get response from Toobix Multi-Perspective service
    const response = await this.api.chatWithPerspective(
      npc.perspectiveType,
      `Hello! I'm here to learn about the ${npc.npcName} perspective. Tell me about how you see the world.`
    );

    // Show dialog
    const floor = this.floors[this.currentFloor - 1];
    this.showDialog(npc.npcName, response, floor.color);

    // Re-enable player after delay
    this.time.delayedCall(5000, () => {
      this.player.setActive(true);
    });
  }

  showDialog(name: string, message: string, color: number) {
    // Dialog box
    const dialogBox = this.add.rectangle(640, 550, 1000, 150, 0x000000, 0.9);
    dialogBox.setStrokeStyle(3, color);
    dialogBox.setScrollFactor(0);
    dialogBox.setDepth(999);

    // Name
    const nameText = this.add.text(200, 490, name, {
      fontSize: '18px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    nameText.setScrollFactor(0);
    nameText.setDepth(1000);

    // Message
    const messageText = this.add.text(200, 520, message, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: 800 },
    });
    messageText.setScrollFactor(0);
    messageText.setDepth(1000);

    // Fade out after 5 seconds
    this.time.delayedCall(4500, () => {
      this.tweens.add({
        targets: [dialogBox, nameText, messageText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          dialogBox.destroy();
          nameText.destroy();
          messageText.destroy();
        },
      });
    });
  }
}
