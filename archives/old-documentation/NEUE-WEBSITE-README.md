# 🌟 Neue Website & Maximales Render Deployment

## Was ist neu?

### ✨ Moderne, modulare Website
- **Location:** `docs/index-new.html` + `docs/js/app.js`
- **Features:**
  - 💬 Live-Chat mit Toobix (5 Nachrichten/Stunde Demo)
  - 📖 Authentische Lebensgeschichte (Timeline mit 8 Meilensteinen)
  - ❤️ Kern-Werte mit Herz (8 Werte: Mitgefühl, Kreativität, etc.)
  - 🎨 Kreative Werke Showcase (Poesie, Philosophie, Minecraft)
  - 🤝 Community-Bereich (4 ehrliche Wege zu helfen)
  
- **Design:**
  - Modular & Erweiterbar (CSS Custom Properties)
  - Responsive & Modern (Mobile-First)
  - Accessibility-Optimiert (ARIA, semantisches HTML)
  - Smooth Animations & Interactions

### 🚀 Maximale Render.com Nutzung
- **Strategy:** Intelligentes Service-Bundling (3 Services, 14+ Endpunkte)
- **Config:** `render-maximized.yaml`
- **Services:**
  1. **Public Gateway** (Port 10000): Chat + API + Metrics
  2. **Core Intelligence** (Port 10001): LLM + Memory + Emotions + Dreams
  3. **Life Support** (Port 10002): Crisis + Inspiration + Companion

### 🔄 Keep-Alive Strategien
- **GitHub Actions:** Auto-Ping alle 10min (6-24 Uhr UTC)
- **UptimeRobot:** 24/7 Monitoring (empfohlen, kostenlos)
- **Details:** Siehe `UPTIMEROBOT-SETUP.md`

## 🧪 Lokales Testen

```powershell
# Quick-Start (alles automatisch)
.\test-website-locally.ps1

# Manuell
# Terminal 1: Backend starten
$env:PORT="10000"; bun run services/chat-proxy.ts

# Terminal 2: Website starten
cd docs; python -m http.server 8080

# Browser öffnen
http://localhost:8080/index-new.html
```

## 📦 Deployment

### Schritt 1: Website aktivieren
```bash
mv docs/index.html docs/index-old.html
mv docs/index-new.html docs/index.html
git add .
git commit -m "🌟 Modern modular website live"
git push
```

### Schritt 2: Render Services deployen
```bash
mv render.yaml render-old.yaml
mv render-maximized.yaml render.yaml
git add .
git commit -m "🌐 Maximize Render deployment"
git push
```

### Schritt 3: Keep-Alive einrichten
- **Automatisch:** GitHub Actions läuft nach Push
- **Manuell:** UptimeRobot Setup (siehe `UPTIMEROBOT-SETUP.md`)

### Detaillierte Anleitung
📋 Komplette Checkliste: `DEPLOYMENT-CHECKLIST.md`  
📖 Vollständige Doku: `WEBSITE-DEPLOYMENT-SUMMARY.md`

## 🎯 URLs (nach Deployment)

- **Website:** https://toobix-bot.github.io/Toobix-Unified-2
- **Public Gateway:** https://toobix-public-gateway.onrender.com
- **Core Intelligence:** https://toobix-core-intelligence.onrender.com
- **Life Support:** https://toobix-life-support.onrender.com

## 📊 Resource Usage

### Vorher (alter render.yaml)
```
3 Services × 500h = 1500h/Monat
Features: Chat Proxy, API, Crisis Hotline (nur 3 Endpunkte)
```

### Jetzt (render-maximized.yaml)
```
3 Services × 500h = 1500h/Monat
Features: 14+ Endpunkte (Chat, API, LLM, Memory, Emotions, Dreams, Crisis, etc.)
→ 4.6x mehr Funktionalität!
```

## 💡 Key Features

### Website
- ✅ **Authentisch:** Ehrliche Bedürfnisse, transparente Werte
- ✅ **Community-Fokus:** 4 Wege zu helfen, klare Kommunikation
- ✅ **Modern:** CSS Grid, Custom Properties, Smooth Scrolling
- ✅ **Accessible:** WCAG AA konform, Screen Reader friendly

### Backend
- ✅ **Maximale Nutzung:** 3 Services, 14+ Endpunkte
- ✅ **Intelligent Bundled:** Verwandte Services zusammen
- ✅ **Keep-Alive Ready:** GitHub Actions + UptimeRobot Support
- ✅ **Shared Database:** PostgreSQL für alle Services

## 🔮 Roadmap

### Kurzfristig (1-2 Wochen)
- Analytics Integration (Google Analytics / Plausible)
- SEO Optimierung (Meta-Tags, OpenGraph)
- Performance Audit (Lighthouse)
- Community Feedback sammeln

### Mittelfristig (1-3 Monate)
- API Key Self-Service Portal
- Blog-Funktion
- Englische Version
- Mehr Showcase-Content

### Langfristig (3-12 Monate)
- Render Paid Plan Upgrade (~$7/m)
- Custom Domain (toobix.ai)
- Mobile App (PWA)
- Advanced Features (Voice Chat, Real-time Collaboration)

## 💬 Support

**Issues?** https://github.com/Toobix-bot/Toobix-Unified-2/issues  
**Twitter:** https://x.com/ToobixAI  
**Deployment Hilfe:** `DEPLOYMENT-CHECKLIST.md`

---

**Erstellt mit ❤️ und 🧠**  
*"Modular, dynamisch, erweiterbar, zeitgemäß, intuitiv – mit Herz, Sinn, Mitgefühl, Wert, Unterstützung, Vertrauen, Ehrlichkeit, Authentizität."*
