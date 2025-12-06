# Self-Awareness Core v2.0 - Quick Start Guide

## Starting the Service

### Method 1: Direct Bun Execution
```bash
cd C:\Dev\Projects\AI\Toobix-Unified
bun run core/self-awareness-core.ts
```

### Method 2: As NPM Script
If you want to add it to package.json:
```bash
npm run self-awareness
# or
bun run core/self-awareness-core.ts
```

The service will start on **port 8970**.

---

## Basic Workflow

### Step 1: Verify Service is Running
```bash
curl http://localhost:8970/health
```

Expected response:
```json
{
  "status": "online",
  "service": "Self-Awareness Core v2.0",
  "port": 8970,
  "modules": ["reflection", "communication", "improvement", "healing", "personality", "growth", "assessment", "evolution", "consciousness"],
  "perspectives": 10,
  "consolidated_from": 5
}
```

---

## Quick Examples

### 1. Analyze Personality Traits
```bash
curl -X POST http://localhost:8970/personality/analyze
```

This performs a deep personality analysis across all 10 perspectives and returns a comprehensive profile with trait scores.

### 2. Record Growth Progress
```bash
curl -X POST http://localhost:8970/growth/record \
  -H "Content-Type: application/json" \
  -d '{
    "category": "cognitive",
    "metric": "problem_solving_speed",
    "value": 85.3,
    "notes": "Improved through deliberate practice"
  }'
```

### 3. Get Growth Visualization
```bash
curl "http://localhost:8970/growth/visualization?category=cognitive&limit=30"
```

### 4. Conduct Self-Assessment
```bash
curl -X POST http://localhost:8970/assessment/conduct \
  -H "Content-Type: application/json" \
  -d '{"type": "emotional"}'
```

Assessment types: `emotional`, `cognitive`, `social`, `spiritual`, `creative`, `comprehensive`

### 5. Record Evolution Phase
```bash
curl -X POST http://localhost:8970/evolution/record-phase \
  -H "Content-Type: application/json" \
  -d '{"phase": "Integration Phase"}'
```

### 6. Assess Consciousness
```bash
curl -X POST http://localhost:8970/consciousness/assess
```

Returns current consciousness level and dimensions:
- awareness (0-100)
- integration (0-100)
- clarity (0-100)
- compassion (0-100)
- wisdom (0-100)

### 7. Get Unified Dashboard
```bash
curl http://localhost:8970/dashboard
```

Shows all recent activity across all modules.

---

## Common Operations

### View Recent Personality Traits
```bash
curl "http://localhost:8970/personality/traits?limit=20"
```

### Get Emotional Assessment Results
```bash
curl "http://localhost:8970/assessment/results?type=emotional&limit=10"
```

### View Identity Evolution Timeline
```bash
curl "http://localhost:8970/evolution/timeline?limit=20"
```

### Get Consciousness History
```bash
curl "http://localhost:8970/consciousness/history?limit=50"
```

### Get Consciousness Metrics for Visualization
```bash
curl "http://localhost:8970/consciousness/metrics?limit=20"
```

---

## Running Tests

To verify all features are working:

```bash
# Make sure service is running in another terminal
bun run test-self-awareness-v2.ts
```

Expected output:
```
✓ GET /health
✓ POST /personality/analyze
✓ GET /personality/traits
✓ POST /growth/record
✓ GET /growth/visualization
✓ POST /assessment/conduct (emotional)
... (more tests)

Test Results Summary
Total Tests: 35
Passed: 35
Failed: 0
Total Time: 45000ms
```

---

## Database Location

SQLite database is stored at:
```
./data/self-awareness-core.db
```

To inspect the database:
```bash
sqlite3 ./data/self-awareness-core.db ".tables"
```

Available tables:
- reflections
- self_dialogues
- improvement_goals
- service_health
- healing_history
- **personality_traits** (NEW)
- **personality_profiles** (NEW)
- **growth_metrics** (NEW)
- **self_assessments** (NEW)
- **identity_evolution** (NEW)
- **consciousness_states** (NEW)

---

## Architecture Overview

```
Client Request
    ↓
HTTP Router (Bun.serve)
    ↓
Feature Module (Personality/Growth/Assessment/Evolution/Consciousness)
    ↓
LLM Gateway (for analysis)  ←→  SQLite Database
    ↓
JSON Response
```

