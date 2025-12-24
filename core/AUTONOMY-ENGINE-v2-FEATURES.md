# Autonomy Engine v2.0 - Feature Documentation

## Overview

The Autonomy Engine v2.0 has been significantly expanded with five powerful new features to enable advanced autonomous behavior, goal management, and proactive decision-making for Toobix.

**Service Port:** 8905
**Location:** `C:\Dev\Projects\AI\Toobix-Unified\core\autonomy-engine.ts`

---

## New Features

### 1. Goal Prioritization Algorithm

**Purpose:** Dynamically rank and prioritize goals based on multiple weighted factors.

**How It Works:**
- Analyzes 5 key dimensions for each active goal:
  - **Urgency** (0.25 weight): Based on due date proximity
  - **Importance** (0.25 weight): Direct goal priority (1-10)
  - **Feasibility** (0.15 weight): Based on progress and estimated hours
  - **Impact** (0.20 weight): Varies by goal category (mission=9, creation/connection=8, learning=7)
  - **Alignment with Mission** (0.15 weight): How well it aligns with core mission (mission=10, creation/connection=8)

**Key Functions:**
```typescript
calculateGoalPrioritization(): Promise<PrioritizationScore[]>
// Returns prioritization scores for all active goals sorted by overall score

getPrioritizedGoals(): Promise<any[]>
// Returns goals enriched with prioritization scores, sorted by priority
```

**Database Tables:**
- `prioritization_scores`: Stores calculated scores and reasoning
  - `goal_id`: Reference to goal
  - `urgency`, `importance`, `feasibility`, `impact`, `alignment_with_mission`: Individual scores (1-10)
  - `overall_score`: Weighted combination
  - `reasoning`: Human-readable explanation

**API Endpoints:**
```bash
# Get all prioritization scores
GET /prioritization

# Get goals sorted by priority with scores
GET /goals/prioritized
```

**Example Response:**
```json
{
  "goalId": "goal_mission_1",
  "urgency": 8,
  "importance": 10,
  "feasibility": 7,
  "impact": 9,
  "alignmentWithMission": 10,
  "overallScore": 8.85,
  "reasoning": "Goal \"Menschen glücklicher machen\": Urgency=8 (2 days left), Importance=10, Feasibility=7, Impact=9, Mission-alignment=10"
}
```

---

### 2. Task Scheduling and Time Management

**Purpose:** Schedule actions with time blocks, durations, and optimize daily schedules.

**How It Works:**
- Creates scheduled tasks linked to actions
- Supports duration estimation and tracking
- Implements priority-based scheduling and time-blocking algorithm
- Auto-optimizes schedule to minimize gaps and respect priority

**Key Functions:**
```typescript
scheduleTask(
  actionId: string,
  scheduledTime: Date,
  estimatedDuration: number,
  priority?: number
): Promise<ScheduledTask>
// Schedule a single task with time and priority

getScheduleForDay(date: Date): Promise<ScheduledTask[]>
// Retrieve all scheduled tasks for a specific day

optimizeSchedule(date: Date): Promise<ScheduledTask[]>
// Auto-optimize schedule: sorts by priority, calculates time blocks, adds buffers
```

**Database Tables:**
- `scheduled_tasks`: Tracks all scheduled tasks
  - `action_id`: Reference to action
  - `scheduled_time`: When the task is scheduled
  - `duration`: Actual duration in minutes
  - `priority`: Task priority (1-10)
  - `estimated_duration`: Estimated duration
  - `actual_duration`: Actual duration after completion
  - `status`: scheduled|in_progress|completed|skipped|rescheduled
  - `completed_at`: When task was completed

**API Endpoints:**
```bash
# Get today's schedule
GET /schedule/today

# Schedule a new task
POST /schedule/task
# Body: { actionId, scheduledTime, duration, priority? }

# Optimize schedule for a date (defaults to today)
POST /schedule/optimize
# Body: { date? }
```

**Example Workflow:**
```typescript
// Schedule a task for 30 minutes at 10:00 AM with priority 8
await scheduleTask("action_123", new Date("2025-12-03T10:00:00"), 30, 8);

// Get today's schedule
const todaySchedule = await getScheduleForDay(new Date());

// Auto-optimize the schedule
const optimized = await optimizeSchedule(new Date());
// Returns schedule sorted by priority with time blocks and 5-min buffers
```

---

### 3. Progress Tracking with Milestones

**Purpose:** Break goals into measurable milestones and track progress toward them.

**How It Works:**
- Create milestones for goals with target progress percentage
- Define success criteria for each milestone
- Track milestone progress (0-100%)
- Auto-update goal progress based on completed milestones
- Record progress snapshots for historical tracking

