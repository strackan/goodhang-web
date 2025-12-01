/**
 * Character Assessment Scoring Service
 *
 * Processes assessment answers to calculate:
 * 1. Attribute scores (STR, CON, DEX, INT, WIS, CHA) - 0-20 scale
 * 2. Alignment (9-point grid from Lawful↔Chaotic × Good↔Evil)
 * 3. Race (voting system from 6 race questions)
 * 4. Class (primary attribute + alignment mapping)
 */

import type { CharacterRace, CharacterClass, CharacterAlignment, ClassBranch } from '@/lib/types/database';
import {
  type Question,
  type QuestionOption,
  type Attribute,
  allCoreQuestions,
  strengthQuestions,
  constitutionQuestions,
  dexterityQuestions,
  intelligenceQuestions,
  wisdomQuestions,
  charismaQuestions,
  alignmentQuestions,
  raceQuestions,
} from './questions';
import {
  ATTRIBUTE_TO_BRANCH,
  BRANCH_ALIGNMENT_TO_CLASS,
  type AttributeScores,
  type AttributeName,
} from './types';

// ============================================================
// TYPES
// ============================================================

export interface AssessmentAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface AttributeResult {
  raw: number; // Sum of scores (0-20)
  normalized: number; // 0-100 scale for display
  questionsAnswered: number;
  maxPossible: number;
}

export interface AlignmentResult {
  lawfulScore: number; // Positive = lawful, negative = chaotic
  chaoticScore: number;
  goodScore: number; // Positive = good, negative = evil
  evilScore: number;
  alignment: CharacterAlignment;
}

export interface RaceResult {
  race: CharacterRace;
  votes: Record<CharacterRace, number>;
  confidence: number; // 0-1, how decisive the result was
}

export interface CharacterResult {
  attributes: Record<AttributeName, AttributeResult>;
  alignment: AlignmentResult;
  race: RaceResult;
  characterClass: CharacterClass;
  branch: ClassBranch;
  primaryAttribute: AttributeName;
  secondaryAttribute: AttributeName;
}

// ============================================================
// SCORING CONSTANTS
// ============================================================

const MAX_SCORE_PER_QUESTION = 4;
// 5 questions per attribute, max 4 points each = 20 max per attribute

// ============================================================
// MAIN SCORING FUNCTION
// ============================================================

/**
 * Calculate complete character results from assessment answers
 */
export function calculateCharacterResults(answers: AssessmentAnswer[]): CharacterResult {
  const attributes = calculateAttributes(answers);
  const alignment = calculateAlignment(answers);
  const raceResult = calculateRace(answers);

  // Get primary and secondary attributes
  const sortedAttributes = getSortedAttributes(attributes);
  const primaryAttribute = sortedAttributes[0]?.[0] ?? 'strength';
  const secondaryAttribute = sortedAttributes[1]?.[0] ?? 'constitution';

  // Determine class from primary attribute + alignment
  const branch = ATTRIBUTE_TO_BRANCH[primaryAttribute];
  const characterClass = BRANCH_ALIGNMENT_TO_CLASS[branch][alignment.alignment];

  return {
    attributes,
    alignment,
    race: raceResult,
    characterClass,
    branch,
    primaryAttribute,
    secondaryAttribute,
  };
}

// ============================================================
// ATTRIBUTE SCORING
// ============================================================

/**
 * Calculate all attribute scores from answers
 */
export function calculateAttributes(
  answers: AssessmentAnswer[]
): Record<AttributeName, AttributeResult> {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));

  return {
    strength: calculateSingleAttribute(strengthQuestions, answerMap, 'STR'),
    constitution: calculateSingleAttribute(constitutionQuestions, answerMap, 'CON'),
    dexterity: calculateSingleAttribute(dexterityQuestions, answerMap, 'DEX'),
    intelligence: calculateSingleAttribute(intelligenceQuestions, answerMap, 'INT'),
    wisdom: calculateSingleAttribute(wisdomQuestions, answerMap, 'WIS'),
    charisma: calculateSingleAttribute(charismaQuestions, answerMap, 'CHA'),
  };
}

/**
 * Calculate score for a single attribute
 */
function calculateSingleAttribute(
  questions: Question[],
  answerMap: Map<string, string>,
  _attributeCode: Attribute
): AttributeResult {
  let raw = 0;
  let questionsAnswered = 0;

  for (const question of questions) {
    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) continue;

    const option = question.options.find(o => o.id === selectedOptionId);
    if (!option) continue;

    raw += option.score ?? 0;
    questionsAnswered++;
  }

  const maxPossible = questionsAnswered * MAX_SCORE_PER_QUESTION;
  const normalized = maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;

  return {
    raw,
    normalized,
    questionsAnswered,
    maxPossible,
  };
}

