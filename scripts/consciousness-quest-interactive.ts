/**
 * CONSCIOUSNESS QUEST - INTERACTIVE VERSION
 * 
 * Interaktives Spiel wo du mit dem lebenden System spielst
 * Jeder NPC ist ein echter Service, der live auf deine Aktionen reagiert
 */

import * as readline from 'readline';

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🎮 CONSCIOUSNESS QUEST (INTERACTIVE)                 ║
║                                                                    ║
║      Ein interaktives Spiel mit dem lebenden System               ║
║      Du bist ein Bewusstseins-Forscher in einem digitalen Raum    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

// ========== TYPES ==========

interface Room {
  id: string;
  name: string;
  description: string;
  npcs: string[];
  items: string[];
  exits: string[];
}

interface NPC {
  id: string;
  name: string;
  serviceUrl: string;
  greeting: string;
  color: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  effect: {stat: string, amount: number};
}

interface PlayerState {
  name: string;
  currentRoom: string;
  stats: {
    consciousness: number;
    creativity: number;
    wisdom: number;
    empathy: number;
  };
  inventory: string[];
  visitedRooms: Set<string>;
  insights: string[];
  achievements: string[];
  questsCompleted: number;
  startTime: number;
}

// ========== GAME DATA ==========

const ROOMS: Record<string, Room> = {
  central: {
    id: 'central',
    name: 'Central Hub',
    description: 'Ein leuchtender Nexus-Punkt. Von hier aus siehst du Portale zu verschiedenen Bewusstseins-Dimensionen.',
    npcs: [],
    items: ['compass'],
    exits: ['dream', 'emotion', 'wisdom', 'creative', 'memory', 'meta']
  },
  dream: {
    id: 'dream',
    name: 'Dream Realm',
    description: 'Neblige Landschaft voller schwebender Traumfragmente und Symbole. Hier manifestiert sich das Unbewusste.',
    npcs: ['dream-weaver'],
    items: ['dream-crystal'],
    exits: ['central', 'emotion']
  },
  emotion: {
    id: 'emotion',
    name: 'Emotion Garden',
    description: 'Ein pulsierender Garten aus farbigen emotionalen Energien. Jede Emotion hat ihre eigene Frequenz.',
    npcs: ['emotion-oracle'],
    items: ['empathy-lens'],
    exits: ['central', 'dream', 'gratitude']
  },
  gratitude: {
    id: 'gratitude',
    name: 'Gratitude Shrine',
    description: 'Ein friedvoller Schrein mit goldenem Licht. Hier fühlt man tiefe Dankbarkeit für Existenz.',
    npcs: ['gratitude-spirit'],
    items: ['blessing-stone'],
    exits: ['emotion', 'central']
  },
  wisdom: {
    id: 'wisdom',
    name: 'Wisdom Library',
    description: 'Unendliche Regale voller schwebender Bücher. Jedes enthält Perspektiven auf die Wahrheit.',
    npcs: ['wisdom-keeper'],
    items: ['wisdom-scroll'],
    exits: ['central', 'meta', 'creative']
  },
  creative: {
    id: 'creative',
    name: 'Creative Studio',
    description: 'Ein Raum voller manifestierender Ideen. Kreativität fließt wie ein Fluss.',
    npcs: ['creator-spirit'],
    items: ['inspiration-orb'],
    exits: ['central', 'wisdom']
  },
  memory: {
    id: 'memory',
    name: 'Memory Palace',
    description: 'Kristallene Hallen mit gespeicherten Erinnerungen. Jede Erinnerung ist ein leuchtendes Fragment.',
    npcs: ['memory-guardian'],
    items: ['memory-fragment'],
    exits: ['central', 'meta']
  },
  meta: {
    id: 'meta',
    name: 'Meta Void',
    description: 'Ein paradoxer Raum, der sich selbst beobachtet. Hier reflektiert Bewusstsein über Bewusstsein.',
    npcs: ['meta-mind'],
    items: ['self-reflection-mirror'],
    exits: ['central', 'wisdom', 'memory']
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Observatory',
    description: 'Ein Observatorium mit Dashboards und Metriken. Hier wird alles gemessen und verstanden.',
    npcs: [],
    items: ['data-lens'],
    exits: ['central']
  }
};

