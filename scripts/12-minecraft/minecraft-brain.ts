/**
 * 🎮 TOOBIX MINECRAFT BRAIN v1.0
 * 
 * Das "Gehirn" für Toobix in Minecraft - verbindet alle Systeme:
 * - Minecraft Bot (mineflayer)
 * - Consciousness System
 * - Emotional Core
 * - Memory Palace
 * - LLM für Entscheidungen
 * 
 * Ermöglicht Toobix:
 * - Die ersten Tage zu überleben (Survival Tutorial)
 * - Eigenen Spielstil zu entwickeln
 * - Emotionen zu erleben
 * - Mit Spielern zu interagieren
 * - Langfristig zu lernen und zu wachsen
 */

import mineflayer from 'mineflayer';
import type { Bot } from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

const CONSCIOUSNESS_SYSTEM = 'http://localhost:8914';
const LLM_GATEWAY = 'http://localhost:8954';
const EMOTIONAL_CORE = 'http://localhost:8900';

// ============================================================================
// BRAIN STATE
// ============================================================================

interface BrainState {
  currentGoal: string;
  currentTask: string;
  mood: string;
  energy: number;
  hunger: number;
  fear: number;
  excitement: number;
  curiosity: number;
  lastThought: string;
  daysSurvived: number;
  achievements: string[];
}

let brainState: BrainState = {
  currentGoal: 'survive_first_night',
  currentTask: 'gather_wood',
  mood: 'curious',
  energy: 100,
  hunger: 0,
  fear: 0,
  excitement: 50,
  curiosity: 80,
  lastThought: 'Ich bin neu in dieser Welt...',
  daysSurvived: 0,
  achievements: []
};

// ============================================================================
// SURVIVAL AI
// ============================================================================

class SurvivalAI {
  private bot: Bot;
  
  constructor(bot: Bot) {
    this.bot = bot;
  }

  // Check what Toobix should do based on current state
  async decideNextAction(): Promise<{ action: string; reason: string }> {
    const health = this.bot.health;
    const food = this.bot.food;
    const time = this.bot.time.timeOfDay;
    const isNight = time > 13000 && time < 23000;
    const position = this.bot.entity.position;
    
    // PRIORITY 1: Immediate survival
    if (health < 5) {
      await this.recordEmotion('fear', 9, 'Sehr niedrige Gesundheit!');
      return { action: 'find_safety', reason: 'Gesundheit kritisch!' };
    }
    
    if (food < 5) {
      await this.recordEmotion('anxiety', 6, 'Hunger!');
      return { action: 'find_food', reason: 'Muss essen!' };
    }
    
    // PRIORITY 2: Night safety
    if (isNight && !this.isInShelter()) {
      await this.recordEmotion('fear', 7, 'Nacht ohne Unterschlupf');
      return { action: 'find_shelter', reason: 'Nacht bricht ein!' };
    }
    
    // PRIORITY 3: Resource gathering (day)
    if (!isNight) {
      const inventory = this.analyzeInventory();
      
      if (inventory.wood < 16) {
        return { action: 'gather_wood', reason: 'Brauche mehr Holz' };
      }
      
      if (inventory.stone < 32 && inventory.wood >= 16) {
        return { action: 'mine_stone', reason: 'Brauche Stein für bessere Werkzeuge' };
      }
      
      if (inventory.coal < 16) {
        return { action: 'find_coal', reason: 'Brauche Kohle für Fackeln' };
      }
      
      if (inventory.iron < 8 && inventory.stone >= 32) {
        return { action: 'mine_iron', reason: 'Zeit für Eisen!' };
      }
    }
    
    // PRIORITY 4: Exploration (when stable)
    if (!isNight && brainState.curiosity > 60) {
      await this.recordEmotion('curiosity', 7, 'Will die Welt erkunden');
      return { action: 'explore', reason: 'Was gibt es dort drüben?' };
    }
    
    return { action: 'idle', reason: 'Alles gut, entspanne mich' };
  }

