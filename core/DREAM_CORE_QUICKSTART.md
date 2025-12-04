# Dream Core v2.0 - Quick Start Guide

## Starting the Service

```bash
bun core/dream-core.ts
```

The service will start on **port 8961** and initialize:
- SQLite database at `./data/dream-core.db`
- 15 pre-seeded dream symbols
- All database tables and indexes

## Basic Workflow

### 1. Record Your First Dream

```bash
curl -X POST http://localhost:8961/dream \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "Flying Adventure",
    "narrative": "I was soaring through clouds over mountains...",
    "emotions": ["joy", "freedom"],
    "lucidity": 75,
    "clarity": 70,
    "sleepCycle": "REM",
    "type": "lucid",
    "sleepQuality": 80,
    "duration": 40,
    "tags": ["flying", "adventure"]
  }'
```

**Response:**
```json
{
  "id": "dream_abc123",
  "recorded": true,
  "category": "lucid",
  "automated": true
}
```

### 2. View All Dreams

```bash
curl "http://localhost:8961/dreams?limit=5"
```

### 3. View Dreams by Category

```bash
# Get all lucid dreams
curl "http://localhost:8961/dreams/category/lucid"

# Get all nightmares
curl "http://localhost:8961/dreams/category/nightmare"
```

### 4. Track Sleep Quality

```bash
curl -X POST http://localhost:8961/sleep-cycle \
  -H "Content-Type: application/json" \
  -d '{
    "dreamId": "dream_abc123",
    "cycleType": "REM",
    "startTime": "2025-12-03T22:30:00Z",
    "duration": 90,
    "quality": 85,
    "heartRate": 62
  }'
```

### 5. Explore Symbol Dictionary

```bash
# Get all symbols
curl "http://localhost:8961/symbols"

# Get a specific symbol
curl "http://localhost:8961/symbols/water"

# Search for symbols
curl "http://localhost:8961/symbols/search?q=freedom"
```

### 6. Analyze Your Patterns

```bash
# Get patterns from the last month
curl "http://localhost:8961/analysis/patterns?timeframe=month"

# Get patterns from the last year
curl "http://localhost:8961/analysis/patterns?timeframe=year"
```

**Key Insights:**
- Most common dream category
- Average lucidity & clarity
- Recurring symbols and emotions
- Sleep quality trends
- Personalized recommendations

### 7. Export Your Dreams

```bash
# Create a markdown export
curl -X POST http://localhost:8961/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "markdown",
    "timeframe": "month",
    "includeAnalysis": true
  }'
```

**Response:**
```json
{
  "exportId": "exp_xyz789",
  "format": "markdown",
  "accessToken": "token_abc123def456",
  "dreamsIncluded": 12,
  "preview": "# Dream Journal Export\n\nGenerated: 2025-12-03..."
}
```

### 8. Download Your Export

```bash
curl "http://localhost:8961/export/exp_xyz789?token=token_abc123def456" \
  > my_dreams.md
```

### 9. Share Dreams

```bash
curl -X POST http://localhost:8961/dreams/share \
  -H "Content-Type: application/json" \
  -d '{
    "dreamId": "dream_abc123",
    "sharedWith": ["friend_id_1", "friend_id_2"]
  }'
```

## Five Minute Example

Complete workflow in 5 minutes:

```bash
# 1. Check service status
curl http://localhost:8961/health

# 2. Record a quick dream
DREAM_ID=$(curl -s -X POST http://localhost:8961/dream \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "Quick Test",
    "narrative": "Test dream for quick start",
    "emotions": ["curiosity"],
    "lucidity": 50,
    "clarity": 60
  }' | jq -r '.id')

# 3. Log a sleep cycle
curl -X POST http://localhost:8961/sleep-cycle \
  -H "Content-Type: application/json" \
  -d "{
    \"dreamId\": \"$DREAM_ID\",
    \"cycleType\": \"REM\",
    \"startTime\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\",
    \"duration\": 90,
    \"quality\": 75
  }"

# 4. Get categories overview
curl http://localhost:8961/categories

# 5. View your patterns
curl "http://localhost:8961/analysis/patterns?timeframe=month"

# 6. Create export
EXPORT=$(curl -s -X POST http://localhost:8961/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "includeAnalysis": true
  }' | jq -r '.exportId, .accessToken')

EXPORT_ID=$(echo "$EXPORT" | sed -n '1p')
TOKEN=$(echo "$EXPORT" | sed -n '2p')

# 7. Download export
curl "http://localhost:8961/export/$EXPORT_ID?token=$TOKEN" > dreams_export.json

echo "Export saved to dreams_export.json"
```

