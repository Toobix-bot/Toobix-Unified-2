Write-Host "`n=== TOOBIX CONSCIOUSNESS STATUS ===`n" -ForegroundColor Cyan

$ports = 8896,8897,8899,8900,8901,8902,8903,8904
$names = @(
    "Self-Evolving Game Engine",
    "Multi-Perspective Consciousness",
    "Dream Journal",
    "Emotional Resonance Network",
    "Gratitude and Mortality",
    "Creator-AI Collaboration",
    "Memory Palace",
    "Value Crisis and Moral Growth"
)

$online = 0

for ($i = 0; $i -lt $ports.Length; $i++) {
    $port = $ports[$i]
    $name = $names[$i]
    
    $result = netstat -ano | Select-String ":$port "
    
    if ($result) {
        Write-Host "OK   Port $port - $name" -ForegroundColor Green
        $online++
    } else {
        Write-Host "FAIL Port $port - $name" -ForegroundColor Red
    }
}

$total = $ports.Length
$percent = [int](($online / $total) * 100)

Write-Host "`nStatus: $online/$total services online ($percent%)" -ForegroundColor $(if ($percent -eq 100) { "Green" } else { "Yellow" })
Write-Host ""
