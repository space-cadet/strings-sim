/**
 * Initial condition presets for the string simulator
 */

import { InitialCondition } from '../physics/core';

export const presets: Record<string, InitialCondition> = {
  /** Pluck the string at center */
  pluck: (x: number, L: number) => {
    const center = L / 2;
    const width = L / 8;
    const amplitude = 0.3;
    
    if (x < center - width || x > center + width) return 0;
    
    if (x < center) {
      return amplitude * (x - (center - width)) / width;
    } else {
      return amplitude * (center + width - x) / width;
    }
  },

  /** Sine wave (fundamental mode) */
  sine: (x: number, L: number) => {
    const amplitude = 0.3;
    return amplitude * Math.sin((Math.PI * x) / L);
  },

  /** Gaussian pulse */
  gaussian: (x: number, L: number) => {
    const center = L / 2;
    const width = L / 16;
    const amplitude = 0.3;
    return amplitude * Math.exp(-0.5 * ((x - center) / width) ** 2);
  },

  /** Random mode superposition */
  random: (x: number, L: number) => {
    const amplitude = 0.2;
    let result = 0;
    // Sum of first 5 modes with random amplitudes
    const seed = 42; // Fixed seed for reproducibility
    for (let n = 1; n <= 5; n++) {
      const an = ((seed * n * 9301 + 49297) % 233280) / 233280 - 0.5;
      result += an * Math.sin((n * Math.PI * x) / L);
    }
    return amplitude * result;
  },
};

/** Get list of preset names */
export function getPresetNames(): string[] {
  return Object.keys(presets);
}
