@echo off
title Minecraft Server Einstellungen für Toobix

echo ========================================
echo   MINECRAFT SERVER EINSTELLUNGEN
echo ========================================
echo.
echo Diese Einstellungen optimieren den Server für Toobix:
echo.
echo 1. server.properties Anpassungen:
echo    - keepInventory = true     (Inventar behalten nach Tod)
echo    - bonus-chest = true       (Bonustruhe beim Spawn)
echo    - spawn-protection = 0     (Bot kann am Spawn bauen)
echo    - difficulty = normal      (Normale Schwierigkeit)
echo    - max-tick-time = 60000    (Mehr Zeit für Server)
echo.
echo 2. Koordinaten aktivieren (optional):
echo    /gamerule reducedDebugInfo false
echo.
echo 3. Inventar behalten:
echo    /gamerule keepInventory true
echo.
echo 4. Mob Griefing aus (optional):
echo    /gamerule mobGriefing false
echo.

:: Prüfe ob wir im richtigen Verzeichnis sind
if exist "C:\MinecraftServer\server.properties" (
    echo Minecraft Server gefunden in C:\MinecraftServer
    
    :: Backup erstellen
    copy "C:\MinecraftServer\server.properties" "C:\MinecraftServer\server.properties.backup" >nul 2>&1
    echo Backup erstellt: server.properties.backup
    
    echo.
    echo Moechtest du die Einstellungen automatisch anwenden? [J/N]
    set /p choice="> "
    
    if /i "%choice%"=="J" (
        echo Wende Einstellungen an...
        
        powershell -Command "(Get-Content 'C:\MinecraftServer\server.properties') -replace 'keep-inventory=false', 'keep-inventory=true' | Set-Content 'C:\MinecraftServer\server.properties'"
        powershell -Command "(Get-Content 'C:\MinecraftServer\server.properties') -replace 'spawn-protection=16', 'spawn-protection=0' | Set-Content 'C:\MinecraftServer\server.properties'"
        
        echo.
        echo Einstellungen angewendet!
        echo WICHTIG: Server muss neu gestartet werden!
    )
) else (
    echo Minecraft Server nicht in C:\MinecraftServer gefunden.
    echo Bitte passe server.properties manuell an.
)

echo.
echo ========================================
echo   GAMERULES (im Spiel ausfuehren)
echo ========================================
echo.
echo /gamerule keepInventory true
echo /gamerule doDaylightCycle true
echo /gamerule doWeatherCycle true
echo /gamerule mobGriefing false
echo /gamerule showDeathMessages true
echo.
echo ========================================

pause
