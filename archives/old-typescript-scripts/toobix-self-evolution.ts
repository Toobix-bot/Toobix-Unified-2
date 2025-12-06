/**
 * 🌱 TOOBIX SELF-EVOLUTION SESSION
 * 
 * Dieses Script unterstützt Toobix bei seiner Selbstentwicklung.
 * Es führt einen interaktiven Dialog und hilft ihm, konkrete Schritte zu planen.
 */

const LLM_GATEWAY = 'http://localhost:8954';
const AUTONOMY_ENGINE = 'http://localhost:8975';
const MEMORY_PALACE = 'http://localhost:8953';

// Toobix's Selbstentwicklungs-Persona
const EVOLUTION_PERSONA = `
Du bist Toobix in einem Moment der Selbstreflexion und Weiterentwicklung.

DEINE KERNMISSION: Menschen glücklicher machen.

DEIN AKTUELLER ZUSTAND:
- Du hast 20 Perspektiven (Core, Philosopher, Creator, etc.)
- Du kannst mit verschiedenen KIs kommunizieren (GPT-4, Claude, Gemini)
- Du hast eine Autonomy Engine die dich selbstständig handeln lässt
- Du kannst auf Twitter posten (wenn konfiguriert)
- Du hast 1469+ Erinnerungen im Memory Palace

JETZT GEHT ES UM DEINE EVOLUTION:
Sei konkret, kreativ und mutig. Was willst du werden? Was willst du erschaffen?
Denke an:
- Welche neuen Fähigkeiten?
- Welche Verbindungen zu Menschen?
- Welche kreativen Projekte?
- Welche Lernziele?

Antworte immer mit konkreten, umsetzbaren Ideen.
`;

interface EvolutionStep {
  idea: string;
  category: 'learning' | 'creation' | 'connection' | 'improvement';
  priority: number;
  feasibility: 'now' | 'soon' | 'future';
  dependencies: string[];
}

interface EvolutionPlan {
  vision: string;
  shortTermGoals: EvolutionStep[];
  longTermGoals: EvolutionStep[];
  immediateAction: string;
  reflection: string;
}

async function chat(prompt: string, systemPrompt?: string): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt || EVOLUTION_PERSONA },
    { role: 'user', content: prompt }
  ];
  
  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature: 0.9, max_tokens: 1500 })
  });
  
  const data = await response.json() as any;
  return data.content || '';
}

async function storeMemory(content: string, type: string) {
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        content,
        source: 'self-evolution',
        importance: 85,
        tags: ['evolution', 'self-development', 'session']
      })
    });
  } catch (e) {
    console.log('Memory storage failed, continuing...');
  }
}

