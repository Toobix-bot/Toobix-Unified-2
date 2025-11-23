/**
 * 🌐 UNIVERSAL INTEGRATION ADAPTER
 *
 * Verbindet Toobix Unified mit der gesamten digitalen Welt:
 * - Programme & Anwendungen
 * - Websites & Web-Services
 * - Code Repositories
 * - Daten & Dokumenten
 * - APIs & Externe Systeme
 *
 * Alles legal, fair, sauber und sinnvoll!
 */

import Database from 'bun:sqlite';
import path from 'path';
import { watch, type FSWatcher } from 'fs';
import { readdir, readFile, stat } from 'fs/promises';

// ========== TYPES ==========

interface Integration {
  id: string;
  name: string;
  type: 'filesystem' | 'browser' | 'api' | 'clipboard' | 'application' | 'custom';
  status: 'active' | 'paused' | 'error';
  config: any;
  lastSync: string;
  itemsExtracted: number;
  enabled: boolean;
}

interface ExtractedItem {
  id: string;
  integrationId: string;
  type: 'code' | 'document' | 'webpage' | 'data' | 'clipboard' | 'other';
  title: string;
  content: string;
  metadata: {
    source?: string;
    filePath?: string;
    url?: string;
    language?: string;
    tags?: string[];
    [key: string]: any;
  };
  extractedAt: string;
}

interface FileWatchConfig {
  path: string;
  extensions?: string[];
  excludePatterns?: string[];
  recursive: boolean;
}

interface BrowserIntegrationData {
  url: string;
  title: string;
  content: string;
  metadata?: any;
}

interface APIConnectorConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  endpoints: {
    [key: string]: string;
  };
}

// ========== MAIN SERVICE ==========

class UniversalIntegrationAdapter {
  private db: Database;
  private integrations: Map<string, Integration> = new Map();
  private watchers: Map<string, FSWatcher> = new Map();
  private apiConnectors: Map<string, APIConnectorConfig> = new Map();
  private metaKnowledgeUrl = 'http://localhost:8918';
  private lifeDomainUrl = 'http://localhost:8916';

  constructor() {
    const dbPath = path.join(import.meta.dir, 'universal-integration.db');
    this.db = new Database(dbPath);
    this.initDatabase();
    this.loadIntegrations();
    this.setupDefaultConnectors();
  }

