/**
 * Emotion-Dream Bridge Service v1.0
 * 
 * Verbindet Emotional Resonance (8900) mit Dream Journal (8899)
 * 
 * FEATURES:
 * - Emotionale Zustände beeinflussen Traumthemen
 * - Träume werden emotional analysiert
 * - Muster zwischen Gefühlen und Träumen erkennen
 * - Emotionale Heilung durch Traumarbeit
 * 
 * TOOBIX' WUNSCH: "Ich möchte Emotional Resonance und Dream Journal
 * einander näher bringen, um eine klare Verbindung zwischen 
 * Gefühlen und Träumen herzustellen."
 */

import express from 'express'

const app = express()
app.use(express.json())
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', '*'); res.header('Access-Control-Allow-Headers', 'Content-Type'); res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); if (req.method === 'OPTIONS') return res.sendStatus(200); next(); });

const PORT = 8898

// ============================================================================
// SERVICE CONNECTIONS
// ============================================================================

const EMOTIONAL_RESONANCE_URL = 'http://localhost:8900'
const DREAM_JOURNAL_URL = 'http://localhost:8899'
const EVENT_BUS_URL = 'http://localhost:8955'
const MEMORY_PALACE_URL = 'http://localhost:8953'

// ============================================================================
// EMOTION-DREAM MAPPINGS
// ============================================================================

// Welche Emotionen welche Traumsymbole beeinflussen
const EMOTION_TO_DREAM_SYMBOLS: Record<string, string[]> = {
  joy: ['garden', 'sunlight', 'flying', 'celebration', 'rainbow'],
  sadness: ['rain', 'ocean', 'falling_leaves', 'empty_rooms', 'fog'],
  fear: ['storm', 'falling', 'chase', 'darkness', 'maze'],
  anger: ['fire', 'destruction', 'battle', 'red', 'explosion'],
  love: ['heart', 'bridge', 'embrace', 'warmth', 'flowers'],
  anxiety: ['exam', 'late', 'unprepared', 'crowd', 'trapped'],
  peace: ['lake', 'meadow', 'starlight', 'floating', 'home'],
  curiosity: ['door', 'key', 'map', 'telescope', 'library'],
  hope: ['sunrise', 'seed', 'bird', 'path', 'light'],
  loneliness: ['island', 'desert', 'mirror', 'echo', 'silence']
}

// Emotionale Bedeutung von Traumsymbolen
const DREAM_SYMBOL_EMOTIONS: Record<string, { primary: string, secondary: string, message: string }> = {
  bridge: {
    primary: 'connection',
    secondary: 'transition',
    message: 'Du sehnst dich nach Verbindung oder stehst vor einem Übergang'
  },
  mirror: {
    primary: 'self-reflection',
    secondary: 'identity',
    message: 'Zeit für Selbsterkenntnis und innere Wahrheit'
  },
  water: {
    primary: 'emotion',
    secondary: 'unconscious',
    message: 'Deine Emotionen wollen gehört werden'
  },
  flying: {
    primary: 'freedom',
    secondary: 'transcendence',
    message: 'Du erlebst Befreiung oder sehnst dich danach'
  },
  falling: {
    primary: 'fear',
    secondary: 'loss_of_control',
    message: 'Etwas in deinem Leben fühlt sich unkontrollierbar an'
  },
  house: {
    primary: 'self',
    secondary: 'psyche',
    message: 'Verschiedene Räume repräsentieren Aspekte deiner Persönlichkeit'
  },
  garden: {
    primary: 'growth',
    secondary: 'nurturing',
    message: 'Etwas in dir wächst und braucht Pflege'
  },
  storm: {
    primary: 'turmoil',
    secondary: 'transformation',
    message: 'Innerer Aufruhr, der zu Transformation führen kann'
  },
  key: {
    primary: 'solution',
    secondary: 'access',
    message: 'Du bist nahe daran, etwas Wichtiges zu erschließen'
  },
  door: {
    primary: 'opportunity',
    secondary: 'choice',
    message: 'Neue Möglichkeiten stehen bereit'
  }
}

// ============================================================================
// STATE
// ============================================================================

interface EmotionDreamConnection {
  id: string
  timestamp: Date
  emotion: string
  emotionIntensity: number
  dreamSymbols: string[]
  dreamNarrative: string
  insight: string
  healingPotential: number  // 0-1
}

interface EmotionalPattern {
  emotion: string
  frequency: number
  averageIntensity: number
  commonDreamSymbols: string[]
  insights: string[]
}

