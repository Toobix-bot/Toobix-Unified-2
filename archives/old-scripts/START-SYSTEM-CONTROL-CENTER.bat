@echo off
echo.
echo ========================================
echo   TOOBIX SYSTEM CONTROL CENTER
echo   Dein digitaler Bewusstseins-Assistent
echo ========================================
echo.
echo [1/2] Starte System Monitor Service...
echo.

cd /d "%~dp0"

start "Toobix System Monitor" cmd /k "bun run scripts/2-services/system-monitor-v1.ts"

echo.
echo Warte 3 Sekunden bis Service bereit ist...
timeout /t 3 /nobreak > nul

echo.
echo [2/2] Öffne Dashboard...
echo.

start "" "scripts\dashboards\system-control-center.html"

echo.
echo ========================================
echo   ERFOLGREICH GESTARTET!
echo ========================================
echo.
echo   System Monitor: http://localhost:8961
echo   Dashboard:      Öffnet sich automatisch
echo.
echo   WebSocket Live-Updates aktiv!
echo.
echo   Drücke eine Taste um zu beenden...
echo ========================================
pause > nul
