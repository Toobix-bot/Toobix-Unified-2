@echo off
title Toobix Smart Bot
echo ========================================
echo   TOOBIX SMART BOT - Single Bot Start
echo ========================================
echo.

cd /d "%~dp0"
cd scripts\12-minecraft

echo Starting single smart bot...
echo.
bun run toobix-smart-bot.ts

pause