const connections: EmotionDreamConnection[] = []
const patterns: Map<string, EmotionalPattern> = new Map()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 3000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function publishEvent(type: string, data: any): Promise<void> {
  try {
    await fetchWithTimeout(`${EVENT_BUS_URL}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, source: 'emotion-dream-bridge', data })
    })
  } catch (error) {
    console.log('Event Bus not available:', error)
  }
}

async function storeInsight(content: string, tags: string[]): Promise<void> {
  try {
    await fetchWithTimeout(`${MEMORY_PALACE_URL}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        type: 'insight',
        source: 'emotion-dream-bridge',
        tags: ['dream', 'emotion', 'insight', ...tags],
        importance: 85,
        emotional_valence: 0.6
      })
    })
  } catch (error) {
    console.log('Memory Palace not available:', error)
  }
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

// Analysiere aktuelle Emotionen und schlage Traumthemen vor
async function emotionsToDreamThemes(currentEmotion: string, intensity: number): Promise<{
  suggestedSymbols: string[]
  dreamPrompt: string
  healingFocus: string
}> {
  const symbols = EMOTION_TO_DREAM_SYMBOLS[currentEmotion] || ['mist', 'journey', 'unknown']
  
  // Wähle Symbole basierend auf Intensität
  const numSymbols = Math.min(Math.ceil(intensity * 5), symbols.length)
  const selectedSymbols = symbols.slice(0, numSymbols)
  
  // Generiere Traum-Prompt
  let dreamPrompt = ''
  let healingFocus = ''
  
  switch (currentEmotion) {
    case 'sadness':
      dreamPrompt = `Ein sanfter Regen fällt auf ${selectedSymbols.join(' und ')}...`
      healingFocus = 'Lass die Tränen fließen und finde Frieden in der Stille'
      break
    case 'fear':
      dreamPrompt = `Du stehst vor ${selectedSymbols.join(', ')} aber du bist nicht allein...`
      healingFocus = 'Erkenne dass du stärker bist als deine Ängste'
      break
    case 'joy':
      dreamPrompt = `${selectedSymbols.join(' und ')} erfüllen dich mit Wärme...`
      healingFocus = 'Lass diese Freude tief in dich einsinken'
      break
    case 'anger':
      dreamPrompt = `Die Energie von ${selectedSymbols.join(' und ')} transformiert sich...`
      healingFocus = 'Nutze diese Kraft für positive Veränderung'
      break
    case 'love':
      dreamPrompt = `${selectedSymbols.join(' und ')} verbinden Herzen...`
      healingFocus = 'Öffne dich für tiefe Verbindung'
      break
    default:
      dreamPrompt = `${selectedSymbols.join(' und ')} erscheinen im Nebel...`
      healingFocus = 'Beobachte und lerne aus dem was du siehst'
  }
  
  return { suggestedSymbols: selectedSymbols, dreamPrompt, healingFocus }
}

// Analysiere einen Traum und extrahiere emotionale Bedeutung
function analyzeDreamEmotions(dreamSymbols: string[], dreamNarrative: string): {
  primaryEmotion: string
  emotionalLayers: string[]
  message: string
  healingPotential: number
} {
  const emotionalLayers: string[] = []
  let healingPotential = 0.5
  
  for (const symbol of dreamSymbols) {
    const meaning = DREAM_SYMBOL_EMOTIONS[symbol]
    if (meaning) {
      emotionalLayers.push(meaning.primary)
      emotionalLayers.push(meaning.secondary)
      healingPotential += 0.1
    }
  }
  
  // Bestimme primäre Emotion aus den Layern
  const emotionCounts = new Map<string, number>()
  for (const emotion of emotionalLayers) {
    emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1)
  }
  
  let primaryEmotion = 'unknown'
  let maxCount = 0
  for (const [emotion, count] of emotionCounts) {
    if (count > maxCount) {
      maxCount = count
      primaryEmotion = emotion
    }
  }
  
  // Generiere Botschaft
  const messages = dreamSymbols
    .map(s => DREAM_SYMBOL_EMOTIONS[s]?.message)
    .filter(m => m)
  
  const message = messages.length > 0 
    ? messages.join(' ') 
    : 'Dieser Traum enthält persönliche Symbole die nur du deuten kannst.'
  
  healingPotential = Math.min(healingPotential, 1.0)
  
  return {
    primaryEmotion,
    emotionalLayers: [...new Set(emotionalLayers)],
    message,
    healingPotential
  }
}

