# Worldsheet Scrubbing (Deferred Feature)

*Created: 2026-07-31 14:55 IST*
**Status**: DEFERRED — implement after P0, P1, P2 are stable

## Overview

Allow users to click or drag on the worldsheet to set a specific `(σ*, τ*)` pair. The profile panel then shows the snapshot at `τ*` instead of only the present time. This makes the history buffer interactive and turns the animation into a scrubbable recording.

## Interaction

1. **Click on worldsheet**: Sets `σ*` (probe position) at that column
2. **Drag vertically on worldsheet**: Scrubs through time `τ*`
3. **Profile panel**: Shows `y(σ, τ*)` instead of `y(σ, τ₀)` when `τ* < τ₀`
4. **Time cursor**: A bright horizontal line on the worldsheet marks `τ*`

## State

```typescript
interface ScrubState {
  enabled: boolean;
  tauStar: number | null;  // null means "live" (show current time)
  sigmaStar: number;
}
```

## UI Behavior

- When scrubbing is active, pause the simulation (or continue running in background)
- Show a "Live" button to return to `τ* = τ₀`
- The probe trajectory panel shows history up to `τ*`

## Technical Considerations

- Need random access to history samples by time
- The `HistorySample` interface (with explicit `t` field) makes this natural
- May need to interpolate between stored timesteps for smooth scrubbing

## Related

- Deferred from T13
- Terra's review (Point 4)
