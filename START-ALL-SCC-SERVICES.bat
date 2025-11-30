@echo off
echo.
echo ================================================================
echo   TOOBIX SYSTEM CONTROL CENTER - FULL STACK
echo   Starting all services...
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting System Monitor (Port 8961)...
start "Toobix System Monitor" cmd /k "bun run scripts/2-services/system-monitor-v1.ts"

timeout /t 2 /nobreak > nul

echo [2/3] Starting File Analysis (Port 8962)...
start "Toobix File Analysis" cmd /k "bun run scripts/2-services/file-analysis-v1.ts"

timeout /t 2 /nobreak > nul

echo [3/3] Starting Auto-Cleanup Engine (Port 8963)...
start "Toobix Auto-Cleanup" cmd /k "bun run scripts/system-cleanup/auto-cleanup-v1.ts"

timeout /t 3 /nobreak > nul

echo.
echo Opening Dashboard...
start "" "scripts\dashboards\system-control-center.html"

echo.
echo ================================================================
echo   ALL SERVICES STARTED!
echo ================================================================
echo.
echo   System Monitor:   http://localhost:8961
echo   File Analysis:    http://localhost:8962
echo   Auto-Cleanup:     http://localhost:8963
echo   Dashboard:        Opening...
echo.
echo   Press any key to exit...
echo ================================================================
pause > nul
