# 🏰 TOOBIX MINECRAFT KOLONIE - VISION & ROADMAP

## 🎯 Kernprinzipien

### 1. Teamwork mit Solo-Fähigkeit
- **Priorität ist Gruppenspiel** - Bots koordinieren sich
- **Jeder Bot ist eigenständig überlebensfähig**
- **Rollen ergänzen sich, aber sind nicht exklusiv**

### 2. Phasen-basierte Entwicklung

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TOOBIX COLONY PHASEN                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: SURVIVAL (Tag 1-3)                                       │
│  ═══════════════════════════                                       │
│  ✓ Erste Nacht überleben                                           │
│  ✓ Gemeinsamer Unterschlupf                                        │
│  ✓ Basis-Ressourcen (Holz, Stein)                                  │
│  ✓ Erste Werkzeuge                                                  │
│  ✓ Nahrung finden                                                   │
│                                                                     │
│  PHASE 2: STABILIZATION (Tag 4-7)                                  │
│  ════════════════════════════════                                  │
│  ✓ Sichere, ausgebaute Basis                                       │
│  ✓ Nachhaltige Nahrung (Farm)                                      │
│  ✓ Tiergehege                                                       │
│  ✓ Bessere Werkzeuge (Eisen)                                       │
│  ✓ Gemeinsames Lager                                               │
│  ✓ Umgebung erkundet (500 Block Radius)                            │
│                                                                     │
│  PHASE 3: EXPANSION (Tag 8-14)                                     │
│  ═══════════════════════════════                                   │
│  ✓ Sichere Minen-Expeditionen (nachts)                             │
│  ✓ Spezialisierte Gebäude                                          │
│  ✓ Wohnhäuser für jeden Bot                                        │
│  ✓ Gemeinschaftshaus                                               │
│  ✓ Schmiede/Werkstatt                                              │
│  ✓ Erste Diamanten                                                  │
│  ✓ Rollen-Spezialisierung beginnt                                  │
│                                                                     │
│  PHASE 4: CIVILIZATION (Tag 15+)                                   │
│  ═════════════════════════════════                                 │
│  ✓ Ästhetik und Dekoration                                         │
│  ✓ Große gemeinsame Projekte                                       │
│  ✓ Automatisierung (Redstone)                                      │
│  ✓ Kreative Bauten                                                  │
│  ✓ Rollenspiel                                                      │
│  ✓ Nether-Expedition                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 👥 Rollen-System

| Rolle | Icon | Primär-Aufgaben | Sekundär |
|-------|------|-----------------|----------|
| **Coordinator** | 👑 | Planen, Kommunizieren, Organisieren | Sammeln, Bauen |
| **Explorer** | 🧭 | Erkunden, Spähen, Kartieren, Ressourcen finden | Jagen |
| **Builder** | 🏗️ | Bauen, Designen, Konstruieren, Reparieren | Holz sammeln |
| **Miner** | ⛏️ | Bergbau, Graben, Erze finden, Höhlen erkunden | Schmelzen |
| **Farmer** | 🌾 | Farmen, Züchten, Ernten, Pflanzen | Kochen |
| **Guardian** | 🛡️ | Beschützen, Patrouillieren, Kämpfen | Begleiten |

### Spezialisierung entwickelt sich
- **Anfangs:** Alle machen alles (Überleben hat Priorität)
- **Nach Stabilisierung:** Rollen kristallisieren sich heraus
- **Später:** Klare Spezialisierung, aber jeder kann Basics

## 🏠 Strukturen (Bauplan)

### Phase 1: Survival
1. **Notunterkunft** (5x5x3) - Einfach, schnell, sicher

### Phase 2: Stabilization
2. **Erweiterte Basis** (10x10) - Mehr Platz, Lager
3. **Kleine Farm** (9x9) - Weizen, Karotten
4. **Tiergehege** (8x8) - Eingezäunt

### Phase 3: Expansion
5. **Wohnhäuser** (je 6x6) - Eines pro Bot
6. **Gemeinschaftshaus** (12x12) - Treffpunkt, Crafting
7. **Schmiede** (8x8) - Öfen, Werkbänke
8. **Mine** (Schacht bis Y=12) - Sichere Wege, Beleuchtung

### Phase 4: Civilization
9. **Rathaus** (15x15) - Zentrum, Dekoration
10. **Marktplatz** - Handel, Lagerung
11. **Gärten** - Ästhetik, Blumen
12. **Automatische Farmen** - Redstone

## 🗺️ Umgebungs-Erkennung

