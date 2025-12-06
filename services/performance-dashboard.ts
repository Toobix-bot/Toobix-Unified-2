/**
 * 📊 TOOBIX REAL-TIME PERFORMANCE DASHBOARD
 * 
 * Echtzeit-Monitoring aller 24 Services
 * Port: 8899
 */

const SERVICES = [
  { name: 'toobix-command-center', port: 7777, role: 'orchestrator' },
  { name: 'self-awareness-core', port: 8970, role: 'core' },
  { name: 'unified-core-service', port: 8000, role: 'core' },
  { name: 'unified-consciousness-service', port: 8002, role: 'core' },
  { name: 'autonomy-engine', port: 8975, role: 'decision' },
  { name: 'multi-llm-router', port: 8959, role: 'ai' },
  { name: 'wellness-safety-guardian', port: 8921, role: 'safety' },
  { name: 'life-simulation-engine', port: 8914, role: 'simulation' },
  { name: 'service-mesh', port: 8910, role: 'network' },
  { name: 'hardware-awareness-v2', port: 8940, role: 'monitoring' },
  { name: 'twitter-autonomy', port: 8965, role: 'social' },
  { name: 'unified-communication-service', port: 8001, role: 'communication' },
  { name: 'toobix-chat-service', port: 8995, role: 'interaction' },
  { name: 'emotional-support-service', port: 8985, role: 'support' },
  { name: 'autonomous-web-service', port: 8980, role: 'web' },
  { name: 'story-engine-service', port: 8932, role: 'creative' },
  { name: 'translation-service', port: 8931, role: 'utility' },
  { name: 'user-profile-service', port: 8904, role: 'data' },
  { name: 'rpg-world-service', port: 8933, role: 'gaming' },
  { name: 'game-logic-service', port: 8936, role: 'gaming' },
  { name: 'data-science-service', port: 8935, role: 'analytics' },
  { name: 'performance-service', port: 8934, role: 'monitoring' },
  { name: 'data-sources-service', port: 8930, role: 'data' },
  { name: 'gratitude-mortality-service', port: 8901, role: 'philosophical' },
];

interface ServiceMetrics {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  requestCount: number;
  errorCount: number;
  lastCheck: Date;
}

const metrics = new Map<string, ServiceMetrics>();
const clients = new Set<any>();

// Initialisiere Metriken
SERVICES.forEach(svc => {
  metrics.set(svc.name, {
    name: svc.name,
    port: svc.port,
    status: 'offline',
    responseTime: 0,
    uptime: 0,
    requestCount: 0,
    errorCount: 0,
    lastCheck: new Date()
  });
});

async function checkService(service: typeof SERVICES[0]): Promise<void> {
  const metric = metrics.get(service.name)!;
  const start = Date.now();
  
  try {
    const response = await fetch(`http://localhost:${service.port}/health`, {
      signal: AbortSignal.timeout(3000)
    });
    
    const responseTime = Date.now() - start;
    
    metric.status = response.ok ? 'online' : 'degraded';
    metric.responseTime = responseTime;
    metric.requestCount++;
    metric.lastCheck = new Date();
    
    if (metric.status === 'online') {
      metric.uptime = Date.now();
    }
  } catch (error) {
    metric.status = 'offline';
    metric.errorCount++;
    metric.responseTime = Date.now() - start;
    metric.lastCheck = new Date();
  }
}

async function monitorServices(): Promise<void> {
  while (true) {
    await Promise.all(SERVICES.map(checkService));
    broadcastMetrics();
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
  }
}

function broadcastMetrics(): void {
  const data = Array.from(metrics.values());
  const message = JSON.stringify({ type: 'metrics', data });
  
  clients.forEach(client => {
    try {
      client.send(message);
    } catch (error) {
      clients.delete(client);
    }
  });
}

