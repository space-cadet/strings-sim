# Application Shell and Controls

*Updated: 2026-07-31 18:13 IST*
*Implementation Attribution: GPT-5.6 Terra (Codex)*

## Delivered Feature

The app is a responsive scientific instrument with a profile panel, playback strip, worldsheet panel, reserved probe panel, and a parameter/diagnostic rail.

## Implementation

- `index.html` defines stable element IDs for all controls, canvases, metric values, and accessibility labels.
- `src/main.ts` owns the selected preset, mode, boundary condition, parameters, playback speed, and worldsheet visibility.
- `src/style.css` uses a desktop two-column layout and a mobile stacked layout. Playback controls are separate from the canvases so they never obscure a plot.
- Settings are stored under `strings-sim-settings` in local storage and restored defensively if valid JSON is available.

## Mode Rules

- Classical mode exposes string length, tension, mass density, and damping.
- Relativistic mode fixes $	au=mu=1$ and $gamma=0$; the incompatible sliders remain visible but disabled.
- Both modes can display a worldsheet. The probe panel truthfully states that interaction is forthcoming.

## Verification Evidence

- `memory-bank/screenshots/T10-T11/desktop-instrument.jpg`
- `memory-bank/screenshots/T10-T11/mobile-controls.jpg`
