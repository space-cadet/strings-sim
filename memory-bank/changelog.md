# Changelog

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
