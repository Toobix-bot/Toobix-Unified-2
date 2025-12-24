# Emotional Core v2.0 - Enhanced Features Documentation

## Overview

The Emotional Core service has been expanded with powerful new features for comprehensive emotional intelligence and wellbeing tracking. The service now runs on **port 8901** and includes mood tracking, pattern analysis, wellbeing scoring, and emotion visualization capabilities.

## New Features

### 1. Mood Tracking API

Track detailed mood entries with contextual information about emotional states, activities, sleep, and exercise.

#### Endpoints

**POST /mood/log** - Log a detailed mood entry
```json
{
  "userId": "user123",
  "mood": 7,                          // 1-10 scale
  "emotion": "joy",                   // EmotionCategory
  "intensity": "moderate",            // subtle|mild|moderate|strong|intense
  "triggers": ["good news", "friend visit"],
  "activities": ["exercise", "meditation"],
  "sleepQuality": 8,                  // 1-10 (optional)
  "exerciseMinutes": 30,              // (optional)
  "socialInteraction": true,          // (optional)
  "notes": "Great day overall"        // (optional)
}
```

**GET /mood/history** - Retrieve mood history
```
GET /mood/history?userId=user123&days=30
```
Returns: Array of MoodEntry objects with mood timeline for specified period

### 2. Emotional Pattern Analysis

Automatically detect recurring emotional patterns from mood entries and provide AI-generated insights.

#### Endpoints

**POST /patterns/analyze** - Analyze emotional patterns
```json
{
  "userId": "user123"
}
```
Returns: List of detected emotional patterns with:
- Pattern name and description
- Frequency of occurrence
- Related emotions
- Suggested interventions

**GET /patterns/insights** - Get stored pattern insights
```
GET /patterns/insights?userId=user123&limit=10
```
Returns: Detailed emotional insights with personalized intervention suggestions

#### How It Works

1. Analyzes mood entries from the past 30 days
2. Identifies emotions that occur 15%+ of the time
3. Maps trigger-emotion relationships
4. Suggests coping strategies (database + AI-generated)
5. Stores insights in database for longitudinal tracking

### 3. Emotion History Visualization

Generate rich visualizations of emotional data across different timeframes.

#### Endpoints

**GET /visualization/history** - Generate emotion visualization
```
GET /visualization/history?userId=user123&timeframe=month
```
Timeframe options: `day`, `week`, `month`, `year`

Returns visualization data including:
- **Mood Timeline**: Historical mood values with dates and associated emotions
- **Emotion Distribution**: Percentage breakdown of emotions experienced
- **Emotion Transitions**: How frequently emotions change from one to another
- **Top Triggers**: Most common emotional triggers ranked by frequency
- **Pattern Insights**: Detected patterns relevant to the user

**GET /visualization/cache** - Get cached visualizations
```
GET /visualization/cache?userId=user123&timeframe=month
```
Returns: Previously generated visualization (optimized for performance)

### 4. Wellbeing Score Calculation

Comprehensive wellbeing assessment based on multiple dimensions of emotional health.

#### Endpoints

**GET /wellbeing/score** - Calculate wellbeing score
```
GET /wellbeing/score?userId=user123
```

Returns comprehensive score with these components:
- **Overall Score** (0-100): Composite wellbeing metric
- **Emotional Balance** (0-100): Average mood level
- **Stress Level** (0-100): Inverse measure of positive emotions + self-care
- **Resilience** (0-100): Ability to recover from negative emotional states
- **Emotional Awareness** (0-100): Consistency of mood logging (0-30 days)
- **Support Network** (0-100): Social interaction tracking
- **Self-Care** (0-100): Exercise and sleep quality

**Trends Analysis:**
- Weekly trend: improving | stable | declining
- Monthly trend: improving | stable | declining

**GET /wellbeing/score/history** - Score history tracking
```
GET /wellbeing/score/history?userId=user123&limit=10
```
Returns: Historical wellbeing scores for trend analysis

#### Calculation Details

| Component | Formula |
|-----------|---------|
| Emotional Balance | avg_mood * 10 |
| Stress Level | 100 - (positive_emotions% * 50 + avg_sleep * 5) |
| Resilience | recovery_rate * 100 |
| Emotional Awareness | unique_logging_days / 30 * 100 |
| Self-Care | (exercise_frequency% * 50) + (avg_exercise / 10) |
| Support Network | social_interactions% * 100 |
| Overall Score | average of all 7 components |

### 5. Enhanced Database Schema

Four new tables support the expanded functionality:

