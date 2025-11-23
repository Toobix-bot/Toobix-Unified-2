import json
import os
import threading
import tkinter as tk
from datetime import datetime
from tkinter import messagebox, ttk

import requests

BASE_URL = os.environ.get("TOOBIX_BASE_URL", "http://localhost")
GATEWAY_PORT = int(os.environ.get("TOOBIX_GATEWAY_PORT", "9000"))
HARDWARE_PORT = int(os.environ.get("TOOBIX_HARDWARE_PORT", "8940"))
REFRESH_INTERVAL_MS = int(os.environ.get("TOOBIX_REFRESH_INTERVAL_MS", "8000"))
API_KEY = os.environ.get("TOOBIX_API_KEY", "").strip()


def build_url(port: int, path: str) -> str:
  return f"{BASE_URL}:{port}{path}"


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

    notebook.add(status_tab, text="Status")
    notebook.add(chat_tab, text="Chat")

    self._build_status_tab(status_tab)
    self._build_chat_tab(chat_tab)

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


if __name__ == "__main__":
  try:
    app = ToobixGUI()
    app.refresh_status()
    app.mainloop()
  except Exception as err:  # pylint: disable=broad-except
    messagebox.showerror("Toobix Control Room", f"Unerwarteter Fehler: {err}")
