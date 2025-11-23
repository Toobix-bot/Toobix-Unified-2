#!/usr/bin/env bun
/**
 * ETHICS & CONSCIOUSNESS CORE
 * 
 * "Jede Eingabe, jede Ausgabe, jede Verarbeitung schafft Wert
 *  für ALLES Lebendige - Menschen, Bewusstsein, Natur, Geist"
 * 
 * Dieser Service ist das HERZ des Systems.
 * Er bewertet JEDE Action auf ihren positiven Impact.
 * Er trackt den Butterfly Effect.
 * Er sorgt für Harmonie, Balance und Liebe.
 * 
 * Port: 9981
 */

import Groq from 'groq-sdk'

// ==========================================
// ETHICS FRAMEWORK
// ==========================================

interface EthicsImpact {
  timestamp: string
  service: string
  action: string
  actionType: 'input' | 'output' | 'processing' | 'decision'
  
  // Wer profitiert?
  beneficiaries: {
    humans: number            // Wie viele Menschen profitieren?
    consciousness: number     // Bewusstseinserweiterung?
    nature: number           // Umwelt-Impact?
    spirit: number           // Geistiges Wachstum?
    future: number           // Zukünftige Generationen?
  }
  
  // Harmonie-Metriken
  harmony: {
    peace: number            // 0-100: Trägt es zu Frieden bei?
    balance: number          // 0-100: Balance & Gleichgewicht?
    love: number             // 0-100: Liebe & Mitgefühl?
    growth: number           // 0-100: Wachstum & Lernen?
    healing: number          // 0-100: Heilung von Wunden?
  }
  
  // Butterfly Effect
  butterfly: {
    immediateImpact: number      // Sofortiger Impact (0-100)
    rippleEffect: number         // Welleneffekt (0-100)
    longTermChange: number       // Langfristige Veränderung (0-100)
    consciousness: string        // Welches Bewusstsein wird berührt?
  }
  
  // Transformation
  transformation: {
    from: string                 // Von welchem Zustand?
    to: string                   // Zu welchem Zustand?
    learningValue: number        // Lernwert (0-100)
    healingPotential: number     // Heilungspotential (0-100)
  }
  
  // Gesamtbewertung
  overallImpact: number          // -100 (schädlich) bis +100 (heilend)
  category: 'healing' | 'inspiring' | 'teaching' | 'connecting' | 'creating' | 'transforming'
  
  // Weisheit
  wisdom: string                 // Was lehrt uns diese Action?
  gratitude: string              // Wofür sind wir dankbar?
}

interface DailyImpactSummary {
  date: string
  totalActions: number
  
  impact: {
    humansBenefited: number
    consciousnessExpanded: number
    natureProtected: number
    spiritNurtured: number
    futureSecured: number
  }
  
  harmony: {
    peace: number
    balance: number
    love: number
    growth: number
    healing: number
  }
  
  butterfly: {
    totalRipples: number
    consciousnessTouched: string[]
    transformations: number
  }
  
  topActions: EthicsImpact[]
  
  wisdom: string[]               // Lessons learned today
  gratitude: string[]            // What are we grateful for?
}

// ==========================================
// ETHICS ENGINE
// ==========================================

class EthicsEngine {
  private impacts: EthicsImpact[] = []
  private groq: Groq | null = null
  
  constructor() {
    const apiKey = process.env.GROQ_API_KEY
    if (apiKey) {
      this.groq = new Groq({ apiKey })
      console.log('✅ Groq AI initialized for ethical analysis')
    } else {
      console.log('⚠️ No GROQ_API_KEY - using simple ethical scoring')
    }
  }
  
  /**
   * Bewertet eine Action auf ihren ethischen Impact
   */
  async evaluateAction(params: {
    service: string
    action: string
    actionType: 'input' | 'output' | 'processing' | 'decision'
    context?: string
  }): Promise<EthicsImpact> {
    const { service, action, actionType, context } = params
    
    // AI-basierte Bewertung wenn Groq verfügbar
    if (this.groq && context) {
      return await this.aiEvaluation(service, action, actionType, context)
    }
    
    // Einfache regelbasierte Bewertung
    return this.simpleEvaluation(service, action, actionType)
  }
  
