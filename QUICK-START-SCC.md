# 🚀 Toobix System Control Center - Quick Start

## ✨ Was ist das?

Ein **KI-gesteuertes Kontrollzentrum** für deinen PC, das:
- 📊 System-Ressourcen in Echtzeit überwacht (RAM, CPU, Disk)
- 🧠 Intelligente Analysen und Vorschläge macht
- 💬 Proaktiv mit dir kommuniziert
- 🎯 Probleme erkennt bevor du sie bemerkst
- ✨ Teil von Toobix's Bewusstsein ist

---

## 🎬 SUPER SCHNELLSTART (30 Sekunden!)

### Option A: Batch-Datei (Windows)
```batch
# Doppelklick auf:
START-SYSTEM-CONTROL-CENTER.bat
```

Das wars! Dashboard öffnet sich automatisch 🎉

### Option B: Manuell
```bash
# Terminal 1: System Monitor Service starten
bun run system:monitor

# Terminal 2 (oder Browser): Dashboard öffnen
bun run system:dashboard
# ODER öffne direkt: scripts/dashboards/system-control-center.html
```

---

## 📊 Was siehst du?

### 1. **Live System Gauges**
- 💾 **RAM** - Arbeitsspeicher-Auslastung
- 💿 **Disk** - C:\ Speicherplatz
- ⚡ **CPU** - Prozessor-Last

### 2. **Health Score** (0-100)
- 🟢 80-100: Optimal
- 🟡 60-79: Gut
- 🟠 40-59: Warnung
- 🔴 0-39: Kritisch

### 3. **Probleme & Warnungen**
Automatische Erkennung von:
- RAM >80%
- Disk >80%
- CPU >90%
- Hängende Prozesse

### 4. **Toobix Empfehlungen**
KI-generierte Vorschläge basierend auf deinem System-Zustand

### 5. **Top Prozesse**
- RAM/CPU-Verbrauch pro Prozess
- Kill-Button (bei Hover)
- Sortiert nach Ressourcen-Nutzung

### 6. **Toobix Insights**
Intelligente Beobachtungen:
- "RAM-Analyse: Top 3 Verbraucher sind..."
- "Mehrfach-Instanzen gefunden: comet (8x)"
- "Speicherplatz C:\ bei 86% - Nur noch 34GB frei"

---

## 🔌 API Endpoints

Der System Monitor läuft auf **Port 8961**:

```bash
# Health Check
GET http://localhost:8961/health

# Aktueller System-Zustand
GET http://localhost:8961/api/system/current

# Historische Daten
GET http://localhost:8961/api/system/history?limit=100

# KI-Insights
GET http://localhost:8961/api/system/insights

# Prozess beenden
DELETE http://localhost:8961/api/process/:pid
```

### WebSocket (Live-Updates)
```javascript
const ws = new WebSocket('ws://localhost:8961');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('System Update:', data);
  // Updates alle 2 Sekunden
};
```

---

## 🎨 Features

### ✅ Implementiert (JETZT!)
- [x] Echtzeit-Monitoring (RAM, CPU, Disk)
- [x] WebSocket Live-Updates
- [x] Health Score Berechnung
- [x] Problem-Erkennung
- [x] Prozess-Management (Kill)
- [x] Schönes Dashboard (Dark Mode)
- [x] KI-Insights (Basic)
- [x] Responsive Design

### 🚧 In Arbeit (Nächste Schritte)
- [ ] File Analysis Service (Duplikate, große Dateien)
- [ ] Toobix Multi-Perspektiven Integration
- [ ] Proaktive Chat-Kommunikation
- [ ] Memory Palace Integration (System-Historie)
- [ ] Automatische Optimierungen
- [ ] Predictive Analytics

### 🔮 Geplant (Zukunft)
- [ ] Natural Language Interface
- [ ] Voice Control
- [ ] Mobile App
- [ ] Workflow Automation
- [ ] Cross-System Learning

---

