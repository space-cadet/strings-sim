/**
 * Relativistic string solver
 *
 * In the conformal gauge, the Nambu-Goto action reduces to the wave equation
 * with wave speed c = 1 (speed of light in natural units):
 *
 *   ∂²y/∂t² = ∂²y/∂x²
 *
 * The Virasoro constraints are automatically satisfied for transverse oscillations
 * in the linearized approximation.
 *
 * For relativistic strings, tension τ and mass density μ are related by
 * τ = μ c², so the wave speed is always c = √(τ/μ) = 1.
 */

import { StringState, StringParameters, BoundaryCondition, SimulationConfig, SimulationMetrics, stableTimeStep } from './core';

export interface WorldsheetPoint {
  t: number;
  x: number;
  y: number;
}

interface HistorySample {
  t: number;
  y: Float64Array;
}

export interface RelativisticStringState extends StringState {
  /** Worldsheet history for visualization */
  worldsheet: WorldsheetPoint[][];
  /** Endpoint velocities (for Neumann BCs) */
  endpointVelocities: { left: number; right: number };
}

export class RelativisticStringSolver {
  private config: SimulationConfig;
  private state: RelativisticStringState;
  private prevY: Float64Array;
  private history: HistorySample[] = [];
  private maxHistory: number = 200; // Number of time steps to keep for worldsheet

  constructor(config: SimulationConfig) {
    this.config = { ...config };
    // Force relativistic parameters: c = 1, no damping
    this.config.params = {
      ...config.params,
      tau: 1.0,  // In natural units, τ = 1
      mu: 1.0,   // and μ = 1, so c = √(τ/μ) = 1
      gamma: 0.0, // No intrinsic damping for relativistic strings
    };

    const N = config.N;
    this.state = {
      y: new Float64Array(N),
      v: new Float64Array(N),
      t: 0,
      worldsheet: [],
      endpointVelocities: { left: 0, right: 0 },
    };
    this.prevY = new Float64Array(N);
  }

  /** Initialize with a given displacement profile */
  initialize(profile: (x: number, L: number) => number, velocity?: (x: number, L: number) => number): void {
    const { N } = this.config;
    const { L } = this.config.params;

    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * L;
      this.state.y[i] = profile(x, L);
      this.state.v[i] = velocity?.(x, L) ?? 0;
    }

