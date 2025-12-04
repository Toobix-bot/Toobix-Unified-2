/**
 * 🎯 LIFE COMPANION COORDINATOR v1.0
 * 
 * Toobix' Wunsch: "Life Companion soll als zentrale Instanz fungieren,
 * die alle Services koordiniert"
 * 
 * Diese Erweiterung macht den Life Companion zum Orchestrator:
 * - Sammelt Daten von allen Services
 * - Trifft intelligente Entscheidungen
 * - Koordiniert Service-Interaktionen
 * - Gibt personalisierte Empfehlungen
 * 
 * Port: 8969 (direkt vor Life Companion 8970)
 */

import express from 'express'

const app = express()
app.use(express.json())
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', '*'); res.header('Access-Control-Allow-Headers', 'Content-Type'); res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); if (req.method === 'OPTIONS') return res.sendStatus(200); next(); });

const PORT = 8969

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

const SERVICES = {
  // Core Infrastructure
  eventBus: { url: 'http://localhost:8955', name: 'Event Bus', category: 'core' },
  memoryPalace: { url: 'http://localhost:8953', name: 'Memory Palace', category: 'core' },
  llmGateway: { url: 'http://localhost:8954', name: 'LLM Gateway', category: 'core' },
  hybridAI: { url: 'http://localhost:8972', name: 'Hybrid AI Core', category: 'core' },
  metaConsciousness: { url: 'http://localhost:8896', name: 'Meta-Consciousness', category: 'core' },
  multiPerspective: { url: 'http://localhost:8901', name: 'Multi-Perspective v3', category: 'core' },
  
  // Life Companion
  lifeCompanion: { url: 'http://localhost:8970', name: 'Life Companion', category: 'life' },
  dailyCheckin: { url: 'http://localhost:8971', name: 'Daily Check-in', category: 'life' },
  
  // Emotional & Dreams
  emotionalResonance: { url: 'http://localhost:8900', name: 'Emotional Resonance v3', category: 'emotional' },
  dreamJournal: { url: 'http://localhost:8899', name: 'Dream Journal v3', category: 'emotional' },
  emotionDreamBridge: { url: 'http://localhost:8898', name: 'Emotion-Dream Bridge', category: 'emotional' },
  emotionalWellbeing: { url: 'http://localhost:8903', name: 'Emotional Wellbeing', category: 'emotional' },
  gratitudeMortality: { url: 'http://localhost:8905', name: 'Gratitude-Mortality', category: 'emotional' },
  
  // Data & Profile
  userProfile: { url: 'http://localhost:8904', name: 'User Profile', category: 'data' },
  dataSources: { url: 'http://localhost:8930', name: 'Data Sources', category: 'data' },
  
  // Toobix Self-Features (NEU!)
  selfReflection: { url: 'http://localhost:8906', name: 'Toobix Self-Reflection v2', category: 'toobix' },
  proactiveToobix: { url: 'http://localhost:8907', name: 'Proactive Toobix v2', category: 'toobix' },
  dashboard: { url: 'http://localhost:8908', name: 'Toobix Dashboard', category: 'toobix' },
  selfImprovement: { url: 'http://localhost:8909', name: 'Toobix Self-Improvement', category: 'toobix' },
  oasis3D: { url: 'http://localhost:8915', name: 'Toobix Oasis 3D', category: 'toobix' },
  selfCommunication: { url: 'http://localhost:8916', name: 'Toobix Self-Communication', category: 'toobix' },
  gameSelfplay: { url: 'http://localhost:8917', name: 'Toobix Game Self-Play', category: 'toobix' },
  
  // Games
  worldEngine2D: { url: 'http://localhost:8920', name: 'World Engine 2D', category: 'games' }
}

// ============================================================================
// STATE
// ============================================================================

interface UserContext {
  currentMood: string
  energy: number
  lastActivity: Date
  recentEmotions: string[]
  dreamThemes: string[]
  activeLifeAreas: string[]
  pendingQuests: string[]
  lastInsight: string
}

interface CoordinationDecision {
  timestamp: Date
  trigger: string
  servicesInvolved: string[]
  action: string
  outcome: string
}