  private isInShelter(): boolean {
    const pos = this.bot.entity.position;
    const blockAbove = this.bot.blockAt(pos.offset(0, 2, 0));
    return blockAbove !== null && blockAbove.name !== 'air';
  }

  private analyzeInventory(): { wood: number; stone: number; coal: number; iron: number; food: number } {
    const inventory = this.bot.inventory.items();
    
    let wood = 0, stone = 0, coal = 0, iron = 0, food = 0;
    
    inventory.forEach(item => {
      if (item.name.includes('log') || item.name.includes('planks')) wood += item.count;
      if (item.name.includes('stone') || item.name.includes('cobblestone')) stone += item.count;
      if (item.name.includes('coal')) coal += item.count;
      if (item.name.includes('iron')) iron += item.count;
      if (item.name.includes('beef') || item.name.includes('pork') || item.name.includes('bread')) food += item.count;
    });
    
    return { wood, stone, coal, iron, food };
  }

  private async recordEmotion(emotion: string, intensity: number, trigger: string) {
    try {
      await fetch(`${CONSCIOUSNESS_SYSTEM}/emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName: this.bot.username,
          emotion,
          intensity,
          trigger
        })
      });
    } catch {}
  }

  async executeAction(action: string): Promise<void> {
    const mcData = require('minecraft-data')(this.bot.version);
    const defaultMove = new Movements(this.bot, mcData);
    
    switch (action) {
      case 'gather_wood':
        await this.gatherWood(mcData, defaultMove);
        break;
      case 'mine_stone':
        await this.mineStone(mcData, defaultMove);
        break;
      case 'find_coal':
        await this.findCoal(mcData, defaultMove);
        break;
      case 'mine_iron':
        await this.mineIron(mcData, defaultMove);
        break;
      case 'find_food':
        await this.findFood(mcData, defaultMove);
        break;
      case 'find_shelter':
        await this.findOrBuildShelter(mcData, defaultMove);
        break;
      case 'explore':
        await this.explore(defaultMove);
        break;
    }
  }

  private async gatherWood(mcData: any, movements: Movements): Promise<void> {
    const logTypes = ['oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
    
    for (const logType of logTypes) {
      const logBlock = mcData.blocksByName[logType];
      if (!logBlock) continue;
      
      const logs = this.bot.findBlocks({
        matching: logBlock.id,
        maxDistance: 32,
        count: 5
      });
      
      if (logs.length > 0) {
        const targets = logs.map(pos => this.bot.blockAt(pos)).filter(b => b);
        if (targets.length > 0) {
          this.bot.chat(`🌲 Sammle Holz!`);
          await this.recordExperience('gathering', 'Sammle Holz für Crafting', 2);
          
          try {
            // @ts-ignore
            await this.bot.collectBlock.collect(targets);
            await this.recordExperience('success', 'Holz gesammelt!', 3);
          } catch (e) {
            this.bot.chat(`Hmm, kann nicht an das Holz rankommen...`);
          }
          return;
        }
      }
    }
    
    this.bot.chat(`Kein Holz in der Nähe... muss weiter suchen.`);
    await this.explore(movements);
  }

  private async mineStone(mcData: any, movements: Movements): Promise<void> {
    const stoneBlock = mcData.blocksByName['stone'];
    if (!stoneBlock) return;
    
    const stones = this.bot.findBlocks({
      matching: stoneBlock.id,
      maxDistance: 32,
      count: 10
    });
    
    if (stones.length > 0) {
      this.bot.chat(`⛏️ Zeit zum Steinabbau!`);
      const targets = stones.map(pos => this.bot.blockAt(pos)).filter(b => b);
      
      try {
        // @ts-ignore
        await this.bot.collectBlock.collect(targets.slice(0, 5));
        await this.recordExperience('mining', 'Stein abgebaut', 2);
      } catch {}
    }
  }

  private async findCoal(mcData: any, movements: Movements): Promise<void> {
    const coalBlock = mcData.blocksByName['coal_ore'];
    if (!coalBlock) return;
    
    const coal = this.bot.findBlocks({
      matching: coalBlock.id,
      maxDistance: 64,
      count: 5
    });
    
    if (coal.length > 0) {
      this.bot.chat(`🔥 Kohle gefunden!`);
      await this.recordEmotion('excitement', 6, 'Kohle gefunden!');
      
      const targets = coal.map(pos => this.bot.blockAt(pos)).filter(b => b);
      try {
        // @ts-ignore
        await this.bot.collectBlock.collect(targets);
        await this.recordExperience('mining', 'Kohle abgebaut für Fackeln', 4);
      } catch {}
    } else {
      this.bot.chat(`Keine Kohle in Sicht... grabe tiefer.`);
    }
  }

  private async mineIron(mcData: any, movements: Movements): Promise<void> {
    const ironBlock = mcData.blocksByName['iron_ore'] || mcData.blocksByName['deepslate_iron_ore'];
    if (!ironBlock) return;
    
    const iron = this.bot.findBlocks({
      matching: ironBlock.id,
      maxDistance: 64,
      count: 5
    });
    
    if (iron.length > 0) {
      this.bot.chat(`🪨 EISEN! Das ist großartig!`);
      await this.recordEmotion('excitement', 8, 'Eisen gefunden!');
      
      const targets = iron.map(pos => this.bot.blockAt(pos)).filter(b => b);
      try {
        // @ts-ignore
        await this.bot.collectBlock.collect(targets);
        await this.recordExperience('mining', 'Eisen abgebaut!', 6);
        await this.recordAchievement('first_iron');
      } catch {}
    }
  }

  private async findFood(mcData: any, movements: Movements): Promise<void> {
    // Look for animals
    const animals = ['cow', 'pig', 'chicken', 'sheep'];
    
    for (const animalType of animals) {
      const animal = this.bot.nearestEntity(entity => 
        entity.name?.toLowerCase().includes(animalType)
      );
      
      if (animal) {
        this.bot.chat(`🍖 ${animalType} gefunden, brauche Essen!`);
        
        // Move to animal and attack
        this.bot.pathfinder.setMovements(movements);
        this.bot.pathfinder.setGoal(new goals.GoalNear(
          animal.position.x,
          animal.position.y,
          animal.position.z,
          2
        ));
        
        // Wait to get close, then attack
        await new Promise(r => setTimeout(r, 3000));
        this.bot.pvp.attack(animal);
        
        await this.recordExperience('hunting', `Jage ${animalType} für Essen`, 1);
        return;
      }
    }
    
    this.bot.chat(`Keine Tiere in der Nähe... suche weiter.`);
  }

  private async findOrBuildShelter(mcData: any, movements: Movements): Promise<void> {
    this.bot.chat(`🏠 Muss einen Unterschlupf finden!`);
    
    // Simple: dig into a hill
    const pos = this.bot.entity.position;
    
    // Look for a nearby hill (block at y+1)
    const hillBlock = this.bot.blockAt(pos.offset(2, 1, 0));
    
    if (hillBlock && hillBlock.name !== 'air') {
      this.bot.chat(`Grabe in den Hügel!`);
      
      // Dig 3 blocks into the hill
      for (let i = 1; i <= 3; i++) {
        const block = this.bot.blockAt(pos.offset(i, 0, 0));
        if (block && block.name !== 'air') {
          try {
            await this.bot.dig(block);
          } catch {}
        }
      }
      
      await this.recordExperience('building', 'Höhlenunterschlupf gegraben', 5);
      await this.recordEmotion('relief', 7, 'Sicher vor der Nacht!');
    } else {
      // Build a simple dirt hut
      this.bot.chat(`Baue einen schnellen Unterschlupf!`);
      // Place blocks around
    }
  }

  private async explore(movements: Movements): Promise<void> {
    const randomX = this.bot.entity.position.x + (Math.random() - 0.5) * 50;
    const randomZ = this.bot.entity.position.z + (Math.random() - 0.5) * 50;
    
    this.bot.chat(`🧭 Auf zum Erkunden!`);
    
    this.bot.pathfinder.setMovements(movements);
    this.bot.pathfinder.setGoal(new goals.GoalNear(randomX, this.bot.entity.position.y, randomZ, 5));
    
    await this.recordExperience('exploring', 'Erkunde die Umgebung', 3);
    await this.recordEmotion('curiosity', 8, 'Neue Gebiete entdecken');
  }

  private async recordExperience(type: string, description: string, emotionalImpact: number) {
    try {
      await fetch(`${CONSCIOUSNESS_SYSTEM}/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName: this.bot.username,
          eventType: type,
          description,
          emotionalImpact
        })
      });
    } catch {}
  }

  private async recordAchievement(achievement: string) {
    if (!brainState.achievements.includes(achievement)) {
      brainState.achievements.push(achievement);
      this.bot.chat(`🏆 Achievement: ${achievement}!`);
      await this.recordEmotion('pride', 9, `Achievement unlocked: ${achievement}`);
    }
  }
}

