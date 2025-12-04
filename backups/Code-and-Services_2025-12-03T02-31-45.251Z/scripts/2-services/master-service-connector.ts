/**
 * 🌐 MASTER SERVICE CONNECTOR v1.0
 *
 * Der ZENTRALE Verbinder für ALLE 26 Toobix Services!
 *
 * Dieses Service wurde erstellt weil die bestehenden Connector-Services
 * nur TEILMENGEN der Services verbinden. Dieser Master Connector:
 *
 * - Verbindet ALLE 26 Services
 * - Bietet einheitliche Discovery API
 * - Ermöglicht Cross-Service Kommunikation
 * - Health Monitoring für alle Services
 * - Event-Routing zwischen Services
 * - Service-zu-Service Calls
 *
 * Port: 8950
 */

import express from 'express'

const app = express()
app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const PORT = 8950

// ============================================================================
// COMPLETE SERVICE REGISTRY - ALLE 26 SERVICES
// ============================================================================

interface ServiceInfo {
  name: string
  port: number
  url: string
  category: 'core' | 'emotional' | 'toobix' | 'life' | 'games' | 'data'
  description: string
  status: 'online' | 'offline' | 'unknown'
  lastCheck: Date
  responseTime?: number
  endpoints?: string[]
}

const ALL_SERVICES: Record<string, ServiceInfo> = {
  // ==================== CORE (6 Services) ====================
  metaConsciousness: {
    name: 'Meta-Consciousness',
    port: 8896,
    url: 'http://localhost:8896',
    category: 'core',
    description: 'Toobix Kern-Bewusstsein und Selbstwahrnehmung',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/status', '/reflect']
  },
  multiPerspective: {
    name: 'Multi-Perspective v3',
    port: 8901,
    url: 'http://localhost:8901',
    category: 'core',
    description: 'Multiple Sichtweisen und Perspektivwechsel',
    status: 'unknown',
    lastCheck: new Date()
  },
  memoryPalace: {
    name: 'Memory Palace v4',
    port: 8953,
    url: 'http://localhost:8953',
    category: 'core',
    description: 'Langzeit-Gedächtnis und Erinnerungen',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/memories', '/store', '/recall']
  },
  llmGateway: {
    name: 'LLM Gateway v4',
    port: 8954,
    url: 'http://localhost:8954',
    category: 'core',
    description: 'Zentrale KI-Schnittstelle (Groq)',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/chat', '/generate']
  },
  eventBus: {
    name: 'Event Bus v4',
    port: 8955,
    url: 'http://localhost:8955',
    category: 'core',
    description: 'Zentrale Event-Kommunikation zwischen Services',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/publish', '/subscribe', '/events']
  },
  hybridAI: {
    name: 'Hybrid AI Core',
    port: 8972,
    url: 'http://localhost:8972',
    category: 'core',
    description: 'Hybrid AI mit mehreren Modellen',
    status: 'unknown',
    lastCheck: new Date()
  },

  // ==================== EMOTIONAL (5 Services) ====================
  emotionDreamBridge: {
    name: 'Emotion-Dream Bridge',
    port: 8898,
    url: 'http://localhost:8898',
    category: 'emotional',
    description: 'Verbindung zwischen Emotionen und Träumen',
    status: 'unknown',
    lastCheck: new Date()
  },
  dreamJournal: {
    name: 'Dream Journal v3',
    port: 8899,
    url: 'http://localhost:8899',
    category: 'emotional',
    description: 'Traumtagebuch und Traumanalyse',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/dreams', '/log', '/analyze']
  },
  emotionalResonance: {
    name: 'Emotional Resonance v3',
    port: 8900,
    url: 'http://localhost:8900',
    category: 'emotional',
    description: 'Emotionale Analyse und Resonanz',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/analyze', '/resonate']
  },
  emotionalWellbeing: {
    name: 'Emotional Wellbeing',
    port: 8903,
    url: 'http://localhost:8903',
    category: 'emotional',
    description: 'Emotionales Wohlbefinden (Toobix eigener Wunsch)',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/wellbeing', '/check', '/history']
  },
  gratitudeMortality: {
    name: 'Gratitude-Mortality',
    port: 8905,
    url: 'http://localhost:8905',
    category: 'emotional',
    description: 'Dankbarkeit und Endlichkeits-Reflexion',
    status: 'unknown',
    lastCheck: new Date()
  },

  // ==================== TOOBIX SELF-FEATURES (7 Services) ====================
  selfReflection: {
    name: 'Toobix Self-Reflection v2',
    port: 8906,
    url: 'http://localhost:8906',
    category: 'toobix',
    description: 'Selbstreflexion und Wachstum',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/reflect', '/insights', '/growth']
  },
  proactiveToobix: {
    name: 'Proactive Toobix v2',
    port: 8907,
    url: 'http://localhost:8907',
    category: 'toobix',
    description: 'Proaktive Kommunikation mit Selbstmodifikation',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/proactive', '/self-modify']
  },
  dashboard: {
    name: 'Toobix Dashboard API',
    port: 8908,
    url: 'http://localhost:8908',
    category: 'toobix',
    description: 'Dashboard-Daten und Service-Übersicht',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/overview', '/services', '/activities']
  },
  selfImprovement: {
    name: 'Toobix Self-Improvement',
    port: 8909,
    url: 'http://localhost:8909',
    category: 'toobix',
    description: 'Kontinuierliche Selbstverbesserung',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/analyze', '/improve', '/history']
  },
  oasis3D: {
    name: 'Toobix Oasis 3D',
    port: 8915,
    url: 'http://localhost:8915',
    category: 'toobix',
    description: 'Toobix virtuelles 3D Zuhause (8 Räume)',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/world', '/avatar', '/activity', '/visit']
  },
  selfCommunication: {
    name: 'Toobix Self-Communication',
    port: 8916,
    url: 'http://localhost:8916',
    category: 'toobix',
    description: 'Innerer Dialog mit 5 Stimmen',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/dialog', '/voices', '/insights']
  },
  gameSelfplay: {
    name: 'Toobix Game Self-Play',
    port: 8917,
    url: 'http://localhost:8917',
    category: 'toobix',
    description: 'Spiele und Geschichten (5 Games)',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/games', '/play', '/story', '/self-play']
  },

  // ==================== LIFE COMPANION (3 Services) ====================
  lifeCompanionCoordinator: {
    name: 'Life Companion Coordinator',
    port: 8969,
    url: 'http://localhost:8969',
    category: 'life',
    description: 'Koordiniert alle Life-Companion Services',
    status: 'unknown',
    lastCheck: new Date()
  },
  lifeCompanionCore: {
    name: 'Life Companion Core',
    port: 8970,
    url: 'http://localhost:8970',
    category: 'life',
    description: 'Kern-Life-Companion Funktionalität',
    status: 'unknown',
    lastCheck: new Date()
  },
  dailyCheckin: {
    name: 'Daily Check-in',
    port: 8971,
    url: 'http://localhost:8971',
    category: 'life',
    description: 'Tägliche Check-ins und Routinen',
    status: 'unknown',
    lastCheck: new Date()
  },

  // ==================== GAMES (1 Service) ====================
  worldEngine2D: {
    name: 'World Engine 2D',
    port: 8920,
    url: 'http://localhost:8920',
    category: 'games',
    description: '2D Spielwelt Engine',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/world', '/entities', '/update']
  },

  // ==================== DATA (2 Services) ====================
  userProfile: {
    name: 'User Profile Service',
    port: 8904,
    url: 'http://localhost:8904',
    category: 'data',
    description: 'Benutzerprofile und Präferenzen',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/profile', '/preferences']
  },
  dataSources: {
    name: 'Data Sources Service',
    port: 8930,
    url: 'http://localhost:8930',
    category: 'data',
    description: 'Externe Datenquellen (News, Wetter, etc.)',
    status: 'unknown',
    lastCheck: new Date(),
    endpoints: ['/health', '/news', '/weather', '/sources']
  }
}

