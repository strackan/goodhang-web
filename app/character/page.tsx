'use client';

/**
 * D&D Character Assessment Page
 *
 * Interactive assessment that determines:
 * - 6 Attributes (STR, CON, DEX, INT, WIS, CHA)
 * - Alignment (9-point grid)
 * - Race (6 options)
 * - Class (54 subclasses based on attributes + alignment)
 */

import { useCharacterAssessment, SECTIONS } from '@/lib/hooks/useCharacterAssessment';
import { CharacterQuestionCard } from '@/components/character/CharacterQuestionCard';
import { CharacterResults } from '@/components/character/CharacterResults';
import { cn } from '@/lib/utils';

export default function CharacterAssessmentPage() {
  const {
    currentQuestion,
    currentQuestionIndex,
    currentSection,
    totalProgress,
    answers,
    canGoNext,
    canGoPrevious,
    isComplete,
    selectAnswer,
    goToNext,
    goToPrevious,
    reset,
    finalResults,
  } = useCharacterAssessment();

  // Get current answer for this question
  const currentAnswer = currentQuestion
    ? answers.find(a => a.questionId === currentQuestion.id)?.selectedOptionId
    : null;

  // Show results when complete
  if (isComplete && finalResults) {
    return <CharacterResults results={finalResults} onRetake={reset} />;
  }

  // Show loading if no question
  if (!currentQuestion || !currentSection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = 42;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30">
        {/* Section indicators */}
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            {SECTIONS.map((section, idx) => {
              const sectionStart = SECTIONS.slice(0, idx).reduce((sum, s) => sum + s.questions.length, 0);
              const isCurrentSection = section.id === currentSection.id;
              const isCompleted = currentQuestionIndex >= sectionStart + section.questions.length;
              const isPast = currentQuestionIndex >= sectionStart;

              return (
                <div key={section.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                      isCurrentSection
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : isPast
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-900 text-gray-500'
                    )}
                  >
                    <span>{section.emoji}</span>
                    <span className="hidden sm:inline">{section.title}</span>
                  </div>
                  {idx < SECTIONS.length - 1 && (
                    <div
                      className={cn(
                        'h-px w-4',
                        isCompleted ? 'bg-green-500' : 'bg-gray-700'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-purple-400">{totalProgress}% Complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section header (on section change) */}
          {currentSection.questions[0]?.id === currentQuestion.id && (
            <div className="mb-8 text-center animate-fade-in">
              <span className="text-4xl mb-4 block">{currentSection.emoji}</span>
              <h1 className="text-2xl font-bold text-white mb-2">{currentSection.title}</h1>
              <p className="text-gray-400">{currentSection.description}</p>
            </div>
          )}

          {/* Question Card */}
          <CharacterQuestionCard
            question={currentQuestion}
            selectedOptionId={currentAnswer ?? undefined}
            onSelectOption={selectAnswer}
            onNext={goToNext}
            onPrevious={goToPrevious}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>
    </div>
  );
}
