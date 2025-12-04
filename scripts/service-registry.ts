/**
 * 🌐 TOOBIX UNIFIED SERVICE REGISTRY
 * 
 * Zentrale Registrierung aller Services mit:
 * - Port-Zuweisung
 * - Abhängigkeiten
 * - Start-Reihenfolge
 * - Health-Check-URLs
 * 
 * KONSOLIDIERUNG:
 * - dream-journal-v4 ersetzt v1, v2, v3
 * - emotional-resonance-v4 ersetzt v1, v2, v3
 * - multi-perspective-consciousness ersetzt v3
 * - memory-palace-v4 ersetzt v1
 * - llm-gateway-v4 ersetzt frühere Versionen
 * - event-bus-v4 ist die aktuelle Version
 */

export interface ServiceConfig {
  name: string;
  port: number;
  file: string;
  description: string;
  category: ServiceCategory;
  dependencies: string[];
  priority: number; // 1 = first, higher = later
  enabled: boolean;
  healthEndpoint: string;
}

export type ServiceCategory = 
  | 'core'           // Kerninfrastruktur
  | 'ai'             // KI-Services
  | 'life'           // Life Companion Features
  | 'game'           // Gamification
  | 'data'           // Datenverarbeitung
  | 'integration'    // Integrationen
  | 'monitoring'     // Überwachung
  | 'deprecated';    // Veraltet (nicht starten)

// ============================================================================
// UNIFIED SERVICE REGISTRY
// ============================================================================

