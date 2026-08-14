# String Motion Simulator

*Created: 2026-07-30 17:10 IST*
*Last Updated: 2026-07-30 17:10 IST*

## Overview

An interactive web application for simulating and visualizing string motion — both relativistic and non-relativistic cases. Hosted under `quantumofgravity.com/projects/strings-sim/`.

## Physics Scope

### Non-Relativistic String
- Classical wave equation: ∂²y/∂t² = v² ∂²y/∂x²
- Standing waves with fixed/free boundary conditions
- Traveling wave pulses and interference
- Damping and driving forces
- Normal mode decomposition

### Relativistic String
- The released simulator provides a linearized transverse natural-unit teaching model.
- T17 records that model as the tested reference path and explicitly excludes a full target-space embedding, quantization, and interactions.
- T18 is implementing a separate classical closed-string conformal-gauge engine in flat spacetime; it is not a quantum or interacting solver.

## Features (MVP)

1. **Real-time Canvas Visualization**
   - 2D string profile rendering
   - Color-coded energy density
   - Smooth animation at 60fps

2. **Interactive Controls**
   - Play / Pause / Reset
   - Time step adjustment
   - String parameters (length, tension, mass density)
   - Boundary condition selector
   - Initial condition presets (pluck, sine, Gaussian pulse)

3. **Mode Switching**
   - Toggle between relativistic / non-relativistic
   - Physics parameter panels update accordingly

4. **Metrics Display**
   - Total energy
   - Frequency spectrum (FFT)
   - Mode amplitudes

## Tech Stack

- **Vanilla TypeScript** — No framework, pure Canvas 2D
- **Vite** — Build tool and dev server
- **Custom physics engine** — Finite difference method
- **Web Audio API** — Optional sonification

## Project Structure

```
strings-sim/
├── src/
│   ├── physics/
│   │   ├── core/           # Base classes and types
│   │   ├── classical/      # Non-relativistic solver
│   │   └── relativistic/   # Relativistic solver
│   ├── visualization/
│   │   ├── renderer.ts     # Canvas rendering engine
│   │   └── colorMaps.ts    # Energy density colors
│   ├── ui/
│   │   ├── controls.ts     # Control panel logic
│   │   ├── presets.ts      # Initial condition presets
│   │   └── metrics.ts      # Real-time metrics display
│   ├── utils/
│   │   ├── fft.ts          # FFT for frequency analysis
│   │   └── math.ts         # Vector/matrix helpers
│   └── main.ts             # Entry point
├── public/
│   └── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Status

🔄 **T18 nonlinear classical engine** — Core implementation in progress; UI and comparison gates remain

## Next Steps

1. Initialize Vite + TypeScript project
2. Implement classical string solver
3. Build canvas renderer
4. Create UI controls
5. Add relativistic mode
6. Deploy to quantumofgravity.com/projects/
