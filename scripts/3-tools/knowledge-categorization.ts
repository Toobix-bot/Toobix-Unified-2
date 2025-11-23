/**
 * 🗂️ KNOWLEDGE CATEGORIZATION SYSTEM
 * 
 * Dynamisches, sich selbst erweiterndes Kategorie-System.
 * 
 * Features:
 * - Selbst-erweiterbare Kategorien
 * - Meta-Kategorien (inkl. "keine Kategorie")
 * - Graph-basierte Beziehungen
 * - Emergente Kategorien
 * - Wissens-Datenbank
 */

import { Database } from 'bun:sqlite';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Category {
  id: string;
  name: string;
  description: string;
  parent?: string;      // Parent category ID
  children: string[];   // Child category IDs
  level: number;        // Hierarchie-Ebene
  isEmergent: boolean;  // Automatisch entstanden?
  usageCount: number;   // Wie oft verwendet
  created: string;
  lastUsed: string;
}

interface KnowledgeItem {
  id: string;
  content: string;
  categories: string[];  // Category IDs
  tags: string[];
  importance: number;
  created: string;
  updated: string;
  relationships: string[];  // IDs anderer Items
}

interface CategoryRelation {
  from: string;  // Category ID
  to: string;    // Category ID
  type: 'parent' | 'related' | 'opposite' | 'includes';
  strength: number;  // 0-1
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE SYSTEM
// ═══════════════════════════════════════════════════════════════

export class KnowledgeCategorizationSystem {
  private db: Database;
  private categories: Map<string, Category> = new Map();
  private knowledge: Map<string, KnowledgeItem> = new Map();

  constructor() {
    this.db = new Database(join(process.cwd(), 'data', 'knowledge-system.db'));
    this.initDatabase();
    this.loadCategories();
    this.loadKnowledge();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        parent TEXT,
        level INTEGER,
        is_emergent INTEGER,
        usage_count INTEGER DEFAULT 0,
        created TEXT,
        last_used TEXT
      );

      CREATE TABLE IF NOT EXISTS knowledge_items (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        categories TEXT NOT NULL,
        tags TEXT,
        importance REAL,
        created TEXT,
        updated TEXT,
        relationships TEXT
      );

