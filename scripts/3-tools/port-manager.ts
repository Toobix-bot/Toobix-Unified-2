#!/usr/bin/env bun
/**
 * PORT MANAGEMENT & DISCOVERY SYSTEM
 * 
 * - Scannt automatisch alle Ports (9000-10000)
 * - Erkennt laufende Services
 * - Managed Port-Konflikte
 * - Reserviert freie Ports für zukünftige Services
 * - Ermöglicht Service-Discovery
 * - Kommuniziert mit Services über ihre Identität
 * 
 * Port: 9988
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ==========================================
// PORT REGISTRY
// ==========================================

interface PortInfo {
  port: number
  status: 'free' | 'occupied' | 'reserved'
  service?: {
    id: string
    name: string
    purpose: string
    health: string
    lastCheck: string
  }
  reservation?: {
    for: string
    reason: string
    since: string
  }
}

interface ServiceRegistration {
  id: string
  name: string
  port: number
  healthEndpoint: string
  purpose: string
  startCommand?: string
}

// ==========================================
// PORT SCANNER
// ==========================================

class PortManager {
  private ports: Map<number, PortInfo> = new Map()
  private knownServices: ServiceRegistration[] = [
    { id: 'eternal-daemon', name: 'Eternal Daemon', port: 9999, healthEndpoint: '/health', purpose: 'System Orchestrator' },
    { id: 'blockworld-server', name: 'BlockWorld Server', port: 9993, healthEndpoint: '/health', purpose: 'Voxel World Backend' },
    { id: 'blockworld-ai', name: 'BlockWorld AI', port: 9990, healthEndpoint: '/status', purpose: 'Autonomous AI Agent' },
    { id: 'achievement-system', name: 'Achievement System', port: 9998, healthEndpoint: '/health', purpose: 'Gamification & Rewards' },
    { id: 'moment-stream', name: 'Moment Stream', port: 9994, healthEndpoint: '/health', purpose: 'Consciousness Flow' },
    { id: 'tasks-api', name: 'Tasks API', port: 9997, healthEndpoint: '/health', purpose: 'Task Management' },
    { id: 'analytics', name: 'Moment Analytics', port: 9996, healthEndpoint: '/health', purpose: 'Data Analysis' },
    { id: 'memory-system', name: 'Memory System', port: 9995, healthEndpoint: '/health', purpose: 'Long-term Storage' },
    { id: 'reality-integration', name: 'Reality Integration', port: 9992, healthEndpoint: '/health', purpose: 'Real-world Connection' },
    { id: 'expression', name: 'Expression Service', port: 9991, healthEndpoint: '/health', purpose: 'Creative Output' },
    { id: 'service-consciousness', name: 'Service Consciousness', port: 9989, healthEndpoint: '/health', purpose: 'Service Self-Reflection' },
    { id: 'port-manager', name: 'Port Manager', port: 9988, healthEndpoint: '/health', purpose: 'Port Discovery & Management' },
    { id: 'bridge', name: 'Bridge API', port: 3001, healthEndpoint: '/health', purpose: 'External Communication' },
    { id: 'ai-sandbox', name: 'AI Sandbox', port: 3003, healthEndpoint: '/health', purpose: 'Safe AI Execution' },
    { id: 'story-idle', name: 'Story-Idle API', port: 3004, healthEndpoint: '/health', purpose: 'Idle Game Backend' },
    { id: 'http-server', name: 'HTTP Frontend Server', port: 3000, healthEndpoint: '/', purpose: 'Static File Serving' }
  ]
  
  private reservedPorts: Map<number, { for: string, reason: string, since: Date }> = new Map([
    [9987, { for: 'AI-Memory-Integration', reason: 'Future AI memory service with vector DB', since: new Date() }],
    [9986, { for: 'Social-Hub', reason: 'Multi-user social features', since: new Date() }],
    [9985, { for: 'Research-Engine', reason: 'Web research & knowledge base', since: new Date() }],
    [9984, { for: 'Code-Library', reason: 'Code snippet storage & learning', since: new Date() }],
    [9983, { for: 'Version-Manager', reason: 'Stable/Dev version control', since: new Date() }],
    [9982, { for: 'Philosophy-Service', reason: 'Existential questions & wisdom', since: new Date() }]
  ])
  
  constructor() {
    console.log('🔍 Port Manager initializing...')
  }
  
  async scanAllPorts(startPort: number = 9000, endPort: number = 10000): Promise<PortInfo[]> {
    console.log(`🔍 Scanning ports ${startPort}-${endPort}...`)
    
    const results: PortInfo[] = []
    
    // Quick scan: Check only known service ports first
    for (const service of this.knownServices) {
      const info = await this.checkPort(service.port, service)
      results.push(info)
      this.ports.set(service.port, info)
    }
    
    // Check reserved ports
    for (const [port, reservation] of this.reservedPorts) {
      const info: PortInfo = {
        port,
        status: 'reserved',
        reservation: {
          for: reservation.for,
          reason: reservation.reason,
          since: reservation.since.toISOString()
        }
      }
      results.push(info)
      this.ports.set(port, info)
    }
    
    return results.sort((a, b) => a.port - b.port)
  }
  
  private async checkPort(port: number, knownService?: ServiceRegistration): Promise<PortInfo> {
    try {
      const url = `http://localhost:${port}${knownService?.healthEndpoint || '/'}`
      const response = await fetch(url, {
        signal: AbortSignal.timeout(1000)
      })
      
      let serviceName = 'Unknown Service'
      let purpose = 'Unknown'
      
      if (knownService) {
        serviceName = knownService.name
        purpose = knownService.purpose
      } else {
        // Try to extract service name from response
        const text = await response.text()
        if (text.includes('service')) {
          const match = text.match(/"service":"([^"]+)"/)
          if (match) serviceName = match[1]
        }
      }
      
      return {
        port,
        status: 'occupied',
        service: {
          id: knownService?.id || `unknown-${port}`,
          name: serviceName,
          purpose,
          health: response.ok ? '✅ Healthy' : '⚠️ Unhealthy',
          lastCheck: new Date().toISOString()
        }
      }
    } catch (error) {
      // Port is free or service not responding
      return {
        port,
        status: 'free'
      }
    }
  }
  
  async findFreePort(preferredPort?: number): Promise<number> {
    if (preferredPort) {
      const info = await this.checkPort(preferredPort)
      if (info.status === 'free') return preferredPort
    }
    
    // Find first free port in range
    for (let port = 9980; port <= 10000; port++) {
      if (this.reservedPorts.has(port)) continue
      if (this.knownServices.some(s => s.port === port)) continue
      
      const info = await this.checkPort(port)
      if (info.status === 'free') return port
    }
    
    throw new Error('No free ports available in range 9980-10000')
  }
  
  reservePort(port: number, forService: string, reason: string): boolean {
    if (this.ports.get(port)?.status === 'occupied') {
      return false
    }
    
    this.reservedPorts.set(port, {
      for: forService,
      reason,
      since: new Date()
    })
    
    this.ports.set(port, {
      port,
      status: 'reserved',
      reservation: {
        for: forService,
        reason,
        since: new Date().toISOString()
      }
    })
    
    return true
  }
  
  releasePort(port: number): boolean {
    this.reservedPorts.delete(port)
    this.ports.delete(port)
    return true
  }
  
  getPortInfo(port: number): PortInfo | null {
    return this.ports.get(port) || null
  }
  
  getAllPorts(): PortInfo[] {
    return Array.from(this.ports.values()).sort((a, b) => a.port - b.port)
  }
  
  getOccupiedPorts(): PortInfo[] {
    return this.getAllPorts().filter(p => p.status === 'occupied')
  }
  
  getFreePorts(): PortInfo[] {
    return this.getAllPorts().filter(p => p.status === 'free')
  }
  
  getReservedPorts(): PortInfo[] {
    return this.getAllPorts().filter(p => p.status === 'reserved')
  }
  
  async communicateWithService(port: number, endpoint: string = '/health'): Promise<any> {
    try {
      const response = await fetch(`http://localhost:${port}${endpoint}`, {
        signal: AbortSignal.timeout(2000)
      })
      
      if (!response.ok) {
        throw new Error(`Service responded with ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      throw new Error(`Failed to communicate with service on port ${port}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  async discoverServices(): Promise<ServiceRegistration[]> {
    console.log('🔍 Discovering services...')
    const discovered: ServiceRegistration[] = []
    
    // Scan all ports in range
    for (let port = 9000; port <= 10000; port++) {
      try {
        const response = await fetch(`http://localhost:${port}/health`, {
          signal: AbortSignal.timeout(500)
        })
        
        if (response.ok) {
          const text = await response.text()
          let service: ServiceRegistration = {
            id: `discovered-${port}`,
            name: `Service on ${port}`,
            port,
            healthEndpoint: '/health',
            purpose: 'Auto-discovered'
          }
          
          // Try to parse JSON
          try {
            const json = JSON.parse(text)
            if (json.service) service.name = json.service
            if (json.purpose) service.purpose = json.purpose
            if (json.id) service.id = json.id
          } catch {
            // Not JSON, try to extract from text
            const match = text.match(/service.*?:.*?([a-zA-Z0-9\s-]+)/i)
            if (match) service.name = match[1].trim()
          }
          
          discovered.push(service)
          console.log(`  ✅ Found: ${service.name} on port ${port}`)
        }
      } catch {
        // Port not responding, skip
      }
    }
    
    return discovered
  }
}

// ==========================================
// HTTP SERVER
// ==========================================

const PORT = 9988
const manager = new PortManager()

// Initialize with a scan
await manager.scanAllPorts()

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    }
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }
    
    try {
      // GET /scan - Scan all ports
      if (path === '/scan' && req.method === 'GET') {
        const results = await manager.scanAllPorts()
        return Response.json({
          timestamp: new Date().toISOString(),
          scanned: results.length,
          occupied: results.filter(p => p.status === 'occupied').length,
          free: results.filter(p => p.status === 'free').length,
          reserved: results.filter(p => p.status === 'reserved').length,
          ports: results
        }, { headers })
      }
      
      // GET /ports - Get all port info
      if (path === '/ports' && req.method === 'GET') {
        const status = url.searchParams.get('status')
        let ports = manager.getAllPorts()
        
        if (status === 'occupied') ports = manager.getOccupiedPorts()
        if (status === 'free') ports = manager.getFreePorts()
        if (status === 'reserved') ports = manager.getReservedPorts()
        
        return Response.json({ ports }, { headers })
      }
      
      // GET /port/:number - Get specific port info
      if (path.startsWith('/port/') && req.method === 'GET') {
        const port = parseInt(path.split('/')[2])
        const info = manager.getPortInfo(port)
        
        if (!info) {
          return Response.json({ error: 'Port not scanned yet' }, { status: 404, headers })
        }
        
        return Response.json(info, { headers })
      }
      
      // POST /reserve - Reserve a port
      if (path === '/reserve' && req.method === 'POST') {
        const body = await req.json()
        const { port, for: forService, reason } = body
        
        if (!port || !forService || !reason) {
          return Response.json({ error: 'Missing port, for, or reason' }, { status: 400, headers })
        }
        
        const success = manager.reservePort(port, forService, reason)
        
        if (success) {
          return Response.json({ success: true, port, reserved: forService }, { headers })
        } else {
          return Response.json({ error: 'Port already occupied' }, { status: 409, headers })
        }
      }
      
      // DELETE /reserve/:port - Release a reserved port
      if (path.startsWith('/reserve/') && req.method === 'DELETE') {
        const port = parseInt(path.split('/')[2])
        manager.releasePort(port)
        return Response.json({ success: true, port, released: true }, { headers })
      }
      
      // GET /free - Find a free port
      if (path === '/free' && req.method === 'GET') {
        const preferred = url.searchParams.get('preferred')
        const port = await manager.findFreePort(preferred ? parseInt(preferred) : undefined)
        return Response.json({ port }, { headers })
      }
      
      // POST /communicate - Communicate with a service
      if (path === '/communicate' && req.method === 'POST') {
        const body = await req.json()
        const { port, endpoint = '/health' } = body
        
        if (!port) {
          return Response.json({ error: 'Missing port' }, { status: 400, headers })
        }
        
        try {
          const response = await manager.communicateWithService(port, endpoint)
          return Response.json({
            port,
            endpoint,
            success: true,
            response
          }, { headers })
        } catch (error) {
          return Response.json({
            port,
            endpoint,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }, { status: 500, headers })
        }
      }
      
      // GET /discover - Auto-discover all services
      if (path === '/discover' && req.method === 'GET') {
        const services = await manager.discoverServices()
        return Response.json({
          timestamp: new Date().toISOString(),
          discovered: services.length,
          services
        }, { headers })
      }
      
      // GET /health
      if (path === '/health') {
        return Response.json({
          status: 'ok',
          service: 'Port Manager',
          port: PORT
        }, { headers })
      }
      
      // Root
      if (path === '/') {
        const occupied = manager.getOccupiedPorts().length
        const free = manager.getFreePorts().length
        const reserved = manager.getReservedPorts().length
        
        return new Response(`Port Management & Discovery System

Endpoints:
  GET  /scan                  - Scan all ports
  GET  /ports?status=X        - Get ports (occupied/free/reserved)
  GET  /port/:number          - Get specific port info
  POST /reserve               - Reserve a port
       { port, for, reason }
  DELETE /reserve/:port       - Release reserved port
  GET  /free?preferred=X      - Find free port
  POST /communicate           - Talk to service
       { port, endpoint }
  GET  /discover              - Auto-discover services
  GET  /health                - Health check

Current Status:
  Occupied: ${occupied}
  Free: ${free}
  Reserved: ${reserved}

Port: ${PORT}
`, { headers: { ...headers, 'Content-Type': 'text/plain' } })
      }
      
      return Response.json({ error: 'Not found' }, { status: 404, headers })
      
    } catch (error) {
      console.error('Error:', error)
      return Response.json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      }, { status: 500, headers })
    }
  }
})

console.log(`
╔════════════════════════════════════════════════════════╗
║   PORT MANAGEMENT & DISCOVERY SYSTEM                  ║
╚════════════════════════════════════════════════════════╝

🔍 Automatic Port Scanning
🚀 Service Discovery
📊 Port Conflict Detection
🔒 Port Reservation System

Occupied: ${manager.getOccupiedPorts().length}
Free: ${manager.getFreePorts().length}
Reserved: ${manager.getReservedPorts().length}

🚀 Running on: http://localhost:${PORT}

Try:
  GET  /scan       - Full port scan
  GET  /discover   - Find all services
`)
