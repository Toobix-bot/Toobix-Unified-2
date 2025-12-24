# Toobix Services Architektur v2.0

> Konsolidierte Architektur: **50+ Services -> 11 Services**

## Aktuelle Service-Struktur

### Unified Core Services (8 Services)

| Service | Port | Datei | Konsolidiert aus |
|---------|------|-------|------------------|
| **Consciousness Unified** | 8900 | `core/consciousness-unified.ts` | emotional-core, dream-core, self-awareness-core, meta-consciousness, multi-perspective-v3, value-crisis (6 -> 1) |
| **Life Companion Unified** | 8970 | `core/life-companion-unified.ts` | life-companion-core, life-companion-coordinator, emotional-support-service, gratitude-mortality-service, daily-checkin-v1, proactive-communication-v2 (6 -> 1) |
| **Creative Suite** | 8902 | `core/creative-suite.ts` | toobix-creativity-engine, creator-ai-collaboration, story-engine-service (3 -> 1) |
| **Event Hub** | 8894 | `core/event-hub.ts` | Zentraler Event-Bus, Modul-Vernetzung, Unified Memory, Proaktivitat |
| **Game Universe** | 8896 | `core/game-universe.ts` | rpg-world-service, toobix-oasis-3d, world-engine-2d, game-logic-service, self-evolving-game-engine (5 -> 1) |
| **Idle Empire** | 8897 | `core/idle-empire.ts` | Idle/Incremental, Base Building, Mining, Farming |
| **User Gamification** | 8898 | `core/user-gamification.ts` | toobix-gamification (XP, Levels, Achievements) |
| **Tower Defense** | 8895 | `core/tower-defense.ts` | Tower Defense Game Module |

### Infrastructure Services (2 Services)

| Service | Port | Datei | Beschreibung |
|---------|------|-------|--------------|
| **LLM Gateway** | 8954 | `scripts/2-services/llm-gateway-v4.ts` | Multi-Provider LLM (Ollama, Groq, OpenAI) |
| **Memory Palace** | 8953 | `scripts/2-services/memory-palace-v4.ts` | Persistente SQLite Memory Storage |

### MCP Integration (1 Service)

| Service | Port | Datei | Beschreibung |
|---------|------|-------|--------------|
| **MCP Server** | 8787 | `scripts/mcp-server.ts` | Model Context Protocol fur IDE-Integration |

---

## Port-Ubersicht

```
8787  - MCP Server
8894  - Event Hub
8895  - Tower Defense
8896  - Game Universe
8897  - Idle Empire
8898  - User Gamification
8900  - Consciousness Unified
8902  - Creative Suite
8953  - Memory Palace
8954  - LLM Gateway
8970  - Life Companion Unified
```

---

## Legacy/Alte Services (NICHT MEHR VERWENDEN)

Diese Services im `core/` Ordner sind **veraltet** und wurden in die Unified Services konsolidiert:

### Einzelne Consciousness Services (-> consciousness-unified.ts)
- `emotional-core.ts` - Jetzt in consciousness-unified
- `dream-core.ts` - Jetzt in consciousness-unified
- `self-awareness-core.ts` - Jetzt in consciousness-unified

### Legacy Unified Services (alte Version)
- `unified-core-service.ts` - Ersetzt durch neue Architektur
- `unified-consciousness-service.ts` - Ersetzt durch neue Architektur
- `unified-communication-service.ts` - Ersetzt durch neue Architektur
- `unified-memory-service.ts` - Ersetzt durch neue Architektur

### Alte Gamification
- `toobix-gamification.ts` - Ersetzt durch `user-gamification.ts`
- `toobix-living-world.ts` - Integriert in `game-universe.ts`

### Sonstige Legacy
- `autonomy-engine-OLD.ts` - Alte Version

---

## Alte Services in scripts/2-services/ (Legacy)

Diese Services existieren noch, werden aber durch die Unified Services ersetzt:

