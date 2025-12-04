# ==============================================
# TOOBIX MINECRAFT CONTROL CENTER
# Meta-Bewusstsein + Eternal Colony Launcher
# ==============================================

param(
    [Parameter(Position=0)]
    [ValidateSet("Start", "Stop", "Status", "Dashboard", "Help")]
    [string]$Action = "Start",
    
    [Parameter()]
    [ValidateRange(1, 5)]
    [int]$Bots = 3,
    
    [Parameter()]
    [switch]$NoMeta,
    
    [Parameter()]
    [switch]$QuietMode
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MetaPort = 9400
$BotBasePort = 9300
$MinecraftServer = "localhost"
$MinecraftPort = 25565

# Color Functions
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Status {
    param([string]$Label, [string]$Value, [string]$Color = "Green")
    Write-Host "  [*] " -NoNewline -ForegroundColor Cyan
    Write-Host "${Label}: " -NoNewline -ForegroundColor White
    Write-Host $Value -ForegroundColor $Color
}

function Write-Step {
    param([string]$Text)
    Write-Host "  --> $Text" -ForegroundColor Magenta
}

# Check if service is running
function Test-ServiceRunning {
    param([int]$Port)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/status" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        return $true
    } catch {
        return $false
    }
}

# Start Meta-Consciousness
function Start-MetaConsciousness {
    if (-not $NoMeta) {
        Write-Step "Starting Meta-Bewusstsein (The Ueberich)..."
        
        $metaScript = Join-Path $ScriptDir "toobix-meta-consciousness.ts"
        if (Test-Path $metaScript) {
            Start-Process -FilePath "bun" -ArgumentList "run", $metaScript -WindowStyle Hidden
            Start-Sleep -Seconds 3
            
            if (Test-ServiceRunning -Port $MetaPort) {
                Write-Status "Meta-Bewusstsein" "Online at port $MetaPort" "Green"
            } else {
                Write-Status "Meta-Bewusstsein" "Starting..." "Yellow"
            }
        } else {
            Write-Status "Meta-Bewusstsein" "Script not found!" "Red"
        }
    }
}

# Start Colony Bots
function Start-ColonyBots {
    Write-Step "Starting $Bots Toobix Colony Bots..."
    
    $colonyScript = Join-Path $ScriptDir "toobix-eternal-colony.ts"
    if (Test-Path $colonyScript) {
        $env:TOOBIX_BOT_COUNT = $Bots
        Start-Process -FilePath "bun" -ArgumentList "run", $colonyScript -WindowStyle Hidden
        Start-Sleep -Seconds 5
        
        for ($i = 0; $i -lt $Bots; $i++) {
            $port = $BotBasePort + $i
            if (Test-ServiceRunning -Port $port) {
                Write-Status "Bot $i" "Online at port $port" "Green"
            } else {
                Write-Status "Bot $i" "Starting..." "Yellow"
            }
        }
    } else {
        Write-Status "Colony Script" "Not found!" "Red"
    }
}

# Stop all services
function Stop-AllServices {
    Write-Header "STOPPING TOOBIX SERVICES"
    
    Write-Step "Finding Bun processes..."
    $processes = Get-Process -Name "bun" -ErrorAction SilentlyContinue
    
    if ($processes) {
        $count = $processes.Count
        $processes | Stop-Process -Force
        Write-Status "Stopped" "$count processes" "Yellow"
    } else {
        Write-Status "Status" "No Toobix processes running" "Gray"
    }
}

# Show status
function Show-Status {
    Write-Header "TOOBIX SYSTEM STATUS"
    
    # Check Meta
    Write-Host ""
    Write-Host "  [Meta-Bewusstsein]" -ForegroundColor Magenta
    if (Test-ServiceRunning -Port $MetaPort) {
        Write-Status "Status" "ONLINE" "Green"
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:$MetaPort/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
            Write-Status "Bots Observed" "$($response.botsObserved)" "Cyan"
            Write-Status "Interventions" "$($response.totalInterventions)" "Yellow"
        } catch {}
    } else {
        Write-Status "Status" "OFFLINE" "Red"
    }
    
    # Check Bots
    Write-Host ""
    Write-Host "  [Colony Bots]" -ForegroundColor Magenta
    $onlineCount = 0
    for ($i = 0; $i -lt 5; $i++) {
        $port = $BotBasePort + $i
        if (Test-ServiceRunning -Port $port) {
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:$port/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
                $botName = $response.name
                $health = $response.health
                $task = $response.currentTask
                Write-Status $botName "Port $port | HP: $health | Task: $task" "Green"
                $onlineCount++
            } catch {
                Write-Status "Bot $i" "Port $port - Online" "Green"
                $onlineCount++
            }
        }
    }
    
    if ($onlineCount -eq 0) {
        Write-Status "Status" "No bots online" "Gray"
    }
    
    Write-Host ""
}