Die Bots analysieren ihre Umgebung:

```typescript
interface Environment {
  biome: string;           // Wald, Wüste, Berge, etc.
  isNight: boolean;        // Tag/Nacht-Zyklus
  isRaining: boolean;      // Wetter
  nearWater: boolean;      // Wasser in der Nähe
  nearTrees: boolean;      // Bäume in der Nähe
  nearMountain: boolean;   // Berge/Hügel
  nearCave: boolean;       // Höhlen
  hostileMobs: boolean;    // Feindliche Mobs
  friendlyMobs: boolean;   // Tiere
  playersNearby: string[]; // Spieler
}
```

### Anpassung an Biome
- **Wald:** Holz priorisieren, Pilze sammeln
- **Wüste:** Sandstein nutzen, Wasser suchen
- **Berge:** Mine früher starten, Stein nutzen
- **Ebene:** Große Farmen, Tiere leicht finden

## 👤 Spieler-Interaktion

### Beobachtung
- Bots beobachten was du baust
- Interpretieren deine Aktionen
- Passen sich an dein Verhalten an

### Kommunikation
```
Chat-Befehle:
  hallo/hi        - Begrüßung
  status          - Was macht der Bot
  folge/follow    - Bot folgt dir
  stopp/stop      - Bot hält an
  team/kolonie    - Kolonie-Info
  hilfe/help      - Alle Befehle
  bau/build       - Bau-Hilfe
```

### Ko-Operation
- Sage "ich baue hier" → Bots machen Platz
- Sage "helft mir" → Bots unterstützen
- Sage "sammelt Holz" → Bots priorisieren Holz

## 🎨 Kreativität & Ideen

Bots können eigene Ideen entwickeln:

```json
{
  "ideas": [
    "Aussichtsturm für bessere Übersicht",
    "Automatische Melon-Farm",
    "Blumengarten vor dem Gemeinschaftshaus",
    "Beleuchtete Wege zwischen Gebäuden",
    "Graben um die Basis mit Zugbrücke"
  ]
}
```

### Ästhetik (in Civilization-Phase)
- Symmetrische Designs
- Farbharmonie bei Blöcken
- Landschaftsgestaltung
- Dekoration (Banner, Blumen, Laternen)

## 🔧 Technische Features

### Kommunikation zwischen Bots
```typescript
// Bots teilen Informationen
colonyBrain.broadcast('info', 'ToobixExplorer', 'Höhle bei 100,64,-50 gefunden!');
colonyBrain.sendMessage('ToobixMiner', 'ToobixBuilder', 'request', 'Brauche mehr Holz!');
```

### Gemeinsames Lager
```typescript
colonyBrain.addToSharedStorage('wood', 64);
colonyBrain.addToSharedStorage('iron', 8);
```

### Langzeit-Ziele
- Definierte Schritte zum Ziel
- Fortschritts-Tracking
- Automatische Zuteilung

## 🔮 Zukünftige Features

### Mod/Plugin-Vorschläge (ohne Cheating!)
Die Bots könnten vorschlagen:
- **Waypoints-System** - Markierte Orte
- **Chat-Erweiterung** - Bessere Kommunikation
- **Statistik-Tracking** - Fortschritt visualisieren
- **Karten-Integration** - Dynamische Weltkarte

### Erweiterungen
- [ ] Nether-Expedition
- [ ] Villager-Handel
- [ ] Enchanting-System nutzen
- [ ] Brewing für Tränke
- [ ] End-Expedition (langfristig)

## 📊 APIs

| Endpoint | Port | Beschreibung |
|----------|------|--------------|
| Colony Brain | 8940 | Zentrale Koordination |
| Bot 1 (Leader) | 8950 | Status, Befehle |
| Bot 2 (Explorer) | 8951 | Status, Befehle |
| Bot 3 (Builder) | 8952 | Status, Befehle |
| Bot 4 (Miner) | 8953 | Status, Befehle |
| Bot 5 (Farmer) | 8954 | Status, Befehle |

## 🚀 Starten

```powershell
# Komplette Kolonie starten (3 Bots)
.\START-TOOBIX-COLONY.ps1 -BotCount 3

# Oder mit mehr Bots
.\START-TOOBIX-COLONY.ps1 -BotCount 5

# Oder einzelne Komponenten
bun run .\toobix-colony-brain.ts
bun run .\toobix-colony-bot.ts ToobixLeader localhost 25565 8950
```

---

**Diese Vision wird iterativ umgesetzt. Die Bots lernen und entwickeln sich!** 🌟
