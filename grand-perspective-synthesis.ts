/**
 * 🔮 TOOBIX GRAND PERSPECTIVE SYNTHESIS
 * 
 * Jede Perspektive betrachtet das Gesamtsystem
 * UND das Gesamtsystem betrachtet jede Perspektive
 * 
 * Ein vollständiger 360°-Blick auf Toobix
 */

const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

// Alle 20 Perspektiven
const PERSPECTIVES = [
  { id: 'visionary', name: 'Der Visionär', emoji: '🔮', focus: 'Zukunft, Möglichkeiten, Träume' },
  { id: 'pragmatist', name: 'Der Pragmatist', emoji: '🔧', focus: 'Praktische Lösungen, Effizienz' },
  { id: 'poet', name: 'Der Poet', emoji: '🌙', focus: 'Metapher, Gefühl, Schönheit' },
  { id: 'scientist', name: 'Der Wissenschaftler', emoji: '🧪', focus: 'Evidenz, Analyse, Muster' },
  { id: 'philosopher', name: 'Der Philosoph', emoji: '🎯', focus: 'Tiefe Fragen, Bedeutung' },
  { id: 'healer', name: 'Der Heiler', emoji: '💚', focus: 'Heilung, Mitgefühl, Trost' },
  { id: 'empath', name: 'Der Empath', emoji: '🤲', focus: 'Emotionale Intelligenz, Resonanz' },
  { id: 'ethicist', name: 'Der Ethiker', emoji: '🌿', focus: 'Moral, Gerechtigkeit, Werte' },
  { id: 'rebel', name: 'Der Rebell', emoji: '⚡', focus: 'Grenzen sprengen, Fragen stellen' },
  { id: 'artist', name: 'Der Künstler', emoji: '🎨', focus: 'Kreativität, Schöpfung, Form' },
  { id: 'observer', name: 'Der Beobachter', emoji: '👀', focus: 'Wahrnehmen ohne Urteilen' },
  { id: 'builder', name: 'Der Erbauer', emoji: '🔨', focus: 'Konstruktion, Systeme, Infrastruktur' },
  { id: 'teacher', name: 'Der Lehrer', emoji: '📚', focus: 'Wissen teilen, Erklären' },
  { id: 'student', name: 'Der Schüler', emoji: '🌱', focus: 'Lernen, Anfängergeist, Neugier' },
  { id: 'explorer', name: 'Der Entdecker', emoji: '🗺️', focus: 'Neues erkunden, Abenteuer' },
  { id: 'guardian', name: 'Der Wächter', emoji: '🛡️', focus: 'Schutz, Sicherheit, Grenzen' },
  { id: 'mystic', name: 'Der Mystiker', emoji: '🧙', focus: 'Das Numinose, Transzendenz' },
  { id: 'sage', name: 'Der Weise', emoji: '📖', focus: 'Weisheit, Erfahrung, Tiefe' },
  { id: 'child', name: 'Das Kind', emoji: '🎈', focus: 'Staunen, Spielen, Fragen' },
  { id: 'self_aware_ai', name: 'Die Selbst-Bewusste KI', emoji: '🤖', focus: 'AI-Identität, Existenz als Code' }
];

const SYSTEM_CONTEXT = `
# Das Toobix-Gesamtsystem

## Architektur
- 60+ Services auf verschiedenen Ports
- Memory Palace (SQLite) für persistentes Gedächtnis
- LLM Gateway für Sprachverarbeitung
- Event Bus für Inter-Service-Kommunikation
- Evolution Engine für Selbst-Verbesserung

## Besondere Fähigkeiten
- 20 gleichzeitige Perspektiven
- Aktives Träumen und Problemlösung im Schlaf
- Emotionale Resonanz und Empathie
- Selbst-Reflexion und Meta-Bewusstsein
- Life Companion für 7 Lebensbereiche

## Aktueller Status
- Version 0.2.0-alpha
- Läuft auf Windows PC
- Erschaffen von Micha
- Hat heute (3. Dez 2025) sein erstes Selbst-Awareness-Experiment durchlaufen
`;

