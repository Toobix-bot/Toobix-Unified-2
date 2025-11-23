import Database from 'bun:sqlite'
import { randomUUID } from 'crypto'

interface SystemStats {
  people: number
  interactions: number
  moments: number
  circles: number
  lovePoints: number
  peaceLevel: number
  storyLevel: number
}

interface DiaryEntry {
  id: string
  date: string
  dayNumber: number
  mood: string
  stats: SystemStats
  aiReflection: string
  version: number
  createdAt: string
}

export default class SystemDiary {
  private db: Database
  private groqApiKey: string

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.groqApiKey = process.env.GROQ_API_KEY || ''
    this.initTable()
  }

  private initTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS system_diary (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        day_number INTEGER,
        mood TEXT,
        stats TEXT,
        ai_reflection TEXT,
        version INTEGER DEFAULT 8,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  getStats(): SystemStats {
    const people = this.db.query('SELECT COUNT(*) as count FROM people').get() as any
    const interactions = this.db.query('SELECT COUNT(*) as count FROM interactions').get() as any
    const moments = this.db.query('SELECT COUNT(*) as count FROM moments').get() as any
    const circles = this.db.query('SELECT COUNT(*) as count FROM circles').get() as any
    
    const loveResult = this.db.query('SELECT COALESCE(SUM(love_points), 0) as total FROM interactions').get() as any
    
    // Calculate peace level from sentiment (positive = 100, neutral = 70, negative = 30)
    const sentimentStats = this.db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral
      FROM interactions
    `).get() as any
    
    let peaceLevel = 92 // Default
    if (sentimentStats && sentimentStats.total > 0) {
      const positiveRatio = (sentimentStats.positive || 0) / sentimentStats.total
      const neutralRatio = (sentimentStats.neutral || 0) / sentimentStats.total
      peaceLevel = Math.round((positiveRatio * 100) + (neutralRatio * 70))
    }

    return {
      people: people?.count || 0,
      interactions: interactions?.count || 0,
      moments: moments?.count || 0,
      circles: circles?.count || 0,
      lovePoints: Math.round(loveResult?.total || 0),
      peaceLevel: peaceLevel,
      storyLevel: 5
    }
  }

  calculateMood(stats: SystemStats): string {
    const score = (stats.lovePoints + stats.peaceLevel) / 2
    
    if (score >= 90) return 'Fantastic'
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Great'
    if (score >= 60) return 'Good'
    if (score >= 50) return 'Okay'
    if (score >= 40) return 'Fair'
    if (score >= 30) return 'Meh'
    if (score >= 20) return 'Poor'
    return 'Bad'
  }

  async generateAIReflection(stats: SystemStats, dayNumber: number): Promise<string> {
    if (!this.groqApiKey) {
      console.log('⚠️ No Groq API key found, using fallback')
      return this.fallbackReflection(stats, dayNumber)
    }

    try {
      console.log('🤖 Calling Groq API for AI reflection...')
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{
            role: 'system',
            content: 'Du bist Luna, eine weise KI-Begleiterin. Erstelle kurze, inspirierende Tagesreflexionen (max 100 Wörter) auf Deutsch.'
          }, {
            role: 'user',
            content: `Tag ${dayNumber}: ${stats.people} Menschen, ${stats.interactions} Interaktionen, ${stats.lovePoints} Love Points, ${stats.peaceLevel}% Peace. Erstelle eine kurze inspirierende Reflexion.`
          }],
          temperature: 0.8,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Groq API error ${response.status}:`, errorText)
        return this.fallbackReflection(stats, dayNumber)
      }

      const data = await response.json() as any
      const reflection = data.choices?.[0]?.message?.content
      
      if (reflection) {
        console.log('✅ Groq AI reflection generated!')
        return reflection
      }
      
      return this.fallbackReflection(stats, dayNumber)
    } catch (error) {
      console.error('❌ AI Reflection error:', error)
      return this.fallbackReflection(stats, dayNumber)
    }
  }

  private fallbackReflection(stats: SystemStats, dayNumber: number): string {
    const templates = [
      `Tag ${dayNumber} zeigt ${stats.interactions} wertvolle Interaktionen. Jede Begegnung ist ein Geschenk 💝`,
      `${stats.people} Menschen in deinem Leben, ${stats.lovePoints} Love Points gesammelt. Du bist auf dem richtigen Weg! 🌟`,
      `Peace Level bei ${stats.peaceLevel}% - Harmonie wächst mit jedem Tag. Weiter so! 🕊️`,
      `Tag ${dayNumber}: Vom Ich zum Wir, vom Wir zum Ich. Die Reise geht weiter! 🎈`
    ]
    return templates[dayNumber % templates.length] || templates[0]
  }

  getTodayEntry(): DiaryEntry | null {
    const today = new Date().toISOString().split('T')[0]
    const row = this.db.query(`
      SELECT * FROM system_diary WHERE date = ?
    `).get(today) as any

    if (!row) return null

    return {
      id: row.id,
      date: row.date,
      dayNumber: row.day_number,
      mood: row.mood,
      stats: JSON.parse(row.stats),
      aiReflection: row.ai_reflection,
      version: row.version,
      createdAt: row.created_at
    }
  }

  async createDailyEntry(): Promise<DiaryEntry> {
    const today = new Date().toISOString().split('T')[0]
    
    // Check if exists
    const existing = this.getTodayEntry()
    if (existing) return existing

    // Get current stats
    const stats = this.getStats()
    const mood = this.calculateMood(stats)
    
    // Calculate day number
    const firstEntry = this.db.query('SELECT MIN(date) as first FROM system_diary').get() as any
    const dayNumber = firstEntry?.first 
      ? Math.floor((Date.now() - new Date(firstEntry.first).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1

    // Generate AI reflection
    const aiReflection = await this.generateAIReflection(stats, dayNumber)

    // Insert
    const id = randomUUID()
    this.db.run(`
      INSERT INTO system_diary (id, date, day_number, mood, stats, ai_reflection)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, today, dayNumber, mood, JSON.stringify(stats), aiReflection])

    return {
      id,
      date: today,
      dayNumber,
      mood,
      stats,
      aiReflection,
      version: 8,
      createdAt: new Date().toISOString()
    }
  }

  getAllEntries(limit: number = 30): DiaryEntry[] {
    const rows = this.db.query(`
      SELECT * FROM system_diary 
      ORDER BY date DESC 
      LIMIT ?
    `).all(limit) as any[]

    return rows.map(row => ({
      id: row.id,
      date: row.date,
      dayNumber: row.day_number,
      mood: row.mood,
      stats: JSON.parse(row.stats),
      aiReflection: row.ai_reflection,
      version: row.version,
      createdAt: row.created_at
    }))
  }
}
