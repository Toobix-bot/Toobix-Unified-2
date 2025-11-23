/**
 * 🕊️ Peace Catalyst - 5 Agents for Inner Peace
 */

import { Database } from 'bun:sqlite'
import { nanoid } from 'nanoid'

export interface PeaceState {
  overall: number
  calm: number
  harmony: number
  clarity: number
  growth: number
  purpose: number
}

export interface PeaceAction {
  id: string
  timestamp: number
  agent: 'calm' | 'harmony' | 'clarity' | 'growth' | 'purpose'
  action: string
  details: string
  impact: number
}

export interface Conflict {
  id: string
  timestamp: number
  description: string
  personId?: string
  severity: number
  resolved: boolean
  resolvedAt?: number
  resolutionNotes?: string
}

export class PeaceCatalystService {
  private db: Database
  public calmAgent: CalmAgent
  public harmonyAgent: HarmonyAgent
  public clarityAgent: ClarityAgent
  public growthAgent: GrowthAgent
  public purposeAgent: PurposeAgent

  constructor(db: Database) {
    this.db = db
    this.initializeTables()
    
    this.calmAgent = new CalmAgent(db)
    this.harmonyAgent = new HarmonyAgent(db)
    this.clarityAgent = new ClarityAgent(db)
    this.growthAgent = new GrowthAgent(db)
    this.purposeAgent = new PurposeAgent(db)
  }

  private initializeTables() {
    // Peace actions
    this.db.run(`
      CREATE TABLE IF NOT EXISTS peace_actions (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        agent TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        impact INTEGER NOT NULL
      )
    `)

    // Conflicts
    this.db.run(`
      CREATE TABLE IF NOT EXISTS peace_conflicts (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        description TEXT NOT NULL,
        person_id TEXT,
        severity INTEGER NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0,
        resolved_at INTEGER,
        resolution_notes TEXT
      )
    `)

    console.log('✅ Peace Catalyst tables initialized')
  }

  /**
   * Get overall peace state
   */
  getPeaceState(): PeaceState {
    const calm = this.calmAgent.getScore()
    const harmony = this.harmonyAgent.getScore()
    const clarity = this.clarityAgent.getScore()
    const growth = this.growthAgent.getScore()
    const purpose = this.purposeAgent.getScore()
    
    const overall = Math.round((calm + harmony + clarity + growth + purpose) / 5)

    return { overall, calm, harmony, clarity, growth, purpose }
  }

  /**
   * Get recent actions
   */
  getRecentActions(limit: number = 50): PeaceAction[] {
    const rows = this.db.query(`
      SELECT id, timestamp, agent, action, details, impact
      FROM peace_actions
      ORDER BY timestamp DESC
      LIMIT ?
    `, [limit]).all() as any[]

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      agent: row.agent,
      action: row.action,
      details: row.details,
      impact: row.impact
    }))
  }

  /**
   * Get unresolved conflicts
   */
  getUnresolvedConflicts(): Conflict[] {
    const rows = this.db.query(`
      SELECT id, timestamp, description, person_id, severity
      FROM peace_conflicts
      WHERE resolved = 0
      ORDER BY timestamp DESC
    `).all() as any[]

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      description: row.description,
      personId: row.person_id,
      severity: row.severity,
      resolved: false
    }))
  }
}

// 🧘 Calm Agent - Stress Relief
class CalmAgent {
  constructor(private db: Database) {}

  meditate(duration: number) {
    const impact = Math.min(10, Math.round(duration / 2))
    this.logAction('meditation', `${duration} minutes`, impact)
    return { success: true, duration, impact }
  }

  breathingExercise() {
    this.logAction('breathing', '4-7-8 technique', 5)
    return { success: true, impact: 5 }
  }

  getScore(): number {
    const actions = this.db.query(`
      SELECT COALESCE(SUM(impact), 0) as total
      FROM peace_actions
      WHERE agent = 'calm' AND timestamp > ?
    `, [Date.now() - 7 * 24 * 60 * 60 * 1000]).get() as any
    return Math.min(100, actions.total)
  }

  private logAction(action: string, details: string, impact: number) {
    this.db.run(`
      INSERT INTO peace_actions (id, timestamp, agent, action, details, impact)
      VALUES (?, ?, 'calm', ?, ?, ?)
    `, [nanoid(10), Date.now(), action, details, impact])
  }
}

// 🤝 Harmony Agent - Conflict Resolution
class HarmonyAgent {
  constructor(private db: Database) {}

  logConflict(description: string, personId?: string, severity: number = 5) {
    const id = `conf_${nanoid(10)}`
    this.db.run(`
      INSERT INTO peace_conflicts (id, timestamp, description, person_id, severity)
      VALUES (?, ?, ?, ?, ?)
    `, [id, Date.now(), description, personId || null, severity])
    
    this.logAction('conflict_logged', description, -severity)
    return { id, severity }
  }

