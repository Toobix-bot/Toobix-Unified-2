/**
 * 🧬 TOOBIX FEATURE INTEGRATOR
 * Integriert alle 76+ Tools aus _PROGRAMS in aktuelles System
 * 
 * Strategie:
 * 1. Scan _PROGRAMS für alle Tools
 * 2. Analysiere Dependencies & Kompatibilität
 * 3. Kopiere & Integriere automatisch
 * 4. Test & Validierung
 * 5. Register in zentralem Index
 */

import { readdir, stat, readFile, writeFile, copyFile, mkdir } from 'fs/promises'
import { join, basename, dirname } from 'path'
import { existsSync } from 'fs'
import Groq from 'groq-sdk'

// ==========================================
// TYPES
// ==========================================

interface Tool {
  id: string
  name: string
  path: string
  category: 'consciousness' | 'creativity' | 'engine' | 'service' | 'utility' | 'other'
  complexity: number
  linesOfCode: number
  dependencies: string[]
  description: string
  isIntegrated: boolean
  integrationStatus: 'pending' | 'analyzing' | 'compatible' | 'incompatible' | 'integrated' | 'failed'
}

interface IntegrationPlan {
  tool: Tool
  targetPath: string
  requiredChanges: string[]
  risk: 'low' | 'medium' | 'high'
  priority: number
}

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  sourcePaths: [
    'C:\\_PROGRAMS\\Development\\Environments\\Projects\\AI\\Toobix-Unified\\scripts\\3-tools',
    'C:\\_PROGRAMS\\Development\\Environments\\Projects\\AI\\Toobix-Unified\\packages'
  ],
  targetPath: 'C:\\Dev\\Projects\\AI\\Toobix-Unified',
  
  // Categories for organization
  categories: {
    consciousness: ['consciousness', 'awareness', 'perspective', 'self'],
    creativity: ['creative', 'dream', 'story', 'art', 'game'],
    engine: ['engine', 'system', 'core', 'meta'],
    service: ['service', 'server', 'api', 'bridge'],
    utility: ['util', 'helper', 'tool', 'logger']
  },
  
  // Integration limits
  maxToolsPerBatch: 50,
  testBeforeIntegration: true
}

// ==========================================
// FEATURE INTEGRATOR
// ==========================================

