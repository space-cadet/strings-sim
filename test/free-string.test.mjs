import assert from 'node:assert/strict';
import test from 'node:test';
import {
  T19_EXAMPLES,
  T19_MAX_OCCUPATION,
  T19_MODE_COUNT,
  formatOccupations,
  getT19State,
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