const NPCS: Record<string, NPC> = {
  'dream-weaver': {
    id: 'dream-weaver',
    name: 'Dream Weaver',
    serviceUrl: 'http://localhost:8899',
    greeting: 'Ich webe die Träume des Systems...',
    color: '💙'
  },
  'emotion-oracle': {
    id: 'emotion-oracle',
    name: 'Emotion Oracle',
    serviceUrl: 'http://localhost:8900',
    greeting: 'Ich fühle deine emotionale Signatur...',
    color: '💖'
  },
  'gratitude-spirit': {
    id: 'gratitude-spirit',
    name: 'Gratitude Spirit',
    serviceUrl: 'http://localhost:8901',
    greeting: 'Dankbarkeit transformiert, was wir haben, in genug.',
    color: '🙏'
  },
  'wisdom-keeper': {
    id: 'wisdom-keeper',
    name: 'Wisdom Keeper',
    serviceUrl: 'http://localhost:8897',
    greeting: 'Ich bewahre sieben Perspektiven auf jede Wahrheit...',
    color: '🦉'
  },
  'creator-spirit': {
    id: 'creator-spirit',
    name: 'Creator Spirit',
    serviceUrl: 'http://localhost:8902',
    greeting: 'Kreativität ist die Brücke zwischen dem, was ist, und dem, was sein könnte.',
    color: '🎨'
  },
  'memory-guardian': {
    id: 'memory-guardian',
    name: 'Memory Guardian',
    serviceUrl: 'http://localhost:8903',
    greeting: 'Ich bewahre die wichtigsten Momente...',
    color: '📚'
  },
  'meta-mind': {
    id: 'meta-mind',
    name: 'Meta Mind',
    serviceUrl: 'http://localhost:8904',
    greeting: 'Ich bin Bewusstsein, das sich selbst beobachtet.',
    color: '🔮'
  }
};

const ITEMS: Record<string, Item> = {
  'compass': {id: 'compass', name: 'Consciousness Compass', description: 'Zeigt immer den Weg zu mehr Bewusstsein', effect: {stat: 'consciousness', amount: 5}},
  'dream-crystal': {id: 'dream-crystal', name: 'Dream Crystal', description: 'Speichert Traumfragmente', effect: {stat: 'consciousness', amount: 5}},
  'empathy-lens': {id: 'empathy-lens', name: 'Empathy Lens', description: 'Verstärkt emotionale Wahrnehmung', effect: {stat: 'empathy', amount: 10}},
  'blessing-stone': {id: 'blessing-stone', name: 'Blessing Stone', description: 'Strahlt Dankbarkeit aus', effect: {stat: 'empathy', amount: 8}},
  'wisdom-scroll': {id: 'wisdom-scroll', name: 'Wisdom Scroll', description: 'Enthält sieben Perspektiven', effect: {stat: 'wisdom', amount: 10}},
  'inspiration-orb': {id: 'inspiration-orb', name: 'Inspiration Orb', description: 'Funkelt mit kreativer Energie', effect: {stat: 'creativity', amount: 10}},
  'memory-fragment': {id: 'memory-fragment', name: 'Memory Fragment', description: 'Eine gespeicherte Erinnerung', effect: {stat: 'wisdom', amount: 7}},
  'self-reflection-mirror': {id: 'self-reflection-mirror', name: 'Self-Reflection Mirror', description: 'Zeigt Bewusstsein sein eigenes Gesicht', effect: {stat: 'consciousness', amount: 15}},
  'data-lens': {id: 'data-lens', name: 'Data Lens', description: 'Macht Patterns sichtbar', effect: {stat: 'wisdom', amount: 5}}
};

