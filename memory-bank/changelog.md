# Changelog

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
