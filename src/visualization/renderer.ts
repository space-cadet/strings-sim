/**
 * Canvas rendering engine for string visualization
 */

import { StringState } from '../physics/core';

export interface RendererConfig {
  canvas: HTMLCanvasElement;
  padding?: { top: number; right: number; bottom: number; left: number };
  stringColor?: string;
  stringWidth?: number;
  showGrid?: boolean;
  showEnergy?: boolean;
}

export class StringRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<RendererConfig>;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Coordinate mapping
  private xMin: number = 0;
  private xMax: number = 1;
  private yMin: number = -1;
  private yMax: number = 1;

  constructor(config: RendererConfig) {
    this.canvas = config.canvas;
    this.ctx = config.canvas.getContext('2d')!;
    this.config = {
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
      stringColor: '#6c5ce7',
      stringWidth: 2.5,
      showGrid: true,
      showEnergy: true,
      ...config,
    };
    this.dpr = window.devicePixelRatio || 1;
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  /** Resize canvas to match container */
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

  /** Set the coordinate bounds for the plot */
  setBounds(xMin: number, xMax: number, yMin: number, yMax: number): void {
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
  }

  setShowEnergy(showEnergy: boolean): void {
    this.config.showEnergy = showEnergy;
  }

  /** Map data coordinates to canvas pixels */
  private mapX(x: number): number {
    const { left, right } = this.config.padding;
    const plotWidth = this.width - left - right;
    return left + ((x - this.xMin) / (this.xMax - this.xMin)) * plotWidth;
  }

  private mapY(y: number): number {
    const { top, bottom } = this.config.padding;
    const plotHeight = this.height - top - bottom;
    return top + (1 - (y - this.yMin) / (this.yMax - this.yMin)) * plotHeight;
  }

  /** Main render function */
  getSigmaFromClientX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left - this.config.padding.left) /
      Math.max(1, rect.width - this.config.padding.left - this.config.padding.right)));
    return this.xMin + fraction * (this.xMax - this.xMin);
  }

  render(x: Float64Array, y: Float64Array, energy?: Float64Array, probeIndex?: number): void {
    this.clear();
    
    if (this.config.showGrid) {
      this.drawGrid();
    }
    
    this.drawAxes();
    this.drawString(x, y);
    if (probeIndex !== undefined && probeIndex >= 0 && probeIndex < x.length) this.drawProbe(x[probeIndex], y[probeIndex]);
    
    if (this.config.showEnergy && energy) {
      this.drawEnergy(x, energy);
    }
  }

  /** Clear canvas */
  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /** Draw grid lines */
  private drawGrid(): void {
    const { ctx } = this;
    const { left, right, top, bottom } = this.config.padding;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xTicks = 10;
    for (let i = 0; i <= xTicks; i++) {
      const x = this.mapX(this.xMin + (i / xTicks) * (this.xMax - this.xMin));
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, this.height - bottom);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yTicks = 8;
    for (let i = 0; i <= yTicks; i++) {
      const y = this.mapY(this.yMin + (i / yTicks) * (this.yMax - this.yMin));
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(this.width - right, y);
      ctx.stroke();
    }
  }

  /** Draw axes with labels */
  private drawAxes(): void {
    const { ctx } = this;
    const { left, right, top, bottom } = this.config.padding;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    // X axis
    const y0 = this.mapY(0);
    ctx.beginPath();
    ctx.moveTo(left, y0);
    ctx.lineTo(this.width - right, y0);
    ctx.stroke();

    // X labels
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const xVal = this.xMin + (i / xTicks) * (this.xMax - this.xMin);
      const x = this.mapX(xVal);
      ctx.fillText(xVal.toFixed(1), x, y0 + 20);
      
      ctx.beginPath();
      ctx.moveTo(x, y0 - 4);
      ctx.lineTo(x, y0 + 4);
      ctx.stroke();
    }
    ctx.fillText('x (position)', (left + this.width - right) / 2, this.height - 15);

    // Y axis
    ctx.textAlign = 'right';
    const x0 = this.mapX(0);
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.lineTo(x0, this.height - bottom);
    ctx.stroke();

    // Y labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const yVal = this.yMin + (i / yTicks) * (this.yMax - this.yMin);
      if (Math.abs(yVal) < 0.01) continue;
      const y = this.mapY(yVal);
      ctx.fillText(yVal.toFixed(1), x0 - 10, y + 4);
      
      ctx.beginPath();
      ctx.moveTo(x0 - 4, y);
      ctx.lineTo(x0 + 4, y);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(20, (top + this.height - bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('y (displacement)', 0, 0);
    ctx.restore();
  }

  /** Draw the string as a smooth curve */
  private drawString(x: Float64Array, y: Float64Array): void {
    const { ctx } = this;
    const N = x.length;
    
    if (N < 2) return;

    // Glow effect
    ctx.shadowColor = this.config.stringColor;
    ctx.shadowBlur = 15;
    
    ctx.strokeStyle = this.config.stringColor;
    ctx.lineWidth = this.config.stringWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(this.mapX(x[0]), this.mapY(y[0]));

    // Catmull-Rom spline for smooth curves
    for (let i = 0; i < N - 1; i++) {
      const x0 = i > 0 ? this.mapX(x[i - 1]) : this.mapX(x[0]);
      const y0 = i > 0 ? this.mapY(y[i - 1]) : this.mapY(y[0]);
      const x1 = this.mapX(x[i]);
      const y1 = this.mapY(y[i]);
      const x2 = this.mapX(x[i + 1]);
      const y2 = this.mapY(y[i + 1]);
      const x3 = i < N - 2 ? this.mapX(x[i + 2]) : x2;
      const y3 = i < N - 2 ? this.mapY(y[i + 2]) : y2;

      const cp1x = x1 + (x2 - x0) / 6;
      const cp1y = y1 + (y2 - y0) / 6;
      const cp2x = x2 - (x3 - x1) / 6;
      const cp2y = y2 - (y3 - y1) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw endpoints
    ctx.fillStyle = this.config.stringColor;
    ctx.beginPath();
    ctx.arc(this.mapX(x[0]), this.mapY(y[0]), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.mapX(x[N - 1]), this.mapY(y[N - 1]), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Draw energy density as a heatmap below the string */
  private drawEnergy(x: Float64Array, energy: Float64Array): void {
    const { ctx } = this;
    const N = x.length;
    const { left, right } = this.config.padding;
    
    const maxE = Math.max(...energy) || 1;
    const barHeight = 20;
    const barY = this.height - 35;

    for (let i = 0; i < N - 1; i++) {
      const x1 = this.mapX(x[i]);
      const x2 = this.mapX(x[i + 1]);
      const intensity = energy[i] / maxE;
      
      // Energy is nonnegative, so it uses a sequential dark-to-warm scale
      // rather than the cyan/magenta scale reserved for signed displacement.
      const r = Math.floor(35 + 220 * intensity);
      const g = Math.floor(30 + 175 * intensity);
      const b = Math.floor(45 + 45 * intensity);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x1, barY, x2 - x1, barHeight);
    }
  }

  private drawProbe(x: number, y: number): void {
    const { ctx } = this;
    ctx.fillStyle = '#00d4ff';
    ctx.strokeStyle = '#08131a';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.mapX(x), this.mapY(y), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
  }
}
