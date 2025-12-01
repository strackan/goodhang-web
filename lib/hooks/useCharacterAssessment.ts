'use client';

/**
 * Character Assessment Hook
 *
 * Manages state for the D&D-style character assessment:
 * - Question progression through attribute, alignment, and race sections
 * - Answer tracking
 * - Real-time scoring
 * - Results calculation
 */

import { useState, useCallback, useMemo } from 'react';
import {
  allCoreQuestions,
  strengthQuestions,
  constitutionQuestions,
  dexterityQuestions,
  intelligenceQuestions,
  wisdomQuestions,
  charismaQuestions,
  alignmentQuestions,
  raceQuestions,
  type Question,
} from '@/lib/character/questions';
import {
  calculateCharacterResults,
  calculatePartialResults,
  type AssessmentAnswer,
  type CharacterResult,
} from '@/lib/character/scoring';

// ============================================================
// TYPES
// ============================================================

export type AssessmentSection = 'attributes' | 'alignment' | 'race' | 'complete';

export interface SectionInfo {
  id: AssessmentSection;
  title: string;
  description: string;
  questions: Question[];
  emoji: string;
}

export interface UseCharacterAssessmentReturn {
  // Current state
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  currentSection: SectionInfo | null;
  sectionProgress: number; // 0-100 within current section
  totalProgress: number; // 0-100 overall
  answers: AssessmentAnswer[];

  // Navigation
  canGoNext: boolean;
  canGoPrevious: boolean;
  isComplete: boolean;

  // Actions
  selectAnswer: (optionId: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestion: (questionIndex: number) => void;
  reset: () => void;

  // Results
  partialResults: Partial<CharacterResult> | null;
  finalResults: CharacterResult | null;
}

// ============================================================
// SECTION DEFINITIONS
// ============================================================

const attributeQuestions = [
  ...strengthQuestions,
  ...constitutionQuestions,
  ...dexterityQuestions,
  ...intelligenceQuestions,
  ...wisdomQuestions,
  ...charismaQuestions,
];

export const SECTIONS: SectionInfo[] = [
  {
    id: 'attributes',
    title: 'Your Stats',
    description: 'Answer honestly - there are no wrong answers, only your answers.',
    questions: attributeQuestions,
    emoji: '🎲',
  },
  {
    id: 'alignment',
    title: 'Your Compass',
    description: 'What guides your moral and ethical decisions?',
    questions: alignmentQuestions,
    emoji: '⚖️',
  },
  {
    id: 'race',
    title: 'Your Tribe',
    description: 'What kind of people do you vibe with?',
    questions: raceQuestions,
    emoji: '🌍',
  },
];

// ============================================================
// HOOK
// ============================================================

export function useCharacterAssessment(): UseCharacterAssessmentReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);

  // Get current question and section
  const currentQuestion = useMemo(() => {
    return allCoreQuestions[currentQuestionIndex] ?? null;
  }, [currentQuestionIndex]);

  const currentSection = useMemo(() => {
    if (!currentQuestion) return SECTIONS[2] ?? null; // Default to last section when complete

    // Find which section this question belongs to
    for (const section of SECTIONS) {
      if (section.questions.some(q => q.id === currentQuestion.id)) {
        return section;
      }
    }
    return null;
  }, [currentQuestion]);

  // Calculate progress
  const totalQuestions = allCoreQuestions.length;
  const answeredCount = answers.length;

  const totalProgress = useMemo(() => {
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  const sectionProgress = useMemo(() => {
    if (!currentSection) return 100;

    const sectionQuestionIds = new Set(currentSection.questions.map(q => q.id));
    const answeredInSection = answers.filter(a => sectionQuestionIds.has(a.questionId)).length;
    return Math.round((answeredInSection / currentSection.questions.length) * 100);
  }, [currentSection, answers]);

  // Check if current question is answered
  const currentAnswerOption = useMemo(() => {
    if (!currentQuestion) return null;
    const answer = answers.find(a => a.questionId === currentQuestion.id);
    return answer?.selectedOptionId ?? null;
  }, [currentQuestion, answers]);

  // Navigation flags
  const canGoNext = currentAnswerOption !== null;
  const canGoPrevious = currentQuestionIndex > 0;
  const isComplete = answeredCount >= totalQuestions;

  // Calculate results
  const partialResults = useMemo(() => {
    if (answers.length === 0) return null;
    return calculatePartialResults(answers);
  }, [answers]);

  const finalResults = useMemo(() => {
    if (!isComplete) return null;
    return calculateCharacterResults(answers);
  }, [isComplete, answers]);

  // Actions
  const selectAnswer = useCallback((optionId: string) => {
    if (!currentQuestion) return;

    setAnswers(prev => {
      // Remove existing answer for this question if any
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, { questionId: currentQuestion.id, selectedOptionId: optionId }];
    });
  }, [currentQuestion]);

  const goToNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }, [totalQuestions]);

  const reset = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
  }, []);

  return {
    currentQuestion,
    currentQuestionIndex,
    currentSection,
    sectionProgress,
    totalProgress,
    answers,
    canGoNext,
    canGoPrevious,
    isComplete,
    selectAnswer,
    goToNext,
    goToPrevious,
    goToQuestion,
    reset,
    partialResults,
    finalResults,
  };
}
