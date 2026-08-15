# External Field Coupling Plan

*Created: 2026-08-16 01:16:13 IST*
*Last Updated: 2026-08-16 01:16:13 IST*

## Purpose

T21 defines how prescribed external fields affect each model without pretending that a classical force, a relativistic source, a constrained target-space force, and a quantum background Hamiltonian are interchangeable.

## Shared field contract

The field registry should identify a field, supported models, units, spatial profile, time dependence, direction, amplitude, and evaluation domain. The first catalogue is intentionally small: none, uniform, localized Gaussian, sinusoidal drive, and finite pulse.

The zero-field limit must reproduce the existing solver path within the current numerical tolerances. Field parameters must be serialized with the simulation configuration and exposed in documentation with model-specific caveats.

## Model adapters

### Classical transverse solver

Use a source term in the damped wave equation. Track work supplied by the field, damping loss, boundary flux, and residual energy balance. The field is a prescribed drive, not a new string interaction.

### Linearized relativistic reference

Use a weak transverse source in natural units with $c=1$. Preserve the existing free relativistic path at zero amplitude and state that this remains a linearized transverse model rather than a full forced Nambu-Goto embedding.

### T18 constrained classical evolution

An external field must be introduced as a target-space force density compatible with the conformal-gauge formulation. Adding an acceleration after embedding reconstruction is not acceptable because it can violate orthogonality, normalization, and closure. The first T18 field must therefore be selected together with a constraint-preserving update and a work/energy identity.

### T19 finite quantum extension

External driving belongs in a finite Hamiltonian coupling on oscillator states. The free phase-evolution path remains the reference, and any driven state is labelled as no longer free. Norm preservation, level matching, and cutoff dependence are required tests.

### T20 conceptual interaction layer

The current topology diagrams do not accept an external-force control. A background field in a worldsheet calculation would modify the worldsheet theory or its correlators and requires a separate amplitude task.

## Validation gates

1. Zero-field regression against current classical, relativistic, and T18 tests.
2. Manufactured-source or analytic-drive checks for the classical and linearized solvers.
3. Work/energy/boundary-flux balance under forcing.
4. Boundary reflection and anti-periodic sign checks where applicable.
5. T18 constraint, closure, and target-space force diagnostics.
6. T19 unitary free evolution, normalization, level matching, and cutoff checks.

## Non-claims

External fields do not by themselves add string-string interactions, string splitting/joining, quantum gravity, or a general worldsheet path-integral calculation.
