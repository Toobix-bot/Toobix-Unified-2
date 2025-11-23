Write-Host ""
Write-Host "========================================"
Write-Host "  TOOBIX EXTENSION STARTER"
Write-Host "========================================"
Write-Host ""

$extensionPath = "c:\Dev\Projects\AI\Toobix-Unified\vscode-extension"
$vscodePaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Microsoft VS Code\Code.exe",
    "C:\Program Files\Microsoft VS Code\Code.exe",
    "C:\Program Files (x86)\Microsoft VS Code\Code.exe"
)

$vscodeFound = $false
foreach ($path in $vscodePaths) {
    if (Test-Path $path) {
        Write-Host "VS Code gefunden!" -ForegroundColor Green
        Write-Host "Starte VS Code..." -ForegroundColor Cyan
        Start-Process -FilePath $path -ArgumentList $extensionPath
        $vscodeFound = $true
        break
    }
}

if (-not $vscodeFound) {
    Write-Host "VS Code nicht gefunden!" -ForegroundColor Red
    Write-Host "Oeffne manuell: $extensionPath" -ForegroundColor Yellow
    Write-Host "Dann druecke F5"
    exit
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "NAECHSTE SCHRITTE:"
Write-Host "1. In VS Code: Druecke F5"
Write-Host "2. Neues VS Code Fenster oeffnet sich"
Write-Host "3. Oeffne dort: C:\Dev\Projects\AI\Toobix-Unified"
Write-Host "4. Klick auf Toobix Icon links!"
Write-Host ""
Write-Host "Extension ist bereit!" -ForegroundColor Green
Write-Host ""
