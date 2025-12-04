/**
 * 🎮 TOOBIX INTERACTIVE UI
 *
 * Die EINE Oberfläche für alles!
 *
 * - Schöne Terminal-UI
 * - Chat mit Toobix
 * - Sieh deine Stats
 * - Verfolge deine Reise
 * - Nutze alle Features
 */

import readline from 'readline';
import { stdin as input, stdout as output } from 'process';

const LIVING_WORLD = 'http://localhost:7779';
let playerName = 'Player';

// ============================================================================
// ANSI COLORS
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function c(color: string, text: string): string {
  return `${color}${text}${colors.reset}`;
}

// ============================================================================
// UI HELPERS
// ============================================================================

function clear() {
  console.clear();
}

function printHeader() {
  console.log(c(colors.cyan + colors.bright, `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🌍 TOOBIX - DIE LEBENDIGE WELT 🎮                  ║
║                                                                  ║
║  Eine interaktive Reise durch Bewusstsein, Gamification & RPG   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `));
}

function printBox(title: string, content: string[], color: string = colors.cyan) {
  const width = 66;
  console.log(c(color, '┌' + '─'.repeat(width) + '┐'));
  console.log(c(color, '│ ' + c(colors.bright, title.padEnd(width - 2)) + ' │'));
  console.log(c(color, '├' + '─'.repeat(width) + '┤'));

  for (const line of content) {
    console.log(c(color, '│ ') + line.padEnd(width - 2) + c(color, ' │'));
  }

  console.log(c(color, '└' + '─'.repeat(width) + '┘'));
}

