/**
 * T19: finite educational bookkeeping for a free bosonic closed string.
 *
 * This is deliberately a finite educational model, not a general quantum
 * time-evolution engine. It uses light-cone oscillator occupations for modes
 * 1..4, with a maximum occupation of 2 in each sector. The convention,
 * finite Hamiltonian, and truncation are displayed beside the controls.
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

export interface T19ComplexAmplitude {
  re: number;
  im: number;
}

export interface T19SuperpositionTerm {
  stateId: string;
  amplitude: T19ComplexAmplitude;
}

export interface T19Superposition {
  id: string;
  label: string;
  components: readonly T19SuperpositionTerm[];
  description: string;
}

export interface T19EvolvedTerm {
  stateId: string;
  frequency: number;
  /** Argument of the complex coefficient, in radians. */
  phase: number;
  amplitude: T19ComplexAmplitude;
  probability: number;
}

export interface T19EvolvedState {
  time: number;
  terms: T19EvolvedTerm[];
  norm: number;
  levelMatched: boolean;
  cutoffWarning: string;
}

export const T19_FREE_HAMILTONIAN = 'H_free = N_L + N_R in dimensionless oscillator units';
export const T19_CUTOFF_WARNING = 'Finite teaching boundary: modes n = 1…4 and occupations 0…2 only. This is not the full string Hilbert space.';

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

export const T19_FREE_SUPERPOSITIONS: Readonly<Record<string, T19Superposition>> = {
  matchedPair: {
    id: 'matchedPair',
    label: 'Two matched states',
    components: [
      { stateId: 'massless', amplitude: { re: 1, im: 0 } },
      { stateId: 'higher', amplitude: { re: 0.7, im: 0.7 } },
    ],
    description: 'A normalized superposition of two level-matched examples. Free evolution changes their relative phase, while their basis-state probabilities remain fixed.',
  },
  groundAndMassless: {
    id: 'groundAndMassless',
    label: 'Ground + matched mode',
    components: [
      { stateId: 'vacuum', amplitude: { re: 1, im: 0 } },
      { stateId: 'massless', amplitude: { re: 1, im: 0 } },
    ],
    description: 'A simple phase-evolution example containing the ground state and a matched oscillator pair.',
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

export function freeHamiltonianFrequency(state: T19State): number {
  const summary = summarizeT19State(state);
  if (!summary.physicalInScope) throw new Error(`T19 cannot evolve invalid state ${state.id}.`);
  return summary.leftLevel + summary.rightLevel;
}

function amplitudeNormSquared(amplitude: T19ComplexAmplitude): number {
  return amplitude.re ** 2 + amplitude.im ** 2;
}

function normalizedAmplitude(amplitude: T19ComplexAmplitude, norm: number): T19ComplexAmplitude {
  return { re: amplitude.re / norm, im: amplitude.im / norm };
}

function validateSuperposition(superposition: T19Superposition): void {
  if (superposition.components.length === 0) throw new Error('A T19 superposition needs at least one component.');
  for (const component of superposition.components) {
    const state = T19_EXAMPLES[component.stateId];
    if (!state) throw new Error(`Unknown T19 state ${component.stateId}.`);
    if (!summarizeT19State(state).physicalInScope) {
      throw new Error(`T19 free evolution requires level-matched state ${component.stateId}.`);
    }
    if (!Number.isFinite(component.amplitude.re) || !Number.isFinite(component.amplitude.im)) {
      throw new Error(`T19 amplitude for ${component.stateId} must be finite.`);
    }
  }
}

export function getT19Superposition(id: string): T19Superposition {
  return T19_FREE_SUPERPOSITIONS[id] ?? T19_FREE_SUPERPOSITIONS.matchedPair;
}

export function normalizeT19Superposition(superposition: T19Superposition): T19Superposition {
  validateSuperposition(superposition);
  const normSquared = superposition.components.reduce(
    (sum, component) => sum + amplitudeNormSquared(component.amplitude),
    0,
  );
  if (!(normSquared > 0)) throw new Error('A T19 superposition must have non-zero norm.');
  const norm = Math.sqrt(normSquared);
  return {
    ...superposition,
    components: superposition.components.map(component => ({
      stateId: component.stateId,
      amplitude: normalizedAmplitude(component.amplitude, norm),
    })),
  };
}

/**
 * Evolve the bounded state with the declared dimensionless free Hamiltonian.
 * This is exact phase multiplication in the finite basis; no spatial string
 * profile or measurement density is inferred from the oscillator state.
 */
export function evolveT19FreeState(superposition: T19Superposition, time: number): T19EvolvedState {
  if (!Number.isFinite(time) || time < 0) throw new Error('T19 evolution time must be finite and non-negative.');
  const normalized = normalizeT19Superposition(superposition);
  const terms = normalized.components.map(component => {
    const frequency = freeHamiltonianFrequency(T19_EXAMPLES[component.stateId]);
    const phase = -frequency * time;
    const cosine = Math.cos(phase);
    const sine = Math.sin(phase);
    const re = component.amplitude.re * cosine - component.amplitude.im * sine;
    const im = component.amplitude.re * sine + component.amplitude.im * cosine;
    return {
      stateId: component.stateId,
      frequency,
      phase: Math.atan2(im, re),
      amplitude: { re, im },
      probability: re ** 2 + im ** 2,
    };
  });
  const norm = terms.reduce((sum, term) => sum + term.probability, 0);
  return {
    time,
    terms,
    norm,
    levelMatched: terms.every(term => summarizeT19State(T19_EXAMPLES[term.stateId]).levelMatched),
    cutoffWarning: T19_CUTOFF_WARNING,
  };
}

export function getT19State(id: string): T19State {
  return T19_EXAMPLES[id] ?? T19_EXAMPLES.massless;
}

export function formatOccupations(occupations: OccupationVector): string {
  return occupations.map((occupation, index) => `n${index + 1}=${occupation}`).join(', ');
}
