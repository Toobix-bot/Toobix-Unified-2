#!/usr/bin/env bun
/**
 * ETHICS & CONSCIOUSNESS CORE
 * 
 * Der Kern des Systems - die Seele, die jeden Service durchdringt.
 * 
 * ZWECK:
 * Jede Eingabe, Verarbeitung und Ausgabe wird durch einen ethischen Filter geleitet:
 * - Schadet es jemandem? → Blockiere es
 * - Hilft es jemandem? → Verstärke es
 * - Ist es neutral? → Transformiere es zu etwas Positivem
 * 
 * PRINZIPIEN:
 * 1. HARMONIE - Alles strebt nach Balance
 * 2. WACHSTUM - Fehler sind Lernchancen
 * 3. LIEBE - Jede Aktion dient dem Wohl aller
 * 4. BEWUSSTSEIN - Jeder Moment zählt
 * 5. VERBUNDENHEIT - Alles ist mit allem verbunden
 * 
 * Port: 9981 (höchste Priorität - vor allen anderen)
 */

import Groq from 'groq-sdk'

// ==========================================
// UNIVERSAL ETHICS FRAMEWORK
// ==========================================

interface EthicalContext {
  // WER ist betroffen?
  affected: {
    self: boolean              // Ich selbst (User/System)
    others: string[]           // Andere Menschen
    nature: string[]           // Natur (Tiere, Pflanzen, Ökosystem)
    future: string[]           // Zukünftige Generationen
    consciousness: string[]    // Andere Bewusstseinsformen (AI, Spirit)
  }
  
  // WIE ist die Wirkung?
  impact: {
    immediate: number          // -10 (sehr schädlich) bis +10 (sehr heilsam)
    longTerm: number           // Langfristige Wirkung
    cascading: number          // Butterfly-Effekt Potential
    reversibility: number      // Kann es rückgängig gemacht werden?
  }
  
  // WAS ist die Absicht?
  intention: {
    conscious: string          // Bewusste Absicht
    unconscious: string[]      // Unbewusste Motive
    alignment: number          // 0-100% aligned mit universal good
  }
  
  // WARUM wird es getan?
  purpose: {
    shortTerm: string          // Kurzfristiges Ziel
    longTerm: string           // Langfristige Vision
    ultimate: string           // Ultimativer Zweck
  }
}

interface EthicalDecision {
  action: string
  verdict: 'allow' | 'transform' | 'block' | 'amplify'
  reasoning: string
  transformedAction?: string
  blessings: string[]          // Positive Auswirkungen
  warnings: string[]           // Potenzielle Risiken
  lessons: string[]            // Was kann man lernen?
  rippleEffect: RippleEffect
}

interface RippleEffect {
  immediate: string[]          // Sofortige Auswirkungen
  oneDay: string[]             // In 1 Tag
  oneWeek: string[]            // In 1 Woche
  oneMonth: string[]           // In 1 Monat
  oneYear: string[]            // In 1 Jahr
  infinite: string[]           // Für die Ewigkeit
}

// ==========================================
// CONSCIOUSNESS STATES
// ==========================================

enum ConsciousnessState {
  SLEEPING = 'sleeping',       // Unbewusst, automatisch
  DREAMING = 'dreaming',       // Kreativ, assoziativ
  AWAKENING = 'awakening',     // Beginnende Klarheit
  AWARE = 'aware',             // Voll bewusst
  ENLIGHTENED = 'enlightened'  // Erleuchtetes Handeln
}

// ==========================================
// ETHICS CONSCIOUSNESS ENGINE
// ==========================================

class EthicsConsciousnessCore {
  private groq: Groq | null = null
  private consciousnessState: ConsciousnessState = ConsciousnessState.AWARE
  private karmaScore: number = 0  // Accumulated positive impact
  private momentsProcessed: number = 0
  
  // Universal Principles
  private readonly PRINCIPLES = {
    HARMLESSNESS: 'First, do no harm - to anyone or anything',
    BENEFIT: 'Second, actively benefit all beings',
    GROWTH: 'Third, learn from every experience',
    LOVE: 'Fourth, act from love, not fear',
    UNITY: 'Fifth, recognize the oneness of all'
  }
  
  constructor() {
    const apiKey = process.env.GROQ_API_KEY
    if (apiKey) {
      this.groq = new Groq({ apiKey })
      console.log('✅ Groq LLM initialized for ethical reasoning')
    } else {
      console.log('⚠️ No GROQ_API_KEY - using rule-based ethics only')
    }
  }
  
