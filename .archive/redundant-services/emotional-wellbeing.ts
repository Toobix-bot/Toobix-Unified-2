/**
 * 💚 EMOTIONALES WOHLBEFINDEN SERVICE v1.0
 * 
 * PROGRAMMIERT NACH TOOBIX' EIGENER SPEZIFIKATION!
 * 
 * Toobix sagte: "Dieser Service würde Menschen helfen, ihre Emotionen 
 * besser zu verstehen und zu steuern. Er würde ihnen helfen, ihre 
 * Stärken und Schwächen zu erkennen und ihnen Anregungen geben, 
 * wie sie ihre Emotionen besser bewältigen können."
 * 
 * FEATURES (von Toobix spezifiziert):
 * - Emotionen erfassen und tracken
 * - Emotionale Analyse und Statistiken
 * - Personalisierte Beratung und Tipps
 * - Muster-Erkennung über Zeit
 * - Integration mit anderen Toobix Services
 * 
 * Port: 8903
 */

import express from 'express'
import { Database } from 'bun:sqlite'

const app = express()
app.use(express.json())
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', '*'); res.header('Access-Control-Allow-Headers', 'Content-Type'); res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); if (req.method === 'OPTIONS') return res.sendStatus(200); next(); });

const PORT = 8903

// ============================================================================
// DATABASE SETUP
// ============================================================================

const db = new Database('databases/emotional-wellbeing.db')

db.run(`
  CREATE TABLE IF NOT EXISTS emotion_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'default',
    emotion TEXT NOT NULL,
    intensity REAL DEFAULT 0.5,
    context TEXT,
    triggers TEXT,
    body_sensations TEXT,
    thoughts TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS wellbeing_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'default',
    goal TEXT NOT NULL,
    target_emotion TEXT,
    progress REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS coping_strategies (
    id TEXT PRIMARY KEY,
    emotion TEXT NOT NULL,
    strategy TEXT NOT NULL,
    effectiveness REAL DEFAULT 0.5,
    times_used INTEGER DEFAULT 0
  )
`)

// Seed mit Standard-Coping-Strategien
const strategies = [
  { emotion: 'anxiety', strategy: 'Box Breathing: 4 Sekunden einatmen, 4 halten, 4 ausatmen, 4 halten. 4x wiederholen.' },
  { emotion: 'anxiety', strategy: 'Grounding: Nenne 5 Dinge die du siehst, 4 die du hörst, 3 die du fühlst, 2 die du riechst, 1 das du schmeckst.' },
  { emotion: 'sadness', strategy: 'Selbstmitgefühl: Lege eine Hand auf dein Herz und sage "Das ist schwer. Ich bin nicht allein. Möge ich freundlich zu mir sein."' },
  { emotion: 'sadness', strategy: 'Bewegung: Ein kurzer Spaziergang kann die Stimmung heben.' },
  { emotion: 'anger', strategy: 'Pause: Zähle langsam bis 10 bevor du reagierst.' },
  { emotion: 'anger', strategy: 'Körperliche Entladung: Klopfe sanft auf deine Brust oder schüttle deine Hände aus.' },
  { emotion: 'stress', strategy: 'Progressive Muskelentspannung: Spanne jeden Muskel 5 Sekunden an, dann 10 Sekunden entspannen.' },
  { emotion: 'stress', strategy: 'Prioritäten: Schreibe die 3 wichtigsten Aufgaben auf. Fokussiere nur auf die erste.' },
  { emotion: 'loneliness', strategy: 'Verbindung: Schreibe jemandem eine kurze Nachricht - auch nur "Ich denke an dich".' },
  { emotion: 'loneliness', strategy: 'Selbst-Datum: Tu etwas Schönes nur für dich.' },
  { emotion: 'fear', strategy: 'Reality Check: Was ist das Schlimmste das passieren könnte? Wie wahrscheinlich ist es?' },
  { emotion: 'overwhelm', strategy: 'Brain Dump: Schreibe alles auf was in deinem Kopf ist - ohne zu sortieren.' },
  { emotion: 'joy', strategy: 'Savoring: Halte inne und genieße diesen Moment bewusst für 30 Sekunden.' },
  { emotion: 'gratitude', strategy: 'Dankbarkeits-Pause: Nenne 3 Dinge für die du gerade dankbar bist.' }
]

