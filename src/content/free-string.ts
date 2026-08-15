/**
 * T19: finite educational bookkeeping for a free bosonic closed string.
 *
 * This is deliberately a state explorer, not a quantum time-evolution
 * engine. It uses light-cone oscillator occupations for modes 1..4, with a
 * maximum occupation of 2 in each sector. The convention and truncation are
 * displayed beside the control in the documentation UI.
 */

export const T19_MODE_COUNT = 4;
export const T19_MAX_OCCUPATION = 2;
export const T19_ALPHA_PRIME = 1;

export type OccupationVector = readonly number[];

export interface T19State {
  id: string;
  label: string;
  left: OccupationVector;
  right: OccupationVector;
  description: string;
}

export interface T19StateSummary {
  leftLevel: number;
  rightLevel: number;
  levelMatched: boolean;
  occupationsValid: boolean;
  physicalInScope: boolean;
  massSquared: number | null;
  leftExcitations: number;
  rightExcitations: number;
}

export const T19_EXAMPLES: Readonly<Record<string, T19State>> = {
  vacuum: {
    id: 'vacuum',
    label: 'Ground state',
    left: [0, 0, 0, 0],
    right: [0, 0, 0, 0],
    description: 'The bosonic closed-string ground state; its negative mass-squared is the familiar tachyonic feature of this convention.',
  },
  massless: {
    id: 'massless',
    label: 'Matched mode-1 pair',
    left: [1, 0, 0, 0],
    right: [1, 0, 0, 0],
    description: 'One mode-1 excitation in each sector. It is level matched and massless in the declared alpha-prime convention.',
  },
  invalid: {
    id: 'invalid',
    label: 'Unequal levels (invalid)',
    left: [1, 0, 0, 0],
    right: [0, 1, 0, 0],
    description: 'The left sector has level 1 while the right sector has level 2, so this bounded example fails closed-string level matching.',
  },
  higher: {
    id: 'higher',
    label: 'Matched higher excitation',
    left: [1, 1, 0, 0],
    right: [1, 1, 0, 0],
    description: 'Matched mode-1 and mode-2 occupations in both sectors. This is a higher finite state, not a classical shape or a time-evolved wavepacket.',
  },
};

function validateOccupationVector(occupations: OccupationVector): boolean {
  return occupations.length === T19_MODE_COUNT
    && occupations.every(value => Number.isInteger(value) && value >= 0 && value <= T19_MAX_OCCUPATION);
}

export function levelNumber(occupations: OccupationVector): number {
  return occupations.reduce((level, occupation, index) => level + (index + 1) * occupation, 0);
}

export function excitationCount(occupations: OccupationVector): number {
  return occupations.reduce((total, occupation) => total + occupation, 0);
}

export function summarizeT19State(state: T19State): T19StateSummary {
  const occupationsValid = validateOccupationVector(state.left) && validateOccupationVector(state.right);
  const leftLevel = levelNumber(state.left);
  const rightLevel = levelNumber(state.right);
  const levelMatched = occupationsValid && leftLevel === rightLevel;
  return {
    leftLevel,
    rightLevel,
    levelMatched,
    occupationsValid,
    physicalInScope: occupationsValid && levelMatched,
    massSquared: occupationsValid && levelMatched
      ? (4 / T19_ALPHA_PRIME) * (leftLevel + rightLevel - 2)
      : null,
    leftExcitations: excitationCount(state.left),
    rightExcitations: excitationCount(state.right),
  };
}

export function getT19State(id: string): T19State {
  return T19_EXAMPLES[id] ?? T19_EXAMPLES.massless;
}

export function formatOccupations(occupations: OccupationVector): string {
  return occupations.map((occupation, index) => `n${index + 1}=${occupation}`).join(', ');
}
