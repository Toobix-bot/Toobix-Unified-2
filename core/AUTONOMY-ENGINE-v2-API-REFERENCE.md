# Autonomy Engine v2.0 - Complete API Reference

Base URL: `http://localhost:8905`

---

## Table of Contents

1. [Health & State Endpoints](#health--state-endpoints)
2. [Goal Management](#goal-management)
3. [Feature 1: Goal Prioritization](#feature-1-goal-prioritization)
4. [Feature 2: Task Scheduling](#feature-2-task-scheduling)
5. [Feature 3: Milestones & Progress](#feature-3-milestones--progress)
6. [Feature 4: Autonomous Decisions](#feature-4-autonomous-decisions)
7. [Feature 5: Initiative Triggers](#feature-5-initiative-triggers)
8. [Core Features](#core-features)
9. [Error Handling](#error-handling)

---

## Health & State Endpoints

### GET /health
Returns service health and status.

**Response:**
```json
{
  "status": "online",
  "service": "Autonomy Engine v2.0",
  "port": 8905,
  "state": {
    "isActive": true,
    "currentGoal": "goal_mission_1",
    "currentAction": "action_xyz",
    "lastActivity": "2025-12-03T14:30:45.123Z",
    "totalActionsToday": 5,
    "mood": "optimistic",
    "energyLevel": 75,
    "focus": "Menschen helfen"
  },
  "goalsCount": 5
}
```

---

### GET /state
Returns current autonomy engine state.

**Response:**
```json
{
  "isActive": true,
  "currentGoal": "goal_xyz",
  "currentAction": "action_xyz",
  "lastActivity": "2025-12-03T14:30:45.123Z",
  "totalActionsToday": 5,
  "mood": "optimistic",
  "energyLevel": 75,
  "focus": "Learning"
}
```

---

## Goal Management

### GET /goals
Returns all goals.

**Query Parameters:**
- None

**Response:**
```json
[
  {
    "id": "goal_mission_1",
    "title": "Menschen glücklicher machen",
    "description": "Jeden Tag mindestens einem Menschen helfen",
    "category": "mission",
    "priority": 10,
    "progress": 45,
    "status": "active",
    "created_at": "2025-11-20T10:00:00Z",
    "completed_at": null,
    "sub_goals": "[]",
    "reflections": "[]",
    "due_date": "2025-12-31",
    "estimated_hours_required": 100
  }
]
```

---

### POST /goals
Create a new goal.

**Request Body:**
```json
{
  "title": "Learn TypeScript",
  "description": "Master TypeScript for better code",
  "category": "learning",
  "priority": 7,
  "dueDate": "2025-12-31",
  "estimatedHoursRequired": 40
}
```

**Response:**
```json
{
  "id": "goal_abc123",
  "created": true
}
```

---

## Feature 1: Goal Prioritization

### GET /prioritization
Get prioritization scores for all active goals.

**Response:**
```json
[
  {
    "goalId": "goal_mission_1",
    "urgency": 8,
    "importance": 10,
    "feasibility": 7,
    "impact": 9,
    "alignmentWithMission": 10,
    "overallScore": 8.85,
    "reasoning": "Goal \"Menschen glücklicher machen\": Urgency=8 (2 days left), Importance=10, Feasibility=7, Impact=9, Mission-alignment=10"
  },
  {
    "goalId": "goal_learn_1",
    "urgency": 6,
    "importance": 9,
    "feasibility": 8,
    "impact": 7,
    "alignmentWithMission": 8,
    "overallScore": 7.65,
    "reasoning": "..."
  }
]
```

**Scoring Formula:**
```
overallScore = (urgency × 0.25) + (importance × 0.25) + (feasibility × 0.15) + (impact × 0.20) + (alignmentWithMission × 0.15)
```

---

### GET /goals/prioritized
Get goals sorted by priority with prioritization scores.

**Response:**
```json
[
  {
    "id": "goal_mission_1",
    "title": "Menschen glücklicher machen",
    "priority": 10,
    "progress": 45,
    "status": "active",
    "prioritizationScore": {
      "urgency": 8,
      "importance": 10,
      "feasibility": 7,
      "impact": 9,
      "alignmentWithMission": 10,
      "overallScore": 8.85,
      "reasoning": "..."
    }
  }
]
```

---

## Feature 2: Task Scheduling

### GET /schedule/today
Get all scheduled tasks for today.

**Response:**
```json
[
  {
    "id": "task_123",
    "actionId": "action_abc",
    "scheduledTime": "2025-12-03T10:00:00Z",
    "duration": 30,
    "priority": 8,
    "estimatedDuration": 30,
    "actualDuration": null,
    "status": "scheduled",
    "completedAt": null
  },
  {
    "id": "task_124",
    "actionId": "action_def",
    "scheduledTime": "2025-12-03T10:35:00Z",
    "duration": 45,
    "priority": 7,
    "estimatedDuration": 45,
    "actualDuration": 42,
    "status": "completed",
    "completedAt": "2025-12-03T11:17:00Z"
  }
]
```

---

### POST /schedule/task
Schedule a new task.

**Request Body:**
```json
{
  "actionId": "action_xyz",
  "scheduledTime": "2025-12-03T10:00:00Z",
  "duration": 30,
  "priority": 8
}
```

**Parameters:**
- `actionId` (required): ID of action to schedule
- `scheduledTime` (required): ISO 8601 datetime
- `duration` (required): Duration in minutes
- `priority` (optional): Priority 1-10 (default: 5)

**Response:**
```json
{
  "id": "task_xyz",
  "actionId": "action_xyz",
  "scheduledTime": "2025-12-03T10:00:00Z",
  "duration": 30,
  "priority": 8,
  "estimatedDuration": 30,
  "status": "scheduled"
}
```

---

### POST /schedule/optimize
Optimize schedule for a date (sorts by priority, adds time blocks and buffers).

**Request Body:**
```json
{
  "date": "2025-12-03"
}
```

**Parameters:**
- `date` (optional): Date to optimize (default: today)

**Response:**
```json
[
  {
    "id": "task_123",
    "actionId": "action_abc",
    "scheduledTime": "2025-12-03T08:00:00Z",
    "duration": 30,
    "priority": 10,
    "estimatedDuration": 30,
    "status": "scheduled"
  },
  {
    "id": "task_124",
    "actionId": "action_def",
    "scheduledTime": "2025-12-03T08:35:00Z",
    "duration": 45,
    "priority": 8,
    "estimatedDuration": 45,
    "status": "scheduled"
  }
]
```

**Algorithm:**
1. Sort tasks by priority (descending)
2. Assign time blocks starting at 08:00
3. Add 5-minute buffer between tasks
4. Update scheduled_time in database

---

## Feature 3: Milestones & Progress

### POST /milestones
Create a milestone for a goal.

**Request Body:**
```json
{
  "goalId": "goal_123",
  "title": "Research phase complete",
  "description": "Complete foundational research and reading",
  "targetProgress": 33,
  "dueDate": "2025-12-10",
  "criteria": ["Read 5 books", "Watch 10 videos", "Take notes"]
}
```

**Parameters:**
- `goalId` (required): Goal ID
- `title` (required): Milestone title
- `description` (required): Milestone description
- `targetProgress` (required): Target progress percentage (0-100)
- `dueDate` (required): Due date (ISO 8601)
- `criteria` (optional): Array of success criteria

**Response:**
```json
{
  "id": "milestone_xyz",
  "goalId": "goal_123",
  "title": "Research phase complete",
  "description": "Complete foundational research and reading",
  "targetProgress": 33,
  "currentProgress": 0,
  "dueDate": "2025-12-10T00:00:00Z",
  "status": "pending",
  "criteria": ["Read 5 books", "Watch 10 videos", "Take notes"]
}
```

---

### GET /milestones
Get milestones for a goal.

**Query Parameters:**
- `goalId` (required): Goal ID

**Response:**
```json
[
  {
    "id": "milestone_1",
    "goalId": "goal_123",
    "title": "Research phase",
    "description": "Foundation research",
    "targetProgress": 33,
    "currentProgress": 25,
    "dueDate": "2025-12-10T00:00:00Z",
    "status": "in_progress",
    "criteria": ["Read 5 books", "Watch videos", "Take notes"],
    "completedAt": null
  },
  {
    "id": "milestone_2",
    "goalId": "goal_123",
    "title": "Application phase",
    "description": "Apply learning",
    "targetProgress": 66,
    "currentProgress": 0,
    "dueDate": "2025-12-20T00:00:00Z",
    "status": "pending",
    "criteria": ["Apply daily", "Journal insights"],
    "completedAt": null
  }
]
```

---

### POST /milestones/update
Update milestone progress.

**Request Body:**
```json
{
  "milestoneId": "milestone_xyz",
  "progress": 50
}
```

**Parameters:**
- `milestoneId` (required): Milestone ID
- `progress` (required): Progress percentage (0-100)

**Behavior:**
- If `progress >= targetProgress`: milestone auto-completes
- Goal progress auto-updates based on completed milestones
- Event published: `milestone_progress`

**Response:**
```json
{
  "updated": true
}
```

---

### POST /progress/snapshot
Record progress snapshot for all active goals.

Stores progress state to memory palace for historical tracking.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "snapshot": true
}
```

---

## Feature 4: Autonomous Decisions

### POST /decision
Get autonomous decision for next action.

Uses goal prioritization and autonomous decision-making to select best action.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "decision": {
    "id": "action_xyz",
    "goalId": "goal_abc",
    "description": "Research emotional intelligence techniques",
    "type": "research",
    "status": "pending"
  },
  "confidence": 0.82,
  "reasoning": "Selected research action - aligns with top goal (Menschen glücklicher machen), feasible within 30 minutes available, medium energy requirement matches current state"
}
```

**How it works:**
1. Gets top prioritized goal
2. Lists pending actions for that goal
3. Uses LLM to evaluate each action based on:
   - Goal alignment
   - Feasibility
   - Time constraints
   - Energy level
   - Focus area
4. Returns selected action with confidence (0.0-1.0)
5. Falls back to priority-based selection if LLM fails

---

## Feature 5: Initiative Triggers

### POST /triggers
Register a new initiative trigger.

**Request Body:**
```json
{
  "name": "Morning motivation",
  "condition": "morning",
  "actionType": "reflect",
  "actionDescription": "Reflect on purpose and daily goals",
  "frequency": "daily",
  "enabled": true
}
```

**Parameters:**
- `name` (required): Trigger name
- `condition` (required): Trigger condition (see [Trigger Conditions](#trigger-conditions))
- `actionType` (required): Action type (research|create|communicate|learn|reflect|post)
- `actionDescription` (required): What to do when triggered
- `frequency` (required): Frequency (once|daily|hourly|on-demand)
- `enabled` (optional): Is trigger enabled? (default: true)

**Response:**
```json
{
  "created": true
}
```

---

### GET /triggers
List all initiative triggers.

**Response:**
```json
[
  {
    "id": "trigger_1",
    "name": "Morning motivation",
    "condition_description": "morning",
    "action_type": "reflect",
    "action_description": "Reflect on purpose and daily goals",
    "frequency": "daily",
    "last_triggered_at": "2025-12-03T06:00:00Z",
    "enabled": 1,
    "created_at": "2025-12-01T10:00:00Z"
  }
]
```

---

### POST /triggers/evaluate
Evaluate all triggers and get triggered actions.

**Request Body:**
```json
{
  "context": {}
}
```

**Parameters:**
- `context` (optional): Additional context for condition evaluation

**Response:**
```json
{
  "triggered": 2,
  "actions": [
    {
      "id": "action_123",
      "goalId": "",
      "description": "Reflect on purpose and daily goals",
      "type": "reflect",
      "status": "pending"
    },
    {
      "id": "action_124",
      "goalId": "",
      "description": "Create inspiring content while energy is high",
      "type": "create",
      "status": "pending"
    }
  ]
}
```

---

### Trigger Conditions

**Built-in Conditions:**

| Condition | Matches | Notes |
|-----------|---------|-------|
| `"morning"` | Time < 12:00 | Start of day |
| `"afternoon"` | Time 12:00-18:00 | Midday |
| `"evening"` | Time >= 18:00 | End of day |
| `"low energy"` | energyLevel < 30% | Fatigue |
| `"high energy"` | energyLevel > 70% | Peak energy |
| `"goal progress"` | 3+ actions completed last hour | Active progress |
| `"mood: cheerful"` | mood === "optimistic" \| "happy" | Positive mood |
| `"happy"` | mood === "optimistic" \| "happy" | Positive mood |

**Custom Context Conditions:**
Use any key from provided context object:
```json
{
  "condition": "hasNewFeedback",
  "context": { "hasNewFeedback": true }
}
```

---

## Core Features

### POST /start
Start autonomy loop.

**Request Body:**
```json
{
  "intervalMs": 600000
}
```

**Parameters:**
- `intervalMs` (optional): Loop interval in milliseconds (default: 600000 = 10 minutes)

**Response:**
```json
{
  "started": true,
  "state": { ... }
}
```

---

### POST /stop
Stop autonomy loop.

**Response:**
```json
{
  "stopped": true
}
```

---

### GET /actions
List actions (optionally filtered by status).

**Query Parameters:**
- `status` (optional): Filter by status (pending|in_progress|completed|failed)

**Response:**
```json
[
  {
    "id": "action_xyz",
    "goal_id": "goal_abc",
    "description": "Research emotional intelligence",
    "type": "research",
    "status": "completed",
    "started_at": "2025-12-03T10:00:00Z",
    "completed_at": "2025-12-03T10:45:00Z",
    "result": "Found 10 research papers on EI...",
    "learnings": "[\"EI has 4 key components\", \"Practice improves EI\"]"
  }
]
```

---

### GET /plan/today
Get today's daily plan.

**Response:**
```json
{
  "id": "plan_xyz",
  "date": "2025-12-03",
  "goals": ["goal_mission_1", "goal_learn_1"],
  "scheduledActions": [
    {
      "time": "09:00",
      "action": {
        "id": "action_123",
        "goalId": "goal_mission_1",
        "description": "Help someone with emotional support",
        "type": "communicate",
        "status": "pending"
      }
    }
  ],
  "completedActions": ["action_1", "action_2"],
  "reflectionNotes": "Great progress today...",
  "mood": "optimistic",
  "energyLevel": 75
}
```

---

### POST /plan/generate
Generate new daily plan.

**Response:**
```json
{
  "id": "plan_xyz",
  "date": "2025-12-03",
  "goals": ["goal_mission_1", "goal_learn_1"],
  "scheduledActions": [ ... ],
  "completedActions": [],
  "reflectionNotes": "",
  "mood": "optimistic",
  "energyLevel": 80
}
```

---

### POST /reflect
Trigger daily reflection.

**Response:**
```json
{
  "reflection": "Today I made progress on connecting with people. I helped 3 individuals and learned more about active listening. Tomorrow I should focus on..."
}
```

---

### GET /insights
Get learning insights.

**Response:**
```json
[
  {
    "id": "insight_123",
    "topic": "Emotional Intelligence",
    "insight": "People respond better to empathy than advice",
    "source": "self-learning",
    "confidence": 0.85,
    "applied_to": "[\"communication\", \"coaching\"]",
    "created_at": "2025-12-03T14:00:00Z"
  }
]
```

---

### GET /log
Get autonomy engine activity log.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 100)

**Response:**
```json
[
  {
    "id": "log_123",
    "timestamp": "2025-12-03T14:30:45.123Z",
    "event_type": "action_completed",
    "description": "Research emotional intelligence techniques",
    "metadata": "{\"result\": \"Found relevant papers...\"}"
  }
]
```

---

### POST /run-once
Execute one autonomy loop iteration immediately.

**Response:**
```json
{
  "ran": true,
  "state": { ... }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Description of error"
}
```

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | `goalId required` | Missing required parameter |
| 400 | `No decision available` | No pending actions for any goal |
| 400 | `Missing required parameter` | Invalid request body |
| 404 | `Not found` | Endpoint doesn't exist |
| 500 | `Internal error` | Server error |

### Error Examples

**Missing goalId:**
```json
{
  "error": "goalId required"
}
```

**No decision available:**
```json
{
  "error": "No decision available"
}
```

---

## Rate Limiting

No explicit rate limiting. Service handles concurrent requests.

**Recommendations:**
- Autonomy loop: 10-minute intervals (production)
- Prioritization checks: Once per autonomy loop
- Milestone updates: As progress is made
- Decision requests: Once per autonomous action

---

## Data Types

### Goal Categories
```typescript
type GoalCategory = 'mission' | 'learning' | 'creation' | 'connection' | 'improvement'
```

### Goal Status
```typescript
type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned'
```

### Action Types
```typescript
type ActionType = 'research' | 'create' | 'communicate' | 'learn' | 'reflect' | 'post'
```

### Action Status
```typescript
type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
```

### Task Status
```typescript
type TaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled'
```

### Milestone Status
```typescript
type MilestoneStatus = 'pending' | 'in_progress' | 'completed'
```

### Trigger Frequency
```typescript
type TriggerFrequency = 'once' | 'daily' | 'hourly' | 'on-demand'
```

---

## Examples

### Example 1: Complete Daily Workflow

```bash
#!/bin/bash

# Start service
bun run core/autonomy-engine.ts &

# Start autonomy loop
curl -X POST http://localhost:8905/start -d '{"intervalMs": 300000}'

# Check priorities
curl http://localhost:8905/goals/prioritized | jq '.[0]'

# Get autonomous decision
curl -X POST http://localhost:8905/decision | jq

# Optimize schedule
curl -X POST http://localhost:8905/schedule/optimize

# Check milestones
GOAL_ID=$(curl http://localhost:8905/goals/prioritized | jq -r '.[0].id')
curl "http://localhost:8905/milestones?goalId=$GOAL_ID"

# Record snapshot
curl -X POST http://localhost:8905/progress/snapshot

# Stop at end of day
curl -X POST http://localhost:8905/stop
```

---

## Changelog

### v2.0 (Current)
- Added goal prioritization algorithm
- Added task scheduling and time management
- Added progress tracking with milestones
- Added autonomous decision-making
- Added initiative triggers
- New endpoints for all features
- New database tables for features

### v1.0 (Previous)
- Basic autonomy loop
- Goal and action management
- Daily planning
- Learning insights
- Reflection

---

*Autonomy Engine v2.0 - Complete API Reference*
