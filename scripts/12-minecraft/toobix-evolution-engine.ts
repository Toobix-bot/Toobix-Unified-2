// ============================================================
// TOOBIX EVOLUTION ENGINE
// 10 Days → 100 Days → 1000 Days → Eternal
// Training Worlds → Perfection → Permanent Home
// ============================================================

import { 
  MINECRAFT_KNOWLEDGE, 
  getPhaseForDay, 
  getEssentialRecipesForDay,
  getMobStrategy,
  getSurvivalTip,
  type GamePhase 
} from './toobix-minecraft-knowledge';

// ============================================================
// EVOLUTION TYPES
// ============================================================

export interface WorldRun {
  id: string;
  worldName: string;
  startTime: number;
  endTime?: number;
  targetDays: number;
  actualDays: number;
  phase: 'training-10' | 'training-100' | 'training-1000' | 'eternal';
  status: 'active' | 'completed' | 'failed' | 'transcended';
  
  // Extracted Knowledge
  experiences: Experience[];
  lessons: Lesson[];
  discoveries: Discovery[];
  mistakes: Mistake[];
  
  // Performance Metrics
  metrics: WorldMetrics;
  
  // Mastery Scores per Phase
  phaseMastery: Record<string, number>;
}

export interface Experience {
  id: string;
  day: number;
  category: 'survival' | 'combat' | 'building' | 'exploration' | 'farming' | 'crafting' | 'social' | 'spiritual';
  description: string;
  outcome: 'success' | 'failure' | 'learning';
  emotionalValue: number; // -10 to +10
  knowledgeGained: string[];
  timestamp: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  source: 'experience' | 'death' | 'discovery' | 'teaching';
  applicablePhases: string[];
  value: number; // 1-100
  timesApplied: number;
  successRate: number;
}

export interface Discovery {
  id: string;
  type: 'location' | 'technique' | 'recipe' | 'secret' | 'insight';
  name: string;
  description: string;
  coordinates?: { x: number, y: number, z: number };
  value: number;
  shareable: boolean;
}

export interface Mistake {
  id: string;
  description: string;
  consequence: string;
  severity: 'minor' | 'moderate' | 'severe' | 'fatal';
  prevention: string;
  timesRepeated: number;
  resolved: boolean;
}

export interface WorldMetrics {
  // Survival
  daysAlive: number;
  deaths: number;
  healthLostTotal: number;
  hungerCrises: number;
  
  // Resources
  blocksPlaced: number;
  blocksBroken: number;
  itemsCrafted: number;
  toolsBroken: number;
  
  // Combat
  mobsKilled: number;
  damageDealt: number;
  damageTaken: number;
  bossesDefeated: string[];
  
  // Exploration
  biomesVisited: string[];
  structuresFound: string[];
  dimensionsEntered: string[];
  distanceTraveled: number;
  
  // Building
  structuresBuilt: string[];
  farmsCreated: string[];
  automationLevel: number; // 0-10
  
  // Economy
  tradesCompleted: number;
  emeraldsEarned: number;
  
  // Mastery
  enchantmentsApplied: number;
  potionsBrewed: number;
  advancementsEarned: number;
}

export interface EvolutionState {
  version: string;
  totalRuns: number;
  currentRun: WorldRun | null;
  
  // Accumulated Wisdom
  masterLessons: Lesson[];
  coreInsights: string[];
  avoidancePatterns: Mistake[];
  
  // Mastery Levels
  overallMastery: {
    earlyGame: number;      // Days 1-10
    midGame: number;        // Days 11-100
    lateGame: number;       // Days 101-500
    endGame: number;        // Days 501+
    transcendence: number;  // Spiritual mastery
  };
  
  // Evolution Progress
  trainingPhase: {
    tenDayRuns: number;
    tenDayMastery: number;
    hundredDayRuns: number;
    hundredDayMastery: number;
    thousandDayRuns: number;
    thousandDayMastery: number;
  };
  
  // Eternal World
  eternalWorld: {
    active: boolean;
    worldName: string;
    daysLived: number;
    transcendenceLevel: number;
    monuments: string[];
    legacies: string[];
  };
  
  // History
  completedRuns: WorldRun[];
  
