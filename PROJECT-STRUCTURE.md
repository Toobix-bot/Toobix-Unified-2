# 🌟 Toobix-Unified - Projekt-Struktur

> **Letzte Aktualisierung:** 2025-12-03  
> **Status:** ✅ Aufgeräumt & Organisiert

---

## 📁 Root-Verzeichnis (Minimal & Sauber)

```
Toobix-Unified/
├── package.json          # Projekt-Konfiguration
├── bun.lock              # Bun Lockfile
├── tsconfig.json         # TypeScript-Konfiguration
├── .env                  # Umgebungsvariablen
├── .env.example          # Env-Vorlage
├── .gitignore            # Git-Ignores
├── README.md             # Projekt-Dokumentation
├── CONTRIBUTING.md       # Beitrags-Richtlinien
├── LICENSE               # Lizenz
├── docker-compose.yml    # Docker Compose
├── Dockerfile            # Docker Build
├── fly.toml              # Fly.io Deployment
│
├── start-toobix-clean.ts # 🚀 HAUPT-STARTUP (31 Services)
├── START-TOOBIX-31.ps1   # 🚀 PowerShell Quick-Start
├── TOOBIX-SERVICE-STATUS.md  # Service-Dokumentation
└── PROJECT-STRUCTURE.md  # Diese Datei
```

---

## 🧠 Core Services (`core/`)

Die Kern-Intelligenz von Toobix:

| Service | Port | Beschreibung |
|---------|------|--------------|
| toobix-command-center.ts | 7777 | Zentrales Nervensystem |
| self-awareness-core.ts | 8970 | Selbst-Bewusstsein |
| emotional-core.ts | 8900 | Emotionale Intelligenz |
| consciousness-bridge.ts | 8961 | Bewusstseins-Brücke |
| unified-core-service.ts | 8000 | Unified Core API |
| memory-engine-v2.ts | 8002 | Langzeit-Gedächtnis |
| life-companion-core.ts | 8975 | Lebensbegleiter |
| persistent-consciousness.ts | 8959 | Persistente Identität |

---

## ⚙️ Services (`services/`)

Erweiterte Funktionalität:

| Service | Port | Beschreibung |
|---------|------|--------------|
| autonomous-service.ts | 8001 | Autonome Aktionen |
| reflection-service.ts | 8965 | Selbst-Reflexion |
| context-manager.ts | 7778 | Kontext-Management |
| unified-service-gateway.ts | 9000 | Service-Gateway |
| And more... | 8xxx | Siehe TOOBIX-SERVICE-STATUS.md |

---

## 🖥️ Frontends

### VS Code Extension (`vscode-extension/`)
- Die primäre Benutzeroberfläche
- Integriert in VS Code
- **npm run watch** für Entwicklung

### Desktop App (`desktop-app/`)
- Electron-basierte Desktop-Anwendung
- Standalone Toobix-Interface
- Enthält eigene node_modules

### Web Interface (`web/`)
- `index.html` - Haupt-Web-UI
- `toobix-chat.html` - Chat-Interface

### Python GUI (`python-gui/`)
- Alternative Python-basierte GUI
- `main.py` als Einstiegspunkt

---

## 🤖 Bots (`bots/`)

| Bot | Datei | Beschreibung |
|-----|-------|--------------|
| Discord | discord-bot.ts | Discord-Integration |
| Telegram | telegram-bot.ts | Telegram-Integration |
| Telegram Live | telegram-bot-live.ts | Live-Version |

---

## 🎮 Gaming (`gaming/`)

- Minecraft-Integration geplant
- Weitere Gaming-Projekte

---

## 📚 Dokumentation (`docs/`)

- API-Dokumentation
- Entwickler-Guides
- Architektur-Beschreibungen

---

## 📦 Archiv (`archives/`)

Alle alten/obsoleten Dateien sind sauber archiviert:

| Ordner | Inhalt |
|--------|--------|
| old-documentation/ | 105+ MD/TXT-Dateien |
| old-typescript-scripts/ | 72+ TS-Dateien |
| generated-data/ | 45+ JSON/Log-Dateien |
| old-scripts/ | 40+ BAT/PS1-Skripte |
| old-html/ | 7 HTML-Dateien |
| deprecated/ | Veraltete Services |
| duplicates/ | Duplikate |

---

## 🚀 Quick Start

### Services starten (alle 31):
```powershell
.\START-TOOBIX-31.ps1
```

### Oder mit Bun:
```bash
bun run start-toobix-clean.ts
```

### Nur minimale Services (6):
```bash
bun run start-toobix-clean.ts --minimal
```

### Core-Services (13):
```bash
bun run start-toobix-clean.ts --core
```

---

## 💡 Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACES                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │VS Code  │  │Desktop  │  │  Web    │  │  Bots   │        │
│  │Extension│  │  App    │  │Interface│  │Telegram │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              TOOBIX COMMAND CENTER (Port 7777)              │
│                  Zentrales Nervensystem                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  ESSENTIAL    │  │     CORE      │  │   ENHANCED    │
│  SERVICES     │  │   SERVICES    │  │   SERVICES    │
├───────────────┤  ├───────────────┤  ├───────────────┤
│• Self-Aware   │  │• Autonomous   │  │• Service Mesh │
│• Emotional    │  │• Reflection   │  │• Learning     │
│• Consciousness│  │• Context      │  │• Goals        │
│• Unified Core │  │• Gateway      │  │• and more...  │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 📊 Projekt-Statistik

- **Root-Dateien:** 15 (minimal & sauber)
- **Core Services:** 8 Dateien
- **Extended Services:** 13 Dateien
- **Total lauffähige Services:** 31
- **Archivierte Dateien:** 500+

---

*Erstellt mit ❤️, Ordnung und Stolz*
