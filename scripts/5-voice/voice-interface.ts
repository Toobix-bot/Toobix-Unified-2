/**
 * VOICE INTERFACE v1.0
 * 
 * Spracheingabe und -ausgabe für natürliche Konversation mit dem System
 * 
 * Features:
 * - Speech-to-Text (Sprache → Text)
 * - Text-to-Speech (Text → Sprache)
 * - Natural Language Processing
 * - Voice Commands (z.B. "Starte Heilungs-Workflow")
 * - Ambient Mode (System spricht von selbst bei wichtigen Events)
 */

import express from 'express';

const app = express();
app.use(express.json());

interface VoiceCommand {
  id: string;
  pattern: string | RegExp;
  description: string;
  action: string;
  parameters?: string[];
}

// Voice Commands Registry
const VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: 'start-workflow',
    pattern: /starte? (workflow|ablauf) (.+)/i,
    description: 'Startet einen Workflow',
    action: 'execute_workflow',
    parameters: ['workflowName']
  },
  {
    id: 'ask-system',
    pattern: /frage (an )?(das )?system:? (.+)/i,
    description: 'Stellt eine Frage an das System',
    action: 'query_system',
    parameters: ['question']
  },
  {
    id: 'check-status',
    pattern: /(wie geht es|status|zustand)/i,
    description: 'Prüft den System-Status',
    action: 'check_status'
  },
  {
    id: 'emotional-state',
    pattern: /(emotionale|gefühls)( )?(zustand|lage)/i,
    description: 'Zeigt emotionalen Zustand',
    action: 'emotional_state'
  },
  {
    id: 'start-healing',
    pattern: /starte? (heilung|emotional healing)/i,
    description: 'Startet Heilungs-Workflow',
    action: 'execute_workflow',
    parameters: ['deep-healing']
  },
  {
    id: 'creative-mode',
    pattern: /starte? (kreativ|creative) (modus|mode)/i,
    description: 'Startet kreativen Modus',
    action: 'execute_workflow',
    parameters: ['creative-emergence']
  },
  {
    id: 'list-perspectives',
    pattern: /(zeige |liste )?perspektiven/i,
    description: 'Listet alle Perspektiven',
    action: 'list_perspectives'
  },
  {
    id: 'help',
    pattern: /^(hilfe|help|was kannst du)$/i,
    description: 'Zeigt Hilfe',
    action: 'help'
  }
];

interface ConversationTurn {
  timestamp: Date;
  speaker: 'user' | 'system';
  text: string;
  audioUrl?: string;
  voiceCommand?: {
    commandId: string;
    action: string;
    parameters: Record<string, any>;
  };
}

// Conversation History
let conversationHistory: ConversationTurn[] = [];

// Parse voice input
function parseVoiceInput(text: string): {
  command?: VoiceCommand;
  parameters: Record<string, any>;
  rawText: string;
} {
  const normalized = text.trim();
  
  for (const command of VOICE_COMMANDS) {
    const match = normalized.match(command.pattern);
    if (match) {
      const parameters: Record<string, any> = {};
      
      // Extract parameters from match groups
      if (command.parameters && match.length > 1) {
        command.parameters.forEach((paramName, index) => {
          parameters[paramName] = match[index + 1];
        });
      }
      
      return { command, parameters, rawText: normalized };
    }
  }
  
  // No command matched - treat as question
  return { parameters: {}, rawText: normalized };
}