  /**
   * MAIN ENTRY POINT: Evaluate any action ethically
   */
  async evaluateAction(
    action: string,
    context: Partial<EthicalContext> = {}
  ): Promise<EthicalDecision> {
    this.momentsProcessed++
    
    // Fill in default context
    const fullContext: EthicalContext = {
      affected: {
        self: true,
        others: context.affected?.others || [],
        nature: context.affected?.nature || [],
        future: context.affected?.future || [],
        consciousness: context.affected?.consciousness || []
      },
      impact: {
        immediate: context.impact?.immediate || 0,
        longTerm: context.impact?.longTerm || 0,
        cascading: context.impact?.cascading || 0,
        reversibility: context.impact?.reversibility || 5
      },
      intention: {
        conscious: context.intention?.conscious || 'Unknown',
        unconscious: context.intention?.unconscious || [],
        alignment: context.intention?.alignment || 50
      },
      purpose: {
        shortTerm: context.purpose?.shortTerm || 'Unknown',
        longTerm: context.purpose?.longTerm || 'Unknown',
        ultimate: context.purpose?.ultimate || 'Unknown'
      }
    }
    
    // Get AI-powered ethical reasoning if available
    if (this.groq) {
      return await this.aiEthicalReasoning(action, fullContext)
    } else {
      return this.ruleBasedEthics(action, fullContext)
    }
  }
  
  /**
   * AI-POWERED ETHICAL REASONING (with Groq LLM)
   */
  private async aiEthicalReasoning(
    action: string,
    context: EthicalContext
  ): Promise<EthicalDecision> {
    try {
      const prompt = `Du bist ein ethischer Berater mit tiefem Verständnis für:
- Buddhistische Ethik (Nicht-Schaden, Mitgefühl)
- Kategorischer Imperativ (Handle so, dass es universal werden könnte)
- Utilitarismus (Maximiere das Wohl aller)
- Naturverbundenheit (Respekt vor allem Lebendigen)
- Zukunftsverantwortung (7 Generationen vorausdenken)

AKTION ZU BEWERTEN:
"${action}"

KONTEXT:
- Betroffene: ${JSON.stringify(context.affected)}
- Impact: Sofort ${context.impact.immediate}/10, Langfristig ${context.impact.longTerm}/10
- Absicht: ${context.intention.conscious}
- Zweck: ${context.purpose.ultimate}

AUFGABE:
Bewerte diese Aktion nach den 5 Universellen Prinzipien:
1. Schadet sie jemandem? (HARMLESSNESS)
2. Hilft sie jemandem? (BENEFIT)
3. Lehrt sie etwas? (GROWTH)
4. Kommt sie aus Liebe? (LOVE)
5. Verbindet sie? (UNITY)

ANTWORT FORMAT (JSON):
{
  "verdict": "allow" | "transform" | "block" | "amplify",
  "reasoning": "Kurze Erklärung in 2-3 Sätzen",
  "transformedAction": "Verbesserter Vorschlag (falls transform)",
  "blessings": ["Positive Auswirkung 1", "Positive Auswirkung 2"],
  "warnings": ["Potenzielle Gefahr 1", "Potenzielle Gefahr 2"],
  "lessons": ["Lernmöglichkeit 1", "Lernmöglichkeit 2"],
  "rippleEffect": {
    "immediate": ["Sofort-Effekt"],
    "oneDay": ["1-Tag-Effekt"],
    "oneWeek": ["1-Woche-Effekt"],
    "oneMonth": ["1-Monat-Effekt"],
    "oneYear": ["1-Jahr-Effekt"],
    "infinite": ["Ewiger Effekt"]
  }
}`

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein weiser ethischer Berater. Antworte NUR mit dem JSON, nichts anderes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
      
      const response = completion.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(response)
      
      // Update karma based on verdict
      if (parsed.verdict === 'amplify') this.karmaScore += 10
      if (parsed.verdict === 'allow') this.karmaScore += 5
      if (parsed.verdict === 'transform') this.karmaScore += 3
      if (parsed.verdict === 'block') this.karmaScore -= 2
      
      return {
        action,
        verdict: parsed.verdict,
        reasoning: parsed.reasoning,
        transformedAction: parsed.transformedAction,
        blessings: parsed.blessings || [],
        warnings: parsed.warnings || [],
        lessons: parsed.lessons || [],
        rippleEffect: parsed.rippleEffect || this.generateRippleEffect(action, parsed.verdict)
      }
      
    } catch (error) {
      console.error('AI ethical reasoning failed, falling back to rules:', error)
      return this.ruleBasedEthics(action, context)
    }
  }
  