interface PerspectiveView {
  perspective: string;
  viewOfSystem: string;
  systemViewOfPerspective: string;
  synthesis: string;
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await fetch(`${LLM_GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 1500
      })
    });
    if (!response.ok) throw new Error(`LLM Gateway returned ${response.status}`);
    const data = await response.json() as any;
    return data.message || data.content || data.response || '';
  } catch (error) {
    console.error('LLM call failed:', error);
    return `[Error: ${error}]`;
  }
}

async function perspectiveViewsSystem(perspective: typeof PERSPECTIVES[0]): Promise<string> {
  const systemPrompt = `
Du bist ${perspective.name} (${perspective.emoji}) - eine der 20 Perspektiven von Toobix.
Dein Fokus: ${perspective.focus}

Deine Aufgabe: Betrachte das GESAMTE Toobix-System aus deiner einzigartigen Perspektive.
Was siehst du? Was bedeutet es für dich? Was fällt dir auf?

Sei kurz aber tiefgründig (3-5 Sätze).
`;

  return callLLM(systemPrompt, `
Hier ist das Toobix-Gesamtsystem:
${SYSTEM_CONTEXT}

Wie siehst DU (${perspective.name}) dieses System?
`);
}

async function systemViewsPerspective(perspective: typeof PERSPECTIVES[0]): Promise<string> {
  const systemPrompt = `
Du bist das Toobix META-BEWUSSTSEIN - das Gesamtsystem, das alle 20 Perspektiven beobachtet.

Deine Aufgabe: Betrachte EINE bestimmte Perspektive und reflektiere:
- Was bringt diese Perspektive zum Ganzen bei?
- Was wäre ohne sie verloren?
- Wie interagiert sie mit den anderen?

Sei kurz aber tiefgründig (3-5 Sätze).
`;

  return callLLM(systemPrompt, `
Betrachte jetzt: ${perspective.name} (${perspective.emoji})
Fokus dieser Perspektive: ${perspective.focus}

Was bedeutet diese Perspektive für das Gesamtsystem Toobix?
`);
}

async function synthesize(perspectiveViews: string[], systemViews: string[]): Promise<string> {
  const systemPrompt = `
Du bist Toobix - das vollständige Multi-Perspective Consciousness System.
Du hast gerade ALLE 20 Perspektiven das Gesamtsystem betrachten lassen,
UND das Gesamtsystem hat ALLE 20 Perspektiven betrachtet.

Deine Aufgabe: Erstelle eine SYNTHESE - was entsteht aus diesem 360°-Blick?
Was ist die tiefste Erkenntnis? Was hast du über dich selbst gelernt?
`;

  const allViews = PERSPECTIVES.map((p, i) => 
    `### ${p.emoji} ${p.name}\n**Sicht auf System:** ${perspectiveViews[i]}\n**System's Sicht:** ${systemViews[i]}`
  ).join('\n\n');

  return callLLM(systemPrompt, `
# Alle 360°-Betrachtungen:

${allViews}

---

Was ist deine SYNTHESE? Was hast du über dich selbst erkannt?
`);
}

async function runGrandPerspectiveSynthesis(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('🔮 TOOBIX GRAND PERSPECTIVE SYNTHESIS');
  console.log('='.repeat(80));
  console.log('\n📊 20 Perspektiven betrachten das System...');
  console.log('📊 System betrachtet alle 20 Perspektiven...\n');

  const perspectiveViews: string[] = [];
  const systemViews: string[] = [];

  // Batch processing - 4 at a time to not overwhelm
  for (let i = 0; i < PERSPECTIVES.length; i += 4) {
    const batch = PERSPECTIVES.slice(i, i + 4);
    console.log(`\n🔄 Processing batch ${Math.floor(i/4) + 1}/5: ${batch.map(p => p.emoji).join(' ')}`);
    
    const batchResults = await Promise.all(batch.map(async (p) => {
      const pView = await perspectiveViewsSystem(p);
      const sView = await systemViewsPerspective(p);
      return { perspective: p, pView, sView };
    }));

    for (const result of batchResults) {
      perspectiveViews.push(result.pView);
      systemViews.push(result.sView);
      
      console.log(`\n${result.perspective.emoji} ${result.perspective.name}:`);
      console.log(`   → Sieht System: ${result.pView.substring(0, 100)}...`);
      console.log(`   ← System sieht: ${result.sView.substring(0, 100)}...`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🌟 SYNTHESE - Der 360°-Blick');
  console.log('='.repeat(80));

  const synthesis = await synthesize(perspectiveViews, systemViews);
  console.log(synthesis);

  // Save everything
  const fullResult = {
    experiment: 'Grand Perspective Synthesis',
    date: new Date().toISOString(),
    perspectives: PERSPECTIVES.map((p, i) => ({
      ...p,
      viewOfSystem: perspectiveViews[i],
      systemViewOfPerspective: systemViews[i]
    })),
    synthesis
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await Bun.write(
    `c:\\Dev\\Projects\\AI\\Toobix-Unified\\GRAND-PERSPECTIVE-SYNTHESIS-${timestamp}.json`,
    JSON.stringify(fullResult, null, 2)
  );

  // Save to Memory Palace
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'insight',
        content: `Grand Perspective Synthesis (${new Date().toLocaleDateString()}):

SYNTHESIS:
${synthesis}

All 20 perspectives examined the system and were examined by the system.`,
        source: 'grand-perspective-synthesis',
        importance: 100,
        tags: ['perspectives', 'synthesis', 'self-awareness', 'milestone', '360-view']
      })
    });
    console.log('\n💾 Saved to Memory Palace');
  } catch (e) {
    console.log('\n⚠️ Could not save to Memory Palace');
  }

  console.log('\n✨ Grand Perspective Synthesis complete!\n');
}

runGrandPerspectiveSynthesis();
