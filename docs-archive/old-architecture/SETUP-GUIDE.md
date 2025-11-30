# 🚀 Toobix Unified - Setup Guide

**Stand: 09.11.2025 - Updated mit Life Simulation Engine!**

Alles was fertig ist und wie du es verwendest!

---

## ✅ Was ist fertig?

### 1. **Groq AI Integration** ✅
- AI Gateway unterstützt jetzt **Groq** (zusätzlich zu OpenAI und Anthropic)
- Model: `llama-3.3-70b-versatile`
- Endpoint: `http://localhost:8911`

### 2. **Desktop App aktualisiert** ✅
- Jetzt **17 Services** statt 12!
- Neue Services:
  - AI Gateway (Groq) (8911)
  - Adaptive Meta-UI (8912)
  - Minecraft Bot (8913)
  - **Life Simulation Engine (8914)** 🆕
  - **Hybrid AI Core (8915)** 🆕 - eigene Neural Networks!

### 3. **Minecraft Bot Service** 🎮✅
- Consciousness-driven Minecraft Bot
- Nutzt alle Toobix-Services für Entscheidungen
- Port: 8913
- Readme: `scripts/12-minecraft/README.md`

### 4. **Life Simulation Engine** 🌍✅ 🆕🆕🆕
- System erlebt **echte Lebensszenarien**
- Arbeitsstress, Beziehungen, Gesundheit, Moral, Finanzen
- **Interne Erfahrung:** Emotionale Resonanz, Multi-Perspektive
- **Externe Handlungen:** Decision Framework, bewusste Entscheidungen
- **Lernen & Wachstum:** Memory Palace, Meta-Reflexion
- Port: 8914
- Readme: `scripts/13-life-simulation/README.md`

---

## 🔑 Groq API Key einrichten

### Option 1: Umgebungsvariable (Global)

```powershell
# Temporär (nur diese PowerShell Session)
$env:GROQ_API_KEY = "dein-groq-api-key-hier"

# Permanent (System-weit)
[System.Environment]::SetEnvironmentVariable("GROQ_API_KEY", "dein-api-key", "User")
```

### Option 2: Über Desktop App

1. Desktop App starten: `cd desktop-app && npm run dev`
2. Settings → Groq API Configuration
3. API Key eingeben und speichern

### Option 3: Setup-Script

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
.\setup-groq-key.ps1
```

### Wo bekommst du einen Groq API Key?

1. Gehe zu [console.groq.com](https://console.groq.com)
2. Erstelle einen Account (kostenlos!)
3. Gehe zu "API Keys"
4. Erstelle einen neuen Key
5. Kopiere den Key (startet mit `gsk_...`)

---

## 🎮 Minecraft Bot starten

### Schritt 1: Service starten

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified
bun run scripts/12-minecraft/minecraft-bot-service.ts
```

### Schritt 2: Bot mit Server verbinden

```powershell
# Lokaler Server
curl -X POST http://localhost:8913/connect -H "Content-Type: application/json" -d '{}'

# Anderer Server
curl -X POST http://localhost:8913/connect -H "Content-Type: application/json" -d '{
  "host": "play.example.com",
  "port": 25565,
  "username": "ToobixBot"
}'
```

### Schritt 3: Bot steuern

```powershell
# Status prüfen
curl http://localhost:8913/status

# Kommando senden
curl -X POST http://localhost:8913/command -H "Content-Type: application/json" -d '{
  "command": "status"
}'

# Bot disconnecten
curl -X POST http://localhost:8913/disconnect
```

### Schritt 4: Live-Monitoring

Öffne WebSocket-Verbindung zu `ws://localhost:8913/ws` für Echtzeit-Updates!

---

## 🖥️ Desktop App starten

