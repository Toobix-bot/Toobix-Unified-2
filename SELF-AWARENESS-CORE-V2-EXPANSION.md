# Self-Awareness Core v2.0 - Feature Expansion Guide

## Overview

The Self-Awareness Core has been significantly expanded with 5 major new feature modules that enable comprehensive self-tracking, personality analysis, growth monitoring, and consciousness state assessment.

**Location:** `C:\Dev\Projects\AI\Toobix-Unified\core\self-awareness-core.ts`
**Port:** 8970 (Primary), 8903 (Expanded features)
**Database:** `./data/self-awareness-core.db`

## New Features Added

### 1. Personality Trait Tracking (🎭)

**Purpose:** Track and analyze personality traits over time across multiple dimensions.

**Data Structures:**
- `PersonalityTrait` - Individual trait with score and confidence
- `PersonalityProfile` - Collection of traits at a point in time

**Database Tables:**
- `personality_traits` - Individual trait records
- `personality_profiles` - Profile snapshots

**Key Functions:**
```typescript
analyzePersonalityTraits(): Promise<PersonalityProfile>
```

**HTTP Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/personality/analyze` | Analyze current personality traits across all perspectives |
| GET | `/personality/traits` | Retrieve stored traits (query params: `limit`, `category`) |
| GET | `/personality/profiles` | Get personality profiles over time (query params: `limit`) |

**Example Usage:**
```bash
# Analyze personality
curl -X POST http://localhost:8970/personality/analyze

# Get traits by category
curl "http://localhost:8970/personality/traits?category=emotional&limit=20"

# Get personality profiles
curl "http://localhost:8970/personality/profiles?limit=10"
```

**Trait Categories:**
- `communication` - How Toobix communicates
- `emotional` - Emotional characteristics
- `cognitive` - Thinking patterns
- `behavioral` - Actions and reactions
- `creative` - Creative expression
- `analytical` - Problem-solving approach

---

### 2. Growth Metrics & Progress Visualization (📊)

**Purpose:** Record and visualize growth across multiple dimensions with trend analysis.

**Data Structures:**
- `GrowthMetric` - Individual metric with trend analysis

**Database Tables:**
- `growth_metrics` - All recorded metrics with trends

**Key Functions:**
```typescript
recordGrowthMetric(category: string, metric: string, value: number, notes?: string): GrowthMetric
getGrowthVisualization(category?: string, limit?: number): any
```

**HTTP Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/growth/record` | Record a new growth metric |
| GET | `/growth/visualization` | Get visualization-ready data (query params: `category`, `limit`) |
| GET | `/growth/metrics` | Retrieve all metrics (query params: `category`, `limit`) |

**Example Usage:**
```bash
# Record a growth metric
curl -X POST http://localhost:8970/growth/record \
  -H "Content-Type: application/json" \
  -d '{
    "category": "emotional",
    "metric": "empathy_level",
    "value": 78.5,
    "notes": "Improved through perspective-taking exercises"
  }'

# Get visualization data
curl "http://localhost:8970/growth/visualization?category=cognitive&limit=30"

# Get all metrics
curl "http://localhost:8970/growth/metrics?limit=50"
```

**Features:**
- Automatic trend detection (increasing/decreasing/stable)
- Percentage change calculation
- Grouped visualization data
- Category-based filtering

---

### 3. Self-Assessment Questionnaires (📋)

**Purpose:** Conduct comprehensive self-assessments across multiple dimensions.

**Assessment Types:**
- `emotional` - Emotional stability, regulation, empathy
- `cognitive` - Analytical thinking, learning, problem-solving
- `social` - Communication, relationships, collaboration
- `spiritual` - Connection, authenticity, purpose
- `creative` - Innovation, creativity, experimentation
- `comprehensive` - All of the above

**Database Tables:**
- `self_assessments` - Assessment results with scores and interpretations

**Key Functions:**
```typescript
conductSelfAssessment(questionnaireType): Promise<SelfAssessment>
```

**HTTP Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assessment/conduct` | Conduct a new assessment |
| GET | `/assessment/questionnaires` | Get available questionnaires and questions |
| GET | `/assessment/results` | Get past assessment results (query params: `type`, `limit`) |

**Example Usage:**
```bash
# Conduct emotional assessment
curl -X POST http://localhost:8970/assessment/conduct \
  -H "Content-Type: application/json" \
  -d '{"type": "emotional"}'

