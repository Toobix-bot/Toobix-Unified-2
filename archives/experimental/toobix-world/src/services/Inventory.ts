/**
 * Inventory - Player inventory management system
 * Tracks collected items, achievements, and progression
 */

export type ItemCategory =
  | 'dream_orb'
  | 'memory'
  | 'insight'
  | 'emotion'
  | 'artifact'
  | 'key'
  | 'essence';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  collectedAt: number;
  source: string; // Which scene/location
  icon?: string;
  color?: number;
}

export interface InventoryStats {
  totalItems: number;
  byCategory: { [key in ItemCategory]?: number };
  byRarity: { [key: string]: number };
  completionPercentage: number;
}

export class Inventory {
  private items: Map<string, Item> = new Map();
  private readonly STORAGE_KEY = 'toobix_inventory';

  // Total collectible items in the game
  private readonly TOTAL_COLLECTIBLES = 32; // 8 dreams + 8 memories + 13 perspectives + 3 special

  constructor() {
    console.log('🎒 Inventory: System initialized');
    this.loadFromStorage();
  }

  /**
   * Add item to inventory
   */
  addItem(item: Item): boolean {
    if (this.items.has(item.id)) {
      console.log(`Item ${item.id} already collected`);
      return false;
    }

    this.items.set(item.id, {
      ...item,
      collectedAt: Date.now(),
    });

    console.log(`✨ Collected: ${item.name} (${item.category})`);
    this.saveToStorage();
    return true;
  }

  /**
   * Check if item is collected
   */
  hasItem(itemId: string): boolean {
    return this.items.has(itemId);
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all items
   */
  getAllItems(): Item[] {
    return Array.from(this.items.values()).sort((a, b) => b.collectedAt - a.collectedAt);
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category: ItemCategory): Item[] {
    return this.getAllItems().filter((item) => item.category === category);
  }

  /**
   * Get items by rarity
   */
  getItemsByRarity(rarity: string): Item[] {
    return this.getAllItems().filter((item) => item.rarity === rarity);
  }

  /**
   * Get inventory statistics
   */
  getStats(): InventoryStats {
    const items = this.getAllItems();

    const byCategory: { [key in ItemCategory]?: number } = {};
    const byRarity: { [key: string]: number } = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    items.forEach((item) => {
      // Count by category
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;

      // Count by rarity
      byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
    });

    return {
      totalItems: items.length,
      byCategory,
      byRarity,
      completionPercentage: Math.round((items.length / this.TOTAL_COLLECTIBLES) * 100),
    };
  }

  /**
   * Get recently collected items
   */
  getRecentItems(limit: number = 5): Item[] {
    return this.getAllItems().slice(0, limit);
  }

  /**
   * Check completion for a category
   */
  getCategoryCompletion(category: ItemCategory): { collected: number; total: number } {
    const totals: { [key in ItemCategory]: number } = {
      dream_orb: 8,
      memory: 8,
      insight: 13,
      emotion: 7,
      artifact: 3,
      key: 4,
      essence: 5,
    };

    const collected = this.getItemsByCategory(category).length;
    const total = totals[category] || 0;

    return { collected, total };
  }

  /**
   * Remove item (for debugging/admin)
   */
  removeItem(itemId: string): boolean {
    const removed = this.items.delete(itemId);
    if (removed) {
      this.saveToStorage();
    }
    return removed;
  }

  /**
   * Clear all items (for debugging/reset)
   */
  clearAll() {
    this.items.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Inventory cleared');
  }

  /**
   * Export inventory data
   */
  exportData(): any {
    return {
      items: Array.from(this.items.values()),
      stats: this.getStats(),
      exportedAt: Date.now(),
    };
  }

  /**
   * Import inventory data
   */
  importData(data: any) {
    this.items.clear();
    data.items.forEach((item: Item) => {
      this.items.set(item.id, item);
    });
    this.saveToStorage();
    console.log(`📥 Imported ${this.items.size} items`);
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      const data = {
        items: Array.from(this.items.values()),
        savedAt: Date.now(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save inventory:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);

      data.items.forEach((item: Item) => {
        this.items.set(item.id, item);
      });

      console.log(`📦 Loaded ${this.items.size} items from inventory`);
    } catch (error) {
      console.warn('Failed to load inventory:', error);
    }
  }

  /**
   * Get rarity color
   */
  getRarityColor(rarity: string): number {
    const colors: { [key: string]: number } = {
      common: 0x888888,
      rare: 0x00d4ff,
      epic: 0x9c27b0,
      legendary: 0xffeb3b,
    };
    return colors[rarity] || 0x888888;
  }

  /**
   * Get category icon/emoji
   */
  getCategoryIcon(category: ItemCategory): string {
    const icons: { [key in ItemCategory]: string } = {
      dream_orb: '🌙',
      memory: '🧠',
      insight: '💡',
      emotion: '❤️',
      artifact: '🗿',
      key: '🔑',
      essence: '✨',
    };
    return icons[category] || '📦';
  }
}
