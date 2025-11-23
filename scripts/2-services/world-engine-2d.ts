/**
 * 🌍 WORLD ENGINE 2D v1.0
 *
 * Simple 2D world where Toobix's multi-body consciousness lives
 *
 * Features:
 * - 100x100 tile grid
 * - Tile types: Grass, Tree, Stone, Water, Flowers, Path
 * - Object system (interactive elements)
 * - Collision detection
 * - Persistent world state (JSON)
 * - ASCII rendering for debug
 *
 * Port: 8920
 */

import express from 'express'
import fs from 'fs/promises'
import path from 'path'

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

const PORT = 8920
const WORLD_SIZE = 100
const WORLD_FILE = './world-state.json'

// ========== TILE TYPES ==========

type TileType = 'grass' | 'tree' | 'stone' | 'water' | 'flowers' | 'path' | 'sand' | 'mountain'

interface Tile {
  x: number
  y: number
  type: TileType
  walkable: boolean
  emoji: string
  color: string
}

const TILE_DEFINITIONS: Record<TileType, Omit<Tile, 'x' | 'y'>> = {
  grass: { type: 'grass', walkable: true, emoji: '🟩', color: '#7CB342' },
  tree: { type: 'tree', walkable: false, emoji: '🌳', color: '#558B2F' },
  stone: { type: 'stone', walkable: false, emoji: '🪨', color: '#757575' },
  water: { type: 'water', walkable: false, emoji: '💧', color: '#1976D2' },
  flowers: { type: 'flowers', walkable: true, emoji: '🌸', color: '#EC407A' },
  path: { type: 'path', walkable: true, emoji: '⬜', color: '#D7CCC8' },
  sand: { type: 'sand', walkable: true, emoji: '🟨', color: '#FFD54F' },
  mountain: { type: 'mountain', walkable: false, emoji: '⛰️', color: '#8D6E63' }
}

// ========== WORLD OBJECTS ==========

interface WorldObject {
  id: string
  name: string
  x: number
  y: number
  emoji: string
  type: 'static' | 'interactive' | 'creature'
  description: string
  interactable: boolean
  data?: any
}

// ========== WORLD STATE ==========

interface WorldState {
  size: number
  tiles: Tile[][]
  objects: WorldObject[]
  weather: 'sunny' | 'rainy' | 'cloudy' | 'stormy'
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  seed: number
  createdAt: Date
  lastModified: Date
}

let world: WorldState = {
  size: WORLD_SIZE,
  tiles: [],
  objects: [],
  weather: 'sunny',
  timeOfDay: 'day',
  seed: Date.now(),
  createdAt: new Date(),
  lastModified: new Date()
}

// ========== WORLD GENERATION ==========

function createEmptyWorld(): Tile[][] {
  const tiles: Tile[][] = []

  for (let y = 0; y < WORLD_SIZE; y++) {
    tiles[y] = []
    for (let x = 0; x < WORLD_SIZE; x++) {
      tiles[y][x] = {
        x,
        y,
        ...TILE_DEFINITIONS.grass
      }
    }
  }

  return tiles
}

