/**
 * GameState - Global game state manager
 * Manages inventory, player stats, and cross-scene data
 */

import { Inventory } from './Inventory';
import { DialogMemory } from './DialogMemory';

export class GameState {
  private static instance: GameState;

  public inventory: Inventory;
  public dialogMemory: DialogMemory;
  public playerName: string = 'Traveler';
  public currentScene: string = 'HubScene';
  public playtime: number = 0;
  public startTime: number = Date.now();

  private constructor() {
    this.inventory = new Inventory();
    this.dialogMemory = new DialogMemory();
    this.loadPlayerData();
    console.log('🎮 GameState: Global state initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /**
   * Set player name
   */
  setPlayerName(name: string) {
    this.playerName = name;
    this.savePlayerData();
  }

  /**
   * Set current scene
   */
  setCurrentScene(sceneName: string) {
    this.currentScene = sceneName;
  }

  /**
   * Get total playtime in minutes
   */
  getPlaytime(): number {
    const sessionTime = Date.now() - this.startTime;
    return Math.floor((this.playtime + sessionTime) / 60000);
  }

  /**
   * Save player data
   */
  private savePlayerData() {
    try {
      const data = {
        playerName: this.playerName,
        playtime: this.playtime + (Date.now() - this.startTime),
        savedAt: Date.now(),
      };

      localStorage.setItem('toobix_player_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save player data:', error);
    }
  }

  /**
   * Load player data
   */
  private loadPlayerData() {
    try {
      const stored = localStorage.getItem('toobix_player_data');
      if (!stored) return;

      const data = JSON.parse(stored);
      this.playerName = data.playerName || 'Traveler';
      this.playtime = data.playtime || 0;
    } catch (error) {
      console.warn('Failed to load player data:', error);
    }
  }

  /**
   * Reset all game data (for new game)
   */
  resetAll() {
    this.inventory.clearAll();
    this.dialogMemory.clearAllMemories();
    this.playerName = 'Traveler';
    this.playtime = 0;
    this.startTime = Date.now();
    localStorage.removeItem('toobix_player_data');
    console.log('🔄 Game state reset');
  }

  /**
   * Get game statistics
   */
  getStats(): any {
    return {
      playerName: this.playerName,
      playtime: this.getPlaytime(),
      inventory: this.inventory.getStats(),
      dialogStats: this.dialogMemory.getStats(),
    };
  }
}

// Export singleton instance
export const gameState = GameState.getInstance();
