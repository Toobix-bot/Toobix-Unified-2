import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 200;
  private isActive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    this.setCollideWorldBounds(true);
    this.setSize(28, 28);
    this.setOffset(2, 2);

    // Add a subtle glow effect
    this.setTint(0x00d4ff);

    console.log('👤 Player spawned at The Hub');
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (!this.isActive) {
      this.setVelocity(0, 0);
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    // WASD and Arrow key controls
    const keys = this.scene.input.keyboard!;
    const wKey = keys.addKey('W');
    const aKey = keys.addKey('A');
    const sKey = keys.addKey('S');
    const dKey = keys.addKey('D');

    if (cursors.left.isDown || aKey.isDown) {
      velocityX = -this.speed;
    } else if (cursors.right.isDown || dKey.isDown) {
      velocityX = this.speed;
    }

    if (cursors.up.isDown || wKey.isDown) {
      velocityY = -this.speed;
    } else if (cursors.down.isDown || sKey.isDown) {
      velocityY = this.speed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707; // Math.sqrt(0.5)
      velocityY *= 0.707;
    }

    this.setVelocity(velocityX, velocityY);

    // Add subtle rotation based on movement (for visual feedback)
    if (velocityX !== 0 || velocityY !== 0) {
      const targetAngle = Math.atan2(velocityY, velocityX);
      this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, targetAngle, 0.1);
    }
  }

  setActive(active: boolean) {
    this.isActive = active;
  }

  getIsActive(): boolean {
    return this.isActive;
  }
}