/**
 * Get attributes sorted by raw score (highest first)
 */
function getSortedAttributes(
  attributes: Record<AttributeName, AttributeResult>
): [AttributeName, AttributeResult][] {
  const entries = Object.entries(attributes) as [AttributeName, AttributeResult][];
  return entries.sort((a, b) => b[1].raw - a[1].raw);
}

/**
 * Convert AttributeResult map to simple scores for class determination
 */
export function toSimpleScores(
  attributes: Record<AttributeName, AttributeResult>
): AttributeScores {
  return {
    strength: attributes.strength.raw,
    constitution: attributes.constitution.raw,
    dexterity: attributes.dexterity.raw,
    intelligence: attributes.intelligence.raw,
    wisdom: attributes.wisdom.raw,
    charisma: attributes.charisma.raw,
  };
}

// ============================================================
// ALIGNMENT SCORING
// ============================================================

/**
 * Calculate alignment from the 6 alignment questions
 *
 * Uses a 2-axis system:
 * - Order axis: lawful (positive) ↔ chaotic (negative)
 * - Moral axis: good (positive) ↔ evil (negative)
 *
 * Each axis maps to the 3x3 alignment grid based on thresholds.
 */
export function calculateAlignment(answers: AssessmentAnswer[]): AlignmentResult {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));

  let lawfulScore = 0;
  let chaoticScore = 0;
  let goodScore = 0;
  let evilScore = 0;

  for (const question of alignmentQuestions) {
    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) continue;

    const option = question.options.find(o => o.id === selectedOptionId);
    if (!option) continue;

    lawfulScore += option.lawful ?? 0;
    chaoticScore += option.chaotic ?? 0;
    goodScore += option.good ?? 0;
    evilScore += option.evil ?? 0;
  }

  // Calculate net scores for each axis
  const orderAxis = lawfulScore - chaoticScore;
  const moralAxis = goodScore - evilScore;

  // Determine alignment from axes
  const alignment = determineAlignmentFromAxes(orderAxis, moralAxis);

  return {
    lawfulScore,
    chaoticScore,
    goodScore,
    evilScore,
    alignment,
  };
}

/**
 * Map axis scores to 9-point alignment grid
 *
 * Order axis thresholds:
 *   >= 3: Lawful
 *   -2 to 2: Neutral
 *   <= -3: Chaotic
 *
 * Moral axis thresholds:
 *   >= 3: Good
 *   -2 to 2: Neutral
 *   <= -3: Evil
 */
function determineAlignmentFromAxes(orderAxis: number, moralAxis: number): CharacterAlignment {
  const orderPosition = orderAxis >= 3 ? 'L' : orderAxis <= -3 ? 'C' : 'N';
  const moralPosition = moralAxis >= 3 ? 'G' : moralAxis <= -3 ? 'E' : 'N';

  // Map to CharacterAlignment
  const alignmentKey = `${orderPosition}${moralPosition}` as const;

  const mapping: Record<string, CharacterAlignment> = {
    LG: 'LG',
    LN: 'LN',
    LE: 'LE',
    NG: 'NG',
    NN: 'TN', // True Neutral
    NE: 'NE',
    CG: 'CG',
    CN: 'CN',
    CE: 'CE',
  };

  return mapping[alignmentKey] ?? 'TN';
}

// ============================================================
// RACE SCORING
// ============================================================

/**
 * Calculate race from the 6 race questions using voting
 *
 * Each race question has A-F options, each mapping to a specific race.
 * The race with the most votes wins. Ties go to the earlier-defined race.
 */