function getHTMLDashboard(): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toobix Services Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 30px; font-size: 2.5em; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 15px;
      text-align: center;
    }
    .stat-value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
    .stat-label { opacity: 0.8; }
    .services {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }
    .service-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 15px;
      border-radius: 10px;
      border-left: 4px solid #4ade80;
      transition: transform 0.2s;
    }
    .service-card:hover { transform: translateY(-5px); }
    .service-card.offline { border-left-color: #ef4444; }
    .service-card.degraded { border-left-color: #f59e0b; }
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .service-name { font-weight: bold; font-size: 1.1em; }
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      background: #4ade80;
    }
    .status-badge.offline { background: #ef4444; }
    .status-badge.degraded { background: #f59e0b; }
    .service-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .metric { 
      background: rgba(0,0,0,0.2);
      padding: 8px;
      border-radius: 5px;
      font-size: 0.9em;
    }
    .metric-label { opacity: 0.7; font-size: 0.8em; }
    .metric-value { font-weight: bold; font-size: 1.2em; }
    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.75em;
      background: rgba(255,255,255,0.2);
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Toobix Services Dashboard</h1>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Services Online</div>
        <div class="stat-value" id="online-count">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Response Time</div>
        <div class="stat-value" id="avg-response">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Requests</div>
        <div class="stat-value" id="total-requests">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Error Rate</div>
        <div class="stat-value" id="error-rate">-</div>
      </div>
    </div>

    <div class="services" id="services"></div>
  </div>

  <script>
    const ws = new WebSocket('ws://' + window.location.host + '/ws');
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'metrics') {
        updateDashboard(data);
      }
    };

    function updateDashboard(services) {
      const online = services.filter(s => s.status === 'online').length;
      const avgResponse = Math.round(
        services.reduce((sum, s) => sum + s.responseTime, 0) / services.length
      );
      const totalRequests = services.reduce((sum, s) => sum + s.requestCount, 0);
      const totalErrors = services.reduce((sum, s) => sum + s.errorCount, 0);
      const errorRate = totalRequests > 0 
        ? ((totalErrors / totalRequests) * 100).toFixed(2) 
        : '0.00';

      document.getElementById('online-count').textContent = online + '/' + services.length;
      document.getElementById('avg-response').textContent = avgResponse + 'ms';
      document.getElementById('total-requests').textContent = totalRequests.toLocaleString();
      document.getElementById('error-rate').textContent = errorRate + '%';

      const servicesContainer = document.getElementById('services');
      servicesContainer.innerHTML = services.map(service => \`
        <div class="service-card \${service.status}">
          <div class="service-header">
            <div class="service-name">\${service.name}</div>
            <div class="status-badge \${service.status}">\${service.status}</div>
          </div>
          <div class="role-badge">Port \${service.port}</div>
          <div class="service-metrics">
            <div class="metric">
              <div class="metric-label">Response Time</div>
              <div class="metric-value">\${service.responseTime}ms</div>
            </div>
            <div class="metric">
              <div class="metric-label">Requests</div>
              <div class="metric-value">\${service.requestCount}</div>
            </div>
          </div>
        </div>
      \`).join('');
    }
  </script>
</body>
</html>`;
}

const server = Bun.serve({
  port: 8899,
  
  async fetch(req, server) {
    const url = new URL(req.url);
    
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req);
      if (upgraded) {
        return undefined;
      }
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
    
    if (url.pathname === '/') {
      return new Response(getHTMLDashboard(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (url.pathname === '/api/metrics') {
      return Response.json(Array.from(metrics.values()));
    }
    
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', services: metrics.size });
    }
    
    return new Response('Not Found', { status: 404 });
  },
  
  websocket: {
    open(ws) {
      clients.add(ws);
      ws.send(JSON.stringify({ 
        type: 'metrics', 
        data: Array.from(metrics.values()) 
      }));
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {}
  }
});

// Start monitoring
monitorServices();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  📊 TOOBIX PERFORMANCE DASHBOARD                              ║
║  http://localhost:8899                                        ║
╠════════════════════════════════════════════════════════════════╣
║  Monitoring: ${SERVICES.length} Services                                         ║
║  Update Interval: 5 seconds                                   ║
║  WebSocket: Real-time updates                                 ║
╚════════════════════════════════════════════════════════════════╝

🚀 Dashboard is running!
📡 WebSocket server active
🔄 Monitoring all services...
`);
