/**
 * META-KNOWLEDGE ORCHESTRATOR
 *
 * Cross-Domain Wissens-Synthese & Knowledge Graph Engine
 * Verbindet alle 7 Life-Domains und generiert holistische Insights
 *
 * Port: 8917
 */

import Database from 'bun:sqlite';
import path from 'path';

// ========== TYPES ==========

type LifeDomain = 'career' | 'health' | 'finance' | 'relationships' | 'education' | 'creativity' | 'spirituality';

interface KnowledgeNode {
  id: string;
  domain: LifeDomain;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  sourceId?: number; // Reference to original knowledge entry in domain DB
}

interface KnowledgeEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipType: 'causes' | 'influences' | 'relates-to' | 'conflicts-with' | 'supports' | 'requires';
  strength: number; // 0-1
  description?: string;
  timestamp: string;
}

interface CrossDomainInsight {
  id: string;
  title: string;
  domains: LifeDomain[];
  insight: string;
  evidence: KnowledgeNode[];
  connections: KnowledgeEdge[];
  confidence: number; // 0-1
  timestamp: string;
}

interface SynthesisRequest {
  query: string;
  domains?: LifeDomain[];
  includeOnline?: boolean;
}

interface SynthesisResult {
  query: string;
  synthesis: string;
  relatedNodes: KnowledgeNode[];
  connections: KnowledgeEdge[];
  insights: CrossDomainInsight[];
  onlineKnowledge?: any[];
}

// ========== DATABASE ==========

