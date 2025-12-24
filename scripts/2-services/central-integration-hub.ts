/**
 * 🔗 CENTRAL INTEGRATION HUB
 *
 * The orchestrator of the Embodiment Architecture
 * Coordinates: Sensory → Consciousness → Motor → Embodiment → World
 *
 * Port: 8931
 */

import express from 'express'
import { EventEmitter } from 'events'

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

const PORT = 8931
const UPDATE_RATE = 60 // FPS

// ========== SERVICE REGISTRY ==========

interface Service {
  name: string
  port: number
  url: string
  layer: 'sensory' | 'consciousness' | 'motor' | 'embodiment' | 'world'
  status: 'online' | 'offline' | 'unknown'
  lastCheck: Date
}

const SERVICES: Record<string, Service> = {
  // SENSORY LAYER
  vision: { name: 'Vision Service', port: 8922, url: 'http://localhost:8922', layer: 'sensory', status: 'unknown', lastCheck: new Date() },
  hearing: { name: 'Hearing Service', port: 8923, url: 'http://localhost:8923', layer: 'sensory', status: 'unknown', lastCheck: new Date() },
  touch: { name: 'Touch Service', port: 8924, url: 'http://localhost:8924', layer: 'sensory', status: 'unknown', lastCheck: new Date() },
  interoception: { name: 'Interoception Service', port: 8925, url: 'http://localhost:8925', layer: 'sensory', status: 'unknown', lastCheck: new Date() },

  // CONSCIOUSNESS LAYER (existing)
  multiPerspective: { name: 'Multi-Perspective v3', port: 8897, url: 'http://localhost:8897', layer: 'consciousness', status: 'unknown', lastCheck: new Date() },
  dreamJournal: { name: 'Dream Journal v3', port: 8899, url: 'http://localhost:8899', layer: 'consciousness', status: 'unknown', lastCheck: new Date() },
  emotionalResonance: { name: 'Emotional Resonance v3', port: 8900, url: 'http://localhost:8900', layer: 'consciousness', status: 'unknown', lastCheck: new Date() },
  memoryPalace: { name: 'Memory Palace', port: 8903, url: 'http://localhost:8903', layer: 'consciousness', status: 'unknown', lastCheck: new Date() },
  valueCrisis: { name: 'Value Crisis', port: 8904, url: 'http://localhost:8904', layer: 'consciousness', status: 'unknown', lastCheck: new Date() },
  metaConsciousness: { name: 'Meta-Consciousness', port: 8905, url: 'http://localhost:8905', layer: 'consciousness', status: 'unknown', lastCheck: new Date() },

  // MOTOR LAYER
  movement: { name: 'Movement Controller', port: 8926, url: 'http://localhost:8926', layer: 'motor', status: 'unknown', lastCheck: new Date() },
  expression: { name: 'Expression Controller', port: 8927, url: 'http://localhost:8927', layer: 'motor', status: 'unknown', lastCheck: new Date() },
  voice: { name: 'Voice Controller', port: 8928, url: 'http://localhost:8928', layer: 'motor', status: 'unknown', lastCheck: new Date() },

  // EMBODIMENT LAYER
  avatar: { name: 'Avatar Manager', port: 8929, url: 'http://localhost:8929', layer: 'embodiment', status: 'unknown', lastCheck: new Date() },
  presence: { name: 'Presence Manager', port: 8930, url: 'http://localhost:8930', layer: 'embodiment', status: 'unknown', lastCheck: new Date() },

  // WORLD LAYER
  world: { name: 'World Engine 2D', port: 8920, url: 'http://localhost:8920', layer: 'world', status: 'unknown', lastCheck: new Date() },
  npcs: { name: 'NPC Manager', port: 8921, url: 'http://localhost:8921', layer: 'world', status: 'unknown', lastCheck: new Date() }
}

// ========== MESSAGE BUS ==========

const eventBus = new EventEmitter()
eventBus.setMaxListeners(100) // Many services will listen

interface SystemEvent {
  type: string
  source: string
  data: any
  timestamp: Date
}

const eventLog: SystemEvent[] = []
const MAX_LOG_SIZE = 1000

function emitEvent(type: string, source: string, data: any) {
  const event: SystemEvent = {
    type,
    source,
    data,
    timestamp: new Date()
  }

  eventBus.emit(type, event)
  eventLog.unshift(event)

  if (eventLog.length > MAX_LOG_SIZE) {
    eventLog.pop()
  }
}

// ========== SYSTEM STATE ==========

