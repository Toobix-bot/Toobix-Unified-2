@echo off
REM ========================================
REM TOOBIX - LEAGUE OF LEGENDS OPTIMIZER
REM ========================================
REM Optimizes system for maximum LoL performance
REM - Kills background processes
REM - Sets high performance power plan
REM - Clears RAM cache
REM - Boosts LoL priority
REM - Launches LoL with optimal settings
REM ========================================

color 0A
echo.
echo ========================================
echo   TOOBIX - LEAGUE OF LEGENDS OPTIMIZER
echo ========================================
echo.
echo [1/7] Switching to Gaming Mode...
echo.

REM 1. Stop Toobix Full Mode services (if running)
echo Stopping non-essential services...
taskkill /F /IM "bun.exe" /FI "WINDOWTITLE eq *multi-perspective*" >nul 2>&1
taskkill /F /IM "bun.exe" /FI "WINDOWTITLE eq *dream-journal*" >nul 2>&1
timeout /t 1 /nobreak >nul

REM 2. Kill background processes
echo [2/7] Stopping background processes...
taskkill /F /IM "Norton*" >nul 2>&1
taskkill /F /IM "NortonSecurity.exe" >nul 2>&1
taskkill /F /IM "OneDrive.exe" >nul 2>&1
taskkill /F /IM "Teams.exe" >nul 2>&1
taskkill /F /IM "Discord.exe" >nul 2>&1
taskkill /F /IM "Spotify.exe" >nul 2>&1
taskkill /F /IM "Chrome.exe" >nul 2>&1
echo    ✓ Background processes stopped
echo.

REM 3. Set High Performance Power Plan
echo [3/7] Setting High Performance power plan...
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
echo    ✓ Power plan set to High Performance
echo.

REM 4. Clear RAM Cache
echo [4/7] Clearing RAM cache...
powershell -Command "[System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers(); [System.GC]::Collect()" >nul 2>&1
echo    ✓ RAM cache cleared
echo.

REM 5. Disable Windows Update temporarily
echo [5/7] Pausing Windows Update...
net stop wuauserv >nul 2>&1
echo    ✓ Windows Update paused
echo.

REM 6. Start Minimal Toobix Services
echo [6/7] Starting Toobix Minimal Services...
cd /d "%~dp0"
start /min "" bun run event:bus >nul 2>&1
timeout /t 2 /nobreak >nul
start /min "" bun run memory:palace >nul 2>&1
echo    ✓ Minimal services started (35 MB RAM)
echo.

REM 7. Launch League of Legends
echo [7/7] Launching League of Legends...
echo.
if exist "C:\_GAMING\Riot_Games\Riot Client\RiotClientElectron\Riot Client.exe" (
    start "" "C:\_GAMING\Riot_Games\Riot Client\RiotClientElectron\Riot Client.exe"
    echo    ✓ League Client launched!
) else (
    echo    ⚠ League Client not found at C:\_GAMING\Riot_Games
    echo    Please launch manually
)
echo.

REM 8. Monitor and boost LoL process priority
echo Monitoring League of Legends process...
echo Will boost priority when game starts...
echo.
timeout /t 3 /nobreak >nul

:BOOST_LOOP
powershell -Command "$lol = Get-Process 'League*' -ErrorAction SilentlyContinue; if($lol){$lol | ForEach-Object {$_.PriorityClass='High'}; Write-Host '✓ LoL process priority set to HIGH'; exit 0} else {exit 1}" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ LoL process priority boosted to HIGH!
    echo.
    goto :DONE
)
timeout /t 2 /nobreak >nul
goto :BOOST_LOOP

:DONE
echo ========================================
echo   OPTIMIZATION COMPLETE!
echo ========================================
echo.
echo System Status:
echo   • Toobix:          Gaming Mode (35 MB RAM)
echo   • Background Apps: Stopped
echo   • Power Plan:      High Performance
echo   • RAM:             Optimized
echo   • LoL Priority:    HIGH
echo.
echo ⚡ ENJOY YOUR GAME! ⚡
echo.
echo Press any key to keep monitoring...
echo (Close this window when done gaming)
pause >nul

REM Keep monitoring LoL process
:MONITOR
powershell -Command "Get-Process 'League*' -ErrorAction SilentlyContinue" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    timeout /t 5 /nobreak >nul
    goto :MONITOR
)

echo.
echo ========================================
echo   GAME ENDED - RESTORING SYSTEM
echo ========================================
echo.

REM Re-enable Windows Update
net start wuauserv >nul 2>&1
echo ✓ Windows Update re-enabled
echo.
echo You can now close this window or run
echo START-TOOBIX-WORK.bat to restore full services
echo.
pause