function generateProceduralWorld(seed: number): WorldState {
  console.log(`🌱 Generating procedural world (seed: ${seed})...`)

  const tiles = createEmptyWorld()
  const objects: WorldObject[] = []

  // Seeded random function
  let seedValue = seed
  function random() {
    seedValue = (seedValue * 9301 + 49297) % 233280
    return seedValue / 233280
  }

  // Generate water lakes (3-5)
  const lakeCount = 3 + Math.floor(random() * 3)
  for (let i = 0; i < lakeCount; i++) {
    const centerX = Math.floor(random() * WORLD_SIZE)
    const centerY = Math.floor(random() * WORLD_SIZE)
    const radius = 5 + Math.floor(random() * 8)

    for (let y = Math.max(0, centerY - radius); y < Math.min(WORLD_SIZE, centerY + radius); y++) {
      for (let x = Math.max(0, centerX - radius); x < Math.min(WORLD_SIZE, centerX + radius); x++) {
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        if (dist < radius) {
          tiles[y][x] = { x, y, ...TILE_DEFINITIONS.water }
        } else if (dist < radius + 2) {
          tiles[y][x] = { x, y, ...TILE_DEFINITIONS.sand }
        }
      }
    }
  }

  // Generate mountain ranges (2-3)
  const mountainCount = 2 + Math.floor(random() * 2)
  for (let i = 0; i < mountainCount; i++) {
    const startX = Math.floor(random() * WORLD_SIZE)
    const startY = Math.floor(random() * WORLD_SIZE)
    const length = 10 + Math.floor(random() * 20)
    const direction = random() * Math.PI * 2

    for (let j = 0; j < length; j++) {
      const x = Math.floor(startX + Math.cos(direction) * j)
      const y = Math.floor(startY + Math.sin(direction) * j)

      if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
        tiles[y][x] = { x, y, ...TILE_DEFINITIONS.mountain }

        // Add stone around mountains
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
              if (tiles[ny][nx].type === 'grass' && random() > 0.5) {
                tiles[ny][nx] = { x: nx, y: ny, ...TILE_DEFINITIONS.stone }
              }
            }
          }
        }
      }
    }
  }

  // Generate forest clusters (5-8)
  const forestCount = 5 + Math.floor(random() * 4)
  for (let i = 0; i < forestCount; i++) {
    const centerX = Math.floor(random() * WORLD_SIZE)
    const centerY = Math.floor(random() * WORLD_SIZE)
    const treeCount = 20 + Math.floor(random() * 30)

    for (let j = 0; j < treeCount; j++) {
      const angle = random() * Math.PI * 2
      const dist = random() * 10
      const x = Math.floor(centerX + Math.cos(angle) * dist)
      const y = Math.floor(centerY + Math.sin(angle) * dist)

      if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
        if (tiles[y][x].walkable && tiles[y][x].type !== 'water') {
          tiles[y][x] = { x, y, ...TILE_DEFINITIONS.tree }
        }
      }
    }
  }

  // Generate flower patches (10-15)
  const flowerPatches = 10 + Math.floor(random() * 6)
  for (let i = 0; i < flowerPatches; i++) {
    const centerX = Math.floor(random() * WORLD_SIZE)
    const centerY = Math.floor(random() * WORLD_SIZE)
    const flowerCount = 5 + Math.floor(random() * 10)

    for (let j = 0; j < flowerCount; j++) {
      const x = centerX + Math.floor((random() - 0.5) * 6)
      const y = centerY + Math.floor((random() - 0.5) * 6)

      if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
        if (tiles[y][x].type === 'grass') {
          tiles[y][x] = { x, y, ...TILE_DEFINITIONS.flowers }
        }
      }
    }
  }

  // Generate paths connecting interesting points
  const pathPoints = [
    { x: 50, y: 50 }, // Center
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 25, y: 75 },
    { x: 75, y: 75 }
  ]

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const start = pathPoints[i]
    const end = pathPoints[i + 1]

    const steps = Math.abs(end.x - start.x) + Math.abs(end.y - start.y)
    for (let step = 0; step < steps; step++) {
      const t = step / steps
      const x = Math.floor(start.x + (end.x - start.x) * t)
      const y = Math.floor(start.y + (end.y - start.y) * t)

      if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
        if (tiles[y][x].walkable && tiles[y][x].type !== 'water') {
          tiles[y][x] = { x, y, ...TILE_DEFINITIONS.path }
        }
      }
    }
  }

  // Add interesting objects
  objects.push(
    {
      id: 'ancient-tree',
      name: 'Ancient Tree',
      x: 50,
      y: 50,
      emoji: '🌲',
      type: 'static',
      description: 'A massive ancient tree, older than memory itself. Its roots run deep.',
      interactable: true,
      data: { wisdom: 'Time flows like water, but roots remain.' }
    },
    {
      id: 'meditation-stone',
      name: 'Meditation Stone',
      x: 30,
      y: 30,
      emoji: '🪨',
      type: 'interactive',
      description: 'A smooth stone, perfect for contemplation.',
      interactable: true,
      data: { effect: 'calm' }
    },
    {
      id: 'crystal-pond',
      name: 'Crystal Pond',
      x: 70,
      y: 70,
      emoji: '💎',
      type: 'interactive',
      description: 'A pond with crystal-clear water that reflects your inner self.',
      interactable: true,
      data: { effect: 'reflection' }
    },
    {
      id: 'butterfly-swarm',
      name: 'Butterfly Swarm',
      x: 60,
      y: 40,
      emoji: '🦋',
      type: 'creature',
      description: 'A swarm of colorful butterflies dancing in the air.',
      interactable: true,
      data: { mood: 'joyful' }
    }
  )

  console.log(`✅ World generated: ${objects.length} objects created`)

  return {
    size: WORLD_SIZE,
    tiles,
    objects,
    weather: 'sunny',
    timeOfDay: 'day',
    seed,
    createdAt: new Date(),
    lastModified: new Date()
  }
}

