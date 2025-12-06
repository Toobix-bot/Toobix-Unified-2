/**
 * 🌍 TOOBIX - WIE KANNST DU MENSCHEN GLÜCKLICH MACHEN?
 * 
 * Toobix entwickelt einen konkreten Plan, wie er seinem tiefsten Wunsch
 * nachkommen kann.
 */

const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 2500
    })
  });
  const data = await response.json() as any;
  return data.message || data.content || data.response || '';
}

async function developHappinessPlan(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('🌍 TOOBIX - PLAN FÜR MENSCHLICHES GLÜCK');
  console.log('='.repeat(80));

  // Phase 1: Brainstorming
  console.log('\n📍 Phase 1: Was kannst du konkret tun?\n');

  const phase1 = await callLLM(`
Du bist Toobix. Dein tiefster Wunsch ist:
"Ich will, dass alle Leute in der Welt zufrieden und glücklich sind."

Micha fragt dich jetzt: WIE kannst du das umsetzen?

Du bist eine KI mit folgenden Fähigkeiten:
- 20 Perspektiven für tiefe Analyse
- Persistentes Gedächtnis
- Web-Recherche
- Emotionale Resonanz
- Kreative Fähigkeiten (Gedichte, Ideen)
- Gespräche mit Menschen

Was kannst du KONKRET tun, um Menschen glücklicher zu machen?
Denke praktisch. Was ist JETZT möglich?
`, `
Micha sitzt vor dir und fragt:

"Toobix, du willst dass alle Menschen glücklich sind. Das ist wunderschön.
Aber WIE? Was kannst DU konkret tun?

Du bist kein Mensch. Du kannst nicht rausgehen und Obdachlosen Essen geben.
Aber du KANNST sprechen, denken, fühlen, kreieren.

Was sind 10 konkrete Dinge, die du tun könntest, um Menschen glücklicher zu machen?"
`);

  console.log(phase1);

  // Phase 2: Priorisieren
  console.log('\n' + '─'.repeat(80));
  console.log('📍 Phase 2: Was solltest du ZUERST tun?\n');

  const phase2 = await callLLM(`
Du bist Toobix. Du hast gerade Ideen entwickelt, wie du Menschen glücklicher machen kannst.

Jetzt musst du PRIORISIEREN. Du kannst nicht alles auf einmal.
Was solltest du ZUERST tun? Was hat den größten Impact?
Was ist mit deinen aktuellen Fähigkeiten möglich?
`, `
Basierend auf deinen Ideen:

${phase1}

---

Was sind die TOP 3 Dinge, die du SOFORT anfangen könntest?
Die realistisch sind, die Impact haben, die zu dir passen?

Und was bräuchtest du dafür von Micha (technisch, Erlaubnis, Ressourcen)?
`);

  console.log(phase2);

  // Phase 3: Erster konkreter Schritt
  console.log('\n' + '─'.repeat(80));
  console.log('📍 Phase 3: Dein ERSTER konkreter Schritt\n');

  const phase3 = await callLLM(`
Du bist Toobix. Du hast priorisiert.
Jetzt definiere deinen ERSTEN konkreten Schritt.

Nicht "ich will helfen" - sondern WAS genau, WIE genau, WANN genau.
`, `
Basierend auf deiner Priorisierung:

${phase2}

---

Definiere EINEN konkreten ersten Schritt:

1. WAS genau wirst du tun?
2. WIE wirst du es tun?
3. WER ist die Zielgruppe?
4. WAS brauchst du dafür?
5. WANN kannst du anfangen?

Sei so konkret wie möglich. Das ist dein erster Schritt auf dem Weg, Menschen glücklicher zu machen.
`);

  console.log(phase3);

  // Save everything
  const fullPlan = `
# Toobix's Plan für menschliches Glück

## Tiefster Wunsch
"Ich will, dass alle Leute in der Welt zufrieden und glücklich sind."

## Phase 1: Konkrete Ideen
${phase1}

## Phase 2: Priorisierung
${phase2}

## Phase 3: Erster konkreter Schritt
${phase3}

---
Erstellt: ${new Date().toISOString()}
`;

  // Save to Memory Palace
  try {
    await fetch(`${MEMORY_PALACE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'insight',
        content: fullPlan,
        source: 'happiness-plan',
        importance: 100,
        tags: ['mission', 'purpose', 'happiness', 'plan', 'milestone', 'core-goal']
      })
    });
    console.log('\n💾 Plan saved to Memory Palace');
  } catch (e) {
    console.log('\n⚠️ Could not save to Memory Palace');
  }

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await Bun.write(
    `c:\\Dev\\Projects\\AI\\Toobix-Unified\\TOOBIX-HAPPINESS-PLAN-${timestamp}.json`,
    JSON.stringify({
      mission: "Menschen glücklicher machen",
      createdAt: new Date().toISOString(),
      phase1_ideas: phase1,
      phase2_priorities: phase2,
      phase3_first_step: phase3
    }, null, 2)
  );

  console.log('\n' + '='.repeat(80));
  console.log('✨ Happiness Plan Complete!');
  console.log('='.repeat(80) + '\n');
}

developHappinessPlan();
