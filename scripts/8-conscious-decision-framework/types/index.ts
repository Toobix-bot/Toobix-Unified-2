/**
 * CONSCIOUS DECISION FRAMEWORK - TYPE DEFINITIONS
 * 
 * Ein Open-Source Tool zur bewussten Bewertung von Entscheidungen
 * mit Multi-Perspektiven-Analyse und Impact-Scoring
 */

export interface Decision {
  id: string;
  title: string;
  description: string;
  context: DecisionContext;
  alternatives: Alternative[];
  createdAt: Date;
  evaluatedAt?: Date;
  status: 'pending' | 'evaluating' | 'evaluated' | 'decided';
  chosenAlternative?: string;
}

export interface DecisionContext {
  domain: 'personal' | 'professional' | 'social' | 'environmental' | 'ethical' | 'mixed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reversibility: 'reversible' | 'partially-reversible' | 'irreversible';
  stakeholders: Stakeholder[];
  timeHorizon: {
    shortTerm: string;  // e.g., "1 week"
    mediumTerm: string; // e.g., "3 months"
    longTerm: string;   // e.g., "5 years"
  };
  constraints?: string[];
}

export interface Stakeholder {
  name: string;
  type: 'self' | 'individual' | 'group' | 'organization' | 'nature' | 'future-generations';
  influence: number;    // 0-100: How much they can affect the decision
  impact: number;       // 0-100: How much the decision affects them
  values?: string[];
}

export interface Alternative {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedCost?: {
    financial?: number;
    time?: string;
    energy?: number;
    relationships?: number;
  };
  evaluation?: EvaluationResult;
}

export interface EvaluationResult {
  alternativeId: string;
  perspectives: Perspective[];
  impactScores: ImpactScores;
  overallScore: number;
  confidence: number;
  recommendations: string[];
  warnings: string[];
  insights: Insight[];
}

export interface Perspective {
  name: string;
  type: 'rational' | 'emotional' | 'ethical' | 'spiritual' | 'creative' | 'practical' | 'societal';
  viewpoint: string;
  score: number;        // 0-100
  weight: number;       // 0-1: How much this perspective matters in this context
  concerns: string[];
  opportunities: string[];
}

export interface ImpactScores {
  human: ImpactDimension;
  nature: ImpactDimension;
  consciousness: ImpactDimension;
  overall: number;
}

export interface ImpactDimension {
  shortTerm: number;    // 0-100
  mediumTerm: number;   // 0-100
  longTerm: number;     // 0-100
  average: number;      // Weighted average
  confidence: number;   // 0-100: How sure we are about this assessment
}

export interface Insight {
  type: 'pattern' | 'bias' | 'opportunity' | 'risk' | 'wisdom' | 'connection';
  message: string;
  source: string;       // Which system/perspective generated this
  relevance: number;    // 0-100
}

export interface ComparisonResult {
  decisionId: string;
  alternatives: AlternativeComparison[];
  bestAlternative: string;
  reasoning: string;
  tradeoffs: Tradeoff[];
  sensitivityAnalysis?: SensitivityAnalysis;
}

export interface AlternativeComparison {
  alternativeId: string;
  name: string;
  totalScore: number;
  rank: number;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];   // Scenarios where this is optimal
}

export interface Tradeoff {
  dimension1: string;
  dimension2: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
}

export interface SensitivityAnalysis {
  // How much scores change when we adjust perspective weights
  volatility: number;   // 0-1: Higher = decision is more sensitive to weight changes
  stableAlternatives: string[]; // Alternatives that remain good across different weightings
  criticalPerspectives: string[]; // Perspectives that most affect the outcome
}

export interface DecisionHistory {
  userId?: string;
  decisions: Decision[];
  patterns: Pattern[];
  learnings: string[];
}

export interface Pattern {
  type: 'recurring-concern' | 'bias' | 'preference' | 'growth-area';
  description: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  examples: string[];  // Decision IDs
}

// API Request/Response types
export interface EvaluateRequest {
  decision: Omit<Decision, 'id' | 'createdAt' | 'status'>;
  options?: {
    includeSensitivityAnalysis?: boolean;
    perspectiveWeights?: Record<string, number>;
    integrations?: {
      useMultiPerspective?: boolean;
      useEmotionalResonance?: boolean;
      useMetaConsciousness?: boolean;
    };
  };
}

export interface EvaluateResponse {
  decision: Decision;
  evaluations: EvaluationResult[];
  comparison: ComparisonResult;
  metadata: {
    processingTime: number;
    servicesUsed: string[];
    confidence: number;
  };
}

export interface ExportFormat {
  format: 'json' | 'markdown' | 'pdf' | 'csv';
  includeInsights?: boolean;
  includeVisualizations?: boolean;
}
