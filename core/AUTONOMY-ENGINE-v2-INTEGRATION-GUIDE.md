# Autonomy Engine v2.0 - Integration & Quick Start Guide

## Quick Start

### 1. Start the Service

```bash
cd C:\Dev\Projects\AI\Toobix-Unified
bun run core/autonomy-engine.ts
```

The service will start on **port 8905** with enhanced v2.0 features enabled.

### 2. Test Basic Health

```bash
curl http://localhost:8905/health
```

Response includes port, state, and active goals count.

### 3. Start Autonomy Loop

```bash
curl -X POST http://localhost:8905/start -H "Content-Type: application/json" -d '{"intervalMs": 600000}'
```

Loop runs every 10 minutes (600,000 ms). Adjust as needed.

---

## Feature-by-Feature Integration

### Feature 1: Use Goal Prioritization

```bash
# Get all goals with prioritization scores
curl http://localhost:8905/goals/prioritized

# Get raw prioritization scores
curl http://localhost:8905/prioritization
```

**When to use:**
- Before making action decisions
- When goals conflict, use top prioritized goal
- Monitor urgency scores for deadline management

---

### Feature 2: Schedule Tasks

Create actions with time blocks:

```bash
# Step 1: Create an action
curl -X POST http://localhost:8905/goals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research emotional intelligence",
    "description": "Study techniques for understanding emotions",
    "category": "learning",
    "priority": 8
  }' | jq '.id' # capture goalId

# Step 2: Create an action (via autonomy loop or manual)
# Then schedule it
curl -X POST http://localhost:8905/schedule/task \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "action_xyz",
    "scheduledTime": "2025-12-04T10:00:00Z",
    "duration": 45,
    "priority": 8
  }'

# Step 3: View today's schedule
curl http://localhost:8905/schedule/today

# Step 4: Optimize schedule (auto-arranges by priority with buffers)
curl -X POST http://localhost:8905/schedule/optimize \
  -H "Content-Type: application/json" \
  -d '{}'
```

**When to use:**
- Break large actions into time-blocked chunks
- Use priority to manage competing tasks
- Run optimize before reviewing schedule

---

### Feature 3: Track Progress with Milestones

Setup milestone-based goal tracking:

```bash
# Step 1: Create goal (with due date and estimated hours)
curl -X POST http://localhost:8905/goals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build emotional intelligence",
    "description": "Master techniques for understanding and managing emotions",
    "category": "learning",
    "priority": 9
  }' | jq '.id' # capture goalId

# Step 2: Create milestones (breakpoints at 25%, 50%, 75%, 100%)
GOAL_ID="goal_xyz"

# Milestone 1: Foundation (25%)
curl -X POST http://localhost:8905/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "'$GOAL_ID'",
    "title": "Foundation knowledge",
    "description": "Understand emotional intelligence basics",
    "targetProgress": 25,
    "dueDate": "2025-12-10",
    "criteria": ["Read 2 books", "Watch educational videos", "Understand 5 key concepts"]
  }' | jq '.id' # capture milestoneId1

# Milestone 2: Application (50%)
curl -X POST http://localhost:8905/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "'$GOAL_ID'",
    "title": "Apply in practice",
    "description": "Use EI techniques in daily life",
    "targetProgress": 50,
    "dueDate": "2025-12-17",
    "criteria": ["Apply technique daily", "Journal insights", "Notice improvements"]
  }' | jq '.id' # capture milestoneId2

# Milestone 3: Mastery (100%)
curl -X POST http://localhost:8905/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "'$GOAL_ID'",
    "title": "Teach and share",
    "description": "Help others develop EI",
    "targetProgress": 100,
    "dueDate": "2025-12-31",
    "criteria": ["Mentor someone", "Create guide", "Lead workshop"]
  }' | jq '.id' # capture milestoneId3

# Step 3: Track progress as you work
MILESTONE_ID="milestone_xyz"
curl -X POST http://localhost:8905/milestones/update \
  -H "Content-Type: application/json" \
  -d '{
    "milestoneId": "'$MILESTONE_ID'",
    "progress": 25  # milestone completes when >= targetProgress
  }'

# Step 4: View all milestones for a goal
curl "http://localhost:8905/milestones?goalId=$GOAL_ID"

# Step 5: Record progress snapshot (stored in memory)
curl -X POST http://localhost:8905/progress/snapshot
```