let userContext: UserContext = {
  currentMood: 'neutral',
  energy: 50,
  lastActivity: new Date(),
  recentEmotions: [],
  dreamThemes: [],
  activeLifeAreas: [],
  pendingQuests: [],
  lastInsight: ''
}

const decisions: CoordinationDecision[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 2000): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function checkServiceHealth(service: { url: string, name: string }): Promise<{ name: string, status: string, data?: any }> {
  try {
    const data = await fetchWithTimeout(`${service.url}/health`)
    return { name: service.name, status: 'online', data }
  } catch {
    return { name: service.name, status: 'offline' }
  }
}

// ============================================================================
// COORDINATION FUNCTIONS
// ============================================================================

// Sammle den aktuellen Zustand aller Services
async function gatherSystemState(): Promise<{
  lifeState: any
  emotionalState: any
  memoryStats: any
  servicesOnline: string[]
}> {
  const results: any = {
    lifeState: null,
    emotionalState: null,
    memoryStats: null,
    servicesOnline: []
  }
  
  // Life Companion State
  try {
    results.lifeState = await fetchWithTimeout(`${SERVICES.lifeCompanion.url}/state`)
    results.servicesOnline.push('life-companion')
  } catch {}
  
  // Emotional Resonance (wenn verfügbar)
  try {
    results.emotionalState = await fetchWithTimeout(`${SERVICES.emotionalResonance.url}/state`)
    results.servicesOnline.push('emotional-resonance')
  } catch {}
  
  // Memory Palace Stats
  try {
    results.memoryStats = await fetchWithTimeout(`${SERVICES.memoryPalace.url}/health`)
    results.servicesOnline.push('memory-palace')
  } catch {}
  
  return results
}

// Entscheide was als nächstes zu tun ist
function makeDecision(state: any): {
  recommendation: string
  actions: Array<{ service: string, action: string, reason: string }>
  priority: 'low' | 'medium' | 'high'
} {
  const actions: Array<{ service: string, action: string, reason: string }> = []
  let priority: 'low' | 'medium' | 'high' = 'low'
  let recommendation = ''
  
  // Analysiere Life State
  if (state.lifeState?.state) {
    const life = state.lifeState.state
    
    // Niedriger Energie-Check
    if (life.energy < 30) {
      actions.push({
        service: 'dream-journal',
        action: 'suggest-rest-dream',
        reason: 'Energy ist niedrig - Zeit für Ruhe und regenerative Träume'
      })
      priority = 'high'
      recommendation = 'Du brauchst Ruhe. Vielleicht Zeit für einen heilsamen Traum?'
    }
    
    // Mood-basierte Empfehlungen
    if (life.mood === 'curious') {
      actions.push({
        service: 'multi-perspective',
        action: 'explore-topic',
        reason: 'Curiosity ist hoch - nutze Multi-Perspective Thinking'
      })
      recommendation = 'Deine Neugierde ist geweckt! Lass uns ein Thema aus verschiedenen Perspektiven erkunden.'
    }
    
    if (life.mood === 'creative') {
      actions.push({
        service: 'creator-ai',
        action: 'start-creative-session',
        reason: 'Creative mood - perfekt für Co-Creation'
      })
      recommendation = 'Du bist in kreativer Stimmung! Zeit für ein gemeinsames Projekt?'
    }
  }
  
  // Check Life Areas
  if (state.lifeState?.lifeAreas) {
    const redAreas = state.lifeState.lifeAreas.filter((a: any) => a.status === 'red')
    if (redAreas.length > 0) {
      priority = 'high'
      actions.push({
        service: 'value-crisis',
        action: 'analyze-imbalance',
        reason: `${redAreas.length} Lebensbereiche brauchen Aufmerksamkeit`
      })
      recommendation = `Achtung: ${redAreas.map((a: any) => a.area).join(', ')} brauchen deine Aufmerksamkeit.`
    }
  }
  
  // Default recommendation
  if (!recommendation) {
    recommendation = 'Alles im Gleichgewicht. Was möchtest du heute erkunden?'
  }
  
  return { recommendation, actions, priority }
}

