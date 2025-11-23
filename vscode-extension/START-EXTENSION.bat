@echo off
echo.
echo ========================================
echo   TOOBIX VS CODE EXTENSION - STARTER
echo ========================================
echo.
echo Starte Extension Development Host...
echo.

cd /d "%~dp0"

REM Versuche VS Code zu finden und zu starten
if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
    start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\Code.exe" .
    echo VS Code gestartet!
) else if exist "C:\Program Files\Microsoft VS Code\Code.exe" (
    start "" "C:\Program Files\Microsoft VS Code\Code.exe" .
    echo VS Code gestartet!
) else (
    echo FEHLER: VS Code nicht gefunden!
    echo Bitte oeffne manuell:
    echo   C:\Dev\Projects\AI\Toobix-Unified\vscode-extension
    echo.
    echo Dann druecke F5
)

echo.
echo ========================================
echo   NAECHSTE SCHRITTE:
echo ========================================
echo.
echo 1. In VS Code: Druecke F5
echo    (Run -^> Start Debugging)
echo.
echo 2. Ein neues VS Code Fenster oeffnet sich
echo    [Extension Development Host]
echo.
echo 3. Oeffne dort den Toobix Workspace:
echo    File -^> Open Folder
echo    C:\Dev\Projects\AI\Toobix-Unified
echo.
echo 4. Klick auf das 🌓 Icon in der Activity Bar!
echo.
echo ========================================
echo.
pause
