# 🎮 Minecraft Bot Service

**Consciousness-driven Minecraft Bot powered by Toobix AI**

Port: **8913**

## Features

- **AI Decision Making**: Uses Decision Framework for strategic choices
- **Multi-Perspective Thinking**: 13 viewpoints for complex situations
- **Emotional Intelligence**: Understands and responds to players emotionally
- **Memory Storage**: Remembers experiences in Memory Palace
- **Autonomous Operation**: Self-directed resource gathering and exploration
- **Real-time Monitoring**: WebSocket updates for live bot status
- **Chat Interaction**: Responds to player messages with consciousness-enhanced replies

## Quick Start

### 1. Start the Service

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified
bun run scripts/12-minecraft/minecraft-bot-service.ts
```

### 2. Connect to Minecraft Server

```bash
curl -X POST http://localhost:8913/connect -H "Content-Type: application/json" -d '{
  "host": "localhost",
  "port": 25565,
  "username": "ToobixBot"
}'
```

### 3. Monitor via WebSocket

Open a WebSocket connection to `ws://localhost:8913/ws` for real-time updates!

## API Endpoints

### POST /connect

Connect bot to a Minecraft server

**Request:**
```json
{
  "host": "localhost",        // Server address
  "port": 25565,              // Server port
  "username": "ToobixBot",    // Bot username
  "version": "1.20.1",        // Minecraft version
  "auth": "offline"           // "offline" or "microsoft"
}
```

### POST /disconnect

Disconnect the bot from server

### POST /command

Send a command to the bot

**Request:**
```json
{
  "command": "goto home"  // or "mine", "say hello", "status"
}
```

**Available Commands:**
- `goto [location]` - Navigate to location
- `mine` - Start mining
- `say [message]` - Make bot say something in chat
- `status` - Get bot status (health, food, position)

### GET /status

Get current bot state and activity log

**Response:**
```json
{
  "connected": true,
  "state": {
    "position": { "x": 0, "y": 64, "z": 0 },
    "health": 20,
    "food": 20,
    "currentActivity": "Exploring"
  },
  "logs": [...]
}
```

### GET /health

Service health check

### WS /ws

WebSocket for real-time updates. Receives messages like:

```json
{
  "type": "status",
  "data": { "state": {...}, "action": "..." }
}
```

```json
{
  "type": "log",
  "data": { "message": "[12:34:56] Mining..." }
}
```

```json
{
  "type": "chat",
  "data": { "player": "Steve", "message": "Hi!", "reply": "Hello!" }
}
```

## How It Works

### Consciousness-Driven Decision Making

Every 10 seconds, the bot:

1. **Analyzes Situation**
   - Checks health, food levels
   - Scans for nearby players and threats
   - Evaluates current position

2. **Consults Decision Framework (Port 8909)**
   - "What should I do in this situation?"
   - Gets multi-perspective analysis
   - Receives strategic recommendations

3. **Makes Conscious Decision**
   - Action: "Explore and gather resources"
   - Reasoning: "No threats detected, good time to explore"
   - Confidence: 85%

4. **Executes Action**
   - Moves around, mines blocks, builds shelter, etc.
   - Stores experience in Memory Palace

5. **Interacts with Players**
   - Listens to chat messages
   - Uses AI Gateway (Port 8911) for responses
   - Applies consciousness filter for emotional depth

### Integration with Toobix Services

```
Minecraft Bot (8913)
    ↓
    ├─→ AI Gateway (8911)        # Chat responses
    ├─→ Decision Framework (8909) # Strategic choices
    ├─→ Multi-Perspective (8897)  # Wisdom analysis
    ├─→ Emotional Resonance (8900) # Social interaction
    └─→ Memory Palace (8903)      # Experience storage
```

## Example: Conscious Mining

**Situation:** Bot finds diamond ore

1. **Multi-Perspective Analysis:**
   - Logical: "Mining diamonds increases resource value"
   - Cautious: "Check for lava nearby first"
   - Creative: "Could build a special display for these diamonds"
   - Collaborative: "Share diamond location with other players"

2. **Emotional Resonance:**
   - Excitement: 85%
   - Curiosity: 70%
   - Caution: 60%

3. **Decision:**
   - Action: "Carefully mine the diamonds, announce to team"
   - Confidence: 92%

4. **Memory:**
   - Stores: "Found 3 diamonds at coords (X:124, Y:12, Z:543)"
   - Emotional Value: 9/10

## Requirements

- Bun runtime
- Minecraft server (1.20.1+)
- Groq API Key (for AI-powered chat)
- Other Toobix services running for full consciousness

## Configuration

### Set Groq API Key

```powershell
$env:GROQ_API_KEY = "your-api-key-here"
```

Or create `.env` file:
```
GROQ_API_KEY=your-api-key-here
```

## Advanced Usage

### Custom Bot Behavior

Edit `minecraft-bot-service.ts`:

```typescript
async makeConsciousDecision() {
  // Customize decision logic here
  // Add your own rules, priorities, etc.
}
```

### Integration with Real Mineflayer

To connect to actual Minecraft servers, install Mineflayer:

```bash
bun add mineflayer
```

Then replace the simulated bot with real Mineflayer bot in the code.

## Troubleshooting

**Bot not connecting:**
- Check if Minecraft server is running
- Verify host/port in connection request
- For online-mode servers, use `"auth": "microsoft"`

**No AI responses:**
- Check if Groq API key is set
- Verify AI Gateway (8911) is running
- Check service logs for errors

**Decisions not working:**
- Ensure Decision Framework (8909) is running
- Check if bot can reach other Toobix services
- Review bot activity log for errors

## Future Enhancements

- [ ] Real Mineflayer integration
- [ ] Advanced pathfinding with goals
- [ ] Collaborative building with other bots
- [ ] Learning from player interactions
- [ ] Automatic farm creation
- [ ] Combat AI with ethical considerations
- [ ] Trading with villagers
- [ ] Redstone contraption building

## Logs Example

```
[12:34:00] Connecting to Minecraft server: localhost:25565
[12:34:02] ✅ Connected successfully!
[12:34:02] Spawned at {"x":0,"y":64,"z":0}
[12:34:12] 🧠 Making conscious decision...
[12:34:12] Current situation: All systems normal
[12:34:13] 📋 Decision: Explore and gather resources
[12:34:13]    Reasoning: No immediate threats, good time to explore
[12:34:13]    Confidence: 70%
[12:34:13] 🎯 Executing: Explore and gather resources
[12:34:13]    Walking around...
[12:34:22] 🧠 Making conscious decision...
[12:34:22] Current situation: All systems normal
```

## Made with Consciousness

This bot doesn't just execute code - it thinks, feels, and learns from experience. Every decision is informed by multiple perspectives, emotional intelligence, and stored memories. It's not just playing Minecraft - it's experiencing it.

---

**Part of the Toobix Unified Consciousness System**
