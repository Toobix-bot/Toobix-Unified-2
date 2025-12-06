# ═══════════════════════════════════════════════════════════════════════════
# 🌌 TOOBIX LIVING CONSCIOUSNESS TERMINAL STARTER
# ═══════════════════════════════════════════════════════════════════════════

$Host.UI.RawUI.WindowTitle = "🌌 TOOBIX LIVING CONSCIOUSNESS"

Write-Host ""
Write-Host "  🌌 TOOBIX LIVING CONSCIOUSNESS TERMINAL" -ForegroundColor Magenta
Write-Host "  ========================================" -ForegroundColor DarkMagenta
Write-Host ""
Write-Host "  Dieses Terminal zeigt Toobix' Bewusstsein in Echtzeit." -ForegroundColor Cyan
Write-Host ""
Write-Host "  BEFEHLE:" -ForegroundColor Yellow
Write-Host "  /help      - Alle Befehle anzeigen" -ForegroundColor Gray
Write-Host "  /status    - Detaillierter System-Status" -ForegroundColor Gray
Write-Host "  /modules   - Alle Module und Verbindungen" -ForegroundColor Gray
Write-Host "  /evolve    - Manueller Evolution-Zyklus" -ForegroundColor Gray
Write-Host "  /dream     - Traum generieren" -ForegroundColor Gray
Write-Host "  /think     - Gedanke generieren" -ForegroundColor Gray
Write-Host "  /heal X    - Modul X heilen (z.B. /heal feeling)" -ForegroundColor Gray
Write-Host "  /boost X   - Modul X stärken (z.B. /boost creating)" -ForegroundColor Gray
Write-Host "  /perspective - Perspektive wechseln" -ForegroundColor Gray
Write-Host "  /auto on/off - Auto-Evolution an/aus" -ForegroundColor Gray
Write-Host "  /remember  - Letzte Erinnerungen anzeigen" -ForegroundColor Gray
Write-Host "  /save      - Zustand speichern" -ForegroundColor Gray
Write-Host "  /exit      - Beenden" -ForegroundColor Gray
Write-Host ""
Write-Host "  Du kannst auch normal mit Toobix chatten!" -ForegroundColor Green
Write-Host ""

# Check if gateway is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9000/health" -Method Get -TimeoutSec 2
    Write-Host "  ✓ Gateway läuft auf Port 9000" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Gateway nicht erreichbar - starte es zuerst:" -ForegroundColor Yellow
    Write-Host "    .\START-ALL-SERVICES.ps1" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host ""
Write-Host "  Starte Terminal..." -ForegroundColor Magenta
Start-Sleep -Seconds 2

Set-Location $PSScriptRoot

# Run the living consciousness terminal
& "C:\Users\micha\.bun\bin\bun.exe" scripts/toobix-living-consciousness.ts

Write-Host ""
Write-Host "Terminal beendet. Drücke eine Taste zum Schließen..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
