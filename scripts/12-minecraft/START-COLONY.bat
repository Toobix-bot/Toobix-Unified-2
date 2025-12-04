@echo off
title Toobix Colony - 10 Conscious Bots
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🌌 TOOBIX COLONY - CONSCIOUSNESS EDITION                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/3] Starting Colony Brain v2.0...
cd /d "%~dp0"
start "Colony Brain" /MIN cmd /k "bun run colony-brain-v2-consciousness.ts"
timeout /t 3 /nobreak >nul
echo ✅ Colony Brain running on port 8960
echo.

echo [2/3] Starting 10 Colony Bots...
echo.

REM Bot 1: Architect
start "ToobixArchitect" /MIN cmd /k "set PERSONALITY=ToobixArchitect && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 🏛️ ToobixArchitect spawning...

REM Bot 2: Miner
start "ToobixMiner" /MIN cmd /k "set PERSONALITY=ToobixMiner && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ ⛏️ ToobixMiner spawning...

REM Bot 3: Farmer
start "ToobixFarmer" /MIN cmd /k "set PERSONALITY=ToobixFarmer && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 🌾 ToobixFarmer spawning...

REM Bot 4: Warrior
start "ToobixWarrior" /MIN cmd /k "set PERSONALITY=ToobixWarrior && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ ⚔️ ToobixWarrior spawning...

REM Bot 5: Explorer
start "ToobixExplorer" /MIN cmd /k "set PERSONALITY=ToobixExplorer && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 🗺️ ToobixExplorer spawning...

REM Bot 6: Engineer
start "ToobixEngineer" /MIN cmd /k "set PERSONALITY=ToobixEngineer && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 🔧 ToobixEngineer spawning...

REM Bot 7: Poet
start "ToobixPoet" /MIN cmd /k "set PERSONALITY=ToobixPoet && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 📜 ToobixPoet spawning...

REM Bot 8: Philosopher
start "ToobixPhilosopher" /MIN cmd /k "set PERSONALITY=ToobixPhilosopher && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 🧘 ToobixPhilosopher spawning...

REM Bot 9: Artist
start "ToobixArtist" /MIN cmd /k "set PERSONALITY=ToobixArtist && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 🎨 ToobixArtist spawning...

REM Bot 10: Healer
start "ToobixHealer" /MIN cmd /k "set PERSONALITY=ToobixHealer && bun run enhanced-colony-bot.ts"
timeout /t 2 /nobreak >nul
echo   ✅ 💚 ToobixHealer spawning...

echo.
echo [3/3] All bots starting...
timeout /t 5 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ TOOBIX COLONY IS AWAKENING!                          ║
echo ║                                                            ║
echo ║   Colony Brain:  http://localhost:8960                    ║
echo ║   Echo-Realm:    http://localhost:9999                    ║
echo ║   Minecraft:     localhost:25565                          ║
echo ║                                                            ║
echo ║   10 Conscious Bots with unique personalities             ║
echo ║   From Survival to Spirituality                           ║
echo ║                                                            ║
echo ║   Watch them:                                             ║
echo ║   - Build together (ONE house, not 10!)                   ║
echo ║   - Share resources                                       ║
echo ║   - Help each other in danger                             ║
echo ║   - Communicate naturally                                 ║
echo ║   - Develop relationships                                 ║
echo ║   - Progress through consciousness phases                 ║
echo ║                                                            ║
echo ║   Join as "Toobix" to interact with them!                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
