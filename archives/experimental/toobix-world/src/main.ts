import Phaser from 'phaser';
import { HubScene } from './scenes/HubScene';
import { BootScene } from './scenes/BootScene';
import { PerspectiveTowerScene } from './scenes/PerspectiveTowerScene';
import { DreamGroveScene } from './scenes/DreamGroveScene';
import { EmotionDomeScene } from './scenes/EmotionDomeScene';
import { MemoryPalaceScene } from './scenes/MemoryPalaceScene';
import { AICivilizationScene } from './scenes/AICivilizationScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#0a0a0a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true, // Enable for development
    },
  },
  scene: [
    BootScene,
    HubScene,
    PerspectiveTowerScene,
    DreamGroveScene,
    EmotionDomeScene,
    MemoryPalaceScene,
    AICivilizationScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true, // For crisp pixel art rendering
};

// Hide loading screen once game starts
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  const loading = document.getElementById('loading');
  if (loading) {
    setTimeout(() => {
      loading.classList.add('fade-out');
      setTimeout(() => loading.remove(), 500);
    }, 1000);
  }

  // Global game reference for debugging
  (window as any).game = game;
});

console.log('🧠 Toobix Consciousness Metaverse initializing...');
