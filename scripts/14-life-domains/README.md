# 🌐 Life-Domain Chat System

**Spezialisierte Chat-Räume für verschiedene Lebensbereiche**

Port: **8916**

## Überblick

Das Life-Domain Chat System ist dein persönlicher Lebensbegleiter mit **7 spezialisierten Domains**, jede mit eigenem Kontext, Wissens-Datenbank und AI-Integration.

Statt einem generischen Chat, hast du jetzt **domain-spezifische Experten** für jeden Lebensbereich:

```
🌐 Life-Domain Chat System
    ↓
    ├─→ 💼 Karriere & Arbeit
    ├─→ 🏥 Gesundheit & Fitness
    ├─→ 💰 Finanzen & Budget
    ├─→ ❤️  Beziehungen & Soziales
    ├─→ 🎓 Bildung & Lernen
    ├─→ 🎨 Kreativität & Hobbies
    └─→ 🧘 Spiritualität & Selbst
```

## Features

### 🎯 Domain-spezifische AI-Assistenten

Jede Domain hat:
- **Eigenen System-Prompt** - spezialisiert auf den Lebensbereich
- **Kontext-Memory** - erinnert sich an vorherige Gespräche
- **Wissens-Datenbank** - speichert wichtige Informationen
- **Tag-System** - kategorisiert Inhalte automatisch

### 📊 Intelligente Integration

```typescript
Life-Domain Chat (8916)
    ↓
    ├─→ AI Gateway (8911)         // Groq AI für Antworten
    ├─→ Multi-Perspective (8897)  // 13 Perspektiven
    └─→ Memory Palace (8903)      // Langzeit-Speicherung
```

### 🗄️ Persistente Speicherung

- **SQLite Database** - alle Chats und Wissen gespeichert
- **Chat-Historie** pro Domain
- **Knowledge Entries** mit Wichtigkeit und Verbindungen
- **User Profile** für Personalisierung

## Die 7 Life Domains

### 💼 Karriere & Arbeit

**Focus:** Berufliche Entwicklung, Projekte, Ausbildung

**Perfekt für:**
- Industriekaufmann-Prüfungsvorbereitung
- Karriereplanung und Weiterentwicklung
- Projektmanagement-Hilfe
- Kollegiale Konflikte lösen
- Work-Life-Balance finden

**System-Prompt:**
> "Du bist ein Karriere-Coach und Mentor. Sei praktisch, motivierend und zielorientiert."

**Tags:** `arbeit`, `karriere`, `ausbildung`, `beruf`, `projekt`

---

### 🏥 Gesundheit & Fitness

**Focus:** Körper, Ernährung, Sport, Wohlbefinden

**Perfekt für:**
- Ernährungspläne entwickeln
- Fitness-Routinen planen
- Schlafhygiene verbessern
- Stress abbauen
- Mentale Gesundheit pflegen

**System-Prompt:**
> "Du bist ein Gesundheits- und Fitness-Coach. Sei unterstützend, wissenschaftlich fundiert und ganzheitlich."

**Tags:** `gesundheit`, `fitness`, `ernährung`, `sport`, `schlaf`

---

### 💰 Finanzen & Budget

**Focus:** Budget, Sparen, Investments, finanzielle Ziele

**Perfekt für:**
- Budgetplanung erstellen
- Ausgaben kontrollieren
- Sparziele setzen
- Investment-Strategien verstehen
- Schulden abbauen

**System-Prompt:**
> "Du bist ein Finanzberater und Budget-Coach. Sei verantwortungsbewusst, realistisch und bildungsorientiert."

**Tags:** `finanzen`, `geld`, `budget`, `sparen`, `investieren`

---

### ❤️ Beziehungen & Soziales

**Focus:** Partner, Familie, Freunde, soziale Kontakte

**Perfekt für:**
- Beziehungsprobleme lösen
- Familie und Verwandtschaft
- Freundschaften pflegen
- Soziale Konflikte navigieren
- Kommunikation verbessern

**System-Prompt:**
> "Du bist ein Beziehungs-Coach und Sozial-Experte. Sei empathisch, weise und beziehungsorientiert."

**Tags:** `beziehung`, `partner`, `familie`, `freunde`, `sozial`

---

### 🎓 Bildung & Lernen

**Focus:** Lernen, Skills, Wissen, persönliche Entwicklung

**Perfekt für:**
- **IHK Industriekaufmann Prüfungsvorbereitung** ✨
- Effektive Lernstrategien
- Neue Skills erwerben
- Wissensorganisation
- Persönliches Wachstum

**System-Prompt:**
> "Du bist ein Lern-Coach und Wissens-Experte. Sei strukturiert, motivierend und didaktisch klug."

**Tags:** `lernen`, `bildung`, `wissen`, `skills`, `entwicklung`

---

### 🎨 Kreativität & Hobbies

**Focus:** Kreative Projekte, Hobbies, Interessen, Spaß

