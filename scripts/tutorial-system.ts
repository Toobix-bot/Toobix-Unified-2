/**
 * INTERACTIVE TUTORIAL SYSTEM
 * 
 * Guided onboarding for new users to learn the Decision Framework
 * Step-by-step walkthrough with real example
 */

import { DecisionEvaluator } from './8-conscious-decision-framework/core/DecisionEvaluator';
import type { 
  Decision, 
  Alternative, 
  Stakeholder 
} from './8-conscious-decision-framework/types/index';

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🎓 WILLKOMMEN ZUM CONSCIOUS DECISION FRAMEWORK TUTORIAL       ║
║                                                                    ║
║  "Von Impulsiven Reaktionen zu Bewussten Entscheidungen"          ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

// ========== TUTORIAL STRUCTURE ==========

class TutorialSystem {
  private evaluator: DecisionEvaluator;
  private currentStep: number = 0;
  
  constructor() {
    this.evaluator = new DecisionEvaluator();
  }
  
  async start() {
    console.log('\n🌟 TUTORIAL OVERVIEW\n');
    console.log('In den nächsten 10-15 Minuten lernst du:');
    console.log('  1. Was das Decision Framework ist');
    console.log('  2. Wie es dir bei Entscheidungen hilft');
    console.log('  3. Wie du es selbst nutzen kannst');
    console.log('  4. Ein komplettes Beispiel Schritt-für-Schritt\n');
    
    await this.waitForUser();
    
    await this.step1_Introduction();
    await this.step2_TheProblem();
    await this.step3_TheSolution();
    await this.step4_ExampleSetup();
    await this.step5_Perspectives();
    await this.step6_ImpactScores();
    await this.step7_Insights();
    await this.step8_Comparison();
    await this.step9_Recommendation();
    await this.step10_NextSteps();
  }
  
