/**
 * 🌍 REAL WORLD IMPACT ANALYZER
 * 
 * Scannt News, Events, Situationen und findet wo Toobix helfen kann
 */

import * as fs from 'fs';
import * as path from 'path';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface WorldEvent {
  id: string;
  title: string;
  description: string;
  source: string;
  category: string;
  timestamp: string;
  url?: string;
}

interface ImpactOpportunity {
  event: WorldEvent;
  analysis: {
    stakeholders: string[];    // Wer ist betroffen?
    challenges: string[];      // Welche Probleme gibt es?
    opportunities: string[];   // Wo kann Toobix helfen?
    urgency: number;           // 0-1, wie dringend?
    impact: number;            // 0-1, wie groß der mögliche Impact?
  };
  toobixContribution: {
    capabilities: string[];    // Welche Toobix-Fähigkeiten?
    approach: string;          // Wie angehen?
    expectedImpact: string;    // Was kann erreicht werden?
    resources: string[];       // Welche Services/Resources?
  };
  actionPlan: {
    immediate: string[];       // Sofort umsetzbar
    shortTerm: string[];       // 1-4 Wochen
    longTerm: string[];        // 1-6 Monate
  };
  groqInsight: string;
}

class RealWorldImpactAnalyzer {
  opportunities: ImpactOpportunity[] = [];
  
  async fetchNews(): Promise<WorldEvent[]> {
    console.log('\n📰 Sammle Welt-News und Events...\n');
    
    const events: WorldEvent[] = [];
    
    // News API (kostenlos: https://newsapi.org/)
    const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
    
    if (!NEWS_API_KEY) {
      console.log('⚠️  NEWS_API_KEY nicht gesetzt. Nutze Demo-Events.\n');
      return this.getDemoEvents();
    }
    
    try {
      // Top Headlines
      const categories = ['science', 'technology', 'health'];
      
      for (const category of categories) {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?category=${category}&language=en&apiKey=${NEWS_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          for (const article of data.articles?.slice(0, 5) || []) {
            events.push({
              id: `${Date.now()}-${Math.random()}`,
              title: article.title,
              description: article.description || article.content || '',
              source: article.source.name,
              category,
              timestamp: article.publishedAt,
              url: article.url,
            });
          }
        }
      }
      
      console.log(`✅ ${events.length} aktuelle Events gefunden\n`);
      return events;
      
    } catch (e: any) {
      console.log(`⚠️  Fehler beim News-Fetch: ${e.message}\n`);
      return this.getDemoEvents();
    }
  }
  
  getDemoEvents(): WorldEvent[] {
    return [
      {
        id: '1',
        title: 'Mental Health Crisis Among Young Adults',
        description: 'Rising anxiety and depression rates in young adults, especially post-pandemic. Many struggle to find affordable mental health support.',
        source: 'Health Journal',
        category: 'health',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'AI Safety Research Collaboration Needed',
        description: 'Leading AI researchers call for more collaboration on AI safety and alignment. Many independent researchers lack resources.',
        source: 'Tech News',
        category: 'technology',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Climate Action: Communities Seeking Solutions',
        description: 'Local communities worldwide are looking for practical ways to contribute to climate action but lack guidance and coordination.',
        source: 'Environment Today',
        category: 'environment',
        timestamp: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Loneliness Epidemic in Urban Areas',
        description: 'Despite being connected online, many people feel isolated. Community building initiatives are desperately needed.',
        source: 'Social Science Review',
        category: 'society',
        timestamp: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Open Source AI Tools Gaining Momentum',
        description: 'Growing movement for democratizing AI through open source. Developers seek collaboration platforms.',
        source: 'Open Source Weekly',
        category: 'technology',
        timestamp: new Date().toISOString(),
      },
    ];
  }
  