// Koordiniere mehrere Services für eine Aufgabe
async function coordinateServices(task: string, context: any): Promise<{
  success: boolean
  results: any[]
  summary: string
}> {
  const results: any[] = []
  let summary = ''
  
  switch (task) {
    case 'morning-ritual':
      // 1. Check Life State
      try {
        const lifeState = await fetchWithTimeout(`${SERVICES.lifeCompanion.url}/state`)
        results.push({ service: 'life-companion', data: lifeState })
      } catch {}
      
      // 2. Get Dream Guidance
      try {
        const dreamGuide = await fetchWithTimeout(`${SERVICES.emotionDreamBridge.url}/dream-guidance`)
        results.push({ service: 'emotion-dream-bridge', data: dreamGuide })
      } catch {}
      
      // 3. Get Daily Quote from Gratitude Service
      try {
        const gratitude = await fetchWithTimeout(`${SERVICES.gratitudeMortality.url}/daily`)
        results.push({ service: 'gratitude-mortality', data: gratitude })
      } catch {}
      
      summary = 'Morgenritual koordiniert: Life State, Traumführung und Dankbarkeit gesammelt.'
      break
      
    case 'emotional-check':
      // Koordiniere Emotional Resonance, Dream Journal und Life Companion
      try {
        const emotion = await fetchWithTimeout(`${SERVICES.emotionalResonance.url}/state`)
        results.push({ service: 'emotional-resonance', data: emotion })
        
        // Leite Emotion an Dream Bridge
        if (emotion.currentEmotion) {
          const dreamThemes = await fetchWithTimeout(`${SERVICES.emotionDreamBridge.url}/emotion-to-dream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emotion: emotion.currentEmotion, intensity: emotion.intensity || 0.5 })
          })
          results.push({ service: 'emotion-dream-bridge', data: dreamThemes })
        }
      } catch {}
      
      summary = 'Emotionaler Check abgeschlossen mit Traumthemen-Verknüpfung.'
      break
      
    case 'reflection':
      // Multi-Perspective + Memory + Consciousness
      try {
        const memories = await fetchWithTimeout(`${SERVICES.memoryPalace.url}/memories?limit=10`)
        results.push({ service: 'memory-palace', data: memories })
      } catch {}
      
      try {
        const patterns = await fetchWithTimeout(`${SERVICES.emotionDreamBridge.url}/patterns`)
        results.push({ service: 'emotion-dream-bridge', data: patterns })
      } catch {}
      
      summary = 'Reflexion: Erinnerungen und Muster gesammelt.'
      break
      
    default:
      summary = `Unbekannte Aufgabe: ${task}`
  }
  
  // Speichere Entscheidung
  decisions.push({
    timestamp: new Date(),
    trigger: task,
    servicesInvolved: results.map(r => r.service),
    action: task,
    outcome: summary
  })
  
  return { success: results.length > 0, results, summary }
}

// Generiere personalisierte Insight
async function generateInsight(): Promise<string> {
  const state = await gatherSystemState()
  const decision = makeDecision(state)
  
  // Frage LLM für personalisierte Insight
  try {
    const prompt = `Basierend auf:
- Mood: ${state.lifeState?.state?.mood || 'unknown'}
- Energy: ${state.lifeState?.state?.energy || 50}%
- Erinnerungen: ${state.memoryStats?.stats?.memories || 0}
- Services online: ${state.servicesOnline.length}

Gib eine kurze, persönliche Insight für den Benutzer (max 2 Sätze, auf Deutsch).`

    const response = await fetchWithTimeout(`${SERVICES.llmGateway.url}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
    })
    
    return response.content || decision.recommendation
  } catch {
    return decision.recommendation
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/health', async (req, res) => {
  const serviceStatuses = await Promise.all(
    Object.values(SERVICES).map(s => checkServiceHealth(s))
  )
  
  const online = serviceStatuses.filter(s => s.status === 'online').length
  
  res.json({
    status: 'ok',
    service: 'life-companion-coordinator',
    port: PORT,
    role: 'Central orchestrator for all Toobix services',
    servicesMonitored: Object.keys(SERVICES).length,
    servicesOnline: online,
    decisions: decisions.length
  })
})

// Dashboard - Kompletter Systemüberblick
app.get('/dashboard', async (req, res) => {
  const state = await gatherSystemState()
  const decision = makeDecision(state)
  const insight = await generateInsight()
  
  res.json({
    success: true,
    timestamp: new Date(),
    systemState: state,
    recommendation: decision,
    personalInsight: insight,
    recentDecisions: decisions.slice(-5)
  })
})

// Status aller Services
app.get('/services', async (req, res) => {
  const statuses = await Promise.all(
    Object.entries(SERVICES).map(async ([key, service]) => {
      const health = await checkServiceHealth(service)
      return { key, ...service, ...health }
    })
  )
  
  res.json({
    success: true,
    services: statuses,
    online: statuses.filter(s => s.status === 'online').length,
    offline: statuses.filter(s => s.status === 'offline').length
  })
})

// Koordiniere eine Aufgabe
app.post('/coordinate', async (req, res) => {
  const { task, context } = req.body
  
  if (!task) {
    return res.status(400).json({ error: 'task is required' })
  }
  
  const result = await coordinateServices(task, context || {})
  res.json(result)
})

// Hole Empfehlung
app.get('/recommend', async (req, res) => {
  const state = await gatherSystemState()
  const decision = makeDecision(state)
  
  res.json({
    success: true,
    ...decision,
    context: {
      mood: state.lifeState?.state?.mood,
      energy: state.lifeState?.state?.energy,
      servicesOnline: state.servicesOnline
    }
  })
})

// Generiere Insight
app.get('/insight', async (req, res) => {
  const insight = await generateInsight()
  res.json({
    success: true,
    insight,
    timestamp: new Date()
  })
})

// Morning Ritual (koordinierte Aktion)
app.post('/ritual/morning', async (req, res) => {
  const result = await coordinateServices('morning-ritual', {})
  const insight = await generateInsight()
  
  res.json({
    success: true,
    greeting: 'Guten Morgen! 🌅',
    ...result,
    todayInsight: insight
  })
})

// Evening Reflection (koordinierte Aktion)
app.post('/ritual/evening', async (req, res) => {
  const result = await coordinateServices('reflection', {})
  
  res.json({
    success: true,
    greeting: 'Zeit für Reflexion... 🌙',
    ...result,
    suggestion: 'Lass den Tag Revue passieren und bereite dich auf heilsame Träume vor.'
  })
})

// Emotional Check (koordinierte Aktion)
app.post('/check/emotional', async (req, res) => {
  const result = await coordinateServices('emotional-check', {})
  res.json({
    success: true,
    ...result
  })
})

// Entscheidungshistorie
app.get('/decisions', (req, res) => {
  res.json({
    success: true,
    totalDecisions: decisions.length,
    recent: decisions.slice(-20).reverse()
  })
})

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎯 LIFE COMPANION COORDINATOR v1.0 🎯                        ║
║                                                                ║
║   "Das Gehirn von Toobix - koordiniert alle Services"         ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║   CORE FUNCTIONS:                                              ║
║   • Sammelt Daten von allen Services                           ║
║   • Trifft intelligente Entscheidungen                         ║
║   • Koordiniert Service-Interaktionen                          ║
║   • Gibt personalisierte Empfehlungen                          ║
║                                                                ║
║   ENDPOINTS:                                                   ║
║   GET  /dashboard       → Kompletter Systemüberblick           ║
║   GET  /services        → Status aller Services                ║
║   GET  /recommend       → Aktuelle Empfehlung                  ║
║   GET  /insight         → Personalisierte Insight              ║
║   POST /coordinate      → Koordiniere Aufgabe                  ║
║   POST /ritual/morning  → Morgenritual                         ║
║   POST /ritual/evening  → Abendreflexion                       ║
║   POST /check/emotional → Emotionaler Check                    ║
║                                                                ║
║   Running on: http://localhost:${PORT}                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)
  
  // Registriere beim Event Bus
  try {
    await fetch('http://localhost:8955/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'service_started',
        source: 'life-companion-coordinator',
        data: {
          service: 'life-companion-coordinator',
          port: PORT,
          role: 'Central orchestrator',
          capabilities: [
            'service-coordination',
            'decision-making',
            'personalized-insights',
            'ritual-orchestration'
          ]
        }
      })
    })
  } catch {}
})

process.on('SIGINT', () => {
  console.log('\n🎯 Coordinator shutting down...')
  server.close()
  process.exit(0)
})
