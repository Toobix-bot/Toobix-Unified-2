# Emotional Core v2.0 - Integration Guide

## Quick Start

### Starting the Service

```bash
# From Toobix-Unified root directory
cd core
bun run emotional-core.ts
```

The service will start on port **8901** with all new features enabled.

## Integration Points for Other Services

### 1. Integrate with Unified Service Gateway

Add these route handlers to forward requests:

```typescript
// In unified-service-gateway.ts
if (url.pathname.startsWith('/emotional/')) {
  const emotionalPath = url.pathname.replace('/emotional', '');
  const emotionalUrl = `http://localhost:8901${emotionalPath}${url.search}`;

  return fetch(emotionalUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' ? await req.text() : undefined
  });
}
```

### 2. Integrate with Memory Palace

Link emotional events to long-term memory:

```typescript
async function storeEmotionalMemory(userId: string, moodEntry: MoodEntry) {
  // Call Memory Palace API
  const response = await fetch('http://localhost:8953/memories/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Emotional State: ${moodEntry.emotion}`,
      content: moodEntry.notes || `Mood level: ${moodEntry.mood}/10`,
      category: 'emotional-event',
      significance: moodEntry.mood > 8 ? 0.8 : moodEntry.mood < 3 ? 0.7 : 0.5,
      tags: [moodEntry.emotion, ...moodEntry.triggers]
    })
  });
  return response.json();
}
```

### 3. Integrate with LLM Gateway

Enhance emotion detection:

```typescript
async function detectEmotionWithConfidence(text: string): Promise<{
  emotion: string;
  confidence: number;
  reasoning: string;
}> {
  const response = await fetch('http://localhost:8954/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'Analyze the emotion and provide confidence score (0-1) and brief reasoning'
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 100
    })
  });
  // Parse response...
}
```

### 4. Integrate with Event Bus

Emit emotional events:

```typescript
async function emitEmotionalEvent(
  type: 'mood.logged' | 'pattern.detected' | 'wellbeing.changed',
  data: any
) {
  await fetch('http://localhost:8955/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: `emotional.${type}`,
      data,
      timestamp: new Date().toISOString()
    })
  });
}
```

## Client Library Usage

### TypeScript/JavaScript Client

```typescript
interface MoodTracker {
  logMood(userId: string, mood: Partial<MoodEntry>): Promise<MoodEntry>;
  getMoodHistory(userId: string, days?: number): Promise<MoodEntry[]>;
  analyzePatterns(userId: string): Promise<EmotionalInsight[]>;
  getWellbeingScore(userId: string): Promise<WellbeingScore>;
  getVisualization(userId: string, timeframe?: string): Promise<VisualizationData>;
}

class EmotionalCoreClient implements MoodTracker {
  private baseUrl = 'http://localhost:8901';

