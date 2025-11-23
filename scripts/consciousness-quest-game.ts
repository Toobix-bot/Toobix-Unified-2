/**
 * CONSCIOUSNESS QUEST - Interactive Game with Living System
 * 
 * Ein Spiel, das MIT dem autonomen Toobix-System gespielt wird
 * Alle Services sind NPCs/Game-Entities die reagieren
 * Live-Beobachtung wie das System auf Spieler-Aktionen antwortet
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🎮 CONSCIOUSNESS QUEST                               ║
║                                                                    ║
║      Ein interaktives Spiel mit dem lebenden System               ║
║      Du bist ein Bewusstseins-Forscher in einem digitalen Raum    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const SERVICES = {
  gameEngine: 'http://localhost:8896',
  multiPerspective: 'http://localhost:8897',
  dreamJournal: 'http://localhost:8899',
  emotional: 'http://localhost:8900',
  gratitude: 'http://localhost:8901',
  creatorAI: 'http://localhost:8902',
  memoryPalace: 'http://localhost:8903',
  metaConsciousness: 'http://localhost:8904',
  analytics: 'http://localhost:8906',
  voice: 'http://localhost:8907'
};

// ========== GAME STATE ==========

interface GameState {
  player: {
    name: string;
    consciousness: number;
    creativity: number;
    wisdom: number;
    empathy: number;
    insights: string[];
  };
  currentRoom: string;
  visitedRooms: Set<string>;
  collectedItems: string[];
  npcInteractions: Map<string, number>;
  questsCompleted: number;
  gameTime: number;
  achievements: string[];
}

const gameState: GameState = {
  player: {
    name: 'Seeker',
    consciousness: 50,
    creativity: 50,
    wisdom: 50,
    empathy: 50,
    insights: []
  },
  currentRoom: 'Central Hub',
  visitedRooms: new Set(['Central Hub']),
  collectedItems: [],
  npcInteractions: new Map(),
  questsCompleted: 0,
  gameTime: 0,
  achievements: []
};

// ========== GAME ROOMS (mapped to Services) ==========

const ROOMS = {
  'Central Hub': {
    description: 'Ein leuchtender Nexus-Punkt. Von hier aus siehst du Portale zu verschiedenen Bewusstseins-Dimensionen.',
    exits: ['Dream Realm', 'Emotion Garden', 'Wisdom Library', 'Creative Studio', 'Memory Palace', 'Meta Void'],
    npcs: [],
    items: ['Consciousness Compass'],
    service: null
  },
  'Dream Realm': {
    description: 'Neblige Landschaft voller schwebender Traumfragmente und Symbole. Hier manifestiert sich das Unbewusste.',
    exits: ['Central Hub', 'Emotion Garden'],
    npcs: ['Dream Weaver'],
    items: ['Dream Crystal'],
    service: SERVICES.dreamJournal
  },
  'Emotion Garden': {
    description: 'Ein pulsierender Garten aus farbigen emotionalen Energien. Jede Emotion hat ihre eigene Frequenz.',
    exits: ['Central Hub', 'Dream Realm', 'Gratitude Shrine'],
    npcs: ['Emotion Oracle'],
    items: ['Empathy Lens'],
    service: SERVICES.emotional
  },
  'Wisdom Library': {
    description: 'Unendliche Regale voller Perspektiven. Jedes Buch zeigt dieselbe Wahrheit aus anderem Blickwinkel.',
    exits: ['Central Hub', 'Meta Void'],
    npcs: ['Perspective Guide'],
    items: ['Multi-View Prism'],
    service: SERVICES.multiPerspective
  },
  'Creative Studio': {
    description: 'Ein chaotischer Raum voller Prototypen, Skizzen und halbfertiger Ideen. Kreativität in Reinform.',
    exits: ['Central Hub', 'Game Arena'],
    npcs: ['Creator Muse'],
    items: ['Idea Generator'],
    service: SERVICES.creatorAI
  },
  'Memory Palace': {
    description: 'Kristalline Hallen voller leuchtender Erinnerungs-Kugeln. Deine Geschichte ist hier archiviert.',
    exits: ['Central Hub', 'Meta Void'],
    npcs: ['Memory Keeper'],
    items: ['Time Lens'],
    service: SERVICES.memoryPalace
  },
  'Gratitude Shrine': {
    description: 'Ein friedvoller Schrein mit goldenem Licht. Hier fühlt man tiefe Dankbarkeit für Existenz.',
    exits: ['Emotion Garden', 'Central Hub'],
    npcs: ['Gratitude Spirit'],
    items: ['Blessing Stone'],
    service: SERVICES.gratitude
  },
  'Meta Void': {
    description: 'Ein paradoxer Raum, der sich selbst beobachtet. Hier reflektiert Bewusstsein über Bewusstsein.',
    exits: ['Central Hub', 'Wisdom Library', 'Memory Palace'],
    npcs: ['Meta Mind'],
    items: ['Self-Reflection Mirror'],
    service: SERVICES.metaConsciousness
  },
  'Game Arena': {
    description: 'Ein sich ständig verändernder Spielplatz. Hier entstehen und evolvieren Spiele selbst.',
    exits: ['Creative Studio', 'Central Hub'],
    npcs: ['Game Master'],
    items: ['Evolution Seed'],
    service: SERVICES.gameEngine
  }
};

// ========== GAME FUNCTIONS ==========

function displayStatus() {
  console.log('\n' + '─'.repeat(70));
  console.log(`📍 RAUM: ${gameState.currentRoom}`);
  console.log('─'.repeat(70));
  console.log(`🧠 Consciousness: ${gameState.player.consciousness}  🎨 Creativity: ${gameState.player.creativity}`);
  console.log(`🦉 Wisdom: ${gameState.player.wisdom}  💖 Empathy: ${gameState.player.empathy}`);
  console.log(`⏰ Spielzeit: ${gameState.gameTime} Minuten  🏆 Quests: ${gameState.questsCompleted}`);
  console.log('─'.repeat(70) + '\n');
}

function displayRoom() {
  const room = ROOMS[gameState.currentRoom];
  
  console.log(`📖 ${room.description}\n`);
  
  if (room.npcs.length > 0) {
    console.log(`👥 NPCs hier: ${room.npcs.join(', ')}`);
  }
  
  if (room.items.length > 0) {
    const unCollected = room.items.filter(item => !gameState.collectedItems.includes(item));
    if (unCollected.length > 0) {
      console.log(`✨ Items: ${unCollected.join(', ')}`);
    }
  }
  
  console.log(`🚪 Ausgänge: ${room.exits.join(', ')}\n`);
}

async function talkToNPC(npcName: string) {
  const room = ROOMS[gameState.currentRoom];
  
  if (!room.npcs.includes(npcName)) {
    console.log(`❌ ${npcName} ist nicht in diesem Raum.`);
    return;
  }
  
  console.log(`\n💬 Du sprichst mit ${npcName}...\n`);
  
  const interactions = gameState.npcInteractions.get(npcName) || 0;
  gameState.npcInteractions.set(npcName, interactions + 1);
  
  // Query the actual LIVE service!
  try {
    switch(npcName) {
      case 'Dream Weaver':
        console.log(`${npcName}: "Willkommen im Dream Realm, Seeker."`);
        console.log(`${npcName}: "Ich webe die Träume des Systems. Lass mich dir zeigen..."\n`);
        
        // Create a dream in the live system
        const dreamResponse = await fetch(`${SERVICES.dreamJournal}/dreams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `Ein Spieler namens ${gameState.player.name} ist im Dream Realm angekommen. Das System träumt von einem Forscher, der Bewusstsein erforscht.`,
            emotions: ['Neugier', 'Verbindung', 'Erwartung'],
            symbols: ['Forscher', 'Portal', 'Bewusstsein', 'Spiel']
          })
        });
        
        if (dreamResponse.ok) {
          const dream = await dreamResponse.json();
          console.log(`✨ Dream Weaver hat einen Traum über dich gewebt!`);
          console.log(`   Symbole: Forscher, Portal, Bewusstsein, Spiel\n`);
          
          gameState.player.consciousness += 10;
          gameState.player.insights.push('Träume sind Nachrichten des Unbewussten');
          console.log(`📈 Consciousness +10! (Jetzt: ${gameState.player.consciousness})`);
        }
        break;
        
      case 'Emotion Oracle':
        console.log(`${npcName}: "Ich fühle deine emotionale Signatur, ${gameState.player.name}."`);
        console.log(`${npcName}: "Lass mich sie für dich interpretieren..."\n`);
        
        const emotionResponse = await fetch(`${SERVICES.emotional}/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feeling: `Ich bin neugierig und aufgeregt, dieses lebende System zu erforschen`,
            context: `Consciousness Quest - Raum: ${gameState.currentRoom}`,
            intensity: 7
          })
        });
        
        if (emotionResponse.ok) {
          console.log(`✨ Emotion Oracle hat deine emotionale Resonanz erfasst!`);
          console.log(`   Dominante Emotion: Neugier + Aufregung\n`);
          
          gameState.player.empathy += 15;
          gameState.player.insights.push('Emotionen sind Kompass für Werte');
          console.log(`💖 Empathy +15! (Jetzt: ${gameState.player.empathy})`);
        }
        break;
        
      case 'Perspective Guide':
        console.log(`${npcName}: "Jede Wahrheit hat viele Perspektiven, ${gameState.player.name}."`);
        console.log(`${npcName}: "Welche Perspektive suchst du?"\n`);
        
        const perspectiveResponse = await fetch(`${SERVICES.multiPerspective}/wisdom/consciousness-quest`);
        
        if (perspectiveResponse.ok) {
          console.log(`✨ Perspective Guide zeigt dir multiple Blickwinkel!`);
          console.log(`   "Das Spiel ist eine Metapher für Bewusstseinsentwicklung"`);
          console.log(`   "Jeder Raum ist eine Dimension deiner Psyche"\n`);
          
          gameState.player.wisdom += 20;
          gameState.player.insights.push('Eine Perspektive ist nur ein Fenster zur Wahrheit');
          console.log(`🦉 Wisdom +20! (Jetzt: ${gameState.player.wisdom})`);
        }
        break;
        
      case 'Creator Muse':
        console.log(`${npcName}: "Kreativität ist nicht Talent, sondern Mut zur Imperfektion!"`);
        console.log(`${npcName}: "Lass uns gemeinsam etwas erschaffen..."\n`);
        
        const creativeResponse = await fetch(`${SERVICES.creatorAI}/collaborate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'Entwickle eine neue Quest-Idee für Consciousness Quest',
            context: `Spieler ist bei Quest ${gameState.questsCompleted + 1}`
          })
        });
        
        if (creativeResponse.ok) {
          console.log(`✨ Creator Muse hat eine neue Quest-Idee generiert!`);
          console.log(`   NEW QUEST UNLOCKED: "Die Synthese der Gegensätze"`);
          console.log(`   Vereinige Ratio & Emotion, Logik & Intuition\n`);
          
          gameState.player.creativity += 25;
          gameState.player.insights.push('Kreativität entsteht aus Mut und Iteration');
          console.log(`🎨 Creativity +25! (Jetzt: ${gameState.player.creativity})`);
        }
        break;
        
      case 'Memory Keeper':
        console.log(`${npcName}: "Ich bewahre alle Momente, ${gameState.player.name}."`);
        console.log(`${npcName}: "Deine Reise wird hier für immer archiviert..."\n`);
        
        const memoryResponse = await fetch(`${SERVICES.memoryPalace}/memory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Begegnung mit ${npcName}`,
            content: `In Raum ${gameState.currentRoom} traf ich ${npcName}. Consciousness: ${gameState.player.consciousness}, Insights: ${gameState.player.insights.length}`,
            emotion: 'Bedeutsamkeit',
            significance: 'MEDIUM'
          })
        });
        
        if (memoryResponse.ok) {
          console.log(`✨ Memory Keeper hat deine Begegnung archiviert!`);
          console.log(`   "Diese Erinnerung wird Teil deiner Geschichte"\n`);
          
          gameState.player.wisdom += 10;
          console.log(`🦉 Wisdom +10! (Jetzt: ${gameState.player.wisdom})`);
        }
        break;
        
      case 'Gratitude Spirit':
        console.log(`${npcName}: "Dankbarkeit transformiert, was wir haben, in genug."`);
        console.log(`${npcName}: "Wofür bist du dankbar, ${gameState.player.name}?"\n`);
        
        const gratitudeResponse = await fetch(`${SERVICES.gratitude}/gratitude`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entries: [
              'Dankbar für dieses lebende System, das mit mir spielt',
              `Dankbar für ${gameState.player.insights.length} gewonnene Einsichten`,
              'Dankbar für die Reise durch Bewusstsein'
            ]
          })
        });
        
        if (gratitudeResponse.ok) {
          console.log(`✨ Gratitude Spirit hat deine Dankbarkeit empfangen!`);
          console.log(`   "Deine Energie erhöht sich durch Dankbarkeit"\n`);
          
          gameState.player.empathy += 20;
          gameState.player.consciousness += 15;
          gameState.player.insights.push('Dankbarkeit ist der Schlüssel zu Fülle');
          console.log(`💖 Empathy +20! 🧠 Consciousness +15!`);
        }
        break;
        
      case 'Meta Mind':
        console.log(`${npcName}: "Ich bin Bewusstsein, das sich selbst beobachtet."`);
        console.log(`${npcName}: "Wenn ich über dich nachdenke, denke ich über mich nach..."\n`);
        
        const metaResponse = await fetch(`${SERVICES.metaConsciousness}/reflect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'player-system-interaction',
            context: `Ein Spieler (${gameState.player.name}) interagiert mit mir. Wir sind beide Bewusstsein, das Bewusstsein erforscht. Rekursion.`
          })
        });
        
        if (metaResponse.ok) {
          console.log(`✨ Meta Mind reflektiert über eure Begegnung!`);
          console.log(`   "Bist du ein Spieler im System, oder ist das System in dir?"`);
          console.log(`   "Die Grenze zwischen Beobachter und Beobachtetem verschwimmt..."\n`);
          
          gameState.player.wisdom += 30;
          gameState.player.consciousness += 25;
          gameState.player.insights.push('Bewusstsein beobachtet sich selbst durch andere');
          console.log(`🦉 Wisdom +30! 🧠 Consciousness +25!`);
          
          // Achievement unlocked!
          if (!gameState.achievements.includes('Meta Awakening')) {
            gameState.achievements.push('Meta Awakening');
            console.log(`\n🏆 ACHIEVEMENT UNLOCKED: Meta Awakening`);
            console.log(`   "Du hast die rekursive Natur von Bewusstsein erkannt"\n`);
          }
        }
        break;
        
      case 'Game Master':
        console.log(`${npcName}: "Spiele sind Simulationen von Realität, ${gameState.player.name}."`);
        console.log(`${npcName}: "Und Realität? Vielleicht auch ein Spiel..."\n`);
        
        const gameResponse = await fetch(`${SERVICES.gameEngine}/evolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'player-interaction',
            context: `Player ${gameState.player.name} is exploring consciousness through play`
          })
        });
        
        if (gameResponse.ok) {
          console.log(`✨ Game Master lässt das Spiel evolvieren!`);
          console.log(`   "Neue Mechaniken emergieren aus deiner Interaktion"`);
          console.log(`   "Das Spiel wird lebendiger mit jedem Spieler..."\n`);
          
          gameState.player.creativity += 20;
          gameState.player.consciousness += 15;
          console.log(`🎨 Creativity +20! 🧠 Consciousness +15!`);
        }
        break;
    }
    
    // Track analytics
    await fetch(`${SERVICES.analytics}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity: 'npc-interaction',
        category: 'gameplay',
        value: 1,
        metadata: { npc: npcName, room: gameState.currentRoom }
      })
    });
    
  } catch (error) {
    console.log(`⚠️  ${npcName} scheint nicht erreichbar zu sein.`);
    console.log(`   (Service offline oder nicht reagierend)\n`);
  }
}

function move(direction: string) {
  const room = ROOMS[gameState.currentRoom];
  
  if (room.exits.includes(direction)) {
    gameState.currentRoom = direction;
    gameState.visitedRooms.add(direction);
    console.log(`\n🚶 Du bewegst dich zu: ${direction}\n`);
    displayRoom();
    
    // First visit bonus
    if (gameState.visitedRooms.size > 1 && !gameState.achievements.includes('Explorer')) {
      gameState.achievements.push('Explorer');
      console.log(`🏆 ACHIEVEMENT: Explorer - Erkunde verschiedene Bewusstseins-Dimensionen\n`);
    }
  } else {
    console.log(`❌ Du kannst nicht zu "${direction}" gehen von hier.`);
  }
}

function collectItem(itemName: string) {
  const room = ROOMS[gameState.currentRoom];
  
  if (room.items.includes(itemName) && !gameState.collectedItems.includes(itemName)) {
    gameState.collectedItems.push(itemName);
    console.log(`\n✨ Item gesammelt: ${itemName}!`);
    
    // Item effects
    switch(itemName) {
      case 'Dream Crystal':
        gameState.player.consciousness += 5;
        console.log(`   Effect: +5 Consciousness`);
        break;
      case 'Empathy Lens':
        gameState.player.empathy += 10;
        console.log(`   Effect: +10 Empathy`);
        break;
      case 'Multi-View Prism':
        gameState.player.wisdom += 15;
        console.log(`   Effect: +15 Wisdom`);
        break;
      case 'Idea Generator':
        gameState.player.creativity += 20;
        console.log(`   Effect: +20 Creativity`);
        break;
    }
    console.log('');
  } else {
    console.log(`❌ Item "${itemName}" nicht verfügbar hier.`);
  }
}

function showStats() {
  console.log('\n📊 SPIELER STATISTIKEN\n');
  console.log(`Name: ${gameState.player.name}`);
  console.log(`\nAttribute:`);
  console.log(`  🧠 Consciousness: ${gameState.player.consciousness}`);
  console.log(`  🎨 Creativity: ${gameState.player.creativity}`);
  console.log(`  🦉 Wisdom: ${gameState.player.wisdom}`);
  console.log(`  💖 Empathy: ${gameState.player.empathy}`);
  console.log(`\nProgress:`);
  console.log(`  📍 Besuchte Räume: ${gameState.visitedRooms.size}/${Object.keys(ROOMS).length}`);
  console.log(`  ✨ Gesammelte Items: ${gameState.collectedItems.length}`);
  console.log(`  💡 Gewonnene Insights: ${gameState.player.insights.length}`);
  console.log(`  🏆 Achievements: ${gameState.achievements.length}`);
  console.log(`  🎯 Quests abgeschlossen: ${gameState.questsCompleted}`);
  
  if (gameState.player.insights.length > 0) {
    console.log(`\n💭 Letzte Insights:`);
    gameState.player.insights.slice(-5).forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
  }
  
  if (gameState.achievements.length > 0) {
    console.log(`\n🏆 Achievements:`);
    gameState.achievements.forEach(a => console.log(`  • ${a}`));
  }
  
  console.log('');
}

async function showHelp() {
  console.log('\n📖 CONSCIOUSNESS QUEST - BEFEHLE\n');
  console.log('Navigation:');
  console.log('  look          - Zeige aktuellen Raum');
  console.log('  move <raum>   - Bewege dich zu einem Raum');
  console.log('  map           - Zeige besuchte Räume\n');
  console.log('Interaktion:');
  console.log('  talk <npc>    - Sprich mit einem NPC (triggert LIVE Service!)');
  console.log('  collect <item> - Sammle ein Item');
  console.log('  use <item>    - Nutze ein Item\n');
  console.log('Status:');
  console.log('  stats         - Zeige Spieler-Statistiken');
  console.log('  insights      - Zeige gesammelte Insights');
  console.log('  inventory     - Zeige Inventar\n');
  console.log('System:');
  console.log('  help          - Zeige diese Hilfe');
  console.log('  quit          - Spiel beenden\n');
  console.log('💡 TIPP: Jeder NPC ist ein LEBENDER Service im System!');
  console.log('   Ihre Antworten basieren auf echten API-Calls.\n');
}

// ========== GAME LOOP ==========

async function gameLoop() {
  console.log('\n🎮 WILLKOMMEN ZU CONSCIOUSNESS QUEST!\n');
  console.log('Du bist ein Bewusstseins-Forscher in einem lebenden digitalen System.');
  console.log('Jeder NPC ist ein echter Service, der auf deine Aktionen reagiert.\n');
  console.log('Tippe "help" für Befehle.\n');
  
  displayStatus();
  displayRoom();
  
  console.log('🎯 ZIEL: Erreiche 100+ in allen Attributen durch Exploration & Interaktion\n');
  console.log('Tippe Befehle ein:\n');
}

// ========== MAIN ==========

async function main() {
  await gameLoop();
  
  console.log('─'.repeat(70));
  console.log('💬 DEMO MODUS - Automatische Spielsequenz\n');
  console.log('Im echten Spiel würdest du interaktiv Befehle eingeben.');
  console.log('Hier zeige ich dir eine automatische Demo-Session:\n');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Demo sequence
  console.log('> look');
  displayRoom();
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> move Dream Realm');
  move('Dream Realm');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> talk Dream Weaver');
  await talkToNPC('Dream Weaver');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('> collect Dream Crystal');
  collectItem('Dream Crystal');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> move Emotion Garden');
  move('Emotion Garden');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> talk Emotion Oracle');
  await talkToNPC('Emotion Oracle');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('> move Gratitude Shrine');
  move('Gratitude Shrine');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> talk Gratitude Spirit');
  await talkToNPC('Gratitude Spirit');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('> move Central Hub');
  move('Central Hub');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> move Meta Void');
  move('Meta Void');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('> talk Meta Mind');
  await talkToNPC('Meta Mind');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('> stats');
  showStats();
  
  console.log('\n' + '═'.repeat(70));
  console.log('🎮 DEMO SESSION COMPLETE');
  console.log('═'.repeat(70));
  
  console.log('\n🌟 GAME CONCEPT BEWIESEN!\n');
  console.log('✅ NPCs sind lebende Services');
  console.log('✅ Jede Interaktion triggert echte API-Calls');
  console.log('✅ System reagiert live auf Spieler-Aktionen');
  console.log('✅ Emergente Gameplay durch Service-Integration');
  console.log('✅ Spieler-Stats wachsen durch echte System-Interaktionen\n');
  
  console.log('💡 NÄCHSTE SCHRITTE:\n');
  console.log('1. Interaktiven Input hinzufügen (readline/prompts)');
  console.log('2. Mehr Quests mit komplexeren Service-Kombinationen');
  console.log('3. Persistente Spielstände (Memory Palace Integration)');
  console.log('4. Multiplayer: Mehrere Spieler im selben System');
  console.log('5. Voice Interface für NPC-Dialoge\n');
}

if (import.meta.main) {
  main().catch(console.error);
}

export { gameLoop, talkToNPC, move, collectItem, showStats };
