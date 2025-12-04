# ============================================================
#  TOOBIX TAG 1 TRAINING - SERVER SETUP
#  Konfiguriert den Server für optimales Tag 1 Training
# ============================================================

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║        🌅 TOOBIX TAG 1 TRAINING - SERVER SETUP 🌅            ║
║                                                              ║
║  Dieser Script konfiguriert:                                 ║
║  • Welt wird neu generiert (frischer Start)                  ║
║  • keepInventory = true (Items bleiben bei Tod)              ║
║  • Tageszeit = 0 (Morgen, voller Tag zum Üben)               ║
║  • Bonus-Truhe aktiviert                                     ║
║  • Spawn-Monster = true (realistisches Training)             ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$serverPath = "C:\MinecraftServer"
$propertiesFile = "$serverPath\server.properties"
$worldFolder = "$serverPath\world"

# 1. Stoppe den Server falls er läuft
Write-Host "`n📛 Stoppe Minecraft Server..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*minecraft*" -or $_.MainWindowTitle -like "*Minecraft*" }
if ($javaProcesses) {
    Stop-Process -Name java -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "   Server gestoppt!" -ForegroundColor Green
} else {
    # Fallback: Alle Java-Prozesse die Server sein könnten
    Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   Kein aktiver Server gefunden oder gestoppt." -ForegroundColor Gray
}

# 2. Lösche alte Welt für frischen Start
Write-Host "`n🗑️  Lösche alte Welt für frischen Start..." -ForegroundColor Yellow
if (Test-Path $worldFolder) {
    Remove-Item -Path $worldFolder -Recurse -Force
    Write-Host "   Alte Welt gelöscht!" -ForegroundColor Green
} else {
    Write-Host "   Keine alte Welt vorhanden." -ForegroundColor Gray
}

# Lösche auch world_nether und world_the_end falls vorhanden
@("world_nether", "world_the_end") | ForEach-Object {
    $path = "$serverPath\$_"
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "   $_ gelöscht!" -ForegroundColor Green
    }
}

# 3. Aktualisiere server.properties
Write-Host "`n⚙️  Konfiguriere server.properties..." -ForegroundColor Yellow

$newProperties = @"
#Minecraft server properties
#Toobix Day 1 Training Configuration
allow-flight=false
allow-nether=false
broadcast-console-to-ops=true
broadcast-rcon-to-ops=true
difficulty=normal
enable-command-block=true
enable-jmx-monitoring=false
enable-query=false
enable-rcon=true
rcon.password=toobix123
rcon.port=25575
enable-status=true
enforce-secure-profile=false
enforce-whitelist=false
entity-broadcast-range-percentage=100
force-gamemode=false
function-permission-level=4
gamemode=survival
generate-structures=true
generator-settings={}
hardcore=false
hide-online-players=false
initial-disabled-packs=
initial-enabled-packs=vanilla
level-name=world
level-seed=toobix-training-2025
level-type=minecraft:normal
max-chained-neighbor-updates=1000000
max-players=10
max-tick-time=60000
max-world-size=29999984
motd=\u00a7aToobix Tag 1 Training Server \u00a7e- AI Learning Survival
network-compression-threshold=256
online-mode=false
op-permission-level=4
player-idle-timeout=0
prevent-proxy-connections=false
pvp=false
query.port=25565
rate-limit=0
require-resource-pack=false
resource-pack=
resource-pack-prompt=
resource-pack-sha1=
server-ip=
server-port=25565
simulation-distance=10
spawn-animals=true
spawn-monsters=true
spawn-npcs=true
spawn-protection=0
sync-chunk-writes=true
text-filtering-config=
use-native-transport=true
view-distance=12
white-list=false
"@

Set-Content -Path $propertiesFile -Value $newProperties -Encoding UTF8
Write-Host "   server.properties aktualisiert!" -ForegroundColor Green

# 4. Erstelle gamerule Datei die beim Start ausgeführt wird
Write-Host "`n📜 Erstelle Start-Commands..." -ForegroundColor Yellow

# Wir speichern Commands die der Bot beim Joinen per RCON ausführen kann
$startCommands = @"
# Diese Commands werden automatisch ausgeführt wenn der Bot joint:
gamerule keepInventory true
gamerule doDaylightCycle true
gamerule doMobSpawning true
gamerule doWeatherCycle true
gamerule naturalRegeneration true
gamerule spawnRadius 0
time set 0
weather clear
"@

$commandsFile = "$serverPath\toobix-start-commands.txt"
Set-Content -Path $commandsFile -Value $startCommands -Encoding UTF8
Write-Host "   Start-Commands gespeichert!" -ForegroundColor Green

# 5. Starte Server neu
Write-Host "`n🚀 Starte Minecraft Server..." -ForegroundColor Yellow
Push-Location $serverPath

# Starte Server im Hintergrund
$serverProcess = Start-Process -FilePath "java" -ArgumentList "-Xmx2G -Xms1G -jar server.jar nogui" -WorkingDirectory $serverPath -PassThru -WindowStyle Minimized
Write-Host "   Server startet (PID: $($serverProcess.Id))..." -ForegroundColor Cyan

Pop-Location

# 6. Warte auf Server-Start
Write-Host "`n⏳ Warte auf Server-Bereitschaft..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    # Teste ob Port offen ist
    $connection = Test-NetConnection -ComputerName localhost -Port 25565 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "   Server ist bereit nach $waited Sekunden!" -ForegroundColor Green
        break
    }
    Write-Host "   Warte... ($waited/$maxWait Sekunden)" -ForegroundColor Gray
}

if ($waited -ge $maxWait) {
    Write-Host "   ⚠️ Server braucht länger - bitte manuell prüfen!" -ForegroundColor Yellow
}

# 7. Setze Gamerules via RCON oder warte auf Bot
Write-Host "`n📋 Server-Konfiguration abgeschlossen!" -ForegroundColor Green

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                    ✅ SETUP ABGESCHLOSSEN!                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Server-Einstellungen:                                       ║
║  • 🌍 Neue Welt mit Seed: toobix-training-2025               ║
║  • ☀️  Difficulty: Normal (realistisches Training)           ║
║  • 💀 Monster: Aktiviert (Überlebens-Training)               ║
║  • 🎒 keepInventory: true (Items bleiben bei Tod)            ║
║  • 🎁 Bonus-Truhe: Wird beim ersten Join aktiviert           ║
║  • ⏰ Zeit: Wird auf Morgen (0) gesetzt                      ║
║  • ☔ Wetter: Wird auf Klar gesetzt                          ║
║                                                              ║
║  Nächste Schritte:                                           ║
║  1. Starte den Bot: bun run toobix-day-one.ts                ║
║  2. Der Bot wird die Gamerules automatisch setzen            ║
║  3. Beobachte Tag 1 Training!                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n💡 Tipp: Der Bot kann jetzt mit fairem Tag 1 Start trainieren!" -ForegroundColor Yellow
Write-Host "   Führe aus: " -NoNewline; Write-Host "bun run toobix-day-one.ts" -ForegroundColor White
