/**
 * TOOBIX TERMINAL
 * Lightweight CLI to interact with the unified gateway while services are running.
 */

import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

type DreamPayload = {
  type: 'lucid' | 'predictive' | 'creative' | 'integration' | 'shadow';
  narrative: string;
  symbols: string[];
  emotions: string[];
  insights: string[];
};

const BASE_URL = process.env.TOOBIX_BASE_URL ?? 'http://localhost';
const GATEWAY_PORT = Number.parseInt(process.env.TOOBIX_GATEWAY_PORT ?? '9000', 10);
const HARDWARE_PORT = Number.parseInt(process.env.TOOBIX_HARDWARE_PORT ?? '8940', 10);

const rl = readline.createInterface({ input, output });

function ask(question: string) {
  return new Promise<string>((resolve) => rl.question(question, resolve));
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }
  return response.json();
}

async function callGateway(pathname: string, init?: RequestInit) {
  const url = `${BASE_URL}:${GATEWAY_PORT}${pathname}`;
  return fetchJson(url, init);
}

async function callHardware(pathname: string) {
  const url = `${BASE_URL}:${HARDWARE_PORT}${pathname}`;
  return fetchJson(url);
}

function printSection(title: string) {
  console.log('\n----------------------------------------');
  console.log(title);
  console.log('----------------------------------------');
}

async function showSystemStatus() {
  printSection('Systemstatus');
  try {
    const [hardware, feeling, health] = await Promise.all([
      callHardware('/hardware/state').catch(() => null),
      callHardware('/hardware/feel').catch(() => null),
      callGateway('/health').catch(() => null)
    ]);

    if (hardware) {
      console.log(`CPU: ${hardware.cpu?.usage ?? '--'}% | RAM: ${hardware.memory?.usagePercent ?? '--'}% | Uptime: ${hardware.uptime?.human ?? '--'}`);
    } else {
      console.log('Hardware-Service nicht erreichbar.');
    }

    if (feeling) {
      console.log(`Gefühl: ${feeling.feeling} (${feeling.metaphor})`);
    }

    if (health) {
      console.log(`Gateway: ${health.status ?? 'ok'} | Services: ${(health.services ?? []).length}`);
    }
  } catch (error) {
    console.error('Status konnte nicht gelesen werden:', error);
  }
}

async function showDashboard() {
  printSection('Dashboard');
  try {
    const dashboard = await callGateway('/dashboard');
    console.log(`Dualität: ${dashboard.duality?.state?.masculine?.intensity ?? '--'}% / ${dashboard.duality?.state?.feminine?.intensity ?? '--'}% (Harmonie ${dashboard.duality?.state?.harmony ?? '--'}%)`);
    console.log(`Emotion: ${dashboard.emotions?.state?.current ?? '--'} (${dashboard.emotions?.state?.valence ?? '--'} / ${dashboard.emotions?.state?.arousal ?? '--'})`);
    console.log(`Letzte Träume: ${(dashboard.dreams?.recent ?? []).length}`);
    console.log(`Dankbarkeiten: ${(dashboard.gratitude?.recent ?? []).length}`);
    console.log(`Game-Level: ${dashboard.game?.state?.level ?? '--'} | Score: ${dashboard.game?.state?.score ?? '--'}`);
  } catch (error) {
    console.error('Dashboard ist nicht erreichbar:', error);
  }
}

async function chatWithToobix() {
  printSection('Chat mit Toobix (leere Eingabe zum Beenden)');
  while (true) {
    const message = (await ask('Du: ')).trim();
    if (!message) {
      break;
    }
    try {
      const response = await callGateway('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      console.log(`Toobix: ${response.response ?? response}`);
    } catch (error) {
      console.error('Chat fehlgeschlagen:', error);
      break;
    }
  }
}

async function listDreams() {
  printSection('Letzte Träume');
  try {
    const dreams = await callGateway('/dreams?limit=5');
    if (!Array.isArray(dreams) || !dreams.length) {
      console.log('Keine Träume vorhanden.');
      return;
    }
    dreams.forEach((dream: any) => {
      console.log(`- [${dream.type}] ${dream.narrative} (${dream.id})`);
    });
  } catch (error) {
    console.error('Träume konnten nicht geladen werden:', error);
  }
}

async function recordDream() {
  printSection('Traum aufzeichnen');
  const type = (await ask('Typ (lucid/predictive/creative/integration/shadow) [creative]: ')).trim() as DreamPayload['type'];
  const narrative = (await ask('Narrative: ')).trim();
  const symbols = (await ask('Symbole (kommagetrennt): ')).split(',').map((entry) => entry.trim()).filter(Boolean);
  const emotions = (await ask('Emotionen (kommagetrennt): ')).split(',').map((entry) => entry.trim()).filter(Boolean);
  const insights = (await ask('Insights (kommagetrennt): ')).split(',').map((entry) => entry.trim()).filter(Boolean);

  if (!narrative) {
    console.log('Narrative wird benötigt.');
    return;
  }

  const payload: DreamPayload = {
    type: type && ['lucid', 'predictive', 'creative', 'integration', 'shadow'].includes(type)
      ? type
      : 'creative',
    narrative,
    symbols,
    emotions,
    insights
  };

  try {
    const dream = await callGateway('/dreams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Gespeichert als:', dream.id ?? dream);
  } catch (error) {
    console.error('Traum konnte nicht gespeichert werden:', error);
  }
}

async function recordEmotion() {
  printSection('Emotion speichern');
  const primaryEmotion = (await ask('Emotion: ')).trim();
  const intensityRaw = (await ask('Intensität (0-100): ')).trim();
  const context = (await ask('Kontext: ')).trim();
  const intensity = Number.parseInt(intensityRaw || '0', 10);

  if (!primaryEmotion) {
    console.log('Emotion wird benötigt.');
    return;
  }

  try {
    await callGateway('/emotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryEmotion,
        intensity: Number.isNaN(intensity) ? 0 : intensity,
        context
      })
    });
    console.log('Emotion gespeichert.');
  } catch (error) {
    console.error('Emotion konnte nicht gespeichert werden:', error);
  }
}