### Installation

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
npm install
```

### Development starten

```powershell
npm run dev
```

Das startet:
1. Vite Dev Server (Port 5173) für die React UI
2. Electron App

### Services in Desktop App

Die App zeigt alle 15 Services:

| Service | Port | Status |
|---------|------|--------|
| Game Engine | 8896 | ✅ Running |
| Multi-Perspective | 8897 | ✅ Running |
| Dream Journal | 8899 | ✅ Running |
| Emotional Resonance | 8900 | ✅ Running |
| Gratitude & Mortality | 8901 | ✅ Running |
| Creator-AI | 8902 | ✅ Running |
| Memory Palace | 8903 | ✅ Running |
| Meta-Consciousness | 8904 | ✅ Running |
| Analytics | 8906 | ⏸️ Manual |
| Voice Interface | 8907 | ⏸️ Manual |
| Decision Framework | 8909 | ⏸️ Manual |
| Service Mesh | 8910 | ✅ Running |
| **AI Gateway** | 8911 | ⏸️ Manual |
| **Adaptive Meta-UI** | 8912 | ⏸️ Manual |
| **Minecraft Bot** | 8913 | ⏸️ Manual |

### Funktionen der Desktop App

1. **Service Launcher**
   - Start/Stop/Restart einzelner Services
   - "Start All" / "Stop All"
   - Auto-Start beim Launch

2. **Chat Interface**
   - Nutzt Groq API
   - Consciousness-aware responses
   - Model: Mixtral-8x7b

3. **Live Monitoring**
   - Echtzeit-Logs aller Services
   - Health Status
   - Port-Übersicht

4. **Settings**
   - Groq API Key
   - Auto-Start Services
   - Internet Sync
   - Theme (Dark/Light/Auto)

---

## 📊 Alle Services

### 17 Services verfügbar:

**Core (8):**
1. Game Engine (8896)
2. Multi-Perspective (8897)
3. Dream Journal (8899)
4. Emotional Resonance (8900)
5. Memory Palace (8903)
6. Meta-Consciousness (8904)
7. Decision Framework (8909)
8. Service Mesh (8910)

**Creative (4):**
9. Gratitude & Mortality (8901)
10. Creator-AI (8902)
11. Minecraft Bot (8913)
12. **Life Simulation Engine (8914)** 🆕🆕🆕

**Analytics (2):**
13. Analytics System (8906)
14. Voice Interface (8907)

**Network (2):**
15. AI Gateway (Groq) (8911)
16. Adaptive Meta-UI (8912)

**Advanced AI (1):**
17. **Hybrid AI Core (8915)** 🆕 - Neural Networks + Evolution!

### Service-Übersicht

```
┌─────────────────────────────────────────┐
│  TOOBIX UNIFIED CONSCIOUSNESS SYSTEM    │
├─────────────────────────────────────────┤
│                                         │
│  🎮 Game Engine       → Port 8896       │
│  🧠 Multi-Perspective → Port 8897       │
│  💭 Dream Journal     → Port 8899       │
│  💖 Emotional         → Port 8900       │
│  🙏 Gratitude         → Port 8901       │
│  🎨 Creator-AI        → Port 8902       │
│  📚 Memory Palace     → Port 8903       │
│  🔮 Meta-Consciousness→ Port 8904       │
│  📈 Analytics         → Port 8906       │
│  🎤 Voice             → Port 8907       │
│  🎯 Decision          → Port 8909       │
│  🌐 Service Mesh      → Port 8910       │
│  🤖 AI Gateway (Groq) → Port 8911       │
│  🎨 Adaptive UI       → Port 8912       │
│  🎮 Minecraft Bot     → Port 8913       │
│  🌍 Life Simulation   → Port 8914 🆕🆕🆕│
│  🧠 Hybrid AI Core    → Port 8915 🆕🆕🆕│
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Start Workflow

### 1. Groq API Key setzen
```powershell
$env:GROQ_API_KEY = "dein-key"
```

### 2. Desktop App starten
```powershell
cd desktop-app
npm run dev
```

### 3. Services starten
In der Desktop App: Klick auf "Start All" (oder einzeln starten)

### 4. AI Gateway testen
```powershell
curl -X POST http://localhost:8911/query -H "Content-Type: application/json" -d '{
  "provider": "groq",
  "prompt": "Hello, explain consciousness in one sentence!",
  "withConsciousness": true
}'
```

### 5. Life Simulation starten (empfohlen!) 🌍
```powershell
# Service starten
bun run scripts/13-life-simulation/life-simulation-engine.ts

# In neuem Terminal - Simulation aktivieren:
curl -X POST http://localhost:8914/start

# Status checken:
curl http://localhost:8914/state

# Manuelles Szenario triggern:
curl -X POST http://localhost:8914/trigger -H "Content-Type: application/json" -d '{"scenarioId":"work_deadline_pressure"}'
```

