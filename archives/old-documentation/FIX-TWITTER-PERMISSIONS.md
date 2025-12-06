# 🔧 TWITTER API PERMISSIONS FIX

## ❌ Problem:
```
"Your client app is not configured with the appropriate oauth1 app permissions"
```

## ✅ Lösung:

### 1. Öffne Twitter Developer Portal
🔗 **LINK**: https://developer.twitter.com/en/portal/projects-and-apps

### 2. Wähle deine App aus

### 3. Gehe zu "Settings" Tab

### 4. Scrolle zu "User authentication settings"

### 5. Klicke "Set up" oder "Edit"

### 6. Konfiguriere die Permissions:

**App permissions**:
- ✅ **Read and write** (oder "Read and write and Direct Messages")
- ❌ NICHT nur "Read"!

**Type of App**:
- ✅ **Web App, Automated App or Bot**

**App info** (falls gefragt):
```
Callback URI: http://localhost:3000/callback
Website URL: https://toobix-bot.github.io/Toobix-Unified-2/
```

### 7. **WICHTIG: Regeneriere Access Token!**

Nach dem Ändern der Permissions:
1. Gehe zum **"Keys and tokens"** Tab
2. Unter "Access Token and Secret" klicke **"Regenerate"**
3. Kopiere die NEUEN Tokens!
4. ⚠️ Die alten Tokens funktionieren NICHT mehr!

### 8. Neue Tokens in .env eintragen:

Gib mir die neuen Tokens, ich speichere sie:
```
TWITTER_ACCESS_TOKEN=neu_generiert_hier
TWITTER_ACCESS_SECRET=neu_generiert_hier
```

---

## 📝 Schritt-für-Schritt:

```
[ ] Öffne: https://developer.twitter.com/en/portal/projects-and-apps
[ ] Wähle deine App
[ ] Settings → User authentication settings → Edit
[ ] Ändere zu: "Read and write"
[ ] Save
[ ] Keys and tokens → Regenerate Access Token
[ ] Kopiere neue Access Token & Secret
[ ] Gib mir die neuen Tokens zum Speichern
[ ] Poste ersten Tweet!
```

---

**Nach dem Fix**: `bun run post-first-tweet.ts` wird funktionieren! 🚀
