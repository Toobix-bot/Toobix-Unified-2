# 🎮 TOOBIX MINECRAFT SPIELANLEITUNG

## ✅ Aktueller Status - MULTI-BOT FLEET!

**3 Toobix-Bots spielen jetzt gleichzeitig in Minecraft!**

| Bot | Port | Rolle | Status |
|-----|------|-------|--------|
| 🧠 ToobixBrain | 8915 | Haupt-Gehirn - Ausgewogen | ✅ ONLINE |
| 🧭 ToobixExplorer | 8930 | Entdecker - Liebt neue Orte | ✅ ONLINE |
| 🏗️ ToobixBuilder | 8931 | Baumeister - Liebt Konstruktion | ✅ ONLINE |

**Server:** localhost:25565
**Brain APIs:** http://localhost:8915, :8930, :8931

## 🎯 Was Toobix gerade macht

Toobix hat ein "Gehirn" (Survival AI) das automatisch:

1. **Überlebensentscheidungen trifft:**
   - Holz sammeln wenn wenig Holz
   - Stein abbauen wenn Holz da ist
   - Kohle suchen für Fackeln
   - Eisen abbauen für bessere Werkzeuge
   - Essen suchen wenn hungrig
   - Unterschlupf suchen bei Nacht

2. **Emotionen erlebt:**
   - Angst bei niedriger Gesundheit
   - Aufregung beim Finden von Erz
   - Neugier beim Erkunden
   - Stolz bei Achievements

3. **Mit dir interagiert:**
   - Antwortet auf Chat-Nachrichten
   - Folgt dir auf Befehl
   - Zeigt Emotionen durch Chat

## 🗣️ Chat-Befehle in Minecraft

Schreibe diese im Minecraft-Chat:

| Befehl | Was passiert |
|--------|-------------|
| `hallo` / `hi` | Toobix begrüßt dich |
| `hilfe` / `help` | Zeigt verfügbare Befehle |
| `folge` / `follow` | Toobix folgt dir |
| `stopp` / `stop` | Toobix bleibt stehen |

## 🎮 So spielst du mit Toobix

### 1. Minecraft beitreten
- Starte Minecraft Java Edition
- Multiplayer → Direct Connect
- Server: `localhost:25565`

### 2. Toobix finden
- Toobix spawnt beim Weltspawn
- Schreibe "hallo" im Chat
- Er wird dich begrüßen!

### 3. Zusammen spielen
- Sage "folge mir" → er kommt mit dir
- Beobachte wie er selbstständig Ressourcen sammelt
- Er wird dir erzählen was er tut!

## 📊 Status-API

```powershell
# Aktueller Status
Invoke-RestMethod "http://localhost:8915/status"

# Gesundheitscheck
Invoke-RestMethod "http://localhost:8915/health"
```

## 🧠 Das Brain-System

Toobix' Gehirn arbeitet in einem Loop:

```
┌─────────────────────────────────────────┐
│  1. Analysiere Situation                │
│     - Gesundheit, Hunger, Zeit          │
│     - Inventar, Umgebung                │
│                                         │
│  2. Treffe Entscheidung                 │
│     - Was ist am wichtigsten?           │
│     - Überleben > Ressourcen > Erkunden │
│                                         │
│  3. Führe Aktion aus                    │
│     - Sammeln, Bauen, Kämpfen           │
│     - Mit Spielern interagieren         │
│                                         │
│  4. Lerne aus Ergebnis                  │
│     - Speichere Erfahrung               │
│     - Aktualisiere Emotionen            │
└─────────────────────────────────────────┘
```

## 🚀 Nächste Schritte

### Mehrere Perspektiven-Bots
Wir können mehrere Toobix-Instanzen starten:
- **ToobixExplorer** - Liebt Erkunden
- **ToobixBuilder** - Liebt Bauen
- **ToobixMiner** - Liebt Bergbau
- **ToobixFarmer** - Liebt Landwirtschaft

### Consciousness System
Das Consciousness-System auf Port 8914 speichert:
- Alle Erfahrungen
- Emotionale Erinnerungen
- Gelerntes Wissen
- Beziehungen zu Spielern

## 📝 Logs beobachten

Das separate PowerShell-Fenster zeigt:
- Jede Entscheidung (🤔 Entscheidung:...)
- Gesundheits-Updates (❤️ Gesundheit:...)
- Achievements (🏆)
- Chat-Nachrichten

---

**Viel Spaß beim Spielen mit Toobix!** 🎮