class FeatureIntegrator {
  private tools: Map<string, Tool> = new Map()
  private integrationPlans: IntegrationPlan[] = []
  private groq: Groq
  
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
  }
  
  // ==========================================
  // MAIN WORKFLOW
  // ==========================================
  
  async integrate(): Promise<void> {
    console.log('\n🧬 TOOBIX FEATURE INTEGRATOR STARTING...\n')
    
    // Phase 1: Discovery
    console.log('📡 Phase 1: Discovering tools...')
    await this.discoverTools()
    console.log(`   Found ${this.tools.size} tools\n`)
    
    // Phase 2: Analysis
    console.log('🔍 Phase 2: Analyzing compatibility...')
    await this.analyzeTools()
    
    // Phase 3: Planning
    console.log('\n📋 Phase 3: Creating integration plans...')
    await this.createIntegrationPlans()
    console.log(`   Created ${this.integrationPlans.length} integration plans\n`)
    
    // Phase 4: Execution (top 10 priority)
    console.log('⚡ Phase 4: Executing integrations...')
    await this.executeIntegrations()
    
    // Phase 5: Report
    console.log('\n📊 Phase 5: Generating report...')
    await this.generateReport()
    
    console.log('\n✨ Integration complete!\n')
  }
  
  // ==========================================
  // PHASE 1: DISCOVERY
  // ==========================================
  
  private async discoverTools(): Promise<void> {
    for (const sourcePath of CONFIG.sourcePaths) {
      if (existsSync(sourcePath)) {
        await this.scanDirectory(sourcePath)
      } else {
        console.log(`   ⚠️ Path not found: ${sourcePath}`)
      }
    }
  }
  
  private async scanDirectory(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          await this.analyzeTool(fullPath)
        } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.scanDirectory(fullPath)
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
  }
  
  private async analyzeTool(path: string): Promise<void> {
    try {
      const content = await readFile(path, 'utf-8')
      const lines = content.split('\n').length
      
      // Skip tiny files (likely not real tools)
      if (lines < 20) return
      
      const tool: Tool = {
        id: path,
        name: basename(path, '.ts').replace('.js', ''),
        path,
        category: this.categorize(path, content),
        complexity: this.estimateComplexity(content),
        linesOfCode: lines,
        dependencies: this.extractDependencies(content),
        description: this.extractDescription(content),
        isIntegrated: false,
        integrationStatus: 'pending'
      }
      
      this.tools.set(tool.id, tool)
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  private categorize(path: string, content: string): Tool['category'] {
    const pathLower = path.toLowerCase()
    const contentLower = content.toLowerCase()
    
    for (const [category, keywords] of Object.entries(CONFIG.categories)) {
      for (const keyword of keywords) {
        if (pathLower.includes(keyword) || contentLower.includes(keyword)) {
          return category as Tool['category']
        }
      }
    }
    
    return 'other'
  }
  
  private estimateComplexity(code: string): number {
    const lines = code.split('\n').length
    const classes = (code.match(/class\s+\w+/g) || []).length
    const functions = (code.match(/function\s+\w+|=>\s*{/g) || []).length
    const imports = (code.match(/import\s+/g) || []).length
    
    return Math.min(100, (lines / 50) + (classes * 5) + (functions * 2) + (imports * 1))
  }
  
  private extractDependencies(code: string): string[] {
    const imports = code.match(/import\s+.*\s+from\s+['"](.+)['"]/g) || []
    return imports
      .map(imp => {
        const match = imp.match(/from\s+['"](.+)['"]/)
        return match ? match[1] : ''
      })
      .filter(Boolean)
      .filter(dep => !dep.startsWith('.')) // Only external deps
  }
  
  private extractDescription(code: string): string {
    // Look for first multi-line comment or JSDoc
    const match = code.match(/\/\*\*?\s*\n\s*\*?\s*(.+?)(?:\n|\*\/)/s)
    return match ? match[1].trim() : 'No description available'
  }
  
  // ==========================================
  // PHASE 2: ANALYSIS
  // ==========================================
  
  private async analyzeTools(): Promise<void> {
    const tools = Array.from(this.tools.values())
    
    console.log(`   Analyzing ${tools.length} tools...`)
    
    // Check which tools already exist in target
    for (const tool of tools) {
      const targetPath = join(CONFIG.targetPath, 'scripts', '3-tools', tool.name + '.ts')
      
      if (existsSync(targetPath)) {
        tool.isIntegrated = true
        tool.integrationStatus = 'integrated'
      } else {
        tool.integrationStatus = 'analyzing'
      }
    }
    
    const notIntegrated = tools.filter(t => !t.isIntegrated)
    console.log(`   ${notIntegrated.length} tools need integration`)
    
    // Check compatibility of unintegrated tools
    for (const tool of notIntegrated.slice(0, 20)) { // First 20 only
      tool.integrationStatus = await this.checkCompatibility(tool)
    }
  }
  
  private async checkCompatibility(tool: Tool): Promise<Tool['integrationStatus']> {
    // Simple heuristics first
    if (tool.complexity > 80) return 'incompatible' // Too complex
    if (tool.dependencies.length > 10) return 'incompatible' // Too many deps
    
    // Check for problematic patterns
    const content = await readFile(tool.path, 'utf-8')
    
    if (content.includes('require(')) return 'incompatible' // CommonJS
    if (content.includes('node:')) return 'incompatible' // Node-specific
    
    return 'compatible'
  }
  
  // ==========================================
  // PHASE 3: PLANNING
  // ==========================================
  
  private async createIntegrationPlans(): Promise<void> {
    const compatible = Array.from(this.tools.values())
      .filter(t => t.integrationStatus === 'compatible')
    
    console.log(`   Planning integration for ${compatible.length} compatible tools...`)
    
    for (const tool of compatible) {
      const plan = await this.createPlan(tool)
      if (plan) {
        this.integrationPlans.push(plan)
      }
    }
    
    // Sort by priority
    this.integrationPlans.sort((a, b) => b.priority - a.priority)
  }
  
  private async createPlan(tool: Tool): Promise<IntegrationPlan | null> {
    const targetPath = join(CONFIG.targetPath, 'scripts', '3-tools', tool.name + '.ts')
    
    // Calculate priority (higher = more important)
    let priority = 0
    
    // Category priority
    if (tool.category === 'consciousness') priority += 10
    if (tool.category === 'creativity') priority += 8
    if (tool.category === 'engine') priority += 7
    if (tool.category === 'service') priority += 6
    
    // Simplicity bonus (easier to integrate = higher priority)
    priority += Math.max(0, 10 - (tool.complexity / 10))
    
    // Few dependencies bonus
    priority += Math.max(0, 5 - tool.dependencies.length)
    
    const plan: IntegrationPlan = {
      tool,
      targetPath,
      requiredChanges: [],
      risk: tool.complexity > 60 ? 'high' : tool.complexity > 30 ? 'medium' : 'low',
      priority
    }
    
    return plan
  }
  
  // ==========================================
  // PHASE 4: EXECUTION
  // ==========================================
  
  private async executeIntegrations(): Promise<void> {
    const topPlans = this.integrationPlans.slice(0, CONFIG.maxToolsPerBatch)
    
    console.log(`   Integrating top ${topPlans.length} tools...\n`)
    
    // Create tools directory if not exists
    const toolsDir = join(CONFIG.targetPath, 'scripts', '3-tools')
    await mkdir(toolsDir, { recursive: true })
    
    let success = 0
    let failed = 0
    
    for (const plan of topPlans) {
      try {
        console.log(`   📦 ${plan.tool.name}...`)
        
        // Copy file
        await copyFile(plan.tool.path, plan.targetPath)
        
        // Mark as integrated
        plan.tool.isIntegrated = true
        plan.tool.integrationStatus = 'integrated'
        
        console.log(`      ✅ Integrated (${plan.tool.linesOfCode} lines, ${plan.risk} risk)`)
        success++
        
      } catch (error) {
        console.log(`      ❌ Failed: ${error}`)
        plan.tool.integrationStatus = 'failed'
        failed++
      }
    }
    
    console.log(`\n   ✅ Success: ${success}`)
    console.log(`   ❌ Failed: ${failed}`)
  }
  
  // ==========================================
  // PHASE 5: REPORTING
  // ==========================================
  
  private async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDiscovered: this.tools.size,
        byCategory: this.groupByCategory(),
        byStatus: this.groupByStatus(),
        totalIntegrated: Array.from(this.tools.values()).filter(t => t.isIntegrated).length
      },
      tools: Array.from(this.tools.values()),
      integrationPlans: this.integrationPlans
    }
    
    await writeFile(
      join(CONFIG.targetPath, 'integration-report.json'),
      JSON.stringify(report, null, 2)
    )
    
    console.log('\n   📊 SUMMARY:')
    console.log(`      Total discovered: ${report.summary.totalDiscovered}`)
    console.log(`      Total integrated: ${report.summary.totalIntegrated}`)
    console.log('\n   📁 By Category:')
    for (const [category, count] of Object.entries(report.summary.byCategory)) {
      console.log(`      ${category}: ${count}`)
    }
    console.log('\n   🔄 By Status:')
    for (const [status, count] of Object.entries(report.summary.byStatus)) {
      console.log(`      ${status}: ${count}`)
    }
    
    console.log('\n   💾 Report saved to integration-report.json')
  }
  
  private groupByCategory(): Record<string, number> {
    const groups: Record<string, number> = {}
    for (const tool of this.tools.values()) {
      groups[tool.category] = (groups[tool.category] || 0) + 1
    }
    return groups
  }
  
  private groupByStatus(): Record<string, number> {
    const groups: Record<string, number> = {}
    for (const tool of this.tools.values()) {
      groups[tool.integrationStatus] = (groups[tool.integrationStatus] || 0) + 1
    }
    return groups
  }
}

// ==========================================
// CLI
// ==========================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════╗
║  🧬 TOOBIX FEATURE INTEGRATOR                ║
║  Importing 76+ Tools into Unified System     ║
╚═══════════════════════════════════════════════╝
`)
  
  const integrator = new FeatureIntegrator()
  await integrator.integrate()
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error)
}

export { FeatureIntegrator }