  async logMood(userId: string, mood: Partial<MoodEntry>): Promise<MoodEntry> {
    const response = await fetch(`${this.baseUrl}/mood/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...mood })
    });
    const result = await response.json();
    return result.entry;
  }

  async getMoodHistory(userId: string, days: number = 30): Promise<MoodEntry[]> {
    const response = await fetch(
      `${this.baseUrl}/mood/history?userId=${userId}&days=${days}`
    );
    const result = await response.json();
    return result.entries;
  }

  async analyzePatterns(userId: string): Promise<EmotionalInsight[]> {
    const response = await fetch(`${this.baseUrl}/patterns/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const result = await response.json();
    return result.patterns;
  }

  async getWellbeingScore(userId: string): Promise<WellbeingScore> {
    const response = await fetch(`${this.baseUrl}/wellbeing/score?userId=${userId}`);
    const result = await response.json();
    return result.score;
  }

  async getVisualization(
    userId: string,
    timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<VisualizationData> {
    const response = await fetch(
      `${this.baseUrl}/visualization/history?userId=${userId}&timeframe=${timeframe}`
    );
    return response.json();
  }
}

// Usage
const emotionalCore = new EmotionalCoreClient();
await emotionalCore.logMood('user123', {
  mood: 7,
  emotion: 'joy',
  triggers: ['good weather']
});
```

## Testing the New Features

### Test Script

Create `test-emotional-core-v2.ts`:

```typescript
import { EmotionalCoreClient } from './emotional-core-client';

const client = new EmotionalCoreClient();
const testUserId = 'test-user-' + Date.now();

async function runTests() {
  console.log('Testing Emotional Core v2.0 Features\n');

  // Test 1: Mood Logging
  console.log('1. Testing Mood Logging...');
  const moodEntries = [
    { mood: 5, emotion: 'neutral', triggers: ['work'] },
    { mood: 7, emotion: 'joy', triggers: ['good news'] },
    { mood: 8, emotion: 'joy', triggers: ['exercise'] },
    { mood: 4, emotion: 'sadness', triggers: ['difficult conversation'] },
    { mood: 6, emotion: 'hope', triggers: ['planning future'] }
  ];

  for (const entry of moodEntries) {
    await client.logMood(testUserId, {
      ...entry,
      activities: ['walking', 'thinking'],
      sleepQuality: 7,
      exerciseMinutes: 30,
      socialInteraction: true
    });
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('✓ Mood entries logged\n');

  // Test 2: Mood History
  console.log('2. Testing Mood History...');
  const history = await client.getMoodHistory(testUserId, 30);
  console.log(`✓ Retrieved ${history.length} mood entries\n`);

  // Test 3: Pattern Analysis
  console.log('3. Testing Pattern Analysis...');
  const patterns = await client.analyzePatterns(testUserId);
  console.log(`✓ Detected ${patterns.length} patterns\n`);
  patterns.forEach(p => {
    console.log(`  - ${p.patternName}: ${p.description}`);
  });

  // Test 4: Wellbeing Score
  console.log('\n4. Testing Wellbeing Score...');
  const wellbeing = await client.getWellbeingScore(testUserId);
  console.log(`✓ Overall Score: ${wellbeing.overallScore.toFixed(1)}/100`);
  console.log(`  - Emotional Balance: ${wellbeing.emotionalBalance.toFixed(1)}`);
  console.log(`  - Stress Level: ${wellbeing.stressLevel.toFixed(1)}`);
  console.log(`  - Resilience: ${wellbeing.resilience.toFixed(1)}`);
  console.log(`  - Trends: ${wellbeing.trends.weekTrend} (week), ${wellbeing.trends.monthTrend} (month)\n`);

  // Test 5: Visualization
  console.log('5. Testing Visualization...');
  const viz = await client.getVisualization(testUserId, 'month');
  console.log(`✓ Generated visualization with:`);
  console.log(`  - Timeline: ${viz.moodTimeline.length} data points`);
  console.log(`  - Emotions: ${viz.emotionDistribution.length} unique emotions`);
  console.log(`  - Top triggers: ${viz.topTriggers.slice(0, 3).map(t => t.trigger).join(', ')}\n`);

  console.log('All tests completed successfully!');
}

runTests().catch(console.error);
```

Run with:
```bash
bun run test-emotional-core-v2.ts
```

## Performance Considerations

### Query Optimization

1. **Use user_id filtering** when possible
   ```typescript
   // Good
   GET /mood/history?userId=user123

   // Avoids full table scan
   ```

2. **Limit result sets**
   ```typescript
   GET /patterns/insights?limit=5
   GET /wellbeing/score/history?limit=10
   ```

3. **Cache visualizations**
   ```typescript
   // First request generates and caches
   GET /visualization/history?userId=user123&timeframe=month

   // Subsequent requests use cache
   GET /visualization/cache?userId=user123&timeframe=month
   ```

### Database Maintenance

```sql
-- Analyze query performance
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Check index effectiveness
PRAGMA index_info(idx_mood_entries_user_timestamp);
```

## Monitoring & Logging

Add to application for insights:

```typescript
// Log pattern detections
if (patterns.length > 0) {
  console.log(`[EMOTIONAL] Patterns detected for ${userId}:`,
    patterns.map(p => p.patternName).join(', '));
}

// Log wellbeing changes
if (wellbeing.trends.weekTrend === 'declining') {
  console.warn(`[EMOTIONAL] Wellbeing declining for ${userId}`);
}

// Log mood extremes
if (moodEntry.mood >= 9) {
  console.info(`[EMOTIONAL] Peak mood logged by ${userId}`);
} else if (moodEntry.mood <= 2) {
  console.warn(`[EMOTIONAL] Low mood alert for ${userId}`);
}
```

## Troubleshooting

### Issue: "Not enough data for pattern analysis"
**Solution**: Log at least 5 mood entries spread across different emotions

### Issue: Wellbeing score stuck at 50
**Solution**: This is the default when no mood entries exist. Log mood entries with sleep, exercise, and social data

### Issue: Visualization cache returning old data
**Solution**: Clear cache with: `DELETE FROM visualization_cache WHERE user_id = ?`

### Issue: Slow pattern analysis
**Solution**: Ensure indexes are built and database is vacuumed regularly

## Migration Guide

If updating from Emotional Core v1.0:

1. **No data loss**: Existing emotion_entries and support_sessions are preserved
2. **New tables created automatically** on first run
3. **Backward compatibility**: All v1.0 endpoints work unchanged
4. **Default behavior**: Users start with default wellbeing scores of 50

## Security Considerations

1. **User Isolation**: All endpoints respect userId parameter
2. **Input Validation**: Mood scores validated to 1-10 range
3. **SQL Injection Prevention**: Uses parameterized queries
4. **CORS Enabled**: Configured for cross-origin access (configurable)

## Support & Documentation

For detailed API specifications, see: `/core/EMOTIONAL-CORE-v2-FEATURES.md`
