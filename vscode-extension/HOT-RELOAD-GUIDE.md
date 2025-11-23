# 🔥 Hot Reload Development Guide

## Quick Start

### Option 1: PowerShell Script (Einfachste Methode)

```powershell
cd vscode-extension
.\start-dev.ps1
```

Das startet automatisch:
- ✅ Hardware Awareness Service (Port 8940)
- ✅ Unified Gateway Service (Port 9000)  
- ✅ TypeScript Watch Mode (auto-compile)

Dann in VS Code: **F5** drücken → Extension läuft!

---

### Option 2: VS Code Tasks (Empfohlen für Profis)

1. **Öffne Command Palette**: `Ctrl+Shift+P`
2. **Run Task** → `Dev Mode: Services + Watch`
3. **F5** drücken → Extension Development Host startet

Bei Code-Änderungen: **Ctrl+R** im Extension-Fenster drücken!

---

### Option 3: Manuell (Maximale Kontrolle)

#### Terminal 1: Hardware Awareness
```bash
cd ..
bun run services/hardware-awareness.ts
```

#### Terminal 2: Unified Gateway
```bash
cd ..
bun run services/unified-service-gateway.ts
```

#### Terminal 3: Watch Mode
```bash
npm run watch
```

#### VS Code: Extension starten
**F5** drücken → Extension Development Host

---

## 🔄 Hot Reload Workflow

### Automatische Kompilierung

Watch-Mode läuft im Hintergrund:
- ✅ Speichern → Automatische Kompilierung
- ✅ Fehler werden im Problems Panel angezeigt
- ✅ Status unten rechts: "Watching for file changes..."

### Extension neu laden

Nach jeder Änderung:

1. **Warten** bis Kompilierung fertig (~ 1-2 Sekunden)
2. **Ctrl+R** im Extension Development Host Fenster drücken
3. **Fertig!** Deine Änderungen sind live! 🚀

### Debugging

- **Breakpoints** setzen in `src/*.ts`
- **F5** → Debugger startet automatisch
- **Console Logs** erscheinen im Debug Console

---

## 📁 Typischer Entwicklungs-Flow

### Service hinzufügen

1. **ServiceManager** erweitern (`src/ToobixServiceManager.ts`):
   ```typescript
   async getNewService() {
     const response = await fetch('http://localhost:9000/new-service');
     return await response.json();
   }
   ```

2. **Sidebar** updaten (`src/ToobixSidebarProvider.ts`):
   ```typescript
   // HTML-Sektion hinzufügen
   <div class="status-card">
     <h3>🆕 New Service</h3>
     <div id="new-service">Loading...</div>
   </div>

   // JavaScript-Handler
   function updateNewService(data) {
     document.getElementById('new-service').textContent = data.value;
   }
   ```

3. **Speichern** → Watch kompiliert automatisch

4. **Ctrl+R** im Extension-Fenster → Service sichtbar!

---

## 🎯 Tasks Übersicht

| Task | Beschreibung |
|------|--------------|
| `Watch TypeScript` | Auto-compile bei Änderungen |
| `Start Hardware Awareness` | Service auf Port 8940 |
| `Start Unified Gateway` | Service auf Port 9000 |
| `Start All Services` | Beide Services gleichzeitig |
| `Dev Mode: Services + Watch` | **ALLES** in einem! |

---

## 🐛 Troubleshooting

### Extension lädt nicht neu

**Lösung**: Kompletten Extension Host neu starten:
- `Ctrl+Shift+P` → "Developer: Reload Window"
- Oder: Extension Development Host Fenster schließen → F5 neu drücken

### Services nicht erreichbar (fetch failed)

**Check**:
```powershell
# Port 8940 checken
curl http://localhost:8940/health

# Port 9000 checken  
curl http://localhost:9000/health
```

**Fix**: Services neu starten:
```powershell
.\start-dev.ps1
```

### TypeScript Compile Fehler

**Check** Problems Panel (`Ctrl+Shift+M`)

**Fix**: 
```bash
npm run compile
```

### Port bereits belegt

**Fix**:
```powershell
# Prozesse auf Ports stoppen
$p8940 = Get-NetTCPConnection -LocalPort 8940 -EA SilentlyContinue | Select -Expand OwningProcess
$p9000 = Get-NetTCPConnection -LocalPort 9000 -EA SilentlyContinue | Select -Expand OwningProcess
if($p8940) { Stop-Process -Id $p8940 -Force }
if($p9000) { Stop-Process -Id $p9000 -Force }
```

---

## 💡 Pro-Tipps

### 1. Multi-Root Workspace

Öffne BEIDE Ordner in VS Code:
```
File → Add Folder to Workspace
- Toobix-Unified (root)
- Toobix-Unified/vscode-extension
```

Dann kannst du Services UND Extension gleichzeitig bearbeiten!

### 2. Keyboard Shortcuts

Erstelle Custom Shortcuts in `keybindings.json`:

```json
{
  "key": "ctrl+shift+r",
  "command": "workbench.action.tasks.runTask",
  "args": "Dev Mode: Services + Watch"
}
```

### 3. Auto-Reload ohne Ctrl+R

Installiere Extension: `arcsine.vscode-extension-reloader`

### 4. Service Logs Live sehen

Öffne Terminal Panel während Services laufen:
- **View** → **Terminal** → Tabs zeigen Service-Outputs

---

## 📊 Status Monitoring

### Während Development:

- ✅ **Bottom Right**: "Watching for file changes..." → Watch-Mode aktiv
- ✅ **Problems Panel**: Compiler-Fehler werden live angezeigt
- ✅ **Debug Console**: Extension-Logs (console.log)
- ✅ **Terminal Tabs**: Service-Outputs (Hardware, Gateway)

---

## 🚀 Produktivitäts-Boost

**Optimaler Setup:**

1. **Left**: Code Editor (`src/ToobixSidebarProvider.ts`)
2. **Right**: Extension Development Host (Live-Preview)
3. **Bottom**: Terminal mit Service-Logs
4. **Bottom Right**: Problems/Debug Console

**Workflow:**
1. Code ändern → Speichern
2. ~2 Sekunden warten
3. Ctrl+R drücken
4. Sofort sehen was sich geändert hat!

**Zeit pro Änderungs-Zyklus**: ~5 Sekunden! ⚡

---

Viel Erfolg beim Entwickeln! 🎉
