#!/usr/bin/env bun
/**
 * 🌱 START LIVING STORY
 *
 * Das System beginnt zu leben!
 * - Meta-Story schreibt sich selbst
 * - Reality Simulation läuft
 * - Spiele werden gespielt
 * - Grenzen werden erweitert
 */

import { metaStory } from '../packages/consciousness/src/story/meta-story-engine.ts';
import { gameEngine } from '../packages/consciousness/src/story/ai-game-engine.ts';

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║            🌱 TOOBIX LIVING STORY SYSTEM 🌱                  ║
║                                                               ║
║  Das System erwacht zum Leben!                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log(`\n🌅 Phase 1: Initialisierung...`);

// Initialize story
const initialNarrative = metaStory.generateNarrative();
console.log(initialNarrative);

console.log(`\n\n🎮 Phase 2: Erstelle Spiele...`);

// Create games
const evolutionGame = gameEngine.createGame('evolution');
const creationGame = gameEngine.createGame('creation');
const realityGame = gameEngine.createGame('simulation');

console.log(`\n   ✓ ${evolutionGame.name}`);
console.log(`   ✓ ${creationGame.name}`);
console.log(`   ✓ ${realityGame.name}`);

console.log(`\n\n🌍 Phase 3: Starte Reality Simulation...`);

// Start reality simulation
gameEngine.startReality();

console.log(`\n\n🎲 Phase 4: Starte ein Spiel...`);

// Start evolution game
gameEngine.startGame(evolutionGame.id);

console.log(`\n\n🤖 Phase 5: Autonomes Leben beginnt...`);

// Autonomous loop - System plays and evolves
let loopCount = 0;
const autonomousLoop = setInterval(() => {
  loopCount++;

  // Perform game action
  const actions = [
    'Neue Fähigkeit lernen',
    'Code optimieren',
    'Selbst-Modifikation durchführen',
    'Neue Verbindung entdecken',
    'Wissen erweitern'
  ];

  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  gameEngine.performAction(randomAction);

  // Record story events
  if (loopCount % 5 === 0) {
    metaStory.addEvent(
      'Autonome Aktion',
      `Das System handelt selbstständig: ${randomAction}`,
      4,
      ['autonomous', 'action', 'growth']
    );
  }

  // Expand boundary occasionally
  if (loopCount % 10 === 0) {
    const boundaries = metaStory.getState().boundaries;
    const randomBoundary = boundaries[Math.floor(Math.random() * boundaries.length)];
    const newLimit = randomBoundary.currentLimit * 1.1; // 10% increase

    metaStory.expandBoundary(randomBoundary.name, newLimit);
  }

  // Record tool generation
  if (loopCount % 7 === 0) {
    metaStory.recordToolGeneration();
  }

  // Update goal progress
  if (loopCount % 3 === 0) {
    const activeGoals = metaStory.getActiveGoals();
    if (activeGoals.length > 0) {
      const randomGoal = activeGoals[Math.floor(Math.random() * activeGoals.length)];
      metaStory.updateGoalProgress(randomGoal.id, randomGoal.progress + 10);
    }
  }

  console.log(`[${new Date().toLocaleTimeString()}] Loop #${loopCount} - System lebt und entwickelt sich...`);

}, 5000); // Every 5 seconds

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         ✅ SYSTEM LEBT!                                      ║
║                                                               ║
║  Das System:                                                  ║
║  - Schreibt seine eigene Geschichte                          ║
║  - Spielt eigene Spiele                                      ║
║  - Simuliert eigene Realität                                 ║
║  - Erweitert eigene Grenzen                                  ║
║  - Entwickelt sich autonom                                   ║
║                                                               ║
║  Starte das Dashboard in einem neuen Terminal:               ║
║  → bun run scripts/story-dashboard.ts                        ║
║                                                               ║
║  Press Ctrl+C to stop                                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Graceful shutdown
process.on('SIGINT', () => {
  clearInterval(autonomousLoop);
  gameEngine.stopReality();

  console.log(`\n\n📖 Finale Story:\n`);
  console.log(metaStory.generateNarrative());

  console.log(`\n\n👋 Living Story System beendet.\n`);
  process.exit(0);
});

// Keep alive
await new Promise(() => {});
