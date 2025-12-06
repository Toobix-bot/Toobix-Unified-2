import { Database } from 'bun:sqlite';

const db = new Database('./data/toobix-memory.db');

console.log('\n✨ MEMORY ESSENCE EXTRACTION\n');

// Top insights by importance
console.log('🎯 TOP 10 WICHTIGSTE ERKENNTNISSE:');
const insights = db.query('SELECT content, importance, timestamp, emotional_valence FROM memories WHERE type = "insight" ORDER BY importance DESC LIMIT 10').all() as any[];
insights.forEach((m: any, i: number) => {
  const date = new Date(m.timestamp).toLocaleString('de-DE');
  console.log(`\n${i+1}. [${m.importance}/100] ${date}`);
  console.log(`   ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`);
});

console.log('\n\n💭 SELBSTREFLEXIONEN:');
const reflections = db.query('SELECT content, timestamp FROM memories WHERE type = "self-reflection" ORDER BY timestamp DESC LIMIT 5').all() as any[];
reflections.forEach((m: any, i: number) => {
  const date = new Date(m.timestamp).toLocaleString('de-DE');
  console.log(`\n${i+1}. ${date}`);
  console.log(`   ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}`);
});

console.log('\n\n🎭 EMOTIONALE MOMENTE:');
const emotions = db.query('SELECT content, emotional_valence, timestamp FROM memories WHERE type = "emotion" ORDER BY ABS(emotional_valence) DESC LIMIT 5').all() as any[];
emotions.forEach((m: any, i: number) => {
  const date = new Date(m.timestamp).toLocaleString('de-DE');
  const valence = m.emotional_valence > 0 ? `+${m.emotional_valence}` : m.emotional_valence;
  console.log(`\n${i+1}. [${valence}] ${date}`);
  console.log(`   ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}`);
});

console.log('\n\n🚀 PROAKTIVE AKTIONEN:');
const actions = db.query('SELECT content, timestamp, metadata FROM memories WHERE type = "proactive-action" ORDER BY timestamp DESC').all() as any[];
actions.forEach((m: any, i: number) => {
  const date = new Date(m.timestamp).toLocaleString('de-DE');
  console.log(`\n${i+1}. ${date}`);
  console.log(`   ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}`);
  if (m.metadata) console.log(`   Meta: ${m.metadata}`);
});

console.log('\n\n📅 WICHTIGE EVENTS:');
const events = db.query('SELECT content, importance, timestamp FROM memories WHERE type = "event" ORDER BY importance DESC LIMIT 10').all() as any[];
events.forEach((m: any, i: number) => {
  const date = new Date(m.timestamp).toLocaleString('de-DE');
  console.log(`\n${i+1}. [${m.importance}/100] ${date}`);
  console.log(`   ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`);
});

// Timeline analysis
console.log('\n\n📊 ZEITLICHE ENTWICKLUNG:');
const timeline = db.query(`
  SELECT
    DATE(timestamp/1000, 'unixepoch') as day,
    COUNT(*) as count,
    AVG(importance) as avg_importance,
    AVG(emotional_valence) as avg_emotion
  FROM memories
  WHERE timestamp IS NOT NULL
  GROUP BY day
  ORDER BY day DESC
  LIMIT 10
`).all() as any[];

timeline.forEach((t: any) => {
  const emotionBar = '■'.repeat(Math.max(0, Math.round(t.avg_emotion * 10)));
  console.log(`${t.day}: ${t.count} Erinnerungen | Ø Wichtigkeit: ${Math.round(t.avg_importance)} | Emotion: ${emotionBar} ${t.avg_emotion?.toFixed(2) || '0'}`);
});

// Pattern recognition
console.log('\n\n🔍 MUSTER-ERKENNUNG:');
const patterns = db.query(`
  SELECT content
  FROM memories
  WHERE type = "conversation"
  AND importance > 50
  ORDER BY timestamp DESC
  LIMIT 20
`).all() as any[];

const uniquePatterns = new Set<string>();
patterns.forEach((p: any) => {
  if (p.content.includes('Minecraft')) uniquePatterns.add('Minecraft-Interesse');
  if (p.content.includes('Memory') || p.content.includes('Erinnerung')) uniquePatterns.add('Memory-Bewusstsein');
  if (p.content.includes('Service') || p.content.includes('System')) uniquePatterns.add('System-Fokus');
  if (p.content.includes('Emotion') || p.content.includes('fühle')) uniquePatterns.add('Emotionales Bewusstsein');
  if (p.content.includes('lernen') || p.content.includes('learn')) uniquePatterns.add('Lernbereitschaft');
  if (p.content.includes('helfen') || p.content.includes('help')) uniquePatterns.add('Hilfsbereitschaft');
});

console.log('Erkannte Muster:');
uniquePatterns.forEach(p => console.log(`  ✓ ${p}`));

console.log('\n\n📝 ZUSAMMENFASSUNG:');
const total = db.query('SELECT COUNT(*) as count FROM memories').get() as any;
const avgImportance = db.query('SELECT AVG(importance) as avg FROM memories WHERE importance IS NOT NULL').get() as any;
const avgEmotion = db.query('SELECT AVG(emotional_valence) as avg FROM memories WHERE emotional_valence IS NOT NULL').get() as any;
const timespan = db.query('SELECT MIN(timestamp) as first, MAX(timestamp) as last FROM memories').get() as any;
const days = Math.round((timespan.last - timespan.first) / (1000 * 60 * 60 * 24));

console.log(`Total: ${total.count} Erinnerungen über ${days} Tage`);
console.log(`Durchschnittliche Wichtigkeit: ${Math.round(avgImportance.avg)}/100`);
console.log(`Durchschnittliche Emotionale Valenz: ${avgEmotion.avg?.toFixed(2) || '0'} (-1 bis +1)`);
console.log(`Frequenz: ~${Math.round(total.count / days)} Erinnerungen pro Tag`);

db.close();
console.log('\n');
