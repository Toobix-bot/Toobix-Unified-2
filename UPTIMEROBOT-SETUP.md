# 🔧 UptimeRobot Setup für Toobix Keep-Alive

## Warum UptimeRobot?

Render.com Free Tier schläft nach 15 Minuten Inaktivität. UptimeRobot pingt alle 5 Minuten an und hält Services wach – **komplett kostenlos**.

## Setup (5 Minuten)

### 1. Account erstellen
- Gehe zu: https://uptimerobot.com
- Registriere dich (kostenlos)
- Bestätige E-Mail

### 2. Monitore hinzufügen

#### Monitor 1: Public Gateway
```
Monitor Type: HTTP(s)
Friendly Name: Toobix Public Gateway
URL: https://toobix-public-gateway.onrender.com/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET (HEAD)
Expected Response: 200
```

#### Monitor 2: Core Intelligence
```
Monitor Type: HTTP(s)
Friendly Name: Toobix Core Intelligence
URL: https://toobix-core-intelligence.onrender.com/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET (HEAD)
Expected Response: 200
```

#### Monitor 3: Life Support
```
Monitor Type: HTTP(s)
Friendly Name: Toobix Life Support
URL: https://toobix-life-support.onrender.com/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET (HEAD)
Expected Response: 200
```

### 3. Alert Einstellungen

**E-Mail Alerts:**
- ✅ When monitor goes DOWN
- ✅ When monitor goes UP
- ⏰ Alert after: 1 down check (sofort)

**Optional: Discord/Slack Webhook:**
```
Alert Type: Webhook
Webhook URL: [Dein Discord/Slack Webhook]
Trigger: When Down + When Up
```

### 4. Öffentlicher Status Page (Optional)

UptimeRobot kann eine öffentliche Status-Page erstellen:
```
URL: https://status.uptimerobot.com/your-id
Features:
  • Live Status aller Services
  • Uptime History (letzte 30/60/90 Tage)
  • Incident Timeline
  • Response Time Graphs
```

Diese kann auf der Website eingebunden werden!

## Free Plan Limits

✅ **Enthalten:**
- 50 Monitore
- 5-Minuten Intervall
- E-Mail Alerts
- SSL Überwachung
- Public Status Page
- API Access

❌ **Nicht enthalten:**
- 1-Minuten Intervall (Paid)
- SMS Alerts (Paid)
- Custom Status Domain (Paid)

## Alternatives (Falls UptimeRobot nicht reicht)

### BetterStack (ehemals BetterUptime)
```
Free Tier:
  • 10 Monitore
  • 3-Minuten Intervall
  • Mehr Analytics
  • Incident Management
```

### Pingdom (Solarwinds)
```
Free Trial: 30 Tage
Danach: ~10€/Monat
Features: Sehr detaillierte RUM (Real User Monitoring)
```

### Freshping (Freshworks)
```
Free Tier:
  • 50 Monitore
  • 1-Minuten Intervall
  • E-Mail + Slack
```

## Integration in Toobix Website

Füge UptimeRobot Badge hinzu:

```html
<!-- In docs/index-new.html Footer -->
<div class="status-badge">
  <a href="https://status.uptimerobot.com/your-id" target="_blank">
    <img src="https://img.shields.io/uptimerobot/status/m123456789-abcdef1234567890" alt="Service Status" />
  </a>
</div>
```

Oder eingebettete Status Page:
```html
<iframe 
  src="https://status.uptimerobot.com/your-id" 
  width="100%" 
  height="400" 
  frameborder="0">
</iframe>
```

## Monitoring Best Practices

### Health Endpoint Anforderungen
```typescript
// Jeder Service sollte /health bereitstellen:
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});
```

### Response Time Targets
- ✅ Excellent: < 200ms
- ⚠️ Warning: 200-500ms
- 🔴 Critical: > 500ms

### Uptime Ziele
- 🎯 Target: 99.9% (8.76h Downtime/Jahr)
- 🏆 Gold: 99.95% (4.38h Downtime/Jahr)
- 💎 Platinum: 99.99% (52min Downtime/Jahr)

Render Free Tier realistisch: **~99.5%** (Deployments, Sleeps, Restarts)

## Setup Checklist

- [ ] UptimeRobot Account erstellt
- [ ] 3 Monitore hinzugefügt (Public, Intelligence, Support)
- [ ] Intervalle auf 5 Minuten gesetzt
- [ ] E-Mail Alerts konfiguriert
- [ ] Optional: Öffentliche Status Page erstellt
- [ ] Optional: Status Badge auf Website eingebunden
- [ ] Optional: Discord/Slack Webhook verbunden
- [ ] Test: Warte 20 Minuten, prüfe ob Services nicht schlafen

## Troubleshooting

**Problem: Service schläft trotz UptimeRobot**
```
Lösung:
1. Prüfe ob Monitor wirklich aktiv ist
2. Checke Interval (muss < 15min sein)
3. Stelle sicher Health-Endpoint antwortet schnell
4. Logs in Render.com prüfen
```

**Problem: Zu viele False Alerts**
```
Lösung:
1. Erhöhe Timeout auf 60 Sekunden
2. "Alert after X down checks" auf 2 setzen
3. Prüfe ob Render Build gerade läuft
```

**Problem: UptimeRobot zählt nicht als Traffic**
```
Note: UptimeRobot nutzt HEAD Requests (klein)
Das ist perfekt! Minimaler Bandwidth-Verbrauch
Alle 5min × 3 Services × 30 Tage = ~13,000 Requests/Monat
Bei ~500 bytes pro Request = ~6.5 MB Bandwidth
→ Vernachlässigbar im 100GB Free Tier
```

## Alternative: Cron-Job.org

Falls du ZUSÄTZLICHE Pings brauchst (z.B. verschiedene Endpunkte):

```
URL: https://cron-job.org
Free Tier:
  • 50 Jobs
  • 1-Minute Minimum Interval
  • HTTP/HTTPS
  • Basic Auth Support
```

Setup:
```
Job 1: GET https://toobix-public-gateway.onrender.com/chat
Job 2: GET https://toobix-core-intelligence.onrender.com/llm
Job 3: GET https://toobix-life-support.onrender.com/crisis
```

## Kosten-Nutzen Analyse

**GitHub Actions (Current Solution):**
- ✅ Kostenlos
- ✅ Volle Kontrolle
- ❌ Läuft nur während aktiver Stunden
- ❌ Keine UI
- ❌ Keine Alerts

**UptimeRobot (Empfehlung):**
- ✅ Kostenlos
- ✅ 24/7 Coverage
- ✅ Public Status Page
- ✅ E-Mail Alerts
- ✅ Response Time Tracking
- ✅ Uptime History
- ❌ Nur 5min Interval

**Kombination (Best):**
- GitHub Actions: Während aktiver Stunden (6-24 Uhr)
- UptimeRobot: 24/7 Monitoring + Alerts + Status Page
- → Services bleiben warm + Du bekommst Alerts + Öffentliche Transparenz

## Next Steps

1. **Jetzt:** UptimeRobot Account erstellen
2. **Deploy:** Services auf Render.com
3. **Configure:** Monitore hinzufügen
4. **Test:** 24 Stunden warten, Uptime prüfen
5. **Optimize:** Response Times verbessern
6. **Share:** Status Page auf Website einbinden
