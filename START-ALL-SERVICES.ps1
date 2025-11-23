Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TOOBIX UNIFIED SYSTEM - STARTUP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Dev\Projects\AI\Toobix-Unified"

# Check if bun is available
$bunAvailable = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bunAvailable) {
    Write-Host "ERROR: Bun not found!" -ForegroundColor Red
    Write-Host "Install Bun first: https://bun.sh" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Toobix Services..." -ForegroundColor Cyan
Write-Host ""

# Start Hardware Awareness Service (Port 8940)
Write-Host "1. Starting Hardware Awareness Service (Port 8940)..." -ForegroundColor Yellow
Start-Process -FilePath "bun" -ArgumentList "run", "$projectRoot\services\hardware-awareness-v2.ts" -WorkingDirectory $projectRoot -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Unified Service Gateway (Port 9000)
Write-Host "2. Starting Unified Service Gateway (Port 9000)..." -ForegroundColor Yellow
Start-Process -FilePath "bun" -ArgumentList "run", "$projectRoot\services\unified-service-gateway.ts" -WorkingDirectory $projectRoot -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVICES STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hardware Awareness:  http://localhost:8940" -ForegroundColor White
Write-Host "Unified Gateway:     http://localhost:9000" -ForegroundColor White
Write-Host ""
Write-Host "Available Endpoints:" -ForegroundColor Cyan
Write-Host "  - GET  http://localhost:9000/dashboard" -ForegroundColor Gray
Write-Host "  - GET  http://localhost:9000/services" -ForegroundColor Gray
Write-Host "  - GET  http://localhost:9000/dreams" -ForegroundColor Gray
Write-Host "  - GET  http://localhost:9000/duality/state" -ForegroundColor Gray
Write-Host "  - POST http://localhost:9000/chat" -ForegroundColor Gray
Write-Host "  - GET  http://localhost:9000/meta/reflect" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open VS Code Extension folder" -ForegroundColor White
Write-Host "2. Press F5 to start Extension Development Host" -ForegroundColor White
Write-Host "3. Open Toobix-Unified workspace in new window" -ForegroundColor White
Write-Host "4. Click Toobix icon in sidebar!" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop services" -ForegroundColor Gray
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 10
}
