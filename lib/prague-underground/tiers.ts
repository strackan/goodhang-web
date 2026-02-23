import type { Tier, BonusMultiplier, SecretAchievement } from './types';

export const TIERS: Tier[] = [
  {
    name: 'TOURIST',
    min: 0,
    max: 30,
    reward: 'You saw Prague. Prague did not see you. Reward: a polite nod.',
  },
  {
    name: 'DESCENDER',
    min: 31,
    max: 80,
    reward: 'You went below the surface. Respect. Reward: one drink of your choosing, purchased by the other person. No complaints.',
  },
  {
    name: 'SPELUNKER',
    min: 81,
    max: 150,
    reward: 'You found the real city beneath the postcard. Reward: dinner at a restaurant of your choice. The other person pays and says "you earned it."',
  },
  {
    name: 'PHANTOM',
    min: 151,
    max: 250,
    reward: 'You now know Prague better than most people who live there. Reward: a full day planned entirely by you. The other person follows without question, veto, or visible reluctance.',
  },
  {
    name: 'REVENANT',
    min: 251,
    max: Infinity,
    reward: 'You have been claimed by the underground. You may not fully return. Reward: the other person must agree to one future trip of your choosing \u2014 destination, duration, and itinerary \u2014 no questions, no vetoes, no "but what about the budget." You have earned this. The dead vouch for you.',
  },
];

export const BONUS_MULTIPLIERS: BonusMultiplier[] = [
  { multiplier: 1.5, description: 'You visited any site at night or during a candlelit tour' },
  { multiplier: 2, description: 'You surfed the Vltava (photographic evidence required, disbelief expected)' },
  { multiplier: 2, description: 'You ate pho at Sapa and genuinely could not explain how you got there' },
  { multiplier: 2, description: 'You found a room in U Sudu that your companion never found' },
  { multiplier: 3, description: 'You drank absinthe prepared correctly at Hemingway Bar and watched the louche form and felt something shift inside you' },
  { multiplier: 3, description: 'You sat alone in the Ghost Church and stayed longer than you planned to' },
];

export const SECRET_ACHIEVEMENTS: SecretAchievement[] = [
  { name: 'THE MONK', points: 50, description: 'Visit three ossuaries in a single trip.' },
  { name: 'THE GHOST', points: 25, description: 'Lose your companion for 20+ minutes underground.' },
  { name: 'THE KING', points: 30, description: 'Drink in a cellar older than 1400 and tell no one about it for 24 hours.' },
  { name: 'THE FORGER', points: 35, description: 'Visit the cave where medieval counterfeiters struck fake coins (Koneprusy).' },
  { name: 'THE GREEN FAIRY', points: 40, description: 'Complete a proper absinthe ritual and write down what the Green Fairy told you. Reveal it to no one until the flight home.' },
  { name: 'THE ERASED', points: 50, description: 'Stand in the field at Lidice among the 82 bronze children and say nothing for one full minute.' },
  { name: 'THE FORGOTTEN', points: 60, description: 'Find a Sudetenland grave with a German name and photograph it.' },
  { name: 'THE DESCENT', points: 100, description: 'Complete all eight parts of this guide. Every section. Photo proof for each.' },
];

export function getTierForPoints(points: number): Tier {
  for (const tier of TIERS) {
    if (points >= tier.min && points <= tier.max) {
      return tier;
    }
  }
  return TIERS[0]!;
}

export function getNextTier(points: number): Tier | null {
  const current = getTierForPoints(points);
  const idx = TIERS.indexOf(current);
  if (idx >= 0 && idx < TIERS.length - 1) {
    return TIERS[idx + 1] ?? null;
  }
  return null;
}
