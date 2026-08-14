# Active Context

*Last Updated: 2026-08-14 19:28:22 IST*

## Current Tasks

### Active
- **T16: Mathematical Glossary and Contextual Help System** — 🔄 IN PROGRESS
  - Current-control expansion delivered: shared registry, local KaTeX, seven Learn experiments, and contextual help for the implemented controls and diagnostics
  - T13 entries and links are delivered; remaining: final live-release verification after publication
  - Linked static tabs: Simulator, Learn, Glossary, and How it works
  - Shared glossary registry, accessible question-mark help controls, guided experiments, and full mathematical/numerical documentation

- **T11: Three-View Layout Redesign** — 🔄 IN PROGRESS
  - Linked profile + worldsheet + probe trajectory instrument
  - Desktop 65/35 split, mobile stacked
  - Implementation: GPT-5.6 Terra (Codex); inputs: Terra review and Deepak mockups

- **T12: Probe Trajectory & Interaction** — ✅ COMPLETED
  - Primary draggable/clickable probe implemented on profile and worldsheet
  - Linked trajectory plot $y(\sigma_\ast,\tau)$, cyan profile marker, and worldsheet worldline implemented
  - User manual acceptance confirmed 2026-08-14
  - Attribution: Terra review, Deepak mockups

- **T13: Enhanced Diagnostics** — 🔄 IN PROGRESS
  - T13a–d implementation delivered: Courant/max-speed/energy-drift diagnostics, optional sequential energy strip, four-field selector, and colour bar
  - Remaining: long-run relativistic drift regression and mobile manual acceptance
  - Implementation: GPT-5.6 Terra (Codex); inputs: Terra review

### Paused / Deferred
- **T17–T20: String-Theory Expansion Roadmap** — ⏸️ PLANNED
  - T17 preserves and documents the current linear reference model; T18 is a constraint-preserving nonlinear classical solver; T19 is a finite free-quantum mode visualizer; T20 is a conceptual perturbative-interaction visualizer.
  - No solver, quantum-state, or interaction feature has started. See `implementation-details/full-string-development-roadmap.md`.
- Worldsheet scrubbing — deferred until 2D views are stable
- 3D embedded worldsheet view — deferred indefinitely

## Completed Tasks (Recent)

- T10: P0 Bug Fixes — ✅ COMPLETED (2026-07-31)
- T12: Probe Trajectory & Interaction — ✅ COMPLETED (2026-08-14, user acceptance confirmed)
- T6: Energy Metrics & FFT — ✅ COMPLETED (2026-08-14, selected-probe FFT spectrum)
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
6. **Future**: T17 scope guardrails, then T18 nonlinear classical solver, T19 free quantum modes, and T20 interaction concepts

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
- T16 foundation was published with source `8a8d154` and website payload `f0cbc19`; do not claim a completed full glossary or mobile verification yet.
  - T12 and the expanded T16 material were published with source `f470d58` and website payload `0f4afd2`. Deployment workflow `30912639074` and public routes/assets were verified; T12 user acceptance later passed.
- Should the probe trajectory show the `|dy/dτ| = 1` diagonal guide?
  - Terra warns it may confuse with null characteristics
  - Sage: keep it for physics-education audience, label clearly
  - Decision: keep, with explicit label
- Mobile layout: tab-based view switching or stacked scroll?
  - Decision: stacked with collapsible panels (matches mockup)
