# Causal Rays in Data Space

*Created: 2026-07-31 14:55 IST*

## Problem

The `drawLightConeBoundaries()` method in `WorldsheetRenderer` draws lines with fixed 45° pixel slope:

```typescript
// Current (WRONG):
ctx.moveTo(x0, yBottom);
ctx.lineTo(x0 + (yBottom - yTop), yTop); // 45° in PIXEL space
```

This is physically incorrect whenever one pixel in σ and one pixel in τ represent different physical intervals. The light cone boundaries must have slope ±1 in `(σ, τ)` **data space**, then be mapped to screen coordinates.

## Correct Approach

In relativistic natural units, characteristics satisfy:
```
dσ/dτ = ±1
```

So from a source point `(σ₀, τ₀)`:
```
σ(τ) = σ₀ ± (τ − τ₀)
```

### Algorithm

1. Choose source point `(σ₀, τ₀)` — ideally the selected probe point
2. For each ray direction (`+1` and `−1`):
   - Choose `τ_end` (e.g., `τ_max` for upward rays, `τ_min` for downward)
   - Compute `σ_end = σ₀ ± (τ_end − τ₀)`
   - Map both endpoints: `(σ₀, τ₀) → (x₀, y₀)`, `(σ_end, τ_end) → (x_end, y_end)`
   - Draw line segment
3. Repeat for boundary reflections if desired (sparse, not a dense lattice)

### Code

```typescript
private drawLightConeBoundaries(): void {
  const { ctx } = this;
  const sourceSigma = this.probeSigma ?? (this.sigmaMin + this.sigmaMax) / 2;
  const sourceTau = this.tauMax; // or current time

  ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  // Draw rays from source point
  for (const slope of [+1, -1]) {
    const tauEnd = this.tauMin;
    const sigmaEnd = sourceSigma + slope * (tauEnd - sourceTau);

    const x0 = this.mapSigma(sourceSigma);
    const y0 = this.mapTau(sourceTau);
    const x1 = this.mapSigma(sigmaEnd);
    const y1 = this.mapTau(tauEnd);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}
```

### Key Insight

The screen angle will **not** be 45° unless the aspect ratio of the plot area (in pixels) matches the aspect ratio of the data window `(σ_max − σ_min) : (τ_max − τ_min)`. That's fine — the physics is in the data space slope, not the screen angle.

## Verification

1. Run a traveling Gaussian packet in relativistic mode
2. The packet should propagate along the light cone boundaries
3. Adjust window size: the ray angle on screen should change, but the packet should still track the ray in data space

## Related

- T10b
- Terra's review (Point 5)
