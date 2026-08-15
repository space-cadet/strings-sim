import assert from 'node:assert/strict';
import test from 'node:test';
import {
  T19_EXAMPLES,
  T19_MAX_OCCUPATION,
  T19_MODE_COUNT,
  formatOccupations,
  evolveT19FreeState,
  freeHamiltonianFrequency,
  getT19State,
  getT19Superposition,
  normalizeT19Superposition,
  levelNumber,
  summarizeT19State,
} from '../.test-dist/content/free-string.js';

test('T19 declares a finite four-mode occupation representation', () => {
  assert.equal(T19_MODE_COUNT, 4);
  assert.equal(T19_MAX_OCCUPATION, 2);
  assert.deepEqual(T19_EXAMPLES.massless.left, [1, 0, 0, 0]);
  assert.equal(formatOccupations(T19_EXAMPLES.higher.left), 'n1=1, n2=1, n3=0, n4=0');
});

test('T19 computes level numbers and accepts matched states in scope', () => {
  assert.equal(levelNumber([1, 1, 0, 0]), 3);
  const summary = summarizeT19State(getT19State('higher'));
  assert.equal(summary.leftLevel, 3);
  assert.equal(summary.rightLevel, 3);
  assert.equal(summary.levelMatched, true);
  assert.equal(summary.physicalInScope, true);
  assert.equal(summary.massSquared, 16);
});

test('T19 flags unequal levels and omits a mass value for invalid examples', () => {
  const summary = summarizeT19State(getT19State('invalid'));
  assert.equal(summary.leftLevel, 1);
  assert.equal(summary.rightLevel, 2);
  assert.equal(summary.levelMatched, false);
  assert.equal(summary.physicalInScope, false);
  assert.equal(summary.massSquared, null);
});

test('T19 free evolution uses declared oscillator frequencies and preserves norm', () => {
  const superposition = getT19Superposition('matchedPair');
  const normalized = normalizeT19Superposition(superposition);
  const evolved = evolveT19FreeState(superposition, 0.73);

  assert.equal(freeHamiltonianFrequency(getT19State('massless')), 2);
  assert.equal(freeHamiltonianFrequency(getT19State('higher')), 6);
  assert.ok(Math.abs(evolved.norm - 1) < 1e-12, `norm ${evolved.norm}`);
  assert.equal(evolved.levelMatched, true);
  assert.ok(evolved.terms.every(term => term.probability >= 0));
  assert.ok(evolved.terms.every(term => Number.isFinite(term.phase)));
  assert.deepEqual(normalized.components.map(component => component.stateId), ['massless', 'higher']);
  for (const [index, term] of evolved.terms.entries()) {
    const initial = normalized.components[index].amplitude;
    const initialProbability = initial.re ** 2 + initial.im ** 2;
    assert.ok(Math.abs(term.probability - initialProbability) < 1e-12);
  }
});

test('T19 rejects invalid or zero-norm free-state superpositions', () => {
  assert.throws(() => evolveT19FreeState({
    id: 'invalid',
    label: 'invalid',
    description: 'invalid',
    components: [{ stateId: 'invalid', amplitude: { re: 1, im: 0 } }],
  }, 0), /level-matched/);
  assert.throws(() => normalizeT19Superposition({
    id: 'zero',
    label: 'zero',
    description: 'zero',
    components: [{ stateId: 'massless', amplitude: { re: 0, im: 0 } }],
  }), /non-zero norm/);
});
