# Selected-Probe Frequency Spectrum

*Implemented: 2026-08-14*

## Purpose

T6 turns the already-implemented FFT utility into an educational measurement: the frequency content of the selected probe trajectory $y(\sigma_\ast,\tau)$. It is deliberately placed below the probe trace so learners can connect the signal with the spectrum rather than read it as a disconnected dashboard metric.

## Data and Analysis Contract

- Input is the bounded, timestamped `ProbeTrajectoryState` history, not the profile itself or the spatial worldsheet field.
- The analysis waits for 16 samples; samples are evenly spaced solver steps and their timestamps determine the sample interval.
- It subtracts the sample mean, applies a Hann window, then calls the existing real-input FFT and uses positive-frequency power.
- The dominant bin excludes the DC component. Zero padding improves chart interpolation but does not create physical frequency resolution.

## Display Contract

- The panel remains collapsible and reports either its sample count or the dominant frequency in its summary.
- The highlighted yellow bar is the largest nonzero-frequency bin. Purple bars are the remaining visible bins.
- Rendering focuses on a low-frequency window around the strongest peak so a large unused Nyquist range does not hide the educational signal.
- Copy and glossary text explicitly state the finite rolling-window limitation and reject an interpretation as a quantum-string particle spectrum.

## Verification

- `test/frequency-spectrum.test.mjs` detects a known sinusoidal peak and rejects an insufficient sample window.
- `npm test`, `npm run build`, and `git diff --check` passed.
- Browser verification using the sine preset produced a visible peak near `0.996`; see `memory-bank/screenshots/2026-08-14-t6-frequency-spectrum.png`.
