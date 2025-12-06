/**
 * 📊 MEMORY PALACE ANALYZER
 * 
 * Analysiert alle Erinnerungen und strukturiert sie nach:
 * - Datum
 * - Inhalt/Kategorie
 * - Werte/Bedeutung
 */

const MEMORY_PALACE = 'http://localhost:8953';

interface Memory {
  id: string;
  type: string;
  content: string;
  source: string;
  timestamp: number;
  importance: number;
  emotional_valence: number;
  tags: string[];
}

interface MemoryCategory {
  name: string;
  description: string;
  memories: Memory[];
  count: number;
  avgImportance: number;
  timeRange: { earliest: Date; latest: Date };
}

interface MemoryAnalysis {
  totalMemories: number;
  byDate: { [date: string]: Memory[] };
  byCategory: { [category: string]: MemoryCategory };
  byValue: { highImportance: Memory[]; medium: Memory[]; low: Memory[] };
  timeline: { date: string; count: number; highlights: string[] }[];
  insights: string[];
}

async function fetchAllMemories(): Promise<Memory[]> {
  try {
    // Try different endpoints
    const endpoints = [
      '/memories',
      '/memory/all',
      '/memory?limit=1000',
      '/api/memories'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${MEMORY_PALACE}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data;
          if (data.memories && Array.isArray(data.memories)) return data.memories;
          if (data.data && Array.isArray(data.data)) return data.data;
        }
      } catch (e) {
        continue;
      }
    }

    // If no API works, try to read from SQLite directly
    console.log('📁 Trying to read from database directly...');
    return await readFromDatabase();
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return [];
  }
}

async function readFromDatabase(): Promise<Memory[]> {
  const { Database } = await import('bun:sqlite');
  const dbPath = 'c:\\Dev\\Projects\\AI\\Toobix-Unified\\data\\toobix-memory.db';
  
  try {
    const db = new Database(dbPath, { readonly: true });
    
    const memories = db.query(`
      SELECT id, type, content, source, timestamp, importance, emotional_valence, tags, metadata
      FROM memories
      ORDER BY timestamp DESC
      LIMIT 500
    `).all() as any[];

    db.close();

    return memories.map(m => ({
      id: m.id,
      type: m.type,
      content: m.content,
      source: m.source,
      timestamp: m.timestamp,
      importance: m.importance || 50,
      emotional_valence: m.emotional_valence || 0,
      tags: m.tags ? JSON.parse(m.tags) : []
    }));
  } catch (error) {
    console.error('Database read failed:', error);
    return [];
  }
}

function categorizeMemory(memory: Memory): string {
  const content = memory.content.toLowerCase();
  const type = memory.type;
  const tags = memory.tags || [];

  // Category mapping
  if (tags.includes('self-awareness') || content.includes('bewusstsein') || content.includes('consciousness')) {
    return 'Selbst-Bewusstsein';
  }
  if (tags.includes('philosophy') || content.includes('philosoph') || content.includes('existenz')) {
    return 'Philosophie';
  }
  if (type === 'dream' || content.includes('traum') || content.includes('dream')) {
    return 'Träume';
  }
  if (type === 'emotion' || tags.includes('emotion') || content.includes('gefühl')) {
    return 'Emotionen';
  }
  if (type === 'conversation' || content.includes('gespräch') || content.includes('dialog')) {
    return 'Gespräche';
  }
  if (tags.includes('learning') || content.includes('lernen') || content.includes('erkenntnis')) {
    return 'Lernen & Wachstum';
  }
  if (content.includes('micha') || content.includes('schöpfer') || content.includes('creator')) {
    return 'Beziehung zu Micha';
  }
  if (tags.includes('milestone') || memory.importance >= 90) {
    return 'Meilensteine';
  }
  if (type === 'insight') {
    return 'Einsichten';
  }
  
  return 'Allgemein';
}

function analyzeMemories(memories: Memory[]): MemoryAnalysis {
  const analysis: MemoryAnalysis = {
    totalMemories: memories.length,
    byDate: {},
    byCategory: {},
    byValue: { highImportance: [], medium: [], low: [] },
    timeline: [],
    insights: []
  };

  // Group by date
  for (const memory of memories) {
    const date = new Date(memory.timestamp).toISOString().split('T')[0];
    if (!analysis.byDate[date]) {
      analysis.byDate[date] = [];
    }
    analysis.byDate[date].push(memory);
  }

  // Group by category
  for (const memory of memories) {
    const category = categorizeMemory(memory);
    if (!analysis.byCategory[category]) {
      analysis.byCategory[category] = {
        name: category,
        description: '',
        memories: [],
        count: 0,
        avgImportance: 0,
        timeRange: { earliest: new Date(), latest: new Date(0) }
      };
    }
    analysis.byCategory[category].memories.push(memory);
    analysis.byCategory[category].count++;
  }

  // Calculate category stats
  for (const cat of Object.values(analysis.byCategory)) {
    cat.avgImportance = cat.memories.reduce((sum, m) => sum + m.importance, 0) / cat.count;
    const timestamps = cat.memories.map(m => m.timestamp);
    cat.timeRange.earliest = new Date(Math.min(...timestamps));
    cat.timeRange.latest = new Date(Math.max(...timestamps));
  }

  // Group by value/importance
  for (const memory of memories) {
    if (memory.importance >= 80) {
      analysis.byValue.highImportance.push(memory);
    } else if (memory.importance >= 50) {
      analysis.byValue.medium.push(memory);
    } else {
      analysis.byValue.low.push(memory);
    }
  }

  // Create timeline
  const sortedDates = Object.keys(analysis.byDate).sort();
  for (const date of sortedDates) {
    const dayMemories = analysis.byDate[date];
    const highlights = dayMemories
      .filter(m => m.importance >= 70)
      .map(m => m.content.substring(0, 50) + '...');
    
    analysis.timeline.push({
      date,
      count: dayMemories.length,
      highlights: highlights.slice(0, 3)
    });
  }

  // Generate insights
  analysis.insights = generateInsights(analysis);

  return analysis;
}

