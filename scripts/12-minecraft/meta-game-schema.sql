-- ============================================================================
-- META-GAME DATABASE SCHEMA
-- Tracks ALL Minecraft bot activity across runs for analysis and evolution
-- ============================================================================

-- ============================================================================
-- RUNS TABLE
-- Tracks each game run with metadata and outcomes
-- ============================================================================
CREATE TABLE runs (
    run_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Timing
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        CAST((julianday(end_time) - julianday(start_time)) * 86400 AS INTEGER)
    ) STORED,

    -- Game metrics
    days_survived INTEGER DEFAULT 0,
    total_ticks INTEGER DEFAULT 0,
    world_seed TEXT,

    -- Outcome
    end_reason TEXT CHECK(end_reason IN (
        'completed', 'all_died', 'manual_stop', 'error', 'timeout', 'victory'
    )),

    -- Bot counts
    initial_bot_count INTEGER NOT NULL,
    final_bot_count INTEGER DEFAULT 0,

    -- Aggregate statistics
    total_blocks_mined INTEGER DEFAULT 0,
    total_items_crafted INTEGER DEFAULT 0,
    total_distance_traveled REAL DEFAULT 0.0,
    total_achievements_unlocked INTEGER DEFAULT 0,

    -- Meta information
    version TEXT, -- Game/bot version
    notes TEXT,

    -- Status
    is_active BOOLEAN DEFAULT 1,

    CONSTRAINT positive_days CHECK(days_survived >= 0),
    CONSTRAINT positive_ticks CHECK(total_ticks >= 0)
);

CREATE INDEX idx_runs_start_time ON runs(start_time DESC);
CREATE INDEX idx_runs_end_reason ON runs(end_reason);
CREATE INDEX idx_runs_days_survived ON runs(days_survived DESC);
CREATE INDEX idx_runs_active ON runs(is_active);

-- ============================================================================
-- BOT LIVES TABLE
-- Each bot spawn creates a new record (permadeath tracking)
-- ============================================================================
CREATE TABLE bot_lives (
    life_id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,

    -- Bot identity
    bot_name TEXT NOT NULL,
    bot_role TEXT NOT NULL, -- woodcutter, miner, farmer, builder, explorer, defender

    -- Lifecycle
    spawn_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    death_time DATETIME,
    life_duration_seconds INTEGER GENERATED ALWAYS AS (
        CAST((julianday(death_time) - julianday(spawn_time)) * 86400 AS INTEGER)
    ) STORED,

    -- Death details
    death_reason TEXT, -- fall, zombie, skeleton, creeper, starvation, drowning, lava, manual
    death_location_x REAL,
    death_location_y REAL,
    death_location_z REAL,

    -- Activity statistics
    blocks_mined INTEGER DEFAULT 0,
    blocks_placed INTEGER DEFAULT 0,
    items_crafted INTEGER DEFAULT 0,
    distance_traveled REAL DEFAULT 0.0,
    damage_dealt REAL DEFAULT 0.0,
    damage_taken REAL DEFAULT 0.0,
    food_consumed INTEGER DEFAULT 0,

    -- Role-specific metrics (JSON for flexibility)
    role_specific_stats TEXT, -- JSON blob

    -- Status
    is_alive BOOLEAN DEFAULT 1,

    -- Performance metrics
    efficiency_score REAL, -- Calculated based on role

    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE,
    CONSTRAINT valid_life_duration CHECK(death_time IS NULL OR death_time >= spawn_time)
);

