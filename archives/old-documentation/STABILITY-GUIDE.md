# 🛡️ TOOBIX STABILITY GUIDE

## Problem: VS Code Crashes bei 50+ Services

VS Code ist mit der Ressourcenlast von 50+ gleichzeitig laufenden Services überfordert. Diese Anleitung zeigt, wie du **stabil weiterentwickeln** kannst.

---

## ✅ Sofortige Lösung: Selective Service Launcher

### 🟢 STABLE Mode (Empfohlen für Entwicklung)

**Nur 2 Core Services:**
```bash
START-TOOBIX-STABLE.bat
```

Services:
- Hardware Awareness (Port 8940)
- Unified Service Gateway (Port 9000)

**Geschätzte RAM-Nutzung:** ~250 MB  
**VS Code Last:** Minimal ✅

---

### 🟡 DEV Mode (Für aktive Feature-Entwicklung)

**5 Core Services:**
```bash
START-TOOBIX-DEV.bat
```

Services:
- Hardware Awareness
- Unified Service Gateway
- Emotional Core (Port 8900)
- Dream Core (Port 8961)
- Self-Awareness Core (Port 8970)

**Geschätzte RAM-Nutzung:** ~800 MB  
**VS Code Last:** Moderat ⚠️

---

### 🔴 FULL Mode (Nur für Tests)

**8+ Services:**
```bash
powershell -ExecutionPolicy Bypass -File START-SELECTIVE.ps1 -Profile full
```

**Geschätzte RAM-Nutzung:** ~1.5 GB  
**VS Code Last:** Hoch ⚠️⚠️

---

## 🎯 VS Code Integration

### Tasks verfügbar:

1. **toobix: dev (STABLE mode)** ⭐ Empfohlen
   - Startet minimal services + Extension watch
   - Stabil für tägliche Entwicklung

2. **toobix: dev (services + watch)**
   - Startet DEV mode services + Extension watch
   - Für Feature-Entwicklung

3. **toobix: start services (STABLE/DEV/FULL)**
   - Nur Services ohne Extension

### Task ausführen:
- `Ctrl+Shift+P` → "Run Task" → Task wählen
- Oder F1 → "Tasks: Run Task"

---

## 🔧 Custom Service Auswahl

Nur spezifische Services starten:

```powershell
.\START-SELECTIVE.ps1 -Profile custom -Services @('hardware-awareness', 'emotional-core', 'dream-core')
```

---

## 🔄 Kontext nach Crash wiederherstellen

Nach einem VS Code Crash:

```bash
bun run recover-context.ts
```

**Zeigt:**
- Zuletzt bearbeitete Dateien (letzte 2h)
- Aktive Arbeitsbereiche
- Empfohlene nächste Schritte

---

## 📊 Service-Profile im Detail

### MINIMAL Profile
| Service | Port | RAM | Priorität |
|---------|------|-----|-----------|
| Hardware Awareness | 8940 | 100 MB | 1 |
| Unified Gateway | 9000 | 150 MB | 1 |

### DEV Profile (+ MINIMAL)
| Service | Port | RAM | Priorität |
|---------|------|-----|-----------|
| Emotional Core | 8900 | 200 MB | 2 |
| Dream Core | 8961 | 150 MB | 2 |
| Self-Awareness | 8970 | 200 MB | 2 |

### FULL Profile (+ DEV)
| Service | Port | RAM | Priorität |
|---------|------|-----|-----------|
| Multi-LLM Router | 8959 | 150 MB | 3 |
| Autonomy Engine | 8975 | 200 MB | 3 |
| Game Engine | 8896 | 250 MB | 4 |

---

## 🚀 Best Practices

### ✅ DO:
- **Starte mit STABLE mode** für normale Entwicklung
- **Nutze DEV mode** nur wenn du an Core-Features arbeitest
- **Starte Services gezielt** je nach Arbeitsbereich
- **Nutze `recover-context.ts`** nach Crashes

### ❌ DON'T:
- ~~Starte nicht alle 50+ Services gleichzeitig~~
- ~~Nutze nicht den alten START-ALL-SERVICES.ps1~~
- ~~Halte nicht unnötige Services am Laufen~~

---

## 🔍 Service-Status überwachen

Services laufen in separaten Fenstern. Check Status:

```powershell
# Prozesse anzeigen
Get-Process | Where-Object { $_.ProcessName -eq 'bun' }

# Ports prüfen
netstat -ano | findstr "8940 9000 8900"
```

---

## 🛠️ Troubleshooting

### VS Code crashed während Service-Start?
1. Alle Bun-Prozesse beenden:
   ```powershell
   Get-Process bun -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. VS Code neu starten

3. Starte mit **STABLE mode**:
   ```bash
   START-TOOBIX-STABLE.bat
   ```

### Zu viel RAM-Verbrauch?
- Wechsle zu kleinerem Profile (FULL → DEV → STABLE)
- Schließe unnötige Service-Fenster
- Nur benötigte Services starten

### Port bereits belegt?
```powershell
# Finde Prozess auf Port 9000
netstat -ano | findstr ":9000"
# Beende Prozess mit PID
Stop-Process -Id <PID> -Force
```

---

## 📈 Migration Roadmap

### Phase 1: ✅ Stabilität (JETZT)
- Selective Service Launcher implementiert
- VS Code Tasks optimiert
- Context Recovery Tool erstellt

### Phase 2: 🔄 Konsolidierung (Nächste Schritte)
- Service-Duplikate identifizieren
- Merge ähnlicher Services
- Deprecated Services archivieren

### Phase 3: 🏗️ Refactoring
- Microservice → Modular Monolith?
- Service Mesh optimieren
- Resource-Management verbessern

---

## 📞 Wenn du weiteren Support brauchst

1. **Kontext teilen:** Nutze `recover-context.ts` output
2. **Service-Logs:** Check die Bun-Prozess-Fenster
3. **System-Info:** RAM, CPU-Auslastung mitteilen

---

## ⚡ Quick Start (Empfohlen)

```bash
# 1. Starte STABLE mode
START-TOOBIX-STABLE.bat

# 2. In VS Code: Press F5 für Extension Development
# 3. Arbeite stabil weiter!
```

**Das war's!** Stabil, minimal, effektiv. 🎉