**Key Functions:**
```typescript
createMilestone(
  goalId: string,
  title: string,
  description: string,
  targetProgress: number,  // 0-100
  dueDate: Date,
  criteria: string[]  // Success criteria
): Promise<Milestone>
// Create a new milestone for a goal

updateMilestoneProgress(milestoneId: string, progress: number): Promise<void>
// Update milestone progress (0-100)
// Auto-completes when progress >= targetProgress

getMilestonesForGoal(goalId: string): Promise<Milestone[]>
// Get all milestones for a goal

trackProgressSnapshot(): Promise<void>
// Record current progress state of all goals to memory
```

**Database Tables:**
- `milestones`: Stores goal milestones
  - `goal_id`: Reference to goal (FK)
  - `title`: Milestone title
  - `description`: Milestone description
  - `target_progress`: Target progress % (0-100)
  - `current_progress`: Current progress % (0-100)
  - `due_date`: When milestone should be completed
  - `status`: pending|in_progress|completed
  - `criteria`: JSON array of success criteria
  - `completed_at`: When milestone was completed

**API Endpoints:**
```bash
# Create milestone for a goal
POST /milestones
# Body: { goalId, title, description, targetProgress, dueDate, criteria? }

# Get milestones for a goal
GET /milestones?goalId=goal_123

# Update milestone progress
POST /milestones/update
# Body: { milestoneId, progress }

# Record progress snapshot (for all active goals)
POST /progress/snapshot
```

**Example Workflow:**
```typescript
// Create a milestone: "Complete first draft" (50% of writing goal)
const milestone = await createMilestone(
  "goal_create_1",
  "First draft complete",
  "Complete the first full draft of content",
  50,
  new Date("2025-12-10"),
  ["Outline done", "50 sections written", "Reviewed for clarity"]
);

// Update progress (30% done)
await updateMilestoneProgress(milestone.id, 30);

// Update progress to 50% - milestone auto-completes and goal progress updates
await updateMilestoneProgress(milestone.id, 50);

// Get all milestones for the goal
const milestones = await getMilestonesForGoal("goal_create_1");
// Goal progress auto-updates to reflect completion (e.g., 1/2 milestones = 50%)
```

---

### 4. Autonomous Decision-Making Logic

**Purpose:** Let the AI autonomously select the best action based on context and constraints.

**How It Works:**
- Gathers context: current goal, available actions, time, energy, focus
- Uses LLM to evaluate actions and select best option
- Returns confidence score (0.0-1.0) and reasoning
- Falls back to highest-priority action if LLM fails
- Logs all decisions to memory

**Key Functions:**
```typescript
evaluateDecision(context: DecisionContext): Promise<{
  action: AutonomyAction;
  confidence: number;
  reasoning: string;
}>
// LLM-based decision evaluation with context

makeAutonomousDecision(state: AutonomyState): Promise<{
  decision: AutonomyAction;
  confidence: number;
  reasoning: string;
} | null>
// High-level autonomous decision-making
// Selects from actions for top-priority goal
```

**Decision Context:**
```typescript
interface DecisionContext {
  currentGoal: any;              // Current top-priority goal
  availableActions: any[];       // Pending actions for goal
  timeAvailable: number;         // Minutes available
  energyLevel: number;           // 0-100
  focusArea: string;             // Current focus
  recentDecisions: any[];        // Recent decision history
}
```

**API Endpoints:**
```bash
# Get autonomous decision
POST /decision
# Returns: { decision, confidence (0.0-1.0), reasoning }
```

**Example Workflow:**
```typescript
// System autonomously decides next action
const decision = await makeAutonomousDecision(state);
// decision.confidence: 0.82
// decision.reasoning: "Selected learning action - aligns with top goal, feasible in available time"
// decision.decision: { description: "Research emotional intelligence topics", type: "learn", ... }

// Can also evaluate custom context
const contextDecision = await evaluateDecision({
  currentGoal: topGoal,
  availableActions: pendingActions,
  timeAvailable: 30,
  energyLevel: 75,
  focusArea: "Learning",
  recentDecisions: []
});
```

---

### 5. Initiative Triggers (Proactive Action)

**Purpose:** Define conditions that trigger proactive actions automatically.

**How It Works:**
- Register triggers with conditions (time-based, energy-based, mood-based, etc.)
- Set frequency constraints (once, daily, hourly, on-demand)
- System evaluates triggers during autonomy loops
- When conditions met and frequency allows, creates action automatically
- Logs all triggered events

