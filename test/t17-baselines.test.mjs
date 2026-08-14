import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getT17BaselineDefinitions,
  runT17Baseline,
  T17_BASELINE_TOLERANCES,
} from '../.test-dist/physics/t17-baselines.js';

test('T17 includes fixed, free, periodic, and mixed velocity-bearing reference cases', () => {
  const definitions = getT17BaselineDefinitions();
  assert.deepEqual(definitions.map(definition => definition.boundary), ['fixed', 'free', 'periodic', 'mixed']);
  assert.ok(definitions.find(definition => definition.velocity), 'expected a velocity-bearing baseline');
});

for (const id of ['fixed-fundamental', 'free-fundamental', 'periodic-mode', 'mixed-velocity-bearing']) {
  test(`T17 ${id} remains bounded and energy-stable`, () => {
    const report = runT17Baseline(id);
    assert.ok(Math.abs(report.relativeEnergyDrift) < T17_BASELINE_TOLERANCES.relativeEnergyDrift,
      `${id} drifted by ${report.relativeEnergyDrift}`);
    assert.ok(report.maxAbsDisplacement < T17_BASELINE_TOLERANCES.maxAbsDisplacement,
      `${id} reached displacement ${report.maxAbsDisplacement}`);
    assert.ok(report.maxTransverseSpeed <= T17_BASELINE_TOLERANCES.maxTransverseSpeed,
      `${id} reached speed ${report.maxTransverseSpeed}`);
    assert.equal(report.courantNumber, 0.5);
    if (report.boundary === 'periodic') {
      assert.ok(report.endpointClosureError <= T17_BASELINE_TOLERANCES.periodicClosure);
    }
  });
}