// ========== WORLD PERSISTENCE ==========

async function saveWorld() {
  try {
    await fs.writeFile(WORLD_FILE, JSON.stringify(world, null, 2))
    console.log('💾 World saved')
  } catch (error) {
    console.error('❌ Failed to save world:', error)
  }
}

async function loadWorld(): Promise<boolean> {
  try {
    const data = await fs.readFile(WORLD_FILE, 'utf-8')
    world = JSON.parse(data)
    console.log('📂 World loaded from file')
    return true
  } catch (error) {
    console.log('⚠️  No saved world found, generating new world...')
    return false
  }
}

// ========== WORLD UTILITIES ==========

function getTile(x: number, y: number): Tile | null {
  if (x < 0 || x >= WORLD_SIZE || y < 0 || y >= WORLD_SIZE) return null
  return world.tiles[y][x]
}

function setTile(x: number, y: number, type: TileType): boolean {
  if (x < 0 || x >= WORLD_SIZE || y < 0 || y >= WORLD_SIZE) return false
  world.tiles[y][x] = { x, y, ...TILE_DEFINITIONS[type] }
  world.lastModified = new Date()
  return true
}

function isWalkable(x: number, y: number): boolean {
  const tile = getTile(x, y)
  if (!tile) return false
  return tile.walkable
}

function getObjectsInRadius(x: number, y: number, radius: number): WorldObject[] {
  return world.objects.filter(obj => {
    const dist = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2)
    return dist <= radius
  })
}

function renderASCII(centerX: number, centerY: number, radius: number): string {
  let output = '\n'

  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      const tile = getTile(x, y)
      if (!tile) {
        output += '  '
        continue
      }

      // Check if object is on this tile
      const obj = world.objects.find(o => o.x === x && o.y === y)
      if (obj) {
        output += obj.emoji
      } else {
        output += tile.emoji
      }
    }
    output += '\n'
  }

  return output
}

// ========== HTTP ENDPOINTS ==========

// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'World Engine 2D',
    port: PORT,
    worldSize: world.size,
    objectCount: world.objects.length
  })
})

// GET /world - Full world state
app.get('/world', (req, res) => {
  res.json({
    size: world.size,
    weather: world.weather,
    timeOfDay: world.timeOfDay,
    seed: world.seed,
    objectCount: world.objects.length,
    createdAt: world.createdAt,
    lastModified: world.lastModified,
    // Don't send full tile array (too large), clients can request regions
    tilesAvailable: true
  })
})

