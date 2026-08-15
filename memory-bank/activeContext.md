# Active Context

*Last Updated: 2026-08-16 03:20:00 IST*

## Current Tasks

### Active
- **T18: Nonlinear Classical Relativistic String Solver** — 🔄 IN PROGRESS
  - T17 baseline completed; conformal-gauge periodic/open boundary engine, eight varied conformal presets, endpoint diagnostics, and numerical validation are implemented
- **T19: Free Quantum String Mode Visualizer** — 🔄 IN PROGRESS
  - Finite four-mode occupation explorer with declared bosonic closed-string convention, level matching, truncation warnings, normalized superpositions, and free phase evolution
- **T20: Perturbative String Interaction Concept Visualizer** — 🔄 IN PROGRESS
  - Static accessible propagation, pair-of-pants, and handle diagrams; no amplitudes or interaction dynamics
- **T21: External Field Couplings Across String Models** — ⏸️ PLANNED
  - Shared field registry with model-specific source, constrained-force, finite-Hamiltonian, and future worldsheet semantics
- **T16: Mathematical Glossary and Contextual Help System** — ✅ COMPLETED (2026-08-15)
  - Shared registry, local KaTeX, seven Learn experiments, contextual help for implemented controls and diagnostics, and T18 model-boundary entries are live-verified
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
- T19/T20 physics-content review and user acceptance remain open. T18 periodic/open boundary engine, anti-periodic doubled-domain embedding/UI path, boundary-aware presets, and glossary/help closeout are published and live-verified; manual browser acceptance and T21 external-field coupling remain planned. See `implementation-details/full-string-development-roadmap.md`.
- Worldsheet scrubbing — deferred until 2D views are stable
- 3D embedded worldsheet view — deferred indefinitely

## Completed Tasks (Recent)

- T17: Linearized Model Baseline and Scope Guardrails — ✅ COMPLETED (2026-08-15)
  - Periodic linear reference, four regression cases, tolerances, and model-boundary audit
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
6. **Current extension**: T18 boundary conditions, T19 finite free-state evolution, and T21 model-specific external-field couplings; T20 remains a bounded topology visualizer

## System Status
- Build: ✅ TypeScript compiles, Vite builds successfully
- Physics: ✅ Classical and linearized relativistic reference solvers; 🔄 T18 constrained conformal-gauge periodic/open-boundary engine with numerical diagnostics
- Rendering: ✅ Classical and relativistic worldsheets, bounded responsive plot wrapper, mobile repaint recovery
- UI: ✅ Responsive instrument layout, persisted settings, separate playback strip, live diagnostic cards
- Deployment: ✅ Live at quantumofgravity.com/projects/strings-sim/; source commit `a7e5bfd`, website commit `a4a896f`, final live routes/assets verified

## Open Questions
- The glossary must describe the linearized relativistic teaching model precisely without implying a full quantum, interacting string-theory calculation.
- Tooltip text should remain short and plain-language; detailed formulae, implementation notes, and caveats belong in the linked documentation section.
- Tabs are ordinary nested static-page links, not a JavaScript-only control, so each view has a stable bookmarkable URL.
- T16 foundation was published with source `8a8d154` and website payload `f0cbc19`; the completed glossary/help system was later re-verified in source `a7e5bfd` and website payload `a4a896f`.
  - T12 and the expanded T16 material were published with source `f470d58` and website payload `0f4afd2`. Deployment workflow `30912639074` and public routes/assets were verified; T12 user acceptance later passed.
- Should the probe trajectory show the `|dy/dτ| = 1` diagonal guide?
  - Terra warns it may confuse with null characteristics
  - Sage: keep it for physics-education audience, label clearly
  - Decision: keep, with explicit label
- Mobile layout: tab-based view switching or stacked scroll?
  - Decision: stacked with collapsible panels (matches mockup)
- T18 formulation: classical string in flat 2+1-dimensional Minkowski spacetime, conformal gauge, natural units, and $X^0=\tau$; periodic, fixed, free, mixed, and anti-periodic doubled-domain semantics are implemented, numerically validated, published, and live-route verified.
- T18 local validation/documentation gate and production publication verification are complete for this slice; the broader nonlinear-validation claim remains bounded by the documented observable gate.
- T18 parameter boundary: length and topology are selected at solver construction; tension and density stay at 1, damping stays at 0, and periodic closure is enforced only for the periodic contract. Nonlinear preset selection now uses dedicated even-harmonic tangent data rather than reference-profile functions.
- T18e preset audit completed: all eight presets have distinct measured tangent, geometry, and velocity signatures; browser-rendered projections support the revised labels. Energy is retained as a conservation check, not a distinctness signal.
- T18 boundary extension: open fixed/free/mixed endpoint reflection and anti-periodic doubled-domain embedding/UI are implemented and tested; all eight presets are adapted to the active topology contract.
- T19 free evolution: finite free-state phase evolution, superpositions, probabilities, cutoff controls, play/pause, and normalization/level-matching tests are implemented; physics review and user acceptance remain open.
- T21 external-field plan: a shared field registry with model-specific adapters. Classical and linearized relativistic modes use source terms, T18 requires constrained target-space forcing, T19 requires a finite Hamiltonian drive, and T20 worldsheet backgrounds remain a separate amplitude task.
- Source commit `a7e5bfd` is pushed; website payload `a4a896f` is pushed. Four public routes and the final documentation asset returned HTTP 200; live T18 boundary/preset and T19 phase/glossary markers were verified in the deployed bundle.