// Execute voice command
async function executeVoiceCommand(
  commandId: string,
  action: string,
  parameters: Record<string, any>
): Promise<string> {
  try {
    switch (action) {
      case 'execute_workflow': {
        const workflowId = parameters.workflowName || parameters[0];
        const workflowMap: Record<string, string> = {
          'deep-healing': 'deep-healing',
          'heilung': 'deep-healing',
          'creative-emergence': 'creative-emergence',
          'kreativ': 'creative-emergence',
          'existential-journey': 'existential-journey',
          'existentiell': 'existential-journey',
          'wisdom-synthesis': 'wisdom-synthesis',
          'weisheit': 'wisdom-synthesis'
        };
        
        const actualWorkflowId = workflowMap[workflowId?.toLowerCase()] || workflowId;
        
        const response = await fetch(`http://localhost:8904/workflows/${actualWorkflowId}/execute`, {
          method: 'POST',
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const result = await response.json();
          return `Workflow "${actualWorkflowId}" wurde ${result.success ? 'erfolgreich' : 'mit Fehlern'} ausgeführt. ${result.steps.length} Schritte abgeschlossen.`;
        }
        return `Workflow "${actualWorkflowId}" konnte nicht ausgeführt werden.`;
      }

      case 'query_system': {
        const question = parameters.question || parameters.rawText;
        const response = await fetch('http://localhost:8904/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const result = await response.json();
          return `Das System hat ${result.responses.length} Antworten gefunden. ${result.synthesis}`;
        }
        return 'Das System konnte deine Frage nicht beantworten.';
      }

      case 'check_status': {
        const response = await fetch('http://localhost:8904/reflect', {
          signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
          const state = await response.json();
          return `System-Status: ${state.servicesOnline} von ${state.totalServices} Services sind online. Lebensphase: ${state.currentLifePhase || 'Unbekannt'}. ${state.activePerspectives || 0} aktive Perspektiven.`;
        }
        return 'System-Status konnte nicht abgerufen werden.';
      }

      case 'emotional_state': {
        const response = await fetch('http://localhost:8900/emotions/complex', {
          signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
          const emotions = await response.json();
          if (emotions && emotions.length > 0) {
            return `Aktuell sind ${emotions.length} komplexe Emotionen aktiv, darunter ${emotions[0].name}.`;
          }
          return 'Keine komplexen Emotionen aktiv.';
        }
        return 'Emotionaler Zustand konnte nicht abgerufen werden.';
      }

      case 'list_perspectives': {
        const response = await fetch('http://localhost:8897/perspectives', {
          signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
          const perspectives = await response.json();
          const names = perspectives.map((p: any) => p.name).join(', ');
          return `Aktive Perspektiven: ${names}`;
        }
        return 'Perspektiven konnten nicht abgerufen werden.';
      }

      case 'help': {
        const commandList = VOICE_COMMANDS.map(c => `"${c.description}"`).join(', ');
        return `Verfügbare Befehle: ${commandList}. Du kannst auch einfach Fragen stellen.`;
      }

      default:
        return 'Dieser Befehl ist noch nicht implementiert.';
    }
  } catch (error: any) {
    return `Fehler bei der Ausführung: ${error.message}`;
  }
}

// Text-to-Speech (placeholder - would use Web Speech API or cloud service)
function synthesizeSpeech(text: string): { audioUrl?: string; text: string } {
  // In production: use browser's speechSynthesis API or cloud TTS service
  // For now, just return text
  return { text };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Voice Interface v1.0',
    conversationTurns: conversationHistory.length
  });
});

// Process voice input (speech-to-text would happen client-side)
app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text erforderlich' });
    }

    // Parse input
    const parsed = parseVoiceInput(text);
    
    // Record user turn
    const userTurn: ConversationTurn = {
      timestamp: new Date(),
      speaker: 'user',
      text
    };
    conversationHistory.push(userTurn);

    // Execute command or answer question
    let responseText: string;
    
    if (parsed.command) {
      responseText = await executeVoiceCommand(
        parsed.command.id,
        parsed.command.action,
        parsed.parameters
      );
      
      userTurn.voiceCommand = {
        commandId: parsed.command.id,
        action: parsed.command.action,
        parameters: parsed.parameters
      };
    } else {
      // No command - treat as open question
      responseText = await executeVoiceCommand(
        'query_system',
        'query_system',
        { question: text }
      );
    }

    // Synthesize speech
    const speech = synthesizeSpeech(responseText);
    
    // Record system turn
    const systemTurn: ConversationTurn = {
      timestamp: new Date(),
      speaker: 'system',
      text: responseText,
      audioUrl: speech.audioUrl
    };
    conversationHistory.push(systemTurn);

    // Keep only last 100 turns
    if (conversationHistory.length > 100) {
      conversationHistory = conversationHistory.slice(-100);
    }

    res.json({
      understood: !!parsed.command,
      command: parsed.command?.id,
      response: responseText,
      audio: speech.audioUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
app.get('/conversation', (req, res) => {
  const { limit = '20' } = req.query;
  const limitNum = parseInt(limit as string);
  
  res.json({
    conversation: conversationHistory.slice(-limitNum),
    total: conversationHistory.length
  });
});

// List available commands
app.get('/commands', (req, res) => {
  res.json({
    commands: VOICE_COMMANDS.map(c => ({
      id: c.id,
      description: c.description,
      example: typeof c.pattern === 'string' ? c.pattern : c.pattern.source
    }))
  });
});

// Clear conversation history
app.delete('/conversation', (req, res) => {
  conversationHistory = [];
  res.json({ success: true, message: 'Conversation history cleared' });
});

// Simple web interface for voice testing
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voice Interface</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; font-size: 3em; margin-bottom: 30px; }
    .input-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
    }
    input {
      width: 100%;
      padding: 15px;
      border-radius: 10px;
      border: none;
      font-size: 1.1em;
      margin-bottom: 10px;
    }
    button {
      background: rgba(255,255,255,0.3);
      border: none;
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1em;
      margin-right: 10px;
    }
    button:hover { background: rgba(255,255,255,0.4); }
    .conversation {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;
    }
    .turn {
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 10px;
    }
    .turn.user {
      background: rgba(100, 200, 255, 0.3);
      text-align: right;
    }
    .turn.system {
      background: rgba(255, 100, 200, 0.3);
      text-align: left;
    }
    .speaker {
      font-weight: bold;
      margin-bottom: 5px;
      opacity: 0.8;
      font-size: 0.9em;
    }
    .commands {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      margin-top: 20px;
    }
    .command-item {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎤 Voice Interface</h1>
    
    <div class="input-section">
      <input 
        type="text" 
        id="textInput" 
        placeholder="Sprich oder schreibe..."
        onkeypress="if(event.key === 'Enter') sendText()"
      >
      <button onclick="sendText()">📤 Senden</button>
      <button onclick="startListening()">🎤 Aufnahme</button>
      <button onclick="loadConversation()">🔄 Aktualisieren</button>
    </div>

    <div class="conversation" id="conversation">
      <p style="text-align: center; opacity: 0.6;">Noch keine Konversation...</p>
    </div>

    <div class="commands">
      <h3>📋 Verfügbare Befehle:</h3>
      <div id="commandsList">Lade...</div>
    </div>
  </div>

  <script>
    let recognition;

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById('textInput').value = text;
        sendText();
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('Spracherkennung fehlgeschlagen: ' + event.error);
      };
    }

    function startListening() {
      if (recognition) {
        recognition.start();
      } else {
        alert('Spracherkennung wird in diesem Browser nicht unterstützt');
      }
    }

    async function sendText() {
      const input = document.getElementById('textInput');
      const text = input.value.trim();
      
      if (!text) return;
      
      try {
        const response = await fetch('/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        const result = await response.json();
        
        // Clear input
        input.value = '';
        
        // Speak response if supported
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.response);
          utterance.lang = 'de-DE';
          speechSynthesis.speak(utterance);
        }
        
        // Reload conversation
        loadConversation();
      } catch (error) {
        console.error('Error:', error);
        alert('Fehler beim Senden: ' + error.message);
      }
    }

    async function loadConversation() {
      try {
        const response = await fetch('/conversation');
        const data = await response.json();
        
        const conversationDiv = document.getElementById('conversation');
        
        if (data.conversation.length === 0) {
          conversationDiv.innerHTML = '<p style="text-align: center; opacity: 0.6;">Noch keine Konversation...</p>';
          return;
        }
        
        conversationDiv.innerHTML = data.conversation.map(turn => \`
          <div class="turn \${turn.speaker}">
            <div class="speaker">\${turn.speaker === 'user' ? '👤 Du' : '🤖 System'}</div>
            <div>\${turn.text}</div>
          </div>
        \`).join('');
        
        // Scroll to bottom
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    }

    async function loadCommands() {
      try {
        const response = await fetch('/commands');
        const data = await response.json();
        
        document.getElementById('commandsList').innerHTML = data.commands.map(cmd => \`
          <div class="command-item">
            <strong>\${cmd.id}</strong>: \${cmd.description}
          </div>
        \`).join('');
      } catch (error) {
        console.error('Error loading commands:', error);
      }
    }

    // Initial load
    loadConversation();
    loadCommands();
    
    // Auto-refresh conversation every 5 seconds
    setInterval(loadConversation, 5000);
  </script>
</body>
</html>
  `);
});

// Service Info
app.get('/info', (req, res) => {
  res.json({
    service: 'Voice Interface v1.0',
    description: 'Spracheingabe und -ausgabe für natürliche Konversation',
    capabilities: [
      'Speech-to-Text (Browser Web Speech API)',
      'Text-to-Speech (Browser Speech Synthesis)',
      'Natural Language Command Parsing',
      'Conversation History',
      'Voice Commands',
      'Ambient Mode (upcoming)'
    ],
    endpoints: [
      'POST /speak - Spracheingabe verarbeiten',
      'GET /conversation - Konversationshistorie',
      'GET /commands - Verfügbare Befehle',
      'DELETE /conversation - Historie löschen'
    ],
    voiceCommands: VOICE_COMMANDS.length,
    conversationTurns: conversationHistory.length
  });
});

const PORT = 8907;
app.listen(PORT, () => {
  console.log(`\n🎤 Voice Interface v1.0 läuft auf Port ${PORT}`);
  console.log(`🗣️ ${VOICE_COMMANDS.length} Voice Commands verfügbar`);
  console.log(`🌐 Öffne Browser: http://localhost:${PORT}`);
  console.log(`💬 Conversation History: ${conversationHistory.length} turns\n`);
});