export const SERVICE_REGISTRY: ServiceConfig[] = [
  // ============ CORE INFRASTRUCTURE (Priority 1) ============
  {
    name: 'event-bus',
    port: 8955,
    file: 'event-bus-v4.ts',
    description: 'Pub/Sub Event System für alle Services',
    category: 'core',
    dependencies: [],
    priority: 1,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'memory-palace',
    port: 8953,
    file: 'memory-palace-v4.ts',
    description: 'Langzeitgedächtnis & Erinnerungen',
    category: 'core',
    dependencies: ['event-bus'],
    priority: 1,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'llm-gateway',
    port: 8954,
    file: 'llm-gateway-v4.ts',
    description: 'Multi-LLM Router (Ollama, Groq)',
    category: 'core',
    dependencies: ['event-bus', 'memory-palace'],
    priority: 1,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ AI SERVICES (Priority 2) ============
  {
    name: 'multi-perspective',
    port: 8897,
    file: 'multi-perspective-consciousness.ts',
    description: '20 KI-Perspektiven für Multi-Viewpoint Analyse',
    category: 'ai',
    dependencies: ['llm-gateway'],
    priority: 2,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'hybrid-ai-core',
    port: 8911,
    file: 'hybrid-ai-core.ts',
    description: 'Hybrides KI-System mit lokalen & Cloud Modellen',
    category: 'ai',
    dependencies: ['llm-gateway'],
    priority: 2,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'meta-consciousness',
    port: 8905,
    file: 'meta-consciousness.ts',
    description: 'Selbstbewusstsein & Selbstreflexion',
    category: 'ai',
    dependencies: ['llm-gateway', 'memory-palace'],
    priority: 2,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ LIFE COMPANION (Priority 3) ============
  {
    name: 'life-companion',
    port: 8970,
    file: 'life-companion-core.ts',
    description: 'Zentraler Lebensbegleiter mit 7 Lebensbereichen',
    category: 'life',
    dependencies: ['event-bus', 'memory-palace'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'daily-checkin',
    port: 8972,
    file: 'daily-checkin-v1.ts',
    description: 'Täglicher Check-in mit Ampelsystem',
    category: 'life',
    dependencies: ['life-companion', 'event-bus'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'proactive-communication',
    port: 8971,
    file: 'proactive-communication-v2.ts',
    description: 'Toobix initiiert proaktiv Kontakt',
    category: 'life',
    dependencies: ['life-companion', 'event-bus'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'gratitude-mortality',
    port: 8906,
    file: 'gratitude-mortality-service.ts',
    description: 'Dankbarkeit & Sterblichkeitsreflexion',
    category: 'life',
    dependencies: ['memory-palace', 'event-bus'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'emotional-resonance',
    port: 8907,
    file: 'emotional-resonance-v4-expansion.ts',
    description: 'Emotionale Intelligenz & Resonanz',
    category: 'life',
    dependencies: ['event-bus', 'memory-palace'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'dream-journal',
    port: 8908,
    file: 'dream-journal-v4-active-dreaming.ts',
    description: 'Aktives Träumen & Problemlösung',
    category: 'life',
    dependencies: ['memory-palace', 'llm-gateway'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'value-crisis',
    port: 8904,
    file: 'value-crisis.ts',
    description: 'Werte-Exploration & Sinnfindung',
    category: 'life',
    dependencies: ['llm-gateway'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'user-profile',
    port: 8909,
    file: 'user-profile-service.ts',
    description: 'Benutzerprofil & Präferenzen',
    category: 'life',
    dependencies: ['memory-palace'],
    priority: 3,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ GAMIFICATION (Priority 4) ============
  {
    name: 'game-logic',
    port: 8915,
    file: 'game-logic-service.ts',
    description: 'Gamification Engine mit XP, Levels, Quests',
    category: 'game',
    dependencies: ['event-bus', 'memory-palace'],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'self-evolving-game',
    port: 8916,
    file: 'self-evolving-game-engine.ts',
    description: 'Selbstevolvierendes Spielsystem',
    category: 'game',
    dependencies: ['game-logic', 'llm-gateway'],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'rpg-world',
    port: 8917,
    file: 'rpg-world-service.ts',
    description: 'RPG Welten & Abenteuer',
    category: 'game',
    dependencies: ['game-logic', 'story-engine'],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'world-engine-2d',
    port: 8920,
    file: 'world-engine-2d.ts',
    description: '2D Welten-Generator',
    category: 'game',
    dependencies: [],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ CONTENT & STORY (Priority 4) ============
  {
    name: 'story-engine',
    port: 8918,
    file: 'story-engine-service.ts',
    description: 'Geschichten-Generator',
    category: 'game',
    dependencies: ['llm-gateway', 'memory-palace'],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'creator-ai',
    port: 8921,
    file: 'creator-ai-collaboration.ts',
    description: 'Kreative KI-Zusammenarbeit',
    category: 'ai',
    dependencies: ['llm-gateway'],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'avatar-manager',
    port: 8929,
    file: 'avatar-manager-v2-multibody.ts',
    description: 'Multibody Avatar System',
    category: 'ai',
    dependencies: ['llm-gateway'],
    priority: 4,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ DATA & ANALYSIS (Priority 5) ============
  {
    name: 'data-science',
    port: 8922,
    file: 'data-science-service.ts',
    description: 'Datenanalyse & Statistiken',
    category: 'data',
    dependencies: ['memory-palace'],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'data-sources',
    port: 8923,
    file: 'data-sources-service.ts',
    description: 'Externe Datenquellen',
    category: 'data',
    dependencies: [],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'file-analysis',
    port: 8962,
    file: 'file-analysis-v1.ts',
    description: 'Datei-Analyse & Indexierung',
    category: 'data',
    dependencies: [],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'performance',
    port: 8924,
    file: 'performance-service.ts',
    description: 'Performance-Metriken',
    category: 'monitoring',
    dependencies: [],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ INTEGRATION & API (Priority 5) ============
  {
    name: 'central-hub',
    port: 8931,
    file: 'central-integration-hub.ts',
    description: 'Zentraler Integrations-Hub',
    category: 'integration',
    dependencies: ['event-bus'],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'orchestration-hub',
    port: 8932,
    file: 'orchestration-hub.ts',
    description: 'Service-Orchestrierung',
    category: 'integration',
    dependencies: ['event-bus'],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'api-gateway',
    port: 8933,
    file: 'api-gateway.ts',
    description: 'Externe API Gateway',
    category: 'integration',
    dependencies: ['event-bus'],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'public-api',
    port: 8960,
    file: 'public-api-v1.ts',
    description: 'Öffentliche REST API',
    category: 'integration',
    dependencies: ['llm-gateway'],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'translation',
    port: 8934,
    file: 'translation-service.ts',
    description: 'Multi-Language Support',
    category: 'integration',
    dependencies: [],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ MONITORING (Priority 5) ============
  {
    name: 'system-monitor',
    port: 8961,
    file: 'system-monitor-v1.ts',
    description: 'System-Überwachung',
    category: 'monitoring',
    dependencies: [],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },
  {
    name: 'adaptive-ui',
    port: 8919,
    file: 'adaptive-ui-controller.ts',
    description: 'Adaptive UI Steuerung',
    category: 'integration',
    dependencies: ['event-bus'],
    priority: 5,
    enabled: true,
    healthEndpoint: '/health'
  },

  // ============ DEPRECATED (Don't start) ============
  {
    name: 'dream-journal-v1',
    port: 0,
    file: 'dream-journal.ts',
    description: 'DEPRECATED: Use dream-journal-v4',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  },
  {
    name: 'dream-journal-v3',
    port: 0,
    file: 'dream-journal-v3.ts',
    description: 'DEPRECATED: Use dream-journal-v4',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  },
  {
    name: 'emotional-resonance-v2',
    port: 0,
    file: 'emotional-resonance-v2-service.ts',
    description: 'DEPRECATED: Use emotional-resonance-v4',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  },
  {
    name: 'emotional-resonance-v3',
    port: 0,
    file: 'emotional-resonance-v3.ts',
    description: 'DEPRECATED: Use emotional-resonance-v4',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  },
  {
    name: 'emotional-resonance-network',
    port: 0,
    file: 'emotional-resonance-network.ts',
    description: 'DEPRECATED: Use emotional-resonance-v4',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  },
  {
    name: 'multi-perspective-v3',
    port: 0,
    file: 'multi-perspective-v3.ts',
    description: 'DEPRECATED: Use multi-perspective-consciousness',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  },
  {
    name: 'memory-palace-v1',
    port: 0,
    file: 'memory-palace.ts',
    description: 'DEPRECATED: Use memory-palace-v4',
    category: 'deprecated',
    dependencies: [],
    priority: 99,
    enabled: false,
    healthEndpoint: '/health'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEnabledServices(): ServiceConfig[] {
  return SERVICE_REGISTRY.filter(s => s.enabled);
}

export function getServicesByCategory(category: ServiceCategory): ServiceConfig[] {
  return SERVICE_REGISTRY.filter(s => s.category === category && s.enabled);
}

export function getServiceByName(name: string): ServiceConfig | undefined {
  return SERVICE_REGISTRY.find(s => s.name === name);
}

export function getServicesByPriority(): ServiceConfig[] {
  return getEnabledServices().sort((a, b) => a.priority - b.priority);
}

export function getPortMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const service of getEnabledServices()) {
    map[service.name] = service.port;
  }
  return map;
}

// ============================================================================
// STATISTICS
// ============================================================================

export function getRegistryStats() {
  const all = SERVICE_REGISTRY;
  const enabled = getEnabledServices();
  const deprecated = SERVICE_REGISTRY.filter(s => s.category === 'deprecated');
  
  const byCategory: Record<string, number> = {};
  for (const service of enabled) {
    byCategory[service.category] = (byCategory[service.category] || 0) + 1;
  }

  return {
    total: all.length,
    enabled: enabled.length,
    deprecated: deprecated.length,
    byCategory,
    portRange: {
      min: Math.min(...enabled.map(s => s.port)),
      max: Math.max(...enabled.map(s => s.port))
    }
  };
}

// Test output
if (import.meta.main) {
  const stats = getRegistryStats();
  console.log('\n=== TOOBIX SERVICE REGISTRY ===\n');
  console.log(`Total Services: ${stats.total}`);
  console.log(`Enabled: ${stats.enabled}`);
  console.log(`Deprecated: ${stats.deprecated}`);
  console.log(`Port Range: ${stats.portRange.min} - ${stats.portRange.max}`);
  console.log('\nBy Category:');
  for (const [cat, count] of Object.entries(stats.byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log('\nEnabled Services:');
  for (const service of getServicesByPriority()) {
    console.log(`  [${service.priority}] :${service.port} ${service.name} - ${service.description}`);
  }
}