## Key Features to Explore

### Auto-Categorization
- Record dreams without specifying category
- System automatically categorizes based on content
- Override with manual category if needed

### Symbol Dictionary
- 15 pre-seeded symbols
- Each symbol includes Jungian & Freudian meanings
- Color and element associations
- Add your own custom symbols
- Search across meanings

### Sleep Quality Tracking
- Link sleep cycles to dreams
- Track quality metrics
- Monitor REM, DEEP, LIGHT sleep
- Correlate with dream quality

### Pattern Recognition
- Automatic detection of recurring themes
- Emotion frequency analysis
- Symbol frequency tracking
- Trend direction (increasing/decreasing)
- Time-based analysis (week/month/year)

### Recommendations
- Nightmare management techniques
- Advanced lucid dreaming tips
- Pattern exploration guidance
- Dream recall improvement

### Export Formats
- **JSON** - Complete structured data
- **Markdown** - Human-readable text (*.md)
- **CSV** - Spreadsheet compatible
- **Token-protected** access to downloads

## Common Tasks

### Find Your Most Recurring Dream Theme

```bash
curl "http://localhost:8961/analysis/patterns?timeframe=year" \
  | jq '.patterns | sort_by(-.frequency) | .[0]'
```

### Get Nightmare Statistics

```bash
curl http://localhost:8961/categories \
  | jq '.breakdown.nightmare'
```

### Find Dreams With Specific Symbol

```bash
curl "http://localhost:8961/symbols/search?q=water" \
  | jq '.results[0] | {symbol, frequency, emotionalCharge}'
```

### Export Month of Dreams as Markdown

```bash
curl -s -X POST http://localhost:8961/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "markdown",
    "timeframe": "month",
    "includeSymbols": true,
    "includeAnalysis": true
  }' | jq -r '.accessToken' | \
  (read TOKEN; \
   EXPORT=$(curl -s "http://localhost:8961/export/$(curl -s -X POST \
   http://localhost:8961/export \
   -H "Content-Type: application/json" \
   -d '{
     "format": "markdown",
     "timeframe": "month"
   }' | jq -r '.exportId')?token=$TOKEN"); \
   echo "$EXPORT" > month_dreams.md)
```

### Analyze Sleep Quality Trend

```bash
curl "http://localhost:8961/analysis/sleep-quality?timeframe=month" \
  | jq '{averageQuality, trend}'
```

## Database Location

SQLite database is stored at:
```
./data/dream-core.db
```

To inspect the database directly:
```bash
sqlite3 ./data/dream-core.db ".tables"
sqlite3 ./data/dream-core.db "SELECT COUNT(*) as dreams FROM dreams;"
```

## Troubleshooting

### "Port 8961 already in use"
```bash
# Find and kill existing process
lsof -i :8961
kill -9 <PID>

# Or use different port by editing the code
```

### "Database locked"
- Close any other database connections
- Check for existing Bun process
- Delete `.db-shm` and `.db-wal` files in `./data/`

### "LLM Gateway not responding"
- Ensure LLM Gateway is running on port 8954
- Symbol analysis will fail gracefully, returning empty array
- Dreams can still be recorded without analysis

### "Missing data directory"
```bash
mkdir -p ./data
```

## Next Steps

1. Read **DREAM_CORE_V2_FEATURES.md** for detailed feature documentation
2. Explore **DREAM_CORE_API_REFERENCE.md** for complete API details
3. Create a dream journal workflow
4. Set up automated sleep tracking
5. Explore your personal dream patterns
6. Share dreams with others

## Support

For issues or questions:
1. Check the API reference
2. Review the features documentation
3. Check database schema in code
4. Verify service is running: `curl http://localhost:8961/health`

## Tips & Best Practices

1. **Consistent Recording**: Log dreams immediately upon waking
2. **Detailed Narratives**: More detail = better symbol analysis
3. **Emotion Tags**: Include emotions for better pattern matching
4. **Sleep Data**: Track sleep cycles for quality insights
5. **Regular Analysis**: Run pattern analysis monthly
6. **Custom Symbols**: Add personal symbol meanings
7. **Regular Exports**: Create periodic backups in JSON format
8. **Share Insights**: Share interesting patterns with others

Enjoy exploring your dreams!
