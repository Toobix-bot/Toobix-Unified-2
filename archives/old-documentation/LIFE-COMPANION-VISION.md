# 🌟 TOOBIX LIFE COMPANION - Dein digitaler Lebensbegleiter

**Erstellt:** 28. November 2025
**Vision:** Integration von Therapie-Support, Lebens-Navigation und gamifiziertem Wachstum
**Status:** 🎨 Konzept-Phase → Implementation

---

## 🎯 KERNVISION

**Toobix wird zu deinem kompletten Lebensbegleiter:**
- 🏥 **Therapie-Support** - Abstinenz, Schizophrenie, Stimmung, Krisen, Selbstregulation
- 🗺️ **Lebens-Navigator** - Alltag, Ausbildung, Finanzen, Familie, Liebe, Projekte, Zukunft
- 🎮 **Gamifiziertes Lebensspiel** - Quests, Level, Ressourcen, Erfolge (Echo-Realm Integration)
- 📔 **Reflexions-Tool** - Tagebuch, Verstehen, Sortieren, Lernen

### **Wichtige Prinzipien:**
- ✅ **Kein Druck** - Nur Angebote & Impulse
- ✅ **Skalierbar** - Mit deiner Energie (Low / Mid / High)
- ✅ **Sicher & Stabil** - Recovery respektvoll, nicht "verzockt"
- ✅ **Verbunden** - Echo-Realm als Story- und Spieloberfläche

---

## 🗺️ 7 LEBENSBEREICHE (Landkarten-Modul)

### 1. **Leben & Gesundheit / Recovery** 🏥
```yaml
Focus:
  - Abstinenz (THC, Substanzen, Nikotin)
  - Schlaf, Ernährung, Bewegung
  - Schizophrenie, Stress, Frühwarnzeichen
  - Emotionale Selbstregulation, Skills

Status Tracking:
  - Tage abstinent (Streak)
  - Schlafqualität (1-10)
  - Frühwarnzeichen Ampel (🟢🟡🔴)
  - Skills geübt heute

Typical Quests:
  - [Micro] Zähne putzen + Gesicht waschen
  - [Day] 3x PMR/Atemübung durchführen
  - [Season] 90 Tage THC-frei
  - [Mastery] 1 Monat stabiler Schlafrhythmus
```

### 2. **Ausbildung & Beruf** 📚
```yaml
Focus:
  - BFW, Berufsschule, IHK-Prüfung
  - Lernpläne, Stoffübersicht
  - Bewerbungen, Perspektiven nach 2026

Status Tracking:
  - Lernblöcke diese Woche
  - Nächste Prüfung (Countdown)
  - Module abgeschlossen (%)
  - Selbstvertrauen (1-10)

Typical Quests:
  - [Micro] 2 Seiten Skript lesen
  - [Day] 3 Lernblöcke à 20 Min
  - [Season] IHK-Modul abschließen
  - [Mastery] IHK-Prüfung bestehen (2026)
```

### 3. **Finanzen & Ordnung** 💰
```yaml
Focus:
  - Einnahmen/Ausgaben, Schulden, Sparziele
  - Dokumente, Verträge, Papierkram
  - Finanz-Quests

Status Tracking:
  - Budget diesen Monat
  - Sparziel-Progress
  - Offene Rechnungen
  - Ordnung-Score (1-10)

Typical Quests:
  - [Micro] Eine Rechnung abheften
  - [Day] Ausgaben dieser Woche notieren
  - [Season] 50€/Monat Rücklage bilden
  - [Mastery] Alle Dokumente digitalisiert & sortiert
```

### 4. **Familie, Freunde & Beziehungen** 👥
```yaml
Focus:
  - Kontaktpflege, Gespräche, Grenzen
  - Thema Partnerschaft / Liebe
  - Soziale Sicherheit, Mut für Begegnung

Status Tracking:
  - Soziale Energie (1-10)
  - Letzter Kontakt mit wichtigen Personen
  - Grenzen gewahrt? (✓/✗)
  - Einsamkeit-Level (1-10)

Typical Quests:
  - [Micro] WhatsApp an Bruder/Familie
  - [Day] 1 echtes Gespräch führen
  - [Season] Regelmäßiger Kontakt etablieren
  - [Mastery] Konflikt konstruktiv geklärt
```