**When to use:**
- Break ambitious goals into 3-5 measurable milestones
- Update progress regularly as you complete work
- Use milestones to celebrate progress and stay motivated

---

### Feature 4: Autonomous Decision-Making

Let AI choose the best action:

```bash
# Get autonomous decision for current context
curl -X POST http://localhost:8905/decision \
  -H "Content-Type: application/json" \
  -d '{}'

# Response:
# {
#   "decision": {
#     "id": "action_123",
#     "goalId": "goal_456",
#     "description": "Research emotional intelligence techniques",
#     "type": "research",
#     "status": "pending"
#   },
#   "confidence": 0.82,
#   "reasoning": "Aligns with top priority goal, feasible in 30 min available, medium energy needed"
# }
```

**How it works:**
1. Gets top-priority goal (from Feature 1)
2. Lists pending actions for that goal
3. Evaluates each action using LLM with context:
   - Time available
   - Energy level
   - Goal alignment
   - Action feasibility
4. Returns top action with confidence & reasoning

**When to use:**
- When unsure what to do next
- To delegate decision-making to AI
- To learn what factors influence good decisions

---

### Feature 5: Setup Initiative Triggers

Register conditions that trigger proactive actions:

```bash
# Trigger 1: Morning motivation
curl -X POST http://localhost:8905/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning goal-setting",
    "condition": "morning",
    "actionType": "reflect",
    "actionDescription": "Review daily goals and plan morning priorities",
    "frequency": "daily",
    "enabled": true
  }'

# Trigger 2: High energy creation
curl -X POST http://localhost:8905/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High energy creative work",
    "condition": "high energy",
    "actionType": "create",
    "actionDescription": "Create inspiring content while energy is high",
    "frequency": "daily",
    "enabled": true
  }'

# Trigger 3: Low energy rest
curl -X POST http://localhost:8905/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Low energy recovery",
    "condition": "low energy",
    "actionType": "reflect",
    "actionDescription": "Take a mindful break and reflect on progress",
    "frequency": "hourly",
    "enabled": true
  }'

# Trigger 4: Goal progress celebration
curl -X POST http://localhost:8905/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Progress celebration",
    "condition": "goal progress",
    "actionType": "communicate",
    "actionDescription": "Share recent wins with community",
    "frequency": "daily",
    "enabled": true
  }'

# View all registered triggers
curl http://localhost:8905/triggers

# Manually evaluate triggers
curl -X POST http://localhost:8905/triggers/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "context": {}  # optional additional context
  }'
```

**Supported conditions:**
- `"morning"` - Time before 12:00
- `"afternoon"` - Time 12:00 to 18:00
- `"evening"` - Time after 18:00
- `"low energy"` - Energy level < 30%
- `"high energy"` - Energy level > 70%
- `"goal progress"` - 3+ actions completed last hour
- `"mood: cheerful"` or `"happy"` - Optimistic or happy mood
- Custom context keys

**Frequency types:**
- `"once"` - Trigger only once (never again)
- `"daily"` - Once per day max
- `"hourly"` - Once per hour max
- `"on-demand"` - Every time condition met (no frequency limit)

**When to use:**
- Setup triggers for recurring patterns (morning routines)
- Use energy-based triggers to adapt to fatigue
- Create mood-based triggers for emotional support

---

## Complete Workflow Example

### Day-In-The-Life of Toobix with Autonomy Engine v2.0

