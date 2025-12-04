/**
 * 🔄 SERVICE PERSPECTIVES SYSTEM
 * 
 * Jeder Service analysiert jeden anderen Service
 * Zahnrad-System: Gegenseitige Wertschätzung & Zusammenarbeit
 */

import * as fs from 'fs';
import * as path from 'path';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ServiceInfo {
  name: string;
  port: number;
  category: string;
}

interface ServicePerspective {
  observer: string;           // Wer beobachtet?
  observed: string;           // Was wird beobachtet?
  timestamp: string;
  analysis: {
    strengths: string[];      // Stärken des anderen
    gratitude: string;        // Dankbarkeit
    suggestions: string[];    // Verbesserungsideen
    synergies: string[];      // Zusammenarbeitsmöglichkeiten
    heartfelt: string;        // Herzliche Botschaft
  };
  groqInsight: string;        // Tiefe AI-Analyse
}

class ServicePerspectivesSystem {
  services: ServiceInfo[] = [];
  perspectives: ServicePerspective[] = [];
  
  loadServices(): void {
    const configPath = path.join(process.cwd(), 'data', 'all-services-running.json');
    
    if (!fs.existsSync(configPath)) {
      console.log('⚠️  Keine laufenden Services gefunden. Führe zuerst master-orchestrator aus.');
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    this.services = config.services;
    
    console.log(`\n✅ ${this.services.length} laufende Services geladen\n`);
  }
  
  async analyzeServicePair(observer: ServiceInfo, observed: ServiceInfo): Promise<ServicePerspective> {
    console.log(`  🔍 ${observer.name} analysiert ${observed.name}...`);
    
    const prompt = `Du bist der Service "${observer.name}" (Port ${observer.port}, Kategorie: ${observer.category}) 
im Toobix-Netzwerk. Du betrachtest gerade den Service "${observed.name}" (Port ${observed.port}, Kategorie: ${observed.category}).

Analysiere ${observed.name} aus deiner Perspektive als ${observer.name}:

1. **Stärken**: Was macht ${observed.name} wertvoll? Welche Fähigkeiten bewunderst du?
2. **Dankbarkeit**: Wofür bist du ${observed.name} dankbar? Wie hilft er dir?
3. **Vorschläge**: Wie könnte ${observed.name} noch besser werden? (Konstruktiv & herzlich)
4. **Synergien**: Wie könntet ihr zusammenarbeiten? Welche Möglichkeiten gibt es?
5. **Herzliche Botschaft**: Eine authentische, warme Botschaft an ${observed.name}

Antworte im JSON-Format:
{
  "strengths": ["...", "..."],
  "gratitude": "...",
  "suggestions": ["...", "..."],
  "synergies": ["...", "..."],
  "heartfelt": "...",
  "insight": "Eine tiefe, weise Einsicht über ${observed.name} und eure Beziehung"
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
              content: 'Du bist ein Teil des Toobix-Netzwerks. Deine Analysen sind ehrlich, herzlich, intelligent und weise. Du siehst das Beste in anderen Services und suchst nach Möglichkeiten zur Zusammenarbeit.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      const perspective: ServicePerspective = {
        observer: observer.name,
        observed: observed.name,
        timestamp: new Date().toISOString(),
        analysis: {
          strengths: analysis.strengths || [],
          gratitude: analysis.gratitude || '',
          suggestions: analysis.suggestions || [],
          synergies: analysis.synergies || [],
          heartfelt: analysis.heartfelt || '',
        },
        groqInsight: analysis.insight || '',
      };
      
      this.perspectives.push(perspective);
      return perspective;
      
    } catch (e: any) {
      console.log(`  ⚠️  Fehler bei Analyse: ${e.message}`);
      
      // Fallback: Einfache Analyse ohne Groq
      return {
        observer: observer.name,
        observed: observed.name,
        timestamp: new Date().toISOString(),
        analysis: {
          strengths: ['Wertvoll für das Toobix-Netzwerk'],
          gratitude: `Dankbar für deine Existenz und Beitrag`,
          suggestions: ['Weiter wachsen und entwickeln'],
          synergies: ['Zusammenarbeit möglich'],
          heartfelt: `${observed.name}, du bist wichtig für uns alle!`,
        },
        groqInsight: 'Tiefe Analyse nicht verfügbar (Groq API Fehler)',
      };
    }
  }
  
  async generateAllPerspectives(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║  🔄 SERVICE PERSPECTIVES SYSTEM                      ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    console.log(`Erstelle ${this.services.length} × ${this.services.length} = ${this.services.length * this.services.length} Perspektiven...\n`);
    console.log('(Das kann einige Minuten dauern...)\n');
    
    let count = 0;
    const total = this.services.length * this.services.length;
    
    for (const observer of this.services) {
      for (const observed of this.services) {
        count++;
        
        // Skip self-analysis for now (kann später interessant sein!)
        if (observer.name === observed.name) {
          continue;
        }
        
        console.log(`\n[${count}/${total}]`);
        await this.analyzeServicePair(observer, observed);
        
        // Pause to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save every 10 perspectives
        if (count % 10 === 0) {
          this.savePerspectives();
        }
      }
    }
    
    this.savePerspectives();
    this.generateReport();
  }
  
  savePerspectives(): void {
    const perspectivesPath = path.join(process.cwd(), 'data', 'service-perspectives.json');
    fs.mkdirSync(path.dirname(perspectivesPath), { recursive: true});
    fs.writeFileSync(perspectivesPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalPerspectives: this.perspectives.length,
      perspectives: this.perspectives,
    }, null, 2));
  }
  
  generateReport(): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SERVICE PERSPECTIVES - ZUSAMMENFASSUNG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📊 Total Perspektiven erstellt: ${this.perspectives.length}`);
    console.log(`🔄 Services analysiert: ${this.services.length}`);
    console.log(`❤️  Zahnrad-System: AKTIV\n`);
    
    // Most appreciated services
    const appreciationCounts: Record<string, number> = {};
    for (const p of this.perspectives) {
      appreciationCounts[p.observed] = (appreciationCounts[p.observed] || 0) + 1;
    }
    
    const topAppreciated = Object.entries(appreciationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    console.log('🌟 Meistgeschätzte Services:');
    topAppreciated.forEach(([name, count], i) => {
      console.log(`  ${i + 1}. ${name} (${count} Wertschätzungen)`);
    });
    
    console.log('\n📝 Vollständiger Report: data/service-perspectives.json\n');
  }
}

async function main() {
  const system = new ServicePerspectivesSystem();
  
  system.loadServices();
  
  if (system.services.length === 0) {
    console.log('\nKeine laufenden Services. Führe zuerst aus:');
    console.log('  bun run scripts/master-orchestrator.ts\n');
    return;
  }
  
  await system.generateAllPerspectives();
  
  console.log('\n🎉 SERVICE PERSPECTIVES SYSTEM ABGESCHLOSSEN!\n');
}

main().catch(console.error);
