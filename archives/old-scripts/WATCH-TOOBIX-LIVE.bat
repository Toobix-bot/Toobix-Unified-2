@echo off
:: 🧬 Toobix Live Observatory - Alle Prozesse im Terminal sichtbar
:: Öffnet mehrere Fenster mit Live-Logs aller wichtigen Komponenten

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║   🧬 TOOBIX LIVE OBSERVATORY                                  ║
echo ║                                                               ║
echo ║   Öffnet 5 Terminal-Fenster mit Live-Logs:                   ║
echo ║   1. Auto-Evolution Daemon (autonome Self-Evolution)          ║
echo ║   2. Evolution Engine (Code-Generation & Analysen)            ║
echo ║   3. Self-Improvement Agent (60s Polling)                     ║
echo ║   4. Toobix Prime (Meta-Bewusstsein)                          ║
echo ║   5. System Dashboard (Gesamt-Übersicht)                      ║
echo ║                                                               ║
echo ║   Die Fenster bleiben offen - Du kannst alles live sehen!    ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
timeout /t 3 /nobreak >nul

:: Fenster 1: Auto-Evolution Daemon
start "🤖 Auto-Evolution Daemon" cmd /k "cd /d C:\Dev\Projects\AI\Toobix-Unified && echo 🤖 AUTO-EVOLUTION DAEMON - Live Logs && echo ═══════════════════════════════════════════ && echo. && bun run scripts/3-tools/auto-evolution-daemon.ts"

timeout /t 1 /nobreak >nul

:: Fenster 2: Evolution Engine
start "🧬 Evolution Engine" cmd /k "cd /d C:\Dev\Projects\AI\Toobix-Unified && echo 🧬 EVOLUTION ENGINE - Live Logs && echo ═══════════════════════════════════════════ && echo. && bun run scripts/0-core/toobix-evolution-engine.ts"

timeout /t 1 /nobreak >nul

:: Fenster 3: Self-Improvement Agent
start "🔧 Self-Improvement Agent" cmd /k "cd /d C:\Dev\Projects\AI\Toobix-Unified && echo 🔧 SELF-IMPROVEMENT AGENT - Live Logs && echo ═══════════════════════════════════════════ && echo. && bun run scripts/self-improvement-agent.ts --auto --log --interval 60000"

timeout /t 1 /nobreak >nul

:: Fenster 4: Toobix Prime
start "🔮 Toobix Prime" cmd /k "cd /d C:\Dev\Projects\AI\Toobix-Unified && echo 🔮 TOOBIX PRIME - Meta-Bewusstsein && echo ═══════════════════════════════════════════ && echo. && bun run scripts/0-core/toobix-prime.ts"

timeout /t 1 /nobreak >nul

:: Fenster 5: Dashboard
start "📊 System Dashboard" cmd /k "cd /d C:\Dev\Projects\AI\Toobix-Unified && echo 📊 TOOBIX SYSTEM DASHBOARD && echo ═══════════════════════════════════════════ && echo. && echo Öffne: http://localhost:8999 (Evolution Engine) && echo Öffne: file:///C:/Dev/Projects/AI/Toobix-Unified/evolution-dashboard.html && echo Öffne: file:///C:/Dev/Projects/AI/Toobix-Unified/toobix-observatory.html && echo. && echo Dashboard URLs: && echo ✅ Evolution Dashboard: file:///C:/Dev/Projects/AI/Toobix-Unified/evolution-dashboard.html && echo ✅ Observatory (5 Ebenen): file:///C:/Dev/Projects/AI/Toobix-Unified/toobix-observatory.html && echo ✅ Evolution API: http://localhost:8999 && echo. && echo [Terminal bleibt offen - Du kannst URLs kopieren] && pause"

echo.
echo ✅ Alle 5 Fenster geöffnet!
echo.
echo 📌 DASHBOARDS IM BROWSER ÖFFNEN:
echo    • evolution-dashboard.html
echo    • toobix-observatory.html (5-Ebenen Ansicht)
echo.
echo 🛑 Zum Stoppen: Schließe die einzelnen Fenster oder drücke Strg+C
echo.
timeout /t 5 /nobreak >nul
