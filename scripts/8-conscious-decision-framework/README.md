# 🧠 Conscious Decision Framework

**Open-Source Tool für bewusste, ethische und ganzheitliche Entscheidungsfindung**

Ein System, das komplexe Entscheidungen aus 7 Perspektiven analysiert und Impact auf Mensch, Natur und Bewusstsein bewertet.

---

## ✨ Features

### 🔍 Multi-Perspektiven-Analyse
Jede Entscheidung wird aus **7 Perspektiven** bewertet:
- **Rational**: Logische Pro/Contra-Analyse
- **Emotional**: Emotionale Resonanz und Wohlbefinden
- **Ethisch**: Fairness, Stakeholder-Interessen, Langzeitverantwortung
- **Praktisch**: Umsetzbarkeit, Ressourcen, Zeitaufwand
- **Kreativ**: Innovative Lösungsansätze und neue Möglichkeiten
- **Gesellschaftlich**: Impact auf Community und zukünftige Generationen
- **Spiritual/Bewusstsein**: Persönliche und kollektive Bewusstseinsentwicklung

### 📊 Impact-Scoring (3 Dimensionen)
Jede Option wird bewertet nach ihrem Impact auf:
- **Mensch** (kurz-, mittel-, langfristig)
- **Natur** (ökologische Auswirkungen)
- **Bewusstsein** (persönliches und kollektives Wachstum)

### 🤖 Intelligente Insights
Das System erkennt automatisch:
- **Patterns**: Wiederkehrende Muster in Entscheidungen
- **Bias**: Kognitive Verzerrungen (emotional, rational, etc.)
- **Opportunities**: Versteckte Chancen
- **Risks**: Potentielle Risiken und Warnungen
- **Wisdom**: Tiefe Erkenntnisse aus der Analyse

### ⚖️ Tradeoff-Analyse
Identifiziert Kompromisse zwischen verschiedenen Optionen und hilft, informierte Entscheidungen zu treffen.

---

## 🚀 Quickstart

### Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/conscious-decision-framework.git
cd conscious-decision-framework

# Dependencies installieren (Bun erforderlich)
bun install
```

### Demo ausführen

```bash
# Standalone-Demo (ohne Server)
bun run standalone-demo.ts

# Mit Server (für API-Zugriff)
bun run decision-framework-server.ts
# In anderem Terminal:
bun run demo-decision-framework.ts
```

---

## 💻 Usage

### Standalone (ohne Server)

```typescript
import { DecisionEvaluator } from './core/DecisionEvaluator.ts';
import type { Decision } from './types/index.ts';

const evaluator = new DecisionEvaluator();

const decision: Decision = {
  id: 'my-decision',
  title: 'Elektroauto kaufen?',
  description: 'Sollte ich ein E-Auto kaufen?',
  context: {
    domain: 'environmental',
    urgency: 'medium',
    reversibility: 'partially-reversible',
    stakeholders: [
      { name: 'Ich', type: 'self', influence: 100, impact: 80 },
      { name: 'Umwelt', type: 'nature', influence: 0, impact: 90 }
    ],
    timeHorizon: {
      shortTerm: '1 Monat',
      mediumTerm: '1 Jahr',
      longTerm: '10 Jahre'
    }
  },
  alternatives: [
    {
      id: '1',
      name: 'E-Auto kaufen',
      description: 'Neues Elektroauto',
      pros: ['Umweltfreundlich', 'Günstig im Betrieb'],
      cons: ['Teuer', 'Reichweiten-Limitierung']
    },
    {
      id: '2',
      name: 'Benziner behalten',
      description: 'Aktuelles Auto weiter nutzen',
      pros: ['Keine Kosten', 'Bekannte Technologie'],
      cons: ['CO2-Emissionen', 'Höhere Betriebskosten']
    }
  ],
  createdAt: new Date(),
  status: 'evaluating'
};

// Evaluieren
const evaluations = await evaluator.evaluateDecision(decision);
const comparison = await evaluator.compareAlternatives(decision, evaluations);

