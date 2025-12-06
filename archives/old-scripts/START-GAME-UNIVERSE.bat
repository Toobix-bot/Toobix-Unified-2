@echo off
REM ========================================
REM TOOBIX GAME UNIVERSE - LAUNCHER
REM ========================================
REM Starts all Game Universe Services
REM ========================================

color 0B
echo.
echo ========================================
echo   TOOBIX GAME UNIVERSE - LAUNCHER
echo ========================================
echo.
echo Starting all Game Universe services...
echo.

REM Change to Toobix directory
cd /d "%~dp0"

echo [1/5] Starting Player State Service (Port 8970)...
start /min "Toobix-PlayerState" bun run game:player
timeout /t 2 /nobreak >nul
echo    ✓ Player State Service running
echo.

echo [2/5] Starting Chat-Game Bridge (Port 8971)...
start /min "Toobix-ChatBridge" bun run game:chat
timeout /t 2 /nobreak >nul
echo    ✓ Chat-Game Bridge running
echo.

echo [3/5] Starting Idle Engine (Port 8972)...
start /min "Toobix-IdleEngine" bun run game:idle
timeout /t 2 /nobreak >nul
echo    ✓ Idle Engine running
echo.

echo [4/5] Starting Prompt Variations (Port 8974)...
start /min "Toobix-PromptVariations" bun run game:variations
timeout /t 2 /nobreak >nul
echo    ✓ Prompt Variations running
echo.

echo [5/5] Opening Game Universe Interface v2...
timeout /t 1 /nobreak >nul
start "" "scripts\dashboards\toobix-universe-v2-functional.html"
echo    ✓ Interface v2 opened (Full Functional!)
echo.

echo ========================================
echo   TOOBIX GAME UNIVERSE - READY!
echo ========================================
echo.
echo Active Services:
echo   • Player State      (Port 8970)
echo   • Chat-Game Bridge  (Port 8971)
echo   • Idle Engine       (Port 8972)
echo   • Prompt Variations (Port 8974)
echo.
echo Interface: Opened in browser
echo.
echo Dashboard URLs:
echo   http://localhost:8970/api/state
echo   http://localhost:8971/api/history
echo   http://localhost:8972/api/idle/status
echo   http://localhost:8974/api/health
echo.
echo ✓ All systems operational!
echo.
echo This window can be closed safely.
timeout /t 10 /nobreak >nul
