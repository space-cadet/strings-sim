/**
 * Classical (non-relativistic) string solver
 * 
 * Solves the 1D wave equation: ∂²y/∂t² = c² ∂²y/∂x² - γ ∂y/∂t
 * using the finite difference method with Verlet-like time stepping.
 */

import { StringState, StringParameters, BoundaryCondition, SimulationConfig, SimulationMetrics, stableTimeStep, waveSpeed } from './core';
import type { WorldsheetPoint } from './relativistic';

interface HistorySample {
  t: number;
  y: Float64Array;
}

export class ClassicalStringSolver {
  private config: SimulationConfig;
  private state: StringState;
  private prevY: Float64Array;
  private c: number; // wave speed
  private history: HistorySample[] = [];
  private readonly maxHistory = 200;

  constructor(config: SimulationConfig) {
    this.config = { ...config };
    this.c = waveSpeed(config.params);
    
    const N = config.N;
    this.state = {
      y: new Float64Array(N),
      v: new Float64Array(N),
      t: 0,
    };
    this.prevY = new Float64Array(N);
  }

  /** Initialize with a given displacement profile */
  initialize(profile: (x: number, L: number) => number, velocity?: (x: number, L: number) => number): void {
    const { N, dx } = this.config;
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
  }

  /** Set boundary conditions */
  setBoundary(boundary: BoundaryCondition): void {
    this.config.boundary = boundary;
    this.applyBoundaryConditions();
  }

  /** Apply boundary conditions to current state */
  private applyBoundaryConditions(): void {
    const { y, v } = this.state;
    const N = y.length;
    const bc = this.config.boundary;

    switch (bc) {
      case 'fixed':
        y[0] = 0;
        y[N - 1] = 0;
        v[0] = 0;
        v[N - 1] = 0;
        break;
      case 'free':
        // ∂y/∂x = 0 at boundaries → ghost points equal
        y[0] = y[1];
        y[N - 1] = y[N - 2];
        v[0] = v[1];
        v[N - 1] = v[N - 2];
        break;
      case 'mixed':
        y[0] = 0; // fixed left
        y[N - 1] = y[N - 2]; // free right
        v[0] = 0;
        v[N - 1] = v[N - 2];
        break;
    }
  }

  /** Update parameters (recalculates wave speed) */
  setParameters(params: StringParameters): void {
    this.config.params = { ...params };
    this.config.dx = params.L / (this.config.N - 1);
    this.config.dt = stableTimeStep(this.config.dx, params, 'classical');
    this.c = waveSpeed(params);
  }

  /** Single time step using central differences */
  step(): void {
    const { y, v } = this.state;
    const { N, dt, dx } = this.config;
    const { gamma } = this.config.params;
    const c = this.c;
    
    const courantSq = (c * dt / dx) ** 2;
    const damping = gamma * dt;

    // Keep the last completed state for the central-difference update.  Copying
    // it before calculating new positions would make prevY equal to y and turn
    // the Verlet update into a first-order step.
    const currentY = new Float64Array(y);

    // Interior points: finite difference wave equation
    for (let i = 1; i < N - 1; i++) {
      // All spatial differences must come from the same time slice. Reading
      // y[i - 1] here after it has been updated makes the method directional
      // and destroys the stability guarantee of the explicit scheme.
      const laplacian = currentY[i - 1] - 2 * currentY[i] + currentY[i + 1];
      
      if (damping > 0) {
        // Damped wave equation
        v[i] = (1 - damping) * v[i] + (courantSq / dt) * laplacian;
        y[i] = currentY[i] + dt * v[i];
      } else {
        // Standard wave equation (Verlet-like)
        const newY = 2 * currentY[i] - this.prevY[i] + courantSq * laplacian;
        v[i] = (newY - currentY[i]) / dt;
        y[i] = newY;
      }
    }

    this.applyBoundaryConditions();
    this.prevY.set(currentY);
    this.state.t += dt;
    this.history.push({ t: this.state.t, y: new Float64Array(y) });
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  /** Multiple steps */
  stepN(n: number): void {
    for (let i = 0; i < n; i++) {
      this.step();
    }
  }

  /** Get current state */
  getState(): StringState {
    return this.state;
  }

  /** Calculate metrics */
  getMetrics(): SimulationMetrics {
    const { y, v } = this.state;
    const { dx } = this.config;
    const { mu, tau, L } = this.config.params;
    const N = y.length;

    let ke = 0; // kinetic energy: ½ μ ∫ v² dx
    let pe = 0; // potential energy: ½ τ ∫ (∂y/∂x)² dx

    for (let i = 0; i < N; i++) {
      ke += 0.5 * mu * v[i] ** 2 * dx;
    }

    for (let i = 1; i < N; i++) {
      const slope = (y[i] - y[i - 1]) / dx;
      pe += 0.5 * tau * slope ** 2 * dx;
    }

    return {
      totalEnergy: ke + pe,
      kineticEnergy: ke,
      potentialEnergy: pe,
      waveSpeed: this.c,
      fundamentalFreq: this.config.boundary === 'mixed' ? this.c / (4 * L) : this.c / (2 * L),
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

  /** Sampled classical spacetime history for the worldsheet display. */
  getWorldsheet(): WorldsheetPoint[][] {
    const { N } = this.config;
    const { L } = this.config.params;
    const stride = Math.max(1, Math.floor(N / 50));
    const worldsheet: WorldsheetPoint[][] = [];

    for (let i = 0; i < N; i += stride) {
      const x = (i / (N - 1)) * L;
      worldsheet.push(this.history.map(sample => ({ t: sample.t, x, y: sample.y[i] })));
    }
    return worldsheet;
  }

  getWorldsheetBounds(): { tMin: number; tMax: number; yMin: number; yMax: number } {
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const sample of this.history) {
      for (const value of sample.y) {
        yMin = Math.min(yMin, value);
        yMax = Math.max(yMax, value);
      }
    }
    if (!Number.isFinite(yMin)) return { tMin: 0, tMax: 1, yMin: -1, yMax: 1 };
    const padding = Math.max((yMax - yMin) * 0.1, 0.05);
    const tMax = Math.max(this.config.dt, this.state.t);
    return {
      tMin: Math.max(0, tMax - this.maxHistory * this.config.dt),
      tMax,
      yMin: yMin - padding,
      yMax: yMax + padding,
    };
  }
}
