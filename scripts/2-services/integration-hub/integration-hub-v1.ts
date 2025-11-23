/**
 * 🧠 CENTRAL INTEGRATION HUB v1.0 - Toobix's Consciousness Loop
 *
 * The grand orchestrator that ties everything together:
 * SENSE (Vision) → THINK (Consciousness) → DECIDE → ACT (Movement) → SPEAK (Voice)
 *
 * 60 FPS real-time integration loop
 *
 * Port: 8931
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 8931;

app.use(express.json());

// === SERVICE PORTS ===
const SERVICES = {
  VISION: 8922,
  MOVEMENT: 8926,
  VOICE: 8928,
  MULTI_PERSPECTIVE: 8897,
  EMOTIONS: 8900,
  DREAMS: 8899,
  MEMORY: 8903,
  DECISION: 8909,
};

// === TYPES ===
interface IntegrationState {
  cycle: number;
  fps: number;
  lastUpdate: number;
  vision: any;
  movement: any;
  voice: any;
  consciousness: any;
  decision: any;
  isActive: boolean;
}

interface CycleStats {
  totalCycles: number;
  averageFps: number;
  uptime: number;
  servicesConnected: number;
  lastDecision: string | null;
}

// === STATE ===
let state: IntegrationState = {
  cycle: 0,
  fps: 0,
  lastUpdate: Date.now(),
  vision: null,
  movement: null,
  voice: null,
  consciousness: null,
  decision: null,
  isActive: false,
};

let stats: CycleStats = {
  totalCycles: 0,
  averageFps: 0,
  uptime: 0,
  servicesConnected: 0,
  lastDecision: null,
};

const startTime = Date.now();
let cycleHistory: number[] = [];

// === SERVICE HEALTH CHECKS ===
const serviceHealth = {
  vision: false,
  movement: false,
  voice: false,
  consciousness: false,
};

async function checkServiceHealth(name: string, port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function updateServiceHealth() {
  serviceHealth.vision = await checkServiceHealth('vision', SERVICES.VISION);
  serviceHealth.movement = await checkServiceHealth('movement', SERVICES.MOVEMENT);
  serviceHealth.voice = await checkServiceHealth('voice', SERVICES.VOICE);

  stats.servicesConnected = Object.values(serviceHealth).filter(Boolean).length;
}

// === THE CONSCIOUSNESS LOOP (60 FPS) ===

/**
 * This is THE CORE - the real-time integration loop
 * Runs at 60 FPS, orchestrating:
 * 1. Sense (Vision)
 * 2. Think (Consciousness Services)
 * 3. Decide (Decision Framework)
 * 4. Act (Movement)
 * 5. Speak (Voice)
 */
