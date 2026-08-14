import assert from 'node:assert/strict';
import test from 'node:test';
import { analyseProbeSpectrum } from '../.test-dist/visualization/frequency-spectrum.js';

test('probe spectrum identifies the dominant nonzero sinusoidal frequency', () => {
  const frequency = 1.25;
  const samples = Array.from({ length: 64 }, (_, index) => ({
    tau: index * 0.1,
    y: 0.2 + Math.sin(2 * Math.PI * frequency * index * 0.1),
  }));

  const spectrum = analyseProbeSpectrum(samples);
  assert.ok(spectrum);
  assert.equal(spectrum.sampleCount, 64);
  assert.ok(Math.abs(spectrum.dominantFrequency - frequency) < 0.2, `expected peak near ${frequency}, got ${spectrum.dominantFrequency}`);
});

test('probe spectrum waits for a useful analysis window', () => {
  assert.equal(analyseProbeSpectrum([{ tau: 0, y: 0 }]), null);
});
