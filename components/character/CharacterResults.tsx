'use client';

/**
 * Character Results Component
 *
 * Displays the calculated D&D character after assessment:
 * - Race with emoji and description
 * - Class with alignment
 * - Attribute scores with visual bars
 * - Alignment grid position
 */

import { type CharacterResult } from '@/lib/character/scoring';
import {
  RACE_DEFINITIONS,
  CLASS_DISPLAY_NAMES,
  ALIGNMENT_DEFINITIONS,
  formatDisplayTitle,
} from '@/lib/character/types';
import { getAttributeLabel, formatAlignment, getAlignmentEmoji } from '@/lib/character/scoring';
import { cn } from '@/lib/utils';

interface CharacterResultsProps {
  results: CharacterResult;
  onRetake: () => void;
}

const ATTRIBUTE_NAMES: Record<string, string> = {
  strength: 'Strength',
  constitution: 'Constitution',
  dexterity: 'Dexterity',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
};

const ATTRIBUTE_COLORS: Record<string, string> = {
  strength: 'from-red-500 to-orange-500',
  constitution: 'from-green-500 to-emerald-500',
  dexterity: 'from-yellow-500 to-amber-500',
  intelligence: 'from-blue-500 to-cyan-500',
  wisdom: 'from-purple-500 to-violet-500',
  charisma: 'from-pink-500 to-rose-500',
};

export function CharacterResults({ results, onRetake }: CharacterResultsProps) {
  const raceDef = RACE_DEFINITIONS[results.race.race];
  const alignmentDef = ALIGNMENT_DEFINITIONS[results.alignment.alignment];
  const className = CLASS_DISPLAY_NAMES[results.characterClass];
  const displayTitle = formatDisplayTitle(results.race.race, results.characterClass, null);

  // Sort attributes by score for display
  const sortedAttributes = Object.entries(results.attributes).sort(
    (a, b) => b[1].normalized - a[1].normalized
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="text-6xl mb-4">{raceDef.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            {displayTitle}
          </h1>
          <p className="text-xl text-gray-400 mb-2">{raceDef.tagline}</p>
          <div className="flex items-center justify-center gap-3 text-lg">
            <span className="text-purple-400">{getAlignmentEmoji(results.alignment.alignment)}</span>
            <span className="text-gray-300">{formatAlignment(results.alignment.alignment)}</span>
          </div>
        </div>

        {/* Character Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Race Card */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{raceDef.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{raceDef.name}</h2>
                <p className="text-sm text-purple-400">Your Race</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{raceDef.description}</p>

            {/* Race confidence */}
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Match confidence</span>
                <span>{Math.round(results.race.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${Math.max(20, results.race.confidence * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Class Card */}
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getAlignmentEmoji(results.alignment.alignment)}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{className}</h2>
                <p className="text-sm text-blue-400">Your Class</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{alignmentDef.description}</p>

            {/* Class derivation */}
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 bg-gray-800 rounded">
                  Primary: {ATTRIBUTE_NAMES[results.primaryAttribute]}
                </span>
                <span>+</span>
                <span className="px-2 py-1 bg-gray-800 rounded">
                  {alignmentDef.shortName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attributes Section */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎲</span>
            <span>Your Attributes</span>
          </h2>

          <div className="space-y-4">
            {sortedAttributes.map(([key, value]) => {
              const attrKey = key as keyof typeof ATTRIBUTE_NAMES;
              const colorClass = ATTRIBUTE_COLORS[attrKey] ?? 'from-gray-500 to-gray-600';
              const label = getAttributeLabel(value.normalized);
              const isPrimary = key === results.primaryAttribute;
              const isSecondary = key === results.secondaryAttribute;

              return (
                <div key={key} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {ATTRIBUTE_NAMES[attrKey]}
                      </span>
                      {isPrimary && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-500/30 text-purple-300 rounded">
                          Primary
                        </span>
                      )}
                      {isSecondary && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-500/30 text-blue-300 rounded">
                          Secondary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className="text-sm font-mono text-white">{value.raw}/20</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                        colorClass
                      )}
                      style={{ width: `${value.normalized}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alignment Grid */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⚖️</span>
            <span>Your Alignment</span>
          </h2>

          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {(['L', 'N', 'C'] as const).map((order) =>
              (['G', 'N', 'E'] as const).map((moral) => {
                const alignKey = order === 'N' && moral === 'N' ? 'TN' : `${order}${moral}`;
                const isActive = alignKey === results.alignment.alignment;
                const def = ALIGNMENT_DEFINITIONS[alignKey as keyof typeof ALIGNMENT_DEFINITIONS];

                return (
                  <div
                    key={`${order}${moral}`}
                    className={cn(
                      'aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all',
                      isActive
                        ? 'bg-purple-500/30 border-2 border-purple-500 text-white scale-105'
                        : 'bg-gray-800/50 border border-gray-700/50 text-gray-500'
                    )}
                  >
                    <span className="text-lg mb-1">{isActive ? getAlignmentEmoji(def.id) : ''}</span>
                    <span className="text-xs font-medium">{def.shortName}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">{alignmentDef.tagline}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Retake Assessment
          </button>
          <button
            onClick={() => {
              // TODO: Save to profile
              alert('Save to profile coming soon!');
            }}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
          >
            Save to My Profile
          </button>
        </div>

        {/* Share section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Share your character</p>
          <div className="flex justify-center gap-3">
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
