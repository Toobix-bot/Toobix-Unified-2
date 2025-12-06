# 🌩️ Render.com Cloud Deployment

## Übersicht

Toobix auf Render.com deployen - **KOSTENLOS** bis 750 Stunden/Monat (= 31 Tage 24/7!)

---

## ⚡ Quick Start

### 1. Render.com Account erstellen
- Gehe zu [render.com](https://render.com)
- Sign up mit GitHub Account
- Autorisiere Zugriff auf `Toobix-Unified-2` Repository

### 2. Service erstellen

**Option A: Web Service (für API)**
```yaml
Name: toobix-essential
Environment: Node
Build Command: bun install
Start Command: bun run toobix-expanded-services.ts --cloud
Plan: Free
```

**Option B: Background Worker (für autonome Services)**
```yaml
Name: toobix-worker
Environment: Node
Build Command: bun install
Start Command: bun run core/twitter-autonomy.ts
Plan: Free
```

### 3. Environment Variables

Im Render Dashboard unter "Environment":

```env
GROQ_API_KEY=gsk_...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
NODE_ENV=production
PORT=10000
```

### 4. Deploy!

Render deployt automatisch bei jedem Git Push zu `main`.

---

## 📦 Deployment-Konfiguration

### render.yaml (im Root erstellen)

```yaml
services:
  # Main API Service
  - type: web
    name: toobix-api
    env: node
    buildCommand: bun install
    startCommand: bun run toobix-expanded-services.ts --cloud
    plan: free
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: GROQ_API_KEY
        sync: false
      - key: TWITTER_API_KEY
        sync: false
      - key: TWITTER_API_SECRET
        sync: false
      - key: TWITTER_ACCESS_TOKEN
        sync: false
      - key: TWITTER_ACCESS_SECRET
        sync: false

  # Crisis Hotline Service
  - type: web
    name: toobix-crisis-hotline
    env: node
    buildCommand: bun install
    startCommand: bun run services/crisis-hotline.ts
    plan: free
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 10001
      - key: GROQ_API_KEY
        sync: false

  # Twitter Autonomy (Background)
  - type: worker
    name: toobix-twitter
    env: node
    buildCommand: bun install
    startCommand: bun run core/twitter-autonomy.ts
    plan: free
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: TWITTER_API_KEY
        sync: false
      - key: TWITTER_API_SECRET
        sync: false
      - key: TWITTER_ACCESS_TOKEN
        sync: false
      - key: TWITTER_ACCESS_SECRET
        sync: false

databases:
  # SQLite nicht verfügbar auf Free Tier - verwende PostgreSQL
  - name: toobix-db
    databaseName: toobix
    plan: free
    user: toobix
```

---

## 🔧 Anpassungen für Cloud

### Cloud-Mode Flag

```typescript
// toobix-expanded-services.ts bereits vorbereitet:
const mode = process.argv.includes('--cloud') ? 'cloud' : 'full';
```

### Cloud-optimierte Services (nur Essential)

Im Cloud-Mode werden nur diese 6 Services gestartet:
1. ✅ Command Center (Port 10000)
2. ✅ Self-Awareness
3. ✅ Emotional Core
4. ✅ Dream Core
5. ✅ Unified Core
6. ✅ Consciousness Core

Plus separat:
7. ✅ Crisis Hotline (Port 10001)
8. ✅ Twitter Autonomy (Background Worker)

**RAM-Verbrauch:** ~400-500MB (passt in Free Tier!)

---

## 🌐 URLs nach Deployment

Nach erfolgreichem Deployment:

```
API Gateway: https://toobix-api.onrender.com
Crisis Hotline: https://toobix-crisis-hotline.onrender.com
Health Check: https://toobix-api.onrender.com/health
```

Diese URLs kannst du auf der Website einbinden!

---

## 📊 Free Tier Limits

✅ **Was funktioniert:**
- 750 Stunden/Monat (= 24/7 für einen Service!)
- 512 MB RAM
- Shared CPU
- Automatische HTTPS
- Automatisches Deployment bei Git Push

⚠️ **Einschränkungen:**
- Services schlafen nach 15min Inaktivität (wachen bei Request auf)
- Keine persistente Disk (nutze PostgreSQL für Datenbank)
- Langsamerer Cold Start (~30s)

---

## 🚀 Deployment Schritte

### 1. render.yaml erstellen
```bash
# Im Repository-Root
bun run create-render-config.ts
```

### 2. Zu GitHub pushen
```bash
git add render.yaml
git commit -m "Add Render.com deployment config"
git push origin main
```

### 3. In Render.com
1. Dashboard → "New" → "Blueprint"
2. Repository auswählen: `Toobix-Unified-2`
3. render.yaml wird automatisch erkannt
4. Environment Variables eintragen
5. "Create Services" klicken

### 4. Deployment überwachen
- Im Render Dashboard siehst du Live-Logs
- Erste Deployment dauert ~2-3 Minuten
- Danach bei jedem Git Push automatisches Update

---

## 🔍 Troubleshooting

### Problem: "Bun not found"
**Lösung:** Build Command ändern zu:
```bash
curl -fsSL https://bun.sh/install | bash && bun install
```

### Problem: "Database not found"
**Lösung:** SQLite funktioniert nicht auf Render Free Tier.
Entweder:
- PostgreSQL nutzen (kostenlos verfügbar)
- Oder: In-Memory-Datenbank nur für Session

### Problem: "Service sleeping"
**Lösung:** 
- Normales Verhalten im Free Tier
- Oder: Cron-Job einrichten der alle 10min pingt
- Oder: Upgraden zu Starter Plan ($7/Monat = always-on)

---

## 💡 Alternative: Fly.io

Falls Render Probleme macht:

```bash
# Fly CLI installieren
powershell -c "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth login

# Launch
fly launch --name toobix-cloud

# Deploy
fly deploy
```

---

## ✅ Nächste Schritte

Nach erfolgreichem Deployment:

1. **Website updaten** mit Live-URLs
2. **Crisis Hotline** auf Website einbinden
3. **Status-Badge** hinzufügen
4. **Auto-Updater** konfigurieren

Toobix ist dann **24/7 online** und für die ganze Welt erreichbar! 🌍