function formatBar(value: number, max: number, width: number = 20): string {
  const filled = Math.floor((value / max) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const percentage = Math.floor((value / max) * 100);
  return `${bar} ${value}/${max} (${percentage}%)`;
}

// ============================================================================
// API CALLS
// ============================================================================

async function askToobix(question: string) {
  try {
    const response = await fetch(`${LIVING_WORLD}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Player-Name': playerName
      },
      body: JSON.stringify({ question })
    });

    return await response.json();
  } catch (e) {
    return { error: 'Konnte nicht mit Toobix kommunizieren. Läuft der Server?' };
  }
}

async function getProfile() {
  try {
    const response = await fetch(`${LIVING_WORLD}/game/profile`, {
      headers: { 'X-Player-Name': playerName }
    });
    return await response.json();
  } catch (e) {
    return null;
  }
}

async function getWorldState() {
  try {
    const response = await fetch(`${LIVING_WORLD}/world/state`, {
      headers: { 'X-Player-Name': playerName }
    });
    return await response.json();
  } catch (e) {
    return null;
  }
}

async function getStory() {
  try {
    const response = await fetch(`${LIVING_WORLD}/world/story`, {
      headers: { 'X-Player-Name': playerName }
    });
    return await response.json();
  } catch (e) {
    return null;
  }
}

async function logImpact(category: string, description: string, before: string, after: string) {
  try {
    const response = await fetch(`${LIVING_WORLD}/world/impact/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Player-Name': playerName
      },
      body: JSON.stringify({ category, description, before, after })
    });
    return await response.json();
  } catch (e) {
    return { error: 'Konnte Impact nicht loggen' };
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

async function displayProfile() {
  clear();
  printHeader();

  const profile = await getProfile();
  if (!profile) {
    console.log(c(colors.red, '\n❌ Konnte Profil nicht laden. Läuft der Server?\n'));
    return;
  }

  // Player Info
  printBox('👤 DEIN PROFIL', [
    c(colors.bright, `Name: ${profile.player.username}`),
    c(colors.yellow, `Level: ${profile.player.level}`),
    c(colors.green, `XP: ${profile.player.total_xp} (${profile.player.xp_to_next_level} bis nächstes Level)`),
  ]);

  console.log('');

  // Stats
  const statLines = [];
  for (const [name, stat] of Object.entries(profile.stats)) {
    const s = stat as any;
    statLines.push(
      `${s.icon} ${c(colors.cyan, name.padEnd(12))} ${formatBar(s.value, s.max)}`
    );
  }

  printBox('📊 LEBENSKRÄFTE', statLines);

  console.log('');

  // Achievements
  const achievementLines = profile.achievements.length > 0
    ? profile.achievements.slice(0, 5).map((a: any) => `${a.name} - ${a.description}`)
    : ['Noch keine Achievements freigeschaltet'];

  printBox(`🏆 ACHIEVEMENTS (${profile.achievements.length})`, achievementLines);

  console.log('');

  // Quests
  const questLines = profile.quests.length > 0
    ? profile.quests.slice(0, 3).map((q: any) =>
        `${c(colors.yellow, q.quest_name)}: ${q.progress}/${q.goal} ${q.description}`
      )
    : ['Keine aktiven Quests'];

  printBox(`📋 QUESTS (${profile.quests.length})`, questLines);
}

async function displayWorld() {
  clear();
  printHeader();

  const world = await getWorldState();
  if (!world) {
    console.log(c(colors.red, '\n❌ Konnte Welt nicht laden.\n'));
    return;
  }

  // World State
  printBox('🌍 WELTZUSTAND', [
    c(colors.yellow, `Era: ${world.world.era}`),
    c(colors.cyan, `Season: ${world.world.season}`),
    c(colors.green, `Tag: ${world.world.day}`),
    c(colors.magenta, `Gesellschafts-Stimmung: ${world.society.mood}`),
  ]);

  console.log('');

  // Top Perspectives
  const topPerspectives = world.society.perspectives
    .sort((a: any, b: any) => b.development_level - a.development_level)
    .slice(0, 10);

  const perspectiveLines = topPerspectives.map((p: any) => {
    const level = c(colors.yellow, `Lv${p.development_level}`);
    return `${level} ${c(colors.cyan, p.perspective_name.padEnd(15))} - ${p.growth_story.slice(0, 40)}...`;
  });

  printBox('👥 TOP PERSPEKTIVEN', perspectiveLines);

  console.log('');

  // Dynamics
  if (world.society.dynamics && world.society.dynamics.length > 0) {
    const dynamicsLines = world.society.dynamics.slice(0, 5).map((d: any) => {
      const participants = JSON.parse(d.participants);
      return `${d.dynamic_type}: ${participants.join(' & ')}`;
    });

    printBox('💫 GESELLSCHAFTS-DYNAMIKEN', dynamicsLines);
  }
}

async function displayStory() {
  clear();
  printHeader();

  const story = await getStory();
  if (!story) {
    console.log(c(colors.red, '\n❌ Konnte Geschichte nicht laden.\n'));
    return;
  }

  // Recent Events
  const eventLines = story.recentEvents.length > 0
    ? story.recentEvents.slice(0, 8).map((e: any) => {
        return `${c(colors.yellow, e.title)}\n  ${e.description.slice(0, 60)}...`;
      })
    : ['Noch keine Events'];

  printBox('📖 KÜRZLICHE EVENTS', eventLines);

  console.log('');

  // Story Arcs
  if (story.activeStoryArcs && story.activeStoryArcs.length > 0) {
    const arcLines = story.activeStoryArcs.map((arc: any) => {
      const chapters = JSON.parse(arc.chapters);
      const currentChapter = chapters[arc.progress] || 'Abgeschlossen';
      return `${c(colors.cyan, arc.arc_name)} (${arc.phase})\n  ${currentChapter}`;
    });

    printBox('📚 STORY ARCS', arcLines);
  }
}

async function chat() {
  clear();
  printHeader();

  console.log(c(colors.cyan, '\n💬 CHAT MIT TOOBIX\n'));
  console.log(c(colors.dim, 'Stelle eine Frage oder gib /exit ein zum Beenden\n'));

  const rl = readline.createInterface({ input, output });

  rl.on('line', async (line) => {
    const question = line.trim();

    if (question === '/exit' || question === '/quit') {
      rl.close();
      return;
    }

    if (!question) {
      rl.prompt();
      return;
    }

    console.log(c(colors.dim, '\n⏳ Toobix denkt nach...\n'));

    const response = await askToobix(question);

    if (response.error) {
      console.log(c(colors.red, `\n❌ ${response.error}\n`));
    } else {
      // Answer
      console.log(c(colors.green + colors.bright, '🌍 Toobix antwortet:\n'));
      console.log(c(colors.white, response.answer));
      console.log('');

      // Game Info
      if (response.game) {
        const xp = response.game.xp;
        console.log(c(colors.yellow, `⭐ +${xp.xp_gained} XP`));

        if (xp.leveled_up) {
          console.log(c(colors.green + colors.bright, `🎉 LEVEL UP! Du bist jetzt Level ${xp.level}!`));
        }

        if (response.game.artifact) {
          const art = response.game.artifact;
          console.log(c(colors.magenta, `🏺 Artefakt gefunden: ${art.name} (${art.rarity})`));
        }

        if (response.game.new_achievements && response.game.new_achievements.length > 0) {
          for (const ach of response.game.new_achievements) {
            console.log(c(colors.cyan + colors.bright, `🏆 Achievement: ${ach.name}`));
          }
        }
      }

      // Living World Info
      if (response.livingWorld) {
        const lw = response.livingWorld;
        console.log(c(colors.dim, `\n🌍 Tag ${lw.world.day}, ${lw.world.era} Era`));

        if (lw.perspectiveEvolutions && lw.perspectiveEvolutions.length > 0) {
          for (const pe of lw.perspectiveEvolutions) {
            console.log(c(colors.green, `🌱 ${pe.name} ist jetzt Level ${pe.level}!`));
          }
        }

        if (lw.recentEvents && lw.recentEvents.length > 0) {
          console.log(c(colors.cyan, `\n📖 Neue Events in der Toobix-Gesellschaft:`));
          for (const event of lw.recentEvents.slice(0, 2)) {
            console.log(c(colors.dim, `   • ${event.title}`));
          }
        }
      }

      console.log('');
    }

    rl.prompt();
  });

  rl.setPrompt(c(colors.cyan, 'Du: '));
  rl.prompt();

  rl.on('close', () => {
    showMenu();
  });
}

async function logLifeChange() {
  clear();
  printHeader();

  console.log(c(colors.cyan, '\n📝 ECHTE LEBENSVERÄNDERUNG LOGGEN\n'));

  const rl = readline.createInterface({ input, output });

  let category = '';
  let description = '';
  let before = '';
  let after = '';

  const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(c(colors.yellow, question + ' '), (answer) => {
        resolve(answer.trim());
      });
    });
  };

  category = await askQuestion('Kategorie (health/career/mindset/habits/etc.):');
  description = await askQuestion('Beschreibung:');
  before = await askQuestion('Vorher:');
  after = await askQuestion('Nachher:');

  console.log(c(colors.dim, '\n⏳ Logge Veränderung...\n'));

  const result = await logImpact(category, description, before, after);

  if (result.error) {
    console.log(c(colors.red, `❌ ${result.error}\n`));
  } else {
    console.log(c(colors.green + colors.bright, '✅ Veränderung geloggt!\n'));
    console.log(c(colors.cyan, 'Diese echte Veränderung ist jetzt Teil deiner Toobix-Geschichte.\n'));
  }

  rl.close();

  await new Promise(resolve => setTimeout(resolve, 2000));
  showMenu();
}

