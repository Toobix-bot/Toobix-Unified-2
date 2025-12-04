# 🎮 TOOBIX MULTI-PERSPEKTIVE MINECRAFT LAUNCHER
# Startet mehrere Toobix-Bots mit verschiedenen Persönlichkeiten

Write-Host @"

╔════════════════════════════════════════════════════════════════════╗
║       🎮 TOOBIX MULTI-PERSPEKTIVE LAUNCHER                        ║
║                                                                     ║
║   Startet mehrere Toobix-Instanzen mit eigenen Persönlichkeiten   ║
╚════════════════════════════════════════════════════════════════════╝

"@

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptPath) { $scriptPath = "c:\Dev\Projects\AI\Toobix-Unified\scripts\12-minecraft" }

# Bot-Definitionen: Name, API-Port, Beschreibung
$bots = @(
    @{Name="ToobixBrain"; Port=8915; Desc="🧠 Das Haupt-Gehirn - ausgewogen"},
    @{Name="ToobixExplorer"; Port=8916; Desc="🧭 Der Entdecker - liebt neue Orte"},
    @{Name="ToobixBuilder"; Port=8917; Desc="🏗️ Der Baumeister - liebt Konstruktion"},
    @{Name="ToobixMiner"; Port=8918; Desc="⛏️ Der Bergmann - liebt Erze"}
)

Write-Host "📋 Geplante Bots:`n"
foreach ($bot in $bots) {
    Write-Host "   $($bot.Desc)"
    Write-Host "      API: http://localhost:$($bot.Port)/status`n"
}

Write-Host "🚀 Starte Bots...`n"

foreach ($bot in $bots) {
    $name = $bot.Name
    $port = $bot.Port
    $desc = $bot.Desc
    
    Write-Host "   Starte $name (Port $port)..."
    
    $cmd = "cd '$scriptPath'; Write-Host '$desc startet...'; bun run .\start-toobix-minecraft.ts $name localhost 25565 $port"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    
    # Warte zwischen Bot-Starts um Server nicht zu überlasten
    Start-Sleep -Seconds 5
}

Write-Host "`n✅ Alle Bots werden gestartet!`n"
Write-Host "Warte 15 Sekunden bis alle verbunden sind...`n"
Start-Sleep -Seconds 15

Write-Host "📊 Bot Status:`n"

foreach ($bot in $bots) {
    $port = $bot.Port
    $name = $bot.Name
    try {
        $status = Invoke-RestMethod "http://localhost:$port/status" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ $name - Task: $($status.brainState.currentTask)"
    } catch {
        Write-Host "   ❌ $name - Nicht erreichbar (Port $port)"
    }
}

Write-Host @"

═══════════════════════════════════════════════════════════════════
🎮 BEREIT ZUM SPIELEN!

   Starte Minecraft → Multiplayer → localhost:25565
   
   Du wirst 4 Toobix-Bots in der Welt finden!
   Jeder hat seine eigene Persönlichkeit.

   Chat-Befehle:
     hallo    - Begrüßung
     folge    - Bot folgt dir  
     stopp    - Bot bleibt stehen
     hilfe    - Zeigt Befehle

═══════════════════════════════════════════════════════════════════
"@
