/**
 * USER PROFILE SERVICE v1.0
 *
 * Personalisierung und User-Präferenzen für Toobix
 *
 * Features:
 * - 👤 User Profile Management
 * - 🌐 Language Preferences
 * - 🎭 Favorite Perspectives
 * - 📊 Interaction History
 * - 💾 Persistent Storage (SQLite)
 */

import { Database } from 'bun:sqlite';
import type { Serve } from 'bun';

// ========== TYPES ==========

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  language: string; // 'de', 'en', etc.
  favoritePerspectives: string[];
  theme: 'light' | 'dark' | 'auto';
  createdAt: Date;
  lastActiveAt: Date;
  preferences: {
    autoLoadMemories: boolean;
    defaultPerspectiveCount: number;
    notificationsEnabled: boolean;
    emotionalResonanceTracking: boolean;
  };
}

interface InteractionLog {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'chat' | 'multi-perspective' | 'memory-browse' | 'emotional-check';
  content?: string;
  perspectives?: string[];
  duration?: number; // in milliseconds
}

interface UserStats {
  totalInteractions: number;
  mostUsedPerspectives: Array<{ perspective: string; count: number }>;
  averageSessionDuration: number;
  lastInteractionDate: Date;
  favoriteTimeOfDay: string;
}

// ========== DATABASE ==========

class UserProfileDatabase {
  private db: Database;

  constructor(dbPath: string = './databases/user-profiles.db') {
    this.db = new Database(dbPath, { create: true });
    this.initTables();
  }