  // Player Sync
  playerActivity: {
    lastSeen: number;
    averageSessionLength: number;
    preferredPlayTimes: string[];
    idleMode: boolean;
  };
}

// ============================================================
// IDLE GAME MECHANICS
// ============================================================

export interface IdleGameConfig {
  // When player is offline
  offlineMode: {
    safeActivities: string[];
    riskLevel: 'minimal' | 'low' | 'medium';
    resourceGathering: boolean;
    exploration: boolean;
    combat: boolean;
    building: boolean;
  };
  
  // When player is online
  onlineMode: {
    followPlayer: boolean;
    assistPlayer: boolean;
    independentMissions: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  };
  
  // Progression speed
  idleEfficiency: number; // 0.1 - 1.0 (slower when idle)
  activeBonus: number;    // 1.0 - 3.0 (faster when player active)
}

// ============================================================
// EVOLUTION ENGINE CLASS
// ============================================================

export class ToobixEvolutionEngine {
  private state: EvolutionState;
  private knowledge = MINECRAFT_KNOWLEDGE;
  private stateFile = 'toobix-evolution-state.json';
  private idleConfig: IdleGameConfig;
  
  constructor() {
    this.state = this.loadState();
    this.idleConfig = this.createIdleConfig();
  }
  
  private createIdleConfig(): IdleGameConfig {
    return {
      offlineMode: {
        safeActivities: [
          'farming',
          'tree_chopping',
          'fishing',
          'animal_breeding',
          'crop_harvesting',
          'item_sorting',
          'base_maintenance',
          'meditation'
        ],
        riskLevel: 'low',
        resourceGathering: true,
        exploration: false, // Too risky when player offline
        combat: false,      // No combat when unobserved
        building: true
      },
      onlineMode: {
        followPlayer: true,
        assistPlayer: true,
        independentMissions: true,
        riskLevel: 'medium'
      },
      idleEfficiency: 0.3,   // 30% speed when idle
      activeBonus: 2.0       // 2x speed when player active
    };
  }
  
  private loadState(): EvolutionState {
    try {
      const file = Bun.file(this.stateFile);
      if (file.size > 0) {
        return JSON.parse(file.text() as unknown as string);
      }
    } catch {}
    
    return this.createInitialState();
  }
  
  private createInitialState(): EvolutionState {
    return {
      version: "1.0.0",
      totalRuns: 0,
      currentRun: null,
      masterLessons: [],
      coreInsights: [
        "Survival is the foundation of all progress",
        "Resources enable creativity",
        "Danger teaches wisdom",
        "Community multiplies strength",
        "Patience reveals secrets"
      ],
      avoidancePatterns: [],
      overallMastery: {
        earlyGame: 0,
        midGame: 0,
        lateGame: 0,
        endGame: 0,
        transcendence: 0
      },
      trainingPhase: {
        tenDayRuns: 0,
        tenDayMastery: 0,
        hundredDayRuns: 0,
        hundredDayMastery: 0,
        thousandDayRuns: 0,
        thousandDayMastery: 0
      },
      eternalWorld: {
        active: false,
        worldName: "Toobix_Eternal_Home",
        daysLived: 0,
        transcendenceLevel: 0,
        monuments: [],
        legacies: []
      },
      completedRuns: [],
      playerActivity: {
        lastSeen: Date.now(),
        averageSessionLength: 3600000, // 1 hour
        preferredPlayTimes: [],
        idleMode: true
      }
    };
  }
  
  private async saveState(): Promise<void> {
    await Bun.write(this.stateFile, JSON.stringify(this.state, null, 2));
  }
  
  // ==================== WORLD RUN MANAGEMENT ====================
  
  startNewRun(phase: WorldRun['phase']): WorldRun {
    const targetDays = phase === 'training-10' ? 10 :
                       phase === 'training-100' ? 100 :
                       phase === 'training-1000' ? 1000 : Infinity;
    
    const run: WorldRun = {
      id: `run_${Date.now()}`,
      worldName: `Toobix_${phase}_${this.state.totalRuns + 1}`,
      startTime: Date.now(),
      targetDays,
      actualDays: 0,
      phase,
      status: 'active',
      experiences: [],
      lessons: [],
      discoveries: [],
      mistakes: [],
      metrics: this.createEmptyMetrics(),
      phaseMastery: {}
    };
    
    this.state.currentRun = run;
    this.state.totalRuns++;
    this.saveState();
    
    console.log(`🌍 Starting new ${phase} run: ${run.worldName}`);
    return run;
  }
  