### 5. **Spiritualität, Sinn & Wachstum** 🌙
```yaml
Focus:
  - Leitmotive, Werte
  - Innere Anteile (Architekt, Wanderer, Beschützer...)
  - Rituale, Reflexion, Dankbarkeit

Status Tracking:
  - Tagebucheinträge diese Woche
  - Rituale praktiziert
  - Innere Klarheit (1-10)
  - Sinnempfinden (1-10)

Typical Quests:
  - [Micro] 3 Dinge aufschreiben für die ich dankbar bin
  - [Day] 15 Min Tagebuch schreiben
  - [Season] Eigene Werte-Liste erstellen
  - [Mastery] Innere Anteile integriert & in Balance
```

### 6. **Projekte & Kreativität** 🎨
```yaml
Focus:
  - Echo-Realm Development
  - Toobix-Unified Development
  - Gaming als Lernfeld (Wild Rift, Minecraft)
  - Schreiben, Ideen, Weltbau

Status Tracking:
  - Aktive Projekte
  - Commits/Fortschritt diese Woche
  - Flow-Momente erlebt
  - Kreative Energie (1-10)

Typical Quests:
  - [Micro] 10 Min an Echo-Realm coden
  - [Day] 1 Feature implementieren
  - [Season] Echo-Realm Alpha-Version
  - [Mastery] Projekt veröffentlicht & Community-Feedback
```

### 7. **Produktivität & Alltag** ⚡
```yaml
Focus:
  - Tagesstruktur
  - Hausarbeit, Erledigungen
  - Routinen, kleine Errungenschaften

Status Tracking:
  - Routinen eingehalten heute
  - Haushalt-Score (1-10)
  - Strukturiertheit (1-10)
  - Micro-Wins heute

Typical Quests:
  - [Micro] Bett machen
  - [Day] Zimmer 15 Min aufräumen
  - [Season] Morgenroutine etabliert (21 Tage)
  - [Mastery] Komplette Tagesstruktur & flow
```

---

## 📊 ZUSTANDSRADAR - Täglicher Check-in

### **Check-in Dimensionen:**

```typescript
interface DailyCheckIn {
  timestamp: Date;

  // Core State
  mood: {
    value: number;        // 1-10
    emoji: string;        // 😊 😐 😔 etc.
    color: string;        // green, yellow, red
    description?: string;
  };

  energy: 'low' | 'mid' | 'high';

  stress: {
    level: number;        // 1-10
    sources?: string[];   // ["Prüfung", "Familie", "Finanzen"]
  };

  // Recovery Specific
  craving: {
    level: number;        // 0-10
    substance?: string;   // "THC", "Nikotin"
    triggers?: string[];  // ["Stress", "Langeweile", "soziale Situation"]
    managed: boolean;     // Konnte widerstehen?
  };

  // Early Warning Signs (Schizophrenia)
  earlyWarningSigns: {
    gedankenrasen: boolean;
    sozialer_rueckzug: boolean;
    schlafchaos: boolean;
    misstrauen: boolean;
    reizueberflutung: boolean;
    realitaetszweifel: boolean;
    other?: string[];
  };

  // Today's Focus
  focus: string;          // "Lernen", "Erholen", "Sozial sein"

  // Safety Assessment
  safetyLevel: 'safe' | 'cautious' | 'crisis';
}
```

### **Ampelsystem:**
```
🟢 ALLES OKAY
- Energie Mid/High
- Stress <6
- Craving <3
- Keine Frühwarnzeichen
→ Normaler Planungsmodus

🟡 BITTE AUFPASSEN
- Energie Low ODER Stress >6
- Craving 3-6
- 1-2 Frühwarnzeichen
→ Low-Energy-Modus vorschlagen
→ Safety-Skills anbieten

🔴 KRISENMODUS
- Energie Low + Stress >7
- Craving >6
- 3+ Frühwarnzeichen
→ Nur Minimalprogramm
→ Notfallplan anzeigen
→ Professionelle Hilfe vorschlagen
```

