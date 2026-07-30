/**
 * Main application entry point
 * Orchestrates physics simulation, rendering, and UI
 */

import { SimulationConfig, StringParameters, BoundaryCondition, PhysicsMode, stableTimeStep } from './physics/core';
import { ClassicalStringSolver } from './physics/classical';
import { RelativisticStringSolver } from './physics/relativistic';
import { StringRenderer } from './visualization/renderer';
import { WorldsheetRenderer } from './visualization/worldsheet';
import { presets } from './ui/presets';

interface SavedSettings {
  mode: PhysicsMode;
  preset: string;
  boundary: BoundaryCondition;
  params: StringParameters;
  classicalParams?: StringParameters;
  timeScale: number;
  showWorldsheet?: boolean;
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
  private solver: ClassicalStringSolver | RelativisticStringSolver;
  private renderer: StringRenderer;
  private worldsheetRenderer: WorldsheetRenderer | null = null;
  private config: SimulationConfig;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private timeScale: number = 1.0;
  private stepsPerFrame: number = 4;
  private stepAccumulator: number = 0;
  private showWorldsheet: boolean = false;
  private classicalParams: StringParameters;

  // UI elements
  private btnPlay: HTMLButtonElement;
  private btnPause: HTMLButtonElement;
  private btnReset: HTMLButtonElement;
  private presetSelect: HTMLSelectElement;
  private boundarySelect: HTMLSelectElement;
  private modeButtons: NodeListOf<HTMLButtonElement>;
  private worldsheetToggle: HTMLButtonElement | null = null;

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
    const dt = stableTimeStep(dx, params, saved?.mode ?? 'classical');

    this.config = {
      N,
      dt,
      dx,
      mode: saved?.mode ?? 'classical',
      boundary: saved?.boundary ?? 'fixed',
      params,
    };

    this.timeScale = saved?.timeScale ?? 1.0;
    this.showWorldsheet = saved?.showWorldsheet ?? false;
    this.classicalParams = { ...(saved?.classicalParams ?? params) };

    // Initialize solver based on mode
    this.solver = this.createSolver();
    const presetName = saved?.preset ?? 'pluck';
    const preset = presets[presetName] || presets.pluck;
    this.initializePreset(preset);

    // Initialize renderer
    const canvas = document.getElementById('string-canvas') as HTMLCanvasElement;
    this.renderer = new StringRenderer({ canvas });
    this.renderer.setBounds(0, params.L, -0.5, 0.5);

    // Initialize worldsheet renderer if canvas exists
    const worldsheetCanvas = document.getElementById('worldsheet-canvas') as HTMLCanvasElement;
    if (worldsheetCanvas) {
      this.worldsheetRenderer = new WorldsheetRenderer({ canvas: worldsheetCanvas });
    }

