# Dream Core v2.0 - Enhanced Features

## Overview

Dream Core v2.0 expands the existing Dream Core service with comprehensive new features for advanced dream tracking, analysis, and sharing.

**Port:** 8961
**Database:** SQLite (`./data/dream-core.db`)

## New Features

### 1. Dream Journal with Categories

Dreams are now automatically or manually categorized into:

- **Lucid** - Highly conscious dreams (lucidity > 70%)
- **Nightmare** - Dreams with negative emotional content
- **Recurring** - Dreams that repeat over time
- **Symbolic** - Dreams rich in symbols and archetypes
- **Everyday** - Regular dreams

#### Category Endpoints

```
GET /categories
  Returns category breakdown with counts

GET /dreams/category/{category}?limit=20
  Get all dreams in a specific category
  Parameters: limit (default 20)
```

#### Auto-Categorization

The `/dream` POST endpoint now automatically categorizes dreams based on:
- Lucidity level
- Narrative content (keywords like "nightmare", "horror")
- Symbol analysis (emotional charge)
- Frequency analysis (recurring patterns)

### 2. Enhanced Dream Symbol Dictionary

The symbol dictionary has been expanded with psychological frameworks:

#### Symbol Metadata
- **Jungian Meaning** - Jungian interpretation
- **Freudian Meaning** - Freudian interpretation
- **Personal Meaning** - User-defined interpretation
- **Color Association** - Associated color
- **Element Association** - Associated element (fire, water, earth, air)

#### 15 Seeded Symbols
water, flying, falling, house, chase, death, snake, tree, road, mirror, fire, mountain, ocean, door, light

#### Symbol Dictionary Endpoints

```
GET /symbols
  Get full dictionary (ordered by frequency)

GET /symbols?limit=10
  Get paginated symbols

GET /symbols/:symbol
  Get details for specific symbol

POST /symbols/add
  Add or update custom symbol
  Body: {
    symbol: string
    archetype?: string
    jungianMeaning?: string
    freudianMeaning?: string
    personalMeaning?: string
    colorAssociation?: string
    elementAssociation?: string
  }

GET /symbols/search?q=emotion
  Search symbols by name or archetype
```

### 3. Sleep Cycle Tracking

Detailed tracking of sleep cycles and quality metrics.

#### Sleep Cycle Data
- **Cycle Type** - REM, DEEP, LIGHT, UNKNOWN
- **Start Time** - When the cycle began
- **Duration** - Length in minutes
- **Quality** - 0-100 rating
- **Heart Rate** - Optional biometric data
- **Movements** - Optional movement count
- **Notes** - Optional observations

#### Sleep Cycle Endpoints

```
POST /sleep-cycle
  Record a sleep cycle
  Body: {
    dreamId?: string
    cycleType: "REM" | "DEEP" | "LIGHT" | "UNKNOWN"
    startTime: Date
    duration: number (minutes)
    quality?: number (0-100)
    heartRate?: number
    movements?: number
    notes?: string
  }

GET /sleep-cycles?limit=50
  Get sleep cycle history
  Returns summary with:
    - Total cycles
    - Average quality
    - Distribution by type

GET /analysis/sleep-quality?timeframe=month
  Analyze sleep quality trends
  Parameters: timeframe (week|month|year|all)
  Returns: trend array, average quality
```

### 4. Advanced Pattern Recognition

Automatic detection and analysis of dream patterns over time.

#### Pattern Analysis Features
- Frequency tracking of symbols
- Emotion frequency analysis
- Category trends
- Lucidity trends
- Sleep quality correlation
- Personalized recommendations

#### Pattern Analysis Endpoints

```
GET /analysis/patterns?timeframe=month
  Advanced pattern analysis
  Parameters: timeframe (week|month|year|all)

  Returns: {
    timeframe: string
    totalDreams: number
    patterns: DreamPattern[]
    mostCommonCategory: DreamCategory
    averageLucidity: number
    averageClarity: number
    emotionFrequency: Record<string, number>
    symbolFrequency: Record<string, number>
    sleepQualityTrend: number[]
    recommendations: string[]
  }

GET /stats
  Overall statistics
  Returns: type distribution, top symbols, average lucidity

GET /patterns
  Get all recurring patterns (legacy)
```

### 5. Dream Export & Sharing

Export dreams in multiple formats and share with other users.

#### Export Formats
- **JSON** - Full data structure
- **Markdown** - Human-readable formatted text
- **CSV** - Spreadsheet-compatible format
- **PDF** - Future support (metadata prepared)

#### Export Options
- Include/exclude symbols dictionary
- Include/exclude pattern analysis
- Include/exclude recommendations
- Time-based filtering (week, month, year, all)
- Specific dream selection

#### Export Endpoints

```
POST /export
  Create dream export
  Body: {
    format: "json" | "markdown" | "csv"
    dreamIds?: string[] (specific dreams)
    timeframe?: "week" | "month" | "year" | "all"
    includeSymbols?: boolean (default true)
    includePatterns?: boolean (default true)
    includeAnalysis?: boolean (default true)
  }

  Returns: {
    exportId: string
    accessToken: string
    dreamsIncluded: number
    preview: string | object
  }

GET /export/:id?token={accessToken}
  Download export
  Parameters:
    - id: Export ID
    - token: Access token
  Returns: File in requested format

POST /dreams/share
  Share dream with users
  Body: {
    dreamId: string
    sharedWith: string[] (user IDs)
  }

  Returns: Updated sharing list
```

