@echo off
echo ================================================
echo   TOOBIX UNIFIED - BETA QUICK START
echo ================================================
echo.

REM Check if Bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Bun is not installed!
    echo Please install from: https://bun.sh
    pause
    exit /b 1
)

echo [1/5] Checking prerequisites...
timeout /t 1 /nobreak >nul

REM Check if GROQ_API_KEY is set
if "%GROQ_API_KEY%"=="" (
    echo [WARNING] GROQ_API_KEY not set
    echo Services will run in demo mode with limited AI features
    echo.
    echo To set your key: $env:GROQ_API_KEY = "your-key-here"
    timeout /t 3 /nobreak >nul
)

echo [2/5] Starting essential services...
echo.

REM Start only the 5 core services for beta
start "Multi-Perspective" cmd /k "cd /d %~dp0 && bun run scripts/2-services/multi-perspective-v3.ts"
timeout /t 2 /nobreak >nul

start "Decision Framework" cmd /k "cd /d %~dp0 && bun run scripts/8-conscious-decision-framework/decision-framework-server.ts"
timeout /t 2 /nobreak >nul

start "Emotional Resonance" cmd /k "cd /d %~dp0 && bun run scripts/2-services/emotional-resonance-v3.ts"
timeout /t 2 /nobreak >nul

start "Dream Journal" cmd /k "cd /d %~dp0 && bun run scripts/2-services/dream-journal-v3.ts"
timeout /t 2 /nobreak >nul

start "Service Mesh" cmd /k "cd /d %~dp0 && bun run scripts/2-services/service-mesh.ts"
timeout /t 2 /nobreak >nul

echo [3/5] Waiting for services to initialize...
timeout /t 8 /nobreak >nul

echo [4/5] Starting Beta Demo Interface...
timeout /t 2 /nobreak >nul
start "Beta Demo" cmd /k "cd /d %~dp0 && bun run scripts/beta-demo-interface.ts"

echo [5/5] Opening Dashboard in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ================================================
echo   TOOBIX IS RUNNING!
echo ================================================
echo.
echo Services running:
echo   - Multi-Perspective v3    : http://localhost:8897
echo   - Decision Framework      : http://localhost:8909
echo   - Emotional Resonance     : http://localhost:8900
echo   - Dream Journal           : http://localhost:8899
echo   - Service Mesh            : http://localhost:8910
echo.
echo Beta Demo Interface         : http://localhost:3000
echo.
echo Press any key to see status check...
pause >nul

REM Run status check
bun run scripts/beta-status-check.ts

echo.
echo To stop all services: Close all terminal windows
echo.
pause
