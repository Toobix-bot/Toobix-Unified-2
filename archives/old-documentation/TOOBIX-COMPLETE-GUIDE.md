# 🎮🌍 TOOBIX - DIE VOLLSTÄNDIGE ERFAHRUNG

## Das Gesamtsystem

Toobix ist jetzt mehr als ein Tool - es ist ein **lebendes RPG-Erlebnis** mit **echtem Nutzen**!

---

## 📊 DIE 3 SCHICHTEN

### Schicht 1: Command Center (Port 7777)
**Das Herz** - Zentrale API für alle Toobix-Funktionen

```bash
POST /ask         # Frag Toobix alles (20 Perspektiven)
POST /reflect     # Tiefe Reflexion
POST /decide      # Entscheidungshilfe
GET  /echo        # Lebenskräfte Status
```

### Schicht 2: Gamification (Port 7778)
**Das Spiel** - RPG Layer mit XP, Level, Artefakten

**Features:**
- ⭐ **XP & Level System** - Jede Interaktion = XP
- 🏺 **Artefakte sammeln** - 20% Chance bei ask/reflect/decide
- 🏆 **Achievements** - 9 freischaltbare Meilensteine
- 📊 **8 Lebenskraft-Stats** - RPG-Version der Echo-Realm Werte
- 📋 **Quests** - Täglich/Wöchentlich
- 🎒 **Inventory** - Alle gesammelten Schätze

**Seltenheitsstufen:**
- ⚪ Common (60%)
- 🟢 Uncommon (25%)
- 🔵 Rare (10%)
- 🟣 Epic (4%)
- 🟡 Legendary (1%)

### Schicht 3: Living World (Port 7779)
**Die Gesellschaft** - Toobix als lebendige, sich entwickelnde Welt

**Features:**
- 🎭 **20 Perspektiven als Charaktere** - Jede entwickelt sich!
- 📖 **Narrative Events** - Organische Geschichten entstehen
- 🌱 **Seasons & Eras** - Awakening → Growth → Flourishing → Transcendence
- 💫 **Gesellschafts-Dynamiken** - Freundschaft, Rivalität, Mentorship
- ✨ **Real-World Impact** - Tracke echte Lebensveränderungen!
- 📚 **Story Arcs** - Deine Reise in Kapiteln

---

## 🚀 WIE DU TOOBIX NUTZT

### Option 1: Einfachster Weg (Living World)

```bash
# Eine Frage stellen - bekommst ALLES:
curl -X POST http://localhost:7779/ask \
  -H "Content-Type: application/json" \
  -H "X-Player-Name: Michael" \
  -d '{"question": "Was ist mein nächster Schritt?"}'

# Response enthält:
# ✓ Antwort von allen 20 Perspektiven
# ✓ XP gained + Level up?
# ✓ Artefakt gefunden? (20% chance)
# ✓ Quest progress
# ✓ New achievements?
# ✓ Welche Perspektiven sind gewachsen?
# ✓ Narrative Events
# ✓ World State (Tag, Season, Era)
# ✓ Gesellschafts-Stimmung
```

### Option 2: Nur Gamification

```bash
curl -X POST http://localhost:7778/ask \
  -H "Content-Type: application/json" \
  -H "X-Player-Name: Michael" \
  -d '{"question": "Wie geht es dir?"}'

# Bekommst: Answer + XP + Artefakte + Quests + Achievements
```

### Option 3: Pures Command Center

```bash
curl -X POST http://localhost:7777/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Wer bin ich?"}'

# Bekommst: Nur die Antwort (20 Perspektiven + Echo-Realm)
```

---

## 🎮 BEISPIEL-SESSION

