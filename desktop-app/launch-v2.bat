@echo off
echo.
echo ========================================
echo   TOOBIX UNIFIED V2.0 LAUNCHER
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Vite Dev Server...
start "Toobix V2 - Vite" cmd /k "npm run dev:react"

timeout /t 3 /nobreak > nul

echo [2/2] Opening Browser...
start http://localhost:5173/index-v2.html

echo.
echo ========================================
echo   V2.0 is launching!
echo.
echo   Browser will open at:
echo   http://localhost:5173/index-v2.html
echo.
echo   Close the Vite window to stop.
echo ========================================
echo.
pause
