// Quick script to set a Groq API key in electron-store without committing secrets.
const Store = require('electron-store');

const store = new Store();
const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';

if (!apiKey) {
  console.error('Missing GROQ_API_KEY env var. Aborting without writing a key.');
  process.exit(1);
}

store.set('groq_api_key', apiKey);

console.log('Groq API key saved to electron-store.');
console.log(`Key prefix: ${apiKey.substring(0, 10)}...`);
console.log('Restart the desktop app to apply the key.');