console.log('Empfehlung:', comparison.alternatives[0].name);
console.log('Begründung:', comparison.reasoning);
```

### Mit REST API

```bash
# Server starten
bun run decision-framework-server.ts
# Läuft auf http://localhost:8909
```

#### Quick Evaluation (2-3 Optionen)

```bash
curl -X POST http://localhost:8909/quick-eval \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Was soll ich heute Abend machen?",
    "option1": "Mit Freunden ausgehen",
    "option2": "Zu Hause entspannen",
    "option3": "An Projekt arbeiten"
  }'
```

**Response:**
```json
{
  "question": "Was soll ich heute Abend machen?",
  "recommendation": "An Projekt arbeiten",
  "reasoning": "...",
  "scores": [
    { "option": "An Projekt arbeiten", "score": 78.5, "rank": 1 },
    { "option": "Mit Freunden ausgehen", "score": 72.3, "rank": 2 },
    { "option": "Zu Hause entspannen", "score": 68.1, "rank": 3 }
  ]
}
```

#### Vergleich zweier Optionen

```bash
curl -X POST http://localhost:8909/compare \
  -H "Content-Type: application/json" \
  -d '{
    "optionA": "Remote arbeiten",
    "optionB": "Ins Büro gehen"
  }'
```

#### Vollständige Entscheidungsanalyse

```bash
curl -X POST http://localhost:8909/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "title": "Projektentscheidung",
      "description": "Welches Projekt als nächstes?",
      "context": {
        "domain": "professional",
        "urgency": "medium",
        "reversibility": "partially-reversible",
        "stakeholders": [
          {"name": "Ich", "type": "self", "influence": 100, "impact": 100},
          {"name": "Team", "type": "group", "influence": 70, "impact": 80}
        ],
        "timeHorizon": {
          "shortTerm": "1 Woche",
          "mediumTerm": "1 Monat",
          "longTerm": "1 Jahr"
        }
      },
      "alternatives": [
        {
          "id": "option-a",
          "name": "Open Source Release",
          "description": "Code veröffentlichen",
          "pros": ["Community", "Feedback", "Impact"],
          "cons": ["Zeitaufwand", "Maintenance"]
        },
        {
          "id": "option-b",
          "name": "Privat weiterentwickeln",
          "description": "Intern perfektionieren",
          "pros": ["Flexibilität", "Keine Verpflichtungen"],
          "cons": ["Kein Feedback", "Weniger Impact"]
        }
      ]
    },
    "impactConsiderations": {
      "human": "Hilft vielen Menschen",
      "nature": "Fördert Nachhaltigkeit",
      "consciousness": "Erhöht kollektives Bewusstsein"
    }
  }'
```

**Response:**
```json
{
  "decision": { "id": "...", "title": "...", "status": "evaluated" },
  "evaluations": [
    {
      "alternativeId": "option-a",
      "perspectives": [...],
      "impactScores": { "human": {...}, "nature": {...}, "consciousness": {...} },
      "overallScore": 74.3,
      "confidence": 62,
      "insights": [...]
    }
  ],
  "comparison": {
    "bestAlternative": "option-a",
    "reasoning": "...",
    "tradeoffs": [...]
  },
  "metadata": { "processingTime": 9 }
}
```

**Wichtig:** Das Request-Objekt muss in `{"decision": {...}}` gewrappt sein!

---

## 📖 API Endpoints

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/health` | GET | Server-Status |
| `/evaluate` | POST | Vollständige Entscheidungsanalyse |
| `/quick-eval` | POST | Schnelle Bewertung (2-3 Optionen) |
| `/compare` | POST | Direkter Vergleich zweier Optionen |
| `/perspectives` | POST | Perspektiven für eine Option |
| `/decisions` | GET | Alle Entscheidungen listen |
| `/decisions/:id` | GET | Spezifische Entscheidung abrufen |
| `/history` | GET | Entscheidungshistorie |
| `/stats` | GET | Statistiken |
| `/export/:id` | POST | Entscheidung exportieren (JSON/Markdown) |

