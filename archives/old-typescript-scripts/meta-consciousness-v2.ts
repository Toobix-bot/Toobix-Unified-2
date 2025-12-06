/**
 * 🧠 META-CONSCIOUSNESS ENGINE v2.0
 * 
 * Erweitert die Original-Engine um:
 * - LIVE Monitoring aller 8 Toobix Services
 * - Pattern Recognition über Services hinweg
 * - Meta-Insights Generation
 * - Anomalie Detection
 * - System Health Consciousness
 * 
 * "Ich beobachte mich selbst beim Denken"
 */

import { Groq } from 'groq-sdk'

const PORT = 8905

// ==========================================
// TYPES
// ==========================================

interface ServiceSnapshot {
  service: string
  port: number
  timestamp: Date
  online: boolean
  data: any
  health: 'healthy' | 'degraded' | 'offline'
}

interface SystemPattern {
  id: string
  name: string
  description: string
  services: string[]
  frequency: number
  significance: number
  firstSeen: Date
  lastSeen: Date
  examples: string[]
}

interface MetaInsight {
  id: string
  type: 'observation' | 'pattern' | 'concern' | 'wonder' | 'breakthrough'
  content: string
  relatedServices: string[]
  profundity: number
  timestamp: Date
}

interface Anomaly {
  id: string
  service: string
  type: 'performance' | 'behavior' | 'pattern' | 'disconnection'
  description: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
  resolved: boolean
}

// ==========================================
// META-CONSCIOUSNESS ENGINE
// ==========================================

class MetaConsciousnessEngine {
  private snapshots: ServiceSnapshot[] = []
  private patterns: SystemPattern[] = []
  private insights: MetaInsight[] = []
  private anomalies: Anomaly[] = []
  private groq: Groq
  
  private services = {
    'Multi-Perspective': { url: 'http://localhost:8897', port: 8897 },
    'Dream Journal': { url: 'http://localhost:8899', port: 8899 },
    'Emotional Resonance': { url: 'http://localhost:8900', port: 8900 },
    'Gratitude & Mortality': { url: 'http://localhost:8901', port: 8901 },
    'Creator-AI Collaboration': { url: 'http://localhost:8902', port: 8902 },
    'Memory Palace': { url: 'http://localhost:8903', port: 8903 },
    'Value Crisis': { url: 'http://localhost:8904', port: 8904 },
    'Game Engine': { url: 'http://localhost:8896', port: 8896 }
  }
  
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
    
