#!/usr/bin/env bun
/**
 * TOOBIX SELF-IMPROVEMENT AGENT
 * - Pollt den Unified Gateway (Port 9000) fuer Health, Dashboard, Metrics.
 * - Erkennt Luecken/Chancen und gibt sofort umsetzbare Vorschlaege aus.
 * - Optional: schreibt einen Report nach data/analytics/self-improvement-report.json.
 * - Optional: dev/backlog-Hooks (--dev) und Auto-Actions (--auto) zum Seed der Daten.
 *
 * Aufruf:
 *   bun run scripts/self-improvement-agent.ts [--base http://localhost:9000] [--interval 300000] [--log] [--auto] [--dev]
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Severity = 'critical' | 'warn' | 'info';

type Suggestion = {
  severity: Severity;
  title: string;
  details?: string;
  actions?: string[];
};

type FetchResult<T> = {
  ok: boolean;
  status?: number;
  durationMs: number;
  data?: T;
  error?: string;
};

type Snapshot = {
  timestamp: string;
  baseUrl: string;
  health: FetchResult<unknown>;
  metrics: FetchResult<any>;
  dashboard: FetchResult<any>;
  services: FetchResult<any>;
  groqKeyPresent: boolean;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ANALYTICS_DIR = path.join(REPO_ROOT, 'data', 'analytics');
const REPORT_FILE = path.join(ANALYTICS_DIR, 'self-improvement-report.json');
const DEV_BACKLOG_FILE = path.join(ANALYTICS_DIR, 'dev-backlog.json');
const DEV_DECISIONS_FILE = path.join(ANALYTICS_DIR, 'dev-decisions.json');

// -----------------------
// Argument Parsing
// -----------------------

const argv = process.argv.slice(2);
const argMap = new Map<string, string>();
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (!arg.startsWith('--')) continue;
  const eq = arg.indexOf('=');
  if (eq !== -1) {
    argMap.set(arg.slice(2, eq), arg.slice(eq + 1));
    continue;
  }
  const next = argv[i + 1];
  if (next && !next.startsWith('--')) {
    argMap.set(arg.slice(2), next);
    i++; // skip next since consumed
  } else {
    argMap.set(arg.slice(2), 'true');
  }
}

function hasArg(key: string) {
  return argMap.has(key);
}

function getArg(key: string) {
  return argMap.get(key);
}

function parseNumber(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const baseUrl = (getArg('base') ?? process.env.TOOBIX_GATEWAY_URL ?? 'http://localhost:9000').replace(/\/$/, '');
const intervalMs = Math.max(parseNumber(getArg('interval'), parseNumber(process.env.SELF_IMPROVE_INTERVAL_MS, 0)) || 0, 0);
const daemonMode = intervalMs > 0;
const logEnabled = hasArg('log') || process.env.SELF_IMPROVE_LOG === '1';
const apiKey = getArg('key') ?? process.env.TOOBIX_API_KEY;
const autoActionsEnabled = hasArg('auto') || process.env.SELF_IMPROVE_AUTO === '1';
const devMode = hasArg('dev') || process.env.SELF_IMPROVE_DEV === '1';
const maxAutoActions = Math.max(parseNumber(getArg('max-auto') ?? process.env.SELF_IMPROVE_MAX_AUTO_ACTIONS, 2), 0);
const selfChatEnabled = hasArg('self-chat') || process.env.SELF_IMPROVE_SELF_CHAT === '1';

// -----------------------
// Helpers
// -----------------------

async function fetchJson<T>(pathName: string): Promise<FetchResult<T>> {
  const url = `${baseUrl}${pathName}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: apiKey ? { 'x-toobix-key': apiKey } : undefined,
      signal: AbortSignal.timeout(2500)
    });
    const durationMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, status: res.status, durationMs, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as T;
    return { ok: true, status: res.status, durationMs, data };
  } catch (error: any) {
    return { ok: false, durationMs: Date.now() - start, error: error?.message ?? String(error) };
  }
}

async function postJson<T>(pathName: string, body: unknown): Promise<FetchResult<T>> {
  const url = `${baseUrl}${pathName}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-toobix-key': apiKey } : {})
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(2500)
    });
    const durationMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, status: res.status, durationMs, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as T;
    return { ok: true, status: res.status, durationMs, data };
  } catch (error: any) {
    return { ok: false, durationMs: Date.now() - start, error: error?.message ?? String(error) };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function severityWeight(sev: Severity) {
  return sev === 'critical' ? 0 : sev === 'warn' ? 1 : 2;
}

type DevBacklogItem = {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'applied' | 'rejected';
  source?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

type DevDecision = {
  id: string;
  title: string;
  decision: string;
  rationale?: string;
  context?: string;
  createdAt: string;
};

function loadGroqKeyFromEnvFile(): string | null {
  try {
    const envRaw = Bun.file(path.join(REPO_ROOT, '.env')).textSync();
    const match = envRaw.match(/GROQ_API_KEY=([^\r\n]+)/);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

function loadGroqKeyFromDataFile(): string | null {
  try {
    const content = Bun.file(path.join(ANALYTICS_DIR, 'groq-api-key.txt')).textSync();
    return content.trim() || null;
  } catch {
    return null;
  }
}

function loadGroqKey(): string | null {
  return process.env.GROQ_API_KEY?.trim() || loadGroqKeyFromDataFile() || loadGroqKeyFromEnvFile();
}

async function ensureGroqKeyOnGateway(key: string) {
  try {
    await postJson('/chat/set-api-key', { apiKey: key });
  } catch {
    /* ignore */
  }
}

