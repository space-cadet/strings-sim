## 2026-07-31 — T9 completed

- Corrected central-difference state handling and stable time-step recalculation.
- Added sophisticated initial conditions, including propagating packets and collisions.
- Completed responsive desktop/mobile layout and expanded persistence.
- Verified the production build and browser behavior at desktop and mobile widths.

## 2026-07-31 — T10 completed; T11/T13 delivered slices

- Completed DPR-safe canvas resizing, explicit worldsheet timestamps, and data-space characteristics.
- Delivered the responsive instrument layout and bounded worldsheet canvas lifecycle for desktop/mobile transitions.
- Added shared Classical/Relativistic worldsheet history and continuous live metric updates.
- Published source `4f1b5db` and website payload `e93c0ec`; live hashed assets were verified.

## 2026-08-03 — T16 glossary and contextual-help plan approved

- Defined a shared glossary registry as the single source for concise GUI help and detailed documentation.
- Reframed the documentation delivery as four nested static pages: Simulator, Learn, Glossary, and How it works.
- Defined accessible hover/focus/touch behavior, guided wave experiments, and a full content outline spanning physical concepts, plots, controls, numerical implementation, and model limitations.
- Captured a generated desktop/mobile concept board at `memory-bank/screenshots/T16/tabbed-site-layout-concept.png` as planning evidence.
- Recorded T16 as planned work; no simulator code or user-facing documentation page has yet been implemented.

## 2026-08-03 — T16 foundation delivered

- Added four static, linked pages: Simulator, Learn, Glossary, and How it works.
- Added a typed glossary registry and a shared renderer for the three documentation pages.
- Added initial accessible question-mark links for String profile, Worldsheet, Boundary Conditions, Tension, and Wave Speed.
- Added the first guided Learn sequence for the physical picture, wave behaviour, and the profile/worldsheet bridge.
- Verified the production build, tab navigation, a Courant deep link, tooltip visibility, and a clean browser console. Full content/control coverage, mobile verification, and publication remain pending.

## 2026-08-03 — T16 foundation published

- Fast-forwarded the website checkout to `a151f43` before deployment.
- Pushed source commit `8a8d154` and static website payload commit `f0cbc19`.
- Confirmed successful GitHub Actions deployment run `30765405359`.
- Verified HTTP 200 for the live Simulator, Learn, Glossary, How it works, and documentation JavaScript bundle.

## 2026-08-04 — T12 probe and T16 help expansion

- Added a primary probe trajectory that links a selected profile marker, worldsheet worldline, and rolling $y(\sigma_\ast,\tau)$ trace.
- Added a KaTeX-backed shared glossary and seven guided Learn experiments for the current model, controls, diagnostics, and numerical method.
- Added 11 new contextual help links and registry tests that protect their direct glossary targets.
- Verified four automated tests, the production build, desktop/mobile probe interaction, the expanded Learn page, and a clean browser console.
- Published source `f470d58` and website payload `0f4afd2`. GitHub Actions run `30912639074` succeeded; public routes and the new documentation bundle returned HTTP 200.
- Manual T12 acceptance testing remains pending.

## 2026-08-14 — T12 acceptance and T13 implementation

- User confirmed the delivered T12 probe interaction works; T12 is complete.
- Added T13 Courant, maximum transverse speed, and relativistic energy-drift diagnostics; a persisted optional energy-density strip; a persisted four-field worldsheet selector; and a numerical colour bar.
- Added matching glossary entries and contextual-help links for the T13 controls and diagnostics.
- Production build, focused tests, diff check, and desktop browser verification passed. Long-run relativistic drift and mobile acceptance remain before T13 can close.

## 2026-08-14 — T6 selected-probe frequency spectrum

- Added a compact, collapsible power-spectrum panel for the selected probe trajectory $y(\sigma_\ast,\tau)$.
- The analysis requires at least 16 uniformly timestamped samples, removes the sample mean, applies a Hann window, zero-pads to a power of two, and highlights the largest nonzero-frequency bin.
- The rendered axis focuses on the useful low-frequency range while peak detection still considers the complete positive-frequency FFT. The panel explicitly states that it is a short-window numerical signal estimate, not a quantum-string spectrum.
- Added a focused FFT regression test, glossary/help entry, and browser screenshot at `screenshots/2026-08-14-t6-frequency-spectrum.png`. Build, tests, diff check, and browser verification passed.

## 2026-08-14 — T17–T20 full-string development roadmap approved

- Created four bounded future tasks: linear-model scope and regression guardrails (T17), a nonlinear classical relativistic solver (T18), a finite free-quantum mode visualizer (T19), and conceptual perturbative-interaction diagrams (T20).
- Recorded formulation, constraint, convergence, finite-state, accessibility, and claim-boundary gates in `implementation-details/full-string-development-roadmap.md`.
- This is planning documentation only. The deployed application remains the existing linearized transverse classical teaching model.

## 2026-08-16 — T18/T19/T21 extension plan approved

- Planned T18 boundary extensions for open fixed/free/mixed endpoints, periodic closed loops, and anti-periodic/twisted cases with an explicit closure interpretation.
- Planned T19 finite free-state phase evolution, superpositions, probabilities, cutoff controls, and normalization/level-matching validation.
- Created T21 for model-specific external-field couplings across classical, linearized-relativistic, T18, T19, and future T20 work.
- Recorded the separate source, constrained-force, finite-Hamiltonian, and worldsheet/background semantics in `implementation-details/external-field-coupling.md`.

## 2026-08-16 — T18 open-boundary and T19 free-evolution slice

- Implemented T18 periodic, fixed, free, and mixed boundary contracts with reflected characteristic transport, constraint-compatible endpoint data, endpoint residuals, and boundary energy-flux diagnostics. Periodic closure and the existing T18 audit tests remain green; anti-periodic/twisted semantics and UI exposure remain planned.
- Implemented T19 normalized finite superpositions, the declared dimensionless free Hamiltonian, exact phase evolution, basis-state probabilities, cutoff warnings, time controls, and play/pause interaction. Updated glossary and implementation documentation to distinguish amplitudes/probabilities from classical profiles and to preserve the finite educational boundary.
- Added focused regression coverage; 28 tests pass and the production build succeeds. No source or website publication was performed.