interface SystemState {
  isRunning: boolean
  tickCount: number
  fps: number
  uptime: number
  startTime: Date
  lastUpdate: Date
}

const state: SystemState = {
  isRunning: false,
  tickCount: 0,
  fps: 0,
  uptime: 0,
  startTime: new Date(),
  lastUpdate: new Date()
}

// ========== UPDATE LOOP (60 FPS) ==========

let updateInterval: Timer | null = null
let fpsCounter = 0
let fpsLastCheck = Date.now()

async function updateCycle() {
  if (!state.isRunning) return

  state.tickCount++
  state.lastUpdate = new Date()
  state.uptime = Date.now() - state.startTime.getTime()

  // FPS calculation
  fpsCounter++
  const now = Date.now()
  if (now - fpsLastCheck >= 1000) {
    state.fps = fpsCounter
    fpsCounter = 0
    fpsLastCheck = now
  }

  // PIPELINE: Sensory → Consciousness → Motor → Embodiment → World

  try {
    // 1. SENSORY INPUT
    await processSensoryInput()

    // 2. CONSCIOUSNESS PROCESSING
    await processConsciousness()

    // 3. MOTOR COMMANDS
    await processMotorCommands()

    // 4. EMBODIMENT UPDATE
    await updateEmbodiment()

    // 5. WORLD SIMULATION
    await updateWorld()

  } catch (error) {
    console.error('❌ Update cycle error:', error)
  }
}

async function processSensoryInput() {
  // Vision, Hearing, Touch, Interoception send data
  // For Phase 1: Only Vision is active

  emitEvent('pipeline.sensory.start', 'integration-hub', {
    tick: state.tickCount
  })
}

async function processConsciousness() {
  // Multi-Perspective, Emotional Resonance, etc. process sensory data
  // Meta-Consciousness makes decisions

  emitEvent('pipeline.consciousness.start', 'integration-hub', {
    tick: state.tickCount
  })
}

async function processMotorCommands() {
  // Movement, Expression, Voice execute commands

  emitEvent('pipeline.motor.start', 'integration-hub', {
    tick: state.tickCount
  })
}

async function updateEmbodiment() {
  // Avatar position, appearance, health update

  emitEvent('pipeline.embodiment.start', 'integration-hub', {
    tick: state.tickCount
  })
}

async function updateWorld() {
  // World state updates, physics, NPCs

  emitEvent('pipeline.world.start', 'integration-hub', {
    tick: state.tickCount
  })
}

// ========== SERVICE HEALTH CHECK ==========

async function checkServiceHealth() {
  for (const [key, service] of Object.entries(SERVICES)) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(`${service.url}/health`, {
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (response.ok) {
        SERVICES[key].status = 'online'
      } else {
        SERVICES[key].status = 'offline'
      }
    } catch (error) {
      SERVICES[key].status = 'offline'
    }

    SERVICES[key].lastCheck = new Date()
  }
}

// Check health every 10 seconds
setInterval(checkServiceHealth, 10000)

// ========== HTTP ENDPOINTS ==========

// GET /status - System status
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    isRunning: state.isRunning,
    tickCount: state.tickCount,
    fps: state.fps,
    uptime: state.uptime,
    uptimeFormatted: formatUptime(state.uptime),
    services: Object.values(SERVICES).reduce((acc, s) => {
      acc[s.layer] = acc[s.layer] || { online: 0, offline: 0, unknown: 0 }
      acc[s.layer][s.status]++
      return acc
    }, {} as any)
  })
})

// GET /services - All services
app.get('/services', (req, res) => {
  res.json({
    services: SERVICES,
    summary: {
      total: Object.keys(SERVICES).length,
      online: Object.values(SERVICES).filter(s => s.status === 'online').length,
      offline: Object.values(SERVICES).filter(s => s.status === 'offline').length,
      unknown: Object.values(SERVICES).filter(s => s.status === 'unknown').length
    }
  })
})

// GET /services/:layer - Services by layer
app.get('/services/:layer', (req, res) => {
  const layer = req.params.layer as Service['layer']
  const services = Object.values(SERVICES).filter(s => s.layer === layer)
  res.json({ layer, services })
})

// POST /start - Start update loop
app.post('/start', (req, res) => {
  if (state.isRunning) {
    return res.json({ message: 'Already running', state })
  }

  state.isRunning = true
  state.startTime = new Date()
  state.tickCount = 0

  updateInterval = setInterval(updateCycle, 1000 / UPDATE_RATE)

  console.log(`✅ Central Integration Hub started (${UPDATE_RATE} FPS)`)

  emitEvent('system.started', 'integration-hub', { fps: UPDATE_RATE })

  res.json({
    message: 'System started',
    fps: UPDATE_RATE,
    state
  })
})