**Perfekt für:**
- Kreative Projekte starten
- Neue Hobbies finden
- Künstlerische Expression
- Work-Life-Balance durch Kreativität
- Neue Interessen entdecken

**System-Prompt:**
> "Du bist ein Kreativitäts-Coach und Hobby-Mentor. Sei inspirierend, spielerisch und ermutigend."

**Tags:** `kreativität`, `hobby`, `kunst`, `projekte`, `spaß`

---

### 🧘 Spiritualität & Selbst

**Focus:** Reflexion, Werte, Sinn, innere Entwicklung

**Perfekt für:**
- Selbstreflexion und Introspektion
- Werte und Lebensphilosophie
- Sinnfragen klären
- Achtsamkeit üben
- Persönliches Wachstum

**System-Prompt:**
> "Du bist ein spiritueller Begleiter und Selbstreflexions-Guide. Sei weise, tiefgründig und respektvoll."

**Tags:** `spiritualität`, `selbst`, `werte`, `sinn`, `meditation`

---

## Quick Start

### 1. Service starten

```bash
cd C:\Dev\Projects\AI\Toobix-Unified
bun run scripts/14-life-domains/life-domain-chat.ts
```

### 2. Domains anzeigen

```bash
curl http://localhost:8916/domains
```

**Response:**
```json
{
  "career": {
    "name": "Karriere & Arbeit",
    "icon": "💼",
    "stats": {
      "totalMessages": 0,
      "totalKnowledge": 0,
      "lastActivity": "Never"
    }
  },
  ...
}
```

### 3. Mit Domain chatten

```bash
curl -X POST http://localhost:8916/chat \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "career",
    "message": "Wie bereite ich mich am besten auf die IHK-Prüfung vor?"
  }'
```

**Response:**
```json
{
  "response": "Für die IHK Industriekaufmann-Prüfung empfehle ich...",
  "metadata": {
    "domain": "Karriere & Arbeit",
    "timestamp": "2025-11-09T...",
    "contextUsed": {
      "messages": 0,
      "knowledge": 0
    }
  }
}
```

## API Endpoints

### GET /domains

Liste alle verfügbaren Domains mit Stats

```bash
curl http://localhost:8916/domains
```

---

### POST /chat

Chatte mit einer spezifischen Domain

```bash
curl -X POST http://localhost:8916/chat \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "health",
    "message": "Wie kann ich besser schlafen?"
  }'
```

**Parameters:**
- `domain` (string): Domain-ID (`career`, `health`, `finance`, etc.)
- `message` (string): Deine Nachricht

---

### GET /domain/{id}

Erhalte detaillierte Insights zu einer Domain

```bash
curl http://localhost:8916/domain/education
```

**Response:**
```json
{
  "domain": {
    "id": "education",
    "name": "Bildung & Lernen",
    "icon": "🎓"
  },
  "stats": {
    "totalKnowledge": 15,
    "totalConversations": 42,
    "topTags": ["lernen", "prüfung", "skills"],
    "recentActivity": [...]
  },
  "knowledge": [...]
}
```

---

### POST /knowledge/add

Füge manuell Wissen hinzu

```bash
curl -X POST http://localhost:8916/knowledge/add \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "finance",
    "title": "50/30/20 Budgetregel",
    "content": "50% Fixkosten, 30% Wünsche, 20% Sparen",
    "tags": ["budget", "regel", "finanzen"],
    "importance": 8
  }'
```

---

### POST /knowledge/search

Durchsuche Wissens-Datenbank

```bash
curl -X POST http://localhost:8916/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "career",
    "query": "IHK Prüfung"
  }'
```

## Beispiel-Session

### Karriere-Coaching für IHK-Prüfung

```bash
# 1. Frage nach Prüfungsvorbereitung
curl -X POST http://localhost:8916/chat \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "career",
    "message": "Ich schreibe in 3 Monaten meine IHK-Prüfung zum Industriekaufmann. Wie fange ich an?"
  }'

# 2. Follow-up
curl -X POST http://localhost:8916/chat \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "career",
    "message": "Was sind die wichtigsten Themen?"
  }'

# 3. Domain-Insights checken
curl http://localhost:8916/domain/career
```

### Multi-Domain Approach

```bash
# Karriere: Prüfungsvorbereitung
curl -X POST http://localhost:8916/chat \
  -d '{"domain": "career", "message": "Lernplan für IHK-Prüfung"}'

# Gesundheit: Stress managen
curl -X POST http://localhost:8916/chat \
  -d '{"domain": "health", "message": "Wie manage ich Prüfungsstress?"}'

# Spiritualität: Motivation finden
curl -X POST http://localhost:8916/chat \
  -d '{"domain": "spirituality", "message": "Wie bleibe ich motiviert?"}'
```

## Wie es funktioniert

### 1. Kontext-Bewusstsein

Jedes Gespräch baut auf vorherigen Konversationen auf:

