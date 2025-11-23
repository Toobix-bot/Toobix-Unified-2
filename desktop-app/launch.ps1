# 🚀 TOOBIX UNIFIED - DESKTOP APP LAUNCHER
# Startet die Desktop App mit allen Services

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║          🌟 TOOBIX UNIFIED DESKTOP LAUNCHER 🌟           ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$appDir = "C:\Dev\Projects\AI\Toobix-Unified\desktop-app"
$projectRoot = "C:\Dev\Projects\AI\Toobix-Unified"

# Check if Vite is running
Write-Host "🔍 Checking Vite Dev Server..." -ForegroundColor Yellow
$viteRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    $viteRunning = $true
    Write-Host "   ✓ Vite läuft bereits auf Port 5173" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Vite läuft nicht" -ForegroundColor Red
}

# Check services
Write-Host ""
Write-Host "📡 Checking Services..." -ForegroundColor Yellow

$services = @(
    @{ Name = "Game Engine"; Port = 8896 },
    @{ Name = "Multi-Perspective"; Port = 8897 },
    @{ Name = "Dream Journal"; Port = 8899 },
    @{ Name = "Emotional Resonance"; Port = 8900 },
    @{ Name = "Gratitude & Mortality"; Port = 8901 },
    @{ Name = "Creator-AI"; Port = 8902 },
    @{ Name = "Memory Palace"; Port = 8903 },
    @{ Name = "Meta-Consciousness"; Port = 8904 },
    @{ Name = "Dashboard Server"; Port = 8905 },
    @{ Name = "Analytics"; Port = 8906 },
    @{ Name = "Voice Interface"; Port = 8907 },
    @{ Name = "Decision Framework"; Port = 8909 },
    @{ Name = "Service Mesh"; Port = 8910 }
)

$runningServices = 0
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host "   ✓ $($service.Name) (Port $($service.Port))" -ForegroundColor Green
        $runningServices++
    } catch {
        Write-Host "   ✗ $($service.Name) (Port $($service.Port))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Status: $runningServices / $($services.Count) Services running" -ForegroundColor $(if ($runningServices -gt 10) { "Green" } else { "Yellow" })

# Check Groq API Key
Write-Host ""
Write-Host "🔑 Checking Groq API Key..." -ForegroundColor Yellow
$configFile = "$env:APPDATA\toobix-unified-config\config.json"
$hasGroqKey = $false

if (Test-Path $configFile) {
    try {
        $config = Get-Content $configFile | ConvertFrom-Json
        if ($config.groq_api_key -and $config.groq_api_key.Length -gt 0) {
            Write-Host "   ✓ Groq API Key konfiguriert" -ForegroundColor Green
            $hasGroqKey = $true
        } else {
            Write-Host "   ✗ Groq API Key nicht gesetzt" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ✗ Config konnte nicht gelesen werden" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ Groq API Key nicht gesetzt" -ForegroundColor Red
}

if (-not $hasGroqKey) {
    Write-Host ""
    Write-Host "💡 Tipp: Führe './setup-groq-key.ps1' aus, um den Groq API Key zu setzen" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Start Vite if not running
if (-not $viteRunning) {
    Write-Host "🚀 Starting Vite Dev Server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$appDir'; npm run dev:react" -WindowStyle Minimized
    Write-Host "   Warte 3 Sekunden..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
}

# Compile TypeScript
Write-Host ""
Write-Host "⚙️  Compiling TypeScript..." -ForegroundColor Cyan
Set-Location $appDir
& ".\node_modules\.bin\tsc.exe" -p tsconfig.electron.json
Write-Host "   ✓ TypeScript compiled" -ForegroundColor Green

# Start Electron
Write-Host ""
Write-Host "🎨 Starting Electron App..." -ForegroundColor Cyan
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✓ Desktop App wird gestartet!                          ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   Features:                                                ║" -ForegroundColor Green
Write-Host "║   • Dashboard: Übersicht über alle Services               ║" -ForegroundColor Green
Write-Host "║   • Services: Start/Stop einzelne Services                ║" -ForegroundColor Green
Write-Host "║   • Chat: AI Conversation mit Groq/Mixtral                ║" -ForegroundColor Green
Write-Host "║   • Settings: Konfiguration & API Keys                    ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Start Electron
& "$appDir\node_modules\.bin\electron.exe" .
