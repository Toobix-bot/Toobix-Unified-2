/**
 * WorldObjects - Shared world state system
 *
 * All agents can see and interact with the same objects in the world:
 * - Resources (food, materials, energy)
 * - Buildings (structures agents create)
 * - Items (tools, artifacts)
 * - Natural features (trees, rocks, water)
 *
 * This creates a shared reality that agents can modify together.
 */

import Phaser from 'phaser';

export type ObjectType =
  | 'food'
  | 'material'
  | 'energy'
  | 'building'
  | 'tool'
  | 'artifact'
  | 'tree'
  | 'rock'
  | 'water'
  | 'shelter';

export type ResourceQuality = 'poor' | 'common' | 'good' | 'excellent';

export interface WorldObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  name: string;
  description?: string;

  // Resource properties
  quantity?: number; // How much of this resource exists
  quality?: ResourceQuality;
  renewable?: boolean; // Can it regenerate?
  regenerationRate?: number; // Units per second

  // Building properties
  health?: number; // 0-100
  owner?: string; // Agent ID who owns/created it
  capacity?: number; // How many agents can use it
  functionality?: string; // What does it do?

  // State
  isAccessible: boolean;
  isBeingUsed: boolean;
  usedBy?: string[]; // Array of agent IDs currently using it

  // Visual
  sprite?: Phaser.GameObjects.Sprite;
  color?: number;
  icon?: string;

  // Metadata
  createdAt: number;
  createdBy?: string; // Agent ID who created it
  lastModified: number;
  modifiedBy?: string;

  // Tags for categorization
  tags: string[];
}

export class WorldObjectsManager {
  private objects: Map<string, WorldObject> = new Map();
  private scene: Phaser.Scene;
  private objectCounter: number = 0;

