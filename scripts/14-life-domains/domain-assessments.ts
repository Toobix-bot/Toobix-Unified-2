/**
 * DOMAIN ASSESSMENT SYSTEM
 *
 * Personalisierte Einordnungstests für alle 7 Lebensbereiche
 * Erstellt detaillierte Profile, Level und Empfehlungen
 */

import type { LifeDomain } from './life-domain-chat';

// ========== TYPES ==========

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'scale' | 'multiple' | 'text' | 'boolean';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: [string, string]; // [min label, max label]
}

export interface AssessmentAnswer {
  questionId: string;
  value: any;
}

export interface DomainAssessment {
  domain: LifeDomain;
  questions: AssessmentQuestion[];
  scoringLogic: (answers: AssessmentAnswer[]) => AssessmentResult;
}

export interface AssessmentResult {
  domain: LifeDomain;
  level: number; // 1-10
  levelName: string; // Beginner, Intermediate, Advanced, Expert
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  profile: DomainProfile;
  timestamp: string;
}

export interface DomainProfile {
  currentState: string; // Kurze Beschreibung des aktuellen Stands
  goals: string[];
  challenges: string[];
  priorities: string[];
  customPromptAdditions: string; // Wird dem System-Prompt hinzugefügt
}

// ========== ASSESSMENT DEFINITIONS ==========

