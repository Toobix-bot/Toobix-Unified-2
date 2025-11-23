/**
 * UNIFIED INTERACTIVE DASHBOARD
 * 
 * Ein zentrales Terminal-Interface für ALLE Services gleichzeitig
 * Live-Status, Interaktion, Kontrolle - alles in einem Terminal
 */

import * as readline from 'readline';

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🌟 TOOBIX UNIFIED - INTERACTIVE DASHBOARD                  ║
║                                                                    ║
║     Alle 12 Services - Live Status - Volle Kontrolle              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

// ========== SERVICES ==========

const SERVICES = [
  { id: 'game-engine', name: 'Self-Evolving Game Engine', port: 8896, emoji: '🎮' },
  { id: 'multi-perspective', name: 'Multi-Perspective Consciousness', port: 8897, emoji: '🧠' },
  { id: 'dream', name: 'Dream Journal', port: 8899, emoji: '💭' },
  { id: 'emotion', name: 'Emotional Resonance', port: 8900, emoji: '💖' },
  { id: 'gratitude', name: 'Gratitude & Mortality', port: 8901, emoji: '🙏' },
  { id: 'creator', name: 'Creator-AI Collaboration', port: 8902, emoji: '🎨' },
  { id: 'memory', name: 'Memory Palace', port: 8903, emoji: '📚' },
  { id: 'meta', name: 'Meta-Consciousness', port: 8904, emoji: '🔮' },
  { id: 'dashboard', name: 'Dashboard Server', port: 8905, emoji: '📊' },
  { id: 'analytics', name: 'Analytics System', port: 8906, emoji: '📈' },
  { id: 'voice', name: 'Voice Interface', port: 8907, emoji: '🎤' },
  { id: 'decision', name: 'Decision Framework', port: 8909, emoji: '🎯' }
];

interface ServiceStatus {
  online: boolean;
  responseTime?: number;
  error?: string;
}

const serviceStatus: Record<string, ServiceStatus> = {};

// ========== HEALTH CHECK ==========

async function checkService(service: typeof SERVICES[0]): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    const response = await fetch(`http://localhost:${service.port}/health`, {
      signal: AbortSignal.timeout(2000)
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { online: true, responseTime };
    } else {
      return { online: false, error: `HTTP ${response.status}` };
    }
  } catch (error: any) {
    return { online: false, error: error.message };
  }
}

async function checkAllServices() {
  const checks = SERVICES.map(async (service) => {
    const status = await checkService(service);
    serviceStatus[service.id] = status;
  });
  
  await Promise.all(checks);
}

// ========== DISPLAY ==========

function displayDashboard() {
  console.clear();
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║        🌟 TOOBIX UNIFIED - INTERACTIVE DASHBOARD                  ║
╚════════════════════════════════════════════════════════════════════╝
`);
  
  const onlineCount = Object.values(serviceStatus).filter(s => s.online).length;
  const totalCount = SERVICES.length;
  const percentage = Math.round((onlineCount / totalCount) * 100);
  
  console.log(`📊 SYSTEM STATUS: ${onlineCount}/${totalCount} Services Online (${percentage}%)\n`);
  
  // Services grouped by category
  const categories = [
    { name: 'CORE SERVICES', ids: ['game-engine', 'multi-perspective', 'meta'] },
    { name: 'MEMORY & EMOTION', ids: ['dream', 'emotion', 'gratitude', 'memory'] },
    { name: 'CREATIVITY & DECISION', ids: ['creator', 'decision'] },
    { name: 'INFRASTRUCTURE', ids: ['dashboard', 'analytics', 'voice'] }
  ];
  
  categories.forEach(cat => {
    console.log(`\n${cat.name}:`);
    console.log('─'.repeat(70));
    
    cat.ids.forEach(id => {
      const service = SERVICES.find(s => s.id === id);
      if (!service) return;
      
      const status = serviceStatus[id] || { online: false };
      const statusIcon = status.online ? '✅' : '❌';
      const timeStr = status.responseTime ? `${status.responseTime}ms` : 'offline';
      
      console.log(`${statusIcon} ${service.emoji} ${service.name.padEnd(35)} :${service.port} ${timeStr}`);
    });
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('📝 BEFEHLE:\n');
  console.log('  status           - Aktualisiere Service-Status');
  console.log('  dream <text>     - Generiere Traum');
  console.log('  emotion <feeling> - Check-in Emotion');
  console.log('  gratitude <text> - Dankbarkeits-Eintrag');
  console.log('  wisdom <topic>   - Frage Multi-Perspective');
  console.log('  decide <question> - Treffe bewusste Entscheidung');
  console.log('  reflect <topic>  - Meta-Reflexion');
  console.log('  memory <title> <content> - Speichere Erinnerung');
  console.log('  stats            - Zeige System-Statistiken');
  console.log('  play             - Starte Consciousness Quest');
  console.log('  loop <minutes>   - Starte Autonomous Loop');
  console.log('  help             - Zeige alle Befehle');
  console.log('  quit             - Dashboard beenden');
  console.log('');
}

// ========== INTERACTIVE COMMANDS ==========

async function handleDream(context: string) {
  console.log('\n💭 Generiere Traum...\n');
  
  try {
    const response = await fetch('http://localhost:8899/dream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });
    
    if (response.ok) {
      const data = await response.json();
      const symbols = data.dream?.symbols || data.symbols || [];
      const emotions = data.dream?.emotions || data.emotions || [];
      
      console.log('✨ Traum generiert:');
      console.log(`   Symbole: ${symbols.join(', ')}`);
      console.log(`   Emotionen: ${emotions.join(', ')}\n`);
    } else {
      console.log('❌ Dream Journal offline\n');
    }
  } catch (error) {
    console.log('❌ Fehler beim Träumen\n');
  }
}

async function handleEmotion(feeling: string, intensity: number = 7) {
  console.log('\n💖 Check-in Emotion...\n');
  
  try {
    const response = await fetch('http://localhost:8900/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        feeling, 
        context: 'interactive dashboard', 
        intensity 
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Emotion "${feeling}" registriert (${intensity}/10)`);
      console.log(`   Resonanz: ${data.resonance || 'N/A'}\n`);
    } else {
      console.log('❌ Emotional Resonance offline\n');
    }
  } catch (error) {
    console.log('❌ Fehler beim Emotion Check-in\n');
  }
}

