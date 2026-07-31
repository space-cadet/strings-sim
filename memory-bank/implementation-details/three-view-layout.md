# Three-View Layout Architecture

*Created: 2026-07-31 14:55 IST*
**Attribution**: GPT-5.6 Terra (OpenAI), Deepak Vaid mockups

## Concept

The simulator becomes a **linked three-view instrument**:

```
A: Live Profile  ──►  B: Selected Probe (σ*)
      │                      │
      ▼                      ▼
D: Worldsheet ◄────── C: Probe Trajectory y(τ;σ*)
```

Each view is mathematically distinct:

| View | Math | Type | Primary? |
|------|------|------|----------|
| **Live Profile** | `y(σ, τ₀)` | Curve plot | Yes — largest panel |
| **Worldsheet** | `y(σ, τ)` | Heatmap | Yes — principal history |
| **Probe Trajectory** | `y(τ; σ*)` | Time series | No — secondary, collapsible |

## Desktop Layout (~65/35 split)

```
┌─────────────────────────────────────────┬──────────────────────┐
│                                         │                      │
│   y(σ, τ₀) — String Profile             │   Controls           │
│   (largest panel, ~40% of viewport)     │   - Presets          │
│                                         │   - Boundary         │
│   [Energy strip ℰ(σ,τ₀)]                │   - Parameters       │
│                                         │   - Playback         │
│                                         │   - Mode toggle      │
├─────────────────────────────────────────┤                      │
│   Worldsheet y(σ,τ)                     │   Metrics            │
│   (σ horizontal, τ vertical)            │   - E, E_kin, E_p    │
│   ~2.5:1 aspect ratio                   │   - Courant #        │
│   Fixed temporal window (e.g. 5L-10L)   │   - Max |ẏ|         │
│                                         │                      │
├─────────────────────────────────────────┤                      │
│   Probe Trajectory y(τ;σ*)              │                      │
│   (compact, collapsible)                │                      │
│   Rolling τ window matched to worldsheet│                      │
└─────────────────────────────────────────┴──────────────────────┘
        ~65%                                        ~35%
```

## Mobile Layout (stacked)

```
┌─────────────────────────┐
│  y(σ, τ₀) — Profile     │
│  (full width)            │
├─────────────────────────┤
│  [Thin playback strip]   │
├─────────────────────────┤
│  [Mode/preset strip]     │
├─────────────────────────┤
│  Worldsheet y(σ,τ)      │
│  (taller than current)   │
├─────────────────────────┤
│  Probe Trajectory        │
│  (collapsed by default)  │
├─────────────────────────┤
│  [Expandable controls]   │
└─────────────────────────┘
```

**Key mobile rule**: Do not overlay large playback controls across plot area. Place them below the plot or use a thin floating strip that doesn't hide the energy bar.

## Worldsheet Design

### Aspect Ratio
- Wider than tall: ~2.5:1
- This emphasizes the spatial dimension (σ) over time
- Fixed temporal window in physical units, not step count

### Temporal Window
- Display last `5L` to `10L` in natural units
- Independent of grid resolution and time scale
- Example: if `L = 2`, show last `10` time units

### Fixed Symmetric Scale
- Color range: `[-y_max, +y_max]` over displayed window
- `y_max = max |y(σ, τ)|` within the visible temporal window
- Dark neutral at `y = 0`
- Cyan for positive, magenta/purple for negative

### Time Cursor
- Bright horizontal line at current `τ`
- This is a **time cursor**, not the embedded string shape

## CSS Grid Structure (Sketch)

```css
.simulator-container {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 65/35 */
  grid-template-rows: auto auto auto;
  gap: 1rem;
}

.visualization-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Mobile */
@media (max-width: 768px) {
  .simulator-container {
    grid-template-columns: 1fr;
  }
}
```

## Panel Visibility States

| State | Profile | Worldsheet | Probe Trajectory |
|-------|---------|-----------|-----------------|
| Default (no probe) | Visible | Visible | Hidden/collapsed |
| Probe selected | Visible | Visible | Visible |
| Mobile — probe tab | Hidden | Hidden | Visible |

## Related

- T11
- Terra's review (Point 1, 2, 4)
