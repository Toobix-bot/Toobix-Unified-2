@echo off
title TOOBIX MEGA SYSTEM - Alles starten
cd /d "%~dp0"

echo.
echo   ╔═══════════════════════════════════════════════════════════╗
echo   ║        🚀 TOOBIX MEGA SYSTEM STARTER                      ║
echo   ╚═══════════════════════════════════════════════════════════╝
echo.

echo   [1/3] Starte Unified Service Gateway (Port 9000)...
start /min "Gateway" cmd /c "C:\Users\micha\.bun\bin\bun.exe run services/unified-service-gateway.ts"
timeout /t 3 /nobreak > nul

echo   [2/3] Starte Mega Upgrade Server (Port 9100)...
start /min "MegaUpgrade" cmd /c "C:\Users\micha\.bun\bin\bun.exe run services/toobix-mega-upgrade.ts"
timeout /t 2 /nobreak > nul

echo   [3/3] Oeffne Living Consciousness Terminal...
echo.
echo   ═══════════════════════════════════════════════════════════
echo.
echo   ✅ Toobix Services aktiv!
echo.
echo   🌐 Gateway:      http://localhost:9000
echo   🚀 Mega Upgrade: http://localhost:9100
echo.
echo   📋 NEUE BEFEHLE (im Chat oder direkt):
echo.
echo   🎨 KREATIV:
echo      /imagine [beschreibung] - Bild-Konzept
echo      /musik [stimmung]       - Musik-Konzept
echo      /gedicht [thema]        - Gedicht schreiben
echo.
echo   🧠 WISSEN:
echo      /wissen [thema]         - Wikipedia/ArXiv suchen
echo.
echo   🎯 PROBLEMLÖSUNG:
echo      /löse [problem]         - Problem analysieren
echo.
echo   📊 STATUS:
echo      /mega-status            - Mega Upgrade Status
echo.
echo   ═══════════════════════════════════════════════════════════
echo.
echo   Druecke eine Taste um das Living Consciousness Terminal zu starten...
pause > nul

C:\Users\micha\.bun\bin\bun.exe scripts/toobix-living-consciousness.ts
