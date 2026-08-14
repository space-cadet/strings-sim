/**
 * Worldsheet renderer — shows string as a 2D spacetime surface
 *
 * Standard string theory worldsheet coordinates:
 *   σ (sigma) = position along string [0, L]  → horizontal axis
 *   τ (tau)   = time                          → vertical axis
 *   Color     = transverse displacement y(σ,τ)
 */

import { WorldsheetPoint } from '../physics/relativistic';

export type WorldsheetField = 'displacement' | 'velocity' | 'energy' | 'slope';

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
  private characteristicSpeed: number = 1;
  private field: WorldsheetField = 'displacement';
  private massDensity: number = 1;
  private tension: number = 1;

  constructor(config: WorldsheetRendererConfig) {
    this.canvas = config.canvas;
    this.ctx = config.canvas.getContext('2d')!;
    this.config = {
      padding: { top: 40, right: 78, bottom: 60, left: 70 },
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

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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

  setCharacteristicSpeed(speed: number): void {
    this.characteristicSpeed = speed;
  }

  setField(field: WorldsheetField, massDensity: number, tension: number): void {
    this.field = field;
    this.massDensity = massDensity;
    this.tension = tension;
  }

  getSigmaFromClientX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const { left, right } = this.config.padding;
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left - left) / Math.max(1, rect.width - left - right)));
    return this.sigmaMin + fraction * (this.sigmaMax - this.sigmaMin);
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

  private signedColor(value: number, maxValue: number): string {
    const norm = value / maxValue;
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

  private energyColor(value: number, maxValue: number): string {
    const intensity = Math.min(1, Math.max(0, value / maxValue));
    const r = Math.floor(35 + 220 * intensity);
    const g = Math.floor(30 + 175 * intensity);
    const b = Math.floor(45 + 45 * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  }

  render(worldsheet: WorldsheetPoint[][], probeSigma?: number): void {
    this.clear();
    this.drawGrid();
    this.drawAxes();

    if (worldsheet.length < 1 || worldsheet[0].length < 1) return;

    // Draw worldsheet as colored surface
    if (worldsheet.length > 1 && worldsheet[0].length > 1) this.drawWorldsheetSurface(worldsheet);

    // Draw current string snapshot on top
    this.drawCurrentString(worldsheet);

    if (probeSigma !== undefined) this.drawProbeWorldline(probeSigma);

    // Draw light cone boundaries
    this.drawCharacteristics();
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

  private fieldValue(worldsheet: WorldsheetPoint[][], spatialIndex: number, temporalIndex: number): number {
    const point = worldsheet[spatialIndex][temporalIndex];
    if (this.field === 'displacement') return point.y;

    const left = worldsheet[Math.max(0, spatialIndex - 1)][temporalIndex];
    const right = worldsheet[Math.min(worldsheet.length - 1, spatialIndex + 1)][temporalIndex];
    const dx = Math.max(Number.EPSILON, right.x - left.x);
    const slope = (right.y - left.y) / dx;
    if (this.field === 'slope') return slope;

    const previous = worldsheet[spatialIndex][Math.max(0, temporalIndex - 1)];
    const next = worldsheet[spatialIndex][Math.min(worldsheet[spatialIndex].length - 1, temporalIndex + 1)];
    const dt = Math.max(Number.EPSILON, next.t - previous.t);
    const velocity = (next.y - previous.y) / dt;
    if (this.field === 'velocity') return velocity;
    return 0.5 * this.massDensity * velocity ** 2 + 0.5 * this.tension * slope ** 2;
  }

  private drawWorldsheetSurface(worldsheet: WorldsheetPoint[][]): void {
    const { ctx } = this;
    const numSpatial = worldsheet.length;
    const numTemporal = worldsheet[0].length;
    const values: number[][] = [];
    let scale = 0;

    for (let i = 0; i < numSpatial; i++) {
      values[i] = [];
      for (let j = 0; j < numTemporal; j++) {
        const value = this.fieldValue(worldsheet, i, j);
        values[i][j] = value;
        scale = Math.max(scale, this.field === 'energy' ? value : Math.abs(value));
      }
    }
    scale = Math.max(scale, 1e-9);

    // Use one scale across the rolling window so zero retains one colour meaning.
    const rectWidth = (this.mapSigma(this.sigmaMax) - this.mapSigma(this.sigmaMin)) / (numSpatial - 1);
    const rectHeight = (this.mapTau(this.tauMin) - this.mapTau(this.tauMax)) / (numTemporal - 1);

    for (let i = 0; i < numSpatial - 1; i++) {
      for (let j = 0; j < numTemporal - 1; j++) {
        const point = worldsheet[i][j];
        const x = this.mapSigma(point.x);
        const y = this.mapTau(point.t);
        ctx.fillStyle = this.field === 'energy'
          ? this.energyColor(values[i][j], scale)
          : this.signedColor(values[i][j], scale);
        ctx.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth + 1, rectHeight + 1);
      }
    }
    this.drawColorBar(scale);
  }

  private drawColorBar(scale: number): void {
    const { ctx } = this;
    const { right, top, bottom } = this.config.padding;
    const barWidth = 12;
    const barHeight = this.height - top - bottom;
    const x = this.width - right + 16;
    const y = top;
    const steps = 60;

    for (let i = 0; i < steps; i++) {
      const fraction = 1 - i / (steps - 1);
      const value = this.field === 'energy' ? fraction * scale : (fraction * 2 - 1) * scale;
      ctx.fillStyle = this.field === 'energy' ? this.energyColor(value, scale) : this.signedColor(value, scale);
      ctx.fillRect(x, y + (i * barHeight) / steps, barWidth, barHeight / steps + 1);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.strokeRect(x, y, barWidth, barHeight);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    const label = (value: number) => Math.abs(value) >= 10 || (Math.abs(value) > 0 && Math.abs(value) < 0.01)
      ? value.toExponential(1)
      : value.toFixed(2);
    ctx.fillText(label(scale), x + barWidth + 5, y + 4);
    if (this.field !== 'energy') ctx.fillText('0', x + barWidth + 5, y + barHeight / 2 + 4);
    ctx.fillText(label(this.field === 'energy' ? 0 : -scale), x + barWidth + 5, y + barHeight);
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

  private drawProbeWorldline(sigma: number): void {
    const { ctx } = this;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(this.mapSigma(sigma), this.mapTau(this.tauMin));
    ctx.lineTo(this.mapSigma(sigma), this.mapTau(this.tauMax));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawCharacteristics(): void {
    const { ctx } = this;

    // Characteristics are defined in (σ, τ) data space, not pixel space.
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const tauSpan = this.tauMax - this.tauMin;
    for (const [sigmaStart, direction] of [[this.sigmaMin, 1], [this.sigmaMax, -1]] as const) {
      const sigmaEnd = sigmaStart + direction * this.characteristicSpeed * tauSpan;
      ctx.beginPath();
      ctx.moveTo(this.mapSigma(sigmaStart), this.mapTau(this.tauMin));
      ctx.lineTo(this.mapSigma(sigmaEnd), this.mapTau(this.tauMax));
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }
}