function loadJsonFile<T>(filePath: string, fallback: T): T {
  try {
    const text = Bun.file(filePath).textSync();
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJsonFile(filePath: string, data: unknown) {
  try {
    Bun.write(filePath, JSON.stringify(data, null, 2), { createPath: true }).catch(() => {});
  } catch {
    /* ignore */
  }
}

function addBacklogItem(title: string, description: string) {
  const now = new Date().toISOString();
  const backlog = loadJsonFile<DevBacklogItem[]>(DEV_BACKLOG_FILE, []);
  const item: DevBacklogItem = {
    id: `dev-${Math.random().toString(36).slice(2, 8)}`,
    title,
    description,
    status: 'open',
    source: 'self-improve',
    category: 'self-evolve',
    createdAt: now,
    updatedAt: now
  };
  backlog.push(item);
  saveJsonFile(DEV_BACKLOG_FILE, backlog);
  return item;
}

function addDecision(title: string, decision: string, rationale?: string, context?: string) {
  const now = new Date().toISOString();
  const decisions = loadJsonFile<DevDecision[]>(DEV_DECISIONS_FILE, []);
  const entry: DevDecision = {
    id: `dec-${Math.random().toString(36).slice(2, 8)}`,
    title,
    decision,
    rationale,
    context,
    createdAt: now
  };
  decisions.push(entry);
  saveJsonFile(DEV_DECISIONS_FILE, decisions);
  return entry;
}

// -----------------------
// Evaluation
// -----------------------

function evaluate(snapshot: Snapshot): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const metrics = snapshot.metrics.data;
  const dashboard = snapshot.dashboard.data;

  if (!snapshot.health.ok) {
    suggestions.push({
      severity: 'critical',
      title: 'Gateway antwortet nicht',
      details: snapshot.health.error ?? `Healthcheck fehlgeschlagen (Status ${snapshot.health.status ?? '?'})`,
      actions: [
        'Pruefe, ob der Unified Gateway laeuft: bun run scripts/start-all.ts --mode bridge',
        'Falls er laeuft, Ports/Firewall checken (Standard 9000)'
      ]
    });
    return suggestions;
  }

  if (!snapshot.metrics.ok || !metrics) {
    suggestions.push({
      severity: 'warn',
      title: '/metrics nicht verfuegbar',
      details: snapshot.metrics.error ?? `Status ${snapshot.metrics.status ?? '?'}`,
      actions: ['Gateway-Logs pruefen, ggf. Prozess neu starten (bun run scripts/start-all.ts --mode bridge)']
    });
  }

  if (!snapshot.dashboard.ok || !dashboard) {
    suggestions.push({
      severity: 'warn',
      title: '/dashboard nicht verfuegbar',
      details: snapshot.dashboard.error ?? `Status ${snapshot.dashboard.status ?? '?'}`,
      actions: ['/health pruefen, Gateway neu starten']
    });
  }

  // Storage / API-Key
  if (!snapshot.groqKeyPresent) {
    suggestions.push({
      severity: 'warn',
      title: 'GROQ/API-Key fehlt',
      details: 'Ohne Key laeuft Chat nur im Demo-Modus.',
      actions: [
        'Setze die Variable GROQ_API_KEY und starte neu',
        'Alternativ: POST /chat/set-api-key { apiKey: "<key>" }'
      ]
    });
  }

  // Hardware awareness
  if (dashboard && dashboard.hardware === null) {
    suggestions.push({
      severity: 'warn',
      title: 'Hardware Awareness-Service fehlt',
      details: 'hardware-awareness liefert keine Telemetrie.',
      actions: [
        'Starten: bun run services/hardware-awareness-v2.ts',
        'Oder ueber Orchestrator: bun run scripts/start-all.ts --mode demo'
      ]
    });
  }

  // Data density checks
  const lowDataChecks: Array<[number | undefined, number, string, string, string[]]> = [
    [metrics?.dreams, 3, 'Wenig Traeume gespeichert', 'Das Dream Journal hat < 3 Eintraege.', [
      'POST /dreams mit einem Traum (z.B. type="creative")',
      'Nutze /dream im Chat: "/dream lucide Flug ueber der Stadt"'
    ]],
    [metrics?.emotions, 3, 'Kaum Emotionsdaten', 'Emotional Resonance hat < 3 Eintraege.', [
      'POST /emotions { primaryEmotion, valence, arousal }',
      'Web-Oberflaeche: http://localhost:3000/emotion'
    ]],
    [metrics?.memories, 1, 'Memory Palace leer', 'Keine oder kaum Erinnerungen gespeichert.', [
      'POST /memories { title, content, category }',
      'Chat: "/memory Titel :: Inhalt"'
    ]],
    [metrics?.gratitudes, 1, 'Gratitude-Log kaum genutzt', 'Nur sehr wenige Dankbarkeiten vorhanden.', [
      'POST /gratitude { text: "Wofuer dankbar?" }',
      'Chat: "/gratitude Heute dankbar fuer klaren Fokus"'
    ]]
  ];

  for (const [value, min, title, details, actions] of lowDataChecks) {
    if (typeof value === 'number' && value < min) {
      suggestions.push({ severity: 'info', title, details, actions });
    }
  }

  // Quests and collective arcs
  if (Array.isArray(dashboard?.quests) && dashboard.quests.length === 0) {
    suggestions.push({
      severity: 'info',
      title: 'Keine tagesaktuellen Quests',
      details: 'Neue Quests bringen XP & Testszenarien.',
      actions: ['POST /quests/refresh', 'Oder im Chat: "/status" um Snapshot zu sehen']
    });
  }

  if (Array.isArray(dashboard?.collective?.arcs) && dashboard.collective.arcs.length === 0) {
    suggestions.push({
      severity: 'info',
      title: 'Collective Arcs leer',
      details: 'Keine kollektiven Beitraege registriert.',
      actions: ['POST /collective/contribute { id: "dialog-100", amount: 1 }', 'Chat: "/gratitude ..." fuellt Arcs']
    });
  }

  // Profile momentum
  const profile = dashboard?.profile ?? metrics?.profile;
  if (profile && typeof profile.xp === 'number' && profile.xp < 10) {
    suggestions.push({
      severity: 'info',
      title: 'Profil hat wenig XP',
      details: 'Mehr Interaktionen schalten Achievements/Arcs frei.',
      actions: [
        'Starte eine kurze Dialogsession: POST /chat { message }',
        'Spiele eine Game-Challenge: POST /game/challenge mit result'
      ]
    });
  }

  // Service registry sanity
  if (snapshot.services.ok && Array.isArray(snapshot.services.data) && snapshot.services.data.length < 6) {
    suggestions.push({
      severity: 'warn',
      title: 'Wenige Services registriert',
      details: `Registry meldet nur ${snapshot.services.data.length} Eintraege.`,
      actions: ['Gateway neu starten oder start-all.ts mit --mode bridge/full nutzen']
    });
  }

  return suggestions.sort((a, b) => severityWeight(a.severity) - severityWeight(b.severity));
}

// -----------------------
// Rendering & Persistence
// -----------------------

function renderReport(snapshot: Snapshot, suggestions: Suggestion[]) {
  const header = `\n[Self-Improve] ${snapshot.timestamp} @ ${snapshot.baseUrl}`;
  console.log(header);
  console.log('Health   :', snapshot.health.ok ? 'ok' : `fail (${snapshot.health.error ?? snapshot.health.status})`);
  console.log('Metrics  :', snapshot.metrics.ok ? 'ok' : `fail (${snapshot.metrics.error ?? snapshot.metrics.status})`);
  console.log('Dashboard:', snapshot.dashboard.ok ? 'ok' : `fail (${snapshot.dashboard.error ?? snapshot.dashboard.status})`);
  console.log('Services :', snapshot.services.ok ? 'ok' : `fail (${snapshot.services.error ?? snapshot.services.status})`);

  if (suggestions.length === 0) {
    console.log('\nAlles sieht gut aus. Keine Massnahmen empfohlen.');
    return;
  }

  console.log('\nEmpfehlungen:');
  suggestions.forEach((s, idx) => {
    const prefix = `${idx + 1}. [${s.severity.toUpperCase()}] ${s.title}`;
    console.log(prefix);
    if (s.details) console.log(`   - ${s.details}`);
    if (s.actions && s.actions.length) {
      s.actions.forEach((a) => console.log(`   - ${a}`));
    }
  });
}

async function persistReport(snapshot: Snapshot, suggestions: Suggestion[]) {
  if (!logEnabled) return;
  const report = {
    timestamp: snapshot.timestamp,
    baseUrl: snapshot.baseUrl,
    health: snapshot.health,
    metrics: snapshot.metrics.ok ? snapshot.metrics.data : undefined,
    dashboardOk: snapshot.dashboard.ok,
    servicesOk: snapshot.services.ok,
    groqKeyPresent: snapshot.groqKeyPresent,
    suggestions
  };
  try {
    await Bun.write(REPORT_FILE, JSON.stringify(report, null, 2), { createPath: true });
    console.log(`\n[Self-Improve] Report gespeichert unter ${REPORT_FILE}`);
  } catch (error: any) {
    console.warn('[Self-Improve] Konnte Report nicht speichern:', error?.message ?? String(error));
  }
}

async function runAutoActions(snapshot: Snapshot): Promise<void> {
  if (!autoActionsEnabled) return;
  if (!snapshot.metrics.ok || !snapshot.metrics.data) {
    console.warn('[Self-Improve] Auto-Actions uebersprungen, Metrics nicht verfuegbar.');
    return;
  }

  const metrics = snapshot.metrics.data;
  const timestamp = new Date().toISOString();
  const tasks: Array<{ label: string; promise: () => Promise<FetchResult<any>> }> = [];

  const needsDream = typeof metrics.dreams === 'number' ? metrics.dreams < 3 : true;
  const needsEmotion = typeof metrics.emotions === 'number' ? metrics.emotions < 3 : true;
  const needsMemory = typeof metrics.memories === 'number' ? metrics.memories < 1 : true;
  const needsGratitude = typeof metrics.gratitudes === 'number' ? metrics.gratitudes < 1 : true;
  const needsChat = selfChatEnabled;

  if (needsDream && tasks.length < maxAutoActions) {
    tasks.push({
      label: 'seed.dream',
      promise: () =>
        postJson('/dreams', {
          type: 'creative',
          narrative: `Auto-dream baseline ${timestamp}`,
          symbols: ['self-improve', 'baseline'],
          emotions: ['calm'],
          insights: ['bootstrapping']
        })
    });
  }

  if (needsEmotion && tasks.length < maxAutoActions) {
    tasks.push({
      label: 'seed.emotion',
      promise: () =>
        postJson('/emotions', {
          primaryEmotion: 'curiosity',
          valence: 15,
          arousal: 20,
          intensity: 55,
          context: 'self-improve-auto',
          channel: 'auto'
        })
    });
  }

  if (needsMemory && tasks.length < maxAutoActions) {
    tasks.push({
      label: 'seed.memory',
      promise: () =>
        postJson('/memories', {
          title: `Auto memory ${timestamp}`,
          content: 'Self-improve agent baseline memory entry.',
          category: 'reflection',
          tags: ['self-improve', 'bootstrap']
        })
    });
  }

  if (needsGratitude && tasks.length < maxAutoActions) {
    tasks.push({
      label: 'seed.gratitude',
      promise: () =>
        postJson('/gratitude', {
          text: `Dankbarkeit fuer laufenden Self-Improve-Agent (${timestamp})`
        })
    });
  }

  if (needsChat && tasks.length < maxAutoActions) {
    tasks.push({
      label: 'self.chat',
      promise: () =>
        postJson('/chat', {
          message: 'Auto-check-in: self-improve loop says hello.',
          context: { source: 'self-improve-auto' }
        })
    });
  }

  if (!tasks.length) return;

  console.log(`[Self-Improve] Auto-Actions aktiv: ${tasks.length} Eintraege werden erzeugt...`);

  async function sendWithRetry<T>(fn: () => Promise<FetchResult<T>>, label: string) {
    const attempt = async () => {
      try {
        return await fn();
      } catch (error: any) {
        return { ok: false, durationMs: 0, error: error?.message ?? String(error) } as FetchResult<T>;
      }
    };
    const first = await attempt();
    if (first.ok) return first;
    console.warn(`[Self-Improve] Auto-Action ${label} failed: ${first.error ?? 'unknown'}, retrying...`);
    const second = await attempt();
    if (!second.ok) {
      console.warn(`[Self-Improve] Auto-Action ${label} failed again: ${second.error ?? 'unknown'}`);
    }
    return second;
  }

  const results = await Promise.allSettled(tasks.map((t) => sendWithRetry(t.promise, t.label)));
  const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));
  if (failures.length) {
    console.warn(`[Self-Improve] ${failures.length} Auto-Actions fehlgeschlagen.`);
    failures.forEach((f, idx) => {
      if (f.status === 'rejected') {
        console.warn(`  #${idx + 1}: ${f.reason}`);
      } else if (!f.value.ok) {
        console.warn(`  #${idx + 1}: ${f.value.error ?? 'unknown error'}`);
      }
    });
  }

  // Refresh metrics/dashboard after auto feed
  const [metricsRefreshed, dashboardRefreshed] = await Promise.all([fetchJson('/metrics'), fetchJson('/dashboard')]);
  snapshot.metrics = metricsRefreshed;
  snapshot.dashboard = dashboardRefreshed;
}

