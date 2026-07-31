# Diagnostics: Courant Number & Max Transverse Speed

*Created: 2026-07-31 14:55 IST*
**Attribution**: GPT-5.6 Terra (OpenAI), Sage (OpenClaw) review

## Overview

Add two compact numerical diagnostics to the metrics panel. These replace the less informative metrics and provide real-time feedback on simulation correctness.

## 1. Courant Number

### Definition

The Courant–Friedrichs–Lewy (CFL) condition for the explicit wave equation scheme:

```
λ = c · Δt / Δx   (classical)
λ = Δτ / Δσ       (relativistic, where c = 1)
```

For stability: `λ ≤ 1`.

The current code already computes a conservative timestep:
```typescript
export function stableTimeStep(dx: number, params: StringParameters, mode: PhysicsMode): number {
  const c = mode === 'relativistic' ? 1.0 : waveSpeed(params);
  return (0.5 * dx) / c; // Conservative: λ = 0.5
}
```

So the Courant number should always be `0.5` unless the user manually changes parameters.

### Why Show It?

- **Educational**: Teaches students about the CFL condition
- **Debugging**: If it ever exceeds 1, the simulation will become unstable
- **Verification**: Confirms that the timestep logic is working

### Display

```
Courant: 0.50  ✓
```

Green checkmark when `λ ≤ 1`, red warning when `λ > 1`.

### Code

```typescript
getCourantNumber(): number {
  const c = this.config.mode === 'relativistic' ? 1.0 : waveSpeed(this.config.params);
  return c * this.config.dt / this.config.dx;
}
```

## 2. Max Transverse Speed

### Definition

```
max |ẏ| = max_σ |∂y/∂τ|
```

This is the maximum transverse velocity anywhere on the string.

### Why Rename from "Causality"?

The current label "Causality" with `✓ Causal` / `⚠ Acausal` is misleading. In the linearized approximation:
- `max |ẏ| ≤ 1` does **not** prove causality in the full Nambu-Goto sense
- It merely checks that transverse velocities don't exceed the speed of light
- True causality requires the Virasoro constraints

A more honest label: **"Max |∂y/∂τ|"** or **"Max transverse speed"**.

### Display

```
Max |ẏ|: 0.62  ✓
```

Green when `≤ 1`, red when `> 1`.

### Code

```typescript
getMaxTransverseSpeed(): number {
  const { v } = this.state;
  let maxSpeed = 0;
  for (let i = 0; i < v.length; i++) {
    maxSpeed = Math.max(maxSpeed, Math.abs(v[i]));
  }
  return maxSpeed;
}
```

## 3. Energy Drift (Relativistic Mode)

### Definition

```
ΔE/E₀ = (E(τ) − E(0)) / E(0)
```

In relativistic mode with no damping, energy should be conserved. A growing energy drift indicates numerical instability or a bug.

### Display

```
ΔE/E₀: +0.3%  ✓
```

Green when `|ΔE/E₀| < 1%`, yellow when `< 5%`, red when `≥ 5%`.

### Code

```typescript
private initialEnergy: number = 0;

initialize(): void {
  // ...
  this.initialEnergy = this.getMetrics().totalEnergy;
}

getEnergyDrift(): number {
  if (this.initialEnergy === 0) return 0;
  const current = this.getMetrics().totalEnergy;
  return (current - this.initialEnergy) / this.initialEnergy;
}
```

## Placement in UI

Compact metrics row in the right panel:

```
Energy:     1.234    Courant:    0.50  ✓
E_kin:      0.617    Max |ẏ|:    0.62  ✓
E_pot:      0.617    ΔE/E₀:     +0.3%  ✓
Speed:      1.000    f₁:        0.250
```

## Related

- T13a
- Terra's review (Point 7)
