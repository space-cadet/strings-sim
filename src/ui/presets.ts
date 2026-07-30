/**
 * Initial condition presets for the string simulator
 */

import { InitialCondition } from '../physics/core';

export interface Preset {
  label: string;
  displacement: InitialCondition;
  /** Initial transverse velocity in simulation units. */
  velocity?: InitialCondition;
}

const gaussian = (x: number, center: number, width: number): number =>
  Math.exp(-0.5 * ((x - center) / width) ** 2);

const triangularPluck = (position: number): InitialCondition => (x, L) => {
  const amplitude = 0.3;
  const peak = position * L;
  return x <= peak ? amplitude * x / peak : amplitude * (L - x) / (L - peak);
};

/**
 * Curated starting states.  The velocity-bearing packets demonstrate genuine
 * propagation, while the normal-mode choices make resonance and nodes clear.
 */
export const presets: Record<string, Preset> = {
  pluck: {
    label: 'Off-centre pluck',
    displacement: triangularPluck(1 / 3),
  },
  sine: {
    label: 'Fundamental standing wave',
    displacement: (x, L) => 0.3 * Math.sin(Math.PI * x / L),
  },
  thirdHarmonic: {
    label: 'Third normal mode',
    displacement: (x, L) => 0.24 * Math.sin(3 * Math.PI * x / L),
  },
  twoMode: {
    label: 'Two-mode standing wave',
    displacement: (x, L) => 0.2 * Math.sin(Math.PI * x / L) + 0.12 * Math.sin(2 * Math.PI * x / L),
  },
  gaussian: {
    label: 'Centred Gaussian pulse',
    displacement: (x, L) => 0.3 * gaussian(x, L / 2, L / 16),
  },
  travelingPulse: {
    label: 'Right-moving Gaussian packet',
    displacement: (x, L) => 0.12 * gaussian(x, L * 0.28, L / 18),
    // For y(x, t) = f(x - ct), y_t = -c f'(x); c is set from the active mode.
    velocity: (x, L) => 0.12 * ((x - L * 0.28) / (L / 18) ** 2) * gaussian(x, L * 0.28, L / 18),
  },
  doublePulse: {
    label: 'Two pulses in collision',
    displacement: (x, L) => 0.1 * (gaussian(x, L * 0.3, L / 22) - gaussian(x, L * 0.7, L / 22)),
    velocity: (x, L) => 0.1 * (
      ((x - L * 0.3) / (L / 22) ** 2) * gaussian(x, L * 0.3, L / 22) +
      ((x - L * 0.7) / (L / 22) ** 2) * gaussian(x, L * 0.7, L / 22)
    ),
  },
  random: {
    label: 'Deterministic five-mode mixture',
    displacement: (x, L) => {
      let result = 0;
      const seed = 42;
      for (let n = 1; n <= 5; n++) {
        const coefficient = ((seed * n * 9301 + 49297) % 233280) / 233280 - 0.5;
        result += coefficient * Math.sin(n * Math.PI * x / L);
      }
      return 0.2 * result;
    },
  },
};

/** Get list of preset names */
export function getPresetNames(): string[] {
  return Object.keys(presets);
}
