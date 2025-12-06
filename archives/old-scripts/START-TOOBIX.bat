@echo off
REM ========================================
REM   TOOBIX SERVICE STARTER
REM   Starte alle Services im Development Mode
REM ========================================

echo.
echo ========================================
echo   TOOBIX SERVICE STARTER
echo ========================================
echo.
echo Starte alle 16 Services...
echo.

cd /d "%~dp0"

REM Stoppe alte Prozesse
echo [1/3] Stoppe alte Bun-Prozesse...
taskkill /F /IM bun.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Starte Services...
echo.

REM Starte Services
start "Toobix Services" /MIN bun run start-toobix-optimized.ts --development

echo [3/3] Warte 30 Sekunden auf Service-Start...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   PRÜFE SERVICE STATUS
echo ========================================
echo.

REM Prüfe Ports
for %%p in (7777 8970 8900 8961 8000 8002 8975 8959 8921 8914 8910 8940 8965 8001 8896 7779) do (
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:%%p' -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop | Out-Null; Write-Host '   [OK] Port %%p ONLINE' -ForegroundColor Green } catch { Write-Host '   [--] Port %%p offline' -ForegroundColor DarkGray }"
)

echo.
echo ========================================
echo   FERTIG!
echo ========================================
echo.
echo Services laufen im Hintergrund.
echo Zum Stoppen: Ctrl+C im Service-Fenster
echo             oder taskkill /F /IM bun.exe
echo.
pause