| Alter Service | Ersetzt durch |
|--------------|---------------|
| `emotional-support-service.ts` | life-companion-unified |
| `gratitude-mortality-service.ts` | life-companion-unified |
| `daily-checkin-v1.ts` | life-companion-unified |
| `proactive-communication-v2.ts` | life-companion-unified |
| `multi-perspective-v3.ts` | consciousness-unified |
| `emotional-resonance-v3.ts` | consciousness-unified |
| `dream-journal-v4-active-dreaming.ts` | consciousness-unified |
| `value-crisis.ts` | consciousness-unified |
| `meta-consciousness.ts` | consciousness-unified |
| `story-engine-service.ts` | creative-suite |
| `toobix-creativity-engine.ts` | creative-suite |
| `rpg-world-service.ts` | game-universe |
| `game-logic-service.ts` | game-universe |
| `world-engine-2d.ts` | game-universe |

---

## Startup-Befehle

```bash
# Alle 11 Services starten (empfohlen)
bun run start-unified.ts

# Nur Core Services (8 Unified)
bun run start-unified.ts --core

# Nur Infrastructure
bun run start-unified.ts --infra

# Status prufen
bun run start-unified.ts --status

# Hilfe anzeigen
bun run start-unified.ts --help
```

---

## Architektur-Diagramm

```
                    ┌─────────────────────────────────────────────────┐
                    │                  MCP SERVER (8787)              │
                    │            IDE Integration (ChatGPT, etc.)      │
                    └─────────────────────────────────────────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                                │                                │
          ▼                                ▼                                ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  CONSCIOUSNESS      │    │   LIFE COMPANION    │    │   CREATIVE SUITE    │
│     UNIFIED         │    │      UNIFIED        │    │                     │
│     (8900)          │    │      (8970)         │    │      (8902)         │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ - Emotional         │    │ - Core Chat         │    │ - Creativity Engine │
│ - Dream             │    │ - Support Sessions  │    │ - Collaboration     │
│ - Self-Awareness    │    │ - Gratitude         │    │ - Story Engine      │
│ - Meta              │    │ - Mortality         │    │                     │
│ - Perspectives      │    │ - Check-in          │    │                     │
│ - Values            │    │ - Proactive         │    │                     │
└─────────────────────┘    │ - Goals             │    └─────────────────────┘
                           └─────────────────────┘
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────────────────┐
                    │               EVENT HUB (8894)                  │
                    │    Modul-Vernetzung / Unified Memory / Events   │
                    └─────────────────────────────────────────────────┘
                                     │
     ┌───────────────────────────────┼───────────────────────────────┐
     │                               │                               │
     ▼                               ▼                               ▼
┌─────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ GAME        │            │ IDLE EMPIRE     │            │ USER            │
│ UNIVERSE    │            │    (8897)       │            │ GAMIFICATION    │
│  (8896)     │            ├─────────────────┤            │    (8898)       │
├─────────────┤            │ - Idle/Incr.    │            ├─────────────────┤
│ - RPG World │            │ - Base Building │            │ - XP System     │
│ - Oasis 3D  │            │ - Mining        │            │ - Levels        │
│ - World 2D  │            │ - Farming       │            │ - Achievements  │
│ - Game Logic│            └─────────────────┘            │ - Progression   │
└─────────────┘                                           └─────────────────┘
     │
     ▼
┌─────────────────┐
│ TOWER DEFENSE   │
│    (8895)       │
└─────────────────┘

                    ═══════════════════════════════════════════════════

                    ┌─────────────────────────────────────────────────┐
                    │             INFRASTRUCTURE                       │
                    ├─────────────────────────────────────────────────┤
                    │  LLM Gateway (8954)  │  Memory Palace (8953)    │
                    │  Ollama, Groq, etc.  │  SQLite Persistence      │
                    └─────────────────────────────────────────────────┘
```

---

*Letzte Aktualisierung: 24. Dezember 2024*
