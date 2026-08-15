# Changelog

## 2026-08-16

### Planned

- Planned T18 open/mixed/periodic/anti-periodic boundary extensions, with anti-periodic T18 semantics gated on a twisted-sector or doubled-domain definition.
- Planned T19 finite free-state evolution with oscillator phase, superposition, probability, cutoff, normalization, and level-matching controls.
- Added T21 and its implementation record for model-specific external-field coupling from classical and linearized-relativistic sources through T18 constrained forcing and T19 finite Hamiltonian drives.
- Added a T17 anti-periodic linear reference fixture and half-integer-mode regression. Documented T18’s doubled-domain interpretation and kept anti-periodic embedding/UI exposure gated on a future length-$2L$ construction.
- Added the T18 nonlinear anti-periodic doubled-domain path, boundary selector exposure, mode-specific copy, and 2N-sample target-space closure regression. Local tests (30) and build pass; browser acceptance and deployment remain separate.
- Corrected T18 preset application across periodic, fixed, free, mixed, and anti-periodic boundaries with boundary-compatible, distinct initial data. Clarified T19 phase evolution with phase-angle and relative-phase output; local tests (34) and build pass, with publication still separate.

### Delivered locally

- Audited all 34 glossary entries, related links, and contextual-help anchors. Corrected stale T18 boundary/preset documentation so periodic, fixed, free, mixed, and anti-periodic-cell behavior matches the live UI.
- Added T18 fixed/free/mixed open characteristic reflection beside the validated periodic closed path, including endpoint-condition and boundary-flux diagnostics.
- Added T19 finite free-state superpositions, analytic phase evolution, normalized probabilities, cutoff warnings, and accessible time/play controls.
- Added regression tests for endpoint relations, zero boundary flux, odd open grids, norm preservation, level matching, and invalid finite states. Local tests (28) and production build passed; publication remains separate.

## 2026-08-04

### Added

- Added the linked primary probe trajectory with profile/worldsheet interaction and a bounded timestamped history.
- Added locally rendered LaTex glossary material, current-control contextual help, and a seven-step Learn sequence.
- Added probe and glossary-registry tests plus desktop/mobile and documentation evidence.
- Published source commit `f470d58` and website payload `0f4afd2`; GitHub Actions run `30912639074` and live route/asset checks passed.

## 2026-07-31

### Fixed

- Corrected the previous-state update used by both finite-difference solvers.
- Prevented parameter changes from retaining an invalid time step.
- Corrected an in-place Laplacian update that caused unstable energy growth in both solvers.

### Added

- Added normal-mode, two-mode, traveling-packet, and collision initial conditions.
- Persisted the optional relativistic history view.

### Changed

- Refined the responsive layout, touch targets, focus treatment, and relativistic-model wording.
### T10/T11/T13 responsive instrument release

- Added shared Classical and Relativistic worldsheet histories, data-space characteristics, and mobile repaint recovery.
- Rebuilt the responsive instrument layout and bounded the worldsheet plot across viewport transitions.
- Updated live diagnostics cadence and precision, then published and verified the production payload.
