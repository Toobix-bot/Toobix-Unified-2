@echo off
REM ========================================
REM TOOBIX UNIFIED SERVICES LAUNCHER
REM Nur 5 Services statt 63!
REM ========================================

echo.
echo ========================================
echo   TOOBIX UNIFIED ARCHITECTURE
echo ========================================
echo.
echo Starting 5 unified services (replaces 63 services)
echo Estimated RAM: ~750MB (saves ~8GB!)
echo.

bun run start-unified-services.ts

pause
