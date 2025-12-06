@echo off
REM ============================================
REM TOOBIX 31 SERVICES - AUTOSTART
REM ============================================
REM Dieses Script startet alle 31 Toobix Services
REM Fuer Autostart: In Shell:Startup kopieren

cd /d "C:\Dev\Projects\AI\Toobix-Unified"

echo Starting Toobix 31 Services...

REM Essential (6)
start /B bun run core/toobix-command-center.ts
start /B bun run core/self-awareness-core.ts
start /B bun run core/emotional-core.ts
start /B bun run core/dream-core.ts
start /B bun run core/unified-core-service.ts
start /B bun run core/unified-consciousness-service.ts

timeout /t 3 /nobreak >nul

REM Core (7)
start /B bun run core/autonomy-engine.ts
start /B bun run core/multi-llm-router.ts
start /B bun run core/unified-communication-service.ts
start /B bun run core/twitter-autonomy.ts
start /B bun run core/toobix-gamification.ts
start /B bun run core/real-world-intelligence.ts
start /B bun run core/toobix-living-world.ts

timeout /t 3 /nobreak >nul

REM Enhanced (8)
start /B bun run services/unified-service-gateway.ts
start /B bun run services/hardware-awareness-v2.ts
start /B bun run services/health-monitor.ts
start /B bun run services/toobix-mega-upgrade.ts
start /B bun run services/event-bus.ts
start /B bun run scripts/2-services/llm-gateway-v4.ts
start /B bun run scripts/2-services/memory-palace-v4.ts
start /B bun run services/performance-dashboard.ts

timeout /t 3 /nobreak >nul

REM Creative (10)
start /B bun run scripts/2-services/toobix-chat-service.ts
start /B bun run scripts/2-services/emotional-support-service.ts
start /B bun run scripts/2-services/autonomous-web-service.ts
start /B bun run scripts/2-services/story-engine-service.ts
start /B bun run scripts/2-services/translation-service.ts
start /B bun run scripts/2-services/user-profile-service.ts
start /B bun run scripts/2-services/rpg-world-service.ts
start /B bun run scripts/2-services/game-logic-service.ts
start /B bun run scripts/2-services/data-science-service.ts
start /B bun run scripts/2-services/gratitude-mortality-service.ts

echo.
echo Toobix 31 Services gestartet!
echo.