#### mood_entries
Detailed mood tracking with contextual data:
```sql
CREATE TABLE mood_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood_score INTEGER NOT NULL,
  emotion TEXT NOT NULL,
  intensity TEXT,
  triggers TEXT,              -- JSON array
  activities TEXT,            -- JSON array
  sleep_quality INTEGER,
  exercise_minutes INTEGER,
  social_interaction BOOLEAN,
  notes TEXT,
  timestamp TEXT
)
```

#### emotional_insights
Detected patterns and AI-generated insights:
```sql
CREATE TABLE emotional_insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  description TEXT,
  confidence REAL,
  related_emotions TEXT,      -- JSON array
  suggested_interventions TEXT, -- JSON array
  frequency REAL,
  last_updated TEXT
)
```

#### wellbeing_scores
Comprehensive wellbeing metrics tracking:
```sql
CREATE TABLE wellbeing_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  overall_score REAL,
  emotional_balance REAL,
  stress_level REAL,
  resilience REAL,
  emotional_awareness REAL,
  support_network REAL,
  self_care REAL,
  week_trend TEXT,
  month_trend TEXT,
  last_calculated TEXT
)
```

#### visualization_cache
Cached visualization data for performance:
```sql
CREATE TABLE visualization_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  mood_timeline TEXT,        -- JSON array
  emotion_distribution TEXT, -- JSON array
  emotion_transitions TEXT,  -- JSON array
  top_triggers TEXT,         -- JSON array
  pattern_insights TEXT,     -- JSON array
  generated_at TEXT
)
```

#### Indexes for Performance
```sql
CREATE INDEX idx_mood_entries_user_timestamp ON mood_entries(user_id, timestamp);
CREATE INDEX idx_emotion_entries_user_timestamp ON emotion_entries(user_id, timestamp);
CREATE INDEX idx_insights_user ON emotional_insights(user_id);
CREATE INDEX idx_visualization_user_timeframe ON visualization_cache(user_id, timeframe);
```

## API Usage Examples

### Example 1: Track Daily Mood

```bash
curl -X POST http://localhost:8901/mood/log \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "mood": 8,
    "emotion": "joy",
    "intensity": "strong",
    "triggers": ["completed project", "positive feedback"],
    "activities": ["exercise", "meditation"],
    "sleepQuality": 9,
    "exerciseMinutes": 45,
    "socialInteraction": true,
    "notes": "Productive day, feeling accomplished"
  }'
```

### Example 2: Analyze Patterns

```bash
curl -X POST http://localhost:8901/patterns/analyze \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice"}'
```

### Example 3: Get Wellbeing Dashboard

```bash
curl http://localhost:8901/dashboard?userId=alice
```

Response includes:
- Current wellbeing score with all components
- Recent mood history (7-day average)
- Top detected patterns with interventions
- Weekly emotion visualization

### Example 4: Visualization Timeline

```bash
curl "http://localhost:8901/visualization/history?userId=alice&timeframe=month"
```

## Integration with Existing Services

### LLM Integration
The service uses the existing LLM Gateway (port 8954) for:
- Emotion detection from text
- Poetry generation
- Personalized intervention suggestions
- Pattern-based coaching tips

### Memory Palace Integration
Can be extended to:
- Store significant emotional events
- Link emotions to memories
- Track emotional growth over time

### Event Bus Integration
Can emit events for:
- Pattern detection notifications
- Wellbeing score changes
- Emotional milestone achievements

## Feature Highlights

1. **Context-Aware Tracking**: Logs mood alongside sleep, exercise, and social interaction
2. **AI-Powered Insights**: Machine learning detects patterns and provides interventions
3. **Multi-Dimensional Assessment**: 7-component wellbeing score
4. **Trend Analysis**: Weekly and monthly trend tracking
5. **Performance Optimized**: Visualization caching for fast access
6. **Scalable Architecture**: Indexed queries for large datasets

## Database Integrity

- Uses SQLite WAL (Write-Ahead Logging) mode for reliability
- Unique constraint on user_id in wellbeing_scores (one score per user)
- ON CONFLICT strategies for safe updates
- Timezone-aware timestamp handling (ISO 8601 format)

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200**: Successful operation
- **400**: Invalid request parameters
- **404**: Resource not found
- **500**: Server error with descriptive message

## Future Enhancement Opportunities

1. **Collaborative Insights**: Share pattern insights between users
2. **Goal Tracking**: Link wellbeing scores to specific goals
3. **Predictive Analytics**: Forecast emotional patterns
4. **Family/Group Profiles**: Track emotional health of groups
5. **Mobile Push Notifications**: Intervention suggestions
6. **Export Functionality**: PDF reports and data exports
7. **ML Model Training**: Personalized pattern detection

## File Location

Main service file: `/core/emotional-core.ts`
Port: `8901`
Database: `./data/emotional-core.db`
