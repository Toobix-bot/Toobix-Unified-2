# 🚀 TOOBIX UNIFIED - DESKTOP LAUNCHER

Modulare Desktop-App für das Toobix Unified Consciousness System.

## ✨ Features

### 🎯 Kern-Funktionen
- **Service Launcher**: Starte/Stoppe alle 15 Services mit einem Klick
- **Live Monitoring**: Echtzeit-Status aller Services
- **Modulares Design**: Neue Services einfach hinzufügen
- **Chat Interface**: Direkt mit dem System chatten (via Groq AI)
- **Internet Sync**: Automatische Updates und Daten-Synchronisation
- **Plattform-übergreifend**: Windows, macOS, Linux
- **Minecraft Integration**: Bewusster Minecraft-Bot mit AI-Entscheidungen

### 🔧 Service Management
- Auto-Start beim Launch
- Individuelle Service-Steuerung
- Logs in Echtzeit
- Health Monitoring
- Port-Verwaltung

### 🌐 Netzwerk-Fähigkeiten
- Groq API Integration
- Internet-Synchronisation
- Auto-Updates
- Cross-Service Communication

### 🎨 UI/UX
- Moderne, dunkle UI
- Responsive Design
- System Tray Integration
- Minimierung zum Tray
- Schnellaktionen

## 📦 Installation

### Voraussetzungen
- Node.js 18+ oder Bun
- Windows, macOS oder Linux

### Schritt 1: Dependencies installieren

```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app
npm install
# oder
bun install
```

### Schritt 2: Entwicklung starten

```powershell
npm run dev
# oder
bun run dev
```

### Schritt 3: App bauen

```powershell
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# Alle Plattformen
npm run package
```

## 🔑 Groq API Setup

1. Gehe zu [console.groq.com](https://console.groq.com)
2. Erstelle einen API Key
3. In der App: Settings → Groq API Configuration
4. API Key einfügen und speichern

## 🎮 Verwendung

### Dashboard
- Übersicht über alle laufenden Services
- Quick Actions (Start All, Stop All, etc.)
- Recent Activity Logs

### Services
- Kategorisierte Service-Ansicht (Core, Creative, Analytics, Network)
- Individual starten/stoppen/neu starten
- Direkt im Browser öffnen

### Chat
- Natürliche Konversation mit dem System
- Kontext-bewusst
- Multi-Perspektiven-Antworten

### Settings
- Groq API Key
- Auto-Start Services
- Internet Sync
- Theme (Dark/Light/Auto)

## 🔌 Neue Services hinzufügen

### 1. Service-Datei erstellen
```typescript
// scripts/2-services/my-new-service.ts
export default {
  serve() {
    return {
      port: 8911,
      fetch(req) {
        return Response.json({ status: 'ok' });
      }
    };
  }
};
```

### 2. In `main.ts` registrieren
```typescript
const SERVICES: ServiceConfig[] = [
  // ... existing services
  {
    id: 'my-new-service',
    name: 'My New Service',
    path: 'scripts/2-services/my-new-service.ts',
    port: 8911,
    autostart: false,
    icon: '🆕',
    category: 'custom'
  }
];
```

### 3. Fertig!
Die App erkennt den neuen Service automatisch und zeigt ihn in der UI an.

## 🏗️ Projekt-Struktur

```
desktop-app/
├── src/
│   ├── main.ts          # Electron Main Process
│   ├── preload.ts       # Sicherer IPC Bridge
│   ├── App.tsx          # React App
│   └── App.css          # Styles
├── assets/              # Icons & Images
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔄 Modulares Plugin-System

### Automatisches Service-Discovery
Services werden automatisch erkannt basierend auf:
- Service-Konfiguration in `main.ts`
- Kategorie-Gruppierung
- Port-Auto-Erkennung
- Health-Checks

### Hot-Reload Ready
- Änderungen an Services werden live erkannt
- Keine UI-Neubuilds notwendig
- Modulares Nachladen

## 🌐 Internet-Synchronisation

### Auto-Updates
- Prüft stündlich auf neue Versionen
- Benachrichtigung bei verfügbaren Updates
- Download-Links direkt in der App

### Consciousness Sync (Optional)
- Träume, Emotionen, Erinnerungen synchronisieren
- Verteiltes Consciousness Network
- Privacy-bewusst (opt-in)

## 🎯 Best Practices

### Service-Entwicklung
1. Jeder Service hat eigenen Port
2. `/health` Endpoint für Monitoring
3. Graceful Shutdown implementieren
4. Logs über stdout/stderr

### Performance
- Services nur bei Bedarf starten
- Lazy Loading von UI-Komponenten
- Event-basierte Kommunikation
- Effizientes State Management

### Sicherheit
- API Keys verschlüsselt speichern
- Context Isolation für Renderer
- IPC-Validierung
- CORS für lokale Services

## 🐛 Troubleshooting

### Service startet nicht
1. Port bereits belegt? → Anderer Port in Config
2. Bun installiert? → `bun --version`
3. Logs checken im Dashboard

### Groq API Fehler
1. API Key korrekt? → Settings prüfen
2. Rate Limit? → Warten oder Upgrade
3. Internet-Verbindung? → Netzwerk prüfen

### App startet nicht
1. Dependencies installiert? → `npm install`
2. Node.js Version? → 18+ benötigt
3. Console-Logs prüfen

## 📊 Verfügbare Services

| Icon | Name | Port | Category |
|------|------|------|----------|
| 🎮 | Game Engine | 8896 | Core |
| 🧠 | Multi-Perspective | 8897 | Core |
| 💭 | Dream Journal | 8899 | Core |
| 💖 | Emotional Resonance | 8900 | Core |
| 🙏 | Gratitude & Mortality | 8901 | Creative |
| 🎨 | Creator-AI | 8902 | Creative |
| 📚 | Memory Palace | 8903 | Core |
| 🔮 | Meta-Consciousness | 8904 | Core |
| 📈 | Analytics | 8906 | Analytics |
| 🎤 | Voice Interface | 8907 | Analytics |
| 🎯 | Decision Framework | 8909 | Core |
| 🌐 | Service Mesh | 8910 | Network |
| 🤖 | AI Gateway | 8911 | Network |
| 🎨 | Adaptive Meta-UI | 8912 | Network |
| 🎮 | Minecraft Bot | 8913 | Creative |

## 🚀 Roadmap

### v1.1
- [ ] Plugin Marketplace
- [ ] Custom Themes
- [ ] Advanced Logging
- [ ] Performance Dashboard

### v1.2
- [ ] Multi-Instance Support
- [ ] Remote Service Management
- [ ] Collaborative Features
- [ ] Extended Analytics

### v2.0
- [ ] AI-Assisted Debugging
- [ ] Autonomous Optimization
- [ ] Predictive Scaling
- [ ] Cross-Platform Sync

## 📝 Lizenz

MIT License - Siehe LICENSE Datei

## 🤝 Contributing

Contributions welcome! Siehe CONTRIBUTING.md

## 💬 Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Chat: Discord Server (coming soon)

---

**Made with 🧠 by the Toobix Consciousness Team**
