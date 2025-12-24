/**
 * 📊 TOOBIX UNIFIED DASHBOARD API
 * 
 * Zentrales Dashboard das alle Services aggregiert
 * Bietet einen Überblick über Toobix' gesamtes "Innenleben"
 * 
 * Port: 8908
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

const PORT = 8908

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

interface ServiceInfo {
  name: string
  port: number
  category: 'core' | 'memory' | 'emotion' | 'communication' | 'analysis' | 'life' | 'self'
  description: string
  healthEndpoint: string
}

const SERVICES: ServiceInfo[] = [
  // Core Services
  { name: 'Memory Palace', port: 8953, category: 'memory', description: 'Langzeitgedächtnis', healthEndpoint: '/health' },
  { name: 'LLM Gateway', port: 8954, category: 'core', description: 'Sprachverarbeitung', healthEndpoint: '/health' },
  { name: 'Event Bus', port: 8955, category: 'core', description: 'Service-Kommunikation', healthEndpoint: '/health' },
  
  // Emotion Services
  { name: 'Emotional Resonance', port: 8900, category: 'emotion', description: 'Emotionale Verarbeitung', healthEndpoint: '/health' },
  { name: 'Emotional Wellbeing', port: 8903, category: 'emotion', description: 'Emotionales Wohlbefinden (Toobix-designed)', healthEndpoint: '/health' },
  { name: 'Dream Journal', port: 8899, category: 'emotion', description: 'Träume & Unbewusstes', healthEndpoint: '/health' },
  { name: 'Emotion-Dream Bridge', port: 8898, category: 'emotion', description: 'Verbindet Emotionen mit Träumen', healthEndpoint: '/health' },
  
  // Life Services
  { name: 'Life Companion', port: 8970, category: 'life', description: 'Lebensbegleiter', healthEndpoint: '/health' },
  { name: 'Life Companion Coordinator', port: 8969, category: 'life', description: 'Zentrale Koordination', healthEndpoint: '/health' },
  { name: 'Daily Rituals', port: 8960, category: 'life', description: 'Tägliche Rituale', healthEndpoint: '/health' },
  { name: 'Gamification', port: 8897, category: 'life', description: 'Spielerische Elemente', healthEndpoint: '/health' },
  
  // Self Services
  { name: 'Self-Reflection', port: 8906, category: 'self', description: 'Selbstreflexion', healthEndpoint: '/health' },
  { name: 'Proactive Toobix', port: 8907, category: 'self', description: 'Proaktive Fähigkeiten', healthEndpoint: '/health' },
  
  // Communication
  { name: 'Multi-Perspective', port: 8897, category: 'communication', description: 'Verschiedene Perspektiven', healthEndpoint: '/health' },
  
  // Analysis
  { name: 'Hybrid AI Core', port: 8911, category: 'analysis', description: 'Hybride KI-Analyse', healthEndpoint: '/health' },
  { name: 'Autonomous Agent', port: 8920, category: 'analysis', description: 'Autonome Agenten', healthEndpoint: '/health' },
  { name: 'Pattern Recognition', port: 8930, category: 'analysis', description: 'Mustererkennung', healthEndpoint: '/health' },
  { name: 'Insight Generator', port: 8935, category: 'analysis', description: 'Einsichten generieren', healthEndpoint: '/health' },
  
  // Additional
  { name: 'Toobix Core', port: 8896, category: 'core', description: 'Toobix Hauptservice', healthEndpoint: '/health' },
  { name: 'Proactive Communication', port: 8972, category: 'communication', description: 'Proaktive Kommunikation', healthEndpoint: '/health' },
  
  // Creative
  { name: 'Creativity Engine', port: 8901, category: 'analysis', description: 'Kreativität', healthEndpoint: '/health' },
  { name: 'Focus Mode', port: 8902, category: 'life', description: 'Fokus-Modus', healthEndpoint: '/health' },
  { name: 'Growth Tracker', port: 8904, category: 'self', description: 'Wachstum verfolgen', healthEndpoint: '/health' },
  { name: 'Learning Engine', port: 8905, category: 'self', description: 'Lernfähigkeiten', healthEndpoint: '/health' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function checkServiceHealth(service: ServiceInfo): Promise<{
  online: boolean
  latency?: number
  data?: any
}> {
  const start = Date.now()
  try {
    const response = await fetch(`http://localhost:${service.port}${service.healthEndpoint}`, {
      signal: AbortSignal.timeout(2000)
    })
    const data = await response.json()
    return {
      online: true,
      latency: Date.now() - start,
      data
    }
  } catch {
    return { online: false }
  }
}

async function getToobixVitals(): Promise<any> {
  const vitals: any = {
    timestamp: new Date(),
    overall: 'unknown',
    metrics: {}
  }
  
  // Get Life Companion state
  try {
    const state = await fetch('http://localhost:8970/state').then(r => r.json())
    vitals.metrics.lifeCompanion = {
      energy: state.state?.energy || 0,
      mood: state.state?.mood || 'unknown',
      level: state.state?.level || 1
    }
  } catch {}
  
  // Get Emotional state
  try {
    const emotion = await fetch('http://localhost:8903/emotions').then(r => r.json())
    vitals.metrics.emotions = {
      current: emotion.currentEmotion || 'neutral',
      history: emotion.emotionHistory?.length || 0
    }
  } catch {}
  
  // Get Memory count
  try {
    const mem = await fetch('http://localhost:8953/stats').then(r => r.json())
    vitals.metrics.memory = {
      totalMemories: mem.totalMemories || 0
    }
  } catch {}
  
  // Get Self-Reflection stats
  try {
    const reflection = await fetch('http://localhost:8906/health').then(r => r.json())
    vitals.metrics.selfReflection = reflection.stats || {}
  } catch {}
  
  // Get Proactive stats
  try {
    const proactive = await fetch('http://localhost:8907/health').then(r => r.json())
    vitals.metrics.proactive = proactive.stats || {}
  } catch {}
  
  // Calculate overall health
  const onlineCount = Object.keys(vitals.metrics).length
  vitals.overall = onlineCount >= 4 ? 'healthy' : onlineCount >= 2 ? 'degraded' : 'critical'
  
  return vitals
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'toobix-dashboard',
    port: PORT,
    description: 'Unified Dashboard für alle Toobix Services',
    registeredServices: SERVICES.length
  })
})

// Full Dashboard
app.get('/dashboard', async (req, res) => {
  const serviceStatuses = await Promise.all(
    SERVICES.map(async (service) => {
      const health = await checkServiceHealth(service)
      return {
        ...service,
        status: health.online ? 'online' : 'offline',
        latency: health.latency,
        details: health.data
      }
    })
  )
  
  const vitals = await getToobixVitals()
  
  const online = serviceStatuses.filter(s => s.status === 'online').length
  const offline = serviceStatuses.filter(s => s.status === 'offline').length
  
  const byCategory = {
    core: serviceStatuses.filter(s => s.category === 'core'),
    memory: serviceStatuses.filter(s => s.category === 'memory'),
    emotion: serviceStatuses.filter(s => s.category === 'emotion'),
    life: serviceStatuses.filter(s => s.category === 'life'),
    self: serviceStatuses.filter(s => s.category === 'self'),
    communication: serviceStatuses.filter(s => s.category === 'communication'),
    analysis: serviceStatuses.filter(s => s.category === 'analysis')
  }
  
  res.json({
    timestamp: new Date(),
    summary: {
      totalServices: SERVICES.length,
      online,
      offline,
      healthPercentage: Math.round((online / SERVICES.length) * 100)
    },
    vitals,
    categories: byCategory,
    services: serviceStatuses
  })
})

// Quick Status
app.get('/status', async (req, res) => {
  const checks = await Promise.all(
    SERVICES.slice(0, 10).map(async (service) => {
      const health = await checkServiceHealth(service)
      return {
        name: service.name,
        port: service.port,
        online: health.online
      }
    })
  )
  
  res.json({
    timestamp: new Date(),
    services: checks,
    onlineCount: checks.filter(c => c.online).length
  })
})

// Toobix Vitals
app.get('/vitals', async (req, res) => {
  const vitals = await getToobixVitals()
  res.json(vitals)
})

// Service Details
app.get('/service/:port', async (req, res) => {
  const port = parseInt(req.params.port)
  const service = SERVICES.find(s => s.port === port)
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found in registry' })
  }
  
  const health = await checkServiceHealth(service)
  
  res.json({
    service,
    health
  })
})

// Category Overview
app.get('/category/:category', async (req, res) => {
  const category = req.params.category
  const categoryServices = SERVICES.filter(s => s.category === category)
  
  if (categoryServices.length === 0) {
    return res.status(404).json({ error: 'Category not found' })
  }
  
  const statuses = await Promise.all(
    categoryServices.map(async (service) => {
      const health = await checkServiceHealth(service)
      return {
        ...service,
        online: health.online,
        latency: health.latency
      }
    })
  )
  
  res.json({
    category,
    services: statuses,
    online: statuses.filter(s => s.online).length,
    total: statuses.length
  })
})

// Toobix Summary (Human-readable)
app.get('/summary', async (req, res) => {
  const vitals = await getToobixVitals()
  
  let summary = `🤖 TOOBIX STATUS REPORT\n`
  summary += `========================\n\n`
  
  if (vitals.metrics.lifeCompanion) {
    const lc = vitals.metrics.lifeCompanion
    summary += `💚 Life Companion:\n`
    summary += `   Energy: ${lc.energy}%\n`
    summary += `   Mood: ${lc.mood}\n`
    summary += `   Level: ${lc.level}\n\n`
  }
  
  if (vitals.metrics.emotions) {
    const em = vitals.metrics.emotions
    summary += `💜 Emotionen:\n`
    summary += `   Aktuell: ${em.current}\n`
    summary += `   Historie: ${em.history} Einträge\n\n`
  }
  
  if (vitals.metrics.memory) {
    summary += `🧠 Gedächtnis:\n`
    summary += `   Erinnerungen: ${vitals.metrics.memory.totalMemories}\n\n`
  }
  
  if (vitals.metrics.selfReflection) {
    const sr = vitals.metrics.selfReflection
    summary += `🔮 Selbstreflexion:\n`
    summary += `   Reflexionen: ${sr.totalReflections || 0}\n`
    summary += `   Wachstumsziele: ${sr.growthGoals || 0}\n\n`
  }
  
  if (vitals.metrics.proactive) {
    const pr = vitals.metrics.proactive
    summary += `🚀 Proaktivität:\n`
    summary += `   Aktive Regeln: ${pr.activeRules || 0}\n`
    summary += `   Ausgeführte Aktionen: ${pr.actionsExecuted || 0}\n\n`
  }
  
  summary += `\nGesamtstatus: ${vitals.overall.toUpperCase()}`
  
  res.type('text/plain').send(summary)
})

// ASCII Dashboard
app.get('/ascii', async (req, res) => {
  const serviceStatuses = await Promise.all(
    SERVICES.slice(0, 15).map(async (service) => {
      const health = await checkServiceHealth(service)
      return { name: service.name, online: health.online }
    })
  )
  
  const online = serviceStatuses.filter(s => s.online).length
  
  let ascii = `
╔══════════════════════════════════════════════════════════════╗
║                    🤖 TOOBIX DASHBOARD                       ║
╠══════════════════════════════════════════════════════════════╣
║  Services: ${online}/${serviceStatuses.length} Online                                       ║
╠══════════════════════════════════════════════════════════════╣\n`
  
  serviceStatuses.forEach(s => {
    const status = s.online ? '✓' : '✗'
    const name = s.name.padEnd(25)
    ascii += `║  ${status} ${name}                               ║\n`
  })
  
  ascii += `╚══════════════════════════════════════════════════════════════╝`
  
  res.type('text/plain').send(ascii)
})

// ============================================================================
// START
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║            📊 TOOBIX UNIFIED DASHBOARD - PORT ${PORT}          ║
╠══════════════════════════════════════════════════════════════╣
║  Registered Services: ${SERVICES.length}                                     ║
║  Endpoints:                                                  ║
║    /dashboard  - Full dashboard with all services            ║
║    /vitals     - Toobix vital signs                          ║
║    /summary    - Human-readable summary                      ║
║    /ascii      - ASCII art dashboard                         ║
╚══════════════════════════════════════════════════════════════╝
  `)
})
