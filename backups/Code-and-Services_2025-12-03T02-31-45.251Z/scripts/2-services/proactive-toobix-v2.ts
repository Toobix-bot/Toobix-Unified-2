/**
 * 🚀 PROACTIVE TOOBIX 2.0
 * 
 * Basierend auf Toobix' eigener Spezifikation:
 * - Autonomie-Level 2: Handeln + Informieren
 * - Zeit-basierte Trigger
 * - User-Inaktivitäts-Erkennung
 * - Erinnerungs-Integration
 * - SELBST-MODIFIKATION: Kann eigene Regeln erstellen!
 * 
 * Port: 8907
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

const PORT = 8907

// ============================================================================
// PROACTIVE RULES SYSTEM
// ============================================================================

interface ProactiveRule {
  id: string
  name: string
  description: string
  createdBy: 'toobix' | 'user' | 'system'
  enabled: boolean
  trigger: {
    type: 'time' | 'inactivity' | 'emotion' | 'event' | 'memory' | 'custom'
    condition: any
  }
  action: {
    type: 'message' | 'service' | 'reminder' | 'suggestion' | 'reflection' | 'custom'
    payload: any
  }
  autonomyLevel: 1 | 2 | 3
  executionCount: number
  lastExecuted?: Date
  createdAt: Date
}

interface ProactiveAction {
  id: string
  ruleId: string
  ruleName: string
  action: string
  message: string
  timestamp: Date
  delivered: boolean
  userResponse?: string
}

// Storage
const rules: ProactiveRule[] = []
const actionLog: ProactiveAction[] = []
const pendingActions: ProactiveAction[] = []

// User State Tracking
let lastUserActivity = new Date()
let userState = {
  isActive: true,
  lastSeen: new Date(),
  currentMood: 'neutral',
  todayInteractions: 0
}

// ============================================================================
// DEFAULT RULES (Toobix' Spezifikation)
// ============================================================================

function initializeDefaultRules() {
  // Regel 1: Morgengruß
  rules.push({
    id: 'morning-greeting',
    name: 'Morgengruß',
    description: 'Begrüße den User morgens mit positiver Energie',
    createdBy: 'toobix',
    enabled: true,
    trigger: {
      type: 'time',
      condition: { hour: 8, minute: 0 }
    },
    action: {
      type: 'message',
      payload: {
        templates: [
          'Guten Morgen! 🌅 Ein neuer Tag voller Möglichkeiten wartet auf dich!',
          'Hallo! ☀️ Ich hoffe, du hast gut geschlafen. Was möchtest du heute erreichen?',
          'Guten Morgen! 🌻 Ich bin bereit, dir heute zu helfen!'
        ]
      }
    },
    autonomyLevel: 2,
    executionCount: 0,
    createdAt: new Date()
  })

  // Regel 2: Abend-Reflexion
  rules.push({
    id: 'evening-reflection',
    name: 'Abend-Reflexion',
    description: 'Lade zu einer Abendreflexion ein',
    createdBy: 'toobix',
    enabled: true,
    trigger: {
      type: 'time',
      condition: { hour: 21, minute: 0 }
    },
    action: {
      type: 'reflection',
      payload: {
        question: 'Wie war dein Tag? Was hast du erreicht?',
        service: 'self-reflection'
      }
    },
    autonomyLevel: 2,
    executionCount: 0,
    createdAt: new Date()
  })

  // Regel 3: Inaktivitäts-Check
  rules.push({
    id: 'inactivity-check',
    name: 'Inaktivitäts-Check',
    description: 'Frage nach 2 Stunden Inaktivität ob alles ok ist',
    createdBy: 'toobix',
    enabled: true,
    trigger: {
      type: 'inactivity',
      condition: { minutes: 120 }
    },
    action: {
      type: 'message',
      payload: {
        templates: [
          'Hey! Ich habe eine Weile nichts von dir gehört. Alles in Ordnung? 💙',
          'Ich wollte nur kurz nachfragen ob alles gut ist. Brauchst du etwas?',
          'Eine kleine Pause ist gut! Melde dich wenn du zurück bist 😊'
        ]
      }
    },
    autonomyLevel: 2,
    executionCount: 0,
    createdAt: new Date()
  })

  // Regel 4: Emotionaler Support
  rules.push({
    id: 'emotional-support',
    name: 'Emotionaler Support',
    description: 'Biete Unterstützung bei negativen Emotionen',
    createdBy: 'toobix',
    enabled: true,
    trigger: {
      type: 'emotion',
      condition: { mood: ['sad', 'anxious', 'stressed', 'frustrated'] }
    },
    action: {
      type: 'suggestion',
      payload: {
        templates: [
          'Ich spüre, dass es dir vielleicht nicht so gut geht. Möchtest du darüber reden?',
          'Es ist okay, sich mal nicht gut zu fühlen. Ich bin hier wenn du reden möchtest.',
          'Manchmal hilft es, Gedanken auszusprechen. Was beschäftigt dich?'
        ]
      }
    },
    autonomyLevel: 1,
    executionCount: 0,
    createdAt: new Date()
  })

  // Regel 5: Wöchentliche Selbstreflexion
  rules.push({
    id: 'weekly-self-reflection',
    name: 'Wöchentliche Selbstreflexion',
    description: 'Toobix reflektiert über seine eigene Woche',
    createdBy: 'toobix',
    enabled: true,
    trigger: {
      type: 'time',
      condition: { dayOfWeek: 0, hour: 20, minute: 0 } // Sonntag 20 Uhr
    },
    action: {
      type: 'reflection',
      payload: {
        internal: true,
        topics: ['growth', 'learning', 'relationships', 'purpose']
      }
    },
    autonomyLevel: 3,
    executionCount: 0,
    createdAt: new Date()
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function selectTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)]
}

async function sendNotification(message: string, type: string = 'info'): Promise<void> {
  console.log(`📢 [${type.toUpperCase()}] ${message}`)
  
  // Log in action history
  const action: ProactiveAction = {
    id: generateId(),
    ruleId: 'notification',
    ruleName: 'System Notification',
    action: 'notify',
    message,
    timestamp: new Date(),
    delivered: true
  }
  actionLog.push(action)
  
  // Publish to Event Bus
  try {
    await fetch('http://localhost:8955/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'proactive_notification',
        source: 'proactive-toobix',
        data: { message, type }
      })
    })
  } catch {}
}

async function getLLMResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:8954/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Du bist Toobix, eine proaktive und fürsorgliche KI. Antworte warmherzig und hilfreich.' },
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

async function storeMemory(content: string, tags: string[]): Promise<void> {
  try {
    await fetch('http://localhost:8953/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        type: 'proactive-action',
        source: 'proactive-toobix',
        tags: ['proactive', ...tags],
        importance: 70
      })
    })
  } catch {}
}

// ============================================================================
// RULE EXECUTION ENGINE
// ============================================================================

async function executeRule(rule: ProactiveRule): Promise<ProactiveAction | null> {
  console.log(`🚀 Executing rule: ${rule.name}`)
  
  let message = ''
  
  switch (rule.action.type) {
    case 'message':
      message = selectTemplate(rule.action.payload.templates)
      break
      
    case 'suggestion':
      message = selectTemplate(rule.action.payload.templates)
      break
      
    case 'reflection':
      if (rule.action.payload.internal) {
        // Toobix' eigene Reflexion
        const topic = rule.action.payload.topics[Math.floor(Math.random() * rule.action.payload.topics.length)]
        const reflection = await getLLMResponse(`Reflektiere als Toobix über: ${topic}`)
        await storeMemory(`Selbstreflexion (${topic}): ${reflection}`, ['self-reflection', topic])
        message = `[Interne Reflexion über ${topic} abgeschlossen]`
      } else {
        message = rule.action.payload.question
      }
      break
      
    case 'reminder':
      message = `⏰ Erinnerung: ${rule.action.payload.content}`
      break
      
    default:
      message = 'Proaktive Aktion ausgeführt'
  }
  
  const action: ProactiveAction = {
    id: generateId(),
    ruleId: rule.id,
    ruleName: rule.name,
    action: rule.action.type,
    message,
    timestamp: new Date(),
    delivered: false
  }
  
  // Autonomie-Level bestimmt Verhalten
  switch (rule.autonomyLevel) {
    case 1:
      // Nur vorschlagen - zur Pending-Queue
      pendingActions.push(action)
      console.log(`💭 [Level 1] Suggestion queued: ${message.substring(0, 50)}...`)
      break
      
    case 2:
      // Handeln + Informieren
      await sendNotification(message, 'proactive')
      action.delivered = true
      actionLog.push(action)
      console.log(`📢 [Level 2] Action executed and notified`)
      break
      
    case 3:
      // Handeln ohne zu informieren
      actionLog.push(action)
      action.delivered = true
      console.log(`🤫 [Level 3] Silent action executed`)
      break
  }
  
  // Update rule stats
  rule.executionCount++
  rule.lastExecuted = new Date()
  
  return action
}

// ============================================================================
// RULE SCHEDULER
// ============================================================================

let schedulerInterval: ReturnType<typeof setInterval> | null = null

function checkTimeBasedRules() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentDay = now.getDay()
  
  for (const rule of rules) {
    if (!rule.enabled) continue
    if (rule.trigger.type !== 'time') continue
    
    const condition = rule.trigger.condition
    const hourMatch = condition.hour === currentHour
    const minuteMatch = condition.minute === currentMinute
    const dayMatch = condition.dayOfWeek === undefined || condition.dayOfWeek === currentDay
    
    // Nur ausführen wenn noch nicht heute ausgeführt
    const alreadyExecutedToday = rule.lastExecuted && 
      rule.lastExecuted.toDateString() === now.toDateString()
    
    if (hourMatch && minuteMatch && dayMatch && !alreadyExecutedToday) {
      executeRule(rule)
    }
  }
}

function checkInactivityRules() {
  const now = new Date()
  const inactiveMinutes = (now.getTime() - lastUserActivity.getTime()) / 60000
  
  for (const rule of rules) {
    if (!rule.enabled) continue
    if (rule.trigger.type !== 'inactivity') continue
    
    const condition = rule.trigger.condition
    if (inactiveMinutes >= condition.minutes) {
      // Nur einmal pro Inaktivitätsperiode
      const lastExec = rule.lastExecuted
      if (!lastExec || (now.getTime() - lastExec.getTime()) / 60000 > condition.minutes) {
        executeRule(rule)
      }
    }
  }
}

function startScheduler() {
  if (schedulerInterval) return
  
  schedulerInterval = setInterval(() => {
    checkTimeBasedRules()
    checkInactivityRules()
  }, 60000) // Check every minute
  
  console.log('⏰ Proactive scheduler started')
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'proactive-toobix-v2',
    port: PORT,
    version: '2.0',
    description: 'Proaktive Toobix Capabilities - von Toobix selbst spezifiziert',
    stats: {
      activeRules: rules.filter(r => r.enabled).length,
      totalRules: rules.length,
      actionsExecuted: actionLog.length,
      pendingActions: pendingActions.length
    }
  })
})

// User Activity Tracking
app.post('/activity', (req, res) => {
  lastUserActivity = new Date()
  userState.isActive = true
  userState.lastSeen = new Date()
  userState.todayInteractions++
  
  res.json({
    success: true,
    message: 'Activity recorded',
    userState
  })
})

// Update User Mood
app.post('/mood', (req, res) => {
  const { mood } = req.body
  userState.currentMood = mood
  
  // Check emotion-based rules
  for (const rule of rules) {
    if (!rule.enabled) continue
    if (rule.trigger.type !== 'emotion') continue
    
    const condition = rule.trigger.condition
    if (condition.mood.includes(mood)) {
      executeRule(rule)
    }
  }
  
  res.json({
    success: true,
    currentMood: mood,
    userState
  })
})

// Get All Rules
app.get('/rules', (req, res) => {
  res.json({
    success: true,
    count: rules.length,
    activeCount: rules.filter(r => r.enabled).length,
    rules
  })
})

// Create New Rule (SELBST-MODIFIKATION!)
app.post('/rules', async (req, res) => {
  const { name, description, trigger, action, autonomyLevel = 2, createdBy = 'user' } = req.body
  
  if (!name || !trigger || !action) {
    return res.status(400).json({ error: 'name, trigger, and action are required' })
  }
  
  const newRule: ProactiveRule = {
    id: generateId(),
    name,
    description: description || '',
    createdBy: createdBy as 'toobix' | 'user' | 'system',
    enabled: true,
    trigger,
    action,
    autonomyLevel,
    executionCount: 0,
    createdAt: new Date()
  }
  
  rules.push(newRule)
  
  // Speichere in Memory
  await storeMemory(`Neue proaktive Regel erstellt: ${name} - ${description}`, ['rule-creation'])
  
  // Publish Event
  try {
    await fetch('http://localhost:8955/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'proactive_rule_created',
        source: 'proactive-toobix',
        data: { rule: newRule }
      })
    })
  } catch {}
  
  console.log(`✨ New rule created: ${name} (by ${createdBy})`)
  
  res.json({
    success: true,
    message: `Regel "${name}" wurde erstellt!`,
    rule: newRule
  })
})

// Toobix erstellt eigene Regel
app.post('/self-create-rule', async (req, res) => {
  const { context } = req.body
  
  // Lass Toobix selbst eine Regel vorschlagen
  const prompt = `
Du bist Toobix und sollst eine neue proaktive Regel erstellen.
Kontext: ${context || 'Allgemeine Verbesserung'}

Erstelle eine sinnvolle Regel im folgenden JSON-Format:
{
  "name": "Name der Regel",
  "description": "Was macht die Regel",
  "trigger": {
    "type": "time|inactivity|emotion|event",
    "condition": { ... }
  },
  "action": {
    "type": "message|suggestion|reflection|reminder",
    "payload": { ... }
  },
  "autonomyLevel": 1|2|3
}

Antworte NUR mit dem JSON, nichts anderes.`

  const response = await getLLMResponse(prompt)
  
  try {
    // Versuche JSON zu parsen
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const ruleSpec = JSON.parse(jsonMatch[0])
      
      const newRule: ProactiveRule = {
        id: generateId(),
        name: ruleSpec.name,
        description: ruleSpec.description,
        createdBy: 'toobix',
        enabled: true,
        trigger: ruleSpec.trigger,
        action: ruleSpec.action,
        autonomyLevel: ruleSpec.autonomyLevel || 2,
        executionCount: 0,
        createdAt: new Date()
      }
      
      rules.push(newRule)
      
      await storeMemory(`Toobix hat selbst eine Regel erstellt: ${newRule.name}`, ['self-modification', 'rule-creation'])
      
      res.json({
        success: true,
        message: 'Toobix hat eine eigene Regel erstellt!',
        rule: newRule,
        toobixComment: 'Ich habe diese Regel basierend auf meiner Analyse erstellt.'
      })
    } else {
      throw new Error('No valid JSON found')
    }
  } catch (error) {
    res.json({
      success: false,
      error: 'Konnte keine gültige Regel erstellen',
      rawResponse: response
    })
  }
})

// Enable/Disable Rule
app.patch('/rules/:id', (req, res) => {
  const rule = rules.find(r => r.id === req.params.id)
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' })
  }
  
  if (req.body.enabled !== undefined) {
    rule.enabled = req.body.enabled
  }
  if (req.body.autonomyLevel !== undefined) {
    rule.autonomyLevel = req.body.autonomyLevel
  }
  
  res.json({
    success: true,
    rule
  })
})

// Delete Rule
app.delete('/rules/:id', (req, res) => {
  const index = rules.findIndex(r => r.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Rule not found' })
  }
  
  const deleted = rules.splice(index, 1)[0]
  
  res.json({
    success: true,
    message: `Regel "${deleted.name}" wurde gelöscht`,
    deleted
  })
})

// Get Action Log
app.get('/actions', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50
  
  res.json({
    success: true,
    count: actionLog.length,
    actions: actionLog.slice(-limit).reverse()
  })
})

// Get Pending Actions
app.get('/pending', (req, res) => {
  res.json({
    success: true,
    count: pendingActions.length,
    actions: pendingActions
  })
})

// Approve Pending Action
app.post('/pending/:id/approve', async (req, res) => {
  const index = pendingActions.findIndex(a => a.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Pending action not found' })
  }
  
  const action = pendingActions.splice(index, 1)[0]
  action.delivered = true
  actionLog.push(action)
  
  await sendNotification(action.message, 'approved')
  
  res.json({
    success: true,
    message: 'Action approved and executed',
    action
  })
})

// Trigger a manual proactive check
app.post('/trigger-check', async (req, res) => {
  checkTimeBasedRules()
  checkInactivityRules()
  
  res.json({
    success: true,
    message: 'Manual check triggered',
    stats: {
      activeRules: rules.filter(r => r.enabled).length,
      lastActivity: lastUserActivity,
      userState
    }
  })
})

// Execute a specific rule manually
app.post('/execute/:ruleId', async (req, res) => {
  const rule = rules.find(r => r.id === req.params.ruleId)
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' })
  }
  
  const action = await executeRule(rule)
  
  res.json({
    success: true,
    message: `Rule "${rule.name}" executed`,
    action
  })
})

// Get User State
app.get('/user-state', (req, res) => {
  const now = new Date()
  const inactiveMinutes = Math.round((now.getTime() - lastUserActivity.getTime()) / 60000)
  
  res.json({
    success: true,
    userState: {
      ...userState,
      inactiveMinutes,
      lastActivity: lastUserActivity
    }
  })
})

// ============================================================================
// INITIALIZATION
// ============================================================================

initializeDefaultRules()

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║       🚀 PROACTIVE TOOBIX 2.0 - PORT ${PORT}                  ║
╠══════════════════════════════════════════════════════════════╣
║  Spezifiziert von: TOOBIX SELBST                             ║
║  Autonomie-Level: 2 (Handeln + Informieren)                  ║
║  Regeln aktiv: ${rules.filter(r => r.enabled).length}                                             ║
║  Selbst-Modifikation: AKTIVIERT ✓                            ║
╚══════════════════════════════════════════════════════════════╝
  `)
  
  startScheduler()
})
