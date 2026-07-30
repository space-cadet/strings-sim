/**
 * Worldsheet renderer for relativistic string visualization
 *
 * Shows the string's trajectory through spacetime, making the
 * worldsheet geometry visible.
 */

import { WorldsheetPoint } from '../physics/relativistic';

export interface WorldsheetRendererConfig {
  canvas: HTMLCanvasElement;
  padding?: { top: number; right: number; bottom: number; left: number };
  stringColor?: string;
  trailColor?: string;
  lightConeColor?: string;
  showLightCones?: boolean;
  showTrails?: boolean;
}

export class WorldsheetRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<WorldsheetRendererConfig>;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Coordinate mapping
  private tMin: number = 0;
  private tMax: number = 1;
  private xMin: number = 0;
  private xMax: number = 1;

  constructor(config: WorldsheetRendererConfig) {
    this.canvas = config.canvas;
    this.ctx = config.canvas.getContext('2d')!;
    this.config = {
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
      stringColor: '#00d4ff',
      trailColor: 'rgba(0, 212, 255, 0.3)',
      lightConeColor: 'rgba(255, 200, 100, 0.4)',
      showLightCones: true,
      showTrails: true,
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

  setBounds(tMin: number, tMax: number, xMin: number, xMax: number): void {
    this.tMin = tMin;
    this.tMax = tMax;
    this.xMin = xMin;
    this.xMax = xMax;
  }

  private mapT(t: number): number {
    const { left, right } = this.config.padding;
    const plotWidth = this.width - left - right;
    return left + ((t - this.tMin) / (this.tMax - this.tMin)) * plotWidth;
  }

  private mapX(x: number): number {
    const { top, bottom } = this.config.padding;
    const plotHeight = this.height - top - bottom;
    return top + (1 - (x - this.xMin) / (this.xMax - this.xMin)) * plotHeight;
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  render(worldsheet: WorldsheetPoint[][], currentTime: number, stringLength: number): void {
    this.clear();
    this.drawGrid(stringLength);
    this.drawAxes();

    if (this.config.showLightCones) {
      this.drawLightCones(currentTime, stringLength);
    }

    if (this.config.showTrails) {
      this.drawTrails(worldsheet);
    }

    this.drawCurrentString(worldsheet, currentTime);
  }

  private drawGrid(stringLength: number): void {
    const { ctx } = this;
    const { left, right, top, bottom } = this.config.padding;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical grid (time)
    const tTicks = 8;
    for (let i = 0; i <= tTicks; i++) {
      const t = this.tMin + (i / tTicks) * (this.tMax - this.tMin);
      const x = this.mapT(t);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, this.height - bottom);
      ctx.stroke();
    }

    // Horizontal grid (space)
    const xTicks = 6;
    for (let i = 0; i <= xTicks; i++) {
      const x = this.xMin + (i / xTicks) * (this.xMax - this.xMin);
      const y = this.mapX(x);
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

    // T axis (horizontal)
    const y0 = this.mapX(0);
    ctx.beginPath();
    ctx.moveTo(left, y0);
    ctx.lineTo(this.width - right, y0);
    ctx.stroke();

    // T labels
    ctx.textAlign = 'center';
    const tTicks = 5;
    for (let i = 0; i <= tTicks; i++) {
      const tVal = this.tMin + (i / tTicks) * (this.tMax - this.tMin);
      const x = this.mapT(tVal);
      ctx.fillText(tVal.toFixed(1), x, y0 + 20);

      ctx.beginPath();
      ctx.moveTo(x, y0 - 4);
      ctx.lineTo(x, y0 + 4);
      ctx.stroke();
    }
    ctx.fillText('t (time)', (left + this.width - right) / 2, this.height - 15);

    // X axis (vertical)
    ctx.textAlign = 'right';
    const x0 = this.mapT(0);
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.lineTo(x0, this.height - bottom);
    ctx.stroke();

    // X labels
    const xTicks = 4;
    for (let i = 0; i <= xTicks; i++) {
      const xVal = this.xMin + (i / xTicks) * (this.xMax - this.xMin);
      if (Math.abs(xVal) < 0.01) continue;
      const y = this.mapX(xVal);
      ctx.fillText(xVal.toFixed(1), x0 - 10, y + 4);

      ctx.beginPath();
      ctx.moveTo(x0 - 4, y);
      ctx.lineTo(x0 + 4, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(20, (top + this.height - bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('x (position)', 0, 0);
    ctx.restore();
  }

  private drawLightCones(currentTime: number, stringLength: number): void {
    const { ctx } = this;

    ctx.strokeStyle = this.config.lightConeColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Light cones from endpoints (slope = ±1 in natural units)
    const endpoints = [0, stringLength];

    for (const x0 of endpoints) {
      const x = this.mapX(x0);
      const t = this.mapT(currentTime);

      // Past light cone (extending backward in time)
      const tPast = this.mapT(Math.max(this.tMin, currentTime - stringLength));

      ctx.beginPath();
      ctx.moveTo(this.mapT(currentTime), x);
      ctx.lineTo(tPast, this.mapX(Math.max(0, x0 - (currentTime - this.tMin))));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.mapT(currentTime), x);
      ctx.lineTo(tPast, this.mapX(Math.min(stringLength, x0 + (currentTime - this.tMin))));
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  private drawTrails(worldsheet: WorldsheetPoint[][]): void {
    const { ctx } = this;

    ctx.strokeStyle = this.config.trailColor;
    ctx.lineWidth = 1;

    for (const line of worldsheet) {
      if (line.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(this.mapT(line[0].t), this.mapX(line[0].y));

      for (let i = 1; i < line.length; i++) {
        ctx.lineTo(this.mapT(line[i].t), this.mapX(line[i].y));
      }

      ctx.stroke();
    }
  }

  private drawCurrentString(worldsheet: WorldsheetPoint[][], currentTime: number): void {
    const { ctx } = this;

    if (worldsheet.length === 0) return;

    // Find the current string configuration (last point in each line)
    ctx.shadowColor = this.config.stringColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = this.config.stringColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();

    // Get last point from each line (most recent time)
    const firstPoint = worldsheet[0][worldsheet[0].length - 1];
    ctx.moveTo(this.mapT(firstPoint.t), this.mapX(firstPoint.y));

    for (let i = 1; i < worldsheet.length; i++) {
      const line = worldsheet[i];
      const point = line[line.length - 1];
      ctx.lineTo(this.mapT(point.t), this.mapX(point.y));
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw endpoints with glow
    const firstEndpoint = worldsheet[0][worldsheet[0].length - 1];
    const lastEndpoint = worldsheet[worldsheet.length - 1][worldsheet[worldsheet.length - 1].length - 1];

    ctx.fillStyle = this.config.stringColor;
    ctx.shadowColor = this.config.stringColor;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(this.mapT(firstEndpoint.t), this.mapX(firstEndpoint.y), 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.mapT(lastEndpoint.t), this.mapX(lastEndpoint.y), 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}
