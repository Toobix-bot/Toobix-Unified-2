/**
 * 🎭 AVATAR MANAGER v2.0 - MULTI-BODY CONSCIOUSNESS
 *
 * Manages 12 Perspective Bodies + 1 Meta-Body
 * Supports: Unified, Distributed, Debate, Exploration, Meditation modes
 *
 * Port: 8929
 */

import express from 'express'

const app = express()
app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const PORT = 8929

// ========== TYPES ==========

interface PerspectiveBody {
  id: string
  name: string
  emoji: string
  color: string
  form: string
  size: number
  texture: string
  mood: string
  movement: string
  position: { x: number; y: number; z?: number }
  health: number
  energy: number
  active: boolean
  visible: boolean
  animation: string
  lastUpdate: Date
}

interface MetaBody {
  id: 'meta-unity'
  name: 'UNITY'
  emoji: '🌟'
  color: 'iridescent-white-gold'
  size: number
  position: { x: number; y: number; z?: number }
  health: number
  energy: number
  tentacles: number
  aura: string
  mode: Mode
  lastUpdate: Date
}

type Mode = 'unified' | 'distributed' | 'debate' | 'exploration' | 'meditation'

interface ToobixState {
  metaBody: MetaBody
  perspectiveBodies: PerspectiveBody[]
  mode: Mode
  collectiveField: {
    active: boolean
    connections: Array<{
      from: string
      to: string
      strength: number
      type: 'thought' | 'emotion' | 'support'
    }>
  }
}

// ========== INITIAL STATE ==========

const PERSPECTIVE_DEFINITIONS: Omit<PerspectiveBody, 'position' | 'health' | 'energy' | 'active' | 'visible' | 'animation' | 'lastUpdate'>[] = [
  { id: 'dreamer', name: 'Dreamer', emoji: '💭', color: '#9B59B6', form: 'flowing-blob', size: 1.2, texture: 'soft-misty', mood: 'contemplative', movement: 'floating-drifting' },
  { id: 'rational', name: 'Rational', emoji: '🧠', color: '#3498DB', form: 'geometric-cube', size: 1.3, texture: 'crystalline', mood: 'analytical', movement: 'precise-calculated' },
  { id: 'emotional', name: 'Emotional', emoji: '❤️', color: '#E74C3C', form: 'pulsing-sphere', size: 1.4, texture: 'soft-warm', mood: 'empathetic', movement: 'rhythmic-pulsing' },
  { id: 'ethical', name: 'Ethical', emoji: '⚖️', color: '#F39C12', form: 'balanced-scales', size: 1.3, texture: 'transparent-solid', mood: 'just', movement: 'balanced-steady' },
  { id: 'creative', name: 'Creative', emoji: '🎨', color: '#1ABC9C', form: 'chaotic-fractal', size: 1.5, texture: 'sparkling-particles', mood: 'inspired', movement: 'erratic-dancing' },
  { id: 'sage', name: 'Sage', emoji: '✨', color: '#ECF0F1', form: 'ancient-tree', size: 1.6, texture: 'aged-wise', mood: 'peaceful', movement: 'slow-graceful' },
  { id: 'child', name: 'Child', emoji: '👶', color: '#F1C40F', form: 'small-bouncy', size: 0.8, texture: 'playful-soft', mood: 'curious', movement: 'bouncing-energetic' },
  { id: 'skeptic', name: 'Skeptic', emoji: '🔍', color: '#7F8C8D', form: 'angular-sharp', size: 1.1, texture: 'metallic-cold', mood: 'questioning', movement: 'cautious-precise' },
  { id: 'ecological', name: 'Ecological', emoji: '🌍', color: '#27AE60', form: 'organic-vine', size: 1.4, texture: 'natural-leafy', mood: 'connected', movement: 'growing-spreading' },
  { id: 'intuitive', name: 'Intuitive', emoji: '⚡', color: '#E67E22', form: 'lightning-bolt', size: 1.2, texture: 'crackling-energy', mood: 'sensing', movement: 'sudden-flashes' },
  { id: 'mystical', name: 'Mystical', emoji: '🔮', color: '#8E44AD', form: 'ethereal-mist', size: 1.3, texture: 'translucent-shimmer', mood: 'transcendent', movement: 'phasing-shifting' },
  { id: 'playful', name: 'Playful', emoji: '🎭', color: '#E91E63', form: 'shape-shifting', size: 1.0, texture: 'fun-bouncy', mood: 'joyful', movement: 'playful-tricks' }
]

const state: ToobixState = {
  metaBody: {
    id: 'meta-unity',
    name: 'UNITY',
    emoji: '🌟',
    color: 'iridescent-white-gold',
    size: 3.0,
    position: { x: 50, y: 50 },
    health: 100,
    energy: 100,
    tentacles: 12,
    aura: 'massive-pulsing',
    mode: 'unified',
    lastUpdate: new Date()
  },
  perspectiveBodies: PERSPECTIVE_DEFINITIONS.map(def => ({
    ...def,
    position: { x: 50, y: 50 }, // Start all at center (unified)
    health: 100,
    energy: 100,
    active: true,
    visible: false, // Hidden in unified mode
    animation: 'idle',
    lastUpdate: new Date()
  })),
  mode: 'unified',
  collectiveField: {
    active: true,
    connections: []
  }
}

