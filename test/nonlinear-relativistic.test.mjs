import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NonlinearRelativisticStringSolver,
  createConformalLoopInitialData,
  createT18PresetInitialData,
  getT18PresetNames,
} from '../.test-dist/physics/nonlinear-relativistic.js';
import { evolveT17PeriodicReference } from '../.test-dist/physics/t17-baselines.js';

function makeSolver(N, options = {}) {
  return new NonlinearRelativisticStringSolver({
    N,
    dt: 0,
    dx: 2 / N,
    mode: 'nonlinear',
    boundary: 'periodic',
    params: { L: 2, tau: 1, mu: 1, gamma: 0 },
  }, 0.5);
}

test('T18 accepts a closed conformal initial state and preserves its constraints', () => {
  const solver = makeSolver(64);
  const initial = solver.getConstraintReport();
  solver.stepN(160);
  const report = solver.getConstraintReport();

  assert.ok(initial.maxOrthogonalityResidual < 1e-14);
  assert.ok(initial.maxNormalizationResidual < 1e-14);
  assert.ok(initial.closureError < 1e-12);
  assert.ok(report.residual < 1e-12, `constraint residual ${report.residual}`);
  assert.ok(solver.getMetrics().totalEnergy > 0);
});

test('T18 conserves the conformal-gauge energy under characteristic transport', () => {
  const solver = makeSolver(96);
  const initialEnergy = solver.getMetrics().totalEnergy;
  solver.stepN(192);
  const finalEnergy = solver.getMetrics().totalEnergy;
  assert.ok(Math.abs((finalEnergy - initialEnergy) / initialEnergy) < 1e-12);
});

test('T18 grid refinement converges for the same physical time', () => {
  const coarse = makeSolver(64);
  const fine = makeSolver(128);
  const targetTime = 0.5;
  coarse.stepN(Math.round(targetTime / coarse.getTimeStep()));
  fine.stepN(Math.round(targetTime / fine.getTimeStep()));
  const coarseEmbedding = coarse.getEmbedding();
  const fineEmbedding = fine.getEmbedding();
  let maxDifference = 0;
  for (let i = 0; i < 64; i++) {
    maxDifference = Math.max(maxDifference, Math.abs(coarseEmbedding.y[i] - fineEmbedding.y[i * 2]));
  }
  assert.ok(maxDifference < 0.01, `refinement difference ${maxDifference}`);
});

test('T18 transverse small-amplitude limit tracks the T17 periodic reference', () => {
  const solver = makeSolver(128);
  solver.initialize(createConformalLoopInitialData(128, { leftAmplitude: 0.01, rightAmplitude: 0.008 }));
  const initial = solver.getState();
  const steps = 64;
  const reference = evolveT17PeriodicReference(initial.y, initial.v, 2, steps, 0.5);
  solver.stepN(steps);
  const evolved = solver.getState().y;
  let maxDifference = 0;
  for (let i = 0; i < evolved.length; i++) maxDifference = Math.max(maxDifference, Math.abs(evolved[i] - reference[i]));
  assert.ok(maxDifference < 0.01, `small-amplitude comparison difference ${maxDifference}`);
});

test('T18 rejects invalid odd grids and non-periodic boundaries', () => {
  assert.throws(() => makeSolver(63), /even grid/);
  assert.throws(() => new NonlinearRelativisticStringSolver({
    N: 64,
    dt: 0,
    dx: 2 / 64,
    mode: 'nonlinear',
    boundary: 'fixed',
    params: { L: 2, tau: 1, mu: 1, gamma: 0 },
  }), /closed periodic/);
  assert.equal(createConformalLoopInitialData(64).left.x.length, 64);
});

test('T18 presets are varied closed conformal initial states', () => {
  const names = getT18PresetNames();
  assert.deepEqual(names, ['pluck', 'sine', 'thirdHarmonic', 'twoMode', 'gaussian', 'travelingPulse', 'doublePulse', 'random']);

  const reference = makeSolver(64);
  reference.initialize(createT18PresetInitialData(64, names[0]));
  const referenceEmbedding = reference.getEmbedding();
  let distinctFromReference = 0;

  for (const name of names) {
    const solver = makeSolver(64);
    solver.initialize(createT18PresetInitialData(64, name));
    const report = solver.getConstraintReport();
    assert.ok(report.residual < 1e-12, `${name} residual ${report.residual}`);
    assert.ok(Math.abs(solver.getMetrics().totalEnergy) > 1e-12, `${name} has no energy`);

    const embedding = solver.getEmbedding();
    let difference = 0;
    for (let i = 0; i < embedding.y.length; i++) {
      difference = Math.max(difference, Math.abs(embedding.y[i] - referenceEmbedding.y[i]));
    }
    if (difference > 1e-3) distinctFromReference++;
  }

  assert.ok(distinctFromReference >= names.length - 2, `only ${distinctFromReference} presets differ from the reference shape`);
});
