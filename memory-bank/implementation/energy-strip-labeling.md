# Energy Strip Labeling

*Created: 2026-07-31 14:55 IST*
**Attribution**: GPT-5.6 Terra (OpenAI)

## Overview

Currently, energy density is rendered as a gradient fill under the string profile curve. This is attractive but ambiguous — it's unclear what the colors represent and the energy scale is not visible.

## Proposed Design

### 1. Separate Energy Strip

Instead of filling under the curve, draw energy as a **thin horizontal strip** below the profile:

```
  y
  │    ╭──╮
  │   ╱    ╲      ← String profile y(σ,τ₀)
  │──╯      ╰──
  │
  └────────────── σ
  
  [▓▓▓▓▓▓▓░░░░░]  ← Energy strip ℰ(σ,τ₀)
  low        high
```

### 2. Explicit Label

```
ℰ(σ, τ₀) = ½μ(∂τy)² + ½τ(∂σy)²
```

In relativistic mode: `ℰ = ½[(∂τy)² + (∂σy)²]` (since `μ = τ = 1`).

### 3. Sequential Palette

Energy is nonnegative, so use a sequential (not diverging) palette:
- `ℰ = 0`: dark/neutral
- `ℰ = ℰ_max`: bright (white/yellow/orange)

This distinguishes it from displacement which uses diverging (cyan/magenta).

### 4. Toggle Visibility

Make the energy strip optional — some users may prefer a cleaner profile plot:

```html
<label>
  <input type="checkbox" id="show-energy-strip" checked>
  Show energy density
</label>
```

Persist to `localStorage`.

## Implementation

New file: `src/visualization/energy-strip.ts`

```typescript
export class EnergyStripRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  render(energy: Float64Array, maxEnergy: number): void {
    const N = energy.length;
    const stripHeight = 20; // pixels
    
    for (let i = 0; i < N; i++) {
      const t = energy[i] / maxEnergy;
      const color = sequentialEnergyColor(t);
      
      const x = this.mapX(i / (N - 1));
      const width = this.mapX((i + 1) / (N - 1)) - x;
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, 0, width, stripHeight);
    }
  }
}

function sequentialEnergyColor(t: number): string {
  // Dark → bright heatmap
  const r = Math.floor(30 + 225 * Math.min(t, 1));
  const g = Math.floor(30 + 150 * Math.min(t, 1));
  const b = Math.floor(30 + 50 * Math.min(t, 1));
  return `rgb(${r}, ${g}, ${b})`;
}
```

## Placement in Layout

### Desktop
- Directly below the profile plot, same width
- Thin (20-30px tall)

### Mobile
- Same, or hidden by default to save space

## Related

- T13b
- Terra's review (Point 3)
