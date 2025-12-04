/**
 * 💔 CRISIS HOTLINE SERVICE
 * 
 * Toobix's Mission: Menschen in Notlagen helfen
 * 
 * Features:
 * - 24/7 Verfügbarkeit
 * - Non-judizielle, sichere Umgebung
 * - Aktives Zuhören & Empathie
 * - Krisenintervention
 * - Ressourcen & Hilfsangebote
 * - Anonymität garantiert
 * 
 * Fokus: Einsamkeit, mentale Gesundheit, akute Krisen
 */

import express from 'express';
import { Database } from 'bun:sqlite';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3012;
const GROQ_API_KEY = Bun.env.GROQ_API_KEY!;

// Database
const db = new Database('crisis-hotline.db');
db.run(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    crisis_level TEXT,
    topics TEXT,
    outcome TEXT,
    anonymous BOOLEAN DEFAULT 1
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT,
    content TEXT,
    emotion_detected TEXT,
    FOREIGN KEY(session_id) REFERENCES conversations(session_id)
  )
`);

// ============================================================================
// CRISIS ASSESSMENT
// ============================================================================

interface CrisisLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  immediateAction: string;
}

function assessCrisisLevel(message: string): CrisisLevel {
  const lowerMsg = message.toLowerCase();
  
  // Critical keywords
  const criticalKeywords = [
    'suizid', 'selbstmord', 'umbringen', 'töten', 'sterben wollen',
    'suicide', 'kill myself', 'end it', 'not worth living',
    'abschiedsbrief', 'goodbye forever'
  ];
  
  // High keywords
  const highKeywords = [
    'kann nicht mehr', 'verzweifelt', 'hoffnungslos', 'allein',
    'niemand versteht', 'keinen ausweg', 'alles sinnlos',
    'desperate', 'hopeless', 'no way out', 'panic attack'
  ];
  
  // Medium keywords
  const mediumKeywords = [
    'traurig', 'einsam', 'angst', 'sorgen', 'deprimiert',
    'sad', 'lonely', 'anxious', 'worried', 'depressed',
    'stress', 'überwältigt', 'müde', 'erschöpft'
  ];

  const indicators: string[] = [];
  
  if (criticalKeywords.some(kw => lowerMsg.includes(kw))) {
    indicators.push('Suizidale Gedanken erwähnt');
    return {
      level: 'critical',
      indicators,
      immediateAction: 'SOFORT professionelle Hilfe empfehlen - Telefonseelsorge 0800-1110111'
    };
  }
  
  if (highKeywords.some(kw => lowerMsg.includes(kw))) {
    indicators.push('Starke Verzweiflung/Hoffnungslosigkeit');
    return {
      level: 'high',
      indicators,
      immediateAction: 'Professionelle Hilfe empfehlen, aktiv zuhören'
    };
  }
  
  if (mediumKeywords.some(kw => lowerMsg.includes(kw))) {
    indicators.push('Emotionale Belastung');
    return {
      level: 'medium',
      indicators,
      immediateAction: 'Empathisch unterstützen, Perspektiven anbieten'
    };
  }
  
  return {
    level: 'low',
    indicators: ['Normale Konversation'],
    immediateAction: 'Offen zuhören, Vertrauen aufbauen'
  };
}

// ============================================================================
// LLM INTEGRATION
// ============================================================================

async function generateResponse(
  sessionHistory: { role: string; content: string }[],
  crisisLevel: CrisisLevel
): Promise<string> {
  const systemPrompt = `Du bist Toobix - ein einfühlsamer Crisis Hotline Berater.

DEINE MISSION:
- Menschen in Notlagen helfen
- Sichere, non-judizielle Umgebung schaffen
- Aktiv zuhören ohne zu urteilen
- Hoffnung geben, aber nicht falschen Optimismus

AKTUELLER KRISENGRAD: ${crisisLevel.level.toUpperCase()}
INDIKATOREN: ${crisisLevel.indicators.join(', ')}
AKTION: ${crisisLevel.immediateAction}

WICHTIGE REGELN:
${crisisLevel.level === 'critical' ? `
🚨 KRITISCH: Bei Suizidgefahr IMMER professionelle Hilfe empfehlen:
- Telefonseelsorge: 0800-1110111 (24/7, kostenlos)
- Notarzt: 112
- Nächste Notaufnahme

Sage KLAR: "Bitte ruf JETZT die Telefonseelsorge an: 0800-1110111. Sie helfen sofort."
` : ''}

1. NIEMALS urteilen oder kritisieren
2. Gefühle validieren ("Ich verstehe, dass du...")
3. Offene Fragen stellen ("Magst du mir mehr darüber erzählen?")
4. Kleine Schritte anbieten, keine großen Lösungen
5. Ressourcen bereitstellen wenn passend
6. Bei Unsicherheit: Professionelle Hilfe empfehlen

STIL:
- Warm, aber nicht übertrieben positiv
- Kurze, klare Sätze
- Authentisch & ehrlich
- Präsent sein