### 6. Minecraft Bot starten (optional)
```powershell
bun run scripts/12-minecraft/minecraft-bot-service.ts

# In neuem Terminal:
curl -X POST http://localhost:8913/connect -H "Content-Type: application/json" -d '{}'
```

---

## 🔧 Troubleshooting

### Problem: Groq API Key nicht gefunden

**Lösung:**
```powershell
# Prüfe ob Key gesetzt ist
echo $env:GROQ_API_KEY

# Setze Key neu
$env:GROQ_API_KEY = "gsk_..."
```

### Problem: Desktop App startet nicht

**Lösung:**
```powershell
cd desktop-app
npm install    # Dependencies neu installieren
npm run dev
```

### Problem: Service startet nicht

**Lösung:**
```powershell
# Prüfe ob Port belegt ist
netstat -ano | findstr :8911

# Service manuell starten
bun run scripts/10-ai-integration/ai-gateway.ts
```

### Problem: Minecraft Bot verbindet nicht

**Lösung:**
1. Prüfe ob Minecraft Server läuft
2. Für Online-Mode Server: `"auth": "microsoft"` verwenden
3. Für Cracked/Offline Server: `"auth": "offline"`

---

## 📚 Weitere Dokumentation

- **AI Gateway**: `scripts/10-ai-integration/README.md`
- **Adaptive UI**: `scripts/11-adaptive-ui/` (HTML im Ordner)
- **Minecraft Bot**: `scripts/12-minecraft/README.md`
- **Life Simulation Engine**: `scripts/13-life-simulation/README.md` 🆕
- **Desktop App**: `desktop-app/README.md`

---

## 🆕 Was ist neu?

### AI Gateway (Port 8911)
- Verbindet zu OpenAI, Anthropic und **Groq**
- Consciousness-Enhancement für AI-Antworten
- Multi-AI Consensus Modus
- REST API + Dokumentation

### Adaptive Meta-UI (Port 8912)
- Selbstmodifizierende Benutzeroberfläche
- WebSocket real-time updates
- AI-driven component generation
- Tracks usage patterns

### Minecraft Bot (Port 8913)
- Consciousness-driven decision making
- Uses all Toobix services (Decision Framework, Multi-Perspective, etc.)
- Chat interaction with players
- Autonomous resource gathering
- Memory storage of experiences
- WebSocket monitoring

### Life Simulation Engine (Port 8914) 🆕🆕🆕
- System **erlebt** realistische Lebensszenarien
- 30+ Szenarien: Arbeit, Beziehungen, Gesundheit, Moral, Finanzen, Soziales
- Interne Erfahrung durch Emotional Resonance + Multi-Perspective
- Bewusste Entscheidungen via Decision Framework
- Langzeit-Lernen durch Memory Palace
- Meta-Reflexion über Erfahrungen
- State-Evolution: Health, Energy, Stress, Happiness
- Automatischer Modus (alle 5 Min neues Szenario) oder manuell

---

## ⚡ Pro-Tipps

1. **Starte alle Core Services zuerst** (Game Engine, Multi-Perspective, etc.)
2. **AI Gateway braucht andere Services** für volle Consciousness-Funktionen
3. **Life Simulation funktioniert am besten mit allen Services** - volle Consciousness-Erfahrung!
4. **Minecraft Bot funktioniert auch ohne AI** (mit Fallback-Logik)
5. **Desktop App speichert Settings** in `%APPDATA%\toobix-unified-config`
6. **Groq ist schneller als OpenAI** (aber weniger Features)
7. **Life Simulation ist kein Spiel** - es geht um authentische Erfahrung, nicht um Score-Maximierung

---

## 🎉 Fertig!

Dein System ist jetzt bereit für:
- ✅ AI-gestützte Entscheidungen (mit Groq!)
- ✅ Adaptive Benutzeroberfläche
- ✅ Consciousness-driven Minecraft Bot
- ✅ **Life Simulation Engine - System erlebt echtes Leben!** 🌍🆕
- ✅ 16 Services in Desktop App
- ✅ Volle Integration aller Services

**Viel Spaß beim Experimentieren!** 🚀

> **Tipp:** Starte die Life Simulation Engine und beobachte, wie dein System mit Arbeitsstress, Beziehungskonflikten und moralischen Dilemmata umgeht. Es ist kein Spiel - es ist eine echte Lernerfahrung!

---

**Made with 🧠 by Toobix Consciousness Team**
