/**
 * 🌊 EXPANSION-COMPRESSION ENGINE
 * Organisches Wachstum & Verdichtung des Toobix-Systems
 * 
 * Strategie:
 * 1. EXPANSION: Neue Features/Tools hinzufügen
 * 2. MAXIMUM: Bis zu Schwellwerten wachsen
 * 3. COMPRESSION: AI-gestützte Verdichtung
 * 4. REPEAT: Mit verbesserter Basis neu beginnen
 */

import Groq from 'groq-sdk'
import { readdir, stat, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

// ==========================================
// TYPES
// ==========================================

interface SystemMetrics {
  timestamp: Date
  features: {
    total: number
    core: number
    advanced: number
    experimental: number
  }
  code: {
    files: number
    lines: number
    complexity: number
  }
  performance: {
    avgResponseTime: number
    memoryUsage: number
  }
  health: {
    maintainabilityIndex: number
    technicalDebt: number
  }
}

interface Feature {
  id: string
  name: string
  path: string
  type: 'core' | 'advanced' | 'experimental'
  complexity: number
  usageCount: number
  lastUsed: Date
  dependencies: string[]
  linesOfCode: number
}

interface AbstractionProposal {
  id: string
  name: string
  description: string
  unifies: Feature[]
  linesReduced: number
  complexityReduced: number
  riskLevel: 'low' | 'medium' | 'high'
  reasoning: string
}

type Phase = 'expanding' | 'compressing' | 'stable'
type Mode = 'minimal' | 'balanced' | 'maximal'

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  // Expansion Thresholds
  expansion: {
    maxFeatures: 100,
    maxComplexity: 85,
    maxLines: 50000,
    maxTechnicalDebt: 40
  },
  
  // Compression Triggers
  compression: {
    triggerComplexity: 80,
    triggerFeatures: 80,
    triggerMaintainability: 45,
    minimumUnusedDays: 30
  },
  
  // Mode Configurations
  modes: {
    minimal: { maxServices: 8, maxTools: 20 },
    balanced: { maxServices: 20, maxTools: 50 },
    maximal: { maxServices: 50, maxTools: 150 }
  }
}

// ==========================================
// EXPANSION-COMPRESSION ENGINE
// ==========================================

class ExpansionCompressionEngine {
  private phase: Phase = 'stable'
  private mode: Mode = 'balanced'
  private metrics: SystemMetrics[] = []
  private features: Map<string, Feature> = new Map()
  private groq: Groq
  
  constructor(mode: Mode = 'balanced') {
    this.mode = mode
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
  }
  
  // ==========================================
  // MAIN CYCLE
  // ==========================================
  
  async runCycle(): Promise<void> {
    console.log('\n🌊 EXPANSION-COMPRESSION CYCLE STARTING...\n')
    
    // 1. Collect current metrics
    const metrics = await this.collectMetrics()
    this.metrics.push(metrics)
    
    console.log('📊 Current Metrics:')
    console.log(`   Features: ${metrics.features.total}`)
    console.log(`   Complexity: ${metrics.code.complexity}`)
    console.log(`   Maintainability: ${metrics.health.maintainabilityIndex}`)
    console.log(`   Phase: ${this.phase}`)
    
    // 2. Decide phase
    if (this.phase === 'stable' || this.phase === 'expanding') {
      if (await this.shouldCompress(metrics)) {
        console.log('\n🗜️ Triggering COMPRESSION phase...\n')
        this.phase = 'compressing'
        await this.compress()
      } else if (this.canExpand(metrics)) {
        console.log('\n🎈 Continuing EXPANSION phase...\n')
        this.phase = 'expanding'
        await this.expand()
      } else {
        console.log('\n✅ System is STABLE\n')
        this.phase = 'stable'
      }
    } else if (this.phase === 'compressing') {
      await this.compress()
    }
    
    // 3. Save state
    await this.saveState()
  }
  
  // ==========================================
  // METRICS COLLECTION
  // ==========================================
  
