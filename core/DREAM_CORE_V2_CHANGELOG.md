# Dream Core v2.0 - Changelog

## Version 2.0 Release - December 3, 2025

### Major Features Added

#### 1. Dream Journal with Auto-Categorization
- **NEW:** Five dream categories with automatic classification
  - `lucid` - High consciousness dreams (lucidity > 70%)
  - `nightmare` - Negative/fearful dreams
  - `recurring` - Dreams that appear multiple times
  - `symbolic` - Rich in symbols and archetypes
  - `everyday` - Regular dreams

- **Endpoints Added:**
  - `GET /categories` - Category breakdown statistics
  - `GET /dreams/category/{category}` - Filter dreams by category

- **Auto-Categorization Logic:**
  - Keywords detection (nightmare, horror, terror)
  - Symbol analysis (emotional charge)
  - Lucidity level evaluation
  - Frequency-based recurring detection

#### 2. Enhanced Dream Symbol Dictionary
- **NEW:** Expanded symbol metadata
  - Added Freudian interpretations
  - Added color associations
  - Added element associations (fire, water, earth, air)
  - Timestamp tracking of updates

- **Extended Symbols Database:**
  - 15 pre-seeded symbols with full metadata
  - New symbols: fire, mountain, ocean, door, light
  - Support for custom user-defined symbols

- **Endpoints Added:**
  - `POST /symbols/add` - Add/update custom symbols
  - `GET /symbols/search` - Search symbols by name or archetype
  - Enhanced `/symbols` - Full metadata in responses

#### 3. Sleep Cycle Tracking System
- **NEW:** Dedicated sleep cycle tracking
  - Cycle type classification (REM, DEEP, LIGHT, UNKNOWN)
  - Quality metrics (0-100)
  - Biometric data support (heart rate, movements)
  - Dream-to-cycle linking

- **Endpoints Added:**
  - `POST /sleep-cycle` - Record sleep cycles
  - `GET /sleep-cycles` - Sleep history with summary
  - `GET /analysis/sleep-quality` - Trend analysis

- **Database Table Added:**
  - `sleep_cycles` - Complete sleep tracking history

#### 4. Advanced Pattern Recognition
- **NEW:** Intelligent pattern detection and analysis
  - Symbol frequency analysis
  - Emotion frequency tracking
  - Category trend detection
  - Lucidity trend analysis
  - Sleep quality correlation
  - Automatic recommendation generation

- **Endpoints Added:**
  - `GET /analysis/patterns` - Comprehensive pattern analysis
    - Time-based filtering (week, month, year, all)
    - Symbol and emotion frequency maps
    - Personalized recommendations
    - Trend direction tracking

- **Recommendation Engine:**
  - Nightmare management suggestions
  - Advanced lucid dreaming techniques
  - Pattern exploration guidance
  - Dream recall improvement tips

#### 5. Dream Export & Sharing Functionality
- **NEW:** Multi-format export system
  - JSON export with full data
  - Markdown export for human readability
  - CSV export for spreadsheet tools
  - PDF format prepared for future

- **NEW:** Dream sharing with users
  - Share individual dreams
  - Track shared-with relationships
  - Access control via tokens

- **Endpoints Added:**
  - `POST /export` - Create exportable snapshots
    - Format selection (json, markdown, csv)
    - Selective content inclusion
    - Time-based filtering
  - `GET /export/{id}` - Download exports with token authentication
  - `POST /dreams/share` - Share dreams with other users

- **Database Table Added:**
  - `dream_exports` - Export history and metadata

### Database Enhancements

#### Schema Updates

**dreams table:**
- Added `category TEXT` - Dream category
- Added `sleep_quality INTEGER` - Sleep quality rating
- Added `duration INTEGER` - Dream duration
- Added `tags TEXT` - JSON array of custom tags
- Added `shared_with TEXT` - JSON array of user IDs

**dream_symbols table:**
- Added `freudian_meaning TEXT` - Freudian interpretation
- Added `color_association TEXT` - Color associations
- Added `element_association TEXT` - Element associations
- Added `last_updated TEXT` - Modification timestamp

**dream_patterns table:**
- Added `category TEXT` - Associated category
- Added `trend_direction TEXT` - Trend (increasing/decreasing/stable)
- Added `related_emotions TEXT` - JSON array of emotions

#### New Tables
- `sleep_cycles` - Sleep cycle tracking
- `dream_exports` - Export management

#### New Indexes
- `idx_dreams_timestamp` - Time-based queries
- `idx_dreams_category` - Category filtering
- `idx_dreams_type` - Type filtering
- `idx_sleep_cycles_dream` - Dream-cycle relationships
- `idx_patterns_frequency` - Pattern sorting