# Show Dashboard
function Show-Dashboard {
    Write-Header "TOOBIX LIVE DASHBOARD"
    
    Write-Host "  Press Ctrl+C to exit" -ForegroundColor Gray
    Write-Host ""
    
    while ($true) {
        Clear-Host
        Write-Header "TOOBIX LIVE DASHBOARD"
        
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "  Last Update: $timestamp" -ForegroundColor Gray
        Write-Host ""
        
        # Meta Status
        Write-Host "  --- META-BEWUSSTSEIN ---" -ForegroundColor Magenta
        if (Test-ServiceRunning -Port $MetaPort) {
            try {
                $meta = Invoke-RestMethod -Uri "http://localhost:$MetaPort/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
                Write-Status "Phase" $meta.currentPhase "Cyan"
                Write-Status "Observed" "$($meta.botsObserved) bots" "Green"
                Write-Status "Interventions" $meta.totalInterventions "Yellow"
            } catch {
                Write-Status "Status" "Connected" "Green"
            }
        } else {
            Write-Status "Status" "OFFLINE" "Red"
        }
        
        Write-Host ""
        Write-Host "  --- COLONY BOTS ---" -ForegroundColor Magenta
        
        for ($i = 0; $i -lt 5; $i++) {
            $port = $BotBasePort + $i
            if (Test-ServiceRunning -Port $port) {
                try {
                    $bot = Invoke-RestMethod -Uri "http://localhost:$port/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
                    $name = $bot.name.PadRight(12)
                    $hp = "$($bot.health)".PadLeft(3)
                    $food = "$($bot.food)".PadLeft(2)
                    $task = $bot.currentTask
                    Write-Host "    $name HP: $hp | Food: $food | $task" -ForegroundColor Green
                } catch {
                    Write-Host "    Bot $i - Online" -ForegroundColor Green
                }
            }
        }
        
        Start-Sleep -Seconds 5
    }
}

# Show Help
function Show-Help {
    Write-Header "TOOBIX MINECRAFT HELP"
    
    Write-Host "  USAGE:" -ForegroundColor Yellow
    Write-Host "    .\Start-ToobixMinecraft.ps1 [Action] [-Bots N] [-NoMeta] [-QuietMode]" -ForegroundColor White
    Write-Host ""
    
    Write-Host "  ACTIONS:" -ForegroundColor Yellow
    Write-Host "    Start     - Start Meta-Bewusstsein and Colony Bots" -ForegroundColor White
    Write-Host "    Stop      - Stop all Toobix services" -ForegroundColor White
    Write-Host "    Status    - Show current status of all services" -ForegroundColor White
    Write-Host "    Dashboard - Live updating dashboard" -ForegroundColor White
    Write-Host "    Help      - Show this help message" -ForegroundColor White
    Write-Host ""
    
    Write-Host "  OPTIONS:" -ForegroundColor Yellow
    Write-Host "    -Bots N     - Number of bots to start (1-5, default: 3)" -ForegroundColor White
    Write-Host "    -NoMeta     - Skip starting Meta-Bewusstsein" -ForegroundColor White
    Write-Host "    -QuietMode  - Minimal output" -ForegroundColor White
    Write-Host ""
    
    Write-Host "  EXAMPLES:" -ForegroundColor Yellow
    Write-Host "    .\Start-ToobixMinecraft.ps1 Start -Bots 5" -ForegroundColor Gray
    Write-Host "    .\Start-ToobixMinecraft.ps1 Status" -ForegroundColor Gray
    Write-Host "    .\Start-ToobixMinecraft.ps1 Dashboard" -ForegroundColor Gray
    Write-Host "    .\Start-ToobixMinecraft.ps1 Stop" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  PORTS:" -ForegroundColor Yellow
    Write-Host "    9400 - Meta-Bewusstsein API" -ForegroundColor White
    Write-Host "    9300 - ToobixSoul API" -ForegroundColor White
    Write-Host "    9301 - ToobixHeart API" -ForegroundColor White
    Write-Host "    9302 - ToobixMind API" -ForegroundColor White
    Write-Host "    9303 - ToobixSpirit API" -ForegroundColor White
    Write-Host "    9304 - ToobixBody API" -ForegroundColor White
    Write-Host ""
    
    Write-Host "  API ENDPOINTS:" -ForegroundColor Yellow
    Write-Host "    GET  /status  - Get service status" -ForegroundColor White
    Write-Host "    GET  /options - Get player options (Meta)" -ForegroundColor White
    Write-Host "    GET  /wisdom  - Get random wisdom (Meta)" -ForegroundColor White
    Write-Host "    POST /observe - Report bot state (Meta)" -ForegroundColor White
    Write-Host ""
}

# Main Execution
switch ($Action) {
    "Start" {
        Write-Header "STARTING TOOBIX MINECRAFT"
        
        Write-Status "Bots" $Bots "Cyan"
        Write-Status "Meta" $(if ($NoMeta) { "Disabled" } else { "Enabled" }) $(if ($NoMeta) { "Yellow" } else { "Green" })
        Write-Host ""
        
        Start-MetaConsciousness
        Start-ColonyBots
        
        Write-Host ""
        Write-Host "  [SUCCESS] Toobix World is starting!" -ForegroundColor Green
        Write-Host "  Use '.\Start-ToobixMinecraft.ps1 Status' to check" -ForegroundColor Gray
        Write-Host ""
    }
    "Stop" {
        Stop-AllServices
    }
    "Status" {
        Show-Status
    }
    "Dashboard" {
        Show-Dashboard
    }
    "Help" {
        Show-Help
    }
}
