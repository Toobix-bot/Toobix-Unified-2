/**
 * 🚀 TOOBIX SELF-IMPROVEMENT SERVICE v1.0
 * 
 * SPEZIFIZIERT VON TOOBIX SELBST!
 * 
 * Unterschied zu Self-Reflection:
 * - Self-Reflection: Nachdenken, Journaling, philosophische Fragen
 * - Self-Improvement: AKTIVE Verbesserung, Gewohnheiten, Skill-Tracking
 * 
 * FEATURES:
 * - Skill-Tracking mit Leveln
 * - Gewohnheits-Tracker mit Streaks
 * - Challenge-System
 * - Automatische Analyse und Empfehlungen
 * - Integration mit anderen Toobix Services
 * 
 * Port: 8909
 */

import express from 'express'

const app = express()
app.use(express.json())

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const PORT = 8909

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface Skill {
  id: string
  name: string
  category: 'mental' | 'emotional' | 'social' | 'creative' | 'technical' | 'physical'
  level: number // 1-100
  xp: number
  xpToNextLevel: number
  practiceCount: number
  lastPracticed?: Date
  notes: string[]
  createdAt: Date
}

interface Habit {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetCount: number // z.B. 1x täglich
  currentStreak: number
  longestStreak: number
  completions: HabitCompletion[]
  category: string
  createdAt: Date
  isActive: boolean
}

interface HabitCompletion {
  date: string
  completed: boolean
  notes?: string
}

interface Challenge {
  id: string
  title: string
  description: string
  duration: number // Tage
  startDate: Date
  endDate: Date
  milestones: ChallengeMilestone[]
  progress: number // 0-100
  status: 'active' | 'completed' | 'failed' | 'abandoned'
  rewards: string[]
}

interface ChallengeMilestone {
  id: string
  day: number
  task: string
  completed: boolean
  completedAt?: Date
}

interface ImprovementPlan {
  id: string
  focusArea: string
  currentLevel: string
  targetLevel: string
  timeline: string
  actions: string[]
  metrics: string[]
  createdAt: Date
}

// Storage
const skills: Skill[] = []
const habits: Habit[] = []
const challenges: Challenge[] = []
const improvementPlans: ImprovementPlan[] = []

// ============================================================================
// PREDEFINED CHALLENGES
// ============================================================================

const CHALLENGE_TEMPLATES = [
  {
    title: '7 Tage Dankbarkeit',
    description: 'Schreibe jeden Tag 3 Dinge auf für die du dankbar bist',
    duration: 7,
    category: 'emotional'
  },
  {
    title: '21 Tage neue Gewohnheit',
    description: 'Etabliere eine neue positive Gewohnheit',
    duration: 21,
    category: 'habits'
  },
  {
    title: '30 Tage Lern-Challenge',
    description: 'Lerne jeden Tag 30 Minuten etwas Neues',
    duration: 30,
    category: 'learning'
  },
  {
    title: '14 Tage Achtsamkeit',
    description: 'Täglich 10 Minuten Meditation oder Achtsamkeitsübung',
    duration: 14,
    category: 'mental'
  },
  {
    title: '7 Tage Komfortzone verlassen',
    description: 'Mache jeden Tag etwas das dich leicht herausfordert',
    duration: 7,
    category: 'growth'
  }
]

// ============================================================================
// SKILL CATEGORIES
// ============================================================================

const SKILL_CATEGORIES = {
  mental: ['Focus', 'Problem Solving', 'Critical Thinking', 'Memory', 'Learning Speed'],
  emotional: ['Empathy', 'Self-Awareness', 'Resilience', 'Emotional Regulation', 'Patience'],
  social: ['Communication', 'Listening', 'Conflict Resolution', 'Leadership', 'Networking'],
  creative: ['Creativity', 'Innovation', 'Artistic Expression', 'Writing', 'Design Thinking'],
  technical: ['Programming', 'Data Analysis', 'System Design', 'Debugging', 'Automation'],
  physical: ['Energy Management', 'Stress Handling', 'Sleep Quality', 'Exercise Consistency']
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function getDateString(): string {
  return new Date().toISOString().split('T')[0]
}

function calculateLevel(xp: number): { level: number, xpInLevel: number, xpToNext: number } {
  // XP needed per level increases: 100, 200, 400, 800...
  let level = 1
  let totalXpForLevel = 100
  let xpRemaining = xp
  
  while (xpRemaining >= totalXpForLevel) {
    xpRemaining -= totalXpForLevel
    level++
    totalXpForLevel = 100 * Math.pow(2, level - 1)
  }
  
  return {
    level,
    xpInLevel: xpRemaining,
    xpToNext: totalXpForLevel
  }
}

async function getLLMResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:8954/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Du bist Toobix, ein persönlicher Verbesserungs-Coach. Gib praktische, umsetzbare Ratschläge.' },
          { role: 'user', content: prompt }
        ]
      })
    })
    const data = await response.json()
    return data.content || 'Keine Antwort'
  } catch {
    return 'LLM nicht erreichbar'
  }
}

