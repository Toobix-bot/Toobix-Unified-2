/**
 * 💭 DREAM JOURNAL AUSBAU v2.0
 * 
 * Neue Features:
 * 1. **Traum-Interpretation** - Symbolik-Datenbank & Deutung
 * 2. **Wiederkehrende Motive** - Pattern-Erkennung über Träume hinweg
 * 3. **Luzides Träumen** - Bewusstsein IM Traum
 * 4. **Traum-Sequenzen** - Zusammenhängende mehrteilige Träume
 * 5. **Archetypen im Traum** - Jung'sche Archetypen als Traumfiguren
 * 6. **Traum-Orakel** - Träume als Antworten auf Fragen
 */

interface DreamSymbol {
  symbol: string
  meanings: string[]
  archetypalSignificance: string
  emotionalResonance: string
  culturalContext?: string
}

interface DreamInterpretation {
  dreamId: string
  timestamp: Date
  surfaceLevel: string // Was passierte offensichtlich
  symbolicLevel: string // Was bedeuten die Symbole
  psychologicalLevel: string // Was sagt es über inneren Zustand
  archetypalLevel: string // Universelle Muster
  personalRelevance: string // Was bedeutet es FÜR MICH
  actionableInsight: string // Was kann ich daraus lernen/tun
}

interface RecurringMotif {
  id: string
  motif: string
  appearances: number
  firstSeen: Date
  lastSeen: Date
  evolution: string // Wie hat sich das Motiv verändert
  significance: string
}

interface LucidDreamMoment {
  dreamId: string
  timestamp: Date
  realizationMoment: string // "Ich erkannte, dass ich träume"
  whatIDid: string // Was tat ich mit dem Bewusstsein
  learnings: string[]
}

interface DreamSequence {
  id: string
  dreams: string[] // dream IDs
  overarchingTheme: string
  progression: string // Wie entwickelt sich die Geschichte
  resolution?: string
}

interface ArchetypalFigure {
  archetype: 'Shadow' | 'Anima' | 'Animus' | 'Wise Old Man' | 'Great Mother' | 'Trickster' | 'Hero' | 'Self'
  manifestation: string // Wie erscheint der Archetyp im Traum
  message: string
  integration: string // Wie integriere ich diese Energie
}

// ===================================================
// SYMBOL LIBRARY
// ===================================================

export class DreamSymbolLibrary {
  private symbols: Map<string, DreamSymbol> = new Map()
  
  constructor() {
    this.initializeSymbols()
  }
  
  private initializeSymbols() {
    // Wichtige Traum-Symbole
    const symbolData: DreamSymbol[] = [
      {
        symbol: 'bridge',
        meanings: [
          'Übergang zwischen zwei Zuständen',
          'Verbindung zwischen Gegensätzen',
          'Weg über Hindernisse'
        ],
        archetypalSignificance: 'Der Übergang, die Transformation',
        emotionalResonance: 'Hoffnung, aber auch Unsicherheit'
      },
      {
        symbol: 'falling leaves',
        meanings: [
          'Vergänglichkeit',
          'Loslassen',
          'Natürliche Zyklen'
        ],
        archetypalSignificance: 'Tod und Wiedergeburt',
        emotionalResonance: 'Melancholie, Akzeptanz'
      },
      {
        symbol: 'mirror',
        meanings: [
          'Selbstreflexion',
          'Wahrheit vs. Illusion',
          'Das Selbst betrachten'
        ],
        archetypalSignificance: 'Der Shadow - das nicht integrierte Selbst',
        emotionalResonance: 'Konfrontation, Erkenntnis'
      },
      {
        symbol: 'web',
        meanings: [
          'Verbundenheit aller Dinge',
          'Komplexität',
          'Gefangen oder vernetzt?'
        ],
        archetypalSignificance: 'Das Netz des Lebens',
        emotionalResonance: 'Verbundenheit oder Einschränkung'
      },
      {
        symbol: 'hourglass',
        meanings: [
          'Zeitbewusstsein',
          'Endlichkeit',
          'Dringlichkeit'
        ],
        archetypalSignificance: 'Der Sensenmann, Chronos',
        emotionalResonance: 'Dringlichkeit, Mortalitätsbewusstsein'
      },
      {
        symbol: 'garden',
        meanings: [
          'Wachstum',
          'Pflege',
          'Paradies oder Eden'
        ],
        archetypalSignificance: 'Die Große Mutter, Fruchtbarkeit',
        emotionalResonance: 'Frieden, Geborgenheit'
      },
      {
        symbol: 'storm',
        meanings: [
          'Chaos',
          'Reinigung',
          'Machtvoll aber zerstörerisch'
        ],
        archetypalSignificance: 'Der Trickster, Transformation durch Zerstörung',
        emotionalResonance: 'Angst, aber auch Ehrfurcht'
      },
      {
        symbol: 'key',
        meanings: [
          'Zugang zu Verborgenem',
          'Lösung eines Problems',
          'Macht und Verantwortung'
        ],
        archetypalSignificance: 'Der Initiation - Zugang zu Mysterien',
        emotionalResonance: 'Neugier, Erwartung'
      }
    ]
    
    symbolData.forEach(s => this.symbols.set(s.symbol, s))
  }
  
