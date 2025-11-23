@echo off
echo.
echo ========================================
echo   BUILDING TOOBIX UNIFIED V2.0
echo   Windows Desktop Application
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo [2/5] Compiling TypeScript...
call tsc
if errorlevel 1 (
    echo [ERROR] TypeScript compilation failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Building React App with Vite...
call npm run build
if errorlevel 1 (
    echo [ERROR] Vite build failed!
    pause
    exit /b 1
)

echo.
echo [4/5] Packaging with Electron Builder...
call npm run build:win
if errorlevel 1 (
    echo [ERROR] Electron build failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Build Complete!
echo.
echo ========================================
echo   SUCCESS!
echo.
echo   Your desktop app is ready:
echo   - Installer: release\Toobix Unified Setup.exe
echo   - Portable:  release\Toobix Unified.exe
echo.
echo   You can now distribute these files!
echo ========================================
echo.

pause