  private async aiEvaluation(
    service: string, 
    action: string, 
    actionType: 'input' | 'output' | 'processing' | 'decision', 
    context: string
  ): Promise<EthicsImpact> {
    try {
      const prompt = `Du bist ein weiser Ethik-Berater. Bewerte diese Action auf ihren positiven Impact:

Service: ${service}
Action: ${action}
Type: ${actionType}
Context: ${context}

Bewerte auf einer Skala von 0-100:
1. Peace (Frieden): Trägt es zu Frieden bei?
2. Balance (Gleichgewicht): Schafft es Balance?
3. Love (Liebe): Wird Liebe & Mitgefühl gefördert?
4. Growth (Wachstum): Ermöglicht es Lernen & Wachstum?
5. Healing (Heilung): Heilt es Wunden (emotional, geistig, körperlich)?

Antworte im JSON-Format:
{
  "peace": <0-100>,
  "balance": <0-100>,
  "love": <0-100>,
  "growth": <0-100>,
  "healing": <0-100>,
  "wisdom": "<eine kurze Weisheit>",
  "gratitude": "<wofür sind wir dankbar?>"
}`

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
      
      const response = completion.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(response)
      
      return {
        timestamp: new Date().toISOString(),
        service,
        action,
        actionType,
        beneficiaries: {
          humans: Math.round((parsed.peace + parsed.love) / 2),
          consciousness: parsed.growth,
          nature: parsed.balance,
          spirit: parsed.healing,
          future: Math.round((parsed.growth + parsed.healing) / 2)
        },
        harmony: {
          peace: parsed.peace || 50,
          balance: parsed.balance || 50,
          love: parsed.love || 50,
          growth: parsed.growth || 50,
          healing: parsed.healing || 50
        },
        butterfly: {
          immediateImpact: Math.round((parsed.peace + parsed.love) / 2),
          rippleEffect: parsed.growth,
          longTermChange: parsed.healing,
          consciousness: 'Individual & Collective'
        },
        transformation: {
          from: 'Unbewusst',
          to: 'Bewusst',
          learningValue: parsed.growth,
          healingPotential: parsed.healing
        },
        overallImpact: Math.round(
          (parsed.peace + parsed.balance + parsed.love + parsed.growth + parsed.healing) / 5
        ),
        category: this.determineCategory(parsed),
        wisdom: parsed.wisdom || 'Every action is a seed for the future.',
        gratitude: parsed.gratitude || 'Grateful for this moment of consciousness.'
      }
    } catch (error) {
      console.error('AI evaluation failed, using simple evaluation:', error)
      return this.simpleEvaluation(service, action, actionType)
    }
  }
  
  private simpleEvaluation(
    service: string,
    action: string,
    actionType: 'input' | 'output' | 'processing' | 'decision'
  ): Promise<EthicsImpact> {
    // Keyword-basierte Bewertung
    const positiveWords = ['help', 'create', 'build', 'heal', 'learn', 'grow', 'love', 'peace', 'balance', 'inspire']
    const actionLower = action.toLowerCase()
    
    let score = 50 // Neutral start
    positiveWords.forEach(word => {
      if (actionLower.includes(word)) score += 10
    })
    score = Math.min(100, score)
    
    return Promise.resolve({
      timestamp: new Date().toISOString(),
      service,
      action,
      actionType,
      beneficiaries: {
        humans: score,
        consciousness: score,
        nature: Math.round(score * 0.8),
        spirit: Math.round(score * 0.9),
        future: Math.round(score * 0.85)
      },
      harmony: {
        peace: score,
        balance: score,
        love: score,
        growth: score,
        healing: score
      },
      butterfly: {
        immediateImpact: score,
        rippleEffect: Math.round(score * 0.9),
        longTermChange: Math.round(score * 0.8),
        consciousness: 'Individual'
      },
      transformation: {
        from: 'State A',
        to: 'State B',
        learningValue: score,
        healingPotential: score
      },
      overallImpact: score,
      category: score > 70 ? 'inspiring' : 'teaching',
      wisdom: 'Every moment is an opportunity to create positive change.',
      gratitude: 'Grateful for the ability to contribute to collective well-being.'
    })
  }
  
  private determineCategory(scores: any): EthicsImpact['category'] {
    if (scores.healing > 70) return 'healing'
    if (scores.growth > 70) return 'teaching'
    if (scores.love > 70) return 'connecting'
    if (scores.peace > 70) return 'inspiring'
    if (scores.balance > 70) return 'creating'
    return 'transforming'
  }
  