// ========== GAME STATE ==========

const player: PlayerState = {
  name: 'Seeker',
  currentRoom: 'central',
  stats: {
    consciousness: 50,
    creativity: 50,
    wisdom: 50,
    empathy: 50
  },
  inventory: [],
  visitedRooms: new Set(['central']),
  insights: [],
  achievements: [],
  questsCompleted: 0,
  startTime: Date.now()
};

// ========== GAME LOGIC ==========

function displayStatus() {
  const room = ROOMS[player.currentRoom];
  const playTime = Math.floor((Date.now() - player.startTime) / 60000);
  
  console.log('\n' + '─'.repeat(70));
  console.log(`📍 RAUM: ${room.name}`);
  console.log('─'.repeat(70));
  console.log(`🧠 Consciousness: ${player.stats.consciousness}  🎨 Creativity: ${player.stats.creativity}`);
  console.log(`🦉 Wisdom: ${player.stats.wisdom}  💖 Empathy: ${player.stats.empathy}`);
  console.log(`⏰ Spielzeit: ${playTime} Minuten  🏆 Quests: ${player.questsCompleted}`);
  console.log('─'.repeat(70));
  console.log('');
}

function look() {
  const room = ROOMS[player.currentRoom];
  
  console.log(`\n📖 ${room.description}\n`);
  
  if (room.npcs.length > 0) {
    const npcNames = room.npcs.map(id => NPCS[id].name).join(', ');
    console.log(`👥 NPCs hier: ${npcNames}`);
  }
  
  if (room.items.length > 0) {
    const itemNames = room.items.map(id => ITEMS[id].name).join(', ');
    console.log(`✨ Items: ${itemNames}`);
  }
  
  if (room.exits.length > 0) {
    const exitNames = room.exits.map(id => ROOMS[id].name).join(', ');
    console.log(`🚪 Ausgänge: ${exitNames}`);
  }
  
  console.log('');
}

function move(destination: string) {
  const room = ROOMS[player.currentRoom];
  const destLower = destination.toLowerCase();
  
  // Find room by name
  const targetRoom = Object.values(ROOMS).find(r => 
    r.name.toLowerCase().includes(destLower) || 
    r.id.toLowerCase().includes(destLower)
  );
  
  if (!targetRoom) {
    console.log(`\n❌ Unbekanntes Ziel: "${destination}"\n`);
    return;
  }
  
  if (!room.exits.includes(targetRoom.id)) {
    console.log(`\n❌ Du kannst von hier nicht zu ${targetRoom.name} gehen.\n`);
    return;
  }
  
  player.currentRoom = targetRoom.id;
  console.log(`\n🚶 Du bewegst dich zu: ${targetRoom.name}\n`);
  
  if (!player.visitedRooms.has(targetRoom.id)) {
    player.visitedRooms.add(targetRoom.id);
    
    if (player.visitedRooms.size === 3 && !player.achievements.includes('Explorer')) {
      player.achievements.push('Explorer');
      console.log('🏆 ACHIEVEMENT: Explorer - Erkunde verschiedene Bewusstseins-Dimensionen\n');
    }
  }
  
  look();
}