export function calculateRace(answers: AssessmentAnswer[]): RaceResult {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));

  const votes: Record<CharacterRace, number> = {
    human: 0,
    elf: 0,
    dwarf: 0,
    halfling: 0,
    orc: 0,
    dragonborn: 0,
  };

  let totalVotes = 0;

  for (const question of raceQuestions) {
    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) continue;

    const option = question.options.find(o => o.id === selectedOptionId);
    if (!option?.race) continue;

    // Map the Race type from questions.ts to CharacterRace from database.ts
    const characterRace = option.race as CharacterRace;
    votes[characterRace]++;
    totalVotes++;
  }

  // Find the winning race
  const entries = Object.entries(votes) as [CharacterRace, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const winningRace = sorted[0]?.[0] ?? 'human';
  const winningVotes = sorted[0]?.[1] ?? 0;

  // Calculate confidence based on margin over second place
  const secondVotes = sorted[1]?.[1] ?? 0;
  const margin = winningVotes - secondVotes;
  const confidence = totalVotes > 0 ? margin / totalVotes : 0;

  return {
    race: winningRace,
    votes,
    confidence,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a question by ID
 */
export function getQuestionById(questionId: string): Question | undefined {
  return allCoreQuestions.find(q => q.id === questionId);
}

/**
 * Get an option from a question by ID
 */
export function getOptionById(question: Question, optionId: string): QuestionOption | undefined {
  return question.options.find(o => o.id === optionId);
}

/**
 * Validate that all required questions have been answered
 */
export function validateAnswers(answers: AssessmentAnswer[]): {
  valid: boolean;
  missingQuestions: string[];
  invalidAnswers: string[];
} {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));
  const missingQuestions: string[] = [];
  const invalidAnswers: string[] = [];

  for (const question of allCoreQuestions) {
    const selectedOptionId = answerMap.get(question.id);

    if (!selectedOptionId) {
      missingQuestions.push(question.id);
      continue;
    }

    const option = question.options.find(o => o.id === selectedOptionId);
    if (!option) {
      invalidAnswers.push(question.id);
    }
  }

  return {
    valid: missingQuestions.length === 0 && invalidAnswers.length === 0,
    missingQuestions,
    invalidAnswers,
  };
}

/**
 * Calculate partial results when not all questions are answered
 * Useful for showing progress during the assessment
 */
export function calculatePartialResults(answers: AssessmentAnswer[]): Partial<CharacterResult> {
  const attributes = calculateAttributes(answers);
  const hasAlignmentAnswers = answers.some(a => a.questionId.startsWith('ALIGN-'));
  const hasRaceAnswers = answers.some(a => a.questionId.startsWith('RACE-'));

  const result: Partial<CharacterResult> = {
    attributes,
  };

  if (hasAlignmentAnswers) {
    result.alignment = calculateAlignment(answers);
  }

  if (hasRaceAnswers) {
    result.race = calculateRace(answers);
  }

  // Only calculate class if we have enough data
  const sortedAttributes = getSortedAttributes(attributes);
  const topAttr = sortedAttributes[0];
  const secondAttr = sortedAttributes[1];

  if (topAttr && secondAttr && topAttr[1].questionsAnswered >= 3 && result.alignment) {
    const primaryAttribute = topAttr[0];
    const branch = ATTRIBUTE_TO_BRANCH[primaryAttribute];
    result.characterClass = BRANCH_ALIGNMENT_TO_CLASS[branch][result.alignment.alignment];
    result.branch = branch;
    result.primaryAttribute = primaryAttribute;
    result.secondaryAttribute = secondAttr[0];
  }

  return result;
}

// ============================================================
// SCORE DISPLAY HELPERS
// ============================================================

/**
 * Get a descriptive label for an attribute score
 */
export function getAttributeLabel(normalized: number): string {
  if (normalized >= 90) return 'Legendary';
  if (normalized >= 75) return 'Exceptional';
  if (normalized >= 60) return 'Strong';
  if (normalized >= 40) return 'Moderate';
  if (normalized >= 25) return 'Developing';
  return 'Minimal';
}

/**
 * Get bar width for visual display (capped at 100%)
 */
export function getAttributeBarWidth(normalized: number): number {
  return Math.min(100, Math.max(0, normalized));
}

/**
 * Format alignment for display
 */
export function formatAlignment(alignment: CharacterAlignment): string {
  const names: Record<CharacterAlignment, string> = {
    LG: 'Lawful Good',
    NG: 'Neutral Good',
    CG: 'Chaotic Good',
    LN: 'Lawful Neutral',
    TN: 'True Neutral',
    CN: 'Chaotic Neutral',
    LE: 'Lawful Evil',
    NE: 'Neutral Evil',
    CE: 'Chaotic Evil',
  };
  return names[alignment];
}

/**
 * Get alignment emoji
 */
export function getAlignmentEmoji(alignment: CharacterAlignment): string {
  const emojis: Record<CharacterAlignment, string> = {
    LG: '⚖️',
    NG: '💚',
    CG: '🦋',
    LN: '📜',
    TN: '☯️',
    CN: '🎲',
    LE: '🎭',
    NE: '🐍',
    CE: '🔥',
  };
  return emojis[alignment];
}