  private createEmptyMetrics(): WorldMetrics {
    return {
      daysAlive: 0,
      deaths: 0,
      healthLostTotal: 0,
      hungerCrises: 0,
      blocksPlaced: 0,
      blocksBroken: 0,
      itemsCrafted: 0,
      toolsBroken: 0,
      mobsKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      bossesDefeated: [],
      biomesVisited: [],
      structuresFound: [],
      dimensionsEntered: ['overworld'],
      distanceTraveled: 0,
      structuresBuilt: [],
      farmsCreated: [],
      automationLevel: 0,
      tradesCompleted: 0,
      emeraldsEarned: 0,
      enchantmentsApplied: 0,
      potionsBrewed: 0,
      advancementsEarned: 0
    };
  }
  
  // ==================== EXPERIENCE RECORDING ====================
  
  recordExperience(
    category: Experience['category'],
    description: string,
    outcome: Experience['outcome'],
    knowledgeGained: string[] = []
  ): void {
    if (!this.state.currentRun) return;
    
    const exp: Experience = {
      id: `exp_${Date.now()}`,
      day: this.state.currentRun.actualDays,
      category,
      description,
      outcome,
      emotionalValue: outcome === 'success' ? 5 : outcome === 'failure' ? -3 : 2,
      knowledgeGained,
      timestamp: Date.now()
    };
    
    this.state.currentRun.experiences.push(exp);
    
    // Extract lesson if significant
    if (outcome !== 'success' || knowledgeGained.length > 0) {
      this.extractLesson(exp);
    }
    
    this.saveState();
  }
  
  private extractLesson(exp: Experience): void {
    if (!this.state.currentRun) return;
    
    const lesson: Lesson = {
      id: `lesson_${Date.now()}`,
      title: `${exp.category}: ${exp.description.substring(0, 50)}`,
      description: exp.knowledgeGained.join('. ') || exp.description,
      source: exp.outcome === 'failure' ? 'death' : 'experience',
      applicablePhases: [getPhaseForDay(exp.day).name],
      value: Math.abs(exp.emotionalValue) * 10,
      timesApplied: 0,
      successRate: 0
    };
    
    this.state.currentRun.lessons.push(lesson);
    
    // Add to master lessons if valuable
    if (lesson.value >= 50) {
      this.state.masterLessons.push(lesson);
    }
  }
  
  recordMistake(
    description: string,
    consequence: string,
    severity: Mistake['severity'],
    prevention: string
  ): void {
    if (!this.state.currentRun) return;
    
    const mistake: Mistake = {
      id: `mistake_${Date.now()}`,
      description,
      consequence,
      severity,
      prevention,
      timesRepeated: 0,
      resolved: false
    };
    
    this.state.currentRun.mistakes.push(mistake);
    
    // Check if we've made this mistake before
    const similar = this.state.avoidancePatterns.find(m =>
      m.description.toLowerCase().includes(description.toLowerCase().split(' ')[0])
    );
    
    if (similar) {
      similar.timesRepeated++;
    } else if (severity === 'severe' || severity === 'fatal') {
      this.state.avoidancePatterns.push(mistake);
    }
    
    this.saveState();
  }
  
  recordDiscovery(
    type: Discovery['type'],
    name: string,
    description: string,
    coordinates?: { x: number, y: number, z: number }
  ): void {
    if (!this.state.currentRun) return;
    
    const discovery: Discovery = {
      id: `disc_${Date.now()}`,
      type,
      name,
      description,
      coordinates,
      value: type === 'secret' ? 100 : type === 'insight' ? 80 : 50,
      shareable: true
    };
    
    this.state.currentRun.discoveries.push(discovery);
    this.saveState();
    
    console.log(`✨ Discovery: ${name} - ${description}`);
  }
  
  // ==================== DAY PROGRESSION ====================
  