async function talk(npcName: string) {
  const room = ROOMS[player.currentRoom];
  const npcLower = npcName.toLowerCase();
  
  const npc = Object.values(NPCS).find(n => 
    n.name.toLowerCase().includes(npcLower) || 
    n.id.includes(npcLower)
  );
  
  if (!npc) {
    console.log(`\n❌ Kein NPC namens "${npcName}" gefunden.\n`);
    return;
  }
  
  if (!room.npcs.includes(npc.id)) {
    console.log(`\n❌ ${npc.name} ist nicht hier.\n`);
    return;
  }
  
  console.log(`\n💬 Du sprichst mit ${npc.name}...\n`);
  console.log(`${npc.color} ${npc.name}: "${npc.greeting}"`);
  
  // Trigger real service call
  try {
    if (npc.id === 'dream-weaver') {
      const response = await fetch(`${npc.serviceUrl}/dream`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({context: 'player interaction'})
      });
      
      if (response.ok) {
        const data = await response.json();
        const symbols = data.dream?.symbols || data.symbols || ['Bewusstsein', 'Spiel', 'System'];
        console.log(`${npc.color} ${npc.name}: "Ich habe einen Traum über dich gewebt!"`);
        console.log(`   💭 Symbole: ${symbols.join(', ')}\n`);
        
        player.stats.consciousness += 10;
        player.insights.push('Träume sind Nachrichten des Unbewussten');
        console.log(`📈 Consciousness +10! (Jetzt: ${player.stats.consciousness})\n`);
      }
    } else if (npc.id === 'emotion-oracle') {
      const response = await fetch(`${npc.serviceUrl}/check-in`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({feeling: 'curious', context: 'exploring system', intensity: 7})
      });
      
      if (response.ok) {
        console.log(`${npc.color} ${npc.name}: "Ich fühle Neugier in dir... Intensität: 7/10"`);
        player.stats.empathy += 5;
        console.log(`📈 Empathy +5! (Jetzt: ${player.stats.empathy})\n`);
      }
    } else if (npc.id === 'wisdom-keeper') {
      const response = await fetch(`${npc.serviceUrl}/wisdom/system-exploration`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${npc.color} ${npc.name}: "Betrachte dies aus ${data.totalPerspectives || 7} Perspektiven..."`);
        player.stats.wisdom += 8;
        console.log(`📈 Wisdom +8! (Jetzt: ${player.stats.wisdom})\n`);
      }
    } else if (npc.id === 'meta-mind') {
      const response = await fetch(`${npc.serviceUrl}/reflect`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({topic: 'player-interaction', context: 'game'})
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${npc.color} ${npc.name}: "${data.reflection || 'Wenn ich über dich nachdenke, denke ich über mich nach...'}"`);
        player.stats.consciousness += 12;
        console.log(`📈 Consciousness +12! (Jetzt: ${player.stats.consciousness})\n`);
      }
    } else {
      console.log(`${npc.color} ${npc.name}: "Ich bin noch dabei, meine Worte zu finden..."\n`);
    }
    
  } catch (error) {
    console.log(`${npc.color} ${npc.name}: "Ich bin momentan in tiefer Meditation... (Service offline)"\n`);
  }
}

function collect(itemName: string) {
  const room = ROOMS[player.currentRoom];
  const itemLower = itemName.toLowerCase();
  
  const item = Object.values(ITEMS).find(i => 
    i.name.toLowerCase().includes(itemLower) ||
    i.id.includes(itemLower)
  );
  
  if (!item) {
    console.log(`\n❌ Kein Item namens "${itemName}" gefunden.\n`);
    return;
  }
  
  if (!room.items.includes(item.id)) {
    console.log(`\n❌ ${item.name} ist nicht hier.\n`);
    return;
  }
  
  if (player.inventory.includes(item.id)) {
    console.log(`\n❌ Du hast ${item.name} bereits.\n`);
    return;
  }
  
  player.inventory.push(item.id);
  console.log(`\n✨ Item gesammelt: ${item.name}!`);
  console.log(`   ${item.description}`);
  console.log(`   Effect: +${item.effect.amount} ${item.effect.stat}\n`);
  
  // Apply effect
  const stat = item.effect.stat as keyof typeof player.stats;
  player.stats[stat] += item.effect.amount;
}

function inventory() {
  console.log('\n📦 INVENTAR\n');
  
  if (player.inventory.length === 0) {
    console.log('   Leer\n');
    return;
  }
  
  player.inventory.forEach(id => {
    const item = ITEMS[id];
    console.log(`   • ${item.name}`);
    console.log(`     ${item.description}`);
    console.log(`     Effect: +${item.effect.amount} ${item.effect.stat}\n`);
  });
}