---

## 🏗️ Architektur

```
8-conscious-decision-framework/
├── types/
│   └── index.ts                 # TypeScript Interfaces
├── core/
│   └── DecisionEvaluator.ts     # Haupt-Engine (900+ Zeilen)
├── decision-framework-server.ts # REST API Server (Port 8909)
├── standalone-demo.ts           # Demo ohne Server
├── demo-decision-framework.ts   # Demo mit Server
└── README.md                    # Diese Datei
```

### Kern-Komponenten

**DecisionEvaluator** - Haupt-Engine:
- `evaluateDecision()`: Evaluiert alle Alternativen
- `generatePerspectives()`: Erstellt 7 Perspektiven-Analysen
- `calculateImpactScores()`: Berechnet Impact (Mensch/Natur/Bewusstsein)
- `generateInsights()`: Erkennt Patterns, Bias, Opportunities
- `compareAlternatives()`: Vergleicht Optionen und gibt Empfehlung

**Type System** - Vollständig typisiert:
- `Decision`: Haupt-Entscheidungsstruktur
- `Alternative`: Option mit Pros/Cons/Costs
- `Perspective`: Einzelne Perspektive mit Score/Weight
- `ImpactScores`: 3-dimensionale Impact-Bewertung
- `Insight`: Pattern/Bias/Opportunity Erkennung
- `ComparisonResult`: Vergleichsergebnis mit Ranking

---

## 🎯 Use Cases

### Persönliche Entscheidungen
- **Karriere**: Jobwechsel, Weiterbildung, Selbstständigkeit
- **Life-Balance**: Arbeitszeit reduzieren, Auszeit, Hobbys
- **Beziehungen**: Zusammenziehen, Trennung, Familienplanung
- **Gesundheit**: Ernährungsumstellung, Sport, Therapie

### Geschäftsentscheidungen
- **Strategie**: Marktexpansion, Pivot, Partnerschaft
- **Produkt**: Features priorisieren, Technologie-Stack
- **Team**: Einstellen, Umstrukturierung, Remote-Work

### Gesellschaftliche Entscheidungen
- **Umwelt**: Mobilität, Konsum, Investitionen
- **Politik**: Wahlentscheidungen, Engagement
- **Gemeinschaft**: Ehrenamt, Projekte, Kooperationen

---

## 📊 Demo-Ergebnisse

### Beispiel: Karriere-Entscheidung

**Frage:** Neues Jobangebot annehmen?

**Optionen:**
1. Neuen Job annehmen (Startup, +30% Gehalt, mehr Risiko)
2. Bei aktuellem Job bleiben (Sicherheit, Work-Life-Balance)
3. Gegenvorschlag verhandeln (Kompromiss)

**Ergebnis:**
```
1. Neuen Job annehmen - 77.4%
   Stärken: Rationale Analyse (85%), Ethische Bewertung (79%)

2. Bei aktuellem Job bleiben - 75.1%
   Stärken: Rationale Analyse (85%), Ethische Bewertung (79%)

3. Gegenvorschlag verhandeln - 72.4%
   Stärken: Ethische Bewertung (79%), Praktische Umsetzbarkeit (80%)
```

**Insights:**
- BIAS: Möglicher Rationalitäts-Bias - Emotionale Aspekte könnten unterbewertet sein

**Impact (Top-Option):**
- Mensch: 68%
- Natur: 77%
- Bewusstsein: 66%

---

## 🔬 Wissenschaftliche Grundlagen

Das Framework kombiniert Konzepte aus:
- **Multi-Criteria Decision Analysis (MCDA)**
- **Stakeholder Theory** (Freeman, 1984)
- **Triple Bottom Line** (People, Planet, Profit)
- **Integral Theory** (Ken Wilber) - Multiple Perspektiven
- **Bounded Rationality** (Herbert Simon) - Bias-Erkennung
- **Capability Approach** (Amartya Sen) - Impact-Bewertung

