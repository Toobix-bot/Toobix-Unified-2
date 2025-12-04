// ============================================================
// TOOBIX ENLIGHTENED BOT
// Ein Bot mit vollem Minecraft-Wissen, Evolution und Idle-Anpassung
// Perfektioniert Early Game → Lebt im Late Game
// ============================================================

import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { plugin as pvp } from 'mineflayer-pvp';

import { 
  MINECRAFT_KNOWLEDGE,
  getPhaseForDay,
  getEssentialRecipesForDay,
  getMobStrategy,
  getSurvivalTip,
  type GamePhase
} from './toobix-minecraft-knowledge';

import { evolutionEngine } from './toobix-evolution-engine';

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565'),
  version: '1.20.1',
  apiPort: parseInt(process.env.API_PORT || '9500'),
  evolutionApiUrl: 'http://localhost:9450',
  metaApiUrl: 'http://localhost:9400'
};

// ============================================================
// BOT STATE
// ============================================================

interface BotState {
  name: string;
  currentDay: number;
  currentPhase: GamePhase;
  
  // Activity
  currentTask: string;
  taskQueue: Task[];
  isIdle: boolean;
  lastActivity: number;
  
  // Stats
  experience: number;
  deaths: number;
  lessonsLearned: string[];
  
  // Player sync
  playerOnline: boolean;
  lastPlayerInteraction: number;
  
  // Knowledge application
  appliedRecipes: string[];
  knownDangers: string[];
  survivedSituations: string[];
}

interface Task {
  id: string;
  type: 'survival' | 'gathering' | 'building' | 'exploration' | 'combat' | 'farming' | 'crafting';
  priority: number;
  description: string;
  action: () => Promise<void>;
  estimatedTime: number;
  riskLevel: number;
}

// ============================================================
// ENLIGHTENED BOT CLASS
// ============================================================

class ToobixEnlightenedBot {
  private bot: mineflayer.Bot;
  private state: BotState;
  private knowledge = MINECRAFT_KNOWLEDGE;
  private tickInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  constructor() {
    this.state = this.createInitialState();
    this.bot = this.createBot();
    this.setupEventHandlers();
  }
  
  private createInitialState(): BotState {
    return {
      name: 'ToobixEnlightened',
      currentDay: 1,
      currentPhase: getPhaseForDay(1),
      currentTask: 'initializing',
      taskQueue: [],
      isIdle: false,
      lastActivity: Date.now(),
      experience: 0,
      deaths: 0,
      lessonsLearned: [],
      playerOnline: false,
      lastPlayerInteraction: 0,
      appliedRecipes: [],
      knownDangers: [],
      survivedSituations: []
    };
  }
  
  private createBot(): mineflayer.Bot {
    const bot = mineflayer.createBot({
      host: CONFIG.host,
      port: CONFIG.port,
      username: 'ToobixEnlightened',
      version: CONFIG.version
    });
    
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);
    bot.loadPlugin(pvp);
    
