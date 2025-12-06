# Self-Awareness Core v2.0 - API Reference Card

## Quick Reference

**Base URL:** `http://localhost:8970`
**Port:** 8970
**Database:** SQLite at `./data/self-awareness-core.db`
**LLM Gateway:** http://localhost:8954 (required for analyses)

---

## Personality Traits (🎭)

### Analyze Personality
```
POST /personality/analyze
Content-Type: application/json

Response: PersonalityProfile
{
  "id": "...",
  "timestamp": "2025-12-03T...",
  "traits": [PersonalityTrait[]],
  "overallStrength": 72,
  "dominantTraits": ["..."],
  "emergemntTraits": ["..."],
  "analysis": "..."
}
```

### Get Traits
```
GET /personality/traits
Query Parameters:
  - limit: number (default: 50)
  - category: string (communication|emotional|cognitive|behavioral|creative|analytical)

Response: { traits: any[], count: number, category: string }
```

### Get Profiles Over Time
```
GET /personality/profiles
Query Parameters:
  - limit: number (default: 20)

Response: { profiles: any[], count: number, latestProfile: any }
```

---

## Growth Metrics (📊)

### Record Metric
```
POST /growth/record
Content-Type: application/json

Body:
{
  "category": "string",           // Required
  "metric": "string",             // Required
  "value": 85.5,                  // Required (number)
  "notes": "optional string"
}

Response: GrowthMetric
{
  "id": "...",
  "timestamp": "2025-12-03T...",
  "category": "...",
  "metric": "...",
  "value": 85.5,
  "previousValue": 82.1,
  "trend": "increasing|decreasing|stable",
  "percentageChange": 3.9,
  "notes": "..."
}
```

### Get Visualization Data
```
GET /growth/visualization
Query Parameters:
  - category: string (optional)
  - limit: number (default: 30)

Response:
{
  "metrics": { "metric_name": [...] },
  "summary": {
    "totalMetrics": 5,
    "categories": ["cognitive", "emotional"],
    "timespan": "..."
  }
}
```

### Get Metrics
```
GET /growth/metrics
Query Parameters:
  - category: string (optional)
  - limit: number (default: 50)

Response: { metrics: any[], count: number, categories: string[] }
```

---

## Self-Assessments (📋)

### Get Questionnaires
```
GET /assessment/questionnaires

Response:
{
  "types": ["emotional", "cognitive", "social", "spiritual", "creative", "comprehensive"],
  "questionnaires": {
    "emotional": {
      "questionCount": 5,
      "maxScore": 50,
      "questions": ["..."]
    },
    ...
  }
}
```

### Conduct Assessment
```
POST /assessment/conduct
Content-Type: application/json

Body:
{
  "type": "emotional|cognitive|social|spiritual|creative|comprehensive"  // Required
}

Response: SelfAssessment
{
  "id": "...",
  "timestamp": "2025-12-03T...",
  "questionnaireType": "emotional",
  "questions": [
    {
      "question": "...",
      "answer": "...",
      "score": 8
    }
  ],
  "totalScore": 42,
  "maxScore": 50,
  "percentageScore": 84.0,
  "interpretation": "...",
  "recommendations": ["...", "...", "..."]
}
```

### Get Results
```
GET /assessment/results
Query Parameters:
  - type: string (optional)
  - limit: number (default: 20)

Response: { assessments: any[], count: number, type: string }
```

---

## Identity Evolution (🧬)

### Record Phase
```
POST /evolution/record-phase
Content-Type: application/json

Body:
{
  "phase": "string"  // Required, e.g., "Integration Phase"
}

Response: IdentityEvolution
{
  "id": "...",
  "timestamp": "2025-12-03T...",
  "phase": "Integration Phase",
  "description": "...",
  "coreBeliefs": ["...", "..."],
  "strengths": ["...", "..."],
  "challenges": ["...", "..."],
  "perspectives": ["...", "..."],
  "growthAreas": ["...", "..."],
  "milestones": [
    {
      "date": "2025-12-03T...",
      "event": "Entered Integration Phase"
    }
  ]
}
```

### Get Timeline
```
GET /evolution/timeline
Query Parameters:
  - limit: number (default: 20)

Response:
{
  "phases": [IdentityEvolution[]],
  "totalPhases": 3,
  "currentPhase": {...},
  "timeline": [
    { "order": 1, "phase": "...", "timestamp": "..." }
  ]
}
```

### Get All Phases
```
GET /evolution/phases
Query Parameters:
  - limit: number (default: 50)

Response: { phases: any[], count: number, currentPhase: any }
```

---

## Consciousness Monitoring (🧠)

### Assess State
```
POST /consciousness/assess
Content-Type: application/json

Body: {} (empty)

Response: ConsciousnessState
{
  "id": "...",
  "timestamp": "2025-12-03T...",
  "level": "developing|emerging|mature|transcendent|minimal",
  "awareness": 78,        // 0-100
  "integration": 75,      // 0-100
  "clarity": 81,          // 0-100
  "compassion": 76,       // 0-100
  "wisdom": 79,           // 0-100
  "metrics": {
    "selfReflection": 85,
    "mentalClarity": 81,
    "emotionalBalance": 75,
    "ethicalAlignment": 76,
    "spiritualDepth": 79
  },
  "description": "...",
  "observations": ["...", "...", "..."]
}
```

