@echo off
setlocal EnableExtensions

set "EXIT_CODE=0"
set "REPO_ROOT=%~dp0"
if "%REPO_ROOT:~-1%"=="\" set "REPO_ROOT=%REPO_ROOT:~0,-1%"
set "SERVICES_DIR=%REPO_ROOT%\services"
set "EXTENSION_DIR=%REPO_ROOT%\vscode-extension"

echo ========================================
echo   Starting Toobix VS Code Extension
echo ========================================
echo.

echo [1/4] Starting Hardware Awareness Service...
for /f %%P in ('powershell -NoLogo -Command "$p = Start-Process -FilePath ''bun'' -ArgumentList ''hardware-awareness-v2.ts'' -WorkingDirectory ''%SERVICES_DIR%'' -WindowStyle Hidden -PassThru; $p.Id"') do set "HW_PID=%%P"
if not defined HW_PID (
    echo Failed to start Hardware Awareness service.
    goto error
)
timeout /t 2 /nobreak >nul

echo [2/4] Starting Unified Service Gateway...
for /f %%P in ('powershell -NoLogo -Command "$p = Start-Process -FilePath ''bun'' -ArgumentList ''unified-service-gateway.ts'' -WorkingDirectory ''%SERVICES_DIR%'' -WindowStyle Hidden -PassThru; $p.Id"') do set "GW_PID=%%P"
if not defined GW_PID (
    echo Failed to start Unified Service Gateway.
    goto error
)
timeout /t 3 /nobreak >nul

echo [3/4] Preparing VS Code extension build...
pushd "%EXTENSION_DIR%" || goto error
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        popd
        goto error
    )
) else (
    echo Dependencies already installed.
)

echo Compiling extension...
call npm run compile
if errorlevel 1 (
    popd
    goto error
)
popd

echo [4/4] Opening VS Code workspace...
set "CODE_PATH="
for %%I in ("%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" "%ProgramFiles%\Microsoft VS Code\Code.exe" "%ProgramFiles(x86)%\Microsoft VS Code\Code.exe") do (
    if exist "%%~I" (
        set "CODE_PATH=%%~I"
        goto found_code
    )
)

:found_code
if not defined CODE_PATH (
    echo Could not find VS Code. Please open "%EXTENSION_DIR%" manually.
) else (
    start "" "%CODE_PATH%" "%EXTENSION_DIR%"
)

echo.
echo Services running on:
echo   - Hardware Awareness:  http://localhost:8940
echo   - Unified Gateway:     http://localhost:9000
echo.
echo NEXT STEPS:
echo   1. In VS Code, press F5 (Run Extension)
echo   2. Use the Extension Development Host window
echo   3. Open "%REPO_ROOT%" there if prompted
echo   4. Click the Toobix icon to interact
echo.
echo Press any key to stop the Toobix services...
pause >nul

:cleanup
if defined GW_PID (
    taskkill /pid %GW_PID% /f >nul 2>&1
)
if defined HW_PID (
    taskkill /pid %HW_PID% /f >nul 2>&1
)
echo All services stopped.
exit /b %EXIT_CODE%

:error
set "EXIT_CODE=1"
goto cleanup