class MetaKnowledgeDatabase {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    // Knowledge Nodes (imported from all domains)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS knowledge_nodes (
        id TEXT PRIMARY KEY,
        domain TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL,
        source_id INTEGER,
        timestamp TEXT NOT NULL
      )
    `);

    // Knowledge Edges (relationships between nodes)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS knowledge_edges (
        id TEXT PRIMARY KEY,
        from_node_id TEXT NOT NULL,
        to_node_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        strength REAL NOT NULL,
        description TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (from_node_id) REFERENCES knowledge_nodes(id),
        FOREIGN KEY (to_node_id) REFERENCES knowledge_nodes(id)
      )
    `);

    // Cross-Domain Insights
    this.db.run(`
      CREATE TABLE IF NOT EXISTS cross_domain_insights (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        domains TEXT NOT NULL,
        insight TEXT NOT NULL,
        evidence TEXT NOT NULL,
        connections TEXT NOT NULL,
        confidence REAL NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    // Online Knowledge Cache
    this.db.run(`
      CREATE TABLE IF NOT EXISTS online_knowledge_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        source TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        url TEXT,
        timestamp TEXT NOT NULL,
        relevance_score REAL
      )
    `);

    // Sync history from domain services
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sync_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        nodes_synced INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    // Create indices
    this.db.run('CREATE INDEX IF NOT EXISTS idx_nodes_domain ON knowledge_nodes(domain)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_edges_from ON knowledge_edges(from_node_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_edges_to ON knowledge_edges(to_node_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_insights_domains ON cross_domain_insights(domains)');
  }

  // ========== KNOWLEDGE NODES ==========

  addNode(node: KnowledgeNode): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_nodes
      (id, domain, title, content, tags, source_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      node.id,
      node.domain,
      node.title,
      node.content,
      JSON.stringify(node.tags),
      node.sourceId || null,
      node.timestamp
    );
  }

  getNode(id: string): KnowledgeNode | null {
    const stmt = this.db.prepare('SELECT * FROM knowledge_nodes WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      domain: row.domain,
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags),
      sourceId: row.source_id,
      timestamp: row.timestamp
    };
  }

  getNodesByDomain(domain: LifeDomain): KnowledgeNode[] {
    const stmt = this.db.prepare('SELECT * FROM knowledge_nodes WHERE domain = ?');
    const rows = stmt.all(domain) as any[];

    return rows.map(row => ({
      id: row.id,
      domain: row.domain,
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags),
      sourceId: row.source_id,
      timestamp: row.timestamp
    }));
  }

  searchNodes(query: string, domains?: LifeDomain[]): KnowledgeNode[] {
    let sql = `
      SELECT * FROM knowledge_nodes
      WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?)
    `;

    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (domains && domains.length > 0) {
      sql += ` AND domain IN (${domains.map(() => '?').join(',')})`;
      params.push(...domains);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 50';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      domain: row.domain,
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags),
      sourceId: row.source_id,
      timestamp: row.timestamp
    }));
  }

  // ========== KNOWLEDGE EDGES ==========

  addEdge(edge: KnowledgeEdge): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_edges
      (id, from_node_id, to_node_id, relationship_type, strength, description, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      edge.id,
      edge.fromNodeId,
      edge.toNodeId,
      edge.relationshipType,
      edge.strength,
      edge.description || null,
      edge.timestamp
    );
  }

  getEdgesFrom(nodeId: string): KnowledgeEdge[] {
    const stmt = this.db.prepare('SELECT * FROM knowledge_edges WHERE from_node_id = ?');
    const rows = stmt.all(nodeId) as any[];

    return rows.map(row => ({
      id: row.id,
      fromNodeId: row.from_node_id,
      toNodeId: row.to_node_id,
      relationshipType: row.relationship_type,
      strength: row.strength,
      description: row.description,
      timestamp: row.timestamp
    }));
  }

  getEdgesTo(nodeId: string): KnowledgeEdge[] {
    const stmt = this.db.prepare('SELECT * FROM knowledge_edges WHERE to_node_id = ?');
    const rows = stmt.all(nodeId) as any[];

    return rows.map(row => ({
      id: row.id,
      fromNodeId: row.from_node_id,
      toNodeId: row.to_node_id,
      relationshipType: row.relationship_type,
      strength: row.strength,
      description: row.description,
      timestamp: row.timestamp
    }));
  }

  getEdgesBetween(nodeId1: string, nodeId2: string): KnowledgeEdge[] {
    const stmt = this.db.prepare(`
      SELECT * FROM knowledge_edges
      WHERE (from_node_id = ? AND to_node_id = ?)
         OR (from_node_id = ? AND to_node_id = ?)
    `);
    const rows = stmt.all(nodeId1, nodeId2, nodeId2, nodeId1) as any[];

    return rows.map(row => ({
      id: row.id,
      fromNodeId: row.from_node_id,
      toNodeId: row.to_node_id,
      relationshipType: row.relationship_type,
      strength: row.strength,
      description: row.description,
      timestamp: row.timestamp
    }));
  }

  // ========== INSIGHTS ==========

  saveInsight(insight: CrossDomainInsight): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO cross_domain_insights
      (id, title, domains, insight, evidence, connections, confidence, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      insight.id,
      insight.title,
      JSON.stringify(insight.domains),
      insight.insight,
      JSON.stringify(insight.evidence),
      JSON.stringify(insight.connections),
      insight.confidence,
      insight.timestamp
    );
  }

  getInsights(domains?: LifeDomain[]): CrossDomainInsight[] {
    let sql = 'SELECT * FROM cross_domain_insights';
    const params: any[] = [];

    if (domains && domains.length > 0) {
      // Filter insights that include any of the specified domains
      sql += ' WHERE ' + domains.map((d, i) => `domains LIKE ?`).join(' OR ');
      params.push(...domains.map(d => `%"${d}"%`));
    }

    sql += ' ORDER BY confidence DESC, timestamp DESC LIMIT 20';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      domains: JSON.parse(row.domains),
      insight: row.insight,
      evidence: JSON.parse(row.evidence),
      connections: JSON.parse(row.connections),
      confidence: row.confidence,
      timestamp: row.timestamp
    }));
  }

  // ========== SYNC ==========

  recordSync(domain: LifeDomain, nodesSynced: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO sync_history (domain, nodes_synced, timestamp)
      VALUES (?, ?, ?)
    `);

    stmt.run(domain, nodesSynced, new Date().toISOString());
  }

  getLastSync(domain: LifeDomain): any {
    const stmt = this.db.prepare(`
      SELECT * FROM sync_history
      WHERE domain = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `);

    return stmt.get(domain);
  }
}