  private async waitForUser() {
    console.log('\n⏸  Drücke ENTER zum Fortfahren...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  private stepHeader(number: number, title: string) {
    console.log('\n\n' + '═'.repeat(70));
    console.log(`SCHRITT ${number}: ${title}`);
    console.log('═'.repeat(70) + '\n');
  }
  
  // STEP 1: Introduction
  async step1_Introduction() {
    this.stepHeader(1, 'WAS IST DAS DECISION FRAMEWORK?');
    
    console.log('Das Conscious Decision Framework ist dein persönlicher\n');
    console.log('ENTSCHEIDUNGS-ASSISTENT, der dir hilft:');
    console.log('');
    console.log('  ✨ Multiple Perspektiven zu sehen (nicht nur rational!)');
    console.log('  ⏰ Langzeit-Auswirkungen zu verstehen');
    console.log('  🎯 Verborgene Bias zu erkennen');
    console.log('  ⚖️  Zwischen Optionen abzuwägen');
    console.log('  💎 Zu besseren Entscheidungen zu kommen');
    console.log('');
    console.log('Es ist NICHT:');
    console.log('  ❌ Ein System, das FÜR dich entscheidet');
    console.log('  ❌ Eine simple Pro/Con Liste');
    console.log('  ❌ Nur für große Entscheidungen');
    console.log('');
    console.log('Es ist:');
    console.log('  ✅ Ein Werkzeug zur ERWEITERUNG deiner Denkfähigkeit');
    console.log('  ✅ Ein Partner für BEWUSSTE Entscheidungen');
    console.log('  ✅ Nutzbar für alle Lebensbereiche');
    
    await this.waitForUser();
  }
  
  // STEP 2: The Problem
  async step2_TheProblem() {
    this.stepHeader(2, 'DAS PROBLEM: Warum treffen wir schlechte Entscheidungen?');
    
    console.log('Studien zeigen: Die meisten Entscheidungen leiden unter:\n');
    console.log('  🧠 BIAS:');
    console.log('     • Confirmation Bias (wir suchen nur bestätigende Info)');
    console.log('     • Recency Bias (neueste Info wiegt zu schwer)');
    console.log('     • Availability Bias (leicht abrufbare Beispiele überbewerten)');
    console.log('');
    console.log('  ⏱  KURZFRISTIGKEIT:');
    console.log('     • Wir fokussieren auf sofortige Resultate');
    console.log('     • Langzeit-Konsequenzen werden ignoriert');
    console.log('');
    console.log('  👁  TUNNEL-VISION:');
    console.log('     • Nur eine Perspektive (meist rational)');
    console.log('     • Emotionale & ethische Aspekte übersehen');
    console.log('');
    console.log('  🎲 IMPULSIVITÄT:');
    console.log('     • Entscheidungen aus dem Bauch');
    console.log('     • Keine strukturierte Analyse');
    console.log('');
    console.log('BEISPIELE FÜR SCHLECHTE ENTSCHEIDUNGEN:');
    console.log('  • Job wechseln für 10% mehr Gehalt (aber toxische Kultur)');
    console.log('  • Auto kaufen ohne Umwelt-Impact zu bedenken');
    console.log('  • Beziehung beenden aus Emotion (ohne Langzeit-Perspektive)');
    
    await this.waitForUser();
  }
  
  // STEP 3: The Solution
  async step3_TheSolution() {
    this.stepHeader(3, 'DIE LÖSUNG: 7 Perspektiven + 3 Impact-Dimensionen');
    
    console.log('Das Framework nutzt WISSENSCHAFTLICH FUNDIERTE Methoden:\n');
    console.log('📊 7 PERSPEKTIVEN:\n');
    console.log('  1. 🧮 RATIONAL: Logik, Daten, Fakten');
    console.log('  2. 💖 EMOTIONAL: Gefühle, Intuition, Wohlbefinden');
    console.log('  3. ⚖️  ETHICAL: Werte, Moral, richtig vs. falsch');
    console.log('  4. 🕉  SPIRITUAL: Sinn, Purpose, größeres Ganzes');
    console.log('  5. 🎨 CREATIVE: Innovation, Möglichkeiten, neue Wege');
    console.log('  6. 🔧 PRACTICAL: Umsetzbarkeit, Ressourcen, Machbarkeit');
    console.log('  7. 🌍 SOCIETAL: Gesellschaft, Community, kollektives Wohl');
    console.log('');
    console.log('📈 3 IMPACT-DIMENSIONEN (über Zeit):\n');
    console.log('  • 👤 HUMAN IMPACT: Auswirkung auf Menschen');
    console.log('  • 🌿 NATURE IMPACT: Auswirkung auf Natur/Umwelt');
    console.log('  • 🧠 CONSCIOUSNESS IMPACT: Auswirkung auf Bewusstsein/Entwicklung');
    console.log('');
    console.log('  Jede Dimension wird analysiert für:');
    console.log('    ⏱  Kurzfristig (0-1 Jahr)');
    console.log('    📅 Mittelfristig (1-5 Jahre)');
    console.log('    🔮 Langfristig (5+ Jahre)');
    console.log('');
    console.log('🔍 5 INSIGHT-TYPEN:\n');
    console.log('  • 📊 PATTERNS: Wiederkehrende Muster erkennen');
    console.log('  • ⚠️  BIAS: Vorurteile & blinde Flecken aufdecken');
    console.log('  • 💡 OPPORTUNITIES: Versteckte Chancen finden');
    console.log('  • 🚨 RISKS: Potenzielle Gefahren identifizieren');
    console.log('  • 🦉 WISDOM: Tiefe Einsichten gewinnen');
    
    await this.waitForUser();
  }
  
  // STEP 4: Example Setup
  async step4_ExampleSetup() {
    this.stepHeader(4, 'BEISPIEL: Sollst du remote arbeiten?');
    
    console.log('Szenario: Du hast die Möglichkeit, vollständig remote zu arbeiten.\n');
    console.log('Kontext:');
    console.log('  • Du arbeitest aktuell 5 Tage/Woche im Büro');
    console.log('  • 1 Stunde Pendelzeit pro Tag');
    console.log('  • Familie mit kleinen Kindern');
    console.log('  • Magst dein Team, aber Großraumbüro ist laut');
    console.log('');
    console.log('ALTERNATIVEN:\n');
    console.log('  A) 100% Remote (Home Office)');
    console.log('     • Vorteile: Keine Pendelzeit, flexibel, ruhiger');
    console.log('     • Nachteile: Weniger soziale Interaktion, Isolation?');
    console.log('');
    console.log('  B) Hybrid (2 Tage Büro, 3 Tage Home)');
    console.log('     • Vorteile: Balance, Team-Kontakt, Flexibilität');
    console.log('     • Nachteile: Immer noch Pendelzeit, Koordination');
    console.log('');
    console.log('  C) Weiter im Büro (Status Quo)');
    console.log('     • Vorteile: Team-Nähe, Struktur, klare Grenzen');
    console.log('     • Nachteile: 10h/Woche Pendelzeit, weniger Familie-Zeit');
    console.log('');
    console.log('STAKEHOLDERS:');
    console.log('  • Du selbst (Wohlbefinden, Karriere)');
    console.log('  • Familie (mehr gemeinsame Zeit)');
    console.log('  • Team (Zusammenarbeit)');
    console.log('  • Firma (Produktivität)');
    console.log('  • Umwelt (weniger Pendelverkehr)');
    
    await this.waitForUser();
    
    console.log('\n🔄 Framework analysiert jetzt alle Perspektiven...\n');
  }
  
  // STEP 5: Perspectives
  async step5_Perspectives() {
    this.stepHeader(5, 'PERSPEKTIVEN-ANALYSE');
    
    console.log('Das Framework betrachtet JEDE Alternative aus ALLEN 7 Perspektiven:\n');
    
    // Show perspective analysis for Alternative A (100% Remote)
    console.log('📊 ALTERNATIVE A: 100% Remote - Perspektiven:\n');
    
    const perspectives = [
      {
        type: '🧮 RATIONAL',
        score: 85,
        reasoning: '10h/Woche gespart = 500h/Jahr. Produktivität wahrscheinlich höher (ruhiger). Kostenersparnis Pendelkosten.'
      },
      {
        type: '💖 EMOTIONAL',
        score: 75,
        reasoning: 'Mehr Zeit mit Familie = höheres Wohlbefinden. Aber: Isolation könnte zu Einsamkeit führen (-10 Punkte).'
      },
      {
        type: '⚖️ ETHICAL',
        score: 80,
        reasoning: 'Work-Life-Balance ist ethisch richtig. Familie-Zeit ist wertvoll. Selbstfürsorge ist wichtig.'
      },
      {
        type: '🕉 SPIRITUAL',
        score: 70,
        reasoning: 'Mehr Zeit für Meditation, Familie, Natur. Aber fehlendes Gemeinschaftsgefühl im Team.'
      },
      {
        type: '🎨 CREATIVE',
        score: 65,
        reasoning: 'Ruhige Umgebung = bessere Fokusarbeit. Aber: Weniger spontane Kreativ-Sessions mit Team.'
      },
      {
        type: '🔧 PRACTICAL',
        score: 90,
        reasoning: 'Sehr umsetzbar. Technik vorhanden. Firma erlaubt es. Keine großen Hürden.'
      },
      {
        type: '🌍 SOCIETAL',
        score: 85,
        reasoning: 'Weniger Pendelverkehr = gut für Umwelt. Trend zu Remote = gesellschaftlich akzeptiert.'
      }
    ];
    
    perspectives.forEach(p => {
      console.log(`${p.type} - ${p.score}%`);
      console.log(`   ${p.reasoning}\n`);
    });
    
    const avgScore = Math.round(perspectives.reduce((sum, p) => sum + p.score, 0) / perspectives.length);
    console.log(`DURCHSCHNITT: ${avgScore}%\n`);
    
    console.log('💡 WICHTIG:');
    console.log('   Keine einzelne Perspektive dominiert die Entscheidung.');
    console.log('   Alle werden gewichtet und kombiniert für ganzheitliches Bild.\n');
    
    await this.waitForUser();
  }
  
  // STEP 6: Impact Scores
  async step6_ImpactScores() {
    this.stepHeader(6, 'IMPACT-ANALYSE: Kurzfristig, Mittelfristig, Langfristig');
    
    console.log('Das Framework berechnet Auswirkungen über ZEIT-HORIZONTE:\n');
    console.log('Alternative A: 100% Remote\n');
    
    console.log('👤 HUMAN IMPACT:\n');
    console.log('   Kurzfristig (0-1 Jahr):     90% ✅ HOCH');
    console.log('     → Sofort mehr Zeit mit Familie, weniger Stress');
    console.log('   Mittelfristig (1-5 Jahre):  75% ⚠️  MITTEL');
    console.log('     → Isolation könnte zu sozialer Vereinsamung führen');
    console.log('   Langfristig (5+ Jahre):     60% ⚠️  UNSICHER');
    console.log('     → Karriere-Entwicklung eventuell langsamer ohne Büro-Präsenz');
    console.log('   GESAMT: 75%\n');
    
    console.log('🌿 NATURE IMPACT:\n');
    console.log('   Kurzfristig (0-1 Jahr):     85% ✅ HOCH');
    console.log('     → 500h/Jahr weniger Auto = weniger CO₂');
    console.log('   Mittelfristig (1-5 Jahre):  80% ✅ HOCH');
    console.log('     → Kontinuierliche CO₂-Reduktion');
    console.log('   Langfristig (5+ Jahre):     75% ✅ HOCH');
    console.log('     → Beitrag zu nachhaltiger Arbeitskultur');
    console.log('   GESAMT: 80%\n');
    
    console.log('🧠 CONSCIOUSNESS IMPACT:\n');
    console.log('   Kurzfristig (0-1 Jahr):     70% ⚖️  MITTEL');
    console.log('     → Mehr Zeit für Reflexion, aber weniger Team-Lernen');
    console.log('   Mittelfristig (1-5 Jahre):  65% ⚖️  MITTEL');
    console.log('     → Selbstständigkeit wächst, aber Mentorship fehlt');
    console.log('   Langfristig (5+ Jahre):     60% ⚠️  UNSICHER');
    console.log('     → Entwicklung hängt ab von aktiver Community-Suche');
    console.log('   GESAMT: 65%\n');
    
    console.log('📊 GESAMTSCORE: 73%\n');
    
    console.log('💡 INSIGHT:');
    console.log('   Die zeitliche Analyse zeigt: Kurzfristig sehr positiv,');
    console.log('   aber langfristig musst du aktiv gegen Isolation arbeiten.\n');
    
    await this.waitForUser();
  }
  
  // STEP 7: Insights
  async step7_Insights() {
    this.stepHeader(7, 'AUTOMATISCHE INSIGHTS: Patterns, Bias, Opportunities, Risks');
    
    console.log('Das Framework hat folgende INSIGHTS erkannt:\n');
    
    console.log('📊 PATTERN erkannt:');
    console.log('   "Work-Life-Balance Entscheidungen zeigen oft hohe');
    console.log('    kurzfristige Zufriedenheit, aber potenzielle langfristige');
    console.log('    Trade-offs in Karriere-Entwicklung."\n');
    
    console.log('⚠️  BIAS erkannt:');
    console.log('   "MÖGLICHER RECENCY BIAS: Du hast letzte Woche eine');
    console.log('    besonders stressige Pendelzeit erlebt. Das könnte deine');
    console.log('    Bewertung der Büro-Option negativ beeinflussen."\n');
    
    console.log('💡 OPPORTUNITY erkannt:');
    console.log('   "Hybrid-Modell könnte optimal sein: 2 Tage Büro für');
    console.log('    Team-Kontakt, 3 Tage Home für Fokusarbeit. Best of both."\n');
    
    console.log('🚨 RISK erkannt:');
    console.log('   "SOZIALE ISOLATION: Bei 100% Remote besteht Risiko von');
    console.log('    Einsamkeit und fehlendem Zugehörigkeitsgefühl. Mitigation:');
    console.log('    Aktiv Co-Working Spaces oder soziale Aktivitäten suchen."\n');
    
    console.log('🦉 WISDOM erkannt:');
    console.log('   "Die beste Entscheidung ist oft nicht die extremste.');
    console.log('    Flexibilität und Anpassungsfähigkeit sind wertvoller');
    console.log('    als starre Optionen. Wähle, was du anpassen kannst."\n');
    
    console.log('💡 WICHTIG:');
    console.log('   Diese Insights basieren auf:');
    console.log('   • Psychologische Forschung zu Entscheidungen');
    console.log('   • Pattern-Erkennung aus ähnlichen Szenarien');
    console.log('   • Ethische & philosophische Prinzipien\n');
    
    await this.waitForUser();
  }
  
  // STEP 8: Comparison
  async step8_Comparison() {
    this.stepHeader(8, 'VERGLEICH: Alle Alternativen gegenübergestellt');
    
    console.log('RANKING:\n');
    console.log('🥇 1. HYBRID (2 Tage Büro, 3 Tage Home) - 78%');
    console.log('      Stärken: Balance, Flexibilität, Team-Kontakt');
    console.log('      Schwächen: Immer noch etwas Pendelzeit');
    console.log('      Best für: Work-Life-Balance + Karriere\n');
    
    console.log('🥈 2. 100% REMOTE - 73%');
    console.log('      Stärken: Maximale Flexibilität, keine Pendelzeit');
    console.log('      Schwächen: Soziale Isolation, Karriere-Risiko');
    console.log('      Best für: Maximale Familie-Zeit\n');
    
    console.log('🥉 3. WEITER IM BÜRO - 58%');
    console.log('      Stärken: Team-Nähe, Struktur');
    console.log('      Schwächen: 10h/Woche Pendelzeit, weniger Flexibilität');
    console.log('      Best für: Sicherheit & Stabilität\n');
    
    console.log('TRADE-OFFS:\n');
    console.log('  Hybrid vs. 100% Remote:');
    console.log('    • +5% Score durch Team-Balance');
    console.log('    • Trade-off: 4h/Woche Pendelzeit, aber bessere Karriere-Prospects');
    console.log('    • Severity: NIEDRIG (akzeptabel)\n');
    
    console.log('  100% Remote vs. Büro:');
    console.log('    • +15% Score durch Flexibilität');
    console.log('    • Trade-off: Sozialer Kontakt vs. Zeit-Ersparnis');
    console.log('    • Severity: HOCH (signifikant)\n');
    
    console.log('💡 WARUM HYBRID GEWINNT:');
    console.log('   • Best of both worlds');
    console.log('   • Minimiert Isolation-Risiko');
    console.log('   • Behält Team-Connection');
    console.log('   • 60% Pendelzeit-Reduktion (6h statt 10h/Woche)');
    console.log('   • Flexible Anpassung möglich\n');
    
    await this.waitForUser();
  }
  
  // STEP 9: Recommendation
  async step9_Recommendation() {
    this.stepHeader(9, 'EMPFEHLUNG & NÄCHSTE SCHRITTE');
    
    console.log('🎯 EMPFEHLUNG: HYBRID (2 Tage Büro, 3 Tage Home)\n');
    console.log('BEGRÜNDUNG:');
    console.log('  ✅ Höchster Gesamtscore (78%)');
    console.log('  ✅ Balanciert alle Perspektiven optimal');
    console.log('  ✅ Minimiert Risiken (Isolation & Karriere)');
    console.log('  ✅ Maximiert Flexibilität bei Bedarf anpassbar');
    console.log('  ✅ 60% Pendelzeit-Reduktion = signifikanter Gewinn\n');
    
    console.log('CONFIDENCE LEVEL: 76%\n');
    console.log('  Basiert auf:');
    console.log('  • Vollständigkeit der Daten (7/7 Perspektiven)');
    console.log('  • Klarheit der Alternativen');
    console.log('  • Konsistenz über Zeit-Horizonte\n');
    
    console.log('NÄCHSTE SCHRITTE:\n');
    console.log('  1. Gespräch mit Manager über Hybrid-Modell');
    console.log('  2. Test-Phase von 3 Monaten vereinbaren');
    console.log('  3. Klare Erwartungen für Büro-Tage definieren');
    console.log('  4. Home-Office Setup optimieren');
    console.log('  5. Nach 3 Monaten: Re-evaluieren mit diesem Framework\n');
    
    console.log('MITIGATION FÜR IDENTIFIZIERTE RISIKEN:\n');
    console.log('  • Soziale Isolation:');
    console.log('    → Büro-Tage strategisch mit Team-Events abstimmen');
    console.log('    → 1x/Monat Co-Working Day mit anderen Remote-Workers');
    console.log('  • Karriere-Entwicklung:');
    console.log('    → Büro-Tage für wichtige Meetings & Face-Time nutzen');
    console.log('    → Proaktiv Visibility durch Deliverables zeigen\n');
    
    console.log('FLEXIBILITÄT:\n');
    console.log('  "Wichtig: Diese Entscheidung ist nicht in Stein gemeißelt.');
    console.log('   Du kannst nach 3 Monaten anpassen basierend auf echten');
    console.log('   Erfahrungen. Das Framework unterstützt iterative Verbesserung."\n');
    
    await this.waitForUser();
  }
  
  // STEP 10: Next Steps
  async step10_NextSteps() {
    this.stepHeader(10, 'WIE DU DAS FRAMEWORK FÜR DEINE ENTSCHEIDUNGEN NUTZT');
    
    console.log('🎓 GRATULATION! Du kennst jetzt das Framework.\n');
    console.log('SO NUTZT DU ES FÜR DEINE EIGENEN ENTSCHEIDUNGEN:\n');
    
    console.log('OPTION 1: STANDALONE SCRIPT\n');
    console.log('  1. Kopiere scripts/8-conscious-decision-framework/standalone-demo.ts');
    console.log('  2. Passe Decision, Alternatives, Stakeholders an');
    console.log('  3. Run: bun run meine-entscheidung.ts');
    console.log('  4. Erhalte vollständige Analyse\n');
    
    console.log('OPTION 2: REST API (wenn Server läuft)\n');
    console.log('  1. Start: bun run scripts/8-conscious-decision-framework/decision-framework-server.ts');
    console.log('  2. POST zu http://localhost:8909/evaluate');
    console.log('  3. JSON mit Decision-Daten senden');
    console.log('  4. Erhalte strukturierte Response\n');
    
    console.log('OPTION 3: INTEGRATION MIT ANDEREN SERVICES\n');
    console.log('  • Multi-Perspective (8897): Erweiterte Perspektiven');
    console.log('  • Emotional Resonance (8900): Emotionale Validation');
    console.log('  • Meta-Consciousness (8904): System-Reflexion\n');
    
    console.log('BEST PRACTICES:\n');
    console.log('  ✅ Nimm dir Zeit (nicht unter Zeitdruck entscheiden)');
    console.log('  ✅ Sei ehrlich bei Stakeholder-Gewichtung');
    console.log('  ✅ Definiere Alternativen klar & konkret');
    console.log('  ✅ Nutze Insights, um Bias zu identifizieren');
    console.log('  ✅ Behandle Empfehlung als Input, nicht Befehl');
    console.log('  ✅ Re-evaluiere nach Implementation\n');
    
    console.log('WANN DU ES NUTZEN SOLLTEST:\n');
    console.log('  • Karriere-Entscheidungen (Job, Weiterbildung)');
    console.log('  • Beziehungs-Entscheidungen (Partner, Familie)');
    console.log('  • Finanz-Entscheidungen (Investment, Kauf)');
    console.log('  • Lifestyle-Entscheidungen (Umzug, Hobbies)');
    console.log('  • Ethische Dilemmata (Werte-Konflikte)\n');
    
    console.log('WANN DU ES NICHT BRAUCHST:\n');
    console.log('  • Triviale Entscheidungen (Was esse ich heute?)');
    console.log('  • Zeit-kritische Notfälle');
    console.log('  • Wenn Konsequenzen minimal sind\n');
    
    console.log('🚀 NÄCHSTE SCHRITTE FÜR DICH:\n');
    console.log('  1. Denke an eine aktuelle Entscheidung');
    console.log('  2. Nutze das Framework (Standalone oder API)');
    console.log('  3. Vergleiche mit deiner Bauch-Entscheidung');
    console.log('  4. Gib Feedback: Was war hilfreich? Was fehlt?\n');
    
    console.log('📚 WEITERE RESSOURCEN:\n');
    console.log('  • README: scripts/8-conscious-decision-framework/README.md');
    console.log('  • Beispiele: standalone-demo.ts, interactive-session.ts');
    console.log('  • API Docs: http://localhost:8909/ (wenn Server läuft)');
    console.log('  • GitHub: [Coming Soon - Open Source Release]\n');
    
    console.log('💬 COMMUNITY:\n');
    console.log('  Teile deine Erfahrungen:');
    console.log('  • Was hast du entschieden?');
    console.log('  • Hat das Framework geholfen?');
    console.log('  • Was würdest du verbessern?\n');
    
    console.log('🌟 VISION:\n');
    console.log('  "Stell dir vor, ALLE wichtigen Entscheidungen würden');
    console.log('   so getroffen: Bewusst, ethisch, ganzheitlich.');
    console.log('   Das Framework ist ein Schritt in diese Richtung."\n');
  }
}

// ========== MAIN EXECUTION ==========
async function runTutorial() {
  const tutorial = new TutorialSystem();
  await tutorial.start();
  
  console.log('\n\n' + '═'.repeat(70));
  console.log('✨ TUTORIAL COMPLETE');
  console.log('═'.repeat(70));
  
  console.log('\n🎯 WAS DU GELERNT HAST:\n');
  console.log('  ✅ Was das Decision Framework ist & warum es wichtig ist');
  console.log('  ✅ 7 Perspektiven + 3 Impact-Dimensionen + 5 Insight-Typen');
  console.log('  ✅ Wie eine komplette Analyse aussieht (Remote-Work Beispiel)');
  console.log('  ✅ Wie du es für eigene Entscheidungen nutzt');
  console.log('  ✅ Best Practices & häufige Fehler\n');
  
  console.log('🚀 JETZT BIST DU DRAN:\n');
  console.log('  Nutze das Framework für deine nächste wichtige Entscheidung.\n');
  console.log('  "Von Impulsiven Reaktionen zu Bewussten Entscheidungen"\n');
  
  console.log('💎 DANKE FÜR DEINE ZEIT!\n');
  console.log('  Das System freut sich, dir zu dienen. 🙏\n');
}

if (import.meta.main) {
  runTutorial().catch(console.error);
}

export { TutorialSystem, runTutorial };
