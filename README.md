# String Motion Simulator

Interactive web application for simulating and visualizing string motion — both classical (non-relativistic) and relativistic dynamics.

**Live Demo**: https://quantumofgravity.com/projects/strings-sim/

## Features

- **Real-time Simulation**: 1D wave equation solver using finite difference method
- **Interactive Canvas**: Smooth string visualization with energy density heatmap
- **Physics Controls**: String length, tension, mass density, damping
- **Boundary Conditions**: Fixed, free, and mixed endpoints
- **Initial Presets**: Pluck, sine wave, Gaussian pulse, random mode superposition
- **Playback Controls**: Play, pause, reset with adjustable time scale
- **Real-time Metrics**: Total energy, wave speed, fundamental frequency
- **Settings Persistence**: All parameters saved to localStorage

## Physics

### Classical String
Solves the 1D wave equation:
```
∂²y/∂t² = c² ∂²y/∂x² - γ ∂y/∂t
```
where `c = √(τ/μ)` is the wave speed, `τ` is tension, `μ` is mass density, and `γ` is damping.

### Relativistic String (Coming Soon)
Nambu-Goto action based dynamics.

## Tech Stack

- **TypeScript** — Type-safe physics engine
- **Vite** — Build tool and dev server
- **Canvas 2D** — Hardware-accelerated rendering
- **No Framework** — Pure vanilla TS for maximum performance

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
strings-sim/
├── src/
│   ├── physics/
│   │   ├── core.ts         # Types and utilities
│   │   └── classical.ts    # Wave equation solver
│   ├── visualization/
│   │   └── renderer.ts     # Canvas rendering engine
│   ├── ui/
│   │   └── presets.ts      # Initial condition presets
│   ├── utils/
│   │   └── fft.ts          # FFT for frequency analysis
│   ├── main.ts             # Application entry point
│   └── style.css           # Dark theme styles
├── index.html              # Main HTML
├── vite.config.ts          # Build configuration
└── tsconfig.json           # TypeScript settings
```

## License

MIT