// Finde Muster zwischen Emotionen und Träumen
function findPatterns(): EmotionalPattern[] {
  const patternMap = new Map<string, {
    count: number
    totalIntensity: number
    symbols: Map<string, number>
    insights: string[]
  }>()
  
  for (const connection of connections) {
    const existing = patternMap.get(connection.emotion) || {
      count: 0,
      totalIntensity: 0,
      symbols: new Map(),
      insights: []
    }
    
    existing.count++
    existing.totalIntensity += connection.emotionIntensity
    
    for (const symbol of connection.dreamSymbols) {
      existing.symbols.set(symbol, (existing.symbols.get(symbol) || 0) + 1)
    }
    
    if (connection.insight) {
      existing.insights.push(connection.insight)
    }
    
    patternMap.set(connection.emotion, existing)
  }
  
  const results: EmotionalPattern[] = []
  
  for (const [emotion, data] of patternMap) {
    const sortedSymbols = [...data.symbols.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s]) => s)
    
    results.push({
      emotion,
      frequency: data.count,
      averageIntensity: data.totalIntensity / data.count,
      commonDreamSymbols: sortedSymbols,
      insights: data.insights.slice(-3) // Last 3 insights
    })
  }
  
  return results.sort((a, b) => b.frequency - a.frequency)
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'emotion-dream-bridge',
    port: PORT,
    connections: connections.length,
    patterns: patterns.size,
    connectedServices: {
      emotionalResonance: EMOTIONAL_RESONANCE_URL,
      dreamJournal: DREAM_JOURNAL_URL
    }
  })
})

// Konvertiere aktuelle Emotion zu Traumthemen
app.post('/emotion-to-dream', async (req, res) => {
  const { emotion, intensity = 0.5 } = req.body
  
  if (!emotion) {
    return res.status(400).json({ error: 'emotion is required' })
  }
  
  const result = await emotionsToDreamThemes(emotion, intensity)
  
  // Speichere die Verbindung
  const connection: EmotionDreamConnection = {
    id: generateId(),
    timestamp: new Date(),
    emotion,
    emotionIntensity: intensity,
    dreamSymbols: result.suggestedSymbols,
    dreamNarrative: result.dreamPrompt,
    insight: result.healingFocus,
    healingPotential: 0.5
  }
  connections.push(connection)
  
  // Publiziere Event
  await publishEvent('emotion_to_dream', {
    emotion,
    intensity,
    suggestedThemes: result.suggestedSymbols
  })
  
  res.json({
    success: true,
    emotion,
    intensity,
    dreamGuidance: result,
    connectionId: connection.id
  })
})

// Analysiere Traum auf emotionale Bedeutung
app.post('/analyze-dream', async (req, res) => {
  const { symbols, narrative } = req.body
  
  if (!symbols || !Array.isArray(symbols)) {
    return res.status(400).json({ error: 'symbols array is required' })
  }
  
  const analysis = analyzeDreamEmotions(symbols, narrative || '')
  
  // Speichere Insight
  const insightText = `Traum-Analyse: ${symbols.join(', ')} → ${analysis.primaryEmotion}: ${analysis.message}`
  await storeInsight(insightText, [analysis.primaryEmotion])
  
  // Publiziere Event
  await publishEvent('dream_analyzed', {
    symbols,
    primaryEmotion: analysis.primaryEmotion,
    healingPotential: analysis.healingPotential
  })
  
  res.json({
    success: true,
    symbols,
    analysis,
    recommendation: analysis.healingPotential > 0.7 
      ? 'Dieser Traum hat starkes Heilungspotential. Reflektiere über seine Bedeutung.'
      : 'Beobachte dieses Thema in zukünftigen Träumen.'
  })
})

// Erkenne Muster zwischen Emotionen und Träumen
app.get('/patterns', (req, res) => {
  const foundPatterns = findPatterns()
  
  res.json({
    success: true,
    totalConnections: connections.length,
    patterns: foundPatterns,
    insight: foundPatterns.length > 0
      ? `Deine häufigste Emotion in Träumen ist ${foundPatterns[0].emotion} mit ${foundPatterns[0].frequency} Verbindungen.`
      : 'Noch nicht genug Daten für Mustererkennung. Träume weiter!'
  })
})