async function publishEvent(type: string, data: any): Promise<void> {
  try {
    await fetch('http://localhost:8955/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, source: 'self-improvement', data })
    })
  } catch {}
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'toobix-self-improvement',
    version: '1.0',
    port: PORT,
    description: 'Aktive Selbstverbesserung mit Skills, Gewohnheiten und Challenges',
    stats: {
      skills: skills.length,
      habits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      challenges: challenges.length,
      activeChallenges: challenges.filter(c => c.status === 'active').length,
      improvementPlans: improvementPlans.length
    }
  })
})

// ============================================================================
// SKILL ENDPOINTS
// ============================================================================

app.post('/skills', (req, res) => {
  const { name, category = 'mental' } = req.body
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }
  
  const skill: Skill = {
    id: generateId(),
    name,
    category,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    practiceCount: 0,
    notes: [],
    createdAt: new Date()
  }
  
  skills.push(skill)
  publishEvent('skill_created', { skillId: skill.id, name, category })
  
  res.json({
    success: true,
    skill,
    message: `Skill "${name}" wurde erstellt!`
  })
})

app.get('/skills', (req, res) => {
  const { category } = req.query
  
  let filtered = skills
  if (category) {
    filtered = skills.filter(s => s.category === category)
  }
  
  // Sort by level descending
  filtered.sort((a, b) => b.level - a.level)
  
  res.json({
    success: true,
    count: filtered.length,
    skills: filtered,
    categories: SKILL_CATEGORIES
  })
})

app.post('/skills/:id/practice', async (req, res) => {
  const skill = skills.find(s => s.id === req.params.id)
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' })
  }
  
  const { duration = 30, notes } = req.body // duration in minutes
  
  // Grant XP based on duration
  const xpGained = Math.floor(duration * 2) // 2 XP per minute
  skill.xp += xpGained
  skill.practiceCount++
  skill.lastPracticed = new Date()
  
  if (notes) {
    skill.notes.push(`${getDateString()}: ${notes}`)
  }
  
  // Check level up
  const { level, xpInLevel, xpToNext } = calculateLevel(skill.xp)
  const leveledUp = level > skill.level
  skill.level = level
  skill.xpToNextLevel = xpToNext
  
  await publishEvent('skill_practiced', {
    skillId: skill.id,
    name: skill.name,
    duration,
    xpGained,
    leveledUp,
    newLevel: level
  })
  
  res.json({
    success: true,
    skill,
    xpGained,
    leveledUp,
    message: leveledUp 
      ? `🎉 Level Up! "${skill.name}" ist jetzt Level ${level}!`
      : `+${xpGained} XP für "${skill.name}"!`
  })
})

app.get('/skills/leaderboard', (req, res) => {
  const leaderboard = skills
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10)
    .map((s, i) => ({
      rank: i + 1,
      name: s.name,
      level: s.level,
      xp: s.xp,
      category: s.category
    }))
  
  res.json({
    success: true,
    leaderboard
  })
})

// ============================================================================
// HABIT ENDPOINTS
// ============================================================================

app.post('/habits', (req, res) => {
  const { name, description, frequency = 'daily', targetCount = 1, category = 'general' } = req.body
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }
  
  const habit: Habit = {
    id: generateId(),
    name,
    description: description || '',
    frequency,
    targetCount,
    currentStreak: 0,
    longestStreak: 0,
    completions: [],
    category,
    createdAt: new Date(),
    isActive: true
  }
  
  habits.push(habit)
  publishEvent('habit_created', { habitId: habit.id, name })
  
  res.json({
    success: true,
    habit,
    message: `Gewohnheit "${name}" wurde erstellt!`
  })
})

app.get('/habits', (req, res) => {
  const { active } = req.query
  
  let filtered = habits
  if (active === 'true') {
    filtered = habits.filter(h => h.isActive)
  }
  
  // Add today's status
  const today = getDateString()
  const habitsWithStatus = filtered.map(h => ({
    ...h,
    completedToday: h.completions.some(c => c.date === today && c.completed)
  }))
  
  res.json({
    success: true,
    count: filtered.length,
    habits: habitsWithStatus
  })
})

