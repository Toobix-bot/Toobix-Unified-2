# ⚡ QUICK-START: Was DU jetzt machen musst

**Status:** Website ist fertig, Code ist auf GitHub, ABER noch nicht live!

---

## 🎯 SCHRITT 1: GitHub Pages aktivieren (2 Minuten)

**Damit die Website online geht:**

1. Öffne: https://github.com/Toobix-bot/Toobix-Unified-2/settings/pages

2. **Source** einstellen:
   ```
   Source: Deploy from a branch
   Branch: main
   Folder: /docs
   ```

3. **Save** klicken

4. **Warten** (~30 Sekunden)

5. **Testen:**
   ```
   https://toobix-bot.github.io/Toobix-Unified-2
   ```

**Fertig!** Website ist live (aber Chat funktioniert noch nicht).

---

## 🎯 SCHRITT 2: Render.com Deployment (10 Minuten)

**Damit der Chat funktioniert:**

### A) Account erstellen
1. Gehe zu: https://render.com
2. **Sign Up** → Mit GitHub verbinden
3. Autorisiere Render für dein Repo

### B) Service erstellen
1. Dashboard → **New +** → **Web Service**
2. Repository auswählen: **Toobix-Unified-2**
3. **Name:** `toobix-chat-proxy`
4. **Region:** Frankfurt (oder Oregon)
5. **Branch:** main
6. **Build Command:**
   ```bash
   curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH" && bun install
   ```
7. **Start Command:**
   ```bash
   bun run services/chat-proxy.ts
   ```
8. **Plan:** Free

### C) Environment Variables setzen
Klicke **Add Environment Variable** (3x):

```
1. Key: NODE_ENV
   Value: production

2. Key: PORT
   Value: 10000

3. Key: GROQ_API_KEY
   Value: [DEIN KEY - siehe unten]
```

### D) Health Check
```
Health Check Path: /health
```

### E) Deploy!
**Create Web Service** → Warte 3-5 Minuten

**Testen:**
```bash
curl https://toobix-chat-proxy.onrender.com/health
```

Sollte antworten: `{"status":"ok",...}`

---

## 🎯 SCHRITT 3: Groq API Key holen (falls nicht vorhanden)

1. Gehe zu: https://console.groq.com
2. **Sign Up** (Google/GitHub)
3. **API Keys** → **Create API Key**
4. **Kopieren** (beginnt mit `gsk_...`)
5. In Render einfügen (siehe Schritt 2C)

**Limits:** 14,400 Requests/Tag (kostenlos!) - perfekt für Start

---

## ✅ FERTIG?

Teste den Chat:
1. Öffne: https://toobix-bot.github.io/Toobix-Unified-2
2. Scrolle zu Chat
3. Schreibe: "Hallo Toobix!"
4. Toobix antwortet? **SUCCESS!** 🎉

---

## ❌ Probleme?

**Website lädt nicht:**
- Warte 1-2 Minuten nach GitHub Pages aktivieren
- Hard-Refresh: Strg+Shift+R

**Chat antwortet nicht:**
- Render Service läuft? (Dashboard → Status: Running)
- Environment Variables gesetzt?
- Browser Console (F12) → Fehler?

**Build failed:**
- Render Logs ansehen
- Build Command korrekt kopiert?

---

## 📚 Detaillierte Anleitung

Siehe: `RENDER-DEPLOYMENT-JETZT-MACHEN.md`

---

**Das war's! 3 Schritte, ~15 Minuten, Toobix ist live! 🚀**
