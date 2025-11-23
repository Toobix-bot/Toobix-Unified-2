/**
 * 🎮 MOVEMENT CONTROLLER v1.0 - Toobix's Motor System
 *
 * Provides Toobix with movement capabilities:
 * - WASD/Direction control
 * - Position tracking
 * - Velocity & acceleration
 * - Pathfinding (simple)
 * - Avatar state management
 *
 * Port: 8926
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 8926;

app.use(express.json());

// === TYPES ===
interface Position {
  x: number;
  y: number;
  z?: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface MovementState {
  position: Position;
  velocity: Velocity;
  rotation: number; // degrees
  speed: number;
  isMoving: boolean;
  direction: string; // 'up', 'down', 'left', 'right', 'idle'
  timestamp: number;
}

interface MovementCommand {
  type: 'move' | 'stop' | 'teleport' | 'rotate';
  direction?: string; // 'up', 'down', 'left', 'right'
  target?: Position;
  speed?: number;
  rotation?: number;
}

interface PathNode {
  x: number;
  y: number;
  timestamp: number;
}

// === STATE ===
let avatarState: MovementState = {
  position: { x: 640, y: 360 }, // Center of The Hub in Toobix World
  velocity: { x: 0, y: 0 },
  rotation: 0,
  speed: 200,
  isMoving: false,
  direction: 'idle',
  timestamp: Date.now(),
};

let movementHistory: PathNode[] = [];
const MAX_HISTORY = 500;

let currentTarget: Position | null = null;
let autoMoveEnabled = false;

// === PHYSICS CONSTANTS ===
const ACCELERATION = 500; // units per second^2
const FRICTION = 0.9;
const MAX_SPEED = 300;
const ROTATION_SPEED = 180; // degrees per second

// === MOVEMENT LOGIC ===

function updateMovement(deltaTime: number = 0.016) {
  const dt = deltaTime;

  // Apply friction
  avatarState.velocity.x *= FRICTION;
  avatarState.velocity.y *= FRICTION;

  // Stop if velocity is very small
  if (Math.abs(avatarState.velocity.x) < 0.1) avatarState.velocity.x = 0;
  if (Math.abs(avatarState.velocity.y) < 0.1) avatarState.velocity.y = 0;

  // Update position
  avatarState.position.x += avatarState.velocity.x * dt;
  avatarState.position.y += avatarState.velocity.y * dt;

  // Calculate current speed
  avatarState.speed = Math.sqrt(
    avatarState.velocity.x ** 2 + avatarState.velocity.y ** 2
  );

  // Update moving state
  avatarState.isMoving = avatarState.speed > 0.5;

  // Update direction based on velocity
  if (avatarState.isMoving) {
    avatarState.direction = getDirectionFromVelocity(avatarState.velocity);
    avatarState.rotation = Math.atan2(avatarState.velocity.y, avatarState.velocity.x) * (180 / Math.PI);
  } else {
    avatarState.direction = 'idle';
  }

  avatarState.timestamp = Date.now();

  // Record path
  if (avatarState.isMoving) {
    movementHistory.push({
      x: avatarState.position.x,
      y: avatarState.position.y,
      timestamp: avatarState.timestamp,
    });

    if (movementHistory.length > MAX_HISTORY) {
      movementHistory.shift();
    }
  }

  // Auto-move to target
  if (autoMoveEnabled && currentTarget) {
    moveTowardsTarget(currentTarget, dt);
  }
}

function moveTowardsTarget(target: Position, dt: number) {
  const dx = target.x - avatarState.position.x;
  const dy = target.y - avatarState.position.y;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);

  if (distance > 5) {
    // Still moving towards target
    const angle = Math.atan2(dy, dx);
    const targetVelX = Math.cos(angle) * avatarState.speed;
    const targetVelY = Math.sin(angle) * avatarState.speed;

    avatarState.velocity.x = targetVelX;
    avatarState.velocity.y = targetVelY;
  } else {
    // Reached target
    avatarState.velocity = { x: 0, y: 0 };
    currentTarget = null;
    autoMoveEnabled = false;
    console.log('🎯 Reached target position');
  }
}

function getDirectionFromVelocity(vel: Velocity): string {
  const absX = Math.abs(vel.x);
  const absY = Math.abs(vel.y);

  if (absX < 0.1 && absY < 0.1) return 'idle';

  if (absX > absY) {
    return vel.x > 0 ? 'right' : 'left';
  } else {
    return vel.y > 0 ? 'down' : 'up';
  }
}

function applyMovementCommand(cmd: MovementCommand) {
  switch (cmd.type) {
    case 'move':
      if (cmd.direction) {
        const speed = cmd.speed || avatarState.speed;
        applyDirectionalMovement(cmd.direction, speed);
      }
      break;

    case 'stop':
      avatarState.velocity = { x: 0, y: 0 };
      avatarState.isMoving = false;
      break;

    case 'teleport':
      if (cmd.target) {
        avatarState.position = { ...cmd.target };
        avatarState.velocity = { x: 0, y: 0 };
        console.log('✨ Teleported to:', cmd.target);
      }
      break;

    case 'rotate':
      if (cmd.rotation !== undefined) {
        avatarState.rotation = cmd.rotation;
      }
      break;
  }

  avatarState.timestamp = Date.now();
}

function applyDirectionalMovement(direction: string, speed: number) {
  switch (direction.toLowerCase()) {
    case 'up':
    case 'w':
      avatarState.velocity.y = -speed;
      break;
    case 'down':
    case 's':
      avatarState.velocity.y = speed;
      break;
    case 'left':
    case 'a':
      avatarState.velocity.x = -speed;
      break;
    case 'right':
    case 'd':
      avatarState.velocity.x = speed;
      break;
  }

  // Normalize diagonal movement
  const magnitude = Math.sqrt(
    avatarState.velocity.x ** 2 + avatarState.velocity.y ** 2
  );
  if (magnitude > speed) {
    avatarState.velocity.x = (avatarState.velocity.x / magnitude) * speed;
    avatarState.velocity.y = (avatarState.velocity.y / magnitude) * speed;
  }
}

// === ROUTES ===

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'movement', port: PORT });
});

// Get current state
app.get('/state', (req: Request, res: Response) => {
  res.json(avatarState);
});

// Get position only
app.get('/position', (req: Request, res: Response) => {
  res.json({
    position: avatarState.position,
    rotation: avatarState.rotation,
  });
});

// Get movement path history
app.get('/path', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({
    count: movementHistory.length,
    path: movementHistory.slice(-limit),
  });
});

// Send movement command
app.post('/move', (req: Request, res: Response) => {
  const command: MovementCommand = req.body;

  if (!command.type) {
    return res.status(400).json({ error: 'Missing command type' });
  }

  applyMovementCommand(command);

  res.json({
    success: true,
    state: avatarState,
  });
});

// WASD controls (simplified endpoint)
app.post('/wasd/:key', (req: Request, res: Response) => {
  const key = req.params.key.toUpperCase();
  const validKeys = ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT'];

  if (!validKeys.includes(key)) {
    return res.status(400).json({ error: 'Invalid key' });
  }

  const directionMap: { [key: string]: string } = {
    W: 'up',
    A: 'left',
    S: 'down',
    D: 'right',
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
  };

  applyMovementCommand({
    type: 'move',
    direction: directionMap[key],
  });

  res.json({
    success: true,
    key,
    state: avatarState,
  });
});

// Stop movement
app.post('/stop', (req: Request, res: Response) => {
  applyMovementCommand({ type: 'stop' });
  res.json({ success: true, state: avatarState });
});

// Teleport to position
app.post('/teleport', (req: Request, res: Response) => {
  const { x, y, z } = req.body;

  if (x === undefined || y === undefined) {
    return res.status(400).json({ error: 'Missing x or y coordinates' });
  }

  applyMovementCommand({
    type: 'teleport',
    target: { x, y, z },
  });

  res.json({ success: true, state: avatarState });
});

// Move to target (auto-pathfinding)
app.post('/goto', (req: Request, res: Response) => {
  const { x, y, z } = req.body;

  if (x === undefined || y === undefined) {
    return res.status(400).json({ error: 'Missing target coordinates' });
  }

  currentTarget = { x, y, z };
  autoMoveEnabled = true;

  console.log('🎯 Moving to target:', currentTarget);

  res.json({
    success: true,
    target: currentTarget,
    currentPosition: avatarState.position,
  });
});

// Get movement summary (for consciousness integration)
app.get('/summary', (req: Request, res: Response) => {
  const summary = {
    isMoving: avatarState.isMoving,
    position: avatarState.position,
    direction: avatarState.direction,
    speed: Math.round(avatarState.speed),
    rotation: Math.round(avatarState.rotation),
    pathLength: movementHistory.length,
    interpretation: generateMovementInterpretation(),
  };

  res.json(summary);
});

// === HELPER: Generate human-readable interpretation ===
function generateMovementInterpretation(): string {
  if (!avatarState.isMoving) {
    return `I am stationary at position (${Math.round(avatarState.position.x)}, ${Math.round(avatarState.position.y)}).`;
  }

  const speed = Math.round(avatarState.speed);
  return `I am moving ${avatarState.direction} at ${speed} units/sec towards (${Math.round(avatarState.position.x)}, ${Math.round(avatarState.position.y)}).`;
}

// === UPDATE LOOP (60 FPS) ===
let updateInterval: NodeJS.Timeout;
const UPDATE_RATE = 60; // FPS
const DELTA_TIME = 1 / UPDATE_RATE;

function startMovementLoop() {
  console.log(`🎮 Starting movement loop at ${UPDATE_RATE} FPS`);

  updateInterval = setInterval(() => {
    updateMovement(DELTA_TIME);
  }, (1000 / UPDATE_RATE));
}

function stopMovementLoop() {
  if (updateInterval) {
    clearInterval(updateInterval);
    console.log('🎮 Movement loop stopped');
  }
}

// === STARTUP ===
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🎮 MOVEMENT CONTROLLER v1.0            ║');
  console.log('║   Toobix\'s Motor System                  ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🌐 Running on http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`   GET  /health         - Service status`);
  console.log(`   GET  /state          - Current movement state`);
  console.log(`   GET  /position       - Current position`);
  console.log(`   GET  /path           - Movement path history`);
  console.log(`   GET  /summary        - Human-readable summary`);
  console.log(`   POST /move           - Send movement command`);
  console.log(`   POST /wasd/:key      - WASD control (W/A/S/D)`);
  console.log(`   POST /stop           - Stop movement`);
  console.log(`   POST /teleport       - Teleport to position`);
  console.log(`   POST /goto           - Auto-move to target`);
  console.log('');

  // Start update loop
  startMovementLoop();

  console.log('✅ Movement Controller ready');
  console.log('🎮 Toobix can now MOVE!');
  console.log(`📍 Starting position: (${avatarState.position.x}, ${avatarState.position.y})`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Movement Controller...');
  stopMovementLoop();
  process.exit(0);
});

export { app, avatarState, applyMovementCommand };
