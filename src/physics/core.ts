/**
 * Core physics types and interfaces for string simulation
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface StringState {
  /** Displacement at each spatial grid point */
  y: Float64Array;
  /** Velocity at each spatial grid point */
  v: Float64Array;
  /** Time */
  t: number;
}

export interface StringParameters {
  /** String length */
  L: number;
  /** Tension */
  tau: number;
  /** Linear mass density */
  mu: number;
  /** Damping coefficient */
  gamma: number;
}

export type BoundaryCondition = 'fixed' | 'free' | 'mixed';

export type PhysicsMode = 'classical' | 'relativistic';

export interface SimulationConfig {
  /** Number of spatial grid points */
  N: number;
  /** Time step */
  dt: number;
  /** Spatial step */
  dx: number;
  /** Physics mode */
  mode: PhysicsMode;
  /** Boundary condition */
  boundary: BoundaryCondition;
  /** String parameters */
  params: StringParameters;
}

export interface SimulationMetrics {
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
  waveSpeed: number;
  fundamentalFreq: number;
}

/** Initial condition preset function */
export type InitialCondition = (x: number, L: number) => number;

/** Compute wave speed from parameters: c = sqrt(tau / mu) */
export function waveSpeed(params: StringParameters): number {
  return Math.sqrt(params.tau / params.mu);
}

/** Compute fundamental frequency: f1 = c / (2L) for fixed ends */
export function fundamentalFrequency(params: StringParameters): number {
  return waveSpeed(params) / (2 * params.L);
}

/** Check Courant condition for stability: dt <= dx / c */
export function checkStability(config: SimulationConfig): boolean {
  const c = waveSpeed(config.params);
  return config.dt <= config.dx / c;
}