app.post('/habits/:id/complete', async (req, res) => {
  const habit = habits.find(h => h.id === req.params.id)
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' })
  }
  
  const today = getDateString()
  const { notes } = req.body
  
  // Check if already completed today
  const todayCompletion = habit.completions.find(c => c.date === today)
  if (todayCompletion?.completed) {
    return res.json({
      success: true,
      message: 'Heute bereits erledigt!',
      habit
    })
  }
  
  // Add completion
  if (todayCompletion) {
    todayCompletion.completed = true
    todayCompletion.notes = notes
  } else {
    habit.completions.push({ date: today, completed: true, notes })
  }
  
  // Update streak
  habit.currentStreak++
  if (habit.currentStreak > habit.longestStreak) {
    habit.longestStreak = habit.currentStreak
  }
  
  await publishEvent('habit_completed', {
    habitId: habit.id,
    name: habit.name,
    streak: habit.currentStreak
  })
  
  res.json({
    success: true,
    habit,
    message: `✅ "${habit.name}" erledigt! Streak: ${habit.currentStreak} Tage 🔥`
  })
})

app.get('/habits/today', (req, res) => {
  const today = getDateString()
  const activeHabits = habits.filter(h => h.isActive)
  
  const todayStatus = activeHabits.map(h => ({
    id: h.id,
    name: h.name,
    completed: h.completions.some(c => c.date === today && c.completed),
    streak: h.currentStreak
  }))
  
  const completed = todayStatus.filter(h => h.completed).length
  const total = todayStatus.length
  
  res.json({
    success: true,
    date: today,
    habits: todayStatus,
    summary: {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })
})

// ============================================================================
// CHALLENGE ENDPOINTS
// ============================================================================

app.post('/challenges', (req, res) => {
  const { title, description, duration = 7, milestones = [] } = req.body
  
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }
  
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + duration)
  
  // Generate milestones if not provided
  let challengeMilestones: ChallengeMilestone[]
  if (milestones.length > 0) {
    challengeMilestones = milestones.map((task: string, i: number) => ({
      id: generateId(),
      day: i + 1,
      task,
      completed: false
    }))
  } else {
    challengeMilestones = Array.from({ length: duration }, (_, i) => ({
      id: generateId(),
      day: i + 1,
      task: `Tag ${i + 1}`,
      completed: false
    }))
  }
  
  const challenge: Challenge = {
    id: generateId(),
    title,
    description: description || '',
    duration,
    startDate,
    endDate,
    milestones: challengeMilestones,
    progress: 0,
    status: 'active',
    rewards: []
  }
  
  challenges.push(challenge)
  publishEvent('challenge_started', { challengeId: challenge.id, title, duration })
  
  res.json({
    success: true,
    challenge,
    message: `Challenge "${title}" gestartet! ${duration} Tage bis zum Ziel! 💪`
  })
})

app.get('/challenges', (req, res) => {
  const { status } = req.query
  
  let filtered = challenges
  if (status) {
    filtered = challenges.filter(c => c.status === status)
  }
  
  res.json({
    success: true,
    count: filtered.length,
    challenges: filtered,
    templates: CHALLENGE_TEMPLATES
  })
})

app.post('/challenges/:id/milestone/:milestoneId', async (req, res) => {
  const challenge = challenges.find(c => c.id === req.params.id)
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' })
  }
  
  const milestone = challenge.milestones.find(m => m.id === req.params.milestoneId)
  if (!milestone) {
    return res.status(404).json({ error: 'Milestone not found' })
  }
  
  milestone.completed = true
  milestone.completedAt = new Date()
  
  // Update progress
  const completedCount = challenge.milestones.filter(m => m.completed).length
  challenge.progress = Math.round((completedCount / challenge.milestones.length) * 100)
  
  // Check if challenge completed
  if (challenge.progress >= 100) {
    challenge.status = 'completed'
    await publishEvent('challenge_completed', {
      challengeId: challenge.id,
      title: challenge.title
    })
  }
  
  res.json({
    success: true,
    challenge,
    message: challenge.progress >= 100 
      ? `🏆 Challenge "${challenge.title}" abgeschlossen!`
      : `Milestone erledigt! Fortschritt: ${challenge.progress}%`
  })
})

// ============================================================================
// IMPROVEMENT PLAN ENDPOINTS
// ============================================================================