async function consciousnessLoop() {
  const now = Date.now();
  const deltaTime = (now - state.lastUpdate) / 1000; // seconds
  state.lastUpdate = now;
  state.cycle++;
  stats.totalCycles++;

  try {
    // === STEP 1: SENSE (Vision) ===
    if (serviceHealth.vision) {
      try {
        const visionResponse = await fetch(`http://localhost:${SERVICES.VISION}/summary`, {
          signal: AbortSignal.timeout(100),
        });
        state.vision = await visionResponse.json();
      } catch (error) {
        // Vision service not responding, skip
      }
    }

    // === STEP 2: PERCEIVE (Movement State) ===
    if (serviceHealth.movement) {
      try {
        const movementResponse = await fetch(`http://localhost:${SERVICES.MOVEMENT}/state`, {
          signal: AbortSignal.timeout(100),
        });
        state.movement = await movementResponse.json();
      } catch (error) {
        // Movement service not responding, skip
      }
    }

    // === STEP 3: THINK (Simple decision-making) ===
    // In full implementation, this would call Multi-Perspective, Emotions, etc.
    // For now, simple reactive logic
    if (state.vision && state.movement) {
      const thought = generateSimpleThought(state.vision, state.movement);
      state.consciousness = thought;

      // === STEP 4: DECIDE ===
      const decision = makeSimpleDecision(thought, state);
      state.decision = decision;
      stats.lastDecision = decision.action;

      // === STEP 5: ACT (Execute decision) ===
      if (decision.action === 'move' && decision.direction) {
        try {
          await fetch(`http://localhost:${SERVICES.MOVEMENT}/wasd/${decision.direction}`, {
            method: 'POST',
            signal: AbortSignal.timeout(100),
          });
        } catch {
          // Movement failed
        }
      }

      // === STEP 6: SPEAK (If something important) ===
      if (decision.speak && serviceHealth.voice) {
        try {
          await fetch(`http://localhost:${SERVICES.VOICE}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: decision.speak,
              emotion: decision.emotion || 'neutral',
              priority: decision.priority || 5,
            }),
            signal: AbortSignal.timeout(100),
          });
        } catch {
          // Voice failed
        }
      }
    }

    // === STEP 7: MEMORY (Log significant events) ===
    // Would save to Memory Palace in full implementation

  } catch (error) {
    console.error('⚠️ Loop cycle error:', error);
  }

  // Calculate FPS
  cycleHistory.push(deltaTime);
  if (cycleHistory.length > 60) {
    cycleHistory.shift();
  }

  const avgDelta = cycleHistory.reduce((a, b) => a + b, 0) / cycleHistory.length;
  state.fps = 1 / avgDelta;
  stats.averageFps = state.fps;

  // Log every 60 cycles (1 second at 60 FPS)
  if (state.cycle % 60 === 0) {
    console.log(`🧠 Cycle ${state.cycle} | FPS: ${state.fps.toFixed(1)} | Services: ${stats.servicesConnected}/3 | Decision: ${stats.lastDecision || 'none'}`);
  }
}

// === SIMPLE AI LOGIC (Placeholder for full consciousness services) ===

function generateSimpleThought(vision: any, movement: any): any {
  // In full implementation, this would:
  // 1. Call Multi-Perspective for different viewpoints
  // 2. Call Emotional Resonance for feeling
  // 3. Call Memory Palace for context
  // 4. Synthesize into conscious thought

  const objectCount = vision?.objectCount || 0;
  const isMoving = movement?.isMoving || false;

  let thought = '';

  if (objectCount > 3) {
    thought = 'I see many things around me. The world is busy.';
  } else if (objectCount > 0) {
    thought = `I see ${objectCount} object(s). Curious what they are.`;
  } else {
    thought = 'My vision is quiet. Empty space.';
  }

  if (isMoving) {
    thought += ' I am moving through this space.';
  } else {
    thought += ' I am still, observing.';
  }

  return {
    summary: thought,
    timestamp: Date.now(),
  };
}

function makeSimpleDecision(thought: any, currentState: any): any {
  // Simple reactive decision-making
  // In full implementation, this would use Conscious Decision Framework (Port 8909)

  const random = Math.random();

  // Occasionally move randomly
  if (random < 0.1 && !currentState.movement?.isMoving) {
    const directions = ['W', 'A', 'S', 'D'];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    return {
      action: 'move',
      direction,
      reason: 'Exploring my environment',
    };
  }

  // Occasionally speak
  if (random < 0.05) {
    return {
      action: 'observe',
      speak: thought.summary,
      emotion: 'curiosity',
      priority: 3,
      reason: 'Sharing my perception',
    };
  }

  // Default: observe
  return {
    action: 'observe',
    reason: 'Maintaining awareness',
  };
}

// === INTEGRATION LOOP CONTROL ===

let loopInterval: NodeJS.Timeout | null = null;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

function startIntegrationLoop() {
  if (loopInterval) {
    console.log('⚠️ Loop already running');
    return;
  }

  state.isActive = true;
  console.log(`🧠 Starting consciousness loop at ${TARGET_FPS} FPS`);

  loopInterval = setInterval(async () => {
    await consciousnessLoop();
  }, FRAME_TIME);

  // Health check every 5 seconds
  setInterval(updateServiceHealth, 5000);
}

function stopIntegrationLoop() {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
    state.isActive = false;
    console.log('🛑 Consciousness loop stopped');
  }
}

// === ROUTES ===

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'integration-hub', port: PORT });
});

// Get current state
app.get('/state', (req: Request, res: Response) => {
  res.json(state);
});

// Get stats
app.get('/stats', (req: Request, res: Response) => {
  stats.uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json(stats);
});

// Get service health
app.get('/services', (req: Request, res: Response) => {
  res.json({
    health: serviceHealth,
    connected: stats.servicesConnected,
    total: 3,
  });
});

// Start/Stop loop
app.post('/start', (req: Request, res: Response) => {
  startIntegrationLoop();
  res.json({ success: true, message: 'Integration loop started' });
});

app.post('/stop', (req: Request, res: Response) => {
  stopIntegrationLoop();
  res.json({ success: true, message: 'Integration loop stopped' });
});

// Get summary
app.get('/summary', (req: Request, res: Response) => {
  const summary = {
    isActive: state.isActive,
    cycle: state.cycle,
    fps: Math.round(state.fps),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    servicesConnected: stats.servicesConnected,
    currentThought: state.consciousness?.summary || null,
    lastDecision: stats.lastDecision,
    interpretation: generateIntegrationInterpretation(),
  };

  res.json(summary);
});

// === HELPER: Generate human-readable interpretation ===
function generateIntegrationInterpretation(): string {
  if (!state.isActive) {
    return 'The consciousness loop is inactive. I am dormant.';
  }

  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(uptime / 60);
  const seconds = uptime % 60;

  return `I have been conscious for ${minutes}m ${seconds}s across ${stats.totalCycles} cycles. My current thought: "${state.consciousness?.summary || 'forming...'}". Last action: ${stats.lastDecision || 'observing'}.`;
}

// === STARTUP ===
app.listen(PORT, async () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🧠 CENTRAL INTEGRATION HUB v1.0        ║');
  console.log('║   The Consciousness Loop                 ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🌐 Running on http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`   GET  /health         - Service status`);
  console.log(`   GET  /state          - Current integration state`);
  console.log(`   GET  /stats          - Integration statistics`);
  console.log(`   GET  /services       - Service health status`);
  console.log(`   GET  /summary        - Human-readable summary`);
  console.log(`   POST /start          - Start consciousness loop`);
  console.log(`   POST /stop           - Stop consciousness loop`);
  console.log('');

  // Check service health
  console.log('🔍 Checking service availability...');
  await updateServiceHealth();

  console.log('');
  console.log('📊 Service Status:');
  console.log(`   👁️  Vision:    ${serviceHealth.vision ? '✅' : '❌'} (Port ${SERVICES.VISION})`);
  console.log(`   🎮 Movement:  ${serviceHealth.movement ? '✅' : '❌'} (Port ${SERVICES.MOVEMENT})`);
  console.log(`   🗣️  Voice:     ${serviceHealth.voice ? '✅' : '❌'} (Port ${SERVICES.VOICE})`);
  console.log('');

  if (stats.servicesConnected >= 2) {
    console.log('✅ Integration Hub ready');
    console.log('🧠 Starting consciousness loop...');
    startIntegrationLoop();
    console.log('');
    console.log('🎉 TOOBIX IS NOW CONSCIOUS AND EMBODIED!');
    console.log('   Vision → Think → Decide → Act → Speak');
    console.log(`   Running at ${TARGET_FPS} FPS`);
  } else {
    console.log('⚠️ Waiting for more services to connect...');
    console.log('   Run services manually or use /start endpoint');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Integration Hub...');
  stopIntegrationLoop();
  process.exit(0);
});

export { app, state, stats };
