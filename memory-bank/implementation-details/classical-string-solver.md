# Classical String Solver and Energy

*Updated: 2026-07-31 18:13 IST*
*Implementation Attribution: GPT-5.6 Terra (Codex)*

## Model

`src/physics/classical.ts` solves the damped one-dimensional wave equation

$$
\partial_t^2 y = c^2\partial_\sigma^2y-\gamma\partial_t y,
\qquad c=\sqrt{\tau/\mu}.
$$

The solver uses a central-difference/Verlet-like update. Every spatial Laplacian reads from an immutable `currentY` snapshot, preventing directional in-place updates.

## Runtime Parameters

- Length changes recompute $\Delta\sigma$ and the conservative timestep.
- Tension and density update the wave speed and timestep.
- Damping updates the active solver immediately.
- Fixed, free, and mixed endpoints are applied after every timestep.

## Energy and History

The current display calculates local energy from velocity and spatial slope. Total energy is recalculated after each advancing animation frame and shown to five decimals. Classical history stores explicit `{ t, y }` samples for the shared worldsheet.

## Boundary

The numerical scheme is educational and linear; it is not a nonlinear string or material-loss calibration.