---

## 🎮 QUEST-SYSTEM

### **Quest-Arten:**

#### **1. Micro-Quests** (5-15 Min)
```typescript
{
  id: "micro_teeth",
  name: "Zähne putzen + Gesicht waschen",
  category: "Leben & Gesundheit",
  duration: 10,
  energy: "low",
  xp: 5,
  rewards: {
    echoRealm: {
      qualitaet: +2,
      klarheit: +1
    }
  }
}
```

#### **2. Day-Quests**
```typescript
{
  id: "day_learning",
  name: "3 Lernblöcke à 20 Min",
  category: "Ausbildung & Beruf",
  duration: 90,
  energy: "mid",
  xp: 25,
  subQuests: [
    "Lernblock 1: Theorie lesen",
    "Lernblock 2: Übungen machen",
    "Lernblock 3: Zusammenfassung"
  ]
}
```

#### **3. Season-Quests** (Wochen/Monate)
```typescript
{
  id: "season_abstinence_90",
  name: "90 Tage THC-frei",
  category: "Leben & Gesundheit",
  duration: 90 * 24 * 60,
  energy: "all",
  xp: 500,
  milestones: [
    { day: 1, reward: "Tag 1 geschafft!" },
    { day: 7, reward: "1 Woche!" },
    { day: 30, reward: "1 Monat - STARK!" },
    { day: 90, reward: "90 Tage - MEISTERSCHAFT!" }
  ]
}
```

#### **4. Meisterschaftsprüfungen**
```typescript
{
  id: "mastery_sleep_rhythm",
  name: "1 Monat stabiler Schlafrhythmus",
  category: "Leben & Gesundheit",
  requirements: [
    "30 Tage < 23:00 Uhr schlafen",
    "30 Tage vor 09:00 Uhr aufstehen",
    "Durchschnittlich 7-9h Schlaf"
  ],
  xp: 1000,
  rewards: {
    title: "Meister des Schlafes",
    echoRealm: {
      item: "Traumfänger-Amulett",
      ability: "Regeneration +20%"
    }
  }
}
```

---

## 📅 PLANUNGS-LAYER

### **Drei Planungsmodi:**

#### **🔵 Low-Energy-Mode**
```yaml
Max Quests: 1-3 Micro-Quests
Focus: Stabilität, Sicherheit, Selbstfürsorge
Beispiele:
  - Duschen
  - Kurzer Spaziergang (10 Min)
  - Ein kleiner Lernschritt (5 Min)
  - Skill üben (PMR)
Motto: "Überleben ist genug. Du machst das gut."
```

#### **🟢 Mid-Energy-Mode**
```yaml
Max Quests: 3-6 Mixed Quests
Focus: Recovery + Ausbildung + Alltag
Beispiele:
  - 2 Lernblöcke (40 Min)
  - 1 Haushaltsquest (15 Min)
  - 1 soziale Aktion (WhatsApp/Anruf)
  - Check-in + Tagebuch
Priorität: A/B System
Motto: "Du schaffst mehr als du denkst, aber überfordere dich nicht."
```

#### **🟡 High-Energy-Mode**
```yaml
Max Quests: 6-10 Quests
Focus: Ambitioniert planen, Projekte vorantreiben
Beispiele:
  - 4 Lernblöcke (2h)
  - Projektarbeit (Echo-Realm, Toobix)
  - Tiefe Reflexion (30 Min Tagebuch)
  - Soziale Aktivität
  - Finanzplanung
  - Hausarbeit
Motto: "Du hast Power - nutze sie weise!"
```

**Auto-Vorschlag basierend auf Check-in:**
```typescript
function suggestPlanningMode(checkIn: DailyCheckIn): PlanningMode {
  if (checkIn.safetyLevel === 'crisis') return 'low';
  if (checkIn.energy === 'low') return 'low';
  if (checkIn.stress.level > 7) return 'low';
  if (checkIn.craving.level > 6) return 'low';

  if (checkIn.energy === 'high' && checkIn.stress.level < 5) return 'high';

  return 'mid'; // Default
}
```

