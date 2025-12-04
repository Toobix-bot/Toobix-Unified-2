/**
 * 🗣️ VOICE CONTROLLER v1.0 - Toobix's Voice
 *
 * Provides Toobix with speech capabilities:
 * - Text-to-Speech (TTS)
 * - Voice queue management
 * - Emotion-based voice modulation
 * - Multi-language support
 *
 * Port: 8928
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 8928;

app.use(express.json());

// === TYPES ===
interface VoiceConfig {
  language: string;
  pitch: number; // 0.5 - 2.0
  rate: number; // 0.5 - 2.0
  volume: number; // 0.0 - 1.0
  voice?: string;
}

interface SpeechRequest {
  text: string;
  emotion?: string;
  priority?: number;
  config?: Partial<VoiceConfig>;
}

interface SpeechQueueItem {
  id: string;
  text: string;
  emotion: string;
  priority: number;
  config: VoiceConfig;
  status: 'pending' | 'speaking' | 'completed' | 'failed';
  timestamp: number;
}

// === STATE ===
const defaultConfig: VoiceConfig = {
  language: 'en-US',
  pitch: 1.0,
  rate: 1.0,
  volume: 0.8,
};

let speechQueue: SpeechQueueItem[] = [];
let currentlySpeaking: SpeechQueueItem | null = null;
let speechHistory: SpeechQueueItem[] = [];
const MAX_HISTORY = 100;

// Emotion-to-Voice mapping
const emotionVoiceProfiles: { [emotion: string]: Partial<VoiceConfig> } = {
  joy: { pitch: 1.3, rate: 1.1, volume: 0.9 },
  sadness: { pitch: 0.8, rate: 0.9, volume: 0.6 },
  anger: { pitch: 1.1, rate: 1.2, volume: 1.0 },
  fear: { pitch: 1.4, rate: 1.3, volume: 0.7 },
  surprise: { pitch: 1.5, rate: 1.2, volume: 0.9 },
  calm: { pitch: 1.0, rate: 0.95, volume: 0.8 },
  curiosity: { pitch: 1.2, rate: 1.05, volume: 0.85 },
  excitement: { pitch: 1.4, rate: 1.15, volume: 0.95 },
  neutral: { pitch: 1.0, rate: 1.0, volume: 0.8 },
};

// === SPEECH SYNTHESIS ===

/**
 * In production, this would use:
 * - Web Speech API (browser)
 * - Azure Cognitive Services TTS
 * - Google Cloud TTS
 * - Amazon Polly
 * - Local TTS engines (espeak, festival)
 *
 * For now, it's a placeholder that simulates speech
 */
async function synthesizeSpeech(item: SpeechQueueItem): Promise<boolean> {
  console.log(`🗣️ Speaking: "${item.text}"`);
  console.log(`   Emotion: ${item.emotion}`);
  console.log(`   Config: pitch=${item.config.pitch}, rate=${item.config.rate}`);

  // Simulate speech duration based on text length and rate
  const wordsPerMinute = 150 * item.config.rate;
  const words = item.text.split(' ').length;
  const durationMs = (words / wordsPerMinute) * 60 * 1000;

  // In production, this would actually trigger TTS
  // For now, just wait for the duration
  await new Promise((resolve) => setTimeout(resolve, Math.min(durationMs, 5000)));

  console.log(`✅ Finished speaking`);
  return true;
}

// === QUEUE MANAGEMENT ===

function addToQueue(request: SpeechRequest): SpeechQueueItem {
  const emotion = request.emotion || 'neutral';
  const priority = request.priority || 5;

  // Merge emotion profile with config
  const emotionProfile = emotionVoiceProfiles[emotion] || {};
  const config: VoiceConfig = {
    ...defaultConfig,
    ...emotionProfile,
    ...request.config,
  };

  const item: SpeechQueueItem = {
    id: generateId(),
    text: request.text,
    emotion,
    priority,
    config,
    status: 'pending',
    timestamp: Date.now(),
  };

  speechQueue.push(item);

  // Sort by priority (higher first)
  speechQueue.sort((a, b) => b.priority - a.priority);

  console.log(`➕ Added to speech queue (priority ${priority}): "${item.text.substring(0, 50)}..."`);

  // Start processing if not already speaking
  if (!currentlySpeaking) {
    processQueue();
  }

  return item;
}

async function processQueue() {
  if (currentlySpeaking || speechQueue.length === 0) {
    return;
  }

  // Get next item
  const item = speechQueue.shift()!;
  currentlySpeaking = item;
  item.status = 'speaking';

  try {
    const success = await synthesizeSpeech(item);

    if (success) {
      item.status = 'completed';
    } else {
      item.status = 'failed';
    }
  } catch (error) {
    console.error('❌ Speech synthesis error:', error);
    item.status = 'failed';
  }

  // Add to history
  speechHistory.push(item);
  if (speechHistory.length > MAX_HISTORY) {
    speechHistory.shift();
  }

  currentlySpeaking = null;

  // Process next item
  if (speechQueue.length > 0) {
    setTimeout(() => processQueue(), 100);
  }
}