  // Regeneration tracking
  private regenerationTimer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    console.log('🌍 WorldObjectsManager: Initialized');
  }

  /**
   * Create a new object in the world
   */
  createObject(config: Partial<WorldObject> & { type: ObjectType; x: number; y: number }): WorldObject {
    const id = `obj-${this.objectCounter++}`;

    const obj: WorldObject = {
      id,
      type: config.type,
      x: config.x,
      y: config.y,
      name: config.name || `${config.type}-${id}`,
      description: config.description,
      quantity: config.quantity,
      quality: config.quality,
      renewable: config.renewable ?? false,
      regenerationRate: config.regenerationRate ?? 0,
      health: config.health ?? 100,
      owner: config.owner,
      capacity: config.capacity,
      functionality: config.functionality,
      isAccessible: config.isAccessible ?? true,
      isBeingUsed: false,
      usedBy: [],
      color: config.color,
      icon: config.icon,
      createdAt: Date.now(),
      createdBy: config.createdBy,
      lastModified: Date.now(),
      modifiedBy: config.modifiedBy,
      tags: config.tags || [],
    };

    // Create visual representation
    this.createSprite(obj);

    this.objects.set(id, obj);
    console.log(`✨ Created ${obj.type}: ${obj.name} at (${obj.x}, ${obj.y})`);

    return obj;
  }

  /**
   * Create visual sprite for object
   */
  private createSprite(obj: WorldObject) {
    let color = obj.color || this.getDefaultColor(obj.type);
    let size = this.getDefaultSize(obj.type);

    const sprite = this.scene.add.circle(obj.x, obj.y, size, color);
    sprite.setStrokeStyle(1, 0xffffff, 0.5);

    // Add label
    const label = this.scene.add.text(obj.x, obj.y + size + 5, obj.icon || this.getDefaultIcon(obj.type), {
      fontSize: '12px',
      fontFamily: 'monospace',
    });
    label.setOrigin(0.5);

    obj.sprite = sprite as any;
    (obj as any).label = label;
  }

  private getDefaultColor(type: ObjectType): number {
    const colors: { [key in ObjectType]: number } = {
      food: 0x4caf50,
      material: 0x9e9e9e,
      energy: 0xffeb3b,
      building: 0x795548,
      tool: 0x607d8b,
      artifact: 0x9c27b0,
      tree: 0x2e7d32,
      rock: 0x5d4037,
      water: 0x2196f3,
      shelter: 0xff9800,
    };
    return colors[type] || 0xffffff;
  }

  private getDefaultSize(type: ObjectType): number {
    const sizes: { [key in ObjectType]: number } = {
      food: 6,
      material: 5,
      energy: 7,
      building: 12,
      tool: 4,
      artifact: 6,
      tree: 10,
      rock: 8,
      water: 15,
      shelter: 14,
    };
    return sizes[type] || 6;
  }

  private getDefaultIcon(type: ObjectType): string {
    const icons: { [key in ObjectType]: string } = {
      food: '🍎',
      material: '🪵',
      energy: '⚡',
      building: '🏠',
      tool: '🔨',
      artifact: '💎',
      tree: '🌳',
      rock: '🪨',
      water: '💧',
      shelter: '⛺',
    };
    return icons[type] || '📦';
  }

  /**
   * Get object by ID
   */
  getObject(id: string): WorldObject | undefined {
    return this.objects.get(id);
  }

  /**
   * Get all objects of a type
   */
  getObjectsByType(type: ObjectType): WorldObject[] {
    return Array.from(this.objects.values()).filter((obj) => obj.type === type);
  }

  /**
   * Get all objects
   */
  getAllObjects(): WorldObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Get nearest object of type to position
   */
  getNearestObject(x: number, y: number, type?: ObjectType): WorldObject | null {
    let nearest: WorldObject | null = null;
    let minDistance = Infinity;

    for (const obj of this.objects.values()) {
      if (type && obj.type !== type) continue;
      if (!obj.isAccessible) continue;

      const distance = Phaser.Math.Distance.Between(x, y, obj.x, obj.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = obj;
      }
    }

    return nearest;
  }

  /**
   * Get objects within radius
   */
  getObjectsInRadius(x: number, y: number, radius: number, type?: ObjectType): WorldObject[] {
    const results: WorldObject[] = [];

    for (const obj of this.objects.values()) {
      if (type && obj.type !== type) continue;

      const distance = Phaser.Math.Distance.Between(x, y, obj.x, obj.y);
      if (distance <= radius) {
        results.push(obj);
      }
    }

    return results;
  }

  /**
   * Agent uses an object
   */
  useObject(objectId: string, agentId: string): boolean {
    const obj = this.objects.get(objectId);
    if (!obj || !obj.isAccessible) return false;

    // Check capacity
    if (obj.capacity && obj.usedBy && obj.usedBy.length >= obj.capacity) {
      return false;
    }

    obj.isBeingUsed = true;
    if (!obj.usedBy) obj.usedBy = [];
    if (!obj.usedBy.includes(agentId)) {
      obj.usedBy.push(agentId);
    }

    obj.lastModified = Date.now();
    obj.modifiedBy = agentId;

    return true;
  }

  /**
   * Agent stops using an object
   */
  releaseObject(objectId: string, agentId: string) {
    const obj = this.objects.get(objectId);
    if (!obj) return;

    if (obj.usedBy) {
      obj.usedBy = obj.usedBy.filter((id) => id !== agentId);
      if (obj.usedBy.length === 0) {
        obj.isBeingUsed = false;
      }
    }
  }

  /**
   * Consume resource (e.g., eat food, use material)
   */
  consumeResource(objectId: string, amount: number, agentId: string): boolean {
    const obj = this.objects.get(objectId);
    if (!obj || obj.quantity === undefined) return false;

    if (obj.quantity >= amount) {
      obj.quantity -= amount;
      obj.lastModified = Date.now();
      obj.modifiedBy = agentId;

      // Remove object if depleted
      if (obj.quantity <= 0 && !obj.renewable) {
        this.removeObject(objectId);
      }

      return true;
    }

    return false;
  }

  /**
   * Modify object (e.g., damage building, improve quality)
   */
  modifyObject(objectId: string, changes: Partial<WorldObject>, agentId: string) {
    const obj = this.objects.get(objectId);
    if (!obj) return;

    Object.assign(obj, changes);
    obj.lastModified = Date.now();
    obj.modifiedBy = agentId;
  }

  /**
   * Remove object from world
   */
  removeObject(objectId: string) {
    const obj = this.objects.get(objectId);
    if (!obj) return;

    // Destroy visual
    if (obj.sprite) (obj.sprite as any).destroy();
    if ((obj as any).label) (obj as any).label.destroy();

    this.objects.delete(objectId);
    console.log(`🗑️ Removed ${obj.type}: ${obj.name}`);
  }

  /**
   * Update system (regenerate resources, etc.)
   */
  update(delta: number) {
    this.regenerationTimer += delta;

    // Regenerate resources every second
    if (this.regenerationTimer >= 1000) {
      this.regenerationTimer = 0;
      this.regenerateResources();
    }

    // Update visuals
    this.updateVisuals();
  }

  private regenerateResources() {
    for (const obj of this.objects.values()) {
      if (obj.renewable && obj.regenerationRate && obj.quantity !== undefined) {
        // Calculate max quantity based on quality
        const maxQuantity = this.getMaxQuantity(obj);

        if (obj.quantity < maxQuantity) {
          obj.quantity = Math.min(maxQuantity, obj.quantity + obj.regenerationRate);
        }
      }
    }
  }

  private getMaxQuantity(obj: WorldObject): number {
    const baseMax = 100;
    const qualityMultiplier = {
      poor: 0.5,
      common: 1,
      good: 1.5,
      excellent: 2,
    };

    return baseMax * (qualityMultiplier[obj.quality || 'common'] || 1);
  }

  private updateVisuals() {
    for (const obj of this.objects.values()) {
      if (!obj.sprite) continue;

      // Pulse if being used
      if (obj.isBeingUsed) {
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
        (obj.sprite as any).setScale(pulse);
      } else {
        (obj.sprite as any).setScale(1);
      }

      // Fade if depleted
      if (obj.quantity !== undefined) {
        const maxQuantity = this.getMaxQuantity(obj);
        const alpha = Math.max(0.3, obj.quantity / maxQuantity);
        (obj.sprite as any).setAlpha(alpha);
      }
    }
  }

  /**
   * Spawn initial world objects
   */
  spawnInitialWorld() {
    // Food sources (renewable)
    this.createObject({
      type: 'food',
      x: 200,
      y: 200,
      name: 'Apple Tree',
      quantity: 50,
      quality: 'good',
      renewable: true,
      regenerationRate: 2,
      tags: ['food-source', 'nature'],
    });

    this.createObject({
      type: 'food',
      x: 800,
      y: 200,
      name: 'Berry Bush',
      quantity: 30,
      quality: 'common',
      renewable: true,
      regenerationRate: 1.5,
      tags: ['food-source', 'nature'],
    });

    // Materials
    this.createObject({
      type: 'material',
      x: 300,
      y: 500,
      name: 'Wood Pile',
      quantity: 80,
      quality: 'good',
      renewable: false,
      tags: ['construction', 'resource'],
    });

    this.createObject({
      type: 'material',
      x: 700,
      y: 500,
      name: 'Stone Deposit',
      quantity: 100,
      quality: 'excellent',
      renewable: false,
      tags: ['construction', 'resource'],
    });

    // Energy sources
    this.createObject({
      type: 'energy',
      x: 500,
      y: 300,
      name: 'Energy Crystal',
      quantity: 60,
      quality: 'excellent',
      renewable: true,
      regenerationRate: 1,
      tags: ['energy', 'magic'],
    });

    // Natural features
    this.createObject({
      type: 'tree',
      x: 150,
      y: 400,
      name: 'Ancient Oak',
      health: 100,
      tags: ['nature', 'landmark'],
    });

    this.createObject({
      type: 'water',
      x: 500,
      y: 550,
      name: 'Spring',
      quantity: 1000,
      quality: 'excellent',
      renewable: true,
      regenerationRate: 5,
      tags: ['water', 'nature'],
    });

    console.log(`🌍 Spawned ${this.objects.size} initial world objects`);
  }

  /**
   * Get statistics
   */
  getStats(): any {
    const stats: any = {
      totalObjects: this.objects.size,
      byType: {} as { [key: string]: number },
      totalResources: 0,
      inUse: 0,
    };

    for (const obj of this.objects.values()) {
      stats.byType[obj.type] = (stats.byType[obj.type] || 0) + 1;

      if (obj.quantity) stats.totalResources += obj.quantity;
      if (obj.isBeingUsed) stats.inUse++;
    }

    return stats;
  }
}