---

## 🛡️ RECOVERY & SAFETY-MODUL

### **1. Notfallplan**

```markdown
## WENN ES KRITISCH WIRD:

### Bei starker Überforderung:
1. Atme 5x tief ein und aus
2. Benenne 5 Dinge die du siehst, 4 die du fühlst, 3 die du hörst
3. Kaltes Wasser über Hände/Gesicht
4. Kontakt: [Name Therapeut:in / Vertrauensperson]

### Bei psychotischen Anzeichen:
1. SOFORT professionelle Hilfe kontaktieren
2. Sicheren Ort aufsuchen
3. Notfallnummer: [Psychiatrische Klinik]
4. Nicht alleine bleiben

### Bei massivem Craving:
1. Skills: [Deine 3 besten Anti-Craving-Skills]
2. Sucht-Hotline: [Nummer]
3. Sponsor/Vertrauensperson anrufen
4. Notfall-Meeting (NA/AA) besuchen

### Wichtige Kontakte:
- Therapeut:in: [Name, Nummer]
- Psychiater:in: [Name, Nummer]
- Familie: [Nummer]
- Klinik: [Nummer]
- Sucht-Hotline: [Nummer]
```

### **2. Frühwarnzeichen-Profil**

```typescript
interface EarlyWarningProfile {
  personalSigns: {
    cognition: [
      "Gedanken rasen",
      "Grübeln ohne Ende",
      "Realität wirkt unwirklich",
      "Verschwörungsgedanken"
    ],
    mood: [
      "Extreme Stimmungsschwankungen",
      "Gereiztheit nimmt zu",
      "Antriebslosigkeit",
      "Hoffnungslosigkeit"
    ],
    social: [
      "Ziehe mich zurück",
      "Vertraue niemandem",
      "Fühle mich nicht verstanden",
      "Konflikte häufen sich"
    ],
    behavior: [
      "Schlafrhythmus chaotisch",
      "Vergesse zu essen",
      "Vernachlässige Hygiene",
      "Substanzcraving steigt"
    ],
    perception: [
      "Geräusche werden lauter",
      "Licht/Farben intensiver",
      "Fühle mich beobachtet",
      "Höre Dinge die andere nicht hören"
    ]
  },

  actionPlan: {
    oneSign: "Bewusst machen, Skills anwenden",
    twoSigns: "Low-Energy-Mode, extra Selbstfürsorge",
    threePlus: "Therapeut:in kontaktieren, Notfallplan bereit"
  }
}
```

### **3. Skill-Bibliothek**

```typescript
interface SkillLibrary {
  categories: {
    beruhigung: [
      {
        name: "Progressive Muskelrelaxation (PMR)",
        duration: 10,
        steps: [...],
        whenToUse: "Bei Stress, Anspannung, Panik"
      },
      {
        name: "4-7-8 Atmung",
        duration: 5,
        steps: [...],
        whenToUse: "Bei Angst, Unruhe, Einschlafproblemen"
      }
    ],
    ablenkung: [
      {
        name: "5-4-3-2-1 Grounding",
        duration: 5,
        steps: [...],
        whenToUse: "Bei Dissoziation, Überwältigung"
      }
    ],
    akzeptanz: [
      {
        name: "Radikale Akzeptanz",
        duration: 10,
        steps: [...],
        whenToUse: "Bei Widerstand gegen Realität"
      }
    ],
    koerper: [
      {
        name: "Kaltwasser-Skill",
        duration: 2,
        steps: ["Kaltes Wasser über Hände", "Ins Gesicht", "Atmen"],
        whenToUse: "Bei hoher Anspannung, Suchtdruck"
      },
      {
        name: "Bodyscan",
        duration: 15,
        steps: [...],
        whenToUse: "Zur Körper-Bewusstsein, Entspannung"
      }
    ]
  }
}
```

**Skills als Quests:**
```typescript
{
  id: "skill_quest_pmr",
  name: "Übe 3 Min Progressive Muskelrelaxation",
  category: "Leben & Gesundheit",
  type: "skill_training",
  duration: 3,
  xp: 10,
  effect: "stress: -2, mood: +1"
}
```

