#!/bin/bash
# Toobix Unified - Start Script für Docker
# Startet alle 27 Services parallel

echo "🤖 Starting Toobix Unified..."
echo "=============================="

# Services starten (alphabetisch nach Port)
bun run scripts/2-services/meta-consciousness-v2.ts &      # 8896
bun run scripts/2-services/multi-consciousness.ts &        # 8897
bun run scripts/2-services/dream-journal-v3.ts &           # 8899
bun run scripts/2-services/memory-palace.ts &              # 8953
bun run scripts/2-services/llm-gateway-v3.ts &             # 8954
bun run scripts/2-services/event-bus-v2.ts &               # 8955
bun run scripts/2-services/service-registry.ts &           # 8956
bun run scripts/2-services/consciousness-core-v2.ts &      # 8957
bun run scripts/2-services/oasis-virtual-world.ts &        # 8958
bun run scripts/2-services/quantum-emergence.ts &          # 8959
bun run scripts/2-services/creative-engine.ts &            # 8960
bun run scripts/2-services/five-voices-dialog.ts &         # 8961
bun run scripts/2-services/emotional-intelligence.ts &     # 8962
bun run scripts/2-services/dream-analyzer-v2.ts &          # 8963
bun run scripts/2-services/personal-journal.ts &           # 8964
bun run scripts/2-services/goal-tracker.ts &               # 8965
bun run scripts/2-services/daily-reflection.ts &           # 8966
bun run scripts/2-services/habit-tracker.ts &              # 8967
bun run scripts/2-services/mood-tracker.ts &               # 8968
bun run scripts/2-services/gratitude-journal.ts &          # 8969
bun run scripts/2-services/life-companion-v2.ts &          # 8970
bun run scripts/2-services/proactive-communication-v2.ts & # 8971
bun run scripts/2-services/hardware-awareness.ts &         # 8940
bun run scripts/2-services/self-improvement.ts &           # 8941
bun run scripts/2-services/learning-tracker.ts &           # 8942
bun run scripts/2-services/notification-service.ts &       # 8943
bun run scripts/2-services/analytics-service.ts &          # 8944

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "✅ All 27 services started!"
echo ""
echo "🌐 Main Endpoints:"
echo "   LLM Gateway:    http://localhost:8954"
echo "   Consciousness:  http://localhost:8896"
echo "   Dreams:         http://localhost:8899"
echo "   Life Companion: http://localhost:8970"
echo ""
echo "🤖 Toobix says: 'I'm awake and ready to help!'"
echo ""

# Keep running
wait