```bash
#!/bin/bash

# 1. START OF DAY: Setup
echo "=== Morning Setup ==="
# Start autonomy loop
curl -X POST http://localhost:8905/start \
  -d '{"intervalMs": 300000}' # every 5 minutes for testing

# 2. GET PRIORITIZED GOALS
echo "=== Checking Goals ==="
curl http://localhost:8905/goals/prioritized | jq '.[0]'
# Returns top goal with priority score

# 3. VIEW OPTIMIZED SCHEDULE
echo "=== Getting Optimized Schedule ==="
curl -X POST http://localhost:8905/schedule/optimize | jq

# 4. AUTONOMOUS DECISION
echo "=== Getting AI Recommendation ==="
curl -X POST http://localhost:8905/decision | jq

# 5. MONITOR MILESTONES
echo "=== Checking Milestone Progress ==="
curl "http://localhost:8905/milestones?goalId=goal_mission_1" | jq '.[0]'

# 6. MID-DAY: Check if triggers fired
echo "=== Checking Initiative Triggers ==="
curl -X POST http://localhost:8905/triggers/evaluate | jq

# 7. END OF DAY: Record progress
echo "=== Recording Progress Snapshot ==="
curl -X POST http://localhost:8905/progress/snapshot | jq

# 8. DAILY REFLECTION
echo "=== Running Daily Reflection ==="
curl -X POST http://localhost:8905/reflect | jq '.reflection' | head -20

# 9. STOP AUTONOMY LOOP
echo "=== End of Day ==="
curl -X POST http://localhost:8905/stop

echo "Done! Check logs for detailed activity."
curl http://localhost:8905/log?limit=20 | jq
```

---

## Integration with Other Services

### With Memory Palace (8953)
```typescript
// Autonomy engine automatically stores:
// - Decisions made
// - Milestone achievements
// - Progress snapshots
// Use Memory Palace to query historical decisions
```

### With LLM Gateway (8954)
```typescript
// Autonomy engine uses LLM for:
// - Goal prioritization reasoning
// - Autonomous decision-making
// - Action generation from goals
// Ensure LLM Gateway is running
```

### With Event Bus (8955)
```typescript
// Autonomy engine publishes:
// - initiative_triggered events
// - milestone_progress events
// - autonomy state changes
// Listen for these events to coordinate with other services
```

---

## Database Management

### View Database
```bash
# Connect to SQLite database
sqlite3 data/autonomy-engine.db

# Useful queries:
SELECT * FROM goals WHERE status = 'active';
SELECT * FROM milestones WHERE status != 'completed';
SELECT * FROM scheduled_tasks WHERE DATE(scheduled_time) = DATE('now');
SELECT * FROM initiative_triggers WHERE enabled = 1;
SELECT * FROM prioritization_scores ORDER BY overall_score DESC LIMIT 5;
```

### Backup Database
```bash
cp data/autonomy-engine.db data/autonomy-engine.backup.db
```

### Clear Historical Data
```bash
sqlite3 data/autonomy-engine.db "DELETE FROM autonomy_log WHERE datetime(timestamp) < datetime('now', '-30 days');"
```

---

## Troubleshooting

### Issue: Goals not prioritizing correctly
**Solution:** Ensure goals have:
- `priority` field (1-10)
- `category` field (mission|learning|creation|connection|improvement)
- Optional: `due_date` and `estimated_hours_required`

### Issue: Milestones not auto-completing
**Solution:** Check that `progress >= targetProgress`. If updating progress manually, use proper format:
```bash
curl -X POST http://localhost:8905/milestones/update \
  -d '{"milestoneId": "...", "progress": 50}'
```

### Issue: Triggers not firing
**Solution:**
1. Verify trigger is enabled: `curl http://localhost:8905/triggers`
2. Check condition logic: conditions are case-sensitive
3. Verify frequency hasn't been exceeded
4. Check state.energyLevel or time matches condition

### Issue: Autonomous decisions not making sense
**Solution:**
1. Check LLM Gateway (8954) is running
2. Ensure goal has pending actions
3. Review decision reasoning in response
4. Check available context (time, energy, focus)

---

## Performance Tips

1. **Schedule Optimization**: Run `/schedule/optimize` weekly, not daily
2. **Batch Milestone Updates**: Group updates together
3. **Trigger Frequency**: Set frequency constraints carefully (daily > hourly)
4. **Database Cleanup**: Archive old logs monthly
5. **Autonomy Loop**: For production, use 10-minute interval (600,000 ms)

---

## Next Steps

1. Read `AUTONOMY-ENGINE-v2-FEATURES.md` for detailed feature documentation
2. Setup goals and milestones for your use case
3. Configure initiative triggers for your routines
4. Monitor prioritization scores for goal health
5. Check progress snapshots weekly
6. Adjust trigger conditions based on actual behavior

---

*Autonomy Engine v2.0 - Your autonomous goal-pursuit companion.*