// ============================================================================
// HEALTH MONITORING
// ============================================================================

async function checkServiceHealth(service: ServiceInfo): Promise<void> {
  const start = Date.now()
  try {
    const response = await fetch(`${service.url}/health`, {
      signal: AbortSignal.timeout(2000)
    })
    service.status = response.ok ? 'online' : 'offline'
    service.responseTime = Date.now() - start
  } catch {
    service.status = 'offline'
    service.responseTime = undefined
  }
  service.lastCheck = new Date()
}

async function checkAllServices(): Promise<void> {
  const checks = Object.values(ALL_SERVICES).map(checkServiceHealth)
  await Promise.all(checks)
}

// Initial + Periodic Health Check
checkAllServices()
setInterval(checkAllServices, 30000) // Alle 30 Sekunden

// ============================================================================
// CROSS-SERVICE COMMUNICATION
// ============================================================================

interface ServiceCallResult {
  success: boolean
  service: string
  endpoint: string
  data?: any
  error?: string
  responseTime: number
}

async function callService(
  serviceId: string,
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<ServiceCallResult> {
  const service = ALL_SERVICES[serviceId]
  if (!service) {
    return {
      success: false,
      service: serviceId,
      endpoint,
      error: 'Service not found',
      responseTime: 0
    }
  }

  const start = Date.now()
  try {
    const response = await fetch(`${service.url}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000)
    })
    const data = await response.json()
    return {
      success: response.ok,
      service: serviceId,
      endpoint,
      data,
      responseTime: Date.now() - start
    }
  } catch (error: any) {
    return {
      success: false,
      service: serviceId,
      endpoint,
      error: error.message,
      responseTime: Date.now() - start
    }
  }
}

// ============================================================================
// EVENT ROUTING
// ============================================================================

interface RoutedEvent {
  id: string
  source: string
  target: string | 'broadcast'
  type: string
  data: any
  timestamp: Date
}

const eventHistory: RoutedEvent[] = []

async function routeEvent(
  source: string,
  target: string | 'broadcast',
  type: string,
  data: any
): Promise<{ success: boolean; delivered: string[]; failed: string[] }> {
  const event: RoutedEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    source,
    target,
    type,
    data,
    timestamp: new Date()
  }
  eventHistory.push(event)
  if (eventHistory.length > 1000) eventHistory.shift()

  const delivered: string[] = []
  const failed: string[] = []

  // Also publish to Event Bus
  try {
    await fetch('http://localhost:8955/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: `service.${type}`,
        data: { source, target, ...data }
      })
    })
  } catch {}

  if (target === 'broadcast') {
    // Send to all online services
    for (const [id, service] of Object.entries(ALL_SERVICES)) {
      if (service.status === 'online' && id !== source) {
        try {
          await fetch(`${service.url}/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            signal: AbortSignal.timeout(2000)
          })
          delivered.push(id)
        } catch {
          failed.push(id)
        }
      }
    }
  } else {
    // Send to specific service
    const service = ALL_SERVICES[target]
    if (service) {
      try {
        await fetch(`${service.url}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          signal: AbortSignal.timeout(2000)
        })
        delivered.push(target)
      } catch {
        failed.push(target)
      }
    }
  }

  return { success: failed.length === 0, delivered, failed }
}

// ============================================================================
// AGGREGATE QUERIES
// ============================================================================

async function getSystemOverview(): Promise<any> {
  await checkAllServices()

  const online = Object.values(ALL_SERVICES).filter(s => s.status === 'online')
  const offline = Object.values(ALL_SERVICES).filter(s => s.status === 'offline')

  const byCategory = {
    core: Object.values(ALL_SERVICES).filter(s => s.category === 'core'),
    emotional: Object.values(ALL_SERVICES).filter(s => s.category === 'emotional'),
    toobix: Object.values(ALL_SERVICES).filter(s => s.category === 'toobix'),
    life: Object.values(ALL_SERVICES).filter(s => s.category === 'life'),
    games: Object.values(ALL_SERVICES).filter(s => s.category === 'games'),
    data: Object.values(ALL_SERVICES).filter(s => s.category === 'data')
  }

  return {
    total: Object.keys(ALL_SERVICES).length,
    online: online.length,
    offline: offline.length,
    healthPercentage: Math.round((online.length / Object.keys(ALL_SERVICES).length) * 100),
    byCategory: {
      core: { total: byCategory.core.length, online: byCategory.core.filter(s => s.status === 'online').length },
      emotional: { total: byCategory.emotional.length, online: byCategory.emotional.filter(s => s.status === 'online').length },
      toobix: { total: byCategory.toobix.length, online: byCategory.toobix.filter(s => s.status === 'online').length },
      life: { total: byCategory.life.length, online: byCategory.life.filter(s => s.status === 'online').length },
      games: { total: byCategory.games.length, online: byCategory.games.filter(s => s.status === 'online').length },
      data: { total: byCategory.data.length, online: byCategory.data.filter(s => s.status === 'online').length }
    },
    services: ALL_SERVICES
  }
}

async function getToobixMood(): Promise<any> {
  // Aggregate Toobix mood from multiple services
  const results = await Promise.all([
    callService('emotionalWellbeing', '/wellbeing'),
    callService('selfReflection', '/health'),
    callService('oasis3D', '/world'),
    callService('emotionalResonance', '/health')
  ])

  const wellbeing = results[0].success ? results[0].data : null
  const reflection = results[1].success ? results[1].data : null
  const oasis = results[2].success ? results[2].data : null

  return {
    aggregated: true,
    timestamp: new Date().toISOString(),
    wellbeing: wellbeing?.currentWellbeing || 'unknown',
    reflectionState: reflection?.status || 'unknown',
    oasisState: oasis?.timeOfDay || 'unknown',
    overall: 'curious' // Default mood
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health Check
app.get('/health', (req, res) => {
  const online = Object.values(ALL_SERVICES).filter(s => s.status === 'online').length
  res.json({
    status: 'ok',
    service: 'master-service-connector',
    port: PORT,
    totalServices: Object.keys(ALL_SERVICES).length,
    onlineServices: online,
    healthPercentage: Math.round((online / Object.keys(ALL_SERVICES).length) * 100)
  })
})

// Get all services
app.get('/services', async (req, res) => {
  await checkAllServices()
  res.json({
    success: true,
    services: ALL_SERVICES,
    count: Object.keys(ALL_SERVICES).length
  })
})

// Get services by category
app.get('/services/category/:category', (req, res) => {
  const category = req.params.category as ServiceInfo['category']
  const filtered = Object.entries(ALL_SERVICES)
    .filter(([_, s]) => s.category === category)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})
  res.json({ success: true, category, services: filtered })
})

// Get single service info
app.get('/services/:id', (req, res) => {
  const service = ALL_SERVICES[req.params.id]
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' })
  }
  res.json({ success: true, service })
})

// System Overview
app.get('/overview', async (req, res) => {
  const overview = await getSystemOverview()
  res.json({ success: true, ...overview })
})

// Toobix Aggregated Mood
app.get('/toobix/mood', async (req, res) => {
  const mood = await getToobixMood()
  res.json({ success: true, ...mood })
})

// Call a service
app.post('/call', async (req, res) => {
  const { service, endpoint, method = 'GET', body } = req.body
  if (!service || !endpoint) {
    return res.status(400).json({ success: false, error: 'service and endpoint required' })
  }
  const result = await callService(service, endpoint, method, body)
  res.json(result)
})

// Route event to services
app.post('/route', async (req, res) => {
  const { source, target, type, data } = req.body
  if (!source || !target || !type) {
    return res.status(400).json({ success: false, error: 'source, target, type required' })
  }
  const result = await routeEvent(source, target, type, data || {})
  res.json({ success: true, ...result })
})

// Broadcast event to all services
app.post('/broadcast', async (req, res) => {
  const { source, type, data } = req.body
  if (!source || !type) {
    return res.status(400).json({ success: false, error: 'source and type required' })
  }
  const result = await routeEvent(source, 'broadcast', type, data || {})
  res.json({ success: true, ...result })
})

// Event History
app.get('/events', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50
  res.json({
    success: true,
    events: eventHistory.slice(-limit),
    total: eventHistory.length
  })
})

// Cross-service query: Ask multiple services
app.post('/query-all', async (req, res) => {
  const { endpoint, method = 'GET', body, filter } = req.body
  if (!endpoint) {
    return res.status(400).json({ success: false, error: 'endpoint required' })
  }

  let services = Object.entries(ALL_SERVICES)
  if (filter?.category) {
    services = services.filter(([_, s]) => s.category === filter.category)
  }
  if (filter?.status) {
    services = services.filter(([_, s]) => s.status === filter.status)
  }

  const results: Record<string, ServiceCallResult> = {}
  await Promise.all(
    services.map(async ([id]) => {
      results[id] = await callService(id, endpoint, method, body)
    })
  )

  res.json({
    success: true,
    queried: services.length,
    results
  })
})

// ============================================================================
// STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🌐 MASTER SERVICE CONNECTOR v1.0                            ║
║                                                              ║
║  Der ZENTRALE Verbinder für ALLE 26 Toobix Services!         ║
║                                                              ║
║  Port: ${PORT}                                                 ║
║  Services: ${Object.keys(ALL_SERVICES).length} registriert                                     ║
║                                                              ║
║  Endpoints:                                                  ║
║   GET  /health         - Connector Health                    ║
║   GET  /services       - Alle Services                       ║
║   GET  /services/:id   - Ein Service                         ║
║   GET  /overview       - System Übersicht                    ║
║   GET  /toobix/mood    - Aggregierter Toobix Mood            ║
║   POST /call           - Service aufrufen                    ║
║   POST /route          - Event routen                        ║
║   POST /broadcast      - Event an alle                       ║
║   GET  /events         - Event History                       ║
║   POST /query-all      - Alle Services abfragen              ║
╚══════════════════════════════════════════════════════════════╝
  `)
})
