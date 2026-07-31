# Probe Trajectory Implementation

*Created: 2026-07-31 14:55 IST*
**Attribution**: GPT-5.6 Terra (OpenAI), Deepak Vaid mockups

## Overview

The probe trajectory replaces the current "Relativistic History" panel. It is a **proper graph** showing the motion of one labelled point on the string over time.

## Mathematical Content

- **Horizontal axis**: `τ` (time)
- **Vertical axis**: `y(σ*, τ)` — transverse displacement of probe point
- **Content**: One vivid trace for the selected probe
- **Optional**: Two additional faint traces for pinned secondary probes

This is **not** a worldsheet — it is one timelike curve on the worldsheet, projected into displacement vs. time.

## Visual Design

### Desktop
- Compact panel below the worldsheet
- Rolling time window matched to worldsheet (e.g., last `5L-10L`)
- Cyan trace for primary probe
- Fainter traces (e.g., orange, green) for secondary probes

### Mobile
- Collapsed by default
- Expands below worldsheet when probe is selected
- Or: tab-based switching (Profile / Worldsheet / Probe)

## Probe Selection

### From Profile
1. User clicks or drags on the `y(σ, τ₀)` profile
2. Nearest grid point becomes `σ*`
3. Cyan dot appears at that position
4. Probe trajectory panel becomes visible

### From Worldsheet
1. User clicks on worldsheet heatmap
2. `σ*` is set to the clicked column
3. (Future: `τ*` could also be set for scrubbing)

### Programmatic
```typescript
setProbe(sigma: number): void {
  const index = Math.round(sigma / this.config.dx);
  this.probe.sigma = index * this.config.dx;
  this.probe.sigmaIndex = Math.min(Math.max(index, 0), this.config.N - 1);
}
```

## Trajectory Buffer

The probe needs only a **1D history** (one scalar per timestep), decoupled from the full worldsheet history:

```typescript
interface ProbeTrajectory {
  sigmaIndex: number;
  sigma: number;
  history: Float64Array;  // y values
  maxHistory: number;     // in steps, or physical time window
}
```

### Buffer Management
```typescript
recordProbeState(y: Float64Array, t: number): void {
  this.probe.history.push(y[this.probe.sigmaIndex]);
  
  // Maintain rolling window
  const maxSteps = Math.ceil(this.timeWindow / this.config.dt);
  if (this.probe.history.length > maxSteps) {
    this.probe.history.shift();
  }
}
```

## Renderer

New file: `src/visualization/probe-trajectory.ts`

```typescript
export class ProbeTrajectoryRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  render(trajectory: ProbeTrajectory, bounds: { tMin: number; tMax: number }): void {
    this.clear();
    this.drawGrid();
    this.drawAxes();
    
    // Primary trace (vivid cyan)
    this.drawTrace(trajectory.history, '#00d4ff', 2);
    
    // y = 0 reference line
    this.drawZeroLine();
  }
}
```

### Optional Velocity Guide

Terra warns that a diagonal `|dy/dτ| = 1` line can be confused with null characteristics. However, for a physics-education audience, it provides useful intuition:

```typescript
// Small indicator in corner, not a full diagonal line
private drawVelocityIndicator(maxSpeed: number): void {
  const gaugeWidth = 60;
  const gaugeHeight = 8;
  
  // Background
  this.ctx.fillStyle = '#333';
  this.ctx.fillRect(x, y, gaugeWidth, gaugeHeight);
  
  // Fill up to maxSpeed (clamped to 1.0)
  const fillWidth = gaugeWidth * Math.min(maxSpeed, 1.0);
  this.ctx.fillStyle = maxSpeed <= 1.0 ? '#0f0' : '#f00';
  this.ctx.fillRect(x, y, fillWidth, gaugeHeight);
}
```

Alternatively, keep the diagonal guide but label it clearly: "`|∂y/∂τ| = 1` guide (light speed in transverse direction)"

## Worldsheet Linkage

The probe connects all three views:

1. **Profile**: Cyan dot at `σ = σ*`
2. **Worldsheet**: Thin vertical line at `σ = σ*`
3. **Trajectory**: Trace of `y(τ; σ*)`

All three use the same probe color (e.g., `#00d4ff`) for visual linkage.

## Related

- T12
- Terra's review (Point 3, 6)
