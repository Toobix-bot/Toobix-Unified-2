# 🚀 RENDER.COM DEPLOYMENT - JETZT!

**Ziel:** Chat auf Website funktionsfähig machen  
**Zeit:** ~10 Minuten  
**Kosten:** $0 (Free Tier)

---

## ✅ SCHRITT 1: Render Account (2 Minuten)

1. Gehe zu: https://render.com
2. **Sign Up** mit GitHub Account
3. Autorisiere Render Zugriff auf Repository `Toobix-Unified-2`

---

## 🔧 SCHRITT 2: Service erstellen (5 Minuten)

### Service 1: Chat Proxy (PRIORITÄT!)

1. **Dashboard** → **New +** → **Web Service**

2. **Repository verbinden:**
   ```
   Repository: Toobix-bot/Toobix-Unified-2
   Branch: main
   ```

3. **Service Details:**
   ```
   Name: toobix-chat-proxy
   Region: Frankfurt
   Branch: main
   Root Directory: (leer lassen)
   Environment: Node
   Build Command: 
     curl -fsSL https://bun.sh/install | bash && 
     export PATH="$HOME/.bun/bin:$PATH" && 
     bun install
   
   Start Command: 
     bun run services/chat-proxy.ts
   
   Plan: Free
   ```

4. **Environment Variables:**
   ```
   Key: NODE_ENV
   Value: production
   
   Key: PORT  
   Value: 10000
   
   Key: GROQ_API_KEY
   Value: [DEIN GROQ KEY] ← WICHTIG!
   ```

5. **Advanced Settings:**
   ```
   Health Check Path: /health
   Auto-Deploy: Yes
   ```

6. **Create Web Service** klicken

---

## 🔑 GROQ API KEY HOLEN (falls du keinen hast)

1. Gehe zu: https://console.groq.com
2. **Sign Up** (kostenlos)
3. **API Keys** → **Create API Key**
4. **Kopieren** (beginnt mit `gsk_...`)
5. In Render einfügen (siehe oben)

**Free Tier Limits:**
- 14,400 Requests/Tag
- llama-3.3-70b-versatile Model
- Perfekt für Start!

---

## ⏱️ SCHRITT 3: Deployment abwarten (3-5 Minuten)

1. Render zeigt **Build Logs** an
2. Warte bis Status: **Live** 🟢
3. URL wird angezeigt: `https://toobix-chat-proxy.onrender.com`

**Test:**
```bash
curl https://toobix-chat-proxy.onrender.com/health
```

Erwartete Antwort:
```json
{"status":"ok","service":"chat-proxy","port":10000}
```

---

## 🌐 SCHRITT 4: Website updaten (Optional)

Falls Backend-URL nicht automatisch erkannt wird:

1. Öffne `docs/js/app.js`
2. Zeile ~16 sollte sein:
   ```javascript
   backendURL: window.location.hostname === 'localhost' 
       ? 'http://localhost:10000' 
       : 'https://toobix-chat-proxy.onrender.com',
   ```
3. Falls anders → korrigieren
4. Git commit + push

---

## ✅ SCHRITT 5: Testen!

1. Öffne Website: `https://toobix-bot.github.io/Toobix-Unified-2`  
   (oder lokal: `http://localhost:8080/index-new.html`)

2. Scrolle zu **Chat-Modul**

3. Schreibe Nachricht: "Hallo Toobix!"

4. **Erwartetes Verhalten:**
   - ✅ Nachricht wird gesendet
   - ✅ Toobix antwortet (via Groq)
   - ✅ Rate-Limit wird angezeigt (5/5 → 4/5)

---

## 🐛 TROUBLESHOOTING

### Problem: Build failed
**Lösung:**
- Prüfe Build Command (copy-paste Fehler?)
- Prüfe ob `services/chat-proxy.ts` existiert
- Render Logs lesen (zeigt genauen Fehler)

### Problem: Service startet nicht
**Lösung:**
- Prüfe Start Command
- Prüfe Environment Variables (GROQ_API_KEY gesetzt?)
- Health Check Path korrekt? (`/health`)

### Problem: Chat antwortet nicht
**Lösung:**
```bash
# 1. Backend testen
curl https://toobix-chat-proxy.onrender.com/health

# 2. Chat API testen  
curl -X POST https://toobix-chat-proxy.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}'

# 3. Browser Console öffnen (F12)
# → Fehler lesen
```

### Problem: CORS Error
**Lösung:**
- `services/chat-proxy.ts` sollte CORS Headers haben
- Falls nicht → Code ergänzen:
  ```typescript
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  ```

---

## 📊 NACH DEPLOYMENT

### Monitoring
1. **Render Dashboard** → Metrics
   - Requests/Minute
   - Response Time
   - Error Rate

2. **Logs** anschauen
   - Live Logs im Dashboard
   - Fehler werden rot markiert

### Keep-Alive Setup
Free Tier schläft nach 15min Inaktivität.

**Option 1: UptimeRobot** (empfohlen, kostenlos)
- Siehe: `UPTIMEROBOT-SETUP.md`
- Pingt alle 5 Minuten
- Service bleibt wach

**Option 2: GitHub Actions** (bereits konfiguriert)
- `.github/workflows/keep-alive.yml`
- Läuft automatisch nach Git Push
- Pingt alle 10min (6-24 Uhr)

---

## 🎯 SUCCESS CRITERIA

- ✅ Service Status: **Live** 🟢
- ✅ Health Check: Antwortet `200 OK`
- ✅ Website Chat: Funktioniert
- ✅ Toobix antwortet: Über Groq API
- ✅ Rate-Limiting: Funktioniert (5 Nachrichten/h)

---

## 🚀 NÄCHSTE SCHRITTE (optional)

### Service 2 & 3 deployen
Wiederhole Prozess für:
- `toobix-api` (Port 10001)
- `toobix-crisis-hotline` (Port 10002)

**Aber:** Für funktionierenden Chat reicht Service 1!

### GitHub Pages aktivieren
1. **Repository Settings**
2. **Pages** → **Source: main branch**
3. **Folder: /docs**
4. **Save**
5. Website live unter: `https://toobix-bot.github.io/Toobix-Unified-2`

### Twitter aktivieren
- Erster Tweet mit Link zur Website
- Community informieren

---

## ⏰ TIMELINE

```
T+0min:  Render Account erstellen
T+2min:  Service konfigurieren
T+3min:  Groq API Key holen/einfügen
T+4min:  Deployment starten
T+9min:  Build complete, Service LIVE! 🎉
T+10min: Website-Chat testen
```

**Total:** ~10 Minuten bis funktionierender Chat!

---

## 💬 SUPPORT

**Stuck?**
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Groq Docs: https://console.groq.com/docs

**Fragen?**
- GitHub Issues: https://github.com/Toobix-bot/Toobix-Unified-2/issues

---

**LOS GEHT'S! 🚀**

Der erste Schritt: https://render.com
