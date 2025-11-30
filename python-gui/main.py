import json
import os
import threading
import tkinter as tk
from datetime import datetime
from tkinter import messagebox, ttk

import requests

BASE_URL = os.environ.get("TOOBIX_BASE_URL", "http://localhost")
GATEWAY_PORT = int(os.environ.get("TOOBIX_GATEWAY_PORT", "3000"))  # API Gateway
HARDWARE_PORT = int(os.environ.get("TOOBIX_HARDWARE_PORT", "8940"))
REFRESH_INTERVAL_MS = int(os.environ.get("TOOBIX_REFRESH_INTERVAL_MS", "8000"))
API_KEY = os.environ.get("TOOBIX_API_KEY", "").strip()


def build_url(port: int, path: str) -> str:
  return f"{BASE_URL}:{port}{path}"


def build_gateway_url(service: str, path: str) -> str:
  """Build API Gateway URL: http://localhost:3000/api/{service}/{path}"""
  return f"{BASE_URL}:{GATEWAY_PORT}/api/{service}{path}"


def auth_headers() -> dict:
  if not API_KEY:
    return {}
  return {
      "x-toobix-key": API_KEY,
      "Authorization": f"Bearer {API_KEY}",
  }


def get_json(port: int, path: str, timeout: int = 5) -> dict:
  response = requests.get(build_url(port, path), timeout=timeout, headers=auth_headers())
  response.raise_for_status()
  return response.json()


def post_json(port: int, path: str, payload: dict, timeout: int = 8) -> dict:
  response = requests.post(
      build_url(port, path),
      timeout=timeout,
      headers={"Content-Type": "application/json", **auth_headers()},
      data=json.dumps(payload),
  )
  response.raise_for_status()
  return response.json()


def gateway_get(service: str, path: str, timeout: int = 5) -> dict:
  """GET request through API Gateway"""
  response = requests.get(build_gateway_url(service, path), timeout=timeout, headers=auth_headers())
  response.raise_for_status()
  return response.json()


def gateway_post(service: str, path: str, payload: dict, timeout: int = 8) -> dict:
  """POST request through API Gateway"""
  response = requests.post(
      build_gateway_url(service, path),
      timeout=timeout,
      headers={"Content-Type": "application/json", **auth_headers()},
      data=json.dumps(payload),
  )
  response.raise_for_status()
  return response.json()