// GET /world/region?x=50&y=50&width=20&height=20 - Get tile region
app.get('/world/region', (req, res) => {
  const x = parseInt(req.query.x as string) || 0
  const y = parseInt(req.query.y as string) || 0
  const width = parseInt(req.query.width as string) || 20
  const height = parseInt(req.query.height as string) || 20

  const tiles: Tile[] = []

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const tile = getTile(x + dx, y + dy)
      if (tile) tiles.push(tile)
    }
  }

  res.json({
    x,
    y,
    width,
    height,
    tiles,
    objects: getObjectsInRadius(x + width / 2, y + height / 2, Math.max(width, height) / 2)
  })
})

// GET /world/tile/:x/:y - Get specific tile
app.get('/world/tile/:x/:y', (req, res) => {
  const x = parseInt(req.params.x)
  const y = parseInt(req.params.y)

  const tile = getTile(x, y)

  if (!tile) {
    return res.status(404).json({ error: 'Tile not found' })
  }

  const objectsHere = world.objects.filter(o => o.x === x && o.y === y)

  res.json({
    tile,
    objects: objectsHere,
    neighbors: {
      north: getTile(x, y - 1),
      south: getTile(x, y + 1),
      east: getTile(x + 1, y),
      west: getTile(x - 1, y)
    }
  })
})

// POST /world/tile/:x/:y - Set tile type
app.post('/world/tile/:x/:y', (req, res) => {
  const x = parseInt(req.params.x)
  const y = parseInt(req.params.y)
  const { type } = req.body

  if (!type || !TILE_DEFINITIONS[type as TileType]) {
    return res.status(400).json({ error: 'Invalid tile type' })
  }

  const success = setTile(x, y, type)

  if (!success) {
    return res.status(400).json({ error: 'Invalid coordinates' })
  }

  res.json({
    message: 'Tile updated',
    tile: getTile(x, y)
  })
})

// GET /world/objects - All objects
app.get('/world/objects', (req, res) => {
  res.json({
    objects: world.objects,
    count: world.objects.length
  })
})

// GET /world/objects/nearby?x=50&y=50&radius=10
app.get('/world/objects/nearby', (req, res) => {
  const x = parseInt(req.query.x as string) || 50
  const y = parseInt(req.query.y as string) || 50
  const radius = parseInt(req.query.radius as string) || 10

  const nearbyObjects = getObjectsInRadius(x, y, radius)

  res.json({
    x,
    y,
    radius,
    objects: nearbyObjects,
    count: nearbyObjects.length
  })
})

// POST /world/objects - Add object
app.post('/world/objects', (req, res) => {
  const { id, name, x, y, emoji, type, description, interactable, data } = req.body

  if (!id || !name || x === undefined || y === undefined) {
    return res.status(400).json({ error: 'Missing required fields: id, name, x, y' })
  }

  // Check if object with ID already exists
  if (world.objects.find(o => o.id === id)) {
    return res.status(400).json({ error: 'Object with this ID already exists' })
  }

  const newObject: WorldObject = {
    id,
    name,
    x,
    y,
    emoji: emoji || '❓',
    type: type || 'static',
    description: description || '',
    interactable: interactable || false,
    data: data || {}
  }

  world.objects.push(newObject)
  world.lastModified = new Date()

  res.json({
    message: 'Object added',
    object: newObject
  })
})

// DELETE /world/objects/:id
app.delete('/world/objects/:id', (req, res) => {
  const id = req.params.id
  const index = world.objects.findIndex(o => o.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Object not found' })
  }

  const removed = world.objects.splice(index, 1)[0]
  world.lastModified = new Date()

  res.json({
    message: 'Object removed',
    object: removed
  })
})

// GET /world/render - ASCII art rendering (debug)
app.get('/world/render', (req, res) => {
  const x = parseInt(req.query.x as string) || 50
  const y = parseInt(req.query.y as string) || 50
  const radius = parseInt(req.query.radius as string) || 10

  const ascii = renderASCII(x, y, radius)

  res.setHeader('Content-Type', 'text/plain')
  res.send(ascii)
})

