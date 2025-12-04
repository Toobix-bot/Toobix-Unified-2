# TOOBIX TAG 1 TRAINING - SERVER SETUP
# Konfiguriert den Server fuer optimales Tag 1 Training

Write-Host "=== TOOBIX TAG 1 TRAINING - SERVER SETUP ===" -ForegroundColor Cyan
Write-Host "Welt wird neu generiert, keepInventory=true, Zeit=Morgen" -ForegroundColor Yellow

$serverPath = "C:\MinecraftServer"
$propertiesFile = "$serverPath\server.properties"
$worldFolder = "$serverPath\world"

# 1. Stoppe den Server
Write-Host "`nStoppe Server..." -ForegroundColor Yellow
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "Server gestoppt!" -ForegroundColor Green

# 2. Loesche alte Welt
Write-Host "`nLoesche alte Welt..." -ForegroundColor Yellow
if (Test-Path $worldFolder) {
    Remove-Item -Path $worldFolder -Recurse -Force
    Write-Host "Alte Welt geloescht!" -ForegroundColor Green
}

# Loesche auch nether/end
@("world_nether", "world_the_end") | ForEach-Object {
    $path = "$serverPath\$_"
    if (Test-Path $path) { Remove-Item -Path $path -Recurse -Force }
}

# 3. Neue server.properties
Write-Host "`nKonfiguriere server.properties..." -ForegroundColor Yellow

$props = @"
#Minecraft server properties - Toobix Tag 1 Training
allow-flight=false
allow-nether=false
difficulty=normal
enable-command-block=true
enable-rcon=true
rcon.password=toobix123
rcon.port=25575
enforce-secure-profile=false
gamemode=survival
generate-structures=true
level-name=world
level-seed=toobix-training-2025
level-type=minecraft:normal
max-players=10
motd=Toobix Tag 1 Training
online-mode=false
op-permission-level=4
pvp=false
server-port=25565
simulation-distance=10
spawn-animals=true
spawn-monsters=true
spawn-npcs=true
spawn-protection=0
view-distance=12
white-list=false
"@

Set-Content -Path $propertiesFile -Value $props -Encoding UTF8
Write-Host "server.properties aktualisiert!" -ForegroundColor Green

# 4. Starte Server
Write-Host "`nStarte Server..." -ForegroundColor Yellow
Push-Location $serverPath
Start-Process -FilePath "java" -ArgumentList "-Xmx2G -Xms1G -jar server.jar nogui" -WorkingDirectory $serverPath -WindowStyle Minimized
Pop-Location

# 5. Warte auf Server
Write-Host "`nWarte auf Server (max 60 Sek)..." -ForegroundColor Yellow
$waited = 0
while ($waited -lt 60) {
    Start-Sleep -Seconds 3
    $waited += 3
    $conn = Test-NetConnection -ComputerName localhost -Port 25565 -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        Write-Host "Server bereit nach $waited Sekunden!" -ForegroundColor Green
        break
    }
    Write-Host "  Warte... ($waited s)" -ForegroundColor Gray
}

Write-Host "`n=== SETUP FERTIG ===" -ForegroundColor Green
Write-Host "Neue Welt mit Seed: toobix-training-2025" -ForegroundColor Cyan
Write-Host "keepInventory wird vom Bot gesetzt" -ForegroundColor Cyan
Write-Host "Zeit wird auf Morgen gesetzt" -ForegroundColor Cyan
Write-Host "`nStarte Bot mit: bun run toobix-day-one.ts" -ForegroundColor White