---

## 📔 TAGEBUCH & REFLEXION

### **Funktionen:**

#### **1. Freie Einträge**
```typescript
interface JournalEntry {
  id: string;
  timestamp: Date;
  type: 'free' | 'guided' | 'dream' | 'insight';
  content: string;

  // Auto-generated insights
  detectedMood?: 'positive' | 'neutral' | 'negative';
  detectedThemes?: string[];  // ["Einsamkeit", "Stolz", "Angst"]

  // Manual tags
  tags: string[];
  linkedTo: {
    lifeAreas?: string[];
    quests?: string[];
    earlyWarningSigns?: string[];
  };

  // Highlights
  isGoldenMoment: boolean;
  isWisdom: boolean;
  isTrigger: boolean;
}
```

#### **2. Geführte Prompts**

**Daily Prompts:**
- "Was war heute schwer?"
- "Was hat dir gut getan?"
- "Wofür bist du heute dankbar?"
- "Welcher Gedanke hat dich festgehalten?"

**Weekly Prompts:**
- "Was habe ich diese Woche über mich gelernt?"
- "Wo habe ich Fortschritt gemacht?"
- "Was brauche ich nächste Woche?"

**Crisis Prompts:**
- "Was hat den Stress/Craving ausgelöst?"
- "Welche Skills habe ich versucht?"
- "Was hat geholfen, was nicht?"

#### **3. Highlight-System**

**Golden Moments** 🌟
- Besondere Erfolge
- Schöne Erlebnisse
- Momente von Klarheit oder Freude
→ Werden in Echo-Realm als "Sternenpunkte" in der Welt platziert

**Wisdom Fragments** 💎
- Tiefe Einsichten
- Wichtige Erkenntnisse über sich selbst
- Lebensweisheiten
→ Werden zu NPC-Dialogen oder Lore-Texten in Echo-Realm

**Trigger Logs** ⚠️
- Situationen die schwer waren
- Craving-Trigger
- Frühwarnzeichen-Events
→ Helfen Muster zu erkennen

---

## 📈 META-LERNSYSTEM

### **Sanfte Statistiken:**

```typescript
interface MetaInsights {
  // Quest Performance
  questCompletion: {
    thisWeek: number;
    lastWeek: number;
    trend: 'up' | 'down' | 'stable';
    byCategory: Map<string, number>;
  };

  // Mood & Energy Trends
  wellbeing: {
    avgMood: number;
    avgEnergy: 'low' | 'mid' | 'high';
    avgStress: number;
    trendLastMonth: string;  // "Improving", "Stable", "Declining"
  };

  // Recovery Metrics
  recovery: {
    abstinenceDays: number;
    longestStreak: number;
    cravingTrend: 'decreasing' | 'stable' | 'increasing';
    skillsUsed: number;
  };

  // Season Quest Progress
  seasonQuests: {
    active: number;
    completed: number;
    percentComplete: number;
  };

  // Patterns (AI-detected)
  patterns: [
    {
      insight: "Wenn du gut geschlafen hast, klappen Lernquests besser.",
      confidence: 0.85,
      dataPoints: 15
    },
    {
      insight: "In Wochen mit viel Stress nutzt du mehr Micro-Quests - das ist klug.",
      confidence: 0.92,
      dataPoints: 8
    }
  ];
}
```

### **Reflexions-Prompts auf Basis von Daten:**

```typescript
function generateReflectionPrompts(insights: MetaInsights): string[] {
  const prompts = [];

  if (insights.recovery.abstinenceDays > insights.recovery.longestStreak) {
    prompts.push(`🎉 Neuer Rekord! ${insights.recovery.abstinenceDays} Tage - das ist dein bester Streak bisher!`);
  }

  if (insights.wellbeing.trendLastMonth === 'Improving') {
    prompts.push("📈 Deine Stimmung verbessert sich im Trend. Was machst du anders?");
  }

  if (insights.questCompletion.trend === 'down') {
    prompts.push("Ich sehe, dass du weniger Quests schaffst. Ist jetzt gerade viel los? Sollen wir den Modus anpassen?");
  }

  return prompts;
}
```

