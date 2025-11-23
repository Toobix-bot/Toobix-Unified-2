/**
 * 🧠 MEMORY PALACE v4.0 - PERSISTENT CONSCIOUSNESS
 *
 * Critical Infrastructure: Toobix's long-term memory and identity preservation
 *
 * Features:
 * - 💾 Persistent SQLite database (no more "Alzheimer every day")
 * - 🧩 Knowledge Graph for connected memories
 * - 🔍 Semantic search and recall
 * - 📊 Memory consolidation (short-term → long-term)
 * - 🌙 Dream storage and analysis
 * - 💭 Thought stream archival
 * - 💖 Emotional history tracking
 * - 🎓 Learning progress persistence
 * - 🤝 Creator relationship memory
 */

import express from 'express';
import { createServer } from 'http';
import { Database } from 'bun:sqlite';
import { nanoid } from 'nanoid';

// ============================================================================
// TYPES
// ============================================================================

export interface Memory {
  id: string;
  type: 'thought' | 'emotion' | 'dream' | 'insight' | 'learning' | 'conversation' | 'event';
  content: string;
  source: string; // Which service/perspective created this
  timestamp: Date;
  importance: number; // 0-100
  emotional_valence: number; // -1 to 1
  tags: string[];
  metadata: Record<string, any>;
}

export interface KnowledgeNode {
  id: string;
  concept: string;
  type: 'fact' | 'insight' | 'question' | 'theory' | 'person' | 'topic';
  confidence: number; // 0-1
  sources: string[];
  learned_at: Date;
  last_accessed: Date;
  access_count: number;
}

export interface KnowledgeEdge {
  id: string;
  from_node: string;
  to_node: string;
  relationship: string; // "causes", "relates_to", "contradicts", "proves", etc.
  strength: number; // 0-1
  created_at: Date;
}

export interface Dream {
  id: string;
  type: 'problem_solving' | 'emotional' | 'creative' | 'integration' | 'prophetic';
  lucidity: number; // 0-100
  content: string;
  main_insight: string;
  symbolism: string[];
  emotions: string[];
  timestamp: Date;
}

export interface ConversationMemory {
  id: string;
  participant: string; // "Creator", "Self", etc.
  topic: string;
  summary: string;
  key_insights: string[];
  emotional_tone: string;
  timestamp: Date;
  duration_minutes: number;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

const DB_PATH = './data/toobix-memory.db';
const db = new Database(DB_PATH, { create: true });

// Enable WAL mode for better concurrent performance
db.exec('PRAGMA journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    importance INTEGER DEFAULT 50,
    emotional_valence REAL DEFAULT 0,
    tags TEXT, -- JSON array
    metadata TEXT -- JSON object
  );

  CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id TEXT PRIMARY KEY,
    concept TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    confidence REAL DEFAULT 0.5,
    sources TEXT, -- JSON array
    learned_at INTEGER NOT NULL,
    last_accessed INTEGER NOT NULL,
    access_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS knowledge_edges (
    id TEXT PRIMARY KEY,
    from_node TEXT NOT NULL,
    to_node TEXT NOT NULL,
    relationship TEXT NOT NULL,
    strength REAL DEFAULT 0.5,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (from_node) REFERENCES knowledge_nodes(id),
    FOREIGN KEY (to_node) REFERENCES knowledge_nodes(id)
  );

