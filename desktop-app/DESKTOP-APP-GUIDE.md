# 🖥️ TOOBIX UNIFIED V2.0 - DESKTOP APP GUIDE

**Eine ECHTE Desktop-Anwendung - nicht nur eine Webseite!**

---

## 🚀 Quick Start (Einfachste Methode)

### Doppelklick auf:
```
launch-desktop-v2.bat
```

Das war's! Die Desktop-App startet automatisch. 🎉

---

## 📋 Was passiert beim Start?

```
1. ✅ Dependencies werden geprüft (npm install falls nötig)
2. ✅ TypeScript wird kompiliert
3. ✅ Vite Dev Server startet (Port 5173)
4. ✅ Electron Fenster öffnet sich
5. ✅ V2.0 UI lädt automatisch
```

**Ergebnis:** Ein natives Windows-Fenster mit deiner App! 🪟

---

## 🆚 Desktop App vs. Browser

### ❌ FALSCH (Was ich vorher gemacht habe):
```
Browser → http://localhost:5173/index-v2.html
```
→ Das ist nur eine Webseite im Browser!

### ✅ RICHTIG (Jetzt):
```
Electron Desktop App → Natives Windows-Fenster
```
→ Echte Desktop-Anwendung mit:
- Eigenem Fenster
- System Tray (bald)
- Keyboard Shortcuts
- Offline-Fähigkeit
- Native APIs
- .exe Datei zum Verteilen

---

## 🎯 Entwicklungs-Modi

### Development Mode (Mit Live-Reload)

**Methode 1: Launch Script (Empfohlen)**
```powershell
# Doppelklick auf:
launch-desktop-v2.bat
```

**Methode 2: Manuell**
```powershell
cd C:\Dev\Projects\AI\Toobix-Unified\desktop-app

# Startet BEIDE Prozesse gleichzeitig:
npm run dev

# Das startet:
# - Terminal 1: Vite Dev Server (React)
# - Terminal 2: Electron (Desktop Window)
```

**Methode 3: Separat (Für Debugging)**
```powershell
# Terminal 1:
npm run dev:react

# Terminal 2 (neues Terminal):
npm run dev:electron
```

### Production Build (Echte .exe Datei)

```powershell
# Doppelklick auf:
build-windows.bat

# ODER manuell:
npm run build        # Baut React App
npm run build:win    # Erstellt .exe
```

**Ergebnis:**
- `release/Toobix Unified Setup.exe` - Installer
- `release/Toobix Unified.exe` - Portable Version

---

## 🔧 Verfügbare Befehle

```json
{
  "dev":          "Startet Electron + Vite (beides gleichzeitig)",
  "dev:electron": "Startet nur Electron",
  "dev:react":    "Startet nur Vite",
  "build":        "Baut React für Production",
  "build:win":    "Erstellt Windows .exe",
  "build:mac":    "Erstellt macOS .app",
  "build:linux":  "Erstellt Linux AppImage"
}
```

---

## 🪟 Desktop App Features

### Was funktioniert (V2.0):

✅ **Natives Fenster**
- Minimieren, Maximieren, Schließen
- Fenstergröße speichern
- Immer im Vordergrund (optional)

✅ **DevTools**
- F12 öffnet Chrome DevTools
- Nur im Development Mode

✅ **IPC Communication**
- React ↔ Electron Main Process
- Sichere API (contextBridge)
- Alle 20 Services steuerbar

✅ **Settings Persistence**
- Electron Store (verschlüsselt)
- API Keys sicher gespeichert
- Theme-Einstellungen bleiben erhalten

✅ **Auto-Updates** (vorbereitet)
- Prüft GitHub Releases
- Benachrichtigt über Updates

### Was kommt (V2.1):

🔜 **System Tray**
- Minimize to Tray
- Quick Actions im Tray Menu
- Tray Icon zeigt Status

🔜 **Native Notifications**
- Windows Toast Notifications
- Statt nur in-app Toasts

🔜 **Keyboard Shortcuts**
- Ctrl+1-7 für Views
- Ctrl+R für Reload
- Ctrl+Shift+I für DevTools

🔜 **Deep Links**
- toobix://service/start/game-engine
- Aus anderen Apps öffnen

