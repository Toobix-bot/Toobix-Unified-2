import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Consciousness...', {
      fontSize: '20px',
      color: '#00d4ff',
      fontFamily: 'monospace',
    });
    loadingText.setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    percentText.setOrigin(0.5);

    const assetText = this.add.text(width / 2, height / 2 + 50, '', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    assetText.setOrigin(0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00d4ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      assetText.setText(`Loading: ${file.key}`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    // Load assets (will add more later)
    // For now, create placeholder graphics
    this.createPlaceholderAssets();
  }

  createPlaceholderAssets() {
    // Create simple colored squares as placeholders for sprites
    // We'll replace these with actual art later

    // Player placeholder (32x32 blue square)
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00d4ff);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // NPC placeholder (32x32 green square)
    const npcGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    npcGraphics.fillStyle(0x00ff88);
    npcGraphics.fillRect(0, 0, 32, 32);
    npcGraphics.generateTexture('npc', 32, 32);
    npcGraphics.destroy();

    // Ground tile (32x32 dark gray)
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x1a1a2e);
    groundGraphics.fillRect(0, 0, 32, 32);
    groundGraphics.lineStyle(1, 0x16213e);
    groundGraphics.strokeRect(0, 0, 32, 32);
    groundGraphics.generateTexture('ground', 32, 32);
    groundGraphics.destroy();

    // Portal (32x32 glowing purple circle)
    const portalGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    portalGraphics.fillStyle(0x9c27b0, 0.7);
    portalGraphics.fillCircle(16, 16, 14);
    portalGraphics.lineStyle(2, 0xce93d8);
    portalGraphics.strokeCircle(16, 16, 14);
    portalGraphics.generateTexture('portal', 32, 32);
    portalGraphics.destroy();
  }

  create() {
    console.log('✅ BootScene: Assets loaded');

    // Add a short delay before transitioning for dramatic effect
    this.time.delayedCall(500, () => {
      this.scene.start('HubScene');
    });
  }
}
