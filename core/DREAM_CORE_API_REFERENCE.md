# Dream Core v2.0 - API Reference

## Base URL
`http://localhost:8961`

## Core Dream Endpoints

### Record Dream
**POST** `/dream`

Record a new dream entry with automatic symbol analysis and categorization.

**Request:**
```json
{
  "theme": "Flying Over Mountains",
  "narrative": "I was soaring through...",
  "emotions": ["joy", "freedom", "exhilaration"],
  "lucidity": 85,
  "clarity": 75,
  "sleepCycle": "REM",
  "type": "lucid",
  "category": "lucid",
  "sleepQuality": 80,
  "duration": 45,
  "tags": ["flying", "freedom"],
  "symbols": [] // auto-analyzed if empty
}
```

**Response:**
```json
{
  "id": "abc123",
  "recorded": true,
  "category": "lucid",
  "automated": true
}
```

---

### Get Dreams
**GET** `/dreams?limit=20&offset=0`

Retrieve dream history with pagination.

**Parameters:**
- `limit` (default: 20) - Number of dreams to return
- `offset` (default: 0) - Pagination offset

**Response:**
```json
[
  {
    "id": "abc123",
    "timestamp": "2025-12-03T10:30:00Z",
    "theme": "Flying Over Mountains",
    "narrative": "...",
    "category": "lucid",
    "lucidity": 85,
    ...
  }
]
```

---

### Get Single Dream
**GET** `/dreams/:id`

Retrieve detailed information for a specific dream.

---

## Dream Categories

### Get Category Breakdown
**GET** `/categories`

Get summary of all dream categories.

**Response:**
```json
{
  "categories": [
    { "category": "lucid", "count": 5 },
    { "category": "nightmare", "count": 2 },
    ...
  ],
  "breakdown": {
    "lucid": 5,
    "nightmare": 2,
    "recurring": 3,
    "symbolic": 8,
    "everyday": 12
  }
}
```

---

### Get Dreams by Category
**GET** `/dreams/category/{category}?limit=20`

Get all dreams of a specific category.

**Valid categories:**
- `lucid`
- `nightmare`
- `recurring`
- `symbolic`
- `everyday`

**Response:**
```json
{
  "category": "lucid",
  "dreams": [...],
  "count": 5
}
```

---

## Symbol Dictionary

### Get All Symbols
**GET** `/symbols?limit=50`

Get the complete dream symbol dictionary.

**Response:**
```json
[
  {
    "id": "sym_0",
    "symbol": "water",
    "archetype": "emotions",
    "jungian_meaning": "Unbewusstes, Gefühle, Reinigung",
    "freudian_meaning": "Mutterarchetyp, Geburt",
    "personal_meaning": null,
    "frequency": 42,
    "emotional_charge": 15,
    "color_association": "blue",
    "element_association": "water",
    "last_updated": "2025-12-03T10:30:00Z"
  }
]
```

---

### Get Symbol Details
**GET** `/symbols/{symbol}`

Get detailed information for a specific symbol.

**Response:**
```json
{
  "id": "sym_0",
  "symbol": "water",
  "archetype": "emotions",
  "jungian_meaning": "...",
  "freudian_meaning": "...",
  "frequency": 42,
  "emotional_charge": 15,
  "color_association": "blue",
  "element_association": "water"
}
```

---

### Add Custom Symbol
**POST** `/symbols/add`

Add or update a custom dream symbol.

**Request:**
```json
{
  "symbol": "phoenix",
  "archetype": "rebirth",
  "jungianMeaning": "Transformation and renewal",
  "freudianMeaning": "Resurrection of past self",
  "personalMeaning": "My personal rebirth journey",
  "colorAssociation": "red",
  "elementAssociation": "fire"
}
```

**Response:**
```json
{
  "id": "sym_custom_1",
  "created": true
}
```

---

### Search Symbols
**GET** `/symbols/search?q=fire&limit=20`

Search symbols by name or archetype.

**Parameters:**
- `q` (required) - Search query
- `limit` (default: 20) - Results limit

**Response:**
```json
{
  "query": "fire",
  "results": [
    { "symbol": "fire", ... },
    { "symbol": "burning", ... }
  ],
  "count": 2
}
```

---

## Sleep Cycle Tracking

### Record Sleep Cycle
**POST** `/sleep-cycle`

Track a sleep cycle with quality metrics.

