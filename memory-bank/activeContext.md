# Active Context

*Last Updated: 2026-07-31 14:55 IST*

## Current Tasks

### Active
- **T10: P0 Bug Fixes** — 🔄 IN PROGRESS
  - T10a: Canvas resize transform accumulation
  - T10b: Causal rays in data space (not pixel space)
  - T10c: History timestamp off-by-one
  - Attribution: Terra review, Sage verification

- **T11: Three-View Layout Redesign** — ⬜ PENDING
  - Linked profile + worldsheet + probe trajectory instrument
  - Desktop 65/35 split, mobile stacked
  - Attribution: Terra review, Deepak mockups

- **T12: Probe Trajectory & Interaction** — ⬜ PENDING
  - Draggable probe on profile
  - Trajectory plot `y(τ; σ*)`
  - Worldsheet vertical probe line
  - Attribution: Terra review, Deepak mockups

- **T13: Enhanced Diagnostics** — ⬜ PENDING
  - T13a: Courant number, max transverse speed, energy drift
  - T13b: Energy strip labeling with formula
  - T13c: Worldsheet field selector (`y`, `∂τy`, `ℰ`, `∂σy`)
  - T13d: Color bar legend
  - Attribution: Terra review

### Paused / Deferred
- T6: Energy Metrics & FFT — 🔄 IN PROGRESS (superseded by T13; FFT spectrum deferred)
- Worldsheet scrubbing — deferred until 2D views are stable
- 3D embedded worldsheet view — deferred indefinitely

## Completed Tasks (Recent)
- T1: Project Setup & Build Tooling — ✅ COMPLETED (2026-07-30)
- T2: Classical String Physics Engine — ✅ COMPLETED (2026-07-30)
- T3: Canvas Rendering Engine — ✅ COMPLETED (2026-07-30)
- T4: UI Controls & Presets — ✅ COMPLETED (2026-07-30)
- T5: Relativistic String Mode — ✅ COMPLETED (2026-07-30, linearized transverse model)
- T7: Deployment — ✅ COMPLETED (2026-07-30)
- T8: Git Repository — ✅ COMPLETED (2026-07-30)
- T9: Simulation Integrity & Responsive UX — ✅ COMPLETED (2026-07-31, **GPT-5.6 Terra**)
  - Fixed finite-difference solver stability (immutable-slice updates)
  - Added curated presets, responsive layout, accessibility improvements
  - Verified desktop and mobile behavior, local storage persistence

## Priority Order (Agreed with Deepak)

1. **P0**: Fix canvas transform, causal rays, history timestamps
2. **P1**: Three-view layout + probe trajectory
3. **P2**: Field selector, energy label, diagnostics
4. **P3**: Worldsheet scrubbing (deferred)
5. **P4**: 3D embedded view (deferred)

## System Status
- Build: ✅ TypeScript compiles, Vite builds successfully
- Physics: ✅ Classical and linearized relativistic solvers with immutable-slice finite differences, stable stepping, boundary conditions, and damping where applicable
- Rendering: ✅ Canvas renderer with smooth curves, visible energy density, and optional relativistic history
- UI: ✅ Full responsive control panel with persisted settings
- Deployment: ✅ Live at quantumofgravity.com/projects/strings-sim/

## Open Questions
- Should the probe trajectory show the `|dy/dτ| = 1` diagonal guide?
  - Terra warns it may confuse with null characteristics
  - Sage: keep it for physics-education audience, label clearly
  - Decision: keep, with explicit label
- Mobile layout: tab-based view switching or stacked scroll?
  - Decision: stacked with collapsible panels (matches mockup)