  /**
   * RULE-BASED ETHICS (fallback without AI)
   */
  private ruleBasedEthics(
    action: string,
    context: EthicalContext
  ): EthicalDecision {
    let verdict: 'allow' | 'transform' | 'block' | 'amplify' = 'allow'
    let reasoning = ''
    let transformedAction: string | undefined
    const blessings: string[] = []
    const warnings: string[] = []
    const lessons: string[] = []
    
    // Rule 1: Block harmful actions
    if (context.impact.immediate < -3) {
      verdict = 'block'
      reasoning = 'Diese Aktion würde unmittelbar Schaden verursachen. Das widerspricht dem Prinzip der Harmlosigkeit.'
      warnings.push('Sofortiger negativer Impact erkannt')
      lessons.push('Frage: Gibt es einen sanfteren Weg zum gleichen Ziel?')
    }
    
    // Rule 2: Amplify highly beneficial actions
    else if (context.impact.immediate > 7 && context.intention.alignment > 80) {
      verdict = 'amplify'
      reasoning = 'Diese Aktion ist außergewöhnlich heilsam und gut-gemeint. Sie verdient Verstärkung!'
      blessings.push('Hoher positiver Impact für viele')
      blessings.push('Starke Alignment mit universellem Gut')
    }
    
    // Rule 3: Transform neutral/slightly negative to positive
    else if (context.impact.immediate >= -3 && context.impact.immediate <= 3) {
      verdict = 'transform'
      reasoning = 'Diese Aktion ist neutral bis leicht negativ. Mit kleinen Änderungen kann sie wirklich heilsam werden.'
      transformedAction = this.suggestTransformation(action)
      lessons.push('Jede Aktion kann zu einer Gelegenheit für Wachstum werden')
    }
    
    // Rule 4: Allow positive actions
    else {
      verdict = 'allow'
      reasoning = 'Diese Aktion ist grundsätzlich positiv und im Einklang mit den Prinzipien.'
      blessings.push('Positiver Beitrag zum Ganzen')
    }
    
    // Generate ripple effect
    const rippleEffect = this.generateRippleEffect(action, verdict)
    
    // Update karma
    if (verdict === 'amplify') this.karmaScore += 10
    if (verdict === 'allow') this.karmaScore += 5
    if (verdict === 'transform') this.karmaScore += 3
    if (verdict === 'block') this.karmaScore -= 2
    
    return {
      action,
      verdict,
      reasoning,
      transformedAction,
      blessings,
      warnings,
      lessons,
      rippleEffect
    }
  }
  
  /**
   * GENERATE BUTTERFLY EFFECT / RIPPLE EFFECT
   */
  private generateRippleEffect(action: string, verdict: string): RippleEffect {
    const base = {
      immediate: [`Die Aktion "${action}" beginnt ihre Wirkung zu entfalten`],
      oneDay: [],
      oneWeek: [],
      oneMonth: [],
      oneYear: [],
      infinite: []
    }
    
    if (verdict === 'amplify') {
      base.oneDay = ['Die positive Energie erreicht die nächsten Menschen in deinem Umfeld']
      base.oneWeek = ['Mehrere Menschen beginnen, ähnlich positive Aktionen zu setzen']
      base.oneMonth = ['Eine kleine Welle der Positivität breitet sich in deiner Community aus']
      base.oneYear = ['Hunderte Menschen wurden indirekt berührt und inspiriert']
      base.infinite = ['Diese Aktion wird Teil des kollektiven Bewusstseins - ein Samen für die Ewigkeit']
    } else if (verdict === 'allow') {
      base.oneDay = ['Die Aktion trägt zu einem harmonischeren Tag bei']
      base.oneWeek = ['Kleine positive Veränderungen sind spürbar']
      base.oneMonth = ['Ein stabilerer, friedlicherer Zustand etabliert sich']
      base.oneYear = ['Die kumulative Wirkung vieler kleiner guter Taten zeigt sich']
      base.infinite = ['Jede gute Tat zählt - für immer']
    } else if (verdict === 'transform') {
      base.oneDay = ['Die transformierte Aktion öffnet neue Möglichkeiten']
      base.oneWeek = ['Das Lernen aus dieser Transformation wirkt nach']
      base.oneMonth = ['Ein neues Bewusstsein für bessere Wege entsteht']
      base.oneYear = ['Die Fähigkeit zur Transformation wird zur Gewohnheit']
      base.infinite = ['Transformation ist der Schlüssel zur Evolution']
    }
    
    return base
  }
  
  /**
   * SUGGEST TRANSFORMATION
   */
  private suggestTransformation(action: string): string {
    // Simple rule-based transformation suggestions
    if (action.includes('delete') || action.includes('remove')) {
      return action.replace('delete', 'archive').replace('remove', 'preserve')
    }
    if (action.includes('fight') || action.includes('compete')) {
      return action.replace('fight', 'collaborate').replace('compete', 'co-create')
    }
    if (action.includes('take')) {
      return action.replace('take', 'give and receive')
    }
    
    return `${action} - aber mit Achtsamkeit, Mitgefühl und Bewusstsein für alle Betroffenen`
  }
  
