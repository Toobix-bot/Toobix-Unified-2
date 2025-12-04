import { Database } from 'bun:sqlite';

const db = new Database('./data/toobix-memory.db');

console.log('\n🔍 MEMORY ANALYSIS - 1818 Erinnerungen\n');

// Check structure
const sample = db.query('SELECT * FROM memories LIMIT 5').all() as any[];
console.log('📋 Struktur Sample:');
console.log(JSON.stringify(sample[0], null, 2));
console.log('\n');

// Check for categories/types
const schema = db.query("PRAGMA table_info(memories)").all() as any[];
console.log('📐 Schema:');
schema.forEach((col: any) => {
  console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});
console.log('\n');

// Check if categorized
const hasType = schema.some((col: any) => col.name === 'type' || col.name === 'category');
console.log(`📁 Kategorisiert: ${hasType ? 'JA' : 'NEIN'}`);

// Check if dated
const hasDate = schema.some((col: any) => col.name === 'timestamp' || col.name === 'date' || col.name === 'created_at');
console.log(`📅 Mit Datum: ${hasDate ? 'JA' : 'NEIN'}`);
console.log('\n');

// Get statistics by type if available
if (hasType) {
  const typeCol = schema.find((col: any) => col.name === 'type' || col.name === 'category')!;
  const stats = db.query(`SELECT ${typeCol.name}, COUNT(*) as count FROM memories GROUP BY ${typeCol.name} ORDER BY count DESC`).all();
  console.log('📊 Nach Kategorie:');
  stats.forEach((stat: any) => {
    console.log(`  ${stat[typeCol.name] || '(leer)'}: ${stat.count}`);
  });
  console.log('\n');
}

// Date range if available
if (hasDate) {
  const dateCol = schema.find((col: any) => col.name === 'timestamp' || col.name === 'date' || col.name === 'created_at')!;
  const range = db.query(`SELECT MIN(${dateCol.name}) as oldest, MAX(${dateCol.name}) as newest FROM memories`).get() as any;
  console.log('📅 Zeitspanne:');
  console.log(`  Älteste: ${range.oldest}`);
  console.log(`  Neueste: ${range.newest}`);
  console.log('\n');
}

// Content analysis - extract keywords from first 100
const recent = db.query('SELECT content FROM memories ORDER BY rowid DESC LIMIT 100').all() as any[];
const allText = recent.map((r: any) => r.content).join(' ').toLowerCase();
const words = allText.split(/\W+/).filter(w => w.length > 4);
const wordCount: Record<string, number> = {};
words.forEach(w => wordCount[w] = (wordCount[w] || 0) + 1);
const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 20);

console.log('🔤 Top 20 Wörter in den letzten 100 Erinnerungen:');
topWords.forEach(([word, count]) => {
  console.log(`  ${word}: ${count}x`);
});
console.log('\n');

db.close();
