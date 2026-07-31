# Tasks — String Motion Simulator

*Created: 2026-07-30 17:10 IST*
*Last Updated: 2026-07-31 14:55 IST*

## Active Tasks

| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T10 | P0 Bug Fixes | 🔄 In Progress | HIGH | 2026-07-31 | — | [Details](tasks/T10.md) |
| T11 | Three-View Layout Redesign | ⬜ Pending | HIGH | — | T10 | [Details](tasks/T11.md) |
| T12 | Probe Trajectory & Interaction | ⬜ Pending | HIGH | — | T10, T11 | [Details](tasks/T12.md) |
| T13 | Enhanced Diagnostics | ⬜ Pending | MEDIUM | — | T10, T11, T12 | [Details](tasks/T13.md) |

## Completed Tasks

| ID | Title | Status | Priority | Started | Completed | Dependencies | Details |
|----|-------|--------|----------|---------|-----------|--------------|---------|
| T1 | Project Setup & Build Tooling | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | — | Project scaffold and production build |
| T2 | Classical String Physics Engine | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | T1 | Finite-difference solver with boundary conditions |
| T3 | Canvas Rendering Engine | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | T1 | Canvas displacement and energy rendering |
| T4 | UI Controls & Presets | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | T2, T3 | Interactive controls and persisted settings |
| T5 | Relativistic String Mode | ✅ Completed | MEDIUM | 2026-07-30 | 2026-07-30 | T2, T3 | Linearized relativistic transverse mode and history view |
| T6 | Energy Metrics & FFT | 🔄 Superseded | MEDIUM | 2026-07-30 | — | T2 | Energy metrics done; FFT spectrum deferred to post-T13 |
| T7 | Deployment | ✅ Completed | LOW | 2026-07-30 | 2026-07-30 | T4 | Initial publication |
| T8 | Git Repository | ✅ Completed | LOW | 2026-07-30 | 2026-07-30 | — | Public GitHub repository created |
| T9 | Simulation Integrity & Responsive UX | ✅ Completed | HIGH | 2026-07-31 | 2026-07-31 | T2, T4, T5 | [Details](tasks/T9.md) |

## Deferred Tasks

| ID | Title | Status | Priority | Reason |
|----|-------|--------|----------|--------|
| T14 | Worldsheet Scrubbing | ⬜ Deferred | LOW | Wait until 2D views are stable |
| T15 | 3D Embedded Worldsheet | ⬜ Deferred | LOW | Non-urgent; 2D heatmap is pedagogically clearer |

## Status Summary

- **Active**: 4 (T10 in progress, T11-T13 pending)
- **Completed**: 9 (including T6 superseded)
- **Paused/Deferred**: 2
- **Total**: 15

## Task Dependency Graph

```
T10 (bug fixes) ──► T11 (layout) ──► T12 (probe) ──► T13 (diagnostics)
                         │
                         ▼
                    T14 (scrubbing) [deferred]
                    T15 (3D view) [deferred]
```

## Priority Tiers

| Tier | Tasks | Description |
|------|-------|-------------|
| **P0** | T10a, T10b, T10c | Bug fixes: canvas transform, causal rays, timestamps |
| **P1** | T11, T12 | Layout redesign + probe trajectory |
| **P2** | T13a-T13d | Diagnostics, field selector, energy labeling |
| **P3** | T14 | Worldsheet scrubbing |
| **P4** | T15 | 3D embedded view |
