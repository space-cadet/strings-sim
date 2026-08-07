import type { ProbeSample } from './probe-state';

export interface ProbeTrajectoryRendererConfig {
  canvas: HTMLCanvasElement;
  padding?: { top: number; right: number; bottom: number; left: number };
}

/** Draws the displacement history y(sigma*, tau) for the selected probe. */
export class ProbeTrajectoryRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly padding: { top: number; right: number; bottom: number; left: number };
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(config: ProbeTrajectoryRendererConfig) {
    this.canvas = config.canvas;
    this.ctx = config.canvas.getContext('2d')!;
    this.padding = config.padding ?? { top: 28, right: 28, bottom: 48, left: 62 };
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

  render(samples: readonly ProbeSample[]): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { left, right, top, bottom } = this.padding;
    const plotLeft = left;
    const plotRight = this.width - right;
    const plotTop = top;
    const plotBottom = this.height - bottom;
    const tauMin = samples[0]?.tau ?? 0;
    const tauMax = Math.max(tauMin + 0.01, samples.at(-1)?.tau ?? 1);
    const amplitude = Math.max(0.05, ...samples.map(sample => Math.abs(sample.y))) * 1.15;
    const mapTau = (tau: number) => plotLeft + ((tau - tauMin) / (tauMax - tauMin)) * (plotRight - plotLeft);
    const mapY = (y: number) => plotTop + ((amplitude - y) / (2 * amplitude)) * (plotBottom - plotTop);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = plotTop + (i / 4) * (plotBottom - plotTop);
      this.ctx.beginPath();
      this.ctx.moveTo(plotLeft, y);
      this.ctx.lineTo(plotRight, y);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.lineWidth = 1.25;
    this.ctx.beginPath();
    this.ctx.moveTo(plotLeft, mapY(0));
    this.ctx.lineTo(plotRight, mapY(0));
    this.ctx.stroke();

    if (samples.length > 1) {
      this.ctx.strokeStyle = '#00d4ff';
      this.ctx.shadowColor = '#00d4ff';
      this.ctx.shadowBlur = 9;
      this.ctx.lineWidth = 2.25;
      this.ctx.beginPath();
      this.ctx.moveTo(mapTau(samples[0].tau), mapY(samples[0].y));
      for (const sample of samples.slice(1)) this.ctx.lineTo(mapTau(sample.tau), mapY(sample.y));
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    this.ctx.font = '12px "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('τ (time)', (plotLeft + plotRight) / 2, this.height - 11);
    this.ctx.save();
    this.ctx.translate(16, (plotTop + plotBottom) / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText('y(σ*, τ)', 0, 0);
    this.ctx.restore();
  }
}
