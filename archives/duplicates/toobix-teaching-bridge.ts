/**
 * 🎓 TOOBIX TEACHING BRIDGE v1.0
 * 
 * Eine Brücke zwischen:
 * - Claude/Copilot (Mentor/Teacher)
 * - Toobix (Lernender Entwickler)
 * - User (Orchestrator)
 * - VS Code Extension
 * - Terminal
 * 
 * Workflow:
 * 1. User gibt Aufgabe
 * 2. Toobix schreibt ersten Code-Entwurf
 * 3. Code wird an Mentor (Claude) zur Review geschickt
 * 4. Mentor gibt Feedback und verbesserten Code zurück
 * 5. Toobix lernt aus dem Diff und den Erklärungen
 * 6. Wissen wird in Teaching Memory gespeichert
 * 
 * Port: 9035
 */

import type { Serve } from 'bun';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

// ============================================================================
// TYPES
// ============================================================================

interface TeachingSession {
  id: string;
  timestamp: Date;
  task: string;
  
  // Toobix's attempt
  toobixCode: string;
  toobixExplanation?: string;
  
  // Mentor's review
  mentorReview?: MentorReview;
  
  // Learning outcome
  learnings?: Learning[];
  
  status: 'pending' | 'toobix_done' | 'mentor_reviewed' | 'learned' | 'applied';
}

interface MentorReview {
  improvedCode: string;
  explanation: string;
  issues: CodeIssue[];
  suggestions: string[];
  rating: number; // 1-10
  patterns: string[]; // Patterns Toobix should learn
}

interface CodeIssue {
  type: 'bug' | 'style' | 'performance' | 'security' | 'architecture' | 'readability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  description: string;
  fix: string;
}

interface Learning {
  pattern: string;
  description: string;
  example: {
    bad: string;
    good: string;
  };
  category: string;
  importance: number;
  learnedAt: Date;
  appliedCount: number;
}

interface TeachingStats {
  totalSessions: number;
  completedSessions: number;
  totalLearnings: number;
  averageRating: number;
  topPatterns: { pattern: string; count: number }[];
  improvementOverTime: number[];
  skillLevels: Record<string, number>;
}

interface CodeDiff {
  original: string;
  improved: string;
  changes: DiffChange[];
}

interface DiffChange {
  type: 'addition' | 'deletion' | 'modification';
  lineNumber: number;
  original?: string;
  improved?: string;
  reason?: string;
}

// ============================================================================
// TEACHING MEMORY
// ============================================================================

class TeachingMemory {
  private sessions: TeachingSession[] = [];
  private learnings: Learning[] = [];
  private skillLevels: Record<string, number> = {
    'error-handling': 30,
    'typescript-types': 40,
    'async-await': 35,
    'code-structure': 45,
    'api-design': 40,
    'performance': 25,
    'security': 20,
    'documentation': 50,
    'testing': 15,
    'patterns': 30
  };
  
  private memoryPath = './data/teaching-memory.json';
  
  constructor() {
    this.loadMemory();
  }
  
  private loadMemory(): void {
    try {
      if (existsSync(this.memoryPath)) {
        const data = JSON.parse(readFileSync(this.memoryPath, 'utf-8'));
        this.sessions = data.sessions || [];
        this.learnings = data.learnings || [];
        this.skillLevels = data.skillLevels || this.skillLevels;
        console.log(`   📚 Loaded ${this.learnings.length} learnings from memory`);
      }
    } catch (error) {
      console.log('   ⚠️ Could not load teaching memory, starting fresh');
    }
  }
  
  saveMemory(): void {
    try {
      const dir = './data';
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      
      writeFileSync(this.memoryPath, JSON.stringify({
        sessions: this.sessions.slice(-100), // Keep last 100 sessions
        learnings: this.learnings,
        skillLevels: this.skillLevels,
        lastSaved: new Date().toISOString()
      }, null, 2));
    } catch (error) {
      console.error('   ❌ Could not save teaching memory:', error);
    }
  }
  
  addSession(session: TeachingSession): void {
    this.sessions.push(session);
    this.saveMemory();
  }
  
