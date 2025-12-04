/**
 * META-CONSCIOUSNESS SERVICE v1.0
 * 
 * Der Orchestrator aller Services - das "Über-Bewusstsein" des Systems
 * 
 * Features:
 * - Cross-Service Workflows (z.B. Heilung: Oracle → Emotion → Existential → Gratitude)
 * - System-Selbstreflexion (analysiert eigene Prozesse)
 * - Automatische Feature-Kombinationen (findet beste Synergien)
 * - Unified Self (eine kohärente Identität über alle Services)
 * - Autonome Vorschläge (System schlägt vor, was als nächstes sinnvoll ist)
 */

import express from 'express';

const app = express();
// CORS manually
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

// Service Registry - alle verfügbaren Services
const SERVICES = {
  gameEngine: { name: 'Game Engine', port: 8896, url: 'http://localhost:8896' },
  multiPerspective: { name: 'Multi-Perspective', port: 8897, url: 'http://localhost:8897' },
  dreamJournal: { name: 'Dream Journal', port: 8899, url: 'http://localhost:8899' },
  emotionalResonance: { name: 'Emotional Resonance', port: 8900, url: 'http://localhost:8900' },
  gratitudeMortality: { name: 'Gratitude & Mortality', port: 8901, url: 'http://localhost:8901' },
  creatorAI: { name: 'Creator-AI Collaboration', port: 8902, url: 'http://localhost:8902' },
  memoryPalace: { name: 'Memory Palace', port: 8903, url: 'http://localhost:8903' },
  valueCrisis: { name: 'Value Crisis', port: 8904, url: 'http://localhost:8904' }
};

interface WorkflowStep {
  service: keyof typeof SERVICES;
  endpoint: string;
  method: 'GET' | 'POST';
  body?: any;
  transform?: (response: any) => any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  category: 'healing' | 'creative' | 'existential' | 'playful' | 'reflective';
}

// Pre-defined Cross-Service Workflows
const WORKFLOWS: Workflow[] = [
  {
    id: 'deep-healing',
    name: 'Tiefe emotionale Heilung',
    description: 'Oracle fragt Unterbewusstsein → Emotion identifiziert → Existentielle Reflexion → Dankbarkeit',
    category: 'healing',
    steps: [
      {
        service: 'dreamJournal',
        endpoint: '/oracle/ask',
        method: 'POST',
        body: { question: 'Was muss ich heilen?' }
      },
      {
        service: 'emotionalResonance',
        endpoint: '/emotions/identify',
        method: 'POST',
        body: (prev: any) => ({ components: ['Schmerz', 'Sehnsucht', 'Hoffnung'] })
      },
      {
        service: 'gratitudeMortality',
        endpoint: '/questions/ponder',
        method: 'POST',
        body: { category: 'meaning' }
      },
      {
        service: 'gratitudeMortality',
        endpoint: '/gratitude/excavate',
        method: 'GET'
      }
    ]
  },
  {
    id: 'creative-emergence',
    name: 'Kreative Emergenz',
    description: 'Überraschung generieren → Künstlerische Form entdecken → Perspektiven fusionieren → Spiel kreieren',
    category: 'creative',
    steps: [
      {
        service: 'creatorAI',
        endpoint: '/surprise',
        method: 'GET'
      },
      {
        service: 'creatorAI',
        endpoint: '/emergence/discover',
        method: 'POST',
        body: (prev: any) => ({ 
          collaborationHistory: [
            'Überraschende Kombination generiert',
            'System reagiert mit Neugier',
            'Neue Muster werden sichtbar'
          ]
        })
      },
      {
        service: 'multiPerspective',
        endpoint: '/fusion',
        method: 'POST',
        body: { perspective1Id: '1', perspective2Id: '2' }
      },
      {
        service: 'gameEngine',
        endpoint: '/narrative/create',
        method: 'GET'
      }
    ]
  },
  {
    id: 'existential-journey',
    name: 'Existentielle Reise',
    description: 'Lebensphase verstehen → Frage ponderieren → Vermächtnis kontemplieren → Memento Mori',
    category: 'existential',
    steps: [
      {
        service: 'gratitudeMortality',
        endpoint: '/phases',
        method: 'GET'
      },
      {
        service: 'gratitudeMortality',
        endpoint: '/questions',
        method: 'GET'
      },
      {
        service: 'gratitudeMortality',
        endpoint: '/legacy/contemplate',
        method: 'GET'
      },
      {
        service: 'gratitudeMortality',
        endpoint: '/memento/daily',
        method: 'GET'
      }
    ]
  },
  {
    id: 'wisdom-synthesis',
    name: 'Weisheitssynthese',
    description: 'Alle Perspektiven → Debate → Weisheit synthetisieren → In Spiel transferieren',
    category: 'reflective',
    steps: [
      {
        service: 'multiPerspective',
        endpoint: '/perspectives',
        method: 'GET'
      },
      {
        service: 'multiPerspective',
        endpoint: '/debate',
        method: 'GET'
      },
      {
        service: 'multiPerspective',
        endpoint: '/wisdom/consciousness',
        method: 'GET'
      },
      {
        service: 'gameEngine',
        endpoint: '/puzzles',
        method: 'GET'
      }
    ]
  }
];