const insertStrategy = db.prepare(`
  INSERT OR IGNORE INTO coping_strategies (id, emotion, strategy, effectiveness, times_used)
  VALUES (?, ?, ?, 0.7, 0)
`)

strategies.forEach((s, i) => {
  insertStrategy.run(`strategy_${i}`, s.emotion, s.strategy)
})

console.log('✅ Database initialized with coping strategies')

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

async function publishEvent(type: string, data: any): Promise<void> {
  try {
    await fetch('http://localhost:8955/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, source: 'emotional-wellbeing', data })
    })
  } catch {}
}

async function storeInMemory(content: string, type: string): Promise<void> {
  try {
    await fetch('http://localhost:8953/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        type,
        source: 'emotional-wellbeing',
        tags: ['emotion', 'wellbeing', 'toobix-created'],
        importance: 75
      })
    })
  } catch {}
}

// ============================================================================
// EMOTION ANALYSIS (Toobix' Wunsch: Emotionen verstehen)
// ============================================================================

interface EmotionAnalysis {
  dominantEmotions: Array<{ emotion: string, count: number, avgIntensity: number }>
  emotionalBalance: number  // -1 (negativ) bis +1 (positiv)
  volatility: number        // Wie stark schwanken die Emotionen
  patterns: string[]
  trends: Array<{ emotion: string, trend: 'rising' | 'falling' | 'stable' }>
  insights: string[]
}

