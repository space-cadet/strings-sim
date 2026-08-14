/**
 * Main application entry point
 * Orchestrates physics simulation, rendering, and UI
 */

import { SimulationConfig, StringParameters, BoundaryCondition, PhysicsMode, stableTimeStep } from './physics/core';
import { ClassicalStringSolver } from './physics/classical';
import { RelativisticStringSolver } from './physics/relativistic';
import { StringRenderer } from './visualization/renderer';
import { WorldsheetRenderer } from './visualization/worldsheet';
import { ProbeTrajectoryRenderer } from './visualization/probe-trajectory';
import { ProbeTrajectoryState } from './visualization/probe-state';
import { analyseProbeSpectrum, FrequencySpectrumRenderer } from './visualization/frequency-spectrum';
import { presets } from './ui/presets';

interface SavedSettings {
  mode: PhysicsMode;
  preset: string;
  boundary: BoundaryCondition;
  params: StringParameters;
  classicalParams?: StringParameters;
  timeScale: number;
  showWorldsheet?: boolean;
  showEnergyStrip?: boolean;
  worldsheetField?: WorldsheetField;
}

type WorldsheetField = 'displacement' | 'velocity' | 'energy' | 'slope';

const WORLDSHEET_FIELD_FORMULAS: Record<WorldsheetField, string> = {
  displacement: 'y(σ, τ)',
  velocity: '∂τy(σ, τ)',
  energy: 'ℰ(σ, τ)',
  slope: '∂σy(σ, τ)',
};

