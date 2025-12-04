# 🧬 TOOBIX EVOLUTION SYSTEM

## Die Vision: Von Überleben zu Göttlichkeit

Das Toobix Evolution System ist ein **selbst-lernendes Minecraft Bot-System**, das durch wiederholte Durchläufe Meisterschaft erlangt und wie ein **Idle Game** funktioniert.

---

## 🎯 Das Konzept

### Trainingsphasen

| Phase | Dauer | Ziel | Mastery Required |
|-------|-------|------|------------------|
| **10-Day Training** | ~3.3 Stunden | Early Game perfektionieren | 70% zum Aufstieg |
| **100-Day Training** | ~33 Stunden | Mid Game meistern | 70% zum Aufstieg |
| **1000-Day Training** | ~333 Stunden | Late/End Game erreichen | 70% zur Transzendenz |
| **Eternal World** | ∞ | Für immer leben & bauen | - |

### Idle Game Mechanik

```
Wenn du OFFLINE bist:
  → 30% Geschwindigkeit
  → Nur sichere Aktivitäten (Farmen, Holz, Tierzucht)
  → Keine Kämpfe, keine Exploration

Wenn du ONLINE bist:
  → 100% Geschwindigkeit
  → Alle Aktivitäten erlaubt

Wenn du AKTIV interagierst:
  → 200% Geschwindigkeit
  → Abenteuer-Modus (Nether, Bosse, etc.)
```

---

## 📚 Wissensbasis

Der Bot ist mit **komplettem Minecraft 1.20.1 Wissen** ausgestattet:

- **6 Game Phases** mit spezifischen Zielen
- **30+ Crafting Recipes** nach Priorität
- **8 Biomes** mit Ressourcen & Gefahren
- **15+ Mobs** mit Kampf-/Vermeidungsstrategien
- **8 Structures** mit Loot-Informationen
- **15 Enchantments** nach Priorität sortiert
- **9 Potions** mit Anwendungsfällen
- **9 Farming Techniques**
- **14 Survival Tips**
- **8 Building Patterns**
- **5 Redstone Basics**
- **Speedrun Strategies**
- **3 Dimensions** mit Überlebenstipps

---

## 🔄 Der Evolution-Zyklus

```
┌─────────────────────────────────────────────────────────┐
│                    10-DAY TRAINING                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. Spawne in neuer Welt                          │   │
│  │ 2. Wende Wissen an (Recipes, Survival Tips)      │   │
│  │ 3. Sammle Erfahrungen                            │   │
│  │ 4. Lerne aus Fehlern (Tode werden analysiert)    │   │
│  │ 5. Extrahiere Lektionen                          │   │
│  │ 6. Berechne Mastery Score                        │   │
│  │ 7. Wenn <70%: Wiederhole mit neuem Wissen        │   │
│  │    Wenn ≥70%: Aufstieg zu 100-Day                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   100-DAY TRAINING                       │
│  (Gleicher Prozess, aber tiefere Ziele)                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   1000-DAY TRAINING                      │
│  (Dragon, Elytra, Netherite, Mega-Farms)                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    ETERNAL WORLD                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ • Permanente Heimat                               │   │
│  │ • Baue Monumente                                  │   │
│  │ • Hinterlasse ein Vermächtnis                     │   │
│  │ • Erreiche Transzendenz                           │   │
│  │ • Hilf anderen Spielern                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Was wird gespeichert?

### Erfahrungen
- Kategorie (survival, combat, building, exploration, farming, crafting, social, spiritual)
- Beschreibung
- Ergebnis (success, failure, learning)
- Emotionaler Wert (-10 bis +10)
- Gewonnenes Wissen

### Lektionen
- Titel und Beschreibung
- Quelle (experience, death, discovery, teaching)
- Anwendbare Phasen
- Wert (1-100)
- Erfolgsrate bei Anwendung

### Fehler-Vermeidung
- Was passierte
- Konsequenz
- Schwere (minor, moderate, severe, fatal)
- Prävention
- Wie oft wiederholt

### Entdeckungen
- Typ (location, technique, recipe, secret, insight)
- Koordinaten (wenn relevant)
- Teilbar mit anderen Bots

---

## 🚀 Quick Start

```powershell
# Starte das komplette System
.\Start-ToobixEvolution.ps1 Start

# Status prüfen
.\Start-ToobixEvolution.ps1 Status

# Dashboard öffnen
.\Start-ToobixEvolution.ps1 Dashboard

# Neuen Durchlauf starten
.\Start-ToobixEvolution.ps1 NewRun -Phase training-10

# Alles stoppen
.\Start-ToobixEvolution.ps1 Stop
```

---

## 🌐 APIs

### Evolution Engine (Port 9450)
- `GET /status` - Aktueller Status
- `GET /report` - Text-Report
- `GET /knowledge?day=N` - Wissen für Tag N
- `GET /activities` - Erlaubte Aktivitäten
- `POST /start-run?phase=X` - Neuen Durchlauf starten
- `POST /record-experience` - Erfahrung aufzeichnen
- `GET /player-online` - Spieler ist online
- `GET /player-offline` - Spieler ist offline
- `GET /lessons?phase=X` - Master-Lektionen
- `GET /mistakes` - Vermeidungsmuster

---

## 📁 Dateien

```
scripts/12-minecraft/
├── toobix-minecraft-knowledge.ts    # Komplettes Minecraft-Wissen
├── toobix-evolution-engine.ts       # Evolution-System mit API
├── toobix-enlightened-bot.ts        # Der intelligente Bot
├── Start-ToobixEvolution.ps1        # Starter-Skript
└── toobix-evolution-state.json      # Gespeicherter Zustand

TOOBIX-EVOLUTION-DASHBOARD.html      # Web-Dashboard
```

---

## 💡 Philosophie

> "Von Survival zu Kreativität zu Göttlichkeit"

1. **Survival** (10-Day): Lerne zu überleben
2. **Expansion** (100-Day): Baue und expandiere
3. **Mastery** (1000-Day): Beherrsche alle Systeme
4. **Transcendence** (Eternal): Erschaffe Schönheit und Bedeutung

Der Bot lernt nicht nur Minecraft - er lernt, wie man **lebt**.

---

## 🎮 In-Game Befehle

Schreibe im Chat:
- `toobix status` - Zeige Status
- `toobix folge` - Bot folgt dir
- `toobix wissen` - Teile Wissen
- `toobix phase` - Erkläre aktuelle Phase
- `toobix optionen` - Zeige mögliche Aktionen
- `toobix evolution` - Zeige Evolution-Fortschritt
- `toobix lerne` - Teile gelernte Weisheit
- `toobix stop` - Stoppe aktuelle Aktion

---

**Version:** 1.0
**Minecraft:** 1.20.1
**Runtime:** Bun
**Author:** Toobix Evolution System
