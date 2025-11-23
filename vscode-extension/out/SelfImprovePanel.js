"use strict";
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
exports.SelfImprovePanel = void 0;
const vscode = __importStar(require("vscode"));
class SelfImprovePanel {
    static show(context, serviceManager) {
        const panel = vscode.window.createWebviewPanel('toobixSelfImprove', 'Toobix Self-Improve', vscode.ViewColumn.One, { enableScripts: true });
        const base = serviceManager.getGatewayBase().replace(/\/$/, '');
        const apiKey = serviceManager.getApiKey() ?? '';
        panel.webview.html = this.getHtml(base, apiKey);
    }
    static getHtml(baseUrl, apiKey) {
        const escapedBase = baseUrl.replace(/"/g, '');
        const escapedKey = apiKey.replace(/"/g, '');
        return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src ${escapedBase};" />
  <style>
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f172a; color:#e5e7eb; }
    header { padding:12px 16px; border-bottom:1px solid #1f2937; display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    h1 { margin:0; font-size:16px; letter-spacing:0.5px; }
    .muted { color:#9ca3af; font-size:12px; }
    main { padding:12px; display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .card { background:#111827; border:1px solid #1f2937; border-radius:10px; padding:12px; box-shadow:0 10px 30px rgba(0,0,0,0.35); }
    .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    input, button { border-radius:8px; border:1px solid #1f2937; padding:8px 10px; background:#1f2937; color:#e5e7eb; }
    button { cursor:pointer; }
    button.primary { background:#38bdf8; color:#0b1020; border:none; }
    button.warn { background:#f59e0b; color:#0b1020; border:none; }
    ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
    li { background:#0b1222; border:1px solid #1f2937; border-radius:8px; padding:8px; }
    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; letter-spacing:0.4px; }
    .critical { background:rgba(249,115,22,0.15); color:#f97316; }
    .warn { background:rgba(245,158,11,0.15); color:#f59e0b; }
    .info { background:rgba(56,189,248,0.15); color:#38bdf8; }
    .small { font-size:12px; }
    .status-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap:6px; }
    .status-card { background:#0b1222; border:1px solid #1f2937; border-radius:8px; padding:8px; font-size:12px; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Toobix Self-Improve</h1>
      <div class="muted">Analyse, Vorschläge, sichere Aktionen</div>
    </div>
    <div class="row" style="margin-left:auto;">
      <input id="base" value="${escapedBase}" style="min-width:200px;" />
      <button class="primary" id="btnAnalyze">Analyse</button>
      <button class="warn" id="btnApply">Apply (Backup)</button>
    </div>
  </header>
  <main>
    <section class="card">
      <h3>Status</h3>
      <div id="status"></div>
    </section>
    <section class="card">
      <h3>Vorschläge</h3>
      <ul id="suggestions"></ul>
    </section>
    <section class="card">
      <h3>Empfohlene Aktionen</h3>
      <div class="muted small">Haken setzen → Apply</div>
      <ul id="actions"></ul>
    </section>
    <section class="card">
      <h3>Backlog / Decisions</h3>
      <div id="backlog"></div>
    </section>
  </main>
  <script>
    const baseInput = document.getElementById('base');
    const status = document.getElementById('status');
    const suggestions = document.getElementById('suggestions');
    const actions = document.getElementById('actions');
    const backlog = document.getElementById('backlog');
    const apiKey = "${escapedKey}";

    function badge(sev) { return '<span class="badge ' + sev + '">' + sev.toUpperCase() + '</span>'; }

    function setStatus(metrics) {
      status.innerHTML = metrics ? '<div class="status-grid">' +
        '<div class="status-card">Services: ' + metrics.services + '</div>' +
        '<div class="status-card">Dreams: ' + metrics.dreams + '</div>' +
        '<div class="status-card">Emotions: ' + metrics.emotions + '</div>' +
        '<div class="status-card">Memories: ' + metrics.memories + '</div>' +
        '<div class="status-card">Gratitude: ' + metrics.gratitudes + '</div>' +
        '<div class="status-card">Dev Backlog: ' + metrics.devBacklog + '</div>' +
        '<div class="status-card">Decisions: ' + metrics.devDecisions + '</div>' +
      '</div>' : '<div class="muted">Keine Daten</div>';
    }

    function setSuggestions(list) {
      suggestions.innerHTML = '';
      if (!list || !list.length) {
        suggestions.innerHTML = '<li class="muted">Keine Vorschläge.</li>';
        return;
      }
      list.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = badge(item.severity) + ' ' + item.title +
          (item.details ? '<div class="muted small">' + item.details + '</div>' : '') +
          (item.actions ? '<pre class="small">' + item.actions.join('\\n') + '</pre>' : '');
        suggestions.appendChild(li);
      });
    }

    function setActions(list) {
      actions.innerHTML = '';
      if (!list || !list.length) {
        actions.innerHTML = '<li class="muted">Keine empfohlenen Aktionen.</li>';
        return;
      }
      list.forEach((a, idx) => {
        const li = document.createElement('li');
        const id = 'act-' + idx;
        li.innerHTML = '<label class="row"><input type="checkbox" id="' + id + '" checked data-action="' + encodeURIComponent(JSON.stringify(a)) + '" />' +
          '<div><div>' + a.type + '</div>' +
          (a.payload ? '<div class="muted small">' + JSON.stringify(a.payload) + '</div>' : '') +
          '</div></label>';
        actions.appendChild(li);
      });
    }

    function setBacklog(data) {
      const bl = data?.dev?.backlog || [];
      const dec = data?.dev?.decisions || [];
      let html = '<div class="muted small">Backlog (' + bl.length + ')</div>';
      html += '<div class="status-grid">';
      bl.slice(0,5).forEach(b => { html += '<div class="status-card small">[' + b.status + '] ' + b.title + '</div>'; });
      if (!bl.length) html += '<div class="muted small">leer</div>';
      html += '</div><div class="muted small" style="margin-top:6px;">Decisions (' + dec.length + ')</div><div class="status-grid">';
      dec.slice(0,3).forEach(d => { html += '<div class="status-card small">' + d.title + ' -> ' + d.decision + '</div>'; });
      if (!dec.length) html += '<div class="muted small">leer</div>';
      html += '</div>';
      backlog.innerHTML = html;
    }

    async function analyze() {
      const base = baseInput.value.trim().replace(/\\/$/, '');
      if (!base) return;
      status.textContent = 'Lade...';
      try {
        const res = await fetch(base + '/self/improve', { headers: apiKey ? { 'x-toobix-key': apiKey, 'authorization': 'Bearer ' + apiKey } : {} });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        setStatus(data.metrics);
        setSuggestions(data.suggestions);
        setActions(data.recommendedActions);
        setBacklog(data.dashboard);
      } catch (err) {
        status.innerHTML = '<span class="badge critical">Fail</span> ' + err.message;
      }
    }

    async function applySelected() {
      const base = baseInput.value.trim().replace(/\\/$/, '');
      if (!base) return;
      const checks = actions.querySelectorAll('input[type="checkbox"]:checked');
      const acts = [];
      checks.forEach(c => {
        try { acts.push(JSON.parse(decodeURIComponent(c.dataset.action || ''))); } catch {}
      });
      if (!acts.length) { alert('Keine Aktionen ausgewaehlt.'); return; }
      try {
        const res = await fetch(base + '/self/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-toobix-key': apiKey, 'authorization': 'Bearer ' + apiKey } : {}) },
          body: JSON.stringify({ actions: acts, backup: true })
        });
        const data = await res.json();
        alert('Apply erledigt. Backup: ' + (data.backup || 'none'));
        analyze();
      } catch (err) {
        alert('Fehler: ' + err.message);
      }
    }

    document.getElementById('btnAnalyze').addEventListener('click', analyze);
    document.getElementById('btnApply').addEventListener('click', applySelected);
    window.addEventListener('load', analyze);
  </script>
</body>
</html>
    `;
    }
}
exports.SelfImprovePanel = SelfImprovePanel;
//# sourceMappingURL=SelfImprovePanel.js.map