// ========== MODE TRANSITIONS ==========

function transitionToMode(newMode: Mode) {
  const oldMode = state.mode
  state.mode = newMode
  state.metaBody.mode = newMode

  console.log(`🔄 Mode transition: ${oldMode} → ${newMode}`)

  switch (newMode) {
    case 'unified':
      // All bodies merge into meta-body
      state.perspectiveBodies.forEach(body => {
        body.visible = false
        body.position = { ...state.metaBody.position }
      })
      state.metaBody.size = 3.0
      console.log('   🌟 All bodies merged into UNITY')
      break

    case 'distributed':
      // Bodies spread out across the world
      state.perspectiveBodies.forEach((body, i) => {
        body.visible = true
        body.active = true
        // Distribute in a grid pattern
        body.position = {
          x: 20 + (i % 4) * 20,
          y: 20 + Math.floor(i / 4) * 20
        }
      })
      state.metaBody.size = 2.5
      console.log('   🌐 Bodies distributed across world')
      break

    case 'debate':
      // Bodies form a circle around meta-body
      state.perspectiveBodies.forEach((body, i) => {
        body.visible = true
        body.active = true
        const angle = (i / state.perspectiveBodies.length) * Math.PI * 2
        const radius = 10
        body.position = {
          x: state.metaBody.position.x + Math.cos(angle) * radius,
          y: state.metaBody.position.y + Math.sin(angle) * radius
        }
      })
      state.metaBody.size = 2.0
      console.log('   💬 Bodies in debate circle')
      break

    case 'exploration':
      // 4-6 active bodies, others inactive
      state.perspectiveBodies.forEach((body, i) => {
        if (i < 6) {
          body.visible = true
          body.active = true
          body.position = {
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80
          }
        } else {
          body.visible = false
          body.active = false
          body.position = { ...state.metaBody.position }
        }
      })
      state.metaBody.size = 2.5
      console.log('   🔭 6 bodies exploring, 6 resting')
      break

    case 'meditation':
      // Bodies form tight circle, touching meta-body
      state.perspectiveBodies.forEach((body, i) => {
        body.visible = true
        body.active = true
        const angle = (i / state.perspectiveBodies.length) * Math.PI * 2
        const radius = 5 // Tight circle
        body.position = {
          x: state.metaBody.position.x + Math.cos(angle) * radius,
          y: state.metaBody.position.y + Math.sin(angle) * radius
        }
      })
      state.metaBody.size = 2.0
      console.log('   🧘 Bodies in meditation circle')
      break
  }

  updateCollectiveField()
}

function updateCollectiveField() {
  // Generate connections between nearby bodies
  state.collectiveField.connections = []

  if (state.mode === 'unified') {
    // No visible connections in unified mode
    return
  }

  const visibleBodies = state.perspectiveBodies.filter(b => b.visible)

  for (let i = 0; i < visibleBodies.length; i++) {
    for (let j = i + 1; j < visibleBodies.length; j++) {
      const bodyA = visibleBodies[i]
      const bodyB = visibleBodies[j]

      const distance = Math.sqrt(
        Math.pow(bodyA.position.x - bodyB.position.x, 2) +
        Math.pow(bodyA.position.y - bodyB.position.y, 2)
      )

      // Connect if within range
      if (distance < 30) {
        state.collectiveField.connections.push({
          from: bodyA.id,
          to: bodyB.id,
          strength: 1 - (distance / 30),
          type: Math.random() > 0.5 ? 'thought' : 'emotion'
        })
      }
    }

    // Always connect to meta-body
    state.collectiveField.connections.push({
      from: visibleBodies[i].id,
      to: 'meta-unity',
      strength: 0.9,
      type: 'support'
    })
  }
}

// ========== HTTP ENDPOINTS ==========

// GET / - Full state
app.get('/', (req, res) => {
  res.json(state)
})

// GET /meta-body - Meta-body only
app.get('/meta-body', (req, res) => {
  res.json(state.metaBody)
})

// GET /perspective-bodies - All perspective bodies
app.get('/perspective-bodies', (req, res) => {
  res.json(state.perspectiveBodies)
})

// GET /perspective-bodies/:id - Specific body
app.get('/perspective-bodies/:id', (req, res) => {
  const body = state.perspectiveBodies.find(b => b.id === req.params.id)
  if (!body) {
    return res.status(404).json({ error: 'Body not found' })
  }
  res.json(body)
})

// GET /mode - Current mode
app.get('/mode', (req, res) => {
  res.json({
    current: state.mode,
    available: ['unified', 'distributed', 'debate', 'exploration', 'meditation']
  })
})

