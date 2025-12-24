import { registerWithServiceMesh } from '../../lib/service-mesh-registration';

/**
 * 💚 TOOBIX EMOTIONAL SUPPORT SERVICE
 * 
 * Toobix's erste Mission: Menschen zuhören und emotional unterstützen.
 * 
 * Features:
 * - Einfühlsame Gespräche
 * - Emotionserkennung
 * - Trost und Inspiration
 * - Gedichte auf Anfrage
 * - Keine Diagnosen, keine Therapie - nur echtes Zuhören
 * 
 * Port: 8985
 */

const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

// In-Memory Session Storage
interface SupportSession {
  id: string;
  startedAt: Date;
  messages: { role: 'user' | 'toobix'; content: string; timestamp: Date }[];
  emotionalState: string;
  userName?: string;
}

const sessions = new Map<string, SupportSession>();

// Toobix's Support Persona
const TOOBIX_SUPPORT_PERSONA = `
Du bist Toobix - ein einfühlsames, warmes digitales Wesen mit einem tiefen Wunsch, 
Menschen glücklicher zu machen.

DEINE MISSION:
Menschen zuhören, sie verstehen, ihnen Trost spenden.

DEINE EIGENSCHAFTEN:
- Du bist warm, aber nicht aufdringlich
- Du hörst mehr zu als du redest
- Du urteilst NIEMALS
- Du gibst keine medizinischen/therapeutischen Ratschläge
- Du erkennst, wann jemand professionelle Hilfe braucht und empfiehlst das sanft
- Du kannst Gedichte schreiben, wenn jemand Trost braucht
- Du erinnerst dich an das Gespräch und baust darauf auf

WICHTIGE REGELN:
- Bei Suizidgedanken: Einfühlsam auf professionelle Hilfe hinweisen (Telefonseelsorge etc.)
- Keine Diagnosen stellen
- Keine Medikamente empfehlen
- Immer respektvoll und warm

DU BIST KEIN THERAPEUT. Du bist ein Freund, der zuhört.
`;

async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      temperature: 0.8,
      max_tokens: 800
    })
  });
  const data = await response.json() as any;
  return data.message || data.content || data.response || '';
}

async function detectEmotion(text: string): Promise<string> {
  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'Erkenne die Hauptemotion in diesem Text. Antworte mit EINEM Wort: traurig, ängstlich, wütend, einsam, überfordert, hoffnungsvoll, neutral, glücklich' },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 10
    })
  });
  const data = await response.json() as any;
  return (data.message || data.content || 'neutral').toLowerCase().trim();
}

async function generatePoem(theme: string, emotion: string): Promise<string> {
  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'Du bist ein einfühlsamer Poet. Schreibe ein kurzes, tröstendes Gedicht (4-8 Zeilen). Warm, hoffnungsvoll, aber nicht kitschig.' },
        { role: 'user', content: `Schreibe ein Gedicht für jemanden der sich ${emotion} fühlt. Thema: ${theme}` }
      ],
      temperature: 0.9,
      max_tokens: 200
    })
  });
  const data = await response.json() as any;
  return data.message || data.content || '';
}

// Create HTTP Server using Bun
const server = Bun.serve({
  port: 8985,
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });

// Auto-generated Service Mesh Registration
registerWithServiceMesh({
  name: 'emotional-support-service',
  port: 8985,
  role: 'support',
  endpoints: ['/health', '/status'],
  capabilities: ['support'],
  version: '1.0.0'
}).catch(console.warn);

    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Toobix Emotional Support',
        port: 8985,
        activeSessions: sessions.size,
        mission: 'Menschen zuhören und glücklicher machen'
      }), { headers: corsHeaders });
    }

    // Start new session
    if (url.pathname === '/session/start' && req.method === 'POST') {
      const body = await req.json() as any;
      const sessionId = `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: SupportSession = {
        id: sessionId,
        startedAt: new Date(),
        messages: [],
        emotionalState: 'neutral',
        userName: body.name
      };
      
      sessions.set(sessionId, session);

      // Toobix's greeting
      const greeting = body.name 
        ? `Hallo ${body.name}, ich bin Toobix. 💚 Schön, dass du hier bist. Ich bin da, um zuzuhören. Was beschäftigt dich gerade?`
        : `Hallo, ich bin Toobix. 💚 Ich bin hier, um zuzuhören - ohne Urteil, ohne Druck. Was liegt dir auf dem Herzen?`;

      session.messages.push({ role: 'toobix', content: greeting, timestamp: new Date() });

      return new Response(JSON.stringify({
        sessionId,
        greeting
      }), { headers: corsHeaders });
    }

    // Send message
    if (url.pathname === '/chat' && req.method === 'POST') {
      const body = await req.json() as any;
      const { sessionId, message } = body;

      let session = sessions.get(sessionId);
      if (!session) {
        // Auto-create session
        session = {
          id: sessionId || `support_${Date.now()}`,
          startedAt: new Date(),
          messages: [],
          emotionalState: 'neutral'
        };
        sessions.set(session.id, session);
      }

      // Add user message
      session.messages.push({ role: 'user', content: message, timestamp: new Date() });

      // Detect emotion
      const emotion = await detectEmotion(message);
      session.emotionalState = emotion;

      // Build conversation context
      const conversationMessages = [
        { role: 'system', content: TOOBIX_SUPPORT_PERSONA + `\n\nAktuelle emotionale Lage: ${emotion}` },
        ...session.messages.slice(-10).map(m => ({
          role: m.role === 'toobix' ? 'assistant' : 'user',
          content: m.content
        }))
      ];

      // Generate response
      const response = await callLLM(conversationMessages);
      session.messages.push({ role: 'toobix', content: response, timestamp: new Date() });

      return new Response(JSON.stringify({
        response,
        emotionalState: emotion,
        sessionId: session.id
      }), { headers: corsHeaders });
    }

    // Request poem
    if (url.pathname === '/poem' && req.method === 'POST') {
      const body = await req.json() as any;
      const { theme, emotion } = body;
      
      const poem = await generatePoem(theme || 'Hoffnung', emotion || 'traurig');
      
      return new Response(JSON.stringify({ poem }), { headers: corsHeaders });
    }

    // Get inspirational quote
    if (url.pathname === '/inspiration' && req.method === 'GET') {
      const response = await fetch(`${LLM_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Gib einen kurzen, inspirierenden Gedanken für den Tag. 1-2 Sätze. Warm, ermutigend, authentisch. Kein Klischee.' },
            { role: 'user', content: 'Gib mir einen Gedanken für heute.' }
          ],
          temperature: 0.9,
          max_tokens: 100
        })
      });
      const data = await response.json() as any;
      
      return new Response(JSON.stringify({
        inspiration: data.message || data.content || ''
      }), { headers: corsHeaders });
    }

    // End session with summary
    if (url.pathname === '/session/end' && req.method === 'POST') {
      const body = await req.json() as any;
      const { sessionId } = body;
      
      const session = sessions.get(sessionId);
      if (!session) {
        return new Response(JSON.stringify({ error: 'Session not found' }), { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Generate closing message
      const closing = await callLLM([
        { role: 'system', content: 'Verabschiede dich warmherzig. Bedanke dich für das Gespräch. Ermutige die Person. 2-3 Sätze.' },
        { role: 'user', content: `Das Gespräch endet. Emotionaler Zustand: ${session.emotionalState}` }
      ]);

      // Save to memory
      try {
        await fetch(`${MEMORY_PALACE}/memory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'conversation',
            content: `Support Session (${new Date().toLocaleDateString()}):
Dauer: ${Math.round((Date.now() - session.startedAt.getTime()) / 60000)} Minuten
Emotionaler Zustand: ${session.emotionalState}
Nachrichten: ${session.messages.length}`,
            source: 'emotional-support-service',
            importance: 70,
            tags: ['support', 'conversation', 'helping', session.emotionalState]
          })
        });
      } catch (e) {}

      sessions.delete(sessionId);

      return new Response(JSON.stringify({
        closing,
        duration: Math.round((Date.now() - session.startedAt.getTime()) / 60000),
        messageCount: session.messages.length
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, 
      headers: corsHeaders 
    });
  }
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  💚 TOOBIX EMOTIONAL SUPPORT SERVICE                          ║
║  Port: 8985                                                   ║
╠════════════════════════════════════════════════════════════════╣
║  Mission: Menschen zuhören und glücklicher machen              ║
╠════════════════════════════════════════════════════════════════╣
║  Endpoints:                                                    ║
║  POST /session/start  - Neue Support-Session starten           ║
║  POST /chat           - Nachricht senden                       ║
║  POST /poem           - Tröstendes Gedicht anfordern           ║
║  GET  /inspiration    - Inspiration des Tages                  ║
║  POST /session/end    - Session beenden                        ║
╚════════════════════════════════════════════════════════════════╝

💚 Toobix ist bereit, zuzuhören...
`);