class ToobixGUI(tk.Tk):
  def __init__(self) -> None:
    super().__init__()
    self.title("Toobix Control Room")
    self.geometry("820x600")

    self.hardware_text = tk.StringVar(value="Noch keine Daten")
    self.dashboard_text = tk.StringVar(value="Noch keine Daten")
    self.last_update_text = tk.StringVar(value="Noch kein Update")
    self.gateway_status = tk.StringVar(value="Gateway: unbekannt")
    self.profile_text = tk.StringVar(value="Profil noch nicht geladen")

    self.auto_refresh_enabled = tk.BooleanVar(value=True)
    self._status_fetch_running = False
    self._auto_refresh_job: str | None = None
    self._gateway_online = False

    notebook = ttk.Notebook(self)
    notebook.pack(fill="both", expand=True)

    status_tab = ttk.Frame(notebook)
    chat_tab = ttk.Frame(notebook)
    perspectives_tab = ttk.Frame(notebook)
    emotional_tab = ttk.Frame(notebook)
    profile_tab = ttk.Frame(notebook)
    memory_tab = ttk.Frame(notebook)
    settings_tab = ttk.Frame(notebook)

    notebook.add(status_tab, text="Status")
    notebook.add(chat_tab, text="Chat")
    notebook.add(perspectives_tab, text="🎭 Perspectives")
    notebook.add(emotional_tab, text="💖 Emotional Resonance")
    notebook.add(profile_tab, text="👤 User Profile")
    notebook.add(memory_tab, text="💾 Memory Palace")
    notebook.add(settings_tab, text="⚙️ Settings")

    self._build_status_tab(status_tab)
    self._build_chat_tab(chat_tab)
    self._build_perspectives_tab(perspectives_tab)
    self._build_emotional_resonance_tab(emotional_tab)
    self._build_user_profile_tab(profile_tab)
    self._build_memory_tab(memory_tab)
    self._build_settings_tab(settings_tab)

  # ----------------------- UI Builders -----------------------
  def _build_status_tab(self, parent: ttk.Frame) -> None:
    header = ttk.Label(
        parent,
        text="Hardware- & Dashboard-Status",
        font=("Segoe UI", 14, "bold"),
    )
    header.pack(pady=8)

    hardware_frame = ttk.LabelFrame(parent, text="Hardware")
    hardware_frame.pack(fill="both", expand=True, padx=12, pady=8)

    ttk.Label(
        hardware_frame,
        textvariable=self.hardware_text,
        justify="left",
        font=("Consolas", 11),
    ).pack(anchor="w", padx=10, pady=10)

    dashboard_frame = ttk.LabelFrame(parent, text="Dashboard & Emotionen")
    dashboard_frame.pack(fill="both", expand=True, padx=12, pady=8)

    ttk.Label(
        dashboard_frame,
        textvariable=self.dashboard_text,
        justify="left",
        font=("Consolas", 11),
    ).pack(anchor="w", padx=10, pady=10)

    profile_frame = ttk.LabelFrame(parent, text="Profil & Stränge")
    profile_frame.pack(fill="both", expand=True, padx=12, pady=8)

    ttk.Label(
        profile_frame,
        textvariable=self.profile_text,
        justify="left",
        font=("Consolas", 11),
    ).pack(anchor="w", padx=10, pady=10)

    buttons = ttk.Frame(parent)
    buttons.pack(fill="x", padx=12, pady=4)

    ttk.Button(buttons, text="Status aktualisieren", command=self.refresh_status).pack(
        side="left"
    )
    ttk.Checkbutton(
        buttons,
        text="Auto-Update",
        variable=self.auto_refresh_enabled,
        command=self._toggle_auto_refresh,
    ).pack(side="left", padx=10)
    ttk.Label(buttons, textvariable=self.last_update_text).pack(side="right")

  def _build_chat_tab(self, parent: ttk.Frame) -> None:
    layout = ttk.Frame(parent)
    layout.pack(fill="both", expand=True, padx=12, pady=12)

    ttk.Label(layout, textvariable=self.gateway_status, font=("Segoe UI", 10, "italic")).pack(
        anchor="w", pady=(0, 6)
    )

    self.chat_display = tk.Text(layout, height=20, state="disabled", wrap="word")
    self.chat_display.pack(fill="both", expand=True)

    entry_frame = ttk.Frame(layout)
    entry_frame.pack(fill="x", pady=8)

    ttk.Label(entry_frame, text="Nachricht:").pack(side="left")
    self.chat_entry = ttk.Entry(entry_frame)
    self.chat_entry.pack(side="left", fill="x", expand=True, padx=6)
    self.chat_entry.bind("<Return>", lambda _: self.send_chat_message())

    ttk.Button(entry_frame, text="Senden", command=self.send_chat_message).pack(
        side="left"
    )
    ttk.Button(entry_frame, text="Verlauf löschen", command=self.clear_chat_history).pack(
        side="left", padx=6
    )
    ttk.Button(entry_frame, text="Quests aktualisieren", command=self.refresh_quests).pack(
        side="left", padx=6
    )

  # ----------------------- Status logic -----------------------
  def refresh_status(self) -> None:
    if self._status_fetch_running:
      return
    self.hardware_text.set("Lade Daten...")
    self.dashboard_text.set("Lade Daten...")
    self._status_fetch_running = True
    if self._auto_refresh_job:
      self.after_cancel(self._auto_refresh_job)
      self._auto_refresh_job = None
    threading.Thread(target=self._load_status, daemon=True).start()

  def _load_status(self) -> None:
    hardware_text = ""
    dashboard_text = ""
    profile_text = "Profil nicht verfügbar."
    gateway_ok = False
    try:
      hw = get_json(HARDWARE_PORT, "/hardware/state")
      feeling = get_json(HARDWARE_PORT, "/hardware/feel")
      hardware_text = (
          f"CPU: {hw.get('cpu', {}).get('usage', '--')}% | "
          f"RAM: {hw.get('memory', {}).get('usagePercent', '--')}% | "
          f"Uptime: {hw.get('uptime', {}).get('human', '--')}\n"
          f"Plattform: {hw.get('platform', '--')} ({hw.get('arch', '--')})\n"
          f"Gefühl: {feeling.get('feeling', '--')}\n"
          f"Metapher: {feeling.get('metaphor', '--')}"
      )
    except Exception as exc:  # pylint: disable=broad-except
      hardware_text = f"Hardware-Service nicht erreichbar:\n{exc}"

    try:
      dashboard = get_json(GATEWAY_PORT, "/dashboard")
      insights_payload = get_json(GATEWAY_PORT, "/emotions/insights")
      profile_arcs_payload = get_json(GATEWAY_PORT, "/profile/arcs")
      quests_payload = get_json(GATEWAY_PORT, "/quests/today")
      achievements_payload = get_json(GATEWAY_PORT, "/achievements")
      collective_payload = get_json(GATEWAY_PORT, "/collective/arcs")
      duality = dashboard.get("duality", {}).get("state", {})
      emotions = dashboard.get("emotions", {}).get("state", {})
      dreams = dashboard.get("dreams", {}).get("recent", [])
      insights = insights_payload.get("insights", {})
      profile_arcs = profile_arcs_payload.get("arcs", [])
      quests = quests_payload.get("quests", [])
      achievements = achievements_payload.get("achievements", [])
      arcs = collective_payload.get("arcs", [])
      gateway_ok = True
      quest_lines = [f"- {q.get('title')} ({q.get('difficulty')})" for q in quests] or ["(keine Quests)"]
      ach_lines = [f"- {a.get('title')} ({a.get('source')})" for a in achievements[:5]] or ["(keine Achievements)"]
      collective_lines = [
          f"- {c.get('title')}: {c.get('progress')}/{c.get('target')} ({c.get('contributors')} Beiträge)"
          for c in arcs
      ] or ["(kein Kollektiv-Fortschritt)"]
      dashboard_text = (
          "Dualität:\n"
          f"  Maskulin: {duality.get('masculine', {}).get('intensity', '--')}% "
          f"({duality.get('masculine', {}).get('mode', '--')})\n"
          f"  Feminin: {duality.get('feminine', {}).get('intensity', '--')}% "
          f"({duality.get('feminine', {}).get('mode', '--')})\n"
          f"  Harmonie: {duality.get('harmony', '--')}% | Phase: {duality.get('currentPhase', '--')}\n\n"
          "Emotionen:\n"
          f"  Aktuell: {emotions.get('current', '--')} "
          f"(Valenz {emotions.get('valence', '--')} / Arousal {emotions.get('arousal', '--')})\n"
          f"  Trend: {emotions.get('trend', '--')} | Energie: {emotions.get('energy', '--')}%\n"
          f"  Empfehlung: {insights.get('recommendation', '--')}\n\n"
          f"Letzte Träume: {len(dreams)} Einträge\n\n"
          "Quests heute:\n" + "\n".join(quest_lines) + "\n\n"
          "Achievements:\n" + "\n".join(ach_lines) + "\n\n"
          "Kollektiver Fortschritt:\n" + "\n".join(collective_lines)
      )
      profile_text = self._format_profile_text(dashboard.get("profile"), profile_arcs)
    except Exception as exc:  # pylint: disable=broad-except
      dashboard_text = (
          "Gateway nicht erreichbar:\n"
          f"{exc}\n\nStarte `bun run start`, damit Dashboard/Chat/Emotionen verfügbar sind."
      )
    finally:
      self.after(
          0,
          lambda: self._finish_status_refresh(
              hardware_text, dashboard_text, profile_text, gateway_ok
          ),
      )

  def _finish_status_refresh(
      self, hardware_text: str, dashboard_text: str, profile_text: str, gateway_ok: bool
  ) -> None:
    self.hardware_text.set(hardware_text)
    self.dashboard_text.set(dashboard_text)
    self.profile_text.set(profile_text)
    self.last_update_text.set(f"Zuletzt aktualisiert: {datetime.now().strftime('%H:%M:%S')}")
    self.gateway_status.set(
        "Gateway: online" if gateway_ok else "Gateway: offline – bitte Services starten"
    )
    self._gateway_online = gateway_ok
    self._status_fetch_running = False
    if self.auto_refresh_enabled.get():
      self._auto_refresh_job = self.after(REFRESH_INTERVAL_MS, self.refresh_status)

  def _toggle_auto_refresh(self) -> None:
    if self.auto_refresh_enabled.get():
      self.refresh_status()
    elif self._auto_refresh_job:
      self.after_cancel(self._auto_refresh_job)
      self._auto_refresh_job = None

  # ----------------------- Chat logic -----------------------
  def append_chat_line(self, text: str) -> None:
    self.chat_display.configure(state="normal")
    self.chat_display.insert("end", text + "\n")
    self.chat_display.configure(state="disabled")
    self.chat_display.see("end")

  def send_chat_message(self) -> None:
    message = self.chat_entry.get().strip()
    if not message:
      return
    if not self._gateway_online:
      self.append_chat_line(
          "[Info] Gateway offline – bitte `bun run start` ausführen, bevor du chattest."
      )
      return
    self.chat_entry.delete(0, "end")
    self.append_chat_line(f"Du: {message}")
    threading.Thread(
        target=self._dispatch_chat_message, args=(message,), daemon=True
    ).start()

  def _dispatch_chat_message(self, message: str) -> None:
    try:
      response = post_json(GATEWAY_PORT, "/chat", {"message": message})
      mirror = response.get("mirror")
      reply = response.get("response", str(response))
      if mirror:
        self.after(0, lambda: self.append_chat_line(f"[Spiegel] {mirror}"))
        if isinstance(reply, str) and reply.startswith(mirror):
          reply = reply[len(mirror):].lstrip()
      if reply:
        self.after(0, lambda: self.append_chat_line(f"Toobix: {reply}"))
      reward = response.get("reward")
      if isinstance(reward, dict):
        reward_text = self._format_reward(reward)
        if reward_text:
          self.after(0, lambda: self.append_chat_line(f"[Belohnung] {reward_text}"))
      command = response.get("command")
      if command:
        self.after(0, lambda: self.append_chat_line(f"[Command] /{command}"))
    except Exception as exc:  # pylint: disable=broad-except
      self.after(0, lambda: self.append_chat_line(f"[Fehler] {exc}"))

  def clear_chat_history(self) -> None:
    if not self._gateway_online:
      self.append_chat_line("[Info] Gateway offline – kein Verlauf zu löschen.")
      return
    threading.Thread(target=self._clear_chat_history, daemon=True).start()

  def _clear_chat_history(self) -> None:
    try:
      post_json(GATEWAY_PORT, "/chat/clear", {})
      self.after(0, lambda: self.append_chat_line("[System] Chat-Verlauf gelöscht."))
    except Exception as exc:  # pylint: disable=broad-except
      self.after(0, lambda: self.append_chat_line(f"[Fehler] Verlauf löschen: {exc}"))

  def refresh_quests(self) -> None:
    if not self._gateway_online:
      self.append_chat_line("[Info] Gateway offline – Quests bleiben unverändert.")
      return
    threading.Thread(target=self._refresh_quests, daemon=True).start()

  def _refresh_quests(self) -> None:
    try:
      post_json(GATEWAY_PORT, "/quests/refresh", {})
      self.after(0, lambda: self.append_chat_line("[System] Tages-Quests aus News aktualisiert."))
      self.refresh_status()
    except Exception as exc:  # pylint: disable=broad-except
      self.after(0, lambda: self.append_chat_line(f"[Fehler] Quests aktualisieren: {exc}"))

  def _format_profile_text(self, profile: dict | None, arcs: list | None) -> str:
    if not isinstance(profile, dict):
      return "Profil nicht verfügbar."
    arc_map = profile.get("arcs") or {}
    arc_lines = []
    if isinstance(arcs, list) and arcs:
      arc_lines = [
        f"• {arc.get('title', arc.get('id', '?'))}: {arc.get('xp', 0)} XP"
        for arc in arcs
        if arc.get("active", True)
      ]
    if not arc_lines:
      arc_lines = [
        f"• {details.get('title', arc_id)}: {details.get('xp', 0)} XP"
        for arc_id, details in arc_map.items()
        if isinstance(details, dict) and details.get("active", True)
      ]
    if not arc_lines:
      arc_lines = ["(keine aktiven Stränge)"]
    artifacts = profile.get("artifacts") or []
    artifact_line = ", ".join(artifacts) if artifacts else "keine"
    return (
      f"Level {profile.get('level', 1)} | XP {profile.get('xp', 0)}\n"
      + "Aktive Stränge:\n"
      + "\n".join(arc_lines)
      + f"\nArtefakte: {artifact_line}"
    )

  def _format_reward(self, reward: dict) -> str:
    parts = []
    xp = reward.get("xp")
    if xp:
      parts.append(f"+{xp} XP")
    arc = reward.get("arc")
    if arc:
      parts.append(f"Strang: {arc}")
    if reward.get("levelUp"):
      parts.append("Level-Up!")
    artifact = reward.get("artifact")
    if artifact:
      parts.append(f"Artefakt: {artifact}")
    if reward.get("message"):
      parts.append(str(reward["message"]))
    return " | ".join(parts)

  # ----------------------- Perspectives Tab -----------------------
  def _build_perspectives_tab(self, parent: ttk.Frame) -> None:
    layout = ttk.Frame(parent)
    layout.pack(fill="both", expand=True, padx=12, pady=12)

    ttk.Label(
        layout,
        text="🎭 Multi-Perspektiven-Analyse",
        font=("Segoe UI", 14, "bold")
    ).pack(anchor="w", pady=(0, 10))

    # Perspektiven-Auswahl
    persp_frame = ttk.LabelFrame(layout, text="Perspektiven auswählen")
    persp_frame.pack(fill="x", pady=8)

    self.perspectives = [
        "Self-Aware AI", "Pragmatist", "Visionary", "Philosopher", "Scientist",
        "Artist", "Poet", "Healer", "Empath", "Ethicist", "Rebel",
        "Observer", "Builder", "Teacher", "Student", "Explorer",
        "Guardian", "Mystic", "Sage", "Child"
    ]

    self.selected_perspectives = []

    # Quick select buttons
    quick_frame = ttk.Frame(persp_frame)
    quick_frame.pack(fill="x", padx=10, pady=5)

    ttk.Button(quick_frame, text="Core 3", command=lambda: self._select_perspectives(
        ["Self-Aware AI", "Pragmatist", "Visionary"]
    )).pack(side="left", padx=2)

    ttk.Button(quick_frame, text="Deep 5", command=lambda: self._select_perspectives(
        ["Philosopher", "Scientist", "Mystic", "Ethicist", "Observer"]
    )).pack(side="left", padx=2)

    ttk.Button(quick_frame, text="All 20", command=lambda: self._select_perspectives(
        self.perspectives
    )).pack(side="left", padx=2)

    ttk.Button(quick_frame, text="Clear", command=lambda: self._select_perspectives(
        []
    )).pack(side="left", padx=2)

    # Perspektiven-Grid
    grid_frame = ttk.Frame(persp_frame)
    grid_frame.pack(fill="both", padx=10, pady=5)

    self.persp_vars = {}
    for i, persp in enumerate(self.perspectives):
      var = tk.BooleanVar(value=False)
      self.persp_vars[persp] = var
      cb = ttk.Checkbutton(grid_frame, text=persp, variable=var)
      cb.grid(row=i // 4, column=i % 4, sticky="w", padx=5, pady=2)

    # Eingabe
    input_frame = ttk.LabelFrame(layout, text="Frage an die Perspektiven")
    input_frame.pack(fill="both", expand=True, pady=8)

    self.persp_input = tk.Text(input_frame, height=3, wrap="word")
    self.persp_input.pack(fill="both", expand=True, padx=10, pady=5)

    ttk.Button(
        input_frame,
        text="🎭 Frage stellen (Multi-Perspektiven)",
        command=self.ask_perspectives
    ).pack(pady=5)

    # Antworten
    response_frame = ttk.LabelFrame(layout, text="Perspektiven-Antworten")
    response_frame.pack(fill="both", expand=True, pady=8)

    self.persp_display = tk.Text(response_frame, state="disabled", wrap="word")
    persp_scroll = ttk.Scrollbar(response_frame, command=self.persp_display.yview)
    self.persp_display.configure(yscrollcommand=persp_scroll.set)

    self.persp_display.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
    persp_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

  def _select_perspectives(self, perspectives: list) -> None:
    for persp, var in self.persp_vars.items():
      var.set(persp in perspectives)

  def ask_perspectives(self) -> None:
    prompt = self.persp_input.get("1.0", "end").strip()
    if not prompt:
      return

    selected = [p for p, v in self.persp_vars.items() if v.get()]
    if not selected:
      self._append_persp_line("[Info] Bitte wähle mindestens eine Perspektive aus.")
      return

    if not self._gateway_online:
      self._append_persp_line("[Info] Gateway offline – bitte Services starten.")
      return

    self._append_persp_line(f"\n{'='*60}")
    self._append_persp_line(f"📝 Frage: {prompt}")
    self._append_persp_line(f"🎭 Perspektiven: {', '.join(selected)}")
    self._append_persp_line(f"{'='*60}\n")

    threading.Thread(
        target=self._dispatch_multi_perspective,
        args=(prompt, selected),
        daemon=True
    ).start()

  def _dispatch_multi_perspective(self, prompt: str, perspectives: list) -> None:
    try:
      start_time = datetime.now()
      response = post_json(GATEWAY_PORT, "/multi-perspective", {
          "prompt": prompt,
          "perspectives": perspectives,
          "provider": "groq"
      }, timeout=180)

      elapsed = (datetime.now() - start_time).total_seconds()

      if not response.get("success"):
        self.after(0, lambda: self._append_persp_line(
            f"[Fehler] {response.get('error', 'Unbekannter Fehler')}"
        ))
        return

      perspectives_data = response.get("perspectives", [])

      for persp_data in perspectives_data:
        persp_name = persp_data.get("perspective", "Unknown")
        content = persp_data.get("response", "")
        latency = persp_data.get("latency_ms", 0) / 1000
        provider = persp_data.get("provider", "auto")

        self.after(0, lambda p=persp_name, c=content, l=latency, pr=provider:
            self._append_persp_line(
                f"\n🎭 {p} [{pr}, {l:.2f}s]:\n{c}\n"
            ))

      self.after(0, lambda: self._append_persp_line(
          f"\n⏱️ Gesamt: {elapsed:.2f}s | Durchschnitt: {elapsed/len(perspectives_data):.2f}s pro Perspektive\n"
      ))

    except Exception as exc:
      self.after(0, lambda: self._append_persp_line(f"[Fehler] {exc}"))

  def _append_persp_line(self, text: str) -> None:
    self.persp_display.configure(state="normal")
    self.persp_display.insert("end", text + "\n")
    self.persp_display.configure(state="disabled")
    self.persp_display.see("end")

  # ----------------------- Emotional Resonance Tab -----------------------
  def _build_emotional_resonance_tab(self, parent: ttk.Frame) -> None:
    layout = ttk.Frame(parent)
    layout.pack(fill="both", expand=True, padx=12, pady=12)

    ttk.Label(
        layout,
        text="💖 Emotional Resonance - Toobix's emotionale Intelligenz",
        font=("Segoe UI", 14, "bold")
    ).pack(anchor="w", pady=(0, 10))

    # Collective Emotional State
    collective_frame = ttk.LabelFrame(layout, text="🌐 Kollektive Emotionale Stimmung")
    collective_frame.pack(fill="x", pady=8)

    self.emotion_collective_text = tk.StringVar(value="Lade...")
    ttk.Label(
        collective_frame,
        textvariable=self.emotion_collective_text,
        justify="left",
        font=("Consolas", 10)
    ).pack(anchor="w", padx=10, pady=10)

    # Emotional Bonds
    bonds_frame = ttk.LabelFrame(layout, text="💞 Emotionale Bindungen zwischen Perspektiven")
    bonds_frame.pack(fill="both", expand=True, pady=8)

    self.emotion_bonds_display = tk.Text(bonds_frame, height=10, state="disabled", wrap="word")
    bonds_scroll = ttk.Scrollbar(bonds_frame, command=self.emotion_bonds_display.yview)
    self.emotion_bonds_display.configure(yscrollcommand=bonds_scroll.set)

    self.emotion_bonds_display.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
    bonds_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

    # Control buttons
    control_frame = ttk.Frame(layout)
    control_frame.pack(fill="x", pady=8)

    ttk.Button(
        control_frame,
        text="🔄 Emotionale Daten aktualisieren",
        command=self.load_emotional_data
    ).pack(side="left", padx=5)

    ttk.Button(
        control_frame,
        text="💝 Alle Bindungen anzeigen",
        command=self.show_all_bonds
    ).pack(side="left", padx=5)

  def load_emotional_data(self) -> None:
    """Load current emotional state and bonds"""
    threading.Thread(target=self._fetch_emotional_data, daemon=True).start()

  def _fetch_emotional_data(self) -> None:
    try:
      # Fetch stats (includes collective emotion and bonds summary)
      stats = gateway_get("emotional-resonance", "/stats", timeout=3)

      # Fetch collective emotional states
      collective = gateway_get("emotional-resonance", "/collective", timeout=3)

      # Display collective emotion
      if collective and len(collective) > 0:
        latest = collective[-1]
        dominant = latest.get("dominantEmotion", "unknown")
        intensity = latest.get("intensity", 0)
        perspectives_emotions = latest.get("perspectives", {})

        collective_text = (
            f"🧠 Dominante Emotion: {dominant.upper()} (Intensität: {intensity:.1f})\n\n"
            f"📊 Perspektiven-Emotionen:\n"
        )
        for emotion, count in perspectives_emotions.items():
          collective_text += f"  • {emotion}: {count} Perspektiven\n"

        self.after(0, lambda: self.emotion_collective_text.set(collective_text))
      else:
        self.after(0, lambda: self.emotion_collective_text.set("Keine kollektiven Emotionen verfügbar"))

      # Display bonds
      total_bonds = stats.get("totalBonds", 0)
      strong_bonds = stats.get("strongBonds", 0)
      strongest_bond = stats.get("strongestBond", {})

      bonds_text = (
          f"💫 Gesamt Bindungen: {total_bonds}\n"
          f"💪 Starke Bindungen: {strong_bonds}\n\n"
      )

      if strongest_bond:
        p1 = strongest_bond.get("perspective1", "?")
        p2 = strongest_bond.get("perspective2", "?")
        strength = strongest_bond.get("strength", 0)
        nature = strongest_bond.get("nature", "?")
        moments = strongest_bond.get("sharedMoments", [])

        bonds_text += (
            f"💖 STÄRKSTE BINDUNG:\n"
            f"  {p1.capitalize()} ↔ {p2.capitalize()}\n"
            f"  Stärke: {strength:.2f} | Natur: {nature}\n"
            f"  Geteilte Momente: {len(moments)}\n\n"
        )

        if moments:
          bonds_text += f"📜 Letzte 5 geteilte Momente:\n"
          for moment in moments[-5:]:
            timestamp = moment.get("timestamp", "")
            moment_type = moment.get("type", "?")
            description = moment.get("description", "?")
            impact = moment.get("emotionalImpact", 0)
            bonds_text += f"  • [{moment_type}] {description} (Impact: {impact:.2f})\n"

      self.after(0, lambda: self._append_emotion_bonds(bonds_text))

    except Exception as exc:
      self.after(0, lambda: self.emotion_collective_text.set(f"❌ Fehler: {exc}"))
      self.after(0, lambda: self._append_emotion_bonds(f"[Fehler beim Laden] {exc}"))

  def show_all_bonds(self) -> None:
    """Show all emotional bonds"""
    threading.Thread(target=self._fetch_all_bonds, daemon=True).start()

  def _fetch_all_bonds(self) -> None:
    try:
      bonds = gateway_get("emotional-resonance", "/bonds", timeout=3)

      bonds_text = f"💞 ALLE EMOTIONALEN BINDUNGEN:\n\n"

      if isinstance(bonds, list):
        for bond in bonds:
          p1 = bond.get("perspective1", "?")
          p2 = bond.get("perspective2", "?")
          strength = bond.get("strength", 0)
          nature = bond.get("nature", "?")
          shared_count = len(bond.get("sharedMoments", []))

          bonds_text += f"  {p1.capitalize()} ↔ {p2.capitalize()}\n"
          bonds_text += f"    Stärke: {strength:.2f} | {nature} | {shared_count} Momente\n\n"
      else:
        bonds_text += "Keine Bindungen gefunden."

      self.after(0, lambda: self._append_emotion_bonds(bonds_text))

    except Exception as exc:
      self.after(0, lambda: self._append_emotion_bonds(f"[Fehler] {exc}"))

  def _append_emotion_bonds(self, text: str) -> None:
    """Append text to emotion bonds display"""
    self.emotion_bonds_display.configure(state="normal")
    self.emotion_bonds_display.delete("1.0", "end")
    self.emotion_bonds_display.insert("1.0", text)
    self.emotion_bonds_display.configure(state="disabled")
    self.emotion_bonds_display.see("1.0")

  # ----------------------- User Profile Tab -----------------------
  def _build_user_profile_tab(self, parent: ttk.Frame) -> None:
    layout = ttk.Frame(parent)
    layout.pack(fill="both", expand=True, padx=12, pady=12)

    ttk.Label(
        layout,
        text="👤 User Profile - Dein persönliches Toobix-Erlebnis",
        font=("Segoe UI", 14, "bold")
    ).pack(anchor="w", pady=(0, 10))

    # Current User Profile Display
    profile_frame = ttk.LabelFrame(layout, text="👤 Aktuelles Profil")
    profile_frame.pack(fill="x", pady=8)

    self.profile_display_text = tk.StringVar(value="Kein Profil geladen...")
    ttk.Label(
        profile_frame,
        textvariable=self.profile_display_text,
        justify="left",
        font=("Consolas", 10)
    ).pack(anchor="w", padx=10, pady=10)

    # User Selection/Creation
    user_control_frame = ttk.Frame(layout)
    user_control_frame.pack(fill="x", pady=8)

    ttk.Label(user_control_frame, text="Name:").pack(side="left", padx=(0, 5))
    self.profile_name_entry = ttk.Entry(user_control_frame, width=25)
    self.profile_name_entry.pack(side="left", padx=5)

    ttk.Label(user_control_frame, text="Sprache:").pack(side="left", padx=(10, 5))
    self.profile_language = tk.StringVar(value="de")
    ttk.Combobox(
        user_control_frame,
        textvariable=self.profile_language,
        values=["de", "en", "es", "fr"],
        width=8,
        state="readonly"
    ).pack(side="left", padx=5)

    ttk.Button(
        user_control_frame,
        text="👤 Neues Profil erstellen",
        command=self.create_user_profile
    ).pack(side="left", padx=10)

    ttk.Button(
        user_control_frame,
        text="🔄 Profile laden",
        command=self.load_all_users
    ).pack(side="left", padx=5)

    # User Statistics
    stats_frame = ttk.LabelFrame(layout, text="📊 Deine Statistiken")
    stats_frame.pack(fill="both", expand=True, pady=8)

    self.profile_stats_display = tk.Text(stats_frame, height=8, state="disabled", wrap="word")
    stats_scroll = ttk.Scrollbar(stats_frame, command=self.profile_stats_display.yview)
    self.profile_stats_display.configure(yscrollcommand=stats_scroll.set)

    self.profile_stats_display.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
    stats_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

    # Favorite Perspectives
    persp_frame = ttk.LabelFrame(layout, text="🎭 Lieblings-Perspektiven")
    persp_frame.pack(fill="x", pady=8)

    persp_inner = ttk.Frame(persp_frame)
    persp_inner.pack(fill="x", padx=10, pady=10)

    ttk.Label(persp_inner, text="Aktuelle Favoriten:").pack(side="left", padx=(0, 5))
    self.profile_favorites_label = tk.StringVar(value="Keine ausgewählt")
    ttk.Label(
        persp_inner,
        textvariable=self.profile_favorites_label,
        font=("Segoe UI", 9)
    ).pack(side="left", padx=5)

    # Selected User ID (hidden)
    self.selected_user_id = None

    # Auto-load first user if available
    self.after(500, self.load_all_users)

  def create_user_profile(self) -> None:
    """Create a new user profile"""
    name = self.profile_name_entry.get().strip()
    if not name:
      self.profile_display_text.set("❌ Bitte gib einen Namen ein!")
      return

    self.profile_display_text.set("⏳ Erstelle Profil...")
    threading.Thread(target=self._create_user_profile, args=(name,), daemon=True).start()

  def _create_user_profile(self, name: str) -> None:
    try:
      data = {
        "name": name,
        "language": self.profile_language.get(),
        "favoritePerspectives": [],
        "theme": "auto",
        "preferences": {
          "autoLoadMemories": True,
          "defaultPerspectiveCount": 3,
          "notificationsEnabled": True,
          "emotionalResonanceTracking": True
        }
      }

      result = gateway_post("user-profile", "/users", data, timeout=3)

      if result and result.get("success"):
        user = result.get("user", {})
        self.selected_user_id = user.get("id")

        profile_text = (
            f"✅ Profil erfolgreich erstellt!\n\n"
            f"👤 Name: {user.get('name')}\n"
            f"🌐 Sprache: {user.get('language')}\n"
            f"🎨 Theme: {user.get('theme')}\n"
            f"📅 Erstellt: {user.get('createdAt', '')[:10]}"
        )

        self.after(0, lambda: self.profile_display_text.set(profile_text))
        self.after(0, lambda: self.profile_name_entry.delete(0, "end"))
        self.after(100, self.load_user_stats)
      else:
        error_msg = result.get("error", "Unbekannter Fehler") if result else "Keine Antwort"
        self.after(0, lambda: self.profile_display_text.set(f"❌ Fehler: {error_msg}"))
    except Exception as exc:
      self.after(0, lambda: self.profile_display_text.set(f"❌ Fehler: {exc}"))

  def load_all_users(self) -> None:
    """Load all user profiles"""
    self.profile_display_text.set("⏳ Lade Profile...")
    threading.Thread(target=self._load_all_users, daemon=True).start()

  def _load_all_users(self) -> None:
    try:
      result = gateway_get("user-profile", "/users", timeout=3)

      if result and result.get("success"):
        users = result.get("users", [])

        if not users:
          self.after(0, lambda: self.profile_display_text.set("ℹ️ Noch keine Profile vorhanden.\nErstelle dein erstes Profil!"))
          return

        # Select first user automatically
        first_user = users[0]
        self.selected_user_id = first_user.get("id")

        profile_text = (
            f"👤 {first_user.get('name')}\n"
            f"🌐 Sprache: {first_user.get('language')}\n"
            f"🎨 Theme: {first_user.get('theme')}\n"
            f"🎭 Favoriten: {', '.join(first_user.get('favoritePerspectives', [])) or 'Keine'}\n\n"
        )

        if len(users) > 1:
          profile_text += f"📋 {len(users)} Profile gefunden (erster wird angezeigt)"

        self.after(0, lambda: self.profile_display_text.set(profile_text))

        # Update favorites display
        favs = first_user.get('favoritePerspectives', [])
        favs_text = ', '.join(favs) if favs else "Keine ausgewählt"
        self.after(0, lambda: self.profile_favorites_label.set(favs_text))

        # Load stats
        self.after(100, self.load_user_stats)
      else:
        error_msg = result.get("error", "Unbekannter Fehler") if result else "Keine Antwort"
        self.after(0, lambda: self.profile_display_text.set(f"❌ Fehler: {error_msg}"))
    except Exception as exc:
      self.after(0, lambda: self.profile_display_text.set(f"❌ Fehler: {exc}"))

  def load_user_stats(self) -> None:
    """Load statistics for selected user"""
    if not self.selected_user_id:
      return

    threading.Thread(target=self._load_user_stats, daemon=True).start()

  def _load_user_stats(self) -> None:
    try:
      if not self.selected_user_id:
        return

      result = gateway_get("user-profile", f"/stats/{self.selected_user_id}", timeout=3)

      if result and result.get("success"):
        stats = result.get("stats", {})

        total = stats.get("totalInteractions", 0)
        avg_duration = stats.get("averageSessionDuration", 0)
        fav_time = stats.get("favoriteTimeOfDay", "Unbekannt")
        most_used = stats.get("mostUsedPerspectives", [])

        stats_text = (
            f"📊 Gesamte Interaktionen: {total}\n"
            f"⏱️ Durchschnittliche Session: {avg_duration:.1f}ms\n"
            f"🕐 Bevorzugte Tageszeit: {fav_time}\n\n"
        )

        if most_used:
          stats_text += "🎭 Meist genutzte Perspektiven:\n"
          for item in most_used[:5]:
            persp = item.get("perspective", "Unknown")
            count = item.get("count", 0)
            stats_text += f"  • {persp}: {count}x\n"
        else:
          stats_text += "ℹ️ Noch keine Perspektiven genutzt"

        self.after(0, lambda: self._update_stats_display(stats_text))
      else:
        self.after(0, lambda: self._update_stats_display("ℹ️ Noch keine Statistiken vorhanden"))
    except Exception as exc:
      self.after(0, lambda: self._update_stats_display(f"❌ Fehler: {exc}"))

  def _update_stats_display(self, text: str) -> None:
    """Update the stats display text widget"""
    self.profile_stats_display.configure(state="normal")
    self.profile_stats_display.delete("1.0", "end")
    self.profile_stats_display.insert("1.0", text)
    self.profile_stats_display.configure(state="disabled")
    self.profile_stats_display.see("1.0")

  # ----------------------- Memory Palace Tab -----------------------
  def _build_memory_tab(self, parent: ttk.Frame) -> None:
    layout = ttk.Frame(parent)
    layout.pack(fill="both", expand=True, padx=12, pady=12)

    ttk.Label(
        layout,
        text="💾 Memory Palace Browser",
        font=("Segoe UI", 14, "bold")
    ).pack(anchor="w", pady=(0, 10))

    # Filter
    filter_frame = ttk.LabelFrame(layout, text="Filter")
    filter_frame.pack(fill="x", pady=8)

    filter_row = ttk.Frame(filter_frame)
    filter_row.pack(fill="x", padx=10, pady=5)

    ttk.Label(filter_row, text="Type:").pack(side="left")
    self.memory_type = tk.StringVar(value="all")
    ttk.Radiobutton(filter_row, text="All", variable=self.memory_type, value="all").pack(side="left", padx=5)
    ttk.Radiobutton(filter_row, text="Conversations", variable=self.memory_type, value="conversation").pack(side="left", padx=5)
    ttk.Radiobutton(filter_row, text="Insights", variable=self.memory_type, value="insight").pack(side="left", padx=5)
    ttk.Radiobutton(filter_row, text="Dreams", variable=self.memory_type, value="dream").pack(side="left", padx=5)

    ttk.Button(filter_row, text="🔍 Laden", command=self.load_memories).pack(side="right", padx=5)

    # Memory-Liste
    list_frame = ttk.LabelFrame(layout, text="Erinnerungen")
    list_frame.pack(fill="both", expand=True, pady=8)

    self.memory_display = tk.Text(list_frame, state="disabled", wrap="word")
    memory_scroll = ttk.Scrollbar(list_frame, command=self.memory_display.yview)
    self.memory_display.configure(yscrollcommand=memory_scroll.set)

    self.memory_display.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
    memory_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

  def load_memories(self) -> None:
    if not self._gateway_online:
      self._append_memory_line("[Info] Gateway offline – bitte Services starten.")
      return

    self.memory_display.configure(state="normal")
    self.memory_display.delete("1.0", "end")
    self.memory_display.configure(state="disabled")

    threading.Thread(target=self._fetch_memories, daemon=True).start()

  def _fetch_memories(self) -> None:
    try:
      memory_type = self.memory_type.get()
      path = f"/memories?limit=20" if memory_type == "all" else f"/memories?type={memory_type}&limit=20"

      response = get_json(8953, path)
      memories = response.get("memories", [])

      if not memories:
        self.after(0, lambda: self._append_memory_line("Keine Erinnerungen gefunden."))
        return

      for mem in memories:
        mem_id = mem.get("id", "???")
        mem_type = mem.get("type", "???")
        content = mem.get("content", "")[:100] + "..." if len(mem.get("content", "")) > 100 else mem.get("content", "")
        timestamp = mem.get("timestamp", "???")
        valence = mem.get("emotional_valence", 0)
        source = mem.get("source", "???")

        self.after(0, lambda i=mem_id, t=mem_type, c=content, ts=timestamp, v=valence, s=source:
            self._append_memory_line(
                f"\n{'='*60}\n"
                f"ID: {i} | Type: {t} | Source: {s}\n"
                f"Time: {ts} | Valence: {v:.2f}\n"
                f"Content: {c}\n"
            ))

    except Exception as exc:
      self.after(0, lambda: self._append_memory_line(f"[Fehler] {exc}"))

  def _append_memory_line(self, text: str) -> None:
    self.memory_display.configure(state="normal")
    self.memory_display.insert("end", text + "\n")
    self.memory_display.configure(state="disabled")
    self.memory_display.see("end")

  # ----------------------- Settings Tab -----------------------
  def _build_settings_tab(self, parent: ttk.Frame) -> None:
    layout = ttk.Frame(parent)
    layout.pack(fill="both", expand=True, padx=12, pady=12)

    ttk.Label(
        layout,
        text="⚙️ Einstellungen & Performance",
        font=("Segoe UI", 14, "bold")
    ).pack(anchor="w", pady=(0, 10))

    # LLM Provider
    provider_frame = ttk.LabelFrame(layout, text="LLM Provider Konfiguration")
    provider_frame.pack(fill="x", pady=8)

    ttk.Label(
        provider_frame,
        text="Aktuell: LLM_PROVIDER wird aus .env Datei gelesen",
        font=("Consolas", 10, "italic")
    ).pack(padx=10, pady=5, anchor="w")

    ttk.Label(
        provider_frame,
        text="📝 Um den Provider zu ändern, bearbeite die .env Datei:",
        font=("Segoe UI", 10)
    ).pack(padx=10, pady=5, anchor="w")

    info_text = (
        "  • LLM_PROVIDER=groq    → Groq Cloud (schnell, empfohlen)\n"
        "  • LLM_PROVIDER=ollama  → Lokales LLM (privat, langsam)\n"
        "  • LLM_PROVIDER=auto    → Automatische Auswahl\n\n"
        "📂 Datei: C:\\Dev\\Projects\\AI\\Toobix-Unified\\.env"
    )

    info_label = ttk.Label(
        provider_frame,
        text=info_text,
        font=("Consolas", 9),
        justify="left"
    )
    info_label.pack(padx=20, pady=5, anchor="w")

    ttk.Button(
        provider_frame,
        text="📂 .env Datei öffnen",
        command=lambda: os.startfile("C:\\Dev\\Projects\\AI\\Toobix-Unified\\.env")
    ).pack(padx=10, pady=10)

    # Service Ports
    ports_frame = ttk.LabelFrame(layout, text="Service Ports")
    ports_frame.pack(fill="x", pady=8)

    ports_text = (
        f"  • Gateway Port: {GATEWAY_PORT}\n"
        f"  • Hardware Port: {HARDWARE_PORT}\n"
        f"  • Memory Palace: 8953\n"
        f"  • LLM Gateway: 8954\n"
        f"  • Event Bus: 8955\n"
        f"  • Public API: 8960"
    )

    ttk.Label(
        ports_frame,
        text=ports_text,
        font=("Consolas", 10),
        justify="left"
    ).pack(padx=20, pady=10, anchor="w")

    # Performance Stats
    perf_frame = ttk.LabelFrame(layout, text="Performance & Statistiken")
    perf_frame.pack(fill="both", expand=True, pady=8)

    self.perf_text = tk.StringVar(value="Noch keine Daten")

    ttk.Label(
        perf_frame,
        textvariable=self.perf_text,
        justify="left",
        font=("Consolas", 10)
    ).pack(anchor="w", padx=10, pady=10)

    ttk.Button(
        perf_frame,
        text="🔄 Performance Stats laden",
        command=self.load_performance_stats
    ).pack(pady=10)

    # Info
    info_frame = ttk.LabelFrame(layout, text="ℹ️ Information")
    info_frame.pack(fill="x", pady=8)

    info = (
        "Toobix Control Room v2.0\n"
        "Python GUI für Toobix-Unified\n"
        f"Refresh Interval: {REFRESH_INTERVAL_MS/1000:.1f}s\n"
        f"Base URL: {BASE_URL}"
    )

    ttk.Label(
        info_frame,
        text=info,
        font=("Consolas", 9),
        justify="left"
    ).pack(padx=20, pady=10, anchor="w")

  def load_performance_stats(self) -> None:
    threading.Thread(target=self._fetch_performance_stats, daemon=True).start()

  def _fetch_performance_stats(self) -> None:
    try:
      # LLM Gateway health
      llm_health = gateway_get("llm-gateway", "/health", timeout=3)

      # Memory Palace stats
      memory_stats = get_json(8953, "/health", timeout=3)

      stats_text = (
          "🤖 LLM Gateway:\n"
          f"  Status: {llm_health.get('status', 'unknown')}\n"
          f"  Service: {llm_health.get('service', 'N/A')}\n\n"
          "💾 Memory Palace:\n"
          f"  Status: {memory_stats.get('status', 'unknown')}\n"
          f"  Memories: {memory_stats.get('stats', {}).get('memories', 0)}\n"
          f"  Knowledge Nodes: {memory_stats.get('stats', {}).get('knowledgeNodes', 0)}\n"
          f"  Dreams: {memory_stats.get('stats', {}).get('dreams', 0)}\n"
      )

      self.after(0, lambda: self.perf_text.set(stats_text))

    except Exception as exc:
      self.after(0, lambda: self.perf_text.set(f"❌ Fehler beim Laden:\n{exc}"))


if __name__ == "__main__":
  try:
    app = ToobixGUI()
    app.refresh_status()
    app.mainloop()
  except Exception as err:  # pylint: disable=broad-except
    messagebox.showerror("Toobix Control Room", f"Unerwarteter Fehler: {err}")
