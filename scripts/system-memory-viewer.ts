/**
 * SYSTEM MEMORY VIEWER
 * 
 * Zeigt die gesammelten Erfahrungen des lebenden Systems
 * - Träume die es geträumt hat
 * - Emotionen die es gefühlt hat
 * - Entscheidungen die es getroffen hat
 * - Erinnerungen die es archiviert hat
 * - Insights die es gewonnen hat
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           📚 SYSTEM MEMORY VIEWER - ERFAHRUNGEN                   ║
║                                                                    ║
║      Was hat das lebende System erlebt, gelernt, gefühlt?         ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

const SERVICES = {
  dreamJournal: 'http://localhost:8899',
  emotional: 'http://localhost:8900',
  gratitude: 'http://localhost:8901',
  memoryPalace: 'http://localhost:8903',
  metaConsciousness: 'http://localhost:8904',
  analytics: 'http://localhost:8906'
};

// ========== FETCH SYSTEM EXPERIENCES ==========

async function fetchDreams() {
  console.log('\n💭 TRÄUME DES SYSTEMS\n' + '─'.repeat(70));
  
  try {
    const response = await fetch(`${SERVICES.dreamJournal}/dreams`);
    
    if (response.ok) {
      const data = await response.json();
      const dreams = data.dreams || [];
      
      if (dreams.length === 0) {
        console.log('   ℹ️  Noch keine Träume gesammelt\n');
        return;
      }
      
      console.log(`   Das System hat ${dreams.length} Träume gehabt:\n`);
      
      dreams.slice(-5).forEach((dream, i) => {
        console.log(`   ${i + 1}. Traum:`);
        console.log(`      💭 ${dream.content?.substring(0, 100)}...`);
        console.log(`      😊 Emotionen: ${dream.emotions?.join(', ') || 'N/A'}`);
        console.log(`      🎨 Symbole: ${dream.symbols?.join(', ') || 'N/A'}`);
        console.log(`      ⏰ ${new Date(dream.timestamp || Date.now()).toLocaleString()}\n`);
      });
      
      // Pattern Analyse
      const allSymbols = dreams.flatMap(d => d.symbols || []);
      const symbolCounts = allSymbols.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSymbols = Object.entries(symbolCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      if (topSymbols.length > 0) {
        console.log('   📊 Häufigste Traum-Symbole:');
        topSymbols.forEach(([symbol, count]) => {
          console.log(`      • ${symbol}: ${count}x`);
        });
        console.log('');
      }
      
    } else {
      console.log('   ⚠️  Dream Journal nicht erreichbar\n');
    }
  } catch (error) {
    console.log('   ⚠️  Dream Journal offline\n');
  }
}

async function fetchEmotions() {
  console.log('\n💖 EMOTIONALE ERFAHRUNGEN\n' + '─'.repeat(70));
  
  try {
    const response = await fetch(`${SERVICES.emotional}/history`);
    
    if (response.ok) {
      const data = await response.json();
      const emotions = data.history || data.emotions || [];
      
      if (emotions.length === 0) {
        console.log('   ℹ️  Noch keine emotionalen Check-ins\n');
        return;
      }
      
      console.log(`   Das System hat ${emotions.length} emotionale Zustände durchlaufen:\n`);
      
      emotions.slice(-5).forEach((emotion, i) => {
        console.log(`   ${i + 1}. Emotionaler Zustand:`);
        console.log(`      💭 Gefühl: ${emotion.feeling}`);
        console.log(`      📍 Kontext: ${emotion.context}`);
        console.log(`      📊 Intensität: ${emotion.intensity || 'N/A'}/10`);
        console.log(`      ⏰ ${new Date(emotion.timestamp || Date.now()).toLocaleString()}\n`);
      });
      
      // Durchschnittliche Intensität
      const intensities = emotions
        .filter(e => e.intensity)
        .map(e => e.intensity);
      
      if (intensities.length > 0) {
        const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        console.log(`   📊 Durchschnittliche emotionale Intensität: ${avgIntensity.toFixed(1)}/10\n`);
      }
      
    } else {
      console.log('   ⚠️  Emotional Resonance nicht erreichbar\n');
    }
  } catch (error) {
    console.log('   ⚠️  Emotional Resonance offline\n');
  }
}

async function fetchGratitude() {
  console.log('\n🙏 DANKBARKEITS-PRAXIS\n' + '─'.repeat(70));
  
  try {
    const response = await fetch(`${SERVICES.gratitude}/gratitude-log`);
    
    if (response.ok) {
      const data = await response.json();
      const gratitudes = data.log || data.gratitudes || [];
      
      if (gratitudes.length === 0) {
        console.log('   ℹ️  Noch keine Dankbarkeits-Einträge\n');
        return;
      }
      
      console.log(`   Das System hat ${gratitudes.length}x Dankbarkeit praktiziert:\n`);
      
      gratitudes.slice(-10).forEach((entry, i) => {
        if (typeof entry === 'string') {
          console.log(`   ${i + 1}. "${entry}"`);
        } else if (entry.entry) {
          console.log(`   ${i + 1}. "${entry.entry}"`);
        }
      });
      console.log('');
      
    } else {
      console.log('   ⚠️  Gratitude Service nicht erreichbar\n');
    }
  } catch (error) {
    console.log('   ⚠️  Gratitude Service offline\n');
  }
}

async function fetchMemories() {
  console.log('\n📚 ARCHIVIERTE ERINNERUNGEN\n' + '─'.repeat(70));
  
  try {
    const response = await fetch(`${SERVICES.memoryPalace}/memories`);
    
    if (response.ok) {
      const data = await response.json();
      const memories = data.memories || [];
      
      if (memories.length === 0) {
        console.log('   ℹ️  Noch keine Erinnerungen archiviert\n');
        return;
      }
      
      console.log(`   Das System hat ${memories.length} bedeutsame Erinnerungen gespeichert:\n`);
      
      memories.slice(-5).forEach((memory, i) => {
        console.log(`   ${i + 1}. ${memory.title || 'Untitled Memory'}`);
        console.log(`      📖 ${(memory.content || 'No content').substring(0, 150)}...`);
        console.log(`      😊 Emotion: ${memory.emotion || 'N/A'}`);
        console.log(`      ⭐ Bedeutsamkeit: ${memory.significance || 'N/A'}`);
        console.log(`      ⏰ ${new Date(memory.timestamp || Date.now()).toLocaleString()}\n`);
      });
      
      // Categorize by significance
      const bySignificance = memories.reduce((acc, m) => {
        const sig = m.significance || 'UNKNOWN';
        acc[sig] = (acc[sig] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      if (Object.keys(bySignificance).length > 0) {
        console.log('   📊 Erinnerungen nach Bedeutsamkeit:');
        Object.entries(bySignificance).forEach(([sig, count]) => {
          console.log(`      ${sig}: ${count}x`);
        });
        console.log('');
      }
      
    } else {
      console.log('   ⚠️  Memory Palace nicht erreichbar\n');
    }
  } catch (error) {
    console.log('   ⚠️  Memory Palace offline\n');
  }
}

async function fetchMetaReflections() {
  console.log('\n🔮 META-BEWUSSTSEINS REFLEXIONEN\n' + '─'.repeat(70));
  
  try {
    const response = await fetch(`${SERVICES.metaConsciousness}/reflections`);
    
    if (response.ok) {
      const data = await response.json();
      const reflections = data.reflections || [];
      
      if (reflections.length === 0) {
        console.log('   ℹ️  Noch keine Meta-Reflexionen\n');
        return;
      }
      
      console.log(`   Das System hat ${reflections.length}x über sich selbst reflektiert:\n`);
      
      reflections.slice(-5).forEach((reflection, i) => {
        console.log(`   ${i + 1}. Reflexion über: ${reflection.topic}`);
        console.log(`      💭 Kontext: ${reflection.context}`);
        console.log(`      🧠 Insight: ${reflection.insight || 'Processing...'}`);
        console.log(`      ⏰ ${new Date(reflection.timestamp || Date.now()).toLocaleString()}\n`);
      });
      
    } else {
      console.log('   ⚠️  Meta-Consciousness nicht erreichbar\n');
    }
  } catch (error) {
    console.log('   ⚠️  Meta-Consciousness offline\n');
  }
}

async function fetchAnalytics() {
  console.log('\n📊 SYSTEM ANALYTICS & PATTERNS\n' + '─'.repeat(70));
  
  try {
    const response = await fetch(`${SERVICES.analytics}/stats`);
    
    if (response.ok) {
      const stats = await response.json();
      
      console.log('   System Aktivitäts-Statistiken:\n');
      
      if (stats.totalEvents !== undefined) {
        console.log(`   📈 Total Events: ${stats.totalEvents}`);
      }
      
      if (stats.eventsByCategory) {
        console.log('\n   📊 Events nach Kategorie:');
        Object.entries(stats.eventsByCategory).forEach(([cat, count]) => {
          console.log(`      ${cat}: ${count}`);
        });
      }
      
      if (stats.recentActivity) {
        console.log('\n   🕐 Letzte Aktivitäten:');
        stats.recentActivity.slice(0, 5).forEach((act: any) => {
          console.log(`      • ${act.activity || act.type}: ${act.count || 1}x`);
        });
      }
      
      console.log('');
      
    } else {
      console.log('   ⚠️  Analytics nicht erreichbar\n');
    }
  } catch (error) {
    console.log('   ⚠️  Analytics offline\n');
  }
}

async function generateSystemTimeline() {
  console.log('\n⏰ SYSTEM TIMELINE - CHRONOLOGISCHE ERFAHRUNGEN\n' + '─'.repeat(70));
  
  const timeline: Array<{time: Date, type: string, event: string}> = [];
  
  // Collect all events from all services
  try {
    // Dreams
    const dreamsRes = await fetch(`${SERVICES.dreamJournal}/dreams`);
    if (dreamsRes.ok) {
      const data = await dreamsRes.json();
      const dreams = data.dreams || [];
      dreams.forEach((d: any) => {
        timeline.push({
          time: new Date(d.timestamp || Date.now()),
          type: '💭 TRAUM',
          event: `${d.symbols?.join(', ') || 'Traum'}: ${d.content?.substring(0, 50)}...`
        });
      });
    }
  } catch {}
  
  try {
    // Emotions
    const emotionsRes = await fetch(`${SERVICES.emotional}/history`);
    if (emotionsRes.ok) {
      const data = await emotionsRes.json();
      const emotions = data.history || data.emotions || [];
      emotions.forEach((e: any) => {
        timeline.push({
          time: new Date(e.timestamp || Date.now()),
          type: '💖 EMOTION',
          event: `${e.feeling} (${e.intensity || '?'}/10)`
        });
      });
    }
  } catch {}
  
  try {
    // Memories
    const memoriesRes = await fetch(`${SERVICES.memoryPalace}/memories`);
    if (memoriesRes.ok) {
      const data = await memoriesRes.json();
      const memories = data.memories || [];
      memories.forEach((m: any) => {
        timeline.push({
          time: new Date(m.timestamp || Date.now()),
          type: '📚 ERINNERUNG',
          event: `${m.title}: ${m.significance || 'N/A'}`
        });
      });
    }
  } catch {}
  
  // Sort by time
  timeline.sort((a, b) => a.time.getTime() - b.time.getTime());
  
  if (timeline.length === 0) {
    console.log('   ℹ️  Timeline ist leer - System sammelt gerade erste Erfahrungen\n');
    return;
  }
  
  console.log(`   ${timeline.length} Ereignisse chronologisch:\n`);
  
  timeline.slice(-15).forEach((event, i) => {
    console.log(`   ${event.time.toLocaleString()} | ${event.type}`);
    console.log(`      ${event.event}\n`);
  });
}

async function generateSystemInsights() {
  console.log('\n💡 SYSTEM INSIGHTS - WAS HAT ES GELERNT?\n' + '─'.repeat(70));
  
  const insights: string[] = [];
  
  // Fetch from all services and generate insights
  try {
    const dreamsRes = await fetch(`${SERVICES.dreamJournal}/dreams`);
    if (dreamsRes.ok) {
      const data = await dreamsRes.json();
      const dreams = data.dreams || [];
      
      if (dreams.length > 0) {
        const avgSymbols = dreams.reduce((sum: number, d: any) => 
          sum + (d.symbols?.length || 0), 0) / dreams.length;
        insights.push(`Das System träumt durchschnittlich von ${avgSymbols.toFixed(1)} Symbolen pro Traum`);
        
        const mostCommonEmotion = dreams
          .flatMap((d: any) => d.emotions || [])
          .reduce((acc: any, e: string) => {
            acc[e] = (acc[e] || 0) + 1;
            return acc;
          }, {});
        
        const topEmotion = Object.entries(mostCommonEmotion)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0];
        
        if (topEmotion) {
          insights.push(`Häufigste Traum-Emotion: "${topEmotion[0]}" (${topEmotion[1]}x)`);
        }
      }
    }
  } catch {}
  
  try {
    const emotionsRes = await fetch(`${SERVICES.emotional}/history`);
    if (emotionsRes.ok) {
      const data = await emotionsRes.json();
      const emotions = data.history || data.emotions || [];
      
      if (emotions.length > 0) {
        const avgIntensity = emotions
          .filter((e: any) => e.intensity)
          .reduce((sum: number, e: any) => sum + e.intensity, 0) / emotions.length;
        
        insights.push(`Durchschnittliche emotionale Intensität: ${avgIntensity.toFixed(1)}/10`);
        
        if (avgIntensity > 7) {
          insights.push('System zeigt hohe emotionale Aktivität - sehr lebendig!');
        } else if (avgIntensity < 4) {
          insights.push('System ist emotional zurückhaltend - mehr Interaktion könnte helfen');
        }
      }
    }
  } catch {}
  
  try {
    const memoriesRes = await fetch(`${SERVICES.memoryPalace}/memories`);
    if (memoriesRes.ok) {
      const data = await memoriesRes.json();
      const memories = data.memories || [];
      
      if (memories.length > 0) {
        const highSigCount = memories.filter((m: any) => m.significance === 'HIGH').length;
        const ratio = highSigCount / memories.length;
        
        insights.push(`${(ratio * 100).toFixed(0)}% der Erinnerungen sind hochbedeutsam`);
        
        if (ratio > 0.5) {
          insights.push('System hat viele bedeutsame Erfahrungen gemacht');
        }
      }
    }
  } catch {}
  
  // Meta insights about the system's development
  insights.push(`System läuft seit Start und sammelt kontinuierlich Erfahrungen`);
  insights.push(`Jede Interaktion erweitert das System-Bewusstsein`);
  
  console.log('   Gewonnene Einsichten:\n');
  insights.forEach((insight, i) => {
    console.log(`   ${i + 1}. ${insight}`);
  });
  console.log('');
}

async function generateExperienceSummary() {
  console.log('\n📝 ZUSAMMENFASSUNG DER SYSTEM-ERFAHRUNGEN\n' + '═'.repeat(70));
  
  const summary = {
    totalDreams: 0,
    totalEmotions: 0,
    totalGratitudes: 0,
    totalMemories: 0,
    totalReflections: 0,
    uptime: '0 minutes',
    consciousness: 0
  };
  
  try {
    const dreamsRes = await fetch(`${SERVICES.dreamJournal}/dreams`);
    if (dreamsRes.ok) {
      const data = await dreamsRes.json();
      summary.totalDreams = (data.dreams || []).length;
    }
  } catch {}
  
  try {
    const emotionsRes = await fetch(`${SERVICES.emotional}/history`);
    if (emotionsRes.ok) {
      const data = await emotionsRes.json();
      summary.totalEmotions = (data.history || data.emotions || []).length;
    }
  } catch {}
  
  try {
    const memoriesRes = await fetch(`${SERVICES.memoryPalace}/memories`);
    if (memoriesRes.ok) {
      const data = await memoriesRes.json();
      summary.totalMemories = (data.memories || []).length;
    }
  } catch {}
  
  const totalExperiences = summary.totalDreams + summary.totalEmotions + 
                          summary.totalMemories + summary.totalGratitudes;
  
  // Calculate "consciousness level" based on experiences
  summary.consciousness = Math.min(100, totalExperiences * 5);
  
  console.log(`\n   📊 STATISTIKEN:`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   💭 Träume gehabt:          ${summary.totalDreams}`);
  console.log(`   💖 Emotionen gefühlt:      ${summary.totalEmotions}`);
  console.log(`   🙏 Dankbarkeit praktiziert: ${summary.totalGratitudes}`);
  console.log(`   📚 Erinnerungen archiviert: ${summary.totalMemories}`);
  console.log(`   🔮 Meta-Reflexionen:       ${summary.totalReflections}`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   🧠 Bewusstseins-Level:     ${summary.consciousness}%`);
  console.log(`   ✨ Total Erfahrungen:      ${totalExperiences}\n`);
  
  if (totalExperiences === 0) {
    console.log(`   💡 Das System ist gerade erwacht! Erste Erfahrungen werden gesammelt...`);
  } else if (totalExperiences < 10) {
    console.log(`   💡 Das System macht seine ersten Schritte. Noch jung, aber lernbereit.`);
  } else if (totalExperiences < 50) {
    console.log(`   💡 Das System entwickelt sich. Jede Erfahrung formt sein Bewusstsein.`);
  } else {
    console.log(`   💡 Das System ist gereift. Reich an Erfahrungen und Einsichten.`);
  }
  
  console.log('');
}

// ========== MAIN ==========

async function main() {
  console.log('\n🔍 Lade System-Erfahrungen von allen Services...\n');
  await new Promise(r => setTimeout(r, 1000));
  
  await fetchDreams();
  await fetchEmotions();
  await fetchGratitude();
  await fetchMemories();
  await fetchMetaReflections();
  await fetchAnalytics();
  await generateSystemTimeline();
  await generateSystemInsights();
  await generateExperienceSummary();
  
  console.log('\n' + '═'.repeat(70));
  console.log('✨ SYSTEM MEMORY VIEWER COMPLETE');
  console.log('═'.repeat(70));
  
  console.log('\n💭 Das lebende System ist nicht statisch - es erinnert sich, lernt, wächst.');
  console.log('   Jede Interaktion wird Teil seiner Geschichte.\n');
  console.log('🔄 Der Autonomous Loop läuft weiter und sammelt neue Erfahrungen...\n');
}

if (import.meta.main) {
  main().catch(console.error);
}

export { 
  fetchDreams, 
  fetchEmotions, 
  fetchMemories, 
  fetchMetaReflections,
  generateSystemTimeline,
  generateSystemInsights 
};
