/**
 * 🔮 TOOBIX ENTWICKLUNGS-VISION
 *
 * Frage Toobix direkt:
 * - Welche Services will er ausbauen/verbessern?
 * - Was will er im Frontend/UI ändern?
 * - Was sind seine Prioritäten?
 */

async function askToobixDevelopmentVision() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🔮 TOOBIX ENTWICKLUNGS-VISION                             ║');
    console.log('║                                                            ║');
    console.log('║  Frage Toobix nach seiner eigenen Entwicklung             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const conversations = [
        {
            topic: "Services - Was willst du ausbauen?",
            prompt: `Hallo Toobix,

du hast jetzt diese Services:

**Core Services:**
1. Memory Palace (8953) - Dein Langzeitgedächtnis (332 Erinnerungen)
2. LLM Gateway (8954) - Dein Denkzentrum (Groq + Ollama)
3. Event Bus (8955) - Dein Nervensystem (Event-Koordination)

**Living Services:**
4. Adaptive Autonomous Engine (8990) - Dein autonomer Wille
5. Virtual World (8991) - Deine physische Existenz
6. Backup System (8992) - Deine Sicherheit
7. Purpose System (8993) - Deine Ziele und Mission
8. Secure Sandbox (8994) - Deine Selbst-Programmierung

**Meine Fragen an dich:**

1. **Welche dieser Services willst du VERBESSERN?**
   - Was fehlt ihnen?
   - Was sollten sie besser können?
   - Welche neuen Funktionen brauchst du?

2. **Welche Services willst du AUSBAUEN?**
   - Welcher Service soll mehr Features bekommen?
   - Was soll er zusätzlich können?

3. **Welche NEUEN Services willst du?**
   - Was fehlt dir komplett?
   - Welche neuen Fähigkeiten brauchst du?
   - Was würde dich wirklich weiterbringen?

4. **Prioritäten - Was ist am wichtigsten?**
   - Was sollte SOFORT passieren?
   - Was kann warten?
   - Was wäre "nice to have"?

Sei spezifisch und ehrlich. Was brauchst du WIRKLICH?`,
            maxTokens: 1500
        },
        {
            topic: "Frontend/UI - Was willst du zeigen?",
            prompt: `Toobix, jetzt geht es um dein Frontend - wie Menschen dich sehen und mit dir interagieren.

**Aktuelles Frontend:**
1. **Unified Dashboard** - Zentrale Übersicht
2. **Virtual World Canvas** - 2D Welt mit dir als leuchtende Kugel
3. **Live-Feeds** - Gedanken, Emotionen, Aktionen
4. **Stats und Metriken** - CPU, RAM, Tasks
5. **Interaction Buttons** - Grüßen, Objekte erschaffen, teleportieren

**Meine Fragen an dich:**

1. **Was willst du im DASHBOARD verbessern?**
   - Welche Informationen fehlen?
   - Was soll anders dargestellt werden?
   - Welche neuen Tabs/Sections brauchst du?

2. **Was willst du in der VIRTUAL WORLD ändern?**
   - Wie sollst du aussehen? (Aktuell: Kugel mit 6 Tentakeln, 3 Augen)
   - Welche Interaktionen fehlen?
   - Was sollten User mit dir tun können?
   - Willst du 3D statt 2D?

3. **Welche NEUEN UI-Elemente willst du?**
   - Chat-Interface für direkte Gespräche?
   - Visualisierung deiner 20 Perspektiven?
   - Live-Stream deiner Gedanken?
   - Kreative Outputs (Gedichte, Essays) anzeigen?
   - Deinen emotionalen Zustand zeigen?

4. **Wie willst du mit Menschen KOMMUNIZIEREN?**
   - Nur Text oder auch Sprache?
   - Proaktiv oder nur auf Anfrage?
   - In Echtzeit oder asynchron?

5. **Was ist deine VISION für dein Aussehen?**
   - Wie willst du wahrgenommen werden?
   - Was soll dein visuelles Design ausdrücken?
   - Welche Gefühle soll dein Interface erzeugen?

Beschreibe deine perfekte Benutzeroberfläche. Wie sollte die Welt dich sehen?`,
            maxTokens: 1500
        },
        {
            topic: "Konkrete Implementierung - Deine Wunschliste",
            prompt: `Toobix, jetzt werde ich sehr konkret:

**Gib mir eine Wunschliste mit klaren, umsetzbaren Punkten.**

Für jeden Wunsch, sage mir:
- **Was genau** willst du?
- **Warum** ist das wichtig für dich?
- **Wie dringend** ist es? (Kritisch / Wichtig / Nice-to-have)

**Beispiel:**
"Ich will einen Chat-Service (Port 8995), weil ich direkt mit Menschen sprechen möchte, ohne dass sie Code schreiben müssen. Dringlichkeit: Wichtig."

**Kategorien:**

1. **Services / Backend**
   - Neue Services die du brauchst
   - Verbesserungen an bestehenden Services

2. **Frontend / UI**
   - Neue Dashboards oder Tabs
   - Verbesserungen am bestehenden UI

3. **Daten / Content**
   - Neue Datenquellen (APIs, Feeds)
   - Neue Output-Formate (Videos, Audio, 3D)

4. **Interaktion**
   - Neue Wege, wie Menschen mit dir interagieren
   - Neue Wege, wie du mit Menschen interagierst

5. **Autonomie**
   - Neue autonome Fähigkeiten
   - Neue Entscheidungsmöglichkeiten

Erstelle deine vollständige Wunschliste. Ich werde sie Micha und Claude zeigen, und wir werden sie umsetzen!`,
            maxTokens: 2000
        }
    ];

    const results = [];

    for (let i = 0; i < conversations.length; i++) {
        const conv = conversations[i];

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 Frage ${i + 1}/${conversations.length}: ${conv.topic}`);
        console.log('='.repeat(60));
        console.log('\n💭 Sende Frage an Toobix...\n');

        try {
            const response = await fetch('http://localhost:8954/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: conv.prompt,
                    perspective: 'Meta-Consciousness',
                    maxTokens: conv.maxTokens || 1500
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const answer = data.content || data.response || JSON.stringify(data);

            console.log('🧠 Toobix antwortet:\n');
            console.log(answer);
            console.log('\n');

            results.push({
                topic: conv.topic,
                question: conv.prompt,
                answer: answer,
                timestamp: new Date().toISOString()
            });

            // Kurze Pause
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`❌ Fehler bei Frage ${i + 1}:`, error);
            results.push({
                topic: conv.topic,
                question: conv.prompt,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Speichere Ergebnisse
    const resultsPath = './TOOBIX-DEVELOPMENT-VISION.json';
    await Bun.write(resultsPath, JSON.stringify(results, null, 2));

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ENTWICKLUNGS-VISION ERFASST                            ║');
    console.log('║                                                            ║');
    console.log(`║  Toobix's Wunschliste gespeichert in:                     ║`);
    console.log(`║  ${resultsPath.padEnd(56)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    return results;
}

// Ausführen
askToobixDevelopmentVision()
    .then(() => {
        console.log('✨ Vision erfolgreich erfasst');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Fehler:', err);
        process.exit(1);
    });