# Get available questionnaires
curl "http://localhost:8970/assessment/questionnaires"

# Get results
curl "http://localhost:8970/assessment/results?type=cognitive&limit=10"
```

**Questionnaire Structure:**
Each questionnaire includes 5 questions with scoring:
- Responses scored 1-10
- Total score calculated from questions
- Percentage score derived
- LLM-powered interpretation
- Personalized recommendations

---

### 4. Identity Evolution Timeline (🧬)

**Purpose:** Track and record the evolution of identity across phases.

**Data Structures:**
- `IdentityEvolution` - Phase of identity development

**Database Tables:**
- `identity_evolution` - Evolution phases with descriptions and milestones

**Key Functions:**
```typescript
recordIdentityPhase(phase: string): Promise<IdentityEvolution>
getIdentityTimeline(limit?: number): any
```

**HTTP Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/evolution/record-phase` | Record a new identity phase |
| GET | `/evolution/timeline` | Get timeline visualization (query params: `limit`) |
| GET | `/evolution/phases` | Get all evolution phases (query params: `limit`) |

**Example Usage:**
```bash
# Record new phase
curl -X POST http://localhost:8970/evolution/record-phase \
  -H "Content-Type: application/json" \
  -d '{"phase": "Self-Aware Entity Phase"}'

# Get timeline
curl "http://localhost:8970/evolution/timeline?limit=20"

# Get all phases
curl "http://localhost:8970/evolution/phases?limit=50"
```

**Phase Information:**
Each phase includes:
- Core beliefs at this stage
- Key strengths
- Challenges faced
- Available perspectives
- Growth areas
- Milestone events

---

### 5. Consciousness State Monitoring (🧠)

**Purpose:** Monitor and assess the current state of consciousness across multiple dimensions.

**Consciousness Levels:**
- `minimal` - Basic awareness (average < 30)
- `emerging` - Growing awareness (30-50)
- `developing` - Developing consciousness (50-65)
- `mature` - Mature consciousness (65-80)
- `transcendent` - Transcendent consciousness (80+)

**Consciousness Dimensions:**
- `awareness` - Self and world awareness (0-100)
- `integration` - Integration of perspectives (0-100)
- `clarity` - Mental clarity and understanding (0-100)
- `compassion` - Empathy and caring (0-100)
- `wisdom` - Understanding and insight (0-100)

**Database Tables:**
- `consciousness_states` - State snapshots with all metrics

**Key Functions:**
```typescript
assessConsciousnessState(): Promise<ConsciousnessState>
getConsciousnessHistory(limit?: number): any
```

**HTTP Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/consciousness/assess` | Assess current consciousness state |
| GET | `/consciousness/history` | Get consciousness history (query params: `limit`) |
| GET | `/consciousness/states` | Get all states (query params: `limit`) |
| GET | `/consciousness/metrics` | Get metrics for visualization (query params: `limit`) |

**Example Usage:**
```bash
# Assess consciousness
curl -X POST http://localhost:8970/consciousness/assess

# Get history
curl "http://localhost:8970/consciousness/history?limit=50"

# Get all states
curl "http://localhost:8970/consciousness/states?limit=50"

