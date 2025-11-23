@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🎮 TOOBIX MINECRAFT BOT - DEMO LAUNCHER                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/4] Starting required Toobix services...
echo.

REM Start consciousness services
start "Multi-Perspective" /MIN cmd /c "cd /d %~dp0 && bun run scripts/2-services/multi-perspective-v3.ts"
timeout /t 2 /nobreak >nul

start "Decision Framework" /MIN cmd /c "cd /d %~dp0 && bun run scripts/8-conscious-decision-framework/decision-framework-server.ts"
timeout /t 2 /nobreak >nul

start "Emotional Resonance" /MIN cmd /c "cd /d %~dp0 && bun run scripts/2-services/emotional-resonance-v3.ts"
timeout /t 2 /nobreak >nul

start "Memory Palace" /MIN cmd /c "cd /d %~dp0 && bun run scripts/2-services/memory-palace.ts"
timeout /t 2 /nobreak >nul

echo ✅ Consciousness services started (minimized)
echo.

echo [2/4] Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo [3/4] Starting Minecraft Bot Service...
start "Minecraft Bot" cmd /k "cd /d %~dp0 && bun run scripts/12-minecraft/minecraft-bot-service.ts"
timeout /t 3 /nobreak >nul

echo [4/4] Opening Live Dashboard...
timeout /t 2 /nobreak >nul
start "" "%~dp0scripts\12-minecraft\dashboard.html"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ TOOBIX MINECRAFT BOT IS READY!                       ║
echo ║                                                            ║
echo ║   Live Dashboard:  scripts\12-minecraft\dashboard.html    ║
echo ║   Bot API:         http://localhost:8913                  ║
echo ║   WebSocket:       ws://localhost:8913/ws                 ║
echo ║                                                            ║
echo ║   To connect to Minecraft server:                         ║
echo ║   1. Make sure Minecraft server is running                ║
echo ║   2. Use dashboard "Connect" button                       ║
echo ║   3. Watch Toobix play with consciousness!                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
