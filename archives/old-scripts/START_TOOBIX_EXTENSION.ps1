# Toobix Extension Starter

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$servicesPath = Join-Path $repoRoot "services"
$extensionPath = Join-Path $repoRoot "vscode-extension"

$script:serviceProcesses = @()

function Stop-ToobixServices {
    foreach ($svc in $script:serviceProcesses) {
        if ($null -ne $svc.Process -and -not $svc.Process.HasExited) {
            Write-Host ("Stopping {0} (PID {1})..." -f $svc.Name, $svc.Process.Id) -ForegroundColor Yellow
            try {
                Stop-Process -Id $svc.Process.Id -Force -ErrorAction Stop
            } catch {
                Write-Host ("  -> Failed to stop {0}: {1}" -f $svc.Name, $_) -ForegroundColor Red
            }
        }
    }
}

function Start-ToobixService {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,
        [Parameter(Mandatory = $true)]
        [string] $ScriptName,
        [int] $WarmupSeconds = 2
    )

    $scriptPath = Join-Path $servicesPath $ScriptName
    if (-not (Test-Path $scriptPath)) {
        throw "Service script not found: $scriptPath"
    }

    $relativeScript = Join-Path "services" $ScriptName

    Write-Host (" -> {0}" -f $Name) -ForegroundColor Gray
    $process = Start-Process -FilePath "bun" `
        -ArgumentList $relativeScript `
        -WorkingDirectory $repoRoot `
        -WindowStyle Hidden `
        -PassThru

    Start-Sleep -Seconds $WarmupSeconds

    $script:serviceProcesses += [PSCustomObject]@{
        Name    = $Name
        Process = $process
    }
}

function Ensure-ExtensionReady {
    Push-Location $extensionPath
    try {
        if (-not (Test-Path (Join-Path $extensionPath "node_modules"))) {
            Write-Host "Installing VS Code extension dependencies..." -ForegroundColor Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed ($LASTEXITCODE)"
            }
        }

        Write-Host "Compiling VS Code extension..." -ForegroundColor Yellow
        npm run compile
        if ($LASTEXITCODE -ne 0) {
            throw "npm run compile failed ($LASTEXITCODE)"
        }
    } finally {
        Pop-Location
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Toobix VS Code Extension" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hadError = $false

try {
    Write-Host "[1/4] Starting Hardware Awareness Service..." -ForegroundColor Yellow
    Start-ToobixService -Name "Hardware Awareness (Port 8940)" -ScriptName "hardware-awareness-v2.ts" -WarmupSeconds 2

    Write-Host "[2/4] Starting Unified Service Gateway..." -ForegroundColor Yellow
    Start-ToobixService -Name "Unified Service Gateway (Port 9000)" -ScriptName "unified-service-gateway.ts" -WarmupSeconds 3

    Write-Host "[3/4] Preparing VS Code extension build..." -ForegroundColor Yellow
    Ensure-ExtensionReady

    Write-Host "[4/4] Opening VS Code workspace..." -ForegroundColor Yellow
    $vscodeLocations = @(
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe",
        "$env:ProgramFiles\Microsoft VS Code\Code.exe",
        "$env:ProgramFiles(x86)\Microsoft VS Code\Code.exe"
    )

    $vscodePath = $null
    foreach ($candidate in $vscodeLocations) {
        if (Test-Path $candidate) {
            $vscodePath = $candidate
            break
        }
    }

    if ($vscodePath) {
        Start-Process -FilePath $vscodePath -ArgumentList $extensionPath
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  SUCCESS! VS Code is opening..." -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
    } else {
        try {
            Start-Process -FilePath "code" -ArgumentList $extensionPath
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  SUCCESS! VS Code (code) is opening..." -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
        } catch {
            Write-Host "WARNING: Could not find VS Code installation automatically." -ForegroundColor Yellow
            Write-Host "Please open this folder manually in VS Code:" -ForegroundColor Yellow
            Write-Host "  $extensionPath" -ForegroundColor White
            Write-Host ""
        }
    }

    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. In VS Code, press F5 (Run Extension)" -ForegroundColor White
    Write-Host "2. Wait for the Extension Development Host window" -ForegroundColor White
    Write-Host "3. If needed, open the root folder: $repoRoot" -ForegroundColor White
    Write-Host "4. Click the Toobix icon in the Activity Bar" -ForegroundColor White
    Write-Host ""
    Write-Host "Services running:" -ForegroundColor Yellow
    Write-Host "  - Hardware Awareness:  http://localhost:8940" -ForegroundColor White
    Write-Host "  - Unified Gateway:     http://localhost:9000" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    $hadError = $true
} finally {
    if (-not $env:TOOBIX_NONINTERACTIVE) {
        Write-Host "Press Enter to stop all Toobix services..." -ForegroundColor Yellow
        [void][System.Console]::ReadLine()
    }
    Stop-ToobixServices
    if ($hadError) {
        exit 1
    }
}