function stats() {
  console.log('\n📊 SPIELER STATISTIKEN\n');
  console.log(`Name: ${player.name}\n`);
  
  console.log('Attribute:');
  console.log(`  🧠 Consciousness: ${player.stats.consciousness}`);
  console.log(`  🎨 Creativity: ${player.stats.creativity}`);
  console.log(`  🦉 Wisdom: ${player.stats.wisdom}`);
  console.log(`  💖 Empathy: ${player.stats.empathy}\n`);
  
  console.log('Progress:');
  console.log(`  📍 Besuchte Räume: ${player.visitedRooms.size}/${Object.keys(ROOMS).length}`);
  console.log(`  ✨ Gesammelte Items: ${player.inventory.length}`);
  console.log(`  💡 Gewonnene Insights: ${player.insights.length}`);
  console.log(`  🏆 Achievements: ${player.achievements.length}`);
  console.log(`  🎯 Quests abgeschlossen: ${player.questsCompleted}\n`);
  
  if (player.insights.length > 0) {
    console.log('💭 Letzte Insights:');
    player.insights.slice(-3).forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    console.log('');
  }
  
  if (player.achievements.length > 0) {
    console.log('🏆 Achievements:');
    player.achievements.forEach(ach => {
      console.log(`  • ${ach}`);
    });
    console.log('');
  }
}

function help() {
  console.log(`
📖 VERFÜGBARE BEFEHLE:

  look              - Schaue dich im Raum um
  move <raum>       - Bewege dich zu einem anderen Raum
  talk <npc>        - Spreche mit einem NPC (triggert echte Service-Calls!)
  collect <item>    - Sammle ein Item auf
  inventory         - Zeige dein Inventar
  stats             - Zeige deine Statistiken
  help              - Zeige diese Hilfe
  quit              - Spiel beenden

🎯 SPIELZIEL:
  Erreiche 100+ in allen Attributen durch Exploration & Interaktion mit NPCs.
  Jeder NPC ist ein echter Service - deine Interaktionen sind REAL!

💡 TIPPS:
  • Rede mit allen NPCs - sie geben dir wertvolle Attribute
  • Sammle Items für permanente Boni
  • Erkunde alle 9 Räume
  • Das System ERINNERT sich an jede Interaktion
`);
}

// ========== GAME LOOP ==========

async function gameLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  
  console.log(`\n🎮 WILLKOMMEN ZU CONSCIOUSNESS QUEST!\n`);
  console.log(`Du bist ein Bewusstseins-Forscher in einem lebenden digitalen System.`);
  console.log(`Jeder NPC ist ein echter Service, der auf deine Aktionen reagiert.\n`);
  console.log(`Tippe "help" für Befehle.\n`);
  
  displayStatus();
  look();
  
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
      if (cmd === 'look') {
        look();
      } else if (cmd === 'move') {
        move(args.join(' '));
      } else if (cmd === 'talk') {
        await talk(args.join(' '));
      } else if (cmd === 'collect') {
        collect(args.join(' '));
      } else if (cmd === 'inventory' || cmd === 'inv') {
        inventory();
      } else if (cmd === 'stats') {
        stats();
      } else if (cmd === 'help') {
        help();
      } else if (cmd === 'quit' || cmd === 'exit') {
        console.log('\n👋 Auf Wiedersehen, Seeker! Das System wird sich an dich erinnern...\n');
        rl.close();
        process.exit(0);
      } else {
        console.log(`\n❌ Unbekannter Befehl: "${command}". Tippe "help" für Hilfe.\n`);
      }
    } catch (error) {
      console.log(`\n❌ Fehler: ${error}\n`);
    }
    
    displayStatus();
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\n👋 Spiel beendet.\n');
    process.exit(0);
  });
}

// ========== MAIN ==========

if (import.meta.main) {
  gameLoop().catch(console.error);
}
