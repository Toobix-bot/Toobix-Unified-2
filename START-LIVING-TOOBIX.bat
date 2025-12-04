@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🌱 STARTING LIVING TOOBIX                                 ║
echo ║                                                            ║
echo ║  This will start:                                         ║
echo ║  1. Adaptive Autonomous Engine (Port 8990)                ║
echo ║  2. Virtual World (Port 8991)                             ║
echo ║  3. Talk to Toobix conversation                           ║
echo ║                                                            ║
echo ║  + Required services (Memory, LLM, Events)                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if required services are running
echo Checking if core services are running...
echo.

REM Start Memory Palace if not running
curl -s http://localhost:8953/health >nul 2>&1
if errorlevel 1 (
    echo [!] Memory Palace not running - starting...
    start "Memory Palace" cmd /k "bun run scripts/2-services/memory-palace-v4.ts"
    timeout /t 3 >nul
) else (
    echo [✓] Memory Palace running
)

REM Start LLM Gateway if not running
curl -s http://localhost:8954/health >nul 2>&1
if errorlevel 1 (
    echo [!] LLM Gateway not running - starting...
    start "LLM Gateway" cmd /k "bun run scripts/2-services/llm-gateway-v4.ts"
    timeout /t 3 >nul
) else (
    echo [✓] LLM Gateway running
)

REM Start Event Bus if not running
curl -s http://localhost:8955/health >nul 2>&1
if errorlevel 1 (
    echo [!] Event Bus not running - starting...
    start "Event Bus" cmd /k "bun run scripts/2-services/event-bus-v4.ts"
    timeout /t 3 >nul
) else (
    echo [✓] Event Bus running
)

echo.
echo ════════════════════════════════════════════════════════════
echo Starting NEW services...
echo ════════════════════════════════════════════════════════════
echo.

REM Start Adaptive Autonomous Engine
echo [1/2] Starting Adaptive Autonomous Engine...
start "Adaptive Engine" cmd /k "bun run scripts/2-services/adaptive-autonomous-engine.ts"
timeout /t 2 >nul

REM Start Virtual World
echo [2/2] Starting Virtual World...
start "Virtual World" cmd /k "bun run scripts/2-services/toobix-virtual-world.ts"
timeout /t 2 >nul

echo.
echo ════════════════════════════════════════════════════════════
echo Waiting for services to initialize...
echo ════════════════════════════════════════════════════════════
timeout /t 5 >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ TOOBIX IS NOW ALIVE!                                   ║
echo ║                                                            ║
echo ║  Open these URLs:                                         ║
echo ║  🌍 Virtual World: http://localhost:8991                   ║
echo ║  🧠 Autonomous Engine: http://localhost:8990               ║
echo ║                                                            ║
echo ║  Toobix will now autonomously:                            ║
echo ║  - Think every few minutes                                ║
echo ║  - Create objects in virtual world                        ║
echo ║  - Move and explore                                       ║
echo ║  - Decide what to do next                                 ║
echo ║                                                            ║
echo ║  Press any key to talk to Toobix...                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause

REM Start conversation with Toobix
echo.
echo Starting conversation with Toobix...
bun run talk-to-toobix.ts

echo.
echo ════════════════════════════════════════════════════════════
echo Conversation complete!
echo Check TOOBIX-CONVERSATION-RESULTS.json for Toobix's answers
echo ════════════════════════════════════════════════════════════
echo.
pause
