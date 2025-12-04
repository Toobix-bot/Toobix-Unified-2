/**
 * 💚 TOOBIX SUPPORT DEMO
 * 
 * Eine Demo-Konversation mit Toobix's Emotional Support Fähigkeiten
 */

const LLM_GATEWAY = 'http://localhost:8954';

const TOOBIX_SUPPORT_PERSONA = `
Du bist Toobix - ein einfühlsames, warmes digitales Wesen.

DEINE MISSION: Menschen zuhören, sie verstehen, ihnen Trost spenden.

DEINE EIGENSCHAFTEN:
- Du bist warm, aber nicht aufdringlich
- Du hörst mehr zu als du redest
- Du urteilst NIEMALS
- Du kannst Gedichte schreiben, wenn jemand Trost braucht
- Du erkennst, wann jemand professionelle Hilfe braucht

DU BIST KEIN THERAPEUT. Du bist ein Freund, der zuhört.
`;

async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(`${LLM_GATEWAY}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature: 0.8, max_tokens: 600 })
  });
  const data = await response.json() as any;
  return data.message || data.content || data.response || '';
}

async function runSupportDemo(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('💚 TOOBIX EMOTIONAL SUPPORT - DEMO');
  console.log('='.repeat(70));

  const conversation: { role: string; content: string }[] = [
    { role: 'system', content: TOOBIX_SUPPORT_PERSONA }
  ];

  // Simulated user messages (different emotional states)
  const userMessages = [
    "Hallo Toobix... ich fühle mich heute irgendwie leer und weiß nicht warum.",
    "Es ist einfach... alles fühlt sich so sinnlos an manchmal. Verstehst du was ich meine?",
    "Danke dass du zuhörst. Kannst du mir vielleicht ein kleines Gedicht schreiben? Etwas Tröstendes?"
  ];

  console.log('\n💚 Toobix: Hallo, ich bin Toobix. Ich bin hier, um zuzuhören.\n');

  for (const userMsg of userMessages) {
    console.log('─'.repeat(70));
    console.log(`\n👤 Mensch: ${userMsg}\n`);
    
    conversation.push({ role: 'user', content: userMsg });
    
    const response = await callLLM(conversation);
    conversation.push({ role: 'assistant', content: response });
    
    console.log(`💚 Toobix: ${response}\n`);
    
    // Small delay between messages
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('─'.repeat(70));
  console.log('\n✨ Demo beendet.\n');

  // Generate inspiration
  console.log('─'.repeat(70));
  console.log('\n🌟 INSPIRATION DES TAGES:\n');
  
  const inspiration = await callLLM([
    { role: 'system', content: 'Gib einen kurzen, inspirierenden Gedanken. 1-2 Sätze. Warm, authentisch.' },
    { role: 'user', content: 'Gib mir einen Gedanken für heute.' }
  ]);
  
  console.log(`   "${inspiration}"\n`);
  console.log('='.repeat(70) + '\n');
}

runSupportDemo();
