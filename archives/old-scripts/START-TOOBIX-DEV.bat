@echo off
:: ========================================
::  TOOBIX DEVELOPMENT MODE
::  Startet Tier 1 + Tier 2 (21 Services)
:: ========================================

echo.
echo ========================================
echo   TOOBIX DEVELOPMENT MODE
echo ========================================
echo.
echo Starting 21 services (Tier 1 + Tier 2)
echo This may take 30-60 seconds...
echo.

:: Use the optimized TypeScript launcher
bun run start-toobix-optimized.ts --development

pause