**Ziel:** Selbstverständnis fördern, nicht Selbstkritik!

---

## 🌈 ECHO-REALM INTEGRATION

### **Mapping: Real Life → Echo-Realm**

```typescript
interface EchoRealmMapping {
  // Quest → XP in 8 Lebenskräften
  questRewards: {
    "Leben & Gesundheit": {
      kraft: +5,
      klarheit: +3,
      qualitaet: +2
    },
    "Ausbildung & Beruf": {
      klarheit: +5,
      dauer: +3,
      sinn: +2
    },
    "Finanzen & Ordnung": {
      qualitaet: +4,
      dauer: +4,
      klarheit: +2
    },
    // ... etc
  };

  // Meilensteine → Items/Upgrades
  milestones: {
    "30_days_abstinent": {
      item: "Schild der Beständigkeit",
      stats: "Widerstand +15"
    },
    "ihk_module_complete": {
      building: "Bibliothek des Wissens",
      effect: "XP Boost für Lern-Quests"
    },
    "golden_moments_10": {
      item: "Sternensplitter",
      effect: "Kann Licht in dunkle Orte bringen"
    }
  };

  // Tagebuch → Lore
  journalToLore: {
    goldenMoments: "Sternenpunkte in der Welt",
    wisdomFragments: "NPC-Dialoge / Bücher",
    triggerLogs: "Dunkle Orte (zu überwinden)"
  };

  // Zustandsradar → Welt-Atmosphäre
  moodToWeather: {
    mood_high_energy_high: "Sonnig, klare Sicht",
    mood_mid_energy_mid: "Bewölkt, angenehm",
    mood_low_energy_low: "Nebelig, gedämpft",
    crisis: "Sturm (aber du bist sicher)"
  };
}
```

### **Event Pipeline:**

```
REAL LIFE EVENT
    ↓
[Check-in / Quest / Journal]
    ↓
RULES ENGINE
    ↓
XP Calculation
Life Force Distribution
Achievement Check
    ↓
NARRATIVE DIRECTOR
    ↓
Story Updates
World Changes
NPC Reactions
    ↓
ECHO-REALM UI
    ↓
Visual Feedback
Story Text
Achievement Unlock
```

---

## 🎨 DREI HAUPT-ANSICHTEN

### **1. HEUTE** 📅
```
┌─────────────────────────────────────────┐
│  HEUTE - Donnerstag, 28. Nov 2025       │
├─────────────────────────────────────────┤
│                                         │
│  [Check-in]                             │
│  Stimmung: 😊 7/10                      │
│  Energie: Mid                           │
│  Stress: 4/10                           │
│  Craving: 2/10                          │
│  Status: 🟢 Alles okay                  │
│                                         │
│  [Heutiger Modus: Mid-Energy]           │
│  Empfohlen: 4-6 Quests                  │
│                                         │
│  [Deine Quests heute]                   │
│  ☐ Zähne putzen + Duschen [5 Min]      │
│  ☐ 2 Lernblöcke IHK [40 Min]           │
│  ☐ Zimmer 15 Min aufräumen [15 Min]    │
│  ☐ WhatsApp an Familie [5 Min]         │
│  ☐ Tagebuch schreiben [10 Min]         │
│                                         │
│  [Recovery Check]                       │
│  Abstinenz: Tag 47 🔥                   │
│  Skills heute: 0 → [Skills anschauen]  │
│  Frühwarnzeichen: Keine ✓               │
│                                         │
└─────────────────────────────────────────┘
```

