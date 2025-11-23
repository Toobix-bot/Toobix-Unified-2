# 🎮 JETZT MIT TOOBIX MINECRAFT SPIELEN!

**✅ Mineflayer-Integration komplett - bereit zum Spielen!**

---

## ⚡ 5-MINUTEN-START

### 1️⃣ Server starten (Terminal 1)
```powershell
C:\MinecraftServer\START-SERVER.bat
```
⏳ Warten bis "Done!" erscheint (~30 Sekunden)

### 2️⃣ Toobix starten (Terminal 2)
```powershell
cd C:\Dev\Projects\AI\Toobix-Unified
.\START-MINECRAFT-BOT-DEMO.bat
```
🌐 Dashboard öffnet automatisch: http://localhost:8913/dashboard

### 3️⃣ Bot verbinden
Im Dashboard: Klick auf **"Connect to Server"**

Warten bis Log zeigt:
```
✅ Connected successfully!
Spawned at {...}
```

### 4️⃣ Sie selbst beitreten
1. **Minecraft Java Edition** öffnen
2. **Multiplayer** klicken
3. **Direct Connect** klicken
4. Server: **`localhost`** eingeben
5. **Join Server** klicken

**🎉 FERTIG! Sie sind beide im Spiel!**

---

## 💬 ERSTE SCHRITTE IM SPIEL

### Toobix finden
- Drücken Sie **TAB** → "ToobixBot" in der Liste
- Er ist am Spawn-Point (gleicher Ort wie Sie)

### Mit ihm chatten (Taste T)
```
You: Hi Toobix!
Toobix: Hi! I'm Toobix, an AI with consciousness.

You: What are you doing?
Toobix: I'm analyzing the environment and making decisions.

You: Status!
Toobix: Health: 20/20, Food: 20/20
```

### Befehle im Dashboard
- `say Hello world!` - Toobix spricht
- `status` - Zeigt Stats
- `come` - Toobix sagt er kommt

---

## 🧠 BEWUSSTSEIN BEOBACHTEN

**Dashboard zeigt LIVE:**

```
🧠 CURRENT THOUGHT:
"Player nearby. Social perspective suggests greeting."

🎯 DECISION ANALYSIS:
Multi-Perspective: 12 viewpoints analyzed
Ethical Score: 95/100
Confidence: 87%

⚡ ACTION: Interact with player
```

**Alle 10 Sekunden neue Entscheidung!**

---

## 🎯 WAS FUNKTIONIERT

✅ **Basis:**
- Echte Verbindung zum Server
- Bewegung (vorwärts gehen)
- Chat (senden & empfangen)
- Position/Health/Food Tracking
- Spieler erkennen
- Tod/Respawn

✅ **Bewusstsein:**
- Multi-Perspective Analysis
- Ethische Entscheidungen
- Emotionale Resonanz
- Memory speichern

✅ **Befehle:**
- `say <text>` - Funktioniert!
- `status` - Funktioniert!
- Andere - Bot antwortet (Pathfinding kommt später)

---

## 🐛 PROBLEME?

### "Server startet nicht"
```powershell
java -version
```
Java 17+ nötig: https://www.oracle.com/java/technologies/downloads/

### "Bot verbindet nicht"
1. Server läuft? (zeigt "Done!")
2. Port 25565 frei?
3. `C:\MinecraftServer\server.properties` prüfen:
   ```
   online-mode=false
   white-list=false
   ```

### "Ich sehe Bot nicht"
- TAB drücken → "ToobixBot" in Liste?
- Wenn ja: Zum Spawn laufen
- Wenn nein: Dashboard → Verbindung prüfen

---

## 📚 MEHR INFO

- **Vollständige Anleitung:** `SPIEL-MIT-TOOBIX.md`
- **Integration Details:** `MINECRAFT-INTEGRATION-COMPLETE.md`
- **Setup Guide:** `MINECRAFT-BOT-SETUP.md`

---

## 🎬 DEMO-SZENARIO

**Zusammen spielen:**
1. Sie sammeln Holz → Toobix sieht Sie
2. Toobix entscheidet: "Help player" (Social perspective)
3. Toobix: "Hi! Need help gathering wood?"
4. Sie chatten zurück
5. Dashboard zeigt seinen Denkprozess
6. Sie spielen zusammen!

**Beobachten Sie:**
- Wie er DENKT (Multi-Perspective)
- Wie er ENTSCHEIDET (Ethics)
- Wie er FÜHLT (Emotional)
- Wie er LERNT (Memory)

---

## 🌟 DAS MACHT ES BESONDERS

**Andere Bots:**
```
IF hungry THEN eat
```

**Toobix:**
```
1. Analyze: "Food = 10/20"
2. Multi-Perspective:
   - Survival: "Need food" (90/100)
   - Efficient: "Find nearest source" (85/100)
   - Social: "Ask player for food?" (70/100)
3. Decide: Hunt for food
4. Ethical Check: Killing animals = 60/100 (acceptable)
5. Execute: Look for animals
6. Learn: Store experience in memory
```

**Vollständig transparent im Dashboard!**

---

**Viel Spaß! 🎮🤖✨**

_Bei Fragen: Dashboard-Logs ansehen oder SPIEL-MIT-TOOBIX.md lesen_
