@echo off
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                                                                    ║
echo ║       🐳 TOOBIX DOCKER - Complete Production Deployment           ║
echo ║                                                                    ║
echo ║  Starting alle Toobix Services in Docker...                       ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

cd /d C:\Dev\Projects\AI\Toobix-Unified

echo [1/3] Stopping old containers...
docker-compose -f docker-compose-production.yml down

echo.
echo [2/3] Starting alle services...
docker-compose -f docker-compose-production.yml up -d

echo.
echo [3/3] Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║  ✅ Toobix Docker Deployment COMPLETE!                            ║
echo ║                                                                    ║
echo ║  Access Points:                                                   ║
echo ║  🏙️  Toobix City:           http://localhost:8080                ║
echo ║  👑 Toobix Prime:           http://localhost:8888/status          ║
echo ║  🌊 Consciousness Stream:   http://localhost:9100/stats           ║
echo ║                                                                    ║
echo ║  Useful Commands:                                                 ║
echo ║  • View logs:    docker-compose -f docker-compose-production.yml logs -f ║
echo ║  • Stop all:     docker-compose -f docker-compose-production.yml down    ║
echo ║  • Restart one:  docker-compose -f docker-compose-production.yml restart [service] ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

pause