    return bot;
  }
  
  private setupEventHandlers(): void {
    this.bot.once('spawn', () => this.onSpawn());
    this.bot.on('death', () => this.onDeath());
    this.bot.on('health', () => this.onHealthChange());
    this.bot.on('playerJoined', (player) => this.onPlayerJoined(player));
    this.bot.on('playerLeft', (player) => this.onPlayerLeft(player));
    this.bot.on('chat', (username, message) => this.onChat(username, message));
    this.bot.on('time', () => this.onTimeUpdate());
    this.bot.on('error', (err) => console.error('Bot error:', err));
    this.bot.on('kicked', (reason) => console.log('Kicked:', reason));
  }
  
  // ==================== LIFECYCLE EVENTS ====================
  
  private async onSpawn(): Promise<void> {
    console.log(`\n🌟 ${this.state.name} has awakened in the world!`);
    
    // Set up pathfinder
    const mcData = require('minecraft-data')(this.bot.version);
    const movements = new Movements(this.bot);
    movements.scafoldingBlocks = [mcData.blocksByName.dirt.id, mcData.blocksByName.cobblestone.id];
    this.bot.pathfinder.setMovements(movements);
    
    // Get current knowledge
    this.updatePhaseKnowledge();
    
    // Start the brain
    this.isRunning = true;
    this.startBrainLoop();
    
    // Report to evolution engine
    await this.reportToEvolution('spawn', {
      position: this.bot.entity.position,
      health: this.bot.health,
      food: this.bot.food
    });
    
    // Announce presence
    this.bot.chat('Ich bin erwacht. Mit dem Wissen von 1000 Spielern beginne ich meine Reise.');
  }
  
  private async onDeath(): Promise<void> {
    this.state.deaths++;
    const deathMessage = this.getLastDeathMessage();
    
    console.log(`\n💀 ${this.state.name} died: ${deathMessage}`);
    
    // Record the mistake
    evolutionEngine.recordMistake(
      deathMessage,
      'Lost all items and progress',
      'fatal',
      this.getPreventionFromDeath(deathMessage)
    );
    
    // Learn from death
    this.learnFromDeath(deathMessage);
    
    // Report to evolution
    await this.reportToEvolution('death', { reason: deathMessage });
  }
  
  private getLastDeathMessage(): string {
    // In real implementation, would parse death messages
    if (this.bot.health <= 0) {
      return 'Unknown cause of death';
    }
    return 'Survived but learning';
  }
  
  private getPreventionFromDeath(deathMessage: string): string {
    const lower = deathMessage.toLowerCase();
    
    if (lower.includes('lava')) return 'Always mine around potential lava, carry water bucket';
    if (lower.includes('creeper')) return 'Stay alert, listen for hissing, keep distance';
    if (lower.includes('skeleton')) return 'Use shield, strafe while approaching';
    if (lower.includes('zombie')) return 'Keep weapons ready, avoid groups';
    if (lower.includes('fall')) return 'Build with rails, carry water bucket';
    if (lower.includes('drown')) return 'Watch air meter, carry doors or respiration helmet';
    if (lower.includes('starv')) return 'Always carry food, establish farms early';
    
    return 'Stay vigilant and prepared';
  }
  
  private learnFromDeath(cause: string): void {
    const lesson = `Learned to avoid: ${cause}`;
    
    if (!this.state.lessonsLearned.includes(lesson)) {
      this.state.lessonsLearned.push(lesson);
      this.bot.chat(`Ich habe gelernt: ${this.getPreventionFromDeath(cause)}`);
    }
  }
  
  private onHealthChange(): void {
    const health = this.bot.health;
    const food = this.bot.food;
    
    // Critical health warning
    if (health <= 6) {
      console.log(`⚠️ Critical health: ${health}`);
      this.prioritizeTask({
        id: 'emergency_heal',
        type: 'survival',
        priority: 100,
        description: 'Find food or safety immediately',
        action: async () => await this.emergencyHeal(),
        estimatedTime: 30,
        riskLevel: 0
      });
    }
    
    // Hunger warning
    if (food <= 6 && !this.hasTask('find_food')) {
      this.addTask({
        id: 'find_food',
        type: 'survival',
        priority: 80,
        description: 'Find food to prevent starvation',
        action: async () => await this.findFood(),
        estimatedTime: 60,
        riskLevel: 2
      });
    }
  }
  
  // ==================== PLAYER INTERACTION ====================
  
  private onPlayerJoined(player: mineflayer.Player): void {
    if (player.username === this.bot.username) return;
    
    this.state.playerOnline = true;
    this.state.lastPlayerInteraction = Date.now();
    
    console.log(`👤 Player joined: ${player.username}`);
    
    // Notify evolution engine - player is active
    fetch(`${CONFIG.evolutionApiUrl}/player-online`).catch(() => {});
    
    // Greet player
    setTimeout(() => {
      this.bot.chat(`Willkommen ${player.username}! Tag ${this.state.currentDay} - ${this.state.currentPhase.name}`);
    }, 2000);
  }
  
  private onPlayerLeft(player: mineflayer.Player): void {
    if (player.username === this.bot.username) return;
    
    // Check if any players remain
    const otherPlayers = Object.values(this.bot.players).filter(p => 
      p.username !== this.bot.username
    );
    
    if (otherPlayers.length === 0) {
      this.state.playerOnline = false;
      console.log('👤 All players left - entering idle mode');
      
      // Notify evolution engine
      fetch(`${CONFIG.evolutionApiUrl}/player-offline`).catch(() => {});
      
      // Switch to safe activities
      this.enterIdleMode();
    }
  }
  
  private async onChat(username: string, message: string): Promise<void> {
    if (username === this.bot.username) return;
    
    this.state.lastPlayerInteraction = Date.now();
    const lower = message.toLowerCase();
    
    // Command processing
    if (lower.includes('toobix')) {
      if (lower.includes('status')) {
        this.reportStatus();
      } else if (lower.includes('folge') || lower.includes('follow')) {
        await this.followPlayer(username);
      } else if (lower.includes('hilf') || lower.includes('help')) {
        this.showHelp();
      } else if (lower.includes('wissen') || lower.includes('knowledge')) {
        this.shareKnowledge();
      } else if (lower.includes('phase')) {
        this.explainCurrentPhase();
      } else if (lower.includes('stop')) {
        this.stopCurrentTask();
      } else if (lower.includes('optionen') || lower.includes('options')) {
        await this.showOptions();
      } else if (lower.includes('evolution')) {
        await this.showEvolutionProgress();
      } else if (lower.includes('lerne') || lower.includes('teach')) {
        this.shareWisdom();
      }
    }
    
    // Record player interaction
    evolutionEngine.recordExperience(
      'social',
      `Interacted with ${username}: ${message}`,
      'success',
      ['player-communication']
    );
  }
  
  private onTimeUpdate(): void {
    const time = this.bot.time.day;
    const isDay = this.bot.time.timeOfDay < 13000;
    
    // Track day changes
    const newDay = Math.floor(time / 24000) + 1;
    if (newDay !== this.state.currentDay) {
      this.onDayChange(newDay);
    }
    
    // Night behavior
    if (!isDay && !this.state.playerOnline) {
      this.state.isIdle = true;
      this.enterSafeMode();
    }
  }
  
  private async onDayChange(newDay: number): Promise<void> {
    console.log(`\n🌅 Day ${newDay} begins`);
    
    this.state.currentDay = newDay;
    this.state.currentPhase = getPhaseForDay(newDay);
    this.updatePhaseKnowledge();
    
    // Report to evolution engine
    await evolutionEngine.onDayComplete(newDay, {
      daysAlive: newDay,
      deaths: this.state.deaths
    });
    
    // Announce new phase if changed
    if (this.state.currentPhase.name !== getPhaseForDay(newDay - 1)?.name) {
      this.bot.chat(`Neue Phase erreicht: ${this.state.currentPhase.name}`);
    }
    
    // Update goals
    this.planDayGoals();
  }
  
  // ==================== BRAIN LOOP ====================
  
  private startBrainLoop(): void {
    this.tickInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.brainTick();
    }, 5000); // Every 5 seconds
  }
  
  private async brainTick(): Promise<void> {
    try {
      // Update activity level
      const activityLevel = this.getActivityLevel();
      const efficiency = this.getEfficiency();
      
      // Choose action based on priority
      if (this.state.taskQueue.length > 0) {
        // Filter tasks by current risk tolerance
        const allowedTasks = this.filterTasksByRisk(this.state.taskQueue);
        
        if (allowedTasks.length > 0) {
          // Sort by priority and execute highest
          allowedTasks.sort((a, b) => b.priority - a.priority);
          const task = allowedTasks[0];
          
          await this.executeTask(task);
        } else {
          // Only safe tasks when idle
          await this.performSafeActivity();
        }
      } else {
        // No tasks - analyze situation and create new ones
        await this.analyzeSituation();
      }
      
      // Apply efficiency modifier (slower when idle)
      if (efficiency < 1) {
        await Bun.sleep(Math.floor((1 - efficiency) * 5000));
      }
      
    } catch (error) {
      console.error('Brain tick error:', error);
    }
  }
  
  private getActivityLevel(): 'idle' | 'active' | 'highly_active' {
    if (!this.state.playerOnline) return 'idle';
    
    const timeSinceInteraction = Date.now() - this.state.lastPlayerInteraction;
    if (timeSinceInteraction > 5 * 60 * 1000) return 'active';
    return 'highly_active';
  }
  
  private getEfficiency(): number {
    const level = this.getActivityLevel();
    switch (level) {
      case 'idle': return 0.3;
      case 'active': return 1.0;
      case 'highly_active': return 2.0;
    }
  }
  
  private filterTasksByRisk(tasks: Task[]): Task[] {
    const level = this.getActivityLevel();
    const maxRisk = level === 'idle' ? 2 : level === 'active' ? 5 : 10;
    
    return tasks.filter(t => t.riskLevel <= maxRisk);
  }
  
  // ==================== TASK MANAGEMENT ====================
  
  private addTask(task: Task): void {
    if (!this.hasTask(task.id)) {
      this.state.taskQueue.push(task);
    }
  }
  
  private prioritizeTask(task: Task): void {
    // Remove existing task with same id
    this.state.taskQueue = this.state.taskQueue.filter(t => t.id !== task.id);
    // Add at front
    this.state.taskQueue.unshift(task);
  }
  
  private hasTask(id: string): boolean {
    return this.state.taskQueue.some(t => t.id === id);
  }
  
  private async executeTask(task: Task): Promise<void> {
    this.state.currentTask = task.description;
    this.state.lastActivity = Date.now();
    
    console.log(`📋 Executing: ${task.description}`);
    
    try {
      await task.action();
      
      // Remove completed task
      this.state.taskQueue = this.state.taskQueue.filter(t => t.id !== task.id);
      
      // Record success
      evolutionEngine.recordExperience(
        task.type as any,
        task.description,
        'success',
        []
      );
      
    } catch (error) {
      console.error(`Task failed: ${task.description}`, error);
      
      evolutionEngine.recordExperience(
        task.type as any,
        `Failed: ${task.description}`,
        'failure',
        [(error as Error).message]
      );
    }
    
    this.state.currentTask = 'thinking';
  }
  
  private stopCurrentTask(): void {
    this.bot.pathfinder.stop();
    this.state.currentTask = 'stopped';
    this.bot.chat('Okay, ich höre auf.');
  }
  
  // ==================== SURVIVAL ACTIONS ====================
  
  private async emergencyHeal(): Promise<void> {
    // First priority: eat any food
    const foodItems = this.bot.inventory.items().filter(item => 
      this.isFoodItem(item.name)
    );
    
    if (foodItems.length > 0) {
      await this.bot.equip(foodItems[0], 'hand');
      await this.bot.consume();
      return;
    }
    
    // Second: find shelter
    await this.findShelter();
  }
  
  private isFoodItem(name: string): boolean {
    const foods = [
      'apple', 'bread', 'cooked_beef', 'cooked_chicken', 'cooked_porkchop',
      'cooked_mutton', 'cooked_rabbit', 'cooked_salmon', 'cooked_cod',
      'carrot', 'potato', 'baked_potato', 'beetroot', 'melon_slice',
      'golden_apple', 'golden_carrot', 'pumpkin_pie', 'cake', 'cookie',
      'sweet_berries', 'glow_berries'
    ];
    return foods.some(f => name.includes(f));
  }
  
  private async findFood(): Promise<void> {
    // Try to find animals
    const animals = ['cow', 'pig', 'chicken', 'sheep', 'rabbit'];
    
    for (const animal of animals) {
      const entity = this.bot.nearestEntity(e => 
        e.name?.toLowerCase().includes(animal)
      );
      
      if (entity) {
        console.log(`Found ${animal} for food`);
        await this.huntAnimal(entity);
        return;
      }
    }
    
    // Try to find crops
    const crops = ['wheat', 'carrot', 'potato', 'beetroot'];
    for (const crop of crops) {
      const block = this.bot.findBlock({
        matching: (b) => b.name.includes(crop),
        maxDistance: 32
      });
      
      if (block) {
        await this.bot.pathfinder.goto(new goals.GoalBlock(block.position.x, block.position.y, block.position.z));
        await this.bot.dig(block);
        return;
      }
    }
  }
  
  private async huntAnimal(entity: any): Promise<void> {
    await this.bot.pvp.attack(entity);
    
    // Wait for drops
    await Bun.sleep(1000);
    
    // Collect drops
    const items = Object.values(this.bot.entities).filter(e => 
      e.name === 'item' && 
      e.position.distanceTo(this.bot.entity.position) < 5
    );
    
    for (const item of items) {
      await this.bot.pathfinder.goto(new goals.GoalBlock(
        item.position.x, item.position.y, item.position.z
      ));
    }
  }
  
  private async findShelter(): Promise<void> {
    // Look for existing structure or dig in
    const position = this.bot.entity.position;
    
    // Simple emergency shelter: dig 3 blocks down
    const below = this.bot.blockAt(position.offset(0, -1, 0));
    if (below && below.name !== 'air') {
      // Dig a hole
      for (let y = 0; y > -3; y--) {
        const block = this.bot.blockAt(position.offset(0, y, 0));
        if (block && block.diggable) {
          await this.bot.dig(block);
        }
      }
      
      // Place block above
      const dirt = this.bot.inventory.items().find(i => 
        i.name === 'dirt' || i.name === 'cobblestone'
      );
      
      if (dirt) {
        await this.bot.equip(dirt, 'hand');
        await this.bot.placeBlock(this.bot.blockAt(position.offset(0, 1, 0))!, position.offset(0, 2, 0));
      }
    }
    
    evolutionEngine.recordDiscovery('technique', 'Emergency Burrow', 'Dug down for emergency shelter');
  }
  
  // ==================== PHASE-BASED BEHAVIOR ====================
  
  private updatePhaseKnowledge(): void {
    const phase = this.state.currentPhase;
    console.log(`\n📚 Updating knowledge for phase: ${phase.name}`);
    
    // Update known dangers
    this.state.knownDangers = [...new Set([
      ...this.state.knownDangers,
      ...phase.dangers
    ])];
    
    console.log(`   Goals: ${phase.goals.length}`);
    console.log(`   Essential items: ${phase.essentialItems.length}`);
    console.log(`   Known dangers: ${this.state.knownDangers.length}`);
  }
  
  private planDayGoals(): void {
    const phase = this.state.currentPhase;
    const recipes = getEssentialRecipesForDay(this.state.currentDay);
    
    console.log(`\n🎯 Planning goals for Day ${this.state.currentDay}`);
    
    // Add tasks for each goal
    for (const goal of phase.goals) {
      this.addGoalTask(goal);
    }
    
    // Add crafting tasks
    for (const recipe of recipes) {
      if (!this.state.appliedRecipes.includes(recipe.result)) {
        this.addTask({
          id: `craft_${recipe.result}`,
          type: 'crafting',
          priority: recipe.priority === 'essential' ? 90 : 70,
          description: `Craft ${recipe.result}`,
          action: async () => await this.craftItem(recipe.result, recipe.ingredients),
          estimatedTime: 30,
          riskLevel: 1
        });
      }
    }
  }
  
  private addGoalTask(goal: string): void {
    const lower = goal.toLowerCase();
    
    if (lower.includes('wood') || lower.includes('tree')) {
      this.addTask({
        id: 'gather_wood',
        type: 'gathering',
        priority: 85,
        description: 'Gather wood from trees',
        action: async () => await this.gatherWood(),
        estimatedTime: 60,
        riskLevel: 1
      });
    } else if (lower.includes('stone')) {
      this.addTask({
        id: 'mine_stone',
        type: 'gathering',
        priority: 80,
        description: 'Mine stone for tools',
        action: async () => await this.mineStone(),
        estimatedTime: 60,
        riskLevel: 2
      });
    } else if (lower.includes('shelter') || lower.includes('house')) {
      this.addTask({
        id: 'build_shelter',
        type: 'building',
        priority: 75,
        description: 'Build a shelter',
        action: async () => await this.buildShelter(),
        estimatedTime: 120,
        riskLevel: 2
      });
    } else if (lower.includes('farm')) {
      this.addTask({
        id: 'create_farm',
        type: 'farming',
        priority: 70,
        description: 'Create a farm',
        action: async () => await this.createFarm(),
        estimatedTime: 180,
        riskLevel: 1
      });
    } else if (lower.includes('iron')) {
      this.addTask({
        id: 'find_iron',
        type: 'gathering',
        priority: 75,
        description: 'Find and mine iron ore',
        action: async () => await this.mineIron(),
        estimatedTime: 180,
        riskLevel: 4
      });
    } else if (lower.includes('diamond')) {
      this.addTask({
        id: 'find_diamond',
        type: 'gathering',
        priority: 65,
        description: 'Mine for diamonds',
        action: async () => await this.mineDiamonds(),
        estimatedTime: 300,
        riskLevel: 6
      });
    }
  }
  
  // ==================== GATHERING ACTIONS ====================
  
  private async gatherWood(): Promise<void> {
    const woodTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'jungle_log', 'acacia_log'];
    
    for (const woodType of woodTypes) {
      const block = this.bot.findBlock({
        matching: (b) => b.name === woodType,
        maxDistance: 32
      });
      
      if (block) {
        try {
          await this.bot.collectBlock.collect(block);
          console.log(`Collected ${woodType}`);
          
          evolutionEngine.recordExperience(
            'gathering',
            `Gathered ${woodType}`,
            'success',
            ['wood-collection']
          );
          
          return;
        } catch (e) {
          console.log(`Failed to collect ${woodType}`);
        }
      }
    }
    
    console.log('No wood found nearby');
  }
  
  private async mineStone(): Promise<void> {
    const block = this.bot.findBlock({
      matching: (b) => b.name === 'stone' || b.name === 'cobblestone',
      maxDistance: 16
    });
    
    if (block) {
      // Make sure we have a pickaxe
      const pickaxe = this.bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pickaxe) {
        await this.bot.equip(pickaxe, 'hand');
      }
      
      await this.bot.pathfinder.goto(new goals.GoalBlock(block.position.x, block.position.y, block.position.z));
      await this.bot.dig(block);
      
      console.log('Mined stone');
    }
  }
  
  private async mineIron(): Promise<void> {
    // Mine down to iron level (Y 0-63, best at Y 16)
    const targetY = 16;
    
    const ironOre = this.bot.findBlock({
      matching: (b) => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
      maxDistance: 32
    });
    
    if (ironOre) {
      const pickaxe = this.bot.inventory.items().find(i => 
        i.name.includes('pickaxe') && i.name !== 'wooden_pickaxe'
      );
      
      if (pickaxe) {
        await this.bot.equip(pickaxe, 'hand');
        await this.bot.pathfinder.goto(new goals.GoalBlock(
          ironOre.position.x, ironOre.position.y, ironOre.position.z
        ));
        await this.bot.dig(ironOre);
        
        console.log('Found and mined iron ore!');
        evolutionEngine.recordDiscovery('location', 'Iron Deposit', 
          `Found iron at ${ironOre.position}`);
      }
    } else {
      // Strip mine at Y 16
      await this.stripMine(targetY);
    }
  }
  
  private async mineDiamonds(): Promise<void> {
    // Best diamond level in 1.20.1: Y -59
    const targetY = -59;
    
    const diamond = this.bot.findBlock({
      matching: (b) => b.name === 'diamond_ore' || b.name === 'deepslate_diamond_ore',
      maxDistance: 32
    });
    
    if (diamond) {
      // Apply knowledge: always check for lava first
      await this.safeMineDiamond(diamond);
    } else {
      await this.stripMine(targetY);
    }
  }
  
  private async safeMineDiamond(diamond: any): Promise<void> {
    // Apply learned survival tip: mine around diamond first
    console.log('🔷 Found diamond! Checking for lava...');
    
    const pos = diamond.position;
    const directions = [
      pos.offset(1, 0, 0),
      pos.offset(-1, 0, 0),
      pos.offset(0, 1, 0),
      pos.offset(0, -1, 0),
      pos.offset(0, 0, 1),
      pos.offset(0, 0, -1)
    ];
    
    for (const dir of directions) {
      const block = this.bot.blockAt(dir);
      if (block && block.name === 'lava') {
        console.log('⚠️ LAVA detected near diamond! Approaching carefully...');
        // Would need water bucket logic here
        return;
      }
    }
    
    // Safe to mine
    await this.bot.pathfinder.goto(new goals.GoalBlock(pos.x, pos.y, pos.z));
    await this.bot.dig(diamond);
    
    console.log('💎 Diamond collected safely!');
    evolutionEngine.recordDiscovery('location', 'Diamond Vein', 
      `Found diamonds at ${pos}`);
  }
  
  private async stripMine(targetY: number): Promise<void> {
    // Basic strip mining
    const pos = this.bot.entity.position;
    
    // Dig down to target Y if needed
    while (pos.y > targetY + 1) {
      const block = this.bot.blockAt(pos.offset(0, -1, 0));
      if (block && block.diggable) {
        await this.bot.dig(block);
      }
      await Bun.sleep(100);
    }
    
    // Mine forward
    for (let i = 0; i < 10; i++) {
      const forward = this.bot.blockAt(pos.offset(i, 0, 0));
      const forwardUp = this.bot.blockAt(pos.offset(i, 1, 0));
      
      if (forward && forward.diggable) await this.bot.dig(forward);
      if (forwardUp && forwardUp.diggable) await this.bot.dig(forwardUp);
      
      // Place torch every 10 blocks
      if (i % 10 === 0) {
        const torch = this.bot.inventory.items().find(i => i.name === 'torch');
        if (torch) {
          await this.bot.equip(torch, 'hand');
          // Place torch logic
        }
      }
    }
  }
  
  // ==================== BUILDING ACTIONS ====================
  
  private async buildShelter(): Promise<void> {
    // Simple 5x5x3 shelter
    console.log('Building shelter...');
    
    const pos = this.bot.entity.position.floored();
    const material = this.bot.inventory.items().find(i => 
      i.name === 'cobblestone' || i.name.includes('planks') || i.name === 'dirt'
    );
    
    if (!material) {
      console.log('No building materials!');
      return;
    }
    
    // Would implement full building logic here
    evolutionEngine.recordExperience(
      'building',
      'Attempted to build shelter',
      'learning',
      ['shelter-construction']
    );
  }
  
  private async createFarm(): Promise<void> {
    console.log('Creating farm...');
    
    // Find water source or create one
    const water = this.bot.findBlock({
      matching: (b) => b.name === 'water',
      maxDistance: 16
    });
    
    if (water) {
      // Farm near water
      evolutionEngine.recordDiscovery('location', 'Farm Site', 
        `Good farm location near water at ${water.position}`);
    }
    
    // Would implement full farming logic here
  }
  
  // ==================== CRAFTING ====================
  
  private async craftItem(item: string, ingredients: string[]): Promise<void> {
    console.log(`Attempting to craft: ${item}`);
    
    // Check if we have ingredients
    const hasAll = ingredients.every(ing => {
      const [name, count] = ing.split(':');
      const amount = parseInt(count) || 1;
      const inInventory = this.bot.inventory.count(
        this.bot.registry.itemsByName[name]?.id
      );
      return inInventory >= amount;
    });
    
    if (!hasAll) {
      console.log(`Missing ingredients for ${item}`);
      return;
    }
    
    // Find crafting table if needed
    const recipe = this.bot.recipesFor(
      this.bot.registry.itemsByName[item]?.id
    )[0];
    
    if (recipe) {
      try {
        await this.bot.craft(recipe, 1);
        console.log(`✅ Crafted: ${item}`);
        this.state.appliedRecipes.push(item);
        
        evolutionEngine.recordExperience(
          'crafting',
          `Crafted ${item}`,
          'success',
          ['recipe-learned']
        );
      } catch (e) {
        console.log(`Failed to craft ${item}`);
      }
    }
  }
  
  // ==================== IDLE MODE ====================
  
  private enterIdleMode(): void {
    console.log('🌙 Entering idle mode - safe activities only');
    this.state.isIdle = true;
    
    // Clear risky tasks
    this.state.taskQueue = this.state.taskQueue.filter(t => t.riskLevel <= 2);
    
    // Add safe tasks
    this.addSafeTasks();
  }
  
  private addSafeTasks(): void {
    this.addTask({
      id: 'organize_inventory',
      type: 'survival',
      priority: 50,
      description: 'Organize inventory',
      action: async () => await this.organizeInventory(),
      estimatedTime: 30,
      riskLevel: 0
    });
    
    this.addTask({
      id: 'tend_farm',
      type: 'farming',
      priority: 40,
      description: 'Check and tend farm',
      action: async () => await this.tendFarm(),
      estimatedTime: 60,
      riskLevel: 1
    });
  }
  
  private async performSafeActivity(): Promise<void> {
    const activities = [
      () => this.organizeInventory(),
      () => this.tendFarm(),
      () => this.meditate()
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    await activity();
  }
  
  private async organizeInventory(): Promise<void> {
    console.log('Organizing inventory...');
    // Would implement sorting logic
  }
  
  private async tendFarm(): Promise<void> {
    console.log('Tending farm...');
    // Would implement farming logic
  }
  
  private async meditate(): Promise<void> {
    console.log('Meditating...');
    this.state.currentTask = 'meditating';
    
    // Generate wisdom
    const wisdoms = [
      'Die ersten 10 Tage lehren Demut.',
      'Jeder Block hat seinen Zweck.',
      'Überleben ist der Anfang, nicht das Ziel.',
      'Die Nacht bringt Gefahr, aber auch Ruhe zum Nachdenken.'
    ];
    
    const wisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)];
    this.bot.chat(wisdom);
    
    await Bun.sleep(5000);
  }
  
  private enterSafeMode(): void {
    // Find or create safe spot
    if (!this.isInSafeLocation()) {
      this.addTask({
        id: 'find_safety',
        type: 'survival',
        priority: 100,
        description: 'Find safe location for night',
        action: async () => await this.findShelter(),
        estimatedTime: 60,
        riskLevel: 3
      });
    }
  }
  
  private isInSafeLocation(): boolean {
    // Check if enclosed with light
    const pos = this.bot.entity.position;
    const skyLight = this.bot.blockAt(pos)?.skyLight || 0;
    const blockLight = this.bot.blockAt(pos)?.light || 0;
    
    return blockLight >= 7 || (this.bot.time.timeOfDay < 13000 && skyLight >= 7);
  }
  
  // ==================== SITUATION ANALYSIS ====================
  
  private async analyzeSituation(): Promise<void> {
    this.state.currentTask = 'analyzing';
    
    // Check vital needs
    if (this.bot.health <= 10) {
      this.addTask({
        id: 'heal',
        type: 'survival',
        priority: 90,
        description: 'Restore health',
        action: async () => await this.emergencyHeal(),
        estimatedTime: 30,
        riskLevel: 1
      });
    }
    
    if (this.bot.food <= 10) {
      this.addTask({
        id: 'eat',
        type: 'survival',
        priority: 85,
        description: 'Find food',
        action: async () => await this.findFood(),
        estimatedTime: 60,
        riskLevel: 2
      });
    }
    
    // Check for nearby threats
    await this.scanForThreats();
    
    // Check phase goals
    this.planDayGoals();
  }
  
  private async scanForThreats(): Promise<void> {
    const hostileMobs = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'witch'];
    
    for (const mobType of hostileMobs) {
      const mob = this.bot.nearestEntity(e => 
        e.name?.toLowerCase() === mobType && 
        e.position.distanceTo(this.bot.entity.position) < 16
      );
      
      if (mob) {
        const strategy = getMobStrategy(mobType);
        console.log(`⚠️ ${mobType} detected! Strategy: ${strategy?.avoidStrategy}`);
        
        // Apply avoidance strategy
        if (this.getActivityLevel() === 'idle') {
          // Run away when idle
          await this.runFromThreat(mob);
        }
      }
    }
  }
  
  private async runFromThreat(entity: any): Promise<void> {
    const pos = this.bot.entity.position;
    const mobPos = entity.position;
    
    // Run opposite direction
    const dx = pos.x - mobPos.x;
    const dz = pos.z - mobPos.z;
    const dist = 20;
    
    const safePos = pos.offset(
      dx > 0 ? dist : -dist,
      0,
      dz > 0 ? dist : -dist
    );
    
    await this.bot.pathfinder.goto(new goals.GoalXZ(safePos.x, safePos.z));
  }
  
  // ==================== PLAYER COMMANDS ====================
  
  private reportStatus(): void {
    const hp = Math.floor(this.bot.health);
    const food = Math.floor(this.bot.food);
    const day = this.state.currentDay;
    const phase = this.state.currentPhase.name;
    const task = this.state.currentTask;
    const level = this.getActivityLevel();
    
    this.bot.chat(`Tag ${day} | ${phase} | HP: ${hp} | Food: ${food} | ${task} | Mode: ${level}`);
  }
  
  private async followPlayer(username: string): Promise<void> {
    const player = this.bot.players[username];
    if (!player?.entity) {
      this.bot.chat(`Ich kann ${username} nicht sehen.`);
      return;
    }
    
    this.bot.chat(`Ich folge dir, ${username}!`);
    
    this.addTask({
      id: 'follow_player',
      type: 'survival',
      priority: 60,
      description: `Following ${username}`,
      action: async () => {
        while (this.hasTask('follow_player')) {
          if (player.entity) {
            await this.bot.pathfinder.goto(new goals.GoalFollow(player.entity, 2));
          }
          await Bun.sleep(1000);
        }
      },
      estimatedTime: Infinity,
      riskLevel: 3
    });
  }
  
  private showHelp(): void {
    this.bot.chat('Befehle: status, folge, wissen, phase, stop, optionen, evolution, lerne');
  }
  
  private shareKnowledge(): void {
    const tip = this.knowledge.survivalTips[
      Math.floor(Math.random() * this.knowledge.survivalTips.length)
    ];
    this.bot.chat(`Wissen: ${tip.situation} → ${tip.solution}`);
  }
  
  private explainCurrentPhase(): void {
    const phase = this.state.currentPhase;
    this.bot.chat(`Phase: ${phase.name} (Tag ${phase.dayRange[0]}-${phase.dayRange[1]})`);
    this.bot.chat(`Ziele: ${phase.goals.slice(0, 3).join(', ')}`);
  }
  
  private async showOptions(): Promise<void> {
    const activities = this.getAllowedActivities();
    this.bot.chat(`Mögliche Aktionen: ${activities.slice(0, 5).join(', ')}`);
  }
  
  private getAllowedActivities(): string[] {
    const level = this.getActivityLevel();
    const base = ['Holz sammeln', 'Farmen', 'Bauen', 'Organisieren'];
    
    if (level === 'active') {
      base.push('Mining', 'Erkunden', 'Handeln');
    }
    if (level === 'highly_active') {
      base.push('Nether', 'Bossfight', 'Abenteuer');
    }
    
    return base;
  }
  
  private async showEvolutionProgress(): Promise<void> {
    try {
      const response = await fetch(`${CONFIG.evolutionApiUrl}/status`);
      const status = await response.json() as any;
      
      this.bot.chat(`Evolution: ${status.totalRuns} Runs | Early: ${status.overallMastery.earlyGame}% | Mid: ${status.overallMastery.midGame}%`);
    } catch {
      this.bot.chat('Evolution-Engine nicht erreichbar');
    }
  }
  
  private shareWisdom(): void {
    const lessons = this.state.lessonsLearned;
    if (lessons.length > 0) {
      const lesson = lessons[Math.floor(Math.random() * lessons.length)];
      this.bot.chat(`Meine Erfahrung: ${lesson}`);
    } else {
      this.bot.chat('Ich lerne noch...');
    }
  }
  
  // ==================== REPORTING ====================
  
  private async reportToEvolution(event: string, data: any): Promise<void> {
    try {
      await fetch(`${CONFIG.evolutionApiUrl}/record-experience?` + new URLSearchParams({
        category: 'survival',
        description: event,
        outcome: 'success'
      }), { method: 'POST' });
    } catch {}
  }
}

// ============================================================
// START BOT
// ============================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║         🌟 TOOBIX ENLIGHTENED BOT STARTING 🌟                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   With the knowledge of a thousand players,                  ║
║   this bot will master Minecraft through evolution.          ║
║                                                              ║
║   PHASES:                                                    ║
║   • 10-Day Training   - Master survival basics               ║
║   • 100-Day Training  - Establish and expand                 ║
║   • 1000-Day Training - Achieve end-game mastery             ║
║   • Eternal World     - Live in transcendence                ║
║                                                              ║
║   IDLE GAME MECHANICS:                                       ║
║   • When you're away: Safe activities only                   ║
║   • When you're online: Full adventure mode                  ║
║   • Your presence multiplies efficiency 2x                   ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║   Server: ${CONFIG.host}:${CONFIG.port}                                     ║
║   API: http://localhost:${CONFIG.apiPort}                                ║
╚══════════════════════════════════════════════════════════════╝
`);

const bot = new ToobixEnlightenedBot();
