@echo off
REM ========================================
REM TOOBIX - AUTO-START SETUP
REM ========================================
REM Adds Toobix Minimal Mode to Windows Startup
REM Requires Administrator privileges
REM ========================================

echo.
echo ========================================
echo   TOOBIX AUTO-START SETUP
echo ========================================
echo.
echo This will add Toobix Minimal Mode to Windows Startup
echo Toobix will start automatically when you boot your PC
echo.
echo Required: Administrator privileges
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

REM Get full path to START-TOOBIX-MINIMAL.bat
set "TOOBIX_PATH=%~dp0START-TOOBIX-MINIMAL.bat"

echo Adding to Windows Startup Registry...
echo Path: %TOOBIX_PATH%
echo.

REM Add to HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Toobix" /t REG_SZ /d "\"%TOOBIX_PATH%\"" /f >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCCESS!
    echo.
    echo Toobix Minimal Mode has been added to Windows Startup
    echo.
    echo On next boot, Toobix will start automatically with:
    echo   • Event Bus (Port 8955)
    echo   • Memory Palace (Port 8953)
    echo   • System Monitor (Port 8961)
    echo.
    echo Total startup impact: ~35 MB RAM, ^<1%% CPU
    echo.
    echo To remove from startup, run REMOVE-AUTO-START.bat
    echo.
) else (
    echo ❌ ERROR: Failed to add registry entry
    echo.
    echo Please check permissions and try again
    echo.
)

pause