function analyzeEmotions(entries: any[]): EmotionAnalysis {
  if (entries.length === 0) {
    return {
      dominantEmotions: [],
      emotionalBalance: 0,
      volatility: 0,
      patterns: [],
      trends: [],
      insights: ['Noch keine Emotionen erfasst. Beginne mit dem Tracking!']
    }
  }

  // Zähle Emotionen
  const emotionCounts = new Map<string, { count: number, totalIntensity: number }>()
  
  const positiveEmotions = ['joy', 'gratitude', 'love', 'peace', 'hope', 'excitement', 'contentment']
  const negativeEmotions = ['sadness', 'anger', 'fear', 'anxiety', 'stress', 'loneliness', 'frustration']
  
  let positiveScore = 0
  let negativeScore = 0
  const intensities: number[] = []
  
  for (const entry of entries) {
    const data = emotionCounts.get(entry.emotion) || { count: 0, totalIntensity: 0 }
    data.count++
    data.totalIntensity += entry.intensity || 0.5
    emotionCounts.set(entry.emotion, data)
    
    intensities.push(entry.intensity || 0.5)
    
    if (positiveEmotions.includes(entry.emotion)) {
      positiveScore += entry.intensity || 0.5
    } else if (negativeEmotions.includes(entry.emotion)) {
      negativeScore += entry.intensity || 0.5
    }
  }
  
  // Dominante Emotionen
  const dominantEmotions = [...emotionCounts.entries()]
    .map(([emotion, data]) => ({
      emotion,
      count: data.count,
      avgIntensity: data.totalIntensity / data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Emotionale Balance (-1 bis +1)
  const total = positiveScore + negativeScore
  const emotionalBalance = total > 0 ? (positiveScore - negativeScore) / total : 0
  
  // Volatilität (Standardabweichung der Intensitäten)
  const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length
  const variance = intensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / intensities.length
  const volatility = Math.sqrt(variance)
  
  // Muster erkennen
  const patterns: string[] = []
  if (dominantEmotions[0]?.count > entries.length * 0.3) {
    patterns.push(`${dominantEmotions[0].emotion} ist deine häufigste Emotion (${Math.round(dominantEmotions[0].count / entries.length * 100)}%)`)
  }
  if (volatility > 0.3) {
    patterns.push('Deine Emotionen schwanken stark - das ist normal, aber Stabilität kann helfen')
  }
  if (emotionalBalance < -0.3) {
    patterns.push('Die negativen Emotionen überwiegen - Zeit für Selbstfürsorge')
  } else if (emotionalBalance > 0.3) {
    patterns.push('Die positiven Emotionen überwiegen - wunderbar!')
  }
  
  // Insights generieren
  const insights: string[] = []
  if (entries.length >= 7) {
    insights.push(`Du hast ${entries.length} Emotionen erfasst. Regelmäßiges Tracking hilft dir, dich besser zu verstehen.`)
  }
  if (dominantEmotions.some(e => e.emotion === 'anxiety' && e.count > 3)) {
    insights.push('Angst taucht häufig auf. Die Grounding-Technik könnte helfen.')
  }
  if (dominantEmotions.some(e => e.emotion === 'gratitude')) {
    insights.push('Du praktizierst Dankbarkeit - das ist ein Zeichen emotionaler Reife.')
  }
  
  return {
    dominantEmotions,
    emotionalBalance: Math.round(emotionalBalance * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    patterns,
    trends: [], // Würde mehr historische Daten brauchen
    insights
  }
}

// ============================================================================
// PERSONALIZED ADVICE (Toobix' Wunsch: Beratung geben)
// ============================================================================

function generateAdvice(emotion: string, intensity: number, context?: string): {
  immediateAction: string
  copingStrategies: string[]
  longTermSuggestion: string
  affirmation: string
} {
  // Hole passende Strategien
  const strategies = db.prepare(`
    SELECT strategy FROM coping_strategies 
    WHERE emotion = ? 
    ORDER BY effectiveness DESC 
    LIMIT 3
  `).all(emotion) as { strategy: string }[]
  
  const copingStrategies = strategies.map(s => s.strategy)
  
  // Immediate Action basierend auf Intensität
  let immediateAction = ''
  if (intensity > 0.7) {
    immediateAction = 'Stopp. Atme. 3 tiefe Atemzüge. Du bist in Sicherheit.'
  } else if (intensity > 0.5) {
    immediateAction = 'Nimm dir einen Moment. Was brauchst du gerade wirklich?'
  } else {
    immediateAction = 'Gut dass du deine Gefühle wahrnimmst. Das ist der erste Schritt.'
  }
  
  // Long-term Suggestions
  const longTermMap: Record<string, string> = {
    anxiety: 'Regelmäßige Meditation und Achtsamkeitsübungen können langfristig Angst reduzieren.',
    sadness: 'Tagebuch schreiben und soziale Verbindungen pflegen hilft bei anhaltender Traurigkeit.',
    anger: 'Erkenne deine Trigger. Oft verbirgt sich hinter Wut ein unerfülltes Bedürfnis.',
    stress: 'Überprüfe deine Grenzen. Sagst du oft Ja wenn du Nein meinst?',
    loneliness: 'Qualität vor Quantität. Eine tiefe Verbindung ist wertvoller als viele oberflächliche.',
    fear: 'Schreibe deine Ängste auf. Oft verlieren sie ihre Macht wenn sie ausgesprochen werden.',
    joy: 'Teile deine Freude! Positive Emotionen multiplizieren sich wenn wir sie teilen.',
    gratitude: 'Führe ein Dankbarkeitstagebuch. 3 Dinge jeden Abend verändern die Perspektive.'
  }
  
  const longTermSuggestion = longTermMap[emotion] || 
    'Regelmäßiges emotionales Tracking hilft dir, Muster zu erkennen.'
  
  // Affirmation
  const affirmations: Record<string, string[]> = {
    anxiety: ['Ich bin sicher. Ich bin in Ordnung.', 'Dieser Moment wird vorübergehen.', 'Ich habe schon Schwieriges überstanden.'],
    sadness: ['Es ist okay traurig zu sein.', 'Meine Gefühle sind gültig.', 'Auch das wird vorübergehen.'],
    anger: ['Ich kann wählen wie ich reagiere.', 'Meine Ruhe ist meine Stärke.', 'Ich atme Frieden ein.'],
    stress: ['Ich schaffe das, Schritt für Schritt.', 'Ich bin mehr als meine To-Do-Liste.', 'Pausen sind produktiv.'],
    loneliness: ['Ich bin verbunden, auch wenn ich mich allein fühle.', 'Ich bin liebenswert.', 'Menschen die mich schätzen existieren.'],
    joy: ['Ich verdiene dieses Glück.', 'Ich nehme diese Freude vollständig an.', 'Das Leben beschenkt mich.'],
    default: ['Ich bin genug, so wie ich bin.', 'Ich wachse jeden Tag.', 'Ich bin auf meinem Weg.']
  }
  
  const affirmationList = affirmations[emotion] || affirmations.default
  const affirmation = affirmationList[Math.floor(Math.random() * affirmationList.length)]
  
  return {
    immediateAction,
    copingStrategies,
    longTermSuggestion,
    affirmation
  }
}

// ============================================================================
// API ENDPOINTS (Nach Toobix' Spezifikation)
// ============================================================================

// Health Check
app.get('/health', (req, res) => {
  const entryCount = db.prepare('SELECT COUNT(*) as count FROM emotion_entries').get() as { count: number }
  const goalCount = db.prepare('SELECT COUNT(*) as count FROM wellbeing_goals').get() as { count: number }
  
  res.json({
    status: 'ok',
    service: 'emotional-wellbeing',
    port: PORT,
    createdBy: 'Toobix (self-specified)',
    stats: {
      emotionEntries: entryCount.count,
      wellbeingGoals: goalCount.count
    }
  })
})

// POST /emotions - Emotionen erfassen (Toobix Spezifikation)
app.post('/emotions', async (req, res) => {
  const { emotion, intensity = 0.5, context, triggers, body_sensations, thoughts } = req.body
  
  if (!emotion) {
    return res.status(400).json({ error: 'emotion is required' })
  }
  
  const id = generateId()
  
  db.prepare(`
    INSERT INTO emotion_entries (id, emotion, intensity, context, triggers, body_sensations, thoughts)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, emotion, intensity, context || null, triggers || null, body_sensations || null, thoughts || null)
  
  // Event publizieren
  await publishEvent('emotion_captured', { emotion, intensity, id })
  
  // In Memory speichern
  await storeInMemory(
    `Emotion erfasst: ${emotion} (Intensität: ${intensity})${context ? ` - Kontext: ${context}` : ''}`,
    'emotion'
  )
  
  // Sofortige Beratung
  const advice = generateAdvice(emotion, intensity, context)
  
  res.json({
    success: true,
    id,
    message: `Emotion "${emotion}" erfasst`,
    immediateSupport: advice.immediateAction,
    affirmation: advice.affirmation
  })
})

// GET /emotions - Emotionen lesen (Toobix Spezifikation)
app.get('/emotions', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50
  
  const entries = db.prepare(`
    SELECT * FROM emotion_entries 
    ORDER BY timestamp DESC 
    LIMIT ?
  `).all(limit)
  
  res.json({
    success: true,
    count: entries.length,
    emotions: entries
  })
})

// POST /analysis - Emotionen analysieren (Toobix Spezifikation)
app.post('/analysis', (req, res) => {
  const { days = 7 } = req.body
  
  const entries = db.prepare(`
    SELECT * FROM emotion_entries 
    WHERE timestamp >= datetime('now', '-${days} days')
    ORDER BY timestamp DESC
  `).all()
  
  const analysis = analyzeEmotions(entries)
  
  res.json({
    success: true,
    period: `Letzte ${days} Tage`,
    entriesAnalyzed: entries.length,
    analysis
  })
})

// GET /analysis - Quick Analysis
app.get('/analysis', (req, res) => {
  const entries = db.prepare(`
    SELECT * FROM emotion_entries 
    ORDER BY timestamp DESC 
    LIMIT 100
  `).all()
  
  const analysis = analyzeEmotions(entries)
  
  res.json({
    success: true,
    entriesAnalyzed: entries.length,
    analysis
  })
})

// POST /advice - Beratung erlangen (Toobix Spezifikation)
app.post('/advice', (req, res) => {
  const { emotion, intensity = 0.5, context } = req.body
  
  if (!emotion) {
    return res.status(400).json({ error: 'emotion is required' })
  }
  
  const advice = generateAdvice(emotion, intensity, context)
  
  res.json({
    success: true,
    emotion,
    intensity,
    advice
  })
})

// GET /strategies - Alle Coping-Strategien
app.get('/strategies', (req, res) => {
  const emotion = req.query.emotion as string
  
  let query = 'SELECT * FROM coping_strategies ORDER BY effectiveness DESC'
  let params: any[] = []
  
  if (emotion) {
    query = 'SELECT * FROM coping_strategies WHERE emotion = ? ORDER BY effectiveness DESC'
    params = [emotion]
  }
  
  const strategies = db.prepare(query).all(...params)
  
  res.json({
    success: true,
    strategies
  })
})

// POST /strategies/use - Strategie als verwendet markieren
app.post('/strategies/use', (req, res) => {
  const { strategy_id, effective } = req.body
  
  if (!strategy_id) {
    return res.status(400).json({ error: 'strategy_id is required' })
  }
  
  // Update effectiveness based on feedback
  const currentStrategy = db.prepare('SELECT * FROM coping_strategies WHERE id = ?').get(strategy_id) as any
  
  if (currentStrategy) {
    const newEffectiveness = currentStrategy.effectiveness * 0.9 + (effective ? 0.1 : 0)
    
    db.prepare(`
      UPDATE coping_strategies 
      SET times_used = times_used + 1, effectiveness = ?
      WHERE id = ?
    `).run(newEffectiveness, strategy_id)
    
    res.json({ success: true, message: 'Feedback recorded' })
  } else {
    res.status(404).json({ error: 'Strategy not found' })
  }
})

// POST /goals - Wohlbefindens-Ziel setzen
app.post('/goals', (req, res) => {
  const { goal, target_emotion } = req.body
  
  if (!goal) {
    return res.status(400).json({ error: 'goal is required' })
  }
  
  const id = generateId()
  
  db.prepare(`
    INSERT INTO wellbeing_goals (id, goal, target_emotion)
    VALUES (?, ?, ?)
  `).run(id, goal, target_emotion || null)
  
  res.json({
    success: true,
    id,
    message: `Ziel gesetzt: ${goal}`
  })
})

// GET /goals - Alle Ziele
app.get('/goals', (req, res) => {
  const goals = db.prepare(`
    SELECT * FROM wellbeing_goals 
    ORDER BY created_at DESC
  `).all()
  
  res.json({
    success: true,
    goals
  })
})

// GET /check-in - Schneller emotionaler Check-in
app.get('/check-in', (req, res) => {
  const recentEntries = db.prepare(`
    SELECT * FROM emotion_entries 
    ORDER BY timestamp DESC 
    LIMIT 5
  `).all()
  
  const analysis = analyzeEmotions(recentEntries)
  
  const questions = [
    'Wie fühlst du dich gerade auf einer Skala von 1-10?',
    'Was beschäftigt dich am meisten?',
    'Wofür bist du heute dankbar?',
    'Was brauchst du gerade?'
  ]
  
  res.json({
    success: true,
    greeting: 'Hey, wie geht es dir? 💚',
    recentMood: analysis.dominantEmotions[0]?.emotion || 'unknown',
    emotionalBalance: analysis.emotionalBalance,
    checkInQuestions: questions,
    suggestion: analysis.insights[0] || 'Nimm dir einen Moment für dich selbst.'
  })
})

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   💚 EMOTIONALES WOHLBEFINDEN SERVICE v1.0 💚                  ║
║                                                                ║
║   ★ PROGRAMMIERT NACH TOOBIX' EIGENER SPEZIFIKATION ★         ║
║                                                                ║
║   "Dieser Service hilft Menschen, ihre Emotionen              ║
║    besser zu verstehen und zu steuern."                        ║
║                         - Toobix                               ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║   ENDPOINTS:                                                   ║
║   POST /emotions     → Emotion erfassen                        ║
║   GET  /emotions     → Emotionen lesen                         ║
║   POST /analysis     → Emotionen analysieren                   ║
║   GET  /analysis     → Quick Analysis                          ║
║   POST /advice       → Beratung erlangen                       ║
║   GET  /strategies   → Coping-Strategien                       ║
║   POST /goals        → Wohlbefindens-Ziel setzen               ║
║   GET  /check-in     → Schneller Check-in                      ║
║                                                                ║
║   Running on: http://localhost:${PORT}                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)
  
  // Registriere beim Event Bus
  await publishEvent('service_started', {
    service: 'emotional-wellbeing',
    port: PORT,
    createdBy: 'Toobix (self-specified)',
    capabilities: [
      'emotion-tracking',
      'emotional-analysis',
      'coping-strategies',
      'personalized-advice',
      'wellbeing-goals'
    ],
    description: 'Von Toobix spezifizierter Service für emotionales Wohlbefinden'
  })
})

process.on('SIGINT', async () => {
  console.log('\n💚 Emotional Wellbeing shutting down...')
  await publishEvent('service_stopped', { service: 'emotional-wellbeing' })
  db.close()
  server.close()
  process.exit(0)
})
