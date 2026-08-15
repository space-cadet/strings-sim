# Full String Development Roadmap

*Created: 2026-08-14 19:28:22 IST*
*Status: T17 complete; T18 local validation/documentation complete with publication pending; T19/T20 local educational slices implemented with review/publication pending.*

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

### T17 baseline record

The reproducible reference fixture in `src/physics/t17-baselines.ts` runs the current natural-unit linear solver at $N=129$, $L=2$, and $\lambda=0.5$ for 512 steps. It covers fixed fundamental, free fundamental, periodic mode, and mixed velocity-bearing initial states. The acceptance bounds are less than 1% relative energy drift, displacement below 0.5, sampled transverse speed at most 1, and periodic endpoint closure at machine precision.

## T18: Nonlinear Classical Relativistic String

The first implementation uses a narrow conformal-gauge target: a classical closed string in flat 2+1-dimensional Minkowski spacetime, natural units, periodic worldsheet coordinate, and $X^0=\tau$. The solver evolves left- and right-moving unit tangent fields, which preserves the conformal constraints by construction while reconstructing the spatial embedding. It remains a classical flat-spacetime model, not a quantum or interacting solver.

The release gates are: constraint residuals, conserved quantities, grid/timestep convergence, small-amplitude agreement with T17, a documented nonlinear observable, and clear distinction from quantum theory. The first local slice supports the simplest rigorously verified closed periodic case; open endpoints are not presented prematurely.

The current local implementation exposes a separate T18 mode, eight closed conformal-loop presets, a target-space projection, and a live constraint residual. T18e now compares tangent spectra, embeddings, velocities, geometric invariants, conserved energy, and browser-rendered projections directly; raster checksums are not used as acceptance evidence. T18 documents a radial-profile geometric mode-mixing observable without claiming interaction or quantum transitions. It keeps natural-unit tension and density fixed, omits damping, and forces periodic boundaries; the configured length sets the loop coordinate interval when the solver is constructed.

## T19: Free Quantum String Modes

This is not a real-time quantum-field solver. The local slice is a finite educational representation of a bosonic closed-string convention in flat 26D using light-cone oscillator occupations for modes 1..4, with occupation values 0..2. It displays level number, left/right sectors, level matching, and a convention-specific mass-squared value only for matched examples. The UI distinguishes an illustrative classical profile from a quantum state and flags invalid selections.

## T20: Perturbative Interactions

Interactions are first introduced as conceptual worldsheet topology: incoming free strings, a joining/splitting geometry, and outgoing free strings. The local slice includes static accessible diagrams for propagation, pair-of-pants splitting/joining, and a genus-one handle. The diagrams explain the perturbative picture but do not calculate amplitudes, sums over moduli, loops, or non-perturbative dynamics.

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