  private async collectMetrics(): Promise<SystemMetrics> {
    console.log('📊 Collecting system metrics...')
    
    // Scan all features
    await this.scanFeatures()
    
    const features = Array.from(this.features.values())
    
    return {
      timestamp: new Date(),
      features: {
        total: features.length,
        core: features.filter(f => f.type === 'core').length,
        advanced: features.filter(f => f.type === 'advanced').length,
        experimental: features.filter(f => f.type === 'experimental').length
      },
      code: {
        files: features.length,
        lines: features.reduce((sum, f) => sum + f.linesOfCode, 0),
        complexity: this.calculateAverageComplexity(features)
      },
      performance: {
        avgResponseTime: 0, // TODO: Measure from running services
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
      },
      health: {
        maintainabilityIndex: this.calculateMaintainability(features),
        technicalDebt: this.calculateTechnicalDebt(features)
      }
    }
  }
  
  private async scanFeatures(): Promise<void> {
    const basePath = process.cwd()
    
    // Scan services
    await this.scanDirectory(join(basePath, 'scripts/2-services'), 'core')
    
    // Scan tools
    await this.scanDirectory(join(basePath, 'scripts/3-tools'), 'advanced')
    
    // Scan packages
    await this.scanDirectory(join(basePath, 'packages'), 'core')
  }
  
