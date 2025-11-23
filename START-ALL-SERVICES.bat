@echo off
echo.
echo ========================================
echo   TOOBIX UNIFIED SYSTEM - STARTUP
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Services...
echo.

echo 1. Hardware Awareness (Port 8940)...
start "Toobix Hardware" bun run services\hardware-awareness-v2.ts

timeout /t 2 /nobreak >nul

echo 2. Unified Gateway (Port 9000)...
start "Toobix Gateway" bun run services\unified-service-gateway.ts

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   SERVICES STARTED!
echo ========================================
echo.
echo Hardware Awareness:  http://localhost:8940
echo Unified Gateway:     http://localhost:9000
echo.
echo Available Endpoints:
echo   - GET  http://localhost:9000/dashboard
echo   - GET  http://localhost:9000/services
echo   - GET  http://localhost:9000/dreams
echo   - GET  http://localhost:9000/duality/state
echo   - POST http://localhost:9000/chat
echo   - GET  http://localhost:9000/meta/reflect
echo.
echo ========================================
echo.
echo Next: Start VS Code Extension (F5)
echo.
pause