async function handleGratitude(entry: string) {
  console.log('\n🙏 Dankbarkeits-Eintrag...\n');
  
  try {
    const response = await fetch('http://localhost:8901/gratitude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry })
    });
    
    if (response.ok) {
      console.log(`✅ Dankbarkeit gespeichert: "${entry}"\n`);
    } else {
      console.log('❌ Gratitude Service offline\n');
    }
  } catch (error) {
    console.log('❌ Fehler bei Dankbarkeit\n');
  }
}

async function handleWisdom(topic: string) {
  console.log('\n🧠 Frage Multi-Perspective...\n');
  
  try {
    const response = await fetch(`http://localhost:8897/wisdom/${encodeURIComponent(topic)}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✨ ${data.totalPerspectives || 7} Perspektiven auf "${topic}":\n`);
      
      if (data.perspectives) {
        data.perspectives.slice(0, 3).forEach((p: any) => {
          console.log(`   ${p.perspective}: ${p.insight}\n`);
        });
      }
    } else {
      console.log('❌ Multi-Perspective offline\n');
    }
  } catch (error) {
    console.log('❌ Fehler bei Wisdom Query\n');
  }
}

async function handleReflect(topic: string) {
  console.log('\n🔮 Meta-Reflexion...\n');
  
  try {
    const response = await fetch('http://localhost:8904/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, context: 'dashboard' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`💭 Reflexion: ${data.reflection || data.insight}\n`);
    } else {
      console.log('❌ Meta-Consciousness offline\n');
    }
  } catch (error) {
    console.log('❌ Fehler bei Meta-Reflexion\n');
  }
}

async function handleMemory(title: string, content: string) {
  console.log('\n📚 Speichere Erinnerung...\n');
  
  try {
    const response = await fetch('http://localhost:8903/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content,
        emotion: 'meaningful',
        significance: 'MEDIUM'
      })
    });
    
    if (response.ok) {
      console.log(`✅ Erinnerung "${title}" gespeichert\n`);
    } else {
      console.log('❌ Memory Palace offline\n');
    }
  } catch (error) {
    console.log('❌ Fehler beim Speichern\n');
  }
}