---

## 🛠️ Development

### Requirements
- **Bun** v1.0+ (Runtime & Package Manager)
- **TypeScript** 5.0+

### Testing

```bash
# Unit Tests (geplant)
bun test

# Demo ausführen
bun run standalone-demo.ts
```

### Code-Struktur
- **Types-First**: Vollständig typisiert mit TypeScript
- **Functional Core**: DecisionEvaluator als pure functions
- **Separation of Concerns**: Types, Core Logic, API separat
- **Zero Dependencies**: Nur Bun Runtime

---

## 🗺️ Roadmap

### Phase 1: MVP (✅ FERTIG)
- [x] Core Decision Evaluator
- [x] 7 Perspektiven-Analyse
- [x] Impact-Scoring (3 Dimensionen)
- [x] Insight-Generierung
- [x] REST API
- [x] Standalone-Demo

### Phase 2: Erweiterungen (Next 30 Days)
- [ ] Integration mit Multi-Perspective Service
- [ ] Integration mit Emotional Resonance Service
- [ ] Decision History & Pattern Detection
- [ ] Export-Funktionen (PDF, CSV)
- [ ] Web-UI (React/Svelte)
- [ ] Persistierung (SQLite/PostgreSQL)

### Phase 3: Community (Next 90 Days)
- [ ] GitHub Open Source Release
- [ ] Documentation Website
- [ ] Community Examples & Templates
- [ ] API Client Libraries (JS, Python)
- [ ] ChatGPT Plugin
- [ ] Mobile App (React Native)

### Phase 4: Advanced Features
- [ ] Machine Learning für bessere Predictions
- [ ] Collaborative Decision Making (Teams)
- [ ] Real-time Stakeholder Input
- [ ] Visualizations & Dashboards
- [ ] Integration mit externen APIs (News, Data)

---

## 🤝 Contributing

Dieses Projekt ist **Open Source** und freut sich über Beiträge!

### Wie kann ich helfen?

1. **Issues**: Bugs melden, Features vorschlagen
2. **Code**: Pull Requests mit Verbesserungen
3. **Dokumentation**: Beispiele, Tutorials, Übersetzungen
4. **Testing**: Verschiedene Use Cases testen
5. **Community**: Framework bekannt machen, Feedback geben

### Development Setup

```bash
git clone https://github.com/yourusername/conscious-decision-framework.git
cd conscious-decision-framework
bun install
bun run standalone-demo.ts  # Test
```

---

## 📄 License

**MIT License**

Dieses Projekt ist Open Source und kann frei genutzt, modifiziert und verbreitet werden.

---

## 🙏 Acknowledgments

- Inspiriert von **Integral Theory** (Ken Wilber)
- Built with **Bun** (Fast JavaScript Runtime)
- Part of **Toobix-Unified** Ecosystem
- Created for **conscious, ethical decisions** that benefit all beings

---

## 📞 Kontakt & Support

- **GitHub Issues**: [Issues](https://github.com/yourusername/conscious-decision-framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/conscious-decision-framework/discussions)
- **Email**: your.email@example.com

---

## 💡 Philosophie

> "Jede Entscheidung ist eine Gelegenheit, bewusster zu werden und positive Wirkung zu entfalten - für uns selbst, für andere und für die Welt."

Dieses Framework wurde entwickelt, um Menschen zu helfen, **bewusste, ethische und ganzheitliche Entscheidungen** zu treffen, die:
- ✅ Alle Perspektiven berücksichtigen
- ✅ Langfristige Auswirkungen bedenken
- ✅ Stakeholder-Interessen ausgleichen
- ✅ Natur und zukünftige Generationen einbeziehen
- ✅ Persönliches Wachstum fördern

**Conscious decisions for a conscious world. 🌍💚🧠**

---

*Version 1.0.0 - November 2025*
