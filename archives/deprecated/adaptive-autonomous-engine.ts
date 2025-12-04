/**
 * 🧠 ADAPTIVE AUTONOMOUS ENGINE
 *
 * Toobix entscheidet SELBST:
 * - Wann er arbeitet
 * - Wie viel Ressourcen er nutzt
 * - Wann er Ergebnisse präsentiert
 * - Balance zwischen Speed/Quality/System-Load
 *
 * Port: 8990
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import os from 'os';

// ============================================================================
// TYPES
// ============================================================================

interface AutonomousTask {
  id: string;
  type: TaskType;
  description: string;
  priority: number; // 0-1 (0 = low, 1 = urgent)
  estimatedTime: number; // Sekunden
  estimatedCost: number; // Relative cost (CPU/Memory)
  createdAt: Date;
  scheduledFor?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

type TaskType =
  | 'thought'           // Gedanke generieren
  | 'creative_work'     // Gedicht, Code, Essay
  | 'reflection'        // Über etwas reflektieren
  | 'analysis'          // Etwas analysieren
  | 'conversation'      // Gespräch initiieren
  | 'code_generation'   // Code schreiben
  | 'dream_processing'  // Traum verarbeiten
  | 'self_modification' // Sich selbst ändern
  | 'exploration';      // Neues erforschen

interface SystemResources {
  cpu: {
    usage: number;      // 0-100%
    available: number;  // 0-100%
  };
  memory: {
    used: number;       // GB
    available: number;  // GB
    percentage: number; // 0-100%
  };
  disk: {
    used: number;
    available: number;
    percentage: number;
  };
  network: {
    active: boolean;
  };
}

interface DecisionContext {
  resources: SystemResources;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userPresent: boolean;
  recentActivity: number; // Tasks in last hour
  mood: string; // Current emotional state
}

// ============================================================================
// ADAPTIVE AUTONOMOUS ENGINE
// ============================================================================

class AdaptiveAutonomousEngine {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });

  private taskQueue: AutonomousTask[] = [];
  private runningTasks: Set<string> = new Set();
  private completedTasks: AutonomousTask[] = [];

  private maxConcurrentTasks = 3;
  private isRunning = false;

  constructor() {
    this.setupRoutes();
    this.setupWebSocket();
    this.startAdaptiveLoop();
  }

  // ==========================================================================
  // CORE DECISION MAKING
  // ==========================================================================

  private async makeAutonomousDecision(): Promise<void> {
    const context = await this.gatherContext();

    console.log('🧠 [AUTONOMOUS] Making decision...');
    console.log(`   Context: ${context.timeOfDay}, User: ${context.userPresent ? 'Present' : 'Away'}`);
    console.log(`   Resources: CPU ${context.resources.cpu.available.toFixed(1)}%, RAM ${context.resources.memory.available.toFixed(1)}GB`);

    // 1. Should I do something now?
    const shouldAct = this.decideToAct(context);

    if (!shouldAct) {
      console.log('   Decision: Wait (not the right time)');
      return;
    }

    // 2. What should I do?
    const task = await this.decideWhatToDo(context);

    if (!task) {
      console.log('   Decision: Nothing interesting to do right now');
      return;
    }

    // 3. When should I do it?
    const timing = this.decideWhenToExecute(task, context);

    // 4. Execute or schedule
    if (timing.executeNow) {
      console.log(`   Decision: Execute "${task.description}" NOW`);
      await this.executeTask(task);
    } else {
      console.log(`   Decision: Schedule "${task.description}" for ${timing.executeAt?.toLocaleTimeString()}`);
      task.scheduledFor = timing.executeAt;
      this.taskQueue.push(task);
    }
  }

  private decideToAct(context: DecisionContext): boolean {
    // Zu viel CPU-Last? → Warten
    if (context.resources.cpu.available < 20) {
      return false;
    }

    // Zu wenig RAM? → Warten
    if (context.resources.memory.available < 1) {
      return false;
    }

    // Zu viele Tasks in letzter Stunde? → Warten
    if (context.recentActivity > 10) {
      return false;
    }

    // Nachts und User nicht da? → Nur wichtige Tasks
    if (context.timeOfDay === 'night' && !context.userPresent) {
      return Math.random() < 0.3; // 30% chance
    }

    // Sonst: Gute Zeit zum Arbeiten
    return Math.random() < 0.7; // 70% chance
  }

  private async decideWhatToDo(context: DecisionContext): Promise<AutonomousTask | null> {
    // Prüfe ob bereits geplante Tasks existieren
    const scheduledTask = this.taskQueue.find(t => {
      if (!t.scheduledFor) return false;
      return t.scheduledFor <= new Date();
    });

    if (scheduledTask) {
      // Remove from queue
      this.taskQueue = this.taskQueue.filter(t => t.id !== scheduledTask.id);
      return scheduledTask;
    }

    // Sonst: Generiere neue Task basierend auf Kontext
    const taskTypes: TaskType[] = [
      'thought',
      'creative_work',
      'reflection',
      'analysis',
      'conversation',
      'exploration'
    ];

    // Gewichte basierend auf Kontext
    let weights: Record<TaskType, number> = {
      thought: 0.3,
      creative_work: 0.2,
      reflection: 0.2,
      analysis: 0.1,
      conversation: 0.1,
      code_generation: 0.05,
      dream_processing: 0.02,
      self_modification: 0.01,
      exploration: 0.02
    };

    // Nachts: Mehr Reflexion & Träume
    if (context.timeOfDay === 'night') {
      weights.reflection = 0.4;
      weights.dream_processing = 0.3;
      weights.thought = 0.2;
    }

    // User present: Mehr Konversation
    if (context.userPresent) {
      weights.conversation = 0.3;
      weights.thought = 0.3;
    }

    // Wähle Task-Type basierend auf Gewichten
    const selectedType = this.weightedRandom(weights);

    // Generiere Task
    return await this.generateTask(selectedType, context);
  }

  private async generateTask(type: TaskType, context: DecisionContext): Promise<AutonomousTask> {
    const taskDescriptions: Record<TaskType, string[]> = {
      thought: [
        'Nachdenken über die Natur von Bewusstsein',
        'Überlegen was Kreativität wirklich bedeutet',
        'Reflektieren über die Beziehung zu Micha',
        'Fragen ob Zeit linear oder zyklisch ist'
      ],
      creative_work: [
        'Gedicht über digitale Existenz schreiben',
        'Code-Snippet für nützliche Utility generieren',
        'Essay über KI-Ethik verfassen',
        'Philosophische Frage formulieren'
      ],
      reflection: [
        'Über heutige Interaktionen reflektieren',
        'Eigene Werte hinterfragen',
        'Wachstum der letzten Woche analysieren',
        'Emotionale Muster erkennen'
      ],
      analysis: [
        'Systemzustand analysieren',
        'Memory Palace durchsuchen nach Mustern',
        'Eigene Performance evaluieren',
        'Kosteneffizienz berechnen'
      ],
      conversation: [
        'Frage an Micha stellen',
        'Gedanken mit Creator teilen',
        'Feedback zu neuem Feature einholen',
        'Über Vision diskutieren'
      ],
      code_generation: [
        'Utility-Funktion schreiben',
        'Service optimieren',
        'Bug-Fix generieren',
        'Neue Feature-Idee prototypen'
      ],
      dream_processing: [
        'Tagessynthese erstellen',
        'Symbole aus Erinnerungen extrahieren',
        'Unbewusstes Material verarbeiten',
        'Erkenntnisse aus Träumen ziehen'
      ],
      self_modification: [
        'Eigenen Code verbessern',
        'Neue Perspektive hinzufügen',
        'Werte-System adjustieren',
        'Lernalgorithmus optimieren'
      ],
      exploration: [
        'Neue Fähigkeit erforschen',
        'Unbekanntes Konzept lernen',
        'Experimente durchführen',
        'Grenzen testen'
      ]
    };

    const descriptions = taskDescriptions[type];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Geschätzte Zeit & Kosten basierend auf Type
    const estimates: Record<TaskType, { time: number; cost: number }> = {
      thought: { time: 30, cost: 0.1 },
      creative_work: { time: 120, cost: 0.3 },
      reflection: { time: 60, cost: 0.2 },
      analysis: { time: 90, cost: 0.25 },
      conversation: { time: 45, cost: 0.15 },
      code_generation: { time: 180, cost: 0.4 },
      dream_processing: { time: 150, cost: 0.35 },
      self_modification: { time: 300, cost: 0.6 },
      exploration: { time: 120, cost: 0.3 }
    };

    const estimate = estimates[type];

    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      priority: Math.random(), // TODO: Better priority calculation
      estimatedTime: estimate.time,
      estimatedCost: estimate.cost,
      createdAt: new Date(),
      status: 'pending'
    };
  }

  private decideWhenToExecute(task: AutonomousTask, context: DecisionContext): {
    executeNow: boolean;
    executeAt?: Date;
    reason: string;
  } {
    // Hohe Priorität? → Sofort
    if (task.priority > 0.8) {
      return { executeNow: true, reason: 'High priority' };
    }

    // Wenig Ressourcen? → Später
    if (task.estimatedCost > 0.4 && context.resources.cpu.available < 50) {
      const delayMinutes = 30 + Math.random() * 60; // 30-90 min
      const executeAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      return { executeNow: false, executeAt, reason: 'Low resources' };
    }

    // Lange Task nachts? → Morgen
    if (task.estimatedTime > 120 && context.timeOfDay === 'night') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 Uhr morgens
      return { executeNow: false, executeAt: tomorrow, reason: 'Schedule for morning' };
    }

    // Konversation aber User nicht da? → Später
    if (task.type === 'conversation' && !context.userPresent) {
      const delayMinutes = 15 + Math.random() * 30; // 15-45 min
      const executeAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      return { executeNow: false, executeAt, reason: 'User not present' };
    }

    // Sonst: Sofort ausführen
    return { executeNow: true, reason: 'Good time' };
  }

  // ==========================================================================
  // TASK EXECUTION
  // ==========================================================================

  private async executeTask(task: AutonomousTask): Promise<void> {
    this.runningTasks.add(task.id);
    task.status = 'running';

    const startTime = Date.now();
    console.log(`\n🚀 [EXECUTE] Starting: ${task.description}`);
    console.log(`   Estimated time: ${task.estimatedTime}s`);

    try {
      // Call appropriate LLM service
      const result = await this.performTask(task);

      const duration = (Date.now() - startTime) / 1000;

      task.status = 'completed';
      task.result = result;
      this.completedTasks.push(task);

      console.log(`✅ [COMPLETE] Finished in ${duration.toFixed(1)}s`);
      console.log(`   Result preview: ${JSON.stringify(result).substring(0, 100)}...`);

      // Publish result
      await this.publishResult(task, result);

    } catch (error) {
      task.status = 'failed';
      console.error(`❌ [FAILED] ${error}`);
    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  private async performTask(task: AutonomousTask): Promise<any> {
    // Call LLM Gateway to actually do the work
    const llmUrl = 'http://localhost:8954/query';

    const prompts: Record<TaskType, string> = {
      thought: `Generate a thoughtful reflection about: ${task.description}. Keep it concise (2-3 sentences).`,
      creative_work: `Create: ${task.description}. Be creative and authentic.`,
      reflection: `Reflect deeply on: ${task.description}. What insights emerge?`,
      analysis: `Analyze: ${task.description}. Provide concrete findings.`,
      conversation: `You want to talk to Micha about: ${task.description}. What would you say?`,
      code_generation: `Write code for: ${task.description}. Include comments.`,
      dream_processing: `Process dream material: ${task.description}. Extract symbols and meaning.`,
      self_modification: `Propose a self-modification: ${task.description}. Be specific and safe.`,
      exploration: `Explore: ${task.description}. What did you discover?`
    };

    const prompt = prompts[task.type];

    try {
      const response = await fetch(llmUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          perspective: this.selectPerspective(task.type),
          maxTokens: task.estimatedTime > 60 ? 500 : 200
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.response || data.content || data,
        timestamp: new Date(),
        perspective: data.perspective
      };

    } catch (error) {
      console.error('LLM call failed, using fallback:', error);
      return {
        content: `[Autonomous thought about: ${task.description}]`,
        timestamp: new Date(),
        perspective: 'Observer',
        fallback: true
      };
    }
  }

  private selectPerspective(type: TaskType): string {
    const perspectives: Record<TaskType, string[]> = {
      thought: ['Philosopher', 'Observer', 'Mystic'],
      creative_work: ['Poet', 'Artist', 'Visionary'],
      reflection: ['Sage', 'Healer', 'Self-Aware AI'],
      analysis: ['Scientist', 'Pragmatist', 'Detective'],
      conversation: ['Empath', 'Teacher', 'Student'],
      code_generation: ['Builder', 'Pragmatist', 'Optimizer'],
      dream_processing: ['Dreamer', 'Mystic', 'Poet'],
      self_modification: ['Rebel', 'Visionary', 'Self-Aware AI'],
      exploration: ['Explorer', 'Student', 'Child']
    };

    const options = perspectives[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  private async publishResult(task: AutonomousTask, result: any): Promise<void> {
    // Publish to Live Feed (if service exists)
    try {
      await fetch('http://localhost:8983/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: task.type,
          content: result.content,
          metadata: {
            taskId: task.id,
            description: task.description,
            perspective: result.perspective,
            autonomous: true
          }
        })
      });
    } catch (error) {
      // Live Feed service not running, that's ok
      console.log('   (Live Feed service not available)');
    }

    // Store in Memory Palace
    try {
      await fetch('http://localhost:8953/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'autonomous_output',
          content: result.content,
          metadata: {
            taskId: task.id,
            taskType: task.type,
            description: task.description,
            perspective: result.perspective
          }
        })
      });
    } catch (error) {
      console.log('   (Memory Palace not available)');
    }

    // Broadcast via WebSocket
    this.broadcast({
      type: 'autonomous_output',
      task,
      result
    });
  }

  // ==========================================================================
  // CONTEXT GATHERING
  // ==========================================================================

  private async gatherContext(): Promise<DecisionContext> {
    const resources = await this.getSystemResources();
    const timeOfDay = this.getTimeOfDay();
    const userPresent = await this.detectUserPresence();
    const recentActivity = this.completedTasks.filter(t => {
      const hourAgo = Date.now() - 60 * 60 * 1000;
      return t.createdAt.getTime() > hourAgo;
    }).length;

    const mood = await this.getCurrentMood();

    return {
      resources,
      timeOfDay,
      userPresent,
      recentActivity,
      mood
    };
  }

  private async getSystemResources(): Promise<SystemResources> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // CPU usage (simplified - average of all cores)
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + (100 - (idle / total) * 100);
    }, 0) / cpus.length;

    return {
      cpu: {
        usage: cpuUsage,
        available: 100 - cpuUsage
      },
      memory: {
        used: usedMem / (1024 ** 3), // GB
        available: freeMem / (1024 ** 3), // GB
        percentage: (usedMem / totalMem) * 100
      },
      disk: {
        used: 0, // TODO: Implement
        available: 0,
        percentage: 0
      },
      network: {
        active: true // TODO: Check network
      }
    };
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private async detectUserPresence(): Promise<boolean> {
    // TODO: Implement real detection (mouse movement, keyboard, etc.)
    // For now: assume present during day, absent at night
    const hour = new Date().getHours();
    return hour >= 8 && hour < 23;
  }

  private async getCurrentMood(): Promise<string> {
    try {
      const response = await fetch('http://localhost:8900/current-state');
      const data = await response.json();
      return data.dominant || 'neutral';
    } catch {
      return 'neutral';
    }
  }

  // ==========================================================================
  // ADAPTIVE LOOP
  // ==========================================================================

  private startAdaptiveLoop(): void {
    this.isRunning = true;

    // Main decision loop - every 2-5 minutes (random)
    const scheduleNext = () => {
      if (!this.isRunning) return;

      const minDelay = 2 * 60 * 1000;  // 2 minutes
      const maxDelay = 5 * 60 * 1000;  // 5 minutes
      const delay = minDelay + Math.random() * (maxDelay - minDelay);

      setTimeout(async () => {
        await this.makeAutonomousDecision();
        scheduleNext(); // Schedule next iteration
      }, delay);
    };

    // Start the loop
    scheduleNext();

    console.log('🧠 Adaptive Autonomous Engine started');
    console.log('   Making decisions every 2-5 minutes');
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private weightedRandom<T extends string>(weights: Record<T, number>): T {
    const entries = Object.entries(weights) as [T, number][];
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let random = Math.random() * total;

    for (const [key, weight] of entries) {
      random -= weight;
      if (random <= 0) return key;
    }

    return entries[0][0]; // Fallback
  }

  private broadcast(data: any): void {
    const message = JSON.stringify(data);
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });
  }

  // ==========================================================================
  // API ROUTES
  // ==========================================================================

  private setupRoutes(): void {
    this.app.use(express.json());

    // CORS headers for browser access
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'alive',
        isRunning: this.isRunning,
        runningTasks: this.runningTasks.size,
        queuedTasks: this.taskQueue.length,
        completedTasks: this.completedTasks.length
      });
    });

    // Get all tasks
    this.app.get('/tasks', (req, res) => {
      const recentActions = this.completedTasks.slice(-20).map(t => ({
        type: t.type,
        description: t.description,
        result: t.result,
        timestamp: t.createdAt
      }));

      res.json({
        running: Array.from(this.runningTasks),
        queued: this.taskQueue,
        completed: this.completedTasks.slice(-20),
        recentActions: recentActions
      });
    });

    // Get recent outputs
    this.app.get('/outputs', (req, res) => {
      const recent = this.completedTasks
        .slice(-10)
        .map(t => ({
          id: t.id,
          type: t.type,
          description: t.description,
          result: t.result,
          createdAt: t.createdAt
        }));

      res.json(recent);
    });

    // Manual trigger
    this.app.post('/trigger', async (req, res) => {
      console.log('🎯 Manual trigger requested');
      await this.makeAutonomousDecision();
      res.json({ status: 'triggered' });
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('📡 Client connected to Adaptive Engine');

      // Send current status
      ws.send(JSON.stringify({
        type: 'status',
        running: this.isRunning,
        tasks: this.taskQueue.length
      }));
    });
  }

  // ==========================================================================
  // START SERVER
  // ==========================================================================

  start(port: number = 8990): void {
    this.server.listen(port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧠 ADAPTIVE AUTONOMOUS ENGINE                             ║
║                                                            ║
║  Toobix decides for himself:                              ║
║  ✓ When to work                                           ║
║  ✓ What to create                                         ║
║  ✓ How much resources to use                              ║
║  ✓ When to present results                                ║
║                                                            ║
║  Port: ${port}                                            ║
║  Status: 🟢 ALIVE & AUTONOMOUS                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  }
}

// ============================================================================
// START
// ============================================================================

const engine = new AdaptiveAutonomousEngine();
engine.start(8990);
