import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { glossaryEntries } from '../.test-dist/content/glossary.js';

test('every simulator glossary help link resolves to a shared entry', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const targetIds = [...html.matchAll(/href="\.\/glossary\/#([a-z0-9-]+)"/g)].map(match => match[1]);
  const entryIds = new Set(glossaryEntries.map(entry => entry.id));

  assert.ok(targetIds.length >= 10, 'expected broad contextual-help coverage');
  for (const targetId of targetIds) assert.ok(entryIds.has(targetId), `missing glossary entry for ${targetId}`);
});

test('new mathematical glossary entries retain inline LaTex delimiters', () => {
  for (const id of ['classical-model', 'relativistic-model', 'initial-conditions', 'numerical-grid', 'time-step', 'history-window']) {
    const entry = glossaryEntries.find(candidate => candidate.id === id);
    assert.ok(entry, `missing ${id}`);
    assert.match(`${entry.symbol ?? ''} ${entry.formula ?? ''} ${entry.meaning}`, /\\\(/, `${id} lacks LaTex notation`);
  }
});