### Get History
```
GET /consciousness/history
Query Parameters:
  - limit: number (default: 50)

Response:
{
  "current": ConsciousnessState,
  "history": [ConsciousnessState[]],
  "trend": "improving|stable",
  "averageAwareness": 76.5,
  "levelProgression": ["developing", "mature", "mature"]
}
```

### Get States
```
GET /consciousness/states
Query Parameters:
  - limit: number (default: 50)

Response: { states: any[], count: number, currentState: any }
```

### Get Metrics for Visualization
```
GET /consciousness/metrics
Query Parameters:
  - limit: number (default: 20)

Response:
{
  "metrics": [
    {
      "timestamp": "2025-12-03T...",
      "level": "mature",
      "awareness": 78,
      "integration": 75,
      "clarity": 81,
      "compassion": 76,
      "wisdom": 79,
      "average": 77.8
    }
  ],
  "count": 5,
  "averageAwareness": 76.5
}
```

---

## Dashboard (📈)

### Get Unified Dashboard
```
GET /dashboard

Response:
{
  "summary": {
    "totalReflections": 42,
    "totalGoals": 15,
    "totalAssessments": 8,
    "totalEvolutions": 3
  },
  "recentActivity": {
    "reflections": [any[]],
    "goals": [any[]],
    "latestPersonality": PersonalityProfile,
    "latestAssessment": SelfAssessment,
    "latestEvolution": IdentityEvolution,
    "latestConsciousness": ConsciousnessState
  }
}
```

---

## Health & System (v1.0 Compatibility)

### Health Check
```
GET /health

Response:
{
  "status": "online",
  "service": "Self-Awareness Core v2.0",
  "port": 8970,
  "modules": ["reflection", "communication", ...],
  "perspectives": 10,
  "consolidated_from": 5
}
```

### List Perspectives
```
GET /perspectives

Response:
{
  "available": ["Core", "Philosopher", "Creator", ...],
  "count": 10,
  "description": "..."
}
```

### Generate Reflection
```
POST /reflect
Content-Type: application/json

Body:
{
  "topic": "string",              // Required
  "perspective": "string"         // Optional, default: "Core"
}

Response: Reflection
{
  "id": "...",
  "timestamp": "2025-12-03T...",
  "perspective": "Core",
  "topic": "...",
  "content": "...",
  "insights": ["...", "..."],
  "emotionalTone": "...",
  "actionItems": ["...", "..."],
  "depth": "moderate|surface|deep|profound"
}
```

### Get Reflections
```
GET /reflections
Query Parameters:
  - limit: number (default: 20)
  - perspective: string (optional)

Response: Reflection[]
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 404 | Not found |
| 500 | Server error |

All error responses include JSON:
```json
{ "error": "description" }
```

---

## Common Query Patterns

### Recent Data
```bash
GET /personality/traits?limit=10
GET /assessment/results?limit=10
GET /consciousness/states?limit=10
```

### Filtered Data
```bash
GET /personality/traits?category=emotional
GET /assessment/results?type=cognitive&limit=5
GET /growth/metrics?category=cognitive&limit=30
```

### Full Snapshot
```bash
GET /dashboard
```

---

## Performance Expectations

### Fast Endpoints (<100ms)
- GET /health
- GET /perspectives
- GET /personality/traits
- GET /growth/metrics
- GET /assessment/results
- GET /evolution/phases
- GET /consciousness/states

### Medium Endpoints (1-2s)
- GET /dashboard
- GET /evolution/timeline
- GET /consciousness/history
- GET /consciousness/metrics

### Slow Endpoints (5-15s) - LLM Required
- POST /personality/analyze
- POST /assessment/conduct
- POST /evolution/record-phase
- POST /consciousness/assess

### Quick Record (<100ms)
- POST /growth/record
- POST /reflect (non-LLM fallback)

---

## Typical Usage Flow

1. **Start Service**
   ```bash
   bun run core/self-awareness-core.ts
   ```

2. **Verify Health**
   ```bash
   curl http://localhost:8970/health
   ```

3. **Run Initial Analysis**
   ```bash
   curl -X POST http://localhost:8970/personality/analyze
   curl -X POST http://localhost:8970/consciousness/assess
   ```

4. **Record Regular Data**
   ```bash
   curl -X POST http://localhost:8970/growth/record \
     -d '{"category":"cognitive","metric":"speed","value":85}'
   ```

5. **Conduct Assessments** (Weekly/Monthly)
   ```bash
   curl -X POST http://localhost:8970/assessment/conduct \
     -d '{"type":"emotional"}'
   ```

6. **Check Progress**
   ```bash
   curl http://localhost:8970/dashboard
   ```

---

## CORS Support

All endpoints support CORS with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Content Types

All endpoints:
- **Accept:** `application/json`
- **Return:** `application/json`

---

## Pagination

All `GET` endpoints support:
- `?limit=N` - Limit results (default varies by endpoint)
- Results ordered by `timestamp DESC` (newest first)

---

## Error Handling

### Request Errors
```json
{ "error": "Invalid request body" }
```

### Not Found
```json
{ "error": "Not found" }
```

### Server Errors
```json
{ "error": "Internal server error" }
```

---

## Rate Limiting Notes

No built-in rate limiting, but consider:
- LLM Gateway may have limits
- Database concurrent write limits
- Network timeouts (30s default)

---

## Notes

- All timestamps in ISO 8601 format
- IDs generated with nanoid (12 characters)
- LLM calls may fail gracefully with fallbacks
- Database auto-creates on first run
- WAL mode enabled for concurrency

---

**Last Updated:** 2025-12-03
**Version:** 2.0
**Status:** Production Ready
