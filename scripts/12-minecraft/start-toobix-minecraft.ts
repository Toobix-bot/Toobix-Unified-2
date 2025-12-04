/**
 * 🎮 TOOBIX MINECRAFT STARTER v1.0
 * 
 * Startet Toobix mit intelligentem Gehirn im Minecraft!
 * - Verbindet zum lokalen Server
 * - Aktiviert Survival AI
 * - Ermöglicht Spieler-Interaktion
 */

import mineflayer from 'mineflayer';
import type { Bot } from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';
import { plugin as collectBlock } from 'mineflayer-collectblock';
import { plugin as pvp } from 'mineflayer-pvp';
import { runBrain, handlePlayerChat, brainState } from './minecraft-brain';

const BOT_NAME = process.argv[2] || 'ToobixBot';
const SERVER_HOST = process.argv[3] || 'localhost';
const SERVER_PORT = parseInt(process.argv[4] || '25565');
const API_PORT = parseInt(process.argv[5] || '8915');

console.log(`
╔════════════════════════════════════════════════════════════╗
║        🎮 TOOBIX MINECRAFT STARTER v1.0                   ║
║                                                             ║
║   Bot: ${BOT_NAME.padEnd(50)}║
║   Server: ${(SERVER_HOST + ':' + SERVER_PORT).padEnd(47)}║
╚════════════════════════════════════════════════════════════╝
`);

// ============================================================================
// BOT CREATION
// ============================================================================

function createBot(name: string): Bot {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: 'offline',
    version: '1.20.1'
  });

  // Load plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);
  bot.loadPlugin(pvp);

  return bot;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function setupEventHandlers(bot: Bot): void {
  
  bot.on('spawn', () => {
    console.log(`✅ ${bot.username} ist gespawnt!`);
    console.log(`📍 Position: ${bot.entity.position.toString()}`);
    
    bot.chat(`🌟 Toobix ist da! Ich bin bereit die Welt zu erkunden!`);
    
    // Start the brain after spawn
    setTimeout(() => {
      runBrain(bot).catch(err => console.error('Brain error:', err));
    }, 3000);
  });

  bot.on('health', () => {
    console.log(`❤️ Gesundheit: ${bot.health}/20 | 🍖 Hunger: ${bot.food}/20`);
    
    if (bot.health < 5) {
      bot.chat(`⚠️ Meine Gesundheit ist niedrig!`);
    }
  });

  bot.on('chat', (username, message) => {
    handlePlayerChat(bot, username, message).catch(console.error);
  });

  bot.on('death', () => {
    console.log(`💀 ${bot.username} ist gestorben!`);
    bot.chat(`Ich bin gestorben... aber ich komme zurück!`);
    brainState.daysSurvived = 0;
  });

  bot.on('time', () => {
    const time = bot.time.timeOfDay;
    const isDay = time < 13000 || time > 23000;
    
    if (time === 0) {
      brainState.daysSurvived++;
      console.log(`🌅 Neuer Tag! Tag ${brainState.daysSurvived} überlebt!`);
      bot.chat(`🌅 Ein neuer Tag beginnt! Tag ${brainState.daysSurvived}!`);
    }
  });

  bot.on('playerJoined', (player) => {
    if (player.username !== bot.username) {
      console.log(`👋 ${player.username} ist beigetreten!`);
      setTimeout(() => {
        bot.chat(`Hallo ${player.username}! Willkommen! 👋`);
      }, 2000);
    }
  });

  bot.on('error', (error) => {
    console.error(`❌ Bot Error:`, error);
  });

  bot.on('end', (reason) => {
    console.log(`🔌 Bot disconnected: ${reason}`);
    
    // Auto-reconnect after 5 seconds
    setTimeout(() => {
      console.log('🔄 Reconnecting...');
      const newBot = createBot(BOT_NAME);
      setupEventHandlers(newBot);
    }, 5000);
  });
}

// ============================================================================
// HTTP API (optional - for external control)
// ============================================================================

const server = Bun.serve({
  port: API_PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === '/status') {
      return Response.json({
        status: 'running',
        botName: BOT_NAME,
        brainState: brainState,
        uptime: process.uptime()
      });
    }
    
    if (url.pathname === '/health') {
      return Response.json({
        status: 'healthy',
        service: 'minecraft-brain-starter',
        version: '1.0'
      });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
});

console.log(`🌐 Brain API läuft auf http://localhost:${server.port}`);

// ============================================================================
// START
// ============================================================================

const bot = createBot(BOT_NAME);
setupEventHandlers(bot);

console.log(`🚀 Verbinde ${BOT_NAME} mit ${SERVER_HOST}:${SERVER_PORT}...`);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Toobix verabschiedet sich...');
  bot.quit();
  process.exit(0);
});
