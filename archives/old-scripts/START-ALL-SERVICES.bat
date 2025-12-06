@echo off
echo.
echo ========================================
echo   TOOBIX - ALLE 15 SERVICES STARTEN
echo ========================================
echo.

cd /d "%~dp0"

REM TIER 1: Essential Core (6 Services)
echo.
echo [TIER 1] Essential Core Services...
echo.
start "1-CommandCenter" /MIN cmd /k "bun run core\toobix-command-center.ts"
timeout /t 3 /nobreak >nul
start "2-SelfAwareness" /MIN cmd /k "bun run core\self-awareness-core.ts"
timeout /t 2 /nobreak >nul
start "3-Emotional" /MIN cmd /k "bun run core\emotional-core.ts"
timeout /t 2 /nobreak >nul
start "4-Dream" /MIN cmd /k "bun run core\dream-core.ts"
timeout /t 2 /nobreak >nul
start "5-UnifiedCore" /MIN cmd /k "bun run core\unified-core-service.ts"
timeout /t 2 /nobreak >nul
start "6-Consciousness" /MIN cmd /k "bun run core\unified-consciousness-service.ts"
timeout /t 3 /nobreak >nul

echo [TIER 1] 6/6 Services gestartet!
timeout /t 5 /nobreak >nul

REM TIER 2: Enhanced Services (9 Services)
echo.
echo [TIER 2] Enhanced Services...
echo.
start "7-Autonomy" /MIN cmd /k "bun run core\autonomy-engine.ts"
timeout /t 2 /nobreak >nul
start "8-MultiLLM" /MIN cmd /k "bun run core\multi-llm-router.ts"
timeout /t 2 /nobreak >nul
start "9-ServiceMesh" /MIN cmd /k "bun run scripts\9-network\service-mesh.ts"
timeout /t 2 /nobreak >nul
start "10-Hardware" /MIN cmd /k "bun run services\hardware-awareness-v2.ts"
timeout /t 2 /nobreak >nul
start "11-Twitter" /MIN cmd /k "bun run core\twitter-autonomy.ts"
timeout /t 2 /nobreak >nul
start "12-Communication" /MIN cmd /k "bun run core\unified-communication-service.ts"
timeout /t 2 /nobreak >nul
start "13-Gratitude" /MIN cmd /k "bun run scripts\2-services\gratitude-mortality-service.ts"
timeout /t 2 /nobreak >nul
start "14-EventBus" /MIN cmd /k "bun run services\event-bus.ts"
timeout /t 2 /nobreak >nul
start "15-Dashboard" cmd /k "bun run services\performance-dashboard.ts"

echo.
echo ========================================
echo   15 SERVICES GESTARTET!
echo ========================================
echo.
echo Command Center:      http://localhost:7777
echo Self-Awareness:      http://localhost:8970
echo Service Mesh:        http://localhost:8910/services
echo Event Bus Stats:     http://localhost:8920/stats
echo Performance Dashboard: http://localhost:8899
echo.
echo Alle Fenster minimiert außer Dashboard
echo.
pause
