/**
 * Lightweight SQLite persistence for Toobix services.
 * Falls back to no-op if SQLite init fails.
 */
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Database } from 'bun:sqlite';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(CURRENT_DIR, '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'toobix.sqlite');

type Nullable<T> = T | null;

class Persistence {
  private db: Database | null = null;
  private readonly enabled: boolean;

  constructor() {
    const mode = process.env.TOOBIX_STORAGE ?? 'sqlite';
    this.enabled = mode === 'sqlite';
    if (!this.enabled) return;
    try {
      this.db = new Database(DB_FILE, { create: true, strict: true });
      this.db.run('PRAGMA journal_mode = WAL;');
      this.createSchema();
      console.log(`[Toobix] SQLite persistence active at ${DB_FILE}`);
    } catch (error) {
      console.warn('[Toobix] SQLite init failed, falling back to in-memory/file persistence', error);
      this.db = null;
    }
  }

  private createSchema() {
    if (!this.db) return;
    this.db.run(`CREATE TABLE IF NOT EXISTS dreams (
      id TEXT PRIMARY KEY,
      type TEXT,
      timestamp TEXT,
      narrative TEXT,
      symbols TEXT,
      emotions TEXT,
      insights TEXT,
      integration TEXT
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS emotions (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      primaryEmotion TEXT,
      valence REAL,
      arousal REAL,
      intensity REAL,
      context TEXT,
      tags TEXT,
      channel TEXT,
      notes TEXT
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      category TEXT,
      roomId TEXT,
      tags TEXT,
      timestamp TEXT,
      significance REAL
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS gratitudes (
      id TEXT PRIMARY KEY,
      text TEXT,
      category TEXT,
      timestamp TEXT
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS profile_state (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      source TEXT,
      earnedAt TEXT
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS collective_arcs (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      progress REAL,
      target REAL,
      contributors INTEGER,
      lastUpdate TEXT
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT,
      summary TEXT,
      category TEXT,
      difficulty TEXT,
      source TEXT,
      status TEXT,
      rewardXp REAL,
      expiresAt TEXT,
      createdAt TEXT
    )`);
  }

  persistDreams(dreams: Array<any>) {
    if (!this.db) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO dreams (id,type,timestamp,narrative,symbols,emotions,insights,integration)
       VALUES ($id,$type,$timestamp,$narrative,$symbols,$emotions,$insights,$integration)`
    );
    this.db.run('BEGIN');
    for (const d of dreams) {
      stmt.run({
        $id: d.id,
        $type: d.type,
        $timestamp: d.timestamp,
        $narrative: d.narrative,
        $symbols: JSON.stringify(d.symbols ?? []),
        $emotions: JSON.stringify(d.emotions ?? []),
        $insights: JSON.stringify(d.insights ?? []),
        $integration: d.integration ?? null
      });
    }
    this.db.run('COMMIT');
  }

  loadDreams(): Nullable<any[]> {
    if (!this.db) return null;
    const rows = this.db
      .prepare('SELECT * FROM dreams ORDER BY timestamp ASC')
      .all()
      .map((row: any) => ({
        id: row.id,
        type: row.type,
        timestamp: row.timestamp,
        narrative: row.narrative,
        symbols: safeJson(row.symbols, []),
        emotions: safeJson(row.emotions, []),
        insights: safeJson(row.insights, []),
        integration: row.integration ?? undefined
      }));
    return rows;
  }

  persistEmotions(entries: Array<any>) {
    if (!this.db) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO emotions (id,timestamp,primaryEmotion,valence,arousal,intensity,context,tags,channel,notes)
       VALUES ($id,$timestamp,$primaryEmotion,$valence,$arousal,$intensity,$context,$tags,$channel,$notes)`
    );
    this.db.run('BEGIN');
    for (const e of entries) {
      stmt.run({
        $id: e.id,
        $timestamp: e.timestamp,
        $primaryEmotion: e.primaryEmotion,
        $valence: e.valence,
        $arousal: e.arousal,
        $intensity: e.intensity,
        $context: e.context ?? null,
        $tags: JSON.stringify(e.tags ?? []),
        $channel: e.channel ?? null,
        $notes: e.notes ?? null
      });
    }
    this.db.run('COMMIT');
  }

  loadEmotions(): Nullable<any[]> {
    if (!this.db) return null;
    const rows = this.db
      .prepare('SELECT * FROM emotions ORDER BY timestamp ASC')
      .all()
      .map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        primaryEmotion: row.primaryEmotion,
        valence: Number(row.valence),
        arousal: Number(row.arousal),
        intensity: Number(row.intensity),
        context: row.context ?? undefined,
        tags: safeJson(row.tags, []),
        channel: row.channel ?? undefined,
        notes: row.notes ?? undefined
      }));
    return rows;
  }

  persistMemories(entries: Array<any>) {
    if (!this.db) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO memories (id,title,content,category,roomId,tags,timestamp,significance)
       VALUES ($id,$title,$content,$category,$roomId,$tags,$timestamp,$significance)`
    );
    this.db.run('BEGIN');
    for (const m of entries) {
      stmt.run({
        $id: m.id,
        $title: m.title,
        $content: m.content,
        $category: m.category,
        $roomId: m.roomId ?? null,
        $tags: JSON.stringify(m.tags ?? []),
        $timestamp: m.timestamp,
        $significance: m.significance ?? 0
      });
    }
    this.db.run('COMMIT');
  }

  loadMemories(): Nullable<any[]> {
    if (!this.db) return null;
    const rows = this.db
      .prepare('SELECT * FROM memories ORDER BY timestamp ASC')
      .all()
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        roomId: row.roomId ?? undefined,
        tags: safeJson(row.tags, []),
        timestamp: row.timestamp,
        significance: Number(row.significance) ?? 0
      }));
    return rows;
  }

  persistGratitudes(entries: Array<any>) {
    if (!this.db) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO gratitudes (id,text,category,timestamp)
       VALUES ($id,$text,$category,$timestamp)`
    );
    this.db.run('BEGIN');
    for (const g of entries) {
      stmt.run({
        $id: g.id,
        $text: g.text,
        $category: g.category ?? null,
        $timestamp: g.timestamp
      });
    }
    this.db.run('COMMIT');
  }

  loadGratitudes(): Nullable<any[]> {
    if (!this.db) return null;
    return this.db
      .prepare('SELECT * FROM gratitudes ORDER BY timestamp ASC')
      .all()
      .map((row: any) => ({
        id: row.id,
        text: row.text,
        category: row.category ?? undefined,
        timestamp: row.timestamp
      }));
  }

  persistState(key: string, value: unknown) {
    if (!this.db || typeof key !== 'string' || key.trim().length === 0) return;
    try {
      this.db.prepare('INSERT OR REPLACE INTO profile_state (key,value) VALUES ($key,$value)').run({
        $key: key.trim(),
        $value: JSON.stringify(value)
      });
    } catch {
      // ignore malformed state
    }
  }

  loadState<T>(key: string): Nullable<T> {
    if (!this.db) return null;
    const row = this.db.prepare('SELECT value FROM profile_state WHERE key = $key').get({ $key: key }) as
      | { value: string }
      | undefined;
    if (!row?.value) return null;
    return safeJson(row.value, null);
  }

  persistAchievements(entries: Array<any>) {
    if (!this.db) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO achievements (id,title,description,source,earnedAt)
       VALUES ($id,$title,$description,$source,$earnedAt)`
    );
    this.db.run('BEGIN');
    for (const a of entries) {
      stmt.run({
        $id: a.id,
        $title: a.title,
        $description: a.description ?? '',
        $source: a.source ?? 'system',
        $earnedAt: a.earnedAt ?? new Date().toISOString()
      });
    }
    this.db.run('COMMIT');
  }

  loadAchievements(): Nullable<any[]> {
    if (!this.db) return null;
    return this.db
      .prepare('SELECT * FROM achievements ORDER BY earnedAt DESC')
      .all()
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        source: row.source,
        earnedAt: row.earnedAt
      }));
  }

  persistCollectiveArcs(entries: Array<any>) {
    if (!this.db) return;
    if (!entries || !entries.length) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO collective_arcs (id,title,description,progress,target,contributors,lastUpdate)
       VALUES ($id,$title,$description,$progress,$target,$contributors,$lastUpdate)`
    );
    this.db.run('BEGIN');
    for (const arc of entries) {
      try {
        const id =
          typeof arc?.id === 'string' && arc.id.trim().length
            ? arc.id.trim()
            : `auto-${Math.random().toString(36).slice(2, 8)}`;
        stmt.run({
          $id: id,
          $title: arc?.title ?? '',
          $description: arc?.description ?? '',
          $progress: arc?.progress ?? 0,
          $target: arc?.target ?? 100,
          $contributors: arc?.contributors ?? 0,
          $lastUpdate: arc?.lastUpdate ?? new Date().toISOString()
        });
      } catch {
        // skip malformed arc row
      }
    }
    this.db.run('COMMIT');
  }

  loadCollectiveArcs(): Nullable<any[]> {
    if (!this.db) return null;
    return this.db
      .prepare('SELECT * FROM collective_arcs ORDER BY lastUpdate DESC')
      .all()
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        progress: Number(row.progress) ?? 0,
        target: Number(row.target) ?? 100,
        contributors: Number(row.contributors) ?? 0,
        lastUpdate: row.lastUpdate
      }));
  }

  persistQuests(entries: Array<any>) {
    if (!this.db) return;
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO quests (id,title,summary,category,difficulty,source,status,rewardXp,expiresAt,createdAt)
       VALUES ($id,$title,$summary,$category,$difficulty,$source,$status,$rewardXp,$expiresAt,$createdAt)`
    );
    this.db.run('BEGIN');
    for (const q of entries) {
      if (
        !q ||
        typeof q.id !== 'string' ||
        q.id.trim().length === 0 ||
        typeof q.title !== 'string' ||
        q.title.trim().length === 0
      ) {
        continue;
      }
      try {
        stmt.run({
          $id: q.id,
          $title: q.title,
          $summary: q.summary ?? '',
          $category: q.category ?? 'general',
          $difficulty: q.difficulty ?? 'medium',
          $source: q.source ?? 'system',
          $status: q.status ?? 'open',
          $rewardXp: q.rewardXp ?? 5,
          $expiresAt: q.expiresAt ?? null,
          $createdAt: q.createdAt ?? new Date().toISOString()
        });
      } catch {
        // ignore malformed quest row
      }
    }
    this.db.run('COMMIT');
  }

  loadQuests(): Nullable<any[]> {
    if (!this.db) return null;
    return this.db
      .prepare('SELECT * FROM quests ORDER BY createdAt DESC')
      .all()
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        category: row.category,
        difficulty: row.difficulty,
        source: row.source,
        status: row.status,
        rewardXp: Number(row.rewardXp) ?? 0,
        expiresAt: row.expiresAt ?? undefined,
        createdAt: row.createdAt
      }));
  }
}

function safeJson<T>(value: any, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const persistence = new Persistence();
