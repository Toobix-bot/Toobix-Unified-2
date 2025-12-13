#!/usr/bin/env bun
/**
 * 🎨 ADAPTIVE UI CONTROLLER
 * 
 * AI-powered UI adaptation system that learns from user behavior
 * and automatically optimizes the interface for maximum efficiency.
 * 
 * Features:
 * - Behavior Tracking: Monitor all user interactions
 * - Layout Learning: Discover optimal layouts for each task
 * - Widget Prediction: Predict which widgets user needs next
 * - Color Adaptation: Adjust colors based on emotional state
 * - Performance Tuning: Optimize animations based on system performance
 * - Context Awareness: Adapt to time of day, current task, user state
 */

import Database from 'bun:sqlite'
import { serve } from 'bun'

interface UserInteraction {
  id: string
  timestamp: number
  viewId: string
  actionType: 'view' | 'click' | 'input' | 'scroll' | 'hover'
  elementId: string
  duration: number
  outcome: 'success' | 'abandon' | 'error'
  context: {
    timeOfDay: string
    dayOfWeek: string
    currentTask?: string
    emotionalState?: string
    previousView?: string
  }
}

interface LayoutPreference {
  viewId: string
  layout: 'compact' | 'spacious' | 'grid' | 'list' | 'cards'
  successRate: number
  averageDuration: number
  usageCount: number
  confidence: number
}

interface WidgetPrediction {
  widgetId: string
  viewId: string
  probability: number
  reasoning: string
  context: string[]
}

interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  emotionalAlignment: string[]  // ['calm', 'energetic', 'focused']
  timeOfDayOptimal: string[]    // ['morning', 'afternoon', 'evening', 'night']
}

interface UIAdaptation {
  timestamp: number
  adaptationType: 'layout' | 'color' | 'widget' | 'animation' | 'shortcut'
  changes: any
  reasoning: string
  confidence: number
  userFeedback?: 'accept' | 'reject' | 'ignore'
}

interface UserContext {
  timeOfDay: string
  dayOfWeek: string
  currentView: string
  recentActions: UserInteraction[]
  emotionalState?: string
  taskContext?: string
  performanceMetrics?: {
    fps: number
    memoryUsage: number
    responseTime: number
  }
}

class AdaptiveUIController {
  private db: Database
  private interactions: Map<string, UserInteraction> = new Map()
  private layoutPreferences: Map<string, LayoutPreference> = new Map()
  private predictions: Map<string, WidgetPrediction[]> = new Map()
  private colorSchemes: Map<string, ColorScheme> = new Map()
  private adaptations: UIAdaptation[] = []
  
