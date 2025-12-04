# Autonomy Engine v2.0 - Quick Reference Card

## Service Info
- **Port:** 8905
- **File:** `C:\Dev\Projects\AI\Toobix-Unified\core\autonomy-engine.ts`
- **Version:** v2.0
- **Status:** Production Ready

---

## Quick Start

```bash
# Start service
bun run core/autonomy-engine.ts

# Start autonomy loop
curl -X POST http://localhost:8905/start -d '{"intervalMs": 600000}'

# Check health
curl http://localhost:8905/health

# Stop service
curl -X POST http://localhost:8905/stop
```

---

## 5 New Features at a Glance

### 1. Goal Prioritization
```bash
# Get prioritized goals
curl http://localhost:8905/goals/prioritized

# Get priority scores
curl http://localhost:8905/prioritization
```
- Factors: urgency, importance, feasibility, impact, mission alignment
- Weights: 25%, 25%, 15%, 20%, 15%

### 2. Task Scheduling
```bash
# Schedule task
curl -X POST http://localhost:8905/schedule/task \
  -d '{"actionId":"action_xyz","scheduledTime":"2025-12-03T10:00:00Z","duration":30,"priority":8}'

# View today's schedule
curl http://localhost:8905/schedule/today

# Optimize schedule
curl -X POST http://localhost:8905/schedule/optimize
```
- Time-blocking algorithm
- Priority-based sorting
- 5-min buffers between tasks

### 3. Progress Milestones
```bash
# Create milestone
curl -X POST http://localhost:8905/milestones \
  -d '{"goalId":"goal_123","title":"Research phase","targetProgress":50,"dueDate":"2025-12-10","criteria":["Read 5 books"]}'

# Get milestones
curl "http://localhost:8905/milestones?goalId=goal_123"

# Update progress
curl -X POST http://localhost:8905/milestones/update \
  -d '{"milestoneId":"milestone_xyz","progress":50}'

# Record snapshot
curl -X POST http://localhost:8905/progress/snapshot
```
- Break goals into measurable milestones
- Auto-complete milestones
- Auto-update goal progress

### 4. Autonomous Decisions
```bash
# Get decision
curl -X POST http://localhost:8905/decision
```
- Evaluates: goal alignment, feasibility, time, energy
- Returns: action, confidence (0.0-1.0), reasoning
- Fallback: priority-based selection

### 5. Initiative Triggers
```bash
# Register trigger
curl -X POST http://localhost:8905/triggers \
  -d '{"name":"Morning motivation","condition":"morning","actionType":"reflect","actionDescription":"Daily reflection","frequency":"daily"}'

# List triggers
curl http://localhost:8905/triggers

# Evaluate triggers
curl -X POST http://localhost:8905/triggers/evaluate
```
- Conditions: morning, afternoon, evening, low/high energy, goal progress, mood
- Frequencies: once, daily, hourly, on-demand

---

## Most Used Endpoints

| What | Endpoint | Method |
|------|----------|--------|
| Check status | `/health` | GET |
| Get priorities | `/goals/prioritized` | GET |
| Today's schedule | `/schedule/today` | GET |
| Make decision | `/decision` | POST |
| Get milestones | `/milestones?goalId=X` | GET |
| Check triggers | `/triggers` | GET |
| Run loop once | `/run-once` | POST |
| View logs | `/log?limit=50` | GET |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `goals` | Store goals |
| `actions` | Store actions |
| `milestones` | Store milestones (NEW) |
| `scheduled_tasks` | Store scheduled tasks (NEW) |
| `initiative_triggers` | Store triggers (NEW) |
| `prioritization_scores` | Store priority scores (NEW) |
| `daily_plans` | Store daily plans |
| `learning_insights` | Store insights |
| `autonomy_log` | Store activity log |

---

## Common Workflows

### Setup New Goal with Milestones
```bash
# Create goal
GOAL=$(curl -X POST http://localhost:8905/goals \
  -d '{"title":"Learn X","priority":8}' | jq -r '.id')

# Create milestone 1 (25%)
M1=$(curl -X POST http://localhost:8905/milestones \
  -d "{\"goalId\":\"$GOAL\",\"title\":\"Foundation\",\"targetProgress\":25,\"dueDate\":\"2025-12-10\"}" | jq -r '.id')

# Create milestone 2 (50%)
M2=$(curl -X POST http://localhost:8905/milestones \
  -d "{\"goalId\":\"$GOAL\",\"title\":\"Application\",\"targetProgress\":50,\"dueDate\":\"2025-12-20\"}" | jq -r '.id')

# Update as you progress
curl -X POST http://localhost:8905/milestones/update \
  -d "{\"milestoneId\":\"$M1\",\"progress\":25}"
```

### Setup Proactive Triggers
```bash
# Morning routine
curl -X POST http://localhost:8905/triggers \
  -d '{"name":"Morning","condition":"morning","actionType":"reflect","actionDescription":"Daily goals review","frequency":"daily"}'

# Creative work
curl -X POST http://localhost:8905/triggers \
  -d '{"name":"Creativity","condition":"high energy","actionType":"create","actionDescription":"Create content","frequency":"daily"}'

# Rest when tired
curl -X POST http://localhost:8905/triggers \
  -d '{"name":"Rest","condition":"low energy","actionType":"reflect","actionDescription":"Take break","frequency":"hourly"}'
```

### Daily Check-In
```bash
# Morning
curl http://localhost:8905/goals/prioritized | head
curl -X POST http://localhost:8905/schedule/optimize

# Afternoon
curl -X POST http://localhost:8905/decision | jq '.reasoning'

# Evening
curl -X POST http://localhost:8905/progress/snapshot
curl -X POST http://localhost:8905/reflect | jq '.reflection'
```

---

## Prioritization Formula