function runDevBacklogHeuristics(snapshot: Snapshot) {
  if (!devMode) return;
  const metrics = snapshot.metrics.data;
  if (!snapshot.metrics.ok || !metrics) return;

  const backlog = loadJsonFile<DevBacklogItem[]>(DEV_BACKLOG_FILE, []);
  const addIfMissing = (title: string, desc: string) => {
    const exists = backlog.some((b) => b.title.toLowerCase() === title.toLowerCase() && b.status === 'open');
    if (!exists) addBacklogItem(title, desc);
  };

  if (typeof metrics.dreams === 'number' && metrics.dreams < 3) {
    addIfMissing('Fuelle Dream Journal', 'Mindestens 3 kreative Traeume posten, um Muster zu erkennen.');
  }
  if (typeof metrics.emotions === 'number' && metrics.emotions < 3) {
    addIfMissing('Emotionen loggen', 'Mehrere Emotions-Checkins erfassen, um Insights zu aktivieren.');
  }
  if (typeof metrics.memories === 'number' && metrics.memories < 1) {
    addIfMissing('Memory Palace befuelle', 'Mindestens einen Memory-Eintrag fuer Reflexion speichern.');
  }
  if (typeof metrics.gratitudes === 'number' && metrics.gratitudes < 1) {
    addIfMissing('Gratitude erfassen', 'Dankbarkeits-Eintrag speichern, um Herz-Metrik zu aktivieren.');
  }
  saveJsonFile(DEV_BACKLOG_FILE, loadJsonFile(DEV_BACKLOG_FILE, backlog)); // ensure persisted
}