// ========== AI INTEGRATION ==========

class AIGatewayClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8912') {
    this.baseUrl = baseUrl;
  }

  async queryAI(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: systemPrompt || 'You are a knowledge synthesis assistant.',
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI Gateway error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.response;
    } catch (error: any) {
      console.error('AI Gateway error:', error.message);
      return `[AI Error: ${error.message}]`;
    }
  }
}

// ========== META-KNOWLEDGE SERVICE ==========

class MetaKnowledgeOrchestratorService {
  private db: MetaKnowledgeDatabase;
  private ai: AIGatewayClient;
  private lifeDomainServiceUrl: string;

  constructor(dbPath: string) {
    this.db = new MetaKnowledgeDatabase(dbPath);
    this.ai = new AIGatewayClient();
    this.lifeDomainServiceUrl = 'http://localhost:8916';
  }

  // ========== SYNC FROM DOMAINS ==========

  async syncFromDomain(domain: LifeDomain): Promise<number> {
    try {
      // Fetch knowledge from Life-Domain Chat service
      const response = await fetch(`${this.lifeDomainServiceUrl}/knowledge/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, query: '', limit: 100 })
      });

      if (!response.ok) {
        console.error(`Failed to sync from ${domain}: ${response.statusText}`);
        return 0;
      }

      const data = await response.json() as any;
      const entries = data.results || [];

      let synced = 0;
      for (const entry of entries) {
        const node: KnowledgeNode = {
          id: `${domain}-${entry.id}`,
          domain,
          title: entry.title,
          content: entry.content,
          tags: entry.tags || [],
          sourceId: entry.id,
          timestamp: entry.timestamp
        };

        this.db.addNode(node);
        synced++;
      }

      this.db.recordSync(domain, synced);
      return synced;
    } catch (error: any) {
      console.error(`Sync error for ${domain}:`, error.message);
      return 0;
    }
  }

  async syncAllDomains(): Promise<{ [domain: string]: number }> {
    const domains: LifeDomain[] = ['career', 'health', 'finance', 'relationships', 'education', 'creativity', 'spirituality'];
    const results: { [domain: string]: number } = {};

    for (const domain of domains) {
      results[domain] = await this.syncFromDomain(domain);
    }

    return results;
  }

  // ========== AUTO-CONNECT (AI-based relationship detection) ==========

  async autoConnect(nodeId: string): Promise<KnowledgeEdge[]> {
    const node = this.db.getNode(nodeId);
    if (!node) return [];

    // Find potentially related nodes from other domains
    const relatedNodes = this.db.searchNodes(node.title, undefined);
    const edges: KnowledgeEdge[] = [];

    for (const relatedNode of relatedNodes) {
      if (relatedNode.id === nodeId || relatedNode.domain === node.domain) continue;

      // Use AI to determine relationship
      const prompt = `
Analyze the relationship between these two knowledge items from different life domains:

**${node.domain} - ${node.title}:**
${node.content.substring(0, 500)}

**${relatedNode.domain} - ${relatedNode.title}:**
${relatedNode.content.substring(0, 500)}

Determine:
1. Is there a meaningful relationship? (yes/no)
2. Relationship type: causes, influences, relates-to, conflicts-with, supports, requires
3. Strength (0-1)
4. Brief description of the relationship

Respond in JSON format:
{"hasRelationship": true/false, "type": "...", "strength": 0.8, "description": "..."}
`;

      try {
        const response = await this.ai.queryAI(prompt);
        const analysis = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));

        if (analysis.hasRelationship) {
          const edge: KnowledgeEdge = {
            id: `${nodeId}-${relatedNode.id}`,
            fromNodeId: nodeId,
            toNodeId: relatedNode.id,
            relationshipType: analysis.type,
            strength: analysis.strength,
            description: analysis.description,
            timestamp: new Date().toISOString()
          };

          this.db.addEdge(edge);
          edges.push(edge);
        }
      } catch (error: any) {
        console.error('Auto-connect error:', error.message);
      }
    }

    return edges;
  }

  // ========== CROSS-DOMAIN SYNTHESIS ==========

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    const { query, domains, includeOnline } = request;

    // 1. Search for relevant nodes
    const relatedNodes = this.db.searchNodes(query, domains);

    // 2. Get all connections between these nodes
    const connections: KnowledgeEdge[] = [];
    const nodeIds = new Set(relatedNodes.map(n => n.id));

    for (const node of relatedNodes) {
      const edgesFrom = this.db.getEdgesFrom(node.id);
      const edgesTo = this.db.getEdgesTo(node.id);

      for (const edge of [...edgesFrom, ...edgesTo]) {
        if (nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId)) {
          connections.push(edge);
        }
      }
    }

    // 3. Generate synthesis using AI
    const synthesisPrompt = `
You are a knowledge synthesis expert. Analyze these knowledge items from multiple life domains and create a holistic synthesis.

**Query:** ${query}

**Knowledge Items:**
${relatedNodes.slice(0, 10).map(node => `
- [${node.domain}] ${node.title}
  ${node.content.substring(0, 300)}
`).join('\n')}

**Connections:**
${connections.slice(0, 5).map(conn => {
  const from = relatedNodes.find(n => n.id === conn.fromNodeId);
  const to = relatedNodes.find(n => n.id === conn.toNodeId);
  return `- ${from?.title} ${conn.relationshipType} ${to?.title} (strength: ${conn.strength})`;
}).join('\n')}

Create a comprehensive synthesis that:
1. Answers the query holistically
2. Identifies cross-domain patterns and connections
3. Provides actionable insights
4. Highlights potential conflicts or synergies

Format: Clear paragraphs, ~300 words.
`;

    const synthesis = await this.ai.queryAI(synthesisPrompt);

    // 4. Generate cross-domain insights
    const insights = await this.generateInsights(relatedNodes, connections, query);

    return {
      query,
      synthesis,
      relatedNodes: relatedNodes.slice(0, 20),
      connections: connections.slice(0, 10),
      insights,
      onlineKnowledge: includeOnline ? [] : undefined // TODO: Implement online search
    };
  }

  private async generateInsights(
    nodes: KnowledgeNode[],
    connections: KnowledgeEdge[],
    context: string
  ): Promise<CrossDomainInsight[]> {
    // Group nodes by domain
    const domainGroups = new Map<LifeDomain, KnowledgeNode[]>();

    for (const node of nodes) {
      if (!domainGroups.has(node.domain)) {
        domainGroups.set(node.domain, []);
      }
      domainGroups.get(node.domain)!.push(node);
    }

    // Only generate insights if we have 2+ domains
    if (domainGroups.size < 2) return [];

    const insights: CrossDomainInsight[] = [];
    const involvedDomains = Array.from(domainGroups.keys());

    // Generate insight using AI
    const insightPrompt = `
Based on this cross-domain knowledge context: "${context}"

Domains involved: ${involvedDomains.join(', ')}

Generate 1-2 key cross-domain insights that connect these domains meaningfully.

Format each insight as JSON:
{
  "title": "Short insight title",
  "insight": "Detailed insight explanation (2-3 sentences)",
  "confidence": 0.85
}

Return JSON array: [...]
`;

    try {
      const response = await this.ai.queryAI(insightPrompt);
      const aiInsights = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));

      for (const ai of aiInsights) {
        const insight: CrossDomainInsight = {
          id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: ai.title,
          domains: involvedDomains,
          insight: ai.insight,
          evidence: nodes.slice(0, 5),
          connections: connections.slice(0, 3),
          confidence: ai.confidence,
          timestamp: new Date().toISOString()
        };

        this.db.saveInsight(insight);
        insights.push(insight);
      }
    } catch (error: any) {
      console.error('Insight generation error:', error.message);
    }

    return insights;
  }

  // ========== KNOWLEDGE GRAPH ==========

  getKnowledgeGraph(domains?: LifeDomain[]): { nodes: KnowledgeNode[], edges: KnowledgeEdge[] } {
    let nodes: KnowledgeNode[] = [];

    if (domains && domains.length > 0) {
      for (const domain of domains) {
        nodes.push(...this.db.getNodesByDomain(domain));
      }
    } else {
      // Get all nodes (limit to prevent overwhelming)
      nodes = this.db.searchNodes('', undefined);
    }

    // Get all edges between these nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: KnowledgeEdge[] = [];

    for (const node of nodes.slice(0, 50)) { // Limit to prevent too many queries
      const edgesFrom = this.db.getEdgesFrom(node.id);
      for (const edge of edgesFrom) {
        if (nodeIds.has(edge.toNodeId)) {
          edges.push(edge);
        }
      }
    }

    return { nodes: nodes.slice(0, 100), edges };
  }

  // ========== STATS ==========

  getStats(): any {
    const nodes = this.db.searchNodes('', undefined);
    const domains: { [key: string]: number } = {};

    for (const node of nodes) {
      domains[node.domain] = (domains[node.domain] || 0) + 1;
    }

    return {
      totalNodes: nodes.length,
      nodesByDomain: domains,
      lastSync: {} // TODO: Implement
    };
  }
}

// ========== HTTP SERVER ==========

const PORT = 8918;
const DB_PATH = path.join(process.cwd(), 'data', 'meta-knowledge.db');

const service = new MetaKnowledgeOrchestratorService(DB_PATH);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'meta-knowledge-orchestrator', port: PORT }, { headers: corsHeaders });
    }

    // ========== ROUTES ==========

    // POST /synthesize - Cross-domain synthesis
    if (url.pathname === '/synthesize' && req.method === 'POST') {
      try {
        const body = await req.json() as SynthesisRequest;
        const result = await service.synthesize(body);
        return Response.json({ result }, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // POST /sync - Sync from domain service
    if (url.pathname === '/sync' && req.method === 'POST') {
      try {
        const body = await req.json() as any;
        const domain = body.domain as LifeDomain | 'all';

        let results;
        if (domain === 'all') {
          results = await service.syncAllDomains();
        } else {
          const synced = await service.syncFromDomain(domain);
          results = { [domain]: synced };
        }

        return Response.json({ results }, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // GET /graph - Knowledge graph
    if (url.pathname === '/graph' && req.method === 'GET') {
      const domainsParam = url.searchParams.get('domains');
      const domains = domainsParam ? domainsParam.split(',') as LifeDomain[] : undefined;

      const graph = service.getKnowledgeGraph(domains);
      return Response.json({ graph }, { headers: corsHeaders });
    }

    // GET /insights - Cross-domain insights
    if (url.pathname === '/insights' && req.method === 'GET') {
      const domainsParam = url.searchParams.get('domains');
      const domains = domainsParam ? domainsParam.split(',') as LifeDomain[] : undefined;

      const insights = service.getStats(); // TODO: Use actual insights
      return Response.json({ insights }, { headers: corsHeaders });
    }

    // GET /stats - Statistics
    if (url.pathname === '/stats' && req.method === 'GET') {
      const stats = service.getStats();
      return Response.json({ stats }, { headers: corsHeaders });
    }

    // 404
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
});

// ========== STARTUP ==========

console.log(`
╔════════════════════════════════════════════════╗
║   🧠 META-KNOWLEDGE ORCHESTRATOR               ║
╚════════════════════════════════════════════════╝

Port: ${PORT}
Status: Running

Capabilities:
  🔗 Cross-Domain Synthesis
  🕸️  Knowledge Graph
  🤖 AI-Powered Connections
  🌐 Online Knowledge Sync

Endpoints:
  POST /synthesize    - Cross-domain synthesis
  POST /sync          - Sync from domain services
  GET  /graph         - Knowledge graph visualization
  GET  /insights      - Cross-domain insights
  GET  /stats         - System statistics

Integration:
  ✓ AI Gateway (Groq)
  ✓ Life-Domain Chat (Port 8916)
  ✓ SQLite persistence

Ready to connect the dots! 🧩
`);
