@echo off
REM Doppelklick: öffnet zwei Fenster
REM 1) PowerShell lokal im Repo
REM 2) PowerShell mit SSH in Termux

set "REPO=C:\Dev\Projects\AI\Toobix-Unified"
set "HOST=10.126.0.92"
set "PORT=8022"
set "USER=u0_a806"
set "KEY=%USERPROFILE%\.ssh\id_ed25519"
set "REMOTE_DIR=/data/data/com.termux/files/home/toobix/Toobix-Unified-2"

REM Lokales Fenster im Repo
start "Toobix Local" powershell -NoExit -Command "cd \"%REPO%\""

REM SSH-Fenster zum Handy (Key-Login empfohlen; sonst -i Teil entfernen)
start "Toobix Termux" powershell -NoExit -Command "ssh -t -p %PORT% -i `"%KEY%`" %USER%@%HOST% \"cd %REMOTE_DIR% && exec \$SHELL\""