    this.applyBoundaryConditions();
    for (let i = 0; i < N; i++) {
      this.prevY[i] = this.state.y[i] - this.config.dt * this.state.v[i];
    }
    this.state.t = 0;
    this.history = [{ t: 0, y: new Float64Array(this.state.y) }];
    this.buildWorldsheet();
  }

  /** Set boundary conditions */
  setBoundary(boundary: BoundaryCondition): void {
    this.config.boundary = boundary;
    this.applyBoundaryConditions();
  }

  /** Update parameters (relativistic: fixes tau=mu=1, gamma=0) */
  setParameters(params: StringParameters): void {
    this.config.params = {
      ...params,
      tau: 1.0,
      mu: 1.0,
      gamma: 0.0,
    };
    this.config.dx = params.L / (this.config.N - 1);
    this.config.dt = stableTimeStep(this.config.dx, this.config.params, 'relativistic');
  }

  /** Apply boundary conditions to current state */
  private applyBoundaryConditions(): void {
    const { y, v } = this.state;
    const N = y.length;
    const bc = this.config.boundary;

    switch (bc) {
      case 'fixed':
        // Dirichlet: endpoints fixed (attached to D-branes)
        y[0] = 0;
        y[N - 1] = 0;
        v[0] = 0;
        v[N - 1] = 0;
        break;
      case 'free':
        // Neumann: endpoints free to move at speed of light
        // ∂y/∂x = 0 at boundaries → ghost points equal
        y[0] = y[1];
        y[N - 1] = y[N - 2];
        v[0] = v[1];
        v[N - 1] = v[N - 2];
        break;
      case 'mixed':
        y[0] = 0; // fixed left (Dirichlet)
        y[N - 1] = y[N - 2]; // free right (Neumann)
        v[0] = 0;
        v[N - 1] = v[N - 2];
        break;
    }
  }

  /** Single time step using central differences (c = 1) */
  step(): void {
    const { y, v } = this.state;
    const { N, dt, dx } = this.config;

    // Courant number for c = 1
    const courantSq = (dt / dx) ** 2;

    // Stability check: for c = 1, need dt <= dx
    if (courantSq > 1) {
      console.warn(`Relativistic string: Courant condition violated (${courantSq.toFixed(2)} > 1)`);
    }

    // Preserve the preceding state for the central-difference update.
    const currentY = new Float64Array(y);

    // Interior points: finite difference wave equation with c = 1
    for (let i = 1; i < N - 1; i++) {
      // Evaluate every stencil from one immutable time slice. Updating in
      // place couples the new left neighbour into this point and produces an
      // unstable directional scheme even when the Courant condition is met.
      const laplacian = currentY[i - 1] - 2 * currentY[i] + currentY[i + 1];

      // Verlet-like integration for undamped wave equation
      const newY = 2 * currentY[i] - this.prevY[i] + courantSq * laplacian;
      v[i] = (newY - currentY[i]) / dt;
      y[i] = newY;
    }

    this.applyBoundaryConditions();
    this.prevY.set(currentY);
    this.state.t += dt;

    // Compute endpoint velocities
    this.state.endpointVelocities = {
      left: (y[0] - this.prevY[0]) / dt,
      right: (y[N - 1] - this.prevY[N - 1]) / dt,
    };

    this.history.push({ t: this.state.t, y: new Float64Array(y) });
    if (this.history.length > this.maxHistory) this.history.shift();

    // Build worldsheet from history
    this.buildWorldsheet();
  }

  /** Build worldsheet representation for visualization */
  private buildWorldsheet(): void {
    const { N, dx } = this.config;
    const { L } = this.config.params;
    const history = this.history;

    const worldsheet: WorldsheetPoint[][] = [];

    // Create parametric lines: for each spatial point, trace its history in time
    for (let i = 0; i < N; i += Math.max(1, Math.floor(N / 50))) {
      const line: WorldsheetPoint[] = [];
      const x = (i / (N - 1)) * L;

      for (let h = 0; h < history.length; h++) {
        const sample = history[h];
        line.push({ t: sample.t, x, y: sample.y[i] });
      }

      worldsheet.push(line);
    }

    this.state.worldsheet = worldsheet;
  }

  /** Multiple steps */
  stepN(n: number): void {
    for (let i = 0; i < n; i++) {
      this.step();
    }
  }

  /** Get current state */
  getState(): RelativisticStringState {
    return this.state;
  }

  /** Calculate relativistic energy and momentum */
  getMetrics(): SimulationMetrics {
    const { y, v } = this.state;
    const { dx } = this.config;
    const { L } = this.config.params;
    const N = y.length;

    // For relativistic strings in natural units (c = 1, α' = 1):
    // Energy density: E = ½[(∂y/∂t)² + (∂y/∂x)²]
    // This is the Nambu-Goto energy in the conformal gauge

    let totalEnergy = 0;
    let kineticEnergy = 0;
    let potentialEnergy = 0;

    for (let i = 1; i < N; i++) {
      const slope = (y[i] - y[i - 1]) / dx;
      const vel = v[i];

      const ke = 0.5 * vel ** 2 * dx;
      const pe = 0.5 * slope ** 2 * dx;

      kineticEnergy += ke;
      potentialEnergy += pe;
      totalEnergy += ke + pe;
    }

    return {
      totalEnergy,
      kineticEnergy,
      potentialEnergy,
      waveSpeed: 1.0, // Always 1 in natural units
      fundamentalFreq: this.config.boundary === 'mixed' ? 0.25 / L : 0.5 / L,
    };
  }

  /** Get spatial coordinates for rendering */
  getSpatialCoords(): Float64Array {
    const { N } = this.config;
    const { L } = this.config.params;
    const coords = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      coords[i] = (i / (N - 1)) * L;
    }
    return coords;
  }

  /** Get worldsheet bounds for visualization */
  getWorldsheetBounds(): { tMin: number; tMax: number; yMin: number; yMax: number } {
    const history = this.history;
    if (history.length === 0) {
      return { tMin: 0, tMax: 1, yMin: -1, yMax: 1 };
    }

    let yMin = Infinity;
    let yMax = -Infinity;

    for (const sample of history) {
      for (let i = 0; i < sample.y.length; i++) {
        yMin = Math.min(yMin, sample.y[i]);
        yMax = Math.max(yMax, sample.y[i]);
      }
    }

    const tMax = Math.max(this.config.dt, this.state.t);
    const tMin = Math.max(0, tMax - this.maxHistory * this.config.dt);

    const padding = Math.max((yMax - yMin) * 0.1, 0.05);
    return { tMin, tMax, yMin: yMin - padding, yMax: yMax + padding };
  }

  /** Check that no sampled transverse velocity exceeds c = 1. */
  checkCausality(): boolean {
    return this.state.v.every((velocity) => Math.abs(velocity) <= 1.0);
  }
}
