# T18: Define varied conformal preset family

**Timestamp:** 2026-08-15 02:48:48 IST  
**Scope:** Nonlinear initial data, UI labelling, and verification

## Implementation

- Added eight dedicated T18 preset definitions based on unit left/right tangent sectors and even harmonic angle perturbations.
- Even harmonics preserve the antipodal tangent relation, giving exact discrete closure while unit normalization preserves the conformal data contract.
- Added T18-specific labels and descriptions so open/reference-profile names are not misleading in nonlinear mode.
- Added a visible T18 preset description and corrected embedding canvas sizing after revealing the previously hidden panel.
- Updated glossary and roadmap copy to distinguish reference displacement/velocity presets from T18 conformal loop data.

## Parameter check

- T18 consumes length when the solver is constructed.
- Tension and density remain fixed at 1 in natural units.
- Damping is omitted.
- Periodic closed-string boundaries are forced.
- Playback speed remains a display-rate control.

## Evidence

- `npm test`: 17 passing, 0 failing.
- `npm run build`: successful.
- Browser: all eight preset labels/descriptions changed correctly; all eight rendered embedding checksums differed from the baseline; canvas measured 904x384 after T18 became visible; zero application console errors.
