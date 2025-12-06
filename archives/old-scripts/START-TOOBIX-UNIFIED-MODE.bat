@echo off
REM ========================================
REM TOOBIX UNIFIED MODE
REM 5 consolidated services - Best of both worlds
REM ========================================

echo.
echo ========================================
echo   TOOBIX UNIFIED MODE
echo ========================================
echo.
echo Starting 5 unified services...
echo   - Core (emotions, dreams, awareness, LLM, autonomy)
echo   - Communication (chat, life-domains, proactive)
echo   - Consciousness (meta, perspectives, stream)
echo   - Memory (memory palace unified)
echo   - Gateway (service mesh)
echo.
echo Estimated RAM: ~600MB (saves ~8.8GB!)
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0START-SELECTIVE.ps1" -Profile unified

pause
