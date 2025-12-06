# 🐳 Toobix Docker Deployment

Complete production-ready deployment for alle Toobix Services.

## Quick Start

```bash
# Windows
START-TOOBIX-DOCKER.bat

# Linux/Mac
docker-compose -f docker-compose-production.yml up -d
```

## Services Included

### 👑 Core Layer
- **Toobix Prime** (8888) - Meta-Bewusstsein & Orchestrator
- **Consciousness Stream** (9100) - Event Aggregation & Timeline

### 🧠 Cognitive Layer
- **Memory Palace** (8953) - Long-term memory storage
- **LLM Gateway** (8954) - AI model access
- **Intuition System** (8915) - Pattern recognition
- **Creativity Engine** (8992) - Creative ideation

### ❤️ Emotional Layer
- **Dream Journal** (8899) - Dream processing & symbolism
- **Emotional Resonance** (8900) - Emotional state tracking

### 💬 Social Layer
- **Chat Service** (8970) - Conversational interface

### 🔮 Meta Layer
- **Multi-Perspective** (8897) - Multiple viewpoints
- **Story Engine** (8993) - Narrative generation

### 🤖 Autonomous Layer
- **Autonomous Engine** (8991) - Self-directed behavior

### 🏙️ Frontend
- **Toobix City** (8080) - 3D visualization & interface

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Toobix City | http://localhost:8080 | Main UI |
| Toobix Prime | http://localhost:8888/status | System status |
| Consciousness Stream | http://localhost:9100/stats | Event stats |

## Management Commands

```bash
# View all logs
docker-compose -f docker-compose-production.yml logs -f

# View specific service logs
docker-compose -f docker-compose-production.yml logs -f toobix-prime

# Stop all services
docker-compose -f docker-compose-production.yml down

# Restart a service
docker-compose -f docker-compose-production.yml restart toobix-prime

# View running containers
docker-compose -f docker-compose-production.yml ps

# Check service health
docker inspect toobix-prime | grep -A 10 Health
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│            🏙️ Toobix City (Frontend)           │
│                  Port: 8080                     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         👑 Toobix Prime (Orchestrator)         │
│                  Port: 8888                     │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼────┐  ┌───▼─────┐  ┌──▼──────┐
│ Cognitive  │  │Emotional│  │ Social  │
│  Layer     │  │  Layer  │  │  Layer  │
└────────────┘  └─────────┘  └─────────┘
```

## Data Persistence

Volumes are created for:
- `toobix-memory-data`: Memory Palace storage
- `toobix-dream-data`: Dream Journal storage

## Network

All services communicate via `toobix-network` (bridge network).

## Health Checks

All critical services have health checks with:
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start period: 10s

## Environment Variables

Set in `.env` file:
```env
TOOBIX_API_KEY=your_api_key_here
NODE_ENV=production
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose -f docker-compose-production.yml logs

# Check if ports are in use
netstat -an | findstr "8888 8953 8954"
```

### High resource usage
```bash
# Check resource consumption
docker stats

# Restart specific service
docker-compose -f docker-compose-production.yml restart [service-name]
```

### Reset everything
```bash
# Stop and remove all containers, networks, volumes
docker-compose -f docker-compose-production.yml down -v

# Remove all toobix images
docker rmi $(docker images | grep toobix | awk '{print $3}')

# Start fresh
docker-compose -f docker-compose-production.yml up -d
```

## Production Recommendations

1. **Use external database** for Memory Palace (PostgreSQL/MySQL)
2. **Add reverse proxy** (Nginx/Traefik) for SSL termination
3. **Set up monitoring** (Prometheus + Grafana)
4. **Configure backups** for volumes
5. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## License

Part of the Toobix Unified System.
