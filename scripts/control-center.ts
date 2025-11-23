#!/usr/bin/env bun
/**
 * TOOBIX CONTROL CENTER
 * Lightweight web UI to view system state, see improvement suggestions,
 * and apply safe auto-actions (seeds/backlog/quests) with optional backup.
 *
 * Start:
 *   bun run scripts/control-center.ts
 *   -> http://localhost:3010
 */

const PORT = 3010;

const html = /* html */ `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Toobix Control Center</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #111827;
      --card: #1f2937;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --accent: #38bdf8;
      --warn: #f59e0b;
      --error: #f97316;
      --success: #22c55e;
    }
    * { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  background: radial-gradient(circle at 20% 20%, #111827 0, #0b1222 40%, #0a0f1e 100%);
  color: var(--text);
  min-height: 100vh;
}
header {
  padding: 24px;
      border-bottom: 1px solid #1f2937;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }
    h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
    main { padding: 16px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .panel { background: var(--panel); border: 1px solid #1f2937; border-radius: 12px; padding: 14px; box-shadow: 0 10px 40px rgba(0,0,0,0.35); }
    .panel h2 { margin: 0 0 10px; font-size: 16px; color: var(--accent); letter-spacing: 0.2px; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    input, button {
      background: var(--card);
      border: 1px solid #1f2937;
      color: var(--text);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 14px;
    }
    input { flex: 1; min-width: 220px; }
    button { cursor: pointer; }
    button.primary { background: var(--accent); color: #0b1020; border: none; }
    button.warn { background: var(--warn); color: #0b1020; border: none; }
    button.outline { background: transparent; border: 1px solid #1f2937; }
    ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    li { background: var(--card); border: 1px solid #1f2937; border-radius: 10px; padding: 10px; }
    .muted { color: var(--muted); font-size: 13px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; letter-spacing: 0.5px; }
    .badge.warn { background: rgba(245, 158, 11, 0.15); color: var(--warn); }
    .badge.info { background: rgba(56, 189, 248, 0.15); color: var(--accent); }
    .badge.critical { background: rgba(249, 115, 22, 0.15); color: var(--error); }
    pre { background: #0b1020; color: var(--text); border-radius: 10px; padding: 10px; overflow: auto; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
    .status-card { background: var(--card); border: 1px solid #1f2937; border-radius: 8px; padding: 8px; }
    .stack { display: grid; gap: 6px; }
    .small { font-size: 12px; }
    .nav-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    .nav-tabs button { padding: 6px 10px; font-size: 12px; }
    .chat-log { background:#0b1020; border:1px solid #1f2937; border-radius:10px; padding:8px; max-height:240px; overflow:auto; }
    .chat-msg { border-left: 3px solid #1f2937; padding:6px 8px; margin-bottom:8px; border-radius:6px; background:#0f172a; }
    .chat-msg.ai { border-color: var(--accent); }
    .chat-msg.user { border-color: var(--warn); }
    .chat-msg.sys { border-color: var(--success); }
.chat-head { display:flex; align-items:center; gap:6px; color: var(--muted); font-size:12px; }
.chat-body { margin-top:4px; white-space: pre-wrap; line-height: 1.35; }
.hidden { display: none !important; }
.tab-active { background: var(--accent); color: #0b1020; border: none; }
body.compact .panel { padding: 8px; }
body.compact .status-card { padding: 6px; }
body.compact input, body.compact button { padding: 6px 8px; }
.card-compact { cursor: pointer; transition: border-color 0.2s; }
.card-compact:hover { border-color: var(--accent); }
.card-compact .extra { display: none; }
.card-compact.open .extra { display: block; margin-top: 6px; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>Toobix Schaltzentrale</h1>
      <div class="muted small">Verbinden · Prüfen · Verbessern · Sichern</div>
    </div>
    <div class="row" style="flex:1; justify-content:flex-end;">
      <input id="baseUrl" value="http://localhost:9000" />
      <button class="outline" id="btnConnect">Verbinden</button>
      <button class="primary" id="btnAnalyze">Aktualisieren</button>
      <button class="warn" id="btnApply">Ausgewählte anwenden</button>
    </div>
    <div class="nav-tabs">
      <button class="outline tab-btn tab-active" data-tab-target="overview">🏠 Übersicht</button>
      <button class="outline tab-btn" data-tab-target="work">🧭 Arbeit</button>
      <button class="outline tab-btn" data-tab-target="learn">📚 Lernen</button>
      <button class="outline tab-btn" data-tab-target="systems">🧩 Systeme</button>
      <button class="outline tab-btn" data-tab-target="chat">💬 Chat</button>
      <button class="outline" id="btnCompactToggle">Kompakt/Detail</button>
    </div>
  </header>

  <main>
    <section class="panel" id="panel-quick" data-tab="overview">
      <h2>Schnell-Aktionen</h2>
      <div class="actions" id="quickActions"></div>
      <div class="muted small" id="quickResult"></div>
    </section>

    <section class="panel" id="panel-status" data-tab="overview">
      <h2>Status & Gesundheit</h2>
      <div id="status"></div>
    </section>

    <section class="panel" id="panel-services" data-tab="overview">
      <h2>Dienste</h2>
      <div id="services"></div>
    </section>

    <section class="panel" data-tab="overview">
      <h2>Kontext</h2>
      <div id="contextPanel"></div>
    </section>

    <section class="panel" data-tab="overview">
      <h2>Gamification</h2>
      <div id="gamification"></div>
    </section>

    <section class="panel" data-tab="overview">
      <h2>Quests (Heute)</h2>
      <div class="muted small">Kontextuelle Aufgaben, abgeleitet aus aktuellen Metriken.</div>
      <ul id="quests"></ul>
    </section>

    <section class="panel" data-tab="work">
      <h2>Feedback</h2>
      <div class="stack">
        <textarea id="feedbackText" style="width:100%;min-height:80px;background:#0b1020;color:#e5e7eb;border:1px solid #1f2937;border-radius:8px;padding:8px;"></textarea>
        <button class="primary" id="btnFeedback">Senden</button>
        <div class="muted small">Letzte Feedbacks:</div>
        <ul id="feedbackList"></ul>
      </div>
    </section>

    <section class="panel" data-tab="learn">
      <h2>Insights</h2>
      <div id="insights"></div>
    </section>

    <section class="panel" data-tab="systems">
      <h2>Plugins</h2>
      <div class="actions" id="pluginsActions"></div>
      <div id="pluginsList"></div>
    </section>

    <section class="panel" data-tab="learn">
      <h2>Code-Hilfen & Suche</h2>
      <div class="row" style="margin-bottom:8px;">
        <input id="searchInput" placeholder="Websuche Query..." />
        <button class="outline" id="btnSearch">Suche</button>
      </div>
      <div class="actions" id="codeActions"></div>
      <div class="muted small">Ergebnisse:</div>
      <ul id="searchResults"></ul>
    </section>

    <section class="panel" data-tab="learn">
      <h2>Willkommen & Kurz-Guide</h2>
      <div id="onboarding"></div>
    </section>

    <section class="panel" data-tab="learn">
      <h2>Version & Roadmap</h2>
      <div id="versionInfo"></div>
    </section>

    <section class="panel" data-tab="learn">
      <h2>Dienste (Kurzbeschreibung)</h2>
      <div id="serviceCatalog"></div>
    </section>

    <section class="panel" data-tab="learn">
      <h2>Dokumente & Alignment</h2>
      <div class="muted small">Abgleich wichtiger Dokus vs. Umsetzung.</div>
      <div id="docsList"></div>
    </section>

    <section class="panel" data-tab="systems">
      <h2>Cross-Service Status</h2>
      <div class="muted small">Interaktion der Dienste</div>
      <div id="crossLinks"></div>
      <div class="actions" style="margin-top:6px;">
        <button class="primary" id="btnSyncContext">Sync Context</button>
        <button class="outline" id="btnBroadcastEvent">Broadcast (Ping)</button>
      </div>
      <div class="muted small" style="margin-top:6px;">Events:</div>
      <div id="crossEvents"></div>
    </section>

    <section class="panel" data-tab="work">
      <h2>Projekte</h2>
      <div class="row" style="margin-bottom:8px;">
        <input id="projTitle" placeholder="Titel..." />
        <input id="projOwner" placeholder="Owner..." />
        <button class="primary" id="btnAddProject">Projekt anlegen</button>
      </div>
      <div class="muted small">Liste:</div>
      <ul id="projectsList"></ul>
    </section>

    <section class="panel" data-tab="work">
      <h2>Vorschläge</h2>
      <ul id="suggestions"></ul>
    </section>

    <section class="panel" data-tab="work">
      <h2>Empfohlene Aktionen</h2>
      <div class="muted small">Häkchen setzen und „Ausgewählte anwenden“ klicken.</div>
      <ul id="actions"></ul>
    </section>

    <section class="panel" id="panel-backlog" data-tab="work">
      <h2>Backlog & Entscheidungen</h2>
      <div id="backlog"></div>
    </section>

    <section class="panel" style="grid-column: 1 / -1;" id="panel-chat" data-tab="chat">
      <h2>Chat</h2>
      <div class="muted small">Schnellstart: Status prüfen, Dienste anzeigen, Mesh-Scan oder Backlog ergänzen.</div>
      <div class="muted small" id="chatHelp"></div>
      <div class="muted small" style="margin:6px 0 4px;">Kontext-Vorschläge</div>
      <div class="actions" id="contextPrompts"></div>
      <div class="row" style="margin-bottom:8px;">
        <input id="chatInput" placeholder="Nachricht an Toobix..." />
        <button class="primary" id="btnChat">Senden</button>
        <button class="outline" id="btnChatClear">Verlauf loeschen</button>
      </div>
      <div class="muted small">Verlauf (letzte 20 Nachrichten):</div>
      <div id="chatLog" class="chat-log"></div>
    </section>
  </main>

  <script>
    const baseInput = document.getElementById('baseUrl');
    const statusEl = document.getElementById('status');
    const suggestionsEl = document.getElementById('suggestions');
    const actionsEl = document.getElementById('actions');
    const backlogEl = document.getElementById('backlog');
    const servicesEl = document.getElementById('services');
    const onboardingEl = document.getElementById('onboarding');
    const versionInfoEl = document.getElementById('versionInfo');
    const serviceCatalogEl = document.getElementById('serviceCatalog');
    const docsListEl = document.getElementById('docsList');
    const crossLinksEl = document.getElementById('crossLinks');
    const crossEventsEl = document.getElementById('crossEvents');
    const gamificationEl = document.getElementById('gamification');
    const questsEl = document.getElementById('quests');
    const contextPanelEl = document.getElementById('contextPanel');
    const feedbackText = document.getElementById('feedbackText');
    const feedbackListEl = document.getElementById('feedbackList');
    const insightsEl = document.getElementById('insights');
    const pluginsListEl = document.getElementById('pluginsList');
    const pluginsActionsEl = document.getElementById('pluginsActions');
    const searchInput = document.getElementById('searchInput');
    const searchResultsEl = document.getElementById('searchResults');
    const codeActionsEl = document.getElementById('codeActions');
    const projectsListEl = document.getElementById('projectsList');
    const projTitleEl = document.getElementById('projTitle');
    const projOwnerEl = document.getElementById('projOwner');
    const chatLogEl = document.getElementById('chatLog');
    const chatInput = document.getElementById('chatInput');
    const quickEl = document.getElementById('quickActions');
    const quickResultEl = document.getElementById('quickResult');
    const chatHelpEl = document.getElementById('chatHelp');
    const contextEl = document.getElementById('contextPrompts');
    const compactBtn = document.getElementById('btnCompactToggle');
    const storageKey = 'toobix-base-url';
    let backlogFilter = 'all';
    const saved = localStorage.getItem(storageKey);
    if (saved) baseInput.value = saved;

    const panels = Array.from(document.querySelectorAll('[data-tab]'));
    const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    compactBtn?.addEventListener('click', () => {
      document.body.classList.toggle('compact');
      compactBtn.classList.toggle('tab-active');
    });
    function activateTab(tab) {
      tabButtons.forEach(btn => {
        const tgt = btn.getAttribute('data-tab-target');
        btn.classList.toggle('tab-active', tgt === tab);
      });
      panels.forEach(p => p.classList.toggle('hidden', p.getAttribute('data-tab') !== tab));
    }
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tgt = btn.getAttribute('data-tab-target');
        if (tgt) activateTab(tgt);
      });
    });
    activateTab('overview');

    function getBase() {
      let b = baseInput.value.trim();
      while (b.endsWith('/')) b = b.slice(0, -1);
      return b;
    }

    const onboardingSteps = [
      { title: 'Verbinden', text: 'Base URL auf http://localhost:9000 setzen und “Refresh” klicken.' },
      { title: 'Status pruefen', text: 'Unter “Status” auf OK achten. Falls Fehler: Gateway neu starten.' },
      { title: 'Chat oeffnen', text: 'Im Chat “hi” schreiben oder einen Kontext-Prompt anklicken.' },
      { title: 'Auto-Aktionen', text: 'Bei “Empfohlene Aktionen” Haken setzen und “Ausgewaehlte anwenden”.' },
      { title: 'Code-Hilfen', text: 'Buttons in “Code Helpers” testen: Beispiele, Fehler, Translate, Review, Debug.' },
      { title: 'Projekte/Backlog', text: 'Projekt anlegen, Backlog/Decisions checken, Quests ansehen.' }
    ];

    const knownLimits = [
      'OpenAI/Claude Keys fehlen (nur Groq Llama3 aktiv).',
      'Plugins laufen im Sandbox-VM ohne Netzwerk/require; komplexe Plugins brauchen manuellen Merge.',
      'UI ist lokal, kein Login/SSO; Daten liegen in SQLite unter data/.',
      'Code-Analyse ist heuristisch (kein echter Linter/Tests).'
    ];

    const versionInfo = {
      current: 'v0.9.0 – Self-evolving Console + Control Center',
      recent: [
        'Plugin-Sandbox & Manifest-Registry',
        'Code-Helper Endpoints (examples/errors/translate/review/debug/learn)',
        'Kontext-, Feedback-, Gamification-Panels im Control Center'
      ],
      roadmap: {
        short: [
          'Stabiler Chat-Flow mit Vorschlag-Buttons',
          'Backlog/Projekt-Filter (open/in-progress/done)',
          'Mehr Auto-Actions mit Safeguards'
        ],
        mid: [
          'Plugin-Lifecycle: Install/Enable/Disable/Promote',
          'Optionale Online-Suche mit Key-Opt-In',
          'Bessere Tests/Lints je Service'
        ],
        long: [
          'Selbst-Deploy in Sandbox/Cloud',
          'Visueller Builder fuer neue Services/Flows',
          'KI-gestuetzte Roadmap-Priorisierung'
        ]
      }
    };

    const serviceCatalog = [
      { name: 'Unified Gateway', desc: 'Zentrale API, SQLite-Persistenz, orchestriert alles.' },
      { name: 'Service Mesh', desc: 'Registry auf 8910 fuer 12 Services + Events.' },
      { name: 'AI Gateway (Groq)', desc: 'Llama3 via Groq; keine OpenAI/Claude Keys gesetzt.' },
      { name: 'Dream Journal', desc: 'Traeume/Symbole, 5-Level-Interpretation.' },
      { name: 'Emotional Resonance', desc: 'Emotionen tracken, Healing/Archaeology/Regulation.' },
      { name: 'Multi-Perspective', desc: '6 Personas, Dialoge, Debates, Fusion.' },
      { name: 'Memory Palace', desc: '8 Raeume + Narrative Reflections.' },
      { name: 'Game Engine', desc: 'Mini-Games, Evolutionszyklen ~30s.' },
      { name: 'Decision Framework', desc: 'Evaluate/Quick-Eval/Compare + History.' },
      { name: 'Creator-AI Collaboration', desc: 'Projektvorschlaege, Co-Creation Modes.' },
      { name: 'Adaptive Meta-UI', desc: 'Self-Modifying UI, WS auf 8912.' },
      { name: 'Hybrid AI Core', desc: 'NN + Evolution + Meta-Learning (lokal).' },
      { name: 'Life-Domain Chat', desc: 'Domains Career/Health/Finance/etc.; nutzt AI Gateway.' },
      { name: 'Meta-Knowledge', desc: 'Cross-Domain Synthesis + Knowledge Graph.' },
      { name: 'Universal Integration Adapter', desc: 'FS/Clipboard Watcher, API Connectors.' },
      { name: 'Wellness & Safety', desc: 'Content-Analyse, Boundaries, Health.' }
    ];

    function renderOnboarding() {
      const list = onboardingSteps
        .map((s, i) => '<li><strong>Schritt ' + (i + 1) + ':</strong> ' + s.title + ' - ' + s.text + '</li>')
        .join('');
      const limits = knownLimits.map(l => '<li>' + l + '</li>').join('');
      onboardingEl.innerHTML =
        '<div class="muted small">Schnellstart:</div>' +
        '<ol>' + list + '</ol>' +
        '<div class="muted small" style="margin-top:6px;">Aktuelle Grenzen:</div>' +
        '<ul>' + limits + '</ul>';
    }

    function renderVersion() {
      const recent = versionInfo.recent.map(r => '<li>' + r + '</li>').join('');
      const short = versionInfo.roadmap.short.map(r => '<li>' + r + '</li>').join('');
      const mid = versionInfo.roadmap.mid.map(r => '<li>' + r + '</li>').join('');
      const long = versionInfo.roadmap.long.map(r => '<li>' + r + '</li>').join('');
      versionInfoEl.innerHTML =
        '<div><strong>Aktuell:</strong> ' + versionInfo.current + '</div>' +
        '<div class="muted small" style="margin-top:4px;">Zuletzt:</div>' +
        '<ul>' + recent + '</ul>' +
        '<div class="muted small" style="margin-top:4px;">Roadmap kurz:</div>' +
        '<ul>' + short + '</ul>' +
        '<div class="muted small" style="margin-top:4px;">Roadmap mittel:</div>' +
        '<ul>' + mid + '</ul>' +
        '<div class="muted small" style="margin-top:4px;">Roadmap lang:</div>' +
        '<ul>' + long + '</ul>';
    }

    function renderServiceCatalog() {
      serviceCatalogEl.innerHTML = serviceCatalog
        .map(s => '<div style="margin-bottom:6px;"><strong>' + s.name + ':</strong> ' + s.desc + '</div>')
        .join('');
    }

    renderOnboarding();
    renderVersion();
    renderServiceCatalog();

    function setDocs(docs) {
      if (!docs || !docs.length) {
        docsListEl.innerHTML = '<div class="muted small">Keine Daten.</div>';
        return;
      }
      const rows = docs.map(d => {
        const badgeCls = d.status === 'on-track' ? 'info' : d.status === 'paused' ? 'warn' : 'critical';
        return '<div class="status-card small"><span class="badge ' + badgeCls + '">' + d.status + '</span> ' +
          d.title + '<div class="muted small">' + (d.notes || '') + '</div><div class="muted small">Next: ' + (d.action || '') + '</div></div>';
      });
      docsListEl.innerHTML = rows.join('');
    }

    function setCross(data) {
      const links = data?.links || [];
      const events = data?.events || [];
      if (!links.length) {
        crossLinksEl.innerHTML = '<div class="muted small">Keine Daten.</div>';
      } else {
        crossLinksEl.innerHTML = links
          .map(l => '<div class="status-card small"><span class="badge ' + (l.status === 'ok' ? 'info' : l.status === 'missing' ? 'critical' : 'warn') + '">' + l.status + '</span> ' + l.link + '<div class="muted small">' + (l.note || '') + '</div></div>')
          .join('');
      }
      if (!events.length) {
        crossEventsEl.innerHTML = '<div class="muted small">Keine Events.</div>';
      } else {
        crossEventsEl.innerHTML = events
          .map(e => '<div class="muted small">[' + e.at + '] ' + e.type + ': ' + (e.message || '') + '</div>')
          .join('');
      }
    }

    function setStatus(html) { statusEl.innerHTML = html; }
    function setProviders(providers) {
      if (!providers || !providers.length) return;
      const badges = providers.map(p => {
        const cls = p.available ? 'info' : 'critical';
        return '<span class="badge ' + cls + '">' + p.name + '</span>';
      }).join(' ');
      const notes = providers.filter(p => p.note).map(p => p.note).join(' | ');
      statusEl.innerHTML += '<div class="muted small" style="margin-top:4px;">AI Provider: ' + badges + (notes ? ' - ' + notes : '') + '</div>';
    }
    function setSuggestions(items) {
      suggestionsEl.innerHTML = '';
      if (!items || !items.length) {
        suggestionsEl.innerHTML = '<li class="muted">Keine offenen Vorschlaege.</li>';
        return;
      }
      items.forEach(item => {
        const li = document.createElement('li');
        const badge = document.createElement('span');
        badge.className = 'badge ' + item.severity;
        badge.textContent = item.severity.toUpperCase();
        li.appendChild(badge);
        const title = document.createElement('div');
        title.textContent = item.title;
        li.appendChild(title);
        if (item.details) {
          const d = document.createElement('div');
          d.className = 'muted small';
          d.textContent = item.details;
          li.appendChild(d);
        }
        if (item.actions && item.actions.length) {
          const pre = document.createElement('pre');
          pre.textContent = item.actions.join('\\n');
          li.appendChild(pre);
        }
        suggestionsEl.appendChild(li);
      });
    }

    function setActions(recommended) {
      actionsEl.innerHTML = '';
      if (!recommended || !recommended.length) {
        actionsEl.innerHTML = '<li class="muted">Keine empfohlenen Aktionen.</li>';
        return;
      }
      recommended.forEach((act, idx) => {
        const li = document.createElement('li');
        const id = 'act-' + idx;
        const safe = JSON.stringify(act).replace(/"/g, '&quot;');
        li.innerHTML =
          '<label class="row">' +
          '<input type="checkbox" id="' + id + '" data-action="' + safe + '" checked />' +
          '<div><div>' + act.type + '</div>' +
          '<div class="muted small">' + (act.payload ? JSON.stringify(act.payload) : '') + '</div>' +
          '</div></label>';
        actionsEl.appendChild(li);
      });
    }

    function setBacklog(backlogData, decisions) {
      const backlog = backlogData?.backlog || [];
      decisions = decisions || [];
      const html = [];
      html.push('<div class="muted small">Backlog (' + backlog.length + '):</div>');
      html.push('<div class="actions" style="margin-bottom:6px;">');
      ['all','open','in-progress','done'].forEach(f => {
        const cls = backlogFilter === f ? 'primary small' : 'outline small';
        html.push('<button class="' + cls + '" data-bfilter="' + f + '">' + f + '</button>');
      });
      html.push('<select id="backlogTagFilter" class="outline small"><option value="all">Tag: alle</option></select>');
      html.push('<select id="backlogPrioFilter" class="outline small"><option value="all">Prio: alle</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>');
      html.push('</div>');
      html.push('<div class="stack">');
      const tagSel = document.getElementById('backlogTagFilter');
      const prioSel = document.getElementById('backlogPrioFilter');
      const tagVal = tagSel?.value || 'all';
      const prioVal = prioSel?.value || 'all';
      const filtered = backlog.filter(b => {
        const statusOk = backlogFilter === 'all' ? true : (b.status || '').toLowerCase() === backlogFilter;
        const tagOk = tagVal === 'all' ? true : (b.tag || 'general') === tagVal;
        const prioOk = prioVal === 'all' ? true : (b.priority || 'medium') === prioVal;
        return statusOk && tagOk && prioOk;
      });
      filtered.forEach(b => {
        const prio = b.priority || 'medium';
        const owner = b.owner || 'n/a';
        const tag = b.tag || 'general';
        const activity = (b.activity || []).slice(-3).map(a => '<div class="muted small">• ' + a.message + ' @ ' + a.at + '</div>').join('');
        const activityBlock = activity ? '<details class="muted small" style="margin-top:4px;"><summary>Aktivität (letzte)</summary>' + activity + '</details>' : '';
        const actionBtns =
          '<div class="actions" style="margin-top:4px;">' +
          '<button class="outline small" data-backlog="' + b.id + '" data-status="in-progress">In Progress</button>' +
          '<button class="primary small" data-backlog="' + b.id + '" data-status="done">Done</button>' +
          '</div>';
        html.push('<div class="status-card small">[' + b.status + '] ' + b.title +
          '<div class="muted small">Tag: ' + tag + ' | Prio: ' + prio + ' | Owner: ' + owner + '</div>' +
          activityBlock +
          actionBtns + '</div>');
      });
      if (!filtered.length) html.push('<div class="muted small">leer</div>');
      html.push('</div>');
      html.push('<div class="muted small" style="margin-top:8px;">Decisions (' + decisions.length + '):</div>');
      html.push('<div class="stack">');
      decisions.slice(0,3).forEach(d => {
        html.push('<div class="status-card small">' + d.title + ' -> ' + d.decision + '</div>');
      });
      if (!decisions.length) html.push('<div class="muted small">leer</div>');
      html.push('</div>');
      backlogEl.innerHTML = html.join('');
      const tagSelect = document.getElementById('backlogTagFilter');
      const prioSelect = document.getElementById('backlogPrioFilter');
      if (tagSelect && tagSelect.options.length <= 1) {
        const tags = Array.from(new Set(backlog.map(b => b.tag || 'general')));
        tags.forEach(t => tagSelect.appendChild(new Option(t, t)));
      }
      backlogEl.querySelectorAll('button[data-bfilter]').forEach(btn => {
        btn.addEventListener('click', () => {
          backlogFilter = btn.getAttribute('data-bfilter');
          setBacklog(data);
        });
      });
      if (tagSelect) {
        tagSelect.addEventListener('change', () => setBacklog(backlogData, decisions));
      }
      if (prioSelect) {
        prioSelect.addEventListener('change', () => setBacklog(backlogData, decisions));
      }
      backlogEl.querySelectorAll('button[data-backlog]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-backlog');
          const status = btn.getAttribute('data-status');
          const base = getBase();
          if (!base || !id || !status) return;
          try {
            await fetch(base + '/backlog/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, status })
            });
            await analyze();
          } catch (err) {
            console.warn('Backlog update failed', err);
          }
        });
      });
    }

    function setServices(data) {
      servicesEl.innerHTML = '';
      const services = data?.services || [];
      if (!services.length) {
        servicesEl.innerHTML = '<div class="muted small">Keine Services gefunden.</div>';
        return;
      }
      const icons = {
        'Unified Service Gateway': '🛰️',
        'Dream Journal': '🌙',
        'Emotional Resonance': '💓',
        'Multi-Perspective Consciousness': '🧠',
        'Gratitude & Mortality': '🕯️',
        'Conscious Decision Framework': '🎯',
        'Creator-AI Collaboration': '🎨',
        'Memory Palace': '🏛️',
        'Conscious Game Engine': '🎮',
        'AI Gateway': '🤖',
        'Service Mesh': '🌐',
        'Adaptive Meta-UI': '🖥️',
        'Hybrid AI Core': '🧬',
        'Life-Domain Chat': '📚',
        'Meta-Knowledge Orchestrator': '🕸️',
        'Universal Integration Adapter': '🔌',
        'Wellness & Safety Guardian': '🛡️',
        'Voice Interface': '🎤',
        'Life Simulation Engine': '🌍',
        'Minecraft Bot': '⛏️'
      };
      const cards = services.map(s => {
        const badge = s.status === 'online' ? '<span class="badge info">online</span>' : '<span class="badge critical">offline</span>';
        const icon = icons[s.name] || '🛰️';
        return '<div class="status-card small service-card card-compact" data-port="' + s.port + '"><div class="row" style="justify-content:space-between;"><div>' + icon + ' ' + s.name + '</div><div>' + badge + '</div></div><div class="muted small">Port ' + s.port + '</div><div class="extra muted small">Beschreibung: ' + (s.description || '') + '</div></div>';
      }).join('');
      servicesEl.innerHTML = '<div class="status-grid">' + cards + '</div>';
      servicesEl.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
          card.classList.toggle('open');
        });
        card.addEventListener('click', () => {
          const port = card.getAttribute('data-port');
          if (!port) return;
          window.open('http://localhost:' + port + '/health', '_blank');
        });
      });
    }

    function setProjects(items) {
      projectsListEl.innerHTML = '';
      if (!items || !items.length) {
        projectsListEl.innerHTML = '<li class="muted small">Keine Projekte.</li>';
        return;
      }
      projectsListEl.innerHTML = items
        .map(p => '<li class="status-card small">[' + (p.status || 'open') + '] ' + p.title + '<div class="muted small">Owner: ' + (p.owner || 'n/a') + '</div><div class="muted small">' + (p.notes || '') + '</div></li>')
        .join('');
    }

    function setGamification(metrics) {
      if (!metrics) {
        gamificationEl.innerHTML = '<div class="muted small">Keine Daten.</div>';
        return;
      }
      const level = metrics.profile?.level ?? 1;
      const xp = metrics.profile?.xp ?? 0;
      const achievements = metrics.achievements ?? 0;
      const arcs = metrics.collectiveArcs ?? 0;
      const quests = metrics.quests ?? 0;
      gamificationEl.innerHTML =
        '<div class="status-grid">' +
        '<div class="status-card small">Level: ' + level + '</div>' +
        '<div class="status-card small">XP: ' + xp + '</div>' +
        '<div class="status-card small">Achievements: ' + achievements + '</div>' +
        '<div class="status-card small">Collective Arcs: ' + arcs + '</div>' +
        '<div class="status-card small">Quests (heute): ' + quests + '</div>' +
        '</div>';
    }

    function setQuests(metrics) {
      questsEl.innerHTML = '';
      if (!metrics) {
        questsEl.innerHTML = '<li class="muted small">Keine Daten.</li>';
        return;
      }
      const quests = [];
      if ((metrics.dreams ?? 0) < 3) quests.push({ title: 'Logge 3 Traeume', action: 'seed.dream' });
      if ((metrics.emotions ?? 0) < 3) quests.push({ title: 'Logge 3 Emotionen', action: 'seed.emotion' });
      if ((metrics.memories ?? 0) < 3) quests.push({ title: 'Lege Erinnerungen an', action: 'seed.memory' });
      if ((metrics.gratitudes ?? 0) < 3) quests.push({ title: 'Schreibe Dankbarkeit', action: 'seed.gratitude' });
      if ((metrics.devBacklog ?? 0) > 0) quests.push({ title: 'Schliesse Backlog-Item ab', action: 'open.backlog' });
      if ((metrics.achievements ?? 0) < 1) quests.push({ title: 'Hol dir dein erstes Achievement', action: 'run.selfimprove' });
      if (!quests.length) {
        questsEl.innerHTML = '<li class="muted small">Alle Kernquests erledigt.</li>';
        return;
      }
      questsEl.innerHTML = quests
        .map((q, idx) => {
          const btn = q.action
            ? '<button class="primary small" data-quest="' + q.action + '">Los</button>'
            : '';
          return '<li class="row" style="justify-content:space-between;"><div>' + q.title + '</div>' + btn + '</li>';
        })
        .join('');
      questsEl.querySelectorAll('button[data-quest]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const act = btn.getAttribute('data-quest');
          const base = getBase();
          if (!base || !act) return;
          if (act.startsWith('seed.')) {
            const kind = act.split('.')[1];
            await quickSeed(base, kind);
            await analyze();
          } else if (act === 'open.backlog') {
            window.scrollTo({ top: backlogEl.offsetTop, behavior: 'smooth' });
          } else if (act === 'run.selfimprove') {
            await quickFetch(base + '/self/improve');
          }
        });
      });
    }

    function setPlugins(plugins) {
      pluginsListEl.innerHTML = '';
      if (!plugins || !plugins.length) {
        pluginsListEl.innerHTML = '<div class="muted small">Keine Plugins gefunden.</div>';
        return;
      }
      pluginsListEl.innerHTML = plugins
        .map(p => '<div class="status-card small"><div class="row" style="justify-content:space-between;"><div>' + p.name + ' v' + p.version + '</div><div class="actions"><button class="primary small" data-plugin="' + p.name + '">Run</button><button class="outline small" data-plugin-apply="' + p.name + '">Run+Apply</button></div></div><div class="muted small">' + (p.description || '') + '</div></div>')
        .join('');
      pluginsListEl.querySelectorAll('button[data-plugin]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const base = getBase();
          const name = btn.getAttribute('data-plugin');
          if (!base || !name) return;
          try {
            const res = await fetch(base + '/plugins/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            });
            const data = await res.json();
            alert('Plugin ' + name + ' Ergebnis:\\n' + JSON.stringify(data.result || data, null, 2));
          } catch (err) {
            console.warn('Plugin run failed', err);
          }
        });
      });
      pluginsListEl.querySelectorAll('button[data-plugin-apply]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const base = getBase();
          const name = btn.getAttribute('data-plugin-apply');
          if (!base || !name) return;
          try {
            const res = await fetch(base + '/plugins/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            });
            const data = await res.json();
            const actions = data?.result?.actions || data?.manifest?.actions || [];
            if (!actions.length) {
              alert('Plugin ' + name + ' liefert keine Aktionen.');
              return;
            }
            if (!confirm('Plugin-Aktionen anwenden? (' + actions.length + ' Aktionen)')) return;
            // Optional: Trigger Backup
            const applyRes = await fetch(base + '/self/apply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ actions, backup: true })
            });
            const applyData = await applyRes.json();
            alert('Angewendet. Backup: ' + applyData.backup);
            await analyze();
          } catch (err) {
            console.warn('Plugin apply failed', err);
          }
        });
      });
    }

    function setContextPanel(ctx) {
      if (!ctx || !ctx.profile) {
        contextPanelEl.innerHTML = '<div class="muted small">Keine Kontextdaten.</div>';
        return;
      }
      const p = ctx.profile;
      const topics = (p.lastTopics && p.lastTopics.length) ? p.lastTopics.join(', ') : 'Keine Topics';
      contextPanelEl.innerHTML =
        '<div class="stack">' +
        '<div class="status-card small">Creator: ' + (p.creatorName || 'Creator') + '</div>' +
        '<div class="status-card small">Letzte Message: ' + (p.lastMessage || '-') + '</div>' +
        '<div class="status-card small">Letzte Topics: ' + topics + '</div>' +
        '<div class="status-card small">Letzter Chat: ' + (p.lastChatAt || '-') + '</div>' +
        '</div>';
    }

    function setFeedbackList(list) {
      feedbackListEl.innerHTML = '';
      if (!list || !list.length) {
        feedbackListEl.innerHTML = '<li class="muted small">Keine Feedbacks.</li>';
        return;
      }
      feedbackListEl.innerHTML = list
        .slice(0, 5)
        .map(f => '<li class="small"><div>' + f.message + '</div><div class="muted">' + f.timestamp + '</div></li>')
        .join('');
    }

    async function sendFeedback() {
      const base = getBase();
      const msg = feedbackText.value.trim();
      if (!base || !msg) return;
      try {
        await fetch(base + '/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, channel: 'control-center' })
        });
        feedbackText.value = '';
        const res = await fetch(base + '/feedback');
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(data.feedback || []);
        }
      } catch (err) {
        console.warn('Feedback send failed', err);
      }
    }

    function setInsights(personality, emotions) {
      const emoText = emotions && emotions.emotions
        ? emotions.emotions.slice(0, 5).map(e => e.emotion + ': ' + e.count).join(', ')
        : 'Keine Emotionsdaten';
      const p = personality && personality.personality ? personality.personality : null;
      const pText = p
        ? 'Creator: ' + (p.creator || 'Creator') + ', Interaktionen: ' + (p.interactions || 0) +
          ', Topics: ' + ((p.lastTopics && p.lastTopics.join(', ')) || 'keine')
        : 'Keine Personaldaten';
      insightsEl.innerHTML =
        '<div class="stack">' +
        '<div class="status-card small">Emotions: ' + emoText + '</div>' +
        '<div class="status-card small">Personality: ' + pText + '</div>' +
        '</div>';
    }

    function setCodeActions() {
      codeActionsEl.innerHTML = '';
      const base = getBase();
      const buttons = [
        { label: 'TS Beispiele', fn: () => quickFetch(base + '/code/examples?lang=typescript') },
        { label: 'PY Fehler', fn: () => quickFetch(base + '/code/errors?lang=python') },
        { label: 'Translate (Stub)', fn: () => quickPost(base + '/code/translate', { source: 'ts', target: 'py', snippet: 'function x(){ return 1; }' }) },
        { label: 'Review (Stub)', fn: () => quickPost(base + '/code/review', { snippet: 'function x(){ return 1; }', language: 'ts' }) },
        { label: 'Learn (all)', fn: () => quickFetch(base + '/code/learn') },
        { label: 'Debug (Snippet)', fn: () => quickPost(base + '/code/debug', { snippet: 'function x(){ console.log(\"debug\"); /* TODO */ }', language: 'ts' }) }
      ];
      buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'outline';
        btn.textContent = b.label;
        btn.addEventListener('click', b.fn);
        codeActionsEl.appendChild(btn);
      });
    }

    async function quickPost(url, payload) {
      quickResultEl.textContent = '...';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        quickResultEl.textContent = JSON.stringify(data).slice(0, 500);
      } catch (err) {
        quickResultEl.textContent = 'Fehler: ' + err.message;
      }
    }

    async function doSearch() {
      const base = getBase();
      const q = searchInput.value.trim();
      if (!base || !q) return;
      try {
        const res = await fetch(base + '/search/web?q=' + encodeURIComponent(q) + '&limit=5');
        const data = await res.json();
        const results = data.results || [];
        searchResultsEl.innerHTML = results.length
          ? results.map(r => '<li class="small">' + (r.title || JSON.stringify(r)) + '</li>').join('')
          : '<li class="muted small">Keine Treffer oder Parser leer.</li>';
      } catch (err) {
        searchResultsEl.innerHTML = '<li class="muted small">Fehler: ' + err.message + '</li>';
      }
    }

    async function addProject() {
      const base = getBase();
      const title = projTitleEl.value.trim();
      const owner = projOwnerEl.value.trim();
      if (!base || !title) return;
      try {
        const res = await fetch(base + '/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, owner })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        projTitleEl.value = '';
        projOwnerEl.value = '';
        await analyze();
      } catch (err) {
        alert('Projekt anlegen fehlgeschlagen: ' + err.message);
      }
    }

    function setQuickLinks(base) {
      const actions = [
        { label: 'Health', fn: () => quickFetch(base + '/health') },
        { label: 'Dashboard', fn: () => quickFetch(base + '/dashboard') },
        { label: 'Self-Improve', fn: () => quickFetch(base + '/self/improve') },
        { label: 'Self-Plan', fn: () => quickFetch(base + '/self/plan') },
        { label: 'Self-Run (light)', fn: () => quickFetch(base + '/self/run', 'POST') },
        { label: 'Mesh Scan', fn: () => quickFetch(base + '/mesh/scan') },
        { label: 'Code Scan', fn: () => quickFetch(base + '/code/scan') },
        { label: 'AI Provider Status', fn: () => quickFetch(base + '/ai/providers') },
        { label: 'Chat History', fn: () => loadChatHistory(base) },
        { label: 'Service Mesh', href: 'http://localhost:8910/services' },
        { label: 'Adaptive UI', href: 'http://localhost:8912' },
        { label: 'Seed: Dream', fn: () => quickSeed(base, 'dream') },
        { label: 'Seed: Emotion', fn: () => quickSeed(base, 'emotion') },
        { label: 'Seed: Memory', fn: () => quickSeed(base, 'memory') },
        { label: 'Seed: Gratitude', fn: () => quickSeed(base, 'gratitude') },
        { label: 'Backlog', fn: () => quickFetch(base + '/backlog') },
        { label: 'Projects', fn: () => quickFetch(base + '/projects') },
        { label: 'Health Check (Chat)', fn: () => sendQuickChat('Status-Check: Wie geht es dir? Welche Services laufen?') },
        { label: 'Mesh Scan (Chat)', fn: () => sendQuickChat('Mesh Scan ausführen') },
        { label: 'Backlog Docs (Chat)', fn: () => sendQuickChat('Backlog hinzufügen: Prüfe Docs-Checklist') }
      ];
      quickEl.innerHTML = '';
      actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = a.href ? 'outline' : 'primary';
        btn.textContent = a.label;
        if (a.href) {
          btn.addEventListener('click', () => window.open(a.href, '_blank'));
        } else {
          btn.addEventListener('click', a.fn);
        }
        quickEl.appendChild(btn);
      });
    }

    async function quickFetch(url, method = 'GET') {
      quickResultEl.textContent = '...';
      try {
        const res = await fetch(url, { method });
        const data = await res.json();
        quickResultEl.textContent = JSON.stringify(data).slice(0, 500);
      } catch (err) {
        quickResultEl.textContent = 'Fehler: ' + err.message;
      }
    }

    async function sendQuickChat(text) {
      const base = getBase();
      if (!base) return;
      try {
        await fetch(base + '/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        await loadChatHistory(base);
      } catch (err) {
        console.warn('Quick chat failed', err);
      }
    }

    async function syncContext() {
      const base = getBase();
      if (!base) return;
      quickResultEl.textContent = '...';
      try {
        const res = await fetch(base + '/sync/context');
        const data = await res.json();
        quickResultEl.textContent = JSON.stringify(data).slice(0, 500);
      } catch (err) {
        quickResultEl.textContent = 'Fehler: ' + err.message;
      }
    }

    async function broadcastPing() {
      const base = getBase();
      if (!base) return;
      try {
        await fetch(base + '/events/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'ping', message: 'Manual broadcast from Control Center' })
        });
        await analyze();
      } catch (err) {
        alert('Broadcast fehlgeschlagen: ' + err.message);
      }
    }

    async function quickSeed(base, kind) {
      const url = {
        dream: '/dreams',
        emotion: '/emotions',
        memory: '/memories',
        gratitude: '/gratitude'
      }[kind];
      if (!url) return;
      quickResultEl.textContent = 'Seed ' + kind + ' ...';
      const payloads = {
        dream: { type: 'creative', narrative: 'Lucider Flug ueber einer Stadt', symbols: ['sky','flight'], emotions: ['freude'] },
        emotion: { primaryEmotion: 'freude', valence: 0.7, arousal: 0.5, intensity: 60, context: 'demo' },
        memory: { title: 'Demo Memory', content: 'Erste Erinnerung im Control Center', category: 'demo', significance: 55 },
        gratitude: { text: 'Dankbar fuer Klarheit und Fokus', category: 'demo' }
      };
      try {
        const res = await fetch(base + url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloads[kind])
        });
        const data = await res.json();
        quickResultEl.textContent = 'OK: ' + JSON.stringify(data).slice(0, 300);
      } catch (err) {
        quickResultEl.textContent = 'Fehler: ' + err.message;
      }
    }

    function setChatHelp() {
      const prompts = [
        'Status-Check: Wie geht es dir? Welche Services laufen?',
        'Logge ein Dankbarkeitseintrag: /gratitude Heute dankbar fuer Klarheit',
        'Traum speichern: /dream lucider Flug ueber der Stadt',
        'Emotion speichern: /emotion freude 0.7 0.6',
        'Memory anlegen: /memory Titel :: Inhalt',
        'Starte Self-Improve jetzt',
        'Self-Plan abrufen',
        'Self-Run starten (leicht)',
        'Health Check',
        'Dienste anzeigen',
        'Mesh Scan ausführen',
        'Backlog hinzufügen: Prüfe Docs-Checklist'
      ];
      chatHelpEl.innerHTML = prompts
        .map(p => '<button class="outline small" data-prompt="' + p.replace(/"/g, '&quot;') + '">' + p + '</button>')
        .join(' ');
      chatHelpEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          chatInput.value = btn.dataset.prompt;
          chatInput.focus();
        });
      });
    }

    function setContextPrompts(data) {
      const prompts = [];
      const sugg = data?.suggestions || [];
      sugg.slice(0, 3).forEach(s => prompts.push('Arbeite an: ' + s.title));
      const backlog = data?.backlog || [];
      backlog.slice(0, 3).forEach(b => prompts.push('Backlog ' + b.id + ': ' + b.title));
      contextEl.innerHTML = prompts.length
        ? prompts.map(p => '<button class="outline small" data-prompt="' + p.replace(/"/g,'&quot;') + '">' + p + '</button>').join(' ')
        : '<div class="muted small">Keine kontextuellen Vorschlaege.</div>';
      contextEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          chatInput.value = btn.dataset.prompt;
          chatInput.focus();
        });
      });
    }

    async function loadChatHistory(base) {
      try {
        const res = await fetch(base + '/chat/history');
        if (!res.ok) return;
        const data = await res.json();
        const history = data.history || [];
        chatLogEl.innerHTML = history
          .slice(0, 20)
          .map((msg) => {
            const role = msg.role === 'assistant' ? 'Toobix' : 'Du';
            const mtype = msg.meta?.type || (msg.role === 'assistant' ? 'assistant' : 'user');
            const cls = mtype === 'system' ? 'sys' : mtype === 'assistant' ? 'ai' : 'user';
            const icon = cls === 'sys' ? '🔔' : cls === 'ai' ? '🤖' : '🧑';
            const footer = msg.activity ? '<div class="muted small">' + msg.activity + '</div>' : '';
            return '<div class="chat-msg ' + cls + '"><div class="chat-head">' + icon + ' <span>' + role + '</span></div><div class="chat-body">' + (msg.content || '') + '</div></div>';
          })
          .join('');
      } catch (err) {
        console.warn('Chat history failed', err);
      }
    }

    async function sendChat() {
      const base = getBase();
      const text = chatInput.value.trim();
      if (!base || !text) return;
      try {
        const res = await fetch(base + '/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        chatInput.value = '';
        await loadChatHistory(base);
        if (data?.response) {
          alert('Antwort:\\n\\n' + data.response);
        }
      } catch (err) {
        alert('Chat fehlgeschlagen: ' + err.message);
      }
    }

    async function clearChat() {
      const base = getBase();
      if (!base) return;
      try {
        await fetch(base + '/chat/clear', { method: 'POST' });
        await loadChatHistory(base);
      } catch (err) {
        console.warn('Chat clear failed', err);
      }
    }

    async function analyze() {
      const base = getBase();
      if (!base) return;
      localStorage.setItem(storageKey, base);
      setQuickLinks(base);
      setCodeActions();
      setStatus('Lade...');
      try {
        const [improveRes, healthRes, contextRes, backlogRes, feedbackRes, emoRes, persoRes, pluginsRes, docsRes, projectsRes, providersRes, crossRes] = await Promise.all([
          fetch(base + '/self/improve'),
          fetch(base + '/health'),
          fetch(base + '/context'),
          fetch(base + '/backlog'),
          fetch(base + '/feedback'),
          fetch(base + '/analyze/emotions'),
          fetch(base + '/analyze/personality'),
          fetch(base + '/plugins'),
          fetch(base + '/docs/checklist'),
          fetch(base + '/projects'),
          fetch(base + '/ai/providers'),
          fetch(base + '/cross/status')
        ]);
        if (!improveRes.ok) throw new Error('Self-Improve HTTP ' + improveRes.status);
        const data = await improveRes.json();
        if (healthRes.ok) {
          const health = await healthRes.json();
          setServices(health);
        } else {
          setServices({ services: [] });
        }
        const ctx = contextRes.ok ? await contextRes.json() : null;
        setContextPanel(ctx);
        const backlogData = backlogRes.ok ? await backlogRes.json() : { backlog: [] };
        if (feedbackRes.ok) {
          const fb = await feedbackRes.json();
          setFeedbackList(fb.feedback || []);
        } else {
          setFeedbackList([]);
        }
        const emo = emoRes.ok ? await emoRes.json() : null;
        const perso = persoRes.ok ? await persoRes.json() : null;
        setInsights(perso, emo);
        if (pluginsRes.ok) {
          const plugins = await pluginsRes.json();
          setPlugins(plugins.plugins || []);
        } else {
          setPlugins([]);
        }
        if (docsRes.ok) {
          const docs = await docsRes.json();
          setDocs(docs.docs || []);
        } else {
          setDocs([]);
        }
        if (projectsRes.ok) {
          const proj = await projectsRes.json();
          setProjects(proj.projects || []);
        } else {
          setProjects([]);
        }
        if (providersRes.ok) {
          const prov = await providersRes.json();
          setProviders(prov.providers || []);
        }
        if (crossRes.ok) {
          const cr = await crossRes.json();
          setCross(cr);
        } else {
          setCross({});
        }
        setStatus(
          '<div class="status-grid">' +
            '<div class="status-card small">Services: ' + data.metrics.services + '</div>' +
            '<div class="status-card small">Dreams: ' + data.metrics.dreams + '</div>' +
            '<div class="status-card small">Emotions: ' + data.metrics.emotions + '</div>' +
            '<div class="status-card small">Memories: ' + data.metrics.memories + '</div>' +
            '<div class="status-card small">Gratitude: ' + data.metrics.gratitudes + '</div>' +
            '<div class="status-card small">Dev Backlog: ' + data.metrics.devBacklog + '</div>' +
            '<div class="status-card small">Decisions: ' + data.metrics.devDecisions + '</div>' +
          '</div>'
        );
        setSuggestions(data.suggestions);
        setActions(data.recommendedActions);
        setBacklog(backlogData, ctx?.decisions || []);
        setGamification(data.metrics);
        setQuests(data.metrics);
        setContextPrompts({ suggestions: data.suggestions, backlog: backlogData.backlog || [] });
        await loadChatHistory(base);
      } catch (err) {
        console.error(err);
        setStatus('<span class="badge critical">Fail</span> ' + err.message);
      }
    }

    async function applySelected() {
      const base = getBase();
      if (!base) return;
      const checks = actionsEl.querySelectorAll('input[type="checkbox"]:checked');
      const actions = [];
      checks.forEach(c => {
        try { actions.push(JSON.parse(c.dataset.action)); } catch {}
      });
      if (!actions.length) {
        alert('Keine Aktionen ausgewaehlt.');
        return;
      }
      try {
        const res = await fetch(base + '/self/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actions, backup: true })
        });
        const data = await res.json();
        alert('Angewendet. Backup: ' + data.backup);
        await analyze();
      } catch (err) {
        alert('Fehler beim Anwenden: ' + err.message);
      }
    }

    document.getElementById('btnConnect').addEventListener('click', analyze);
    document.getElementById('btnAnalyze').addEventListener('click', analyze);
    document.getElementById('btnApply').addEventListener('click', applySelected);
    document.getElementById('btnChat').addEventListener('click', sendChat);
    document.getElementById('btnChatClear').addEventListener('click', clearChat);
    document.getElementById('btnFeedback').addEventListener('click', sendFeedback);
    document.getElementById('btnAddProject').addEventListener('click', addProject);
    document.getElementById('btnSearch').addEventListener('click', doSearch);
    document.getElementById('btnSyncContext').addEventListener('click', syncContext);
    document.getElementById('btnBroadcastEvent').addEventListener('click', broadcastPing);
    chatInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') sendChat(); });

    setChatHelp();
    analyze();
  </script>
</body>
</html>
`;

Bun.serve({
  port: PORT,
  fetch() {
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }
});

console.log('[Toobix] Control Center laeuft auf http://localhost:' + PORT);