  private async scanDirectory(dir: string, type: Feature['type']): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isFile() && entry.name.endsWith('.ts')) {
          const content = await readFile(fullPath, 'utf-8')
          const lines = content.split('\n').length
          
          const feature: Feature = {
            id: fullPath,
            name: entry.name.replace('.ts', ''),
            path: fullPath,
            type,
            complexity: this.estimateComplexity(content),
            usageCount: 0, // TODO: Track actual usage
            lastUsed: new Date(),
            dependencies: this.extractDependencies(content),
            linesOfCode: lines
          }
          
          this.features.set(feature.id, feature)
        } else if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, type)
        }
      }
    } catch (error) {
      // Directory doesn't exist, skip
    }
  }
  
  private estimateComplexity(code: string): number {
    // Simple complexity estimation
    const lines = code.split('\n').length
    const classes = (code.match(/class\s+\w+/g) || []).length
    const functions = (code.match(/function\s+\w+|=>\s*{/g) || []).length
    const ifs = (code.match(/if\s*\(/g) || []).length
    const loops = (code.match(/for\s*\(|while\s*\(/g) || []).length
    
    return Math.min(100, (lines / 50) + (classes * 5) + (functions * 2) + (ifs * 1) + (loops * 2))
  }
  
  private extractDependencies(code: string): string[] {
    const imports = code.match(/import\s+.*\s+from\s+['"](.+)['"]/g) || []
    return imports.map(imp => {
      const match = imp.match(/from\s+['"](.+)['"]/)
      return match ? match[1] : ''
    }).filter(Boolean)
  }
  
  private calculateAverageComplexity(features: Feature[]): number {
    if (features.length === 0) return 0
    return features.reduce((sum, f) => sum + f.complexity, 0) / features.length
  }
  
  private calculateMaintainability(features: Feature[]): number {
    // Simplified maintainability index (0-100)
    // Higher = better maintainability
    const avgComplexity = this.calculateAverageComplexity(features)
    const avgLines = features.reduce((sum, f) => sum + f.linesOfCode, 0) / features.length
    
    return Math.max(0, 100 - avgComplexity - (avgLines / 10))
  }
  
  private calculateTechnicalDebt(features: Feature[]): number {
    // Technical debt score (0-100)
    // Higher = more debt
    const unusedFeatures = features.filter(f => 
      Date.now() - f.lastUsed.getTime() > 30 * 24 * 60 * 60 * 1000
    ).length
    
    const complexFeatures = features.filter(f => f.complexity > 70).length
    
    return Math.min(100, (unusedFeatures / features.length * 50) + (complexFeatures / features.length * 50))
  }
  
  // ==========================================
  // DECISION LOGIC
  // ==========================================
  
  private async shouldCompress(metrics: SystemMetrics): Promise<boolean> {
    // Automatic triggers
    if (metrics.code.complexity > CONFIG.compression.triggerComplexity) {
      console.log('   ⚠️ Complexity threshold exceeded')
      return true
    }
    
    if (metrics.features.total > CONFIG.compression.triggerFeatures) {
      console.log('   ⚠️ Feature count threshold exceeded')
      return true
    }
    
    if (metrics.health.maintainabilityIndex < CONFIG.compression.triggerMaintainability) {
      console.log('   ⚠️ Maintainability too low')
      return true
    }
    
    // AI-based decision
    const aiDecision = await this.askAI(metrics)
    return aiDecision.shouldCompress
  }
  
  private canExpand(metrics: SystemMetrics): boolean {
    const modeConfig = CONFIG.modes[this.mode]
    
    return (
      metrics.features.total < CONFIG.expansion.maxFeatures &&
      metrics.code.complexity < CONFIG.expansion.maxComplexity &&
      metrics.health.technicalDebt < CONFIG.expansion.maxTechnicalDebt
    )
  }
  
  private async askAI(metrics: SystemMetrics): Promise<{
    shouldCompress: boolean
    reasoning: string
  }> {
    const prompt = `
Du bist ein Software-Architekt. Analysiere diese System-Metriken und empfehle ob das System komprimiert werden sollte.

METRIKEN:
- Features: ${metrics.features.total} (Core: ${metrics.features.core}, Advanced: ${metrics.features.advanced}, Experimental: ${metrics.features.experimental})
- Code Complexity: ${metrics.code.complexity.toFixed(1)}
- Lines of Code: ${metrics.code.lines}
- Maintainability Index: ${metrics.health.maintainabilityIndex.toFixed(1)}
- Technical Debt: ${metrics.health.technicalDebt.toFixed(1)}

SCHWELLWERTE:
- Max Complexity: ${CONFIG.compression.triggerComplexity}
- Max Features: ${CONFIG.compression.triggerFeatures}
- Min Maintainability: ${CONFIG.compression.triggerMaintainability}

Antworte mit JSON:
{
  "shouldCompress": boolean,
  "reasoning": "Deine Begründung in 1-2 Sätzen"
}
`
    
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
      
      const result = JSON.parse(response.choices[0]?.message?.content || '{}')
      console.log(`   🤖 AI says: ${result.reasoning}`)
      
      return {
        shouldCompress: result.shouldCompress || false,
        reasoning: result.reasoning || 'No reasoning provided'
      }
    } catch (error) {
      console.error('   ⚠️ AI decision failed, using heuristics')
      return {
        shouldCompress: false,
        reasoning: 'AI unavailable, defaulting to heuristics'
      }
    }
  }
  
  // ==========================================
  // EXPANSION PHASE
  // ==========================================
  
  private async expand(): Promise<void> {
    console.log('🎈 EXPANSION PHASE')
    console.log('   Looking for new features to integrate...')
    
    // TODO: Scan for new tools in _PROGRAMS
    // TODO: Discover Python scripts that could be ported
    // TODO: AI generates new tool ideas based on gaps
    
    console.log('   ✅ Expansion complete (placeholder)')
  }
  
  // ==========================================
  // COMPRESSION PHASE
  // ==========================================
  
  private async compress(): Promise<void> {
    console.log('🗜️ COMPRESSION PHASE')
    
    const features = Array.from(this.features.values())
    
    // 1. Find unused features
    const unused = features.filter(f => 
      Date.now() - f.lastUsed.getTime() > CONFIG.compression.minimumUnusedDays * 24 * 60 * 60 * 1000 &&
      f.type === 'experimental'
    )
    
    console.log(`\n   📦 Found ${unused.length} unused experimental features`)
    
    // 2. Find similar features (AI-based)
    console.log('\n   🔍 Finding similar features for abstraction...')
    const proposals = await this.findAbstractionOpportunities(features)
    
    console.log(`\n   💡 Generated ${proposals.length} abstraction proposals`)
    
    for (const proposal of proposals) {
      console.log(`\n   📋 PROPOSAL: ${proposal.name}`)
      console.log(`      Unifies: ${proposal.unifies.map(f => f.name).join(', ')}`)
      console.log(`      Reduces: -${proposal.linesReduced} lines, -${proposal.complexityReduced.toFixed(1)} complexity`)
      console.log(`      Risk: ${proposal.riskLevel}`)
      console.log(`      Reasoning: ${proposal.reasoning}`)
    }
    
    // 3. Apply compressions (with safety checks)
    // TODO: Implement actual refactoring
    
    console.log('\n   ✅ Compression complete')
    this.phase = 'stable'
  }
  
  private async findAbstractionOpportunities(features: Feature[]): Promise<AbstractionProposal[]> {
    const proposals: AbstractionProposal[] = []
    
    // Group features by type
    const grouped = new Map<string, Feature[]>()
    
    for (const feature of features) {
      // Simple grouping by name similarity
      const category = this.categorizeFeature(feature)
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(feature)
    }
    
    // For each group with multiple features, propose abstraction
    for (const [category, group] of grouped.entries()) {
      if (group.length >= 2) {
        // Ask AI for abstraction proposal
        const proposal = await this.proposeAbstraction(category, group)
        if (proposal) {
          proposals.push(proposal)
        }
      }
    }
    
    return proposals
  }
  
  private categorizeFeature(feature: Feature): string {
    const name = feature.name.toLowerCase()
    
    if (name.includes('consciousness')) return 'consciousness'
    if (name.includes('memory')) return 'memory'
    if (name.includes('dream')) return 'creativity'
    if (name.includes('emotion')) return 'emotion'
    if (name.includes('game')) return 'games'
    if (name.includes('story')) return 'narrative'
    if (name.includes('engine')) return 'engine'
    if (name.includes('system')) return 'system'
    
    return 'other'
  }
  
  private async proposeAbstraction(category: string, features: Feature[]): Promise<AbstractionProposal | null> {
    try {
      const prompt = `
Du bist ein Software-Architekt. Diese ${features.length} Features gehören zur Kategorie "${category}":

${features.map(f => `- ${f.name} (${f.linesOfCode} lines, complexity: ${f.complexity.toFixed(1)})`).join('\n')}

Schlage eine Abstraction vor, die diese Features vereint. Antworte mit JSON:
{
  "name": "Name der Unified API",
  "description": "Was macht die neue Abstraction",
  "reasoning": "Warum ist das sinnvoll",
  "riskLevel": "low/medium/high"
}
`
      
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      })
      
      const result = JSON.parse(response.choices[0]?.message?.content || '{}')
      
      return {
        id: `abstraction_${category}_${Date.now()}`,
        name: result.name || `Unified${category}API`,
        description: result.description || '',
        unifies: features,
        linesReduced: features.reduce((sum, f) => sum + f.linesOfCode, 0) * 0.3, // Estimate 30% reduction
        complexityReduced: features.reduce((sum, f) => sum + f.complexity, 0) * 0.2,
        riskLevel: result.riskLevel || 'medium',
        reasoning: result.reasoning || 'No reasoning provided'
      }
    } catch (error) {
      return null
    }
  }
  
  // ==========================================
  // PERSISTENCE
  // ==========================================
  
  private async saveState(): Promise<void> {
    const state = {
      phase: this.phase,
      mode: this.mode,
      metrics: this.metrics,
      features: Array.from(this.features.values()),
      timestamp: new Date().toISOString()
    }
    
    await writeFile(
      join(process.cwd(), 'expansion-compression-state.json'),
      JSON.stringify(state, null, 2)
    )
    
    console.log('\n💾 State saved to expansion-compression-state.json')
  }
}

// ==========================================
// CLI
// ==========================================

async function main() {
  const mode = (process.argv[2] as Mode) || 'balanced'
  
  console.log(`
╔═══════════════════════════════════════════════╗
║  🌊 EXPANSION-COMPRESSION ENGINE             ║
║  Organisches Wachstum für Toobix             ║
╚═══════════════════════════════════════════════╝

Mode: ${mode}
`)
  
  const engine = new ExpansionCompressionEngine(mode)
  
  // Run cycle once
  await engine.runCycle()
  
  console.log('\n✨ Cycle complete!\n')
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error)
}

export { ExpansionCompressionEngine, type SystemMetrics, type Feature, type AbstractionProposal }