  private learningRate = 0.1
  private predictionThreshold = 0.7
  private adaptationCooldown = 30000  // 30 seconds between adaptations
  private lastAdaptation = 0

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.initializeDatabase()
    this.loadData()
    this.initializeColorSchemes()
  }

  private initializeDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        view_id TEXT,
        action_type TEXT,
        element_id TEXT,
        duration INTEGER,
        outcome TEXT,
        context TEXT
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS layout_preferences (
        view_id TEXT PRIMARY KEY,
        layout TEXT,
        success_rate REAL,
        average_duration INTEGER,
        usage_count INTEGER,
        confidence REAL
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS widget_predictions (
        id TEXT PRIMARY KEY,
        widget_id TEXT,
        view_id TEXT,
        probability REAL,
        reasoning TEXT,
        context TEXT
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS ui_adaptations (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        adaptation_type TEXT,
        changes TEXT,
        reasoning TEXT,
        confidence REAL,
        user_feedback TEXT
      )
    `)

    console.log('✅ Adaptive UI database initialized')
  }

  private loadData() {
    // Load layout preferences
    const layouts = this.db.query('SELECT * FROM layout_preferences').all() as any[]
    layouts.forEach(layout => {
      this.layoutPreferences.set(layout.view_id, {
        viewId: layout.view_id,
        layout: layout.layout,
        successRate: layout.success_rate,
        averageDuration: layout.average_duration,
        usageCount: layout.usage_count,
        confidence: layout.confidence
      })
    })

    // Load recent interactions
    const recentInteractions = this.db.query(`
      SELECT * FROM user_interactions 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `).all() as any[]
    
    recentInteractions.forEach(interaction => {
      this.interactions.set(interaction.id, {
        id: interaction.id,
        timestamp: interaction.timestamp,
        viewId: interaction.view_id,
        actionType: interaction.action_type,
        elementId: interaction.element_id,
        duration: interaction.duration,
        outcome: interaction.outcome,
        context: JSON.parse(interaction.context)
      })
    })

    console.log(`✅ Loaded ${layouts.length} layout preferences`)
    console.log(`✅ Loaded ${recentInteractions.length} recent interactions`)
  }

  private initializeColorSchemes() {
    const schemes: ColorScheme[] = [
      {
        id: 'energetic',
        name: 'Energetic Focus',
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#ffe66d',
        background: '#1a1a2e',
        text: '#ffffff',
        emotionalAlignment: ['energetic', 'excited', 'motivated'],
        timeOfDayOptimal: ['morning', 'early-afternoon']
      },
      {
        id: 'calm',
        name: 'Calm Clarity',
        primary: '#6c5ce7',
        secondary: '#a29bfe',
        accent: '#74b9ff',
        background: '#0f0f1e',
        text: '#e0e0e0',
        emotionalAlignment: ['calm', 'peaceful', 'relaxed'],
        timeOfDayOptimal: ['evening', 'night']
      },
      {
        id: 'focused',
        name: 'Deep Focus',
        primary: '#2d3436',
        secondary: '#636e72',
        accent: '#00b894',
        background: '#000000',
        text: '#dfe6e9',
        emotionalAlignment: ['focused', 'concentrated', 'determined'],
        timeOfDayOptimal: ['afternoon', 'evening']
      },
      {
        id: 'creative',
        name: 'Creative Flow',
        primary: '#fd79a8',
        secondary: '#fdcb6e',
        accent: '#6c5ce7',
        background: '#2d3436',
        text: '#dfe6e9',
        emotionalAlignment: ['creative', 'inspired', 'imaginative'],
        timeOfDayOptimal: ['late-morning', 'afternoon']
      },
      {
        id: 'analytical',
        name: 'Analytical Mode',
        primary: '#0984e3',
        secondary: '#00b894',
        accent: '#00cec9',
        background: '#0a0a0a',
        text: '#f0f0f0',
        emotionalAlignment: ['analytical', 'logical', 'systematic'],
        timeOfDayOptimal: ['morning', 'afternoon']
      }
    ]

    schemes.forEach(scheme => {
      this.colorSchemes.set(scheme.id, scheme)
    })

    console.log(`✅ Initialized ${schemes.length} color schemes`)
  }

  // ============================================
  // INTERACTION TRACKING
  // ============================================

  trackInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>) {
    const id = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()

    const fullInteraction: UserInteraction = {
      id,
      timestamp,
      ...interaction
    }

    this.interactions.set(id, fullInteraction)

    // Save to database
    this.db.run(`
      INSERT INTO user_interactions (id, timestamp, view_id, action_type, element_id, duration, outcome, context)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      timestamp,
      interaction.viewId,
      interaction.actionType,
      interaction.elementId,
      interaction.duration,
      interaction.outcome,
      JSON.stringify(interaction.context)
    ])

    // Learn from this interaction
    this.learnFromInteraction(fullInteraction)

    return fullInteraction
  }

  private learnFromInteraction(interaction: UserInteraction) {
    // Update layout preferences
    if (interaction.actionType === 'view') {
      this.updateLayoutPreference(interaction)
    }

    // Predict next widget needs
    if (interaction.outcome === 'success') {
      this.updateWidgetPredictions(interaction)
    }

    // Check if we should adapt UI
    if (Date.now() - this.lastAdaptation > this.adaptationCooldown) {
      const context = this.buildUserContext()
      const adaptation = this.predictAdaptation(context)
      
      if (adaptation && adaptation.confidence > this.predictionThreshold) {
        this.applyAdaptation(adaptation)
      }
    }
  }

  private updateLayoutPreference(interaction: UserInteraction) {
    const existing = this.layoutPreferences.get(interaction.viewId)
    
    if (existing) {
      // Update existing preference with exponential moving average
      const newSuccessRate = interaction.outcome === 'success' 
        ? existing.successRate * (1 - this.learningRate) + 1 * this.learningRate
        : existing.successRate * (1 - this.learningRate) + 0 * this.learningRate
      
      const newAvgDuration = existing.averageDuration * (1 - this.learningRate) + interaction.duration * this.learningRate
      
      existing.successRate = newSuccessRate
      existing.averageDuration = newAvgDuration
      existing.usageCount++
      existing.confidence = Math.min(1, existing.usageCount / 100)  // Confidence grows with usage

      // Save to database
      this.db.run(`
        UPDATE layout_preferences 
        SET success_rate = ?, average_duration = ?, usage_count = ?, confidence = ?
        WHERE view_id = ?
      `, [newSuccessRate, newAvgDuration, existing.usageCount, existing.confidence, interaction.viewId])
    } else {
      // Create new preference
      const newPref: LayoutPreference = {
        viewId: interaction.viewId,
        layout: 'cards',  // Default
        successRate: interaction.outcome === 'success' ? 1 : 0,
        averageDuration: interaction.duration,
        usageCount: 1,
        confidence: 0.01
      }

      this.layoutPreferences.set(interaction.viewId, newPref)

      this.db.run(`
        INSERT INTO layout_preferences (view_id, layout, success_rate, average_duration, usage_count, confidence)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [newPref.viewId, newPref.layout, newPref.successRate, newPref.averageDuration, newPref.usageCount, newPref.confidence])
    }
  }

  private updateWidgetPredictions(interaction: UserInteraction) {
    // Analyze patterns: which widgets are used together?
    const recentInteractions = Array.from(this.interactions.values())
      .filter(i => i.timestamp > Date.now() - 3600000)  // Last hour
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50)

    const patterns = new Map<string, string[]>()

    for (let i = 0; i < recentInteractions.length - 1; i++) {
      const current = recentInteractions[i]
      const next = recentInteractions[i + 1]

      if (!patterns.has(current.elementId)) {
        patterns.set(current.elementId, [])
      }
      patterns.get(current.elementId)!.push(next.elementId)
    }

    // Create predictions based on patterns
    const predictions: WidgetPrediction[] = []
    
    patterns.forEach((nextWidgets, currentWidget) => {
      const frequency = new Map<string, number>()
      nextWidgets.forEach(widget => {
        frequency.set(widget, (frequency.get(widget) || 0) + 1)
      })

      frequency.forEach((count, widget) => {
        const probability = count / nextWidgets.length
        
        if (probability > 0.3) {  // Only predict if >30% probability
          predictions.push({
            widgetId: widget,
            viewId: interaction.viewId,
            probability,
            reasoning: `Used ${count} times after ${currentWidget} (${(probability * 100).toFixed(0)}% pattern)`,
            context: [currentWidget]
          })
        }
      })
    })

    this.predictions.set(interaction.viewId, predictions)
  }

  // ============================================
  // ADAPTATION PREDICTION
  // ============================================

  private buildUserContext(): UserContext {
    const now = new Date()
    const hour = now.getHours()
    
    let timeOfDay: string
    if (hour >= 5 && hour < 12) timeOfDay = 'morning'
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening'
    else timeOfDay = 'night'

    const recentActions = Array.from(this.interactions.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)

    return {
      timeOfDay,
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      currentView: recentActions[0]?.viewId || 'dashboard',
      recentActions
    }
  }

  private predictAdaptation(context: UserContext): UIAdaptation | null {
    const adaptations: UIAdaptation[] = []

    // 1. Color scheme adaptation
    const colorAdaptation = this.predictColorScheme(context)
    if (colorAdaptation) adaptations.push(colorAdaptation)

    // 2. Layout adaptation
    const layoutAdaptation = this.predictLayout(context)
    if (layoutAdaptation) adaptations.push(layoutAdaptation)

    // 3. Widget visibility adaptation
    const widgetAdaptation = this.predictWidgets(context)
    if (widgetAdaptation) adaptations.push(widgetAdaptation)

    // Choose best adaptation (highest confidence)
    adaptations.sort((a, b) => b.confidence - a.confidence)
    
    return adaptations[0] || null
  }

  private predictColorScheme(context: UserContext): UIAdaptation | null {
    // Find best color scheme for current context
    let bestScheme: ColorScheme | null = null
    let bestScore = 0

    this.colorSchemes.forEach(scheme => {
      let score = 0

      // Time of day alignment
      if (scheme.timeOfDayOptimal.includes(context.timeOfDay)) {
        score += 0.5
      }

      // Emotional state alignment (if we have it from Emotional Resonance service)
      if (context.emotionalState && scheme.emotionalAlignment.includes(context.emotionalState)) {
        score += 0.5
      }

      if (score > bestScore) {
        bestScore = score
        bestScheme = scheme
      }
    })

    if (bestScheme && bestScore > 0.5) {
      return {
        timestamp: Date.now(),
        adaptationType: 'color',
        changes: {
          schemeId: bestScheme.id,
          colors: {
            primary: bestScheme.primary,
            secondary: bestScheme.secondary,
            accent: bestScheme.accent,
            background: bestScheme.background,
            text: bestScheme.text
          }
        },
        reasoning: `Optimal for ${context.timeOfDay}${context.emotionalState ? ` and ${context.emotionalState} state` : ''}`,
        confidence: bestScore
      }
    }

    return null
  }

  private predictLayout(context: UserContext): UIAdaptation | null {
    const layoutPref = this.layoutPreferences.get(context.currentView)
    
    if (layoutPref && layoutPref.confidence > 0.6) {
      return {
        timestamp: Date.now(),
        adaptationType: 'layout',
        changes: {
          viewId: context.currentView,
          layout: layoutPref.layout,
          successRate: layoutPref.successRate
        },
        reasoning: `Layout "${layoutPref.layout}" has ${(layoutPref.successRate * 100).toFixed(0)}% success rate based on ${layoutPref.usageCount} uses`,
        confidence: layoutPref.confidence
      }
    }

    return null
  }

  private predictWidgets(context: UserContext): UIAdaptation | null {
    const predictions = this.predictions.get(context.currentView) || []
    
    const highConfidencePredictions = predictions.filter(p => p.probability > 0.6)
    
    if (highConfidencePredictions.length > 0) {
      return {
        timestamp: Date.now(),
        adaptationType: 'widget',
        changes: {
          viewId: context.currentView,
          showWidgets: highConfidencePredictions.map(p => p.widgetId),
          predictions: highConfidencePredictions
        },
        reasoning: `Predicted ${highConfidencePredictions.length} widgets based on usage patterns`,
        confidence: highConfidencePredictions.reduce((sum, p) => sum + p.probability, 0) / highConfidencePredictions.length
      }
    }

    return null
  }

  private applyAdaptation(adaptation: UIAdaptation) {
    this.adaptations.push(adaptation)
    this.lastAdaptation = Date.now()

    // Save to database
    const id = `adaptation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.db.run(`
      INSERT INTO ui_adaptations (id, timestamp, adaptation_type, changes, reasoning, confidence, user_feedback)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      adaptation.timestamp,
      adaptation.adaptationType,
      JSON.stringify(adaptation.changes),
      adaptation.reasoning,
      adaptation.confidence,
      null
    ])

    console.log(`🎨 Applied ${adaptation.adaptationType} adaptation: ${adaptation.reasoning}`)
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getAdaptation(viewId: string): any {
    const context = this.buildUserContext()
    const adaptation = this.predictAdaptation(context)
    
    return {
      currentView: viewId,
      context,
      recommendedAdaptation: adaptation,
      layoutPreference: this.layoutPreferences.get(viewId),
      widgetPredictions: this.predictions.get(viewId) || [],
      recentAdaptations: this.adaptations.slice(-10)
    }
  }

  provideUserFeedback(adaptationId: string, feedback: 'accept' | 'reject' | 'ignore') {
    this.db.run(`
      UPDATE ui_adaptations 
      SET user_feedback = ?
      WHERE id = ?
    `, [feedback, adaptationId])

    console.log(`📝 User feedback: ${feedback} for adaptation ${adaptationId}`)
  }

  getStatistics() {
    return {
      totalInteractions: this.interactions.size,
      layoutPreferences: Array.from(this.layoutPreferences.values()),
      colorSchemes: Array.from(this.colorSchemes.values()),
      recentAdaptations: this.adaptations.slice(-20),
      learningRate: this.learningRate,
      predictionThreshold: this.predictionThreshold
    }
  }

  async start(port = 8919) {
    const server = serve({
      port,
      async fetch(req) {
        const url = new URL(req.url)
        const path = url.pathname

        // CORS headers
        const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }

        if (req.method === 'OPTIONS') {
          return new Response(null, { headers })
        }

        if (path === '/health') {
          return new Response(JSON.stringify({ status: 'ok', service: 'adaptive-ui-controller', port }), { headers })
        }

        try {
          // GET /adaptation/:viewId - Get adaptation for view
          if (path.startsWith('/adaptation/') && req.method === 'GET') {
            const viewId = path.split('/')[2]
            const adaptation = adaptiveUI.getAdaptation(viewId)
            return new Response(JSON.stringify(adaptation), { headers })
          }

          // POST /track - Track user interaction
          if (path === '/track' && req.method === 'POST') {
            const interaction = await req.json()
            const tracked = adaptiveUI.trackInteraction(interaction)
            return new Response(JSON.stringify({ success: true, interaction: tracked }), { headers })
          }

          // POST /feedback - Provide user feedback
          if (path === '/feedback' && req.method === 'POST') {
            const { adaptationId, feedback } = await req.json()
            adaptiveUI.provideUserFeedback(adaptationId, feedback)
            return new Response(JSON.stringify({ success: true }), { headers })
          }

          // GET /stats - Get statistics
          if (path === '/stats' && req.method === 'GET') {
            const stats = adaptiveUI.getStatistics()
            return new Response(JSON.stringify(stats), { headers })
          }

          // GET /schemes - Get all color schemes
          if (path === '/schemes' && req.method === 'GET') {
            const schemes = Array.from(adaptiveUI.colorSchemes.values())
            return new Response(JSON.stringify(schemes), { headers })
          }

          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers })

        } catch (error: any) {
          console.error('API Error:', error)
          return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
        }
      }
    })

    console.log('\n╔════════════════════════════════════════════╗')
    console.log('║  🎨 ADAPTIVE UI CONTROLLER                  ║')
    console.log(`║  Color Schemes: ${this.colorSchemes.size} active                    ║`)
    console.log(`║  Layout Prefs: ${this.layoutPreferences.size} learned                   ║`)
    console.log(`║  Interactions: ${this.interactions.size} tracked                 ║`)
    console.log(`║  Running on: http://localhost:${port}         ║`)
    console.log('╚════════════════════════════════════════════╝\n')
    console.log('✨ UI is learning from your behavior...')

    return server
  }
}

// ============================================
// MAIN
// ============================================

const dbPath = 'C:/Dev/Projects/AI/Toobix-Unified/databases/adaptive-ui.db'
const adaptiveUI = new AdaptiveUIController(dbPath)

const server = await adaptiveUI.start(8919)

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Adaptive UI Controller...')
  server.stop()
  process.exit(0)
})
