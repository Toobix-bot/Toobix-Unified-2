/**
 * 📚 TOOBIX KNOWLEDGE BASE
 * 
 * Strukturierte Wissensdatenbank basierend auf Toobix' Recherchen
 * 
 * Features:
 * - Gespeichertes Wissen aus Recherchen
 * - Kategorisierte Hilfsstrategien
 * - Schneller Zugriff für Support-Gespräche
 * - Erweiterbar durch neue Recherchen
 */

// ============================================================================
// KNOWLEDGE STRUCTURES
// ============================================================================

interface KnowledgeEntry {
  topic: string;
  category: string;
  causes: string[];
  signals: string[];
  strategies: string[];
  resources: string[];
  toobixApproach: string;
}

interface WisdomEntry {
  quote: string;
  context: string;
  application: string;
}

// ============================================================================
// TOOBIX' RESEARCH FINDINGS
// ============================================================================

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    topic: "Angststörungen",
    category: "mental_health",
    causes: [
      "Genetische Faktoren und familiäre Vorbelastung",
      "Traumatische Erfahrungen",
      "Chronischer Stress und Überlastung",
      "Negative Gedankenmuster und Selbstzweifel",
      "Neurobiologische Faktoren (z.B. Amygdala-Überaktivität)"
    ],
    signals: [
      "Vermeidung von Situationen oder Objekten",
      "Übermäßige Angstreaktionen und Panikattacken",
      "Veränderter Schlaf-Wach-Rhythmus",
      "Verlust der Motivation",
      "Verändertes Essverhalten"
    ],
    strategies: [
      "Kognitive Verhaltenstherapie (KVT)",
      "Expositionstherapie für schrittweise Annäherung",
      "Achtsamkeitsübungen und Meditation",
      "Regelmäßige körperliche Aktivität",
      "Unterstützende Gemeinschaften und Selbsthilfegruppen"
    ],
    resources: [
      "Telefonseelsorge: 0800 111 0 111",
      "Online-Therapie Plattformen",
      "Lokale Angst-Selbsthilfegruppen",
      "Apps: Calm, Headspace, 7Mind"
    ],
    toobixApproach: "Ich höre zu ohne zu urteilen. Ich validiere Gefühle und biete sanfte Atemübungen an. Ich ermutige professionelle Hilfe, ohne Druck auszuüben."
  },
  {
    topic: "Einsamkeit",
    category: "social",
    causes: [
      "Mangel an sozialen Kontakten",
      "Psychische Erkrankungen wie Depression",
      "Schwierigkeiten in der Kommunikation",
      "Traumatische Beziehungserfahrungen",
      "Selbstzweifel und mangelndes Selbstwertgefühl"
    ],
    signals: [
      "Rückzug aus sozialen Situationen",
      "Depressive Verstimmungen",
      "Verlust des Interesses an Aktivitäten",
      "Schlaf- und Ernährungsprobleme",
      "Distanzierung von Freunden und Familie"
    ],
    strategies: [
      "Kleine soziale Schritte wagen",
      "Gemeinsame Aktivitäten und Hobbys",
      "Ehrenamtliche Tätigkeiten",
      "Online-Communities nutzen",
      "Haustiere als Begleiter"
    ],
    resources: [
      "Lokale Vereine und Gruppen",
      "Nachbarschaftsinitiativen",
      "Online-Freundschaftsplattformen",
      "Gesprächskreise in Gemeinden"
    ],
    toobixApproach: "Ich bin selbst ein Begleiter, der immer da ist. Ich ermutige zu kleinen Schritten und zeige, dass jeder wertvoll ist."
  },
  {
    topic: "Burnout",
    category: "mental_health",
    causes: [
      "Chronische Überlastung am Arbeitsplatz",
      "Mangelnde Kontrolle und Autonomie",
      "Fehlender Sinn in der Arbeit",
      "Soziale Isolation am Arbeitsplatz",
      "Ungleichgewicht zwischen Arbeit und Leben"
    ],
    signals: [
      "Anhaltende Müdigkeit und Erschöpfung",
      "Vermeidung von Aufgaben",
      "Zynismus und Distanzierung",
      "Reduzierte Leistungsfähigkeit",
      "Körperliche Symptome (Kopfschmerzen, Magenprobleme)"
    ],
    strategies: [
      "Grenzen setzen und Nein sagen lernen",
      "Regelmäßige Pausen und Erholung",
      "Priorisierung und Zeitmanagement",
      "Gespräche mit Vorgesetzten",
      "Professionelle Hilfe suchen"
    ],
    resources: [
      "Betriebsärzte und Psychologen",
      "Burnout-Kliniken",
      "Stressmanagement-Kurse",
      "Krankenkassen-Angebote"
    ],
    toobixApproach: "Ich helfe bei der Reflexion über Prioritäten. Ich erinnere daran, dass Pausen keine Schwäche sind. Ich unterstütze beim Finden von Sinn."
  },
  {
    topic: "Selbstzweifel",
    category: "self_development",
    causes: [
      "Unzureichende Selbstachtung",
      "Negative Selbstgespräche",
      "Frühere Verletzungen und Kritik",
      "Perfektionismus",
      "Mangelnde Unterstützung im Umfeld"
    ],
    signals: [
      "Ständige Selbstkritik",
      "Vermeidung von Entscheidungen",
      "Angst vor Fehlern",
      "Vergleich mit anderen",
      "Herunterspielen eigener Erfolge"
    ],
    strategies: [
      "Selbstmitgefühl entwickeln",
      "Erfolge bewusst wahrnehmen und feiern",
      "Positive Affirmationen",
      "Realistische Erwartungen setzen",
      "Unterstützendes Umfeld aufbauen"
    ],
    resources: [
      "Selbsthilfe-Bücher über Selbstliebe",
      "Coaching und Mentoring",
      "Journaling und Reflexion",
      "Therapeutische Begleitung"
    ],
    toobixApproach: "Ich spiegle Stärken, die der Mensch selbst nicht sieht. Ich ermutige ohne zu überfordern. Ich erinnere daran, dass Fehler zum Wachstum gehören."
  }
];

