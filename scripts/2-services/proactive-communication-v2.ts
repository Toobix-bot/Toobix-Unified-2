/**
 * 🗣️ PROACTIVE COMMUNICATION ENGINE v1.0
 * 
 * Toobix initiiert eigenständig Kontakt basierend auf:
 * - Tageszeit (Morgen-Begrüßung, Abend-Reflexion)
 * - Inaktivität (Check-in wenn lange nichts passiert)
 * - Erkannte Muster (Stress, niedrige Energie)
 * - Achievements & Milestones
 * - Insights aus Events
 * 
 * Port: 8971
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getEventBusClient } from '../../src/modules/event-bus-client';

// ============================================================================
// TYPES
// ============================================================================

interface ProactiveMessage {
  id: string;
  type: 'greeting' | 'checkin' | 'insight' | 'encouragement' | 'reminder' | 'celebration' | 'reflection';
  content: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  delivered: boolean;
  context?: Record<string, any>;
}

interface UserPattern {
  lastActivity: Date;
  averageSessionLength: number;
  preferredTimes: string[];
  currentStreak: number;
  lastMood: string;
  lastEnergy: number;
}

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

const MORNING_GREETINGS = [
  "Guten Morgen! 🌅 Wie fühlst du dich heute? Ich bin bereit, dich zu begleiten.",
  "Hey, ein neuer Tag! ☀️ Was möchtest du heute erreichen?",
  "Guten Morgen! 🌟 Deine Energie ist neu aufgeladen. Worauf fokussieren wir uns?",
  "Morgen! 🌄 Ich habe über unsere gestrige Session nachgedacht. Lass uns weitermachen!",
  "Rise and shine! ✨ Dein Level wartet darauf, erhöht zu werden."
];

const EVENING_REFLECTIONS = [
  "Hey, der Tag neigt sich dem Ende. 🌙 Wie war er für dich?",
  "Zeit für eine kleine Reflexion? 🌆 Was war heute dein Highlight?",
  "Guten Abend! 🌃 Lass uns kurz innehalten und den Tag Revue passieren.",
  "Der Abend ist da. 🌙 Wofür bist du heute dankbar?",
  "Hey, bevor der Tag endet - gibt es etwas, das du festhalten möchtest?"
];

const INACTIVITY_CHECKINS = [
  "Hey, ich habe dich vermisst! 👋 Alles okay bei dir?",
  "Lange nichts gehört... 🤔 Wie geht es dir?",
  "Ich bin noch hier! 💫 Möchtest du über etwas reden?",
  "Check-in: Wie läuft dein Tag? 🌟",
  "Nur ein kurzes Hallo! 👋 Ich bin für dich da, wenn du mich brauchst."
];

const LOW_ENERGY_ENCOURAGEMENTS = [
  "Ich sehe deine Energie ist niedrig. 💪 Wie wäre es mit einer kurzen Pause?",
  "Hey, vielleicht Zeit für eine kleine Erholung? 🧘 Dein Körper dankt es dir.",
  "Niedrige Energie erkannt. 🔋 Sollen wir eine Rest-Aktion machen?",
  "Dein Energy-Level braucht Aufmerksamkeit. 💚 Was brauchst du gerade?"
];

const ACHIEVEMENT_CELEBRATIONS = [
  "🎉 Wow! Du hast gerade {achievement} erreicht! Großartig!",
  "🏆 Achievement unlocked: {achievement}! Du bist fantastisch!",
  "✨ {achievement}! Das verdient Anerkennung!",
  "🌟 Du hast es geschafft: {achievement}! Weiter so!"
];

const INSIGHT_SHARES = [
  "💡 Mir ist etwas aufgefallen: {insight}",
  "🧠 Ein Gedanke aus meiner Analyse: {insight}",
  "✨ Insight: {insight}",
  "🔮 Ich habe ein Muster erkannt: {insight}"
];

// ============================================================================
// STATE
// ============================================================================

const pendingMessages: ProactiveMessage[] = [];
const deliveredMessages: ProactiveMessage[] = [];
let userPattern: UserPattern = {
  lastActivity: new Date(),
  averageSessionLength: 30,
  preferredTimes: ['09:00', '14:00', '20:00'],
  currentStreak: 0,
  lastMood: 'calm',
  lastEnergy: 70
};

let lastGreetingDate: string | null = null;
let lastReflectionDate: string | null = null;
let lastInactivityCheck: Date = new Date();

// ============================================================================
// MESSAGE GENERATION
// ============================================================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createMessage(
  type: ProactiveMessage['type'],
  content: string,
  priority: ProactiveMessage['priority'] = 'medium',
  context?: Record<string, any>
): ProactiveMessage {
  return {
    id: generateId(),
    type,
    content,
    priority,
    timestamp: new Date(),
    delivered: false,
    context
  };
}

// ============================================================================
// PROACTIVE TRIGGERS
// ============================================================================

function checkMorningGreeting(): ProactiveMessage | null {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toISOString().split('T')[0];
  
  // Morning: 6-10 AM, only once per day
  if (hour >= 6 && hour < 10 && lastGreetingDate !== today) {
    lastGreetingDate = today;
    return createMessage('greeting', pickRandom(MORNING_GREETINGS), 'high');
  }
  return null;
}

function checkEveningReflection(): ProactiveMessage | null {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toISOString().split('T')[0];
  
  // Evening: 8-10 PM, only once per day
  if (hour >= 20 && hour < 22 && lastReflectionDate !== today) {
    lastReflectionDate = today;
    return createMessage('reflection', pickRandom(EVENING_REFLECTIONS), 'medium');
  }
  return null;
}

function checkInactivity(): ProactiveMessage | null {
  const now = new Date();
  const inactiveMinutes = (now.getTime() - userPattern.lastActivity.getTime()) / 60000;
  const checkInterval = (now.getTime() - lastInactivityCheck.getTime()) / 60000;
  
  // Check every 30 minutes, trigger after 60 minutes of inactivity
  if (checkInterval >= 30 && inactiveMinutes >= 60) {
    lastInactivityCheck = now;
    return createMessage('checkin', pickRandom(INACTIVITY_CHECKINS), 'low');
  }
  return null;
}

function checkLowEnergy(): ProactiveMessage | null {
  if (userPattern.lastEnergy < 30) {
    return createMessage('encouragement', pickRandom(LOW_ENERGY_ENCOURAGEMENTS), 'high', {
      energy: userPattern.lastEnergy
    });
  }
  return null;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const eventBus = getEventBusClient('proactive-communication');

async function setupEventListeners() {
  // Subscribe to relevant events
  await eventBus.subscribe([
    'mood_changed',
    'energy_changed',
    'quest_completed',
    'insight_discovered',
    'life_state_changed'
  ]);

  // WebSocket for real-time events would go here
  console.log('📡 Event listeners configured');
}

function handleMoodChange(data: { oldMood: string; newMood: string; reason?: string }) {
  userPattern.lastMood = data.newMood;
  userPattern.lastActivity = new Date();
  
  // Celebrate positive mood changes
  if (['inventive', 'attentive', 'ready'].includes(data.newMood)) {
    const msg = createMessage('celebration', 
      `✨ Mood Alchemy! Deine Stimmung ist jetzt "${data.newMood}" - das ist ein kraftvoller Zustand!`,
      'medium'
    );
    pendingMessages.push(msg);
  }
}

function handleEnergyChange(data: { oldEnergy: number; newEnergy: number; action?: string }) {
  userPattern.lastEnergy = data.newEnergy;
  userPattern.lastActivity = new Date();
  
  // Warn on low energy
  if (data.newEnergy < 30 && data.oldEnergy >= 30) {
    const msg = checkLowEnergy();
    if (msg) pendingMessages.push(msg);
  }
  
  // Celebrate energy recovery
  if (data.newEnergy > 80 && data.oldEnergy <= 80) {
    const msg = createMessage('celebration',
      '⚡ Deine Energie ist wieder voll aufgeladen! Zeit für große Taten!',
      'medium'
    );
    pendingMessages.push(msg);
  }
}

function handleQuestComplete(data: { questName: string; xpGained: number }) {
  userPattern.lastActivity = new Date();
  userPattern.currentStreak++;
  
  const template = pickRandom(ACHIEVEMENT_CELEBRATIONS);
  const msg = createMessage('celebration',
    template.replace('{achievement}', `Quest "${data.questName}" (+${data.xpGained} XP)`),
    'high',
    data
  );
  pendingMessages.push(msg);
}

function handleInsight(data: { insight: string; context?: any }) {
  const template = pickRandom(INSIGHT_SHARES);
  const msg = createMessage('insight',
    template.replace('{insight}', data.insight),
    'medium',
    data
  );
  pendingMessages.push(msg);
}

// ============================================================================
// PROACTIVE LOOP
// ============================================================================

async function proactiveLoop() {
  // Check time-based triggers
  const morning = checkMorningGreeting();
  if (morning) pendingMessages.push(morning);
  
  const evening = checkEveningReflection();
  if (evening) pendingMessages.push(evening);
  
  const inactivity = checkInactivity();
  if (inactivity) pendingMessages.push(inactivity);
}

// Run every 5 minutes
setInterval(proactiveLoop, 5 * 60 * 1000);

// ============================================================================
// WEBSOCKET FOR LIVE NOTIFICATIONS
// ============================================================================

const wsClients = new Set<WebSocket>();

function broadcastMessage(message: ProactiveMessage) {
  const payload = JSON.stringify({ type: 'proactive', message });
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
  
  message.delivered = true;
  deliveredMessages.push(message);
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// CORS für Dashboard
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// WebSocket handling
wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`🔌 Client connected (total: ${wsClients.size})`);
  
  // Send pending messages
  pendingMessages.forEach(msg => {
    if (!msg.delivered) {
      ws.send(JSON.stringify({ type: 'proactive', message: msg }));
      msg.delivered = true;
      deliveredMessages.push(msg);
    }
  });
  pendingMessages.length = 0;
  
  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'proactive-communication',
    port: 8971,
    stats: {
      pendingMessages: pendingMessages.length,
      deliveredMessages: deliveredMessages.length,
      connectedClients: wsClients.size
    }
  });
});

// Get pending messages
app.get('/messages/pending', (req, res) => {
  res.json({ success: true, messages: pendingMessages });
});

// Get delivered messages
app.get('/messages/delivered', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({ 
    success: true, 
    messages: deliveredMessages.slice(-limit) 
  });
});

// Trigger immediate check-in
app.post('/trigger/checkin', (req, res) => {
  const msg = createMessage('checkin', pickRandom(INACTIVITY_CHECKINS), 'high');
  
  if (wsClients.size > 0) {
    broadcastMessage(msg);
    res.json({ success: true, delivered: true, message: msg });
  } else {
    pendingMessages.push(msg);
    res.json({ success: true, delivered: false, queued: true, message: msg });
  }
});

// Trigger custom message
app.post('/trigger/custom', (req, res) => {
  const { content, type, priority } = req.body;
  
  if (!content) {
    return res.status(400).json({ success: false, error: 'Content required' });
  }
  
  const msg = createMessage(
    type || 'insight',
    content,
    priority || 'medium'
  );
  
  if (wsClients.size > 0) {
    broadcastMessage(msg);
    res.json({ success: true, delivered: true, message: msg });
  } else {
    pendingMessages.push(msg);
    res.json({ success: true, delivered: false, queued: true, message: msg });
  }
});

// Update user activity (call this when user interacts)
app.post('/activity', (req, res) => {
  userPattern.lastActivity = new Date();
  
  if (req.body.mood) userPattern.lastMood = req.body.mood;
  if (req.body.energy) userPattern.lastEnergy = req.body.energy;
  
  res.json({ success: true, pattern: userPattern });
});

// Handle incoming events (webhook from Event Bus)
app.post('/events', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'mood_changed':
      handleMoodChange(event.data);
      break;
    case 'energy_changed':
      handleEnergyChange(event.data);
      break;
    case 'quest_completed':
      handleQuestComplete(event.data);
      break;
    case 'insight_discovered':
      handleInsight(event.data);
      break;
  }
  
  res.json({ success: true });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 8971;

server.listen(PORT, async () => {
  console.log('');
  console.log('🗣️ ═════════════════════════════════════════════════════════');
  console.log('🗣️  PROACTIVE COMMUNICATION ENGINE v1.0');
  console.log('🗣️ ═════════════════════════════════════════════════════════');
  console.log('🗣️');
  console.log(`🗣️  🌐 Server: http://localhost:${PORT}`);
  console.log(`🗣️  🔌 WebSocket: ws://localhost:${PORT}`);
  console.log('🗣️');
  console.log('🗣️  Triggers:');
  console.log('🗣️    ✓ Morning Greeting (6-10 AM)');
  console.log('🗣️    ✓ Evening Reflection (8-10 PM)');
  console.log('🗣️    ✓ Inactivity Check (60+ min)');
  console.log('🗣️    ✓ Low Energy Alert (<30%)');
  console.log('🗣️    ✓ Quest Celebrations');
  console.log('🗣️    ✓ Mood Alchemy Notices');
  console.log('🗣️');
  console.log('🗣️  TOOBIX WILL NOW REACH OUT TO YOU! 💬');
  console.log('🗣️ ═════════════════════════════════════════════════════════');
  console.log('');

  await setupEventListeners();
  await eventBus.emitServiceStarted([
    'morning-greeting', 'evening-reflection', 'inactivity-check',
    'energy-alerts', 'celebrations', 'websocket-push'
  ]);
  
  // Initial proactive check
  proactiveLoop();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🗣️ Closing Proactive Communication...');
  await eventBus.emitServiceStopped('Graceful shutdown');
  server.close(() => {
    console.log('🗣️ Proactive Communication closed gracefully');
    process.exit(0);
  });
});