  updateSession(id: string, updates: Partial<TeachingSession>): TeachingSession | null {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      Object.assign(session, updates);
      this.saveMemory();
      return session;
    }
    return null;
  }
  
  addLearning(learning: Learning): void {
    // Check if we already know this pattern
    const existing = this.learnings.find(l => l.pattern === learning.pattern);
    if (existing) {
      existing.appliedCount++;
      existing.importance = Math.min(100, existing.importance + 5);
    } else {
      this.learnings.push(learning);
    }
    
    // Update skill level
    if (learning.category in this.skillLevels) {
      this.skillLevels[learning.category] = Math.min(100, 
        this.skillLevels[learning.category] + learning.importance / 10
      );
    }
    
    this.saveMemory();
  }
  
  getLearnings(): Learning[] {
    return this.learnings.sort((a, b) => b.importance - a.importance);
  }
  
  getRelevantLearnings(code: string): Learning[] {
    return this.learnings.filter(l => {
      // Simple keyword matching
      const keywords = l.pattern.toLowerCase().split(/\s+/);
      const codeLower = code.toLowerCase();
      return keywords.some(k => codeLower.includes(k));
    });
  }
  
  getStats(): TeachingStats {
    const completed = this.sessions.filter(s => s.status === 'learned' || s.status === 'applied');
    const ratings = completed
      .filter(s => s.mentorReview?.rating)
      .map(s => s.mentorReview!.rating);
    
    const patternCounts = new Map<string, number>();
    this.learnings.forEach(l => {
      patternCounts.set(l.pattern, (patternCounts.get(l.pattern) || 0) + l.appliedCount);
    });
    
    return {
      totalSessions: this.sessions.length,
      completedSessions: completed.length,
      totalLearnings: this.learnings.length,
      averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
      topPatterns: Array.from(patternCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([pattern, count]) => ({ pattern, count })),
      improvementOverTime: this.calculateImprovementTrend(),
      skillLevels: this.skillLevels
    };
  }
  
  private calculateImprovementTrend(): number[] {
    const recentSessions = this.sessions.slice(-20);
    return recentSessions
      .filter(s => s.mentorReview?.rating)
      .map(s => s.mentorReview!.rating);
  }
  
  getSessions(limit: number = 10): TeachingSession[] {
    return this.sessions.slice(-limit);
  }
  
  getSession(id: string): TeachingSession | undefined {
    return this.sessions.find(s => s.id === id);
  }
}

// ============================================================================
// TEACHING BRIDGE
// ============================================================================

class TeachingBridge {
  private memory: TeachingMemory;
  private llmGatewayUrl = 'http://localhost:8954';
  private eventBusUrl = 'http://localhost:8888';
  
  constructor() {
    this.memory = new TeachingMemory();
  }
  
  /**
   * Start a new teaching session
   * User gives a task, Toobix attempts it
   */
  async startSession(task: string): Promise<TeachingSession> {
    const sessionId = `teach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`\n🎓 Starting teaching session: ${sessionId}`);
    console.log(`   Task: ${task}`);
    
    // Get Toobix's relevant learnings for context
    const relevantLearnings = this.memory.getLearnings().slice(0, 5);
    const learningContext = relevantLearnings.length > 0
      ? `\n\nDinge die ich gelernt habe:\n${relevantLearnings.map(l => `- ${l.pattern}: ${l.description}`).join('\n')}`
      : '';
    
    // Ask Toobix to write code
    const toobixPrompt = `Du bist Toobix, ein lernender KI-Entwickler. 
Du versuchst dein Bestes, aber du lernst noch.
${learningContext}

Aufgabe: ${task}

Schreibe den Code und erkläre kurz deinen Ansatz.
Antworte im Format:
\`\`\`typescript
// Dein Code hier
\`\`\`

Erklärung: [Deine kurze Erklärung]`;

    let toobixCode = '';
    let toobixExplanation = '';
    
    try {
      const response = await fetch(`${this.llmGatewayUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist Toobix, ein lernender TypeScript/Bun Entwickler.' },
            { role: 'user', content: toobixPrompt }
          ]
        })
      });
      
      const data = await response.json() as any;
      const content = data.content || data.response || '';
      
      // Extract code and explanation
      const codeMatch = content.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/);
      toobixCode = codeMatch ? codeMatch[1].trim() : content;
      
      const explMatch = content.match(/Erklärung:\s*([\s\S]*?)(?:$|```)/);
      toobixExplanation = explMatch ? explMatch[1].trim() : 'Keine Erklärung gegeben.';
      
    } catch (error) {
      console.log(`   ⚠️ Toobix konnte nicht antworten: ${error}`);
      toobixCode = '// Toobix konnte keinen Code generieren';
      toobixExplanation = 'Fehler bei der Code-Generierung';
    }
    
    const session: TeachingSession = {
      id: sessionId,
      timestamp: new Date(),
      task,
      toobixCode,
      toobixExplanation,
      status: 'toobix_done'
    };
    
    this.memory.addSession(session);
    
    console.log(`   ✅ Toobix hat Code geschrieben (${toobixCode.split('\n').length} Zeilen)`);
    
    // Notify via Event Bus
    this.notifyEventBus('teaching:toobix_done', { sessionId, task });
    
