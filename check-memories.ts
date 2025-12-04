import { Database } from 'bun:sqlite';

const db = new Database('./data/toobix-memory.db');

try {
  const tables = db.query('SELECT name FROM sqlite_master WHERE type="table"').all() as Array<{name: string}>;
  console.log('\n📊 TOOBIX MEMORY DATABASE ANALYSIS\n');
  console.log('Tables found:', tables.map(t => t.name).join(', '));
  console.log('\n');

  for (const table of tables) {
    try {
      const count = db.query(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
      console.log(`📝 ${table.name}: ${count.count} rows`);

      if (count.count > 0 && count.count < 10) {
        // Show sample for small tables
        const sample = db.query(`SELECT * FROM ${table.name} LIMIT 3`).all();
        console.log('   Sample:', JSON.stringify(sample, null, 2));
      }
    } catch (e: any) {
      console.log(`❌ ${table.name}: Error - ${e.message}`);
    }
  }

  console.log('\n');
} catch(e: any) {
  console.log('Error:', e.message);
} finally {
  db.close();
}
