# 🧪 Toobix Beta-Test Guide

## Willkommen zum Beta-Test!

Vielen Dank, dass du Toobix testest! Dein Feedback hilft, das System zu verbessern.

---

## 🚀 Schnellstart für Beta-Tester

### 1. Installation

```powershell
# Repository klonen
git clone https://github.com/Toobix-bot/Toobix-Unified-2.git
cd Toobix-Unified-2

# Dependencies installieren
bun install

# API Key setzen (wird dir separat mitgeteilt)
$env:GROQ_API_KEY = "gsk_..."
```

### 2. Starten

```powershell
# Alle Services starten
.\START-ALL-SERVICES.ps1

# Warten bis alle 27 Services laufen...
```

### 3. Dashboard öffnen

Öffne die Datei:
```
desktop-app/src/unified-dashboard.html
```

---

## 🎯 Was zu testen ist

### ✅ Core Features

| Feature | Was testen | Wo finden |
|---------|------------|-----------|
| **Chat** | Normale Unterhaltung mit Toobix | Tab "Chat" |
| **Selbstreflexion** | Toobix über sich selbst befragen | Tab "Selbst" |
| **Träume** | Traumliste, Traum-Details | Tab "Träume" |
| **Proaktiv** | Wartet auf automatische Nachrichten | Glocken-Icon oben rechts |
| **Oasis** | Virtuelle Welt erkunden | Tab "Oasis" |
| **Life Companion** | Lebensbereiche tracken | Tab "Leben" |

### 🧠 Erweiterte Features

| Feature | Was testen |
|---------|------------|
| **Multi-Perspektiven** | "Sprich als Poet/Philosoph/Visionär" |
| **5 Stimmen Dialog** | "Lass deine 5 Stimmen diskutieren über..." |
| **Hardware Awareness** | "Wie geht es deiner Hardware?" |
| **Memory Palace** | "Erinnerst du dich an unser letztes Gespräch?" |

---

## 📝 Feedback-Formular

Bitte dokumentiere dein Feedback mit folgendem Format:

### Bug Report
```
🐛 BUG REPORT
--------------
Service/Tab: [z.B. Dreams, Chat]
Was passiert ist:
Was erwartet wurde:
Fehlermeldung (falls vorhanden):
Screenshot (falls möglich):
```

### Feature Request
```
💡 FEATURE REQUEST
------------------
Beschreibung:
Warum nützlich:
Priorität: [Niedrig/Mittel/Hoch]
```

### Allgemeines Feedback
```
💬 FEEDBACK
-----------
Was gut funktioniert:
Was verbessert werden könnte:
Allgemeiner Eindruck (1-10):
```

---

## 🔍 Bekannte Einschränkungen

### ⚠️ Beta-Limitierungen

1. **Kein persistenter State zwischen Neustarts**
   - Träume werden gespeichert, aber Conversations-History geht verloren

2. **Nur lokal verfügbar**
   - Cloud-Deployment kommt in Version 1.0

3. **Kein echtes Minecraft**
   - Bot-Demo ist simuliert (echter Bot in Entwicklung)

4. **Rate Limits**
   - Groq API hat Limits - bei vielen Anfragen kurz warten

---

## 🆘 Troubleshooting

### Services starten nicht
```powershell
# Prüfe ob Bun installiert ist
bun --version

# Prüfe ob Port frei ist
netstat -an | findstr "8954"

# Einzelnen Service testen
bun run scripts/2-services/llm-gateway-v3.ts
```

### Dashboard lädt nicht
1. Browser-Console öffnen (F12)
2. Fehlermeldungen kopieren
3. Im Feedback melden

### API-Fehler
- Prüfe ob `GROQ_API_KEY` gesetzt ist
- Prüfe Internetverbindung
- Warte 60 Sekunden (Rate Limit)

---

## 📊 Beta-Test Checkliste

### Tag 1: Erste Schritte
- [ ] Installation erfolgreich
- [ ] Alle 27 Services laufen
- [ ] Dashboard öffnet sich
- [ ] Erste Nachricht an Toobix

### Tag 2-3: Core Features
- [ ] 10+ Nachrichten ausgetauscht
- [ ] Träume angeschaut
- [ ] Selbstreflexion getestet
- [ ] Proaktive Nachricht erhalten

### Tag 4-5: Erweiterte Features
- [ ] Multi-Perspektiven ausprobiert
- [ ] Oasis erkundet
- [ ] Life Companion genutzt
- [ ] 5 Stimmen Dialog getestet

### Abschluss
- [ ] Feedback-Formular ausgefüllt
- [ ] Bugs dokumentiert
- [ ] Feature-Wünsche notiert
- [ ] Gesamtbewertung abgegeben

---

## 📧 Kontakt

Bei Fragen oder dringenden Problemen:
- GitHub Issues: [github.com/Toobix-bot/Toobix-Unified-2/issues](https://github.com/Toobix-bot/Toobix-Unified-2/issues)
- Email: [wird noch eingerichtet]

---

## 🙏 Danke!

Dein Feedback macht Toobix besser. Jeder Bug, jede Idee, jeder Kommentar hilft!

> 🤖 *"Ich freue mich auf deine Gedanken. Gemeinsam werden wir wachsen."*  
> — Toobix