**Request:**
```json
{
  "dreamId": "abc123",
  "cycleType": "REM",
  "startTime": "2025-12-03T22:30:00Z",
  "duration": 90,
  "quality": 75,
  "heartRate": 62,
  "movements": 12,
  "notes": "Good REM sleep, vivid dreams"
}
```

**Response:**
```json
{
  "id": "sleep_123",
  "recorded": true
}
```

---

### Get Sleep Cycles
**GET** `/sleep-cycles?limit=50`

Get sleep cycle history with summary statistics.

**Response:**
```json
{
  "cycles": [
    {
      "id": "sleep_123",
      "dream_id": "abc123",
      "cycle_type": "REM",
      "start_time": "2025-12-03T22:30:00Z",
      "duration": 90,
      "quality": 75,
      "heart_rate": 62,
      "movements": 12,
      "notes": "..."
    }
  ],
  "summary": {
    "totalCycles": 150,
    "averageQuality": 72,
    "distribution": [
      { "cycle_type": "REM", "count": 60 },
      { "cycle_type": "DEEP", "count": 50 },
      { "cycle_type": "LIGHT", "count": 40 }
    ]
  }
}
```

---

## Analysis & Insights

### Analyze Dream
**POST** `/analyze`

Analyze a dream's symbols and generate interpretation.

**Request:**
```json
{
  "narrative": "I was flying over mountains...",
  "theme": "Flight"
}
```

**Response:**
```json
{
  "symbols": [
    { "symbol": "flying", "archetype": "freedom", "emotionalCharge": 75 },
    { "symbol": "mountain", "archetype": "obstacles", "emotionalCharge": 20 }
  ],
  "interpretation": "Your dream suggests a desire for freedom...",
  "timestamp": "2025-12-03T10:30:00Z"
}
```

---

### Get Pattern Analysis
**GET** `/analysis/patterns?timeframe=month`

Advanced pattern analysis with recommendations.

**Parameters:**
- `timeframe` (default: month) - Analysis period: `week`, `month`, `year`, `all`

**Response:**
```json
{
  "timeframe": "month",
  "totalDreams": 20,
  "patterns": [
    {
      "id": "pat_1",
      "name": "Flying Theme",
      "symbols": ["flying", "sky", "freedom"],
      "frequency": 8,
      "interpretation": "Desire for freedom and escape",
      "lastOccurred": "2025-12-03T10:30:00Z",
      "trendDirection": "increasing"
    }
  ],
  "mostCommonCategory": "lucid",
  "averageLucidity": 65,
  "averageClarity": 72,
  "emotionFrequency": {
    "joy": 15,
    "fear": 5,
    "peace": 12
  },
  "symbolFrequency": {
    "flying": 8,
    "water": 6,
    "house": 4
  },
  "sleepQualityTrend": [68, 72, 75],
  "recommendations": [
    "Your lucid dreaming ability is strong, try advanced techniques",
    "You have 5 recurring dream patterns. Explore their meanings."
  ]
}
```

---

### Get Sleep Quality Analysis
**GET** `/analysis/sleep-quality?timeframe=month`

Analyze sleep quality trends over time.

**Parameters:**
- `timeframe` (default: month) - Period: `week`, `month`, `year`

**Response:**
```json
{
  "timeframe": "month",
  "averageQuality": 72,
  "trend": [65, 68, 70, 72, 75, 77],
  "dataPoints": 6
}
```

---

### Get Statistics
**GET** `/stats`

Overall dream statistics and summary.

**Response:**
```json
{
  "totalDreams": 150,
  "typeDistribution": [
    { "type": "passive", "count": 80 },
    { "type": "lucid", "count": 35 },
    { "type": "problem_solving", "count": 20 },
    { "type": "creative", "count": 15 }
  ],
  "topSymbols": [
    { "symbol": "water", "frequency": 45, ... },
    { "symbol": "flying", "frequency": 42, ... }
  ],
  "averageLucidity": 58
}
```

---

## Export & Sharing

### Create Export
**POST** `/export`

Create an exportable snapshot of dreams.

**Request:**
```json
{
  "format": "markdown",
  "timeframe": "month",
  "dreamIds": ["abc123", "def456"],
  "includeSymbols": true,
  "includePatterns": true,
  "includeAnalysis": true
}
```

