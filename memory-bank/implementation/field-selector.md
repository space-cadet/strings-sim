# Field Selector for Worldsheet

*Created: 2026-07-31 14:55 IST*
**Attribution**: GPT-5.6 Terra (OpenAI)

## Overview

A dropdown or button group above the worldsheet that selects which physical quantity to display. This turns one visualization panel into four.

## Available Fields

| Field | Symbol | Derivation | Color Palette | Use Case |
|-------|--------|-----------|---------------|----------|
| **Transverse displacement** | `y` | Direct | Diverging (cyan+/magenta-) | Default; wave propagation |
| **Transverse velocity** | `∂τ y` | `v[i]` from solver | Diverging | Turning points, moving packets |
| **Energy density** | `ℰ` | `½μv² + ½τ(slope)²` | Sequential | Energy flow, localization |
| **Local slope** | `∂σ y` | `(y[i+1] - y[i-1])/(2dx)` | Diverging | Steepening, mode structure |

## Derivation Details

### Displacement (`y`)
Direct from solver state: `history[h][i]`

### Velocity (`∂τ y`)
From solver state: `state.v[i]` at each timestep, or finite difference:
```typescript
v = (y_current - y_previous) / dt
```

### Energy Density (`ℰ`)
```typescript
const v2 = v[i] ** 2;
const slope = (y[i + 1] - y[i - 1]) / (2 * dx);
energy[i] = 0.5 * mu * v2 + 0.5 * tau * slope ** 2;
```
In relativistic mode: `μ = τ = 1`, so `ℰ = ½(v² + slope²)`.

### Local Slope (`∂σ y`)
```typescript
slope[i] = (y[i + 1] - y[i - 1]) / (2 * dx);
```

## Color Mapping

### Diverging (for signed fields: `y`, `∂τ y`, `∂σ y`)

```typescript
function divergingColor(value: number, maxVal: number): string {
  const norm = value / maxVal; // [-1, 1]
  
  if (norm < 0) {
    // Negative: purple/magenta
    const t = Math.abs(norm);
    const r = Math.floor(128 + 127 * t);
    const g = Math.floor(0 + 50 * t);
    const b = Math.floor(200 + 55 * t);
    return `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * t})`;
  } else {
    // Positive: cyan
    const t = norm;
    const r = Math.floor(0 + 50 * t);
    const g = Math.floor(128 + 127 * t);
    const b = Math.floor(200 + 55 * t);
    return `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * t})`;
  }
}
```

- `value = 0`: dark neutral (`rgba(30, 30, 30, 1)`)
- `value = +max`: bright cyan
- `value = -max`: bright magenta

### Sequential (for nonnegative fields: `ℰ`)

```typescript
function sequentialColor(value: number, maxVal: number): string {
  const t = value / maxVal; // [0, 1]
  // White/yellow heatmap
  const r = Math.floor(50 + 205 * t);
  const g = Math.floor(50 + 150 * t);
  const b = Math.floor(50 + 50 * t);
  return `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * t})`;
}
```

## Fixed Symmetric Scale

For signed fields, the scale must be **symmetric** around zero:

```typescript
// Compute max over visible temporal window
let yMax = 0;
for (const sample of visibleHistory) {
  for (const val of sample) {
    yMax = Math.max(yMax, Math.abs(val));
  }
}
// Scale is [-yMax, +yMax]
```

This prevents color shifts when a wave packet moves — the zero crossing stays dark.

## Color Bar

Compact vertical bar on the right side of the worldsheet:

```
┌──────────┬─────┐
│          │ +max│
│  Heatmap │     │
│          │  0  │
│          │     │
│          │ -max│
└──────────┴─────┘
```

Implementation: draw a vertical gradient rectangle with tick labels.

## UI Control

```html
<select id="worldsheet-field">
  <option value="y">y — Displacement</option>
  <option value="v">∂τy — Velocity</option>
  <option value="energy">ℰ — Energy density</option>
  <option value="slope">∂σy — Slope</option>
</select>
```

## Related

- T13c
- Terra's review (Point 4)