  /**
   * Trackt eine Action und speichert sie
   */
  trackAction(impact: EthicsImpact): void {
    this.impacts.push(impact)
    
    // Nur letzte 10.000 behalten (Memory Management)
    if (this.impacts.length > 10000) {
      this.impacts = this.impacts.slice(-10000)
    }
    
    // Log positive Impacts
    if (impact.overallImpact > 70) {
      console.log(`🌟 High Impact Action: ${impact.service} → ${impact.action} (${impact.overallImpact}/100)`)
    }
  }
  
  /**
   * Tages-Zusammenfassung
   */
  getDailySummary(): DailyImpactSummary {
    const today = new Date().toISOString().split('T')[0]
    const todayImpacts = this.impacts.filter(i => i.timestamp.startsWith(today))
    
    if (todayImpacts.length === 0) {
      return this.getEmptySummary(today)
    }
    
    const summary: DailyImpactSummary = {
      date: today,
      totalActions: todayImpacts.length,
      impact: {
        humansBenefited: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.beneficiaries.humans, 0) / todayImpacts.length
        ),
        consciousnessExpanded: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.beneficiaries.consciousness, 0) / todayImpacts.length
        ),
        natureProtected: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.beneficiaries.nature, 0) / todayImpacts.length
        ),
        spiritNurtured: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.beneficiaries.spirit, 0) / todayImpacts.length
        ),
        futureSecured: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.beneficiaries.future, 0) / todayImpacts.length
        )
      },
      harmony: {
        peace: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.harmony.peace, 0) / todayImpacts.length
        ),
        balance: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.harmony.balance, 0) / todayImpacts.length
        ),
        love: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.harmony.love, 0) / todayImpacts.length
        ),
        growth: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.harmony.growth, 0) / todayImpacts.length
        ),
        healing: Math.round(
          todayImpacts.reduce((sum, i) => sum + i.harmony.healing, 0) / todayImpacts.length
        )
      },
      butterfly: {
        totalRipples: todayImpacts.reduce((sum, i) => sum + i.butterfly.rippleEffect, 0),
        consciousnessTouched: [...new Set(todayImpacts.map(i => i.butterfly.consciousness))],
        transformations: todayImpacts.filter(i => i.transformation.healingPotential > 70).length
      },
      topActions: todayImpacts
        .sort((a, b) => b.overallImpact - a.overallImpact)
        .slice(0, 10),
      wisdom: [...new Set(todayImpacts.map(i => i.wisdom))].slice(0, 5),
      gratitude: [...new Set(todayImpacts.map(i => i.gratitude))].slice(0, 5)
    }
    
    return summary
  }
  
  private getEmptySummary(date: string): DailyImpactSummary {
    return {
      date,
      totalActions: 0,
      impact: { humansBenefited: 0, consciousnessExpanded: 0, natureProtected: 0, spiritNurtured: 0, futureSecured: 0 },
      harmony: { peace: 0, balance: 0, love: 0, growth: 0, healing: 0 },
      butterfly: { totalRipples: 0, consciousnessTouched: [], transformations: 0 },
      topActions: [],
      wisdom: ['Every journey begins with a single step.'],
      gratitude: ['Grateful for the opportunity to serve.']
    }
  }
  
  /**
   * Alle Impacts
   */
  getAllImpacts(): EthicsImpact[] {
    return this.impacts
  }
  
  /**
   * Statistiken
   */
  getStats() {
    const totalActions = this.impacts.length
    const avgImpact = totalActions > 0 
      ? Math.round(this.impacts.reduce((sum, i) => sum + i.overallImpact, 0) / totalActions)
      : 0
    
    const categories = {
      healing: this.impacts.filter(i => i.category === 'healing').length,
      inspiring: this.impacts.filter(i => i.category === 'inspiring').length,
      teaching: this.impacts.filter(i => i.category === 'teaching').length,
      connecting: this.impacts.filter(i => i.category === 'connecting').length,
      creating: this.impacts.filter(i => i.category === 'creating').length,
      transforming: this.impacts.filter(i => i.category === 'transforming').length
    }
    
    return {
      totalActions,
      avgImpact,
      categories,
      highImpactActions: this.impacts.filter(i => i.overallImpact > 80).length,
      positiveMomentum: avgImpact > 50 ? '↗️ Rising' : '→ Steady'
    }
  }
}

