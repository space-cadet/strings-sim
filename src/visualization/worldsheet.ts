/**
 * Worldsheet renderer — shows string as a 2D spacetime surface
 *
 * Standard string theory worldsheet coordinates:
 *   σ (sigma) = position along string [0, L]  → horizontal axis
 *   τ (tau)   = time                          → vertical axis
 *   Color     = transverse displacement y(σ,τ)
 */

import { WorldsheetPoint } from '../physics/relativistic';

export interface WorldsheetRendererConfig {
  canvas: HTMLCanvasElement;
  padding?: { top: number; right: number; bottom: number; left: number };
}

export class WorldsheetRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<WorldsheetRendererConfig>;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Data bounds
  private sigmaMin: number = 0;
  private sigmaMax: number = 1;
  private tauMin: number = 0;
  private tauMax: number = 1;
  private yMin: number = -1;
  private yMax: number = 1;

  constructor(config: WorldsheetRendererConfig) {
    this.canvas = config.canvas;
    this.ctx = config.canvas.getContext('2d')!;
    this.config = {
      padding: { top: 40, right: 40, bottom: 60, left: 70 },
      ...config,
    };
    this.dpr = window.devicePixelRatio || 1;
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  setBounds(
    tauMin: number, tauMax: number,
    yMin: number, yMax: number,
    sigmaMin: number = 0, sigmaMax: number = 1
  ): void {
    this.tauMin = tauMin;
    this.tauMax = tauMax;
    this.yMin = yMin;
    this.yMax = yMax;
    this.sigmaMin = sigmaMin;
    this.sigmaMax = sigmaMax;
  }

  // Map sigma (position along string) → canvas x
  private mapSigma(s: number): number {
    const { left, right } = this.config.padding;
    const plotWidth = this.width - left - right;
    return left + ((s - this.sigmaMin) / (this.sigmaMax - this.sigmaMin)) * plotWidth;
  }

  // Map tau (time) → canvas y (inverted: tau increases upward)
  private mapTau(t: number): number {
    const { top, bottom } = this.config.padding;
    const plotHeight = this.height - top - bottom;
    return this.height - bottom - ((t - this.tauMin) / (this.tauMax - this.tauMin)) * plotHeight;
  }

  // Map displacement y → color intensity
  private displacementColor(y: number): string {
    // Normalize to [-1, 1]
    const maxDisp = Math.max(Math.abs(this.yMin), Math.abs(this.yMax)) || 1;
    const norm = y / maxDisp;

    // Color scheme: negative = purple, zero = dark, positive = cyan
    if (norm < 0) {
      const intensity = Math.abs(norm);
      const r = Math.floor(100 + 155 * intensity);
      const g = Math.floor(50 * intensity);
      const b = Math.floor(200 + 55 * intensity);
      return `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * intensity})`;
    } else {
      const intensity = norm;
      const r = Math.floor(50 * intensity);
      const g = Math.floor(100 + 155 * intensity);
      const b = Math.floor(200 + 55 * intensity);
      return `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * intensity})`;
    }
  }

  render(worldsheet: WorldsheetPoint[][]): void {
    this.clear();
    this.drawGrid();
    this.drawAxes();

    if (worldsheet.length < 2 || worldsheet[0].length < 2) return;

    // Draw worldsheet as colored surface
    this.drawWorldsheetSurface(worldsheet);

    // Draw current string snapshot on top
    this.drawCurrentString(worldsheet);

    // Draw light cone boundaries
    this.drawLightConeBoundaries();
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private drawGrid(): void {
    const { ctx } = this;
    const { left, right, top, bottom } = this.config.padding;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical grid (sigma)
    const sigmaTicks = 8;
    for (let i = 0; i <= sigmaTicks; i++) {
      const s = this.sigmaMin + (i / sigmaTicks) * (this.sigmaMax - this.sigmaMin);
      const x = this.mapSigma(s);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, this.height - bottom);
      ctx.stroke();
    }

    // Horizontal grid (tau)
    const tauTicks = 6;
    for (let i = 0; i <= tauTicks; i++) {
      const t = this.tauMin + (i / tauTicks) * (this.tauMax - this.tauMin);
      const y = this.mapTau(t);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(this.width - right, y);
      ctx.stroke();
    }
  }

  private drawAxes(): void {
    const { ctx } = this;
    const { left, right, top, bottom } = this.config.padding;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px "Segoe UI", sans-serif';

    // Sigma axis (horizontal, at bottom)
    const y0 = this.mapTau(this.tauMin);
    ctx.beginPath();
    ctx.moveTo(left, y0);
    ctx.lineTo(this.width - right, y0);
    ctx.stroke();

    ctx.textAlign = 'center';
    const sigmaTicks = 5;
    for (let i = 0; i <= sigmaTicks; i++) {
      const s = this.sigmaMin + (i / sigmaTicks) * (this.sigmaMax - this.sigmaMin);
      const x = this.mapSigma(s);
      ctx.fillText(s.toFixed(1), x, y0 + 20);

      ctx.beginPath();
      ctx.moveTo(x, y0 - 4);
      ctx.lineTo(x, y0 + 4);
      ctx.stroke();
    }
    ctx.fillText('σ (position along string)', (left + this.width - right) / 2, this.height - 10);

    // Tau axis (vertical, at left)
    const x0 = this.mapSigma(this.sigmaMin);
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.lineTo(x0, this.height - bottom);
    ctx.stroke();

    ctx.textAlign = 'right';
    const tauTicks = 4;
    for (let i = 0; i <= tauTicks; i++) {
      const t = this.tauMin + (i / tauTicks) * (this.tauMax - this.tauMin);
      if (Math.abs(t) < 0.01) continue;
      const y = this.mapTau(t);
      ctx.fillText(t.toFixed(1), x0 - 10, y + 4);

      ctx.beginPath();
      ctx.moveTo(x0 - 4, y);
      ctx.lineTo(x0 + 4, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(20, (top + this.height - bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('τ (time)', 0, 0);
    ctx.restore();
  }

  private drawWorldsheetSurface(worldsheet: WorldsheetPoint[][]): void {
    const { ctx } = this;

    // Each worldsheet[i] is a time-history of one spatial point
    // worldsheet[i][j] = {t, x, y} where x = position along string, t = time, y = displacement

    const numSpatial = worldsheet.length;
    const numTemporal = worldsheet[0].length;

    // Draw small rectangles for each (sigma, tau) point, colored by displacement
    const rectWidth = (this.mapSigma(this.sigmaMax) - this.mapSigma(this.sigmaMin)) / (numSpatial - 1);
    const rectHeight = (this.mapTau(this.tauMin) - this.mapTau(this.tauMax)) / (numTemporal - 1);

    for (let i = 0; i < numSpatial - 1; i++) {
      for (let j = 0; j < numTemporal - 1; j++) {
        const point = worldsheet[i][j];
        const x = this.mapSigma(point.x);
        const y = this.mapTau(point.t);

        ctx.fillStyle = this.displacementColor(point.y);
        ctx.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth + 1, rectHeight + 1);
      }
    }
  }

  private drawCurrentString(worldsheet: WorldsheetPoint[][]): void {
    const { ctx } = this;

    // Draw the most recent time slice as a bright line
    const numSpatial = worldsheet.length;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let i = 0; i < numSpatial; i++) {
      const line = worldsheet[i];
      const point = line[line.length - 1]; // Most recent time
      const x = this.mapSigma(point.x);
      const y = this.mapTau(point.t);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Mark endpoints
    const firstPoint = worldsheet[0][worldsheet[0].length - 1];
    const lastPoint = worldsheet[numSpatial - 1][worldsheet[numSpatial - 1].length - 1];

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.mapSigma(firstPoint.x), this.mapTau(firstPoint.t), 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.mapSigma(lastPoint.x), this.mapTau(lastPoint.t), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawLightConeBoundaries(): void {
    const { ctx } = this;

    // In the (σ, τ) plane, light travels at 45°
    // Draw dashed lines showing the speed-of-light limit
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const x0 = this.mapSigma(this.sigmaMin);
    const xL = this.mapSigma(this.sigmaMax);
    const yBottom = this.mapTau(this.tauMin);
    const yTop = this.mapTau(this.tauMax);

    // Light cone from left endpoint (slope = ±1)
    ctx.beginPath();
    ctx.moveTo(x0, yBottom);
    ctx.lineTo(x0 + (yBottom - yTop), yTop); // 45° line
    ctx.stroke();

    // Light cone from right endpoint
    ctx.beginPath();
    ctx.moveTo(xL, yBottom);
    ctx.lineTo(xL - (yBottom - yTop), yTop); // -45° line
    ctx.stroke();

    ctx.setLineDash([]);
  }
}