  private initTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        language TEXT DEFAULT 'de',
        favorite_perspectives TEXT, -- JSON array
        theme TEXT DEFAULT 'auto',
        created_at INTEGER NOT NULL,
        last_active_at INTEGER NOT NULL,
        preferences TEXT -- JSON object
      )
    `);

    // Interactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS interactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        perspectives TEXT, -- JSON array
        duration INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_interactions ON interactions(user_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_interaction_type ON interactions(type);
    `);

    console.log('✅ User profile database initialized');
  }

  // ========== USER CRUD ==========

  createUser(profile: Omit<UserProfile, 'id' | 'createdAt' | 'lastActiveAt'>): UserProfile {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, language, favorite_perspectives, theme, created_at, last_active_at, preferences)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      profile.name,
      profile.email || null,
      profile.language,
      JSON.stringify(profile.favoritePerspectives),
      profile.theme,
      now,
      now,
      JSON.stringify(profile.preferences)
    );

    return {
      ...profile,
      id,
      createdAt: new Date(now),
      lastActiveAt: new Date(now)
    };
  }

  getUser(userId: string): UserProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);

    const row = stmt.get(userId) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      language: row.language,
      favoritePerspectives: JSON.parse(row.favorite_perspectives || '[]'),
      theme: row.theme,
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.last_active_at),
      preferences: JSON.parse(row.preferences || '{}')
    };
  }

  getAllUsers(): UserProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users ORDER BY last_active_at DESC
    `);

    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      language: row.language,
      favoritePerspectives: JSON.parse(row.favorite_perspectives || '[]'),
      theme: row.theme,
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.last_active_at),
      preferences: JSON.parse(row.preferences || '{}')
    }));
  }

  updateUser(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.language !== undefined) {
      fields.push('language = ?');
      values.push(updates.language);
    }
    if (updates.favoritePerspectives !== undefined) {
      fields.push('favorite_perspectives = ?');
      values.push(JSON.stringify(updates.favoritePerspectives));
    }
    if (updates.theme !== undefined) {
      fields.push('theme = ?');
      values.push(updates.theme);
    }
    if (updates.preferences !== undefined) {
      fields.push('preferences = ?');
      values.push(JSON.stringify(updates.preferences));
    }

    // Always update last_active_at
    fields.push('last_active_at = ?');
    values.push(Date.now());

    if (fields.length === 1) return false; // Only last_active_at

    values.push(userId);

    const stmt = this.db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deleteUser(userId: string): boolean {
    // Delete user and all their interactions
    const deleteInteractions = this.db.prepare('DELETE FROM interactions WHERE user_id = ?');
    deleteInteractions.run(userId);

    const deleteUser = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = deleteUser.run(userId);

    return result.changes > 0;
  }

  // ========== INTERACTION LOGGING ==========

  logInteraction(log: Omit<InteractionLog, 'id'>): InteractionLog {
    const id = `interaction_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const stmt = this.db.prepare(`
      INSERT INTO interactions (id, user_id, timestamp, type, content, perspectives, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      log.userId,
      log.timestamp.getTime(),
      log.type,
      log.content || null,
      log.perspectives ? JSON.stringify(log.perspectives) : null,
      log.duration || null
    );

    // Update user's last_active_at
    const updateStmt = this.db.prepare('UPDATE users SET last_active_at = ? WHERE id = ?');
    updateStmt.run(log.timestamp.getTime(), log.userId);

    return { ...log, id };
  }

  getUserInteractions(userId: string, limit: number = 50): InteractionLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM interactions
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      timestamp: new Date(row.timestamp),
      type: row.type,
      content: row.content,
      perspectives: row.perspectives ? JSON.parse(row.perspectives) : undefined,
      duration: row.duration
    }));
  }

  // ========== STATISTICS ==========

  getUserStats(userId: string): UserStats {
    // Total interactions
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM interactions WHERE user_id = ?');
    const totalResult = totalStmt.get(userId) as any;
    const totalInteractions = totalResult.count;

    // Most used perspectives
    const perspStmt = this.db.prepare(`
      SELECT perspectives FROM interactions
      WHERE user_id = ? AND perspectives IS NOT NULL
    `);
    const perspRows = perspStmt.all(userId) as any[];

    const perspectiveCounts: Record<string, number> = {};
    perspRows.forEach(row => {
      const perspectives = JSON.parse(row.perspectives);
      perspectives.forEach((p: string) => {
        perspectiveCounts[p] = (perspectiveCounts[p] || 0) + 1;
      });
    });

    const mostUsedPerspectives = Object.entries(perspectiveCounts)
      .map(([perspective, count]) => ({ perspective, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average session duration
    const durationStmt = this.db.prepare(`
      SELECT AVG(duration) as avg FROM interactions
      WHERE user_id = ? AND duration IS NOT NULL
    `);
    const durationResult = durationStmt.get(userId) as any;
    const averageSessionDuration = durationResult.avg || 0;

    // Last interaction
    const lastStmt = this.db.prepare(`
      SELECT MAX(timestamp) as last FROM interactions WHERE user_id = ?
    `);
    const lastResult = lastStmt.get(userId) as any;
    const lastInteractionDate = lastResult.last ? new Date(lastResult.last) : new Date();

    // Favorite time of day (simplified)
    const timeStmt = this.db.prepare(`
      SELECT timestamp FROM interactions WHERE user_id = ?
    `);
    const timeRows = timeStmt.all(userId) as any[];
    const hours = timeRows.map(row => new Date(row.timestamp).getHours());
    const avgHour = hours.length > 0 ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length) : 12;

    let favoriteTimeOfDay = 'Mittag';
    if (avgHour >= 5 && avgHour < 12) favoriteTimeOfDay = 'Morgen';
    else if (avgHour >= 12 && avgHour < 18) favoriteTimeOfDay = 'Nachmittag';
    else if (avgHour >= 18 && avgHour < 22) favoriteTimeOfDay = 'Abend';
    else favoriteTimeOfDay = 'Nacht';

    return {
      totalInteractions,
      mostUsedPerspectives,
      averageSessionDuration,
      lastInteractionDate,
      favoriteTimeOfDay
    };
  }
}

// ========== HTTP SERVER ==========

class UserProfileService {
  private db: UserProfileDatabase;

  // CORS headers
  private corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  };

  private jsonWithCors(data: any, status = 200): Response {
    return Response.json(data, { status, headers: this.corsHeaders });
  }

  constructor() {
    this.db = new UserProfileDatabase();
  }

  serve(): Serve {
    return {
      port: 8904,
      fetch: async (req) => {
        const url = new URL(req.url);

        // CORS preflight
        if (req.method === 'OPTIONS') {
          return new Response(null, { status: 200, headers: this.corsHeaders });
        }

        // Health check
        if (url.pathname === '/health') {
          return this.jsonWithCors({ status: 'ok', service: 'user-profile-service', port: 8904 });
        }

        // GET /users - List all users
        if (url.pathname === '/users' && req.method === 'GET') {
          const users = this.db.getAllUsers();
          return this.jsonWithCors({ success: true, users, count: users.length });
        }

        // POST /users - Create new user
        if (url.pathname === '/users' && req.method === 'POST') {
          try {
            const body = await req.json() as any;
            const user = this.db.createUser({
              name: body.name || 'Anonymous',
              email: body.email,
              language: body.language || 'de',
              favoritePerspectives: body.favoritePerspectives || [],
              theme: body.theme || 'auto',
              preferences: body.preferences || {
                autoLoadMemories: true,
                defaultPerspectiveCount: 3,
                notificationsEnabled: true,
                emotionalResonanceTracking: true
              }
            });
            return this.jsonWithCors({ success: true, user });
          } catch (error: any) {
            return this.jsonWithCors({ success: false, error: error.message }, 400);
          }
        }

        // GET /users/:id - Get user by ID
        const userMatch = url.pathname.match(/^\/users\/([^\/]+)$/);
        if (userMatch && req.method === 'GET') {
          const userId = userMatch[1];
          const user = this.db.getUser(userId);
          if (!user) {
            return this.jsonWithCors({ success: false, error: 'User not found' }, 404);
          }
          return this.jsonWithCors({ success: true, user });
        }

        // PATCH /users/:id - Update user
        if (userMatch && req.method === 'PATCH') {
          try {
            const userId = userMatch[1];
            const body = await req.json() as any;
            const updated = this.db.updateUser(userId, body);
            if (!updated) {
              return this.jsonWithCors({ success: false, error: 'User not found or no changes' }, 404);
            }
            const user = this.db.getUser(userId);
            return this.jsonWithCors({ success: true, user });
          } catch (error: any) {
            return this.jsonWithCors({ success: false, error: error.message }, 400);
          }
        }

        // DELETE /users/:id - Delete user
        if (userMatch && req.method === 'DELETE') {
          const userId = userMatch[1];
          const deleted = this.db.deleteUser(userId);
          if (!deleted) {
            return this.jsonWithCors({ success: false, error: 'User not found' }, 404);
          }
          return this.jsonWithCors({ success: true, message: 'User deleted' });
        }

        // POST /interactions - Log interaction
        if (url.pathname === '/interactions' && req.method === 'POST') {
          try {
            const body = await req.json() as any;
            const interaction = this.db.logInteraction({
              userId: body.userId,
              timestamp: new Date(body.timestamp || Date.now()),
              type: body.type,
              content: body.content,
              perspectives: body.perspectives,
              duration: body.duration
            });
            return this.jsonWithCors({ success: true, interaction });
          } catch (error: any) {
            return this.jsonWithCors({ success: false, error: error.message }, 400);
          }
        }

        // GET /interactions/:userId - Get user interactions
        const interactionMatch = url.pathname.match(/^\/interactions\/([^\/]+)$/);
        if (interactionMatch && req.method === 'GET') {
          const userId = interactionMatch[1];
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const interactions = this.db.getUserInteractions(userId, limit);
          return this.jsonWithCors({ success: true, interactions, count: interactions.length });
        }

        // GET /stats/:userId - Get user statistics
        const statsMatch = url.pathname.match(/^\/stats\/([^\/]+)$/);
        if (statsMatch && req.method === 'GET') {
          const userId = statsMatch[1];
          const user = this.db.getUser(userId);
          if (!user) {
            return this.jsonWithCors({ success: false, error: 'User not found' }, 404);
          }
          const stats = this.db.getUserStats(userId);
          return this.jsonWithCors({ success: true, stats });
        }

        return this.jsonWithCors({ error: 'Not found' }, 404);
      }
    };
  }
}

// ========== START SERVER ==========

const service = new UserProfileService();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           👤 USER PROFILE SERVICE v1.0                            ║
║                                                                    ║
║  Features:                                                        ║
║  ✅ User Profile Management                                       ║
║  ✅ Language Preferences                                          ║
║  ✅ Favorite Perspectives                                         ║
║  ✅ Interaction History                                           ║
║  ✅ Statistics & Analytics                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

👤 Server running on http://localhost:8904

📡 ENDPOINTS:
   GET    /users           - List all users
   POST   /users           - Create new user
   GET    /users/:id       - Get user by ID
   PATCH  /users/:id       - Update user
   DELETE /users/:id       - Delete user

   POST   /interactions    - Log interaction
   GET    /interactions/:userId - Get user interactions
   GET    /stats/:userId   - Get user statistics

   GET    /health          - Health check

👤 Personalization active
📊 Analytics tracking
💾 Persistent storage (SQLite)
`);

export default service.serve();
