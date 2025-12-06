# ========================================
#   TOOBIX SERVICE STARTER (PowerShell)
#   Starte alle Services im Development Mode
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TOOBIX SERVICE STARTER" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Starte alle 16 Services...`n" -ForegroundColor Yellow

# Wechsle zum Script-Verzeichnis
Set-Location $PSScriptRoot

# Stoppe alte Prozesse
Write-Host "[1/3] Stoppe alte Bun-Prozesse..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq 'bun'} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Starte Services
Write-Host "[2/3] Starte Services...`n" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🚀 TOOBIX SERVICES STARTING...' -ForegroundColor Green; bun run start-toobix-optimized.ts --development" -WindowStyle Normal

# Warte auf Start
Write-Host "[3/3] Warte 30 Sekunden auf Service-Start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Prüfe Status
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PRÜFE SERVICE STATUS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ports = @(7777, 8970, 8900, 8961, 8000, 8002, 8975, 8959, 8921, 8914, 8910, 8940, 8965, 8001, 8896, 7779)
$running = 0

foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ Port $port ONLINE" -ForegroundColor Green
        $running++
    } catch {
        Write-Host "   ❌ Port $port offline" -ForegroundColor DarkGray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ERGEBNIS: $running/16 Services online" -ForegroundColor $(if ($running -ge 12) { "Green" } elseif ($running -ge 8) { "Yellow" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Services laufen im separaten Fenster." -ForegroundColor White
Write-Host "Zum Stoppen: Ctrl+C im Service-Fenster" -ForegroundColor White
Write-Host "        oder: Get-Process | Where-Object {`$_.ProcessName -eq 'bun'} | Stop-Process -Force`n" -ForegroundColor DarkGray

Read-Host "Drücke Enter zum Beenden"