export const DOMAIN_ASSESSMENTS: Record<LifeDomain, DomainAssessment> = {
  career: {
    domain: 'career',
    questions: [
      {
        id: 'career_stage',
        question: 'Wo stehst du aktuell in deiner beruflichen Entwicklung?',
        type: 'multiple',
        options: [
          'Ausbildung/Studium',
          'Berufseinsteiger (0-2 Jahre)',
          'Fortgeschritten (3-5 Jahre)',
          'Erfahren (6-10 Jahre)',
          'Experte (10+ Jahre)',
          'Führungsposition'
        ]
      },
      {
        id: 'job_satisfaction',
        question: 'Wie zufrieden bist du mit deiner aktuellen beruflichen Situation?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Sehr unzufrieden', 'Sehr zufrieden']
      },
      {
        id: 'career_goals',
        question: 'Was sind deine wichtigsten beruflichen Ziele in den nächsten 12 Monaten?',
        type: 'text'
      },
      {
        id: 'skills_development',
        question: 'Investierst du aktiv in deine berufliche Weiterentwicklung?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Gar nicht', 'Sehr aktiv']
      },
      {
        id: 'work_life_balance',
        question: 'Wie gut gelingt dir die Work-Life-Balance?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Sehr schlecht', 'Sehr gut']
      },
      {
        id: 'exam_preparation',
        question: 'Bereitest du dich aktuell auf eine Prüfung vor? (z.B. IHK)',
        type: 'boolean'
      },
      {
        id: 'career_challenges',
        question: 'Was sind deine größten beruflichen Herausforderungen?',
        type: 'text'
      }
    ],
    scoringLogic: (answers) => {
      const satisfaction = answers.find(a => a.questionId === 'job_satisfaction')?.value || 5;
      const development = answers.find(a => a.questionId === 'skills_development')?.value || 5;
      const balance = answers.find(a => a.questionId === 'work_life_balance')?.value || 5;
      const examPrep = answers.find(a => a.questionId === 'exam_preparation')?.value || false;

      const score = Math.round((satisfaction + development + balance) / 3 * 10);
      const level = Math.ceil(score / 10);

      const levelNames = [
        'Orientierungsphase',
        'Orientierungsphase',
        'Aufbauphase',
        'Aufbauphase',
        'Entwicklungsphase',
        'Entwicklungsphase',
        'Fortgeschritten',
        'Fortgeschritten',
        'Experte',
        'Meister'
      ];

      const strengths = [];
      const weaknesses = [];
      const recommendations = [];

      if (satisfaction >= 7) {
        strengths.push('Hohe Jobzufriedenheit');
      } else {
        weaknesses.push('Verbesserungsbedarf bei Jobzufriedenheit');
        recommendations.push('Analysiere, was dich unzufrieden macht und entwickle einen Aktionsplan');
      }

      if (development >= 7) {
        strengths.push('Aktive Weiterentwicklung');
      } else {
        weaknesses.push('Wenig Investition in Skill-Development');
        recommendations.push('Setze dir konkrete Lernziele und reserviere Zeit für Weiterbildung');
      }

      if (balance >= 7) {
        strengths.push('Gute Work-Life-Balance');
      } else {
        weaknesses.push('Work-Life-Balance needs improvement');
        recommendations.push('Etabliere klare Grenzen zwischen Arbeit und Privatleben');
      }

      if (examPrep) {
        recommendations.push('Erstelle einen strukturierten Lernplan für deine Prüfung');
        recommendations.push('Nutze die Education-Domain für effektive Lernstrategien');
      }

      const goals = answers.find(a => a.questionId === 'career_goals')?.value || '';
      const challenges = answers.find(a => a.questionId === 'career_challenges')?.value || '';

      return {
        domain: 'career',
        level,
        levelName: levelNames[level - 1],
        score,
        strengths,
        weaknesses,
        recommendations,
        profile: {
          currentState: `${levelNames[level - 1]} - Satisfaction: ${satisfaction}/10`,
          goals: goals ? [goals] : [],
          challenges: challenges ? [challenges] : [],
          priorities: examPrep ? ['Prüfungsvorbereitung', 'Skill-Entwicklung'] : ['Karriereentwicklung'],
          customPromptAdditions: `User ist in der ${levelNames[level - 1]}. ${examPrep ? 'Aktuell in Prüfungsvorbereitung.' : ''} Zufriedenheit: ${satisfaction}/10.`
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  health: {
    domain: 'health',
    questions: [
      {
        id: 'overall_health',
        question: 'Wie würdest du deinen allgemeinen Gesundheitszustand einschätzen?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Sehr schlecht', 'Ausgezeichnet']
      },
      {
        id: 'exercise_frequency',
        question: 'Wie oft trainierst du pro Woche?',
        type: 'multiple',
        options: ['Nie', '1-2x', '3-4x', '5-6x', 'Täglich']
      },
      {
        id: 'nutrition',
        question: 'Wie gesund ernährst du dich?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Sehr ungesund', 'Sehr gesund']
      },
      {
        id: 'sleep_hours',
        question: 'Wie viele Stunden schläfst du durchschnittlich pro Nacht?',
        type: 'multiple',
        options: ['< 5h', '5-6h', '6-7h', '7-8h', '8-9h', '> 9h']
      },
      {
        id: 'stress_level',
        question: 'Wie hoch ist dein aktuelles Stresslevel?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Kein Stress', 'Extremer Stress']
      },
      {
        id: 'health_goals',
        question: 'Was sind deine wichtigsten Gesundheitsziele?',
        type: 'text'
      }
    ],
    scoringLogic: (answers) => {
      const overall = answers.find(a => a.questionId === 'overall_health')?.value || 5;
      const nutrition = answers.find(a => a.questionId === 'nutrition')?.value || 5;
      const stress = answers.find(a => a.questionId === 'stress_level')?.value || 5;
      const stressInverted = 11 - stress; // Invertiere Stress-Score

      const exerciseMap: Record<string, number> = {
        'Nie': 0,
        '1-2x': 3,
        '3-4x': 6,
        '5-6x': 8,
        'Täglich': 10
      };
      const exercise = exerciseMap[answers.find(a => a.questionId === 'exercise_frequency')?.value || 'Nie'] || 0;

      const sleepMap: Record<string, number> = {
        '< 5h': 2,
        '5-6h': 5,
        '6-7h': 7,
        '7-8h': 10,
        '8-9h': 9,
        '> 9h': 6
      };
      const sleep = sleepMap[answers.find(a => a.questionId === 'sleep_hours')?.value || '7-8h'] || 7;

      const score = Math.round((overall + nutrition + stressInverted + exercise + sleep) / 5 * 2);
      const level = Math.ceil(score / 10);

      const levelNames = [
        'Kritisch',
        'Bedenklich',
        'Verbesserungsbedürftig',
        'Unterdurchschnittlich',
        'Durchschnittlich',
        'Befriedigend',
        'Gut',
        'Sehr gut',
        'Ausgezeichnet',
        'Optimal'
      ];

      const strengths = [];
      const weaknesses = [];
      const recommendations = [];

      if (exercise >= 6) {
        strengths.push('Regelmäßige Bewegung');
      } else {
        weaknesses.push('Zu wenig körperliche Aktivität');
        recommendations.push('Baue schrittweise mehr Bewegung in deinen Alltag ein - starte mit 2-3x/Woche');
      }

      if (nutrition >= 7) {
        strengths.push('Gesunde Ernährung');
      } else {
        weaknesses.push('Ernährung optimierbar');
        recommendations.push('Fokussiere auf mehr Gemüse, Vollkorn und weniger verarbeitete Lebensmittel');
      }

      if (sleep >= 7) {
        strengths.push('Gute Schlafhygiene');
      } else {
        weaknesses.push('Verbesserungsbedarf beim Schlaf');
        recommendations.push('Etabliere eine feste Schlafenszeit-Routine und strebe 7-8h Schlaf an');
      }

      if (stress <= 4) {
        strengths.push('Gutes Stressmanagement');
      } else {
        weaknesses.push('Hohes Stresslevel');
        recommendations.push('Integriere tägliche Entspannungstechniken wie Meditation oder Atemübungen');
      }

      return {
        domain: 'health',
        level,
        levelName: levelNames[level - 1],
        score,
        strengths,
        weaknesses,
        recommendations,
        profile: {
          currentState: `${levelNames[level - 1]} - Overall: ${overall}/10, Stress: ${stress}/10`,
          goals: answers.find(a => a.questionId === 'health_goals')?.value ? [answers.find(a => a.questionId === 'health_goals')!.value] : [],
          challenges: weaknesses,
          priorities: exercise < 6 ? ['Mehr Bewegung'] : ['Optimierung'],
          customPromptAdditions: `User Gesundheitslevel: ${level}/10. ${stress > 6 ? 'Hohes Stresslevel!' : ''}`
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  finance: {
    domain: 'finance',
    questions: [
      {
        id: 'budget_tracking',
        question: 'Trackst du deine Einnahmen und Ausgaben?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Nie', 'Sehr detailliert']
      },
      {
        id: 'savings_rate',
        question: 'Wie viel Prozent deines Einkommens sparst du monatlich?',
        type: 'multiple',
        options: ['0%', '< 5%', '5-10%', '10-20%', '20-30%', '> 30%']
      },
      {
        id: 'debt_status',
        question: 'Hast du aktuell Schulden (außer Hypothek)?',
        type: 'boolean'
      },
      {
        id: 'emergency_fund',
        question: 'Hast du einen Notgroschen für 3-6 Monate Lebenskosten?',
        type: 'boolean'
      },
      {
        id: 'financial_knowledge',
        question: 'Wie schätzt du dein Finanzwissen ein?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: ['Anfänger', 'Experte']
      },
      {
        id: 'financial_goals',
        question: 'Was sind deine wichtigsten finanziellen Ziele?',
        type: 'text'
      }
    ],
    scoringLogic: (answers) => {
      const tracking = answers.find(a => a.questionId === 'budget_tracking')?.value || 0;
      const knowledge = answers.find(a => a.questionId === 'financial_knowledge')?.value || 3;
      const hasEmergencyFund = answers.find(a => a.questionId === 'emergency_fund')?.value || false;
      const hasDebt = answers.find(a => a.questionId === 'debt_status')?.value || false;

      const savingsMap: Record<string, number> = {
        '0%': 0,
        '< 5%': 2,
        '5-10%': 5,
        '10-20%': 7,
        '20-30%': 9,
        '> 30%': 10
      };
      const savings = savingsMap[answers.find(a => a.questionId === 'savings_rate')?.value || '0%'] || 0;

      let score = (tracking + knowledge + savings) / 3 * 10;
      if (hasEmergencyFund) score += 10;
      if (hasDebt) score -= 10;
      score = Math.max(0, Math.min(100, Math.round(score)));

      const level = Math.ceil(score / 10);

      const levelNames = [
        'Finanzielles Chaos',
        'Anfänger',
        'Lernend',
        'Grundlagen verstanden',
        'Solide',
        'Fortgeschritten',
        'Gut organisiert',
        'Sehr gut',
        'Finanziell stabil',
        'Meisterlich'
      ];

      const strengths = [];
      const weaknesses = [];
      const recommendations = [];

      if (tracking >= 7) {
        strengths.push('Gutes Budget-Tracking');
      } else {
        weaknesses.push('Unzureichendes Ausgaben-Tracking');
        recommendations.push('Starte mit einer einfachen Budget-App oder Excel-Tabelle');
      }

      if (savings >= 5) {
        strengths.push('Regelmäßiges Sparen');
      } else {
        weaknesses.push('Zu niedrige Sparquote');
        recommendations.push('Ziel: Mindestens 10% des Einkommens sparen (50/30/20 Regel)');
      }

      if (hasEmergencyFund) {
        strengths.push('Notgroschen vorhanden');
      } else {
        weaknesses.push('Kein Notgroschen');
        recommendations.push('PRIORITÄT: Baue einen Notgroschen für 3-6 Monate auf');
      }

      if (!hasDebt) {
        strengths.push('Schuldenfrei');
      } else {
        recommendations.push('Erstelle einen Schuldenabbau-Plan (Schneeball- oder Lawinen-Methode)');
      }

      return {
        domain: 'finance',
        level,
        levelName: levelNames[level - 1],
        score,
        strengths,
        weaknesses,
        recommendations,
        profile: {
          currentState: `${levelNames[level - 1]} - ${hasEmergencyFund ? 'Mit' : 'Ohne'} Notgroschen`,
          goals: answers.find(a => a.questionId === 'financial_goals')?.value ? [answers.find(a => a.questionId === 'financial_goals')!.value] : [],
          challenges: weaknesses,
          priorities: !hasEmergencyFund ? ['Notgroschen aufbauen'] : hasDebt ? ['Schulden abbauen'] : ['Vermögensaufbau'],
          customPromptAdditions: `Finanzlevel: ${level}/10. ${!hasEmergencyFund ? 'KEIN Notgroschen!' : ''} ${hasDebt ? 'Hat Schulden.' : ''}`
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  // Simplified assessments for other domains
  relationships: {
    domain: 'relationships',
    questions: [
      { id: 'satisfaction', question: 'Wie zufrieden bist du mit deinen Beziehungen?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Sehr unzufrieden', 'Sehr zufrieden'] },
      { id: 'quality_time', question: 'Verbringst du genug Qualitätszeit mit wichtigen Menschen?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Nie', 'Sehr oft'] },
      { id: 'communication', question: 'Wie gut kommunizierst du in Beziehungen?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Sehr schlecht', 'Ausgezeichnet'] },
      { id: 'goals', question: 'Was möchtest du in deinen Beziehungen verbessern?', type: 'text' }
    ],
    scoringLogic: (answers) => {
      const satisfaction = answers.find(a => a.questionId === 'satisfaction')?.value || 5;
      const qualityTime = answers.find(a => a.questionId === 'quality_time')?.value || 5;
      const communication = answers.find(a => a.questionId === 'communication')?.value || 5;

      const score = Math.round((satisfaction + qualityTime + communication) / 3 * 10);
      const level = Math.ceil(score / 10);

      return {
        domain: 'relationships',
        level,
        levelName: `Level ${level}`,
        score,
        strengths: satisfaction >= 7 ? ['Hohe Beziehungszufriedenheit'] : [],
        weaknesses: communication < 6 ? ['Kommunikation verbesserbar'] : [],
        recommendations: qualityTime < 6 ? ['Plane bewusst mehr Qualitätszeit ein'] : ['Weiter so!'],
        profile: {
          currentState: `Beziehungslevel ${level}/10`,
          goals: answers.find(a => a.questionId === 'goals')?.value ? [answers.find(a => a.questionId === 'goals')!.value] : [],
          challenges: [],
          priorities: ['Beziehungspflege'],
          customPromptAdditions: `Beziehungszufriedenheit: ${satisfaction}/10`
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  education: {
    domain: 'education',
    questions: [
      { id: 'learning_frequency', question: 'Wie oft lernst du Neues?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Nie', 'Täglich'] },
      { id: 'learning_method', question: 'Kennst du effektive Lernmethoden?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Keine Ahnung', 'Experte'] },
      { id: 'exam_prep', question: 'Bereitest du dich auf eine Prüfung vor?', type: 'boolean' },
      { id: 'goals', question: 'Was möchtest du lernen?', type: 'text' }
    ],
    scoringLogic: (answers) => {
      const frequency = answers.find(a => a.questionId === 'learning_frequency')?.value || 5;
      const method = answers.find(a => a.questionId === 'learning_method')?.value || 5;
      const examPrep = answers.find(a => a.questionId === 'exam_prep')?.value || false;

      let score = (frequency + method) / 2 * 10;
      if (examPrep) score += 10;
      score = Math.min(100, Math.round(score));

      const level = Math.ceil(score / 10);

      return {
        domain: 'education',
        level,
        levelName: `Level ${level}`,
        score,
        strengths: frequency >= 7 ? ['Regelmäßiges Lernen'] : [],
        weaknesses: method < 6 ? ['Lernmethoden optimierbar'] : [],
        recommendations: examPrep ? ['Strukturierter Lernplan empfohlen'] : ['Etabliere Lernroutine'],
        profile: {
          currentState: `Lernlevel ${level}/10 ${examPrep ? '(In Prüfungsvorbereitung)' : ''}`,
          goals: answers.find(a => a.questionId === 'goals')?.value ? [answers.find(a => a.questionId === 'goals')!.value] : [],
          challenges: [],
          priorities: examPrep ? ['Prüfungsvorbereitung'] : ['Kontinuierliches Lernen'],
          customPromptAdditions: `${examPrep ? 'IN PRÜFUNGSVORBEREITUNG! ' : ''}Lernfrequenz: ${frequency}/10`
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  creativity: {
    domain: 'creativity',
    questions: [
      { id: 'creative_time', question: 'Wie viel Zeit verbringst du mit kreativen Aktivitäten?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Keine', 'Sehr viel'] },
      { id: 'hobbies', question: 'Hast du aktive Hobbies?', type: 'boolean' },
      { id: 'satisfaction', question: 'Wie erfüllt fühlst du dich kreativ?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Gar nicht', 'Sehr erfüllt'] },
      { id: 'goals', question: 'Welche kreativen Projekte interessieren dich?', type: 'text' }
    ],
    scoringLogic: (answers) => {
      const time = answers.find(a => a.questionId === 'creative_time')?.value || 3;
      const hobbies = answers.find(a => a.questionId === 'hobbies')?.value || false;
      const satisfaction = answers.find(a => a.questionId === 'satisfaction')?.value || 5;

      let score = (time + satisfaction) / 2 * 10;
      if (hobbies) score += 10;
      score = Math.min(100, Math.round(score));

      const level = Math.ceil(score / 10);

      return {
        domain: 'creativity',
        level,
        levelName: `Level ${level}`,
        score,
        strengths: hobbies ? ['Aktive Hobbies'] : [],
        weaknesses: time < 5 ? ['Zu wenig kreative Zeit'] : [],
        recommendations: !hobbies ? ['Finde ein kreatives Hobby'] : ['Weiter so!'],
        profile: {
          currentState: `Kreativlevel ${level}/10`,
          goals: answers.find(a => a.questionId === 'goals')?.value ? [answers.find(a => a.questionId === 'goals')!.value] : [],
          challenges: [],
          priorities: ['Kreative Expression'],
          customPromptAdditions: `${hobbies ? 'Hat aktive Hobbies.' : 'Sucht nach Hobbies.'}`
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  spirituality: {
    domain: 'spirituality',
    questions: [
      { id: 'reflection', question: 'Wie oft reflektierst du über dein Leben?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Nie', 'Täglich'] },
      { id: 'values', question: 'Kennst du deine Kernwerte?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Gar nicht', 'Sehr klar'] },
      { id: 'meaning', question: 'Wie sinnerfüllt fühlst du dein Leben?', type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Sinnlos', 'Sehr sinnvoll'] },
      { id: 'goals', question: 'Was möchtest du spirituell entwickeln?', type: 'text' }
    ],
    scoringLogic: (answers) => {
      const reflection = answers.find(a => a.questionId === 'reflection')?.value || 3;
      const values = answers.find(a => a.questionId === 'values')?.value || 5;
      const meaning = answers.find(a => a.questionId === 'meaning')?.value || 5;

      const score = Math.round((reflection + values + meaning) / 3 * 10);
      const level = Math.ceil(score / 10);

      return {
        domain: 'spirituality',
        level,
        levelName: `Level ${level}`,
        score,
        strengths: meaning >= 7 ? ['Hohes Sinnempfinden'] : [],
        weaknesses: reflection < 5 ? ['Wenig Selbstreflexion'] : [],
        recommendations: values < 6 ? ['Definiere deine Kernwerte'] : ['Vertiefen!'],
        profile: {
          currentState: `Spirituelles Level ${level}/10`,
          goals: answers.find(a => a.questionId === 'goals')?.value ? [answers.find(a => a.questionId === 'goals')!.value] : [],
          challenges: [],
          priorities: ['Inneres Wachstum'],
          customPromptAdditions: `Sinnempfinden: ${meaning}/10`
        },
        timestamp: new Date().toISOString()
      };
    }
  }
};

// ========== HELPER FUNCTIONS ==========

export function getAssessmentForDomain(domain: LifeDomain): DomainAssessment {
  return DOMAIN_ASSESSMENTS[domain];
}

export function scoreAssessment(
  domain: LifeDomain,
  answers: AssessmentAnswer[]
): AssessmentResult {
  const assessment = DOMAIN_ASSESSMENTS[domain];
  return assessment.scoringLogic(answers);
}

export function generatePersonalizedPrompt(result: AssessmentResult): string {
  const base = DOMAIN_ASSESSMENTS[result.domain].domain;

  return `
PERSONALISIERUNGS-INFO:
- User Level: ${result.level}/10 (${result.levelName})
- Score: ${result.score}/100
- Stärken: ${result.strengths.join(', ') || 'Noch zu ermitteln'}
- Entwicklungsfelder: ${result.weaknesses.join(', ') || 'Keine'}
- ${result.profile.customPromptAdditions}

Passe deine Antworten an dieses Level an:
- Erkläre Konzepte entsprechend dem Wissenstand
- Fokussiere auf die identifizierten Schwachstellen
- Baue auf vorhandenen Stärken auf
- Berücksichtige die Ziele: ${result.profile.goals.join(', ') || 'Allgemeine Entwicklung'}
`;
}
