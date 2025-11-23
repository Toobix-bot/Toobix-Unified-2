@echo off
echo ========================================
echo   TOOBIX SYSTEM TEST SCRIPT
echo ========================================
echo.
echo This script will:
echo 1. Start the Game Engine service
echo 2. Wait for it to be healthy
echo 3. Make a test request
echo.

cd /d "C:\Dev\Projects\AI\Toobix-Unified"

echo [INFO] Starting Game Engine Service (Port 8896)...
start "Toobix-GameEngine" cmd /k "bun run scripts/2-services/self-evolving-game-engine.ts"

echo [INFO] Waiting 5 seconds for service to start...
timeout /t 5 /nobreak >nul

echo [INFO] Testing health endpoint...
curl http://localhost:8896/health

echo.
echo ========================================
echo   Service started! You can now:
echo   - Open Desktop App and check dashboard
echo   - Try starting/stopping from UI
echo   - Test the service endpoints
echo.
echo   To stop: Close the Game Engine window
echo ========================================
pause
