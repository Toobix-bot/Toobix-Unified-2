/**
 * AUTO-INTEGRATION SCRIPT
 * Fügt Assessment-Funktionalität in life-domain-chat.ts ein
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'scripts/14-life-domains/life-domain-chat-v1.ts');
let content = readFileSync(file, 'utf-8');

// 1. Add imports
const importBlock = `import Database from 'bun:sqlite';
import path from 'path';
import {
  getAssessmentForDomain,
  scoreAssessment,
  generatePersonalizedPrompt,
  type AssessmentAnswer,
  type AssessmentResult
} from './domain-assessments';`;

content = content.replace(
  `import Database from 'bun:sqlite';\nimport path from 'path';`,
  importBlock
);

// 2. Export LifeDomain type
content = content.replace(
  `type LifeDomain =`,
  `export type LifeDomain =`
);

// 3. Add assessment table in initialize()
const assessmentTable = `
    // Assessment results table
    this.db.run(\`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        level INTEGER NOT NULL,
        levelName TEXT NOT NULL,
        score INTEGER NOT NULL,
        strengths TEXT NOT NULL,
        weaknesses TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        profile TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE(domain)
      )
    \`);`;

content = content.replace(
  `    // Create indices for faster queries`,
  assessmentTable + `\n\n    // Create indices for faster queries`
);

// 4. Add DB methods for assessments
const dbMethods = `
  // Assessment operations
  saveAssessmentResult(result: AssessmentResult): void {
    const stmt = this.db.prepare(\`
      INSERT OR REPLACE INTO assessment_results
      (domain, level, levelName, score, strengths, weaknesses, recommendations, profile, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`);

    stmt.run(
      result.domain,
      result.level,
      result.levelName,
      result.score,
      JSON.stringify(result.strengths),
      JSON.stringify(result.weaknesses),
      JSON.stringify(result.recommendations),
      JSON.stringify(result.profile),
      result.timestamp
    );
  }

  getAssessmentResult(domain: LifeDomain): AssessmentResult | null {
    const stmt = this.db.prepare(\`
      SELECT * FROM assessment_results WHERE domain = ?
    \`);

    const row = stmt.get(domain) as any;
    if (!row) return null;

    return {
      domain: row.domain,
      level: row.level,
      levelName: row.levelName,
      score: row.score,
      strengths: JSON.parse(row.strengths),
      weaknesses: JSON.parse(row.weaknesses),
      recommendations: JSON.parse(row.recommendations),
      profile: JSON.parse(row.profile),
      timestamp: row.timestamp
    };
  }
`;

content = content.replace(
  `  getProfileValue(key: string): any {`,
  dbMethods + `\n  getProfileValue(key: string): any {`
);

// 5. Update buildContextPrompt to use assessment
const promptEnhancement = `    // Personalization based on assessment
    const assessment = this.db.getAssessmentResult(domain);
    if (assessment) {
      prompt += generatePersonalizedPrompt(assessment) + '\\n\\n';
    }

    // Add relevant knowledge`;

content = content.replace(
  `    // Add relevant knowledge`,
  promptEnhancement
);

// 6. Add service methods
const serviceMethods = `
  // Assessment methods
  async submitAssessment(domain: LifeDomain, answers: AssessmentAnswer[]): Promise<AssessmentResult> {
    const result = scoreAssessment(domain, answers);
    this.db.saveAssessmentResult(result);
    return result;
  }

  async getProfile(domain: LifeDomain): Promise<AssessmentResult | null> {
    return this.db.getAssessmentResult(domain);
  }

  async hasAssessment(domain: LifeDomain): Promise<boolean> {
    const result = this.db.getAssessmentResult(domain);
    return result !== null;
  }
`;

content = content.replace(
  `  // Get all domains summary`,
  serviceMethods + `\n  // Get all domains summary`
);

// 7. Add API routes
const apiRoutes = `
    if (url.pathname.startsWith('/assessment/') && req.method === 'GET') {
      const domainId = url.pathname.split('/')[2] as LifeDomain;

      if (!LIFE_DOMAINS[domainId]) {
        return Response.json({ error: 'Invalid domain' }, { status: 404, headers: corsHeaders });
      }

      const assessment = getAssessmentForDomain(domainId);
      return Response.json({ assessment }, { headers: corsHeaders });
    }

    if (url.pathname.startsWith('/assessment/') && req.method === 'POST') {
      try {
        const domainId = url.pathname.split('/')[2] as LifeDomain;
        const body = await req.json() as any;
        const { answers } = body;

        if (!LIFE_DOMAINS[domainId]) {
          return Response.json({ error: 'Invalid domain' }, { status: 404, headers: corsHeaders });
        }

        const result = await service.submitAssessment(domainId, answers);
        return Response.json({ result }, { headers: corsHeaders });
      } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname.startsWith('/profile/') && req.method === 'GET') {
      const domainId = url.pathname.split('/')[2] as LifeDomain;

      if (!LIFE_DOMAINS[domainId]) {
        return Response.json({ error: 'Invalid domain' }, { status: 404, headers: corsHeaders });
      }

      const profile = await service.getProfile(domainId);
      return Response.json({ profile }, { headers: corsHeaders });
    }
`;

content = content.replace(
  `    if (url.pathname.startsWith('/domain/') && req.method === 'GET') {`,
  apiRoutes + `\n    if (url.pathname.startsWith('/domain/') && req.method === 'GET') {`
);

// 8. Update console log
content = content.replace(
  `Endpoints:
  GET  /domains           - List all domains
  POST /chat              - Chat with specific domain
  GET  /domain/{id}       - Get domain insights
  POST /knowledge/add     - Add knowledge entry
  POST /knowledge/search  - Search knowledge`,
  `Endpoints:
  GET  /domains            - List all domains
  POST /chat               - Chat with specific domain
  GET  /domain/{id}        - Get domain insights
  POST /knowledge/add      - Add knowledge entry
  POST /knowledge/search   - Search knowledge
  GET  /assessment/{id}    - Get assessment questions
  POST /assessment/{id}    - Submit assessment & get profile
  GET  /profile/{id}       - Get saved profile`
);

content = content.replace(
  `Integration:
  ✓ AI Gateway (Groq)
  ✓ Multi-Perspective
  ✓ Memory Palace
  ✓ SQLite persistence`,
  `Integration:
  ✓ AI Gateway (Groq)
  ✓ Multi-Perspective
  ✓ Memory Palace
  ✓ SQLite persistence
  ✓ Domain Assessments (1-10 Leveling)
  ✓ Personalized Prompts
  ✓ Strengths/Weaknesses Analysis`
);

// Write updated file
writeFileSync(
  path.join(process.cwd(), 'scripts/14-life-domains/life-domain-chat.ts'),
  content,
  'utf-8'
);

console.log('✅ Assessment integration complete!');
console.log('📝 File: scripts/14-life-domains/life-domain-chat.ts');
console.log('🎯 Features added:');
console.log('   - Assessment DB table');
console.log('   - Assessment save/load methods');
console.log('   - Personalized prompt generation');
console.log('   - 3 new API endpoints');
console.log('   - Service methods for assessments');