## Enhanced Dream Recording

The `/dream` POST endpoint now accepts:

```json
{
  "theme": string,
  "narrative": string,
  "emotions": string[],
  "sleepCycle": "REM" | "DEEP" | "LIGHT" | "UNKNOWN",
  "lucidity": number (0-100),
  "clarity": number (0-100),
  "type": "passive" | "problem_solving" | "creative" | "emotional_processing" | "memory_consolidation" | "predictive" | "exploratory" | "lucid",
  "category": "lucid" | "nightmare" | "recurring" | "symbolic" | "everyday",
  "symbols": DreamSymbol[],
  "insights": string[],
  "sleepQuality": number (0-100),
  "duration": number (minutes),
  "tags": string[],
  "sharedWith": string[]
}
```

## Database Schema

### New Tables

```sql
-- Sleep cycle tracking
CREATE TABLE sleep_cycles (
  id TEXT PRIMARY KEY,
  dream_id TEXT,
  cycle_type TEXT,
  start_time TEXT,
  duration INTEGER,
  quality INTEGER,
  heart_rate INTEGER,
  movements INTEGER,
  notes TEXT
);

-- Dream exports
CREATE TABLE dream_exports (
  id TEXT PRIMARY KEY,
  format TEXT,
  created_at TEXT,
  dream_ids TEXT,
  exported_by TEXT,
  include_symbols INTEGER,
  include_patterns INTEGER,
  include_analysis INTEGER,
  access_token TEXT,
  expires_at TEXT,
  password TEXT,
  file_path TEXT
);
```

### Enhanced Tables

**dreams** table additions:
- `category TEXT` - Dream category
- `sleep_quality INTEGER` - Sleep quality rating
- `duration INTEGER` - Dream duration
- `tags TEXT` - JSON array of tags
- `shared_with TEXT` - JSON array of user IDs

**dream_symbols** table additions:
- `freudian_meaning TEXT` - Freudian interpretation
- `color_association TEXT` - Color association
- `element_association TEXT` - Element association
- `last_updated TEXT` - Timestamp

### Indexes

- `idx_dreams_timestamp` - For time-based queries
- `idx_dreams_category` - For category filtering
- `idx_dreams_type` - For type filtering
- `idx_sleep_cycles_dream` - For dream-cycle linking
- `idx_patterns_frequency` - For pattern sorting

## Helper Functions

### Dream Categorization

```typescript
categorizeDream(narrative: string, lucidity: number, symbols: DreamSymbol[]): DreamCategory
```

Automatically categorizes a dream based on content and characteristics.

### Sleep Quality Tracking

```typescript
trackSleepQuality(sleepCycles: SleepCycleData[]): number
```

Calculates average quality from sleep cycles.

### Pattern Analysis

```typescript
generatePatternAnalysis(timeframe: 'week' | 'month' | 'year' | 'all'): PatternAnalysis
```

Generates comprehensive pattern analysis with:
- Symbol frequency
- Emotion frequency
- Category distribution
- Lucidity trends
- Recommendations

### Export Data Generation

```typescript
generateExportData(format: string, dreams: any[], includeSymbols: boolean, includePatterns: boolean, includeAnalysis: boolean): string
```

Generates export data in requested format (JSON, Markdown, CSV).

## Example Usage

### Record a Dream

```bash
curl -X POST http://localhost:8961/dream \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "Flying Over Mountains",
    "narrative": "I was flying freely...",
    "emotions": ["joy", "freedom"],
    "lucidity": 85,
    "clarity": 75,
    "sleepCycle": "REM",
    "type": "lucid",
    "sleepQuality": 80,
    "duration": 45,
    "tags": ["lucid", "flying"]
  }'
```

### Get Category Breakdown

```bash
curl http://localhost:8961/categories
```

### Search Symbols

```bash
curl "http://localhost:8961/symbols/search?q=water"
```

### Analyze Patterns

```bash
curl "http://localhost:8961/analysis/patterns?timeframe=month"
```

### Export Dreams

```bash
curl -X POST http://localhost:8961/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "markdown",
    "timeframe": "month",
    "includeAnalysis": true
  }'
```

### Download Export

```bash
curl "http://localhost:8961/export/{exportId}?token={accessToken}" > dreams.md
```

## Recommendations Engine

The pattern analysis automatically generates recommendations based on:

- **High nightmare frequency** (>30% of dreams): Nightmare management techniques
- **High lucidity** (>50% with lucidity >50%): Advanced lucid dreaming techniques
- **Multiple recurring patterns** (>5): Pattern exploration guidance
- **Low clarity** (<40% average): Dream recall improvement techniques

## Future Enhancements

- PDF export support
- Dream sharing with access controls
- Password-protected exports
- Integration with wearable devices for biometric data
- Machine learning pattern detection
- Multi-language support for dream interpretation
- Cloud backup and sync
- Mobile app integration

## Architecture Notes

- Fully typed TypeScript implementation
- Bun runtime with native SQLite
- RESTful API design
- CORS-enabled for cross-origin requests
- Prepared statements for SQL injection prevention
- Efficient indexed queries for large datasets
