# Relativistic Solver and Worldsheet

*Updated: 2026-08-15 01:44:29 IST*
*Implementation Attribution: GPT-5.6 Terra (Codex)*

## Model Boundary

`src/physics/relativistic.ts` implements the linearized transverse conformal-gauge string equation in natural units, with $c=1$. Fixed, free, mixed, and periodic boundary cases are supported. It is not a full nonlinear Nambu-Goto simulation; that work belongs to the separate T18 path.

## History Contract

Each retained sample is `{ t, y }`. Initialization stores the $t=0$ state; each step records the evolved state with its exact timestamp. This removes the former one-step labeling ambiguity.

`getWorldsheetBounds()` derives the rolling temporal window and displacement scale from retained samples. The same interface is used by Classical mode.

## Rendering Contract

`src/visualization/worldsheet.ts` maps $(\sigma,\tau)$ to pixels and colors transverse displacement with magenta for negative values and cyan for positive values. The bright horizontal line is the newest profile.

Dashed characteristics are calculated in data coordinates. Classical mode supplies its wave speed; Relativistic mode supplies $1$. Their pixel angle intentionally changes with aspect ratio.

## Evidence

- `memory-bank/screenshots/T10-T11/desktop-worldsheet.jpg`
- `memory-bank/screenshots/T10-T11/mobile-profile-worldsheet.jpg`
