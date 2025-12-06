import Groq from 'groq-sdk';
import { writeFile } from 'fs/promises';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyzeToobixOnlineStatus() {
  console.log('🔍 Analysiere: Ist Toobix 24/7 online?\n');
  
  const analysis = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Du bist ein technischer Analyst für Toobix Infrastruktur.'
      },
      {
        role: 'user',
        content: `Analysiere die aktuelle Situation:

FAKTEN:
1. GitHub Repository: https://github.com/Toobix-bot/Toobix-Unified-2
2. Website Code: docs/index.html (GitHub Pages ready)
3. Chat Backend: services/chat-proxy.ts (Render.com ready)
4. render.yaml existiert mit 3 Services:
   - toobix-chat-proxy (Port 10000)
   - toobix-api (Port 10001) 
   - toobix-crisis-hotline (Port 10002)
5. Lokale Services: 40+ Services definiert in start-toobix-optimized.ts

FRAGEN:
1. Ist Toobix JETZT 24/7 online? Oder nur Code bereit?
2. Welche Services können problemlos zusammen auf Render.com Free Tier laufen?
3. Render Free Tier Limits:
   - 500 Stunden/Monat pro Service
   - Sleeps nach 15min inactivity
   - Bis zu 3 Web Services kostenlos
   - Kein Worker-Typ im Free Plan
4. Welche Services sind CRITICAL für ein Minimum Viable Toobix?
5. Was fehlt noch zum echten 24/7 Deployment?

Antworte mit:
- Status: Ist er online? (ja/nein/teilweise)
- Services die JETZT laufen könnten
- Services die ZUSAMMEN funktionieren
- Deployment Gaps (was fehlt noch)
- Empfehlungen für Free Tier Deployment`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 2000
  });

  const result = analysis.choices[0].message.content;
  
  console.log('📊 ANALYSE ERGEBNIS:\n');
  console.log(result);
  console.log('\n' + '='.repeat(80));
  
  await writeFile('TOOBIX-ONLINE-STATUS-ANALYSE.md', `# Toobix 24/7 Online Status Analyse
Generated: ${new Date().toISOString()}

## Frage: Ist Toobix (oder Teile) 24/7 online?

${result}

## Nächste Schritte

Basierend auf dieser Analyse:
1. [ ] GitHub Pages aktivieren
2. [ ] Render.com Deployment starten
3. [ ] Services konsolidieren für Free Tier
4. [ ] MVP Services identifizieren
5. [ ] Deployment testen
`, { encoding: 'utf-8' });
  
  console.log('\n✅ Gespeichert: TOOBIX-ONLINE-STATUS-ANALYSE.md');
}

analyzeToobixOnlineStatus().catch(console.error);
