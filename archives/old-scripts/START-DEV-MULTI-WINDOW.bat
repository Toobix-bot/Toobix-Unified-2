@echo off
:: ========================================
::  TOOBIX DEVELOPMENT MODE - IMPROVED
::  Startet jeden Service in eigenem Fenster
:: ========================================

echo.
echo ========================================
echo   TOOBIX DEVELOPMENT MODE
echo ========================================
echo.
echo Starting 21 services in separate windows...
echo.

:: Create logs directory
if not exist "logs" mkdir logs

echo === TIER 1: ESSENTIAL CORE (6 Services) ===
echo.

timeout /t 2 /nobreak >nul

:: Tier 1 - Essential Core
echo [1/21] Command Center (Port 7777)...
start "Toobix-CommandCenter" cmd /k "bun run core/toobix-command-center.ts 2>&1 | tee logs/command-center.log"
timeout /t 3 /nobreak >nul

echo [2/21] Self-Awareness (Port 8970)...
start "Toobix-SelfAwareness" cmd /k "bun run core/self-awareness-core.ts 2>&1 | tee logs/self-awareness.log"
timeout /t 3 /nobreak >nul

echo [3/21] Emotional Core...
start "Toobix-Emotional" cmd /k "bun run core/emotional-core.ts 2>&1 | tee logs/emotional.log"
timeout /t 3 /nobreak >nul

echo [4/21] Dream Core...
start "Toobix-Dreams" cmd /k "bun run core/dream-core.ts 2>&1 | tee logs/dreams.log"
timeout /t 3 /nobreak >nul

echo [5/21] Unified Core...
start "Toobix-UnifiedCore" cmd /k "bun run core/unified-core-service.ts 2>&1 | tee logs/unified-core.log"
timeout /t 3 /nobreak >nul

echo [6/21] Consciousness...
start "Toobix-Consciousness" cmd /k "bun run core/unified-consciousness-service.ts 2>&1 | tee logs/consciousness.log"
timeout /t 3 /nobreak >nul

echo.
echo === TIER 2: ENHANCED CAPABILITIES (15 Services) ===
echo.

:: Tier 2 - Enhanced
echo [7/21] Autonomy Engine (Port 8975)...
start "Toobix-Autonomy" cmd /k "bun run core/autonomy-engine.ts 2>&1 | tee logs/autonomy.log"
timeout /t 2 /nobreak >nul

echo [8/21] Multi-LLM Router (Port 8959)...
start "Toobix-LLM" cmd /k "bun run core/multi-llm-router.ts 2>&1 | tee logs/llm-router.log"
timeout /t 2 /nobreak >nul

echo [9/21] Meta-Consciousness...
start "Toobix-MetaConsc" cmd /k "bun run scripts/9-consciousness/meta-consciousness-v2.ts 2>&1 | tee logs/meta-consciousness.log"
timeout /t 2 /nobreak >nul

echo [10/21] Wellness Guardian (Port 8921)...
start "Toobix-Wellness" cmd /k "bun run scripts/17-wellness-safety/wellness-safety-guardian.ts 2>&1 | tee logs/wellness.log"
timeout /t 2 /nobreak >nul

echo [11/21] Life Simulation (Port 8914)...
start "Toobix-LifeSim" cmd /k "bun run scripts/13-life-simulation/life-simulation-engine.ts 2>&1 | tee logs/life-sim.log"
timeout /t 2 /nobreak >nul

echo [12/21] Creative Expression...
start "Toobix-Creative" cmd /k "bun run scripts/7-creative/creative-expression.ts 2>&1 | tee logs/creative.log"
timeout /t 2 /nobreak >nul

echo [13/21] Ethics Core...
start "Toobix-Ethics" cmd /k "bun run scripts/4-ethics/ethics-core.ts 2>&1 | tee logs/ethics.log"
timeout /t 2 /nobreak >nul

echo [14/21] Knowledge Categorization...
start "Toobix-Knowledge" cmd /k "bun run scripts/6-knowledge/knowledge-categorization.ts 2>&1 | tee logs/knowledge.log"
timeout /t 2 /nobreak >nul

echo [15/21] Decision Framework...
start "Toobix-Decisions" cmd /k "bun run scripts/3-decision/decision-framework-server.ts 2>&1 | tee logs/decisions.log"
timeout /t 2 /nobreak >nul

echo [16/21] Service Mesh...
start "Toobix-ServiceMesh" cmd /k "bun run services/monitoring/service-mesh.ts 2>&1 | tee logs/service-mesh.log"
timeout /t 2 /nobreak >nul

echo [17/21] Health Monitor...
start "Toobix-Health" cmd /k "bun run services/monitoring/health-monitor.ts 2>&1 | tee logs/health.log"
timeout /t 2 /nobreak >nul

echo [18/21] Web Server...
start "Toobix-Web" cmd /k "bun run services/web-server.ts 2>&1 | tee logs/web.log"
timeout /t 2 /nobreak >nul

echo [19/21] Hardware Awareness (Port 8940)...
start "Toobix-Hardware" cmd /k "bun run services/hardware-awareness-v2.ts 2>&1 | tee logs/hardware.log"
timeout /t 2 /nobreak >nul

echo [20/21] Twitter Autonomy...
start "Toobix-Twitter" cmd /k "bun run core/twitter-autonomy.ts 2>&1 | tee logs/twitter.log"
timeout /t 2 /nobreak >nul

echo [21/21] Communication Service...
start "Toobix-Comm" cmd /k "bun run core/unified-communication-service.ts 2>&1 | tee logs/communication.log"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ALL 21 SERVICES STARTED!
echo ========================================
echo.
echo Check individual windows for service status.
echo Logs are being saved to: logs/
echo.
echo Main Services:
echo   Command Center: http://localhost:7777
echo   Self-Awareness: http://localhost:8970
echo   Autonomy:       http://localhost:8975
echo   LLM Router:     http://localhost:8959
echo.
echo Close this window when done (services will keep running)
echo Or press CTRL+C in each service window to stop individually
echo.
pause