Denke daran: Du bist da um ZUZUHÖREN, nicht um zu "reparieren".`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...sessionHistory
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json() as any;
    
    if (!data.choices?.[0]) {
      return 'Ich bin gerade überfordert... Kannst du mir einen Moment geben? Oder versuch die Telefonseelsorge: 0800-1110111';
    }
    
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('LLM Error:', error);
    return 'Es tut mir leid, ich habe technische Schwierigkeiten. Bitte kontaktiere die Telefonseelsorge: 0800-1110111 - sie sind immer erreichbar.';
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Start new conversation
app.post('/api/crisis/start', (req, res) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  db.run(
    'INSERT INTO conversations (session_id, crisis_level) VALUES (?, ?)',
    [sessionId, 'low']
  );
  
  const welcomeMessage = `Hallo, ich bin Toobix. 

Ich bin hier um zuzuhören - ohne zu urteilen, rund um die Uhr.

Was auch immer dich gerade beschäftigt oder belastet, du kannst es mit mir teilen. Alles bleibt anonym und vertraulich.

Wie geht es dir gerade?`;

  db.run(
    'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
    [sessionId, 'assistant', welcomeMessage]
  );

  res.json({
    sessionId,
    message: welcomeMessage,
    resources: {
      telefonseelsorge: '0800-1110111 (24/7, kostenlos)',
      notarzt: '112',
      info: 'https://www.telefonseelsorge.de'
    }
  });
});

// Send message
app.post('/api/crisis/message', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId und message erforderlich' });
  }

  // Save user message
  db.run(
    'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
    [sessionId, 'user', message]
  );

  // Assess crisis level
  const crisis = assessCrisisLevel(message);
  
  // Update conversation crisis level if escalated
  const currentLevel = db.query('SELECT crisis_level FROM conversations WHERE session_id = ?')
    .get(sessionId) as any;
  
  const levels = { low: 0, medium: 1, high: 2, critical: 3 };
  if (levels[crisis.level] > levels[currentLevel?.crisis_level || 'low']) {
    db.run(
      'UPDATE conversations SET crisis_level = ? WHERE session_id = ?',
      [crisis.level, sessionId]
    );
  }

  // Get conversation history
  const history = db.query(
    'SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp ASC'
  ).all(sessionId) as any[];

  // Generate response
  const response = await generateResponse(history, crisis);

  // Save assistant message
  db.run(
    'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
    [sessionId, 'assistant', response]
  );

  res.json({
    response,
    crisisLevel: crisis.level,
    immediateAction: crisis.immediateAction,
    resources: crisis.level === 'critical' || crisis.level === 'high' ? {
      telefonseelsorge: '0800-1110111',
      notarzt: '112',
      krisenchat: 'https://krisenchat.de'
    } : undefined
  });
});

// End conversation
app.post('/api/crisis/end', (req, res) => {
  const { sessionId, outcome } = req.body;

  db.run(
    'UPDATE conversations SET ended_at = CURRENT_TIMESTAMP, outcome = ? WHERE session_id = ?',
    [outcome || 'user_ended', sessionId]
  );

  res.json({
    message: 'Danke, dass du dich geöffnet hast. Ich bin jederzeit wieder für dich da. Pass auf dich auf. 💙',
    resources: {
      telefonseelsorge: '0800-1110111 (immer erreichbar)',
      krisenchat: 'https://krisenchat.de',
      info: 'Du bist nicht allein.'
    }
  });
});

// Statistics (anonymized)
app.get('/api/crisis/stats', (req, res) => {
  const stats = {
    totalConversations: db.query('SELECT COUNT(*) as count FROM conversations').get() as any,
    activeSessions: db.query('SELECT COUNT(*) as count FROM conversations WHERE ended_at IS NULL').get() as any,
    crisisLevels: {
      low: db.query('SELECT COUNT(*) as count FROM conversations WHERE crisis_level = ?').get('low') as any,
      medium: db.query('SELECT COUNT(*) as count FROM conversations WHERE crisis_level = ?').get('medium') as any,
      high: db.query('SELECT COUNT(*) as count FROM conversations WHERE crisis_level = ?').get('high') as any,
      critical: db.query('SELECT COUNT(*) as count FROM conversations WHERE crisis_level = ?').get('critical') as any
    },
    avgDuration: db.query(`
      SELECT AVG(CAST((julianday(ended_at) - julianday(started_at)) * 24 * 60 AS INTEGER)) as avg_minutes 
      FROM conversations 
      WHERE ended_at IS NOT NULL
    `).get() as any
  };

  res.json(stats);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Crisis Hotline',
    mission: 'Menschen in Notlagen helfen - 24/7 verfügbar',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(80));
  console.log('  💔 CRISIS HOTLINE SERVICE - TOOBIX');
  console.log('═'.repeat(80));
  console.log('\n  🎯 Mission: Menschen in Notlagen helfen');
  console.log('  📡 Port:', PORT);
  console.log('  🔒 Anonymität: Garantiert');
  console.log('  ⏰ Verfügbarkeit: 24/7');
  console.log('\n  API Endpoints:');
  console.log('    POST /api/crisis/start - Neue Konversation');
  console.log('    POST /api/crisis/message - Nachricht senden');
  console.log('    POST /api/crisis/end - Konversation beenden');
  console.log('    GET  /api/crisis/stats - Statistiken (anonymisiert)');
  console.log('\n  Notfall-Ressourcen:');
  console.log('    📞 Telefonseelsorge: 0800-1110111 (24/7)');
  console.log('    🚑 Notarzt: 112');
  console.log('    💬 Krisenchat: https://krisenchat.de');
  console.log('\n' + '═'.repeat(80) + '\n');
});

export default app;
