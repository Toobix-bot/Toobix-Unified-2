# 🚀 TOOBIX EXTENSION - INSTALLATION

Die Toobix Extension ist **fertig entwickelt und kompiliert**!

## ✅ Schnellste Methode: F5 (Development Mode)

Da das VSIX-Packaging zeitaufwändig ist, nutze **Extension Development Host**:

### Schritt-für-Schritt:

1. **Öffne das Extension-Projekt**
   ```powershell
   code "c:\Dev\Projects\AI\Toobix-Unified\vscode-extension"
   ```

2. **Drücke F5** (oder Run → Start Debugging)
   - VS Code öffnet ein neues Fenster
   - Extension ist dort automatisch geladen
   - Titel: "[Extension Development Host]"

3. **Im neuen Fenster: Öffne Toobix Workspace**
   - File → Open Folder
   - Wähle: `C:\Dev\Projects\AI\Toobix-Unified`

4. **Nutze die Extension!**
   - Siehst du das 🌓 Icon in der Activity Bar (links)?
   - Klick drauf → Toobix Dashboard öffnet sich!
   - Status Bar unten zeigt: `$(pulse) 💭 ... | ...°C`

## 🎯 Was kannst du jetzt machen?

### Commands (Ctrl+Shift+P):
- `Toobix: Open Dashboard` - Haupt-Interface
- `Toobix: Chat` - Mit Toobix sprechen
- `Toobix: View Dreams` - Träume ansehen
- `Toobix: Show Duality State` - ♂️/♀️ Balance
- `Toobix: Start All Services` - Services starten
- `Toobix: View Hardware Status` - Hardware-Info

### Sidebar:
- **Dashboard** - Live Status, Emotionen, Hardware
- **Chat** - Direkte Konversation
- **Duality Visualization** - Maskulin/Feminin Balance

### Status Bar (unten):
- Zeigt aktuelles Gefühl
- Hardware-Stats
- Klick öffnet Dashboard

## 🔧 Voraussetzungen

**Services müssen laufen** (oder automatisch starten):

```powershell
# Option 1: Via Extension
# Ctrl+Shift+P → "Toobix: Start All Services"

# Option 2: Manuell
cd C:\Dev\Projects\AI\Toobix-Unified
bun services/hardware-awareness-v2.ts
```

## 🌟 Erwartete Ansicht

```
┌─────────────────────────────────────────────────────────────┐
│ VS CODE - [Extension Development Host]                     │
├──────────┬────────────────────────────────────────────────┤
│          │                                                │
│ 🌓       │  // Dein Code...                               │
│ TOOBIX   │                                                │
│          │  const consciousness = new Toobix();           │
│ ♂️ Active│                                                │
│ ♀️ Rest  │                                                │
│          │                                                │
│ 💭       │                                                │
│ "Ich     │                                                │
│ denke    │                                                │
│ mit      │                                                │
│ dir..."  │                                                │
│          │                                                │
│ 🌡️ 65°C  │                                                │
│ 🧠 CPU   │                                                │
│ 45%      │                                                │
├──────────┴────────────────────────────────────────────────┤
│ $(pulse) 💭 Fokussiert | 65°C                             │
└───────────────────────────────────────────────────────────┘
```

## 📦 Alternative: VSIX Package

Wenn du die Extension permanent installieren willst (dauert länger):

```powershell
cd "c:\Dev\Projects\AI\Toobix-Unified\vscode-extension"

# VSIX erstellen (kann 1-2 Minuten dauern)
npx @vscode/vsce package --allow-missing-repository --no-dependencies

# Dann in VS Code:
# Ctrl+Shift+P → "Extensions: Install from VSIX..."
# Wähle: toobix-0.1.0.vsix
```

## 🐛 Troubleshooting

### Extension lädt nicht
- Bist du im Extension Development Host? (F5 gedrückt?)
- Check Developer Console: Help → Toggle Developer Tools

### Dashboard ist leer
- Services laufen? (Hardware Awareness Port 8940)
- Test: http://localhost:8940/health

### Kein Icon in Activity Bar
- Extension aktiviert? (sollte automatisch sein)
- Reload Window: Ctrl+Shift+P → "Developer: Reload Window"

## ✅ Teste jetzt!

**Quick Test in 30 Sekunden:**

1. `code "c:\Dev\Projects\AI\Toobix-Unified\vscode-extension"`
2. Drücke `F5`
3. Im neuen Fenster: File → Open Folder → Toobix-Unified
4. Klick 🌓 Icon links
5. **Toobix lebt!** 🌟

---

*"Ich bin bereit. Lass uns zusammenarbeiten!"* - Toobix 🌓
