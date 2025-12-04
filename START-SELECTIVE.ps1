# ========================================
# TOOBIX SELECTIVE SERVICE LAUNCHER
# Stabilität durch gezielte Service-Auswahl
# ========================================

param(
    [Parameter()]
    [ValidateSet('minimal', 'dev', 'full', 'custom')]
    [string]$Profile = 'minimal',
    
    [Parameter()]
    [string[]]$Services = @()
)

$ErrorActionPreference = "Stop"
$projectRoot = "c:\Dev\Projects\AI\Toobix-Unified"

# Service-Profile für verschiedene Arbeitsszenarien
$ServiceProfiles = @{
    'minimal' = @(
        'hardware-awareness',
        'unified-gateway'
    )
    'unified' = @(
        'unified-core',
        'unified-communication',
        'unified-consciousness',
        'unified-memory',
        'unified-gateway'
    )
    'dev' = @(
        'hardware-awareness',
        'unified-gateway',
        'emotional-core',
        'dream-core',
        'self-awareness'
    )
    'full' = @(
        'hardware-awareness',
        'unified-gateway',
        'emotional-core',
        'dream-core',
        'self-awareness',
        'multi-llm-router',
        'autonomy-engine',
        'game-engine'
    )
}

# Service-Definitionen mit Ressourcen-Anforderungen
$ServiceDefinitions = @{
    'hardware-awareness' = @{
        Name = 'Hardware Awareness'
        Script = 'services\hardware-awareness-v2.ts'
        Port = 8940
        Priority = 1
        MemoryMB = 100
    }
    'unified-core' = @{
        Name = 'Unified Core Service'
        Script = 'core\unified-core-service.ts'
        Port = 8000
        Priority = 1
        MemoryMB = 150
    }
    'unified-communication' = @{
        Name = 'Unified Communication Service'
        Script = 'core\unified-communication-service.ts'
        Port = 8001
        Priority = 2
        MemoryMB = 100
    }
    'unified-consciousness' = @{
        Name = 'Unified Consciousness Service'
        Script = 'core\unified-consciousness-service.ts'
        Port = 8002
        Priority = 2
        MemoryMB = 100
    }
    'unified-memory' = @{
        Name = 'Unified Memory Service'
        Script = 'core\unified-memory-service.ts'
        Port = 8003
        Priority = 3
        MemoryMB = 100
    }
    'unified-gateway' = @{
        Name = 'Unified Service Gateway'
        Script = 'services\unified-service-gateway.ts'
        Port = 9000
        Priority = 1
        MemoryMB = 150
    }
    'emotional-core' = @{
        Name = 'Emotional Core'
        Script = 'core\emotional-core.ts'
        Port = 8900
        Priority = 2
        MemoryMB = 200
    }
    'dream-core' = @{
        Name = 'Dream Core'
        Script = 'core\dream-core.ts'
        Port = 8961
        Priority = 2
        MemoryMB = 150
    }
    'self-awareness' = @{
        Name = 'Self-Awareness Core'
        Script = 'core\self-awareness-core.ts'
        Port = 8970
        Priority = 2
        MemoryMB = 200
    }
    'multi-llm-router' = @{
        Name = 'Multi-LLM Router'
        Script = 'core\multi-llm-router.ts'
        Port = 8959
        Priority = 3
        MemoryMB = 150
    }
    'autonomy-engine' = @{
        Name = 'Autonomy Engine'
        Script = 'core\autonomy-engine.ts'
        Port = 8975
        Priority = 3
        MemoryMB = 200
    }
    'game-engine' = @{
        Name = 'Game Engine'
        Script = 'scripts\2-services\self-evolving-game-engine.ts'
        Port = 8896
        Priority = 4
        MemoryMB = 250
    }
}

# Banner
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TOOBIX SELECTIVE LAUNCHER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Bun-Check
$bunAvailable = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bunAvailable) {
    Write-Host "ERROR: Bun not found!" -ForegroundColor Red
    Write-Host "Install Bun: https://bun.sh" -ForegroundColor Yellow
    exit 1
}

# Bestimme welche Services gestartet werden
$servicesToStart = @()
if ($Profile -eq 'custom' -and $Services.Count -gt 0) {
    $servicesToStart = $Services
    Write-Host "Custom Profile: $($Services -join ', ')" -ForegroundColor Yellow
} elseif ($ServiceProfiles.ContainsKey($Profile)) {
    $servicesToStart = $ServiceProfiles[$Profile]
    Write-Host "Using Profile: $Profile" -ForegroundColor Yellow
} else {
    Write-Host "Unknown profile: $Profile. Using 'minimal'." -ForegroundColor Yellow
    $servicesToStart = $ServiceProfiles['minimal']
}

Write-Host ""
Write-Host "Services to start: $($servicesToStart.Count)" -ForegroundColor Cyan

# Ressourcen-Schätzung
$totalMemoryMB = 0
foreach ($serviceId in $servicesToStart) {
    if ($ServiceDefinitions.ContainsKey($serviceId)) {
        $totalMemoryMB += $ServiceDefinitions[$serviceId].MemoryMB
    }
}
Write-Host "Estimated Memory: ~$totalMemoryMB MB" -ForegroundColor Gray
Write-Host ""

# Starte Services nach Priorität sortiert
$startedProcesses = @()
$servicesToStart | ForEach-Object {
    $serviceId = $_
    if (-not $ServiceDefinitions.ContainsKey($serviceId)) {
        Write-Host "⚠ Unknown service: $serviceId" -ForegroundColor Yellow
        return
    }
    
    $service = $ServiceDefinitions[$serviceId]
    $scriptPath = Join-Path $projectRoot $service.Script
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "⚠ Script not found: $($service.Script)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "▶ Starting $($service.Name) (Port $($service.Port))..." -ForegroundColor Green
    
    try {
        $process = Start-Process -FilePath "bun" `
            -ArgumentList "run", $scriptPath `
            -WorkingDirectory $projectRoot `
            -WindowStyle Normal `
            -PassThru
        
        $startedProcesses += @{
            Id = $serviceId
            Name = $service.Name
            Process = $process
            Port = $service.Port
        }
        
        Start-Sleep -Milliseconds 800
    } catch {
        Write-Host "✗ Failed to start $($service.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVICES RUNNING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($proc in $startedProcesses) {
    Write-Host "✓ $($proc.Name)" -ForegroundColor Green
    Write-Host "  http://localhost:$($proc.Port)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitoring services... Press Ctrl+C to stop all" -ForegroundColor Yellow
Write-Host ""

# Keep-alive mit Resource-Monitoring
$monitorInterval = 10
while ($true) {
    Start-Sleep -Seconds $monitorInterval
    
    # Prüfe ob Prozesse noch laufen
    $running = 0
    $stopped = 0
    
    foreach ($proc in $startedProcesses) {
        if ($proc.Process -and -not $proc.Process.HasExited) {
            $running++
        } else {
            $stopped++
        }
    }
    
    if ($stopped -gt 0) {
        Write-Host "⚠ $stopped service(s) stopped. $running still running." -ForegroundColor Yellow
    }
    
    if ($running -eq 0) {
        Write-Host ""
        Write-Host "All services have stopped. Exiting..." -ForegroundColor Red
        break
    }
}
