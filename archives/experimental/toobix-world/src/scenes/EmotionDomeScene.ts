import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ToobixAPI } from '../services/ToobixAPI';

interface EmotionZone {
  name: string;
  x: number;
  y: number;
  color: number;
  weather: 'sunny' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'rainbow' | 'aurora';
  description: string;
  emoji: string;
}

export class EmotionDomeScene extends Phaser.Scene {
  private player!: Player;
  private api!: ToobixAPI;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private emotionGuide!: NPC;
  private currentEmotion: string = 'calm';
  private weatherParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private emotionZones: EmotionZone[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private weatherText!: Phaser.GameObjects.Text;
  private sky!: Phaser.GameObjects.Rectangle;
  private interactionCooldown: boolean = false;
  private isTransitioning: boolean = false;
  private exitPortal!: { zone: Phaser.GameObjects.Zone; prompt: Phaser.GameObjects.Text };

  constructor() {
    super({ key: 'EmotionDomeScene' });
  }

  create(data: any) {
    console.log('💝 EmotionDomeScene: Creating Emotion Dome...');

    // Initialize API
    this.api = new ToobixAPI();

    // Create dome environment
    this.createDome();

    // Create emotion zones
    this.createEmotionZones();

    // Create player
    this.player = new Player(this, 800, 1000);

    // Create Emotion Guide NPC
    this.createEmotionGuide();

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // Create UI
    this.createUI();

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add exit portal
    this.createExitPortal();

    // Start weather system
    this.startWeatherSystem();

    // Welcome message
    this.showMessage('💝 Welcome to the Emotion Dome - Where feelings shape reality...', 3000);

    // Fade in the camera (fixes black screen after scene transitions)
    this.cameras.main.fadeIn(500);
  }

  private createDome() {
    const width = 1600;
    const height = 1200;

    // Set world bounds
    this.physics.world.setBounds(0, 0, width, height);

    // Create sky (will change color based on emotion)
    this.sky = this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);
    this.sky.setDepth(-100);

    // Create ground
    for (let y = 0; y < height; y += 32) {
      for (let x = 0; x < width; x += 32) {
        const tile = this.add.rectangle(x, y, 32, 32, 0x228b22, 0.3);
        tile.setOrigin(0, 0);
        tile.setDepth(-50);
      }
    }

    // Create dome structure (semi-transparent dome outline)
    const centerX = width / 2;
    const centerY = height / 2;
    const domeRadius = 500;

    // Draw dome arcs
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xffffff, 0.3);
    graphics.strokeCircle(centerX, centerY, domeRadius);

    // Add dome support beams
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = Phaser.Math.DegToRad(angle);
      const endX = centerX + Math.cos(rad) * domeRadius;
      const endY = centerY + Math.sin(rad) * domeRadius;

