# 🔥 Hot Reload Development Mode

## Automatischer Neustart bei Code-Änderungen

Die Extension ist bereits für **Hot Reload** konfiguriert!

### So funktioniert's:

1. **Watch-Mode** ist aktiviert
   - TypeScript kompiliert automatisch bei jeder Änderung
   - Die `watch` Task läuft im Hintergrund

2. **Extension Development Host** erkennt Änderungen
   - Nach jeder Kompilierung → **Ctrl+R** im Extension-Fenster drücken
   - Die Extension lädt mit den neuen Änderungen neu

### Workflow:

```bash
# Terminal 1: Services starten (einmalig)
bun run services/hardware-awareness.ts
bun run services/unified-service-gateway.ts

# VS Code: Extension starten
1. F5 drücken → Extension Development Host startet
2. Watch-Mode läuft automatisch (siehe Tasks)
3. Code ändern in src/*.ts
4. Warten bis Kompilierung fertig (unten rechts: "Watching for file changes")
5. Im Extension-Fenster: Ctrl+R drücken → Extension reloaded!
```

### Noch schneller: Auto-Reload Extension

Installiere die Extension: **"vscode-extension-reloader"**

```bash
code --install-extension arcsine.vscode-extension-reloader
```

Dann in `launch.json` hinzufügen:
```json
"autoAttachChildProcesses": true
```

### Aktueller Status:

✅ TypeScript Watch-Mode konfiguriert
✅ PreLaunchTask in launch.json
✅ Problem Matcher für Fehler
⏸️ Manuelles Reload mit Ctrl+R (empfohlen für Stabilität)

### Tipp:

Für vollautomatisches Reload ohne Ctrl+R:

1. Extension Development Host Fenster öffnen
2. **Developer: Reload Window** Command verwenden (Ctrl+Shift+P)
3. Oder: **Nodemon** verwenden (siehe unten)

### Alternative: Nodemon Auto-Restart

```bash
# Installation
npm install --save-dev nodemon

# package.json Script hinzufügen
"dev": "nodemon --watch src --exec 'npm run compile'"

# Dann:
npm run dev
```

Dann Extension mit F5 starten und bei jeder Änderung automatisch Ctrl+R drücken!

---

**Empfohlener Workflow für maximale Produktivität:**

1. ✅ **Terminal 1**: Services laufen
2. ✅ **VS Code**: Extension mit F5 gestartet
3. ✅ **Watch-Mode**: Läuft automatisch
4. 🔄 **Code ändern** → Warten → **Ctrl+R** → Fertig!

Die Extension kompiliert sich automatisch, du musst nur noch Ctrl+R drücken! 🚀