    // Cache UI elements
    this.btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
    this.btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
    this.btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    this.presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
    this.boundarySelect = document.getElementById('boundary-select') as HTMLSelectElement;
    this.modeButtons = document.querySelectorAll('.mode-toggle button');
    this.worldsheetToggle = document.getElementById('btn-worldsheet') as HTMLButtonElement;

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
    this.updateModeUI();
    this.updateWorldsheetVisibility();
    this.updateMetrics();
    this.render();
  }

  private createSolver(): ClassicalStringSolver | RelativisticStringSolver {
    if (this.config.mode === 'relativistic') {
      return new RelativisticStringSolver(this.config);
    }
    return new ClassicalStringSolver(this.config);
  }

  private initializePreset(preset: (typeof presets)[string]): void {
    const speed = this.solver.getMetrics().waveSpeed;
    this.solver.initialize(
      (x, L) => preset.displacement(x, L),
      preset.velocity ? (x, L) => speed * preset.velocity!(x, L) : undefined,
    );
  }

  private updateDiscretization(): void {
    this.config.dx = this.config.params.L / (this.config.N - 1);
    this.config.dt = stableTimeStep(this.config.dx, this.config.params, this.config.mode);
  }

  private updateWorldsheetVisibility(): void {
    const canShow = this.config.mode === 'relativistic' && this.showWorldsheet;
    this.worldsheetToggle?.classList.toggle('active', canShow);
    const container = document.getElementById('worldsheet-container');
    if (container) container.style.display = canShow ? 'block' : 'none';
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
        const newMode = btn.id === 'mode-relativistic' ? 'relativistic' : 'classical';
        if (newMode !== this.config.mode) {
          this.switchMode(newMode);
        }
      });
    });

    // Worldsheet toggle
    if (this.worldsheetToggle) {
      this.worldsheetToggle.addEventListener('click', () => {
        this.showWorldsheet = !this.showWorldsheet;
        this.updateWorldsheetVisibility();
        this.persist();
      });
    }

    // Parameter sliders
    this.bindSlider('param-length', 'val-length', (val) => {
      this.config.params.L = val;
      if (this.config.mode === 'classical') this.classicalParams.L = val;
      this.updateDiscretization();
      this.solver.setParameters(this.config.params);
      this.renderer.setBounds(0, val, -0.5, 0.5);
      this.reset();
      this.persist();
    }, (v) => v.toFixed(1));

    this.bindSlider('param-tension', 'val-tension', (val) => {
      this.config.params.tau = val;
      this.classicalParams.tau = val;
      this.updateDiscretization();
      this.solver.setParameters(this.config.params);
      this.persist();
    }, (v) => v.toFixed(1));

    this.bindSlider('param-density', 'val-density', (val) => {
      this.config.params.mu = val;
      this.classicalParams.mu = val;
      this.updateDiscretization();
      this.solver.setParameters(this.config.params);
      this.persist();
    }, (v) => v.toFixed(1));

    this.bindSlider('param-damping', 'val-damping', (val) => {
      this.config.params.gamma = val;
      this.classicalParams.gamma = val;
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

  private switchMode(newMode: PhysicsMode): void {
    this.pause();
    if (this.config.mode === 'classical') {
      this.classicalParams = { ...this.config.params };
    }
    this.config.mode = newMode;

    // Relativistic strings use natural units: c = 1 and no damping. Restore
    // the user's classical parameters when they return to that mode.
    if (newMode === 'relativistic') {
      this.config.params = { ...this.config.params, tau: 1.0, mu: 1.0, gamma: 0.0 };
    } else {
      this.config.params = { ...this.classicalParams };
    }
    this.updateDiscretization();

    // Recreate solver
    this.solver = this.createSolver();
    this.reset();
    this.updateModeUI();
    this.updateWorldsheetVisibility();
    this.persist();
  }

  private updateModeUI(): void {
    const isRelativistic = this.config.mode === 'relativistic';
    document.body.classList.toggle('relativistic-mode', isRelativistic);

    // Disable tension and density sliders in relativistic mode
    const tensionInput = document.getElementById('param-tension') as HTMLInputElement;
    const densityInput = document.getElementById('param-density') as HTMLInputElement;
    const dampingInput = document.getElementById('param-damping') as HTMLInputElement;

    if (tensionInput) tensionInput.disabled = isRelativistic;
    if (densityInput) densityInput.disabled = isRelativistic;
    if (dampingInput) dampingInput.disabled = isRelativistic;

    // Keep control values in sync when returning to classical mode.
    this.setSliderValue('param-length', this.config.params.L, (v) => v.toFixed(1));
    this.setSliderValue('param-tension', this.config.params.tau, (v) => v.toFixed(1));
    this.setSliderValue('param-density', this.config.params.mu, (v) => v.toFixed(1));
    this.setSliderValue('param-damping', this.config.params.gamma, (v) => v.toFixed(2));

    // Show/hide worldsheet toggle
    if (this.worldsheetToggle) {
      this.worldsheetToggle.style.display = isRelativistic ? 'inline-block' : 'none';
    }

    const causalityMetric = document.getElementById('causality-metric');
    if (causalityMetric) causalityMetric.style.display = isRelativistic ? 'flex' : 'none';
  }

  private persist(): void {
    saveSettings({
      mode: this.config.mode,
      preset: this.presetSelect.value,
      boundary: this.config.boundary,
      params: this.config.params,
      classicalParams: this.classicalParams,
      timeScale: this.timeScale,
      showWorldsheet: this.showWorldsheet,
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
    this.stepAccumulator = 0;
    const presetName = this.presetSelect.value;
    const preset = presets[presetName] || presets.pluck;
    this.initializePreset(preset);
    this.updateMetrics();
    this.render();
  }

  private loop(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    this.lastTime = now;

    // Carry fractional steps between frames so the slowest playback setting
    // still advances, instead of rounding to zero indefinitely.
    this.stepAccumulator += this.stepsPerFrame * this.timeScale;
    const steps = Math.floor(this.stepAccumulator);
    if (steps > 0) {
      this.solver.stepN(steps);
      this.stepAccumulator -= steps;
    }

    // Update metrics every few frames
    if (steps > 0 && Math.floor(this.solver.getState().t / this.config.dt) % 8 === 0) {
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

    // Render worldsheet for relativistic mode
    if (this.config.mode === 'relativistic' && this.worldsheetRenderer && this.showWorldsheet) {
      const relState = state as import('./physics/relativistic').RelativisticStringState;
      if (relState.worldsheet && relState.worldsheet.length > 0) {
        const bounds = (this.solver as RelativisticStringSolver).getWorldsheetBounds();
        this.worldsheetRenderer.setBounds(
          bounds.tMin, bounds.tMax,
          bounds.yMin, bounds.yMax,
          0, this.config.params.L
        );
        this.worldsheetRenderer.render(relState.worldsheet);
      }
    }
  }

  private updateMetrics(): void {
    const metrics = this.solver.getMetrics();

    const energyEl = document.getElementById('metric-energy');
    const waveSpeedEl = document.getElementById('metric-wavespeed');
    const fundamentalEl = document.getElementById('metric-fundamental');

    if (energyEl) energyEl.textContent = metrics.totalEnergy.toFixed(3);
    if (waveSpeedEl) waveSpeedEl.textContent = metrics.waveSpeed.toFixed(3);
    if (fundamentalEl) fundamentalEl.textContent = metrics.fundamentalFreq.toFixed(3);

    // Update causality warning for relativistic mode
    if (this.config.mode === 'relativistic' && this.solver instanceof RelativisticStringSolver) {
      const isCausal = this.solver.checkCausality();
      const causalityEl = document.getElementById('metric-causality');
      if (causalityEl) {
        causalityEl.textContent = isCausal ? '✓ Causal' : '⚠ Acausal';
        causalityEl.className = isCausal ? 'metric-value ok' : 'metric-value warning';
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new StringSimulator();
});
