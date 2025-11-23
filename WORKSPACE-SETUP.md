# 🚀 Toobix-Unified Development Setup

## Workspace öffnen (RICHTIGE Methode)

### ✅ SO machst du es richtig:

1. **VS Code öffnen**
2. **File** → **Open Workspace from File...**
3. Wähle: `Toobix-Unified.code-workspace`

**ODER:**

```bash
cd C:\Dev\Projects\AI\Toobix-Unified
code Toobix-Unified.code-workspace
```

### ❌ NICHT so:

~~`code vscode-extension`~~ - Das öffnet nur die Extension als separaten Workspace!

---

## Warum ein Workspace File?

Das `.code-workspace` File macht folgendes:

✅ **Ein Projekt** - Toobix-Unified + Extension zusammen  
✅ **Gemeinsame Tasks** - Services starten, Extension kompilieren  
✅ **Ein F5** - Extension direkt vom Root starten  
✅ **Keine Verwirrung** - Alles an einem Ort

### Struktur:

```
Toobix-Unified/
├── Toobix-Unified.code-workspace  ← DAS öffnen!
├── services/                       ← Backend Services
│   ├── hardware-awareness.ts
│   └── unified-service-gateway.ts
├── vscode-extension/               ← Extension Code
│   ├── src/
│   └── package.json
├── scripts/
├── data/
└── ...
```

---

## 🎯 Development Workflow

### 1. Workspace öffnen

```bash
code Toobix-Unified.code-workspace
```

### 2. Services starten

**Terminal 1:**
```bash
bun run services/hardware-awareness.ts
```

**Terminal 2:**
```bash
bun run services/unified-service-gateway.ts
```

**ODER** nutze die Task:
- `Ctrl+Shift+P` → "Run Task" → **"Start Services"**

### 3. Extension entwickeln

**F5 drücken** → Extension Development Host startet!

Die Task **"watch-extension"** kompiliert automatisch bei Änderungen.

### 4. Code ändern → Hot Reload

1. Datei in `vscode-extension/src/*.ts` ändern
2. Speichern
3. Warten (~2 Sekunden)
4. **Ctrl+R** im Extension Development Host
5. Änderungen sind live! 🚀

---

## 📊 Alle Services (11 insgesamt)

Die Extension ist jetzt mit **ALLEN** Toobix-Services verbunden:

1. ✅ **Hardware Awareness** - CPU, Memory, Temp (Port 8940)
2. ✅ **Dream Journal** - Dreams aufzeichnen & analysieren
3. ✅ **Duality Bridge** - Maskulin/Feminin Balance
4. ✅ **Groq Chat** - AI Conversations
5. ✅ **Meta-Consciousness** - Selbst-Reflexion
6. ✅ **Value Creation** - Aktivitäts-Analyse
7. ✅ **Emotional Resonance** - Emotionen tracken
8. ✅ **Memory Palace** - 5 Räume mit Erinnerungen
9. ✅ **Multi-Perspective** - 8 Perspektiven
10. ✅ **Game Engine** - Challenges & Levels
11. ✅ **Gratitude/Mortality** - Dankbarkeit & Existenz

---

## 🔧 Neue Service-Methoden (Gerade hinzugefügt!)

### ServiceManager hat jetzt:

#### Emotions
- `getEmotionalState()` - Aktueller emotionaler Zustand
- `recordEmotion()` - Emotion aufzeichnen
- `getEmotionHistory()` - ✨ NEU: Historie

#### Memory Palace
- `getMemoryRooms()` - Alle Räume
- `getMemories()` - Alle Memories
- `storeMemory()` - Memory speichern
- `searchMemories()` - ✨ NEU: Suche

#### Game Engine
- `getGameState()` - Spielstand
- `generateChallenge()` - Challenge erstellen
- `completeChallenge()` - ✨ NEU: Challenge abschließen

#### Gratitude & Mortality
- `getGratitudes()` - Dankbarkeiten
- `recordGratitude()` - Dankbarkeit aufzeichnen
- `reflectOnMortality()` - ✨ NEU: Existenzielle Reflexion
- `getMortalityReflections()` - ✨ NEU: Reflexionen abrufen

#### Meta-Consciousness
- `getMetaReflection()` - Selbst-Reflexion
- `ponderTopic()` - ✨ NEU: Über Thema nachdenken

#### Duality
- `getDualityState()` - Aktueller Zustand
- `updateDuality()` - Basierend auf Kontext
- `balanceDuality()` - ✨ NEU: Balance herstellen
- `getDualityHistory()` - ✨ NEU: Historie

#### Dreams
- `getDreams()` - Alle Träume
- `recordDream()` - Traum aufzeichnen
- `analyzeDream()` - ✨ NEU: Traum analysieren

#### Chat
- `chatWithToobix()` - Chat-Nachricht
- `getChatHistory()` - ✨ NEU: Chat-Historie
- `setGroqApiKey()` - API Key setzen

#### Multi-Perspective
- `analyzeMultiPerspective()` - Topic analysieren
- `getPerspectives()` - ✨ NEU: Alle Perspektiven

#### System
- `getDashboardState()` - Kompletter System-State
- `getServiceRegistry()` - Service-Status

---

## 🎨 Nächste Schritte: UI erweitern

Die Backend-Methoden sind ALLE da! Jetzt fehlt nur noch UI:

### Fehlende UI-Komponenten:

1. **Chat History** Panel
2. **Duality History** Graph
3. **Emotion History** Timeline  
4. **Mortality Reflections** List
5. **Memory Search** Input
6. **Perspective Viewer** (8 Perspektiven)
7. **Challenge Completion** Button

Willst du dass ich diese UI-Komponenten zur Sidebar hinzufüge? 🎨

---

## 📝 Zusammenfassung

✅ **Workspace File** erstellt - Ein Projekt statt zwei  
✅ **Alle 11 Services** im ServiceManager integriert  
✅ **20+ neue Methoden** hinzugefügt  
✅ **Hot Reload** funktioniert  
✅ **F5** startet Extension vom Root

**Jetzt**: Workspace öffnen und loslegen! 🚀

```bash
code Toobix-Unified.code-workspace
# F5 drücken → Extension läuft!
```