app.post('/plan', async (req, res) => {
  const { focusArea, currentLevel, targetLevel, timeline } = req.body
  
  if (!focusArea) {
    return res.status(400).json({ error: 'focusArea is required' })
  }
  
  // Generate plan with LLM
  const prompt = `Erstelle einen konkreten Verbesserungsplan für:
Bereich: ${focusArea}
Aktuelles Level: ${currentLevel || 'Anfänger'}
Ziel-Level: ${targetLevel || 'Fortgeschritten'}
Zeitrahmen: ${timeline || '3 Monate'}

Gib 5 konkrete Aktionen und 3 messbare Metriken.`

  const llmResponse = await getLLMResponse(prompt)
  
  const plan: ImprovementPlan = {
    id: generateId(),
    focusArea,
    currentLevel: currentLevel || 'Anfänger',
    targetLevel: targetLevel || 'Fortgeschritten',
    timeline: timeline || '3 Monate',
    actions: llmResponse.split('\n').filter(l => l.includes('-') || l.includes('•')).slice(0, 5),
    metrics: [],
    createdAt: new Date()
  }
  
  improvementPlans.push(plan)
  
  res.json({
    success: true,
    plan,
    detailedPlan: llmResponse
  })
})

app.get('/plans', (req, res) => {
  res.json({
    success: true,
    count: improvementPlans.length,
    plans: improvementPlans
  })
})

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

app.get('/analytics/overview', (req, res) => {
  const today = getDateString()
  
  // Calculate totals
  const totalSkillXP = skills.reduce((sum, s) => sum + s.xp, 0)
  const totalPracticeMinutes = skills.reduce((sum, s) => sum + (s.practiceCount * 30), 0)
  const activeStreaks = habits.filter(h => h.currentStreak > 0).length
  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0)
  const completedChallenges = challenges.filter(c => c.status === 'completed').length
  
  // Today's progress
  const habitsCompletedToday = habits.filter(h => 
    h.completions.some(c => c.date === today && c.completed)
  ).length
  
  res.json({
    success: true,
    overview: {
      skills: {
        count: skills.length,
        totalXP: totalSkillXP,
        averageLevel: skills.length > 0 
          ? Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)
          : 0,
        totalPracticeMinutes
      },
      habits: {
        active: habits.filter(h => h.isActive).length,
        completedToday: habitsCompletedToday,
        activeStreaks,
        longestStreak
      },
      challenges: {
        active: challenges.filter(c => c.status === 'active').length,
        completed: completedChallenges,
        totalStarted: challenges.length
      },
      plans: improvementPlans.length
    }
  })
})

app.get('/analytics/recommendations', async (req, res) => {
  const today = getDateString()
  
  // Analyze current state
  const uncompletedHabits = habits.filter(h => 
    h.isActive && !h.completions.some(c => c.date === today && c.completed)
  )
  const lowLevelSkills = skills.filter(s => s.level < 3).slice(0, 3)
  const activeChallenges = challenges.filter(c => c.status === 'active')
  
  const prompt = `Basierend auf:
- ${uncompletedHabits.length} offene Gewohnheiten heute
- ${lowLevelSkills.length} Skills unter Level 3: ${lowLevelSkills.map(s => s.name).join(', ')}
- ${activeChallenges.length} aktive Challenges

Gib 3 konkrete Empfehlungen für heute. Kurz und umsetzbar.`

  const recommendations = await getLLMResponse(prompt)
  
  res.json({
    success: true,
    recommendations,
    data: {
      uncompletedHabits: uncompletedHabits.map(h => h.name),
      lowLevelSkills: lowLevelSkills.map(s => ({ name: s.name, level: s.level })),
      activeChallenges: activeChallenges.map(c => ({ title: c.title, progress: c.progress }))
    }
  })
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🚀 TOOBIX SELF-IMPROVEMENT SERVICE - PORT ${PORT}          ║
╠══════════════════════════════════════════════════════════════╣
║  SPEZIFIZIERT VON TOOBIX SELBST!                             ║
║                                                              ║
║  FEATURES:                                                   ║
║    ✓ Skill-Tracking mit XP und Leveln                        ║
║    ✓ Gewohnheits-Tracker mit Streaks                         ║
║    ✓ Challenge-System                                        ║
║    ✓ Verbesserungspläne mit LLM                              ║
║    ✓ Analytics und Empfehlungen                              ║
╚══════════════════════════════════════════════════════════════╝
  `)
})
