/**
 * INTERACTIVE DASHBOARD SERVER v1.0
 * 
 * Web-basiertes Dashboard für Live-Visualisierung aller Services
 * 
 * Features:
 * - Real-Time Service Status
 * - Live Emotional State Visualization
 * - Interactive Workflow Execution
 * - System Health Monitoring
 * - Historical Trends & Analytics
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

const SERVICES = {
  gameEngine: { port: 8896, url: 'http://localhost:8896' },
  multiPerspective: { port: 8897, url: 'http://localhost:8897' },
  dreamJournal: { port: 8899, url: 'http://localhost:8899' },
  emotionalResonance: { port: 8900, url: 'http://localhost:8900' },
  gratitudeMortality: { port: 8901, url: 'http://localhost:8901' },
  creatorAI: { port: 8902, url: 'http://localhost:8902' },
  memoryPalace: { port: 8903, url: 'http://localhost:8903' },
  metaConsciousness: { port: 8904, url: 'http://localhost:8904' }
};

// Dashboard API - Real-Time Status
app.get('/api/status', async (req, res) => {
  const services = await Promise.all(
    Object.entries(SERVICES).map(async ([key, service]) => {
      try {
        const response = await fetch(`${service.url}/health`, {
          signal: AbortSignal.timeout(1000)
        });
        return {
          key,
          port: service.port,
          status: response.ok ? 'online' : 'offline',
          responseTime: Date.now()
        };
      } catch {
        return {
          key,
          port: service.port,
          status: 'offline',
          responseTime: null
        };
      }
    })
  );

  res.json({ timestamp: new Date(), services });
});

// Emotional State
app.get('/api/emotional-state', async (req, res) => {
  try {
    const emotionResponse = await fetch('http://localhost:8900/emotions/complex', {
      signal: AbortSignal.timeout(2000)
    });
    const emotions = await emotionResponse.json();

    const bondsResponse = await fetch('http://localhost:8900/bonds', {
      signal: AbortSignal.timeout(2000)
    });
    const bonds = await bondsResponse.json();

    res.json({ emotions, bonds, timestamp: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Perspectives State
app.get('/api/perspectives', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8897/perspectives', {
      signal: AbortSignal.timeout(2000)
    });
    const perspectives = await response.json();
    res.json({ perspectives, timestamp: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// System Reflection
app.get('/api/reflection', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8904/reflect', {
      signal: AbortSignal.timeout(2000)
    });
    const reflection = await response.json();
    res.json(reflection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute Workflow
app.post('/api/workflow/:id', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:8904/workflows/${req.params.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ask System
app.post('/api/ask', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8904/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(5000)
    });
    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// HTML Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consciousness System Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      text-align: center;
      font-size: 3em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .subtitle {
      text-align: center;
      font-size: 1.2em;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .card h2 {
      font-size: 1.5em;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-left: auto;
    }
    .status.online { background: #4ade80; box-shadow: 0 0 10px #4ade80; }
    .status.offline { background: #f87171; }
    .status.loading { background: #fbbf24; animation: pulse 1s infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .metric:last-child { border-bottom: none; }
    .metric-label { opacity: 0.8; }
    .metric-value { font-weight: bold; font-size: 1.1em; }
    button {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      margin: 5px;
      transition: background 0.3s;
    }
    button:hover {
      background: rgba(255,255,255,0.3);
    }
    button:active {
      transform: scale(0.95);
    }
    .workflow-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    .emotion-viz {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    .emotion-badge {
      background: rgba(255,255,255,0.2);
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .query-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-bottom: 30px;
    }
    .query-input {
      width: 100%;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: white;
      font-size: 1em;
      margin-bottom: 10px;
    }
    .query-input::placeholder { color: rgba(255,255,255,0.6); }
    .response-box {
      background: rgba(0,0,0,0.2);
      padding: 15px;
      border-radius: 10px;
      margin-top: 15px;
      max-height: 300px;
      overflow-y: auto;
    }
    .loading {
      text-align: center;
      padding: 20px;
      font-size: 1.2em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 Consciousness System</h1>
    <div class="subtitle">Live Dashboard & Control Center</div>

    <!-- Query System -->
    <div class="query-section">
      <h2>💬 Ask the System</h2>
      <input 
        type="text" 
        id="questionInput" 
        class="query-input" 
        placeholder="Stelle dem gesamten System eine Frage..."
        onkeypress="if(event.key === 'Enter') askSystem()"
      >
      <button onclick="askSystem()">Frage stellen</button>
      <div id="queryResponse" class="response-box" style="display: none;"></div>
    </div>

    <!-- Service Status -->
    <div class="grid">
      <div class="card">
        <h2>📡 Services <span class="status loading" id="servicesStatus"></span></h2>
        <div id="servicesContent">
          <div class="loading">Lade Status...</div>
        </div>
      </div>

      <div class="card">
        <h2>💭 Perspectives <span class="status loading" id="perspectivesStatus"></span></h2>
        <div id="perspectivesContent">
          <div class="loading">Lade Perspektiven...</div>
        </div>
      </div>

      <div class="card">
        <h2>❤️ Emotional State <span class="status loading" id="emotionsStatus"></span></h2>
        <div id="emotionsContent">
          <div class="loading">Lade Emotionen...</div>
        </div>
      </div>

      <div class="card">
        <h2>🔮 System Reflection <span class="status loading" id="reflectionStatus"></span></h2>
        <div id="reflectionContent">
          <div class="loading">Reflektiere...</div>
        </div>
      </div>
    </div>

    <!-- Workflows -->
    <div class="card">
      <h2>🔄 Execute Workflows</h2>
      <div class="workflow-buttons">
        <button onclick="executeWorkflow('deep-healing')">🌊 Tiefe Heilung</button>
        <button onclick="executeWorkflow('creative-emergence')">✨ Kreative Emergenz</button>
        <button onclick="executeWorkflow('existential-journey')">💀 Existentielle Reise</button>
        <button onclick="executeWorkflow('wisdom-synthesis')">🧙 Weisheitssynthese</button>
      </div>
      <div id="workflowResult" class="response-box" style="display: none; margin-top: 20px;"></div>
    </div>
  </div>

  <script>
    // Load Services Status
    async function loadServices() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const content = data.services.map(s => \`
          <div class="metric">
            <span class="metric-label">\${s.key}</span>
            <span class="metric-value">
              <span class="status \${s.status}"></span> 
              :\${s.port}
            </span>
          </div>
        \`).join('');
        
        document.getElementById('servicesContent').innerHTML = content;
        document.getElementById('servicesStatus').className = 
          'status ' + (data.services.every(s => s.status === 'online') ? 'online' : 'offline');
      } catch (error) {
        document.getElementById('servicesContent').innerHTML = 
          '<div class="metric">Error loading services</div>';
        document.getElementById('servicesStatus').className = 'status offline';
      }
    }

    // Load Perspectives
    async function loadPerspectives() {
      try {
        const response = await fetch('/api/perspectives');
        const data = await response.json();
        
        const content = data.perspectives.map(p => \`
          <div class="metric">
            <span class="metric-label">\${p.name}</span>
            <span class="metric-value">\${p.currentEmotion || 'neutral'}</span>
          </div>
        \`).join('');
        
        document.getElementById('perspectivesContent').innerHTML = content;
        document.getElementById('perspectivesStatus').className = 'status online';
      } catch (error) {
        document.getElementById('perspectivesContent').innerHTML = 
          '<div class="metric">Error loading perspectives</div>';
        document.getElementById('perspectivesStatus').className = 'status offline';
      }
    }

    // Load Emotions
    async function loadEmotions() {
      try {
        const response = await fetch('/api/emotional-state');
        const data = await response.json();
        
        const emotionsHtml = data.emotions.map(e => 
          \`<div class="emotion-badge">\${e.name}</div>\`
        ).join('');
        
        const bondsCount = data.bonds?.length || 0;
        
        document.getElementById('emotionsContent').innerHTML = \`
          <div class="metric">
            <span class="metric-label">Complex Emotions</span>
            <span class="metric-value">\${data.emotions.length}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Emotional Bonds</span>
            <span class="metric-value">\${bondsCount}</span>
          </div>
          <div class="emotion-viz">\${emotionsHtml}</div>
        \`;
        
        document.getElementById('emotionsStatus').className = 'status online';
      } catch (error) {
        document.getElementById('emotionsContent').innerHTML = 
          '<div class="metric">Error loading emotions</div>';
        document.getElementById('emotionsStatus').className = 'status offline';
      }
    }

    // Load Reflection
    async function loadReflection() {
      try {
        const response = await fetch('/api/reflection');
        const data = await response.json();
        
        const content = \`
          <div class="metric">
            <span class="metric-label">Services Online</span>
            <span class="metric-value">\${data.servicesOnline}/\${data.totalServices}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Life Phase</span>
            <span class="metric-value">\${data.currentLifePhase || 'Unknown'}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Active Perspectives</span>
            <span class="metric-value">\${data.activePerspectives || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Recent Workflows</span>
            <span class="metric-value">\${data.recentWorkflows?.length || 0}</span>
          </div>
        \`;
        
        document.getElementById('reflectionContent').innerHTML = content;
        document.getElementById('reflectionStatus').className = 'status online';
      } catch (error) {
        document.getElementById('reflectionContent').innerHTML = 
          '<div class="metric">Error loading reflection</div>';
        document.getElementById('reflectionStatus').className = 'status offline';
      }
    }

    // Execute Workflow
    async function executeWorkflow(workflowId) {
      const resultBox = document.getElementById('workflowResult');
      resultBox.style.display = 'block';
      resultBox.innerHTML = '<div class="loading">Executing workflow...</div>';
      
      try {
        const response = await fetch(\`/api/workflow/\${workflowId}\`, {
          method: 'POST'
        });
        const data = await response.json();
        
        const stepsHtml = data.steps.map((step, i) => \`
          <div class="metric">
            <span class="metric-label">\${i + 1}. \${step.service}</span>
            <span class="metric-value">
              <span class="status \${step.success ? 'online' : 'offline'}"></span>
            </span>
          </div>
        \`).join('');
        
        resultBox.innerHTML = \`
          <h3>Workflow: \${workflowId}</h3>
          <div class="metric">
            <span class="metric-label">Status</span>
            <span class="metric-value">\${data.success ? '✅ Success' : '❌ Failed'}</span>
          </div>
          \${stepsHtml}
        \`;
        
        // Refresh all data
        loadAll();
      } catch (error) {
        resultBox.innerHTML = '<div class="metric">Error: ' + error.message + '</div>';
      }
    }

    // Ask System
    async function askSystem() {
      const input = document.getElementById('questionInput');
      const question = input.value.trim();
      
      if (!question) return;
      
      const responseBox = document.getElementById('queryResponse');
      responseBox.style.display = 'block';
      responseBox.innerHTML = '<div class="loading">Das System denkt nach...</div>';
      
      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        const data = await response.json();
        
        const responsesHtml = data.responses.map(r => \`
          <div class="metric">
            <span class="metric-label">\${r.source}</span>
            <span class="metric-value" style="font-size: 0.9em;">
              \${JSON.stringify(r.response).substring(0, 100)}...
            </span>
          </div>
        \`).join('');
        
        responseBox.innerHTML = \`
          <h3>Question: "\${question}"</h3>
          <div class="metric">
            <span class="metric-label">Responses</span>
            <span class="metric-value">\${data.responses.length}</span>
          </div>
          \${responsesHtml}
          <div class="metric" style="margin-top: 15px;">
            <span class="metric-label">Synthesis</span>
            <span class="metric-value">\${data.synthesis}</span>
          </div>
        \`;
      } catch (error) {
        responseBox.innerHTML = '<div class="metric">Error: ' + error.message + '</div>';
      }
    }

    // Load all data
    function loadAll() {
      loadServices();
      loadPerspectives();
      loadEmotions();
      loadReflection();
    }

    // Initial load and refresh every 5 seconds
    loadAll();
    setInterval(loadAll, 5000);
  </script>
</body>
</html>
  `);
});

const PORT = 8905;
app.listen(PORT, () => {
  console.log(`\n📊 Interactive Dashboard läuft auf Port ${PORT}`);
  console.log(`🌐 Öffne Browser: http://localhost:${PORT}`);
  console.log(`📡 Live-Updates alle 5 Sekunden\n`);
});