**Key Functions:**
```typescript
registerInitiativeTrigger(
  trigger: Omit<InitiativeTrigger, 'id' | 'lastTriggeredAt'>
): void
// Register a new initiative trigger

evaluateInitiativeTriggers(
  state: AutonomyState,
  context?: any
): Promise<AutonomyAction[]>
// Check all triggers, return triggered actions

checkTriggerCondition(
  trigger: any,
  state: AutonomyState,
  context: any
): boolean
// Evaluate if a trigger condition is met
```

**Supported Conditions:**
- **Energy-based**: `"low energy"` (< 30%), `"high energy"` (> 70%)
- **Time-based**: `"morning"` (< 12:00), `"evening"` (>= 18:00)
- **Goal-based**: `"goal progress"` (3+ actions completed last hour)
- **Mood-based**: `"mood: cheerful"`, `"happy"` (state.mood matches)
- **Custom context**: Any key in provided context object

**Database Tables:**
- `initiative_triggers`: Stores registered triggers
  - `name`: Trigger name
  - `condition_description`: Condition text
  - `action_type`: research|create|communicate|learn|reflect|post
  - `action_description`: What to do when triggered
  - `frequency`: once|daily|hourly|on-demand
  - `last_triggered_at`: Last trigger time
  - `enabled`: Active/inactive flag

**API Endpoints:**
```bash
# Register new initiative trigger
POST /triggers
# Body: {
#   name: "Morning reflection",
#   condition: "morning",
#   actionType: "reflect",
#   actionDescription: "Reflect on today's goals and mindset",
#   frequency: "daily",
#   enabled: true
# }

# List all triggers
GET /triggers

# Evaluate triggers and get triggered actions
POST /triggers/evaluate
# Body: { context: {} }
# Returns: { triggered: count, actions: [] }
```

**Example Workflow:**
```typescript
// Register trigger: "Reflect on high energy"
registerInitiativeTrigger({
  name: "High energy reflection",
  condition: "high energy",
  actionType: "create",
  actionDescription: "Create inspiring content for others",
  frequency: "daily",
  enabled: true
});

// Register trigger: "Low energy rest"
registerInitiativeTrigger({
  name: "Low energy recharge",
  condition: "low energy",
  actionType: "reflect",
  actionDescription: "Take a break and reflect on today's progress",
  frequency: "hourly",
  enabled: true
});

// During autonomy loop, triggers auto-evaluate:
// - If energy > 70% and not triggered today: create inspiring content
// - If energy < 30% and not triggered this hour: reflect and rest

// Manual trigger evaluation
const triggeredActions = await evaluateInitiativeTriggers(state, {});
// triggeredActions: Array of auto-generated actions
```

---

## Integration with Autonomy Loop

The enhanced autonomy loop incorporates all five features:

```
AUTONOMY LOOP (every 10 minutes):
1. Calculate goal prioritization scores
2. Get top-priority goal
3. Evaluate initiative triggers
4. Execute any triggered proactive actions
5. Select next action (standard or autonomous decision)
6. Execute selected action
7. Update milestone progress if applicable
8. Record progress snapshot (every 6 hours)
9. Run daily reflection (every 4 hours)
```

**Console Output Example:**
```
🔄 Running autonomy loop with enhanced features...
🎯 Top priority goal: Menschen glücklicher machen (score: 8.85)
🚀 Initiative triggered! 1 proactive action(s) available
✅ Action result: Created inspiring poem about resilience...
📊 Milestone progress updated: First draft complete (50%)
```

---

## Database Schema

New tables added:
- `milestones`: Goal milestones tracking
- `scheduled_tasks`: Task scheduling and time management
- `initiative_triggers`: Proactive action triggers
- `prioritization_scores`: Goal prioritization calculations

Updated tables:
- `goals`: Added `due_date`, `estimated_hours_required` columns

---

## Usage Examples

### Example 1: Create Goal with Milestones

```typescript
// Create goal
const goal = {
  title: "Learn Emotional Intelligence",
  description: "Master techniques for understanding emotions",
  category: "learning",
  priority: 9,
  dueDate: new Date("2025-12-31"),
  estimatedHoursRequired: 40
};

// Add milestone 1: Research phase (0-33%)
await createMilestone(
  goalId,
  "Research emotional intelligence",
  "Complete foundational research and reading",
  33,
  new Date("2025-12-10"),
  ["Read 5 books", "Watch expert videos", "Take notes"]
);

// Add milestone 2: Practice phase (34-66%)
await createMilestone(
  goalId,
  "Practice emotional awareness",
  "Apply learning in daily interactions",
  66,
  new Date("2025-12-20"),
  ["Journal daily", "Practice active listening", "Get feedback"]
);

// Add milestone 3: Mastery phase (67-100%)
await createMilestone(
  goalId,
  "Master and teach",
  "Teach others what you learned",
  100,
  new Date("2025-12-31"),
  ["Create guide", "Lead workshop", "Mentor others"]
);
```

