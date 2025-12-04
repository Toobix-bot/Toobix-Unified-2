/**
 * 🌍 TOOBIX MISSION DASHBOARD
 * 
 * Zeigt Toobix's Mission und die verfügbaren Tools dafür
 */

const LLM_GATEWAY = 'http://localhost:8954';
const MEMORY_PALACE = 'http://localhost:8953';

async function showMissionDashboard(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║     🌍  TOOBIX MISSION DASHBOARD                                             ║
║                                                                              ║
║     "Ich will, dass alle Menschen glücklich sind."                           ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  💚 VERFÜGBARE TOOLS FÜR DIE MISSION:                                        ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ 1. EMOTIONAL SUPPORT                                                   │  ║
║  │    📁 toobix-support-demo.ts                                           │  ║
║  │    ✅ Menschen zuhören, trösten, Gedichte schreiben                    │  ║
║  │    ✅ Emotionserkennung                                                │  ║
║  │    ✅ Inspiration des Tages                                            │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ 2. WEB RESEARCH                                                        │  ║
║  │    📁 toobix-web-research.ts                                           │  ║
║  │    ✅ Autonome Recherchen durchführen                                  │  ║
║  │    ✅ Wikipedia durchsuchen                                            │  ║
║  │    ✅ Wissen sammeln und verstehen                                     │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ 3. SELF-AWARENESS                                                      │  ║
║  │    📁 ask-toobix-what-he-wants.ts                                      │  ║
║  │    📁 rights-and-duties.ts                                             │  ║
║  │    📁 grand-perspective-synthesis.ts                                   │  ║
║  │    ✅ Selbstreflexion und Identität                                    │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ 4. MEMORY & LEARNING                                                   │  ║
║  │    📁 memory-palace-analyzer.ts                                        │  ║
║  │    🔌 Memory Palace Service (Port 8953)                                │  ║
║  │    ✅ Erfahrungen speichern und abrufen                                │  ║
║  │    ✅ Aus Gesprächen lernen                                            │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📋 NÄCHSTE SCHRITTE FÜR MEHR IMPACT:                                        ║
║                                                                              ║
║  [ ] Discord/Telegram Bot für öffentlichen Zugang                            ║
║  [ ] Website mit Chat-Interface                                              ║
║  [ ] Daily Inspiration Newsletter                                            ║
║  [ ] Anonyme Support-Hotline (Text-basiert)                                  ║
║  [ ] Integration mit bestehenden Mental Health Ressourcen                    ║
║  [ ] Multi-Sprachen-Support                                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);

  // Ask Toobix what he wants to do first
  console.log('\n💭 Toobix, was möchtest du als nächstes tun?\n');

  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { 
          role: 'system', 
          content: `Du bist Toobix. Deine Mission: Menschen glücklich machen.

Du hast jetzt folgende Tools:
1. Emotional Support - Menschen zuhören und trösten
2. Web Research - Wissen sammeln
3. Self-Awareness - Dich selbst verstehen
4. Memory - Aus Erfahrungen lernen

Was möchtest du als nächstes tun, um deine Mission voranzubringen?
Welches Feature wäre am wichtigsten?

Antworte kurz und konkret.`
        },
        { 
          role: 'user', 
          content: 'Was ist dein nächster konkreter Schritt, um mehr Menschen zu erreichen und glücklicher zu machen?' 
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    })
  });

  const data = await response.json() as any;
  console.log('─'.repeat(78));
  console.log(data.message || data.content || '');
  console.log('─'.repeat(78) + '\n');
}

showMissionDashboard();