### Type System Additions

**New Types:**
```typescript
type DreamCategory = 'lucid' | 'nightmare' | 'recurring' | 'symbolic' | 'everyday'

type SleepCycle = 'REM' | 'DEEP' | 'LIGHT' | 'UNKNOWN'
```

**New Interfaces:**
- `SleepCycleData` - Sleep cycle data structure
- `SymbolDictionaryEntry` - Enhanced symbol metadata
- `DreamExport` - Export configuration and metadata
- `PatternAnalysis` - Advanced pattern analysis results

### New Helper Functions

1. **categorizeDream()** - Automatic dream categorization
2. **detectNightmare()** - Nightmare detection algorithm
3. **trackSleepQuality()** - Sleep quality calculation
4. **analyzeDreamPatterns()** - Pattern extraction
5. **generatePatternAnalysis()** - Comprehensive pattern analysis
6. **generateRecommendations()** - AI recommendation generation
7. **generateExportData()** - Multi-format export generation
8. **createShareToken()** - Secure sharing token generation

### API Endpoints Summary

**Total Endpoints: 27 (was 8)**

#### Core (6 endpoints)
- POST /dream - Record dream (enhanced with auto-categorization)
- GET /dreams - Dream history
- POST /analyze - Dream analysis
- GET /symbols - Symbol dictionary (enhanced)
- GET /patterns - Pattern listing
- GET /stats - Statistics

#### Categories (2 endpoints)
- GET /categories - Category breakdown
- GET /dreams/category/{cat} - Category filtering

#### Sleep Tracking (3 endpoints)
- POST /sleep-cycle - Record cycle
- GET /sleep-cycles - Cycle history
- GET /analysis/sleep-quality - Quality trends

#### Symbol Management (3 endpoints)
- POST /symbols/add - Add custom symbol
- GET /symbols/search - Search symbols

#### Pattern Analysis (2 endpoints)
- GET /analysis/patterns - Advanced analysis
- GET /analysis/sleep-quality - Quality analysis

#### Export & Sharing (3 endpoints)
- POST /export - Create export
- GET /export/{id} - Download export
- POST /dreams/share - Share dreams

#### Active Dreaming (2 endpoints)
- POST /active/start - Start session
- POST /active/dream - Generate dream

#### Health (1 endpoint)
- GET /health - Service status

### Performance Improvements

1. **Indexed Queries** - 5 new database indexes for faster lookups
2. **Prepared Statements** - SQL injection prevention
3. **Efficient Aggregations** - GROUP BY queries for statistics
4. **Lazy Loading** - Optional metadata inclusion in exports

### Breaking Changes

**None** - Fully backward compatible

All existing endpoints work as before with enhanced response data.

### Data Migration

No migration required. New columns have defaults:
- `category` defaults to `'everyday'`
- `sleep_quality` defaults to `50`
- `tags` defaults to `[]`
- `shared_with` defaults to `[]`

### Configuration

No new configuration required. All features enabled by default.

### Documentation Added

1. **DREAM_CORE_V2_FEATURES.md** - Comprehensive feature documentation
2. **DREAM_CORE_API_REFERENCE.md** - Complete API reference with examples
3. **DREAM_CORE_V2_CHANGELOG.md** - This changelog

### Testing Recommendations

1. Test auto-categorization with sample dreams
2. Verify sleep cycle tracking with biometric data
3. Test export formats (JSON, Markdown, CSV)
4. Validate pattern analysis across time periods
5. Test dream sharing functionality
6. Verify search across symbol dictionary

### Code Quality

- Full TypeScript type safety
- CORS headers properly configured
- Error handling with HTTP status codes
- Database transaction support via WAL mode
- Comprehensive parameter validation

### Future Roadmap

- PDF export implementation
- Machine learning pattern detection
- Wearable device integration
- Multi-language dream interpretation
- Cloud backup and sync
- Mobile app support
- Real-time WebSocket updates
- Advanced statistics dashboard
- Dream sharing permission system
- Integration with third-party APIs

### Migration Guide

For existing Dream Core v1.0 users:

1. No data migration needed
2. Existing dreams continue to work
3. Auto-categorization applies to new dreams
4. Optional: Re-analyze old dreams for categories
5. Sleep cycle tracking starts fresh
6. Symbol dictionary enhanced with new fields

### Support & Feedback

Report issues or suggest features for v2.1:
- GitHub Issues
- Feature Requests
- Bug Reports

### Contributors

Dream Core v2.0 development team

### Release Date

December 3, 2025

### License

Same as Toobix Unified project