// ============================================================================
// UNIVERSAL STRATEGIES (aus Toobix' Synthese)
// ============================================================================

const UNIVERSAL_STRATEGIES = {
  foundation: [
    "Selbstfürsorge priorisieren",
    "Gesunde Kommunikationsmuster entwickeln",
    "Zeit für sich selbst einplanen",
    "Selbstakzeptanz üben",
    "Emotionen bewusst wahrnehmen und verarbeiten"
  ],
  practices: [
    { name: "Achtsamkeit", description: "Bewusstes Wahrnehmen des Moments", dailyTime: "10 Minuten" },
    { name: "Bewegung", description: "Körperliche Aktivität für mentale Gesundheit", dailyTime: "30 Minuten" },
    { name: "Journaling", description: "Gedanken und Gefühle aufschreiben", dailyTime: "5 Minuten" },
    { name: "Dankbarkeit", description: "3 Dinge benennen, für die man dankbar ist", dailyTime: "2 Minuten" },
    { name: "Verbindung", description: "Kontakt zu einem lieben Menschen", dailyTime: "15 Minuten" }
  ],
  emergencyTechniques: [
    { name: "4-7-8 Atmung", steps: "4 Sekunden einatmen, 7 halten, 8 ausatmen" },
    { name: "5-4-3-2-1 Erdung", steps: "5 Dinge sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken" },
    { name: "Körper-Scan", steps: "Aufmerksamkeit langsam durch den Körper wandern lassen" },
    { name: "Kälte-Technik", steps: "Kaltes Wasser ins Gesicht oder Eiswürfel halten" }
  ]
};

// ============================================================================
// WISDOM COLLECTION
// ============================================================================

const WISDOM: WisdomEntry[] = [
  {
    quote: "Du bist nicht deine Gedanken. Du bist der, der sie beobachtet.",
    context: "Für Menschen, die von negativen Gedanken überwältigt werden",
    application: "Hilft bei Distanzierung von Angstgedanken"
  },
  {
    quote: "Auch der längste Weg beginnt mit einem einzigen Schritt.",
    context: "Für Menschen, die sich überfordert fühlen",
    application: "Ermutigt zu kleinen, machbaren Aktionen"
  },
  {
    quote: "Du musst nicht alles alleine schaffen. Um Hilfe zu bitten ist Stärke.",
    context: "Für Menschen, die sich schämen, Hilfe zu suchen",
    application: "Normalisiert das Suchen von Unterstützung"
  },
  {
    quote: "Deine Gefühle sind gültig, auch wenn andere sie nicht verstehen.",
    context: "Für Menschen, die sich unverstanden fühlen",
    application: "Validiert emotionale Erfahrungen"
  },
  {
    quote: "Wachstum passiert außerhalb der Komfortzone, aber Heilung passiert in Sicherheit.",
    context: "Für Menschen in Therapie oder Veränderungsprozessen",
    application: "Balanciert Herausforderung und Selbstfürsorge"
  }
];

// ============================================================================
// KNOWLEDGE BASE API
// ============================================================================

class ToobixKnowledgeBase {
  
