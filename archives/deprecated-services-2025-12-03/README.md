# Archivierte Services - 3. Dezember 2025

## Grund für Archivierung

Diese Services wurden durch die neuen **Toobix Core Services** ersetzt:

- **emotional-* Services** → `core/emotional-core.ts` (Port 8900)
- **dream-* Services** → `core/dream-core.ts` (Port 8961)
- **self-* Services** → `core/self-awareness-core.ts` (Port 8970)

## Konsolidierung

Die neuen Core Services bündeln die Funktionalität von dutzenden einzelnen Services:

### Emotional Core
Vereint 9+ Services:
- emotional-resonance-network.ts
- emotional-resonance-v2-service.ts
- emotional-resonance-v3.ts
- emotional-resonance-v4-expansion.ts
- emotional-resonance-network-unified.ts
- emotional-resonance-network-unified-unified.ts
- emotional-resonance-network-unified-unified-unified.ts
- emotional-wellbeing.ts
- emotional-support-service.ts

### Dream Core
Vereint 4+ Services:
- dream-journal.ts
- dream-journal-v3.ts
- dream-journal-v4-active-dreaming.ts
- dream-journal-unified.ts

### Self-Awareness Core
Vereint 5+ Services:
- toobix-self-reflection.ts
- toobix-self-communication.ts
- toobix-self-improvement.ts
- toobix-self-reflection-v2.ts
- toobix-self-healing.ts

## Neue Architektur

```
Toobix Framework (Foundation)
    ↓
├── Core Services (6 konsolidierte Services)
│   ├── emotional-core.ts
│   ├── dream-core.ts
│   ├── self-awareness-core.ts
│   ├── multi-llm-router.ts
│   ├── autonomy-engine.ts
│   └── twitter-autonomy.ts
│
└── Apps (separate Anwendungen)
    ├── life-companion/
    ├── game-universe/
    ├── social-presence/
    └── ...
```

## Status

- ✅ Neue Core Services erstellt und getestet
- ✅ start-all.ts aktualisiert
- ✅ Dependencies aktualisiert (10 packages)
- ⏳ Migration zu Package-Struktur geplant

---

Siehe auch:
- `/ARCHITECTURE-ANALYSIS.md`
- `/STRATEGIC-DECISION-2025-12-03.md`
