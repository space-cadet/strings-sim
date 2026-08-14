# Full String Development Roadmap

*Created: 2026-08-14 19:28:22 IST*
*Status: Approved planning record; no future solver or quantum feature is implemented.*

## Purpose

This roadmap separates four claims that are often collapsed under “full string simulation”. Each task has its own numerical or educational contract. Completing a later task never retroactively changes what the present simulator computes.

| Stage | Task | Deliverable | Explicit boundary |
|---|---|---|---|
| 1 | T17 | Verified linearized classical reference model | No full embedding, constraints, quantization, or interactions |
| 2 | T18 | Nonlinear classical relativistic-string solver | Classical flat-spacetime dynamics only |
| 3 | T19 | Finite free-quantum-string mode visualizer | Educational truncated state space; no interacting quantum evolution |
| 4 | T20 | Perturbative interaction concept diagrams | No scattering-amplitude or non-perturbative calculation |

## T17: Linearized Reference Model

The present app evolves a transverse small-displacement field, conceptually

$$
\partial_\tau^2 y = c^2\partial_\sigma^2 y.
$$

Its role is a tested baseline for wave propagation, normal modes, packets, boundaries, and diagnostics. The current linearized relativistic display does not evolve a full $X^\mu(\sigma,\tau)$ embedding. T17 records regression cases and makes that boundary consistent across UI and documentation.

## T18: Nonlinear Classical Relativistic String

The first solver must select a precise formulation before code is written. A suitable narrow target is a classical embedding in flat Minkowski spacetime, derived from Nambu--Goto or Polyakov dynamics. It needs a gauge, constraint-satisfying initial data, a constraint-preserving integrator, and refinement tests.

The release gates are: constraint residuals, conserved quantities, grid/timestep convergence, small-amplitude agreement with T17, and clear distinction from quantum theory. Boundary support should begin with the simplest rigorously verified case rather than presenting several endpoint conditions prematurely.

## T19: Free Quantum String Modes

This is not a real-time quantum-field solver. It is a finite educational representation of a chosen free-string convention: oscillator occupations, level number, left/right-moving sectors where relevant, level matching, and physical-state restrictions. The UI must say which convention and truncation it uses, reject or flag invalid selections, and distinguish an illustrative classical profile from a quantum state.

## T20: Perturbative Interactions

Interactions are first introduced as conceptual worldsheet topology: incoming free strings, a joining/splitting geometry, and outgoing free strings. The diagrams explain the perturbative picture but do not calculate amplitudes, sums over moduli, loops, or non-perturbative dynamics. Static accessible diagrams are the default initial implementation.

## Shared Standards

- Use shared glossary and Learn content so UI tooltips, detailed explanations, and implementation notes do not drift.
- State the theory, spacetime/convention, gauge, units, numerical/finite-state truncations, and all omitted physics before a new mode is exposed.
- Keep the current linear simulator as a selectable reference path.
- Treat visual complexity as non-evidence: numerical convergence and constraints validate T18; physical-state rules validate T19; accurately bounded claims validate T20.
- Require source tests, production build, browser/mobile checks, documentation review, and separate publication verification for each delivered task.

## Dependency Order

```text
T16 documentation foundation
        |
       T17 linear reference and scope guardrails
       /  \\
     T18  T19
       \\  /
        T20
```
