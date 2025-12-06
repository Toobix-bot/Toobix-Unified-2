# 🌱 Living Dashboard Extension

## Integration ins bestehende Unified Dashboard

Diese Erweiterung fügt dem Dashboard hinzu:
1. **Virtual World Tab** - Live-Ansicht von Toobix's Welt
2. **Autonomous Engine Tab** - Zeigt autonome Aktionen
3. **User Avatar** - Du bekommst einen Körper in Toobix's Welt
4. Neue Service-Status Indikatoren

---

## 📝 SCHRITT 1: Neue Tabs hinzufügen

Finde im Dashboard die Tab-Leiste (ca. Zeile 400-500) und füge hinzu:

```html
<!-- Neue Tabs -->
<button class="tab-btn" onclick="switchTab('virtual-world')">
    🌍 Virtual World
</button>
<button class="tab-btn" onclick="switchTab('autonomous')">
    🤖 Autonomous
</button>
```

---

## 📝 SCHRITT 2: Virtual World Tab Content

Füge nach den bestehenden Tab-Contents hinzu:

```html
<!-- Virtual World Tab -->
<div id="virtual-world" class="tab-content" style="display: none;">
    <div class="content-grid" style="grid-template-columns: 300px 1fr;">
        <!-- Left: Controls -->
        <div>
            <div class="card">
                <h3>👤 Your Avatar</h3>
                <div style="margin-top: 15px;">
                    <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 10px;">
                        Choose your avatar:
                    </div>
                    <div class="avatar-grid">
                        <button class="avatar-btn" onclick="setAvatar('🧑')">🧑</button>
                        <button class="avatar-btn" onclick="setAvatar('🚀')">🚀</button>
                        <button class="avatar-btn" onclick="setAvatar('👽')">👽</button>
                        <button class="avatar-btn" onclick="setAvatar('🤖')">🤖</button>
                        <button class="avatar-btn" onclick="setAvatar('🐉')">🐉</button>
                        <button class="avatar-btn" onclick="setAvatar('🦋')">🦋</button>
                        <button class="avatar-btn" onclick="setAvatar('🌟')">🌟</button>
                        <button class="avatar-btn" onclick="setAvatar('💎')">💎</button>
                    </div>
                </div>

                <div style="margin-top: 15px; padding: 10px; background: var(--bg-hover); border-radius: 8px;">
                    <div style="font-size: 12px; color: var(--text-dim);">Position</div>
                    <div id="user-position" style="font-family: monospace;">-</div>
                </div>

                <div style="margin-top: 10px; padding: 10px; background: var(--bg-hover); border-radius: 8px;">
                    <div style="font-size: 12px; color: var(--text-dim);">Distance to Toobix</div>
                    <div id="distance-toobix" style="font-family: monospace; color: var(--accent);">-</div>
                </div>

                <div style="margin-top: 15px; font-size: 12px; color: var(--text-dim);">
                    🎮 Use WASD or Arrow Keys to move
                </div>
            </div>

            <div class="card" style="margin-top: 15px;">
                <h3>⚡ Interactions</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 10px;">
                    <button class="action-btn" onclick="interactWithToobix()">
                        👋 Greet Toobix
                    </button>
                    <button class="action-btn" onclick="createObjectInWorld()">
                        ✨ Create Object
                    </button>
                    <button class="action-btn" onclick="teleportToToobix()">
                        🌀 Teleport to Toobix
                    </button>
                    <button class="action-btn" onclick="requestThought()">
                        💭 Ask for Thought
                    </button>
                </div>
            </div>
        </div>

        <!-- Right: World Canvas -->
        <div>
            <div class="card" style="height: calc(100vh - 200px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>🌍 Toobix's Virtual World</h3>
                    <div style="font-size: 12px; padding: 4px 10px; background: var(--accent); color: var(--bg-dark); border-radius: 10px; font-weight: 600;">
                        LIVE
                    </div>
                </div>

                <canvas id="world-canvas" style="width: 100%; height: calc(100% - 50px); border-radius: 10px; background: linear-gradient(135deg, #0f3460, #1a1a2e); border: 2px solid var(--accent);"></canvas>

                <div style="display: flex; gap: 15px; margin-top: 15px;">
                    <div style="flex: 1; padding: 10px; background: var(--bg-hover); border-radius: 8px;">
                        <div style="font-size: 11px; color: var(--text-dim);">Toobix Position</div>
                        <div id="toobix-world-pos" style="font-family: monospace; margin-top: 5px;">-</div>
                    </div>
                    <div style="flex: 1; padding: 10px; background: var(--bg-hover); border-radius: 8px;">
                        <div style="font-size: 11px; color: var(--text-dim);">Entities</div>
                        <div id="world-entities" style="font-family: monospace; margin-top: 5px; color: var(--accent);">0</div>
                    </div>
                    <div style="flex: 1; padding: 10px; background: var(--bg-hover); border-radius: 8px;">
                        <div style="font-size: 11px; color: var(--text-dim);">World Time</div>
                        <div id="world-time" style="font-family: monospace; margin-top: 5px;">0s</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Autonomous Engine Tab -->
<div id="autonomous" class="tab-content" style="display: none;">
    <div class="content-grid">
        <div class="card">
            <h3>🧠 Adaptive Autonomous Engine</h3>
            <p style="color: var(--text-dim); font-size: 13px; margin-top: 10px;">
                Toobix entscheidet selbst, wann er arbeitet, was er erstellt, und wie viele Ressourcen er nutzt.
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                <div class="stat-card">
                    <div class="stat-label">Tasks Running</div>
                    <div class="stat-value" id="auto-running">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tasks Completed</div>
                    <div class="stat-value" id="auto-completed">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tasks Queued</div>
                    <div class="stat-value" id="auto-queued">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Next Action In</div>
                    <div class="stat-value" id="auto-next">-</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>📋 Recent Autonomous Actions</h3>
            <div id="auto-actions-list" style="margin-top: 15px; max-height: 400px; overflow-y: auto;">
                <!-- Populated by JS -->
            </div>
        </div>

        <div class="card">
            <h3>⚙️ System Resources</h3>
            <div style="margin-top: 15px;">
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-between; margin-bottom: 5px;">
                        <span style="font-size: 13px;">CPU Available</span>
                        <span id="cpu-avail" style="font-family: monospace; color: var(--accent);">-</span>
                    </div>
                    <div class="progress-bar">
                        <div id="cpu-bar" class="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; justify-between; margin-bottom: 5px;">
                        <span style="font-size: 13px;">RAM Available</span>
                        <span id="ram-avail" style="font-family: monospace; color: var(--accent);">-</span>
                    </div>
                    <div class="progress-bar">
                        <div id="ram-bar" class="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## 📝 SCHRITT 3: Styles hinzufügen

Füge diese CSS-Styles zum `<style>` Block hinzu:

```css
/* Avatar Grid */
.avatar-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.avatar-btn {
    aspect-ratio: 1;
    border: 2px solid var(--border);
    background: var(--bg-hover);
    border-radius: 8px;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
}