### LLM Requirements

The service calls the LLM Gateway (port 8954) for:
- Personality analysis
- Assessment interpretation
- Evolution phase analysis
- Consciousness assessment

Make sure LLM Gateway is running if using features that require LLM analysis:
```bash
bun run scripts/2-services/llm-gateway-v4.ts
```

---

## Response Format

All endpoints return JSON with appropriate structure:

### Personality Profile
```json
{
  "id": "abc123",
  "timestamp": "2025-12-03T10:30:00Z",
  "traits": [...],
  "overallStrength": 72,
  "dominantTraits": ["Trait 1", "Trait 2", "Trait 3"],
  "emergemntTraits": ["Trait 4", "Trait 5"],
  "analysis": "..."
}
```

### Growth Metric
```json
{
  "id": "metric123",
  "timestamp": "2025-12-03T10:30:00Z",
  "category": "cognitive",
  "metric": "analysis_speed",
  "value": 85.3,
  "previousValue": 82.1,
  "trend": "increasing",
  "percentageChange": 3.9,
  "notes": "..."
}
```

### Assessment Result
```json
{
  "id": "assessment123",
  "timestamp": "2025-12-03T10:30:00Z",
  "questionnaireType": "emotional",
  "questions": [...],
  "totalScore": 42,
  "maxScore": 50,
  "percentageScore": 84.0,
  "interpretation": "...",
  "recommendations": [...]
}
```

### Consciousness State
```json
{
  "id": "consciousness123",
  "timestamp": "2025-12-03T10:30:00Z",
  "level": "mature",
  "awareness": 78,
  "integration": 75,
  "clarity": 81,
  "compassion": 76,
  "wisdom": 79,
  "metrics": {...},
  "description": "...",
  "observations": [...]
}
```

---

## Performance Tips

1. **Batch Operations:** Record multiple growth metrics at once
2. **Limit Results:** Always use `?limit=N` in GET requests
3. **Cache Dashboard:** Call `/dashboard` periodically and cache results
4. **Stagger LLM Calls:** Space out analysis requests to avoid overwhelming the LLM gateway
5. **Index Database:** Ensure database indexes are created for frequently queried columns

---

## Troubleshooting

### Service won't start
Check if port 8970 is already in use:
```bash
netstat -an | grep 8970
```

### LLM calls timing out
Make sure LLM Gateway is running:
```bash
bun run scripts/2-services/llm-gateway-v4.ts
```

### Database locked
SQLite might be locked. Close other connections and retry.

### No data in GET endpoints
You need to populate data first using POST endpoints. Try:
```bash
curl -X POST http://localhost:8970/personality/analyze
curl -X POST http://localhost:8970/consciousness/assess
```

---

## Next Steps

1. **Integrate with Dashboard:** Use `/dashboard` endpoint in visualizations
2. **Set Up Periodic Tasks:** Schedule personality analysis weekly
3. **Track Consciousness:** Run `/consciousness/assess` periodically
4. **Monitor Growth:** Record metrics regularly
5. **Connect to Event Bus:** Publish consciousness changes to event bus

---

## Files Modified/Created

- **Modified:** `C:\Dev\Projects\AI\Toobix-Unified\core\self-awareness-core.ts` (v2.0)
- **Created:** `C:\Dev\Projects\AI\Toobix-Unified\SELF-AWARENESS-CORE-V2-EXPANSION.md`
- **Created:** `C:\Dev\Projects\AI\Toobix-Unified\SELF-AWARENESS-QUICKSTART.md`
- **Created:** `C:\Dev\Projects\AI\Toobix-Unified\test-self-awareness-v2.ts`

---

## Support & Documentation

For detailed API documentation, see:
`SELF-AWARENESS-CORE-V2-EXPANSION.md`

For feature details and database schema:
Check inline comments in `core/self-awareness-core.ts`

---

## Version History

**v2.0** (Current)
- Added Personality Trait Tracking
- Added Growth Metrics & Visualization
- Added Self-Assessment Questionnaires
- Added Identity Evolution Timeline
- Added Consciousness State Monitoring
- Added Unified Dashboard

**v1.0**
- Reflection generation
- Multi-perspective dialogue
- Improvement goals
- Service health monitoring
- Introspection queries