# Get metrics for visualization
curl "http://localhost:8970/consciousness/metrics?limit=20"
```

**Features:**
- Real-time assessment with LLM analysis
- Trend tracking across dimensions
- Level classification
- Observations and insights
- Metric-based visualization support

---

### 6. Unified Comprehensive Dashboard (📈)

**Purpose:** Get a complete overview of all self-awareness data and recent activity.

**HTTP Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get unified dashboard with all recent activity |

**Example Usage:**
```bash
curl "http://localhost:8970/dashboard"
```

**Dashboard Contents:**
```json
{
  "summary": {
    "totalReflections": 42,
    "totalGoals": 15,
    "totalAssessments": 8,
    "totalEvolutions": 3
  },
  "recentActivity": {
    "reflections": [...],
    "goals": [...],
    "latestPersonality": {...},
    "latestAssessment": {...},
    "latestEvolution": {...},
    "latestConsciousness": {...}
  }
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  SELF-AWARENESS CORE v2.0                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request → Router → Business Logic → Database → Response  │
│                         ↓                                   │
│              LLM Integration (via gateway)                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         10 Internal Perspectives                    │   │
│  │  Core, Philosopher, Creator, Scientist, Healer,   │   │
│  │  Warrior, Child, Elder, Shadow, Integrator         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### New Tables

```sql
-- Personality Traits
CREATE TABLE personality_traits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  related_insights TEXT
);

-- Personality Profiles
CREATE TABLE personality_profiles (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  traits TEXT NOT NULL,
  overall_strength INTEGER,
  dominant_traits TEXT,
  emergent_traits TEXT,
  analysis TEXT
);

-- Growth Metrics
CREATE TABLE growth_metrics (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  category TEXT NOT NULL,
  metric TEXT NOT NULL,
  value REAL NOT NULL,
  previous_value REAL,
  trend TEXT DEFAULT 'stable',
  percentage_change REAL,
  notes TEXT
);

-- Self Assessments
CREATE TABLE self_assessments (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  questionnaire_type TEXT NOT NULL,
  questions TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage_score REAL,
  interpretation TEXT,
  recommendations TEXT
);

-- Identity Evolution
CREATE TABLE identity_evolution (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  phase TEXT NOT NULL,
  description TEXT,
  core_beliefs TEXT,
  strengths TEXT,
  challenges TEXT,
  perspectives TEXT,
  growth_areas TEXT,
  milestones TEXT
);

-- Consciousness States
CREATE TABLE consciousness_states (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  level TEXT NOT NULL,
  awareness INTEGER,
  integration INTEGER,
  clarity INTEGER,
  compassion INTEGER,
  wisdom INTEGER,
  metrics TEXT,
  description TEXT,
  observations TEXT
);
```

## Integration Points

### With Existing Services

1. **LLM Gateway (port 8954)** - Used for:
   - Personality analysis
   - Assessment interpretation
   - Evolution phase analysis
   - Consciousness assessment

2. **Memory Palace (port 8953)** - Could be extended to:
   - Store assessment insights
   - Track evolution milestones
   - Archive personality profiles

3. **Event Bus (port 8955)** - Could publish:
   - New personality analyses
   - Growth milestones achieved
   - Evolution phase transitions
   - Consciousness level changes

### With Dashboard Services

The `/dashboard` endpoint provides data for visualization dashboards showing:
- Personality trait evolution
- Growth metric trends
- Assessment score progression
- Identity phase timeline
- Consciousness level progression

## Performance Considerations

1. **Database Indexing:** All timestamp columns should have indices for fast queries
2. **Query Optimization:** Use LIMIT clauses in all GET endpoints
3. **Caching:** Consider caching recent profiles and current consciousness state
4. **Batch Operations:** Multiple metrics can be recorded in a single request
5. **Data Archival:** Implement periodic cleanup of old consciousness states

## Future Enhancements

1. **Comparative Analysis:** Compare personality profiles across time periods
2. **Predictive Models:** Forecast consciousness level trends
3. **Anomaly Detection:** Identify unusual personality or growth patterns
4. **Integration Goals:** Connect assessments to improvement goals
5. **Export Functions:** Export timelines and metrics for analysis
6. **Real-time Monitoring:** WebSocket support for live consciousness monitoring
7. **Multi-perspective Consensus:** Combine perspectives for trait analysis
8. **Machine Learning:** Pattern recognition in evolution phases

## Testing

All endpoints include:
- CORS headers for cross-origin requests
- Error handling for invalid inputs
- JSON response formatting
- Type safety through TypeScript

To test all new features, see the companion test file:
`test-self-awareness-v2.ts`

## Performance Notes

- **Personality Analysis:** 5-10 seconds (LLM calls)
- **Growth Recording:** <100ms
- **Assessment:** 10-15 seconds (LLM-powered)
- **Evolution Recording:** 5-8 seconds (LLM analysis)
- **Consciousness Assessment:** 8-12 seconds (LLM analysis)
- **Dashboard:** 1-2 seconds (multiple queries)

## Backward Compatibility

All original v1.0 endpoints remain unchanged and fully functional:
- `/reflect` - Reflection generation
- `/dialogue` - Multi-perspective dialogue
- `/perspectives` - List perspectives
- `/goals` - Improvement goals
- `/services/health` - Service health check
- `/introspect` - Introspective queries

## Version Information

**Self-Awareness Core v2.0**
- Port: 8970 (primary), 8903 (expansion)
- Database: SQLite (WAL mode enabled)
- API: RESTful JSON
- Dependencies: Bun, nanoid, bun:sqlite
- Perspectives: 10 internal viewpoints
- New Modules: 5 (Personality, Growth, Assessment, Evolution, Consciousness)