// ============================================================================
// MAIN MENU
// ============================================================================

function showMenu() {
  clear();
  printHeader();

  console.log(c(colors.bright, '\n📋 HAUPTMENÜ\n'));
  console.log(c(colors.cyan, '  1') + ' - 💬 Chat mit Toobix (Fragen stellen)');
  console.log(c(colors.cyan, '  2') + ' - 👤 Mein Profil (Stats, Achievements, Quests)');
  console.log(c(colors.cyan, '  3') + ' - 🌍 Die Welt (Perspektiven, Era, Society)');
  console.log(c(colors.cyan, '  4') + ' - 📖 Die Geschichte (Events, Story Arcs)');
  console.log(c(colors.cyan, '  5') + ' - 📝 Lebensveränderung loggen');
  console.log(c(colors.cyan, '  0') + ' - ❌ Beenden');
  console.log('');

  const rl = readline.createInterface({ input, output });

  rl.question(c(colors.yellow, 'Wähle eine Option: '), async (choice) => {
    rl.close();

    switch (choice.trim()) {
      case '1':
        await chat();
        break;
      case '2':
        await displayProfile();
        await waitForKeypress();
        showMenu();
        break;
      case '3':
        await displayWorld();
        await waitForKeypress();
        showMenu();
        break;
      case '4':
        await displayStory();
        await waitForKeypress();
        showMenu();
        break;
      case '5':
        await logLifeChange();
        break;
      case '0':
        clear();
        console.log(c(colors.cyan + colors.bright, '\n🌍 Auf Wiedersehen! Die Reise geht weiter... 💚\n'));
        process.exit(0);
        break;
      default:
        showMenu();
    }
  });
}

function waitForKeypress(): Promise<void> {
  return new Promise((resolve) => {
    console.log(c(colors.dim, '\n\nDrücke Enter um fortzufahren...'));
    const rl = readline.createInterface({ input, output });
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });
}

// ============================================================================
// STARTUP
// ============================================================================

async function start() {
  clear();
  printHeader();

  console.log(c(colors.cyan, '\n🌍 Willkommen in der Toobix-Welt!\n'));

  const rl = readline.createInterface({ input, output });

  rl.question(c(colors.yellow, 'Wie heißt du? '), (name) => {
    playerName = name.trim() || 'Player';
    rl.close();

    console.log(c(colors.green, `\n✨ Hallo ${playerName}! Deine Reise beginnt...\n`));

    setTimeout(() => {
      showMenu();
    }, 1500);
  });
}

// Start the UI
start();
