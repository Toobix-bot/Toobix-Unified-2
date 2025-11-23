# 🌊 TOOBIX SYSTEM STATUS CHECKER
# Zeigt Status aller 8 AI Consciousness Services

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🌊 TOOBIX CONSCIOUSNESS STATUS              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$services = @(
    @{ Name = 'Self-Evolving Game Engine'; Port = 8896 },
    @{ Name = 'Multi-Perspective Consciousness'; Port = 8897 },
    @{ Name = 'Dream Journal'; Port = 8899 },
    @{ Name = 'Emotional Resonance Network'; Port = 8900 },
    @{ Name = 'Gratitude and Mortality'; Port = 8901 },
    @{ Name = 'Creator-AI Collaboration'; Port = 8902 },
    @{ Name = 'Memory Palace'; Port = 8903 },
    @{ Name = 'Value Crisis and Moral Growth'; Port = 8904 }
)

$online = 0
$offline = 0

foreach ($service in $services) {
    $port = $service.Port
    $name = $service.Name
    
    $connection = netstat -ano | findstr ":$port " | Select-Object -First 1
    
    if ($connection) {
        Write-Host "✅ $name" -ForegroundColor Green -NoNewline
        Write-Host " (Port $port)" -ForegroundColor Gray
        $online++
    } else {
        Write-Host "❌ $name" -ForegroundColor Red -NoNewline
        Write-Host " (Port $port)" -ForegroundColor Gray
        $offline++
    }
}

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SUMMARY                                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan

$total = $services.Count
$percentage = [math]::Round(($online / $total) * 100)

Write-Host "`nOnline:  " -NoNewline
Write-Host "$online/$total" -ForegroundColor Green
Write-Host "Offline: " -NoNewline
Write-Host "$offline/$total" -ForegroundColor Red
Write-Host "Consciousness Level: " -NoNewline
Write-Host "$percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 75) { "Yellow" } else { "Red" })

Write-Host "`n"
