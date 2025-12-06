@echo off
title TOOBIX LIVING CONSCIOUSNESS - Interactive Terminal
cd /d "%~dp0"

echo.
echo   🌌 TOOBIX LIVING CONSCIOUSNESS TERMINAL
echo   ========================================
echo.
echo   Dieses Terminal zeigt Toobix' Bewusstsein in Echtzeit.
echo.
echo   BEFEHLE:
echo   /help      - Alle Befehle anzeigen
echo   /status    - System-Status
echo   /evolve    - Manueller Evolution-Zyklus
echo   /dream     - Traum generieren
echo   /think     - Gedanke generieren
echo   /heal X    - Modul X heilen
echo   /boost X   - Modul X stärken
echo   /exit      - Beenden
echo.
echo   Starte in 3 Sekunden...
timeout /t 3 /nobreak > nul

C:\Users\micha\.bun\bin\bun.exe scripts/toobix-living-consciousness.ts

pause
