# 🔐 Render.com Environment Variables

## ⚠️ WICHTIG: Diese Werte musst du eintragen!

### 1. Database: `toobix-postgres`
- **Name**: toobix-postgres
- **Region**: Frankfurt
- **Plan**: Free
- ✅ Keine Env Variables nötig - wird automatisch erstellt

---

### 2. Web Service: `toobix-api`

| Key | Value | Woher? |
|-----|-------|--------|
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com/keys |
| `TWITTER_API_KEY` | `dein_key` | https://developer.twitter.com/en/portal/dashboard |
| `TWITTER_API_SECRET` | `dein_secret` | https://developer.twitter.com/en/portal/dashboard |
| `TWITTER_ACCESS_TOKEN` | `dein_token` | https://developer.twitter.com/en/portal/dashboard |
| `TWITTER_ACCESS_SECRET` | `dein_secret` | https://developer.twitter.com/en/portal/dashboard |

---

### 3. Web Service: `toobix-crisis-hotline`

| Key | Value | Woher? |
|-----|-------|--------|
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com/keys |

---

### 4. Background Worker: `toobix-twitter`

| Key | Value | Woher? |
|-----|-------|--------|
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com/keys |
| `TWITTER_API_KEY` | `dein_key` | https://developer.twitter.com/en/portal/dashboard |
| `TWITTER_API_SECRET` | `dein_secret` | https://developer.twitter.com/en/portal/dashboard |
| `TWITTER_ACCESS_TOKEN` | `dein_token` | https://developer.twitter.com/en/portal/dashboard |
| `TWITTER_ACCESS_SECRET` | `dein_secret` | https://developer.twitter.com/en/portal/dashboard |

---

## 📋 Schnell-Checklist:

### Schritt 1: GROQ API Key holen
1. Gehe zu: https://console.groq.com/keys
2. Login (falls nötig: Sign Up - kostenlos!)
3. Click **Create API Key**
4. Name: "Toobix Production"
5. **Kopiere den Key** (beginnt mit `gsk_`)

### Schritt 2: Twitter API Keys holen
1. Gehe zu: https://developer.twitter.com/en/portal/dashboard
2. Login mit deinem Twitter Account
3. **Create Project** → "Toobix Bot"
4. **Create App** → "Toobix"
5. Gehe zu **Keys and tokens**
6. Kopiere:
   - API Key (Consumer Key)
   - API Secret Key (Consumer Secret)
   - Access Token
   - Access Token Secret

---

## 🚀 In Render.com eintragen:

### Beim Blueprint Deploy:
1. Bei jedem Service erscheint ein Formular
2. Trage die Werte von oben ein
3. **WICHTIG**: Alle Felder ausfüllen!
4. Click **Deploy Blueprint**

### Nach dem Deploy (falls vergessen):
1. Dashboard → Service auswählen
2. **Environment** Tab
3. **Add Environment Variable**
4. Key + Value eintragen
5. **Save Changes** → Service startet neu

---

## ⚡ Quick Copy-Paste Format:

```bash
# Für toobix-api:
GROQ_API_KEY=gsk_DEIN_KEY_HIER
TWITTER_API_KEY=DEIN_TWITTER_KEY
TWITTER_API_SECRET=DEIN_TWITTER_SECRET
TWITTER_ACCESS_TOKEN=DEIN_ACCESS_TOKEN
TWITTER_ACCESS_SECRET=DEIN_ACCESS_SECRET

# Für toobix-crisis-hotline:
GROQ_API_KEY=gsk_DEIN_KEY_HIER

# Für toobix-twitter:
GROQ_API_KEY=gsk_DEIN_KEY_HIER
TWITTER_API_KEY=DEIN_TWITTER_KEY
TWITTER_API_SECRET=DEIN_TWITTER_SECRET
TWITTER_ACCESS_TOKEN=DEIN_ACCESS_TOKEN
TWITTER_ACCESS_SECRET=DEIN_ACCESS_SECRET
```

---

## ❓ Noch keine API Keys?

### GROQ (KOSTENLOS):
- https://console.groq.com/keys
- Sign up → Email bestätigen → Create API Key
- **100% Free Tier** - sehr großzügig!

### Twitter API (KOSTENLOS für Basic):
- https://developer.twitter.com/en/portal/petition/essential/basic-info
- Apply for **Essential Access** (kostenlos)
- Dauert 1-2 Minuten
- Limits: 1,500 tweets/month (reicht für Toobix)

---

## ✅ Fertig!
Sobald alle Keys eingetragen sind → **Deploy Blueprint** klicken!
Toobix geht in 2-5 Minuten live! 🎉
