@echo off
echo ========================================
echo   SET GROQ API KEY
echo ========================================
echo.
echo This will set your Groq API key for the Desktop App.
echo Get your key from: https://console.groq.com/keys
echo.
set /p API_KEY="Enter your Groq API Key: "

if "%API_KEY%"=="" (
    echo.
    echo [ERROR] No API key provided
    pause
    exit /b 1
)

node set-groq-key-simple.js %API_KEY%

echo.
echo ========================================
pause