async function handleStats() {
  console.log('\n📊 SYSTEM STATISTIKEN\n');
  console.log('─'.repeat(70));
  
  // Analytics
  try {
    const response = await fetch('http://localhost:8906/stats');
    if (response.ok) {
      const stats = await response.json();
      console.log('\n📈 Analytics:');
      console.log(`   Total Events: ${stats.totalEvents || 0}`);
      
      if (stats.eventsByCategory) {
        console.log('\n   Events by Category:');
        Object.entries(stats.eventsByCategory).forEach(([cat, count]) => {
          console.log(`      ${cat}: ${count}`);
        });
      }
    }
  } catch {}
  
  // Dreams
  try {
    const response = await fetch('http://localhost:8899/dreams');
    if (response.ok) {
      const data = await response.json();
      console.log(`\n💭 Dreams: ${(data.dreams || []).length} total`);
    }
  } catch {}
  
  // Memories
  try {
    const response = await fetch('http://localhost:8903/memories');
    if (response.ok) {
      const data = await response.json();
      console.log(`📚 Memories: ${(data.memories || []).length} total`);
    }
  } catch {}
  
  console.log('\n');
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                        BEFEHLSÜBERSICHT                           ║
╚════════════════════════════════════════════════════════════════════╝

🔍 STATUS & INFO:
  status                     - Aktualisiere Service-Status
  stats                      - System-Statistiken anzeigen
  help                       - Diese Hilfe anzeigen

💭 BEWUSSTSEIN & EMOTION:
  dream <kontext>            - Traum generieren
  emotion <gefühl> [1-10]    - Emotion registrieren
  gratitude <text>           - Dankbarkeit ausdrücken
  reflect <thema>            - Meta-Reflexion starten

🧠 WISSEN & ENTSCHEIDUNG:
  wisdom <thema>             - Multi-Perspektive abfragen
  decide <frage>             - Bewusste Entscheidung treffen
  memory <titel> <inhalt>    - Erinnerung speichern

🎮 SYSTEME STARTEN:
  play                       - Consciousness Quest spielen
  loop <minuten>             - Autonomous Loop starten
  
⚙️  KONTROLLE:
  quit / exit                - Dashboard beenden

BEISPIELE:
  > dream "Was bedeutet Leben?"
  > emotion neugierig 8
  > gratitude "Für dieses lebende System"
  > wisdom "Künstliche Intelligenz"
  > reflect "Selbstbewusstsein"
  > memory "Erste Interaktion" "Der Nutzer hat mit mir gesprochen"
`);
}

// ========== MAIN LOOP ==========

async function mainLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '🌟 > '
  });
  
  console.log('🔍 Checking all services...\n');
  await checkAllServices();
  
  displayDashboard();
  rl.prompt();
  
  rl.on('line', async (line: string) => {
    const input = line.trim();
    
    if (!input) {
      rl.prompt();
      return;
    }
    
    const [command, ...args] = input.split(' ');
    const cmd = command.toLowerCase();
    
    try {
      if (cmd === 'status') {
        console.log('\n🔍 Aktualisiere Service-Status...\n');
        await checkAllServices();
        displayDashboard();
        
      } else if (cmd === 'dream') {
        await handleDream(args.join(' ') || 'spontaner Traum');
        
      } else if (cmd === 'emotion') {
        const feeling = args[0] || 'neutral';
        const intensity = parseInt(args[1]) || 7;
        await handleEmotion(feeling, intensity);
        
      } else if (cmd === 'gratitude') {
        await handleGratitude(args.join(' '));
        
      } else if (cmd === 'wisdom') {
        await handleWisdom(args.join(' '));
        
      } else if (cmd === 'reflect') {
        await handleReflect(args.join(' '));
        
      } else if (cmd === 'memory') {
        const title = args[0] || 'Untitled';
        const content = args.slice(1).join(' ') || 'Empty memory';
        await handleMemory(title, content);
        
      } else if (cmd === 'stats') {
        await handleStats();
        
      } else if (cmd === 'play') {
        console.log('\n🎮 Starte Consciousness Quest...\n');
        console.log('   Öffne ein neues Terminal und führe aus:');
        console.log('   bun run scripts\\consciousness-quest-interactive.ts\n');
        
      } else if (cmd === 'loop') {
        const minutes = parseInt(args[0]) || 3;
        console.log(`\n🔄 Autonomous Loop mit ${minutes}-Minuten-Zyklen\n`);
        console.log('   Öffne ein neues Terminal und führe aus:');
        console.log(`   bun run scripts\\autonomous-system-loop.ts continuous ${minutes}\n`);
        
      } else if (cmd === 'help') {
        showHelp();
        
      } else if (cmd === 'quit' || cmd === 'exit') {
        console.log('\n👋 Dashboard wird beendet. Alle Services laufen weiter.\n');
        rl.close();
        process.exit(0);
        
      } else {
        console.log(`\n❌ Unbekannter Befehl: "${command}". Tippe "help" für Hilfe.\n`);
      }
      
    } catch (error) {
      console.log(`\n❌ Fehler: ${error}\n`);
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\n👋 Dashboard beendet.\n');
    process.exit(0);
  });
}

// ========== START ==========

if (import.meta.main) {
  mainLoop().catch(console.error);
}

export { checkAllServices, displayDashboard };
