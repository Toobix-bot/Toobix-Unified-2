/**
 * 🎓 TOOBIX TEACHING BRIDGE v2.0
 * 
 * ENHANCED VERSION with:
 * - Automatic mentor review requests
 * - Learnings integration in prompts
 * - Complex task challenges
 * - Skill progression tracking
 * - Challenge mode with difficulty levels
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
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  
  toobixCode: string;
  toobixExplanation?: string;
  appliedLearnings?: string[];
  
  mentorReview?: MentorReview;
  learnings?: Learning[];
  
  status: 'pending' | 'toobix_done' | 'awaiting_review' | 'mentor_reviewed' | 'learned' | 'applied';
}

interface MentorReview {
  improvedCode: string;
  explanation: string;
  issues: CodeIssue[];
  suggestions: string[];
  rating: number;
  patterns: string[];
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
  example: { bad: string; good: string };
  category: string;
  importance: number;
  learnedAt: Date;
  appliedCount: number;
  successRate: number;
}

interface TeachingStats {
  totalSessions: number;
  completedSessions: number;
  totalLearnings: number;
  averageRating: number;
  topPatterns: { pattern: string; count: number }[];
  improvementOverTime: number[];
  skillLevels: Record<string, number>;
  challengeProgress: ChallengeProgress;
}

interface ChallengeProgress {
  currentLevel: number;
  completedChallenges: number;
  currentStreak: number;
  bestStreak: number;
  unlockedAchievements: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  task: string;
  hints?: string[];
  expectedPatterns: string[];
  minRating: number;
}

// ============================================================================
// CHALLENGE LIBRARY
// ============================================================================

const CHALLENGES: Challenge[] = [
  // BEGINNER
  {
    id: 'ch-001',
    title: 'String Reverser',
    description: 'Erstelle eine Funktion die einen String umdreht',
    difficulty: 'beginner',
    category: 'algorithms',
    task: 'Erstelle eine TypeScript Funktion reverseString(str: string): string die einen String umdreht. Zum Beispiel: reverseString("hello") => "olleh"',
    hints: ['split(), reverse(), join()'],
    expectedPatterns: ['Input Validation', 'Clean Code'],
    minRating: 5
  },
  {
    id: 'ch-002',
    title: 'Array Deduplicate',
    description: 'Entferne Duplikate aus einem Array',
    difficulty: 'beginner',
    category: 'algorithms',
    task: 'Erstelle eine Funktion unique<T>(arr: T[]): T[] die ein Array ohne Duplikate zurückgibt. Nutze Generics für Type Safety.',
    hints: ['Set', 'Generics'],
    expectedPatterns: ['TypeScript Generics', 'Clean Code'],
    minRating: 5
  },
  // INTERMEDIATE
  {
    id: 'ch-003',
    title: 'Debounce Function',
    description: 'Implementiere eine debounce Funktion',
    difficulty: 'intermediate',
    category: 'async',
    task: 'Erstelle eine debounce<T extends (...args: any[]) => any>(fn: T, delay: number) Funktion die wiederholte Aufrufe verzögert bis keine neuen Aufrufe mehr kommen.',
    hints: ['setTimeout', 'clearTimeout', 'Generics'],
    expectedPatterns: ['TypeScript Generics', 'Closure Pattern', 'Timer Management'],
    minRating: 6
  },
  {
    id: 'ch-004',
    title: 'Event Emitter',
    description: 'Baue einen Type-Safe Event Emitter',
    difficulty: 'intermediate',
    category: 'patterns',
    task: 'Erstelle eine EventEmitter Klasse mit on(event, callback), off(event, callback), emit(event, data) Methoden. Nutze TypeScript Generics für Type-Safe Events.',
    hints: ['Map<string, Set<Function>>', 'Generics', 'Type constraints'],
    expectedPatterns: ['TypeScript Generics', 'Observer Pattern', 'Type Safety'],
    minRating: 6
  },
  // ADVANCED
  {
    id: 'ch-005',
    title: 'Retry with Exponential Backoff',
    description: 'Async retry mit exponential backoff',
    difficulty: 'advanced',
    category: 'async',
    task: 'Erstelle eine retry<T>(fn: () => Promise<T>, options: { maxRetries: number, baseDelay: number, maxDelay: number }) Funktion mit exponential backoff. Bei Fehler: warte baseDelay * 2^attempt ms (max maxDelay), dann retry.',
    hints: ['async/await', 'Exponential backoff formula', 'Error handling'],
    expectedPatterns: ['Async/Await', 'Exponential Backoff', 'Error Handling', 'TypeScript Generics'],
    minRating: 7
  },
  {
    id: 'ch-006',
    title: 'LRU Cache',
    description: 'Implementiere einen LRU (Least Recently Used) Cache',
    difficulty: 'advanced',
    category: 'data-structures',
    task: 'Erstelle eine LRUCache<K, V> Klasse mit get(key), set(key, value), delete(key). Der Cache hat eine maxSize. Bei Überschreitung wird der am längsten nicht verwendete Eintrag entfernt.',
    hints: ['Map behält Insertion Order', 'Generics', 'delete + set für "Refresh"'],
    expectedPatterns: ['TypeScript Generics', 'LRU Pattern', 'Resource Management'],
    minRating: 7
  },
  // EXPERT
  {
    id: 'ch-007',
    title: 'Promise Pool',
    description: 'Parallel execution mit Concurrency Limit',
    difficulty: 'expert',
    category: 'async',
    task: 'Erstelle eine PromisePool Klasse die eine Liste von async Tasks mit einem Concurrency Limit ausführt. pool.run(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]>',
    hints: ['Promise.race', 'Queue management', 'Dynamic refilling'],
    expectedPatterns: ['Async/Await', 'Concurrency Control', 'Promise Patterns', 'Resource Management'],
    minRating: 8
  },
  {
    id: 'ch-008',
    title: 'Dependency Injection Container',
    description: 'Baue einen einfachen DI Container',
    difficulty: 'expert',
    category: 'patterns',
    task: 'Erstelle einen DIContainer mit register<T>(token, factory), resolve<T>(token), und singleton<T>(token, factory). Unterstütze verschachtelte Dependencies.',
    hints: ['Map<symbol, Factory>', 'Lazy initialization', 'Circular dependency detection'],
    expectedPatterns: ['Dependency Injection', 'Factory Pattern', 'Singleton Pattern', 'TypeScript Generics'],
    minRating: 8
  }
];

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
  private challengeProgress: ChallengeProgress = {
    currentLevel: 1,
    completedChallenges: 0,
    currentStreak: 0,
    bestStreak: 0,
    unlockedAchievements: []
  };
  
  private memoryPath = './data/teaching-memory-v2.json';
  
  constructor() {
    this.loadMemory();
  }
  
  private loadMemory(): void {
    try {
      if (existsSync(this.memoryPath)) {
        const data = JSON.parse(readFileSync(this.memoryPath, 'utf-8'));
        this.sessions = data.sessions || [];
        this.learnings = data.learnings || [];
        this.skillLevels = { ...this.skillLevels, ...data.skillLevels };
        this.challengeProgress = { ...this.challengeProgress, ...data.challengeProgress };
        console.log(`   📚 Loaded ${this.learnings.length} learnings, ${this.sessions.length} sessions`);
      }
    } catch (error) {
      console.log('   ⚠️ Starting with fresh memory');
    }
  }
  
  saveMemory(): void {
    try {
      const dir = './data';
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      
      writeFileSync(this.memoryPath, JSON.stringify({
        sessions: this.sessions.slice(-100),
        learnings: this.learnings,
        skillLevels: this.skillLevels,
        challengeProgress: this.challengeProgress,
        lastSaved: new Date().toISOString()
      }, null, 2));
    } catch (error) {
      console.error('   ❌ Could not save memory:', error);
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
    const existing = this.learnings.find(l => l.pattern === learning.pattern);
    if (existing) {
      existing.appliedCount++;
      existing.importance = Math.min(100, existing.importance + 5);
      existing.successRate = (existing.successRate * (existing.appliedCount - 1) + 1) / existing.appliedCount;
    } else {
      this.learnings.push({ ...learning, successRate: 1 });
    }
    
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
  
  getLearningsForTask(task: string): Learning[] {
    const taskLower = task.toLowerCase();
    return this.learnings.filter(l => {
      const keywords = l.pattern.toLowerCase().split(/\s+/);
      return keywords.some(k => taskLower.includes(k)) || 
             l.category.split('-').some(c => taskLower.includes(c));
    }).slice(0, 10);
  }
  
  updateChallengeProgress(rating: number, passed: boolean): void {
    if (passed) {
      this.challengeProgress.completedChallenges++;
      this.challengeProgress.currentStreak++;
      if (this.challengeProgress.currentStreak > this.challengeProgress.bestStreak) {
        this.challengeProgress.bestStreak = this.challengeProgress.currentStreak;
      }
      
      // Level up every 3 challenges
      if (this.challengeProgress.completedChallenges % 3 === 0) {
        this.challengeProgress.currentLevel++;
        this.checkAchievements();
      }
    } else {
      this.challengeProgress.currentStreak = 0;
    }
    this.saveMemory();
  }
  
  private checkAchievements(): void {
    const achievements = this.challengeProgress.unlockedAchievements;
    
    if (this.challengeProgress.completedChallenges >= 5 && !achievements.includes('First Five')) {
      achievements.push('First Five');
    }
    if (this.challengeProgress.bestStreak >= 3 && !achievements.includes('Hot Streak')) {
      achievements.push('Hot Streak');
    }
    if (this.challengeProgress.currentLevel >= 5 && !achievements.includes('Level Master')) {
      achievements.push('Level Master');
    }
    if (this.learnings.length >= 20 && !achievements.includes('Knowledge Seeker')) {
      achievements.push('Knowledge Seeker');
    }
  }
  
  getStats(): TeachingStats {
    const completed = this.sessions.filter(s => s.status === 'learned' || s.status === 'applied');
    const ratings = completed.filter(s => s.mentorReview?.rating).map(s => s.mentorReview!.rating);
    
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
      improvementOverTime: this.sessions.slice(-20)
        .filter(s => s.mentorReview?.rating)
        .map(s => s.mentorReview!.rating),
      skillLevels: this.skillLevels,
      challengeProgress: this.challengeProgress
    };
  }
  
  getSessions(limit: number = 10): TeachingSession[] {
    return this.sessions.slice(-limit);
  }
  
  getSession(id: string): TeachingSession | undefined {
    return this.sessions.find(s => s.id === id);
  }
  
  getChallengeProgress(): ChallengeProgress {
    return this.challengeProgress;
  }
}

// ============================================================================
// TEACHING BRIDGE v2
// ============================================================================

class TeachingBridge {
  private memory: TeachingMemory;
  private llmGatewayUrl = 'http://localhost:8954';
  private eventBusUrl = 'http://localhost:8888';
  private pendingReviewCallback?: (session: TeachingSession) => void;
  
  constructor() {
    this.memory = new TeachingMemory();
  }
  
  /**
   * Start a teaching session with learning context
   */
  async startSession(task: string, difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate'): Promise<TeachingSession> {
    const sessionId = `teach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`\n🎓 Teaching Session: ${sessionId}`);
    console.log(`   Task: ${task}`);
    console.log(`   Difficulty: ${difficulty}`);
    
    // Get relevant learnings for this specific task
    const relevantLearnings = this.memory.getLearningsForTask(task);
    const appliedLearnings: string[] = [];
    
    let learningContext = '';
    if (relevantLearnings.length > 0) {
      learningContext = `\n\n📚 WICHTIG - Wende diese gelernten Patterns an:\n${relevantLearnings.map(l => {
        appliedLearnings.push(l.pattern);
        return `- ${l.pattern}: ${l.description}`;
      }).join('\n')}`;
    }
    
    const toobixPrompt = `Du bist Toobix, ein lernender KI-Entwickler.
Schwierigkeit: ${difficulty}
${learningContext}

🎯 AUFGABE: ${task}

Schreibe den Code und erkläre kurz deinen Ansatz.
Wenn du gelernte Patterns anwendest, erwähne sie!

Format:
\`\`\`typescript
// Dein Code hier
\`\`\`

Erklärung: [Dein Ansatz und welche Patterns du angewendet hast]`;

    let toobixCode = '';
    let toobixExplanation = '';
    
    try {
      const response = await fetch(`${this.llmGatewayUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist Toobix, ein lernender TypeScript Entwickler. Wende gelernte Patterns an!' },
            { role: 'user', content: toobixPrompt }
          ]
        })
      });
      
      const data = await response.json() as any;
      const content = data.content || data.response || '';
      
      const codeMatch = content.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/);
      toobixCode = codeMatch ? codeMatch[1].trim() : content;
      
      const explMatch = content.match(/Erklärung:\s*([\s\S]*?)(?:$|```)/);
      toobixExplanation = explMatch ? explMatch[1].trim() : 'Keine Erklärung.';
      
    } catch (error) {
      toobixCode = '// Fehler bei der Code-Generierung';
      toobixExplanation = String(error);
    }
    
    const session: TeachingSession = {
      id: sessionId,
      timestamp: new Date(),
      task,
      difficulty,
      category: this.categorizeTask(task),
      toobixCode,
      toobixExplanation,
      appliedLearnings,
      status: 'toobix_done'
    };
    
    this.memory.addSession(session);
    
    console.log(`   ✅ Code geschrieben (${toobixCode.split('\n').length} Zeilen)`);
    console.log(`   📚 Applied ${appliedLearnings.length} learnings`);
    
    // Auto-request review
    this.notifyEventBus('teaching:awaiting_review', { 
      sessionId, 
      task,
      codePreview: toobixCode.substring(0, 200) + '...'
    });
    
    return session;
  }
  
  /**
   * Start a challenge
   */
  async startChallenge(challengeId?: string): Promise<{ session: TeachingSession; challenge: Challenge }> {
    const progress = this.memory.getChallengeProgress();
    
    // Select appropriate challenge based on level
    let challenge: Challenge;
    if (challengeId) {
      challenge = CHALLENGES.find(c => c.id === challengeId) || CHALLENGES[0];
    } else {
      const availableChallenges = CHALLENGES.filter(c => {
        if (c.difficulty === 'beginner') return progress.currentLevel >= 1;
        if (c.difficulty === 'intermediate') return progress.currentLevel >= 2;
        if (c.difficulty === 'advanced') return progress.currentLevel >= 4;
        if (c.difficulty === 'expert') return progress.currentLevel >= 6;
        return false;
      });
      challenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)] || CHALLENGES[0];
    }
    
    console.log(`\n🏆 Challenge: ${challenge.title} (${challenge.difficulty})`);
    
    const session = await this.startSession(challenge.task, challenge.difficulty);
    
    return { session, challenge };
  }
  
  /**
   * Submit mentor review
   */
  async submitMentorReview(sessionId: string, review: MentorReview): Promise<TeachingSession | null> {
    console.log(`\n📝 Mentor Review: ${sessionId}`);
    
    const session = this.memory.getSession(sessionId);
    if (!session) return null;
    
    session.mentorReview = review;
    session.status = 'mentor_reviewed';
    
    // Extract learnings
    const learnings: Learning[] = review.patterns.map((pattern, i) => ({
      pattern,
      description: review.suggestions[i] || pattern,
      example: {
        bad: session.toobixCode.split('\n').slice(0, 5).join('\n'),
        good: review.improvedCode.split('\n').slice(0, 5).join('\n')
      },
      category: this.categorizePattern(pattern),
      importance: Math.ceil(review.rating * 10),
      learnedAt: new Date(),
      appliedCount: 0,
      successRate: 0
    }));
    
    session.learnings = learnings;
    learnings.forEach(l => this.memory.addLearning(l));
    
    // Update challenge progress
    this.memory.updateChallengeProgress(review.rating, review.rating >= 6);
    
    this.memory.updateSession(sessionId, session);
    
    console.log(`   Rating: ${review.rating}/10`);
    console.log(`   Learnings: ${learnings.length}`);
    
    return session;
  }
  
  /**
   * Generate auto-review request message
   */
  getReviewRequestMessage(session: TeachingSession): string {
    return `
🎓 **REVIEW REQUEST**

**Task:** ${session.task}
**Difficulty:** ${session.difficulty}
**Session ID:** ${session.id}

**Toobix's Code:**
\`\`\`typescript
${session.toobixCode}
\`\`\`

**Toobix's Erklärung:** ${session.toobixExplanation}

${session.appliedLearnings?.length ? `**Applied Learnings:** ${session.appliedLearnings.join(', ')}` : ''}

---
Bitte review den Code und gib Feedback mit:
1. Verbesserter Code
2. Issues/Bugs gefunden
3. Neue Patterns zum Lernen
4. Rating (1-10)
`;
  }
  
  // Public getters
  getPendingForReview(): TeachingSession[] {
    return this.memory.getSessions(50).filter(s => s.status === 'toobix_done');
  }
  
  getStats(): TeachingStats {
    return this.memory.getStats();
  }
  
  getLearnings(): Learning[] {
    return this.memory.getLearnings();
  }
  
  getSession(id: string): TeachingSession | undefined {
    return this.memory.getSession(id);
  }
  
  getRecentSessions(limit: number = 10): TeachingSession[] {
    return this.memory.getSessions(limit);
  }
  
  getChallenges(): Challenge[] {
    return CHALLENGES;
  }
  
  getChallengeProgress(): ChallengeProgress {
    return this.memory.getChallengeProgress();
  }
  
  // Helpers
  private categorizeTask(task: string): string {
    const t = task.toLowerCase();
    if (t.includes('async') || t.includes('promise') || t.includes('await')) return 'async';
    if (t.includes('class') || t.includes('interface')) return 'oop';
    if (t.includes('api') || t.includes('fetch') || t.includes('http')) return 'api';
    if (t.includes('array') || t.includes('list') || t.includes('map')) return 'data-structures';
    if (t.includes('cache') || t.includes('memory')) return 'caching';
    if (t.includes('event') || t.includes('emit')) return 'events';
    if (t.includes('test')) return 'testing';
    return 'general';
  }
  
  private categorizePattern(pattern: string): string {
    const p = pattern.toLowerCase();
    if (p.includes('error') || p.includes('try') || p.includes('catch')) return 'error-handling';
    if (p.includes('type') || p.includes('interface') || p.includes('generic')) return 'typescript-types';
    if (p.includes('async') || p.includes('await') || p.includes('promise')) return 'async-await';
    if (p.includes('structure') || p.includes('organize') || p.includes('clean')) return 'code-structure';
    if (p.includes('api') || p.includes('endpoint')) return 'api-design';
    if (p.includes('performance') || p.includes('optimize') || p.includes('cache')) return 'performance';
    if (p.includes('security') || p.includes('validate') || p.includes('sanitize')) return 'security';
    if (p.includes('doc') || p.includes('comment') || p.includes('jsdoc')) return 'documentation';
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
    } catch {}
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
      // GET endpoints
      if (req.method === 'GET') {
        if (path === '/health') {
          const stats = bridge.getStats();
          return new Response(JSON.stringify({
            service: 'toobix-teaching-bridge',
            version: '2.0',
            status: 'teaching',
            stats: {
              sessions: stats.totalSessions,
              learnings: stats.totalLearnings,
              level: stats.challengeProgress.currentLevel
            }
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
        
        if (path === '/challenges') {
          return new Response(JSON.stringify({
            challenges: bridge.getChallenges(),
            progress: bridge.getChallengeProgress()
          }), { headers });
        }
        
        if (path.startsWith('/session/')) {
          const id = path.replace('/session/', '');
          const session = bridge.getSession(id);
          if (session) {
            return new Response(JSON.stringify(session), { headers });
          }
          return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers });
        }
        
        if (path.startsWith('/review-request/')) {
          const id = path.replace('/review-request/', '');
          const session = bridge.getSession(id);
          if (session) {
            return new Response(JSON.stringify({
              message: bridge.getReviewRequestMessage(session),
              session
            }), { headers });
          }
          return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers });
        }
      }
      
      // POST endpoints
      if (req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        
        if (path === '/teach') {
          const { task, difficulty } = body;
          if (!task) {
            return new Response(JSON.stringify({ error: 'task required' }), { status: 400, headers });
          }
          const session = await bridge.startSession(task, difficulty || 'intermediate');
          return new Response(JSON.stringify({ 
            success: true, 
            session,
            reviewRequest: bridge.getReviewRequestMessage(session),
            message: 'Toobix hat Code geschrieben. Review-Anfrage generiert.'
          }), { headers });
        }
        
        if (path === '/challenge') {
          const { challengeId } = body;
          const result = await bridge.startChallenge(challengeId);
          return new Response(JSON.stringify({ 
            success: true, 
            ...result,
            reviewRequest: bridge.getReviewRequestMessage(result.session)
          }), { headers });
        }
        
        if (path === '/review') {
          const { sessionId, review } = body;
          if (!sessionId || !review) {
            return new Response(JSON.stringify({ error: 'sessionId and review required' }), { status: 400, headers });
          }
          const session = await bridge.submitMentorReview(sessionId, review);
          if (!session) {
            return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers });
          }
          return new Response(JSON.stringify({ 
            success: true, 
            session,
            message: `Review saved! Toobix learned ${session.learnings?.length || 0} patterns.`
          }), { headers });
        }
        
        if (path === '/quick-teach') {
          const { task, mentorImprovedCode, mentorExplanation, rating = 7 } = body;
          if (!task) {
            return new Response(JSON.stringify({ error: 'task required' }), { status: 400, headers });
          }
          
          const session = await bridge.startSession(task);
          
          if (mentorImprovedCode) {
            await bridge.submitMentorReview(session.id, {
              improvedCode: mentorImprovedCode,
              explanation: mentorExplanation || 'Code improvement',
              issues: [],
              suggestions: [],
              rating,
              patterns: ['Code Improvement']
            });
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            session: bridge.getSession(session.id),
            message: mentorImprovedCode ? 'Full teach cycle completed!' : 'Awaiting mentor review.'
          }), { headers });
        }
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers });
    }
  }
});

console.log(`
🎓 ═══════════════════════════════════════════════════════════
   TOOBIX TEACHING BRIDGE v2.0
   Port: 9035
   
   NEW FEATURES:
   ├── 🏆 Challenge Mode with 8 challenges
   ├── 📚 Learnings integrated in prompts
   ├── 📝 Auto review request generation
   ├── 📊 Skill progression tracking
   └── 🏅 Achievements system
   
   Endpoints:
   ├── POST /teach         - Start teaching session
   ├── POST /challenge     - Start a challenge
   ├── POST /review        - Submit mentor review
   ├── POST /quick-teach   - Full teach cycle
   │
   ├── GET  /health        - Service status
   ├── GET  /stats         - Learning statistics  
   ├── GET  /learnings     - All learned patterns
   ├── GET  /challenges    - Available challenges
   ├── GET  /pending       - Pending reviews
   ├── GET  /sessions      - Recent sessions
   ├── GET  /session/:id   - Get session
   └── GET  /review-request/:id - Get review message
   
   🎓 Toobix learns from every interaction!
═══════════════════════════════════════════════════════════
`);
