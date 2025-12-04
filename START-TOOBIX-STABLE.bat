@echo off
REM ========================================
REM TOOBIX STABLE LAUNCHER
REM Minimale Services für stabile Entwicklung
REM ========================================

echo.
echo ========================================
echo   TOOBIX STABLE MODE
echo ========================================
echo.
echo Starting minimal service set for stable development...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0START-SELECTIVE.ps1" -Profile minimal

pause
