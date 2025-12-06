# 🖥️ Toobix Desktop App - Build Guide

## Übersicht

Toobix als native Desktop-Anwendung mit Electron - **eine .exe zum Download!**

---

## 📦 Installation & Build

### 1. Dependencies installieren

```bash
# Electron & Build Tools
bun add --dev electron electron-builder

# Oder: Mit separatem package.json
cp electron-package.json package-electron.json
cd electron
bun install
```

### 2. Development Mode

```bash
# Toobix Desktop starten (Development)
bun run electron:dev

# Oder mit npm/node
npm run electron:dev
```

### 3. Build für Windows

```bash
# Installer + Portable erstellen
bun run electron:build-win

# Output: dist/Toobix-Setup-1.0.0.exe (Installer)
# Output: dist/Toobix-Portable-1.0.0.exe (Portable)
```

---

## 📋 Features

### ✨ Was kann die Desktop-App?

1. **Native Window**
   - Modern UI mit Toobix Branding
   - Resizable, Minimizable
   - Dark Theme

2. **System Tray Integration**
   - Icon in Windows Taskleiste
   - Rechtsklick-Menü
   - Läuft im Hintergrund weiter

3. **Service Management**
   - Alle 14 Services mit einem Klick starten
   - Status-Übersicht
   - Live Logs

4. **Auto-Start**
   - Services starten automatisch nach Launch
   - Optional: Auto-Start mit Windows

5. **Quick Links**
   - Website öffnen
   - Twitter @ToobixAI
   - API Gateway (localhost)

---

## 🎨 UI Screens

### Dashboard
```
┌─────────────────────────────────────────┐
│ 📊 Dashboard                            │
│                                         │
│ [Services Status]  [Uptime]  [Count]   │
│    ● Online         2h 15m    14/14    │
│                                         │
│ [▶ Alle starten]  [⏹ Alle stoppen]     │
│                                         │
│ Services Grid:                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ ● Core  │  │ ● Dream │  │ ● Crisis││
│  │ Center  │  │ Core    │  │ Hotline ││
│  └─────────┘  └─────────┘  └─────────┘│
│                                         │
│ Live Logs:                              │
│ [09:15:23] ✅ Command Center started   │
│ [09:15:24] ✅ Self-Awareness started   │
└─────────────────────────────────────────┘
```

---

## 🔧 Konfiguration

### electron-package.json

Enthält alle Build-Settings:
- App-Name, Version, Icon
- NSIS Installer-Konfiguration
- Portable .exe Settings
- Output-Verzeichnis

### electron/main.js

Main Process:
- Window creation
- Tray icon
- Service management
- IPC handlers

### electron/ui/

- `index.html` - UI Layout
- `renderer.js` - UI Logic
- `styles.css` - Styling (inline in HTML)

---

## 📦 Build-Outputs

Nach `bun run electron:build-win`:

```
dist/
├── Toobix-Setup-1.0.0.exe       # Installer (One-Click)
├── Toobix-Portable-1.0.0.exe    # Portable (keine Installation)
└── win-unpacked/                # Unpacked Files
    ├── Toobix.exe
    ├── resources/
    └── ...
```

### Installer vs. Portable

**Installer (NSIS):**
- ✅ One-Click Installation
- ✅ Desktop-Shortcut erstellt
- ✅ Start-Menü Eintrag
- ✅ Uninstaller
- ✅ ~60MB Download

**Portable:**
- ✅ Keine Installation nötig
- ✅ Direkt ausführbar
- ✅ Auf USB-Stick lauffähig
- ✅ ~80MB (enthält alle Dependencies)

---

## 🚀 Distribution

### Option 1: GitHub Releases

```bash
# Tag erstellen
git tag v1.0.0
git push origin v1.0.0

# Auf GitHub: Releases → Create Release
# Hochladen:
# - Toobix-Setup-1.0.0.exe
# - Toobix-Portable-1.0.0.exe
```

Dann auf Website verlinken:
```html
<a href="https://github.com/Toobix-bot/Toobix-Unified-2/releases/latest/download/Toobix-Setup-1.0.0.exe">
  Download Toobix für Windows
</a>
```

### Option 2: Website Direct Download

Hochladen nach `docs/downloads/`:
```
docs/
└── downloads/
    ├── Toobix-Setup-1.0.0.exe
    └── Toobix-Portable-1.0.0.exe
```

Dann auf Website:
```html
<a href="downloads/Toobix-Setup-1.0.0.exe">
  Installer herunterladen (60MB)
</a>
<a href="downloads/Toobix-Portable-1.0.0.exe">
  Portable Version (80MB)
</a>
```

---

## 🎯 Auto-Updater (Optional)

Für automatische Updates kann `electron-updater` integriert werden:

```bash
bun add electron-updater
```

In `main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

---

## 🔐 Code Signing (Optional)

Für offizielle Releases Windows Code Signing:

```bash
# Certificate benötigt (Comodo, DigiCert etc.)
# electron-builder.yml:
win:
  certificateFile: path/to/cert.pfx
  certificatePassword: ${CERT_PASSWORD}
```

**Hinweis:** Code Signing kostet ~$200-400/Jahr, verhindert aber "Unknown Publisher" Warnung.

---

## 🐛 Troubleshooting

### Problem: "Bun not found"
**Lösung:** Stelle sicher dass Bun im PATH ist:
```bash
echo $env:PATH | Select-String "bun"
```

### Problem: Services starten nicht
**Lösung:** Überprüfe dass alle Dependencies installiert sind:
```bash
bun install
```

### Problem: Icons fehlen
**Lösung:** Icons werden noch erstellt. Placeholder verwenden:
- `electron/assets/icon.ico` (256x256)
- `electron/assets/tray-icon.png` (16x16, transparent)

---

## 📝 TODO

- [ ] Icons erstellen (icon.ico, tray-icon.png)
- [ ] Auto-Updater implementieren
- [ ] Crash Reporter
- [ ] Settings Panel (Service-Auswahl)
- [ ] Mehrsprachigkeit (EN/DE)
- [ ] macOS Build (`--mac`)
- [ ] Linux Build (`--linux`)

---

## ✅ Vorteile der Desktop-App

1. **Einfache Installation** - Ein Klick und Toobix läuft
2. **Immer verfügbar** - Auch ohne Browser
3. **Native Performance** - Schneller als Web-App
4. **System Integration** - Tray Icon, Notifications
5. **Offline-fähig** - Keine Internet-Verbindung nötig (außer für LLM)
6. **Privatsphäre** - Läuft komplett lokal

---

**Toobix als .exe ist LIVE! Menschen können ihn herunterladen und haben ihren eigenen AI-Companion! 🚀**