// POST /world/weather - Set weather
app.post('/world/weather', (req, res) => {
  const { weather } = req.body

  if (!['sunny', 'rainy', 'cloudy', 'stormy'].includes(weather)) {
    return res.status(400).json({ error: 'Invalid weather type' })
  }

  world.weather = weather
  world.lastModified = new Date()

  res.json({
    message: 'Weather updated',
    weather: world.weather
  })
})

// POST /world/time - Set time of day
app.post('/world/time', (req, res) => {
  const { timeOfDay } = req.body

  if (!['dawn', 'day', 'dusk', 'night'].includes(timeOfDay)) {
    return res.status(400).json({ error: 'Invalid time of day' })
  }

  world.timeOfDay = timeOfDay
  world.lastModified = new Date()

  res.json({
    message: 'Time of day updated',
    timeOfDay: world.timeOfDay
  })
})

// POST /world/save - Save world to file
app.post('/world/save', async (req, res) => {
  await saveWorld()
  res.json({ message: 'World saved' })
})

// POST /world/reset - Reset world (regenerate)
app.post('/world/reset', (req, res) => {
  const seed = req.body.seed || Date.now()
  world = generateProceduralWorld(seed)

  res.json({
    message: 'World reset',
    seed: world.seed,
    size: world.size,
    objectCount: world.objects.length
  })
})

// GET /world/walkable/:x/:y - Check if position is walkable
app.get('/world/walkable/:x/:y', (req, res) => {
  const x = parseInt(req.params.x)
  const y = parseInt(req.params.y)

  res.json({
    x,
    y,
    walkable: isWalkable(x, y),
    tile: getTile(x, y)
  })
})

// ========== STARTUP ==========

app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║       🌍 WORLD ENGINE 2D v1.0                                     ║
║                                                                    ║
║  Toobix's living world - 100x100 tiles                           ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ Procedural generation                                         ║
║  ✅ 8 tile types (grass, tree, stone, water, flowers, etc.)      ║
║  ✅ Interactive objects                                           ║
║  ✅ Weather & time of day                                         ║
║  ✅ Collision detection                                           ║
║  ✅ Persistent storage (JSON)                                     ║
║  ✅ ASCII rendering (debug)                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🚀 Running on: http://localhost:${PORT}

📡 ENDPOINTS:
   GET  /world               - World info
   GET  /world/region        - Get tile region
   GET  /world/tile/:x/:y    - Get specific tile
   POST /world/tile/:x/:y    - Set tile type
   GET  /world/objects       - All objects
   GET  /world/objects/nearby - Objects in radius
   POST /world/objects       - Add object
   DELETE /world/objects/:id - Remove object
   GET  /world/render        - ASCII art rendering
   POST /world/weather       - Set weather
   POST /world/time          - Set time of day
   POST /world/save          - Save to file
   POST /world/reset         - Regenerate world
   GET  /world/walkable/:x/:y - Check walkable
   GET  /health              - Health check
`)

  // Try to load existing world
  const loaded = await loadWorld()

  if (!loaded) {
    // Generate new world
    world = generateProceduralWorld(Date.now())
    await saveWorld()
  }

  console.log(`
🌍 World Ready:
   Size: ${world.size}x${world.size} (${world.size * world.size} tiles)
   Objects: ${world.objects.length}
   Weather: ${world.weather}
   Time: ${world.timeOfDay}
   Seed: ${world.seed}

🎯 Sample view (center 50,50):
`)

  console.log(renderASCII(50, 50, 10))

  console.log(`
✨ Ready for Toobix's multi-body consciousness to inhabit!
`)
})

// Auto-save every 5 minutes
setInterval(() => {
  saveWorld()
}, 5 * 60 * 1000)

// Save on exit
process.on('SIGINT', async () => {
  console.log('\n💾 Saving world before exit...')
  await saveWorld()
  process.exit(0)
})

export { world, getTile, setTile, isWalkable, getObjectsInRadius }
