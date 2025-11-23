# TOOBIX UNIFIED - DESKTOP APP SETUP SCRIPT

Write-Host @"

╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🚀 TOOBIX UNIFIED - DESKTOP APP SETUP                      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "`n📦 Checking prerequisites...`n" -ForegroundColor Yellow

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check for Bun (optional but recommended)
try {
    $bunVersion = bun --version
    Write-Host "✅ Bun installed: $bunVersion" -ForegroundColor Green
    $useBun = $true
} catch {
    Write-Host "⚠️ Bun not found. Using npm instead." -ForegroundColor Yellow
    Write-Host "   (Install Bun for faster builds: https://bun.sh)" -ForegroundColor Gray
    $useBun = $false
}

# Navigate to desktop-app directory
$desktopAppPath = "C:\Dev\Projects\AI\Toobix-Unified\desktop-app"
if (!(Test-Path $desktopAppPath)) {
    Write-Host "❌ Desktop app directory not found at: $desktopAppPath" -ForegroundColor Red
    exit 1
}

Set-Location $desktopAppPath
Write-Host "`n📂 Working directory: $desktopAppPath`n" -ForegroundColor Cyan

# Install dependencies
Write-Host "📦 Installing dependencies...`n" -ForegroundColor Yellow

if ($useBun) {
    bun install
} else {
    npm install
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Dependencies installed successfully!`n" -ForegroundColor Green

# Create assets directory if it doesn't exist
$assetsPath = Join-Path $desktopAppPath "assets"
if (!(Test-Path $assetsPath)) {
    New-Item -ItemType Directory -Path $assetsPath | Out-Null
    Write-Host "📁 Created assets directory" -ForegroundColor Green
}

# Ask about Groq API key
Write-Host "`n🔑 Groq API Setup`n" -ForegroundColor Yellow
Write-Host "Do you have a Groq API key? (You can set this later in the app)" -ForegroundColor Gray
Write-Host "Get one at: https://console.groq.com`n" -ForegroundColor Gray

$hasKey = Read-Host "Do you have an API key now? (y/n)"

if ($hasKey -eq "y") {
    $apiKey = Read-Host "Enter your Groq API key"
    if ($apiKey) {
        # Store in user config (app will read this on first launch)
        $configPath = Join-Path $env:APPDATA "toobix-unified"
        if (!(Test-Path $configPath)) {
            New-Item -ItemType Directory -Path $configPath | Out-Null
        }
        
        $config = @{
            groq_api_key = $apiKey
        } | ConvertTo-Json
        
        $config | Out-File -FilePath (Join-Path $configPath "config.json") -Encoding UTF8
        Write-Host "`n✅ API key saved!`n" -ForegroundColor Green
    }
} else {
    Write-Host "`n💡 No problem! You can set it later in Settings.`n" -ForegroundColor Gray
}

# Show next steps
Write-Host @"

╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        ✅ SETUP COMPLETE!                                         ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "🎯 NEXT STEPS:`n" -ForegroundColor Cyan

Write-Host "1️⃣  Start Development Mode:" -ForegroundColor Yellow
if ($useBun) {
    Write-Host "   bun run dev`n" -ForegroundColor White
} else {
    Write-Host "   npm run dev`n" -ForegroundColor White
}

Write-Host "2️⃣  Build for Production:" -ForegroundColor Yellow
Write-Host "   Windows:  npm run build:win" -ForegroundColor White
Write-Host "   macOS:    npm run build:mac" -ForegroundColor White
Write-Host "   Linux:    npm run build:linux`n" -ForegroundColor White

Write-Host "3️⃣  Configure Groq API (if not done):" -ForegroundColor Yellow
Write-Host "   Open app → Settings → Enter API Key`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   README.md in the desktop-app folder`n" -ForegroundColor White

Write-Host "🚀 Ready to launch Toobix Unified!`n" -ForegroundColor Green

# Ask if user wants to start dev mode now
$startNow = Read-Host "Start development mode now? (y/n)"

if ($startNow -eq "y") {
    Write-Host "`n🚀 Starting Toobix Unified Launcher...`n" -ForegroundColor Cyan
    
    if ($useBun) {
        bun run dev
    } else {
        npm run dev
    }
}