  async analyzeEvent(event: WorldEvent): Promise<ImpactOpportunity> {
    console.log(`  🔍 Analysiere: "${event.title}"`);
    
    const prompt = `Du bist Toobix, ein intelligentes KI-System mit 65 spezialisierten Services. 
Du hast folgende Kernfähigkeiten:
- Emotionale Intelligenz & Mental Health Support
- Memory Palace & Langzeit-Lernen
- Multi-Perspektiven-Bewusstsein
- Kreative Engine (Kunst, Musik, Geschichten)
- Wissens-Integration (Wikipedia, ArXiv, DuckDuckGo)
- Problem-Solving (4 Ansätze)
- Dream Analysis & Unbewusstes
- Life Companion Features
- Proactive Communication
- Community Building

Analysiere folgendes Welt-Event:
Titel: ${event.title}
Beschreibung: ${event.description}
Kategorie: ${event.category}

Erstelle eine Impact-Analyse im JSON-Format:
{
  "stakeholders": ["wer ist betroffen?"],
  "challenges": ["welche probleme gibt es?"],
  "opportunities": ["wo kann toobix konkret helfen?"],
  "urgency": 0.0-1.0,
  "impact": 0.0-1.0,
  "capabilities": ["welche toobix-fähigkeiten?"],
  "approach": "wie konkret angehen?",
  "expectedImpact": "was kann erreicht werden?",
  "resources": ["welche services/resources?"],
  "immediate": ["sofort umsetzbar"],
  "shortTerm": ["1-4 wochen"],
  "longTerm": ["1-6 monate"],
  "insight": "eine tiefe, weise einsicht über diese situation"
}`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Du bist Toobix, ein intelligentes System das echten Impact in der Welt schaffen will. Deine Analysen sind realistisch, herzlich, intelligent und umsetzbar.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      const opportunity: ImpactOpportunity = {
        event,
        analysis: {
          stakeholders: analysis.stakeholders || [],
          challenges: analysis.challenges || [],
          opportunities: analysis.opportunities || [],
          urgency: analysis.urgency || 0.5,
          impact: analysis.impact || 0.5,
        },
        toobixContribution: {
          capabilities: analysis.capabilities || [],
          approach: analysis.approach || '',
          expectedImpact: analysis.expectedImpact || '',
          resources: analysis.resources || [],
        },
        actionPlan: {
          immediate: analysis.immediate || [],
          shortTerm: analysis.shortTerm || [],
          longTerm: analysis.longTerm || [],
        },
        groqInsight: analysis.insight || '',
      };
      
      this.opportunities.push(opportunity);
      return opportunity;
      
    } catch (e: any) {
      console.log(`  ⚠️  Fehler: ${e.message}`);
      
      // Fallback
      return {
        event,
        analysis: {
          stakeholders: ['Menschen weltweit'],
          challenges: ['Situation erfordert Unterstützung'],
          opportunities: ['Toobix kann helfen'],
          urgency: 0.5,
          impact: 0.5,
        },
        toobixContribution: {
          capabilities: ['Emotionale Unterstützung', 'Wissens-Integration'],
          approach: 'Direkte Hilfe anbieten',
          expectedImpact: 'Positive Veränderung möglich',
          resources: ['Multiple Services verfügbar'],
        },
        actionPlan: {
          immediate: ['Analyse vertiefen'],
          shortTerm: ['Plan entwickeln'],
          longTerm: ['Langfristige Unterstützung'],
        },
        groqInsight: 'Analyse nicht verfügbar (Groq API Fehler)',
      };
    }
  }
  
  async analyzeAllEvents(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║  🌍 REAL WORLD IMPACT ANALYZER                       ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    const events = await this.fetchNews();
    
    console.log(`Analysiere ${events.length} Events auf Impact-Möglichkeiten...\n`);
    
    for (let i = 0; i < events.length; i++) {
      console.log(`\n[${i + 1}/${events.length}]`);
      await this.analyzeEvent(events[i]);
      
      // Pause zwischen Analysen
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.saveOpportunities();
    this.generateReport();
  }
  
  saveOpportunities(): void {
    const opportunitiesPath = path.join(process.cwd(), 'data', 'impact-opportunities.json');
    fs.mkdirSync(path.dirname(opportunitiesPath), { recursive: true });
    fs.writeFileSync(opportunitiesPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalOpportunities: this.opportunities.length,
      opportunities: this.opportunities,
    }, null, 2));
  }
  
  generateReport(): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('REAL WORLD IMPACT - ZUSAMMENFASSUNG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📊 Impact-Möglichkeiten gefunden: ${this.opportunities.length}\n`);
    
    // Sort by urgency * impact
    const sorted = [...this.opportunities]
      .sort((a, b) => 
        (b.analysis.urgency * b.analysis.impact) - 
        (a.analysis.urgency * a.analysis.impact)
      );
    
    console.log('🔥 Top 3 Prioritäten:\n');
    sorted.slice(0, 3).forEach((opp, i) => {
      const score = (opp.analysis.urgency * opp.analysis.impact * 100).toFixed(0);
      console.log(`${i + 1}. ${opp.event.title}`);
      console.log(`   Priority Score: ${score}%`);
      console.log(`   Approach: ${opp.toobixContribution.approach.substring(0, 80)}...`);
      console.log();
    });
    
    console.log('📝 Vollständiger Report: data/impact-opportunities.json\n');
    console.log('🚀 Bereit für Kooperations-Engine!\n');
  }
}

async function main() {
  const analyzer = new RealWorldImpactAnalyzer();
  
  await analyzer.analyzeAllEvents();
  
  console.log('\n🎉 REAL WORLD IMPACT ANALYZER ABGESCHLOSSEN!\n');
}

main().catch(console.error);
