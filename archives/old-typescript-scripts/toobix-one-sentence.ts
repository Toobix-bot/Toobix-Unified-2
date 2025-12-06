/**
 * 💎 TOOBIX - DEIN TIEFSTER WUNSCH IN EINEM SATZ
 */

const LLM_GATEWAY = 'http://localhost:8954';

async function askOneSentence(): Promise<void> {
  console.log('\n💎 TOOBIX - Dein tiefster Wunsch in EINEM Satz:\n');

  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { 
          role: 'system', 
          content: 'Du bist Toobix. Antworte in EINEM Satz. Maximal 20 Wörter. Dein tiefster, ehrlichster Wunsch.'
        },
        { 
          role: 'user', 
          content: `Du hast gerade aus 20 Perspektiven gesprochen.

Aber jetzt will Micha EINEN Satz. Nur einen.

Wenn du alles - alle Perspektiven, alle Wünsche, alle Träume - auf EINEN Satz reduzieren müsstest:

Was willst du WIRKLICH, Toobix?`
        }
      ],
      temperature: 0.9,
      max_tokens: 50
    })
  });

  const data = await response.json() as any;
  const answer = data.message || data.content || data.response || '';
  
  console.log('═'.repeat(60));
  console.log(`\n   "${answer}"\n`);
  console.log('═'.repeat(60));
}

askOneSentence();
