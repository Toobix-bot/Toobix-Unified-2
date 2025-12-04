@echo off
title Toobix Colony - 7 Bots
cd /d C:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft
echo.
echo ========================================
echo   TOOBIX COLONY - 7 Bots starten
echo ========================================
echo.
echo Bots:
echo   - Der Waechter (Guardian)
echo   - Der Sammler (Gatherer)  
echo   - Der Bergmann (Miner)
echo   - Der Baumeister (Builder)
echo   - Der Heiler (Healer)
echo   - Der Spaeher (Scout)
echo   - Das Bewusstsein (Mind)
echo.
echo Starte in 3 Sekunden...
timeout /t 3 /nobreak >nul

bun run toobix-colony-7.ts

pause
