/** Draws the target-space projection of the T18 closed-string embedding. */

export class EmbeddingRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

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
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  render(x: Float64Array, y: Float64Array): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (x.length < 2 || x.length !== y.length) return;

    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = 0; i < x.length; i++) {
      xMin = Math.min(xMin, x[i]);
      xMax = Math.max(xMax, x[i]);
      yMin = Math.min(yMin, y[i]);
      yMax = Math.max(yMax, y[i]);
    }
    const span = Math.max(xMax - xMin, yMax - yMin, 0.1);
    const padding = 42;
    const scale = Math.min((this.width - 2 * padding) / span, (this.height - 2 * padding) / span);
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const mapX = (value: number) => this.width / 2 + (value - centerX) * scale;
    const mapY = (value: number) => this.height / 2 - (value - centerY) * scale;

    this.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(padding, this.height / 2);
    this.ctx.lineTo(this.width - padding, this.height / 2);
    this.ctx.moveTo(this.width / 2, padding);
    this.ctx.lineTo(this.width / 2, this.height - padding);
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.shadowColor = '#00d2a0';
    this.ctx.shadowBlur = 14;
    this.ctx.strokeStyle = '#00d2a0';
    this.ctx.lineWidth = 2.4;
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(mapX(x[0]), mapY(y[0]));
    for (let i = 1; i < x.length; i++) this.ctx.lineTo(mapX(x[i]), mapY(y[i]));
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.fillStyle = 'rgba(255,255,255,0.55)';
    this.ctx.font = '11px "Segoe UI", sans-serif';
    this.ctx.fillText('target X', this.width - padding - 48, this.height / 2 - 8);
    this.ctx.fillText('target Y', this.width / 2 + 8, padding + 12);
  }
}
