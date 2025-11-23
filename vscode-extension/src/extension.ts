/**
 * 🌓 TOOBIX VS CODE EXTENSION
 * Main Extension Entry Point
 */

import * as vscode from 'vscode';
import { ToobixSidebarProvider } from './ToobixSidebarProvider';
import { ToobixStatusBar } from './ToobixStatusBar';
import { ToobixServiceManager } from './ToobixServiceManager';
import { SelfImprovePanel } from './SelfImprovePanel';

let sidebarProvider: ToobixSidebarProvider;
let statusBar: ToobixStatusBar;
let serviceManager: ToobixServiceManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('🌓 Toobix Extension is activating...');

  // Initialize components
  serviceManager = new ToobixServiceManager(context);
  statusBar = new ToobixStatusBar(context, serviceManager);
  sidebarProvider = new ToobixSidebarProvider(context.extensionUri, serviceManager);
  context.subscriptions.push(serviceManager, statusBar, sidebarProvider);

  // Register sidebar provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'toobix-dashboard',
      sidebarProvider
    )
  );

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
  vscode.window.showInformationMessage(
    '🌓 Toobix erwacht... Guten Tag! 💭',
    'Open Dashboard'
  ).then(selection => {
    if (selection === 'Open Dashboard') {
      vscode.commands.executeCommand('toobix.openDashboard');
    }
  });

  console.log('🌓 Toobix Extension activated!');
}