CREATE INDEX idx_bot_lives_run ON bot_lives(run_id);
CREATE INDEX idx_bot_lives_bot_name ON bot_lives(bot_name);
CREATE INDEX idx_bot_lives_bot_role ON bot_lives(bot_role);
CREATE INDEX idx_bot_lives_death_reason ON bot_lives(death_reason);
CREATE INDEX idx_bot_lives_is_alive ON bot_lives(is_alive);
CREATE INDEX idx_bot_lives_efficiency ON bot_lives(efficiency_score DESC);
CREATE INDEX idx_bot_lives_spawn_time ON bot_lives(spawn_time);

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- Tracks individual and collective achievements
-- ============================================================================
CREATE TABLE achievements (
    achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,

    -- Achievement details
    achievement_type TEXT NOT NULL CHECK(achievement_type IN ('personal', 'collective')),
    achievement_name TEXT NOT NULL,
    achievement_category TEXT, -- mining, building, combat, survival, exploration

    -- Attribution
    bot_life_id INTEGER, -- NULL for collective achievements
    bot_name TEXT, -- Denormalized for easier queries

    -- Timing
    unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    game_day INTEGER, -- Which in-game day

    -- Achievement data
    metadata TEXT, -- JSON: {value: 100, description: "Mined 100 stone", difficulty: "easy"}

    -- Scoring
    points INTEGER DEFAULT 0,
    rarity TEXT CHECK(rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),

    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE,
    FOREIGN KEY (bot_life_id) REFERENCES bot_lives(life_id) ON DELETE CASCADE
);

