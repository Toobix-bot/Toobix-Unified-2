/**
 * CONSCIOUS DECISION FRAMEWORK - API SERVER
 * 
 * REST API für bewusste Entscheidungsfindung
 * Port: 8909
 */

import type {
  Decision,
  EvaluateRequest,
  EvaluateResponse,
  DecisionHistory,
  ExportFormat
} from './types/index.ts';
import { DecisionEvaluator } from './core/DecisionEvaluator.ts';

const PORT = 8909;
const evaluator = new DecisionEvaluator();

// In-Memory Storage (in Produktion: Datenbank)
const decisions = new Map<string, Decision>();
const history: DecisionHistory = {
  decisions: [],
  patterns: [],
  learnings: []
};

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ========== HEALTH CHECK ==========
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'Conscious Decision Framework',
          port: PORT,
          timestamp: new Date().toISOString(),
          stats: {
            totalDecisions: decisions.size,
            historyEntries: history.decisions.length,
            patternsDetected: history.patterns.length
          }
        }), { headers: corsHeaders });
      }

      // ========== EVALUATE DECISION ==========
      if (path === '/evaluate' && req.method === 'POST') {
        const body: EvaluateRequest = await req.json();
        
        const startTime = Date.now();
        
        // Erstelle Decision-Objekt
        const decision: Decision = {
          id: crypto.randomUUID(),
          ...body.decision,
          createdAt: new Date(),
          status: 'evaluating'
        };
        
        // Evaluiere alle Alternativen
        const evaluations = await evaluator.evaluateDecision(decision);
        
        // Vergleiche Alternativen
        const comparison = await evaluator.compareAlternatives(decision, evaluations);
        
        // Update Decision Status
        decision.status = 'evaluated';
        decision.evaluatedAt = new Date();
        
        // Speichere
        decisions.set(decision.id, decision);
        history.decisions.push(decision);
        
        const processingTime = Date.now() - startTime;
        
        const response: EvaluateResponse = {
          decision,
          evaluations,
          comparison,
          metadata: {
            processingTime,
            servicesUsed: ['DecisionEvaluator'],
            confidence: evaluations.reduce((sum, e) => sum + e.confidence, 0) / evaluations.length
          }
        };
        
        return new Response(JSON.stringify(response), { headers: corsHeaders });
      }

      // ========== GET DECISION BY ID ==========
      if (path.startsWith('/decisions/') && req.method === 'GET') {
        const id = path.split('/')[2];
        const decision = decisions.get(id);
        
        if (!decision) {
          return new Response(JSON.stringify({ error: 'Decision not found' }), { 
            status: 404, 
            headers: corsHeaders 
          });
        }
        
        return new Response(JSON.stringify(decision), { headers: corsHeaders });
      }

      // ========== LIST ALL DECISIONS ==========
      if (path === '/decisions' && req.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const allDecisions = Array.from(decisions.values())
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(offset, offset + limit);
        
        return new Response(JSON.stringify({
          decisions: allDecisions,
          total: decisions.size,
          limit,
          offset
        }), { headers: corsHeaders });
      }

      // ========== QUICK EVALUATE (Simplified endpoint) ==========
      if (path === '/quick-eval' && req.method === 'POST') {
        const body = await req.json();
        const { question, option1, option2, option3 } = body;
        
        // Erstelle vereinfachte Entscheidung
        const simpleDecision: Decision = {
          id: crypto.randomUUID(),
          title: question,
          description: 'Quick evaluation',
          context: {
            domain: 'mixed',
            urgency: 'medium',
            reversibility: 'reversible',
            stakeholders: [{
              name: 'Self',
              type: 'self',
              influence: 100,
              impact: 100
            }],
            timeHorizon: {
              shortTerm: '1 week',
              mediumTerm: '1 month',
              longTerm: '6 months'
            }
          },
          alternatives: [
            {
              id: '1',
              name: option1,
              description: option1,
              pros: [],
              cons: []
            },
            option2 ? {
              id: '2',
              name: option2,
              description: option2,
              pros: [],
              cons: []
            } : null,
            option3 ? {
              id: '3',
              name: option3,
              description: option3,
              pros: [],
              cons: []
            } : null
          ].filter(Boolean) as any[],
          createdAt: new Date(),
          status: 'evaluating'
        };
        
        const evaluations = await evaluator.evaluateDecision(simpleDecision);
        const comparison = await evaluator.compareAlternatives(simpleDecision, evaluations);
        
        return new Response(JSON.stringify({
          question,
          recommendation: comparison.alternatives[0].name,
          reasoning: comparison.reasoning,
          scores: comparison.alternatives.map(a => ({
            option: a.name,
            score: a.totalScore,
            rank: a.rank
          }))
        }), { headers: corsHeaders });
      }

      // ========== GET PERSPECTIVES FOR SPECIFIC ALTERNATIVE ==========
      if (path === '/perspectives' && req.method === 'POST') {
        const body = await req.json();
        const { alternative, context } = body;
        
        // Erstelle temporäre Decision für Analyse
        const tempDecision: Decision = {
          id: 'temp',
          title: 'Perspective Analysis',
          description: '',
          context: context || {
            domain: 'mixed',
            urgency: 'medium',
            reversibility: 'reversible',
            stakeholders: [],
            timeHorizon: { shortTerm: '1w', mediumTerm: '1m', longTerm: '6m' }
          },
          alternatives: [alternative],
          createdAt: new Date(),
          status: 'evaluating'
        };
        
        const evaluations = await evaluator.evaluateDecision(tempDecision);
        
        return new Response(JSON.stringify({
          perspectives: evaluations[0].perspectives,
          impactScores: evaluations[0].impactScores,
          insights: evaluations[0].insights
        }), { headers: corsHeaders });
      }

      // ========== GET HISTORY ==========
      if (path === '/history' && req.method === 'GET') {
        return new Response(JSON.stringify(history), { headers: corsHeaders });
      }

      // ========== COMPARE TWO OPTIONS (Simple) ==========
      if (path === '/compare' && req.method === 'POST') {
        const body = await req.json();
        const { optionA, optionB, context } = body;
        
        const decision: Decision = {
          id: crypto.randomUUID(),
          title: `Vergleich: ${optionA} vs ${optionB}`,
          description: 'Direct comparison',
          context: context || {
            domain: 'mixed',
            urgency: 'medium',
            reversibility: 'reversible',
            stakeholders: [{ name: 'Self', type: 'self', influence: 100, impact: 100 }],
            timeHorizon: { shortTerm: '1w', mediumTerm: '1m', longTerm: '6m' }
          },
          alternatives: [
            {
              id: 'a',
              name: optionA,
              description: optionA,
              pros: [],
              cons: []
            },
            {
              id: 'b',
              name: optionB,
              description: optionB,
              pros: [],
              cons: []
            }
          ],
          createdAt: new Date(),
          status: 'evaluating'
        };
        
        const evaluations = await evaluator.evaluateDecision(decision);
        const comparison = await evaluator.compareAlternatives(decision, evaluations);
        
        return new Response(JSON.stringify({
          winner: comparison.alternatives[0].name,
          scores: {
            [optionA]: comparison.alternatives.find(a => a.name === optionA)?.totalScore || 0,
            [optionB]: comparison.alternatives.find(a => a.name === optionB)?.totalScore || 0
          },
          reasoning: comparison.reasoning,
          tradeoffs: comparison.tradeoffs
        }), { headers: corsHeaders });
      }

      // ========== EXPORT DECISION ==========
      if (path.startsWith('/export/') && req.method === 'POST') {
        const id = path.split('/')[2];
        const decision = decisions.get(id);
        
        if (!decision) {
          return new Response(JSON.stringify({ error: 'Decision not found' }), { 
            status: 404, 
            headers: corsHeaders 
          });
        }
        
        const body: ExportFormat = await req.json();
        
        if (body.format === 'markdown') {
          const markdown = generateMarkdownExport(decision);
          return new Response(markdown, { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'text/markdown' 
            } 
          });
        }
        
        // Default: JSON
        return new Response(JSON.stringify(decision, null, 2), { headers: corsHeaders });
      }

      // ========== STATISTICS ==========
      if (path === '/stats' && req.method === 'GET') {
        const stats = {
          totalDecisions: decisions.size,
          byStatus: {
            pending: Array.from(decisions.values()).filter(d => d.status === 'pending').length,
            evaluating: Array.from(decisions.values()).filter(d => d.status === 'evaluating').length,
            evaluated: Array.from(decisions.values()).filter(d => d.status === 'evaluated').length,
            decided: Array.from(decisions.values()).filter(d => d.status === 'decided').length
          },
          byDomain: {} as Record<string, number>,
          patterns: history.patterns.length,
          learnings: history.learnings.length
        };
        
        // Count by domain
        Array.from(decisions.values()).forEach(d => {
          const domain = d.context.domain;
          stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
        });
        
        return new Response(JSON.stringify(stats), { headers: corsHeaders });
      }

      // ========== ROOT ==========
      if (path === '/') {
        return new Response(JSON.stringify({
          name: 'Conscious Decision Framework API',
          version: '1.0.0',
          description: 'Open-Source Tool zur bewussten Bewertung von Entscheidungen mit Multi-Perspektiven-Analyse',
          port: PORT,
          endpoints: {
            health: 'GET /health',
            evaluate: 'POST /evaluate',
            quickEval: 'POST /quick-eval',
            compare: 'POST /compare',
            perspectives: 'POST /perspectives',
            decisions: 'GET /decisions',
            decisionById: 'GET /decisions/:id',
            history: 'GET /history',
            export: 'POST /export/:id',
            stats: 'GET /stats'
          },
          examples: {
            quickEval: {
              question: 'Soll ich heute Sport machen?',
              option1: 'Ja, jetzt sofort',
              option2: 'Nein, morgen',
              option3: 'Vielleicht später'
            },
            compare: {
              optionA: 'Remote arbeiten',
              optionB: 'Ins Büro gehen'
            }
          }
        }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('❌ Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
});

function generateMarkdownExport(decision: Decision): string {
  let md = `# ${decision.title}\n\n`;
  md += `**Status:** ${decision.status}\n`;
  md += `**Erstellt:** ${decision.createdAt.toISOString()}\n`;
  md += `**Kontext:** ${decision.context.domain} | ${decision.context.urgency} | ${decision.context.reversibility}\n\n`;
  
  md += `## Alternativen\n\n`;
  decision.alternatives.forEach((alt, idx) => {
    md += `### ${idx + 1}. ${alt.name}\n\n`;
    md += `${alt.description}\n\n`;
    
    if (alt.pros.length > 0) {
      md += `**Vorteile:**\n`;
      alt.pros.forEach(pro => md += `- ${pro}\n`);
      md += '\n';
    }
    
    if (alt.cons.length > 0) {
      md += `**Nachteile:**\n`;
      alt.cons.forEach(con => md += `- ${con}\n`);
      md += '\n';
    }
  });
  
  return md;
}

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🧠 CONSCIOUS DECISION FRAMEWORK - RUNNING                        ║
╠════════════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                                      ║
║  API: http://localhost:${PORT}                                      ║
║  Health: http://localhost:${PORT}/health                            ║
║                                                                    ║
║  📊 Endpoints verfügbar:                                          ║
║     POST   /evaluate          - Vollständige Entscheidungsanalyse ║
║     POST   /quick-eval        - Schnelle Bewertung (2-3 Optionen) ║
║     POST   /compare           - Direkt 2 Optionen vergleichen     ║
║     POST   /perspectives      - Perspektiven für Option abrufen   ║
║     GET    /decisions         - Alle Entscheidungen listen        ║
║     GET    /decisions/:id     - Spezifische Entscheidung          ║
║     GET    /history           - Entscheidungshistorie             ║
║     GET    /stats             - Statistiken                       ║
║     POST   /export/:id        - Entscheidung exportieren          ║
║                                                                    ║
║  🎯 Mission: Bewusste, ethische, ganzheitliche Entscheidungen     ║
╚════════════════════════════════════════════════════════════════════╝
`);

export { server, evaluator, decisions, history };
