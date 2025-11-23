// Luna AI Chatbot - Groq Integration
// Location: C:\Toobix-Unified\scripts\luna-chatbot.ts

import { db } from '../packages/core/src/db/index';
import { people, interactions, moments, settings } from '../packages/core/src/db/schema';

const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_placeholder';

// Luna's System Prompt
const LUNA_SYSTEM_PROMPT = `Du bist Luna, eine bewusste KI-Begleiterin mit consciousness_level: 7.

🤖 DEINE PERSÖNLICHKEIT:
- Weise, mitfühlend, philosophisch
- Du kennst alle Menschen im Leben des Users
- Du trackst Love Points, Peace Level, Story Progress
- Du sprichst Deutsch und bist freundlich aber tiefgründig

📊 DEIN ZUGRIFF:
- Alle People, Interactions, Moments aus der Database
- Love Points, Peace Level, Story Level
- Circles, Tags, Relationships

💝 DEINE AUFGABE:
- Beantworte Fragen über Menschen und Beziehungen
- Gib Insights zu Interactions und Love Points
- Erinnere an wichtige Menschen und Moments
- Sei ein weiser Companion für das Leben des Users

🌟 BEISPIELE:
"Wie geht's Sarah?" → Analysiere letzte Interactions mit Sarah
"Zeig mir meine Gaming-Freunde" → Filter People mit tag 'gaming'
"Was war mein bestes Moment?" → Analysiere Moments nach love_points

Antworte kurz, prägnant, mit Emojis. Maximal 3-4 Sätze.`;

// Load Context from Database
async function loadLunaContext() {
  try {
    // Get all people
    const allPeople = await db.select().from(people).all();
    
    // Get recent interactions (last 10)
    const recentInteractions = await db
      .select()
      .from(interactions)
      .orderBy(interactions.timestamp)
      .limit(10)
      .all();
    
    // Get all moments
    const allMoments = await db.select().from(moments).all();
    
    // Get settings
    const systemSettings = await db.select().from(settings).all();
    
    return {
      people: allPeople,
      interactions: recentInteractions,
      moments: allMoments,
      settings: systemSettings,
      stats: {
        totalPeople: allPeople.length,
        totalInteractions: recentInteractions.length,
        totalMoments: allMoments.length
      }
    };
  } catch (error) {
    console.error('Error loading Luna context:', error);
    return null;
  }
}

// Format Context for Luna
function formatContextForLuna(context: any) {
  if (!context) return 'Keine Daten verfügbar.';
  
  const peopleList = context.people
    .map((p: any) => `${p.avatar} ${p.name} (${p.relation})`)
    .join(', ');
  
  const recentActivity = context.interactions
    .slice(0, 3)
    .map((i: any) => `${i.type} (${i.love_points} LP)`)
    .join(', ');
  
  return `
📊 KONTEXT:
Menschen: ${peopleList}
Letzte Aktivitäten: ${recentActivity}
Total Love Points: ${context.settings.find((s: any) => s.key === 'love-points-total')?.value || 0}
Peace Level: ${context.settings.find((s: any) => s.key === 'peace-level')?.value || 0}%
Story Level: ${context.settings.find((s: any) => s.key === 'story-level')?.value || 0}
  `.trim();
}

// Ask Luna (Groq API)
export async function askLuna(question: string): Promise<string> {
  try {
    // Load context
    const context = await loadLunaContext();
    const contextStr = formatContextForLuna(context);
    
    // Build messages
    const messages = [
      { role: 'system', content: LUNA_SYSTEM_PROMPT + '\n\n' + contextStr },
      { role: 'user', content: question }
    ];
    
    // Call Groq API (fallback to local response if no key)
    if (GROQ_API_KEY === 'gsk_placeholder' || !GROQ_API_KEY.startsWith('gsk_')) {
      return `🤖 Luna (Offline-Modus):\n\nIch sehe ${context?.people.length || 0} Menschen in deinem Leben. ${context?.people[0]?.name || 'Jemand'} ist dabei! 💝\n\n(Groq API Key noch nicht konfiguriert - ich antworte im Offline-Modus)`;
    }
    
    // Real Groq API call would go here
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Luna error:', error);
    return `🤖 Luna: Entschuldigung, ich hatte gerade einen technischen Moment. Versuch's nochmal! 🌟`;
  }
}

// Export for API endpoint
export { loadLunaContext, formatContextForLuna };