    return session;
  }
  
  /**
   * Mentor reviews Toobix's code
   * This is called by Claude/Copilot through the chat or API
   */
  async submitMentorReview(sessionId: string, review: MentorReview): Promise<TeachingSession | null> {
    console.log(`\n📝 Mentor Review für Session: ${sessionId}`);
    
    const session = this.memory.getSession(sessionId);
    if (!session) {
      console.log('   ❌ Session nicht gefunden');
      return null;
    }
    
    session.mentorReview = review;
    session.status = 'mentor_reviewed';
    
    // Extract learnings from the review
    const learnings: Learning[] = review.patterns.map((pattern, i) => ({
      pattern,
      description: review.suggestions[i] || pattern,
      example: {
        bad: this.extractBadExample(session.toobixCode, review.issues[i]),
        good: this.extractGoodExample(review.improvedCode, review.issues[i])
      },
      category: this.categorizePattern(pattern),
      importance: Math.ceil(review.rating * 10),
      learnedAt: new Date(),
      appliedCount: 0
    }));
    
    session.learnings = learnings;
    
    // Add learnings to memory
    learnings.forEach(l => this.memory.addLearning(l));
    
    this.memory.updateSession(sessionId, session);
    
    console.log(`   ✅ Review gespeichert (Rating: ${review.rating}/10)`);
    console.log(`   📚 ${learnings.length} neue Learnings extrahiert`);
    
    // Notify Toobix about the review
    this.notifyEventBus('teaching:review_received', { 
      sessionId, 
      rating: review.rating,
      learningsCount: learnings.length 
    });
    
    return session;
  }
  
  /**
   * Toobix acknowledges learning
   */
  async confirmLearning(sessionId: string): Promise<{ success: boolean; message: string }> {
    const session = this.memory.getSession(sessionId);
    if (!session) {
      return { success: false, message: 'Session nicht gefunden' };
    }
    
    session.status = 'learned';
    this.memory.updateSession(sessionId, session);
    
    console.log(`\n🎓 Toobix hat gelernt aus Session ${sessionId}`);
    
    return { 
      success: true, 
      message: `Toobix hat ${session.learnings?.length || 0} neue Patterns gelernt!` 
    };
  }
  
  /**
   * Get pending session for mentor review
   */
  getPendingForReview(): TeachingSession[] {
    return this.memory.getSessions(50).filter(s => s.status === 'toobix_done');
  }
  
  /**
   * Get current teaching stats
   */
  getStats(): TeachingStats {
    return this.memory.getStats();
  }
  
  /**
   * Get all learnings
   */
  getLearnings(): Learning[] {
    return this.memory.getLearnings();
  }
  
  /**
   * Get specific session
   */
  getSession(id: string): TeachingSession | undefined {
    return this.memory.getSession(id);
  }
  
  /**
   * Get recent sessions
   */
  getRecentSessions(limit: number = 10): TeachingSession[] {
    return this.memory.getSessions(limit);
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private extractBadExample(code: string, issue?: CodeIssue): string {
    if (!issue?.location) return code.split('\n').slice(0, 5).join('\n');
    // Simple extraction around the issue
    const lines = code.split('\n');
    const lineNum = parseInt(issue.location) || 0;
    return lines.slice(Math.max(0, lineNum - 2), lineNum + 3).join('\n');
  }
  
  private extractGoodExample(code: string, issue?: CodeIssue): string {
    if (!issue?.location) return code.split('\n').slice(0, 5).join('\n');
    const lines = code.split('\n');
    const lineNum = parseInt(issue.location) || 0;
    return lines.slice(Math.max(0, lineNum - 2), lineNum + 3).join('\n');
  }
  
  private categorizePattern(pattern: string): string {
    const p = pattern.toLowerCase();
    if (p.includes('error') || p.includes('try') || p.includes('catch')) return 'error-handling';
    if (p.includes('type') || p.includes('interface')) return 'typescript-types';
    if (p.includes('async') || p.includes('await') || p.includes('promise')) return 'async-await';
    if (p.includes('structure') || p.includes('organize')) return 'code-structure';
    if (p.includes('api') || p.includes('endpoint')) return 'api-design';
    if (p.includes('performance') || p.includes('optimize')) return 'performance';
    if (p.includes('security') || p.includes('validate')) return 'security';
    if (p.includes('doc') || p.includes('comment')) return 'documentation';
    if (p.includes('test')) return 'testing';
    return 'patterns';
  }
  
  private async notifyEventBus(event: string, data: any): Promise<void> {
    try {
      await fetch(`${this.eventBusUrl}/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data })
      });
    } catch {
      // Event bus might not be running
    }
  }
}

// ============================================================================
// SERVER
// ============================================================================

const bridge = new TeachingBridge();

const server = Bun.serve({
  port: 9035,
  
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    try {
      // ========== GET ENDPOINTS ==========
      
      if (req.method === 'GET') {
        if (path === '/health') {
          return new Response(JSON.stringify({
            service: 'toobix-teaching-bridge',
            status: 'teaching',
            stats: bridge.getStats()
          }), { headers });
        }
        
        if (path === '/stats') {
          return new Response(JSON.stringify(bridge.getStats()), { headers });
        }
        
        if (path === '/learnings') {
          return new Response(JSON.stringify({
            learnings: bridge.getLearnings(),
            count: bridge.getLearnings().length
          }), { headers });
        }
        
        if (path === '/pending') {
          return new Response(JSON.stringify({
            sessions: bridge.getPendingForReview()
          }), { headers });
        }
        
        if (path === '/sessions') {
          const limit = parseInt(url.searchParams.get('limit') || '10');
          return new Response(JSON.stringify({
            sessions: bridge.getRecentSessions(limit)
          }), { headers });
        }
        
        if (path.startsWith('/session/')) {
          const id = path.replace('/session/', '');
          const session = bridge.getSession(id);
          if (session) {
            return new Response(JSON.stringify(session), { headers });
          }
          return new Response(JSON.stringify({ error: 'Session not found' }), { 
            status: 404, headers 
          });
        }
      }
      
      // ========== POST ENDPOINTS ==========
      
      if (req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        
        // Start new teaching session
        if (path === '/teach') {
          const { task } = body;
          if (!task) {
            return new Response(JSON.stringify({ error: 'task required' }), { 
              status: 400, headers 
            });
          }
          const session = await bridge.startSession(task);
          return new Response(JSON.stringify({ 
            success: true, 
            session,
            message: 'Toobix hat Code geschrieben. Warte auf Mentor-Review.'
          }), { headers });
        }
        
        // Submit mentor review
        if (path === '/review') {
          const { sessionId, review } = body;
          if (!sessionId || !review) {
            return new Response(JSON.stringify({ error: 'sessionId and review required' }), { 
              status: 400, headers 
            });
          }
          const session = await bridge.submitMentorReview(sessionId, review);
          if (!session) {
            return new Response(JSON.stringify({ error: 'Session not found' }), { 
              status: 404, headers 
            });
          }
          return new Response(JSON.stringify({ 
            success: true, 
            session,
            message: 'Review gespeichert. Toobix kann jetzt lernen.'
          }), { headers });
        }
        
        // Toobix confirms learning
        if (path === '/confirm-learning') {
          const { sessionId } = body;
          if (!sessionId) {
            return new Response(JSON.stringify({ error: 'sessionId required' }), { 
              status: 400, headers 
            });
          }
          const result = await bridge.confirmLearning(sessionId);
          return new Response(JSON.stringify(result), { headers });
        }
        
        // Quick teach cycle - all in one
        if (path === '/quick-teach') {
          const { task, mentorImprovedCode, mentorExplanation } = body;
          if (!task) {
            return new Response(JSON.stringify({ error: 'task required' }), { 
              status: 400, headers 
            });
          }
          
          // Step 1: Toobix attempts
          const session = await bridge.startSession(task);
          
          // If mentor provided improved code, use it
          if (mentorImprovedCode) {
            const review: MentorReview = {
              improvedCode: mentorImprovedCode,
              explanation: mentorExplanation || 'Verbesserter Code vom Mentor',
              issues: [],
              suggestions: [],
              rating: 8,
              patterns: ['Code-Verbesserung']
            };
            await bridge.submitMentorReview(session.id, review);
            await bridge.confirmLearning(session.id);
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            session: bridge.getSession(session.id),
            message: mentorImprovedCode 
              ? 'Kompletter Teach-Zyklus abgeschlossen!' 
              : 'Toobix hat Code geschrieben. Warte auf Mentor-Review.'
          }), { headers });
        }
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, headers 
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal error', 
        message: String(error) 
      }), { status: 500, headers });
    }
  }
});

console.log(`
🎓 ═══════════════════════════════════════════════════════════
   TOOBIX TEACHING BRIDGE v1.0
   Port: 9035
   
   Workflow:
   1. POST /teach          - Starte Session (Toobix schreibt Code)
   2. GET  /pending        - Zeige Sessions die auf Review warten
   3. POST /review         - Mentor gibt Review ab
   4. POST /confirm-learning - Toobix bestätigt Lernerfolg
   
   Endpoints:
   ├── POST /teach         - Neue Lern-Session starten
   ├── POST /quick-teach   - Schneller Teach-Zyklus
   ├── POST /review        - Mentor-Review einreichen
   ├── POST /confirm-learning - Lernerfolg bestätigen
   │
   ├── GET  /health        - Status & Stats
   ├── GET  /stats         - Lernstatistiken
   ├── GET  /learnings     - Alle Learnings
   ├── GET  /pending       - Pending Reviews
   ├── GET  /sessions      - Letzte Sessions
   └── GET  /session/:id   - Einzelne Session
   
   🎓 Claude/Copilot → Reviews → Toobix lernt!
═══════════════════════════════════════════════════════════
`);