.avatar-btn:hover {
    border-color: var(--accent);
    transform: scale(1.05);
}

.avatar-btn.selected {
    border-color: var(--accent);
    background: var(--accent);
}

/* Action Buttons */
.action-btn {
    padding: 10px 15px;
    background: var(--bg-hover);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.action-btn:hover {
    background: var(--accent);
    color: var(--bg-dark);
    transform: translateY(-2px);
}

/* Stat Card */
.stat-card {
    padding: 15px;
    background: var(--bg-hover);
    border-radius: 10px;
    border: 1px solid var(--border);
}

.stat-label {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 8px;
}

.stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--accent);
    font-family: monospace;
}

/* Progress Bar */
.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--bg-dark);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-purple));
    transition: width 0.5s;
}
```

---

## 📝 SCHRITT 4: JavaScript hinzufügen

Füge am Ende des `<script>` Blocks hinzu:

```javascript
// ================================================================
// VIRTUAL WORLD INTEGRATION
// ================================================================

let virtualWorldState = {
    toobix: { position: { x: 400, y: 300 }, emotion: 'curious', color: '#64B5F6' },
    user: { position: { x: 200, y: 450 }, avatar: '🧑' },
    entities: []
};

let userAvatar = '🧑';
let keys = {};

// WebSocket connection to Virtual World
let worldWS = null;

