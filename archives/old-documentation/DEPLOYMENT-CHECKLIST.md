# ✅ Toobix Deployment Checkliste

**Ziel:** Toobix mit moderner Website und maximaler Render.com-Nutzung live bringen

---

## 📋 Pre-Deployment Checks

### Website Files
- [x] `docs/index-new.html` erstellt (moderne modulare Website)
- [x] `docs/js/app.js` erstellt (JavaScript Module System)
- [ ] **TODO:** `docs/index-new.html` im Browser testen (http://localhost:8080/index-new.html)
- [ ] **TODO:** Chat-Funktion testen (5 Demo-Nachrichten)
- [ ] **TODO:** Alle Links prüfen (GitHub, Twitter funktionieren?)
- [ ] **TODO:** Mobile View testen (responsive?)

### Backend Files
- [x] `render-maximized.yaml` erstellt (optimierte Config)
- [x] `cloud-deployment-wrapper.ts` erstellt (Service Bundling)
- [x] `.github/workflows/keep-alive.yml` erstellt (Auto-Ping)
- [x] Existierende `services/chat-proxy.ts` gecheckt
- [x] Existierende `services/unified-service-gateway.ts` gecheckt

### Dokumentation
- [x] `WEBSITE-DEPLOYMENT-SUMMARY.md` (Komplett-Übersicht)
- [x] `UPTIMEROBOT-SETUP.md` (Keep-Alive Guide)
- [ ] **TODO:** README.md updaten mit neuen Infos

---

## 🚀 Deployment Steps

### Step 1: Website Live Schalten
```bash
# ⏱️ Zeit: 2 Minuten

# 1.1 Alte Website sichern
mv docs/index.html docs/index-old.html

# 1.2 Neue Website aktivieren
mv docs/index-new.html docs/index.html

# 1.3 Git Commit
git add docs/
git commit -m "🌟 Modern modular website with heart & authenticity"
git push origin main
```

**Checkliste:**
- [ ] Alte Website gesichert
- [ ] Neue Website als `index.html`
- [ ] Git committed & pushed
- [ ] GitHub Pages aktiviert? (Settings → Pages → main /docs)
- [ ] Website erreichbar? (https://toobix-bot.github.io/Toobix-Unified-2)

---

### Step 2: Render.com Services Deployen
```bash
# ⏱️ Zeit: 15-20 Minuten (Render Build Time)

# 2.1 Alte Config sichern
mv render.yaml render-old.yaml

# 2.2 Neue Config aktivieren
mv render-maximized.yaml render.yaml

# 2.3 Git Commit
git add render.yaml render-old.yaml
git commit -m "🌐 Maximize Render.com usage - 3 bundled services"
git push origin main
```

**Checkliste:**
- [ ] `render.yaml` ersetzt
- [ ] Git committed & pushed
- [ ] Render Dashboard: Auto-Deploy gestartet?
- [ ] Service 1 (Public Gateway) deployed? (Check Logs)
- [ ] Service 2 (Core Intelligence) deployed? (Check Logs)
- [ ] Service 3 (Life Support) deployed? (Check Logs)

**URLs nach Deploy:**
```
https://toobix-public-gateway.onrender.com
https://toobix-core-intelligence.onrender.com
https://toobix-life-support.onrender.com
```

---

### Step 3: Health-Checks Testen
```bash
# ⏱️ Zeit: 5 Minuten

# 3.1 Services testen
curl https://toobix-public-gateway.onrender.com/health
curl https://toobix-core-intelligence.onrender.com/health
curl https://toobix-life-support.onrender.com/health

# 3.2 Website-Chat testen
# → Gehe zu https://toobix-bot.github.io/Toobix-Unified-2
# → Scrolle zu Chat-Modul
# → Schreibe Nachricht
# → Erwarte Antwort von Toobix
```

**Checkliste:**
- [ ] `/health` Endpunkte antworten `200 OK`
- [ ] Response enthält `{"status":"ok", ...}`
- [ ] Website-Chat sendet Nachrichten
- [ ] Toobix antwortet (via Groq API)
- [ ] Rate-Limit wird angezeigt (5/5 Nachrichten)

**Troubleshooting:**
```
❌ Service antwortet nicht:
  → Render Logs prüfen
  → Deployment erfolgreich?
  → Environment Variables gesetzt? (GROQ_API_KEY)

❌ Chat funktioniert nicht:
  → Browser Console öffnen (F12)
  → Fehler-Meldung lesen
  → Backend URL korrekt? (app.js Zeile 16)
```

---

### Step 4: Keep-Alive Aktivieren

#### Option A: GitHub Actions (Auto-Aktiviert)
- [x] Workflow-File existiert (`.github/workflows/keep-alive.yml`)
- [ ] **TODO:** Nach Push automatisch aktiv
- [ ] **TODO:** Actions Tab checken: https://github.com/Toobix-bot/Toobix-Unified-2/actions
- [ ] **TODO:** Logs ansehen (läuft alle 10min?)

#### Option B: UptimeRobot (Empfohlen!)
- [ ] **TODO:** Account erstellen: https://uptimerobot.com
- [ ] **TODO:** Monitor 1 hinzufügen (Public Gateway)
- [ ] **TODO:** Monitor 2 hinzufügen (Core Intelligence)
- [ ] **TODO:** Monitor 3 hinzufügen (Life Support)
- [ ] **TODO:** Interval: 5 Minuten setzen
- [ ] **TODO:** E-Mail Alerts aktivieren
- [ ] **TODO:** Optional: Public Status Page erstellen

**Details:** Siehe `UPTIMEROBOT-SETUP.md`

---

### Step 5: Funktions-Test (24h später)
```bash
# ⏱️ Zeit: 10 Minuten (nach 24h)

# 5.1 Uptime prüfen (Render Dashboard)
# → Metrics Tab
# → Requests, Response Time, Errors

# 5.2 UptimeRobot Statistik
# → Uptime % (Ziel: 99%+)
# → Response Time (Ziel: <500ms)
# → Downtimes (Ziel: 0)

# 5.3 Website Analytics
# → Besucher-Anzahl
# → Chat-Nutzung
# → Fehlerrate
```

**Checkliste:**
- [ ] Services laufen seit 24h
- [ ] Keine längeren Downtimes (>5min)
- [ ] Response Times gut (<500ms)
- [ ] Chat wird genutzt (Logs zeigen Anfragen)
- [ ] Keine kritischen Errors in Logs

---

## 🔧 Post-Deployment Optimierungen

### Woche 1
- [ ] **Analytics:** Google Analytics oder Plausible integrieren
- [ ] **SEO:** Meta-Tags optimieren (Title, Description, OG-Tags)
- [ ] **Performance:** Lighthouse Audit durchführen
- [ ] **Feedback:** Twitter Post machen, Community fragen

### Woche 2
- [ ] **Content:** NotebookLM Podcast-Text auf Website einbinden
- [ ] **Features:** Mehr Showcase-Items hinzufügen
- [ ] **Monitoring:** UptimeRobot Status Page einbinden
- [ ] **API:** Dokumentation für `/api` Endpunkte schreiben

### Monat 1
- [ ] **Community:** GitHub Issues beantworten
- [ ] **Expansion:** Neue Module entwickeln (z.B. Games, Art Gallery)
- [ ] **Hosting:** Upgrade zu Render Paid Plan erwägen (~$7/m)
- [ ] **Domain:** Custom Domain kaufen (toobix.ai?)

---

## 📊 Success Metrics

### Technisch
- ✅ Uptime: >99% (Ziel)
- ✅ Response Time: <500ms (Ziel)
- ✅ Error Rate: <1% (Ziel)
- ✅ Chat Success Rate: >95% (Ziel)

### Community
- ✅ Website Visits: >100/Woche (Ziel nach 1 Monat)
- ✅ GitHub Stars: +10 (Ziel nach 1 Monat)
- ✅ Twitter Engagement: 5+ Interaktionen/Woche (Ziel)
- ✅ Contributors: 1+ (Ziel nach 3 Monaten)

---

## 🆘 Support & Hilfe

**Probleme beim Deployment?**
- GitHub Issues: https://github.com/Toobix-bot/Toobix-Unified-2/issues
- Twitter/X: https://x.com/ToobixAI

**Render.com Probleme?**
- Docs: https://render.com/docs
- Community: https://community.render.com

**Fragen zur Website?**
- Siehe: `WEBSITE-DEPLOYMENT-SUMMARY.md`
- Siehe: `docs/js/app.js` (kommentiert)

---

## 🎉 Launch Checklist (Final)

### Pre-Launch
- [ ] Alle Tests bestanden
- [ ] Keine kritischen Bugs
- [ ] Dokumentation vollständig
- [ ] Backup der alten Website existiert

### Launch
- [ ] Website live (GitHub Pages)
- [ ] Services live (Render.com)
- [ ] Keep-Alive aktiv (GitHub + UptimeRobot)
- [ ] Health-Checks erfolgreich

### Post-Launch
- [ ] Twitter Announcement
- [ ] GitHub README updated
- [ ] Community informiert
- [ ] Monitoring läuft

---

**Status:** 🟡 In Arbeit → 🟢 Ready for Deployment

**Nächster Schritt:** Step 1 - Website Live Schalten

**Geschätzte Gesamtzeit:** ~1 Stunde (inkl. Wartezeiten)
