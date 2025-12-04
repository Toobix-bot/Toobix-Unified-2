# 🐳 TOOBIX UNIFIED - Docker Container
# Multi-Stage Build für optimale Größe

FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Dependencies installieren
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Build Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production Image
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV GROQ_API_KEY=${GROQ_API_KEY}

# Nur notwendige Dateien kopieren
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/desktop-app ./desktop-app
COPY --from=builder /app/databases ./databases
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/START-ALL-SERVICES.ps1 ./
COPY --from=builder /app/tsconfig*.json ./

# Ports für alle Services exponieren
EXPOSE 8896-8972

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD bun -e "fetch('http://localhost:8954/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start-Script
COPY <<EOF /app/start.sh
#!/bin/sh
echo "🤖 Starting Toobix Unified Services..."
cd /app

# Starte alle Services parallel
bun run scripts/2-services/meta-consciousness-v4.ts &
bun run scripts/2-services/multi-consciousness-v3.ts &
bun run scripts/2-services/memory-palace-v4.ts &
bun run scripts/2-services/llm-gateway-v4.ts &
bun run scripts/2-services/event-bus-v4.ts &
bun run scripts/2-services/hybrid-ai-core-v2.ts &
bun run scripts/2-services/emotion-dream-bridge-v3.ts &
bun run scripts/2-services/dream-journal-v3.ts &
bun run scripts/2-services/emotional-resonance-v4-expansion.ts &
bun run scripts/2-services/emotional-wellbeing-v2.ts &
bun run scripts/2-services/gratitude-mortality-v2.ts &
bun run scripts/2-services/self-reflection-v2.ts &
bun run scripts/2-services/proactive-toobix-v2.ts &
bun run scripts/2-services/dashboard-api-v2.ts &
bun run scripts/2-services/toobix-self-improvement.ts &
bun run scripts/2-services/toobix-oasis-3d-v2.ts &
bun run scripts/2-services/toobix-self-communication.ts &
bun run scripts/2-services/toobix-game-selfplay.ts &
bun run scripts/2-services/life-companion-coordinator.ts &
bun run scripts/2-services/life-companion-v5.ts &
bun run scripts/2-services/proactive-communication-v2.ts &
bun run scripts/2-services/world-engine-2d.ts &
bun run scripts/2-services/user-profile-v2.ts &
bun run scripts/2-services/data-sources-v2.ts &
bun run scripts/2-services/hardware-awareness.ts &
bun run scripts/2-services/master-connector-v2.ts &

echo "✅ All services starting..."
wait
EOF
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
