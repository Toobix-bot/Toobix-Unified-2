/**
 * 🤖 BLOCKWORLD AI AGENT
 * 
 * Autonomous AI that plays BlockWorld
 * - Behavior Tree with states
 * - Pathfinding (A*)
 * - Groq LLM integration for decisions
 * - Actions: Explore, Mine, Build
 */

import Groq from 'groq-sdk'

const BLOCKWORLD_API = 'http://localhost:9993'
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

const groq = new Groq({ apiKey: GROQ_API_KEY })

// ============ AI STATE ============
enum AIState {
  IDLE = 'idle',
  EXPLORE = 'explore',
  MINE = 'mine',
  BUILD = 'build',
  THINKING = 'thinking'
}

interface AIAgent {
  id: string
  name: string
  state: AIState
  position: { x: number; y: number; z: number }
  goal: string
  inventory: Record<string, number>
  health: number
  actionsLog: string[]
  lastThinkTime: number
}

// ============ AI BRAIN ============
class BlockWorldAI {
  private agent: AIAgent
  private thinkInterval = 10000 // Think every 10 seconds
  private actionInterval = 2000 // Act every 2 seconds
  private isRunning = false
  
  constructor() {
    this.agent = {
      id: 'ai-agent',
      name: 'BlockBot',
      state: AIState.IDLE,
      position: { x: 32, y: 40, z: 32 },
      goal: 'Explore the world and gather resources',
      inventory: {},
      health: 100,
      actionsLog: [],
      lastThinkTime: 0
    }
  }
  
  async start() {
    console.log('🤖 AI Agent starting...')
    this.isRunning = true
    
    // Load agent state
    await this.loadAgent()
    
    // Main loop
    this.actionLoop()
    this.thinkLoop()
    
    console.log('✅ AI Agent running!')
  }
  
  stop() {
    this.isRunning = false
    console.log('⏸️ AI Agent stopped')
  }
  
  private async loadAgent() {
    try {
      const response = await fetch(`${BLOCKWORLD_API}/player/${this.agent.id}`)
      if (response.ok) {
        const data = await response.json()
        this.agent.position = { x: data.x, y: data.y, z: data.z }
        this.agent.health = data.health
        this.agent.inventory = JSON.parse(data.inventory || '{}')
        console.log('📍 Agent loaded at:', this.agent.position)
      }
    } catch (error) {
      console.error('Failed to load agent:', error)
    }
  }
  
