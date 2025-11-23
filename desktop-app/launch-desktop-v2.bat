@echo off
echo.
echo ========================================
echo   TOOBIX UNIFIED V2.0 DESKTOP APP
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Checking dependencies...
if not exist "node_modules" (
    echo [WARN] Dependencies not found. Installing...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo [INFO] Compiling TypeScript...
call tsc
if errorlevel 1 (
    echo [WARN] TypeScript compilation had warnings, continuing...
)

echo.
echo [INFO] Starting Toobix Unified Desktop App V2.0...
echo.
echo   - Vite Dev Server will start on port 5173
echo   - Electron window will open automatically
echo   - Loading: V2.0 Enhanced UI
echo.
echo   Press Ctrl+C to stop all processes
echo.
echo ========================================
echo.

REM Start both Vite and Electron
npm run dev

pause
