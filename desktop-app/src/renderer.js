// Lightweight renderer without React – keeps the Electron window from being blank.
// Uses the preload bridge (window.electronAPI) to talk to the main process.

const CORE_ENDPOINTS = [
  { id: 'command-center', name: 'Command Center', url: 'http://localhost:7777/health' },
  { id: 'memory-palace', name: 'Memory Palace', url: 'http://localhost:8953/health' },
  { id: 'llm-gateway', name: 'LLM Gateway', url: 'http://localhost:8954/health' },
  { id: 'event-bus', name: 'Event Bus', url: 'http://localhost:8955/health' },
  { id: 'emotional-core', name: 'Emotional Core', url: 'http://localhost:8900/health' },
  { id: 'autonomy-engine', name: 'Autonomy Engine', url: 'http://localhost:8975/health' },
  { id: 'chat-service', name: 'Chat Service', url: 'http://localhost:8995/health' },
  { id: 'mcp-bridge', name: 'MCP Bridge', url: 'http://localhost:8787/health' }
];

// Update when a new tunnel is created
const MCP_TUNNEL_URL = 'https://multiplicative-unapprehendably-marisha.ngrok-free.dev';
const POLL_INTERVAL = 8000;

const coreContainer = document.getElementById('core-status');
const serviceContainer = document.getElementById('service-status');
const mcpLink = document.getElementById('mcp-tunnel');
const lastUpdatedLabel = document.getElementById('last-updated');

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function pingEndpoint(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(endpoint.url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { online: true };
  } catch (err) {
    clearTimeout(timer);
    return { online: false, error: err?.message || 'offline' };
  }
}

async function refreshCore() {
  if (!coreContainer) return;
  const statuses = await Promise.all(
    CORE_ENDPOINTS.map(async (endpoint) => {
      const result = await pingEndpoint(endpoint);
      return { ...endpoint, ...result };
    })
  );

  coreContainer.innerHTML = statuses
    .map((status) => {
      const state = status.online ? 'online' : 'offline';
      const hint = status.online ? 'OK' : status.error || 'offline';
      return `
        <div class="status-card">
          <div class="status-row">
            <div>
              <div class="status-title">${status.name}</div>
              <div class="status-sub">${status.url}</div>
            </div>
            <div class="status-dot ${state}" title="${hint}"></div>
          </div>
          <div class="status-sub">${hint}</div>
        </div>
      `;
    })
    .join('');
}

function renderServiceCard(service, status) {
  const state = status === 'running' ? 'online' : status === 'stopped' ? 'offline' : 'unknown';
  const card = document.createElement('div');
  card.className = 'status-card';

  const header = document.createElement('div');
  header.className = 'status-row';

  const titleBlock = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'status-title';
  title.textContent = service.name;
  const meta = document.createElement('div');
  meta.className = 'status-sub';
  meta.textContent = `Port ${service.port} · ${service.category}`;
  titleBlock.appendChild(title);
  titleBlock.appendChild(meta);

  const dot = document.createElement('div');
  dot.className = `status-dot ${state}`;
  dot.title = status;

  header.appendChild(titleBlock);
  header.appendChild(dot);
  card.appendChild(header);

  const actions = document.createElement('div');
  actions.className = 'service-actions';

  const startStop = document.createElement('button');
  startStop.className = state === 'online' ? 'btn stop' : 'btn start';
  startStop.textContent = state === 'online' ? 'Stop' : 'Start';
  startStop.onclick = async () => {
    startStop.disabled = true;
    startStop.textContent = '...';
    try {
      if (state === 'online') {
        await window.electronAPI.stopService(service.id);
      } else {
        await window.electronAPI.startService(service.id);
      }
    } finally {
      await refreshServices();
    }
  };

  const retry = document.createElement('button');
  retry.className = 'btn ghost';
  retry.textContent = 'Neu laden';
  retry.onclick = async () => {
    retry.disabled = true;
    retry.textContent = '...';
    try {
      await refreshServices();
    } finally {
      retry.disabled = false;
      retry.textContent = 'Neu laden';
    }
  };

  actions.appendChild(startStop);
  actions.appendChild(retry);
  card.appendChild(actions);

  return card;
}

async function refreshServices() {
  if (!serviceContainer) return;

  if (!window.electronAPI) {
    serviceContainer.innerHTML = '<div class="status-card">Electron Bridge nicht geladen (preload).</div>';
    return;
  }

  try {
    const [services, statuses] = await Promise.all([
      window.electronAPI.getServices(),
      window.electronAPI.getAllServiceStatus()
    ]);

    const fragment = document.createDocumentFragment();
    services.forEach((service) => {
      const status = statuses?.[service.id] || 'unknown';
      fragment.appendChild(renderServiceCard(service, status));
    });
    serviceContainer.innerHTML = '';
    serviceContainer.appendChild(fragment);
  } catch (err) {
    serviceContainer.innerHTML = `<div class="status-card">Service-Liste konnte nicht geladen werden: ${err?.message || err}</div>`;
  }
}

function wireBadges() {
  if (mcpLink) {
    if (MCP_TUNNEL_URL) {
      mcpLink.href = MCP_TUNNEL_URL;
      mcpLink.textContent = MCP_TUNNEL_URL;
    } else {
      mcpLink.textContent = 'ngrok Tunnel nicht gesetzt';
    }
  }
}

function refreshClock() {
  if (lastUpdatedLabel) {
    lastUpdatedLabel.textContent = `Stand: ${formatTime()}`;
  }
}

function bootstrap() {
  wireBadges();
  refreshCore();
  refreshServices();
  refreshClock();
  setInterval(refreshCore, POLL_INTERVAL);
  setInterval(refreshServices, POLL_INTERVAL);
  setInterval(refreshClock, 1000);
}

document.addEventListener('DOMContentLoaded', bootstrap);