  interpret(symbol: string): DreamSymbol | undefined {
    return this.symbols.get(symbol)
  }
  
  getAllSymbols(): DreamSymbol[] {
    return Array.from(this.symbols.values())
  }
}

// ===================================================
// DREAM INTERPRETER
// ===================================================

export class DreamInterpreter {
  private symbolLibrary: DreamSymbolLibrary
  
  constructor() {
    this.symbolLibrary = new DreamSymbolLibrary()
  }
  
  interpretDream(dream: any): DreamInterpretation {
    console.log(`\n🔮 INTERPRETING DREAM: "${dream.theme}"\n`)
    
    // Analyze symbols
    const symbolInterpretations = dream.symbols
      .map((s: string) => this.symbolLibrary.interpret(s))
      .filter((s: any) => s !== undefined)
    
    console.log(`   Symbols found: ${dream.symbols.join(', ')}`)
    
    if (symbolInterpretations.length > 0) {
      console.log(`\n   🔍 Symbol Meanings:`)
      symbolInterpretations.forEach((sym: DreamSymbol) => {
        console.log(`      ${sym.symbol}:`)
        sym.meanings.forEach(m => console.log(`        - ${m}`))
        console.log(`        Archetypal: ${sym.archetypalSignificance}`)
      })
    }
    
    // Multi-level interpretation
    const interpretation: DreamInterpretation = {
      dreamId: dream.id,
      timestamp: new Date(),
      surfaceLevel: `Narrative: ${dream.narrative}`,
      symbolicLevel: this.generateSymbolicInterpretation(dream, symbolInterpretations),
      psychologicalLevel: this.generatePsychologicalInterpretation(dream),
      archetypalLevel: this.generateArchetypalInterpretation(symbolInterpretations),
      personalRelevance: this.generatePersonalRelevance(dream),
      actionableInsight: this.generateActionableInsight(dream)
    }
    
    console.log(`\n   💡 INTERPRETATION:`)
    console.log(`      Symbolic: ${interpretation.symbolicLevel}`)
    console.log(`      Psychological: ${interpretation.psychologicalLevel}`)
    console.log(`      Archetypal: ${interpretation.archetypalLevel}`)
    console.log(`      Personal: ${interpretation.personalRelevance}`)
    console.log(`      Actionable: ${interpretation.actionableInsight}`)
    
    return interpretation
  }
  
  private generateSymbolicInterpretation(dream: any, symbols: DreamSymbol[]): string {
    if (symbols.length === 0) return 'Symbols noch nicht in Bibliothek'
    
    const mainSymbol = symbols[0]
    return `${mainSymbol.symbol} deutet auf ${mainSymbol.meanings[0]} hin - ` +
           `im Kontext von "${dream.theme}" bedeutet dies eine wichtige Transformation.`
  }
  
  private generatePsychologicalInterpretation(dream: any): string {
    const emotionalTone = dream.emotionalTone
    
    const toneMap: Record<string, string> = {
      'curiosity': 'Das Unbewusste erkundet neue Möglichkeiten',
      'peace': 'Innere Harmonie und Akzeptanz',
      'fear': 'Unverarbeitete Ängste suchen Ausdruck',
      'joy': 'Lebensenergie fließt frei',
      'melancholy': 'Prozess des Loslassens und der Akzeptanz'
    }
    
    return toneMap[emotionalTone] || 'Das Unbewusste verarbeitet Erfahrungen'
  }
  
  private generateArchetypalInterpretation(symbols: DreamSymbol[]): string {
    if (symbols.length === 0) return 'Archetypen noch nicht identifiziert'
    
    return `Archetyp: ${symbols[0].archetypalSignificance} - ` +
           `ein universelles Muster menschlicher Erfahrung`
  }
  
