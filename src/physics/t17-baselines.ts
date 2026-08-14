/**
 * Reproducible T17 reference cases for the existing linearized solver.
 *
 * These cases deliberately use the current transverse wave model. They are
 * comparison fixtures for T18, not claims about nonlinear string dynamics.
 */

import { BoundaryCondition, SimulationConfig } from './core.js';
import { RelativisticStringSolver } from './relativistic.js';

export interface T17BaselineReport {
  id: string;
  boundary: BoundaryCondition;
  steps: number;
  initialEnergy: number;
  finalEnergy: number;
  relativeEnergyDrift: number;
  maxAbsDisplacement: number;
  maxTransverseSpeed: number;
  courantNumber: number;
  endpointClosureError: number;
}

export const T17_BASELINE_TOLERANCES = {
  /** Acceptance bound for the short reference runs below. */
  relativeEnergyDrift: 0.01,
  /** The periodic duplicate endpoint must remain identical. */
  periodicClosure: 1e-12,
  /** Reference amplitudes are intentionally kept in the small-displacement regime. */
  maxAbsDisplacement: 0.5,
  /** Natural-unit transverse speed safety check. */
  maxTransverseSpeed: 1,
} as const;

interface BaselineDefinition {
  id: string;
  boundary: BoundaryCondition;
  profile: (x: number, L: number) => number;
  velocity?: (x: number, L: number) => number;
}

const definitions: BaselineDefinition[] = [
  {
    id: 'fixed-fundamental',
    boundary: 'fixed',
    profile: (x, L) => 0.12 * Math.sin(Math.PI * x / L),
  },
  {
    id: 'free-fundamental',
    boundary: 'free',
    profile: (x, L) => 0.12 * Math.cos(Math.PI * x / L),
  },
  {
    id: 'periodic-mode',
    boundary: 'periodic',
    profile: (x, L) => 0.12 * Math.cos(2 * Math.PI * x / L),
    velocity: (x, L) => 0.04 * Math.sin(2 * Math.PI * x / L),
  },
  {
    id: 'mixed-velocity-bearing',
    boundary: 'mixed',
    profile: (x, L) => 0.1 * Math.sin(Math.PI * x / (2 * L)),
    velocity: (x, L) => 0.03 * Math.sin(Math.PI * x / L),
  },
];

export function getT17BaselineDefinitions(): readonly BaselineDefinition[] {
  return definitions;
}

export function runT17Baseline(id: string, steps = 512): T17BaselineReport {
  const definition = definitions.find(candidate => candidate.id === id);
  if (!definition) throw new Error(`Unknown T17 baseline: ${id}`);

  const N = 129;
  const L = 2;
  const dx = L / (N - 1);
  const config: SimulationConfig = {
    N,
    dt: dx / 2,
    dx,
    mode: 'relativistic',
    boundary: definition.boundary,
    params: { L, tau: 1, mu: 1, gamma: 0 },
  };
  const solver = new RelativisticStringSolver(config);
  solver.initialize(definition.profile, definition.velocity);

  const initialEnergy = solver.getMetrics().totalEnergy;
  solver.stepN(steps);
  const state = solver.getState();
  const finalEnergy = solver.getMetrics().totalEnergy;
  let maxAbsDisplacement = 0;
  let maxTransverseSpeed = 0;
  for (let i = 0; i < state.y.length; i++) {
    maxAbsDisplacement = Math.max(maxAbsDisplacement, Math.abs(state.y[i]));
    maxTransverseSpeed = Math.max(maxTransverseSpeed, Math.abs(state.v[i]));
  }

  return {
    id,
    boundary: definition.boundary,
    steps,
    initialEnergy,
    finalEnergy,
    relativeEnergyDrift: initialEnergy === 0 ? 0 : (finalEnergy - initialEnergy) / initialEnergy,
    maxAbsDisplacement,
    maxTransverseSpeed,
    courantNumber: config.dt / config.dx,
    endpointClosureError: definition.boundary === 'periodic'
      ? Math.max(Math.abs(state.y[0] - state.y[N - 1]), Math.abs(state.v[0] - state.v[N - 1]))
      : 0,
  };
}

/**
 * Apply the same periodic central-difference reference stencil to a unique
 * closed grid. T18 uses this for its small-amplitude comparison without
 * changing the public T17 solver contract, which retains a duplicate endpoint.
 */
export function evolveT17PeriodicReference(
  initialY: Float64Array,
  initialVelocity: Float64Array,
  L: number,
  steps: number,
  courant = 0.5,
): Float64Array {
  if (initialY.length !== initialVelocity.length) throw new Error('T17 reference arrays must have equal length.');
  const N = initialY.length;
  const dx = L / N;
  const dt = courant * dx;
  let current = new Float64Array(initialY);
  let previous = new Float64Array(N);
  for (let i = 0; i < N; i++) previous[i] = current[i] - dt * initialVelocity[i];

  for (let step = 0; step < steps; step++) {
    const next = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const left = current[(i - 1 + N) % N];
      const right = current[(i + 1) % N];
      next[i] = 2 * current[i] - previous[i] + courant ** 2 * (left - 2 * current[i] + right);
    }
    previous = current;
    current = next;
  }
  return current;
}
