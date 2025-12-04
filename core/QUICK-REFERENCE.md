# Emotional Core v2.0 - Quick Reference

## Service Info
- **Port:** 8901
- **Database:** `./data/emotional-core.db`
- **Status Endpoint:** `GET /health`

## Core Endpoints at a Glance

### Mood Tracking
```bash
# Log a mood entry
POST /mood/log
{ "userId": "u1", "mood": 7, "emotion": "joy", "triggers": ["good news"] }

# Get mood history
GET /mood/history?userId=u1&days=30
```

### Pattern Analysis
```bash
# Analyze patterns
POST /patterns/analyze
{ "userId": "u1" }

# Get detected insights
GET /patterns/insights?userId=u1&limit=10
```

### Wellbeing Score
```bash
# Calculate score
GET /wellbeing/score?userId=u1

# Get score history
GET /wellbeing/score/history?userId=u1&limit=10
```

### Visualization
```bash
# Generate visualization
GET /visualization/history?userId=u1&timeframe=month

# Get cached visualization
GET /visualization/cache?userId=u1&timeframe=month
```

### Dashboard
```bash
# Get everything at once
GET /dashboard?userId=u1
```

## Response Format Examples

### Mood Entry Response
```json
{
  "success": true,
  "entry": {
    "id": "xyz123",
    "userId": "u1",
    "mood": 7,
    "emotion": "joy",
    "intensity": "moderate",
    "triggers": ["good news"],
    "timestamp": "2025-12-03T10:30:00.000Z"
  }
}
```

### Wellbeing Score Response
```json
{
  "userId": "u1",
  "score": {
    "overallScore": 72.5,
    "emotionalBalance": 70,
    "stressLevel": 35,
    "resilience": 85,
    "emotionalAwareness": 80,
    "supportNetwork": 60,
    "selfCare": 70
  },
  "trends": {
    "weekTrend": "improving",
    "monthTrend": "stable"
  }
}
```

### Visualization Response
```json
{
  "id": "viz123",
  "userId": "u1",
  "timeframe": "month",
  "moodTimeline": [
    { "date": "2025-12-01", "value": 6, "emotion": "neutral" },
    { "date": "2025-12-02", "value": 7, "emotion": "joy" }
  ],
  "emotionDistribution": [
    { "emotion": "joy", "percentage": 45 },
    { "emotion": "neutral", "percentage": 30 }
  ],
  "topTriggers": [
    { "trigger": "exercise", "frequency": 5 },
    { "trigger": "good news", "frequency": 3 }
  ]
}
```

## Emotion Categories
```
joy, sadness, anger, fear, surprise, disgust, trust,
anticipation, love, peace, anxiety, loneliness,
overwhelm, gratitude, hope
```

## Intensity Levels
```
subtle, mild, moderate, strong, intense
```

## Database Tables
```
emotion_entries       → Original emotion logs
mood_entries          → Detailed mood tracking
emotional_insights    → Detected patterns
wellbeing_scores      → Wellbeing metrics
visualization_cache   → Cached visualizations
emotional_bonds       → Perspective connections
coping_strategies     → Intervention suggestions
support_sessions      → Chat histories
wellbeing_goals       → User goals
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `logMoodEntry()` | Save mood with context |
| `getMoodHistory()` | Retrieve mood timeline |
| `analyzeEmotionalPatterns()` | Detect patterns |
| `calculateWellbeingScore()` | Compute 7-dimension score |
| `generateVisualizationData()` | Create visualization |

## Integration Quick Links

| Service | Port | Use Case |
|---------|------|----------|
| LLM Gateway | 8954 | Emotion detection, suggestions |
| Memory Palace | 8953 | Store emotional events |
| Event Bus | 8955 | Emit pattern/score events |
| Unified Gateway | 8950 | Route /emotional/* requests |

## Common cURL Commands

```bash
# Log mood
curl -X POST http://localhost:8901/mood/log \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "mood": 8,
    "emotion": "joy",
    "triggers": ["exercise"],
    "sleepQuality": 9,
    "exerciseMinutes": 45
  }'

# Get dashboard
curl http://localhost:8901/dashboard?userId=alice

# Analyze patterns
curl -X POST http://localhost:8901/patterns/analyze \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice"}'

# Get wellbeing score
curl http://localhost:8901/wellbeing/score?userId=alice

# Generate visualization
curl "http://localhost:8901/visualization/history?userId=alice&timeframe=week"
```

## Calculation Formulas

**Emotional Balance** = avg_mood × 10

**Stress Level** = 100 - (positive_emotions% × 50 + avg_sleep × 5)

**Resilience** = recovery_rate × 100

**Emotional Awareness** = logging_days / 30 × 100

**Self-Care** = (exercise_frequency% × 50) + (avg_exercise_mins / 10)

**Support Network** = social_interactions% × 100

**Overall Score** = average of all 7 components

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 404 | Not found |
| 500 | Server error |

## Performance Tips

1. Use `?limit=N` to reduce result size
2. Cache visualizations with `GET /visualization/cache`
3. Filter by `userId` to avoid full table scans
4. Specify `days` parameter for large datasets
5. Use `timeframe=day` for recent data (faster)

## Troubleshooting

**Q: "Not enough data"**
A: Need 5+ mood entries for pattern analysis

**Q: Empty wellbeing score**
A: Default is 50 until mood data exists

**Q: 404 on visualization**
A: Cache miss - first request generates cache

**Q: Slow queries**
A: Run `VACUUM` or check database indexes

## Files to Review

1. `emotional-core.ts` - Main service (1,208 lines)
2. `EMOTIONAL-CORE-v2-FEATURES.md` - Full documentation
3. `EMOTIONAL-CORE-INTEGRATION-GUIDE.md` - Integration examples
4. `EMOTIONAL-CORE-v2-EXPANSION-SUMMARY.md` - Completion report

## Start Service

```bash
cd core
bun run emotional-core.ts
```

Output: Service running on http://localhost:8901

---

**Last Updated:** 2025-12-03
**Version:** 2.0
**Status:** Production Ready
