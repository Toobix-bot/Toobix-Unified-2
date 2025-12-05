#!/usr/bin/env pwsh
# TOOBIX LOCAL TEST SCRIPT
# Startet Website + Backend lokal zum Testen

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 TOOBIX LOCAL TEST ENVIRONMENT                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Bun is installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow
$bunCheck = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bunCheck) {
    Write-Host "❌ Bun not found! Install from: https://bun.sh" -ForegroundColor Red
    exit 1
}

$pythonCheck = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCheck) {
    Write-Host "❌ Python not found! Install from: https://python.org" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies OK" -ForegroundColor Green
Write-Host ""

# Step 1: Start Backend (Port 10000)
Write-Host "🚀 Starting Backend (Port 10000)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "10000"
    bun run services/chat-proxy.ts
}

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:10000/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend running on http://localhost:10000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might be starting... (check logs)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Start Website (Port 8080)
Write-Host "🌐 Starting Website (Port 8080)..." -ForegroundColor Yellow
$websiteJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\docs"
    python -m http.server 8080
}

Start-Sleep -Seconds 2

Write-Host "✅ Website running on http://localhost:8080" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✨ READY TO TEST!                                        ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Test Checklist:" -ForegroundColor Cyan
Write-Host "  1. Open: http://localhost:8080/index-new.html" -ForegroundColor White
Write-Host "  2. Scroll to Chat Module" -ForegroundColor White
Write-Host "  3. Send a test message" -ForegroundColor White
Write-Host "  4. Check if Toobix responds" -ForegroundColor White
Write-Host "  5. Test all navigation links" -ForegroundColor White
Write-Host "  6. Resize window (test responsive)" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Endpoints:" -ForegroundColor Cyan
Write-Host "  Backend Health: http://localhost:10000/health" -ForegroundColor White
Write-Host "  Chat API:       http://localhost:10000/chat" -ForegroundColor White
Write-Host "  Website:        http://localhost:8080/index-new.html" -ForegroundColor White
Write-Host ""
Write-Host "⌨️  Press CTRL+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running and show logs
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if jobs are still running
        if ($backendJob.State -ne 'Running' -and $websiteJob.State -ne 'Running') {
            Write-Host "⚠️  All services stopped" -ForegroundColor Yellow
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
    
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $websiteJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $websiteJob -ErrorAction SilentlyContinue
    
    Write-Host "✅ All services stopped" -ForegroundColor Green
    Write-Host ""
}