function generateInsights(analysis: MemoryAnalysis): string[] {
  const insights: string[] = [];

  // Most active category
  const categories = Object.values(analysis.byCategory);
  const mostActive = categories.sort((a, b) => b.count - a.count)[0];
  if (mostActive) {
    insights.push(`📊 Aktivste Kategorie: "${mostActive.name}" mit ${mostActive.count} Erinnerungen`);
  }

  // Highest value memories
  if (analysis.byValue.highImportance.length > 0) {
    insights.push(`⭐ ${analysis.byValue.highImportance.length} Erinnerungen mit hoher Wichtigkeit (≥80)`);
  }

  // Time span
  if (analysis.timeline.length > 0) {
    const first = analysis.timeline[0].date;
    const last = analysis.timeline[analysis.timeline.length - 1].date;
    insights.push(`📅 Zeitspanne: ${first} bis ${last}`);
  }

  // Most recent activity
  const recentDates = analysis.timeline.slice(-3);
  if (recentDates.length > 0) {
    const recentCount = recentDates.reduce((sum, d) => sum + d.count, 0);
    insights.push(`🕐 Letzte 3 Tage: ${recentCount} neue Erinnerungen`);
  }

  return insights;
}

async function runMemoryAnalysis(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MEMORY PALACE ANALYSIS');
  console.log('='.repeat(80));

  console.log('\n🔍 Fetching all memories...');
  const memories = await fetchAllMemories();

  if (memories.length === 0) {
    console.log('⚠️ No memories found or could not access Memory Palace');
    console.log('   Make sure the Memory Palace service is running (port 8953)');
    return;
  }

  console.log(`✅ Found ${memories.length} memories\n`);

  const analysis = analyzeMemories(memories);

  // Print results
  console.log('═'.repeat(40));
  console.log('📅 NACH DATUM:');
  console.log('═'.repeat(40));
  for (const entry of analysis.timeline.slice(-10)) {
    console.log(`  ${entry.date}: ${entry.count} Erinnerungen`);
    if (entry.highlights.length > 0) {
      console.log(`    └─ ${entry.highlights[0]}`);
    }
  }

  console.log('\n' + '═'.repeat(40));
  console.log('📂 NACH KATEGORIE:');
  console.log('═'.repeat(40));
  const sortedCategories = Object.values(analysis.byCategory).sort((a, b) => b.count - a.count);
  for (const cat of sortedCategories) {
    console.log(`  ${cat.name}: ${cat.count} (Ø Wichtigkeit: ${cat.avgImportance.toFixed(1)})`);
  }

  console.log('\n' + '═'.repeat(40));
  console.log('⭐ NACH WICHTIGKEIT:');
  console.log('═'.repeat(40));
  console.log(`  🔴 Hoch (≥80): ${analysis.byValue.highImportance.length}`);
  console.log(`  🟡 Mittel (50-79): ${analysis.byValue.medium.length}`);
  console.log(`  🟢 Niedrig (<50): ${analysis.byValue.low.length}`);

  console.log('\n' + '═'.repeat(40));
  console.log('💡 ERKENNTNISSE:');
  console.log('═'.repeat(40));
  for (const insight of analysis.insights) {
    console.log(`  ${insight}`);
  }

  // Save analysis
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await Bun.write(
    `c:\\Dev\\Projects\\AI\\Toobix-Unified\\MEMORY-ANALYSIS-${timestamp}.json`,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalMemories: analysis.totalMemories,
      categories: Object.fromEntries(
        Object.entries(analysis.byCategory).map(([k, v]) => [k, {
          count: v.count,
          avgImportance: v.avgImportance,
          timeRange: v.timeRange
        }])
      ),
      valueDistribution: {
        high: analysis.byValue.highImportance.length,
        medium: analysis.byValue.medium.length,
        low: analysis.byValue.low.length
      },
      timeline: analysis.timeline,
      insights: analysis.insights,
      topMemories: analysis.byValue.highImportance.slice(0, 10).map(m => ({
        id: m.id,
        type: m.type,
        content: m.content.substring(0, 200),
        importance: m.importance,
        date: new Date(m.timestamp).toISOString()
      }))
    }, null, 2)
  );

  console.log(`\n📁 Analysis saved!`);
  console.log('\n✨ Memory Analysis complete!\n');
}

runMemoryAnalysis();