      graphics.lineStyle(2, 0xffffff, 0.2);
      graphics.lineBetween(centerX, centerY, endX, endY);
    }

    // Central emotion pillar
    const pillar = this.add.rectangle(centerX, centerY, 60, 100, 0xe91e63, 0.6);
    this.tweens.add({
      targets: pillar,
      alpha: 0.3,
      scaleY: 1.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    const pillarLabel = this.add.text(centerX, centerY, '💗 Emotion Core', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 5 },
    });
    pillarLabel.setOrigin(0.5);
  }

  private createEmotionZones() {
    this.emotionZones = [
      {
        name: 'Joy',
        x: 800,
        y: 300,
        color: 0xffeb3b,
        weather: 'sunny',
        description: 'A bright space filled with warmth and laughter',
        emoji: '😊',
      },
      {
        name: 'Sadness',
        x: 400,
        y: 600,
        color: 0x2196f3,
        weather: 'rainy',
        description: 'Tears fall like gentle rain, cleansing and healing',
        emoji: '😢',
      },
      {
        name: 'Anger',
        x: 1200,
        y: 600,
        color: 0xf44336,
        weather: 'stormy',
        description: 'Thunder and lightning express raw power',
        emoji: '😠',
      },
      {
        name: 'Fear',
        x: 600,
        y: 900,
        color: 0x9c27b0,
        weather: 'foggy',
        description: 'Mist obscures the path, uncertainty lingers',
        emoji: '😨',
      },
      {
        name: 'Love',
        x: 1000,
        y: 900,
        color: 0xe91e63,
        weather: 'rainbow',
        description: 'Colors blend in perfect harmony',
        emoji: '❤️',
      },
      {
        name: 'Peace',
        x: 300,
        y: 300,
        color: 0x4caf50,
        weather: 'snowy',
        description: 'Gentle snowflakes bring tranquility',
        emoji: '☮️',
      },
      {
        name: 'Wonder',
        x: 1300,
        y: 300,
        color: 0x00bcd4,
        weather: 'aurora',
        description: 'Northern lights dance with mystery',
        emoji: '✨',
      },
    ];

    this.emotionZones.forEach((zone) => {
      // Create zone circle
      const circle = this.add.circle(zone.x, zone.y, 80, zone.color, 0.3);

      // Pulsing animation
      this.tweens.add({
        targets: circle,
        scale: 1.2,
        alpha: 0.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });

      // Zone label
      const label = this.add.text(zone.x, zone.y - 100, `${zone.emoji} ${zone.name}`, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      });
      label.setOrigin(0.5);

      // Store zone reference for interaction
      circle.setData('zone', zone);
      circle.setInteractive();
      circle.on('pointerdown', () => {
        this.activateEmotion(zone);
      });
    });
  }

  private createEmotionGuide() {
    this.emotionGuide = new NPC(this, 800, 600, 'Emotion Guide', 'emotional');

    // Add emotional aura
    const aura = this.add.circle(800, 600, 70, 0xe91e63, 0.2);
    this.tweens.add({
      targets: aura,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      repeat: -1,
    });
  }

  private createUI() {
    // Current emotion display
    this.statusText = this.add.text(20, 20, 'Current Emotion: Calm', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 8 },
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    // Weather display
    this.weatherText = this.add.text(20, 60, 'Weather: Clear', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 6 },
    });
    this.weatherText.setScrollFactor(0);
    this.weatherText.setDepth(100);

    // Controls
    const controls = this.add.text(20, 680, 'WASD: Move | E: Interact | Click zones to change emotion | ESC: Back to Hub', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 5 },
    });
    controls.setScrollFactor(0);
    controls.setDepth(100);
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

    // Create interaction prompt (initially hidden)
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

  private showMessage(message: string, duration: number = 2000) {
    const msg = this.add.text(640, 360, message, {
      fontSize: '16px',
      color: '#ffffff',
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

  private activateEmotion(zone: EmotionZone) {
    this.currentEmotion = zone.name;
    this.statusText.setText(`Current Emotion: ${zone.emoji} ${zone.name}`);
    this.weatherText.setText(`Weather: ${zone.weather}`);

    // Change sky color
    this.tweens.add({
      targets: this.sky,
      fillColor: zone.color,
      duration: 1000,
    });

    // Clear old weather particles
    this.weatherParticles.forEach((p) => p.stop());
    this.weatherParticles = [];

    // Create new weather
    this.createWeather(zone.weather, zone.color);

    // Show description
    this.showMessage(`${zone.emoji} ${zone.name}: ${zone.description}`, 3000);
  }

  private startWeatherSystem() {
    // Start with calm weather
    this.createWeather('sunny', 0x87ceeb);

    // Random emotion changes every 20 seconds
    this.time.addEvent({
      delay: 20000,
      callback: () => {
        const randomZone = Phaser.Utils.Array.GetRandom(this.emotionZones);
        this.activateEmotion(randomZone);
      },
      loop: true,
    });
  }

  private createWeather(type: string, color: number) {
    const width = 1600;
    const height = 1200;

    switch (type) {
      case 'sunny':
        // Create sun
        const sun = this.add.circle(1400, 100, 60, 0xffeb3b, 0.8);
        sun.setDepth(-40);
        this.tweens.add({
          targets: sun,
          scale: 1.1,
          alpha: 0.6,
          duration: 2000,
          yoyo: true,
          repeat: -1,
        });
        break;

      case 'rainy':
        // Rain particles
        for (let i = 0; i < 50; i++) {
          const drop = this.add.line(
            Phaser.Math.Between(0, width),
            Phaser.Math.Between(-100, height),
            0,
            0,
            0,
            20,
            0x2196f3,
            0.6
          );
          drop.setDepth(-30);

          this.tweens.add({
            targets: drop,
            y: '+=' + Phaser.Math.Between(800, 1000),
            alpha: 0,
            duration: Phaser.Math.Between(1000, 2000),
            repeat: -1,
          });
        }
        break;

      case 'stormy':
        // Lightning flashes
        this.time.addEvent({
          delay: Phaser.Math.Between(2000, 5000),
          callback: () => {
            const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.5);
            flash.setDepth(50);
            this.tweens.add({
              targets: flash,
              alpha: 0,
              duration: 100,
              onComplete: () => flash.destroy(),
            });
          },
          loop: true,
        });
        break;

      case 'snowy':
        // Snowflakes
        for (let i = 0; i < 40; i++) {
          const snowflake = this.add.circle(
            Phaser.Math.Between(0, width),
            Phaser.Math.Between(-100, height),
            3,
            0xffffff,
            0.8
          );
          snowflake.setDepth(-30);

          this.tweens.add({
            targets: snowflake,
            y: '+=' + Phaser.Math.Between(400, 600),
            x: '+=' + Phaser.Math.Between(-50, 50),
            duration: Phaser.Math.Between(3000, 5000),
            repeat: -1,
          });
        }
        break;

      case 'foggy':
        // Fog layers
        for (let i = 0; i < 5; i++) {
          const fog = this.add.rectangle(
            width / 2,
            200 + i * 150,
            width,
            200,
            0x9c27b0,
            0.2
          );
          fog.setDepth(-20);

          this.tweens.add({
            targets: fog,
            x: '+=' + Phaser.Math.Between(-100, 100),
            alpha: 0.1,
            duration: Phaser.Math.Between(3000, 5000),
            yoyo: true,
            repeat: -1,
          });
        }
        break;

      case 'rainbow':
        // Rainbow arc
        const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        rainbowColors.forEach((color, index) => {
          const arc = this.add.circle(width / 2, height - 200, 300 + index * 30, color, 0.3);
          arc.setDepth(-40);
        });
        break;

      case 'aurora':
        // Aurora borealis waves
        for (let i = 0; i < 3; i++) {
          const aurora = this.add.rectangle(
            width / 2,
            100 + i * 100,
            width,
            80,
            [0x00ff00, 0x00bcd4, 0x9c27b0][i],
            0.4
          );
          aurora.setDepth(-40);

          this.tweens.add({
            targets: aurora,
            alpha: 0.2,
            scaleY: 1.3,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            delay: i * 500,
          });
        }
        break;
    }
  }

  update(time: number, delta: number) {
    // Update player
    this.player.update(this.cursors);

    // Check for Emotion Guide interaction
    const distanceToGuide = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.emotionGuide.x,
      this.emotionGuide.y
    );

    if (distanceToGuide < 60) {
      this.emotionGuide.showInteractionPrompt();

      if (this.input.keyboard!.addKey('E').isDown) {
        this.interactWithGuide();
      }
    } else {
      this.emotionGuide.hideInteractionPrompt();
    }

    // Check for emotion zone proximity
    this.emotionZones.forEach((zone) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        zone.x,
        zone.y
      );

      if (distance < 100) {
        // Auto-trigger emotion when entering zone
        if (this.currentEmotion !== zone.name) {
          this.activateEmotion(zone);
        }
      }
    });

    // Check for exit portal
    const distanceToPortal = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      800,
      1150
    );

    if (distanceToPortal < 60) {
      if (this.input.keyboard!.addKey('E').isDown) {
        this.returnToHub();
      }
    }

    // ESC to return to hub
    if (this.input.keyboard!.addKey('ESC').isDown) {
      this.returnToHub();
    }
  }

  private interactWithGuide() {
    const messages = [
      'Emotions are the weather of consciousness. Each one brings its own gifts.',
      'Feel the joy in sunshine, the cleansing in rain, the power in storms.',
      'All emotions are valid. Resist none, cling to none.',
      'Walk through each zone to experience the full spectrum of feeling.',
    ];

    const message = Phaser.Utils.Array.GetRandom(messages);
    this.showMessage(`Emotion Guide: ${message}`, 4000);
  }

  private returnToHub() {
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HubScene');
    });
  }
}
