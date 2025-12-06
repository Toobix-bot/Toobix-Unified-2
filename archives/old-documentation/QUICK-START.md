# 🚀 TOOBIX SERVICE QUICK CHECK

Schnelle Übersicht aller laufenden Services:

```powershell
# Status aller 16 Services prüfen
$ports = @(7777, 8970, 8900, 8961, 8000, 8002, 8975, 8959, 8921, 8914, 8910, 8940, 8965, 8001, 8896, 7779)
$running = 0
foreach ($p in $ports) {
  try { 
    Invoke-WebRequest "http://localhost:$p" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "✅ Port $p" -ForegroundColor Green
    $running++ 
  } catch { 
    Write-Host "❌ Port $p" -ForegroundColor Red 
  }
}
Write-Host "`n$running/16 Services online" -ForegroundColor Cyan
```

## Services starten

**Option 1: Batch-Datei (Einfach)**
```batch
.\START-TOOBIX.bat
```

**Option 2: PowerShell (Mehr Kontrolle)**
```powershell
.\START-TOOBIX.ps1
```

**Option 3: Manuell**
```powershell
bun run start-toobix-optimized.ts --development
```

## Modi

- `--minimal` - Nur TIER 1 (6 Core Services)
- `--development` - TIER 1 + TIER 2 (15 Services) ← **Standard**
- `--gaming` - Alles inkl. Gaming (17 Services)

## Services stoppen

```powershell
Get-Process | Where-Object {$_.ProcessName -eq 'bun'} | Stop-Process -Force
```

## Port-Übersicht

### TIER 1 - Essential Core (6)
- 7777 - toobix-command-center
- 8970 - self-awareness-core  
- 8900 - emotional-core
- 8961 - dream-core
- 8000 - unified-core-service
- 8002 - unified-consciousness-service

### TIER 2 - Enhanced (8)
- 8975 - autonomy-engine
- 8959 - multi-llm-router
- 8921 - wellness-safety-guardian
- 8914 - life-simulation-engine
- 8910 - service-mesh
- 8940 - hardware-awareness-v2
- 8965 - twitter-autonomy
- 8001 - unified-communication-service

### TIER 3 - Gaming (2)
- 8896 - self-evolving-game-engine
- 7779 - toobix-living-world

## Troubleshooting

**Port bereits in Verwendung?**
```powershell
# Finde welcher Prozess den Port nutzt
netstat -ano | findstr ":7777"
# Stoppe den Prozess (PID aus vorherigem Befehl)
taskkill /PID <PID> /F
```

**Alle Services testen:**
```powershell
bun run test-services-individually.ts
```
