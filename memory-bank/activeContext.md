# Active Context

*Last Updated: 2026-08-03 00:36:36 IST*

## Current Tasks

### Active
- **T16: Mathematical Glossary and Contextual Help System** — 🔄 IN PROGRESS
  - Foundation delivered: shared registry, linked static tabs, initial Learn content, and five contextual help controls
  - Remaining: all-control coverage, full glossary/numerical copy, richer experiments, mobile validation, and publication
  - Linked static tabs: Simulator, Learn, Glossary, and How it works
  - Shared glossary registry, accessible question-mark help controls, guided experiments, and full mathematical/numerical documentation

- **T11: Three-View Layout Redesign** — 🔄 IN PROGRESS
  - Linked profile + worldsheet + probe trajectory instrument
  - Desktop 65/35 split, mobile stacked
  - Implementation: GPT-5.6 Terra (Codex); inputs: Terra review and Deepak mockups

- **T12: Probe Trajectory & Interaction** — ⬜ PENDING
  - Draggable probe on profile
  - Trajectory plot `y(τ; σ*)`
  - Worldsheet vertical probe line
  - Attribution: Terra review, Deepak mockups

- **T13: Enhanced Diagnostics** — 🔄 IN PROGRESS
  - T13a: Courant number, max transverse speed, energy drift
  - T13b: Energy strip labeling with formula
  - T13c: Worldsheet field selector (`y`, `∂τy`, `ℰ`, `∂σy`)
  - T13d: Color bar legend
  - Implementation: GPT-5.6 Terra (Codex); inputs: Terra review

### Paused / Deferred
- T6: Energy Metrics & FFT — 🔄 IN PROGRESS (superseded by T13; FFT spectrum deferred)
- Worldsheet scrubbing — deferred until 2D views are stable
- 3D embedded worldsheet view — deferred indefinitely

## Completed Tasks (Recent)

- T10: P0 Bug Fixes — ✅ COMPLETED (2026-07-31)
  - DPR-safe resize, data-space characteristics, timestamped histories, mobile repaint recovery
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

1. **P1**: Three-view layout + probe trajectory
2. **P1**: Mathematical glossary, documentation, and contextual help
3. **P2**: Field selector, energy label, diagnostics
4. **P3**: Worldsheet scrubbing (deferred)
5. **P4**: 3D embedded view (deferred)

## System Status
- Build: ✅ TypeScript compiles, Vite builds successfully
- Physics: ✅ Classical and linearized relativistic solvers with immutable-slice finite differences, stable stepping, boundary conditions, and damping where applicable
- Rendering: ✅ Classical and relativistic worldsheets, bounded responsive plot wrapper, mobile repaint recovery
- UI: ✅ Responsive instrument layout, persisted settings, separate playback strip, live diagnostic cards
- Deployment: ✅ Live at quantumofgravity.com/projects/strings-sim/

## Open Questions
- The glossary must describe the linearized relativistic teaching model precisely without implying a full quantum, interacting string-theory calculation.
- Tooltip text should remain short and plain-language; detailed formulae, implementation notes, and caveats belong in the linked documentation section.
- Tabs are ordinary nested static-page links, not a JavaScript-only control, so each view has a stable bookmarkable URL.
- T16 foundation has passed build and browser navigation/deep-link checks; do not claim a completed full glossary or mobile verification yet.
- Should the probe trajectory show the `|dy/dτ| = 1` diagonal guide?
  - Terra warns it may confuse with null characteristics
  - Sage: keep it for physics-education audience, label clearly
  - Decision: keep, with explicit label
- Mobile layout: tab-based view switching or stacked scroll?
  - Decision: stacked with collapsible panels (matches mockup)