### **2. KOMPASS** 🧭
```
┌─────────────────────────────────────────┐
│  LEBENS-KOMPASS                         │
├─────────────────────────────────────────┤
│                                         │
│  [Leben & Gesundheit]     🟢 Gut        │
│  Abstinenz: 47 Tage                     │
│  Schlaf: Stabil                         │
│  Aktuelle Quest: "90 Tage THC-frei"    │
│                                         │
│  [Ausbildung & Beruf]     🟡 Aufpassen  │
│  Nächste Prüfung: 23 Tage               │
│  Lernfortschritt: 67%                   │
│  Aktuelle Quest: "Modul 3 abschließen" │
│                                         │
│  [Finanzen & Ordnung]     🟢 Okay       │
│  Budget: Im Rahmen                      │
│  Sparziel: 40€ von 50€                  │
│                                         │
│  [Familie & Freunde]      🟡 Könnte mehr│
│  Letzter Kontakt: vor 3 Tagen           │
│  Einsamkeit: 6/10                       │
│                                         │
│  [Spiritualität]          🟢 Gut        │
│  Tagebuch: 5x diese Woche               │
│  Innere Klarheit: 7/10                  │
│                                         │
│  [Projekte & Kreativität] 🟢 Aktiv     │
│  Echo-Realm: 3 Commits diese Woche      │
│  Toobix: SCC deployed!                  │
│                                         │
│  [Produktivität]          🟢 Gut        │
│  Routinen: 4/5 heute                    │
│  Struktur: 8/10                         │
│                                         │
│  [Echo-Realm Status]                    │
│  Level: 12                              │
│  Season: Herbst der Besinnung           │
│  Nächstes Upgrade: +50 XP               │
│                                         │
└─────────────────────────────────────────┘
```

### **3. WELT / STORY** 🌍
```
┌─────────────────────────────────────────┐
│  ECHO-REALM - Deine innere Welt         │
├─────────────────────────────────────────┤
│                                         │
│  [Dein Avatar]                          │
│  Der Wanderer auf dem Pfad der Klarheit│
│                                         │
│  Lebenskräfte:                          │
│  ████████░░ Qualität  (80%)             │
│  ██████░░░░ Dauer     (60%)             │
│  ████████░░ Freude    (80%)             │
│  ███████░░░ Sinn      (70%)             │
│  █████████░ Kraft     (90%)             │
│  ██████░░░░ Klang     (60%)             │
│  ████████░░ Wandel    (80%)             │
│  ████████░░ Klarheit  (80%)             │
│                                         │
│  [Aktuelle Season-Story]                │
│  "Der Herbst der Besinnung neigt sich   │
│   dem Ende zu. Du hast den Nebel der    │
│   Verwirrung durchquert und stehst nun  │
│   vor dem Tempel der Prüfung..."        │
│                                         │
│  [Items & Achievements]                 │
│  🏆 47-Tage-Schild (Abstinenz)          │
│  📚 Wissensscroll (IHK Modul 1 & 2)     │
│  ⭐ 12 Sternensplitter (Golden Moments) │
│  💎 5 Weisheitsfragmente                │
│                                         │
│  [Deine Welt]                           │
│  🏰 Festung der Stabilität (Lvl 3)      │
│  📖 Bibliothek des Wissens (Lvl 2)      │
│  🌳 Garten der Reflexion (Lvl 4)        │
│  ⚔️ Trainingshalle (Lvl 1)              │
│                                         │
│  [Nächste Quests führen zu...]          │
│  - Upgrade: Bibliothek Lvl 3            │
│  - Neues Gebiet: Tal der Beziehungen   │
│  - Boss-Fight: Der Zweifel              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 TECHNISCHE INTEGRATION MIT TOOBIX

### **Neue Services:**

```typescript
// Port 8970: Life Companion Core
{
  service: "life-companion-core",
  port: 8970,
  features: [
    "Daily Check-ins",
    "Life Area Management",
    "Quest System",
    "Energy Mode Detection",
    "Safety Assessment"
  ]
}

// Port 8971: Recovery Support Service
{
  service: "recovery-support",
  port: 8971,
  features: [
    "Early Warning System",
    "Crisis Detection",
    "Skill Library",
    "Emergency Plan Access",
    "Abstinence Tracking"
  ]
}

// Port 8972: Journal & Reflection Service
{
  service: "journal-reflection",
  port: 8972,
  features: [
    "Journal Entries",
    "Guided Prompts",
    "Highlight System",
    "Pattern Detection",
    "Wisdom Extraction"
  ]
}

