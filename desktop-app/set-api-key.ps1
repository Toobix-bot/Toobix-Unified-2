# Groq API Key Setup
param([string]$ApiKey)

Write-Host ""
Write-Host "=== GROQ API KEY SETUP ===" -ForegroundColor Cyan
Write-Host ""

if (-not $ApiKey) {
    Write-Host "Gib deinen Groq API Key ein (oder Enter zum Ueberspringen):" -ForegroundColor Yellow
    $ApiKey = Read-Host
}

if ($ApiKey -and $ApiKey.Trim()) {
    Write-Host ""
    Write-Host "Speichere API Key..." -ForegroundColor Cyan
    
    $configDir = "$env:APPDATA\toobix-unified-config"
    $configFile = "$configDir\config.json"
    
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    $config = @{}
    if (Test-Path $configFile) {
        try {
            $config = Get-Content $configFile | ConvertFrom-Json -AsHashtable
        } catch {
            $config = @{}
        }
    }
    
    $config['groq_api_key'] = $ApiKey.Trim()
    $config | ConvertTo-Json | Set-Content $configFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "[OK] API Key gespeichert!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Naechste Schritte:" -ForegroundColor Cyan
    Write-Host "  1. Starte die Desktop App neu" -ForegroundColor Gray
    Write-Host "  2. Gehe zum Chat Tab" -ForegroundColor Gray
    Write-Host "  3. Teste die AI!" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[INFO] Uebersprungen" -ForegroundColor Yellow
    Write-Host "Du kannst den Key spaeter in der App unter Settings setzen." -ForegroundColor Gray
    Write-Host ""
}