function clearQueue() {
  speechQueue = [];
  console.log('🗑️ Speech queue cleared');
}

function generateId(): string {
  return `speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// === ROUTES ===

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'voice', port: PORT });
});

// Get current state
app.get('/state', (req: Request, res: Response) => {
  res.json({
    currentlySpeaking: currentlySpeaking ? {
      id: currentlySpeaking.id,
      text: currentlySpeaking.text,
      emotion: currentlySpeaking.emotion,
    } : null,
    queueLength: speechQueue.length,
    isSpeaking: currentlySpeaking !== null,
  });
});

// Get queue
app.get('/queue', (req: Request, res: Response) => {
  res.json({
    current: currentlySpeaking,
    queue: speechQueue,
    length: speechQueue.length,
  });
});

// Get speech history
app.get('/history', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({
    count: speechHistory.length,
    history: speechHistory.slice(-limit),
  });
});

// Speak text (main endpoint)
app.post('/speak', (req: Request, res: Response) => {
  const request: SpeechRequest = req.body;

  if (!request.text || request.text.trim() === '') {
    return res.status(400).json({ error: 'Missing text to speak' });
  }

  const item = addToQueue(request);

  res.json({
    success: true,
    id: item.id,
    queuePosition: speechQueue.findIndex((i) => i.id === item.id) + 1,
  });
});

// Quick speak (text only, default settings)
app.post('/say/:text', (req: Request, res: Response) => {
  const text = decodeURIComponent(req.params.text);

  const item = addToQueue({ text });

  res.json({
    success: true,
    id: item.id,
  });
});

// Stop current speech
app.post('/stop', (req: Request, res: Response) => {
  if (currentlySpeaking) {
    console.log('⏸️ Stopping current speech');
    currentlySpeaking.status = 'failed';
    currentlySpeaking = null;
  }

  res.json({ success: true });
});

// Clear queue
app.post('/clear', (req: Request, res: Response) => {
  clearQueue();
  res.json({ success: true });
});

// Get available voices (placeholder)
app.get('/voices', (req: Request, res: Response) => {
  // In production, this would query available TTS voices
  const voices = [
    { id: 'en-US-Neural2-A', name: 'English US (Female)', language: 'en-US' },
    { id: 'en-US-Neural2-D', name: 'English US (Male)', language: 'en-US' },
    { id: 'en-GB-Neural2-A', name: 'English UK (Female)', language: 'en-GB' },
    { id: 'de-DE-Neural2-A', name: 'German (Female)', language: 'de-DE' },
  ];

  res.json({ voices });
});

// Get summary (for consciousness integration)
app.get('/summary', (req: Request, res: Response) => {
  const summary = {
    isSpeaking: currentlySpeaking !== null,
    currentText: currentlySpeaking?.text || null,
    queueLength: speechQueue.length,
    recentSpeech: speechHistory.slice(-5).map((s) => s.text),
    interpretation: generateVoiceInterpretation(),
  };

  res.json(summary);
});

// === HELPER: Generate human-readable interpretation ===
function generateVoiceInterpretation(): string {
  if (currentlySpeaking) {
    return `I am currently speaking with ${currentlySpeaking.emotion} emotion: "${currentlySpeaking.text.substring(0, 50)}..."`;
  }

  if (speechQueue.length > 0) {
    return `I have ${speechQueue.length} message(s) queued to speak.`;
  }

  return 'I am silent, ready to speak when needed.';
}

// === STARTUP ===
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🗣️  VOICE CONTROLLER v1.0              ║');
  console.log('║   Toobix\'s Speech System                 ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🌐 Running on http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`   GET  /health         - Service status`);
  console.log(`   GET  /state          - Current voice state`);
  console.log(`   GET  /queue          - Speech queue`);
  console.log(`   GET  /history        - Speech history`);
  console.log(`   GET  /voices         - Available voices`);
  console.log(`   GET  /summary        - Human-readable summary`);
  console.log(`   POST /speak          - Speak text (full config)`);
  console.log(`   POST /say/:text      - Quick speak`);
  console.log(`   POST /stop           - Stop speaking`);
  console.log(`   POST /clear          - Clear queue`);
  console.log('');

  console.log('✅ Voice Controller ready');
  console.log('🗣️ Toobix can now SPEAK!');
  console.log(`📢 Supported emotions: ${Object.keys(emotionVoiceProfiles).join(', ')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Voice Controller...');
  clearQueue();
  process.exit(0);
});

export { app, addToQueue, speechQueue };
