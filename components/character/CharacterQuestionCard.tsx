'use client';

/**
 * Character Question Card Component
 *
 * Displays a multiple-choice question with:
 * - Question title and prompt
 * - Option buttons (A, B, C, D, E, F)
 * - Navigation controls
 * - Keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';
import { type Question } from '@/lib/character/questions';
import { cn } from '@/lib/utils';

interface CharacterQuestionCardProps {
  question: Question;
  selectedOptionId: string | undefined;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export function CharacterQuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  questionNumber,
  totalQuestions,
}: CharacterQuestionCardProps) {
  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // A-F keys to select options
      const key = e.key.toUpperCase();
      const optionIndex = key.charCodeAt(0) - 65; // A=0, B=1, etc.

      if (optionIndex >= 0 && optionIndex < question.options.length) {
        const option = question.options[optionIndex];
        if (option) {
          onSelectOption(option.id);
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowRight' && canGoNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && canGoPrevious) {
        onPrevious();
      }

      // Enter to proceed
      if (e.key === 'Enter' && canGoNext) {
        onNext();
      }
    },
    [question.options, onSelectOption, onNext, onPrevious, canGoNext, canGoPrevious]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-advance after selection (with slight delay for visual feedback)
  const handleSelectOption = (optionId: string) => {
    onSelectOption(optionId);

    // Auto-advance after 300ms if not already selected
    if (selectedOptionId !== optionId) {
      setTimeout(() => {
        onNext();
      }, 400);
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 md:p-8"
      role="region"
      aria-label={`Question ${questionNumber} of ${totalQuestions}`}
    >
      {/* Question Title */}
      {question.title && (
        <div className="mb-2">
          <span className="text-sm text-purple-400 font-mono uppercase tracking-wide">
            {question.title}
          </span>
        </div>
      )}

      {/* Question Prompt */}
      <h2 className="text-lg md:text-xl text-white leading-relaxed mb-6 whitespace-pre-line">
        {question.prompt}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D, E, F
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={cn(
                'w-full text-left px-4 py-4 rounded-lg border-2 transition-all duration-200',
                'hover:border-purple-500 hover:bg-purple-500/10',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                'group relative',
                isSelected
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:text-white'
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                {/* Letter badge */}
                <span
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400 group-hover:bg-purple-500/50 group-hover:text-white'
                  )}
                >
                  {letter}
                </span>

                {/* Option text */}
                <span className="flex-1 text-sm md:text-base leading-relaxed pt-1">
                  {option.text}
                </span>

                {/* Selection indicator */}
                {isSelected && (
                  <span className="flex-shrink-0 text-purple-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            'px-5 py-2.5 rounded-lg font-medium transition-all',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900',
            canGoPrevious
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-gray-900 text-gray-600 cursor-not-allowed'
          )}
          aria-label="Previous question"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </span>
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            'px-6 py-2.5 rounded-lg font-semibold transition-all',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900',
            canGoNext
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/50'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          )}
          aria-label="Next question"
        >
          <span className="flex items-center gap-2">
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 mx-1">A</kbd>-
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 mx-1">
            {String.fromCharCode(64 + question.options.length)}
          </kbd>
          to select, <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 mx-1">Enter</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 mx-1">→</kbd> to proceed
        </p>
      </div>
    </div>
  );
}