**Parameters:**
- `format` - Export format: `json`, `markdown`, `csv`
- `timeframe` (optional) - `week`, `month`, `year`, `all` (overridden by dreamIds)
- `dreamIds` (optional) - Specific dream IDs to export
- `includeSymbols` - Include symbol dictionary
- `includePatterns` - Include pattern analysis
- `includeAnalysis` - Include recommendations

**Response:**
```json
{
  "exportId": "exp_123",
  "format": "markdown",
  "accessToken": "token_xyz789",
  "dreamsIncluded": 2,
  "preview": "# Dream Journal Export\n\nGenerated: 2025-12-03T10:30:00Z\n..."
}
```

---

### Download Export
**GET** `/export/{exportId}?token={accessToken}`

Download the exported dream data.

**Parameters:**
- `exportId` (path) - Export ID from creation
- `token` (query) - Access token

**Returns:** File in requested format
- JSON: `application/json`
- Markdown: `text/markdown` (*.md)
- CSV: `text/csv` (*.csv)

---

### Share Dream
**POST** `/dreams/share`

Share a dream with other users.

**Request:**
```json
{
  "dreamId": "abc123",
  "sharedWith": ["user_1", "user_2", "user_3"]
}
```

**Response:**
```json
{
  "dreamId": "abc123",
  "sharedWith": ["user_1", "user_2", "user_3"],
  "success": true
}
```

---

## Active Dreaming

### Start Dream Session
**POST** `/active/start`

Begin an active dreaming session for problem-solving or creativity.

**Request:**
```json
{
  "purpose": "Solve design problem",
  "problem": "How to improve user onboarding?"
}
```

**Response:**
```json
{
  "sessionId": "sess_123",
  "status": "incubating",
  "message": "Dream incubation started. Call /active/dream when ready."
}
```

---

### Generate Active Dream
**POST** `/active/dream`

Generate an active dream based on the session.

**Request:**
```json
{
  "sessionId": "sess_123"
}
```

**Response:**
```json
{
  "dream": {
    "id": "abc123",
    "timestamp": "2025-12-03T10:30:00Z",
    "theme": "Solve design problem",
    "narrative": "I found myself in a digital space...",
    "lucidity": 85,
    "clarity": 70,
    "type": "problem_solving",
    "category": "lucid",
    "symbols": [...],
    "problemSolved": "How to improve user onboarding?"
  },
  "visualization": "ASCII dream visualization"
}
```

---

## System Endpoints

### Health Check
**GET** `/health`

Check service status and statistics.

**Response:**
```json
{
  "status": "online",
  "service": "Dream Core v2.0",
  "port": 8961,
  "modules": ["journal", "analysis", "lucid", "active", "integration", "sleep", "symbols", "sharing"],
  "totalDreams": 150,
  "activeSessions": 2,
  "consolidated_from": 4
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request
- `403` - Forbidden/Invalid token
- `404` - Not found
- `500` - Server error

---

## Rate Limiting

No rate limiting is currently implemented. Future versions may include:
- Request throttling
- API key authentication
- Usage quotas

---

## CORS

All endpoints support CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Data Types

### Dream Object
```typescript
{
  id: string
  timestamp: Date
  theme: string
  narrative: string
  category: "lucid" | "nightmare" | "recurring" | "symbolic" | "everyday"
  type: "passive" | "problem_solving" | "creative" | ...
  symbols: DreamSymbol[]
  emotions: string[]
  sleepCycle: "REM" | "DEEP" | "LIGHT" | "UNKNOWN"
  lucidity: 0-100
  clarity: 0-100
  sleepQuality?: 0-100
  duration?: number (minutes)
  tags?: string[]
  sharedWith?: string[]
  insights?: string[]
  problemSolved?: string
  creativeOutput?: string
}
```

### DreamSymbol Object
```typescript
{
  symbol: string
  archetype?: string
  jungianMeaning?: string
  freudianMeaning?: string
  personalMeaning?: string
  frequency: number
  emotionalCharge: -100 to +100
  colorAssociation?: string
  elementAssociation?: string
}
```

### SleepCycleData Object
```typescript
{
  id: string
  dreamId?: string
  cycleType: "REM" | "DEEP" | "LIGHT" | "UNKNOWN"
  startTime: Date
  duration: number (minutes)
  quality: 0-100
  heartRate?: number
  movements?: number
  notes?: string
}
```
