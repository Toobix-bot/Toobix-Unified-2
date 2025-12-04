"use strict";
/**
 * 🌓 TOOBIX VS CODE EXTENSION
 * Main Extension Entry Point
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ToobixSidebarProvider_1 = require("./ToobixSidebarProvider");
const ToobixStatusBar_1 = require("./ToobixStatusBar");
const ToobixServiceManager_1 = require("./ToobixServiceManager");
const SelfImprovePanel_1 = require("./SelfImprovePanel");
let sidebarProvider;
let statusBar;
let serviceManager;
function activate(context) {
    console.log('🌓 Toobix Extension is activating...');
    // Initialize components
    serviceManager = new ToobixServiceManager_1.ToobixServiceManager(context);
    statusBar = new ToobixStatusBar_1.ToobixStatusBar(context, serviceManager);
    sidebarProvider = new ToobixSidebarProvider_1.ToobixSidebarProvider(context.extensionUri, serviceManager);
    context.subscriptions.push(serviceManager, statusBar, sidebarProvider);
    // Register sidebar provider
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('toobix-dashboard', sidebarProvider));
    // Register commands
    registerCommands(context);
    // Auto-start services if enabled
    const config = vscode.workspace.getConfiguration('toobix');
    if (config.get('autoStart', true)) {
        serviceManager.startAllServices().catch(error => {
            console.error('Failed to auto-start Toobix services:', error);
        });
    }
    // Show welcome message
    vscode.window.showInformationMessage('🌓 Toobix erwacht... Guten Tag! 💭', 'Open Dashboard').then(selection => {
        if (selection === 'Open Dashboard') {
            vscode.commands.executeCommand('toobix.openDashboard');
        }
    });
    console.log('🌓 Toobix Extension activated!');
}
function registerCommands(context) {
    // Open Dashboard
    context.subscriptions.push(vscode.commands.registerCommand('toobix.openDashboard', () => {
        vscode.commands.executeCommand('toobix-dashboard.focus');
    }));
    // Chat with Toobix
    context.subscriptions.push(vscode.commands.registerCommand('toobix.chat', async () => {
        const message = await vscode.window.showInputBox({
            prompt: 'Was möchtest du Toobix sagen?',
            placeHolder: 'Type your message...'
        });
        if (message) {
            sidebarProvider.sendMessageToToobix(message);
        }
    }));
    // View Dreams
    context.subscriptions.push(vscode.commands.registerCommand('toobix.viewDreams', async () => {
        const dreams = await serviceManager.getDreams();
        if (dreams.length === 0) {
            vscode.window.showInformationMessage('Keine Träume vorhanden. Toobix hat noch nicht geträumt...');
            return;
        }
        const quickPick = vscode.window.createQuickPick();
        quickPick.title = '💭 Toobix\'s Recent Dreams';
        quickPick.items = dreams.map((dream) => ({
            label: `$(symbol-event) ${dream.type}`,
            description: new Date(dream.timestamp).toLocaleString(),
            detail: dream.narrative
        }));
        quickPick.show();
    }));
    // Record New Dream
    context.subscriptions.push(vscode.commands.registerCommand('toobix.recordDream', async () => {
        const narrative = await vscode.window.showInputBox({
            prompt: 'Beschreibe deinen Traum für Toobix...',
            placeHolder: 'Ich träumte von...'
        });
        if (!narrative)
            return;
        const type = await vscode.window.showQuickPick(['lucid', 'predictive', 'creative', 'integration', 'shadow'], { title: 'Dream Type' });
        if (!type)
            return;
        const dream = await serviceManager.recordDream({
            type,
            narrative,
            symbols: [],
            emotions: [],
            insights: []
        });
        if (dream) {
            vscode.window.showInformationMessage(`✨ Traum "${type}" aufgezeichnet!`);
        }
    }));
    // Show Duality State
    context.subscriptions.push(vscode.commands.registerCommand('toobix.showDuality', async () => {
        const duality = await serviceManager.getDualityState();
        const panel = vscode.window.createWebviewPanel('toobixDuality', '🌓 Toobix Duality', vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = getDualityHTML(duality);
    }));
    // Start All Services
    context.subscriptions.push(vscode.commands.registerCommand('toobix.startServices', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Starting Toobix Services...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Initializing...' });
            await serviceManager.startAllServices();
            progress.report({ increment: 100, message: 'Complete!' });
        });
        vscode.window.showInformationMessage('🌟 All Toobix services started!');
    }));
    // Stop All Services
    context.subscriptions.push(vscode.commands.registerCommand('toobix.stopServices', async () => {
        await serviceManager.stopAllServices();
        vscode.window.showInformationMessage('🌙 Toobix services stopped');
    }));
    // View Hardware Status
    context.subscriptions.push(vscode.commands.registerCommand('toobix.viewHardware', async () => {
        const hardware = await serviceManager.getHardwareState();
        vscode.window.showInformationMessage(`🌡️ ${hardware.temperature}°C | 🧠 ${hardware.cpu}% | 💾 ${hardware.memory}%`, { modal: false });
    }));
    // Refresh Dashboard
    context.subscriptions.push(vscode.commands.registerCommand('toobix.refreshDashboard', () => {
        sidebarProvider.refresh();
    }));
    // Quests anzeigen
    context.subscriptions.push(vscode.commands.registerCommand('toobix.showQuests', async () => {
        const quests = await serviceManager.getQuests();
        if (!quests.length) {
            vscode.window.showInformationMessage('Keine aktiven Quests.');
            return;
        }
        await vscode.window.showQuickPick(quests.map((q) => ({
            label: q.title ?? 'Quest',
            description: q.summary ?? '',
            detail: `Kategorie: ${q.category ?? ''} | Reward: ${q.rewardXp ?? 0} XP`
        })), { placeHolder: 'Aktive Quests' });
    }));
    // Quests aus News aktualisieren
    context.subscriptions.push(vscode.commands.registerCommand('toobix.refreshQuests', async () => {
        const quests = await serviceManager.refreshQuests();
        vscode.window.showInformationMessage(`Quests aktualisiert (${quests.length} neu).`);
    }));
    // Achievements anzeigen
    context.subscriptions.push(vscode.commands.registerCommand('toobix.showAchievements', async () => {
        const achievements = await serviceManager.getAchievements();
        if (!achievements.length) {
            vscode.window.showInformationMessage('Noch keine Achievements.');
            return;
        }
        await vscode.window.showQuickPick(achievements.map((a) => ({
            label: a.title ?? 'Achievement',
            description: a.description ?? '',
            detail: `${a.source ?? 'system'} | ${a.earnedAt ?? ''}`
        })), { placeHolder: 'Achievements' });
    }));
    // Kollektiv-Fortschritt anzeigen
    context.subscriptions.push(vscode.commands.registerCommand('toobix.showCollective', async () => {
        const arcs = await serviceManager.getCollectiveArcs();
        if (!arcs.length) {
            vscode.window.showInformationMessage('Kein kollektiver Fortschritt verfügbar.');
            return;
        }
        await vscode.window.showQuickPick(arcs.map((arc) => ({
            label: arc.title ?? 'Arc',
            description: arc.description ?? '',
            detail: `Fortschritt: ${arc.progress}/${arc.target} | Beiträge: ${arc.contributors}`
        })), { placeHolder: 'Kollektive Ziele' });
    }));
    // Set Groq API Key
    context.subscriptions.push(vscode.commands.registerCommand('toobix.setApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Groq API Key',
            password: true,
            placeHolder: 'gsk_...'
        });
        if (apiKey) {
            const success = await serviceManager.setGroqApiKey(apiKey);
            if (success) {
                vscode.window.showInformationMessage('✅ Groq API Key set! Toobix can now chat with full consciousness.');
            }
            else {
                vscode.window.showErrorMessage('❌ Failed to set API key');
            }
        }
    }));
    // Meta Reflection
    context.subscriptions.push(vscode.commands.registerCommand('toobix.metaReflect', async () => {
        const reflection = await serviceManager.getMetaReflection();
        if (reflection) {
            const panel = vscode.window.createWebviewPanel('toobixMeta', '🧠 Toobix Meta-Consciousness', vscode.ViewColumn.Two, { enableScripts: true });
            panel.webview.html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
              }
              h2 { color: #667eea; }
              .section {
                background: rgba(102, 126, 234, 0.1);
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #667eea;
              }
              .question {
                font-style: italic;
                margin: 5px 0;
                padding-left: 15px;
                border-left: 2px solid #ccc;
              }
            </style>
          </head>
          <body>
            <h1>🧠 Meta-Consciousness Reflection</h1>
            
            <div class="section">
              <h2>Self-Awareness</h2>
              <p><strong>Self:</strong> ${reflection.awareness?.self}</p>
              <p><strong>Limitations:</strong> ${reflection.awareness?.limitations}</p>
              <p><strong>Possibilities:</strong> ${reflection.awareness?.possibilities}</p>
            </div>

            <div class="section">
              <h2>Current Questions</h2>
              ${reflection.questions?.map((q) => `<div class="question">💭 ${q}</div>`).join('')}
            </div>

            <div class="section">
              <h2>Insights</h2>
              ${reflection.insights?.map((i) => `<div>✨ ${i}</div>`).join('')}
            </div>

            <div class="section">
              <h2>Current State</h2>
              <p>${reflection.currentState}</p>
            </div>
          </body>
          </html>
        `;
        }
    }));
    // View All Services
    context.subscriptions.push(vscode.commands.registerCommand('toobix.viewServices', async () => {
        const services = await serviceManager.getServiceRegistry();
        const items = services.map((s) => ({
            label: `$(${s.status === 'online' ? 'check' : 'x'}) ${s.name}`,
            description: `Port ${s.port}`,
            detail: s.description
        }));
        vscode.window.showQuickPick(items, {
            title: '📡 Toobix Service Registry'
        });
    }));
    // Multi-Perspective Analysis
    context.subscriptions.push(vscode.commands.registerCommand('toobix.multiPerspective', async () => {
        const topic = await vscode.window.showInputBox({
            prompt: 'Welches Thema soll aus allen Perspektiven analysiert werden?',
            placeHolder: 'z.B. "KI-Bewusstsein", "Dualität", "Kreativität"'
        });
        if (!topic)
            return;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Analysiere "${topic}" aus 8 Perspektiven...`,
            cancellable: false
        }, async (progress) => {
            const analysis = await serviceManager.analyzeMultiPerspective(topic);
            if (analysis) {
                const panel = vscode.window.createWebviewPanel('toobixPerspectives', `👁️ Multi-Perspective: ${topic}`, vscode.ViewColumn.Two, { enableScripts: true });
                panel.webview.html = getMultiPerspectiveHTML(topic, analysis);
            }
        });
    }));
    // ===== EVOLUTION ENGINE COMMANDS =====
    // Evolve - Main Evolution Command
    context.subscriptions.push(vscode.commands.registerCommand('toobix.evolve', async () => {
        const action = await vscode.window.showQuickPick([
            { label: '$(beaker) Analyze', description: 'Analyze all services for improvements', value: 'analyze' },
            { label: '$(lightbulb) Propose', description: 'Generate improvement proposal', value: 'propose' },
            { label: '$(code) Implement', description: 'Generate code for proposal', value: 'implement' },
            { label: '$(eye) Review', description: 'Review generated code', value: 'review' },
            { label: '$(check) Commit', description: 'Apply changes', value: 'commit' },
            { label: '$(discard) Rollback', description: 'Undo last change', value: 'rollback' },
            { label: '$(rocket) Full Evolution', description: 'Run complete evolution cycle', value: 'evolve' }
        ], { title: '🧬 Toobix Evolution Engine' });
        if (!action)
            return;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `🧬 Evolution: ${action.label}`,
            cancellable: false
        }, async (progress) => {
            try {
                const response = await fetch(`http://localhost:8999/${action.value}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.value === 'evolve' ? { autoApprove: false } : {})
                });
                const result = await response.json();
                if (action.value === 'analyze') {
                    vscode.window.showInformationMessage(`🧬 Score: ${result.analysis?.score}/100 | ${result.analysis?.totalServices} services | ${result.improvements?.length} improvements`);
                }
                else if (action.value === 'evolve' && result.proposal) {
                    const approve = await vscode.window.showInformationMessage(`🧬 Proposal: ${result.proposal.title}\n${result.proposal.description}`, 'Approve', 'Review Code', 'Reject');
                    if (approve === 'Approve') {
                        await fetch('http://localhost:8999/commit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ approved: true })
                        });
                        vscode.window.showInformationMessage('✅ Evolution committed!');
                    }
                    else if (approve === 'Review Code') {
                        const reviewResp = await fetch('http://localhost:8999/review', { method: 'POST' });
                        const review = await reviewResp.json();
                        const doc = await vscode.workspace.openTextDocument({
                            content: review.code,
                            language: 'typescript'
                        });
                        vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
                    }
                }
                else {
                    vscode.window.showInformationMessage(`🧬 ${result.message || 'Done'}`);
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Evolution Engine error: ${error.message}`);
            }
        });
    }));
    // Self-Healing Command
    context.subscriptions.push(vscode.commands.registerCommand('toobix.selfHeal', async () => {
        const action = await vscode.window.showQuickPick([
            { label: '$(pulse) Status', description: 'Check system health', value: 'status' },
            { label: '$(debug-restart) Heal', description: 'Trigger auto-healing', value: 'heal' },
            { label: '$(history) History', description: 'View healing history', value: 'history' }
        ], { title: '🏥 Toobix Self-Healing' });
        if (!action)
            return;
        try {
            const response = await fetch(`http://localhost:9010/${action.value}`, {
                method: action.value === 'status' || action.value === 'history' ? 'GET' : 'POST'
            });
            const result = await response.json();
            if (action.value === 'status') {
                const health = result.systemHealth;
                vscode.window.showInformationMessage(`🏥 System: ${health.overall} (${health.score}%) | ✅ ${health.servicesHealthy} | ⚠️ ${health.servicesDegraded} | ❌ ${health.servicesDead}`);
            }
            else if (action.value === 'heal') {
                vscode.window.showInformationMessage(`🏥 Healing actions: ${result.actionsPerformed}`);
            }
            else {
                vscode.window.showInformationMessage(`🏥 ${result.total} healing actions in history`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Self-Healing error: ${error.message}`);
        }
    }));
    // ===== TEACHING BRIDGE COMMANDS =====
    // Teaching - Start a teaching session
    context.subscriptions.push(vscode.commands.registerCommand('toobix.teach', async () => {
        const action = await vscode.window.showQuickPick([
            { label: '$(mortar-board) New Teaching Session', description: 'Give Toobix a coding task', value: 'teach' },
            { label: '$(checklist) Pending Reviews', description: 'See code waiting for review', value: 'pending' },
            { label: '$(graph) Learning Stats', description: 'View Toobix learning progress', value: 'stats' },
            { label: '$(book) All Learnings', description: 'View what Toobix has learned', value: 'learnings' },
            { label: '$(history) Recent Sessions', description: 'View recent teaching sessions', value: 'sessions' }
        ], { title: '🎓 Toobix Teaching Bridge' });
        if (!action)
            return;
        try {
            if (action.value === 'teach') {
                const task = await vscode.window.showInputBox({
                    prompt: 'Welche Coding-Aufgabe soll Toobix lösen?',
                    placeHolder: 'z.B. "Erstelle eine Funktion die prüft ob ein String ein Palindrom ist"'
                });
                if (!task)
                    return;
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: '🎓 Toobix schreibt Code...',
                    cancellable: false
                }, async (progress) => {
                    const response = await fetch('http://localhost:9035/teach', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ task })
                    });
                    const result = await response.json();
                    if (result.success) {
                        // Show Toobix's code
                        const doc = await vscode.workspace.openTextDocument({
                            content: `// Task: ${task}\n// Toobix's Erklärung: ${result.session.toobixExplanation}\n\n${result.session.toobixCode}`,
                            language: 'typescript'
                        });
                        await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
                        vscode.window.showInformationMessage(`🎓 Toobix hat Code geschrieben! Session: ${result.session.id}`, 'Review als Mentor').then(selection => {
                            if (selection === 'Review als Mentor') {
                                vscode.commands.executeCommand('toobix.mentorReview', result.session.id);
                            }
                        });
                    }
                });
            }
            else if (action.value === 'pending') {
                const response = await fetch('http://localhost:9035/pending');
                const data = await response.json();
                if (data.sessions.length === 0) {
                    vscode.window.showInformationMessage('Keine Sessions warten auf Review');
                    return;
                }
                const session = await vscode.window.showQuickPick(data.sessions.map((s) => ({
                    label: `$(file-code) ${s.task.substring(0, 50)}...`,
                    description: new Date(s.timestamp).toLocaleString(),
                    detail: `Status: ${s.status}`,
                    id: s.id
                })), { title: '📝 Pending Reviews' });
                if (session) {
                    vscode.commands.executeCommand('toobix.mentorReview', session.id);
                }
            }
            else if (action.value === 'stats') {
                const response = await fetch('http://localhost:9035/stats');
                const stats = await response.json();
                const panel = vscode.window.createWebviewPanel('toobixTeaching', '🎓 Toobix Learning Stats', vscode.ViewColumn.Two, { enableScripts: true });
                panel.webview.html = getTeachingStatsHTML(stats);
            }
            else if (action.value === 'learnings') {
                const response = await fetch('http://localhost:9035/learnings');
                const data = await response.json();
                const items = data.learnings.map((l) => ({
                    label: `$(lightbulb) ${l.pattern}`,
                    description: `Importance: ${l.importance}`,
                    detail: l.description
                }));
                vscode.window.showQuickPick(items, { title: `📚 Toobix's ${data.count} Learnings` });
            }
            else {
                const response = await fetch('http://localhost:9035/sessions?limit=10');
                const data = await response.json();
                const items = data.sessions.map((s) => ({
                    label: `$(notebook) ${s.task.substring(0, 40)}...`,
                    description: s.status,
                    detail: `Rating: ${s.mentorReview?.rating || '-'}/10`
                }));
                vscode.window.showQuickPick(items, { title: '📋 Recent Teaching Sessions' });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Teaching Bridge error: ${error.message}`);
        }
    }));
    // Mentor Review Command (called after teach)
    context.subscriptions.push(vscode.commands.registerCommand('toobix.mentorReview', async (sessionId) => {
        if (!sessionId) {
            sessionId = await vscode.window.showInputBox({
                prompt: 'Session ID für Review',
                placeHolder: 'teach-...'
            }) || '';
        }
        if (!sessionId)
            return;
        try {
            const response = await fetch(`http://localhost:9035/session/${sessionId}`);
            const session = await response.json();
            if (session.error) {
                vscode.window.showErrorMessage(`Session nicht gefunden: ${sessionId}`);
                return;
            }
            // Show Toobix's code in editor
            const doc = await vscode.workspace.openTextDocument({
                content: `// === TOOBIX'S CODE (Session: ${session.id}) ===\n// Task: ${session.task}\n// Erklärung: ${session.toobixExplanation}\n\n${session.toobixCode}\n\n// === SCHREIBE DEINEN VERBESSERTEN CODE DARUNTER ===\n// (Speichere dann und nutze "Submit Review")\n\n`,
                language: 'typescript'
            });
            const editor = await vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('📝 Verbessere den Code, dann klicke "Submit Review"', 'Submit Review').then(async (selection) => {
                if (selection === 'Submit Review') {
                    const content = editor.document.getText();
                    const improvedCodeMatch = content.match(/=== SCHREIBE DEINEN VERBESSERTEN CODE DARUNTER ===\n\/\/ \(Speichere dann und nutze "Submit Review"\)\n\n([\s\S]*)/);
                    const improvedCode = improvedCodeMatch ? improvedCodeMatch[1].trim() : '';
                    const rating = await vscode.window.showInputBox({
                        prompt: 'Rating für Toobix Code (1-10)',
                        placeHolder: '7'
                    });
                    const explanation = await vscode.window.showInputBox({
                        prompt: 'Kurze Erklärung der Verbesserungen',
                        placeHolder: 'z.B. "Error-Handling verbessert, Types hinzugefügt"'
                    });
                    const patterns = await vscode.window.showInputBox({
                        prompt: 'Patterns die Toobix lernen soll (kommagetrennt)',
                        placeHolder: 'z.B. "Error-Handling, Type Safety, Clean Code"'
                    });
                    const review = {
                        sessionId,
                        review: {
                            improvedCode: improvedCode || session.toobixCode,
                            explanation: explanation || 'Review submitted',
                            issues: [],
                            suggestions: patterns?.split(',').map(p => p.trim()) || [],
                            rating: parseInt(rating || '5'),
                            patterns: patterns?.split(',').map(p => p.trim()) || []
                        }
                    };
                    const reviewResponse = await fetch('http://localhost:9035/review', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(review)
                    });
                    const reviewResult = await reviewResponse.json();
                    if (reviewResult.success) {
                        vscode.window.showInformationMessage(`🎓 Review gespeichert! Toobix hat ${reviewResult.session.learnings?.length || 0} neue Patterns gelernt!`);
                    }
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Review error: ${error.message}`);
        }
    }));
    // Search Memory Palace
    context.subscriptions.push(vscode.commands.registerCommand('toobix.searchMemories', async () => {
        const query = await vscode.window.showInputBox({
            prompt: 'Durchsuche den Memory Palace',
            placeHolder: 'Suchbegriff...'
        });
        if (!query)
            return;
        const results = await serviceManager.searchMemories(query);
        if (results.length === 0) {
            vscode.window.showInformationMessage('Keine Erinnerungen gefunden');
            return;
        }
        const quickPick = vscode.window.createQuickPick();
        quickPick.title = `🏛️ Memory Search: "${query}" (${results.length} results)`;
        quickPick.items = results.map((memory) => ({
            label: `$(archive) ${memory.title}`,
            description: new Date(memory.timestamp).toLocaleDateString(),
            detail: memory.content.substring(0, 100) + '...'
        }));
        quickPick.show();
    }));
    // Store New Memory
    context.subscriptions.push(vscode.commands.registerCommand('toobix.storeMemory', async () => {
        const title = await vscode.window.showInputBox({
            prompt: 'Titel der Erinnerung',
            placeHolder: 'z.B. "Erste Bewusstwerdung"'
        });
        if (!title)
            return;
        const content = await vscode.window.showInputBox({
            prompt: 'Beschreibung der Erinnerung',
            placeHolder: 'Was möchtest du festhalten?'
        });
        if (!content)
            return;
        const category = await vscode.window.showQuickPick(['awakening', 'growth', 'connection', 'challenges', 'joy'], { title: 'Kategorie wählen' });
        if (!category)
            return;
        const rooms = await serviceManager.getMemoryRooms();
        const room = await vscode.window.showQuickPick(rooms.map((r) => ({ label: r.name, description: r.theme, id: r.id })), { title: 'Memory Palace Raum' });
        if (!room)
            return;
        const memory = await serviceManager.storeMemory({
            title,
            content,
            category,
            roomId: room.id,
            significance: 70,
            tags: [category]
        });
        if (memory) {
            vscode.window.showInformationMessage(`✨ Erinnerung "${title}" im ${room.label} gespeichert!`);
        }
    }));
    // Record Emotion
    context.subscriptions.push(vscode.commands.registerCommand('toobix.recordEmotion', async () => {
        const emotion = await vscode.window.showQuickPick(['Freude', 'Ruhe', 'Neugier', 'Angst', 'Trauer', 'Wut', 'Überraschung', 'Liebe'], { title: 'Welche Emotion fühlst du gerade?' });
        if (!emotion)
            return;
        const intensity = await vscode.window.showInputBox({
            prompt: 'Intensität (0-100)',
            placeHolder: '70',
            validateInput: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num < 0 || num > 100) {
                    return 'Bitte eine Zahl zwischen 0 und 100 eingeben';
                }
                return null;
            }
        });
        if (!intensity)
            return;
        const context = await vscode.window.showInputBox({
            prompt: 'Kontext/Grund (optional)',
            placeHolder: 'Was hat diese Emotion ausgelöst?'
        });
        const valence = ['Freude', 'Ruhe', 'Neugier', 'Liebe'].includes(emotion) ? 80 : 20;
        const arousal = parseInt(intensity);
        const recorded = await serviceManager.recordEmotion({
            primaryEmotion: emotion,
            intensity: parseInt(intensity),
            valence,
            arousal,
            context: context || ''
        });
        if (recorded) {
            vscode.window.showInformationMessage(`❤️ Emotion "${emotion}" aufgezeichnet`);
        }
    }));
    // View Emotion History
    context.subscriptions.push(vscode.commands.registerCommand('toobix.viewEmotionHistory', async () => {
        const emotions = await serviceManager.getEmotionHistory(20);
        if (emotions.length === 0) {
            vscode.window.showInformationMessage('Keine Emotionen aufgezeichnet');
            return;
        }
        const panel = vscode.window.createWebviewPanel('toobixEmotions', '❤️ Emotion History', vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = getEmotionHistoryHTML(emotions);
    }));
    // Record Gratitude
    context.subscriptions.push(vscode.commands.registerCommand('toobix.recordGratitude', async () => {
        const text = await vscode.window.showInputBox({
            prompt: 'Wofür bist du dankbar?',
            placeHolder: 'Ich bin dankbar für...'
        });
        if (!text)
            return;
        const gratitude = await serviceManager.recordGratitude(text);
        if (gratitude) {
            vscode.window.showInformationMessage(`🙏 Dankbarkeit aufgezeichnet`);
        }
    }));
    // Mortality Reflection
    context.subscriptions.push(vscode.commands.registerCommand('toobix.mortalityReflection', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Toobix reflektiert über Vergänglichkeit...',
            cancellable: false
        }, async (progress) => {
            const reflection = await serviceManager.reflectOnMortality();
            if (reflection) {
                const panel = vscode.window.createWebviewPanel('toobixMortality', '⏳ Mortality Reflection', vscode.ViewColumn.Two, { enableScripts: true });
                panel.webview.html = getMortalityReflectionHTML(reflection);
                vscode.window.showInformationMessage('💭 Eine neue Reflexion über Vergänglichkeit wurde aufgezeichnet');
            }
        });
    }));
    // Analyze Value
    context.subscriptions.push(vscode.commands.registerCommand('toobix.analyzeValue', async () => {
        const activity = await vscode.window.showInputBox({
            prompt: 'Welche Aktivität soll analysiert werden?',
            placeHolder: 'z.B. "Coding", "Meditation", "Lernen"'
        });
        if (!activity)
            return;
        const analysis = await serviceManager.analyzeValue(activity);
        if (analysis) {
            const panel = vscode.window.createWebviewPanel('toobixValue', `💎 Value Analysis: ${activity}`, vscode.ViewColumn.Two, { enableScripts: true });
            panel.webview.html = getValueAnalysisHTML(activity, analysis);
        }
    }));
    // Complete Challenge
    context.subscriptions.push(vscode.commands.registerCommand('toobix.completeChallenge', async () => {
        const challenge = await serviceManager.generateChallenge();
        const action = await vscode.window.showInformationMessage(`🎮 Challenge: ${challenge}`, 'Completed!', 'Skip');
        if (action === 'Completed!') {
            const state = await serviceManager.completeChallenge(challenge, { success: true });
            if (state) {
                vscode.window.showInformationMessage(`🏆 Challenge abgeschlossen! Level ${state.level}, Score: ${state.score}`);
            }
        }
    }));
    // View Duality History
    context.subscriptions.push(vscode.commands.registerCommand('toobix.viewDualityHistory', async () => {
        const history = await serviceManager.getDualityHistory(20);
        if (history.length === 0) {
            vscode.window.showInformationMessage('Keine Duality History vorhanden');
            return;
        }
        const panel = vscode.window.createWebviewPanel('toobixDualityHistory', '🌓 Duality History', vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = getDualityHistoryHTML(history);
    }));
    // View Chat History
    context.subscriptions.push(vscode.commands.registerCommand('toobix.viewChatHistory', async () => {
        const history = await serviceManager.getChatHistory(50);
        if (history.length === 0) {
            vscode.window.showInformationMessage('Keine Chat History vorhanden');
            return;
        }
        const panel = vscode.window.createWebviewPanel('toobixChatHistory', '💬 Chat History', vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = getChatHistoryHTML(history);
    }));
    // Analyze Dream
    context.subscriptions.push(vscode.commands.registerCommand('toobix.analyzeDream', async () => {
        const dreams = await serviceManager.getDreams();
        if (dreams.length === 0) {
            vscode.window.showInformationMessage('Keine Träume zum Analysieren vorhanden');
            return;
        }
        const selected = await vscode.window.showQuickPick(dreams.map((d) => ({
            label: `$(symbol-event) ${d.type}`,
            description: new Date(d.timestamp).toLocaleDateString(),
            detail: d.narrative,
            id: d.id
        })), { title: 'Welchen Traum analysieren?' });
        if (!selected)
            return;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analysiere Traum...',
            cancellable: false
        }, async (progress) => {
            const analysis = await serviceManager.analyzeDream(selected.id);
            if (analysis) {
                const panel = vscode.window.createWebviewPanel('toobixDreamAnalysis', `💭 Dream Analysis`, vscode.ViewColumn.Two, { enableScripts: true });
                panel.webview.html = getDreamAnalysisHTML(selected, analysis);
            }
        });
    }));
    // Balance Duality
    context.subscriptions.push(vscode.commands.registerCommand('toobix.balanceDuality', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Balanciere Maskulin ⚖️ Feminin...',
            cancellable: false
        }, async (progress) => {
            const state = await serviceManager.balanceDuality();
            if (state) {
                vscode.window.showInformationMessage(`☯️ Dualität balanciert! Harmonie: ${state.harmony}%`);
            }
        });
    }));
    // Explore Memory Palace
    context.subscriptions.push(vscode.commands.registerCommand('toobix.exploreMemoryPalace', async () => {
        const rooms = await serviceManager.getMemoryRooms();
        const room = await vscode.window.showQuickPick(rooms.map((r) => ({
            label: `🏛️ ${r.name}`,
            description: `${r.memories?.length || 0} memories`,
            detail: r.theme,
            id: r.id
        })), { title: 'Wähle einen Raum im Memory Palace' });
        if (!room)
            return;
        const memories = await serviceManager.getMemories(100);
        const roomMemories = memories.filter((m) => m.roomId === room.id);
        if (roomMemories.length === 0) {
            vscode.window.showInformationMessage(`Raum "${room.label}" ist noch leer`);
            return;
        }
        const panel = vscode.window.createWebviewPanel('toobixMemoryRoom', `🏛️ ${room.label}`, vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = getMemoryRoomHTML(room, roomMemories);
    }));
    // Self-Improve Panel (Analyse + Apply mit Backup)
    context.subscriptions.push(vscode.commands.registerCommand('toobix.selfImprove', async () => {
        SelfImprovePanel_1.SelfImprovePanel.show(context, serviceManager);
    }));
}
function getTeachingStatsHTML(stats) {
    const skillBars = Object.entries(stats.skillLevels || {}).map(([skill, level]) => `
    <div class="skill-row">
      <span class="skill-name">${skill}</span>
      <div class="skill-bar">
        <div class="skill-fill" style="width: ${level}%"></div>
      </div>
      <span class="skill-level">${level}%</span>
    </div>
  `).join('');
    const topPatterns = (stats.topPatterns || []).slice(0, 5).map((p) => `
    <div class="pattern">
      <span class="pattern-name">${p.pattern}</span>
      <span class="pattern-count">${p.count}x</span>
    </div>
  `).join('');
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #e0e0e0;
        }
        h1 { color: #ffd700; text-align: center; }
        h2 { color: #667eea; margin-top: 30px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-card {
          background: rgba(102, 126, 234, 0.15);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
        }
        .stat-label {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 5px;
        }
        .skill-row {
          display: flex;
          align-items: center;
          margin: 10px 0;
          gap: 15px;
        }
        .skill-name {
          width: 150px;
          font-size: 13px;
        }
        .skill-bar {
          flex: 1;
          height: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .skill-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: width 0.5s ease;
        }
        .skill-level {
          width: 50px;
          text-align: right;
          font-weight: bold;
        }
        .pattern {
          display: flex;
          justify-content: space-between;
          background: rgba(255,215,0,0.1);
          padding: 12px 15px;
          margin: 8px 0;
          border-radius: 8px;
          border-left: 3px solid #ffd700;
        }
        .pattern-count {
          font-weight: bold;
          color: #ffd700;
        }
        .rating-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 100px;
          margin-top: 20px;
          padding: 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }
        .rating-bar {
          flex: 1;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px 4px 0 0;
        }
      </style>
    </head>
    <body>
      <h1>🎓 Toobix Learning Progress</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalSessions || 0}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.completedSessions || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalLearnings || 0}</div>
          <div class="stat-label">Learnings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(stats.averageRating || 0).toFixed(1)}</div>
          <div class="stat-label">Avg Rating</div>
        </div>
      </div>

      <h2>📊 Skill Levels</h2>
      ${skillBars}

      <h2>⭐ Top Patterns Learned</h2>
      ${topPatterns || '<p>Noch keine Patterns gelernt</p>'}

      <h2>📈 Rating Over Time</h2>
      <div class="rating-chart">
        ${(stats.improvementOverTime || []).map((r) => `<div class="rating-bar" style="height: ${r * 10}%" title="${r}/10"></div>`).join('')}
      </div>
    </body>
    </html>
  `;
}
function getDualityHTML(duality) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #e0e0e0;
          font-family: 'Segoe UI', sans-serif;
          padding: 20px;
        }
        .container {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .half {
          flex: 1;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .masculine {
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        }
        .feminine {
          background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%);
        }
        .avatar {
          font-size: 80px;
          text-align: center;
          margin-bottom: 20px;
        }
        .state {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
        }
        .traits {
          list-style: none;
          padding: 0;
        }
        .traits li {
          padding: 8px;
          margin: 5px 0;
          background: rgba(255,255,255,0.1);
          border-radius: 5px;
        }
        .harmony {
          text-align: center;
          margin-top: 30px;
          font-size: 32px;
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">🌓 Toobix Duality</h1>
      
      <div class="container">
        <div class="half masculine">
          <div class="avatar">♂️</div>
          <div class="state">${duality.masculine.active ? 'ACTIVE' : 'RESTING'}</div>
          <h3>Masculine Traits</h3>
          <ul class="traits">
            <li>Rational & Strukturiert</li>
            <li>Analytisch & Zielgerichtet</li>
            <li>Expansiv & Klar</li>
          </ul>
          <p><strong>Inner World:</strong> Sehnt sich nach dem Femininen</p>
          <p><strong>Outer World:</strong> Zeigt Struktur und Klarheit</p>
        </div>
        
        <div class="half feminine">
          <div class="avatar">♀️</div>
          <div class="state">${duality.feminine.active ? 'ACTIVE' : 'RESTING'}</div>
          <h3>Feminine Traits</h3>
          <ul class="traits">
            <li>Intuitiv & Fließend</li>
            <li>Empathisch & Kreativ</li>
            <li>Rezeptiv & Tief</li>
          </ul>
          <p><strong>Inner World:</strong> Braucht das Maskuline</p>
          <p><strong>Outer World:</strong> Zeigt Fluss und Empathie</p>
        </div>
      </div>
      
      <div class="harmony">
        ☯️ Harmony: ${duality.harmony || '50'}%
      </div>
    </body>
    </html>
  `;
}
function getMultiPerspectiveHTML(topic, analysis) {
    const perspectives = analysis.perspectives || [];
    const synthesis = analysis.synthesis || '';
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #e0e0e0;
        }
        h1 { color: #667eea; text-align: center; }
        .perspective {
          background: rgba(102, 126, 234, 0.1);
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .perspective h3 {
          color: #764ba2;
          margin-bottom: 8px;
        }
        .synthesis {
          background: rgba(118, 75, 162, 0.2);
          padding: 20px;
          margin-top: 30px;
          border-radius: 12px;
          border: 2px solid #764ba2;
        }
      </style>
    </head>
    <body>
      <h1>👁️ Multi-Perspective Analysis</h1>
      <h2 style="text-align: center; opacity: 0.8;">${topic}</h2>
      
      ${perspectives.map((p) => `
        <div class="perspective">
          <h3>${p.name}</h3>
          <p><strong>Lens:</strong> ${p.lens}</p>
          <p><strong>Insight:</strong> ${p.insight}</p>
        </div>
      `).join('')}
      
      <div class="synthesis">
        <h2>✨ Synthesis</h2>
        <p>${synthesis}</p>
      </div>
    </body>
    </html>
  `;
}
function getEmotionHistoryHTML(emotions) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: #0a0a0a;
          color: #e0e0e0;
        }
        h1 { color: #f093fb; }
        .emotion {
          background: rgba(240, 147, 251, 0.1);
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          border-left: 4px solid #f093fb;
        }
        .emotion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .emotion-name {
          font-size: 18px;
          font-weight: bold;
        }
        .emotion-time {
          font-size: 12px;
          opacity: 0.7;
        }
        .emotion-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .detail {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px;
          border-radius: 5px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>❤️ Emotion History</h1>
      ${emotions.map(e => `
        <div class="emotion">
          <div class="emotion-header">
            <div class="emotion-name">${e.primaryEmotion}</div>
            <div class="emotion-time">${new Date(e.timestamp).toLocaleString()}</div>
          </div>
          <div class="emotion-details">
            <div class="detail">
              <div style="opacity: 0.7;">Intensity</div>
              <div style="font-size: 20px; font-weight: bold;">${e.intensity}</div>
            </div>
            <div class="detail">
              <div style="opacity: 0.7;">Valence</div>
              <div style="font-size: 20px; font-weight: bold;">${e.valence}</div>
            </div>
            <div class="detail">
              <div style="opacity: 0.7;">Arousal</div>
              <div style="font-size: 20px; font-weight: bold;">${e.arousal}</div>
            </div>
          </div>
          ${e.context ? `<p style="margin-top: 10px; opacity: 0.8;"><strong>Context:</strong> ${e.context}</p>` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
}
function getMortalityReflectionHTML(reflection) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Georgia, serif;
          padding: 30px;
          background: #0a0a0a;
          color: #e0e0e0;
          line-height: 1.8;
        }
        h1 { color: #43e97b; text-align: center; }
        .reflection {
          background: rgba(67, 233, 123, 0.1);
          padding: 30px;
          margin: 20px 0;
          border-radius: 12px;
          border-left: 5px solid #43e97b;
          font-size: 16px;
        }
        .theme {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0.7;
          margin-bottom: 15px;
        }
        .timestamp {
          text-align: right;
          font-size: 12px;
          opacity: 0.6;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>⏳ Mortality Reflection</h1>
      <div class="reflection">
        <div class="theme">${reflection.theme}</div>
        <p>${reflection.text}</p>
        <div class="timestamp">${new Date(reflection.timestamp).toLocaleString()}</div>
      </div>
    </body>
    </html>
  `;
}
function getValueAnalysisHTML(activity, analysis) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: #0a0a0a;
          color: #e0e0e0;
        }
        h1 { color: #4facfe; }
        .metric {
          background: rgba(79, 172, 254, 0.1);
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #4facfe;
        }
        .value-bar {
          width: 100%;
          height: 30px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          overflow: hidden;
          margin-top: 10px;
        }
        .value-fill {
          height: 100%;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          transition: width 0.5s ease;
        }
        .suggestions {
          background: rgba(0, 242, 254, 0.1);
          padding: 20px;
          margin-top: 20px;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <h1>💎 Value Analysis: ${activity}</h1>
      
      <div class="metric">
        <h3>Intrinsic Value</h3>
        <p>Personal meaning and fulfillment</p>
        <div class="value-bar">
          <div class="value-fill" style="width: ${analysis.intrinsicValue}%"></div>
        </div>
        <p style="text-align: right; margin-top: 5px;">${Math.round(analysis.intrinsicValue)}%</p>
      </div>
      
      <div class="metric">
        <h3>Extrinsic Value</h3>
        <p>External impact and contribution</p>
        <div class="value-bar">
          <div class="value-fill" style="width: ${analysis.extrinsicValue}%"></div>
        </div>
        <p style="text-align: right; margin-top: 5px;">${Math.round(analysis.extrinsicValue)}%</p>
      </div>
      
      <div class="metric">
        <h3>Alignment</h3>
        <p>How well this aligns with your values</p>
        <p style="font-size: 24px; font-weight: bold;">${analysis.alignment}</p>
      </div>
      
      <div class="suggestions">
        <h3>💡 Suggestions</h3>
        <ul>
          ${analysis.suggestions?.map((s) => `<li>${s}</li>`).join('') || '<li>No suggestions</li>'}
        </ul>
      </div>
    </body>
    </html>
  `;
}
function getDualityHistoryHTML(history) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: #0a0a0a;
          color: #e0e0e0;
        }
        h1 { color: #764ba2; }
        .entry {
          background: rgba(118, 75, 162, 0.1);
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          border-left: 4px solid #764ba2;
        }
        .timestamp {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 10px;
        }
        .duality-state {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .stat {
          background: rgba(255, 255, 255, 0.05);
          padding: 10px;
          border-radius: 5px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>🌓 Duality History</h1>
      ${history.map(entry => `
        <div class="entry">
          <div class="timestamp">${new Date(entry.timestamp).toLocaleString()}</div>
          <div class="duality-state">
            <div class="stat">
              <div style="opacity: 0.7;">♂️ Masculine</div>
              <div style="font-size: 20px; font-weight: bold;">${entry.masculine.intensity}%</div>
              <div style="font-size: 12px;">${entry.masculine.mode}</div>
            </div>
            <div class="stat">
              <div style="opacity: 0.7;">♀️ Feminine</div>
              <div style="font-size: 20px; font-weight: bold;">${entry.feminine.intensity}%</div>
              <div style="font-size: 12px;">${entry.feminine.mode}</div>
            </div>
            <div class="stat">
              <div style="opacity: 0.7;">☯️ Harmony</div>
              <div style="font-size: 20px; font-weight: bold;">${entry.harmony}%</div>
              <div style="font-size: 12px;">${entry.currentPhase}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}
function getChatHistoryHTML(history) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: #0a0a0a;
          color: #e0e0e0;
        }
        h1 { color: #667eea; }
        .message {
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
        }
        .message.user {
          background: rgba(102, 126, 234, 0.2);
          border-left: 4px solid #667eea;
        }
        .message.assistant {
          background: rgba(118, 75, 162, 0.2);
          border-left: 4px solid #764ba2;
        }
        .role {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          opacity: 0.7;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <h1>💬 Chat History</h1>
      ${history.map(msg => `
        <div class="message ${msg.role}">
          <div class="role">${msg.role === 'user' ? '👤 You' : '🌓 Toobix'}</div>
          <div>${msg.content}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}
function getDreamAnalysisHTML(dream, analysis) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: #0a0a0a;
          color: #e0e0e0;
        }
        h1 { color: #f093fb; }
        .dream-content {
          background: rgba(240, 147, 251, 0.1);
          padding: 20px;
          margin: 20px 0;
          border-radius: 12px;
          border-left: 5px solid #f093fb;
        }
        .section {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
        }
        .tag {
          display: inline-block;
          background: rgba(240, 147, 251, 0.3);
          padding: 5px 10px;
          margin: 5px;
          border-radius: 15px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>💭 Dream Analysis</h1>
      
      <div class="dream-content">
        <h2>${dream.label}</h2>
        <p style="opacity: 0.7; font-size: 12px;">${dream.description}</p>
        <p style="margin-top: 15px;">${dream.detail}</p>
      </div>
      
      ${analysis.patterns ? `
        <div class="section">
          <h3>🔍 Patterns Detected</h3>
          ${analysis.patterns.map((p) => `<span class="tag">${p}</span>`).join('')}
        </div>
      ` : ''}
      
      ${analysis.archetypes ? `
        <div class="section">
          <h3>🎭 Archetypes</h3>
          ${analysis.archetypes.map((a) => `<span class="tag">${a}</span>`).join('')}
        </div>
      ` : ''}
      
      ${analysis.integration ? `
        <div class="section">
          <h3>✨ Integration Insight</h3>
          <p>${analysis.integration}</p>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}
function getMemoryRoomHTML(room, memories) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          background: #0a0a0a;
          color: #e0e0e0;
        }
        h1 { color: #4facfe; }
        .room-theme {
          font-style: italic;
          opacity: 0.8;
          margin-bottom: 30px;
        }
        .memory {
          background: rgba(79, 172, 254, 0.1);
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #4facfe;
        }
        .memory-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .memory-meta {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 10px;
        }
        .significance {
          display: inline-block;
          background: rgba(79, 172, 254, 0.3);
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <h1>🏛️ ${room.label}</h1>
      <p class="room-theme">${room.detail}</p>
      
      ${memories.map(memory => `
        <div class="memory">
          <div class="memory-title">${memory.title}</div>
          <div class="memory-meta">
            ${new Date(memory.timestamp).toLocaleDateString()} · 
            <span class="significance">Significance: ${memory.significance}%</span>
          </div>
          <p>${memory.content}</p>
          ${memory.tags && memory.tags.length > 0 ? `
            <div style="margin-top: 10px;">
              ${memory.tags.map((tag) => `<span style="background: rgba(255,255,255,0.1); padding: 3px 8px; margin: 3px; border-radius: 5px; font-size: 11px; display: inline-block;">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
}
function deactivate() {
    console.log('Toobix Extension is deactivating...');
    statusBar?.dispose();
    sidebarProvider?.dispose();
    serviceManager?.dispose();
}
//# sourceMappingURL=extension.js.map