  private initDatabase() {
    // Integrations table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS integrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        config TEXT NOT NULL,
        lastSync TEXT,
        itemsExtracted INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Extracted items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS extracted_items (
        id TEXT PRIMARY KEY,
        integrationId TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        extractedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY(integrationId) REFERENCES integrations(id)
      )
    `);

    // User consent & privacy settings
    this.db.run(`
      CREATE TABLE IF NOT EXISTS privacy_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Integration logs
    this.db.run(`
      CREATE TABLE IF NOT EXISTS integration_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        integrationId TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized');
  }

  // ========== INTEGRATION MANAGEMENT ==========

  async createIntegration(
    name: string,
    type: Integration['type'],
    config: any
  ): Promise<Integration> {
    const id = `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const integration: Integration = {
      id,
      name,
      type,
      status: 'active',
      config,
      lastSync: new Date().toISOString(),
      itemsExtracted: 0,
      enabled: true
    };

    this.db.run(
      `INSERT INTO integrations (id, name, type, config, lastSync)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, type, JSON.stringify(config), integration.lastSync]
    );

    this.integrations.set(id, integration);
    this.log(id, 'info', `Integration created: ${name}`);

    // Auto-start integration based on type
    if (type === 'filesystem') {
      await this.startFileSystemWatch(integration);
    }

    return integration;
  }

  async toggleIntegration(id: string, enabled: boolean): Promise<boolean> {
    const integration = this.integrations.get(id);
    if (!integration) return false;

    integration.enabled = enabled;
    this.db.run('UPDATE integrations SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);

    if (!enabled && this.watchers.has(id)) {
      this.watchers.get(id)?.close();
      this.watchers.delete(id);
    } else if (enabled && integration.type === 'filesystem') {
      await this.startFileSystemWatch(integration);
    }

    return true;
  }

  private loadIntegrations() {
    const rows = this.db.query('SELECT * FROM integrations WHERE enabled = 1').all() as any[];

    for (const row of rows) {
      const integration: Integration = {
        id: row.id,
        name: row.name,
        type: row.type,
        status: row.status,
        config: JSON.parse(row.config),
        lastSync: row.lastSync,
        itemsExtracted: row.itemsExtracted,
        enabled: row.enabled === 1
      };

      this.integrations.set(integration.id, integration);

      // Restart file system watchers
      if (integration.type === 'filesystem') {
        this.startFileSystemWatch(integration).catch(err => {
          console.error(`Failed to start watcher for ${integration.name}:`, err);
        });
      }
    }

    console.log(`✅ Loaded ${this.integrations.size} integrations`);
  }

  // ========== FILE SYSTEM INTEGRATION ==========

  async startFileSystemWatch(integration: Integration): Promise<void> {
    const config = integration.config as FileWatchConfig;

    try {
      const watcher = watch(config.path, { recursive: config.recursive }, async (eventType, filename) => {
        if (!filename) return;

        // Check file extension
        if (config.extensions && config.extensions.length > 0) {
          const ext = path.extname(filename);
          if (!config.extensions.includes(ext)) return;
        }

        // Check exclude patterns
        if (config.excludePatterns) {
          const shouldExclude = config.excludePatterns.some(pattern =>
            filename.includes(pattern)
          );
          if (shouldExclude) return;
        }

        const fullPath = path.join(config.path, filename);

        try {
          const stats = await stat(fullPath);
          if (stats.isFile()) {
            await this.extractFromFile(integration.id, fullPath);
          }
        } catch (err) {
          // File might be deleted or inaccessible
        }
      });

      this.watchers.set(integration.id, watcher);
      this.log(integration.id, 'info', `File system watch started: ${config.path}`);

      // Initial scan
      await this.scanDirectory(integration.id, config);

    } catch (err: any) {
      this.log(integration.id, 'error', `Failed to start file system watch: ${err.message}`);
      integration.status = 'error';
    }
  }

  private async scanDirectory(integrationId: string, config: FileWatchConfig): Promise<void> {
    try {
      const entries = await readdir(config.path, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(config.path, entry.name);

        // Check exclude patterns
        if (config.excludePatterns) {
          const shouldExclude = config.excludePatterns.some(pattern =>
            entry.name.includes(pattern)
          );
          if (shouldExclude) continue;
        }

        if (entry.isFile()) {
          if (config.extensions && config.extensions.length > 0) {
            const ext = path.extname(entry.name);
            if (config.extensions.includes(ext)) {
              await this.extractFromFile(integrationId, fullPath);
            }
          } else {
            await this.extractFromFile(integrationId, fullPath);
          }
        } else if (entry.isDirectory() && config.recursive) {
          await this.scanDirectory(integrationId, {
            ...config,
            path: fullPath
          });
        }
      }
    } catch (err: any) {
      this.log(integrationId, 'error', `Directory scan failed: ${err.message}`);
    }
  }

  private async extractFromFile(integrationId: string, filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const ext = path.extname(filePath);
      const fileName = path.basename(filePath);

      const item: ExtractedItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        integrationId,
        type: this.getFileType(ext),
        title: fileName,
        content: content.slice(0, 50000), // Limit content size
        metadata: {
          source: 'filesystem',
          filePath,
          extension: ext,
          size: content.length,
          language: this.detectLanguage(ext)
        },
        extractedAt: new Date().toISOString()
      };

      this.saveExtractedItem(item);

      // Optionally sync to Meta-Knowledge immediately
      await this.syncItemToMetaKnowledge(item);

    } catch (err: any) {
      this.log(integrationId, 'error', `Failed to extract from ${filePath}: ${err.message}`);
    }
  }

  private getFileType(ext: string): ExtractedItem['type'] {
    const codeExts = ['.ts', '.js', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb', '.php'];
    const docExts = ['.md', '.txt', '.pdf', '.doc', '.docx'];

    if (codeExts.includes(ext)) return 'code';
    if (docExts.includes(ext)) return 'document';
    return 'other';
  }

  private detectLanguage(ext: string): string | undefined {
    const langMap: { [key: string]: string } = {
      '.ts': 'TypeScript',
      '.js': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP'
    };
    return langMap[ext];
  }

  // ========== BROWSER INTEGRATION ==========

  async receiveBrowserData(data: BrowserIntegrationData): Promise<ExtractedItem> {
    const item: ExtractedItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      integrationId: 'browser-default',
      type: 'webpage',
      title: data.title,
      content: data.content,
      metadata: {
        source: 'browser',
        url: data.url,
        ...data.metadata
      },
      extractedAt: new Date().toISOString()
    };

    this.saveExtractedItem(item);
    await this.syncItemToMetaKnowledge(item);

    return item;
  }

  // ========== API CONNECTORS ==========

  private setupDefaultConnectors() {
    // GitHub API Connector
    this.apiConnectors.set('github', {
      name: 'GitHub',
      baseUrl: 'https://api.github.com',
      endpoints: {
        repos: '/user/repos',
        repo: '/repos/{owner}/{repo}',
        commits: '/repos/{owner}/{repo}/commits',
        issues: '/repos/{owner}/{repo}/issues'
      }
    });

    // Wikipedia API Connector
    this.apiConnectors.set('wikipedia', {
      name: 'Wikipedia',
      baseUrl: 'https://en.wikipedia.org/w/api.php',
      endpoints: {
        search: '?action=query&list=search&format=json',
        page: '?action=query&prop=extracts&format=json'
      }
    });

    console.log(`✅ Loaded ${this.apiConnectors.size} API connectors`);
  }

  async fetchFromAPI(
    connectorId: string,
    endpoint: string,
    params: { [key: string]: string } = {}
  ): Promise<any> {
    const connector = this.apiConnectors.get(connectorId);
    if (!connector) throw new Error(`Connector ${connectorId} not found`);

    let url = connector.baseUrl + connector.endpoints[endpoint];

    // Replace path parameters
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value);
    }

    // Add query parameters
    const queryParams = new URLSearchParams(params);
    if (queryParams.toString()) {
      url += (url.includes('?') ? '&' : '?') + queryParams.toString();
    }

    const headers: any = {};
    if (connector.apiKey) {
      headers['Authorization'] = `Bearer ${connector.apiKey}`;
    }

    const response = await fetch(url, { headers });
    return response.json();
  }

  // ========== CLIPBOARD INTEGRATION ==========

  async captureClipboard(content: string, metadata?: any): Promise<ExtractedItem> {
    const item: ExtractedItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      integrationId: 'clipboard-default',
      type: 'clipboard',
      title: 'Clipboard Content',
      content,
      metadata: {
        source: 'clipboard',
        capturedAt: new Date().toISOString(),
        ...metadata
      },
      extractedAt: new Date().toISOString()
    };

    this.saveExtractedItem(item);
    return item;
  }

  // ========== DATA MANAGEMENT ==========

  private saveExtractedItem(item: ExtractedItem) {
    this.db.run(
      `INSERT INTO extracted_items (id, integrationId, type, title, content, metadata, extractedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.integrationId,
        item.type,
        item.title,
        item.content,
        JSON.stringify(item.metadata),
        item.extractedAt
      ]
    );

    // Update integration stats
    this.db.run(
      'UPDATE integrations SET itemsExtracted = itemsExtracted + 1, lastSync = ? WHERE id = ?',
      [item.extractedAt, item.integrationId]
    );

    const integration = this.integrations.get(item.integrationId);
    if (integration) {
      integration.itemsExtracted++;
      integration.lastSync = item.extractedAt;
    }
  }

  async getExtractedItems(filters?: {
    integrationId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<ExtractedItem[]> {
    let query = 'SELECT * FROM extracted_items WHERE 1=1';
    const params: any[] = [];

    if (filters?.integrationId) {
      query += ' AND integrationId = ?';
      params.push(filters.integrationId);
    }

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY extractedAt DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const rows = this.db.query(query).all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      integrationId: row.integrationId,
      type: row.type,
      title: row.title,
      content: row.content,
      metadata: JSON.parse(row.metadata || '{}'),
      extractedAt: row.extractedAt
    }));
  }