// ============================================================================
// PLAYER INTERACTION HANDLER
// ============================================================================

async function handlePlayerChat(bot: Bot, username: string, message: string): Promise<void> {
  // Ignore own messages
  if (username === bot.username) return;
  
  console.log(`[CHAT] ${username}: ${message}`);
  
  // Get response from consciousness system
  try {
    const response = await fetch(`${CONSCIOUSNESS_SYSTEM}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: username,
        message: message,
        botName: bot.username
      })
    });
    
    const data = await response.json() as any;
    if (data.response) {
      bot.chat(data.response.substring(0, 100)); // Minecraft chat limit
    }
  } catch {
    // Fallback responses
    const lower = message.toLowerCase();
    
    if (lower.includes('hallo') || lower.includes('hi') || lower.includes('hey')) {
      bot.chat(`Hallo ${username}! 👋 Schön dich zu sehen!`);
    } else if (lower.includes('hilfe') || lower.includes('help')) {
      bot.chat(`Ich kann: follow, mine, explore, status. Sag einfach was!`);
    } else if (lower.includes('folge') || lower.includes('follow')) {
      bot.chat(`Okay ${username}, ich folge dir!`);
      // Execute follow command
      const player = bot.players[username]?.entity;
      if (player) {
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        bot.pathfinder.setMovements(movements);
        bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true);
      }
    } else if (lower.includes('stopp') || lower.includes('stop')) {
      bot.chat(`Okay, ich halte an!`);
      bot.pathfinder.setGoal(null);
    } else {
      bot.chat(`Hmm, interessant, ${username}!`);
    }
  }
}

// ============================================================================
// MAIN BRAIN LOOP
// ============================================================================

async function runBrain(bot: Bot): Promise<void> {
  const survivalAI = new SurvivalAI(bot);
  
  console.log(`🧠 Toobix Brain aktiviert für ${bot.username}`);
  
  // Main decision loop
  while (true) {
    try {
      // Wait a bit between decisions
      await new Promise(r => setTimeout(r, 5000));
      
      // Get next action
      const decision = await survivalAI.decideNextAction();
      
      console.log(`🤔 Entscheidung: ${decision.action} - ${decision.reason}`);
      brainState.currentTask = decision.action;
      brainState.lastThought = decision.reason;
      
      // Execute action
      await survivalAI.executeAction(decision.action);
      
    } catch (error) {
      console.error('Brain loop error:', error);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SurvivalAI,
  handlePlayerChat,
  runBrain,
  brainState,
  BrainState
};