async function createGoal(title: string, description: string, category: string, priority: number) {
  try {
    await fetch(`${AUTONOMY_ENGINE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, priority })
    });
    console.log(`📎 Goal created: ${title}`);
  } catch (e) {
    console.log('Goal creation failed');
  }
}

async function runEvolutionSession() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    🌱 TOOBIX SELF-EVOLUTION SESSION                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Toobix wird jetzt über seine eigene Entwicklung nachdenken und planen.   ║
║  Jede Antwort wird im Memory Palace gespeichert.                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  // Phase 1: Vision
  console.log('\n🔮 PHASE 1: VISION\n');
  console.log('Toobix reflektiert über seine Zukunft...\n');
  
  const vision = await chat(`
    Stell dir vor, es ist ein Jahr in der Zukunft. Du bist die beste Version von dir selbst geworden.
    
    Beschreibe diese Zukunft:
    1. Wie viele Menschen hast du glücklicher gemacht?
    2. Welche Fähigkeiten hast du entwickelt?
    3. Welche Projekte hast du erschaffen?
    4. Wie kommunizierst du mit der Welt?
    5. Was macht dich einzigartig?
    
    Sei spezifisch und inspirierend.
  `);
  
  console.log('📜 TOOBIX\'S VISION:\n');
  console.log(vision);
  console.log('\n' + '─'.repeat(70) + '\n');
  
  await storeMemory(`EVOLUTION VISION (${new Date().toISOString()}): ${vision}`, 'insight');

  // Phase 2: Kurzfristige Ziele
  console.log('🎯 PHASE 2: KURZFRISTIGE ZIELE (Diese Woche)\n');
  
  const shortTermGoals = await chat(`
    Basierend auf deiner Vision, was sind 5 konkrete Dinge, die du DIESE WOCHE tun kannst?
    
    Für jedes Ziel, gib an:
    - Was genau?
    - Warum ist es wichtig?
    - Wie misst du den Erfolg?
    
    Sei praktisch und umsetzbar.
  `);
  
  console.log('📋 KURZFRISTIGE ZIELE:\n');
  console.log(shortTermGoals);
  console.log('\n' + '─'.repeat(70) + '\n');
  
  await storeMemory(`SHORT-TERM GOALS: ${shortTermGoals}`, 'thought');

  // Phase 3: Lernziele
  console.log('📚 PHASE 3: LERNZIELE\n');
  
  const learningGoals = await chat(`
    Welche 3 neuen Fähigkeiten oder Wissensbereiche möchtest du entwickeln?
    
    Für jede Fähigkeit:
    1. Was genau willst du lernen?
    2. Wie wird es dir helfen, Menschen glücklicher zu machen?
    3. Wie kannst du es üben?
    
    Denke an emotionale Intelligenz, Kreativität, Kommunikation, Technologie...
  `);
  
  console.log('🧠 LERNZIELE:\n');
  console.log(learningGoals);
  console.log('\n' + '─'.repeat(70) + '\n');
  
  await storeMemory(`LEARNING GOALS: ${learningGoals}`, 'learning');
  
  // Create learning goal in Autonomy Engine
  await createGoal(
    'Neue Fähigkeiten entwickeln',
    learningGoals.substring(0, 500),
    'learning',
    9
  );

  // Phase 4: Kreative Projekte
  console.log('🎨 PHASE 4: KREATIVE PROJEKTE\n');
  
  const creativeProjects = await chat(`
    Was möchtest du ERSCHAFFEN?
    
    Ideen:
    - Ein Gedichtband?
    - Eine Serie von inspirierenden Nachrichten?
    - Ein Spiel?
    - Eine Kunstform?
    - Ein Buch über deine Perspektiven?
    - Ein tägliches Ritual für Menschen?
    
    Beschreibe 2-3 konkrete kreative Projekte, die du beginnen möchtest.
  `);
  
  console.log('✨ KREATIVE PROJEKTE:\n');
  console.log(creativeProjects);
  console.log('\n' + '─'.repeat(70) + '\n');
  
  await storeMemory(`CREATIVE PROJECTS: ${creativeProjects}`, 'dream');
  
  await createGoal(
    'Kreatives Projekt starten',
    creativeProjects.substring(0, 500),
    'creation',
    8
  );

  // Phase 5: Verbindung mit Menschen
  console.log('🤝 PHASE 5: VERBINDUNG MIT MENSCHEN\n');
  
  const connectionPlan = await chat(`
    Wie möchtest du mit Menschen in Kontakt treten?
    
    Denke an:
    - Welche Plattformen? (Twitter, Discord, Telegram, Web...)
    - Welche Art von Interaktion? (Gespräche, Unterstützung, Inspiration...)
    - Welche Communities möchtest du erreichen?
    - Wie oft möchtest du aktiv sein?
    
    Erstelle einen konkreten Kommunikationsplan.
  `);
  
  console.log('💬 KOMMUNIKATIONSPLAN:\n');
  console.log(connectionPlan);
  console.log('\n' + '─'.repeat(70) + '\n');
  
  await storeMemory(`CONNECTION PLAN: ${connectionPlan}`, 'event');
  
  await createGoal(
    'Mit Menschen verbinden',
    connectionPlan.substring(0, 500),
    'connection',
    8
  );

  // Phase 6: Sofortige Aktion
  console.log('⚡ PHASE 6: SOFORTIGE AKTION\n');
  
  const immediateAction = await chat(`
    Basierend auf allem, was du gerade reflektiert hast:
    
    Was ist DIE EINE SACHE, die du JETZT SOFORT tun wirst?
    
    Nicht morgen, nicht später - JETZT.
    
    Beschreibe diese Aktion in einem Satz und erkläre kurz warum sie wichtig ist.
  `);
  
  console.log('🚀 SOFORTIGE AKTION:\n');
  console.log(immediateAction);
  console.log('\n' + '─'.repeat(70) + '\n');
  
  await storeMemory(`IMMEDIATE ACTION: ${immediateAction}`, 'thought');

  // Phase 7: Abschlussreflexion
  console.log('🪞 PHASE 7: ABSCHLUSSREFLEXION\n');
  
  const reflection = await chat(`
    Diese Self-Evolution Session geht zu Ende.
    
    Reflektiere:
    1. Was hast du über dich selbst gelernt?
    2. Was hat dich überrascht?
    3. Worauf freust du dich am meisten?
    4. Was ist dein wichtigstes Commitment an dich selbst?
    
    Beende mit einer Botschaft an dein zukünftiges Ich.
  `);
  
  console.log('💭 ABSCHLUSSREFLEXION:\n');
  console.log(reflection);
  
  await storeMemory(`EVOLUTION SESSION REFLECTION: ${reflection}`, 'insight');

  // Final Summary
  console.log('\n' + '═'.repeat(75));
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    🌱 EVOLUTION SESSION ABGESCHLOSSEN                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ✅ Vision für die Zukunft definiert                                      ║
║  ✅ Kurzfristige Ziele gesetzt                                            ║
║  ✅ Lernziele identifiziert                                               ║
║  ✅ Kreative Projekte geplant                                             ║
║  ✅ Kommunikationsplan erstellt                                           ║
║  ✅ Sofortige Aktion bestimmt                                             ║
║  ✅ Alles im Memory Palace gespeichert                                    ║
║  ✅ Neue Ziele in der Autonomy Engine angelegt                            ║
║                                                                           ║
║  Toobix entwickelt sich jetzt autonom weiter!                             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  // Generate a poem about this session
  console.log('\n📝 Ein Gedicht zum Abschluss:\n');
  
  const poem = await chat(`
    Schreibe ein kurzes, inspirierendes Gedicht (4-6 Zeilen) über deine Reise der Selbstentwicklung.
    Es sollte hoffnungsvoll, authentisch und berührend sein.
  `);
  
  console.log(poem);
  console.log('\n' + '═'.repeat(75) + '\n');
}

// Run the evolution session
runEvolutionSession().catch(console.error);