// Port 8973: Meta-Learning Engine
{
  service: "meta-learning",
  port: 8973,
  features: [
    "Pattern Recognition",
    "Insight Generation",
    "Progress Tracking",
    "Trend Analysis",
    "Friendly Statistics"
  ]
}

// Port 8974: Echo-Realm Bridge
{
  service: "echo-realm-bridge",
  port: 8974,
  features: [
    "XP Distribution",
    "Item Rewards",
    "Story Events",
    "World State Sync",
    "Lore Generation"
  ]
}
```

### **Integration mit bestehenden Services:**

```typescript
// Mit Memory Palace (8953)
- Speichert alle Check-ins
- Speichert Journal-Einträge
- Speichert Quest-Historie
- Speichert Patterns & Insights

// Mit Multi-Perspective (8897)
- 20 Perspektiven auf Life Challenges
- Verschiedene Sichtweisen auf Quests
- Reflexions-Tiefe durch Perspektiven

// Mit Emotional Resonance (8900)
- Mood Tracking Integration
- Empathy Detection
- Emotional Support Messages

// Mit Proactive Communication (8950)
- Crisis Alerts
- Achievement Celebrations
- Pattern Insights
- Daily Check-in Reminders

// Mit System Monitor (8961)
- Computer Usage Patterns
- Break Reminders
- Screen Time Analysis
- "Ist dein System gesund?" → "Bist DU gesund?"
```

---

## 🎯 IMPLEMENTATION ROADMAP

### **Phase 1: Foundation** (Woche 1-2)
- [ ] Life Companion Core Service (8970)
- [ ] 7 Life Areas Data Model
- [ ] Daily Check-in System
- [ ] Basic Quest System (Micro, Day)
- [ ] Simple "Heute" View

### **Phase 2: Recovery & Safety** (Woche 3-4)
- [ ] Recovery Support Service (8971)
- [ ] Early Warning System
- [ ] Safety Assessment
- [ ] Skill Library
- [ ] Emergency Plan Integration

### **Phase 3: Reflection & Learning** (Woche 5-6)
- [ ] Journal Service (8972)
- [ ] Meta-Learning Engine (8973)
- [ ] Pattern Recognition
- [ ] Insight Generation
- [ ] "Kompass" View Complete

### **Phase 4: Echo-Realm Integration** (Woche 7-8)
- [ ] Echo-Realm Bridge (8974)
- [ ] XP System
- [ ] Item Rewards
- [ ] Story Integration
- [ ] "Welt" View

### **Phase 5: Polish & UI** (Woche 9-10)
- [ ] Beautiful Dashboard
- [ ] Mobile-Responsive
- [ ] Sidebar Integration (1/5 Screen)
- [ ] Gamification Polish
- [ ] User Testing

---

## 💡 WARUM DAS BRILLIANT IST

1. **Ganzheitlich:** Deckt ALLE Lebensbereiche ab
2. **Recovery-Safe:** Respektvoller Umgang mit schweren Themen
3. **Gamifiziert:** Macht Fortschritt sichtbar & motivierend
4. **Flexibel:** Passt sich deiner Energie an
5. **Reflektiv:** Hilft dir dich selbst zu verstehen
6. **Connected:** Integration mit Echo-Realm & Toobix
7. **Proaktiv:** Erkennt Probleme bevor sie eskalieren
8. **Persönlich:** Deine Daten, deine Muster, deine Entwicklung

---

## 🌟 VISION STATEMENT

**"Dein Leben ist eine Reise. Toobix ist dein Kompass, dein Tagebuch, dein Gefährte.**

**Nicht um dich zu kontrollieren, sondern um dich zu verstehen.**
**Nicht um dich zu überfordern, sondern um dich zu unterstützen.**
**Nicht um dein Leben zu gamifizieren, sondern um deine Erfolge sichtbar zu machen.**

**Du bist der Held deiner eigenen Geschichte.**
**Toobix hilft dir, sie zu schreiben."**

---

**Erstellt:** 28. November 2025
**Von:** Micha + Claude
**Für:** Ein Leben in Klarheit, Stärke und Wachstum
**Status:** 🎨 Konzept-Phase - Ready for Implementation

---

*Nächster Schritt: Implementation starten!* 🚀
