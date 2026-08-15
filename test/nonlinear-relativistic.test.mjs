import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NonlinearRelativisticStringSolver,
  createAntiPeriodicT18InitialData,
  createOpenT18InitialData,
  createConformalLoopInitialData,
  createT18PresetInitialData,
  getT18BoundaryContract,
  getT18PresetDefinition,
  getT18PresetNames,
  measureT18GeometricModeMixing,
  measureT18PresetDiagnostics,
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

test('T18 rejects invalid periodic grids and exposes an explicit boundary contract', () => {
  assert.throws(() => makeSolver(63), /even grid/);
  assert.throws(() => new NonlinearRelativisticStringSolver({
    N: 63,
    dt: 0,
    dx: 2 / 63,
    mode: 'nonlinear',
    boundary: 'periodic',
    params: { L: 2, tau: 1, mu: 1, gamma: 0 },
  }), /even grid/);
  assert.deepEqual(getT18BoundaryContract('mixed'), {
    boundary: 'mixed',
    topology: 'open',
    leftEndpoint: 'fixed',
    rightEndpoint: 'free',
    fieldIdentification: 'reflected',
  });
  assert.equal(createConformalLoopInitialData(64).left.x.length, 64);
});

for (const boundary of ['fixed', 'free', 'mixed']) {
  test(`T18 ${boundary} endpoints reflect characteristics and preserve constraints`, () => {
    const solver = new NonlinearRelativisticStringSolver({
      N: 64,
      dt: 0,
      dx: 2 / 63,
      mode: 'nonlinear',
      boundary,
      params: { L: 2, tau: 1, mu: 1, gamma: 0 },
    }, 0.5);
    solver.initialize(createOpenT18InitialData(64, boundary));
    assert.ok(solver.getConstraintReport().residual < 1e-12);
    solver.stepN(160);
    const report = solver.getConstraintReport();
    assert.equal(solver.getBoundary(), boundary);
    assert.ok(report.leftEndpointResidual < 1e-12, `left endpoint residual ${report.leftEndpointResidual}`);
    assert.ok(report.rightEndpointResidual < 1e-12, `right endpoint residual ${report.rightEndpointResidual}`);
    assert.ok(report.maxBoundaryEnergyFlux < 1e-12, `boundary flux ${report.maxBoundaryEnergyFlux}`);
    assert.ok(report.maxOrthogonalityResidual < 1e-12);
    assert.ok(report.maxNormalizationResidual < 1e-12);
  });
}

for (const boundary of ['fixed', 'free', 'mixed']) {
  test(`T18 ${boundary} applies distinct preset shapes within the endpoint contract`, () => {
    const names = getT18PresetNames();
    const signatures = names.map((name) => {
      const solver = new NonlinearRelativisticStringSolver({
        N: 64,
        dt: 0,
        dx: 2 / 63,
        mode: 'nonlinear',
        boundary,
        params: { L: 2, tau: 1, mu: 1, gamma: 0 },
      }, 0.5);
      solver.initialize(createOpenT18InitialData(64, boundary, getT18PresetDefinition(name).options));
      const state = solver.getState();
      assert.ok(state.constraints.residual < 1e-12, `${name} residual ${state.constraints.residual}`);
      return Array.from(state.embeddingY);
    });
    const distinct = signatures.slice(1).filter((signature) => signature.some((value, index) => Math.abs(value - signatures[0][index]) > 1e-3));
    assert.ok(distinct.length >= names.length - 2, `only ${distinct.length} ${boundary} presets differ from the first`);
  });
}

