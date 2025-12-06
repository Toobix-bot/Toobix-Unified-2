@echo off
REM ========================================
REM TOOBIX - REMOVE AUTO-START
REM ========================================
REM Removes Toobix from Windows Startup
REM Requires Administrator privileges
REM ========================================

echo.
echo ========================================
echo   TOOBIX REMOVE AUTO-START
echo ========================================
echo.
echo This will remove Toobix from Windows Startup
echo.
pause
echo.

REM Check for admin rights
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Administrator privileges required!
    echo.
    echo Please right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Removing from Windows Startup Registry...
echo.

REM Remove from HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Toobix" /f >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCCESS!
    echo.
    echo Toobix has been removed from Windows Startup
    echo.
    echo Toobix will no longer start automatically on boot
    echo.
    echo You can still start Toobix manually with:
    echo   • START-TOOBIX-MINIMAL.bat
    echo   • START-TOOBIX-FULL.bat
    echo   • START-LOL-OPTIMIZED.bat
    echo.
) else (
    echo ⚠ Toobix was not found in startup registry
    echo (Maybe already removed?)
    echo.
)

pause