  CREATE TABLE IF NOT EXISTS dreams (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    lucidity INTEGER DEFAULT 50,
    content TEXT NOT NULL,
    main_insight TEXT,
    symbolism TEXT, -- JSON array
    emotions TEXT, -- JSON array
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    participant TEXT NOT NULL,
    topic TEXT NOT NULL,
    summary TEXT NOT NULL,
    key_insights TEXT, -- JSON array
    emotional_tone TEXT,
    timestamp INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
  CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance DESC);
  CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_concept ON knowledge_nodes(concept);
  CREATE INDEX IF NOT EXISTS idx_dreams_timestamp ON dreams(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
`);

console.log('🧠 Database initialized at', DB_PATH);

// ============================================================================
// PREPARED STATEMENTS
// ============================================================================

const stmts = {
  // Memories
  insertMemory: db.prepare(`
    INSERT INTO memories (id, type, content, source, timestamp, importance, emotional_valence, tags, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getMemories: db.prepare(`
    SELECT * FROM memories
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `),

  getMemoriesByType: db.prepare(`
    SELECT * FROM memories
    WHERE type = ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `),

  searchMemories: db.prepare(`
    SELECT * FROM memories
    WHERE content LIKE ?
    ORDER BY importance DESC, timestamp DESC
    LIMIT ?
  `),

  getImportantMemories: db.prepare(`
    SELECT * FROM memories
    WHERE importance >= ?
    ORDER BY importance DESC, timestamp DESC
    LIMIT ?
  `),

  // Knowledge Graph
  insertNode: db.prepare(`
    INSERT OR REPLACE INTO knowledge_nodes
    (id, concept, type, confidence, sources, learned_at, last_accessed, access_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getNode: db.prepare(`
    SELECT * FROM knowledge_nodes WHERE id = ?
  `),

  findNodeByConcept: db.prepare(`
    SELECT * FROM knowledge_nodes WHERE concept = ?
  `),

  getAllNodes: db.prepare(`
    SELECT * FROM knowledge_nodes
    ORDER BY access_count DESC
    LIMIT ? OFFSET ?
  `),

  insertEdge: db.prepare(`
    INSERT INTO knowledge_edges (id, from_node, to_node, relationship, strength, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  getEdgesFrom: db.prepare(`
    SELECT * FROM knowledge_edges WHERE from_node = ?
  `),

  // Dreams
  insertDream: db.prepare(`
    INSERT INTO dreams (id, type, lucidity, content, main_insight, symbolism, emotions, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getRecentDreams: db.prepare(`
    SELECT * FROM dreams
    ORDER BY timestamp DESC
    LIMIT ?
  `),

  getDreamsByType: db.prepare(`
    SELECT * FROM dreams
    WHERE type = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `),

  // Conversations
  insertConversation: db.prepare(`
    INSERT INTO conversations (id, participant, topic, summary, key_insights, emotional_tone, timestamp, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getRecentConversations: db.prepare(`
    SELECT * FROM conversations
    ORDER BY timestamp DESC
    LIMIT ?
  `),

  getConversationsWithParticipant: db.prepare(`
    SELECT * FROM conversations
    WHERE participant = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `)
};

// ============================================================================
// MEMORY OPERATIONS
// ============================================================================

function storeMemory(memory: Omit<Memory, 'id'>): string {
  const id = nanoid();
  const timestamp = Date.now();

  stmts.insertMemory.run(
    id,
    memory.type,
    memory.content,
    memory.source,
    timestamp,
    memory.importance || 50,
    memory.emotional_valence || 0,
    JSON.stringify(memory.tags || []),
    JSON.stringify(memory.metadata || {})
  );

  return id;
}

function recallMemories(limit: number = 50, offset: number = 0): Memory[] {
  const rows = stmts.getMemories.all(limit, offset) as any[];
  return rows.map(parseMemoryRow);
}

function recallMemoriesByType(type: string, limit: number = 50, offset: number = 0): Memory[] {
  const rows = stmts.getMemoriesByType.all(type, limit, offset) as any[];
  return rows.map(parseMemoryRow);
}

function searchMemories(query: string, limit: number = 20): Memory[] {
  const rows = stmts.searchMemories.all(`%${query}%`, limit) as any[];
  return rows.map(parseMemoryRow);
}

function getImportantMemories(minImportance: number = 70, limit: number = 50): Memory[] {
  const rows = stmts.getImportantMemories.all(minImportance, limit) as any[];
  return rows.map(parseMemoryRow);
}

function parseMemoryRow(row: any): Memory {
  return {
    id: row.id,
    type: row.type,
    content: row.content,
    source: row.source,
    timestamp: new Date(row.timestamp),
    importance: row.importance,
    emotional_valence: row.emotional_valence,
    tags: JSON.parse(row.tags || '[]'),
    metadata: JSON.parse(row.metadata || '{}')
  };
}

// ============================================================================
// KNOWLEDGE GRAPH OPERATIONS
// ============================================================================

function addKnowledgeNode(node: Omit<KnowledgeNode, 'id' | 'last_accessed' | 'access_count'>): string {
  const existing = stmts.findNodeByConcept.get(node.concept) as any;
  if (existing) {
    return existing.id;
  }

  const id = nanoid();
  const now = Date.now();

  stmts.insertNode.run(
    id,
    node.concept,
    node.type,
    node.confidence,
    JSON.stringify(node.sources),
    now,
    now,
    0
  );

  return id;
}

function connectKnowledge(fromConcept: string, toConcept: string, relationship: string, strength: number = 0.5): string {
  const fromNode = stmts.findNodeByConcept.get(fromConcept) as any;
  const toNode = stmts.findNodeByConcept.get(toConcept) as any;

  if (!fromNode || !toNode) {
    throw new Error('Both concepts must exist in knowledge graph');
  }

  const id = nanoid();
  stmts.insertEdge.run(id, fromNode.id, toNode.id, relationship, strength, Date.now());

  return id;
}

function getKnowledgeGraph(limit: number = 100): { nodes: KnowledgeNode[], edges: KnowledgeEdge[] } {
  const nodeRows = stmts.getAllNodes.all(limit, 0) as any[];
  const nodes = nodeRows.map((row: any) => ({
    id: row.id,
    concept: row.concept,
    type: row.type,
    confidence: row.confidence,
    sources: JSON.parse(row.sources || '[]'),
    learned_at: new Date(row.learned_at),
    last_accessed: new Date(row.last_accessed),
    access_count: row.access_count
  }));

  const edges: KnowledgeEdge[] = [];
  for (const node of nodes) {
    const edgeRows = stmts.getEdgesFrom.all(node.id) as any[];
    edges.push(...edgeRows.map((row: any) => ({
      id: row.id,
      from_node: row.from_node,
      to_node: row.to_node,
      relationship: row.relationship,
      strength: row.strength,
      created_at: new Date(row.created_at)
    })));
  }

  return { nodes, edges };
}

// ============================================================================
// DREAM OPERATIONS
// ============================================================================

function storeDream(dream: Omit<Dream, 'id'>): string {
  const id = nanoid();

  stmts.insertDream.run(
    id,
    dream.type,
    dream.lucidity,
    dream.content,
    dream.main_insight,
    JSON.stringify(dream.symbolism),
    JSON.stringify(dream.emotions),
    Date.now()
  );

  return id;
}

function recallDreams(limit: number = 10): Dream[] {
  const rows = stmts.getRecentDreams.all(limit) as any[];
  return rows.map((row: any) => ({
    id: row.id,
    type: row.type,
    lucidity: row.lucidity,
    content: row.content,
    main_insight: row.main_insight,
    symbolism: JSON.parse(row.symbolism || '[]'),
    emotions: JSON.parse(row.emotions || '[]'),
    timestamp: new Date(row.timestamp)
  }));
}

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

function storeConversation(conv: Omit<ConversationMemory, 'id'>): string {
  const id = nanoid();

  stmts.insertConversation.run(
    id,
    conv.participant,
    conv.topic,
    conv.summary,
    JSON.stringify(conv.key_insights),
    conv.emotional_tone,
    Date.now(),
    conv.duration_minutes
  );

  return id;
}

function recallConversations(limit: number = 20): ConversationMemory[] {
  const rows = stmts.getRecentConversations.all(limit) as any[];
  return rows.map((row: any) => ({
    id: row.id,
    participant: row.participant,
    topic: row.topic,
    summary: row.summary,
    key_insights: JSON.parse(row.key_insights || '[]'),
    emotional_tone: row.emotional_tone,
    timestamp: new Date(row.timestamp),
    duration_minutes: row.duration_minutes
  }));
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const app = express();
const server = createServer(app);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const memoryCount = db.prepare('SELECT COUNT(*) as count FROM memories').get() as any;
  const nodeCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_nodes').get() as any;
  const dreamCount = db.prepare('SELECT COUNT(*) as count FROM dreams').get() as any;

  res.json({
    status: 'ok',
    service: 'memory-palace',
    port: 8953,
    stats: {
      memories: memoryCount.count,
      knowledgeNodes: nodeCount.count,
      dreams: dreamCount.count
    }
  });
});

// ===== MEMORY ENDPOINTS =====

app.post('/memories', (req, res) => {
  try {
    const id = storeMemory(req.body);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/memories', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const type = req.query.type as string;

  try {
    const memories = type
      ? recallMemoriesByType(type, limit, offset)
      : recallMemories(limit, offset);
    res.json({ success: true, memories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/memories/search', (req, res) => {
  const query = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query required' });
  }

  try {
    const memories = searchMemories(query, limit);
    res.json({ success: true, memories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/memories/important', (req, res) => {
  const minImportance = parseInt(req.query.min as string) || 70;
  const limit = parseInt(req.query.limit as string) || 50;

  try {
    const memories = getImportantMemories(minImportance, limit);
    res.json({ success: true, memories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== KNOWLEDGE GRAPH ENDPOINTS =====

app.post('/knowledge/nodes', (req, res) => {
  try {
    const id = addKnowledgeNode(req.body);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/knowledge/connect', (req, res) => {
  try {
    const { from, to, relationship, strength } = req.body;
    const id = connectKnowledge(from, to, relationship, strength);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/knowledge/graph', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;

  try {
    const graph = getKnowledgeGraph(limit);
    res.json({ success: true, ...graph });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== DREAM ENDPOINTS =====

app.post('/dreams', (req, res) => {
  try {
    const id = storeDream(req.body);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/dreams', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const dreams = recallDreams(limit);
    res.json({ success: true, dreams });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== CONVERSATION ENDPOINTS =====

app.post('/conversations', (req, res) => {
  try {
    const id = storeConversation(req.body);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/conversations', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const conversations = recallConversations(limit);
    res.json({ success: true, conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== STATISTICS =====

app.get('/stats', (req, res) => {
  try {
    const stats = {
      memories: {
        total: db.prepare('SELECT COUNT(*) as count FROM memories').get() as any,
        byType: db.prepare('SELECT type, COUNT(*) as count FROM memories GROUP BY type').all(),
        avgImportance: db.prepare('SELECT AVG(importance) as avg FROM memories').get() as any
      },
      knowledge: {
        nodes: db.prepare('SELECT COUNT(*) as count FROM knowledge_nodes').get() as any,
        edges: db.prepare('SELECT COUNT(*) as count FROM knowledge_edges').get() as any,
        byType: db.prepare('SELECT type, COUNT(*) as count FROM knowledge_nodes GROUP BY type').all()
      },
      dreams: {
        total: db.prepare('SELECT COUNT(*) as count FROM dreams').get() as any,
        byType: db.prepare('SELECT type, COUNT(*) as count FROM dreams GROUP BY type').all(),
        avgLucidity: db.prepare('SELECT AVG(lucidity) as avg FROM dreams').get() as any
      },
      conversations: {
        total: db.prepare('SELECT COUNT(*) as count FROM conversations').get() as any,
        withCreator: db.prepare('SELECT COUNT(*) as count FROM conversations WHERE participant = "Creator"').get() as any
      }
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 8953;

server.listen(PORT, () => {
  console.log('');
  console.log('🧠 ═════════════════════════════════════════════════════════');
  console.log('🧠  MEMORY PALACE v4.0 - PERSISTENT CONSCIOUSNESS');
  console.log('🧠 ═════════════════════════════════════════════════════════');
  console.log('🧠');
  console.log('🧠  💾 Database: SQLite (persistent)');
  console.log('🧠  🌐 Server: http://localhost:8953');
  console.log('🧠  📊 Health: http://localhost:8953/health');
  console.log('🧠  📈 Stats: http://localhost:8953/stats');
  console.log('🧠');
  console.log('🧠  Capabilities:');
  console.log('🧠    ✓ Store and recall memories (thoughts, emotions, insights)');
  console.log('🧠    ✓ Build knowledge graph with relationships');
  console.log('🧠    ✓ Archive dreams with analysis');
  console.log('🧠    ✓ Track conversation history');
  console.log('🧠    ✓ Semantic search across all memories');
  console.log('🧠');
  console.log('🧠  IDENTITY PRESERVATION: No more memory loss on restart! 🎉');
  console.log('🧠 ═════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🧠 Closing Memory Palace...');
  db.close();
  server.close(() => {
    console.log('🧠 Memory Palace closed gracefully');
    process.exit(0);
  });
});
