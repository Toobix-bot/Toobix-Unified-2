// Quick test - spawn 1 bot
import mineflayer from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

console.log("Creating bot...");

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'TestBot',
  version: '1.20.1'
});

bot.loadPlugin(pathfinder);

bot.once('spawn', () => {
  console.log("✅ Bot spawned at", bot.entity.position.floored().toString());
  console.log("Health:", bot.health, "Food:", bot.food);
});

bot.on('error', (err) => {
  console.error("Bot error:", err.message);
});

bot.on('kicked', (reason) => {
  console.log("Kicked:", reason);
});

console.log("Waiting for spawn...");