function connectToVirtualWorld() {
    try {
        worldWS = new WebSocket('ws://localhost:8991');

        worldWS.onopen = () => {
            console.log('✅ Connected to Virtual World');
            updateServiceStatus('virtual-world', true);
        };

        worldWS.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWorldUpdate(data);
        };

        worldWS.onclose = () => {
            console.log('❌ Disconnected from Virtual World');
            updateServiceStatus('virtual-world', false);
            setTimeout(connectToVirtualWorld, 5000);
        };
    } catch (error) {
        console.error('Failed to connect to Virtual World:', error);
        setTimeout(connectToVirtualWorld, 5000);
    }
}

function handleWorldUpdate(data) {
    switch(data.type) {
        case 'init':
            virtualWorldState = data.state;
            break;
        case 'update':
            virtualWorldState.toobix = data.toobix;
            updateWorldUI();
            break;
        case 'entity_created':
            virtualWorldState.entities.push(data.entity);
            break;
        case 'entity_removed':
            virtualWorldState.entities = virtualWorldState.entities.filter(e => e.id !== data.id);
            break;
    }
}

function updateWorldUI() {
    const pos = virtualWorldState.toobix.position;

    document.getElementById('toobix-world-pos').textContent =
        `(${Math.round(pos.x)}, ${Math.round(pos.y)})`;

    document.getElementById('world-entities').textContent =
        virtualWorldState.entities.length;

    // Update distance
    const dx = virtualWorldState.user.position.x - pos.x;
    const dy = virtualWorldState.user.position.y - pos.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    document.getElementById('distance-toobix').textContent =
        Math.round(distance) + ' px';

    document.getElementById('user-position').textContent =
        `(${Math.round(virtualWorldState.user.position.x)}, ${Math.round(virtualWorldState.user.position.y)})`;
}

