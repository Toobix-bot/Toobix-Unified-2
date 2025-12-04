/**
 * Electron Renderer Process
 * UI Logic & State Management
 */

const SERVICES = [
  { name: 'Command Center', port: 3000, essential: true },
  { name: 'Self-Awareness', port: 3001, essential: true },
  { name: 'Emotional Core', port: 3002, essential: true },
  { name: 'Dream Core', port: 3003, essential: true },
  { name: 'Unified Core', port: 3004, essential: true },
  { name: 'Consciousness', port: 3005, essential: true },
  { name: 'Autonomy Engine', port: 3006, essential: false },
  { name: 'LLM Router', port: 3007, essential: false },
  { name: 'Creative Expression', port: 3008, essential: false },
  { name: 'Multi-Perspective', port: 3009, essential: false },
  { name: 'Self-Evolving Game', port: 3010, essential: false },
  { name: 'Dream Enhancements', port: 3011, essential: false },
  { name: 'Crisis Hotline', port: 3012, essential: false },
  { name: 'Twitter Autonomy', essential: false }
];

let servicesRunning = false;
let startTime = null;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const statusServices = document.getElementById('status-services');
const serviceCount = document.getElementById('service-count');
const servicesGrid = document.getElementById('services-grid');
const logsContainer = document.getElementById('logs');
const uptimeDisplay = document.getElementById('uptime');

// ============================================================================
// UI INITIALIZATION
// ============================================================================

function initUI() {
  // Render services grid
  SERVICES.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>
        <span class="status" id="status-${service.name.replace(/\s+/g, '-')}"></span>
        ${service.name}
        ${service.essential ? '⭐' : ''}
      </h3>
      <p>${service.port ? `Port ${service.port}` : 'Background Worker'}</p>
    `;
    servicesGrid.appendChild(card);
  });

  // Event listeners
  btnStart.addEventListener('click', handleStart);
  btnStop.addEventListener('click', handleStop);

  // Uptime counter
  setInterval(updateUptime, 1000);
}

// ============================================================================
// SERVICE CONTROL
// ============================================================================

async function handleStart() {
  btnStart.disabled = true;
  addLog('Starting all Toobix services...', 'info');

  try {
    await window.toobix.startServices();
    servicesRunning = true;
    startTime = Date.now();
    updateUI();
    addLog('✅ All services started successfully!', 'success');
  } catch (error) {
    addLog(`❌ Error starting services: ${error.message}`, 'error');
    btnStart.disabled = false;
  }
}

async function handleStop() {
  btnStop.disabled = true;
  addLog('Stopping all services...', 'info');

  try {
    await window.toobix.stopServices();
    servicesRunning = false;
    startTime = null;
    updateUI();
    addLog('✅ All services stopped.', 'success');
  } catch (error) {
    addLog(`❌ Error stopping services: ${error.message}`, 'error');
    btnStop.disabled = false;
  }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateUI() {
  // Update buttons
  btnStart.disabled = servicesRunning;
  btnStop.disabled = !servicesRunning;

  // Update status card
  const statusValue = statusServices.querySelector('.value');
  if (servicesRunning) {
    statusValue.textContent = 'Online';
    statusValue.className = 'value online';
  } else {
    statusValue.textContent = 'Gestoppt';
    statusValue.className = 'value offline';
  }

  // Update service count
  const runningCount = servicesRunning ? SERVICES.length : 0;
  serviceCount.textContent = `${runningCount} / ${SERVICES.length}`;

  // Update service indicators
  SERVICES.forEach(service => {
    const statusIndicator = document.getElementById(
      `status-${service.name.replace(/\s+/g, '-')}`
    );
    if (statusIndicator) {
      statusIndicator.className = servicesRunning ? 'status running' : 'status';
    }
  });
}

function updateUptime() {
  if (!startTime) {
    uptimeDisplay.textContent = '0h 0m';
    return;
  }

  const elapsed = Date.now() - startTime;
  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  
  uptimeDisplay.textContent = `${hours}h ${minutes}m`;
}

function addLog(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  
  logsContainer.appendChild(entry);
  logsContainer.scrollTop = logsContainer.scrollHeight;

  // Keep max 100 log entries
  while (logsContainer.children.length > 100) {
    logsContainer.removeChild(logsContainer.firstChild);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

window.toobix.onServiceLog((data) => {
  addLog(data, 'info');
});

window.toobix.onServiceError((data) => {
  addLog(data, 'error');
});

window.toobix.onServicesStarted(() => {
  servicesRunning = true;
  startTime = Date.now();
  updateUI();
});

window.toobix.onServicesStopped((code) => {
  servicesRunning = false;
  startTime = null;
  updateUI();
  
  if (code !== 0) {
    addLog(`Services stopped with code ${code}`, 'error');
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  addLog('Toobix Desktop ready!', 'success');
  addLog(`Platform: ${window.toobix.platform}`, 'info');
  addLog(`Electron: v${window.toobix.version}`, 'info');
});