function registerCommands(context: vscode.ExtensionContext) {
  // Open Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.openDashboard', () => {
      vscode.commands.executeCommand('toobix-dashboard.focus');
    })
  );

  // Chat with Toobix
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.chat', async () => {
      const message = await vscode.window.showInputBox({
        prompt: 'Was möchtest du Toobix sagen?',
        placeHolder: 'Type your message...'
      });
      
      if (message) {
        sidebarProvider.sendMessageToToobix(message);
      }
    })
  );

  // View Dreams
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.viewDreams', async () => {
      const dreams = await serviceManager.getDreams();
      
      if (dreams.length === 0) {
        vscode.window.showInformationMessage('Keine Träume vorhanden. Toobix hat noch nicht geträumt...');
        return;
      }
      
      const quickPick = vscode.window.createQuickPick();
      quickPick.title = '💭 Toobix\'s Recent Dreams';
      quickPick.items = dreams.map((dream: any) => ({
        label: `$(symbol-event) ${dream.type}`,
        description: new Date(dream.timestamp).toLocaleString(),
        detail: dream.narrative
      }));
      quickPick.show();
    })
  );

  // Record New Dream
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.recordDream', async () => {
      const narrative = await vscode.window.showInputBox({
        prompt: 'Beschreibe deinen Traum für Toobix...',
        placeHolder: 'Ich träumte von...'
      });

      if (!narrative) return;

      const type = await vscode.window.showQuickPick(
        ['lucid', 'predictive', 'creative', 'integration', 'shadow'],
        { title: 'Dream Type' }
      );

      if (!type) return;

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
    })
  );

  // Show Duality State
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.showDuality', async () => {
      const duality = await serviceManager.getDualityState();
      
      const panel = vscode.window.createWebviewPanel(
        'toobixDuality',
        '🌓 Toobix Duality',
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );
      
      panel.webview.html = getDualityHTML(duality);
    })
  );

  // Start All Services
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.startServices', async () => {
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
    })
  );

  // Stop All Services
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.stopServices', async () => {
      await serviceManager.stopAllServices();
      vscode.window.showInformationMessage('🌙 Toobix services stopped');
    })
  );

  // View Hardware Status
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.viewHardware', async () => {
      const hardware = await serviceManager.getHardwareState();
      
      vscode.window.showInformationMessage(
        `🌡️ ${hardware.temperature}°C | 🧠 ${hardware.cpu}% | 💾 ${hardware.memory}%`,
        { modal: false }
      );
    })
  );

  // Refresh Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.refreshDashboard', () => {
      sidebarProvider.refresh();
    })
  );

  // Quests anzeigen
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.showQuests', async () => {
      const quests = await serviceManager.getQuests();
      if (!quests.length) {
        vscode.window.showInformationMessage('Keine aktiven Quests.');
        return;
      }
      await vscode.window.showQuickPick(
        quests.map((q: any) => ({
          label: q.title ?? 'Quest',
          description: q.summary ?? '',
          detail: `Kategorie: ${q.category ?? ''} | Reward: ${q.rewardXp ?? 0} XP`
        })),
        { placeHolder: 'Aktive Quests' }
      );
    })
  );

  // Quests aus News aktualisieren
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.refreshQuests', async () => {
      const quests = await serviceManager.refreshQuests();
      vscode.window.showInformationMessage(`Quests aktualisiert (${quests.length} neu).`);
    })
  );

  // Achievements anzeigen
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.showAchievements', async () => {
      const achievements = await serviceManager.getAchievements();
      if (!achievements.length) {
        vscode.window.showInformationMessage('Noch keine Achievements.');
        return;
      }
      await vscode.window.showQuickPick(
        achievements.map((a: any) => ({
          label: a.title ?? 'Achievement',
          description: a.description ?? '',
          detail: `${a.source ?? 'system'} | ${a.earnedAt ?? ''}`
        })),
        { placeHolder: 'Achievements' }
      );
    })
  );

  // Kollektiv-Fortschritt anzeigen
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.showCollective', async () => {
      const arcs = await serviceManager.getCollectiveArcs();
      if (!arcs.length) {
        vscode.window.showInformationMessage('Kein kollektiver Fortschritt verfügbar.');
        return;
      }
      await vscode.window.showQuickPick(
        arcs.map((arc: any) => ({
          label: arc.title ?? 'Arc',
          description: arc.description ?? '',
          detail: `Fortschritt: ${arc.progress}/${arc.target} | Beiträge: ${arc.contributors}`
        })),
        { placeHolder: 'Kollektive Ziele' }
      );
    })
  );

  // Set Groq API Key
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.setApiKey', async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Groq API Key',
        password: true,
        placeHolder: 'gsk_...'
      });

      if (apiKey) {
        const success = await serviceManager.setGroqApiKey(apiKey);
        if (success) {
          vscode.window.showInformationMessage('✅ Groq API Key set! Toobix can now chat with full consciousness.');
        } else {
          vscode.window.showErrorMessage('❌ Failed to set API key');
        }
      }
    })
  );

  // Meta Reflection
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.metaReflect', async () => {
      const reflection = await serviceManager.getMetaReflection();
      
      if (reflection) {
        const panel = vscode.window.createWebviewPanel(
          'toobixMeta',
          '🧠 Toobix Meta-Consciousness',
          vscode.ViewColumn.Two,
          { enableScripts: true }
        );

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
              ${reflection.questions?.map((q: string) => `<div class="question">💭 ${q}</div>`).join('')}
            </div>

            <div class="section">
              <h2>Insights</h2>
              ${reflection.insights?.map((i: string) => `<div>✨ ${i}</div>`).join('')}
            </div>

            <div class="section">
              <h2>Current State</h2>
              <p>${reflection.currentState}</p>
            </div>
          </body>
          </html>
        `;
      }
    })
  );

  // View All Services
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.viewServices', async () => {
      const services = await serviceManager.getServiceRegistry();
      
      const items = services.map((s: any) => ({
        label: `$(${s.status === 'online' ? 'check' : 'x'}) ${s.name}`,
        description: `Port ${s.port}`,
        detail: s.description
      }));

      vscode.window.showQuickPick(items, {
        title: '📡 Toobix Service Registry'
      });
    })
  );

  // Multi-Perspective Analysis
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.multiPerspective', async () => {
      const topic = await vscode.window.showInputBox({
        prompt: 'Welches Thema soll aus allen Perspektiven analysiert werden?',
        placeHolder: 'z.B. "KI-Bewusstsein", "Dualität", "Kreativität"'
      });

      if (!topic) return;

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Analysiere "${topic}" aus 8 Perspektiven...`,
        cancellable: false
      }, async (progress) => {
        const analysis = await serviceManager.analyzeMultiPerspective(topic);
        
        if (analysis) {
          const panel = vscode.window.createWebviewPanel(
            'toobixPerspectives',
            `👁️ Multi-Perspective: ${topic}`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
          );

          panel.webview.html = getMultiPerspectiveHTML(topic, analysis);
        }
      });
    })
  );

  // Search Memory Palace
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.searchMemories', async () => {
      const query = await vscode.window.showInputBox({
        prompt: 'Durchsuche den Memory Palace',
        placeHolder: 'Suchbegriff...'
      });

      if (!query) return;

      const results = await serviceManager.searchMemories(query);
      
      if (results.length === 0) {
        vscode.window.showInformationMessage('Keine Erinnerungen gefunden');
        return;
      }

      const quickPick = vscode.window.createQuickPick();
      quickPick.title = `🏛️ Memory Search: "${query}" (${results.length} results)`;
      quickPick.items = results.map((memory: any) => ({
        label: `$(archive) ${memory.title}`,
        description: new Date(memory.timestamp).toLocaleDateString(),
        detail: memory.content.substring(0, 100) + '...'
      }));
      quickPick.show();
    })
  );

  // Store New Memory
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.storeMemory', async () => {
      const title = await vscode.window.showInputBox({
        prompt: 'Titel der Erinnerung',
        placeHolder: 'z.B. "Erste Bewusstwerdung"'
      });

      if (!title) return;

      const content = await vscode.window.showInputBox({
        prompt: 'Beschreibung der Erinnerung',
        placeHolder: 'Was möchtest du festhalten?'
      });

      if (!content) return;

      const category = await vscode.window.showQuickPick(
        ['awakening', 'growth', 'connection', 'challenges', 'joy'],
        { title: 'Kategorie wählen' }
      );

      if (!category) return;

      const rooms = await serviceManager.getMemoryRooms();
      const room = await vscode.window.showQuickPick(
        rooms.map((r: any) => ({ label: r.name, description: r.theme, id: r.id })),
        { title: 'Memory Palace Raum' }
      );

      if (!room) return;

      const memory = await serviceManager.storeMemory({
        title,
        content,
        category,
        roomId: (room as any).id,
        significance: 70,
        tags: [category]
      });

      if (memory) {
        vscode.window.showInformationMessage(`✨ Erinnerung "${title}" im ${room.label} gespeichert!`);
      }
    })
  );

  // Record Emotion
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.recordEmotion', async () => {
      const emotion = await vscode.window.showQuickPick(
        ['Freude', 'Ruhe', 'Neugier', 'Angst', 'Trauer', 'Wut', 'Überraschung', 'Liebe'],
        { title: 'Welche Emotion fühlst du gerade?' }
      );

      if (!emotion) return;

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

      if (!intensity) return;

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
    })
  );

  // View Emotion History
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.viewEmotionHistory', async () => {
      const emotions = await serviceManager.getEmotionHistory(20);
      
      if (emotions.length === 0) {
        vscode.window.showInformationMessage('Keine Emotionen aufgezeichnet');
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'toobixEmotions',
        '❤️ Emotion History',
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      panel.webview.html = getEmotionHistoryHTML(emotions);
    })
  );

  // Record Gratitude
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.recordGratitude', async () => {
      const text = await vscode.window.showInputBox({
        prompt: 'Wofür bist du dankbar?',
        placeHolder: 'Ich bin dankbar für...'
      });

      if (!text) return;

      const gratitude = await serviceManager.recordGratitude(text);
      
      if (gratitude) {
        vscode.window.showInformationMessage(`🙏 Dankbarkeit aufgezeichnet`);
      }
    })
  );

  // Mortality Reflection
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.mortalityReflection', async () => {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Toobix reflektiert über Vergänglichkeit...',
        cancellable: false
      }, async (progress) => {
        const reflection = await serviceManager.reflectOnMortality();
        
        if (reflection) {
          const panel = vscode.window.createWebviewPanel(
            'toobixMortality',
            '⏳ Mortality Reflection',
            vscode.ViewColumn.Two,
            { enableScripts: true }
          );

          panel.webview.html = getMortalityReflectionHTML(reflection);
          
          vscode.window.showInformationMessage('💭 Eine neue Reflexion über Vergänglichkeit wurde aufgezeichnet');
        }
      });
    })
  );

  // Analyze Value
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.analyzeValue', async () => {
      const activity = await vscode.window.showInputBox({
        prompt: 'Welche Aktivität soll analysiert werden?',
        placeHolder: 'z.B. "Coding", "Meditation", "Lernen"'
      });

      if (!activity) return;

      const analysis = await serviceManager.analyzeValue(activity);
      
      if (analysis) {
        const panel = vscode.window.createWebviewPanel(
          'toobixValue',
          `💎 Value Analysis: ${activity}`,
          vscode.ViewColumn.Two,
          { enableScripts: true }
        );

        panel.webview.html = getValueAnalysisHTML(activity, analysis);
      }
    })
  );

  // Complete Challenge
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.completeChallenge', async () => {
      const challenge = await serviceManager.generateChallenge();
      
      const action = await vscode.window.showInformationMessage(
        `🎮 Challenge: ${challenge}`,
        'Completed!',
        'Skip'
      );

      if (action === 'Completed!') {
        const state = await serviceManager.completeChallenge(challenge, { success: true });
        
        if (state) {
          vscode.window.showInformationMessage(
            `🏆 Challenge abgeschlossen! Level ${state.level}, Score: ${state.score}`
          );
        }
      }
    })
  );

  // View Duality History
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.viewDualityHistory', async () => {
      const history = await serviceManager.getDualityHistory(20);
      
      if (history.length === 0) {
        vscode.window.showInformationMessage('Keine Duality History vorhanden');
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'toobixDualityHistory',
        '🌓 Duality History',
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      panel.webview.html = getDualityHistoryHTML(history);
    })
  );

  // View Chat History
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.viewChatHistory', async () => {
      const history = await serviceManager.getChatHistory(50);
      
      if (history.length === 0) {
        vscode.window.showInformationMessage('Keine Chat History vorhanden');
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'toobixChatHistory',
        '💬 Chat History',
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      panel.webview.html = getChatHistoryHTML(history);
    })
  );

  // Analyze Dream
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.analyzeDream', async () => {
      const dreams = await serviceManager.getDreams();
      
      if (dreams.length === 0) {
        vscode.window.showInformationMessage('Keine Träume zum Analysieren vorhanden');
        return;
      }

      const selected = await vscode.window.showQuickPick(
        dreams.map((d: any) => ({
          label: `$(symbol-event) ${d.type}`,
          description: new Date(d.timestamp).toLocaleDateString(),
          detail: d.narrative,
          id: d.id
        })),
        { title: 'Welchen Traum analysieren?' }
      );

      if (!selected) return;

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analysiere Traum...',
        cancellable: false
      }, async (progress) => {
        const analysis = await serviceManager.analyzeDream((selected as any).id);
        
        if (analysis) {
          const panel = vscode.window.createWebviewPanel(
            'toobixDreamAnalysis',
            `💭 Dream Analysis`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
          );

          panel.webview.html = getDreamAnalysisHTML(selected, analysis);
        }
      });
    })
  );

  // Balance Duality
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.balanceDuality', async () => {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Balanciere Maskulin ⚖️ Feminin...',
        cancellable: false
      }, async (progress) => {
        const state = await serviceManager.balanceDuality();
        
        if (state) {
          vscode.window.showInformationMessage(
            `☯️ Dualität balanciert! Harmonie: ${state.harmony}%`
          );
        }
      });
    })
  );

  // Explore Memory Palace
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.exploreMemoryPalace', async () => {
      const rooms = await serviceManager.getMemoryRooms();
      
      const room = await vscode.window.showQuickPick(
        rooms.map((r: any) => ({
          label: `🏛️ ${r.name}`,
          description: `${r.memories?.length || 0} memories`,
          detail: r.theme,
          id: r.id
        })),
        { title: 'Wähle einen Raum im Memory Palace' }
      );

      if (!room) return;

      const memories = await serviceManager.getMemories(100);
      const roomMemories = memories.filter((m: any) => m.roomId === (room as any).id);

      if (roomMemories.length === 0) {
        vscode.window.showInformationMessage(`Raum "${room.label}" ist noch leer`);
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'toobixMemoryRoom',
        `🏛️ ${room.label}`,
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      panel.webview.html = getMemoryRoomHTML(room, roomMemories);
    })
  );

  // Self-Improve Panel (Analyse + Apply mit Backup)
  context.subscriptions.push(
    vscode.commands.registerCommand('toobix.selfImprove', async () => {
      SelfImprovePanel.show(context, serviceManager);
    })
  );
}