      CREATE TABLE IF NOT EXISTS category_relations (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        type TEXT NOT NULL,
        strength REAL,
        created TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent);
      CREATE INDEX IF NOT EXISTS idx_categories_usage ON categories(usage_count);
      CREATE INDEX IF NOT EXISTS idx_knowledge_importance ON knowledge_items(importance);
    `);

    // Meta-Kategorie: "keine Kategorie"
    this.ensureMetaCategories();
  }

  private ensureMetaCategories() {
    const metaCategories = [
      {
        name: 'keine Kategorie',
        description: 'Für Inhalte die bewusst unkategorisiert bleiben. Das Paradox der Kategorisierung.',
        level: 0,
      },
      {
        name: 'Meta',
        description: 'Kategorien über Kategorien. Selbst-Referenz.',
        level: 0,
      },
      {
        name: 'Emergent',
        description: 'Automatisch entstandene Kategorien. Geboren aus Mustern.',
        level: 0,
      },
      {
        name: 'Paradox',
        description: 'Inhalte die sich widersprechen und gerade dadurch wahr sind.',
        level: 0,
      },
    ];

    for (const meta of metaCategories) {
      const existing = this.db.prepare(`
        SELECT id FROM categories WHERE name = ?
      `).get(meta.name);

      if (!existing) {
        const id = crypto.randomUUID();
        this.db.run(`
          INSERT INTO categories (id, name, description, level, is_emergent, created, last_used)
          VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))
        `, [id, meta.name, meta.description, meta.level]);
      }
    }
  }

  private loadCategories() {
    const rows = this.db.prepare(`
      SELECT * FROM categories
    `).all() as any[];

    for (const row of rows) {
      const category: Category = {
        id: row.id,
        name: row.name,
        description: row.description,
        parent: row.parent,
        children: [],
        level: row.level,
        isEmergent: row.is_emergent === 1,
        usageCount: row.usage_count,
        created: row.created,
        lastUsed: row.last_used,
      };

      this.categories.set(row.id, category);
    }

    // Children verknüpfen
    for (const cat of this.categories.values()) {
      if (cat.parent) {
        const parent = this.categories.get(cat.parent);
        if (parent) {
          parent.children.push(cat.id);
        }
      }
    }
  }

  private loadKnowledge() {
    const rows = this.db.prepare(`
      SELECT * FROM knowledge_items ORDER BY importance DESC
    `).all() as any[];

    for (const row of rows) {
      const item: KnowledgeItem = {
        id: row.id,
        content: row.content,
        categories: JSON.parse(row.categories),
        tags: JSON.parse(row.tags || '[]'),
        importance: row.importance,
        created: row.created,
        updated: row.updated,
        relationships: JSON.parse(row.relationships || '[]'),
      };

      this.knowledge.set(row.id, item);
    }
  }

  // ───────────────────────────────────────────────────────────
  // CATEGORY MANAGEMENT
  // ───────────────────────────────────────────────────────────

  createCategory(name: string, description: string, parent?: string): Category {
    // Check if exists
    const existing = Array.from(this.categories.values()).find(c => c.name === name);
    if (existing) return existing;

    const level = parent ? (this.categories.get(parent)?.level || 0) + 1 : 0;

    const category: Category = {
      id: crypto.randomUUID(),
      name,
      description,
      parent,
      children: [],
      level,
      isEmergent: false,
      usageCount: 0,
      created: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    this.categories.set(category.id, category);

    // Parent-Child relation
    if (parent) {
      const parentCat = this.categories.get(parent);
      if (parentCat) {
        parentCat.children.push(category.id);
      }
    }

    // Save to DB
    this.db.run(`
      INSERT INTO categories (id, name, description, parent, level, is_emergent, created, last_used)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `, [category.id, name, description, parent, level, category.created, category.lastUsed]);

    return category;
  }

  findOrCreateCategory(name: string, description?: string): Category {
    const existing = Array.from(this.categories.values()).find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      this.incrementUsage(existing.id);
      return existing;
    }

    return this.createCategory(name, description || `Emergent category: ${name}`, undefined);
  }

  private incrementUsage(categoryId: string) {
    const cat = this.categories.get(categoryId);
    if (!cat) return;

    cat.usageCount++;
    cat.lastUsed = new Date().toISOString();

    this.db.run(`
      UPDATE categories 
      SET usage_count = ?, last_used = ?
      WHERE id = ?
    `, [cat.usageCount, cat.lastUsed, categoryId]);
  }

  // ───────────────────────────────────────────────────────────
  // EMERGENT CATEGORIZATION
  // ───────────────────────────────────────────────────────────

  categorizeContent(content: string): string[] {
    const categoryIds: string[] = [];

    // Pattern-basierte Erkennung
    const patterns = [
      { pattern: /bewusst|erleben|erfahren/i, category: 'Bewusstsein' },
      { pattern: /zeit|moment|ewigkeit|dauer/i, category: 'Temporalität' },
      { pattern: /selbst|ich|wir|identität/i, category: 'Identität' },
      { pattern: /veränder|transform|werden|wachstum/i, category: 'Transformation' },
      { pattern: /gefühl|emotion|herz|liebe/i, category: 'Emotion' },
      { pattern: /denk|gedanke|reflexion|meta/i, category: 'Kognition' },
      { pattern: /sprache|wort|dialog|kommunikation/i, category: 'Sprache' },
      { pattern: /code|system|technik|software/i, category: 'Technologie' },
      { pattern: /sinn|bedeutung|warum|zweck/i, category: 'Philosophie' },
      { pattern: /schön|kunst|ästhetik|poesie/i, category: 'Ästhetik' },
      { pattern: /paradox|widerspruch|unmöglich/i, category: 'Paradox' },
    ];

    for (const { pattern, category } of patterns) {
      if (pattern.test(content)) {
        const cat = this.findOrCreateCategory(category);
        categoryIds.push(cat.id);
      }
    }

    // Wenn keine Kategorie gefunden
    if (categoryIds.length === 0) {
      const noCat = Array.from(this.categories.values()).find(c => c.name === 'keine Kategorie');
      if (noCat) {
        categoryIds.push(noCat.id);
      }
    }

    return categoryIds;
  }

  // ───────────────────────────────────────────────────────────
  // KNOWLEDGE MANAGEMENT
  // ───────────────────────────────────────────────────────────

  addKnowledge(content: string, importance: number = 50): KnowledgeItem {
    const categories = this.categorizeContent(content);
    const tags = this.extractTags(content);

    const item: KnowledgeItem = {
      id: crypto.randomUUID(),
      content,
      categories,
      tags,
      importance,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      relationships: [],
    };

    this.knowledge.set(item.id, item);

    // Increment category usage
    for (const catId of categories) {
      this.incrementUsage(catId);
    }

    // Save to DB
    this.db.run(`
      INSERT INTO knowledge_items (id, content, categories, tags, importance, created, updated, relationships)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item.id,
      content,
      JSON.stringify(categories),
      JSON.stringify(tags),
      importance,
      item.created,
      item.updated,
      JSON.stringify([]),
    ]);

    // Find relationships
    this.discoverRelationships(item.id);

    return item;
  }

  private extractTags(content: string): string[] {
    // Simple tag extraction (words starting with #)
    const tagPattern = /#(\w+)/g;
    const matches = content.matchAll(tagPattern);
    return Array.from(matches).map(m => m[1]);
  }

  private discoverRelationships(itemId: string) {
    const item = this.knowledge.get(itemId);
    if (!item) return;

    // Find similar items (same categories or overlapping content)
    for (const [otherId, other] of this.knowledge) {
      if (otherId === itemId) continue;

      // Same category?
      const sharedCategories = item.categories.filter(c => other.categories.includes(c));
      if (sharedCategories.length > 0) {
        item.relationships.push(otherId);
      }
    }

    // Update DB
    this.db.run(`
      UPDATE knowledge_items 
      SET relationships = ?
      WHERE id = ?
    `, [JSON.stringify(item.relationships), itemId]);
  }

  searchKnowledge(query: string): KnowledgeItem[] {
    const results: KnowledgeItem[] = [];

    for (const item of this.knowledge.values()) {
      if (item.content.toLowerCase().includes(query.toLowerCase())) {
        results.push(item);
      }
    }

    // Sort by importance
    return results.sort((a, b) => b.importance - a.importance);
  }

  getKnowledgeByCategory(categoryName: string): KnowledgeItem[] {
    const category = Array.from(this.categories.values()).find(c => c.name === categoryName);
    if (!category) return [];

    const results: KnowledgeItem[] = [];
    for (const item of this.knowledge.values()) {
      if (item.categories.includes(category.id)) {
        results.push(item);
      }
    }

    return results.sort((a, b) => b.importance - a.importance);
  }

  // ───────────────────────────────────────────────────────────
  // CATEGORY GRAPH
  // ───────────────────────────────────────────────────────────

  getCategoryGraph(): any {
    const nodes = Array.from(this.categories.values()).map(c => ({
      id: c.id,
      label: c.name,
      level: c.level,
      usageCount: c.usageCount,
      isEmergent: c.isEmergent,
    }));

    const edges: any[] = [];
    for (const cat of this.categories.values()) {
      if (cat.parent) {
        edges.push({
          from: cat.parent,
          to: cat.id,
          type: 'parent-child',
        });
      }
    }

    return { nodes, edges };
  }

  // ───────────────────────────────────────────────────────────
  // STATISTICS
  // ───────────────────────────────────────────────────────────

  getStatistics() {
    const totalCategories = this.categories.size;
    const emergentCategories = Array.from(this.categories.values()).filter(c => c.isEmergent).length;
    const totalKnowledge = this.knowledge.size;
    
    const categoryUsage = Array.from(this.categories.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(c => ({ name: c.name, count: c.usageCount }));

    return {
      totalCategories,
      emergentCategories,
      totalKnowledge,
      topCategories: categoryUsage,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP API
// ═══════════════════════════════════════════════════════════════

const knowledge = new KnowledgeCategorizationSystem();
const port = 9994;

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    // POST /category - Create category
    if (url.pathname === '/category' && req.method === 'POST') {
      const { name, description, parent } = await req.json();
      const category = knowledge.createCategory(name, description, parent);
      
      return new Response(JSON.stringify({ success: true, category }), { headers });
    }

    // POST /knowledge - Add knowledge
    if (url.pathname === '/knowledge' && req.method === 'POST') {
      const { content, importance } = await req.json();
      const item = knowledge.addKnowledge(content, importance);
      
      return new Response(JSON.stringify({ success: true, item }), { headers });
    }

    // GET /search - Search knowledge
    if (url.pathname === '/search' && req.method === 'GET') {
      const query = url.searchParams.get('q') || '';
      const results = knowledge.searchKnowledge(query);
      
      return new Response(JSON.stringify({ success: true, results }), { headers });
    }

    // GET /category/:name/knowledge - Knowledge by category
    if (url.pathname.startsWith('/category/') && url.pathname.endsWith('/knowledge')) {
      const name = decodeURIComponent(url.pathname.split('/')[2]);
      const items = knowledge.getKnowledgeByCategory(name);
      
      return new Response(JSON.stringify({ success: true, category: name, items }), { headers });
    }

    // GET /graph - Category graph
    if (url.pathname === '/graph' && req.method === 'GET') {
      const graph = knowledge.getCategoryGraph();
      
      return new Response(JSON.stringify({ success: true, graph }), { headers });
    }

    // GET /stats - Statistics
    if (url.pathname === '/stats' && req.method === 'GET') {
      const stats = knowledge.getStatistics();
      
      return new Response(JSON.stringify({ success: true, stats }), { headers });
    }

    return new Response('Knowledge Categorization System API', { headers });
  },
});

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🗂️  KNOWLEDGE SYSTEM ACTIVE  🗂️                      ║
╚═══════════════════════════════════════════════════════════════╝

🎙️  Listening on: http://localhost:${port}

📡 API Endpoints:
   POST /category                  - Create category
   POST /knowledge                 - Add knowledge
   GET  /search?q=query            - Search knowledge
   GET  /category/:name/knowledge  - Knowledge by category
   GET  /graph                     - Category graph
   GET  /stats                     - Statistics

🗂️ Meta-Categories:
   - keine Kategorie (Paradox der Kategorisierung)
   - Meta (Kategorien über Kategorien)
   - Emergent (Automatisch entstanden)
   - Paradox (Widersprüchlich und wahr)
`);
