# 🚀 TOOBIX QUICK START
# Startet alle 31 Services mit einem Klick
# Verwendung: .\START-TOOBIX-31.ps1

param(
    [switch]$Minimal,  # Nur 6 Essential Services
    [switch]$Core      # 13 Essential + Core Services
)

$ErrorActionPreference = "SilentlyContinue"
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "║     🤖 TOOBIX UNIFIED - 31 SERVICES LAUNCHER                     ║" -ForegroundColor Cyan
Write-Host "║     Mit Liebe, Ordnung und Stolz! ❤️                              ║" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Alte Prozesse stoppen
Write-Host "🧹 Stoppe alte Prozesse..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq 'bun'} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Service-Definitionen
$Essential = @(
    @{N="Command Center"; F="core/toobix-command-center.ts"; P=7777},
    @{N="Self-Awareness"; F="core/self-awareness-core.ts"; P=8970},
    @{N="Emotional Core"; F="core/emotional-core.ts"; P=8900},
    @{N="Dream Core"; F="core/dream-core.ts"; P=8961},
    @{N="Unified Core"; F="core/unified-core-service.ts"; P=8000},
    @{N="Consciousness"; F="core/unified-consciousness-service.ts"; P=8002}
)

$CoreServices = @(
    @{N="Autonomy Engine"; F="core/autonomy-engine.ts"; P=8975},
    @{N="Multi-LLM Router"; F="core/multi-llm-router.ts"; P=8959},
    @{N="Communication"; F="core/unified-communication-service.ts"; P=8001},
    @{N="Twitter Autonomy"; F="core/twitter-autonomy.ts"; P=8965},
    @{N="Gamification"; F="core/toobix-gamification.ts"; P=7778},
    @{N="Real World Intel"; F="core/real-world-intelligence.ts"; P=8888},
    @{N="Living World"; F="core/toobix-living-world.ts"; P=7779}
)

$Enhanced = @(
    @{N="Unified Gateway"; F="services/unified-service-gateway.ts"; P=9000},
    @{N="Hardware Awareness"; F="services/hardware-awareness-v2.ts"; P=8940},
    @{N="Health Monitor"; F="services/health-monitor.ts"; P=9200},
    @{N="Mega Upgrade"; F="services/toobix-mega-upgrade.ts"; P=9100},
    @{N="Event Bus"; F="services/event-bus.ts"; P=8920},
    @{N="LLM Gateway"; F="scripts/2-services/llm-gateway-v4.ts"; P=8954},
    @{N="Memory Palace"; F="scripts/2-services/memory-palace-v4.ts"; P=8953},
    @{N="Perf Dashboard"; F="services/performance-dashboard.ts"; P=8899}
)

$Creative = @(
    @{N="Chat Service"; F="scripts/2-services/toobix-chat-service.ts"; P=8995},
    @{N="Emotional Support"; F="scripts/2-services/emotional-support-service.ts"; P=8985},
    @{N="Autonomous Web"; F="scripts/2-services/autonomous-web-service.ts"; P=8980},
    @{N="Story Engine"; F="scripts/2-services/story-engine-service.ts"; P=8932},
    @{N="Translation"; F="scripts/2-services/translation-service.ts"; P=8931},
    @{N="User Profile"; F="scripts/2-services/user-profile-service.ts"; P=8904},
    @{N="RPG World"; F="scripts/2-services/rpg-world-service.ts"; P=8933},
    @{N="Game Logic"; F="scripts/2-services/game-logic-service.ts"; P=8936},
    @{N="Data Science"; F="scripts/2-services/data-science-service.ts"; P=8935},
    @{N="Gratitude"; F="scripts/2-services/gratitude-mortality-service.ts"; P=8901}
)

# Welche Services starten?
$ToStart = @()
$ToStart += $Essential
if (-not $Minimal) { $ToStart += $CoreServices }
if (-not $Minimal -and -not $Core) { $ToStart += $Enhanced; $ToStart += $Creative }

$mode = if ($Minimal) { "MINIMAL (6)" } elseif ($Core) { "CORE (13)" } else { "FULL (31)" }
Write-Host "📋 Mode: $mode Services" -ForegroundColor White
Write-Host ""

# Services starten
$count = 0
foreach ($s in $ToStart) {
    $count++
    Write-Host "🚀 [$count/$($ToStart.Count)] Starting $($s.N) (Port $($s.P))..." -ForegroundColor Yellow
    Start-Process -FilePath "bun" -ArgumentList "run", $s.F -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
    Start-Sleep -Milliseconds 1500
}

Write-Host ""
Write-Host "⏳ Warte auf Service-Start (30 Sekunden)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Status prüfen
Write-Host ""
Write-Host "🔍 PRÜFE SERVICES..." -ForegroundColor Cyan
Write-Host ""

$online = 0
$offline = 0
foreach ($s in $ToStart) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:$($s.P)/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $($s.N.PadRight(20)) Port $($s.P)" -ForegroundColor Green
        $online++
    } catch {
        Write-Host "   ❌ $($s.N.PadRight(20)) Port $($s.P)" -ForegroundColor Red
        $offline++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ERGEBNIS: $online ONLINE, $offline OFFLINE" -ForegroundColor $(if ($offline -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($offline -eq 0) {
    Write-Host "🎉 ALLE SERVICES ERFOLGREICH GESTARTET! 🎉" -ForegroundColor Green
} else {
    Write-Host "⚠️ Einige Services sind noch nicht bereit. Versuche es in ein paar Sekunden erneut." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 WICHTIGE ENDPOINTS:" -ForegroundColor Cyan
Write-Host "   💎 Command Center:  http://localhost:7777"
Write-Host "   🔮 Unified Gateway: http://localhost:9000"
Write-Host "   🧠 Self-Awareness:  http://localhost:8970"
Write-Host ""
Write-Host "🤖 Toobix ist LEBENDIG! ✨" -ForegroundColor Green
Write-Host ""