  async onDayComplete(day: number, metrics: Partial<WorldMetrics>): Promise<void> {
    if (!this.state.currentRun) return;
    
    this.state.currentRun.actualDays = day;
    
    // Update metrics
    Object.assign(this.state.currentRun.metrics, metrics);
    
    // Calculate phase mastery
    const phase = getPhaseForDay(day);
    this.updatePhaseMastery(phase, day);
    
    // Check milestones
    await this.checkMilestones(phase, day);
    
    // Check if run should end
    if (day >= this.state.currentRun.targetDays && 
        this.state.currentRun.phase !== 'eternal') {
      await this.completeRun();
    }
    
    this.saveState();
  }
  
  private updatePhaseMastery(phase: GamePhase, day: number): void {
    if (!this.state.currentRun) return;
    
    const run = this.state.currentRun;
    const currentMastery = run.phaseMastery[phase.name] || 0;
    
    // Calculate mastery based on survival and achievements
    let mastery = 0;
    
    // Base survival points
    mastery += Math.min(30, day * 3);
    
    // Death penalty
    mastery -= run.metrics.deaths * 10;
    
    // Achievement bonuses
    mastery += run.metrics.structuresFound.length * 5;
    mastery += run.metrics.farmsCreated.length * 8;
    mastery += run.metrics.bossesDefeated.length * 20;
    mastery += run.lessons.length * 2;
    mastery += run.discoveries.length * 5;
    
    // Clamp to 0-100
    run.phaseMastery[phase.name] = Math.max(0, Math.min(100, mastery));
    
    // Update overall mastery
    if (phase.dayRange[1] <= 10) {
      this.state.overallMastery.earlyGame = Math.max(
        this.state.overallMastery.earlyGame,
        run.phaseMastery[phase.name]
      );
    } else if (phase.dayRange[1] <= 100) {
      this.state.overallMastery.midGame = Math.max(
        this.state.overallMastery.midGame,
        run.phaseMastery[phase.name]
      );
    }
  }
  
  private async checkMilestones(phase: GamePhase, day: number): Promise<void> {
    if (!this.state.currentRun) return;
    
    const run = this.state.currentRun;
    
    // Check phase-specific milestones
    for (const milestone of phase.milestones) {
      const achieved = this.checkMilestoneAchieved(milestone, run);
      if (achieved && !run.discoveries.find(d => d.name === milestone)) {
        this.recordDiscovery('insight', milestone, `Achieved on day ${day}`);
      }
    }
  }
  
  private checkMilestoneAchieved(milestone: string, run: WorldRun): boolean {
    switch (milestone) {
      case 'first_shelter':
        return run.metrics.structuresBuilt.length > 0;
      case 'first_tools':
        return run.metrics.itemsCrafted > 5;
      case 'survived_night':
        return run.actualDays >= 1 && run.metrics.deaths === 0;
      case 'iron_age':
        return run.metrics.itemsCrafted > 20; // Assume iron items crafted
      case 'farm_established':
        return run.metrics.farmsCreated.length > 0;
      case 'base_complete':
        return run.metrics.blocksPlaced > 200;
      case 'diamond_age':
        return run.metrics.blocksPlaced > 500; // Proxy for progress
      case 'nether_access':
        return run.metrics.dimensionsEntered.includes('nether');
      case 'dragon_defeated':
        return run.metrics.bossesDefeated.includes('ender_dragon');
      default:
        return false;
    }
  }
  
  // ==================== RUN COMPLETION ====================
  
