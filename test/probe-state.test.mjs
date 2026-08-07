import assert from 'node:assert/strict';
import test from 'node:test';
import { ProbeTrajectoryState } from '../.test-dist/visualization/probe-state.js';

test('probe selection clears stale samples and records the new coordinate', () => {
  const probe = new ProbeTrajectoryState(3, 0.3, 3);
  probe.record(0, 0.2);
  probe.select(8, 0.8);
  probe.record(0.1, -0.1);

  assert.equal(probe.sigmaIndex, 8);
  assert.equal(probe.sigma, 0.8);
  assert.deepEqual(probe.snapshot(), [{ tau: 0.1, y: -0.1 }]);
});

test('probe history retains a bounded rolling time series', () => {
  const probe = new ProbeTrajectoryState(0, 0, 3);
  for (let step = 0; step < 5; step++) probe.record(step / 10, step);

  assert.deepEqual(probe.snapshot(), [
    { tau: 0.2, y: 2 },
    { tau: 0.3, y: 3 },
    { tau: 0.4, y: 4 },
  ]);
});
