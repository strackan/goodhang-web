// Assessment Types for CS Skills Assessment - Backend
// Enhanced with 14 dimensions, personality typing, and badge system

export type QuestionType = 'open_ended' | 'scale' | 'multiple_choice';

// Enhanced with organization and executive_leadership dimensions
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
  | 'culture_fit'
  | 'organization'
  | 'executive_leadership';

export interface AssessmentQuestion {
  id: string;
  section: string;
  order: number;
  text: string;
  type: QuestionType;
  dimensions: ScoringDimension[];
  required: boolean;
  followUp?: string;
  mbti_dimension?: string; // E/I, S/N, T/F, J/P
  enneagram_indicator?: string; // stress_response, core_motivation, etc.
  sub_score?: string; // For AI orchestration sub-scores
  scoring_guidance?: string;
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

// Enhanced with 14 dimensions
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
  organization: number;
  executive_leadership: number;
}

export interface AssessmentFlags {
  red_flags: string[];
  green_flags: string[];
}

export type AssessmentTier = 'top_1' | 'benched' | 'passed';

export type ArchetypeConfidence = 'high' | 'medium' | 'low';

// MBTI Personality Types (all 16 types)
export type PersonalityType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

// Enneagram Types
export type EnneagramType =
  | 'Type 1' | 'Type 2' | 'Type 3' | 'Type 4' | 'Type 5'
  | 'Type 6' | 'Type 7' | 'Type 8' | 'Type 9';

export type CategoryType = 'technical' | 'emotional' | 'creative';

// Enhanced Results Types (Phase 1)
export interface PersonalityProfile {
  mbti: PersonalityType; // e.g., "INTJ"
  enneagram: EnneagramType; // e.g., "Type 5"
  traits: string[]; // e.g., ["Analytical", "Independent", "Strategic"]
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
    subscores: {
      technical: number;
      ai_readiness: number;
      organization: number;
      iq: number;
    };
  };
  emotional: {
    overall: number;
    subscores: {
      eq: number;
      empathy: number;
      self_awareness: number;
      executive_leadership: number;
      gtm: number;
    };
  };
  creative: {
    overall: number;
    subscores: {
      passions: number;
      culture_fit: number;
      personality: number;
      motivation: number;
    };
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
  detailed_summary?: string;
  is_published?: boolean;
}

// Database types for sessions
export interface AssessmentSession {
  id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  current_section?: string;
  current_question?: number;
  answers: Record<string, AssessmentAnswer>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  question_id: string;
  answer: string;
  answered_at: string;
}

// Badge definition for database
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'dimension' | 'category' | 'combo' | 'achievement';
  criteria: BadgeCriteria;
  created_at: string;
}

export interface BadgeCriteria {
  type: 'single_dimension' | 'multiple_dimensions' | 'category' | 'combo' | 'achievement';
  conditions: BadgeCondition[];
  requires_all?: boolean; // AND vs OR logic
}

export interface BadgeCondition {
  dimension?: ScoringDimension;
  category?: 'technical' | 'emotional' | 'creative';
  min_score?: number;
  max_score?: number;
  experience_years?: {
    min?: number;
    max?: number;
  };
  custom_check?: string; // For complex logic
}

// Lightning Round (Phase 2 prep)
export interface LightningRoundSession {
  id: string;
  user_id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'insane';
  questions_answered: number;
  correct_answers: number;
  time_seconds: number;
  score: number;
  completed_at?: string;
  created_at: string;
}

// API Request/Response types
export interface StartAssessmentRequest {
  user_id: string;
}

export interface StartAssessmentResponse {
  session_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress?: {
    current_section: string;
    current_question: number;
    total_questions: number;
    percentage: number;
  };
  config: AssessmentConfig;
}

export interface SubmitAnswerRequest {
  question_id: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  session_id: string;
  saved_at: string;
}

export interface CompleteAssessmentResponse {
  session_id: string;
  status: 'scoring' | 'completed';
  redirect_url: string;
}

export interface AssessmentStatusResponse {
  status: 'not_started' | 'in_progress' | 'completed';
  session_id?: string;
  progress?: {
    percentage: number;
    questions_answered: number;
    total_questions: number;
  };
  preview?: {
    overall_score: number;
    archetype: string;
  };
}
