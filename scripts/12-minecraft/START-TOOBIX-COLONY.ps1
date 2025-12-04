# 🏰 TOOBIX COLONY LAUNCHER
# Startet das komplette Kolonie-System für koordiniertes Minecraft-Spielen

param(
    [int]$BotCount = 3,
    [string]$ServerHost = "localhost",
    [int]$ServerPort = 25565
)

Write-Host @"

╔══════════════════════════════════════════════════════════════════════════╗
║                    🏰 TOOBIX COLONY LAUNCHER v1.0                       ║
║                                                                          ║
║   Startet eine koordinierte Kolonie von Toobix-Bots in Minecraft        ║
║                                                                          ║
║   Features:                                                              ║
║   - Teamwork: Bots arbeiten zusammen                                    ║
║   - Phasen: Survival → Stabilization → Expansion → Civilization        ║
║   - Rollen: Explorer, Builder, Miner, Farmer, Guardian                  ║
║   - Kommunikation: Bots sprechen miteinander                            ║
║   - Kreativität: Eigene Ideen und Projekte                              ║
╚══════════════════════════════════════════════════════════════════════════╝

"@

$scriptPath = "c:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft"

# Rolle-Definitionen
$roles = @(
    @{Name="ToobixLeader"; Icon="👑"; Role="coordinator"; Port=8950},
    @{Name="ToobixExplorer"; Icon="🧭"; Role="explorer"; Port=8951},
    @{Name="ToobixBuilder"; Icon="🏗️"; Role="builder"; Port=8952},
    @{Name="ToobixMiner"; Icon="⛏️"; Role="miner"; Port=8953},
    @{Name="ToobixFarmer"; Icon="🌾"; Role="farmer"; Port=8954}
)

Write-Host "📋 Geplante Kolonie-Mitglieder:`n"
for ($i = 0; $i -lt $BotCount; $i++) {
    $role = $roles[$i]
    Write-Host "   $($role.Icon) $($role.Name) - $($role.Role)"
    Write-Host "      API: http://localhost:$($role.Port)`n"
}

# Schritt 1: Colony Brain starten
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "SCHRITT 1: Colony Brain starten..."
Write-Host "═══════════════════════════════════════════════════════════════`n"

Write-Host "🧠 Starte Colony Brain (das koordinierende Gehirn)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$scriptPath'
Write-Host '🧠 TOOBIX COLONY BRAIN'
Write-Host '======================'
bun run .\toobix-colony-brain.ts
"@

Write-Host "   Warte 5 Sekunden bis Brain bereit ist..."
Start-Sleep -Seconds 5

# Prüfe ob Colony Brain läuft
try {
    $brainStatus = Invoke-RestMethod "http://localhost:8940/health" -TimeoutSec 3
    Write-Host "   ✅ Colony Brain läuft!`n"
} catch {
    Write-Host "   ❌ Colony Brain nicht erreichbar - versuche trotzdem fortzufahren...`n"
}

# Schritt 2: Colony Bots starten
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "SCHRITT 2: Colony Bots starten..."
Write-Host "═══════════════════════════════════════════════════════════════`n"

for ($i = 0; $i -lt $BotCount; $i++) {
    $role = $roles[$i]
    $name = $role.Name
    $icon = $role.Icon
    $port = $role.Port
    
    Write-Host "$icon Starte $name (Port $port)..."
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$scriptPath'
Write-Host '$icon $name - Colony Bot'
Write-Host '=========================='
bun run .\toobix-colony-bot.ts $name $ServerHost $ServerPort $port
"@
    
    # Kurze Pause zwischen Bot-Starts
    Start-Sleep -Seconds 4
}

Write-Host "`n═══════════════════════════════════════════════════════════════"
Write-Host "SCHRITT 3: Status prüfen..."
Write-Host "═══════════════════════════════════════════════════════════════`n"

Write-Host "Warte 15 Sekunden bis alle Bots verbunden sind..."
Start-Sleep -Seconds 15

# Status-Check
Write-Host "`n📊 KOLONIE STATUS:`n"

# Colony Brain
try {
    $status = Invoke-RestMethod "http://localhost:8940/status" -TimeoutSec 5
    Write-Host "🧠 Colony Brain: Phase = $($status.phase), Tag = $($status.daysSurvived)"
} catch {
    Write-Host "❌ Colony Brain: Offline"
}

# Bots
for ($i = 0; $i -lt $BotCount; $i++) {
    $role = $roles[$i]
    try {
        $botStatus = Invoke-RestMethod "http://localhost:$($role.Port)/status" -TimeoutSec 3
        Write-Host "$($role.Icon) $($role.Name): $($botStatus.currentTask) - $($botStatus.mood)"
    } catch {
        Write-Host "❌ $($role.Name): Offline"
    }
}

Write-Host @"

═══════════════════════════════════════════════════════════════════════════
🎮 KOLONIE GESTARTET!

   Minecraft Server: $ServerHost`:$ServerPort
   
   Die Bots werden jetzt:
   1. Die Umgebung erkunden
   2. Ressourcen sammeln (Holz, Stein, Nahrung)
   3. Einen gemeinsamen Unterschlupf bauen
   4. Sich koordinieren und kommunizieren
   5. Die ersten Nächte überleben
   
   Tritt dem Server bei und interagiere mit ihnen!
   
   Chat-Befehle:
     hallo / hi     - Begrüßung
     status         - Was macht der Bot gerade
     folge / follow - Bot folgt dir
     stopp / stop   - Bot hält an
     team / kolonie - Info über die Kolonie
     hilfe / help   - Zeigt alle Befehle

   APIs:
     Colony Brain: http://localhost:8940/status
     Bot Status:   http://localhost:895x/status (x = 0-4)

═══════════════════════════════════════════════════════════════════════════
"@