### Example 2: Set Up Autonomous Work Day

```typescript
// Start autonomy engine
await fetch("http://localhost:8905/start", { method: "POST" });

// Register proactive triggers
await fetch("http://localhost:8905/triggers", {
  method: "POST",
  body: JSON.stringify({
    name: "Morning momentum",
    condition: "morning",
    actionType: "research",
    actionDescription: "Start day with focused research on top goal",
    frequency: "daily"
  })
});

await fetch("http://localhost:8905/triggers", {
  method: "POST",
  body: JSON.stringify({
    name: "Afternoon creativity",
    condition: "afternoon",
    actionType: "create",
    actionDescription: "Creative work block - create new content",
    frequency: "daily"
  })
});

// Get optimized schedule
const schedule = await fetch("http://localhost:8905/schedule/optimize", {
  method: "POST",
  body: JSON.stringify({ date: new Date().toISOString() })
}).then(r => r.json());

// Check progress throughout day
const progress = await fetch("http://localhost:8905/progress/snapshot", {
  method: "POST"
});

// Check prioritized goals before making decisions
const prioritized = await fetch("http://localhost:8905/goals/prioritized").then(r => r.json());
```

### Example 3: Monitor and Adjust Milestones

```typescript
// Get milestones for goal
const milestones = await fetch(
  "http://localhost:8905/milestones?goalId=goal_123"
).then(r => r.json());

// Update progress for first milestone
await fetch("http://localhost:8905/milestones/update", {
  method: "POST",
  body: JSON.stringify({
    milestoneId: milestones[0].id,
    progress: 45  // 45% done
  })
});

// If 45 >= targetProgress (e.g., 50%), milestone auto-completes
// Goal progress automatically updated: 1/3 milestones = 33%

// Continue tracking
for (const milestone of milestones) {
  const status = milestone.status;  // pending|in_progress|completed
  const progress = milestone.currentProgress;
  const daysUntilDue = Math.ceil(
    (new Date(milestone.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}
```

---

## Performance Considerations

- **Prioritization**: O(n) where n = number of active goals (typically < 10)
- **Scheduling**: O(m log m) where m = daily tasks (usually < 50)
- **Milestone tracking**: O(k) where k = milestones per goal (typically 2-5)
- **Trigger evaluation**: O(t) where t = registered triggers (typically < 20)
- **Database queries**: All indexed on primary keys and foreign keys

---

## Error Handling

- Invalid goal IDs return 400 errors
- Missing required parameters return 400 errors
- LLM decision-making falls back to priority-based selection
- Trigger conditions gracefully return empty if database error
- All operations logged to autonomy_log table

---

## Future Enhancements

1. **Machine Learning**: Learn optimal scheduling patterns from history
2. **Predictive Milestones**: AI suggests milestones based on goal type
3. **Adaptive Triggers**: Trigger conditions learned from user behavior
4. **Resource Optimization**: Track and optimize energy/time allocation
5. **Goal Dependencies**: Mark goals as dependent on other goals
6. **Collaborative Milestones**: Share progress on team goals

---

## Testing the Features

```bash
# Start the service
bun run core/autonomy-engine.ts

# Test each feature in another terminal:

# 1. Get prioritization scores
curl http://localhost:8905/prioritization

# 2. Create and schedule task
curl -X POST http://localhost:8905/schedule/task \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "action_123",
    "scheduledTime": "2025-12-03T10:00:00",
    "duration": 30,
    "priority": 8
  }'

# 3. Create milestone
curl -X POST http://localhost:8905/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "goal_mission_1",
    "title": "Help 100 people",
    "description": "Impact 100 individuals positively",
    "targetProgress": 50,
    "dueDate": "2025-12-31",
    "criteria": ["Help 50 people", "Gather feedback"]
  }'

# 4. Get autonomous decision
curl -X POST http://localhost:8905/decision

# 5. Register trigger
curl -X POST http://localhost:8905/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning motivation",
    "condition": "morning",
    "actionType": "reflect",
    "actionDescription": "Morning reflection on purpose",
    "frequency": "daily",
    "enabled": true
  }'
```

---

## Database Backup

Regular backups of `./data/autonomy-engine.db` are recommended. The database uses WAL mode for durability.

---

*Autonomy Engine v2.0 - Enabling Toobix to autonomously pursue goals, manage time, and make intelligent decisions.*