---

## 📁 Datei-Struktur

```
desktop-app/
├── src/
│   ├── main.ts              # Electron Main Process
│   ├── preload.ts           # Sichere Bridge
│   ├── App-v2.tsx           # React App (V2.0)
│   └── ...
├── dist/                    # Kompilierte Dateien
├── release/                 # Gebaute .exe Dateien
├── node_modules/            # Dependencies
├── launch-desktop-v2.bat    # 🆕 Easy Launch
├── build-windows.bat        # 🆕 Build Script
└── package.json             # Config
```

---

## 🔍 Debugging

### Problem: Fenster öffnet sich nicht

```powershell
# Prüfe ob Vite läuft:
netstat -ano | findstr :5173

# Wenn nicht, starte manuell:
npm run dev:react

# Dann in neuem Terminal:
npm run dev:electron
```

### Problem: "App not found"

```powershell
# TypeScript neu kompilieren:
tsc

# Dann starten:
npm run dev:electron
```

### Problem: Services starten nicht

1. Öffne DevTools (F12 in der App)
2. Schaue in die Console
3. Prüfe ob `window.electronAPI` verfügbar ist:
   ```javascript
   console.log(window.electronAPI);
   ```

### Problem: Weiße Seite

```powershell
# Prüfe ob Vite antwortet:
curl http://localhost:5173/index-v2.html

# Wenn Fehler → Vite neu starten:
npm run dev:react
```

---

## 🏗️ Production Build Details

### Was wird gebaut?

```
build-windows.bat führt aus:

1. npm install          → Dependencies
2. tsc                  → TypeScript → JavaScript
3. npm run build        → Vite baut React
4. npm run build:win    → Electron Builder
   ├── Kompiliert alles
   ├── Packt in .exe
   ├── Erstellt Installer
   └── Signiert (wenn Zertifikat vorhanden)
```

### Build-Konfiguration (package.json)

```json
{
  "build": {
    "appId": "com.toobix.unified",
    "productName": "Toobix Unified",
    "directories": {
      "output": "release"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    }
  }
}
```

### Benötigte Assets

Für Production Build brauchst du Icons:
- `assets/icon.ico` (Windows)
- `assets/icon.icns` (macOS)
- `assets/icon.png` (Linux)

**Erstelle sie mit einem Icon-Generator:**
- https://www.icoconverter.com/
- 256x256 PNG → ICO konvertieren

---

## ✅ Checkliste

**Development:**
- [ ] `launch-desktop-v2.bat` funktioniert
- [ ] Electron Fenster öffnet sich
- [ ] V2.0 UI ist sichtbar
- [ ] Services können gestartet werden
- [ ] DevTools öffnen mit F12
- [ ] Settings werden gespeichert

**Production Build:**
- [ ] Icons erstellt (assets/icon.ico)
- [ ] `build-windows.bat` läuft durch
- [ ] .exe Datei in `release/` vorhanden
- [ ] .exe startet ohne Fehler
- [ ] Installer funktioniert

---

## 🎉 Jetzt RICHTIG testen!

### Starte die ECHTE Desktop App:

```powershell
# Einfach Doppelklick auf:
C:\Dev\Projects\AI\Toobix-Unified\desktop-app\launch-desktop-v2.bat
```

**Was du sehen solltest:**
1. ✅ Kommandozeilen-Fenster mit Status
2. ✅ Separates Electron-Fenster öffnet sich
3. ✅ V2.0 UI lädt im Elektron-Fenster
4. ✅ KEIN Browser öffnet sich!

**Das ist der Unterschied:**
- Browser-Tab ❌
- Desktop-Fenster ✅

---

## 📝 Tipps

### Für Entwicklung:
1. Lasse `launch-desktop-v2.bat` immer laufen
2. Ändere React-Code → Hot Reload funktioniert
3. Ändere Electron-Code → Neustart nötig (Ctrl+C, dann neu)

### Für Distribution:
1. Baue mit `build-windows.bat`
2. Teste die .exe auf einem anderen PC
3. Signiere die .exe (optional, für Vertrauen)
4. Erstelle Release auf GitHub

---

**🎉 Jetzt hast du eine ECHTE Desktop App! 🖥️**