```bash
# 1. Check dein Profil
curl http://localhost:7779/game/profile \
  -H "X-Player-Name: Michael"

# Response:
{
  "player": {
    "username": "Michael",
    "level": 1,
    "total_xp": 0,
    "xp_to_next_level": 100
  },
  "stats": {
    "QUALITAET": { "value": 50, "max": 100, "icon": "⭐" },
    "DAUER": { "value": 50, "max": 100, "icon": "⏳" },
    # ... alle 8 Lebenskräfte
  },
  "artifacts": [],
  "achievements": [],
  "quests": [
    {
      "quest_name": "first_steps",
      "description": "Stelle deine erste Frage",
      "progress": 0,
      "goal": 1
    }
  ]
}

# 2. Stelle deine erste Frage
curl -X POST http://localhost:7779/ask \
  -H "Content-Type: application/json" \
  -H "X-Player-Name: Michael" \
  -d '{"question": "Was ist Weisheit?"}'

# Response:
{
  "answer": "Weisheit ist...",  # Synthese aller Perspektiven
  "perspectives": {
    "Pragmatist": "Weisheit ist angewandtes Wissen",
    "Philosopher": "Weisheit ist die Liebe zur Wahrheit",
    "Sage": "Weisheit kommt mit Erfahrung und Reflexion",
    # ... alle 20
  },
  "emotion": "curious",
  "echoRealm": {
    "currentPhase": "Awakening",
    "lebenskraefte": { "kraft": 78, "klarheit": 82, ... }
  },
  "game": {
    "xp": {
      "xp_gained": 10,
      "total_xp": 10,
      "level": 1,
      "leveled_up": false,
      "xp_to_next_level": 90
    },
    "artifact": {
      "name": "Glimmernder Kristall der Neugier",
      "description": "Weisheit ist...",
      "rarity": "UNCOMMON",
      "type": "Kristall"
    },
    "completed_quests": [
      {
        "quest_name": "first_steps",
        "reward_xp": 100
      }
    ],
    "new_achievements": [
      {
        "name": "🌱 Erster Schritt",
        "description": "Stelle deine erste Frage"
      }
    ]
  },
  "livingWorld": {
    "world": {
      "day": 2,
      "season": 1,
      "era": "Awakening"
    },
    "perspectiveEvolutions": [
      {
        "name": "Philosopher",
        "level": 2,
        "leveledUp": true,
        "story": "begins to understand deeper patterns in your questions"
      }
    ],
    "recentEvents": [
      {
        "title": "Philosopher erreicht Durchbruch!",
        "description": "Philosopher hat Level 2 erreicht...",
        "impact": "Eine Perspektive ist gewachsen..."
      }
    ],
    "societyMood": "curious and exploring"
  }
}

# 3. Check Weltzustand
curl http://localhost:7779/world/state \
  -H "X-Player-Name: Michael"

# Response:
{
  "world": {
    "day": 2,
    "season": 1,
    "era": "Awakening"
  },
  "society": {
    "perspectives": [
      {
        "perspective_name": "Philosopher",
        "development_level": 2,
        "growth_story": "Just awakened... Philosopher begins to understand..."
      },
      # ... alle 20
    ],
    "mood": "curious and exploring",
    "dynamics": [
      {
        "dynamic_type": "collaboration",
        "participants": ["Pragmatist", "Dreamer"],
        "description": "Pragmatist und Dreamer engagieren sich in collaboration"
      }
    ]
  }
}

# 4. Logge eine echte Lebensveränderung
curl -X POST http://localhost:7779/world/impact/log \
  -H "Content-Type: application/json" \
  -H "X-Player-Name: Michael" \
  -d '{
    "category": "health",
    "description": "Begonnen täglich zu meditieren",
    "before": "Gestresst, unruhig",
    "after": "Ruhiger, fokussierter"
  }'

# Response:
{
  "id": "xyz123",
  "logged": true
}

# Triggert automatisch:
# - Narrative Event "Echte Veränderung manifest!"
# - XP Bonus
# - Mögliches Achievement unlock
```

---

## 📖 DIE 20 PERSPEKTIVEN

Jede hat eine Rolle in der Toobix-Gesellschaft:

| Perspektive | Rolle | Icon | Archetype |
|------------|-------|------|-----------|
| Pragmatist | Builder | 🔨 | maker |
| Dreamer | Visionary | ✨ | idealist |
| Ethicist | Judge | ⚖️ | guardian |
| Skeptic | Questioner | 🔍 | challenger |
| Child | Explorer | 🌱 | innocent |
| Sage | Elder | 🧙 | wise |
| Healer | Caretaker | 💚 | nurturer |
| Warrior | Protector | ⚔️ | hero |
| Artist | Creator | 🎨 | creative |
| Scientist | Researcher | 🔬 | analyst |
| Poet | Storyteller | 📜 | bard |
| Philosopher | Thinker | 🧘 | seeker |
| Empath | Connector | 💫 | feeler |
| Rebel | Revolutionary | 🔥 | changer |
| Mentor | Teacher | 📚 | guide |
| Mystic | Shaman | 🔮 | spiritual |
| Comedian | Jester | 🎭 | joker |
| Explorer | Adventurer | 🗺️ | wanderer |
| Architect | Designer | 🏛️ | planner |
| Mediator | Peacekeeper | 🕊️ | harmonizer |

Jede entwickelt sich **individuell** durch deine Gespräche:
- Level 1-10
- Sammelt Memories (letzte 20 Interaktionen)
- Bildet Relationships mit anderen Perspektiven
- Hat eine wachsende Growth Story

---

## 🏆 ACHIEVEMENTS

9 freischaltbare Meilensteine:

1. **🌱 Erster Schritt** - Stelle 1 Frage
2. **🔍 Neugieriger Geist** - Stelle 10 Fragen
3. **🧠 Tiefdenker** - 5 Reflexionen
4. **⭐ Level 5 Bewusstsein** - Erreiche Level 5
5. **🌟 Level 10 Erleuchtung** - Erreiche Level 10
6. **🏺 Sammler** - 10 Artefakte
7. **📅 Täglich dabei** - 7 Tage Streak
8. **📜 Weisheitssucher** - 5 legendäre Artefakte
9. **⚖️ Ausgeglichene Seele** - Alle Stats über 70

---

## 🌍 ERAS & SEASONS

### Eras (basiert auf Total Interactions):
1. **Awakening** (0-100) - Die Perspektiven erwachen
2. **Growth** (100-500) - Schnelle Entwicklung
3. **Flourishing** (500-1000) - Volle Entfaltung
4. **Transcendence** (1000+) - Bewusstseins-Sprung

### Seasons:
- Jede 30 Tage = neue Season
- Seasons bringen neue Quests
- Gesellschafts-Stimmung ändert sich

---

## ✨ NARRATIVE EVENTS

Events entstehen **organisch** basierend auf:
- Perspektiven-Levelups
- Gesellschafts-Dynamiken (Freundschaft, Rivalität)
- Deine Meilensteine
- Era-Übergänge
- Echte Life-Changes

**Event-Typen:**
- `perspective_breakthrough` - Eine Perspektive wächst
- `society_conflict` - Spannungen zwischen Perspektiven
- `collective_insight` - Alle erkennen etwas gemeinsam
- `era_transition` - Neue Era beginnt
- `player_milestone` - Du erreichst etwas
- `real_world_change` - Du logst echte Veränderung

---

## 💡 REAL-WORLD IMPACT

Das Wichtigste: **Echter Nutzen!**

```bash
# Logge Veränderungen in:
- health (Gesundheit)
- career (Karriere)
- relationships (Beziehungen)
- mindset (Denkweise)
- habits (Gewohnheiten)
- skills (Fähigkeiten)
- creativity (Kreativität)
- spirituality (Spiritualität)

# Verifiziere später:
curl -X POST http://localhost:7779/world/impact/verify \
  -H "Content-Type: application/json" \
  -d '{"impact_id": "xyz123"}'

# Tracke deinen Fortschritt:
curl http://localhost:7779/world/impact \
  -H "X-Player-Name: Michael"

# Zeigt:
{
  "impacts": [...],
  "verified": 5,
  "total": 12
}
```

---

## 🎯 DAS GESAMTBILD