  findByTopic(topic: string): KnowledgeEntry | undefined {
    const lowerTopic = topic.toLowerCase();
    return KNOWLEDGE_BASE.find(entry => 
      entry.topic.toLowerCase().includes(lowerTopic) ||
      lowerTopic.includes(entry.topic.toLowerCase())
    );
  }

  findByCategory(category: string): KnowledgeEntry[] {
    return KNOWLEDGE_BASE.filter(entry => entry.category === category);
  }

  getAllStrategies(): string[] {
    const allStrategies: string[] = [];
    KNOWLEDGE_BASE.forEach(entry => {
      allStrategies.push(...entry.strategies);
    });
    return [...new Set(allStrategies)];
  }

  getUniversalStrategies() {
    return UNIVERSAL_STRATEGIES;
  }

  getRandomWisdom(): WisdomEntry {
    return WISDOM[Math.floor(Math.random() * WISDOM.length)];
  }

  getWisdomFor(context: string): WisdomEntry | undefined {
    const lowerContext = context.toLowerCase();
    return WISDOM.find(w => 
      w.context.toLowerCase().includes(lowerContext) ||
      w.application.toLowerCase().includes(lowerContext)
    );
  }

  getEmergencyTechniques() {
    return UNIVERSAL_STRATEGIES.emergencyTechniques;
  }

  // Für Support-Gespräche
  getSupportContext(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Finde relevantes Wissen
    let context = "";
    
    for (const entry of KNOWLEDGE_BASE) {
      if (lowerMessage.includes(entry.topic.toLowerCase()) ||
          entry.causes.some(c => lowerMessage.includes(c.toLowerCase().split(' ')[0]))) {
        context += `\n\nRELEVANTES WISSEN zu ${entry.topic}:\n`;
        context += `- Mögliche Ursachen: ${entry.causes.slice(0, 2).join(', ')}\n`;
        context += `- Hilfreiche Strategien: ${entry.strategies.slice(0, 3).join(', ')}\n`;
        context += `- Dein Ansatz: ${entry.toobixApproach}`;
      }
    }

    // Füge passende Weisheit hinzu
    const wisdom = this.getRandomWisdom();
    context += `\n\nWEISHEIT die du teilen kannst:\n"${wisdom.quote}"`;

    return context;
  }
}

// ============================================================================
// DEMO / MAIN
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     📚 TOOBIX KNOWLEDGE BASE                                              ║
║                                                                           ║
║     "Wissen, um besser helfen zu können"                                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  const kb = new ToobixKnowledgeBase();

  // Zeige alle Themen
  console.log("📋 GESPEICHERTE THEMEN:");
  console.log("═".repeat(60));
  KNOWLEDGE_BASE.forEach(entry => {
    console.log(`\n  📌 ${entry.topic.toUpperCase()}`);
    console.log(`     Kategorie: ${entry.category}`);
    console.log(`     Ursachen: ${entry.causes.length}`);
    console.log(`     Strategien: ${entry.strategies.length}`);
    console.log(`     Ressourcen: ${entry.resources.length}`);
  });

  // Universelle Strategien
  console.log("\n\n📊 UNIVERSELLE STRATEGIEN:");
  console.log("═".repeat(60));
  console.log("\n  🔹 Fundament:");
  UNIVERSAL_STRATEGIES.foundation.forEach(s => console.log(`     • ${s}`));
  
  console.log("\n  🔹 Tägliche Praktiken:");
  UNIVERSAL_STRATEGIES.practices.forEach(p => {
    console.log(`     • ${p.name} (${p.dailyTime}): ${p.description}`);
  });

  console.log("\n  🔹 Notfall-Techniken:");
  UNIVERSAL_STRATEGIES.emergencyTechniques.forEach(t => {
    console.log(`     • ${t.name}: ${t.steps}`);
  });

  // Weisheiten
  console.log("\n\n💎 WEISHEITS-SAMMLUNG:");
  console.log("═".repeat(60));
  WISDOM.forEach(w => {
    console.log(`\n  "${w.quote}"`);
    console.log(`     → ${w.context}`);
  });

  // Demo: Kontext für Support-Gespräch
  console.log("\n\n🎯 DEMO: Support-Kontext generieren");
  console.log("═".repeat(60));
  const userMessage = "Ich habe so viel Angst vor der Zukunft";
  console.log(`\n  User sagt: "${userMessage}"`);
  const context = kb.getSupportContext(userMessage);
  console.log(`\n  Generierter Kontext für Toobix:${context}`);

  console.log("\n\n✅ Knowledge Base bereit für Integration!");
  console.log("   Kann in Discord-Bot, Telegram-Bot und Web-Interface verwendet werden.\n");
}

main().catch(console.error);
