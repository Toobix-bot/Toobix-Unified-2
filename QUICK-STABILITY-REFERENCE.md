# 🎯 Quick Reference: Stabiles Arbeiten mit Toobix

## 🚀 Sofort starten (Empfohlen)

```bash
START-TOOBIX-STABLE.bat
```

**Oder in VS Code:**
- `Ctrl+Shift+P` → "Run Task" → `toobix: dev (STABLE mode)`

---

## 🎨 Service-Modi

| Modus | Services | RAM | Wofür? |
|-------|----------|-----|--------|
| **STABLE** ⭐ | 2 | ~250 MB | Tägliche Entwicklung |
| **DEV** | 5 | ~800 MB | Feature-Entwicklung |
| **FULL** | 8+ | ~1.5 GB | Tests |

---

## 🔧 Commands

```bash
# Stable Mode
START-TOOBIX-STABLE.bat

# Development Mode
START-TOOBIX-DEV.bat

# Custom Services
.\START-SELECTIVE.ps1 -Profile custom -Services @('hardware-awareness', 'emotional-core')

# Nach Crash: Kontext wiederherstellen
bun run recover-context.ts
```

---

## ⚡ VS Code Tasks

- `toobix: dev (STABLE mode)` ← Empfohlen!
- `toobix: dev (services + watch)` ← DEV mode
- `toobix: start services (STABLE/DEV/FULL)` ← Nur Services

---

## 🆘 Troubleshooting

```powershell
# Alle Services beenden
Get-Process bun -ErrorAction SilentlyContinue | Stop-Process -Force

# Port prüfen
netstat -ano | findstr ":9000"

# Prozesse anzeigen
Get-Process | Where-Object { $_.ProcessName -eq 'bun' }
```

---

📖 **Vollständige Anleitung:** Siehe `STABILITY-GUIDE.md`
