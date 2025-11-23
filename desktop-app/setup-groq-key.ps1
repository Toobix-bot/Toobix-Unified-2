# Groq API Key Setup für Desktop App
# Dieses Script hilft dir, den Groq API Key für die Desktop App zu konfigurieren

Write-Host ""
Write-Host "🔑 GROQ API KEY SETUP" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Check if API key is in environment
$envKey = $env:GROQ_API_KEY

if ($envKey) {
    Write-Host "✓ API Key gefunden in Umgebungsvariablen!" -ForegroundColor Green
    Write-Host ""
    $useEnv = Read-Host "Möchtest du diesen Key nutzen? (J/N)"
    
    if ($useEnv -eq "J" -or $useEnv -eq "j") {
        $apiKey = $envKey
    }
}

if (-not $apiKey) {
    Write-Host ""
    Write-Host "Hast du bereits einen Groq API Key? (J/N)" -ForegroundColor Yellow
    $hasKey = Read-Host
    
    if ($hasKey -eq "J" -or $hasKey -eq "j") {
        Write-Host ""
        Write-Host "Gib deinen Groq API Key ein:" -ForegroundColor Cyan
        $apiKey = Read-Host
    } else {
        Write-Host ""
        Write-Host "📝 Wie du einen Groq API Key erhältst:" -ForegroundColor Cyan
        Write-Host "   1. Besuche: https://console.groq.com" -ForegroundColor Gray
        Write-Host "   2. Erstelle einen Account (kostenlos)" -ForegroundColor Gray
        Write-Host "   3. Gehe zu 'API Keys'" -ForegroundColor Gray
        Write-Host "   4. Erstelle einen neuen Key" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Nachdem du einen Key hast, kannst du:" -ForegroundColor Yellow
        Write-Host "   • Dieses Script erneut ausführen" -ForegroundColor Gray
        Write-Host "   • Oder den Key in der Desktop App unter 'Settings' eingeben" -ForegroundColor Gray
        Write-Host ""
        Read-Host "Drücke Enter zum Beenden"
        exit
    }
}

# Save API key to electron store config file
if ($apiKey) {
    Write-Host ""
    Write-Host "💾 Speichere API Key..." -ForegroundColor Cyan
    
    # Electron Store speichert Config in AppData
    $configDir = "$env:APPDATA\toobix-unified-config"
    $configFile = "$configDir\config.json"
    
    # Create directory if not exists
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Create or update config
    $config = @{}
    if (Test-Path $configFile) {
        $config = Get-Content $configFile | ConvertFrom-Json -AsHashtable
    }
    
    $config['groq_api_key'] = $apiKey
    
    $config | ConvertTo-Json | Set-Content $configFile
    
    Write-Host ""
    Write-Host "✅ API Key erfolgreich gespeichert!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Nächste Schritte:" -ForegroundColor Cyan
    Write-Host "   1. Starte die Desktop App (falls sie läuft, neu starten)" -ForegroundColor Gray
    Write-Host "   2. Gehe zum 'Chat' Tab" -ForegroundColor Gray
    Write-Host "   3. Chatte mit dem Mixtral AI Model!" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Kein API Key eingegeben." -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Read-Host "Druecke Enter zum Beenden"
