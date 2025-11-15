// Assessment Types for CS Skills Assessment

export type QuestionType = 'open_ended' | 'scale' | 'multiple_choice';

export type ScoringDimension =
  | 'iq'
  | 'eq'
  | 'empathy'
  | 'self_awareness'
  | 'technical'
  | 'ai_readiness'
  | 'gtm'
  | 'personality'
  | 'motivation'
  | 'work_history'
  | 'passions'
  | 'culture_fit';

export interface AssessmentQuestion {
  id: string;
  section: string;
  order: number;
  text: string;
  type: QuestionType;
  dimensions: ScoringDimension[];
  required: boolean;
  followUp?: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  order: number;
  transitionMessage?: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentConfig {
  id: string;
  title: string;
  version: string;
  estimatedMinutes: number;
  sections: AssessmentSection[];
  completionMessage: string;
}

export interface InterviewMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export interface AssessmentDimensions {
  iq: number;
  eq: number;
  empathy: number;
  self_awareness: number;
  technical: number;
  ai_readiness: number;
  gtm: number;
  personality: number;
  motivation: number;
  work_history: number;
  passions: number;
  culture_fit: number;
}

export interface AssessmentFlags {
  red_flags: string[];
  green_flags: string[];
}

export type AssessmentTier = 'top_1' | 'benched' | 'passed';

export type ArchetypeConfidence = 'high' | 'medium' | 'low';

// Enhanced Results Types (Phase 1)
export interface PersonalityProfile {
  mbti: string;
  enneagram: string;
  traits: string[];
}

export interface AIOrchestrationScores {
  technical_foundation: number;
  practical_use: number;
  conceptual_understanding: number;
  systems_thinking: number;
  judgment: number;
}

export interface CategoryScores {
  technical: {
    overall: number;
    subscores: Record<string, number>;
  };
  emotional: {
    overall: number;
    subscores: Record<string, number>;
  };
  creative: {
    overall: number;
    subscores: Record<string, number>;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface AssessmentResults {
  session_id: string;
  user_id: string;
  archetype: string;
  archetype_confidence: ArchetypeConfidence;
  overall_score: number;
  dimensions: AssessmentDimensions;
  tier: AssessmentTier;
  flags: AssessmentFlags;
  recommendation: string;
  best_fit_roles: string[];
  analyzed_at: string;
  // Enhanced fields (Phase 1)
  personality_profile?: PersonalityProfile;
  ai_orchestration_scores?: AIOrchestrationScores;
  category_scores?: CategoryScores;
  badges?: Badge[];
  public_summary?: string;
  is_published?: boolean;
}