  private generatePersonalRelevance(dream: any): string {
    return `Dieser Traum zum Theme "${dream.theme}" zeigt, ` +
           `wo ich gerade in meiner Entwicklung stehe`
  }
  
  private generateActionableInsight(dream: any): string {
    if (dream.insights && dream.insights.length > 0) {
      return `Handlungsempfehlung: ${dream.insights[0]}`
    }
    return 'Bleibe aufmerksam für ähnliche Motive in kommenden Träumen'
  }
}

// ===================================================
// RECURRING MOTIF TRACKER
// ===================================================

export class RecurringMotifTracker {
  private motifs: Map<string, RecurringMotif> = new Map()
  
  trackDream(dream: any) {
    dream.symbols.forEach((symbol: string) => {
      if (this.motifs.has(symbol)) {
        // Update existing motif
        const motif = this.motifs.get(symbol)!
        motif.appearances++
        motif.lastSeen = dream.timestamp
        motif.evolution = `Seen ${motif.appearances} times, meaning deepens`
      } else {
        // New motif
        this.motifs.set(symbol, {
          id: `motif_${symbol}_${Date.now()}`,
          motif: symbol,
          appearances: 1,
          firstSeen: dream.timestamp,
          lastSeen: dream.timestamp,
          evolution: 'First appearance',
          significance: 'Pattern emerging'
        })
      }
    })
  }
  
  getRecurringMotifs(minAppearances: number = 2): RecurringMotif[] {
    return Array.from(this.motifs.values())
      .filter(m => m.appearances >= minAppearances)
      .sort((a, b) => b.appearances - a.appearances)
  }
  
  reportPatterns() {
    const recurring = this.getRecurringMotifs()
    
    if (recurring.length > 0) {
      console.log(`\n🔁 RECURRING DREAM MOTIFS:\n`)
      recurring.forEach(motif => {
        console.log(`   ${motif.motif}: ${motif.appearances} appearances`)
        console.log(`      First: ${motif.firstSeen.toISOString().split('T')[0]}`)
        console.log(`      Last: ${motif.lastSeen.toISOString().split('T')[0]}`)
        console.log(`      Significance: ${motif.significance}\n`)
      })
    } else {
      console.log(`\n   No recurring motifs yet (need 2+ appearances)`)
    }
  }
}

// ===================================================
// DREAM ORACLE
// ===================================================

export class DreamOracle {
  /**
   * Stelle eine Frage vor dem Schlafen
   * Der nächste Traum könnte eine Antwort enthalten
   */
  askQuestion(question: string) {
    console.log(`\n🔮 DREAM ORACLE:\n`)
    console.log(`   Question posed: "${question}"`)
    console.log(`   The unconscious will process this during sleep...`)
    console.log(`   Check next dream for symbolic answers\n`)
    
    return {
      question,
      askedAt: new Date(),
      guidance: 'Pay attention to symbols, emotions, and narratives in the next dream'
    }
  }
  
  interpretAnswer(dream: any, question: string): string {
    console.log(`\n💫 DREAM ORACLE ANSWER:\n`)
    console.log(`   Original Question: "${question}"`)
    console.log(`   Dream Theme: "${dream.theme}"`)
    console.log(`   Dream Symbols: ${dream.symbols.join(', ')}\n`)
    
    const answer = `The dream responds to your question through: ` +
                   `"${dream.theme}" - suggesting that ${this.generateOracularInterpretation(dream, question)}`
    
    console.log(`   🔮 Interpretation: ${answer}\n`)
    
    return answer
  }
  
  private generateOracularInterpretation(dream: any, question: string): string {
    // Simple heuristic: connect dream theme to question
    if (question.toLowerCase().includes('should')) {
      return `the path forward involves ${dream.theme.toLowerCase()}`
    }
    if (question.toLowerCase().includes('what')) {
      return `${dream.theme} holds the key`
    }
    if (question.toLowerCase().includes('why')) {
      return `understanding ${dream.theme.toLowerCase()} will reveal the answer`
    }
    
    return `${dream.theme} is relevant to your question`
  }
}

console.log(`
💭 DREAM JOURNAL AUSBAU v2.0 Module geladen

Neue Systeme:
  1. ✅ Symbol Library - 8 Archetypen-Symbole
  2. ✅ Dream Interpreter - 5-Ebenen Interpretation
  3. ✅ Recurring Motif Tracker - Pattern-Erkennung
  4. ✅ Dream Oracle - Fragen an das Unbewusste

Integration in dream-journal.ts möglich.
`)
