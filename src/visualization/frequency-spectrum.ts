import { computePowerSpectrum } from '../utils/fft.js';
import type { ProbeSample } from './probe-state.js';

export interface SpectrumBin {
  frequency: number;
  power: number;
}

export interface SpectrumAnalysis {
  bins: SpectrumBin[];
  dominantFrequency: number;
  sampleCount: number;
}

/**
 * Convert the uniformly sampled probe history into a short-window power
 * spectrum. Removing the mean and using a Hann window prevents the static
 * offset and window edges from being mistaken for a physical oscillation.
 */
export function analyseProbeSpectrum(samples: readonly ProbeSample[]): SpectrumAnalysis | null {
  if (samples.length < 16) return null;
  const dt = (samples.at(-1)!.tau - samples[0].tau) / (samples.length - 1);
  if (!Number.isFinite(dt) || dt <= 0) return null;

  const mean = samples.reduce((sum, sample) => sum + sample.y, 0) / samples.length;
  const signal = new Float64Array(samples.length);
  for (let index = 0; index < samples.length; index++) {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * index) / (samples.length - 1)));
    signal[index] = (samples[index].y - mean) * window;
  }

  const power = computePowerSpectrum(signal);
  const fftSize = (power.length - 1) * 2;
  const bins = Array.from(power.slice(1) as Float64Array, (value: number, index: number) => ({
    frequency: ((index + 1) / fftSize) / dt,
    power: value,
  }));
  const dominant = bins.reduce((best, bin) => bin.power > best.power ? bin : best, bins[0]);
  return { bins, dominantFrequency: dominant.frequency, sampleCount: samples.length };
}

export class FrequencySpectrumRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private readonly padding = { top: 28, right: 26, bottom: 42, left: 58 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    this.width = rect.width;
    this.height = rect.height;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  render(analysis: SpectrumAnalysis | null): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    const { left, right, top, bottom } = this.padding;
    const plotWidth = this.width - left - right;
    const plotHeight = this.height - top - bottom;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
    ctx.font = '12px "Segoe UI", sans-serif';

    if (!analysis) {
      ctx.textAlign = 'center';
      ctx.fillText('Run the simulation to collect at least 16 probe samples.', this.width / 2, this.height / 2);
      return;
    }

    const dominantIndex = Math.max(0, analysis.bins.findIndex(bin => bin.frequency === analysis.dominantFrequency));
    // The full Nyquist range is mostly empty for the educational presets and
    // makes the important low-frequency peaks unreadably narrow. Show a
    // focused range that still leaves several bins beyond the strongest peak.
    const visibleBins = analysis.bins.slice(0, Math.min(analysis.bins.length, Math.max(12, (dominantIndex + 1) * 4)));
    const maxFrequency = visibleBins.at(-1)!.frequency;
    const maxPower = Math.max(...visibleBins.map(bin => bin.power), Number.EPSILON);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let step = 0; step <= 4; step++) {
      const y = top + (step / 4) * plotHeight;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotWidth, y); ctx.stroke();
    }

    const barWidth = plotWidth / visibleBins.length;
    for (let index = 0; index < visibleBins.length; index++) {
      const bin = visibleBins[index];
      const height = (bin.power / maxPower) * plotHeight;
      ctx.fillStyle = bin.frequency === analysis.dominantFrequency ? '#ffe66d' : '#6c5ce7';
      ctx.fillRect(left + index * barWidth, top + plotHeight - height, Math.max(1, barWidth - 1), height);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('frequency', left + plotWidth / 2, this.height - 10);
    ctx.textAlign = 'left';
    ctx.fillText('0', left, this.height - bottom + 18);
    ctx.textAlign = 'right';
    ctx.fillText(maxFrequency.toFixed(2), left + plotWidth, this.height - bottom + 18);
    ctx.save();
    ctx.translate(16, top + plotHeight / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center';
    ctx.fillText('relative power', 0, 0); ctx.restore();
  }
}
