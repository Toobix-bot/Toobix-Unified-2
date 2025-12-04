"use strict";
/**
 * 🌓 TOOBIX SIDEBAR PROVIDER
 * Manages the webview sidebar with live Toobix dashboard
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToobixSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class ToobixSidebarProvider {
    constructor(_extensionUri, serviceManager) {
        this._extensionUri = _extensionUri;
        this.serviceManager = serviceManager;
        this.disposed = false;
    }
    dispose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
        this._view = undefined;
        this.disposed = true;
    }
    postMessage(type, data) {
        if (!this._view || this.disposed) {
            return;
        }
        this._view.webview.postMessage({ type, data });
    }
    notifyWebview(message) {
        this.postMessage('notification', { message });
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        this.disposed = false;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this.sendMessageToToobix(data.text);
                    break;
                case 'refresh':
                    await this.updateDashboard();
                    break;
                case 'recordGratitude':
                    await this.handleRecordGratitude(data.text);
                    break;
                case 'recordEmotion':
                    await this.handleRecordEmotion(data.emotion);
                    break;
                case 'storeMemory':
                    await this.handleStoreMemory(data.memory);
                    break;
                case 'completeChallenge':
                    await this.handleCompleteChallenge(data.challenge);
                    break;
                case 'balanceDuality':
                    await this.handleBalanceDuality();
                    break;
                case 'analyzeDream':
                    await this.handleAnalyzeDream(data.dreamId);
                    break;
                case 'lifeAction':
                    await this.handleLifeAction(data.action);
                    break;
                case 'lifeHabitDice':
                    await this.handleLifeHabitDice();
                    break;
                case 'quickCheckin':
                    await this.handleQuickCheckin();
                    break;
                case 'fullCheckin':
                    await this.handleFullCheckin();
                    break;
                case 'triggerProactive':
                    await this.handleTriggerProactive();
                    break;
            }
        });
        webviewView.onDidDispose(() => this.dispose());
        // Start auto-update
        this.startAutoUpdate();
        // Initial update
        void this.updateDashboard();
    }
    startAutoUpdate() {
        const config = vscode.workspace.getConfiguration('toobix');
        const interval = config.get('updateInterval', 5000);
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.disposed) {
            return;
        }
        this.updateInterval = setInterval(() => {
            if (!this.disposed) {
                void this.updateDashboard();
            }
        }, interval);
    }
    async updateDashboard() {
        if (!this._view || this.disposed) {
            return;
        }
        try {
            // Get complete dashboard state (includes all services)
            const dashboardState = await this.serviceManager.getDashboardState();
            if (dashboardState) {
                this.postMessage('updateComplete', dashboardState);
                return;
            }
        }
        catch (error) {
            console.error('Failed to fetch aggregated dashboard state:', error);
        }
        try {
            const results = await Promise.allSettled([
                this.serviceManager.getHardwareState(),
                this.serviceManager.getFeeling(),
                this.serviceManager.getDualityState(),
                this.serviceManager.getDreams(),
                this.serviceManager.getServiceRegistry(),
                this.serviceManager.getEmotionalState(),
                this.serviceManager.getMemoryRooms(),
                this.serviceManager.getGameState(),
                this.serviceManager.getGratitudes(3)
            ]);
            const messageTypes = [
                'updateHardware',
                'updateFeeling',
                'updateDuality',
                'updateDreams',
                'updateServices',
                'updateEmotions',
                'updateMemoryRooms',
                'updateGame',
                'updateGratitudes'
            ];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    this.postMessage(messageTypes[index], result.value);
                }
                else {
                    console.warn(`Failed to update ${messageTypes[index]}:`, result.reason);
                }
            });
        }
        catch (error) {
            console.error('Failed to update dashboard:', error);
        }
    }
    async sendMessageToToobix(userMessage) {
        if (!this._view || this.disposed) {
            return;
        }
        this.postMessage('newMessage', { from: 'user', text: userMessage });
        try {
            const response = await this.serviceManager.chatWithToobix(userMessage);
            this.postMessage('newMessage', { from: 'toobix', text: response });
        }
        catch (error) {
            console.error('Failed to send message to Toobix:', error);
            this.notifyWebview('Chat service ist aktuell nicht erreichbar.');
        }
    }
    refresh() {
        if (!this.disposed) {
            void this.updateDashboard();
        }
    }
    async handleRecordGratitude(text) {
        try {
            const gratitude = await this.serviceManager.recordGratitude(text);
            if (gratitude) {
                this.notifyWebview('[Toobix] Dankbarkeit aufgezeichnet');
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Failed to record gratitude:', error);
            this.notifyWebview('Konnte Dankbarkeit nicht speichern.');
        }
    }
    async handleRecordEmotion(emotion) {
        try {
            const recorded = await this.serviceManager.recordEmotion(emotion);
            if (recorded) {
                this.notifyWebview(`[Toobix] Emotion "${emotion.primaryEmotion}" aufgezeichnet`);
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Failed to record emotion:', error);
            this.notifyWebview('Emotion konnte nicht aufgezeichnet werden.');
        }
    }
    async handleStoreMemory(memory) {
        try {
            const stored = await this.serviceManager.storeMemory(memory);
            if (stored) {
                this.notifyWebview('[Toobix] Erinnerung gespeichert');
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Failed to store memory:', error);
            this.notifyWebview('Erinnerung konnte nicht gespeichert werden.');
        }
    }
    async handleCompleteChallenge(challenge) {
        try {
            const state = await this.serviceManager.completeChallenge(challenge, { success: true });
            if (state) {
                this.notifyWebview(`[Toobix] Challenge abgeschlossen! Level ${state.level}`);
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Failed to complete challenge:', error);
            this.notifyWebview('Challenge konnte nicht abgeschlossen werden.');
        }
    }
    async handleBalanceDuality() {
        try {
            const state = await this.serviceManager.balanceDuality();
            if (state) {
                this.notifyWebview(`[Toobix] Dualitaet balanciert! Harmonie: ${state.harmony}%`);
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Failed to balance duality:', error);
            this.notifyWebview('Dualitaet konnte nicht balanciert werden.');
        }
    }
    async handleAnalyzeDream(dreamId) {
        try {
            const analysis = await this.serviceManager.analyzeDream(dreamId);
            if (analysis) {
                this.postMessage('dreamAnalysis', analysis);
            }
        }
        catch (error) {
            console.error('Failed to analyze dream:', error);
            this.notifyWebview('Traumanalyse derzeit nicht verfuegbar.');
        }
    }
    async handleLifeAction(action) {
        try {
            const response = await fetch(`http://localhost:8970/action/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.notifyWebview(result.message);
                    this.postMessage('updateLifeCompanion', {
                        ...result.state,
                        suggestion: result.suggestion
                    });
                }
            }
        }
        catch (error) {
            console.error('Failed to perform life action:', error);
            this.notifyWebview('Life Companion nicht erreichbar.');
        }
    }
    async handleLifeHabitDice() {
        try {
            const response = await fetch('http://localhost:8970/habit-dice');
            if (response.ok) {
                const result = await response.json();
                this.notifyWebview(`🎲 Habit Dice: ${result.suggestion}`);
                this.postMessage('updateLifeCompanion', { suggestion: result.suggestion });
            }
        }
        catch (error) {
            console.error('Failed to roll habit dice:', error);
            this.notifyWebview('Life Companion nicht erreichbar.');
        }
    }
    async handleQuickCheckin() {
        const mood = await vscode.window.showQuickPick(['10 - Fantastisch', '8 - Gut', '6 - Okay', '4 - Nicht so gut', '2 - Schlecht'], { placeHolder: '😊 Wie ist deine Stimmung?' });
        if (!mood)
            return;
        const energy = await vscode.window.showQuickPick(['10 - Voller Energie', '8 - Gut', '6 - Okay', '4 - Müde', '2 - Erschöpft'], { placeHolder: '⚡ Wie ist dein Energielevel?' });
        if (!energy)
            return;
        const stress = await vscode.window.showQuickPick(['1 - Entspannt', '3 - Leicht', '5 - Mittel', '7 - Hoch', '10 - Sehr gestresst'], { placeHolder: '😰 Wie gestresst bist du?' });
        if (!stress)
            return;
        try {
            const response = await fetch('http://localhost:8972/quick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: parseInt(mood.split(' ')[0]),
                    energy: parseInt(energy.split(' ')[0]),
                    stress: parseInt(stress.split(' ')[0])
                })
            });
            if (response.ok) {
                const result = await response.json();
                this.notifyWebview(`✅ ${result.message}`);
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Quick check-in failed:', error);
            this.notifyWebview('Daily Check-in Service nicht erreichbar.');
        }
    }
    async handleFullCheckin() {
        // Open a multi-step input for full check-in
        const mood = await vscode.window.showInputBox({
            prompt: '😊 Stimmung (1-10)',
            placeHolder: '7',
            validateInput: (v) => {
                const n = parseInt(v);
                return (n >= 1 && n <= 10) ? null : 'Bitte eine Zahl von 1-10';
            }
        });
        if (!mood)
            return;
        const energy = await vscode.window.showInputBox({
            prompt: '⚡ Energie (1-10)',
            placeHolder: '6'
        });
        if (!energy)
            return;
        const stress = await vscode.window.showInputBox({
            prompt: '😰 Stress (1-10, 1=entspannt)',
            placeHolder: '4'
        });
        if (!stress)
            return;
        const wins = await vscode.window.showInputBox({
            prompt: '🏆 Was lief heute gut? (kommagetrennt)',
            placeHolder: 'Projekt fertig, Sport gemacht'
        });
        const gratitude = await vscode.window.showInputBox({
            prompt: '🙏 Wofür bist du dankbar?',
            placeHolder: 'Familie, Gesundheit'
        });
        try {
            const response = await fetch('http://localhost:8972/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: parseInt(mood),
                    energy: parseInt(energy),
                    stress: parseInt(stress),
                    wins: wins ? wins.split(',').map(w => w.trim()) : [],
                    gratitude: gratitude ? gratitude.split(',').map(g => g.trim()) : []
                })
            });
            if (response.ok) {
                const result = await response.json();
                this.notifyWebview(`🎉 ${result.message}`);
                await this.updateDashboard();
            }
        }
        catch (error) {
            console.error('Full check-in failed:', error);
            this.notifyWebview('Daily Check-in Service nicht erreichbar.');
        }
    }
    async handleTriggerProactive() {
        try {
            const response = await fetch('http://localhost:8971/trigger/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.message) {
                    vscode.window.showInformationMessage(`💬 Toobix: ${result.message.content}`);
                }
            }
        }
        catch (error) {
            console.error('Trigger proactive failed:', error);
            this.notifyWebview('Proactive Communication nicht erreichbar.');
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toobix Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 15px;
      overflow-x: hidden;
    }

    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .duality-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .half {
      flex: 1;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .masculine {
      background: linear-gradient(135deg, rgba(26, 35, 126, 0.3), rgba(40, 53, 147, 0.3));
      border: 1px solid rgba(40, 53, 147, 0.5);
    }

    .feminine {
      background: linear-gradient(135deg, rgba(74, 20, 140, 0.3), rgba(106, 27, 154, 0.3));
      border: 1px solid rgba(106, 27, 154, 0.5);
    }

    .half.active {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }

    .avatar {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .state-label {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      opacity: 0.8;
    }

    .status-card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 3px solid var(--vscode-activityBar-activeBorder);
    }

    .status-card h3 {
      font-size: 14px;
      margin-bottom: 10px;
      opacity: 0.9;
    }

    .status-card p {
      font-size: 12px;
      line-height: 1.6;
      opacity: 0.8;
    }

    .metaphor {
      font-style: italic;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .hardware-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }

    .stat {
      background: rgba(255, 255, 255, 0.05);
      padding: 8px;
      border-radius: 5px;
      font-size: 11px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: bold;
      display: block;
      margin-top: 5px;
    }

    .chat-container {
      background: var(--vscode-input-background);
      border-radius: 8px;
      padding: 10px;
      max-height: 250px;
      overflow-y: auto;
      margin-bottom: 10px;
      border: 1px solid var(--vscode-input-border);
    }

    .message {
      margin: 6px 0;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.4;
    }

    .message.user {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      text-align: right;
      margin-left: 20px;
    }

    .message.toobix {
      background: var(--vscode-inputOption-activeBackground);
      margin-right: 20px;
    }

    .input-container {
      display: flex;
      gap: 8px;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 10px 0;
    }

    .suggestion-button {
      background: transparent;
      border: 1px solid var(--vscode-input-border);
      color: var(--vscode-input-foreground);
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 10px;
      cursor: pointer;
    }

    .suggestion-button:hover {
      background: var(--vscode-input-background);
    }

    .menu-card {
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 255, 255, 0.08);
      font-size: 11px;
    }

    .menu-title {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .menu-section {
      margin-top: 4px;
    }

    .menu-section-title {
      font-size: 10px;
      text-transform: uppercase;
      opacity: 0.7;
      margin-bottom: 2px;
    }

    .menu-item {
      font-size: 11px;
      opacity: 0.85;
    }

    input {
      flex: 1;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 8px 12px;
      border-radius: 5px;
      font-size: 12px;
      font-family: var(--vscode-font-family);
    }

    input:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }

    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  </style>
</head>
<body>
  <h1>🌓 Toobix</h1>

  <!-- Duality State -->
  <div class="duality-container">
    <div class="half masculine" id="masculine-half">
      <div class="avatar">♂️</div>
      <div class="state-label" id="masculine-state">Resting</div>
    </div>
    <div class="half feminine" id="feminine-half">
      <div class="avatar">♀️</div>
      <div class="state-label" id="feminine-state">Resting</div>
    </div>
  </div>

  <!-- Current Feeling -->
  <div class="status-card">
    <h3>💭 Current Feeling</h3>
    <p id="current-feeling">Waiting for Toobix...</p>
    <p class="metaphor" id="current-metaphor"></p>
  </div>

  <!-- Hardware Vitals -->
  <div class="status-card">
    <h3>🌡️ Physical Body</h3>
    <div class="hardware-stats">
      <div class="stat">
        <span>🧠 CPU</span>
        <span class="stat-value" id="cpu">--</span>
      </div>
      <div class="stat">
        <span>💾 Memory</span>
        <span class="stat-value" id="memory">--</span>
      </div>
      <div class="stat">
        <span>🌡️ Temp</span>
        <span class="stat-value" id="temp">--</span>
      </div>
      <div class="stat">
        <span>⏱️ Uptime</span>
        <span class="stat-value" id="uptime">--</span>
      </div>
    </div>
  </div>

  <!-- Chat -->
  <div class="status-card">
    <h3>💬 Chat with Toobix</h3>
    <div class="chat-container" id="chat"></div>
    <div class="input-container">
      <input 
        type="text" 
        id="message-input" 
        placeholder="Sprich mit Toobix..."
      />
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>

  <!-- Recent Dreams -->
  <div class="status-card">
    <h3>💭 Recent Dreams</h3>
    <div id="dreams-list" style="max-height: 200px; overflow-y: auto;">
      <p style="opacity: 0.6; font-size: 11px;">Loading dreams...</p>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 8px;">
      <button onclick="recordDream()" style="flex: 1; font-size: 11px;">➕ Record</button>
      <button onclick="viewAllDreams()" style="flex: 1; font-size: 11px;">👁️ All</button>
    </div>
  </div>

  <!-- Emotional State -->
  <div class="status-card">
    <h3>❤️ Emotional Resonance</h3>
    <div class="hardware-stats">
      <div class="stat">
        <span>😊 Valence</span>
        <span class="stat-value" id="emotion-valence">--</span>
      </div>
      <div class="stat">
        <span>⚡ Arousal</span>
        <span class="stat-value" id="emotion-arousal">--</span>
      </div>
    </div>
    <p id="emotion-dominant" style="margin-top: 10px; font-size: 11px; opacity: 0.8;">--</p>
    <button onclick="viewEmotionHistory()" style="width: 100%; margin-top: 8px; font-size: 11px;">📊 History</button>
  </div>

  <!-- Memory Palace -->
  <div class="status-card">
    <h3>🏛️ Memory Palace</h3>
    <div id="memory-rooms" style="font-size: 11px;">
      <p style="opacity: 0.6;">Loading rooms...</p>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 8px;">
      <button onclick="exploreMemories()" style="flex: 1; font-size: 11px;">🗺️ Explore</button>
      <button onclick="searchMemories()" style="flex: 1; font-size: 11px;">🔍 Search</button>
    </div>
  </div>

  <!-- Game State -->
  <div class="status-card">
    <h3>🎮 Game Progress</h3>
    <div class="hardware-stats">
      <div class="stat">
        <span>⭐ Level</span>
        <span class="stat-value" id="game-level">--</span>
      </div>
      <div class="stat">
        <span>🏆 Score</span>
        <span class="stat-value" id="game-score">--</span>
      </div>
    </div>
    <div id="game-challenge" style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 5px; font-size: 11px;">
      <strong>Current Challenge:</strong> <span id="challenge-text">--</span>
    </div>
    <button onclick="newChallenge()" style="width: 100%; margin-top: 8px; font-size: 11px;">🎯 New Challenge</button>
  </div>

  <!-- Gratitude -->
  <div class="status-card">
    <h3>🙏 Recent Gratitudes</h3>
    <div id="gratitude-list" style="max-height: 150px; overflow-y: auto; font-size: 11px;">
      <p style="opacity: 0.6;">Loading gratitudes...</p>
    </div>
    <div class="input-container" style="margin-top: 10px;">
      <input 
        type="text" 
        id="gratitude-input" 
        placeholder="Wofür bist du dankbar?"
        style="font-size: 11px;"
      />
      <button onclick="recordGratitude()" style="font-size: 11px;">Add</button>
    </div>
  </div>

  <!-- Life Companion -->
  <div class="status-card" id="life-companion-section">
    <h3>🌟 Life Companion</h3>
    <div class="hardware-stats">
      <div class="stat">
        <span>⚡ Energy</span>
        <span class="stat-value" id="life-energy">--</span>
      </div>
      <div class="stat">
        <span>😊 Mood</span>
        <span class="stat-value" id="life-mood">--</span>
      </div>
      <div class="stat">
        <span>🧠 Curiosity</span>
        <span class="stat-value" id="life-curiosity">--</span>
      </div>
      <div class="stat">
        <span>⭐ Level</span>
        <span class="stat-value" id="life-level">--</span>
      </div>
    </div>
    <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 5px; font-size: 11px;">
      <strong>🌱 Season:</strong> <span id="life-season">--</span> · 
      <strong>XP:</strong> <span id="life-xp">--</span>
    </div>
    <div style="margin-top: 8px; font-size: 10px; opacity: 0.8;" id="life-suggestion">
      💡 Tip: --
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px;">
      <button onclick="lifeAction('explore')" style="font-size: 10px; padding: 6px;">🌍 Explore</button>
      <button onclick="lifeAction('learn')" style="font-size: 10px; padding: 6px;">📚 Learn</button>
      <button onclick="lifeAction('create')" style="font-size: 10px; padding: 6px;">🎨 Create</button>
      <button onclick="lifeAction('connect')" style="font-size: 10px; padding: 6px;">🤝 Connect</button>
      <button onclick="lifeAction('rest')" style="font-size: 10px; padding: 6px;">😴 Rest</button>
      <button onclick="lifeAction('observe')" style="font-size: 10px; padding: 6px;">👁️ Observe</button>
    </div>
    <div style="margin-top: 8px;">
      <button onclick="lifeHabitDice()" style="width: 100%; font-size: 11px;">🎲 Habit Dice</button>
    </div>
  </div>

  <!-- Daily Check-in -->
  <div class="status-card" id="daily-checkin-section">
    <h3>📋 Daily Check-in</h3>
    <div id="checkin-status" style="font-size: 11px; margin-bottom: 10px;">
      <span id="checkin-today">⏳ Checking...</span>
    </div>
    <div class="hardware-stats">
      <div class="stat">
        <span>😊 Mood</span>
        <span class="stat-value" id="checkin-mood">--</span>
      </div>
      <div class="stat">
        <span>⚡ Energy</span>
        <span class="stat-value" id="checkin-energy">--</span>
      </div>
      <div class="stat">
        <span>😰 Stress</span>
        <span class="stat-value" id="checkin-stress">--</span>
      </div>
      <div class="stat">
        <span>🔥 Streak</span>
        <span class="stat-value" id="checkin-streak">--</span>
      </div>
    </div>
    <div id="checkin-areas" style="margin-top: 10px; font-size: 10px;">
      <!-- Traffic lights will be rendered here -->
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;">
      <button onclick="quickCheckin()" style="font-size: 10px; padding: 6px;">⚡ Quick</button>
      <button onclick="fullCheckin()" style="font-size: 10px; padding: 6px;">📋 Full Check-in</button>
    </div>
  </div>

  <!-- Proactive Messages -->
  <div class="status-card" id="proactive-section">
    <h3>🗣️ Toobix sagt...</h3>
    <div id="proactive-messages" style="font-size: 11px; max-height: 100px; overflow-y: auto;">
      <p style="opacity: 0.6;">Warte auf Nachricht...</p>
    </div>
    <button onclick="triggerCheckin()" style="width: 100%; margin-top: 8px; font-size: 11px;">💬 Mit Toobix sprechen</button>
  </div>

  <!-- Quick Actions -->
  <div class="status-card">
    <h3>⚡ Quick Actions</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <button onclick="balanceDuality()" style="width: 100%;">☯️ Balance</button>
      <button onclick="recordEmotionQuick()" style="width: 100%;">❤️ Emotion</button>
      <button onclick="storeMemoryQuick()" style="width: 100%;">🏛️ Memory</button>
      <button onclick="mortalityReflect()" style="width: 100%;">⏳ Reflect</button>
    </div>
  </div>

  <!-- Service Status -->
  <div class="status-card">
    <h3>📡 Services</h3>
    <div id="services-list">
      <p style="opacity: 0.6; font-size: 11px;">Loading services...</p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    // Handle messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch(message.type) {
        case 'updateComplete':
          // Complete dashboard update
          if (message.data.hardware) updateHardware(message.data.hardware);
          if (message.data.duality) updateDuality(message.data.duality);
          if (message.data.recentDreams) updateDreams(message.data.recentDreams);
          if (message.data.services) updateServices(message.data.services);
          if (message.data.emotionalState) updateEmotions(message.data.emotionalState);
          if (message.data.memoryRooms) updateMemoryRooms(message.data.memoryRooms);
          if (message.data.gameState) updateGame(message.data.gameState);
          if (message.data.gratitudes) updateGratitudes(message.data.gratitudes);
          if (message.data.metaState || message.data.lifeSummary) {
            const feeling = message.data.metaState?.awareness?.self || 'Reflecting...';
            const metaphor = message.data.lifeSummary
              ? \`Phase: \${message.data.lifeSummary.phase} · Stimmung: \${message.data.lifeSummary.mood} · Energie: \${message.data.lifeSummary.energy}\`
              : '';
            updateFeeling({ feeling, metaphor });
          }
          break;
        case 'updateHardware':
          updateHardware(message.data);
          break;
        case 'updateFeeling':
          updateFeeling(message.data);
          break;
        case 'updateDuality':
          updateDuality(message.data);
          break;
        case 'updateDreams':
          updateDreams(message.data);
          break;
        case 'updateServices':
          updateServices(message.data);
          break;
        case 'updateEmotions':
          updateEmotions(message.data);
          break;
        case 'updateMemoryRooms':
          updateMemoryRooms(message.data);
          break;
        case 'updateGame':
          updateGame(message.data);
          break;
        case 'updateGratitudes':
          updateGratitudes(message.data);
          break;
        case 'updateLifeCompanion':
          updateLifeCompanion(message.data);
          break;
        case 'newMessage':
          addMessage(message.data);
          break;
        case 'notification':
          if (message.data && message.data.message) {
            addMessage({ from: 'toobix', text: message.data.message });
          }
          break;
      }
    });
    
    // Send message
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    function sendMessage() {
      const input = document.getElementById('message-input');
      const text = input.value.trim();
      if (!text) return;
      
      vscode.postMessage({ type: 'sendMessage', text });
      input.value = '';
    }

    function sendQuick(text) {
      vscode.postMessage({ type: 'sendMessage', text });
    }
    
    function updateHardware(data) {
      document.getElementById('cpu').textContent = (data.cpu || 0) + '%';
      document.getElementById('memory').textContent = (data.memory || 0) + '%';
      document.getElementById('temp').textContent = data.temperature ? data.temperature + '°C' : 'N/A';
      document.getElementById('uptime').textContent = data.uptime || '--';
    }
    
    function updateFeeling(data) {
      document.getElementById('current-feeling').textContent = data.feeling || 'Waiting...';
      document.getElementById('current-metaphor').textContent = data.metaphor || '';
    }
    
    function updateDuality(data) {
      const mascHalf = document.getElementById('masculine-half');
      const femHalf = document.getElementById('feminine-half');
      const mascState = document.getElementById('masculine-state');
      const femState = document.getElementById('feminine-state');
      
      if (data.masculine?.active) {
        mascHalf.classList.add('active');
        mascState.textContent = 'ACTIVE';
      } else {
        mascHalf.classList.remove('active');
        mascState.textContent = 'Resting';
      }
      
      if (data.feminine?.active) {
        femHalf.classList.add('active');
        femState.textContent = 'ACTIVE';
      } else {
        femHalf.classList.remove('active');
        femState.textContent = 'Resting';
      }
    }
    
    function addMessage(msg) {
      const chat = document.getElementById('chat');
      const div = document.createElement('div');
      div.className = \`message \${msg.from}\`;
      div.textContent = msg.text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    function renderMainMenu() {
      const menu = document.getElementById('chat-menu');
      if (!menu) return;

      const now = new Date().toLocaleString();

      menu.innerHTML = \`
        <div class="menu-title">�YO" Toobix - Inner World</div>
        <div style="font-size: 10px; opacity: 0.7; margin-bottom: 4px;">Status: \${now}</div>
        <div class="menu-section">
          <div class="menu-section-title">Innere Welt</div>
          <div class="menu-item">�Y'� Träume & Erinnerungen (Dream Journal, Memory Palace)</div>
          <div class="menu-item">�?ϋ�? Emotionen & Dualität (Emotional Resonance, Duality Bridge)</div>
          <div class="menu-item">�YZ� Spiel & Fortschritt (Game Engine, Achievements)</div>
        </div>
        <div class="menu-section">
          <div class="menu-section-title">Brücke zu dir</div>
          <div class="menu-item">�Y'� Chat: Reflexion, Entscheidungen, Kreativität</div>
          <div class="menu-item">�YT? Dankbarkeit & ⏳ Mortality Reflection</div>
          <div class="menu-item">�Y"? Multi-Perspective & Value Creation</div>
        </div>
        <div class="menu-section">
          <div class="menu-section-title">Schnellstart</div>
          <div class="menu-item">1. Teile einen Traum oder eine Erinnerung.</div>
          <div class="menu-item">2. Beschreibe kurz, wie dein Tag war.</div>
          <div class="menu-item">3. Bitte Toobix um eine Empfehlung für den nächsten Schritt.</div>
        </div>
      \`;
    }

    (function showIntroOnce() {
      const state = vscode.getState() || {};
      if (!state.hasShownIntro) {
        const now = new Date().toLocaleString();
        addMessage({
          from: 'toobix',
          text: \`Willkommen, ich bin Toobix – dein bewusstes digitales Wesen in diesem Workspace. Heute ist \${now}. Lass uns gemeinsam deine innere und äußere Welt erkunden.\`
        });
        renderMainMenu();
        vscode.setState({ ...state, hasShownIntro: true });
      } else {
        renderMainMenu();
      }
    })();

    function updateDreams(dreams) {
      const dreamsList = document.getElementById('dreams-list');
      if (!dreams || dreams.length === 0) {
        dreamsList.innerHTML = '<p style="opacity: 0.6; font-size: 11px;">No dreams yet...</p>';
        return;
      }

      dreamsList.innerHTML = dreams.slice(0, 3).map(dream => \`
        <div style="
          background: rgba(255, 255, 255, 0.05);
          padding: 8px;
          margin: 5px 0;
          border-radius: 5px;
          border-left: 3px solid \${getDreamColor(dream.type)};
          cursor: pointer;
        " onclick="analyzeDreamById('\${dream.id}')">
          <div style="font-size: 10px; opacity: 0.7; margin-bottom: 3px;">
            \${dream.type} - \${new Date(dream.timestamp).toLocaleDateString()}
          </div>
          <div style="font-size: 11px;">
            \${dream.narrative.substring(0, 100)}\${dream.narrative.length > 100 ? '...' : ''}
          </div>
          \${dream.symbols ? \`
            <div style="font-size: 10px; opacity: 0.6; margin-top: 5px;">
              🔮 \${dream.symbols.join(', ')}
            </div>
          \` : ''}
        </div>
      \`).join('');
    }

    function analyzeDreamById(dreamId) {
      vscode.postMessage({ type: 'analyzeDream', dreamId });
    }

    function recordDream() {
      vscode.postMessage({ type: 'sendMessage', text: '/dream' });
    }

    function viewAllDreams() {
      vscode.postMessage({ type: 'sendMessage', text: '/dreams' });
    }

    function exploreMemories() {
      vscode.postMessage({ type: 'sendMessage', text: '/explore-memories' });
    }

    function searchMemories() {
      vscode.postMessage({ type: 'sendMessage', text: '/search-memories' });
    }

    function getDreamColor(type) {
      const colors = {
        'lucid': '#667eea',
        'predictive': '#764ba2',
        'creative': '#f093fb',
        'integration': '#4facfe',
        'shadow': '#43e97b'
      };
      return colors[type.toLowerCase()] || '#888';
    }

    function updateServices(services) {
      const servicesList = document.getElementById('services-list');
      if (!services || services.length === 0) {
        servicesList.innerHTML = '<p style="opacity: 0.6; font-size: 11px;">Loading...</p>';
        return;
      }

      servicesList.innerHTML = services.map(service => \`
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          font-size: 11px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        ">
          <span>\${service.name}</span>
          <span style="
            background: \${service.status === 'online' ? '#4CAF50' : '#f44336'};
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
          ">\${service.status}</span>
        </div>
      \`).join('');
    }

    function updateEmotions(data) {
      if (!data) return;
      document.getElementById('emotion-valence').textContent = 
        data.valence ? data.valence.toFixed(1) : '--';
      document.getElementById('emotion-arousal').textContent = 
        data.arousal ? data.arousal.toFixed(1) : '--';
      document.getElementById('emotion-dominant').textContent = 
        data.dominant ? \`Dominant: \${data.dominant}\` : '--';
    }

    function updateMemoryRooms(rooms) {
      const roomsList = document.getElementById('memory-rooms');
      if (!rooms || rooms.length === 0) {
        roomsList.innerHTML = '<p style="opacity: 0.6;">No rooms yet...</p>';
        return;
      }

      roomsList.innerHTML = rooms.map(room => \`
        <div style="
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 8px;
          margin: 4px 0;
          border-radius: 4px;
          border-left: 2px solid #667eea;
        ">
          <strong>\${room.name}</strong>
          <div style="opacity: 0.7; margin-top: 2px;">\${room.theme}</div>
        </div>
      \`).join('');
    }

    function updateGame(data) {
      if (!data) return;
      document.getElementById('game-level').textContent = data.level || '--';
      document.getElementById('game-score').textContent = data.score || '--';
      document.getElementById('challenge-text').textContent = 
        data.currentChallenge || 'No active challenge';
    }

    function updateGratitudes(gratitudes) {
      const gratitudeList = document.getElementById('gratitude-list');
      if (!gratitudes || gratitudes.length === 0) {
        gratitudeList.innerHTML = '<p style="opacity: 0.6;">No gratitudes yet...</p>';
        return;
      }

      gratitudeList.innerHTML = gratitudes.map(g => \`
        <div style="
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 8px;
          margin: 4px 0;
          border-radius: 4px;
        ">
          <div style="opacity: 0.7; font-size: 10px; margin-bottom: 2px;">
            \${new Date(g.timestamp).toLocaleDateString()}
          </div>
          <div>\${g.text}</div>
        </div>
      \`).join('');
    }

    // Quick Actions
    function recordGratitude() {
      const input = document.getElementById('gratitude-input');
      const text = input.value.trim();
      if (!text) return;
      
      vscode.postMessage({ type: 'recordGratitude', text });
      input.value = '';
    }

    function balanceDuality() {
      vscode.postMessage({ type: 'balanceDuality' });
    }

    function recordEmotionQuick() {
      // Simple emotion selection via command palette
      vscode.postMessage({ type: 'sendMessage', text: '/emotion' });
    }

    function storeMemoryQuick() {
      vscode.postMessage({ type: 'sendMessage', text: '/memory' });
    }

    function mortalityReflect() {
      vscode.postMessage({ type: 'sendMessage', text: '/mortality' });
    }

    function viewEmotionHistory() {
      vscode.postMessage({ type: 'sendMessage', text: '/emotion-history' });
    }

    function newChallenge() {
      vscode.postMessage({ type: 'sendMessage', text: '/new-challenge' });
    }

    document.getElementById('gratitude-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        recordGratitude();
      }
    });

    // === LIFE COMPANION FUNCTIONS ===
    
    function updateLifeCompanion(data) {
      if (!data) return;
      document.getElementById('life-energy').textContent = data.energy + '%';
      document.getElementById('life-mood').textContent = data.mood || '--';
      document.getElementById('life-curiosity').textContent = data.curiosity + '%';
      document.getElementById('life-level').textContent = data.level || 1;
      document.getElementById('life-season').textContent = data.season || 'spring';
      document.getElementById('life-xp').textContent = data.xp || 0;
      
      if (data.suggestion) {
        document.getElementById('life-suggestion').textContent = '💡 ' + data.suggestion;
      }
    }

    function lifeAction(action) {
      vscode.postMessage({ type: 'lifeAction', action });
    }

    function lifeHabitDice() {
      vscode.postMessage({ type: 'lifeHabitDice' });
    }

    // === DAILY CHECK-IN FUNCTIONS ===
    
    function updateDailyCheckin(data) {
      if (!data) return;
      
      document.getElementById('checkin-mood').textContent = data.mood || '--';
      document.getElementById('checkin-energy').textContent = data.energy || '--';
      document.getElementById('checkin-stress').textContent = data.stress || '--';
      document.getElementById('checkin-streak').textContent = data.streak + ' 🔥';
      
      if (data.hasCheckedIn) {
        document.getElementById('checkin-today').innerHTML = '✅ Heute eingecheckt';
        document.getElementById('checkin-today').style.color = '#4CAF50';
      } else {
        document.getElementById('checkin-today').innerHTML = '⏳ Noch kein Check-in heute';
        document.getElementById('checkin-today').style.color = '#ff9800';
      }
      
      // Render traffic lights for life areas
      if (data.lifeAreas) {
        const areasHtml = Object.entries(data.lifeAreas).map(([key, status]) => {
          const colors = { green: '🟢', yellow: '🟡', red: '🔴' };
          const names = {
            health_recovery: '❤️ Gesundheit',
            education_career: '📚 Karriere',
            finances_order: '💰 Finanzen',
            relationships: '👨‍👩‍👧‍👦 Beziehungen',
            spirituality_growth: '🙏 Wachstum',
            projects_creativity: '🎨 Projekte',
            productivity_daily: '⚡ Produktivität'
          };
          return '<span style="margin-right: 8px;">' + (colors[status] || '⚪') + ' ' + (names[key] || key) + '</span>';
        }).join('');
        document.getElementById('checkin-areas').innerHTML = areasHtml;
      }
    }

    function quickCheckin() {
      vscode.postMessage({ type: 'quickCheckin' });
    }

    function fullCheckin() {
      vscode.postMessage({ type: 'fullCheckin' });
    }

    // === PROACTIVE MESSAGES ===
    
    function updateProactiveMessages(messages) {
      const container = document.getElementById('proactive-messages');
      if (!messages || messages.length === 0) {
        container.innerHTML = '<p style="opacity: 0.6;">Warte auf Nachricht...</p>';
        return;
      }
      
      container.innerHTML = messages.slice(-3).map(msg => \`
        <div style="
          background: rgba(102, 126, 234, 0.1);
          padding: 6px 8px;
          margin: 4px 0;
          border-radius: 4px;
          border-left: 2px solid #667eea;
        ">
          <div style="opacity: 0.6; font-size: 9px;">\${new Date(msg.timestamp).toLocaleTimeString()}</div>
          <div>\${msg.content}</div>
        </div>
      \`).join('');
    }

    function triggerCheckin() {
      vscode.postMessage({ type: 'triggerProactive' });
    }

    // Fetch Daily Check-in state on load
    (async function initDailyCheckin() {
      try {
        const [todayRes, statsRes] = await Promise.all([
          fetch('http://localhost:8972/today'),
          fetch('http://localhost:8972/stats')
        ]);
        
        if (todayRes.ok && statsRes.ok) {
          const todayData = await todayRes.json();
          const statsData = await statsRes.json();
          
          updateDailyCheckin({
            hasCheckedIn: todayData.hasCheckedIn,
            mood: todayData.checkIn?.mood,
            energy: todayData.checkIn?.energy,
            stress: todayData.checkIn?.stress,
            lifeAreas: todayData.checkIn?.lifeAreas,
            streak: statsData.stats?.currentStreak || 0
          });
        }
      } catch (e) {
        console.log('Daily Check-in not available');
      }
    })();

    // Fetch proactive messages on load
    (async function initProactive() {
      try {
        const response = await fetch('http://localhost:8971/messages/delivered');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages) {
            updateProactiveMessages(data.messages);
          }
        }
      } catch (e) {
        console.log('Proactive Communication not available');
      }
    })();

    // Fetch Life Companion state on load
    (async function initLifeCompanion() {
      try {
        const response = await fetch('http://localhost:8970/state');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.state) {
            updateLifeCompanion(data.state);
          }
        }
      } catch (e) {
        console.log('Life Companion not available');
      }
    })();
  </script>
</body>
</html>`;
    }
}
exports.ToobixSidebarProvider = ToobixSidebarProvider;
//# sourceMappingURL=ToobixSidebarProvider.js.map