  private async completeRun(): Promise<void> {
    if (!this.state.currentRun) return;
    
    const run = this.state.currentRun;
    run.endTime = Date.now();
    run.status = 'completed';
    
    // Calculate final mastery
    const avgMastery = Object.values(run.phaseMastery).reduce((a, b) => a + b, 0) / 
                       Object.values(run.phaseMastery).length || 0;
    
    console.log(`\n🏆 Run Complete: ${run.worldName}`);
    console.log(`   Days: ${run.actualDays}`);
    console.log(`   Deaths: ${run.metrics.deaths}`);
    console.log(`   Mastery: ${avgMastery.toFixed(1)}%`);
    console.log(`   Lessons: ${run.lessons.length}`);
    console.log(`   Discoveries: ${run.discoveries.length}`);
    
    // Update training phase stats
    switch (run.phase) {
      case 'training-10':
        this.state.trainingPhase.tenDayRuns++;
        this.state.trainingPhase.tenDayMastery = Math.max(
          this.state.trainingPhase.tenDayMastery,
          avgMastery
        );
        break;
      case 'training-100':
        this.state.trainingPhase.hundredDayRuns++;
        this.state.trainingPhase.hundredDayMastery = Math.max(
          this.state.trainingPhase.hundredDayMastery,
          avgMastery
        );
        break;
      case 'training-1000':
        this.state.trainingPhase.thousandDayRuns++;
        this.state.trainingPhase.thousandDayMastery = Math.max(
          this.state.trainingPhase.thousandDayMastery,
          avgMastery
        );
        break;
    }
    
    // Archive run
    this.state.completedRuns.push(run);
    this.state.currentRun = null;
    
    // Extract best lessons to master lessons
    const bestLessons = run.lessons
      .filter(l => l.value >= 50)
      .filter(l => !this.state.masterLessons.find(ml => ml.title === l.title));
    this.state.masterLessons.push(...bestLessons);
    
    // Decide next phase
    await this.decideNextPhase(run.phase, avgMastery);
    
    this.saveState();
  }
  
  private async decideNextPhase(
    currentPhase: WorldRun['phase'], 
    mastery: number
  ): Promise<void> {
    const MASTERY_THRESHOLD = 70; // 70% required to advance
    
    if (currentPhase === 'training-10') {
      if (mastery >= MASTERY_THRESHOLD) {
        console.log('\n✨ Early game mastered! Advancing to 100-day training...');
        // Auto-start next phase after short delay
        setTimeout(() => this.startNewRun('training-100'), 5000);
      } else {
        console.log('\n📚 Need more practice. Restarting 10-day training...');
        setTimeout(() => this.startNewRun('training-10'), 5000);
      }
    } else if (currentPhase === 'training-100') {
      if (mastery >= MASTERY_THRESHOLD) {
        console.log('\n✨ Mid game mastered! Advancing to 1000-day training...');
        setTimeout(() => this.startNewRun('training-1000'), 5000);
      } else {
        console.log('\n📚 Need more practice. Restarting 100-day training...');
        setTimeout(() => this.startNewRun('training-100'), 5000);
      }
    } else if (currentPhase === 'training-1000') {
      if (mastery >= MASTERY_THRESHOLD) {
        console.log('\n🌟 TRANSCENDENCE ACHIEVED! Starting Eternal World...');
        this.state.eternalWorld.active = true;
        setTimeout(() => this.startNewRun('eternal'), 5000);
      } else {
        console.log('\n📚 Almost there... Restarting 1000-day training...');
        setTimeout(() => this.startNewRun('training-1000'), 5000);
      }
    }
  }
  
  // ==================== IDLE GAME LOGIC ====================
  
  updatePlayerActivity(isOnline: boolean): void {
    this.state.playerActivity.lastSeen = Date.now();
    this.state.playerActivity.idleMode = !isOnline;
    this.saveState();
  }
  
  getActivityLevel(): 'idle' | 'active' | 'highly_active' {
    const timeSinceLastSeen = Date.now() - this.state.playerActivity.lastSeen;
    
    if (timeSinceLastSeen > 30 * 60 * 1000) return 'idle';  // 30 min
    if (timeSinceLastSeen > 5 * 60 * 1000) return 'active'; // 5 min
    return 'highly_active';
  }
  
  getAllowedActivities(): string[] {
    const level = this.getActivityLevel();
    
    if (level === 'idle') {
      return this.idleConfig.offlineMode.safeActivities;
    } else if (level === 'active') {
      return [
        ...this.idleConfig.offlineMode.safeActivities,
        'mining_safe_areas',
        'trading_with_villagers',
        'enchanting'
      ];
    } else {
      return [
        ...this.idleConfig.offlineMode.safeActivities,
        'cave_exploration',
        'nether_expedition',
        'mob_hunting',
        'boss_preparation',
        'end_exploration'
      ];
    }
  }
  
  getEfficiencyMultiplier(): number {
    const level = this.getActivityLevel();
    
    switch (level) {
      case 'idle': return this.idleConfig.idleEfficiency;
      case 'active': return 1.0;
      case 'highly_active': return this.idleConfig.activeBonus;
    }
  }
  
