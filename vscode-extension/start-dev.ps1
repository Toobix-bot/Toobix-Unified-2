#!/usr/bin/env pwsh
# 🚀 Toobix Development Mode - All-in-One Starter

Write-Host "
╔═══════════════════════════════════════════════════════╗
║   🌟 TOOBIX DEVELOPMENT MODE                          ║
║   Starting all services + Extension Watch Mode        ║
╚═══════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Schritt 1: Services starten
Write-Host "📡 Starting Services..." -ForegroundColor Yellow

# Terminal für Hardware Awareness
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\services'; bun run hardware-awareness.ts"
Start-Sleep -Seconds 2

# Terminal für Unified Gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\services'; bun run unified-service-gateway.ts"
Start-Sleep -Seconds 3

# Schritt 2: Watch-Mode starten
Write-Host "`n🔧 Starting TypeScript Watch Mode..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run watch"
Start-Sleep -Seconds 2

Write-Host "
╔═══════════════════════════════════════════════════════╗
║   ✅ ALL SERVICES STARTED                             ║
╚═══════════════════════════════════════════════════════╝

📡 Hardware Awareness:  http://localhost:8940
📡 Unified Gateway:     http://localhost:9000
🔧 Watch Mode:          Active (auto-compiling)

🎯 NEXT STEPS:

1. Press F5 in VS Code to launch Extension Development Host
2. Edit any file in src/*.ts
3. Wait for compilation (bottom right shows progress)
4. Press Ctrl+R in Extension Development Host window
5. Your changes are live! 🚀

💡 TIP: Keep this window open to see service logs!

" -ForegroundColor Green

# Optional: VS Code öffnen (auskommentiert, falls gewünscht)
# code $PSScriptRoot

Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "`nStopping services..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -eq "bun" } | Stop-Process -Force
Write-Host "✅ Services stopped" -ForegroundColor Green
