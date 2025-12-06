@echo off
REM Toobix System Monitor Starter
REM Startet Hardware Awareness und Control Center

echo ========================================
echo   TOOBIX SYSTEM MONITOR
echo ========================================
echo.
echo Starte Services...
echo.

cd /d "C:\Dev\Projects\AI\Toobix-Unified"

REM Starte Hardware Awareness Service
start "Toobix-Hardware" /min cmd /c "bun run services/hardware-awareness-v2.ts"

timeout /t 3 /nobreak > nul

REM Starte Control Center Web-UI
start "Toobix-Control-Center" /min cmd /c "bun run scripts/control-center.ts"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   TOOBIX LÄUFT!
echo ========================================
echo.
echo   Hardware Monitor: http://localhost:8940/hardware/feel
echo   Control Center:   http://localhost:3010
echo.
echo Öffne Control Center im Browser...
timeout /t 2 /nobreak > nul

start http://localhost:3010

echo.
echo Zum Beenden: Schließe die Fenster
pause