const WORLDSHEET_FIELD_LEGENDS: Record<WorldsheetField, string> = {
  displacement: 'σ is position, τ is time, and colour indicates transverse displacement.',
  velocity: 'σ is position, τ is time, and colour indicates transverse velocity.',
  energy: 'σ is position, τ is time, and colour indicates computed energy density.',
  slope: 'σ is position, τ is time, and colour indicates local spatial slope.',
};

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
  private probeRenderer: ProbeTrajectoryRenderer | null = null;
  private spectrumRenderer: FrequencySpectrumRenderer | null = null;
  private probe: ProbeTrajectoryState;
  private config: SimulationConfig;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private timeScale: number = 1.0;
  private stepsPerFrame: number = 4;
  private stepAccumulator: number = 0;
  private showWorldsheet: boolean = false;
  private showEnergyStrip: boolean = true;
  private worldsheetField: WorldsheetField = 'displacement';
  private initialEnergy: number = 0;
  private classicalParams: StringParameters;

  // UI elements
  private btnPlay: HTMLButtonElement;
  private btnPause: HTMLButtonElement;
  private btnReset: HTMLButtonElement;
  private presetSelect: HTMLSelectElement;
  private boundarySelect: HTMLSelectElement;
  private modeButtons: NodeListOf<HTMLButtonElement>;
  private worldsheetToggle: HTMLButtonElement | null = null;
  private energyStripToggle: HTMLInputElement | null = null;
  private worldsheetFieldSelect: HTMLSelectElement | null = null;

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
    this.showWorldsheet = saved?.showWorldsheet ?? true;
    this.showEnergyStrip = saved?.showEnergyStrip ?? true;
    this.worldsheetField = saved?.worldsheetField ?? 'displacement';
    this.classicalParams = { ...(saved?.classicalParams ?? params) };

    // Initialize solver based on mode
    this.solver = this.createSolver();
    const presetName = saved?.preset ?? 'pluck';
    const preset = presets[presetName] || presets.pluck;
    this.initializePreset(preset);

    // Initialize renderer
    const canvas = document.getElementById('string-canvas') as HTMLCanvasElement;
    this.renderer = new StringRenderer({ canvas });
    this.renderer.setShowEnergy(this.showEnergyStrip);
    this.renderer.setBounds(0, params.L, -0.5, 0.5);

    // Initialize worldsheet renderer if canvas exists
    const worldsheetCanvas = document.getElementById('worldsheet-canvas') as HTMLCanvasElement;
    if (worldsheetCanvas) {
      this.worldsheetRenderer = new WorldsheetRenderer({ canvas: worldsheetCanvas });
    }
    const probeCanvas = document.getElementById('probe-canvas') as HTMLCanvasElement;
    if (probeCanvas) this.probeRenderer = new ProbeTrajectoryRenderer({ canvas: probeCanvas });
    const spectrumCanvas = document.getElementById('spectrum-canvas') as HTMLCanvasElement;
    if (spectrumCanvas) this.spectrumRenderer = new FrequencySpectrumRenderer(spectrumCanvas);
    this.probe = new ProbeTrajectoryState(Math.floor(N / 2), params.L / 2, 200);
    this.recordProbeState();

    // Cache UI elements
    this.btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
    this.btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
    this.btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    this.presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
    this.boundarySelect = document.getElementById('boundary-select') as HTMLSelectElement;
    this.modeButtons = document.querySelectorAll('.mode-toggle button');
    this.worldsheetToggle = document.getElementById('btn-worldsheet') as HTMLButtonElement;
    this.energyStripToggle = document.getElementById('show-energy-strip') as HTMLInputElement;
    this.worldsheetFieldSelect = document.getElementById('worldsheet-field') as HTMLSelectElement;
    if (this.energyStripToggle) this.energyStripToggle.checked = this.showEnergyStrip;
    if (this.worldsheetFieldSelect) this.worldsheetFieldSelect.value = this.worldsheetField;
    this.updateWorldsheetFieldCopy();
    this.initialEnergy = this.solver.getMetrics().totalEnergy;

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
    const canShow = this.showWorldsheet;
    this.worldsheetToggle?.classList.toggle('active', canShow);
    const container = document.getElementById('worldsheet-container');
    if (container) container.style.display = canShow ? 'block' : 'none';
    if (canShow && this.worldsheetRenderer) {
      requestAnimationFrame(() => {
        this.worldsheetRenderer?.handleResize();
        this.render();
      });
    }
  }

  private setSliderValue(id: string, value: number, formatter?: (v: number) => string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    const valueSpan = document.getElementById(id.replace('param-', 'val-')) as HTMLSpanElement;
    if (input) input.value = String(value);
    if (valueSpan && formatter) valueSpan.textContent = formatter(value);
  }

  private bindEvents(): void {
    // Mobile browsers can discard a canvas bitmap while compositing a scroll.
    // Queue one redraw per frame so returning to a plot never depends on Play.
    let repaintQueued = false;
    const repaint = () => {
      if (repaintQueued) return;
      repaintQueued = true;
      requestAnimationFrame(() => {
        repaintQueued = false;
        this.render();
      });
    };
    window.addEventListener('scroll', repaint, { passive: true });
    window.visualViewport?.addEventListener('resize', () => {
      this.renderer.handleResize();
      this.worldsheetRenderer?.handleResize();
      this.probeRenderer?.handleResize();
      this.spectrumRenderer?.handleResize();
      repaint();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) repaint();
    });

    // Playback controls
    this.btnPlay.addEventListener('click', () => this.play());
    this.btnPause.addEventListener('click', () => this.pause());
    this.btnReset.addEventListener('click', () => this.reset());

    const profileCanvas = document.getElementById('string-canvas') as HTMLCanvasElement;
    const worldsheetCanvas = document.getElementById('worldsheet-canvas') as HTMLCanvasElement;
    profileCanvas.addEventListener('pointerdown', (event) => this.selectProbeAt(this.renderer.getSigmaFromClientX(event.clientX)));
    profileCanvas.addEventListener('pointermove', (event) => {
      if (event.buttons & 1) this.selectProbeAt(this.renderer.getSigmaFromClientX(event.clientX));
    });
    worldsheetCanvas.addEventListener('pointerdown', (event) => {
      if (this.worldsheetRenderer) this.selectProbeAt(this.worldsheetRenderer.getSigmaFromClientX(event.clientX));
    });
    worldsheetCanvas.addEventListener('pointermove', (event) => {
      if ((event.buttons & 1) && this.worldsheetRenderer) this.selectProbeAt(this.worldsheetRenderer.getSigmaFromClientX(event.clientX));
    });
    [profileCanvas, worldsheetCanvas].forEach(canvas => {
      canvas.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        this.selectProbeIndex(this.probe.sigmaIndex + (event.key === 'ArrowLeft' ? -1 : 1));
      });
    });

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

    this.energyStripToggle?.addEventListener('change', () => {
      this.showEnergyStrip = this.energyStripToggle!.checked;
      this.renderer.setShowEnergy(this.showEnergyStrip);
      this.persist();
      this.render();
    });

    this.worldsheetFieldSelect?.addEventListener('change', () => {
      this.worldsheetField = this.worldsheetFieldSelect!.value as WorldsheetField;
      this.updateWorldsheetFieldCopy();
      this.persist();
      this.render();
    });

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

    if (this.worldsheetToggle) this.worldsheetToggle.style.display = 'inline-block';

    const energyDriftMetric = document.getElementById('energy-drift-metric');
    if (energyDriftMetric) energyDriftMetric.style.display = isRelativistic ? 'flex' : 'none';
    this.updateWorldsheetFieldCopy();
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
      showEnergyStrip: this.showEnergyStrip,
      worldsheetField: this.worldsheetField,
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
    this.initialEnergy = this.solver.getMetrics().totalEnergy;
    this.probe.clear();
    this.recordProbeState();
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
      for (let i = 0; i < steps; i++) {
        this.solver.stepN(1);
        this.recordProbeState();
      }
      this.stepAccumulator -= steps;
    }

    if (steps > 0) this.updateMetrics();

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

    this.renderer.render(x, state.y, energy, this.probe.sigmaIndex);
    const probeSamples = this.probe.snapshot();
    this.probeRenderer?.render(probeSamples);
    const spectrum = analyseProbeSpectrum(probeSamples);
    this.spectrumRenderer?.render(spectrum);
    const spectrumStatus = document.getElementById('spectrum-status');
    if (spectrumStatus) {
      spectrumStatus.textContent = spectrum
        ? `peak ${spectrum.dominantFrequency.toFixed(3)}`
        : `${probeSamples.length}/16 samples`;
    }

    if (this.worldsheetRenderer && this.showWorldsheet) {
      const isRelativistic = this.solver instanceof RelativisticStringSolver;
      const worldsheet = isRelativistic
        ? (state as import('./physics/relativistic').RelativisticStringState).worldsheet
        : (this.solver as ClassicalStringSolver).getWorldsheet();
      const bounds = isRelativistic
        ? (this.solver as RelativisticStringSolver).getWorldsheetBounds()
        : (this.solver as ClassicalStringSolver).getWorldsheetBounds();
      this.worldsheetRenderer.setBounds(bounds.tMin, bounds.tMax, bounds.yMin, bounds.yMax, 0, this.config.params.L);
      this.worldsheetRenderer.setField(this.worldsheetField, this.config.params.mu, this.config.params.tau);
      this.worldsheetRenderer.setCharacteristicSpeed(isRelativistic ? 1 : this.solver.getMetrics().waveSpeed);
      this.worldsheetRenderer.render(worldsheet, this.probe.sigma);
    }
  }

  private selectProbeAt(sigma: number): void {
    const index = Math.round(sigma / this.config.dx);
    this.selectProbeIndex(index);
  }

  private selectProbeIndex(index: number): void {
    const clampedIndex = Math.max(0, Math.min(this.config.N - 1, index));
    const sigma = clampedIndex * this.config.dx;
    this.probe.select(clampedIndex, sigma);
    this.recordProbeState();
    const panel = document.getElementById('probe-panel') as HTMLDetailsElement | null;
    if (panel) panel.open = true;
    const status = document.getElementById('probe-status');
    if (status) status.textContent = `σ* = ${sigma.toFixed(2)}`;
    this.render();
  }

  private recordProbeState(): void {
    const state = this.solver.getState();
    this.probe.record(state.t, state.y[this.probe.sigmaIndex]);
  }

  private updateMetrics(): void {
    const metrics = this.solver.getMetrics();

    const energyEl = document.getElementById('metric-energy');
    const waveSpeedEl = document.getElementById('metric-wavespeed');
    const fundamentalEl = document.getElementById('metric-fundamental');

    if (energyEl) energyEl.textContent = metrics.totalEnergy.toFixed(5);
    if (waveSpeedEl) waveSpeedEl.textContent = metrics.waveSpeed.toFixed(4);
    if (fundamentalEl) fundamentalEl.textContent = metrics.fundamentalFreq.toFixed(4);

    const courant = (this.config.mode === 'relativistic' ? 1 : metrics.waveSpeed) * this.config.dt / this.config.dx;
    this.setDiagnostic('metric-courant', courant.toFixed(2), courant <= 1 ? 'ok' : 'danger');
    const maxSpeed = Math.max(...this.solver.getState().v.map(Math.abs));
    this.setDiagnostic('metric-max-speed', maxSpeed.toFixed(3), maxSpeed <= 1 ? 'ok' : 'warning');

    if (this.config.mode === 'relativistic') {
      const drift = this.initialEnergy === 0 ? 0 : (metrics.totalEnergy - this.initialEnergy) / this.initialEnergy;
      const driftPercent = drift * 100;
      this.setDiagnostic('metric-energy-drift', `${driftPercent >= 0 ? '+' : ''}${driftPercent.toFixed(2)}%`, Math.abs(drift) < 0.01 ? 'ok' : Math.abs(drift) < 0.05 ? 'warning' : 'danger');
    }
  }

  private setDiagnostic(id: string, value: string, status: 'ok' | 'warning' | 'danger'): void {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
    element.className = `metric-value ${status}`;
  }

  private updateWorldsheetFieldCopy(): void {
    const formula = document.getElementById('worldsheet-formula');
    if (formula) formula.textContent = WORLDSHEET_FIELD_FORMULAS[this.worldsheetField];
    const legend = document.querySelector('.worldsheet-legend');
    if (legend) legend.textContent = WORLDSHEET_FIELD_LEGENDS[this.worldsheetField];
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new StringSimulator();
});
