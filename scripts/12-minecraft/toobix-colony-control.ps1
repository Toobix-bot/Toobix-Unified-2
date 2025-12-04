# TOOBIX MINECRAFT COLONY CONTROL CENTER
# Zentrale Steuerung fuer die Toobix Minecraft Kolonie

param(
    [Parameter(Position=0)]
    [string]$Action = "status",
    
    [Parameter(Position=1)]
    [int]$BotCount = 3
)

$ErrorActionPreference = "SilentlyContinue"

function Show-Banner {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "     TOOBIX MINECRAFT COLONY - Control Center" -ForegroundColor Cyan
    Write-Host "     Eine persistente, lernende Minecraft-Gesellschaft" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Get-BunProcesses {
    return Get-Process bun -ErrorAction SilentlyContinue
}

function Show-Status {
    $procs = Get-BunProcesses
    $count = 0
    $totalMem = 0
    if ($procs) {
        $count = ($procs | Measure-Object).Count
        $totalMem = ($procs | Measure-Object WorkingSet64 -Sum).Sum / 1MB
    }
    
    Write-Host "SYSTEM STATUS" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor DarkGray
    Write-Host "   Aktive bun Prozesse: $count" -ForegroundColor White
    Write-Host "   Speicherverbrauch: $([math]::Round($totalMem,1)) MB" -ForegroundColor White
    
    # Check specific ports
    $ports = @(9300, 9301, 9302, 9303, 9304)
    $botNames = @("ToobixSoul", "ToobixHeart", "ToobixMind", "ToobixSpirit", "ToobixBody")
    
    Write-Host ""
    Write-Host "BOT STATUS" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor DarkGray
    
    for ($i = 0; $i -lt $ports.Count; $i++) {
        $port = $ports[$i]
        $name = $botNames[$i]
        
        try {
            $response = Invoke-RestMethod "http://localhost:$port/status" -TimeoutSec 2
            Write-Host "   $name : ONLINE - $($response.currentTask)" -ForegroundColor Green
        } catch {
            Write-Host "   $name : OFFLINE" -ForegroundColor Red
        }
    }
    
    # Check for memory file
    $memoryFile = "c:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft\toobix-colony-memory.json"
    if (Test-Path $memoryFile) {
        $memory = Get-Content $memoryFile | ConvertFrom-Json
        Write-Host ""
        Write-Host "PERSISTENTES GEDAECHTNIS" -ForegroundColor Yellow
        Write-Host "=======================================" -ForegroundColor DarkGray
        Write-Host "   Sessions: $($memory.sessionsCount)" -ForegroundColor White
        Write-Host "   Spielzeit: $($memory.totalPlaytimeMinutes) Minuten" -ForegroundColor White
        Write-Host "   Phase: $($memory.colonyProgress.phase)" -ForegroundColor White
    }
    
    Write-Host ""
}

function Stop-Colony {
    Write-Host "Stoppe alle Toobix Prozesse..." -ForegroundColor Yellow
    
    $procs = Get-BunProcesses
    $count = 0
    if ($procs) {
        $count = ($procs | Measure-Object).Count
    }
    
    if ($count -gt 0) {
        Stop-Process -Name bun -Force -ErrorAction SilentlyContinue
        Write-Host "   $count Prozesse beendet" -ForegroundColor Green
    } else {
        Write-Host "   Keine aktiven Prozesse gefunden" -ForegroundColor Gray
    }
}

function Start-Colony {
    param([int]$Count = 3)
    
    Write-Host "Starte Toobix Kolonie mit $Count Bots..." -ForegroundColor Yellow
    
    # First stop any existing processes
    Stop-Colony
    Start-Sleep -Seconds 2
    
    # Start the colony
    Write-Host "   Starte Eternal Colony..." -ForegroundColor Cyan
    
    $env:BOT_COUNT = $Count
    $env:MC_HOST = "localhost"
    $env:MC_PORT = "25565"
    
    Start-Process -FilePath "bun" -ArgumentList "run", "./toobix-eternal-colony.ts" -WorkingDirectory "c:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft" -NoNewWindow
    
    Write-Host "   Colony gestartet!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Warte auf Bot-Initialisierung..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
    
    Show-Status
}

function Clean-AllProcesses {
    Write-Host "VOLLSTAENDIGE BEREINIGUNG" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor DarkGray
    
    Stop-Colony
    
    Write-Host "   System bereinigt!" -ForegroundColor Green
    Write-Host ""
}

# Main execution
Show-Banner

switch ($Action) {
    "start" { Start-Colony -Count $BotCount }
    "stop" { Stop-Colony }
    "status" { Show-Status }
    "clean" { Clean-AllProcesses }
    "restart" { Start-Colony -Count $BotCount }
    default { Show-Status }
}

Write-Host "VERWENDUNG:" -ForegroundColor DarkGray
Write-Host "   .\toobix-colony-control.ps1 status    - Status anzeigen" -ForegroundColor DarkGray
Write-Host "   .\toobix-colony-control.ps1 start 3   - Mit 3 Bots starten" -ForegroundColor DarkGray
Write-Host "   .\toobix-colony-control.ps1 stop      - Alle Bots stoppen" -ForegroundColor DarkGray
Write-Host "   .\toobix-colony-control.ps1 clean     - Bereinigung" -ForegroundColor DarkGray
Write-Host ""
Write-Host "EMPFEHLUNG: 3 Bots fuer normale PCs, 5 Bots fuer starke PCs" -ForegroundColor DarkGray
Write-Host ""