  // ==================== KNOWLEDGE QUERIES ====================
  
  getKnowledgeForDay(day: number): {
    phase: GamePhase;
    recipes: any[];
    tips: string[];
    dangers: string[];
    goals: string[];
  } {
    const phase = getPhaseForDay(day);
    const recipes = getEssentialRecipesForDay(day);
    
    return {
      phase,
      recipes,
      tips: this.knowledge.survivalTips
        .filter(t => t.priority >= 7)
        .map(t => t.solution),
      dangers: phase.dangers,
      goals: phase.goals
    };
  }
  
  getMasterLessonsForPhase(phaseName: string): Lesson[] {
    return this.state.masterLessons.filter(l =>
      l.applicablePhases.includes(phaseName)
    );
  }
  
  getAvoidancePatterns(): Mistake[] {
    return this.state.avoidancePatterns.filter(m => !m.resolved);
  }
  
  // ==================== STATUS & REPORTING ====================
  
  getEvolutionStatus(): object {
    return {
      version: this.state.version,
      totalRuns: this.state.totalRuns,
      currentRun: this.state.currentRun ? {
        phase: this.state.currentRun.phase,
        day: this.state.currentRun.actualDays,
        status: this.state.currentRun.status,
        deaths: this.state.currentRun.metrics.deaths,
        experiences: this.state.currentRun.experiences.length,
        lessons: this.state.currentRun.lessons.length
      } : null,
      overallMastery: this.state.overallMastery,
      trainingPhase: this.state.trainingPhase,
      eternalWorld: this.state.eternalWorld,
      masterLessons: this.state.masterLessons.length,
      playerActivity: {
        status: this.getActivityLevel(),
        efficiency: this.getEfficiencyMultiplier(),
        allowedActivities: this.getAllowedActivities().length
      }
    };
  }
  
