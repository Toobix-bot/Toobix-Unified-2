// Lightweight renderer without React - uses the preload bridge (window.electronAPI).

// Update when a new tunnel is created
const MCP_TUNNEL_URL = 'https://multiplicative-unapprehendably-marisha.ngrok-free.dev';
const POLL_INTERVAL = 8000;

const coreContainer = document.getElementById('core-status');
const serviceContainer = document.getElementById('service-status');
const mcpLink = document.getElementById('mcp-tunnel');
const lastUpdatedLabel = document.getElementById('last-updated');
const liveTitle = document.getElementById('live-title');
const runningBadge = document.getElementById('running-count');

let servicesCache = [];

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

function renderPanels(services, statuses) {
  if (liveTitle) {
    liveTitle.textContent = `Live System Monitor (${services.length} Services)`;
  }

  if (runningBadge) {
    const running = Object.values(statuses || {}).filter((s) => s === 'running').length;
    runningBadge.textContent = `${running}/${services.length} online`;
  }

  const infra = services.filter(s => s.category !== 'creative');
  const creative = services.filter(s => s.category === 'creative');

  if (coreContainer) {
    const fragment = document.createDocumentFragment();
    infra.forEach((service) => fragment.appendChild(renderServiceCard(service, statuses?.[service.id] || 'unknown')));
    coreContainer.innerHTML = '';
    coreContainer.appendChild(fragment);
  }

  if (serviceContainer) {
    const fragment = document.createDocumentFragment();
    creative.forEach((service) => fragment.appendChild(renderServiceCard(service, statuses?.[service.id] || 'unknown')));
    serviceContainer.innerHTML = '';
    serviceContainer.appendChild(fragment);
  }
}

async function refreshAll() {
  if (!window.electronAPI) {
    const msg = '<div class="status-card">Electron Bridge nicht geladen (preload).</div>';
    if (coreContainer) coreContainer.innerHTML = msg;
    if (serviceContainer) serviceContainer.innerHTML = msg;
    return;
  }

  try {
    if (!servicesCache.length) {
      servicesCache = await window.electronAPI.getServices();
    }
    const statuses = await window.electronAPI.getAllServiceStatus();
    renderPanels(servicesCache, statuses);
  } catch (err) {
    const msg = `<div class="status-card">Service-Liste konnte nicht geladen werden: ${err?.message || err}</div>`;
    if (coreContainer) coreContainer.innerHTML = msg;
    if (serviceContainer) serviceContainer.innerHTML = msg;
  }
}

function bootstrap() {
  wireBadges();
  refreshAll();
  refreshClock();
  setInterval(refreshAll, POLL_INTERVAL);
  setInterval(refreshClock, 1000);
}

document.addEventListener('DOMContentLoaded', bootstrap);
