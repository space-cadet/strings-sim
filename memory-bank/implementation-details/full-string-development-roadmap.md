# Full String Development Roadmap

*Created: 2026-08-14 19:28:22 IST*
*Status: T17 complete; T18 periodic/open boundary engine slice and audit/publication complete with anti-periodic semantics still planned; T19 finite free phase-evolution slice complete with review/user acceptance pending; T20 remains a bounded topology visualizer; T21 records cross-model external-field coupling.*

## Purpose

This roadmap separates four claims that are often collapsed under “full string simulation”. Each task has its own numerical or educational contract. Completing a later task never retroactively changes what the present simulator computes.

| Stage | Task | Deliverable | Explicit boundary |
|---|---|---|---|
| 1 | T17 | Verified linearized classical reference model | No full embedding, constraints, quantization, or interactions |
| 2 | T18 | Nonlinear classical relativistic-string solver | Classical flat-spacetime dynamics only |
| 3 | T19 | Finite free-quantum-string mode visualizer | Educational truncated state space; no interacting quantum evolution |
| 4 | T20 | Perturbative interaction concept diagrams | No scattering-amplitude or non-perturbative calculation |
| 5 | T21 | External-field couplings across string models | Model-specific forcing/background semantics; no universal force law |

## T17: Linearized Reference Model

The present app evolves a transverse small-displacement field, conceptually

$$
\partial_\tau^2 y = c^2\partial_\sigma^2 y.
$$

Its role is a tested baseline for wave propagation, normal modes, packets, boundaries, and diagnostics. The current linearized relativistic display does not evolve a full $X^\mu(\sigma,\tau)$ embedding. T17 records regression cases and makes that boundary consistent across UI and documentation.

### T17 baseline record

The reproducible reference fixture in `src/physics/t17-baselines.ts` runs the current natural-unit linear solver at $N=129$, $L=2$, and $\lambda=0.5$ for 512 steps. It covers fixed fundamental, free fundamental, periodic mode, and mixed velocity-bearing initial states. The acceptance bounds are less than 1% relative energy drift, displacement below 0.5, sampled transverse speed at most 1, and periodic endpoint closure at machine precision.

## T18: Nonlinear Classical Relativistic String

The implementation uses conformal gauge with $X^0=\tau$ in flat 2+1-dimensional Minkowski spacetime, natural units, and unit tension/density. The validated engine supports the closed periodic loop plus fixed, free, and mixed open endpoint reflections; the simulator UI still exposes only the closed periodic T18 path. The solver evolves left- and right-moving unit tangent fields, which preserves the conformal constraints by construction while reconstructing the spatial embedding. It remains a classical flat-spacetime model, not a quantum or interacting solver.

The release gates are: constraint residuals, conserved quantities, grid/timestep convergence, small-amplitude agreement with T17, a documented nonlinear observable, and clear distinction from quantum theory. The local boundary slice now verifies periodic closure plus fixed/free/mixed endpoint relations, residuals, and energy flux; anti-periodic/twisted sectors remain gated.

The current local implementation exposes a separate T18 mode, eight closed conformal-loop presets, a target-space projection, and a live constraint residual. T18e now compares tangent spectra, embeddings, velocities, geometric invariants, conserved energy, and browser-rendered projections directly; raster checksums are not used as acceptance evidence. T18 documents a radial-profile geometric mode-mixing observable without claiming interaction or quantum transitions. It keeps natural-unit tension and density fixed, omits damping, and selects the grid/topology contract when the solver is constructed.

## T19: Free Quantum String Modes

This is not a general quantum-field solver. The local slice is a finite educational representation of a bosonic closed-string convention in flat 26D using light-cone oscillator occupations for modes 1..4, with occupation values 0..2. It displays level number, left/right sectors, level matching, a convention-specific mass-squared value only for matched examples, and exact phase evolution under the declared finite Hamiltonian $H_{free}=N_L+N_R$. The UI distinguishes amplitudes and basis-state probabilities from an illustrative classical profile and flags invalid selections.

## T20: Perturbative Interactions

Interactions are first introduced as conceptual worldsheet topology: incoming free strings, a joining/splitting geometry, and outgoing free strings. The local slice includes static accessible diagrams for propagation, pair-of-pants splitting/joining, and a genus-one handle. The diagrams explain the perturbative picture but do not calculate amplitudes, sums over moduli, loops, or non-perturbative dynamics.

## Planned extensions: T18, T19, and T21

T18 now has a tested boundary contract and open fixed/free/mixed endpoint evolution. Anti-periodic behavior will be validated in the linear reference path first; T18 will require an explicit twisted-sector or doubled-domain interpretation before it is exposed as a full embedding case.

T19 now includes finite free-state phase evolution, superpositions, probabilities, play/pause and time controls, and visible cutoff controls. It remains a truncated oscillator model with declared normalization and level-matching rules.

T21 will add prescribed external fields through model-specific adapters. Classical and linearized-relativistic paths can use source/force terms with work and energy-balance diagnostics. T18 needs a constraint-compatible target-space force density. T19 needs a finite Hamiltonian drive. T20 background coupling remains a separate worldsheet/amplitude problem.

## Shared Standards

- Use shared glossary and Learn content so UI tooltips, detailed explanations, and implementation notes do not drift.
- State the theory, spacetime/convention, gauge, units, numerical/finite-state truncations, and all omitted physics before a new mode is exposed.
- Keep the current linear simulator as a selectable reference path.
- Treat visual complexity as non-evidence: numerical convergence and constraints validate T18; physical-state rules validate T19; accurately bounded claims validate T20.
- Treat external fields as model-specific couplings: source work validates classical paths, constraint/work balance validates T18, and unitary finite-Hamiltonian evolution validates T19.
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
        |
       T21
```
