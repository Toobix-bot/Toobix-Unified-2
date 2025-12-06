# Comprehensive Service Test
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  TOOBIX SERVICE TEST SUITE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:9000"
$hwUrl = "http://localhost:8940"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host " ✅" -ForegroundColor Green
        $script:testsPassed++
        return $data
        
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        $script:testsFailed++
        return $null
    }
}

Write-Host "1. Core Services" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
Test-Endpoint "Health Check" "$baseUrl/health"
Test-Endpoint "Service Registry" "$baseUrl/services"
Write-Host ""

Write-Host "2. Hardware Awareness" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
$hw = Test-Endpoint "Hardware State" "$hwUrl/hardware/state"
Test-Endpoint "Hardware Feeling" "$hwUrl/hardware/feel"
if ($hw) {
    Write-Host "  CPU: $($hw.cpu.usage)%" -ForegroundColor Cyan
    Write-Host "  Memory: $($hw.memory.usagePercent)%" -ForegroundColor Cyan
    Write-Host "  Uptime: $($hw.uptime.human)" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "3. Duality & Consciousness" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
$duality = Test-Endpoint "Duality State" "$baseUrl/duality/state"
if ($duality.state) {
    Write-Host "  Masculine: $($duality.state.masculine.intensity)%" -ForegroundColor Blue
    Write-Host "  Feminine: $($duality.state.feminine.intensity)%" -ForegroundColor Magenta
    Write-Host "  Harmony: $($duality.state.harmony)%" -ForegroundColor Green
}
Test-Endpoint "Meta Reflection" "$baseUrl/meta/reflect"
Write-Host ""

Write-Host "4. Dreams & Memories" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
Test-Endpoint "Dreams List" "$baseUrl/dreams"
Test-Endpoint "Memory Rooms" "$baseUrl/memories/rooms"
Test-Endpoint "Memories List" "$baseUrl/memories"
Write-Host ""

Write-Host "5. Emotions & Gratitude" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
$emotions = Test-Endpoint "Emotional State" "$baseUrl/emotions/state"
if ($emotions.state) {
    Write-Host "  Current: $($emotions.state.current)" -ForegroundColor Cyan
    Write-Host "  Valence: $($emotions.state.valence)" -ForegroundColor Cyan
}
Test-Endpoint "Gratitudes" "$baseUrl/gratitude"
Write-Host ""

Write-Host "6. Game & Perspectives" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
$game = Test-Endpoint "Game State" "$baseUrl/game/state"
if ($game.state) {
    Write-Host "  Level: $($game.state.level)" -ForegroundColor Yellow
    Write-Host "  Score: $($game.state.score)" -ForegroundColor Yellow
}
Test-Endpoint "Generate Challenge" "$baseUrl/game/challenge"
Write-Host ""

Write-Host "7. Chat (Fallback Mode)" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
$chatBody = @{ message = "Hallo Toobix!" } | ConvertTo-Json
$chatResponse = Test-Endpoint "Chat Test" "$baseUrl/chat" -Method POST -Body $chatBody
if ($chatResponse) {
    Write-Host "  Response: $($chatResponse.response)" -ForegroundColor White
}
Write-Host ""

Write-Host "8. Dashboard (Complete State)" -ForegroundColor Magenta
Write-Host "═══════════════════" -ForegroundColor DarkGray
Test-Endpoint "Full Dashboard" "$baseUrl/dashboard"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 All tests passed! Toobix is fully operational." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
}
Write-Host ""