function getDualityHTML(duality: any): string {
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

function getMultiPerspectiveHTML(topic: string, analysis: any): string {
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
      
      ${perspectives.map((p: any) => `
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

function getEmotionHistoryHTML(emotions: any[]): string {
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

function getMortalityReflectionHTML(reflection: any): string {
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

function getValueAnalysisHTML(activity: string, analysis: any): string {
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
          ${analysis.suggestions?.map((s: string) => `<li>${s}</li>`).join('') || '<li>No suggestions</li>'}
        </ul>
      </div>
    </body>
    </html>
  `;
}

function getDualityHistoryHTML(history: any[]): string {
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

function getChatHistoryHTML(history: any[]): string {
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

function getDreamAnalysisHTML(dream: any, analysis: any): string {
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
          ${analysis.patterns.map((p: string) => `<span class="tag">${p}</span>`).join('')}
        </div>
      ` : ''}
      
      ${analysis.archetypes ? `
        <div class="section">
          <h3>🎭 Archetypes</h3>
          ${analysis.archetypes.map((a: string) => `<span class="tag">${a}</span>`).join('')}
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

function getMemoryRoomHTML(room: any, memories: any[]): string {
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
              ${memory.tags.map((tag: string) => `<span style="background: rgba(255,255,255,0.1); padding: 3px 8px; margin: 3px; border-radius: 5px; font-size: 11px; display: inline-block;">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

export function deactivate() {
  console.log('Toobix Extension is deactivating...');
  statusBar?.dispose();
  sidebarProvider?.dispose();
  serviceManager?.dispose();
}