```
Score = (Urgency × 0.25) + (Importance × 0.25) +
        (Feasibility × 0.15) + (Impact × 0.20) +
        (Mission Alignment × 0.15)

Urgency: 11 - days_until_due (capped 1-10)
Importance: goal.priority (1-10)
Feasibility: based on progress + estimated hours
Impact: 9 for mission, 8 for creation/connection, 7 for learning, 5 default
Mission Alignment: 10 for mission, 8 for creation/connection, 5 default
```

---

## Trigger Conditions

| Condition | Matches |
|-----------|---------|
| `morning` | Time before 12:00 |
| `afternoon` | Time 12:00-18:00 |
| `evening` | Time after 18:00 |
| `low energy` | Energy < 30% |
| `high energy` | Energy > 70% |
| `goal progress` | 3+ actions last hour |
| `mood: cheerful` | mood = optimistic/happy |

---

## Data Models at a Glance

### Goal
```typescript
{
  id: string
  title: string
  description: string
  category: 'mission'|'learning'|'creation'|'connection'|'improvement'
  priority: 1-10
  progress: 0-100
  status: 'active'|'completed'|'paused'|'abandoned'
  dueDate?: Date
  estimatedHoursRequired?: number
}
```

### Milestone
```typescript
{
  id: string
  goalId: string
  title: string
  description: string
  targetProgress: 0-100
  currentProgress: 0-100
  dueDate: Date
  status: 'pending'|'in_progress'|'completed'
  criteria: string[]
}
```

### ScheduledTask
```typescript
{
  id: string
  actionId: string
  scheduledTime: Date
  duration: minutes
  priority: 1-10
  status: 'scheduled'|'in_progress'|'completed'|'skipped'|'rescheduled'
}
```

### PrioritizationScore
```typescript
{
  goalId: string
  urgency: 1-10
  importance: 1-10
  feasibility: 1-10
  impact: 1-10
  alignmentWithMission: 1-10
  overallScore: 0-10
  reasoning: string
}
```

### InitiativeTrigger
```typescript
{
  id: string
  name: string
  condition: string
  actionType: 'research'|'create'|'communicate'|'learn'|'reflect'|'post'
  actionDescription: string
  frequency: 'once'|'daily'|'hourly'|'on-demand'
  lastTriggeredAt?: Date
  enabled: boolean
}
```

---

## Error Codes

| Code | Message | Fix |
|------|---------|-----|
| 400 | goalId required | Add goalId query param |
| 400 | No decision available | Create pending actions |
| 404 | Not found | Check endpoint path |
| 500 | Server error | Check logs |

---

## Useful Queries

```bash
# Get top goal
curl http://localhost:8905/goals/prioritized | jq '.[0]'

# Get uncompleted milestones
curl "http://localhost:8905/milestones?goalId=GOAL_ID" | jq '.[] | select(.status != "completed")'

# Get this week's due milestones
curl "http://localhost:8905/milestones?goalId=GOAL_ID" | jq '.[] | select(.dueDate < "2025-12-10")'

# Get pending actions
curl "http://localhost:8905/actions?status=pending" | jq

# Get recent logs
curl "http://localhost:8905/log?limit=20" | jq

# Check which triggers are active
curl http://localhost:8905/triggers | jq '.[] | select(.enabled == 1)'
```

---

## Performance Tips

1. Run autonomy loop every 10 minutes (production)
2. Optimize schedule weekly, not daily
3. Create 3-5 milestones per goal
4. Set trigger frequency carefully (daily > hourly)
5. Archive logs monthly for performance
6. Use prioritized goals for decision-making

---

## Integration Points

**With other services:**
- **LLM Gateway (8954)**: For autonomous decisions & reasoning
- **Memory Palace (8953)**: For storing insights & decisions
- **Event Bus (8955)**: For publishing autonomy events
- **Twitter Autonomy (8965)**: For posting actions

---

## Useful Commands

```bash
# Full daily routine
bun run core/autonomy-engine.ts &
curl -X POST http://localhost:8905/start
curl http://localhost:8905/goals/prioritized | head -1
curl -X POST http://localhost:8905/schedule/optimize
curl -X POST http://localhost:8905/decision
# ... work throughout day ...
curl -X POST http://localhost:8905/progress/snapshot
curl -X POST http://localhost:8905/reflect
curl -X POST http://localhost:8905/stop

# Backup
cp data/autonomy-engine.db data/autonomy-engine.backup.db

# View database
sqlite3 data/autonomy-engine.db "SELECT * FROM goals;"
```

---

## Troubleshooting

**Goals not prioritizing?** → Check they have priority & category fields

**Milestones not completing?** → Ensure progress >= targetProgress

**Triggers not firing?** → Check trigger is enabled & condition matches

**No decision available?** → Create pending actions for active goals

**Schedule optimization?** → Only runs if tasks exist for today

---

## Documentation Files

| File | Purpose |
|------|---------|
| `autonomy-engine.ts` | Full source code |
| `AUTONOMY-ENGINE-v2-FEATURES.md` | Feature deep-dive |
| `AUTONOMY-ENGINE-v2-INTEGRATION-GUIDE.md` | Integration examples |
| `AUTONOMY-ENGINE-v2-API-REFERENCE.md` | Complete API docs |
| `AUTONOMY-ENGINE-v2-QUICK-REFERENCE.md` | This file |

---

## Next Steps

1. Start the service: `bun run core/autonomy-engine.ts`
2. Read AUTONOMY-ENGINE-v2-FEATURES.md for details
3. Setup your first goal with milestones
4. Register initiative triggers
5. Check `/goals/prioritized` daily
6. Review `/progress/snapshot` weekly

---

*Autonomy Engine v2.0 - Quick Reference*
*Last Updated: 2025-12-03*
