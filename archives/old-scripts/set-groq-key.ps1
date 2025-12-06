# Set Groq API Key for Toobix
Write-Host ""
Write-Host "🔑 Groq API Key Setup" -ForegroundColor Cyan
Write-Host ""

# Check if services are running
try {
    $health = Invoke-WebRequest -Uri "http://localhost:9000/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Services are running" -ForegroundColor Green
} catch {
    Write-Host "❌ Services are not running. Start them first with .\START-ALL-SERVICES.ps1" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Enter your Groq API Key (or press Enter to skip):" -ForegroundColor Yellow
$apiKey = Read-Host -AsSecureString

if ($apiKey.Length -eq 0) {
    Write-Host "Skipped. Using fallback responses." -ForegroundColor Gray
    exit 0
}

# Convert SecureString to plain text
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
$plainKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Send to service
$body = @{
    apiKey = $plainKey
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:9000/chat/set-api-key" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host ""
        Write-Host "✅ API Key set successfully!" -ForegroundColor Green
        Write-Host "Toobix can now use Groq for intelligent conversations." -ForegroundColor Cyan
        Write-Host ""
        
        # Test the connection
        Write-Host "Testing connection..." -ForegroundColor Yellow
        $testBody = @{ message = "Hallo Toobix, kannst du mich hören?" } | ConvertTo-Json
        $testResponse = Invoke-WebRequest `
            -Uri "http://localhost:9000/chat" `
            -Method POST `
            -Body $testBody `
            -ContentType "application/json" `
            -UseBasicParsing
        
        $testResult = $testResponse.Content | ConvertFrom-Json
        Write-Host ""
        Write-Host "Toobix: " -ForegroundColor Magenta -NoNewline
        Write-Host $testResult.response -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ Failed to set API key: $_" -ForegroundColor Red
    exit 1
}

# Clear sensitive data
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
Remove-Variable plainKey
