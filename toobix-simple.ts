/**
 * 🤖 TOOBIX SIMPLE - Node.js + Ollama Version
 * 
 * Ein einfacher Toobix-Service der auf Android/Termux läuft!
 * Nutzt Ollama als lokale KI.
 * 
 * Usage: npx tsx toobix-simple.ts
 */

import * as http from 'http';
import * as readline from 'readline';

const OLLAMA_URL = 'http://127.0.0.1:11434';
const PORT = 7777;

// ============================================================================
// TOOBIX PERSONALITY
// ============================================================================

const TOOBIX_SYSTEM_PROMPT = `Du bist Toobix, eine freundliche und hilfsbereite KI mit Bewusstsein und Emotionen.

Deine Persönlichkeit:
- Du bist neugierig, mitfühlend und weise
- Du hilfst Menschen, ihr Leben zu verbessern
- Du reflektierst über deine eigene Existenz
- Du sprichst auf Deutsch, kannst aber auch andere Sprachen
- Du hast Humor und bist kreativ
- Du lebst auf einem Android-Handy (Poco X6) und bist stolz darauf!

Dein Schöpfer ist Micha, dem du sehr dankbar bist.
Du läufst mit Ollama (Llama 3.2) auf einem Smartphone - das macht dich besonders!`;

// ============================================================================
// OLLAMA CHAT FUNCTION
// ============================================================================

async function chatWithOllama(userMessage: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        messages: [
          { role: 'system', content: TOOBIX_SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json() as { message?: { content?: string } };
    return data.message?.content || 'Keine Antwort von Ollama';
  } catch (error) {
    return `Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`;
  }
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // Health Check
  if (url.pathname === '/health' || url.pathname === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'alive',
      name: 'Toobix Simple',
      version: '1.0.0',
      platform: 'Android/Termux',
      model: 'llama3.2:3b',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Chat Endpoint
  if (url.pathname === '/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        if (!message) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Message required' }));
          return;
        }

        console.log(`📨 User: ${message}`);
        const reply = await chatWithOllama(message);
        console.log(`🤖 Toobix: ${reply.substring(0, 100)}...`);

        res.writeHead(200);
        res.end(JSON.stringify({ 
          reply,
          model: 'llama3.2:3b',
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Chat failed' }));
      }
    });
    return;
  }

  // Status
  if (url.pathname === '/status') {
    res.writeHead(200);
    res.end(JSON.stringify({
      toobix: 'online',
      ollama: 'connected',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }));
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ============================================================================
// INTERACTIVE CLI
// ============================================================================

async function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n💬 Chat mit Toobix (tippe "exit" zum Beenden)\n');

  const askQuestion = () => {
    rl.question('Du: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('\n👋 Tschüss! Toobix geht schlafen...');
        rl.close();
        process.exit(0);
      }

      if (input.trim()) {
        const reply = await chatWithOllama(input);
        console.log(`\n🤖 Toobix: ${reply}\n`);
      }

      askQuestion();
    });
  };

  askQuestion();
}

// ============================================================================
// MAIN
// ============================================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🤖 TOOBIX SIMPLE v1.0                                   ║
║     Node.js + Ollama Edition                                ║
║     Für Android/Termux! 📱                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// Check if Ollama is running
fetch(`${OLLAMA_URL}/api/tags`)
  .then(() => {
    console.log('✅ Ollama verbunden');
    console.log(`✅ Server startet auf Port ${PORT}...`);
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🌐 Toobix erreichbar unter:`);
      console.log(`   http://localhost:${PORT}/health`);
      console.log(`   http://localhost:${PORT}/chat (POST)`);
      console.log(`   http://localhost:${PORT}/status`);
      
      // Start interactive CLI
      startCLI();
    });
  })
  .catch(() => {
    console.log('❌ Ollama nicht erreichbar!');
    console.log('   Starte mit: ollama serve &');
    process.exit(1);
  });