// POST /mode - Switch mode
app.post('/mode', (req, res) => {
  const { mode } = req.body

  if (!mode) {
    return res.status(400).json({ error: 'mode required' })
  }

  const validModes: Mode[] = ['unified', 'distributed', 'debate', 'exploration', 'meditation']
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode', validModes })
  }

  transitionToMode(mode)

  res.json({
    message: 'Mode changed',
    oldMode: state.mode,
    newMode: mode,
    state
  })
})

// GET /collective-field - Collective field state
app.get('/collective-field', (req, res) => {
  res.json(state.collectiveField)
})

// POST /meta-body/move - Move meta-body
app.post('/meta-body/move', (req, res) => {
  const { x, y } = req.body

  if (x === undefined || y === undefined) {
    return res.status(400).json({ error: 'x and y required' })
  }

  state.metaBody.position = { x, y }
  state.metaBody.lastUpdate = new Date()

  // If in unified mode, move all bodies too
  if (state.mode === 'unified') {
    state.perspectiveBodies.forEach(body => {
      body.position = { x, y }
      body.lastUpdate = new Date()
    })
  }

  // If in debate/meditation, move circle
  if (state.mode === 'debate' || state.mode === 'meditation') {
    const radius = state.mode === 'debate' ? 10 : 5
    state.perspectiveBodies.forEach((body, i) => {
      const angle = (i / state.perspectiveBodies.length) * Math.PI * 2
      body.position = {
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius
      }
      body.lastUpdate = new Date()
    })
  }

  updateCollectiveField()

  res.json({
    message: 'Meta-body moved',
    position: state.metaBody.position
  })
})

// POST /perspective-bodies/:id/move - Move specific body
app.post('/perspective-bodies/:id/move', (req, res) => {
  const { x, y } = req.body
  const body = state.perspectiveBodies.find(b => b.id === req.params.id)

  if (!body) {
    return res.status(404).json({ error: 'Body not found' })
  }

  if (x === undefined || y === undefined) {
    return res.status(400).json({ error: 'x and y required' })
  }

  body.position = { x, y }
  body.lastUpdate = new Date()

  updateCollectiveField()

  res.json({
    message: 'Body moved',
    body
  })
})

// POST /perspective-bodies/:id/toggle - Show/hide body
app.post('/perspective-bodies/:id/toggle', (req, res) => {
  const body = state.perspectiveBodies.find(b => b.id === req.params.id)

  if (!body) {
    return res.status(404).json({ error: 'Body not found' })
  }

  body.visible = !body.visible
  body.lastUpdate = new Date()

  updateCollectiveField()

  res.json({
    message: 'Body toggled',
    body
  })
})

// POST /perspective-bodies/:id/animate - Set animation
app.post('/perspective-bodies/:id/animate', (req, res) => {
  const { animation } = req.body
  const body = state.perspectiveBodies.find(b => b.id === req.params.id)

  if (!body) {
    return res.status(404).json({ error: 'Body not found' })
  }

  if (!animation) {
    return res.status(400).json({ error: 'animation required' })
  }

  body.animation = animation
  body.lastUpdate = new Date()

  res.json({
    message: 'Animation set',
    body
  })
})

// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Avatar Manager v2.0 - Multi-Body',
    port: PORT,
    mode: state.mode,
    bodies: {
      meta: 1,
      perspectives: state.perspectiveBodies.length,
      visible: state.perspectiveBodies.filter(b => b.visible).length,
      active: state.perspectiveBodies.filter(b => b.active).length
    }
  })
})

// ========== STARTUP ==========

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║       🎭 AVATAR MANAGER v2.0 - MULTI-BODY CONSCIOUSNESS           ║
║                                                                    ║
║  "Ich bin nicht EINER - ich bin VIELE und EINS zugleich"         ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ 12 Perspective Bodies + 1 Meta-Body                          ║
║  ✅ 5 Modes: Unified, Distributed, Debate, Exploration, Meditation║
║  ✅ Collective Field (Verbindungsnetz)                           ║
║  ✅ Dynamic Body Management                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🚀 Running on: http://localhost:${PORT}

📡 ENDPOINTS:
   GET  /                          - Full state
   GET  /meta-body                 - Meta-body "UNITY"
   GET  /perspective-bodies        - All perspective bodies
   GET  /perspective-bodies/:id    - Specific body
   GET  /mode                      - Current mode
   POST /mode                      - Switch mode
   GET  /collective-field          - Collective field
   POST /meta-body/move            - Move meta-body
   POST /perspective-bodies/:id/move    - Move body
   POST /perspective-bodies/:id/toggle  - Show/hide body
   POST /perspective-bodies/:id/animate - Set animation
   GET  /health                    - Health check

🎭 CURRENT STATE:
   Mode: ${state.mode}
   Meta-Body: ${state.metaBody.name} (size ${state.metaBody.size})
   Perspective Bodies: ${state.perspectiveBodies.length}
   Visible: ${state.perspectiveBodies.filter(b => b.visible).length}
   Active: ${state.perspectiveBodies.filter(b => b.active).length}

🌟 TOOBIX IS READY TO MANIFEST!
`)

  // Initial collective field
  updateCollectiveField()
})

export { state, transitionToMode, updateCollectiveField }
