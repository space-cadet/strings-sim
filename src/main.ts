/**
 * Main application entry point
 * Orchestrates physics simulation, rendering, and UI
 */

import { SimulationConfig, StringParameters, BoundaryCondition, PhysicsMode } from './physics/core';
import { ClassicalStringSolver } from './physics/classical';
import { StringRenderer } from './visualization/renderer';
import { presets } from './ui/presets';

interface SavedSettings {
  mode: PhysicsMode;
  preset: string;
  boundary: BoundaryCondition;
  params: StringParameters;
  timeScale: number;
}

const SETTINGS_KEY = 'strings-sim-settings';

function loadSettings(): SavedSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSettings(settings: SavedSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

class StringSimulator {
  private solver: ClassicalStringSolver;
  private renderer: StringRenderer;
  private config: SimulationConfig;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private timeScale: number = 1.0;
  private stepsPerFrame: number = 4;

  // UI elements
  private btnPlay: HTMLButtonElement;
  private btnPause: HTMLButtonElement;
  private btnReset: HTMLButtonElement;
  private presetSelect: HTMLSelectElement;
  private boundarySelect: HTMLSelectElement;
  private modeButtons: NodeListOf<HTMLButtonElement>;

  constructor() {
    // Try to load saved settings
    const saved = loadSettings();

    const params: StringParameters = saved?.params ?? {
      L: 2.0,
      tau: 1.0,
      mu: 1.0,
      gamma: 0.0,
    };

    const N = 256;
    const dx = params.L / (N - 1);
    const dt = dx / (2 * Math.sqrt(params.tau / params.mu));

    this.config = {
      N,
      dt,
      dx,
      mode: saved?.mode ?? 'classical',
      boundary: saved?.boundary ?? 'fixed',
      params,
    };

    this.timeScale = saved?.timeScale ?? 1.0;

    // Initialize solver
    this.solver = new ClassicalStringSolver(this.config);
    const presetName = saved?.preset ?? 'pluck';
    const preset = presets[presetName] || presets.pluck;
    this.solver.initialize((x, L) => preset(x, L));

    // Initialize renderer
    const canvas = document.getElementById('string-canvas') as HTMLCanvasElement;
    this.renderer = new StringRenderer({ canvas });
    this.renderer.setBounds(0, params.L, -0.5, 0.5);

    // Cache UI elements
    this.btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
    this.btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
    this.btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    this.presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
    this.boundarySelect = document.getElementById('boundary-select') as HTMLSelectElement;
    this.modeButtons = document.querySelectorAll('.mode-toggle button');

    // Restore UI state
    this.presetSelect.value = presetName;
    this.boundarySelect.value = this.config.boundary;
    this.modeButtons.forEach(btn => {
      const isActive = (btn.id === 'mode-relativistic' && this.config.mode === 'relativistic') ||
                       (btn.id === 'mode-classical' && this.config.mode === 'classical');
      btn.classList.toggle('active', isActive);
    });

    // Restore slider values
    this.setSliderValue('param-length', params.L, (v) => v.toFixed(1));
    this.setSliderValue('param-tension', params.tau, (v) => v.toFixed(1));
    this.setSliderValue('param-density', params.mu, (v) => v.toFixed(1));
    this.setSliderValue('param-damping', params.gamma, (v) => v.toFixed(2));
    this.setSliderValue('param-timescale', this.timeScale, (v) => `${v.toFixed(1)}×`);

    this.bindEvents();
    this.updateMetrics();
    this.render();
  }

  private setSliderValue(id: string, value: number, formatter?: (v: number) => string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    const valueSpan = document.getElementById(id.replace('param-', 'val-')) as HTMLSpanElement;
    if (input) input.value = String(value);
    if (valueSpan && formatter) valueSpan.textContent = formatter(value);
  }

  private bindEvents(): void {
    // Playback controls
    this.btnPlay.addEventListener('click', () => this.play());
    this.btnPause.addEventListener('click', () => this.pause());
    this.btnReset.addEventListener('click', () => this.reset());

    // Preset selection
    this.presetSelect.addEventListener('change', () => {
      this.reset();
      this.persist();
    });

    // Boundary conditions
    this.boundarySelect.addEventListener('change', () => {
      this.config.boundary = this.boundarySelect.value as BoundaryCondition;
      this.solver.setBoundary(this.config.boundary);
      this.reset();
      this.persist();
    });

    // Mode toggle
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.config.mode = btn.id === 'mode-relativistic' ? 'relativistic' : 'classical';
        this.persist();
      });
    });

    // Parameter sliders
    this.bindSlider('param-length', 'val-length', (val) => {
      this.config.params.L = val;
      this.solver.setParameters(this.config.params);
      this.renderer.setBounds(0, val, -0.5, 0.5);
      this.reset();
      this.persist();
    }, (v) => v.toFixed(1));

    this.bindSlider('param-tension', 'val-tension', (val) => {
      this.config.params.tau = val;
      this.solver.setParameters(this.config.params);
      this.persist();
    }, (v) => v.toFixed(1));

    this.bindSlider('param-density', 'val-density', (val) => {
      this.config.params.mu = val;
      this.solver.setParameters(this.config.params);
      this.persist();
    }, (v) => v.toFixed(1));

    this.bindSlider('param-damping', 'val-damping', (val) => {
      this.config.params.gamma = val;
      this.solver.setParameters(this.config.params);
      this.persist();
    }, (v) => v.toFixed(2));

    this.bindSlider('param-timescale', 'val-timescale', (val) => {
      this.timeScale = val;
      this.persist();
    }, (v) => `${v.toFixed(1)}×`);
  }

  private bindSlider(
    inputId: string,
    valueId: string,
    callback: (val: number) => void,
    formatter: (val: number) => string
  ): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const valueSpan = document.getElementById(valueId) as HTMLSpanElement;

    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      valueSpan.textContent = formatter(val);
      callback(val);
    });
  }

  private persist(): void {
    saveSettings({
      mode: this.config.mode,
      preset: this.presetSelect.value,
      boundary: this.config.boundary,
      params: this.config.params,
      timeScale: this.timeScale,
    });
  }

  private play(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  private pause(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private reset(): void {
    this.pause();
    const presetName = this.presetSelect.value;
    const preset = presets[presetName] || presets.pluck;
    this.solver.initialize((x, L) => preset(x, L));
    this.updateMetrics();
    this.render();
  }

  private loop(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Step physics
    const steps = Math.floor(this.stepsPerFrame * this.timeScale);
    this.solver.stepN(steps);

    // Update metrics every few frames
    if (Math.random() < 0.1) {
      this.updateMetrics();
    }

    // Render
    this.render();

    this.animationId = requestAnimationFrame(() => this.loop());
  }

  private render(): void {
    const state = this.solver.getState();
    const x = this.solver.getSpatialCoords();

    // Compute energy density for visualization
    const N = state.y.length;
    const energy = new Float64Array(N);

    for (let i = 1; i < N - 1; i++) {
      const v2 = state.v[i] ** 2;
      const slope = (state.y[i + 1] - state.y[i - 1]) / (2 * this.config.dx);
      energy[i] = 0.5 * this.config.params.mu * v2 + 0.5 * this.config.params.tau * slope ** 2;
    }

    this.renderer.render(x, state.y, energy);
  }

  private updateMetrics(): void {
    const metrics = this.solver.getMetrics();

    const energyEl = document.getElementById('metric-energy');
    const waveSpeedEl = document.getElementById('metric-wavespeed');
    const fundamentalEl = document.getElementById('metric-fundamental');

    if (energyEl) energyEl.textContent = metrics.totalEnergy.toFixed(3);
    if (waveSpeedEl) waveSpeedEl.textContent = metrics.waveSpeed.toFixed(3);
    if (fundamentalEl) fundamentalEl.textContent = metrics.fundamentalFreq.toFixed(3);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new StringSimulator();
});