// -----------------------
// Main
// -----------------------

async function collectOnce(): Promise<void> {
  const groqKey = loadGroqKey();
  const [health, metrics, dashboard, services] = await Promise.all([
    fetchJson('/health'),
    fetchJson('/metrics'),
    fetchJson('/dashboard'),
    fetchJson('/services')
  ]);

  const snapshot: Snapshot = {
    timestamp: new Date().toISOString(),
    baseUrl,
    health,
    metrics,
    dashboard,
    services,
    groqKeyPresent: Boolean(groqKey)
  };

  if (groqKey && health.ok) {
    await ensureGroqKeyOnGateway(groqKey);
    snapshot.groqKeyPresent = true;
  }

  if (devMode) {
    runDevBacklogHeuristics(snapshot);
  }

  if (autoActionsEnabled) {
    await runAutoActions(snapshot);
  }

  const suggestions = evaluate(snapshot);
  renderReport(snapshot, suggestions);
  await persistReport(snapshot, suggestions);
}

async function main() {
  if (!daemonMode) {
    await collectOnce();
    return;
  }

  console.log(`[Self-Improve] Daemon-Modus aktiv (Intervall ${intervalMs}ms). Strg+C zum Stoppen.`);
  let running = true;
  const shutdown = () => {
    if (!running) return;
    running = false;
    console.log('\n[Self-Improve] Stoppsignal empfangen. Beende nach aktuellem Durchlauf.');
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  while (running) {
    await collectOnce();
    if (!running) break;
    await sleep(intervalMs);
  }
}

main().catch((error) => {
  console.error('[Self-Improve] Unerwarteter Fehler:', error?.message ?? String(error));
  process.exit(1);
});
