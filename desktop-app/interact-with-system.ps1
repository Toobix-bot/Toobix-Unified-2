# TOOBIX UNIFIED - SYSTEM INTERACTION SCRIPT
# Interactive PowerShell script to test and interact with the system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TOOBIX UNIFIED - SYSTEM INTERACTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost"

# Function to check service health
function Test-Service {
    param([int]$port, [string]$name)

    try {
        $response = Invoke-WebRequest -Uri "${baseUrl}:${port}/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $name is running on port $port" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "[DOWN] $name is not running on port $port" -ForegroundColor Red
        return $false
    }
}

# Function to start a service
function Start-ToobixService {
    param([string]$scriptPath, [string]$name, [int]$port)

    Write-Host "[INFO] Starting $name..." -ForegroundColor Yellow
    $fullPath = "C:\Dev\Projects\AI\Toobix-Unified\$scriptPath"

    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Dev\Projects\AI\Toobix-Unified'; bun run '$scriptPath'" -WindowStyle Normal

    Write-Host "[WAIT] Waiting 3 seconds for service to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3

    if (Test-Service -port $port -name $name) {
        Write-Host "[SUCCESS] $name started successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[WARN] Service started but not responding yet" -ForegroundColor Yellow
        return $false
    }
}

# Function to make API request
function Invoke-ToobixAPI {
    param([int]$port, [string]$endpoint, [string]$method = "GET", [string]$body = $null)

    try {
        $params = @{
            Uri = "${baseUrl}:${port}${endpoint}"
            Method = $method
            TimeoutSec = 5
        }

        if ($body) {
            $params.Body = $body
            $params.ContentType = "application/json"
        }

        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "[ERROR] API request failed: $_" -ForegroundColor Red
        return $null
    }
}

# Main Menu
while ($true) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "MAIN MENU" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Check All Services Status"
    Write-Host "2. Start Game Engine (Port 8896)"
    Write-Host "3. Start Dream Journal (Port 8899)"
    Write-Host "4. Start Emotional Resonance (Port 8900)"
    Write-Host "5. Start Hybrid AI Core (Port 8915)"
    Write-Host "6. Test Game Engine - Create Game"
    Write-Host "7. Test Dream Journal - Add Dream"
    Write-Host "8. Test Emotional Resonance - Log Emotion"
    Write-Host "9. View Service Mesh Status"
    Write-Host "0. Exit"
    Write-Host ""

    $choice = Read-Host "Enter your choice"

    switch ($choice) {
        "1" {
            Write-Host "`n[INFO] Checking all services..." -ForegroundColor Yellow
            $services = @(
                @{Port=8896; Name="Game Engine"},
                @{Port=8897; Name="Multi-Perspective"},
                @{Port=8899; Name="Dream Journal"},
                @{Port=8900; Name="Emotional Resonance"},
                @{Port=8903; Name="Memory Palace"},
                @{Port=8904; Name="Meta-Consciousness"},
                @{Port=8910; Name="Service Mesh"},
                @{Port=8915; Name="Hybrid AI Core"},
                @{Port=8916; Name="Life-Domain Coach"}
            )

            foreach ($svc in $services) {
                Test-Service -port $svc.Port -name $svc.Name
            }
        }

        "2" {
            Start-ToobixService -scriptPath "scripts/2-services/self-evolving-game-engine.ts" -name "Game Engine" -port 8896
        }

        "3" {
            Start-ToobixService -scriptPath "scripts/2-services/dream-journal.ts" -name "Dream Journal" -port 8899
        }

        "4" {
            Start-ToobixService -scriptPath "scripts/2-services/emotional-resonance-network.ts" -name "Emotional Resonance" -port 8900
        }

        "5" {
            Start-ToobixService -scriptPath "scripts/2-services/hybrid-ai-core.ts" -name "Hybrid AI Core" -port 8915
        }

        "6" {
            Write-Host "`n[INFO] Creating a new game..." -ForegroundColor Yellow
            $gameData = @{
                action = "create_game"
                gameName = "Test Adventure"
                gameDescription = "A test game created from PowerShell"
            } | ConvertTo-Json

            $result = Invoke-ToobixAPI -port 8896 -endpoint "/game" -method "POST" -body $gameData
            if ($result) {
                Write-Host "`n[SUCCESS] Game created:" -ForegroundColor Green
                Write-Host ($result | ConvertTo-Json -Depth 3)
            }
        }

        "7" {
            Write-Host "`n[INFO] Adding a dream entry..." -ForegroundColor Yellow
            $dreamData = @{
                title = "Test Dream"
                content = "I dreamed about testing the Toobix system"
                emotions = @("curious", "excited")
            } | ConvertTo-Json

            $result = Invoke-ToobixAPI -port 8899 -endpoint "/dream" -method "POST" -body $dreamData
            if ($result) {
                Write-Host "`n[SUCCESS] Dream logged:" -ForegroundColor Green
                Write-Host ($result | ConvertTo-Json -Depth 3)
            }
        }

        "8" {
            Write-Host "`n[INFO] Logging an emotion..." -ForegroundColor Yellow
            $emotionData = @{
                emotion = "joy"
                intensity = 8
                context = "Testing the system successfully"
            } | ConvertTo-Json

            $result = Invoke-ToobixAPI -port 8900 -endpoint "/emotion" -method "POST" -body $emotionData
            if ($result) {
                Write-Host "`n[SUCCESS] Emotion logged:" -ForegroundColor Green
                Write-Host ($result | ConvertTo-Json -Depth 3)
            }
        }

        "9" {
            Write-Host "`n[INFO] Fetching Service Mesh status..." -ForegroundColor Yellow
            $result = Invoke-ToobixAPI -port 8910 -endpoint "/status"
            if ($result) {
                Write-Host "`n[SUCCESS] Service Mesh Status:" -ForegroundColor Green
                Write-Host ($result | ConvertTo-Json -Depth 3)
            }
        }

        "0" {
            Write-Host "`nGoodbye!" -ForegroundColor Green
            break
        }

        default {
            Write-Host "`n[ERROR] Invalid choice" -ForegroundColor Red
        }
    }

    if ($choice -eq "0") { break }
}