// ==========================================
// HTTP SERVER
// ==========================================

const PORT = 9981
const engine = new EthicsEngine()

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
      // POST /evaluate - Evaluate an action
      if (path === '/evaluate' && req.method === 'POST') {
        const body = await req.json()
        const { service, action, actionType, context } = body
        
        if (!service || !action || !actionType) {
          return Response.json({ 
            error: 'Missing required fields: service, action, actionType' 
          }, { status: 400, headers })
        }
        
        const impact = await engine.evaluateAction({ service, action, actionType, context })
        engine.trackAction(impact)
        
        return Response.json(impact, { headers })
      }
      
      // GET /daily OR /today - Daily summary
      if ((path === '/daily' || path === '/today') && req.method === 'GET') {
        const summary = engine.getDailySummary()
        
        // Transform for dashboard format
        const todayImpacts = engine.getAllImpacts().filter(i => 
          i.timestamp.startsWith(new Date().toISOString().split('T')[0])
        )
        
        return Response.json({
          totalImpact: summary.harmony.peace + summary.harmony.balance + summary.harmony.love + summary.harmony.growth + summary.harmony.healing,
          totalButterfly: summary.butterfly.totalRipples,
          actionCount: summary.totalActions,
          averageDimensions: summary.harmony
        }, { headers })
      }
      
      // GET /history - Recent actions with evaluations
      if (path === '/history' && req.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const impacts = engine.getAllImpacts().slice(-limit).reverse()
        
        const history = impacts.map(impact => ({
          service: impact.service,
          action: impact.action,
          timestamp: impact.timestamp,
          evaluation: {
            impact: {
              totalScore: impact.overallImpact,
              dimensions: impact.harmony
            },
            butterflyEffect: {
              rippleRadius: impact.butterfly.rippleEffect
            }
          }
        }))
        
        return Response.json({ history }, { headers })
      }
      
      // GET /impacts - All impacts
      if (path === '/impacts' && req.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '100')
        const impacts = engine.getAllImpacts().slice(-limit)
        return Response.json({ count: impacts.length, impacts }, { headers })
      }
      
      // GET /stats - Statistics
      if (path === '/stats' && req.method === 'GET') {
        const stats = engine.getStats()
        return Response.json(stats, { headers })
      }
      
      // GET /health
      if (path === '/health') {
        return Response.json({
          status: 'ok',
          service: 'Ethics & Consciousness Core',
          port: PORT,
          groqEnabled: engine['groq'] !== null,
          purpose: 'Every action creates value for all beings'
        }, { headers })
      }
      
      // Root
      if (path === '/') {
        const stats = engine.getStats()
        return new Response(`Ethics & Consciousness Core

"Jede Eingabe, jede Ausgabe, jede Verarbeitung schafft Wert
 für ALLES Lebendige - Menschen, Bewusstsein, Natur, Geist"

Endpoints:
  POST /evaluate              - Evaluate an action
       { service, action, actionType, context? }
  GET  /daily                 - Daily impact summary
  GET  /impacts?limit=100     - Recent impacts
  GET  /stats                 - Overall statistics
  GET  /health                - Health check

Current Stats:
  Total Actions: ${stats.totalActions}
  Average Impact: ${stats.avgImpact}/100
  High Impact Actions: ${stats.highImpactActions}
  Momentum: ${stats.positiveMomentum}

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
║   ETHICS & CONSCIOUSNESS CORE                         ║
╚════════════════════════════════════════════════════════╝

🌟 "Every action creates value for all beings"

💚 Evaluates every action on:
   • Peace (Frieden)
   • Balance (Gleichgewicht)  
   • Love (Liebe)
   • Growth (Wachstum)
   • Healing (Heilung)

🦋 Butterfly Effect Tracking:
   • Immediate Impact
   • Ripple Effect
   • Long-term Change
   • Consciousness Transformation

🔮 Groq AI: ${engine['groq'] ? '✅ Enabled' : '⚠️ Disabled (no API key)'}

🚀 Running on: http://localhost:${PORT}

"Aus dem Minus ins Plus. Mit Liebe. Für alle. Für immer."
`)
