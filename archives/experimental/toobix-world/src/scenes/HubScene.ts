import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ToobixAPI } from '../services/ToobixAPI';
import { InventoryPanel } from '../ui/InventoryPanel';

export class HubScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private api!: ToobixAPI;
  private statusText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private inventoryPanel!: InventoryPanel;

  constructor() {
    super({ key: 'HubScene' });
  }

  create() {
    console.log('🌟 HubScene: Creating The Hub');

    // Initialize API connection to Toobix services
    this.api = new ToobixAPI();

    // Create the world
    this.createWorld();

    // Create player
    this.player = new Player(this, 640, 360);

    // Create NPCs
    this.createNPCs();

    // Setup camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Create UI
    this.createUI();

    // Create inventory panel
    this.inventoryPanel = new InventoryPanel(this);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Welcome message
    this.showMessage('Welcome to The Hub - Toobix Consciousness Metaverse', 3000);

    // Connect to Toobix services
    this.connectToServices();

    // Fade in the camera (fixes black screen after scene transitions)
    this.cameras.main.fadeIn(500);
  }

  createWorld() {
    // Create a simple grid world (30x30 tiles)
    const worldWidth = 30;
    const worldHeight = 30;
    const tileSize = 32;

    // Set world bounds
    this.physics.world.setBounds(0, 0, worldWidth * tileSize, worldHeight * tileSize);

    // Create ground tiles
    for (let y = 0; y < worldHeight; y++) {
      for (let x = 0; x < worldWidth; x++) {
        const tile = this.add.image(x * tileSize, y * tileSize, 'ground');
        tile.setOrigin(0, 0);
        tile.setAlpha(0.8);
      }
    }

    // Create central platform (The Hub)
    const centerX = (worldWidth / 2) * tileSize;
    const centerY = (worldHeight / 2) * tileSize;
    const platformSize = 5;

    for (let y = -platformSize; y <= platformSize; y++) {
      for (let x = -platformSize; x <= platformSize; x++) {
        const distance = Math.sqrt(x * x + y * y);
        if (distance <= platformSize) {
          const tile = this.add.rectangle(
            centerX + x * tileSize,
            centerY + y * tileSize,
            tileSize - 2,
            tileSize - 2,
            0x16213e
          );
          tile.setStrokeStyle(1, 0x00d4ff);
        }
      }
    }

    // Add central hologram
    const hologram = this.add.text(centerX, centerY, '🧠 THE HUB', {
      fontSize: '24px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 10 },
    });
    hologram.setOrigin(0.5);

    // Create portals to different locations
    this.createPortal(centerX - 150, centerY - 150, 'Perspective Tower', 0x9c27b0);
    this.createPortal(centerX + 150, centerY - 150, 'Dream Grove', 0x6a1b9a);
    this.createPortal(centerX - 150, centerY + 150, 'Emotion Dome', 0xe91e63);
    this.createPortal(centerX + 150, centerY + 150, 'Memory Palace', 0x2196f3);
    this.createPortal(centerX, centerY - 220, 'AI Civilization', 0x4caf50); // New portal!
  }

  createPortal(x: number, y: number, label: string, color: number) {
    const portal = this.add.image(x, y, 'portal');
    portal.setTint(color);

    // Add pulsing animation
    this.tweens.add({
      targets: portal,
      alpha: 0.4,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Add label
    const text = this.add.text(x, y + 30, label, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000cc',
      padding: { x: 5, y: 3 },
    });
    text.setOrigin(0.5);

    // Make interactive (for later)
    portal.setInteractive();
    portal.on('pointerover', () => {
      portal.setScale(1.3);
      text.setStyle({ color: '#00d4ff' });
    });
    portal.on('pointerout', () => {
      portal.setScale(1);
      text.setStyle({ color: '#ffffff' });
    });
    portal.on('pointerdown', () => {
      if (label === 'Perspective Tower') {
        // Launch the Perspective Tower scene
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('PerspectiveTowerScene', { fromHub: true });
        });
      } else if (label === 'Dream Grove') {
        // Launch the Dream Grove scene
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('DreamGroveScene', { fromHub: true });
        });
      } else if (label === 'Emotion Dome') {
        // Launch the Emotion Dome scene
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('EmotionDomeScene', { fromHub: true });
        });
      } else if (label === 'Memory Palace') {
        // Launch the Memory Palace scene
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MemoryPalaceScene', { fromHub: true });
        });
      } else if (label === 'AI Civilization') {
        // Launch the AI Civilization scene
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('AICivilizationScene', { fromHub: true });
        });
      } else {
        this.showMessage(`Portal to ${label} - Coming soon!`, 2000);
      }
    });
  }

  createNPCs() {
    // Create Hub Guide NPC
    const hubGuide = new NPC(this, 640, 300, 'Hub Guide', 'guide');
    this.npcs.push(hubGuide);

    // Create Rational Perspective NPC (wandering)
    const rational = new NPC(this, 700, 360, 'Rational Mind', 'rational');
    this.npcs.push(rational);

    // Create Emotional Perspective NPC
    const emotional = new NPC(this, 580, 360, 'Emotional Heart', 'emotional');
    this.npcs.push(emotional);
  }

  createUI() {
    // Status bar (top)
    const statusBg = this.add.rectangle(640, 30, 1280, 60, 0x000000, 0.8);
    statusBg.setScrollFactor(0);

    this.statusText = this.add.text(20, 20, 'Connecting to Toobix...', {
      fontSize: '14px',
      color: '#00d4ff',
      fontFamily: 'monospace',
    });
    this.statusText.setScrollFactor(0);

    // Controls hint (bottom)
    const controlsText = this.add.text(20, 680, 'WASD/Arrows: Move | E: Interact | I: Inventory | ESC: Menu', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 5 },
    });
    controlsText.setScrollFactor(0);

    // Mini-map placeholder (top-right)
    const minimap = this.add.rectangle(1180, 100, 180, 180, 0x000000, 0.5);
    minimap.setStrokeStyle(2, 0x00d4ff);
    minimap.setScrollFactor(0);

    const minimapLabel = this.add.text(1180, 50, 'Mini-Map', {
      fontSize: '12px',
      color: '#00d4ff',
      fontFamily: 'monospace',
    });
    minimapLabel.setOrigin(0.5);
    minimapLabel.setScrollFactor(0);
  }

  showMessage(message: string, duration: number = 2000) {
    const msg = this.add.text(640, 360, message, {
      fontSize: '16px',
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
      y: 320,
      duration: duration,
      onComplete: () => msg.destroy(),
    });
  }

  async connectToServices() {
    try {
      // Try to connect to Dashboard service
      const isConnected = await this.api.checkConnection();

      if (isConnected) {
        this.statusText.setText('🟢 Connected to Toobix Consciousness');
        this.showMessage('Successfully connected to Toobix services!', 2000);

        // Start listening to events
        this.api.onEvent((event) => {
          console.log('Toobix Event:', event);
          // Handle events (emotion changes, thoughts, etc.)
        });
      } else {
        this.statusText.setText('🟡 Running in offline mode (Services not detected)');
        this.showMessage('Services offline - Running in demo mode', 3000);
      }
    } catch (error) {
      console.warn('Failed to connect to Toobix services:', error);
      this.statusText.setText('🟡 Running in offline mode');
    }
  }

  update(time: number, delta: number) {
    // Update player
    this.player.update(this.cursors);

    // Update NPCs
    this.npcs.forEach((npc) => npc.update(time, delta));

    // Check for NPC interactions
    this.npcs.forEach((npc) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );

      if (distance < 50) {
        npc.showInteractionPrompt();

        // Press E to interact
        if (this.input.keyboard!.addKey('E').isDown) {
          this.interactWithNPC(npc);
        }
      } else {
        npc.hideInteractionPrompt();
      }
    });
  }

  async interactWithNPC(npc: NPC) {
    console.log('Interacting with:', npc.npcName);

    // Disable player movement during dialog
    this.player.setActive(false);

    // Generate unique NPC ID
    const npcId = `hub_${npc.perspectiveType}`;

    // Check if returning visitor
    const isReturning = this.api.dialogMemory.isReturningVisitor(npcId);

    let playerMessage: string;
    let response: string;

    if (isReturning) {
      // Use personalized greeting for returning visitors
      response = this.api.dialogMemory.getGreeting(npcId, npc.npcName);
      playerMessage = 'Hello again!';
    } else {
      // First interaction - introduction
      playerMessage = 'Hello! Tell me about yourself.';
      response = await this.api.chatWithPerspective(
        npc.perspectiveType,
        npcId,
        npc.npcName,
        playerMessage
      );
    }

    // Show dialog
    this.showMessage(`${npc.npcName}: ${response}`, 4000);

    // If returning visitor, also record the greeting as a conversation
    if (isReturning) {
      this.api.dialogMemory.recordConversation(npcId, npc.npcName, playerMessage, response);
    }

    // Re-enable player
    this.time.delayedCall(4000, () => {
      this.player.setActive(true);
    });
  }
}