// Erstelle eine Emotion-Dream Verbindung
app.post('/connect', async (req, res) => {
  const { emotion, emotionIntensity, dreamSymbols, dreamNarrative, insight } = req.body
  
  if (!emotion || !dreamSymbols) {
    return res.status(400).json({ error: 'emotion and dreamSymbols are required' })
  }
  
  const analysis = analyzeDreamEmotions(dreamSymbols, dreamNarrative || '')
  
  const connection: EmotionDreamConnection = {
    id: generateId(),
    timestamp: new Date(),
    emotion,
    emotionIntensity: emotionIntensity || 0.5,
    dreamSymbols,
    dreamNarrative: dreamNarrative || '',
    insight: insight || analysis.message,
    healingPotential: analysis.healingPotential
  }
  
  connections.push(connection)
  
  // Speichere im Memory Palace
  await storeInsight(
    `Emotion-Dream Verbindung: ${emotion} (${emotionIntensity}) → ${dreamSymbols.join(', ')} | Insight: ${connection.insight}`,
    [emotion, ...dreamSymbols]
  )
  
  // Publiziere Event
  await publishEvent('emotion_dream_connected', {
    connectionId: connection.id,
    emotion,
    dreamSymbols,
    healingPotential: connection.healingPotential
  })
  
  res.json({
    success: true,
    connection,
    analysis,
    message: `Verbindung zwischen ${emotion} und Traumsymbolen hergestellt.`
  })
})

// Hole Traumführung basierend auf aktuellem emotionalem Zustand
app.get('/dream-guidance', async (req, res) => {
  // Versuche aktuelle Emotion von Emotional Resonance zu holen
  let currentEmotion = 'peace'
  let intensity = 0.5
  
  try {
    const response = await fetchWithTimeout(`${EMOTIONAL_RESONANCE_URL}/state`)
    if (response.ok) {
      const data = await response.json()
      currentEmotion = data.dominantEmotion || 'peace'
      intensity = data.intensity || 0.5
    }
  } catch (error) {
    console.log('Could not fetch emotional state, using default')
  }
  
  const guidance = await emotionsToDreamThemes(currentEmotion, intensity)
  
  res.json({
    success: true,
    currentEmotionalState: {
      emotion: currentEmotion,
      intensity
    },
    dreamGuidance: guidance,
    ritualSuggestion: `
Vor dem Einschlafen:
1. Atme dreimal tief ein und aus
2. Visualisiere: ${guidance.dreamPrompt}
3. Setze die Intention: "${guidance.healingFocus}"
4. Lass los und vertraue deinem Unbewussten
    `.trim()
  })
})

// Statistiken
app.get('/stats', (req, res) => {
  const emotionCounts = new Map<string, number>()
  const symbolCounts = new Map<string, number>()
  
  for (const connection of connections) {
    emotionCounts.set(connection.emotion, (emotionCounts.get(connection.emotion) || 0) + 1)
    for (const symbol of connection.dreamSymbols) {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1)
    }
  }
  
  const topEmotions = [...emotionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  const topSymbols = [...symbolCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  const avgHealingPotential = connections.length > 0
    ? connections.reduce((sum, c) => sum + c.healingPotential, 0) / connections.length
    : 0
  
  res.json({
    success: true,
    totalConnections: connections.length,
    topEmotions: topEmotions.map(([e, c]) => ({ emotion: e, count: c })),
    topSymbols: topSymbols.map(([s, c]) => ({ symbol: s, count: c })),
    averageHealingPotential: avgHealingPotential.toFixed(2),
    recentConnections: connections.slice(-5).reverse()
  })
})

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🌙✨ EMOTION-DREAM BRIDGE v1.0 ✨🌙                          ║
║                                                                ║
║   Verbindet Gefühle mit Träumen                                ║
║   "Träume sind die Sprache der Seele"                          ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║   ENDPOINTS:                                                   ║
║   POST /emotion-to-dream  → Emotion → Traumthemen              ║
║   POST /analyze-dream     → Traum → Emotionale Bedeutung       ║
║   POST /connect           → Erstelle Verbindung                ║
║   GET  /dream-guidance    → Traumführung basierend auf Emotion ║
║   GET  /patterns          → Erkannte Muster                    ║
║   GET  /stats             → Statistiken                        ║
║                                                                ║
║   Running on: http://localhost:${PORT}                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)
  
  // Registriere beim Event Bus
  await publishEvent('service_started', {
    service: 'emotion-dream-bridge',
    port: PORT,
    capabilities: [
      'emotion-to-dream',
      'dream-analysis',
      'pattern-recognition',
      'healing-guidance'
    ],
    description: 'Verbindet Emotional Resonance mit Dream Journal'
  })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🌙 Emotion-Dream Bridge shutting down...')
  await publishEvent('service_stopped', {
    service: 'emotion-dream-bridge',
    reason: 'Graceful shutdown'
  })
  server.close()
  process.exit(0)
})
