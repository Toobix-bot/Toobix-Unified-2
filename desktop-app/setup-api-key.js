#!/usr/bin/env node

/**
 * Quick Setup Script - Set Groq API Key
 * 
 * Dieses Script setzt den Groq API Key in der Electron Store,
 * sodass die Desktop App ihn nutzen kann.
 */

const Store = require('electron-store');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔑 GROQ API KEY SETUP\n');
console.log('Wenn du bereits einen Groq API Key hast:');
console.log('1. Öffne die Desktop App');
console.log('2. Klicke auf "Settings"');
console.log('3. Gib deinen API Key ein\n');
console.log('Oder gib ihn jetzt hier ein:\n');

rl.question('Groq API Key (oder Enter zum Überspringen): ', (apiKey) => {
  if (apiKey && apiKey.trim()) {
    try {
      const store = new Store({ name: 'toobix-unified-config' });
      store.set('groq_api_key', apiKey.trim());
      console.log('\n✅ API Key gespeichert!');
      console.log('Starte die Desktop App neu, um den Key zu nutzen.\n');
    } catch (error) {
      console.error('\n❌ Fehler beim Speichern:', error.message);
      console.log('\nBitte setze den Key manuell in der App unter Settings.\n');
    }
  } else {
    console.log('\n⏭️  Übersprungen. Du kannst den Key später in Settings setzen.\n');
  }
  
  rl.close();
});
