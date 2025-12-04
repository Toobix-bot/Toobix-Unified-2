@echo off
title Toobix Day One Bot
echo ========================================
echo   TOOBIX DAY ONE BOT
echo ========================================
echo.
echo Strukturierter erster Minecraft-Tag
echo.

cd /d "%~dp0"
cd scripts\12-minecraft

echo Starte Bot...
bun run toobix-day-one.ts

pause