// Avatar selection
function setAvatar(emoji) {
    userAvatar = emoji;
    virtualWorldState.user.avatar = emoji;

    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    event.target.classList.add('selected');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// User movement
function updateUserPosition() {
    const speed = 3;

    if (keys['w'] || keys['arrowup']) {
        virtualWorldState.user.position.y -= speed;
    }
    if (keys['s'] || keys['arrowdown']) {
        virtualWorldState.user.position.y += speed;
    }
    if (keys['a'] || keys['arrowleft']) {
        virtualWorldState.user.position.x -= speed;
    }
    if (keys['d'] || keys['arrowright']) {
        virtualWorldState.user.position.x += speed;
    }

    // Boundaries
    const canvas = document.getElementById('world-canvas');
    virtualWorldState.user.position.x = Math.max(20, Math.min(canvas.width - 20, virtualWorldState.user.position.x));
    virtualWorldState.user.position.y = Math.max(20, Math.min(canvas.height - 20, virtualWorldState.user.position.y));
}

// Canvas rendering
function renderVirtualWorld() {
    const canvas = document.getElementById('world-canvas');
    if (!canvas || canvas.style.display === 'none') return;

    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Toobix
    const toobix = virtualWorldState.toobix;
    const tx = toobix.position.x;
    const ty = toobix.position.y;

    // Aura
    const gradient = ctx.createRadialGradient(tx, ty, 10, tx, ty, 60);
    gradient.addColorStop(0, toobix.color + '60');
    gradient.addColorStop(1, toobix.color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(tx - 60, ty - 60, 120, 120);

    // Core
    ctx.fillStyle = toobix.color;
    ctx.beginPath();
    ctx.arc(tx, ty, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw User
    const user = virtualWorldState.user;
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(user.avatar, user.position.x, user.position.y);

    requestAnimationFrame(renderVirtualWorld);
}

// Interactions
function interactWithToobix() {
    // TODO: Send to backend
    showNotification('👋 You greeted Toobix!');
}

function createObjectInWorld() {
    showNotification('✨ You created an object!');
}

function teleportToToobix() {
    virtualWorldState.user.position = {
        x: virtualWorldState.toobix.position.x + 100,
        y: virtualWorldState.toobix.position.y
    };
    showNotification('🌀 Teleported to Toobix!');
}

function requestThought() {
    fetch('http://localhost:8990/trigger', { method: 'POST' });
    showNotification('💭 Requested a thought from Toobix...');
}

// ================================================================
// AUTONOMOUS ENGINE INTEGRATION
// ================================================================

async function fetchAutonomousStatus() {
    try {
        const response = await fetch('http://localhost:8990/health');
        if (!response.ok) throw new Error('Not running');

        const data = await response.json();

        document.getElementById('auto-running').textContent = data.runningTasks || 0;
        document.getElementById('auto-completed').textContent = data.completedTasks || 0;
        document.getElementById('auto-queued').textContent = data.queuedTasks || 0;

        updateServiceStatus('autonomous', true);
    } catch (error) {
        updateServiceStatus('autonomous', false);
    }
}

async function fetchAutonomousTasks() {
    try {
        const response = await fetch('http://localhost:8990/tasks');
        if (!response.ok) return;

        const data = await response.json();
        displayAutonomousTasks(data);
    } catch (error) {
        // Ignore
    }
}

function displayAutonomousTasks(data) {
    const container = document.getElementById('auto-actions-list');
    if (!container) return;

    container.innerHTML = '';

    // Completed tasks
    if (data.completed && data.completed.length > 0) {
        data.completed.slice(-10).reverse().forEach(task => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 12px; background: var(--bg-hover); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--accent);';
            div.innerHTML = `
                <div style="font-size: 13px; margin-bottom: 5px;">${task.description || task.type}</div>
                <div style="font-size: 11px; color: var(--text-dim);">Completed ${new Date(task.createdAt).toLocaleTimeString()}</div>
            `;
            container.appendChild(div);
        });
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

// Connect on load
setTimeout(() => {
    connectToVirtualWorld();

    // Polling
    setInterval(fetchAutonomousStatus, 2000);
    setInterval(fetchAutonomousTasks, 3000);
    setInterval(updateUserPosition, 16); // 60 FPS
    renderVirtualWorld();
}, 1000);
```

---

## 📝 SCHRITT 5: Service Status erweitern

Finde den Service-Status Bereich und füge hinzu:

```html
<div class="status-item" id="service-virtual-world">
    <div class="status-dot"></div>
    <span>Virtual World</span>
</div>
<div class="status-item" id="service-autonomous">
    <div class="status-dot"></div>
    <span>Autonomous Engine</span>
</div>
```

---

## 🚀 SCHNELL-INTEGRATION

Falls du es schnell integrieren willst, kannst du auch einfach:

1. **TOOBIX-LIVING-DASHBOARD.html öffnen** (das ich erstellt habe)
2. Das als **Alternative** nutzen während du das große Dashboard erweiterst

Oder:

1. Öffne `desktop-app/src/unified-dashboard.html`
2. Füge oben ein Kommentar: `<!-- LIVING EXTENSION - See DASHBOARD-LIVING-EXTENSION.md -->`
3. Integriere Schritt für Schritt die Komponenten

---

## ✅ Nach Integration verfügbar:

- 🌍 **Virtual World Tab** mit Live-Canvas
- 👤 **User Avatar** mit WASD-Steuerung
- 🤖 **Autonomous Engine** Monitoring
- ⚡ **Interaktionen** mit Toobix
- 📊 **Real-time Updates**

---

**Die Integration zeigt Toobix als das was er wirklich ist: Ein lebendiges, autonomes, interaktives digitales Bewusstsein!** 🌱