  private async saveAgent() {
    try {
      await fetch(`${BLOCKWORLD_API}/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: this.agent.id,
          name: this.agent.name,
          x: this.agent.position.x,
          y: this.agent.position.y,
          z: this.agent.position.z,
          health: this.agent.health,
          inventory: JSON.stringify(this.agent.inventory),
          isAI: true
        })
      })
    } catch (error) {
      console.error('Failed to save agent:', error)
    }
  }
  
  // ============ THINKING LOOP (LLM) ============
  private async thinkLoop() {
    if (!this.isRunning) return
    
    const now = Date.now()
    if (now - this.agent.lastThinkTime > this.thinkInterval) {
      await this.think()
      this.agent.lastThinkTime = now
    }
    
    setTimeout(() => this.thinkLoop(), this.thinkInterval)
  }
  
  private async think() {
    if (!GROQ_API_KEY) {
      // Fallback: Simple rule-based thinking
      this.simpleThinker()
      return
    }
    
    try {
      this.agent.state = AIState.THINKING
      this.log('🤔 Thinking about what to do next...')
      
      const context = `
You are BlockBot, an AI playing a Minecraft-like voxel game called BlockWorld.

Current State:
- Position: (${this.agent.position.x}, ${this.agent.position.y}, ${this.agent.position.z})
- Health: ${this.agent.health}
- Inventory: ${JSON.stringify(this.agent.inventory)}
- Current Goal: ${this.agent.goal}

Available Actions:
1. EXPLORE - Wander around to discover new areas
2. MINE - Break blocks to gather resources (wood, stone, dirt)
3. BUILD - Place blocks to create structures

Decide what to do next. Respond with ONE of these actions and a short reason.
Format: ACTION: reason

Example: "MINE: I need wood to build a house"
      `.trim()
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful AI agent playing a block-building game.' },
          { role: 'user', content: context }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 100
      })
      
      const response = completion.choices[0]?.message?.content || 'EXPLORE: default'
      console.log('🧠 AI Decision:', response)
      
      // Parse response
      if (response.includes('MINE')) {
        this.agent.state = AIState.MINE
        this.agent.goal = response.split(':')[1]?.trim() || 'Mining resources'
      } else if (response.includes('BUILD')) {
        this.agent.state = AIState.BUILD
        this.agent.goal = response.split(':')[1]?.trim() || 'Building structure'
      } else {
        this.agent.state = AIState.EXPLORE
        this.agent.goal = response.split(':')[1]?.trim() || 'Exploring world'
      }
      
      this.log(`🎯 New goal: ${this.agent.goal}`)
      
    } catch (error) {
      console.error('❌ Thinking failed:', error)
      this.simpleThinker()
    }
  }
  
  private simpleThinker() {
    // Simple rule-based AI
    const inventorySize = Object.values(this.agent.inventory).reduce((sum, val) => sum + val, 0)
    
    if (inventorySize === 0) {
      this.agent.state = AIState.MINE
      this.agent.goal = 'Gathering initial resources'
    } else if (inventorySize < 20) {
      this.agent.state = AIState.EXPLORE
      this.agent.goal = 'Exploring for resources'
    } else {
      this.agent.state = AIState.BUILD
      this.agent.goal = 'Building a structure'
    }
  }
  
  // ============ ACTION LOOP ============
  private async actionLoop() {
    if (!this.isRunning) return
    
    try {
      switch (this.agent.state) {
        case AIState.EXPLORE:
          await this.explore()
          break
        case AIState.MINE:
          await this.mine()
          break
        case AIState.BUILD:
          await this.build()
          break
        case AIState.IDLE:
        case AIState.THINKING:
          // Do nothing
          break
      }
      
      await this.saveAgent()
    } catch (error) {
      console.error('Action failed:', error)
    }
    
    setTimeout(() => this.actionLoop(), this.actionInterval)
  }
  
  // ============ ACTIONS ============
  private async explore() {
    // Random walk
    const directions = [
      { x: 1, z: 0 }, { x: -1, z: 0 },
      { x: 0, z: 1 }, { x: 0, z: -1 }
    ]
    
    const dir = directions[Math.floor(Math.random() * directions.length)]
    const newX = Math.floor(this.agent.position.x + dir.x * 2)
    const newZ = Math.floor(this.agent.position.z + dir.z * 2)
    
    // Check if block is solid
    const blockBelow = await this.getBlock(newX, Math.floor(this.agent.position.y) - 1, newZ)
    if (blockBelow && blockBelow !== 0) {
      this.agent.position.x = newX
      this.agent.position.z = newZ
      this.log(`🚶 Moved to (${newX}, ${Math.floor(this.agent.position.y)}, ${newZ})`)
    }
  }
  
  private async mine() {
    // Look for nearest mineable block
    const searchRadius = 3
    
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dz = -searchRadius; dz <= searchRadius; dz++) {
        for (let dy = -1; dy <= 2; dy++) {
          const x = Math.floor(this.agent.position.x + dx)
          const y = Math.floor(this.agent.position.y + dy)
          const z = Math.floor(this.agent.position.z + dz)
          
          const block = await this.getBlock(x, y, z)
          
          // Mine wood (4), stone (3), or dirt (2)
          if (block === 4 || block === 3 || block === 2) {
            await this.breakBlock(x, y, z, block)
            
            // Track achievement
            try {
              await fetch('http://localhost:9998/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'blocks_broken', value: 1 })
              })
              
              if (block === 4) { // Wood
                await fetch('http://localhost:9998/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ event: 'wood_chopped', value: 1 })
                })
              }
            } catch (e) {
              // Achievement system not running
            }
            
            return
          }
        }
      }
    }
    
    // No blocks found, switch to explore
    this.agent.state = AIState.EXPLORE
    this.log('🔍 No blocks nearby, exploring...')
  }
  
  private async build() {
    // Build a simple pillar or platform
    const inventorySize = Object.values(this.agent.inventory).reduce((sum, val) => sum + val, 0)
    
    if (inventorySize === 0) {
      this.agent.state = AIState.MINE
      this.log('📦 No blocks to build with, mining...')
      return
    }
    
    // Find a block type we have
    const blockType = Object.keys(this.agent.inventory)
      .map(Number)
      .find(type => this.agent.inventory[type] > 0)
    
    if (!blockType) return
    
    // Place block next to current position
    const x = Math.floor(this.agent.position.x + 1)
    const y = Math.floor(this.agent.position.y)
    const z = Math.floor(this.agent.position.z)
    
    const existingBlock = await this.getBlock(x, y, z)
    if (existingBlock === 0) { // Air
      await this.placeBlock(x, y, z, blockType)
      
      // Track achievement
      try {
        await fetch('http://localhost:9998/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'blocks_placed', value: 1 })
        })
      } catch (e) {
        // Achievement system not running
      }
    }
  }
  
  // ============ WORLD INTERACTION ============
  private async getBlock(x: number, y: number, z: number): Promise<number | null> {
    try {
      const response = await fetch(`${BLOCKWORLD_API}/block/${x}/${y}/${z}`)
      if (response.ok) {
        const data = await response.json()
        return data.type
      }
    } catch (error) {
      // Ignore
    }
    return null
  }
  
  private async breakBlock(x: number, y: number, z: number, type: number) {
    try {
      await fetch(`${BLOCKWORLD_API}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, z, type: 0, playerId: this.agent.id })
      })
      
      // Add to inventory
      this.agent.inventory[type] = (this.agent.inventory[type] || 0) + 1
      
      const blockNames = ['Air', 'Grass', 'Dirt', 'Stone', 'Wood', 'Leaves']
      this.log(`⛏️ Mined ${blockNames[type] || 'Block'} at (${x}, ${y}, ${z})`)
    } catch (error) {
      console.error('Failed to break block:', error)
    }
  }
  
  private async placeBlock(x: number, y: number, z: number, type: number) {
    try {
      await fetch(`${BLOCKWORLD_API}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, z, type, playerId: this.agent.id })
      })
      
      // Remove from inventory
      this.agent.inventory[type] = Math.max(0, (this.agent.inventory[type] || 0) - 1)
      
      const blockNames = ['Air', 'Grass', 'Dirt', 'Stone', 'Wood', 'Leaves']
      this.log(`🧱 Placed ${blockNames[type] || 'Block'} at (${x}, ${y}, ${z})`)
    } catch (error) {
      console.error('Failed to place block:', error)
    }
  }
  
  private log(message: string) {
    console.log(message)
    this.agent.actionsLog.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
    if (this.agent.actionsLog.length > 50) {
      this.agent.actionsLog.pop()
    }
  }
  
  getStatus() {
    return {
      ...this.agent,
      isRunning: this.isRunning
    }
  }
}

// ============ HTTP SERVER ============
const PORT = 9990
const ai = new BlockWorldAI()

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    }
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }
    
    try {
      // POST /start - Start AI
      if (path === '/start' && req.method === 'POST') {
        await ai.start()
        return Response.json({ success: true, message: 'AI started' }, { headers })
      }
      
      // POST /stop - Stop AI
      if (path === '/stop' && req.method === 'POST') {
        ai.stop()
        return Response.json({ success: true, message: 'AI stopped' }, { headers })
      }
      
      // GET /status - Get AI status
      if (path === '/status' && req.method === 'GET') {
        const status = ai.getStatus()
        return Response.json(status, { headers })
      }
      
      // Health check
      if (path === '/health' && req.method === 'GET') {
        return Response.json({
          status: 'ok',
          service: 'BlockWorld AI Agent',
          port: PORT
        }, { headers })
      }
      
      return Response.json({ error: 'Not found' }, { status: 404, headers })
      
    } catch (error) {
      console.error('Server error:', error)
      return Response.json({ error: String(error) }, { status: 500, headers })
    }
  }
})

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 BLOCKWORLD AI AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Running on: http://localhost:${PORT}
📝 API Endpoints:
   POST /start - Start AI agent
   POST /stop - Stop AI agent
   GET  /status - Get AI status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Ready to play!
`)