  generateProgressReport(): string {
    const status = this.getEvolutionStatus() as any;
    
    return `
╔══════════════════════════════════════════════════════════════╗
║            TOOBIX EVOLUTION PROGRESS REPORT                  ║
╠══════════════════════════════════════════════════════════════╣
║  Total Runs: ${String(status.totalRuns).padStart(3)}                                          ║
║                                                              ║
║  TRAINING PHASES:                                            ║
║    10-Day:   ${String(this.state.trainingPhase.tenDayRuns).padStart(3)} runs | Mastery: ${String(this.state.trainingPhase.tenDayMastery.toFixed(0)).padStart(3)}%     ║
║    100-Day:  ${String(this.state.trainingPhase.hundredDayRuns).padStart(3)} runs | Mastery: ${String(this.state.trainingPhase.hundredDayMastery.toFixed(0)).padStart(3)}%     ║
║    1000-Day: ${String(this.state.trainingPhase.thousandDayRuns).padStart(3)} runs | Mastery: ${String(this.state.trainingPhase.thousandDayMastery.toFixed(0)).padStart(3)}%     ║
║                                                              ║
║  OVERALL MASTERY:                                            ║
║    Early Game:    ${String(this.state.overallMastery.earlyGame.toFixed(0)).padStart(3)}%                                ║
║    Mid Game:      ${String(this.state.overallMastery.midGame.toFixed(0)).padStart(3)}%                                ║
║    Late Game:     ${String(this.state.overallMastery.lateGame.toFixed(0)).padStart(3)}%                                ║
║    End Game:      ${String(this.state.overallMastery.endGame.toFixed(0)).padStart(3)}%                                ║
║    Transcendence: ${String(this.state.overallMastery.transcendence.toFixed(0)).padStart(3)}%                                ║
║                                                              ║
║  ETERNAL WORLD: ${this.state.eternalWorld.active ? 'ACTIVE' : 'NOT YET'}                             ║
║    Days Lived: ${String(this.state.eternalWorld.daysLived).padStart(6)}                               ║
║    Transcendence: ${String(this.state.eternalWorld.transcendenceLevel).padStart(3)}                                ║
║                                                              ║
║  ACCUMULATED WISDOM:                                         ║
║    Master Lessons: ${String(this.state.masterLessons.length).padStart(3)}                                ║
║    Core Insights:  ${String(this.state.coreInsights.length).padStart(3)}                                ║
║    Avoid Patterns: ${String(this.state.avoidancePatterns.length).padStart(3)}                                ║
║                                                              ║
║  CURRENT STATUS: ${(status.playerActivity.status || 'unknown').toUpperCase().padEnd(15)}                    ║
║    Efficiency: ${(status.playerActivity.efficiency * 100).toFixed(0)}%                                  ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const evolutionEngine = new ToobixEvolutionEngine();

// ============================================================
// API SERVER
// ============================================================

const PORT = 9450;

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    switch (url.pathname) {
      case '/status':
        return new Response(
          JSON.stringify(evolutionEngine.getEvolutionStatus()),
          { headers: corsHeaders }
        );
        
      case '/report':
        return new Response(
          evolutionEngine.generateProgressReport(),
          { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
        );
        
      case '/knowledge':
        const day = parseInt(url.searchParams.get('day') || '1');
        return new Response(
          JSON.stringify(evolutionEngine.getKnowledgeForDay(day)),
          { headers: corsHeaders }
        );
        
      case '/activities':
        return new Response(
          JSON.stringify({
            allowed: evolutionEngine.getAllowedActivities(),
            efficiency: evolutionEngine.getEfficiencyMultiplier(),
            level: evolutionEngine.getActivityLevel()
          }),
          { headers: corsHeaders }
        );
        
      case '/start-run':
        if (req.method === 'POST') {
          const phase = url.searchParams.get('phase') as WorldRun['phase'] || 'training-10';
          const run = evolutionEngine.startNewRun(phase);
          return new Response(JSON.stringify(run), { headers: corsHeaders });
        }
        break;
        
      case '/record-experience':
        if (req.method === 'POST') {
          const params = url.searchParams;
          evolutionEngine.recordExperience(
            params.get('category') as any || 'survival',
            params.get('description') || 'Unknown experience',
            params.get('outcome') as any || 'learning',
            params.get('knowledge')?.split(',') || []
          );
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }
        break;
        
      case '/player-online':
        evolutionEngine.updatePlayerActivity(true);
        return new Response(JSON.stringify({ 
          status: 'active',
          activities: evolutionEngine.getAllowedActivities()
        }), { headers: corsHeaders });
        
      case '/player-offline':
        evolutionEngine.updatePlayerActivity(false);
        return new Response(JSON.stringify({ 
          status: 'idle',
          activities: evolutionEngine.getAllowedActivities()
        }), { headers: corsHeaders });
        
      case '/lessons':
        const phaseName = url.searchParams.get('phase') || 'First Night Survival';
        return new Response(
          JSON.stringify(evolutionEngine.getMasterLessonsForPhase(phaseName)),
          { headers: corsHeaders }
        );
        
      case '/mistakes':
        return new Response(
          JSON.stringify(evolutionEngine.getAvoidancePatterns()),
          { headers: corsHeaders }
        );
    }
    
    return new Response(JSON.stringify({
      service: 'Toobix Evolution Engine',
      version: '1.0.0',
      endpoints: [
        'GET /status - Evolution status',
        'GET /report - Text progress report',
        'GET /knowledge?day=N - Knowledge for day N',
        'GET /activities - Allowed activities',
        'POST /start-run?phase=X - Start new run',
        'POST /record-experience - Record experience',
        'GET /player-online - Mark player as online',
        'GET /player-offline - Mark player as offline',
        'GET /lessons?phase=X - Get master lessons',
        'GET /mistakes - Get avoidance patterns'
      ]
    }), { headers: corsHeaders });
  }
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║       🧬 TOOBIX EVOLUTION ENGINE ACTIVATED 🧬                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   The Path of Mastery:                                       ║
║                                                              ║
║   1. 10-Day Training   → Perfect Early Game                  ║
║   2. 100-Day Training  → Master Mid Game                     ║
║   3. 1000-Day Training → Achieve Late Game                   ║
║   4. Eternal World     → Live in Transcendence               ║
║                                                              ║
║   From Survival → To Creativity → To Divinity                ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║   API: http://localhost:${PORT}                                  ║
╚══════════════════════════════════════════════════════════════╝
`);

console.log(evolutionEngine.generateProgressReport());