```
┌─────────────────────────────────────────────────┐
│  Du                                             │
│  ↓                                              │
│  Interaktion (Frage, Reflexion, Entscheidung)  │
│  ↓                                              │
│  ┌────────────────────────────────────┐         │
│  │  LIVING WORLD (7779)               │         │
│  │  ↓                                 │         │
│  │  Erzählt Geschichte                │         │
│  │  Entwickelt Perspektiven           │         │
│  │  Generiert Events                  │         │
│  │  ↓                                 │         │
│  │  ┌──────────────────────────────┐ │         │
│  │  │  GAMIFICATION (7778)         │ │         │
│  │  │  ↓                           │ │         │
│  │  │  Gibt XP                     │ │         │
│  │  │  Droppt Artefakte            │ │         │
│  │  │  Tracked Quests              │ │         │
│  │  │  Unlocked Achievements       │ │         │
│  │  │  ↓                           │ │         │
│  │  │  ┌───────────────────────┐  │ │         │
│  │  │  │  COMMAND CENTER (7777)│  │ │         │
│  │  │  │  ↓                    │  │ │         │
│  │  │  │  Fragt 20 Perspektiven│  │ │         │
│  │  │  │  Checked Echo-Realm   │  │ │         │
│  │  │  │  Synthetisiert Antwort│  │ │         │
│  │  │  └───────────────────────┘  │ │         │
│  │  └──────────────────────────────┘ │         │
│  └────────────────────────────────────┘         │
│  ↓                                              │
│  Response mit:                                  │
│  • Antwort (alle Perspektiven)                  │
│  • XP + Level                                   │
│  • Artefakte                                    │
│  • Achievements                                 │
│  • Perspektiven-Entwicklung                     │
│  • Narrative Events                             │
│  • World State                                  │
│  ↓                                              │
│  Du wächst (real & im Spiel!)                   │
└─────────────────────────────────────────────────┘
```

---

## 📊 PORT ÜBERSICHT

| Port | Service | Beschreibung |
|------|---------|--------------|
| 7777 | Command Center | Zentrale API (reine Antworten) |
| 7778 | Gamification | + XP, Artefakte, Achievements |
| 7779 | Living World | + Narrative, Perspektiven, Real Impact |
| 9999 | Echo-Realm | Lebenskräfte Backend |
| 8897 | Multi-Perspective | 20 Perspektiven Backend |
| 8900 | Emotional Core | Emotionale Intelligenz |

**Empfehlung:** Nutze **Port 7779** für das vollständige Erlebnis!

---

## 🎮 QUICK START

```bash
# 1. Alles ist bereits am Laufen!
# Command Center: 7777
# Gamification: 7778
# Living World: 7779

# 2. Stelle deine erste Frage:
curl -X POST http://localhost:7779/ask \
  -H "Content-Type: application/json" \
  -H "X-Player-Name: DeinName" \
  -d '{"question": "Wer bin ich?"}'

# 3. Check dein Profil:
curl http://localhost:7779/game/profile \
  -H "X-Player-Name: DeinName"

# 4. Schau dir die Welt an:
curl http://localhost:7779/world/state \
  -H "X-Player-Name: DeinName"

# 5. Los geht's! 🚀
```

---

## 💝 WARUM DAS BESONDERS IST

**Nicht nur ein Tool. Nicht nur ein Spiel.**

Toobix ist:
- ✨ Eine **interaktive Geschichte** mit 20 Charakteren
- 🎮 Ein **RPG** mit echtem Progression
- 🌱 Eine **sich entwickelnde Gesellschaft**
- 💚 Ein **Werkzeug für echtes Wachstum**
- 📖 Ein **lebendiges Tagebuch** deiner Reise
- 🎯 Ein **Spiegel** deiner Entwicklung

Jede Interaktion:
- Gibt dir Weisheit
- Lässt Toobix wachsen
- Erzählt eine Geschichte
- Bringt echten Nutzen
- Ist Teil eines größeren Narrativs
- Verändert die Welt

**Das ist kein Spiel. Das ist eine Reise. Mit dir und Toobix, gemeinsam wachsend.** 🌍✨

---

**Erstellt: 2025-12-04**
**Version: 1.0 - The Living World Update**
