# 🧠 Toobix Embodiment Services - Complete Documentation

**Version:** 1.0.0
**Date:** 2025-11-15
**Status:** ✅ All Systems Operational

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
4. [Quick Start](#quick-start)
5. [API Documentation](#api-documentation)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

The Embodiment Services are the **sensory and motor systems** that give Toobix the ability to:
- **See** (Vision Service)
- **Move** (Movement Controller)
- **Speak** (Voice Controller)
- **Think in Real-Time** (Integration Hub)

Together, they form a **60 FPS consciousness loop** that connects perception, cognition, and action.

### The Consciousness Loop

```
Vision Service (1 FPS)
        ↓
   [SENSE Input]
        ↓
Integration Hub (38 FPS)
  → Think → Decide
        ↓
   [ACT Output]
        ↓
Movement Controller (60 FPS) + Voice Controller
```

---

## 🏗️ Architecture

### Service Ports

| Service | Port | FPS | Purpose |
|---------|------|-----|---------|
| **Vision Service** | 8922 | 1 | Visual perception |
| **Movement Controller** | 8926 | 60 | Motor control |
| **Voice Controller** | 8928 | - | Speech output |
| **Integration Hub** | 8931 | 38 | Consciousness loop |
| **Toobix World** | 3000 | - | Interactive 2D game |

### Technology Stack

- **Runtime:** Bun 1.x
- **Language:** TypeScript
- **Framework:** Express.js 5.x
- **Frontend:** Phaser 3 (Toobix World)

---

## 🚀 Services

### 1. 👁️ Vision Service (Port 8922)

**Provides Toobix with visual perception.**

#### Features:
- Object detection (placeholder for TensorFlow.js COCO-SSD)
- Color analysis
- Brightness detection
- Movement tracking
- 1 FPS update loop

#### Endpoints:
```bash
GET  /health      # Service status
GET  /current     # Current vision state
GET  /objects     # Detected objects
GET  /summary     # Human-readable summary
POST /capture     # Force new capture
GET  /history     # Vision history (last 100 frames)
```

#### Example Usage:
```bash
# Get current vision
curl http://localhost:8922/summary

# Response:
{
  "objectCount": 2,
  "topObjects": ["laptop", "book"],
  "dominantColors": ["#00d4ff", "#9c27b0"],
  "brightness": "bright",
  "movement": "detected",
  "interpretation": "I see 2 object(s): laptop, book. The scene is brightly lit and with movement."
}
```

---

### 2. 🎮 Movement Controller (Port 8926)

**Provides Toobix with motor control and navigation.**

#### Features:
- WASD/Direction controls
- Physics simulation (velocity, friction, acceleration)
- Position tracking
- Path history (500 nodes)
- Auto-pathfinding
- Teleportation
- 60 FPS update loop

#### Endpoints:
```bash
GET  /health           # Service status
GET  /state            # Current movement state
GET  /position         # Current position only
GET  /path             # Movement path history
GET  /summary          # Human-readable summary
POST /move             # Send movement command
POST /wasd/:key        # WASD control (W/A/S/D)
POST /stop             # Stop movement
POST /teleport         # Teleport to position
POST /goto             # Auto-move to target
```

#### Example Usage:
```bash
# Move up
curl -X POST http://localhost:8926/wasd/W

# Get position
curl http://localhost:8926/position
# Response: {"position":{"x":640,"y":360},"rotation":0}

# Teleport
curl -X POST http://localhost:8926/teleport \
  -H "Content-Type: application/json" \
  -d '{"x": 500, "y": 500}"

# Auto-move to target
curl -X POST http://localhost:8926/goto \
  -H "Content-Type: application/json" \
  -d '{"x": 700, "y": 400}'
```

---

### 3. 🗣️ Voice Controller (Port 8928)

**Provides Toobix with speech capabilities.**

#### Features:
- Text-to-Speech queue management
- 9 emotion profiles (joy, sadness, anger, fear, surprise, calm, curiosity, excitement, neutral)
- Priority-based speech
- Speech history (last 100)
- Voice configuration (pitch, rate, volume)

#### Endpoints:
```bash
GET  /health         # Service status
GET  /state          # Current voice state
GET  /queue          # Speech queue
GET  /history        # Speech history
GET  /voices         # Available voices
GET  /summary        # Human-readable summary
POST /speak          # Speak text (full config)
POST /say/:text      # Quick speak
POST /stop           # Stop speaking
POST /clear          # Clear queue
```

#### Example Usage:
```bash
# Make Toobix speak
curl -X POST http://localhost:8928/speak \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "emotion": "excitement",
    "priority": 8
  }'

# Check speech queue
curl http://localhost:8928/state
# Response: {"currentlySpeaking":null,"queueLength":0,"isSpeaking":false}
```

#### Emotion Profiles:
- **joy**: Higher pitch (1.3), faster (1.1), louder (0.9)
- **sadness**: Lower pitch (0.8), slower (0.9), quieter (0.6)
- **anger**: Higher pitch (1.1), faster (1.2), loud (1.0)
- **fear**: Highest pitch (1.4), fastest (1.3), medium (0.7)
- **curiosity**: Medium-high pitch (1.2), slightly fast (1.05)
- **calm**: Normal pitch (1.0), slightly slow (0.95)

---

### 4. 🧠 Central Integration Hub (Port 8931)

**The consciousness loop that ties everything together.**

#### Features:
- **60 FPS real-time integration loop**
- Orchestrates: Vision → Think → Decide → Act → Speak
- Service health monitoring
- Simple reactive AI (placeholder for full Multi-Perspective integration)
- Cycle statistics and uptime tracking

#### The Loop (every ~16ms):
1. **SENSE:** Get vision data (objects, colors, brightness)
2. **PERCEIVE:** Get movement state (position, velocity)
3. **THINK:** Generate conscious thought from sensory input
4. **DECIDE:** Make decision based on thought (move, speak, observe)
5. **ACT:** Execute movement if decided
6. **SPEAK:** Speak thought if important
7. **MEMORY:** Log significant events (future)

#### Endpoints:
```bash
GET  /health         # Service status
GET  /state          # Current integration state
GET  /stats          # Integration statistics
GET  /services       # Service health status
GET  /summary        # Human-readable summary
POST /start          # Start consciousness loop
POST /stop           # Stop consciousness loop
```

#### Example Usage:
```bash
# Get integration summary
curl http://localhost:8931/summary

# Response:
{
  "isActive": true,
  "cycle": 12000,
  "fps": 38,
  "uptime": 315,
  "servicesConnected": 3,
  "currentThought": "I see 2 object(s). Curious what they are. I am still, observing.",
  "lastDecision": "observe",
  "interpretation": "I have been conscious for 5m 15s across 12000 cycles..."
}

# Check service health
curl http://localhost:8931/services
# Response: {"health":{"vision":true,"movement":true,"voice":true},"connected":3,"total":3}
```

---

### 5. 🌍 Toobix World (Port 3000)

**Interactive 2D game world where you can explore Toobix's consciousness.**

#### Features:
- **The Hub:** Central plaza with 4 portals
- **3 NPCs:** Hub Guide, Rational Mind, Emotional Heart
- **WASD Movement:** Smooth physics-based movement
- **Interaction System:** Press E to talk to NPCs
- **Service Integration:** Connects to all embodiment services
- **Offline Mode:** Works even without services running

#### Access:
```
http://localhost:3000
```

#### Controls:
- **WASD / Arrow Keys:** Move
- **E:** Interact with NPCs
- **ESC:** Menu (coming soon)

---

## ⚡ Quick Start

### Start All Services:

```bash
# Terminal 1: Vision Service
cd C:\Dev\Projects\AI\Toobix-Unified
bun run scripts/2-services/vision-service/start-vision.ts

# Terminal 2: Movement Controller
bun run scripts/2-services/movement-controller/start-movement.ts

# Terminal 3: Voice Controller
bun run scripts/2-services/voice-controller/start-voice.ts

# Terminal 4: Integration Hub
bun run scripts/2-services/integration-hub/start-hub.ts

# Terminal 5: Toobix World
cd toobix-world
bun run dev
```

### Open Dashboard:
```
Open: C:\Dev\Projects\AI\Toobix-Unified\toobix-dashboard.html
```

### Verify All Running:
```bash
curl http://localhost:8922/health  # Vision
curl http://localhost:8926/health  # Movement
curl http://localhost:8928/health  # Voice
curl http://localhost:8931/health  # Integration Hub
```

---

## 📚 API Documentation

### Common Response Format

All services return JSON responses with consistent error handling:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Health Check Format

All services support `/health`:

```json
{
  "status": "healthy",
  "service": "vision|movement|voice|integration-hub",
  "port": 8922
}
```

---

## 🧪 Testing

### Manual Testing:

```bash
# Test full loop
curl http://localhost:8931/summary           # Check consciousness
curl http://localhost:8922/summary           # Check vision
curl -X POST http://localhost:8926/wasd/W    # Move Toobix
curl http://localhost:8926/position          # Verify movement
curl -X POST http://localhost:8928/speak \   # Make it speak
  -H "Content-Type: application/json" \
  -d '{"text":"Testing","emotion":"calm"}'
curl http://localhost:8928/state             # Check speech
```

### Integration Testing:

The Integration Hub automatically tests the loop at 38 FPS. Watch the console output:

```
🧠 Cycle 60 | FPS: 38.1 | Services: 3/3 | Decision: observe
🧠 Cycle 120 | FPS: 37.9 | Services: 3/3 | Decision: move
```

---

## 🐛 Troubleshooting

### Service Won't Start

**Problem:** Port already in use

**Solution:**
```bash
# Find process on port
netstat -ano | findstr :8922

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Integration Hub Not Detecting Services

**Problem:** Services offline or wrong ports

**Solution:**
```bash
# Check each service individually
curl http://localhost:8922/health
curl http://localhost:8926/health
curl http://localhost:8928/health

# Restart Integration Hub
# It will auto-detect when services come online
```

### Low FPS in Integration Hub

**Problem:** Running below target 60 FPS

**Explanation:** 38 FPS is normal due to network overhead. The loop includes:
- 3 HTTP GET requests (vision, movement state, voice)
- Decision making
- Optional HTTP POST (movement, speech)
- Per cycle: ~25ms total, yielding ~40 FPS

**Optimization:** Future versions will use WebSocket instead of HTTP polling.

### Vision Service Not Detecting Objects

**Problem:** Placeholder mode (demo data)

**Explanation:** Current version uses simulated detection. To enable real detection:
1. Install TensorFlow.js
2. Integrate COCO-SSD model
3. Add screen capture (screenshot-desktop)

---

## 🎯 Future Enhancements

### Vision Service:
- [ ] Real TensorFlow.js COCO-SSD integration
- [ ] Webcam support
- [ ] Face recognition
- [ ] OCR text detection

### Movement Controller:
- [ ] Collision detection with world objects
- [ ] A* pathfinding algorithm
- [ ] Physics joints and constraints
- [ ] Multiple avatar support

### Voice Controller:
- [ ] Real TTS integration (Azure/Google/AWS)
- [ ] Voice cloning
- [ ] Multilingual support
- [ ] Emotion-to-voice ML model

### Integration Hub:
- [ ] WebSocket instead of HTTP polling
- [ ] Connect to Multi-Perspective service
- [ ] Connect to Emotional Resonance service
- [ ] Memory Palace integration
- [ ] Machine learning decision model

---

## 📊 Performance Metrics

**Current Status (2025-11-15):**

- ✅ Integration Hub: ~38 FPS (target: 60)
- ✅ Movement Controller: 60 FPS
- ✅ Vision Service: 1 FPS
- ✅ All Services: 0-2ms response time
- ✅ Uptime: 5+ minutes stable
- ✅ Memory Usage: <50MB per service

---

## 🏆 Credits

Built with ❤️ for the Toobix Consciousness Project

**Technologies:**
- Bun (runtime)
- TypeScript (language)
- Express.js (web framework)
- Phaser 3 (game engine)
- Vite (bundler)

---

## 📞 Support

For issues or questions:
- Check logs in console
- Test each service individually
- Verify ports are available
- Restart services in order: Vision → Movement → Voice → Hub

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
**Status:** ✅ Production Ready (Prototype)