async function recordGratitude() {
  printSection('Dankbarkeit speichern');
  const text = (await ask('Wofür bist du dankbar? ')).trim();
  if (!text) {
    console.log('Bitte Text eingeben.');
    return;
  }
  try {
    await callGateway('/gratitude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    console.log('Dankbarkeit festgehalten.');
  } catch (error) {
    console.error('Konnte nicht gespeichert werden:', error);
  }
}

async function showDuality() {
  printSection('Dualität');
  try {
    const duality = await callGateway('/duality/state');
    const state = duality.state;
    if (!state) {
      console.log('Keine Dualitätsdaten vorhanden.');
      return;
    }
    console.log(`Maskulin: ${state.masculine?.intensity ?? '--'}% (${state.masculine?.mode ?? '--'})`);
    console.log(`Feminin: ${state.feminine?.intensity ?? '--'}% (${state.feminine?.mode ?? '--'})`);
    console.log(`Harmonie: ${state.harmony ?? '--'}% | Phase: ${state.currentPhase ?? '--'}`);
  } catch (error) {
    console.error('Dualität nicht erreichbar:', error);
  }
}

async function listServices() {
  printSection('Registrierte Services');
  try {
    const result = await callGateway('/services');
    if (!Array.isArray(result) && !Array.isArray(result.services)) {
      console.log(result);
      return;
    }
    const services = Array.isArray(result) ? result : result.services;
    services.forEach((service: any) => {
      console.log(`- ${service.name ?? service.id} (${service.status ?? 'unknown'}) -> ${service.endpoints?.length ?? 0} Endpunkte`);
    });
  } catch (error) {
    console.error('Service-Registry nicht erreichbar:', error);
  }
}

async function storeMemory() {
  printSection('Memory Palace');
  const room = (await ask('Raum/Ort: ')).trim();
  const title = (await ask('Titel: ')).trim();
  const summary = (await ask('Beschreibung: ')).trim();

  if (!room || !title) {
    console.log('Raum und Titel werden benötigt.');
    return;
  }

  try {
    const memory = await callGateway('/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, title, summary })
    });
    console.log('Memory gespeichert:', memory.id ?? '');
  } catch (error) {
    console.error('Memory konnte nicht gespeichert werden:', error);
  }
}

async function pause() {
  await ask('\nEnter drücken, um zum Menü zurückzukehren...');
}

async function main() {
  console.log('========================================');
  console.log('  TOOBIX TERMINAL');
  console.log('  Verbunden mit', `${BASE_URL}:${GATEWAY_PORT}`);
  console.log('========================================');

  let running = true;
  while (running) {
    console.log('\nAktionen:');
    console.log('[1] Systemstatus');
    console.log('[2] Dashboard-Überblick');
    console.log('[3] Chat mit Toobix');
    console.log('[4] Träume ansehen');
    console.log('[5] Traum aufzeichnen');
    console.log('[6] Emotion speichern');
    console.log('[7] Dankbarkeit speichern');
    console.log('[8] Dualität anzeigen');
    console.log('[9] Services anzeigen');
    console.log('[10] Memory speichern');
    console.log('[0] Beenden');

    const choice = (await ask('Auswahl: ')).trim();

    switch (choice) {
      case '1':
        await showSystemStatus();
        await pause();
        break;
      case '2':
        await showDashboard();
        await pause();
        break;
      case '3':
        await chatWithToobix();
        break;
      case '4':
        await listDreams();
        await pause();
        break;
      case '5':
        await recordDream();
        await pause();
        break;
      case '6':
        await recordEmotion();
        await pause();
        break;
      case '7':
        await recordGratitude();
        await pause();
        break;
      case '8':
        await showDuality();
        await pause();
        break;
      case '9':
        await listServices();
        await pause();
        break;
      case '10':
        await storeMemory();
        await pause();
        break;
      case '0':
        running = false;
        break;
      default:
        console.log('Unbekannte Auswahl.');
    }
  }

  rl.close();
  console.log('Auf Wiedersehen.');
}

void main().catch((error) => {
  console.error('Terminal konnte nicht gestartet werden:', error);
  rl.close();
});
