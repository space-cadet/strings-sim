# Tasks — String Motion Simulator

*Created: 2026-07-30 17:10 IST*
*Last Updated: 2026-08-16 01:16:13 IST*

## Active Tasks

| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T11 | Three-View Layout Redesign | 🔄 In Progress | HIGH | 2026-07-31 | T10 | [Details](tasks/T11.md) |
| T13 | Enhanced Diagnostics | 🔄 In Progress | MEDIUM | 2026-07-31 | T10, T11, T12 | [Details](tasks/T13.md) |
| T18 | Nonlinear Classical Relativistic String Solver | 🔄 In Progress | HIGH | 2026-08-15 | T17 | [Details](tasks/T18.md) |
| T19 | Free Quantum String Mode Visualizer | 🔄 In Progress | MEDIUM | 2026-08-15 | T17 | [Details](tasks/T19.md) |
| T20 | Perturbative String Interaction Concept Visualizer | 🔄 In Progress | LOW | 2026-08-15 | T19 | [Details](tasks/T20.md) |

## Completed Tasks

| ID | Title | Status | Priority | Started | Completed | Dependencies | Details |
|----|-------|--------|----------|---------|-----------|--------------|---------|
| T1 | Project Setup & Build Tooling | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | — | Project scaffold and production build |
| T2 | Classical String Physics Engine | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | T1 | Finite-difference solver with boundary conditions |
| T3 | Canvas Rendering Engine | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | T1 | Canvas displacement and energy rendering |
| T4 | UI Controls & Presets | ✅ Completed | HIGH | 2026-07-30 | 2026-07-30 | T2, T3 | Interactive controls and persisted settings |
| T5 | Relativistic String Mode | ✅ Completed | MEDIUM | 2026-07-30 | 2026-07-30 | T2, T3 | Linearized relativistic transverse mode and history view |
| T6 | Energy Metrics & FFT | ✅ Completed | MEDIUM | 2026-07-30 | 2026-08-14 | T2, T12 | [Details](tasks/T6.md) |
| T7 | Deployment | ✅ Completed | LOW | 2026-07-30 | 2026-07-30 | T4 | Initial publication |
| T8 | Git Repository | ✅ Completed | LOW | 2026-07-30 | 2026-07-30 | — | Public GitHub repository created |
| T9 | Simulation Integrity & Responsive UX | ✅ Completed | HIGH | 2026-07-31 | 2026-07-31 | T2, T4, T5 | [Details](tasks/T9.md) |
| T10 | P0 Bug Fixes | ✅ Completed | HIGH | 2026-07-31 | 2026-07-31 | — | [Details](tasks/T10.md) |
| T12 | Probe Trajectory & Interaction | ✅ Completed | HIGH | 2026-08-04 | 2026-08-14 | T10, T11 | [Details](tasks/T12.md) |

## Planned String-Theory Expansion

| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T17 | Linearized Model Baseline and Scope Guardrails | ✅ Completed | HIGH | 2026-08-15 | T16 | [Details](tasks/T17.md) |
| T16 | Mathematical Glossary and Contextual Help System | ✅ Completed | HIGH | 2026-08-03 | 2026-08-15 | T9, T11 | [Details](tasks/T16.md) |
| T18 | Nonlinear Classical Relativistic String Solver | 🔄 In Progress | HIGH | 2026-08-15 | T17 | [Details](tasks/T18.md) |
| T19 | Free Quantum String Mode Visualizer | 🔄 In Progress | MEDIUM | 2026-08-15 | T17 | [Details](tasks/T19.md) |
| T20 | Perturbative String Interaction Concept Visualizer | 🔄 In Progress | LOW | 2026-08-15 | T19 | [Details](tasks/T20.md) |
| T21 | External Field Couplings Across String Models | ⏸️ Planned | HIGH | — | T2, T5, T17 | [Details](tasks/T21.md) |

## Deferred Tasks

| ID | Title | Status | Priority | Reason |
|----|-------|--------|----------|--------|
| T14 | Worldsheet Scrubbing | ⬜ Deferred | LOW | Wait until 2D views are stable |
| T15 | 3D Embedded Worldsheet | ⬜ Deferred | LOW | Non-urgent; 2D heatmap is pedagogically clearer |

## Status Summary

- **Active**: 5 (T11, T13, T18, T19, and T20 in progress)
- **Completed**: 13 (including T6, T12, T16, and T17)
- **Planned**: 1 (T21)
- **Deferred**: 2 (T14 and T15)
- **Total**: 21

## Task Dependency Graph

```
T10 (bug fixes) ──► T11 (layout) ──► T12 (probe) ──► T13 (diagnostics)
                         │
                         ├──► T16 (glossary and contextual help)
                         │
                         ▼
                    T14 (scrubbing) [deferred]
                    T15 (3D view) [deferred]

T16 (documentation) ──► T17 (linear baseline) ──► T18 (nonlinear classical solver)
                                      │
                                      ├──────────► T19 (free quantum modes) ──► T20 (interaction concepts)
                                      └──────────► T21 (external-field couplings)
```

## Priority Tiers

| Tier | Tasks | Description |
|------|-------|-------------|
| **P0** | T10a, T10b, T10c | Bug fixes: canvas transform, causal rays, timestamps |
| **P1** | T11, T12 | Layout redesign + probe trajectory |
| **P1** | T16 | Mathematical glossary, documentation, and contextual help |
| **P2** | T13a-T13d | Diagnostics, field selector, energy labeling |
| **P3** | T14 | Worldsheet scrubbing |
| **P4** | T15 | 3D embedded view |
| **Future** | T17–T21 | Scoped progression from the linear baseline to nonlinear, free-quantum, interaction, and external-field layers |