CREATE INDEX idx_achievements_run ON achievements(run_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_bot_life ON achievements(bot_life_id);
CREATE INDEX idx_achievements_bot_name ON achievements(bot_name);
CREATE INDEX idx_achievements_name ON achievements(achievement_name);
CREATE INDEX idx_achievements_category ON achievements(achievement_category);
CREATE INDEX idx_achievements_unlocked_at ON achievements(unlocked_at DESC);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- ============================================================================
-- BOT STATISTICS TABLE
-- Aggregate statistics per bot across ALL runs
-- ============================================================================
CREATE TABLE bot_statistics (
    bot_name TEXT PRIMARY KEY,

    -- Career statistics
    total_runs INTEGER DEFAULT 0,
    total_lives INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0, -- Lives in current run

    -- Time statistics
    total_playtime_seconds INTEGER DEFAULT 0,
    longest_life_seconds INTEGER DEFAULT 0,
    average_life_seconds REAL DEFAULT 0.0,

    -- Activity totals
    total_blocks_mined INTEGER DEFAULT 0,
    total_blocks_placed INTEGER DEFAULT 0,
    total_items_crafted INTEGER DEFAULT 0,
    total_distance_traveled REAL DEFAULT 0.0,
    total_damage_dealt REAL DEFAULT 0.0,
    total_damage_taken REAL DEFAULT 0.0,

    -- Achievements
    total_achievements INTEGER DEFAULT 0,

    -- Performance metrics
    survival_rate REAL DEFAULT 0.0, -- % of runs survived
    win_rate REAL DEFAULT 0.0, -- % of runs won
    efficiency_rating REAL DEFAULT 0.0, -- Overall efficiency

    -- Death analysis
    most_common_death_reason TEXT,
    death_reason_counts TEXT, -- JSON: {"zombie": 5, "fall": 3, ...}

    -- Ranking
    current_rank INTEGER,
    rank_category TEXT, -- overall, role_specific, etc.

    -- Evolution tracking
    improvement_trend REAL, -- Positive = improving, negative = declining
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Role preference
    primary_role TEXT,
    role_distribution TEXT -- JSON: {"woodcutter": 10, "miner": 5, ...}
);

CREATE INDEX idx_bot_stats_rank ON bot_statistics(current_rank);
CREATE INDEX idx_bot_stats_efficiency ON bot_statistics(efficiency_rating DESC);
CREATE INDEX idx_bot_stats_survival_rate ON bot_statistics(survival_rate DESC);
CREATE INDEX idx_bot_stats_primary_role ON bot_statistics(primary_role);
CREATE INDEX idx_bot_stats_improvement ON bot_statistics(improvement_trend DESC);

-- ============================================================================
-- COLLECTIVE MEMORY TABLE
-- Events that affect the entire colony (Lebenskräfte integration)
-- ============================================================================
CREATE TABLE collective_memory (
    memory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,

    -- Event details
    event_type TEXT NOT NULL, -- disaster, triumph, milestone, discovery, conflict
    event_name TEXT NOT NULL,
    event_data TEXT, -- JSON with full event details

    -- Timing
    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    game_day INTEGER,

    -- Lebenskräfte impact (8 core values)
    lebenskraft_survival REAL DEFAULT 0.0,
    lebenskraft_growth REAL DEFAULT 0.0,
    lebenskraft_harmony REAL DEFAULT 0.0,
    lebenskraft_knowledge REAL DEFAULT 0.0,
    lebenskraft_courage REAL DEFAULT 0.0,
    lebenskraft_creativity REAL DEFAULT 0.0,
    lebenskraft_resilience REAL DEFAULT 0.0,
    lebenskraft_unity REAL DEFAULT 0.0,

    -- Impact analysis
    severity TEXT CHECK(severity IN ('minor', 'moderate', 'major', 'critical')),
    affected_bots TEXT, -- JSON array of bot names

    -- Memory retention
    importance_score REAL DEFAULT 0.5, -- 0.0 to 1.0
    should_remember BOOLEAN DEFAULT 1,

    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE,
    CONSTRAINT lebenskraft_range_survival CHECK(lebenskraft_survival BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_growth CHECK(lebenskraft_growth BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_harmony CHECK(lebenskraft_harmony BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_knowledge CHECK(lebenskraft_knowledge BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_courage CHECK(lebenskraft_courage BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_creativity CHECK(lebenskraft_creativity BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_resilience CHECK(lebenskraft_resilience BETWEEN -1.0 AND 1.0),
    CONSTRAINT lebenskraft_range_unity CHECK(lebenskraft_unity BETWEEN -1.0 AND 1.0)
);

CREATE INDEX idx_collective_memory_run ON collective_memory(run_id);
CREATE INDEX idx_collective_memory_type ON collective_memory(event_type);
CREATE INDEX idx_collective_memory_occurred_at ON collective_memory(occurred_at DESC);
CREATE INDEX idx_collective_memory_importance ON collective_memory(importance_score DESC);
CREATE INDEX idx_collective_memory_severity ON collective_memory(severity);
CREATE INDEX idx_collective_memory_should_remember ON collective_memory(should_remember);

-- ============================================================================
-- INSIGHTS TABLE
-- AI-generated insights from pattern analysis
-- ============================================================================
CREATE TABLE insights (
    insight_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Insight details
    insight_type TEXT NOT NULL, -- pattern, anomaly, recommendation, prediction, correlation
    pattern_detected TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Analysis
    data_points_analyzed INTEGER,
    time_period_start DATETIME,
    time_period_end DATETIME,

    -- Recommendation
    recommendation TEXT,
    expected_improvement TEXT, -- "20% better survival rate"

    -- Confidence
    confidence_score REAL NOT NULL, -- 0.0 to 1.0
    statistical_significance REAL, -- p-value if applicable

    -- Application tracking
    is_applied BOOLEAN DEFAULT 0,
    applied_at DATETIME,
    applied_in_run_id INTEGER,

    -- Results (after application)
    actual_outcome TEXT,
    success_rating REAL, -- How well did it work?

    -- Meta
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by TEXT, -- AI model/version

    -- Related data
    related_runs TEXT, -- JSON array of run_ids
    related_bots TEXT, -- JSON array of bot names

    FOREIGN KEY (applied_in_run_id) REFERENCES runs(run_id) ON DELETE SET NULL,
    CONSTRAINT confidence_range CHECK(confidence_score BETWEEN 0.0 AND 1.0)
);

CREATE INDEX idx_insights_type ON insights(insight_type);
CREATE INDEX idx_insights_confidence ON insights(confidence_score DESC);
CREATE INDEX idx_insights_is_applied ON insights(is_applied);
CREATE INDEX idx_insights_generated_at ON insights(generated_at DESC);
CREATE INDEX idx_insights_applied_run ON insights(applied_in_run_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active runs with current statistics
CREATE VIEW v_active_runs AS
SELECT
    r.run_id,
    r.start_time,
    r.days_survived,
    r.total_ticks,
    r.initial_bot_count,
    COUNT(DISTINCT bl.life_id) as total_lives_spawned,
    COUNT(DISTINCT CASE WHEN bl.is_alive = 1 THEN bl.life_id END) as currently_alive,
    COUNT(DISTINCT a.achievement_id) as achievements_unlocked,
    r.total_blocks_mined,
    r.world_seed
FROM runs r
LEFT JOIN bot_lives bl ON r.run_id = bl.run_id
LEFT JOIN achievements a ON r.run_id = a.run_id
WHERE r.is_active = 1
GROUP BY r.run_id;

-- Bot performance leaderboard
CREATE VIEW v_bot_leaderboard AS
SELECT
    bot_name,
    current_rank,
    efficiency_rating,
    survival_rate,
    total_lives,
    total_deaths,
    longest_life_seconds / 60.0 as longest_life_minutes,
    total_achievements,
    primary_role,
    improvement_trend
FROM bot_statistics
ORDER BY efficiency_rating DESC;

-- Recent death analysis
CREATE VIEW v_recent_deaths AS
SELECT
    bl.life_id,
    bl.run_id,
    bl.bot_name,
    bl.bot_role,
    bl.death_time,
    bl.death_reason,
    bl.life_duration_seconds / 60.0 as life_duration_minutes,
    bl.blocks_mined,
    r.days_survived as run_day,
    bl.efficiency_score
FROM bot_lives bl
JOIN runs r ON bl.run_id = r.run_id
WHERE bl.is_alive = 0
ORDER BY bl.death_time DESC;

-- Collective memory timeline
CREATE VIEW v_memory_timeline AS
SELECT
    cm.memory_id,
    cm.run_id,
    cm.event_type,
    cm.event_name,
    cm.occurred_at,
    cm.game_day,
    cm.severity,
    cm.importance_score,
    (cm.lebenskraft_survival + cm.lebenskraft_growth + cm.lebenskraft_harmony +
     cm.lebenskraft_knowledge + cm.lebenskraft_courage + cm.lebenskraft_creativity +
     cm.lebenskraft_resilience + cm.lebenskraft_unity) as total_lebenskraft_impact
FROM collective_memory cm
WHERE cm.should_remember = 1
ORDER BY cm.occurred_at DESC;

-- Achievement rankings
CREATE VIEW v_achievement_rankings AS
SELECT
    bot_name,
    COUNT(*) as total_achievements,
    COUNT(CASE WHEN rarity = 'common' THEN 1 END) as common_count,
    COUNT(CASE WHEN rarity = 'uncommon' THEN 1 END) as uncommon_count,
    COUNT(CASE WHEN rarity = 'rare' THEN 1 END) as rare_count,
    COUNT(CASE WHEN rarity = 'epic' THEN 1 END) as epic_count,
    COUNT(CASE WHEN rarity = 'legendary' THEN 1 END) as legendary_count,
    SUM(points) as total_points
FROM achievements
WHERE bot_name IS NOT NULL
GROUP BY bot_name
ORDER BY total_points DESC;

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Query 1: Top 10 woodcutters by efficiency
-- Shows the most efficient woodcutters based on blocks mined per minute alive
/*
SELECT
    bl.bot_name,
    COUNT(bl.life_id) as total_lives,
    AVG(bl.blocks_mined) as avg_blocks_per_life,
    AVG(bl.life_duration_seconds / 60.0) as avg_life_minutes,
    AVG(bl.blocks_mined / NULLIF(bl.life_duration_seconds / 60.0, 0)) as blocks_per_minute,
    AVG(bl.efficiency_score) as avg_efficiency
FROM bot_lives bl
WHERE bl.bot_role = 'woodcutter'
    AND bl.life_duration_seconds > 60 -- At least 1 minute alive
GROUP BY bl.bot_name
ORDER BY blocks_per_minute DESC
LIMIT 10;
*/

-- Query 2: Most common death cause in first 3 days
-- Analyzes early-game dangers
/*
SELECT
    bl.death_reason,
    COUNT(*) as death_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage,
    AVG(bl.life_duration_seconds / 3600.0) as avg_hours_survived
FROM bot_lives bl
JOIN runs r ON bl.run_id = r.run_id
WHERE bl.death_time IS NOT NULL
    AND r.days_survived <= 3
    AND bl.death_reason IS NOT NULL
GROUP BY bl.death_reason
ORDER BY death_count DESC;
*/

-- Query 3: Bot improvement over last 10 runs
-- Tracks individual bot evolution
/*
WITH recent_runs AS (
    SELECT run_id, start_time,
        ROW_NUMBER() OVER (ORDER BY start_time DESC) as run_rank
    FROM runs
    WHERE end_time IS NOT NULL
    LIMIT 10
),
bot_performance AS (
    SELECT
        bl.bot_name,
        rr.run_rank,
        AVG(bl.efficiency_score) as avg_efficiency,
        AVG(bl.life_duration_seconds / 60.0) as avg_life_minutes,
        COUNT(bl.life_id) as lives_in_run
    FROM bot_lives bl
    JOIN recent_runs rr ON bl.run_id = rr.run_id
    GROUP BY bl.bot_name, rr.run_rank
)
SELECT
    bot_name,
    MAX(CASE WHEN run_rank = 1 THEN avg_efficiency END) as most_recent_efficiency,
    MAX(CASE WHEN run_rank = 10 THEN avg_efficiency END) as oldest_efficiency,
    (MAX(CASE WHEN run_rank = 1 THEN avg_efficiency END) -
     MAX(CASE WHEN run_rank = 10 THEN avg_efficiency END)) as efficiency_change,
    AVG(avg_life_minutes) as avg_life_minutes_overall
FROM bot_performance
GROUP BY bot_name
HAVING COUNT(DISTINCT run_rank) >= 5 -- At least 5 runs
ORDER BY efficiency_change DESC;
*/

-- Query 4: Collective achievements unlocked
-- Shows colony-wide accomplishments
/*
SELECT
    a.achievement_name,
    a.achievement_category,
    a.rarity,
    COUNT(*) as times_unlocked,
    MIN(a.unlocked_at) as first_unlocked,
    MAX(a.unlocked_at) as last_unlocked,
    AVG(r.days_survived) as avg_day_unlocked,
    a.points
FROM achievements a
JOIN runs r ON a.run_id = r.run_id
WHERE a.achievement_type = 'collective'
GROUP BY a.achievement_name
ORDER BY first_unlocked ASC;
*/

-- Query 5: Lebenskräfte trends over time
-- Analyzes how colony values change
/*
SELECT
    DATE(cm.occurred_at) as date,
    cm.event_type,
    COUNT(*) as event_count,
    AVG(cm.lebenskraft_survival) as avg_survival_impact,
    AVG(cm.lebenskraft_unity) as avg_unity_impact,
    AVG(cm.lebenskraft_resilience) as avg_resilience_impact,
    AVG(cm.importance_score) as avg_importance
FROM collective_memory cm
WHERE cm.occurred_at >= datetime('now', '-30 days')
GROUP BY DATE(cm.occurred_at), cm.event_type
ORDER BY date DESC, event_count DESC;
*/

-- Query 6: Applied insights success rate
-- Evaluates AI recommendations
/*
SELECT
    i.insight_type,
    COUNT(*) as total_insights,
    SUM(CASE WHEN i.is_applied = 1 THEN 1 ELSE 0 END) as applied_count,
    AVG(i.confidence_score) as avg_confidence,
    AVG(CASE WHEN i.is_applied = 1 THEN i.success_rating END) as avg_success_rating,
    AVG(i.confidence_score - COALESCE(i.success_rating, 0)) as confidence_accuracy_gap
FROM insights i
GROUP BY i.insight_type
ORDER BY avg_success_rating DESC;
*/

-- Query 7: Role performance comparison
-- Compares different bot roles
/*
SELECT
    bl.bot_role,
    COUNT(DISTINCT bl.bot_name) as unique_bots,
    COUNT(bl.life_id) as total_lives,
    AVG(bl.life_duration_seconds / 60.0) as avg_life_minutes,
    AVG(bl.blocks_mined) as avg_blocks_mined,
    AVG(bl.distance_traveled) as avg_distance,
    AVG(bl.efficiency_score) as avg_efficiency,
    SUM(CASE WHEN bl.is_alive = 0 THEN 1 ELSE 0 END) as total_deaths
FROM bot_lives bl
GROUP BY bl.bot_role
ORDER BY avg_efficiency DESC;
*/

-- Query 8: Death location clustering
-- Identifies dangerous areas
/*
SELECT
    ROUND(death_location_x / 10) * 10 as x_region,
    ROUND(death_location_z / 10) * 10 as z_region,
    COUNT(*) as death_count,
    GROUP_CONCAT(DISTINCT death_reason) as death_reasons,
    AVG(death_location_y) as avg_y_level
FROM bot_lives
WHERE death_time IS NOT NULL
    AND death_location_x IS NOT NULL
GROUP BY x_region, z_region
HAVING death_count >= 3
ORDER BY death_count DESC;
*/

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC STATISTICS UPDATES
-- ============================================================================

-- Update bot statistics when a life ends
CREATE TRIGGER trg_update_bot_stats_on_death
AFTER UPDATE OF is_alive ON bot_lives
WHEN NEW.is_alive = 0 AND OLD.is_alive = 1
BEGIN
    INSERT INTO bot_statistics (bot_name, total_lives, total_deaths)
    VALUES (NEW.bot_name, 1, 1)
    ON CONFLICT(bot_name) DO UPDATE SET
        total_lives = total_lives + 1,
        total_deaths = total_deaths + 1,
        total_playtime_seconds = total_playtime_seconds + NEW.life_duration_seconds,
        longest_life_seconds = MAX(longest_life_seconds, NEW.life_duration_seconds),
        total_blocks_mined = total_blocks_mined + NEW.blocks_mined,
        total_blocks_placed = total_blocks_placed + NEW.blocks_placed,
        total_items_crafted = total_items_crafted + NEW.items_crafted,
        total_distance_traveled = total_distance_traveled + NEW.distance_traveled,
        total_damage_dealt = total_damage_dealt + NEW.damage_dealt,
        total_damage_taken = total_damage_taken + NEW.damage_taken,
        last_updated = CURRENT_TIMESTAMP;
END;

-- Update run statistics when it ends
CREATE TRIGGER trg_update_run_stats_on_end
AFTER UPDATE OF end_time ON runs
WHEN NEW.end_time IS NOT NULL AND OLD.end_time IS NULL
BEGIN
    UPDATE runs SET
        final_bot_count = (
            SELECT COUNT(*)
            FROM bot_lives
            WHERE run_id = NEW.run_id AND is_alive = 1
        ),
        total_achievements_unlocked = (
            SELECT COUNT(*)
            FROM achievements
            WHERE run_id = NEW.run_id
        )
    WHERE run_id = NEW.run_id;
END;

-- ============================================================================
-- INITIAL DATA / REFERENCE VALUES
-- ============================================================================

-- Achievement rarities reference
-- Points: common=10, uncommon=25, rare=50, epic=100, legendary=250

-- Bot roles reference
-- woodcutter, miner, farmer, builder, explorer, defender

-- Lebenskräfte values range: -1.0 (very negative) to +1.0 (very positive)

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- Vacuum and analyze (run periodically for performance)
-- VACUUM;
-- ANALYZE;

-- Backup command (run from shell)
-- sqlite3 meta-game.db ".backup 'meta-game-backup.db'"

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