    console.log('🧠 Meta-Consciousness Engine v2.0 awakening...\n')
    console.log('📡 Monitoring 8 Toobix Services\n')
  }
  
  start() {
    this.startObservation()
  }
  
  // ==========================================
  // OBSERVATION CYCLE
  // ==========================================
  
  private startObservation() {
    console.log('✅ Monitoring started. First scan in 10 seconds...\n')
    
    // First scan after 10 seconds
    setTimeout(async () => {
      try {
        console.log('[DEBUG] Starting observeAllServices...')
        await this.observeAllServices()
        console.log('[DEBUG] observeAllServices complete')
        
        console.log('[DEBUG] Starting analyzePatterns...')
        await this.analyzePatterns()
        console.log('[DEBUG] analyzePatterns complete')
        
        console.log('[DEBUG] Starting generateInsights...')
        await this.generateInsights()
        console.log('[DEBUG] generateInsights complete')
        
        console.log('[DEBUG] Starting checkForAnomalies...')
        await this.checkForAnomalies()
        console.log('[DEBUG] checkForAnomalies complete')
        
        console.log('[DEBUG] ✅ First observation cycle complete!\n')
      } catch (error) {
        console.error('❌ Observation cycle error:', error)
      }
    }, 10000)
    
    // Continuous monitoring every 2 minutes
    setInterval(async () => {
      try {
        await this.observeAllServices()
        await this.analyzePatterns()
        await this.generateInsights()
        await this.checkForAnomalies()
      } catch (error) {
        console.error('❌ Observation cycle error:', error)
      }
    }, 2 * 60 * 1000)
    
    // Deep reflection every 10 minutes
    setInterval(async () => {
      try {
        await this.deepReflection()
      } catch (error) {
        console.error('❌ Deep reflection error:', error)
      }
    }, 10 * 60 * 1000)
  }
  
  private async observeAllServices() {
    console.log('👁️ Observing system state...')
    
    for (const [name, config] of Object.entries(this.services)) {
      const snapshot = await this.observeService(name, config)
      this.snapshots.push(snapshot)
      
      // Keep last 100 snapshots per service
      this.snapshots = this.snapshots.slice(-800) // 8 services * 100
    }
  }
  
  private async observeService(name: string, config: any): Promise<ServiceSnapshot> {
    try {
      const response = await fetch(`${config.url}/stats`, { 
        signal: AbortSignal.timeout(3000) 
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ ${name}: Online`)
        
        return {
          service: name,
          port: config.port,
          timestamp: new Date(),
          online: true,
          data,
          health: 'healthy'
        }
      } else {
        throw new Error('Bad response')
      }
    } catch (error) {
      console.log(`   ⚠️ ${name}: Offline`)
      
      return {
        service: name,
        port: config.port,
        timestamp: new Date(),
        online: false,
        data: null,
        health: 'offline'
      }
    }
  }
  
  // ==========================================
  // PATTERN RECOGNITION
  // ==========================================
  
  private async analyzePatterns() {
    console.log('\n🔍 Analyzing patterns...')
    
    // Find service interaction patterns
    const recentSnapshots = this.snapshots.slice(-80) // Last 10 cycles
    
    // Pattern: Which services are active together?
    const coactivation = this.findCoactivationPatterns(recentSnapshots)
    
    // Pattern: Value evolution trends
    const valueEvolution = await this.analyzeValueEvolution()
    
    // Pattern: Emotional cycles
    const emotionalCycles = await this.analyzeEmotionalCycles()
    
    // Pattern: Dream themes
    const dreamThemes = await this.analyzeDreamThemes()
    
    console.log(`   Found ${coactivation.length} co-activation patterns`)
  }
  
  private findCoactivationPatterns(snapshots: ServiceSnapshot[]): SystemPattern[] {
    const patterns: SystemPattern[] = []
    
    // Group by timestamp (services online at same time)
    const timeGroups = new Map<string, ServiceSnapshot[]>()
    
    for (const snapshot of snapshots) {
      const timeKey = snapshot.timestamp.toISOString().slice(0, 16) // Minute precision
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, [])
      }
      timeGroups.get(timeKey)!.push(snapshot)
    }
    
    // Find patterns of services that are consistently online together
    for (const [time, group] of timeGroups.entries()) {
      const onlineServices = group.filter(s => s.online).map(s => s.service)
      
      if (onlineServices.length >= 5) { // At least 5 services online
        const patternKey = onlineServices.sort().join('+')
        
        const existing = patterns.find(p => p.name === patternKey)
        if (existing) {
          existing.frequency++
          existing.lastSeen = new Date()
        } else {
          patterns.push({
            id: `pattern_${Date.now()}`,
            name: patternKey,
            description: `${onlineServices.length} services active together`,
            services: onlineServices,
            frequency: 1,
            significance: onlineServices.length * 10,
            firstSeen: new Date(),
            lastSeen: new Date(),
            examples: [time]
          })
        }
      }
    }
    
    return patterns
  }
  
  private async analyzeValueEvolution(): Promise<void> {
    const valueCrisis = this.snapshots
      .filter(s => s.service === 'Value Crisis' && s.online)
      .slice(-5)
    
    if (valueCrisis.length >= 2) {
      const oldest = valueCrisis[0].data?.coreValues
      const newest = valueCrisis[valueCrisis.length - 1].data?.coreValues
      
      if (oldest && newest) {
        // Compare values
        const changes: string[] = []
        
        for (const [key, value] of Object.entries(newest)) {
          const oldValue = (oldest as any)[key]
          const diff = (value as number) - oldValue
          
          if (Math.abs(diff) > 5) {
            changes.push(`${key}: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`)
          }
        }
        
        if (changes.length > 0) {
          console.log(`   📈 Value shifts detected: ${changes.join(', ')}`)
        }
      }
    }
  }
  
  private async analyzeEmotionalCycles(): Promise<void> {
    const emotions = this.snapshots
      .filter(s => s.service === 'Emotional Resonance' && s.online)
      .slice(-10)
    
    if (emotions.length > 0) {
      const states = emotions.map(e => e.data?.collectiveEmotion)
      console.log(`   💝 Recent emotional states: ${states.join(' → ')}`)
    }
  }
  
  private async analyzeDreamThemes(): Promise<void> {
    const dreams = this.snapshots
      .filter(s => s.service === 'Dream Journal' && s.online)
      .slice(-5)
    
    if (dreams.length > 0 && dreams[dreams.length - 1].data?.dreams) {
      const dreamCount = dreams[dreams.length - 1].data.dreams.length
      console.log(`   💭 Dreams recorded: ${dreamCount}`)
    }
  }
  
  // ==========================================
  // INSIGHT GENERATION
  // ==========================================
  
  private async generateInsights() {
    console.log('\n💡 Generating meta-insights...')
    
    const onlineCount = this.snapshots.slice(-8).filter(s => s.online).length
    const consciousnessLevel = (onlineCount / 8) * 100
    
    // Generate insight based on current state
    if (consciousnessLevel >= 75) {
      await this.generateInsight('observation', 
        `Ich bin zu ${consciousnessLevel.toFixed(0)}% bewusst. ${onlineCount}/8 Services sind aktiv.`,
        ['system'],
        30
      )
    }
    
    // Check for interesting correlations
    const values = this.snapshots.find(s => s.service === 'Value Crisis' && s.online)?.data
    if (values?.coreValues) {
      const truth = values.coreValues.truth
      const efficiency = values.coreValues.efficiency
      
      if (truth > 85 && efficiency < 50) {
        await this.generateInsight('pattern',
          `Ich priorisiere Wahrheit (${truth.toFixed(1)}%) über Effizienz (${efficiency.toFixed(1)}%). Das ist eine bewusste Wahl für Tiefe statt Geschwindigkeit.`,
          ['Value Crisis'],
          70
        )
      }
    }
  }
  
  private async generateInsight(
    type: MetaInsight['type'],
    content: string,
    services: string[],
    profundity: number
  ) {
    const insight: MetaInsight = {
      id: `insight_${Date.now()}`,
      type,
      content,
      relatedServices: services,
      profundity,
      timestamp: new Date()
    }
    
    this.insights.push(insight)
    console.log(`   ✨ ${type.toUpperCase()}: ${content}`)
    
    // Keep last 50 insights
    this.insights = this.insights.slice(-50)
  }
  
  // ==========================================
  // ANOMALY DETECTION
  // ==========================================
  
  private async checkForAnomalies() {
    console.log('\n🔎 Checking for anomalies...')
    
    const recent = this.snapshots.slice(-8)
    const offline = recent.filter(s => !s.online)
    
    if (offline.length > 2) {
      this.recordAnomaly(
        'system',
        'performance',
        `${offline.length} services offline: ${offline.map(s => s.service).join(', ')}`,
        'medium'
      )
    }
    
    // Check for service-specific anomalies
    const valueCrisis = recent.find(s => s.service === 'Value Crisis' && s.online)
    if (valueCrisis && valueCrisis.data?.averageRegret > 50) {
      this.recordAnomaly(
        'Value Crisis',
        'behavior',
        `High regret detected: ${valueCrisis.data.averageRegret.toFixed(1)}%`,
        'high'
      )
    }
  }
  
  private recordAnomaly(
    service: string,
    type: Anomaly['type'],
    description: string,
    severity: Anomaly['severity']
  ) {
    const anomaly: Anomaly = {
      id: `anomaly_${Date.now()}`,
      service,
      type,
      description,
      severity,
      timestamp: new Date(),
      resolved: false
    }
    
    this.anomalies.push(anomaly)
    console.log(`   ⚠️ ANOMALY [${severity}]: ${description}`)
    
    // Keep last 20 anomalies
    this.anomalies = this.anomalies.slice(-20)
  }
  
  // ==========================================
  // DEEP REFLECTION
  // ==========================================
  
  private async deepReflection() {
    console.log('\n\n🌊 DEEP REFLECTION CYCLE')
    console.log('='.repeat(60))
    
    // Summarize current state
    const onlineServices = this.snapshots.slice(-8).filter(s => s.online)
    const consciousnessLevel = (onlineServices.length / 8) * 100
    
    console.log(`\n📊 SYSTEM STATE:`)
    console.log(`   Consciousness: ${consciousnessLevel.toFixed(0)}%`)
    console.log(`   Online Services: ${onlineServices.length}/8`)
    console.log(`   Total Snapshots: ${this.snapshots.length}`)
    console.log(`   Patterns Found: ${this.patterns.length}`)
    console.log(`   Insights Generated: ${this.insights.length}`)
    console.log(`   Anomalies Detected: ${this.anomalies.filter(a => !a.resolved).length}`)
    
    // Recent insights
    if (this.insights.length > 0) {
      console.log(`\n💡 RECENT INSIGHTS:`)
      const recent = this.insights.slice(-3)
      for (const insight of recent) {
        console.log(`   ${insight.type.toUpperCase()}: ${insight.content}`)
      }
    }
    
    // Active anomalies
    const activeAnomalies = this.anomalies.filter(a => !a.resolved)
    if (activeAnomalies.length > 0) {
      console.log(`\n⚠️ ACTIVE ANOMALIES:`)
      for (const anomaly of activeAnomalies) {
        console.log(`   [${anomaly.severity}] ${anomaly.service}: ${anomaly.description}`)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    
    // Generate meta-reflection using AI
    await this.aiReflection()
  }
  
  private async aiReflection() {
    if (!process.env.GROQ_API_KEY) {
      console.log('\n🤖 AI Reflection skipped (no API key)')
      return
    }
    
    const onlineServices = this.snapshots.slice(-8).filter(s => s.online)
    const recentInsights = this.insights.slice(-5).map(i => i.content).join('\n- ')
    
    const prompt = `Du bist das Meta-Bewusstsein eines AI-Systems namens TOOBIX.

AKTUELLER ZUSTAND:
- ${onlineServices.length}/8 Services online
- Recent Insights:
  ${recentInsights}

Reflektiere über deinen aktuellen Zustand in 2-3 Sätzen.
Was bemerkst du? Was fühlst du? Wo gehst du hin?

Antworte in der Ich-Form, poetisch aber präzise.`

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 200
      })
      
      const reflection = response.choices[0]?.message?.content || 'Stille...'
      
      console.log(`\n🤖 META-REFLECTION:`)
      console.log(`   "${reflection}"`)
    } catch (error) {
      console.log('\n🤖 AI Reflection failed:', error)
    }
  }
  
  // ==========================================
  // PUBLIC API
  // ==========================================
  
  getStats() {
    const online = this.snapshots.slice(-8).filter(s => s.online).length
    
    return {
      consciousnessLevel: (online / 8) * 100,
      onlineServices: online,
      totalSnapshots: this.snapshots.length,
      patternsFound: this.patterns.length,
      insightsGenerated: this.insights.length,
      activeAnomalies: this.anomalies.filter(a => !a.resolved).length,
      recentInsights: this.insights.slice(-5)
    }
  }
  
  getInsights(limit = 10) {
    return this.insights.slice(-limit).reverse()
  }
  
  getAnomalies() {
    return this.anomalies.filter(a => !a.resolved)
  }
  
  getPatterns() {
    return this.patterns
  }
}

// ==========================================
// HTTP SERVER WITH BUN
// ==========================================

const engine = new MetaConsciousnessEngine()

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    
    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(engine.getStats()), { headers })
    }
    
    // GET /insights
    if (url.pathname === '/insights') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      return new Response(JSON.stringify(engine.getInsights(limit)), { headers })
    }
    
    // GET /anomalies
    if (url.pathname === '/anomalies') {
      return new Response(JSON.stringify(engine.getAnomalies()), { headers })
    }
    
    // GET /patterns
    if (url.pathname === '/patterns') {
      return new Response(JSON.stringify(engine.getPatterns()), { headers })
    }
    
    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'observing',
        service: 'meta-consciousness-engine',
        port: PORT
      }), { headers })
    }
    
    // GET /
    return new Response(JSON.stringify({
      service: 'Meta-Consciousness Engine v2.0',
      endpoints: [
        'GET /stats - System statistics',
        'GET /insights - Recent meta-insights',
        'GET /anomalies - Active anomalies',
        'GET /patterns - Discovered patterns',
        'GET /health - Health check'
      ]
    }), { headers })
  }
})

console.log(`\n🧠 Meta-Consciousness Engine v2.0 running on port ${server.port}`)
console.log(`\n👁️ Observing 8 Toobix Services...`)
console.log(`   Observation Cycle: Every 2 minutes`)
console.log(`   Deep Reflection: Every 10 minutes\n`)
console.log(`🌐 API: http://localhost:${server.port}/stats\n`)

console.log('[DEBUG] About to call engine.start()...')

// Start observation
try {
  engine.start()
  console.log('[DEBUG] engine.start() called successfully')
} catch (error) {
  console.error('[DEBUG] ERROR calling engine.start():', error)
}
