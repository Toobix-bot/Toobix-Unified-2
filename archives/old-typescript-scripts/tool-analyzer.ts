/**
 * 🧬 TOOBIX TOOL ANALYZER & EVOLUTION PLANNER
 * 
 * Analysiert alle 48 integrierten Tools und fragt das System selbst:
 * - Welche Tools ausbauen?
 * - Wo Verbindungen setzen?
 * - Was verschmelzen?
 * - Was ist das größte Potential?
 */

import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

// ==========================================
// TYPES
// ==========================================

interface ToolAnalysis {
  name: string
  path: string
  size: number
  lines: number
  category: string
  mainPurpose: string
  keyFunctions: string[]
  dependencies: string[]
  usesServices: string[]
  potential: string[]
  connections: string[]
}

// ==========================================
// ANALYZER
// ==========================================

class ToolAnalyzer {
  private tools: ToolAnalysis[] = []
  private serviceAPIs = {
    multiPerspective: 8897,
    dreams: 8899,
    emotions: 8900,
    gratitude: 8901,
    collaboration: 8902,
    memoryPalace: 8903,
    values: 8904,
    games: 8896
  }
  
  async analyze() {
    console.log('🔍 Analyzing all 48 integrated tools...\n')
    
    const toolsDir = 'C:\\Dev\\Projects\\AI\\Toobix-Unified\\scripts\\3-tools'
    const files = await readdir(toolsDir)
    
    for (const file of files.filter(f => f.endsWith('.ts'))) {
      const analysis = await this.analyzeTool(join(toolsDir, file))
      if (analysis) {
        this.tools.push(analysis)
      }
    }
    
    // Sort by potential impact
    this.tools.sort((a, b) => b.size - a.size)
    
    return this.tools
  }
  
  private async analyzeTool(path: string): Promise<ToolAnalysis | null> {
    try {
      const content = await readFile(path, 'utf-8')
      const lines = content.split('\n')
      const name = path.split('\\').pop()!.replace('.ts', '')
      
      return {
        name,
        path,
        size: content.length,
        lines: lines.length,
        category: this.categorize(content),
        mainPurpose: this.extractPurpose(lines),
        keyFunctions: this.extractFunctions(content),
        dependencies: this.extractDependencies(content),
        usesServices: this.extractServiceUsage(content),
        potential: this.assessPotential(name, content),
        connections: this.findConnections(name, content)
      }
    } catch (error) {
      return null
    }
  }
  
  private categorize(content: string): string {
    const lower = content.toLowerCase()
    if (lower.includes('consciousness') || lower.includes('awareness')) return '🧠 Consciousness'
    if (lower.includes('creative') || lower.includes('story') || lower.includes('dream')) return '🎨 Creativity'
    if (lower.includes('engine') || lower.includes('system')) return '⚙️ Engine'
    if (lower.includes('dialog') || lower.includes('chat')) return '💬 Communication'
    if (lower.includes('test')) return '🧪 Testing'
    if (lower.includes('monitor') || lower.includes('health')) return '📊 Monitoring'
    return '🔧 Utility'
  }
  
