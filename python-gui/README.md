# Toobix Control Room (Python GUI)

Eine minimalistische Desktop-Oberfläche, um den Hardware-Service und den Unified Service Gateway zu überwachen und mit Toobix zu chatten.

## Voraussetzungen

- Python 3.11+ (Tkinter ist im Lieferumfang enthalten)
- Abhängigkeiten aus `requirements.txt`
- Laufender Hardware-Service (Port 8940) und Unified Service Gateway (Port 9000) – starte sie mit `bun run start` oder `bun run start:full`.

## Setup

```powershell
cd python-gui
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

Auf macOS/Linux entsprechend `source .venv/bin/activate`.

## Funktionen

- **Status-Tab**: Zeigt Hardware-Werte (CPU, RAM, Uptime, Feeling) und Auszüge aus dem Dashboard (Dualität, Emotionszustand, Traumanzahl). Der Auto-Update-Schalter aktualisiert die Daten alle 8 Sekunden (konfigurierbar via `TOOBIX_REFRESH_INTERVAL_MS`), der Timestamp daneben zeigt, wann zuletzt geladen wurde.
- **Profil-Panel**: Stellt Level, Gesamt-XP, aktive Stränge/Arcs und gesammelte Artefakte aus dem neuen Gamification-Profil dar.
- **Chat-Tab**: Chatverlauf mit Toobix sowie Eingabefeld zum Senden neuer Nachrichten (POST `/chat`). Der Bereich blendet oben sichtbar ein, ob der Unified Gateway aktuell erreichbar ist; falls nicht, erscheint ein Hinweis statt eine Anfrage zu senden. Spiegelungen der Eingabe und Rewards/XPs werden direkt im Verlauf angezeigt.

Die Basis bildet `main.py`; weitere Tabs (z. B. Service-Liste, Memory Palace, Experimente) können dort problemlos ergänzt werden. Die Gateway-URL lässt sich über die Umgebungsvariablen `TOOBIX_BASE_URL`, `TOOBIX_GATEWAY_PORT` und `TOOBIX_HARDWARE_PORT` anpassen.