  resolveConflict(conflictId: string, resolutionNotes: string) {
    const conflict = this.db.query(
      'SELECT severity FROM peace_conflicts WHERE id = ?',
      [conflictId]
    ).get() as any

    if (!conflict) throw new Error('Conflict not found')

    this.db.run(`
      UPDATE peace_conflicts
      SET resolved = 1, resolved_at = ?, resolution_notes = ?
      WHERE id = ?
    `, [Date.now(), resolutionNotes, conflictId])

    this.logAction('conflict_resolved', resolutionNotes, conflict.severity * 2)
    return { success: true, impact: conflict.severity * 2 }
  }

  getScore(): number {
    const resolved = this.db.query(`
      SELECT COUNT(*) as count FROM peace_conflicts WHERE resolved = 1
    `).get() as any

    const unresolved = this.db.query(`
      SELECT COUNT(*) as count FROM peace_conflicts WHERE resolved = 0
    `).get() as any

    const base = 50
    const bonus = Math.min(40, resolved.count * 5)
    const penalty = Math.min(40, unresolved.count * 10)

    return Math.max(0, Math.min(100, base + bonus - penalty))
  }

  private logAction(action: string, details: string, impact: number) {
    this.db.run(`
      INSERT INTO peace_actions (id, timestamp, agent, action, details, impact)
      VALUES (?, ?, 'harmony', ?, ?, ?)
    `, [nanoid(10), Date.now(), action, details, impact])
  }
}

// 💭 Clarity Agent - Mental Clarity
class ClarityAgent {
  constructor(private db: Database) {}

  journal(entry: string, wordCount: number) {
    const impact = Math.min(10, Math.round(wordCount / 100))
    this.logAction('journal', `${wordCount} words`, impact)
    return { success: true, wordCount, impact }
  }

  getScore(): number {
    const actions = this.db.query(`
      SELECT COALESCE(SUM(impact), 0) as total
      FROM peace_actions
      WHERE agent = 'clarity' AND timestamp > ?
    `, [Date.now() - 7 * 24 * 60 * 60 * 1000]).get() as any
    return Math.min(100, actions.total)
  }

  private logAction(action: string, details: string, impact: number) {
    this.db.run(`
      INSERT INTO peace_actions (id, timestamp, agent, action, details, impact)
      VALUES (?, ?, 'clarity', ?, ?, ?)
    `, [nanoid(10), Date.now(), action, details, impact])
  }
}

// 🌱 Growth Agent - Personal Growth
class GrowthAgent {
  constructor(private db: Database) {}

  learnSkill(skill: string, hoursSpent: number) {
    const impact = Math.min(10, Math.round(hoursSpent * 2))
    this.logAction('skill_learning', `${skill} (${hoursSpent}h)`, impact)
    return { success: true, skill, hoursSpent, impact }
  }

  milestone(title: string, category: string, description: string, impact: number = 10) {
    this.logAction('milestone', `${title}: ${description}`, impact)
    return { success: true, title, category, impact }
  }

  getScore(): number {
    const actions = this.db.query(`
      SELECT COALESCE(SUM(impact), 0) as total
      FROM peace_actions
      WHERE agent = 'growth' AND timestamp > ?
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]).get() as any
    return Math.min(100, Math.round(actions.total / 2))
  }

  private logAction(action: string, details: string, impact: number) {
    this.db.run(`
      INSERT INTO peace_actions (id, timestamp, agent, action, details, impact)
      VALUES (?, ?, 'growth', ?, ?, ?)
    `, [nanoid(10), Date.now(), action, details, impact])
  }
}

// 🌟 Purpose Agent - Meaning & Purpose
class PurposeAgent {
  constructor(private db: Database) {}

  defineValue(value: string, description: string) {
    this.logAction('value_defined', `${value}: ${description}`, 8)
    return { success: true, value, description }
  }

  setIntention(intention: string) {
    this.logAction('intention_set', intention, 6)
    return { success: true, intention }
  }

  getScore(): number {
    const actions = this.db.query(`
      SELECT COALESCE(SUM(impact), 0) as total
      FROM peace_actions
      WHERE agent = 'purpose' AND timestamp > ?
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]).get() as any
    return Math.min(100, Math.round(actions.total / 1.5))
  }

  private logAction(action: string, details: string, impact: number) {
    this.db.run(`
      INSERT INTO peace_actions (id, timestamp, agent, action, details, impact)
      VALUES (?, ?, 'purpose', ?, ?, ?)
    `, [nanoid(10), Date.now(), action, details, impact])
  }
}

export default PeaceCatalystService
