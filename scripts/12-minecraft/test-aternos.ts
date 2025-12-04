/**
 * 🧪 SINGLE BOT TEST - ATERNOS
 */

import mineflayer from 'mineflayer';

const SERVER_HOST = 'Tooobix.aternos.me';
const SERVER_PORT = 52629;

console.log(`
🧪 SINGLE BOT TEST
Server: ${SERVER_HOST}:${SERVER_PORT}
`);

const bot = mineflayer.createBot({
  host: SERVER_HOST,
  port: SERVER_PORT,
  username: 'Toobix_Test',
  version: '1.20.1',
  auth: 'offline'
});

bot.on('login', () => {
  console.log('✅ LOGIN erfolgreich!');
});

bot.on('spawn', () => {
  console.log('✅ SPAWN erfolgreich!');
  console.log(`Position: ${bot.entity.position}`);
});

bot.on('error', (err) => {
  console.log('❌ ERROR:', err.message);
});

bot.on('kicked', (reason) => {
  console.log('👢 KICKED:', reason);
});

bot.on('end', (reason) => {
  console.log('🔌 DISCONNECTED:', reason);
});

bot.on('message', (msg) => {
  console.log('💬 Chat:', msg.toString());
});
