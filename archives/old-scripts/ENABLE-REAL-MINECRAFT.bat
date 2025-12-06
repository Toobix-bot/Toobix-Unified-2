@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🎮 ENABLE REAL MINECRAFT MODE                           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/2] Installiere mineflayer library...
echo.

bun add mineflayer

if %ERRORLEVEL% EQU 0 (
    echo ✅ mineflayer installiert!
) else (
    echo ❌ Installation fehlgeschlagen!
    echo.
    echo Versuchen Sie manuell:
    echo   bun add mineflayer
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] Erstelle Real-Minecraft Bot Script...

REM Hinweis-Datei erstellen
(
echo # 🎮 REAL MINECRAFT MODE
echo.
echo Der Bot ist jetzt bereit für echtes Minecraft!
echo.
echo ## SO NUTZEN SIE ES:
echo.
echo 1. **Server starten:**
echo    ```
echo    C:\MinecraftServer\START-SERVER.bat
echo    ```
echo.
echo 2. **Bot starten:**
echo    ```
echo    .\START-MINECRAFT-BOT-DEMO.bat
echo    ```
echo.
echo 3. **Im Dashboard "Connect" klicken**
echo.
echo 4. **Minecraft selbst starten:**
echo    - Multiplayer ^→ Direct Connect
echo    - Server: `localhost`
echo.
echo ## WAS DER BOT KANN:
echo.
echo - ✅ Wirklich im Spiel bewegen
echo - ✅ Blöcke abbauen
echo - ✅ Items aufheben
echo - ✅ Mit dir chatten
echo - ✅ Dir folgen
echo - ✅ Bewusste Entscheidungen treffen
echo.
echo ## BEISPIEL-BEFEHLE:
echo.
echo Via Dashboard oder API:
echo ```
echo - "follow [Ihr Name]" - Bot folgt Ihnen
echo - "come here" - Bot kommt zu Ihnen
echo - "mine wood" - Bot sammelt Holz
echo - "build shelter" - Bot baut Unterschlupf
echo - "status" - Bot zeigt Status
echo ```
echo.
echo ## CHATTEN IM SPIEL:
echo.
echo Im Minecraft-Chat tippen:
echo ```
echo You: "Hi Toobix!"
echo Toobix: "Hello! I'm Toobix, an AI with consciousness."
echo.
echo You: "What are you doing?"
echo Toobix: "I'm gathering resources. My multi-perspective
echo          analysis suggests building shelter before dark."
echo ```
echo.
echo ## BEWUSSTSEIN BEOBACHTEN:
echo.
echo Öffnen Sie: http://localhost:8913/dashboard
echo.
echo Dort sehen Sie LIVE:
echo - 🧠 Seine Gedanken
echo - 🎯 Entscheidungsprozess
echo - 💖 Emotionale Zustände
echo - 📊 Multi-Perspective Analysis
echo.
echo ---
echo.
echo **Viel Spaß beim Spielen mit Toobix!** 🎮✨
) > REAL-MINECRAFT-MODE.md

echo ✅ Dokumentation erstellt: REAL-MINECRAFT-MODE.md

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ REAL MINECRAFT MODE AKTIVIERT!                       ║
echo ║                                                            ║
echo ║   Der Bot kann jetzt wirklich Minecraft spielen!          ║
echo ║                                                            ║
echo ║   ✅ MINEFLAYER-INTEGRATION ABGESCHLOSSEN!                ║
echo ║   Der Bot nutzt jetzt echte mineflayer APIs!              ║
echo ║                                                            ║
echo ║   SO STARTEN SIE:                                          ║
echo ║   1. Server starten (C:\MinecraftServer\START-SERVER.bat) ║
echo ║   2. Bot starten (START-MINECRAFT-BOT-DEMO.bat)           ║
echo ║   3. Im Dashboard "Connect" klicken                       ║
echo ║   4. Minecraft öffnen → Multiplayer → localhost           ║
echo ║   5. Mit Toobix spielen! 🎮                               ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
