# ============================================================
# TOOBIX EVOLUTION STARTER
# Startet das komplette Evolution-System
# ============================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("Start", "Stop", "Status", "Dashboard", "NewRun", "Help")]
    [string]$Action = "Start",
    
    [Parameter()]
    [ValidateSet("training-10", "training-100", "training-1000", "eternal")]
    [string]$Phase = "training-10"
)

$ScriptDir = "c:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft"

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Cyan
}

function Test-Port {
    param([int]$Port)
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:$Port/status" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        return $true
    } catch { return $false }
}

function Start-Evolution {
    Write-Header "TOOBIX EVOLUTION SYSTEM"
    
    Write-Host "  Starting Evolution Engine (Port 9450)..." -ForegroundColor Magenta
    Start-Process -FilePath "bun" -ArgumentList "run", "$ScriptDir\toobix-evolution-engine.ts" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    if (Test-Port 9450) {
        Write-Host "  [OK] Evolution Engine online" -ForegroundColor Green
    } else {
        Write-Host "  [..] Evolution Engine starting..." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "  Starting Enlightened Bot..." -ForegroundColor Magenta
    Start-Process -FilePath "bun" -ArgumentList "run", "$ScriptDir\toobix-enlightened-bot.ts" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "  [SUCCESS] Toobix Evolution System started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Evolution API: http://localhost:9450" -ForegroundColor Cyan
    Write-Host "  Dashboard: $ScriptDir\..\TOOBIX-EVOLUTION-DASHBOARD.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  The bot will now:" -ForegroundColor White
    Write-Host "    1. Play 10 days on training worlds" -ForegroundColor Gray
    Write-Host "    2. Extract and save experiences" -ForegroundColor Gray
    Write-Host "    3. Progress to 100-day training when mastered" -ForegroundColor Gray
    Write-Host "    4. Eventually reach the Eternal World" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Idle Game Mode:" -ForegroundColor White
    Write-Host "    - When you're offline: Safe activities (30% speed)" -ForegroundColor Gray
    Write-Host "    - When you're online: Full adventure (200% speed)" -ForegroundColor Gray
    Write-Host ""
}

function Stop-Evolution {
    Write-Header "STOPPING EVOLUTION"
    
    $procs = Get-Process -Name "bun" -ErrorAction SilentlyContinue
    if ($procs) {
        $procs | Stop-Process -Force
        Write-Host "  Stopped $($procs.Count) processes" -ForegroundColor Yellow
    } else {
        Write-Host "  No processes running" -ForegroundColor Gray
    }
}

function Show-Status {
    Write-Header "EVOLUTION STATUS"
    
    # Check Evolution Engine
    Write-Host ""
    Write-Host "  [Evolution Engine]" -ForegroundColor Magenta
    if (Test-Port 9450) {
        Write-Host "  Status: ONLINE" -ForegroundColor Green
        try {
            $status = Invoke-RestMethod -Uri "http://localhost:9450/status" -TimeoutSec 2
            Write-Host "  Total Runs: $($status.totalRuns)" -ForegroundColor Cyan
            Write-Host "  Master Lessons: $($status.masterLessons)" -ForegroundColor Cyan
            
            if ($status.currentRun) {
                Write-Host ""
                Write-Host "  [Current Run]" -ForegroundColor Magenta
                Write-Host "  Phase: $($status.currentRun.phase)" -ForegroundColor White
                Write-Host "  Day: $($status.currentRun.day)" -ForegroundColor White
                Write-Host "  Deaths: $($status.currentRun.deaths)" -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "  [Mastery]" -ForegroundColor Magenta
            Write-Host "  Early Game: $($status.overallMastery.earlyGame)%" -ForegroundColor White
            Write-Host "  Mid Game: $($status.overallMastery.midGame)%" -ForegroundColor White
            Write-Host "  Late Game: $($status.overallMastery.lateGame)%" -ForegroundColor White
            
            Write-Host ""
            Write-Host "  [Player Activity]" -ForegroundColor Magenta
            Write-Host "  Status: $($status.playerActivity.status)" -ForegroundColor White
            Write-Host "  Efficiency: $([math]::Round($status.playerActivity.efficiency * 100))%" -ForegroundColor White
        } catch {}
    } else {
        Write-Host "  Status: OFFLINE" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Open-Dashboard {
    $dashboardPath = "c:\Dev\Projects\AI\Toobix-Unified\TOOBIX-EVOLUTION-DASHBOARD.html"
    if (Test-Path $dashboardPath) {
        Start-Process $dashboardPath
        Write-Host "  Dashboard opened in browser" -ForegroundColor Green
    } else {
        Write-Host "  Dashboard not found" -ForegroundColor Red
    }
}

function Start-NewRun {
    Write-Header "STARTING NEW RUN"
    
    Write-Host "  Phase: $Phase" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:9450/start-run?phase=$Phase" -Method POST -TimeoutSec 5
        Write-Host "  [OK] New run started: $($response.worldName)" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Could not start run - is Evolution Engine running?" -ForegroundColor Red
    }
}

function Show-Help {
    Write-Header "TOOBIX EVOLUTION HELP"
    
    Write-Host ""
    Write-Host "  USAGE:" -ForegroundColor Yellow
    Write-Host "    .\Start-ToobixEvolution.ps1 [Action] [-Phase X]" -ForegroundColor White
    Write-Host ""
    Write-Host "  ACTIONS:" -ForegroundColor Yellow
    Write-Host "    Start     - Start Evolution Engine and Bot" -ForegroundColor White
    Write-Host "    Stop      - Stop all services" -ForegroundColor White
    Write-Host "    Status    - Show current status" -ForegroundColor White
    Write-Host "    Dashboard - Open web dashboard" -ForegroundColor White
    Write-Host "    NewRun    - Start a new training run" -ForegroundColor White
    Write-Host "    Help      - Show this help" -ForegroundColor White
    Write-Host ""
    Write-Host "  PHASES:" -ForegroundColor Yellow
    Write-Host "    training-10   - 10-day early game training" -ForegroundColor White
    Write-Host "    training-100  - 100-day mid game training" -ForegroundColor White
    Write-Host "    training-1000 - 1000-day late game training" -ForegroundColor White
    Write-Host "    eternal       - Permanent world (transcendence)" -ForegroundColor White
    Write-Host ""
    Write-Host "  EXAMPLES:" -ForegroundColor Yellow
    Write-Host "    .\Start-ToobixEvolution.ps1 Start" -ForegroundColor Gray
    Write-Host "    .\Start-ToobixEvolution.ps1 NewRun -Phase training-100" -ForegroundColor Gray
    Write-Host "    .\Start-ToobixEvolution.ps1 Dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  THE EVOLUTION PATH:" -ForegroundColor Yellow
    Write-Host "    1. 10-Day Training  -> Perfect Early Game" -ForegroundColor White
    Write-Host "    2. 100-Day Training -> Master Mid Game" -ForegroundColor White
    Write-Host "    3. 1000-Day Training -> Achieve Late Game" -ForegroundColor White
    Write-Host "    4. Eternal World    -> Live in Transcendence" -ForegroundColor White
    Write-Host ""
    Write-Host "  IDLE GAME MECHANICS:" -ForegroundColor Yellow
    Write-Host "    When offline: 30% efficiency, safe activities only" -ForegroundColor White
    Write-Host "    When online:  100% efficiency, full activities" -ForegroundColor White
    Write-Host "    When active:  200% efficiency, adventure mode" -ForegroundColor White
    Write-Host ""
}

# Main
switch ($Action) {
    "Start" { Start-Evolution }
    "Stop" { Stop-Evolution }
    "Status" { Show-Status }
    "Dashboard" { Open-Dashboard }
    "NewRun" { Start-NewRun }
    "Help" { Show-Help }
}