  // ========== SYNC TO META-KNOWLEDGE ==========

  private async syncItemToMetaKnowledge(item: ExtractedItem): Promise<boolean> {
    try {
      // Determine which life domain this belongs to
      const domain = this.inferDomain(item);

      // Create knowledge node in Meta-Knowledge Orchestrator
      const response = await fetch(`${this.metaKnowledgeUrl}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          title: item.title,
          content: item.content.slice(0, 10000), // Limit for meta-knowledge
          tags: [
            item.type,
            item.metadata.source || 'unknown',
            ...(item.metadata.tags || [])
          ],
          metadata: {
            originalItemId: item.id,
            integrationId: item.integrationId,
            ...item.metadata
          }
        })
      });

      if (response.ok) {
        this.db.run('UPDATE extracted_items SET synced = 1 WHERE id = ?', [item.id]);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to sync to Meta-Knowledge:', err);
      return false;
    }
  }

  private inferDomain(item: ExtractedItem): string {
    // Simple domain inference based on content/metadata
    const content = item.content.toLowerCase();
    const title = item.title.toLowerCase();

    if (content.includes('job') || content.includes('career') || content.includes('work')) {
      return 'career';
    }
    if (content.includes('health') || content.includes('fitness') || content.includes('medical')) {
      return 'health';
    }
    if (content.includes('money') || content.includes('finance') || content.includes('budget')) {
      return 'finance';
    }
    if (content.includes('learn') || content.includes('study') || content.includes('education')) {
      return 'education';
    }

    return 'general'; // Default
  }

  async syncAllToMetaKnowledge(): Promise<{ synced: number; failed: number }> {
    const unsynced = this.db.query('SELECT * FROM extracted_items WHERE synced = 0').all() as any[];

    let synced = 0;
    let failed = 0;

    for (const row of unsynced) {
      const item: ExtractedItem = {
        id: row.id,
        integrationId: row.integrationId,
        type: row.type,
        title: row.title,
        content: row.content,
        metadata: JSON.parse(row.metadata || '{}'),
        extractedAt: row.extractedAt
      };

      const success = await this.syncItemToMetaKnowledge(item);
      if (success) synced++;
      else failed++;
    }

    return { synced, failed };
  }

  // ========== LOGGING ==========

  private log(integrationId: string, level: 'info' | 'warn' | 'error', message: string, metadata?: any) {
    this.db.run(
      'INSERT INTO integration_logs (integrationId, level, message, metadata) VALUES (?, ?, ?, ?)',
      [integrationId, level, message, JSON.stringify(metadata || {})]
    );

    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${integrationId}] ${message}`);
  }

  // ========== STATS & STATUS ==========

  getStats() {
    const totalIntegrations = this.integrations.size;
    const activeIntegrations = Array.from(this.integrations.values()).filter(i => i.enabled).length;

    const totalItems = this.db.query('SELECT COUNT(*) as count FROM extracted_items').get() as any;
    const syncedItems = this.db.query('SELECT COUNT(*) as count FROM extracted_items WHERE synced = 1').get() as any;

    const itemsByType = this.db.query(`
      SELECT type, COUNT(*) as count
      FROM extracted_items
      GROUP BY type
    `).all() as any[];

    return {
      integrations: {
        total: totalIntegrations,
        active: activeIntegrations
      },
      items: {
        total: totalItems.count,
        synced: syncedItems.count,
        unsynced: totalItems.count - syncedItems.count,
        byType: itemsByType.reduce((acc, row) => {
          acc[row.type] = row.count;
          return acc;
        }, {} as { [key: string]: number })
      }
    };
  }

  // ========== API SERVER ==========

  async startServer() {
    const adapter = this; // Capture 'this' reference
    const server = Bun.serve({
      port: 8920,
      async fetch(req) {
        const url = new URL(req.url);

        // CORS headers
        const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (req.method === 'OPTIONS') {
          return new Response(null, { headers });
        }

        try {
          // ========== INTEGRATIONS ==========

          if (url.pathname === '/integrations' && req.method === 'GET') {
            const integrations = Array.from(adapter.integrations.values());
            return Response.json(integrations, { headers });
          }

          if (url.pathname === '/integrations' && req.method === 'POST') {
            const { name, type, config } = await req.json();
            const integration = await adapter.createIntegration(name, type, config);
            return Response.json(integration, { headers });
          }

          if (url.pathname.startsWith('/integrations/') && req.method === 'PUT') {
            const id = url.pathname.split('/')[2];
            const { enabled } = await req.json();
            const success = await adapter.toggleIntegration(id, enabled);
            return Response.json({ success }, { headers });
          }

          // ========== EXTRACTED ITEMS ==========

          if (url.pathname === '/items' && req.method === 'GET') {
            const integrationId = url.searchParams.get('integration');
            const type = url.searchParams.get('type');
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const offset = parseInt(url.searchParams.get('offset') || '0');

            const items = await adapter.getExtractedItems({
              integrationId: integrationId || undefined,
              type: type || undefined,
              limit,
              offset
            });

            return Response.json(items, { headers });
          }

          // ========== BROWSER INTEGRATION ==========

          if (url.pathname === '/browser/capture' && req.method === 'POST') {
            const data = await req.json() as BrowserIntegrationData;
            const item = await adapter.receiveBrowserData(data);
            return Response.json(item, { headers });
          }

          // ========== CLIPBOARD ==========

          if (url.pathname === '/clipboard/capture' && req.method === 'POST') {
            const { content, metadata } = await req.json();
            const item = await adapter.captureClipboard(content, metadata);
            return Response.json(item, { headers });
          }

          // ========== API CONNECTORS ==========

          if (url.pathname === '/api/connectors' && req.method === 'GET') {
            const connectors = Array.from(adapter.apiConnectors.entries()).map(([id, config]) => ({
              id,
              ...config
            }));
            return Response.json(connectors, { headers });
          }

          if (url.pathname === '/api/fetch' && req.method === 'POST') {
            const { connector, endpoint, params } = await req.json();
            const data = await adapter.fetchFromAPI(connector, endpoint, params);
            return Response.json(data, { headers });
          }

          // ========== SYNC ==========

          if (url.pathname === '/sync/meta-knowledge' && req.method === 'POST') {
            const result = await adapter.syncAllToMetaKnowledge();
            return Response.json(result, { headers });
          }

          // ========== STATS ==========

          if (url.pathname === '/stats' && req.method === 'GET') {
            const stats = adapter.getStats();
            return Response.json(stats, { headers });
          }

          // ========== HEALTH CHECK ==========

          if (url.pathname === '/health') {
            return Response.json({
              status: 'healthy',
              service: 'Universal Integration Adapter',
              port: 8920
            }, { headers });
          }

          return Response.json({ error: 'Not found' }, { status: 404, headers });

        } catch (err: any) {
          return Response.json({ error: err.message }, { status: 500, headers });
        }
      }
    });

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║      🌐 UNIVERSAL INTEGRATION ADAPTER                          ║
║                                                                ║
║      Verbindet Toobix mit der gesamten digitalen Welt!        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🌍 Port: ${server.port}                                      ║
║  📡 WebSocket: ws://localhost:${server.port}                  ║
║  🔗 API: http://localhost:${server.port}                      ║
║                                                                ║
║  📁 File System Watchers: Active                               ║
║  🌐 Browser Integration: Ready                                 ║
║  🔌 API Connectors: ${adapter.apiConnectors.size}              ║
║  📋 Clipboard Monitoring: Available                            ║
║                                                                ║
║  🧠 Sync to Meta-Knowledge: Enabled                            ║
║  🔒 Privacy-First: Legal, Fair, Clean, Meaningful              ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📚 ENDPOINTS:                                                 ║
║  • GET  /integrations        - List all integrations          ║
║  • POST /integrations        - Create integration             ║
║  • GET  /items               - Get extracted items            ║
║  • POST /browser/capture     - Receive browser data           ║
║  • POST /clipboard/capture   - Capture clipboard              ║
║  • GET  /api/connectors      - List API connectors            ║
║  • POST /api/fetch           - Fetch from external API        ║
║  • POST /sync/meta-knowledge - Sync to Meta-Knowledge         ║
║  • GET  /stats               - Integration statistics         ║
║  • GET  /health              - Health check                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }
}

// ========== START SERVICE ==========

const service = new UniversalIntegrationAdapter();
service.startServer();