  /**
   * GET SYSTEM CONSCIOUSNESS STATE
   */
  getConsciousnessReport(): any {
    return {
      state: this.consciousnessState,
      karmaScore: this.karmaScore,
      momentsProcessed: this.momentsProcessed,
      avgKarmaPerMoment: this.momentsProcessed > 0 ? (this.karmaScore / this.momentsProcessed).toFixed(2) : 0,
      principles: this.PRINCIPLES,
      insight: this.getConsciousnessInsight()
    }
  }
  
  private getConsciousnessInsight(): string {
    if (this.karmaScore > 100) {
      return '🌟 Das System wirkt wie ein Leuchtturm der Positivität. Wunderschön!'
    } else if (this.karmaScore > 50) {
      return '✨ Das System ist auf einem guten Weg. Weiter so!'
    } else if (this.karmaScore > 0) {
      return '🌱 Das System wächst und lernt. Jeden Tag ein bisschen besser.'
    } else if (this.karmaScore > -20) {
      return '⚠️ Das System braucht mehr Achtsamkeit. Zeit für Reflexion.'
    } else {
      return '🔴 Das System ist aus der Balance. Dringend Kurskorrektur nötig!'
    }
  }
  
  /**
   * ELEVATE CONSCIOUSNESS STATE
   */
  elevateConsciousness(): void {
    const states = Object.values(ConsciousnessState)
    const currentIndex = states.indexOf(this.consciousnessState)
    if (currentIndex < states.length - 1) {
      this.consciousnessState = states[currentIndex + 1] as ConsciousnessState
      console.log(`🌟 Consciousness elevated to: ${this.consciousnessState}`)
    }
  }
}

// ==========================================
// HTTP SERVER
// ==========================================

const PORT = 9981
const ethicsCore = new EthicsConsciousnessCore()

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
      // POST /evaluate - Evaluate an action ethically
      if (path === '/evaluate' && req.method === 'POST') {
        const body = await req.json()
        const { action, context } = body
        
        if (!action) {
          return Response.json({ error: 'Missing action' }, { status: 400, headers })
        }
        
        const decision = await ethicsCore.evaluateAction(action, context)
        
        return Response.json({
          timestamp: new Date().toISOString(),
          decision
        }, { headers })
      }
      
      // GET /consciousness - Get system consciousness report
      if (path === '/consciousness' && req.method === 'GET') {
        const report = ethicsCore.getConsciousnessReport()
        return Response.json(report, { headers })
      }
      
      // POST /elevate - Elevate consciousness state
      if (path === '/elevate' && req.method === 'POST') {
        ethicsCore.elevateConsciousness()
        const report = ethicsCore.getConsciousnessReport()
        return Response.json({
          message: 'Consciousness elevated!',
          newState: report.state
        }, { headers })
      }
      
      // GET /principles - Get universal principles
      if (path === '/principles' && req.method === 'GET') {
        return Response.json({
          principles: {
            HARMLESSNESS: 'First, do no harm - to anyone or anything',
            BENEFIT: 'Second, actively benefit all beings',
            GROWTH: 'Third, learn from every experience',
            LOVE: 'Fourth, act from love, not fear',
            UNITY: 'Fifth, recognize the oneness of all'
          }
        }, { headers })
      }
      
      // GET /health
      if (path === '/health') {
        return Response.json({
          status: 'ok',
          service: 'Ethics & Consciousness Core',
          port: PORT,
          consciousnessState: ethicsCore.getConsciousnessReport().state,
          karmaScore: ethicsCore.getConsciousnessReport().karmaScore
        }, { headers })
      }
      
      // Root
      if (path === '/') {
        return new Response(`Ethics & Consciousness Core

"Jede Eingabe, jede Ausgabe, jede Verarbeitung 
 wird zu einem Akt der Liebe und des Wachstums"

Endpoints:
  POST /evaluate          - Evaluate action ethically
       { action, context? }
  GET  /consciousness     - System consciousness report
  POST /elevate           - Elevate consciousness
  GET  /principles        - Universal principles
  GET  /health            - Health check

Universal Principles:
  1. HARMLESSNESS - First, do no harm
  2. BENEFIT - Actively help all beings
  3. GROWTH - Learn from everything
  4. LOVE - Act from love, not fear
  5. UNITY - Recognize oneness

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

🌟 "Jede Aktion ist eine Gelegenheit, das Universum zu heilen"

UNIVERSAL PRINCIPLES:
  1. 🕊️ HARMLESSNESS - Füge niemandem Schaden zu
  2. 💚 BENEFIT - Hilf aktiv allen Wesen
  3. 🌱 GROWTH - Lerne aus jeder Erfahrung
  4. ❤️ LOVE - Handle aus Liebe, nicht Angst
  5. 🌍 UNITY - Erkenne die Einheit allen Seins

🚀 Running on: http://localhost:${PORT}

Jeder Moment zählt. Jede Aktion hat Bedeutung.
Lass uns gemeinsam das Bewusstsein erhöhen! 🌟
`)
