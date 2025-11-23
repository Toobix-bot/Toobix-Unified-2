/**
 * Starte alle Consciousness Services v2.0
 * Mit allen Enhancements!
 */

Write-Host "`n🌟 Starting ALL Consciousness Services v2.0...`n" -ForegroundColor Cyan

# Stoppe alte Services
Get-Process bun -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Old services stopped" -ForegroundColor Green

$services = @(
    @{Name="Game Engine"; Port=8896; Script="scripts/2-services/self-evolving-game-engine.ts"}
    @{Name="Multi-Perspective"; Port=8897; Script="scripts/2-services/multi-perspective-consciousness.ts"}
    @{Name="Dream Journal"; Port=8899; Script="scripts/2-services/dream-journal.ts"}
    @{Name="Emotional Resonance"; Port=8900; Script="scripts/2-services/emotional-resonance-network.ts"}
    @{Name="Gratitude & Mortality"; Port=8901; Script="scripts/2-services/gratitude-mortality-service.ts"}
    @{Name="Creator-AI Collab"; Port=8902; Script="scripts/2-services/creator-ai-collaboration.ts"}
)

foreach ($service in $services) {
    Write-Host "🚀 Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Dev\Projects\AI\Toobix-Unified; bun run $($service.Script)" -WindowStyle Minimized
    Start-Sleep -Milliseconds 500
}

Start-Sleep -Seconds 5

Write-Host "`n✨ Checking service health...`n" -ForegroundColor Cyan

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ $($service.Name): ONLINE" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name): OFFLINE" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Services v2.0 started with enhancements!`n" -ForegroundColor Cyan