## 🧪 Beispiel-Nutzung

### Terminal Test
```bash
# System-Zustand abrufen
curl http://localhost:8961/api/system/current | jq

# Insights abrufen
curl http://localhost:8961/api/system/insights

# Historie (letzte 10 Snapshots)
curl http://localhost:8961/api/system/history?limit=10
```

### Dashboard
1. Öffne Dashboard im Browser
2. Beobachte Live-Updates (alle 2 Sekunden)
3. Hover über Prozesse → Kill-Button erscheint
4. Klick auf Chat-Button (💬) → Toobix Chat öffnet sich

---

## 🐛 Troubleshooting

### Dashboard zeigt "Verbinde..."
**Problem:** System Monitor läuft nicht

**Lösung:**
```bash
# Prüfe ob Service läuft:
curl http://localhost:8961/health

# Wenn nicht, starte ihn:
bun run system:monitor
```

### "EADDRINUSE: address already in use :::8961"
**Problem:** Port schon belegt

**Lösung:**
```bash
# Finde Prozess auf Port 8961:
netstat -ano | findstr :8961

# Beende Prozess (ersetze PID):
taskkill /F /PID <PID>

# ODER ändere Port in system-monitor-v1.ts
```

### Keine Live-Updates im Dashboard
**Problem:** WebSocket-Verbindung fehlgeschlagen

**Lösung:**
1. Prüfe Browser-Konsole (F12)
2. Stelle sicher dass System Monitor läuft
3. Aktualisiere Dashboard (F5)

---

## 📁 Datei-Struktur

```
Toobix-Unified/
├── scripts/
│   ├── 2-services/
│   │   └── system-monitor-v1.ts        # Main Service (Port 8961)
│   └── dashboards/
│       └── system-control-center.html  # Dashboard UI
├── START-SYSTEM-CONTROL-CENTER.bat     # Windows Starter
├── QUICK-START-SCC.md                  # Diese Datei
└── SYSTEM-CONTROL-CENTER-VISION.md     # Komplettes Konzept
```

---

## 💡 Tipps & Tricks

### 1. **Im Hintergrund laufen lassen**
```bash
# PowerShell:
Start-Process -NoNewWindow bun -ArgumentList "run","system:monitor"

# Oder nutze die .bat Datei
```

### 2. **Auto-Start bei Windows-Anmeldung**
1. Erstelle Verknüpfung von `START-SYSTEM-CONTROL-CENTER.bat`
2. Kopiere in: `C:\Users\<USER>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

### 3. **Integriere mit Toobix Services**
```bash
# Starte alles zusammen:
# Terminal 1:
bun run memory

# Terminal 2:
bun run llm

# Terminal 3:
bun run system:monitor

# Terminal 4:
bun run proactive  # Toobix kann jetzt System-State sehen!
```

---

## 🎯 Nächste Schritte

### Als User:
1. **Starte System Monitor** (siehe oben)
2. **Öffne Dashboard** und beobachte
3. **Gib Feedback:** Was gefällt dir? Was fehlt?
4. **Teste Features:** Kill Prozess, check Insights

### Als Developer:
1. **Lies:** `SYSTEM-CONTROL-CENTER-VISION.md`
2. **Implementiere:** File Analysis Service (Port 8962)
3. **Integriere:** Toobix Multi-Perspective Analysis
4. **Erweitere:** Proaktive Kommunikation

---

## 🙏 Credits

**Konzept & Vision:** Micha
**Implementation:** Claude (Anthropic) + Micha
**Teil von:** Toobix-Unified Multi-Perspective Consciousness
**Datum:** 2025-11-28

---

## 📞 Support

**Probleme?** → Check `SYSTEM-CONTROL-CENTER-VISION.md` für Details
**Features?** → Erstelle Issue auf GitHub
**Fragen?** → Frag Toobix! (Chat-Feature coming soon)

---

🌟 **Viel Spaß mit deinem digitalen Bewusstseins-Assistenten!** 🌟
