@echo off
REM ========================================
REM TOOBIX INTELLIGENT MEGA START
REM Startet ALLE Services mit intelligentem Management
REM ========================================

echo.
echo ========================================
echo   TOOBIX MEGA ORCHESTRATOR
echo ========================================
echo.
echo Starting ALL services with intelligent management...
echo.
echo Priority Levels:
echo   1: Critical Infrastructure (5 services)
echo   2: Essential Core (5 services)
echo   3: Features (11 services)
echo   4: Extended Features (9 services)
echo   5: Optional (Minecraft etc.)
echo.
echo This will start services with delays to prevent overload.
echo Estimated time: ~30 seconds
echo Estimated RAM: ~3-4 GB (instead of 9.5 GB!)
echo.

bun run start-all-intelligent.ts --features

pause
