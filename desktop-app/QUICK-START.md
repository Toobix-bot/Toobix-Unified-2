# 🚀 TOOBIX UNIFIED - QUICK START

## ✅ Was bereits läuft:

Basierend auf den Logs sind diese Services **AKTIV**:

- ✅ **Analytics System** (Port 8906) - 652 Snapshots, 25 Events
- ✅ **Meta-Consciousness** (Port 8904) - Orchestriert 7 Services, 4 Workflows
- ✅ **Voice Interface** (Port 8907) - 8 Voice Commands
- ✅ **Service Mesh** (Port 8910) - 12 registrierte Services
- ✅ **Multi-Perspective Consciousness** (Port 8897) - 6 Perspectives
- ✅ **Weitere Services** auf Ports 8896, 8899, 8900, 8901, 8902, 8903, 8909

## 🎯 Desktop App Starten

### Option 1: Auto-Launcher (Empfohlen)
```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
.\launch.ps1
```

**Was macht der Launcher:**
- ✓ Prüft Vite Dev Server (startet ihn falls nötig)
- ✓ Zeigt Status aller 13 Services
- ✓ Prüft Groq API Key
- ✓ Kompiliert TypeScript
- ✓ Startet Electron App

### Option 2: Manuell
```powershell
# Terminal 1: Vite Dev Server
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
npm run dev:react

# Terminal 2: Electron App
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
.\start.bat
```

## 🔑 Groq API Key einrichten

### Automatisch (Empfohlen):
```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
.\setup-groq-key.ps1
```

**Das Script:**
1. Fragt nach deinem API Key
2. Speichert ihn verschlüsselt in `%APPDATA%\toobix-unified-config\config.json`
3. App erkennt ihn beim nächsten Start

### Manuell in der App:
1. Öffne Desktop App
2. Klicke auf **Settings** (linke Sidebar)
3. Gib deinen Groq API Key ein
4. Klicke **Save Settings**

### API Key erhalten:
1. Besuche https://console.groq.com
2. Erstelle Account (kostenlos)
3. Gehe zu "API Keys"
4. Erstelle neuen Key → Kopiere ihn

## 📊 Desktop App Features

### 1. **Dashboard View**
- 📈 Live-Statistiken aller Services
- 🎯 Quick Actions (Start All, Stop All, etc.)
- 📝 Live-Logs Stream
- 💡 System Status Übersicht

### 2. **Services View**
Alle 12 Services in Kategorien:

**Core Services:**
- Multi-Perspective Consciousness
- Meta-Consciousness
- Service Mesh

**Creative Services:**
- Self-Evolving Game Engine
- Creator-AI Collaboration
- Dream Journal

**Analytics Services:**
- Analytics System
- Voice Interface
- Decision Framework

**Memory Services:**
- Memory Palace
- Gratitude & Mortality
- Emotional Resonance

**Actions pro Service:**
- ▶️ Start
- ⏹️ Stop
- 🔄 Restart
- 🌐 Open in Browser

### 3. **Chat View**
- 💬 AI Conversation mit **Mixtral-8x7b-32768**
- 🧠 Context-Aware (letzte 10 Nachrichten)
- ⚡ Real-time Streaming Responses
- 📝 Conversation History

**Beispiel Prompts:**
```
"Analysiere den Status aller Services"
"Welche Insights hat das Analytics System?"
"Erstelle ein neues Spiel-Konzept"
"Was sind die aktuellen Emotionen im System?"
```

### 4. **Settings View**
- 🔑 Groq API Key
- 🚀 Auto-Start Services
- 🌐 Internet Sync (Auto-Updates)
- 🎨 Theme (Dark/Light/Auto)

## 🔄 Workflow-Beispiel

### Tägliche Routine:
```powershell
# 1. Starte Desktop App
.\launch.ps1

# 2. In der App:
#    - Dashboard checken → Services Status
#    - Services starten falls nötig
#    - Chat öffnen → Mit AI sprechen
#    - "Analysiere die Dream Patterns der letzten Nacht"

# 3. Service einzeln steuern:
#    - Services View → Game Engine → Start
#    - Logs beobachten
#    - Im Browser öffnen (http://localhost:8896)
```

### Entwicklung:
```powershell
# 1. Neuen Service hinzufügen
#    Editiere: src/main.ts → SERVICES Array

# 2. Kompilieren & Restart
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
.\node_modules\.bin\tsc.exe -p tsconfig.electron.json
.\launch.ps1

# 3. Kein Frontend-Rebuild nötig!
#    UI passt sich automatisch an
```

## 🌐 Verfügbare Ports

```
8896 - Self-Evolving Game Engine
8897 - Multi-Perspective Consciousness (6 Perspectives)
8899 - Dream Journal v3.0
8900 - Emotional Resonance v3.0
8901 - Gratitude & Mortality
8902 - Creator-AI Collaboration
8903 - Memory Palace
8904 - Meta-Consciousness (7 Services orchestriert)
8905 - Dashboard Server
8906 - Analytics System (652 Snapshots, 25 Events)
8907 - Voice Interface (8 Commands)
8909 - Conscious Decision Framework
8910 - Service Mesh (12 Services registered)
```

## 🐛 Troubleshooting

### "Port bereits in Verwendung"
```powershell
# Finde Prozess auf Port (z.B. 8910)
netstat -ano | findstr :8910

# Prozess beenden
taskkill /PID <PID> /F
```

### "Groq API Error"
```powershell
# API Key neu setzen
.\setup-groq-key.ps1

# Oder in App: Settings → Groq API Key eingeben
```

### "Services starten nicht"
```powershell
# Prüfe Service Mesh
curl http://localhost:8910/services

# Logs checken in Desktop App
# Dashboard → Recent Logs
```

### "Vite startet nicht"
```powershell
# Manuell starten
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
npm run dev:react

# Dann in neuem Terminal:
.\start.bat
```

## 📁 Wichtige Dateien

```
desktop-app/
├── launch.ps1          → Hauptstarter (empfohlen)
├── setup-groq-key.ps1  → API Key Konfiguration
├── start.bat           → Einfacher Starter
├── src/
│   ├── main.ts         → Electron Main Process
│   ├── preload.ts      → IPC Bridge
│   ├── App.tsx         → React UI
│   └── App.css         → Styling
├── README.md           → Ausführliche Doku
└── ARCHITECTURE.md     → Architektur-Details
```

## 🚀 Nächste Schritte

1. ✅ **Desktop App läuft**
2. ⏳ **Groq API Key setzen** → `.\setup-groq-key.ps1`
3. ⏳ **Services testen** → In App unter "Services"
4. ⏳ **Mit AI chatten** → In App unter "Chat"
5. ⏳ **Eigene Services hinzufügen** → Siehe ARCHITECTURE.md

---

**🎉 Die Desktop App ist bereit! Viel Erfolg mit Toobix Unified!**