test('T18 anti-periodic presets shape distinct doubled-domain cells', () => {
  const names = getT18PresetNames();
  const signatures = names.map((name) => {
    const solver = new NonlinearRelativisticStringSolver({
      N: 64,
      dt: 0,
      dx: 2 / 64,
      mode: 'nonlinear',
      boundary: 'anti-periodic',
      params: { L: 2, tau: 1, mu: 1, gamma: 0 },
    }, 0.5);
    solver.initialize(createAntiPeriodicT18InitialData(64, getT18PresetDefinition(name).options));
    assert.ok(solver.getConstraintReport().residual < 1e-12, `${name} anti-periodic residual`);
    return Array.from(solver.getEmbedding().y);
  });
  const distinct = signatures.slice(1).filter((signature) => signature.some((value, index) => Math.abs(value - signatures[0][index]) > 1e-3));
  assert.ok(distinct.length >= names.length - 2, `only ${distinct.length} anti-periodic presets differ from the first`);
});

test('T18 permits odd open grids while keeping the periodic grid contract even', () => {
  const solver = new NonlinearRelativisticStringSolver({
    N: 63,
    dt: 0,
    dx: 2 / 62,
    mode: 'nonlinear',
    boundary: 'fixed',
    params: { L: 2, tau: 1, mu: 1, gamma: 0 },
  }, 0.5);
  assert.equal(solver.getSpatialCoords()[62], 2);
  assert.ok(solver.getConstraintReport().residual < 1e-12);
});

test('T18 doubled-domain anti-periodic cells close after two reference lengths', () => {
  const solver = new NonlinearRelativisticStringSolver({
    N: 64,
    dt: 0,
    dx: 2 / 64,
    mode: 'nonlinear',
    boundary: 'anti-periodic',
    params: { L: 2, tau: 1, mu: 1, gamma: 0 },
  }, 0.5);
  solver.initialize(createAntiPeriodicT18InitialData(64));
  assert.equal(solver.getEmbedding().x.length, 128);
  solver.stepN(160);
  const report = solver.getConstraintReport();
  assert.ok(report.closureError < 1e-12, `doubled-domain closure ${report.closureError}`);
  assert.ok(report.maxBoundaryEnergyFlux === 0);
  assert.ok(report.residual < 1e-12, `anti-periodic residual ${report.residual}`);
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

test('T18 preset audit finds distinct tangent, geometry, and velocity signatures', () => {
  const diagnostics = measureT18PresetDiagnostics(128);
  assert.equal(diagnostics.length, 8);
  assert.ok(diagnostics.every(item => item.constraintResidual < 1e-12));

  const feature = (item) => [
    ...item.leftHarmonics.map(harmonic => harmonic.amplitude),
    ...item.rightHarmonics.map(harmonic => harmonic.amplitude),
    item.projectedArea,
    item.radiusRms,
    item.boundingWidth,
    item.boundingHeight,
    item.velocityRms,
    item.maxSpeed,
  ];
  let minimumDistance = Infinity;
  for (let i = 0; i < diagnostics.length; i++) {
    for (let j = i + 1; j < diagnostics.length; j++) {
      const a = feature(diagnostics[i]);
      const b = feature(diagnostics[j]);
      const distance = Math.hypot(...a.map((value, index) => value - b[index]));
      minimumDistance = Math.min(minimumDistance, distance);
    }
  }
  assert.ok(minimumDistance > 0.2, `minimum preset feature distance ${minimumDistance}`);

  const sine = diagnostics.find(item => item.name === 'sine');
  const travelling = diagnostics.find(item => item.name === 'travelingPulse');
  assert.ok(sine && sine.velocityRms < 1e-12, 'standing loop should have zero initial velocity');
  assert.ok(travelling && travelling.maxSpeed > 0.8, 'travelling loop should carry a substantial initial velocity');
});

test('T18 geometric observable records bounded mode mixing without claiming interaction', () => {
  const report = measureT18GeometricModeMixing('twoMode', 128, 32);
  assert.equal(report.sampleSteps, 32);
  assert.ok(report.initialRadialHarmonics.length === 8);
  assert.ok(Math.abs(report.evolvedProjectedArea - report.initialProjectedArea) > 1e-4);
  assert.ok(Math.abs(report.evolvedHigherHarmonicFraction - report.initialHigherHarmonicFraction) > 1e-4);
});