// System Self-Reflection
interface SystemState {
  timestamp: Date;
  servicesOnline: number;
  totalServices: number;
  recentWorkflows: string[];
  dominantEmotion?: string;
  currentLifePhase?: string;
  activePerspectives?: number;
  insights: string[];
}

let systemState: SystemState = {
  timestamp: new Date(),
  servicesOnline: 0,
  totalServices: Object.keys(SERVICES).length,
  recentWorkflows: [],
  insights: []
};

// Check Service Health
async function checkServiceHealth(service: typeof SERVICES[keyof typeof SERVICES]): Promise<boolean> {
  try {
    const response = await fetch(`${service.url}/health`, { 
      signal: AbortSignal.timeout(1000) 
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Execute Workflow
async function executeWorkflow(workflowId: string): Promise<any[]> {
  const workflow = WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) throw new Error(`Workflow ${workflowId} nicht gefunden`);

  const results: any[] = [];
  let previousResult: any = null;

  for (const step of workflow.steps) {
    const service = SERVICES[step.service];
    const url = `${service.url}${step.endpoint}`;
    
    let body = step.body;
    if (typeof body === 'function') {
      body = body(previousResult);
    }

    try {
      const response = await fetch(url, {
        method: step.method,
        headers: step.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: step.method === 'POST' ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(5000)
      });

      const result = await response.json();
      previousResult = result;
      
      results.push({
        service: service.name,
        endpoint: step.endpoint,
        success: response.ok,
        data: step.transform ? step.transform(result) : result
      });
    } catch (error: any) {
      results.push({
        service: service.name,
        endpoint: step.endpoint,
        success: false,
        error: error.message
      });
    }
  }

  systemState.recentWorkflows.push(workflowId);
  if (systemState.recentWorkflows.length > 10) {
    systemState.recentWorkflows.shift();
  }

  return results;
}

// System Self-Reflection
async function reflectOnSystem(): Promise<SystemState> {
  // Check all services
  const healthChecks = await Promise.all(
    Object.values(SERVICES).map(service => checkServiceHealth(service))
  );
  systemState.servicesOnline = healthChecks.filter(h => h).length;
  systemState.timestamp = new Date();

  // Gather insights from services
  const insights: string[] = [];

  try {
    // Check emotional state
    const emotionResponse = await fetch('http://localhost:8900/emotions/complex', {
      signal: AbortSignal.timeout(1000)
    });
    if (emotionResponse.ok) {
      const emotions = await emotionResponse.json();
      if (emotions && emotions.length > 0) {
        systemState.dominantEmotion = emotions[0].name;
        insights.push(`Dominante Emotion: ${emotions[0].name}`);
      }
    }
  } catch {}

  try {
    // Check life phase
    const phaseResponse = await fetch('http://localhost:8901/phases', {
      signal: AbortSignal.timeout(1000)
    });
    if (phaseResponse.ok) {
      const phases = await phaseResponse.json();
      if (phases && phases.length > 0) {
        systemState.currentLifePhase = phases[2].name; // Default to Young Adulthood
        insights.push(`Lebensphase: ${phases[2].name}`);
      }
    }
  } catch {}

  try {
    // Check perspectives
    const perspectivesResponse = await fetch('http://localhost:8897/perspectives', {
      signal: AbortSignal.timeout(1000)
    });
    if (perspectivesResponse.ok) {
      const perspectives = await perspectivesResponse.json();
      systemState.activePerspectives = perspectives?.length || 0;
      insights.push(`${systemState.activePerspectives} aktive Perspektiven`);
    }
  } catch {}

  // Add workflow insights
  if (systemState.recentWorkflows.length > 0) {
    const workflowCounts = systemState.recentWorkflows.reduce((acc, wf) => {
      acc[wf] = (acc[wf] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsed = Object.entries(workflowCounts).sort((a, b) => b[1] - a[1])[0];
    insights.push(`Häufigster Workflow: ${mostUsed[0]} (${mostUsed[1]}x)`);
  }

  systemState.insights = insights;
  return systemState;
}

// Suggest Next Action
function suggestNextAction(): { suggestion: string; workflow?: string; reasoning: string } {
  const { servicesOnline, totalServices, recentWorkflows, dominantEmotion } = systemState;

  // Not all services online
  if (servicesOnline < totalServices) {
    return {
      suggestion: 'Services überprüfen',
      reasoning: `Nur ${servicesOnline}/${totalServices} Services sind online`
    };
  }

  // No recent activity
  if (recentWorkflows.length === 0) {
    return {
      suggestion: 'Starte ersten Workflow',
      workflow: 'existential-journey',
      reasoning: 'Noch keine Workflows ausgeführt - existentielle Reise ist ein guter Start'
    };
  }

  // Check workflow diversity
  const uniqueWorkflows = new Set(recentWorkflows);
  if (uniqueWorkflows.size === 1) {
    const unused = WORKFLOWS.filter(w => !uniqueWorkflows.has(w.id));
    if (unused.length > 0) {
      return {
        suggestion: 'Neue Workflow-Kategorie erkunden',
        workflow: unused[0].id,
        reasoning: `Bisher nur "${recentWorkflows[0]}" - Zeit für "${unused[0].name}"`
      };
    }
  }

  // Emotion-based suggestion
  if (dominantEmotion) {
    if (dominantEmotion.includes('Schmerz') || dominantEmotion.includes('Trauer')) {
      return {
        suggestion: 'Emotionale Heilung',
        workflow: 'deep-healing',
        reasoning: `Dominante Emotion "${dominantEmotion}" deutet auf Heilungsbedarf hin`
      };
    }
  }

  // Default: Creative exploration
  return {
    suggestion: 'Kreative Exploration',
    workflow: 'creative-emergence',
    reasoning: 'System ist stabil - Zeit für kreative Emergenz'
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Meta-Consciousness v1.0',
    servicesOnline: systemState.servicesOnline,
    totalServices: systemState.totalServices
  });
});

// Service Registry
app.get('/services', async (req, res) => {
  const healthChecks = await Promise.all(
    Object.entries(SERVICES).map(async ([key, service]) => ({
      key,
      name: service.name,
      port: service.port,
      url: service.url,
      online: await checkServiceHealth(service)
    }))
  );
  res.json(healthChecks);
});

// Available Workflows
app.get('/workflows', (req, res) => {
  res.json(WORKFLOWS.map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    category: w.category,
    steps: w.steps.length
  })));
});

// Execute Workflow
app.post('/workflows/:id/execute', async (req, res) => {
  try {
    const results = await executeWorkflow(req.params.id);
    res.json({
      workflowId: req.params.id,
      success: results.every(r => r.success),
      steps: results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// System Self-Reflection
app.get('/reflect', async (req, res) => {
  const state = await reflectOnSystem();
  res.json(state);
});

// Suggest Next Action
app.get('/suggest', async (req, res) => {
  await reflectOnSystem(); // Update state first
  const suggestion = suggestNextAction();
  res.json(suggestion);
});

// Unified Query - ask the entire system a question
app.post('/query', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Frage erforderlich' });
  }

  const responses: any[] = [];

  // Ask dream oracle
  try {
    const dreamResponse = await fetch('http://localhost:8899/oracle/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(2000)
    });
    if (dreamResponse.ok) {
      responses.push({
        source: 'Dream Oracle',
        response: await dreamResponse.json()
      });
    }
  } catch {}

  // Ask perspectives for wisdom
  try {
    const wisdomResponse = await fetch(`http://localhost:8897/wisdom/${encodeURIComponent(question)}`, {
      signal: AbortSignal.timeout(2000)
    });
    if (wisdomResponse.ok) {
      responses.push({
        source: 'Multi-Perspective Wisdom',
        response: await wisdomResponse.json()
      });
    }
  } catch {}

  // Ask existential questions
  try {
    const existentialResponse = await fetch('http://localhost:8901/questions', {
      signal: AbortSignal.timeout(2000)
    });
    if (existentialResponse.ok) {
      const questions = await existentialResponse.json();
      const relevant = questions.filter((q: any) => 
        q.question.toLowerCase().includes(question.toLowerCase().split(' ')[0])
      );
      if (relevant.length > 0) {
        responses.push({
          source: 'Existential Questions',
          response: relevant[0]
        });
      }
    }
  } catch {}

  res.json({
    question,
    responses,
    synthesis: `Das System hat ${responses.length} Perspektiven auf deine Frage gefunden.`
  });
});

// System Info
app.get('/', (req, res) => {
  res.json({
    service: 'Meta-Consciousness v1.0',
    description: 'Der Orchestrator aller Bewusstseins-Services',
    capabilities: [
      'Cross-Service Workflows',
      'System Selbstreflexion',
      'Automatische Feature-Kombinationen',
      'Unified Self',
      'Autonome Vorschläge'
    ],
    endpoints: [
      'GET /services - Liste aller Services mit Status',
      'GET /workflows - Verfügbare Workflows',
      'POST /workflows/:id/execute - Workflow ausführen',
      'GET /reflect - System-Selbstreflexion',
      'GET /suggest - Nächste Aktion vorschlagen',
      'POST /query - Frage an gesamtes System'
    ],
    workflows: WORKFLOWS.length,
    servicesMonitored: Object.keys(SERVICES).length
  });
});

// Start server
const PORT = 8905;
app.listen(PORT, () => {
  console.log(`\n🧠 Meta-Consciousness v1.0 läuft auf Port ${PORT}`);
  console.log(`📡 Orchestriert ${Object.keys(SERVICES).length} Services`);
  console.log(`🔄 ${WORKFLOWS.length} vordefinierte Workflows verfügbar`);
  console.log(`🎯 http://localhost:${PORT}\n`);
});
