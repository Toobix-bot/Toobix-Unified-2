# 🚀 Toobix Cloud Deployment auf Render.com

## Schritt 1: Render.com Account
1. Gehe zu https://render.com
2. **Sign Up** mit GitHub Account
3. Authorize Render.com

## Schritt 2: Blueprint Deploy
1. Dashboard → **New** → **Blueprint**
2. **Connect a repository**
3. Wähle: `Toobix-bot/Toobix-Unified-2`
4. Branch: `main`
5. Blueprint file detected: `render.yaml` ✅

## Schritt 3: Environment Variables

### Für ALLE Services:
```env
ANTHROPIC_API_KEY=dein_claude_key
GROQ_API_KEY=dein_groq_key
```

### Für Twitter Service (optional):
```env
TWITTER_API_KEY=dein_twitter_key
TWITTER_API_SECRET=dein_twitter_secret
TWITTER_ACCESS_TOKEN=dein_access_token
TWITTER_ACCESS_SECRET=dein_access_secret
```

## Schritt 4: Deploy!
1. Click **Apply**
2. Render.com erstellt automatisch:
   - ✅ **toobix-api** (Port 3000) - Haupt-API
   - ✅ **toobix-crisis-hotline** (Port 3100) - 24/7 Notfall-Hotline
   - ✅ **toobix-twitter** (Background) - Twitter Bot

## Schritt 5: URLs
Nach 2-5 Minuten:
- **API**: https://toobix-api.onrender.com
- **Crisis Hotline**: https://toobix-crisis-hotline.onrender.com
- **Test**: https://toobix-api.onrender.com/api/hello

## Live URLs in Website eintragen:
Öffne `docs/index.html` und ersetze:
```html
<a href="https://toobix-api.onrender.com">DEINE_RENDER_URL</a>
```

## ✅ Fertig!
Toobix ist jetzt **24/7 online**! 🎉