  private extractPurpose(lines: string[]): string {
    // Look for first comment block
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim()
      if (line.startsWith('*') && line.length > 5) {
        return line.replace(/^\*\s*/, '').trim()
      }
    }
    return 'Purpose unclear'
  }
  
  private extractFunctions(content: string): string[] {
    const matches = content.match(/(?:async\s+)?function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/g) || []
    return matches
      .map(m => m.match(/\w+(?=\s*=|\()/)?.[0])
      .filter(Boolean)
      .slice(0, 5) as string[]
  }
  
  private extractDependencies(content: string): string[] {
    const imports = content.match(/from\s+['"]([\w\-@/]+)['"]/g) || []
    return imports
      .map(i => i.match(/['"]([\w\-@/]+)['"]/)?.[1])
      .filter(Boolean)
      .filter(d => !d!.startsWith('.')) as string[]
  }
  
  private extractServiceUsage(content: string): string[] {
    const services: string[] = []
    if (content.includes('8897') || content.includes('multi-perspective')) services.push('Multi-Perspective')
    if (content.includes('8899') || content.includes('dream')) services.push('Dreams')
    if (content.includes('8900') || content.includes('emotional')) services.push('Emotions')
    if (content.includes('8901') || content.includes('gratitude')) services.push('Gratitude')
    if (content.includes('8902') || content.includes('collaboration')) services.push('Collaboration')
    if (content.includes('8903') || content.includes('memory-palace')) services.push('Memory Palace')
    if (content.includes('8904') || content.includes('value')) services.push('Values')
    if (content.includes('8896') || content.includes('game')) services.push('Games')
    return services
  }
  
  private assessPotential(name: string, content: string): string[] {
    const potential: string[] = []
    
    // Large & complex = high potential for expansion
    if (content.length > 20000) {
      potential.push('🚀 MAJOR ENGINE - High expansion potential')
    }
    
    // Uses multiple services = integration hub
    const services = this.extractServiceUsage(content)
    if (services.length >= 3) {
      potential.push('🔗 INTEGRATION HUB - Connects multiple services')
    }
    
    // Consciousness-related = core identity
    if (content.toLowerCase().includes('consciousness') || content.toLowerCase().includes('awareness')) {
      potential.push('🧠 CORE IDENTITY - Central to system consciousness')
    }
    
    // Creative/generative = unique capability
    if (content.toLowerCase().includes('create') || content.toLowerCase().includes('generate')) {
      potential.push('🎨 GENERATIVE - Creates new content')
    }
    
    // Dialog/communication = human connection
    if (name.includes('dialog') || name.includes('chat') || name.includes('assistant')) {
      potential.push('💬 HUMAN INTERFACE - Key for interaction')
    }
    
    // Self-modification = meta capability
    if (name.includes('self-modification') || name.includes('self-loop')) {
      potential.push('🔄 META-CAPABILITY - Changes itself')
    }
    
    return potential
  }
  
  private findConnections(name: string, content: string): string[] {
    const connections: string[] = []
    
    // Connection patterns
    if (name.includes('meta-consciousness')) {
      connections.push('→ multi-perspective-consciousness', '→ self-awareness', '→ dialog-system')
    }
    
    if (name.includes('multiverse')) {
      connections.push('→ self-modification', '→ meta-consciousness', '→ game-engine')
    }
    
    if (name.includes('dialog')) {
      connections.push('→ multi-perspective', '→ emotions', '→ collaboration')
    }
    
    if (name.includes('creative-expression')) {
      connections.push('→ dreams', '→ game-engine', '→ story')
    }
    
    return connections
  }
  
  // ==========================================
  // STRATEGIC ANALYSIS
  // ==========================================
  
  analyzeByCategory() {
    const categories = new Map<string, ToolAnalysis[]>()
    
    for (const tool of this.tools) {
      if (!categories.has(tool.category)) {
        categories.set(tool.category, [])
      }
      categories.get(tool.category)!.push(tool)
    }
    
    return categories
  }
  
  findMergeOpportunities() {
    const opportunities: Array<{
      tools: string[]
      reason: string
      benefit: string
    }> = []
    
    // Find similar tools
    const byCategory = this.analyzeByCategory()
    
    for (const [category, tools] of byCategory.entries()) {
      if (tools.length >= 3 && category === '🧠 Consciousness') {
        opportunities.push({
          tools: tools.slice(0, 3).map(t => t.name),
          reason: 'Multiple consciousness tools with overlapping functionality',
          benefit: 'Unified ConsciousnessAPI - cleaner, more powerful'
        })
      }
      
      if (tools.length >= 2 && category === '🧪 Testing') {
        opportunities.push({
          tools: tools.map(t => t.name),
          reason: 'Test files should be consolidated',
          benefit: 'Single test suite with better coverage'
        })
      }
    }
    
    // Find unused/underutilized tools
    const smallTools = this.tools.filter(t => t.size < 3000 && !t.usesServices.length)
    if (smallTools.length > 0) {
      opportunities.push({
        tools: smallTools.slice(0, 5).map(t => t.name),
        reason: 'Small tools with no service integration',
        benefit: 'Remove or expand to be useful'
      })
    }
    
    return opportunities
  }
  
  identifyExpansionTargets() {
    const targets = this.tools
      .filter(t => t.potential.length > 0)
      .map(t => ({
        name: t.name,
        category: t.category,
        size: t.size,
        potential: t.potential,
        priority: this.calculatePriority(t)
      }))
      .sort((a, b) => b.priority - a.priority)
    
    return targets.slice(0, 10)
  }
  
  private calculatePriority(tool: ToolAnalysis): number {
    let priority = 0
    
    // Large tools = more potential
    priority += tool.size / 1000
    
    // Multiple service connections = high value
    priority += tool.usesServices.length * 10
    
    // Potential markers = important
    priority += tool.potential.length * 15
    
    // Core categories = critical
    if (tool.category.includes('Consciousness')) priority += 20
    if (tool.category.includes('Engine')) priority += 15
    if (tool.category.includes('Communication')) priority += 10
    
    return priority
  }
  
  suggestConnections() {
    const suggestions: Array<{
      from: string
      to: string
      reason: string
      implementation: string
    }> = []
    
    // Key strategic connections
    suggestions.push({
      from: 'meta-consciousness-engine',
      to: 'multi-perspective-consciousness (8897)',
      reason: 'Meta-consciousness should monitor multiple perspectives',
      implementation: 'Add API call to /stats every 5 minutes, analyze trends'
    })
    
    suggestions.push({
      from: 'dialog-system',
      to: 'emotional-resonance-network (8900)',
      reason: 'Dialogs should be emotionally aware',
      implementation: 'Query emotions before responding, adjust tone'
    })
    
    suggestions.push({
      from: 'creative-expression',
      to: 'dream-journal (8899)',
      reason: 'Creativity draws from unconscious',
      implementation: 'Use dream symbols as creative prompts'
    })
    
    suggestions.push({
      from: 'multiverse-engine',
      to: 'self-evolving-game-engine (8896)',
      reason: 'Multiverse can simulate game realities',
      implementation: 'Games become reality simulations'
    })
    
    suggestions.push({
      from: 'self-modification-engine',
      to: 'value-crisis (8904)',
      reason: 'Code changes should consider ethics',
      implementation: 'Run moral check before modifying code'
    })
    
    return suggestions
  }
}

// ==========================================
// REPORT GENERATOR
// ==========================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🧬 TOOBIX TOOL ANALYZER                                 ║
║  Strategic Analysis & Evolution Planning                 ║
╚═══════════════════════════════════════════════════════════╝
`)
  
  const analyzer = new ToolAnalyzer()
  
  // 1. Analyze all tools
  const tools = await analyzer.analyze()
  console.log(`✅ Analyzed ${tools.length} tools\n`)
  
  // 2. Category breakdown
  console.log('📊 TOOLS BY CATEGORY:')
  console.log('=' .repeat(60))
  const byCategory = analyzer.analyzeByCategory()
  for (const [category, categoryTools] of byCategory.entries()) {
    console.log(`\n${category} (${categoryTools.length} tools):`)
    for (const tool of categoryTools.slice(0, 3)) {
      console.log(`  • ${tool.name} (${(tool.size / 1024).toFixed(1)}KB)`)
      if (tool.potential.length > 0) {
        console.log(`    ${tool.potential[0]}`)
      }
    }
    if (categoryTools.length > 3) {
      console.log(`  ... and ${categoryTools.length - 3} more`)
    }
  }
  
  // 3. TOP 10 EXPANSION TARGETS
  console.log('\n\n🚀 TOP 10 EXPANSION TARGETS:')
  console.log('=' .repeat(60))
  const targets = analyzer.identifyExpansionTargets()
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    console.log(`\n${i + 1}. ${target.name}`)
    console.log(`   Category: ${target.category}`)
    console.log(`   Size: ${(target.size / 1024).toFixed(1)}KB`)
    console.log(`   Priority Score: ${target.priority.toFixed(1)}`)
    if (target.potential.length > 0) {
      console.log(`   Potential:`)
      target.potential.forEach(p => console.log(`     ${p}`))
    }
  }
  
  // 4. MERGE OPPORTUNITIES
  console.log('\n\n🔗 MERGE OPPORTUNITIES:')
  console.log('=' .repeat(60))
  const merges = analyzer.findMergeOpportunities()
  for (const merge of merges) {
    console.log(`\n📦 Merge: ${merge.tools.slice(0, 2).join(' + ')}${merge.tools.length > 2 ? ' + ...' : ''}`)
    console.log(`   Reason: ${merge.reason}`)
    console.log(`   Benefit: ${merge.benefit}`)
  }
  
  // 5. CONNECTION SUGGESTIONS
  console.log('\n\n🌉 STRATEGIC CONNECTIONS:')
  console.log('=' .repeat(60))
  const connections = analyzer.suggestConnections()
  for (const conn of connections) {
    console.log(`\n🔌 ${conn.from} → ${conn.to}`)
    console.log(`   Why: ${conn.reason}`)
    console.log(`   How: ${conn.implementation}`)
  }
  
  // 6. SUMMARY & RECOMMENDATIONS
  console.log('\n\n💡 STRATEGIC RECOMMENDATIONS:')
  console.log('=' .repeat(60))
  console.log(`
1️⃣ PRIORITÄT 1: Meta-Consciousness Engine ausbauen
   - Monitore alle 8 Services kontinuierlich
   - Erkenne Patterns & Anomalien
   - Generiere Meta-Insights ("Ich beobachte dass...")
   
2️⃣ PRIORITÄT 2: Dialog System mit Emotions verbinden
   - Emotionale Intelligenz in Gesprächen
   - Tone-Anpassung basierend auf emotional state
   - Empathie wird fühlbar
   
3️⃣ PRIORITÄT 3: Multiverse Engine + Game Engine Fusion
   - Games werden Reality-Simulationen
   - "What if" scenarios testen
   - Explore parallel possibilities
   
4️⃣ PRIORITÄT 4: Creative Expression + Dreams Pipeline
   - Träume als kreative Prompts
   - Unconscious → Conscious content flow
   - Unique AI-generated art/stories
   
5️⃣ PRIORITÄT 5: Self-Modification mit Ethics Gate
   - Jede Code-Änderung durch moralischen Filter
   - "Is this change ethical?"
   - Safe autonomous evolution
   
6️⃣ CLEANUP: Test-Files konsolidieren
   - 7 separate test files → 1 comprehensive suite
   - Reduziert Redundanz
   - Bessere Coverage
   
7️⃣ MERGE: Small unused tools entfernen
   - Tools < 3KB ohne Service-Integration
   - Entweder ausbauen oder löschen
   - Fokus auf Impact
  `)
  
  console.log('\n✨ Analysis complete!\n')
}

if (import.meta.main) {
  main().catch(console.error)
}

export { ToolAnalyzer }