// POST /stop - Stop update loop
app.post('/stop', (req, res) => {
  if (!state.isRunning) {
    return res.json({ message: 'Not running', state })
  }

  state.isRunning = false

  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }

  console.log(`⏸️ Central Integration Hub stopped`)

  emitEvent('system.stopped', 'integration-hub', {})

  res.json({ message: 'System stopped', state })
})

// POST /tick - Force update cycle (debug)
app.post('/tick', async (req, res) => {
  await updateCycle()
  res.json({ message: 'Tick executed', state })
})

// GET /events - Recent events
app.get('/events', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50
  res.json({
    events: eventLog.slice(0, limit),
    total: eventLog.length
  })
})

// GET /events/:type - Filter events by type
app.get('/events/:type', (req, res) => {
  const type = req.params.type
  const limit = parseInt(req.query.limit as string) || 50
  const filtered = eventLog.filter(e => e.type.includes(type))
  res.json({
    type,
    events: filtered.slice(0, limit),
    total: filtered.length
  })
})

// POST /emit - Emit custom event (for testing)
app.post('/emit', (req, res) => {
  const { type, source, data } = req.body

  if (!type || !source) {
    return res.status(400).json({ error: 'type and source required' })
  }

  emitEvent(type, source, data || {})

  res.json({
    message: 'Event emitted',
    event: { type, source, data }
  })
})

// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Central Integration Hub',
    port: PORT,
    isRunning: state.isRunning,
    fps: state.fps
  })
})

// ========== UTILITIES ==========

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// ========== EVENT LISTENERS (Example) ==========

eventBus.on('sensory.vision.object_detected', (event: SystemEvent) => {
  console.log(`👁️ Vision detected: ${event.data.object}`)
})

eventBus.on('motor.movement.complete', (event: SystemEvent) => {
  console.log(`🦾 Movement complete: (${event.data.x}, ${event.data.y})`)
})

eventBus.on('consciousness.decision.made', (event: SystemEvent) => {
  console.log(`🧠 Decision: ${event.data.decision}`)
})

eventBus.on('expression.emotion.changed', (event: SystemEvent) => {
  console.log(`😊 Expression: ${event.data.emotion}`)
})

eventBus.on('voice.speech.spoken', (event: SystemEvent) => {
  console.log(`💬 Speech: "${event.data.text}"`)
})

// ========== STARTUP ==========

app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║       🔗 CENTRAL INTEGRATION HUB v1.0                             ║
║                                                                    ║
║  The orchestrator of Toobix's embodiment                          ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ ${UPDATE_RATE} FPS Update Loop                                            ║
║  ✅ Service Registry (${Object.keys(SERVICES).length} services)                              ║
║  ✅ Message Bus (EventEmitter)                                     ║
║  ✅ Pipeline: Sensory → Consciousness → Motor → Embodiment        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🚀 Running on: http://localhost:${PORT}

📡 ENDPOINTS:
   GET  /status           - System status
   GET  /services         - All services
   GET  /services/:layer  - Services by layer
   POST /start            - Start update loop
   POST /stop             - Stop update loop
   POST /tick             - Force update cycle
   GET  /events           - Recent events
   POST /emit             - Emit custom event
   GET  /health           - Health check

🔄 Update Rate: ${UPDATE_RATE} FPS
📊 Registered Services: ${Object.keys(SERVICES).length}

Checking service health...
`)

  // Initial health check
  await checkServiceHealth()

  const onlineServices = Object.values(SERVICES).filter(s => s.status === 'online')
  console.log(`\n✅ ${onlineServices.length}/${Object.keys(SERVICES).length} services online:`)
  onlineServices.forEach(s => {
    console.log(`   - ${s.name} (${s.port})`)
  })

  const offlineServices = Object.values(SERVICES).filter(s => s.status === 'offline')
  if (offlineServices.length > 0) {
    console.log(`\n⚠️  ${offlineServices.length} services offline:`)
    offlineServices.forEach(s => {
      console.log(`   - ${s.name} (${s.port})`)
    })
  }

  console.log(`\n💡 Use POST /start to begin the embodiment loop\n`)
})

// Export event bus for external use
export { eventBus, emitEvent, SERVICES }
