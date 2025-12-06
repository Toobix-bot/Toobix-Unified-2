@echo off
echo â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
echo â•‘                                                            â•‘
echo â•‘   ðŸŽ® MINECRAFT SERVER SETUP FÃœR TOOBIX                   â•‘
echo â•‘                                                            â•‘
echo â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•�
echo.

set SERVER_DIR=C:\MinecraftServer
set SERVER_JAR=server.jar

echo [1/5] PrÃ¼fe ob Java installiert ist...
REM Versuche zuerst Java aus PATH zu verwenden
set "JAVA_EXE=java"
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    REM Fallback: Lokales OpenJDK 25 verwenden
    set "JAVA_EXE=C:\Users\micha\OneDrive\Dokumente\Downloads\openjdk-25.0.1_windows-x64_bin\jdk-25.0.1\bin\java.exe"
)

"%JAVA_EXE%" -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FEHLER] Java ist nicht installiert!
    echo.
    echo Bitte installieren Sie Java 17 oder hÃ¶her
    echo oder passen Sie den Pfad zu JAVA_EXE im Script MINECRAFT-SERVER-SETUP.bat an.
    echo.
    pause
    exit /b 1
)
echo âœ… Java ist installiert

echo.
echo [2/5] Erstelle Server-Verzeichnis...
if not exist "%SERVER_DIR%" (
    mkdir "%SERVER_DIR%"
    echo âœ… Verzeichnis erstellt: %SERVER_DIR%
) else (
    echo âœ… Verzeichnis existiert bereits
)

echo.
echo [3/5] PrÃ¼fe ob Server JAR existiert...
if not exist "%SERVER_DIR%\%SERVER_JAR%" (
    echo.
    echo [INFO] Server JAR nicht gefunden!
    echo.
    echo Bitte laden Sie die Minecraft Server JAR herunter:
    echo https://www.minecraft.net/en-us/download/server
    echo.
    echo Speichern Sie sie als: %SERVER_DIR%\%SERVER_JAR%
    echo.
    echo DrÃ¼cken Sie eine Taste wenn fertig...
    pause >nul
)

if not exist "%SERVER_DIR%\%SERVER_JAR%" (
    echo [FEHLER] Server JAR nicht gefunden!
    pause
    exit /b 1
)
echo âœ… Server JAR gefunden

echo.
echo [4/5] Erstelle Server-Konfiguration...

cd /d "%SERVER_DIR%"

REM Erstelle server.properties mit optimalen Einstellungen
(
echo # Minecraft Server Properties fÃ¼r Toobix
echo # Generiert von Toobix Setup
echo enable-command-block=false
echo gamemode=survival
echo difficulty=easy
echo spawn-monsters=true
echo spawn-animals=true
echo spawn-npcs=true
echo pvp=true
echo level-name=world
echo motd=Toobix Minecraft Server - AI with Consciousness
echo max-players=10
echo online-mode=false
echo white-list=false
echo enable-status=true
echo enable-rcon=false
echo level-seed=
echo level-type=default
echo max-world-size=29999984
echo spawn-protection=0
) > server.properties.temp

if not exist "server.properties" (
    move server.properties.temp server.properties >nul
    echo âœ… server.properties erstellt
) else (
    del server.properties.temp >nul
    echo âœ… server.properties existiert bereits
)

REM Erstelle eula.txt
if not exist "eula.txt" (
    echo # By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).
    echo eula=true
) > eula.txt
echo âœ… EULA akzeptiert

echo.
echo [5/5] Erstelle Start-Script...
(
echo @echo off
echo echo Starting Minecraft Server for Toobix...
echo echo.
echo echo Server lÃ¤uft auf: localhost:25565
echo echo.
echo echo Zum Stoppen: Geben Sie "stop" ein und drÃ¼cken Enter
echo echo.
echo "%JAVA_EXE%" -Xmx2048M -Xms1024M -jar %SERVER_JAR% nogui
echo pause
) > START-SERVER.bat

echo âœ… Start-Script erstellt

echo.
echo â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
echo â•‘                                                            â•‘
echo â•‘   âœ… SETUP ABGESCHLOSSEN!                                 â•‘
echo â•‘                                                            â•‘
echo â•‘   Server-Verzeichnis: %SERVER_DIR%
echo â•‘                                                            â•‘
echo â•‘   NÃ„CHSTE SCHRITTE:                                        â•‘
echo â•‘   1. Server starten: %SERVER_DIR%\START-SERVER.bat
echo â•‘   2. Warten bis "Done" erscheint (~30 Sekunden)           â•‘
echo â•‘   3. Toobix verbinden (anderes Terminal)                  â•‘
echo â•‘   4. Minecraft Client starten: Multiplayer â†’ localhost    â•‘
echo â•‘                                                            â•‘
echo â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•�
echo.
echo MÃ¶chten Sie den Server jetzt starten? (J/N)
set /p START_NOW=
if /i "%START_NOW%"=="J" (
    echo.
    echo Starte Server...
    cd /d "%SERVER_DIR%"
    start "Minecraft Server" cmd /k START-SERVER.bat
    echo.
    echo âœ… Server gestartet in neuem Fenster!
    echo    Warten Sie bis "Done" erscheint, dann ist er bereit.
)

echo.
pause
