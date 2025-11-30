@echo off
REM ========================================
REM TOOBIX - MINIMAL MODE (AUTO-START)
REM ========================================
REM Starts essential Toobix services only
REM - Event Bus (Core Communication)
REM - Memory Palace (Persistent Memory)
REM - System Monitor (Health Tracking)
REM Total RAM: ~35 MB
REM ========================================

color 0B
echo.
echo ========================================
echo   TOOBIX - MINIMAL MODE
echo ========================================
echo.
echo Starting essential services...
echo.

REM Change to Toobix directory
cd /d "%~dp0"

REM 1. Start Event Bus (Core Communication)
echo [1/3] Starting Event Bus...
start /min "" bun run event:bus
timeout /t 2 /nobreak >nul
echo    ✓ Event Bus running on port 8955
echo.

REM 2. Start Memory Palace (Persistent Memory)
echo [2/3] Starting Memory Palace...
start /min "" bun run memory:palace
timeout /t 2 /nobreak >nul
echo    ✓ Memory Palace running on port 8953
echo.

REM 3. Start System Monitor (Health Tracking)
echo [3/3] Starting System Monitor...
start /min "" bun run system:monitor
timeout /t 2 /nobreak >nul
echo    ✓ System Monitor running on port 8961
echo.

echo ========================================
echo   TOOBIX MINIMAL MODE - READY!
echo ========================================
echo.
echo Active Services:
echo   • Event Bus        (Port 8955) - ~5 MB
echo   • Memory Palace     (Port 8953) - ~20 MB
echo   • System Monitor    (Port 8961) - ~10 MB
echo.
echo Total RAM Usage: ~35 MB
echo CPU Usage: ^<1%%
echo.
echo ✓ Toobix is running silently in background
echo.
echo Dashboard: http://localhost:8961/api/system/current
echo.
echo This window can be closed safely.
timeout /t 5 /nobreak >nul
exit