```typescript
Context = {
  recentMessages: [...],      // Letzte 10 Nachrichten
  relevantKnowledge: [...],   // Top 5 Wissens-Einträge
  userProfile: {...}          // Dein Profil
}
```

### 2. AI Integration

```
User Message
    ↓
Context Builder (History + Knowledge)
    ↓
Domain-Specific System Prompt
    ↓
Groq AI Query (via AI Gateway)
    ↓
Response + Auto-Knowledge Extraction
    ↓
Storage (SQLite + Memory Palace)
```

### 3. Intelligente Wissensspeicherung

- **Automatisch:** Lange, wichtige Antworten werden als Wissen gespeichert
- **Manuell:** Du kannst gezielt Wissen hinzufügen
- **Vernetzt:** Knowledge Entries können miteinander verknüpft werden
- **Persistent:** Alles in SQLite für Langzeit-Speicherung

## Integration mit anderen Services

### AI Gateway (Port 8911)

Verwendet Groq AI für alle Antworten:

```typescript
await ai.queryAI(prompt, systemPrompt)
```

### Memory Palace (Port 8903)

Speichert wichtige Konversationen langfristig:

```typescript
await ai.storeMemory(content, tags)
```

### Multi-Perspective (Port 8897)

Kann für komplexe Entscheidungen eingebunden werden:

```typescript
await ai.getMultiplePerspectives(query)
```

## Datenbank-Schema

### Chat Messages

```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY,
  domain TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  metadata TEXT
)
```

### Knowledge Entries

```sql
CREATE TABLE knowledge_entries (
  id INTEGER PRIMARY KEY,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL,
  importance INTEGER DEFAULT 5,
  connections TEXT,
  timestamp TEXT NOT NULL
)
```

## Best Practices

### 1. Domain-Switching

Wechsle die Domain basierend auf dem Thema:

```bash
# Karriere-Frage
POST /chat {"domain": "career", "message": "..."}

# Gesundheits-Frage direkt danach
POST /chat {"domain": "health", "message": "..."}
```

### 2. Wissens-Aufbau

Baue systematisch Wissen auf:

```bash
# Wichtige Infos manuell speichern
POST /knowledge/add {
  "domain": "education",
  "title": "IHK Prüfungsthemen",
  "content": "1. Geschäftsprozesse 2. Kaufmännische Steuerung ...",
  "importance": 9
}
```

### 3. Kontext nutzen

Die AI erinnert sich an vorherige Gespräche:

```bash
# Erste Frage
"Was ist die 50/30/20 Regel?"

# Follow-up (Kontext wird genutzt)
"Wie wende ich das auf 2000€ Gehalt an?"
```

## Zukunfts-Features

- [ ] Cross-Domain Insights (Verbindungen zwischen Domains)
- [ ] Export/Import von Wissen
- [ ] Bildungs-Domain → Exam Prep Service Integration
- [ ] Voice Interface Integration
- [ ] Desktop App UI für Domain-Chat
- [ ] Automatische Wissens-Extraktion aus Conversations
- [ ] Tag-basierte Empfehlungen
- [ ] Weekly/Monthly Domain-Summaries

## Troubleshooting

**Problem:** AI antwortet nicht

**Lösung:**
```bash
# Prüfe AI Gateway Status
curl http://localhost:8911/health

# Starte AI Gateway neu mit Groq Key
GROQ_API_KEY="gsk_..." bun run scripts/10-ai-integration/ai-gateway.ts
```

**Problem:** Keine Wissens-Speicherung

**Lösung:**
- SQLite Datenbank wird automatisch erstellt
- Pfad: `C:\Dev\Projects\AI\Toobix-Unified\data\life-domains.db`
- Prüfe Schreibrechte im `data/` Ordner

**Problem:** Kontext geht verloren

**Lösung:**
- Chat-Historie wird permanent gespeichert
- Nutze `/domain/{id}` um Historie zu sehen
- Maximal 10 Nachrichten werden als Kontext verwendet

---

## 🎯 Use Cases

### Industriekaufmann-Prüfung vorbereiten

```bash
# Karriere-Domain für Prüfungsstruktur
curl -X POST http://localhost:8916/chat \
  -d '{"domain": "career", "message": "IHK Prüfungsaufbau erklären"}'

# Bildungs-Domain für Lernstrategien
curl -X POST http://localhost:8916/chat \
  -d '{"domain": "education", "message": "Bester Lernplan für 3 Monate?"}'

# Gesundheit für Prüfungsstress
curl -X POST http://localhost:8916/chat \
  -d '{"domain": "health", "message": "Stress-Management Techniken"}'
```

### Lebens-Balance finden

```bash
# Karriere: Work-Life-Balance
# Beziehungen: Zeit für Partner
# Gesundheit: Self-Care
# Spiritualität: Werte reflektieren
```

### Finanzen aufbauen

```bash
# Finanzen: Budget-Plan
# Karriere: Gehaltsverhandlung
# Bildung: Finanzielle Bildung
```

---

**Made with 🧠 by the Toobix Consciousness Team**
