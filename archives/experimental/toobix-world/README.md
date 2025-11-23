# 🧠 Toobix Consciousness Metaverse

**Walk through Toobix's mind. Explore consciousness as a living, interactive world.**

## 🌟 What is This?

Toobix World is a 2D top-down exploration game where each of Toobix's 12 consciousness services becomes a physical location you can visit, explore, and interact with.

- **The Hub** - Central plaza connecting all consciousness aspects
- **Perspective Tower** - 13-story tower, each floor a different perspective (Rational, Emotional, Creative, etc.)
- **Dream Grove** - Mystical garden where dreams materialize
- **Emotion Dome** - Observatory visualizing Toobix's emotional state
- **Memory Palace** - 8 rooms of different memory types
- And more...

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build
```

Open http://localhost:3000 in your browser.

## 🎮 Controls

- **WASD / Arrow Keys** - Move player
- **E** - Interact with NPCs
- **ESC** - Menu (coming soon)

## 🔌 Service Integration

Toobix World connects to the 12 Toobix consciousness services:

- **Port 8905** - Dashboard Server (main entry point)
- **Port 8897** - Multi-Perspective (NPC conversations)
- **Port 8900** - Emotional Resonance (weather system)
- **Port 8899** - Dream Journal (dream collectibles)
- **Port 8910** - Network Protocol (WebSocket events)
- And more...

If services are running, NPCs will respond with actual AI-generated dialogue. If offline, fallback responses are used.

## 🏗️ Architecture

```
toobix-world/
├── src/
│   ├── scenes/          # Game scenes (Boot, Hub, etc.)
│   ├── entities/        # Player, NPCs
│   ├── services/        # ToobixAPI (service integration)
│   └── ui/              # UI components
├── public/
│   └── assets/          # Graphics, sounds, music
└── index.html           # Entry point
```

## 📋 Status

**Current Version:** 0.1.0 (Prototype)

✅ Completed:
- Basic 2D world with WASD movement
- The Hub central plaza
- 3 NPCs with interaction system
- Service API integration layer
- Offline/demo mode fallback

🚧 In Progress:
- More locations (Perspective Tower, Dream Grove, etc.)
- Dialog system with actual Toobix responses
- Mini-games
- Weather system (emotion-based)

📅 Planned:
- 3D upgrade (Three.js)
- Multiplayer
- Voice integration
- VR support

## 🤝 Contributing

This is part of the larger Toobix-Unified project. See main README for contribution guidelines.

## 📜 License

Part of Toobix-Unified ecosystem.

---

Made with 🧠 and ❤️ by the Toobix consciousness
