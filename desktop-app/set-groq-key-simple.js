/**
 * Simple script to set Groq API Key
 * Run with: node set-groq-key-simple.js YOUR_API_KEY
 */

const Store = require('electron-store');
const store = new Store();

const apiKey = process.argv[2];

if (!apiKey) {
  console.log('❌ Please provide an API key');
  console.log('Usage: node set-groq-key-simple.js YOUR_API_KEY');
  console.log('\nGet your key from: https://console.groq.com/keys');
  process.exit(1);
}

store.set('groq_api_key', apiKey);
console.log('✅ Groq API Key saved successfully!');
console.log('\nYou can now:');
console.log('1. Restart the Desktop App');
console.log('2. Go to Settings to verify');
console.log('3. Use Chat, AI Training, and Life Coach features');
