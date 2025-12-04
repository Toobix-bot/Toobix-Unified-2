@echo off
echo ====================================
echo   TOOBIX TAG 1 TRAINING - NEUSTART
echo ====================================
echo.

echo [1/3] Stoppe alte Bot-Prozesse...
taskkill /f /im bun.exe 2>nul

echo [2/3] Warte kurz...
timeout /t 2 /nobreak >nul

echo [3/3] Starte neuen Tag 1 Bot...
cd /d "c:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft"
bun run toobix-simple-day1.ts

pause
