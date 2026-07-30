/**
 * Classical (non-relativistic) string solver
 * 
 * Solves the 1D wave equation: ∂²y/∂t² = c² ∂²y/∂x² - γ ∂y/∂t
 * using the finite difference method with Verlet-like time stepping.
 */

import { StringState, StringParameters, BoundaryCondition, SimulationConfig, SimulationMetrics, waveSpeed } from './core';

export class ClassicalStringSolver {
  private config: SimulationConfig;
  private state: StringState;
  private prevY: Float64Array;
  private c: number; // wave speed

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
  initialize(profile: (x: number, L: number) => number): void {
    const { N, dx } = this.config;
    const { L } = this.config.params;
    
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * L;
      this.state.y[i] = profile(x, L);
      this.prevY[i] = this.state.y[i];
    }
    
    this.applyBoundaryConditions();
    this.state.t = 0;
  }

  /** Set boundary conditions */
  setBoundary(boundary: BoundaryCondition): void {
    this.config.boundary = boundary;
    this.applyBoundaryConditions();
  }

  /** Apply boundary conditions to current state */
  private applyBoundaryConditions(): void {
    const { y } = this.state;
    const N = y.length;
    const bc = this.config.boundary;

    switch (bc) {
      case 'fixed':
        y[0] = 0;
        y[N - 1] = 0;
        break;
      case 'free':
        // ∂y/∂x = 0 at boundaries → ghost points equal
        y[0] = y[1];
        y[N - 1] = y[N - 2];
        break;
      case 'mixed':
        y[0] = 0; // fixed left
        y[N - 1] = y[N - 2]; // free right
        break;
    }
  }

  /** Update parameters (recalculates wave speed) */
  setParameters(params: StringParameters): void {
    this.config.params = { ...params };
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

    // Store current as previous
    this.prevY.set(y);

    // Interior points: finite difference wave equation
    for (let i = 1; i < N - 1; i++) {
      const laplacian = y[i - 1] - 2 * y[i] + y[i + 1];
      
      if (damping > 0) {
        // Damped wave equation
        v[i] = (1 - damping) * v[i] + (courantSq / dt) * laplacian;
        y[i] = y[i] + dt * v[i];
      } else {
        // Standard wave equation (Verlet-like)
        const newY = 2 * y[i] - this.prevY[i] + courantSq * laplacian;
        v[i] = (newY - y[i]) / dt;
        y[i] = newY;
      }
    }

    this.applyBoundaryConditions();
    this.state.t += dt;
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
      fundamentalFreq: this.c / (2 * L),
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
}
