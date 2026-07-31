# History Timestamp Off-by-One Fix

*Created: 2026-07-31 14:55 IST*

## Problem

In `RelativisticStringSolver.step()`, the history snapshot is pushed **before** `state.t` is incremented:

```typescript
step(): void {
  // Store history BEFORE evolution
  this.history.push(new Float64Array(y));
  
  // ... evolve ...
  
  this.state.t += dt;  // t increments AFTER push
  
  this.buildWorldsheet();
}
```

Then `buildWorldsheet()` reconstructs timestamps:

```typescript
const t = this.state.t - (history.length - 1 - h) * this.config.dt;
```

### Trace for first two steps

| Step | Action | `state.t` after step | History index | Reconstructed `t` | Actual capture time |
|------|--------|---------------------|---------------|-------------------|-------------------|
| 0 | push `y₀` | `Δτ` | h=0 | `Δτ − 1·Δτ = 0` | 0 ✓ |
| 1 | push `y₁` | `2Δτ` | h=0 | `2Δτ − 1·Δτ = Δτ` | 0 ✗ |
| | | | h=1 | `2Δτ − 0·Δτ = 2Δτ` | `Δτ` ✗ |

Wait — let me re-trace more carefully.

After step 0:
- `history = [y₀]` (captured at t=0)
- `state.t = Δτ`
- Reconstruction for h=0: `t = Δτ - (1 - 1 - 0)*dt = Δτ - 0 = Δτ`
- **Labeled as `Δτ`, but was captured at `0`** ← BUG

After step 1:
- `history = [y₀, y₁]` (captured at t=0, t=Δτ)
- `state.t = 2Δτ`
- Reconstruction for h=0: `t = 2Δτ - (2 - 1 - 0)*dt = 2Δτ - 1*dt = Δτ`
- **Labeled as `Δτ`, but was captured at `0`** ← BUG
- Reconstruction for h=1: `t = 2Δτ - (2 - 1 - 1)*dt = 2Δτ - 0 = 2Δτ`
- **Labeled as `2Δτ`, but was captured at `Δτ`** ← BUG

Every profile is labeled one `Δτ` too late.

## Fix Options

### Option A: Adjust reconstruction formula (minimal change)

Change `buildWorldsheet()`:
```typescript
const t = this.state.t - (history.length - h) * this.config.dt;
//                                 ^ removed "- 1"
```

After step 1 with this fix:
- h=0: `t = 2Δτ - 2*dt = 0` ✓ (was captured at 0)
- h=1: `t = 2Δτ - 1*dt = Δτ` ✓ (was captured at Δτ)

### Option B: Store `{ t, y }` objects (cleaner, future-proof)

```typescript
interface HistorySample {
  t: number;
  y: Float64Array;
}

private history: HistorySample[] = [];

step(): void {
  // Store with explicit timestamp BEFORE evolving
  this.history.push({
    t: this.state.t,
    y: new Float64Array(this.state.y)
  });
  
  // ... evolve ...
  
  this.state.t += dt;
}

buildWorldsheet(): void {
  for (const sample of this.history) {
    const t = sample.t;  // Use recorded time directly
    const y = sample.y;
    // ...
  }
}
```

This is clearer and avoids any reconstruction ambiguity. It also enables features like worldsheet scrubbing (clicking to view a past state) since each sample carries its exact time.

### Recommendation

Use **Option B** — it's only slightly more code but eliminates the class of timestamp bugs entirely and makes the code self-documenting.

## Additional Fix: Include Initial State

When the simulation is paused at `τ = 0`, the worldsheet should still show the initial profile. Currently, `buildWorldsheet()` returns early if `history.length < 2`.

With Option B, the initial profile at `τ = 0` is naturally included as the first history sample.

## Verification

1. Start simulator, pause immediately
2. Worldsheet should show one row (the initial profile) at `τ = 0`
3. Step once: worldsheet shows two rows at `τ = 0` and `τ = Δτ`
4. Verify row positions match the labeled times

## Related

- T10c
- Terra's review (Point 8)
