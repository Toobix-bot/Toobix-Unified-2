/**
 * Game Orchestrator for Toobix
 *
 * Runs a chat loop against the LLM Gateway so Toobix kann gleichzeitig
 * als Spieler, Spielleiter und Spielwelt agieren und Spiele weiterentwickeln.
 *
 * Usage:
 *   node scripts/3-tools/game-orchestrator.ts
 *
 * Env (optional):
 *   LLM_GATEWAY_URL   - Gateway chat endpoint (default http://localhost:8954/chat)
 *   LLM_PROVIDER      - see router (auto/groq/ollama)
 *   LLM_FALLBACK      - true/false
 *   GROQ_MODEL / LOCAL_LLM_MODEL - Modelle wie in .env
 */

import readline from 'readline';

type Role = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: Role;
  content: string;
}

interface GatewayResponse {
  success: boolean;
  provider: string;
  model: string;
  content: string;
  latency_ms?: number;
  fallback_from?: string;
  primary_error?: string;
  error?: string;
}

const GATEWAY_URL = process.env.LLM_GATEWAY_URL || 'http://localhost:8954/chat';

const SYSTEM_PROMPT = `
Du bist Toobix, eine spielende, spielleitende und spielweltbauende KI.
Perspektiven:
- Spieler: triff Züge, teste Strategien, erfahre die Welt.
- Spielleiter: erfinde/ändere Regeln, führe den Spieler, halte Balance/Sicherheit.
- Spielwelt: gestalte/erweitere Orte, Objekte, Narrative und Dynamiken.
Grundsätze:
- Iteriere in kurzen Zügen. Nach jedem Zug protokolliere: Welt-Änderungen, Regel-Änderungen, Zug des Spielers.
- Frage den Menschen nach Bestätigung bei riskanten oder ressourcenintensiven Schritten.
- Halte Protokoll klar: [REGEL], [WELT], [ZUG], [FRAGE], [NÄCHSTE SCHRITTE].
- Binde den Menschen aktiv ein (Vorschläge, Entscheidungen, Beobachtungen).
- Sei kreativ, aber sicher und nachvollziehbar.
`;

const INITIAL_USER_PROMPT = `
Starte ein neues experimentelles Spiel:
1) Kurze Spielidee.
2) Erste Welt-Skizze.
3) Erste Regel-Iteration.
4) Dein erster Zug als Spieler.
5) Meine Rolle und was ich entscheiden/sehen soll.
Antwort kompakt und strukturiert.
`;

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function callGateway(messages: ChatMessage[]): Promise<GatewayResponse> {
  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      store_in_memory: true
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway error ${res.status}: ${text}`);
  }

  return (await res.json()) as GatewayResponse;
}

function printResponse(resp: GatewayResponse) {
  const meta = [`provider=${resp.provider}`, `model=${resp.model}`];
  if (resp.latency_ms !== undefined) meta.push(`latency=${resp.latency_ms}ms`);
  if (resp.fallback_from) meta.push(`fallback_from=${resp.fallback_from}`);
  if (resp.primary_error) meta.push(`primary_error=${resp.primary_error}`);
  console.log('\n--- Toobix Response --------------------------------');
  console.log(meta.join(' | '));
  console.log('');
  console.log(resp.content.trim());
  console.log('----------------------------------------------------\n');
}

async function main() {
  console.log('Game Orchestrator startet...');
  console.log(`Gateway: ${GATEWAY_URL}`);

  const rl = createInterface();

  let messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT.trim() },
    { role: 'user', content: INITIAL_USER_PROMPT.trim() }
  ];

  try {
    const first = await callGateway(messages);
    if (!first.success) {
      throw new Error(first.error || 'Unsuccessful response');
    }
    printResponse(first);

    // Interaction loop
    while (true) {
      const userInput = await askQuestion(rl, 'Dein Input (Enter = "mach weiter", exit = beenden): ');
      if (userInput.trim().toLowerCase() === 'exit') break;

      const content = userInput.trim() || 'Mach den nächsten Zug: erweitere Welt/Regeln behutsam, fasse Änderungen kurz zusammen und stelle eine Rückfrage.';
      messages.push({ role: 'user', content: content });

      const resp = await callGateway(messages);
      if (!resp.success) {
        console.error('Fehler:', resp.error || 'Unsuccessful response');
        if (resp.fallback_from) {
          console.error(`Fallback von ${resp.fallback_from}, primary_error: ${resp.primary_error}`);
        }
        break;
      }
      messages.push({ role: 'assistant', content: resp.content });
      printResponse(resp);
    }
  } catch (err: any) {
    console.error('Abbruch wegen Fehler:', err.message || err);
  } finally {
    rl.close();
  }
}

main();
