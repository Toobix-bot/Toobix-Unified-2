/**
 * InventoryPanel - UI component for displaying player inventory
 * Press 'I' to toggle
 */

import Phaser from 'phaser';
import { gameState } from '../services/GameState';
import type { Item } from '../services/Inventory';

export class InventoryPanel {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Rectangle;
  private isVisible: boolean = false;
  private itemTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createPanel();
    this.setupControls();
  }

  private createPanel() {
    // Create container for all UI elements
    this.container = this.scene.add.container(640, 360);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
    this.container.setVisible(false);

    // Semi-transparent background
    this.background = this.scene.add.rectangle(0, 0, 1000, 600, 0x000000, 0.9);
    this.background.setStrokeStyle(2, 0x00d4ff);
    this.container.add(this.background);

    // Title
    const title = this.scene.add.text(0, -260, '🎒 INVENTORY', {
      fontSize: '28px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.container.add(title);

    // Close hint
    const closeHint = this.scene.add.text(0, 260, 'Press I to close', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    closeHint.setOrigin(0.5);
    this.container.add(closeHint);
  }

  private setupControls() {
    // Toggle with 'I' key
    this.scene.input.keyboard?.on('keydown-I', () => {
      this.toggle();
    });
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);

    if (this.isVisible) {
      this.refresh();
    }
  }

  show() {
    this.isVisible = true;
    this.container.setVisible(true);
    this.refresh();
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
  }

  refresh() {
    // Clear old item texts
    this.itemTexts.forEach((text) => text.destroy());
    this.itemTexts = [];

    const stats = gameState.inventory.getStats();
    const items = gameState.inventory.getAllItems();

    // Stats summary
    const statsText = this.scene.add.text(-450, -220, this.formatStats(stats), {
      fontSize: '16px',
      color: '#00d4ff',
      fontFamily: 'monospace',
      lineSpacing: 8,
    });
    this.container.add(statsText);
    this.itemTexts.push(statsText);

    // Category breakdown
    const categoryText = this.scene.add.text(-450, -100, this.formatCategories(stats), {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      lineSpacing: 6,
    });
    this.container.add(categoryText);
    this.itemTexts.push(categoryText);

    // Recent items list
    if (items.length > 0) {
      const recentItemsTitle = this.scene.add.text(-450, 60, 'RECENT ITEMS:', {
        fontSize: '16px',
        color: '#00d4ff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      this.container.add(recentItemsTitle);
      this.itemTexts.push(recentItemsTitle);

      const recentItems = items.slice(0, 8);
      let yOffset = 90;

      recentItems.forEach((item) => {
        const itemText = this.scene.add.text(
          -450,
          yOffset,
          `${gameState.inventory.getCategoryIcon(item.category)} ${item.name}`,
          {
            fontSize: '13px',
            color: this.getRarityColorHex(item.rarity),
            fontFamily: 'monospace',
          }
        );
        this.container.add(itemText);
        this.itemTexts.push(itemText);

        // Item description (smaller, wrapped)
        const descText = this.scene.add.text(-430, yOffset + 18, item.description, {
          fontSize: '11px',
          color: '#cccccc',
          fontFamily: 'monospace',
          wordWrap: { width: 850 },
        });
        this.container.add(descText);
        this.itemTexts.push(descText);

        yOffset += 50;
      });

      if (items.length > 8) {
        const moreText = this.scene.add.text(-450, yOffset + 10, `... and ${items.length - 8} more items`, {
          fontSize: '12px',
          color: '#888888',
          fontFamily: 'monospace',
          fontStyle: 'italic',
        });
        this.container.add(moreText);
        this.itemTexts.push(moreText);
      }
    } else {
      const emptyText = this.scene.add.text(0, 0, 'No items collected yet.\nExplore the world to find treasures!', {
        fontSize: '16px',
        color: '#888888',
        fontFamily: 'monospace',
        align: 'center',
      });
      emptyText.setOrigin(0.5);
      this.container.add(emptyText);
      this.itemTexts.push(emptyText);
    }
  }

  private formatStats(stats: any): string {
    const lines = [
      `TOTAL ITEMS: ${stats.totalItems}`,
      `COMPLETION: ${stats.completionPercentage}%`,
      '',
      'BY RARITY:',
      `  Legendary: ${stats.byRarity.legendary || 0}`,
      `  Epic: ${stats.byRarity.epic || 0}`,
      `  Rare: ${stats.byRarity.rare || 0}`,
      `  Common: ${stats.byRarity.common || 0}`,
    ];

    return lines.join('\n');
  }

  private formatCategories(stats: any): string {
    const lines = ['CATEGORIES:'];

    const categories = [
      { key: 'dream_orb', name: 'Dream Orbs', icon: '🌙' },
      { key: 'memory', name: 'Memories', icon: '🧠' },
      { key: 'insight', name: 'Insights', icon: '💡' },
      { key: 'emotion', name: 'Emotions', icon: '❤️' },
      { key: 'artifact', name: 'Artifacts', icon: '🗿' },
      { key: 'key', name: 'Keys', icon: '🔑' },
      { key: 'essence', name: 'Essences', icon: '✨' },
    ];

    categories.forEach((cat) => {
      const count = stats.byCategory[cat.key] || 0;
      const completion = gameState.inventory.getCategoryCompletion(cat.key as any);
      lines.push(`  ${cat.icon} ${cat.name}: ${completion.collected}/${completion.total}`);
    });

    return lines.join('\n');
  }

  private getRarityColorHex(rarity: string): string {
    const colors: { [key: string]: string } = {
      common: '#888888',
      rare: '#00d4ff',
      epic: '#9c27b0',
      legendary: '#ffeb3b',
    };
    return colors[rarity] || '#888888';
  }

  destroy() {
    this.itemTexts.forEach((text) => text.destroy());
    this.container.destroy();
  }
}
